import * as React from "react";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";

interface IQCAreaFilterProps {
    selectedQCArea: number;
    onQCAreaChange: (QCArea: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    defaultOption?: string;
    AllOption?: boolean;
}

export const QCAreaFilter: React.FunctionComponent<IQCAreaFilterProps> = (props: IQCAreaFilterProps): React.ReactElement => {

    const _onQCAreaChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onQCAreaChange(option as any);
    };

    const [Options, setOptions] = React.useState<any>();

    const getOptionList = (): void => {
        const select = ["Id,Title"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.QCArea
        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: '', label: " --All Area--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((QCArea: any) => {
                dropvalue.push({ value: QCArea.Id, key: QCArea.Id, text: QCArea.Title, label: QCArea.Title });
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
            options={Options} isMultiSelect={false}
            placeholder="Area"
            defaultOption={props.defaultOption}
            onChange={_onQCAreaChange}
        />
    </>;
};