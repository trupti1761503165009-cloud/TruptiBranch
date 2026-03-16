import * as React from "react";
import * as echarts from "echarts";
import { Label } from "@fluentui/react";
import NoRecordFound from "../../../../CommonComponents/NoRecordFound";
import { systemUsageReportWidthPrint } from "../../../../../../../Common/Constants/CommonConstants";

export interface IUserLevelEngagementScoreChartProps {
    chartData: any[];
    isGenratePdf?: boolean;

}

export const UserLevelEngagementScoreChart: React.FC<IUserLevelEngagementScoreChartProps> = ({ chartData, isGenratePdf }) => {
    const chartRef = React.useRef<HTMLDivElement>(null);

    // 🔹 Render Chart
    const renderChart = (chart: echarts.ECharts) => {
        const categories = chartData.map(u => u.userName);
        const totalCounts = chartData.map(u => u.totalActivities);
        const loginCounts = chartData.map(u => u.loginCount);

        let seriesData: any = [
            {
                name: "Total Activities",
                type: "bar",
                data: totalCounts,
                // itemStyle: { color: "#3498db" },

                label: { show: true, position: "top", formatter: "{c}" },
            },
        ]

        seriesData.push({

            name: "Login Count",
            type: "bar",
            data: loginCounts,
            // itemStyle: { color: "#dda563" },
            label: { show: true, position: "top", formatter: "{c}" },

        })


        const option: echarts.EChartsOption = {
            // title: { text: "User Engagement (Activities vs Logins)", left: "center" },
            tooltip: { trigger: "axis" },
            color: ["#dda563", "#519393"],
            legend: { data: ["Total Activities", "Login Count"], top: "Top" },
            xAxis: { type: "category", data: categories, axisLabel: { rotate: 20, interval: 0 } },
            yAxis: { type: "value", name: "Count" },
            series: seriesData,

            dataZoom: categories.length > 12
                ? [
                    { type: "slider", show: true, start: 0, end: 20, xAxisIndex: 0 },
                    { type: "inside", xAxisIndex: 0 },
                ]
                : [],
            toolbox: isGenratePdf ? [] : {
                feature: {
                    saveAsImage: { title: "Save as Image", type: "png" },
                    dataView: { title: "View Data", readOnly: true },
                    magicType: { type: ["line", "bar"] },
                    restore: { title: "Restore" },
                },
                show: true,
            },
        };

        chart.setOption(option);
    };

    React.useEffect(() => {
        if (!chartRef.current) return;
        const myChart = echarts.init(chartRef.current);

        if (chartData && chartData.length > 0) {
            renderChart(myChart);
        }

        const handleResize = () => myChart.resize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            myChart.dispose();
        };
    }, [chartData, isGenratePdf]);

    return (
        <div className="sysUsage-card mt-3">
            <div className="flex justify-between items-center mb-2">
                <Label className="chartLabel">User Engagement </Label>
            </div>
            {chartData?.length > 0 ? (
                <div ref={chartRef} style={{ width: isGenratePdf ? systemUsageReportWidthPrint : "100%", height: "400px" }} />
            ) : (
                <div>
                    <NoRecordFound />
                </div>
            )}
        </div>
    );
};
