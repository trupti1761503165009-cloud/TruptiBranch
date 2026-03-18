import * as React from 'react';
import * as CamlBuilder from 'camljs';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { ListNames } from '../../../../../../Shared/Enum/ListNames';

export interface UploadTemplateModalFormData {
  name: string;
  version: string;
  categoryId: number;
  countryId: number;
  status: 'Active' | 'Inactive';
  mappingType: 'eCTD' | 'GMP' | 'TMF' | 'None';
  mappedCTDFolderId: number;
  ectdSectionId: number;
  ectdSubsection: string;
  mappedGMPModelId: number;
  mappedTMFFolderId: number;
}

export interface UploadTemplateModalDataParams {
  onClose: () => void;
  onSuccess: () => void;
  editMode?: boolean;
  editItemId?: number;
  editFileRef?: string;
}

export function UploadTemplateModalData(params: UploadTemplateModalDataParams) {
  const { onClose, onSuccess, editMode = false, editItemId, editFileRef } = params;
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider, context } = appGlobalState;

  const [fieldErrors, setFieldErrors] = React.useState<{
    name?: string;
    version?: string;
    categoryId?: string;
    countryId?: string;
    mappingType?: string;
    mappedCTDFolderId?: string;
    ectdSectionId?: string;
    file?: string;
  }>({});
  const [formData, setFormData] = React.useState<UploadTemplateModalFormData>({
    name: '',
    version: '',
    categoryId: 0,
    countryId: 0,
    status: 'Active',
    mappingType: 'None',
    mappedCTDFolderId: 0,
    ectdSectionId: 0,
    ectdSubsection: '',
    mappedGMPModelId: 0,
    mappedTMFFolderId: 0
  });
  const [categories, setCategories] = React.useState<{ id: number; name: string }[]>([]);
  const [countries, setCountries] = React.useState<{ id: number; name: string }[]>([]);
  const [ctdFolders, setCtdFolders] = React.useState<{ id: number; name: string }[]>([]);
  const [ectdSections, setEctdSections] = React.useState<{ id: number; name: string }[]>([]);
  const [gmpModels, setGmpModels] = React.useState<{ id: number; name: string }[]>([]);
  const [tmfFolders, setTmfFolders] = React.useState<{ id: number; name: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      version: '',
      categoryId: 0,
      countryId: 0,
      status: 'Active',
      mappingType: 'None',
      mappedCTDFolderId: 0,
      ectdSectionId: 0,
      ectdSubsection: '',
      mappedGMPModelId: 0,
      mappedTMFFolderId: 0
    });
    setSelectedFiles([]);
    setErrorMessage('');
    setFieldErrors({});
  };

  const loadCategories = React.useCallback(async () => {
    if (!provider) return;
    const camlQuery = new CamlBuilder()
      .View(['ID', 'Title', 'Status'])
      .RowLimit(5000, true)
      .Query();
    camlQuery.OrderBy('Title');
    const items = await provider.getItemsByCAMLQuery(ListNames.Categories, camlQuery.ToString());
    setCategories(
      (items || [])
        .filter((item: any) => (item.Status || 'Active') === 'Active')
        .map((item: any) => ({
          id: Number(item.ID),
          name: item.Title
        }))
    );
  }, [provider]);

  const loadCountries = React.useCallback(async () => {
    if (!provider) return;
    const camlQuery = new CamlBuilder().View(['ID', 'Title']).RowLimit(5000, true).Query();
    camlQuery.OrderBy('Title');
    const items = await provider.getItemsByCAMLQuery(ListNames.Countries, camlQuery.ToString());
    setCountries(
      (items || []).map((item: any) => ({
        id: Number(item.ID),
        name: item.Title
      }))
    );
  }, [provider]);

  const loadCTDFolders = React.useCallback(async () => {
    if (!provider) return;
    const camlQuery = new CamlBuilder().View(['ID', 'Title', 'FolderId']).RowLimit(5000, true).Query();
    camlQuery.OrderBy('FolderId');
    const items = await provider.getItemsByCAMLQuery(ListNames.CTDFolders, camlQuery.ToString());
    setCtdFolders(
      (items || []).map((item: any) => ({
        id: Number(item.ID),
        name: item.FolderId ? `${item.FolderId} - ${item.Title}` : item.Title
      }))
    );
  }, [provider]);

  const loadGmpModels = React.useCallback(async () => {
    if (!provider) return;
    const camlQuery = new CamlBuilder().View(['ID', 'Title']).RowLimit(5000, true).Query();
    camlQuery.OrderBy('Title');
    const items = await provider.getItemsByCAMLQuery(ListNames.GmpModels, camlQuery.ToString());
    setGmpModels((items || []).map((item: any) => ({ id: Number(item.ID), name: item.Title })));
  }, [provider]);

  const loadTmfFolders = React.useCallback(async () => {
    if (!provider) return;
    try {
      const camlQuery = new CamlBuilder().View(['ID', 'Title', 'FolderId']).RowLimit(5000, true).Query();
      camlQuery.OrderBy('SortOrder');
      const items = await provider.getItemsByCAMLQuery(ListNames.TMFFolders, camlQuery.ToString());
      setTmfFolders((items || []).map((item: any) => ({ id: Number(item.ID), name: item.FolderId ? `${item.FolderId} - ${item.Title}` : item.Title })));
    } catch (error) {
      console.warn(`List "${ListNames.TMFFolders}" not found or inaccessible:`, error);
      setTmfFolders([]);
    }
  }, [provider]);

  const loadEctdSections = React.useCallback(async () => {
    if (!provider) return;
    const camlQuery = new CamlBuilder().View(['ID', 'Title', 'SectionCode']).RowLimit(5000, true).Query();
    camlQuery.OrderBy('SectionCode');
    const items = await provider.getItemsByCAMLQuery(ListNames.EctdSections, camlQuery.ToString());
    setEctdSections(
      (items || []).map((item: any) => ({
        id: Number(item.ID),
        name: item.SectionCode ? `${item.SectionCode} - ${item.Title}` : item.Title
      }))
    );
  }, [provider]);

  React.useEffect(() => {
    void loadCategories();
    void loadCountries();
    void loadCTDFolders();
    void loadEctdSections();
    void loadGmpModels();
    void loadTmfFolders();
  }, [loadCategories, loadCountries, loadCTDFolders, loadEctdSections, loadGmpModels, loadTmfFolders]);

  const handleFileSelection = (items: any[]) => {
    const normalized = Array.isArray(items) ? items : Array.from(items || []);
    const files = normalized
      .map(item => item?.file ?? item)
      .filter((file: any) => file && typeof file.name === 'string') as File[];
    setSelectedFiles(files);
    setFieldErrors(prev => ({ ...prev, file: undefined }));
  };

  const closeAndReset = () => {
    onClose();
    resetForm();
  };

  const sharedMetadata = () => ({
    TemplateVersion: formData.version.trim(),
    ...(formData.categoryId ? { CategoryId: formData.categoryId } : {}),
    ...(formData.countryId ? { CountryId: formData.countryId } : {}),
    UploadDate: new Date().toISOString(),
    Status: formData.status,
    MappingType: formData.mappingType,
    ...(formData.mappingType === 'eCTD' && formData.mappedCTDFolderId ? { MappedCTDFolderId: formData.mappedCTDFolderId } : {}),
    ...(formData.mappingType === 'eCTD' && formData.ectdSectionId ? { eCTDSectionId: formData.ectdSectionId } : {}),
    ...(formData.mappingType === 'eCTD' && formData.ectdSubsection.trim()
      ? { eCTDSubsection: formData.ectdSubsection.trim() }
      : {}),
    ...(formData.mappingType === 'GMP' && formData.mappedGMPModelId ? { MappedGMPModelId: formData.mappedGMPModelId } : {}),
    ...(formData.mappingType === 'TMF' && formData.mappedTMFFolderId ? { MappedTMFFolderId: formData.mappedTMFFolderId } : {}),
    IsEctdMapped: formData.mappingType === 'eCTD' ? '1' : '0',
    IsDelete: '0'
  });

  const handleUpload = async () => {
    if (!provider || !context) return;

    const nextErrors: {
      name?: string;
      version?: string;
      categoryId?: string;
      countryId?: string;
      mappingType?: string;
      mappedCTDFolderId?: string;
      ectdSectionId?: string;
      file?: string;
    } = {};

    if (!editMode && !formData.name.trim()) nextErrors.name = 'Template Name is required.';
    if (!formData.version.trim()) nextErrors.version = 'Version No. is required.';
    if (!editMode && selectedFiles.length === 0) nextErrors.file = 'Upload File is required.';

    if (!editMode) {
      if (categories.length > 0 && !formData.categoryId) nextErrors.categoryId = 'Category is required.';
      if (countries.length > 0 && !formData.countryId) nextErrors.countryId = 'Country is required.';
    }

    if (formData.mappingType === 'eCTD') {
      if (!formData.mappedCTDFolderId) nextErrors.mappedCTDFolderId = 'Mapped CTD Folder is required for eCTD mapping.';
      if (!formData.ectdSectionId) nextErrors.ectdSectionId = 'eCTD Section is required for eCTD mapping.';
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setErrorMessage(Object.values(nextErrors).join(' '));
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      if (editMode && editItemId) {
        if (selectedFiles.length > 0) {
          const file = selectedFiles[0];
          const folderUrl = `${context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/${ListNames.Templates}`;
          const sanitizeFileBase = (value: string) =>
            String(value || 'Template')
              .trim()
              .replace(/[\\/:*?"<>|#%&{}~]+/g, '_')
              .replace(/\s+/g, '_')
              .replace(/_+/g, '_')
              .replace(/^_+|_+$/g, '')
              .slice(0, 120) || 'Template';
          const extMatch = file.name.match(/\.[0-9a-z]+$/i);
          const ext = extMatch ? extMatch[0] : '';
          const existingBase = editFileRef
            ? editFileRef.split('/').pop()?.replace(/\.[^.]+$/, '') || sanitizeFileBase(formData.name)
            : sanitizeFileBase(formData.name);
          const uploadName = `${existingBase}${ext}`;
          await provider.uploadFile(
            { name: uploadName, file, folderServerRelativeURL: folderUrl },
            true,
            sharedMetadata()
          );
        } else {
          await provider.updateItem(sharedMetadata(), ListNames.Templates, editItemId);
        }
        onSuccess();
        closeAndReset();
        return;
      }

      const dupeQuery = new CamlBuilder()
        .View(['ID', 'LinkFilename', 'TemplateVersion'])
        .Query()
        .Where()
        .TextField('LinkFilename').EqualTo(formData.name.trim())
        .And()
        .TextField('TemplateVersion').EqualTo(formData.version.trim())
        .ToString();

      const existingItems = await provider.getItemsByCAMLQuery(ListNames.Templates, dupeQuery);
      if (existingItems && existingItems.length > 0) {
        setErrorMessage('Template with this name and version already exists.');
        setIsUploading(false);
        return;
      }

      const file = selectedFiles[0];
      const folderUrl = `${context.pageContext.web.serverRelativeUrl.replace(/\/$/, '')}/${ListNames.Templates}`;

      const sanitizeFileBase = (value: string) =>
        String(value || 'Template')
          .trim()
          .replace(/[\\/:*?"<>|#%&{}~]+/g, '_')
          .replace(/\s+/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_+|_+$/g, '')
          .slice(0, 120) || 'Template';

      const extMatch = file.name.match(/\.[0-9a-z]+$/i);
      const ext = extMatch ? extMatch[0] : '';
      const uploadName = `${sanitizeFileBase(formData.name)}${ext}`;

      await provider.uploadFile(
        { name: uploadName, file, folderServerRelativeURL: folderUrl },
        true,
        sharedMetadata()
      );
      onSuccess();
      closeAndReset();
    } catch (error) {
      console.error('Failed to upload template:', error);
      setErrorMessage('Unable to upload template. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const canUpload = Boolean(
    formData.name.trim() &&
    selectedFiles.length > 0 &&
    !isUploading &&
    (formData.mappingType === 'None' ||
      (formData.mappingType === 'eCTD' && !!formData.mappedCTDFolderId && !!formData.ectdSectionId) ||
      (formData.mappingType === 'GMP' && !!formData.mappedGMPModelId) ||
      (formData.mappingType === 'TMF' && !!formData.mappedTMFFolderId))
  );

  return {
    formData,
    setFormData: (input: UploadTemplateModalFormData | ((prev: UploadTemplateModalFormData) => UploadTemplateModalFormData)) => {
      setFormData((prev) => {
        const newData = typeof input === 'function' ? input(prev) : input;
        
        // Sync field errors based on new data
        setFieldErrors(prevErrors => ({
          ...prevErrors,
          name: newData.name.trim() ? undefined : prevErrors.name,
          version: newData.version.trim() ? undefined : prevErrors.version,
          categoryId: newData.categoryId ? undefined : prevErrors.categoryId,
          countryId: newData.countryId ? undefined : prevErrors.countryId
        }));

        return newData;
      });
    },
    categories,
    countries,
    ctdFolders,
    ectdSections,
    gmpModels,
    tmfFolders,
    selectedFiles,
    errorMessage,
    fieldErrors,
    isUploading,
    canUpload,
    handleFileSelection,
    handleUpload,
    closeAndReset
  };
}

