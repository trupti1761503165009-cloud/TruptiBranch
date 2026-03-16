// /* eslint-disable @typescript-eslint/no-floating-promises */
// import * as React from "react";
// import { IDataProvider } from "../../../../Service/models/IDataProvider";
// import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../../../Service/models/IPnPQueryOptions";
// import { GroupEnum, IGroupItem, IEmployeeID } from "../../../../Shared/constants/defaultValues";
// import { ListNames } from "../../../../Shared/Enum/ListNames";
// import ReactDropdown from "../ReactSelectDropdown";
// import { getBooleanValue, getmultiPeoplePickerValueCAML, getNumberValue, getPAProcessListData, getPeoplePickerValueCAML, getProjectSubmissionReportData, getStringValue } from "../Util";
// import { useAtom } from "jotai";
// import { appGlobalStateAtom } from "../../../../jotai/appGlobalStateAtom";
// import * as CamlBuilder from "camljs";
// import { PAStatus } from "../../../../Shared/Enum/PAStatus";


// interface IEmployeeFilterProps {
//     selectedEmployee: any;
//     onEmployeeChange: (name: string, selectedOption: any) => void;
//     isRequired?: boolean;
//     AllOption?: boolean;
//     isClearable?: boolean;
//     placeholder?: string;
//     isDisplayAll?: boolean;
//     isAddSelfOption?: boolean;
//     filterQuery?: string;
// }

// export const EmployeeFilter: React.FunctionComponent<IEmployeeFilterProps> = (props: IEmployeeFilterProps): React.ReactElement => {
//     const [EmployeeOptions, setEmployeeOptions] = React.useState<any[]>([]);
//     const [defaultEmployee, setDefaultEmployee] = React.useState<any>(props.selectedEmployee || null);
//     const [appglobalState] = useAtom(appGlobalStateAtom);
//     const { context, currentUser, provider, loadComponent, componentName, SPUserInfo, UserDetail, UserGroups, IsAdmin, IsHumanResource, IsProjectManager } = appglobalState;
//     const [PMMembers, setPMMembers] = React.useState<any>([]);

//     const [EmployeeDataList, setEmployeeDataList] = React.useState<any[]>([]);

//     const _onEmployeeChange = (item: any): void => {
//         props.onEmployeeChange("Employee", item);
//         setDefaultEmployee(item);
//     };
//     const getCurrentEmployeeRecord = async (): Promise<any> => {
//         try {
//             const select = ["ID", "FirstName1", "LastName", "Designation/DesignationName,EmployeeUserId"];
//             const expand = ["Designation"];
//             const filter = `IsActive_x003F_ eq 1`
//             const queryStringOptions: IPnPQueryOptions = {
//                 select,
//                 expand,
//                 top: 1,
//                 listName: ListNames.Employee,
//                 filter: filter
//             };

//             const results = await provider.getItemsByQuery(queryStringOptions);

//             if (results && results.length > 0) {
//                 return {
//                     ID: results[0].ID,
//                     FirstName: results[0].FirstName1 || "",
//                     LastName: results[0].LastName || "",
//                     EmployeeUserId: results[0].EmployeeUserId
//                 };
//             }
//         } catch (error) {
//             console.log(error);
//         }

//         return null;
//     };
//     const getEmployeenameList = async (): Promise<void> => {
//         const select = ["Id", "FirstName1", "LastName", "HRMSLocationId", "EmployeeStatus", "ProjectManagerUserId/Id"];
//         const expand = ["ProjectManagerUserId"];
//         const filter = props.filterQuery ? props.filterQuery : `IsActive_x003F_ eq 1`;

//         const queryStringOptions: IPnPQueryOptions = {
//             select: select,
//             filter: filter,
//             expand: expand,
//             listName: ListNames.ProjectSubmissionReport
//         };

//         let dropvalue: any[] = [];

//         if (props.AllOption === true) {
//             dropvalue.push({ value: '', label: "--All--", LocationId: "", EmployeeStatus: "" });
//         }

//         try {
//             const response: any[] = await provider.getItemsByQuery(queryStringOptions);

//             // Get current user's employee record
//             const employeeData = await getCurrentEmployeeRecord(); // returns { ID, Designation }
//             const employeeSPUserId = currentUser.userId;

//             const uniquePMMap: { [key: number]: any } = {};

//             response.forEach((employee: any) => {
//                 const pmUserId = employee?.ProjectManagerUserId?.Id;

//                 const shouldInclude = (
//                     (pmUserId && pmUserId === employeeSPUserId) || // current user is PM for this item
//                     IsAdmin || IsHumanResource || props.isDisplayAll
//                 );

//                 if (shouldInclude && !uniquePMMap[employee.Id]) {
//                     uniquePMMap[employee.Id] = {
//                         value: employee.Id,
//                         label: `${employee.FirstName1} ${employee.LastName}`,
//                         LocationId: employee.HRMSLocationId,
//                         EmployeeStatus: employee.EmployeeStatus
//                     };
//                 }
//             });

