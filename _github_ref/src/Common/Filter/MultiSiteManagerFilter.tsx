import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";

interface ISiteManagerFilterProps {
    selectedSiteManager: any[]; // Change the type to array
    onSiteManagerChange: (siteManagerIds: any[]) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    AllOption?: boolean;
}


export const MultiSiteManagerFilter: React.FunctionComponent<ISiteManagerFilterProps> = (props: ISiteManagerFilterProps): React.ReactElement => {
    const [siteManagerOptions, setSiteManagerOptions] = React.useState<IDropdownOption[]>([]);
    const [defaultSiteManagers, setDefaultSiteManagers] = React.useState<any[]>(props.selectedSiteManager || []);

    const _onSiteManagerChange = (options: any[]): void => {
        const selectedIds = options.map((option) => option?.value);
        props.onSiteManagerChange(selectedIds);
        setDefaultSiteManagers(selectedIds);
    };

    const getSiteManagerNameList = (): void => {
        const select = ["Id,SiteManagerId,SiteManager/Title"];
        const expand = ["SiteManager"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            expand: expand,
            listName: ListNames.SitesMaster
        };

        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            let dropvalue = response.flatMap((item: { SiteManager: any[]; SiteManagerId: { [x: string]: any; }; Id: any; }) => {
                return item?.SiteManager?.map((manager, index) => ({
                    value: item.SiteManagerId[index],
                    key: item.Id,
                    text: manager.Title,
                    label: manager.Title,
                }));
            });

            const filteredData = dropvalue.filter((item: any) => item !== null && item !== undefined);

            setSiteManagerOptions(filteredData);
        }).catch((error) => {
            console.error(error);
        });
    };

    React.useEffect(() => {
        getSiteManagerNameList();
    }, []);

    return (
        <>
            {siteManagerOptions.length > 0 && (
                <ReactDropdown
                    options={siteManagerOptions}
                    isMultiSelect={true} // Enable multi-selection
                    placeholder="Site Manager"
                    defaultOption={defaultSiteManagers}
                    onChange={_onSiteManagerChange}
                    isCloseMenuOnSelect={false} // Keep dropdown open for multiple selections
                />
            )}
        </>
    );
};
