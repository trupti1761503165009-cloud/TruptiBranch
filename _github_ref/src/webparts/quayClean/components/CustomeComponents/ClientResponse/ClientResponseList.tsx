/* eslint-disable @typescript-eslint/no-use-before-define */
import { Link, PrimaryButton, SelectionMode, TooltipHost } from "@fluentui/react";
import * as React from "react";
import { ComponentNameEnum, IsCompletedData, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ConvertDateToStringFormat, UserActivityLog, _onItemSelected, generateExcelTable, getListImageFieldURL, logGenerator, onBreadcrumbItemClicked, scrollFunction, showPremissionDeniedPage } from "../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IClientResponseItemView, IClientResponseListProps } from "../../../../../Interfaces/IClientResponse";
import { Loader } from "../../CommonComponents/Loader";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { toastService } from "../../../../../Common/ToastService";
import CustomModal from "../../CommonComponents/CustomModal";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { DateFormat, DateTimeFormate } from "../../../../../Common/Constants/CommonConstants";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import moment from "moment";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom, appSiteStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { ClientResponseDetailsCardView } from "./ClientResponseDetailsCardView";
import { MultipleSiteFilter } from "../../../../../Common/Filter/MultipleSiteFilter";
import { IExportColumns } from "../UserActivityLog";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');

