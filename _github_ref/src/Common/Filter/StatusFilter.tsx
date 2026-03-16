import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IStatusFilterProps {
    selectedStatus: number;
    onStatusChange: (status: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const StatusFilter: React.FunctionComponent<IStatusFilterProps> = (props: IStatusFilterProps): React.ReactElement => {
    const [statusOptions, setStatusOptions] = React.useState<IDropdownOption[]>();
    const [defaultStatus, setDefaultStatus] = React.useState<any>();

    const _onStatusChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onStatusChange(option as any);
        setDefaultStatus(option?.value);
    };

    const getStatusnameList = (): void => {
        let dropvalue: any = [];
        // Check if AllOption is true and add 'All' option
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Status--" });
        }

        props.provider.choiceOption(ListNames.AssetMaster, "AMStatus").then((response: any) => {
            response.map((optionValue: any) => {
                dropvalue.push({ value: optionValue, key: optionValue, text: optionValue, label: optionValue });
            });

            // Check if defaultOption is not null and not already in dropvalue
            if (props.defaultOption && !dropvalue.some((item: any) => item.value === props.defaultOption)) {
                dropvalue.push({
                    value: props.defaultOption,
                    key: props.defaultOption,
                    text: props.defaultOption,
                    label: props.defaultOption
                });
            }

            setStatusOptions(dropvalue);

        }).catch((error) => {
            console.log(error);
        });
    };


    React.useEffect(() => {
        getStatusnameList();
    }, []);

    return <>
        {statusOptions &&
            <ReactDropdown
                options={statusOptions} isMultiSelect={false}
                placeholder="Status"
                defaultOption={!!defaultStatus ? defaultStatus : props.defaultOption}
                onChange={_onStatusChange}
            />
        }
    </>;
};