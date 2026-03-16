/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { PrimaryButton } from 'office-ui-fabric-react';
import NoRecordFound from '../../CommonComponents/NoRecordFound';

interface VisitItem {
    State: string;
    SiteName: string;
    UserName: string;
    Modified: string;
}

interface Props {
    visitSiteData: VisitItem[];
}

const UserStateVisitsChart: React.FC<Props> = ({ visitSiteData }) => {
    const chartRef = useRef<HTMLDivElement>(null);
    const chartInstance = useRef<echarts.EChartsType | null>(null);

    const [level, setLevel] = React.useState(1);
    const [selectedState, setSelectedState] = React.useState<string | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            chartInstance.current = echarts.init(chartRef.current);
            drawStateLevel();
        }

        const resizeHandler = () => chartInstance.current?.resize();
        window.addEventListener('resize', resizeHandler);

        return () => {
            chartInstance.current?.dispose();
            window.removeEventListener('resize', resizeHandler);
        };
    }, [visitSiteData]);

    const drawStateLevel = () => {
        setLevel(1);
        setSelectedState(null);

        const stateMap: Record<string, { count: number; users: { user: string; modified: string }[] }> = {};

        visitSiteData.forEach((visit) => {
            if (!stateMap[visit.State]) {
                stateMap[visit.State] = { count: 0, users: [] };
            }
            stateMap[visit.State].count += 1;
            stateMap[visit.State].users.push({ user: visit.UserName, modified: visit.Modified });
        });

        const chartData = Object.entries(stateMap).map(([state, data]) => ({
            name: state,
            value: data.count,
            tooltipData: data.users,
        }));

        chartInstance.current?.off('click');
        chartInstance.current?.setOption({
            title: { text: 'User Visits by State', left: 'center' },
            tooltip: {
                trigger: 'item',
                enterable: true,
                confine: true,
                extraCssText: 'max-height: 400px; overflow-y: auto;min-width: 200px; max-width: 300px;',
                formatter: function (params: any) {
                    const state = params.name;
                    const users = chartData.find((item) => item.name === state)?.tooltipData || [];

                    const userList = users
                        .map((u) => `<div><strong>${u.user}</strong><br/><span style="color: gray">${u.modified}</span></div>`)
                        .join('<hr/>');

                    return `<div><strong>${state}</strong>${userList}</div>`;
                }
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                right: 10,
                top: 'middle',
                bottom: 10,
            },
            series: [
                {
                    name: 'Site Visits',
                    type: 'pie',
                    radius: ['30%', '70%'],
                    avoidLabelOverlap: true,
                    label: {
                        show: true,
                        position: 'outside',
                        formatter: '{b}: {c}',
                    },
                    labelLine: { show: true },
                    data: chartData,
                },
            ],
            toolbox: {
                show: true,
                orient: 'horizontal',
                left: 'right',
                top: 'top',
                feature: {
                    saveAsImage: {},
                    dataView: { readOnly: false },
                    restore: {},
                },
            },
        });

        chartInstance.current?.on('click', (params: any) => {
            const clickedState = params.name;
            setSelectedState(clickedState);
            drawSiteLevel(clickedState);
        });
    };

    const drawSiteLevel = (state: string) => {
        setLevel(2);

        const filtered = visitSiteData.filter(item => item.State === state);
        const siteMap: Record<string, { count: number; users: { user: string; modified: string }[] }> = {};

        filtered.forEach((visit) => {
            if (!siteMap[visit.SiteName]) {
                siteMap[visit.SiteName] = { count: 0, users: [] };
            }
            siteMap[visit.SiteName].count += 1;
            siteMap[visit.SiteName].users.push({ user: visit.UserName, modified: visit.Modified });
        });

        const chartData = Object.entries(siteMap).map(([site, data]) => ({
            name: site,
            value: data.count,
            tooltipData: data.users,
        }));

        chartInstance.current?.off('click');
        chartInstance.current?.setOption({
            title: { text: `User Visits by Sites in ${state}`, left: 'center' },
            tooltip: {
                trigger: 'item',
                enterable: true,
                confine: true,
                extraCssText: 'max-height: 400px; overflow-y: auto;min-width: 200px; max-width: 300px;',
                formatter: function (params: any) {
                    const site = params.name;
                    const users = chartData.find((item) => item.name === site)?.tooltipData || [];

                    const userList = users
                        .map((u) => `<div><strong>${u.user}</strong><br/><span style="color: gray">${u.modified}</span></div>`)
                        .join('<hr/>');

                    return `<div><strong>${site}</strong>${userList}</div>`;
                }
            },
            legend: {
                type: 'scroll',
                orient: 'vertical',
                right: 10,
                top: 'middle',
                bottom: 10,
            },
            series: [
                {
                    name: 'Site Visits',
                    type: 'pie',
                    radius: ['30%', '70%'],
                    avoidLabelOverlap: true,
                    label: {
                        show: true,
                        position: 'outside',
                        formatter: '{b}: {c}',
                    },
                    labelLine: { show: true },
                    data: chartData,
                },
            ],
            toolbox: {
                show: true,
                orient: 'horizontal',
                left: 'right',
                top: 'top',
                feature: {
                    saveAsImage: {},
                    dataView: { readOnly: false },
                    restore: {},
                },
            },
        });
    };

    return (
        <>
            {!!visitSiteData && visitSiteData.length > 0 ?
                <div>
                    <div>
                        <div className="ims-Site-chart-card mt-3">
                            <div className="chart-header d-flex justify-content-between align-items-center dflex">
                                <div>
                                    <Label className="chart-label">
                                        {/* {level === 1 ? 'User Visits by State Report' : `Sites in ${selectedState} Report`} */}
                                        User Visits by State Report
                                    </Label>
                                </div>
                                {level > 1 && (
                                    <PrimaryButton
                                        text="Back"
                                        onClick={() => drawStateLevel()}
                                        className="btn btn-primary"
                                        style={{ marginTop: "5px", marginLeft: "5px" }}
                                    />
                                )}
                            </div>
                            <div>
                                <div ref={chartRef} style={{ width: '100%', height: '700px' }} />
                            </div>
                        </div>

                    </div>
                </div>
                : <div>
                    <div className="ims-Site-chart-card mt-3">
                        <div className="chart-header d-flex justify-content-between align-items-center dflex">
                            <div>
                                {level === 1 ? 'User Visits by State' : `User Visits by Sites (${selectedState})`}
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

export default UserStateVisitsChart;