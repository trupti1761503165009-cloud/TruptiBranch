import React from "react";
import { Link, TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DashboardIssueListData } from "./DashboardIssueListData";
import { MemoizedDetailList } from "../../../../../../Common/DetailsList";
import { Loader } from "../../../CommonComponents/Loader";
import { IssueListCardView } from "../../QRClientResponse/IssuesList/IssueListCardView";
import CRAttachmentDialog from "../../QRClientResponse/IssuesList/CRAttachmentDialog";
import { CRReassignModal } from "../../QRClientResponse/IssuesList/CRReassignModal";
import { CRResolveModal } from "../../QRClientResponse/IssuesList/CRResolveModal";
export const DashboardIssueList = (props: any) => {

    const {
        provider,
        context,
        currentUserRoleDetail,
        isLoading,
        currentView,
        state,
        tooltipId,
        columns,
        onclickExportToExcel,
        _onItemSelected,
        handleViewChange,
        onClickView,
        setState,
        onClickAttachment,
        onClickReassignIssue,
        onClickResolveIssue

    } = DashboardIssueListData(props);

    return (

        <div>
            {isLoading && <Loader />}

            <div className="boxCard-grid">
                <div className="formGroup" style={{ width: "100%" }}>
                    {(currentView === "grid" && window.innerWidth > 768) ? <>

                        <MemoizedDetailList
                            columns={columns || []}
                            items={state.filteredClientResponseData || []}
                            reRenderComponent={true}
                            onSelectedItem={_onItemSelected}
                            searchable={true}
                            addEDButton={<>
                            </>}
                            isAddNew={true}
                            addNewContent={
                                <>
                                    <div className="dflex">
                                        {state.filteredClientResponseData?.length > 0 && <Link className="actionBtn iconSize btnEdit ml-10" style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}>
                                            <TooltipHost content={"Export to excel"} id={tooltipId} >
                                                <FontAwesomeIcon icon={"file-excel"} />
                                            </TooltipHost>
                                        </Link>}

                                        <div className="grid-list-view">
                                            <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`}
                                                onClick={() => handleViewChange("grid")}>
                                                <TooltipHost content={"List View"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="list" />
                                                </TooltipHost>
                                            </Link>
                                            <Link
                                                className={`grid-list-btn ${currentView !== "grid" ? "active" : ""}`}
                                                onClick={() => {
                                                    handleViewChange("card");
                                                }}>
                                                <TooltipHost content={"Card View"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="th" />
                                                </TooltipHost>
                                            </Link>
                                        </div>

                                    </div>
                                </>
                            } />
                    </> :
                        <div className="">
                            <div className="hazard-header-bar">
                                <div className="dflex btn-back-ml">

                                    {state.filteredClientResponseData?.length > 0 && <Link className="actionBtn iconSize btnEdit ml-10" style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}>
                                        <TooltipHost content={"Export to excel"} id={tooltipId} >
                                            <FontAwesomeIcon icon={"file-excel"} />
                                        </TooltipHost>
                                    </Link>}

                                    {!(window.innerWidth <= 768) && <div className="grid-list-view">
                                        <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`}
                                            onClick={() => handleViewChange("grid")}>
                                            <TooltipHost content={"List View"} id={tooltipId}>
                                                <FontAwesomeIcon icon="list" />
                                            </TooltipHost>
                                        </Link>
                                        <Link
                                            className={`grid-list-btn ${currentView !== "grid" ? "active" : ""}`}
                                            onClick={() => {
                                                handleViewChange("card");
                                            }}>
                                            <TooltipHost content={"Card View"} id={tooltipId}>
                                                <FontAwesomeIcon icon="th" />
                                            </TooltipHost>
                                        </Link>
                                    </div>}

                                </div>
                            </div>

                            <div className="hazard-cardview-container">
                                <IssueListCardView
                                    items={state.filteredClientResponseData}
                                    isTabView={false}
                                    isChartView={true}
                                    manageComponentView={props.manageComponentView}
                                    _onclickView={(data) => { onClickView(data) }}
                                    _onclickAttachment={(data) => { onClickAttachment(data) }}
                                    _onclickResolved={(data) => { onClickResolveIssue(data) }}
                                    _onclickReAssigned={(data) => { onClickReassignIssue(data) }}
                                />
                            </div>
                        </div>
                    }
                </div>
            </div>

            {state.isAttachmentModalOpen && <CRAttachmentDialog
                isOpen={state.isAttachmentModalOpen}
                onClose={() => {
                    setState((prev: any) => ({
                        ...prev,
                        isAttachmentModalOpen: false,
                        selectedIssueItem: undefined
                    }));
                }}
                selectedItem={state.selectedIssueItem}

            />}
            {state.isResolveModalOpen && (
                <CRResolveModal
                    isOpen={state.isResolveModalOpen}
                    issueItem={state.selectedIssueItem}
                    context={context}
                    provider={provider}
                    currentUserRoleDetail={currentUserRoleDetail}
                    onClose={(isRefresh) => {
                        setState(prev => ({
                            ...prev,
                            isResolveModalOpen: false,
                            selectedIssueItem: null
                        }));
                        if (isRefresh) {
                            props.onItemUpdated();
                        }
                    }
                    }
                />
            )}
            {state.isReassignOpen && (
                <CRReassignModal
                    isOpen={state.isReassignOpen}
                    selectedItem={state.selectedIssueItem}
                    provider={provider}
                    siteInfo={props.componentProps?.dataObj}
                    currentUserRoleDetail={currentUserRoleDetail}
                    context={context}
                    onClose={(isRefresh) => {
                        setState(prev => ({
                            ...prev,
                            isReassignOpen: false,
                            selectedIssueItem: null,
                        }));
                        if (isRefresh) {
                            props.onItemUpdated();
                        }
                    }}
                />
            )}

        </div>
    )
}