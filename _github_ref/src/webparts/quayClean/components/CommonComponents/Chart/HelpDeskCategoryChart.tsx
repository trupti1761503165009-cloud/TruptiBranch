import React from 'react';
import * as echarts from 'echarts';
import { Dropdown, Label, Toggle } from '@fluentui/react';
import moment from 'moment';
import { DateFormat } from '../../../../../Common/Constants/CommonConstants';
import { PrimaryButton } from 'office-ui-fabric-react';
import { ReactDropdown } from '../ReactDropdown';
import { IReactDropOptionProps } from '../reactSelect/IReactDropOptionProps';
import NoRecordFound from '../NoRecordFound';
import { fontStyle } from 'html2canvas/dist/types/css/property-descriptors/font-style';
import { fontWeight } from 'html2canvas/dist/types/css/property-descriptors/font-weight';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface IHelpDeskCategoryChartProps {
    items: any[];
    columnName: string;
    title: string;
    isPieView: boolean;
    isGenerateOther?: boolean;
    viewFelid?: any[];
    onClickSendEmail(id: string): void;
    id: string;
    isPrint: boolean;
}

export interface IHelpDeskCategoryChartState {
    chartOption: string[];
}

export const HelpDeskCategoryChart = (props: IHelpDeskCategoryChartProps) => {
    const chartRef = React.useRef(null);
    const [chartData, setChartData] = React.useState({ legendData: [], seriesData: [] });
    const chartRefBar = React.useRef(null);
    const [chartDataBar, setChartDataBar] = React.useState(props.items);
    const [isPieChart, setIsPieChart] = React.useState<boolean>(props.isPieView);
    const [keyUpdate, setKeyUpdate] = React.useState<number>(Math.random())
    const [otherReportOptions, setOtherReportOptions] = React.useState<any[]>([]);
    const [selectedReport, setSelectedReport] = React.useState<any>()

    const genData = (list: any[]) => {
        const legendData: string[] = [];
        const seriesData: { name: string, value: number }[] = [];

        list.forEach((value: any) => {
            legendData.push(value.field);
            seriesData.push({
                name: value.field,
                value: value.count,
            });
        });

        return { legendData, seriesData };
    };
    const countUniqueStatus = (items: any[], field: any) => {
        const statusCount: any = {};
        items.forEach((value) => {
            const status = value[field];
            if (statusCount[status]) {
                statusCount[status]++;
            } else {
                statusCount[status] = 1;
            }
        });

        const result = Object.keys(statusCount).map(status => ({
            field: status,
            count: statusCount[status]
        }));

        return result;
    };

    const countUniqueStatusBar = (items: any[], field: any) => {
        const statusCount: any = {};

        // Count occurrences of each status
        items.forEach((value) => {
            const status = value[field];
            if (statusCount[status]) {
                statusCount[status]++;
            } else {
                statusCount[status] = 1;
            }
        });

        // Prepare the result with 'field' and 'count' as arrays
        const result = {
            field: Object.keys(statusCount),
            count: Object.values(statusCount)
        };

        return result;
    };

    const onChangeToggle = (e: any) => {
        setKeyUpdate(Math.random())
        setIsPieChart(!isPieChart);
    }

    React.useEffect(() => {
        if (!!props.items && props.items.length > 0) {
            let chartItems = countUniqueStatus(props.items, !!selectedReport ? selectedReport.value : props.columnName);
            const data: any = genData(chartItems);
            setChartData(data);
        }
    }, [props.items, selectedReport?.value]);

    const onChangeReport = (e: any, value: any) => {
        if (value) {
            setSelectedReport(value)

        } else {
            setSelectedReport("")
        }
    }

    React.useEffect(() => {
        if (chartRef.current) {
            const chartInstance: any = echarts.init(chartRef.current);

            const option = {
                title: {
                    // text: props.isPrint ? "" : (!!selectedReport ? `Help Desk ${selectedReport.label}` : props.title),
                    subtext: '',
                    left: 'center',
                },
                tooltip: {
                    trigger: 'item',
                    formatter: '{a} <br/>{b} : {c} ({d}%)',
                },
                legend: {
                    type: 'scroll',
                    orient: 'vertical',
                    right: 10,
                    top: 20,
                    bottom: 10,
                    data: chartData.legendData,
                },
                series: [
                    {
                        name: 'Help Desk Category',
                        type: 'pie',
                        radius: '85%',
                        center: ['40%', '50%'],
                        data: chartData.seriesData,
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0, 0, 0, 0.5)',
                            },
                        },
                        label: {
                            formatter: '{d}%',
                        },
                        itemStyle: {
                            borderColor: '#fff',
                            borderWidth: 1,
                        },
                    },
                ],
                toolbox: {
                    feature: {
                        saveAsImage: {
                            title: 'Save as Image',
                            type: 'png',
                        },
                        dataView: {
                            title: 'View Data',
                            readOnly: true,
                        },
                        restore: {
                            title: 'Restore',
                        },
                    },
                    show: true, // Ensure toolbox is visible
                },
            };

            chartInstance.setOption(option);

            window.addEventListener('resize', chartInstance.resize);
            // setKeyUpdate(Math.random());
            return () => {
                window.removeEventListener('resize', chartInstance.resize);
                chartInstance.dispose();
            };
        }

    }, [chartData, isPieChart, props.isPrint]);


    React.useEffect(() => {

        if (chartRefBar.current && props.items.length > 0) {
            const myChart = echarts.init(chartRefBar.current);

            // Dynamic data preparation from InspectionData
            const data = countUniqueStatusBar(props.items, !!selectedReport ? selectedReport.value : props.columnName);

            let area = data.field;
            let counts = data.count;
            const totalSites = area.length;
            const visibleBars = 16;
            const endValue = totalSites > visibleBars ? (visibleBars / totalSites) * 100 : 100;
            const option = {
                title: {
                    // text: props.isPrint ? "" : (!!selectedReport ? `Help Desk ${selectedReport.label}` : props.title),
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow'
                    }
                },
                xAxis: {
                    type: 'category', // X-axis should be category for dates
                    boundaryGap: true,
                    data: area, // Use dynamic dates for x-axis labels
                    axisLabel: { interval: 0, rotate: props.isPrint ? 20 : 15 }
                },
                yAxis: {
                    type: 'value', // Value for counts
                },
                series: [
                    {
                        data: counts, // Use dynamic counts for bar heights
                        type: 'bar', // Change to 'bar' for bar chart
                        itemStyle: {
                            color: '#7FC57F' // Bar color
                        },
                        emphasis: {
                            itemStyle: {
                                color: '#004d00' // Highlight color on hover
                            }
                        },
                        label: {
                            show: true,
                            position: 'top', // Show count above each bar
                            formatter: '{c}'
                        }
                    }
                ],
                toolbox: {
                    feature: {
                        saveAsImage: {
                            title: 'Save as Image',
                            type: 'png'
                        },
                        dataView: {
                            title: 'View Data',
                            readOnly: true
                        },
                        magicType: {
                            type: ['line', 'bar'], // Allow switching between line and bar
                            title: {
                                line: 'Switch to Line Chart',
                                bar: 'Switch to Bar Chart'
                            }
                        },
                        restore: {
                            title: 'Restore'
                        },
                    },
                    show: true // Ensure toolbox is visible
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
                ]
            };

            myChart.setOption(option);

            // Resize chart on window resize
            const handleResize = () => {
                myChart.resize();
            };

            window.addEventListener('resize', handleResize);
            return () => {
                window.removeEventListener('resize', handleResize);
                myChart.dispose();
            };
        }

    }, [chartDataBar, props.items, isPieChart, selectedReport?.value, props.isPrint]);

    React.useEffect(() => {
        if (props.isGenerateOther) {
            const FieldsArrayCurrent = props.viewFelid || []; // Ensure it's an array
            const validationMapping: { [key: string]: string } = {
                "Help Desk Description": "Title",
                "Caller": "Caller",
                "Call Type": "CallType",
                "Starting Date": "StartingDateCard",
                "Location": "Location",
                "Sub Location": "SubLocation",
                "Area": "Area",
                "Category": "HDCategory",
                "Reported Help Desk": "ReportHelpDesk",
                "Status": "HDStatus",
                "Event Name": "EventName",
                "Priority": "QCPriority",
                "Help Desk Name": "HelpDeskName"
            };

            let options: IReactDropOptionProps[] = []
            if (FieldsArrayCurrent.length > 0) {
                options = FieldsArrayCurrent.map(i => ({ value: validationMapping[i], label: i, key: validationMapping[i], text: i })).filter((i) => i.value)
            } else {
                options = Object.entries(validationMapping).map(([key, value]) => ({
                    label: key,
                    value: value,
                    key: value,
                    text: key
                }));
            }
            let object = options.find((i) => i.value == props.columnName);
            if (!!object && object.value)
                onChangeReport(null, object)

            setOtherReportOptions(options)

        }

    }, [props.viewFelid])

    return (
        <div className='chartHp' id={props.id}
            style={{ width: props.isPrint ? "1024px" : "" }}
        >
            <div className="chartHp-card mt-3" >
                {props.items.length > 0 ? <div>
                    {!props.isPrint && <div className="dflex" style={{ justifyContent: "space-between" }}>
                        <div style={{ width: "100%" }}>
                            <div className="" style={{ justifyContent: "center", display: "flex" }}>
                                <Label style={{ fontSize: "16px" }}>{!!selectedReport ? `Help Desk ${selectedReport.label}` : props.title}</Label>
                            </div>
                        </div>
                        <div className="dflex">
                            <div>
                                {props.isGenerateOther ? <>
                                    <Dropdown options={otherReportOptions || []}
                                        selectedKey={!!selectedReport ? selectedReport.key : props.columnName}
                                        label='Show chart by' style={{ width: "175px" }} onChange={onChangeReport} />
                                </> : <>&nbsp;</>}
                            </div>
                            {/* <PrimaryButton text={"Send Email"} style={{ marginTop: "27px", marginLeft: "5px", width: "140px" }} className='btn btn-primary' onClick={() => props.onClickSendEmail(props.id)} /> */}
                            <PrimaryButton style={{ marginTop: "27px", marginLeft: "10px", width: "100px" }} className="btn btn-primary " onClick={() => props.onClickSendEmail(props.id)}>
                                <FontAwesomeIcon icon="paper-plane" className="clsbtnat" /><div>Email</div>
                            </PrimaryButton>
                            <PrimaryButton text={isPieChart ? "Show Bar Chart" : "Show Pie Chart"} onClick={onChangeToggle} className='btn btn-primary' style={{ marginTop: "27px", marginLeft: "10px", width: "140px" }} />
                        </div>
                    </div>}
                    <div key={keyUpdate}>
                        {props.isPrint && <div className="chart-header" style={{ justifyContent: "center", display: "flex" }}>
                            <Label className="chart-label">{!!selectedReport ? `Help Desk ${selectedReport.label}` : props.title}</Label>
                        </div>}
                        {isPieChart ? <div className="">
                            <div ref={chartRef} style={{ width: '100%', height: '500px' }} />
                        </div> :

                            <div className="" style={{ paddingBottom: "10px" }}>

                                <div ref={chartRefBar} style={{ width: '100%', height: '450px' }} />
                            </div>
                        }
                    </div>
                </div> : <NoRecordFound />}

            </div>
        </div>
    );
};
