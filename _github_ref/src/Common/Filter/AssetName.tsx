import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { getSiteGroupsPermission } from "../Util";
import { ILoginUserRoleDetails } from "../../Interfaces/ILoginUserRoleDetails";

interface IAssetNameFilterProps {
    selectedAssetName: number[];
    onAssetNameChange: (assetNames: any[]) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    siteNameId?: any;
    AllOption: boolean;
    loginUserRoleDetails?: ILoginUserRoleDetails;
    isAdmin: boolean;
    defaultSelectedSitesId: any;
}

export const AssetNameFilter: React.FunctionComponent<IAssetNameFilterProps> = (props: IAssetNameFilterProps): React.ReactElement => {
    const [assetNameOptions, setAssetNameOptions] = React.useState<IDropdownOption[]>([]);
    const [selectedAssets, setSelectedAssets] = React.useState<any[]>([]);

    const _onAssetNameChange = (selectedOptions: any[], actionMeta: ActionMeta<any>): void => {
        setSelectedAssets(selectedOptions.map(opt => opt.value));
        props.onAssetNameChange(selectedOptions);
    };

    const getAssetNameList = (): void => {
        const select = ["Id,Title,SiteNameId"];
        let filter = "IsDeleted ne 1";

        if (!(props?.isAdmin || props?.loginUserRoleDetails?.isStateManager)) {
            const ids = props.defaultSelectedSitesId;
            if (ids && ids.length > 0) {
                const idFilters = ids.map((id: any) => `SiteNameId eq ${id}`).join(" or ");
                filter = `(${idFilters}) and IsDeleted ne 1`;
            }
        }else{
             const ids = props.defaultSelectedSitesId;
            if (ids && ids.length > 0) {
                const idFilters = ids.map((id: any) => `SiteNameId eq ${id}`).join(" or ");
                filter = `(${idFilters}) and IsDeleted ne 1`;
            }
        }

        const queryStringOptions: IPnPQueryOptions = {
            select,
            filter,
            listName: ListNames.AssetMaster
        };
        // let dropvalue: any[] = props.AllOption ? [{ key: '', text: '', value: '', label: " --All Asset--" }] : [];
        let dropvalue: any[] = [];
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.forEach((AssetName: any) => {
                dropvalue.push({ value: AssetName.Id, key: AssetName.Id, text: AssetName?.Title?.toString().trim(), label: AssetName?.Title?.toString().trim() });
            });
            setAssetNameOptions(dropvalue);
        }).catch(console.error);
    };



    React.useEffect(() => {
        getAssetNameList();
    }, [props?.isAdmin, props?.defaultSelectedSitesId]);

    return (
        <>
            {/* {assetNameOptions.length > 0 && ( */}
            <ReactDropdown
                options={assetNameOptions}
                isMultiSelect={true}
                placeholder="Select Assets"
                defaultOption={selectedAssets}
                onChange={_onAssetNameChange}
            />
            {/* )} */}
        </>
    );
};
