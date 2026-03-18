import * as React from 'react';
import { Breadcrumb } from '../../../Common/Breadcrumb/Breadcrumb';
import { MemoizedDataGridComponent } from '../../../Common/DetailList/DataGridComponent';
import { SummaryCard } from '../../../Common/SummaryCard/SummaryCard';
import { Loader } from '../../../Common/Loader/Loader';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../jotai/appGlobalStateAtom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowsRotate, faClipboardList, faHourglassHalf, faSearch } from '@fortawesome/free-solid-svg-icons';
import { Link } from '@fluentui/react/lib/Link';
import { TooltipHost } from '@fluentui/react/lib/Tooltip';
import ReactDropdown from '../../../Common/ReactSelectDropdown';
import type { Document } from '../../types';

export const ApproverDashboard: React.FC = () => {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider, currentUser } = appGlobalState;

  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState('All');
  const [searchTerm, setSearchTerm] = React.useState('');

  const loadData = React.useCallback(async () => {
    if (!provider) return;
    setIsLoading(true);
    try {
      const result = await provider.getDocuments();

      const currentUserId = Number((currentUser as any)?.userId || (currentUser as any)?.Id || 0) || 0;

      const docs: (Document & { approverId?: number })[] = (result || []).map((item: any) => ({
        id: item.id ?? item.ID ?? item.Id,
        name: item.name ?? item.Title ?? '',
        category: item.category ?? item.Category ?? '',
        drugName: item.drugName ?? (typeof item.Drug === 'string' ? item.Drug : item.Drug?.Title) ?? '',
        status: item.status ?? item.Status ?? 'Draft',
        author: item.author ?? item.Author?.Title ?? '',
        lastModified: item.lastModified ?? item.Modified ?? '',
        ctdModule: item.ctdModule ?? item.CTDModule ?? '',
        version: item.version ?? item.Version ?? 1,
        approverId: item.approverId ?? item.ApproverId ?? item.Approver?.Id ?? 0
      }));

      const pendingDocs = docs.filter(d =>
        (d.approverId || 0) === currentUserId &&
        (d.status === 'Pending Approval' || d.status === 'In Review')
      );
      setDocuments(pendingDocs);
    } catch (err) {
      console.error('ApproverDashboard: Error loading data', err);
    } finally {
      setIsLoading(false);
    }
  }, [provider, currentUser]);

  React.useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredDocuments = React.useMemo(() => {
    let filtered = documents;
    if (statusFilter !== 'All') {
      filtered = filtered.filter(d => d.status === statusFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(term) ||
        (d.drugName || '').toLowerCase().includes(term) ||
        (d.category || '').toLowerCase().includes(term) ||
        (d.author || '').toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [documents, statusFilter, searchTerm]);

  const pendingCount = documents.filter(d => d.status === 'Pending Approval').length;
  const inReviewCount = documents.filter(d => d.status === 'In Review').length;

  const statusOptions = [
    { label: 'All Status', value: 'All' },
    { label: 'Pending Approval', value: 'Pending Approval' },
    { label: 'In Review', value: 'In Review' }
  ];

  const columns: any[] = [
    { key: 'name', name: 'DOCUMENT NAME', fieldName: 'name', minWidth: 200, isSortingRequired: true },
    { key: 'drugName', name: 'DRUG', fieldName: 'drugName', minWidth: 120, isSortingRequired: true },
    { key: 'category', name: 'CATEGORY', fieldName: 'category', minWidth: 120, isSortingRequired: true },
    { key: 'author', name: 'SUBMITTED BY', fieldName: 'author', minWidth: 120, isSortingRequired: true },
    {
      key: 'status', name: 'STATUS', fieldName: 'status', minWidth: 120,
      onRender: (item: any) => (
        <span className={`status-badge status-${(item.status || 'draft').toLowerCase().replace(/\s+/g, '-')}`}>
          {item.status}
        </span>
      )
    },
    {
      key: 'version', name: 'VERSION', fieldName: 'version', minWidth: 80,
      onRender: (item: any) => <span>v{item.version || 1}</span>
    },
    {
      key: 'lastModified', name: 'DATE', fieldName: 'lastModified', minWidth: 100, isSortingRequired: true,
      onRender: (item: any) => {
        if (!item.lastModified) return <span>-</span>;
        try { return <span>{new Date(item.lastModified).toLocaleDateString()}</span>; }
        catch { return <span>{item.lastModified}</span>; }
      }
    }
  ];

  return (
    <div className="approver-dashboard" data-testid="approver-dashboard">
      {isLoading && <Loader />}
      <Breadcrumb items={[
        { label: 'Home', onClick: () => { } },
        { label: 'Approval Queue', isActive: true }
      ]} />
      <div className="page-header">
        <h1 className="mainTitle">Approval Queue</h1>
      </div>
      <div className="summary-cards-container">
        <SummaryCard title="Total Pending" value={documents.length} icon={faClipboardList} color="blue" />
        <SummaryCard title="Pending Approval" value={pendingCount} icon={faHourglassHalf} color="orange" />
        <SummaryCard title="In Review" value={inReviewCount} icon={faSearch} color="purple" />
      </div>

      {/* Filters row (below cards, above grid) */}
      <div className="ms-Grid mt-3">
        <div className="ms-Grid-row ptop-5">
          <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl3">
            <div className="formControl ims-site-pad">
              <div className="formControl">
                <ReactDropdown
                  name="statusFilter"
                  options={statusOptions}
                  defaultOption={{ value: statusFilter, label: statusFilter === 'All' ? 'All Status' : statusFilter }}
                  onChange={(opt: any) => setStatusFilter(opt?.value ?? 'All')}
                  isCloseMenuOnSelect={true}
                  isSorted={false}
                  isClearable={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="boxCard">
        <MemoizedDataGridComponent
          items={filteredDocuments}
          columns={columns}
          reRenderComponent={true}
          searchable={true}
          isPagination={true}
          isAddNew={true}
          addNewContent={
            <div className="dflex pb-1">
              <Link className="actionBtn iconSize btnRefresh icon-mr" onClick={loadData}>
                <TooltipHost content="Refresh Grid">
                  <FontAwesomeIcon icon={faArrowsRotate} />
                </TooltipHost>
              </Link>
            </div>
          }
        />
      </div>
    </div>
  );
};
