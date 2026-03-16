import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IOperatorFilterProps {
    selectedOperator: number;
    onOperatorChange: (Operator: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    AllOption?: boolean;
    SiteNameId?: string;
}

export const OperatorFilter: React.FunctionComponent<IOperatorFilterProps> = (props: IOperatorFilterProps): React.ReactElement => {
    const [OperatorOptions, setOperatorOptions] = React.useState<IDropdownOption[]>();
    const [defaultOperator, setDefaultOperator] = React.useState<any>();
    const _onOperatorChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onOperatorChange(option as any);
        setDefaultOperator(option.value);

    };
    /**
     * Change Daily Operator to Machine Operator.
     * Updated by Trupti on 18/9/2025.
     */
    const getOperatornameList = (): void => {
        const select = ["Id,ATUserName"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            filter: `SiteNameId eq '${props.SiteNameId}' and OperatorType eq 'Machine Operator' and IsDeleted ne 1`,
            listName: ListNames.SitesAssociatedTeam
        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Operators--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((Operator: any) => {
                dropvalue.push({ value: Operator.Id, key: Operator.Id, text: Operator.ATUserName, label: Operator.ATUserName });
            });
            setOperatorOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getOperatornameList();
    }, []);

    return <>
        {OperatorOptions &&
            <ReactDropdown
                options={OperatorOptions} isMultiSelect={false}
                placeholder="Operator"
                defaultOption={defaultOperator}
                onChange={_onOperatorChange}
            />
        }
    </>;
};