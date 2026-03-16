/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import Select from 'react-select';


import { SortArray, getUniueRecordsByColumnName } from './Util';

export interface IReactDropOptionProps {
    value: any;
    label: string;
    data?: any;
    isChecked?: boolean;
    key?: any;
    Email?: any
}

interface IReactDropdownProps {
    options: IReactDropOptionProps[];
    name: string;
    isMultiSelect?: boolean;
    onChange(selectedOption: any, name: string): void;
    defaultOption: any;
    isCloseMenuOnSelect?: boolean;
    placeholder?: string;
    isDisabled?: boolean;
    minWidth?: any;
    isSorted?: boolean;
    isClearable?: boolean;
    errorMessage?: string;
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
        isClearable,
        errorMessage
    } = props;

    const optionTitleItem: IReactDropOptionProps = options?.filter((item: IReactDropOptionProps) => item.value === "" || item.value === 0 || !item.value)[0];
    let sortedOptions = getUniueRecordsByColumnName(options, "label").filter((item: IReactDropOptionProps) => item.value !== "" && item.value !== 0 && !!item.value);
    if (isSorted === true) {
        sortedOptions = SortArray(sortedOptions);
    }
    let filteredSortedOptions: IReactDropOptionProps[] = [];
    if (optionTitleItem !== undefined && optionTitleItem !== null)
        filteredSortedOptions = [optionTitleItem].concat(sortedOptions);
    else
        filteredSortedOptions = [{ label: !!placeholder ? placeholder : `--Select--`, value: "" }].concat(sortedOptions);

    const selectStyles = {
        control: (styles: any) => ({
            ...styles,
            minWidth: 100,
            borderColor: errorMessage ? "#a4262c" : "black",
            borderRadius: 0,
            "&:hover": {
                borderColor: errorMessage ? "#a4262c" : "black",
            }
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
        <div className="react-dropdown-container" style={{ width: '100%' }}>
            <Select
                isDisabled={isDisabled}
                isMulti={isMultiSelect}
                isSearchable={true}
                placeholder={!!placeholder ? placeholder : "--Select--"}
                value={defaultOption}
                options={filteredSortedOptions}
                onChange={(e: any) => onChange(e, name)}
                classNamePrefix="react-select"
                styles={selectStyles}
                menuPortalTarget={document.body}
                menuPosition={'fixed'}
                closeMenuOnSelect={isMultiSelect ? false : isCloseMenuOnSelect}
                isClearable={isClearable}
            />
            {errorMessage && (
                <div
                    className="ms-TextField-errorMessage errorMessage-211"
                    style={{
                        color: '#a4262c',
                        fontSize: '12px',
                        fontWeight: 400,
                        marginTop: '5px',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <span className="ms-TextField-errorMessageText">{errorMessage}</span>
                </div>
            )}
        </div>
    );
};

export default ReactDropdown;
