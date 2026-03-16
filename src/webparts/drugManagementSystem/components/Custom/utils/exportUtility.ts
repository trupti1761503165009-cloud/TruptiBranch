/**
 * Export Utility Functions
 * Handles Excel and PDF export functionality across the application
 */

/**
 * Export data to Excel format
 * @param data Array of objects to export
 * @param filename Name of the Excel file
 * @param sheetName Name of the Excel sheet
 */
export const exportToExcel = (data: any[], filename: string = 'export.xlsx', sheetName: string = 'Data') => {
  try {
    // Create CSV content as Excel fallback
    if (!data || data.length === 0) {
      console.error('No data to export');
      return false;
    }

    // Get columns from first object
    const columns = Object.keys(data[0]);
    
    // Create CSV header
    const csvContent = [
      columns.join(','),
      ...data.map(row => 
        columns.map(col => {
          const value = row[col];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return false;
  }
};

/**
 * Export data to PDF format
 * @param data Array of objects to export
 * @param filename Name of the PDF file
 * @param title Title of the PDF document
 */
export const exportToPDF = (data: any[], filename: string = 'export.pdf', title: string = 'Report') => {
  try {
    if (!data || data.length === 0) {
      console.error('No data to export');
      return false;
    }

    // Create HTML table from data
    const columns = Object.keys(data[0]);
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            color: #2563eb;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #2563eb;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border: 1px solid #1e40af;
          }
          td {
            padding: 10px 12px;
            border: 1px solid #e5e7eb;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          tr:hover {
            background-color: #f3f4f6;
          }
          .summary {
            margin-top: 20px;
            padding: 15px;
            background-color: #f0f9ff;
            border-left: 4px solid #2563eb;
            border-radius: 4px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <div class="summary">
          <strong>Report Date:</strong> ${new Date().toLocaleDateString()}<br>
          <strong>Total Records:</strong> ${data.length}
        </div>
        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${col}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.map(row => `
              <tr>
                ${columns.map(col => {
                  const value = row[col];
                  const displayValue = value === null || value === undefined ? '-' : 
                    typeof value === 'object' ? JSON.stringify(value) : String(value);
                  return `<td>${displayValue}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>This is an automatically generated report from Drug Management System</p>
        </div>
      </body>
      </html>
    `;

    // Open print dialog with HTML content
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for content to load, then print
      setTimeout(() => {
        printWindow.print();
        // Optionally close after print
        // printWindow.close();
      }, 250);
    }

    return true;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    return false;
  }
};

/**
 * Export template data to Excel
 */
export const exportTemplatesToExcel = (templates: any[]) => {
  const exportData = templates.map(t => ({
    'Template Name': t.name,
    'Category': t.category || 'N/A',
    'Country': t.country || 'N/A',
    'Mapping Type': (t as any).mappingType || 'None',
    'CTD Folder': t.mappedCTDFolder || 'Not Mapped',
    'eCTD Section': t.eCTDSection || '-',
    'Status': t.status,
    'Upload Date': t.uploadDate
  }));
  return exportToExcel(exportData, `templates-${new Date().toISOString().split('T')[0]}.xlsx`, 'Templates');
};

/**
 * Export categories data to Excel
 */
export const exportCategoriesToExcel = (categories: any[]) => {
  const exportData = categories.map(c => ({
    'Category Name': c.name,
    'Document Category': c.documentCategory || 'N/A',
    'Group': c.group || '-',
    'SubGroup': c.subGroup || '-',
    'Status': c.status,
    'Documents': c.documents || 0,
    'Description': c.description || ''
  }));
  return exportToExcel(exportData, `categories-${new Date().toISOString().split('T')[0]}.xlsx`, 'Categories');
};

/**
 * Export documents/reports data to Excel
 */
export const exportDocumentsToExcel = (documents: any[]) => {
  const exportData = documents.map(d => ({
    'Document ID': d.id,
    'Title': d.title,
    'Category': d.category,
    'Status': d.status,
    'Created Date': d.createdDate,
    'Modified Date': d.modifiedDate,
    'Created By': d.createdBy,
    'CTD Folder': d.ctdFolder || 'N/A'
  }));
  return exportToExcel(exportData, `documents-${new Date().toISOString().split('T')[0]}.xlsx`, 'Documents');
};

/**
 * Generate and export summary report
 */
export const exportSummaryReport = (summaryData: {
  title: string;
  metrics: Record<string, number | string>;
  details?: Record<string, any>;
}) => {
  const reportData = [
    {
      'Metric': 'Report Title',
      'Value': summaryData.title
    },
    ...Object.entries(summaryData.metrics).map(([key, value]) => ({
      'Metric': key,
      'Value': String(value)
    }))
  ];
  
  return exportToExcel(reportData, `summary-report-${new Date().toISOString().split('T')[0]}.xlsx`, 'Summary');
};