export const ClientResponseList: React.FC<IClientResponseListProps> = (props) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const [columnsClientResponse, setcolumnsClientResponse] = React.useState<any>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [clientResponseListItems, setClientResponseListItems] = React.useState<IClientResponseItemView[]>([]);
    const [filteredItems, setFilteredItems] = React.useState<IClientResponseItemView[]>([]);
    const [reloadGrid, setReloadGrid] = React.useState(false);
    const tooltipId = useId('tooltip');
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [IsCompleted, setIsCompleted] = React.useState<any>();
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [buildingOption, setBuildingOption] = React.useState<any[]>([]);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [selectedBuilding, setSelectedBuilding] = React.useState<any>();
    const isVisibleCrud = React.useRef<boolean>(false);
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const appSiteState = useAtomValue(appSiteStateAtom);
    const { PermissionArray } = appSiteState;
    const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : 'grid');
    const UpdateItemArray = React.useRef<any>(null);

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setCurrentView('card');
        } else {
            setCurrentView('grid');
        }
    }, []);

    const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>([]);
    const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>([]);
    const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>([]);
    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSiteIds(siteIds);
        setSelectedSiteTitles(siteTitles);
        setSelectedSCSites(siteSC);
    };

    const _closeDeleteConfirmation = (): void => {
        toggleHideDialog();
    };

    const _confirmDeleteItem = async (): Promise<void> => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');

        try {
            if (!!UpdateItem) {
                const processUpdateItem = (input: any) => {
                    if (Array.isArray(input)) {
                        return input.map(item => ({
                            Id: item.Id,
                            IsDeleted: true
                        }));
                    } else if (typeof input === 'object' && input !== null) {
                        return [{ Id: input.Id, IsDeleted: true }];
                    } else {
                        return [];
                    }
                };
                const items = Array.isArray(UpdateItem) && UpdateItem.length > 0 ? UpdateItem : [UpdateItem];
                items.forEach((res: any) => {
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: res?.SiteNameId,
                        ActionType: UserActivityActionTypeEnum.Delete,
                        EntityType: UserActionEntityTypeEnum.ClientResponse,
                        EntityId: res?.Id,
                        EntityName: res?.Title,
                        Details: `Delete Client Response`,
                        StateId: props?.qCStateId
                    };
                    void UserActivityLog(provider, logObj, currentUserRoleDetail);
                });
                const newObjects = processUpdateItem(UpdateItem);
                if (newObjects.length > 0) {
                    await provider.updateListItemsInBatchPnP(ListNames.ClientResponse, newObjects)
                }
                toastService.updateLoadingWithSuccess(toastId, "Record deleted successfully");
                toggleHideDialog();
                setisDisplayEDbtn(false);
                setReloadGrid(true);
            }
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  _confirmDeleteItem",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_confirmDeleteItem ClientResponseList"
            };
            void logGenerator(provider, errorObj);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const onclickExportToExcel = async () => {
        try {
            let exportColumns: IExportColumns[] = [
                {
                    header: "Login Time",
                    key: "LogInTime"
                },
                {
                    header: "Client Name",
                    key: "Title"
                },
                {
                    header: "Location",
                    key: "Area"
                },
                {
                    header: "Sub Location",
                    key: "Building"
                },
                {
                    header: "Request",
                    key: "Request"
                },
                {
                    header: "Who Are Involved",
                    key: "WhoAreInvolved"
                },
                {
                    header: "Has the solution worked",
                    key: "HasTheSolutionWorked"
                },
                {
                    header: "Is Completed",
                    key: "IsCompleted"
                },
                {
                    header: "Cleaning Feedback",
                    key: "Feedback"
                },

            ];
            let filename = props?.componentProps?.siteName ? props?.componentProps?.siteName : "Master" + "_ClientResponse";
            generateExcelTable(filteredItems, exportColumns, `${filename}.xlsx`);
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickExportToExcel", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }
    };

    React.useEffect(() => {
        if (!!props.siteMasterId) {
            setcolumnsClientResponse([
                {
                    key: "Action", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 50, maxWidth: 100,
                    onRender: ((itemID: IClientResponseItemView) => {

                        return <>
                            <div className='dflex'>
                                <div>
                                    <div><Link className="actionBtn btnView dticon" onClick={() => {
                                    }}>
                                        <TooltipHost
                                            content={"Details"}
                                            id={tooltipId}
                                        >
                                            <div onClick={() => _onclickDetailsView(itemID)}>
                                                <FontAwesomeIcon icon="eye" /></div>
                                        </TooltipHost>
                                    </Link></div >
                                </div>
                            </div>
                        </>;
                    })
                },
                {
                    key: 'Title', name: 'Client Name', fieldName: 'Title', isResizable: true, minWidth: 140, maxWidth: 200, isSortingRequired: true,
                    onRender: (item: any) => {
                        if (item.Title != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.Title} id={tooltipId}>
                                            <div onClick={() => _onItemName(item)}>{item.Title}</div>
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
                { key: 'LogInTime', name: 'Log In Time', fieldName: 'LogInTime', minWidth: 160, maxWidth: 180, isSortingRequired: true },
                {
                    key: "Area", name: 'Location', fieldName: 'Area', isResizable: true, minWidth: 340, maxWidth: 400, isSortingRequired: true,
                    onRender: (item: any) => {
                        if (item.Area != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.Area} id={tooltipId}>
                                            {item.Area}
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
                { key: 'Building', name: 'Sub Location', fieldName: 'Building', isResizable: true, minWidth: 120, maxWidth: 180, isSortingRequired: true },
                { key: 'Status', name: 'Request', fieldName: 'Request', minWidth: 120, maxWidth: 180, isResizable: true, isSortingRequired: true },
                { key: 'WhoAreInvolved', name: 'Who Are Involved', isResizable: true, fieldName: 'WhoAreInvolved', minWidth: 140, maxWidth: 150, isSortingRequired: true },
                { key: 'HasTheSolutionWorked', name: 'Has The Solution Worked?', fieldName: 'HasTheSolutionWorked', minWidth: 120, maxWidth: 140, isSortingRequired: true },
                { key: 'IsCompleted', name: 'Is Completed?', fieldName: 'IsCompleted', minWidth: 120, maxWidth: 140, isSortingRequired: true },
                { key: 'Completion Date', name: 'Response Completion Date', fieldName: 'ResponseCompletionDate', minWidth: 160, maxWidth: 180, isSortingRequired: true },
                {
                    key: 'BeforeImage1', name: 'Before Image 1', fieldName: 'BeforeImage1ThumbnailUrl', minWidth: 100, maxWidth: 150,
                    onRender: (item: IClientResponseItemView) => (
                        <img src={!!item.BeforeImage1ThumbnailUrl ? item.BeforeImage1ThumbnailUrl : require('../../../assets/images/imgalt.svg')} alt="Photo" className="course-img-first" style={{ height: "75px", width: '110px', objectFit: "cover" }} />
                    ),
                },
                {
                    key: 'BeforeImage2', name: 'Before Image 2', fieldName: 'BeforeImage2ThumbnailUrl', minWidth: 100, maxWidth: 150,
                    onRender: (item: IClientResponseItemView) => (
                        <img src={!!item.BeforeImage2ThumbnailUrl ? item.BeforeImage2ThumbnailUrl : require('../../../assets/images/imgalt.svg')} alt="Photo" className="course-img-first" style={{ height: "75px", width: '110px', objectFit: "cover" }} />
                    ),
                },
                {
                    key: 'AfterImage1', name: 'After Image 1', fieldName: 'AfterImage1ThumbnailUrl', minWidth: 100, maxWidth: 150,
                    onRender: (item: IClientResponseItemView) => (
                        <img src={!!item.AfterImage1ThumbnailUrl ? item.AfterImage1ThumbnailUrl : require('../../../assets/images/imgalt.svg')} alt="Photo" className="course-img-first" style={{ height: "75px", width: '110px', objectFit: "cover" }} />
                    ),
                },
                {
                    key: 'AfterImage2', name: 'After Image 2', fieldName: 'AfterImage2ThumbnailUrl', minWidth: 100, maxWidth: 150,
                    onRender: (item: IClientResponseItemView) => (
                        <img src={!!item.AfterImage2ThumbnailUrl ? item.AfterImage2ThumbnailUrl : require('../../../assets/images/imgalt.svg')} alt="Photo" className="course-img-first" style={{ height: "75px", width: '110px', objectFit: "cover" }} />
                    ),
                },
                {
                    key: "Feedback", name: 'Cleaning Feedback', fieldName: 'Feedback', isResizable: true, minWidth: 140, maxWidth: 270, isSortingRequired: true,
                    onRender: (item: any) => {
                        if (item.Feedback != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.Feedback} id={tooltipId}>
                                            {item.Feedback}
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
            ]);
        } else {
            setcolumnsClientResponse([
                {
                    key: "Action", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 50, maxWidth: 100,
                    onRender: ((itemID: IClientResponseItemView) => {

                        return <>
                            <div className='dflex'>
                                <div>
                                    <Link className="actionBtn btnView dticon" onClick={() => {
                                        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                        breadCrumItems.push({ text: itemID?.Title, key: itemID?.Title, currentCompomnetName: ComponentNameEnum.ClientResponseView, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.ClientResponseView, dataObj: props.componentProps.dataObj, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems } });
                                        props.manageComponentView({
                                            currentComponentName: ComponentNameEnum.ClientResponseView, dataObj: props.componentProps.dataObj, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId || itemID.SiteNameId
                                        });
                                    }}>
                                        <TooltipHost content={"View Detail"} id={tooltipId}>
                                            <FontAwesomeIcon icon="eye" />
                                        </TooltipHost>
                                    </Link>
                                </div>
                            </div>
                        </>;
                    })
                },
                {
                    key: 'SiteName', name: 'Site Name', fieldName: 'SiteName', isResizable: true, minWidth: 180, maxWidth: 280, isSortingRequired: true,
                    onRender: (item: any) => {
                        if (item.SiteName != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.SiteName} id={tooltipId}>
                                            {item.SiteName}
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
                {
                    key: 'Title', name: 'Client Name', fieldName: 'Title', isResizable: true, minWidth: 140, maxWidth: 200, isSortingRequired: true,
                    onRender: (item: any) => {
                        if (item.Title != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.Title} id={tooltipId}>
                                            <div onClick={() => _onItemName(item)}>{item.Title}</div>
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
                { key: 'LogInTime', name: 'Log In Time', fieldName: 'LogInTime', minWidth: 160, maxWidth: 180, isSortingRequired: true },
                {
                    key: "Area", name: 'Location', fieldName: 'Area', isResizable: true, minWidth: 340, maxWidth: 400, isSortingRequired: true,
                    onRender: (item: any) => {
                        if (item.Area != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.Area} id={tooltipId}>
                                            {item.Area}
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
                { key: 'Building', name: 'Sub Location', fieldName: 'Building', isResizable: true, minWidth: 120, maxWidth: 180, isSortingRequired: true },
                { key: 'Status', name: 'Request', fieldName: 'Request', minWidth: 120, maxWidth: 180, isResizable: true, isSortingRequired: true },
                { key: 'WhoAreInvolved', name: 'Who Are Involved', isResizable: true, fieldName: 'WhoAreInvolved', minWidth: 140, maxWidth: 150, isSortingRequired: true },
                { key: 'HasTheSolutionWorked', name: 'Has The Solution Worked?', fieldName: 'HasTheSolutionWorked', minWidth: 120, maxWidth: 140, isSortingRequired: true },
                { key: 'IsCompleted', name: 'Is Completed?', fieldName: 'IsCompleted', minWidth: 120, maxWidth: 140, isSortingRequired: true },
                { key: 'Completion Date', name: 'Response Completion Date', fieldName: 'ResponseCompletionDate', minWidth: 160, maxWidth: 180, isSortingRequired: true },
                {
                    key: 'BeforeImage1', name: 'Before Image 1', fieldName: 'BeforeImage1ThumbnailUrl', minWidth: 100, maxWidth: 150,
                    onRender: (item: IClientResponseItemView) => (
                        <img src={!!item.BeforeImage1ThumbnailUrl ? item.BeforeImage1ThumbnailUrl : require('../../../assets/images/imgalt.svg')} alt="Photo" className="course-img-first" style={{ height: "75px", width: '110px', objectFit: "cover" }} />
                    ),
                },
                {
                    key: 'BeforeImage2', name: 'Before Image 2', fieldName: 'BeforeImage2ThumbnailUrl', minWidth: 100, maxWidth: 150,
                    onRender: (item: IClientResponseItemView) => (
                        <img src={!!item.BeforeImage2ThumbnailUrl ? item.BeforeImage2ThumbnailUrl : require('../../../assets/images/imgalt.svg')} alt="Photo" className="course-img-first" style={{ height: "75px", width: '110px', objectFit: "cover" }} />
                    ),
                },
                {
                    key: 'AfterImage1', name: 'After Image 1', fieldName: 'AfterImage1ThumbnailUrl', minWidth: 100, maxWidth: 150,
                    onRender: (item: IClientResponseItemView) => (
                        <img src={!!item.AfterImage1ThumbnailUrl ? item.AfterImage1ThumbnailUrl : require('../../../assets/images/imgalt.svg')} alt="Photo" className="course-img-first" style={{ height: "75px", width: '110px', objectFit: "cover" }} />
                    ),
                },
                {
                    key: 'AfterImage2', name: 'After Image 2', fieldName: 'AfterImage2ThumbnailUrl', minWidth: 100, maxWidth: 150,
                    onRender: (item: IClientResponseItemView) => (
                        <img src={!!item.AfterImage2ThumbnailUrl ? item.AfterImage2ThumbnailUrl : require('../../../assets/images/imgalt.svg')} alt="Photo" className="course-img-first" style={{ height: "75px", width: '110px', objectFit: "cover" }} />
                    ),
                },
                {
                    key: "Feedback", name: 'Cleaning Feedback', fieldName: 'Feedback', isResizable: true, minWidth: 140, maxWidth: 270, isSortingRequired: true,
                    onRender: (item: any) => {
                        if (item.Feedback != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.Feedback} id={tooltipId}>
                                            {item.Feedback}
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
            ]);
        }
    }, []);

    const _getListItems = async (): Promise<any[]> => {
        const select = ["Id,Title,IsCompleted,LogInTime,BeforeImage1ThumbnailUrl,ResponseCompletionDate,BeforeImage2ThumbnailUrl,AfterImage1ThumbnailUrl,AfterImage2ThumbnailUrl, Area,Request,WhoAreInvolved,HasTheSolutionWorked,BeforeImage1,BeforeImage2,AfterImage1,AfterImage2,SiteNameId,SiteName/Id,SiteName/Title,Building,Feedback,Modified"];
        const expand = ["SiteName"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            expand: expand,
            listName: ListNames.ClientResponse,
            filter: !!props.siteMasterId ? `SiteNameId eq ${props.siteMasterId} and IsDeleted ne 1` : `IsDeleted ne 1`,
        };
        let siteNameIdArray: any[] = [];
        let adUserArray: any[] = [];
        let userRole: string = "Admin";

        return await provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
            if (!!results) {
                return results.map((data) => {
                    switch (userRole) {
                        case 'Admin':
                            return (
                                {
                                    Id: data.Id,
                                    Title: !!data.Title ? data.Title : "",
                                    SiteName: !!data.SiteName ? data.SiteName.Title : "",
                                    SiteNameId: !!data.SiteName ? data.SiteName.Id : 0,
                                    Area: !!data.Area ? data.Area : "",
                                    Request: !!data.Request ? data.Request : "",
                                    LogInTime: !!data.LogInTime ? ConvertDateToStringFormat(data.LogInTime, DateFormat) : "",
                                    ResponseCompletionDate: !!data.ResponseCompletionDate ? ConvertDateToStringFormat(data.ResponseCompletionDate, DateTimeFormate) : "",
                                    WhoAreInvolved: !!data.WhoAreInvolved ? data.WhoAreInvolved : "",
                                    HasTheSolutionWorked: !!data.HasTheSolutionWorked ? "Yes" : "No",
                                    IsCompleted: !!data.IsCompleted ? "Yes" : "No",
                                    Building: !!data.Building ? data.Building : "",
                                    Feedback: !!data.Feedback ? data.Feedback : "",
                                    BeforeImage1: getListImageFieldURL(data, "BeforeImage1", notFoundImage),
                                    BeforeImage2: getListImageFieldURL(data, "BeforeImage2", notFoundImage),
                                    AfterImage1: getListImageFieldURL(data, "AfterImage1", notFoundImage),
                                    AfterImage2: getListImageFieldURL(data, "AfterImage2", notFoundImage),
                                    BeforeImage1ThumbnailUrl: !!data.BeforeImage1ThumbnailUrl ? data.BeforeImage1ThumbnailUrl : notFoundImage,
                                    BeforeImage2ThumbnailUrl: !!data.BeforeImage2ThumbnailUrl ? data.BeforeImage2ThumbnailUrl : notFoundImage,
                                    AfterImage1ThumbnailUrl: !!data.AfterImage1ThumbnailUrl ? data.AfterImage1ThumbnailUrl : notFoundImage,
                                    AfterImage2ThumbnailUrl: !!data.AfterImage2ThumbnailUrl ? data.AfterImage2ThumbnailUrl : notFoundImage,
                                    Modified: !!data.Modified ? data.Modified : null,

                                }
                            );

                            break;
                        case 'SiteManager':
                            if (siteNameIdArray.indexOf(data.SiteName.Id) > -1 && currentUserRoleDetail?.isSiteManager)
                                return (
                                    {
                                        Id: data.Id,
                                        Title: !!data.Title ? data.Title : "",
                                        SiteName: !!data.SiteName ? data.SiteName.Title : "",
                                        SiteNameId: !!data.SiteName ? data.SiteName.Id : 0,
                                        Area: !!data.Area ? data.Area : "",
                                        Request: !!data.Request ? data.Request : "",
                                        ResponseCompletionDate: !!data.ResponseCompletionDate ? ConvertDateToStringFormat(data.ResponseCompletionDate, DateTimeFormate) : "",
                                        LogInTime: !!data.LogInTime ? ConvertDateToStringFormat(data.LogInTime, DateFormat) : "",
                                        WhoAreInvolved: !!data.WhoAreInvolved ? data.WhoAreInvolved : "",
                                        HasTheSolutionWorked: !!data.HasTheSolutionWorked ? "Yes" : "No",
                                        IsCompleted: !!data.IsCompleted ? "Yes" : "No",
                                        Building: !!data.Building ? data.Building : "",
                                        Feedback: !!data.Feedback ? data.Feedback : "",
                                        BeforeImage1: getListImageFieldURL(data, "BeforeImage1", notFoundImage),
                                        BeforeImage2: getListImageFieldURL(data, "BeforeImage2", notFoundImage),
                                        AfterImage1: getListImageFieldURL(data, "AfterImage1", notFoundImage),
                                        AfterImage2: getListImageFieldURL(data, "AfterImage2", notFoundImage),
                                        BeforeImage1ThumbnailUrl: !!data.BeforeImage1ThumbnailUrl ? data.BeforeImage1ThumbnailUrl : notFoundImage,
                                        BeforeImage2ThumbnailUrl: !!data.BeforeImage2ThumbnailUrl ? data.BeforeImage2ThumbnailUrl : notFoundImage,
                                        AfterImage1ThumbnailUrl: !!data.AfterImage1ThumbnailUrl ? data.AfterImage1ThumbnailUrl : notFoundImage,
                                        AfterImage2ThumbnailUrl: !!data.AfterImage2ThumbnailUrl ? data.AfterImage2ThumbnailUrl : notFoundImage,
                                        Modified: !!data.Modified ? data.Modified : null,
                                    }
                                );

                            break;
                        case 'User':
                            if (adUserArray.indexOf(data.SiteName.Id) > -1 && currentUserRoleDetail?.isUser)
                                return (
                                    {
                                        Id: data.Id,
                                        Title: !!data.Title ? data.Title : "",
                                        SiteName: !!data.SiteName ? data.SiteName.Title : "",
                                        SiteNameId: !!data.SiteName ? data.SiteName.Id : 0,
                                        Area: !!data.Area ? data.Area : "",
                                        Request: !!data.Request ? data.Request : "",
                                        ResponseCompletionDate: !!data.ResponseCompletionDate ? ConvertDateToStringFormat(data.ResponseCompletionDate, DateTimeFormate) : "",
                                        LogInTime: !!data.LogInTime ? ConvertDateToStringFormat(data.LogInTime, DateFormat) : "",
                                        WhoAreInvolved: !!data.WhoAreInvolved ? data.WhoAreInvolved : "",
                                        HasTheSolutionWorked: !!data.HasTheSolutionWorked ? "Yes" : "No",
                                        IsCompleted: !!data.IsCompleted ? "Yes" : "No",
                                        Building: !!data.Building ? data.Building : "",
                                        Feedback: !!data.Feedback ? data.Feedback : "",
                                        BeforeImage1: getListImageFieldURL(data, "BeforeImage1", notFoundImage),
                                        BeforeImage2: getListImageFieldURL(data, "BeforeImage2", notFoundImage),
                                        AfterImage1: getListImageFieldURL(data, "AfterImage1", notFoundImage),
                                        AfterImage2: getListImageFieldURL(data, "AfterImage2", notFoundImage),
                                        BeforeImage1ThumbnailUrl: !!data.BeforeImage1ThumbnailUrl ? data.BeforeImage1ThumbnailUrl : notFoundImage,
                                        BeforeImage2ThumbnailUrl: !!data.BeforeImage2ThumbnailUrl ? data.BeforeImage2ThumbnailUrl : notFoundImage,
                                        AfterImage1ThumbnailUrl: !!data.AfterImage1ThumbnailUrl ? data.AfterImage1ThumbnailUrl : notFoundImage,
                                        AfterImage2ThumbnailUrl: !!data.AfterImage2ThumbnailUrl ? data.AfterImage2ThumbnailUrl : notFoundImage,
                                        Modified: !!data.Modified ? data.Modified : null,
                                    }
                                );

                            break;

                        default:
                            return ({});
                            break;
                    }

                });
            }
            return [];
        });
    };

    const _onItemSelected = (item: any): void => {
        if (item.length > 0) {
            let updateItem = item.map((i: any) => i.Id);
            UpdateItemArray.current = updateItem;
            if (item.length == 1) {
                setIsDisplayEditButtonview(true);
                setUpdateItem(item[0]);
            } else {
                setIsDisplayEditButtonview(false);
                setUpdateItem(item);
            }
            setisDisplayEDbtn(true);
        } else {
            UpdateItemArray.current = [];
            setUpdateItem(null);
            setisDisplayEDbtn(false);
        }
    };

    const onclickconfirmdelete = (predata: any) => {
        let data: any[] = [];
        if (!!predata.ID) {
            data.push(predata);
        }
        if (!!data && data.length > 0)
            setUpdateItem(data);
        toggleHideDialog();
    };

    const onclickEdit = (predata: any) => {
        try {
            setisDisplayEDbtn(false);
            if (!!UpdateItem) {
                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                breadCrumItems.push({ text: "Update", key: "Update", currentCompomnetName: ComponentNameEnum.ClientResponseView, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.ClientResponseForm, dataObj: props.componentProps.dataObj, siteMasterId: UpdateItem.Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems } });
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.ClientResponseForm, IsUpdate: true, editItemId: UpdateItemArray.current, dataObj: props.componentProps.dataObj, siteMasterId: UpdateItem.Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.originalSiteMasterId
                });
            }
            let data: any[] = [];
            if (!!predata.ID) {
                data.push(predata);
                if (!!data) {
                    let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                    breadCrumItems.push({ text: "Update", key: "Update", currentCompomnetName: ComponentNameEnum.ClientResponseView, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.ClientResponseForm, dataObj: props.componentProps.dataObj, siteMasterId: data[0].Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems } });
                    props.manageComponentView({
                        currentComponentName: ComponentNameEnum.ClientResponseForm, IsUpdate: true, editItemId: UpdateItemArray.current, dataObj: props.componentProps.dataObj, siteMasterId: data[0].Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.originalSiteMasterId
                    });

                }
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickEdit", CustomErrormessage: "error in on click edit", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };

    const _onclickDetailsView = (itemID: any) => {
        try {
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({ text: itemID?.Title, key: itemID?.Title, currentCompomnetName: ComponentNameEnum.ClientResponseView, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.ClientResponseView, dataObj: props.componentProps.dataObj, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems } });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.ClientResponseView, view: currentView, dataObj: props.componentProps.dataObj, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId || itemID.SiteNameId
            });
        } catch (error) {
            const errorObj = { ErrorMethodName: "_onclickDetailsView", CustomErrormessage: "error in on click details view", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }
    };

    React.useEffect(() => {
        (async () => {
            let custfilter;
            if (props?.originalSiteMasterId) {
                custfilter = `Title eq 'Building' and IsActive eq 1 and SiteNameId eq '${props?.originalSiteMasterId}'`;
            } else {
                custfilter = `Title eq 'Building' and IsActive eq 1`;
            }
            const select = ["Id,Title,ChoiceValue"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: custfilter,
                listName: ListNames.ClientResponseChoices
            };
            let dropvalue: any = [];
            dropvalue.push({ key: '', text: '', value: '', label: " --All Building--" });
            provider.getItemsByQuery(queryStringOptions).then((response: any) => {
                response.map((State: any) => {
                    dropvalue.push({ value: State.ChoiceValue, key: State.ChoiceValue, text: State.ChoiceValue, label: State.ChoiceValue });
                });
                setBuildingOption(dropvalue);
            }).catch((error) => {
                console.log(error);
            });
        })();

        const className = document.querySelector('ARTICLE')?.children[0].children[0].classList[0];
        let el: any = document.querySelector(!!className ? `.${className}` : "");
        if (!!el) {
            el.onscroll = function () {
                scrollFunction(175);
            };
        }
    }, [isRefreshGrid]);

    React.useEffect(() => {
        let permssiion = showPremissionDeniedPage(currentUserRoleDetail);
        if (permssiion.length == 0) {
            props.manageComponentView({ currentComponentName: ComponentNameEnum.AccessDenied });
        }
        try {
            setIsLoading(true);
            // eslint-disable-next-line no-void
            void (async () => {
                let items = await _getListItems();

                let filteredData: any[];
                if (!!props.siteMasterId || props?.componentProps?.loginUserRoleDetails?.isAdmin) {
                    filteredData = items;
                } else {
                    let AllSiteIds: any[] = props?.componentProps?.loginUserRoleDetails?.currentUserAllCombineSites || [];
                    filteredData = !!items && items?.filter(item =>
                        AllSiteIds.includes(item?.SiteNameId)
                    );
                }
                filteredData = filteredData?.sort((a: any, b: any) => {
                    return moment(b.Modified).diff(moment(a.Modified));
                });
                setClientResponseListItems(filteredData);
                // setClientResponseListItems(items.filter(r => !!r && !!r.Id));
                setIsLoading(false);
                setReloadGrid(false);
            })();
        } catch (error) {
            setIsLoading(false);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect ClientResponseList"
            };
            void logGenerator(provider, errorObj);
        }
    }, [reloadGrid, isRefreshGrid]);


    React.useEffect(() => {
        const filterList = async (): Promise<void> => {
            setIsLoading(true);
            let filteredData = clientResponseListItems;
            if (selectedBuilding) {
                filteredData = filteredData.filter(x => x.Building === selectedBuilding);
            }
            if (IsCompleted) {
                filteredData = filteredData.filter(x => x.IsCompleted === IsCompleted);
            }
            if (selectedSiteIds.length > 0 && Array.isArray(selectedSiteIds)) {
                filteredData = filteredData.filter(x => selectedSiteIds.includes(x.SiteNameId));
            }
            setFilteredItems(filteredData);
            setIsLoading(false);
        };

        void filterList();
    }, [selectedBuilding, clientResponseListItems, IsCompleted, selectedSiteIds]);

    const _onItemInvoked = (itemID: any): void => {
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({ text: itemID?.Title, key: itemID?.Title, currentCompomnetName: ComponentNameEnum.ClientResponseView, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.ClientResponseView, dataObj: props.componentProps.dataObj, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems } });
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.ClientResponseView, dataObj: props.componentProps.dataObj, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId
        });
    };

    const _onItemName = (itemID: any): void => {
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({ text: itemID?.Title, key: itemID?.Title, currentCompomnetName: ComponentNameEnum.ClientResponseView, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.ClientResponseView, dataObj: props.componentProps.dataObj, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems } });
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.ClientResponseView, dataObj: props.componentProps.dataObj, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId
        });
    };
    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };
    React.useEffect(() => {
        let isVisibleCrud1 = (!!PermissionArray && PermissionArray?.includes('Client Response') || currentUserRoleDetail?.isStateManager || currentUserRoleDetail?.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(currentUserRoleDetail?.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;
    }, []);

    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {isLoading && <Loader />}

            <CustomModal isModalOpenProps={hideDialog}
                setModalpopUpFalse={_closeDeleteConfirmation}
                subject={"Delete Item"}
                message={'Are you sure, you want to delete this record?'}
                yesButtonText="Yes"
                closeButtonText={"No"}
                onClickOfYes={_confirmDeleteItem} />
            <div className={!!props.siteMasterId ? "" : "boxCard"}>
                {!props.siteMasterId && <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                        <h1 className="mainTitle">Client Response</h1>
                    </div>
                </div>}
                <div className="formGroup">

                    <div className="ms-Grid mt-15">
                        <div className="ms-Grid-row ptop-5">
                            {!props.siteMasterId && <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2">
                                <div className="formControl">
                                    <div className="">
                                        <MultipleSiteFilter
                                            isPermissionFiter={true}
                                            loginUserRoleDetails={currentUserRoleDetail}
                                            selectedSiteIds={selectedSiteIds}
                                            selectedSiteTitles={selectedSiteTitles}
                                            selectedSCSite={selectedSCSites}
                                            onSiteChange={handleSiteChange}
                                            provider={provider}
                                            isRequired={true}
                                            AllOption={true}
                                        />
                                    </div>
                                </div>
                            </div>}
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2">
                                <div className="formControl">
                                    <div className="">
                                        <ReactDropdown
                                            options={IsCompletedData}
                                            isMultiSelect={false}
                                            // onChange={onChangeIsCompleted}
                                            onChange={(option) => {
                                                setIsCompleted(option?.value);
                                            }}
                                            defaultOption={IsCompleted}
                                            placeholder="Select Is Completed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2">
                                <div className="formControl">
                                    <ReactDropdown
                                        options={buildingOption}
                                        placeholder="Select Building"
                                        isMultiSelect={false}
                                        defaultOption={selectedBuilding}
                                        onChange={(option) => {
                                            setSelectedBuilding(option?.value);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                {currentView === "grid" ? <>
                                    <MemoizedDetailList
                                        manageComponentView={props.manageComponentView}
                                        columns={columnsClientResponse as any}
                                        items={filteredItems || []}
                                        reRenderComponent={true}
                                        onSelectedItem={_onItemSelected}
                                        onItemInvoked={_onItemInvoked}
                                        CustomselectionMode={(!!props.siteMasterId && isVisibleCrud.current) ? SelectionMode.multiple : SelectionMode.none}
                                        addEDButton={isDisplayEDbtn && <>
                                            <div className='dflex'>

                                                <Link className="actionBtn iconSize btnEdit " onClick={onclickEdit}>
                                                    <TooltipHost content={"Edit Detail"} id={tooltipId}>
                                                        <FontAwesomeIcon icon="edit" />
                                                    </TooltipHost>
                                                </Link>
                                                <Link className="actionBtn iconSize btnDanger  ml-10" onClick={onclickconfirmdelete}>
                                                    <TooltipHost content={"Delete"} id={tooltipId}>
                                                        <FontAwesomeIcon icon="trash-alt" />
                                                    </TooltipHost>
                                                </Link>
                                            </div>
                                        </>}
                                        // itemSelected={ }
                                        searchable={true}
                                        isAddNew={true}
                                        addNewContent={
                                            <>
                                                <div className='dflex'>
                                                    {(!!filteredItems && filteredItems.length > 0) &&
                                                        <Link className="actionBtn clsexport iconSize btnEdit" onClick={onclickExportToExcel}
                                                            text="">
                                                            <TooltipHost
                                                                content={"Export to excel"}
                                                                id={tooltipId}
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={"file-excel"}
                                                                />
                                                            </TooltipHost>      </Link>

                                                    }
                                                    <Link className="actionBtn iconSize btnRefresh refresh-icon-m-hpc  ml-10" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                                        text="">
                                                        <TooltipHost
                                                            content={"Refresh Grid"}
                                                            id={tooltipId}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={"arrows-rotate"}
                                                            />
                                                        </TooltipHost>    </Link>
                                                    {!!props.siteMasterId && <>

                                                        {isVisibleCrud.current && <PrimaryButton text="Add" className="btn btn-primary " onClick={() => {
                                                            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                                            breadCrumItems.push({ text: "Add Form", key: "Add Form", currentCompomnetName: ComponentNameEnum.ClientResponseView, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.ClientResponseForm, dataObj: props.componentProps.dataObj, isAddNewSite: true, breadCrumItems: breadCrumItems } });
                                                            props.manageComponentView({ currentComponentName: ComponentNameEnum.ClientResponseForm, dataObj: props.componentProps.dataObj, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.originalSiteMasterId });
                                                            setIsLoading(false);
                                                        }} />}</>}
                                                </div>
                                            </>
                                        } />
                                </> :
                                    <>
                                        <div className='dflex'>
                                            {!!props.siteMasterId && <>

                                                {isVisibleCrud.current && <PrimaryButton text="Add" className="btn btn-primary " onClick={() => {
                                                    let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                                    breadCrumItems.push({ text: "Add Form", key: "Add Form", currentCompomnetName: ComponentNameEnum.ClientResponseView, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.ClientResponseForm, dataObj: props.componentProps.dataObj, isAddNewSite: true, breadCrumItems: breadCrumItems } });
                                                    props.manageComponentView({ currentComponentName: ComponentNameEnum.ClientResponseForm, dataObj: props.componentProps.dataObj, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.originalSiteMasterId });
                                                    setIsLoading(false);
                                                }} />}</>}
                                            <Link className="actionBtn iconSize btnRefresh refresh-icon-m-hpc" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                                text="">
                                                <TooltipHost
                                                    content={"Refresh Grid"}
                                                    id={tooltipId}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={"arrows-rotate"}
                                                    />
                                                </TooltipHost>    </Link>

                                        </div>
                                        <ClientResponseDetailsCardView
                                            items={filteredItems as any || []}
                                            siteMasterId={props.siteMasterId}
                                            _onclickDetailsView={_onclickDetailsView}
                                            manageComponentView={props.manageComponentView}
                                            _onclickEdit={onclickEdit}
                                            _onclickconfirmdelete={onclickconfirmdelete}
                                            isEditDelete={props?.siteMasterId ? true : false}
                                        />
                                    </>
                                }
                            </div>
                        </div>

                    </div>
                </div >
            </div>
        </>;
    }

};