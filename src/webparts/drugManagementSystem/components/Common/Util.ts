import * as CamlBuilder from "camljs";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../Shared/Enum/CamlQueryFilter";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../../Service/models/IPnPQueryOptions";
import { IDataProvider } from "../../../Service/models/IDataProvider";
import { IEmployeeID } from "../../../Shared/constants/defaultValues";
import * as ExcelJS from 'exceljs';
import { GetImgUrlByFileExtension, getFileTypeIcon } from './utils';
import * as moment from "moment";
export const DateFormat: string = "DD-MM-YYYY";
/* eslint-disable */
export const PAGE_LENGTH: number = 30;

export const getUniueRecordsByColumnName = (items: any[], columnName: string) => {
    const lookup: any = {};
    const result: any[] = [];
    if (!!items) {
        for (let index = 0; index < items?.length; index++) {
            const item = items[index];
            const name = item[columnName];
            if (!(name in lookup)) {
                lookup[name] = 1;
                result.push(item);
            }
        }
        return result;
    }
    else {
        return [];
    }
};

export function SortArray(array: any[]): any[] {
    const sortedArray = array.sort((p1, p2) => (p1.label > p2.label) ? 1 : (p1.label < p2.label) ? -1 : 0);
    return sortedArray;
}

export const formatBytes = (bytes: any, decimals = 2) => {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
// Backward-compatible re-export (preferred source is `components/Common/utils.ts`)
export { GetImgUrlByFileExtension, getFileTypeIcon };

export const getCAMLQueryFilterExpression = (filterFields: ICamlQueryFilter[]) => {
    const categoriesExpressions = filterFields?.map((item: ICamlQueryFilter) => {
        let expression: any;

        switch (item.fieldType) {
            case FieldType.Boolean:
                expression = CamlBuilder.Expression().BooleanField(item.fieldName);
                break;
            case FieldType.Text:
                expression = CamlBuilder.Expression().TextField(item.fieldName);
                break;
            case FieldType.Lookup:
                expression = CamlBuilder.Expression().LookupField(item.fieldName).ValueAsText();
                break;
            case FieldType.Number:
                expression = CamlBuilder.Expression().NumberField(item.fieldName);
                break;
            default:
                expression = CamlBuilder.Expression().TextField(item.fieldName);
        }

        switch (item.LogicalType) {
            case LogicalType.EqualTo:
                expression.EqualTo(item.fieldValue);
                break;
            case LogicalType.NotEqualTo:
                expression.NotEqualTo(item.fieldValue);
                break;
            case LogicalType.GreaterThan:
                expression.GreaterThan(item.fieldValue);
                break;
            case LogicalType.GreaterThanOrEqualTo:
                expression.GreaterThanOrEqualTo(item.fieldValue);
                break;
            case LogicalType.LessThan:
                expression.LessThan(item.fieldValue);
                break;
            case LogicalType.LessThanOrEqualTo:
                expression.LessThanOrEqualTo(item.fieldValue);
                break;
            case LogicalType.Contains:
                expression.Contains(item.fieldValue);
                break;
        }

        return expression;
    });
    return categoriesExpressions;
}

export const getErrorMessage = (error: any) => {
    try {
        return JSON.parse(error.message);
    }
    catch (e) {
        return e;
    }
}

export const getNumberValue = (value: any): number => {
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? 0 : parsedValue;
}
export const getBooleanValue = (value: any): boolean => {
    return value === "Yes";
}
export const getStringValue = (value: any): string => value || "";

const splitCamlMultiValue = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value
            .map((item: any) => item?.lookupValue ?? item?.Title ?? item?.title ?? item?.Name ?? item)
            .filter(Boolean)
            .map((item: any) => String(item));
    }
    if (typeof value === 'string') {
        return value.split(';#').filter(Boolean);
    }
    return [String(value)];
};

const splitCamlMultiIds = (value: any): number[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value
            .map((item: any) => item?.lookupId ?? item?.Id ?? item?.id)
            .filter((id: any) => id !== undefined && id !== null)
            .map((id: any) => Number(id))
            .filter((id: number) => !Number.isNaN(id));
    }
    if (typeof value === 'string') {
        return value
            .split(';#')
            .filter(Boolean)
            .map((part: string) => Number(part))
            .filter((id: number) => !Number.isNaN(id));
    }
    if (typeof value === 'number') return [value];
    return [];
};

export const getMultiLookupValueCAML = (value: any): string[] => splitCamlMultiValue(value);

