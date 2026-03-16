import * as React from "react"
import { IReactSelectOptionProps } from "../../../../Interfaces/IReactSelectOptionProps";
import { ReactDropdown } from "./ReactDropdown";
export interface IFilterDropDownProps {

    siteNameFilterItems?: IDropdownFilterProps;
    stateFilterItems?: IDropdownFilterProps;
    assetStatusFilterItems?: IDropdownFilterProps;
}


export interface IDropdownFilterProps {
    listItems?: IReactSelectOptionProps[];
    selectedItem: any;
    onChange?(option: any | null, actionMeta: any): any
}

export const FilterDropDown = (props: IFilterDropDownProps) => {
    const { assetStatusFilterItems, stateFilterItems, siteNameFilterItems } = props;

    return <>
        <div>
            <div className="formGroup">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        {!!assetStatusFilterItems &&
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3 ">
                                <div className="formControl">
                                    <ReactDropdown
                                        options={assetStatusFilterItems.listItems || []}
                                        isMultiSelect={true}
                                        onChange={assetStatusFilterItems.onChange}
                                        defaultOption={assetStatusFilterItems.selectedItem}
                                        placeholder="-- Asset Status --"
                                        isCloseMenuOnSelect={false}
                                    />
                                </div>

                            </div>
                        }
                        {!!stateFilterItems &&
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3 ">

                                <div className="formControl">
                                    <ReactDropdown
                                        options={stateFilterItems.listItems || []}
                                        isMultiSelect={true}
                                        onChange={stateFilterItems.onChange}
                                        defaultOption={stateFilterItems.selectedItem}
                                        placeholder="-- State -- "
                                        isCloseMenuOnSelect={false}
                                    />
                                </div>

                            </div>
                        }
                        {!!siteNameFilterItems &&
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3 ">

                                <div className="formControl">
                                    <ReactDropdown
                                        options={siteNameFilterItems.listItems || []}
                                        isMultiSelect={true}
                                        onChange={siteNameFilterItems.onChange}
                                        defaultOption={siteNameFilterItems.selectedItem}
                                        placeholder="-- Site Name --"
                                        isCloseMenuOnSelect={false}
                                    />
                                </div>

                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    </>

}