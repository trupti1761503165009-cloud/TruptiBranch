import React from "react";
import { IManageSitesGroupsProps } from "./ManageSitesGroups";
import { _copyAndSort, getCAMLQueryFilterExpression, mapSingleValue } from "../../../../../../Common/Util";
import CamlBuilder from "camljs";
import { ISitesMasterGroups } from "../IMangeSites";
import { DataType } from "../../../../../../Common/Constants/CommonConstants";
import { ComponentNameEnum, ListNames } from "../../../../../../Common/Enum/ComponentNameEnum";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../../Common/Constants/DocumentConstants";

export interface IManageSitesGroupsDataState {
    isLoading: boolean;
    isCon: boolean;
    pageItems: ISitesMasterGroups[];
    isSort: boolean;
    AllData: ISitesMasterGroups[];
    filterData: ISitesMasterGroups[];
    currentPage: number;
    itemsPerPage: number;
    startedIndex: any;
    endedIndex: any;
    sortColumnName: string;
    selectedSiteIds: number[];
    selectedStates: number[];

}

export const ManageSitesGroupsData = (props: IManageSitesGroupsProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail } = appGlobalState;

    const [state, setState] = React.useState<IManageSitesGroupsDataState>({
        isLoading: false,
        pageItems: [],
        isCon: true,
        isSort: false,
        AllData: [],
        currentPage: 1,
        itemsPerPage: 50,
        startedIndex: null,
        filterData: [],
        endedIndex: null,
        sortColumnName: "",
        selectedSiteIds: [],
        selectedStates: []

    });

    const getSiteMaster = async () => {
        let siteData: ISitesMasterGroups[] = [];
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


        let data = await provider.getItemsByCAMLQuery(ListNames.SitesMaster, camlQuery.ToString(), { SortField: "Modified", SortDir: "Desc" });
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
                    Title: mapSingleValue(i.Title, DataType.string),
                    SiteManagerCount: !!i.SiteManager ? i.SiteManager.length : 0,
                    SiteSupervisorCount: !!i.SiteSupervisor ? i.SiteSupervisor.length : 0,
                    ADUserCount: !!i.ADUser ? i.ADUser.length : 0,
                }
            })
        }
        return siteData

    }

    const handleSiteChange = (Ids: any[], siteTitles: string[], siteSC: string[]) => {
        setState((prevState: any) => ({ ...prevState, selectedSiteIds: ((!!Ids && Ids.length > 0) ? Ids : []) }));

    }

    const onStateChange = (stateIds: number[], options?: any) => {
        setState((prevState: any) => ({ ...prevState, selectedStates: ((!!stateIds && stateIds.length > 0) ? stateIds : []) }));
    }

    const onClickSort = (text: any) => {

        if (state.sortColumnName == text) {
            let sortedData = _copyAndSort(state.filterData, text, !state.isSort)
            setState((prevState: IManageSitesGroupsDataState) => ({ ...prevState, sortColumnName: text, filterData: sortedData, currentPage: 1, isSort: !state.isSort, startedIndex: 0, endedIndex: prevState.itemsPerPage }));
        } else {
            let sortedData = _copyAndSort(state.filterData, text, false)
            setState((prevState: IManageSitesGroupsDataState) => ({ ...prevState, sortColumnName: text, filterData: sortedData, currentPage: 1, isSort: false, startedIndex: 0, endedIndex: prevState.itemsPerPage }));

        }

    };

    const onClickRow = (items: ISitesMasterGroups) => {
        props.manageComponentView({ currentComponentName: ComponentNameEnum.ManageSitesCrud, originalSiteMasterId: items.Id, isGroupViewPage: true });

    }

    const handlePagination = (newPage: any) => {
        const totalPages = Math.ceil(state.filterData?.length / state.itemsPerPage);
        if (newPage < 1) {
            newPage = 1;
        } else if (newPage > totalPages) {
            newPage = totalPages;
        }

        const startIndex = (newPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage > state.filterData?.length ? state.filterData?.length : startIndex + state.itemsPerPage;

        setState((prevState) => ({ ...prevState, currentPage: newPage, startedIndex: startIndex, endedIndex: endIndex, pageItems: prevState.filterData?.slice(startIndex, endIndex) }))
    };

    React.useEffect(() => {
        handlePagination(1);
    }, [state.filterData]);

    React.useEffect(() => {
        let allData = state.AllData;
        let filterData: any[] = [];
        if (!!state.selectedSiteIds && state.selectedSiteIds.length > 0) {
            filterData = allData.filter((i) => state.selectedSiteIds.indexOf(i.Id) > -1)
            // setState((prevState) => ({ ...prevState, filterData: filterData }))

        } else {
            filterData = allData;
        }
        if (!!state.selectedStates && state.selectedStates.length > 0) {
            filterData = filterData.filter((i) => state.selectedStates.indexOf(i.QCState.Id) > -1)

        } else {
            // eslint-disable-next-line no-self-assign
            filterData = filterData;
        }
        setState((prevState) => ({ ...prevState, filterData: filterData }))
    }, [state.selectedSiteIds, state.selectedStates])


    React.useEffect(() => {
        (async () => {
            try {
                setState((prevState) => ({ ...prevState, isLoading: true }))
                const [siteMaserData] = await Promise.all([getSiteMaster()]);

                setState((prevState: IManageSitesGroupsDataState) => ({ ...prevState, isLoading: false, AllData: siteMaserData, filterData: siteMaserData }));
            } catch (error) {
                setState((prevState) => ({ ...prevState, isLoading: false }))
                console.log("ManageSitesData" + error);
            }
        })()
    }, [])

    return {
        state,
        handlePagination,
        handleSiteChange,
        onClickSort,
        onStateChange,
        onClickRow
    }

}