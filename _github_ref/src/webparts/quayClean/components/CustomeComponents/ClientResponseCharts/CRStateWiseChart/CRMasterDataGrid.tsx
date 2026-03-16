import * as React from "react";
import { ClientResponseFields, ClientResponseViewFields, CRGridProps, CRGridTitles } from "../../QRClientResponse/ClientResponseFields";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";

export const CRMasterDataGrid: React.FC<CRGridProps> = ({ data }) => {
    const sortedData = React.useMemo(() => {
        if (!data) return [];
        return [...data].sort((a, b) => (b.SubmissionTimestamp || 0) - (a.SubmissionTimestamp || 0));
    }, [data]);
    return (
        <div className="systemGridLevel">
            <div className="ms-Grid-row ">
                <div className="ms-Grid-col ms-sm12">
                    <div className='table-container sysUsage-card'>

                        <div className="sites-table">
                            <div className='table-header-card'>{CRGridTitles.ClientFeedbackReport}</div>
                            <table className="sub-Grid-table mb-5">
                                <thead style={{ backgroundColor: '#2b2b2b', color: '#fff' }}>
                                    <tr className='systemUs'>
                                        <th className='site-cell'>{ClientResponseViewFields.State}</th>
                                        <th className='site-cell'>{ClientResponseViewFields.SiteName}</th>
                                        <th className='site-cell'>{ClientResponseViewFields.Category}</th>
                                        <th className='site-cell'>{ClientResponseViewFields.SubCategory}</th>
                                        <th className='site-cell'>{ClientResponseViewFields.ResponseFormId}</th>
                                        <th className='site-cell'>{ClientResponseViewFields.SubmissionDate}</th>
                                        <th className='site-cell'>{ClientResponseViewFields.ReportedBy}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData && sortedData.length > 0 ? (
                                        sortedData.map((row, idx) => (
                                            <tr key={idx}>
                                                <td className='site-cell'>{row.State}</td>
                                                <td className='site-cell'>{row.SiteName}</td>
                                                <td className='site-cell'>{row.Category}</td>
                                                <td className='site-cell'>{row.SubCategory}</td>
                                                <td className='site-cell'>{row.ResponseFormId}</td>
                                                <td className='site-cell'><div className="badge rounded-pill text-bg-info date-badge">{row["SubmissionDateDisplay"]}</div></td>
                                                <td className='site-cell'>{row.ReportedBy}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr><td colSpan={7}><NoRecordFound /></td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
