import React from "react"
import { IQuayCleanState } from "../../../../QuayClean";
import { UserPersonaById } from "../../../../CommonComponents/UserPersonaById";
import { ISitesMaster, IUserGridData } from "../../IMangeSites";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../../jotai/appGlobalStateAtom";
import { ManageUserDetailsData } from "./ManageUserDetailsData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoRecordFound from "../../../../CommonComponents/NoRecordFound";
import { PrintTypeName } from "../../../../../../../Common/Constants/CommonConstants";
import { PrimaryButton } from "@fluentui/react";
import { ComponentNameEnum } from "../../../../../../../Common/Enum/ComponentNameEnum";
import { MultiStateFilter } from "../../../../../../../Common/Filter/MultiStateFilter";

export interface IManageUserDetailsProps {
    data: IUserGridData;
    manageComponentView(componentProp: IQuayCleanState): any;

}

export const ManageUserDetails = (props: IManageUserDetailsProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail } = appGlobalState;

    const { state, handlePagination, onClickSort, onStateChange, scrollTopRef } = ManageUserDetailsData(props);

    const renderData = (data: ISitesMaster[]) => {
        return (
            <div>
                <div className={"inspection-margin-top-20"}>

                    <div className={window.innerWidth > 768 ? "pag-jce-top-dflex" : "pag-jce-top"} style={{ justifyContent: "space-between" }}>
                        <div className="dflex">
                            <div style={{ minWidth: "350px", paddingLeft: "17px", }}>
                                <MultiStateFilter
                                    loginUserRoleDetails={currentUserRoleDetail}
                                    selectedState={state.selectedStates || []}
                                    onStateChange={onStateChange}
                                    provider={provider}
                                    isRequired={true}
                                    isClearable={true}
                                />

                            </div>
                            &nbsp;
                        </div>
                        {!!state.filterData && state.filterData?.length > 0 ? <div>
                            <div className="record-info Count-inspection">
                                {`Showing ${state.currentPage === 1 ? 1 : (state.currentPage - 1) * state.itemsPerPage + 1} to ${Math.min(state.currentPage * state.itemsPerPage, state.filterData?.length)} of ${state.filterData?.length} records`}
                            </div>
                            <button className="pag-btn inspection-btn"
                                onClick={() => handlePagination(state.currentPage - 1)}
                                disabled={state.currentPage === 1}
                            >
                                Prev
                            </button>
                            <span className="pag-page-lbl">{` Page ${state.currentPage} `}</span>
                            <button className="pag-btn"
                                onClick={() => handlePagination(state.currentPage + 1)}
                                disabled={state.currentPage === Math.ceil(state.filterData?.length / state.itemsPerPage)}
                            >
                                Next
                            </button>
                        </div> : <>&nbsp;</>}
                    </div>
                </ div >
                <div
                    className={`${window.innerWidth > 768 ? "card-Action-New" : "mobile-card-Action-New"} `}
                >
                    <div className="header-2 inspection-stick-header ">
                        <div className="row2">
                            <div className="cell2 header-cell clsHighWidthHeader cursorPointer w600"
                                onClick={() => onClickSort("Title")}
                            >
                                <span>Site Name</span>
                                {state.sortColumnName == "Title" ? (
                                    <>
                                        {state.isSort ? (
                                            <FontAwesomeIcon icon="sort-up" className="ml5" />
                                        ) : (
                                            <FontAwesomeIcon icon="sort-down" className="ml5" />

                                        )}
                                    </>
                                ) : (
                                    <FontAwesomeIcon icon="sort" className="ml5 sort-clr" />
                                )}
                            </div>
                            <div className="cell2 header-cell clsWidthScore "

                            >
                                <span>
                                    Site Manager</span>

                            </div>
                            <div className="cell2 header-cell clsWidthScore "

                            >
                                <span>Site Supervisor</span>

                            </div>
                            <div className="cell2 header-cell clsWidthscore2 "

                            >
                                <span> Client</span>

                            </div>
                            <div className="cell2 header-cell clsWidthscore2 cursorPointer"
                                onClick={() => onClickSort("lastLogDate")}
                            >
                                <span> Last Activity Date</span>
                                {state.sortColumnName == "lastLogDate" ? (
                                    <>
                                        {state.isSort ? (
                                            <FontAwesomeIcon icon="sort-up" className="ml5" />
                                        ) : (
                                            <FontAwesomeIcon icon="sort-down" className="ml5" />

                                        )}
                                    </>
                                ) : (
                                    <FontAwesomeIcon icon="sort" className="ml5 sort-clr" />
                                )}
                            </div>
                        </div>
                    </div>
                    {data.map((items: ISitesMaster) => (
                        <div key={items.Id} className="cardHeader-Action2"
                        // onClick={() => onClickRow(items)}
                        >
                            <div key={items.Id} className="container22" >
                                <div className="row2">
                                    <div className="cell2 w600">
                                        <h3 className=" ptop-5">
                                            {`${items.Title} (${items.QCState.value})`}
                                        </h3>
                                        <div className=" info2">

                                            <div className="date-and-name">
                                                <span style={{ whiteSpace: 'pre-line' }}>
                                                    {items.Category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cell2 percentage clsWidth">
                                        {(!!items.SiteManagerId && items.SiteManagerId.length > 0) ? (items.SiteManagerId.indexOf(props.data.id) > -1 ?
                                            <div className="actionBtn btnGreen dticon" >
                                                <FontAwesomeIcon icon="check" />
                                            </div> : "") : ""}
                                    </div>
                                    <div className="cell2 percentage clsWidth">
                                        {(!!items.SiteSupervisorId && items.SiteSupervisorId.length > 0) ? (items.SiteSupervisorId.indexOf(props.data.id) > -1 ?
                                            <div className="actionBtn btnGreen dticon" >
                                                <FontAwesomeIcon icon="check" />
                                            </div> : "") : ""}
                                    </div>
                                    <div className="cell2 percentage clsWidth">
                                        {(!!items.ADUserId && items.ADUserId.length > 0) ? (items.ADUserId.indexOf(props.data.id) > -1 ?
                                            <div className="actionBtn btnGreen dticon" >
                                                <FontAwesomeIcon icon="check" />
                                            </div> : "") : ""}
                                    </div>
                                    <div className="cell2 percentage clsWidth">
                                        {items.lastLogDate}
                                    </div>

                                </div>
                            </div>
                        </div>
                    ))}
                    {data.length == 0 && <NoRecordFound />}
                </div>
            </div>
        );
    };


    return <div className="boxCard manageSite" ref={scrollTopRef}>
        <div className="ms-Grid" >
            <div className="ms-Grid-row mt-10 ">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                    <PrimaryButton className="btn btn-danger justifyright floatright mb5" style={{ marginRight: "0px" }} onClick={() => {
                        props.manageComponentView({ currentComponentName: ComponentNameEnum.ManageSites, selectedKey: "User" });
                    }} text="Back" />
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                    <div className="manageSiteheader ">
                        {(!!props.data.id && props.data.id > 0) ? < UserPersonaById context={context}
                            AuthorId={props.data.id}
                            provider={provider}
                        /> : <>&nbsp;</>}

                    </div>

                </div>
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                    <div className='card-box-new mb30 '>
                        <div className="ms-Grid-row justify-content-start">
                            <div className="ms-Grid-row justify-content-start">
                                <div id="" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dialog-grid inspection-mt-10">
                                    <>
                                        {!!state.pagedItems &&
                                            renderData(state.pagedItems)}
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                    {!!state.filterData && state.filterData?.length > 0 ?
                        <div style={{ display: "flex", justifyContent: "end", paddingRight: "7px" }}>
                            <div >
                                <div className="record-info Count-inspection">
                                    {`Showing ${state.currentPage === 1 ? 1 : (state.currentPage - 1) * state.itemsPerPage + 1} to ${Math.min(state.currentPage * state.itemsPerPage, state.filterData?.length)} of ${state.filterData?.length} records`}
                                </div>
                                <button className="pag-btn inspection-btn"
                                    onClick={() => handlePagination(state.currentPage - 1)}
                                    disabled={state.currentPage === 1}
                                >
                                    Prev
                                </button>
                                <span className="pag-page-lbl">{` Page ${state.currentPage} `}</span>
                                <button className="pag-btn"
                                    onClick={() => handlePagination(state.currentPage + 1)}
                                    disabled={state.currentPage === Math.ceil(state.filterData?.length / state.itemsPerPage)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                        : <>&nbsp;</>}
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 mt-10">
                    <PrimaryButton className="btn btn-danger justifyright floatright mb5" onClick={() => {
                        props.manageComponentView({ currentComponentName: ComponentNameEnum.ManageSites, selectedKey: "User" });
                    }} text="Back" />
                </div>
            </div>
        </div>
    </div>

}
