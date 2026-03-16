import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ILoginUserRoleDetails } from "../../Interfaces/ILoginUserRoleDetails";
import { ListNames } from "../Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";

interface IManufacturerFilterProps {
    selectedManufacturer: any;
    onManufacturerChange: (manufacturer: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    siteNameId?: any;
    loginUserRoleDetails?: ILoginUserRoleDetails;
    isDisable?: boolean;
}

export const AsssetTypeManufacturerFilter: React.FunctionComponent<IManufacturerFilterProps> =
    (props): React.ReactElement => {

        const [manufacturerOptions, setManufacturerOptions] =
            React.useState<IDropdownOption[]>();

        const [defaultManufacturer, setDefaultManufacturer] =
            React.useState<any>();

        const _onManufacturerChange = (option: any, actionMeta: ActionMeta<any>): void => {
            props.onManufacturerChange(option);
            setDefaultManufacturer(option.value); // user selection
        };

        const getManufacturernameList = (): void => {
            const select = ["Id,Manufacturer,SiteNameId"];
            const queryStringOptions: IPnPQueryOptions = {
                select,
                filter: props.siteNameId
                    ? `SiteNameId eq '${props.siteNameId}' and IsDeleted ne 1`
                    : `IsDeleted ne 1`,
                listName: ListNames.AssetMaster
            };

            let dropvalue: any[] = [];

            if (props.AllOption === true) {
                dropvalue.push({
                    key: '',
                    text: '',
                    value: '',
                    label: " --All Manufacturer--"
                });
            }

            props.provider.getItemsByQuery(queryStringOptions)
                .then((response: any[]) => {
                    response.filter((x)=> x?.Manufacturer).forEach((item) => {
                        dropvalue.push({
                            value: item.Manufacturer,
                            key: item.Manufacturer,
                            text: item.Manufacturer,
                            label: item.Manufacturer
                        });
                    });

                    // ensure selected manufacturer exists in list
                    if (
                        props.selectedManufacturer &&
                        !dropvalue.some(d => d.value === props.selectedManufacturer)
                    ) {
                        dropvalue.push({
                            value: props.selectedManufacturer,
                            key: props.selectedManufacturer,
                            text: props.selectedManufacturer,
                            label: props.selectedManufacturer
                        });
                    }

                    setManufacturerOptions(dropvalue);
                })
                .catch(console.log);
        };

        // 🔥 FIX: sync dropdown when parent changes (Edit / Reset)
        React.useEffect(() => {
            setDefaultManufacturer(props.selectedManufacturer || "");
        }, [props.selectedManufacturer]);

        React.useEffect(() => {
            getManufacturernameList();
        }, []);

        return (
            <>
                {manufacturerOptions && (
                    <ReactDropdown
                        options={manufacturerOptions}
                        isMultiSelect={false}
                        placeholder="Manufacturer"
                        defaultOption={defaultManufacturer}
                        onChange={_onManufacturerChange}
                        isDisabled={props.isDisable ?? false}
                    />
                )}
            </>
        );
    };