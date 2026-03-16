import React from "react"
import { IReportSites, IReportState, IReportsTopSites, IReportUserActivityLog } from "../IReport";
import { TopLowSitesData } from "./TopLowSitesData";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { systemUsageReportWidthPrint, TopLowReportCardOption, TopSiteLoadOptions, TopUserActivityByOptions } from "../../../../../../Common/Constants/CommonConstants";
import { Link, PrimaryButton } from "@fluentui/react";
import { CombinedUsageStateChart } from "../CombineStateReport/CombinedUsageStateChart";
import { TopLowStateChart } from "./TopLowStateChart";
import { TopLowSitesChart } from "./TopLowSitesChart";
import { TopLowSitesCard } from "./TopLowSitesCard";
import CommonPopup from "../../../CommonComponents/CommonSendEmailPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loader } from "../../../CommonComponents/Loader";
import { SummeryCard } from "../SummeryCard";

export interface ITopLowSitesProps {
    stateItems: IReportState[];
    siteItems: IReportSites[];
    userActivityLogItems: IReportUserActivityLog[];
    filterState?: any[];
    filterSites?: any[];
    filterUser?: any[];
    filterEntityType?: any[];
    filterActionType?: any[];

    startDate: any;
    endDate: any;
    isStateViewOnly?: boolean;
    isExpandDisable?: boolean;
    isBottomSites?: boolean;
    isDashboardView?: boolean;
    isGenratePdf?: boolean;
    onChangeShowNumber?(countNumber: any, isBottomSites: boolean): void;
    excelFileName?: string;
}


