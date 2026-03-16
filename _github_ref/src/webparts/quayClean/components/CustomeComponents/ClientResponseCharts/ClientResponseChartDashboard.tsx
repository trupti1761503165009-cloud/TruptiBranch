import * as React from "react";
import { faAngleRight, faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DefaultButton, ITooltipHostStyles, Link, PrimaryButton, TooltipHost } from "@fluentui/react";
import { useId } from "@fluentui/react-hooks";
import moment from "moment";
import { ClientResponseChartDashboardData } from "./ClientResponseChartDashboardData";
import { PreDateRangeFilterInspection } from "../../../../../Common/Filter/PreDateRangeFilterInspection";
import { formatSPDateToLocal } from "../../CommonComponents/CommonMethods";
import { Loader } from "../../CommonComponents/Loader";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import ReportSendEmailPopup from "../../CommonComponents/ReportSendEmailPopup";
import MultiStateTabMenu from "../IMS/HazardReportCharts/HazardListing/MultiStateTabMenu";
import { ClientResponseChartMenuEnum, CRGridTitles } from "../QRClientResponse/ClientResponseFields";
import SiteCategoryTabs from "./SiteCategoryTab";
import { MultipleSiteFilterWithCategory } from "../../../../../Common/Filter/MultipleSiteFilterWithCategory";
import { MultipleCategoryCountCards } from "./MultipleCategoryCountCards";
const qcLogo = require('../../../assets/images/qc-logo-long.svg');
export interface ISystemUsageReportProps {
    loginUserRoleDetails: any;
}

const calloutProps = { gapSpace: 0 };
const hostStyles: Partial<ITooltipHostStyles> = { root: { display: 'inline-block', width: "100%" } };

export const ClientResponseChartDashboard = (props: any) => {
    const {
        isCollapsed,
        state,
        isLoading,
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
        isEmailPopupVisible,
        onclickSendEmailPopup,
        onClickSendEmail,
        emailState,
        hideEmailPopup,
        onChangeTitle,
        onChangeSendToEmail,
        onClickCancelEmailPopup,
        exportMenuProps,
        categoryCountCard,
        handleCardClick,
        showDetails
    } = ClientResponseChartDashboardData(props);

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

                <div className='reportBoxCard'>
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                            <h1 className="mainTitle">{getDisplayName()}</h1>
                        </div>
                        {(state.selectedMenu.key != ClientResponseChartMenuEnum.Grid) && <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                            <div className='noExport pdf-email-btns'>
                                {state.filterClientResponseItems?.length > 0 && <>
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
                            </div>
                        </div>}

                    </div>
                    <div className="ms-Grid-row mt-2">
                        {!showDetails && <div className="sysUsage-card droot">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                <SiteCategoryTabs
                                    tabData={state.SiteCategoryCardData}
                                    defaultCategoryId={state.selectedSiteCategoryId}
                                    onCategoryChange={(siteCategoryId) => {
                                        setState((prevState: any) => ({
                                            ...prevState,
                                            selectedSiteCategoryId: siteCategoryId,
                                            isRefresh: true,
                                            isCategoryChange: true,
                                            selectedReportedBy: [],
                                            selectedSubCategory: [],
                                            selectedCategory: [],
                                            selectedSiteIds: [],
                                        }));
                                    }}
                                />

                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                <MultipleCategoryCountCards
                                    data={categoryCountCard.current}
                                    handleCardClick={handleCardClick}
                                    selectedCards={state.selectedCategory}
                                    context={props.context} />
                            </div>

                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 qc-row align-items-start mt-3">
                                <div className="qc-col qc-col-20 mb-3">
                                    <MultipleSiteFilterWithCategory
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
                                        siteCategoryId={state.selectedSiteCategoryId}
                                    />
                                </div>
                                <div className="qc-col qc-col-20 mb-3">
                                    <ReactDropdown
                                        options={state.SubCategoryOptions}
                                        isMultiSelect={true}
                                        defaultOption={state.selectedSubCategory}
                                        onChange={(opts) => handleDropdownChange("selectedSubCategory", opts, true)}
                                        isClearable
                                        placeholder="Select Sub Category"
                                    />
                                </div>
                                <div className="qc-col qc-col-20 mb-3">
                                    <ReactDropdown
                                        options={state.ReportedByOptions}
                                        isMultiSelect={true}
                                        defaultOption={state.selectedReportedBy}
                                        onChange={(opt) => handleDropdownChange("selectedReportedBy", opt, true)}
                                        isClearable
                                        placeholder="Select Reported By"
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
                                        {CRGridTitles.ClientFeedbackReport}
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