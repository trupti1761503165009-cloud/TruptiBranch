// /* eslint-disable */
// import * as React from "react";
// import * as echarts from "echarts";
// import { defaultBarColors, HazardFields } from "../../../../../../../Common/Enum/HazardFields";
// import NoRecordFound from "../../../../CommonComponents/NoRecordFound";
// import { Label } from "office-ui-fabric-react";

// // State wise
// export const buildStateWiseData = (data: any[]) => {
//     const states = Array.from(new Set(data.map(d => d.State ?? "Unknown")));

//     const result = states.map(s => {
//         const filtered = data.filter(d => (d.State ?? "Unknown") === s);

//         return {
//             name: s,
//             value: filtered.length,
//             tooltip: `
//         <b>State:</b> ${s}<br/>
//         <b>Total Cases:</b> ${filtered.length}<br/>
//         <b>Sites:</b> ${new Set(filtered.map(d => d.SiteName)).size}<br/>
//         <b>Hazard Types:</b> ${new Set(filtered.map(d => d.HazardType)).size}<br/>
//         <b>Sub Hazard Types:</b> ${new Set(filtered.map(d => d.HazardSubType)).size}
//       `,
//         };
//     });

//     return result.sort((a, b) => b.value - a.value);
// };

// // Site
// export const buildSiteWiseData = (data: any[]) => {
//     const sites = Array.from(new Set(data.map(d => d.SiteName)));

//     const result = sites.map(s => {
//         const filtered = data.filter(d => (d.SiteName ?? "Unknown") === s);

//         return {
//             name: s,
//             value: filtered.length,
//             tooltip: `
//         <b>Site:</b> ${s}<br/>
//         <b>Total Cases:</b> ${filtered.length}<br/>
//         <b>Hazard Types:</b> ${new Set(filtered.map(d => d.HazardType)).size}<br/>
//         <b>Sub Hazard Types:</b> ${new Set(filtered.map(d => d.HazardSubType)).size}
//       `,
//         };
//     });

//     return result.sort((a, b) => b.value - a.value);
// };

// // Hazard
// export const buildHazardWiseData = (data: any[]) => {
//     const hazards = Array.from(new Set(data.map(d => d.HazardType)));
//     const result = hazards.map(h => {
//         const filtered = data.filter(
//             d => (d.HazardType ?? "Unknown") === h
//         );

//         return {
//             name: h,
//             value: filtered.length,
//             tooltip: `
//         <b>Hazard Type:</b> ${h}<br/>
//         <b>Total Cases:</b> ${filtered.length}<br/>
//         <b>Sub Hazard Types:</b> ${new Set(filtered.map(d => d.HazardSubType)).size}
//       `,
//         };
//     });

//     return result.sort((a, b) => b.value - a.value);
// };

// // Sub Hazard
// export const buildSubHazardWiseData = (data: any[]) => {
//     const subHazards = Array.from(new Set(data.map(d => d.HazardSubType ?? "Unknown")));

//     const result = subHazards.map(sh => {
//         const filtered = data.filter(d => (d.HazardSubType ?? "Unknown") === sh);

//         return {
//             name: sh,
//             value: filtered.length,
//             tooltip: `
//         <b>Sub Hazard:</b> ${sh}<br/>
//         <b>Total Cases:</b> ${filtered.length}
//       `,
//         };
//     });

//     return result.sort((a, b) => b.value - a.value);
// };

// // Submission date
// export const buildSubmissionDateWiseData = (data: any[]) => {

//     const dates = Array.from(new Set(data.map(d => d.SubmissionDate)));

//     const result = dates.map(dt => {
//         const filtered = data.filter(d => d.SubmissionDate === dt);

//         return {
//             name: dt,
//             value: filtered.length,
//             tooltip: `
//         <b>Date:</b> ${dt}<br/>
//         <b>Total Cases:</b> ${filtered.length}<br/>
//         <b>Hazard Types:</b> ${Array.from(new Set(filtered.map(d => d.HazardType))).length}<br/>
//         <b>Sub Hazard Types:</b> ${Array.from(new Set(filtered.map(d => d.HazardSubType))).length}
//       `,
//         };
//     });

//     return result.sort((a, b) => b.value - a.value);
// };

// const getToolboxPie = () => ({
//     show: true,
//     feature: {
//         saveAsImage: { title: "Save" },
//         dataView: { title: "View Data", readOnly: true },
//         restore: {},
//     },
// });

// const getToolboxBar = (): echarts.ToolboxComponentOption => ({
//     show: true,
//     feature: {
//         saveAsImage: { title: "Save" },
//         dataView: { title: "View Data", readOnly: true },
//         magicType: {
//             type: ["line", "bar"] as ("line" | "bar")[],
//             title: { line: "Switch to Line Chart", bar: "Switch to Bar Chart" }
//         },
//         restore: { title: "Restore" }
//     }
// });

