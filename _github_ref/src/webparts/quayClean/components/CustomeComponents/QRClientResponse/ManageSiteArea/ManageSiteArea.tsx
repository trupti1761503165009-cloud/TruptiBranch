import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, TooltipHost } from "office-ui-fabric-react";
import React from "react"
import { MemoizedDetailList } from "../../../../../../Common/DetailsList";
import { _onItemSelected } from "../../../../../../Common/Util";
import { Loader } from "../../../CommonComponents/Loader";
import { ManageSiteAreaData } from "./ManageSiteAreaData";
import { PrimaryButton } from "@fluentui/react";
import { CRPivotEnum } from "../../../../../../Common/Enum/WasteReportEnum";
import { ManageSiteAreaModal } from "./ManageSiteAreaModal";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Messages } from "../../../../../../Common/Constants/Messages";
import { ClientResponsePrintQrCode } from "./ClientResponsePrintQrCode";
import { PrintMultipleQrCode } from "./PrintMultipleQrCode";

export const ManageSiteArea = (props: any) => {
    const {
        provider,
        context,
        currentUserRoleDetail,
        isLoading,
        currentView,
        state,
        SiteAreaListDataRef,
        tooltipId,
        columns,
        selectedRows,
        onclickPrint,
        onclickRefreshGrid,
        onclickExportToExcel,
        _onItemSelected,
        onCloseModal,
        onManageSiteAreaClick,
        onClickConfirmDelete,
        closeDeleteModal,
        oncloseQRModal,
        onMultipleQRClose
    } = ManageSiteAreaData(props);
    return (
        <div>
            {isLoading && <Loader />}
            <div className="boxCardq manageSiteArea">
                <div className="formGroup" style={{ width: "100%", marginTop: "12px" }}>
                    {/* {(currentView === "grid" && window.innerWidth > 768) ?  */}
                    <>
                        <MemoizedDetailList
                            columns={columns || []}
                            items={SiteAreaListDataRef.current || []}
                            reRenderComponent={true}
                            onSelectedItem={_onItemSelected}
                            searchable={true}
                            addEDButton={<>
                            </>}
                            isAddNew={true}
                            addNewContent={
                                <>
                                    <div className="dflex">
                                        {selectedRows?.length > 0 && <PrimaryButton className="ameni-btn btn-primary" onClick={onclickPrint} text="Print" />}

                                        {SiteAreaListDataRef.current?.length > 0 && <Link className="actionBtn iconSize btnEdit ml-10" style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}>
                                            <TooltipHost content={"Export to excel"} id={tooltipId}>
                                                <FontAwesomeIcon icon={"file-excel"} />
                                            </TooltipHost>
                                        </Link>}

                                        <Link className="actionBtn iconSize btnRefresh icon-mr ml-10" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid} text="">
                                            <TooltipHost content={"Refresh Grid"} id={tooltipId}  >
                                                <FontAwesomeIcon icon={"arrows-rotate"} />
                                            </TooltipHost>
                                        </Link>

                                        <PrimaryButton text={CRPivotEnum.ManageSiteArea} className="btn btn-primary ml-10"
                                            onClick={() => { onManageSiteAreaClick() }}
                                        />

                                        {/* {SiteAreaListDataRef.current?.length === 0 && <PrimaryButton text={CRPivotEnum.ManageStaff} className="btn btn-primary  ml-10"
                                            onClick={() => { onManageStaffClick() }}
                                        />} */}

                                        {/* <div className="grid-list-view">
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
                                        </div> */}

                                    </div>
                                </>
                            } />
                    </>
                    {/* :
                        <div className="">
                            <div className="hazard-header-bar">
                                <div className="dflex btn-back-ml">

                                    {props.siteMasterId && <Link className="actionBtn iconSize btnPrimary ml-10" onClick={handleOpenHazardQRModal}>
                                        <TooltipHost content={"Print Hazard QR Code"} >
                                            <FontAwesomeIcon icon="qrcode" />
                                        </TooltipHost>
                                    </Link>}
                                    {props.siteMasterId && <Link className="actionBtn iconSize btnRefresh ml-10" onClick={onClickCopyLink}>
                                        <TooltipHost content={"Copy Link"} >
                                            <FontAwesomeIcon icon="link" />
                                        </TooltipHost>
                                    </Link>}
                                    <Link className="actionBtn iconSize btnEdit ml-10" disabled={state.filteredHazardData?.length == 0 || state.filteredHazardData == undefined} style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                        text="">
                                        <TooltipHost
                                            content={state.filteredHazardData?.length == 0 || state.filteredHazardData == undefined ? "Record not found" : "Export to excel"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon icon={"file-excel"} />
                                        </TooltipHost>
                                    </Link>
                                    <Link className="actionBtn iconSize btnRefresh icon-mr ml-10" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                        text="">
                                        <TooltipHost
                                            content={"Refresh Grid"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon icon={"arrows-rotate"} />
                                        </TooltipHost></Link>

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
                                                // setUpdateItem([]);
                                            }}>
                                            <TooltipHost content={"Card View"} id={tooltipId}>
                                                <FontAwesomeIcon icon="th" />
                                            </TooltipHost>
                                        </Link>
                                    </div>}

                                </div>
                            </div>

                            <div className="hazard-cardview-container">
                                <HazardCardView
                                    items={state.filteredHazardData}
                                    isTabView={false}
                                    viewType={'card'}
                                    manageComponentView={props.manageComponentView}
                                    isEditDelete={true}
                                    _onclickView={(data) => { onClickView(data) }}
                                    _onclickUnarchive={(data) => { onClickUnArchive(data) }}
                                    _onclickSiteUpdate={(data) => { onClickSiteUpdate(data) }}
                                    IMSsiteMasterId={props.siteMasterId || undefined}
                                    _onclickAttachment={(data) => { onClickAttachment(data) }}
                                />
                            </div>
                        </div>
                    } */}
                </div>
                {state.isOpenManageModal &&
                    <ManageSiteAreaModal
                        isManageSiteArea={state.isOpenManageModal}
                        onClose={(isRefresh) => onCloseModal(isRefresh)}
                        provider={provider}
                        currentUserRoleDetail={currentUserRoleDetail}
                        selectedItem={state.selectedSiteAreaItem}
                        // isManageStaff={state.isManageStaff}
                        siteInfo={props.componentProps?.dataObj}
                        subAreaData={SiteAreaListDataRef.current}
                    />
                }
                <CustomModal isModalOpenProps={state.isOpenDeleteModal}
                    setModalpopUpFalse={closeDeleteModal}
                    subject={"Delete Record"}
                    message={Messages.DeleteRecord}
                    yesButtonText="Yes"
                    closeButtonText={"No"}
                    onClickOfYes={onClickConfirmDelete} />

                <ClientResponsePrintQrCode
                    isQrModelOpen={state.isQrModelOpen}
                    onClickClose={oncloseQRModal}
                    selectedItem={state.selectedSiteAreaItem}
                    siteName={props.componentProps?.dataObj?.Title}
                />
                {state.isMultipleQrModelOpen &&
                    <PrintMultipleQrCode selectedItems={selectedRows}
                        onClickClose={onMultipleQRClose} provider={provider}
                        siteName={props.componentProps?.dataObj?.Title} />
                }
            </div>
        </div>
    )
}