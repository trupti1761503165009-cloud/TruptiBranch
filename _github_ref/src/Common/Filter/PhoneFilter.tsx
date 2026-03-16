import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../DataProvider/Interface/IPnPQueryOptions";
import CamlBuilder from "camljs";
import { FieldType, ICamlQueryFilter, LogicalType } from "../Constants/DocumentConstants";
import { getCAMLQueryFilterExpression } from "../Util";

interface IPhoneFilterProps {
    selectedPhone: number;
    onPhoneChange: (PhoneId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const PhoneFilter: React.FunctionComponent<IPhoneFilterProps> = (props: IPhoneFilterProps): React.ReactElement => {
    const _onPhoneChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onPhoneChange(option.text as string);
    };
    const [PhoneOptions, setPhoneOptions] = React.useState<any>();

    const formatPhoneNumber = (phone: string | number): string => {
        let digits = phone.toString().replace(/\D/g, ''); // remove non-digits

        if (digits.length === 9) {
            digits = '0' + digits; // prepend 0 if missing
        }

        if (digits.length === 10) {
            return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
        }

        return phone.toString(); // fallback to raw value
    };

    const getPhoneList = async (): Promise<void> => {
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
            results.forEach((Phone: any) => {
                if (Phone.Phone && Phone.Phone.trim() !== "") {
                    dropvalue.push({
                        value: Phone.Phone,
                        key: Phone.Phone,
                        text: Phone.Phone,
                        label: formatPhoneNumber(Phone.Phone)
                    });
                }
            });
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Phone--" });
            setPhoneOptions(dropvalue);
        }
    };


    React.useEffect(() => {
        getPhoneList();
    }, []);

    return <>
        <ReactDropdown
            options={PhoneOptions} isMultiSelect={false}
            placeholder="Phone"
            defaultOption={props.defaultOption}
            onChange={_onPhoneChange}
        />
    </>;
};