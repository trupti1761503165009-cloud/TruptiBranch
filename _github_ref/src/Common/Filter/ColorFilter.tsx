import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IColorFilterProps {
    selectedColor: number;
    onColorChange: (colorId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    listName?: any;
    isDisable?: boolean
}

export const ColorFilter: React.FunctionComponent<IColorFilterProps> = (props: IColorFilterProps): React.ReactElement => {

    const _onColorChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onColorChange(option.text as string);
    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Color--" });
        }
        props.provider.choiceOption(props.listName ? props.listName : ListNames.AssetMaster, "QCColor").then((response) => {
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
            placeholder="Color"
            defaultOption={props.defaultOption}
            onChange={_onColorChange}
            isDisabled={props.isDisable ? props.isDisable : false}
        />
    </>;
};