export const getLookupValueCAML = (value: any): string => splitCamlMultiValue(value)[0] ?? "";

export const getMultiLookupIdsCAML = (value: any): number[] => splitCamlMultiIds(value);

export const getLookupIdCAML = (value: any): number => splitCamlMultiIds(value)[0] ?? -1;

export const getPeoplePickerValueCAML = (value: any, field: string): string => {
    if (Array.isArray(value) && value.length > 0) {
        return value[0][field] ?? "";
    }
    if (value && typeof value === 'object') {
        return value[field] ?? "";
    }
    return typeof value === 'string' ? value : "";
};

export const getPeoplePickerValue = (value: any): { Id: number | null; Title: string } => {
    if (Array.isArray(value) && value.length > 0) {
        return {
            Id: value[0]?.Id ?? null,
            Title: value[0]?.Title ?? ""
        };
    }
    return { Id: null, Title: "" };
};
export const getmultiPeoplePickerValueCAML = (value: any, field: string): any[] => {
    if (Array.isArray(value) && value.length > 0) {
        return value.map(item => item[field]).filter(Boolean);
    }
    if (value && typeof value === 'object') {
        return value[field] ? [value[field]] : [];
    }
    if (typeof value === 'string' && value.trim()) return [value];
    return [];
};


export const getLookUpOrPeoplePickerValue = (value: any, field: string): string => {
    return !!value ? value[field] ?? "" : "";
}

export function splitIntoBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
        batches.push(array.slice(i, i + batchSize));
    }
    return batches;
}

export const getHeight = (topHeight: number): number => {
    if (document.getElementsByClassName("ms-DetailsList").length > 0) {
        const detailListHeight = document.getElementsByClassName("ms-DetailsList")[0].clientHeight;
        const fullHeight = Math.round(window.innerHeight) - topHeight;
        return (detailListHeight < fullHeight ? (detailListHeight + 20) : fullHeight)
    }
    else {
        return Math.round(window.innerHeight) - topHeight;
    }
}
export const getHeightById = (topHeight: number, divId: string): any => {
    if (document.getElementsByClassName("ms-DetailsList").length > 0) {
        let id = document.getElementById(divId)
        if (!!id) {
            const detailListHeight = id.getElementsByClassName("ms-DetailsList")[0].clientHeight;
            const fullHeight = Math.round(window.innerHeight) - topHeight;
            return (detailListHeight < fullHeight ? (detailListHeight + 20) : fullHeight)
        } else {
            return Math.round(window.innerHeight) - topHeight;
        }
    }
}

export const GetSortOrder = (
    prop: any,
    isAssending: boolean = true,
    type: string = "SP.FieldText"
) => {
    return (x: any, y: any) => {
        let a = x[prop];
        let b = y[prop];

        // Normalize arrays to comma-separated strings
        if (Array.isArray(a)) a = a.join(", ");
        if (Array.isArray(b)) b = b.join(", ");

        // Handle Text Comparison
        if (type === "SP.FieldText") {
            a = typeof a === "string" ? a.toUpperCase() : "";
            b = typeof b === "string" ? b.toUpperCase() : "";
            if (a === b) return 0;
            return isAssending ? (a > b ? 1 : -1) : (a < b ? 1 : -1);
        }

        // Handle DateTime Comparison
        else if (type === "SP.FieldDateTime") {
            a = new Date(a || 0);
            b = new Date(b || 0);
            return isAssending ? a.getTime() - b.getTime() : b.getTime() - a.getTime();
        }

        // Handle Default/Other Types
        else {
            if (a === b) return 0;
            return isAssending ? (a > b ? 1 : -1) : (a < b ? 1 : -1);
        }
    };
};


export const getCurrentYearRange = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
};

export const parseDate = (dateStr: any) => {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day); // month - 1 because JS months are 0-based
};

export const a1ToRowCols = (a1: string) => {
    const match = a1.match(/^([A-Z]+)(\d+)$/);
    if (!match) throw new Error(`Invalid A1 format: ${a1}`);
    const [, letters, num] = match;
    let col = 0;
    for (let i = 0; i < letters.length; i++) {
        col *= 26;
        col += letters.charCodeAt(i) - 64;
    }
    return { row: parseInt(num, 10), col };
};

export const rowColToA1s = (row: number, col: number) => {
    let letters = "";
    while (col > 0) {
        const mod = (col - 1) % 26;
        letters = String.fromCharCode(65 + mod) + letters;
        col = Math.floor((col - 1) / 26);
    }
    return `${letters}${row}`;
};
// Convert column letter (e.g., 'A', 'AA') to column number
const colLetterToNumber = (col: string): number => {
    let result = 0;
    for (let i = 0; i < col.length; i++) {
        result *= 26;
        result += col.charCodeAt(i) - 64; // A = 65
    }
    return result;
};

