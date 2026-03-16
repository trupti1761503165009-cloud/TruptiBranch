import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { getSiteGroupsPermission } from "../Util";

interface IChemicalManufacturerFilterProps {
    selectedChemicalManufacturer: number;
    onChemicalManufacturerChange: (ChemicalManufacturer: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    siteNameId?: any;
    AllOption?: boolean;
}

export const ChemicalManufacturerFilter: React.FunctionComponent<IChemicalManufacturerFilterProps> = (props: IChemicalManufacturerFilterProps): React.ReactElement => {
    const [ChemicalManufacturerOptions, setChemicalManufacturerOptions] = React.useState<IDropdownOption[]>();
    const [defaultChemicalManufacturer, setDefaultChemicalManufacturer] = React.useState<any>();
    const [isAdmin, setisAdmin] = React.useState<boolean>(false);
    const [currentUserData, setCurrentUserData] = React.useState<any>();

    const _onChemicalManufacturerChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onChemicalManufacturerChange(option as any);
        setDefaultChemicalManufacturer(option.value);
    };

    const getChemicalManufacturernameList = (): void => {
        const select = ["Id,Manufacturer"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            filter: `IsDeleted ne 1`,
            listName: ListNames.ChemicalRegistration
        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Chemical Manufacturer--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((ChemicalManufacturer: any) => {
                dropvalue.push({ value: ChemicalManufacturer.Id, key: ChemicalManufacturer.Id, text: ChemicalManufacturer.Manufacturer, label: ChemicalManufacturer.Manufacturer });
            });
            setChemicalManufacturerOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        props.provider.getCurrentUser().then(async (currentUserResponse) => {
            let groups = await getSiteGroupsPermission(props.provider);
            setCurrentUserData(currentUserResponse);
            if (groups.filter((r: any) => r.Id == currentUserResponse.Id).length > 0) {
                setisAdmin(true);
            }
        }).catch((error) => {
            console.log(error);
        });
    }, []);

    React.useEffect(() => {
        getChemicalManufacturernameList();
    }, [currentUserData]);

    return <>
        {ChemicalManufacturerOptions &&
            <ReactDropdown
                options={ChemicalManufacturerOptions} isMultiSelect={false}
                placeholder="Manufacturer"
                defaultOption={defaultChemicalManufacturer}
                onChange={_onChemicalManufacturerChange}
            />
        }
    </>;
};