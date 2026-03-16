// /* eslint-disable @typescript-eslint/no-non-null-assertion */
// /* eslint-disable @typescript-eslint/no-use-before-define */
// import * as React from 'react';

// import { useState, useEffect, useReducer, useRef } from 'react';
// import {
//    CheckboxVisibility, ScrollablePane, ScrollbarVisibility, SearchBox,
//    IDetailsHeaderProps, IRenderFunction, Sticky, StickyPositionType, PrimaryButton, ConstrainMode, Selection, SelectionMode,
//    ShimmeredDetailsList
// } from '@fluentui/react';
// import { NoRecordFound } from '../NoRecordFound';
// import { ICustomColumn } from './DataGridComponent';
// import { SeachboxAlignment, SortOrder } from './constant/DetailListEnum';
// import { IDataGridStates, _generateDynamicColumn, onDetailListHeaderRender, setColumnProperties } from './DetailListCommon';

// import { utils, writeFile } from 'xlsx';
// import { ICamlQueryFilter } from '../../../../Shared/Enum/CamlQueryFilter';
// import { ComponentName } from '../../../../Shared/Enum/ComponentName';
// import { ListNames } from '../../../../Shared/Enum/ListNames';
// import { ImportExcel } from '../importExcel/ImportExcel';





// interface IAddNewItemProps {
//    isAddNewItem: boolean;
//    addNewItemClick: (_componentName: string) => void;
//    addNewItemComponentName: ComponentName;
//    currentComponentName: ComponentName;
//    buttonName: string;
// }

// interface IImportExcelProps {
//    isImportExcel: boolean;
//    importFileColumnNames: any[]
//    reloadData: any;
//    listName: ListNames;
// }

// interface IDataProps {
//    items: any[],
//    nextData: any;
//    loadData: (pageToken: string, sortOptions: { sortColumn: string, sortOrder: SortOrder }, filterFields?: ICamlQueryFilter[]) => any;
//    mappingData: (listItems: any) => any[];
//    isLoading: boolean;
//    columns: ICustomColumn[];
//    filterFields?: ICamlQueryFilter[];
// }
// interface IOtherProps {
//    pageSize?: number;
//    reduceHeight?: number;
//    searchAlignment?: SeachboxAlignment | SeachboxAlignment.left;
//    customOnDetailListHeaderRender?: any;
//    isDisplayScrollablePane?: boolean;
// }

// type IShimmeredDetailsListProps = {
//    dataProps: IDataProps;
//    reRenderComponent?: boolean;
//    addNewItem?: IAddNewItemProps;
//    importExcel?: IImportExcelProps;
//    isExportaToExcel?: boolean;
//    otherProps?: IOtherProps;
//    onItemInvoked?: (item?: any, index?: number, ev?: Event) => void;
//    onSelectionChange?: (item?: any, index?: number, ev?: Event) => void;
// }

// const ShimmeredDetailsListCAML: React.FC<IShimmeredDetailsListProps> = (props: IShimmeredDetailsListProps) => {
//    const { columns, nextData, isLoading, items, loadData, mappingData, filterFields } = props.dataProps;
//    const { importExcel, onSelectionChange } = props;
//    const _isDisplayScrollablePane = props.otherProps?.isDisplayScrollablePane || false;
//    const _searchAlignment = props.otherProps?.searchAlignment || SeachboxAlignment.left;
//    const [, forceUpdate] = useReducer(x => x + 1, 0);
//    const [pagedItemData, setpagedItemData] = useState<any[]>([]);
//    const [heightOfContainer, setHeightOfContainer] = React.useState<number>(Math.round(window.innerHeight) - 250);

//    const defaultStates: IDataGridStates = {
//       allColumns: [],
//       filteredItems: [],
//       allItems: [],
//       detailsListProps: {},
//       searchText: "",
//       nextData: null,
//       currentSortingcolumn: undefined
//    }

//    const data = useRef(defaultStates);
//    const getHeight = (topHeight: number): number => {
//       if (document.getElementsByClassName("ms-DetailsList").length > 0) {
//          const detailListHeight = document.getElementsByClassName("ms-DetailsList")[0].clientHeight;
//          const fullHeight = Math.round(window.innerHeight) - topHeight;
//          return (detailListHeight < fullHeight ? (detailListHeight + 20) : fullHeight)
//       }
//       else {
//          return Math.round(window.innerHeight) - topHeight;
//       }
//    }

//    const setGridHeight = () => {
//       setTimeout(() => {
//          const _componentHeight = getHeight(props.otherProps?.reduceHeight || 275);
//          setHeightOfContainer(_componentHeight);
//       }, 200);
//    }

