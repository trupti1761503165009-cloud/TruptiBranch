// import { IDetailsHeaderProps, IRenderFunction } from "@fluentui/react";
// import { IColumn, DetailsList, Selection, SelectionMode, ConstrainMode, IDetailsHeaderProps, IRenderFunction, StickyPositionType, IListProps, DetailsRow, IDetailsListProps, IDetailsRowStyles, DetailsHeader, IGroupDividerProps, IDetailsGroupRenderProps, Icon, Link } from "office-ui-fabric-react";


// export interface IDataGridStates {
//     allColumns: ICustomColumn[],
//     filteredItems: any[],
//     allItems: any[],
//     detailsListProps: any;
//     searchText: string;
//     nextData?: any;
//     currentSortingcolumn?: ICustomColumn | undefined;
// }

// export const onDetailListHeaderRender = (detailsHeaderProps: IDetailsHeaderProps, defaultRender: IRenderFunction<IDetailsHeaderProps>): any => {
//     return defaultRender({
//         ...detailsHeaderProps,
//         styles: {
//             root: {
//                 selectors: {
//                     '.ms-DetailsHeader-cell': {
//                         whiteSpace: 'normal',
//                         textOverflow: 'clip',
//                         lineHeight: 'normal',
//                         background: "#2591a7",
//                         color: "#fff",
//                         fontSize: "13px"
//                     },
//                     '.ms-DetailsHeader-cell:hover': {
//                         background: "#2591a7",
//                         color: "#fff",
//                         fontSize: "13px"
//                     },
//                     '.ms-DetailsHeader-cellTitle': {
//                         height: '100%',
//                         alignItems: 'center'
//                     },
//                     '.ms-Icon': {
//                         color: '#ffffff',
//                     }

//                 },
//             }
//         }
//     })
// };

// export function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending = false): T[] {
//     const key = columnKey as keyof T;

//     return items.slice(0).sort((a: T, b: T) => {
//         const aValue = a[key];
//         const bValue = b[key];

//         // Handle undefined/null values
//         if (aValue == null && bValue == null) return 0;
//         if (aValue == null) return isSortedDescending ? 1 : -1;
//         if (bValue == null) return isSortedDescending ? -1 : 1;

//         // Handle dates
//         if (aValue instanceof Date && bValue instanceof Date) {
//             return isSortedDescending
//                 ? bValue.getTime() - aValue.getTime()
//                 : aValue.getTime() - bValue.getTime();
//         }
//         // Handle arrays of strings
//         if (Array.isArray(aValue) && Array.isArray(bValue)) {
//             const aJoined = aValue.join(', ').toLowerCase();
//             const bJoined = bValue.join(', ').toLowerCase();
//             return isSortedDescending
//                 ? bJoined.localeCompare(aJoined)
//                 : aJoined.localeCompare(bJoined);
//         }
//         // Default string comparison
//         if (typeof aValue === 'string' && typeof bValue === 'string') {
//             return isSortedDescending
//                 ? bValue.localeCompare(aValue)
//                 : aValue.localeCompare(bValue);
//         }

//         // Default numeric comparison
//         if (typeof aValue === 'number' && typeof bValue === 'number') {
//             return isSortedDescending ? bValue - aValue : aValue - bValue;
//         }

//         // Fallback
//         return 0;
//     });
// }



// export const _generateDynamicColumn = (columns: ICustomColumn[], _onColumnClick: any) => {
//     const IColumArray = ["key", "name", "fieldName", "flexGrow", "className", "styles", 'minWidth', "targetWidthProportion", "ariaLabel", "isRowHeader", "maxWidth", "columnActionsMode", "iconName", "isIconOnly", "iconClassName", "isCollapsable", "isCollapsible", "showSortIconWhenUnsorted", "isSorted", "isSortedDescending", "isResizable", "isMultiline", "onRender", "getValueKey", "onRenderField", "onRenderDivider", "onRenderFilterIcon", "onRenderHeader", "isFiltered", "onColumnClick", "onColumnContextMenu", "onColumnResize", "isGrouped", "data", "calculatedWidth", "currentWidth", "headerClassName", "isPadded", "sortAscendingAriaLabel", "sortDescendingAriaLabel", "sortableAriaLabel", "groupAriaLabel", "filterAriaLabel", "isMenuOpen"];
//     const allColumns: ICustomColumn[] = [];
//     for (let index = 0; index < columns.length; index++) {
//         const element: ICustomColumn = columns[index];
//         const obj: any = {
//             isPadded: true,
//             isRowHeader: true,
//             isResizable: true,
//         };
//         for (const key in element) {
//             if (Object.prototype.hasOwnProperty.call(element, key)) {
//                 const el = element[key as keyof ICustomColumn];
//                 if (IColumArray.indexOf(key) > -1) {
//                     obj[key] = el;
//                 }
//                 if (key === "isSortingRequired" && element[key]) {
//                     obj.onColumnClick = _onColumnClick
//                 }
//             }
//         }
//         allColumns.push(obj);
//     }
//     return allColumns;
// }

// export const setColumnProperties = (data: React.MutableRefObject<IDataGridStates>, column: ICustomColumn) => {
//     const newColumns: ICustomColumn[] = data.current.allColumns.slice();
//     const currColumn: ICustomColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
//     newColumns.forEach((newCol: ICustomColumn) => {
//         if (newCol === currColumn) {
//             currColumn.isSortedDescending = !currColumn.isSortedDescending;
//             currColumn.isSorted = true;
//         } else {
//             newCol.isSorted = false;
//             newCol.isSortedDescending = true;
//         }
//     });
//     return { newColumns, currColumn };
// }