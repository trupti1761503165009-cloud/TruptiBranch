/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { Label, PrimaryButton } from 'office-ui-fabric-react';
import NoRecordFound from '../../CommonComponents/NoRecordFound';

interface SiteDataItem {
    State: string;
    UserName: string;
    ActionType: string;
    Modified: string;
    SiteName: string;
}

interface Props {
    data: SiteDataItem[];
    chartType: 'bar' | 'pie';
    isChartOnly?: boolean;
}

const StateSiteLoginChart: React.FC<Props> = ({ data, chartType }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.EChartsType | null>(null);

    const [level, setLevel] = React.useState(1);
    const [selectedState, setSelectedState] = React.useState<string | null>(null);

    const getStateLevelOption = (filteredData: SiteDataItem[]) => {
        const loginData = filteredData.filter((item) => item.ActionType === 'Visit');

        const stateUserMap: Record<string, { user: string; modified: string }[]> = {};

        loginData.forEach((item) => {
            const state = item.State;
            if (!stateUserMap[state]) {
                stateUserMap[state] = [];
            }

            const alreadyAdded = stateUserMap[state].some(
                (entry) => entry.user === item.UserName && entry.modified === item.Modified
            );

            if (!alreadyAdded) {
                stateUserMap[state].push({ user: item.UserName, modified: item.Modified });
            }
        });

        const pieData = Object.entries(stateUserMap).map(([state, users]) => ({
            name: state,
            value: users.length,
            details: users
        }));

        return {
            title: {
                text: 'User Visits by State',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const { name, value, percent, data } = params;
                    const usersList = data.details
                        .map((d: any) => `• ${d.user} (${d.modified})`)
                        .join('<br/>');
                    return `<strong>${name}</strong><br/>Total: ${value} (${percent}%)<br/>${usersList}`;
                }
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                right: 10,
                top: 'middle',
                bottom: 10,
                textStyle: { fontSize: 12 },
                pageIconColor: '#aaa',
                pageTextStyle: { color: '#333' }
            },
            series: [
                {
                    name: 'Users',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['40%', '50%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: true,
                        formatter: '{b}: {c} ({d}%)',
                        fontSize: 12
                    },
                    labelLine: { show: true },
                    data: pieData
                }
            ],
            toolbox: {
                show: true,
                orient: 'horizontal',
                left: 'right',
                top: 'top',
                feature: {
                    saveAsImage: {
                        show: true,
                        title: 'Download Image',
                        type: 'png',
                        name: 'chart',
                        pixelRatio: 2,
                        excludeComponents: ['toolbox'],
                        backgroundColor: '#fff'
                    },
                    dataView: {
                        show: true,
                        title: 'View Data',
                        readOnly: false,
                        lang: ['Data View', 'Close', 'Refresh']
                    },
                    restore: { show: true, title: 'Reset Chart' }
                }
            }
        };
    };

    const getSiteLevelOption = (state: string, filteredData: SiteDataItem[]) => {
        const loginData = filteredData.filter(
            (item) => item.State === state && item.ActionType === 'Visit'
        );

        const siteUserMap: Record<string, { user: string; modified: string }[]> = {};

        loginData.forEach((item) => {
            const site = item.SiteName;
            if (!siteUserMap[site]) {
                siteUserMap[site] = [];
            }

            const alreadyAdded = siteUserMap[site].some(
                (entry) => entry.user === item.UserName && entry.modified === item.Modified
            );

            if (!alreadyAdded) {
                siteUserMap[site].push({ user: item.UserName, modified: item.Modified });
            }
        });

        const pieData = Object.entries(siteUserMap).map(([site, users]) => ({
            name: site,
            value: users.length,
            details: users
        }));

        return {
            title: {
                text: `User Visits Site in ${state}`,
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const { name, value, percent, data } = params;
                    const usersList = data.details
                        .map((d: any) => `• ${d.user} (${d.modified})`)
                        .join('<br/>');
                    return `<strong>${name}</strong><br/>Total: ${value} (${percent}%)<br/>${usersList}`;
                }
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                right: 10,
                top: 'middle',
                bottom: 10,
                textStyle: { fontSize: 12 },
                pageIconColor: '#aaa',
                pageTextStyle: { color: '#333' }
            },
            series: [
                {
                    name: 'Users',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    center: ['40%', '50%'],
                    avoidLabelOverlap: false,
                    label: {
                        show: true,
                        formatter: '{b}: {c} ({d}%)',
                        fontSize: 12
                    },
                    labelLine: { show: true },
                    data: pieData
                }
            ],
            toolbox: {
                show: true,
                orient: 'horizontal',
                left: 'right',
                top: 'top',
                feature: {
                    saveAsImage: {
                        show: true,
                        title: 'Download Image',
                        type: 'png',
                        name: 'chart',
                        pixelRatio: 2,
                        excludeComponents: ['toolbox'],
                        backgroundColor: '#fff'
                    },
                    dataView: {
                        show: true,
                        title: 'View Data',
                        readOnly: false,
                        lang: ['Data View', 'Close', 'Refresh']
                    },
                    restore: { show: true, title: 'Reset Chart' }
                }
            }
        };
    };

    useEffect(() => {
        const filteredData = data.filter((item) => item.State !== '');
        if (!chartRef.current || filteredData.length === 0) return;

        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
        }

        const instance = chartInstance.current;
        const renderStateChart = () => {
            setLevel(1);
            setSelectedState(null);
            const option = getStateLevelOption(filteredData);
            instance.setOption(option);
            instance.off('click');
            instance.on('click', (params: any) => {
                const clickedState = params.name;
                setSelectedState(clickedState);
                renderSiteChart(clickedState);
            });
        };

        const renderSiteChart = (state: string) => {
            setLevel(2);
            const option = getSiteLevelOption(state, filteredData);
            instance.setOption(option);
        };

        renderStateChart();

        const resizeHandler = () => instance.resize();
        window.addEventListener('resize', resizeHandler);

        return () => {
            window.removeEventListener('resize', resizeHandler);
            instance.dispose();
            chartInstance.current = null;
        };
    }, [data, chartType]);

    return (

        <div>
            {!!data && data.length > 0 ?
                <div>
                    <div className="ims-Site-chart-card mt-3">
                        <div className="chart-header d-flex justify-content-between align-items-center dflex">
                            <div>
                                <Label className="chart-label">
                                    {level === 1 ? 'User Visits by State Report' : `Site Visits in ${selectedState} Report`}
                                </Label>
                            </div>
                            {level > 1 && (
                                <PrimaryButton className="btn btn-primary" text="Back" onClick={() => {
                                    const filtered = data.filter((d) => d.State !== '');
                                    if (chartInstance.current) {
                                        const option = getStateLevelOption(filtered);
                                        chartInstance.current.setOption(option);
                                        setLevel(1);
                                        setSelectedState(null);
                                    }
                                }} />
                            )}
                        </div>
                        <div>
                            <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
                        </div>
                    </div>
                </div>
                : <div>
                    <div className="ims-Site-chart-card mt-3">
                        <div className="chart-header d-flex justify-content-between align-items-center dflex">
                            <div>
                                {level === 1 ? 'User Visits by State' : `Site Visits in ${selectedState}`}
                            </div>
                        </div>
                        <div>
                            <NoRecordFound />
                        </div>
                    </div>
                </div>}
        </div>
    );
};

export default StateSiteLoginChart;
