import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ILoginUserRoleDetails } from "../../Interfaces/ILoginUserRoleDetails";
import { ListNames } from "../Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";

interface IManufacturerFilterProps {
    selectedManufacturer: number;
    onManufacturerChange: (manufacturer: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
    siteNameId?: any;
    loginUserRoleDetails?: ILoginUserRoleDetails;
    isDisable?: boolean;
    isAdmin: boolean;
    defaultSelectedSitesId: any;
}

export const ManufacturerFilter: React.FunctionComponent<IManufacturerFilterProps> = (props: IManufacturerFilterProps): React.ReactElement => {
    const [manufacturerOptions, setManufacturerOptions] = React.useState<IDropdownOption[]>();
    const [defaultManufacturer, setDefaultManufacturer] = React.useState<any>();


    const _onManufacturerChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onManufacturerChange(option as any);
        setDefaultManufacturer(option.value);
    };
    const getManufacturernameList = (): void => {
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

        const select = ["Id,Manufacturer,SiteNameId"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            filter: filter,
            // filter: !!props.siteNameId ? `SiteNameId eq '${props.siteNameId}' and IsDeleted ne 1` : `IsDeleted ne 1`,
            listName: ListNames.AssetMaster
        };
        let dropvalue: any = [];

        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: '', label: " --All Manufacturer--" });
        }

        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((optionValue: any) => {
                dropvalue.push({ value: optionValue.Manufacturer, key: optionValue.Manufacturer, text: optionValue.Manufacturer, label: optionValue.Manufacturer });
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

            setManufacturerOptions(dropvalue);

        }).catch((error) => {
            console.log(error);
        });
    };


    React.useEffect(() => {
        getManufacturernameList();
    }, [props?.defaultSelectedSitesId]);

    return <>
        {manufacturerOptions &&
            <ReactDropdown
                options={manufacturerOptions}
                isMultiSelect={false}
                placeholder="Manufacturer"
                defaultOption={!!defaultManufacturer ? defaultManufacturer : props.defaultOption}
                onChange={_onManufacturerChange}
                isDisabled={props.isDisable ? props.isDisable : false}
            />
        }
    </>;
};