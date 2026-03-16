/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { DialogType, Dropdown, IDropdownOption, Link, MessageBar, MessageBarType, Panel, PanelType, PrimaryButton, TooltipHost } from "office-ui-fabric-react";
import { Loader } from "../../CommonComponents/Loader";
import moment from "moment";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import { useId } from "@fluentui/react-hooks";
import { TemplateNameFilter } from "../../../../../Common/Filter/TemplateName";
import { OwnerFilter } from "../../../../../Common/Filter/OwnerFilter";
import { InspectionFilter } from "../../../../../Common/Filter/InspectionFilter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PreDateRangeFilter } from "../../../../../Common/Filter/PreDateRangeFilter";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import { ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import CamlBuilder from "camljs";
import { getCAMLQueryFilterExpression } from "../../../../../Common/Util";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { MultipleSiteFilter } from "../../../../../Common/Filter/MultipleSiteFilter";
import { PreDateRangeFilterInspection } from "../../../../../Common/Filter/PreDateRangeFilterInspection";
import { DateRangeFilterInspection } from "../../../../../Common/Filter/DateRangeFilterInspection";
import { ArchiveFilter } from "../../../../../Common/Filter/ArchiveFilter";
import { AuditInspectionField } from "./AuditInspectionField";
import CustomModal from "../../CommonComponents/CustomModal";
import { Messages } from "../../../../../Common/Constants/Messages";
import { InspectionStatusFilter } from "../../../../../Common/Filter/InspectionStatusFilter";

export interface IAssociateChemicalProps {
    siteName: any;
    siteView: any;
    isGraph?: boolean;
    existingData?: any;
}

const dialogContentProps = {
    type: DialogType.normal,
    title: "Warning Message",
    closeButtonAriaLabel: "Close",
    subText: "Please Select Date Range!!",
};

