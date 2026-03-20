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
  selectedTemplateId: number;
}

export interface ITemplateOption {
  id: number;
  name: string;
  version: string;
  fileRef: string;
  mappingType?: string;
  mappedCTDFolderId?: number;
  mappedGMPModelId?: number;
  mappedTMFFolderId?: number;
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
    mappedTMFFolderId: 0,
    selectedTemplateId: 0
  });
  const [templateOptions, setTemplateOptions] = React.useState<ITemplateOption[]>([]);
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
      mappedTMFFolderId: 0,
      selectedTemplateId: 0
    });
    setSelectedFiles([]);
    setErrorMessage('');
    setFieldErrors({});
  };

  const loadTemplateOptions = React.useCallback(async () => {
    if (!provider) return;
    try {
      const camlQuery = new CamlBuilder()
        .View([
          'ID', 'LinkFilename', 'FileLeafRef', 'FileRef', 'TemplateVersion', 'Status', 'IsDelete',
          'MappingType', 'MappedCTDFolderId', 'MappedGMPModelId', 'MappedTMFFolderId'
        ])
        .RowLimit(5000, true)
        .Query();
      camlQuery.OrderBy('LinkFilename');
      const data = await provider.getItemsByCAMLQuery(ListNames.Templates, camlQuery.ToString());
      const options: ITemplateOption[] = (data || [])
        .filter((item: any) => item.IsDelete !== 'Yes' && item.IsDelete !== true && item['IsDelete.value'] !== '1' && (item.Status || 'Active') === 'Active')
        .map((item: any) => ({
          id: Number(item.ID),
          name: item.LinkFilename || item.FileLeafRef || item.Title || 'Template',
          version: item.TemplateVersion || '1.0',
          fileRef: item.FileRef || '',
          mappingType: item.MappingType || 'None',
          mappedCTDFolderId: Number(item.MappedCTDFolderId) || 0,
          mappedGMPModelId: Number(item.MappedGMPModelId) || 0,
          mappedTMFFolderId: Number(item.MappedTMFFolderId) || 0
        }));
      setTemplateOptions(options);
    } catch (e) {
      console.warn('Failed to load template options:', e);
      setTemplateOptions([]);
    }
  }, [provider]);

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
    void loadTemplateOptions();
  }, [loadCategories, loadCountries, loadCTDFolders, loadEctdSections, loadGmpModels, loadTmfFolders, loadTemplateOptions]);

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

  const mappingMetadata = () => ({
    ...(formData.categoryId ? { CategoryId: formData.categoryId } : {}),
    ...(formData.countryId ? { CountryId: formData.countryId } : {}),
    Status: formData.status,
    MappingType: formData.mappingType,
    MappedCTDFolderId: formData.mappingType === 'eCTD' ? (formData.mappedCTDFolderId || null) : null,
    eCTDSectionId: formData.mappingType === 'eCTD' ? (formData.ectdSectionId || null) : null,
    eCTDSubsection: formData.mappingType === 'eCTD' ? (formData.ectdSubsection.trim() || '') : '',
    MappedGMPModelId: formData.mappingType === 'GMP' ? (formData.mappedGMPModelId || null) : null,
    MappedTMFFolderId: formData.mappingType === 'TMF' ? (formData.mappedTMFFolderId || null) : null,
    IsEctdMapped: formData.mappingType === 'eCTD'
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
      selectedTemplateId?: string;
    } = {};

    if (!editMode && !formData.selectedTemplateId) nextErrors.selectedTemplateId = 'Please select a template.';

    // Mapping type is mandatory — 'None' is not allowed
    if (!formData.mappingType || formData.mappingType === 'None') {
      nextErrors.mappingType = 'Mapping type is required. Please select eCTD, GMP, or TMF.';
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

    // Duplicate mapping check: same template + same mapping type + same folder = already exists
    if (!editMode && formData.selectedTemplateId) {
      const existing = templateOptions.find(t => t.id === formData.selectedTemplateId);
      if (existing && existing.mappingType && existing.mappingType !== 'None') {
        const sameType = existing.mappingType === formData.mappingType;
        const sameFolder =
          (formData.mappingType === 'eCTD' && existing.mappedCTDFolderId === formData.mappedCTDFolderId) ||
          (formData.mappingType === 'GMP'  && existing.mappedGMPModelId  === formData.mappedGMPModelId) ||
          (formData.mappingType === 'TMF'  && existing.mappedTMFFolderId === formData.mappedTMFFolderId);

        if (sameType && sameFolder) {
          setErrorMessage(
            `This template already has a ${formData.mappingType} mapping with the same folder/model. ` +
            `Use "Edit" to update the existing mapping.`
          );
          return;
        }
      }
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      if (editMode && editItemId) {
        await provider.updateItem(mappingMetadata(), ListNames.Templates, editItemId);
        onSuccess();
        closeAndReset();
        return;
      }

      const targetId = formData.selectedTemplateId;
      await provider.updateItem(mappingMetadata(), ListNames.Templates, targetId);
      onSuccess();
      closeAndReset();
    } catch (error) {
      console.error('Failed to save template mapping:', error);
      setErrorMessage('Unable to save template mapping. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const canUpload = Boolean(
    (formData.selectedTemplateId || (editMode && editItemId)) &&
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
    templateOptions,
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

