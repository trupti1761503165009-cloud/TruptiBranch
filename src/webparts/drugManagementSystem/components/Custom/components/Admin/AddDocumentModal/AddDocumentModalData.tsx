import * as React from 'react';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { currentUserAtom } from '../../../../../jotai/adminAtoms';
import { ListNames } from '../../../../../../Shared/Enum/ListNames';

export interface AddDocumentModalDataParams {
  onClose: () => void;
  onSuccess: () => void;
}

export interface AddDocumentWizardFormData {
  drugId: number;
  countryId: number;
  // Derived from Template selection (Templates.Category lookup)
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
}

interface ModuleItem {
  id: string;
  name: string;
  parentId?: string;
}

interface ApproverItem {
  id: number;
  name: string;
}

type ValidationErrors = Partial<Record<keyof AddDocumentWizardFormData, string>>;

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
  const [modules, setModules] = React.useState<ModuleItem[]>([]);
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
        try {
          await provider.createFolder(currentPath);
        } catch {
          // ignore if folder already exists or cannot be created
        }
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
    const [drugItems, countryItems, templateItems, folderItems, approverItems] = await Promise.all([
      provider.getItemsByQuery({
        listName: ListNames.DrugsDatabase,
        select: ['ID', 'Title'],
        top: 5000,
        orderBy: 'Title',
        isSortOrderAsc: true
      }),
      provider.getItemsByQuery({
        listName: ListNames.Countries,
        select: ['ID', 'Title'],
        top: 5000,
        orderBy: 'Title',
        isSortOrderAsc: true
      }),
      provider.getItemsByQuery({
        listName: ListNames.Templates,
        select: [
          'ID',
          'Title',
          'FileRef',
          'FileLeafRef',
          'Status',
          'Category/Id',
          'Category/Title',
          // 'Category/ArtifactName',
          'Country/Id',
          'MappedCTDFolder/FolderId'
        ],
        expand: ['Category', 'Country', 'MappedCTDFolder'],
        top: 5000,
        orderBy: 'Title',
        isSortOrderAsc: true
      }),
      provider.getItemsByQuery({
        listName: ListNames.CTDFolders,
        select: ['ID', 'Title', 'FolderId', 'ParentFolderId'],
        top: 5000,
        orderBy: 'SortOrder',
        isSortOrderAsc: true
      }),
      provider.getUsersFromGroup('HR').catch(() => [])
    ]);

    setDrugs(
      (drugItems || []).map((item: any) => ({
        id: item.ID,
        name: item.Title
      }))
    );
    setCountries(
      (countryItems || []).map((item: any) => ({
        id: item.ID,
        name: item.Title
      }))
    );
    setTemplates(
      (templateItems || []).map((item: any) => ({
        id: item.ID,
        name: item.Title || item.FileLeafRef || 'Template',
        categoryId: item.Category?.Id,
        categoryName: item.Category?.Title,
        artifactName: item.Category?.ArtifactName,
        countryId: item.Country?.Id,
        status: item.Status,
        mappedFolderId: item.MappedCTDFolder?.FolderId,
        fileRef: item.FileRef,
        fileLeafRef: item.FileLeafRef
      }))
    );
    setModules(
      (folderItems || []).map((item: any) => ({
        id: item.FolderId || String(item.ID),
        name: item.Title,
        parentId: item.ParentFolderId || undefined
      }))
    );
    setApprovers(
      (approverItems || []).map((item: any) => ({
        id: item.value,
        name: item.label
      }))
    );
  }, [provider]);

  React.useEffect(() => {
    void loadLookupData();
  }, [loadLookupData]);

  // Auto-bind CTD placement from the selected Template mapping (optional).
  React.useEffect(() => {
    const selectedTemplate = templates.find(t => t.id === formData.templateId);
    const mappedFolderId = selectedTemplate?.mappedFolderId;
    if (!mappedFolderId) {
      // If template is not mapped, keep CTD fields empty.
      setFormData(prev => {
        if (!prev.moduleId && !prev.submoduleId) return prev;
        return { ...prev, moduleId: '', submoduleId: '' };
      });
      return;
    }

    const byId = new Map(modules.map(m => [m.id, m]));
    const leaf = byId.get(mappedFolderId);
    if (!leaf) {
      setFormData(prev => {
        if (!prev.moduleId && !prev.submoduleId) return prev;
        return { ...prev, moduleId: '', submoduleId: '' };
      });
      return;
    }

    // Walk up to root module (top-level folder).
    let root = leaf;
    while (root.parentId && byId.get(root.parentId)) {
      root = byId.get(root.parentId)!;
    }

    const nextModuleId = root.id;
    const nextSubmoduleId = mappedFolderId === root.id ? '' : mappedFolderId;
    setFormData(prev => {
      if (prev.moduleId === nextModuleId && prev.submoduleId === nextSubmoduleId) return prev;
      return { ...prev, moduleId: nextModuleId, submoduleId: nextSubmoduleId };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.templateId, templates, modules]);

  // Auto-bind Category from selected Template (required metadata).
  React.useEffect(() => {
    const selectedTemplate = templates.find(t => t.id === formData.templateId);
    const nextCategoryId = selectedTemplate?.categoryId ?? 0;
    setFormData(prev => {
      if (prev.categoryId === nextCategoryId) return prev;
      return { ...prev, categoryId: nextCategoryId };
    });
  }, [formData.templateId, templates]);

  const filteredTemplates = React.useMemo(
    () =>
      templates
        .filter(t => (t.status ? String(t.status).toLowerCase() === 'active' : true))
        .filter(t => (!formData.countryId ? true : t.countryId === formData.countryId)),
    [templates, formData.countryId]
  );

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
    if (currentStep >= 1 && !formData.drugId) nextErrors.drugId = 'Drug is required.';
    if (currentStep >= 1 && !formData.countryId) nextErrors.countryId = 'Country is required.';
    if (currentStep >= 2 && !formData.templateId) nextErrors.templateId = 'Template is required.';
    if (currentStep >= 3 && !formData.approverId) nextErrors.approverId = 'Approver is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const isStepComplete = (currentStep: number): boolean => {
    if (currentStep >= 1 && !formData.drugId) return false;
    if (currentStep >= 1 && !formData.countryId) return false;
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
      // Duplicate prevention check
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

      const selectedTemplate = templates.find(t => t.id === formData.templateId);
      if (!selectedTemplate?.fileRef) {
        setErrors({ templateId: 'Template file not found. Please re-upload the template.' });
        return;
      }

      const libraryUrl = getLibraryUrl(ListNames.DMSDocumentsPath); // server relative library root

      const commentsPayload = formData.comments
        .filter(comment => comment.trim())
        .map((comment, idx) => ({
          id: idx + 1,
          author: currentUser.displayName,
          text: comment.trim(),
          timestamp: new Date().toISOString()
        }));

      // Create document by COPYING template content into DMS Documents,
      // but naming the new file by Artifact Name.
      const sanitize = (value: string) =>
        String(value || 'Document')
          .trim()
          .replace(/[\\/:*?"<>|#%&{}~]+/g, '_')
          .replace(/\s+/g, '_')
          .replace(/_+/g, '_')
          .replace(/^_+|_+$/g, '')
          .slice(0, 80) || 'Document';

      const artifactName = selectedTemplate.artifactName || selectedTemplate.name || 'Document';
      const templateLeaf = selectedTemplate.fileLeafRef || 'Template.docx';
      const extMatch = templateLeaf.match(/\.[0-9a-z]+$/i);
      const ext = extMatch ? extMatch[0] : '.docx';
      const stamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
      const targetFileName = `${sanitize(artifactName)}_${stamp}${ext}`;
      const drugName = drugs.find(d => d.id === formData.drugId)?.name || 'Drug';

      // Build CTD folder chain (root module -> leaf) using CTD folder lookup list.
      const byId = new Map(modules.map(m => [m.id, m]));
      const leafId = formData.submoduleId || formData.moduleId;
      const chain: ModuleItem[] = [];
      let node = leafId ? byId.get(leafId) : undefined;
      while (node) {
        chain.push(node);
        if (!node.parentId) break;
        node = byId.get(node.parentId);
      }
      const ctdSegments = chain.reverse().map(n => n.name).filter(Boolean);

      // Ensure folder path exists then copy file there.
      const targetFolder = await ensureFolderPath(libraryUrl, [drugName, ...ctdSegments]);
      const targetUrl = `${targetFolder}/${targetFileName}`;

      await provider.copyFile(selectedTemplate.fileRef, targetUrl);

      const created = await provider.getItemsByQuery({
        listName: ListNames.DMSDocuments,
        select: ['ID', 'FileRef'],
        filter: `FileRef eq '${targetUrl}'`,
        top: 1
      });
      const createdId = created?.[0]?.ID;
      if (!createdId) {
        setErrors({ templateId: 'Document created, but metadata update failed. Please refresh and try again.' } as any);
        return;
      }

      const absoluteFileUrl = `${context.pageContext.web.absoluteUrl}${targetUrl}`;
      await provider.updateItem(
        {
          Title: artifactName,
          CategoryId: formData.categoryId || undefined,
          TemplateId: formData.templateId,
          DrugId: formData.drugId,
          CountryId: formData.countryId,
          CTDFolder: formData.submoduleId || formData.moduleId,
          CTDModule: formData.moduleId,
          Submodule: formData.submoduleId,
          Status: 'Draft',
          IsEmailSend: true, // Mark for notification on creation
          Version: 1,
          ApproverId: formData.approverId,
          Comments: commentsPayload.length > 0 ? JSON.stringify(commentsPayload) : '',
          SharePointURL: { Url: absoluteFileUrl, Description: targetFileName }
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

