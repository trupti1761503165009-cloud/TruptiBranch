import * as React from "react";
import * as echarts from 'echarts';
import { Label } from "@fluentui/react";

export interface IAssociateChemicalProps {
    ChartData: any;
}

export const AverageScoreReport = (props: IAssociateChemicalProps) => {

    const [chartData, setchartData] = React.useState<any>(props.ChartData);
    const [AverageScore, setAverageScore] = React.useState<any>();
    const chartRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const dates = chartData.map((item: any) => item.Conductedon);
        const scores = chartData.map((item: any) => item.Score);

        const totalScore = scores.reduce((acc: any, score: any) => acc + score, 0);
        const averageScore = (totalScore / scores.length).toFixed(2);
        setAverageScore(averageScore);
        if (chartRef.current) {
            const myChart = echarts.init(chartRef.current);
            // Data for the chart
            const data = scores;
            const total = data?.reduce((sum: any, value: any) => sum + value, 0);

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
                            color: '#59B5F7', // Area color
                            opacity: 0.5 // Optional: Adjust transparency
                        },
                        lineStyle: {
                            color: '#59B5F7' // Line color
                        },
                        itemStyle: {
                            color: '#59B5F7' // Point color
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
                <Label className="chart-label">AVERAGE SCORE</Label>
                <div className="chart-number chart-blue">{AverageScore}%</div>
            </div>
            <div className="">
                <div ref={chartRef} style={{ width: '100%', height: '250px' }} />
            </div>
        </div>
    </>;
};