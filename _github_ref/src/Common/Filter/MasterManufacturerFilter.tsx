import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ILoginUserRoleDetails } from "../../Interfaces/ILoginUserRoleDetails";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IManufacturerFilterProps {
    onManufacturerChange: (manufacturer: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    listName: any;
    loginUserRoleDetails?: ILoginUserRoleDetails;
    isMultiple: boolean
    isDisable?: boolean
}

export const MasterManufacturerFilter: React.FunctionComponent<IManufacturerFilterProps> = (props: IManufacturerFilterProps): React.ReactElement => {
    const [manufacturerOptions, setManufacturerOptions] = React.useState<IDropdownOption[]>();
    const [defaultManufacturer, setDefaultManufacturer] = React.useState<any>();
    // const [selectedValues, setSelectedValues] = React.useState<any>(props.defaultOption || (props.isMultiple ? [] : ""));

    // const _onManufacturerChange = (option: any, actionMeta: ActionMeta<any>): void => {
    //     props.onManufacturerChange(option as any);
    //     setDefaultManufacturer(option.value);
    // };
    // const _onManufacturerChange = (selectedOptions: any, actionMeta: ActionMeta<any>): void => {
    //     if (props.isMultiple) {
    //         setDefaultManufacturer(selectedOptions.map((opt: any) => opt.value));
    //         props.onManufacturerChange(selectedOptions);
    //     } else {
    //         props.onManufacturerChange(selectedOptions as any);
    //         setDefaultManufacturer(selectedOptions.value);
    //     }

    // };
    const _onManufacturerChange = (selected: any, actionMeta: ActionMeta<any>): void => {
        if (props.isMultiple) {
            const values = selected.map((opt: any) => opt.value);
            setDefaultManufacturer(values);
            props.onManufacturerChange(values);
        } else {
            setDefaultManufacturer(selected.value);
            props.onManufacturerChange(selected.value);
        }
    };

    const getManufacturernameList = (): void => {
        const dropValues: any[] = [];

        if (props.AllOption) {
            dropValues.push({ key: '', text: '', value: '', label: " --All Manufacturer--" });
        }

        props.provider.choiceOption(props.listName ? props.listName : ListNames.GlobalAssets, "Manufacturer")
            .then((response: string[]) => {
                const choices = (response || [])
                    .filter((manufacturer) => manufacturer?.trim() !== "")
                    .map((manufacturer) => ({
                        key: manufacturer,
                        text: manufacturer,
                        value: manufacturer,
                        label: manufacturer
                    }));

                dropValues.push(...choices);
                setManufacturerOptions(dropValues);
            }).catch((error) => {
                console.error("Error fetching Manufacturer choices:", error);
            });
    };

    React.useEffect(() => {
        getManufacturernameList();
    }, []);

    return <>
        {
            // <ReactDropdown
            //     options={manufacturerOptions}
            //     isMultiSelect={props.isMultiple ? props.isMultiple : false}
            //     placeholder="Manufacturer"
            //     defaultOption={!!defaultManufacturer ? defaultManufacturer : props.defaultOption}
            //     onChange={_onManufacturerChange}
            // />


        }
        <ReactDropdown
            options={manufacturerOptions || []}
            isMultiSelect={props.isMultiple}
            placeholder="Manufacturer"
            defaultOption={!!defaultManufacturer ? defaultManufacturer : props.defaultOption || (props.isMultiple ? [] : "")}
            onChange={_onManufacturerChange}
            isDisabled={props.isDisable ? props.isDisable : false}
        />
    </>;
};