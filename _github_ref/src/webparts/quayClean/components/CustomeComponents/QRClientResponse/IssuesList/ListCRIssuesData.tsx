import { useId } from "@fluentui/react-hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CamlBuilder from "camljs";
import { useAtomValue } from "jotai";
import moment from "moment";
import { IDropdownOption, IColumn, Link, TooltipHost } from "office-ui-fabric-react";
import React, { useState, useRef } from "react";
import { ICamlQueryFilter, FieldType, LogicalType } from "../../../../../../Common/Constants/DocumentConstants";
import { Messages } from "../../../../../../Common/Constants/Messages";
import { ComponentNameEnum, ListNames, UserActivityActionTypeEnum, UserActionEntityTypeEnum, UserActionLogFor } from "../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../Common/ToastService";
import { onBreadcrumbItemClicked, getCAMLQueryFilterExpression, logGenerator, generateExcelTable, UserActivityLog, getclientResponseStatusClassName } from "../../../../../../Common/Util";
import { IBreadCrum } from "../../../../../../Interfaces/IBreadCrum";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { formatSPDateToLocal, getState, buildUniqueOptions, getClientResponseIconUrl, buildSiteMap, generateCommonExcelFileName, getCRSiteAreaQRCodeURL, getClientResponseCopyLinkURL, getJSONFileContent, buildSiteCategoryTabs, groupResponseByQCState } from "../../../CommonComponents/CommonMethods";
import { IListIssues, ClientResponseViewFields, ClientResponseFields, IClientResponseData } from "../ClientResponseFields";
import { Icon } from "@fluentui/react";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import ClientResponseActionMenu from "./ClientResponseActionMenu";
import { NO_SITE_CATEGORY_ID } from "../../../../../../Common/Constants/CommonConstants";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
interface ISelectedSites {
    ids: any[];
    titles: string[];
    scSites: string[];
}

