import * as React from "react";
import IPnPQueryOptions, {
    IPnPCAMLQueryOptions
} from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { FieldType, ICamlQueryFilter, LogicalType } from "../Constants/DocumentConstants";
import CamlBuilder from "camljs";
import { getCAMLQueryFilterExpression } from "../Util";

interface IEmployeeFilterProps {
    provider: IDataProvider;
    onEmployeeChange: (employees: any[]) => void;

    qCState?: any;
    placeholder?: string;
    isMultiSelect: boolean;
    isCloseMenuOnSelect?: boolean;

    /* ✅ IMPORTANT */
    defaultOption?: number[];          // ← IDs ONLY
    excludedEmployeeIds?: number[];
}

export const EmployeeFilter: React.FC<IEmployeeFilterProps> = (props) => {

    const [employeeOptions, setEmployeeOptions] = React.useState<any[]>([]);

    /* ================= LOAD EMPLOYEES ================= */

    const getEmployees = async (): Promise<void> => {
        const camlQuery = new CamlBuilder()
            .View(["Id", "FirstName", "LastName", "State", "IsDeleted", "Inactive"])
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(5000, true)
            .Query();

        const filters: ICamlQueryFilter[] = [
            { fieldName: "IsDeleted", fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo },
            { fieldName: "Inactive", fieldValue: true, fieldType: FieldType.Boolean, LogicalType: LogicalType.NotEqualTo }
        ];

        camlQuery.Where().All(getCAMLQueryFilterExpression(filters));

        const camlOptions: IPnPCAMLQueryOptions = {
            listName: ListNames.QuaycleanEmployee,
            queryXML: camlQuery.ToString(),
            pageLength: 100000,
            pageToken: ""
        };

        const res = await props.provider.getItemsInBatchByCAMLQuery(camlOptions);
        let rows = res?.Row || [];

        rows = rows.filter((e: any) =>
            e.State?.some((s: any) => s.lookupId === props.qCState)
        );

        let options = rows.map((e: any) => {
            const name = `${e.FirstName} ${e.LastName}`;
            return {
                value: Number(e.ID),
                key: Number(e.ID),
                label: name,
                text: name
            };
        });

        if (props.excludedEmployeeIds?.length) {
            options = options.filter(
                (o: any) => !props.excludedEmployeeIds!.includes(o.value)
            );
        }

        setEmployeeOptions(options);
    };

    React.useEffect(() => {
        if (props.qCState) getEmployees();
    }, [props.qCState, props.excludedEmployeeIds?.join(",")]);

    /* ================= CHANGE ================= */

    const handleChange = (selected: any) => {
        props.onEmployeeChange(selected || []);
    };

    return (
        <ReactDropdown
            options={employeeOptions}
            isMultiSelect={props.isMultiSelect}
            placeholder={props.placeholder ?? "Employees"}
            defaultOption={props.defaultOption}   // ✅ IDs array
            isCloseMenuOnSelect={
                props.isCloseMenuOnSelect ?? !props.isMultiSelect
            }
            onChange={handleChange}
        />
    );
};