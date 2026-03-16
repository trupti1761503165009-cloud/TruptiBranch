import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IWeekFilterProps {
    selectedWeek: number;
    onWeekChange: (Week: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    isReq?: boolean;
}

export const WeekFilter: React.FunctionComponent<IWeekFilterProps> = (props: IWeekFilterProps): React.ReactElement => {
    const [defaultWeek, setDefaultWeek] = React.useState<any>();

    const _onWeekChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onWeekChange(option as any);
        setDefaultWeek(option.value);
    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Week--" });
        }
        props.provider.choiceOption(ListNames.Periodic, "Week").then((response) => {
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
        <div className={props?.isReq && !defaultWeek && !props.defaultOption ? "req-border-red" : ""}>
            <ReactDropdown
                options={Options} isMultiSelect={false}
                placeholder="Week"
                defaultOption={!!defaultWeek ? defaultWeek : props.defaultOption}
                onChange={_onWeekChange}
            />
        </div>
    </>;
};