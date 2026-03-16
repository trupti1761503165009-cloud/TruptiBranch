import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { Label } from 'office-ui-fabric-react/lib/Label';
import NoRecordFound from '../../CommonComponents/NoRecordFound';

const UserVisitsChart: React.FC<{ visitSiteData: any[] }> = ({ visitSiteData }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chartRef.current) {
            const chart = echarts.init(chartRef.current);
            // Group visits by SiteName
            const siteVisitMap: {
                [siteName: string]: {
                    count: number;
                    users: { user: string; modified: string }[];
                };
            } = {};

            visitSiteData.forEach((visit) => {
                const siteName = visit.SiteName;
                if (!siteVisitMap[siteName]) {
                    siteVisitMap[siteName] = { count: 0, users: [] };
                }

                siteVisitMap[siteName].count += 1;
                siteVisitMap[siteName].users.push({
                    user: visit.UserName,
                    modified: visit.Created,
                });
            });

            // Prepare data for chart
            const chartData = Object.entries(siteVisitMap).map(([siteName, data]) => ({
                name: siteName,
                value: data.count,
                tooltipData: data.users,
            }));

            chart.setOption({
                tooltip: {
                    trigger: 'item',
                    enterable: true,
                    confine: true,
                    extraCssText: 'max-height: 400px; overflow-y: auto;min-width: 200px; max-width: 300px;', // outer scroll only
                    formatter: function (params: any) {
                        const siteName = params.name;
                        const users = chartData.find((item) => item.name === siteName)?.tooltipData || [];

                        const userList = users
                            .map((u) => `<div><strong>${u.user}</strong><br/><span style="color: gray">${u.modified}</span></div>`)
                            .join('<hr/>');

                        // No internal scrolling here!
                        return `
                    <div>
                      <strong>${siteName}</strong>
                      ${userList}
                    </div>
                  `;
                    }
                },


                // legend: {
                //     orient: 'vertical',
                //     right: 10,
                //     top: 'center',
                // },
                legend: {
                    type: 'scroll', // Enables scrollable legend
                    orient: 'vertical', // Can be 'horizontal' for tabs-style
                    right: 10,
                    top: 'middle',
                    bottom: 10,
                    textStyle: {
                        fontSize: 12
                    },
                    pageIconColor: '#aaa', // Customize pagination icons if needed
                    pageTextStyle: {
                        color: '#333'
                    }
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
                        labelLine: {
                            show: true,
                        },
                        data: chartData,
                    },
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
                        restore: {
                            show: true,
                            title: 'Reset Chart'
                        }
                    }
                }
            });

            const handleResize = () => chart.resize();
            window.addEventListener('resize', handleResize);

            return () => {
                chart.dispose();
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [visitSiteData]);

    return (
        <>
            {!!visitSiteData && visitSiteData.length > 0 ?
                <div>
                    <div className="ims-chart-card mt-3">
                        <div className="chart-header d-flex justify-content-between align-items-center dflex">
                            <div>
                                <Label className="chart-label">User Visits by Site Report</Label>
                            </div>
                        </div>
                        <div>
                            <div ref={chartRef} style={{ width: '100%', height: '700px' }} />
                        </div>
                    </div>
                </div>
                : <div>
                    <div className="ims-Site-chart-card mt-3">
                        <div className="chart-header d-flex justify-content-between align-items-center dflex">
                            <div>
                                <Label className="chart-label">User Visits by Site Report</Label>
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

export default UserVisitsChart;