// const DashboardBarChart: React.FC<{ data: any[]; level: any; title: any; isPDFGenerating?: any; width?: any, height?: any }> = ({ data, level, title, isPDFGenerating, width, height }) => {
//     const chartRef = React.useRef<HTMLDivElement>(null);

//     React.useEffect(() => {
//         if (!chartRef.current) return;

//         const chart = echarts.init(chartRef.current);

//         let chartData: any[] = [];

//         if (level === HazardFields.State) chartData = buildStateWiseData(data);
//         if (level === HazardFields.SiteName) chartData = buildSiteWiseData(data);
//         if (level === HazardFields.HazardType) chartData = buildHazardWiseData(data);
//         if (level === HazardFields.HazardSubType) chartData = buildSubHazardWiseData(data);
//         if (level === HazardFields.SubmissionDate) chartData = buildSubmissionDateWiseData(data);

//         let option: echarts.EChartsOption;
//         // Pie chart for State & Hazard Type
//         if (level === HazardFields.State || level === HazardFields.HazardType) {
//             option = {
//                 title: {
//                     text: title,
//                     left: "left",
//                     top: 5,
//                 },
//                 tooltip: {
//                     trigger: "item",
//                     formatter: (p: any) => chartData[p.dataIndex].tooltip,
//                 },
//                 toolbox: isPDFGenerating ? [] : getToolboxPie(),
//                 // toolbox: getToolboxPie(),
//                 legend: {
//                     orient: "horizontal",
//                     bottom: 10,
//                     left: "center",
//                     itemWidth: 14,
//                     itemHeight: 14,
//                     textStyle: {
//                         fontSize: 12
//                     }
//                 },
//                 series: [
//                     {
//                         type: "pie",
//                         radius: "70%",
//                         center: ["50%", "50%"],
//                         data: chartData.map((item, idx) => ({
//                             ...item,
//                             itemStyle: {
//                                 color: defaultBarColors[idx % defaultBarColors.length],
//                             }
//                         })),
//                         label: {
//                             formatter: (p: any) => `${p.name}: ${p.value}`
//                         },
//                         emphasis: {
//                             scale: true,
//                             label: {
//                                 show: true,
//                                 fontSize: 16,
//                                 fontWeight: "bold",
//                                 formatter: (p: any) => `${p.name}: ${p.value}`
//                             },
//                         },
//                     }
//                 ]
//             };
//         }
//         // Bar for others
//         else {
//             option = {
//                 title: {
//                     text: title,
//                     left: "left",
//                     top: 5,
//                 },
//                 tooltip: {
//                     trigger: "item",
//                     formatter: (p: any) => chartData[p.dataIndex].tooltip,
//                 },
//                 toolbox: getToolboxBar(),
//                 xAxis: {
//                     type: "category",
//                     data: chartData.map(i => i.name),
//                     axisLabel: { rotate: 20 },
//                 },
//                 yAxis: { type: "value" },
//                 series: [
//                     {
//                         type: "bar",
//                         data: chartData.map((item, idx) => ({
//                             value: item.value,
//                             itemStyle: {
//                                 color: defaultBarColors[idx % defaultBarColors.length],
//                             },
//                             label: { show: true, position: "top" },
//                         })),
//                     },
//                 ],
//             };
//         }

//         chart.setOption(option);

//         return () => chart.dispose();
//     }, [data, level, title]);

//     return (
//         <div className="sysUsage-card mt-3">

//             {data?.length > 0 ? (
//                 <div ref={chartRef} style={{ width: !!width ? width : "100%", height: height ? height : "400px" }} />

//             ) : (
//                 <div>
//                     <Label className="chartLabel">{title}</Label>
//                     <NoRecordFound />
//                 </div>
//             )}
//         </div>
//     );
// };

// export default DashboardBarChart;

/* eslint-disable */
import * as React from "react";
import * as echarts from "echarts";
import { defaultBarColors, HazardFields } from "../../../../../../../Common/Enum/HazardFields";
import NoRecordFound from "../../../../CommonComponents/NoRecordFound";
import { Label } from "office-ui-fabric-react";

// group by key
const groupBy = <T extends Record<string, any>>(arr: T[], key: keyof T) =>
    arr.reduce((acc, item) => {
        const val = item[key] ?? "Unknown";
        if (!acc[val]) acc[val] = [];
        acc[val].push(item);
        return acc;
    }, {} as Record<string, T[]>);

const safe = (v: any) => String(v ?? "").replace(/[<>]/g, "");

