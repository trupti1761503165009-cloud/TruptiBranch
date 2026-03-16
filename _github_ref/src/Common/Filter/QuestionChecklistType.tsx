import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IChecklistTypeFilterProps {
    selectedChecklistType?: number;
    onChecklistTypeChange: (ChecklistTypeId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    refreshNav?: boolean;
    className?: string
}

export const ChecklistTypeFilter: React.FunctionComponent<IChecklistTypeFilterProps> = (props: IChecklistTypeFilterProps): React.ReactElement => {

    const _onChecklistTypeChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onChecklistTypeChange(option.text as string);
    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Checklist Type--" });
        }

        props.provider.choiceOption(ListNames.QuestionMaster, "ChecklistType").then((response) => {
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
    }, [props.refreshNav]);

    return <>
        <ReactDropdown
            options={Options}
            isMultiSelect={false}
            placeholder="All Checklist Type"
            defaultOption={props.defaultOption}
            onChange={_onChecklistTypeChange}
            className={props?.className || ""}
        />
    </>;
};