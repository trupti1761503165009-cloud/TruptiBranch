import * as React from "react";
import Select from 'react-select';
import { ListNames } from "../../../../Shared/Enum/ListNames";
import { GetSortOrder } from "../Util";
import { useAtom } from "jotai";
import { appGlobalStateAtom } from "../../../../jotai/appGlobalStateAtom";


interface IPAStatusFilterProps {
    selectedEmployeeStatus: any;
    onEmployeeStatusChange: (name: string, selectedOption: any) => void;
    filterOption?: any
}



export const PAStatusFilter: React.FunctionComponent<IPAStatusFilterProps> = (props: IPAStatusFilterProps): React.ReactElement => {
    const [EmployeeStatusOptions, setEmployeeStatusOptions] = React.useState<any[]>([]);
    const [appglobalState] = useAtom(appGlobalStateAtom);
    const { provider } = appglobalState;


    const _onEmployeeStatusFilterChange = (item: any): void => {
        props.onEmployeeStatusChange("PAStatus", item as any);
    };

    const getDepartmentNameList = () => {
        provider.choiceOption(ListNames.PAProcess, 'PAStatus')
            .then((response) => {
                const employeeStatusOptions: any[] = [];
                employeeStatusOptions.push({ value: '', label: 'Select PA Status' });
                const sortedOptions = response
                    .map((status: any) => ({ value: status, label: status }))
                    .sort(GetSortOrder("label"));
                employeeStatusOptions.push(...sortedOptions);
                setEmployeeStatusOptions(employeeStatusOptions);
            })
            .catch(err => console.log("Error fetching PAStatus choices:", err));
    };


    React.useEffect(() => {
        getDepartmentNameList();
    }, []);

    return <>
        <Select
            placeholder="Select PA Status"
            value={props.selectedEmployeeStatus || []}
            onChange={(e: any) => _onEmployeeStatusFilterChange(e)}
            options={EmployeeStatusOptions}
        />
    </>;
};