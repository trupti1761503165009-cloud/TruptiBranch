import * as React from "react";
import * as echarts from 'echarts';
import { UserActionEntityTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import GenericChartCard from "../GenericChartCard";
import NoRecordFound from "../../../CommonComponents/NoRecordFound";
import { Label } from "@fluentui/react";


export interface IAssociateChemicalProps {
    ChartData: any;
    isChartOnly?: boolean;
}
interface ChartDataItem {
    ActionType: string;
    EntityType: string;
}

interface Props {
    chartData: ChartDataItem[];
    setTotal: (value: number) => void; // Optional prop to show total count
}


export const StateIMSReport = (props: IAssociateChemicalProps) => {
    const [filterData, setFilterData] = React.useState<any[]>([]);
    const [total, setTotal] = React.useState<number>(0);
    const chartRef = React.useRef<HTMLDivElement>(null);
    const [viewMode, setViewMode] = React.useState<'byAction' | 'byEntity'>('byEntity');
    const [graphView, setGraphView] = React.useState<boolean>(true);
    const [drillDownData, setDrillDownData] = React.useState<any | null>(null);
    const [drillDownUserData, setDrillDownUserData] = React.useState<ChartDataItem[] | null>(null);
    const getGroupedData = (
        data: any[],
        mode: 'byAction' | 'byEntity' | 'byUser' | 'byModified'
    ) => {
        let primaryKey: keyof any;
        let seriesKey: keyof any;

        if (mode === 'byUser') {
            primaryKey = 'UserName';
            seriesKey = 'ActionType';
        } else if (mode === 'byModified') {
            primaryKey = 'Modified';
            seriesKey = 'ActionType';
        } else {
            primaryKey = mode === 'byAction' ? 'ActionType' : 'EntityType';
            seriesKey = mode === 'byAction' ? 'EntityType' : 'ActionType';
        }

        const grouped = new Map<string, Map<string, { count: number; items: ChartDataItem[] }>>();

        data.forEach(item => {
            const primary = item[primaryKey];
            const series = item[seriesKey];
            if (!primary || !series) return;

            if (!grouped.has(primary)) grouped.set(primary, new Map());
            const innerMap = grouped.get(primary)!;

            if (!innerMap.has(series)) innerMap.set(series, { count: 0, items: [] });

            const entry = innerMap.get(series)!;
            entry.count += 1;
            entry.items.push(item);
        });

        const xLabels = Array.from(grouped.keys());
        const seriesSet = new Set<string>();
        grouped.forEach(map => map.forEach((_, key) => seriesSet.add(key)));
        const seriesLabels = Array.from(seriesSet);

        const series = seriesLabels.map(label => ({
            name: label,
            type: 'bar',
            stack: 'total',
            emphasis: { focus: 'series' },
            data: xLabels.map(x => grouped.get(x)?.get(label)?.count || 0),
            tooltipData: xLabels.map(x => grouped.get(x)?.get(label)?.items || []),
            label: {
                show: true,
                formatter: (params: any) => (params.value > 0 ? params.value : ''),
            },
        }));

        const total = series.reduce(
            (sum, s) => sum + s.data.reduce((a: number, b: number) => a + b, 0),
            0
        );

        return { xLabels, seriesLabels, series, total };
    };

    React.useEffect(() => {
        if (chartRef.current && filterData.length > 0) {
            const myChart = echarts.init(chartRef.current);
            const { xLabels, seriesLabels, series, total } = getGroupedData(
                drillDownUserData || drillDownData || filterData,
                drillDownUserData ? 'byModified' : drillDownData ? 'byUser' : viewMode
            );
            setTotal(total);

            const option = {
                title: {
                    text: drillDownUserData
                        ? 'User Activity by Date'
                        : drillDownData
                            ? 'User Activity Details'
                            : viewMode === 'byAction'
                                ? 'Activity by Action and Entity'
                                : 'Activity by Entity and Action',
                    left: 'center',
                },
                tooltip: drillDownData ? {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                    formatter: (params: any) => {
                        const tooltipLines: string[] = [];

                        tooltipLines.push('<div style="max-height: 360px; overflow-y: auto;">');

                        params.forEach((param: any) => {
                            const seriesItem = series[param.seriesIndex];
                            const items = seriesItem.tooltipData?.[param.dataIndex] || [];

                            if (items.length > 0) {
                                tooltipLines.push(`<strong>${param.name} - ${param.seriesName}</strong><br/>`);
                                items.forEach((item: any) => {
                                    tooltipLines.push(
                                        `${item.EntityName || 'N/A'} at ${item.Modified}<br/><hr/>`
                                    );
                                });
                            }
                        });

                        tooltipLines.push('</div>');
                        return tooltipLines.join('');
                    }
                } : {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' },
                },

                legend: {
                    data: seriesLabels,
                    type: 'scroll',
                    top: 'bottom',
                },
                toolbox: {
                    show: true,
                    feature: {
                        saveAsImage: {},
                        dataView: { readOnly: true },
                        magicType: { type: ['bar', 'line'] },
                        restore: {},
                    },
                },
                xAxis: {
                    type: 'category',
                    data: xLabels,
                    name: drillDownUserData
                        ? 'Modified Date'
                        : drillDownData
                            ? 'User Name'
                            : viewMode === 'byAction'
                                ? 'Action Type'
                                : 'Entity Type',
                    axisLabel: { interval: 0, rotate: 0 },
                },
                yAxis: {
                    type: 'value',
                    name: 'Count',
                },
                series,
            };

            myChart.setOption(option);

            myChart.off('click');
            myChart.on('click', (params: any) => {
                if (!drillDownData) {
                    const clicked = params.name;
                    const filtered = filterData.filter(item =>
                        item[viewMode === 'byAction' ? 'ActionType' : 'EntityType'] === clicked
                    );
                    setDrillDownData(filtered);
                } else if (!drillDownUserData) {
                    const clickedUser = params.name;
                    const filtered = drillDownData.filter((item: any) => item.UserName === clickedUser);
                    setDrillDownUserData(filtered);
                }
            });

            const handleResize = () => myChart.resize();
            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
                myChart.dispose();
            };
        }
    }, [filterData, viewMode, drillDownData, drillDownUserData]);

    React.useEffect(() => {
        const filteredData = props.ChartData.filter((item: any) =>
            [
                UserActionEntityTypeEnum.ToolboxTalk,
                UserActionEntityTypeEnum.IncidentReport,
                UserActionEntityTypeEnum.SkillMatrix,
                UserActionEntityTypeEnum.WorkplaceInspection,
                UserActionEntityTypeEnum.CorrectiveActionReport,
                UserActionEntityTypeEnum.WHSCommitteeInspection,
                UserActionEntityTypeEnum.WHSCommitteeMeeting,
            ].includes(item.EntityType)
        );
        setFilterData(filteredData);
    }, [graphView, props.ChartData]);

    return (
        <>
            {!!filterData && filterData.length > 0 ?
                <div>
                    <GenericChartCard
                        total={1234}
                        chartRef={chartRef}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        graphView={graphView}
                        onClickChartIcon={() => setGraphView(prev => !prev)}
                        setDrillDownData={setDrillDownData}
                        setDrillDownUserData={setDrillDownUserData}
                        drillDownData={drillDownData}
                        drillDownUserData={drillDownUserData}
                    />
                </div>
                : <div>
                    <div className="ims-Site-chart-card mt-3">
                        <div className="chart-header d-flex justify-content-between align-items-center dflex">
                            <div>
                                <Label className="chart-label">
                                    Total Activity by {viewMode === 'byAction' ? 'Action and Entity Report' : 'Entity and Action Report'}
                                </Label>
                            </div>
                        </div>
                        <div>
                            <NoRecordFound />
                        </div>
                    </div>
                </div>}
        </>
    );
};