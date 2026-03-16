import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IDropdownFilterProps {
    selectedOption: number | string | undefined;
    onOptionChange: (option: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    isClearable?: boolean;
    placeholder?: string;
    ListName: string;
    ListField: {
        key: string;
        value: string
    };
}

export const CommonDropdown: React.FunctionComponent<IDropdownFilterProps> = (props: IDropdownFilterProps): React.ReactElement => {
    const [optionsList, setOptionsList] = React.useState<IDropdownOption[]>();
    const [defaultState, setDefaultState] = React.useState<any>(props?.selectedOption);

    const _onOptionChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onOptionChange(option);
        setDefaultState(option?.value);
    };

    const getListItems = (): void => {
        // const select = ["Id,Title"];        
        const queryStringOptions: IPnPQueryOptions = {
            select: [props.ListField.key, props.ListField.value],
            listName: props.ListName
        };
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            const listOptions: IDropdownOption[] = response.map((Item: any) => {
                return {
                    value: Item[props.ListField.key],
                    key: Item[props.ListField.key],
                    text: Item[props.ListField.value],
                    label: Item[props.ListField.value]
                };
            });
            setOptionsList(listOptions);
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
                placeholder={props.placeholder || "Select"}
            />
        }
    </>;
};