export const TopLowSites = (props: ITopLowSitesProps) => {
    const mainProps = props;
    const { state, onClickRow,
        onClickDownload,
        onClickCancel,
        onChangeTitle,
        onClickSendEmail,
        onClickShowEmailModel,
        onChangeSendToEmail,
        onChangeLoadSiteOption, onChangeUserReportBy, generateExcelTable, generateExcelStateSiteActivityReport } = TopLowSitesData(props);

    const renderRows = (
        nodes: IReportsTopSites[],
        indent = 0,
        onClickRow: any
    ) => {
        return nodes.map((node: any, index: number) => (
            <SiteRow
                key={index}
                label={index}
                siteName={node?.site || ""}
                activityCount={node?.count || ""}
                stateName={node?.stateName}
                indent={indent}
                expandable={props.isExpandDisable ? false : (node.isExpandable || node.isLastLevel)}
                defaultExpanded={node.defaultExpanded}
                onClickRow={onClickRow}
                item={node?.item || ""}
                isLastLevel={node?.isLastLevel} // 👈 pass flag
            >
                {(node?.children && !node?.isLastLevel) ? (
                    renderRows(node?.children, indent + 1, onClickRow)
                ) : node?.isLastLevel ? ( // 👈 check flag
                    <tr>
                        <td colSpan={7} style={{ paddingLeft: `${(indent + 1) * 16 + 16}px`, paddingTop: "10px", paddingBottom: "10px", paddingRight: "10px" }}>
                            {/* Dummy Grid */}
                            <table className="sites-table sub-Grid-table" >
                                <thead>
                                    <tr className=" subGrid">
                                        <th className="site-cell padding-6">Entity Type</th>
                                        <th className="site-cell padding-6">Entity Name</th>
                                        <th className="site-cell padding-6">Details</th>
                                        <th className="site-cell padding-6">User Name</th>
                                        <th className="site-cell padding-6">Action Type</th>
                                        <th className="site-cell padding-6">Site Name</th>
                                        <th className="site-cell padding-6">Time Stamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {node?.items?.length > 0 ?
                                        node?.items.map((j: any) => {
                                            return <tr className="site-row">
                                                <td className="site-cell padding-6">{j?.EntityType}</td>
                                                <td className="site-cell padding-6">{j?.EntityName}</td>
                                                <td className="site-cell padding-6">{j?.Details}</td>
                                                <td className="site-cell padding-6">{j?.UserName}</td>
                                                <td className="site-cell padding-6">{j?.ActionType}</td>
                                                <td className="site-cell padding-6">{j?.SiteName}</td>
                                                <td className="site-cell padding-6">{j?.Created}</td>
                                            </tr>

                                        })
                                        :

                                        <tr><td colSpan={7}> <NoRecordFound /></td></tr>
                                    }
                                </tbody>
                            </table>
                        </td>
                    </tr>
                ) : (
                    <NoRecordFound />
                )}
            </SiteRow>
        ));
    };

    const SiteRow = (props: any) => {
        const [expanded, setExpanded] = React.useState(props?.defaultExpanded);

        return (
            <>
                <tr
                    className={`site-row siteLevel${props.indent} ${props.expandable ? "" : "cursorDefault"}`}
                    onClick={
                        props?.expandable
                            ? () => setExpanded(!expanded)
                            : () => !!props.onClickRow && props.onClickRow(props)
                    }
                    data-indent={props?.indent}
                >
                    <td
                        className={`site-cell ${expanded ? "expanded" : ""}`}
                        // style={{ paddingLeft: `${props.indent * 16 + 16 + (props.expandable ? 0 : 17)}px` }}
                        style={{ paddingLeft: !mainProps.isExpandDisable ? `${props.indent * 16 + 16 + (props.expandable ? 0 : 17)}px` : '' }}
                    >
                        {props?.expandable && <span>{expanded ? "▼" : "▶"} </span>}
                        {props?.siteName}
                    </td>
                    <td className="site-cell">{props?.stateName}</td>
                    <td className="site-cell">{props?.activityCount}</td>

                </tr>
                {expanded && props?.children}
            </>
        );
    };

    const stateRenderRows = (
        nodes: IReportsTopSites[],
        indent = 0,
        onClickRow: any
    ) => {
        return nodes.map((node: any, index: number) => (
            <StateSiteRow
                key={index}
                label={node.state}
                siteName={node?.sitesCount || ""}
                activityCount={node?.count || ""}
                stateName={node?.stateName}
                indent={indent}
                // expandable={!!node.children || node.isLastLevel} 
                expandable={(props.isExpandDisable || props.isStateViewOnly) ? false : (node.isExpandable || node.isLastLevel)}
                defaultExpanded={node.defaultExpanded}
                onClickRow={onClickRow}
                item={node?.item || ""}
                isLastLevel={node?.isLastLevel} // 👈 pass flag
            >
                {(node?.children && !node?.isLastLevel) ? (
                    stateRenderRows(node?.children, indent + 1, onClickRow)
                ) : node?.isLastLevel ? ( // 👈 check flag
                    <tr>
                        <td colSpan={7} style={{ paddingLeft: `${(indent + 1) * 16 + 16}px`, paddingTop: "10px", paddingBottom: "10px", paddingRight: "10px" }}>
                            {/* Dummy Grid */}
                            <table className="sites-table sub-Grid-table" >
                                <thead>
                                    <tr className=" subGrid">
                                        <th className="site-cell padding-6">Entity Type</th>
                                        <th className="site-cell padding-6">Entity Name</th>
                                        <th className="site-cell padding-6">Details</th>
                                        <th className="site-cell padding-6">User Name</th>
                                        <th className="site-cell padding-6">Action Type</th>
                                        <th className="site-cell padding-6">Site Name</th>
                                        <th className="site-cell padding-6">Time Stamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {node?.items?.length > 0 ?
                                        node?.items.map((j: any) => {
                                            return <tr className="site-row">
                                                <td className="site-cell padding-6">{j?.EntityType}</td>
                                                <td className="site-cell padding-6">{j?.EntityName}</td>
                                                <td className="site-cell padding-6">{j?.Details}</td>
                                                <td className="site-cell padding-6">{j?.UserName}</td>
                                                <td className="site-cell padding-6">{j?.ActionType}</td>
                                                <td className="site-cell padding-6">{j?.SiteName}</td>
                                                <td className="site-cell padding-6">{j?.Created}</td>
                                            </tr>

                                        })
                                        :

                                        <tr><td colSpan={7}> <NoRecordFound /></td></tr>
                                    }
                                </tbody>
                            </table>
                        </td>
                    </tr>
                ) : (
                    <NoRecordFound />
                )}
            </StateSiteRow>
        ));
    };

    const StateSiteRow = (props: any) => {
        const [expanded, setExpanded] = React.useState(props?.defaultExpanded);

        return (
            <>
                <tr
                    className={`site-row siteLevel${props.indent} ${props.expandable ? "" : "cursorDefault"}`}

                    onClick={
                        props?.expandable
                            ? () => setExpanded(!expanded)
                            : () => !!props.onClickRow && props.onClickRow(props)
                    }
                    data-indent={props?.indent}
                >
                    <td
                        className={`site-cell ${expanded ? "expanded" : ""}`}
                        // style={{ paddingLeft: `${props.indent * 16 + 16 + (props.expandable ? 0 : 17)}px` }}
                        style={{ paddingLeft: !mainProps.isExpandDisable ? `${props.indent * 16 + 16 + (props.expandable ? 0 : 17)}px` : '' }}
                    >
                        {props?.expandable && <span>{expanded ? "▼" : "▶"} </span>}
                        {props?.label}
                    </td>
                    <td className="site-cell">{props?.siteName}</td>

                    <td className="site-cell">{props?.activityCount}</td>

                </tr>
                {expanded && props?.children}
            </>
        );
    };

    return <div className="systemLevel" >
        <div className="ms-Grid-row ">
            {state.isLoading && <Loader />}
            {!props.isDashboardView && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dflex mt-2 mb-2">
                <div className="mla">
                    <CommonPopup
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
                    <PrimaryButton className="btn btn-primary mla " onClick={onClickDownload}>
                        <FontAwesomeIcon icon="download" className="clsbtnat" /><div>PDF</div>
                    </PrimaryButton>
                </div>
            </div>}
            <div id="topLowSites">
                {(!props.isDashboardView && state.isGenratePDF) && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 sysUsage-cardNo">
                    <SummeryCard
                        stateNames={props.filterState || []}
                        siteName={props.filterSites || []}
                        entityType={props.filterEntityType || []}
                        actionType={props.filterActionType || []}
                        users={props.filterUser || []}
                        stateDate={props.startDate}
                        endDate={props.endDate}
                    />
                </div>}
                {!props.isDashboardView && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                    {state.selectedUserReportBy == "State" ?
                        (state.filteredCardsState?.length > 0 && <TopLowSitesCard data={state?.totalStateCount} cardsArray={state.filteredCardsState || []} />)
                        :
                        (state.filteredCards?.length > 0 &&
                            <TopLowSitesCard data={state?.totalSitesStateCount} cardsArray={state.filteredCards || []} />)

                    }
                </div>}
                {/* {state.siteViceTopLowItems.length > 0 &&
                !props.isDashboardView && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                    <div className="justifyright0 sysUsage-cardNo ">
                        <PrimaryButton text="Export to excel" className="btn btn-primary pb-10" iconProps={{ iconName: "ExcelLogo" }} onClick={() => state.selectedUserReportBy == "Sites" ? generateExcelTable() : generateExcelStateSiteActivityReport()} />
                    </div>
                </div>} */}

                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                    {!state.isGenratePDF && <div className="dflex justifyContentBetween">
                        {state.siteViceTopLowItems.length > 0 ?
                            !props.isDashboardView ? <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                <div className="">
                                    <PrimaryButton text="Export to excel" className="btn btn-primary pb-10" iconProps={{ iconName: "ExcelLogo" }} onClick={() => state.selectedUserReportBy == "Sites" ? generateExcelTable() : generateExcelStateSiteActivityReport()} />
                                </div>
                            </div> : <>&nbsp;</> : <>&nbsp;</>}
                        {!props.isStateViewOnly && <div className="dflex">
                            <div className="mr-10 userReportByWidth">
                                <ReactDropdown options={TopUserActivityByOptions || []}
                                    defaultOption={state.selectedUserReportBy || ""}
                                    onChange={onChangeUserReportBy}
                                    isMultiSelect={false} />
                            </div>
                            <div className="userReportNumber">
                                <ReactDropdown options={TopSiteLoadOptions || []}
                                    defaultOption={state.selectedLoadSiteNumber || ""}
                                    onChange={onChangeLoadSiteOption}
                                    isMultiSelect={false} />
                            </div>

                        </div>}
                    </div>}
                    {/* {!state.isGenratePdf && (state.selectedUserReportBy == "State" ? <TopLowStateChart chartData={state.stateViceTopLowItems} />
                    : <TopLowSitesChart chartData={state.siteViceTopLowItems} />)}

                {state.isGenratePdf && (state.selectedUserReportBy == "State" ? <TopLowStateChart chartData={state.stateViceTopLowItems} width={systemUsageReportWidthPrint} isGenratePdf={true} />
                    : <TopLowSitesChart chartData={state.siteViceTopLowItems} width={systemUsageReportWidthPrint} isGenratePdf={true} />)} */}


                    {state.selectedUserReportBy === "State" ? (
                        <TopLowStateChart
                            chartData={state.stateViceTopLowItems}
                            {...(state.isGenratePDF && {
                                width: systemUsageReportWidthPrint,
                                isGenratePdf: true,
                            })}
                        />
                    ) : (
                        <TopLowSitesChart
                            chartData={state.siteViceTopLowItems}
                            {...(state.isGenratePDF && {
                                width: systemUsageReportWidthPrint,
                                isGenratePdf: true,
                            })}
                        />
                    )}

                </div>
                {!props.isDashboardView && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 page-break">
                    <div className="table-container sysUsage-card">

                        <div className={state.isGenratePDF ? "" : "systemUseTableHeight mt-3"} >
                            {state.selectedUserReportBy == "Sites" ?
                                <table className="sites-table ">
                                    <thead>
                                        <tr className="systemUse ">
                                            <th className="site-cell">Sites</th>
                                            <th className="site-cell">State</th>
                                            <th className="site-cell">Activity Count</th>
                                            {/* <th className="site-cell">Average Login Day</th>
                                    <th className="site-cell">Top Interactions</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <>
                                            {state.siteViceTopLowItems.length > 0 ?
                                                <>
                                                    {renderRows(state.siteViceTopLowItems, 0, onClickRow)}
                                                </>

                                                : <tr> <td colSpan={5}> <NoRecordFound /></td></tr>}
                                        </>
                                    </tbody>
                                </table>
                                :
                                <>
                                    <table className="sites-table ">
                                        <thead>
                                            <tr className="systemUse ">
                                                <th className="site-cell">State</th>
                                                <th className="site-cell">Sites Count</th>
                                                <th className="site-cell">Activity Count</th>
                                                {/* <th className="site-cell">Average Login Day</th>
                                    <th className="site-cell">Top Interactions</th> */}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <>
                                                {state.stateViceTopLowItems.length > 0 ?
                                                    <>
                                                        {stateRenderRows(state.stateViceTopLowItems, 0, onClickRow)}
                                                    </>

                                                    : <tr> <td colSpan={5}> <NoRecordFound /></td></tr>}
                                            </>
                                        </tbody>
                                    </table>
                                </>

                            }
                        </div>
                    </div>
                </div>}
            </div>

        </div>
    </div>
}