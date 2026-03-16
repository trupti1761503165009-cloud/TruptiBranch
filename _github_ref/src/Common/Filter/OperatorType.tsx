/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { Dropdown, IDropdownOption } from "office-ui-fabric-react";
interface IOperatorTypeFilterProps {
    selectedOperatorType: string[]; // Array to handle multiple selected values
    onOperatorTypeChange: (OperatorTypeIds: string[]) => void; // Updated to accept multiple values
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string[]; // Updated to be an array for multiple selections
    AllOption?: boolean;
}

export const OperatorTypeFilter: React.FunctionComponent<IOperatorTypeFilterProps> = (
    props: IOperatorTypeFilterProps
): React.ReactElement => {
    const [selectedOperatorTypes, setSelectedOperatorTypes] = React.useState<string[]>(
        props.selectedOperatorType
    );

    /**
       * update OperatorType Filter
       * Rename the field from Daily Operator to Machine Operator.
       * Remove Checklist Operatoroption.
       * Updated by Trupti on 18/9/2025.
    */
    const optionOperatorType = [
        { value: 'Machine Operator', key: 'Machine Operator', text: 'Machine Operator', label: 'Machine Operator' }
    ];

    // Assuming Options are predefined
    const [Options, setOptions] = React.useState(optionOperatorType);

    const _onOperatorTypeChange = (selectedOptions: any[]): void => {
        const selectedValues = selectedOptions.map(option => option.value);
        setSelectedOperatorTypes(selectedValues);
        props.onOperatorTypeChange(selectedValues);
    };

    React.useEffect(() => {
        if (props.defaultOption) {
            setSelectedOperatorTypes(props.defaultOption);
        }
    }, [props.defaultOption]);

    return (
        <ReactDropdown
            options={Options}
            isMultiSelect={true}
            placeholder="Operator Type"
            defaultOption={selectedOperatorTypes}
            onChange={_onOperatorTypeChange}
        />
    );
};