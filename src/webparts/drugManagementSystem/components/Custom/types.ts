/**
 * Common types for Drug Management System components
 */

// Document types
export interface Document {
  id: number;
  name: string;
  fileName?: string;
  fileRef?: string;
  category?: string;
  categoryId?: number;
  drugName?: string;
  drugId?: number;
  status: DocumentStatus;
  lastModified?: string;
  author?: string;
  authorId?: number;
  reviewer?: string;
  reviewerId?: number;
  approver?: string;
  approverId?: number;
  comments?: Comment[];
  ctdFolder?: string;
  ctdModule?: string;
  submodule?: string;
  template?: string;
  templateId?: number;
  content?: string;
  version?: number;
  createdDate?: string;
  modifiedDate?: string;
  sentBy?: string;
  sharePointUrl?: string;
  isDeleted?: boolean;
  isEmailSend?: boolean;
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: string;
}

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  roles?: string[];
  groups?: string[];
  status: 'Active' | 'Inactive';
  department?: string;
  projectName?: string;
  permissions?: string[];
}

// Category types
export interface Category {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  level: number;
  status: 'Active' | 'Inactive';
  documentCategory?: string;
  group?: string;
  subGroup?: string;
  artifactName?: string;
  templateName?: string;
  ctdModule?: string;
  ectdSection?: string;
  mappedCTDFolderId?: number;
  eCTDSectionId?: number;
  eCTDSubsection?: string;
  mappingType?: 'eCTD' | 'GMP' | 'None';
  uploadDate?: string;
  fileRef?: string;
}

// CTD Folder types
export interface CTDFolder {
  id: any;
  folderId: string;
  name: string;
  parentFolderId?: string;
  sortOrder: number;
  isFolder: boolean;
  code?: string;
  description?: string;
  parentId?: string;
  children?: CTDFolder[];
  icon?: string;
  documentCount?: number;
}

// Drug types
export interface Drug {
  id: number;
  name: string;
  category?: string;
  status: 'Active' | 'Inactive' | 'In Development';
  description?: string;
  ctdStructure?: 'ectd' | 'dossier';
}

// Template types
export interface Template {
  id: number;
  name: string;
  category?: string;
  subCategory?: string;
  description?: string;
  fileRef?: string;
  fileName?: string;
  uploadDate?: string;
  uploadedBy?: string;
  version?: string;
  status?: 'Active' | 'Inactive';
  ctdModule?: string;
  ectdSection?: string;
  isEctdMapped?: boolean;
  mappingType?: 'eCTD' | 'GMP' | 'TMF' | 'None';
  mappedCTDFolderId?: number;
  ectdSectionId?: number;
  mappedGMPModelId?: number;
  mappedTMFFolderId?: number;
  // Additional properties for component compatibility
  country?: string;
  countryId?: number;
  categoryId?: number;
  mappedCTDFolder?: string;
  eCTDSection?: string;
  ectdSubsection?: string;
  serverRedirectedEmbedUrl?: string;
}

// Workflow types
export interface WorkflowApproval {
  id: number;
  documentId: number;
  documentName?: string;
  requestedBy?: string;
  requestedById?: number;
  approver?: string;
  approverId?: number;
  decision?: 'Approved' | 'Rejected';
  decisionComment?: string;
  requestedOn?: string;
  decidedOn?: string;
  cycle: number;
  status?: string;
  comments?: string;
  submittedDate?: string;
  decidedDate?: string;
}

// Audit Log types
export interface AuditLog {
  id: number;
  action: string;
  user: string;
  userId?: number;
  timestamp: string;
  details?: string;
  entityType?: string;
  entityId?: number;
}

// Pagination types
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

// Filter types
export interface FilterOption {
  key: string;
  text: string;
}

// Chart data types
export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TrendData {
  month: string;
  documents: number;
  approved: number;
  rejected: number;
}

// Report stats
export interface ReportStats {
  totalDocuments: number;
  draftCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  approvalRate: number;
}

// Form field types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'dropdown' | 'multiline' | 'date' | 'number' | 'checkbox';
  required?: boolean;
  options?: FilterOption[];
  placeholder?: string;
}

// File upload types
export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  content?: ArrayBuffer;
  file?: File;
}

// Role types
export type UserRole = 'Admin' | 'HR' | 'Author' | 'Approver' | 'Reviewer';

// Status types
export type DocumentStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected' | 'Final' | 'Signed' | 'Initiate for Signature' | 'In Review' | 'Revision' | 'Pending for Signature';
export type DrugStatus = 'Active' | 'Inactive' | 'In Development';
export type CategoryStatus = 'Active' | 'Inactive';

// Version History types
export interface VersionHistory {
  id?: number;
  version: string;
  modifiedBy: string;
  modifiedDate: string;
  changes: string;
}
