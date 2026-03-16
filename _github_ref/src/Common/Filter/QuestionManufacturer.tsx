import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IQuestionManufacturerFilterProps {
    selectedQuestionManufacturer: number | string | undefined;
    onOptionChange: (option: any) => void;
    defaultOption?: string;
    provider: IDataProvider;
    isRequired?: boolean;
    placeholder?: string;
    AllOption?: boolean;
    refreshNav?: boolean;
}

export const QuestionManufacturerFilter: React.FunctionComponent<IQuestionManufacturerFilterProps> = (props: IQuestionManufacturerFilterProps): React.ReactElement => {
    const _onOptionChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onOptionChange(option);
        // setDefaultState(option?.value);
    };

    // const getListItems = (): void => {
    //     const select = ["Id,Manufacturer"];
    //     const queryStringOptions: IPnPQueryOptions = {
    //         select: select,
    //         listName: ListNames.QuestionMaster,
    //         filter: 'IsActive eq 1'
    //     };
    //     let dropvalue: any = [];
    //     if (props.AllOption === true) {
    //         dropvalue.push({ key: '', text: '', value: '', label: " --All Manufacturer--" });
    //     }
    //     dropvalue.push({ key: 'Trailer', text: 'Trailer', value: 'Trailer', label: "Trailer" });
    //     props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
    //         response.map((State: any) => {
    //             dropvalue.push({ value: State.Manufacturer, key: State.Manufacturer, text: State.Manufacturer, label: State.Manufacturer });
    //         });
    //         setOptionsList(dropvalue);
    //     }).catch((error) => {
    //         console.log(error);
    //     });
    // };
    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: '', label: " --All Manufacturer--" });
        }
        props.provider.choiceOption(ListNames.AssetTypeMaster, "Manufacturer").then((response) => {
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
    }, [props.refreshNav]);

    return <>
        {Options &&
            <ReactDropdown
                options={Options}
                isMultiSelect={false}
                defaultOption={props.selectedQuestionManufacturer}
                onChange={_onOptionChange}
                placeholder={props.placeholder || "Select Manufacturer"}
            />
        }
    </>;
};