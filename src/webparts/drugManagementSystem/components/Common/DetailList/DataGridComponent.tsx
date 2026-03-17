/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { CustomPagination } from "./CustomPagination";
import { SearchBox, ISearchBoxStyles } from '@fluentui/react/lib/SearchBox';

import { IColumn, DetailsList, Selection, SelectionMode, ConstrainMode, IDetailsHeaderProps, IRenderFunction, StickyPositionType, IListProps, DetailsRow, IDetailsListProps, IDetailsRowStyles, DetailsHeader, IGroupDividerProps, IDetailsGroupRenderProps, Icon, Link } from "office-ui-fabric-react";
import { Dropdown, getTheme, IGroup, mergeStyleSets, Sticky, TooltipHost } from "@fluentui/react";
import { useId } from "@fluentui/react-hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getHeight } from "../utils";
import { getHeightById, onDetailListHeaderRender, parseCustomDate } from "../Util";
import { NoRecordFound } from "../NoRecordFound";

const searchBoxStyles: Partial<ISearchBoxStyles> = {
    root: {
        border: '1px solid #e9ecef',
        borderbottom: '2px solid #acd0ec',
    }
};

interface IDetailListProps {
    items: any[] | any;
    columns: any[];
    reRenderComponent?: boolean;
    itemSelected?(id?: any): void;
    searchable?: boolean;
    pageLength?: number;
    // manageComponentView?(componentProp: IQuayCleanState): any;
    isAddNew?: boolean;
    addNewContent?: any;
    setContainerDefaultheight?: number;
    CustomselectionMode?: any;
    onItemInvoked?: any;
    addEDButton?: any;
    onSelectedItem?: any;
    _onSearchTextChangeForExcel?(filterData: any[], text?: any): void;
    isContainerHeightDisable?: boolean;
    pagination?: boolean;
    gridId?: string;
    isPagination?: boolean;
    isPageLength?: boolean;
    isNoPagination?: boolean;
    groups?: any;
    groupProps?: any;
    masterPagination?: any;
    HeaderButton?: any;
    onClickHeaderView?(filterData: any): void;
    onClickHeaderHistory?(filterData: any): void;
    onClickHeaderEdit?(filterData: any): void;
    searchText?: string;
    allData?: any[];
    edit?: boolean;
    genrateGroupBy?: any;
    isAutoHeight?: boolean;
}

