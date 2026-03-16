import * as React from 'react';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { ICTDFolder } from '../../../../../../Service/Service';

export interface CTDFolderNode extends ICTDFolder {
  children?: CTDFolderNode[];
  isExpanded?: boolean;
  code?: string;
  description?: string;
  // Alias for compatibility with component
  parentId?: string;
}

export function CreateCTDFolderData() {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider } = appGlobalState;

  const [folders, setFolders] = React.useState<CTDFolderNode[]>([]);
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  // Form fields for compatibility with component
  const [selectedParent, setSelectedParent] = React.useState<string>('');
  const [newFolderCode, setNewFolderCode] = React.useState<string>('');
  const [newFolderName, setNewFolderName] = React.useState<string>('');
  const [newFolderDescription, setNewFolderDescription] = React.useState<string>('');
  const [newFolderSortOrder, setNewFolderSortOrder] = React.useState<string>('');
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [requiredDialogHidden, setRequiredDialogHidden] = React.useState(true);
  const [requiredFields, setRequiredFields] = React.useState<string[]>([]);

  // Panel state
  const [isPanelOpen, setIsPanelOpen] = React.useState(false);
  const [panelMode, setPanelMode] = React.useState<'add' | 'edit' | 'view'>('add');
  const [editingFolder, setEditingFolder] = React.useState<CTDFolderNode | null>(null);
  const [parentFolderId, setParentFolderId] = React.useState<string | undefined>(undefined);
  const [formData, setFormData] = React.useState<Partial<ICTDFolder>>({
    name: '',
    folderId: '',
    parentFolderId: undefined,
    sortOrder: 0,
    isFolder: true
  });

  // Delete dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [folderToDelete, setFolderToDelete] = React.useState<CTDFolderNode | null>(null);

  // Loading and messages
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  // Parent options for dropdown
  const parentOptions: { value: string; label: string }[] = React.useMemo(() => {
    const options: { value: string; label: string }[] = [{ value: '', label: 'No Parent (Root)' }];
    const flatten = (nodes: CTDFolderNode[]): CTDFolderNode[] => {
      return nodes.reduce((acc, node) => {
        acc.push(node);
        if (node.children) {
          acc.push(...flatten(node.children));
        }
        return acc;
      }, [] as CTDFolderNode[]);
    };
    flatten(folders).forEach(folder => {
      options.push({
        value: folder.folderId || String(folder.id),
        label: folder.name
      });
    });
    return options;
  }, [folders]);

  const loadFolders = React.useCallback(async () => {
    if (!provider) {
      // Mock data for development
      const mockFolders: CTDFolderNode[] = [
        {
          id: 1,
          folderId: 'm1',
          code: 'm1',
          name: 'Module 1: Administrative Information',
          sortOrder: 1,
          isFolder: true,
          children: [
            { id: 2, folderId: 'm1.1', code: 'm1.1', name: '1.1 Table of Contents', parentFolderId: 'm1', parentId: 'm1', sortOrder: 1, isFolder: true },
            { id: 3, folderId: 'm1.2', code: 'm1.2', name: '1.2 Application Form', parentFolderId: 'm1', parentId: 'm1', sortOrder: 2, isFolder: true },
            { id: 4, folderId: 'm1.3', code: 'm1.3', name: '1.3 Prescribing Information', parentFolderId: 'm1', parentId: 'm1', sortOrder: 3, isFolder: true }
          ]
        },
        {
          id: 5,
          folderId: 'm2',
          code: 'm2',
          name: 'Module 2: Common Technical Document Summaries',
          sortOrder: 2,
          isFolder: true,
          children: [
            { id: 6, folderId: 'm2.1', code: 'm2.1', name: '2.1 CTD Table of Contents', parentFolderId: 'm2', parentId: 'm2', sortOrder: 1, isFolder: true },
            { id: 7, folderId: 'm2.2', code: 'm2.2', name: '2.2 Introduction', parentFolderId: 'm2', parentId: 'm2', sortOrder: 2, isFolder: true },
            { id: 8, folderId: 'm2.3', code: 'm2.3', name: '2.3 Quality Overall Summary', parentFolderId: 'm2', parentId: 'm2', sortOrder: 3, isFolder: true }
          ]
        },
        {
          id: 9,
          folderId: 'm3',
          code: 'm3',
          name: 'Module 3: Quality',
          sortOrder: 3,
          isFolder: true,
          children: [
            { id: 10, folderId: 'm3.1', code: 'm3.1', name: '3.1 Table of Contents', parentFolderId: 'm3', parentId: 'm3', sortOrder: 1, isFolder: true },
            { id: 11, folderId: 'm3.2', code: 'm3.2', name: '3.2 Body of Data', parentFolderId: 'm3', parentId: 'm3', sortOrder: 2, isFolder: true }
          ]
        }
      ];
      setFolders(mockFolders);
      return;
    }

    setIsLoading(true);
    try {
      const data = await provider.getCTDFolders();
      // Build tree structure
      const buildTree = (items: ICTDFolder[], parentFolderId?: string): CTDFolderNode[] => {
        return items
          .filter(item => item.parentFolderId === parentFolderId)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(item => ({
            ...item,
            code: item.folderId,
            parentId: item.parentFolderId,
            children: buildTree(items, item.folderId),
            isExpanded: false
          }));
      };
      setFolders(buildTree(data));
      setErrorMessage('');
    } catch (error) {
      console.error('Failed to load CTD folders:', error);
      setErrorMessage('Unable to load CTD folders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  React.useEffect(() => {
    void loadFolders();
  }, [loadFolders]);

  const toggleFolder = (folderId: string) => {
    const toggleInTree = (nodes: CTDFolderNode[]): CTDFolderNode[] => {
      return nodes.map(node => {
        if (node.folderId === folderId) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: toggleInTree(node.children) };
        }
        return node;
      });
    };
    setFolders(toggleInTree(folders));
  };

  const openAddPanel = (parentId?: string) => {
    setPanelMode('add');
    setEditingFolder(null);
    setParentFolderId(parentId);
    setFormData({
      name: '',
      folderId: '',
      parentFolderId: parentId,
      sortOrder: 0,
      isFolder: true
    });
    setIsPanelOpen(true);
  };

  const openEditPanel = (folder: CTDFolderNode) => {
    setPanelMode('edit');
    setEditingFolder(folder);
    setFormData({
      name: folder.name,
      folderId: folder.folderId,
      parentFolderId: folder.parentFolderId,
      sortOrder: folder.sortOrder,
      isFolder: folder.isFolder
    });
    setIsPanelOpen(true);
  };

  const openViewPanel = (folder: CTDFolderNode) => {
    setPanelMode('view');
    setEditingFolder(folder);
    setFormData({
      name: folder.name,
      folderId: folder.folderId,
      parentFolderId: folder.parentFolderId,
      sortOrder: folder.sortOrder,
      isFolder: folder.isFolder
    });
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setEditingFolder(null);
    setParentFolderId(undefined);
    setFormData({
      name: '',
      folderId: '',
      parentFolderId: undefined,
      sortOrder: 0,
      isFolder: true
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name || formData.name.trim() === '') {
      setErrorMessage('Folder name is required.');
      return false;
    }
    if (!formData.folderId || formData.folderId.trim() === '') {
      setErrorMessage('Folder ID is required.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (!provider) {
      setSuccessMessage('Demo mode: Folder saved locally.');
      closePanel();
      return;
    }

    setIsLoading(true);
    try {
      if (panelMode === 'add') {
        await provider.createCTDFolder(formData as Omit<ICTDFolder, 'id'>);
        setSuccessMessage('Folder created successfully.');
      } else if (panelMode === 'edit' && editingFolder) {
        await provider.updateCTDFolder(editingFolder.id, formData);
        setSuccessMessage('Folder updated successfully.');
      }
      await loadFolders();
      closePanel();
    } catch (error) {
      console.error('Failed to save folder:', error);
      setErrorMessage('Unable to save folder. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteDialog = (folder: CTDFolderNode) => {
    setFolderToDelete(folder);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!folderToDelete) return;
    if (!provider) {
      setSuccessMessage('Demo mode: Folder deleted locally.');
      setIsDeleteDialogOpen(false);
      setFolderToDelete(null);
      return;
    }

    setIsLoading(true);
    try {
      await provider.deleteCTDFolder(folderToDelete.id);
      setSuccessMessage('Folder deleted successfully.');
      await loadFolders();
      setIsDeleteDialogOpen(false);
      setFolderToDelete(null);
    } catch (error) {
      console.error('Failed to delete folder:', error);
      setErrorMessage('Unable to delete folder. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Compatibility handlers for component expectations
  const handleCreateFolder = async (): Promise<boolean> => {
    const errors: Record<string, string> = {};
    if (!newFolderName.trim()) errors.name = 'Folder name is required';
    if (!newFolderCode.trim()) errors.code = 'Folder code is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    setIsLoading(true);
    try {
      if (provider) {
        await provider.createCTDFolder({
          name: newFolderName,
          folderId: newFolderCode,
          parentFolderId: selectedParent || undefined,
          sortOrder: Number(newFolderSortOrder) || 0,
          isFolder: true
        });
      }
      setSuccessMessage('Folder created successfully');
      await loadFolders();
      // Reset form
      setNewFolderCode('');
      setNewFolderName('');
      setNewFolderDescription('');
      setNewFolderSortOrder('');
      setSelectedParent('');
      setFieldErrors({});
      return true;
    } catch (error) {
      setErrorMessage('Failed to create folder');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditConfirm = async (): Promise<boolean> => {
    if (!editingFolder) return false;

    const errors: Record<string, string> = {};
    if (!newFolderName.trim()) errors.name = 'Folder name is required';
    if (!newFolderCode.trim()) errors.code = 'Folder code is required';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }

    setIsLoading(true);
    try {
      if (provider) {
        await provider.updateCTDFolder(editingFolder.id, {
          name: newFolderName || editingFolder.name,
          folderId: newFolderCode || editingFolder.folderId,
          parentFolderId: selectedParent || editingFolder.parentFolderId,
          sortOrder: Number(newFolderSortOrder) || editingFolder.sortOrder,
          isFolder: true
        });
      }
      setSuccessMessage('Folder updated successfully');
      await loadFolders();
      return true;
    } catch (error) {
      setErrorMessage('Failed to update folder');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (folder: CTDFolderNode) => {
    setFolderToDelete(folder);
    setIsDeleteDialogOpen(true);
  };

  const flattenFolders = (nodes: CTDFolderNode[]): CTDFolderNode[] => {
    const result: CTDFolderNode[] = [];
    const traverse = (items: CTDFolderNode[]) => {
      items.forEach(item => {
        result.push(item);
        if (item.children) {
          traverse(item.children);
        }
      });
    };
    traverse(nodes);
    return result;
  };

  const getFolderPath = (folderId: string): string => {
    const allFolders = flattenFolders(folders);
    const folder = allFolders.find(f => f.folderId === folderId);
    if (!folder) return '';
    if (!folder.parentFolderId) return folder.name;
    return `${getFolderPath(folder.parentFolderId)} > ${folder.name}`;
  };

  const filteredFolders = React.useMemo(() => {
    if (!searchTerm) return folders;

    const filterNodes = (nodes: CTDFolderNode[]): CTDFolderNode[] => {
      return nodes.reduce((acc: CTDFolderNode[], node) => {
        const matches = node.name.toLowerCase().includes(searchTerm.toLowerCase());
        const filteredChildren = node.children ? filterNodes(node.children) : [];

        if (matches || filteredChildren.length > 0) {
          acc.push({
            ...node,
            children: filteredChildren,
            isExpanded: true
          });
        }
        return acc;
      }, []);
    };

    return filterNodes(folders);
  }, [folders, searchTerm]);

  return {
    folders,
    filteredFolders,
    selectedFolderId,
    searchTerm,
    isPanelOpen,
    panelMode,
    formData,
    editingFolder,
    parentFolderId,
    isDeleteDialogOpen,
    folderToDelete,
    isLoading,
    errorMessage,
    successMessage,
    setSelectedFolderId,
    setSearchTerm,
    setFormData,
    toggleFolder,
    openAddPanel,
    openEditPanel,
    openViewPanel,
    closePanel,
    handleSave,
    openDeleteDialog,
    handleDeleteConfirm,
    loadFolders,
    getFolderPath,
    flattenFolders,
    setIsDeleteDialogOpen,
    // Additional properties for component compatibility
    selectedParent,
    newFolderCode,
    newFolderName,
    newFolderDescription,
    newFolderSortOrder,
    fieldErrors,
    requiredDialogHidden,
    requiredFields,
    parentOptions,
    setSelectedParent,
    setNewFolderCode,
    setNewFolderName,
    setNewFolderDescription,
    setNewFolderSortOrder,
    setRequiredDialogHidden,
    handleCreateFolder,
    handleEditConfirm,
    handleDeleteClick
  };
}