//             dropvalue = [...dropvalue, ...Object.keys(uniquePMMap)];
//             setEmployeeOptions(dropvalue);
//         } catch (error) {
//             console.log(error);
//         }
//     };
//     // const getProjectSubmissionReportData = async (provider: IDataProvider, CurrentUser: any): Promise<any[]> => {
//     //     try {
//     //         let allData: any[] = [];
//     //         let pageToken = "";
//     //         let isPaged: boolean = true;

//     //         const camlQuery = new CamlBuilder()
//     //             .View([
//     //                 PAFormFields.ID,
//     //                 PAFormFields.EmployeeName,
//     //                 PAFormFields.ProjManager,
//     //                 PAFormFields.ProjectName,
//     //                 PAFormFields.IsReviewed,
//     //                 PAFormFields.PAYear
//     //             ])
//     //             .Scope(CamlBuilder.ViewScope.RecursiveAll)
//     //             .Query()
//     //             .Where()
//     //             .LookupField(PAFormFields.ProjManager).Id().EqualTo(CurrentUser)
//     //             .OrderByDesc("Modified")
//     //             .ToString();

//     //         do {
//     //             const queryOptions: IPnPCAMLQueryOptions = {
//     //                 listName: ListNames.ProjectSubmissionReport,
//     //                 queryXML: camlQuery,
//     //                 pageToken
//     //             };

//     //             const localResponse = await provider.getItemsInBatchByCAMLQuery(queryOptions);

//     //             if (!!localResponse.NextHref) {
//     //                 pageToken = localResponse.NextHref.split('?')[1];
//     //             } else {
//     //                 isPaged = false;
//     //             }

//     //             allData = [...allData, ...localResponse.Row];
//     //         } while (isPaged);
//     //         let PAProcessData: any = await getPAProcessListData(provider);

//     //         // Filter for only records with EmployeeNameId and desired PAStatus
//     //         const filteredPAProcessData = PAProcessData.filter((data: any) => {
//     //             return data.EmployeeNameId == currentUser.userId && data.PAStatus // Replace "Submitted" as needed
//     //         });
//     //         return allData.map((itemObj: any) => ({
//     //             ID: getNumberValue(itemObj?.ID),
//     //             ProjManager: getmultiPeoplePickerValueCAML(itemObj?.ProjManager, 'title'),
//     //             ProjManagerId: getmultiPeoplePickerValueCAML(itemObj.ProjManager, 'id'),
//     //             EmplNameId: getPeoplePickerValueCAML(itemObj?.EmplName, "id"),
//     //             ProjectName: getStringValue(itemObj?.ProjectName),
//     //             IsReviewed: getBooleanValue(itemObj?.IsReviewed),
//     //             PAYear: getStringValue(itemObj?.PAYear),
//     //             PAStatus: filteredPAProcessData
//     //         }));
//     //     } catch (error) {
//     //         console.error("Error fetching employee list:", error);
//     //         return [];
//     //     }
//     // };
//     const getProjectSubmissionReportData = async (provider: IDataProvider, CurrentUser: any): Promise<any[]> => {
//         try {
//             let allData: any[] = [];
//             let pageToken = "";
//             let isPaged: boolean = true;

//             const camlQuery = new CamlBuilder()
//                 .View([
//                     PAFormFields.ID,
//                     PAFormFields.EmployeeName,
//                     PAFormFields.ProjManager,
//                     PAFormFields.ProjectName,
//                     PAFormFields.IsReviewed,
//                     PAFormFields.PAYear
//                 ])
//                 .Scope(CamlBuilder.ViewScope.RecursiveAll)
//                 .Query()
//                 .Where()
//                 .LookupField(PAFormFields.ProjManager).Id().EqualTo(CurrentUser)
//                 .OrderByDesc("Modified")
//                 .ToString();

//             do {
//                 const queryOptions: IPnPCAMLQueryOptions = {
//                     listName: ListNames.ProjectSubmissionReport,
//                     queryXML: camlQuery,
//                     pageToken
//                 };

//                 const localResponse = await provider.getItemsInBatchByCAMLQuery(queryOptions);

//                 if (!!localResponse.NextHref) {
//                     pageToken = localResponse.NextHref.split('?')[1];
//                 } else {
//                     isPaged = false;
//                 }

//                 allData = [...allData, ...localResponse.Row];
//             } while (isPaged);

//             // Get PAProcess data
//             let PAProcessData: any[] = await getPAProcessListData(provider);

//             // Map allData with matching PAStatus from PAProcessData
//             return allData.map((itemObj: any) => {
//                 const employeeId = getPeoplePickerValueCAML(itemObj?.EmplName, "id");
//                 const matchingPAStatus = PAProcessData
//                     .filter((data: any) => data.SPUserId == employeeId && data.PAStatus)
//                     .map((data: any) => data.PAStatus);

