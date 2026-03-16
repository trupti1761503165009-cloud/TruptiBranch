import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IMonthFilterProps {
    selectedMonth: number;
    onMonthChange: (month: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    isReq?: boolean;
}

export const MonthFilter: React.FunctionComponent<IMonthFilterProps> = (props: IMonthFilterProps): React.ReactElement => {
    const [defaultMonth, setDefaultMonth] = React.useState<any>();

    const _onMonthChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onMonthChange(option as any);
        setDefaultMonth(option.value);
    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Month--" });
        }
        props.provider.choiceOption(ListNames.Periodic, "Month").then((response) => {
            response.map((value: any) => {
                dropvalue.push({ value: value, key: value, text: value, label: value });
            });
            setOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };
    React.useEffect(() => {
        getOptionList();
    }, []);

    return <>
        <div className={props?.isReq && !defaultMonth && !props.defaultOption ? "req-border-red" : ""}>
            <ReactDropdown
                options={Options} isMultiSelect={false}
                placeholder="Month"
                defaultOption={!!defaultMonth ? defaultMonth : props.defaultOption}
                onChange={_onMonthChange}
                isSorted={false}
            />
        </div>
    </>;
};