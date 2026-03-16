import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IOwnerFilterProps {
    selectedOwner: number;
    onOwnerChange: (Owner: any) => void;
    provider: IDataProvider;
    siteNameId?: any;
    AllOption: boolean;
    reset?: boolean;
}

export const OwnerFilter: React.FunctionComponent<IOwnerFilterProps> = (props: IOwnerFilterProps): React.ReactElement => {
    const [OwnerOptions, setOwnerOptions] = React.useState<IDropdownOption[]>();
    const [defaultOwner, setDefaultOwner] = React.useState<any>();

    const _onOwnerChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onOwnerChange(option as any);
        setDefaultOwner(option.value);
    };

    const getOwnernameList = (): void => {
        const select = ["Id,Owner,SiteNameId"];
        let filter;
        if (props.siteNameId != 0) {
            filter = `SiteNameId eq ${props.siteNameId}`;
        } else {
            filter = "";
        }

        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            filter: filter,
            listName: ListNames.AuditInspectionData
        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Owner--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((Owner: any) => {
                dropvalue.push({ value: Owner.Id, key: Owner.Id, text: Owner.Owner, label: Owner.Owner });
            });
            setOwnerOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        if (props.reset) {
            setDefaultOwner("");
            props.onOwnerChange("");
        }
    }, [props.reset]);

    React.useEffect(() => {
        getOwnernameList();
    }, []);

    return <>
        {OwnerOptions &&
            <ReactDropdown
                options={OwnerOptions} isMultiSelect={false}
                placeholder="Owner"
                defaultOption={defaultOwner}
                onChange={_onOwnerChange}
            />
        }
    </>;
};