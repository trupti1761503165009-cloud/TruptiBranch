import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface ITemplateNameFilterProps {
    selectedTemplateName: number[]; // Changed to an array for multi-select
    onTemplateNameChange: (TemplateName: any[]) => void; // Changed to accept an array
    provider: IDataProvider;
    siteNameId?: any;
    AllOption: boolean;
    reset?: boolean;
}

export const ReportTemplateFilter: React.FunctionComponent<ITemplateNameFilterProps> = (props: ITemplateNameFilterProps): React.ReactElement => {
    const [TemplateNameOptions, setTemplateNameOptions] = React.useState<IDropdownOption[]>([]);
    const [defaultTemplateName, setDefaultTemplateName] = React.useState<any[]>([]); // Changed to array

    const _onTemplateNameChange = (selectedOptions: any[], actionMeta: ActionMeta<any>): void => {
        props.onTemplateNameChange(selectedOptions);
        setDefaultTemplateName(selectedOptions.map(option => option.value));
    };

    React.useEffect(() => {
        if (props.reset) {
            setDefaultTemplateName([]);
            props.onTemplateNameChange([]);
        }
    }, [props.reset]);

    const getTemplateNameList = (): void => {
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

        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((TemplateName: any) => {
                dropvalue.push({
                    value: TemplateName.Id,
                    key: TemplateName.Id,
                    text: TemplateName.TemplateName,
                    label: TemplateName.TemplateName
                });
            });
            setTemplateNameOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getTemplateNameList();
    }, [props.siteNameId]);

    return (
        <>
            {TemplateNameOptions.length > 0 && (
                <ReactDropdown
                    options={TemplateNameOptions}
                    isMultiSelect={true}
                    placeholder="Select Template(s)"
                    defaultOption={defaultTemplateName}
                    onChange={_onTemplateNameChange}
                    isCloseMenuOnSelect={false}
                />
            )}
        </>
    );
};
