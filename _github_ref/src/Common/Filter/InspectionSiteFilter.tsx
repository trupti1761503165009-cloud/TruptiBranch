import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ILoginUserRoleDetails } from "../../Interfaces/ILoginUserRoleDetails";

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
}

export const InspectionSiteFilter: React.FunctionComponent<ISiteFilterProps> = (props: ISiteFilterProps): React.ReactElement => {
    const [siteOptions, setSiteOptions] = React.useState<IDropdownOption[]>();
    const [defaultSite, setDefaultSite] = React.useState<any>(props?.selectedSite);

    const _onSiteChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onSiteChange(option);
        setDefaultSite(option?.value);
    };

    const getSitenameList = (): void => {
        const select = ["Id,Title,ADUserId,SiteManagerId,QCStateId,SCSiteId,Category"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.SitesMaster
        };
        let dropvalue: any = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: '', text: '', value: '', label: " --All Site--" });
        }
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {

            if (props.isPermissionFiter) {
                if (!!props.loginUserRoleDetails) {
                    if (props?.loginUserRoleDetails?.isAdmin) {
                        response.map((Site: any) => {
                            dropvalue.push({ value: Site.Id, key: Site.SCSiteId, text: Site.Title, label: Site.Title });
                        });
                    } else if (props?.loginUserRoleDetails?.isStateManager) {
                        let filteredData = response.filter((item: any) => props?.loginUserRoleDetails?.stateManagerStateItem.includes(item.QCStateId));
                        filteredData.map((Site: any) => {
                            dropvalue.push({ value: Site.Id, key: Site.SCSiteId, text: Site.Title, label: Site.Title });
                        });
                    } else if (props?.loginUserRoleDetails?.isSiteManager) {
                        response.map((Site: any) => {
                            if (props.loginUserRoleDetails)
                                // if (props.loginUserRoleDetails?.siteManagerItem.filter((r: any) => r.Id == Site.Id && r.SiteManagerId == props.loginUserRoleDetails?.Id).length > 0)
                                if (props.loginUserRoleDetails?.siteManagerItem.filter((r: any) => r.Id == Site.Id && r.SiteManagerId?.indexOf(props.loginUserRoleDetails?.Id) > -1).length > 0)
                                    dropvalue.push({ value: Site.Id, key: Site.SCSiteId, text: Site.Title, label: Site.Title });
                        });

                    } else if (props.loginUserRoleDetails.isUser) {
                        response = response.filter((item: any) =>
                            (item.ADUserId && item.ADUserId.includes(props.loginUserRoleDetails?.Id))
                        );
                        response.map((Site: any) => {
                            if (props.loginUserRoleDetails)
                                dropvalue.push({ value: Site.Id, key: Site.SCSiteId, text: Site.Title, label: Site.Title });
                        });
                    }
                }

            } else {
                response.map((Site: any) => {
                    dropvalue.push({ value: Site.Id, key: Site.SCSiteId, text: Site.Title, label: Site.Title });
                });
            }
            setSiteOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        getSitenameList();
    }, []);

    return <>
        {siteOptions &&
            <ReactDropdown
                options={siteOptions} isMultiSelect={false}
                defaultOption={defaultSite || props?.selectedSite}
                onChange={_onSiteChange}
                isClearable={props.isClearable}
                placeholder={props?.placeholder || "Site"}
            />
        }
    </>;
};