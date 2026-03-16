import * as React from "react";
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DefaultButton, ITooltipHostStyles, Link, PrimaryButton, TooltipHost } from "@fluentui/react";
import { useId } from "@fluentui/react-hooks";
import { HazardChartDashboardData } from "./HazardChartDashboardData";
import { MultipleSiteFilter } from "../../../../../../Common/Filter/MultipleSiteFilter";
import { MultiStateFilter } from "../../../../../../Common/Filter/MultiStateFilter";
import { Loader } from "../../../CommonComponents/Loader";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { PreDateRangeFilterInspection } from "../../../../../../Common/Filter/PreDateRangeFilterInspection";
import ReportSendEmailPopup from "../../../CommonComponents/ReportSendEmailPopup";
import moment from "moment";
import { formatSPDateToLocal } from "../../../CommonComponents/CommonMethods";
import { HazardCountCards } from "../HazardReport/HazardCountCards";
import { MultipleHazardCountCards } from "./HazardListing/MultipleHazardCountCards";
import TabMenu from "../../../../../../Common/TabMenu";
import MultiStateTabMenu from "./HazardListing/MultiStateTabMenu";
import { ViewHazardFormDetail } from "../HazardReport/ViewHazardFormDetail";
import { HazardChartMenuEnum } from "../../../../../../Common/Enum/HazardFields";
const qcLogo = require('../../../../assets/images/hazardImages/hazard_qc-logo-long.png');
export interface ISystemUsageReportProps {
    loginUserRoleDetails: any;
}

const calloutProps = { gapSpace: 0 };
const hostStyles: Partial<ITooltipHostStyles> = { root: { display: 'inline-block', width: "100%" } };

