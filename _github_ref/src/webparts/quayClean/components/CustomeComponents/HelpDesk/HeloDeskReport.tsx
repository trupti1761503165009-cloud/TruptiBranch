/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Label, PrimaryButton } from '@fluentui/react';
import HelpDeskReportList from './HelpDeskReportList';
import { UserActionEntityTypeEnum } from '../../../../../Common/Enum/ComponentNameEnum';
import NoRecordFound from '../../CommonComponents/NoRecordFound';

interface ActivityItem {
    EntityType: string;
    SiteName: string;
    UserName: string;
    EntityName: string;
    ActionType: string;
    Created: string;
}

interface Props {
    data: ActivityItem[];
    isChartOnly?: boolean;
}

const HelpDeskReport: React.FC<Props> = ({ data, isChartOnly }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.EChartsType | null>(null);

    const [level, setLevel] = useState(1);
    const [selectedSite, setSelectedSite] = useState<string | null>(null);
    const [selectedEntityName, setSelectedEntityName] = useState<string | null>(null);
    const [selectedActionType, setSelectedActionType] = useState<string | null>(null);

    const filteredData = data.filter(item => item.EntityType === UserActionEntityTypeEnum.HelpDesk);

    useEffect(() => {
        if (chartRef.current) {
            chartInstance.current = echarts.init(chartRef.current);
            drawLevel1();
        }

        return () => {
            chartInstance.current?.dispose();
        };
    }, [data]);

    const drawLevel1 = () => {
        setLevel(1);
        const siteMap: Record<string, ActivityItem[]> = {};
        filteredData.forEach(item => {
            if (!siteMap[item.SiteName]) {
                siteMap[item.SiteName] = [];
            }
            siteMap[item.SiteName].push(item);
        });

        const siteNames = Object.keys(siteMap);
        const counts = siteNames.map(site => siteMap[site]?.length);
        const totalSites = siteNames.length;
        const visibleBars = 16;
        const endValue = totalSites > visibleBars ? (visibleBars / totalSites) * 100 : 100;
        chartInstance.current?.off('click');
        chartInstance.current?.setOption({
            title: { text: 'Help Desk Activity by Site Name', left: 'center' },
            xAxis: { type: 'category', data: siteNames, axisLabel: { rotate: 30 } },
            yAxis: { type: 'value' },
            tooltip: {
                trigger: 'axis',
                formatter: function (params: any) {
                    const site = params[0].name;
                    const actions = siteMap[site].reduce((acc: any, curr) => {
                        acc[curr.ActionType] = (acc[curr.ActionType] || 0) + 1;
                        return acc;
                    }, {});
                    return `<strong>${site}</strong><br/>${Object.entries(actions).map(([k, v]) => `${k}: ${v}`).join('<br/>')}`;
                }
            },
            series: [{
                type: 'bar',
                data: counts,
                label: {
                    show: true,
                    position: 'top',
                    fontWeight: 'bold'
                },
                itemStyle: {
                    color: function (params: any) {
                        const colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'];
                        return colors[params.dataIndex % colors.length];
                    }
                }
            }],
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
            toolbox: {
                show: true,
                feature: {
                    saveAsImage: {},
                    dataView: { readOnly: true },
                    magicType: { type: ['bar', 'line'] },
                    restore: {},
                },
            },
        });

        chartInstance.current?.on('click', (params: any) => {
            setSelectedSite(params.name);
            drawLevel2(params.name);
        });
    };

    const drawLevel2 = (siteName: string) => {
        setLevel(2);
        const filtered = filteredData.filter(d => d.SiteName === siteName);

        const entityMap: Record<string, ActivityItem[]> = {};
        filtered.forEach(item => {
            const name = item.EntityName || 'Unknown';
            if (!entityMap[name]) {
                entityMap[name] = [];
            }
            entityMap[name].push(item);
        });

        const entityNames = Object.keys(entityMap);
        const counts = entityNames.map(name => entityMap[name]?.length);
        const totalSites = entityNames.length;
        const visibleBars = 16;
        const endValue = totalSites > visibleBars ? (visibleBars / totalSites) * 100 : 100;
        chartInstance.current?.off('click');
        chartInstance.current?.setOption({
            title: { text: `Help Desk Entities in ${siteName}`, left: 'center' },
            xAxis: { type: 'category', data: entityNames, axisLabel: { rotate: 30 } },
            yAxis: { type: 'value' },
            tooltip: {
                trigger: 'axis',
                formatter: function (params: any) {
                    const entity = params[0].name;
                    const actions = entityMap[entity].reduce((acc: any, curr) => {
                        acc[curr.ActionType] = (acc[curr.ActionType] || 0) + 1;
                        return acc;
                    }, {});
                    return `<strong>${entity}</strong><br/>${Object.entries(actions).map(([k, v]) => `${k}: ${v}`).join('<br/>')}`;
                }
            },
            series: [{
                type: 'bar',
                data: counts,
                label: {
                    show: true,
                    position: 'top',
                    fontWeight: 'bold'
                },
                itemStyle: {
                    color: function (params: any) {
                        const colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'];
                        return colors[params.dataIndex % colors.length];
                    }
                }
            }],
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
        });

        chartInstance.current?.on('click', (params: any) => {
            setSelectedEntityName(params.name);
            drawLevel3(siteName, params.name);
        });
    };

    const drawLevel3 = (siteName: string, entityName: string) => {
        setLevel(3);
        const filtered = filteredData.filter(d => d.SiteName === siteName && d.EntityName === entityName);

        const actionMap: Record<string, ActivityItem[]> = {};
        filtered.forEach(item => {
            if (!actionMap[item.ActionType]) {
                actionMap[item.ActionType] = [];
            }
            actionMap[item.ActionType].push(item);
        });

        const actions = Object.keys(actionMap);
        const counts = actions.map(action => actionMap[action]?.length);

        chartInstance.current?.off('click');
        chartInstance.current?.setOption({
            title: { text: `Help Desk Actions on ${entityName} in ${siteName}`, left: 'center' },
            xAxis: { type: 'category', data: actions, axisLabel: { rotate: 30 } },
            yAxis: { type: 'value' },
            tooltip: {
                trigger: 'axis',
                formatter: function (params: any) {
                    const action = params[0].name;
                    const items = actionMap[action] || [];
                    return `
            <strong>${action}</strong><br/>
            ${items.map(a => `User: ${a.UserName} @ ${a.Created}`).join('<br/>')}
          `;
                }
            },
            series: [{
                type: 'bar',
                data: counts,
                label: {
                    show: true,
                    position: 'top',
                    fontWeight: 'bold'
                },
                itemStyle: {
                    color: function (params: any) {
                        const colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'];
                        return colors[params.dataIndex % colors.length];
                    }
                }
            }],
            toolbox: {
                show: true,
                feature: {
                    saveAsImage: {},
                    dataView: { readOnly: true },
                    magicType: { type: ['bar', 'line'] },
                    restore: {},
                },
            },
        });

        chartInstance.current?.on('click', (params: any) => {
            setSelectedActionType(params.name);
            drawLevel4(siteName, entityName, params.name);
        });
    };

    const drawLevel4 = (siteName: string, entityName: string, actionType: string) => {
        setLevel(4);
        const filtered = filteredData.filter(
            d => d.SiteName === siteName &&
                d.EntityName === entityName &&
                d.ActionType === actionType
        );

        const userMap: Record<string, ActivityItem[]> = {};
        filtered.forEach(item => {
            const user = item.UserName || 'Unknown';
            if (!userMap[user]) {
                userMap[user] = [];
            }
            userMap[user].push(item);
        });

        const users = Object.keys(userMap);
        const counts = users.map(user => userMap[user]?.length);

        chartInstance.current?.off('click');
        chartInstance.current?.setOption({
            title: { text: `Help Desk by Users for ${actionType} on ${entityName}`, left: 'center' },
            xAxis: { type: 'category', data: users, axisLabel: { rotate: 30 } },
            yAxis: { type: 'value' },
            tooltip: {
                trigger: 'axis',
                formatter: function (params: any) {
                    const user = params[0].name;
                    const items = userMap[user] || [];
                    return `<strong>${user}</strong><br/>${items.map(a => a.Created).join('<br/>')}`;
                }
            },
            series: [{
                type: 'bar',
                data: counts,
                label: {
                    show: true,
                    position: 'top',
                    fontWeight: 'bold'
                },
                itemStyle: {
                    color: function (params: any) {
                        const colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'];
                        return colors[params.dataIndex % colors.length];
                    }
                }
            }],
            toolbox: {
                show: true,
                feature: {
                    saveAsImage: {},
                    dataView: { readOnly: true },
                    magicType: { type: ['bar', 'line'] },
                    restore: {},
                },
            },
        });
    };


    return (
        <>
            {!!filteredData && filteredData.length > 0 ?
                <div>
                    <div className="ims-Site-chart-card mt-3">
                        <div className="chart-header d-flex justify-content-between align-items-center dflex">
                            <div>
                                <Label className="chart-label">Help Desk Activity Log Report</Label>
                            </div>
                            {level > 1 && (
                                <PrimaryButton
                                    text="Back"
                                    onClick={() => {
                                        if (level === 4 && selectedSite && selectedEntityName) {
                                            drawLevel3(selectedSite, selectedEntityName);
                                        } else if (level === 3 && selectedSite) {
                                            drawLevel2(selectedSite);
                                        } else if (level === 2) {
                                            drawLevel1();
                                        } else {
                                            drawLevel2(selectedSite as any);
                                        }
                                    }}
                                    className="btn btn-primary"
                                    style={{ marginTop: '27px', marginLeft: '5px' }}
                                />
                            )}

                        </div>
                        <div>
                            <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
                        </div>
                    </div>
                    {(isChartOnly == undefined || isChartOnly == false) && (!!filteredData && filteredData.length > 0) && (
                        <HelpDeskReportList filteredData={filteredData} />
                    )}
                </div>
                : <div>
                    <div className="ims-Site-chart-card mt-3">
                        <div className="chart-header d-flex justify-content-between align-items-center dflex">
                            <div>
                                <Label className="chart-label">Help Desk Activity Log Report</Label>
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

export default HelpDeskReport;
