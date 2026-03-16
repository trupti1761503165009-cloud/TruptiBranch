import * as React from "react";
import * as echarts from "echarts";
import { PropertyPaneSlider } from "@microsoft/sp-property-pane";
import { Label, PrimaryButton } from "@fluentui/react";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";
import { StateColor } from "../../../../../../Common/Constants/CommonConstants";

export interface ITopLowStateChartProps {
    chartData: any[];
    isHideState?: boolean
    isGenratePdf?: boolean;
    width?: string

}

export const TopLowStateChart: React.FC<ITopLowStateChartProps> = ({ chartData, isHideState, isGenratePdf, width }) => {
    const chartRef = React.useRef<HTMLDivElement>(null);

    // 🔹 Drill states
    const [drillState, setDrillState] = React.useState<any | null>(null);   // Level 2 (Sites)
    const [drillSite, setDrillSite] = React.useState<any | null>(null);     // Level 3 (EntityTypes)



    const renderStateChart = (chart: echarts.ECharts) => {
        // 🔹 Map state -> colorCode
        const stateColorMap: Record<string, string> = StateColor.reduce((acc, cur) => {
            acc[cur.cardName] = cur.colorCode;
            return acc;
        }, {} as Record<string, string>);

        const categories = chartData.map((item) => item.state);
        const stateCounts = chartData.map((item) => item.count);
        const siteCounts = chartData.map((item) => item.sitesCount);

        const option: echarts.EChartsOption = {
            title: { text: "Portal Usage by State", left: "left" },
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "cross" },
                formatter: (params: any) => {
                    const idx = params[0].dataIndex;
                    const item = chartData[idx];
                    const seriesData = params
                        .map((p: any) => `${p.marker} ${p.seriesName}: ${p.value}`)
                        .join("<br/>");

                    return `<div>
                    <b>${item.state}</b><br/>
                    ${seriesData}
                </div>`;
                },
            },
            legend: { data: ["Activity Count", "Sites Count"] },
            xAxis: [{ type: "category", data: categories, axisTick: { alignWithLabel: true } }],
            yAxis: [
                { type: "value", name: "Activity Count" },
                {
                    type: "value",
                    name: "Sites Count",
                    position: "right",
                    axisLine: { show: false },
                    splitLine: { show: false },
                },
            ],
            toolbox: isGenratePdf ? [] : {
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
                    name: "Activity Count",
                    type: "bar",
                    data: chartData.map((item) => ({
                        value: item.count,
                        itemStyle: { color: stateColorMap[item.state] || "#999" }, // fallback color
                    })),
                    itemStyle: {
                        color: (params: any) => {
                            // generate random color for each bar
                            const colors = [
                                "#519393", "#dda563", "#fac858", "#73c0de", "#3ba272",
                                "#fc8452", "#9a60b4", "#ea7ccc"
                            ];
                            return colors[params.dataIndex % colors.length];
                        },
                    },
                    label: {
                        show: true,
                        position: "top",
                        formatter: "{c}",
                    },
                },
                {
                    name: "Sites Count",
                    type: "line",
                    yAxisIndex: 1,
                    data: siteCounts,
                    smooth: true,
                    symbol: "circle",
                    symbolSize: 8,
                    lineStyle: { width: 2 },
                    label: { show: true, formatter: "{c}", position: "top" },
                },
            ],
        };

        chart.setOption(option);

        // 🔹 Drill-down to sites
        chart.off("click");
        chart.on("click", (params: any) => {
            if (params.componentType === "series" && params.seriesType === "bar") {
                const item = chartData[params.dataIndex];
                if (item?.children?.length > 0) {
                    setDrillState(item);
                }
            }
        });
    };
    // 🔹 Render Level 2 (Sites inside State)
    const renderSiteChart = (chart: echarts.ECharts, state: any) => {
        const sites = state.children || [];
        const categories = sites.map((s: any) => s.state); // siteName
        const counts = sites.map((s: any) => s.count);

        const showDataZoom = categories.length > 12;

        const option: echarts.EChartsOption = {
            title: { text: `Sites in ${state.state}`, left: "left" },
            tooltip: { trigger: "axis" },
            xAxis: { type: "category", data: categories, axisLabel: { rotate: 15, interval: 0 } },
            yAxis: { type: "value", name: "Activity Count" },
            series: [{
                name: "Activity Count", type: "bar", data: counts, label: {
                    show: true,
                    position: "top", // can be "inside", "insideTop", etc.
                    formatter: "{c}", // {c} = value
                },
                itemStyle: {
                    color: (params: any) => {
                        const colors = [
                            "#519393", "#dda563", "#fac858", "#73c0de", "#3ba272",
                            "#fc8452", "#9a60b4", "#ea7ccc"
                        ];
                        return colors[params.dataIndex % colors.length];
                    },
                },
            }],
            toolbox: isGenratePdf ? [] : {
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
            dataZoom: showDataZoom
                ? [
                    { type: "slider", show: true, start: 0, end: 50, xAxisIndex: 0 },
                    { type: "inside", xAxisIndex: 0 },
                ]
                : [],
        };

        chart.setOption(option);

        // 🔹 Drill to EntityTypes
        chart.off("click");
        chart.on("click", (params: any) => {
            const selectedSite = sites[params.dataIndex];
            if (selectedSite?.children?.length > 0) {
                setDrillSite({ ...selectedSite, parentState: state.state });
            }
        });
    };

    // 🔹 Render Level 3 (EntityTypes inside Site)
    const renderEntityTypeChart = (chart: echarts.ECharts, site: any) => {
        const items = site.children || [];

        // Group by EntityType
        const entityMap: Record<string, number> = {};
        items.forEach((i: any) => {
            // entityMap[i.entity] = (entityMap[i.entity] || 0) + 1;
            entityMap[i.entity] = i.count || 0;
        });

        const categories = Object.keys(entityMap);
        const counts = Object.values(entityMap);
        let showDataZoom: boolean = false;
        showDataZoom = categories.length > 16
        const option: echarts.EChartsOption = {
            title: { text: `Entity Types in ${site.stateName || site.state} (${site.parentState})`, left: "left" },
            tooltip: {
                trigger: "item",
                formatter: (params: any) => {
                    const entityType = params.name;
                    return `<b>${entityType}</b><br/>
                       Entity Count: ${params.value}<br/>`;
                },
            },
            xAxis: { type: "category", data: categories, axisLabel: { rotate: 15, interval: 0 } },
            yAxis: { type: "value", name: "Entity Count" },
            series: [
                {
                    name: "Entity Count",
                    type: "bar",
                    data: counts,
                    itemStyle: { color: "#fac858" },
                    label: {
                        show: true,
                        position: "top", // can be "inside", "insideTop", etc.
                        formatter: "{c}", // {c} = value
                    }
                },
            ],
            toolbox: isGenratePdf ? [] : {
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
            dataZoom: showDataZoom ? [
                { type: 'slider', show: true, start: 0, end: 50, xAxisIndex: 0 },
                { type: 'inside', xAxisIndex: 0 }
            ] : [],
        };

        chart.setOption(option);
    };

    // 🔹 Back Navigation
    const backLevel = () => {
        if (drillSite) setDrillSite(null);
        else if (drillState) setDrillState(null);
    };

    React.useEffect(() => {
        if (!chartRef.current) return;
        const myChart = echarts.init(chartRef.current);

        if (drillSite) renderEntityTypeChart(myChart, drillSite);
        else if (drillState) renderSiteChart(myChart, drillState);
        else renderStateChart(myChart);

        const handleResize = () => myChart.resize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            myChart.dispose();
        };
    }, [chartData, drillState, drillSite, width]);

    return (
        <div className="sysUsage-card mt-3">
            {(drillState || drillSite) && (
                <div className="dflex">
                    <div className="mla">
                        {/* <button
                            onClick={backLevel}
                            style={{
                                padding: "0px 5px",
                                backgroundColor: "#dda563",
                                color: "#fff",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                            }}
                        >
                            Back
                        </button> */}
                        <PrimaryButton
                            onClick={backLevel}
                            className="btn btn-primary"
                            text="Back"
                        />
                    </div>
                </div>
            )}
            {/* <div ref={chartRef} style={{ width: "100%", height: "380px" }} /> */}
            {chartData?.length > 0 ?
                // <div ref={chartRef} style={{ width: "100%", height: "380px" }} /> :
                <div ref={chartRef} style={{ width: !!width ? width : "100%", height: "380px" }} /> :
                <div>
                    <Label className="chartLabel">Portal Usage by Site</Label>
                    <NoRecordFound /></div>
            }
        </div>
    );
};
