/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { IQuayCleanState } from "../../QuayClean";
import { DefaultButton, DialogFooter, DialogType, FocusTrapZone, GroupHeader, IColumn, IDetailsGroupRenderProps, IGroupHeaderProps, Layer, Link, mergeStyleSets, Overlay, Pivot, PivotItem, Popup, PrimaryButton, SelectionMode, TooltipHost } from "@fluentui/react";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { Loader } from "../../CommonComponents/Loader";
import { ConvertDateToStringFormat, delay, getChoicesListOptions, getErrorMessage, getStateBySiteId, logGenerator, onBreadcrumbItemClicked, scrollFunction, showPremissionDeniedPage, UserActivityLog } from "../../../../../Common/Util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { IHelpDeskItemView } from "../../../../../Interfaces/IAddNewHelpDesk";
import CustomModal from "../../CommonComponents/CustomModal";
import { toastService } from "../../../../../Common/ToastService";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { DateTimeFormate } from "../../../../../Common/Constants/CommonConstants";
import DragAndDrop from "../../CommonComponents/FileUpload/DragandDrop";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import { ValidateForm } from "../../../../../Common/Validation";
import * as XLSX from 'xlsx';
import moment from "moment";
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { JobControlChecklistHistory } from "./JobControlChecklistHistory";
import SiteNavMenu from "../JobControlChecklist/SiteNavMenu";
import { appGlobalStateAtom, appSiteStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { SiteFilter } from "../../../../../Common/Filter/SiteFilter";
import { ViewEOMChecklist } from "./ViewEOMChecklist";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
export interface IJobControlChecklistListProps {

    manageComponentView(componentProp: IQuayCleanState): any;
    breadCrumItems: IBreadCrum[];

    siteName?: string;
    siteMasterId?: number;
    originalSiteMasterId: any;
    IsSupervisor?: boolean;
    componentProps: IQuayCleanState;
    dataObj?: any;
    isReload?: boolean;
    originalState?: any;
    JobControlChecklist?: any
}

export interface IJobControlChecklistListState {
}

export const ViewJobControlChecklist = (props: IJobControlChecklistListProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const appSiteState = useAtomValue(appSiteStateAtom);
    const { PermissionArray } = appSiteState;
    const isVisibleCrud = React.useRef<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [HistoryView, setHistoryView] = React.useState<boolean>(false);
    const [helpDeskListItems, setHelpDeskListItems] = React.useState<IHelpDeskItemView[]>([]);
    const [filteredItems, setFilteredItems] = React.useState<IHelpDeskItemView[]>([]);
    const [reloadGrid, setReloadGrid] = React.useState(false);
    const isCall = React.useRef<boolean>(true);
    const [HelpDeskNameOption, setHelpDeskNameOption] = React.useState<any[]>([]);
    const [catagoryOption, setCatagoryOption] = React.useState<any[]>([]);
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const [selectedStatus, setSelectedStatus] = React.useState<any>();
    const [selectedCategory, setSelectedCategory] = React.useState<any>();
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [selectedHelpDeskName, setSelectedHelpDeskName] = React.useState<any>();
    const [excelData, setexcelData] = React.useState<any[]>([]);
    const [uploadData, setuploadData] = React.useState<any[]>([]);
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [userData, setuserData] = React.useState<any[]>([]);
    const [SiteData, setSiteData] = React.useState<any[]>([]);
    const [HDChoiceData, setHDChoiceData] = React.useState<any[]>([]);
    const [downloadDisable, setdownloadDisable] = React.useState<boolean>(true);
    const [notFoundDialog, setnotFoundDialog] = React.useState<boolean>(false);
    const HDData = React.useRef<any>(null);
    const [QuestionData, setQuestionData] = React.useState<any[]>([]);
    const [recordFound, setrecordFound] = React.useState<boolean>(false);
    const [groups, setGroups] = React.useState<any[]>([]);
    const [CurrentMonth, setCurrentMonth] = React.useState<string>("");
    const [CurrentYear, setCurrentYear] = React.useState<string>("");
    const [Month, setMonth] = React.useState<string>("");
    const [Year, setYear] = React.useState<string>("");
    const [QuestionId, setQuestionId] = React.useState<string>("");
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [selectedKey, setselectedKey] = React.useState<any>(props?.componentProps?.subpivotName ? props?.componentProps?.subpivotName : "ManagersKPIs");

    const _onLinkClick = (item: PivotItem): void => {
        setselectedKey(item.props.itemKey);
    };

    const [state, setState] = React.useState<any>({
        isShowAssetHistoryModel: false,
        isShowMovingHistoryModel: false,
        isShowMovingModel: false,
        isShowAcquireModel: false,
        isShowDueDateModel: false,
        siteNameId: 0,
        assetMasterId: 0,
        isReload: false,
        isQRCodeModelOpen: false,
        qrCodeUrl: "",
        isUploadModelOpen: false,
        movingHistory: "",
        mdlConfigurationFile: "",
        qrDetails: "",
        isUploadFileValidationModelOpen: false,
        dialogContentProps: {
            type: DialogType.normal,
            title: 'In Correct Formate',
            closeButtonAriaLabel: 'Close',
            subText: "",
        },
        uploadFileErrorMessage: "",
        isUploadColumnValidationModelOpen: false,
    });

    const handleNavItemClick = (key: string, name: string): void => {
        setSelectedSiteName("");
        const integerNumber = parseInt(key);
        setSelectedSiteName(integerNumber);
    };

    const [selectedSite, setSelectedSite] = React.useState<any>("");
    const onSiteChange = (selectedOption: any): void => {
        setSelectedSite(selectedOption?.value);
        setSelectedSiteName(selectedOption?.value);
    };

    const [isreload, setisreload] = React.useState<boolean>(false);
    const [selectedSiteName, setSelectedSiteName] = React.useState<any>("");


    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);

    const onStatusChange = React.useCallback((selectedOption: any) => {
        setSelectedStatus(selectedOption);
    }, []);

    const onCategoryChange = React.useCallback((selectedOption: any) => {
        setSelectedCategory(selectedOption);
    }, []);

    const onChangeHelpDeskName = React.useCallback((selectedOption: any) => {
        setSelectedHelpDeskName(selectedOption);
    }, []);

    const [width, setWidth] = React.useState<string>("400px");
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("400px");
        }
    }, [window.innerWidth]);


    const popupStyles = mergeStyleSets({
        root: {
            background: 'rgba(0, 0, 0, 0.2)',
            bottom: '0',
            left: '0',
            position: 'fixed',
            right: '0',
            top: '0',
        },
        content: {
            background: 'white',
            left: '50%',
            maxWidth: '500px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
        }
    });

    const _QuestionMasterData = () => {
        setIsLoading(true);
        try {
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            const currentMonth = monthNames[new Date().getMonth()];
            const currentYear = new Date().getFullYear();
            const Year = currentYear.toString();
            const select = ["ID,Month,Year,SiteNameId"];
            let filter;
            if (props?.originalSiteMasterId) {
                filter = `Month eq '${currentMonth}' and Year eq '${Year}'` + (props?.originalSiteMasterId ? ` and SiteNameId eq '${props.originalSiteMasterId}'` : '');
            } else {
                filter = `Month eq '${currentMonth}' and Year eq '${Year}'and SiteNameId eq '${selectedSiteName}'`;
            }

            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: filter,
                listName: ListNames.JobControlChecklistMaster,
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results && results.length > 0) {
                    setrecordFound(true);
                }
            }).catch((error) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "_QuestionMaster", CustomErrormessage: "error in get Question Master", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_QuestionMaster", CustomErrormessage: "error in get Question Master", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };
    const genrateGroupBy = (filteredData: any[]) => {
        return filteredData.reduce((acc: any, item: any, index: any) => {
            const key = item.MonthYear;
            if (!acc[key]) {
                acc[key] = { key: `group${key}${index}`, name: `${key}`, startIndex: index, count: 0, level: 0 };
            }
            acc[key].count += 1;
            return acc;
        }, {});
    }

    const sortByMonthYearDesc = (data: any[]) => {

        const monthOrder: Record<string, number> = {
            January: 1,
            February: 2,
            March: 3,
            April: 4,
            May: 5,
            June: 6,
            July: 7,
            August: 8,
            September: 9,
            October: 10,
            November: 11,
            December: 12,
        };

        return data.sort((a, b) => {
            const yearA = parseInt(a.Year);
            const yearB = parseInt(b.Year);
            const monthA = monthOrder[a.Month];
            const monthB = monthOrder[b.Month];

            // Sort by year first, then by month (descending)
            if (yearA !== yearB) {
                return yearB - yearA;
            }
            return monthB - monthA;
        });

    }

    const _QuestionData = () => {
        setIsLoading(true);
        try {
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            const currentMonth = monthNames[new Date().getMonth()];
            const currentYear = new Date().getFullYear();
            let filter;
            if (props?.originalSiteMasterId) {
                filter = !!props?.originalSiteMasterId ? `SiteNameId eq '${props?.originalSiteMasterId}'` : "";
            } else {
                filter = !!selectedSiteName ? `SiteNameId eq '${selectedSiteName}'` : "";
            }
            const Year = currentYear.toString();
            const select = ["ID,QuestionId,Question/Title,Frequency,Status,Month,Year,SiteNameId,SiteName/Title"];
            const expand = ["Question", "SiteName"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                filter: filter,
                listName: ListNames.JobControlChecklistDetails,
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                QuestionId: data?.QuestionId,
                                Frequency: !!data.Frequency ? data.Frequency : '',
                                Question: !!data.Question ? data.Question?.Title : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteName : '',
                                OrgSiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName?.Title : '',
                                Status: !!data.Status ? data.Status : 'Not Yet Checked',
                                Month: !!data.Month ? data.Month : '',
                                Year: !!data.Year ? data.Year : '',
                                MonthYear: !!data.Month ? data.Month + "-" + data.Year : '',
                            }
                        );
                    });
                    let filteredData: any[];
                    if (!!props.siteMasterId || currentUserRoleDetail?.isAdmin) {
                        filteredData = UsersListData;
                    } else {
                        let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                        filteredData = !!UsersListData && UsersListData?.filter(item =>
                            AllSiteIds.includes(item?.OrgSiteNameId)
                        );
                    }
                    filteredData = filteredData?.sort((a: any, b: any) => {
                        return moment(b.Modified).diff(moment(a.Modified));
                    });
                    setQuestionData(filteredData);
                    filteredData = sortByMonthYearDesc(filteredData)
                    const groupedData = genrateGroupBy(filteredData);


                    const monthOrder: { [key: string]: number } = {
                        January: 1,
                        February: 2,
                        March: 3,
                        April: 4,
                        May: 5,
                        June: 6,
                        July: 7,
                        August: 8,
                        September: 9,
                        October: 10,
                        November: 11,
                        December: 12,
                    };
                    const groups = Object.values(groupedData);
                    const sortedGroups = groups.sort((a: any, b: any) => {
                        const [monthA, yearA] = a.name.split("-");
                        const [monthB, yearB] = b.name.split("-");

                        // First, compare by year (descending)
                        if (parseInt(yearA) > parseInt(yearB)) return -1;
                        if (parseInt(yearA) < parseInt(yearB)) return 1;

                        // If the years are equal, compare by month (descending)
                        return monthOrder[monthB] - monthOrder[monthA];
                    });
                    setGroups(groups);
                    setIsLoading(false);
                }
            }).catch((error) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };
    const OnClickHistoryView = (month: any, year: any, QuestionId?: any) => {
        setMonth(month);
        setYear(year);
        setQuestionId(QuestionId);
        setHistoryView(true);
    };

    const QuestionDetailsColumn = (): IColumn[] => {
        let columns: any[] = [
            {
                key: "key7", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 50, maxWidth: 60,
                onRender: ((itemID: any) => {
                    return <div onClick={() => OnClickHistoryView(itemID.Month, itemID.Year, itemID.QuestionId)}> <Link className="actionBtn btnInfo dticon">
                        <TooltipHost content={"View History"} id={tooltipId}>
                            <FontAwesomeIcon icon="clock-rotate-left" />
                        </TooltipHost>
                    </Link></div >;
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
            { key: 'Question', name: 'Question', fieldName: 'Question', isResizable: true, minWidth: 550, maxWidth: 850, isSortingRequired: true },
            { key: 'Frequency', name: 'Frequency', fieldName: 'Frequency', isResizable: true, minWidth: 150, maxWidth: 180, isSortingRequired: true },
            {
                key: "Status", name: 'Status', fieldName: 'ID', isResizable: true, minWidth: 150, maxWidth: 180,
                onRender: ((itemID: any) => {
                    if (itemID.Status == "Not Yet Checked") {
                        return <div className='greenGrey badge dInlineBlock jcc-badge'>{itemID.Status}</div >;
                    } else if (itemID.Status == "Completed") {
                        return <div className='greenBadge badge dInlineBlock jcc-badge'>{itemID.Status}</div >;
                    } else if (itemID.Status == "Not Required") {
                        return <div className='yellowBadge badge dInlineBlock jcc-badge'>{itemID.Status}</div >;
                    } else if (itemID.Status == "Overdue") {
                        return <div className='redBadge badge dInlineBlock jcc-badge'>{itemID.Status}</div >;
                    }


                })
            },
            // { key: 'Status', name: 'Status', fieldName: 'Status', isResizable: true, minWidth: 100, maxWidth: 120, isSortingRequired: true },
        ];
        if (!!props.siteMasterId) {
            columns = columns.filter(item => item.key != "SiteName")
        }
        return columns;
    };

    const _getHelpDeskListItems = async () => {
        const select = ["Id,Title,StartingDateTime,Caller,Location,SubLocation,QCArea/Id,QCArea/Title,HDCategory,ReportHelpDesk,HDStatus,EventName,HelpDeskName,QCPriority,SiteName/Id,SiteName/Title,Modified"];
        const expand = ["SiteName,QCArea"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            expand: expand,
            filter: !!props.siteMasterId ? `SiteNameId eq ${props.siteMasterId}` : "",
            listName: ListNames.HelpDesk,
        };

        let siteNameIdArray: any[] = [];
        let adUserArray: any[] = [];
        if (currentUserRoleDetail.isSiteManager) {
            siteNameIdArray = currentUserRoleDetail?.siteManagerItem.map(r => r.ID);
        }
        let userRole: string = "Admin";
        if (!!PermissionArray && PermissionArray?.includes('Job Control Checklist')) {
            // isVisibleCrud.current = true;
        } else {
            if (currentUserRoleDetail.isAdmin) {
                userRole = 'Admin';
            } else {
                if (currentUserRoleDetail.isStateManager) {
                    userRole = 'Admin';
                } else {
                    if (currentUserRoleDetail?.siteManagerItem.filter(r => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0) {
                        siteNameIdArray = currentUserRoleDetail?.siteManagerItem.map(r => r.ID);
                        userRole = 'SiteManager';
                    } else if (currentUserRoleDetail.isUser) {
                        adUserArray = currentUserRoleDetail.userItems.map(r => r.ID);
                        userRole = 'User';
                    }
                }
            }
        }

        //  For permission manage end
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
                                    QCArea: !!data.QCArea ? data.QCArea.Title : "",
                                    QCAreaId: !!data.QCArea ? data.QCArea.Id : 0,
                                    Caller: !!data.Caller ? data.Caller : "",
                                    Location: !!data.Location ? data.Location : "",
                                    SubLocation: !!data.SubLocation ? data.SubLocation : "",
                                    StartingDateTime: !!data.StartingDateTime ? ConvertDateToStringFormat(data.StartingDateTime, DateTimeFormate) : "",
                                    HDCategory: !!data.HDCategory ? data.HDCategory : "",
                                    HDStatus: !!data.HDStatus ? data.HDStatus : "",
                                    ReportHelpDesk: !!data.ReportHelpDesk ? "Yes" : "No",
                                    EventName: !!data.EventName ? data.EventName : "",
                                    HelpDeskName: !!data.HelpDeskName ? data.HelpDeskName : "",
                                    QCPriority: !!data.QCPriority ? data.QCPriority : "",
                                    Modified: !!data.Modified ? data.Modified : null,
                                }
                            );

                            break;
                        case 'SiteManager':
                            if (siteNameIdArray.indexOf(data.SiteName.Id) > -1 && currentUserRoleDetail.isSiteManager) {
                                return (
                                    {
                                        Id: data.Id,
                                        Title: !!data.Title ? data.Title : "",
                                        SiteName: !!data.SiteName ? data.SiteName.Title : "",
                                        SiteNameId: !!data.SiteName ? data.SiteName.Id : 0,
                                        QCArea: !!data.QCArea ? data.QCArea.Title : "",
                                        QCAreaId: !!data.QCArea ? data.QCArea.Id : 0,
                                        Caller: !!data.Caller ? data.Caller : "",
                                        Location: !!data.Location ? data.Location : "",
                                        SubLocation: !!data.SubLocation ? data.SubLocation : "",
                                        //QCArea: !!data.QCArea ? data.QCArea : "",
                                        StartingDateTime: !!data.StartingDateTime ? ConvertDateToStringFormat(data.StartingDateTime, DateTimeFormate) : "",
                                        HDCategory: !!data.HDCategory ? data.HDCategory : "",
                                        HDStatus: !!data.HDStatus ? data.HDStatus : "",
                                        ReportHelpDesk: !!data.ReportHelpDesk ? "Yes" : "No",
                                        EventName: !!data.EventName ? data.EventName : "",
                                        HelpDeskName: !!data.HelpDeskName ? data.HelpDeskName : "",
                                        QCPriority: !!data.QCPriority ? data.QCPriority : "",
                                        Modified: !!data.Modified ? data.Modified : null,
                                    }
                                );
                            } else {
                                return {};
                            }

                            break;
                        case 'User':
                            if (adUserArray.indexOf(data.SiteName.Id) > -1 && currentUserRoleDetail.isUser) {
                                return (
                                    {
                                        Id: data.Id,
                                        Title: !!data.Title ? data.Title : "",
                                        SiteName: !!data.SiteName ? data.SiteName.Title : "",
                                        SiteNameId: !!data.SiteName ? data.SiteName.Id : 0,
                                        QCArea: !!data.QCArea ? data.QCArea.Title : "",
                                        QCAreaId: !!data.QCArea ? data.QCArea.Id : 0,
                                        Caller: !!data.Caller ? data.Caller : "",
                                        Location: !!data.Location ? data.Location : "",
                                        SubLocation: !!data.SubLocation ? data.SubLocation : "",
                                        //QCArea: !!data.QCArea ? data.QCArea : "",
                                        StartingDateTime: !!data.StartingDateTime ? ConvertDateToStringFormat(data.StartingDateTime, DateTimeFormate) : "",
                                        HDCategory: !!data.HDCategory ? data.HDCategory : "",
                                        HDStatus: !!data.HDStatus ? data.HDStatus : "",
                                        ReportHelpDesk: !!data.ReportHelpDesk ? "Yes" : "No",
                                        EventName: !!data.EventName ? data.EventName : "",
                                        HelpDeskName: !!data.HelpDeskName ? data.HelpDeskName : "",
                                        QCPriority: !!data.QCPriority ? data.QCPriority : "",
                                        Modified: !!data.Modified ? data.Modified : null,
                                    }
                                );
                            } else {
                                return {};
                            }

                            break;

                        default:
                            return {};
                            break;
                    }
                });
            }
            return [];
        });
    };

    const getHDChoicesList = (): void => {
        const select = ["Id,Title,ChoiceValue,SiteNameId,IsActive"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.HelpDeskChoices,
            filter: `SiteNameId eq '${props.componentProps.siteMasterId}'`
        };
        provider.getItemsByQuery(queryStringOptions).then((response) => {
            HDData.current = response;
            setHDChoiceData(response);
        }).catch((error) => {
            console.log(error);
            setIsLoading(false);
        });
    };

    const _userActivityLog = async () => {
        setIsLoading(true);
        try {
            let orgSiteId = props?.originalSiteMasterId;
            const todayDate = moment().format("YYYY-MM-DD");
            const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.UserActivityLog,
                filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityId eq '${props?.siteMasterId}' and SiteNameId eq '${orgSiteId}' and EntityType eq '${UserActionEntityTypeEnum.JobControlChecklist}' and ActionType eq 'Details View' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
            };
            const results = await provider.getItemsByQuery(queryStringOptions);
            if (results && results.length > 0) {
                const listData = results.map((data: any) => ({
                    ID: data.ID,
                    Count: data.Count ?? '',
                }));
                let updateObj = {
                    Count: listData[0]?.Count + 1,
                };
                await provider.updateItemWithPnP(updateObj, ListNames.UserActivityLog, Number(listData[0]?.ID));
            } else {
                const stateId = await getStateBySiteId(provider, Number(orgSiteId));
                const logObj = {
                    UserName: currentUserRoleDetail?.title,
                    SiteNameId: orgSiteId,
                    ActionType: UserActivityActionTypeEnum.DetailsView,
                    Email: currentUserRoleDetail?.emailId,
                    EntityType: UserActionEntityTypeEnum.JobControlChecklist,
                    EntityId: props?.siteMasterId,
                    // EntityName: ListEquipment[0]?.Title,
                    Count: 1,
                    StateId: stateId,
                    Details: "Details View"
                };
                void UserActivityLog(provider, logObj, currentUserRoleDetail);
            }
            isCall.current = false;
        } catch (error) {
            console.error("Error fetching user activity log:", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        let isVisibleCrud1 = (!!PermissionArray && PermissionArray?.includes('Job Control Checklist') || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;
        if (isCall.current == true) {
            isCall.current = false;
            _userActivityLog();
        }
    }, []);

    React.useEffect(() => {
        _QuestionMasterData();
        _QuestionData();
        _siteData();
        const className = document.querySelector('ARTICLE')?.children[0].children[0].classList[0];
        let el: any = document.querySelector(!!className ? `.${className}` : "");
        if (!!el) {
            el.onscroll = function () {
                scrollFunction(175);
            };
        }
        getHDChoicesList();

    }, [isRefreshGrid, selectedSiteName]);
    React.useEffect(() => {
        let permssiion = showPremissionDeniedPage(currentUserRoleDetail);
        if (permssiion.length == 0) {
            props.manageComponentView({ currentComponentName: ComponentNameEnum.AccessDenied });
        }
        try {
            setIsLoading(true);
            // eslint-disable-next-line no-void
            void (async () => {
                const [helpdeskOPt, Category] = await Promise.all([getChoicesListOptions(provider, ListNames.HelpDesk, "HelpDeskName", true), getChoicesListOptions(provider, ListNames.HelpDesk, "HD Category", true), getChoicesListOptions(provider, ListNames.HelpDesk, "QCPriority")]);
                setHelpDeskNameOption(helpdeskOPt);
                setCatagoryOption(Category);
                let items = await _getHelpDeskListItems();
                items = items.sort((a: any, b: any) => {
                    return moment(b.Modified).diff(moment(a.Modified));
                });
                setHelpDeskListItems(items.filter(r => !!r && !!r.Id));
                setIsLoading(false);
                setReloadGrid(false);
            })();
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect HelpDeskList"
            };
            void logGenerator(provider, errorObj);

        }
    }, [reloadGrid, isRefreshGrid]);
    React.useEffect(() => {
        const filterList = async () => {
            setIsLoading(true);
            let filteredData = helpDeskListItems;

            if (selectedStatus) {
                filteredData = filteredData.filter(x => x.HDStatus === selectedStatus);
            }
            if (selectedCategory) {
                filteredData = filteredData.filter(x => x.HDCategory === selectedCategory);
            }
            if (selectedHelpDeskName) {
                filteredData = filteredData.filter(x => x.HelpDeskName === selectedHelpDeskName);
            }
            setFilteredItems(filteredData);
            setIsLoading(false);
        };

        void filterList();
    }, [selectedStatus, selectedCategory, selectedHelpDeskName, helpDeskListItems]);

    const _siteData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,SiteManagerId,SiteManager/Title,SiteManager/Name,SiteManager/EMail,SiteImageThumbnailUrl,Category"];
            const expand = ["SiteManager"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                listName: ListNames.SitesMaster,
            };

            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                SiteManagerId: data.SiteManagerId,
                                SiteManager: !!data.SiteManagerId ? data.SiteManager.Title : '',
                                SiteManagerEmail: !!data.SiteManager ? data.SiteManager.EMail : '',
                            }
                        );
                    });
                    setSiteData(UsersListData);
                }
            }).catch((error) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "_siteData", CustomErrormessage: "error in get site data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_siteData", CustomErrormessage: "error in get site data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };
    const _closeDeleteConfirmation = () => {
        toggleHideDialog();
    };
    const _onItemSelected = (item: any): void => {
        setCurrentYear(item[0]?.Year);
        setCurrentMonth(item[0]?.Month);
        if (item.length > 0) {
            if (item.length == 1) {
                setIsDisplayEditButtonview(true);
                setUpdateItem(item[0]);
            } else {
                setIsDisplayEditButtonview(true);
                setUpdateItem(item);
            }
            setisDisplayEDbtn(true);
        } else {
            setUpdateItem(null);
            setisDisplayEDbtn(false);
        }
    };

    const _confirmDeleteItem = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        try {
            if (!!UpdateItem) {
                if (Array.isArray(UpdateItem)) {
                    for (let index = 0; index < UpdateItem.length; index++) {
                        await provider.deleteItem(ListNames.HelpDesk, UpdateItem[index].Id);
                    }
                } else {
                    await provider.deleteItem(ListNames.HelpDesk, UpdateItem.Id);
                }
                const items = Array.isArray(UpdateItem) && UpdateItem.length > 0 ? UpdateItem : [UpdateItem];

                items.forEach(async (res: any) => {
                    const stateId = await getStateBySiteId(provider, Number(res?.SiteNameId));
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: res?.SiteNameId,
                        ActionType: UserActivityActionTypeEnum.Delete,
                        EntityType: UserActionEntityTypeEnum.JobControlChecklist,
                        EntityId: res?.Id || res?.ID,
                        EntityName: res?.Title,
                        StateId: stateId,
                        Details: `Delete Job Control Checklist`
                    };
                    void UserActivityLog(provider, logObj, currentUserRoleDetail);
                });
                toastService.updateLoadingWithSuccess(toastId, "Record deleted successfully!");
                toggleHideDialog();
                setisDisplayEDbtn(false);
                setReloadGrid(true);
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  _confirmDeleteItem",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_confirmDeleteItem HelpDeskList"
            };
            void logGenerator(provider, errorObj);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };

    const handleFileUpload = (event: any) => {
        try {
            let errorobj: any[] = [];
            const file: any = event;
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                let dataJSONHeaderChek: any[] = XLSX.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0];
                const expectedColumnNames = ['Title', 'StartingDateTime', 'Caller', 'Location', 'Priority', 'Status', 'HelpDeskName', 'Category', 'Area', 'EventName', 'ReportHelpDesk'];
                let isColumnsValid = true;

                for (let index = 0; index < expectedColumnNames.length; index++) {
                    isColumnsValid = dataJSONHeaderChek.indexOf(expectedColumnNames[index]) >= 0;
                    if (!isColumnsValid) {
                        errorobj.push(expectedColumnNames[index]);
                    }
                }
                const excelData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
                if (errorobj.length == 0) {
                    setexcelData(excelData);
                } else {
                    let message = <div><b > Following fields are missing from the excel </b><ul>{errorobj.map(((r: any, index: any) => {
                        if (index === 0) {
                            return <> <li className="errorPoint">  {r} </li> </>;
                        } else {
                            return <li className="errorPoint">  {r} </li>;
                        }

                    }))}</ul></div>;
                    setIsLoading(false);
                    setState((prevState: any) => ({ ...prevState, uploadFileErrorMessage: message, isUploadColumnValidationModelOpen: true }));
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            const errorObj = { ErrorMethodName: "handleFileUpload", CustomErrormessage: "error in on handle file upload", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };

    const handleDrop = async (e: any) => {
        let isVaild = uploadFileValidation(e);
        try {
            if (isVaild) {
                e.preventDefault();
                e.stopPropagation();

                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const selectedFiles: any[] = e.dataTransfer.files;
                    setFilesToState(selectedFiles);
                    handleFileUpload(selectedFiles[0]);
                }
            } else {
                setState((prevState: any) => ({ ...prevState, isUploadFileValidationModelOpen: true }));
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "MDLConfiguration handleDrop", CustomErrormessage: "handleDrop", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };
    const checkAndUpdateObjects = (oldObj: any, newObj: any) => {
        // oldObj = Uploading data
        // newObj = Choicelistdata
        let finalObj: any = [];
        const fieldsMapping: any = {
            Caller: "Caller",
            Location: "Location",
            Area: "Area",
            HDCategory: "Category",
            HDStatus: "Status",
            HelpDeskName: "HelpDesk",
            QCPriority: "Priority"
        };
        const result1 = oldObj.flatMap((item: any) =>
            Object.entries(fieldsMapping).map(([key, fieldName]) => ({
                Title: fieldName,
                ChoiceValue: item[key],
                SiteNameId: item.SiteNameId
            }))
        );
        const uniqueResult = Array.from(new Set(result1.map((item: any) => JSON.stringify(item))))
            .map((item: any) => {
                try {
                    return JSON.parse(item);
                } catch (e) {
                    console.error("Error parsing JSON string:", e);
                    return null;
                }
            })
            .filter(item => item !== null);
        if (newObj.length > 0) {
            finalObj = uniqueResult.filter((item: any) => {
                return !newObj.some((newItem: any) =>
                    newItem.Title === item.Title &&
                    newItem.ChoiceValue === item.ChoiceValue &&
                    newItem.SiteNameId === item.SiteNameId
                );
            });
            provider.createItemInBatch(finalObj, ListNames.HelpDeskChoices).then(async (results: any) => {
                console.log("Choices Insert Successfully");
                getHDChoicesList();
            }).catch(err => console.log(err));
        } else {
            provider.createItemInBatch(uniqueResult, ListNames.HelpDeskChoices).then(async (results: any) => {
                console.log("Choices Insert Successfully");
                getHDChoicesList();
            }).catch(err => console.log(err));
        }

    };

    const onSaveFiles = () => {
        setIsLoading(true);
        try {
            if (uploadData && uploadData.length > 0) {
                const toastMessage = 'Record Insert successfully!';
                const toastId = toastService.loading('Loading...');
                const data = checkAndUpdateObjects(uploadData, HDData.current);

                provider.createItemInBatch(uploadData, ListNames.HelpDesk).then(async (results: any) => {
                    setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
                    setReloadGrid(true);
                    if (false) delay(500);
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    setIsLoading(false);

                }).catch(err => console.log(err));
            } else {
                setIsLoading(false);
                setnotFoundDialog(true);
                setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
            }
        } catch (error) {
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "onSaveFiles", CustomErrormessage: "error in save file data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }
    };
    const removeFile = async (id: number | string) => {
        try {
            const newFiles = state.mdlConfigurationFile.filter((file: IFileWithBlob) => file.key != id);
            setState((prevState: any) => ({ ...prevState, mdlConfigurationFile: newFiles }));
        } catch (error) {
            const errorObj = { ErrorMethodName: "removeFile", CustomErrormessage: "removeFile", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }
    };

    const setFilesToState = (files: any[]) => {
        try {
            const selectedFiles: any[] = [];
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];
                    const selectedFile: any = {
                        file: file,
                        name: file.name,
                        key: i
                    };
                    selectedFiles.push(selectedFile);
                }
                setState((prevState: any) => ({ ...prevState, mdlConfigurationFile: selectedFiles }));
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "MDLConfiguration setFilesToState", CustomErrormessage: "setFilesToState", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };

    const uploadFileValidation = (e: any) => {
        const validationFields: any = {
            "excel": ["name"],
        };
        let file: any;
        if (e.type == 'change') {
            file = e.target.files[0];
        } else {
            file = e.dataTransfer?.files[0];
        }
        let isValid = ValidateForm(file, validationFields);
        return isValid.isValid;
    };

    const handleChange = async (e: any): Promise<void> => {
        let isVaild = uploadFileValidation(e);
        try {
            if (isVaild) {
                e.preventDefault();
                e.stopPropagation();
                if (e.type == 'change') {
                    if (e.target.files && e.target.files[0]) {
                        const selectedFiles: any[] = e.target.files;
                        setFilesToState(selectedFiles);
                        handleFileUpload(selectedFiles[0]);
                    }
                } else {
                    if (e.dataTransfer?.files && e.dataTransfer?.files[0]) {
                        const selectedFiles: any[] = e.dataTransfer?.files;
                        setFilesToState(selectedFiles);
                        handleFileUpload(selectedFiles[0]);
                    }
                }
            } else {
                setState((prevState: any) => ({ ...prevState, isUploadFileValidationModelOpen: true }));
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "handleChange", CustomErrormessage: "handleChange", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };

    const onCancel = async () => {
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
    };
    const onclickUpload = () => {
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: true }));
    };
    const onClickCloseModel = () => {
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false }));
    };
    const onOkModel = () => {
        setnotFoundDialog(false);
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: true }));
    };

    const onclickDownload = async () => {
        try {
            let url = context.pageContext.web.absoluteUrl + '/Shared%20Documents/MasterFiles/HelpDesk.xlsx';
            let fileName = "HelpDesk";
            let downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickDownload", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }
    };

    const DranAndDrop = <>
        <DragAndDrop
            provider={provider}
            files={state.mdlConfigurationFile}
            handleChange={(e: any) => handleChange(e)}
            removeFile={removeFile}
            handleDrop={(e: any) => handleDrop(e)}
            onCancel={onCancel}
            onSaveFiles={onSaveFiles}
            isMultiple={false}
        />
    </>;

    React.useEffect(() => {
        provider.getSiteUsers().then((results) => {
            setuserData(results);
        }).catch((error) => {
            console.log(error);
            const errorObj = { ErrorMethodName: "useEffect(getSiteUsers data)", CustomErrormessage: "error in get site client data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        });

        if (!!excelData && !!userData && !!SiteData) {
            if (excelData.length > 0) {
                const data: any = JSON.stringify(excelData, null, 2);
                const jsondata: any = JSON.parse(data);
                const formatData = jsondata.map((i: any) => ({
                    ...i, SiteNameId: 0
                }));
                if (!!formatData) {
                    const formattedData = formatData.map((item: {
                        Status: any;
                        HDStatus: any;
                        Category: any;
                        HDCategory: any;
                        Priority: any;
                        QCPriority: any;
                        SiteNameId: any;
                        StartingDateTime: moment.MomentInput;
                        ReportHelpDesk: any;
                    }) => {
                        if (item.StartingDateTime) {
                            item.StartingDateTime = moment(item.StartingDateTime, "DD-MM-YYYY HH:mm").format("YYYY-MM-DD[T]HH:mm:ss[Z]");
                        }
                        if (item.ReportHelpDesk == 1 || item.ReportHelpDesk === true) {
                            item.ReportHelpDesk = true;
                        } else {
                            item.ReportHelpDesk = false;
                        }
                        if (item.SiteNameId === 0) {
                            item.SiteNameId = props.siteMasterId;
                        }
                        if (item.Priority) {
                            item.QCPriority = item.Priority;
                        }
                        if (item.Status) {
                            item.HDStatus = item.Status;
                        }
                        if (item.Category) {
                            item.HDCategory = item.Category;
                        }
                        return item;
                    });
                    const removeFields = (data: any, fields: any) => {
                        return data.map((item: any) => {
                            let newItem = { ...item };
                            fields.forEach((field: any) => delete newItem[field]);
                            return newItem;
                        });
                    };
                    const fieldsToRemove = ['Status', 'Category', 'Priority'];
                    const cleanedData = removeFields(formattedData, fieldsToRemove);
                    setuploadData(cleanedData);
                }
            }
        }
    }, [excelData]);

    React.useEffect(() => {

        const className = document.querySelector('ARTICLE')?.children[0].children[0].classList[0];
        let el: any = document.querySelector(!!className ? `.${className}` : "");
        if (!!el) {
            el.onscroll = function () {
                scrollFunction(200);
            };
        }
        provider.getDocumentByURL().then((results: any[]) => {
            if (!!results) {
                let fileNameArray = results.map(item => item.FileLeafRef == "HelpDesk.xlsx");

                for (let i = 0; i < fileNameArray.length; i++) {
                    if (fileNameArray[i] == true) {
                        setdownloadDisable(false);
                    }
                }
            }
        }).catch((error) => {
            console.log(error);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "use effect", CustomErrormessage: "error in use effect", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            const _error = getErrorMessage(error);
        });
        _siteData();
    }, [isRefreshGrid]);

    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };

    const onClickYes = () => {
        setisDisplayEDbtn(false);
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({ text: "Update", key: "Update", currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AssociateJobControlChecklist, siteMasterId: 1, isShowDetailOnly: false, breadCrumItems: breadCrumItems } });
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.AssociateJobControlChecklist, Month: CurrentMonth, Year: CurrentYear, dataObj: props.dataObj, siteMasterId: 1, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId
        });
    };

    const onClickNo = () => {
        hidePopup();
    };

    const onRenderGroupHeader = (props: IGroupHeaderProps | undefined): JSX.Element => {
        if (!props) return <div />;

        return (
            <GroupHeader
                {...props}
                onRenderTitle={() => (
                    <div onClick={() => console.log(`Selected group: ${props.group?.name}`)}>
                        {props.group?.name}
                    </div>
                )}
            />
        );
    };

    const groupProps: IDetailsGroupRenderProps = {
        onRenderHeader: onRenderGroupHeader,
    };

    const closeModel = () => {
        setHistoryView(false);
    };
    const onClickHeaderView = (item: any) => {
        setQuestionId('');
        const [month, year] = item.name.split('-');
        const Month = month; // "August"
        const Year = year;   // "2024"
        if (props?.originalSiteMasterId) {
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({ text: "PDF View", key: 'PDF View', currentCompomnetName: ComponentNameEnum.PDFViewJobControlChecklist, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.PDFViewJobControlChecklist, isAddNewSite: true, breadCrumItems: breadCrumItems, dataObj: props.dataObj, originalState: props.originalState } });
            props.manageComponentView({ currentComponentName: ComponentNameEnum.PDFViewJobControlChecklist, originalState: props.originalState, dataObj: props.dataObj, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId });
        } else {
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({ text: "PDF View", key: 'PDF View', currentCompomnetName: ComponentNameEnum.PDFViewJobControlChecklist, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.PDFViewJobControlChecklist, isAddNewSite: true, breadCrumItems: breadCrumItems, dataObj: props.dataObj, originalState: props.originalState } });
            props.manageComponentView({ currentComponentName: ComponentNameEnum.PDFViewJobControlChecklist, originalState: props.originalState, dataObj: props.dataObj, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: selectedSiteName });
        }
        setIsLoading(false);
    };
    const onClickHeaderHistory = (item: any) => {
        setQuestionId('');
        const [month, year] = item.name.split('-');
        const Month = month; // "August"
        const Year = year;   // "2024"
        setMonth(Month);
        setYear(Year);
        setHistoryView(true);
    };
    const onClickHeaderEdit = (item: any) => {
        const [month, year] = item.name.split('-');
        const Monthss = month; // "August"
        const Yearss = year;   // "2024"
        setCurrentYear(Yearss);
        setCurrentMonth(Monthss);

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const Month = monthNames[new Date().getMonth()];
        const curYear = new Date().getFullYear();
        const Year = curYear.toString();
        if (props?.originalSiteMasterId) {
            if (Monthss === Month && Yearss === Year) {
                setisDisplayEDbtn(false);
                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                breadCrumItems.push({ text: "Update", key: "Update", currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AssociateJobControlChecklist, originalState: props.originalState, siteMasterId: 1, isShowDetailOnly: false, breadCrumItems: breadCrumItems } });
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.AssociateJobControlChecklist, Month: Monthss, Year: Yearss, originalState: props.originalState, dataObj: props.dataObj, siteMasterId: 1, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId
                });
            } else {
                showPopup();
            }
        } else {
            if (Monthss === Month && Yearss === Year) {
                setisDisplayEDbtn(false);
                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                breadCrumItems.push({ text: "Update", key: "Update", currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AssociateJobControlChecklist, originalState: props.originalState, siteMasterId: 1, isShowDetailOnly: false, breadCrumItems: breadCrumItems } });
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.AssociateJobControlChecklist, Month: Monthss, Year: Yearss, originalState: props.originalState, dataObj: props.dataObj, siteMasterId: 1, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: selectedSiteName
                });
            } else {
                showPopup();
            }
        }
    };


    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {HistoryView && Month !== "" && Year !== "" && <JobControlChecklistHistory
                siteMasterId={!!props.siteMasterId ? props.siteMasterId : selectedSiteName}
                provider={provider}
                manageComponentView={props.manageComponentView}
                isModelOpen={HistoryView}
                closeModel={closeModel}
                QuestionId={QuestionId}
                Year={Year}
                Month={Month}
                isSiteName={props?.componentProps?.dataObj ? true : false}
                context={context} />}

            {isLoading && <Loader />}
            {state.isUploadFileValidationModelOpen &&
                <CustomeDialog dialogContentProps={state.dialogContentProps}
                    closeText="Close" onClickClose={() => {
                        setState((prevState: any) => ({ ...prevState, isUploadFileValidationModelOpen: false }));
                    }}
                    dialogMessage={"Kindly upload file in excel format."}
                    isDialogOpen={state.isUploadFileValidationModelOpen} />}
            {state.isUploadColumnValidationModelOpen && <CustomeDialog isDialogOpen={state.isUploadColumnValidationModelOpen}
                dialogContentProps={state.dialogContentProps}
                onClickClose={() => setState((prevState: any) => ({ ...prevState, isUploadColumnValidationModelOpen: false, isUploadModelOpen: false, mdlConfigurationFile: [] }))}
                dialogMessage={state.uploadFileErrorMessage} closeText={"Close"} />}

            <CustomModal isModalOpenProps={hideDialog}
                setModalpopUpFalse={_closeDeleteConfirmation}
                subject={"Delete Item"}
                message={'Are you sure, you want to delete this record?'}
                yesButtonText="Yes"
                closeButtonText={"No"}
                onClickOfYes={_confirmDeleteItem} />
            {!!props.siteMasterId ?
                <div className={`${!!props.siteMasterId ? "" : "boxCard"} more-page-wrapper`}>
                    {!props.siteMasterId && <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <h1 className="mainTitle">Monthly KPI's</h1>
                        </div>
                    </div>}
                    <div className="ms-Grid mt-3">
                        <div className="ms-Grid-row ptop-5">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg1">
                                {/* <PrimaryButton className="btnSearch btn btn-primary" onClick={() => _getChemicalMasterList()} text="Search" /> */}
                            </div>
                        </div>
                    </div>
                    <Pivot aria-label="Basic Pivot Example" id="SCpivot" selectedKey={selectedKey}
                        onLinkClick={_onLinkClick}>
                        <PivotItem headerText="Manager KPI's" itemKey="ManagersKPIs">
                            <div className="">
                                <ViewEOMChecklist
                                    manageComponentView={props.manageComponentView}
                                    siteMasterId={props.siteMasterId}
                                    originalState={props.originalState}
                                    originalSiteMasterId={selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId[0]}
                                    IsSupervisor={props.IsSupervisor}
                                    dataObj={props?.dataObj}
                                    breadCrumItems={props.breadCrumItems || []}
                                    componentProps={props.componentProps}
                                />

                            </div>
                        </PivotItem>
                        {props.JobControlChecklist !== "No" &&
                            <PivotItem headerText="Site KPI's" itemKey="SiteKPIs">
                                <div style={{ padding: "16px 0" }}>
                                    <MemoizedDetailList
                                        manageComponentView={props.manageComponentView}
                                        columns={QuestionDetailsColumn() as any}
                                        items={QuestionData || []}
                                        groups={groups}
                                        genrateGroupBy={genrateGroupBy}
                                        reRenderComponent={true}
                                        onSelectedItem={_onItemSelected}
                                        searchable={true}
                                        groupProps={groupProps}
                                        masterPagination={50}
                                        onClickHeaderView={onClickHeaderView}
                                        onClickHeaderHistory={onClickHeaderHistory}
                                        onClickHeaderEdit={onClickHeaderEdit}
                                        edit={!!props.siteMasterId && isVisibleCrud.current ? true : false}
                                        HeaderButton={true}
                                        CustomselectionMode={isVisibleCrud.current ? SelectionMode.none : SelectionMode.none}
                                        addEDButton={(isDisplayEDbtn && isVisibleCrud.current) && <>
                                        </>}
                                        isAddNew={true}
                                        addNewContent={
                                            <>
                                                <div className={window.innerWidth > 768 ? "dflex" : "jcc-refresh"}>
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
                                                    {isVisibleCrud.current && recordFound === false && <PrimaryButton text="Add" className="btn btn-primary "
                                                        onClick={() => {
                                                            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                                            breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AssociateJobControlChecklist, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AssociateJobControlChecklist, originalState: props.originalState, isAddNewSite: true, breadCrumItems: breadCrumItems, dataObj: props.dataObj } });
                                                            props.manageComponentView({ currentComponentName: ComponentNameEnum.AssociateJobControlChecklist, originalState: props.originalState, dataObj: props.dataObj, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId });
                                                            setIsLoading(false);
                                                        }}
                                                    />}
                                                </div>
                                            </>
                                        } />
                                </div>
                            </PivotItem>
                        }
                    </Pivot>
                </div> :

                <div className={!!props.siteMasterId ? "" : "boxCard"}>
                    <div className="ms-Grid-row">
                        {window.innerWidth > 768 && <div className="ms-Grid-col ms-sm3 ms-md3 ms-lg3 ms-xl2">
                            <SiteNavMenu
                                provider={provider}
                                defaultKey={selectedSiteName}
                                refreshNav={isreload}
                                currentUserRoleDetail={currentUserRoleDetail}
                                // selectedSite={currentUserRoleDetail.isAdmin ? currentUserRoleDetail.currentUserAllCombineSites : []}
                                // filterManufacturer={selectedQuestionManufacturer}
                                onNavItemClick={handleNavItemClick} />
                            <div style={{ padding: 20, flex: 1 }}>
                            </div>

                            <div className="ms-Grid mt-3">
                                <div className="ms-Grid-row ptop-5">
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg1">
                                        {/* <PrimaryButton className="btnSearch btn btn-primary" onClick={() => _getChemicalMasterList()} text="Search" /> */}
                                    </div>
                                </div>
                            </div>
                        </div>}

                        <div className={window.innerWidth > 768 ? "ms-Grid-col ms-sm10 ms-md10 ms-lg10 ms-xl10 mt-3" : "ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 mt-3"} style={{ borderLeft: '1px solid #e5e5e5' }}>
                            {!props.siteMasterId && <div className="ms-Grid-row">
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                    <h1 className="mainTitle">Sites KPI's</h1>
                                </div>
                            </div>}
                            {window.innerWidth <= 768 && <div className="showPageCounts">
                                <SiteFilter
                                    isPermissionFiter={true}
                                    loginUserRoleDetails={currentUserRoleDetail}
                                    selectedSite={selectedSite}
                                    onSiteChange={onSiteChange}
                                    provider={provider}
                                    isRequired={true}
                                    AllOption={true} />

                            </div>}
                            <MemoizedDetailList
                                manageComponentView={props.manageComponentView}
                                columns={QuestionDetailsColumn() as any}
                                items={QuestionData || []}
                                groups={groups}
                                genrateGroupBy={genrateGroupBy}
                                masterPagination={50}
                                reRenderComponent={true}
                                onSelectedItem={_onItemSelected}
                                searchable={true}
                                groupProps={groupProps}
                                onClickHeaderView={onClickHeaderView}
                                onClickHeaderHistory={onClickHeaderHistory}
                                onClickHeaderEdit={onClickHeaderEdit}
                                edit={!!props.siteMasterId && isVisibleCrud.current ? true : false}
                                HeaderButton={true}
                                CustomselectionMode={isVisibleCrud.current ? SelectionMode.none : SelectionMode.none}
                                addEDButton={(isDisplayEDbtn && isVisibleCrud.current) && <>
                                </>}
                                isAddNew={true}
                                addNewContent={
                                    <>
                                        <div className={window.innerWidth > 768 ? "dflex" : "jcc-refresh"}>
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
                                            {isVisibleCrud.current && recordFound === false && props.siteMasterId && <PrimaryButton text="Add" className="btn btn-primary "
                                                onClick={() => {
                                                    let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                                    breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AssociateJobControlChecklist, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AssociateJobControlChecklist, originalState: props.originalState, isAddNewSite: true, breadCrumItems: breadCrumItems, dataObj: props.dataObj } });
                                                    props.manageComponentView({ currentComponentName: ComponentNameEnum.AssociateJobControlChecklist, originalState: props.originalState, dataObj: props.dataObj, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId });
                                                    setIsLoading(false);
                                                }}
                                            />}
                                        </div>
                                    </>
                                } />

                        </div>
                    </div>
                </div>}
            {
                state.isUploadModelOpen &&
                <CustomModal dialogWidth="900px" isModalOpenProps={state.isUploadModelOpen} setModalpopUpFalse={onClickCloseModel} subject={"Upload"} message={DranAndDrop}
                    closeButtonText={""} />
            }
            {
                notFoundDialog &&
                <CustomModal
                    isModalOpenProps={notFoundDialog}
                    dialogWidth={"300px"}
                    setModalpopUpFalse={onOkModel}
                    subject={"Warning"}
                    message={<div>No record found</div>}
                    yesButtonText="Close"
                    onClickOfYes={onOkModel}
                />
            }
            {isPopupVisible && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup}>
                        <Overlay onClick={hidePopup} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles.content}>
                                <h2 className="mt-10">Confirmation</h2>
                                <div className="mt-3">Are you sure you want to edit previous-month records?</div>
                                <DialogFooter>
                                    <PrimaryButton text="Yes" onClick={onClickYes} className='mrt15 css-b62m3t-container btn btn-primary' />
                                    <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNo} />
                                </DialogFooter>
                            </Popup>
                        </FocusTrapZone>
                    </Popup>
                </Layer>
            )}
        </>;
    }
};