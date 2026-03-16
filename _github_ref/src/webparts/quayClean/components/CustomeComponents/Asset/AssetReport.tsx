// import * as React from "react";
// import * as echarts from 'echarts';
// import { Label, PrimaryButton, Toggle } from "@fluentui/react";

// export interface IAssociateChemicalProps {
//     ChartData: any;
// }
// interface ChartDataItem {
//     ActionType: string;
//     EntityType: string;
// }

// interface Props {
//     chartData: ChartDataItem[];
//     setTotal: (value: number) => void; // Optional prop to show total count
// }

// export const AssetReport = (props: IAssociateChemicalProps) => {
//     const [filterData, setfilterData] = React.useState<any[]>([]);
//     const [chartData, setchartData] = React.useState<any>(props.ChartData);

//     const [viewBy, setViewBy] = React.useState<'date' | 'user' | 'site'>('date');
//     const chartRef = React.useRef<HTMLDivElement>(null);
//     const chartInstance = React.useRef<echarts.EChartsType | null>(null);
//     const toggleOptions = ['date', 'user', 'site'] as const;

//     const formatDate = (input: string) => {
//         const parts = input.split(' ')[0].split('-');
//         return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : '';
//     };

//     React.useEffect(() => {
//         if (!chartRef.current) return;

//         if (!chartInstance.current) {
//             chartInstance.current = echarts.init(chartRef.current);
//         }

//         const groupedMap: Record<string, Record<string, number>> = {};
//         const actionTypesSet = new Set<string>();
//         const xLabelsSet = new Set<string>();

//         filterData.forEach(item => {
//             const action = item.ActionType;
//             let key = '';

//             if (viewBy === 'date') key = formatDate(item.Modified);
//             else if (viewBy === 'user') key = item.UserName;
//             else if (viewBy === 'site') key = item.SiteName;

//             if (!key) return;

//             if (!groupedMap[key]) groupedMap[key] = {};
//             groupedMap[key][action] = (groupedMap[key][action] || 0) + 1;

//             actionTypesSet.add(action);
//             xLabelsSet.add(key);
//         });

//         const sortedLabels = Array.from(xLabelsSet).sort();
//         const actionTypes = Array.from(actionTypesSet);

//         const series = actionTypes.map(action => ({
//             name: action,
//             type: 'line',
//             stack: 'total',
//             areaStyle: {},
//             smooth: true,
//             emphasis: { focus: 'series' },
//             data: sortedLabels.map(label => groupedMap[label]?.[action] || 0)
//         }));

//         const option: echarts.EChartsOption = {
//             title: {
//                 text: `Actions Grouped by ${viewBy === 'date' ? 'Date' : viewBy === 'user' ? 'User' : 'Site'}`,
//                 left: 'center'
//             },
//             tooltip: { trigger: 'axis' },
//             legend: { bottom: 0 },
//             grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
//             xAxis: {
//                 type: 'category',
//                 boundaryGap: false,
//                 data: sortedLabels
//             },
//             yAxis: {
//                 type: 'value'
//             },
//             series
//         };

//         chartInstance.current.setOption(option);

//         const resizeObserver = new ResizeObserver(() => {
//             chartInstance.current?.resize();
//         });
//         resizeObserver.observe(chartRef.current);

//         return () => resizeObserver.disconnect();
//     }, [filterData, viewBy]);

//     React.useEffect(() => {
//         const filteredData = chartData.filter(
//             (item: any) => item.EntityType === "Equipment/Asset"
//         );
//         console.log("Equipment/Asset", filteredData);
//         setfilterData(filteredData);
//     }, [chartData]);

//     return (
//         <>
//             <div className="bg-white rounded-xl shadow p-4">
//                 <h2 className="text-xl font-semibold mb-4">User Activity On Sites</h2>
//                 {/* <div ref={chartRef} style={{ width: '100%', height: '500px' }} /> */}
//             </div>
//         </>
//     );
// };


