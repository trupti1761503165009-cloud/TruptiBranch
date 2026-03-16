import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface ITemplateNameFilterProps {
    selectedTemplateName: number;
    onTemplateNameChange: (TemplateName: any) => void;
    provider: IDataProvider;
    siteNameId?: any;
    AllOption: boolean;
}

export const TemplateNameFilter: React.FunctionComponent<ITemplateNameFilterProps> = (props: ITemplateNameFilterProps): React.ReactElement => {
    const [TemplateNameOptions, setTemplateNameOptions] = React.useState<IDropdownOption[]>();
    const [defaultTemplateName, setDefaultTemplateName] = React.useState<any>();

    const _onTemplateNameChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onTemplateNameChange(option as any);
        setDefaultTemplateName(option.value);
    };

    const getTemplateNamenameList = (): void => {
        const select = ["Id,TemplateName,SiteNameId"];
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
            dropvalue.push({ key: '', text: '', value: 'All', label: " --All Template--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((TemplateName: any) => {
                dropvalue.push({ value: TemplateName.Id, key: TemplateName.Id, text: TemplateName.TemplateName, label: TemplateName.TemplateName });
            });
            setTemplateNameOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getTemplateNamenameList();
    }, []);

    return <>
        {TemplateNameOptions &&
            <ReactDropdown
                options={TemplateNameOptions} isMultiSelect={false}
                placeholder="Template"
                defaultOption={defaultTemplateName}
                onChange={_onTemplateNameChange}
            />
        }
    </>;
};