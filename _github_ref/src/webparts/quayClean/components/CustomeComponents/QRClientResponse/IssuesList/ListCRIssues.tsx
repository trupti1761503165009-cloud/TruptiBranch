import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, TooltipHost } from "office-ui-fabric-react";
import React from "react";
import { yesNoOptions } from "../../../../../../Common/Constants/CommonConstants";
import { Messages } from "../../../../../../Common/Constants/Messages";
import { MemoizedDetailList } from "../../../../../../Common/DetailsList";
import { MultipleSiteFilter } from "../../../../../../Common/Filter/MultipleSiteFilter";
import { PreDateRangeFilterQuaySafe } from "../../../../../../Common/Filter/PreDateRangeFilterQuaySafe";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Loader } from "../../../CommonComponents/Loader";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import TabMenu from "../../../CommonComponents/TabMenu";
import { ModalHazardSite } from "../../IMS/HazardReport/ModalHazardSite";
import { ListCRIssuesData } from "./ListCRIssuesData";
import { IListIssues } from "../ClientResponseFields";
import { ClientResponseCountCards } from "./ClientResponseCountCards";
import { IssueListCardView } from "./IssueListCardView";
import CRAttachmentDialog from "./CRAttachmentDialog";
import { CRResolveModal } from "./CRResolveModal";
import { CRReassignModal } from "./CRReassignModal";
import { ClientResponsePrintQrCode } from "../ManageSiteArea/ClientResponsePrintQrCode";
import { ManageSiteAreaPanel } from "./ManageSiteAreaPanel";
import SiteCategoryTabs from "../../ClientResponseCharts/SiteCategoryTab";
import { MultipleSiteFilterWithCategory } from "../../../../../../Common/Filter/MultipleSiteFilterWithCategory";
export const ListCRIssues = (props: IListIssues) => {

    const optionStatus: any[] = [
        { value: 'Submitted', key: "Submitted", text: "Submitted", label: "Submitted" },
        { value: 'Not an Issue', key: 'Not an Issue', text: 'Not an Issue', label: 'Not an Issue' },
        { value: 'Resolved', key: 'Resolved', text: 'Resolved', label: 'Resolved' }
    ];

    const {
        provider,
        context,
        currentUserRoleDetail,
        isLoading,
        selectedSites,
        currentView,
        state,
        tooltipId,
        categoryCountCard,
        columns,
        onChangeRangeOption,
        onChangeToDate,
        onChangeFromDate,
        handleSiteChange,
        IssuesListColumn,
        onclickRefreshGrid,
        onclickExportToExcel,
        _onItemSelected,
        handleDropdownChange,
        closeArchiveModal,
        onClickArchiveRecordYes,
        handleCardClick,
        handleOpenQRModal,
        oncloseQRCodeModal,
        handleViewChange,
        onClickUnArchive,
        onClickView,
        setState,
        onClickAttachment,
        onClickCopyLink,
        onStateChange,
        setIsManageSiteAreaOpen,
        setSelectedSiteArea,
        isManageSiteAreaOpen,
        onClickReassignIssue,
        onClickResolveIssue,
        setSelectedSites,
        isSiteLevelComponent,
        selectedZoneDetails
    } = ListCRIssuesData(props);

    return (

        <div className={isSiteLevelComponent ? "" : "boxCard boxCard-mt-0"}>
            {isLoading && <Loader />}
            {(!isSiteLevelComponent) && <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                    <h1 className="mainTitle">Client Feedback</h1>
                </div>
            </div>}

            {(!selectedZoneDetails?.isSinglesiteSelected && isSiteLevelComponent) && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12">
                <SiteCategoryTabs
                    tabData={state.SiteCategoryCardData}
                    defaultCategoryId={state.selectedSiteCategoryId}
                    onCategoryChange={(siteCategoryId) => {
                        setState((prevState: any) => ({
                            ...prevState,
                            selectedSiteCategoryId: siteCategoryId,
                            isRefresh: false,
                            isLocalFilter: true,
                            isRefreshOptions: true,
                            selectedReportedBy: undefined,
                            selectedSubCategory: undefined,
                            selectedCategory: undefined,
                            selectedResolvedBy: undefined,
                            filterCategoryValue: undefined
                        }));
                        setSelectedSites({
                            ids: [],
                            titles: [],
                            scSites: [],
                        });
                    }}
                />
            </div>}
            <ClientResponseCountCards data={categoryCountCard.current} handleCardClick={handleCardClick} context={context} selectedCard={state.filterCategoryValue} />
            <div className="ms-Grid mt-3">
                <div className="ms-Grid-row ptop-5">

                    {!props.siteMasterId && <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                        <div className="formControl ims-site-pad">
                            <div className="formControl">
                                <MultipleSiteFilterWithCategory
                                    isPermissionFiter={true}
                                    loginUserRoleDetails={currentUserRoleDetail}
                                    selectedSiteIds={selectedSites.ids}
                                    selectedSiteTitles={selectedSites.titles}
                                    selectedSCSite={selectedSites.scSites}
                                    onSiteChange={handleSiteChange}
                                    selectedState={(state.selectedStateId != null && state.selectedStateId?.length !== 0) ? [state.selectedStateId] : []}
                                    provider={provider}
                                    siteCategoryId={state.selectedSiteCategoryId}
                                />
                            </div>
                        </div>
                    </div>}
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                        <div className="formControl ims-site-pad">
                            <div className="formControl">
                                <ReactDropdown
                                    options={state.ReportedByOptions}
                                    isMultiSelect={false}
                                    defaultOption={state.selectedReportedBy}
                                    onChange={(opt) => handleDropdownChange("selectedReportedBy", opt, false)}
                                    isClearable
                                    placeholder="Select Reported By"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                        <div className="formControl ims-site-pad">
                            <div className="formControl">
                                <ReactDropdown
                                    options={state.SubCategoryOptions}
                                    isMultiSelect={true}
                                    defaultOption={state.selectedSubCategory}
                                    onChange={(opts) => handleDropdownChange("selectedSubCategory", opts, true)}
                                    isClearable
                                    placeholder="Select Sub Category"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                        <div className="formControl ims-site-pad">
                            <div className="formControl">
                                <ReactDropdown
                                    options={state.ResolvedByOptions}
                                    isMultiSelect={false}
                                    defaultOption={state.selectedResolvedBy}
                                    onChange={(opt) => handleDropdownChange("selectedResolvedBy", opt, false)}
                                    isClearable
                                    placeholder="Select Resolved By"
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
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                        <div className="formControl ims-site-pad">
                            <div className="formControl">
                                <ReactDropdown
                                    options={optionStatus}
                                    isMultiSelect={true}
                                    placeholder="Select Status"
                                    defaultOption={state.selectedStatus}
                                    onChange={(opts) =>
                                        handleDropdownChange(
                                            "selectedStatus",
                                            opts,
                                            true,
                                            true
                                        )
                                    }
                                    isClearable={true}
                                />
                            </div>
                        </div>
                    </div>
                    {(!isSiteLevelComponent) && <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg8 ms-xl12 mb-2">
                        {state.stateTabData.length > 0 && <TabMenu
                            stateMasterItems={state.stateTabData}
                            onStateChange={(option: any) => onStateChange(option)} />}
                    </div>}
                </div>
            </div>

            <div className="boxCardq">
                <div className="formGroup" style={{ width: "100%" }}>
                    {(currentView === "grid" && window.innerWidth > 768) ? <>
                        <MemoizedDetailList
                            // manageComponentView={props.manageComponentView}
                            columns={IssuesListColumn() as any}
                            // columns={columns || []}
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
                                        {(selectedZoneDetails?.isSinglesiteSelected) && <Link className="actionBtn iconSize btnPrimary ml-10" onClick={handleOpenQRModal}>
                                            <TooltipHost content={"Print Client Response QR Code"} >
                                                <FontAwesomeIcon icon="qrcode" />
                                            </TooltipHost>
                                        </Link>}
                                        {(selectedZoneDetails?.isSinglesiteSelected) && <Link className="actionBtn iconSize btnRefresh ml-10" onClick={onClickCopyLink}>
                                            <TooltipHost content={"Copy Link"} >
                                                <FontAwesomeIcon icon="link" />
                                            </TooltipHost>
                                        </Link>}
                                        {(selectedZoneDetails?.isSinglesiteSelected) && (
                                            <Link
                                                className="actionBtn iconSize btnMove ml-10"
                                                onClick={() => {
                                                    setSelectedSiteArea(null); // or pass existing item if edit
                                                    setIsManageSiteAreaOpen(true);
                                                }}
                                            >
                                                <TooltipHost content={"Manage Staff Members"}>
                                                    <FontAwesomeIcon icon="user-plus" />
                                                </TooltipHost>
                                            </Link>
                                        )}
                                        {state.filteredClientResponseData?.length > 0 && <Link className="actionBtn iconSize btnEdit ml-10" style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}>
                                            <TooltipHost content={"Export to excel"} id={tooltipId} >
                                                <FontAwesomeIcon icon={"file-excel"} />
                                            </TooltipHost>
                                        </Link>}

                                        <Link className="actionBtn iconSize btnRefresh icon-mr ml-10" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}>
                                            <TooltipHost content={"Refresh Grid"} id={tooltipId}>
                                                <FontAwesomeIcon icon={"arrows-rotate"} />
                                            </TooltipHost>
                                        </Link>

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
                                    {(selectedZoneDetails?.isSinglesiteSelected) && <Link className="actionBtn iconSize btnPrimary ml-10" onClick={handleOpenQRModal}>
                                        <TooltipHost content={"Print Client Response QR Code"} >
                                            <FontAwesomeIcon icon="qrcode" />
                                        </TooltipHost>
                                    </Link>}
                                    {(selectedZoneDetails?.isSinglesiteSelected) && <Link className="actionBtn iconSize btnRefresh ml-10" onClick={onClickCopyLink}>
                                        <TooltipHost content={"Copy Link"} >
                                            <FontAwesomeIcon icon="link" />
                                        </TooltipHost>
                                    </Link>}
                                    {(selectedZoneDetails?.isSinglesiteSelected) && (
                                        <Link
                                            className="actionBtn iconSize btnMove ml-10"
                                            onClick={() => {
                                                setSelectedSiteArea(null); // or pass existing item if edit
                                                setIsManageSiteAreaOpen(true);
                                            }}
                                        >
                                            <TooltipHost content={"Manage Staff Members"}>
                                                <FontAwesomeIcon icon="user-plus" />
                                            </TooltipHost>
                                        </Link>
                                    )}
                                    {state.filteredClientResponseData?.length > 0 && <Link className="actionBtn iconSize btnEdit ml-10" style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}>
                                        <TooltipHost content={"Export to excel"} id={tooltipId} >
                                            <FontAwesomeIcon icon={"file-excel"} />
                                        </TooltipHost>
                                    </Link>}

                                    <Link className="actionBtn iconSize btnRefresh icon-mr ml-10" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                        text="">
                                        <TooltipHost content={"Refresh Grid"} id={tooltipId}>
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
                                <IssueListCardView
                                    items={state.filteredClientResponseData}
                                    isTabView={false}
                                    manageComponentView={props.manageComponentView}
                                    _onclickView={(data) => { onClickView(data) }}
                                    _onclickUnarchive={(data) => { onClickUnArchive(data) }}
                                    _onclickAttachment={(data) => { onClickAttachment(data) }}
                                    _onclickResolved={(data) => { onClickResolveIssue(data) }}
                                    _onclickReAssigned={(data) => { onClickReassignIssue(data) }}
                                />
                            </div>
                        </div>
                    }
                </div>
            </div>
            <CustomModal isModalOpenProps={state.isOpenArchiveModal}
                setModalpopUpFalse={closeArchiveModal}
                subject={"Unarchive Record"}
                message={Messages.UnarchiveRecord}
                yesButtonText="Yes"
                closeButtonText={"No"}
                onClickOfYes={onClickArchiveRecordYes} />
            <ClientResponsePrintQrCode
                key={state.keyUpdate}
                isQrModelOpen={state.isQrModelOpen}
                onClickClose={oncloseQRCodeModal}
                selectedItem={state}
                siteName={props.componentProps?.dataObj?.Title}
            />

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
                    onClose={(refresh) =>
                        setState(prev => ({
                            ...prev,
                            isResolveModalOpen: false,
                            selectedIssueItem: null,
                            isRefresh: !!refresh
                        }))
                    }
                />
            )}

            {isManageSiteAreaOpen && (
                <div className="equipment-page">
                    <ManageSiteAreaPanel
                        isManageSiteArea={isManageSiteAreaOpen}
                        provider={provider}
                        currentUserRoleDetail={currentUserRoleDetail}
                        // siteInfo={props.componentProps?.siteMasterId}          // ✅ Site Master item
                        siteInfo={props.componentProps}          // ✅ Site Master item
                        onClose={(isRefresh) => {
                            setIsManageSiteAreaOpen(false);

                            if (isRefresh) {
                                onclickRefreshGrid();        // 🔁 Reload Sites grid
                            }
                        }}
                    />
                </div>
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
                            isRefresh: !!isRefresh
                        }));
                    }}
                />
            )}
        </div>
    )
}