// Convert column number to letter
export const colNumberToLetter = (col: number): string => {
    let result = "";
    while (col > 0) {
        const mod = (col - 1) % 26;
        result = String.fromCharCode(65 + mod) + result;
        col = Math.floor((col - mod) / 26);
    }
    return result;
};
export const a1ToRowCol = (a1: string) => {
    const match = a1.match(/^([A-Z]+)(\d+)$/);
    if (!match) return { row: 0, col: 0 };

    const [, colLetters, rowStr] = match;
    let col = 0;
    for (let i = 0; i < colLetters.length; i++) {
        col *= 26;
        col += colLetters.charCodeAt(i) - 64;
    }
    return { row: parseInt(rowStr, 10), col };
};
export const isRangeMerged = (sheet: any, range: string): boolean => {
    return sheet.model.merges?.includes(range) || false;
};
export const isCellMerged = (worksheet: any, cellAddress: string) => {
    // worksheet.merges is a Map where keys are merged ranges like 'A1:B2'
    for (const mergeRange of worksheet.merges.keys()) {
        // mergeRange is like 'A1:B2' or 'C3:C5'
        const [start, end] = mergeRange.split(":");
        const startCell = a1ToRowCol(start);
        const endCell = a1ToRowCol(end);
        const cell = a1ToRowCol(cellAddress);

        // Check if cell is within merged range
        const isInRange =
            cell.row >= startCell.row &&
            cell.row <= endCell.row &&
            cell.col >= startCell.col &&
            cell.col <= endCell.col;

        if (isInRange) {
            return true;
        }
    }
    return false;
}


// Convert A1 (e.g., "B2") to row/col


