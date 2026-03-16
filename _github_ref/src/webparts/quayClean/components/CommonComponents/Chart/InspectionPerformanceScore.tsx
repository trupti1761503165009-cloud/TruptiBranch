import * as React from "react";
import * as echarts from 'echarts';
import { Label } from "@fluentui/react";

export interface IAssociateChemicalProps {
    ChartData: any;
}

export const InspectionPerformanceScore = (props: IAssociateChemicalProps) => {
    const [chartData, setchartData] = React.useState<any>(props.ChartData);
    const [Total, setTotal] = React.useState<any>();
    const chartRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (chartRef.current) {
            const myChart = echarts.init(chartRef.current);
            // Dynamic data preparation for dates and scores
            const dates = chartData.map((item: any) => item.FormatConductedon); // Extract dates
            const avgscores = chartData.map((item: any) => item.Score);
            const scores = chartData.map((item: any) => item.Score.toFixed(2)); // Extract scores

            const totalScore = avgscores.reduce((acc: any, score: any) => acc + score, 0);
            const averageScore = (totalScore / avgscores.length).toFixed(2);
            setTotal(averageScore); // Assuming `setTotal` is used to display total score somewhere

            const option = {
                title: {
                    text: 'Inspection Scores Over Time',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'line' // Pointer type for line charts
                    }
                },
                xAxis: {
                    type: 'category', // Dates as categories
                    boundaryGap: false, // No gaps for line chart
                    data: dates // Use dynamic dates
                },
                yAxis: {
                    type: 'value', // Numerical values for scores
                },
                series: [
                    {
                        data: scores,
                        type: 'line', // Default chart type
                        areaStyle: {
                            color: '#59B5F7',
                            opacity: 0.3
                        },
                        lineStyle: {
                            color: '#59B5F7',
                            width: 2
                        },
                        itemStyle: {
                            color: '#59B5F7'
                        },
                        smooth: true,
                        label: {
                            show: true,
                            position: 'top',
                            formatter: '{c}'
                        },
                        emphasis: {
                            focus: 'series'
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
                <Label className="chart-label">INSPECTION PERFORMANCE BY SCORE BY DATE</Label>
                <div className="chart-number chart-blue">{Total}%</div>
            </div>
            <div className="">
                <div ref={chartRef} style={{ width: '100%', height: '350px' }} />
            </div>
        </div>
    </>
};