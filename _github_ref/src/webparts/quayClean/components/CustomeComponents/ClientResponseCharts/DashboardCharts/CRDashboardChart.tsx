/* eslint-disable */
import * as React from "react";
import * as echarts from "echarts";
import { Label } from "office-ui-fabric-react";
import { ClientResponseFields } from "../../QRClientResponse/ClientResponseFields";
import { defaultBarColors } from "../../../../../../Common/Enum/HazardFields";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";

// group by key
const groupBy = <T extends Record<string, any>>(arr: T[], key: keyof T) =>
    arr.reduce((acc, item) => {
        const val = item[key] ?? "Unknown";
        if (!acc[val]) acc[val] = [];
        acc[val].push(item);
        return acc;
    }, {} as Record<string, T[]>);

const safe = (v: any) => String(v ?? "").replace(/[<>]/g, "");

export const buildStateWiseCRData = (data: any[]) => {
    const grouped = groupBy(data, "State");

    return Object.entries(grouped)
        .map(([state, items]) => ({
            name: state,
            value: items.length,
            tooltip: `
        <b>State:</b> ${safe(state)}<br/>
        <b>Total Cases:</b> ${items.length}<br/>
        <b>Sites:</b> ${new Set(items.map(d => d.SiteName)).size}<br/>
        <b>Category:</b> ${new Set(items.map(d => d.Category)).size}<br/>
        <b>Sub Category:</b> ${new Set(items.map(d => d.SubCategory)).size}<br/>
         <b>Reported By:</b> ${new Set(items.map(d => d.ReportedBy)).size}
      `,
        }))
        .sort((a, b) => b.value - a.value);
};

export const buildSiteWiseCRData = (data: any[]) => {
    const grouped = groupBy(data, "SiteName");

    return Object.entries(grouped)
        .map(([site, items]) => ({
            name: site,
            value: items.length,
            tooltip: `
        <b>Site:</b> ${safe(site)}<br/>
        <b>Total Cases:</b> ${items.length}<br/>
        <b>Category:</b> ${new Set(items.map(d => d.Category)).size}<br/>
        <b>Sub Category:</b> ${new Set(items.map(d => d.SubCategory)).size}<br/>
         <b>Reported By:</b> ${new Set(items.map(d => d.ReportedBy)).size}
      `,
        }))
        .sort((a, b) => b.value - a.value);
};

export const buildCategoryWiseCRData = (data: any[]) => {
    const grouped = groupBy(data, "Category");

    return Object.entries(grouped)
        .map(([category, items]) => ({
            name: category,
            value: items.length,
            tooltip: `
        <b>Category:</b> ${safe(category)}<br/>
        <b>Total Cases:</b> ${items.length}<br/>
        <b>Sub Category:</b> ${new Set(items.map(d => d.SubCategory)).size}<br/>
         <b>Reported By:</b> ${new Set(items.map(d => d.ReportedBy)).size}
      `,
        }))
        .sort((a, b) => b.value - a.value);
};

export const buildSubCategoryWiseCRData = (data: any[]) => {
    const grouped = groupBy(data, "SubCategory");

    return Object.entries(grouped)
        .map(([subCategory, items]) => ({
            name: subCategory,
            value: items.length,
            tooltip: `
        <b>Sub Category:</b> ${safe(subCategory)}<br/>
        <b>Total Cases:</b> ${items.length}
      `,
        }))
        .sort((a, b) => b.value - a.value);
};

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

export const buildSubmissionDateWiseCRData = (data: any[]) => {
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
<b>Category:</b> ${items.length ? new Set(items.map(i => i.Category)).size : 0}<br/>
<b>Sub Category:</b> ${items.length ? new Set(items.map(i => i.SubCategory)).size : 0}<br/>
<b>Reported By:</b> ${items.length ? new Set(items.map(i => i.ReportedBy)).size : 0}
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
const CRDashboardBarChart: React.FC<{
    data: any[];
    level: any;
    title: string;
    isPDFGenerating?: boolean;
    width?: string | number;
    height?: string | number;
}> = ({ data, level, title, isPDFGenerating, width, height }) => {
    const divRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<echarts.ECharts | null>(null);

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

        if (level === ClientResponseFields.State || level === ClientResponseFields.Category) {
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
            const isLineChart = level === ClientResponseFields.SubmissionDate;
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

export default CRDashboardBarChart;
