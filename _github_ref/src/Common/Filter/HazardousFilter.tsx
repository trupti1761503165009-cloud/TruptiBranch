/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IHazardousFilterProps {
    selectedHazardous: number;
    onHazardousChange: (HazardousId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const HazardousFilter: React.FunctionComponent<IHazardousFilterProps> = (props: IHazardousFilterProps): React.ReactElement => {
    const [defaultHazardous, setDefaultHazardous] = React.useState<any>();

    const _onHazardousChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onHazardousChange(option.text as string);
        setDefaultHazardous(option.value);
    };

    const [Options, setOptions] = React.useState<any>();

    const optionHazardous: any[] = [
        { value: '-All-', key: '', text: '', label: ' --All Hazardous--' },
        { value: 'Yes', key: 'Yes', text: 'Yes', label: 'Yes' },
        { value: 'No', key: 'No', text: 'No', label: 'No' }
    ];
    React.useEffect(() => {
        setOptions(optionHazardous);
    }, []);

    return <>
        <ReactDropdown
            options={Options} isMultiSelect={false}
            placeholder="Hazardous"
            defaultOption={defaultHazardous}
            onChange={_onHazardousChange}
        />
    </>;
};