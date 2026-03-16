// import * as React from "react";
// import Select from 'react-select';
// import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
// import { ListNames } from "../defaultValues";
// import { GetSortOrder } from "../CommonMethods";

// interface IEmployeeStatusFilterProps {
//     selectedEmployeeStatus: any;
//     onEmployeeStatusChange: (EmployeeStatus: any) => void;
//     provider: IDataProvider;
//     filterOption?: any
// }



// export const EmployeeStatusFilter: React.FunctionComponent<IEmployeeStatusFilterProps> = (props: IEmployeeStatusFilterProps): React.ReactElement => {
//     const [EmployeeStatusOptions, setEmployeeStatusOptions] = React.useState<any[]>([]);

//     // const optionsEmployeeStatus = [
//     //     { value: 'Confirm', label: 'Confirm' },
//     //     { value: 'Probation', label: 'Probation' },
//     //     { value: 'Probation Extended', label: 'Probation Extended' },
//     //     { value: 'Notice', label: 'Notice' },
//     //     { value: 'Terminated', label: 'Terminated' },
//     // ];

//     const _onEmployeeStatusFilterChange = (item: any): void => {
//         props.onEmployeeStatusChange(item as any);
//     };

//     const getDepartmentNameList = () => {
//         let EmployeeStatusOptions;
//         props.provider.choiceOption(ListNames.Employee, 'Employee Status').then((response) => {
//             EmployeeStatusOptions = response.map((status: any) => {
//                 return { value: status, label: status };
//             }).sort(GetSortOrder("label"));
//             setEmployeeStatusOptions(EmployeeStatusOptions);
//         }).catch(err => console.log(err));
//     };


//     React.useEffect(() => {
//         getDepartmentNameList();
//     }, []);

//     return <>
//         <Select
//             placeholder="Select Employee Status"
//             value={props.selectedEmployeeStatus || []}
//             onChange={(e) => _onEmployeeStatusFilterChange(e)}
//             options={!!props.filterOption ? EmployeeStatusOptions.filter((res: any) => res.value != props.filterOption) : EmployeeStatusOptions}
//         />
//     </>;
// };