/* eslint-disable */
import * as React from "react";
import Select from 'react-select';
import { useAtom } from "jotai";
import { appGlobalStateAtom } from "../../../../jotai/appGlobalStateAtom";
import { GroupEnum } from "../../../../Shared/constants/defaultValues";

interface IProjectManagerFilterProps {
    selectedEmployee: any;
    onEmployeeChange: (name: string, selectedOption: any) => void;
    isClearable: boolean;
    isDisabled?: boolean;
}

export const ProjectManagerFilter: React.FunctionComponent<IProjectManagerFilterProps> = (props: IProjectManagerFilterProps): React.ReactElement => {
    const [appglobalState] = useAtom(appGlobalStateAtom);
    const { currentUser, provider, UserGroups } = appglobalState;
    const [EmployeeOptions, setEmployeeOptions] = React.useState<any[]>([]);
    const [keyUpdatePM, setKeyUpdatePM] = React.useState<number>(Math.random());
    let refEmployeName = React.useRef(null);

    const _onEmployeeChange = (item: any): void => {
        if (item) {
            props.onEmployeeChange("ProjManagerId", [item]);
            refEmployeName.current = item
        } else {
            props.onEmployeeChange("ProjManagerId", []);
            props.selectedEmployee == null;
            refEmployeName.current = null;
            setKeyUpdatePM(Math.random());
        }
    };

    const getEmployeenameList = async (): Promise<void> => {
        // const select = ["Id,FirstName1,LastName,HRMSLocationId,DesignationId,Designation/DesignationName,EmployeeUserId"];
        // const expand = ["Designation"];
        // let filter = "IsActive_x003F_ eq 1";
        // const queryStringOptions: IPnPQueryOptions = {
        //     select: select,
        //     expand: expand,
        //     listName: ListNames.Employee,
        //     filter: filter,
        // };
        // let dropvalue: any =  [];
        // provider.getItemsByQuery(queryStringOptions).then((response: any) => {
        //     const validDesignations = new Set([
        //         "project manager",
        //         "chief technology officer",
        //         "director",
        //         "business development manager",
        //         "hr manager"
        //     ]);
        //     response.map((Employee: any) => {
        //         if (
        //             Employee.EmployeeUserId !== currentUser.userId &&
        //             validDesignations.has(Employee?.Designation?.DesignationName?.toLowerCase())
        //         ) {
        //             dropvalue.push({ value: Employee.Id, label: Employee.FirstName1 + " " + Employee.LastName });
        //         }
        //     });
        //     setEmployeeOptions(dropvalue);
        // }).catch((error) => {
        //     console.log(error);
        // });
        const projectManagerGroupUserIds = await provider.getUsersFromGroup(GroupEnum.ProjectManager);
        const filteredPMs = projectManagerGroupUserIds.filter((pm: any) => pm?.value != currentUser.userId);
        setEmployeeOptions(filteredPMs);
    };

    React.useEffect(() => {
        getEmployeenameList();
    }, []);

    React.useEffect(() => {
        refEmployeName.current = props.selectedEmployee
        setKeyUpdatePM(Math.random());
    }, [props.selectedEmployee]);

    return <>
        {EmployeeOptions &&
            <Select
                placeholder="Select Project Manager"
                value={refEmployeName.current || []}
                onChange={(e: any) => { _onEmployeeChange(e); }}
                options={EmployeeOptions}
                isClearable={props.isClearable}
                isMulti={false}
                key={keyUpdatePM}
                classNamePrefix="react-select"
                isDisabled={props.isDisabled}
            />
        }
    </>;
};