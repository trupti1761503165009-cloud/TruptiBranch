import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { getSiteGroupsPermission } from "../Util";
import { ILoginUserRoleDetails } from "../../Interfaces/ILoginUserRoleDetails";

interface IAssetLocationFilterProps {
    selectedAssetLocation: number;
    onAssetLocationChange: (AssetLocation: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    siteNameId?: any;
    AllOption?: boolean;
    loginUserRoleDetails?: ILoginUserRoleDetails;
    isAdmin: boolean;
    defaultSelectedSitesId: any;
}

export const AssetLocationFilter: React.FunctionComponent<IAssetLocationFilterProps> = (props: IAssetLocationFilterProps): React.ReactElement => {
    const [AssetLocationOptions, setAssetLocationOptions] = React.useState<IDropdownOption[]>();
    const [defaultAssetLocation, setDefaultAssetLocation] = React.useState<any>();


    const _onAssetLocationChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onAssetLocationChange(option as any);
        setDefaultAssetLocation(option.value);
    };

    const getAssetLocationnameList = (): void => {
        const select = ["Id,Title,AssetCategory,SiteNameId"];
        let filter;
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
        // if (props?.isAdmin === true) {
        //     if (props?.siteNameId != 0) {
        //         filter = `SiteNameId eq ${props.siteNameId} and IsDeleted ne 1`;
        //     } else {
        //         filter = "IsDeleted ne 1";
        //     }
        // } else {
        //     if (props?.loginUserRoleDetails?.isStateManager) {
        //         if (!!props?.siteNameId && props?.siteNameId != 0) {
        //             filter = `SiteNameId eq ${props.siteNameId} and IsDeleted ne 1`;
        //         } else {
        //             filter = "IsDeleted ne 1";
        //         }
        //     } else {
        //         if (!!props?.siteNameId && props?.siteNameId != 0) {
        //             filter = `SiteNameId eq ${props.siteNameId} and IsDeleted ne 1`;
        //         } else {
        //             filter = "IsDeleted ne 1";
        //         }
        //     }
        // }
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            filter: filter,
            listName: ListNames.AssetMaster
        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: "All", label: " --All Asset Location--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            if (props?.loginUserRoleDetails?.isStateManager && !props?.loginUserRoleDetails?.isAdmin) {
                let filteredData = response.filter((item: any) =>
                    props?.loginUserRoleDetails?.stateManagerSitesItemIds.includes(item.SiteNameId)
                );

                filteredData.forEach((AssetLocation: any) => {
                    if (AssetLocation.AssetCategory) { // Check if AssetCategory is not null or blank
                        dropvalue.push({
                            value: AssetLocation.Id,
                            key: AssetLocation.Id,
                            text: AssetLocation.AssetCategory,
                            label: AssetLocation.AssetCategory
                        });
                    }
                });
            } else {
                response.forEach((AssetLocation: any) => {
                    if (AssetLocation.AssetCategory) { // Check if AssetCategory is not null or blank
                        dropvalue.push({
                            value: AssetLocation.Id,
                            key: AssetLocation.Id,
                            text: AssetLocation.AssetCategory,
                            label: AssetLocation.AssetCategory
                        });
                    }
                });
            }
            setAssetLocationOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });

    };



    React.useEffect(() => {
        getAssetLocationnameList();
    }, [props?.isAdmin, props?.defaultSelectedSitesId]);

    return <>
        {AssetLocationOptions &&
            <ReactDropdown
                options={AssetLocationOptions} isMultiSelect={false}
                placeholder="Asset Location"
                defaultOption={defaultAssetLocation}
                onChange={_onAssetLocationChange}
            />
        }
    </>;
};