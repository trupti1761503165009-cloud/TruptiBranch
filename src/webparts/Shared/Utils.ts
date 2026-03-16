// /* eslint-disable @typescript-eslint/no-var-requires */
// /* eslint-disable @typescript-eslint/no-floating-promises */
// /* eslint-disable @rushstack/no-new-null */
// import * as CamlBuilder from "camljs";
// import { FieldType, ICamlQueryFilter, LogicalType } from "./Enum/CamlQueryFilter";
// import { utils, writeFile } from 'xlsx';
// import { IContextualMenuItem } from "@fluentui/react";
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import { SPComponentLoader } from '@microsoft/sp-loader';
// import * as ExcelJS from 'exceljs';
// import { saveAs } from 'file-saver';
// import { IExportColumns } from "../models/ExportColumn";

// const ttfFont: string = require("../assets/fonts/Helvetica.ttf");
// export const getUniueRecordsByColumnName = (items: any[], columnName: string) => {
//     const lookup: any = {};
//     const result: any[] = [];
//     if (!!items) {
//         for (let index = 0; index < items?.length; index++) {
//             const item = items[index];
//             const name = item[columnName];
//             if (!(name in lookup)) {
//                 lookup[name] = 1;
//                 result.push(item);
//             }
//         }
//         return result;
//     }
//     else {
//         return [];
//     }
// };

// export function SortArray(array: any[]): any[] {
//     const sortedArray = array.sort((p1, p2) => (p1.label > p2.label) ? 1 : (p1.label < p2.label) ? -1 : 0);
//     return sortedArray;
// }

// export const formatBytes = (bytes: any, decimals = 2) => {
//     if (!+bytes) return '0 Bytes';

//     const k = 1024;
//     const dm = decimals < 0 ? 0 : decimals;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
// };
// const GetImgUrlByFileExtension = (extension: string): string => {
//     // let imgType = "genericfile.png";
//     let imgType = `${extension}.svg`;
//     switch (extension) {
//         case "jpg":
//         case "jpeg":
//         case "jfif":
//         case "gif":
//         case "png":
//             imgType = "photo.png";
//             break;
//         case "pptx":
//         case "docx":
//         case "xlsx":
//             imgType = `${extension}.svg`;
//             break;
//         case "ppt":
//         case "doc":
//         case "xls":
//             imgType = `${extension}x.svg`;
//             break;
//         case "pdf":
//             imgType = "pdf.svg";
//             break;
//         case "folder":
//             imgType = "folder.svg";
//             break;
//         case "tsx":
//             imgType = "page.svg";
//             break;
//         default:
//             imgType = "txt.svg";
//             break;


//     }
//     return `https://res-1.cdn.office.net/files/fabric-cdn-prod_20221209.001/assets/item-types/16/${imgType}`;
// };

// export const getFileTypeIcon = (fileName: string): string => {
//     const fileType: any = fileName?.split('.').pop();
//     return GetImgUrlByFileExtension(fileType);
// };

// export const getCAMLQueryFilterExpression = (filterFields: ICamlQueryFilter[]) => {
//     const categoriesExpressions = filterFields?.map((item: ICamlQueryFilter) => {
//         let expression: any;

//         switch (item.fieldType) {
//             case FieldType.Boolean:
//                 expression = CamlBuilder.Expression().BooleanField(item.fieldName);
//                 break;
//             case FieldType.Text:
//                 expression = CamlBuilder.Expression().TextField(item.fieldName);
//                 break;
//             case FieldType.DateTime:
//                 expression = CamlBuilder.Expression().DateField(item.fieldName);
//                 break;
//             case FieldType.LookupById:
//                 expression = CamlBuilder.Expression().LookupField(item.fieldName).Id();
//                 break;
//             case FieldType.LookupByValue:
//                 expression = CamlBuilder.Expression().LookupField(item.fieldName).ValueAsText();
//                 break;
//             case FieldType.Number:
//                 expression = CamlBuilder.Expression().NumberField(item.fieldName);
//                 break;
//             case FieldType.Integer:
//                 expression = CamlBuilder.Expression().IntegerField(item.fieldName);
//                 break;
//             default:
//                 expression = CamlBuilder.Expression().TextField(item.fieldName);
//         }

