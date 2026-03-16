import * as React from "react";
import * as echarts from 'echarts';
import { Label, PrimaryButton, Toggle } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

export const MasterStateReport = (props: IAssociateChemicalProps) => {
    const [filterData, setfilterData] = React.useState<any[]>([]);
    const [selectedUser, setSelectedUser] = React.useState<string | null>(null);
    const chartRef = React.useRef<HTMLDivElement>(null);
    const chartInstance = React.useRef<echarts.EChartsType | null>(null);
    const [level, setLevel] = React.useState(0);
    const [selectedSite, setSelectedSite] = React.useState<string | null>(null);
    const [selectedState, setSelectedState] = React.useState<string | null>(null);

    type ExpandedSitesType = { [key: string]: boolean };
    type ExpandedDatesType = { [key: string]: boolean };
    type ExpandedStatesType = { [key: string]: boolean };
    const [expandedSites, setExpandedSites] = React.useState<ExpandedSitesType>({});
    const [expandedDates, setExpandedDates] = React.useState<ExpandedDatesType>({});
    const [expandedStates, setExpandedStates] = React.useState<ExpandedStatesType>({});

    const toggleSite = (site: string) => {
        setExpandedSites((prev) => ({ ...prev, [site]: !prev[site] }));
    };

    const toggleDate = (site: string, date: string) => {
        const key = `${site}-${date}`;
        setExpandedDates(prev => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const groupedByState = filterData.reduce((acc, item) => {
        const state = item.State || 'Unknown';
        const site = item.SiteName || 'Unknown';
        const user = item.UserName || 'Unknown';
        const modified = new Date(item.OrgCreated);

        if (!acc[state]) acc[state] = {};

        if (!acc[state][site]) {
            acc[state][site] = {
                items: [],
                users: new Set(),
                lastDate: modified,
            };
        }

        acc[state][site].items.push(item);
        acc[state][site].users.add(user);

        if (modified.getTime() > acc[state][site].lastDate.getTime()) {
            acc[state][site].lastDate = modified;
        }

        return acc;
    }, {} as any);

    const groupedBySite = filterData.reduce((acc, item) => {
        const site = item.SiteName || 'Unknown';
        const user = item.UserName || 'Unknown';
        const modified = new Date(item.OrgCreated);

        if (!acc[site]) {
            acc[site] = {
                items: [],
                users: new Set(),
                lastDate: modified,
            };
        }
        acc[site].items.push(item);
        acc[site].users.add(user);

        if (modified.getTime() > acc[site].lastDate.getTime()) {
            acc[site].lastDate = modified;
        }

        return acc;
    }, {} as any);

    React.useEffect(() => {
        if (!chartRef.current) return;
        if (!chartInstance.current) {
            chartInstance.current = echarts.init(chartRef.current);
        }
        chartInstance.current.clear();

        const drawLevel0 = () => {
            const stateGroups = filterData.reduce((acc, item) => {
                const state = item.State || 'Unknown';
                if (!acc[state]) acc[state] = [];
                acc[state].push(item);
                return acc;
            }, {} as { [key: string]: any[] });

            const stateNames = Object.keys(stateGroups);
            const stateCounts = stateNames.map(state => stateGroups[state].length);

            chartInstance.current?.setOption({
                title: { text: 'User Activity by State', left: 'center' },
                xAxis: {
                    type: 'category',
                    data: stateNames,
                    axisLabel: { interval: 0, rotate: 0 },
                },
                yAxis: { type: 'value' },
                series: [{
                    type: 'bar',
                    data: stateCounts,
                    label: { show: true, position: 'top' },
                    itemStyle: {
                        color: (params: any) => {
                            const colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE'];
                            return colors[params.dataIndex % colors.length];
                        }
                    }
                }],
                tooltip: {
                    trigger: 'axis',
                    formatter: (params: any) => {
                        const state = params[0].name;
                        const actions = stateGroups[state];
                        const actionCounts = actions.reduce((acc: any, action: any) => {
                            const actionType = action.ActionType;
                            acc[actionType] = (acc[actionType] || 0) + 1;
                            return acc;
                        }, {});
                        const summary = Object.entries(actionCounts)
                            .map(([type, count]) => `<strong>${type}</strong>: ${count}`)
                            .join('<br/>');
                        return `<div><strong>${state}</strong><br/>${summary}</div>`;
                    }
                }
            });

            chartInstance.current?.off('click');
            chartInstance.current?.on('click', (params: any) => {
                setSelectedState(params.name);
                setLevel(1);
            });
        };

        const drawLevel1 = () => {
            const siteGroups = filterData.reduce((acc, item) => {
                if (item.State !== selectedState) return acc;
                const site = item.SiteName || 'Unknown';
                if (!acc[site]) acc[site] = [];
                acc[site].push(item);
                return acc;
            }, {} as { [key: string]: any[] });

            const siteNames = Object.keys(siteGroups);
            const siteCounts = siteNames.map(site => siteGroups[site].length);
            const totalSites = siteNames.length;
            const visibleBars = 16;
            const endValue = totalSites > visibleBars ? (visibleBars / totalSites) * 100 : 100;
            chartInstance.current?.setOption({
                title: { text: `User Activity by Site (${selectedState})`, left: 'center' },
                xAxis: { type: 'category', data: siteNames, axisLabel: { interval: 0, rotate: 15 } },
                yAxis: { type: 'value' },
                series: [{
                    type: 'bar',
                    data: siteCounts,
                    label: { show: true, position: 'top' }, itemStyle: {
                        color: function (params: any) {
                            const colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'];
                            return colors[params.dataIndex % colors.length];
                        }
                    }
                }],
                tooltip: {
                    trigger: 'axis',
                    formatter: (params: any) => {
                        const site = params[0].name;
                        const actions = siteGroups[site];
                        const users = new Set(actions.map((a: any) => a.UserName)).size;
                        return `<div><strong>${site}</strong><br/>Actions: ${actions.length}<br/>Users: ${users}</div>`;
                    }
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

            chartInstance.current?.off('click');
            chartInstance.current?.on('click', (params: any) => {
                setSelectedSite(params.name);
                setLevel(2);
            });
        };

        const drawLevel2 = () => {
            const userGroups = filterData.reduce((acc, item) => {
                if (item.State !== selectedState || item.SiteName !== selectedSite) return acc;
                const user = item.UserName || 'Unknown';
                if (!acc[user]) acc[user] = [];
                acc[user].push(item);
                return acc;
            }, {} as { [key: string]: any[] });

            const userNames = Object.keys(userGroups);
            const userCounts = userNames.map(user => userGroups[user].length);

            chartInstance.current?.setOption({
                title: { text: `User Activity by ${selectedSite}`, left: 'center' },
                xAxis: { type: 'category', data: userNames, axisLabel: { interval: 0, rotate: 15 } },
                yAxis: { type: 'value' },
                series: [{
                    type: 'bar',
                    data: userCounts,
                    label: { show: true, position: 'top' }
                }],
                tooltip: {
                    trigger: 'axis',
                    formatter: (params: any) => {
                        const user = params[0].name;
                        const actions = userGroups[user];
                        const actionTypes = actions.reduce((acc: any, action: any) => {
                            const type = action.ActionType;
                            acc[type] = (acc[type] || 0) + 1;
                            return acc;
                        }, {});
                        const summary = Object.entries(actionTypes)
                            .map(([type, count]) => `<strong>${type}</strong>: ${count}`)
                            .join('<br/>');
                        return `<div><strong>${user}</strong><br/>${summary}</div>`;
                    }
                }
            });

            chartInstance.current?.off('click');
            chartInstance.current?.on('click', (params: any) => {
                setSelectedUser(params.name);
                setLevel(3);
            });
        };

        const drawLevel3 = () => {
            const userActions = filterData.filter(
                item =>
                    item.State === selectedState &&
                    item.SiteName === selectedSite &&
                    item.UserName === selectedUser
            );

            const dateGroups = userActions.reduce((acc, item) => {
                const date = item.Modified && typeof item.Modified === 'string'
                    ? item.Modified.split('T')[0]
                    : 'Unknown';
                if (!acc[date]) acc[date] = [];
                acc[date].push(item);
                return acc;
            }, {} as { [key: string]: any[] });

            const dates = Object.keys(dateGroups).sort();
            const dateCounts = dates.map(date => dateGroups[date].length);

            chartInstance.current?.setOption({
                title: { text: `User Activity Timeline of ${selectedUser}`, left: 'center' },
                xAxis: { type: 'category', data: dates, axisLabel: { rotate: 45 } },
                yAxis: { type: 'value' },
                series: [{
                    type: 'bar',
                    data: dateCounts,
                    label: { show: true, position: 'top' }
                }],
                tooltip: {
                    trigger: 'axis',
                    formatter: (params: any) => {
                        const date = params[0].name;
                        const actions = dateGroups[date];
                        const list = actions
                            .map((a: any) => `${a.EntityName || 'Unknown'} - <strong>${a.ActionType}</strong>`)
                            .join('<br/>');
                        return `<div><strong>${date}</strong><br/>${list}</div>`;
                    }
                }
            });

            chartInstance.current?.off('click');
        };

        if (level === 0) drawLevel0();
        else if (level === 1) drawLevel1();
        else if (level === 2) drawLevel2();
        else if (level === 3) drawLevel3();

    }, [filterData, level, selectedState, selectedSite, selectedUser]);


    React.useEffect(() => {
        const filteredData = props.ChartData.filter(
            (item: any) => item.EntityType === UserActionEntityTypeEnum.Site && item.SiteName !== ""
        );
        setfilterData(filteredData);
    }, [props.ChartData]);

    return (
        <>
            {!!filterData && filterData.length > 0 ?

                <div className="ims-Site-chart-card mt-3">
                    <div className="chart-header d-flex justify-content-between align-items-center dflex">
                        <div>
                            <Label className="chart-label">User Activity on State Report</Label>
                        </div>
                        {level > 0 && (<PrimaryButton
                            text='Back'
                            onClick={() => setLevel(prev => prev - 1)}
                            className='btn btn-primary'
                            style={{ marginTop: "27px", marginLeft: "5px" }}
                        />)}
                    </div>
                    <div>
                        <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
                    </div>
                </div>
                :
                <div>
                    <div className="ims-Site-chart-card mt-3">
                        <div className="chart-header d-flex justify-content-between align-items-center dflex">
                            <div>
                                <Label className="chart-label">User Activity on State Report</Label>
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


