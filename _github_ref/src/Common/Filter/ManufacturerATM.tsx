import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IManufacturerATMFilterProps {
    selectedManufacturerATM: number | string | undefined;
    onOptionChange: (option: any) => void;
    defaultOption?: string;
    provider: IDataProvider;
    isRequired?: boolean;
    placeholder?: string;
    AllOption?: boolean;
}

export const ManufacturerATMFilter: React.FunctionComponent<IManufacturerATMFilterProps> = (props: IManufacturerATMFilterProps): React.ReactElement => {
    const [optionsList, setOptionsList] = React.useState<IDropdownOption[]>();
    const [defaultState, setDefaultState] = React.useState<any>(props?.selectedManufacturerATM);

    const _onOptionChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onOptionChange(option);
        setDefaultState(option?.value);
    };

    // const getListItems = (): void => {
    //     const select = ["Id,Manufacturer"];
    //     const queryStringOptions: IPnPQueryOptions = {
    //         select: select,
    //         filter: `IsDeleted ne 1`,
    //         listName: ListNames.AssetTypeMaster
    //     };
    //     let dropvalue: any = [];
    //     if (props.AllOption === true) {
    //         dropvalue.push({ key: '', text: '', value: '', label: " --All Manufacturer--" });
    //     }
    //     dropvalue.push({ key: 'Trailer', text: 'Trailer', value: 'Trailer', label: "Trailer" });
    //     props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
    //         response.forEach((State: any) => {
    //             if (State.Manufacturer) { // Check if Manufacturer is not null, undefined, or empty
    //                 dropvalue.push({ value: State.Manufacturer, key: State.Manufacturer, text: State.Manufacturer, label: State.Manufacturer });
    //             }
    //         });

    //         setOptionsList(dropvalue);
    //     }).catch((error) => {
    //         console.log(error);
    //     });
    // };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Manufacturer--" });
        }
        props.provider.choiceOption(ListNames.AssetTypeMaster, "Manufacturer").then((response) => {
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

    // React.useEffect(() => {
    //     getListItems();
    // }, []);

    return <>
        {Options &&
            <ReactDropdown
                options={Options}
                isMultiSelect={false}
                defaultOption={defaultState || props.selectedManufacturerATM}
                onChange={_onOptionChange}
                placeholder={props.placeholder || "Select Manufacturer"}
            />
        }
    </>;
};