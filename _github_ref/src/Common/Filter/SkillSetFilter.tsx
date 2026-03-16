import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ListNames } from "../Enum/ComponentNameEnum";

interface ISkillSetFilterProps {
    selectedSkillSet: number;
    onSkillSetChange: (skillsetId: string) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const SkillSetFilter: React.FunctionComponent<ISkillSetFilterProps> = (props: ISkillSetFilterProps): React.ReactElement => {

    const _onSkillSetChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onSkillSetChange(option.text as string);
    };

    const [Options, setOptions] = React.useState<any>();
    const getOptionList = (): void => {
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Skill Set--" });
        }
        props.provider.choiceOption(ListNames.SitesAssociatedTeam, "SkillSet").then((response) => {
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
            options={Options}
            isMultiSelect={true}
            placeholder="SkillSet"
            defaultOption={props.defaultOption}
            onChange={_onSkillSetChange}
        />
    </>;
};