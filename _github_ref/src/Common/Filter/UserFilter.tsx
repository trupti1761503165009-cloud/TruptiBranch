import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IADUserFilterProps {
    selectedADUser: number;
    onADUserChange: (ADUserId: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    AllOption?: boolean;
    permission?: any;
}

export const UserFilter: React.FunctionComponent<IADUserFilterProps> = (props: IADUserFilterProps): React.ReactElement => {
    const [ADUserOptions, setADUserOptions] = React.useState<IDropdownOption[]>();
    const [defaultADUser, setDefaultADUser] = React.useState<any>();
    const [currentUserData, setCurrentUserData] = React.useState<any>();

    const _onADUserChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onADUserChange(option);
        setDefaultADUser(option?.value);
    };

    const getADUsernameList = (): void => {
        let filter = "";
        if (props.permission.isAdmin === true) {
            filter = "";
        } else if (props.permission.isStateManager === true) {
            filter = "";
        } else {
            filter = `(SiteManagerId eq '${currentUserData.Id}') or (ADUserId eq  '${currentUserData.Id}') or (SiteSupervisorId eq '${currentUserData.Id}')`;
        }
        const select = ["Id,ADUserId,ADUser/Title"];
        const expand = ["ADUser"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            expand: expand,
            filter: filter,
            listName: ListNames.SitesMaster
        };
        let dropvalue: any = [];
        let testdropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: '', label: " --All Client--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            if (props.permission.isAdmin === true) {
                console.log();
            } else if (props.permission.isStateManager === true) {
                response = response.filter((item: any) => props?.permission?.currentUserAllCombineSites.includes(item.Id));
            }

            let dropvalue = response.flatMap((item: { ADUser: any[]; ADUserId: { [x: string]: any; }; Id: any; }) => {
                return item?.ADUser?.map((manager, index) => {
                    return {
                        value: item.ADUserId[index],
                        key: item.Id,
                        text: manager.Title,
                        label: manager.Title
                    };
                });
            });
            const filteredData = dropvalue.filter((item: any) => item !== null && item !== undefined);
            if (props.AllOption === true) {
                filteredData.push({ key: '', text: '', value: '', label: " --All Client--" });
            }
            setADUserOptions(filteredData);
        }).catch((error) => {
            console.log(error);
        });
    };


    React.useEffect(() => {
        props.provider.getCurrentUser().then(async (currentUserResponse) => {
            setCurrentUserData(currentUserResponse);
        }).catch((error) => {
        });
    }, []);

    React.useEffect(() => {
        if (!!currentUserData)
            getADUsernameList();
    }, [currentUserData]);

    return <>
        {ADUserOptions && ADUserOptions.length > 0 &&
            < ReactDropdown
                options={ADUserOptions} isMultiSelect={false}
                placeholder="Client"
                defaultOption={defaultADUser || props?.selectedADUser}
                onChange={_onADUserChange}
            />
        }
    </>;
};