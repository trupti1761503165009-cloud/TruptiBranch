import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { Label, Toggle } from "@fluentui/react";
import NoRecordFound from "../../../../CommonComponents/NoRecordFound";
import { systemUsageReportWidthPrint } from "../../../../../../../Common/Constants/CommonConstants";

export interface IEntityTypeDistributionChartProps {
    chartData: {
        name: string;
        entityCount: number;
        siteCount: number;
        stateCount: number;
    }[];
    isGenratePdf?: boolean
}

const EntityTypeDistributionChart: React.FC<IEntityTypeDistributionChartProps> = ({ chartData, isGenratePdf }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const [showPie, setShowPie] = useState(true);

    useEffect(() => {
        if (!chartRef.current) return;

        let chart = echarts.getInstanceByDom(chartRef.current);
        if (chart) chart.dispose();
        chart = echarts.init(chartRef.current);

        if (chartData && chartData.length > 0) {
            let option: echarts.EChartsOption;

            if (showPie) {
                // 🔹 PIE CHART
                option = {
                    title: { text: "Entity Type Distribution", left: "center" },
                    tooltip: {
                        trigger: "item",
                        formatter: (params: any) => {
                            const data = params.data;
                            return `
                <b>${data.name}</b><br/>
                Entity Count: ${data.entityCount}<br/>
                Site Count: ${data.siteCount}<br/>
                State Count: ${data.stateCount}
              `;
                        },
                    },
                    legend: {
                        type: "scroll",
                        orient: "vertical",
                        right: 10,
                        top: 20,
                        bottom: 20,
                        data: chartData.map((d) => d.name),
                    },
                    series: [
                        {
                            name: "Entities",
                            type: "pie",
                            radius: "65%",
                            center: ["40%", "50%"],
                            data: chartData.map((d) => ({
                                value: d.entityCount,
                                name: d.name,
                                entityCount: d.entityCount,
                                siteCount: d.siteCount,
                                stateCount: d.stateCount,
                            })),
                            label: { show: true, formatter: "{b}: {c}" },
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: "rgba(0, 0, 0, 0.5)",
                                },
                            },
                        },
                    ],
                };
            } else {


                option = {
                    color: ["#dda563", "#91cc75", "#519393"],
                    tooltip: { trigger: "axis" },
                    legend: {
                        top: "top",
                        left: "center",
                        data: ["Site Count", "Entity Count", "State Count"],
                    },
                    grid: { left: "3%", right: "4%", bottom: "15%", containLabel: true },
                    xAxis: {
                        type: "category",
                        boundaryGap: false,
                        data: chartData.map((d) => d.name),
                        axisLabel: {
                            interval: 0,
                            rotate: 45,
                        },
                    },
                    yAxis: [
                        {
                            type: "value",
                            name: "Counts", // left side
                            position: "left",
                        },
                        {
                            type: "value",
                            name: "Entity Count", // right side
                            position: "right",
                            axisLine: { show: false },
                            splitLine: { show: false },
                        }
                    ],
                    dataZoom: [
                        {
                            type: "slider",
                            show: true,
                            xAxisIndex: [0],
                            start: 0,
                            end: 50,
                        },
                        {
                            type: "inside",
                            xAxisIndex: [0],
                            start: 0,
                            end: 50,
                        },
                    ],
                    series: [
                        {
                            name: "Entity Count",
                            type: "line",
                            data: chartData.map((d) => d.entityCount),
                            smooth: true,
                            yAxisIndex: 1,
                            label: {
                                show: true,
                                position: "top",
                                formatter: "{c}",
                            }
                            // bind to right Y axis
                        },
                        {
                            name: "Site Count",
                            type: "line",
                            data: chartData.map((d) => d.siteCount),
                            smooth: true,
                            label: {
                                show: true,
                                position: "top",
                                formatter: "{c}",
                            }
                        },
                        {
                            name: "State Count",
                            type: "line",
                            data: chartData.map((d) => d.stateCount),
                            smooth: true,
                            label: {
                                show: true,
                                position: "top",
                                formatter: "{c}",
                            }
                        },
                    ],
                    toolbox: isGenratePdf ? [] : {
                        feature: {
                            saveAsImage: { title: 'Save as Image', type: 'png' },
                            dataView: { title: 'View Data', readOnly: true },
                            magicType: {
                                type: ['line', 'bar'],
                                title: { line: 'Switch to Line Chart', bar: 'Switch to Bar Chart' }
                            },
                            restore: { title: 'Restore' },
                        },
                        show: true,
                    },
                };

            }

            chart.setOption(option);
        }

        const handleResize = () => chart?.resize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart?.dispose();
        };
    }, [chartData, showPie, isGenratePdf]);

    return (
        <div className="sysUsage-card mt-3">
            <div className="flex justify-between items-center mb-2">
                <Label className="chartLabel">Portal Usage by Entity Type</Label>
                <Toggle
                    label={showPie ? "Pie Chart" : "Line Chart"}
                    checked={!showPie}
                    onChange={() => setShowPie(!showPie)}
                    onText="Line"
                    offText="Pie"
                />
            </div>

            {chartData?.length > 0 ? (
                <div ref={chartRef} style={{ width: isGenratePdf ? systemUsageReportWidthPrint : "100%", height: "380px" }} />
            ) : (
                <NoRecordFound />
            )}
        </div>
    );
};

export default EntityTypeDistributionChart;

