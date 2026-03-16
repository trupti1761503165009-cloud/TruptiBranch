import * as React from "react";
import { IDropdownOption } from "@fluentui/react";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IArchiveFilterProps {
    selectedArchive: string;
    onArchiveChange: (status: string) => void;
    reset?: boolean;
}

export const ArchiveFilter: React.FunctionComponent<IArchiveFilterProps> = (
    props: IArchiveFilterProps
): React.ReactElement => {
    const [archiveOptions, setArchiveOptions] = React.useState<IDropdownOption[]>([]);
    const [defaultArchive, setDefaultArchive] = React.useState<string>("Active");

    const _onArchiveChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onArchiveChange(option?.value || "");
        setDefaultArchive(option?.value || "");
    };

    React.useEffect(() => {
        const options: any[] = [
            { key: "All", text: "All", value: "All", label: "--All--" },
            { key: "Active", text: "Active", value: "Active", label: "Active" },
            { key: "Archive", text: "Archive", value: "Archive", label: "Archive" },
        ];
        setArchiveOptions(options);
        props.onArchiveChange("Active");
    }, []);

    React.useEffect(() => {
        if (props.reset) {
            setDefaultArchive("Active");
            props.onArchiveChange("Active");
        }
    }, [props.reset]);

    return (
        <>
            {archiveOptions && (
                <ReactDropdown
                    options={archiveOptions}
                    isMultiSelect={false}
                    placeholder="Status"
                    defaultOption={defaultArchive}
                    onChange={_onArchiveChange}
                    isSorted={false}
                />
            )}
        </>
    );
};
