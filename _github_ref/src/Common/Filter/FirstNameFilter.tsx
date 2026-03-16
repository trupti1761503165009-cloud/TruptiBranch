import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../DataProvider/Interface/IPnPQueryOptions";
import CamlBuilder from "camljs";
import { FieldType, ICamlQueryFilter, LogicalType } from "../Constants/DocumentConstants";
import { getCAMLQueryFilterExpression } from "../Util";

interface IFirstNameFilterProps {
    selectedFirstName: number;
    onFirstNameChange: (FirstNameId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const FirstNameFilter: React.FunctionComponent<IFirstNameFilterProps> = (props: IFirstNameFilterProps): React.ReactElement => {
    const _onFirstNameChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onFirstNameChange(option.text as string);
    };
    const [FirstNameOptions, setFirstNameOptions] = React.useState<any>();

    const getFirstNameList = async (): Promise<void> => {
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
            const results = localResponse?.Row;
            results.forEach((FirstName: any) => {
                dropvalue.push({ value: FirstName.FirstName, key: FirstName.FirstName, text: FirstName.FirstName, label: FirstName.FirstName });
            });
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All First name--" });
            setFirstNameOptions(dropvalue);
        }
    };


    React.useEffect(() => {
        getFirstNameList();
    }, []);

    return <>
        <ReactDropdown
            options={FirstNameOptions} isMultiSelect={false}
            placeholder="First Name"
            defaultOption={props.defaultOption}
            onChange={_onFirstNameChange}
        />
    </>;
};