import { faBook, faCalendarDay, faChartBar, faFaceSmile, faFileInvoice, faFileLines, faFileShield, faFlask, faFolder, faHandshakeAngle, faHeadset, faLaptop, faListCheck, faScrewdriverWrench, faSquareCheck, faStreetView, faTicket, faTriangleExclamation, faUserCheck, faUserPlus, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { formatPrice } from "../../../../../Common/Util";
import { SiteDetailViewData } from "./SiteDetailViewData";
import { Loader } from "../../CommonComponents/Loader";
import { Checkbox, Label, Panel, PrimaryButton, Stack } from "@fluentui/react";
import CommonSendEmailPopupOnly from "../../CommonComponents/CommonSendEmailPopupOnly";
import { ComponentNameEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { IQuayCleanState } from "../../QuayClean";
import { DateRangeFilterDefault } from "../../../../../Common/Filter/DateRangeFilterDefault";

export interface ISiteDetailViewProps {
    siteMasterId?: number;
    redirectFrom: string;
    manageComponentView(componentProp: IQuayCleanState): any;
    componentProps: IQuayCleanState,
    dataObj?: any;
    siteName?: any;
    IsSupervisor?: any;
    qCState?: any,
    MasterId?: any,
    qCStateId?: any,
    componentProp?: any;
    breadCrumItems?: any;
}
const buttonStyles = { root: { marginRight: 8 } };
const stackTokens = { childrenGap: 10 };

const SiteDetailView = (props: ISiteDetailViewProps) => {
    const { state, onClickDownload, onSiteChange, onClickCancel, onChangeTitle, onChangeSendToEmail, onClickSendEmail, onClickShowEmailModel,
        onChangeFromDate, onChangeToDate,
        regenerateReport, onChangeRangeOption,
        onClickApplyFilter, onClickConfigureColumn, onClickConfigureClose, _onChangeConfigurationColumn,
        onClickConfigureColumnSave
    } = SiteDetailViewData(props);
    const renderValue = (value: any, isShowLoader?: boolean, defaultValue?: any) => {
        return (!!isShowLoader && isShowLoader == true) ? <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin /> : (value ?? defaultValue ?? "");
        // return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />
    };
    const columnVisibility = state.configurationColumn.reduce((acc, col) => {
        // acc[col.label] = state.isGeneratePDF ? col.value : true
        acc[col.label] = col.value
        return acc;
    }, {} as Record<string, boolean>);

    const onRenderFooterContent = () => {
        return <div>
            <PrimaryButton
                //  className="btn btn-primary" 
                styles={buttonStyles}
                onClick={() => onClickConfigureColumnSave()}
                disabled={state.isConfigurationSaveDisable}
                className={state.isConfigurationSaveDisable ? "" : "btn btn-primary"}
            >
                Save
            </PrimaryButton>
            <PrimaryButton className="btn btn-danger" onClick={onClickConfigureClose} >Cancel</PrimaryButton>
        </div>


    }

    return <div className={state.isGeneratePDF ? "detailViewSite" : "detailViewSite boxCardNo"} id="pdfGenrate" >
        {state.isLoading && <Loader />}
        <CommonSendEmailPopupOnly
            isPopupVisible={state.isPopupVisible}
            hidePopup={onClickCancel} title={state.title}
            sendToEmail={state.sendToEmail}
            onChangeTitle={onChangeTitle}
            onChangeSendToEmail={onChangeSendToEmail}
            displayerrortitle={state.displayErrorTitle}
            displayerroremail={state.displayErrorEmail}
            displayerror={state.displayError}
            onClickSendEmail={onClickSendEmail}
            onClickCancel={onClickCancel}
            onclickSendEmail={onClickShowEmailModel}
        />
        <Panel
            isOpen={state.isConfigurePanelOpen}
            onDismiss={onClickConfigureClose}
            headerText="Print Options"
            closeButtonAriaLabel="Close"
            onRenderFooterContent={onRenderFooterContent}
            isFooterAtBottom={true}
        >
            <Label>Select Print Section</Label>
            <Stack tokens={stackTokens}>
                {state.finalConfigurationColumn.map((i, index: number) => {

                    if (index == 0) {
                        return <Checkbox
                            label={i?.display ? i.display : i.label}
                            className={!!i.parent ? "ml-30 fwBold" : "fwBold"}
                            onChange={(e: any, Checked?: boolean) => _onChangeConfigurationColumn(i.label, index, i?.isParent || false, Checked)} checked={i.value}
                            disabled={i.disable}
                        />
                    } else {
                        return <Checkbox
                            label={i?.display ? i.display : i.label}
                            className={!!i.parent ? "ml-30" : ""}
                            onChange={(e: any, Checked?: boolean) => _onChangeConfigurationColumn(i.label, index, i?.isParent || false, Checked)} checked={i.value}
                            disabled={i.disable}
                        />
                    }

                })}
            </Stack>
        </Panel>


        <div className="container" >
            {state.isGeneratePDF && <div className="navHeader mb-3 " style={{ borderBottom: '1px solid #dddddd' }}>
                <div className="pdfnavBrand">
                    <div className="headerPDF">
                        Site Audit Report
                    </div>
                    <img src={require('../../../assets/images/qc-logo-long.svg')} alt="Quayclean logo" className="header-logo qclogoims" />
                </div>
            </div>}
            <div className="">
                <div className="mb-3">
                    <div className="mb-3">
                        <h1 className="title  fw-bold" >{renderValue(state?.siteDetailViewItems?.SitesMasterDetails?.name)}</h1>
                        <p className={state.isGeneratePDF ? "select-summary fontsize-16" : "select-summary "}> This report gives a quick overview of site operations, safety, compliance, and key activities including assets, incidents, inspections, and client responses. </p>
                    </div>


                </div>
                {!state.isGeneratePDF &&


                    <div className="dFlex gap10">
                        <div className="card w40 ">
                            <div className=" justify-between items-center mb-10 " >
                                <h3 className="title ">&nbsp;</h3>
                            </div>

                            <div className="dflex gap10" >
                                {/* {!state.isGeneratePDF &&
                                    <div className="w250">
                                        <SiteFilter

                                            isPermissionFiter={true}
                                            loginUserRoleDetails={currentUserRoleDetail}
                                            selectedSite={state.selectedSiteId}
                                            onSiteChange={onSiteChange}
                                            provider={provider}
                                            isRequired={true}
                                        />
                                    </div>
                                } */}
                                <div className="w250">
                                    <DateRangeFilterDefault
                                        isClearable={false}
                                        onFromDateChange={onChangeFromDate}
                                        onToDateChange={onChangeToDate}
                                        onChangeRangeOption={onChangeRangeOption}
                                        isHideWidth={true}
                                        fromDate={state.fromDate || ""}
                                        selectedOption={state.selectedDateRangeItem || ""}
                                        toDate={state.toDate || ""}
                                    />
                                </div>
                                <div className="">
                                    <PrimaryButton iconProps={{ iconName: "Filter" }} text="Apply"
                                        className={((state.isApplyFilterDisable == true) || ((!!state.selectedDateRangeItem) ? (state.filterFromDate == "" || state.filterToDate == "") : false)) ? "" : "btnBack  btn-primary"}
                                        disabled={((state.isApplyFilterDisable == true) || ((!!state.selectedDateRangeItem) ? (state.filterFromDate == "" || state.filterToDate == "") : false))}
                                        onClick={onClickApplyFilter}
                                    />
                                </div>

                            </div>

                        </div>

                        {!!state.selectedSiteId && <div className="card  w60 ">
                            <div>
                                <div className=" justify-between items-center mb-10">
                                    {/* <h3 className="title ">Report Export & Sharing Options</h3> */}
                                    <div className="warning-text ">
                                        ⚠️ Click "Regenerate Report" to get the latest data.
                                    </div>
                                </div>

                                <div className="no-print-flex gap-3  ">

                                    {/* <button onClick={onClickDownload} className="btn pdf"><img src={require('../../../assets/images/file-pdf.svg')} width="20" height="20" />Generate PDF</button>
                                    <button className="btn email" 
                                    onClick={onClickShowEmailModel}><img src={require('../../../assets/images/send-mail.svg')} width="20" height="20" />Send Email</button>
                                    <button className="btn refresh" 
                                    onClick={regenerateReport}><img src={require('../../../assets/images/refresh.svg')} width="25" height="25" /> Regenerate Report</button>
                                    <div>
                                        <TooltipHost
                                            content={"Configure Print Section"}
                                        >
                                            <PrimaryButton
                                                iconProps={{ iconName: "Settings" }}
                                                className="btnBack  btn-primary ml-10"
                                                onClick={onClickConfigureColumn}
                                                text="Print"
                                            />
                                        </TooltipHost>
                                    </div> */}
                                    <PrimaryButton
                                        iconProps={{ iconName: "PDF" }}
                                        className="btn pdf"
                                        onClick={onClickDownload}
                                        text="Generate PDF" />
                                    <PrimaryButton
                                        iconProps={{ iconName: "send" }}
                                        className="btn email"
                                        onClick={onClickShowEmailModel}
                                        text="Email" />
                                    <PrimaryButton
                                        iconProps={{ iconName: "Refresh" }}
                                        className="btn refresh"
                                        onClick={regenerateReport}
                                        text="Regenerate Report" />
                                    <PrimaryButton

                                        iconProps={{ iconName: "Settings" }}
                                        className="btn  btn-primary "
                                        onClick={onClickConfigureColumn}
                                        text="Print" />

                                </div>
                            </div>
                        </div>}
                        <div className="backButtonRight">
                            <PrimaryButton text="Back" className="btnBack  btn-danger"
                                onClick={() => {
                                    if (!!props.redirectFrom) {
                                        props.manageComponentView({
                                            currentComponentName: ComponentNameEnum.SiteDetailGrid,
                                        });
                                    } else {
                                        props.manageComponentView({
                                            currentComponentName: ComponentNameEnum.AddNewSite,
                                            dataObj: props?.dataObj,
                                            siteName: props?.siteName,
                                            IsSupervisor: props?.IsSupervisor,
                                            qCState: props?.qCState,
                                            MasterId: props?.siteMasterId,
                                            siteNameId: props?.siteMasterId,
                                            qCStateId: props?.componentProp?.dataObj?.StateId || props?.dataObj?.StateId,
                                            siteMasterId: props?.siteMasterId,
                                            breadCrumItems: props?.breadCrumItems,
                                            pivotName: "Site Information",
                                            isShowDetailOnly: true
                                        });
                                    }
                                }} />
                        </div></div>
                }
            </div>
            <div className="noHeaderBox">
                {(state?.filterFromDate && state?.filterToDate) ?
                    <div><span>Selected Period:{" "}</span>
                        {state?.filterFromDate?.split("-")?.reverse().join("-")} to {state.filterToDate?.split("-")?.reverse()?.join("-")}
                    </div> : <div><span>Selected Period:{" "}</span>
                        All
                    </div>}
            </div>
            <div className="header">
                <div><span>Name</span>{renderValue(state?.siteDetailViewItems?.SitesMasterDetails?.name)}</div>
                <div><span>State</span> {renderValue(state?.siteDetailViewItems?.SitesMasterDetails?.state)}</div>
                <div><span>Category</span>{renderValue(state?.siteDetailViewItems?.SitesMasterDetails?.category)}</div>
                <div><span>Last Report Generated</span>{renderValue(state?.siteDetailViewItems?.summeryDetail?.reportDate)}</div>
                <div><span>Who Generated</span> {renderValue(state?.siteDetailViewItems?.summeryDetail?.generatedBy)}</div>
            </div>


            <div className="gridPrint" >


                <div>


                    <div className="dflexOnly">
                        {
                            columnVisibility["At a Glance"] && <div className="w60"  >
                                <h3 className="title mb-3">At a Glance</h3>

                                <div className="stats genratePDF"  >
                                    <div className="stat-box border-blue">
                                        <FontAwesomeIcon icon={faScrewdriverWrench} className="text-xl text-gray-500" />
                                        <div><span>Total Assets</span><strong>{renderValue(state?.siteDetailViewItems?.AssetMasterDateRange?.totalAssetsCount, state.isShowLoader)}/{state?.siteDetailViewItems?.AssetMaster?.totalAssetsCount || 0}</strong></div>
                                    </div>
                                    <div className="stat-box border-teal">
                                        <FontAwesomeIcon icon={faFlask} className="text-xl text-gray-500" />
                                        <div><span>Total Chemicals</span><strong>{renderValue(state?.siteDetailViewItems?.SitesAssociatedChemicalDateRange?.totalChemicalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.SitesAssociatedChemical?.totalChemicalCount || 0}</strong></div>
                                    </div>
                                    <div className="stat-box border-purple">
                                        <FontAwesomeIcon icon={faUsers} className="text-xl text-gray-500" />
                                        <div><span>Total Assigned Team</span><strong>{renderValue(state?.siteDetailViewItems?.SitesAssociatedTeamDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.SitesAssociatedTeam?.totalCount || 0}</strong></div>
                                    </div>
                                    <div className="stat-box border-orange">
                                        <FontAwesomeIcon icon={faTicket} className="text-xl text-gray-500" />
                                        <div><span>Total Toolbox Talk</span><strong>{renderValue(state?.siteDetailViewItems?.ToolboxTalkDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.ToolboxTalk?.totalCount || 0}</strong></div>
                                    </div>
                                    <div className="stat-box border-green">
                                        <FontAwesomeIcon icon={faListCheck} className="text-xl text-gray-500" />
                                        <div><span>Total Incident Report</span><strong>{renderValue(state?.siteDetailViewItems?.ToolboxIncidentDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.ToolboxIncident?.totalCount || 0}</strong></div>
                                    </div>
                                    <div className="stat-box border-violet">
                                        <FontAwesomeIcon icon={faStreetView} className="text-xl text-gray-500" />
                                        <div><span>Total Skill Matrix</span><strong>{renderValue(state?.siteDetailViewItems?.SkillMatrixDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.SkillMatrix?.totalCount || 0}</strong></div>
                                    </div>
                                    <div className="stat-box border-skyblue">
                                        <FontAwesomeIcon icon={faFaceSmile} className="text-xl text-gray-500" />
                                        <div><span>Total Corrective Action Report</span><strong>{renderValue(state?.siteDetailViewItems?.CorrectiveActionReportDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.CorrectiveActionReport?.totalCount || 0}</strong></div>
                                    </div>
                                    <div className="stat-box border-pink">
                                        <FontAwesomeIcon icon={faFolder} className="text-xl text-gray-500" />
                                        <div><span>Total Workplace Inspection Report</span><strong>{renderValue(state?.siteDetailViewItems?.WorkplaceInspectionChecklistDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.WorkplaceInspectionChecklist?.totalCount || 0}</strong></div>
                                    </div>
                                    <div className="stat-box border-yellow">
                                        <FontAwesomeIcon icon={faCalendarDay} className="text-xl text-gray-500" />
                                        <div><span>Total Inspection</span><strong>{renderValue(state?.siteDetailViewItems?.SiteSafetyAuditDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.SiteSafetyAudit?.totalCount || 0}</strong></div>
                                    </div>
                                    <div className="stat-box border-gray">
                                        <FontAwesomeIcon icon={faChartBar} className="text-xl text-gray-500" />
                                        <div><span>Total Documents</span><strong>
                                            {renderValue((state?.siteDetailViewItems?.SiteDocumentsDateRange?.totalCount || 0) + (state?.siteDetailViewItems?.DocumentsLinkDateRange?.totalCount || 0) + (state?.siteDetailViewItems?.URLLinkDateRange?.totalCount || 0), state.isShowLoader)}
                                            /
                                            {((state?.siteDetailViewItems?.SiteDocuments?.totalCount || 0) + (state?.siteDetailViewItems?.DocumentsLink?.totalCount || 0) + (state?.siteDetailViewItems?.URLLink?.totalCount || 0))}
                                        </strong></div>
                                    </div>
                                    {state?.siteDetailViewItems?.SitesMasterDetails?.helpDeskNeeded && <div className="stat-box  border-yellow">
                                        <FontAwesomeIcon icon={faHandshakeAngle} className="text-xl text-gray-500" />
                                        <div><span>Total Open Help Desk</span><strong>{renderValue(state?.siteDetailViewItems?.HelpDeskDateRange?.pendingCount, state.isShowLoader)}/{state?.siteDetailViewItems?.HelpDesk?.pendingCount || 0}</strong></div>
                                    </div>}

                                </div>
                            </div>}



                        {columnVisibility["Configuration Settings"] && <div className="w40 mb-3" >
                            <h3 className="title">Configuration Settings</h3>


                            {/* {state.isGeneratePDF == false ? */}
                            <div className="toggles contacts">
                                <div className="toggle contacts-item">
                                    <div style={{ fontWeight: "700" }}>Periodic</div>
                                    <div className={state?.siteDetailViewItems?.SitesMasterDetails?.periodic ? "switch on" : "switch"} ><input type="checkbox" /><span className="knob"></span></div>
                                </div>
                                <div className="toggle contacts-item">
                                    <div style={{ fontWeight: "700" }}>Help Desk</div>
                                    <div className={state?.siteDetailViewItems?.SitesMasterDetails?.helpDeskNeeded ? "switch on" : "switch"}><input type="checkbox" /><span className="knob"></span></div>
                                </div>
                                <div className="toggle contacts-item">
                                    <div style={{ fontWeight: "700" }}>Client Response</div>
                                    <div className={state?.siteDetailViewItems?.SitesMasterDetails?.clientResponse ? "switch on" : "switch"}><input type="checkbox" /><span className="knob"></span></div>
                                </div>
                                <div className="toggle contacts-item">
                                    <div style={{ fontWeight: "700" }}>Site KPI's</div>
                                    <div className={state?.siteDetailViewItems?.SitesMasterDetails?.jobControlChecklist ? "switch on" : "switch"}><input type="checkbox" /><span className="knob"></span></div>
                                </div>
                                <div className="toggle contacts-item">
                                    <div style={{ fontWeight: "700" }}>Manage Events</div>
                                    <div className={state?.siteDetailViewItems?.SitesMasterDetails?.manageEvents ? "switch on" : "switch"}><input type="checkbox" /><span className="knob"></span>
                                    </div>
                                </div>
                                <div className="toggle contacts-item">
                                    <div style={{ fontWeight: "700" }}>Waste Report</div>
                                    <div className={state?.siteDetailViewItems?.SitesMasterDetails?.ssWasteReport ? "switch on" : "switch"}><input type="checkbox" /><span className="knob"></span>
                                    </div>
                                </div>
                                <div className="toggle contacts-item">
                                    <div style={{ fontWeight: "700" }}>Amenities Feedback Form</div>
                                    <div className={state?.siteDetailViewItems?.SitesMasterDetails?.amenitiesFeedbackForm ? "switch on" : "switch"}><input type="checkbox" /><span className="knob"></span>
                                    </div>
                                </div>
                                <div className="toggle contacts-item">
                                    <div style={{ fontWeight: "700" }}>Daily Cleaning Duties</div>
                                    <div className={state?.siteDetailViewItems?.SitesMasterDetails?.isDailyCleaningDuties ? "switch on" : "switch"}><input type="checkbox" /><span className="knob"></span>
                                    </div>
                                </div>
                            </div>
                        </div>}
                    </div>
                    {columnVisibility["Key Contacts"] && <div className="">
                        <h3 className="title">Key Contacts</h3>
                        <div className="contacts">

                            <p className="contacts-item"><strong className="w225">Site Manager ({renderValue(state?.siteDetailViewItems?.SitesMasterDetails?.siteManagerId?.length)}):</strong>
                                <span> {state?.siteDetailViewItems?.SitesMasterDetails?.siteManagerId?.length > 0 &&
                                    state?.siteDetailViewItems?.SitesMasterDetails?.siteManager.map((i: any, index: any) => {
                                        return <>{i.title}{index == (state?.siteDetailViewItems?.SitesMasterDetails?.siteManager.length - 1) ? "" : ", "}</>
                                    })} </span></p>
                            <p className="contacts-item"><strong className="w225">Dynamic Site Manager ({renderValue(state?.siteDetailViewItems?.SitesMasterDetails?.dynamicSiteManagerId > 0 ? 1 : 0)}):</strong>
                                <span> {state?.siteDetailViewItems?.SitesMasterDetails?.dynamicSiteManagerId > 0 && state?.siteDetailViewItems?.SitesMasterDetails?.dynamicSiteManager?.title}</span></p>
                            <p className="contacts-item"><strong className="w225">Site Supervisor ({renderValue(state?.siteDetailViewItems?.SitesMasterDetails?.siteSupervisorId?.length)}):</strong>
                                <span> {state?.siteDetailViewItems?.SitesMasterDetails?.siteSupervisorId?.length > 0 &&
                                    state?.siteDetailViewItems?.SitesMasterDetails?.siteSupervisor.map((i: any, index: any) => {
                                        return <>{i.title}{index == (state?.siteDetailViewItems?.SitesMasterDetails?.siteSupervisor.length - 1) ? "" : ", "}</>
                                    })}</span>
                            </p>
                            <p className="contacts-item"><strong className="w225">Client ({renderValue(state?.siteDetailViewItems?.SitesMasterDetails?.adClientId?.length)}):</strong>
                                <span>  {state?.siteDetailViewItems?.SitesMasterDetails?.adClientId?.length > 0 &&
                                    state?.siteDetailViewItems?.SitesMasterDetails?.adClient.map((i: any, index: any) => {
                                        return <>{i.title}{index == (state?.siteDetailViewItems?.SitesMasterDetails?.adClient.length - 1) ? "" : ", "}</>
                                    })}</span>
                            </p>
                        </div>
                    </div>}


                </div>

                <div>
                    <div className="">
                        <h3 className="title mb-3"> Detailed Reports</h3>
                        <div className="grid grid-cols-2 mb-3">
                            {columnVisibility["Equipment & Assets"] && <div className="card border-blue">
                                <div className="report-flex">

                                    <FontAwesomeIcon icon={faScrewdriverWrench} className="text-xl text-gray-500" />
                                    <h4 className="reports-subtitle">Equipment & Assets</h4>
                                </div>
                                <div className="mt-2 space-y-1.5">
                                    <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Total Assets</p>
                                        <p className="fw-bold text-lg">
                                            {renderValue(state?.siteDetailViewItems?.AssetMasterDateRange?.totalAssetsCount, state.isShowLoader)}
                                            /{renderValue(state?.siteDetailViewItems?.AssetMaster?.totalAssetsCount)}
                                        </p>
                                    </div>
                                    {columnVisibility["Assets Value"] && <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Assets Value</p>
                                        <p className="text-lg fw-bold">
                                            {renderValue(formatPrice(state?.siteDetailViewItems?.AssetMasterDateRange?.assetValue), state.isShowLoader)}
                                            / {renderValue(formatPrice(state?.siteDetailViewItems?.AssetMaster?.assetValue))}
                                        </p>
                                    </div>}
                                    <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Services Due (1 month)</p>
                                        <p className="text-lg fw-bold">
                                            {renderValue(state?.siteDetailViewItems?.AssetMasterDateRange?.serviceDueCountOneMonth, state.isShowLoader)}
                                            /{renderValue(state?.siteDetailViewItems?.AssetMaster?.serviceDueCountOneMonth)}
                                        </p>
                                    </div>
                                    <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Overdue Services</p>
                                        <p className="text-lg fw-bold">
                                            {renderValue(state?.siteDetailViewItems?.AssetMasterDateRange?.overdueServicesCount, state.isShowLoader)}
                                            /{renderValue(state?.siteDetailViewItems?.AssetMaster?.overdueServicesCount)}
                                        </p>
                                    </div>
                                    <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Repairs/Broken Assets</p>
                                        <p className="text-lg fw-bold">
                                            {renderValue(state?.siteDetailViewItems?.AssetMasterDateRange?.repairsRequiredCount, state.isShowLoader)}
                                            /{renderValue(state?.siteDetailViewItems?.AssetMaster?.repairsRequiredCount)}</p>
                                    </div>
                                </div>
                            </div>}
                            {columnVisibility["Chemicals"] && <div className="card border-purple">
                                <div className="report-flex">
                                    <FontAwesomeIcon icon={faFlask} className="text-xl text-gray-500" />
                                    <h4 className="reports-subtitle">Chemicals</h4>
                                </div>
                                <div className="mt-2 space-y-1.5">
                                    <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Total Chemicals</p>
                                        <p className="fw-bold text-lg">
                                            {renderValue(state?.siteDetailViewItems?.SitesAssociatedChemicalDateRange?.totalChemicalCount, state.isShowLoader)}
                                            /{renderValue(state?.siteDetailViewItems?.SitesAssociatedChemical?.totalChemicalCount)}</p>
                                    </div>
                                    <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Expiring Soon (1 month)</p>
                                        <p className="text-lg fw-bold">
                                            {renderValue(state?.siteDetailViewItems?.SitesAssociatedChemicalDateRange?.expiringSoonCount, state.isShowLoader)}
                                            /{renderValue(state?.siteDetailViewItems?.SitesAssociatedChemical?.expiringSoonCount)}</p>
                                    </div>
                                    <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Expired</p>
                                        <p className="text-lg fw-bold">
                                            {renderValue(state?.siteDetailViewItems?.SitesAssociatedChemicalDateRange?.expiredCount, state.isShowLoader)}
                                            /{renderValue(state?.siteDetailViewItems?.SitesAssociatedChemical?.expiredCount)}</p>
                                    </div>
                                    <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Hazardous</p>
                                        <p className="text-lg fw-bold">
                                            {renderValue(state?.siteDetailViewItems?.SitesAssociatedChemicalDateRange?.hazardousCount, state.isShowLoader)}
                                            / {renderValue(state?.siteDetailViewItems?.SitesAssociatedChemical?.hazardousCount)}</p>
                                    </div>
                                    <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Non-Hazardous</p>
                                        <p className="text-lg fw-bold">
                                            {renderValue(state?.siteDetailViewItems?.SitesAssociatedChemicalDateRange?.nonHazardousCount, state.isShowLoader)}
                                            /{renderValue(state?.siteDetailViewItems?.SitesAssociatedChemical?.nonHazardousCount)}</p>
                                    </div>
                                </div>
                            </div>}
                        </div>
                    </div>
                    {columnVisibility["Quaysafe Modules"] && <div className="card border-green mb-3 page-break">
                        <h3 className="title mb-3">Quaysafe Modules</h3>

                        <div className={state.isGeneratePDF ? "dflexOnly" : "grid grid-cols-2"} >
                            <div className={state.isGeneratePDF ? "w50 space-y-2" : "space-y-2"} >
                                {columnVisibility["Toolbox Talks"] && <div className="flex items-start gap-2 rounded-lg border mb-3 bg-gray-50 p-2">
                                    <FontAwesomeIcon icon={faFileLines} className="text-base mt-0.5 text-blue-600" />
                                    <div>
                                        <p className="text-xs fw-bold text-gray-800">Toolbox Talks</p>
                                        <div className="mt-0.5 text-xs text-gray-600">
                                            <span className="font-medium text-blue-600">{renderValue(state?.siteDetailViewItems?.ToolboxTalkDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.ToolboxTalk?.totalCount || 0} Total</span> |{" "}
                                            <span className="font-medium text-green-600">{renderValue(state?.siteDetailViewItems?.ToolboxTalkDateRange?.submittedCount, state.isShowLoader)}/{state?.siteDetailViewItems?.ToolboxTalk?.submittedCount || 0} Submitted</span> |{" "}
                                            <span className="font-medium text-yellow-600">{renderValue(state?.siteDetailViewItems?.ToolboxTalkDateRange?.draftCount, state.isShowLoader)}/{state?.siteDetailViewItems?.ToolboxTalk?.draftCount || 0} Draft</span>

                                        </div>
                                    </div>
                                </div>}
                                {columnVisibility["Incident Reports"] && <div className="flex items-start gap-2 rounded-lg border mb-3 bg-gray-50 p-2">
                                    <FontAwesomeIcon icon={faTriangleExclamation} className="text-base mt-0.5 text-red-600" />
                                    <div>
                                        <p className="text-xs fw-bold text-gray-800">Incident Reports</p>
                                        <div className="mt-0.5 text-xs text-gray-600">
                                            <span className="font-medium text-blue-600">{renderValue(state?.siteDetailViewItems?.ToolboxIncidentDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.ToolboxIncident?.totalCount} Total</span> |{" "}
                                            <span className="font-medium text-green-600">{renderValue(state?.siteDetailViewItems?.ToolboxIncidentDateRange?.submittedCount, state.isShowLoader)}/{state?.siteDetailViewItems?.ToolboxIncident?.submittedCount} Submitted</span> | <span
                                                className="font-medium text-yellow-600">{renderValue(state?.siteDetailViewItems?.ToolboxIncidentDateRange?.draftCount, state.isShowLoader)}/{state?.siteDetailViewItems?.ToolboxIncident?.draftCount} Draft</span>

                                        </div>
                                    </div>
                                </div>}
                                {columnVisibility["Skill Matrix"] && <div className="flex items-start gap-2 rounded-lg border mb-3 bg-gray-50 p-2">
                                    <FontAwesomeIcon icon={faUserCheck} className="text-base mt-0.5 text-purple-600" />
                                    <div>
                                        <p className="text-xs fw-bold text-gray-800">Skill Matrix</p>
                                        <div className="mt-0.5 text-xs text-gray-600">
                                            <span className="font-medium text-blue-600">{renderValue(state?.siteDetailViewItems?.SkillMatrixDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.SkillMatrix?.totalCount} Total</span> |{" "}
                                            <span className="font-medium text-green-600">{renderValue(state?.siteDetailViewItems?.SkillMatrixDateRange?.submittedCount, state.isShowLoader)}/{state?.siteDetailViewItems?.SkillMatrix?.submittedCount} Submitted</span> |
                                            <span className="font-medium text-yellow-600">{renderValue(state?.siteDetailViewItems?.SkillMatrixDateRange?.draftCount, state.isShowLoader)}/{state?.siteDetailViewItems?.SkillMatrix?.draftCount} Draft</span>

                                        </div>
                                    </div>
                                </div>}
                                {columnVisibility["Workplace Inspection"] && <div className="flex items-start gap-2 rounded-lg border mb-3 bg-gray-50 p-2">
                                    <FontAwesomeIcon icon={faSquareCheck} className="text-base mt-0.5 text-teal-600" />
                                    <div>
                                        <p className="text-xs fw-bold text-gray-800">Workplace Inspection</p>
                                        <div className="mt-0.5 text-xs text-gray-600">
                                            <span className="font-medium text-blue-600">{renderValue(state?.siteDetailViewItems?.WorkplaceInspectionChecklistDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.WorkplaceInspectionChecklist?.totalCount} Total</span> |{" "}
                                            <span className="font-medium text-green-600">{renderValue(state?.siteDetailViewItems?.WorkplaceInspectionChecklistDateRange?.submittedCount, state.isShowLoader)}/{state?.siteDetailViewItems?.WorkplaceInspectionChecklist?.submittedCount} Submitted</span> | <span
                                                className="font-medium text-yellow-600">{renderValue(state?.siteDetailViewItems?.WorkplaceInspectionChecklistDateRange?.draftCount, state.isShowLoader)}/{state?.siteDetailViewItems?.WorkplaceInspectionChecklist?.draftCount} Draft</span>

                                        </div>
                                    </div>
                                </div>}
                            </div>
                            <div className={state.isGeneratePDF ? "w50 space-y-2" : "space-y-2"} >
                                {columnVisibility["Corrective Action"] && <div className="flex items-start gap-2 rounded-lg border mb-3 bg-gray-50 p-2">
                                    <FontAwesomeIcon icon={faSquareCheck} className="text-base mt-0.5 text-orange-600" />
                                    <div>
                                        <p className="text-xs fw-bold text-gray-800">Corrective Action</p>
                                        <div className="mt-0.5 text-xs text-gray-600">
                                            <span className="font-medium text-blue-600">{renderValue(state?.siteDetailViewItems?.CorrectiveActionReportDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.CorrectiveActionReport?.totalCount} Total</span> |{" "}
                                            <span className="font-medium text-green-600">{renderValue(state?.siteDetailViewItems?.CorrectiveActionReportDateRange?.submittedCount, state.isShowLoader)}/{state?.siteDetailViewItems?.CorrectiveActionReport?.submittedCount} Submited</span> | <span
                                                className="font-medium text-yellow-600">{renderValue(state?.siteDetailViewItems?.CorrectiveActionReportDateRange?.draftCount, state.isShowLoader)}/{state?.siteDetailViewItems?.CorrectiveActionReport?.draftCount} Draft</span>

                                        </div>
                                    </div>
                                </div>}
                                {columnVisibility["WHS Committee Inspection"] && <div className="flex items-start gap-2 rounded-lg border mb-3 bg-gray-50 p-2">
                                    <FontAwesomeIcon icon={faUsers} className="text-base mt-0.5 text-cyan-600" />
                                    <div>
                                        <p className="text-xs fw-bold text-gray-800">WHS Committee Inspection
                                        </p>
                                        <div className="mt-0.5 text-xs text-gray-600">
                                            <span className="font-medium text-blue-600">{renderValue(state?.siteDetailViewItems?.SiteSafetyAuditDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.SiteSafetyAudit?.totalCount} Total</span> |{" "}
                                            <span className="font-medium text-green-600">{renderValue(state?.siteDetailViewItems?.SiteSafetyAuditDateRange?.submittedCount, state.isShowLoader)}/{state?.siteDetailViewItems?.SiteSafetyAudit?.submittedCount} Submitted</span> | <span
                                                className="font-medium text-yellow-600">{renderValue(state?.siteDetailViewItems?.SiteSafetyAuditDateRange?.draftCount, state.isShowLoader)}/{state?.siteDetailViewItems?.SiteSafetyAudit?.draftCount} Draft</span>

                                        </div>
                                    </div>
                                </div>}
                                {columnVisibility["WHS Committee Meeting"] && <div className="flex items-start gap-2 rounded-lg border mb-3 bg-gray-50 p-2">
                                    <FontAwesomeIcon icon={faLaptop} className="text-base mt-0.5 text-indigo-600" />
                                    <div>
                                        <p className="text-xs fw-bold text-gray-800">WHS Committee Meeting</p>
                                        <div className="mt-0.5 text-xs text-gray-600">
                                            <span className="font-medium text-blue-600">{renderValue(state?.siteDetailViewItems?.WHSCommitteeMeetingDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.WHSCommitteeMeeting?.totalCount || 0} Total</span>

                                        </div>
                                    </div>
                                </div>}
                                {columnVisibility["WHS Committee Agenda"] && <div className="flex items-start gap-2 rounded-lg border mb-3 bg-gray-50 p-2">
                                    <FontAwesomeIcon icon={faListCheck} className="text-base mt-0.5 text-pink-600" />
                                    <div>
                                        <p className="text-xs fw-bold text-gray-800">WHS Committee Agenda</p>
                                        <div className="mt-0.5 text-xs text-gray-600">
                                            <span className="font-medium text-blue-600">{renderValue(state?.siteDetailViewItems?.WHSCommitteeMeetingAgendaDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.WHSCommitteeMeetingAgenda?.totalCount || 0} Total</span>
                                        </div>
                                    </div>
                                </div>}
                            </div>
                        </div>
                        <div className="mt-3 border-t mb-3 pt-2">
                            <p className="text-xs font-medium text-gray-800">Action Needed:</p>
                            <p className="mt-0.5 text-xs text-gray-600">Finalize drafts, verify checklist
                                completion, and escalate issues.</p>
                        </div>
                    </div>}
                    <div className="grid grid-cols-2 ">
                        {columnVisibility["Assigned Team"] && <div className="card border-teal">
                            <div className="report-flex">
                                <FontAwesomeIcon icon={faUserPlus} className="" />
                                <h4 className="reports-subtitle ">Assigned Team</h4>
                            </div>
                            <div className="mt-2 space-y-1.5">
                                <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Total Assigned Team</p>
                                    <p className="fw-bold text-lg">
                                        {renderValue(state?.siteDetailViewItems?.SitesAssociatedTeamDateRange?.totalCount, state.isShowLoader)}
                                        /{renderValue(state?.siteDetailViewItems?.SitesAssociatedTeam?.totalCount || 0)}
                                    </p>
                                </div>
                                {(state.siteDetailViewItems?.SitesAssociatedTeamDateRange?.atRoleGroup?.length > 0) &&
                                    state.isShowLoader ? <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin /> : state.siteDetailViewItems?.SitesAssociatedTeamDateRange?.atRoleGroup.map((i: any) => {
                                        let isOther = i.name == "Others"
                                        return <div className="d-flex-between py-3"> <p className="text-xs text-gray-600">{i?.name}</p>
                                            <p className="fw-bold text-lg">{i?.count}/

                                                {isOther ? state?.siteDetailViewItems?.SitesAssociatedTeam?.atRoleGroup?.filter((j: any) => j.name == "Others")?.length > 0 ? (state?.siteDetailViewItems?.SitesAssociatedTeam?.atRoleGroup as any)?.find((j: any) => j.name == "Others")?.count : 0 : <>
                                                    {state?.siteDetailViewItems?.SitesAssociatedTeam?.all?.filter((j: any) => j.name == i.name)?.length > 0 ? state?.siteDetailViewItems?.SitesAssociatedTeam?.all?.filter((j: any) => j.name == i.name)[0]?.count : 0}
                                                </>}
                                            </p>

                                        </div>
                                    })
                                }
                            </div>
                        </div>}
                        {(state?.siteDetailViewItems?.SitesMasterDetails?.helpDeskNeeded && columnVisibility["Help Desk"]) && (
                            <div className="card border-purple">
                                <div className="report-flex">
                                    <FontAwesomeIcon icon={faHeadset} className="text-2xl text-gray-600" />
                                    <h4 className="reports-subtitle">Help Desk</h4>
                                </div>
                                <div className="mt-2 space-y-1.5">
                                    <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Total Tickets</p>
                                        <p className="fw-bold text-lg">{renderValue(state?.siteDetailViewItems?.HelpDeskDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.HelpDesk?.totalCount || 0}</p>
                                    </div>
                                    <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Priority Low</p>
                                        <p className="text-lg fw-bold">{renderValue(state?.siteDetailViewItems?.HelpDeskDateRange?.lowCount, state.isShowLoader)}/{state?.siteDetailViewItems?.HelpDesk?.lowCount || 0}</p>
                                    </div>
                                    <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Priority Medium</p>
                                        <p className="text-lg fw-bold">{renderValue(state?.siteDetailViewItems?.HelpDeskDateRange?.mediumCount, state.isShowLoader)}/{state?.siteDetailViewItems?.HelpDesk?.mediumCount || 0}</p>
                                    </div>
                                    <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Priority High</p>
                                        <p className="text-lg fw-bold">{renderValue(state?.siteDetailViewItems?.HelpDeskDateRange?.highCount, state.isShowLoader)}/{state?.siteDetailViewItems?.HelpDesk?.highCount || 0}</p>
                                    </div>
                                    <div className="d-flex-between py-3">
                                        <p className="text-xs text-gray-600">Pending Tickets</p>
                                        <p className="text-lg fw-bold">{renderValue(state?.siteDetailViewItems?.HelpDeskDateRange?.pendingCount, state.isShowLoader)}/{state?.siteDetailViewItems?.HelpDesk?.pendingCount || 0}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        {columnVisibility["Document Library"] && <div className="card border-skyblue">
                            <div className="report-flex">
                                <FontAwesomeIcon icon={faBook} className="" />
                                <h4 className="reports-subtitle">Document Library</h4>
                            </div>
                            <div className="mt-2 space-y-1.5">
                                <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Files Available</p>
                                    <p className="fw-bold text-lg">
                                        {renderValue(state?.siteDetailViewItems?.SiteDocumentsDateRange?.totalCount, state.isShowLoader)}
                                        /{renderValue(state?.siteDetailViewItems?.SiteDocuments?.totalCount || 0)}</p>
                                </div>
                                <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Linked Documents</p>
                                    <p className="text-lg fw-bold">
                                        {renderValue(state?.siteDetailViewItems?.DocumentsLinkDateRange?.totalCount, state.isShowLoader)}
                                        /{renderValue(state?.siteDetailViewItems?.DocumentsLink?.totalCount || 0)}
                                    </p>
                                </div>
                                <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Linked URLs</p>
                                    <p className="text-lg fw-bold">
                                        {renderValue(state?.siteDetailViewItems?.URLLinkDateRange?.totalCount, state.isShowLoader)}
                                        /{renderValue(state?.siteDetailViewItems?.URLLink?.totalCount || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>}
                        {columnVisibility["Safety Culture"] && <div className="card border-purple">
                            <div className="report-flex">
                                <FontAwesomeIcon icon={faFileShield} className="" />
                                <h4 className="reports-subtitle">Safety Culture</h4>
                            </div>
                            <div className="mt-2 space-y-1.5">
                                <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Inspections</p>
                                    <p className="fw-bold text-lg">{renderValue(state?.siteDetailViewItems?.AuditInspectionDataDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.AuditInspectionData?.totalCount || 0}</p>
                                </div>
                                {/* <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Average Score</p>
                                    <p className="text-lg fw-bold">{renderValue(state?.siteDetailViewItems?.AuditInspectionData?.averageScore)}%</p>
                                </div>
                                <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Lowest Score</p>
                                    <p className="text-lg fw-bold">{renderValue(state?.siteDetailViewItems?.AuditInspectionData?.lowScore)}%</p>
                                </div>
                                <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Highest Score</p>
                                    <p className="text-lg fw-bold">{renderValue(state?.siteDetailViewItems?.AuditInspectionData?.highScore)}%</p>
                                </div> */}
                                <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Unique Inspectors</p>
                                    <p className="text-lg fw-bold">{renderValue(state?.siteDetailViewItems?.AuditInspectionDataDateRange?.OwnerCount, state.isShowLoader)}/{state?.siteDetailViewItems?.AuditInspectionData?.OwnerCount || 0}</p>
                                </div>
                            </div>
                        </div>}


                        {/* <div className="card border-teal">
                            <div className="report-flex">
                                <FontAwesomeIcon icon={faComments} className="" />
                                <h4 className="reports-subtitle"> Client Response</h4>
                            </div>
                            <div className="mt-2 space-y-1.5">
                                <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Total Records</p>
                                    <p className="fw-bold text-lg">{renderValue(state?.siteDetailViewItems?.ClientResponse?.totalCount)}</p>
                                </div>

                            </div>
                        </div> */}
                        {(state?.siteDetailViewItems?.SitesMasterDetails?.jobControlChecklist && columnVisibility["Site KPI's"]) && (<div className="card border-pink">
                            <div className="report-flex">
                                <FontAwesomeIcon icon={faListCheck} className="" />
                                <h4 className="reports-subtitle">Site KPI's</h4>
                            </div>
                            <div className="mt-2 space-y-1.5">
                                <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Total Entries</p>
                                    <p className="fw-bold text-lg">{renderValue(state?.siteDetailViewItems?.JobControlChecklistDetailsDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.JobControlChecklistDetails?.totalCount || 0}</p>
                                </div>
                                <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Not Yet Checked</p>
                                    <p className="text-lg fw-bold">{renderValue(state?.siteDetailViewItems?.JobControlChecklistDetailsDateRange?.notYetCheckedCount, state.isShowLoader)}/{state?.siteDetailViewItems?.JobControlChecklistDetails?.notYetCheckedCount || 0}</p>
                                </div>

                            </div>
                        </div>)}
                        {(state?.siteDetailViewItems?.SitesMasterDetails?.manageEvents && columnVisibility["Events"]) && (<div className="card border-orange">
                            <div className="report-flex">
                                <FontAwesomeIcon icon={faCalendarDay} className="" />
                                <h4 className="reports-subtitle">Events</h4>
                            </div>
                            <div className="mt-2 space-y-1.5">
                                <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Total Events Listed</p>
                                    <p className="fw-bold text-lg">{renderValue(state?.siteDetailViewItems?.EventMasterDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.EventMaster?.totalCount || 0}</p>
                                </div>
                                <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Upcoming Events</p>
                                    <p className="text-xs fw-bold">{renderValue(state?.siteDetailViewItems?.EventMasterDateRange?.eventDateTimeCount, state.isShowLoader)}/{state?.siteDetailViewItems?.EventMaster?.eventDateTimeCount || 0}</p>
                                </div>

                            </div>
                        </div>)}
                        {(state?.siteDetailViewItems?.SitesMasterDetails?.periodic && columnVisibility["Periodic Tasks"]) && (<div className="card border-gray">
                            <div className="report-flex">
                                <FontAwesomeIcon icon={faFileInvoice} className="" />
                                <h4 className="reports-subtitle">Periodic Tasks</h4>
                            </div>
                            <div className="mt-2 space-y-1.5">
                                <div className="d-flex-between py-3">
                                    <p className="text-xs text-gray-600">Total Records</p>
                                    <p className="fw-bold text-lg"> {renderValue(state?.siteDetailViewItems?.PeriodicDateRange?.totalCount, state.isShowLoader)}/{state?.siteDetailViewItems?.Periodic?.totalCount || 0}</p>
                                </div>
                            </div>
                        </div>)}
                    </div>
                </div>


            </div>
            {!state.isGeneratePDF && <div className="justifyright0  mt-10">
                <PrimaryButton text="Back" className="btnBack btn-danger"

                    onClick={() => {
                        if (!!props.redirectFrom) {
                            props.manageComponentView({
                                currentComponentName: ComponentNameEnum.SiteDetailGrid,
                            });
                        } else {
                            props.manageComponentView({
                                currentComponentName: ComponentNameEnum.AddNewSite,
                                dataObj: props?.dataObj,
                                siteName: props?.siteName,
                                IsSupervisor: props?.IsSupervisor,
                                qCState: props?.qCState,
                                MasterId: props?.siteMasterId,
                                siteNameId: props?.siteMasterId,
                                qCStateId: props?.componentProp?.dataObj?.StateId || props?.dataObj?.StateId,
                                siteMasterId: props?.siteMasterId,
                                breadCrumItems: props?.breadCrumItems,
                                pivotName: "Site Information",
                                isShowDetailOnly: true
                            });
                        }

                    }}
                />
            </div>}

        </div>
    </div >

};

export default SiteDetailView;

