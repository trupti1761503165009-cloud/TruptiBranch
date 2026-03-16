import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../DataProvider/Interface/IPnPQueryOptions";
import CamlBuilder from "camljs";
import { FieldType, ICamlQueryFilter, LogicalType } from "../Constants/DocumentConstants";
import { getCAMLQueryFilterExpression } from "../Util";

interface ILastNameFilterProps {
    selectedLastName: number;
    onLastNameChange: (LastNameId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const LastNameFilter: React.FunctionComponent<ILastNameFilterProps> = (props: ILastNameFilterProps): React.ReactElement => {
    const _onLastNameChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onLastNameChange(option.text as string);
    };
    const [LastNameOptions, setLastNameOptions] = React.useState<any>();

    const getLastNameList = async (): Promise<void> => {
        const filterFieldsSite: ICamlQueryFilter[] = [];
        const filterFields: ICamlQueryFilter[] = [
            {
                fieldName: "IsDeleted",
                fieldValue: true,
                fieldType: FieldType.Boolean,
                LogicalType: LogicalType.NotEqualTo
            },
            {
                fieldName: "Inactive",
                fieldValue: true,
                fieldType: FieldType.Boolean,
                LogicalType: LogicalType.NotEqualTo
            }
        ];
        const camlQuery = new CamlBuilder()
            .View(["ID",
                "FirstName",
                "LastName",
                "Email",
                "Phone",
                "IsDeleted"
            ])
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(5000, true)
            .Query();
        const siteFilter: any[] = getCAMLQueryFilterExpression([...filterFieldsSite, ...filterFields]);
        camlQuery.Where().All(siteFilter);
        let finalQuery = camlQuery.ToString();
        const pnpQueryOptions: IPnPCAMLQueryOptions = {
            listName: ListNames.QuaycleanEmployee,
            queryXML: finalQuery,
            pageToken: "",
            pageLength: 100000
        }

        const localResponse = await props.provider.getItemsInBatchByCAMLQuery(pnpQueryOptions);
        const results = localResponse?.Row;
        if (!!results) {
            const dropvalue: any[] = [];
            results.forEach((LastName: any) => {
                if (LastName.LastName && LastName.LastName.trim() !== "") {
                    dropvalue.push({
                        value: LastName.LastName,
                        key: LastName.LastName,
                        text: LastName.LastName,
                        label: LastName.LastName
                    });
                }
            });
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Last name--" });
            setLastNameOptions(dropvalue);
        }
    };


    React.useEffect(() => {
        getLastNameList();
    }, []);

    return <>
        <ReactDropdown
            options={LastNameOptions} isMultiSelect={false}
            placeholder="Last Name"
            defaultOption={props.defaultOption}
            onChange={_onLastNameChange}
        />
    </>;
};