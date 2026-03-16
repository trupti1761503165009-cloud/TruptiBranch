import React from "react";
import { DefaultButton, Link, TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MemoizedDetailList } from "../../../../../../../Common/DetailsList";
import { Loader } from "../../../../CommonComponents/Loader";
import AttachmentDialog from "../../HazardReport/AttachmentDialog";
import { HazardCardView } from "../../HazardReport/HazardCardView";
import { ModalHazardSite } from "../../HazardReport/ModalHazardSite";
import { HazardListingData } from "./HazardListingData";
import moment from "moment";
const play = require('../../../../../assets/images/play.png');
export const HazardListing = (props: any) => {

    const {
        provider,
        currentUserRoleDetail,
        isLoading,
        currentView,
        state,
        tooltipId,
        columns,
        menuProps,
        isPdfMode,
        onclickRefreshGrid,
        onclickExportToExcel,
        _onItemSelected,
        handleOpenHazardQRModal,
        onCloseSiteModal,
        handleViewChange,
        onClickSiteUpdate,
        onClickUnArchive,
        onClickView,
        setState,
        onClickAttachment,
    } = HazardListingData(props);

    return (

        <div>
            {isLoading && <Loader />}

            <div className="boxCard-grid">
                <div className="formGroup" style={{ width: "100%" }}>
                    {(currentView === "grid" && window.innerWidth > 768) ? <>
                        <MemoizedDetailList
                            // manageComponentView={props.manageComponentView}
                            // columns={HazardListColumn() as any}
                            columns={columns || []}
                            items={state.filteredHazardData || []}
                            reRenderComponent={true}
                            onSelectedItem={_onItemSelected}
                            searchable={true}
                            addEDButton={<>
                            </>}
                            isAddNew={true}
                            addNewContent={
                                <>
                                    <div className="dflex">
                                        {/* Add 4999 because we are not getting more than 4999 records attachment it take time */}
                                        {!!state?.filteredHazardData && state?.filteredHazardData?.length <= 4999 &&
                                            <Link className="actionBtn iconSize btnEdit ml-10 hr-mar" disabled={state.filteredHazardData?.length == 0 || state.filteredHazardData == undefined} style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                                text="">
                                                <TooltipHost content="Export options">
                                                    <DefaultButton
                                                        text="Export"
                                                        iconProps={{ iconName: "Download", style: { color: "#ffffff" } }}
                                                        menuProps={menuProps}
                                                        className="btn export-btn-primary"
                                                    />
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
                                    {/* Add 4999 because we are not getting more than 4999 records attachment it take time  */}
                                    {!!state?.filteredHazardData && state?.filteredHazardData?.length <= 4999 &&
                                        <Link className="actionBtn iconSize btnEdit ml-10 hr-mar" disabled={state.filteredHazardData?.length == 0 || state.filteredHazardData == undefined} style={{ paddingBottom: "2px" }}
                                            text="">
                                            <TooltipHost content="Export options">
                                                <DefaultButton
                                                    text="Export"
                                                    iconProps={{ iconName: "Download", style: { color: "#ffffff" } }}
                                                    menuProps={menuProps}
                                                    className="btn export-btn-primary"
                                                />
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
                                    isChartView={true}
                                />
                            </div>
                        </div>
                    }
                </div>
            </div>

            {isPdfMode &&
                <div className="mt-2">
                    <div className="mt-3">
                        <div className="qc-row">
                            <div className="qc-col-md-12" id="HazardReportPDF">
                                <div className="navHeader" style={{ borderBottom: '1px solid #dddddd' }}>
                                    <div className="pdfnavBrand">
                                        <div className="headerPDF">
                                            Hazard Report List
                                        </div>
                                        <img
                                            src={require('../../../../../assets/images/qc-logo-long.svg')}
                                            alt="Quayclean logo"
                                            className="header-logo qclogoims"
                                        />
                                    </div>
                                </div>

                                <div className="pdf-header-container">
                                    <div className="selected-filters-container">
                                        {props.selectedSites?.length > 0 && (
                                            <div className="filter-card">
                                                <div className="filter-title">Sites</div>
                                                <div className="tag-list">
                                                    {props?.selectedSites.map((site: string, index: number) => (
                                                        <div className="tag" key={index}>
                                                            {site}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {props?.selectedSubmittedByFull?.length > 0 && (
                                            <div className="filter-card">
                                                <div className="filter-title">Submitted By</div>
                                                <div className="tag-list">
                                                    {props?.selectedSubmittedByFull?.map((site: any, index: number) => (
                                                        <div className="tag" key={index}>
                                                            {site.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {props?.selectedSubHazardType?.length > 0 && (
                                            <div className="filter-card">
                                                <div className="filter-title">Sub Hazard Type</div>
                                                <div className="tag-list">
                                                    {props?.selectedSubHazardType.map((hazard: any, index: number) => (
                                                        <div className="tag" key={index}>
                                                            {hazard}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {props?.filterFromDate && (
                                            <div className="filter-card">
                                                <div className="filter-title">From Date</div>
                                                <div className="tag-list">
                                                    <div className="tag">
                                                        {props.filterFromDate
                                                            ? moment(props.filterFromDate, 'YYYY-MM-DD').format('DD-MM-YYYY')
                                                            : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {props?.filterToDate && (
                                            <div className="filter-card">
                                                <div className="filter-title">To Date</div>
                                                <div className="tag-list">
                                                    <div className="tag">
                                                        {props.filterToDate
                                                            ? moment(props.filterToDate, 'YYYY-MM-DD').format('DD-MM-YYYY')
                                                            : ''}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>

                                {!!state.PDFData &&
                                    state.PDFData.map((item: any, index: number) => {

                                        const description =
                                            item?.ResponseJSON?.response?.commonQuestions?.answers?.find(
                                                (a: any) => a.label === "Hazard Description"
                                            )?.value || "—";

                                        const itemAttachments =
                                            state.AttchmentsData?.filter(
                                                (file: any) => file.id === item.ID
                                            ) || [];

                                        return (
                                            <div
                                                key={index}
                                                className="amenities-thumbCard new-humbCard-2 mb-3 keep-together"
                                            >
                                                <div className="qc-row align-items-center">
                                                    <div className="card-other-content mx-100">
                                                        <div className="fw-bold report-list-title">
                                                            {item.SiteName}
                                                        </div>
                                                        <label className="card-label fnt-14">
                                                            {item.HazardFormId}
                                                        </label>
                                                    </div>
                                                </div>

                                                <div className="dflex margin-left15">
                                                    <div className="card-other-content">
                                                        <label className="card-label">Hazard Type</label>
                                                        <div className="fw-bold hazard-badge">
                                                            {item.HazardType}
                                                        </div>
                                                    </div>

                                                    <div className="card-other-content">
                                                        <label className="card-label">Sub Type</label>
                                                        <div className="fw-bold subhazard-badge">
                                                            {item.HazardSubType}
                                                        </div>
                                                    </div>

                                                    <div className="card-other-content">
                                                        <label className="card-label">Submitted Date</label>
                                                        <div className="fw-bold">
                                                            {item.SubmissionDate}
                                                        </div>
                                                    </div>

                                                    <div className="card-other-content">
                                                        <label className="card-label">Submitted By</label>
                                                        <div className="fw-bold">
                                                            {item.SubmittedBy}
                                                        </div>
                                                    </div>
                                                </div>

                                                <hr className="card-divider" />

                                                <div className="qc-row mt-2">
                                                    <div className="card-other-content mx-100 issue-list-border">
                                                        <label className="card-label">Hazard Description</label>
                                                        <div className="fw-bold">
                                                            {description || "No description provided"}
                                                        </div>
                                                    </div>
                                                </div>

                                                {itemAttachments.length > 0 && (
                                                    <div className="qc-row mt-2">
                                                        <div className="card-other-content mx-100 issue-list-border">
                                                            <label className="card-label">Attachments</label>

                                                            <div className="media-image-ans">
                                                                {itemAttachments.map((file: any, i: number) => {
                                                                    const fileUrl = file.fileUrl?.startsWith("http")
                                                                        ? file.fileUrl
                                                                        : `${window.location.origin}${file.fileUrl}`;

                                                                    return (
                                                                        <div className="media-image-list" key={i}>
                                                                            {file.isImage || file.fileType === "image" ? (
                                                                                <img
                                                                                    src={fileUrl}
                                                                                    className="media-img qclogoims"
                                                                                    alt={file.fileName}
                                                                                />
                                                                            ) : file.fileType === "video" ? (
                                                                                <a
                                                                                    href={fileUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                >
                                                                                    <img
                                                                                        src={play}
                                                                                        className="media-img qclogoims"
                                                                                        alt="Video thumbnail"
                                                                                    />
                                                                                    <div className="video-link-text">
                                                                                    </div>
                                                                                </a>
                                                                            ) : (
                                                                                <a
                                                                                    href={fileUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="file-link"
                                                                                >
                                                                                    {file.fileName}
                                                                                </a>
                                                                            )}
                                                                        </div>
                                                                    );

                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}


                            </div>
                        </div>
                    </div>

                </div>
            }

            {state.isHazardSiteUpdate &&
                <ModalHazardSite isHazardSiteUpdate={state.isHazardSiteUpdate}
                    onClose={() => {
                        onCloseSiteModal()
                        props.onItemUpdated();
                    }

                    }
                    provider={provider}
                    currentUserRoleDetail={currentUserRoleDetail}
                    selectedItem={state.selectedHazardItem}
                />
            }

            {state.isAttachmentModalOpen && <AttachmentDialog
                isOpen={state.isAttachmentModalOpen}
                onClose={() => {
                    setState((prev: any) => ({
                        ...prev,
                        isAttachmentModalOpen: false,
                        selectedHazardItem: undefined
                    }));
                }}
                selectedItem={state.selectedHazardItem}

            />}

        </div>
    )
}