//    const handleScroll = (event: any) => {
//       try {
//          if (event.target.clientHeight >= Math.round(event.target.scrollHeight - event.target.scrollTop) && event.target.scrollTop > 0) {
//             void (async function (): Promise<void> {
//                if (!!data.current.nextData?.NextHref) {
//                   const sortColumn = data.current.currentSortingcolumn?.fieldName || "ID";
//                   const sortOrder = data.current.currentSortingcolumn === undefined ? SortOrder.Descending : (data.current.currentSortingcolumn?.isSortedDescending ? SortOrder.Descending : SortOrder.Ascending);
//                   const sortOption = { sortColumn: sortColumn, sortOrder: sortOrder }
//                   const localResponse = await loadData(data.current.nextData.NextHref.split('?')[1], sortOption, filterFields);
//                   const listItems = mappingData(localResponse?.Row);
//                   setpagedItemData((prevItems) => [...prevItems, ...listItems]);
//                   data.current = {
//                      ...data.current,
//                      nextData: localResponse,
//                      filteredItems: [...pagedItemData, ...listItems],
//                   }
//                }
//             })();
//          }
//       } catch (error) {
//          console.log("Error in on scroll event");
//       }
//    };

//    const _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: ICustomColumn): void => {
//       const { newColumns, currColumn }: { newColumns: ICustomColumn[]; currColumn: ICustomColumn; } = setColumnProperties(data, column);
//       const detailsListObj = { ...data.current.detailsListProps, columns: newColumns };
//       void (async function (): Promise<void> {
//          const sortColumn = currColumn?.fieldName || "ID";
//          const sortOrder = (currColumn.isSortedDescending ? SortOrder.Descending : SortOrder.Ascending);
//          const sortOption = { sortColumn: sortColumn, sortOrder: sortOrder }
//          const localResponse = await loadData("", sortOption, filterFields);
//          const listItems = mappingData(localResponse?.Row);
//          setpagedItemData([]);
//          setpagedItemData(listItems);
//          data.current = {
//             ...data.current,
//             allColumns: newColumns,
//             nextData: localResponse,
//             filteredItems: listItems,
//             detailsListProps: detailsListObj,
//             currentSortingcolumn: currColumn
//          }
//          forceUpdate();
//       })();
//    };

//    const _selection = new Selection({
//       onSelectionChanged: () => getSelectionDetails()
//    });

//    const getSelectionDetails = (): any => {
//       if (onSelectionChange) {
//          const selectionCount = _selection.getSelectedCount();
//          if (selectionCount > 0) {
//             onSelectionChange(_selection.getSelection());
//          } else {
//             onSelectionChange([]);
//          }
//       }
//    };

//    useEffect(() => {
//       let detailsListObj = {};
//       setpagedItemData([]);
//       if (!!columns && columns.length > 0) {
//          detailsListObj = {
//             ...detailsListObj,
//             columns: _generateDynamicColumn(columns, _onColumnClick)
//          }
//       }
//       if (!!props.onItemInvoked) {
//          detailsListObj = {
//             ...detailsListObj,
//             onItemInvoked: props.onItemInvoked
//          }
//       }
//       if (!!props.onSelectionChange) {
//          detailsListObj = {
//             ...detailsListObj,
//             selection: _selection,
//             selectionMode: SelectionMode.multiple,
//             checkboxVisibility: CheckboxVisibility.always
//          }
//       }
//       else {
//          detailsListObj = {
//             ...detailsListObj,
//             selectionMode: SelectionMode.none
//          }
//       }
//       // console.log("nextData", nextData);
//       data.current = {
//          ...data.current,
//          allColumns: (!!columns && columns.length > 0) ? _generateDynamicColumn(columns, _onColumnClick) : [],
//          filteredItems: items,
//          allItems: items,
//          detailsListProps: detailsListObj,
//          nextData: nextData,
//          currentSortingcolumn: columns.filter(item => item.isSorted)[0]
//       };
//       setGridHeight();
//       setpagedItemData(items);
//       forceUpdate();
//    }, [items, nextData]);

//    const onSearch = (arrayList: any[], searchkey: string): any[] => {
//       if (!!searchkey && searchkey.trim().length > 0) {
//          searchkey = searchkey.trim().toString().toLowerCase();
//          return arrayList.filter((obj: any) => {
//             return Object.keys(obj).some((key: string) => {
//                return !!obj[key] ? obj[key].toString().toLowerCase().includes(searchkey) : false;
//             })
//          });
//       } else {
//          return arrayList;
//       }
//    };