export const DetaiList = (props: IDetailListProps) => {
    const { gridId, setContainerDefaultheight } = props
    const [groups, setGroups] = React.useState<any>(props?.groups)
    const [heightOfContainer, setHeightOfContainer] = React.useState<number>(Math.round(window.innerHeight) - 215);
    const [selectedDropDownLength, setSelectedDropDownLength] = React.useState<number>(!!props.pageLength ? props.pageLength : props?.masterPagination ? 50 : 50);
    const tooltipId = useId('tooltip');
    const [searchText, setSearchText] = React.useState<string>(props.searchText ? props.searchText : "");
    const [, forceUpdate] = React.useReducer(x => x + 1, 0);
    const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);
    const data = React.useRef({
        allColumns: [],
        filteredItems: [],
        allItems: [],
    });
    let _selection = new Selection({
        onSelectionChanged: () => getSelectionDetails()
    });

    const getSelectionDetails = (): any => {
        if (typeof props.onSelectedItem !== 'function') return;
        const selectionCount = _selection.getSelectedCount();
        if (selectionCount > 0) {
            props.onSelectedItem(_selection.getSelection());
        } else {
            props.onSelectedItem([]);
        }
    };

    const _onRenderDetailsHeader: IDetailsListProps['onRenderDetailsHeader'] = props => {
        if (props) {
            return <DetailsHeader {...props} ariaLabelForToggleAllGroupsButton={'Toggle selection'} />;
        }
        return null;
    };

    const _onToggleCollapse = (props: IGroupDividerProps): (() => void) => {
        return () => {
            if (props.onToggleCollapse && props.group) {

                props.onToggleCollapse(props.group);
                setTimeout(() => {
                    const _componentHeight = getHeight(!!setContainerDefaultheight ? setContainerDefaultheight : 365);
                    setHeightOfContainer(_componentHeight);
                }, 200);
            }
        };
    };
    const _clickView = (item: any) => {
        if (props.onClickHeaderView) {
            props.onClickHeaderView(item);
        }
    };

    const _clickHistrory = (item: any) => {
        if (props.onClickHeaderHistory) {
            props.onClickHeaderHistory(item);
        }
    };

    const _clickEdit = (item: any) => {
        if (props.onClickHeaderEdit) {
            props.onClickHeaderEdit(item);
        }
    };

    const _onRenderGroupHeader: IDetailsGroupRenderProps["onRenderHeader"] = (props1) => {
        if (!props1) return null;
        const { ariaColSpan = 1, ariaRowIndex } = props1;
        const finalColSpan = ariaColSpan + 2;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const currentDay = today.getDate();

        const prev = new Date(currentYear, currentMonth - 1, 1);
        const prevMonth = prev.getMonth();
        const prevYear = prev.getFullYear();

        const months = [
            "january", "february", "march", "april", "may", "june",
            "july", "august", "september", "october", "november", "december"
        ];
        const [rawMonthName, rawYear] = props1.group!.name.split("-");
        const groupYear = parseInt((rawYear || "").trim(), 10);
        const groupMonth = months.indexOf((rawMonthName || "").trim().toLowerCase());

        let allowEdit = false;

        if (groupMonth !== -1 && !Number.isNaN(groupYear)) {
            if (groupMonth === currentMonth && groupYear === currentYear) {
                allowEdit = true;
            }
            if (currentDay <= 2 && groupMonth === prevMonth && groupYear === prevYear) {
                allowEdit = true;
            }
        }
        return (
            <div className={classNames.headerAndFooter} role="row" aria-rowindex={ariaRowIndex}>
                <div role="gridcell" aria-colspan={finalColSpan}>
                    <div style={{ display: "flex", alignItems: "center", cursor: "pointer", justifyContent: "space-between" }}>
                        <div onClick={_onToggleCollapse(props1)}>
                            <Icon
                                iconName={props1.group!.isCollapsed ? "ChevronRight" : "ChevronDown"}
                                styles={{ root: { marginRight: 8 } }}
                            />
                            <span>{props1.group!.name}</span>
                        </div>

                        {!!props.HeaderButton === true && (
                            <div className="dflex">
                                <div onClick={() => _clickView(props1.group)}>
                                    <Link className="actionBtn btnView dticon">
                                        <TooltipHost content={"View"} id={tooltipId}>
                                            <FontAwesomeIcon icon="eye" />
                                        </TooltipHost>
                                    </Link>
                                </div>

                                <div onClick={() => _clickHistrory(props1.group)}>
                                    <Link className="actionBtn btnInfo dticon">
                                        <TooltipHost content={"View History"} id={tooltipId}>
                                            <FontAwesomeIcon icon="clock-rotate-left" />
                                        </TooltipHost>
                                    </Link>
                                </div>

                                {props.edit !== false && allowEdit && (
                                    <div onClick={() => _clickEdit(props1.group)}>
                                        <Link className="actionBtn btnMoving dticon">
                                            <TooltipHost content={"Edit"} id={tooltipId}>
                                                <FontAwesomeIcon icon="edit" />
                                            </TooltipHost>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // const _onRenderGroupHeader: IDetailsGroupRenderProps["onRenderHeader"] = (props1) => {
    //     if (props1) {
    //         const { ariaColSpan = 1, ariaRowIndex } = props1;
    //         const finalColSpan = ariaColSpan + 2;

    //         return (
    //             <div
    //                 className={classNames.headerAndFooter}
    //                 role="row"
    //                 aria-rowindex={ariaRowIndex}
    //             >
    //                 <div role="gridcell" aria-colspan={finalColSpan}>

    //                     <div
    //                         style={{ display: "flex", alignItems: "center", cursor: "pointer", justifyContent: "space-between" }}

    //                     >
    //                         <div onClick={_onToggleCollapse(props1)}>
    //                             <Icon
    //                                 iconName={props1.group!.isCollapsed ? "ChevronRight" : "ChevronDown"}
    //                                 styles={{ root: { marginRight: 8 } }}
    //                             />
    //                             <span>{props1.group!.name}</span>
    //                         </div>
    //                         {!!props.HeaderButton === true && <>
    //                             <div className="dflex">

    //                                 <div onClick={() => {
    //                                     _clickView(props1.group);
    //                                 }}> <Link className="actionBtn btnView dticon">
    //                                         <TooltipHost content={"View"} id={tooltipId}>
    //                                             <FontAwesomeIcon icon="eye" />
    //                                         </TooltipHost>
    //                                     </Link></div >

    //                                 <div onClick={() => {
    //                                     _clickHistrory(props1.group);
    //                                 }}> <Link className="actionBtn btnInfo dticon">
    //                                         <TooltipHost content={"View History"} id={tooltipId}>
    //                                             <FontAwesomeIcon icon="clock-rotate-left" />
    //                                         </TooltipHost>
    //                                     </Link></div >
    //                                 {props.edit !== false && <>
    //                                     <div onClick={() => {
    //                                         _clickEdit(props1.group);
    //                                     }}> <Link className="actionBtn btnMoving dticon">
    //                                             <TooltipHost content={"Edit"} id={tooltipId}>
    //                                                 <FontAwesomeIcon icon="edit" />
    //                                             </TooltipHost>
    //                                         </Link></div ></>}
    //                             </div>
    //                         </>}
    //                     </div>
    //                 </div>
    //             </div>
    //         );
    //     }
    //     return null;
    // };

    const ROW_HEIGHT: number = 42;
    const GROUP_HEADER_AND_FOOTER_SPACING: number = 8;
    const GROUP_HEADER_AND_FOOTER_BORDER_WIDTH: number = 1;
    const GROUP_HEADER_HEIGHT: number = 95;
    const GROUP_FOOTER_HEIGHT: number = GROUP_HEADER_AND_FOOTER_SPACING * 4 + GROUP_HEADER_AND_FOOTER_BORDER_WIDTH * 2;

    const theme = getTheme();
    const classNames = mergeStyleSets({
        headerAndFooter: {
            borderTop: `${GROUP_HEADER_AND_FOOTER_BORDER_WIDTH}px solid ${theme.palette.neutralQuaternary}`,
            borderBottom: `${GROUP_HEADER_AND_FOOTER_BORDER_WIDTH}px solid ${theme.palette.neutralQuaternary}`,
            padding: GROUP_HEADER_AND_FOOTER_SPACING,
            margin: `${GROUP_HEADER_AND_FOOTER_SPACING}px 0`,
            background: theme.palette.neutralLighterAlt,
            position: 'relative',
            zIndex: 100,
        },
        headerTitle: [
            theme.fonts.xLarge,
            {
                padding: '4px 0',
            },
        ],
        headerLinkSet: {
            margin: '4px -8px',
        },
        headerLink: {
            margin: '0 8px',
        },
    });

    const _getGroupTotalRowHeight = (group: IGroup): number => {
        return group.isCollapsed ? 0 : ROW_HEIGHT * group.count;
    };

    const _getGroupHeight = (group: IGroup, _groupIndex: number): number => {
        return GROUP_HEADER_HEIGHT + GROUP_FOOTER_HEIGHT + _getGroupTotalRowHeight(group);
    };

    const [pagedItemData, setpagedItemData] = React.useState<any[]>([]);
    const [currentPageData, setCurrentPageData] = React.useState<any>();
    const IColumArray = ["key", "name", "fieldName", "flexGrow",
        "className", "styles", 'minWidth',
        "targetWidthProportion", "ariaLabel",
        "isRowHeader", "maxWidth", "columnActionsMode",
        "iconName", "isIconOnly", "iconClassName", "isCollapsable",
        "isCollapsible", "showSortIconWhenUnsorted", "isSorted", "isSortedDescending",
        "isResizable", "isMultiline", "onRender", "getValueKey", "onRenderField",
        "onRenderDivider", "onRenderFilterIcon", "onRenderHeader", "isFiltered",
        "onColumnClick", "onColumnContextMenu", "onColumnResize", "isGrouped",
        "data", "calculatedWidth", "currentWidth", "headerClassName", "isPadded",
        "sortAscendingAriaLabel", "sortDescendingAriaLabel", "sortableAriaLabel",
        "groupAriaLabel", "filterAriaLabel", "isMenuOpen"];

    const pageditems = (items: any[], data: any) => {
        if (!!props.groups && !!props.genrateGroupBy) {
            const groupedData = props.genrateGroupBy(items);
            const groups = Object.values(groupedData);
            setGroups(groups);
            setTimeout(() => {
                const _componentHeight = getHeight(!!setContainerDefaultheight ? setContainerDefaultheight : 365);
                setHeightOfContainer(_componentHeight);
            }, 200);
        }
        setpagedItemData(items);
        setCurrentPageData(data.page);
    };

    // function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
    //     const key = columnKey as keyof T;
    //     return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
    // }


    function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending = false): T[] {
        const key = columnKey as keyof T;

        return items.slice(0).sort((a: T, b: T) => {
            const aValue = a[key];
            const bValue = b[key];

            if (aValue == null && bValue == null) return 0;
            if (aValue == null) return isSortedDescending ? 1 : -1;
            if (bValue == null) return isSortedDescending ? -1 : 1;
            const aDate = parseCustomDate(aValue);
            const bDate = parseCustomDate(bValue);

            if (aDate && bDate) {
                return isSortedDescending
                    ? bDate.getTime() - aDate.getTime()
                    : aDate.getTime() - bDate.getTime();
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return isSortedDescending
                    ? bValue.localeCompare(aValue)
                    : aValue.localeCompare(bValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return isSortedDescending ? bValue - aValue : aValue - bValue;
            }

            return 0;
        });
    }

    const _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
        const newColumns: IColumn[] = data.current.allColumns.slice();
        const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
        newColumns.forEach((newCol: IColumn) => {
            if (newCol === currColumn) {
                currColumn.isSortedDescending = !currColumn.isSortedDescending;
                currColumn.isSorted = true;
            } else {
                newCol.isSorted = false;
                newCol.isSortedDescending = true;
            }
        });
        let Newcols: any = newColumns;
        const newItems = _copyAndSort(data.current.filteredItems, currColumn.fieldName!, currColumn.isSortedDescending);
        data.current = { ...data.current, allColumns: Newcols, filteredItems: newItems };
        forceUpdate();
    };

    const _generateDynamicColumn = (): any => {
        let allColumns: IColumn[] = [];
        for (let index = 0; index < props.columns.length; index++) {
            const element: any = props.columns[index];
            let obj: any = {};
            for (const key in element) {
                if (Object.prototype.hasOwnProperty.call(element, key)) {
                    let el = element[key];
                    if (IColumArray.indexOf(key) > -1) {
                        obj[key] = el;
                    }
                    if (key === "isSortingRequired") {
                        obj["onColumnClick"] = _onColumnClick;
                    }
                }
            }
            allColumns.push(obj);
        }
        return allColumns;
    };

    const onSearch = (arrayList: any[], searchkey: string): any[] => {
        if (!!searchkey && searchkey.trim().length > 0) {
            searchkey = searchkey.trim().toString().toLowerCase();
            return arrayList.filter((obj: any) => {
                return Object.keys(obj).some((key: string) => {
                    return !!obj[key] ? obj[key].toString().toLowerCase().includes(searchkey) : false;
                });
            });
        } else {
            return arrayList;
        }
    };

    const _onSearchTextChange = (text: any) => {
        setSearchText(text);
        let filteredData: any
        if (!!text) {
            filteredData = onSearch(data.current.allItems, text);
            data.current = { ...data.current, filteredItems: filteredData };

            if (!!props.groups && !!props.genrateGroupBy) {
                const groupedData = props.genrateGroupBy(filteredData);
                const groups = Object.values(groupedData);
                setGroups(groups);
            }
            forceUpdate();
        } else {
            filteredData = onSearch(!!props.allData ? props.allData : data.current.allItems, text);
            data.current = { ...data.current, filteredItems: filteredData };
            if (!!props.groups) {
                setGroups(props.groups)
            }
            forceUpdate();
        }

        if (!!props?._onSearchTextChangeForExcel)
            props._onSearchTextChangeForExcel(filteredData, text);
        return text;
    };

    const onClickDropDown = (event: React.FormEvent<HTMLDivElement>, option: any, index?: number) => {
        setSelectedDropDownLength(Number(option.key));
    };

    // const _onRenderRow: IDetailsListProps['onRenderRow'] = props => {
    //     const customStyles: Partial<IDetailsRowStyles> = {};
    //     let isDueDate: boolean = false;
    //     if (props) {
    //         return <DetailsRow {...props} styles={customStyles} />;
    //     }
    //     return null;
    // };
    const _onRenderRow: IDetailsListProps['onRenderRow'] = (props) => {
        if (!props) return null;
        const customStyles: Partial<IDetailsRowStyles> = {};
        return (
            <div
                onMouseDown={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest(".actionBtn, .no-select")) {
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }}
            >
                <DetailsRow {...props} styles={customStyles} />
            </div>
        );
    };
    React.useEffect(() => {
        if (searchText !== "" && searchText !== undefined) {
            data.current = { ...data.current, allColumns: _generateDynamicColumn(), filteredItems: data.current.filteredItems, allItems: props.items };
        } else {
            data.current = { ...data.current, allColumns: _generateDynamicColumn(), filteredItems: props.items, allItems: props.items };
        }
        forceUpdate();
        if (props.items?.length > 0) {

            setTimeout(() => {

                if (props.gridId) {
                    let height = getHeightById(335, props.gridId);
                    setHeightOfContainer(height);

                } else {
                    const _componentHeight = getHeight(!!props.setContainerDefaultheight ? props.setContainerDefaultheight : 365);
                    setHeightOfContainer(_componentHeight);
                }


            }, 200);
        }

    }, [props.columns, props.items, selectedDropDownLength]);
    React.useMemo(() => {
        data.current = { ...data.current, allColumns: _generateDynamicColumn(), filteredItems: props.items, allItems: props.items };
        forceUpdate();
        if (props.items?.length > 0) {
            setTimeout(() => {
                const _componentHeight = getHeight(!!props.setContainerDefaultheight ? props.setContainerDefaultheight : 365);
                setHeightOfContainer(_componentHeight);
            }, 200);
        }
    }, [selectedDropDownLength]);

    // React.useEffect(() => {
    //     if (!!props.groups) {
    //         setGroups(props.groups)
    //     }

    // }, [props.groups])



    return (
        <>
            <React.Fragment>
                <div className="ms-Grid">
                    {props.searchable &&
                        <div className="ms-Grid-row custom-ms-Grid-row" >
                            <div id="addBlank" className="addBlank">
                                <div className="ms-Grid-col ms-sm12 ms-md6  ms-lg6 ms-xl3  mb-3" > &nbsp;
                                </div>
                                <div className="ms-Grid-col  ms-sm12  ms-md8 ms-lg6  ms-xl4 mb-3" >  &nbsp;
                                </div>
                                <div className="ms-Grid-col ms-xl5 ms-lg6 ms-md12 ms-sm12 justify-lg-right" > &nbsp;
                                </div>
                            </div>
                            <div id="detailBlock">

                                <div className="ms-Grid-col ms-sm12 ms-md12  ms-lg12 ms-xl12 ms-xxl6 ms-xxxl4  mb-3">
                                    <div className="dflex flex-wrap absolute-search1">

                                        <SearchBox
                                            value={searchText}
                                            styles={searchBoxStyles}
                                            autoFocus={!!searchText ? true : false}
                                            placeholder="Search"
                                            onEscape={ev => { console.log('Custom onEscape Called'); }}
                                            onClear={ev => {
                                                console.log('Custom onClear Called');
                                            }}
                                            onChange={(_, newValue) => _onSearchTextChange(newValue)}
                                            onSearch={_onSearchTextChange}
                                        />
                                        {props.isPageLength !== false && <>
                                            <Dropdown className="ml5 page-length-min-width" selectedKey={selectedDropDownLength.toString()}
                                                onChange={onClickDropDown}
                                                options={[{ key: "25", text: "25" }, { key: "50", text: "50" }, { key: "75", text: "75" }, { key: "100", text: "100" }, { key: "500", text: "500" }]}
                                            />
                                            <div className="ml5 vc textinline" >Page Length</div>
                                        </>}

                                    </div>
                                </div>

                                <div className="ms-Grid-col ms-sm12 ms-md12  ms-lg12 ms-xl12 ms-xxl6 ms-xxxl8 justify-lg-right pr-110px1" >
                                    <div className="edit-delete-icon">
                                        {props.isAddNew == true && props.addEDButton == false ? <div>&nbsp;</div> : props.addEDButton}
                                    </div>
                                    <div>
                                        {props.isAddNew == true && props.addNewContent}
                                    </div>

                                </div>

                            </div>
                        </div>
                    }
                    <div className="ms-Grid-row custom-ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 tableResponsive">
                            {data.current.filteredItems.length > 0 &&
                                <div style={{
                                    position: "relative",
                                    height: (props.isAutoHeight ? "auto" : `${heightOfContainer}px`)
                                }}>
                                    {props.groups ?
                                        <DetailsList
                                            items={pagedItemData || []}
                                            // groups={props.groups}
                                            groups={groups}
                                            groupProps={{
                                                onRenderHeader: _onRenderGroupHeader,
                                            }}
                                            getGroupHeight={_getGroupHeight}
                                            columns={data.current.allColumns}
                                            selectionMode={!!props.CustomselectionMode ? props.CustomselectionMode : SelectionMode.none}
                                            ariaLabelForGrid="Item details"
                                            listProps={{ renderedWindowsAhead: 0, renderedWindowsBehind: 0 }}
                                            constrainMode={ConstrainMode.unconstrained}
                                            selectionPreservedOnEmptyClick={true}
                                            selection={_selection}
                                            onItemInvoked={(item: any) => props.onItemInvoked(item)}
                                            onRenderRow={_onRenderRow}
                                            onRenderDetailsHeader={_onRenderDetailsHeader}
                                            onShouldVirtualize={(props: IListProps) => {
                                                return false;
                                            }}
                                        /> :
                                        <DetailsList
                                            items={pagedItemData || []}
                                            columns={data.current.allColumns}
                                            selectionMode={!!props.CustomselectionMode ? props.CustomselectionMode : SelectionMode.none}
                                            ariaLabelForGrid="Item details"
                                            listProps={{ renderedWindowsAhead: 0, renderedWindowsBehind: 0 }}
                                            constrainMode={ConstrainMode.unconstrained}
                                            // selectionPreservedOnEmptyClick={true}
                                            selection={_selection}
                                            onItemInvoked={(item: any) => props.onItemInvoked(item)}
                                            onRenderRow={_onRenderRow}
                                            onRenderDetailsHeader={(detailsHeaderProps: IDetailsHeaderProps, defaultRender: IRenderFunction<IDetailsHeaderProps>) =>
                                            (<Sticky stickyPosition={StickyPositionType.Header}>
                                                {onDetailListHeaderRender(detailsHeaderProps, defaultRender)}
                                            </Sticky>)}
                                            onShouldVirtualize={(props: IListProps) => {
                                                return false;
                                            }}
                                        />}
                                </div>
                            }
                        </div>

                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">

                            <>
                                {data.current.filteredItems.length > 0 &&
                                    <CustomPagination
                                        items={data.current.filteredItems}
                                        pagetItems={pageditems}
                                        defaulPage={currentPageData}
                                        pageLength={selectedDropDownLength}
                                        isPagination={props.isPagination}
                                        isNoPagination={props.isNoPagination}
                                    />
                                }
                            </>
                            {data.current.filteredItems.length == 0 &&
                                <NoRecordFound />
                            }
                        </div>
                    </div>
                </div >

            </React.Fragment >
        </>
    );
};

const customComparator = (prevProps: Readonly<IDetailListProps>, nextProps: Readonly<IDetailListProps>) => {
    return !nextProps.reRenderComponent;
};

export const MemoizedDataGridComponent = React.memo(DetaiList, customComparator);