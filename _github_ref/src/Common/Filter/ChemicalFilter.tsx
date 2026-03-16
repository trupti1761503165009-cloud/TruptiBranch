import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { getSiteGroupsPermission } from "../Util";

interface IChemicalFilterProps {
    selectedChemical: number;
    onChemicalChange: (chemical: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    siteNameId?: any;
    AllOption?: boolean;
}

export const ChemicalFilter: React.FunctionComponent<IChemicalFilterProps> = (props: IChemicalFilterProps): React.ReactElement => {
    const [chemicalOptions, setChemicalOptions] = React.useState<IDropdownOption[]>();
    const [defaultChemical, setDefaultChemical] = React.useState<any>();
    const [isAdmin, setisAdmin] = React.useState<boolean>(false);
    const [currentUserData, setCurrentUserData] = React.useState<any>();

    const _onChemicalChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onChemicalChange(option as any);
        setDefaultChemical(option.value);
    };

    const getChemicalnameList = (): void => {
        const select = ["Id,Title"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            filter: `IsDeleted ne 1`,
            listName: ListNames.ChemicalRegistration
        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Chemical--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((Chemical: any) => {
                dropvalue.push({ value: Chemical.Id, key: Chemical.Id, text: Chemical.Title, label: Chemical.Title });
            });
            setChemicalOptions(dropvalue);
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
        getChemicalnameList();
    }, [currentUserData]);

    return <>
        {chemicalOptions &&
            <ReactDropdown
                options={chemicalOptions} isMultiSelect={false}
                placeholder="Chemical"
                defaultOption={defaultChemical}
                onChange={_onChemicalChange}
            />
        }
    </>;
};