import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface ISiteManagerFilterProps {
    selectedSiteManager: number;
    onSiteManagerChange: (siteManagerId: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    AllOption?: boolean;
}

export const SiteManagerFilter: React.FunctionComponent<ISiteManagerFilterProps> = (props: ISiteManagerFilterProps): React.ReactElement => {
    const [siteManagerOptions, setSiteManagerOptions] = React.useState<IDropdownOption[]>();
    const [defaultSiteManager, setDefaultSiteManager] = React.useState<any>();

    const _onSiteManagerChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onSiteManagerChange(option);
        setDefaultSiteManager(option?.value);
    };

    const getSiteManagernameList = (): void => {
        const select = ["Id,SiteManagerId,SiteManager/Title"];
        const expand = ["SiteManager"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            expand: expand,
            listName: ListNames.SitesMaster
        };
        let dropvalue: any = [];
        let testdropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: '', label: " --All Site Manager--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            // response.map((SiteManager: any) => {
            //     dropvalue.push({ value: SiteManager.SiteManagerId, key: SiteManager.Id, text: SiteManager.SiteManager.Title, label: SiteManager.SiteManager.Title });
            // });

            let dropvalue = response.flatMap((item: { SiteManager: any[]; SiteManagerId: { [x: string]: any; }; Id: any; }) => {
                // Iterate through each manager in the SiteManager array
                return item?.SiteManager?.map((manager, index) => {
                    // For each manager, return an object with the desired properties
                    return {
                        value: item.SiteManagerId[index], // Set value as item.SiteManagerId at the given index
                        key: item.Id,
                        text: manager.Title,
                        label: manager.Title
                    };
                });
            });


            const filteredData = dropvalue.filter((item: any) => item !== null && item !== undefined);
            if (props.AllOption === true) {
                filteredData.push({ key: '', text: '', value: '', label: " --All Site Manager--" });
            }
            setSiteManagerOptions(filteredData);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getSiteManagernameList();
    }, []);

    return <>
        {siteManagerOptions && siteManagerOptions.length > 0 &&
            < ReactDropdown
                options={siteManagerOptions} isMultiSelect={false}
                placeholder="Site Manager"
                defaultOption={defaultSiteManager || props?.selectedSiteManager}
                onChange={_onSiteManagerChange}
            />
        }
    </>;
};