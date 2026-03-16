import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IFrequencyFilterProps {
    selectedFrequency: number;
    onFrequencyChange: (FrequencyId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    isReq?: boolean;
}

export const FrequencyFilter: React.FunctionComponent<IFrequencyFilterProps> = (props: IFrequencyFilterProps): React.ReactElement => {

    const _onFrequencyChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onFrequencyChange(option.text as string);
    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Frequency--" });
        }
        props.provider.choiceOption(ListNames.Periodic, "Frequency").then((response) => {
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
        <div className={props?.isReq && !props.defaultOption ? "req-border-red" : ""}>
            <ReactDropdown
                options={Options} isMultiSelect={false}
                placeholder="Frequency"
                defaultOption={props.defaultOption}
                onChange={_onFrequencyChange}
            />
        </div>
    </>;
};