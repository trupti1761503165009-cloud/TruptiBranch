import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import CustomModal from "../../CommonComponents/CustomModal";
import { DialogType, IColumn, IDropdownOption, Panel, PanelType, PrimaryButton, SelectionMode } from "@fluentui/react";

import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { getConvertedDate, logGenerator, UserActivityLog } from "../../../../../Common/Util";
import { IAssetHistory } from "../../../../../Interfaces/IAssetHistory";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { IQuayCleanState } from "../../QuayClean";
import { ChemicalFilter } from "../../../../../Common/Filter/ChemicalFilter";
import { Loader } from "../../CommonComponents/Loader";
import { DateRangeFilter } from "../../../../../Common/Filter/DateRangeFilter";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import { ChemicalManufacturerFilter } from "../../../../../Common/Filter/ChemicalManufacturer";
import { HazardousFilter } from "../../../../../Common/Filter/HazardousFilter";
export interface IAssetHistoryProps {
    provider: IDataProvider;
    siteNameId: number;
    isModelOpen: boolean;
    context: WebPartContext;
    siteName?: string;
    onClickClose(): any;
    SiteURL?: string;
    AlocateChemical?: any;
    manageComponentView?: any;
    siteMasterId?: any;
    qCState?: string;
    loginUserRoleDetails: ILoginUserRoleDetails;
    qCStateId?: any;
}
export interface IAssetHistoryState {
    isModelOpen: boolean;
    column: IColumn[];
    detailList: any;
    assetHistoryItems: IAssetHistory[];
    isPanelOpen: boolean;
    url: string;
    filterobj: any;
    reload: boolean;
    issave: boolean;
    ddfilter: string;
}

