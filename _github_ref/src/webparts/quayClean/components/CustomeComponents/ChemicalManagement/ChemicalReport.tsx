/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { Label, PrimaryButton } from '@fluentui/react';
import ChemicalReportList from './ChemicalReportList';
import { UserActionEntityTypeEnum } from '../../../../../Common/Enum/ComponentNameEnum';
import NoRecordFound from '../../CommonComponents/NoRecordFound';

interface ActivityItem {
  EntityType: string;
  SiteName: string;
  UserName: string;
  EntityName: string;
  ActionType: string;
  Modified: string;
}

interface Props {
  data: ActivityItem[];
  isChartOnly?: boolean;
}

const ChemicalReport: React.FC<Props> = ({ data, isChartOnly }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null);

  const [level, setLevel] = useState(1);
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [selectedEntityName, setSelectedEntityName] = useState<string | null>(null);
  const [selectedActionType, setSelectedActionType] = useState<string | null>(null);

  const filteredData = data.filter(
    item => item.EntityType === UserActionEntityTypeEnum.Chemical || item.EntityType === UserActionEntityTypeEnum.AssociateChemical
  );

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
    const counts = siteNames.map(site => siteMap[site].length);
    const totalSites = siteNames.length;
    const visibleBars = 16;
    const endValue = totalSites > visibleBars ? (visibleBars / totalSites) * 100 : 100;
    chartInstance.current?.off('click');
    chartInstance.current?.setOption({
      title: { text: 'Chemical Activity by Site Name', left: 'center' },
      xAxis: { type: 'category', data: siteNames, axisLabel: { rotate: 30 } },
      yAxis: { type: 'value' },
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
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const site = params[0].name;
          const actions = siteMap[site];
          const actionCounts = actions.reduce((acc: any, item: any) => {
            acc[item.ActionType] = (acc[item.ActionType] || 0) + 1;
            return acc;
          }, {});
          return `<strong>${site}</strong><br/>` +
            Object.entries(actionCounts)
              .map(([k, v]) => `${k}: ${v}`)
              .join('<br/>');
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
    });

    chartInstance.current?.on('click', params => {
      setSelectedSite(params.name);
      drawLevel2(params.name);
    });
  };

  const drawLevel2 = (siteName: string) => {
    setLevel(2);
    const filtered = filteredData.filter(d => d.SiteName === siteName);
    const entityMap: Record<string, ActivityItem[]> = {};
    filtered.forEach(item => {
      const key = item.EntityName || 'Unknown';
      if (!entityMap[key]) entityMap[key] = [];
      entityMap[key].push(item);
    });

    const entities = Object.keys(entityMap);
    const counts = entities.map(e => entityMap[e].length);

    chartInstance.current?.off('click');
    chartInstance.current?.setOption({
      title: { text: `Chemical Entities in ${siteName}`, left: 'center' },
      xAxis: { type: 'category', data: entities, axisLabel: { rotate: 30 } },
      yAxis: { type: 'value' },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {},
          dataView: { readOnly: true },
          magicType: { type: ['bar', 'line'] },
          restore: {},
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const entity = params[0].name;
          return `<strong>${entity}</strong><br/>Total: ${entityMap[entity]?.length}`;
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
    });

    chartInstance.current?.on('click', params => {
      setSelectedEntityName(params.name);
      drawLevel3(siteName, params.name);
    });
  };

  const drawLevel3 = (siteName: string, entityName: string) => {
    setLevel(3);
    const filtered = filteredData.filter(d => d.SiteName === siteName && d.EntityName === entityName);
    const actionMap: Record<string, ActivityItem[]> = {};
    filtered.forEach(item => {
      if (!actionMap[item.ActionType]) actionMap[item.ActionType] = [];
      actionMap[item.ActionType].push(item);
    });

    const actions = Object.keys(actionMap);
    const counts = actions.map(a => actionMap[a].length);

    chartInstance.current?.off('click');
    chartInstance.current?.setOption({
      title: { text: `Chemical Actions on ${entityName} in ${siteName}`, left: 'center' },
      xAxis: { type: 'category', data: actions, axisLabel: { rotate: 30 } },
      yAxis: { type: 'value' },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {},
          dataView: { readOnly: true },
          magicType: { type: ['bar', 'line'] },
          restore: {},
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const action = params[0].name;
          return `<strong>${action}</strong><br/>Total: ${actionMap[action].length}`;
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
    });

    chartInstance.current?.on('click', params => {
      setSelectedActionType(params.name);
      drawLevel4(siteName, entityName, params.name);
    });
  };

  const drawLevel4 = (siteName: string, entityName: string, actionType: string) => {
    setLevel(4);
    const filtered = filteredData.filter(
      d => d.SiteName === siteName && d.EntityName === entityName && d.ActionType === actionType
    );
    const userMap: Record<string, ActivityItem[]> = {};
    filtered.forEach(item => {
      const user = item.UserName || 'Unknown';
      if (!userMap[user]) userMap[user] = [];
      userMap[user].push(item);
    });

    const users = Object.keys(userMap);
    const counts = users.map(user => userMap[user].length);

    chartInstance.current?.off('click');
    chartInstance.current?.setOption({
      title: { text: `Chemical by Users doing ${actionType} on ${entityName}`, left: 'center' },
      xAxis: { type: 'category', data: users, axisLabel: { rotate: 30 } },
      yAxis: { type: 'value' },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {},
          dataView: { readOnly: true },
          magicType: { type: ['bar', 'line'] },
          restore: {},
        },
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const user = params[0].name;
          return `<strong>${user}</strong><br/>Total: ${userMap[user]?.length}`;
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
    });
  };

  return (
    <>
      {!!filteredData && filteredData.length > 0 ? <div>
        <div className="ims-Site-chart-card mt-3">
          <div className="chart-header d-flex justify-content-between align-items-center dflex">
            <div>
              <Label className="chart-label">Chemical Activity Log Report</Label>
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
        {((isChartOnly == undefined || isChartOnly == false) && (!!filteredData && filteredData.length > 0)) && (
          <ChemicalReportList filteredData={filteredData} />
        )}
      </div>
        : <div>

          <div className="ims-Site-chart-card mt-3">
            <div className="chart-header d-flex justify-content-between align-items-center dflex">
              <div>
                <Label className="chart-label">Chemical Activity Log Report</Label>
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

export default ChemicalReport;
