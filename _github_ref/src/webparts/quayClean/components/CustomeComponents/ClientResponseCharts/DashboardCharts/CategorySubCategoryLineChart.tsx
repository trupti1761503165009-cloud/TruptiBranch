/* eslint-disable */
import * as React from "react";
import * as echarts from "echarts";
import { Label } from "@fluentui/react";
import { defaultBarColors } from "../../../../../../Common/Enum/HazardFields";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";
import { ReportProps } from "../../QRClientResponse/ClientResponseFields";

const CategorySubCategoryLineChart: React.FC<ReportProps> = ({ data, width, title, height }) => {
    const chartRef = React.useRef<HTMLDivElement | null>(null);
    const [chart, setChart] = React.useState<any>(null);
    const [noData, setNoData] = React.useState(false);

    const unique = (arr: string[]) =>
        Array.from(new Set(arr.filter(x => x !== undefined && x !== null)));

    React.useEffect(() => {
        if (!chartRef.current) return;

        const instance = echarts.init(chartRef.current);
        setChart(instance);
        const handleResize = () => {
            instance.resize();
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            instance.dispose();
        };
    }, []);

    const getToolbox = () => ({
        show: true,
        feature: {
            saveAsImage: { show: true },
            dataView: { show: true, readOnly: true },
            magicType: { type: ["line", "bar"] },
            restore: {},
        },
    });

    const renderChart = () => {
        if (!chart) return;
        if (!data || data.length === 0) {
            setNoData(true);
            return;
        }

        // chart.clear();
        setNoData(false);

        const subCategories = unique(data.map(d => d.SubCategory ?? "Unknown"));
        const categories = unique(data.map(d => d.Category ?? "Unknown"));

        const series = subCategories.map((sub, idx) => ({
            name: sub,
            type: "line",
            smooth: true,
            symbol: "circle",
            itemStyle: { color: defaultBarColors[idx % defaultBarColors.length] },
            data: categories.map(ht =>
                data.filter(
                    d =>
                        (d.Category ?? "Unknown") === ht &&
                        (d.SubCategory ?? "Unknown") === sub
                ).length
            ),
            label: {
                show: true,
                position: "top",
                fontSize: 11,
                fontWeight: "bold",
                formatter: (p: any) => (p.value > 0 ? p.value : "")
            }
        }));

        chart.setOption({
            title: { text: title },
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                formatter: (params: any) => {
                    if (!params?.length) return "";

                    const category = params[0]?.name ?? "Unknown";

                    const rows = params
                        .filter((p: any) => p.value > 0)
                        .map((p: any) => `
                            <div style="display:flex;align-items:center;gap:6px;">
                                <span style="
                                    display:inline-block;
                                    width:10px;
                                    height:10px;
                                    background:${p.color};
                                    border-radius:2px;">
                                </span>
                                ${p.seriesName}: <b>${p.value}</b>
                            </div>
                        `)
                        .join("");

                    const total = params.reduce(
                        (sum: number, p: any) => sum + (p.value ?? 0),
                        0
                    );

                    return `
                        <div style="font-size:12px;">
                            <b>${category}</b><br/>
                            <b>Total: ${total}</b><br/>
                            ${rows}
                        </div>
                    `;
                }
            },
            legend: {
                type: "plain",
                orient: "horizontal",
                top: 40,
                left: "center",
                width: "90%",
                itemWidth: 18,
                itemHeight: 12,
                textStyle: { fontSize: 11 },
                padding: [8, 10, 8, 10],
            },
            grid: {
                top: 130
            },
            toolbox: getToolbox(),
            xAxis: { type: "category", data: categories, axisLabel: { rotate: 15, interval: 0 } },
            yAxis: { type: "value" },
            series
        }, true);
    };

    React.useEffect(() => {
        if (chart) renderChart();
    }, [chart]);

    return (
        <div className="sysUsage-card mt-3">
            {data?.length > 0 && !noData ? (
                <div ref={chartRef}
                    className="echarts-chart-container echarts-for-pdf"
                    style={{ width: width || "100%", height: height ? height : "450px" }} />
            ) : (
                <>
                    <Label className="chartLabel">{title}</Label>
                    <NoRecordFound />
                </>
            )}
        </div>
    );
};

export default CategorySubCategoryLineChart;
