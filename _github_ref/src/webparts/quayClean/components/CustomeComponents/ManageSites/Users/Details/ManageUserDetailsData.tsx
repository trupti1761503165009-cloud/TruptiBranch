import React from "react";
import { IManageUserDetailsProps } from "./ManageUserDetails";
import { ISitesMaster } from "../../IMangeSites";
import { _copyAndSortNew } from "../../../../../../../Common/Util";
export interface IManageUserDetailsDataState {
    currentPage: number;
    itemsPerPage: number;
    startedIndex: any;
    endedIndex: any;
    sortColumnName: string;
    isSort: boolean;
    pagedItems: ISitesMaster[];
    filterData: ISitesMaster[];
    allData: ISitesMaster[];
    selectedStates: number[];
}
export const ManageUserDetailsData = (props: IManageUserDetailsProps) => {
    const scrollTopRef = React.useRef<null | HTMLDivElement>(null);
    const [state, setState] = React.useState<IManageUserDetailsDataState>({
        currentPage: 1,
        itemsPerPage: 50,
        startedIndex: null,
        endedIndex: null,
        sortColumnName: "",
        isSort: false,
        pagedItems: [],
        filterData: [],
        allData: [],
        selectedStates: []
    })

    const handlePagination = (newPage: any) => {
        const totalPages = Math.ceil(state.filterData?.length / state.itemsPerPage);
        if (newPage < 1) {
            newPage = 1;
        } else if (newPage > totalPages) {
            newPage = totalPages;
        }

        const startIndex = (newPage - 1) * state.itemsPerPage;
        const endIndex = startIndex + state.itemsPerPage > state.filterData?.length ? state.filterData?.length : startIndex + state.itemsPerPage;

        setState((prevState) => ({ ...prevState, currentPage: newPage, startedIndex: startIndex, endedIndex: endIndex, pagedItems: prevState.filterData?.slice(startIndex, endIndex) }))
    };


    const onClickSort = (text: any) => {

        if (state.sortColumnName == text) {
            let sortedData = _copyAndSortNew(state.filterData, text, !state.isSort)
            setState((prevState: IManageUserDetailsDataState) => ({ ...prevState, sortColumnName: text, filterData: sortedData, currentPage: 1, isSort: !state.isSort, startedIndex: 0, endedIndex: prevState.itemsPerPage }));
        } else {
            let sortedData = _copyAndSortNew(state.filterData, text, false)
            setState((prevState: IManageUserDetailsDataState) => ({ ...prevState, sortColumnName: text, filterData: sortedData, currentPage: 1, isSort: false, startedIndex: 0, endedIndex: prevState.itemsPerPage }));

        }

    };

    const onStateChange = (stateIds: number[], options?: any) => {
        setState((prevState: any) => ({ ...prevState, selectedStates: ((!!stateIds && stateIds.length > 0) ? stateIds : []) }));
    }

    React.useEffect(() => {
        handlePagination(1);
    }, [state.filterData]);

    React.useEffect(() => {
        let allData = state.allData;
        let filterData: any[] = [];
        if (!!state.selectedStates && state.selectedStates.length > 0) {
            filterData = allData.filter((i) => state.selectedStates.indexOf(i.QCState.Id) > -1)

        } else {
            filterData = allData;
        }
        setState((prevState) => ({ ...prevState, filterData: filterData }))
    }, [state.selectedStates])

    React.useEffect(() => {
        if (!!props.data && props.data.associatedSites && props.data.associatedSites.length > 0) {
            let siteData = _copyAndSortNew(props.data.associatedSites, "OrgSitesModified", true);
            setTimeout(() => {
                scrollTopRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 200);
            setState((prevState: any) => ({ ...prevState, allData: siteData, filterData: siteData }))
        }

    }, [props.data])

    return {
        state,
        handlePagination,
        onClickSort,
        onStateChange, scrollTopRef
    }

}