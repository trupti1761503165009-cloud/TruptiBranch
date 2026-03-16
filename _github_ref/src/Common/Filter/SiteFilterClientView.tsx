import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ILoginUserRoleDetails } from "../../Interfaces/ILoginUserRoleDetails";
import { ISelectedZoneDetails } from "../../Interfaces/ISelectedZoneDetails";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../jotai/appGlobalStateAtom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NoRecordFound from "../../webparts/quayClean/components/CommonComponents/NoRecordFound";

interface ISiteFilterProps {
    selectedSite: number;
    onSiteChange: (siteId: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    isClearable?: boolean;
    placeholder?: string;
    AllOption?: boolean;
    isPermissionFiter?: boolean;
    loginUserRoleDetails?: ILoginUserRoleDetails;
    selectedSites?: ISelectedZoneDetails
    isDisabled?: boolean
}

export const SiteFilterClientView: React.FunctionComponent<ISiteFilterProps> = (props: ISiteFilterProps): React.ReactElement => {
    const [siteOptions, setSiteOptions] = React.useState<IDropdownOption[]>();
    const [defaultSite, setDefaultSite] = React.useState<any>(props?.selectedSite);
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { isClientView, siteId } = appGlobalState;
    const _onSiteChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onSiteChange(option);
        setDefaultSite(option?.value);
    };

