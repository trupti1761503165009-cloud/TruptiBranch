import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IJobControlChecklistFilterProps {
    selectedJobControlChecklist: number;
    onJobControlChecklistChange: (JobControlChecklistId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const JobControlChecklistFilter: React.FunctionComponent<IJobControlChecklistFilterProps> = (props: IJobControlChecklistFilterProps): React.ReactElement => {

    const _onJobControlChecklistChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onJobControlChecklistChange(option.text as string);
    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: '', label: " --All Frequency--" });
        }
        props.provider.choiceOption(ListNames.JobControlChecklist, "Frequency").then((response) => {
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
            placeholder="Frequency"
            defaultOption={props.defaultOption}
            onChange={_onJobControlChecklistChange}
        />
    </>;
};