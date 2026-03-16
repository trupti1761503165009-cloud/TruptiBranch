/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IQuayCleanState } from "../../QuayClean";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { appSiteStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { IColumn, Link, SelectionMode, TooltipHost } from "@fluentui/react";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { ListNames, UserActionEntityTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { ConvertDateToStringFormat, generateExcelTable, logGenerator, UserActivityLog } from "../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import AddEvent from "../../CommonComponents/AddEvents";
import CustomModal from "../../CommonComponents/CustomModal";
import { IExportColumns } from "../EquipmentChecklist/Question";
import { DateTimeFormate } from "../../../../../Common/Constants/CommonConstants";

export interface IEventsProps {
    provider: IDataProvider;
    context: WebPartContext;
    siteMasterId: any;
    manageComponentView(componentProp: IQuayCleanState): any;
    URL?: String;
    qCState?: string;
    siteName?: string;
    breadCrumItems: any[];
    componentProp: IQuayCleanState;
    loginUserRoleDetails: ILoginUserRoleDetails;
    IsSupervisor?: boolean;
    dataObj?: any;
    dataObj2?: any;
    view?: string;
}

export const Events = (props: IEventsProps) => {
    const appSiteState = useAtomValue(appSiteStateAtom);
    const { PermissionArray } = appSiteState;
    const isVisibleCrud = React.useRef<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [allDataForExcel, setDataForExcel] = React.useState<any>([]);
    const tooltipId = useId('tooltip');
    const [downloadDisable, setdownloadDisable] = React.useState<boolean>(true);
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [DeleteId, setDeleteId] = React.useState<any>();
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [columnsEvent, setcolumnsEvent] = React.useState<any>([]);
    const [FilteredData, setFilteredData] = React.useState<any>([]);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [isReload, setIsReload] = React.useState<boolean>(false);
    const [isDisplayEditPopup, setisDisplayEditPopup] = React.useState<boolean>(false);

    const _onSearchTextChangeForExcel = (data: any) => {
        setDataForExcel(data);
    };

    const getEventitems = () => {
        try {
            let filter = '';
            if (props.siteMasterId) {
                filter = `LinkFor eq 'Client Dashboard' and SiteNameId eq '${props.siteMasterId}'`;
            } else {
                filter = `LinkFor eq 'Client Dashboard'`;
            }
            let queryOptions: IPnPQueryOptions = {
                listName: ListNames.EventMaster,
                select: ['Id,Title,EventDateTime,EventLink,NewsEventType,Label,EventImage,SiteNameId,SiteName/Title,EventDescription,IsActive'],
                expand: ['SiteName'],
                filter: filter,
                orderBy: "EventDateTime",
                isSortOrderAsc: false
            };
            const stripHtml = (html: string) => {
                const temp = document.createElement("div");
                temp.innerHTML = html;
                return temp.textContent || temp.innerText || "";
            };

            props.provider.getItemsByQuery(queryOptions).then((results: any[]) => {
                if (!!results) {
                    const EventsData = results.map((data) => {
                        const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/AssetMaster/Attachments/' + data.ID + "/";
                        let EventImage;

                        if (data.EventImage) {
                            try {
                                const EventImageData = JSON?.parse(data?.EventImage);
                                if (EventImageData && EventImageData.serverRelativeUrl) {
                                    EventImage = EventImageData.serverRelativeUrl;
                                } else if (EventImageData && EventImageData.fileName) {
                                    EventImage = fixImgURL + EventImageData.fileName;
                                } else {
                                    EventImage = notFoundImage;
                                }
                            } catch (error) {
                                console.error("Error parsing EventImage JSON:", error);
                                setIsLoading(false);
                                EventImage = notFoundImage;
                            }
                        } else {
                            EventImage = notFoundImage;
                        }
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                EventDateTime: !!data.EventDateTime ? ConvertDateToStringFormat(data.EventDateTime, DateTimeFormate) : "",
                                OrgEventDateTime: !!data.EventDateTime ? data.EventDateTime : undefined,
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                                EventLink: !!data.EventLink ? data.EventLink?.Url : "",
                                NewsEventType: !!data.NewsEventType ? data.NewsEventType : "",
                                Label: !!data.Label ? data.Label : "",
                                EventDescription: data.EventDescription ? stripHtml(data.EventDescription).trim() : "",
                                EventImage: EventImage,
                                Image: !!data.EventImage ? data.EventImage.Url : "",
                                SiteName: !!data.SiteNameId ? data.SiteName.Title : "",
                                IsActive: !!data.IsActive ? data.IsActive : false,
                            }
                        );
                    });
                    setFilteredData(EventsData);

                }
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
                const errorObj = { ErrorMethodName: "getPicture", CustomErrormessage: "error in get picture", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "getPicture", CustomErrormessage: "error in get picture", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const _onItemSelected = (item: any): void => {
        if (item.length > 0) {
            if (item.length == 1) {
                setUpdateItem(item);
                setIsDisplayEditButtonview(true);
                setDeleteId(item[0].ID);
            } else {
                setUpdateItem(item);
                setIsDisplayEditButtonview(false);
                setUpdateItem(item);
            }
            setisDisplayEDbtn(true);
        } else {
            setUpdateItem([]);
            setDeleteId(0);
            setisDisplayEDbtn(false);
        }
    };

    const onclickExportToExcel = async () => {
        try {
            let exportColumns: IExportColumns[] = [
                {
                    header: "Event Title",
                    key: "Title"
                },
                {
                    header: "Event Date Time",
                    key: "EventDateTime"
                },
                {
                    header: "Site Name",
                    key: "SiteName"
                },
                {
                    header: "Event Link",
                    key: "EventLink"
                },
                {
                    header: "News Event Type",
                    key: "NewsEventType"
                },
                {
                    header: "Label",
                    key: "Label"
                },
                {
                    header: "Event Description",
                    key: "EventDescription"
                },
                {
                    header: "Event Image",
                    key: "Image"
                },

            ];
            generateExcelTable(FilteredData, exportColumns, `${!!props.siteName ? props.siteName + ' Events' : "Master Events"} .xlsx`);
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickExportToExcel", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };


    const onclickconfirmdelete = (predata: any) => {
        let data: any[] = [];
        if (!!predata?.ID) {
            data.push(predata);
        }
        if (!!data && data.length > 0)
            setUpdateItem(data);
        toggleHideDialog();
    };

    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };

    const _onItemInvoked = (item: any): void => {
    };

    const onclickdelete = async (predata?: any) => {
        setIsLoading(true);
        try {
            if (!!UpdateItem) {
                if (false) { console.log(0); }
                for (let index = 0; index < UpdateItem.length; index++) {
                    await props.provider.deleteItem(ListNames.EventMaster, UpdateItem[index].ID);
                }
            }
            const items = Array.isArray(UpdateItem) && UpdateItem.length > 0 ? UpdateItem : [UpdateItem];
            items.forEach((res: any) => {
                const logObj = {
                    UserName: props?.loginUserRoleDetails?.title,
                    SiteNameId: res?.SiteNameId,
                    ActionType: "Delete",
                    EntityType: UserActionEntityTypeEnum.Event,
                    EntityId: res?.ID,
                    EntityName: res?.Title,
                    Details: `Delete Event`
                };
                void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
            });

            getEventitems();
            setisDisplayEDbtn(false);
            setIsDisplayEditButtonview(false);
            toggleHideDialog();
            setIsLoading(false);
        }
        catch (ex) {
            const errorObj = {
                ErrorMessage: ex.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  onclickdelete",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onclickdelete"
            };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
            console.log(ex);
        }
    };

    React.useEffect(() => {
        let isVisibleCrud1 = (!!PermissionArray && PermissionArray.includes('Events') || props.loginUserRoleDetails.isStateManager || props.loginUserRoleDetails.isAdmin || props.loginUserRoleDetails?.siteManagerItem.filter((r: any) => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(props.loginUserRoleDetails.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;
        const EventColumn = (): IColumn[] => {
            let columns: any[] = [
                {
                    key: 'Photo', name: 'Event Image', fieldName: 'Image', minWidth: 110, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                    onRender: (item: any) => {
                        return (
                            <img src={item.Image} height="75px" width="110px" className="course-img-first" />
                        );
                    }
                },
                {
                    key: 'SiteName', name: 'Site Name', fieldName: 'SiteName', isResizable: true, minWidth: 140, maxWidth: 270, isSortingRequired: true,
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
                    key: "key1", name: 'Event Title', fieldName: 'Title', isResizable: true, minWidth: 120, maxWidth: 180, isSortingRequired: true,
                    onRender: (item: any) => {
                        if (item.Title != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.Title} id={tooltipId}>
                                            <div>{item.Title}</div>
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
                { key: "key2", name: 'Event Date Time', fieldName: 'EventDateTime', isResizable: true, minWidth: 100, maxWidth: 180, isSortingRequired: true },
                { key: "key3", name: 'News Event Type', fieldName: 'NewsEventType', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
                { key: "key4", name: 'Label', fieldName: 'Label', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
                {
                    key: "key9", name: 'Is Active', fieldName: 'IsActive', isResizable: true, minWidth: 40, maxWidth: 70, isSortingRequired: true, onRender: (item: any) => {
                        return (
                            <>
                                {item.IsActive ? 'Yes' : 'No'}
                            </>
                        );
                    },
                }, {
                    key: "EventDescription", name: 'Event Description', fieldName: 'Description', isResizable: true, minWidth: 170, maxWidth: 240, isSortingRequired: true,
                    onRender: (item: any) => {
                        if (item.EventDescription != "") {
                            return (
                                <>
                                    <Link className="tooltipcls richTextrenderUlLi">

                                        <TooltipHost content={<div dangerouslySetInnerHTML={{ __html: item.EventDescription }} />} id={tooltipId}>
                                            <div
                                                dangerouslySetInnerHTML={{
                                                    __html: item.EventDescription.length > 500
                                                        ? `${item.EventDescription.substring(0, 500)}...`
                                                        : item.EventDescription
                                                }}
                                            />
                                        </TooltipHost>

                                    </Link>
                                </>
                            );
                        }
                    },
                },
            ];
            if (!!props.siteMasterId) {
                columns = columns.filter(item => item.key != "SiteName")
            }
            return columns;
        };
        setcolumnsEvent(EventColumn)
    }, []);

    const onclickAddEvent = () => {
        getEventitems();
        setIsReload((prev) => !prev);
    };

    React.useEffect(() => {
        getEventitems();
    }, [isReload, isRefreshGrid]);

    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                {/* <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} /> */}
            </div>
        </div>;
    } else {
        return <>
            {<CustomModal isModalOpenProps={hideDialog} setModalpopUpFalse={() => toggleHideDialog()} subject={"Delete  Confirmation "} message={<div>Are you sure, you want to delete this record?</div>} yesButtonText="Yes" closeButtonText={"No"} onClickOfYes={onclickdelete} />}
            <div className={!!props.siteMasterId ? "" : "boxCard"}>
                {!props.siteMasterId && <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                        <h1 className="mainTitle">Events</h1>
                    </div>
                </div>}
                <div className="mt-3 more-page-wrapper">
                    <MemoizedDetailList
                        manageComponentView={props.manageComponentView}
                        columns={columnsEvent}
                        items={FilteredData || []}
                        reRenderComponent={true}
                        CustomselectionMode={isVisibleCrud.current && props.siteMasterId ? SelectionMode.multiple : SelectionMode.none}
                        searchable={true}
                        isAddNew={true}
                        onItemInvoked={_onItemInvoked}
                        onSelectedItem={_onItemSelected}
                        _onSearchTextChangeForExcel={_onSearchTextChangeForExcel}
                        addEDButton={(isDisplayEDbtn && isVisibleCrud.current) && <>
                            {isDisplayEditButtonview &&
                                <AddEvent
                                    onclickAddEvent={onclickAddEvent}
                                    isEditMode={true}
                                    editEventData={UpdateItem[0]}
                                    SiteEvent={true}
                                />
                            }
                            <Link className="actionBtn iconSize btnDanger  ml-10" onClick={onclickconfirmdelete}>
                                <TooltipHost content={"Delete"} id={tooltipId}>
                                    <FontAwesomeIcon icon="trash-alt" />
                                </TooltipHost>
                            </Link>
                        </>}

                        addNewContent={isVisibleCrud.current ?
                            <div className='dflex mar-bot-10'> {(!!FilteredData && FilteredData.length > 0) &&
                                <>
                                    <Link className="actionBtn iconSize btnEdit ml-10" style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                        text="">
                                        <TooltipHost
                                            content={"Export to excel"}
                                            id={tooltipId}
                                        >
                                            {isVisibleCrud.current && <FontAwesomeIcon
                                                icon={"file-excel"}
                                            />}
                                        </TooltipHost>
                                    </Link>
                                </>
                            }
                                {
                                    isVisibleCrud.current && <>
                                        {FilteredData && FilteredData.length > 0 &&
                                            <>
                                                <Link className="actionBtn iconSize btnRefresh refresh-icon-m" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                                    text="">
                                                    <TooltipHost
                                                        content={"Refresh Grid"}
                                                        id={tooltipId}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={"arrows-rotate"}
                                                        />
                                                    </TooltipHost>    </Link>
                                            </>
                                        }

                                        {props.siteMasterId && <TooltipHost
                                            content={"Add New Event"}
                                            id={tooltipId}
                                        >
                                            <AddEvent onclickAddEvent={onclickAddEvent} SiteName={props.siteMasterId} SiteEvent={true} />
                                        </TooltipHost>}
                                    </>
                                }
                            </div > :
                            <div className='dflex'> {(!!FilteredData && FilteredData.length > 0) &&
                                <Link className="actionBtn iconSize btnEdit ml-10" style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
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
                            </div >
                        }
                    />
                </div>
            </div>
        </>;
    }
};