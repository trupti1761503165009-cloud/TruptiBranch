import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ILoginUserRoleDetails } from "../../Interfaces/ILoginUserRoleDetails";
interface IStateFilterProps {
    selectedState: number[];  // Change to array for multiple selection
    onStateChange: (stateIds: number[], options?: any) => void; // Accept array of selected IDs
    provider: IDataProvider;
    isRequired?: boolean;
    isClearable?: boolean;
    placeholder?: string;
    AllOption?: boolean;
    loginUserRoleDetails?: ILoginUserRoleDetails;
}

export const MultiStateFilter: React.FunctionComponent<IStateFilterProps> = (props: IStateFilterProps): React.ReactElement => {
    const [stateOptions, setStateOptions] = React.useState<IDropdownOption[]>();
    const [defaultState, setDefaultState] = React.useState<any>();

    const _onStateChange = (option: any, actionMeta: ActionMeta<any>): void => {
        const selectedIds = option.map((opt: any) => opt.value); // Get the array of selected IDs
        props.onStateChange(selectedIds, option); // Pass the selected state IDs
        setDefaultState(selectedIds); // Update default state for multi-select
    };

    const getStatenameList = (): void => {
        const select = ["Id,Title"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.StateMaster
        };
        let dropvalue: any = [];

        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            if (props?.loginUserRoleDetails?.isStateManager && !props?.loginUserRoleDetails?.isAdmin) {
                let filteredData = response.filter((item: any) => props?.loginUserRoleDetails?.stateManagerStateItem.includes(item.Id));
                filteredData.map((State: any) => {
                    dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
                });
            } else if (props.loginUserRoleDetails?.isShowOnlyChairPerson && props.loginUserRoleDetails.whsChairpersonsStateId.length > 0) {
                let filteredData = response.filter((item: any) => props?.loginUserRoleDetails?.whsChairpersonsStateId.includes(item.Id));
                filteredData.map((State: any) => {
                    dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
                });
            }
            else {
                response.map((State: any) => {
                    dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
                });
            }
            setStateOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getStatenameList();
    }, []);

    return <>
        {stateOptions &&
            <ReactDropdown
                options={stateOptions || []}
                isMultiSelect={true} // Enable multi-select
                defaultOption={defaultState || props.selectedState} // Default selected states
                onChange={_onStateChange}
                isClearable={props.isClearable}
                placeholder={props.placeholder || "State"}
                isCloseMenuOnSelect={false}
            />
        }
    </>
}
