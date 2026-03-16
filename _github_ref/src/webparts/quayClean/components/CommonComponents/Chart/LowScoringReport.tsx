import * as React from "react";
import * as echarts from 'echarts';
import { Label } from "@fluentui/react";
import NoRecordFound from "../NoRecordFound";

export interface IAssociateChemicalProps {
    ChartData: any;
}

export const LowScoringReport = (props: IAssociateChemicalProps) => {
    const [chartData, setchartData] = React.useState<any>(props.ChartData);
    const [Total, setTotal] = React.useState<any>();
    const [lowScoringAudits, setLowScoringAudits] = React.useState([]);
    const chartRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!!chartData && chartData.length > 0) {
            const filteredData = chartData.filter((record: any) => record.Score < 50);
            const sortedData = filteredData.sort((a: any, b: any) => a.Score - b.Score);
            const topLowScores = sortedData.slice(0, 10);
            setLowScoringAudits(topLowScores);
        }
    }, [chartData]);

    return <>
        <div className="chart-card score-chart-card-height mt-3">
            <div className="chart-header">
                <Label className="chart-label">LOW SCORING INSPECTIONS</Label>
                <div className="chart-number chart-orange">{Total}</div>
            </div>
            <div className="table-responsive ms-ScrollablePane--contentContainer">
                {!!lowScoringAudits && lowScoringAudits.length > 0 &&
                    <table className="custom-table-ans">
                        <thead>
                            <tr>
                                <th className="custom-header-ans chart-card-q-w"><b>INSPECTION</b></th>
                                <th className="custom-header-ans custom-cell-ans-mw-save"><b>SCORE %</b></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowScoringAudits?.length > 0 && lowScoringAudits?.map((item: any) => (
                                <tr key={item.EMail}>
                                    <td className="custom-cell-ans">
                                        <div className="">{item.InspectionTitle}</div>
                                    </td>
                                    <td className="custom-cell-ans txt-aligh-just custom-cell-ans-mw-save">
                                        <div className="requiredlink"><b>{item.Score.toFixed(2)} %</b></div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                }
                {lowScoringAudits?.length === 0 &&
                    <NoRecordFound />}
            </div>
        </div>
    </>;
};