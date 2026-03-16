/* eslint-disable */
import React from "react"
import { CombineStateReportData } from "./CombineStateReportData"
import { Loader } from "../../../CommonComponents/Loader"
import { IReportState, IReportSites, IReportUserActivityLog, IReportSiteRow, IReportsCombineState } from "../IReport";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";
import { IIconProps, Link, PrimaryButton, TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CombineStateReportCard } from "./CombineStateReportCard";
import { CombineStateReportCardsOptions, CombineStateTopInterCation, systemUsageReportWidthPrint } from "../../../../../../Common/Constants/CommonConstants";
import { CombinedUsageStateChart } from "./CombinedUsageStateChart";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import CommonPopup from "../../../CommonComponents/CommonSendEmailPopup";
import { SummeryCard } from "../SummeryCard";

export interface ICombineStateReportProps {
    stateItems: IReportState[];
    siteItems: IReportSites[];
    userActivityLogItems: IReportUserActivityLog[];
    isExpandDisable?: boolean;
    filterState?: any[];
    filterSites?: any[];
    filterUser?: any[];
    filterEntityType?: any[];
    filterActionType?: any[];
    startDate: any;
    endDate: any;
    isDashboardView?: boolean;
    isSubMenu?: boolean;
    topInteraction?: number;
    onClickTopInteraction?(number: any): any
    isGenratePdf?: boolean;
    excelFileName?: string
}

