import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IQuestionOptionFilterProps {
    selectedQuestionOption?: number;
    onQuestionOptionChange: (QuestionOptionId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    className?: string
}

export const QuestionOptionFilter: React.FunctionComponent<IQuestionOptionFilterProps> = (props: IQuestionOptionFilterProps): React.ReactElement => {
    const _onQuestionOptionChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onQuestionOptionChange(option.text as string);
    };

    const [Options, setOptions] = React.useState<any>();

    const formatOptions = (options: any) => {
        return options.replace(/\|/g, ' | ');
    };

    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: '', label: " --All Option--" });
        }
        props.provider.choiceOption(ListNames.QuestionMaster, "Option").then((response) => {
            response.map((value: any) => {
                const formattedOptions = formatOptions(value);
                dropvalue.push({ value: value, key: value, text: value, label: formattedOptions });
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
            placeholder="Option"
            defaultOption={props.defaultOption}
            onChange={_onQuestionOptionChange}
            className={props?.className || ""}
        />
    </>;
};