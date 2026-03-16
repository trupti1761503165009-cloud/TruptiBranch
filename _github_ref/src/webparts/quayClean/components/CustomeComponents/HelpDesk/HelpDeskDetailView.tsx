import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { Breadcrumb, PrimaryButton } from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IQuayCleanState } from "../../QuayClean";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { Loader } from "../../CommonComponents/Loader";
import { IHelpDeskItemView } from "../../../../../Interfaces/IAddNewHelpDesk";
import { calculateDuration, ConvertDateToStringFormat, logGenerator, removeElementOfBreadCrum, UserActivityLog } from "../../../../../Common/Util";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { DateTimeFormate } from "../../../../../Common/Constants/CommonConstants";
import { useAtomValue } from "jotai";
import moment from "moment";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";
// eslint-disable-next-line @typescript-eslint/no-var-requires

export interface IAddNewProjectProps {
    provider: IDataProvider;
    context: WebPartContext;
    isAddNewProject?: boolean;
    manageComponentView(componentProp: IQuayCleanState): any;
    siteMasterId?: number;
    breadCrumItems: IBreadCrum[];
    loginUserRoleDetails: any;
    originalSiteMasterId: any;
    componentProps: IQuayCleanState;
}

export const HelpDeskDetailView = (props: IAddNewProjectProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { siteMasterId } = props;
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const { currentUserRoleDetail } = appGlobalState;
    const [itemDetail, setItemDetail] = React.useState<IHelpDeskItemView>();
    const [FieldData, setFieldData] = React.useState<any>();
    const isCall = React.useRef<boolean>(true);
    const onClickFieldData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,Field,SiteNameId"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.HelpDeskField,
                filter: `SiteNameId eq '${props.componentProps.originalSiteMasterId}'`
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const listData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                Field: !!data.Field ? data.Field : '',
                            }
                        );
                    });
                    setFieldData(listData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    }

    const getHelpDeskDetailByID = (Id: number) => {
        if (!!Id) {
            const selectItem = ["Id,Title,Area,StartingDateTime,CompletionDateTime,Caller,Location,SubLocation,QCArea/Id,QCArea/Title,HDCategory,ReportHelpDesk,HDStatus,EventName,HelpDeskName,QCPriority,SiteName/Id,SiteName/Title,CallType"];
            const expandItem = ["SiteName,QCArea"];
            const filter = `ID eq ${Id}`;
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.HelpDesk,
                select: selectItem,
                expand: expandItem,
                filter: filter,
                id: Id
            };
            return props.provider.getByItemByIDQuery(queryOptions);
        }
    };

    const getState = (siteNameId: any) => {
        try {
            let queryOptions: IPnPQueryOptions = {
                listName: ListNames.SitesMaster,
                select: ["Id", "QCStateId"],
                filter: `Id eq ${siteNameId}`
            };
            return props.provider.getItemsByQuery(queryOptions);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
        return [];
    };

    const _userActivityLog = async () => {
        setIsLoading(true);
        try {
            let orgSiteId = props.originalSiteMasterId;
            let data = await getState(orgSiteId);
            if (props?.componentProps?.qCStateId || data[0]?.QCStateId) {
                const todayDate = moment().format("YYYY-MM-DD");
                const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
                let filterSiteNameId = orgSiteId || itemDetail?.SiteNameId;
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    listName: ListNames.UserActivityLog,
                    filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityId eq '${siteMasterId}' and SiteNameId eq '${filterSiteNameId}' and EntityType eq '${UserActionEntityTypeEnum.HelpDesk}' and ActionType eq 'Details View' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
                };
                const results = await props.provider.getItemsByQuery(queryStringOptions);
                if (results && results.length > 0) {
                    const listData = results.map((data) => ({
                        ID: data.ID,
                        Count: data.Count ?? '',
                    }));
                    let updateObj = {
                        Count: listData[0]?.Count + 1,
                    };
                    await props.provider.updateItemWithPnP(updateObj, ListNames.UserActivityLog, Number(listData[0]?.ID));
                } else {
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: filterSiteNameId || itemDetail?.SiteNameId,
                        ActionType: UserActivityActionTypeEnum.DetailsView,
                        Email: currentUserRoleDetail?.emailId,
                        EntityType: UserActionEntityTypeEnum.HelpDesk,
                        EntityId: siteMasterId,
                        EntityName: itemDetail?.HelpDeskName,
                        Count: 1,
                        Details: "Details View",
                        StateId: props?.componentProps?.qCStateId || data[0]?.QCStateId
                    };
                    void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
                }
                isCall.current = false;
            }
        } catch (error) {
            console.error("Error fetching user activity log:", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (!!itemDetail && itemDetail?.Title !== "" && isCall.current == true) {
            isCall.current = false;
            _userActivityLog();
        }
    }, [itemDetail]);

    React.useEffect(() => {
        try {
            setIsLoading(true);
            // eslint-disable-next-line no-void
            onClickFieldData();
            void (async () => {
                if (siteMasterId && siteMasterId > 0) {
                    const objItem = await getHelpDeskDetailByID(siteMasterId);
                    const duration = calculateDuration(objItem);
                    const items: IHelpDeskItemView = {
                        Id: parseInt(objItem.Id),
                        Title: !!objItem.Title ? objItem.Title : "",
                        SiteName: !!objItem.SiteName ? objItem.SiteName.Title : "",
                        SiteNameId: !!objItem.SiteName ? objItem.SiteName.Id : 0,
                        Caller: !!objItem.Caller ? objItem.Caller : "",
                        Location: !!objItem.Location ? objItem.Location : "",
                        SubLocation: !!objItem.SubLocation ? objItem.SubLocation : "",
                        QCAreaId: !!objItem.QCArea ? objItem.QCArea.Id : 0,
                        QCArea: !!objItem.QCArea ? objItem.QCArea.Title : "",
                        Area: !!objItem.Area ? objItem.Area : "",
                        StartingDateTime: !!objItem.StartingDateTime ? ConvertDateToStringFormat(objItem.StartingDateTime, DateTimeFormate) : "",
                        HDCategory: !!objItem.HDCategory ? objItem.HDCategory : "",
                        HDStatus: !!objItem.HDStatus ? objItem.HDStatus : "",
                        ReportHelpDesk: !!objItem.ReportHelpDesk ? "Yes" : "No",
                        EventName: !!objItem.EventName ? objItem.EventName : "",
                        HelpDeskName: !!objItem.HelpDeskName ? objItem.HelpDeskName : "",
                        QCPriority: !!objItem.QCPriority ? objItem.QCPriority : "",
                        CallType: !!objItem.CallType ? objItem.CallType : "",
                        CompletionDateTime: !!objItem.CompletionDateTime ? ConvertDateToStringFormat(objItem.CompletionDateTime, DateTimeFormate) : "",
                        Duration: duration
                    };
                    setItemDetail(items);
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                }
                setIsLoading(false);
            })();

        } catch (error) {
            setIsLoading(false);
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect HelpDeskDetailView"
            };
            void logGenerator(props.provider, errorObj);
        }
    }, []);

    const onClickClose = () => {
        // if (props?.componentProps?.originalSiteMasterId && props?.componentProps?.dataObj) {
        //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
        //     props.manageComponentView({
        //         currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.qCStateId, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey", originalSiteMasterId: props.originalSiteMasterId
        //     });
        // } 
        if (isSiteLevelComponent) {
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                selectedZoneDetails: selectedZoneDetails,
                isShowDetailOnly: true,
                pivotName: "HelpDeskListKey",
            });
        }
        else {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            props.manageComponentView({ currentComponentName: ComponentNameEnum.HelpDeskList, qCStateId: props?.componentProps?.qCStateId, breadCrumItems: breadCrumItems });
        }
    };

    return <>
        {isLoading && <Loader />}
        <div className="boxCard">
            <div className="formGroup">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween">
                            <div><h1 className="mainTitle">Help Desk Details</h1></div>
                            <div className="dFlex">
                                <div>
                                    <PrimaryButton
                                        className="btn btn-danger justifyright floatright"
                                        text="Back"
                                        onClick={onClickClose}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <div className="customebreadcrumb">
                                <Breadcrumb
                                    items={props.breadCrumItems}
                                    maxDisplayedItems={3}
                                    ariaLabel="Breadcrumb with items rendered as buttons"
                                    overflowAriaLabel="More links"
                                />
                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <section className="mt-3">
                                <div className="container-fluid">

                                    <div className="row">
                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Help Desk Description")) && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4 ">
                                                <label className="viewLabel" > Help Desk Description </label >
                                                <div className="mt1 listDetail inputText"> {itemDetail?.Title} </div>
                                            </div>
                                        )}
                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Starting Date")) && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Starting Date Time
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.StartingDateTime}</div>
                                                </div>
                                            </div>
                                        )}
                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Completion Date")) && itemDetail?.CompletionDateTime && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Completion Date Time
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.CompletionDateTime}</div>
                                                </div>
                                            </div>
                                        )}
                                        {(!FieldData || FieldData?.length === 0 || FieldData[0]?.Field?.includes("Completion Date")) && itemDetail?.CompletionDateTime && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Duration
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.Duration}</div>
                                                </div>
                                            </div>
                                        )}
                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Call Type")) && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Call Type
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.CallType}</div>
                                                </div>
                                            </div>
                                        )}
                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Caller")) && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Caller
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.Caller}</div>
                                                </div>
                                            </div>
                                        )}
                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("CallType")) && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Call Type
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.CallType}</div>
                                                </div>
                                            </div>
                                        )}
                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Location")) && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Location
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.Location}</div>
                                                </div>
                                            </div>
                                        )}
                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Sub Location")) && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Sub Location
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.SubLocation}</div>
                                                </div>
                                            </div>
                                        )}
                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Area")) && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Area
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.Area}</div>
                                                </div>
                                            </div>
                                        )}
                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Category")) && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Category
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.HDCategory}</div>
                                                </div>
                                            </div>
                                        )}
                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Reported Help Desk")) && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Report HelpDesk
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.ReportHelpDesk}</div>
                                                </div>
                                            </div>
                                        )}
                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Status")) && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Status
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.HDStatus}</div>
                                                </div>
                                            </div>
                                        )}
                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Event Name")) && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Event Name
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.EventName}</div>
                                                </div>
                                            </div>
                                        )}
                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Priority")) && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Priority
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.QCPriority}</div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Site Name
                                                </label>
                                                <div className="mt1 listDetail inputText">{itemDetail?.SiteName}</div>
                                            </div>
                                        </div>

                                        {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Help Desk Name")) && (
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Help Desk Name
                                                    </label>
                                                    <div className="mt1 listDetail inputText">{itemDetail?.HelpDeskName}</div>
                                                </div>
                                            </div>

                                        )}
                                    </div>
                                    {/* <div className="row">
                                        <div className="col-md-12 col-sm-12 col-12 mb-3 textRight">
                                            <PrimaryButton
                                                style={{ margin: "5px", marginTop: "10px" }}
                                                className="btn btn-danger"
                                                text="Back"
                                                onClick={onClickClose}
                                            />
                                        </div>
                                    </div> */}
                                </div>
                            </section>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 mb-3">
                            <PrimaryButton
                                className="btn btn-danger justifyright floatright"
                                text="Back"
                                onClick={onClickClose}
                            />
                        </div>

                    </div>
                </div>
            </div >
        </div >



    </>;
};