export const AssociateChemicalDialog = (props: IAssetHistoryProps) => {
    const [selectedChemical, setSelectedChemical] = React.useState<any>("");
    const [selectedChemicalManufacturer, setSelectedChemicalManufacturer] = React.useState<any>("");
    const [selectedHazardous, setSelectedHazardous] = React.useState<any>("");
    const [MasterData, setMasterData] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [fromDate, setFromDate] = React.useState<Date | any>();
    const [toDate, setToDate] = React.useState<Date | any>();
    const [filterFromDate, setFilterFromDate] = React.useState<any>(undefined);
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);
    const [isErrorModelOpen, setIsErrorModelOpen] = React.useState<boolean>(false);
    const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: '', text: 'select' });
    const onChangeRangeOption = (item: IDropdownOption): void => {
        setSelectedItem(item);
    };
    const onChangeToDate = (filterDate: any, date?: Date) => {
        setFilterToDate(filterDate);
        setToDate(date);
    };
    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setFromDate(date);
        setFilterFromDate(filterDate);
    };

    const [state, setState] = React.useState<IAssetHistoryState>({
        isModelOpen: props.isModelOpen,
        column: [],
        detailList: null,
        assetHistoryItems: [],
        isPanelOpen: false,
        url: "",
        filterobj: [],
        reload: false,
        issave: false,
        ddfilter: ""
    });
    const onChemicalChange = (chemical: any): void => {
        setSelectedChemical(chemical.text);
        setState(prevState => ({ ...prevState, ddfilter: chemical.text, reload: !prevState.reload }));
    };
    const onChemicalManufacturerChange = (chemicalm: any): void => {
        setSelectedChemicalManufacturer(chemicalm.text);
        setState(prevState => ({ ...prevState, ddfilter: chemicalm.text, reload: !prevState.reload }));
    };
    const onHazardousChange = (Hazardous: any): void => {
        setSelectedHazardous(Hazardous);
        setState(prevState => ({ ...prevState, ddfilter: Hazardous, reload: !prevState.reload }));
    };

    const getassociateChemicalsitems = () => {
        let filterDateArray = [];
        let filterArray = [];
        let filter = "";
        if (filterFromDate == null || filterToDate == null) {
            if (selectedItem.text == "Custom Range") {
                // toggleHideDialog();
            } else if (selectedItem.text == "select") {
                filterDateArray.push();
            }
        } else if (!!filterFromDate && !!filterToDate) {
            filterDateArray.push(`(ExpirationDate ge datetime'${filterFromDate}T00:00:00Z' and ExpirationDate le datetime'${filterToDate}T23:59:59Z')`);
        }
        if (selectedChemical != "") {
            filterArray.push(`Title eq '${selectedChemical}'`);
        }
        if (selectedChemicalManufacturer != "") {
            filterArray.push(`Manufacturer eq '${selectedChemicalManufacturer}'`);
        }
        if (selectedHazardous != "") {
            filterArray.push(`Hazardous eq '${selectedHazardous}'`);
        }

        if (filterDateArray.length > 0 && filterArray.length > 0) {
            if (filter != "")
                filter = filter + " and (" + filterDateArray + " and (" + filterArray.join(" and ") + "))";
            else
                filter = filterDateArray + " and (" + filterArray.join(" and ") + ")";
        } else if (filterDateArray.length > 0) {
            if (filter != "")
                filter = filter + " and (" + filterDateArray[0] + ")";
            else
                filter = filterDateArray[0];
        } else if (filterArray.length > 0) {
            if (filter != "")
                filter = filter + " and (" + filterArray.join(" and ") + ")";
            else
                filter = filterArray.join(" and ");
        } else {
            // eslint-disable-next-line no-self-assign
            filter = "";
        }
        let queryOptions: IPnPQueryOptions = {
            listName: ListNames.ChemicalRegistration,
            select: ['Id,Title,ExpirationDate,SiteNameId,Manufacturer,Hazardous'],
            filter: filter
        };
        setIsLoading(false);
        return props.provider.getItemsByQuery(queryOptions);
    };
    const getassociateChemicalsColumn = (): IColumn[] => {
        let columns: IColumn[] = [
            { key: 'Title', name: 'Chemical', fieldName: 'Title', minWidth: 200, maxWidth: 280 },
            { key: 'ExpirationDate', name: 'Expiration Date', fieldName: 'ExpirationDate', minWidth: 80, maxWidth: 150 },
            { key: "Manufacturer", name: 'Manufacturer', fieldName: 'Manufacturer', isResizable: true, minWidth: 80, maxWidth: 150 },
            { key: "Hazardous", name: 'Hazardous', fieldName: 'Hazardous', isResizable: true, minWidth: 50, maxWidth: 80 }
        ];
        return columns;
    };
    const _onItemSelected = (item: any): void => {
        setMasterData([]);
        setState(prevState => ({ ...prevState, issave: false }));
        if (!!item && item.length > 0) {
            setState(prevState => ({ ...prevState, issave: true }));
            let arr: any[] = [];
            setMasterData([]);
            item.map((e1: any, i1: any) => {
                let obj = {
                    Title: e1.Title,
                    ChemicalsId: e1.Id,
                    ExpirationDate: e1.Expiration,
                    SiteNameId: props.siteNameId
                };
                arr.push(obj);
            });
            setMasterData(arr);
        }

    };
    const onClickCloseModel = () => {
        props.onClickClose();
        setState(prevState => ({ ...prevState, isModelOpen: false }));
    };

    const onClickSearch = () => {
        setState(prevState => ({ ...prevState, reload: true }));
    };

    const _createBatch = () => {
        props.provider.createItemInBatch(MasterData, ListNames.SitesAssociatedChemical).then((response) => {
            response.forEach((res: any, index: any) => {
                const logObj = {
                    UserName: props?.loginUserRoleDetails?.title,
                    SiteNameId: Number(MasterData[index]?.SiteNameId), // Match index dynamically
                    ActionType: "Create",
                    EntityType: UserActionEntityTypeEnum.AssociateChemical,
                    EntityId: Number(res.data.Id), // Use res dynamically
                    EntityName: MasterData[index]?.Title, // Match index dynamically
                    Details: `Associate New Chemical`,
                    StateId: props?.qCStateId
                };
                void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
            });

            props.onClickClose();
            setState(prevState => ({ ...prevState, isModelOpen: false }));
        }).catch((error: any) => {
            console.log(error);
            setIsErrorModelOpen(true);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  _createBatch",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_createBatch AssociateChemicalDialog"
            };
            void logGenerator(props.provider, errorObj);
        });
    };

    const Detaillist = (column: any, item: any[]) => {
        setState(prevState => ({ ...prevState, reload: false }));
        return <>
            {isLoading && <Loader />}
            <div className="ms-SPLegacyFabricBlock">
                <div className="formGroup">
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg2">
                                <div className="formControl">
                                    <ChemicalFilter
                                        selectedChemical={selectedChemical}
                                        onChemicalChange={onChemicalChange}
                                        provider={props.provider}
                                        isRequired={true}
                                        AllOption={true}
                                        siteNameId={props.siteNameId} />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg2">
                                <div className="formControl">
                                    <ChemicalManufacturerFilter
                                        selectedChemicalManufacturer={selectedChemicalManufacturer}
                                        onChemicalManufacturerChange={onChemicalManufacturerChange}
                                        provider={props.provider}
                                        isRequired={true}
                                        AllOption={true}
                                        siteNameId={props.siteNameId} />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg2">
                                <div className="formControl">
                                    <HazardousFilter
                                        selectedHazardous={selectedHazardous}
                                        onHazardousChange={onHazardousChange}
                                        provider={props.provider}
                                        isRequired={true}
                                        AllOption={true}
                                    />
                                </div>
                            </div>
                            {selectedItem.text == "Custom Range" ?
                                <div className="ms-Grid-col ms-sm12 ms-md10 ms-lg10 ">
                                    <div className="formControl">
                                        <div className="ms-Grid-row">
                                            <DateRangeFilter
                                                fromDate={fromDate}
                                                toDate={toDate}
                                                onFromDateChange={onChangeFromDate}
                                                onToDateChange={onChangeToDate}
                                                onChangeRangeOption={onChangeRangeOption}
                                            />
                                            {false && <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg3">
                                                <PrimaryButton className="btnSearch btn btn-primary ml-9" text="Search" onClick={onClickSearch} />
                                            </div>}
                                        </div>
                                    </div>
                                </div> :
                                <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg2">
                                    <div className="formControl">
                                        <div className="ms-Grid-row">
                                            <DateRangeFilter
                                                fromDate={fromDate}
                                                toDate={toDate}
                                                onFromDateChange={onChangeFromDate}
                                                onToDateChange={onChangeToDate}
                                                onChangeRangeOption={onChangeRangeOption}
                                            />
                                            {false && <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg3">
                                                <PrimaryButton className="btnSearch btn btn-primary ml-9" text="Search" onClick={onClickSearch} />
                                            </div>}
                                        </div>
                                    </div>
                                </div>}
                        </div>
                    </div>
                </div>

                {
                    < MemoizedDetailList
                        columns={column}
                        items={item || []
                        }
                        reRenderComponent={true}
                        searchable={true}
                        isAddNew={true}
                        onSelectedItem={_onItemSelected}
                        CustomselectionMode={SelectionMode.multiple}
                        manageComponentView={
                            function (componentProp: IQuayCleanState) {
                                throw new Error("Function not implemented.");
                            }
                        }
                        addNewContent={props.loginUserRoleDetails.isAdmin &&
                            < PrimaryButton text="Add Chemicals" onClick={() => {
                                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewChemical, isAddNewSite: true });
                            }} className="btn btn-primary associate-add-btn" />}
                    />
                }
            </div >
        </>;
    };

    React.useEffect(() => {
        try {
            void (async () => {
                let column = getassociateChemicalsColumn();
                let assetitems: any[] = [];
                let assetHistoryItems = await getassociateChemicalsitems();
                if (assetHistoryItems.length > 0) {
                    assetitems = assetHistoryItems.map((item: any) => {
                        return {
                            Id: item.Id,
                            Title: !!item.Title ? item.Title : "",
                            ExpirationDate: !!item.ExpirationDate ? getConvertedDate(item.ExpirationDate) : "",
                            SiteNameId: !!item.SiteNameId ? item.SiteNameId : 0,
                            Expiration: !!item.ExpirationDate ? item.ExpirationDate : "",
                            Manufacturer: !!item.Manufacturer ? item.Manufacturer : "",
                            Hazardous: !!item.Hazardous ? item.Hazardous : ""
                        };
                    });
                }

                let filterdata = assetitems.filter(x => x.Id != props.AlocateChemical.find((y: any) => y == x.Id));
                let detailList = Detaillist(column, filterdata);
                setState(prevState => ({ ...prevState, column: column, detailList: detailList, assetHistoryItems: assetitems }));

            })();


        } catch (error) {
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect AssociateChemicalDialog"
            };
            void logGenerator(props.provider, errorObj);

        }

    }, [state.reload, filterToDate]);


    const onPanelclose = () => {
        props.onClickClose();
        setState(prevState => ({ ...prevState, isPanelOpen: false }));
    };

    return <>
        {isErrorModelOpen && <CustomeDialog closeText="Close" isDialogOpen={isErrorModelOpen} onClickClose={() => { setIsErrorModelOpen(false); }} dialogContentProps={{ type: DialogType.normal, title: 'Something went wrong.', closeButtonAriaLabel: 'Close' }} dialogMessage={<div className="dflex" ><FontAwesomeIcon className="actionBtn btnPDF dticon" icon="circle-exclamation" /> <div className="error">Please try again later.</div></div>} />}
        <Panel
            isOpen={state.isPanelOpen}
            onDismiss={() => onPanelclose()}
            type={PanelType.extraLarge}
        >
            <iframe
                src={state.url}
                style={{ width: "100%", height: "75vh" }}
            />

        </Panel>
        {state.issave ?

            <CustomModal dialogWidth="1100px" isModalOpenProps={state.isModelOpen} setModalpopUpFalse={onClickCloseModel} subject={"Associate Chemical"} message={state.detailList}
                yesButtonText="Save"
                onClickOfYes={_createBatch}
                closeButtonText={"Close"} /> :
            <CustomModal dialogWidth="1100px" isModalOpenProps={state.isModelOpen} setModalpopUpFalse={onClickCloseModel} subject={"Associate Chemical"} message={state.detailList}

                closeButtonText={"Close"} />
        }
    </>;

};