//         switch (item.LogicalType) {
//             case LogicalType.EqualTo:
//                 expression.EqualTo(item.fieldValue);
//                 break;
//             case LogicalType.NotEqualTo:
//                 expression.NotEqualTo(item.fieldValue);
//                 break;
//             case LogicalType.GreaterThan:
//                 expression.GreaterThan(item.fieldValue);
//                 break;
//             case LogicalType.GreaterThanOrEqualTo:
//                 expression.GreaterThanOrEqualTo(item.fieldValue);
//                 break;
//             case LogicalType.LessThan:
//                 expression.LessThan(item.fieldValue);
//                 break;
//             case LogicalType.LessThanOrEqualTo:
//                 expression.LessThanOrEqualTo(item.fieldValue);
//                 break;
//             case LogicalType.Contains:
//                 expression.Contains(item.fieldValue);
//                 break;
//             case LogicalType.IsNotNull:
//                 expression.IsNotNull();
//                 break;
//             case LogicalType.In:
//                 expression.In(item.fieldValue);
//                 break;
//         }

//         return expression;
//     });
//     return categoriesExpressions;
// }

// export const getErrorMessage = (error: any) => {
//     try {
//         return JSON.parse(error.message);
//     }
//     catch (e) {
//         return e;
//     }
// }

// export const getNumberValue = (value: any): number => {
//     const parsedValue = parseFloat(value);
//     return isNaN(parsedValue) ? 0 : parsedValue;
// }

// export const getStringValue = (value: any): string => value || "";

// export const getLookupValueCAML = (value: any): string =>
//     Array.isArray(value) && value.length > 0 ? value[0]?.lookupValue ?? "" : "";

// export const getLookupIdCAML = (value: any): number =>
//     Array.isArray(value) && value.length > 0 ? value[0]?.lookupId ?? -1 : -1;

// export const getPeoplePickerValueCAML = (value: any, field: string): string =>
//     Array.isArray(value) && value.length > 0 ? value[0][field] ?? "" : "";

// export const getPeoplePickerIdCAML = (value: any): number =>
//     Array.isArray(value) && value.length > 0 ? value[0]?.id ?? null : null;

// export const getLookUpOrPeoplePickerValue = (value: any, field: string): string => {
//     return !!value ? value[field] ?? "" : "";
// }

// export function splitIntoBatches<T>(array: T[], batchSize: number): T[][] {
//     const batches: T[][] = [];
//     for (let i = 0; i < array.length; i += batchSize) {
//         batches.push(array.slice(i, i + batchSize));
//     }
//     return batches;
// }

// /*
// TODO: this method will generate excel file from the given data.
// ! First parameter is data.
// ! second parameter is file. And File name must contains the xlsx extension.
// */
// export function generateExcelFile<T>(data: T[], fileName: string = "DataFile.xlsx") {
//     try {
//         const wb = utils.book_new();
//         const ws: any = utils.json_to_sheet(data);
//         utils.book_append_sheet(wb, ws, "Sheet1");
//         writeFile(wb, fileName);
//     } catch (e) {
//         return false;
//     }
//     return true;
// }

// export function generateExcelTable<T>(rows: T[], columns: IExportColumns[], fileName: string = "DataFile.xlsx") {
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('My Sheet');
//     // Add table to the worksheet
//     const tableColumns = columns?.filter((col: any) => {
//         const lowerCaseName = col.header?.toString().toLowerCase();
//         return lowerCaseName !== "action" && lowerCaseName !== "actions";
//     });

//     worksheet.addTable({
//         name: 'MyTable',
//         ref: 'A1',
//         headerRow: true,
//         totalsRow: false,
//         style: {
//             theme: 'TableStyleMedium9',
//             showRowStripes: true,
//         },
//         columns: tableColumns.map(col => ({ name: col.header, filterButton: true })),
//         rows: rows.map((row: any) => tableColumns.map((col: any) => row[col.key])),
//     });

//     // Enable word wrap for each cell in the table
//     for (let rowIndex = 0; rowIndex <= rows.length; rowIndex++) { // +1 to include header row
//         for (let colIndex = 0; colIndex < tableColumns.length; colIndex++) {
//             const cell = worksheet.getCell(`${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`);
//             cell.alignment = { wrapText: true };
//         }
//     }

//     // Adjust column widths to fit content
//     tableColumns.forEach((col, colIndex) => {
//         const columnLetter = String.fromCharCode(65 + colIndex); // Convert colIndex to corresponding column letter (A, B, C, etc.)
//         let maxLength = col.header.length; // Start with header length

//         rows.forEach((row: any) => {
//             const cellValue = row[col.key] ? row[col.key].toString() : '';
//             maxLength = Math.max(maxLength, cellValue.length);
//         });

//         worksheet.getColumn(columnLetter).width = maxLength + 5; // Add some padding
//     });

//     // Generate Excel file buffer and save
//     workbook.xlsx.writeBuffer().then((buffer: any) => {
//         const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//         saveAs(blob, fileName);
//     });
// }

