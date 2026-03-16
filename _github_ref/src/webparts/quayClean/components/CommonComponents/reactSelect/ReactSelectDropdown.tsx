/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import Select from 'react-select';
import { IReactDropOptionProps } from './IReactDropOptionProps';
import { getUniueRecordsByColumnName, SortArray } from '../../../../../Common/Util';


interface IReactDropdownProps {
    options: IReactDropOptionProps[];
    name: string;
    isMultiSelect: boolean;
    onChange(selectedOption: any, name: string): void;
    defaultOption: any;
    isCloseMenuOnSelect?: boolean;
    placeholder?: string;
    isDisabled?: boolean;
    isSorted?: boolean;
    isClearable?: boolean;

}

const ReactDropdown: React.FunctionComponent<IReactDropdownProps> = (props: IReactDropdownProps): React.ReactElement<IReactDropdownProps> => {
    const {
        options,
        name,
        isMultiSelect,
        onChange,
        defaultOption,
        isSorted,
        isCloseMenuOnSelect,
        placeholder,
        isDisabled,
        isClearable
    } = props;

    const optionTitleItem: IReactDropOptionProps = options?.filter((item: IReactDropOptionProps) => !item.value)[0];
    let sortedOptions = getUniueRecordsByColumnName(options, "label");
    if (isSorted === true) {
        sortedOptions = SortArray(sortedOptions.filter((item: IReactDropOptionProps) => item.value));
    }
    let filteredSortedOptions: IReactDropOptionProps[] = [];
    if (optionTitleItem !== null)
        filteredSortedOptions = sortedOptions;
    else
        filteredSortedOptions = [{ label: `--Select--`, value: "" }].concat(sortedOptions);

    const selectStyles = {
        control: (styles: any) => ({
            ...styles,
            minWidth: 100,
            borderColor: "black",
            borderRadius: 0,
        }),
        menu: (provided: any) => ({
            ...provided,
            zIndex: 9999999
        }),
        option: (styles: any, { data, isDisabled, isFocused, isSelected }: any) => {
            return {
                ...styles,
                zIndex: "1000"
            };
        },
    };

    return (
        <Select
            isDisabled={isDisabled}
            isMulti={isMultiSelect}
            isSearchable={true}
            placeholder={!!placeholder ? "--" + placeholder + "--" : "--Select--"}
            value={defaultOption}
            options={filteredSortedOptions}
            onChange={(e) => onChange(e, name)}
            classNamePrefix="react-select"
            styles={selectStyles}
            menuPortalTarget={document.body}
            menuPosition={'fixed'}
            closeMenuOnSelect={isCloseMenuOnSelect}
            isClearable={isClearable}
        // menuIsOpen={true}
        />
    );
};

export default ReactDropdown;
