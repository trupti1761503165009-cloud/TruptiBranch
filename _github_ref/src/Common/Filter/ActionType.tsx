import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IActionTypeFilterProps {
    selectedActionType: number | any;
    onActionTypeChange: (ActionTypeId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string | any;
    AllOption?: boolean;
    isMultipleSelect?: boolean;
    isClearable?: boolean;
    isCloseMenuOnSelect?: boolean;
}

export const ActionTypeFilter: React.FunctionComponent<IActionTypeFilterProps> = (props: IActionTypeFilterProps): React.ReactElement => {

    const _onActionTypeChange = (option: any, actionMeta: ActionMeta<any>): void => {
        if (props.isMultipleSelect) {
            props.onActionTypeChange(option as any);
        } else {
            props.onActionTypeChange(option?.text as string);
        }

    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Action Type--" });
        }
        props.provider.choiceOption(ListNames.UserActivityLog, "ActionType").then((response) => {
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
            options={Options || []}
            isMultiSelect={props?.isMultipleSelect || false}
            placeholder="Action Type"
            defaultOption={props?.defaultOption}
            isClearable={props.isClearable || undefined}
            onChange={_onActionTypeChange}
            isCloseMenuOnSelect={props.isCloseMenuOnSelect != undefined ? props.isCloseMenuOnSelect : undefined}
        />
    </>;
};