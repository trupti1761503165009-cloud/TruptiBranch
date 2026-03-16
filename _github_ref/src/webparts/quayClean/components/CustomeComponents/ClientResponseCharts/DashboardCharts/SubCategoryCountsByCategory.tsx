/* eslint-disable */
import * as React from "react";
import * as echarts from "echarts";
import { Label } from "@fluentui/react";
import { defaultBarColors } from "../../../../../../Common/Enum/HazardFields";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";
import { ReportProps } from "../../QRClientResponse/ClientResponseFields";

const SubCategoryCountsByCategory: React.FC<ReportProps> = ({ data, width, height, title }) => {
    const chartRef = React.useRef<HTMLDivElement | null>(null);
    const [chart, setChart] = React.useState<any>(null);

    const unique = (arr: string[]) =>
        Array.from(new Set(arr.filter(x => !!x)));

    React.useEffect(() => {
        if (!chartRef.current) return;

        const instance = echarts.init(chartRef.current);
        setChart(instance);

        const handleResize = () => instance.resize();
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
            restore: { show: true }
        }
    });

    const renderChart = () => {
        if (!chart || !data?.length) return;

        chart.clear();
        const category = unique(data.map(d => d.Category ?? "Unknown"));
        const subCategory = unique(data.map(d => d.SubCategory ?? "Unknown"));

        const categoryTotals = category
            .map(ht => ({
                name: ht,
                total: data.filter(d => (d.Category ?? "Unknown") === ht).length
            }))
            .sort((a, b) => b.total - a.total);

        const sortedCategoryNames = categoryTotals.map(h => h.name);

        const series = subCategory.map((sub, idx) => ({
            name: sub,
            type: "bar",
            stack: "total",
            emphasis: { focus: "series" },
            itemStyle: {
                color: defaultBarColors[idx % defaultBarColors.length]
            },
            data: sortedCategoryNames.map(ht =>
                data.filter(
                    d =>
                        (d.Category ?? "Unknown") === ht &&
                        (d.SubCategory ?? "Unknown") === sub
                ).length
            ),
            label: {
                show: true,
                position: "inside",
                formatter: (p: any) => p.value > 0 ? p.value : "",
                fontSize: 11,
                fontWeight: "bold"
            }
        }));

        chart.setOption({
            title: { text: title },
            // tooltip: {
            //     trigger: "axis",
            //     axisPointer: { type: "shadow" }
            // },
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                formatter: (params: any) => {
                    const category = params[0]?.axisValue;
                    const total = params.reduce((sum: number, p: any) => sum + (p.value ?? 0), 0);

                    const rows = params
                        .filter((p: any) => p.value > 0)
                        .map((p: any) => `
                            <div style="display:flex;align-items:center;gap:6px;margin-top:3px;">
                                <span style="display:inline-block;width:10px;height:10px;background:${p.color};border-radius:2px;"></span>
                                ${p.seriesName}: <b>${p.value}</b>
                            </div>
                        `)
                        .join("");

                    return `
                        <div style="font-size:12px;line-height:1.4;">
                            <b>Category:</b> ${category}<br/>
                            <b>Total:</b> ${total}<br/>
                            ${rows}
                        </div>
                    `;
                }
            },
            toolbox: getToolbox(),
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
            xAxis: {
                type: "category",
                data: sortedCategoryNames,
                axisLabel: { rotate: 15, interval: 0 }
            },
            yAxis: { type: "value" },
            series
        });
    };

    React.useEffect(() => {
        renderChart();
    }, [chart, data]);

    return (
        <div className="sysUsage-card mt-3">
            {data?.length > 0 ? (
                <div
                    ref={chartRef}
                    className="echarts-chart-container echarts-for-pdf"
                    style={{ width: width || "100%", height: height ? height : "450px" }}
                ></div>
            ) : (
                <>
                    <Label className="chartLabel">{title}</Label>
                    <NoRecordFound />
                </>
            )}
        </div>
    );
};

export default SubCategoryCountsByCategory;