export const buildStateWiseData = (data: any[]) => {
    const grouped = groupBy(data, "State");

    return Object.entries(grouped)
        .map(([state, items]) => ({
            name: state,
            value: items.length,
            tooltip: `
        <b>State:</b> ${safe(state)}<br/>
        <b>Total Cases:</b> ${items.length}<br/>
        <b>Sites:</b> ${new Set(items.map(d => d.SiteName)).size}<br/>
        <b>Hazard Types:</b> ${new Set(items.map(d => d.HazardType)).size}<br/>
        <b>Sub Hazard Types:</b> ${new Set(items.map(d => d.HazardSubType)).size}<br/>
         <b>Submitted By:</b> ${new Set(items.map(d => d.SubmittedBy)).size}
      `,
        }))
        .sort((a, b) => b.value - a.value);
};

export const buildSiteWiseData = (data: any[]) => {
    const grouped = groupBy(data, "SiteName");

    return Object.entries(grouped)
        .map(([site, items]) => ({
            name: site,
            value: items.length,
            tooltip: `
        <b>Site:</b> ${safe(site)}<br/>
        <b>Total Cases:</b> ${items.length}<br/>
        <b>Hazard Types:</b> ${new Set(items.map(d => d.HazardType)).size}<br/>
        <b>Sub Hazard Types:</b> ${new Set(items.map(d => d.HazardSubType)).size}<br/>
         <b>Submitted By:</b> ${new Set(items.map(d => d.SubmittedBy)).size}
      `,
        }))
        .sort((a, b) => b.value - a.value);
};

export const buildHazardWiseData = (data: any[]) => {
    const grouped = groupBy(data, "HazardType");

    return Object.entries(grouped)
        .map(([hazard, items]) => ({
            name: hazard,
            value: items.length,
            tooltip: `
        <b>Hazard Type:</b> ${safe(hazard)}<br/>
        <b>Total Cases:</b> ${items.length}<br/>
        <b>Sub Hazard Types:</b> ${new Set(items.map(d => d.HazardSubType)).size}<br/>
         <b>Submitted By:</b> ${new Set(items.map(d => d.SubmittedBy)).size}
      `,
        }))
        .sort((a, b) => b.value - a.value);
};

export const buildSubHazardWiseData = (data: any[]) => {
    const grouped = groupBy(data, "HazardSubType");

    return Object.entries(grouped)
        .map(([subHazard, items]) => ({
            name: subHazard,
            value: items.length,
            tooltip: `
        <b>Sub Hazard:</b> ${safe(subHazard)}<br/>
        <b>Total Cases:</b> ${items.length}
      `,
        }))
        .sort((a, b) => b.value - a.value);
};

// export const buildSubmissionDateWiseData = (data: any[]) => {
//     const grouped = groupBy(data, "SubmissionDate");

//     return Object.entries(grouped)
//         .map(([date, items]) => ({
//             name: date,
//             value: items.length,
//             tooltip: `
//         <b>Date:</b> ${safe(date)}<br/>
//         <b>Total Cases:</b> ${items.length}<br/>
//         <b>Hazard Types:</b> ${new Set(items.map(d => d.HazardType)).size}<br/>
//         <b>Sub Hazard Types:</b> ${new Set(items.map(d => d.HazardSubType)).size}
//       `,
//         })).sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
// };
const parseDMY = (d: string): number => {
    if (!d) return 0;
    const [day, month, year] = d.split("-").map(Number);
    return new Date(year, month - 1, day).getTime();
};

const formatDMY = (date: Date): string => {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
};

export const buildSubmissionDateWiseData = (data: any[]) => {
    const grouped = groupBy(data, "SubmissionDate");

    const allDates = Object.keys(grouped).map(d => parseDMY(d));
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    const result: any[] = [];
    let current = new Date(minDate);

    while (current <= maxDate) {
        const dateStr = formatDMY(current);
        const items = grouped[dateStr] || [];

        result.push({
            name: dateStr,
            value: items.length,
            tooltip: `
<b>Date:</b> ${safe(dateStr)}<br/>
<b>Total Cases:</b> ${items.length}<br/>
<b>Hazard Types:</b> ${items.length ? new Set(items.map(i => i.HazardType)).size : 0}<br/>
<b>Sub Hazard Types:</b> ${items.length ? new Set(items.map(i => i.HazardSubType)).size : 0}<br/>
<b>Submitted By:</b> ${items.length ? new Set(items.map(i => i.SubmittedBy)).size : 0}
`.trim()
        });

        current.setDate(current.getDate() + 1);
    }

    return result;
};

// --- Toolbox ---
const getToolboxPie = () => ({
    show: true,
    feature: {
        saveAsImage: { title: "Save" },
        dataView: { title: "View Data", readOnly: true },
        restore: {},
    },
});

