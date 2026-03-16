/* eslint-disable @typescript-eslint/no-use-before-define */
import React from "react"
import { EntityTypeDistributionData } from "./EntityTypeDistributionData";
import NoRecordFound from "../../../../CommonComponents/NoRecordFound";
import { IReportState, IReportSites, IReportUserActivityLog } from "../../IReport";
import EntityTypeDistributionChart from "./EntityTypeDistributionChart";
import CommonPopup from "../../../../CommonComponents/CommonSendEmailPopup";
import { PrimaryButton } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { appGlobalStateAtom } from "../../../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { Loader } from "../../../../CommonComponents/Loader";

export interface IEntityTypeDistributionProps {
    isExpandDisable?: boolean;
    stateItems: IReportState[];
    siteItems: IReportSites[];
    userActivityLogItems: IReportUserActivityLog[];
    isGenratePdf?: boolean;
    isDashboardView?: boolean;
    filterState?: any[];
    filterSites?: any[];
    filterUser?: any[];
    filterEntityType?: any[];
    filterActionType?: any[];
    startDate?: any;
    endDate?: any;
}

export const EntityTypeDistribution = (props: IEntityTypeDistributionProps) => {

    const { state,
        onClickDownload,
        onClickCancel,
        onChangeTitle,
        onClickSendEmail,
        onChangeSendToEmail,
        onClickShowEmailModel

    } = EntityTypeDistributionData(props)
    const mainProps = props;

    const renderRows = (
        nodes: any[],
        indent = 0,
        onClickRow?: any
    ) => {
        return nodes.map((node: any, index: number) => (
            <SiteRow
                key={index}
                // label={node?.name}
                // labelTwo={node.entityCount}
                // labelTheree={node.stateCount}
                // labelFour={node.siteCount}
                // labelFive={node.difference}
                label={node?.name}
                labelTwo={node.stateCount}
                labelTheree={node.siteCount}
                labelFour={node.entityCount}
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
                        {props?.label}
                    </td>
                    <td className="site-cell">{props?.labelTwo}</td>
                    <td className="site-cell">{props?.labelTheree}</td>
                    <td className="site-cell">{props?.labelFour}</td>
                    {/* <td className="site-cell">{props?.labelFive}</td> */}
                </tr>
                {expanded && props?.children}
            </>
        );
    };


    return <div className="ms-Grid-row systemLevel">
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
        <div id="EntityTypeDistributionRepo">
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                <EntityTypeDistributionChart chartData={state.items || []} isGenratePdf={state.isGenratePDF} />
            </div>
            {!props.isDashboardView &&
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                    <div className="table-container sysUsage-card">

                        <div className={state.isGenratePDF ? "" : "systemUseTableHeight mt-3"}>

                            <table className="sites-table ">
                                <thead>
                                    <tr className="systemUse ">
                                        <th className="site-cell">Entity Type</th>
                                        <th className="site-cell">State Count</th>
                                        <th className="site-cell">Sites Count</th>
                                        <th className="site-cell">Entity Type Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <>
                                        {state.items.length > 0 ?
                                            <>
                                                {renderRows(state.items, 0)}
                                            </>
                                            : <tr> <td colSpan={5}> <NoRecordFound /></td></tr>}
                                    </>
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>}

        </div>
    </div>;

}