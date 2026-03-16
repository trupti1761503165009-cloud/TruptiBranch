import * as React from "react";
import * as echarts from 'echarts';
import { Button, Label, Link, PrimaryButton, Toggle, TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import GenericChartCard from "./GenericChartCard";
import { UserActionEntityTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import NoRecordFound from "../../CommonComponents/NoRecordFound";


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


export const IMSReport = (props: IAssociateChemicalProps) => {
    const [filterData, setFilterData] = React.useState<any[]>([]);
    // const [chartData, setChartData] = React.useState<any>(props.ChartData);
    const [total, setTotal] = React.useState<number>(0);
    const chartRef = React.useRef<HTMLDivElement>(null);
    const [viewMode, setViewMode] = React.useState<'byAction' | 'byEntity'>('byEntity');
    const [graphView, setGraphView] = React.useState<boolean>(true);
    const [drillDownData, setDrillDownData] = React.useState<any | null>(null);
    const [drillDownUserData, setDrillDownUserData] = React.useState<ChartDataItem[] | null>(null);
    type ExpandedSitesType = { [key: string]: boolean };
    type ExpandedDatesType = { [key: string]: boolean };

    const [expandedSites, setExpandedSites] = React.useState<ExpandedSitesType>({});
    const [expandedDates, setExpandedDates] = React.useState<ExpandedDatesType>({});
    const toggleDate = (site: string, date: string) => {
        const key = `${site}-${date}`;
        setExpandedDates(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };
    const toggleSite = (site: string) => {
        setExpandedSites((prev) => ({ ...prev, [site]: !prev[site] }));
    };
    const onClickChartIcon = (): void => {
        setGraphView(prevState => !prevState);
    };

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
            primaryKey = 'Created';
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
            const totalSites = xLabels.length;
            const visibleBars = 16;
            const endValue = totalSites > visibleBars ? (visibleBars / totalSites) * 100 : 100;
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
                                        `${item.EntityName || 'N/A'} at ${item.Created}<br/><hr/>`
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
                dataZoom: [
                    {
                        type: 'inside', // Enables zooming inside the chart
                        xAxisIndex: [0], // Apply zooming to the x-axis
                        start: 0, // Start zoom at 0% (all data visible)
                        end: endValue, // End zoom at 100% (show full range initially)
                    },
                    {
                        type: 'slider', // Adds a slider bar for zooming
                        xAxisIndex: [0], // Apply to the x-axis
                        bottom: 20, // Position the slider below the chart
                        start: 0, // Start zoom at 0%
                        end: endValue, // End zoom at 100%
                        handleSize: '80%', // Adjust the size of the handle for the slider
                        handleStyle: {
                            color: '#2f89cf', // Color of the handle
                            borderColor: '#1f70a8', // Border color for the handle
                            borderWidth: 2, // Border width for the handle
                            shadowBlur: 3, // Shadow for the handle
                            shadowColor: 'rgba(0, 0, 0, 0.3)', // Shadow color
                            shadowOffsetX: 2, // Shadow offset on X axis
                            shadowOffsetY: 2,// Shadow offset on Y axis

                        }
                    }
                ],
                xAxis: {
                    type: 'category',
                    data: xLabels,
                    name: drillDownUserData
                        ? 'Created Date'
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

    const groupedByEntityType = filterData.reduce((acc: any, item: any) => {
        const entity = item.EntityType || 'Unknown';
        if (!acc[entity]) {
            acc[entity] = {
                items: [],
                users: new Set(),
                lastDate: '',
            };
        }
        acc[entity].items.push(item);
        acc[entity].users.add(item.UserName);

        // Update lastDate if needed
        const current = new Date(item.Created);
        const last = new Date(acc[entity].lastDate || 0);
        if (!acc[entity].lastDate || current > last) {
            acc[entity].lastDate = item.Created;
        }

        return acc;
    }, {});

    return (
        <>
            {!!filterData && filterData.length > 0 ?
                <div>
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



                        <div>
                            {((props.isChartOnly == undefined || props.isChartOnly == false) && (filterData.length > 0)) && (
                                <div className="mt-6 bg-white p-4 rounded shadow mt-5">
                                    <div className="chart-div-table">
                                        <div className="chart-div-header">
                                            <div className="chart-div-cell">Entity Type</div>
                                            <div className="chart-div-cell">Total Actions</div>
                                            <div className="chart-div-cell">Unique Users</div>
                                            <div className="chart-div-cell">Last Activity Date</div>
                                        </div>

                                        {Object.entries(groupedByEntityType).map(([entityType, info]: any, i) => {
                                            const actionsByDate = info.items.reduce((acc: any, item: any) => {
                                                const date = item.Created.split(' ')[0];
                                                if (!acc[date]) acc[date] = [];
                                                acc[date].push(item);
                                                return acc;
                                            }, {});

                                            return (
                                                <div key={entityType}>
                                                    <div
                                                        className={`chart-div-row ${i % 2 !== 0 ? 'white-bg' : ''}`}
                                                        onClick={() =>
                                                            setExpandedSites((prev: any) => ({
                                                                ...prev,
                                                                [entityType]: !prev[entityType],
                                                            }))
                                                        }
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div className="chart-div-cell">
                                                            <div className="dflex">
                                                                <FontAwesomeIcon
                                                                    className="dticon me-2"
                                                                    icon={expandedSites[entityType] ? 'caret-down' : 'caret-right'}
                                                                />
                                                                {entityType}
                                                            </div>
                                                        </div>

                                                        <div className="chart-div-cell">{info.items.length}</div>
                                                        <div className="chart-div-cell">{info.users.size}</div>
                                                        <div className="chart-div-cell">{info.lastDate}</div>
                                                    </div>

                                                    {expandedSites[entityType] && (
                                                        <div style={{ paddingLeft: '20px' }}>
                                                            <div className="header-drag" style={{ fontWeight: 'bold', marginTop: '10px' }}>
                                                                <div className="header-cell-drag mr40per">Date</div>
                                                                <div className="header-cell-drag">Actions Summary</div>
                                                            </div>

                                                            {Object.entries(actionsByDate).map(([date, items]: any) => {
                                                                const actionCounts = items.reduce((counts: any, item: any) => {
                                                                    counts[item.ActionType] = (counts[item.ActionType] || 0) + 1;
                                                                    return counts;
                                                                }, {});
                                                                const dateKey = `${entityType}-${date}`;

                                                                return (
                                                                    <div key={dateKey}>
                                                                        <div
                                                                            className="chart-div-row white-bg"
                                                                            onClick={() => toggleDate(entityType, date)}
                                                                            style={{ cursor: 'pointer' }}
                                                                        >
                                                                            <div className="chart-div-cell" style={{ fontWeight: 'bold' }}>
                                                                                <div className="dflex">
                                                                                    <FontAwesomeIcon
                                                                                        className="dticon me-2"
                                                                                        icon={expandedDates[dateKey] ? 'caret-down' : 'caret-right'}
                                                                                    />
                                                                                    {date}
                                                                                </div>
                                                                            </div>
                                                                            <div className="chart-div-cell">
                                                                                {Object.entries(actionCounts)
                                                                                    .map(([type, count]) => `${type} (${count})`)
                                                                                    .join(', ')}
                                                                            </div>
                                                                        </div>

                                                                        {expandedDates[dateKey] && (
                                                                            <div style={{ paddingLeft: '20px', marginTop: '5px' }}>
                                                                                <div className="header-drag" style={{ fontWeight: 'bold' }}>
                                                                                    <div className="header-cell-drag2">Entity Name</div>
                                                                                    <div className="header-cell-drag2">Details</div>
                                                                                    {!items.every((item: any) =>
                                                                                        ['dashboard', 'viewsite'].includes(item.EntityType?.toLowerCase())
                                                                                    ) && (
                                                                                            <div className="header-cell-drag2">Site Name</div>
                                                                                        )}
                                                                                    <div className="header-cell-drag2">Action Type</div>
                                                                                    <div className="header-cell-drag2">User Name</div>
                                                                                    <div className="header-cell-drag2">Timestamp</div>
                                                                                </div>

                                                                                {items.map((detail: any, idx: any) => (
                                                                                    <div key={idx} className="row-drag draggable-drag" style={{ width: '100%' }}>
                                                                                        <div className="header-cell-drag2">{detail.EntityName}</div>
                                                                                        <div className="header-cell-drag2">{detail.Details}</div>
                                                                                        {!['dashboard', 'viewsite'].includes(detail.EntityType?.toLowerCase()) && (
                                                                                            <div className="header-cell-drag2">{detail.SiteName}</div>
                                                                                        )}
                                                                                        <div className="header-cell-drag2">{detail.ActionType}</div>
                                                                                        <div className="header-cell-drag2">{detail.UserName}</div>
                                                                                        <div className="header-cell-drag2">{detail.Created}</div>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
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