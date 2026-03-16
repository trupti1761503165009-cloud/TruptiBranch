export interface IComment {
  userId: string;
  text: string;
  timestamp: Date;
}

export interface IDocument {
  id: string;
  templateId: string;
  authorId: string;
  metadata: Record<string, string>;
  status: 'Draft' | 'Submitted' | 'Reviewed' | 'Approved' | 'Rejected';
  comments: IComment[];
  approvalSignature: string | null;
  createdDate: Date;
  modifiedDate: Date;
}