export const ListCRIssuesData = (props: IListIssues) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : (window.innerWidth <= 768 ? 'card' : 'grid'));
    let siteData = React.useRef<any>([]);
    const [isLoading, setIsLoading] = useState(true);
    const tooltipId = useId('tooltip');
    // const [clientResponseFileData, setFileHazardData] = React.useState<any[]>([]);
    const [columns, setColumns] = useState<any>([]);
    const clientResponseFileData = useRef([]);
    const qrLinkURL = useRef("");
    const categoryCountCard = useRef<any[]>([]);
    const [selectedSites, setSelectedSites] = React.useState<ISelectedSites>({
        ids: [],
        titles: [],
        scSites: [],
    });

    const [isManageSiteAreaOpen, setIsManageSiteAreaOpen] = React.useState(false);
    const [selectedSiteArea, setSelectedSiteArea] = React.useState<any>(null);

    const [state, setState] = React.useState<IClientResponseData>({
        ClientResponseData: [],
        selectedCategory: [],
        stateCountData: "",
        selectedSubCategory: [],
        selectedReportedBy: null,
        selectedResolvedBy: null,
        stateTabData: [],
        selectedArchive: "No",
        isRefresh: false,
        isRefreshOptions: true,
        ReportedByOptions: [],
        ResolvedByOptions: [],
        CategoryOptions: [],
        SubCategoryOptions: [],
        fromDate: null,
        toDate: null,
        filterFromDate: null,
        filterToDate: null,
        selectedDateItem: { key: "Top 30 Records", text: "Top 30 Records" },
        selectedIssueItem: null,
        isOpenArchiveModal: false,
        filterCategoryValue: '',
        isLocalFilter: false,
        filteredClientResponseData: [],
        isQrModelOpen: false,
        QRCodeImage: '',
        isIssueSiteUpdate: false,
        isAttachmentModalOpen: false,
        selectedStateId: [],
        isResolveModalOpen: false,
        isReassignOpen: false,
        selectedStatus: ["Submitted"],
        isCategoryChange: false,
        JSONFiles: [],
        jsonFileContent: '',
        SiteCategoryCardData: [],
        selectedSiteCategoryId: undefined,
        isCopyLinkClicked: false,
        keyUpdate: Math.random()
    });

    React.useEffect(() => {
        setState(prev => ({ ...prev, keyUpdate: Math.random() }));
    }, [selectedZoneDetails, selectedZoneDetails?.isSinglesiteSelected]);

    const onStateChange = (option: any): void => {
        setState((prevState) => ({ ...prevState, selectedStateId: option, isLocalFilter: true }));
    };

    const handleOpenQRModal = () => {
        setState((s) => ({ ...s, isQrModelOpen: true }));
    };

    const oncloseQRCodeModal = () => {
        setState((s) => ({ ...s, isQrModelOpen: false }));
    }

    const onChangeRangeOption = (item: IDropdownOption): void => {
        setState(prev => ({
            ...prev,
            selectedDateItem: item,
            isRefreshOptions: true
        }));
    };

    const onChangeToDate = (filterDate: any, date?: Date) => {
        setState(prev => ({
            ...prev,
            toDate: date || null,
            filterToDate: filterDate,
            isRefreshOptions: true,
            isRefresh: true
        }));
    };

    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setState(prev => ({
            ...prev,
            fromDate: date || null,
            filterFromDate: filterDate,
            isRefreshOptions: true,
            isRefresh: true
        }));
    };

    const onClickUnArchive = (itemID: any) => {
        setState(prev => ({
            ...prev,
            selectedIssueItem: itemID,
            isOpenArchiveModal: true
        }));
    };

    const onClickAttachment = (itemID: any) => {
        setState(prev => ({
            ...prev,
            selectedIssueItem: itemID,
            isAttachmentModalOpen: true
        }));
    };
    const onClickResolveIssue = (item: any) => {
        setState(prev => ({
            ...prev,
            selectedIssueItem: item,
            isResolveModalOpen: true
        }));
    };

    const onClickView = (itemID: any) => {
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.ViewClientResponseFormDetail, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.ViewClientResponseFormDetail, siteMasterId: itemID.ID, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps?.siteName, qCState: props.componentProps?.qCState, view: currentView } });
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.ViewClientResponseFormDetail, dataObj: props.componentProps?.dataObj, siteMasterId: itemID.ID, originalSiteMasterId: props.siteMasterId, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps?.siteName, qCState: props.componentProps?.qCState
        });
    }

    const onClickReassignIssue = (item: any) => {
        setState(prev => ({
            ...prev,
            selectedIssueItem: item,
            isReassignOpen: true
        }));
    };

    const IssuesListColumn = (): IColumn[] => {
        let columns: any[] = [
            {
                key: "Action", name: 'Action', fieldName: 'Action', isResizable: true, minWidth: 60, maxWidth: 80,
                onRender: ((item: any) => {
                    return <>
                        <ClientResponseActionMenu
                            data={item}
                            onView={onClickView}
                            onAttachment={onClickAttachment}
                            onUnarchive={onClickUnArchive}
                            onResolve={onClickResolveIssue}
                            onReassign={onClickReassignIssue}
                        />
                    </>;
                })
            },
            {
                key: 'SiteName', name: ClientResponseViewFields.SiteName, fieldName: 'SiteName', isResizable: true, minWidth: 180, maxWidth: 280, isSortingRequired: true,
                onRender: (item: any) => (
                    <Link className="tooltipcls" onClick={() => onClickView(item)}>
                        {item.SiteName}
                    </Link>
                )
            },
            { key: 'ID', name: ClientResponseViewFields.ResponseFormId, fieldName: ClientResponseFields.ResponseFormId, isResizable: true, minWidth: 150, maxWidth: 180, isSortingRequired: true },
            { key: 'Category', name: ClientResponseViewFields.Category, fieldName: ClientResponseFields.Category, isResizable: true, minWidth: 180, maxWidth: 260, isSortingRequired: true },
            { key: 'SubCategory', name: ClientResponseViewFields.SubCategory, fieldName: ClientResponseFields.SubCategory, isResizable: true, minWidth: 180, maxWidth: 260, isSortingRequired: true },
            {
                key: 'Status', name: ClientResponseViewFields.ClientResponseStatus, fieldName: ClientResponseFields.ClientResponseStatus,
                isResizable: true, minWidth: 180, maxWidth: 260, isSortingRequired: true,
                onRender: (item: any) => {
                    return (
                        <div className={getclientResponseStatusClassName(item?.Status)}>{item?.Status}</div>
                    );
                }
            },
            { key: 'ReportedBy', name: ClientResponseViewFields.ReportedBy, fieldName: ClientResponseFields.ReportedBy, isResizable: true, minWidth: 180, maxWidth: 210, isSortingRequired: true },
            {
                key: 'SubmittedDate', name: ClientResponseViewFields.SubmissionDate, fieldName: 'SubmissionDate', isResizable: true, minWidth: 180, maxWidth: 220, isSortingRequired: true, onRender: (item: any) => {
                    return (
                        <div className="badge rounded-pill text-bg-info date-badge">{item?.SubmissionDate}</div>
                    );
                },
            },
            { key: 'ResolvedBy', name: ClientResponseViewFields.ResolvedBy, fieldName: ClientResponseFields.ResolvedBy, isResizable: true, minWidth: 180, maxWidth: 210, isSortingRequired: true },
            {
                key: 'ResolvedDate', name: ClientResponseViewFields.ResolvedDate, fieldName: 'ResolvedDate', isResizable: true, minWidth: 160, maxWidth: 200, isSortingRequired: true, onRender: (item: any) => {
                    return (
                        item?.ResolvedDate ? <div className="badge rounded-pill text-bg-info date-badge">{item?.ResolvedDate}</div> : ""
                    );
                },
            },
        ];
        if (selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId?.length == 1) {
            columns = columns.filter(item => item.key != "SiteName")
        }
        return columns;
    };

    const mappingClientResponseData = (listItems: any[], siteItems: any[]) => {
        if (!Array.isArray(listItems) || listItems.length === 0) return [];

        const siteMap = buildSiteMap(siteItems);

        return listItems.map((item: any) => {

            let responseObj = {};
            try {
                responseObj = item?.Response ? JSON.parse(item.Response) : {};
            } catch {
                console.error("Error in json response");
            }

            const siteLookup = item?.SiteName?.[0] || {};
            const resolvedBy = item?.ResolvedBy?.[0] || {};

            const siteId = Number(siteLookup.lookupId);
            const siteItem = siteMap[siteId];
            const siteCategoryLookup = item?.SiteCategory?.[0] || {};

            return {
                Id: Number(item.ID),
                ID: Number(item.ID),
                Category: item.Category ?? "",
                SubCategory: item.SubCategory ?? "",
                SiteCategory: siteCategoryLookup?.lookupValue,
                SiteCategoryId: siteCategoryLookup?.lookupId ?? NO_SITE_CATEGORY_ID,
                Status: item.Status ?? "",
                SiteName: siteLookup.lookupValue ?? "",
                SiteNameId: siteId,
                ReportedBy: item.ReportedBy ?? "",
                ResolvedBy: resolvedBy.lookupValue ?? "",
                ResolvedById: resolvedBy.lookupId ?? "",
                ResponseFormId: item.ResponseFormId,
                SubmissionDate: item?.SubmissionDate ? formatSPDateToLocal(item["SubmissionDate."], false) : "",
                ResolvedDate: item?.ResolvedDate ? formatSPDateToLocal(item["ResolvedDate."], false) : "",
                ResponseJSON: responseObj,
                IsArchive: item.IsArchive === "Yes",
                stateId: siteItem?.QCStateId ?? "",
            };
        });
    };

    const calculateCategoryCounts = (listItems: any[], fileContent: any) => {

        const finalArray = fileContent?.categorySection?.categories?.map((fc: any) => {
            const category = fc.name;
            const color = fc.color || "";
            const patterncolor = `${fc.color}60` || "";
            const bgcolor = `${fc.color}40` || "";
            const iconUrl = getClientResponseIconUrl(fc.iconUrl, context) || "";

            const listCount = listItems.filter(item => item.Category === category).length;

            return {
                category,
                color,
                iconUrl,
                listCount,
                bgcolor,
                patterncolor,
                order: fc.order || 0
            };
        }).sort((a: { order: number; }, b: { order: number; }) => a.order - b.order);
        categoryCountCard.current = finalArray;
    };

    const getClientResponseData = async (siteItems: any[]) => {

        try {
            let filterFields: ICamlQueryFilter[] = [
                {
                    fieldName: ClientResponseFields.IsDeleted,
                    fieldValue: true,
                    fieldType: FieldType.Boolean,
                    LogicalType: LogicalType.NotEqualTo
                }
            ];

            if (state.selectedStatus?.length > 0) {
                filterFields.push({
                    fieldName: ClientResponseFields.Status,
                    fieldValue: state.selectedStatus,
                    fieldType: FieldType.Text,
                    LogicalType:
                        state.selectedStatus.length === 1
                            ? LogicalType.EqualTo
                            : LogicalType.In
                });
            } else {
                filterFields.push({
                    fieldName: ClientResponseFields.Status,
                    fieldValue: 'Draft',
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.NotEqualTo
                });
            }

            if (selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId?.length > 0) {
                filterFields.push(
                    {
                        fieldName: ClientResponseFields.SiteName,
                        fieldValue: selectedZoneDetails.defaultSelectedSitesId,
                        fieldType: FieldType.LookupById,
                        LogicalType: LogicalType.In
                    }
                )
            } else if (selectedZoneDetails?.selectedSitesId && selectedZoneDetails?.selectedSitesId?.length > 0) {
                filterFields.push(
                    {
                        fieldName: ClientResponseFields.SiteName,
                        fieldValue: selectedZoneDetails?.selectedSitesId,
                        fieldType: FieldType.LookupById,
                        LogicalType: LogicalType.In
                    }
                )
            } else if (selectedSites?.ids.length > 0) {
                filterFields.push(
                    {
                        fieldName: ClientResponseFields.SiteName,
                        fieldValue: selectedSites.ids,
                        fieldType: FieldType.LookupById,
                        LogicalType: LogicalType.In
                    }
                )
            }


            if (state.selectedReportedBy) {
                filterFields.push(
                    {
                        fieldName: ClientResponseFields.ReportedBy,
                        fieldValue: state.selectedReportedBy,
                        fieldType: FieldType.Text,
                        LogicalType: LogicalType.EqualTo
                    }
                )
            }

            if (state.selectedResolvedBy) {
                filterFields.push(
                    {
                        fieldName: ClientResponseFields.ResolvedBy,
                        fieldValue: state.selectedResolvedBy,
                        fieldType: FieldType.LookupById,
                        LogicalType: LogicalType.EqualTo
                    }
                )
            }

            if (state.selectedArchive) {
                const val = state.selectedArchive === "Yes" ? true : false;
                filterFields.push(
                    {
                        fieldName: ClientResponseFields.IsArchive,
                        fieldValue: val,
                        fieldType: FieldType.Boolean,
                        LogicalType: LogicalType.EqualTo
                    }
                )
            }

            if (state.selectedSubCategory?.length > 0) {
                filterFields.push(
                    {
                        fieldName: ClientResponseFields.SubCategory,
                        fieldValue: state.selectedSubCategory,
                        fieldType: FieldType.Text,
                        LogicalType: LogicalType.In
                    }
                )
            }

            let isTopRecordOnly = state.selectedDateItem?.key == "Top 30 Records" ? true : false;
            if (state.selectedDateItem?.key !== 'All Dates' && !!state.selectedDateItem) {
                if (state.filterFromDate && state.filterToDate) {
                    filterFields.push({
                        fieldName: ClientResponseFields.SubmissionDate,
                        fieldValue: `${state.filterFromDate}`,
                        fieldType: FieldType.DateTime,
                        LogicalType: LogicalType.GreaterThanOrEqualTo
                    });
                    filterFields.push({
                        fieldName: ClientResponseFields.SubmissionDate,
                        fieldValue: `${state.filterToDate}`,
                        fieldType: FieldType.DateTime,
                        LogicalType: LogicalType.LessThanOrEqualTo
                    })
                }
                else {
                    const endDate = moment().format('YYYY-MM-DD');
                    const startDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
                    const dateField = ClientResponseFields.SubmissionDate;
                    if (state.selectedDateItem?.key != "Top 30 Records") {
                        filterFields.push({
                            fieldName: `${dateField}`,
                            fieldValue: `${startDate}`,
                            fieldType: FieldType.DateTime,
                            LogicalType: LogicalType.GreaterThanOrEqualTo
                        });
                        filterFields.push({
                            fieldName: `${dateField}`,
                            fieldValue: `${endDate}`,
                            fieldType: FieldType.DateTime,
                            LogicalType: LogicalType.LessThanOrEqualTo
                        })
                    }
                }
            }

            const camlQuery = new CamlBuilder()
                .View([
                    ClientResponseFields.Id,
                    ClientResponseFields.SiteName,
                    ClientResponseFields.Category,
                    ClientResponseFields.SubCategory,
                    ClientResponseFields.ClientResponseStatus,
                    ClientResponseFields.Response,
                    ClientResponseFields.IsArchive,
                    ClientResponseFields.ReportedBy,
                    ClientResponseFields.AssignedTo,
                    ClientResponseFields.ResolvedBy,
                    ClientResponseFields.ResponseFormId,
                    ClientResponseFields.SubmissionDate,
                    ClientResponseFields.ResolvedDate,
                    ClientResponseFields.SiteCategory
                ])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                // .LeftJoin(ClientResponseFields.SubmittedBy, ClientResponseFields.SubmittedBy)
                // .Select(ClientResponseFields.Title, ClientResponseFields.SubmittedByName)
                // .RowLimit(5000, true)
                .RowLimit(isTopRecordOnly ? 30 : 5000, isTopRecordOnly ? false : true)
                .Query();

            const categoriesExpressions = getCAMLQueryFilterExpression(filterFields);
            if (categoriesExpressions.length > 0) {
                camlQuery.Where().All(categoriesExpressions);
            }
            camlQuery.OrderByDesc('Modified');
            const localResponse = await provider.getItemsByCAMLQuery(ListNames.ClientResponsesSubmission, camlQuery.ToString(), null, "");

            let listItems = mappingClientResponseData(localResponse, siteItems);

            setIsLoading(false);
            return listItems;
        } catch (error) {
            console.error("Failed to fetch client response issue Data:", error);
            setIsLoading(false);
            return [];
        }
    };

    const _siteData2 = async (provider: any): Promise<any[]> => {
        try {
            let camlQuery;
            camlQuery = new CamlBuilder().View(["ID", "QCState"]).Scope(CamlBuilder.ViewScope.RecursiveAll).RowLimit(5000, true).Query()
            const results = await provider.getItemsByCAMLQuery(ListNames.SitesMaster, camlQuery.ToString())
            if (results) {
                const siteData = results.map((data: any) => ({
                    ID: parseInt(data.ID),
                    QCStateId: data.QCState ? data.QCState[0].lookupId : '',
                    QCState: data.QCState ? data.QCState[0].lookupValue : '',
                }));

                return siteData;
            }
            return [];
        } catch (error) {
            console.error("Error fetching site master :", error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occurring while fetching site master ",
                PageName: "Quayclean.aspx",
                ErrorMethodName: "_siteData2"
            };
            await logGenerator(provider, errorObj);
            return [];
        }
    };

    const getClientResponseFileContent = async () => {
        const siteCategoryId = props.componentProps?.dataObj?.SiteCategoryId || undefined;

        if (siteCategoryId) {
            const filter = `SiteCategoryId eq ${siteCategoryId}`
            const fileContent = await provider.getFileContentByFilter(ListNames.ClientResponseForm, 'json', filter);
            clientResponseFileData.current = fileContent?.categorySection?.categories || [];
            if (!fileContent) {
                const fileName = `${context.pageContext.web.serverRelativeUrl}/ClientResponseForm/DefaultForm.json`;
                const fileContent = await provider.readFileContent(fileName, 'json');
                clientResponseFileData.current = fileContent?.categorySection?.categories || [];
            }
        } else {
            const fileName = `${context.pageContext.web.serverRelativeUrl}/ClientResponseForm/DefaultForm.json`;
            const fileContent = await provider.readFileContent(fileName, 'json');
            clientResponseFileData.current = fileContent?.categorySection?.categories || [];
        }
    }

    const setClientResponseData = (listItems: any[], isFirstLoad: boolean, jsonFiles: any[]) => {

        if (props.siteMasterId) {
            const siteCategoryId = props.componentProps?.dataObj?.SiteCategoryId || NO_SITE_CATEGORY_ID;
            let fileContent = jsonFiles?.find((i) => i?.siteCategoryId === siteCategoryId);

            const filterClientResponseData = listItems.filter((i) => i.SiteCategoryId === siteCategoryId);

            const groupedCountArray = groupResponseByQCState(filterClientResponseData, siteData.current);
            calculateCategoryCounts(filterClientResponseData, fileContent?.content);

            if (state.isRefreshOptions && filterClientResponseData.length > 0) {
                setState((prev) => ({
                    ...prev,
                    ClientResponseData: listItems,
                    filteredClientResponseData: filterClientResponseData,
                    isRefresh: false,
                    isRefreshOptions: false,
                    ReportedByOptions: buildUniqueOptions(filterClientResponseData, "ReportedBy"),
                    ResolvedByOptions: buildUniqueOptions(filterClientResponseData, "ResolvedBy", "ResolvedById"),
                    SubCategoryOptions: buildUniqueOptions(filterClientResponseData, "SubCategory"),
                    isLocalFilter: false,
                    stateCountData: groupedCountArray,
                    selectedSiteCategoryId: siteCategoryId,
                    jsonFileContent: fileContent?.content,
                    JSONFiles: jsonFiles
                }));
            } else {
                setState((prev) => ({
                    ...prev,
                    ClientResponseData: listItems,
                    stateCountData: groupedCountArray,
                    isRefresh: false,
                    isLocalFilter: true,
                }));
            }
        } else {
            setIsLoading(true);
            const categoryTabs = buildSiteCategoryTabs(listItems);
            const defaultSiteCategoryId = state.selectedSiteCategoryId ?? categoryTabs[0]?.Id;
            let fileContent = jsonFiles?.find((i) => i?.siteCategoryId === defaultSiteCategoryId);

            const filterClientResponseData = listItems.filter((i) => i.SiteCategoryId === defaultSiteCategoryId);

            const groupedCountArray = groupResponseByQCState(filterClientResponseData, siteData.current);
            calculateCategoryCounts(filterClientResponseData, fileContent?.content);

            if (state.isRefreshOptions && filterClientResponseData.length > 0) {
                setState((prev) => ({
                    ...prev,
                    ClientResponseData: listItems,
                    filteredClientResponseData: filterClientResponseData,
                    isRefresh: false,
                    isRefreshOptions: false,
                    ReportedByOptions: buildUniqueOptions(filterClientResponseData, "ReportedBy"),
                    ResolvedByOptions: buildUniqueOptions(filterClientResponseData, "ResolvedBy", "ResolvedById"),
                    SubCategoryOptions: buildUniqueOptions(filterClientResponseData, "SubCategory"),
                    isLocalFilter: true,
                    stateCountData: groupedCountArray,
                    SiteCategoryCardData: categoryTabs,
                    selectedSiteCategoryId: defaultSiteCategoryId,
                    jsonFileContent: fileContent?.content,
                }));
            } else {
                setState((prev) => ({
                    ...prev,
                    ClientResponseData: listItems,
                    filteredClientResponseData: filterClientResponseData,
                    stateCountData: groupedCountArray,
                    isRefresh: false,
                    isLocalFilter: true,
                    SiteCategoryCardData: categoryTabs,
                    ReportedByOptions: buildUniqueOptions(filterClientResponseData, "ReportedBy"),
                    ResolvedByOptions: buildUniqueOptions(filterClientResponseData, "ResolvedBy", "ResolvedById"),
                    SubCategoryOptions: buildUniqueOptions(filterClientResponseData, "SubCategory"),
                }));
            }
            setIsLoading(false);
        }
    }

    React.useEffect(() => {
        setState(prev => ({ ...prev, keyUpdate: Math.random() }));
        const loadData = async () => {

            const [sitesData, jsonFiles] = await Promise.all([
                _siteData2(provider),
                // getClientResponseFileContent()
                getJSONFileContent(provider)
            ]);
            siteData.current = sitesData;

            const qrCodeURL = await getCRSiteAreaQRCodeURL(context, (selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails.defaultSelectedSitesId && selectedZoneDetails.defaultSelectedSitesId[0] : ""));
            const copyLinkURL = await getClientResponseCopyLinkURL(context, (selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails.defaultSelectedSitesId && selectedZoneDetails.defaultSelectedSitesId[0] : ""));

            qrLinkURL.current = copyLinkURL;
            setState((prev) => ({
                ...prev,
                QRCodeUrl: qrCodeURL,
                JSONFiles: jsonFiles
            }));
            const listItems = await getClientResponseData(sitesData);
            setClientResponseData(listItems, true, jsonFiles);
        };

        loadData()
    }, [selectedZoneDetails]);

    React.useEffect(() => {
        const fetchData = async () => {
            const listItems = await getClientResponseData(siteData.current);
            setClientResponseData(listItems, false, state.JSONFiles);
            const qrCodeURL = await getCRSiteAreaQRCodeURL(context, (selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails.defaultSelectedSitesId && selectedZoneDetails.defaultSelectedSitesId[0] : ""));
            const copyLinkURL = await getClientResponseCopyLinkURL(context, (selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails.defaultSelectedSitesId && selectedZoneDetails.defaultSelectedSitesId[0] : ""));

            qrLinkURL.current = copyLinkURL;
            setState((prev) => ({
                ...prev,
                QRCodeUrl: qrCodeURL
            }));
        };

        fetchData();
    }, [state.isRefresh, selectedZoneDetails]);


    React.useEffect(() => {
        if (state.isLocalFilter) {
            let filteredList = state.ClientResponseData;
            if (state.selectedSiteCategoryId) {
                filteredList = filteredList.filter((i) => i.SiteCategoryId === state.selectedSiteCategoryId);
            }
            if (state.filterCategoryValue) {
                filteredList = filteredList.filter((item: any) =>
                    item.Category == state.filterCategoryValue
                );
            }
            if (!!state.selectedStateId && state.selectedStateId > 0) {
                filteredList = filteredList.filter((i) => i.stateId == state.selectedStateId)
            }

            if (state.isRefreshOptions) {
                const defaultSiteCategoryId = state.selectedSiteCategoryId;
                let fileContent = state.JSONFiles?.find((i) => i?.siteCategoryId === defaultSiteCategoryId);

                const filterClientResponseData = state.ClientResponseData.filter((i) => i.SiteCategoryId === defaultSiteCategoryId);

                const groupedCountArray = groupResponseByQCState(filterClientResponseData, siteData.current);
                setState((prev) => ({
                    ...prev,
                    filteredClientResponseData: filteredList,
                    isRefresh: false,
                    isRefreshOptions: false,
                    ReportedByOptions: buildUniqueOptions(filterClientResponseData, "ReportedBy"),
                    ResolvedByOptions: buildUniqueOptions(filterClientResponseData, "ResolvedBy", "ResolvedById"),
                    SubCategoryOptions: buildUniqueOptions(filterClientResponseData, "SubCategory"),
                    isLocalFilter: false,
                    stateCountData: groupedCountArray,
                    jsonFileContent: fileContent?.content,
                }));

                calculateCategoryCounts(filterClientResponseData, fileContent?.content);
            } else {
                setState(prev => ({
                    ...prev,
                    filteredClientResponseData: filteredList,
                    isLocalFilter: false
                }));
            }

            // if(state.isRefreshOptions){}

        }
    }, [state.isLocalFilter]);

    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSites({
            ids: siteIds,
            titles: siteTitles,
            scSites: siteSC,
        });
        setState((prev) => ({
            ...prev,
            isRefresh: true,
            selectedStateId: ""
        }));
    };

    const onclickRefreshGrid = () => {
        setState((prev) => ({
            ...prev,
            isRefresh: true,
            // selectedStateId: ""
        }));
    };

    const handleDropdownChange = (field: keyof IClientResponseData, selected: any, isMulti: boolean = false, isRefreshOp?: any) => {
        const newValue = isMulti
            ? (selected ? selected.map((x: any) => x.value) : [])
            : (selected ? selected.value : undefined);
        // : (selected ? selected.value : null);

        setState(prev => ({
            ...prev,
            [field]: newValue,
            isRefresh: true,
            // selectedStateId: "",
            isRefreshOptions: isRefreshOp ? true : false
        }));
    };

    const onclickExportToExcel = async () => {
        try {
            const siteName = props?.componentProps?.siteName;
            const fileName = generateCommonExcelFileName(siteName ? `${siteName}-ClientResponse` : 'ClientResponse')
            let exportColumns: any[] = [
                { header: ClientResponseViewFields.SiteName, key: "SiteName" },
                { header: ClientResponseViewFields.ResponseFormId, key: "ResponseFormId" },
                { header: ClientResponseViewFields.Category, key: ClientResponseFields.Category },
                { header: ClientResponseViewFields.SubCategory, key: ClientResponseFields.SubCategory },
                { header: ClientResponseViewFields.ClientResponseStatus, key: ClientResponseFields.ClientResponseStatus },
                { header: ClientResponseViewFields.ReportedBy, key: "ReportedBy" },
                { header: ClientResponseViewFields.SubmissionDate, key: "SubmissionDate" },
                { header: ClientResponseViewFields.ResolvedDate, key: "ResolvedDate" },
                { header: ClientResponseViewFields.ResolvedBy, key: "ResolvedBy" }
            ];

            generateExcelTable(state.filteredClientResponseData, exportColumns, fileName);
        } catch (error) {
            const errorObj = {
                ErrorMethodName: "onclickExportToExcel",
                CustomErrormessage: "error in download",
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                PageName: "QuayClean.aspx"
            };
            void logGenerator(provider, errorObj);
        }
    };

    const _onItemSelected = (item: any): void => {
    };

    const onClickArchiveRecordYes = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Unarchiving...');
        const objUpdate = {
            IsArchive: false
        }
        try {
            await provider.updateItemWithPnP(objUpdate, ListNames.ClientResponsesSubmission, state.selectedIssueItem?.ID);
            let stateId = "";
            if (props.componentProps?.dataObj?.QCStateId) {
                stateId = props.componentProps?.dataObj?.QCStateId;
            } else {
                let data = await getState(state.selectedIssueItem?.SiteNameId, provider);
                stateId = data[0]?.QCStateId
            }

            const logObj = {
                UserName: currentUserRoleDetail?.title,
                SiteNameId: state.selectedIssueItem?.SiteNameId,
                ActionType: UserActivityActionTypeEnum.Unarchive,
                EntityType: UserActionEntityTypeEnum.ClientResponse,
                EntityId: state.selectedIssueItem?.Id,
                EntityName: state.selectedIssueItem?.ResponseFormId,
                Details: `Unarchive client response issue`,
                LogFor: UserActionLogFor.Both,
                StateId: stateId,
                Email: currentUserRoleDetail?.emailId,
                Count: 1
            };
            void UserActivityLog(provider, logObj, currentUserRoleDetail);
            setState(prev => ({
                ...prev,
                isRefresh: true,
                // selectedStateId: "",
                isRefreshOptions: true,
                selectedIssueItem: null,
                isOpenArchiveModal: false
            }));
            setIsLoading(false);
            toastService.updateLoadingWithSuccess(toastId, Messages.RecordUnarchiveSuccess);
        } catch (error) {
            console.log('Error in unarchive data', error);
        }
    };

    const closeArchiveModal = () => {
        setState(prev => ({
            ...prev,
            selectedIssueItem: null,
            isOpenArchiveModal: false
        }));
    };

    const handleCardClick = (title: string | null) => {
        if (title) {
            setState(prev => ({
                ...prev,
                filterCategoryValue: title,
                isLocalFilter: true
            }));
        } else {
            setState(prev => ({
                ...prev,
                filterCategoryValue: '',
                isLocalFilter: true
            }));
        }
    };

    const handleViewChange = (view: string) => {
        setCurrentView(view);
    };

    const onClickCopyLink = async () => {
        setIsLoading(true);
        navigator.clipboard.writeText(qrLinkURL.current);
        setState(prev => ({ ...prev, isCopyLinkClicked: true }));
        const toastId = toastService.loading('Coping...');
        let toastMessage = Messages.CopyLink;
        toastService.updateLoadingWithSuccess(toastId, toastMessage);
        setIsLoading(false);
    }

    React.useEffect(() => {
        if (!!state.stateCountData) {
            const countLookup = Object.fromEntries(state.stateCountData.map((item: any) => [Number(item.Id), item.Count]));
            let stateItems: any[] = currentUserRoleDetail.stateMasterItems;
            const stateData = stateItems.map((title: any) => ({
                Id: title.Id,
                Count: countLookup[title.Id] || 0,
                Title: title.Title
            }));
            setState((prevState: any) => ({ ...prevState, stateTabData: stateData }))
        }
        // setStateTabData(stateData);
    }, [state.stateCountData])

    return {
        provider,
        context,
        currentUserRoleDetail,
        isLoading,
        selectedSites,
        currentView,
        state,
        tooltipId,
        categoryCountCard,
        columns,
        onChangeRangeOption,
        onChangeToDate,
        onChangeFromDate,
        handleSiteChange,
        IssuesListColumn,
        onclickRefreshGrid,
        onclickExportToExcel,
        _onItemSelected,
        handleDropdownChange,
        closeArchiveModal,
        onClickArchiveRecordYes,
        handleCardClick,
        handleOpenQRModal,
        oncloseQRCodeModal,
        handleViewChange,
        onClickUnArchive,
        onClickView,
        setState,
        onClickAttachment,
        onClickCopyLink,
        onStateChange,
        onClickResolveIssue,
        onClickReassignIssue,
        setIsManageSiteAreaOpen,
        setSelectedSiteArea,
        setSelectedSites,
        isManageSiteAreaOpen,
        isSiteLevelComponent,
        selectedZoneDetails
    }

}