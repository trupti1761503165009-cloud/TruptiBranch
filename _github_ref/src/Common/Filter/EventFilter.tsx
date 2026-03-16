import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IEventFilterProps {
    selectedOption: number | string | undefined;
    onOptionChange: (option: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    isClearable?: boolean;
    placeholder?: string;
    AllOption?: boolean;
}

export const EventFilter: React.FunctionComponent<IEventFilterProps> = (props: IEventFilterProps): React.ReactElement => {
    const [optionsList, setOptionsList] = React.useState<IDropdownOption[]>();
    const [defaultState, setDefaultState] = React.useState<any>(props?.selectedOption);

    const _onOptionChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onOptionChange(option);
        setDefaultState(option?.value);
    };

    const getListItems = (): void => {
        const select = ["Id,Title"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.EventMaster
        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Event--" });
        }

        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((State: any) => {
                dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
            });
            setOptionsList(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getListItems();
    }, []);

    return <>
        {optionsList &&
            <ReactDropdown
                options={optionsList}
                isMultiSelect={false}
                defaultOption={defaultState || props.selectedOption}
                onChange={_onOptionChange}
                isClearable={props.isClearable}
                placeholder={props.placeholder || "Select Event"}
            />
        }
    </>;
};