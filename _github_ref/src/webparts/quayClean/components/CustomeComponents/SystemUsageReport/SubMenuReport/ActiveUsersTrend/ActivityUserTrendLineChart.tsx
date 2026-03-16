import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { Label } from "@fluentui/react";
import NoRecordFound from "../../../../CommonComponents/NoRecordFound";
import { systemUsageReportWidthPrint } from "../../../../../../../Common/Constants/CommonConstants";

export interface IActivityUserTrendLineChartProps {
    chartData: any[];
    isGenratePDF?: boolean
}

const ActivityUserTrendLineChart: React.FC<IActivityUserTrendLineChartProps> = ({ chartData, isGenratePDF }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!chartRef.current) return;

        let chart = echarts.getInstanceByDom(chartRef.current);
        if (chart) chart.dispose();
        chart = echarts.init(chartRef.current);

        if (chartData && chartData.length > 0) {
            let label = chartData.length;
            let showDataZoom = label > 30
            const option: echarts.EChartsOption = {
                // title: { text: "Daily Unique Users", left: "center" },
                color: ["#519393"],
                tooltip: { trigger: "axis" },
                legend: { top: "top", left: "center", data: ["Unique Users"] },
                grid: { left: "3%", right: "4%", bottom: "15%", containLabel: true },
                xAxis: {
                    type: "category",
                    boundaryGap: false,
                    data: chartData.map((d) => d.date),
                    axisLabel: { interval: 0, rotate: 45 },
                },
                yAxis: { type: "value", name: "Users" },
                dataZoom: showDataZoom ? [
                    { type: 'slider', show: true, start: 0, end: 20, xAxisIndex: 0 },
                    { type: 'inside', xAxisIndex: 0 }
                ] : [],
                series: [
                    {
                        name: "Unique Users",
                        type: "line",
                        data: chartData.map((d) => d.uniqueUserCount),
                        smooth: true,
                        showSymbol: true,
                        label: {
                            show: true,
                            position: "top",
                            formatter: "{c}", // just the value
                        }
                    },
                ],
                toolbox: isGenratePDF ? [] : {
                    feature: {
                        saveAsImage: { title: "Save as Image", type: "png" },
                        dataView: { title: "View Data", readOnly: true },
                        magicType: { type: ["line", "bar"], title: { line: "Line", bar: "Bar" } },
                        restore: { title: "Restore" },
                    },
                    show: true,
                },
            };

            chart.setOption(option);
        }

        const handleResize = () => chart?.resize();
        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            chart?.dispose();
        };
    }, [chartData, isGenratePDF]);

    return (
        <div className="sysUsage-card mt-3">
            <Label className="chartLabel">Daily Unique Users</Label>
            {chartData?.length > 0 ? (
                <div ref={chartRef} style={{ width: isGenratePDF ? systemUsageReportWidthPrint : "100%", height: "380px" }} />
            ) : (
                <NoRecordFound />
            )}
        </div>
    );
};

export default ActivityUserTrendLineChart;
