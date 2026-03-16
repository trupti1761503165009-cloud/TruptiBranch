import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ILoginUserRoleDetails } from "../../Interfaces/ILoginUserRoleDetails";
import { appGlobalStateAtom } from "../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";

interface IFANumberFilterProps {
    selectedFANumber: string | number;
    onFANumberChange: (faNumber: any) => void;
    provider: IDataProvider;
    isRequired?: boolean;
    siteNameId?: any;
    AllOption?: boolean;
    loginUserRoleDetails?: ILoginUserRoleDetails;
    isAdmin: boolean;
    defaultSelectedSitesId: any;
}

export const FANumberFilter: React.FunctionComponent<IFANumberFilterProps> = (props: IFANumberFilterProps): React.ReactElement => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const [faNumberOptions, setFANumberOptions] = React.useState<IDropdownOption[]>([]);
    const [defaultFANumber, setDefaultFANumber] = React.useState<any>();
    const _onFANumberChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onFANumberChange(option);
        setDefaultFANumber(option.value);
    };

    const getFANumberList = (): void => {
        let filter;
        if (!(props?.isAdmin || props?.loginUserRoleDetails?.isStateManager)) {
            const ids = props?.defaultSelectedSitesId;
            if (ids && ids?.length > 0) {
                const idFilters = ids.map((id: any) => `SiteNameId eq ${id}`).join(" or ");
                filter = `(${idFilters}) and IsDeleted ne 1`;
            }
        } else {
            const ids = props?.defaultSelectedSitesId;
            if (ids && ids?.length > 0) {
                const idFilters = ids.map((id: any) => `SiteNameId eq ${id}`).join(" or ");
                filter = `(${idFilters}) and IsDeleted ne 1`;
            }
        }
        const select = ["Id,Title,FANumber,SiteNameId"];
        // let filter;

        // if (currentUserRoleDetail.isAdmin === true) {
        //     filter = "IsDeleted ne 1";
        // } else {
        //     if (props?.loginUserRoleDetails?.isStateManager) {
        //         filter = "IsDeleted ne 1";
        //     } else {
        //         if (props.siteNameId != 0) {
        //             filter = `SiteNameId eq ${props.siteNameId} and IsDeleted ne 1`;
        //         } else {
        //             filter = "IsDeleted ne 1";
        //         }
        //     }
        // }
        const queryOptions: IPnPQueryOptions = {
            select,
            filter: filter,
            listName: ListNames.AssetMaster
        };

        props.provider.getItemsByQuery(queryOptions).then((response: any[]) => {
            let filteredData = response;
            // if (props?.loginUserRoleDetails?.isStateManager && !props?.loginUserRoleDetails?.isAdmin) {
            //     filteredData = filteredData.filter((item: any) =>
            //         props?.loginUserRoleDetails?.stateManagerSitesItemIds.includes(item.SiteNameId)
            //     );
            // }
            const uniqueFANumbers = new Map<string, any>();
            filteredData.forEach((item: any) => {
                if (item.FANumber && !uniqueFANumbers.has(item.FANumber)) {
                    uniqueFANumbers.set(item.FANumber, {
                        value: item.Id,
                        key: item.Id,
                        text: `${item.FANumber}`,
                        label: `${item.FANumber}`
                    });
                }
            });

            let dropvalue: any[] = [];
            dropvalue.push(...Array.from(uniqueFANumbers.values()));
            if (props.AllOption && dropvalue.length > 0) {
                dropvalue.push({
                    key: 'all',
                    text: '--All FA Numbers--',
                    value: '',
                    label: '--All FA Numbers--'
                });
            }
            if (dropvalue.length === 0) {
                dropvalue.push({
                    key: "no-record",
                    text: "No Record Found",
                    value: "",
                    label: "No Record Found",
                    isDisabled: true
                });
            }

            setFANumberOptions(dropvalue);
        }).catch((error) => console.error("Error fetching FA Numbers:", error));
    };

    React.useEffect(() => {
        getFANumberList();
    }, [props?.defaultSelectedSitesId]);

    return (
        <>
            {faNumberOptions.length > 0 &&
                <ReactDropdown
                    options={faNumberOptions}
                    isMultiSelect={false}
                    placeholder="FA Number"
                    defaultOption={defaultFANumber}
                    onChange={_onFANumberChange}
                />
            }
        </>
    );
};
