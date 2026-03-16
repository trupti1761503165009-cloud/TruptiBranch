import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ILoginUserRoleDetails } from "../../Interfaces/ILoginUserRoleDetails";

interface IAssetNameFilterProps {
    selectedAssetName: number[];
    onAssetNameChange: (assetNames: any[]) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    AllOption: boolean;
    loginUserRoleDetails?: ILoginUserRoleDetails;
}

export const MasterAssetNameFilter: React.FunctionComponent<IAssetNameFilterProps> = (props: IAssetNameFilterProps): React.ReactElement => {
    const [assetNameOptions, setAssetNameOptions] = React.useState<IDropdownOption[]>([]);
    const [selectedAssets, setSelectedAssets] = React.useState<any[]>([]);

    const _onAssetNameChange = (selectedOptions: any[], actionMeta: ActionMeta<any>): void => {
        setSelectedAssets(selectedOptions.map(opt => opt.value));
        props.onAssetNameChange(selectedOptions);
    };

    // const getAssetNameList = (): void => {
    //     const select = ["Id,Title"];
    //     // let filter = "IsDeleted ne 1";

    //     const queryStringOptions: IPnPQueryOptions = {
    //         select,
    //         // filter,
    //         listName: ListNames.GlobalAssets
    //     };

    //     let dropvalue: any[] = [];

    //     props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
    //         response.forEach((AssetName: any) => {
    //             dropvalue.push({ value: AssetName.Title, key: AssetName.Title, text: AssetName?.Title?.toString()?.trim(), label: AssetName?.Title?.toString()?.trim() });
    //         });
    //         setAssetNameOptions(dropvalue);
    //     }).catch(console.error);
    // };

    const getAssetNameList = (): void => {
  const select = ["Id,Title"];
  // let filter = "IsDeleted ne 1";

  const queryStringOptions: IPnPQueryOptions = {
    select,
    // filter,
    listName: ListNames.GlobalAssets
  };

  let dropvalue: any[] = [];

  props.provider.getItemsByQuery(queryStringOptions)
    .then((response: any) => {
      response.forEach((AssetName: any) => {
        const title = AssetName?.Title?.toString()?.trim();
        if (title) { // only push if title is not empty/null/whitespace
          dropvalue.push({ value: title, key: title, text: title, label: title });
        }
      });
      setAssetNameOptions(dropvalue);
    })
    .catch(console.error);
};


    React.useEffect(() => {
        getAssetNameList();
    }, []);

    return (
        <>
            {assetNameOptions.length > 0 && (
                <ReactDropdown
                    options={assetNameOptions}
                    isMultiSelect={true}
                    placeholder="Select Assets"
                    defaultOption={selectedAssets}
                    onChange={_onAssetNameChange}
                />
            )}
        </>
    );
};
