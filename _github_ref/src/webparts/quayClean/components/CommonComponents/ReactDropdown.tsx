import * as React from 'react';
import Select, { ActionMeta } from 'react-select';
import { SortArray, getUniueRecordsByColumnName } from '../../../../Common/Util';

interface IReactDropdownProps {
  options: any[];
  isMultiSelect: boolean;
  onChange?(option: any, actionMeta: ActionMeta<any>): any;
  defaultOption?: any | string[];
  isCloseMenuOnSelect?: boolean;
  placeholder?: string;
  isDisabled?: boolean;
  isSorted?: boolean;
  isClearable?: boolean;
  selectRef?: any;
  minWidth?: number;
  onBlur?: any
  className?: any;
  uniqueBy?: any;
}

export const ReactDropdown: React.FunctionComponent<IReactDropdownProps> = (props: IReactDropdownProps): React.ReactElement<IReactDropdownProps> => {
  const { options, isMultiSelect, onChange, defaultOption, isSorted, isCloseMenuOnSelect, placeholder, isDisabled, isClearable, selectRef, uniqueBy } = props;

  const optionTitleItem: any = options?.filter((item: any) => !item?.value)[0];
  let sortedOptions = getUniueRecordsByColumnName(options, uniqueBy ? uniqueBy : "label");
  if (isSorted === false) {
    console.log();
  } else {
    sortedOptions = SortArray(sortedOptions.filter((item: any) => item.value));
  }
  let filteredSortedOptions: any[] = [];
  if (optionTitleItem != null)
    filteredSortedOptions = [optionTitleItem].concat(sortedOptions);
  else
    filteredSortedOptions = sortedOptions;


  const selectStyles = {
    control: (styles: any) => ({
      ...styles,
      minWidth: !props.minWidth ? 100 : props.minWidth,
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
        zindex: "1000"
      };
    },
  };

  return (
    <Select
      ref={selectRef}
      isDisabled={isDisabled}
      isMulti={isMultiSelect}
      isSearchable={true}
      placeholder={!!placeholder ? placeholder : "Select"}
      value={filteredSortedOptions.filter(function (option) {
        return (isMultiSelect && defaultOption != null) ? (defaultOption.length > 0 && defaultOption.indexOf(option.value) >= 0) : (defaultOption === option.value);
      })}
      options={filteredSortedOptions}
      // onBlur={!!props.onBlur ? props.onBlur() : undefined}
      // onBlur={!!props.onBlur ? props.onBlur() : undefined}
      onChange={onChange}
      classNamePrefix="react-select"
      styles={selectStyles}
      // menuPortalTarget={document.body || document.getElementById("root")}
      // menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
      menuPosition={'fixed'}
      closeMenuOnSelect={isCloseMenuOnSelect}
      isClearable={isClearable}
      className={props.className ? props.className : ""}
    // menuIsOpen={true}
    />
  );
};
