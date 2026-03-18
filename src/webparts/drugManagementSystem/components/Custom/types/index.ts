export interface Category {
  id: number;
  name: string;
  description: string;
  documents: number;
  status: 'Active' | 'Inactive';
  documentCategory?: string;
  group?: string;
  subGroup?: string;
  artifactName?: string;
  templateName?: string;
  artifactDescription?: string;
  ctdModule?: string; // Excel: CTD Module (M2/M3/M4...)
  ectdSection?: string; // Excel: eCTD Section (2.7...)
  ectdSubsection?: string; // Excel: eCTD Subsection (2.7.4...)
  ectdCode?: string; // Excel: eCTD Code (M2.7.4)
}

export interface Template {
  id: number;
  name: string;
  category: string;
  country?: string;
  uploadDate: string;
  status: 'Active' | 'Inactive';
  mappingType?: string;
  mappedCTDFolder?: string;
  mappedGMPModel?: string;
  eCTDSection?: string;
  eCTDSubsection?: string;
  isEctdMapped?: boolean;
  fileRef?: string;
  fileName?: string;
  categoryId?: number;
  countryId?: number;
  mappedCTDFolderId?: number;
  ectdSectionId?: number;
}

export interface Document {
  id: number;
  name: string;
  category: string;
  categoryId?: number;
  drugId?: number;
  drugName?: string;
  authorId?: number;
  status:
    | 'Draft'
    | 'In Review'
    | 'Revision'
    | 'Initiate for Signature'
    | 'Pending Approval'
    | 'Signed'
    | 'Final'
    | 'Approved'
    | 'Rejected';
  lastModified: string;
  author?: string;
  reviewer?: string;
  reviewerId?: number;
  approver?: string;
  approverId?: number;
  approverLoginName?: string;
  comments?: Comment[];
  ctdFolder?: string;
  ctdModule?: string;
  submodule?: string;
  template?: string;
  templateId?: number;
  content?: string;
  version?: number;
  createdDate?: string;
  createdBy?: string;
  sentBy?: string;
  sharePointUrl?:string;
  fileRef?: string;
  fileName?: string;
}

export interface Comment {
  id: number;
  author: string;
  text: string;
  timestamp: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'HR' | 'Author' | 'Approver';
  status: 'Active' | 'Inactive';
}

export interface CTDFolder {
  id: any;
  folderId: string;
  name: string;
  icon: string;
  documentCount: number;
  parentFolderId?: string;
  sortOrder: number;
  isFolder: boolean;
  code?: string;
  description?: string;
  parentId?: string;
  children?: CTDFolder[];
  statusCounts?: {
    draft: number;
    inReview: number;
    revision: number;
    initiateForSignature: number;
    approved: number;
    rejected: number;
  };
}

export interface VersionHistory {
  id: number;
  version: number;
  modifiedBy: string;
  modifiedDate: string;
  changes: string;
}

export interface DashboardStats {
  totalDocuments: number;
  templates: number;
  categories: number;
  users: number;
  reviewPending: number;
  approved: number;
}