//                 return {
//                     ID: getNumberValue(itemObj?.ID),
//                     ProjManager: getmultiPeoplePickerValueCAML(itemObj?.ProjManager, 'title'),
//                     ProjManagerId: getmultiPeoplePickerValueCAML(itemObj.ProjManager, 'id'),
//                     EmplNameId: employeeId,
//                     ProjectName: getStringValue(itemObj?.ProjectName),
//                     IsReviewed: getBooleanValue(itemObj?.IsReviewed),
//                     PAYear: getStringValue(itemObj?.PAYear),
//                     PAStatus: matchingPAStatus[0] || null
//                 };
//             });

//         } catch (error) {
//             console.error("Error fetching employee list:", error);
//             return [];
//         }
//     };

//     const getUniqueProjectManagersForCurrentUser = async () => {
//         try {
//             let assignedEmployees: { value: string; label: string }[] = [];
//             let PAProcessData: any = getPAProcessListData(provider)
//             if (IsHumanResource) {
//                 const isAdmin = UserGroups.includes(GroupEnum.Admin);

//                 const queryOptions: IPnPQueryOptions = {
//                     listName: ListNames.Employee,
//                     select: ["ID", "FirstName1", "LastName", "EmployeeUserId"],
//                     filter: `IsActive_x003F_ eq 1`
//                 };
//                 const employeeResults = await provider.getItemsByQuery(queryOptions);

//                 const seenIds: any[] = [];
//                 assignedEmployees = employeeResults
//                     .filter((emp: any) => {
//                         if (seenIds.includes(emp.EmployeeUserId)) return false;
//                         if (!isAdmin && emp.EmployeeUserId == currentUser.userId) return false;
//                         seenIds.push(emp.EmployeeUserId);
//                         return true;
//                     })
//                     .map((emp: any) => ({
//                         value: emp.EmployeeUserId,
//                         label: `${emp.FirstName1 || ""} ${emp.LastName || ""}`.trim()
//                     }));
//             }
//             else {
//                 // For Project Managers
//                 const submissionData = await getProjectSubmissionReportData(provider, currentUser.userId);

//                 const isCurrentUserPM = submissionData.some(item =>
//                     (item.ProjManagerId || []).includes(String(currentUser.userId))
//                 );

//                 let assignedEmployeeIds: number[] = [];

//                 if (isCurrentUserPM) {
//                     assignedEmployeeIds = submissionData
//                         .filter(item => (item.ProjManagerId || []).includes(String(currentUser.userId)) && item.PAStatus != PAStatus.PAinitiated)
//                         .map(item => item.EmplNameId)
//                         .filter((id, index, self) => id && self.indexOf(id) == index);
//                 }

//                 if (assignedEmployeeIds.length > 0) {
//                     const filter = `(${assignedEmployeeIds.map(id => `EmployeeUserId eq ${id}`).join(" or ")}) and IsActive_x003F_ eq 1`;

//                     const queryOptions: IPnPQueryOptions = {
//                         listName: ListNames.Employee,
//                         select: ["ID", "FirstName1", "LastName", "EmployeeUserId"],
//                         filter
//                     };
//                     const employeeResults = await provider.getItemsByQuery(queryOptions);

//                     const seenIds: any[] = [];
//                     assignedEmployees = employeeResults
//                         .filter((emp: any) => {
//                             if (seenIds.includes(emp.EmployeeUserId)) return false;
//                             seenIds.push(emp.EmployeeUserId);
//                             return true;
//                         })
//                         .map((emp: any) => ({
//                             value: emp.EmployeeUserId,
//                             label: `${emp.FirstName1 || ""} ${emp.LastName || ""}`.trim()
//                         }));
//                 }
//             }
//             if (assignedEmployees.length > 0) {
//                 assignedEmployees.unshift({ value: '', label: "Select Employee" });
//             }

//             setEmployeeOptions(assignedEmployees);

//         } catch (error) {
//             console.error("Error loading unique project managers:", error);
//         }
//     };



//     React.useEffect(() => {
//         void (async function (): Promise<void> {
//             await getUniqueProjectManagersForCurrentUser()
//         })();
//     }, []);



//     return <>
//         {EmployeeOptions &&
//             <ReactDropdown
//                 options={EmployeeOptions || []}
//                 placeholder={props?.placeholder || "Select Employee"}
//                 isMultiSelect={false}
//                 isClearable={props.isClearable}
//                 defaultOption={props?.selectedEmployee}
//                 onChange={async (option) => {
//                     // onLeaveTypeChange(option?.value);
//                     await _onEmployeeChange(option);
//                 }} name={""} />
//         }
//     </>;
// };