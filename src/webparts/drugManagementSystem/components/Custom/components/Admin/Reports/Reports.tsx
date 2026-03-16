import * as React from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, AreaChart
} from 'recharts';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { Pivot, PivotItem } from '@fluentui/react/lib/Pivot';
import ReactDropdown, { type IReactDropOptionProps } from '../../../../Common/ReactSelectDropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faChartLine, faChartPie, faEnvelope, faFileExcel, faFilePdf, faRotateRight, faTable, faFileAlt, faClock, faCheckCircle, faBan, faPercentage, faUsers } from '@fortawesome/free-solid-svg-icons';
import { ReportsData } from './ReportsData';
import { RequiredLabel } from '../../../../Common/RequiredLabel';
import { showToast } from '../../../../Common/Toast/toastBus';
import { SummaryCard } from '../../../../Common/SummaryCard/SummaryCard';
import { StatusBadge } from '../../../../Common/StatusBadge/StatusBadge';
import { Loader } from '../../../../Common/Loader/Loader';
import { Breadcrumb } from '../../../../Common/Breadcrumb/Breadcrumb';

export const Reports: React.FC = () => {
  const {
    categoryFilter,
    statusFilter,
    ctdFilter,
    templateFilter,
    dateRangeFilter,
    chartType,
    viewMode,
    categories,
    templates,
    ctdFolders,
    filteredDocuments,
    chartData,
    categorySummary,
    pieChartData,
    trendData,
    setCategoryFilter,
    setStatusFilter,
    setCtdFilter,
    setTemplateFilter,
    setDateRangeFilter,
    setChartType,
    setViewMode,
    handleExport,
    handleEmail,
    resetFilters,
    getStatusColor,
    isLoading
  } = ReportsData();

  const [activeReportTab, setActiveReportTab] = React.useState<string>('overview');

  const categoryOptions: IReactDropOptionProps[] = React.useMemo(
    () => [{ label: 'All Categories', value: 'All' }, ...categories.map(cat => ({ label: cat.name, value: cat.name }))],
    [categories]
  );
  const statusOptions: IReactDropOptionProps[] = React.useMemo(
    () => [
      { label: 'All Status', value: 'All' },
      { label: 'Draft', value: 'Draft' },
      { label: 'Pending Approval', value: 'Pending Approval' },
      { label: 'Approved', value: 'Approved' },
      { label: 'Rejected', value: 'Rejected' },
      { label: 'Signed', value: 'Signed' },
      { label: 'Final', value: 'Final' }
    ],
    []
  );
  const ctdOptions: IReactDropOptionProps[] = React.useMemo(
    () => [{ label: 'All CTD Folders', value: 'All' }, ...ctdFolders.map(folder => ({ label: folder.name, value: folder.id }))],
    [ctdFolders]
  );
  const templateOptions: IReactDropOptionProps[] = React.useMemo(
    () => [{ label: 'All Templates', value: 'All' }, ...templates.map(tmpl => ({ label: tmpl.name, value: tmpl.name }))],
    [templates]
  );
  const dateRangeOptions: IReactDropOptionProps[] = React.useMemo(
    () => [
      { label: 'All Time', value: 'All Time' },
      { label: 'Today', value: 'Today' },
      { label: 'Last 7 Days', value: 'Last 7 Days' },
      { label: 'Last 30 Days', value: 'Last 30 Days' },
      { label: 'This Month', value: 'This Month' },
      { label: 'This Year', value: 'This Year' }
    ],
    []
  );

  // Workflow metrics
  const workflowMetrics = React.useMemo(() => {
    const total = filteredDocuments.length;
    const draft = filteredDocuments.filter(d => d.status === 'Draft').length;
    const pending = filteredDocuments.filter(d => d.status === 'Pending Approval' || d.status === 'In Review').length;
    const approved = filteredDocuments.filter(d => d.status === 'Approved' || d.status === 'Signed' || d.status === 'Final').length;
    const rejected = filteredDocuments.filter(d => d.status === 'Rejected').length;
    
    return { total, draft, pending, approved, rejected };
  }, [filteredDocuments]);

  // Approval rate calculation
  const approvalRate = React.useMemo(() => {
    const completed = workflowMetrics.approved + workflowMetrics.rejected;
    if (completed === 0) return 0;
    return Math.round((workflowMetrics.approved / completed) * 100);
  }, [workflowMetrics]);

  const handleExportClick = (format: 'excel' | 'pdf') => {
    handleExport(format);
    showToast({ type: 'success', message: `Exporting to ${format.toUpperCase()}...` });
  };

  return (
    <div data-testid="reports-page">
      <Breadcrumb
        items={[
          { label: 'Home', onClick: () => {} },
          { label: 'Reports & Analytics', isActive: true }
        ]}
      />
      <div className="page-header">
        <h1 className="mainTitle">Reports & Analytics</h1>
      </div>

      {/* Loading Overlay */}
      {isLoading && <Loader />}

      {/* KPI Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 20 }}>
        <SummaryCard
          title="Total Documents"
          value={workflowMetrics.total}
          icon={faFileAlt}
          color="blue"
        />
        <SummaryCard
          title="In Draft"
          value={workflowMetrics.draft}
          icon={faClock}
          color="orange"
        />
        <SummaryCard
          title="Pending Approval"
          value={workflowMetrics.pending}
          icon={faUsers}
          color="purple"
        />
        <SummaryCard
          title="Approved/Final"
          value={workflowMetrics.approved}
          icon={faCheckCircle}
          color="green"
        />
        <SummaryCard
          title="Rejected"
          value={workflowMetrics.rejected}
          icon={faBan}
          color="red"
        />
        <SummaryCard
          title="Approval Rate"
          value={`${approvalRate}%`}
          icon={faPercentage}
          color="purple"
        />
      </div>

      {/* Filters Card */}
      <div className="table-card" style={{ marginBottom: '20px' }}>
        <div className="table-header" style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#212121' }}>
            Report Filters
          </h3>
        </div>

        <div className="ms-Grid" style={{ padding: 20 }}>
          <div className="ms-Grid-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end' }}>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3" style={{ flex: '1 1 200px', minWidth: 200, maxWidth: 280 }}>
              <RequiredLabel text="Category" required={false} />
              <ReactDropdown
                name="category"
                options={categoryOptions}
                defaultOption={categoryOptions.find(o => o.value === categoryFilter) ?? categoryOptions[0]}
                onChange={(opt) => setCategoryFilter(opt?.value ?? 'All')}
                isCloseMenuOnSelect={true}
                isSorted={true}
                isClearable={false}
              />
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3" style={{ flex: '1 1 200px', minWidth: 200, maxWidth: 280 }}>
              <RequiredLabel text="Status" required={false} />
              <ReactDropdown
                name="status"
                options={statusOptions}
                defaultOption={statusOptions.find(o => o.value === statusFilter) ?? statusOptions[0]}
                onChange={(opt) => setStatusFilter(opt?.value ?? 'All')}
                isCloseMenuOnSelect={true}
                isSorted={false}
                isClearable={false}
              />
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3" style={{ flex: '1 1 200px', minWidth: 200, maxWidth: 280 }}>
              <RequiredLabel text="CTD Folder" required={false} />
              <ReactDropdown
                name="ctdFolder"
                options={ctdOptions}
                defaultOption={ctdOptions.find(o => o.value === ctdFilter) ?? ctdOptions[0]}
                onChange={(opt) => setCtdFilter(opt?.value ?? 'All')}
                isCloseMenuOnSelect={true}
                isSorted={true}
                isClearable={false}
              />
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3" style={{ flex: '1 1 200px', minWidth: 200, maxWidth: 280 }}>
              <RequiredLabel text="Template" required={false} />
              <ReactDropdown
                name="template"
                options={templateOptions}
                defaultOption={templateOptions.find(o => o.value === templateFilter) ?? templateOptions[0]}
                onChange={(opt) => setTemplateFilter(opt?.value ?? 'All')}
                isCloseMenuOnSelect={true}
                isSorted={true}
                isClearable={false}
              />
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3" style={{ flex: '1 1 200px', minWidth: 200, maxWidth: 280 }}>
              <RequiredLabel text="Date Range" required={false} />
              <ReactDropdown
                name="dateRange"
                options={dateRangeOptions}
                defaultOption={dateRangeOptions.find(o => o.value === dateRangeFilter) ?? dateRangeOptions[0]}
                onChange={(opt) => setDateRangeFilter(opt?.value ?? 'All Time')}
                isCloseMenuOnSelect={true}
                isSorted={false}
                isClearable={false}
              />
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg2" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
              <PrimaryButton
                onClick={resetFilters}
                styles={{
                  root: { background: '#1E88E5', borderColor: '#1E88E5', width: '100%' },
                  rootHovered: { background: '#1565C0', borderColor: '#1565C0' }
                }}
              >
                <FontAwesomeIcon icon={faRotateRight} style={{ marginRight: 8 }} />
                Reset
              </PrimaryButton>
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px 20px', display: 'flex', gap: '12px', flexWrap: 'wrap', borderTop: '1px solid #eee', paddingTop: 16 }}>
          <DefaultButton onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}>
            <FontAwesomeIcon icon={viewMode === 'chart' ? faTable : faChartBar} style={{ marginRight: 8 }} />
            {viewMode === 'chart' ? 'Table View' : 'Chart View'}
          </DefaultButton>
          <DefaultButton
            onClick={() => handleExportClick('excel')}
            styles={{
              root: { background: '#217346', borderColor: '#217346', color: '#fff' },
              rootHovered: { background: '#1a5c37', borderColor: '#1a5c37', color: '#fff' }
            }}
          >
            <FontAwesomeIcon icon={faFileExcel} style={{ marginRight: 8 }} />
            Export Excel
          </DefaultButton>
          <DefaultButton
            onClick={() => handleExportClick('pdf')}
            styles={{
              root: { background: '#D32F2F', borderColor: '#D32F2F', color: '#fff' },
              rootHovered: { background: '#C62828', borderColor: '#C62828', color: '#fff' }
            }}
          >
            <FontAwesomeIcon icon={faFilePdf} style={{ marginRight: 8 }} />
            Export PDF
          </DefaultButton>
          <DefaultButton onClick={handleEmail}>
            <FontAwesomeIcon icon={faEnvelope} style={{ marginRight: 8 }} />
            Email Report
          </DefaultButton>
        </div>
      </div>

      {viewMode === 'chart' ? (
        <Pivot 
          selectedKey={activeReportTab} 
          onLinkClick={(item) => setActiveReportTab(item?.props.itemKey || 'overview')}
          styles={{ root: { marginBottom: 20 } }}
        >
          <PivotItem headerText="Overview" itemKey="overview" itemIcon="ViewDashboard">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginTop: 20 }}>
              {/* Status Distribution Chart */}
              <div className="table-card">
                <div className="table-header">
                  <h3 className="table-title">
                    <FontAwesomeIcon icon={faChartBar} style={{ marginRight: 8, color: '#1E88E5' }} />
                    Document Status Distribution
                  </h3>
                </div>
                <div style={{ padding: '20px', height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis type="category" dataKey="status" width={120} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Documents" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Distribution Pie */}
              <div className="table-card">
                <div className="table-header">
                  <h3 className="table-title">
                    <FontAwesomeIcon icon={faChartPie} style={{ marginRight: 8, color: '#8E24AA' }} />
                    Documents by Category
                  </h3>
                </div>
                <div style={{ padding: '20px', height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip />
                      <Legend />
                      <Pie 
                        data={pieChartData} 
                        dataKey="value" 
                        nameKey="name" 
                        outerRadius={100} 
                        innerRadius={50}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </PivotItem>

          <PivotItem headerText="Trends" itemKey="trends" itemIcon="LineChart">
            <div className="table-card" style={{ marginTop: 20 }}>
              <div className="table-header">
                <h3 className="table-title">
                  <FontAwesomeIcon icon={faChartLine} style={{ marginRight: 8, color: '#1E88E5' }} />
                  Monthly Document Trends
                </h3>
              </div>
              <div style={{ padding: '20px', height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#1E88E5" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F44336" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F44336" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="created" stroke="#1E88E5" fill="url(#colorCreated)" name="Created" />
                    <Area type="monotone" dataKey="approved" stroke="#4CAF50" fill="url(#colorApproved)" name="Approved" />
                    <Area type="monotone" dataKey="rejected" stroke="#F44336" fill="url(#colorRejected)" name="Rejected" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </PivotItem>

          <PivotItem headerText="Workflow" itemKey="workflow" itemIcon="Flow">
            <div className="table-card" style={{ marginTop: 20 }}>
              <div className="table-header">
                <h3 className="table-title">
                  <FontAwesomeIcon icon={faChartBar} style={{ marginRight: 8, color: '#FB8C00' }} />
                  Workflow Stage Analysis
                </h3>
              </div>
              <div style={{ padding: '20px' }}>
                {/* Workflow Funnel */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0 }}>
                  <div style={{ 
                    background: '#E3F2FD', 
                    padding: '20px 40px', 
                    borderRadius: '8px 0 0 8px',
                    textAlign: 'center',
                    minWidth: 120
                  }}>
                    <div style={{ fontSize: 32, fontWeight: 600, color: '#1E88E5' }}>{workflowMetrics.draft}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Draft</div>
                  </div>
                  <div style={{ width: 0, height: 0, borderTop: '30px solid transparent', borderBottom: '30px solid transparent', borderLeft: '20px solid #E3F2FD' }} />
                  
                  <div style={{ 
                    background: '#FFF3E0', 
                    padding: '20px 40px',
                    textAlign: 'center',
                    minWidth: 120,
                    marginLeft: -20
                  }}>
                    <div style={{ fontSize: 32, fontWeight: 600, color: '#FB8C00' }}>{workflowMetrics.pending}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Pending</div>
                  </div>
                  <div style={{ width: 0, height: 0, borderTop: '30px solid transparent', borderBottom: '30px solid transparent', borderLeft: '20px solid #FFF3E0' }} />
                  
                  <div style={{ 
                    background: '#E8F5E9', 
                    padding: '20px 40px',
                    textAlign: 'center',
                    minWidth: 120,
                    marginLeft: -20
                  }}>
                    <div style={{ fontSize: 32, fontWeight: 600, color: '#43A047' }}>{workflowMetrics.approved}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Approved</div>
                  </div>
                  <div style={{ width: 0, height: 0, borderTop: '30px solid transparent', borderBottom: '30px solid transparent', borderLeft: '20px solid #E8F5E9' }} />
                  
                  <div style={{ 
                    background: '#FFEBEE', 
                    padding: '20px 40px',
                    borderRadius: '0 8px 8px 0',
                    textAlign: 'center',
                    minWidth: 120,
                    marginLeft: -20
                  }}>
                    <div style={{ fontSize: 32, fontWeight: 600, color: '#E53935' }}>{workflowMetrics.rejected}</div>
                    <div style={{ fontSize: 12, color: '#666' }}>Rejected</div>
                  </div>
                </div>

                {/* Approval Rate Gauge */}
                <div style={{ marginTop: 40, textAlign: 'center' }}>
                  <h4 style={{ marginBottom: 16 }}>Approval Success Rate</h4>
                  <div style={{ 
                    width: 200, 
                    height: 100, 
                    margin: '0 auto',
                    background: `conic-gradient(#43A047 0deg ${approvalRate * 1.8}deg, #E0E0E0 ${approvalRate * 1.8}deg 180deg)`,
                    borderRadius: '100px 100px 0 0',
                    position: 'relative'
                  }}>
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'white',
                      width: 140,
                      height: 70,
                      borderRadius: '70px 70px 0 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: 32, fontWeight: 600, color: approvalRate >= 70 ? '#43A047' : approvalRate >= 40 ? '#FB8C00' : '#E53935' }}>
                        {approvalRate}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PivotItem>
        </Pivot>
      ) : (
        <div className="table-card">
          <div className="table-header">
            <h3 className="table-title">Category Summary</h3>
            <div style={{ fontSize: '13px', color: '#666' }}>Total: {filteredDocuments.length} documents</div>
          </div>
          <div className="table-responsive" style={{ padding: '12px' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>CATEGORY</th>
                  <th>TOTAL</th>
                  <th>DRAFT</th>
                  <th>PENDING</th>
                  <th>APPROVED</th>
                  <th>REJECTED</th>
                  <th>FINAL</th>
                </tr>
              </thead>
              <tbody>
                {categorySummary.map(row => (
                  <tr key={row.category}>
                    <td><strong>{row.category}</strong></td>
                    <td>{row.total}</td>
                    <td><span style={{ color: getStatusColor('Draft') }}>{row.Draft || 0}</span></td>
                    <td><span style={{ color: getStatusColor('In Review') }}>{row['In Review'] || 0}</span></td>
                    <td><span style={{ color: getStatusColor('Approved') }}>{row.Approved || 0}</span></td>
                    <td><span style={{ color: getStatusColor('Rejected') }}>{row.Rejected || 0}</span></td>
                    <td><span style={{ color: getStatusColor('Initiate for Signature') }}>{row['Initiate for Signature'] || 0}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
