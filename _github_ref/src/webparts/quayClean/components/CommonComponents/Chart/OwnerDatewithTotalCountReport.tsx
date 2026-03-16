import * as React from 'react';
import { Label, TooltipHost } from '@fluentui/react';
import * as echarts from 'echarts';
import { IAssociateChemicalProps } from './TotalInspectionConductedReport';

export const OwnerDatewithTotalCountReport = (props: IAssociateChemicalProps) => {
    const [chartData, setChartData] = React.useState<any>(props.ChartData);
    const [viewOption, setViewOption] = React.useState<'count' | 'score'>('count'); // Toggle between 'count' and 'score'
    const [Total, setTotal] = React.useState<any>();
    const [Avg, setAvg] = React.useState<any>();
    const [Dates, setDates] = React.useState<any>();
    const [GroupData, setGroupData] = React.useState<any>();
    const [Dates1, setDates1] = React.useState<any>();
    const [Owner1, setOwner1] = React.useState<any>();
    const [GroupData1, setGroupData1] = React.useState<any>();

    const chartRef = React.useRef<HTMLDivElement>(null);

    const groupByOwnerAndDate = (data: any[]) => {
        const grouped: Record<string, any> = {};
        data.forEach((item) => {
            const key = `${item.Owner}_${item.FormatConductedon}`;
            if (!grouped[key]) {
                grouped[key] = {
                    Owner: item.Owner,
                    ID: item.ID,
                    Date: item.FormatConductedon,
                    Scores: [],
                    Count: 0,
                    TotalDuration: 0
                };
            }
            grouped[key].Scores.push(item.Score);
            grouped[key].Count += 1;
            grouped[key].TotalDuration += item.Duration; // Sum the duration
        });

        return Object.values(grouped).map((group: any) => ({
            Owner: group.Owner,
            Date: group.Date,
            AverageScore: (group.Scores.reduce((sum: number, score: number) => sum + score, 0) / group.Count).toFixed(2),
            Count: group.Count,
            TotalDuration: group.TotalDuration, // Return the total duration
            AverageDuration: (group.TotalDuration / group.Count).toFixed(2), // Optional: Return average duration
        }));
    };

    const getTotalForOwner = (owner: string) => {
        const groupedData = groupByOwnerAndDate(chartData);
        return groupedData.filter((item: any) => item.Owner === owner).reduce((sum: number, item: any) => sum + item.Count, 0);
    };

    React.useEffect(() => {

        if (chartRef.current) {
            const myChart = echarts.init(chartRef.current);
            const groupedData = groupByOwnerAndDate(chartData);

            const groupedByOwner: Record<string, any[]> = {};
            groupedData.forEach((item) => {
                if (!groupedByOwner[item.Owner]) {
                    groupedByOwner[item.Owner] = [];
                }
                groupedByOwner[item.Owner].push(item);
            });

            const seriesData = Object.keys(groupedByOwner).map((owner) => ({
                name: owner,
                type: 'line',
                smooth: true,
                data: groupedByOwner[owner].map((item) => ({
                    name: item.Date,
                    value: viewOption === 'count' ? item.Count : item.AverageScore
                }))
            }));
            const dates = Array.from(new Set(groupedData.map((item: any) => item.Date)));
            const total = groupedData.reduce((acc, curr) => acc + (viewOption === 'count' ? curr.Count : parseFloat(curr.AverageScore)), 0);
            const average = (total / groupedData.length).toFixed(2);

            const owners1 = Array.from(new Set(groupedData.map((item: any) => item.Owner)));
            const dates1 = Array.from(new Set(groupedData.map((item: any) => item.Date)));
            setGroupData1(groupedData);
            setDates1(dates1);
            setOwner1(owners1);

            setTotal(total);
            setAvg(average);
            setDates(dates);
            setGroupData(groupedData);

            const option = {
                title: {
                    text: viewOption === 'count' ? 'Total Inspections by Date' : 'Average Score by Date',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis'
                },

                legend: {
                    type: 'scroll', // Use scrollable legend to handle many items
                    orient: 'horizontal', // Arrange legend items horizontally
                    top: 'bottom', // Position legend at the bottom of the chart
                    itemGap: 10, // Space between legend items
                    itemWidth: 14, // Width of legend symbol
                    itemHeight: 14, // Height of legend symbol
                    textStyle: {
                        fontSize: 12 // Font size of legend text
                    }
                },
                xAxis: {
                    type: 'category',
                    data: dates,
                    boundaryGap: false
                },
                yAxis: {
                    type: 'value'
                },
                series: seriesData,
                toolbox: {
                    feature: {
                        saveAsImage: {},
                        dataView: { readOnly: true },
                        magicType: { type: ['line', 'bar'] },
                        restore: {}
                    }
                }
            };

            myChart.setOption(option);
            const handleResize = () => {
                myChart.resize();
            };

            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
                myChart.dispose();
            };
        }
    }, [chartData, viewOption]);

    return (
        <>
            <div className="chart-card-conducted mt-3">
                <div className="chart-header">
                    <Label className="chart-label">
                        INSPECTION PERFORMANCE {viewOption === 'count' ? 'COUNT' : 'AVERAGE SCORE'} BY DATE
                    </Label>
                    <div className="chart-number chart-blue">{viewOption !== 'count' ? Avg : Total}{viewOption !== 'count' && '%'}</div>
                    <button className="chart-tgl-btn" onClick={() => setViewOption(viewOption === 'count' ? 'score' : 'count')}>
                        Toggle to {viewOption === 'count' ? 'Score' : 'Count'}
                    </button>
                </div>

                <div ref={chartRef} style={{ width: '100%', minHeight: '550px' }} />
                <hr></hr>
                <div className="mb-1">
                    <Label className="chart-label">
                        INSPECTION PERFORMANCE {viewOption === 'count' ? 'COUNT' : 'AVERAGE SCORE'} BY DATE LIST
                    </Label>
                </div>
                <div className='table-responsive ms-ScrollablePane--contentContainer mt-2'>

                    <table className="custom-table-ans">
                        <thead className='repo-sticky-header'>
                            <tr>
                                <th className="report-custom-header-ans repo-sticky-column sticky-col-bg"><b>OWNER</b></th>
                                {!!Dates1 && Dates1.length > 0 && Dates1.map((date: string) => (
                                    <th key={date} className="report-custom-header-ans"><b>{date}</b></th>
                                ))}
                                <th className="report-custom-header-ans"><b>Total</b></th>
                                <th className="report-custom-header-ans"><b>Duration</b></th>
                            </tr>
                        </thead>
                        <tbody>
                            {!!Owner1 && Owner1.length > 0 && Owner1.map((owner: string) => {
                                const ownerData = GroupData1.filter((item: any) => item.Owner === owner);
                                const totalInspections = getTotalForOwner(owner);

                                const totalDuration = ownerData.reduce((sum: number, item: any) => sum + item.TotalDuration, 0);
                                const averageDuration = totalDuration / ownerData.length;
                                // Convert average duration to hours and minutes
                                const hours = Math.floor(averageDuration / 60);
                                const minutes = Math.round(averageDuration % 60);
                                return (
                                    <tr key={owner}>
                                        <td className="custom-cell-ans repo-sticky-column sticky-col-bg-2"><b>{owner}</b></td>
                                        {!!Dates1 && Dates1.length > 0 && Dates1.map((date: string) => {
                                            const dateData = ownerData.find((item: any) => item.Date === date);
                                            const count = dateData ? dateData.Count : 0;

                                            // Tooltip content
                                            const tooltipContent = ownerData
                                                .filter((item: any) => item.Date === date)
                                                .map((item: any) => `Owner: ${item.Owner}\nDate: ${item.Date}\nID: ${item.ID}\nCount: ${item.Count}`)
                                                .join('\n');

                                            return (
                                                <td key={`${owner}-${date}`} className="custom-cell-ans">
                                                    <TooltipHost content={tooltipContent} id={`${owner}-${date}-tooltip`}>
                                                        <div className="count">{count}</div>
                                                    </TooltipHost>
                                                </td>
                                            );
                                        })}
                                        <td className="custom-cell-ans"><b>{totalInspections}</b></td>
                                        <td className="custom-cell-ans">
                                            <b>
                                                {hours}h {minutes}min
                                            </b>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};
