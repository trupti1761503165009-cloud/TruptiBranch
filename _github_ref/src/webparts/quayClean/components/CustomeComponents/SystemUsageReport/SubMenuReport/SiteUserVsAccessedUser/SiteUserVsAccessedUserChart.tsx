import * as React from "react";
import * as echarts from "echarts";
import { Label, PrimaryButton } from "@fluentui/react";
import NoRecordFound from "../../../../CommonComponents/NoRecordFound";
import { systemUsageReportWidthPrint } from "../../../../../../../Common/Constants/CommonConstants";

export interface IStateSiteUsage {
    Id: number;
    StateId: number;
    StateName: string;
    Title: string; // site name
    activeUserCount: number;
    totalUserCount: number;
    difference: number;
    children?: IStateSiteUsage[];

}

export interface ISiteUserVsAccessedUserChartProps {
    chartData: IStateSiteUsage[];
    isGeneratePdf?: boolean;
}

export const StateColor = [
    { cardName: "ACT", colorCode: "#000" },
    { cardName: "NSW", colorCode: "#e74c3c" },
    { cardName: "QLD", colorCode: "#00d5c9" },
    { cardName: "SA", colorCode: "#1300a6" },
    { cardName: "TAS", colorCode: "#6c5ce7" },
    { cardName: "VIC", colorCode: "#f39c12" },
    { cardName: "WA", colorCode: "#1abc9c" },
];

