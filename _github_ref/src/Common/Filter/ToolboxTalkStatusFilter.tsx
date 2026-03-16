import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IToolboxTalkStatusFilterProps {
    selectedToolboxTalkStatus: number;
    onToolboxTalkStatusChange: (ToolboxTalkStatusId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const ToolboxTalkStatusFilter: React.FunctionComponent<IToolboxTalkStatusFilterProps> = (props: IToolboxTalkStatusFilterProps): React.ReactElement => {

    const _onToolboxTalkStatusChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onToolboxTalkStatusChange(option.text as string);
    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Response--" });
        }
        props.provider.choiceOption(ListNames.ToolboxTalkDetails, "Response").then((response) => {
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
            options={Options}
            isMultiSelect={false}
            placeholder="Response"
            defaultOption={props.defaultOption}
            onChange={_onToolboxTalkStatusChange}
        />
    </>;
};