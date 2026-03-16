
import * as echarts from "echarts";
import React from "react";
import NoRecordFound from "../../../../CommonComponents/NoRecordFound";
import { Label } from "@fluentui/react";
import { systemUsageReportWidthPrint } from "../../../../../../../Common/Constants/CommonConstants";
export interface ILowSiteUsageChartProps {
    cardCounts: any;
    isGenratePdf?: boolean;

}

export const LowSiteUsageChart = (props: ILowSiteUsageChartProps) => {
    const chartRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!chartRef.current) return;

        let chart = echarts.getInstanceByDom(chartRef.current);
        if (chart) chart.dispose();
        chart = echarts.init(chartRef.current);

        if (props.cardCounts) {
            const { highActiveSites, inActiveSites, lowActiveSiteCount } = props.cardCounts;

            const option: echarts.EChartsOption = {
                color: ["#e74c3c", "#00d5c9", "#1300a6"],
                title: {
                    text: "Site Activity Distribution",
                    left: "center",
                },
                tooltip: {
                    trigger: "item",
                    formatter: "{b}: {c} ({d}%)",
                },
                legend: props.isGenratePdf ? [] : {
                    orient: "vertical",
                    right: 10,
                    top: 20,
                    data: ["High Active Sites", "Low Active Sites", "No Active Sites"],
                },
                series: [
                    {
                        name: "Sites",
                        type: "pie",
                        radius: ["40%", "70%"], // donut style
                        center: ["50%", "50%"],
                        avoidLabelOverlap: false,
                        label: {
                            show: true,
                            formatter: "{b}: {c} ({d}%)",
                        },
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: "rgba(0, 0, 0, 0.5)",
                            },
                        },
                        data: [
                            { value: highActiveSites, name: "High Active Sites" },
                            { value: lowActiveSiteCount, name: "Low Active Sites" },
                            { value: inActiveSites, name: "No Active Sites" },
                        ],
                    },
                ],
            };

            chart.setOption(option);
        }

        const handleResize = () => chart?.resize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
            chart?.dispose();
        };
    }, [props.cardCounts, props.isGenratePdf]);

    return <div className="sysUsage-card mt-3">
        <div className="flex justify-between items-center mb-2">
            <Label className="chartLabel">Portal Usage </Label>
        </div>

        {!!props.cardCounts ? (
            <div ref={chartRef} style={{ width: props.isGenratePdf ? systemUsageReportWidthPrint : "100%", height: "380px" }} />
        ) : (
            <NoRecordFound />
        )}
    </div>
}