export const CombineStateReport = (props: ICombineStateReportProps) => {
    const { state, onClickRow, generateExcelTable, onChangeTitle, onClickView, onClickCancel, onClickDownload, onChangeSendToEmail, onChangeTopInteractionClick, onClickSendEmail, onClickShowEmailModel } = CombineStateReportData(props)
    const mainProps = props;
    const cardArray = props.isSubMenu ? CombineStateReportCardsOptions.filter((i) => !i.isHideSubMenu) : CombineStateReportCardsOptions
    const excelIcon: IIconProps = { iconName: 'ExcelLogo' };
    const renderRows = (
        nodes: IReportsCombineState[],
        indent = 0,
        onClickRow: any
    ) => {
        return nodes.map((node: any, index: number) => (
            <SiteRow
                key={index}
                label={node?.Title}
                totalSitesCount={node?.totalSiteCount || ""}
                activeSiteCount={node?.activeSiteCount || ""}
                indent={indent}
                // expandable={!!node.children || node.isLastLevel} 
                expandable={props.isExpandDisable ? false : (node.isExpandable || node.isLastLevel)}
                defaultExpanded={node.defaultExpanded}
                onClickRow={onClickRow}
                item={node?.item || ""}
                avgLoginsDay={node?.avgLoginsDay}
                difference={node?.difference}
                activeUsersCount={node?.activeUsersCount || ""}
                topEntityTypesCount={node?.topEntityTypesCount || []}
                isLastLevel={node?.isLastLevel} // 👈 pass flag
            >
                {(node?.children && !node?.isLastLevel) ? (
                    renderRows(node?.children, indent + 1, onClickRow)
                ) : node?.isLastLevel ? ( // 👈 check flag
                    <tr className="  ">
                        <td colSpan={props.isSubMenu ? 4 : 7} style={{ paddingLeft: `${(indent + 1) * 16 + 16}px`, paddingTop: "10px", paddingBottom: "10px", paddingRight: "10px" }}>
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

                                        <tr><td colSpan={props.isSubMenu ? 4 : 7}> <NoRecordFound /></td></tr>
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

    const SiteRow = (props: IReportSiteRow) => {
        const [expanded, setExpanded] = React.useState(props?.defaultExpanded);

        return (
            <>
                <tr
                    className={`site-row siteLevel   ${props.indent} ${props.expandable ? "" : "cursorDefault"}`}

                    onClick={
                        props?.expandable
                            ? () => setExpanded(!expanded)
                            : () => !!props.onClickRow && props.onClickRow(props)
                    }
                    data-indent={props?.indent}
                >
                    <td
                        className={`site-cell ${expanded ? "expanded" : ""}`}
                        style={{ paddingLeft: !mainProps.isExpandDisable ? `${props.indent * 16 + 16 + (props.expandable ? 0 : 17)}px` : '' }}
                    >
                        {props?.expandable && <span>{expanded ? "▼" : "▶"} </span>}
                        {props?.label}
                    </td>
                    <td className="site-cell">{props?.totalSitesCount}</td>
                    <td className="site-cell">{props?.activeSiteCount}</td>
                    <td className="site-cell">{props?.difference}</td>
                    {!mainProps.isSubMenu && <td className="site-cell">{props?.activeUsersCount}</td>}
                    {!mainProps.isSubMenu && <td className="site-cell">{props?.avgLoginsDay}</td>}
                    {!mainProps.isSubMenu && <td className={`site-cell ${state.isGenratePDF ? " site-cell-print" : ""} `} >
                        {props?.topEntityTypesCount?.length > 0 ? (
                            <ul className="reportUlLi" style={{ paddingLeft: "20px", margin: 0 }}>
                                {props.topEntityTypesCount.map((r: any, index: number) => (
                                    <li key={index}>
                                        {r.entityType} ({r.count})
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </td>}
                </tr>
                {expanded && props?.children}
            </>
        );
    };

    return <div className="systemLevel" key={state.keyUpdate}>
        {state.isLoading && <Loader />}
        <div className="ms-Grid-row ">

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
            <div id="combineStateReport" >
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
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                    <CombineStateReportCard data={state?.totalCount} cardsArray={cardArray} />
                </div>
                {(!state.isGenratePDF && state.items.length > 0) &&
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">

                        <div className="dflex justifyContentBetween  sysUsage-cardNo ">



                            {(!props.isDashboardView) ?
                                <PrimaryButton
                                    text="Export to excel"
                                    key={state.keyUpdate}
                                    className="btn btn-primary pb-10"
                                    iconProps={excelIcon}
                                    onClick={() => generateExcelTable(state.items)} />

                                : <>&nbsp;</>
                            }
                            {!props.isSubMenu && <div className="dflex">
                                {/* {(!props.isDashboardView) ? <Link
                                className="actionBtn iconSize  dticon  mr-10"
                                onClick={onClickView}
                            >
                                <TooltipHost content={state.isCharView ? "Grid view" : "Graph view"} id={`tooltip`}>
                                    <FontAwesomeIcon icon={state.isCharView ? "table-cells" : "chart-simple"} />
                                </TooltipHost>
                            </Link> : <>&nbsp;</>} */}
                                <div className="mr-10 userReportByWidth">
                                    <ReactDropdown options={CombineStateTopInterCation || []}
                                        defaultOption={state.topInteractionCount || ""}
                                        onChange={onChangeTopInteractionClick}
                                        isMultiSelect={false} />
                                </div>
                            </div>}
                        </div>
                    </div>}

                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                    {state.isGenratePDF ?
                        <CombinedUsageStateChart chartData={state.items} width={systemUsageReportWidthPrint} isGenratePdf={true} /> :
                        <CombinedUsageStateChart chartData={state.items} isGenratePdf={false} />
                    }

                </div>
                {(!props.isDashboardView &&
                    < div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12  mt-3 page-break" >
                        <div className="table-container ">
                            <div className={state.isGenratePDF ? "" : "systemUseTableHeight"} id="">
                                <table className="sites-table ">
                                    <thead>
                                        <tr className="systemUse ">
                                            <th className="site-cell">State</th>
                                            <th className="site-cell">Total Sites</th>
                                            <th className="site-cell">Sites with Portal Access</th>
                                            <th className="site-cell">% With Access</th>
                                            {!props.isSubMenu && <th className="site-cell">Active Users</th>}
                                            {!props.isSubMenu && <th className="site-cell">Average Login Day</th>}
                                            {!props.isSubMenu && <th className={`site-cell ${state.isGenratePDF ? " site-cell-print" : ""} `} >Top Interactions</th>}
                                        </tr>
                                    </thead>
                                    <tbody className="">
                                        <>
                                            {state.items.length > 0 ?
                                                <>
                                                    {renderRows(state.items, 0, onClickRow)}
                                                    <tr className="total-row  ">
                                                        <td className="site-cell site-cell-bold" >Total</td>
                                                        <td className="site-cell site-cell-bold">{state.totalCount?.totalSitesCount}</td>
                                                        <td className="site-cell site-cell-bold">{state.totalCount?.activeSitesCount}</td>
                                                        <td className="site-cell site-cell-bold">{state.totalCount?.difference}%</td>
                                                        {!props.isSubMenu && <td className="site-cell site-cell-bold">{state.totalCount?.activeUserCount}</td>}
                                                        {!props.isSubMenu && <td className="site-cell site-cell-bold">{state.totalCount?.avgLoginsDay}</td>}
                                                        {!props.isSubMenu && <td>-</td>}
                                                    </tr>
                                                </>

                                                : <tr> <td colSpan={props.isSubMenu ? 4 : 7}> <NoRecordFound /></td></tr>}
                                        </>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>)}

            </div>

        </div>

    </div >

}