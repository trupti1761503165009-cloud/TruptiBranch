import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ILoginUserRoleDetails } from "../../Interfaces/ILoginUserRoleDetails";

interface IStateFilterProps {
    selectedState: number;
    onStateChange: (stateId: any, option?: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    isClearable?: boolean;
    placeholder?: string;
    AllOption?: boolean;
    loginUserRoleDetails?: ILoginUserRoleDetails;
}

export const StateFilter: React.FunctionComponent<IStateFilterProps> = (props: IStateFilterProps): React.ReactElement => {
    const [stateOptions, setStateOptions] = React.useState<IDropdownOption[]>();
    const [defaultState, setDefaultState] = React.useState<any>();

    const _onStateChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onStateChange(option?.text as string, option);
        setDefaultState(option?.value);
    };

    const getStatenameList = (): void => {
        const select = ["Id,Title"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.StateMaster
        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: '', label: " --All State--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            if (props?.loginUserRoleDetails?.isStateManager && !props?.loginUserRoleDetails?.isAdmin) {
                let filteredData = response.filter((item: any) => props?.loginUserRoleDetails?.stateManagerStateItem.includes(item.Id));
                filteredData.map((State: any) => {
                    dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
                });
            } else {
                response.map((State: any) => {
                    dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
                });
            }
            // response.map((State: any) => {
            //     dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
            // });
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
                options={stateOptions}
                isMultiSelect={false}
                defaultOption={defaultState}
                onChange={_onStateChange}
                isClearable={props.isClearable}
                placeholder={"State"}
            />
        }
    </>;
};