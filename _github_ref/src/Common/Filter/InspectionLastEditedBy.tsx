import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface ILastEditedByFilterProps {
    selectedLastEditedBy: number;
    onLastEditedByChange: (LastEditedBy: any) => void;
    provider: IDataProvider;
    siteNameId?: any;
    AllOption: boolean;
    reset?: boolean;
}

export const InspectionLastEditedBy: React.FunctionComponent<ILastEditedByFilterProps> = (props: ILastEditedByFilterProps): React.ReactElement => {
    const [LastEditedByOptions, setLastEditedByOptions] = React.useState<IDropdownOption[]>();
    const [defaultLastEditedBy, setDefaultLastEditedBy] = React.useState<any>();

    const _onLastEditedByChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onLastEditedByChange(option as any);
        setDefaultLastEditedBy(option.value);
    };

    const getLastEditedBynameList = (): void => {
        const select = ["Id,LastEditedBy,SiteNameId"];
        let filter;
        if (props.siteNameId != 0) {
            filter = `SiteNameId eq ${props.siteNameId}`;
        } else {
            filter = "";
        }

        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            filter: filter,
            listName: ListNames.AuditInspectionData
        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((LastEditedBy: any) => {
                dropvalue.push({ value: LastEditedBy.Id, key: LastEditedBy.Id, text: LastEditedBy.LastEditedBy, label: LastEditedBy.LastEditedBy });
            });
            setLastEditedByOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        if (props.reset) {
            setDefaultLastEditedBy("")
            props.onLastEditedByChange("");
        }
    }, [props.reset]);

    React.useEffect(() => {
        getLastEditedBynameList();
    }, []);

    return <>
        {LastEditedByOptions &&
            <ReactDropdown
                options={LastEditedByOptions} isMultiSelect={false}
                placeholder="Last Edited By"
                defaultOption={defaultLastEditedBy}
                onChange={_onLastEditedByChange}
            />
        }
    </>;
};