//    const _onClickExportToExcel = React.useCallback(() => {
//       let fileData: any[] = [];
//       if (!!columns && columns.length > 0) {
//          for (let index = 0; index < data.current.filteredItems.length; index++) {
//             const element = data.current?.filteredItems[index];
//             const obj: any = {};
//             for (let i = 0; i < columns.length; i++) {
//                const cols = columns[i];
//                if (!!cols) {
//                   const _fieldName = cols.fieldName || "";
//                   obj[cols.name] = element[_fieldName];
//                }
//             }
//             fileData.push(obj);
//          }
//       } else {
//          fileData = data.current.filteredItems;
//       }
//       const wb = utils.book_new()
//       const ws: any = utils.json_to_sheet(fileData);
//       utils.book_append_sheet(wb, ws, "Sheet1")
//       writeFile(wb, "datafile.xlsx");
//    }, [data.current.filteredItems]);

//    const _onAddNewItemClicked = React.useCallback(() => {
//       if (props?.addNewItem?.addNewItemClick)
//          props?.addNewItem?.addNewItemClick(props?.addNewItem?.addNewItemComponentName);
//    }, []);

//    const _onSearchTextChange = React.useCallback((text: string | undefined) => {
//       const filteredData = onSearch(data.current.allItems, text || "");
//       data.current = {
//          ...data.current,
//          filteredItems: filteredData,
//          searchText: text || ""
//       };
//       forceUpdate();
//       setpagedItemData(filteredData);
//       setGridHeight();
//    }, []);

//    return (
//       <div className="ms-Grid">
//          <div className="ms-Grid-row">
//             <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 ms-xxl12 ms-xxl12"
//                style={{ display: "flex", justifyContent: (_searchAlignment) }}>
//                <div style={{ width: "200px" }}>
//                   <SearchBox
//                      placeholder="Search"
//                      onChange={(_, newValue) => _onSearchTextChange(newValue)}
//                      value={data.current.searchText}
//                   />
//                </div>
//                {!!props.isExportaToExcel && props.isExportaToExcel &&
//                   <div style={{ paddingLeft: "10px" }}>
//                      <PrimaryButton text="Export To Excel" className='btn-primary' onClick={_onClickExportToExcel} />
//                   </div>
//                }
//                {!!props?.addNewItem?.isAddNewItem && props?.addNewItem?.isAddNewItem &&
//                   <div style={{ position: "absolute", right: "8px" }}>
//                      <PrimaryButton text={props?.addNewItem?.buttonName}
//                         className='btn-primary' onClick={_onAddNewItemClicked} />
//                   </div>
//                }
//                {!!importExcel?.isImportExcel && importExcel?.isImportExcel &&
//                   <div style={{ position: "absolute", right: "8px", minWidth: "150" }}>
//                      <ImportExcel
//                         columnsToRead={importExcel?.importFileColumnNames}
//                         listName={importExcel?.listName}
//                         cancelOrSuccessClick={importExcel?.reloadData} />
//                   </div>
//                }
//             </div>
//          </div>
//          <div className="ms-Grid-row mt-2">
//             <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
//                {data.current.filteredItems.length > 0 && _isDisplayScrollablePane &&
//                   <div style={{ position: "relative", height: `${heightOfContainer}px` }}>
//                      <ScrollablePane initialScrollPosition={0} scrollbarVisibility={ScrollbarVisibility.auto} onScroll={handleScroll}>
//                         <ShimmeredDetailsList
//                            {...data.current.detailsListProps}
//                            items={pagedItemData || []}
//                            onRenderDetailsHeader={(detailsHeaderProps: IDetailsHeaderProps, defaultRender: IRenderFunction<IDetailsHeaderProps>) => (
//                               <Sticky stickyPosition={StickyPositionType.Both}>
//                                  {onDetailListHeaderRender(detailsHeaderProps, defaultRender)}
//                               </Sticky>
//                            )}
//                            constrainMode={ConstrainMode.unconstrained}
//                            enableShimmer={isLoading}
//                            onShouldVirtualize={() => true}
//                            listProps={{
//                               onShouldVirtualize: () => true,
//                            }}
//                         />
//                      </ScrollablePane>
//                   </div>
//                }
//                {data.current.filteredItems.length === 0 &&
//                   <NoRecordFound />
//                }
//             </div>
//          </div>
//       </div>
//    );
// }

// const customComparator = (prevProps: Readonly<IShimmeredDetailsListProps>, nextProps: Readonly<IShimmeredDetailsListProps>) => {
//    return !nextProps.reRenderComponent;
// };

// export const ShimmerDetailsListComponent = React.memo(ShimmeredDetailsListCAML, customComparator);


