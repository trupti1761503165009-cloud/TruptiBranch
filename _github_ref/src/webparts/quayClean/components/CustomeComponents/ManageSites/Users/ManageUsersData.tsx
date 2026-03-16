import React from "react";
import { IManageUsersProps } from "./ManageUsers";
import CamlBuilder from "camljs";
import { useAtomValue } from "jotai";
import { PivotItem } from "office-ui-fabric-react";
import { DataType } from "../../../../../../Common/Constants/CommonConstants";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { _copyAndSortNew, getCAMLQueryFilterExpression, mapSingleValue } from "../../../../../../Common/Util";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { IReactDropOptionProps } from "../../../CommonComponents/reactSelect/IReactDropOptionProps";
import { IUsers, IUserGridData, ISitesMaster, IUserActivityLog } from "../IMangeSites";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../../Common/Constants/DocumentConstants";

export interface IManageUsersState {
    userData: IUsers[];
    filterUserGridData: IUserGridData[]
    siteData: ISitesMaster[];
    expandedUsers: ExpandedType;
    userGridData: IUserGridData[];
    siteMasterData: ISitesMaster[];
    userActivityLogData: IUserActivityLog[];
    isLoading: boolean;
    currentPageNumber: number;
    pagedItems: IUserGridData[];
    selectedSitesIDS: number[];
    selectedUserType: any;
    userTypeOptions: IReactDropOptionProps[];
    userNameOptions: IReactDropOptionProps[];
    selectedUserNames: number[];
    currentPage: number;
    itemsPerPage: number;
    startedIndex: any;
    endedIndex: any;
    sortColumnName: string;
    isSort: boolean;
}
type ExpandedType = { [key: string]: boolean };

