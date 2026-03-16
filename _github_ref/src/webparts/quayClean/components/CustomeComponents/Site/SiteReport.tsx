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

export const SiteReport = (props: IAssociateChemicalProps) => {
    const [filterData, setfilterData] = React.useState<any[]>([]);
    const [selectedUser, setSelectedUser] = React.useState<string | null>(null);
    const chartRef = React.useRef<HTMLDivElement>(null);
    const chartInstance = React.useRef<echarts.EChartsType | null>(null);
    const [level, setLevel] = React.useState(0);
    const [selectedSite, setSelectedSite] = React.useState<string | null>(null);

    type ExpandedSitesType = { [key: string]: boolean };
    type ExpandedDatesType = { [key: string]: boolean };

    const [expandedSites, setExpandedSites] = React.useState<ExpandedSitesType>({});
    const [expandedDates, setExpandedDates] = React.useState<ExpandedDatesType>({});

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
        chartInstance.current.clear(); // 👈 Clear previous chart config

        const drawLevel0 = () => {
            // Grouping data by SiteName
            const siteGroups = filterData.reduce((acc, item) => {
                const site = item.SiteName || 'Unknown';
                if (!acc[site]) {
                    acc[site] = [];
                }
                acc[site].push(item);
                return acc;
            }, {});

            const siteNames = Object.keys(siteGroups);
            const siteValues = siteNames.map(site => siteGroups[site].length);
            const totalSites = siteNames.length;
            const visibleBars = 16;
            const endValue = totalSites > visibleBars ? (visibleBars / totalSites) * 100 : 100;
            chartInstance.current?.setOption({
                title: { text: 'Activity by Site', left: 'center' },
                xAxis: {
                    type: 'category',
                    data: siteNames,
                    axisLabel: {
                        interval: 0,
                        rotate: 15
                    }
                },
                yAxis: { type: 'value' },
                series: [{
                    type: 'bar',
                    data: siteValues,
                    label: {
                        show: true,
                        position: 'top'
                    },
                    itemStyle: {
                        color: function (params: any) {
                            const colors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272'];
                            return colors[params.dataIndex % colors.length];
                        }
                    }
                }],

                tooltip: {
                    trigger: 'axis',
                    enterable: true, // Allows interaction with the tooltip
                    extraCssText: 'max-height: 400px; overflow-y: auto;', // Enables vertical scrolling
                    formatter: (params: any) => {
                        const siteName = params[0]?.name;
                        const actions = siteGroups[siteName];

                        // Counting valid action types
                        const actionCounts = actions.reduce((acc: any, action: any) => {
                            const actionType = action.ActionType;
                            if (actionType) { // Ensure ActionType is valid
                                acc[actionType] = (acc[actionType] || 0) + 1;
                            }
                            return acc;
                        }, {});

                        // Preparing user, entity, and timestamp details
                        const userDetails = actions.map((action: any) => {
                            return `<strong>${action.UserName} (${action.ActionType})</strong> <br/> ${action.EntityName} at ${action.Created}`;
                        });

                        // Formatting the tooltip content
                        const actionCountLines = Object.entries(actionCounts)
                            .map(([type, count]) => `<strong>${type}</strong>: ${count}`)
                            .join('<br/>');

                        const userDetailLines = userDetails
                            .map((detail: any) => `${detail}`)
                            .join('<br/><hr/>');

                        return `
                            <div style="max-width: 300px;">
                                <div><strong>${siteName}</strong></div>
                                <div style="margin-top: 5px;">${actionCountLines}</div>
                                <div style="margin-top: 10px;"><u><strong>User Actions</strong></u></div>
                                <div>${userDetailLines}</div>
                            </div>
                        `;
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

            chartInstance.current?.off('click');
            chartInstance.current?.on('click', (params: any) => {
                setSelectedSite(params.name);
                setLevel(1);
            });
        };
        const drawLevel1 = () => {
            interface UserActivities {
                [key: string]: any; // Or replace 'any' with a more specific type if possible
            }

            let userActivities: UserActivities = {};
            // Aggregate activities per user for the selected site
            filterData.forEach(item => {
                if (item.SiteName === selectedSite) {
                    const user = item.UserName || 'Unknown';
                    if (!userActivities[user]) {
                        userActivities[user] = [];
                    }
                    userActivities[user].push({
                        entityName: item.EntityName,
                        actionType: item.ActionType,
                        created: item.Created
                    });
                }
            });

            const users = Object.keys(userActivities);
            const activityCounts = users.map(user => userActivities[user].length);

            chartInstance.current?.setOption({
                title: { text: `User Activities in ${selectedSite}`, left: 'center' },
                xAxis: {
                    type: 'category',
                    data: users,
                    axisLabel: {
                        interval: 0,
                        rotate: 15
                    }
                },
                yAxis: { type: 'value' },
                series: [{
                    type: 'bar',
                    data: activityCounts,
                    label: {
                        show: true,
                        position: 'top'
                    },
                }],
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    },
                    enterable: true,
                    confine: true,
                    extraCssText: 'max-height: 400px; overflow-y: auto;min-width: 200px;', // outer scroll only
                    formatter: function (params: any) {
                        const user = params[0].name;
                        const activities = userActivities[user];
                        let tooltipContent = `<div><strong>${user}'s Activities:</strong></div>`;
                        activities.forEach((activity: any) => {
                            tooltipContent += `
                                <div>
                                    <strong>Entity:</strong> ${activity.entityName}<br/>
                                    <strong>Action:</strong> ${activity.actionType}<br/>
                                    <strong>Time:</strong> ${activity.created}
                                </div>
                                <hr/>
                            `;
                        });
                        return `<div style="max-height: 180px; overflow-y: auto;">${tooltipContent}</div>`;
                    }
                },
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

            chartInstance.current?.off('click');
            chartInstance.current?.on('click', (params: any) => {
                setSelectedUser(params.name);
                setLevel(2);
            });
        };
        const drawLevel2 = () => {
            interface DateActivities {
                [key: string]: any; // Or replace 'any' with a more specific type if possible
            }

            let dateActivities: DateActivities = {};

            filterData.forEach(item => {
                if (item.SiteName === selectedSite && item.UserName === selectedUser) {
                    const date = item.Created.split(' ')[0]; // Extract the date part
                    if (!dateActivities[date]) {
                        dateActivities[date] = [];
                    }
                    dateActivities[date].push({
                        ActionType: item.ActionType,
                        EntityType: item.EntityType,
                        EntityName: item.EntityName // Include EntityName
                    });
                }
            });

            const dates = Object.keys(dateActivities);
            const values = dates.map(date => dateActivities[date].length);

            chartInstance.current?.setOption({
                title: { text: `Activity by Date - ${selectedUser}`, left: 'center' },
                xAxis: {
                    type: 'category',
                    data: dates,
                    axisLabel: { interval: 0, rotate: 15 }
                },
                yAxis: { type: 'value' },
                series: [{
                    type: 'bar',
                    data: values,
                    label: {
                        show: true,
                        position: 'top'
                    },
                }],
                tooltip: {
                    trigger: 'axis',
                    enterable: true,
                    extraCssText: 'max-height: 200px; overflow-y: auto;',
                    formatter: function (params: any) {
                        const date = params[0].axisValue;
                        const activities = dateActivities[date];
                        let tooltipContent = `<strong><div>Date: ${date}</div></strong>`;
                        activities.forEach((activity: any) => {
                            tooltipContent += `
                                <div style="margin-top: 5px;">
                                    <strong>Action Type:</strong> ${activity.ActionType}<br/>
                                    <strong>Entity Name:</strong> ${activity.EntityName}<br/><hr/>
                                </div>
                            `;
                        });
                        return tooltipContent;
                    }
                },
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

            chartInstance.current?.off('click');
        };

        if (level === 0) drawLevel0();
        else if (level === 1) drawLevel1();
        else if (level === 2) drawLevel2();
        const resizeObserver = new ResizeObserver(() => {
            chartInstance.current?.resize();
        });
        resizeObserver.observe(chartRef.current);

        return () => resizeObserver.disconnect();
    }, [filterData, level, selectedSite, selectedUser]);

    React.useEffect(() => {
        const filteredData = props.ChartData.filter(
            (item: any) => item.EntityType === UserActionEntityTypeEnum.Site && item.SiteName !== ""
        );
        setfilterData(filteredData);
    }, [props.ChartData]);

    return (
        <>
            {!!filterData && filterData.length > 0 ?
                <div>
                    <div className="ims-Site-chart-card mt-3">
                        <div className="chart-header d-flex justify-content-between align-items-center dflex">
                            <div>
                                <Label className="chart-label">User Activity on Sites Report</Label>
                                {/* <div className="chart-number chart-green">{total}</div> */}
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
                        {((props.isChartOnly === undefined || props.isChartOnly === false) && filterData.length > 0) && (
                            <div className="mt-6 bg-white p-4 rounded shadow mt-5">
                                <div className="chart-div-table">
                                    <div className="chart-div-header">
                                        <div className="chart-div-cell">Site Name</div>
                                        <div className="chart-div-cell">Total Actions</div>
                                        <div className="chart-div-cell">Unique Users</div>
                                        <div className="chart-div-cell">Last Activity Date</div>
                                    </div>

                                    {Object.entries(groupedBySite).map(([site, info]: any, i) => {
                                        const actionsByDate = info.items.reduce((acc: any, item: any) => {
                                            const date = item.Created.split(' ')[0];
                                            if (!acc[date]) acc[date] = [];
                                            acc[date].push(item);
                                            return acc;
                                        }, {});

                                        return (
                                            <div key={site}>
                                                <div
                                                    className={`chart-div-row ${i % 2 !== 0 ? 'white-bg' : ''}`}
                                                    onClick={() =>
                                                        setExpandedSites((prev) => ({
                                                            ...prev,
                                                            [site]: !prev[site],
                                                        }))
                                                    }
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <div className="chart-div-cell">
                                                        <div className="dflex">
                                                            <FontAwesomeIcon
                                                                className="dticon me-2"
                                                                icon={expandedSites[site] ? 'caret-down' : 'caret-right'}
                                                            />
                                                            {site}
                                                        </div>
                                                    </div>

                                                    <div className="chart-div-cell">{info.items.length}</div>
                                                    <div className="chart-div-cell">{info.users.size}</div>
                                                    <div className="chart-div-cell">
                                                        {info.lastDate.toLocaleString('en-AU', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            hour12: true,
                                                        })}
                                                    </div>
                                                </div>

                                                {expandedSites[site] && (
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
                                                            const dateKey = `${site}-${date}`;

                                                            return (
                                                                <div key={dateKey}>
                                                                    <div
                                                                        className="chart-div-row white-bg"
                                                                        onClick={() => toggleDate(site, date)}
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
                                                                                <div className="header-cell-drag2">Action Type</div>
                                                                                <div className="header-cell-drag2">User Name</div>
                                                                                <div className="header-cell-drag2">Timestamp</div>
                                                                            </div>

                                                                            {items.map((item: any, idx: number) => (
                                                                                <div
                                                                                    key={`${item.ID}-${idx}`}
                                                                                    className={`chart-div-row ${idx % 2 !== 0 ? 'white-bg' : ''}`}
                                                                                >
                                                                                    <div className="chart-div-cell">{item.EntityName}</div>
                                                                                    <div className="chart-div-cell">{item.Details}</div>
                                                                                    <div className="chart-div-cell">{item.ActionType}</div>
                                                                                    <div className="chart-div-cell">{item.UserName}</div>
                                                                                    <div className="chart-div-cell">
                                                                                        {new Date(item.OrgCreated).toLocaleString('en-AU', {
                                                                                            day: '2-digit',
                                                                                            month: '2-digit',
                                                                                            year: 'numeric',
                                                                                            hour: '2-digit',
                                                                                            minute: '2-digit',
                                                                                            hour12: true,
                                                                                        })}
                                                                                    </div>
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

                    </div> </div>
                : <div>
                    <div className="ims-Site-chart-card mt-3">
                        <div className="chart-header d-flex justify-content-between align-items-center dflex">
                            <div>
                                <Label className="chart-label">User Activity on Sites Report</Label>
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


