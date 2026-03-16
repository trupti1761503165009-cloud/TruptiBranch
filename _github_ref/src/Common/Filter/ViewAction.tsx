/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IViewActionFilterProps {
    selectedViewAction: number;
    onViewActionChange: (ViewActionId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const ViewActionFilter: React.FunctionComponent<IViewActionFilterProps> = (props: IViewActionFilterProps): React.ReactElement => {
    const [defaultViewAction, setDefaultViewAction] = React.useState<any>(props.defaultOption);

    const _onViewActionChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onViewActionChange(option.text as string);
        setDefaultViewAction(option.value);
    };

    const [Options, setOptions] = React.useState<any>();

    const optionViewAction: any[] = [
        { value: 'List View', key: 'List View', text: 'List View', label: 'List View' },
        { value: 'Card View', key: 'Card View', text: 'Card View', label: 'Card View' }
    ];
    React.useEffect(() => {
        setOptions(optionViewAction);
    }, []);

    return <>
        <ReactDropdown
            options={Options} isMultiSelect={false}
            placeholder="View Type"
            defaultOption={defaultViewAction}
            onChange={_onViewActionChange}
        />
    </>;
};