// /*
// TODO: This method will check value is present or not. Similar to ASP.net string.isNullOrEmpty.
// ! takes 1 parameter for value and return true or false.
// */

// export function isNullOrEmpty<T>(value: T | null | undefined): boolean {
//     if (value === null || value === undefined) {
//         return true;
//     }

//     if (typeof value === 'string' && value.trim() === '') {
//         return true;
//     }

//     if (Array.isArray(value) && value.length === 0) {
//         return true;
//     }

//     if (isObject(value) && Object.keys(value).length === 0) {
//         return true;
//     }

//     return false;
// }

// function isObject(value: any): value is object {
//     return typeof value === 'object' && value !== null;
// }


// export const GetFilterValues = (column: any, arrayObjects: any[], onFilterClickCallback: (ev?: React.MouseEvent<HTMLElement>, item?: IContextualMenuItem) => void): IContextualMenuItem[] => {

//     const filters: IContextualMenuItem[] = [];
//     for (let i = 0; i < arrayObjects.length; i++) {
//         const item = arrayObjects[i];
//         const value: string = item[column.key];
//         if (item[column.key]) {
//             //in case we have specific column, we can add more complex logic
//             if (column.data === "Taxonomy") {
//                 const columnValue: string = item[column.key];
//                 const valuesAsStrings: string[] = columnValue.split(";");
//                 valuesAsStrings.map((termValue) => {
//                     termValue = termValue.trim();
//                     if (termValue && !_IsValuePresented(filters, termValue)) {
//                         filters.push(
//                             {
//                                 key: termValue,
//                                 name: termValue,
//                                 text: termValue,
//                                 data: column.key,
//                                 // onClick: onFilterClickCallback,
//                                 isChecked: i === 0 ? true : false
//                             });
//                     }
//                 });
//             }
//             else {
//                 if (!_IsValuePresented(filters, value)) {
//                     filters.push(
//                         {
//                             key: value,
//                             name: value,
//                             data: column.key,
//                             text: value,
//                             // onClick: onFilterClickCallback,
//                             isChecked: i === 0 ? true : false
//                         });
//                 }
//             }
//         }
//     }

//     return filters;
// }
// export const _IsValuePresented = (currentValues: IContextualMenuItem[], newValue: string): boolean => {

//     for (let i = 0; i < currentValues.length; i++) {
//         if (currentValues[i].key === newValue) {
//             return true;
//         }
//     }
//     return false;
// }

// export const GetSortingMenuItems = (column: any, onSortColumn: (column: any, isSortedDescending: boolean) => void): IContextualMenuItem[] => {
//     const menuItems = [];
//     if (column.data === Number) {
//         menuItems.push(
//             {
//                 key: 'smallToLarger',
//                 name: 'Smaller to larger',
//                 canCheck: true,
//                 checked: column.isSorted && !column.isSortedDescending,
//                 onClick: () => onSortColumn(column, false)
//             },
//             {
//                 key: 'largerToSmall',
//                 name: 'Larger to smaller',
//                 canCheck: true,
//                 checked: column.isSorted && column.isSortedDescending,
//                 onClick: () => onSortColumn(column, true)
//             }
//         );
//     }
//     else if (column.data === Date) {
//         menuItems.push(
//             {
//                 key: 'oldToNew',
//                 name: 'Older to newer',
//                 canCheck: true,
//                 checked: column.isSorted && !column.isSortedDescending,
//                 onClick: () => onSortColumn(column, false)
//             },
//             {
//                 key: 'newToOld',
//                 name: 'Newer to Older',
//                 canCheck: true,
//                 checked: column.isSorted && column.isSortedDescending,
//                 onClick: () => onSortColumn(column, true)
//             }
//         );
//     }
//     else
//     //(column.data == String)
//     // NOTE: in case of 'complex columns like Taxonomy, you need to add more logic'
//     {
//         menuItems.push(
//             {
//                 key: 'aToZ',
//                 name: 'A to Z',
//                 canCheck: true,
//                 checked: column.isSorted && !column.isSortedDescending,
//                 onClick: () => onSortColumn(column, false)
//             },
//             {
//                 key: 'zToA',
//                 name: 'Z to A',
//                 canCheck: true,
//                 checked: column.isSorted && column.isSortedDescending,
//                 onClick: () => onSortColumn(column, true)
//             }
//         );
//     }
//     return menuItems;
// }
// export const getUniueRecordsByTwoColumnName = (items: any[], columnOne: string, columnTwo: string) => {
//     const lookup: any = {};
//     const result: any[] = [];
//     for (let index = 0; index < items.length; index++) {
//         const item = items[index];
//         const name = item[columnOne] + item[columnTwo];
//         if (!(name in lookup)) {
//             lookup[name] = 1;
//             result.push(item);
//         }
//     }
//     return result;
// }


