/* eslint-disable */
import * as React from "react";
import * as echarts from "echarts";
import { Label } from "@fluentui/react";
import NoRecordFound from "../../../../CommonComponents/NoRecordFound";
import { defaultBarColors, ReportProps } from "../../../../../../../Common/Enum/HazardFields";
import { ReactDropdown } from "../../../../CommonComponents/ReactDropdown";
import { topDataOptions } from "../../../../../../../Common/Constants/CommonConstants";

const UserSubHazardChart: React.FC<ReportProps> = ({ data, width, height, title }) => {
    const chartRef = React.useRef<HTMLDivElement | null>(null);
    const [chart, setChart] = React.useState<any>(null);
    const [topLimit, setTopLimit] = React.useState<number | "all">(10);

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
            restore: { show: true },
        }
    });

    const renderChart = () => {
        if (!chart || !data?.length) return;

        chart.clear();

        const users = unique(data.map(d => d.SubmittedBy ?? "Unknown"));

        const userCounts = users
            .map(user => ({
                user,
                total: data.filter(d => (d.SubmittedBy ?? "Unknown") === user).length
            }))
            .sort((a, b) => b.total - a.total);

        const filteredUsers =
            topLimit === "all" ? userCounts : userCounts.slice(0, Number(topLimit));

        const sortedUserNames = filteredUsers.map(u => u.user);
        const subHazards = unique(data.map(d => d.HazardSubType ?? "Unknown"));

        const series = subHazards.map((sub, idx) => ({
            name: sub,
            type: "bar",
            stack: "total",
            emphasis: { focus: "series" },
            itemStyle: { color: defaultBarColors[idx % defaultBarColors.length] },
            data: sortedUserNames.map(user =>
                data.filter(
                    d =>
                        (d.SubmittedBy ?? "Unknown") === user &&
                        (d.HazardSubType ?? "Unknown") === sub
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
            //     axisPointer: { type: "shadow" },
            //     formatter: (params: any) => {
            //         const total = params.reduce((sum: number, p: any) => sum + (p.value ?? 0), 0);
            //         const rows = params
            //             .filter((p: any) => p.value > 0)
            //             .map((p: any) => `${p.seriesName}: ${p.value}`)
            //             .join("<br/>");

            //         return `
            //             Reporter: ${params[0]?.name}<br/>
            //             Total: ${total}<br/>
            //             ${rows}
            //         `;
            //     },
            // },
            tooltip: {
                trigger: "axis",
                axisPointer: { type: "shadow" },
                formatter: (params: any) => {
                    const total = params.reduce((sum: number, p: any) => sum + (p.value ?? 0), 0);

                    const rows = params
                        .filter((p: any) => p.value > 0)
                        .map((p: any) => `
                            <div style="display:flex;align-items:center;gap:6px;">
                                <span style="display:inline-block;width:10px;height:10px;background:${p.color};border-radius:2px;"></span>
                                ${p.seriesName}: <b>${p.value}</b>
                            </div>
                        `)
                        .join("");

                    return `
                        <div style="font-size:12px;">
                            <b>Reporter: ${params[0]?.name}</b><br/>
                            <b>Total: ${total}</b><br/>
                            ${rows}
                        </div>
                    `;
                }
            },
            toolbox: getToolbox(),
            // legend: {
            //     type: "scroll",
            //     orient: "horizontal",
            //     bottom: 10,
            //     left: "center",
            //     textStyle: { fontSize: 12 }
            // },
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
                data: sortedUserNames,
                axisLabel: { rotate: 15, interval: 0 },
            },
            yAxis: { type: "value" },
            series,
        }, true);
    };

    React.useEffect(() => {
        renderChart();
    }, [chart, data, topLimit]);

    return (
        <div className="sysUsage-card mt-3">
            <div className="noExport">
                <div style={{ display: "flex", justifyContent: "end", marginBottom: 10 }}>
                    <div style={{ minWidth: 150 }}>
                        <ReactDropdown
                            options={topDataOptions}
                            defaultOption={topLimit}
                            isMultiSelect={false}
                            onChange={(opt: any) => setTopLimit(opt.value)}
                            placeholder="Select Top Reporters"
                            isSorted={false}
                        />
                    </div>
                </div>
            </div>

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

export default UserSubHazardChart;
