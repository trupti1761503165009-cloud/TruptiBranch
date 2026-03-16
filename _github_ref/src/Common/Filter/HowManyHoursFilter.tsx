import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IHMHFilterFilterProps {
    selectedHMH: number;
    onHMHChange: (HMHFilterId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const HMHFilterFilter: React.FunctionComponent<IHMHFilterFilterProps> = (props: IHMHFilterFilterProps): React.ReactElement => {

    const _onHMHChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onHMHChange(option.text as string);
    };

    const [HMHFilterOptions, setHMHFilterOptions] = React.useState<any>();
    const getHMHFilterList = (): void => {
        let dropvalue: any = [];

        props.provider.choiceOption(ListNames.AssetTypeMaster, "HowManyHours").then((response) => {
            response.map((HMHFilter: any) => {
                dropvalue.push({ value: HMHFilter, key: HMHFilter, text: HMHFilter, label: HMHFilter });
            });
            setHMHFilterOptions(dropvalue);

        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getHMHFilterList();
    }, []);



    return <>
        <ReactDropdown
            options={HMHFilterOptions} isMultiSelect={false}
            placeholder="How Many Hours"
            defaultOption={props.defaultOption}
            onChange={_onHMHChange}
        />
    </>;
};