// export const generateAndSavePDF = async (divID: string, pdfName: string, type: string) => {
//     try {
//         const calendarElement = document.getElementById(`${divID}`);
//         // Check if calendarElement exists before proceeding
//         if (!calendarElement) {
//             console.error('Calendar container element not found.');
//             return;
//         }
//         const calendarRect = calendarElement.getBoundingClientRect();
//         switch (type) {
//             case "type1":
//                 html2canvas(calendarElement, {
//                     scale: 3
//                 }).then(canvas => {
//                     const imgData = canvas.toDataURL('image/png');
//                     const pdf = new jsPDF('landscape', 'px', [calendarRect.width * 2, calendarRect.height * 2]); // Create a PDF with landscape orientation and match the calendar's dimensions
//                     const marginTop = 50; // Margin from the top of the page
//                     pdf.addImage(imgData, 'PNG', 0, marginTop, calendarRect.width * 2, calendarRect.height * 2 - marginTop);
//                     pdf.save(`${pdfName}.pdf`);
//                 });

//                 break;

//             case "type2":
//                 html2canvas(calendarElement, {
//                     scale: 3
//                 }).then(canvas => {
//                     const imgData = canvas.toDataURL('image/png');

//                     // A4 dimensions in pixels at 72 DPI
//                     const a4Width = 595.28;
//                     const a4Height = 841.89;

//                     // Calculate the scaling factor to fit the calendar within A4 size
//                     const aspectRatio = calendarRect.width / calendarRect.height;
//                     let scaledWidth, scaledHeight;

//                     if (aspectRatio > 1) {
//                         // Landscape orientation
//                         scaledWidth = a4Width;
//                         scaledHeight = a4Width / aspectRatio;
//                     } else {
//                         // Portrait orientation
//                         scaledWidth = a4Height * aspectRatio;
//                         scaledHeight = a4Height;
//                     }

//                     const pdf = new jsPDF('portrait', 'pt', 'a4'); // Create a PDF with A4 size
//                     // const marginTop = (a4Height - scaledHeight) / 2; // Center the image vertically

//                     pdf.addImage(imgData, 'PNG', 0, 0, scaledWidth, scaledHeight);
//                     pdf.save(`${pdfName}.pdf`);
//                 });

//                 break;

//             case "type3":
//                 generateAndSaveKendoPDF(divID, pdfName);
//                 break;
//             default:
//                 break;
//         }



//     } catch (error) {
//         console.log("generateAndSavePDF " + error);
//     }


// };

// const convertImageToBase64 = (imgUrl: string): Promise<string> => {
//     return new Promise<string>((resolve, reject) => {
//         const img = new Image();
//         img.crossOrigin = 'Anonymous'; // Ensure CORS compliance
//         img.src = imgUrl;

//         img.onload = () => {
//             const canvas = document.createElement('canvas');
//             canvas.width = img.width;
//             canvas.height = img.height;
//             const ctx = canvas.getContext('2d');
//             if (ctx) {
//                 ctx.drawImage(img, 0, 0);
//                 resolve(canvas.toDataURL('image/png'));
//             } else {
//                 reject('Unable to get canvas context');
//             }
//         };

//         img.onerror = (error) => reject(`Failed to load image: ${imgUrl}`);
//     });
// };

// export const generateAndSaveKendoPDF = async (
//     divID: string,
//     pdfName: string,
//     isDisplayNone?: boolean,
//     downloadPDF?: boolean,
// ): Promise<Blob | null> => {
//     try {
//         // Load jQuery and Kendo libraries
//         const jQueryUrl = 'https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/jquery-3.6.0.min.js';
//         const kendoUrl = "https://publiccdn.sharepointonline.com/treta.sharepoint.com/sites/TretaCDN/CDN/JS/kendo.all.min.js";

//         await SPComponentLoader.loadScript(jQueryUrl, { globalExportsName: 'jQuery' });
//         await SPComponentLoader.loadScript(kendoUrl, { globalExportsName: 'kendo' });

//         try {
//             (window as any).kendo.pdf.defineFont({
//                 "Gilroy": ttfFont,
//             });

//             const logoElement = document.querySelector(`#${divID} img.qclogoims`);
//             if (logoElement) {
//                 const imageSRC = (logoElement as HTMLImageElement).src;
//                 const logoBase64 = await convertImageToBase64(imageSRC);
//                 (logoElement as HTMLImageElement).src = logoBase64;
//             }
//         } catch (fontError) {
//             console.error("Error defining font:", fontError);
//         }