const getToolboxBar = (): echarts.ToolboxComponentOption => ({
    show: true,
    feature: {
        saveAsImage: { title: "Save" },
        dataView: { title: "View Data", readOnly: true },
        magicType: {
            type: ["line", "bar"] as ("line" | "bar")[],
            title: { line: "Switch to Line Chart", bar: "Switch to Bar Chart" },
        },
        restore: { title: "Restore" },
    },
});

// --- Dashboard Component ---
const DashboardBarChart: React.FC<{
    data: any[];
    level: any;
    title: string;
    isPDFGenerating?: boolean;
    width?: string | number;
    height?: string | number;
}> = ({ data, level, title, isPDFGenerating, width, height }) => {
    const divRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<echarts.ECharts | null>(null);

    // const chartData = React.useMemo(() => {
    //     if (level === HazardFields.State) return data;
    //     if (level === HazardFields.SiteName) return buildSiteWiseData(data);
    //     if (level === HazardFields.HazardType) return buildHazardWiseData(data);
    //     if (level === HazardFields.HazardSubType) return buildSubHazardWiseData(data);
    //     if (level === HazardFields.SubmissionDate) return buildSubmissionDateWiseData(data);
    //     return [];
    // }, [data, level]);
    // React.useEffect(() => {
    //     const handleResize = () => chartRef.current?.resize();
    //     window.addEventListener("resize", handleResize);
    //     return () => window.removeEventListener("resize", handleResize);
    // }, []);

    React.useEffect(() => {
        const container = divRef.current;
        if (!container) return;

        if (chartRef.current && chartRef.current.getDom() !== container) {
            chartRef.current.dispose();
            chartRef.current = null;
        }

        if (!chartRef.current) {
            chartRef.current = echarts.init(container);
        }

        const chart = chartRef.current;

        if (!data?.length) {
            chart.clear();
            return;
        }

        let option: echarts.EChartsOption;

        if (level === HazardFields.State || level === HazardFields.HazardType) {
            option = {
                title: { text: title, left: "left", top: 5 },
                tooltip: { trigger: "item", formatter: (p: any) => data[p.dataIndex]?.tooltip },
                toolbox: isPDFGenerating ? undefined : getToolboxPie(),
                legend: {
                    orient: "horizontal",
                    bottom: 10,
                    left: "center",
                    itemWidth: 14,
                    itemHeight: 14,
                    textStyle: { fontSize: 12 },
                },
                series: [
                    {
                        type: "pie",
                        radius: "70%",
                        center: ["50%", "50%"],
                        data: data.map((item, idx) => ({
                            ...item,
                            itemStyle: { color: defaultBarColors[idx % defaultBarColors.length] },
                        })),
                        label: { formatter: (p: any) => `${p.name}: ${p.value}` },
                        emphasis: {
                            scale: true,
                            label: {
                                show: true,
                                fontSize: 16,
                                fontWeight: "bold",
                                formatter: (p: any) => `${p.name}: ${p.value}`,
                            },
                        },
                    },
                ],
            };
        } else {
            const isLineChart = level === HazardFields.SubmissionDate;
            option = {
                title: { text: title, left: "left", top: 5 },
                tooltip: { trigger: "item", formatter: (p: any) => data[p.dataIndex]?.tooltip },
                toolbox: isPDFGenerating ? undefined : getToolboxBar(),
                xAxis: { type: "category", data: data.map(i => i.name), axisLabel: { rotate: 20 } },
                yAxis: { type: "value" },
                series: [
                    {
                        type: isLineChart ? "line" : "bar",
                        data: data.map((item, idx) => ({
                            value: item.value,
                            itemStyle: { color: defaultBarColors[idx % defaultBarColors.length] },
                            label: {
                                show: true,
                                position: "top",
                                fontWeight: "bold",
                            },
                        })),
                        smooth: isLineChart,
                        symbol: isLineChart ? "circle" : undefined,
                        symbolSize: isLineChart ? 10 : undefined,
                    },
                ],
                dataZoom: isLineChart && !isPDFGenerating
                    ? [
                        { type: "inside", xAxisIndex: [0], start: 0, end: 100 },
                        {
                            type: "slider",
                            xAxisIndex: [0],
                            bottom: 20,
                            start: 0,
                            end: 100,
                            handleSize: "80%",
                        },
                    ]
                    : undefined,
            };
        }

        // chartRef.current.setOption(option, true);
        chart.setOption(option, true);

        const handleResize = () => chart.resize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart.dispose();
            chartRef.current = null;
        };
    }, [data, level, title, isPDFGenerating]);

    return (
        <div className="sysUsage-card mt-3">
            {data?.length == 0 && <div>
                <Label className="chartLabel">{title}</Label>
                <NoRecordFound />
            </div>}
            {data?.length != 0 && <div ref={divRef}
                className="echarts-chart-container echarts-for-pdf"
                style={{ width: width ?? "100%", height: height ?? "450px" }} />}

        </div>
    );
};

export default DashboardBarChart;
