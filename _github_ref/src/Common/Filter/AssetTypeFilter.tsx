import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IAssetTypeFilterProps {
    selectedAssetType: number;
    onAssetTypeChange: (assetTypeId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    listName?: any;
    isDisable?: boolean
}

export const AssetTypeFilter: React.FunctionComponent<IAssetTypeFilterProps> = (props: IAssetTypeFilterProps): React.ReactElement => {

    const _onAssetTypeChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onAssetTypeChange(option.text as string);
    };

    const [assetTypeOptions, setAssetTypeOptions] = React.useState<any>();

    const getAssetTypeList = (): void => {
        let dropvalue: any = [];
        // Check if AllOption is true and add 'All' option
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Asset Type--" });
        }
        props.provider.choiceOption(props.listName ? props.listName : ListNames.AssetMaster, "AssetType").then((response) => {
            response.map((AssetType: any) => {
                dropvalue.push({ value: AssetType, key: AssetType, text: AssetType, label: AssetType });
            });
            // Check if defaultOption is not null and not already in dropvalue
            if (props.defaultOption && !dropvalue.some((item: any) => item.value === props.defaultOption)) {
                dropvalue.push({
                    value: props.defaultOption,
                    key: props.defaultOption,
                    text: props.defaultOption,
                    label: props.defaultOption
                });
            }
            setAssetTypeOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };


    React.useEffect(() => {
        getAssetTypeList();
    }, []);

    // const optionAssetType: any[] = [
    //     { value: 'All', key: '', text: '', label: 'All' },
    //     { value: 'Smartphone', key: 'Smartphone', text: 'Smartphone', label: 'Smartphone' },
    //     { value: 'Laptop', key: 'Laptop', text: 'Laptop', label: 'Laptop' },
    //     { value: 'Tablet', key: 'Tablet', text: 'Tablet', label: 'Tablet ' },
    //     { value: 'Printer', key: 'Printer', text: 'Printer', label: 'Printer' },
    //     { value: 'Accessory', key: 'Accessory', text: 'Accessory', label: 'Accessory ' },
    // ];

    return <>
        <ReactDropdown
            options={assetTypeOptions} isMultiSelect={false}
            placeholder="Asset Type"
            defaultOption={props.defaultOption}
            onChange={_onAssetTypeChange}
            isDisabled={props.isDisable ? props.isDisable : false}
        />
    </>;
};