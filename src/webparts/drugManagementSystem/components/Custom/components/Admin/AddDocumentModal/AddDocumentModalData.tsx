import * as React from 'react';
import * as CamlBuilder from 'camljs';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { currentUserAtom } from '../../../../../jotai/adminAtoms';
import { ListNames } from '../../../../../../Shared/Enum/ListNames';

const parseLookupId = (value: any): number => {
  if (!value) return 0;
  if (typeof value === 'number') return value;
  const m = String(value).match(/^(\d+)/);
  return m ? Number(m[1]) : 0;
};

export interface AddDocumentModalDataParams {
  onClose: () => void;
  onSuccess: () => void;
}

export interface AddDocumentWizardFormData {
  drugId: number;
  countryId: number;
  categoryId: number;
  templateId: number;
  moduleId: string;
  submoduleId: string;
  approverId: number;
  comments: string[];
}

interface DrugItem {
  id: number;
  name: string;
}

interface CountryItem {
  id: number;
  name: string;
}

interface TemplateItem {
  id: number;
  name: string;
  categoryId?: number;
  categoryName?: string;
  artifactName?: string;
  countryId?: number;
  status?: string;
  mappedFolderId?: string;
  fileRef?: string;
  fileLeafRef?: string;
  mappingType?: 'eCTD' | 'GMP' | 'TMF' | 'None';
  mappedGMPModelId?: number;
  mappedGMPModel?: string;
  mappedTMFFolderId?: number;
  mappedTMFFolder?: string;
}

interface FolderItem {
  id: string;
  name: string;
  parentId?: string;
}

interface ApproverItem {
  id: number;
  name: string;
}

type ValidationErrors = Partial<Record<keyof AddDocumentWizardFormData | string, string>>;

