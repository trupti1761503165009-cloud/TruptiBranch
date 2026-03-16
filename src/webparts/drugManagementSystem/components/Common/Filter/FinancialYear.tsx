import * as React from "react";
import IPnPQueryOptions from "../../../../Service/models/IPnPQueryOptions";
import { ListNames } from "../../../../Shared/Enum/ListNames";
import { IDataProvider } from "../../../../Service/models/IDataProvider";
import ReactDropdown from "../ReactSelectDropdown";

interface IFinancialFilterProps {
    selectedFinancial: number;
    onFinancialChange: (FinancialId: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    AllOption?: boolean;
    isClearable?: boolean;
    placeholder?: string;
    employeeLocationId: number;
}

export const FinancialFilter: React.FunctionComponent<IFinancialFilterProps> = (props: IFinancialFilterProps): React.ReactElement => {
    const [FinancialOptions, setFinancialOptions] = React.useState<any[]>([]);
    const [defaultFinancial, setDefaultFinancial] = React.useState<any>();

    const _onFinancialChange = (item: any): void => {
        props.onFinancialChange(item);
        setDefaultFinancial(item?.value);
    };

    // Helper function to get month abbreviation
    const getMonthAbbreviation = (monthIndex: number): string => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[monthIndex];
    };

    const getFinancialYearList = (locationId: number): void => {
        const select = ["Id,Title,FinancialStartDate,FinancialEndDate,Location/Id,Location/LocationName"];
        const expand = ["Location"];
        const filter = `LocationId eq '${locationId}'`;
        //const orderBy = 'FinancialEndDate desc';
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            filter: filter,
            expand: expand,
            //orderBy: orderBy,
            listName: ListNames.FinancialYear
        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ value: '', label: "--All--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.sort((a: any, b: any) => {
                const endDateA = new Date(a.FinancialEndDate);
                const endDateB = new Date(b.FinancialEndDate);
                return endDateB.getTime() - endDateA.getTime();
            });

            response.forEach((Financial: any) => {
                const startDate = new Date(Financial.FinancialStartDate);
                const endDate = new Date(Financial.FinancialEndDate);
                const label = `${getMonthAbbreviation(startDate.getMonth())} ${startDate.getDate()} ${startDate.getFullYear()} To ${getMonthAbbreviation(endDate.getMonth())} ${endDate.getDate()} ${endDate.getFullYear()}`;
                dropvalue.push({ value: Financial.Id, label: label });
            });


            setFinancialOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getFinancialYearList(props.employeeLocationId);
    }, []);

    return <>
        {FinancialOptions &&
            <ReactDropdown
                options={FinancialOptions || []}
                placeholder={props?.placeholder || "Select  Financial Year"}
                isMultiSelect={false}
                isClearable={props.isClearable}
                defaultOption={defaultFinancial || props?.selectedFinancial}
                onChange={async (option) => {
                    // onLeaveTypeChange(option?.value);
                    await _onFinancialChange(option);
                }}
                isSorted={true}
                name={"Employee"} />
        }
    </>;
};