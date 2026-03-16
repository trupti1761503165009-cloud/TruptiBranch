import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IAssetCategoryFilterProps {
    selectedAssetCategory: number;
    onAssetCategoryChange: (AssetCategoryId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const AssetCategoryFilter: React.FunctionComponent<IAssetCategoryFilterProps> = (props: IAssetCategoryFilterProps): React.ReactElement => {

    const _onAssetCategoryChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onAssetCategoryChange(option.text as string);
    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Asset Category--" });
        }
        props.provider.choiceOption(ListNames.AssetMaster, "AssetCategory").then((response) => {
            response.map((value: any) => {
                dropvalue.push({ value: value, key: value, text: value, label: value });
            });
            setOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getOptionList();
    }, []);

    return <>
        <ReactDropdown
            options={Options}
            isMultiSelect={false}
            placeholder="Asset Category"
            defaultOption={props.defaultOption}
            onChange={_onAssetCategoryChange}
        />
    </>;
};