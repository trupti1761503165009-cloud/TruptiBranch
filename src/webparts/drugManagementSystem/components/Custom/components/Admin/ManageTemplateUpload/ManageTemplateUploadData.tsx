import * as React from 'react';
import * as CamlBuilder from 'camljs';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { ListNames } from '../../../../../../Shared/Enum/ListNames';

export interface ITemplateUploadItem {
  id: number;
  name: string;
  version: string;
  status: 'Active' | 'Inactive';
  uploadDate: string;
  fileRef: string;
  fileName: string;
}

interface IFormData {
  name: string;
  version: string;
  status: 'Active' | 'Inactive';
}

const emptyForm = (): IFormData => ({
  name: '',
  version: '1.0',
  status: 'Active'
});

export function ManageTemplateUploadData() {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider, context } = appGlobalState;

  const [items, setItems] = React.useState<ITemplateUploadItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const [panelMode, setPanelMode] = React.useState<'add' | 'edit' | 'view'>('add');
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ITemplateUploadItem | null>(null);
  const [formData, setFormData] = React.useState<IFormData>(emptyForm());
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<keyof IFormData | 'file', string>>>({});
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [existingFileDeleted, setExistingFileDeleted] = React.useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<ITemplateUploadItem | null>(null);

  const loadItems = React.useCallback(async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const camlQuery = new CamlBuilder()
        .View(['ID', 'LinkFilename', 'FileLeafRef', 'FileRef', 'TemplateVersion', 'Status', 'UploadDate', 'IsDelete'])
        .RowLimit(5000, true)
        .Query();
      camlQuery.OrderByDesc('UploadDate');

      const data = await provider.getItemsByCAMLQuery(ListNames.Templates, camlQuery.ToString());
      const mapped: ITemplateUploadItem[] = (data || [])
        .filter((item: any) => !item.IsDeleted && !item.IsDelete)
        .map((item: any) => ({
          id: item.ID,
          name: item.LinkFilename || item.FileLeafRef || item.Title || 'Template',
          version: item.TemplateVersion || '1.0',
          status: (item.Status as 'Active' | 'Inactive') || 'Active',
          uploadDate: item.UploadDate ? new Date(item.UploadDate).toLocaleDateString('en-GB') : '',
          fileRef: item.FileRef || '',
          fileName: item.FileLeafRef || item.LinkFilename || ''
        }));
      setItems(mapped);
      setErrorMessage('');
    } catch {
      setErrorMessage('Failed to load templates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  React.useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof IFormData | 'file', string>> = {};
    if (panelMode === 'add' && !formData.name.trim()) errors.name = 'Template name is required.';
    if (panelMode === 'add' && selectedFiles.length === 0) errors.file = 'Please select a file to upload.';
    if (panelMode === 'edit' && existingFileDeleted && selectedFiles.length === 0) {
      errors.file = 'Please upload a replacement file.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddPanel = () => {
    setFormData(emptyForm());
    setFieldErrors({});
    setSelectedFiles([]);
    setExistingFileDeleted(false);
    setEditingItem(null);
    setPanelMode('add');
    setIsPanelOpen(true);
  };

  const openEditPanel = (item: ITemplateUploadItem) => {
    setFormData({ name: item.name, version: item.version, status: item.status });
    setFieldErrors({});
    setSelectedFiles([]);
    setExistingFileDeleted(false);
    setEditingItem(item);
    setPanelMode('edit');
    setIsPanelOpen(true);
  };

  const openViewPanel = (item: ITemplateUploadItem) => {
    setFormData({ name: item.name, version: item.version, status: item.status });
    setFieldErrors({});
    setEditingItem(item);
    setPanelMode('view');
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setEditingItem(null);
    setFormData(emptyForm());
    setFieldErrors({});
    setSelectedFiles([]);
    setExistingFileDeleted(false);
  };

  const handleFileSelection = (fileItems: any[]) => {
    const normalized = Array.isArray(fileItems) ? fileItems : Array.from(fileItems || []);
    const files = normalized
      .map(item => item?.file ?? item)
      .filter((f: any) => f && typeof f.name === 'string') as File[];
    setSelectedFiles(files);
    setFieldErrors(prev => ({ ...prev, file: undefined }));
  };

  const sanitizeFileBase = (value: string) =>
    String(value || 'Template')
      .trim()
      .replace(/[\\/:*?"<>|#%&{}~]+/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 120) || 'Template';

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!provider || !context) return;
    setIsLoading(true);
    try {
      const folderUrl = `${context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/${ListNames.Templates}`;
      const metadata = {
        TemplateVersion: formData.version.trim() || '1.0',
        UploadDate: new Date().toISOString(),
        Status: formData.status,
        MappingType: 'None',
        IsDelete: false,
        IsDeleted: false
      };

      if (panelMode === 'add') {
        const file = selectedFiles[0];
        const extMatch = file.name.match(/\.[0-9a-z]+$/i);
        const ext = extMatch ? extMatch[0] : '';
        const uploadName = `${sanitizeFileBase(formData.name)}${ext}`;

        await provider.uploadFile(
          { name: uploadName, file, folderServerRelativeURL: folderUrl },
          true,
          metadata
        );
        setSuccessMessage('Template uploaded successfully.');
      } else if (panelMode === 'edit' && editingItem) {
        if (selectedFiles.length > 0) {
          const file = selectedFiles[0];
          const extMatch = file.name.match(/\.[0-9a-z]+$/i);
          const ext = extMatch ? extMatch[0] : '';
          const existingBase = editingItem.fileRef
            ? editingItem.fileRef.split('/').pop()?.replace(/\.[^.]+$/, '') || sanitizeFileBase(formData.name)
            : sanitizeFileBase(formData.name);
          const uploadName = `${existingBase}${ext}`;
          await provider.uploadFile(
            { name: uploadName, file, folderServerRelativeURL: folderUrl },
            true,
            { TemplateVersion: formData.version.trim() || '1.0', Status: formData.status }
          );
        } else {
          await provider.updateItem(
            { TemplateVersion: formData.version.trim() || '1.0', Status: formData.status },
            ListNames.Templates,
            editingItem.id
          );
        }
        setSuccessMessage('Template updated successfully.');
      }
      await loadItems();
      closePanel();
    } catch {
      setErrorMessage('Failed to save template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (item: ITemplateUploadItem) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !provider) return;
    setIsLoading(true);
    try {
      await provider.updateItem({ IsDelete: true }, ListNames.Templates, itemToDelete.id);
      setSuccessMessage('Template deleted successfully.');
      await loadItems();
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {
      setErrorMessage('Failed to delete template. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    isLoading,
    errorMessage,
    successMessage,
    panelMode,
    isPanelOpen,
    editingItem,
    formData,
    fieldErrors,
    selectedFiles,
    existingFileDeleted,
    isDeleteDialogOpen,
    itemToDelete,
    setFormData,
    setIsDeleteDialogOpen,
    setErrorMessage,
    setSuccessMessage,
    setExistingFileDeleted,
    openAddPanel,
    openEditPanel,
    openViewPanel,
    closePanel,
    handleSave,
    handleFileSelection,
    openDeleteDialog,
    handleDeleteConfirm,
    loadItems
  };
}
