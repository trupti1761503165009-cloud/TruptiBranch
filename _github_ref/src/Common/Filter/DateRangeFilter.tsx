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
}
let filterStartDate: any = null;
let filterEndDate: any = null;

export const DateRangeFilter: React.FunctionComponent<IDaterangeFilterProps> = (props: IDaterangeFilterProps): React.ReactElement => {

    const optionDate: any[] = [
        { value: 'Today', key: 'Today', text: 'Today', label: 'Today' },
        { value: 'Tomorrow', key: 'Tomorrow', text: 'Tomorrow', label: 'Tomorrow' },
        { value: 'This Week', key: 'This Week', text: 'This Week', label: 'This Week ' },
        { value: 'Next 7 Days', key: 'Next 7 Days', text: 'Next 7 Days', label: 'Next 7 Days' },
        { value: 'This Month', key: 'This Month', text: 'This Month', label: 'This Month ' },
        { value: 'Next 30 Days', key: 'Next 30 Days', text: 'Next 30 Days', label: 'Next 30 Days' },
        { value: 'Custom Range', key: 'Custom Range', text: 'Custom Range', label: 'Custom Range ' },
    ];

    const [firstDayOfWeek,] = React.useState(DayOfWeek.Sunday);
    const [selectedOption, setSelectedOption] = React.useState<IDropdownOption>({ key: "", text: "" });
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
        else if (selectedType == "Tomorrow") {
            filterStartDate = moment(new Date()).add(1, 'day').format(defaultValues.FilterDateFormate);
            filterEndDate = moment(new Date()).add(1, 'day').format(defaultValues.FilterDateFormate);
        }
        else if (selectedType == "This Week") {
            filterStartDate = moment(new Date()).startOf('week').add(1, 'days').format(defaultValues.FilterDateFormate);
            filterEndDate = moment(new Date()).endOf('week').add(1, 'days').format(defaultValues.FilterDateFormate);
        }
        else if (selectedType == "Next 7 Days") {
            filterStartDate = moment(new Date()).format(defaultValues.FilterDateFormate);
            filterEndDate = moment(new Date()).add(6, 'day').format(defaultValues.FilterDateFormate);
        }
        else if (selectedType == "This Month") {
            filterStartDate = moment(new Date()).startOf('month').format(defaultValues.FilterDateFormate);
            filterEndDate = moment(new Date()).endOf('month').format(defaultValues.FilterDateFormate);
        }
        else if (selectedType == "Next 30 Days") {
            filterStartDate = moment(new Date()).format(defaultValues.FilterDateFormate);
            filterEndDate = moment(new Date()).add(29, 'day').format(defaultValues.FilterDateFormate);
        }
        return { filterStartDate, filterEndDate };
    };

    const _onChangeRangeOption = (option: any, actionMeta: ActionMeta<any>): void => {
        setSelectedOption(option);
        if (option.text != "Custom Range") {
            let filterDates = _getFilterDate(option.text);
            props.onFromDateChange(filterDates.filterStartDate);
            props.onToDateChange(filterDates.filterEndDate);
        }
        props.onChangeRangeOption(option);
    };

    return <>

        <div className="ms-Grid-col ms-sm12 ms-md2 ms-lg2">

            <ReactDropdown
                options={optionDate} isMultiSelect={false}
                placeholder="Date"
                defaultOption={selectedOption.text}
                onChange={_onChangeRangeOption}
            />
        </div>
        {selectedOption.key == "Custom Range" &&
            <React.Fragment>

                <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg2 ddmt4">
                    <DatePicker
                        firstDayOfWeek={firstDayOfWeek}
                        placeholder="Select From Date"
                        ariaLabel="Select a From date"
                        value={props.fromDate}
                        formatDate={onFormatDate}
                        onSelectDate={_onChangeFromDate}
                        minDate={!!minCustomDate ? minCustomDate._d : null}
                    // maxDate={!!maxCustomDate ? maxCustomDate._d : !!maxRangeDate ? maxRangeDate : maxDate}
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
                    // maxDate={!!maxCustomDate ? maxCustomDate._d : maxDate}
                    />
                </div>

            </React.Fragment>
        }
        {/* </div> */}
        {/* </div> */}
    </>;
};