/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { ActionMeta } from "react-select";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";

interface ITypeFilterProps {
    selectedType: number;
    onTypeChange: (TypeId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const TypeFilter: React.FunctionComponent<ITypeFilterProps> = (props: ITypeFilterProps): React.ReactElement => {
    const [defaultType, setDefaultType] = React.useState<any>(props.selectedType);

    const _onTypeChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onTypeChange(option.text as string);
        setDefaultType(option.value);
    };

    const [Options, setOptions] = React.useState<any>();

    const optionType: any[] = [
        { key: "Both", text: "Both", value: "Both", label: "Both" },
        { key: "Site", text: "Site", value: "Site", label: "Site" },
        { key: "State", text: "State", value: "State", label: "State" }
    ];
    if (props.AllOption === true) {
        optionType.push({ key: '', text: '', value: 'All', label: " --All Type--" });
    }
    React.useEffect(() => {
        setOptions(optionType);
    }, []);

    return <>
        <ReactDropdown
            options={Options} isMultiSelect={false}
            placeholder="Type"
            defaultOption={defaultType || props.selectedType}
            onChange={_onTypeChange}
        />
    </>
}