export const Inspectionlist = (props: IAssociateChemicalProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [Data, setData] = React.useState<any[]>([]);
    const [Data2, setData2] = React.useState<any[]>([]);
    const tooltipId = useId('tooltip');
    const [selectedTemplateName, setSelectedTemplateName] = React.useState<any>("");
    const [selectedOwner, setSelectedOwner] = React.useState<any>("");
    const [selectedInspection, setSelectedInspection] = React.useState<any>("Conducted Date");
    const [fromDate, setFromDate] = React.useState<Date | any>();
    const [toDate, setToDate] = React.useState<Date | any>();
    // const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: 'Last 30 Days', text: 'Last 30 Days' });
    const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: 'Top 30 Records', text: 'Top 30 Records' });
    const [filterFromDate, setFilterFromDate] = React.useState<any>(undefined);
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);
    const [isDetails, setIsDetails] = React.useState<boolean>(false);
    const [isSort, setIsSort] = React.useState<boolean>(false);
    const [isCon, setIsCon] = React.useState<boolean>(true);
    const [isConSorting, setIsConSorting] = React.useState<boolean>(false);
    const [isComSorting, setIsComSorting] = React.useState<boolean>(false);
    const InspectionItem = React.useRef<any>();
    const AllData = React.useRef<any>();
    const [isFilterData, setIsFilterData] = React.useState<boolean>(true);
    const [currentPage, setCurrentPage] = React.useState<any>(1);
    const [selectedArchive, setSelectedArchive] = React.useState<string>("Active");
    const [isAuditFieldModalOpen, setIsAuditFieldModalOpen] = React.useState(false);
    const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
    const [showSaveMessageBar, setSaveShowMessageBar] = React.useState(false);
    const [showUpdateMessageBar, setUpdateShowMessageBar] = React.useState(false);
    const [dropdownOptions, setDropdownOptions] = React.useState<IDropdownOption[]>([]);
    const [fieldData, setFieldData] = React.useState<any[]>([]);
    const [ShowColumns, setShowColumns] = React.useState<any[]>([]);
    const [selectedStatus, setSelectedStatus] = React.useState<string>("All");
    const [IsSiteManager, setsetIsSiteManager] = React.useState<any>();
    // const getOptionList = async () => {
    //     try {
    //         const response = await provider.choiceOption(
    //             ListNames.AuditInspectionPermission,
    //             "Field"
    //         );
    //         const enabledOptions = ["Doc Number", "Score"];
    //         const options: IDropdownOption[] = [
    //             { key: "selectAll", text: "Select All", disabled: false },
    //             ...response.map((value: string) => ({
    //                 key: value,
    //                 text: value,
    //                 disabled: !enabledOptions.includes(value),
    //             })),
    //         ];

    //         setDropdownOptions(options);
    //     } catch (error) {
    //         console.error("Error loading dropdown options:", error);
    //     }
    // };

    // const onClickFieldData = async () => {
    //     setIsLoading(true);
    //     try {
    //         const queryStringOptions = {
    //             select: ["ID", "Title", "Field", "SiteNameId"],
    //             listName: ListNames.AuditInspectionPermission,
    //             filter: `SiteNameId eq '${props.siteName}'`,
    //         };

    //         const results: any[] = await provider.getItemsByQuery(queryStringOptions);
    //         if (results?.length > 0) {
    //             const listData = results.map((data) => ({
    //                 ID: data.ID,
    //                 Title: data.Title,
    //                 Field: data.Field || "",
    //             }));

    //             setFieldData(listData);
    //             setSelectedOptions(listData[0]?.Field || []);
    //         } else {
    //             setFieldData([]);
    //             const allFields = dropdownOptions.map((o) => o.key.toString());
    //             setSelectedOptions(allFields);
    //         }
    //     } catch (error) {
    //         console.error("Error loading field data:", error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const onClickYes = async () => {
        setIsLoading(true);
        const FieldDataObj = {
            Field: selectedOptions || [],
            SiteNameId: Number(props.siteName),
        };
        try {
            if (ShowColumns.length > 0) {
                await provider.updateItemWithPnP(FieldDataObj, ListNames.AuditInspectionPermission, ShowColumns[0]?.ID);
                setUpdateShowMessageBar(true);
            } else {
                await provider.createItem(FieldDataObj, ListNames.AuditInspectionPermission);
                setSaveShowMessageBar(true);
            }
            await onClickFieldData();
            setTimeout(() => {
                setSaveShowMessageBar(false);
                setUpdateShowMessageBar(false);
            }, 2000);
            // onclickCloseConfigure()
        } catch (error) {
            console.error("Save/Update error:", error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleDropdownChange = (
        event: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption
    ) => {
        if (!option) return;
        setSelectedOptions((prev: string[]) => {
            const enabledKeys = dropdownOptions
                .filter((opt) => opt.key !== 'selectAll' && !opt.disabled)
                .map((opt) => opt.key as string);
            const disabledKeys = dropdownOptions
                .filter((opt) => opt.disabled)
                .map((opt) => opt.key as string);

            if (option.key === 'selectAll') {
                const isSelectedAll = enabledKeys.every((key) => prev.includes(key));
                return isSelectedAll
                    ? [...disabledKeys]
                    : [...enabledKeys, ...disabledKeys];
            } else {
                let newSelection;
                if (option.selected) {
                    newSelection = [...prev, option.key as string];
                } else {
                    newSelection = prev.filter((key) => key !== option.key);
                }
                return [...newSelection.filter((key) => !disabledKeys.includes(key)), ...disabledKeys];
            }
        });
    };
    const onclickConfigure = () => {
        setIsAuditFieldModalOpen(true);
    };

    const onclickCloseConfigure = () => {
        setIsAuditFieldModalOpen(false);
        setUpdateShowMessageBar(false);
    };

    const getOptionList = async () => {
        try {
            const response = await provider.choiceOption(
                ListNames.AuditInspectionPermission,
                "Field"
            );
            const enabledOptions = ["Doc Number", "Score"];
            const options: IDropdownOption[] = [
                { key: "selectAll", text: "Select All", disabled: false },
                ...response.map((value: string) => ({
                    key: value,
                    text: value,
                    disabled: !enabledOptions.includes(value),
                })),
            ];
            setDropdownOptions(options);
            return options; // return options
        } catch (error) {
            console.error("Error loading dropdown options:", error);
            return [];
        }
    };
    const onClickFieldData = async (options: IDropdownOption[] = []) => {

        try {
            const queryStringOptions = {
                select: ["ID", "Title", "Field", "SiteNameId"],
                listName: ListNames.AuditInspectionPermission,
                filter: `SiteNameId eq '${props?.siteName}'`,
            };

            const results: any[] = await provider.getItemsByQuery(queryStringOptions);
            if (results?.length > 0) {
                const listData = results.map((data) => ({
                    ID: data.ID,
                    Title: data.Title,
                    Field: data.Field || "",
                }));

                setFieldData(listData);
                setShowColumns(listData);
                setSelectedOptions(listData[0]?.Field || []);
            } else {
                const allFields = options
                    .filter((o) => o.key !== "selectAll")
                    .map((o) => o.key.toString());
                const fallbackData = [{
                    Field: allFields
                }];
                setShowColumns([]);
                setFieldData(fallbackData)
                setSelectedOptions(allFields);
            }

        } catch (error) {
            console.error("Error loading field data:", error);
        }
    };

    // React.useEffect(() => {
    //     const loadData = async () => {
    //         setIsLoading(true);
    //         try {
    //             const options = await getOptionList();
    //             await onClickFieldData(options);
    //         } catch (err) {
    //             console.error(err);
    //         } finally {
    //             setIsLoading(false);
    //         }
    //     };
    //     loadData();
    // }, [isAuditFieldModalOpen]);


    let itemsPerPage: number;
    if (props.siteView === false) {
        itemsPerPage = 25;
    } else {
        itemsPerPage = 25;
    }
    const [displayedItems, setDisplayedItems] = React.useState<any>([]);
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);

    const startedIndex = React.useRef<any>();
    const endedIndex = React.useRef<any>();
    const curType = React.useRef<any>();

    const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>([]);
    const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>([]);
    const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>([]);

    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSiteIds(siteIds);
        setSelectedSiteTitles(siteTitles);
        setSelectedSCSites(siteSC);
    };

    const handlePagination = (newPage: any) => {
        const totalPages = Math.ceil(AllData?.current?.length / itemsPerPage);
        if (newPage < 1) {
            newPage = 1;
        } else if (newPage > totalPages) {
            newPage = totalPages;
        }
        setCurrentPage(newPage);
        const startIndex = (newPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage > AllData?.current?.length ? AllData?.current?.length : startIndex + itemsPerPage;
        startedIndex.current = startIndex;
        endedIndex.current = endIndex;
        // setDisplayedItems(AllData?.current?.slice(startIndex, endIndex));
    };

    React.useEffect(() => {
        handlePagination(1);
    }, [AllData.current]);



    React.useEffect(() => {
        if (!!AllData?.current && AllData?.current.length > 0) {
            if (isCon) {
                if (!isSort) {
                    let cropdata = AllData?.current?.slice(startedIndex.current, endedIndex.current)
                    const sortedData = cropdata.sort((a: any, b: any) => {
                        const dateA = new Date(a.srtConductedon).getTime();
                        const dateB = new Date(b.srtConductedon).getTime();
                        // Primary sorting by srtConductedon (descending order)
                        if (dateA !== dateB) {
                            return dateB - dateA;
                        }
                    });
                    const groupedAudits = groupByConductonDate(sortedData);
                    setData(groupedAudits);
                } else {
                    let cropdata = AllData?.current?.slice(startedIndex.current, endedIndex.current)
                    const sortedData = cropdata.sort((a: any, b: any) => {
                        const dateA = new Date(a.srtConductedon).getTime();
                        const dateB = new Date(b.srtConductedon).getTime();
                        // Primary sorting by srtConductedon (descending order)
                        if (dateB !== dateA) {
                            return dateA - dateB;
                        }
                    });
                    const groupedAudits = groupByConductonDate(sortedData);
                    setData(groupedAudits);
                }
            } else {
                if (!isSort) {
                    let cropdata = AllData?.current?.slice(startedIndex.current, endedIndex.current)

                    const sortedData = cropdata.sort((a: any, b: any) => {
                        const dateA = new Date(a.srtCompleted).getTime();
                        const dateB = new Date(b.srtCompleted).getTime();
                        // Primary sorting by srtConductedon (descending order)
                        if (dateA !== dateB) {
                            return dateB - dateA;
                        }
                    });
                    const groupedAudits = groupByCompletionDate(sortedData);
                    setData2(groupedAudits);
                } else {
                    let cropdata = AllData?.current?.slice(startedIndex.current, endedIndex.current)

                    const sortedData = cropdata.sort((a: any, b: any) => {
                        const dateA = new Date(a.srtCompleted).getTime();
                        const dateB = new Date(b.srtCompleted).getTime();
                        // Primary sorting by srtConductedon (descending order)
                        if (dateB !== dateA) {
                            return dateA - dateB;
                        }
                    });
                    const groupedAudits = groupByCompletionDate(sortedData);
                    setData2(groupedAudits);
                }
            }
        }
    }, [AllData?.current, startedIndex.current, endedIndex.current, currentPage]);

    const onTemplateNameChange = (TemplateName: any): void => {
        setSelectedTemplateName(TemplateName.text);
    };
    const onOwnerChange = (Owner: any): void => {
        setSelectedOwner(Owner.text);
    };
    const onInspectionChange = (Inspection: any): void => {
        setSelectedInspection(Inspection);
    };
    const onChangeRangeOption = (item: IDropdownOption): void => {
        setSelectedItem(item);
        if (item?.key == "Top 30 Records") {
            setFromDate(undefined);
            setFilterFromDate(undefined);
            setFilterToDate(undefined);
            setToDate(undefined);
        }


    };
    const onChangeToDate = (filterDate: any, date?: Date) => {
        setFilterToDate(filterDate);
        setToDate(date);
    };
    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setFromDate(date);
        setFilterFromDate(filterDate);
    };

    const groupByConductonDate = (audits: any) => {
        return audits.reduce((acc: any, audit: any) => {
            const date = audit.srtConductedon || "Empty Date"; // Use "Empty Date" if Conductedon is not present
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(audit);
            return acc;
        }, {});
    };

    const groupByCompletionDate = (audits: any) => {
        return audits.reduce((acc: any, audit: any) => {
            // Use srtCompleted or a fallback date (e.g., far future date "9999-12-31")
            const date = audit.srtCompleted || "9999-12-31";
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(audit);
            return acc;
        }, {});
    };



    const _Data = async (DirectSCSiteId?: any) => {
        setIsLoading(true);
        try {
            const filterFields: ICamlQueryFilter[] = []

            if (selectedArchive && selectedArchive !== "All") {
                filterFields.push({
                    fieldName: "Archived",
                    fieldValue: selectedArchive === "Active" ? false : true,
                    fieldType: FieldType.Boolean,
                    LogicalType: LogicalType.EqualTo
                });
            } else {
                filterFields.push({
                    fieldName: "Archived",
                    fieldValue: null,
                    fieldType: FieldType.Boolean,
                    LogicalType: LogicalType.IsNotNull
                });
            }
            if (selectedStatus && selectedStatus !== "All") {
                filterFields.push({
                    fieldName: "Status",
                    fieldValue: selectedStatus === "Completed" ? "Completed" : "Incomplete",
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                });
            } else {
                filterFields.push({
                    fieldName: "Status",
                    fieldValue: null,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.IsNotNull
                });
            }

            const filterFieldsSite: ICamlQueryFilter[] = [];
            let isTopRecordOnly = selectedItem?.key == "Top 30 Records" ? true : false
            // Date Range filters
            if (filterFromDate && filterToDate && selectedInspection) {
                const dateField = selectedInspection === "Conducted Date" ? "Conductedon" : "Completed";
                filterFields.push({
                    fieldName: `${dateField}`,
                    fieldValue: `${filterFromDate}T00:00:00Z`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.GreaterThanOrEqualTo
                });
                filterFields.push({
                    fieldName: `${dateField}`,
                    fieldValue: `${filterToDate}T23:59:59Z`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.LessThanOrEqualTo
                })
            } else {
                const endDate = moment().format('YYYY-MM-DD'); // Today's date
                const startDate = moment().subtract(29, 'days').format('YYYY-MM-DD'); // 30 days ago
                const dateField = selectedInspection === "Conducted Date" ? "Conductedon" : "Completed";
                if (selectedItem?.key != "Top 30 Records") {
                    filterFields.push({
                        fieldName: `${dateField}`,
                        fieldValue: `${startDate}T00:00:00Z`,
                        fieldType: FieldType.DateTime,
                        LogicalType: LogicalType.GreaterThanOrEqualTo
                    });
                    filterFields.push({
                        fieldName: `${dateField}`,
                        fieldValue: `${endDate}T23:59:59Z`,
                        fieldType: FieldType.DateTime,
                        LogicalType: LogicalType.LessThanOrEqualTo
                    })
                }
            }

            // Site Filter
            let finalSCSite = DirectSCSiteId || null;
            if (props.siteName || finalSCSite) {
                const siteIdValue = props.siteName;
                filterFieldsSite.push({
                    fieldName: `SiteName`,
                    fieldValue: `${siteIdValue}`,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.EqualTo
                })
                filterFieldsSite.push({
                    fieldName: `SCSiteId`,
                    fieldValue: `${finalSCSite}`,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                })
            } else {
                const finalSCSite = selectedSCSites && selectedSCSites.length > 0 ? selectedSCSites : null;
                const siteIdValue = selectedSiteIds && selectedSiteIds.length > 0 ? selectedSiteIds : null;

                if (siteIdValue || finalSCSite) {
                    if (siteIdValue) {
                        filterFieldsSite.push({
                            fieldName: `SiteName`,
                            fieldValue: siteIdValue,
                            fieldType: FieldType.LookupById,
                            LogicalType: LogicalType.In
                        });
                    }

                    if (finalSCSite) {
                        filterFieldsSite.push({
                            fieldName: `SCSiteId`,
                            fieldValue: finalSCSite,
                            fieldType: FieldType.Text,
                            LogicalType: LogicalType.In
                        });
                    }
                }

            }
            // Additional Filters            
            if (selectedTemplateName) {
                filterFields.push({
                    fieldName: `TemplateName`,
                    fieldValue: `${selectedTemplateName}`,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                })
            }
            if (selectedOwner) {
                filterFields.push({
                    fieldName: `Owner`,
                    fieldValue: `${selectedOwner}`,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                })
            }
            const camlQuery = new CamlBuilder()
                .View([
                    "ID",
                    "Title",
                    "Conductedon",
                    "Completed",
                    "SiteName",
                    "TemplateName",
                    "Owner",
                    "Archived",
                    "DocNumber",
                    "Score",
                    "Created",
                    "Modified",
                    "InspectionTitle",
                    "TemplateId",
                    "WebReportURL",
                    "Status",
                    "Location",
                    "ItemsCompleted"
                ])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(isTopRecordOnly ? 30 : 5000, isTopRecordOnly ? false : true)
                .Query();

            const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
            const siteFilter: any[] = getCAMLQueryFilterExpression(filterFieldsSite);
            camlQuery.Where().All(categoriesExpressions);
            camlQuery.OrderByDesc(selectedInspection === "Conducted Date" ? "Conductedon" : "Completed");

            let finalQuery = camlQuery.ToString();
            if (filterFieldsSite.length > 0) {
                finalQuery = CamlBuilder.FromXml(camlQuery.ToString())
                    .ModifyWhere().AppendAnd().Any(siteFilter).ToString();
            }

            const pnpQueryOptions: IPnPCAMLQueryOptions = {
                listName: ListNames.AuditInspectionData,
                queryXML: finalQuery,
                pageToken: "",
                pageLength: isTopRecordOnly ? 30 : 100000
            }
            const localResponse = await provider.getItemsInBatchByCAMLQuery(pnpQueryOptions);
            const results = localResponse?.Row;

            if (!!results) {
                const ListData = results.map((data: any) => {
                    return {
                        ID: Number(data.ID),
                        Title: data.Title,
                        DocNumber: !!data.DocNumber ? data.DocNumber : '',
                        SiteNameId: !!data.SiteName ? data.SiteName[0]?.lookupId : '',
                        SiteName: !!data?.SiteName ? data.SiteName[0]?.lookupValue : '',
                        Score: data.Score == 0 ? '-' : data.Score || '',
                        Owner: !!data.Owner ? data.Owner : '',
                        srtCompleted: !!data.Completed ? moment(data.Completed).format('YYYY-MM-DD') : '9999-12-31', // Format for sorting
                        srtConductedon: !!data.Conductedon ? moment(data.Conductedon).format('YYYY-MM-DD') : '', // Format for sorting
                        Conductedon: !!data.Conductedon ? moment(data.Conductedon).format('DD MMM YYYY') : '',
                        Created: !!data.Created ? moment(data.Created).format('DD MMM YYYY HH:MM A') : '',
                        Modified: !!data.Modified ? moment(data.Modified).format('DD MMM YYYY HH:MM A') : '',
                        Completed: !!data.Completed ? moment(data.Completed).format('DD MMM YYYY') : '31 Dec 9999',
                        InspectionTitle: !!data.InspectionTitle ? data.InspectionTitle : '',
                        TemplateName: !!data.TemplateName ? data.TemplateName : '',
                        TemplateId: !!data.TemplateId ? data.TemplateId : '',
                        WebReportURL: !!data.WebReportURL ? data.WebReportURL : '',
                        Status: !!data.Status ? data.Status : '',
                        Location: !!data.Location ? data.Location : '',
                        ItemsCompleted: !!data.ItemsCompleted ? data.ItemsCompleted : '',
                        LastEditor: !!data.Editor ? data.Editor.Title : ""
                    };
                });
                let filteredData: any[];
                if (!!props.siteName || currentUserRoleDetail?.isAdmin) {
                    filteredData = ListData;
                } else {
                    let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                    filteredData = !!ListData && ListData?.filter((item: any) =>
                        AllSiteIds.includes(item?.SiteNameId)
                    );
                }
                if (filteredData.length > 0) {
                    setIsFilterData(true);
                } else {
                    setIsFilterData(false);
                }
                AllData.current = filteredData;
                setIsLoading(false);
            }
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    };

    const onClick_InspectionData = (data: any) => {
        InspectionItem.current = data;
        setIsDetails(true);
    };

    const onClickSort = (text?: any) => {
        curType.current = text;
        startedIndex.current = 0;
        endedIndex.current = 25;
        setData2([]);
        setData([]);
        if (text === "con") {
            setCurrentPage(1);
            setIsConSorting(true);
            setIsComSorting(false);
        } else {
            setCurrentPage(1);
            setIsConSorting(false);
            setIsComSorting(true);
        }
        if (isSort === true) {
            const sortedData = AllData?.current?.sort((a: any, b: any) => {
                let dateA: Date, dateB: Date;
                if (text === "con") {
                    setIsCon(true);
                    dateA = new Date(a.srtConductedon);
                    dateB = new Date(b.srtConductedon);
                } else {
                    setIsCon(false);
                    dateA = new Date(a.srtCompleted);
                    dateB = new Date(b.srtCompleted);
                }
                return dateB.getTime() - dateA.getTime();
            });

            if (text === "con") {
                let cropdata = sortedData?.slice(startedIndex.current, endedIndex.current);
                const groupedAudits = groupByConductonDate(cropdata);
                setData(groupedAudits);
            } else {
                let cropdata = sortedData?.slice(startedIndex.current, endedIndex.current);
                const groupedAudits2 = groupByCompletionDate(cropdata);
                setData2(groupedAudits2);
            }
            setIsSort(false);
        } else {
            const sortedData = AllData?.current?.sort((a: any, b: any) => {
                let dateA: Date, dateB: Date;

                if (text === "con") {
                    setIsCon(true);
                    dateA = new Date(a.srtConductedon);
                    dateB = new Date(b.srtConductedon);
                } else {
                    setIsCon(false);
                    dateA = new Date(a.srtCompleted);
                    dateB = new Date(b.srtCompleted);
                }
                // Ascending order sorting
                return dateA.getTime() - dateB.getTime();
            });

            if (text === "con") {
                let cropdata = sortedData?.slice(startedIndex.current, endedIndex.current);
                const groupedAudits = groupByConductonDate(cropdata);
                setData(groupedAudits);
            } else {
                let cropdata = sortedData?.slice(startedIndex.current, endedIndex.current);
                const groupedAudits2 = groupByCompletionDate(cropdata);
                setData2(groupedAudits2);
            }
            setIsSort(true);
        }
    };

    // React.useEffect(() => {
    //     if (props.existingData && props.existingData.length > 0 && props.siteName) {
    //         const filteredData = props.existingData.filter((x: any) => x.SiteNameId == props.siteName);

    //         AllData.current = filteredData;
    //         setIsFilterData(true);
    //         setIsLoading(false);
    //     } else {
    //         if (props.siteName) {
    //             try {
    //                 const select = ["ID,Title,SCSiteId"];
    //                 const queryStringOptions: IPnPQueryOptions = {
    //                     select: select,
    //                     filter: `ID eq ${props.siteName}`,
    //                     listName: ListNames.SitesMaster,
    //                 };

    //                 provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
    //                     if (!!results) {
    //                         const SiteData: any = results.map((data) => {
    //                             return (
    //                                 {
    //                                     ID: data.ID,
    //                                     Title: data.Title,
    //                                     SCSiteId: !!data.SCSiteId ? data.SCSiteId : "",
    //                                 }
    //                             );
    //                         });
    //                         _Data(SiteData[0].SCSiteId);
    //                     }
    //                 }).catch((error: any) => {
    //                     console.log(error);
    //                     setIsLoading(false);
    //                 });
    //             } catch (ex) {
    //                 console.log(ex);
    //             }
    //         } else {
    //             _Data();
    //         }
    //     }
    // }, [isRefreshGrid, selectedArchive, selectedTemplateName, selectedOwner, selectedInspection, selectedItem, fromDate, toDate, selectedSiteIds]);
    React.useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);
            try {
                const options = await getOptionList();
                await onClickFieldData(options);

                if (props.existingData && props.existingData.length > 0 && props.siteName) {
                    const filteredData = props.existingData.filter(
                        (x: any) => x.SiteNameId == props.siteName
                    );
                    AllData.current = filteredData;
                    setIsFilterData(true);
                } else {
                    if (props.siteName) {
                        const select = ["ID,Title,SCSiteId,SiteManagerId"];
                        const queryStringOptions: IPnPQueryOptions = {
                            select: select,
                            filter: `ID eq ${props.siteName}`,
                            listName: ListNames.SitesMaster,
                        };

                        const results = await provider.getItemsByQuery(queryStringOptions);
                        if (results?.length > 0) {
                            const SiteData: any = results.map((data) => ({
                                ID: data.ID,
                                Title: data.Title,
                                SCSiteId: data.SCSiteId || "",
                                SiteManagerId: data.SiteManagerId
                            }));
                            const siteManagers = SiteData[0]?.SiteManagerId;

                            // Check if currentUserId is in the list of manager Ids
                            const isCurrentUserSiteManager = siteManagers?.some((managerId: any) => managerId == currentUserRoleDetail.Id);
                            setsetIsSiteManager(isCurrentUserSiteManager);
                            await _Data(SiteData[0].SCSiteId);
                        } else {
                            await _Data();
                        }
                    } else {
                        await _Data();
                    }
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        initializeData();
    }, [isAuditFieldModalOpen, isRefreshGrid, selectedArchive, selectedStatus, selectedTemplateName, selectedOwner, selectedInspection, selectedItem, fromDate, toDate, selectedSiteIds
    ]);

    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };

    //     const AuditList = (data: any) => {
    //         return (
    //             <div>
    //                 {!!AllData?.current && AllData?.current?.length > 0 &&
    //                     <div className={props?.siteView === true ? "inspection-margin-top-20 mt-2" : ""}>
    //                         <div className={window.innerWidth > 768 ? "pag-jce-top-dflex" : "pag-jce-top"}>

    //                             <div className="record-info Count-inspection">
    //                                 {`Showing ${currentPage === 1 ? 1 : (currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, AllData?.current?.length)} of ${AllData?.current?.length} records`}
    //                             </div>
    //                             <button className="pag-btn inspection-btn"
    //                                 onClick={() => handlePagination(currentPage - 1)}
    //                                 disabled={currentPage === 1}
    //                             >
    //                                 Prev
    //                             </button>
    //                             <span className="pag-page-lbl">{` Page ${currentPage} `}</span>
    //                             <button className="pag-btn"
    //                                 onClick={() => handlePagination(currentPage + 1)}
    //                                 disabled={currentPage === Math.ceil(AllData?.current?.length / itemsPerPage)}
    //                             >
    //                                 Next
    //                             </button>
    //                             <Link className="actionBtn iconSize btnRefresh inspection-icon-m mobile-inspection-icon" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
    //                                 text="">
    //                                 <TooltipHost
    //                                     content={"Refresh Grid"}
    //                                     id={tooltipId}
    //                                 >
    //                                     <FontAwesomeIcon
    //                                         icon={"arrows-rotate"}
    //                                     />
    //                                 </TooltipHost>    </Link>
    //                         </div>
    //                     </ div >}
    //                 <div
    //                     className={`${window.innerWidth > 768 ? "card-Action-New" : "mobile-card-Action-New"} 
    //   ${props?.siteView === true ? "inspection-card-height" : ""}`}
    //                 >

    //                     <div className={props.siteView === true ? "header-2 inspection-stick-header " : "header-2 inspection-stick-header"}>
    //                         <div className="row2">
    //                             <div className="cell2 header-cell clsHighWidthHeader">Inspection</div>
    //                             {!props.siteName && <div className="cell2 header-cell clsWidthScore">Site Name</div>}
    //                             <div className="cell2 header-cell clsWidthScore">Doc Number</div>
    //                             <div className="cell2 header-cell clsWidthscore2">Score</div>

    //                             <div className="cell2 header-cell clsDocWidth cursorPointer" >
    //                                 <span onClick={() => onClickSort("con")}>Conducted</span>
    //                                 {isConSorting ? (
    //                                     <>
    //                                         {isSort ? (
    //                                             <FontAwesomeIcon icon="sort-up" className="ml5" onClick={() => onClickSort("con")} />
    //                                         ) : (
    //                                             <FontAwesomeIcon icon="sort-down" className="ml5" onClick={() => onClickSort("con")} />
    //                                         )}
    //                                     </>
    //                                 ) : (
    //                                     <FontAwesomeIcon icon="sort" className="ml5 sort-clr" onClick={() => onClickSort("con")} />
    //                                 )}
    //                             </div>

    //                             <div className="cell2 header-cell clsDocWidth cursorPointer">
    //                                 <span onClick={() => onClickSort("com")}>Completed</span>
    //                                 {isComSorting ? (
    //                                     <>
    //                                         {isSort ? (
    //                                             <FontAwesomeIcon icon="sort-up" className="ml5" onClick={() => onClickSort("com")} />
    //                                         ) : (
    //                                             <FontAwesomeIcon icon="sort-down" className="ml5" onClick={() => onClickSort("com")} />
    //                                         )}
    //                                     </>
    //                                 ) : (
    //                                     <FontAwesomeIcon icon="sort" className="ml5 sort-clr" onClick={() => onClickSort("com")} />
    //                                 )}
    //                             </div>
    //                             <div className="cell2 header-cell clsWidthscore2">Status</div>
    //                             <div className="cell2 header-cell clsWidthScore">...</div>
    //                         </div>
    //                     </div>
    //                     {Object.keys(data).map(date => (
    //                         <div key={date} className="cardHeader-Action2">
    //                             <h3 className="ml14">
    //                                 {date === "9999-12-31" || date === "Empty Date" ? "Empty Date" : moment(date).format('DD MMM YYYY')}
    //                             </h3>

    //                             {data[date].map((audit: any, index: any) => (
    //                                 <div key={audit.ID} className="container22" onClick={() => onClick_InspectionData(audit)}>
    //                                     <div className="row2">
    //                                         <div className="cell2 info2">
    //                                             <img src={require('../../../assets/images/loader.png')} className="logo" />
    //                                             <div>
    //                                                 <div className="date-and-name">
    //                                                     <span style={{ whiteSpace: 'pre-line' }}>
    //                                                         {audit.InspectionTitle.length > 60
    //                                                             ? `${audit.InspectionTitle.slice(0, 60)}\n${audit.InspectionTitle.slice(60)}`
    //                                                             : audit.InspectionTitle}
    //                                                         {audit.InspectionTitle == "" && <>{audit.TemplateName}</>}
    //                                                     </span>
    //                                                 </div>
    //                                                 <div className="location">{audit.TemplateName}</div>
    //                                             </div>
    //                                         </div>
    //                                         {!props.siteName && <div className="cell2 clsDocWidth">{audit.SiteName}</div>}
    //                                         <div className="cell2 clsDocWidth">{audit.DocNumber}</div>
    //                                         <div className="cell2 percentage clsWidth">{audit.Score}</div>
    //                                         <div className="cell2 clsWidth">{audit.Conductedon}</div>
    //                                         <div className="cell2 clsWidth">{audit.Completed === "31 Dec 9999" ? "" : audit.Completed}</div>
    //                                         <div className="cell2 clsWidth">{audit?.Status}</div>
    //                                         <div className="cell2 clsWidth">
    //                                             <a href="#" onClick={() => window.open(audit.WebReportURL, '_blank')} className="report-link">View Report</a>
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                             ))}
    //                         </div>
    //                     ))}
    //                 </div>
    //             </div>
    //         );
    //     };

    const AuditList = (data: any) => {
        const fieldColumns = fieldData || [];

        return (
            <div>
                {!!AllData?.current && AllData?.current?.length > 0 && (
                    <div className={props?.siteView === true ? "inspection-margin-top-20 mt-2" : ""}>
                        <div className={window.innerWidth > 768 ? "inspection-Grid-top-dflex" : "inspection-Grid-top"} style={{
                            paddingRight: currentUserRoleDetail?.isAdmin || IsSiteManager ? "47px" : "0px", // if admin, remove padding; else 47px
                        }}>
                            <div className="record-info Count-inspection">
                                {`Showing ${currentPage === 1 ? 1 : (currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, AllData?.current?.length)} of ${AllData?.current?.length} records`}
                            </div>
                            <button
                                className="inspection-grid-dflex"
                                onClick={() => handlePagination(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Prev
                            </button>
                            <span className="pag-page-lbl">{` Page ${currentPage} `}</span>
                            <button
                                className="pag-btn"
                                onClick={() => handlePagination(currentPage + 1)}
                                disabled={currentPage === Math.ceil(AllData?.current?.length / itemsPerPage)}
                            >
                                Next
                            </button>
                            <Link
                                className="actionBtn iconSize btnRefresh inspection-icon-m mobile-inspection-icon"
                                style={{ paddingBottom: "2px" }}
                                onClick={onclickRefreshGrid}
                                text=""
                            >
                                <TooltipHost content={"Refresh Grid"} id={tooltipId}>
                                    <FontAwesomeIcon icon={"arrows-rotate"} />
                                </TooltipHost>
                            </Link>

                            {/* Admin gear icon on same row */}

                        </div>
                        {(currentUserRoleDetail?.isAdmin || IsSiteManager) && (
                            <Link
                                className="actionBtn iconSize btnMove dticon custdd-icon-setting"
                                onClick={() => onclickConfigure()}
                                style={{ marginLeft: "10px" }}
                            >
                                <TooltipHost content={"Configure Inspection Field"} id={`tooltip`}>
                                    <FontAwesomeIcon icon="gear" />
                                </TooltipHost>
                            </Link>
                        )}
                    </div>

                )}

                <div className={`${window.innerWidth > 768 ? "card-Action-New" : "mobile-card-Action-New"} 
                ${props?.siteView === true ? "inspection-card-height" : ""}`}>

                    {/* Header */}
                    <div className={props.siteView === true ? "header-2 inspection-stick-header" : "header-2 inspection-stick-header"}>
                        <div className="row2">
                            {!fieldColumns || fieldColumns.length === 0 || fieldColumns[0].Field?.includes("Inspection") && <div className="cell2 header-cell clsHighWidthHeader">Inspection</div>}
                            {!props.siteName && !fieldColumns || fieldColumns.length === 0 || fieldColumns[0].Field?.includes("Site Name") && (<div className="cell2 header-cell clsWidthScore">Site Name</div>)}
                            {!fieldColumns || fieldColumns.length === 0 || fieldColumns[0].Field?.includes("Doc Number") && <div className="cell2 header-cell clsWidthScore">Doc Number</div>}
                            {!fieldColumns || fieldColumns.length === 0 || fieldColumns[0].Field?.includes("Score") && <div className="cell2 header-cell clsWidthscore2">Score</div>}
                            {!fieldColumns || fieldColumns.length === 0 || fieldColumns[0].Field?.includes("Conducted") &&
                                <div className="cell2 header-cell clsDocWidth cursorPointer" >
                                    <span onClick={() => onClickSort("con")}>Conducted</span>
                                    {isConSorting ? (
                                        isSort ? <FontAwesomeIcon icon="sort-up" className="ml5" onClick={() => onClickSort("con")} /> :
                                            <FontAwesomeIcon icon="sort-down" className="ml5" onClick={() => onClickSort("con")} />
                                    ) : <FontAwesomeIcon icon="sort" className="ml5 sort-clr" onClick={() => onClickSort("con")} />}
                                </div>
                            }
                            {!fieldColumns || fieldColumns.length === 0 || fieldColumns[0].Field?.includes("Completed") &&
                                <div className="cell2 header-cell clsDocWidth cursorPointer">
                                    <span onClick={() => onClickSort("com")}>Completed</span>
                                    {isComSorting ? (
                                        isSort ? <FontAwesomeIcon icon="sort-up" className="ml5" onClick={() => onClickSort("com")} /> :
                                            <FontAwesomeIcon icon="sort-down" className="ml5" onClick={() => onClickSort("com")} />
                                    ) : <FontAwesomeIcon icon="sort" className="ml5 sort-clr" onClick={() => onClickSort("com")} />}
                                </div>
                            }
                            {!fieldColumns || fieldColumns.length === 0 || fieldColumns[0].Field?.includes("Status") && <div className="cell2 header-cell clsWidthscore2">Status</div>}
                            <div className="cell2 header-cell clsWidthScore">...</div>
                        </div>
                    </div>

                    {/* Rows */}
                    {Object.keys(data).map(date => (
                        <div key={date} className="cardHeader-Action2">
                            <h3 className="ml14">
                                {date === "9999-12-31" || date === "Empty Date" ? "Empty Date" : moment(date).format('DD MMM YYYY')}
                            </h3>

                            {data[date].map((audit: any, index: any) => (
                                <div key={audit.ID} className="container22" onClick={() => onClick_InspectionData(audit)}>
                                    <div className="row2">
                                        {!fieldColumns || fieldColumns?.length === 0 || fieldColumns[0]?.Field?.includes("Inspection") &&
                                            <div className="cell2 info2">
                                                <img src={require('../../../assets/images/loader.png')} className="logo" />
                                                <div>
                                                    <div className="date-and-name">
                                                        <span style={{ whiteSpace: 'pre-line' }}>
                                                            {audit.InspectionTitle.length > 60
                                                                ? `${audit.InspectionTitle.slice(0, 60)}\n${audit.InspectionTitle.slice(60)}`
                                                                : audit.InspectionTitle}
                                                            {audit.InspectionTitle === "" && <>{audit.TemplateName}</>}
                                                        </span>
                                                    </div>
                                                    <div className="location">{audit.TemplateName}</div>
                                                </div>
                                            </div>
                                        }
                                        {!props.siteName && !fieldColumns || fieldColumns?.length === 0 || fieldColumns[0]?.Field?.includes("Site Name") && <div className="cell2 clsDocWidth">{audit.SiteName}</div>}
                                        {!fieldColumns || fieldColumns?.length === 0 || fieldColumns[0]?.Field?.includes("Doc Number") && <div className="cell2 clsDocWidth">{audit.DocNumber}</div>}
                                        {!fieldColumns || fieldColumns?.length === 0 || fieldColumns[0]?.Field?.includes("Score") && <div className="cell2 percentage clsWidth">{audit.Score}</div>}
                                        {!fieldColumns || fieldColumns?.length === 0 || fieldColumns[0]?.Field?.includes("Conducted") && <div className="cell2 clsWidth">{audit.Conductedon}</div>}
                                        {!fieldColumns || fieldColumns?.length === 0 || fieldColumns[0]?.Field?.includes("Completed") && <div className="cell2 clsWidth">{audit.Completed === "31 Dec 9999" ? "" : audit.Completed}</div>}
                                        {!fieldColumns || fieldColumns?.length === 0 || fieldColumns[0]?.Field?.includes("Status") && <div className="cell2 clsWidth">{audit?.Status}</div>}
                                        <div className="cell2 clsWidth">
                                            <a href="#" onClick={() => window.open(audit.WebReportURL, '_blank')} className="report-link">View Report</a>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const onClickClose = () => {
        setIsDetails(false);
    };

    const onRenderFooterContent = () => {
        return <div>
            <PrimaryButton className="btn btn-danger" onClick={onClickClose} text="Close" />
        </div>;
    };
    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {isLoading && <Loader />}
            <div className={!!props.siteName ? "" : "boxCard"}>
                {!props.siteName && <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                        <h1 className="mainTitle">Inspection</h1>
                    </div>
                </div>}
                {props.siteView === false && <div className="mt-3">
                    {!props.siteName && <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
                        <div className="formControl">
                            <MultipleSiteFilter
                                isPermissionFiter={true}
                                loginUserRoleDetails={currentUserRoleDetail}
                                selectedSiteIds={selectedSiteIds}
                                selectedSiteTitles={selectedSiteTitles}
                                selectedSCSite={selectedSCSites}
                                onSiteChange={handleSiteChange}
                                provider={provider}
                                isRequired={true}
                                AllOption={true}
                            />
                        </div>
                    </div>}
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
                        <div className="formControl">
                            <TemplateNameFilter
                                selectedTemplateName={selectedTemplateName}
                                onTemplateNameChange={onTemplateNameChange}
                                provider={provider}
                                siteNameId={props.siteName || 0}
                                AllOption={true} />
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
                        <div className="formControl">
                            <OwnerFilter
                                selectedOwner={selectedOwner}
                                onOwnerChange={onOwnerChange}
                                provider={provider}
                                siteNameId={props.siteName || 0}
                                AllOption={true} />
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
                        <div className="formControl">
                            <InspectionFilter
                                selectedInspection={selectedInspection}
                                onInspectionChange={onInspectionChange}
                                defaultOption="Conducted Date"
                                provider={provider}
                                AllOption={true} />
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
                        <div className="formControl">
                            {/* <PreDateRangeFilterInspection
                                fromDate={fromDate}
                                toDate={toDate}
                                onFromDateChange={onChangeFromDate}
                                onToDateChange={onChangeToDate}
                                onChangeRangeOption={onChangeRangeOption}
                            /> */}
                            <DateRangeFilterInspection
                                fromDate={fromDate}
                                toDate={toDate}
                                onFromDateChange={onChangeFromDate}
                                onToDateChange={onChangeToDate}
                                onChangeRangeOption={onChangeRangeOption}
                            />
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
                        <div className="formControl">
                            <ArchiveFilter
                                selectedArchive={selectedArchive}
                                onArchiveChange={(val) => setSelectedArchive(val)}
                            />
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
                        <div className="formControl">
                            <InspectionStatusFilter
                                selectedStatus={selectedStatus}
                                onStatusChange={(status) => setSelectedStatus(status)}
                                reset={false}
                            />
                        </div>
                    </div>
                </div>}
                <div className='card-box-new mb30 '>

                    <div className="ms-Grid-row justify-content-start">
                        <div className="ms-Grid-row justify-content-start">
                            <div id="" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dialog-grid inspection-mt-10">

                                {!!isCon && AllData?.current?.length > 0 ?
                                    <>
                                        {!!Data &&
                                            AuditList(Data)}
                                    </>
                                    :
                                    <>
                                        {!!Data2 &&
                                            AuditList(Data2)}
                                    </>
                                }

                                {((Data.length == 0 && Data2.length == 0) || isFilterData === false) && (!AllData?.current || AllData.current.length === 0) &&
                                    <div className="inspection-nrf-mar"><NoRecordFound /></div>
                                }
                                {/* {(
                                    (!Data ||
                                        Object.keys(Data).length === 0 ||
                                        Object.values(Data).every(arr => !Array.isArray(arr) || arr.length === 0)
                                    ) &&
                                    (!Data2 ||
                                        Object.keys(Data2).length === 0 ||
                                        Object.values(Data2).every(arr => !Array.isArray(arr) || arr.length === 0)
                                    ) &&
                                    (!AllData?.current || AllData.current.length === 0)
                                ) && (
                                        <div className="inspection-nrf-mar"><NoRecordFound /></div>
                                    )} */}

                            </div>
                        </div>
                    </div>
                </div>

                {isDetails &&
                    <Panel
                        isOpen={isDetails}
                        onDismiss={onClickClose}
                        type={PanelType.custom}
                        headerText="Inspection Details"
                        onRenderFooterContent={onRenderFooterContent}
                        customWidth="480px"
                    >
                        <h2 className="mt-3">{!!InspectionItem.current.InspectionTitle ? InspectionItem.current.InspectionTitle : InspectionItem.current.TemplateName}</h2>
                        <div className="flex mt-3">
                            <PrimaryButton className="btn btn-primary" text="View Report" onClick={() => window.open(InspectionItem.current.WebReportURL, '_blank')} />
                        </div>
                        <table className="mt-4 inspection-border">
                            <tbody>
                                <tr className="mt-3">
                                    <td className="actlbl">Template</td>
                                    <td className="padleft-Inspection">{InspectionItem.current.TemplateName}</td>
                                </tr>
                                <tr className="mt-3">
                                    <td className="actlbl">Status</td>
                                    <td className="padleft-Inspection">{InspectionItem.current.Status}</td>
                                </tr>
                                {!fieldData || fieldData?.length === 0 || fieldData[0]?.Field?.includes("Score") && (
                                    <tr className="mt-3">
                                        <td className="actlbl">Score</td>
                                        <td className="padleft-Inspection">{InspectionItem.current.Score}</td>
                                    </tr>
                                )}
                                <tr className="mt-3">
                                    <td className="actlbl inspection-va-top">Items completed</td>
                                    <td className="padleft-Inspection">{InspectionItem.current.ItemsCompleted}</td>
                                </tr>
                                <tr className="mt-3">
                                    <td className="actlbl inspection-va-top">Location</td>
                                    <td className="padleft-Inspection">{InspectionItem.current.Location}</td>
                                </tr>
                                <tr className="mt-3">
                                    <td className="actlbl">Owner</td>
                                    <td className="padleft-Inspection">{InspectionItem.current.Owner}</td>
                                </tr>
                                <tr className="mt-3">
                                    <td className="actlbl inspection-va-top">Last edited by</td>
                                    <td className="padleft-Inspection">{InspectionItem.current.LastEditor}</td>
                                </tr>
                                <tr className="mt-3">
                                    <td className="actlbl">Started</td>
                                    <td className="padleft-Inspection"><FontAwesomeIcon icon="clock-rotate-left" className="dticon" />{InspectionItem.current.Created}</td>
                                </tr>
                                <tr className="mt-3">
                                    <td className="actlbl">Updated</td>
                                    <td className="padleft-Inspection"><FontAwesomeIcon icon="clock-rotate-left" className="dticon" />{InspectionItem.current.Modified}</td>
                                </tr>
                            </tbody>
                        </table>
                    </Panel >
                }
                {!!AllData?.current && AllData?.current?.length > 0 && props.siteView === false &&
                    < div className="mt-2">
                        <div className="pag-jce">
                            <div className="record-info Count-inspection">
                                {`Showing ${currentPage === 1 ? 1 : (currentPage - 1) * itemsPerPage + 1} to ${Math.min(currentPage * itemsPerPage, AllData?.current?.length)} of ${AllData?.current?.length} records`}
                            </div>
                            <button className="pag-btn"
                                onClick={() => handlePagination(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                Prev
                            </button>
                            <span className="pag-page-lbl">{` Page ${currentPage} `}</span>
                            <button className="pag-btn"
                                onClick={() => handlePagination(currentPage + 1)}
                                disabled={currentPage === Math.ceil(AllData?.current?.length / itemsPerPage)}
                            >
                                Next
                            </button>
                        </div>

                    </ div >}
            </div>
            <CustomModal
                isModalOpenProps={isAuditFieldModalOpen}
                dialogWidth="500px"
                subject="Configure Inspection Field"
                message={
                    <>
                        <div className={`${showSaveMessageBar || showUpdateMessageBar ? "mt-2" : ""}`}>
                            {showSaveMessageBar && (
                                <MessageBar messageBarType={MessageBarType.success}>
                                    <div className="inputText">{Messages.InspectionColumnSuccess}</div>
                                </MessageBar>
                            )}
                            {showUpdateMessageBar && (
                                <MessageBar messageBarType={MessageBarType.success}>
                                    <div className="inputText">{Messages.InspectionColumnUpdated}</div>
                                </MessageBar>
                            )}
                        </div>
                        <b>Select Column</b>
                        <div className="formControl custdd-multiple mt img-mt">
                            <Dropdown
                                placeholder="Select"
                                multiSelect
                                options={dropdownOptions}
                                selectedKeys={
                                    selectedOptions.length === dropdownOptions.length - 1
                                        ? ['selectAll', ...selectedOptions]
                                        : selectedOptions
                                }
                                onChange={handleDropdownChange}
                            />

                        </div>
                    </>
                }
                closeButtonText="Cancel"
                yesButtonText="Save"
                onClickOfYes={onClickYes}
                onClose={onclickCloseConfigure}
            />
        </>;
    }
};