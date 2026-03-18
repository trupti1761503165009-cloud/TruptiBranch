/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import * as CamlBuilder from 'camljs';
import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { Document, User } from '../../../types';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { ListNames } from '../../../../../../Shared/Enum/ListNames';


export type AdminDashboardSortField = 'name' | 'category' | 'author' | 'status' | 'lastModified';
export type AdminDashboardSortDirection = 'asc' | 'desc';

export interface AdminDashboardDataState {
  stats: {
    totalDocuments: number;
    templates: number;
    categories: number;
    users: number;
    reviewPending: number;
    approved: number;
  };
  recentDocuments: Document[];
  recentUsers: User[];
  sortedDocuments: Document[];
  sortField: AdminDashboardSortField;
  sortDirection: AdminDashboardSortDirection;
  isViewModalOpen: boolean;
  isEditing: boolean;
  editName: string;
  editCategory: string;
  isWizardOpen: boolean;
  isViewerOpen: boolean;
  isSignatureModalOpen: boolean;
  viewingDocument: Document | null;
  signature: string;
}

export function AdminDashboardData() {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider, currentUser } = appGlobalState;
  const [stats, setStats] = useState<AdminDashboardDataState['stats']>({
    totalDocuments: 0,
    templates: 0,
    categories: 0,
    users: 0,
    reviewPending: 0,
    approved: 0
  });
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [sortedDocuments, setSortedDocuments] = useState<Document[]>([]);
  const [sortField, setSortField] = useState<AdminDashboardSortField>('lastModified');
  const [sortDirection, setSortDirection] = useState<AdminDashboardSortDirection>('desc');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [signature, setSignature] = useState('');
  const [categoryLookup, setCategoryLookup] = useState<Record<string, number>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const parseLookupText = (value: any): string => {
    if (!value) return '';
    if (Array.isArray(value) && value.length > 0) {
      return value[0]?.lookupValue ?? value[0]?.Title ?? value[0]?.title ?? value[0]?.Name ?? '';
    }
    if (typeof value === 'string') return value.split(';#').filter(Boolean)[0] ?? value;
    if (typeof value === 'object') return value.lookupValue ?? value.Title ?? value.title ?? value.Name ?? '';
    return String(value);
  };

  const loadData = async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const docsQuery = new CamlBuilder()
        .View(['ID', 'FileLeafRef', 'Modified', 'Status', 'Author', 'Category', 'CategoryId'])
        .RowLimit(5000, true)
        .Query();
      docsQuery.OrderByDesc('Modified');
      const templatesQuery = new CamlBuilder().View(['ID']).RowLimit(5000, true).Query();
      const categoriesQuery = new CamlBuilder().View(['ID', 'Title']).RowLimit(5000, true).Query();
      categoriesQuery.OrderBy('Title');


      const [docs, templates, categories, adminUsers, hrUsers, authorUsers] = await Promise.all([
        provider.getItemsByCAMLQuery(ListNames.DMSDocuments, docsQuery.ToString()),
        provider.getItemsByCAMLQuery(ListNames.Templates, templatesQuery.ToString()),
        provider.getItemsByCAMLQuery(ListNames.Categories, categoriesQuery.ToString()),
        provider.getUsersFromGroup('Admin').catch(() => []),
        provider.getUsersFromGroup('HR').catch(() => []),
        provider.getUsersFromGroup('Author').catch(() => []),
      ]);

      const mappedDocs = (docs || []).map((item: any) => ({
        id: Number(item.ID),
        name: item.FileLeafRef || item.Title || 'Untitled',
        category: parseLookupText(item.Category),
        status: item.Status || 'Draft',
        lastModified: item.Modified ? new Date(item.Modified).toISOString().split('T')[0] : '',
        author: parseLookupText(item.Author)
      }));

      // Merge users from groups
      const userMap = new Map<number, User>();
      const addUsers = (userList: any[], role: string) => {
        userList.forEach(u => {
          if (!userMap.has(u.value)) {
            userMap.set(u.value, {
              id: u.value,
              name: u.label || 'User',
              email: u.email || '',
              role: role,
              status: 'Active'
            });
          }
        });
      };

      addUsers(adminUsers, 'Admin');
      addUsers(hrUsers, 'HR');
      addUsers(authorUsers, 'Author');

      const mappedUsers = Array.from(userMap.values());

      setStats({
        totalDocuments: mappedDocs.length,
        templates: (templates || []).length,
        categories: (categories || []).length,
        users: mappedUsers.filter(u => u.status === 'Active').length,
        reviewPending: mappedDocs.filter(doc => ['Pending Approval', 'In Review'].includes(doc.status)).length,
        approved: mappedDocs.filter(doc => ['Approved', 'Final', 'Signed'].includes(doc.status)).length
      });
      setCategoryLookup(
        (categories || []).reduce((acc: Record<string, number>, item: any) => {
          if (item.Title) acc[item.Title] = item.ID;
          return acc;
        }, {})
      );
      setRecentDocuments(mappedDocs);
      setRecentUsers(mappedUsers.filter(u => u.status === 'Active'));
      setErrorMessage('');
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
      setErrorMessage('Unable to load dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  const sortDocuments = () => {
    const sorted = [...recentDocuments].sort((a, b) => {
      let aValue: any = (a as any)[sortField];
      let bValue: any = (b as any)[sortField];

      if (sortField === 'lastModified') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = (aValue || '').toLowerCase();
        bValue = (bValue || '').toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    setSortedDocuments(sorted);
  };

  useEffect(() => {
    void (async function (): Promise<void> {
      await loadData();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  useEffect(() => {
    sortDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recentDocuments, sortField, sortDirection]);

  const handleSort = (field: AdminDashboardSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSaveChanges = async () => {
    if (viewingDocument) {
      if (!provider) return;
      const categoryId = categoryLookup[editCategory];
      setIsLoading(true);
      try {
        await provider.updateItem(
          {
            FileLeafRef: editName,
            CategoryId: categoryId || null
          },
          ListNames.DMSDocuments,
          viewingDocument.id
        );
        setIsEditing(false);
        await loadData();
        setIsViewModalOpen(false);
        setSuccessMessage('Document updated successfully.');
      } catch (error) {
        console.error('Failed to update document:', error);
        setErrorMessage('Unable to update document.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const [isDeleteDocModalOpen, setIsDeleteDocModalOpen] = useState(false);

  const handleDeleteDocument = () => {
    if (viewingDocument) {
      setIsDeleteDocModalOpen(true);
    }
  };

  const confirmDeleteDocument = async () => {
    if (!viewingDocument || !provider) return;
    setIsLoading(true);
    try {
      await provider.deleteItem(ListNames.DMSDocuments, viewingDocument.id);
      setIsDeleteDocModalOpen(false);
      setIsViewModalOpen(false);
      setViewingDocument(null);
      await loadData();
      setSuccessMessage('Document deleted successfully.');
    } catch (error) {
      console.error('Failed to delete document:', error);
      setErrorMessage('Unable to delete document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDocument = async (docId: number, updates: Record<string, any>) => {
    if (!provider) return;
    setIsLoading(true);
    try {
      await provider.updateItem(updates, ListNames.DMSDocuments, docId);
      await loadData();
      setSuccessMessage('Document updated successfully.');
    } catch (error) {
      console.error('Failed to update document:', error);
      setErrorMessage('Unable to update document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDocument = (doc: Document) => {
    setViewingDocument(doc);
    setIsViewModalOpen(true);
  };

  const handleFinalApprove = async () => {
    if (viewingDocument && signature) {
      if (!provider) return;
      setIsLoading(true);
      try {
        await provider.updateItem(
          {
            Status: 'Final',
            IsEmailSend: '1',
            ApproverId: currentUser?.userId || null
          },
          ListNames.DMSDocuments,
          viewingDocument.id
        );
        await loadData();
        setIsSignatureModalOpen(false);
        setSignature('');
        setViewingDocument(null);
        setSuccessMessage('Document finalized with signature.');
      } catch (error) {
        console.error('Failed to finalize document:', error);
        setErrorMessage('Unable to finalize document.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getSortIcon = (field: AdminDashboardSortField) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  return {
    stats,
    recentUsers,
    sortedDocuments,
    isViewModalOpen,
    isEditing,
    editName,
    editCategory,
    isWizardOpen,
    isSignatureModalOpen,
    viewingDocument,
    signature,
    errorMessage,
    successMessage,
    isLoading,
    setIsViewModalOpen,
    setIsEditing,
    setEditName,
    setEditCategory,
    setIsWizardOpen,
    setIsSignatureModalOpen,
    setViewingDocument,
    setSignature,
    loadData,
    handleSort,
    handleSaveChanges,
    handleDeleteDocument,
    confirmDeleteDocument,
    isDeleteDocModalOpen,
    setIsDeleteDocModalOpen,
    handleUpdateDocument,
    handleOpenDocument,
    handleFinalApprove,
    getSortIcon
  };
}

