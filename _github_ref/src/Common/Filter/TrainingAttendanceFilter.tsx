import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ILoginUserRoleDetails } from "../../Interfaces/ILoginUserRoleDetails";

interface ITrainingAttendanceFilterProps {
    selectedTrainingAttendance: number;
    onTrainingAttendanceChange: (TrainingAttendance: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    siteNameId?: any;
    AllOption: boolean;
    loginUserRoleDetails?: ILoginUserRoleDetails;
    qCState?: any;
    defaultOption?: any;
}

export const TrainingAttendanceFilter: React.FunctionComponent<ITrainingAttendanceFilterProps> = (props: ITrainingAttendanceFilterProps): React.ReactElement => {
    const [TrainingAttendanceOptions, setTrainingAttendanceOptions] = React.useState<IDropdownOption[]>();
    const [defaultTrainingAttendance, setDefaultTrainingAttendance] = React.useState<any>();

    const _onTrainingAttendanceChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onTrainingAttendanceChange(option as any);
        setDefaultTrainingAttendance(option.value);
    };

    const getEmployeenameList = (): void => {
        const select = ["Id,FirstName,LastName,StateId,State/Title"];
        const expand = ["State"];
        const filter = !!props.qCState ? `StateId eq ${props.qCState} and IsDeleted ne 1 and Inactive ne 1` : `IsDeleted ne 1 and Inactive ne 1`;
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            expand: expand,
            filter: filter,
            listName: ListNames.QuaycleanEmployee
        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Operator--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((Employee: any) => {
                let FullName = Employee.FirstName + " " + Employee.LastName;
                dropvalue.push({ value: Employee.Id, key: Employee.Id, text: FullName, label: FullName });
            });
            setTrainingAttendanceOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getEmployeenameList();
    }, [props.qCState]);

    return <>
        {TrainingAttendanceOptions &&
            <ReactDropdown
                options={TrainingAttendanceOptions} isMultiSelect={false}
                placeholder="Training Attendees"
                defaultOption={props.defaultOption}
                onChange={_onTrainingAttendanceChange}
            />
        }
    </>;
};