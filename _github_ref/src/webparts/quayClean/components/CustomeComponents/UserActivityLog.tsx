/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { IColumn, IDropdownOption, Link, Persona, PersonaSize, Pivot, PivotItem, TooltipHost } from "@fluentui/react";
import { ShowMessage } from "../CommonComponents/ShowMessage";
import { EMessageType } from "../../../../Interfaces/MessageType";
import { Loader } from "../CommonComponents/Loader";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import CamlBuilder from "camljs";
import { ICamlQueryFilter, FieldType, LogicalType } from "../../../../Common/Constants/DocumentConstants";
import { defaultValues, ListNames, UserActionEntityTypeEnum, UserActionLogFor } from "../../../../Common/Enum/ComponentNameEnum";
import { IDataProvider } from "../../../../DataProvider/Interface/IDataProvider";
import { IPnPCAMLQueryOptions } from "../../../../DataProvider/Interface/IPnPQueryOptions";
import { IBreadCrum } from "../../../../Interfaces/IBreadCrum";
import { ILoginUserRoleDetails } from "../../../../Interfaces/ILoginUserRoleDetails";
import { IQuayCleanState } from "../QuayClean";
import { getCAMLQueryFilterExpression, logGenerator, getErrorMessageValue } from "../../../../Common/Util";
import { MemoizedDetailList } from "../../../../Common/DetailsList";
import moment from "moment";
import { MultipleSiteFilter } from "../../../../Common/Filter/MultipleSiteFilter";
import { appGlobalStateAtom } from "../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { EntityTypeFilter } from "../../../../Common/Filter/EntityType";
import { ActionTypeFilter } from "../../../../Common/Filter/ActionType";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActivityLogUserFilter } from "../../../../Common/Filter/ActivityLogUserName";
import { PreDateRangeFilterInspection } from "../../../../Common/Filter/PreDateRangeFilterInspection";
import { IMSReport } from "./IMS/IMSReport";
import { UserWiseIMSReport } from "./IMS/UserWiseIMSReport";
import { SiteReport } from "./Site/SiteReport";
import SiteLoginChart from "./Site/SiteLoginByDate";
import UserVisitsChart from "./Site/UserSiteVisitReport";
import { IMSReportCards } from "./IMS/WorkplaceInspection/IMSReportCards";
import { data } from "jquery";
import { DateTimeFormate, IMSReportCardOptions, UserReportCardOptions, UserReportChemicalCardOptions, UserReportEquipmentAssetsCardOptions, UserReportEquipmentChecklistOptions, UserReportHelpDeskCardOptions, UserReportSitesCardOptions } from "../../../../Common/Constants/CommonConstants";
import IMSReportSiteWise from "./IMS/IMSReportSiteWise";
import EquipmentAssetReport from "./Asset/EquipmentAssetReport";
import ChemicalReport from "./ChemicalManagement/ChemicalReport";
import HelpDeskReport from "./HelpDesk/HeloDeskReport";
import PeriodicReport from "./Preodic/PeriodicReport";
import ClientResponseReport from "./ClientResponse/ClientResponseReport";
import AssignedTeamReport from "./AssignTeam/AssignedTeamReport";
import { IActiveCard } from "../CommonComponents/Chart/HelpDeskCard";
import { DocumentsReport } from "./Document/DocumentsReport";
import { EquipmentChecklistReport } from "./Document/EquipmentChecklist";
import ClientReport from "./Client/ClientReport";
import EventReport from "./Events/EventReport";
import JobControlChecklistReport from "./Document/JobControlChecklistReport";
import { useId } from "@fluentui/react-hooks";
import { StateReport } from "./Site/StateReport";
import UserStateVisitsChart from "./Site/UserStateVisitReport";
import { MasterStateReport } from "./Site/MasterStateReport";
import StateSiteLoginChart from "./Site/StateSiteLoginByDate";
import { StateIMSReport } from "./IMS/WorkplaceInspection/StateIMSReport";
import StateIMSReportSiteWise from "./IMS/StateIMSReportSiteWise";
import StateEquipmentAssetReport from "./Asset/StateEquipmentAssetReport";
import StateChemicalReport from "./ChemicalManagement/StateChemicalReport";
import StateHelpDeskReport from "./HelpDesk/StateHeloDeskReport";
import StatePeriodicReport from "./Preodic/StatePeriodicReport";
import StateClientResponseReport from "./ClientResponse/StateClientResponseReport";
import StateAssignedTeamReport from "./AssignTeam/StateAssignedTeamReport";
import { StateDocumentsReport } from "./Document/StateDocumentsReport";
import NoRecordFound from "../CommonComponents/NoRecordFound";
import { IManageUsersState } from "./ManageSites/Users/ManageUsersData";
import { UserPersonaById } from "../CommonComponents/UserPersonaById";
import { MultiStateFilter } from "../../../../Common/Filter/MultiStateFilter";

export interface IAssociateChemicalProps {
    provider: IDataProvider;
    context: WebPartContext;
    breadCrumItems: IBreadCrum[];
    manageComponentView(componentProp: IQuayCleanState): any;
    loginUserRoleDetails: ILoginUserRoleDetails;
    siteMasterId?: number;
}

export interface IExportColumns {
    header: string;
    key: string;
    width?: number;
}

