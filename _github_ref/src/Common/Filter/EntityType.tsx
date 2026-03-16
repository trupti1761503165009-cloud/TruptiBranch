import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IEntityTypeFilterProps {
    selectedEntityType: any;
    onEntityTypeChange: (EntityTypeId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: any;
    AllOption?: boolean;
    isMultipleSelect?: boolean;
    isClearable?: boolean;
    isCloseMenuOnSelect?: boolean
}

export const EntityTypeFilter: React.FunctionComponent<IEntityTypeFilterProps> = (props: IEntityTypeFilterProps): React.ReactElement => {

    const _onEntityTypeChange = (option: any, actionMeta: ActionMeta<any>): void => {
        if (props.isMultipleSelect) {
            props.onEntityTypeChange(option as any);
        } else {
            props.onEntityTypeChange(option.text as string);
        }

    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Entity Type--" });
        }
        props.provider.choiceOption(ListNames.UserActivityLog, "EntityType").then((response) => {
            response.map((value: any) => {
                dropvalue.push({ value: value, key: value, text: value, label: value });
            });
            setOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getOptionList();
    }, []);

    return <>
        <ReactDropdown
            options={Options || []}
            isMultiSelect={props?.isMultipleSelect || false}
            placeholder="Entity Type"
            isClearable={props.isClearable || undefined}
            defaultOption={props?.defaultOption}
            onChange={_onEntityTypeChange}
            isCloseMenuOnSelect={props.isCloseMenuOnSelect != undefined ? props.isCloseMenuOnSelect : undefined}
        />
    </>;
};