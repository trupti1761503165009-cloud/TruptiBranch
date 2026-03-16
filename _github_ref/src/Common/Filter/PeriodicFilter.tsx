import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IPeriodicFilterProps {
    selectedPeriodic: number;
    onPeriodicChange: (periodic: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    AllOption?: boolean;
    SiteNameId?: number;
}

export const PeriodicFilter: React.FunctionComponent<IPeriodicFilterProps> = (props: IPeriodicFilterProps): React.ReactElement => {
    const [periodicOptions, setPeriodicOptions] = React.useState<IDropdownOption[]>();
    const [defaultPeriodic, setDefaultPeriodic] = React.useState<any>();
    const _onPeriodicChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onPeriodicChange(option as any);
        setDefaultPeriodic(option.value);

    };

    const getPeriodicnameList = (): void => {
        const select = ["Id,Title"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            // filter: `IsDeleted ne 1`,
            filter: `${props.SiteNameId ? `SiteNameId eq '${props.SiteNameId}' and ` : ""}IsDeleted ne 1`,

            listName: ListNames.Periodic
        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Periodic--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((Periodic: any) => {
                dropvalue.push({ value: Periodic.Id, key: Periodic.Id, text: Periodic.Title, label: Periodic.Title });
            });
            setPeriodicOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getPeriodicnameList();
    }, []);

    return <>
        {periodicOptions &&
            <ReactDropdown
                options={periodicOptions} isMultiSelect={false}
                placeholder="Periodic"
                defaultOption={defaultPeriodic}
                onChange={_onPeriodicChange}
            />
        }
    </>;
};