//         const element = document.getElementById(divID);
//         if (!element) {
//             throw new Error(`Element with ID ${divID} not found.`);
//         }
//         else {
//             element.classList.remove('dnone');
//         }
//         document.querySelectorAll(`#${divID} .noExport`).forEach((el: HTMLElement) => {
//             el.style.display = 'none';
//         });
//         // Function to ensure all images are loaded

//         // try {
//         //     const loadImages = (container: HTMLElement): Promise<void> => {
//         //         const images = container.querySelectorAll('img');
//         //         const promises = Array.from(images).map((img) => {
//         //             return new Promise<void>((resolve, reject) => {
//         //                 if (img.complete) {
//         //                     resolve(); // Image is already loaded
//         //                 } else {
//         //                     img.onload = () => resolve(); // Image loaded successfully
//         //                     img.onerror = () => reject(`Failed to load image: ${img.src}`); // Failed to load image
//         //                 }
//         //             });
//         //         });
//         //         return Promise.all(promises).then(() => undefined);
//         //     };


//         //     await loadImages(element);
//         // } catch (fontError) {
//         //     console.error("Error defining font:", fontError);
//         // }
//         await new Promise((resolve) => setTimeout(resolve, 200)); // Add 200ms delay

//         // Generate PDF and return the Blob
//         const pdfData: Blob | null = await new Promise<Blob | null>((resolve, reject) => {
//             (window as any).kendo.drawing.drawDOM(`#${divID}`, {
//                 forcePageBreak: ".page-break",
//                 paperSize: "Letter",
//                 margin: {
//                     top: "0.1in",
//                     bottom: "0.1in",
//                     left: "0.1in",
//                     right: "0.1in"
//                 },
//                 multiPage: true,
//                 scale: 0.8,
//                 keepTogether: ".keep-together"
//             }).then((group: any) => {
//                 return (window as any).kendo.drawing.exportPDF(group);
//             }).then((dataURI: string) => {
//                 document.querySelectorAll(`#${divID} .noExport`).forEach((el: HTMLElement) => {
//                     el.style.display = 'block';
//                 });

//                 if (downloadPDF) {
//                     (window as any).kendo.saveAs({
//                         dataURI: dataURI,
//                         fileName: `${pdfName}.pdf`
//                     });
//                 }

//                 if (isDisplayNone != false && element) {
//                     element.classList.add('dnone');
//                 }

//                 // Convert the data URI to a blob
//                 const byteCharacters = atob(dataURI.split(',')[1]);
//                 const byteNumbers = new Array(byteCharacters.length);
//                 for (let i = 0; i < byteCharacters.length; i++) {
//                     byteNumbers[i] = byteCharacters.charCodeAt(i);
//                 }
//                 const byteArray = new Uint8Array(byteNumbers);
//                 const blob = new Blob([byteArray], { type: "application/pdf" });

//                 resolve(blob);
//             }).catch((error: any) => {
//                 console.error("Failed to generate PDF:", error);
//                 reject(error);
//             });
//         });

//         return pdfData; // Return the generated Blob

//     } catch (error) {
//         console.error('Error generating or saving PDF:', error);
//         return null;
//     }
// };

// export const getLoopCount = (itemCount: number, recordSize: any) => {
//     const oddItems = itemCount % recordSize
//     let totalPage;
//     // let FinalPage;

//     if (oddItems > 0) {
//         totalPage = (itemCount / recordSize)
//         // FinalPage = totalPage.toString().split(".", 1)
//         totalPage = totalPage.toString().split(".", 2)
//         totalPage = totalPage[1]
//         if (totalPage >= "5") {
//             const page = (itemCount / recordSize)
//             totalPage = Math.round(page)
//         }
//         else {
//             const page = (itemCount / recordSize)
//             totalPage = Math.round(Number(page)) + 1
//         }
//     }
//     else {
//         totalPage = (itemCount / recordSize)
//     }
//     return totalPage;
// }
// export function generateUID() {
//     // I generate the UID from two parts here
//     // to ensure the random number provide enough bits.
//     let firstPart: any = (Math.random() * 46656);
//     let secondPart: any = (Math.random() * 46656);
//     firstPart = ("000" + firstPart.toString(36)).slice(-10);
//     secondPart = ("000" + secondPart.toString(36)).slice(-10);
//     return firstPart + secondPart;
// }
// export const _copyAndSort = (items: any[], columnKey: string, isSortedDescending?: boolean) => {
//     const key = columnKey as keyof any;
//     return items.slice(0).sort((a: any, b: any) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
// }