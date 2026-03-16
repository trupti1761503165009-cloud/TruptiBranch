import React from "react";
import { IListHazardReport } from "../../../../../../Interfaces/IListHazardReport";
import { MultipleSiteFilter } from "../../../../../../Common/Filter/MultipleSiteFilter";
import { ListHazardReportData } from "./ListHazardReportData";
import { MemoizedDetailList } from "../../../../../../Common/DetailsList";
import { DefaultButton, IContextualMenuProps, Link, TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loader } from "../../../CommonComponents/Loader";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { yesNoOptions } from "../../../../../../Common/Constants/CommonConstants";
import { PreDateRangeFilterQuaySafe } from "../../../../../../Common/Filter/PreDateRangeFilterQuaySafe";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Messages } from "../../../../../../Common/Constants/Messages";
import { HazardCountCards } from "./HazardCountCards";
import { HazardPrintQrCode } from "./HazardPrintQrCode";
import { ModalHazardSite } from "./ModalHazardSite";
import { HazardCardView } from "./HazardCardView";
import AttachmentDialog from "./AttachmentDialog";
import TabMenu from "../../../../../../Common/TabMenu";
import moment from "moment";
const play = require('../../../../assets/images/play.png');
export const ListHazardReport = (props: IListHazardReport) => {

    const {
        provider,
        context,
        currentUserRoleDetail,
        isLoading,
        selectedSites,
        currentView,
        state,
        tooltipId,
        hazardCountCard,
        columns,
        isPdfMode,
        onChangeRangeOption,
        onChangeToDate,
        onChangeFromDate,
        handleSiteChange,
        HazardListColumn,
        onclickRefreshGrid,
        onclickExportToExcel,
        onclickExportToPDF,
        _onItemSelected,
        handleDropdownChange,
        onClickArchiveRecordYes,
        closeArchiveModal,
        handleCardClick,
        handleOpenHazardQRModal,
        oncloseHazardModal,
        onCloseSiteModal,
        handleViewChange,
        onClickSiteUpdate,
        onClickUnArchive,
        onClickView,
        setState,
        onClickAttachment,
        onClickCopyLink,
        onStateChange,
        isSiteLevelComponent,
        selectedZoneDetails
    } = ListHazardReportData(props);

    const menuProps: IContextualMenuProps = {
        items: [
            {
                key: "downloadPdf",
                text: "Export PDF",
                iconProps: { iconName: "PDF", style: { color: "#D7504C" } },
                onClick: (ev, item) => { onclickExportToPDF() },
            },
            {
                key: "exportExcel",
                text: "Export to Excel",
                iconProps: { iconName: "ExcelDocument", style: { color: "orange" } },
                onClick: (ev, item) => { onclickExportToExcel() },
            },
        ],
    };
    return (

        <div>
            {isLoading && <Loader />}
            <HazardPrintQrCode
                isHazardQrModelOpen={state.isHazardQrModelOpen}
                onClickClose={oncloseHazardModal}
                HazardQRImage={state.HazardQRCodeImage}
                siteName={selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId[0] || state.HazardData[0]?.SiteName}
            />
            <HazardCountCards data={hazardCountCard.current} handleCardClick={handleCardClick} context={props.context} />
            <div className="ms-Grid mt-3">
                <div className="ms-Grid-row ptop-5">
                    {!isSiteLevelComponent && <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                        <div className="formControl ims-site-pad">
                            <div className="formControl">
                                <MultipleSiteFilter
                                    isPermissionFiter={true}
                                    loginUserRoleDetails={currentUserRoleDetail}
                                    selectedSiteIds={selectedSites.ids}
                                    selectedSiteTitles={selectedSites.titles}
                                    selectedSCSite={selectedSites.scSites}
                                    onSiteChange={handleSiteChange}
                                    selectedState={(state.selectedStateId != null && state.selectedStateId?.length !== 0) ? [state.selectedStateId] : []}
                                    provider={provider}
                                    isRequired={true}
                                    AllOption={true}
                                />
                            </div>
                        </div>
                    </div>}
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                        <div className="formControl ims-site-pad">
                            <div className="formControl">
                                <ReactDropdown
                                    options={state.SubmittedByOptions}
                                    isMultiSelect={false}
                                    defaultOption={state.selectedSubmittedBy}
                                    onChange={(opt) => handleDropdownChange("selectedSubmittedBy", opt, false)}
                                    isClearable
                                    placeholder="Select Submitted By"
                                />
                            </div>
                        </div>
                    </div>

                    {/* <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                        <div className="formControl ims-site-pad">
                            <div className="formControl">
                                <ReactDropdown
                                    options={state.HazardTypeOptions}
                                    isMultiSelect={true}
                                    defaultOption={state.selectedHazardType}
                                    onChange={(opts) => handleDropdownChange("selectedHazardType", opts, true)}
                                    isClearable
                                    placeholder="Select Hazard"
                                />
                            </div>
                        </div>
                    </div> */}
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                        <div className="formControl ims-site-pad">
                            <div className="formControl">
                                <ReactDropdown
                                    options={state.SubHazardTypeOptions}
                                    isMultiSelect={true}
                                    defaultOption={state.selectedSubHazardType}
                                    onChange={(opts) => handleDropdownChange("selectedSubHazardType", opts, true)}
                                    isClearable
                                    placeholder="Select Sub Hazard"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                        <div className="formControl ims-site-pad">
                            <div className="formControl">
                                <ReactDropdown
                                    options={yesNoOptions}
                                    isMultiSelect={false}
                                    defaultOption={state.selectedArchive}
                                    onChange={(opt) => handleDropdownChange("selectedArchive", opt, false, true)}
                                    isClearable
                                    placeholder="Select Archive"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                        <div className="formControl ims-site-pad">
                            <div className="formControl">
                                <PreDateRangeFilterQuaySafe
                                    fromDate={state.fromDate}
                                    toDate={state.toDate}
                                    onFromDateChange={onChangeFromDate}
                                    onToDateChange={onChangeToDate}
                                    isClearable={true}
                                    onChangeRangeOption={onChangeRangeOption}
                                    IsLast30Record={true}
                                />
                            </div>
                        </div>
                    </div>
                    {/* {!props.siteMasterId && <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg8 ms-xl12 mb-2">
                        {state.stateTabData.length > 0 && <TabMenu
                            stateMasterItems={state.stateTabData}
                            onStateChange={(option: any) => onStateChange(option)} />}
                    </div>} */}
                </div>
            </div>

            <div className="boxCardq">
                <div className="formGroup" style={{ width: "100%" }}>
                    {(currentView === "grid" && window.innerWidth > 768) ? <>
                        <MemoizedDetailList
                            // manageComponentView={props.manageComponentView}
                            columns={HazardListColumn() as any}
                            // columns={columns || []}
                            items={state.filteredHazardData || []}
                            reRenderComponent={true}
                            onSelectedItem={_onItemSelected}
                            searchable={true}
                            // CustomselectionMode={
                            //     (!!props.siteMasterId &&
                            //         (currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0 || currentUserRoleDetail.isStateManager))
                            //         ? SelectionMode.multiple
                            //         : SelectionMode.none
                            // }
                            addEDButton={<>
                            </>}
                            isAddNew={true}
                            addNewContent={
                                <>
                                    <div className="dflex">
                                        {(selectedZoneDetails?.isSinglesiteSelected) && <Link className="actionBtn iconSize btnPrimary ml-10" onClick={handleOpenHazardQRModal}>
                                            <TooltipHost content={"Print Hazard QR Code"} >
                                                <FontAwesomeIcon icon="qrcode" />
                                            </TooltipHost>
                                        </Link>}

                                        {isSiteLevelComponent && (selectedZoneDetails?.isSinglesiteSelected) && <Link className="actionBtn iconSize btnRefresh ml-10" onClick={onClickCopyLink}>
                                            <TooltipHost content={"Copy Link"} >
                                                <FontAwesomeIcon icon="link" />
                                            </TooltipHost>
                                        </Link>}

                                        {/* Add 4999 because we are not getting more than 4999 records attachment it take time  */}
                                        {!!state?.filteredHazardData && state?.filteredHazardData?.length <= 4999 && <Link className="btnEdit ml-10" disabled={state.filteredHazardData?.length == 0 || state.filteredHazardData == undefined} style={{ paddingBottom: "2px" }}
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
                                        <Link className="actionBtn iconSize btnRefresh icon-mr ml-10" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                            text="">
                                            <TooltipHost
                                                content={"Refresh Grid"}
                                                id={tooltipId}
                                            >
                                                <FontAwesomeIcon icon={"arrows-rotate"} />
                                            </TooltipHost></Link>

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

                                    {(selectedZoneDetails?.isSinglesiteSelected) && <Link className="actionBtn iconSize btnPrimary ml-10" onClick={handleOpenHazardQRModal}>
                                        <TooltipHost content={"Print Hazard QR Code"} >
                                            <FontAwesomeIcon icon="qrcode" />
                                        </TooltipHost>
                                    </Link>}
                                    {((selectedZoneDetails?.isSinglesiteSelected) && (currentUserRoleDetail.isAdmin || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isSiteManager || currentUserRoleDetail.isSiteSupervisor || currentUserRoleDetail.isWHSChairperson)) && <Link className="actionBtn iconSize btnRefresh ml-10" onClick={onClickCopyLink}>
                                        <TooltipHost content={"Copy Link"} >
                                            <FontAwesomeIcon icon="link" />
                                        </TooltipHost>
                                    </Link>}

                                    {/* Add 4999 because we are not getting more than 4999 records attachment it take time  */}
                                    {!!state?.filteredHazardData && state?.filteredHazardData?.length <= 4999 && <Link className="btnEdit ml-10" disabled={state.filteredHazardData?.length == 0 || state.filteredHazardData == undefined} style={{ paddingBottom: "2px" }}
                                        // onClick={onclickExportToPDF}
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
                                            src={require('../../../../assets/images/qc-logo-long.svg')}
                                            alt="Quayclean logo"
                                            className="header-logo qclogoims"
                                        />
                                    </div>
                                </div>

                                <div className="pdf-header-container">
                                    <div className="selected-filters-container">

                                        {/* Selected Sites */}
                                        {selectedSites?.titles?.length > 0 && (
                                            <div className="filter-card">
                                                <div className="filter-title">Sites</div>
                                                <div className="tag-list">
                                                    {selectedSites.titles.map((site: string, index: number) => (
                                                        <div className="tag" key={index}>
                                                            {site}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Submitted By */}
                                        {state?.selectedSubmittedBy && (
                                            <div className="filter-card">
                                                <div className="filter-title">Submitted By</div>
                                                <div className="tag-list">
                                                    {state.SubmittedByOptions.map((site: any, index: number) => (
                                                        <div className="tag" key={index}>
                                                            {site.label}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Sub Hazard Type */}
                                        {state?.selectedSubHazardType?.length > 0 && (
                                            <div className="filter-card">
                                                <div className="filter-title">Sub Hazard Type</div>
                                                <div className="tag-list">
                                                    {state.selectedSubHazardType.map((hazard: any, index: number) => (
                                                        <div className="tag" key={index}>
                                                            {hazard}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Archive Status */}
                                        {state?.selectedArchive !== null && state?.selectedArchive !== undefined && (
                                            <div className="filter-card">
                                                <div className="filter-title">Archive</div>
                                                <div className="tag-list">
                                                    <div className="tag">
                                                        {state.selectedArchive == "No" ? 'No' : 'Yes'}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* From Date */}
                                        {state?.filterFromDate && (
                                            <div className="filter-card">
                                                <div className="filter-title">From Date</div>
                                                <div className="tag-list">
                                                    <div className="tag">
                                                        {state.filterFromDate
                                                            ? moment(state.filterFromDate, 'YYYY-MM-DD').format('MM-DD-YYYY')
                                                            : ''}
                                                    </div>

                                                </div>
                                            </div>
                                        )}

                                        {/* To Date */}
                                        {state?.filterToDate && (
                                            <div className="filter-card">
                                                <div className="filter-title">To Date</div>
                                                <div className="tag-list">
                                                    {/* <div className="tag">{state.filterToDate}</div> */}
                                                    <div className="tag">
                                                        {state.filterToDate
                                                            ? moment(state.filterToDate, 'YYYY-MM-DD').format('MM-DD-YYYY')
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

                                        // ✅ Filter attachments for current item
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

                                                {/* Hazard Description */}
                                                <div className="qc-row mt-2">
                                                    <div className="card-other-content mx-100 issue-list-border">
                                                        <label className="card-label">Hazard Description</label>
                                                        <div className="fw-bold">
                                                            {description || "No description provided"}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Attachments */}
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
            <CustomModal isModalOpenProps={state.isOpenArchiveModal}
                setModalpopUpFalse={closeArchiveModal}
                subject={"Unarchive Record"}
                message={Messages.UnarchiveRecord}
                yesButtonText="Yes"
                closeButtonText={"No"}
                onClickOfYes={onClickArchiveRecordYes} />

            {state.isHazardSiteUpdate &&
                <ModalHazardSite isHazardSiteUpdate={state.isHazardSiteUpdate}
                    onClose={(isRefresh) =>
                        onCloseSiteModal(isRefresh)
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