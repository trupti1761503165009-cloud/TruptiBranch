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
    isMultiSelect?: boolean;
    isPermissionFiter?: boolean;
    loginUserRoleDetails?: ILoginUserRoleDetails;
    isPermissionFilterUpdate?: boolean,
    selectedState?: any;
    className?: any
}

export const MultipleSiteFilter: React.FunctionComponent<ISiteFilterProps> = (props: ISiteFilterProps): React.ReactElement => {
    const [siteOptions, setSiteOptions] = React.useState<any[]>([]);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail, isClientView, siteId } = appGlobalState;
    const [defaultSiteIds, setDefaultSiteIds] = React.useState<any[]>(props?.selectedSiteIds || []);
    const [defaultSiteTitles, setDefaultSiteTitles] = React.useState<string[]>(props?.selectedSiteTitles || []);
    const [defaultSCSite, setDefaultSCSite] = React.useState<string[]>(props?.selectedSCSite || []);
    const selectedStates = props.selectedState || [];
    const dropdownContainerRef = React.useRef<HTMLDivElement>(null);
    const _onSiteChange = (option: any, actionMeta: ActionMeta<any>) => {
        if (props.isMultiSelect == undefined) {
            const selectedIds = Array.isArray(option) ? option.map(o => o.value) : [];
            const selectedTitles = Array.isArray(option) ? option.map(o => o.label) : [];
            const selectedSCSites = Array.isArray(option) ? option.map(o => o.key) : [];
            props.onSiteChange(selectedIds, selectedTitles, selectedSCSites);
            setDefaultSiteIds(selectedIds);
            setDefaultSiteTitles(selectedTitles);
            setDefaultSCSite(selectedSCSites);
        } else {
            // Take only the **last selected option**
            const selectedOption = Array.isArray(option) ? option[option.length - 1] : option;
            const selectedId = selectedOption?.value ?? null;
            const selectedTitle = selectedOption?.label ?? '';
            const selectedSC = selectedOption?.key ?? '';
            props.onSiteChange(
                selectedId !== null ? [selectedId] : [],
                selectedTitle ? [selectedTitle] : [],
                selectedSC ? [selectedSC] : []
            );
            setDefaultSiteIds(selectedId !== null ? [selectedId] : []);
            setDefaultSiteTitles(selectedTitle ? [selectedTitle] : []);
            setDefaultSCSite(selectedSC ? [selectedSC] : []);
        }
    };

    const getSitenameList = (): void => {
        const select = ["Id,Title,ADUserId,SiteManagerId,QCStateId,SCSiteId,QCState/Title,Category,SiteSupervisorId"];
        let filter: string | undefined;
        if (selectedStates.length > 0) {
            filter = selectedStates.map((id: any) => `QCStateId eq ${id}`).join(" or ");
        }
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.SitesMaster,
            expand: ["QCState"],
            filter,
        };
        let dropvalue: any[] = [];

        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            if (props.isPermissionFiter) {
                if (props.loginUserRoleDetails) {
                    const { isAdmin, isStateManager, isSiteManager, isUser, stateManagerStateItem, siteManagerItem, Id, isSiteSupervisor, siteSupervisorItem } = props.loginUserRoleDetails;
                    if (isAdmin) {
                        response.forEach((Site: any) => {
                            dropvalue.push({ value: Site.Id, key: Site.SCSiteId, text: Site.Title, label: Site.Title });
                        });
                    } else if (isStateManager) {
                        const filteredData = response.filter((item: any) => stateManagerStateItem.includes(item.QCStateId) || item?.ADUserId?.includes(Id) || item?.SiteManagerId?.includes(Id) || item?.SiteSupervisorId?.includes(Id));
                        filteredData.forEach((Site: any) => {
                            dropvalue.push({ value: Site.Id, key: Site.SCSiteId, text: Site.Title, label: Site.Title });
                        });
                    } else if (isSiteManager) {
                        if (props.isPermissionFilterUpdate) {
                            const userSites = response.filter((item: any) => item?.ADUserId?.includes(Id) || item?.SiteManagerId?.includes(Id) || item?.SiteSupervisorId?.includes(Id));
                            userSites.forEach((Site: any) => {
                                dropvalue.push({ value: Site.Id, key: Site.SCSiteId, text: Site.Title, label: Site.Title });
                            });
                        }
                        else {
                            response.forEach((Site: any) => {
                                if (siteManagerItem.some((r: any) => r.Id === Site.Id && r.SiteManagerId.includes(Id))) {
                                    dropvalue.push({ value: Site.Id, key: Site.SCSiteId, text: Site.Title, label: Site.Title });
                                }
                            });
                        }
                    }
                    if (isSiteSupervisor) {
                        if (props.isPermissionFilterUpdate) {
                            const userSites = response.filter((item: any) => item?.ADUserId?.includes(Id) || item?.SiteManagerId?.includes(Id) || item?.SiteSupervisorId?.includes(Id));
                            userSites.forEach((Site: any) => {
                                dropvalue.push({ value: Site.Id, key: Site.SCSiteId, text: Site.Title, label: Site.Title });
                            });
                        }
                        else {
                            response.forEach((Site: any) => {
                                if (siteSupervisorItem && siteSupervisorItem.some((r: any) => r.Id === Site.Id && r.SiteSupervisorId.includes(Id))) {
                                    dropvalue.push({ value: Site.Id, key: Site.SCSiteId, text: Site.Title, label: Site.Title });
                                }
                            });
                        }
                    }
                    else if (isUser) {
                        const userSites = response.filter((item: any) => (isClientView && siteId) ? Number(item.Id) == siteId : item.ADUserId?.includes(Id));
                        userSites.forEach((Site: any) => {
                            dropvalue.push({ value: Site.Id, key: Site.SCSiteId, text: Site.Title, label: Site.Title });
                        });
                    }
                    else if (currentUserRoleDetail.isWHSChairperson && currentUserRoleDetail.whsChairpersonTitle.length > 0) {
                        const userSites = response.filter((item: any) => currentUserRoleDetail.whsChairpersonTitle.indexOf(item.QCState.Title) > -1);
                        userSites.forEach((Site: any) => {
                            dropvalue.push({ value: Site.Id, key: Site.SCSiteId, text: Site.Title, label: Site.Title });
                        });
                    }
                }
            } else {
                response.forEach((Site: any) => {
                    dropvalue.push({ value: Site.Id, key: Site.SCSiteId, text: Site.Title, label: Site.Title });
                });
            }
            // if (!!props.selectedState) {
            //     const availableSiteIds = dropvalue.map((site) => site.value);
            //     const validSelectedSiteIds = defaultSiteIds.filter((id) => availableSiteIds.includes(id));
            //     let dropValuefilter = Array.isArray(dropvalue) ? dropvalue.filter(i => validSelectedSiteIds.indexOf(i.value) > -1) : [];
            //     const selectedTitles = Array.isArray(dropValuefilter) ? dropValuefilter.map((option) => option.label) : [];
            //     const selectedSCSites = Array.isArray(dropValuefilter) ? dropValuefilter.map((option) => option.key) : [];
            //     setDefaultSiteIds(validSelectedSiteIds);
            //     props.onSiteChange(validSelectedSiteIds, selectedTitles, selectedSCSites);
            // }


            setSiteOptions(dropvalue);
        }).catch((error) => {
            console.error(error);
        });
    };

    React.useEffect(() => {
        getSitenameList();
    }, [props.selectedState]);


    React.useEffect(() => {
        if (props.reset) {
            setDefaultSiteIds([]);
            setDefaultSiteTitles([]);
            setDefaultSCSite([]);
            props.onSiteChange([], [], []);
        }
    }, [props.reset]);

    return (
        // <ReactDropdown
        //     options={siteOptions || []}
        //     isMultiSelect={!!props?.isMultiSelect ? props.isMultiSelect : true} // Enable multi-select
        //     defaultOption={defaultSiteIds} // Pass the default selected site IDs
        //     onChange={_onSiteChange} // Handle changes
        //     placeholder={props.placeholder || "Select Sites"}
        //     isClearable={props.isClearable || undefined}
        //     isSorted={true} // Sort options
        //     isCloseMenuOnSelect={false}
        // // Keep menu open on selection
        // />
        <div ref={dropdownContainerRef}>
            <ReactDropdown
                options={siteOptions || []}
                isMultiSelect={!!props?.isMultiSelect ? props.isMultiSelect : true}
                defaultOption={defaultSiteIds}
                onChange={_onSiteChange}
                placeholder={props.placeholder || "Select Sites"}
                isClearable={props.isClearable || undefined}
                isSorted={true}
                isCloseMenuOnSelect={props?.isMultiSelect == undefined ? false : true}
                // pass a custom class for z-index if needed
                className={props.className ? props.className : ""}

            />
        </div>
    )
}
