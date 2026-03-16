import * as React from 'react';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { ICategory } from '../../../../../../Service/Service';
import { ListNames } from '../../../../../../Shared/Enum/ListNames';
import { IReactDropOptionProps } from '../../../../Common/ReactSelectDropdown';

export interface ExtendedCategory extends ICategory {
  documentCategory?: string;
  group?: string;
  subGroup?: string;
  artifactName?: string;
  templateName?: string;
  ctdModule?: string;
  ectdSection?: string;
  ectdSubsection?: string;
  ectdCode?: string;
  documents?: number;
}

export interface CategoryFormData {
  name: string;
  documentCategory: string;
  group: string;
  subGroup: string;
  artifactName: string;
  templateName: string;
  status: 'Active' | 'Inactive';
  documents: number;
  description: string;
  artifactDescription: string;
  ctdModule: string;
  ectdSection: string;
  ectdSubsection: string;
  ectdCode: string;
}

export function ManageCategoriesData() {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider } = appGlobalState;

  const [categories, setCategories] = React.useState<ExtendedCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = React.useState<ExtendedCategory[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'All' | 'Active' | 'Inactive'>('All');

  // Form state
  const [isCreatePageOpen, setIsCreatePageOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<ExtendedCategory | null>(null);
  const [formData, setFormData] = React.useState<CategoryFormData>({
    name: '',
    documentCategory: '',
    group: '',
    subGroup: '',
    artifactName: '',
    templateName: '',
    status: 'Active',
    documents: 0,
    description: '',
    artifactDescription: '',
    ctdModule: '',
    ectdSection: '',
    ectdSubsection: '',
    ectdCode: ''
  });
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<keyof CategoryFormData, string>>>({});

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Loading and messages
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  // Dropdown options
  // Dropdown options
  const [documentCategoryOptions, setDocumentCategoryOptions] = React.useState<IReactDropOptionProps[]>([{ label: '-- Select Document Category --', value: '' }]);
  const [groupOptions, setGroupOptions] = React.useState<IReactDropOptionProps[]>([{ label: '-- Select Group --', value: '' }]);
  const [subGroupOptions, setSubGroupOptions] = React.useState<IReactDropOptionProps[]>([{ label: '-- Select Sub Group --', value: '' }]);
  const [artifactNameOptions, setArtifactNameOptions] = React.useState<IReactDropOptionProps[]>([{ label: '-- Select Artifact --', value: '' }]);
  const [templateNameOptions, setTemplateNameOptions] = React.useState<IReactDropOptionProps[]>([{ label: '-- Select Template --', value: '' }]);
  const [ctdModuleOptions, setCtdModuleOptions] = React.useState<IReactDropOptionProps[]>([{ label: '-- Select CTD Module --', value: '' }]);
  const [ectdSectionOptions, setEctdSectionOptions] = React.useState<IReactDropOptionProps[]>([{ label: '-- Select eCTD Section --', value: '' }]);
  const [ectdSubsectionOptions, setEctdSubsectionOptions] = React.useState<IReactDropOptionProps[]>([{ label: '-- Select Subsection --', value: '' }]);
  const [ectdCodeOptions, setEctdCodeOptions] = React.useState<IReactDropOptionProps[]>([{ label: '-- Select Code --', value: '' }]);

  React.useEffect(() => {
    const fetchDropdowns = async () => {
      if (!provider) return;
      try {
        const [docCats, groups, subGroups, artifacts, templates, modules, sections] = await Promise.all([
          provider.getFieldChoices(ListNames.Categories, 'DocumentCategory'),
          provider.getFieldChoices(ListNames.Categories, 'Group'),
          provider.getFieldChoices(ListNames.Categories, 'SubGroup'),
          provider.getFieldChoices(ListNames.Categories, 'ArtifactName'),
          provider.getTemplatesMaster(),
          provider.getCTDModulesMaster(),
          provider.getECTDSectionsMaster()
        ]);

        if (docCats?.length > 0) setDocumentCategoryOptions([{ label: '-- Select Document Category --', value: '' }, ...docCats.map(c => ({ label: c, value: c }))]);
        if (groups?.length > 0) setGroupOptions([{ label: '-- Select Group --', value: '' }, ...groups.map(c => ({ label: c, value: c }))]);
        if (subGroups?.length > 0) setSubGroupOptions([{ label: '-- Select Sub Group --', value: '' }, ...subGroups.map(c => ({ label: c, value: c }))]);
        if (artifacts?.length > 0) setArtifactNameOptions([{ label: '-- Select Artifact --', value: '' }, ...artifacts.map(c => ({ label: c, value: c }))]);
        if (templates?.length > 0) setTemplateNameOptions([{ label: '-- Select Template --', value: '' }, ...templates.map(c => ({ label: c, value: c }))]);
        if (modules?.length > 0) setCtdModuleOptions([{ label: '-- Select CTD Module --', value: '' }, ...modules.map(c => ({ label: c, value: c }))]);
        if (sections?.length > 0) setEctdSectionOptions([{ label: '-- Select eCTD Section --', value: '' }, ...sections.map(c => ({ label: c, value: c }))]);

      } catch (e) {
        console.error('Error fetching dropdowns:', e);
      }
    };
    void fetchDropdowns();
  }, [provider]);



  const loadCategories = React.useCallback(async () => {
    if (!provider) {
      // Mock data for development
      const mockCategories: ExtendedCategory[] = [
        { id: 1, name: 'Clinical Cover Letter', documentCategory: 'Clinical', group: 'Module 1', subGroup: 'Sub Group 1', level: 4, status: 'Active', documents: 5 },
        { id: 2, name: 'Non-Clinical Summary', documentCategory: 'Non-Clinical', group: 'Module 2', subGroup: 'Sub Group 2', level: 4, status: 'Active', documents: 3 },
        { id: 3, name: 'Quality Control Doc', documentCategory: 'Quality', group: 'Module 3', subGroup: 'Sub Group 1', level: 4, status: 'Inactive', documents: 0 },
        { id: 4, name: 'Regulatory Form', documentCategory: 'Regulatory', group: 'Module 1', subGroup: 'Sub Group 3', level: 4, status: 'Active', documents: 2 },
        { id: 5, name: 'Safety Report', documentCategory: 'Safety', group: 'Module 5', subGroup: 'Sub Group 2', level: 4, status: 'Active', documents: 8 }
      ];
      setCategories(mockCategories);
      return;
    }

    setIsLoading(true);
    try {
      const data = await provider.getCategories();
      setCategories(data.map(c => ({ ...c, documents: 0 })));
      setErrorMessage('');
    } catch (error) {
      console.error('Failed to load categories:', error);
      setErrorMessage('Unable to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  React.useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const applyFilters = React.useCallback(() => {
    let filtered = [...categories];

    if (statusFilter !== 'All') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.documentCategory && c.documentCategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.group && c.group.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.subGroup && c.subGroup.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredCategories(filtered);
  }, [categories, statusFilter, searchTerm]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const resetForm = () => {
    setFormData({
      name: '',
      documentCategory: '',
      group: '',
      subGroup: '',
      artifactName: '',
      templateName: '',
      status: 'Active',
      documents: 0,
      description: '',
      artifactDescription: '',
      ctdModule: '',
      ectdSection: '',
      ectdSubsection: '',
      ectdCode: ''
    });
    setFieldErrors({});
    setEditingCategory(null);
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CategoryFormData, string>> = {};
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Category name is required.';
    }
    if (!formData.documentCategory) {
      errors.documentCategory = 'Document category is required.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCategory = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    if (!validateForm()) return false;

    if (!provider) {
      setSuccessMessage('Demo mode: Category saved locally.');
      setIsCreatePageOpen(false);
      resetForm();
      return true;
    }

    setIsLoading(true);
    try {
      await provider.createCategory({
        name: formData.name,
        description: formData.description,
        documentCategory: formData.documentCategory,
        group: formData.group,
        subGroup: formData.subGroup,
        artifactName: formData.artifactName,
        templateName: formData.templateName,
        ctdModule: formData.ctdModule,
        ectdSection: formData.ectdSection,
        ectdSubsection: formData.ectdSubsection,
        ectdCode: formData.ectdCode,
        level: 4,
        status: formData.status
      });
      setSuccessMessage('Category created successfully.');
      await loadCategories();
      setIsCreatePageOpen(false);
      resetForm();
      return true;
    } catch (error) {
      console.error('Failed to save category:', error);
      setErrorMessage('Unable to save category. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    if (!validateForm() || !editingCategory) return false;

    if (!provider) {
      setSuccessMessage('Demo mode: Category updated locally.');
      return true;
    }

    setIsLoading(true);
    try {
      await provider.updateCategory(editingCategory.id, {
        name: formData.name,
        description: formData.description,
        documentCategory: formData.documentCategory,
        group: formData.group,
        subGroup: formData.subGroup,
        artifactName: formData.artifactName,
        templateName: formData.templateName,
        ctdModule: formData.ctdModule,
        ectdSection: formData.ectdSection,
        ectdSubsection: formData.ectdSubsection,
        ectdCode: formData.ectdCode,
        status: formData.status
      });
      setSuccessMessage('Category updated successfully.');
      await loadCategories();
      return true;
    } catch (error) {
      console.error('Failed to update category:', error);
      setErrorMessage('Unable to update category. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (category: ExtendedCategory) => {
    setEditingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!editingCategory) return;

    if (!provider) {
      setSuccessMessage('Demo mode: Category deleted locally.');
      setIsDeleteDialogOpen(false);
      setEditingCategory(null);
      return;
    }

    setIsLoading(true);
    try {
      await provider.deleteCategory(editingCategory.id);
      setSuccessMessage('Category deleted successfully.');
      await loadCategories();
      setIsDeleteDialogOpen(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Failed to delete category:', error);
      setErrorMessage('Unable to delete category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!provider) {
      setSuccessMessage('Demo mode: Categories deleted locally.');
      setSelectedIds([]);
      return;
    }

    setIsLoading(true);
    try {
      for (const id of selectedIds) {
        await provider.deleteCategory(id);
      }
      setSuccessMessage(`${selectedIds.length} category(s) deleted successfully.`);
      await loadCategories();
      setSelectedIds([]);
    } catch (error) {
      console.error('Failed to delete categories:', error);
      setErrorMessage('Unable to delete categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    filteredCategories,
    searchTerm,
    statusFilter,
    selectedIds,
    isCreatePageOpen,
    isDeleteDialogOpen,
    documentCategoryOptions,
    groupOptions,
    subGroupOptions,
    artifactNameOptions,
    templateNameOptions,
    ctdModuleOptions,
    ectdSectionOptions,
    ectdSubsectionOptions,
    ectdCodeOptions,
    formData,
    fieldErrors,
    errorMessage,
    successMessage,
    isLoading,
    provider,
    setSearchTerm,
    setStatusFilter,
    setSelectedIds,
    setIsCreatePageOpen,
    setIsDeleteDialogOpen,
    setFormData,
    resetForm,
    handleAddCategory,
    handleEditCategory,
    handleDeleteClick,
    handleDeleteConfirm,
    handleBulkDelete,
    loadCategories,
    setEditingCategory
  };
}
