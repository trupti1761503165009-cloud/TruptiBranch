import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../DataProvider/Interface/IPnPQueryOptions";
import CamlBuilder from "camljs";
import { FieldType, ICamlQueryFilter, LogicalType } from "../Constants/DocumentConstants";
import { getCAMLQueryFilterExpression } from "../Util";

interface IEmailFilterProps {
    selectedEmail: number;
    onEmailChange: (EmailId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const EmailFilter: React.FunctionComponent<IEmailFilterProps> = (props: IEmailFilterProps): React.ReactElement => {
    const _onEmailChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onEmailChange(option.text as string);
    };
    const [EmailOptions, setEmailOptions] = React.useState<any>();

    const getEmailList = async (): Promise<void> => {
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
            results.forEach((Email: any) => {
                if (Email.Email && Email.Email.trim() !== "") {
                    dropvalue.push({
                        value: Email.Email,
                        key: Email.Email,
                        text: Email.Email,
                        label: Email.Email,
                    });
                }
            });
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Email--" });
            setEmailOptions(dropvalue);
        }
    };


    React.useEffect(() => {
        getEmailList();
    }, []);

    return <>
        <ReactDropdown
            options={EmailOptions} isMultiSelect={false}
            placeholder="Email"
            defaultOption={props.defaultOption}
            onChange={_onEmailChange}
        />
    </>;
};