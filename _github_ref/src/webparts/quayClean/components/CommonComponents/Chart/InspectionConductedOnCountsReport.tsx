import * as React from "react";
import * as echarts from 'echarts';
import { Label } from "@fluentui/react";

export interface IAssociateChemicalProps {
    ChartData: any;
}

export const InspectionConductedOnCountsReport = (props: IAssociateChemicalProps) => {

    const [chartData, setchartData] = React.useState<any>(props.ChartData);
    const [Total, setTotal] = React.useState<any>();
    const chartRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const getDateWiseData = (inspectionData: any[]) => {
            const dateCountMap: { [date: string]: number } = {};
            inspectionData.forEach((item: any) => {
                if (item.OrgConductedon) {
                    const date = new Date(item.OrgConductedon).toISOString().split('T')[0]; // Extract only the date part
                    if (date) {
                        dateCountMap[date] = (dateCountMap[date] || 0) + 1;
                    }
                }
            });


            // Prepare arrays for chart
            const dates = Object.keys(dateCountMap); // Array of unique dates
            const counts = Object.values(dateCountMap); // Array of corresponding counts

            return { dates, counts };
        };

        // Example usage:
        const { dates, counts } = getDateWiseData(chartData);
        const total = counts?.reduce((sum: any, value: any) => sum + value, 0);

        if (chartRef.current) {
            const myChart = echarts.init(chartRef.current);

            // Dynamic data preparation from InspectionData
            const { dates, counts } = getDateWiseData(chartData);
            const total = counts?.reduce((sum: number, value: number) => sum + value, 0);
            setTotal(total); // Assuming `setTotal` is used to display total somewhere

            const option = {
                title: {
                    text: 'Inspection Data Over Time',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                xAxis: {
                    type: 'category', // X-axis should be category for dates
                    boundaryGap: true,
                    data: dates // Use dynamic dates for x-axis labels
                },
                yAxis: {
                    type: 'value', // Value for counts
                },
                series: [
                    {
                        data: counts, // Use dynamic counts for bar heights
                        type: 'bar', // Change to 'bar' for bar chart
                        itemStyle: {
                            color: '#7FC57F' // Bar color
                        },
                        emphasis: {
                            itemStyle: {
                                color: '#004d00' // Highlight color on hover
                            }
                        },
                        label: {
                            show: true,
                            position: 'top', // Show count above each bar
                            formatter: '{c}'
                        }
                    }
                ],
                toolbox: {
                    feature: {
                        saveAsImage: {
                            title: 'Save as Image',
                            type: 'png'
                        },
                        dataView: {
                            title: 'View Data',
                            readOnly: true
                        },
                        magicType: {
                            type: ['line', 'bar'], // Allow switching between line and bar
                            title: {
                                line: 'Switch to Line Chart',
                                bar: 'Switch to Bar Chart'
                            }
                        },
                        restore: {
                            title: 'Restore'
                        },
                    },
                    show: true // Ensure toolbox is visible
                }
            };

            myChart.setOption(option);

            // Resize chart on window resize
            const handleResize = () => {
                myChart.resize();
            };

            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
                myChart.dispose();
            };
        }
    }, [chartData]);

    return <>
        <div className="chart-card chart-card-height mt-3">
            <div className="chart-header">
                <Label className="chart-label">INSPECTIONS CONDUCTED ON COUNTS</Label>
                <div className="chart-number chart-green">{Total}</div>
            </div>
            <div className="">
                <div ref={chartRef} style={{ width: '100%', height: '350px' }} />
            </div>
        </div>
    </>
};