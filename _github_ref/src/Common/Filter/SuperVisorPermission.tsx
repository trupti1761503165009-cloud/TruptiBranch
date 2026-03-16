import React from 'react';

import { ActionMeta } from 'react-select';
import { IDataProvider } from '../../DataProvider/Interface/IDataProvider';
import { ReactDropdown } from '../../webparts/quayClean/components/CommonComponents/ReactDropdown';

interface ISupervisorPermissionFilterProps {
    selectedSupervisorPermission: any[];
    onSupervisorPermissionChange: (SupervisorPermissionIds: string[]) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string[];
    AllOption?: boolean;
}

export const SupervisorPermissionFilter: React.FunctionComponent<ISupervisorPermissionFilterProps> = (props: ISupervisorPermissionFilterProps): React.ReactElement => {
    const [defaultSupervisorPermission, setDefaultSupervisorPermission] = React.useState<any[]>(props.defaultOption || []);

    const _onSupervisorPermissionChange = (selectedOptions: any[], actionMeta: ActionMeta<any>): void => {
        const selectedValues = selectedOptions.map((option: any) => option.value);
        props.onSupervisorPermissionChange(selectedValues);
        setDefaultSupervisorPermission(selectedValues);
    };

    const [Options, setOptions] = React.useState<any[]>([]);

    const optionSupervisorPermission: any[] = [
        { value: 'Equipment / Assets', key: 'Equipment / Assets', text: 'Equipment / Assets', label: 'Equipment / Assets' },
        { value: 'Chemical', key: 'Chemical', text: 'Chemical', label: 'Chemical' },
        { value: 'Assigned Team', key: 'Assigned Team', text: 'Assigned Team', label: 'Assigned Team' },
        { value: 'Document Library', key: 'Document Library', text: 'Document Library', label: 'Document Library' },
        { value: 'Help Desk', key: 'Help Desk', text: 'Help Desk', label: 'Help Desk' },
        { value: 'Periodic', key: 'Periodic', text: 'Periodic', label: 'Periodic' },
        { value: 'Client Response', key: 'Client Response', text: 'Client Response', label: 'Client Response' },
        { value: 'IMS', key: 'IMS', text: 'IMS', label: 'IMS' },
        { value: 'Job Control Checklist', key: 'Job Control Checklist', text: `Monthly KPI's`, label: `Monthly KPI's` },
    ];

    React.useEffect(() => {
        setOptions(optionSupervisorPermission);
    }, []);

    return (
        <>
            <ReactDropdown
                options={Options}
                isMultiSelect={true}
                placeholder="SupervisorPermission"
                defaultOption={defaultSupervisorPermission}
                onChange={_onSupervisorPermissionChange}
                isCloseMenuOnSelect={false}
                isClearable={true}
            />
        </>
    );
};
