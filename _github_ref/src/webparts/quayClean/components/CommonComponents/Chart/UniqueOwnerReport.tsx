import * as React from "react";
import * as echarts from 'echarts';
import { Label } from "@fluentui/react";

export interface IAssociateChemicalProps {
    ChartData: any;
}

export const UniqueOwnerReport = (props: IAssociateChemicalProps) => {
    const [chartData, setchartData] = React.useState<any>(props.ChartData);
    const [Total, setTotal] = React.useState<any>();
    const chartRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const ownerCounts = chartData.reduce((acc: Record<string, number>, item: any) => {
            acc[item.Owner] = (acc[item.Owner] || 0) + 1;
            return acc;
        }, {});

        const owners = Object.keys(ownerCounts);
        const counts = Object.values(ownerCounts);
        const uniquePeopleCount = owners.length;
        // Calculate the average score (optional, if you have `scores` separately)
        const totalScore: any = counts.reduce((sum: any, value) => sum + value, 0);
        const averageScore = (totalScore / counts.length).toFixed(2);
        setTotal(uniquePeopleCount);
        if (chartRef.current) {
            const myChart = echarts.init(chartRef.current);
            // Data for the chart

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
                        data: counts,
                        type: 'line',
                        areaStyle: {
                            color: '#FF5C00', // Area color
                            opacity: 0.5 // Optional: Adjust transparency
                        },
                        lineStyle: {
                            color: '#FF5C00' // Line color
                        },
                        itemStyle: {
                            color: '#FF5C00' // Point color
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
                <Label className="chart-label">UNIQUE PEOPLE CONDUCTING INSPECTIONS</Label>
                <div className="chart-number chart-orange">{Total}</div>
            </div>
            <div className="">
                <div ref={chartRef} style={{ width: '100%', height: '250px' }} />
            </div>
        </div>
    </>;
};