export const rowColToA1 = (row: number, col: number) => {
    let colStr = "";
    while (col > 0) {
        const mod = (col - 1) % 26;
        colStr = String.fromCharCode(65 + mod) + colStr;
        col = Math.floor((col - 1) / 26);
    }
    return `${colStr}${row}`;
}
export const handleProjectManagerExcel = async (provider: IDataProvider, fileUrl: string, projectList: any[]) => {
    try {
        // const fileUrl = `/sites/HRMS/ProjectsPA/Santosh Rajput/2025-2026/Santosh Rajput_Project_PA.xlsx`;
        const fileBuffer: ArrayBuffer = await provider.getFileContents(fileUrl);

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(fileBuffer);

        const templateSheet = workbook.worksheets[2];
        if (!templateSheet) return;
        const originalSheetName = templateSheet.name;

        const blockHeight = 26;
        // const projectList = [
        //     { name: "Project A", manager: "Alice" },
        //     { name: "Project B", manager: "Bob" },
        //     { name: "Project C", manager: "Charlie" },
        //     { name: "Project D", manager: "David" },
        //     { name: "Project E", manager: "Eva" }
        // ];

        // Cache block template rows
        const rowTemplates: any[] = [];
        for (let r = 1; r <= blockHeight; r++) {
            const row = templateSheet.getRow(r);
            const rowCopy: any = {
                height: row.height,
                cells: []
            };
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const cellData: any = {
                    style: JSON.parse(JSON.stringify(cell.style))
                };

                if (cell.value && typeof cell.value === 'object' && 'formula' in cell.value) {
                    // Convert shared formula to regular formula
                    cellData.value = {
                        formula: cell.formula || cell.value.formula,
                        result: cell.value.result ?? null
                    };
                } else {
                    cellData.value = cell.value;
                }


                rowCopy.cells[colNumber] = cellData;
            });
            rowTemplates.push(rowCopy);
        }

        const originalMerges = [...(templateSheet.model.merges || [])];
        const newSheet = workbook.addWorksheet("All Projects");
        let currentRowOffset = 0;

        for (let i = 0; i < projectList.length; i++) {
            const { ProjectName } = projectList[i];
            const startRow = i === 0 ? 1 : 7;

            for (let r = startRow; r <= blockHeight; r++) {
                const source = rowTemplates[r - 1];
                const targetRow = newSheet.getRow(currentRowOffset + r - startRow + 1);
                targetRow.height = source.height;

                for (const col in source.cells) {
                    const colNum = Number(col);
                    const { value, style } = source.cells[colNum];
                    const cell = targetRow.getCell(colNum);
                    cell.value = value;
                    cell.style = style;
                }
            }

            // Copy and shift merged cells
            originalMerges.forEach((mergeRange) => {
                const [start, end] = mergeRange.split(":");
                const startCell = a1ToRowCols(start);
                const endCell = a1ToRowCols(end);

                if (i > 0 && startCell.row < 7) return;

                const newStart = rowColToA1s(startCell.row + currentRowOffset - (i > 0 ? 6 : 0), startCell.col);
                const newEnd = rowColToA1s(endCell.row + currentRowOffset - (i > 0 ? 6 : 0), endCell.col);
                const newRange = `${newStart}:${newEnd}`;
                newSheet.mergeCells(newRange);
            });

            // Fill dynamic values
            const fillLabel = (label: string, value: string) => {
                const rowStart = currentRowOffset + 1;
                const rowEnd = currentRowOffset + (blockHeight - (i === 0 ? 0 : 6));
                for (let r = rowStart; r <= rowEnd; r++) {
                    const row = newSheet.getRow(r);
                    for (let c = 1; c <= row.cellCount; c++) {
                        const cell = row.getCell(c);
                        if (typeof cell.value === "string" && cell.value.trim() === label) {
                            row.getCell(c + 1).value = value;
                            return;
                        }
                    }
                }
            };

            fillLabel("Project Title  :", ProjectName);


            currentRowOffset += (blockHeight - (i === 0 ? 0 : 6));
        }

        // Append rows 31 to 43 for each project, one after another
        let appendRowStart = currentRowOffset + 2;


        const extraStartRow = 31;
        const extraEndRow = 43;

        // Copy rows 31–43 from templateSheet to newSheet
        for (let r = extraStartRow; r <= extraEndRow; r++) {
            const sourceRow = templateSheet.getRow(r);
            const targetRow = newSheet.getRow(appendRowStart);

            targetRow.height = sourceRow.height;

            sourceRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                const targetCell = targetRow.getCell(colNumber);
                targetCell.value = cell.value;
                targetCell.style = JSON.parse(JSON.stringify(cell.style)); // Deep copy of styles
            });

            appendRowStart++;
        }


        // After inserting project rows
        let projectDataStartRow = currentRowOffset + 3; // Where data begins
        for (let i = 0; i < projectList.length; i++) {
            const row = newSheet.getRow(projectDataStartRow + i);
            row.getCell(1).value = i + 1;
            row.getCell(2).value = projectList[i].ProjectName; // Project Name
            row.getCell(3).value = 0.00;
        }


        //  Add Average Row after the project list
        const numberOfProjects = projectList.length;
        const lastProjectRowIndex = projectDataStartRow + numberOfProjects - 1;
        // Step 3: Insert new project rows
        projectList.forEach((project, index) => {
            const rowIndex = projectDataStartRow + index;
            const row = newSheet.insertRow(rowIndex, []);
            row.getCell(1).value = index + 1;        // Sr No
            row.getCell(2).value = project.ProjectName;     // Project Name
            row.getCell(3).value = Array.isArray(project.ProjManager)
                ? project.ProjManager.map((pm: any) => (typeof pm === "string" ? pm : pm.name)).join(", ")
                : project.ProjManager;;  // Manager
            row.getCell(4).value = 0.00;

            row.eachCell((cell: any) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
            });

            row.commit();
        });
        workbook.removeWorksheet(templateSheet.id);

        // Rename new sheet to original sheet name
        newSheet.name = originalSheetName;

        // Move newSheet to index 2 (ExcelJS uses zero-based index internally)
        // workbook.worksheets.splice(2, 0, workbook.worksheets.pop()!);
        const parts = fileUrl?.split("/");
        const index = parts.indexOf("ProjectsPA");
        const folderName = index !== -1 && parts.length > index + 1 ? parts[index + 1] : "";

        // console.log(folderName);

        const buffer = await workbook.xlsx.writeBuffer();
        const fileName = `${folderName}_Project PA.xlsx`;
        const uploadPath = fileUrl;

        await provider.uploadFiles(
            uploadPath,
            buffer,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        return true;
    } catch (error) {
        console.error("Error updating Excel:", error);
        // alert("Failed to update Excel.");
    }
};

