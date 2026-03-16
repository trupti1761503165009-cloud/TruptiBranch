
import * as React from "react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDataProvider } from "../../../../DataProvider/Interface/IDataProvider";
import { IQuayCleanState } from "../QuayClean";
import CountUp from 'react-countup';
export interface INewsProps {
    provider: IDataProvider;
    context: WebPartContext;
    loginUserRoleDetails: any;
    manageComponentView(componentProp: IQuayCleanState): any;
}

export const News = (props: INewsProps) => {

    // Do something with the retrieved choices      }
    return <>
        <div className="formGroup">
            <div className="boxCard">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <CountUp
                                start={0}
                                end={35}
                                duration={3}
                            />
                            {/* <input type="file" accept=".xlsx" onChange={handleFileUpload} /> */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>;
};
// import * as React from 'react';
// import * as echarts from 'echarts';
// import { useEffect, useRef } from 'react';

// interface ACTBGTCalanderBarProps {
//     data: any[];
// }

// const monthLabels = [
//     '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
//     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
// ];

// const ACTBGTCalanderBar: React.FC<ACTBGTCalanderBarProps> = ({ data }) => {
//     const chartRef = useRef<HTMLDivElement>(null);
//     const [currentState, setCurrentState] = React.useState<string | null>(null);
//     const isStateLevel = currentState === null;
//     useEffect(() => {
//         if (!data || data.length === 0 || !chartRef.current) return;
//         const chartInstance = echarts.init(chartRef.current);

//         const baseYear = data[0].Year;

//         // Filter data to include only entries from the first year's data
//         const filtered = data.filter(d => d.Year === baseYear);

//         // Get unique months in the filtered data
//         const monthsPresent = Array.from(new Set(filtered.map(d => d.Month))).sort((a, b) => a - b);

//         const actual = monthsPresent.map(month =>
//             filtered.filter(d => d.Month === month)
//                 .reduce((sum, d) => sum + d.ACTMonthHours, 0)
//         );

//         const budget = monthsPresent.map(month =>
//             filtered.filter(d => d.Month === month)
//                 .reduce((sum, d) => sum + d.BGTMonthHours, 0)
//         );

//         const labels = monthsPresent.map(month => monthLabels[month]);

//         const option: echarts.EChartsOption = {
//             title: {
//                 text: ''
//             },
//             tooltip: {
//                 trigger: 'axis',
//                 formatter: (params: any) => {
//                     let tooltip = `${params[0].axisValue}<br/>`;
//                     params.forEach((item: any) => {
//                         tooltip += `${item.marker} ${item.seriesName}: ${parseFloat(item.data).toFixed(2)} h<br/>`;
//                     });
//                     return tooltip;
//                 },
//             },
//             toolbox: {
//                 show: true,
//                 orient: 'horizontal',
//                 left: 'right',
//                 feature: {
//                     saveAsImage: {
//                         title: 'Download',
//                         type: 'png',
//                         name: 'Chart',
//                         pixelRatio: 2
//                     },
//                     dataView: {
//                         show: true,
//                         readOnly: true,
//                         title: 'Data View',
//                         lang: ['Data View', 'Close', 'Refresh']
//                     },
//                     magicType: {
//                         type: ['line', 'bar'],
//                         title: {
//                             line: 'Switch to Line Chart',
//                             bar: 'Switch to Bar Chart'
//                         }
//                     },
//                     restore: {
//                         title: 'Restore'
//                     }
//                     // Optionally add:
//                     // dataZoom: {
//                     //     title: {
//                     //         zoom: 'Zoom',
//                     //         back: 'Reset Zoom'
//                     //     }
//                     // }
//                 }
//             },
//             legend: {
//                 data: ['Actual Hours', 'Budget Hours']
//             },
//             xAxis: {
//                 type: 'category',
//                 data: labels
//             },
//             yAxis: {
//                 type: 'value'
//             },
//             series: [
//                 {
//                     name: 'Actual Hours',
//                     type: 'bar',
//                     data: actual,
//                     itemStyle: {
//                         color: '#5470C6'
//                     },
//                     label: {
//                         show: true,
//                         rotate: 60,
//                         align: 'left',
//                         verticalAlign: 'middle',
//                         position: 'insideBottom',
//                         formatter: (params: any) =>
//                             `${parseFloat(params.value)?.toFixed(2)?.replace(/\.00$/, '')} h`
//                     }
//                 },
//                 {
//                     name: 'Budget Hours',
//                     type: 'bar',
//                     data: budget,
//                     itemStyle: {
//                         color: '#91CC75'
//                     },
//                     label: {
//                         show: true,
//                         rotate: 60,
//                         align: 'left',
//                         verticalAlign: 'middle',
//                         position: 'insideBottom',
//                         formatter: (params: any) =>
//                             `${parseFloat(params.value)?.toFixed(2)?.replace(/\.00$/, '')} h`
//                     }
//                 }
//             ]


//         };

//         chartInstance.setOption(option);
//         chartInstance.off('click');
//         chartInstance.on('click', (params: any) => {
//             if (isStateLevel) {
//                 setCurrentState(params.name);
//             } else {
//                 setCurrentState(null); // Go back
//             }
//         });

//         return () => {
//             chartInstance.dispose();
//         };
//     }, [data]);

//     return <div ref={chartRef} style={{ width: '100%', height: '325px' }} />;
// };

// export default ACTBGTCalanderBar;