export const UserActivityLog = (props: IAssociateChemicalProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, currentUserRoleDetail, context } = appGlobalState;
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [Data, setData] = React.useState<any[]>([]);
    const [filterCardData, setFilterCardData] = React.useState<any[]>([]);
    const [loginData, setloginData] = React.useState<any[]>([]);
    const [visitSiteData, setvisitSiteData] = React.useState<any[]>([]);
    const [selectedEntityType, setselectedEntityType] = React.useState<any>("");
    const [selectedActionType, setselectedActionType] = React.useState<any>("");
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>([]);
    const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>([]);
    const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>([]);
    const [GraphView, setGraphView] = React.useState<boolean>(true);
    const [selectedKey, setselectedKey] = React.useState<any>();
    const [selectedActivityLogUser, setSelectedActivityLogUser] = React.useState<any>("");
    const [fromDate, setFromDate] = React.useState<Date | any>();
    const [toDate, setToDate] = React.useState<Date | any>();
    const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: 'Last 30 Days', text: 'Last 30 Days' });
    // filterStartDate = moment(new Date()).subtract(6, 'days').format(defaultValues.FilterDateFormate);
    // filterEndDate = moment(new Date()).format(defaultValues.FilterDateFormate);
    const [filterFromDate, setFilterFromDate] = React.useState<any>(moment(new Date()).subtract(6, 'days').format(defaultValues.FilterDateFormate));
    const [filterToDate, setFilterToDate] = React.useState<any>(moment(new Date()).format(defaultValues.FilterDateFormate));
    const [isMasterGridShow, setIsMasterGridShow] = React.useState<boolean>(true)
    const tooltipId = useId('tooltip');
    const [expanded, setExpanded] = React.useState<{ [key: number]: boolean }>({});
    const [isRefresh, setIsRefresh] = React.useState<boolean>(false);
    const [expandedUsers, setExpandedUsers] = React.useState<{ [key: number]: boolean }>({});
    const [expandedSites, setExpandedSites] = React.useState<{ [key: string]: boolean }>({});
    const [selectedStates, setSelectedStates] = React.useState<any[]>([])
    const [selectedStatesId, setSelectedStatesId] = React.useState<any[]>([])
    const [state, setState] = React.useState<IManageUsersState>({
        userData: [],
        isSort: false,
        expandedUsers: {},
        userGridData: [],
        filterUserGridData: [],
        siteMasterData: [],
        userActivityLogData: [],
        isLoading: false,
        currentPageNumber: 0,
        pagedItems: [],
        selectedSitesIDS: [],
        selectedUserType: "",
        userTypeOptions: [],
        siteData: [],
        userNameOptions: [],
        selectedUserNames: [],
        currentPage: 1,
        itemsPerPage: 50,
        startedIndex: null,
        endedIndex: null,
        sortColumnName: ""
    })

    const toggleUserExpand = (index: number) => {
        setExpandedUsers(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const toggleSiteExpand = (userIndex: number, siteName: string) => {
        const key = `${userIndex}-${siteName}`;
        setExpandedSites(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleExpand = (index: number) => {
        setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const onChangeRangeOption = (item: IDropdownOption): void => {
        setSelectedItem(item);
    };
    const onChangeToDate = (filterDate: any, date?: Date) => {
        setFilterToDate(filterDate);
        setToDate(date);
    };
    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setFromDate(date);
        setFilterFromDate(filterDate);
    };

    const onUserActivityLogChange = (AssetTypeMasterId: any): void => {
        setSelectedActivityLogUser(AssetTypeMasterId.value);
    };
    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSiteIds(siteIds);
        setSelectedSiteTitles(siteTitles);
        setSelectedSCSites(siteSC);
    };


    const onStateChange = (stateIds: number[], options?: any) => {
        setSelectedStates((!!options && options.length > 0) ? options.map((r: any) => r.text) : [])
        setSelectedStatesId((!!stateIds && stateIds.length > 0) ? stateIds : [])
        setSelectedSiteIds([]);
        setSelectedSiteTitles([]);
        setSelectedSCSites([]);

    }

    const onEntityTypeChange = (AssetCategoryId: string): void => {
        setselectedEntityType(AssetCategoryId);
    };

    const onActionTypeChange = (AssetCategoryId: string): void => {
        setselectedActionType(AssetCategoryId);
    };

    const onClickChartIcon = (): void => {
        setGraphView(prevState => !prevState);
    };

    const _onLinkClick = (item: PivotItem): void => {
        if (item.props.itemKey == "Safety Culture") {
        }
        setselectedKey(item.props.itemKey);
        setFilterCardData(Data);
    };

    const _onItemSelected = (item: any): void => {
    };


    const LogColumn = (): IColumn[] => {
        const columns: any[] = [
            { key: 'EntitType', name: 'Entity Type', fieldName: 'EntityType', isResizable: true, minWidth: 120, maxWidth: 180, isSortingRequired: true },
            { key: 'EntityName', name: 'Entity Name', fieldName: 'EntityName', isResizable: true, minWidth: 180, maxWidth: 220, isSortingRequired: true },
            { key: 'Details', name: 'Details', fieldName: 'Details', isResizable: true, minWidth: 150, maxWidth: 220, isSortingRequired: true },
            { key: 'UserName', name: 'User Name', fieldName: 'UserName', isResizable: true, minWidth: 120, maxWidth: 150, isSortingRequired: true },
            { key: 'ActionType', name: 'Action Type', fieldName: 'ActionType', minWidth: 120, maxWidth: 180, isSortingRequired: true },
            { key: 'SiteName', name: 'Site Name', fieldName: 'SiteName', isResizable: true, minWidth: 150, maxWidth: 220, isSortingRequired: true },
            // { key: 'EntityId', name: 'Entity Id', fieldName: 'EntityId', isResizable: true, minWidth: 60, maxWidth: 80, isSortingRequired: true },
            { key: 'TimeStamp', name: 'Time Stamp', fieldName: 'Created', isResizable: true, minWidth: 150, maxWidth: 220, isSortingRequired: true },


        ];
        return columns;
    };

    const _Data = async () => {
        setIsLoading(true);
        try {
            const filterFieldsSite: ICamlQueryFilter[] = [];
            const filterFields: ICamlQueryFilter[] = []

            if (filterFromDate && filterToDate) {
                const dateField = "Created";
                filterFields.push({
                    fieldName: `${dateField}`,
                    fieldValue: `${filterFromDate}`,
                    // fieldValue: `${new Date(new Date(`${filterFromDate}T00:00:00`).toUTCString()).toISOString()}`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.GreaterThanOrEqualTo
                });
                filterFields.push({
                    fieldName: `${dateField}`,
                    fieldValue: `${filterToDate}`,
                    // fieldValue: `${new Date(new Date(`${filterToDate}T23:59:59`).toUTCString()).toISOString()}`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.LessThanOrEqualTo
                })
            } else {
                const endDate = moment().format('YYYY-MM-DD'); // Today's date
                const startDate = moment().subtract(6, 'days').format('YYYY-MM-DD'); // 30 days ago
                const dateField = "Created";
                filterFields.push({
                    fieldName: `${dateField}`,
                    fieldValue: `${startDate}`,
                    // fieldValue: `${new Date(new Date(`${startDate}T00:00:00`).toUTCString()).toISOString()}`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.GreaterThanOrEqualTo
                });
                filterFields.push({
                    fieldName: `${dateField}`,
                    // fieldValue: `${endDate}T23:59:59Z`,
                    // fieldValue: `${new Date(new Date(`${endDate}T23:59:59`).toUTCString()).toISOString()}`,
                    fieldValue: `${new Date(new Date(`${endDate}`).toUTCString()).toISOString()}`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.LessThanOrEqualTo
                })
            }
            filterFields.push(
                {
                    fieldName: "IsActive",
                    fieldValue: true,
                    fieldType: FieldType.Boolean,
                    LogicalType: LogicalType.EqualTo
                },

            );
            filterFields.push(
                {
                    fieldName: "LogFor",
                    fieldValue: [UserActionLogFor.ClientDashboard, UserActionLogFor.Both],
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.In
                }
            )



            if (props?.loginUserRoleDetails?.isAdmin === false && props?.loginUserRoleDetails?.isStateManager === true) {
                if (props?.loginUserRoleDetails?.currentUserAllCombineSites && props?.loginUserRoleDetails?.currentUserAllCombineSites?.length > 0) {
                    filterFieldsSite.push({
                        fieldName: `SiteName`,
                        fieldValue: props?.loginUserRoleDetails?.currentUserAllCombineSites,
                        fieldType: FieldType.LookupById,
                        LogicalType: LogicalType.In
                    });
                }
            }
            if ((props.loginUserRoleDetails.isAdmin == false && props.loginUserRoleDetails.isStateManager == false && props.loginUserRoleDetails.isSiteManager == false && props.loginUserRoleDetails.isSiteSupervisor == false && props.loginUserRoleDetails.isUser == false) && (props.loginUserRoleDetails.isWHSChairperson == true)) {
                filterFieldsSite.push({
                    fieldName: `StateNameValue`,
                    fieldValue: props?.loginUserRoleDetails?.whsChairpersonTitle,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.In
                });

            }
            if (selectedStates.length > 0) {
                filterFieldsSite.push({
                    fieldName: `StateName`,
                    fieldValue: selectedStates,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.In
                });
            }

            if (selectedSiteIds.length > 0) {
                filterFieldsSite.push({
                    fieldName: `SiteName`,
                    fieldValue: selectedSiteIds,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.In
                });
            }
            if (selectedEntityType.length > 0) {
                filterFieldsSite.push({
                    fieldName: `EntityType`,
                    fieldValue: selectedEntityType,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                });
            }
            if (selectedActionType.length > 0) {
                filterFieldsSite.push({
                    fieldName: `ActionType`,
                    fieldValue: selectedActionType,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                });
            }
            if (selectedActivityLogUser.length > 0) {
                filterFieldsSite.push({
                    fieldName: `UserName`,
                    fieldValue: selectedActivityLogUser,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                });
            }
            const camlQuery = new CamlBuilder()
                .View(["ID",
                    "Title",
                    "UserName",
                    "SiteName",
                    "StateName",
                    "State",
                    "ActionType",
                    "EntityType",
                    "EntityId",
                    "EntityName",
                    "Details",
                    "Created",
                    "Modified",
                    "Email",
                    "Author",
                    "IsDeletedSite",
                    "StateNameValue"
                ])
                .LeftJoin("SiteName", "SiteName").Select("IsDeletedSite", "IsDeletedSite").Select("StateNameValue", 'StateNameValue')
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query()
            const siteFilter: any[] = getCAMLQueryFilterExpression([...filterFields, ...filterFieldsSite,]);
            camlQuery.Where().All(siteFilter);
            let finalQuery = camlQuery.ToString();
            const pnpQueryOptions: IPnPCAMLQueryOptions = {
                listName: ListNames.UserActivityLog,
                queryXML: finalQuery,
                pageToken: "",
                pageLength: 100000
            }

            const localResponse = await props.provider.getItemsInBatchByCAMLQuery(pnpQueryOptions);
            let results = localResponse?.Row;

            if (!!results) {
                results = results.filter((i: any) => i.IsDeletedSite != "1");
                let ListData = results.map((data: any) => {
                    return (
                        {
                            ID: data.ID,
                            SortID: Number(data.ID),
                            SiteNameId: !!data.SiteName[0] ? data.SiteName[0]?.lookupId : "",
                            SiteName: !!data.SiteName[0] ? data.SiteName[0].lookupValue : "",
                            // StateId: !!data.State[0] ? data.State[0]?.lookupId : "",
                            // State: !!data.State[0] ? data.State[0].lookupValue : "Unknown State",
                            State: !!data.StateName ? data.StateName : "Unknown State",
                            UserName: !!data.UserName ? data.UserName : "",
                            ActionType: !!data.ActionType ? data.ActionType : '',
                            EntityType: !!data.EntityType ? data.EntityType : '',
                            EntityId: !!data.EntityId ? data.EntityId : '',
                            EntityName: !!data.EntityName ? data.EntityName : '',
                            Details: !!data.Details ? data.Details : '',
                            // Email: !!data.Email ? data.Email : !!data.Author ? data.Author[0]?.email : "",
                            AuthorId: !!data.Author ? Number(data.Author[0]?.id || '0') : "",
                            Email: !!data.Author ? data.Author[0]?.email : "",
                            Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
                            OrgCreated: !!data.Created ? data.Created : "",
                            OrgModified: !!data.Modified ? data.Modified : "",
                            Modified: !!data.Modified ? moment(data.Modified).format(DateTimeFormate) : "",
                        }
                    );
                });

                ListData = ListData.sort((a: any, b: any) => {
                    return b.SortID - a.SortID; // Descending: higher Id comes first
                });

                setFilterCardData(ListData);
                setData(ListData);
                // setKeyUpdate(Math.random())
                setIsRefreshGrid(true);
                setIsLoading(false);
            }

        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "_Data", CustomErrormessage: "error in get _data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            const errorMessage = getErrorMessageValue(error.message);
            setError(errorMessage);
            sethasError(true);
        }
    };

    const getLastLoginData = (listData: any[]) => {
        const now = new Date();
        const humanReadableDiff = (date: Date) => {
            const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
            const intervals = [
                { label: 'year', seconds: 31536000 },
                { label: 'month', seconds: 2592000 },
                { label: 'week', seconds: 604800 },
                { label: 'day', seconds: 86400 },
                { label: 'hour', seconds: 3600 },
                { label: 'minute', seconds: 60 },
                { label: 'second', seconds: 1 },
            ];

            for (const interval of intervals) {
                const count = Math.floor(seconds / interval.seconds);
                if (count >= 1) {
                    return count === 1
                        ? `1 ${interval.label} ago`
                        : `${count} ${interval.label}s ago`;
                }
            }
            return "just now";
        };

        // const loginData = listData.filter(item => item.ActionType === "Login");
        const loginData = listData;

        const userLogins: Record<string, { date: Date, email: string, modified: any, authorid: any, orgModified: any }> = {};

        loginData.forEach(item => {
            const orgModifiedStr = item.OrgCreated || item.Created;
            const loginDate = new Date(orgModifiedStr);

            if (!userLogins[item.UserName] || userLogins[item.UserName].date < loginDate) {
                userLogins[item.UserName] = {
                    date: loginDate,
                    email: item.Email,
                    modified: item.Created,
                    authorid: item.AuthorId,
                    orgModified: item.OrgModified
                };
            }
        });

        const result = Object.entries(userLogins).map(([UserName, info]) => ({
            UserName,
            LastSeen: humanReadableDiff(info.date),
            Email: info.email,
            Modified: moment(info.date).format(DateTimeFormate),
            AuthorId: info.authorid,
            OrgModified: info.orgModified

        }));
        return result;
    };

    const onClickCardFilter = (activeCards: IActiveCard[], defaultFilter?: string[]) => {

        if (!!activeCards && activeCards.length > 0) {
            let filterItems: any[] = [];
            filterItems = Data.filter((x: any) => {
                return activeCards.every((j) => {
                    if (!!defaultFilter && defaultFilter.length > 0) {
                        return x[j.columnName] === j.value && defaultFilter.includes(x.EntityType)

                    } else {
                        return x[j.columnName] === j.value;
                    }

                });
            });
            setFilterCardData(filterItems);
        } else {
            setFilterCardData(Data)
        }
        // setIsRefreshGrid(prevState => !prevState);
        // setKeyUpdate(Math.random())

    }

    const onclickRefreshGrid = () => {
        setIsRefresh(prevState => !prevState);
    };

    React.useEffect(() => {
        setIsRefreshGrid(false);
        // setKeyUpdate(Math.random())
        _Data();
    }, [selectedSiteIds, selectedStates, isRefresh, selectedEntityType, selectedActionType, selectedActivityLogUser, selectedItem, fromDate, toDate,]);

    React.useEffect(() => {
        const filteredData = filterCardData.filter(
            item => item.ActionType === "Visit" && item.SiteNameId != null && item.SiteNameId != ''
        );
        setvisitSiteData(filterCardData);
        let UserLastSeenData = getLastLoginData(filterCardData);
        setloginData(UserLastSeenData);

    }, [filterCardData]);



    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {isLoading && <Loader />}

            <div className="boxCard">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                        <div className="dflex justifyContentBetween">
                            <h1 className="mainTitle">User Activity Log</h1>
                            {(!selectedKey || selectedKey == "MasterReport") && <div className="">
                                <div className="dflex">
                                    <div className="mla linklbl">
                                        <Link
                                            className="actionBtn iconSize btnMove dticon custdd-icon"
                                            onClick={() => setIsMasterGridShow(prevState => !prevState)}
                                        >
                                            <TooltipHost content={!isMasterGridShow ? "Grid view" : "Graph view"} id={`tooltip`}>
                                                <FontAwesomeIcon icon={!isMasterGridShow ? "table-cells" : "chart-simple"} />
                                            </TooltipHost>
                                        </Link>
                                    </div>
                                </div>
                            </div>}
                        </div>
                    </div>
                    <div className="ms-Grid-row filml-8">
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
                            <div className="formControl">
                                <MultiStateFilter
                                    loginUserRoleDetails={currentUserRoleDetail}
                                    selectedState={selectedStatesId || []}
                                    onStateChange={onStateChange}
                                    provider={provider}
                                    isRequired={false}
                                    isClearable={true}
                                />
                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
                            <div className="formControl">
                                <MultipleSiteFilter
                                    isPermissionFiter={true}
                                    loginUserRoleDetails={currentUserRoleDetail}
                                    selectedSiteIds={selectedSiteIds}
                                    selectedSiteTitles={selectedSiteTitles}
                                    selectedSCSite={selectedSCSites}
                                    selectedState={selectedStatesId || []}
                                    onSiteChange={handleSiteChange}
                                    provider={provider}
                                    isRequired={true}
                                    AllOption={true}
                                />
                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
                            <div className="formControl">
                                <EntityTypeFilter
                                    selectedEntityType={selectedEntityType}
                                    defaultOption={!!selectedEntityType ? selectedEntityType : ""}
                                    onEntityTypeChange={onEntityTypeChange}
                                    provider={props.provider}
                                    AllOption={true}
                                    isRequired={true} />
                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
                            <div className="formControl">
                                <ActionTypeFilter
                                    selectedActionType={selectedActionType}
                                    defaultOption={!!selectedActionType ? selectedActionType : ""}
                                    onActionTypeChange={onActionTypeChange}
                                    provider={props.provider}
                                    AllOption={true}
                                    isRequired={true} />
                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
                            <div className="formControl">
                                <ActivityLogUserFilter
                                    selectedActivityLogUser={selectedActivityLogUser}
                                    defaultOption={!!selectedActivityLogUser ? selectedActivityLogUser : ""}
                                    onOptionChange={onUserActivityLogChange}
                                    provider={props.provider}
                                    AllOption={true} />

                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
                            <div className="formControl">
                                <PreDateRangeFilterInspection
                                    fromDate={fromDate}
                                    toDate={toDate}
                                    onFromDateChange={onChangeFromDate}
                                    onToDateChange={onChangeToDate}
                                    onChangeRangeOption={onChangeRangeOption}
                                />
                            </div>
                        </div>
                        {/* {(!selectedKey || selectedKey == "MasterReport") && <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
                            <div className="dflex">
                                <div className="mla linklbl">
                                    <Link
                                        className="actionBtn iconSize btnMove dticon custdd-icon"
                                        onClick={() => setIsMasterGridShow(prevState => !prevState)}
                                    >
                                        <TooltipHost content={!isMasterGridShow ? "Grid view" : "Graph view"} id={`tooltip`}>
                                            <FontAwesomeIcon icon={!isMasterGridShow ? "table-cells" : "chart-simple"} />
                                        </TooltipHost>
                                    </Link>
                                </div>
                            </div>
                        </div>} */}

                    </div>
                    <div className='ms-Grid-row p-14'>
                        <div className='ms-md12 ms-sm12 ms-Grid-col'>
                            <div className='dashboard-card p00'>
                                <div className='card-header'></div>
                                <div className='p-15 height211 lightgrey2'>
                                    <div className="">
                                        <Pivot aria-label="Basic Pivot Example" id="SCpivot" selectedKey={selectedKey}
                                            onLinkClick={_onLinkClick}>
                                            {/* <PivotItem headerText="Function" itemKey="Function">
                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        {isRefreshGrid && <FunctionData
                                                            Data={Data}
                                                        />}

                                                    </div>
                                                </div>
                                            </PivotItem> */}

                                            <PivotItem headerText="Master Report" itemKey="MasterReport">
                                                <div className="">
                                                    {isMasterGridShow ? <div className="formGroup mt-3">
                                                        <MemoizedDetailList
                                                            manageComponentView={props.manageComponentView}
                                                            columns={LogColumn() as any}
                                                            items={filterCardData || []}
                                                            reRenderComponent={true}
                                                            searchable={true}
                                                            onSelectedItem={_onItemSelected}
                                                            addEDButton={<></>}
                                                            isAddNew={true}
                                                            addNewContent={<></>} />
                                                    </div>
                                                        :
                                                        <div className="mt-2">
                                                            <Pivot aria-label="Basic Pivot Example 1" id="SCpivot1" selectedKey={selectedKey}
                                                                onLinkClick={_onLinkClick}>
                                                                <PivotItem headerText="Site wise activity" itemKey="Site">
                                                                    <div className="">
                                                                        <div className="formGroup mt-3">
                                                                            <div>
                                                                                <div className="mt-10">
                                                                                </div>
                                                                                <UserVisitsChart visitSiteData={visitSiteData} />
                                                                                {/* User Chart End */}

                                                                                {/* Sites Chart Start */}
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <SiteReport
                                                                                            isChartOnly={true}
                                                                                            ChartData={filterCardData}
                                                                                        />}
                                                                                        {isRefreshGrid && <SiteLoginChart
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData} chartType={"pie"} />}
                                                                                    </div>
                                                                                </div>
                                                                                {/* Sites Chart End */}

                                                                                {/* IMS Chart Start */}
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <IMSReport
                                                                                            isChartOnly={true}
                                                                                            ChartData={filterCardData}
                                                                                        />}

                                                                                        {isRefreshGrid && <IMSReportSiteWise
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>

                                                                                {/* IMS Chart End */}

                                                                                {/* Equipment/Assets Chart Start */}
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <EquipmentAssetReport
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>
                                                                                {/* Equipment/Assets Chart End */}

                                                                                {/* Chemicals Chart Start */}
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">

                                                                                        {isRefreshGrid && <ChemicalReport
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>
                                                                                {/* Chemicals Chart End */}

                                                                                {/* Help Desk Chart Start */}
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">

                                                                                        {isRefreshGrid && <HelpDeskReport
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Help Desk Chart End */}

                                                                                {/* Periodic Chart Start */}
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">

                                                                                        {isRefreshGrid && <PeriodicReport
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Periodic Chart End */}

                                                                                {/* Client Response Chart Start */}
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <ClientResponseReport
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Client Response Chart End */}

                                                                                {/* Assigned Team Chart Start */}

                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <AssignedTeamReport
                                                                                            isChartOnly={true}
                                                                                            data={Data}
                                                                                        />}
                                                                                    </div>
                                                                                </div>

                                                                                {/* Assigned Team Chart End */}

                                                                                {/* Document Team Chart Start */}

                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <DocumentsReport
                                                                                            isChartOnly={true}
                                                                                            ChartData={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>
                                                                                {/* Document Team Chart End */}

                                                                                {/* Equipment Checklist Team Chart Start */}
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <EquipmentChecklistReport
                                                                                            isChartOnly={true}
                                                                                            ChartData={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>
                                                                                {/* Equipment Checklist Team Chart End */}

                                                                                {/* Client Team Chart Start */}
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <ClientReport
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>
                                                                                {/* Client Team Chart End */}
                                                                                {/* Event Team Chart Start */}
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <EventReport
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </PivotItem>
                                                                <PivotItem headerText="State wise activity" itemKey="State">
                                                                    <div className="">
                                                                        <div className="formGroup mt-3">
                                                                            <UserStateVisitsChart visitSiteData={visitSiteData} />
                                                                            <div className="">
                                                                                <div className="formGroup mt-3">
                                                                                    {isRefreshGrid && <MasterStateReport
                                                                                        isChartOnly={true}
                                                                                        ChartData={filterCardData}
                                                                                    />}
                                                                                    {isRefreshGrid && <StateSiteLoginChart
                                                                                        isChartOnly={true}
                                                                                        data={filterCardData} chartType={"pie"} />}
                                                                                </div>
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {/* {isRefreshGrid && <StateIMSReport
                                                                                            isChartOnly={true}
                                                                                            ChartData={filterCardData}
                                                                                        />} */}

                                                                                        {isRefreshGrid && <StateIMSReportSiteWise
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <StateEquipmentAssetReport
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">

                                                                                        {isRefreshGrid && <StateChemicalReport
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">

                                                                                        {isRefreshGrid && <StateHelpDeskReport
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">

                                                                                        {isRefreshGrid && <StatePeriodicReport
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <StateClientResponseReport
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <StateAssignedTeamReport
                                                                                            isChartOnly={true}
                                                                                            data={Data}
                                                                                        />}
                                                                                    </div>
                                                                                </div>

                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <StateDocumentsReport
                                                                                            isChartOnly={true}
                                                                                            ChartData={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>
                                                                                {/* <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <EquipmentChecklistReport
                                                                                            isChartOnly={true}
                                                                                            ChartData={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div> */}
                                                                                {/* <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <ClientReport
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="">
                                                                                    <div className="formGroup mt-3">
                                                                                        {isRefreshGrid && <EventReport
                                                                                            isChartOnly={true}
                                                                                            data={filterCardData}
                                                                                        />}
                                                                                    </div>
                                                                                </div> */}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </PivotItem>
                                                            </Pivot>
                                                        </div>

                                                    }
                                                </div>
                                                {/* Event Team Chart End */}
                                            </PivotItem>
                                            <PivotItem headerText="User" itemKey="User Activity Login">
                                                <div className="mt-10">
                                                    <IMSReportCards data={Data} cardsArray={UserReportCardOptions} handleCardClick={onClickCardFilter} />
                                                </div>
                                                <div style={{ position: "relative" }} className={`${window.innerWidth > 768 ? "card-Action-New-mar-0" : "mobile-card-Action-New"} `}>
                                                    {/* ------------------------------------------------------------------------ */}
                                                    <div className="header-2 inspection-stick-header ">
                                                        <div className="row2">
                                                            <div className="cell2 header-cell clsHighWidthHeader cursorPointer"

                                                            >
                                                                <span>User Name</span>

                                                            </div>
                                                            <div className="cell2 header-cell clsWidthScore cursorPointer"

                                                            >
                                                                <span>
                                                                    Last Seen</span>

                                                            </div>

                                                        </div>
                                                    </div>
                                                    <div className="container-drag">

                                                        <div className={"inspection-stick-header"}>
                                                            {loginData
                                                                // Sort loginData in descending order by Modified date
                                                                // .sort((a, b) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime())
                                                                .sort((a, b) => new Date(b.OrgCreated).getTime() - new Date(a.OrgCreated).getTime())
                                                                .map((item: any, index: number) => {
                                                                    // Filter out the user's visits from visitSiteData
                                                                    const userVisits = visitSiteData.filter(v => v.Email === item.Email);

                                                                    // Group visits by EntityType + Modified Date (Last Visit Date)
                                                                    const groupedByEntityTypeAndDate = Array.from(
                                                                        userVisits.reduce((acc, visit) => {
                                                                            const key = `${visit.EntityType} | ${visit.Created}`;
                                                                            if (!acc.has(key)) acc.set(key, []);
                                                                            acc.get(key)?.push(visit);
                                                                            return acc;
                                                                        }, new Map<string, any[]>())
                                                                    );

                                                                    // Group visits by EntityType
                                                                    const groupedByEntityType = Array.from(
                                                                        userVisits.reduce((acc, visit) => {
                                                                            const key = visit.EntityType;
                                                                            if (!acc.has(key)) acc.set(key, []);
                                                                            acc.get(key)?.push(visit);
                                                                            return acc;
                                                                        }, new Map<string, any[]>())
                                                                    );

                                                                    return (
                                                                        <div className="cardHeader-Action2 p-0" key={index}>
                                                                            <div className="container22">
                                                                                <div className="row2" onClick={() => toggleUserExpand(index)} style={{ cursor: 'pointer' }}>
                                                                                    <div className="cell2 info-chart-2">
                                                                                        <FontAwesomeIcon
                                                                                            className="dticon"
                                                                                            icon={expandedUsers[index] ? "caret-down" : "caret-right"}
                                                                                        />
                                                                                        {/* <Persona
                                                                                            imageUrl={`${window.location.origin}/_layouts/15/userPhoto.aspx?accountName=${item.Email}&Size=l`}
                                                                                            size={PersonaSize.size72}
                                                                                            imageAlt="IMG"
                                                                                        /> */}
                                                                                        <UserPersonaById
                                                                                            title={item.UserName}
                                                                                            email={item.Email}
                                                                                            context={context}
                                                                                            AuthorId={item.AuthorId}
                                                                                            provider={provider}
                                                                                            personSize={PersonaSize.size72}
                                                                                        />
                                                                                        {/* <div>
                                                                                            <div className="date-and-name">
                                                                                                <span style={{ whiteSpace: 'pre-line' }} className="fsize-mid">{item.UserName}</span>
                                                                                            </div>
                                                                                            <div className="location fsize-13">{item.Email || "No Email"}</div>
                                                                                        </div> */}
                                                                                    </div>
                                                                                    <div className="cell2 clsDocWidth2">
                                                                                        <TooltipHost content={item.Created} id={`tooltip-${index}`}>
                                                                                            <div className="">{item.LastSeen}</div>
                                                                                        </TooltipHost>
                                                                                    </div>
                                                                                </div>
                                                                                {expandedUsers[index] && groupedByEntityTypeAndDate.length > 0 && (
                                                                                    <div className="visit-subtable ml5">
                                                                                        <div className="header-drag">
                                                                                            <div className="header-cell-drag chart-min-px5k">Entity Type</div>
                                                                                            <div className="header-cell-drag chart-m-l-chart">Visit Count</div>
                                                                                            <div className="header-cell-drag">Last Visit Date</div>
                                                                                        </div>
                                                                                        {groupedByEntityType.map(([entityType, visits]: [string, any[]]) => {
                                                                                            const siteKey = `${index}-${entityType}`;

                                                                                            // Sort visits descending by Modified date to pick the latest one
                                                                                            const latestVisitDate = visits
                                                                                                .slice()
                                                                                                .sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime())[0]
                                                                                                .Created;

                                                                                            return (
                                                                                                <div key={siteKey}>
                                                                                                    <div
                                                                                                        className="row-drag draggable-drag"
                                                                                                        draggable="true"
                                                                                                        style={{ width: '100%', marginTop: '4px', cursor: 'pointer' }}
                                                                                                        onClick={() => toggleSiteExpand(index, entityType)}
                                                                                                    >
                                                                                                        <div className="header-cell-drag chart-min-px80 d-flex align-items-center tbl-f-w">
                                                                                                            <FontAwesomeIcon
                                                                                                                className="dticon me-2"
                                                                                                                icon={expandedSites[siteKey] ? 'caret-down' : 'caret-right'}
                                                                                                            />
                                                                                                            {entityType}
                                                                                                        </div>
                                                                                                        <div className="header-cell-drag chart-m-l-chart tbl-f-w">{visits.length}</div>
                                                                                                        <div className="header-cell-drag tbl-f-w">{latestVisitDate}</div>
                                                                                                    </div>
                                                                                                    {expandedSites[siteKey] && (
                                                                                                        <div style={{ paddingLeft: '10px', marginTop: '5px' }}>
                                                                                                            <div className="header-drag header-drag-3-bg" style={{ fontWeight: 'bold' }}>
                                                                                                                <div className="header-cell-drag">Entity Name</div>
                                                                                                                <div className="header-cell-drag chart-min-px5k">Details</div>
                                                                                                                {visits[0]?.EntityType !== 'Dashboard' && visits[0]?.EntityType !== 'View Site' && (
                                                                                                                    <div className="header-cell-drag">Site Name</div>
                                                                                                                )}
                                                                                                                <div className="header-cell-drag">Action Type</div>
                                                                                                                <div className="header-cell-drag">Timestamp</div>
                                                                                                            </div>
                                                                                                            {visits.map((detail, idx) => (
                                                                                                                <div key={idx} className="row-drag draggable-drag tbl-f-w" style={{ width: '100%' }}>
                                                                                                                    <div className="header-cell-drag tbl-f-w">{detail.EntityName}</div>
                                                                                                                    <div className="header-cell-drag tbl-f-w chart-min-px5k">
                                                                                                                        <TooltipHost content={(detail.Details || '').trim()}>
                                                                                                                            <div>
                                                                                                                                {(detail.Details || '').trim().length > 30
                                                                                                                                    ? (detail.Details || '').trim().slice(0, 30) + '...more'
                                                                                                                                    : (detail.Details || '').trim()}
                                                                                                                            </div>
                                                                                                                        </TooltipHost>
                                                                                                                    </div>
                                                                                                                    {detail.EntityType !== 'Dashboard' && detail.EntityType !== 'View Site' && (
                                                                                                                        <div className="header-cell-drag tbl-f-w chart-min-px5k">{detail.SiteName}</div>
                                                                                                                    )}
                                                                                                                    <div className="header-cell-drag tbl-f-w">{detail.ActionType}</div>
                                                                                                                    <div className="header-cell-drag tbl-f-w">{detail.Created}</div>
                                                                                                                </div>
                                                                                                            ))}
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            );
                                                                                        })}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                        </div>

                                                    </div>
                                                </div>
                                                <UserVisitsChart visitSiteData={visitSiteData} />
                                            </PivotItem>
                                            {/* <PivotItem headerText="State" itemKey="State Report">
                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        {isRefreshGrid && <StateReport
                                                            ChartData={filterCardData}
                                                        />}
                                                    </div>
                                                </div>
                                            </PivotItem> */}
                                            <PivotItem headerText="Sites" itemKey="Sites">
                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        <IMSReportCards handleCardClick={onClickCardFilter} data={Data} cardsArray={UserReportSitesCardOptions} isIMSReport={false} filterColumnValue={[UserActionEntityTypeEnum.Site]} />
                                                        {isRefreshGrid && <SiteReport
                                                            ChartData={filterCardData}
                                                        />}
                                                        {isRefreshGrid && <SiteLoginChart
                                                            data={filterCardData} chartType={"pie"} />}
                                                    </div>
                                                </div>
                                            </PivotItem>
                                            <PivotItem headerText="Quaysafe" itemKey="IMS">
                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        <IMSReportCards handleCardClick={onClickCardFilter} data={Data} cardsArray={IMSReportCardOptions} isIMSReport={true} filterColumnValue={[UserActionEntityTypeEnum.ToolboxTalk,
                                                        UserActionEntityTypeEnum.SkillMatrix,
                                                        UserActionEntityTypeEnum.WorkplaceInspection,
                                                        UserActionEntityTypeEnum.CorrectiveActionReport,
                                                        UserActionEntityTypeEnum.WHSCommitteeInspection,
                                                        UserActionEntityTypeEnum.WHSCommitteeMeeting,]} />
                                                        {isRefreshGrid && <IMSReport
                                                            ChartData={filterCardData}
                                                        />}

                                                        {isRefreshGrid && <IMSReportSiteWise
                                                            data={filterCardData}
                                                        />}
                                                    </div>
                                                </div>
                                            </PivotItem>

                                            <PivotItem headerText="Equipment/Assets" itemKey="Equipment/Assets">
                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        <IMSReportCards handleCardClick={onClickCardFilter} data={Data} cardsArray={UserReportEquipmentAssetsCardOptions} filterColumnValue={[UserActionEntityTypeEnum.EquipmentAsset]} />
                                                        {isRefreshGrid && <EquipmentAssetReport
                                                            data={filterCardData}
                                                        />}
                                                    </div>
                                                </div>
                                            </PivotItem>
                                            <PivotItem headerText="Chemicals" itemKey="Chemicals">
                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        <IMSReportCards handleCardClick={onClickCardFilter} data={Data} cardsArray={UserReportChemicalCardOptions} filterColumnValue={[UserActionEntityTypeEnum.Chemical, UserActionEntityTypeEnum.AssociateChemical]} />
                                                        {isRefreshGrid && <ChemicalReport
                                                            data={filterCardData}
                                                        />}
                                                    </div>
                                                </div>
                                            </PivotItem>
                                            <PivotItem headerText="Help Desk" itemKey="HelpDesk">
                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        <IMSReportCards handleCardClick={onClickCardFilter} data={Data} cardsArray={UserReportHelpDeskCardOptions} filterColumnValue={[UserActionEntityTypeEnum.HelpDesk]} />
                                                        {isRefreshGrid && <HelpDeskReport
                                                            data={filterCardData}
                                                        />}
                                                    </div>
                                                </div>
                                            </PivotItem>
                                            <PivotItem headerText="Periodic" itemKey="Periodic">
                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        <IMSReportCards handleCardClick={onClickCardFilter} data={Data} cardsArray={UserReportHelpDeskCardOptions} filterColumnValue={[UserActionEntityTypeEnum.Periodic]} />
                                                        {isRefreshGrid && <PeriodicReport
                                                            data={filterCardData}
                                                        />}
                                                    </div>
                                                </div>
                                            </PivotItem>
                                            <PivotItem headerText="Client Response" itemKey="ClientResponse">
                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        <IMSReportCards handleCardClick={onClickCardFilter} data={Data} cardsArray={UserReportHelpDeskCardOptions} filterColumnValue={[UserActionEntityTypeEnum.ClientResponse]} />
                                                        {isRefreshGrid && <ClientResponseReport
                                                            data={filterCardData}
                                                        />}
                                                    </div>
                                                </div>
                                            </PivotItem>
                                            <PivotItem headerText="Assigned Team" itemKey="AssignedTeam">

                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        <IMSReportCards data={Data} handleCardClick={onClickCardFilter} cardsArray={UserReportHelpDeskCardOptions} filterColumnValue={[UserActionEntityTypeEnum.AssignedTeam]} />
                                                        {isRefreshGrid && <AssignedTeamReport
                                                            data={filterCardData}
                                                        />}
                                                    </div>
                                                </div>
                                            </PivotItem>
                                            <PivotItem headerText="Document" itemKey="Document">
                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        <IMSReportCards data={Data} handleCardClick={onClickCardFilter} cardsArray={UserReportHelpDeskCardOptions} filterColumnValue={[UserActionEntityTypeEnum.AddDocument, UserActionEntityTypeEnum.LinkDocument, UserActionEntityTypeEnum.Document, UserActionEntityTypeEnum.LinkURL]} />
                                                        {isRefreshGrid && <DocumentsReport
                                                            ChartData={filterCardData}
                                                        />}
                                                    </div>
                                                </div>
                                            </PivotItem>
                                            <PivotItem headerText="Equipment Checklist" itemKey="EquipmentChecklist">
                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        <IMSReportCards data={Data} handleCardClick={onClickCardFilter} cardsArray={UserReportEquipmentChecklistOptions} filterColumnValue={[UserActionEntityTypeEnum.AssetTypeMaster, UserActionEntityTypeEnum.QuestionBank]} />
                                                        {isRefreshGrid && <EquipmentChecklistReport
                                                            ChartData={filterCardData}
                                                        />}
                                                    </div>
                                                </div>
                                            </PivotItem>
                                            <PivotItem headerText="Client" itemKey="Client">
                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        <IMSReportCards data={Data} handleCardClick={onClickCardFilter} cardsArray={UserReportEquipmentChecklistOptions} filterColumnValue={[UserActionEntityTypeEnum.Client]} />
                                                        {isRefreshGrid && <ClientReport
                                                            data={filterCardData}
                                                        />}
                                                    </div>
                                                </div>
                                            </PivotItem>
                                            <PivotItem headerText="Event" itemKey="Event">
                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        <IMSReportCards data={Data} handleCardClick={onClickCardFilter} cardsArray={UserReportEquipmentChecklistOptions} filterColumnValue={[UserActionEntityTypeEnum.Event]} />
                                                        {isRefreshGrid && <EventReport
                                                            data={filterCardData}
                                                        />}
                                                    </div>
                                                </div>
                                            </PivotItem>
                                            <PivotItem headerText="Monthly KPI's" itemKey="Job Control Checklist">
                                                <div className="">
                                                    <div className="formGroup mt-3">
                                                        <IMSReportCards data={Data} handleCardClick={onClickCardFilter} cardsArray={UserReportHelpDeskCardOptions} filterColumnValue={[UserActionEntityTypeEnum.JobControlChecklist]} />
                                                        {isRefreshGrid && <JobControlChecklistReport
                                                            data={filterCardData}
                                                        />}
                                                    </div>
                                                </div>
                                            </PivotItem>
                                        </Pivot>

                                    </div >
                                </div>
                            </div>
                        </div>
                    </div >
                </div>
            </div >
        </>;
    }
};