export const updateProjectDashboardTable = (projectList: any[], SheetName: any) => {
    try {

        const firstSheet = SheetName;
        const startRow = 4;
        const originalCountRowIndex = 11;

        // Step 1: Capture and clone the original count row
        const originalCountRow = SheetName.getRow(originalCountRowIndex);
        const countRowData: any[] = [];
        originalCountRow.eachCell({ includeEmpty: true }, (cell: any, colNumber: any) => {
            countRowData[colNumber - 1] = {
                value: cell.value,
                style: cell.style,
                numFmt: cell.numFmt,
                font: cell.font,
                alignment: cell.alignment
            };
        });

        // Step 2: Remove existing rows from startRow to original count row
        const rowsToRemove = originalCountRowIndex - startRow + 1;
        firstSheet.spliceRows(startRow, rowsToRemove);

        // Step 3: Insert new project rows
        projectList.forEach((project, index) => {
            const rowIndex = startRow + index;
            const row = firstSheet.insertRow(rowIndex, []);
            row.getCell(1).value = index + 1;        // Sr No
            row.getCell(2).value = project.ProjectName;     // Project Name
            row.getCell(3).value = Array.isArray(project.ProjManager)
                ? project.ProjManager.map((pm: any) => (typeof pm === "string" ? pm : pm.name)).join(", ")
                : project.ProjManager;;  // Manager
            row.getCell(4).value = 0.00;

            row.eachCell((cell: any) => {
                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };
            });

            row.commit();
        });

        // Step 4: Insert a blank row
        const lastProjectRowIndex = startRow + projectList.length;
        firstSheet.insertRow(lastProjectRowIndex, []);

        // Step 5: Insert the cloned count row
        const newCountRowIndex = lastProjectRowIndex + 1;
        const newCountRow = firstSheet.insertRow(newCountRowIndex, []);


        const projectStartRowIndex = 4;
        const sumColumnLetter = 'D';
        countRowData.forEach((cellData: any, colIndex: number) => {
            const cell = newCountRow.getCell(colIndex + 1);

            // If it's the column where the SUM formula goes (e.g., column D, index 3)
            if (colIndex === 3) {
                const sumFormula = `=SUM(${sumColumnLetter}${projectStartRowIndex}:${sumColumnLetter}${lastProjectRowIndex})/2`;
                cell.value = { formula: sumFormula };
            } else {
                cell.value = cellData.value;
            }

            cell.style = cellData.style;
            cell.numFmt = cellData.numFmt;
            cell.font = cellData.font;
            cell.alignment = cellData.alignment;
            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };
        });

        // Step 6: Clear leftover rows
        const lastUsedRow = newCountRowIndex;
        for (let i = lastUsedRow + 1; i <= firstSheet.rowCount; i++) {
            const row = firstSheet.getRow(i);
            row.values = [];
            row.eachCell((cell: any) => {
                cell.value = null;
                cell.style = {};
            });
        }
    } catch (error) {
        console.error("Error updating Excel:", error);
    }
};
export const onFormatDate = (date?: Date): string => {
    return !date ? "" : moment(date).format(DateFormat);
};
export const onDetailListHeaderRender = (
    headerProps: any,
    defaultRender: any
) => {
    return defaultRender({
        ...headerProps,
        styles: {
            root: {
                selectors: {
                    ".ms-DetailsHeader-cell": {
                        whiteSpace: "normal",
                        textOverflow: "clip",
                        lineHeight: "normal",
                        background: "#1300a6",
                        color: "#fff",
                        fontSize: "13px",
                    },
                    ".ms-DetailsHeader-cell:hover": {
                        background: "#213577",
                        color: "#fff",
                        fontSize: "13px",
                    }, // Hover class
                    ".ms-DetailsHeader-cellTitle": {
                        height: "100%",
                        alignItems: "center",
                    },
                },
            },
        },
    });
};
export const parseCustomDate = (value: any): Date | null => {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value !== "string") return null;

  let cleaned = value.trim();

  // Remove AM/PM if 24h already used
  cleaned = cleaned.replace(/ AM| PM/i, "");

  //  Handle DD-MM-YYYY or DD/MM/YYYY
  const dateOnlyMatch = cleaned.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);
  if (dateOnlyMatch) {
    const [, day, month, year] = dateOnlyMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  //  Handle DD-MM-YYYY HH:mm
  const dateTimeMatch = cleaned.match(
    /^(\d{2})[-/](\d{2})[-/](\d{4})\s+(\d{2}):(\d{2})$/
  );
  if (dateTimeMatch) {
    const [, day, month, year, hour, minute] = dateTimeMatch;
    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute)
    );
  }

  // Fallback (ISO or normal JS parse)
  const fallback = new Date(cleaned);
  return isNaN(fallback.getTime()) ? null : fallback;
};