import * as React from "react";
import { IDropdownOption } from "@fluentui/react";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IStatusFilterProps {
    selectedStatus: string;
    onStatusChange: (status: string) => void;
    reset?: boolean;
}

export const InspectionStatusFilter: React.FunctionComponent<IStatusFilterProps> = (
    props: IStatusFilterProps
): React.ReactElement => {
    const [statusOptions, setStatusOptions] = React.useState<IDropdownOption[]>([]);
    const [defaultStatus, setDefaultStatus] = React.useState<string>("All");

    const _onStatusChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onStatusChange(option?.value || "");
        setDefaultStatus(option?.value || "");
    };

    React.useEffect(() => {
        const options: any[] = [
            { key: "All", text: "All", value: "All", label: "--All--" },
            { key: "Completed", text: "Completed", value: "Completed", label: "Completed" },
            { key: "Incomplete", text: "Incomplete", value: "Incomplete", label: "Incomplete" },
        ];
        setStatusOptions(options);
        props.onStatusChange("All");
    }, []);

    React.useEffect(() => {
        if (props.reset) {
            setDefaultStatus("All");
            props.onStatusChange("All");
        }
    }, [props.reset]);

    return (
        <>
            {statusOptions && (
                <ReactDropdown
                    options={statusOptions}
                    isMultiSelect={false}
                    placeholder="Status"
                    defaultOption={defaultStatus}
                    onChange={_onStatusChange}
                    isSorted={false}
                />
            )}
        </>
    );
};
