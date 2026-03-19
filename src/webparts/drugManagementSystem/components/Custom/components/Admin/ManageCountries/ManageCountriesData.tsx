import * as React from 'react';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { ListNames } from '../../../../../../Shared/Enum/ListNames';

export interface ICountry {
  id: number;
  name: string;
  countryCode: string;
  region: string;
  isActive: boolean;
}

const emptyForm = (): Omit<ICountry, 'id'> => ({
  name: '',
  countryCode: '',
  region: '',
  isActive: true
});

export function ManageCountriesData() {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider } = appGlobalState;

  const [items, setItems] = React.useState<ICountry[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');

  const [panelMode, setPanelMode] = React.useState<'add' | 'edit' | 'view'>('add');
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ICountry | null>(null);
  const [formData, setFormData] = React.useState<Omit<ICountry, 'id'>>(emptyForm());
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<keyof Omit<ICountry, 'id'>, string>>>({});

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState<ICountry | null>(null);

  const loadItems = React.useCallback(async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const data = await provider.getItemsByQuery({
        listName: ListNames.Countries,
        select: ['ID', 'Title', 'CountryCode', 'Region', 'IsActive'],
        top: 1000,
        orderBy: 'Title',
        isSortOrderAsc: true
      });
      const mapped: ICountry[] = (data || []).map((item: any) => ({
        id: item.ID,
        name: item.Title || '',
        countryCode: item.CountryCode || '',
        region: item.Region || '',
        isActive: item.IsActive !== false && item.IsActive !== 0
      }));
      setItems(mapped);
      setErrorMessage('');
    } catch {
      setErrorMessage('Failed to load Countries. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  React.useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const filteredItems = React.useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return items;
    return items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.countryCode.toLowerCase().includes(q) ||
      i.region.toLowerCase().includes(q)
    );
  }, [items, searchTerm]);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof Omit<ICountry, 'id'>, string>> = {};
    if (!formData.name.trim()) errors.name = 'Country name is required.';
    if (!formData.countryCode.trim()) errors.countryCode = 'Country code is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const openAddPanel = () => {
    setFormData(emptyForm());
    setFieldErrors({});
    setEditingItem(null);
    setPanelMode('add');
    setIsPanelOpen(true);
  };

  const openEditPanel = (item: ICountry) => {
    setFormData({ name: item.name, countryCode: item.countryCode, region: item.region, isActive: item.isActive });
    setFieldErrors({});
    setEditingItem(item);
    setPanelMode('edit');
    setIsPanelOpen(true);
  };

  const openViewPanel = (item: ICountry) => {
    setFormData({ name: item.name, countryCode: item.countryCode, region: item.region, isActive: item.isActive });
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
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      if (panelMode === 'add') {
        if (provider) await provider.createItem(
          { Title: formData.name, CountryCode: formData.countryCode, Region: formData.region, IsActive: formData.isActive },
          ListNames.Countries
        );
        setSuccessMessage('Country added successfully.');
      } else if (panelMode === 'edit' && editingItem) {
        if (provider) await provider.updateItem(
          { Title: formData.name, CountryCode: formData.countryCode, Region: formData.region, IsActive: formData.isActive },
          ListNames.Countries,
          editingItem.id
        );
        setSuccessMessage('Country updated successfully.');
      }
      await loadItems();
      closePanel();
    } catch {
      setErrorMessage('Failed to save Country. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (item: ICountry) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      if (provider) await provider.deleteItem(ListNames.Countries, itemToDelete.id);
      setSuccessMessage('Country deleted successfully.');
      await loadItems();
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch {
      setErrorMessage('Failed to delete Country. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    filteredItems,
    isLoading,
    errorMessage,
    successMessage,
    searchTerm,
    panelMode,
    isPanelOpen,
    editingItem,
    formData,
    fieldErrors,
    isDeleteDialogOpen,
    itemToDelete,
    setSearchTerm,
    setFormData,
    setIsDeleteDialogOpen,
    setErrorMessage,
    setSuccessMessage,
    openAddPanel,
    openEditPanel,
    openViewPanel,
    closePanel,
    handleSave,
    openDeleteDialog,
    handleDeleteConfirm,
    loadItems
  };
}