export const HazardChartDashboard = (props: any) => {
    const {
        isCollapsed,
        state,
        isLoading,
        isFilterHide,
        toggleSidebar,
        menuItems,
        onClickLeftNavigation,
        onRenderComponent,
        provider,
        context,
        currentUserRoleDetail,
        onStateChange,
        handleSiteChange,
        handleDropdownChange,
        handleReset,
        handleSearch,
        onChangeRangeOption,
        onChangeToDate,
        onChangeFromDate,
        setState,
        generatePDF,
        isEmailPopupVisible,
        onclickSendEmailPopup,
        onClickSendEmail,
        emailState,
        hideEmailPopup,
        onChangeTitle,
        onChangeSendToEmail,
        onClickCancelEmailPopup,
        exportMenuProps,
        hazardCountCard,
        handleCardClick,
        showDetails
    } = HazardChartDashboardData(props);

    const tooltipId = useId('tooltip');

    const getDisplayName = () => {
        return state.selectedMenu?.DisplayName || "";
    };

    return (
        <div className="combineStateReport hazardChartsDashboard">
            {isLoading && <Loader />}
            <div style={{ display: 'flex' }} key={state.toggleKeyUpdate}>
                <div id="sidebarSys" className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                    <div>
                        <div className="toggle-btn" onClick={toggleSidebar}>
                            <FontAwesomeIcon
                                icon={!isCollapsed ? faAngleLeft : faAngleRight}
                                className="iconReport"
                            />
                        </div>
                        <ul>
                            {menuItems.map((item: any, index: any) => (
                                <li key={index}>
                                    <TooltipHost
                                        content={item.tooltip}
                                        id={tooltipId}
                                        calloutProps={calloutProps}
                                        styles={hostStyles}
                                    >
                                        <a
                                            onClick={() => onClickLeftNavigation(item.key, item.tooltip)}
                                            className={item.key === state.selectedMenu.key ? "active" : ""}
                                        >
                                            <FontAwesomeIcon icon={item.icon} className="iconReport" />
                                            <span>{item.label}</span>
                                        </a>
                                    </TooltipHost>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                {/* Sidebar End */}

                {/* Content Area */}
                {/* <div className="reportBoxCard flexCard"
                // style={{ width: 'calc(100% - 30px)' }}
                > */}

                <div className='reportBoxCard'>
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                            <h1 className="mainTitle">{getDisplayName()}</h1>
                        </div>
                        {(state.selectedMenu.key != HazardChartMenuEnum.Grid) && <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                            <div className='noExport pdf-email-btns'>
                                {state.filterhazardResponseItems?.length > 0 && <>
                                    <Link className="btn-back-ml-4 dticon">
                                        <TooltipHost content="Export options">
                                            <DefaultButton
                                                text="Export"
                                                iconProps={{ iconName: "Download", style: { color: "#ffffff" } }}
                                                menuProps={exportMenuProps}
                                                className="btn export-btn-primary"
                                            />
                                        </TooltipHost>
                                    </Link>
                                    <ReportSendEmailPopup
                                        isPopupVisible={isEmailPopupVisible}
                                        hidePopup={hideEmailPopup}
                                        title={emailState.title}
                                        sendToEmail={emailState.sendToEmail}
                                        onChangeTitle={onChangeTitle}
                                        onChangeSendToEmail={onChangeSendToEmail}
                                        displayerrortitle={emailState.displayErrorTitle}
                                        displayerroremail={emailState.displayErrorEmail}
                                        displayerror={emailState.displayError}
                                        onClickSendEmail={onClickSendEmail}
                                        onClickCancel={onClickCancelEmailPopup}
                                        onclickSendEmailPopup={onclickSendEmailPopup}
                                    />
                                </>
                                }
                                {/* <PrimaryButton
                                    text='PDF'
                                    className="btn btn-primary"
                                    iconProps={{ iconName: "PDF" }}
                                    onClick={() => {
                                        generatePDF()
                                    }}
                                /> */}
                            </div>
                        </div>}

                    </div>
                    <div className="ms-Grid-row mt-2">
                        {!showDetails && <div className="sysUsage-card droot">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                <MultipleHazardCountCards data={hazardCountCard.current} handleCardClick={handleCardClick} context={props.context} />
                            </div>
                            {/* {<div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl3">
                                <div className="formControl">
                                    <MultiStateFilter
                                        loginUserRoleDetails={currentUserRoleDetail}
                                        selectedState={state.selectedStatesId || []}
                                        onStateChange={onStateChange}
                                        provider={provider}
                                        isRequired={false}
                                        isClearable={true}
                                        placeholder={'Select State'}
                                    // key={state.allFilterKeyUpdate}
                                    />
                                </div>
                            </div>} */}
                            {/* <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl3">
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
                            </div> */}

                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 qc-row align-items-start mt-3">
                                <div className="qc-col qc-col-20 mb-3">
                                    <MultipleSiteFilter
                                        key={state.stateKeyUpdate}
                                        isClearable={true}
                                        isPermissionFiter={true}
                                        loginUserRoleDetails={currentUserRoleDetail}
                                        selectedSiteIds={state.selectedSiteIds || []}
                                        selectedSiteTitles={state.selectedSiteTitles || []}
                                        selectedSCSite={state.selectedSCSites || []}
                                        selectedState={state.selectedStatesId || []}
                                        onSiteChange={handleSiteChange}
                                        provider={provider}
                                        AllOption={false}
                                    />
                                </div>
                                <div className="qc-col qc-col-20 mb-3">
                                    <ReactDropdown
                                        options={state.SubHazardTypeOptions}
                                        isMultiSelect={true}
                                        defaultOption={state.selectedSubHazardType}
                                        onChange={(opts) => handleDropdownChange("selectedSubHazardType", opts, true)}
                                        isClearable
                                        placeholder="Select Sub Hazard"
                                    />
                                </div>
                                <div className="qc-col qc-col-20 mb-3">
                                    <ReactDropdown
                                        options={state.SubmittedByOptions}
                                        isMultiSelect={true}
                                        defaultOption={state.selectedSubmittedBy}
                                        onChange={(opt) => handleDropdownChange("selectedSubmittedBy", opt, true)}
                                        isClearable
                                        placeholder="Select Submitted By"
                                    />
                                </div>
                                <div className="qc-col qc-col-20 mb-3">
                                    <PreDateRangeFilterInspection
                                        fromDate={state.fromDate}
                                        toDate={state.toDate}
                                        onFromDateChange={onChangeFromDate}
                                        onToDateChange={onChangeToDate}
                                        onChangeRangeOption={onChangeRangeOption}
                                    />
                                </div>
                                <div className="qc-col qc-col-20 mb-3">
                                    <PrimaryButton
                                        text='Search'
                                        iconProps={{ iconName: "Search" }}
                                        className='btn btn-primary'
                                        onClick={handleSearch} />
                                    &nbsp;
                                    <DefaultButton
                                        text='Reset'
                                        iconProps={{ iconName: "Reset" }}
                                        className="btn btn-danger"
                                        onClick={handleReset} />
                                </div>
                            </div>
                            {/* <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl3">
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
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3 ms-xl3">
                                <div className="formControl">
                                    <ReactDropdown
                                        options={state.SubmittedByOptions}
                                        isMultiSelect={true}
                                        defaultOption={state.selectedSubmittedBy}
                                        onChange={(opt) => handleDropdownChange("selectedSubmittedBy", opt, true)}
                                        isClearable
                                        placeholder="Select Submitted By"
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3 ms-xl3">
                                <div className="formControl">
                                    <PreDateRangeFilterInspection
                                        fromDate={state.fromDate}
                                        toDate={state.toDate}
                                        onFromDateChange={onChangeFromDate}
                                        onToDateChange={onChangeToDate}
                                        onChangeRangeOption={onChangeRangeOption}
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg2 ms-xl2">
                                <div className="formControl">
                                    <PrimaryButton
                                        text='Search'
                                        iconProps={{ iconName: "Search" }}
                                        className='btn btn-primary'
                                        onClick={handleSearch} />
                                    &nbsp;
                                    <DefaultButton
                                        text='Reset'
                                        iconProps={{ iconName: "Reset" }}
                                        className="btn btn-danger"
                                        onClick={handleReset} />
                                </div>
                            </div> */}

                            {/* <div className="report-filter-btns">
                                <PrimaryButton
                                    text='Search'
                                    iconProps={{ iconName: "Search" }}
                                    className='btn btn-primary'
                                    onClick={handleSearch} />
                                &nbsp;
                                <DefaultButton
                                    text='Reset'
                                    iconProps={{ iconName: "Reset" }}
                                    className="btn btn-danger"
                                    onClick={handleReset} />
                            </div> */}
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 mb-2">
                                <MultiStateTabMenu
                                    stateMasterItems={state.stateTabData}
                                    selectedStateIds={state.selectedStatesId || []}
                                    onStateChange={onStateChange}
                                />

                            </div>
                        </div>
                        }
                        <div
                            id='reports-id'
                            className={"report-col-width"}
                        >
                            <div className="navHeader pdfShow" style={{ borderBottom: '1px solid #dddddd' }}>
                                <div className="pdfnavBrand" style={{ paddingBottom: '2px' }}>
                                    <div className="headerPDF">
                                        Hazard Report
                                    </div>
                                    <img src={qcLogo} alt="Quayclean logo" className="header-logo qclogoims" />

                                </div>
                            </div>
                            <div className="pdfShow">
                                <div className="hazard-report-header">
                                    <div>
                                        <strong>Generated Date:</strong> {formatSPDateToLocal(moment().toISOString(), true)}
                                    </div>
                                    <div>
                                        <strong>Generated By:</strong> {currentUserRoleDetail?.title || "Unknown"}
                                    </div>
                                </div>
                            </div>

                            {onRenderComponent()}

                        </div>
                    </div>

                </div>
            </div>
        </div >
    );
};