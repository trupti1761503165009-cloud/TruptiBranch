import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { IQuayCleanState } from "../../QuayClean";
import { IClientResponseItemView } from "../../../../../Interfaces/IClientResponse";
import { Loader } from "../../CommonComponents/Loader";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ConvertDateToStringFormat, getListImageFieldURL, logGenerator, removeElementOfBreadCrum, UserActivityLog } from "../../../../../Common/Util";
import { PrimaryButton } from "office-ui-fabric-react";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { Breadcrumb } from "@fluentui/react";
import { DateFormat } from "../../../../../Common/Constants/CommonConstants";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import moment from "moment";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');

export interface IClientResponseViewProps {
    provider: IDataProvider;
    context: WebPartContext;
    isAddNewProject?: boolean;
    manageComponentView(componentProp: IQuayCleanState): any;
    siteMasterId?: number;
    breadCrumItems: IBreadCrum[];
    loginUserRoleDetails: any;
    componentProps: IQuayCleanState;
    originalSiteMasterId: any;
    view?: any;
}

export interface IClientResponseViewState {

}

export const ClientResponseView = (props: IClientResponseViewProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [itemDetail, setItemDetail] = React.useState<IClientResponseItemView>();
    const isCall = React.useRef<boolean>(true);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail } = appGlobalState;
    const { siteMasterId } = props;

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
        }
        return [];
    };

    const _userActivityLog = async () => {
        try {
            let orgSiteId = props?.componentProps?.originalSiteMasterId;
            let data = await getState(orgSiteId);
            if (data[0]?.QCStateId) {
                const todayDate = moment().format("YYYY-MM-DD");
                const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
                let filterSiteNameId = orgSiteId || itemDetail?.SiteNameId;
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    listName: ListNames.UserActivityLog,
                    filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityId eq '${!!itemDetail && itemDetail.Id}' and SiteNameId eq '${filterSiteNameId}' and EntityType eq '${UserActionEntityTypeEnum.ClientResponse}' and ActionType eq 'Details View' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
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
                        SiteNameId: filterSiteNameId,
                        ActionType: UserActivityActionTypeEnum.DetailsView,
                        Email: currentUserRoleDetail?.emailId,
                        EntityType: UserActionEntityTypeEnum.ClientResponse,
                        EntityId: siteMasterId,
                        EntityName: itemDetail?.Title,
                        Count: 1,
                        Details: "Details View",
                        StateId: data[0]?.QCStateId
                    };
                    void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
                }
                isCall.current = false;
            }
        } catch (error) {
            console.error("Error fetching user activity log:", error);
        } finally {
            // setIsLoading(false);
        }
    };
    React.useEffect(() => {
        if (!!itemDetail && itemDetail?.Title !== "" && isCall.current == true) {
            isCall.current = false;
            _userActivityLog();
        }
    }, [itemDetail]);

    const getClientResponseDetailByID = (Id: number) => {
        if (!!Id) {
            const selectItem = ["Id,Title,IsCompleted,LogInTime,Area,ResponseCompletionDate,Request,WhoAreInvolved,HasTheSolutionWorked,BeforeImage1,BeforeImage2,AfterImage1,AfterImage2,SiteName/Id,SiteName/Title,Building,Feedback"];
            const expandItem = ["SiteName"];
            const filter = `ID eq ${Id}`;
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.ClientResponse,
                select: selectItem,
                expand: expandItem,
                filter: filter,
                id: Id
            };
            return props.provider.getByItemByIDQuery(queryOptions);
        }
    };

    React.useEffect(() => {
        try {
            setIsLoading(true);
            // eslint-disable-next-line no-void
            void (async () => {
                if (siteMasterId && siteMasterId > 0) {
                    const objItem = await getClientResponseDetailByID(siteMasterId);
                    const items: IClientResponseItemView = {
                        Id: objItem.Id,
                        Title: !!objItem.Title ? objItem.Title : "",
                        SiteName: !!objItem.SiteName ? objItem.SiteName.Title : "",
                        SiteNameId: !!objItem.SiteName ? objItem.SiteName.Id : 0,
                        Area: !!objItem.Area ? objItem.Area : "",
                        Request: !!objItem.Request ? objItem.Request : "",
                        ResponseCompletionDate: !!objItem.ResponseCompletionDate ? ConvertDateToStringFormat(objItem.ResponseCompletionDate, "DD/MM/YYYY hh:mm A") : "",
                        LogInTime: !!objItem.LogInTime ? ConvertDateToStringFormat(objItem.LogInTime, DateFormat) : "",
                        WhoAreInvolved: !!objItem.WhoAreInvolved ? objItem.WhoAreInvolved : "",
                        HasTheSolutionWorked: !!objItem.HasTheSolutionWorked ? "Yes" : "No",
                        IsCompleted: !!objItem.IsCompleted ? "Yes" : "No",
                        Building: !!objItem.Building ? objItem.Building : "",
                        Feedback: !!objItem.Feedback ? objItem.Feedback : "",
                        BeforeImage1: getListImageFieldURL(objItem, "BeforeImage1", notFoundImage),
                        BeforeImage2: getListImageFieldURL(objItem, "BeforeImage2", notFoundImage),
                        AfterImage1: getListImageFieldURL(objItem, "AfterImage1", notFoundImage),
                        AfterImage2: getListImageFieldURL(objItem, "AfterImage2", notFoundImage),
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
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect ClientResponseView"
            };
            void logGenerator(props.provider, errorObj);
        }
    }, []);

    const onClickClose = () => {
        if (props?.componentProps?.originalSiteMasterId && props?.componentProps?.dataObj) {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AddNewSite, view: props?.componentProps?.view, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "ClientResponseListKey", originalSiteMasterId: props.originalSiteMasterId
            });
        } else {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            props.manageComponentView({ currentComponentName: ComponentNameEnum.ClientResponseList, view: props?.componentProps?.view, breadCrumItems: breadCrumItems });
        }
    };

    return <>
        {isLoading && <Loader />}

        <div className="boxCard">
            <div className="formGroup">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween">
                            <div><h1 className="mainTitle">Client Response View</h1></div>
                            <div className="dFlex">
                                <div>
                                    <PrimaryButton className="btn btn-danger justifyright floatright"
                                        onClick={onClickClose}
                                        text="Back" />
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
                            <div className="mt-20">
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4"><label className="viewLabel" >Log In Time </label ><div className="mt1 listDetail inputText">   {itemDetail?.LogInTime}     </div></div>
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4 "><label className="viewLabel" >Client Name </label ><div className="mt1 listDetail inputText"> {itemDetail?.Title}      </div></div>
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4 "><label className="viewLabel" >Location </label ><div className="mt1 listDetail inputText">  {itemDetail?.Area}    </div></div>
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4 "><label className="viewLabel" >Sub Location</label ><div className="mt1 listDetail inputText">     {itemDetail?.Building}  </div></div>
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4 "><label className="viewLabel" >Request</label ><div className="mt1 listDetail inputText">     {itemDetail?.Request}  </div></div>
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4 "><label className="viewLabel" >Who Are Involved </label ><div className="mt1 listDetail inputText"> {itemDetail?.WhoAreInvolved}    </div></div>
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4 "><label className="viewLabel" >Has The Solution Worked? </label ><div className="mt1 listDetail inputText">     {itemDetail?.HasTheSolutionWorked}  </div></div>
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4 "><label className="viewLabel" >Is Completed? </label ><div className="mt1 listDetail inputText">     {itemDetail?.IsCompleted}  </div></div>
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4"><label className="viewLabel" >Responese Completion Date </label ><div className="mt1 listDetail inputText">   {itemDetail?.ResponseCompletionDate}     </div></div>
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4 "><label className="viewLabel" >Site Name </label ><div className="mt1 listDetail inputText">  {itemDetail?.SiteName}     </div></div>
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4 "><label className="viewLabel" >Cleaning Feedback </label ><div className="mt1 listDetail inputText"> {itemDetail?.Feedback}      </div></div>
                            </div>
                        </div>

                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <div className="mt-20">
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3"><label className="viewLabel">Before Image 1</label ><div className="mt1 listDetail inputText">   <img src={`${itemDetail?.BeforeImage1}`} alt="Before Image 1" style={{ height: '170px', width: '300px' }} />     </div></div>
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3"><label className="viewLabel">Before Image 2 </label ><div className="mt1 listDetail inputText">   <img src={`${itemDetail?.BeforeImage2}`} alt="Before Image 2" style={{ height: '170px', width: '300px' }} />     </div></div>
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3"><label className="viewLabel">After Image 1 </label ><div className="mt1 listDetail inputText">   <img src={`${itemDetail?.AfterImage1}`} alt="After Image 1" style={{ height: '170px', width: '300px' }} />     </div></div>
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3"><label className="viewLabel">After Image 2</label ><div className="mt1 listDetail inputText">    <img src={`${itemDetail?.AfterImage2}`} alt="After Image 2" style={{ height: '170px', width: '300px' }} />    </div></div>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-12 col-sm-12 col-12 mb-3 textRight">
                            <PrimaryButton
                                style={{ margin: "5px", marginTop: "10px" }}
                                className="btn btn-danger"
                                text="Back"
                                onClick={onClickClose}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>;
};