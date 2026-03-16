import * as React from "react";
import NoRecordFound from "../../../../CommonComponents/NoRecordFound";
import { HazardGridProps, HazardViewFields } from "../../../../../../../Common/Enum/HazardFields";

export const MasterDataGrid: React.FC<HazardGridProps> = ({ data }) => {
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
                            <div className='table-header-card'>Hazard Report</div>
                            <table className="sub-Grid-table mb-5">
                                <thead style={{ backgroundColor: '#2b2b2b', color: '#fff' }}>
                                    <tr className='systemUs'>
                                        <th className='site-cell'>{HazardViewFields.State}</th>
                                        <th className='site-cell'>{HazardViewFields.SiteName}</th>
                                        <th className='site-cell'>{HazardViewFields.HazardType}</th>
                                        <th className='site-cell'>{HazardViewFields.HazardSubType}</th>
                                        <th className='site-cell'>{HazardViewFields.FormID}</th>
                                        <th className='site-cell'>{HazardViewFields.SubmissionDate}</th>
                                        <th className='site-cell'>{HazardViewFields.SubmittedBy}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedData && sortedData.length > 0 ? (
                                        sortedData.map((row, idx) => (
                                            <tr key={idx}>
                                                <td className='site-cell'>{row.State}</td>
                                                <td className='site-cell'>{row.SiteName}</td>
                                                <td className='site-cell'>{row.HazardType}</td>
                                                <td className='site-cell'>{row.HazardSubType}</td>
                                                <td className='site-cell'>{row.HazardFormId}</td>
                                                <td className='site-cell'><div className="badge rounded-pill text-bg-info date-badge">{row["SubmissionDateDisplay"]}</div></td>
                                                <td className='site-cell'>{row.SubmittedBy}</td>
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
