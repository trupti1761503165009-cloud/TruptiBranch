import { faBuilding, faCircleCheck, faEllipsis, faFileExcel, faFilter } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { SiteDetailGridData } from "./SiteDetailGridData"
import { Loader } from "../../../CommonComponents/Loader"
import NoRecordFound from "../../../CommonComponents/NoRecordFound"
import { ISitesMasterGridDetails } from "../SiteDetailViewInterface"
import { DateRangeFilterDefault } from "../../../../../../Common/Filter/DateRangeFilterDefault"
import { StateFilter } from "../../../../../../Common/Filter/StateFilter"
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom"
import { useAtomValue } from "jotai"
import { SiteFilter } from "../../../../../../Common/Filter/SiteFilter"
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown"
import { Checkbox, DefaultButton, Label, Link, Panel, PrimaryButton, Stack, TooltipHost } from "@fluentui/react"
import { MultipleSiteFilter } from "../../../../../../Common/Filter/MultipleSiteFilter"
import { MultiStateFilter } from "../../../../../../Common/Filter/MultiStateFilter"
import { IQuayCleanState } from "../../../QuayClean"



export interface ISiteDetailGridProps {
    manageComponentView(componentProp: IQuayCleanState): any;

}
const buttonStyles = { root: { marginRight: 8 } };
const stackTokens = { childrenGap: 10 };
export const SiteDetailGrid = (props: ISiteDetailGridProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, currentUserRoleDetail } = appGlobalState;
    const { state,
        onChangeFromDate,
        onChangeRangeOption,
        onClickConfigureColumn,
        exportToExcel,
        onClickConfigureColumnSave,
        _onChangeConfigurationColumn,
        onClickDismissPanel,
        onStateChange,
        onClickCard,
        onClickApplyFilter,
        handleSiteChange,
        onChangeToDate,
        onClickRow,
        onChangeCategory,
        handlePagination,
        onClickHeader
    } = SiteDetailGridData(props);



    const onRenderFooterContent = () => {
        return <div>
            <PrimaryButton
                disabled={state.isConfigurationSaveDisable}
                className={state.isConfigurationSaveDisable ? "" : "btn btn-primary"}
                // className="btn btn-primary"
                styles={buttonStyles} onClick={onClickConfigureColumnSave}>
                Save
            </PrimaryButton>
            <PrimaryButton className="btn btn-danger" onClick={onClickDismissPanel} >Cancel</PrimaryButton>
        </div>


    }


    const returnValue = (value: number, isGettingSubList?: boolean, defaultValue?: string) => {
        let className = ""
        value = Number(value) || 0;
        if (value >= 5) {
            className = "badge-green";
        } else if (value >= 1 && value < 5) {
            className = "badge-yellow";
        } else if (value == 0) {
            className = "badge-red";
        }
        return isGettingSubList ? <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin /> : <span className={`table-couter-badge ${className}`}>{defaultValue ? defaultValue : value}</span>
    }
    const columnVisibility = state.configurationColumn.reduce((acc, col) => {
        acc[col.label] = col.value;
        return acc;
    }, {} as Record<string, boolean>);


    return <div className="siteDetailGrid boxcardSiteDetail">
        {state.isLoading && <Loader />}
        <Panel
            isOpen={state.isConfigurePanelOpen}
            onDismiss={onClickDismissPanel}
            headerText="Configure the Column"
            closeButtonAriaLabel="Close"
            onRenderFooterContent={onRenderFooterContent}
            // Stretch panel content to fill the available height so the footer is positioned
            // at the bottom of the page
            isFooterAtBottom={true}
        >
            <Label>Select Require Columns</Label>
            <Stack tokens={stackTokens}>
                {state.finalConfigurationColumn.map((i, index: number) => {
                    if (index == 0) {
                        return <Checkbox className="fwBold" label={i.label} onChange={(e: any, Checked?: boolean) => _onChangeConfigurationColumn(i.label, index, Checked)} checked={i.value} />
                    } else {
                        return <Checkbox label={i.label} onChange={(e: any, Checked?: boolean) => _onChangeConfigurationColumn(i.label, index, Checked)} checked={i.value} />
                    }

                })}
            </Stack>
        </Panel>
        <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <h1 className="fnt-30 fw-bold colorPrimary ">Site-wise Status and Resource Report</h1>

                    </div>

                    <div className="pageTopCount ">
                        <div
                            className={`card card1 ${state?.cards?.totalCount > 0 ? "cursorPointer" : ""}`}
                            onClick={state?.cards?.totalCount > 0 ? () => onClickCard("Total Sites") : undefined}
                        >
                            <div className="pattern1"></div>
                            <div className="card-content">
                                <div className="card-block-text">
                                    <h3>Total Sites</h3>
                                    <p className="card-number">{state?.cards?.totalCount || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`card card2 ${state?.cards?.blankSiteManagerCount > 0 ? "cursorPointer" : ""}`}
                            onClick={state?.cards?.blankSiteManagerCount > 0 ? () => onClickCard("Site Manager") : undefined}
                        >
                            <div className="pattern2"></div>
                            <div className="card-content">
                                {state.selectedCards == "Site Manager" && <FontAwesomeIcon icon={faFilter} className="fafilterColor" />}
                                <div className="card-block-text">
                                    <h3>Site Manager</h3>
                                    <p className="card-number">{state?.cards?.blankSiteManagerCount || 0} <span className="fsmall">Not configured</span></p>

                                </div>
                            </div>
                        </div>

                        <div
                            className={`card card3 ${state?.cards?.blankSiteSuperVisorCount > 0 ? "cursorPointer" : ""}`}
                            onClick={state?.cards?.blankSiteSuperVisorCount > 0 ? () => onClickCard("Site Supervisor") : undefined}
                        >
                            <div className="pattern3"></div>
                            <div className="card-content">
                                {state.selectedCards == "Site Supervisor" && <FontAwesomeIcon icon={faFilter} className="fafilterColor" />}
                                <div className="card-block-text">
                                    <h3>Site Supervisor</h3>
                                    <p className="card-number">{state?.cards?.blankSiteSuperVisorCount || 0}<span className="fsmall">Not configured</span></p>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`card card4 ${state?.cards?.blankClient > 0 ? "cursorPointer" : ""}`}
                            onClick={state?.cards?.blankClient > 0 ? () => onClickCard("Client") : undefined}
                        >
                            <div className="pattern4"></div>
                            <div className="card-content">
                                {state.selectedCards == "Client" && <FontAwesomeIcon icon={faFilter} className="fafilterColor" />}
                                <div className="card-block-text">
                                    <h3>Client</h3>
                                    <p className="card-number">{state?.cards?.blankClient || 0}<span className="fsmall">Not configured</span></p>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`card card5 ${state?.cards?.blankAssetCount > 0 ? "cursorPointer" : ""}`}
                            onClick={state?.cards?.blankAssetCount > 0 ? () => onClickCard("Asset") : undefined}
                        >
                            <div className="pattern5"></div>
                            <div className="card-content">
                                {state.selectedCards == "Asset" && <FontAwesomeIcon icon={faFilter} className="fafilterColor" />}
                                <div className="card-block-text">
                                    <h3>Asset</h3>
                                    <p className="card-number">{state?.cards?.blankAssetCount || 0}<span className="fsmall">Site with no assets</span></p>
                                </div>
                            </div>
                        </div>

                        <div
                            className={`card card6 ${state?.cards?.blankChemicalCount > 0 ? "cursorPointer" : ""}`}
                            onClick={state?.cards?.blankChemicalCount > 0 ? () => onClickCard("Chemical") : undefined}
                        >
                            <div className="pattern6"></div>
                            <div className="card-content">
                                {state.selectedCards == "Chemical" && <FontAwesomeIcon icon={faFilter} className="fafilterColor" />}
                                <div className="card-block-text">
                                    <h3>Chemical</h3>
                                    <p className="card-number">{state?.cards?.blankChemicalCount || 0}<span className="fsmall">Site with no Chemical</span></p>
                                </div>
                            </div>
                        </div>


                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 dashCard">


                        <div className="">
                            <MultiStateFilter
                                key={state.stateRenderKeyUpdate}
                                loginUserRoleDetails={currentUserRoleDetail}
                                selectedState={state.selectedStatesId || []}
                                onStateChange={onStateChange}
                                provider={provider}
                                isRequired={false}
                                isClearable={true}
                            // key={state.allFilterKeyUpdate}
                            />
                        </div>
                        <div className="">
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
                        <div className="">
                            <ReactDropdown
                                defaultOption={state?.selectedCategory || []}
                                options={state.siteCategoryOptions || []}
                                isMultiSelect={true}
                                onChange={onChangeCategory}
                                placeholder="Select the Category" />
                        </div>

                        <div className="">
                            <DateRangeFilterDefault
                                onFromDateChange={onChangeFromDate}
                                onToDateChange={onChangeToDate}
                                onChangeRangeOption={onChangeRangeOption}
                                isHideWidth={true}
                                isClearable={false}
                                fromDate={state.fromDate}
                                selectedOption={state.selectedDateRangeItem}
                                toDate={state.toDate}
                            />
                        </div>
                        <div className="">
                            <PrimaryButton iconProps={{ iconName: "Filter" }} text="Apply"
                                className={(state.isApplyFilterDisable == true) ? "" : "btnBack  btn-primary"}
                                disabled={state.isApplyFilterDisable == true}
                                onClick={onClickApplyFilter}
                            />
                        </div>
                        <div className="config-icon">
                            {/* {state.isGettingSubList == false && <Link className=" btnView dticon" target="_blank" rel="noopenernoreferrer"
                                onClick={exportToExcel}
                            >
                                <TooltipHost
                                    content={"Download Excel"}
                                >
                                    <FontAwesomeIcon className="quickImg  excel-icon" icon={faFileExcel} />
                                </TooltipHost>
                            </Link>}
                            <Link className=" btnView dticon" target="_blank" rel="noopenernoreferrer"
                                onClick={onClickConfigureColumn}
                            >
                                <TooltipHost
                                    content={"Configure the Hide Show Column"}
                                >
                                    <FontAwesomeIcon className="quickImg  configColumn-icon" icon={faTableCellsColumnLock} />
                                </TooltipHost>
                            </Link> */}
                            {state.isGettingSubList == false &&
                                <TooltipHost
                                    content={"Download Excel"}
                                >
                                    <PrimaryButton
                                        iconProps={{ iconName: "ExcelLogo" }}
                                        className="btn btn-primary"
                                        onClick={exportToExcel}
                                        text="Excel"
                                    />
                                </TooltipHost>
                            }
                            <TooltipHost
                                content={"Configure the Hide Show Column"}
                            >
                                <PrimaryButton
                                    iconProps={{ iconName: "Settings" }}
                                    className="btn btn-primary ml-10"
                                    onClick={onClickConfigureColumn}
                                    text="Column"
                                />
                            </TooltipHost>
                            {/* <Link className=" btnView dticon" target="_blank" rel="noopenernoreferrer"
                                onClick={onClickConfigureColumn}
                            >
                                <TooltipHost
                                    content={"Configure the Hide Show Column"}
                                >
                                    <FontAwesomeIcon className="quickImg  configColumn-icon" icon={faTableCellsColumnLock} />
                                </TooltipHost>
                            </Link> */}
                        </div>
                    </div>
                    <div >
                        <div className={window.innerWidth > 768 ? "siteGrid-dflex" : "inspection-Grid-top"}>
                            <div className="record-info Count-inspection">
                                {`Showing ${state.currentPage === 1 ? 1 : (state.currentPage - 1) * state.itemsPerPage + 1} to ${Math.min(state.currentPage * state.itemsPerPage, state.filterItems?.length)} of ${state.filterItems?.length} records`}
                            </div>
                            <button
                                className="inspection-grid-dflex"
                                onClick={() => handlePagination(state.currentPage - 1)}
                                disabled={state.currentPage === 1}
                            >
                                Prev
                            </button>
                            <span className="pag-page-lbl">{` Page ${state.currentPage} `}</span>
                            <button
                                className="pag-btn"
                                onClick={() => handlePagination(state.currentPage + 1)}
                                disabled={state.currentPage === Math.ceil(state.filterItems?.length / state.itemsPerPage)}
                            >
                                Next
                            </button>



                        </div>

                    </div>

                    <div className="overflow-x-auto" >
                        <div className="rounded-lg border border-border-light shadow-sm">
                            <table className="dash-table">
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th className="w-48 sticky-left cursorPointer" onClick={() => onClickHeader("name")}><span className="first-cell">Site Name   {state?.sortingColumn?.key == "name" ? (!state.sortingColumn.isSorted ? <FontAwesomeIcon icon='sort-up' /> : <FontAwesomeIcon icon='sort-down' />) : <FontAwesomeIcon icon='sort' />}</span></th>
                                        <th onClick={() => onClickHeader("state")}>State {state?.sortingColumn?.key == "state" ? (!state.sortingColumn.isSorted ? <FontAwesomeIcon icon='sort-up' /> : <FontAwesomeIcon icon='sort-down' />) : <FontAwesomeIcon icon='sort' />}</th>
                                        {columnVisibility["Job Code"] && <th onClick={() => onClickHeader("jobCode")}>Job Code {state?.sortingColumn?.key == "jobCode" ? (!state.sortingColumn.isSorted ? <FontAwesomeIcon icon='sort-up' /> : <FontAwesomeIcon icon='sort-down' />) : <FontAwesomeIcon icon='sort' />}</th>}
                                        {columnVisibility["Site Manager"] && <th>Site Manager</th>}
                                        {columnVisibility["Dynamic Site Manager"] && <th>Dynamic Site Manager</th>}
                                        {columnVisibility["Site Supervisor"] && <th>Site Supervisor</th>}
                                        {columnVisibility["Client"] && <th>Client</th>}
                                        {columnVisibility["Assets"] && <th>Assets</th>}
                                        {columnVisibility["Chemicals"] && <th>Chemicals</th>}
                                        {columnVisibility["Assigned Team"] && <th>Assigned Team</th>}
                                        {columnVisibility["Toolbox Talks"] && <th>Toolbox Talks</th>}
                                        {columnVisibility["Incident Reports"] && <th>Incident Reports</th>}
                                        {columnVisibility["Skill Matrix"] && <th>Skill Matrix</th>}
                                        {columnVisibility["Corrective Action"] && <th>Corrective Action</th>}
                                        {columnVisibility["Workplace Inspection"] && <th>Workplace Inspection</th>}
                                        {columnVisibility["WHS Committee Inspection"] && <th>WHS Committee Inspection</th>}
                                        {columnVisibility["WHS Committee Meeting"] && <th>WHS Committee Meeting</th>}
                                        {columnVisibility["WHS Committee Agenda"] && <th>WHS Committee Agenda</th>}
                                        {columnVisibility["Documents"] && <th>Documents</th>}
                                        {columnVisibility["Safety Culture"] && <th>Safety Culture</th>}
                                        {columnVisibility["Periodic Tasks"] && <th>Periodic Tasks</th>}
                                        {columnVisibility["Help Desk"] && <th>Help Desk</th>}
                                        {columnVisibility["Site KPI's"] && <th>Site KPI's</th>}
                                        {columnVisibility["Events"] && <th>Events</th>}
                                        {columnVisibility["Client Response"] && <th>Client Response</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light dark:divide-border-dark" key={state.keyUpdate}>
                                    {state.pageItems.length > 0 ?
                                        state.pageItems.map((i: ISitesMasterGridDetails) => {
                                            return <tr className="clsPointer" onClick={() => onClickRow(i)}>
                                                <td className="sticky-left">
                                                    <Link className="actionBtn btnGray  dticon"
                                                        onClick={() => onClickRow(i)}
                                                    >
                                                        <TooltipHost
                                                            content={"Run Site Audit Report"}
                                                        >
                                                            {/* <FontAwesomeIcon icon={faChartBar} /> */}
                                                            <img src={require('../../../../assets/images/SiteAuditReport.png')} className="siteAuditIcon" />
                                                        </TooltipHost>
                                                    </Link>

                                                </td>
                                                <td className="sticky-left px-4 py-3 text-sm font-medium dark:text-foreground-dark dark:bg-subtle-dark "><span className="first-cell"> <Link>{i.name}</Link></span></td>     {/*Site Name */}
                                                <td className="px-4 py-3 text-sm"><span className=" ">{i.state}</span></td> {/*State */}
                                                {columnVisibility["Job Code"] && <td className="px-4 py-3 text-sm "><span className={`table-couter-badge  ${!!i.jobCode ? "badge-green" : "badge-red"}`}>{!!i.jobCode ? "Yes" : "No"}</span></td>} {/*Job Code */}
                                                {columnVisibility["Site Manager"] && <td>{returnValue(i?.siteManagerId?.length)}</td>}
                                                {columnVisibility["Dynamic Site Manager"] && <td>{returnValue(!!i?.dynamicSiteManagerId ? 1 : 0)}</td>}
                                                {columnVisibility["Site Supervisor"] && <td>{returnValue(i?.siteSupervisorId?.length)}</td>}
                                                {columnVisibility["Client"] && <td>{returnValue(i?.adClientId?.length)}</td>}
                                                {columnVisibility["Assets"] && <td>{returnValue(i?.AssetMaster?.totalAssetsCount)}</td>}
                                                {columnVisibility["Chemicals"] && <td>{returnValue(i?.SitesAssociatedChemical?.totalChemicalCount)}</td>}
                                                {columnVisibility["Assigned Team"] && <td>{returnValue(i?.SitesAssociatedTeam?.totalCount, state.isGettingSubList)}</td>}
                                                {columnVisibility["Toolbox Talks"] && <td>{returnValue(i?.ToolboxTalk?.totalCount, state.isGettingSubList)}</td>}
                                                {columnVisibility["Incident Reports"] && <td>{returnValue(i?.ToolboxIncident?.totalCount, state.isGettingSubList)}</td>}
                                                {columnVisibility["Skill Matrix"] && <td>{returnValue(i?.SkillMatrix?.totalCount, state.isGettingSubList)}</td>}
                                                {columnVisibility["Corrective Action"] && <td>{returnValue(i?.CorrectiveActionReport?.totalCount, state.isGettingSubList)}</td>}
                                                {columnVisibility["Workplace Inspection"] && <td>{returnValue(i?.WorkplaceInspectionChecklist?.totalCount, state.isGettingSubList)}</td>}
                                                {columnVisibility["WHS Committee Inspection"] && <td>{returnValue(i?.SiteSafetyAudit?.totalCount, state.isGettingSubList)}</td>}
                                                {columnVisibility["WHS Committee Meeting"] && <td>{returnValue(i?.WHSCommitteeMeeting?.totalCount, state.isGettingSubList)}</td>}
                                                {columnVisibility["WHS Committee Agenda"] && <td>{returnValue(i?.WHSCommitteeMeetingAgenda?.totalCount, state.isGettingSubList)}</td>}
                                                {columnVisibility["Documents"] && <td>{returnValue((i?.SiteDocuments?.totalCount || 0) + (i?.URLLink?.totalCount || 0) + (i?.DocumentsLink?.totalCount || 0), state.isGettingSubList)}</td>}
                                                {columnVisibility["Safety Culture"] && <td>{returnValue(i?.AuditInspectionData?.totalCount, state.isGettingSubList)}</td>}
                                                {columnVisibility["Periodic Tasks"] && <td>{returnValue(i?.Periodic?.totalCount, state.isGettingSubList, i.periodic == false ? "N/A" : undefined)}</td>}
                                                {columnVisibility["Help Desk"] && <td>{returnValue(i?.HelpDesk?.totalCount, state.isGettingSubList, i.helpDeskNeeded == false ? "N/A" : undefined)}</td>}
                                                {columnVisibility["Site KPI's"] && <td>{returnValue(i?.JobControlChecklistDetails?.totalCount, state.isGettingSubList, i.jobControlChecklist == false ? "N/A" : undefined)}</td>}
                                                {columnVisibility["Events"] && <td>{returnValue(i?.EventMaster?.totalCount, state.isGettingSubList, i.manageEvents == false ? "N/A" : undefined)}</td>}
                                                {columnVisibility["Client Response"] && <td>{returnValue(i?.ClientResponse?.totalCount, state.isGettingSubList, i.clientResponse == false ? "N/A" : undefined)}</td>}

                                            </tr>

                                        })
                                        :
                                        <tr>
                                            <td colSpan={24}>
                                                <NoRecordFound />
                                            </td>
                                        </tr>
                                    }

                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div style={{ marginBottom: "50px" }}>
                        <div className={window.innerWidth > 768 ? "siteGrid-dflex" : "inspection-Grid-top"}>
                            <div className="record-info Count-inspection">
                                {`Showing ${state.currentPage === 1 ? 1 : (state.currentPage - 1) * state.itemsPerPage + 1} to ${Math.min(state.currentPage * state.itemsPerPage, state.filterItems?.length)} of ${state.filterItems?.length} records`}
                            </div>
                            <button
                                className="inspection-grid-dflex"
                                onClick={() => handlePagination(state.currentPage - 1)}
                                disabled={state.currentPage === 1}
                            >
                                Prev
                            </button>
                            <span className="pag-page-lbl">{` Page ${state.currentPage} `}</span>
                            <button
                                className="pag-btn"
                                onClick={() => handlePagination(state.currentPage + 1)}
                                disabled={state.currentPage === Math.ceil(state.filterItems?.length / state.itemsPerPage)}
                            >
                                Next
                            </button>



                        </div>

                    </div>

                </div>
            </div>
        </main>

    </div>
}