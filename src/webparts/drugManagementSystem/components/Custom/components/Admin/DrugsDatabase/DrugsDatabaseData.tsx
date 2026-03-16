import * as React from 'react';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { IDrug } from '../../../../../../Service/Service';
import { ListNames } from '../../../../../../Shared/Enum/ListNames';

export type DrugStatus = 'Active' | 'Inactive' | 'In Development';

export interface DrugFilters {
  status: 'All' | DrugStatus;
  category: string;
}

export interface DrugItem extends IDrug {
  // Extended drug item for component use
}

export function DrugsDatabaseData() {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider } = appGlobalState;

  const [drugs, setDrugs] = React.useState<IDrug[]>([]);
  const [filteredDrugs, setFilteredDrugs] = React.useState<IDrug[]>([]);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');

  // For component compatibility
  const [statusFilter, setStatusFilter] = React.useState<'All' | DrugStatus>('All');
  const statusOptions: DrugStatus[] = ['Active', 'Inactive', 'In Development'];
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const [filters, setFilters] = React.useState<DrugFilters>({
    status: 'All',
    category: ''
  });

  // Panel state
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [panelMode, setPanelMode] = React.useState<'add' | 'edit' | 'view'>('add');
  const [editingDrug, setEditingDrug] = React.useState<IDrug | null>(null);
  const [formData, setFormData] = React.useState<Partial<IDrug>>({
    name: '',
    category: '',
    status: 'Active',
    description: '',
    ctdStructure: 'ectd'
  });

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deleteIds, setDeleteIds] = React.useState<number[]>([]);

  // Loading and messages
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  // Categories for dropdown
  const [categories, setCategories] = React.useState<string[]>([]);

  const loadDrugs = React.useCallback(async () => {
    if (!provider) {
      // Mock data for development
      const mockDrugs: IDrug[] = [
        { id: 1, name: 'Drug X-100', category: 'Clinical', status: 'Active', description: 'Primary clinical trial drug', ctdStructure: 'ectd' },
        { id: 2, name: 'Drug Y-200', category: 'Regulatory', status: 'Active', description: 'Regulatory submission drug', ctdStructure: 'ectd' },
        { id: 3, name: 'Drug Z-300', category: 'Safety', status: 'In Development', description: 'Safety study drug', ctdStructure: 'dossier' },
        { id: 4, name: 'Drug A-400', category: 'Clinical', status: 'Inactive', description: 'Discontinued drug', ctdStructure: 'ectd' },
        { id: 5, name: 'Drug B-500', category: 'Quality', status: 'Active', description: 'Quality control drug', ctdStructure: 'ectd' }
      ];
      setDrugs(mockDrugs);
      setCategories(['Clinical', 'Regulatory', 'Safety', 'Quality']);
      return;
    }

    setIsLoading(true);
    try {
      const [drugsData, categoriesData] = await Promise.all([
        provider.getDrugs(),
        provider.getCategories()
      ]);
      setDrugs(drugsData);
      const uniqueCategories = Array.from(new Set(categoriesData.map(c => c.name)));
      setCategories(uniqueCategories);
      setErrorMessage('');
    } catch (error) {
      console.error('Failed to load drugs:', error);
      setErrorMessage('Unable to load drugs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  React.useEffect(() => {
    void loadDrugs();
  }, [loadDrugs]);

  const applyFilters = React.useCallback(() => {
    let filtered = [...drugs];

    if (filters.status !== 'All') {
      filtered = filtered.filter(d => d.status === filters.status);
    }

    if (filters.category) {
      filtered = filtered.filter(d => d.category === filters.category);
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.description && d.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredDrugs(filtered);
  }, [drugs, filters, searchTerm]);

  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const openAddPanel = () => {
    setPanelMode('add');
    setEditingDrug(null);
    setFormData({
      name: '',
      category: '',
      status: 'Active',
      description: '',
      ctdStructure: 'ectd'
    });
    setIsPanelOpen(true);
  };

  const openEditPanel = (drug: IDrug) => {
    setPanelMode('edit');
    setEditingDrug(drug);
    setFormData({ ...drug });
    setIsPanelOpen(true);
  };

  const openViewPanel = (drug: IDrug) => {
    setPanelMode('view');
    setEditingDrug(drug);
    setFormData({ ...drug });
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setEditingDrug(null);
    setFormData({
      name: '',
      category: '',
      status: 'Active',
      description: '',
      ctdStructure: 'ectd'
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name || formData.name.trim() === '') {
      setErrorMessage('Drug name is required.');
      return false;
    }
    return true;
  };

  const handleSave = async (): Promise<boolean> => {
    if (!validateForm()) return false;
    if (!provider) {
      setSuccessMessage('Demo mode: Drug saved locally.');
      closePanel();
      return true;
    }

    setIsLoading(true);
    try {
      if (panelMode === 'add') {
        await provider.createDrug(formData as Omit<IDrug, 'id'>);
        setSuccessMessage('Drug created successfully.');
      } else if (panelMode === 'edit' && editingDrug) {
        await provider.updateDrug(editingDrug.id, formData);
        setSuccessMessage('Drug updated successfully.');
      }
      await loadDrugs();
      closePanel();
      return true;
    } catch (error) {
      console.error('Failed to save drug:', error);
      setErrorMessage('Unable to save drug. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (ids: number[]) => {
    setDeleteIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!provider) {
      setSuccessMessage('Demo mode: Drugs deleted locally.');
      setIsDeleteDialogOpen(false);
      setSelectedIds([]);
      return;
    }

    setIsLoading(true);
    try {
      for (const id of deleteIds) {
        await provider.deleteDrug(id);
      }
      setSuccessMessage(`${deleteIds.length} drug(s) deleted successfully.`);
      await loadDrugs();
      setSelectedIds([]);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Failed to delete drugs:', error);
      setErrorMessage('Unable to delete drugs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      status: 'All',
      category: ''
    });
    setStatusFilter('All');
    setSearchTerm('');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      status: 'Active',
      description: '',
      ctdStructure: 'ectd'
    });
    setFieldErrors({});
  };

  // Compatibility handlers for component
  const handleAddDrug = async (): Promise<boolean> => {
    if (!formData.name?.trim()) {
      setFieldErrors({ name: 'Drug name is required' });
      return false;
    }
    const success = await handleSave();
    if (success) resetForm();
    return success ?? false;
  };

  const openEditDrug = (drug: IDrug) => {
    openEditPanel(drug);
  };

  const handleEditDrug = async (): Promise<boolean> => {
    if (!formData.name?.trim()) {
      setFieldErrors({ name: 'Drug name is required' });
      return false;
    }
    const success = await handleSave();
    if (success) resetForm();
    return success ?? false;
  };

  const handleDeleteDrug = (drug: IDrug) => {
    openDeleteDialog([drug.id]);
  };

  const confirmDeleteDrug = async () => {
    await handleDeleteConfirm();
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length > 0) {
      openDeleteDialog(selectedIds);
    }
  };

  // Calculate stats
  const totalDrugs = drugs.length;
  const activeDrugs = drugs.filter(d => d.status === 'Active').length;
  const inactiveDrugs = drugs.filter(d => d.status === 'Inactive').length;
  const inDevelopmentDrugs = drugs.filter(d => d.status === 'In Development').length;

  return {
    drugs,
    filteredDrugs,
    selectedIds,
    searchTerm,
    filters,
    isPanelOpen,
    panelMode,
    formData,
    editingDrug,
    isDeleteDialogOpen,
    deleteIds,
    isLoading,
    errorMessage,
    successMessage,
    categories,
    totalDrugs,
    activeDrugs,
    inactiveDrugs,
    inDevelopmentDrugs,
    setSelectedIds,
    setSearchTerm,
    setFilters,
    setFormData,
    openAddPanel,
    openEditPanel,
    openViewPanel,
    closePanel,
    handleSave,
    openDeleteDialog,
    handleDeleteConfirm,
    resetFilters,
    loadDrugs,
    setIsDeleteDialogOpen,
    // Additional properties for component compatibility
    statusFilter,
    statusOptions,
    fieldErrors,
    setStatusFilter,
    resetForm,
    handleAddDrug,
    openEditDrug,
    handleEditDrug,
    handleDeleteDrug,
    confirmDeleteDrug,
    handleBulkDelete
  };
}
