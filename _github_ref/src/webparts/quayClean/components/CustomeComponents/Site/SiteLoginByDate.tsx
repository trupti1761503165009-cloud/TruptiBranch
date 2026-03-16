import React, { useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import { Label } from 'office-ui-fabric-react';
import NoRecordFound from '../../CommonComponents/NoRecordFound';

interface SiteDataItem {
    SiteName: string;
    UserName: string;
    ActionType: string;
    Created: string;
}

interface Props {
    data: SiteDataItem[];
    chartType: 'bar' | 'pie';
    isChartOnly?: boolean;
}

const SiteLoginChart: React.FC<Props> = ({ data, chartType }) => {
    const chartRef = useRef<HTMLDivElement>(null);

    const getOption = (rawData: SiteDataItem[]) => {
        const loginData = rawData.filter((item) => item.ActionType === 'Visit');

        const siteUserMap: Record<string, { user: string; modified: string }[]> = {};

        loginData.forEach((item) => {
            const site = item.SiteName;
            if (!siteUserMap[site]) {
                siteUserMap[site] = [];
            }

            const alreadyAdded = siteUserMap[site].some(
                (entry) => entry.user === item.UserName && entry.modified === item.Created
            );

            if (!alreadyAdded) {
                siteUserMap[site].push({ user: item.UserName, modified: item.Created });
            }
        });

        const siteNames = Object.keys(siteUserMap);
        const pieData = siteNames.map((site) => ({
            name: site,
            value: siteUserMap[site].length,
            details: siteUserMap[site]
        }));

        return {
            title: {
                text: 'User Visits by Site',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: (params: any) => {
                    const { name, value, percent, data } = params;
                    const usersList = data.details
                        .map((d: any) => `• ${d.user} (${d.modified})`)
                        .join('<br/>');
                    return `
                <strong>${name}</strong><br/>
                Total: ${value} (${percent}%)<br/>
                ${usersList}
              `;
                }
            },
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
                    labelLine: {
                        show: true
                    },
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
                    restore: {
                        show: true,
                        title: 'Reset Chart'
                    }
                }
            }
        };
    };

    const siteUserMap: Record<string, { user: string; modified: string }[]> = {};
    const filteredData = data.filter((item: any) => item.SiteName !== "");
    filteredData.forEach((item) => {
        if (item.ActionType !== 'Visit') return;
        const site = item.SiteName;
        if (!siteUserMap[site]) {
            siteUserMap[site] = [];
        }
        const alreadyAdded = siteUserMap[site].some(
            (entry) => entry.user === item.UserName && entry.modified === item.Created
        );
        if (!alreadyAdded) {
            siteUserMap[site].push({ user: item.UserName, modified: item.Created });
        }
    });

    useEffect(() => {
        if (chartRef.current && filteredData.length > 0) {
            const myChart = echarts.init(chartRef.current);
            const option = getOption(filteredData);
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
    }, [data, chartType]);

    return (
        <>
            {!!filteredData && filteredData.length > 0 ?
                <div className="ims-chart-card mt-3">
                    <div className="chart-header d-flex justify-content-between align-items-center dflex">
                        <div>
                            <Label className="chart-label">User Visits by Site Report</Label>
                        </div>
                    </div>
                    <div>
                        <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
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
                </div>
            }

        </>
    );
};

export default SiteLoginChart;
