import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IJobControlChecklistStatusFilterProps {
    selectedJobControlChecklistStatus: number;
    onJobControlChecklistStatusChange: (JobControlChecklistStatusId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const JobControlChecklistStatusFilter: React.FunctionComponent<IJobControlChecklistStatusFilterProps> = (props: IJobControlChecklistStatusFilterProps): React.ReactElement => {

    const _onJobControlChecklistStatusChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onJobControlChecklistStatusChange(option.text as string);
    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: '', label: " --All Status--" });
        }
        props.provider.choiceOption(ListNames.JobControlChecklistDetails, "Status").then((response) => {
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
            placeholder="Status"
            defaultOption={props.defaultOption}
            onChange={_onJobControlChecklistStatusChange}
        />
    </>;
};