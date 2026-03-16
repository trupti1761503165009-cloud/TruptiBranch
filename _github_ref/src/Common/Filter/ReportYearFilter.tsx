import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import moment from "moment";

interface IYearFilterProps {
    onYearChange: (Year: any) => void;
    defaultOption?: string;
    AllOption?: boolean;
    isReq?: boolean;
}

export const ReportYearFilter: React.FunctionComponent<IYearFilterProps> = (props: IYearFilterProps): React.ReactElement => {
    const [defaultYear, setDefaultYear] = React.useState<any>();

    const _onYearChange = (option: any, actionMeta: ActionMeta<any>): void => {
        if (option) {
            props.onYearChange(option as any);
            setDefaultYear(option.value);
        } else {
            props.onYearChange("");
            setDefaultYear("");
        }

    };

    const [Options, setOptions] = React.useState<any>();

    React.useEffect(() => {
        const currentYear = moment().year();

        const optionYear = [
            { value: currentYear.toString(), key: currentYear.toString(), text: currentYear.toString(), label: currentYear.toString() },
            { value: (currentYear - 1).toString(), key: (currentYear - 1).toString(), text: (currentYear - 1).toString(), label: (currentYear - 1).toString() },
            { value: (currentYear - 2).toString(), key: (currentYear - 2).toString(), text: (currentYear - 2).toString(), label: (currentYear - 2).toString() },
        ];
        setDefaultYear("")
        setOptions(optionYear);
    }, [props.defaultOption]);

    return <>
        <div className={props?.isReq && !defaultYear && !props.defaultOption ? "req-border-red" : ""}>
            <ReactDropdown
                options={Options} isMultiSelect={false}
                placeholder="Year"
                isClearable={false}
                // defaultOption={!!defaultYear ? defaultYear : props.defaultOption}
                defaultOption={props.defaultOption ? props.defaultOption : (!!defaultYear ? defaultYear : "")}
                onChange={_onYearChange}
            />
        </div>
    </>;
};