export const SiteUserVsAccessedUserChart: React.FC<ISiteUserVsAccessedUserChartProps> = ({ chartData, isGeneratePdf }) => {
    const chartRef = React.useRef<HTMLDivElement>(null);
    const [drillState, setDrillState] = React.useState<IStateSiteUsage | null>(null);

    // 🔹 Get state color
    const getStateColor = (stateName: string): string => {
        return StateColor.find((s) => s.cardName === stateName)?.colorCode || "#3498db";
    };

    // 🔹 Render State-level Chart
    const renderStateChart = (chart: echarts.ECharts) => {
        const stateMap: Record<string, { active: number; total: number; diff: number; sites: IStateSiteUsage[] }> = {};

        chartData.forEach((item) => {
            if (!stateMap[item.StateName]) {
                stateMap[item.StateName] = { active: 0, total: 0, diff: 0, sites: [] };
            }
            stateMap[item.StateName].active += item.activeUserCount;
            stateMap[item.StateName].total += item.totalUserCount;
            stateMap[item.StateName].diff += item.difference;
            stateMap[item.StateName].sites.push(item);
        });

        const categories = Object.keys(stateMap);
        const activeCounts = categories.map((c) => stateMap[c].active);
        const totalCounts = categories.map((c) => stateMap[c].total);
        const diffCounts = categories.map((c) => stateMap[c].diff);
        const siteCounts = categories.map((c) => stateMap[c].sites.length);

        const option: echarts.EChartsOption = {
            title: { text: "Portal Usage by State", left: "left" },
            tooltip: { trigger: "axis" },
            // legend: { data: ["Active Users", "Total Users", "Difference", "Sites Count"] },
            legend: { data: ["Active Users", "Total Users", "Sites Count"] },
            xAxis: { type: "category", data: categories, axisLabel: { rotate: 15, interval: 0 } },
            yAxis: [
                { type: "value", name: "User Count" },
                {
                    type: "value",
                    name: "Sites Count",
                    position: "right",
                    axisLine: { show: false },
                    splitLine: { show: false },
                },
            ],
            toolbox: isGeneratePdf ? [] : {
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
            },
            series: [
                {
                    name: "Active Users",
                    type: "bar",
                    data: activeCounts,
                    itemStyle: {
                        color: (params: any) => getStateColor(categories[params.dataIndex])
                    },
                    barMaxWidth: 40,
                    label: { show: true, position: "top", formatter: "{c}" }
                },
                {
                    name: "Total Users",
                    type: "bar",
                    data: totalCounts,
                    itemStyle: { color: "#dda563" },
                    barMaxWidth: 40,
                    label: { show: true, position: "top", formatter: "{c}" }
                },
                // {
                //     name: "Difference",
                //     type: "bar",
                //     data: diffCounts,
                //     itemStyle: { color: "#519393" },
                //     barMaxWidth: 40,
                //     label: { show: true, position: "top", formatter: "{c}" }
                // },
                {
                    name: "Sites Count",
                    type: "line",
                    yAxisIndex: 1,
                    data: siteCounts,
                    smooth: true,
                    symbol: "circle",
                    symbolSize: 8,
                    lineStyle: { width: 2 },
                    label: { show: true, position: "top", formatter: "{c}" }
                }
            ]
        };

        chart.setOption(option);

        // Drill-down to sites
        chart.off("click");
        chart.on("click", (params: any) => {
            const clickedState = stateMap[params.name];
            if (clickedState?.sites?.length > 0) {
                setDrillState({ StateName: params.name, children: clickedState.sites } as any);
            }
        });
    };

    // 🔹 Render Site-level Chart
    const renderSiteChart = (chart: echarts.ECharts, state: IStateSiteUsage) => {
        const sites = state.children || [];
        const categories = sites.map((s) => s.Title);
        const activeCounts = sites.map((s) => s.activeUserCount);
        const totalCounts = sites.map((s) => s.totalUserCount);
        const diffCounts = sites.map((s) => s.difference);
        const showDataZoom = categories.length > 10;
        const option: echarts.EChartsOption = {
            title: { text: `Sites in ${state.StateName}`, left: "left" },
            tooltip: { trigger: "axis" },
            legend: { data: ["Active Users", "Total Users",] },
            xAxis: { type: "category", data: categories, axisLabel: { rotate: 15, interval: 0 } },
            yAxis: { type: "value", name: "User Count" },
            series: [
                {
                    name: "Active Users",
                    type: "bar",
                    data: activeCounts,
                    itemStyle: { color: "#3498db" },
                    barMaxWidth: 40,
                    label: { show: true, position: "top", formatter: "{c}" }
                },
                {
                    name: "Total Users",
                    type: "bar",
                    data: totalCounts,
                    itemStyle: { color: "#dda563" },
                    barMaxWidth: 40,
                    label: { show: true, position: "top", formatter: "{c}" }
                },
                // {
                //     name: "Difference",
                //     type: "bar",
                //     data: diffCounts,
                //     itemStyle: { color: "#519393" },
                //     barMaxWidth: 40,
                //     label: { show: true, position: "top", formatter: "{c}" }
                // },

            ], dataZoom: showDataZoom
                ? [
                    { type: "slider", show: true, start: 0, end: 20, xAxisIndex: 0 },
                    { type: "inside", xAxisIndex: 0 },
                ]
                : [],
            toolbox: isGeneratePdf ? [] : {
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
            },
        };

        chart.setOption(option);
    };

    // 🔹 Back
    const backLevel = () => setDrillState(null);

    React.useEffect(() => {
        if (!chartRef.current) return;
        const myChart = echarts.init(chartRef.current);

        if (drillState) {
            renderSiteChart(myChart, drillState);
        } else {
            renderStateChart(myChart);
        }

        const handleResize = () => myChart.resize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            myChart.dispose();
        };
    }, [chartData, drillState, isGeneratePdf]);

    return (
        <div className="sysUsage-card mt-3">
            {drillState && (
                <div className="dflex">
                    <div className="mla">
                        <PrimaryButton
                            className="btn btn-primary"
                            onClick={backLevel} text="Back" />
                    </div>
                </div>
            )}
            {chartData?.length > 0 ? (
                <div ref={chartRef} style={{ width: isGeneratePdf ? systemUsageReportWidthPrint : "100%", height: "400px" }} />
            ) : (
                <div>
                    <Label className="chartLabel">Portal Usage</Label>
                    <NoRecordFound />
                </div>
            )}
        </div>
    );
};
