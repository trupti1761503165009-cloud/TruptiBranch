import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IJobCompletionFilterProps {
    selectedJobCompletion: number;
    onJobCompletionChange: (JobCompletionId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const JobCompletionFilter: React.FunctionComponent<IJobCompletionFilterProps> = (props: IJobCompletionFilterProps): React.ReactElement => {
    // const [defaultJobCompletion, setDefaultJobCompletion] = React.useState<any>();

    const _onJobCompletionChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onJobCompletionChange(option.text as string);
        // setDefaultJobCompletion(option.value);
    };
    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Job Completion--" });
        }
        props.provider.choiceOption(ListNames.Periodic, "JobCompletion").then((response) => {
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
    // const optionJobCompletion: any[] = [
    //     { value: 'All', key: '', text: '', label: 'All' },
    //     { value: 'JobCompletion 1', key: 'JobCompletion 1', text: 'JobCompletion 1', label: 'JobCompletion 1' },
    //     { value: 'JobCompletion 2', key: 'JobCompletion 2', text: 'JobCompletion 2', label: 'JobCompletion 2' },
    //     { value: 'JobCompletion 3', key: 'JobCompletion 3', text: 'JobCompletion 3', label: 'JobCompletion 3' }
    // ];

    return <>
        <ReactDropdown
            options={Options} isMultiSelect={false}
            placeholder="Job Completion"
            defaultOption={props.defaultOption}
            onChange={_onJobCompletionChange}
        />
    </>;
};