export function AddDocumentModalData(params: AddDocumentModalDataParams) {
  const { onClose, onSuccess } = params;
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const currentUser = useAtomValue(currentUserAtom);
  const { provider, context } = appGlobalState;

  const [step, setStep] = React.useState(1);
  const [formData, setFormData] = React.useState<AddDocumentWizardFormData>({
    drugId: 0,
    countryId: 0,
    categoryId: 0,
    templateId: 0,
    moduleId: '',
    submoduleId: '',
    approverId: 0,
    comments: ['']
  });
  const [errors, setErrors] = React.useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [drugs, setDrugs] = React.useState<DrugItem[]>([]);
  const [countries, setCountries] = React.useState<CountryItem[]>([]);
  const [templates, setTemplates] = React.useState<TemplateItem[]>([]);
  const [modules, setModules] = React.useState<FolderItem[]>([]);          // eCTD CTD folders
  const [gmpModels, setGmpModels] = React.useState<FolderItem[]>([]);      // GMP models flat list
  const [tmfFolders, setTmfFolders] = React.useState<FolderItem[]>([]);    // TMF folders hierarchy
  const [approvers, setApprovers] = React.useState<ApproverItem[]>([]);

  const sanitizeFolderName = React.useCallback(
    (value: string): string => String(value || '').replace(/[\\/:*?"<>|]/g, '-').trim(),
    []
  );

  const ensureFolderPath = React.useCallback(
    async (basePath: string, segments: string[]): Promise<string> => {
      if (!provider) return basePath;
      let currentPath = basePath;
      for (const segment of segments) {
        const cleaned = sanitizeFolderName(segment);
        if (!cleaned) continue;
        currentPath = `${currentPath}/${cleaned}`;
        try { await provider.createFolder(currentPath); } catch { /* folder exists */ }
      }
      return currentPath;
    },
    [provider, sanitizeFolderName]
  );

  const getLibraryUrl = React.useCallback(
    (listName: string) => {
      const base = context?.pageContext?.web?.serverRelativeUrl ?? '';
      return `${base.replace(/\/$/, '')}/${listName}`;
    },
    [context]
  );

  const loadLookupData = React.useCallback(async () => {
    if (!provider) return;

    const [drugItems, countryItems, templateItems, folderItems, gmpItems, tmfItems, approverItems] = await Promise.all([
      // Drugs
      provider.getItemsByQuery({
        listName: ListNames.DrugsDatabase,
        select: ['ID', 'Title'],
        top: 5000,
        orderBy: 'Title',
        isSortOrderAsc: true
      }).catch(() => []),

      // Countries
      provider.getItemsByQuery({
        listName: ListNames.Countries,
        select: ['ID', 'Title'],
        top: 5000,
        orderBy: 'Title',
        isSortOrderAsc: true
      }).catch(() => []),

      // Templates — include MappingType + all mapping fields
      (async () => {
        try {
          const q = new CamlBuilder()
            .View(['ID', 'LinkFilename', 'FileLeafRef', 'FileRef', 'Status',
                   'Category', 'CategoryId', 'Country', 'CountryId',
                   'MappingType', 'MappedCTDFolder', 'MappedCTDFolderId',
                   'MappedGMPModel', 'MappedGMPModelId',
                   'MappedTMFFolder', 'MappedTMFFolderId'])
            .RowLimit(5000, true)
            .Query();
          return await provider.getItemsByCAMLQuery(ListNames.Templates, q.ToString());
        } catch (e) {
          console.error('Templates CAML load failed:', e);
          return [];
        }
      })(),

      // CTD Folders (eCTD path)
      provider.getItemsByQuery({
        listName: ListNames.CTDFolders,
        select: ['ID', 'Title', 'FolderId', 'ParentFolderId'],
        top: 5000,
        orderBy: 'SortOrder',
        isSortOrderAsc: true
      }).catch(() => []),

      // GMP Models (flat list)
      provider.getItemsByQuery({
        listName: ListNames.GmpModels,
        select: ['ID', 'Title', 'Category', 'SortOrder'],
        top: 500,
        orderBy: 'SortOrder',
        isSortOrderAsc: true
      }).catch(() => []),

      // TMF Folders (hierarchy)
      provider.getItemsByQuery({
        listName: ListNames.TMFFolders,
        select: ['ID', 'Title', 'FolderId', 'ParentFolderId', 'ZoneName', 'SectionName', 'IsFolder'],
        top: 2000,
        orderBy: 'SortOrder',
        isSortOrderAsc: true
      }).catch(() => []),

      // Approvers: HR + Admin + Author groups
      Promise.all([
        provider.getUsersFromGroup('HR').catch(() => []),
        provider.getUsersFromGroup('Admin').catch(() => []),
        provider.getUsersFromGroup('Author').catch(() => [])
      ]).then(([hr, admin, users]) => {
        const combined = [...(hr || []), ...(admin || []), ...(users || [])];
        const seen = new Set();
        return combined.filter(u => {
          if (!u.value || seen.has(u.value)) return false;
          seen.add(u.value);
          return true;
        });
      }).catch(() => [])
    ]);

    setDrugs((drugItems || []).map((item: any) => ({ id: item.ID, name: item.Title })));
    setCountries((countryItems || []).map((item: any) => ({ id: item.ID, name: item.Title })));

    setTemplates(
      (templateItems || []).map((item: any) => {
        const mappingType: 'eCTD' | 'GMP' | 'TMF' | 'None' = item.MappingType || 'None';
        const mappedCTDFolderId = item.MappedCTDFolderId || parseLookupId(item.MappedCTDFolder);
        const mappedGMPModelId = item.MappedGMPModelId || parseLookupId(item.MappedGMPModel);
        const mappedTMFFolderId = item.MappedTMFFolderId || parseLookupId(item.MappedTMFFolder);

        // Resolve mappedFolderId based on mappingType
        let mappedFolderId: string | undefined;
        if (mappingType === 'eCTD' && mappedCTDFolderId) {
          mappedFolderId = String(mappedCTDFolderId);
        } else if (mappingType === 'GMP' && mappedGMPModelId) {
          mappedFolderId = String(mappedGMPModelId);
        } else if (mappingType === 'TMF' && mappedTMFFolderId) {
          mappedFolderId = String(mappedTMFFolderId);
        }

        return {
          id: item.ID,
          name: item.LinkFilename || item.FileLeafRef || item.Title || 'Template',
          categoryId: Number(item.CategoryId || parseLookupId(item.Category)) || 0,
          countryId: Number(item.CountryId || parseLookupId(item.Country)) || 0,
          status: item.Status || '',
          fileRef: item.FileRef || '',
          fileLeafRef: item.FileLeafRef || item.LinkFilename || '',
          mappingType,
          mappedFolderId,
          mappedGMPModelId: mappedGMPModelId || undefined,
          mappedGMPModel: item.MappedGMPModel?.[0]?.lookupValue || '',
          mappedTMFFolderId: mappedTMFFolderId || undefined,
          mappedTMFFolder: item.MappedTMFFolder?.[0]?.lookupValue || ''
        };
      })
    );

    // eCTD CTD folders keyed by FolderId
    setModules(
      (folderItems || []).map((item: any) => ({
        id: item.FolderId || String(item.ID),
        name: item.Title,
        parentId: item.ParentFolderId || undefined
      }))
    );

    // GMP models keyed by ID (numeric string)
    setGmpModels(
      (gmpItems || []).map((item: any) => ({
        id: String(item.ID),
        name: item.Title,
        parentId: undefined
      }))
    );

    // TMF folders keyed by FolderId
    setTmfFolders(
      (tmfItems || []).map((item: any) => ({
        id: item.FolderId || String(item.ID),
        name: item.Title,
        parentId: item.ParentFolderId || undefined
      }))
    );

    setApprovers(
      (approverItems || []).map((item: any) => ({ id: item.value, name: item.label }))
    );
  }, [provider]);

  React.useEffect(() => {
    void loadLookupData();
  }, [loadLookupData]);

  // Auto-bind folder placement from selected Template mapping type
  React.useEffect(() => {
    const selectedTemplate = templates.find(t => t.id === formData.templateId);
    if (!selectedTemplate || !selectedTemplate.mappedFolderId) {
      setFormData(prev => {
        if (!prev.moduleId && !prev.submoduleId) return prev;
        return { ...prev, moduleId: '', submoduleId: '' };
      });
      return;
    }

    const mappingType = selectedTemplate.mappingType || 'None';
    const mappedId = selectedTemplate.mappedFolderId;

    if (mappingType === 'eCTD') {
      const byId = new Map(modules.map(m => [m.id, m]));
      const leaf = byId.get(mappedId);
      if (!leaf) return;
      let root = leaf;
      while (root.parentId && byId.get(root.parentId)) {
        root = byId.get(root.parentId)!;
      }
      const nextModuleId = root.id;
      const nextSubmoduleId = mappedId === root.id ? '' : mappedId;
      setFormData(prev => {
        if (prev.moduleId === nextModuleId && prev.submoduleId === nextSubmoduleId) return prev;
        return { ...prev, moduleId: nextModuleId, submoduleId: nextSubmoduleId };
      });

    } else if (mappingType === 'GMP') {
      // GMP: moduleId = GMP model numeric ID string, submoduleId = ''
      setFormData(prev => {
        if (prev.moduleId === mappedId && !prev.submoduleId) return prev;
        return { ...prev, moduleId: mappedId, submoduleId: '' };
      });

    } else if (mappingType === 'TMF') {
      // TMF: mappedId is FolderId of artifact, walk up to Zone → Section
      const byId = new Map(tmfFolders.map(m => [m.id, m]));
      const leaf = byId.get(mappedId);
      if (!leaf) return;
      let root = leaf;
      while (root.parentId && byId.get(root.parentId)) {
        root = byId.get(root.parentId)!;
      }
      const nextModuleId = root.id;      // Zone folderId
      const nextSubmoduleId = mappedId === root.id ? '' : mappedId;
      setFormData(prev => {
        if (prev.moduleId === nextModuleId && prev.submoduleId === nextSubmoduleId) return prev;
        return { ...prev, moduleId: nextModuleId, submoduleId: nextSubmoduleId };
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.templateId, templates, modules, gmpModels, tmfFolders]);

  // Auto-bind Category from selected Template
  React.useEffect(() => {
    const selectedTemplate = templates.find(t => t.id === formData.templateId);
    const nextCategoryId = selectedTemplate?.categoryId ?? 0;
    setFormData(prev => {
      if (prev.categoryId === nextCategoryId) return prev;
      return { ...prev, categoryId: nextCategoryId };
    });
  }, [formData.templateId, templates]);

  const filteredTemplates = React.useMemo(() => templates, [templates]);

  const selectedTemplate = React.useMemo(
    () => templates.find(t => t.id === formData.templateId),
    [templates, formData.templateId]
  );

  const resetForm = () => {
    setStep(1);
    setFormData({
      drugId: 0,
      countryId: 0,
      categoryId: 0,
      templateId: 0,
      moduleId: '',
      submoduleId: '',
      approverId: 0,
      comments: ['']
    });
    setErrors({});
  };

  const closeAndReset = () => {
    onClose();
    resetForm();
  };

  const validateStep = (currentStep: number): boolean => {
    const nextErrors: ValidationErrors = {};
    if (currentStep >= 1 && !formData.drugId) nextErrors.drugId = 'Please select a drug.';
    if (currentStep >= 1 && !formData.countryId) nextErrors.countryId = 'Please select a country.';
    if (currentStep >= 2) {
      if (!formData.templateId) nextErrors.templateId = 'Please select a template.';
    }
    if (currentStep >= 3) {
      if (!formData.approverId) nextErrors.approverId = 'Please select an approver.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const isStepComplete = (currentStep: number): boolean => {
    if (currentStep >= 1 && (!formData.drugId || !formData.countryId)) return false;
    if (currentStep >= 2 && !formData.templateId) return false;
    if (currentStep >= 3 && !formData.approverId) return false;
    return true;
  };

  const canProceed = () => isStepComplete(step);

  const handleNext = () => {
    if (step < 3 && validateStep(step)) setStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleCommentChange = (index: number, value: string) => {
    setFormData(prev => {
      const next = [...prev.comments];
      next[index] = value;
      return { ...prev, comments: next };
    });
  };

  const addCommentField = () => {
    setFormData(prev => ({ ...prev, comments: [...prev.comments, ''] }));
  };

  const removeCommentField = (index: number) => {
    setFormData(prev => ({ ...prev, comments: prev.comments.filter((_c, i) => i !== index) }));
  };

  const handleSubmit = async () => {
    if (!provider || !context) return;
    if (!validateStep(3)) return;
    if (!currentUser) return;

    setIsSubmitting(true);
    try {
      // Duplicate prevention
      const duplicate = await provider.getItemsByQuery({
        listName: ListNames.DMSDocuments,
        select: ['ID'],
        filter: `DrugId eq ${formData.drugId} and CountryId eq ${formData.countryId} and TemplateId eq ${formData.templateId}`,
        top: 1
      });
      if (duplicate && duplicate.length > 0) {
        setErrors({ templateId: 'A document with this Drug, Country, and Template already exists.' } as any);
        setIsSubmitting(false);
        return;
      }

      const selTemplate = templates.find(t => t.id === formData.templateId);
      if (!selTemplate?.fileRef) {
        setErrors({ templateId: 'Template file not found. Please re-upload the template.' });
        setIsSubmitting(false);
        return;
      }

      const libraryUrl = getLibraryUrl(ListNames.DMSDocumentsPath);
      const commentsPayload = formData.comments
        .filter(c => c.trim())
        .map((c, idx) => ({
          id: idx + 1,
          author: currentUser.displayName,
          text: c.trim(),
          timestamp: new Date().toISOString()
        }));

      const sanitize = (value: string) =>
        String(value || 'Document').trim()
          .replace(/[\\/:*?"<>|#%&{}~]+/g, '_')
          .replace(/\s+/g, '_').replace(/_+/g, '_')
          .replace(/^_+|_+$/g, '').slice(0, 80) || 'Document';

      const artifactNameRaw = selTemplate.artifactName || selTemplate.name || 'Document';
      const artifactName = artifactNameRaw.replace(/\.[^/.]+$/, '') || artifactNameRaw;
      const templateLeaf = selTemplate.fileLeafRef || 'Template.docx';
      const extMatch = templateLeaf.match(/\.[0-9a-z]+$/i);
      const ext = extMatch ? extMatch[0] : '.docx';
      const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
      const targetFileName = `${sanitize(artifactName)}_${stamp}${ext}`;
      const drugName = drugs.find(d => d.id === formData.drugId)?.name || 'Drug';

      const mappingType = selTemplate.mappingType || 'None';
      let ctdSegments: string[] = [];
      let ctdFolderValue = '';
      let ctdModuleValue = '';
      let submoduleValue = '';

      if (mappingType === 'GMP') {
        // GMP: 1-level folder = GMP model name
        const gmpModel = gmpModels.find(g => g.id === formData.moduleId);
        const modelName = gmpModel?.name || formData.moduleId || 'GMP';
        ctdSegments = [modelName];
        ctdFolderValue = modelName;
        ctdModuleValue = modelName;
        submoduleValue = '';

      } else if (mappingType === 'TMF') {
        // TMF: Zone → Section (walk up from leaf to root)
        const byId = new Map(tmfFolders.map(m => [m.id, m]));
        const leafId = formData.submoduleId || formData.moduleId;
        const chain: FolderItem[] = [];
        let node = leafId ? byId.get(leafId) : undefined;
        while (node) {
          chain.push(node);
          if (!node.parentId) break;
          node = byId.get(node.parentId);
        }
        ctdSegments = chain.reverse().map(n => n.name).filter(Boolean);
        const zoneNode = chain[0];
        const sectionNode = chain.length > 1 ? chain[chain.length - 1] : undefined;
        ctdFolderValue = formData.submoduleId || formData.moduleId;
        ctdModuleValue = zoneNode?.id || formData.moduleId;
        submoduleValue = sectionNode?.id || formData.submoduleId || '';

      } else {
        // eCTD: Module → Subfolder
        const byId = new Map(modules.map(m => [m.id, m]));
        const leafId = formData.submoduleId || formData.moduleId;
        const chain: FolderItem[] = [];
        let node = leafId ? byId.get(leafId) : undefined;
        while (node) {
          chain.push(node);
          if (!node.parentId) break;
          node = byId.get(node.parentId);
        }
        ctdSegments = chain.reverse().map(n => n.name).filter(Boolean);
        ctdFolderValue = formData.submoduleId || formData.moduleId;
        ctdModuleValue = formData.moduleId;
        submoduleValue = formData.submoduleId;
      }

      const targetFolder = await ensureFolderPath(libraryUrl, [drugName, ...ctdSegments]);
      const targetUrl = `${targetFolder}/${targetFileName}`;
      await provider.copyFile(selTemplate.fileRef, targetUrl);

      const created = await provider.getItemsByQuery({
        listName: ListNames.DMSDocuments,
        select: ['ID', 'FileRef'],
        filter: `FileRef eq '${targetUrl}'`,
        top: 1
      });
      const createdId = created?.[0]?.ID;
      if (!createdId) {
        setErrors({ templateId: 'Document created but metadata update failed. Please refresh.' } as any);
        setIsSubmitting(false);
        return;
      }

      const absoluteFileUrl = `${context.pageContext.web.absoluteUrl}${targetUrl}`;
      await provider.updateItem(
        {
          Title: artifactName,
          CategoryId: formData.categoryId || null,
          TemplateId: formData.templateId || null,
          DrugId: formData.drugId || null,
          CountryId: formData.countryId || null,
          CTDFolder: ctdFolderValue,
          CTDModule: ctdModuleValue,
          Submodule: submoduleValue,
          Status: 'Draft',
          IsEmailSend: true,
          Version: 1,
          ApproverId: formData.approverId || null,
          Comments: commentsPayload.length > 0 ? JSON.stringify(commentsPayload) : '',
          SharePointURL: { Url: absoluteFileUrl, Description: artifactName }
        },
        ListNames.DMSDocuments,
        Number(createdId)
      );

      onSuccess();
      closeAndReset();
    } catch (error) {
      console.error('Failed to create document:', error);
      setErrors({ templateId: 'Failed to create document from template. Please try again.' } as any);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    step,
    setStep,
    formData,
    setFormData,
    drugs,
    countries,
    templates,
    filteredTemplates,
    selectedTemplate,
    modules,
    gmpModels,
    tmfFolders,
    approvers,
    errors,
    isSubmitting,
    canProceed,
    handleNext,
    handleBack,
    handleSubmit,
    handleCommentChange,
    addCommentField,
    removeCommentField,
    resetForm,
    closeAndReset
  };
}
