/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Label, PrimaryButton } from '@fluentui/react';
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

const IMSReportSiteWise: React.FC<Props> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);

  const [level, setLevel] = useState(1);
  const [selectedEntityType, setSelectedEntityType] = useState<string | null>(null);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [filterData, setFilterData] = React.useState<any[]>([]);
  React.useEffect(() => {
    const filteredData = data.filter((item: any) =>
      [
        'Toolbox Talk',
        'Toolbox Incident',
        'Skill Matrix',
        'Workplace Inspection',
        'Corrective Action Report',
        'WHS Committee Inspection',
        'WHS Committee Meeting',
      ].includes(item.EntityType)
    );
    setFilterData(filteredData);
  }, [data]);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      drawLevel1();
    }

    return () => {
      chartInstance.current?.dispose();
    };
  }, [filterData]);

  const drawLevel1 = () => {
    setLevel(1);
    const entityMap: Record<string, ActivityItem[]> = {};

    filterData.forEach(item => {
      if (!entityMap[item.EntityType]) {
        entityMap[item.EntityType] = [];
      }
      entityMap[item.EntityType].push(item);
    });

    const entityTypes = Object.keys(entityMap);
    const counts = entityTypes.map(key => entityMap[key].length);
    const totalSites = entityTypes.length;
    const visibleBars = 16;
    const endValue = totalSites > visibleBars ? (visibleBars / totalSites) * 100 : 100;
    chartInstance.current?.off('click');
    chartInstance.current?.setOption({
      title: {
        text: 'Quaysafe Activity by EntityType',
        left: 'center'
      },
      xAxis: {
        type: 'category',
        data: entityTypes,
        axisLabel: {
          interval: 0,
          rotate: 0
        }
      },
      yAxis: {
        type: 'value'
      },
      tooltip: {
        trigger: 'axis',
        enterable: true,
        extraCssText: 'max-height: 400px; overflow-y: auto;',
        formatter: (params: any) => {
          const entityType = params[0]?.name;
          const actions = entityMap[entityType];

          if (!actions) return '';

          // Count by ActionType
          const actionCounts = actions.reduce((acc: any, item: any) => {
            const type = item.ActionType;
            if (type) {
              acc[type] = (acc[type] || 0) + 1;
            }
            return acc;
          }, {});

          const actionCountLines = Object.entries(actionCounts)
            .map(([type, count]) => `<strong>${type}</strong>: ${count}`)
            .join('<br/>');

          const userDetailLines = actions
            .map(item => `<strong>${item.UserName} (${item.ActionType})</strong><br/>${item.EntityName} at ${item.Created}`)
            .join('<br/><hr/>');

          return `
            <div style="max-width: 300px;">
              <div><strong>${entityType}</strong></div>
              <div style="margin-top: 5px;">${actionCountLines}</div>
              <div style="margin-top: 10px;"><u><strong>User Actions</strong></u></div>
              <div>${userDetailLines}</div>
            </div>
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
      setSelectedEntityType(params.name);
      drawLevel2(params.name);
    });
  };

  const drawLevel2 = (entityType: string) => {
    setLevel(2);
    const filtered = filterData.filter(d => d.EntityType === entityType);

    const siteMap: Record<string, ActivityItem[]> = {};
    filtered.forEach(item => {
      if (!siteMap[item.SiteName]) {
        siteMap[item.SiteName] = [];
      }
      siteMap[item.SiteName].push(item);
    });

    const siteNames = Object.keys(siteMap);
    const counts = siteNames.map(name => siteMap[name].length);
    const totalSites = siteNames.length;
    const visibleBars = 16;
    const endValue = totalSites > visibleBars ? (visibleBars / totalSites) * 100 : 100;
    chartInstance.current?.off('click');
    chartInstance.current?.setOption({
      title: {
        text: `Quaysafe by Sites under ${entityType}`,
        left: 'center'
      },
      xAxis: {
        type: 'category',
        data: siteNames,
        axisLabel: { interval: 0, rotate: 20 }

      },
      yAxis: {
        type: 'value'
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
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        enterable: true,
        confine: true,
        extraCssText: 'max-height: 400px; overflow-y: auto;',
        formatter: function (params: any) {
          const site = params[0]?.name;
          const activities = siteMap[site] || [];

          let tooltipContent = `<div><strong>Activity in ${site}:</strong></div>`;

          activities.forEach((activity: any) => {
            tooltipContent += `
              <div style="margin-bottom: 5px;">
                <strong>User:</strong> ${activity.UserName}<br/>
                <strong>Entity:</strong> ${activity.EntityName}<br/>
                <strong>Action:</strong> ${activity.ActionType}<br/>
                <strong>Time:</strong> ${activity.Created}
              </div>
              <hr/>
            `;
          });

          return `<div style="max-height: 180px; overflow-y: auto;">${tooltipContent}</div>`;
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
      setSelectedSite(params.name);
      drawLevel3(entityType, params.name);
    });
  };



  const drawLevel3 = (entityType: string, siteName: string) => {
    setLevel(3);
    const filtered = filterData.filter(
      d => d.EntityType === entityType && d.SiteName === siteName
    );

    const userMap: Record<string, ActivityItem[]> = {};
    filtered.forEach(item => {
      const user = item.UserName || 'Unknown';
      if (!userMap[user]) {
        userMap[user] = [];
      }
      userMap[user].push(item);
    });

    const usernames = Object.keys(userMap);
    const counts = usernames.map(user => userMap[user].length);

    chartInstance.current?.off('click');
    chartInstance.current?.setOption({
      title: {
        text: `Quaysafe by Users in ${siteName} (${entityType})`,
        left: 'center'
      },
      xAxis: {
        type: 'category',
        data: usernames,
        axisLabel: {
          interval: 0,
          rotate: 0
        }
      },
      yAxis: {
        type: 'value'
      },
      tooltip: {
        trigger: 'axis',
        enterable: true,
        extraCssText: 'max-height: 400px; overflow-y: auto;',
        formatter: function (params: any) {
          const user = params[0]?.name;
          const activities = userMap[user] || [];

          let tooltipContent = `<strong><div>User: ${user}</div></strong>`;
          activities.forEach((activity: any) => {
            tooltipContent += `
              <div style="margin-top: 5px;">
                <strong>Action Type:</strong> ${activity.ActionType}<br/>
                <strong>Entity Name:</strong> ${activity.EntityName}<br/>
                <strong>Time:</strong> ${activity.Created}<br/><hr/>
              </div>
            `;
          });

          return `<div style="max-height: 180px; overflow-y: auto;">${tooltipContent}</div>`;
        }
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
    });
  };


  return (
    <>
      {!!filterData && filterData.length > 0 ?
        <div>
          <div className="ims-Site-chart-card mt-3">
            <div className="chart-header d-flex justify-content-between align-items-center dflex">
              <div>
                <Label className="chart-label">Quaysafe Activity by Sites Report</Label>
                {/* <div className="chart-number chart-green">{total}</div> */}
              </div>
              {level > 1 && (<PrimaryButton
                text='Back'
                onClick={() => {
                  if (level === 3 && selectedEntityType) {
                    drawLevel2(selectedEntityType);
                  } else if (level === 2) {
                    drawLevel1();
                  }
                }}
                className='btn btn-primary'
                style={{ marginTop: "27px", marginLeft: "5px" }}
              />)}
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
                <Label className="chart-label">Quaysafe Activity by Sites Report</Label>
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

export default IMSReportSiteWise;
