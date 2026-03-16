/**
 * Excel Helper - Parse and validate Excel files for bulk imports
 */
import * as XLSX from 'xlsx';

export interface ParsedExcelData {
  success: boolean;
  data: any[];
  errors: string[];
  warnings: string[];
}

export class ExcelHelper {
  /**
   * Parse Excel file and return JSON data
   */
  static async parseExcelFile(file: File): Promise<ParsedExcelData> {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

      return {
        success: true,
        data: jsonData,
        errors: [],
        warnings: jsonData.length === 0 ? ['Excel file is empty'] : []
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        errors: [`Failed to parse Excel file: ${error.message || 'Unknown error'}`],
        warnings: []
      };
    }
  }

  /**
   * Validate Template Excel Data
   */
  static validateTemplateData(data: any[]): ParsedExcelData {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validData: any[] = [];

    data.forEach((row: any, index: number) => {
      const rowNum = index + 2; // Excel row (header is row 1)
      const rowErrors: string[] = [];

      // Required fields
      if (!row['Template Name'] && !row['TemplateName'] && !row['Name']) {
        rowErrors.push(`Row ${rowNum}: Missing 'Template Name'`);
      }
      if (!row['Category'] && !row['CategoryName']) {
        rowErrors.push(`Row ${rowNum}: Missing 'Category'`);
      }

      // Optional but recommended
      if (!row['Country']) {
        warnings.push(`Row ${rowNum}: Missing 'Country' (will default)`);
      }
      if (!row['Status']) {
        warnings.push(`Row ${rowNum}: Missing 'Status' (will default to Active)`);
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        validData.push({
          name: row['Template Name'] || row['TemplateName'] || row['Name'],
          category: row['Category'] || row['CategoryName'],
          country: row['Country'] || '',
          status: row['Status'] || 'Active',
          mappingType: row['Mapping Type'] || row['MappingType'] || 'None',
          mappedCTDFolder: row['Mapped CTD Folder'] || row['MappedCTDFolder'] || '',
          ectdSection: row['eCTD Section'] || row['eCTDSection'] || '',
          ectdSubsection: row['eCTD Subsection'] || row['eCTDSubsection'] || ''
        });
      }
    });

    return {
      success: errors.length === 0,
      data: validData,
      errors,
      warnings
    };
  }

  /**
   * Validate Category Excel Data
   */
  static validateCategoryData(data: any[]): ParsedExcelData {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validData: any[] = [];

    data.forEach((row: any, index: number) => {
      const rowNum = index + 2;
      const rowErrors: string[] = [];

      if (!row['Category Name'] && !row['CategoryName'] && !row['Name']) {
        rowErrors.push(`Row ${rowNum}: Missing 'Category Name'`);
      }
      if (!row['Document Category'] && !row['DocumentCategory']) {
        rowErrors.push(`Row ${rowNum}: Missing 'Document Category'`);
      }

      if (rowErrors.length > 0) {
        errors.push(...rowErrors);
      } else {
        validData.push({
          name: row['Category Name'] || row['CategoryName'] || row['Name'],
          documentCategory: row['Document Category'] || row['DocumentCategory'],
          group: row['Group'] || '',
          subGroup: row['Sub Group'] || row['SubGroup'] || '',
          artifactName: row['Artifact Name'] || row['ArtifactName'] || '',
          templateName: row['Template Name'] || row['TemplateName'] || '',
          status: row['Status'] || 'Active',
          description: row['Description'] || '',
          artifactDescription: row['Artifact Description'] || row['ArtifactDescription'] || '',
          ctdModule: row['CTD Module'] || row['CTDModule'] || '',
          ectdSection: row['eCTD Section'] || row['eCTDSection'] || '',
          ectdSubsection: row['eCTD Subsection'] || row['eCTDSubsection'] || '',
          ectdCode: row['eCTD Code'] || row['eCTDCode'] || ''
        });
      }
    });

    return {
      success: errors.length === 0,
      data: validData,
      errors,
      warnings
    };
  }

  /**
   * Export data to Excel
   */
  static exportToExcel(data: any[], fileName: string): void {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, fileName);
  }
}
