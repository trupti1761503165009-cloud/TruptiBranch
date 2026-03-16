/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-void */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { IQuayCleanState } from "../../QuayClean";
import moment from "moment";
import { Loader } from "../../CommonComponents/Loader";
import { ISiteAssociatedChemical } from "../../../../../Interfaces/IAddNewChemical";
import CamlBuilder from "camljs";
import { SiteFilter } from "../../../../../Common/Filter/SiteFilter";
import { StateFilter } from "../../../../../Common/Filter/StateFilter";
import { _onItemSelected, logGenerator } from "../../../../../Common/Util";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { DateFormat } from "../../../../../Common/Constants/CommonConstants";
// eslint-disable-next-line @typescript-eslint/no-var-requires

export interface IProps {
    provider: IDataProvider;
    manageComponentView(componentProp: IQuayCleanState): any;
    siteMasterId?: number;
    context: WebPartContext;
    loginUserRoleDetails: any;
}

export const AssociatedChemicalMaster = (props: IProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const { siteMasterId } = props;
    const [unfilteredChemicals, setUnfilteredChemicals] = React.useState<ISiteAssociatedChemical[]>([]);
    const [filteredChemicals, setFilteredChemicals] = React.useState<ISiteAssociatedChemical[]>([]);

    const [listColumnsNames, setListColumnsNames] = React.useState<any>([]);
    const [selectedSite, setSelectedSite] = React.useState<any>();
    const [selectedState, setSelectedState] = React.useState<any>();

    const onSiteChange = React.useCallback((selectedOption: any) => {
        setSelectedSite(selectedOption?.text);
    }, []);

    const onStateChange = React.useCallback((stateId: string) => {
        setSelectedState(stateId);
    }, []);

    const _getSiteAssociatedChemicalList = async (chemicalId: number, siteId?: number, siteURL?: string): Promise<ISiteAssociatedChemical[]> => {
        try {
            let itemList: ISiteAssociatedChemical[] = [];
            if (chemicalId > 0) {
                let camlQuery;
                if (siteId && siteId > 0) {
                    camlQuery = new CamlBuilder()
                        .View(["Id",
                            "ExpirationDate",
                            "SiteName",
                            "SiteName/lookupValue"])
                        .Scope(CamlBuilder.ViewScope.RecursiveAll)
                        .RowLimit(5000, true)
                        .Query()
                        .Where()
                        .LookupField('Chemicals').Id().EqualTo(chemicalId)
                        .And()
                        .LookupField("SiteName").Id().EqualTo(siteId)
                        .ToString();
                } else {
                    camlQuery = new CamlBuilder()
                        .View(["Id",
                            "ExpirationDate",
                            "SiteName",
                            "SiteName/lookupValue"])
                        .Scope(CamlBuilder.ViewScope.RecursiveAll)
                        .RowLimit(5000, true)
                        .Query()
                        .Where().LookupField('Chemicals').Id().EqualTo(chemicalId)
                        .ToString();
                }
                const listItems: any[] = await props.provider.getItemsByCAMLQuery(ListNames.SitesAssociatedChemical, camlQuery, null, siteURL);
                listItems.map((sItem: any) => {
                    const formattedExpirationDate = sItem.ExpirationDate ? moment(sItem.ExpirationDate).format(DateFormat) : null;
                    const siteTitle = (sItem.SiteName && sItem.SiteName.length > 0) ? sItem.SiteName[0].lookupValue : "";
                    itemList.push({
                        SiteName: siteTitle,
                        StateName: "",
                        ExpirationDate: formattedExpirationDate || '',
                    });
                });
            }
            return itemList;
        } catch (error) {
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  _getSiteAssociatedChemicalList",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_getSiteAssociatedChemicalList AssociatedChemicalMaster"
            };
            void logGenerator(props.provider, errorObj);
            throw new Error(error);

        }
    };

    const _getStateMasterList = async () => {
        try {
            const select = ["ID,Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.StateMaster,
            };

            const results: any[] = await props.provider.getItemsByQuery(queryStringOptions);

            if (results && results.length > 0) {
                const stateListDataPromises = results.map(async (data) => {
                    const siteTitle = data.Title;
                    const siteURL = `${props.context?.pageContext?.web?.absoluteUrl}/${siteTitle}`;
                    const siteData = await _getSiteAssociatedChemicalList(siteMasterId || 0, 0, siteURL);
                    return {
                        ID: data.ID,
                        StateName: data.Title,
                        SiteURL: siteURL,
                        SiteData: siteData
                    };
                });
                const settledPromises = await Promise.allSettled(stateListDataPromises);
                const filteredListData = settledPromises
                    .filter((data: any) => data.status === 'fulfilled' && data.value !== null)
                    .flatMap((data: any) => {
                        return data.value.SiteData.map((item: ISiteAssociatedChemical) => ({
                            //ID: item.ID,
                            StateName: data.value.StateName,
                            SiteName: item.SiteName,
                            ExpirationDate: item.ExpirationDate
                        }));
                    });
                setUnfilteredChemicals(filteredListData);
            }
        } catch (error) {
            console.error(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  _getStateMasterList",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_getStateMasterList AssociatedChemicalMaster"
            };
            void logGenerator(props.provider, errorObj);
        }
    };

    React.useEffect(() => {
        setIsLoading(true);
        // eslint-disable-next-line no-void
        void (async () => {
            if (siteMasterId && siteMasterId > 0) {
                await _getStateMasterList();

                setListColumnsNames([
                    { key: "key1", name: 'Site Name', fieldName: 'SiteName', isResizable: true, minWidth: 170, maxWidth: 240 },
                    { key: "key2", name: 'State Name', fieldName: 'StateName', isResizable: true, minWidth: 100, maxWidth: 150 },
                    { key: "key3", name: 'Expiration Date', fieldName: 'ExpirationDate', isResizable: true, minWidth: 100, maxWidth: 150 },
                ]);

                //await _getSiteAssociatedChemicalList1(siteMasterId || 0);
            }
            setIsLoading(false);
        })();

    }, []);

    React.useEffect(() => {
        const filterList = async () => {
            setIsLoading(true);
            let filteredData = unfilteredChemicals;
            if (selectedSite) {
                filteredData = filteredData.filter(x => x.SiteName === selectedSite);
            }
            if (selectedState) {
                filteredData = filteredData.filter(x => x.StateName === selectedState);
            }
            setFilteredChemicals(filteredData);
            setIsLoading(false);
        };
        void filterList();
    }, [selectedSite, selectedState, unfilteredChemicals]);

    return <>
        {isLoading ? <Loader /> : null}

        {unfilteredChemicals.length > 0 && (
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg3 ">
                        <div className="formControl">
                            <div className="formControl">
                                <SiteFilter
                                    isPermissionFiter={true}
                                    loginUserRoleDetails={props.loginUserRoleDetails}
                                    selectedSite={selectedSite}
                                    onSiteChange={onSiteChange}
                                    provider={props.provider}
                                    isRequired={true}
                                    placeholder={'Site Name'}
                                    isClearable={true}
                                />
                            </div>

                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg3">
                        <div className="formControl">
                            <StateFilter
                                selectedState={selectedState}
                                onStateChange={onStateChange}
                                provider={props.provider}
                                isRequired={true}
                                placeholder={'State Name'}
                                isClearable={true}
                            />
                        </div>
                    </div>

                    {/* <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg1">
                    <PrimaryButton className="btnSearch btn btn-primary" onClick={() => _getChemicalMasterList()} text="Search" />
                </div> */}

                </div>
            </div >
        )}

        <MemoizedDetailList
            manageComponentView={props.manageComponentView}
            columns={listColumnsNames}
            items={filteredChemicals || []}
            reRenderComponent={true}
            onSelectedItem={_onItemSelected}
            // itemSelected={}
            searchable={true} />
    </>;
};