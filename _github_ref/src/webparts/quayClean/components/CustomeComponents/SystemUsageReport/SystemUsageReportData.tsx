import { useAtomValue } from "jotai";
import { DataType, DateTimeFormate, LoadCombineStateReportEnum } from "../../../../../Common/Constants/CommonConstants";
import { ISystemUsageReportProps } from "./SystemUsageReport";
import { useState } from "react";
import React from "react";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { faHome, faChartBar, faCheck, faFileAlt, faUmbrellaBeach, faCircleArrowUp, faCircleArrowDown, faStar, faClock, faUser, faGaugeHigh, faBarsProgress, faListCheck, faUsersLine, faSquarePollHorizontal, faChartPie, } from '@fortawesome/free-solid-svg-icons';
import { CombineStateReport } from "./CombineStateReport/CombineStateReport";
import { IDropdownOption } from "@fluentui/react";
import { getCAMLQueryFilterExpression, logGenerator, mapSingleValue } from "../../../../../Common/Util";
import moment from "moment";
import { IPnPCAMLQueryOptions } from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import CamlBuilder from "camljs";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { defaultValues, ListNames, UserActionLogFor } from "../../../../../Common/Enum/ComponentNameEnum";
import { IReportState, IReportSites, IReportUserActivityLog } from "./IReport";
import { SystemUsageDashboard } from "./Dashboard/SystemUsageDashboard";
import { TopLowSites } from "./TopLowSites/TopLowSites";
import { SiteUserVsAccessedUser } from "./SubMenuReport/SiteUserVsAccessedUser/SiteUserVsAccessedUser";
import { EntityTypeDistribution } from "./SubMenuReport/EntityTypeDistribution/EntityTypeDistribution";
import { ActiveUsersTrend } from "./SubMenuReport/ActiveUsersTrend/ActiveUsersTrend";
import { LowSiteUsage } from "./SubMenuReport/LowSiteUsage/LowSiteUsage";
import { UserLevelEngagementScore } from "./SubMenuReport/UserLevelEngagementScore/UserLevelEngagementScore";
import { SubDashboard } from "./SubMenuReport/SubDashboard";
export interface ISystemUsageReportDataState {
    selectedMenu: { key: string, DisplayName: string };
    selectedStatesId: any[];
    selectedStates: any[];
    selectedSiteIds: any[];
    selectedEntityType: any[];
    selectedActionType: any[];
    selectedActivityLogUser: any;
    selectedSiteTitles: any[];
    fromDate: any;
    toDate: any;
    filterFromDate: any;
    selectedSCSites: any[];
    selectedItem: IDropdownOption;
    filterToDate: any;
    isLoading: boolean;
    stateItems: IReportState[];
    siteItems: IReportSites[];
    userActivityLogItems: IReportUserActivityLog[];
    filterStateItems: IReportState[];
    filterSiteItems: IReportSites[];
    filterUserActivityLogItems: IReportUserActivityLog[];
    keyUpdate: number;
    toggleKeyUpdate: number;
    stateKeyUpdate: number;
    allFilterKeyUpdate: number;
    topNumber: any;
    bottomNumber: any;
    isDateFilterChange: boolean
    topInteraction: number

}

