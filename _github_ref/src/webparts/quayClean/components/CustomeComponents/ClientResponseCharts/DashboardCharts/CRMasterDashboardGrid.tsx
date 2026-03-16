import * as React from "react";
import { ChartDataItem } from "../../QRClientResponse/ClientResponseFields";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";
import { buildDashboardGridData } from "../../../CommonComponents/CommonMethods";
import { HazardGridProps } from "../../../../../../Common/Enum/HazardFields";


export const CRMasterDashboardGrid: React.FC<HazardGridProps> = ({ data, isPDFGenerating, siteName }) => {
    const [gridData, setGridData] = React.useState<ChartDataItem[]>([]);

    React.useEffect(() => {
        if (data?.length > 0) {
            setGridData(buildDashboardGridData(data, siteName));
        } else {
            setGridData([]);
        }

    }, [data]);

    const TableRow: React.FC<{ node: ChartDataItem; indent: number }> = ({ node, indent }) => {

        const allowExpand = !siteName && indent === 0;

        const [expanded, setExpanded] = React.useState(allowExpand && isPDFGenerating ? true : false);
        const hasChildren = allowExpand && node.children && node.children.length > 0;
        const isSubmission = node.level === "submission";

        return (
            <>
                {isSubmission ? (
                    <tr className="site-row siteLevelSubmission">
                        <td className='site-cell' style={{ paddingLeft: `${indent * 16 + 32}px` }}>
                            {node.siteName}
                        </td>
                        <td className='site-cell'>{node.category}</td>
                        <td className='site-cell'>{node.subCategory}</td>
                        <td className='site-cell'>{node.submissionDate}</td>
                        <td className='site-cell'>{node.reporterName}</td>
                    </tr>
                ) : (
                    <>
                        <tr
                            className={`site-row siteLevel${indent}`}
                            onClick={() => hasChildren && setExpanded(!expanded)}
                        >
                            <td className="site-cell" style={{ paddingLeft: `${indent * 16 + 16}px` }} colSpan={5}>
                                {hasChildren && <span>{expanded ? "▼" : "▶"} </span>}

                                {!siteName && indent === 0
                                    ? `${node.label} (${node.count})`
                                    : node.label
                                }
                            </td>

                        </tr>
                        {expanded && hasChildren &&
                            node.children!.map(child => (
                                <TableRow key={Math.random()} node={child} indent={indent + 1} />
                            ))}
                    </>
                )}
            </>
        );
    };

    const renderRows = (nodes: ChartDataItem[], indent = 0) => {
        if (siteName) {
            return nodes.map((sub, idx) => (
                <tr key={idx} className="site-row siteLevelSubmission">
                    <td className='site-cell'>{sub.category}</td>
                    <td className='site-cell'>{sub.subCategory}</td>
                    <td className='site-cell'>{sub.submissionDate}</td>
                    <td className='site-cell'>{sub.reporterName}</td>
                </tr>
            ));
        }

        return nodes.map((node, idx) => <TableRow key={idx} node={node} indent={indent} />);
    };


    return (
        <div className="systemGridLevel">
            <div className="ms-Grid-row ">
                <div className="ms-Grid-col ms-sm12">
                    <div className='table-container sysUsage-card'>
                        <div className="sites-table">
                            <div className='table-header-card'>Hazard Report</div>
                            <table className="sub-Grid-table">
                                <thead style={{ backgroundColor: '#2b2b2b', color: 'fff' }}>
                                    <tr className='systemUs'>
                                        <th className='site-cell'>
                                            {siteName ? "Hazard Type" : "State / Details"}
                                        </th>
                                        {!siteName && <th className='site-cell'>Hazard Type</th>}
                                        {!siteName && <th className='site-cell'>Sub Hazard</th>}
                                        {!siteName && <th className='site-cell'>Submission Date</th>}
                                        {!siteName && <th className='site-cell'>Submitted By</th>}

                                        {siteName && <th className='site-cell'>Sub Hazard</th>}
                                        {siteName && <th className='site-cell'>Submission Date</th>}
                                        {siteName && <th className='site-cell'>Submitted By</th>}
                                    </tr>
                                </thead>

                                <tbody>
                                    {gridData.length > 0 ? renderRows(gridData) : <tr><NoRecordFound /></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};