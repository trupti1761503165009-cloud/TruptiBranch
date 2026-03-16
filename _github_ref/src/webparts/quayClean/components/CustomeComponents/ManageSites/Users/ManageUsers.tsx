import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { ManageUsersData } from "./ManageUsersData";
import { Loader } from "../../../CommonComponents/Loader";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Pivot, PivotItem, PersonaSize, Link } from "office-ui-fabric-react";
import { CustomPagination } from "../../../../../../Common/CustomPagination";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { UserPersonaById } from "../../../CommonComponents/UserPersonaById";
import { IUserGridData } from "../IMangeSites";
import { IQuayCleanState } from "../../../QuayClean";
import { UserPersonaByEmail } from "../../../UserPersonaByEmail";

export interface IManageUsersProps {
    manageComponentView(componentProp: IQuayCleanState): any;
}

export const ManageUsers = (props: IManageUsersProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail } = appGlobalState;
    const { state, onChangeUserType, onChangeUserName, onClickSort, handlePagination, onClickRow } = ManageUsersData(props)

    const renderData = (data: IUserGridData[]) => {
        return (
            <div>
                <div className={"inspection-margin-top-20"}>

                    <div className={window.innerWidth > 768 ? "pag-jce-top-dflex" : "pag-jce-top"}
                        style={{ justifyContent: "space-between" }}
                    >
                        <div className="dflex">
                            <div style={{ minWidth: "350px", paddingLeft: "17px" }}>
                                <ReactDropdown
                                    options={state.userTypeOptions || []}
                                    onChange={onChangeUserType}
                                    placeholder="Select User Type"
                                    isClearable={true}
                                    defaultOption={state.selectedUserType || ""}
                                    isMultiSelect={false} />

                            </div>
                            <div style={{ minWidth: "350px", paddingLeft: "17px" }}>
                                <ReactDropdown
                                    options={state.userNameOptions || []}
                                    onChange={onChangeUserName}
                                    placeholder="Select User Name"
                                    isClearable={true}
                                    defaultOption={state.selectedUserNames || []}
                                    isCloseMenuOnSelect={false}
                                    isMultiSelect={true} />

                            </div>
                        </div>
                        {!!state.filterUserGridData && state.filterUserGridData?.length > 0 ? <div>
                            <div className="record-info Count-inspection">
                                {`Showing ${state.currentPage === 1 ? 1 : (state.currentPage - 1) * state.itemsPerPage + 1} to ${Math.min(state.currentPage * state.itemsPerPage, state.filterUserGridData?.length)} of ${state.filterUserGridData?.length} records`}
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
                                disabled={state.currentPage === Math.ceil(state.filterUserGridData?.length / state.itemsPerPage)}
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
                            <div className="cell2 header-cell clsHighWidthHeader cursorPointer"
                                onClick={() => onClickSort("title")}
                            >
                                <span>User Details</span>
                                {state.sortColumnName == "title" ? (
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
                                onClick={() => onClickSort("associatedSitesCount")}
                            >
                                <span>
                                    Associated Sites</span>
                                {state.sortColumnName == "associatedSitesCount" ? (
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
                                onClick={() => onClickSort("isGuestUser")}
                            >
                                <span>User Type</span>
                                {state.sortColumnName == "isGuestUser" ? (
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
                                onClick={() => onClickSort("orgLastActivityDate")}
                            >
                                <span> Last Seen</span>
                                {state.sortColumnName == "orgLastActivityDate" ? (
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
                    {data.map((items: IUserGridData) => (
                        <div key={items.id} className="cardHeader-Action2 clsPointer"

                            onClick={() => onClickRow(items)}
                        >
                            {/* <h3 className="ml14">
                                {items.title}
                            </h3> */}
                            <div key={items.id} className="container22"
                            >
                                <div className="row2">
                                    <div className="cell2 info2">
                                        <div style={{ marginLeft: "5px" }}>
                                            <div className="date-and-name">
                                                {/* <span style={{ whiteSpace: 'pre-line' }}>
                                                    {items.email}
                                                </span> */}
                                                <UserPersonaById
                                                    title={items.title}
                                                    email={items.email}
                                                    context={context}
                                                    AuthorId={items.id}
                                                    provider={provider}
                                                    personSize={PersonaSize.size72}
                                                />
                                                {/* <UserPersonaByEmail
                                                    email={items.email}
                                                    title={items.title}
                                                    size={PersonaSize.size24}
                                                    showHoverDetail={true}
                                                /> */}
                                            </div>

                                        </div>
                                    </div>

                                    <div className="cell2 clsDocWidth"> {items.associatedSitesCount > 0 ?
                                        <div className="cursorPointer primaryColor" >
                                            <Link className="primaryColor">
                                                <div className={`${items.associatedSitesCount > 0 ? 'countBadge' : ""}`}>{items.associatedSitesCount}</div>
                                            </Link>
                                        </div > : <div className="cursorPointer primaryColor"> 0</div>}</div>
                                    <div className="cell2 percentage clsWidth">
                                        {items.isGuestUser ? <span className="userBadge userGuest "> Guest</span> : <span className="userBadge userLive" > Live</span>}
                                    </div>
                                    <div className="cell2 percentage clsWidth">
                                        {items.lastActivityDate}
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


    return <div className="">
        {state.isLoading && <Loader />}

        <div className="mt-10 manageSite">
            <div className="ms-Grid-row  ">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12  ">
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
                    {!!state.filterUserGridData && state.filterUserGridData?.length > 0 ?
                        <div style={{ display: "flex", justifyContent: "end", paddingRight: "7px" }}>
                            <div >
                                <div className="record-info Count-inspection">
                                    {`Showing ${state.currentPage === 1 ? 1 : (state.currentPage - 1) * state.itemsPerPage + 1} to ${Math.min(state.currentPage * state.itemsPerPage, state.filterUserGridData?.length)} of ${state.filterUserGridData?.length} records`}
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
                                    disabled={state.currentPage === Math.ceil(state.filterUserGridData?.length / state.itemsPerPage)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                        : <>&nbsp;</>}


                </div>
            </div>

        </div>
    </div >

}