    const getSitenameList = async (): Promise<void> => {
        const select = ["Id,Title,ADUserId,SiteManagerId,QCStateId,QCState/Title"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.SitesMaster,
            expand: ["QCState"]

        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: '', label: " --All Site--" });
        }
        setIsLoading(true);
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            let filteredResponse = response;
            if (props?.selectedSites?.defaultSelectedSitesId && props?.selectedSites.defaultSelectedSitesId.length > 0) {
                filteredResponse = response.filter((site: any) => props.selectedSites?.defaultSelectedSitesId && props.selectedSites.defaultSelectedSitesId?.indexOf(site.Id) > -1);
                if (filteredResponse.length === 0) {
                    console.warn('Filtered response is empty, showing all sites');
                    filteredResponse = response;
                }
            } else {
                if (props?.selectedSites && props?.selectedSites.selectedSitesId.length > 0) {
                    filteredResponse = response.filter((site: any) => props.selectedSites && props.selectedSites.selectedSitesId?.indexOf(site.Id) > -1);
                    if (filteredResponse.length === 0) {
                        console.warn('Filtered response is empty, showing all sites');
                        filteredResponse = response;
                    }
                }
            }
            if (props.isPermissionFiter) {
                if (!!props.loginUserRoleDetails) {
                    if (props?.loginUserRoleDetails?.isAdmin || props?.loginUserRoleDetails?.isAdminOrg) {
                        filteredResponse.map((Site: any) => {
                            dropvalue.push({ value: Site.Id, key: Site.Id, text: Site.Title, label: Site.Title });
                        });
                    } else if (props?.loginUserRoleDetails?.isStateManager || props?.loginUserRoleDetails?.isStateManagerOrg) {
                        let filteredData = filteredResponse.filter((item: any) => props?.loginUserRoleDetails?.stateManagerStateItem.includes(item.QCStateId));
                        filteredData.map((Site: any) => {
                            dropvalue.push({ value: Site.Id, key: Site.Id, text: Site.Title, label: Site.Title });
                        });
                    } else if (props?.loginUserRoleDetails?.isSiteManagerOrg) {
                        filteredResponse.map((Site: any) => {
                            if (props.loginUserRoleDetails) {
                                // if (props.loginUserRoleDetails?.siteManagerItem.filter((r: any) => r.Id == Site.Id && r.SiteManagerId == props.loginUserRoleDetails?.Id).length > 0)
                                let siteManagerItem: any[] = (!!props.loginUserRoleDetails?.siteManagerItemOrg && props.loginUserRoleDetails?.siteManagerItemOrg?.length > 0) ? props.loginUserRoleDetails?.siteManagerItemOrg : []
                                if (siteManagerItem.filter((r: any) => r.Id == Site.Id && r.SiteManagerId?.indexOf(props.loginUserRoleDetails?.Id) > -1).length > 0)
                                    dropvalue.push({ value: Site.Id, key: Site.Id, text: Site.Title, label: Site.Title });
                            }
                        });

                    } else if (props?.loginUserRoleDetails?.isSiteSupervisor || props?.loginUserRoleDetails?.isSiteSupervisorOrg) {
                        filteredResponse.map((Site: any) => {
                            if (props.loginUserRoleDetails) {
                                // if (props.loginUserRoleDetails?.siteManagerItem.filter((r: any) => r.Id == Site.Id && r.SiteManagerId == props.loginUserRoleDetails?.Id).length > 0)
                                let siteSupervisorItem: any[] = (props.loginUserRoleDetails?.siteSupervisorItemOrg && props.loginUserRoleDetails?.siteSupervisorItemOrg.length > 0) ? props.loginUserRoleDetails?.siteSupervisorItemOrg : []
                                if (!!siteSupervisorItem && siteSupervisorItem.filter((r: any) => r.Id == Site.Id && r.SiteSupervisorId?.indexOf(props.loginUserRoleDetails?.Id) > -1).length > 0)
                                    dropvalue.push({ value: Site.Id, key: Site.Id, text: Site.Title, label: Site.Title });
                            }
                        });

                    }
                    else if (props.loginUserRoleDetails.isUser) {
                        filteredResponse = filteredResponse.filter((item: any) => (isClientView && siteId) ? Number(item.Id) == siteId : (item.ADUserId && item.ADUserId.includes(props.loginUserRoleDetails?.Id))
                        );
                        filteredResponse.map((Site: any) => {
                            if (props.loginUserRoleDetails)
                                dropvalue.push({ value: Site.Id, key: Site.Id, text: Site.Title, label: Site.Title });
                        });
                    } else if (props?.loginUserRoleDetails?.isShowOnlyChairPerson) {
                        let filteredData = filteredResponse.filter((item: any) => item?.QCStateId > 0 && (!!props?.loginUserRoleDetails?.whsChairpersonTitle && props?.loginUserRoleDetails?.whsChairpersonTitle?.indexOf(item?.QCState?.Title) > -1));
                        filteredData.map((Site: any) => {
                            dropvalue.push({ value: Site.Id, key: Site.Id, text: Site.Title, label: Site.Title });
                        });

                    }
                }

            } else {
                filteredResponse.map((Site: any) => {
                    dropvalue.push({ value: Site.Id, key: Site.Id, text: Site.Title, label: Site.Title });
                });
            }
            setSiteOptions(dropvalue);
            if (!props.selectedSite && props?.selectedSites?.defaultSelectedSitesId?.length === 1) {
                setDefaultSite(props.selectedSites.defaultSelectedSitesId[0]);
            }
            setIsLoading(false);
        }).catch((error) => {
            setIsLoading(false);
            console.log(error);
        });
    };

    React.useEffect(() => {
        setDefaultSite(props?.selectedSite);
    }, [props?.selectedSite]);

    React.useEffect(() => {
        getSitenameList();
    }, []);

    return <>
        {/* {isLoading && <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />}
        {(siteOptions && siteOptions?.length > 0) ?
            <ReactDropdown
                options={siteOptions} isMultiSelect={false}
                defaultOption={defaultSite || props?.selectedSite}
                onChange={_onSiteChange}
                isClearable={props.isClearable}
                placeholder={props?.placeholder || "Site"}
                isDisabled={props.isDisabled}
            />
            : <NoRecordFound isSmall={true} noRecordText="No sites available" />
        } */}
        {isLoading ? (
            <FontAwesomeIcon
                className="quickImg spinerColor"
                icon={"spinner"}
                spin
            />
        ) : (siteOptions && siteOptions.length > 0) ? (
            <ReactDropdown
                options={siteOptions}
                isMultiSelect={false}
                defaultOption={defaultSite || props?.selectedSite}
                onChange={_onSiteChange}
                isClearable={props.isClearable}
                placeholder={props?.placeholder || "Site"}
                isDisabled={props.isDisabled}
            />


        ) : (
            <NoRecordFound
                isSmall={true}
                noRecordText="No sites available"
            />
        )}
    </>;
};