import * as React from 'react';
// Badge styling comes from shared CSS classes in styles.css (no SCSS modules).

export type StatusType = 
  | 'active' 
  | 'inactive' 
  | 'pending' 
  | 'draft' 
  | 'approved' 
  | 'rejected'
  | 'signed'
  | 'final'
  | 'inReview';

interface StatusBadgeProps {
  status: string;
  size?: 'small' | 'medium' | 'large';
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: 'Active', className: 'status-active' },
  inactive: { label: 'Inactive', className: 'status-inactive' },
  pending: { label: 'Pending', className: 'status-pending' },
  'pending approval': { label: 'Pending Approval', className: 'status-pending' },
  draft: { label: 'Draft', className: 'status-draft' },
  approved: { label: 'Approved', className: 'status-approved' },
  rejected: { label: 'Rejected', className: 'status-rejected' },
  signed: { label: 'Signed', className: 'status-approved' },
  final: { label: 'Final', className: 'status-approved' },
  inreview: { label: 'In Review', className: 'status-pending' },
  'in review': { label: 'In Review', className: 'status-pending' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  size = 'medium' 
}) => {
  const normalizedStatus = status?.toLowerCase().replace(/\s+/g, '') || 'draft';
  const config = statusConfig[normalizedStatus] || statusConfig['draft'];
  
  return (
    <span className={`status-badge ${config.className} status-${size}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
