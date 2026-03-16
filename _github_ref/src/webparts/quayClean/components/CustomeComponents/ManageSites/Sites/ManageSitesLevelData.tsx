/* eslint-disable  */
import React from "react";
import { IManageSitesLevelProps } from "./ManageSitesLevel";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import CamlBuilder from "camljs";
import { ComponentNameEnum, ListNames } from "../../../../../../Common/Enum/ComponentNameEnum";
import { getCAMLQueryFilterExpression, mapSingleValue } from "../../../../../../Common/Util";
import { DataType } from "../../../../../../Common/Constants/CommonConstants";
import { IReactDropOptionProps } from "../../../CommonComponents/reactSelect/IReactDropOptionProps";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../../Common/Constants/DocumentConstants";

export interface IManageSitesLevelDataState {
    isLoading: boolean;
    AllData: any[];
    siteItems: any[];
    groupedData: any[];
    selectedSiteIds: number[];
    selectedStates: number[];
    selectedCategory: number[];
    categoryOptions: IReactDropOptionProps[];
    keyUpdate: number;

}

export const ManageSitesLevelData = (props: IManageSitesLevelProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail } = appGlobalState;

    const [state, setState] = React.useState<IManageSitesLevelDataState>({
        isLoading: false,
        AllData: [],
        siteItems: [],
        groupedData: [],
        selectedSiteIds: [],
        selectedStates: [],
        categoryOptions: [],
        selectedCategory: [],
        keyUpdate: Math.random()
    });


    const getSiteMaster = async () => {
        let siteData: any[] = [];
        const camlQuery = new CamlBuilder()
            .View(["ID", "Title", "HelpDeskType", "QCState", "JobCode", "SiteSupervisor", "SiteManager", "ADUser", "Category", "SCSiteId"])
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(5000, true)
            .Query()
        // .ToString()
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
                    QCState: mapSingleValue(i.QCState, DataType.lookup, "Unknown"),
                    QCStateTitle: mapSingleValue(i.QCState, DataType.lookupValue, "Unknown"),
                    JobCode: mapSingleValue(i.JobCode, DataType.string),
                    SiteSupervisor: mapSingleValue(i.SiteSupervisor, DataType.peoplePickerMultiple, null, 0, context),
                    SiteSupervisorId: mapSingleValue(i.SiteSupervisor, DataType.peopleIdMuilt),
                    SiteManager: mapSingleValue(i.SiteManager, DataType.peoplePickerMultiple, null, 0, context),
                    SiteManagerId: mapSingleValue(i.SiteManager, DataType.peopleIdMuilt,),
                    ADUser: mapSingleValue(i.ADUser, DataType.peoplePickerMultiple, null, 0, context),
                    ADUserId: mapSingleValue(i.ADUser, DataType.peopleIdMuilt),
                    // Category: mapSingleValue(i.Category, DataType.string, "Unknown"),
                    Category: !!i.Category ? i.Category : "Unknown",
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

    const groupByMultipleColumns = (data: any, ...columns: any) => {
        if (columns.length === 0) return data;

        const [firstColumn, ...restColumns] = columns;

        return data.reduce((acc: any, item: any) => {
            const key = item[firstColumn];
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {});
    }


    const deepGroupBy = (data: any, columns: any) => {
        if (columns.length === 0) return data;

        const [first, ...rest] = columns;
        const grouped = groupByMultipleColumns(data, first);

        // Apply next-level grouping recursively
        for (const key in grouped) {
            grouped[key] = deepGroupBy(grouped[key], rest);
        }

        return grouped;
    }

    const buildHierarchy = (data: any) => {
        const countryLabel = "Australia";
        const regionGroups = deepGroupBy(data, ['QCStateTitle', 'Category']);

        const regionChildren = Object.entries(regionGroups).map(([QCStateTitle, Category]) => {
            const areaChildren = Object.entries(Category as any).map(([Category, entries]) => {

                const siteChildren = (entries as any).map((entry: any) => ({
                    label: entry?.Title, // Replace with actual site name key if you have it
                    site: "Site",
                    // members: `${entry?.SiteManagerCount}(M) | ${entry?.SiteSupervisorCount}(S) | ${entry?.ADUserCount}(C)`
                    members: entry?.SiteManagerCount + entry?.SiteSupervisorCount + entry?.ADUserCount,
                    item: entry
                }));

                return {
                    label: `${Category}`,
                    site: "Area",
                    members: `${siteChildren.length} `, // Adjust as needed
                    children: siteChildren,
                };
            });

            return {
                label: QCStateTitle,
                site: "Region",
                members: `${areaChildren.length}`, // You can make this more accurate
                children: areaChildren,
            };
        });

        return [
            {
                label: countryLabel,
                site: "State",
                members: `${regionChildren.length}`,
                children: regionChildren,
                defaultExpanded: true
            },
        ];
    }


    const onStateChange = (stateIds: number[], options?: any) => {
        setState((prevState: any) => ({ ...prevState, selectedSiteIds: [], selectedStates: ((!!stateIds && stateIds.length > 0) ? stateIds : []), keyUpdate: Math.random() }));
    }
    const handleSiteChange = (Ids: any[], siteTitles: string[], siteSC: string[]) => {
        setState((prevState: any) => ({ ...prevState, selectedSiteIds: ((!!Ids && Ids.length > 0) ? Ids : []) }));

    }

    const onChangeCategory = (data: IReactDropOptionProps[]) => {
        setState((prevState: any) => ({ ...prevState, selectedCategory: (!!data && data.length > 0) ? data.map(i => i.value) : [] }));
    }

    const onClickRow = (item?: any) => {
        props.manageComponentView(({ currentComponentName: ComponentNameEnum.ManageSitesCrud, originalSiteMasterId: item?.item?.Id, isGroupViewPage: false }))


    }

    React.useEffect(() => {
        let filterData = state.AllData;
        if (state.selectedSiteIds.length > 0) {
            filterData = filterData.filter((i) => state.selectedSiteIds.indexOf(i.Id) > -1);

        }
        if (state.selectedStates.length > 0) {
            filterData = filterData.filter((i) => state.selectedStates.indexOf(i.QCState.Id) > -1);
        }
        if (state.selectedCategory.length > 0) {
            filterData = filterData.filter((i) => state.selectedCategory.indexOf(i.Category) > -1);
        }

        const grouped = buildHierarchy(filterData);

        setState((prevState: any) => ({ ...prevState, groupedData: grouped }))



    }, [state.selectedCategory, state.selectedSiteIds, state.selectedStates])


    React.useEffect(() => {
        (async () => {
            try {
                setState((prevState: any) => ({ ...prevState, isLoading: true }));
                const [siteItems] = await Promise.all([getSiteMaster()]);
                const grouped = buildHierarchy(siteItems);
                let categoryDataOptions: IReactDropOptionProps[] = [];
                if (siteItems.length > 0) {

                    let uniqueCategory: any = siteItems.map((i) => i.Category);
                    let filterOptions: any = []
                    if (uniqueCategory && uniqueCategory.length > 0) {
                        filterOptions = Array.from(new Set(uniqueCategory));
                    }
                    if (filterOptions.length > 0) {
                        categoryDataOptions = filterOptions.map((i: any) => {
                            return { value: i, label: i }
                        })
                    }
                }
                setState((prevState: any) => ({ ...prevState, categoryOptions: categoryDataOptions, groupedData: grouped, isLoading: false, siteItems: siteItems, AllData: siteItems }));
            } catch (error) {
                setState((prevState: any) => ({ ...prevState, isLoading: false }));
                console.log("ManageSitesLevelData useEffect" + error);

            }
        })();

    }, [])

    return {
        state,
        handleSiteChange,
        onStateChange,
        onChangeCategory,
        onClickRow
    }

}