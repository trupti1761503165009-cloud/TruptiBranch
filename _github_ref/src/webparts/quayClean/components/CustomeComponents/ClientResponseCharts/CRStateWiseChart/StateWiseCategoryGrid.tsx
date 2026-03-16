import * as React from "react";
import { ChartDataItem, CRGridProps, CRGridTitles } from "../../QRClientResponse/ClientResponseFields";
import { buildStateWiseClientResponseData } from "../../../CommonComponents/CommonMethods";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";

export const StateWiseCategoryGrid: React.FC<CRGridProps> = ({ data, isPDFGenerating, siteName }) => {
    const [gridData, setGridData] = React.useState<ChartDataItem[]>([]);

    React.useEffect(() => {
        if (data?.length > 0) {
            setGridData(buildStateWiseClientResponseData(data, siteName));
        } else {
            setGridData([]);
        }

    }, [data]);

    const TableRow: React.FC<{ node: any; indent: number }> = ({ node, indent }) => {
        const [expanded, setExpanded] = React.useState<boolean>(isPDFGenerating ? true : false);
        const hasChildren = !!(node.children && node.children.length > 0);
        const isLast = !!node.isLastLevel;

        const canToggle = hasChildren || isLast;

        return (
            <>
                <tr
                    className={`site-row siteLevel${indent}`}
                    onClick={() => canToggle && setExpanded(prev => !prev)}
                >
                    <td className='site-cell' style={{ paddingLeft: `${indent * 16 + 16}px` }}>
                        {canToggle && <span className={`arrow ${expanded ? "down" : "right"}`}></span>}
                        {node.label}
                    </td>

                    <td className='site-cell'>
                        {typeof node.count === "number" ? (
                            <div className={"table-date-badge cursor-pointer badge-border"}>
                                {node.count}
                            </div>
                        ) : ""}
                    </td>
                </tr>

                {expanded && hasChildren && !isLast &&
                    node.children!.map((child: any) => (
                        <TableRow key={child.label} node={child} indent={indent + 1} />
                    ))}

                {expanded && isLast && (
                    <tr className={`site-row siteLevel${indent}`}>
                        <td className='site-cell' colSpan={2} style={{ paddingLeft: `${(indent + 1) * 16 + 16}px`, paddingTop: "10px", paddingBottom: "10px" }}>
                            <div className="sites-table">
                                <table className="sub-Grid-table">
                                    <thead>
                                        <tr className="subGrid">
                                            <th className="site-cell padding-6">Sub-Category</th>
                                            <th className="site-cell padding-6">Submission Date</th>
                                            <th className="site-cell padding-6">Reported By</th>
                                            <th className="site-cell padding-6">Category</th>
                                            <th className="site-cell padding-6">Site Name</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {node.items?.length ? (
                                            node.items.map((row: any, idx: number) => (
                                                <tr key={idx} className="site-row">
                                                    <td className="site-cell padding-6">{row.SubCategory}</td>
                                                    <td className="site-cell padding-6"><div className="badge rounded-pill text-bg-info date-badge">{row.SubmissionDate}</div></td>
                                                    <td className="site-cell padding-6">{row.ReportedBy}</td>
                                                    <td className="site-cell padding-6">{row.Category}</td>
                                                    <td className="site-cell padding-6">{row.SiteName}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={5}><NoRecordFound /></td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                        </td>
                    </tr>
                )}
            </>
        );
    };

    const renderRows = (nodes: ChartDataItem[], indent = 0) => {
        return nodes.map((node, idx) => <TableRow key={idx} node={node} indent={indent} />);
    };

    return (
        <div className="systemGridLevel">
            <div className="ms-Grid-row ">
                <div className="ms-Grid-col ms-sm12">
                    <div className='table-container sysUsage-card'>
                        <div className={isPDFGenerating ? "" : "mt-3"}>
                            <div className="sites-table">
                                <div className='table-header-card'>{CRGridTitles.ClientFeedbackReport}</div>
                                <table className="sub-Grid-table mb-5">
                                    <thead style={{ backgroundColor: '#2b2b2b', color: 'fff' }}>
                                        <tr className='systemUs'>
                                            {siteName ?
                                                <th className='site-cell'>Category</th>
                                                :
                                                <th className='site-cell'>State / Site / Category</th>
                                            }
                                            <th className='site-cell'>Count</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {gridData.length > 0 ? (
                                            gridData.map((node, idx) => <TableRow key={idx} node={node} indent={0} />)
                                        ) : (
                                            <tr><td colSpan={2}><NoRecordFound /></td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};