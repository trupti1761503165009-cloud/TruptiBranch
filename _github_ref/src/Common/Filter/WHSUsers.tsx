import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ILoginUserRoleDetails } from "../../Interfaces/ILoginUserRoleDetails";

interface IWHSUsersFilterProps {
    selectedWHSUsers: number[];
    selectedWHSUsersId: number[];
    onWHSUsersChange: (WHSUserss: any[]) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    StateId?: any;
    AllOption: boolean;
    loginUserRoleDetails?: ILoginUserRoleDetails;
}

export const WHSUsersFilter: React.FunctionComponent<IWHSUsersFilterProps> = (props: IWHSUsersFilterProps): React.ReactElement => {
    const [WHSUsersOptions, setWHSUsersOptions] = React.useState<IDropdownOption[]>([]);
    const [selectedAssets, setSelectedAssets] = React.useState<any[]>([]);

    const _onWHSUsersChange = (selectedOptions: any[], actionMeta: ActionMeta<any>): void => {
        setSelectedAssets(selectedOptions.map(opt => opt.value));
        props.onWHSUsersChange(selectedOptions);
    };

    const getWHSUsersList = (): void => {
        const select = ["Id,UserName,StateId"];
        // let filter = "IsDeleted ne 1";
        // if (!isAdmin && props?.loginUserRoleDetails?.isStateManager !== true) {
        //     if (props.siteNameId && props.siteNameId !== 0) {
        //         filter = `StateId eq ${props.siteNameId}`;
        //     }
        // }

        const queryStringOptions: IPnPQueryOptions = {
            select,
            listName: ListNames.WHSUsers
        };
        let dropvalue: any[] = [];

        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.forEach((WHSUsers: any) => {
                dropvalue.push({ value: WHSUsers.Id, key: WHSUsers.Id, text: WHSUsers.UserName.toString().trim(), label: WHSUsers.UserName.toString().trim() });
            });
            setWHSUsersOptions(dropvalue);
        }).catch(console.error);
    };

    React.useEffect(() => {
        getWHSUsersList();
    }, []);

    return (
        <>
            {WHSUsersOptions.length > 0 && (
                <ReactDropdown
                    options={WHSUsersOptions}
                    isMultiSelect={true}
                    placeholder="Select Chairperson"
                    defaultOption={props.selectedWHSUsersId}
                    onChange={_onWHSUsersChange}
                />
            )}
        </>
    );
};