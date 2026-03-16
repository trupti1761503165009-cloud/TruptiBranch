import * as React from 'react';
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../../../../jotai/appGlobalStateAtom';
import { IReportStats, IDocument } from '../../../../../../Service/Service';
import { Category, Template, CTDFolder } from '../../../types';

export interface ChartData {
  name: string;
  value: number;
  color?: string;
  fill?: string;
  // For category summary table
  category?: string;
  total?: number;
  Draft?: number;
  'In Review'?: number;
  Approved?: number;
  Rejected?: number;
  'Initiate for Signature'?: number;
  status?: string;
  count?: number;
}

export interface TrendData {
  month: string;
  documents: number;
  approved: number;
  rejected: number;
}

export function ReportsData() {
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { provider } = appGlobalState;

  const [activeTab, setActiveTab] = React.useState<'overview' | 'trends' | 'workflow'>('overview');
  
  // Stats
  const [stats, setStats] = React.useState<IReportStats>({
    totalDocuments: 0,
    draftCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    approvalRate: 0
  });

  // Chart data
  const [statusDistribution, setStatusDistribution] = React.useState<ChartData[]>([]);
  const [categoryDistribution, setCategoryDistribution] = React.useState<ChartData[]>([]);
  const [monthlyTrends, setMonthlyTrends] = React.useState<TrendData[]>([]);
  const [workflowFunnel, setWorkflowFunnel] = React.useState<ChartData[]>([]);

  // Loading
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  // Date range filter
  const [dateRange, setDateRange] = React.useState<'30days' | '90days' | '6months' | '1year'>('6months');

  // Filter states for component compatibility
  const [categoryFilter, setCategoryFilter] = React.useState<string>('All');
  const [statusFilter, setStatusFilter] = React.useState<string>('All');
  const [ctdFilter, setCtdFilter] = React.useState<string>('All');
  const [templateFilter, setTemplateFilter] = React.useState<string>('All');
  const [dateRangeFilter, setDateRangeFilter] = React.useState<string>('All');
  const [chartType, setChartType] = React.useState<string>('bar');
  const [viewMode, setViewMode] = React.useState<string>('chart');

  // Data collections for filters
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [templates, setTemplates] = React.useState<Template[]>([]);
  const [ctdFolders, setCtdFolders] = React.useState<CTDFolder[]>([]);
  const [filteredDocuments, setFilteredDocuments] = React.useState<IDocument[]>([]);

  const loadReportData = React.useCallback(async () => {
    if (!provider) {
      // Mock data for development
      setStats({
        totalDocuments: 156,
        draftCount: 23,
        pendingCount: 18,
        approvedCount: 98,
        rejectedCount: 17,
        approvalRate: 85
      });

      setStatusDistribution([
        { name: 'Draft', value: 23, color: '#FFA726' },
        { name: 'Pending Approval', value: 18, color: '#42A5F5' },
        { name: 'Approved', value: 75, color: '#66BB6A' },
        { name: 'Signed', value: 23, color: '#26A69A' },
        { name: 'Rejected', value: 17, color: '#EF5350' }
      ]);

      setCategoryDistribution([
        { name: 'Clinical', value: 45, color: '#1E88E5' },
        { name: 'Non-Clinical', value: 32, color: '#7B1FA2' },
        { name: 'Quality', value: 38, color: '#43A047' },
        { name: 'Regulatory', value: 28, color: '#F57C00' },
        { name: 'Safety', value: 13, color: '#E53935' }
      ]);

      setMonthlyTrends([
        { month: 'Jan', documents: 12, approved: 8, rejected: 2 },
        { month: 'Feb', documents: 18, approved: 12, rejected: 3 },
        { month: 'Mar', documents: 15, approved: 10, rejected: 2 },
        { month: 'Apr', documents: 22, approved: 15, rejected: 4 },
        { month: 'May', documents: 28, approved: 20, rejected: 3 },
        { month: 'Jun', documents: 25, approved: 18, rejected: 2 },
        { month: 'Jul', documents: 30, approved: 22, rejected: 3 },
        { month: 'Aug', documents: 35, approved: 25, rejected: 4 },
        { month: 'Sep', documents: 32, approved: 24, rejected: 3 },
        { month: 'Oct', documents: 38, approved: 28, rejected: 5 },
        { month: 'Nov', documents: 42, approved: 32, rejected: 4 },
        { month: 'Dec', documents: 45, approved: 35, rejected: 5 }
      ]);

      setWorkflowFunnel([
        { name: 'Draft Created', value: 156, color: '#90CAF9' },
        { name: 'Submitted', value: 133, color: '#64B5F6' },
        { name: 'Under Review', value: 115, color: '#42A5F5' },
        { name: 'Approved', value: 98, color: '#2196F3' },
        { name: 'Finalized', value: 85, color: '#1E88E5' }
      ]);

      return;
    }

    setIsLoading(true);
    try {
      // Load stats
      const reportStats = await provider.getReportStats();
      setStats(reportStats);

      // Load documents for charts
      const documents = await provider.getDocuments();

      // Calculate status distribution
      const statusCounts: Record<string, number> = {};
      documents.forEach(doc => {
        statusCounts[doc.status] = (statusCounts[doc.status] || 0) + 1;
      });
      const statusColors: Record<string, string> = {
        'Draft': '#FFA726',
        'Pending Approval': '#42A5F5',
        'In Review': '#AB47BC',
        'Revision': '#FFCA28',
        'Initiate for Signature': '#26C6DA',
        'Signed': '#26A69A',
        'Approved': '#66BB6A',
        'Final': '#2E7D32',
        'Rejected': '#EF5350'
      };
      setStatusDistribution(
        Object.entries(statusCounts).map(([name, value]) => ({
          name,
          value,
          color: statusColors[name] || '#999'
        }))
      );

      // Calculate category distribution
      const categoryCounts: Record<string, number> = {};
      documents.forEach(doc => {
        if (doc.category) {
          categoryCounts[doc.category] = (categoryCounts[doc.category] || 0) + 1;
        }
      });
      const categoryColors = ['#1E88E5', '#7B1FA2', '#43A047', '#F57C00', '#E53935', '#5E35B1', '#00ACC1'];
      setCategoryDistribution(
        Object.entries(categoryCounts).map(([name, value], index) => ({
          name,
          value,
          color: categoryColors[index % categoryColors.length]
        }))
      );

      // Calculate monthly trends
      const monthlyData: Record<string, { documents: number; approved: number; rejected: number }> = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      documents.forEach(doc => {
        if (doc.createdDate) {
          const date = new Date(doc.createdDate);
          const monthKey = months[date.getMonth()];
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { documents: 0, approved: 0, rejected: 0 };
          }
          monthlyData[monthKey].documents++;
          if (doc.status === 'Approved' || doc.status === 'Final' || doc.status === 'Signed') {
            monthlyData[monthKey].approved++;
          } else if (doc.status === 'Rejected') {
            monthlyData[monthKey].rejected++;
          }
        }
      });

      setMonthlyTrends(
        months.map(month => ({
          month,
          documents: monthlyData[month]?.documents || 0,
          approved: monthlyData[month]?.approved || 0,
          rejected: monthlyData[month]?.rejected || 0
        }))
      );

      // Calculate workflow funnel
      setWorkflowFunnel([
        { name: 'Draft Created', value: documents.length, color: '#90CAF9' },
        { name: 'Submitted', value: documents.filter(d => d.status !== 'Draft').length, color: '#64B5F6' },
        { name: 'Under Review', value: documents.filter(d => ['Pending Approval', 'In Review', 'Revision'].includes(d.status)).length, color: '#42A5F5' },
        { name: 'Approved', value: documents.filter(d => ['Approved', 'Signed', 'Final'].includes(d.status)).length, color: '#2196F3' },
        { name: 'Finalized', value: documents.filter(d => d.status === 'Final').length, color: '#1E88E5' }
      ]);

      setErrorMessage('');
    } catch (error) {
      console.error('Failed to load report data:', error);
      setErrorMessage('Unable to load report data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  React.useEffect(() => {
    void loadReportData();
  }, [loadReportData]);

  const exportToExcel = () => {
    // Implementation for Excel export
    console.log('Exporting to Excel...');
  };

  const exportToPDF = () => {
    // Implementation for PDF export
    console.log('Exporting to PDF...');
  };

  // Compatibility handlers for component
  const handleExport = (format: 'excel' | 'pdf') => {
    if (format === 'excel') {
      exportToExcel();
    } else {
      exportToPDF();
    }
  };

  const handleEmail = () => {
    console.log('Sending email report...');
  };

  const resetFilters = () => {
    setCategoryFilter('All');
    setStatusFilter('All');
    setCtdFilter('All');
    setTemplateFilter('All');
    setDateRangeFilter('All');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Draft': return '#FFA726';
      case 'Pending Approval': return '#42A5F5';
      case 'Approved': return '#66BB6A';
      case 'Signed': return '#26A69A';
      case 'Rejected': return '#EF5350';
      default: return '#999';
    }
  };

  // Computed data for component compatibility
  const chartData = statusDistribution;
  const categorySummary = categoryDistribution;
  const pieChartData = statusDistribution;
  const trendData = monthlyTrends;

  return {
    activeTab,
    stats,
    statusDistribution,
    categoryDistribution,
    monthlyTrends,
    workflowFunnel,
    isLoading,
    errorMessage,
    dateRange,
    // Filter states
    categoryFilter,
    statusFilter,
    ctdFilter,
    templateFilter,
    dateRangeFilter,
    chartType,
    viewMode,
    // Data collections
    categories,
    templates,
    ctdFolders,
    filteredDocuments,
    // Computed data
    chartData,
    categorySummary,
    pieChartData,
    trendData,
    // Setters
    setActiveTab,
    setDateRange,
    setCategoryFilter,
    setStatusFilter,
    setCtdFilter,
    setTemplateFilter,
    setDateRangeFilter,
    setChartType,
    setViewMode,
    // Handlers
    loadReportData,
    exportToExcel,
    exportToPDF,
    handleExport,
    handleEmail,
    resetFilters,
    getStatusColor
  };
}
