import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IAssetTypeMasterFilterProps {
    selectedAssetTypeMaster: number | string | undefined;
    onOptionChange: (option: any) => void;
    defaultOption?: string;
    provider: IDataProvider;
    isRequired?: boolean;
    placeholder?: string;
    AllOption?: boolean;
    refreshNav?: boolean;
}

export const AssetTypeMasterFilter: React.FunctionComponent<IAssetTypeMasterFilterProps> = (props: IAssetTypeMasterFilterProps): React.ReactElement => {
    const [optionsList, setOptionsList] = React.useState<IDropdownOption[]>();
    // const [defaultState, setDefaultState] = React.useState<any>();

    // const _onOptionChange = (option: any, actionMeta: ActionMeta<any>): void => {
    //     props.onOptionChange(option);
    //     setDefaultState(option?.value);
    // };

    const _onOptionChange = (option: any): void => {
        props.onOptionChange(option);
    };

    // const getListItems = (): void => {
    //     const select = ["Id,Title"];
    //     const queryStringOptions: IPnPQueryOptions = {
    //         select: select,
    //         filter: `IsDeleted ne 1`,
    //         listName: ListNames.AssetTypeMaster
    //     };
    //     let dropvalue: any = [];
    //     if (props.AllOption === true) {
    //         dropvalue.push({ key: '', text: '', value: '', label: " --All Asset Type--" });
    //     }

    //     props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
    //         response.map((State: any) => {
    //             dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
    //         });
    //         setOptionsList(dropvalue);
    //     }).catch((error) => {
    //         console.log(error);
    //     });
    // };


    const getListItems = (): void => {
        const queryStringOptions: IPnPQueryOptions = {
            select: ["Id,Title"],
            filter: `IsDeleted ne 1`,
            listName: ListNames.AssetTypeMaster
        };

        let dropvalue: any[] = [];

        if (props.AllOption) {
            dropvalue.push({ value: "", label: " --All Asset Type--" });
        }

        props.provider.getItemsByQuery(queryStringOptions).then((response: any[]) => {
            response.forEach(item => {
                dropvalue.push({
                    value: item.Id,
                    label: item.Title
                });
            });
            setOptionsList(dropvalue);
        });
    };

    React.useEffect(() => {
        getListItems();
    }, [props.refreshNav]);

    return <>
        {optionsList &&
            <ReactDropdown
                options={optionsList}
                isMultiSelect={false}
                defaultOption={props.selectedAssetTypeMaster}
                onChange={_onOptionChange}
                placeholder={props.placeholder || "Select Asset Type"}
                uniqueBy={"value"}
            />

        }
    </>;
};