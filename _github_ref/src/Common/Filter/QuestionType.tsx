import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IQuestionTypeFilterProps {
    selectedQuestionType?: number;
    onQuestionTypeChange: (QuestionTypeId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    className?: string
}

export const QuestionTypeFilter: React.FunctionComponent<IQuestionTypeFilterProps> = (props: IQuestionTypeFilterProps): React.ReactElement => {
    const _onQuestionTypeChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onQuestionTypeChange(option.text as string);
    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All QuestionType--" });
        }
        props.provider.choiceOption(ListNames.QuestionMaster, "QuestionType").then((response) => {
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
            placeholder="Question Type"
            defaultOption={props.defaultOption}
            onChange={_onQuestionTypeChange}
            className={props?.className || ""}
        />
    </>;
};