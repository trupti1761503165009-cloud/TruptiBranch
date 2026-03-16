import * as React from 'react';
import { ActionMeta } from 'react-select';
import { IDataProvider } from '../../DataProvider/Interface/IDataProvider';
import IPnPQueryOptions from '../../DataProvider/Interface/IPnPQueryOptions';
import { ILoginUserRoleDetails } from '../../Interfaces/ILoginUserRoleDetails';
import { ListNames } from '../Enum/ComponentNameEnum';
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { useAtomValue } from 'jotai';
import { appGlobalStateAtom } from '../../jotai/appGlobalStateAtom';

interface ISiteFilterProps {
    selectedSiteIds: any[]; // Array for selected site IDs
    selectedSiteTitles?: string[]; // Array for selected site Titles
    selectedSCSite?: string[];
    onSiteChange: (siteIds: any[], siteTitles: string[], siteSC: string[]) => void; // Updated to return IDs and Titles
    provider: IDataProvider;
    isRequired?: boolean;
    isClearable?: boolean;
    reset?: boolean;
    placeholder?: string;
    AllOption?: boolean;
    isPermissionFiter?: boolean;
    isPermissionFilterUpdate?: boolean
}

export const ReportSiteFilter: React.FunctionComponent<ISiteFilterProps> = (props: ISiteFilterProps): React.ReactElement => {
    const [siteOptions, setSiteOptions] = React.useState<any[]>([]);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail } = appGlobalState;
    const [defaultSiteIds, setDefaultSiteIds] = React.useState<any[]>(props?.selectedSiteIds || []);
    const [defaultSiteTitles, setDefaultSiteTitles] = React.useState<string[]>(props?.selectedSiteTitles || []);
    const [defaultSCSite, setDefaultSCSite] = React.useState<string[]>(props?.selectedSCSite || []);

    const _onSiteChange = (options: any, actionMeta: ActionMeta<any>): void => {
        const selectedIds = Array.isArray(options) ? options.map((option) => option.key) : [];
        const selectedTitles = Array.isArray(options) ? options.map((option) => option.label) : [];
        const selectedSCSites = Array.isArray(options) ? options.map((option) => option.key) : [];
        props.onSiteChange(selectedIds, selectedTitles, selectedSCSites);
        setDefaultSiteIds(selectedIds);
        setDefaultSiteTitles(selectedTitles);
        setDefaultSCSite(selectedSCSites);
    };

    const getSitenameList = (): void => {
        const select = ["Id,Title,ADUserId,SiteManagerId,JobCode,QCStateId,SCSiteId,QCState/Title,Category,SiteSupervisorId"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.SitesMaster,
            expand: ["QCState"]
        };
        let dropvalue: any[] = [];

        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            if (props.isPermissionFiter) {
                if (currentUserRoleDetail) {
                    const { isAdmin, isStateManager, isSiteManager, isUser, stateManagerStateItem, siteManagerItem, Id } = currentUserRoleDetail;
                    if (isAdmin) {
                        response.forEach((Site: any) => {
                            dropvalue.push({ value: Site.Id, key: Site.JobCode, text: Site.Title, label: Site.Title });
                        });
                    } else if (isStateManager) {
                        const filteredData = response.filter((item: any) => stateManagerStateItem.includes(item.QCStateId));
                        filteredData.forEach((Site: any) => {
                            dropvalue.push({ value: Site.Id, key: Site.JobCode, text: Site.Title, label: Site.Title });
                        });
                    } else if (isSiteManager) {
                        // response.forEach((Site: any) => {
                        //     if (siteManagerItem.some((r: any) => r.Id === Site.Id && r.SiteManagerId.includes(Id))) {
                        //         dropvalue.push({ value: Site.Id, key: Site.JobCode, text: Site.Title, label: Site.Title });
                        //     }
                        // });
                        if (props.isPermissionFilterUpdate) {
                            const userSites = response.filter((item: any) => item?.ADUserId?.includes(Id) || item?.SiteManagerId?.includes(Id) || item?.SiteSupervisorId?.includes(Id));
                            userSites.forEach((Site: any) => {
                                dropvalue.push({ value: Site.Id, key: Site.JobCode, text: Site.Title, label: Site.Title });
                            });
                        }
                        else {
                            response.forEach((Site: any) => {
                                if (siteManagerItem.some((r: any) => r.Id === Site.Id && r.SiteManagerId.includes(Id))) {
                                    dropvalue.push({ value: Site.Id, key: Site.JobCode, text: Site.Title, label: Site.Title });
                                }
                            });
                        }
                    } else if (isUser) {
                        const userSites = response.filter((item: any) => item.ADUserId?.includes(Id));
                        userSites.forEach((Site: any) => {
                            dropvalue.push({ value: Site.Id, key: Site.JobCode, text: Site.Title, label: Site.Title });
                        });
                    }
                    else if (currentUserRoleDetail.isWHSChairperson && currentUserRoleDetail.whsChairpersonTitle.length > 0) {
                        const userSites = response.filter((item: any) => currentUserRoleDetail.whsChairpersonTitle.indexOf(item.QCState.Title) > -1);
                        userSites.forEach((Site: any) => {
                            dropvalue.push({ value: Site.Id, key: Site.JobCode, text: Site.Title, label: Site.Title });
                        });
                    }
                }
            } else {
                response.forEach((Site: any) => {
                    dropvalue.push({ value: Site.Id, key: Site.JobCode, text: Site.Title, label: Site.Title });
                });
            }
            setSiteOptions(dropvalue);
        }).catch((error) => {
            console.error(error);
        });
    };

    React.useEffect(() => {
        getSitenameList();
    }, []);


    React.useEffect(() => {
        if (props.reset) {
            setDefaultSiteIds([]);
            setDefaultSiteTitles([]);
            setDefaultSCSite([]);
            props.onSiteChange([], [], []);
        }
    }, [props.reset]);

    return (
        <ReactDropdown
            options={siteOptions}
            isMultiSelect={true} // Enable multi-select
            defaultOption={defaultSiteIds} // Pass the default selected site IDs
            onChange={_onSiteChange} // Handle changes
            placeholder={props.placeholder || "Select Sites"}
            isClearable={props.isClearable}
            isSorted={true} // Sort options
            isCloseMenuOnSelect={false} // Keep menu open on selection
        />
    );
};
