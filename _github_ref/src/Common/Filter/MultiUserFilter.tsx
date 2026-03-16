import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../jotai/appGlobalStateAtom";

interface IADUserFilterProps {
    selectedADUser: number[]; // Updated to an array for multi-select
    onADUserChange: (ADUserIds: number[]) => void; // Updated to handle an array of selected values
    provider: IDataProvider;
    isRequired?: boolean;
    AllOption?: boolean;
    permission?: any;
}

export const MultiUserFilter: React.FunctionComponent<IADUserFilterProps> = (props: IADUserFilterProps): React.ReactElement => {
    const [ADUserOptions, setADUserOptions] = React.useState<IDropdownOption[]>([]);
    const [defaultADUsers, setDefaultADUsers] = React.useState<any[]>(props.selectedADUser || []);
    const [currentUserData, setCurrentUserData] = React.useState<any>();
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { isClientView, siteId } = appGlobalState;

    const _onADUserChange = (selectedOptions: any[], actionMeta: ActionMeta<any>): void => {
        const selectedValues = selectedOptions?.map((option) => option.value) || [];
        props.onADUserChange(selectedValues); // Pass selected values to parent
        setDefaultADUsers(selectedValues); // Update state
    };

    const getADUsernameList = (): void => {
        let filter = "";
        if (props.permission.isAdmin === true) {
            filter = "";
        } else if (props.permission.isStateManager === true) {
            filter = "";
        } else if (props.permission.isShowOnlyChairPerson === true && props?.permission?.whsChairpersonsStateId?.length > 0) {

            let filterString = props?.permission?.whsChairpersonsStateId.map((i: any) => `(QCStateId eq '${i}')`);
            filter = filterString.join(' or ')


        } else {
            filter = (isClientView && siteId) ? `Id eq ${siteId}` : `(SiteManagerId eq '${currentUserData.Id}') or (ADUserId eq  '${currentUserData.Id}') or (SiteSupervisorId eq '${currentUserData.Id}')`;
        }
        const select = ["Id,ADUserId,ADUser/Title"];
        const expand = ["ADUser"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            expand: expand,
            filter: filter,
            listName: ListNames.SitesMaster,
        };

        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: '', label: " --All Client--" });
        }

        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            if (props.permission.isAdmin === true) {
                console.log();
            } else if (props.permission.isStateManager === true) {
                response = response.filter((item: any) => props?.permission?.currentUserAllCombineSites.includes(item.Id));
            }

            const dropvalue = response.flatMap((item: { ADUser: any[]; ADUserId: { [x: string]: any; }; Id: any; }) => {
                return item?.ADUser?.map((manager, index) => {
                    return {
                        value: item.ADUserId[index],
                        key: item.Id,
                        text: manager.Title,
                        label: manager.Title,
                    };
                });
            });

            const filteredData = dropvalue.filter((item: any) => item !== null && item !== undefined);

            setADUserOptions(filteredData);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        props.provider.getCurrentUser().then((currentUserResponse) => {
            setCurrentUserData(currentUserResponse);
        }).catch((error) => {
            console.error(error);
        });
    }, []);

    React.useEffect(() => {
        if (!!currentUserData) getADUsernameList();
    }, [currentUserData]);

    return (
        <>
            {ADUserOptions && ADUserOptions.length > 0 && (
                <ReactDropdown
                    options={ADUserOptions}
                    isMultiSelect={true}
                    placeholder="Select Clients"
                    defaultOption={defaultADUsers || props?.selectedADUser}
                    onChange={_onADUserChange}
                    isCloseMenuOnSelect={false}
                />
            )}
        </>
    );
};
