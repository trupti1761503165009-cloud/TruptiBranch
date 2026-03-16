import * as React from "react";
import * as echarts from "echarts";
import { PropertyPaneSlider } from "@microsoft/sp-property-pane";
import { Label, PrimaryButton } from "@fluentui/react";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";

export interface ICombinedUsageStateChartProps {
    chartData: any[];
    width?: string
    isGenratePdf?: boolean;

}

export const CombinedUsageStateChart: React.FC<ICombinedUsageStateChartProps> = ({ chartData, width, isGenratePdf }) => {
    const chartRef = React.useRef<HTMLDivElement>(null);

    // 🔹 State for drilldown levels
    const [drillData, setDrillData] = React.useState<any | null>(null);   // Level 2 (Entity Types)
    const [drillEntity, setDrillEntity] = React.useState<any | null>(null); // Level 3 (Sites)

    // 🔹 Render Level 1 (Main Chart: States)
    const renderMainChart = (chart: echarts.ECharts) => {
        const colors = ["#dda563", "#519393", "#ff7f0e"];
        const categories = chartData.map((item) => item.Title);
        const totalSites = chartData.map((item) => item.totalSiteCount);
        const activeSites = chartData.map((item) => item.activeSiteCount);
        const withAccess = chartData.map((item) =>
            parseFloat(item.difference?.toString().replace("%", "")) || 0
        );

        const option: echarts.EChartsOption = {
            color: colors,
            title: { text: `Portal Usage by State`, left: "left" },
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "cross" },
                formatter: (params: any) => {
                    const idx = params[0].dataIndex;
                    const item = chartData[idx];
                    const seriesData = params
                        .map(
                            (p: any) =>
                                `${p.marker} ${p.seriesName}: ${p.value}${p.seriesName === "% With Access" ? "%" : ""}`
                        )
                        .join("<br/>");
                    const topInteractions =
                        item.topEntityTypesCount?.length > 0
                            ? item.topEntityTypesCount
                                .map((t: any) => `${t.entityType} (${t.count})`)
                                .join(", <br/>")
                            : "-";
                    return `<div>
                        <b>${item.Title}</b><br/>
                        ${seriesData}<br/>
                        Active Users: ${item.activeUsersCount}<br/>
                        Avg Login/Day: ${item.avgLoginsDay}<br/>
                        Top Interactions: ${topInteractions}
                    </div>`;
                },
            },
            legend: { data: ["Total Sites", "Active Sites", "% With Access"] },
            xAxis: [{ type: "category", axisTick: { alignWithLabel: true }, data: categories }],
            yAxis: [
                { type: "value", name: "Activity Count" },
                {
                    type: "value",
                    name: "% With Access",
                    position: "right",
                    axisLabel: { formatter: "{value}%" },
                    axisLine: { show: false },
                    splitLine: { show: false },
                },
            ],
            toolbox: isGenratePdf ? [] :
                {
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
                    name: "Total Sites", type: "bar", data: totalSites, label: {
                        show: true,
                        position: "top", // can be "inside", "insideTop", etc.
                        formatter: "{c}", // {c} = value

                    },
                },
                {
                    name: "Active Sites", type: "bar", data: activeSites, label: {
                        show: true,
                        position: "top", // can be "inside", "insideTop", etc.
                        formatter: "{c}", // {c} = value
                    },
                },
                {
                    name: "% With Access",
                    type: "line",
                    yAxisIndex: 1,
                    data: withAccess,
                    smooth: true,
                    symbol: "circle",
                    symbolSize: 8,
                    lineStyle: { width: 2 },
                    label: { show: true, formatter: "{c}%", position: "top" },
                },
            ],
        };

        chart.setOption(option);

        // 🔹 Drill-down to Level 2 (Entity Types)
        chart.off("click");
        chart.on("click", (params: any) => {
            if (params.componentType === "series" && params.seriesType === "bar") {
                const item = chartData[params.dataIndex];
                if (item?.topEntityTypesCount?.length > 0) {
                    setDrillData(item);
                }
            }
        });
    };

    // 🔹 Render Level 2 (Entity Types)
    const renderDrillChart = (chart: echarts.ECharts, parent: any) => {
        const topEntities = parent.topEntityTypesCount || [];
        const categories = topEntities.map((e: any) => e.entityType);
        const counts = topEntities.map((e: any) => e.count);

        const option: echarts.EChartsOption = {
            title: { text: `Portal Usage by State - ${parent.Title}`, left: "left" },
            tooltip: { trigger: "item", formatter: (params: any) => `<b>${params.name}</b><br/>Activity Count: ${params.value}` },
            xAxis: { type: "category", data: categories, axisLabel: { rotate: 15 } },
            yAxis: { type: "value", name: "Activity  Count" },
            series: [{
                name: "Entity Count", type: "bar", data: counts, itemStyle: { color: "#519393" }, label: {
                    show: true,
                    position: "top", // can be "inside", "insideTop", etc.
                    formatter: "{c}", // {c} = value
                }
            }],
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
        };

        chart.setOption(option);

        // 🔹 Drill-down to Level 3 (Sites)
        chart.off("click");
        chart.on("click", (params: any) => {
            if (params.componentType === "series" && params.seriesType === "bar") {
                const entity = topEntities[params.dataIndex];
                if (entity?.childrenSites?.length > 0) {
                    setDrillEntity({ ...entity, parentTitle: parent.Title });
                }
            }
        });
    };



    const renderSiteChart = (chart: echarts.ECharts, entity: any) => {
        const sites = entity.childrenSites || [];

        // Group by SiteName and ActionType
        const siteMap: Record<string, Record<string, number>> = {};
        sites.forEach((s: any) => {
            if (!siteMap[s.SiteName]) siteMap[s.SiteName] = {};
            siteMap[s.SiteName][s.ActionType] = (siteMap[s.SiteName][s.ActionType] || 0) + 1;
        });

        const categories = Object.keys(siteMap);
        const counts = categories.map((site) => Object.keys(siteMap[site]).length); // unique ActionTypes per site
        let showDataZoom: boolean = false;
        showDataZoom = categories.length > 12
        const option: echarts.EChartsOption = {
            title: { text: `Portal Usage - ${entity.parentTitle} / ${entity.entityType}`, left: "left" },
            tooltip: {
                trigger: "item",
                formatter: (params: any) => {
                    const siteName = params.name;
                    const actions = siteMap[siteName] || {};
                    const uniqueCount = Object.keys(actions).length;

                    // Build action list with counts
                    const actionList = Object.entries(actions)
                        .map(([action, count]) => `${action}: ${count}`)
                        .join("<br/>");

                    return `<b>${siteName}</b><br/>
                        ${actionList}`;
                }
            },
            xAxis: { type: "category", data: categories, axisLabel: { rotate: 15, interval: 0 } },
            dataZoom: showDataZoom ? [
                { type: 'slider', show: true, start: 0, end: 50, xAxisIndex: 0 },
                { type: 'inside', xAxisIndex: 0 }
            ] : [],
            yAxis: { type: "value", name: "Unique ActionType Count" },
            series: [{
                name: "Unique ActionType Count",
                type: "bar",
                data: counts,
                itemStyle: { color: "#d5795f" }
                , label: {
                    show: true,
                    position: "top", // can be "inside", "insideTop", etc.
                    formatter: "{c}", // {c} = value
                }
            }],
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
        };

        chart.setOption(option);
    };

    // 🔹 Back navigation (works across levels)
    const backLevel = () => {
        if (drillEntity) setDrillEntity(null);
        else if (drillData) setDrillData(null);
    };

    React.useEffect(() => {
        if (!chartRef.current) return;
        const myChart = echarts.init(chartRef.current);

        if (drillEntity) renderSiteChart(myChart, drillEntity);
        else if (drillData) renderDrillChart(myChart, drillData);
        else renderMainChart(myChart);

        const handleResize = () => myChart.resize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            myChart.dispose();
        };
    }, [chartData, drillData, drillEntity, width]);

    return (
        <div className="sysUsage-card mt-3 ">
            {(drillData || drillEntity) && (
                <div className='dflex'>
                    <div className='mla'>
                        {/* <button
                            onClick={() => backLevel()}
                            style={{
                                marginBottom: '0px',
                                padding: '0px 5px',
                                backgroundColor: '#5470C6',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
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
            {/* <div ref={chartRef} style={{ width: "auto", height: "380px" }} /> */}
        </div>
    );
};

