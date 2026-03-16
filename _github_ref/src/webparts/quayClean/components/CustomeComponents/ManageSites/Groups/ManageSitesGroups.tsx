import React from "react"
import NoRecordFound from "../../../CommonComponents/NoRecordFound"
import { ManageSitesGroupsData } from "./ManageSitesGroupsData"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { Link, TooltipHost } from "@fluentui/react";
import { Loader } from "../../../CommonComponents/Loader";
import { ISitesMasterGroups } from "../IMangeSites";
import { MultipleSiteFilter } from "../../../../../../Common/Filter/MultipleSiteFilter";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { MultiStateFilter } from "../../../../../../Common/Filter/MultiStateFilter";
import { IQuayCleanState } from "../../../QuayClean";

export interface IManageSitesGroupsProps {
    manageComponentView(componentProp: IQuayCleanState): any;

}

export const ManageSitesGroups = (props: IManageSitesGroupsProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail } = appGlobalState;
    const { state, handlePagination, onClickSort, handleSiteChange, onStateChange, onClickRow } = ManageSitesGroupsData(props);


    const renderData = (data: ISitesMasterGroups[]) => {
        return (
            <div>
                <div className={"inspection-margin-top-20"}>

                    <div className={window.innerWidth > 768 ? "pag-jce-top-dflex" : "pag-jce-top"} style={{ justifyContent: "space-between" }}>
                        <div className="dflex">
                            <div style={{ minWidth: "350px", paddingLeft: "17px", }}>
                                <MultipleSiteFilter
                                    isPermissionFiter={true}
                                    loginUserRoleDetails={currentUserRoleDetail}
                                    selectedSiteIds={state.selectedSiteIds || []}
                                    onSiteChange={handleSiteChange}
                                    provider={provider}
                                    isRequired={true}
                                    isClearable={true}
                                />

                            </div>
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
                        </div>
                        {!!state.filterData && state.filterData?.length > 0 ? <div style={{ display: "flex", height: "max-content" }}>
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
                            <div className="cell2 header-cell clsWidthScore cursorPointer"
                                onClick={() => onClickSort("SiteManagerCount")}
                            >
                                <span> Site Managers</span>
                                {state.sortColumnName == "SiteManagerCount" ? (
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
                            <div className="cell2 header-cell clsWidthScore cursorPointer"
                                onClick={() => onClickSort("SiteSupervisorCount")}
                            >
                                <span> Site Supervisors</span>
                                {state.sortColumnName == "SiteSupervisorCount" ? (
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
                            <div className="cell2 header-cell clsWidthscore2 cursorPointer"
                                onClick={() => onClickSort("ADUserCount")}
                            >
                                <span> Client</span>
                                {state.sortColumnName == "ADUserCount" ? (
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
                    {data.map((items: ISitesMasterGroups) => (
                        <div key={items.Id} className="cardHeader-Action2" style={{ cursor: "pointer" }}
                            onClick={() => onClickRow(items)}
                        >

                            <div key={items.Id} className="container22"
                            >
                                <div className="row2">
                                    <div className="w600 cell2">
                                        <h3 className=" ptop-5">
                                            {items.Title} <span>({items.QCState.value})</span>
                                        </h3>
                                        <div className=" info2">
                                            <div className="date-and-name">
                                                <span style={{ whiteSpace: 'pre-line' }}>
                                                    {items.Category}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="cell2 clsDocWidth"> {items.SiteManagerCount > 0 ? <div className="cursorPointer primaryColor" >
                                        <Link className="primaryColor">
                                            <div className={`${items.SiteManagerCount > 0 ? 'countBadge' : ""}`}>{items.SiteManagerCount}</div>
                                        </Link></div > : <div className="cursorPointer primaryColor"> 0</div>}</div>
                                    <div className="cell2 clsDocWidth">{items.SiteSupervisorCount > 0 ? <div className="cursorPointer primaryColor" >
                                        <Link className="primaryColor">
                                            <div className={`${items.SiteSupervisorCount > 0 ? 'countBadge' : ""}`}>{items.SiteSupervisorCount}</div>
                                        </Link></div > : <div className="cursorPointer primaryColor"> 0</div>}</div>
                                    <div className="cell2 percentage clsWidth">{items.ADUserCount > 0 ? <div className="cursorPointer primaryColor" >
                                        <Link className="primaryColor">
                                            <div className={`${items.ADUserCount > 0 ? 'countBadge' : ""}`}>{items.ADUserCount}</div>
                                        </Link></div > : <div className="cursorPointer primaryColor"> 0</div>}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {data.length == 0 && <NoRecordFound />}
                </div>
            </div>
        );
    };

    return <div>
        <div className="mt-10  manageSite">
            {state.isLoading && <Loader />}
            <div className="ms-Grid-row  ">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12  ">
                    <div className='card-box-new mb30 '>
                        <div className="ms-Grid-row justify-content-start">
                            <div className="ms-Grid-row justify-content-start">
                                <div id="" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dialog-grid inspection-mt-10">
                                    <>
                                        {!!state.pageItems &&
                                            renderData(state.pageItems)}
                                    </>
                                </div>
                            </div>
                        </div>
                    </div>
                    {!!state.filterData && state.filterData?.length > 0 ?
                        <div style={{ display: "flex", justifyContent: "end", paddingRight: "7px" }}>
                            <div  >
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
            </div>
        </div>
    </div>

}