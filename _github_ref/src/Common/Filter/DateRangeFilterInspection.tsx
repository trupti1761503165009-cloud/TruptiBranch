import { DatePicker, DayOfWeek, IDropdownOption } from "@fluentui/react";
import * as React from "react";
import { defaultValues } from "../Enum/ComponentNameEnum";
import { onFormatDate } from "../Util";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import moment from "moment";

interface IDaterangeFilterProps {
    fromDate: Date;
    toDate: Date;
    onFromDateChange: (filterDate: any, date?: Date | null) => void;
    onToDateChange: (filterDate: any, date?: Date | null) => void;
    onChangeRangeOption: (item: IDropdownOption) => void;
    reset?: boolean;
}
let filterStartDate: any = null;
let filterEndDate: any = null;

export const DateRangeFilterInspection: React.FunctionComponent<IDaterangeFilterProps> = (props: IDaterangeFilterProps): React.ReactElement => {

    const optionDate: any[] = [
        { value: 'Top 30 Records', key: "Top 30 Records", text: "Top 30 Records", label: "Top 30 Records" },
        { value: 'Today', key: 'Today', text: 'Today', label: 'Today' },
        { value: 'Yesterday', key: 'Yesterday', text: 'Yesterday', label: 'Yesterday' },
        { value: 'Last 7 Days', key: 'Last 7 Days', text: 'Last 7 Days', label: 'Last 7 Days' },
        { value: 'Last 30 Days', key: 'Last 30 Days', text: 'Last 30 Days', label: 'Last 30 Days' },
        { value: 'This Month', key: 'This Month', text: 'This Month', label: 'This Month ' },
        { value: 'Last Month', key: 'Last Month', text: 'Last Month', label: 'Last Month ' },
        { value: 'Last 90 Days', key: 'Last 90 Days', text: 'Last 90 Days', label: 'Last 90 Days' },
        { value: 'Year to Date', key: 'Year to Date', text: 'Year to Date', label: 'Year to Date' },
        { value: 'Custom Range', key: 'Custom Range', text: 'Custom Range', label: 'Custom Range ' },
    ];

    const [firstDayOfWeek,] = React.useState(DayOfWeek.Sunday);
    const [selectedOption, setSelectedOption] = React.useState<IDropdownOption>({ key: "Top 30 Records", text: "Top 30 Records" });
    const [fromDate, setFromDate] = React.useState<Date>();
    const [toDate, setToDate] = React.useState<Date>();
    const [minCustomDate, setMinCustomDate] = React.useState<any>();
    const [maxCustomDate, setMaxCustomDate] = React.useState<any>();
    const [minRangeDate, setMinRangeDate] = React.useState<any>();
    const [maxRangeDate, setMaxRangeDate] = React.useState<any>();
    let maxDate = new Date();

    const _onChangeFromDate = (date: Date | null) => {
        let filterStartDate: any = moment(date).format(defaultValues.FilterDateFormate);
        let filterDate: any = moment(date);
        props.onFromDateChange(filterStartDate, date);
        setFromDate(filterDate);
        if (toDate == null) {
            let maxFormatCustomDate = moment(filterDate).add(defaultValues.DateRangeDays, 'day');
            // setMaxCustomDate(maxFormatCustomDate);
            let currentDate = moment();
            if (maxFormatCustomDate > currentDate) {
                setMaxCustomDate(currentDate);
            } else {
                setMaxCustomDate(maxFormatCustomDate);
            }
            setMinRangeDate(filterDate._d);
        } else {

        }
    };

    const _onChangeToDate = (date: Date | null) => {
        let filterEndDate: any = moment(date).format(defaultValues.FilterDateFormate);
        let filterDate: any = moment(date);
        props.onToDateChange(filterEndDate, date);
        setToDate(filterDate);
        if (fromDate == null) {
            let minFormatCustomDate = moment(filterDate).subtract(defaultValues.DateRangeDays, 'day');
            setMinCustomDate(minFormatCustomDate);
            setMaxRangeDate(filterDate._d);
        }
    };

    const _getFilterDate = (selectedType: string): any => {

        if (selectedType == "Today") {
            filterStartDate = moment(new Date()).format(defaultValues.FilterDateFormate);
            filterEndDate = moment(new Date()).format(defaultValues.FilterDateFormate);
        }
        else if (selectedType == "Yesterday") {
            filterStartDate = moment(new Date()).subtract(1, 'day').startOf('day').format(defaultValues.FilterDateFormate);
            filterEndDate = moment(new Date()).subtract(1, 'day').endOf('day').format(defaultValues.FilterDateFormate);
        }
        else if (selectedType == "Last 7 Days") {
            filterStartDate = moment(new Date()).subtract(6, 'days').format(defaultValues.FilterDateFormate);
            filterEndDate = moment(new Date()).format(defaultValues.FilterDateFormate);
        }
        else if (selectedType == "Last 30 Days") {
            filterStartDate = moment(new Date()).subtract(29, 'days').format(defaultValues.FilterDateFormate);
            filterEndDate = moment(new Date()).format(defaultValues.FilterDateFormate);
        }
        else if (selectedType == "This Month") {
            filterStartDate = moment(new Date()).startOf('month').format(defaultValues.FilterDateFormate);
            filterEndDate = moment(new Date()).endOf('month').format(defaultValues.FilterDateFormate);
        }
        else if (selectedType == "Last Month") {
            filterStartDate = moment(new Date()).subtract(1, 'month').startOf('month').format(defaultValues.FilterDateFormate);
            filterEndDate = moment(new Date()).subtract(1, 'month').endOf('month').format(defaultValues.FilterDateFormate);
        }
        else if (selectedType == "Last 90 Days") {
            filterStartDate = moment(new Date()).subtract(89, 'days').format(defaultValues.FilterDateFormate);
            filterEndDate = moment(new Date()).format(defaultValues.FilterDateFormate);
        }
        else if (selectedType == "Year to Date") {
            filterStartDate = moment(new Date()).startOf('year').format(defaultValues.FilterDateFormate);
            filterEndDate = moment(new Date()).format(defaultValues.FilterDateFormate);
        }
        return { filterStartDate, filterEndDate };
    };

    React.useEffect(() => {
        if (props.reset) {
            const endDate = moment().format('YYYY-MM-DD'); // Today's date
            const startDate = moment().subtract(29, 'days').format('YYYY-MM-DD'); // 30 days ago

            setSelectedOption({ key: "Top 30 Records", text: "Top 30 Records" });
            // props.onFromDateChange(startDate);
            // props.onToDateChange(endDate);
            // props.onChangeRangeOption("Last 30 Days");
        }
    }, [props.reset]);

    const _onChangeRangeOption = (option: any, actionMeta: ActionMeta<any>): void => {
        if (option?.label == "Top 30 Records") {
            setSelectedOption(option);
            props.onChangeRangeOption(option);
        } else {
            setSelectedOption(option);
            if (option.text != "Custom Range") {
                let filterDates = _getFilterDate(option.text);
                props.onFromDateChange(filterDates.filterStartDate);
                props.onToDateChange(filterDates.filterEndDate);
            }
            props.onChangeRangeOption(option);
        }

    };

    return <>
        <div className="">
            <ReactDropdown
                options={optionDate} isMultiSelect={false}
                placeholder="Date"
                defaultOption={selectedOption.text}
                onChange={_onChangeRangeOption}
            />
        </div>
        {selectedOption.key == "Custom Range" &&
            <React.Fragment>
                <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg2 ddmt4 mt-1">
                    <DatePicker
                        firstDayOfWeek={firstDayOfWeek}
                        placeholder="Select From Date"
                        ariaLabel="Select a From date"
                        value={props.fromDate}
                        formatDate={onFormatDate}
                        onSelectDate={_onChangeFromDate}
                        minDate={!!minCustomDate ? minCustomDate._d : null}
                        maxDate={!!maxCustomDate ? maxCustomDate._d : !!maxRangeDate ? maxRangeDate : maxDate}
                    />
                </div>

                <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg2">
                    <DatePicker
                        firstDayOfWeek={firstDayOfWeek}
                        placeholder="Select To Date"
                        ariaLabel="Select a To date"
                        value={props.toDate}
                        formatDate={onFormatDate}
                        onSelectDate={_onChangeToDate}
                        minDate={!!minCustomDate ? minCustomDate._d : minRangeDate}
                        maxDate={!!maxCustomDate ? maxCustomDate._d : maxDate}
                    />
                </div>

            </React.Fragment>
        }
    </>;
};