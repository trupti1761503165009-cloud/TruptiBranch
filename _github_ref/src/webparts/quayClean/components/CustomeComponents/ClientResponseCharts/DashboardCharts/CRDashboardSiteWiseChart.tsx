/* eslint-disable */
import * as React from "react";
import * as echarts from "echarts";
import { Label } from "office-ui-fabric-react";
import { topDataOptions } from "../../../../../../Common/Constants/CommonConstants";
import { defaultBarColors } from "../../../../../../Common/Enum/HazardFields";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";

const getToolboxBar = (): echarts.ToolboxComponentOption => ({
    show: true,
    feature: { saveAsImage: {}, dataView: {}, magicType: { type: ["bar", "line"] }, restore: {} }
});

const CRDashboardSiteWiseBarChart: React.FC<{
    data: any[];
    level: any;
    title: string;
    isPDFGenerating?: boolean;
    width?: string | number;
    height?: string | number;
}> = ({ data, level, title, isPDFGenerating, width, height }) => {

    const [topLimit, setTopLimit] = React.useState<any>(10);
    const divRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<echarts.ECharts>();

    const sortedData = React.useMemo(() => {
        if (!data?.length) return [];

        const sorted = [...data].sort((a, b) => b.value - a.value);

        if (topLimit === "all") return sorted;

        const limit = Number(topLimit);
        return limit > 0 ? sorted.slice(0, limit) : sorted;
    }, [data, topLimit]);

    React.useEffect(() => {
        if (!divRef.current) return;

        if (!chartRef.current) {
            chartRef.current = echarts.init(divRef.current);
        }

        const handleResize = () => chartRef.current?.resize();
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    React.useEffect(() => {
        if (!chartRef.current) return;
        const option: echarts.EChartsOption = {
            title: { text: title, left: "left", top: 5 },
            tooltip: { trigger: "item", formatter: (p: any) => sortedData[p.dataIndex]?.tooltip },
            toolbox: isPDFGenerating ? undefined : getToolboxBar(),
            xAxis: {
                type: "category",
                data: sortedData.map(i => i.name),
                axisLabel: { rotate: 20 }
            },
            yAxis: { type: "value" },
            series: [
                {
                    type: "bar",
                    data: sortedData.map((item, idx) => ({
                        value: item.value,
                        itemStyle: {
                            color: defaultBarColors[idx % defaultBarColors.length]
                        },
                        label: { show: true, position: "top" }
                    })),
                }
            ]
        };

        chartRef.current.setOption(option, true);
        chartRef.current.resize();

    }, [sortedData, title, isPDFGenerating]);

    return (
        <div className="sysUsage-card mt-3">

            <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 10 }} className="noExport">

                <ReactDropdown
                    options={topDataOptions}
                    isMultiSelect={false}
                    defaultOption={topLimit}
                    onChange={(option: any) => setTopLimit(option?.value)}
                    isClearable
                    placeholder="Select Top Sites"
                    minWidth={150}
                    isSorted={false}
                />
            </div>
            {sortedData.length > 0 &&
                <div ref={divRef}
                    className="echarts-chart-container echarts-for-pdf"
                    style={{ width: width ?? "100%", height: height ?? "450px" }} />
            }
            {sortedData.length == 0 &&
                <div>
                    <Label className="chartLabel">{title}</Label>
                    <NoRecordFound />
                </div>
            }
        </div>
    );
};

export default CRDashboardSiteWiseBarChart;
