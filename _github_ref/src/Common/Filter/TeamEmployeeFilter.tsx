import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { FieldType, ICamlQueryFilter, LogicalType } from "../Constants/DocumentConstants";
import CamlBuilder from "camljs";
import { getCAMLQueryFilterExpression } from "../Util";

interface IEmployeeFilterProps {
    selectedEmployee: number;
    onEmployeeChange: (EmployeeId: any, option?: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    siteNameId?: any;
    AllOption?: boolean;
    qCState?: string;
    defaultOption?: any[];
    isCloseMenuOnSelect?: boolean;
    placeholder?: string;
    employeeOptions: any[];
    isDisabled: boolean;
}

export const TeamEmployeeFilter: React.FunctionComponent<IEmployeeFilterProps> = (props: IEmployeeFilterProps): React.ReactElement => {
    const [EmployeeOptions, setEmployeeOptions] = React.useState<any[]>();
    const [defaultEmployee, setDefaultEmployee] = React.useState<any>(props.defaultOption);
    // const [quaycleanEmployeeListData, setQuaycleanEmployeeListData] = React.useState<any[]>();
    // React.useEffect(() => {
    //     setDefaultEmployee(props.defaultOption);
    // }, [props.defaultOption,EmployeeOptions]);

    // Update defaultEmployee when selectedEmployee changes
    React.useEffect(() => {
        setDefaultEmployee(props.selectedEmployee);
    }, [props.selectedEmployee]);


    const _onEmployeeChange = (selectedOptions: any, actionMeta: ActionMeta<any>): void => {
        // For single selection, selectedOptions will be a single object instead of an array
        props.onEmployeeChange(selectedOptions);
        setDefaultEmployee(selectedOptions ? selectedOptions.value : ''); // Set the value for single selection
    };

    React.useEffect(() => {
        // getEmployeenameList();
        setEmployeeOptions(props.employeeOptions);
    }, [props.employeeOptions]);

    return <>
        {EmployeeOptions &&
            <ReactDropdown
                options={EmployeeOptions}
                isMultiSelect={false}
                placeholder={props.placeholder ?? "Attendees"}
                defaultOption={defaultEmployee}
                isCloseMenuOnSelect={(props?.isCloseMenuOnSelect == undefined) ? true : props?.isCloseMenuOnSelect}
                //isCloseMenuOnSelect={false}
                onChange={_onEmployeeChange}
                isDisabled={props.isDisabled || false}
            />

        }
    </>;
};