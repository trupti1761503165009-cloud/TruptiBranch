import * as React from "react";
import * as echarts from "echarts";
import { Label, PrimaryButton } from "@fluentui/react";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";

export interface ITopLowSitesChartProps {
    chartData: any[]; // Directly sites array
    width?: string
    isGenratePdf?: boolean;
}

export const TopLowSitesChart: React.FC<ITopLowSitesChartProps> = ({ chartData, width, isGenratePdf }) => {
    const chartRef = React.useRef<HTMLDivElement>(null);

    // 🔹 Drill into EntityTypes
    const [drillSite, setDrillSite] = React.useState<any | null>(null);

    // 🔹 Render Level 1 (Sites)
    const renderSitesChart = (chart: echarts.ECharts) => {
        const categories = chartData.map((s: any) => s.site);
        const counts = chartData.map((s: any) => s.count);

        const showDataZoom = categories.length > 12;

        const option: echarts.EChartsOption = {
            title: { text: "Portal Usage by Site", left: "left" },
            tooltip: { trigger: "axis" },
            xAxis: { type: "category", data: categories, axisLabel: { rotate: 15, interval: 0 } },
            yAxis: { type: "value", name: "Activity Count" },
            series: [{
                name: "Activity Count", type: "bar", data: counts, itemStyle: {
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
                    position: "top", // can be "inside", "insideTop", etc.
                    formatter: "{c}", // {c} = value
                },
            },],
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
            const selectedSite = chartData[params.dataIndex];
            if (selectedSite?.children?.length > 0) {
                setDrillSite(selectedSite);
            }
        });
    };

    // 🔹 Render Level 2 (EntityTypes inside Site)
    const renderEntityTypeChart = (chart: echarts.ECharts, site: any) => {
        const items = site.children || [];

        // Group by EntityType
        const entityMap: Record<string, number> = {};
        items.forEach((i: any) => {
            entityMap[i.entity] = (entityMap[i.entity] || 0) + (i.count || 0);
        });

        const categories = Object.keys(entityMap);
        const counts = Object.values(entityMap);

        const showDataZoom = categories.length > 16;

        const option: echarts.EChartsOption = {
            title: { text: `Entity Types in ${site.site} (${site.stateName})`, left: "left" },
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
                    itemStyle: {
                        color: (params: any) => {
                            const colors = [
                                "#519393", "#dda563", "#fac858", "#73c0de", "#3ba272",
                                "#fc8452", "#9a60b4", "#ea7ccc"
                            ];
                            return colors[params.dataIndex % colors.length];
                        },
                    },
                    label: {
                        show: true,
                        position: "top", // can be "inside", "insideTop", etc.
                        formatter: "{c}", // {c} = value
                    },
                },
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
            },
            dataZoom: showDataZoom
                ? [
                    { type: "slider", show: true, start: 0, end: 50, xAxisIndex: 0 },
                    { type: "inside", xAxisIndex: 0 },
                ]
                : [],
        };

        chart.setOption(option);
    };

    // 🔹 Back Navigation
    const backLevel = () => {
        if (drillSite) {
            setDrillSite(null); // back to sites
        }
    };

    React.useEffect(() => {
        if (!chartRef.current) return;
        const myChart = echarts.init(chartRef.current);

        if (drillSite) {
            renderEntityTypeChart(myChart, drillSite);
        } else {
            renderSitesChart(myChart);
        }

        const handleResize = () => myChart.resize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            myChart.dispose();
        };
    }, [chartData, drillSite, width]);

    return (
        <div className="sysUsage-card mt-3">
            {drillSite && (
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
            {chartData?.length > 0 ?
                <div ref={chartRef} style={{ width: !!width ? width : "100%", height: "380px" }} /> :
                <div>
                    <Label className="chartLabel">Portal Usage by Site</Label>
                    <NoRecordFound /></div>
            }
        </div>
    );
};
