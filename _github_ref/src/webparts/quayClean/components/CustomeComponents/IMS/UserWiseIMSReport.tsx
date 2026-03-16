import * as React from 'react';
import * as echarts from 'echarts';
import { Label, Link, PrimaryButton, Toggle, TooltipHost } from '@fluentui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ActivityChartCard from './ActivityChartCard';

export interface IAssociateChemicalProps {
    ChartData: any;
}

interface ChartDataItem {
    ActionType: string;
    EntityType: string;
    EntityName: string;
    UserName: string;
    Modified: string;
    Created: string;
}

export const UserWiseIMSReport = (props: IAssociateChemicalProps) => {
    const [chartData, setChartData] = React.useState<ChartDataItem[]>(props.ChartData || []);
    const [filteredData, setFilteredData] = React.useState<ChartDataItem[]>([]);
    const [total, setTotal] = React.useState<number>(0);
    const [groupByDate, setGroupByDate] = React.useState<boolean>(true); // Toggle state
    const chartRef = React.useRef<HTMLDivElement>(null);
    const [graphView, setGraphView] = React.useState<boolean>(true);
    const onClickChartIcon = (): void => {
        setGraphView(prevState => {
            const newState = !prevState;
            return newState;
        });
    };

    const groupData = (data: ChartDataItem[], groupByDate: boolean) => {
        const grouped = new Map<string, Map<string, Map<string, Map<string, number>>>>();
        // outer -> action -> entity -> inner -> count

        data.forEach(({ UserName, ActionType, EntityType, Modified, Created }) => {
            const date = Modified && !isNaN(new Date(Modified).getTime())
                ? new Date(Modified).toLocaleDateString()
                : new Date(Created).toLocaleDateString();

            const outerKey = groupByDate ? date : UserName;
            const innerKey = groupByDate ? UserName : date;

            if (!grouped.has(outerKey)) grouped.set(outerKey, new Map());
            const actionMap = grouped.get(outerKey)!;

            if (!actionMap.has(ActionType)) actionMap.set(ActionType, new Map());
            const entityMap = actionMap.get(ActionType)!;

            if (!entityMap.has(EntityType)) entityMap.set(EntityType, new Map());
            const innerMap = entityMap.get(EntityType)!;

            innerMap.set(innerKey, (innerMap.get(innerKey) || 0) + 1);
        });

        const outerKeys = Array.from(grouped.keys()).sort();
        const innerKeysSet = new Set<string>();

        grouped.forEach(actionMap =>
            actionMap.forEach(entityMap =>
                entityMap.forEach(innerMap =>
                    innerMap.forEach((_, innerKey) => innerKeysSet.add(innerKey))
                )
            )
        );
        const innerKeys = Array.from(innerKeysSet);

        const series: any[] = [];

        innerKeys.forEach(innerKey => {
            ['Create', 'Update', 'Delete'].forEach(action => {
                const entityTypes = new Set<string>();

                grouped.forEach(actionMap => {
                    const entityMap = actionMap.get(action);
                    if (entityMap) {
                        entityMap.forEach((_, entityType) => entityTypes.add(entityType));
                    }
                });

                entityTypes.forEach(entityType => {
                    const data = outerKeys.map(outer =>
                        grouped.get(outer)?.get(action)?.get(entityType)?.get(innerKey) || 0
                    );

                    series.push({
                        name: `${innerKey} - ${action} - ${entityType}`,
                        type: 'bar',
                        stack: innerKey,
                        emphasis: { focus: 'series' },
                        data,
                        label: {
                            show: true,
                            formatter: (params: any) => (params.value > 0 ? params.value : ''),
                        },
                    });
                });
            });
        });

        const total = series.reduce((sum, s) => sum + s.data.reduce((a: number, b: number) => a + b, 0), 0);

        return { outerKeys, series, total };
    };


    React.useEffect(() => {
        const filtered = chartData.filter((item: ChartDataItem) =>
            ['Toolbox Talk', 'Toolbox Incident', 'Skill Matrix', 'Workplace Inspection',
                'Corrective Action Report', 'WHS Committee Inspection', 'WHS Committee Meeting']
                .includes(item.EntityType)
        );
        setFilteredData(filtered);
    }, [chartData, graphView]);

    React.useEffect(() => {
        if (chartRef.current && filteredData.length > 0) {
            const myChart = echarts.init(chartRef.current);
            const { outerKeys, series, total } = groupData(filteredData, groupByDate);
            setTotal(total);

            const option = {
                title: {
                    text: groupByDate
                        ? 'User Activity Over Time'
                        : 'Date-wise Activity by User',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'shadow' }
                },
                legend: {
                    type: 'scroll',
                    top: 'bottom',
                    itemGap: 10,
                    itemWidth: 14,
                    itemHeight: 14,
                    textStyle: {
                        fontSize: 12
                    }
                },
                toolbox: {
                    feature: {
                        saveAsImage: { title: 'Save', type: 'png' },
                        dataView: { title: 'View Data', readOnly: true },
                        magicType: {
                            type: ['bar', 'line'],
                            title: { bar: 'Bar', line: 'Line' }
                        },
                        restore: { title: 'Restore' }
                    },
                    show: true
                },
                xAxis: {
                    type: 'category',
                    data: outerKeys,
                    name: groupByDate ? 'Date' : 'User',
                    axisLabel: { rotate: 0 }
                },
                yAxis: {
                    type: 'value',
                    name: 'Actions Count'
                },
                series
            };

            myChart.setOption(option);

            const handleResize = () => {
                myChart.resize();
            };

            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
                myChart.dispose();
            };
        }
    }, [filteredData, groupByDate, graphView]);

    return (
        <>
            {graphView ?
                <ActivityChartCard
                    total={total}
                    groupByDate={groupByDate}
                    setGroupByDate={setGroupByDate}
                    graphView={graphView}
                    onClickChartIcon={onClickChartIcon}
                    chartRef={chartRef}
                />

                :
                <div className="ims-chart-card mt-3">
                    <div className="chart-header d-flex justify-content-between align-items-center dflex">
                        <div>
                            <Label className="chart-label">Total User Activities Report</Label>
                            <div className="chart-number chart-green">{total}</div>
                        </div>
                        <div className='dflex'>
                            <div>
                                <PrimaryButton
                                    text={groupByDate ? "Show User-wise" : "Show Date-wise"}
                                    onClick={() => setGroupByDate(!groupByDate)}
                                    className='btn btn-primary'
                                    style={{ marginTop: "27px", marginLeft: "5px" }}
                                />
                            </div>
                            <div className='mb--36-chart'>
                                <Link className="actionBtn iconSize btnMove dticon custdd-icon"
                                    onClick={() => onClickChartIcon()}>
                                    <TooltipHost content={graphView ? "Graph view" : "Grid view"} id={`tooltip`}>
                                        <FontAwesomeIcon icon={graphView ? "chart-simple" : "table-cells"} />
                                    </TooltipHost>
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="mt-6 bg-white rounded-xl shadow p-4 overflow-auto">
                            <h2 className="text-lg font-semibold mb-3">
                                {groupByDate ? 'Table: User Activity Over Time' : 'Table: Date-wise Activity by User'}
                            </h2>
                            <div className="chart-div-table">
                                {/* Header */}
                                <div className="chart-div-header">
                                    <div className="chart-div-cell">{groupByDate ? 'Date' : 'User'}</div>
                                    <div className="chart-div-cell">Action</div>
                                    <div className="chart-div-cell">Entity Type</div>

                                    {(() => {
                                        const { outerKeys, series } = groupData(filteredData, groupByDate);
                                        const innerLabels = new Set<string>();
                                        series.forEach(s => {
                                            const labelParts = s.name.split(' - ');
                                            const innerKey = labelParts[0]; // either user or date
                                            innerLabels.add(innerKey);
                                        });
                                        return Array.from(innerLabels).map(key => (
                                            <div key={key} className="chart-div-cell text-center">{key}</div>
                                        ));
                                    })()}
                                </div>


                                {/* Rows */}
                                {(() => {
                                    const { outerKeys, series } = groupData(filteredData, groupByDate);
                                    const tableRows: JSX.Element[] = [];

                                    outerKeys.forEach((outerKey, outerIndex) => {
                                        const groupedByAction: Record<string, Record<string, Record<string, number>>> = {};

                                        series.forEach(s => {
                                            const [innerKey, action, entityType] = s.name.split(' - ');
                                            const value = s.data[outerKeys.indexOf(outerKey)] || 0;

                                            if (!groupedByAction[action]) groupedByAction[action] = {};
                                            if (!groupedByAction[action][entityType]) groupedByAction[action][entityType] = {};
                                            groupedByAction[action][entityType][innerKey] = value;
                                        });

                                        Object.keys(groupedByAction).forEach((action, rowIndex) => {
                                            const entityTypes = Object.keys(groupedByAction[action]);
                                            entityTypes.forEach((entityType, entityIndex) => {
                                                tableRows.push(
                                                    <div
                                                        key={`${outerKey}-${action}-${entityType}`}
                                                        className={`chart-div-row ${(outerIndex + rowIndex + entityIndex) % 2 === 1 ? 'white-bg' : ''}`}
                                                    >
                                                        <div className="chart-div-cell">{outerKey}</div>
                                                        <div className="chart-div-cell">{action}</div>
                                                        <div className="chart-div-cell">{entityType}</div>
                                                        {Array.from(new Set(series.map(s => s.name.split(' - ')[0]))).map(innerKey => (
                                                            <div key={innerKey} className="chart-div-cell text-center">
                                                                {groupedByAction[action][entityType]?.[innerKey] || 0}
                                                            </div>
                                                        ))}
                                                    </div>
                                                );
                                            });
                                        });


                                    });

                                    return tableRows;
                                })()}
                            </div>

                        </div>
                    </div>
                </div>
            }
        </>
    );
};
