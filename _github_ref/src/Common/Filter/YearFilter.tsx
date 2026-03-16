import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import moment from "moment";

interface IYearFilterProps {
    selectedYear: number;
    onYearChange: (Year: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    isReq?: boolean;
}

export const YearFilter: React.FunctionComponent<IYearFilterProps> = (props: IYearFilterProps): React.ReactElement => {
    const [defaultYear, setDefaultYear] = React.useState<any>();

    const _onYearChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onYearChange(option as any);
        setDefaultYear(option.value);
    };

    const [Options, setOptions] = React.useState<any>();

    React.useEffect(() => {
        const currentYear = moment().year();

        const optionYear = [
            // { value: 'All', key: '', text: '', label: 'All' },
            { value: (currentYear - 1).toString(), key: (currentYear - 1).toString(), text: (currentYear - 1).toString(), label: (currentYear - 1).toString() },
            { value: currentYear.toString(), key: currentYear.toString(), text: currentYear.toString(), label: currentYear.toString() },
            { value: (currentYear + 1).toString(), key: (currentYear + 1).toString(), text: (currentYear + 1).toString(), label: (currentYear + 1).toString() },
        ];
        setOptions(optionYear);
    }, []);

    return <>
        <div className={props?.isReq && !defaultYear && !props.defaultOption ? "req-border-red" : ""}>
            <ReactDropdown
                options={Options} isMultiSelect={false}
                placeholder="Year"
                defaultOption={!!defaultYear ? defaultYear : props.defaultOption}
                onChange={_onYearChange}
            />
        </div>
    </>;
};