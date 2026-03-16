import * as React from "react";
import * as echarts from 'echarts';
import { Label } from "@fluentui/react";

export interface IAssociateChemicalProps {
    ChartData: any;
}

export const TotalInspectionConductedReport = (props: IAssociateChemicalProps) => {

    const [chartData, setchartData] = React.useState<any>(props.ChartData);
    const [Total, setTotal] = React.useState<any>();

    const chartRef = React.useRef<HTMLDivElement>(null);


    const formatDate = (date: any) => {
        if (!date) {
            return ''; // Handle null, undefined, or empty input
        }
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
            return ''; // Return empty string if date is invalid
        }
        return parsedDate.toISOString().split('T')[0];
    };


    React.useEffect(() => {
        // Transform data without filtering
        const Data = !!chartData && chartData.length > 0 && chartData
            .reduce((acc: any, curr: any) => {
                const date = formatDate(curr.OrgConductedon);
                acc[date] = (acc[date] || 0) + 1;
                return acc;
            }, {});

        const dates = Object.keys(Data);
        const counts = Object.values(Data);
        if (chartRef.current) {
            const myChart = echarts.init(chartRef.current);
            // Data for the chart
            const data = counts;
            const total = data?.reduce((sum: any, value: any) => sum + value, 0);
            setTotal(total);
            const option = {

                xAxis: {
                    type: '',
                    boundaryGap: false,
                    data: [],
                    axisLine: {
                        show: false // Hides the x-axis line
                    },
                    axisTick: {
                        show: false // Optional: Hides ticks on x-axis
                    },
                    axisLabel: {
                        show: true // Labels remain visible (set to false if you want to hide labels too)
                    }
                },
                yAxis: {
                    type: '',
                    data: [],
                    axisLine: {
                        show: false // Hides the y-axis line
                    },
                    axisTick: {
                        show: false // Optional: Hides ticks on y-axis
                    },
                    axisLabel: {
                        show: true // Labels remain visible (set to false if you want to hide labels too)
                    },
                    splitLine: {
                        show: false // Optional: Hides horizontal grid lines
                    }
                },
                series: [
                    {
                        data: data,
                        type: 'line',
                        areaStyle: {
                            color: '#008000', // Area color
                            opacity: 0.5 // Optional: Adjust transparency
                        },
                        lineStyle: {
                            color: '#008000' // Line color
                        },
                        itemStyle: {
                            color: '#008000' // Point color
                        }
                    }
                ]
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
        <div className="chart-card mt-3">
            <div className="chart-header">
                <Label className="chart-label">TOTAL INSPECTIONS CONDUCTED</Label>
                <div className="chart-number chart-green">{Total}</div>
            </div>
            <div className="">
                <div ref={chartRef} style={{ width: '100%', height: '250px' }} />
            </div>
        </div>
    </>
};