import * as React from "react";
import NoRecordFound from "../../../../CommonComponents/NoRecordFound";
import { HazardData, HazardFields, HazardGridProps } from "../../../../../../../Common/Enum/HazardFields";
interface DashboardGridProps extends HazardGridProps {
    groupBy: keyof HazardData;
    groupDisplayName: any;
    title: any;
}

export const DashboardGrid: React.FC<DashboardGridProps> = ({ data, isPDFGenerating, groupBy, groupDisplayName, title }) => {
    const [gridData, setGridData] = React.useState<any[]>([]);
    const [headerColumns, setHeaderColumns] = React.useState<any[]>([]);
    React.useEffect(() => {
        let columnHeaderOrder: any[] = [];
        if (groupBy === HazardFields.State) {
            columnHeaderOrder = [
                HazardFields.HazardType,
                HazardFields.HazardSubType,
                HazardFields.SubmissionDate,
                HazardFields.SubmittedBy
            ];
        }
        if (groupBy === HazardFields.SiteName) {
            columnHeaderOrder = [
                HazardFields.HazardType,
                HazardFields.HazardSubType,
                HazardFields.SubmissionDate,
                HazardFields.SubmittedBy
            ];
        }
        if (groupBy === HazardFields.HazardType || groupBy === HazardFields.HazardSubType || groupBy === HazardFields.SubmissionDate || groupBy === HazardFields.SubmittedBy) {
            const columnHeader = [
                HazardFields.SiteName,
                HazardFields.HazardType,
                HazardFields.HazardSubType,
                HazardFields.SubmissionDate,
                HazardFields.SubmittedBy
            ];
            columnHeaderOrder = columnHeader.filter(col => col !== groupBy);
        }
        setHeaderColumns(columnHeaderOrder)
        if (data?.length) {
            // const grouped = buildDashboardOneLevelGridData(data, groupBy);
            setGridData(data);
        } else {
            setGridData([]);
        }

    }, [data, groupBy]);

    // Column order for display
    const columnOrder: (keyof any)[] = [
        HazardFields.State,
        HazardFields.SiteName,
        HazardFields.HazardType,
        HazardFields.HazardSubType,
        HazardFields.SubmissionDate,
        HazardFields.SubmittedBy
    ];

    const visibleColumns = columnOrder.filter(col => col !== groupBy);

    const headers: Record<string, string> = {
        State: "State",
        SiteName: "Site",
        HazardType: "Hazard Type",
        HazardSubType: "Sub Hazard",
        SubmissionDate: "Submission Date",
        SubmittedBy: "Submitted By",
    };

    const TableRow: React.FC<{ node: any; indent: number }> = ({ node, indent }) => {
        const [expanded, setExpanded] = React.useState(isPDFGenerating ? true : false);
        const hasChildren = node.children && node.children.length > 0;

        return (
            <>
                {/* Group Row */}
                <tr
                    className={`site-row siteLevel${indent}`}
                    onClick={() => hasChildren && setExpanded(!expanded)}
                >
                    <td className='site-cell expandable-row' colSpan={visibleColumns.length} style={{ paddingLeft: `${indent * 16 + 16}px` }}>
                        {/* {hasChildren && <span>{expanded ? "▼" : "▶"} </span>} */}
                        {hasChildren && <span className={`arrow ${expanded ? "down" : "right"}`}></span>}
                        {node.label} {node.count !== undefined && `(${node.count})`}
                    </td>
                </tr>

                {/* Child Rows */}
                {/* {expanded && hasChildren &&
                    node.children!.map((child: any, idx: any) => (
                        <tr key={idx} className="site-row">
                            {visibleColumns.map((col, cIdx) => (
                                <td key={cIdx} className='site-cell' style={{ paddingLeft: '32px' }}>
                                    {child[col as keyof any]}
                                </td>
                            ))}
                        </tr>
                    ))
                } */}
                {expanded && hasChildren &&
                    node.children!.map((child: any, idx: any) => (
                        <tr key={idx} className="site-row">
                            {visibleColumns.map((col, cIdx) => {
                                let value = child[col as keyof any];
                                if (col === HazardFields.SubmissionDate && child.SubmissionDateDisplay) {
                                    return (
                                        <td key={cIdx} className='site-cell' style={{ paddingLeft: '32px' }}>
                                            <div className="badge rounded-pill text-bg-info date-badge">{child.SubmissionDateDisplay}</div>
                                        </td>
                                    );
                                } else {
                                    return (
                                        <td key={cIdx} className='site-cell' style={{ paddingLeft: '32px' }}>
                                            {value}
                                        </td>
                                    );
                                }
                            })}
                        </tr>
                    ))
                }
            </>
        );
    };

    const renderRows = (nodes: any[], indent = 0) => {
        return nodes.map((node, idx) => <TableRow key={idx} node={node} indent={indent} />);
    };

    return (
        <div className="systemGridLevel">
            <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12">
                    <div className='table-container sysUsage-card'>
                        <div className="sites-table">
                            <div className='table-header-card'>{title}</div>
                            <table className="sub-Grid-table mb-5">
                                <thead style={{ backgroundColor: '#2b2b2b', color: '#fff' }}>
                                    <tr className='systemUs'>
                                        <th className='site-cell'>
                                            {groupBy === 'State'
                                                ? 'State / Site'
                                                : `${groupDisplayName} / State`}
                                        </th>
                                        {headerColumns.map((col: any, idx) => (
                                            <th key={idx} className='site-cell'>{headers[col]}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {gridData.length > 0 ? renderRows(gridData) : <tr><td colSpan={visibleColumns.length + 1}><NoRecordFound /></td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};