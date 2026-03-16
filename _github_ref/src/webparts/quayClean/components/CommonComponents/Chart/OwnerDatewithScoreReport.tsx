import * as React from 'react';
import { Label } from '@fluentui/react';
import * as echarts from 'echarts';

export const OwnerDateWithScoreReport = (props: any) => {
    const [chartData, setChartData] = React.useState<any[]>(props.ChartData);
    const [viewOption, setViewOption] = React.useState<'count' | 'score'>('score'); // Toggle between 'count' and 'score'
    const [Total, setTotal] = React.useState<number>(0);
    const [Avg, setAvg] = React.useState<any>();
    const [dates, setDates] = React.useState<string[]>([]);
    const [groupData, setGroupData] = React.useState<any[]>([]);
    const [owners, setOwners] = React.useState<string[]>([]);
    const chartRef = React.useRef<HTMLDivElement>(null);

    const groupByOwnerAndDate = (data: any[]) => {
        const grouped: Record<string, any> = {};

        data.forEach((item) => {
            const key = `${item.Owner}_${item.FormatConductedon}`;
            if (!grouped[key]) {
                grouped[key] = {
                    Owner: item.Owner,
                    Date: item.FormatConductedon,
                    Scores: [],
                    Count: 0,
                };
            }
            grouped[key].Scores.push(item.Score);
            grouped[key].Count += 1;
        });

        return Object.values(grouped).map((group: any) => ({
            Owner: group.Owner,
            Date: group.Date,
            AverageScore: (
                group.Scores.reduce((sum: number, score: number) => sum + score, 0) /
                group.Count
            ).toFixed(2),
            Scores: group.Scores,
            Count: group.Count,
        }));
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
                type: "line",
                smooth: true,
                data: groupedByOwner[owner].map((item) => ({
                    name: item.Date,
                    value: viewOption === "count" ? item.Count : parseFloat(item.AverageScore),
                })),
            }));

            const uniqueDates = Array.from(
                new Set(groupedData.map((item: any) => item.Date))
            );

            const average =
                groupedData.reduce(
                    (acc, curr) =>
                        acc +
                        (viewOption === "count" ? curr.Count : parseFloat(curr.AverageScore)),
                    0
                ) / groupedData.length;

            const dates = Array.from(new Set(groupedData.map((item: any) => item.Date)));
            const total = groupedData.reduce((acc, curr) => acc + (viewOption === 'count' ? curr.Count : parseFloat(curr.AverageScore)), 0);

            setDates(uniqueDates);
            setGroupData(groupedData);
            setOwners(Array.from(new Set(groupedData.map((item: any) => item.Owner))));
            // setTotal(average);
            setTotal(total);
            setAvg(average.toFixed(2));

            const option = {
                title: {
                    text: viewOption === "count" ? "Total Inspections by Date" : "Average Score by Date",
                    left: "center",
                },
                tooltip: {
                    trigger: "axis",
                },
                // legend: {
                //     data: Object.keys(groupedByOwner),
                //     top: "10%",
                // },
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
                    type: "category",
                    data: uniqueDates,
                    boundaryGap: false,
                },
                yAxis: {
                    type: "value",
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

            window.addEventListener("resize", handleResize);
            return () => {
                window.removeEventListener("resize", handleResize);
                myChart.dispose();
            };
        }
    }, [chartData, viewOption]);

    return (
        <div className="chart-card-conducted mt-3">
            <div className="chart-header">
                <Label className="chart-label">
                    INSPECTION PERFORMANCE {viewOption === "count" ? "COUNT" : "AVERAGE SCORE"} BY DATE
                </Label>
                {/* <div className="chart-number chart-blue">{total.toFixed(2)}{viewOption !== 'count' && '%'}</div> */}
                <div className="chart-number chart-blue">{viewOption !== 'count' ? Avg : Total}{viewOption !== 'count' && '%'}</div>
                <button
                    className="chart-tgl-btn"
                    onClick={() => setViewOption(viewOption === "count" ? "score" : "count")}
                >
                    Toggle to {viewOption === "count" ? "Score" : "Count"}
                </button>
            </div>
            <div ref={chartRef} style={{ width: "100%", height: "550px" }} />
            <hr></hr>
            <div className="mb-1">
                <Label className="chart-label">
                    INSPECTION PERFORMANCE {viewOption === "count" ? "COUNT" : "AVERAGE SCORE"} BY DATE LIST
                </Label>
            </div>
            <div className='table-responsive ms-ScrollablePane--contentContainer mt-2'>
                <table className="custom-table-ans">
                    <thead className='repo-sticky-header'>
                        <tr>
                            <th className="report-custom-header-ans repo-sticky-column sticky-col-bg">
                                <b>OWNER</b>
                            </th>
                            {dates.map((date) => (
                                <th key={date} className="report-custom-header-ans">
                                    <b>{date}</b>
                                </th>
                            ))}
                            <th className="report-custom-header-ans">
                                <b>Average</b>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {owners.map((owner) => {
                            const ownerData = groupData.filter((item: any) => item.Owner === owner);
                            const totalScore = ownerData.reduce(
                                (sum: number, item: any) => sum + parseFloat(item.AverageScore),
                                0
                            );
                            const averageScore = ownerData.length
                                ? ownerData.reduce((sum: number, item: any) => sum + parseFloat(item.AverageScore), 0) / ownerData.length
                                : 0;  // Return 0 if no data is available

                            return (
                                <tr key={owner}>
                                    <td className="custom-cell-ans repo-sticky-column sticky-col-bg-2" ><b>{owner}</b></td>
                                    {/* {dates.map((date) => {
                                        const dateData = ownerData.find((item: any) => item.Date === date);
                                        return (
                                            <td key={date} className="custom-cell-ans">
                                                {dateData ? dateData.AverageScore + '%' : "-"}
                                            </td>
                                        );
                                    })} */}
                                    {dates.map((date) => {
                                        const dateData = ownerData.find((item: any) => item.Date === date);
                                        const score = dateData?.AverageScore;
                                        const isHighScore = score && score > 70; // Check if score is greater than 70
                                        return (
                                            <td
                                                key={date}
                                                className={`custom-cell-ans ${isHighScore ? 'high-score' : ''}`}
                                            >
                                                {score ? `${score}%` : "-"}
                                            </td>
                                        );
                                    })}
                                    <td className="custom-cell-ans">{averageScore.toFixed(2)}%</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