export const ManageUsersData = (props: IManageUsersProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail } = appGlobalState;
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

    const toggleUser = (users: string) => {
        setState((prevState) => ({ ...prevState, expandedUsers: { ...prevState.expandedUsers, [users]: !prevState.expandedUsers[users] } }))
    };



    const onClickPagedItems = (data: any[], count: any) => {
        setState((prevState) => ({ ...prevState, pagedItems: data, currentPageNumber: count.page }));
    }

    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setState((prevState) => ({ ...prevState, selectedSitesIDS: siteIds }))
    };

    const onClickRow = (item: any) => {
        props.manageComponentView({ currentComponentName: ComponentNameEnum.ManageUserDetails, manageSiteUserItem: item })

    }

    const onChangeUserType = (data: IReactDropOptionProps) => {
        if (data) {
            setState((prevState) => ({ ...prevState, selectedUserType: data.value }));
        } else {
            setState((prevState) => ({ ...prevState, selectedUserType: "" }));

        }
    }
    const onChangeUserName = (data: IReactDropOptionProps[]) => {
        if (!!data && data.length > 0) {
            setState((prevState: any) => ({ ...prevState, selectedUserNames: data.map((i) => i.value) }));
        } else {
            setState((prevState: any) => ({ ...prevState, selectedUserNames: [] }));
        }

    }

    const getCurrentSiteUser = async () => {
        let users: IUsers[] = [];
        let userData = await provider.getSiteUsers();
        if (!!userData && userData.length > 0) {
            users = userData.map((i: any) => {
                return {
                    isGuestUser: i.LoginName.includes("#ext#"),
                    id: i.Id,
                    title: i.Title,
                    email: i.Email,
                    imageURL: mapSingleValue(i.Email, DataType.userImage, null, 0, context),
                    loginName: i.LoginName,
                    isSiteAdmin: i.IsSiteAdmin
                }

            })
        }
        return users;
    }

    const getSiteMaster = async () => {
        let siteData: ISitesMaster[] = [];
        const camlQuery = new CamlBuilder()
            .View(["ID", "Title", "HelpDeskType", "QCState", "JobCode", "SiteSupervisor", "SiteManager", "ADUser", "Category", "SCSiteId"])
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(5000, true)
            .Query()
        let filterFields: ICamlQueryFilter[] = [];

        if (currentUserRoleDetail.isAdmin == false && currentUserRoleDetail.isStateManager && !!currentUserRoleDetail.stateManagerSitesItemIds && currentUserRoleDetail.stateManagerSitesItemIds.length > 0) {
            filterFields.push({
                fieldName: "ID",
                fieldValue: currentUserRoleDetail.stateManagerSitesItemIds,
                fieldType: FieldType.Number,
                LogicalType: LogicalType.In
            })
        }
        if (currentUserRoleDetail.isShowOnlyChairPerson && currentUserRoleDetail.whsChairpersonsStateId.length > 0) {
            filterFields.push({
                fieldName: `QCState`,
                fieldValue: currentUserRoleDetail.whsChairpersonsStateId,
                fieldType: FieldType.LookupById,
                LogicalType: LogicalType.In
            });
        }

        if (filterFields.length > 0) {
            const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
            camlQuery.Where().All(categoriesExpressions);
        }

        let data = await provider.getItemsByCAMLQuery(ListNames.SitesMaster, camlQuery.ToString());
        if (!!data && data.length > 0) {
            siteData = data.map((i) => {
                return {
                    HelpDeskType: mapSingleValue(i.HelpDeskType, DataType.lookup),
                    QCState: mapSingleValue(i.QCState, DataType.lookup),
                    JobCode: mapSingleValue(i.JobCode, DataType.string),
                    SiteSupervisor: mapSingleValue(i.SiteSupervisor, DataType.peoplePickerMultiple, null, 0, context),
                    SiteSupervisorId: mapSingleValue(i.SiteSupervisor, DataType.peopleIdMuilt),
                    SiteManager: mapSingleValue(i.SiteManager, DataType.peoplePickerMultiple, null, 0, context),
                    SiteManagerId: mapSingleValue(i.SiteManager, DataType.peopleIdMuilt,),
                    ADUser: mapSingleValue(i.ADUser, DataType.peoplePickerMultiple, null, 0, context),
                    ADUserId: mapSingleValue(i.ADUser, DataType.peopleIdMuilt),
                    Category: mapSingleValue(i.Category, DataType.string),
                    Id: mapSingleValue(i.ID, DataType.number),
                    Title: mapSingleValue(i.Title, DataType.string)
                }
            })
        }
        return siteData

    }


    const humanReadableDiff = (date: Date) => {
        const now = new Date();
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

    const getUserActivityLogData = async () => {
        let userLogData: IUserActivityLog[] = [];
        const camlQuery = new CamlBuilder()
            .View(["ID", "Title", "EntityType", "ActionType", 'IsDeletedSite', 'StateNameValue', "Created", "Author", "Modified", "State", "SiteName", "EntityId", "Count", "Email", "Details", "EntityName", "UserName", "IsActive"])
            .LeftJoin("SiteName", "SiteName").Select("IsDeletedSite", "IsDeletedSite").Select("StateNameValue", 'StateNameValue')
            .Scope(CamlBuilder.ViewScope.RecursiveAll)

            .RowLimit(5000, true)
            .Query()
        // .ToString()
        const filterFields: ICamlQueryFilter[] = []

        if ((currentUserRoleDetail.isShowOnlyChairPerson && currentUserRoleDetail.whsChairpersonsStateId.length > 0)) {
            filterFields.push({
                fieldName: `StateNameValue`,
                fieldValue: currentUserRoleDetail.whsChairpersonTitle,
                fieldType: FieldType.Text,
                LogicalType: LogicalType.In
            });

        }
        const siteFilter: any[] = getCAMLQueryFilterExpression(filterFields);
        camlQuery.Where().All(siteFilter);
        let finalQuery = camlQuery.ToString();
        let data = await provider.getItemsByCAMLQuery(ListNames.UserActivityLog, finalQuery, { SortField: "ID", SortDir: "Desc" });
        if (!!data && data.length > 0) {
            data = data.filter((i: any) => i.IsDeletedSite != "1");
            userLogData = data.map((i) => {
                return {
                    EntityType: mapSingleValue(i.EntityType, DataType.string),
                    ActionType: mapSingleValue(i.ActionType, DataType.string),
                    State: mapSingleValue(i.State, DataType.lookup),
                    SiteName: mapSingleValue(i.SiteName, DataType.lookup),
                    Count: mapSingleValue(i.Count, DataType.number),
                    EntityId: mapSingleValue(i.EntityId, DataType.number),
                    Email: mapSingleValue(i.Email, DataType.string),
                    Details: mapSingleValue(i.Details, DataType.string),
                    EntityName: mapSingleValue(i.EntityName, DataType.string),
                    UserName: mapSingleValue(i.UserName, DataType.string),
                    IsActive: mapSingleValue(i.IsActive, DataType.YesNoTrue),
                    Title: mapSingleValue(i.Title, DataType.string),
                    Id: mapSingleValue(i.ID, DataType.number),
                    Created: mapSingleValue(i.Created, DataType.DateTime, ""),
                    OrgCreated: !!i.Created ? i.Created : "",
                    OrgModified: !!i.Modified ? i.Modified : "",
                    Modified: mapSingleValue(i.Modified, DataType.DateTime, ""),
                    CreatedBy: mapSingleValue(i.Author, DataType.peoplePicker)
                }
            })
        }
        return userLogData;

    }

    const onClickSort = (text: any) => {

        if (state.sortColumnName == text) {
            let sortedData = _copyAndSortNew(state.filterUserGridData, text, !state.isSort)
            setState((prevState: IManageUsersState) => ({ ...prevState, sortColumnName: text, filterUserGridData: sortedData, currentPage: 1, isSort: !state.isSort, startedIndex: 0, endedIndex: prevState.itemsPerPage }));
        } else {
            let sortedData = _copyAndSortNew(state.filterUserGridData, text, false)
            setState((prevState: IManageUsersState) => ({ ...prevState, sortColumnName: text, filterUserGridData: sortedData, currentPage: 1, isSort: false, startedIndex: 0, endedIndex: prevState.itemsPerPage }));

        }

    };

    const handlePagination = (newPage: any) => {
        const totalPages = Math.ceil(state.filterUserGridData?.length / state.itemsPerPage);
        if (newPage < 1) {
            newPage = 1;
        } else if (newPage > totalPages) {
            newPage = totalPages;
        }

        const startIndex = (newPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage > state.filterUserGridData?.length ? state.filterUserGridData?.length : startIndex + state.itemsPerPage;

        setState((prevState) => ({ ...prevState, currentPage: newPage, startedIndex: startIndex, endedIndex: endIndex, pagedItems: prevState.filterUserGridData?.slice(startIndex, endIndex) }))
    };

    React.useEffect(() => {
        handlePagination(1);
    }, [state.filterUserGridData]);


    React.useEffect(() => {
        try {
            let filterUserData: IUsers[] = state.userData;
            let userActivityLogData: IUserActivityLog[] = state.userActivityLogData;
            let filterSiteData: ISitesMaster[] = state.siteData;
            if (!!state.selectedUserNames && state.selectedUserNames.length > 0) {
                filterUserData = filterUserData.filter((i) => state.selectedUserNames.indexOf(i.id) > -1)
            }

            if (!!state.selectedUserType) {
                filterUserData = filterUserData.filter((i) => i.isGuestUser == (state.selectedUserType == "Guest"));
            }

            if (!!state.selectedSitesIDS && state.selectedSitesIDS.length > 0) {
                filterSiteData = state.siteData.filter((i) => state.selectedSitesIDS.indexOf(i.Id) > -1)
            }
            let loginData = userActivityLogData;
            let userGridData: IUserGridData[] = [];
            if (filterUserData.length > 0) {
                userGridData = filterUserData.map((user) => {
                    let lastActivityDate: any = ""
                    let currentUserLog = loginData.find((i) => i.CreatedBy.Id == user.id);
                    let orgLastActivityDate: any = "";
                    if (!!currentUserLog) {
                        orgLastActivityDate = !!currentUserLog.OrgModified ? currentUserLog.OrgModified : ""
                        lastActivityDate = !!currentUserLog.OrgModified ? humanReadableDiff(new Date(currentUserLog.OrgModified)) : ""
                    }
                    let associatedSitesCount: number = 0;
                    let associatedSites: any[] = [];
                    if (filterSiteData.length > 0) {
                        let items = filterSiteData.filter((sites) => ((sites.ADUserId.indexOf(user.id) > -1) || (sites.SiteManagerId.indexOf(user.id) > -1) || (sites.SiteSupervisorId.indexOf(user.id) > -1)));
                        let addUserLogSites = items.map((i) => {
                            let filterCurretSitelog = userActivityLogData.find((log) => log.EntityType == UserActionEntityTypeEnum.Site && log.SiteName.Id == i.Id && log.CreatedBy.Id == user.id);
                            let logDate = ""
                            let OrgSitesModified = ""
                            if (!!filterCurretSitelog) {
                                OrgSitesModified = !!filterCurretSitelog.OrgModified ? filterCurretSitelog.OrgModified : "";
                                logDate = !!filterCurretSitelog.OrgModified ? humanReadableDiff(new Date(filterCurretSitelog.OrgModified)) : ""
                            }
                            return {
                                ...i,
                                lastLogDate: logDate,
                                OrgSitesModified: OrgSitesModified

                            }
                        })
                        associatedSites = addUserLogSites;
                        associatedSitesCount = items.length
                    }

                    return {
                        ...user,
                        associatedSitesCount: associatedSitesCount,
                        associatedSites: associatedSites,
                        lastActivityDate: lastActivityDate,
                        orgLastActivityDate: orgLastActivityDate
                    }
                })
            }
            userGridData = _copyAndSortNew(userGridData, "orgLastActivityDate", true);
            setState((prevState: any) => ({ ...prevState, filterUserGridData: userGridData, expandedUsers: {} }))
        } catch (error) {
            console.log(error);
        }
    }, [state.selectedUserType, state.selectedSitesIDS, state.selectedUserNames])



    React.useEffect(() => {
        (async () => {
            try {
                setState((prevState) => ({ ...prevState, isLoading: true }))
                const [userData, siteData, userActivityLogData] = await Promise.all([getCurrentSiteUser(), getSiteMaster(), getUserActivityLogData()]);
                // let loginData = userActivityLogData.filter(item => item.ActionType === "Login");
                let loginData = userActivityLogData
                let userNameOptions: IReactDropOptionProps[] = [];
                let userGridData: IUserGridData[] = [];
                if (userData.length > 0) {
                    userGridData = userData.map((user) => {
                        userNameOptions.push({ value: user.id, label: user.title });
                        let lastActivityDate: any = ""
                        let orgLastActivityDate: any = "";
                        let currentUserLog = loginData.find((i) => i.CreatedBy.Id == user.id);
                        if (!!currentUserLog) {
                            orgLastActivityDate = !!currentUserLog.OrgModified ? currentUserLog.OrgModified : ""
                            lastActivityDate = !!currentUserLog.OrgModified ? humanReadableDiff(new Date(currentUserLog.OrgModified)) : ""
                        }
                        let associatedSitesCount: number = 0;
                        let associatedSites: any[] = [];
                        if (siteData.length > 0) {
                            let items = siteData.filter((sites) => ((sites.ADUserId.indexOf(user.id) > -1) || (sites.SiteManagerId.indexOf(user.id) > -1) || (sites.SiteSupervisorId.indexOf(user.id) > -1)));
                            let addUserLogSites = items.map((i) => {
                                let filterCurretSitelog = userActivityLogData.find((log) => log.EntityType == UserActionEntityTypeEnum.Site && log.SiteName.Id == i.Id && log.CreatedBy.Id == user.id);
                                let logDate = "";
                                let OrgSitesModified = "";
                                if (!!filterCurretSitelog) {
                                    OrgSitesModified = !!filterCurretSitelog.OrgModified ? filterCurretSitelog.OrgModified : "";
                                    logDate = !!filterCurretSitelog.OrgModified ? humanReadableDiff(new Date(filterCurretSitelog.OrgModified)) : ""
                                }
                                return {
                                    ...i,
                                    lastLogDate: logDate,
                                    OrgSitesModified: OrgSitesModified
                                }
                            })
                            associatedSites = addUserLogSites;
                            associatedSitesCount = items.length
                        }

                        return {
                            ...user,
                            associatedSitesCount: associatedSitesCount,
                            associatedSites: associatedSites,
                            lastActivityDate: lastActivityDate,
                            orgLastActivityDate: orgLastActivityDate

                        }
                    })
                }
                const UserTypeOptions: IReactDropOptionProps[] = [
                    { label: "Guest", value: "Guest" },
                    { label: "Live", value: "Live" }
                ]

                if (currentUserRoleDetail.isAdmin == false && currentUserRoleDetail.isStateManager) {
                    userGridData = userGridData.filter((i) => i.associatedSitesCount > 0)
                }
                userGridData = _copyAndSortNew(userGridData, "orgLastActivityDate", true);

                setState((prevState) => ({ ...prevState, userNameOptions: userNameOptions, userActivityLogData: userActivityLogData, userTypeOptions: UserTypeOptions, userData: userData, userGridData: userGridData, filterUserGridData: userGridData, isLoading: false, siteData: siteData }));
            } catch (error) {
                setState((prevState) => ({ ...prevState, isLoading: false }))
                console.log("ManageSitesData" + error);

            }
        })()
    }, [])

    return {
        state,
        toggleUser,
        onClickPagedItems,
        handleSiteChange,
        onChangeUserType,
        onChangeUserName,
        onClickSort,
        handlePagination,
        onClickRow
    }

}