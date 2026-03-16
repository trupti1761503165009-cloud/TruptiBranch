import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IWorkTypeFilterProps {
    selectedWorkType: number;
    onWorkTypeChange: (WorkType: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const WorkTypeFilter: React.FunctionComponent<IWorkTypeFilterProps> = (props: IWorkTypeFilterProps): React.ReactElement => {
    const [defaultWorkType, setDefaultWorkType] = React.useState<any>();

    const _onWorkTypeChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onWorkTypeChange(option as any);
        setDefaultWorkType(option.value);
    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Work Type--" });
        }
        props.provider.choiceOption(ListNames.Periodic, "WorkType").then((response) => {
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
        <ReactDropdown
            options={Options} isMultiSelect={false}
            placeholder="Work Type"
            defaultOption={!!defaultWorkType ? defaultWorkType : props.defaultOption}
            onChange={_onWorkTypeChange}
        />
    </>;
};