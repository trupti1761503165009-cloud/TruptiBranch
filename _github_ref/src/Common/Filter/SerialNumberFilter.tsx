import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ILoginUserRoleDetails } from "../../Interfaces/ILoginUserRoleDetails";

interface ISerialNumberFilterProps {
    selectedSerialNumber: number;
    onSerialNumberChange: (serialNumber: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    siteNameId?: any;
    AllOption?: boolean;
    loginUserRoleDetails?: ILoginUserRoleDetails;
    isAdmin: boolean;
     defaultSelectedSitesId: any;
}

export const SerialNumberFilter: React.FunctionComponent<ISerialNumberFilterProps> = (props: ISerialNumberFilterProps): React.ReactElement => {
    const [serialNumberOptions, setSerialNumberOptions] = React.useState<IDropdownOption[]>();
    const [defaultSerialNumber, setDefaultSerialNumber] = React.useState<any>();
   

    const _onSerialNumberChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onSerialNumberChange(option as any);
        setDefaultSerialNumber(option.value);
    };

    const getSerialNumbernameList = (): void => {
        const select = ["Id,Title,SerialNumber,SiteNameId"];
        let filter;
        // if (props?.isAdmin === true) {
        //     filter = "IsDeleted ne 1";
        // } else {
        //     if (props?.loginUserRoleDetails?.isStateManager) {
        //         filter = "IsDeleted ne 1";
        //     } else {
        //         if (!!props?.siteNameId && props?.siteNameId != 0) {
        //             filter = `SiteNameId eq ${props.siteNameId} and IsDeleted ne 1`;
        //         } else {
        //             filter = "IsDeleted ne 1";
        //         }
        //     }
        // }
         if (!(props?.isAdmin || props?.loginUserRoleDetails?.isStateManager)) {
            const ids = props?.defaultSelectedSitesId;
            if (ids && ids?.length > 0) {
                const idFilters = ids.map((id: any) => `SiteNameId eq ${id}`).join(" or ");
                filter = `(${idFilters}) and IsDeleted ne 1`;
            }
        }else{
             const ids = props?.defaultSelectedSitesId;
            if (ids && ids?.length > 0) {
                const idFilters = ids.map((id: any) => `SiteNameId eq ${id}`).join(" or ");
                filter = `(${idFilters}) and IsDeleted ne 1`;
            }
        }
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            filter: filter,
            listName: ListNames.AssetMaster
        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: "All", label: " --All Serial Number--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            if (props?.loginUserRoleDetails?.isStateManager && !props?.loginUserRoleDetails?.isAdmin) {
                let filteredData = response.filter((item: any) => props?.loginUserRoleDetails?.stateManagerSitesItemIds.includes(item.SiteNameId));
                filteredData.map((SerialNumber: any) => {
                    dropvalue.push({ value: SerialNumber.Id, key: SerialNumber.Id, text: SerialNumber.SerialNumber, label: SerialNumber.SerialNumber });
                });
            } else {
                response.map((SerialNumber: any) => {
                    dropvalue.push({ value: SerialNumber.Id, key: SerialNumber.Id, text: SerialNumber.SerialNumber, label: SerialNumber.SerialNumber });
                });
            }

            setSerialNumberOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getSerialNumbernameList();
    }, [props?.isAdmin, props?.defaultSelectedSitesId]);

    return <>
        {serialNumberOptions &&
            <ReactDropdown
                options={serialNumberOptions} isMultiSelect={false}
                placeholder="Serial Number"
                defaultOption={defaultSerialNumber}
                onChange={_onSerialNumberChange}
            />
        }
    </>;
};