export const SystemUsageReportData = (props: ISystemUsageReportProps) => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const didMount = React.useRef(false);

    const { provider, currentUserRoleDetail, context } = appGlobalState;
    const [state, setState] = React.useState<ISystemUsageReportDataState>({
        selectedMenu: { key: LoadCombineStateReportEnum.Dashboard, DisplayName: "Dashboard" },
        isLoading: false,
        selectedStatesId: [],
        selectedEntityType: [],
        selectedActionType: [],
        selectedSiteTitles: [],
        selectedItem: { key: 'Last 7 Days', text: 'Last 7 Days' },
        selectedActivityLogUser: "",
        selectedSCSites: [],
        selectedSiteIds: [],
        selectedStates: [],
        keyUpdate: Math.random(),
        stateKeyUpdate: Math.random(),
        toggleKeyUpdate: Math.random(),
        allFilterKeyUpdate: Math.random(),
        fromDate: "",
        toDate: "",
        filterFromDate: moment(new Date()).subtract(6, 'days').format(defaultValues.FilterDateFormate),
        filterToDate: moment(new Date()).format(defaultValues.FilterDateFormate),
        // filterFromDate: "",
        // filterToDate: "",
        stateItems: [],
        siteItems: [],
        userActivityLogItems: [],
        filterStateItems: [],
        filterSiteItems: [],
        filterUserActivityLogItems: [],
        topNumber: 10,
        bottomNumber: 10,
        isDateFilterChange: false,
        topInteraction: 12
    })


    const onChangeShowNumber = (countNumber: number, isBottomSites: boolean) => {
        if (isBottomSites) {
            setState((prevState) => ({ ...prevState, bottomNumber: countNumber }))
        } else {
            setState((prevState) => ({ ...prevState, topNumber: countNumber }))
        }

    }

    const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
        setState((prevState: any) => ({ ...prevState, toggleKeyUpdate: Math.random() }));


    };


    const onClickLeftNavigation = (key: string, tooltip: string) => {
        setState((prevState) => ({ ...prevState, selectedMenu: { key: key, DisplayName: tooltip }, keyUpdate: Math.random() }));
    }


    const onClickSubMenu = (subMenu: any, mainMenu: any) => {
        setState((prevState: any) => ({
            ...prevState,
            selectedMenu: { key: subMenu.key, DisplayName: subMenu.tooltip }
        }))

    }


    const toggleSubmenu = (menuKey: string) => {
        setOpenSubmenus(prev => ({
            ...prev,
            [menuKey]: !prev[menuKey]
        }));
    };

    const menuItems = [
        {
            label: "Dashboard",
            tooltip: "Dashboard",
            icon: faHome,
            key: LoadCombineStateReportEnum.Dashboard
        },
        {
            label: "Combined State",
            tooltip: "Combined Portal Usage By State",
            icon: faChartBar,
            key: LoadCombineStateReportEnum.CombineStateReport
        },
        {
            label: "Top 10 Site",
            tooltip: "Top 10 Site",
            icon: faCircleArrowUp,
            key: LoadCombineStateReportEnum.TopTenSite
        },
        {
            label: "Bottom 10 Site",
            tooltip: "Bottom 10 Site",
            icon: faCircleArrowDown,
            key: LoadCombineStateReportEnum.BottomTenSite
        },
        {
            label: "Summary Report",
            tooltip: "Summary Report",
            icon: faUmbrellaBeach,
            submenuKey: "Summary Report",
            key: LoadCombineStateReportEnum.SummaryReport,
            submenu: [
                { label: "Dashboard", tooltip: "Dashboard", icon: faGaugeHigh, key: LoadCombineStateReportEnum.SubDashboard, },
                { label: "State-Site vs Portal Access", tooltip: "State-Wise Sites VS. Portal Access Rate", icon: faBarsProgress, key: LoadCombineStateReportEnum.StateSitePortalAccess, },
                { label: "Top State By Total Activities", tooltip: "Top State By Total Activities", icon: faCircleArrowUp, key: LoadCombineStateReportEnum.TopStateByTotalActivities, },
                { label: "Site Volume", tooltip: "Site-Wise Activity Volume", icon: faListCheck, key: LoadCombineStateReportEnum.SiteWiseActivityVolume, },
                { label: "Site User vs Accessed Users", tooltip: "Site-Wise Assigned Users VS Accessed Users", icon: faUsersLine, key: LoadCombineStateReportEnum.SiteUserAccessedUsers, },
                { label: "Entity Type Distribution", tooltip: "Entity Type Distribution", icon: faHome, key: LoadCombineStateReportEnum.EntityTypeDistribution, },
                { label: "Active Users Trend Over Time", tooltip: "Active Users Trend Over Time", icon: faClock, key: LoadCombineStateReportEnum.ActiveUsersTrendOverTime, },
                { label: "No/Low and High Usage Site Report", tooltip: "No/Low and High Usage Sites Report", icon: faSquarePollHorizontal, key: LoadCombineStateReportEnum.NoUsageSiteReport, },
                { label: "User-Level Engagement Score", tooltip: "User-Level Engagement Score", icon: faUser, key: LoadCombineStateReportEnum.UserLevelEngagementScore, },
                // { label: "Activity Type Counts Report", tooltip: "Activity Type Counts Report", icon: faChartPie, key: LoadCombineStateReportEnum.ActivityTypeCountsReport, },

            ],
        },
    ];

    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {

        setState((prevState) => ({
            ...prevState,
            selectedSiteIds: siteIds,
            selectedSiteTitles: siteTitles,
            selectedSCSites: siteSC
        }));
    };


    const onStateChange = (stateIds: number[], options?: any) => {

        setState((prevState: any) => ({
            ...prevState,
            selectedStates: (!!options && options.length > 0) ? options.map((r: any) => r.text) : [],
            selectedSiteIds: [],
            selectedStatesId: (!!stateIds && stateIds.length > 0) ? stateIds : [],
            selectedSiteTitles: [],
            selectedSCSites: [],
            selectedActionType: [],
            stateKeyUpdate: Math.random()
        }))
    }



    const onChangeRangeOption = (item: IDropdownOption): void => {
        if ('Custom Range' == item.key) {
            setState((prevState) => ({
                ...prevState,
                selectedItem: item,
                filterFromDate: "",
                filterToDate: "",
                isDateFilterChange: true
                // selectedStates: [],
                // selectedSiteIds: [],
                // selectedStatesId: [],
                // selectedSiteTitles: [],
                // selectedActionType: [],
                // selectedSCSites: [],
                // selectedEntityType: [],
                // allFilterKeyUpdate: Math.random()

            }))
        } else {
            setState((prevState) => ({
                ...prevState, selectedItem: item,
                isDateFilterChange: true
                // selectedStates: [],
                // selectedSiteIds: [],
                // selectedStatesId: [],
                // selectedSiteTitles: [],
                // selectedActionType: [],
                // selectedEntityType: [],
                // selectedSCSites: [],
                // allFilterKeyUpdate: Math.random()
            }))
        }

    };

    const onChangeToDate = (filterDate: any, date?: Date) => {
        setState((prevState) => ({ ...prevState, filterToDate: filterDate, toDate: date, }));
    };

    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setState((prevState) => ({ ...prevState, filterFromDate: filterDate, fromDate: date }));
    };


    const onActionTypeChange = (AssetCategoryId: any): void => {
        if (!!AssetCategoryId && AssetCategoryId.length > 0) {
            let value = AssetCategoryId.map((i: any) => i.text);
            setState((prevState: any) => ({ ...prevState, selectedActionType: value }))
        } else {
            setState((prevState: any) => ({ ...prevState, selectedActionType: [] }))
        }

    };

    const onUserActivityLogChange = (AssetTypeMasterId: any): void => {
        if (!!AssetTypeMasterId && AssetTypeMasterId.length > 0) {
            let value = AssetTypeMasterId.map((i: any) => i.value);
            setState((prevState: any) => ({ ...prevState, selectedActivityLogUser: value }))
        } else {
            setState((prevState: any) => ({ ...prevState, selectedActivityLogUser: [] }))
        }


        // setState((prevState: any) => ({ ...prevState, selectedActivityLogUser: AssetTypeMasterId?.value || "" }))
    };

    const onEntityTypeChange = (AssetCategoryId: any): void => {
        if (!!AssetCategoryId && AssetCategoryId.length > 0) {
            let value = AssetCategoryId.map((i: any) => i.text);
            setState((prevState: any) => ({ ...prevState, selectedEntityType: value }))
        } else {
            setState((prevState: any) => ({ ...prevState, selectedEntityType: [] }))
        }

    };

    const onClickTopInteraction = (number: any) => {
        setState((prevState) => ({ ...prevState, topInteraction: number || 12 }))

    }

    const onRenderComponent = () => {
        switch (state.selectedMenu.key) {
            case LoadCombineStateReportEnum.Dashboard:
                return <SystemUsageDashboard
                    onClickTopInteraction={onClickTopInteraction}
                    stateItems={state.filterStateItems || []}
                    siteItems={state.filterSiteItems || []}
                    userActivityLogItems={state.filterUserActivityLogItems || []}
                    topInteraction={state.topInteraction}
                    filterState={state.selectedStates || []}
                    filterSites={state.selectedSiteTitles || []}
                    filterUser={state.selectedActivityLogUser || []}
                    filterEntityType={state.selectedEntityType || []}
                    filterActionType={state.selectedActionType || []}
                    startDate={state.filterFromDate}
                    endDate={state.filterToDate}
                />
                break;
            case LoadCombineStateReportEnum.BottomTenSite:

                return <TopLowSites
                    onChangeShowNumber={onChangeShowNumber}
                    isBottomSites={true}
                    stateItems={state.filterStateItems || []}
                    siteItems={state.filterSiteItems || []}
                    userActivityLogItems={state.filterUserActivityLogItems || []}
                    filterState={state.selectedStates || []}
                    filterSites={state.selectedSiteTitles || []}
                    filterUser={state.selectedActivityLogUser || []}
                    filterEntityType={state.selectedEntityType || []}
                    filterActionType={state.selectedActionType || []}
                    startDate={state.filterFromDate}
                    endDate={state.filterToDate}
                />;
                break;
            case LoadCombineStateReportEnum.CombineStateReport:
                return <CombineStateReport
                    onClickTopInteraction={onClickTopInteraction}
                    topInteraction={state.topInteraction}
                    filterState={state.selectedStates || []}
                    filterSites={state.selectedSiteTitles || []}
                    filterUser={state.selectedActivityLogUser || []}
                    filterEntityType={state.selectedEntityType || []}
                    filterActionType={state.selectedActionType || []}
                    startDate={state.filterFromDate}
                    endDate={state.filterToDate}
                    stateItems={state.filterStateItems || []}
                    siteItems={state.filterSiteItems || []}
                    userActivityLogItems={state.filterUserActivityLogItems || []}
                />;
                break;
            case LoadCombineStateReportEnum.SiteUserAccessedUsers:
                return <SiteUserVsAccessedUser

                    stateItems={state.filterStateItems || []}
                    siteItems={state.filterSiteItems || []}
                    userActivityLogItems={state.filterUserActivityLogItems || []}
                    isExpandDisable={true}
                    filterState={state.selectedStates || []}
                    filterSites={state.selectedSiteTitles || []}
                    filterUser={state.selectedActivityLogUser || []}
                    filterEntityType={state.selectedEntityType || []}
                    filterActionType={state.selectedActionType || []}
                    startDate={state.filterFromDate}
                    endDate={state.filterToDate}
                />;
                break;
            case LoadCombineStateReportEnum.TopTenSite:
                return <TopLowSites
                    onChangeShowNumber={onChangeShowNumber}
                    filterState={state.selectedStates || []}
                    filterSites={state.selectedSiteTitles || []}
                    filterUser={state.selectedActivityLogUser || []}
                    filterEntityType={state.selectedEntityType || []}
                    filterActionType={state.selectedActionType || []}
                    startDate={state.filterFromDate}
                    endDate={state.filterToDate}
                    stateItems={state.filterStateItems || []}
                    siteItems={state.filterSiteItems || []}
                    userActivityLogItems={state.filterUserActivityLogItems || []}
                />;
            case LoadCombineStateReportEnum.EntityTypeDistribution:
                return <EntityTypeDistribution
                    stateItems={state.filterStateItems || []}
                    siteItems={state.filterSiteItems || []}
                    userActivityLogItems={state.filterUserActivityLogItems || []}
                    isExpandDisable={true}
                    filterState={state.selectedStates || []}
                    filterSites={state.selectedSiteTitles || []}
                    filterUser={state.selectedActivityLogUser || []}
                    filterEntityType={state.selectedEntityType || []}
                    filterActionType={state.selectedActionType || []}
                    startDate={state.filterFromDate}
                    endDate={state.filterToDate}

                />;
                break;
            case LoadCombineStateReportEnum.ActiveUsersTrendOverTime:
                return <ActiveUsersTrend
                    stateItems={state.filterStateItems || []}
                    siteItems={state.filterSiteItems || []}
                    userActivityLogItems={state.filterUserActivityLogItems || []}
                    isExpandDisable={true}
                    filterState={state.selectedStates || []}
                    filterSites={state.selectedSiteTitles || []}
                    filterUser={state.selectedActivityLogUser || []}
                    filterEntityType={state.selectedEntityType || []}
                    filterActionType={state.selectedActionType || []}
                    startDate={state.filterFromDate}
                    endDate={state.filterToDate}
                />;
                break;
            case LoadCombineStateReportEnum.NoUsageSiteReport:
                return <LowSiteUsage
                    stateItems={state.filterStateItems || []}
                    siteItems={state.filterSiteItems || []}
                    userActivityLogItems={state.filterUserActivityLogItems || []}
                    isExpandDisable={true}
                    filterState={state.selectedStates || []}
                    filterSites={state.selectedSiteTitles || []}
                    filterUser={state.selectedActivityLogUser || []}
                    filterEntityType={state.selectedEntityType || []}
                    filterActionType={state.selectedActionType || []}
                    startDate={state.filterFromDate}
                    endDate={state.filterToDate}
                />;
                break;

            case LoadCombineStateReportEnum.StateSitePortalAccess:
                return <CombineStateReport
                    excelFileName="State-Site vs Portal Access"
                    topInteraction={state.topInteraction}
                    onClickTopInteraction={onClickTopInteraction}
                    stateItems={state.filterStateItems || []}
                    siteItems={state.filterSiteItems || []}
                    userActivityLogItems={state.filterUserActivityLogItems || []}
                    filterState={state.selectedStates || []}
                    filterSites={state.selectedSiteTitles || []}
                    filterUser={state.selectedActivityLogUser || []}
                    filterEntityType={state.selectedEntityType || []}
                    filterActionType={state.selectedActionType || []}
                    startDate={state.filterFromDate}
                    endDate={state.filterToDate}
                    isExpandDisable={true}
                    isSubMenu={true}
                />;
            case LoadCombineStateReportEnum.SiteWiseActivityVolume:
                return <TopLowSites
                    excelFileName="Site Volume"
                    stateItems={state.filterStateItems || []}
                    siteItems={state.filterSiteItems || []}
                    userActivityLogItems={state.filterUserActivityLogItems || []}
                    filterState={state.selectedStates || []}
                    filterSites={state.selectedSiteTitles || []}
                    filterUser={state.selectedActivityLogUser || []}
                    filterEntityType={state.selectedEntityType || []}
                    filterActionType={state.selectedActionType || []}
                    startDate={state.filterFromDate}
                    endDate={state.filterToDate}
                    isExpandDisable={true}
                    key={Math.random()}

                />;
                break;
            case LoadCombineStateReportEnum.TopStateByTotalActivities:
                return <TopLowSites
                    excelFileName="Top State By Total Activities"
                    stateItems={state.filterStateItems || []}
                    siteItems={state.filterSiteItems || []}
                    userActivityLogItems={state.filterUserActivityLogItems || []}
                    filterState={state.selectedStates || []}
                    filterSites={state.selectedSiteTitles || []}
                    filterUser={state.selectedActivityLogUser || []}
                    filterEntityType={state.selectedEntityType || []}
                    filterActionType={state.selectedActionType || []}
                    startDate={state.filterFromDate}
                    endDate={state.filterToDate}
                    isStateViewOnly={true}
                    isExpandDisable={true}
                />;
                break;
            case LoadCombineStateReportEnum.UserLevelEngagementScore:
                return <UserLevelEngagementScore
                    allUserActivityLogItems={state.userActivityLogItems}
                    // stateItems={state.filterStateItems || []}
                    // siteItems={state.filterSiteItems || []}
                    // userActivityLogItems={state.filterUserActivityLogItems || []}
                    stateItems={state.stateItems || []}
                    siteItems={state.siteItems || []}
                    userActivityLogItems={state.filterUserActivityLogItems || []}
                    filterState={state.selectedStates || []}
                    filterSites={state.selectedSiteTitles || []}
                    filterUser={state.selectedActivityLogUser || []}
                    filterEntityType={state.selectedEntityType || []}
                    filterActionType={state.selectedActionType || []}
                    startDate={state.filterFromDate}
                    endDate={state.filterToDate}

                />;
                break;
            case LoadCombineStateReportEnum.SubDashboard:
                return <SubDashboard
                    stateItems={state.filterStateItems || []}
                    siteItems={state.filterSiteItems || []}
                    userActivityLogItems={state.filterUserActivityLogItems || []}
                    filterState={state.selectedStates || []}
                    filterSites={state.selectedSiteTitles || []}
                    filterUser={state.selectedActivityLogUser || []}
                    filterEntityType={state.selectedEntityType || []}
                    filterActionType={state.selectedActionType || []}
                    startDate={state.filterFromDate}
                    endDate={state.filterToDate}
                    allStateItems={state.stateItems || []}
                    allSiteItems={state.siteItems || []}
                    allUserActivityLogItems={state.userActivityLogItems || []} />;
                break;
            default:
                break;
        }

    }

    const getStateData = async () => {
        let stateItems: IReportState[] = [];
        const camelQuery = new CamlBuilder()
            .View(['ID', 'Title'])
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(5000, true)
            .Query()
        let filterFields: ICamlQueryFilter[] = []
        if (props?.loginUserRoleDetails?.isAdmin === false && props?.loginUserRoleDetails?.isStateManager === true) {
            if (props?.loginUserRoleDetails?.currentUserAllCombineSites && props?.loginUserRoleDetails?.currentUserAllCombineStateId?.length > 0) {
                filterFields.push({
                    fieldName: `ID`,
                    fieldValue: props?.loginUserRoleDetails?.currentUserAllCombineStateId,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.In
                });
            }
        } else if (props?.loginUserRoleDetails?.isShowOnlyChairPerson && props?.loginUserRoleDetails?.whsChairpersonsStateId?.length > 0) {
            filterFields.push({
                fieldName: `ID`,
                fieldValue: props?.loginUserRoleDetails?.whsChairpersonsStateId,
                fieldType: FieldType.Number,
                LogicalType: LogicalType.In
            });

        }

        const siteFilter: any[] = getCAMLQueryFilterExpression(filterFields);
        camelQuery.Where().All(siteFilter);
        let finalQuery = camelQuery.ToString();
        let data = await provider.getItemsByCAMLQuery(ListNames.StateMaster, finalQuery)
        if (!!data && data.length > 0) {
            stateItems = data.map((i: any) => {
                return {
                    Id: mapSingleValue(i.ID, DataType.number),
                    Title: mapSingleValue(i.Title, DataType.string),
                }
            })
        }
        return stateItems;
    }


    const getSiteData = async () => {
        let siteItems: IReportSites[] = [];
        const camelQuery = new CamlBuilder()
            .View(['ID', 'Title', 'QCState', 'SiteManager', 'ADUser', 'SiteSupervisor'])
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(5000, true)
            .Query()
        // .ToString();
        let filterFields: ICamlQueryFilter[] = []
        if (props?.loginUserRoleDetails?.isAdmin === false && props?.loginUserRoleDetails?.isStateManager === true) {
            if (props?.loginUserRoleDetails?.currentUserAllCombineSites && props?.loginUserRoleDetails?.currentUserAllCombineStateId?.length > 0) {
                filterFields.push({
                    fieldName: `QCState`,
                    fieldValue: props?.loginUserRoleDetails?.currentUserAllCombineStateId,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.In
                });
            }
        } else if (props?.loginUserRoleDetails?.isShowOnlyChairPerson && props?.loginUserRoleDetails?.whsChairpersonsStateId?.length > 0) {
            filterFields.push({
                fieldName: `QCState`,
                fieldValue: props?.loginUserRoleDetails?.whsChairpersonsStateId,
                fieldType: FieldType.LookupById,
                LogicalType: LogicalType.In
            });

        }

        const siteFilter: any[] = getCAMLQueryFilterExpression(filterFields);
        camelQuery.Where().All(siteFilter);
        let finalQuery = camelQuery.ToString();
        let data = await provider.getItemsByCAMLQuery(ListNames.SitesMaster, finalQuery)
        if (!!data && data.length > 0) {
            siteItems = data.map((i: any) => {
                // let adUser = !!i.ADUser ? i.ADUser.length : 0;
                // let siteManager = !!i.SiteManager ? i.SiteManager.length : 0;
                // let siteSupervisor = !!i.SiteSupervisor ? i.SiteSupervisor.length : 0;
                const adUserId = mapSingleValue(i.ADUser, DataType.peopleIdMuilt);
                const siteManagerId = mapSingleValue(i.SiteManager, DataType.peopleIdMuilt);
                const siteSupervisorId = mapSingleValue(i.SiteSupervisor, DataType.peopleIdMuilt);
                let allUsers: number[] = [...adUserId, ...siteManagerId, ...siteSupervisorId];
                const uniqueUsersId = allUsers.filter((num, index, arr) => arr.indexOf(num) === index);
                const totalCount = uniqueUsersId?.length || 0
                return {
                    Id: mapSingleValue(i.ID, DataType.number),
                    Title: mapSingleValue(i.Title, DataType.string),
                    StateName: mapSingleValue(i.QCState, DataType.lookupValue),
                    StateId: mapSingleValue(i.QCState, DataType.lookupId),
                    totalUserCount: totalCount,
                    uniqueUsersId: uniqueUsersId
                }
            })
        }
        return siteItems;
    }


    const getUserActivityLog = async () => {
        try {

            let userActivityLogItems: IReportUserActivityLog[] = []
            const filterFieldsSite: ICamlQueryFilter[] = [];

            const filterFields: ICamlQueryFilter[] = [
                {
                    fieldName: "IsActive",
                    fieldValue: true,
                    fieldType: FieldType.Boolean,
                    LogicalType: LogicalType.EqualTo
                },
                // {
                //     fieldName: "LogFor",
                //     fieldValue: "Quaysafe Dashboard",
                //     fieldType: FieldType.Text,
                //     LogicalType: LogicalType.NotEqualTo
                // },

                {
                    fieldName: "LogFor",
                    fieldValue: [UserActionLogFor.ClientDashboard, UserActionLogFor.Both],
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.In
                }


                // {
                //     fieldName: "StateName",
                //     fieldValue: "",
                //     fieldType: FieldType.Text,
                //     LogicalType: LogicalType.IsNotNull
                // },
            ];

            if (state.filterFromDate && state.filterToDate) {
                const dateField = "Created";
                filterFields.push({
                    fieldName: `${dateField}`,
                    fieldValue: `${state.filterFromDate}`,
                    // fieldValue: `${new Date(new Date(`${state.filterFromDate}T00:00:00`).toUTCString()).toISOString()}`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.GreaterThanOrEqualTo
                });
                filterFields.push({
                    fieldName: `${dateField}`,
                    fieldValue: `${state.filterToDate}`,
                    // fieldValue: `${new Date(new Date(`${state.filterToDate}T23:59:59`).toUTCString()).toISOString()}`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.LessThanOrEqualTo
                })
            } else {
                const endDate = moment().format('YYYY-MM-DD'); // Today's date
                const startDate = moment().subtract(29, 'days').format('YYYY-MM-DD'); // 30 days ago
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
                    fieldValue: `${endDate}`,
                    // fieldValue: `${new Date(new Date(`${endDate}T23:59:59`).toUTCString()).toISOString()}`,
                    fieldType: FieldType.DateTime,
                    LogicalType: LogicalType.LessThanOrEqualTo
                })
            }

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
            // if ((props.loginUserRoleDetails.isAdmin == false && props.loginUserRoleDetails.isStateManager == false && props.loginUserRoleDetails.isSiteManager == false && props.loginUserRoleDetails.isSiteSupervisor == false && props.loginUserRoleDetails.isUser == false) && (props.loginUserRoleDetails.isWHSChairperson == true)) {
            if ((props.loginUserRoleDetails.isShowOnlyChairPerson == true)) {
                filterFieldsSite.push({
                    fieldName: `StateNameValue`,
                    fieldValue: props?.loginUserRoleDetails?.whsChairpersonTitle,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.In
                });

            }

            const camlQuery = new CamlBuilder()
                .View(["ID", "Title", "UserName", "SiteName", "StateName", "IsDeletedSite", "State", "SiteNameCategory", "ActionType", "EntityType", "EntityId", "EntityName", "Details", "Created", "Modified", "Email", "Author", 'StateNameValue'])
                // .LeftJoin('SiteName', 'SiteName').Select('Category', "SiteNameCategory")
                .LeftJoin("SiteName", "SiteName").Select('Category', "SiteNameCategory").Select("IsDeletedSite", "IsDeletedSite").Select('StateNameValue', 'StateNameValue')
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query();
            const siteFilter: any[] = getCAMLQueryFilterExpression([...filterFieldsSite, ...filterFields]);
            camlQuery.Where().All(siteFilter);
            let finalQuery = camlQuery.ToString();
            const pnpQueryOptions: IPnPCAMLQueryOptions = {
                listName: ListNames.UserActivityLog,
                queryXML: finalQuery,
                pageToken: "",
                pageLength: 100000,
                overrideParameters: { SortField: "ID", SortDir: "Desc" }
            }

            const localResponse = await provider.getItemsInBatchByCAMLQuery(pnpQueryOptions);
            let results = localResponse?.Row;

            if (!!results && results.length > 0) {
                results = results.filter((i: any) => i.IsDeletedSite != "1");
                userActivityLogItems = results.map((data: any) => {
                    return (
                        {
                            ID: mapSingleValue(data.ID, DataType.number),
                            SiteNameId: mapSingleValue(data.SiteName, DataType.lookupId),
                            SiteName: mapSingleValue(data.SiteName, DataType.lookupValue),
                            State: mapSingleValue(data.StateName, DataType.string, "Unknown State"),
                            UserName: mapSingleValue(data.UserName, DataType.string),
                            ActionType: mapSingleValue(data.ActionType, DataType.string),
                            EntityType: mapSingleValue(data.EntityType, DataType.string),
                            EntityId: mapSingleValue(data.EntityId, DataType.string),
                            EntityName: mapSingleValue(data.EntityName, DataType.string),
                            Details: mapSingleValue(data.Details, DataType.string),
                            AuthorId: mapSingleValue(data.Author, DataType.peopleId),
                            AuthorEmail: mapSingleValue(data.Author, DataType.peopleEmail),
                            Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
                            OrgCreated: !!data.Created ? data.Created : "",
                            OrgModified: !!data.Modified ? data.Modified : "",
                            Modified: !!data.Modified ? moment(data.Modified).format(DateTimeFormate) : "",
                            SiteNameCategory: mapSingleValue(data.SiteNameCategory, DataType.string),
                        }
                    );
                });
            }
            return userActivityLogItems;


        } catch (ex) {
            console.log(ex);
            setState((prevState: any) => ({ ...prevState, isLoading: false }))
            const errorObj = { ErrorMethodName: "getUserActivityLog", CustomErrormessage: "error in get _data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            return []

        }
    };

    const getFilteredLogs = (state: any, userActivityLogItems: any[], stateItems: any[], siteItems: any[]) => {
        try {
            let filterUserActivityLogItems: IReportUserActivityLog[] = userActivityLogItems || [];
            let filterStateItems: IReportState[] = stateItems || [];
            let filterSitesItems: any[] = siteItems || [];

            // 🔹 Filter by selected states
            if (state.selectedStates?.length > 0) {
                filterUserActivityLogItems = filterUserActivityLogItems.filter(
                    (i) => !!i.State && state.selectedStates.includes(i.State)
                );
                filterStateItems = filterStateItems.filter((i) => state.selectedStates.includes(i.Title));
                if (filterSitesItems?.length > 0) {
                    filterSitesItems = filterSitesItems.filter((i) => state.selectedStates.includes(i.StateName));
                }
            }

            // 🔹 Filter by selected sites
            if (state.selectedSiteIds?.length > 0) {
                filterUserActivityLogItems = filterUserActivityLogItems.filter(
                    (i) => !!i.SiteNameId && state.selectedSiteIds.includes(i.SiteNameId)
                );
                if (filterSitesItems?.length > 0) {
                    filterSitesItems = filterSitesItems.filter((i) => state.selectedSiteIds.includes(i.Id));
                }
            }

            // 🔹 Filter by entity type
            if (state.selectedEntityType?.length > 0) {
                filterUserActivityLogItems = filterUserActivityLogItems.filter(
                    (i) => !!i.SiteNameId && state.selectedEntityType.includes(i.EntityType)
                );
            }

            // 🔹 Filter by action type
            if (state.selectedActionType?.length > 0) {
                filterUserActivityLogItems = filterUserActivityLogItems.filter(
                    (i) => !!i.SiteNameId && state.selectedActionType.includes(i.ActionType)
                );
            }

            // 🔹 Filter by user
            if (state.selectedActivityLogUser?.length > 0) {
                filterUserActivityLogItems = filterUserActivityLogItems.filter(
                    (i) => state.selectedActivityLogUser.includes(i.UserName)
                );
            }

            return {
                filterStateItems,
                filterUserActivityLogItems,
                filterSiteItems: filterSitesItems,
            };
        } catch (error) {
            console.error(error);
            return {
                filterStateItems: [],
                filterUserActivityLogItems: [],
                filterSiteItems: [],
            };
        }
    };



    React.useEffect(() => {
        if (didMount.current) {
            try {
                const { filterStateItems, filterUserActivityLogItems, filterSiteItems } = getFilteredLogs(state, state.userActivityLogItems, state.stateItems, state.siteItems);

                setState((prevState: any) => ({ ...prevState, filterStateItems: filterStateItems, filterUserActivityLogItems: filterUserActivityLogItems, filterSiteItems: filterSiteItems, keyUpdate: Math.random() }))

            } catch (error) {
                console.log(error);

            }
        } else {
            didMount.current = true;
        }
    }, [state.selectedSiteIds, state.selectedStates, state.selectedEntityType, state.selectedActivityLogUser, state.selectedActionType])

    React.useMemo(() => {
        if (!!state.filterToDate && !!state.filterFromDate && state.isDateFilterChange)
            // if (!!state.filterToDate && !!state.filterFromDate)
            (async () => {
                try {

                    setState((prevState: any) => ({ ...prevState, isLoading: true }));

                    const [userActivityLogItems] = await Promise.all([getUserActivityLog()]);
                    const { filterStateItems, filterUserActivityLogItems, filterSiteItems } = getFilteredLogs(state, userActivityLogItems, state.stateItems, state.siteItems);
                    setState((prevState: any) => ({
                        ...prevState, isLoading: false,
                        userActivityLogItems,
                        filterStateItems: filterStateItems,
                        filterSiteItems: filterSiteItems,
                        filterUserActivityLogItems: filterUserActivityLogItems,
                        keyUpdate: Math.random(),
                        // selectedActivityLogUser: [],
                        // selectedActionType: [],
                        // selectedStates: [],
                        // selectedSiteIds: [],
                        // selectedStatesId: [],
                        // selectedSiteTitles: [],
                        // selectedSCSites: [],
                        // stateKeyUpdate: Math.random()
                    }))

                } catch (error) {
                    setState((prevState: any) => ({ ...prevState, isLoading: false }));
                    console.log(error);
                }
            })();
        // }, [state.filterToDate, state.filterFromDate, state.selectedSiteIds, state.selectedEntityType, state.selectedActivityLogUser, state.selectedActionType]);
    }, [state.filterToDate, state.filterFromDate]);

    React.useEffect(() => {
        (async () => {
            try {
                setState((prevState: any) => ({ ...prevState, isLoading: true }));
                const [stateItems, siteItems, userActivityLogItems] = await Promise.all([getStateData(), getSiteData(), getUserActivityLog()]);
                setState((prevState: any) => ({ ...prevState, isLoading: false, stateItems, siteItems, userActivityLogItems, filterSiteItems: siteItems, filterStateItems: stateItems, filterUserActivityLogItems: userActivityLogItems, keyUpdate: Math.random() }))
            } catch (error) {
                setState((prevState: any) => ({ ...prevState, isLoading: false }));
                console.log(error);
            }
        })();
    }, []);

    return {
        onRenderComponent,
        state,
        isCollapsed,
        toggleSidebar,
        openSubmenus,
        menuItems,
        toggleSubmenu,
        onClickLeftNavigation,
        onStateChange,
        handleSiteChange,
        onChangeFromDate,
        onChangeToDate,
        onChangeRangeOption,
        onUserActivityLogChange,
        onEntityTypeChange,
        onActionTypeChange,
        onClickSubMenu
    }

}