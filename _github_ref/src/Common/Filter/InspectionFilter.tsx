import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IInspectionFilterProps {
    selectedInspection: number;
    onInspectionChange: (InspectionId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    reset?: boolean;
}

export const InspectionFilter: React.FunctionComponent<IInspectionFilterProps> = (props: IInspectionFilterProps): React.ReactElement => {
    const [defaultInspection, setDefaultInspection] = React.useState<any>();
    const _onInspectionChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onInspectionChange(option.text as string);
        setDefaultInspection(option.value);
    };

    const [Options, setOptions] = React.useState<any>();

    React.useEffect(() => {
        const option: any[] = [
            { value: 'Conducted Date', key: 'Conducted Date', text: 'Conducted Date', label: 'Conducted Date' },
            { value: 'Completed Date', key: 'Completed Date', text: 'Completed Date', label: 'Completed Date' }
        ];
        setOptions(option);
    }, []);

    React.useEffect(() => {
        if (props.reset) {
            setDefaultInspection('Conducted Date');
            props.onInspectionChange('Conducted Date');
        }
    }, [props.reset]);

    return <>
        <ReactDropdown
            options={Options} isMultiSelect={false}
            placeholder="Inspection"
            defaultOption={defaultInspection ? defaultInspection : props.defaultOption}
            onChange={_onInspectionChange}
        />
    </>;
};