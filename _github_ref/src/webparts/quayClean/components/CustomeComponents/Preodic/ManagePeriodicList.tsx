
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IQuayCleanState } from "../../QuayClean";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum, ViewType } from "../../../../../Common/Enum/ComponentNameEnum";
import { DefaultButton, DialogFooter, DialogType, FocusTrapZone, IconButton, Label, Layer, Link, Overlay, Popup, PrimaryButton, SelectionMode, TextField, Toggle, TooltipHost, mergeStyleSets } from "@fluentui/react";
import { _onItemSelected, getConvertedDate, isWithinNextMonthRange, logGenerator, onBreadcrumbItemClicked, scrollFunction, showPremissionDeniedPage, getErrorMessageValue, generateExcelTable, formatPrice, UserActivityLog, getStateBySiteId } from "../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { Loader } from "../../CommonComponents/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { WeekFilter } from "../../../../../Common/Filter/WeekFilter";
import { MonthFilter } from "../../../../../Common/Filter/MonthFilter";
import { PeriodicFilter } from "../../../../../Common/Filter/PeriodicFilter";
import { YearFilter } from "../../../../../Common/Filter/YearFilter";
import CustomModal from "../../CommonComponents/CustomModal";
import * as XLSX from 'xlsx';
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import DragAndDrop from "../../CommonComponents/FileUpload/DragandDrop";
import { ValidateForm } from "../../../../../Common/Validation";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import moment from "moment";
import { toastService } from "../../../../../Common/ToastService";
import { PeriodicHistoryDialog } from "./PeriodicHistoryDialog";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom, appSiteStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { PeriodicDetailsCardView } from "./PeriodicDetailsCardView";
import { MultipleSiteFilter } from "../../../../../Common/Filter/MultipleSiteFilter";
import { IExportColumns } from "../EquipmentChecklist/Question";
import { MultiStateFilter } from "../../../../../Common/Filter/MultiStateFilter";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import AttachmentPopup from "./AttachmentPopup";
import { Modal } from "office-ui-fabric-react";
export interface IManagePeriodicListProps {
    manageComponentView(componentProp: IQuayCleanState): any;
    componentProp: IQuayCleanState;
    siteMasterId?: number;
    breadCrumItems: any[];
    siteName?: string;
    IsSupervisor?: boolean;
    dataObj?: any;
    view?: any;
    qCStateId?: any;
}

export interface IManagePeriodicListState {
}

export const ManagePeriodicList = (props: IManagePeriodicListProps) => {
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
    const isFirstRender = React.useRef(true);

    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const appSiteState = useAtomValue(appSiteStateAtom);
    const { PermissionArray } = appSiteState;
    const isVisibleCrud = React.useRef<boolean>(false);
    const [ListPeriodic, setListPeriodic] = React.useState<any>([]);
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [columnsPeriodic, setcolumnsPeriodic] = React.useState<any>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const tooltipId = useId('tooltip');
    const [selectedPeriodic, setSelectedPeriodic] = React.useState<any>();
    const [selectedWeek, setSelectedWeek] = React.useState<any>();
    const [selectedMonth, setSelectedMonth] = React.useState<any>();
    const [selectedYear, setSelectedYear] = React.useState<any>();
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [downloadDisable, setdownloadDisable] = React.useState<boolean>(true);
    const [notFoundDialog, setnotFoundDialog] = React.useState<boolean>(false);
    const [excelData, setexcelData] = React.useState<any[]>([]);
    const [userData, setuserData] = React.useState<any[]>([]);
    const [SiteData, setSiteData] = React.useState<any[]>([]);
    const [uploadData, setuploadData] = React.useState<any[]>([]);
    const [reloadGrid, setReloadGrid] = React.useState(false);
    const PeriodicData = React.useRef<any>(null);
    const SelectedData = React.useRef<any>(null);
    const PeriodicHistoryRecordId = React.useRef<any>(null);
    const UpdateItemArray = React.useRef<any>(null);
    const [isShowHistoryModel, setisShowHistoryModel] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [width, setWidth] = React.useState<string>("1200px");
    const [currentView, setCurrentView] = React.useState<string>(ViewType.grid);
    const [archiveFilter, setArchiveFilter] = React.useState("UnArchived");
    const [archiveDialog, setArchiveDialog] = React.useState(false);
    const [selectedArchiveItem, setSelectedArchiveItem] = React.useState<any>(null);
    const [taskToggleValue, setTaskToggleValue] = React.useState("No");
    const [selectedHistoryItem, setSelectedHistoryItem] = React.useState<any>(null);
    const [isEditModeAttachmentAddModal, setIsEditModeAttachmentAddModal] = React.useState(false);
    const [fileToDelete, setFileToDelete] = React.useState<string | null>(null);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
    const [periodicHistoryItems, setPeriodicHistoryItems] = React.useState<any[]>([]);

    // const [taskComments, setTaskComments] = React.useState("");
    // const [selectedFiles, setSelectedFiles] = React.useState<any[]>([]);
    const [fileInputKey, setFileInputKey] = React.useState(0);
    const [attachmentDialogState, setAttachmentDialogState] = React.useState({
        isOpen: false,
        selectedItem: null
    });
    const [dataState, setDataState] = React.useState<any>({
        validationFelidData: [],
        isFormValidationModelOpen: false,
        validationMessage: [],
        comment: '',
        selectedFiles: [],
        subject: ''
    });
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setCurrentView(ViewType.card);
        } else {
            setCurrentView('grid');
        }
    }, []);

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
            maxWidth: '900px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
        }
    });

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

    const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>([]);
    const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>([]);
    const [selectedStates, setSelectedStates] = React.useState<any[]>([])
    const [selectedStatesId, setSelectedStatesId] = React.useState<any[]>([]);
    const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>([]);
    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSiteIds(siteIds);
        setSelectedSiteTitles(siteTitles);
        setSelectedSCSites(siteSC);
    };

    const onStateChange = (stateIds: number[], options?: any) => {
        setSelectedStates((!!options && options.length > 0) ? options.map((r: any) => r.text) : [])
        setSelectedStatesId((!!stateIds && stateIds.length > 0) ? stateIds : [])
        setSelectedSiteIds([]);
        setSelectedSiteTitles([]);
        setSelectedSCSites([]);
    }

    const _onclickDetailsView = (item: any) => {
        try {
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({
                text: item.Title, key: item.Title, currentCompomnetName: ComponentNameEnum.PeriodicDetails,
                onClick: onBreadcrumbItemClicked,
                manageComponent: props.manageComponentView,
                manageCompomentItem: {
                    currentComponentName: ComponentNameEnum.PeriodicDetails, qCStateId: props?.qCStateId, dataObj: props.dataObj, periodicData: item, breadCrumItems: breadCrumItems,
                }
            });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.PeriodicDetails, qCStateId: props?.qCStateId, dataObj: props.dataObj, periodicData: item, breadCrumItems: breadCrumItems, siteMasterId: props.siteMasterId
            });
        } catch (error) {
            const errorObj = { ErrorMethodName: "_onclickDetailsView", CustomErrormessage: "error in get details view", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };

    const onClickClose = () => {
        setisShowHistoryModel(false);

    };

    const _onclickHistory = async (item: any) => {
        PeriodicHistoryRecordId.current = item?.IsHistoryId;
        await getPeriodicHistoryitems();
        setSelectedHistoryItem(item);
        setisShowHistoryModel(true);
    };

    const _Periodic = async () => {
        try {
            setIsLoading(true);

            let filter = !!props.siteMasterId ? `SiteNameId eq ${props.siteMasterId}` : "";
            let filterArray: string[] = [];

            // Periodic Title Filter
            if (!!selectedPeriodic) {
                filterArray.push(`Title eq '${selectedPeriodic}'`);
            }

            // Week Filter
            if (!!selectedWeek) {
                filterArray.push(`Week eq '${selectedWeek}'`);
            }

            // State Filter
            if (Array.isArray(selectedStates) && selectedStates.length > 0) {
                const filters = selectedStates.map(
                    (stateName) => `SiteName/StateNameValue eq '${stateName.replace(/'/g, "''")}'`
                );
                filterArray.push(`(${filters.join(' or ')})`);
            }

            // Site Filter
            if (selectedSiteIds.length > 0 && Array.isArray(selectedSiteIds) && selectedSiteIds.length > 0) {
                const filters = selectedSiteIds.map(site => `SiteNameId eq '${site}'`);
                filterArray.push(filters.join(' or '));
            }

            // ALWAYS exclude deleted items
            filterArray.push(`IsDeleted ne 1`);

            // ALWAYS exclude inactive items
            filterArray.push(`Inactive ne 1`);

            // ARCHIVE FILTER
            if (archiveFilter === "Archived") {
                filterArray.push(`IsArchived eq 1`);
            }
            else if (archiveFilter === "UnArchived") {
                filterArray.push(`(IsArchived eq false or IsArchived eq null)`);
            }

            // Month Filter
            if (!!selectedMonth) {
                filterArray.push(`Month eq '${selectedMonth}'`);
            }

            // Year Filter
            if (!!selectedYear) {
                filterArray.push(`Year eq '${selectedYear}'`);
            }

            if (filterArray.length > 0) {
                if (filter != "")
                    filter = filter + " and (" + filterArray.join(" and ") + ")";
                else
                    filter = filterArray.join(" and ");
            } else {
                filter = !!props.siteMasterId ? `SiteNameId eq ${props.siteMasterId}` : "";
            }

            const select = ["ID,Title,TaskDate,Area,SiteNameId,SiteName/Title,SiteName/StateNameValue,CompletionDate,Cost,Frequency,JobCompletion,Month,Week,Year,EventNumber,Hours,StaffNumber,WorkType,IsCompleted,IsNotification,SubLocation,Modified,Inactive,IsHistoryId/Id,IsArchived,Comment,AttachmentFiles"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteName,IsHistoryId,AttachmentFiles"],
                listName: ListNames.Periodic,
                filter: filter
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    let PeriodicListData = results.map((data) => {

                        return (
                            {
                                ID: data.ID,
                                Title: !!data.Title ? data.Title : "",
                                TaskDate: !!data.TaskDate ? getConvertedDate(data.TaskDate) : "",
                                CompletionDate: !!data.CompletionDate ? getConvertedDate(data.CompletionDate) : "",
                                fullCompletionDate: !!data.CompletionDate ? data.CompletionDate : "",
                                TaskDateUpdate: !!data.TaskDate ? data.TaskDate : "",
                                CompletionDateUpdate: !!data.CompletionDate ? data.CompletionDate : "",
                                SiteName: !!data.SiteName ? data.SiteName?.Title : "",
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                                Cost: !!data.Cost ? data.Cost : "",
                                FormatCost: !!data.Cost ? formatPrice(data.Cost) : "",
                                Frequency: !!data.Frequency ? data.Frequency : "",
                                JobCompletion: !!data.JobCompletion ? data.JobCompletion : "",
                                Month: !!data.Month ? data.Month : "",
                                QCArea: !!data.Area ? data.Area : "",
                                // QCAreaId: !!data.QCAreaId ? data.QCAreaId : null,
                                Area: !!data.Area ? data.Area : "",
                                Week: !!data.Week ? data.Week : "",
                                Year: !!data.Year ? data.Year : "",
                                EventNumber: !!data.EventNumber ? data.EventNumber : "",
                                Hours: !!data.Hours ? data.Hours : "",
                                StaffNumber: !!data.StaffNumber ? data.StaffNumber : "",
                                WorkType: !!data.WorkType ? data.WorkType : "",
                                IsCompleted: !!data.IsCompleted ? data.IsCompleted : false,
                                IsCompletedText: data?.IsCompleted == true ? "Yes" : "No",
                                IsNotification: !!data.IsNotification ? data.IsNotification : false,
                                IsNotificationText: data?.IsNotification == true ? "Yes" : "No",
                                SubLocation: !!data.SubLocation ? data.SubLocation : "",
                                Modified: !!data.Modified ? data.Modified : null,
                                IsArchived: !!data.IsArchived ? data.IsArchived : false,
                                Comment: !!data.Comment ? data.Comment : "",
                                attachmentFiles: data?.AttachmentFiles?.map((a: any) => a.ServerRelativeUrl) || [],
                                IsHistoryId: !!data.IsHistoryId ? data?.IsHistoryId?.Id : undefined,
                            }
                        );
                    });

                    let filteredData: any[];
                    if (!!props.siteMasterId || currentUserRoleDetail?.isAdmin) {
                        filteredData = PeriodicListData;
                    } else {
                        let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                        filteredData = PeriodicListData.filter(item =>
                            AllSiteIds.includes(item.SiteNameId)
                        );
                    }

                    filteredData = filteredData.sort((a: any, b: any) => {
                        return moment(b.Modified).diff(moment(a.Modified));
                    });

                    setListPeriodic(filteredData);
                }
            }).catch((error) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "_Periodic", CustomErrormessage: "error in get periodic", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(provider, errorObj);
            }).finally(() => {
                setIsLoading(false);
            });
        } catch (err) {
            console.log(err);
            const errorObj = {
                ErrorMessage: err.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while _Periodic",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_Periodic"
            };
            void logGenerator(provider, errorObj);
            const errorMessage = getErrorMessageValue(error.message);
            setError(errorMessage);
            sethasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const closePopup = () => {
        // Hide popup
        setIsEditModeAttachmentAddModal(false);
        hidePopup();  // from useBoolean

        // Clear comment & files
        setDataState((prev: any) => ({
            ...prev,
            comment: "",
            selectedFiles: []
        }));

        // Reset file input
        setFileInputKey(prev => prev + 1);

        // Reset toggle value
        setTaskToggleValue("No");
    };


    const onPeriodicChange = (Periodic: any): void => {
        setSelectedPeriodic(Periodic.text);
    };
    const onWeekChange = (Week: any): void => {
        setSelectedWeek(Week.text);
    };

    const onMonthChange = (Month: any): void => {
        setSelectedMonth(Month.text);
    };
    const onYearChange = (Year: any): void => {
        setSelectedYear(Year.text);
    };

    const handleArchiveFilterChange = (option: any) => {
        const value = option?.value || "UnArchived"; // fallback
        setArchiveFilter(value);
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

    const deleteExistingAttachment = async () => {
        if (!fileToDelete) return;

        try {
            setIsLoading(true);

            await provider.deleteAttachment(
                ListNames.Periodic,
                SelectedData.current.Id,
                fileToDelete
            );

            toastService.success(`${fileToDelete} deleted successfully!`);

            // refresh data or attachments
            await _Periodic();

            // remove from local UI state also (optional)
            setDataState((prev: any) => ({
                ...prev,
                selectedFiles: prev.selectedFiles?.filter((f: any) => f.name !== fileToDelete)
            }));


            //  Remove from existing attachment list (UI)
            if (SelectedData.current?.attachmentFiles) {
                SelectedData.current.attachmentFiles =
                    SelectedData.current.attachmentFiles.filter((url: string) => {
                        const name = url.split("/").pop();
                        return name !== fileToDelete;
                    });
            }

            await getPeriodicHistoryitems();

        } catch (error) {
            console.log("Delete error:", error);
            toastService.error("Error deleting file");
        }

        setIsLoading(false);
        setIsDeleteConfirmOpen(false);
        setFileToDelete(null);
    };

    const onclickAdd = () => {
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({ text: "New Form", key: 'New Form', currentCompomnetName: ComponentNameEnum.AddNewPeriodic, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewPeriodic, siteName: "", qCState: "", siteMasterId: props.siteMasterId, breadCrumItems: breadCrumItems } });
        props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewPeriodic, qCStateId: props?.qCStateId, dataObj2: props.dataObj, siteName: "", qCState: "", siteMasterId: props.siteMasterId, breadCrumItems: breadCrumItems });
    };

    const onclickEdit = (predata: any) => {
        try {
            setisDisplayEDbtn(false);
            if (!!UpdateItem) {
                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                breadCrumItems.push({ text: 'Update', key: 'Update', currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewPeriodic, siteMasterId: "", dataObj: UpdateItem, siteName: "", qCState: "", breadCrumItems: breadCrumItems, pivotName: "" } });
                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewPeriodic, IsUpdate: true, editItemId: UpdateItemArray.current, qCStateId: props?.qCStateId, dataObj2: props.dataObj, siteMasterId: props.siteMasterId, dataObj: UpdateItem, siteName: "", qCState: "", pivotName: "", breadCrumItems: breadCrumItems });
            }
            let data: any[] = [];
            if (!!predata.ID) {
                data.push(predata);
                if (!!data) {
                    let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                    breadCrumItems.push({ text: 'Update', key: 'Update', currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewPeriodic, siteMasterId: "", dataObj: data, siteName: "", qCState: "", breadCrumItems: breadCrumItems, pivotName: "" } });
                    props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewPeriodic, IsUpdate: true, editItemId: UpdateItemArray.current, qCStateId: props?.qCStateId, dataObj2: props.dataObj, siteMasterId: props.siteMasterId, dataObj: data, siteName: "", qCState: "", pivotName: "", breadCrumItems: breadCrumItems });
                }
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickEdit", CustomErrormessage: "error in on click edit", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };
    const onclickdelete = async () => {
        const toastId = toastService.loading('Loading...');
        setIsLoading(true);
        try {

            if (!!UpdateItem) {
                const processUpdateItem = (input: any) => {
                    if (Array.isArray(input)) {
                        return input.map(item => ({
                            Id: item.ID,
                            IsDeleted: true
                        }));
                    } else if (typeof input === 'object' && input !== null) {
                        return [{ Id: input.ID, IsDeleted: true }];
                    } else {
                        return [];
                    }
                };
                const items = Array.isArray(UpdateItem) && UpdateItem.length > 0 ? UpdateItem : [UpdateItem];
                items.forEach(async (res: any) => {
                    const stateId = await getStateBySiteId(provider, Number(res?.SiteNameId));
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: res?.SiteNameId,
                        ActionType: UserActivityActionTypeEnum.Delete,
                        EntityType: UserActionEntityTypeEnum.Periodic,
                        EntityId: res?.ID,
                        EntityName: res?.Title,
                        Details: `Delete Periodic`,
                        StateId: stateId || props?.qCStateId
                    };
                    void UserActivityLog(provider, logObj, currentUserRoleDetail);
                });
                const newObjects = processUpdateItem(UpdateItem);
                if (newObjects.length > 0) {
                    await provider.updateListItemsInBatchPnP(ListNames.Periodic, newObjects);
                    toastService.updateLoadingWithSuccess(toastId, "Record deleted successfully!");
                }
                toggleHideDialog();
                setIsLoading(false);
                setisDisplayEDbtn(false);
                _Periodic();
            }
        } catch (ex) {
            const errorObj = {
                ErrorMessage: ex.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  onclickdelete",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onclickdelete"
            };
            void logGenerator(provider, errorObj);
            console.log(ex);
            setIsLoading(false);
        }
    };
    const _onItemInvoked = (item: any): void => {
        _onclickDetailsView(item);
    };
    const _onItemSelected = (item: any): void => {
        if (item.length > 0) {
            let updateItem = item.map((i: any) => i.ID);
            UpdateItemArray.current = updateItem;
            if (item.length == 1) {
                setIsDisplayEditButtonview(true);
                setUpdateItem(item);
            } else {
                setIsDisplayEditButtonview(false);
                setUpdateItem(item);
            }
            setisDisplayEDbtn(true);
        } else {
            UpdateItemArray.current = [];
            setUpdateItem([]);
            setisDisplayEDbtn(false);
        }
    };

    const onclickUpload = () => {
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: true }));
    };
    const onCancel = async () => {
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
    };
    const onClickCloseModel = () => {
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false }));
    };
    const onOkModel = () => {
        setnotFoundDialog(false);
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: true }));
    };

    const getPeriodicChoicesList = (): void => {
        const select = ["Id,Title,ChoiceValue,SiteNameId,IsActive"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.PeriodicChoices,
            filter: !!props.siteMasterId ? `SiteNameId eq ${props.siteMasterId}` : ""
        };
        provider.getItemsByQuery(queryStringOptions).then((response) => {
            PeriodicData.current = response;
        }).catch((error) => {
            console.log(error);
            const errorObj = { ErrorMethodName: "getPeriodicChoicesList", CustomErrormessage: "error in get Periodic Choices List", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            const errorMessage = getErrorMessageValue(error.message);
            setError(errorMessage);
            sethasError(true);
            setIsLoading(false);
        });
    };

    React.useEffect(() => {
        try {
            if (reloadGrid) {
                setIsLoading(true);
                // eslint-disable-next-line no-void
                void (async () => {
                    _Periodic();
                    setIsLoading(false);
                    setReloadGrid(false);
                })();
            }
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
                    // const siteNameArray = UsersListData.map(item => item.ID);
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

    const checkAndUpdateObjects = (oldObj: any, newObj: any) => {
        let finalObj: any = [];
        const fieldsMapping: any = {
            Area: "Area"
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
            provider.createItemInBatch(finalObj, ListNames.PeriodicChoices).then(async (results: any) => {
                console.log("Choices Insert Successfully");
                getPeriodicChoicesList();
            }).catch(err => console.log(err));
        } else {
            provider.createItemInBatch(uniqueResult, ListNames.PeriodicChoices).then(async (results: any) => {
                console.log("Choices Insert Successfully");
                getPeriodicChoicesList();
            }).catch(err => console.log(err));
        }

    };

    const onSaveFiles = () => {
        setIsLoading(true);
        try {
            if (uploadData && uploadData.length > 0) {
                const toastMessage = 'Record Insert successfully!';
                const toastId = toastService.loading('Loading...');
                const data = checkAndUpdateObjects(uploadData, PeriodicData.current);
                const titles = uploadData.map((item: any) => item?.Title).join(', ');
                provider.createItemInBatch(uploadData, ListNames.Periodic).then(async (results: any) => {
                    setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
                    setReloadGrid(true);
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    setIsLoading(false);
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: props?.siteMasterId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.Create,
                        EntityType: UserActionEntityTypeEnum.Periodic,
                        // EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        EntityName: "Excel Upload", // Match index dynamically
                        Details: `Create record using excel upload for ${titles}`,
                        StateId: props?.qCStateId
                    };
                    void UserActivityLog(provider, logObj, currentUserRoleDetail);

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
                const expectedColumnNames = ['Title', 'Frequency', 'Week', 'Month', 'Year', 'Area', 'TaskDate', 'CompletionDate', 'IsCompleted', 'IsNotification', 'JobCompletion', 'Cost', 'EventNumber', 'Hours', 'StaffNumber', 'WorkType'];
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

    const removeFile = async (id: number | string) => {
        try {
            const newFiles = state.mdlConfigurationFile.filter((file: IFileWithBlob) => file.key != id);
            setState((prevState: any) => ({ ...prevState, mdlConfigurationFile: newFiles }));
        } catch (error) {
            const errorObj = { ErrorMethodName: "removeFile", CustomErrormessage: "removeFile", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
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

    React.useEffect(() => {
        const className = document.querySelector('ARTICLE')?.children[0].children[0].classList[0];
        let el: any = document.querySelector(!!className ? `.${className}` : "");
        if (!!el) {
            el.onscroll = function () {
                scrollFunction(185);
            };
        }
        let permssiion = showPremissionDeniedPage(currentUserRoleDetail);
        if (permssiion.length == 0) {
            props.manageComponentView({ currentComponentName: ComponentNameEnum.AccessDenied });
        }
        _Periodic();
        setDataState((prev: any) => ({
            ...prev,
            comment: "",
            selectedFiles: []
        }));
        // Reset file input field
        setFileInputKey(prev => prev + 1);

    }, [isRefreshGrid]);

    React.useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false; // Skip first run
            return;
        }
        _Periodic();
        setDataState((prev: any) => ({
            ...prev,
            comment: "",
            selectedFiles: []
        }));
        // Reset file input field
        setFileInputKey(prev => prev + 1);
    }, [selectedPeriodic, selectedWeek, selectedMonth, selectedYear, selectedSiteIds, archiveFilter]);

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
                let fileNameArray = results.map(item => item.FileLeafRef == "Periodic.xlsx");

                for (let i = 0; i < fileNameArray.length; i++) {
                    if (fileNameArray[i] == true) {
                        setdownloadDisable(false);
                    }
                }
            }
        }).catch((error) => {
            console.log(error);
            setIsLoading(false);
        });
        _siteData();
        getPeriodicChoicesList();
    }, [isRefreshGrid]);

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
                        Hours: any;
                        Week: any;
                        Year: any;
                        IsCompleted: any;
                        IsNotification: any;
                        SiteNameId: any;
                        TaskDate: moment.MomentInput;
                        CompletionDate: moment.MomentInput;

                    }) => {
                        if (item.TaskDate) {
                            item.TaskDate = moment(item.TaskDate, "DD-MM-YYYY").format("YYYY-MM-DD[T]HH:mm:ss[Z]");
                        }
                        if (item.CompletionDate) {
                            item.CompletionDate = moment(item.CompletionDate, "DD-MM-YYYY").format("YYYY-MM-DD[T]HH:mm:ss[Z]");
                        }
                        if (item.IsCompleted == 1 || item.IsCompleted === true) {
                            item.IsCompleted = true;
                        } else {
                            item.IsCompleted = false;
                        }
                        if (item.IsNotification == 1 || item.IsNotification === true) {
                            item.IsNotification = true;
                        } else {
                            item.IsNotification = false;
                        }
                        if (item.SiteNameId === 0) {
                            item.SiteNameId = props.siteMasterId;
                        }
                        item.Hours = item.Hours.toString();
                        item.Week = item.Week.toString();
                        item.Year = item.Year.toString();
                        return item;
                    });
                    setuploadData(formattedData);
                }
            }
        }
    }, [excelData]);

    const onclickExportToExcel = async () => {
        try {
            let exportColumns: IExportColumns[] = [
                {
                    header: "Area",
                    key: "QCArea"
                },
                {
                    header: "Sub Location",
                    key: "SubLocation"
                },
                {
                    header: "Work Type",
                    key: "WorkType"
                },
                {
                    header: "Periodic",
                    key: "Title"
                },
                {
                    header: "Frequency",
                    key: "Frequency"
                },
                {
                    header: "Week",
                    key: "Week"
                },
                {
                    header: "Month",
                    key: "Month"
                },
                {
                    header: "Year",
                    key: "Year"
                },
                {
                    header: "Job Completion",
                    key: "JobCompletion"
                },
                {
                    header: "Task Date",
                    key: "TaskDate"
                },
                {
                    header: "Completion Date",
                    key: "CompletionDate"
                },
                {
                    header: "Event Number",
                    key: "EventNumber"
                },
                {
                    header: "Hours",
                    key: "Hours"
                },
                {
                    header: "Cost",
                    key: "FormatCost"
                },
                {
                    header: "Staff Number",
                    key: "StaffNumber"
                }
            ];
            let filename = props.componentProp.siteName ? props.componentProp.siteName : "Master" + "_Periodic";
            generateExcelTable(ListPeriodic, exportColumns, `${filename}.xlsx`);
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickExportToExcel", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }
    };
    const onclickDownload = async () => {
        try {
            let url = context.pageContext.web.absoluteUrl + '/Shared%20Documents/MasterFiles/Periodic.xlsx';
            let fileName = "Periodic";
            let downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickDownload", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };

    const onClickArchiveToggle = (item: any) => {
        setSelectedArchiveItem(item);
        setArchiveDialog(true);
    };

    const onClickArchiveConfirm = async () => {
        const item = selectedArchiveItem;
        if (!item) return;

        const isArchived = item?.IsArchived === true;

        try {
            await provider.updateItemWithPnP(
                { IsArchived: !isArchived },
                ListNames.Periodic,
                item.ID
            );

            toastService.success(
                `Item successfully ${isArchived ? "unarchived" : "archived"}`
            );

            setArchiveDialog(false);
            setSelectedArchiveItem(null);
            _Periodic(); // Refresh
            setDataState((prev: any) => ({
                ...prev,
                comment: "",
                selectedFiles: []
            }));
            // Reset file input field
            setFileInputKey(prev => prev + 1);

        } catch (err) {
            toastService.error("Error while updating archive status");
            console.log(err);
        }
    };

    const handleViewAttachment = (item: any) => {
        setAttachmentDialogState({
            isOpen: true,
            selectedItem: item,
        })
    }

    React.useEffect(() => {
        let isVisibleCrud1 = (!!PermissionArray && PermissionArray?.includes('Periodic') || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;
        if (!!props.siteMasterId) {
            setcolumnsPeriodic([
                {
                    key: "key10", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 120, maxWidth: 180,
                    onRender: ((itemID: any) => {
                        const isPastDate = (date: any) => {
                            return moment(date).isBefore(moment());
                        };
                        const isArchived = itemID?.IsArchived === true;

                        return <>
                            <div className='dflex action-wrap'>
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
                                <div>
                                    <Link
                                        className={`actionBtn ${isArchived ? "btnGreen" : "btnDanger"} dticon`}
                                        onClick={() => onClickArchiveToggle(itemID)}
                                    >
                                        <TooltipHost
                                            content={isArchived ? "Unarchive" : "Archive"}
                                            id={tooltipId}
                                        >
                                            <div>
                                                <FontAwesomeIcon icon={isArchived ? "box-open" : "box-archive"} />
                                            </div>
                                        </TooltipHost>
                                    </Link>
                                </div>
                                {(itemID?.attachmentFiles && itemID?.attachmentFiles.length > 0) && <div>
                                    <Link
                                        className={`actionBtn ${isArchived ? "btnGreen" : "btnDanger"} dticon`}
                                    >
                                        <TooltipHost
                                            content={"View Attachments"}
                                            id={tooltipId}
                                        >
                                            <div>
                                                <FontAwesomeIcon
                                                    icon="paperclip"
                                                    className="cursor-pointer mx-2"
                                                    title="View Attachments"
                                                    onClick={() =>
                                                        handleViewAttachment(itemID)
                                                    }
                                                />
                                            </div>
                                        </TooltipHost>
                                    </Link>
                                </div>}
                                {itemID.IsCompleted === false && props.siteMasterId && <Link className="actionBtn btnGreen dticon" onClick={() => {
                                }}>
                                    <TooltipHost
                                        content={"Frequency"}
                                        id={tooltipId}
                                    >
                                        <div onClick={() => _onclickTrue(itemID)}>
                                            <FontAwesomeIcon icon="check" /></div>
                                    </TooltipHost>
                                </Link>}

                                {(itemID && itemID?.IsHistoryId) && <Link className="actionBtn btnEdit dticon" onClick={() => {
                                    // setState(prevState => ({ ...prevState, isShowAssetHistoryModel: true, siteNameId: itemID.SiteNameId, assetMasterId: itemID.ID }))  
                                }}>
                                    <TooltipHost
                                        content={"Periodic History"}
                                        id={tooltipId}
                                    >
                                        <div onClick={() => _onclickHistory(itemID)}>
                                            <FontAwesomeIcon icon="clock-rotate-left" /></div>
                                    </TooltipHost>
                                </Link>}
                                {isWithinNextMonthRange(itemID.fullCompletionDate) && props.siteMasterId && itemID.IsCompleted === false && isPastDate(itemID.CompletionDate) &&
                                    <Link className="actionBtn btnDanger dticon" onClick={() => {
                                        // setState(prevState => ({ ...prevState, isShowAssetHistoryModel: true, siteNameId: itemID.SiteNameId, assetMasterId: itemID.ID }))  
                                    }}>
                                        <TooltipHost
                                            content={`Task is Due on: ${itemID.CompletionDate}`}
                                            id={tooltipId}
                                        >
                                            <div>
                                                <FontAwesomeIcon icon="circle-exclamation" />
                                            </div>
                                        </TooltipHost>
                                    </Link>
                                }
                            </div ></>;
                    })
                },
                {
                    key: "Area", name: 'Area', fieldName: 'QCArea', isResizable: true, minWidth: 140, maxWidth: 170, isSortingRequired: true,
                    onRender: (item: any) => {
                        if (item.QCArea != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.QCArea} id={tooltipId}>
                                            {item.QCArea}
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
                { key: 'SubLocation', name: 'Sub Location', fieldName: 'SubLocation', isResizable: true, minWidth: 180, maxWidth: 240, isSortingRequired: true },
                { key: 'WorkType', name: 'Work Type', fieldName: 'WorkType', isResizable: true, minWidth: 120, maxWidth: 160, isSortingRequired: true },
                {
                    key: 'Title', name: 'Periodic Title', fieldName: 'Title', isResizable: true, minWidth: 250, maxWidth: 300, isSortingRequired: true,
                    onRender: (item: any) => {
                        if (item.Title != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.Title} id={tooltipId}>
                                            <div onClick={() => _onclickDetailsView(item)}>{item.Title}</div>
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
                { key: 'Frequency', name: 'Frequency', fieldName: 'Frequency', isResizable: true, minWidth: 80, maxWidth: 100, isSortingRequired: true },
                { key: 'Week', name: 'Week', fieldName: 'Week', minWidth: 40, maxWidth: 70, isSortingRequired: true },
                { key: 'Month', name: 'Month', fieldName: 'Month', minWidth: 50, maxWidth: 70, isSortingRequired: true },
                { key: 'Year', name: 'Year', fieldName: 'Year', minWidth: 40, maxWidth: 70, isSortingRequired: true },
                { key: 'JobCompletion', name: 'Job Completion', fieldName: 'JobCompletion', isResizable: true, minWidth: 140, maxWidth: 180, isSortingRequired: true },
                { key: 'TaskDate', name: 'Task Date', fieldName: 'TaskDate', minWidth: 90, maxWidth: 140, isSortingRequired: true },
                {
                    key: 'CompletionDate', name: 'Completion Date', fieldName: 'CompletionDate', minWidth: 110, maxWidth: 160,

                    onRender: ((itemID: any) => {
                        const isPastDate = (date: any) => {
                            return moment(date).isBefore(moment());
                        };
                        return <>
                            {(isWithinNextMonthRange(itemID.fullCompletionDate) && itemID.IsCompleted === false && isPastDate(itemID.CompletionDate)) ?
                                <div className="redBadgeact badge-mar-o">{itemID.CompletionDate}</div> : <div className="">{itemID.CompletionDate}</div>
                            }
                        </>;
                    })
                },
                { key: 'EventNumber', name: 'Event Number', fieldName: 'EventNumber', minWidth: 110, maxWidth: 160, isSortingRequired: true },
                { key: 'Comment', name: 'Comment', fieldName: 'Comment', minWidth: 110, maxWidth: 160, isSortingRequired: true },
            ]);
        } else {
            setcolumnsPeriodic([
                {
                    key: "key10", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 110, maxWidth: 180,
                    onRender: ((itemID: any) => {
                        const isPastDate = (date: any) => {
                            return moment(date).isBefore(moment());
                        };
                        const isArchived = itemID?.IsArchived === true;
                        return <>
                            <div className='dflex action-wrap'>
                                <div>
                                    <Link className="actionBtn btnView dticon" onClick={() => {
                                        // setState(prevState => ({ ...prevState, isShowAssetHistoryModel: true, siteNameId: itemID.SiteNameId, assetMasterId: itemID.ID }))  
                                    }}>
                                        <TooltipHost
                                            content={"Details"}
                                            id={tooltipId}
                                        >
                                            <div onClick={() => _onclickDetailsView(itemID)}>
                                                <FontAwesomeIcon icon="eye" /></div>
                                        </TooltipHost>
                                    </Link>
                                </div>
                                <div>
                                    <Link
                                        className={`actionBtn ${isArchived ? "btnGreen" : "btnDanger"} dticon`}
                                        onClick={() => onClickArchiveToggle(itemID)}
                                    >
                                        <TooltipHost
                                            content={isArchived ? "Unarchive" : "Archive"}
                                            id={tooltipId}
                                        >
                                            <div>
                                                <FontAwesomeIcon icon={isArchived ? "box-open" : "box-archive"} />
                                            </div>
                                        </TooltipHost>
                                    </Link>
                                </div>
                                {(itemID?.attachmentFiles && itemID?.attachmentFiles.length > 0) && <div>
                                    <Link
                                        className={`actionBtn ${isArchived ? "btnGreen" : "btnDanger"} dticon`}
                                    >
                                        <TooltipHost
                                            content={"View Attachments"}
                                            id={tooltipId}
                                        >
                                            <div>
                                                <FontAwesomeIcon
                                                    icon="paperclip"
                                                    className="cursor-pointer mx-2"
                                                    title="View Attachments"
                                                    onClick={() =>
                                                        handleViewAttachment(itemID)
                                                    }
                                                />
                                            </div>
                                        </TooltipHost>
                                    </Link>
                                </div>}
                                {itemID.IsCompleted === false && props.siteMasterId && <Link className="actionBtn btnGreen dticon" onClick={() => {
                                    // setState(prevState => ({ ...prevState, isShowAssetHistoryModel: true, siteNameId: itemID.SiteNameId, assetMasterId: itemID.ID }))  
                                }}>
                                    <TooltipHost
                                        content={"Frequency"}
                                        id={tooltipId}
                                    >
                                        <div onClick={() => _onclickTrue(itemID)}>
                                            <FontAwesomeIcon icon="check" /></div>
                                    </TooltipHost>
                                </Link>}

                                {(itemID && itemID?.IsHistoryId) && <Link className="actionBtn btnEdit dticon" onClick={() => {
                                    // setState(prevState => ({ ...prevState, isShowAssetHistoryModel: true, siteNameId: itemID.SiteNameId, assetMasterId: itemID.ID }))  
                                }}>
                                    <TooltipHost
                                        content={"Periodic History"}
                                        id={tooltipId}
                                    >
                                        <div onClick={() => _onclickHistory(itemID)}>
                                            <FontAwesomeIcon icon="clock-rotate-left" /></div>
                                    </TooltipHost>
                                </Link>}
                                {isWithinNextMonthRange(itemID.fullCompletionDate) && props.siteMasterId && itemID.IsCompleted === false && isPastDate(itemID.CompletionDate) &&
                                    <Link className="actionBtn btnDanger dticon" onClick={() => {
                                        // setState(prevState => ({ ...prevState, isShowAssetHistoryModel: true, siteNameId: itemID.SiteNameId, assetMasterId: itemID.ID }))  
                                    }}>
                                        <TooltipHost
                                            content={`Task is Due on: ${itemID.CompletionDate}`}
                                            id={tooltipId}
                                        >
                                            <div>
                                                <FontAwesomeIcon icon="circle-exclamation" />
                                            </div>
                                        </TooltipHost>
                                    </Link>
                                }
                            </div ></>;
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
                    key: "Area", name: 'Area', fieldName: 'QCArea', isResizable: true, minWidth: 140, maxWidth: 170, isSortingRequired: true,
                    onRender: (item: any) => {
                        if (item.QCArea != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.QCArea} id={tooltipId}>
                                            {item.QCArea}
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
                { key: 'SubLocation', name: 'Sub Location', fieldName: 'SubLocation', isResizable: true, minWidth: 180, maxWidth: 240, isSortingRequired: true },
                { key: 'WorkType', name: 'Work Type', fieldName: 'WorkType', isResizable: true, minWidth: 120, maxWidth: 160, isSortingRequired: true },
                {
                    key: 'Title', name: 'Periodic Title', fieldName: 'Title', isResizable: true, minWidth: 250, maxWidth: 300, isSortingRequired: true,
                    onRender: (item: any) => {
                        if (item.Title != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.Title} id={tooltipId}>
                                            <div onClick={() => _onclickDetailsView(item)}>{item.Title}</div>
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
                { key: 'Frequency', name: 'Frequency', fieldName: 'Frequency', isResizable: true, minWidth: 80, maxWidth: 100, isSortingRequired: true },
                { key: 'Week', name: 'Week', fieldName: 'Week', minWidth: 40, maxWidth: 70, isSortingRequired: true },
                { key: 'Month', name: 'Month', fieldName: 'Month', minWidth: 50, maxWidth: 70, isSortingRequired: true },
                { key: 'Year', name: 'Year', fieldName: 'Year', minWidth: 40, maxWidth: 70, isSortingRequired: true },
                { key: 'JobCompletion', name: 'Job Completion', fieldName: 'JobCompletion', isResizable: true, minWidth: 140, maxWidth: 180, isSortingRequired: true },
                { key: 'TaskDate', name: 'Task Date', fieldName: 'TaskDate', minWidth: 90, maxWidth: 140, isSortingRequired: true },
                {
                    key: 'CompletionDate', name: 'Completion Date', fieldName: 'CompletionDate', minWidth: 110, maxWidth: 160,

                    onRender: ((itemID: any) => {
                        const isPastDate = (date: any) => {
                            return moment(date).isBefore(moment());
                        };
                        return <>
                            {(isWithinNextMonthRange(itemID.fullCompletionDate) && itemID.IsCompleted === false && isPastDate(itemID.CompletionDate)) ?
                                <div className="redBadgeact badge-mar-o">{itemID.CompletionDate}</div> : <div className="">{itemID.CompletionDate}</div>
                            }
                        </>;
                    })
                },
                { key: 'EventNumber', name: 'Event Number', fieldName: 'EventNumber', minWidth: 110, maxWidth: 160, isSortingRequired: true },
                { key: 'Comment', name: 'Comment', fieldName: 'Comment', minWidth: 110, maxWidth: 160, isSortingRequired: true }
            ]);
        }
    }, []);

    const _onclickTrue = (item: any) => {
        SelectedData.current = item;
        showPopup();
    };

    const onClickEditHistory = (item: any) => {
        setIsEditModeAttachmentAddModal(true);                    // ENABLE EDIT MODE
        SelectedData.current = item;

        // Prefill comment
        setDataState((prev: any) => ({
            ...prev,
            comment: item.Comment || "",
            selectedFiles: []     // user will add new ones
        }));

        showPopup();
    };

    const updateHistoryRecord = async () => {
        const item = SelectedData.current;

        try {
            setIsLoading(true);

            /** ------------------------------
             *  UPDATE MAIN FIELDS (COMMENT)
             * ------------------------------ */
            await provider.updateItemWithPnP(
                {
                    Comment: dataState.comment?.trim()
                },
                ListNames.Periodic,
                item.Id
            );

            /** -----------------------------------
             * ADD NEWLY SELECTED ATTACHMENTS
             * ----------------------------------- */
            if (dataState.selectedFiles?.length > 0) {
                await provider.addMultipleAttachment(
                    ListNames.Periodic,
                    item.Id,
                    dataState.selectedFiles
                );
            }

            toastService.success("Record updated successfully!");

            // Refresh list
            await _Periodic();

            await getPeriodicHistoryitems();

            // Close modal
            closePopup();


            // Reset state after success
            setDataState((prev: any) => ({
                ...prev,
                comment: "",
                selectedFiles: [],
                newFiles: []
            }));

            // Reset file input field
            setFileInputKey(prev => prev + 1);
        } catch (error) {
            console.log("Error updating history:", error);
            toastService.error("Error updating record!");
        }

        setIsLoading(false);
    };

    const validation = (type: any) => {
        let validationMessage: any[] = [];
        if (!dataState.comment?.trim()) {
            validationMessage.push('Comment is required.')
        }
        if (!dataState.selectedFiles || dataState.selectedFiles.length === 0) {
            if (isEditModeAttachmentAddModal) {
                if (!SelectedData.current?.attachmentFiles || SelectedData.current?.attachmentFiles.length === 0) {
                    validationMessage.push('File is required.');
                }
            } else {
                validationMessage.push('File is required.');
            }
        }

        if (validationMessage.length > 0) {
            setDataState((prevState: any) => ({ ...prevState, isFormValidationModelOpen: true, validationMessage: validationMessage, subject: 'Missing data' }));
        } else {
            setIsLoading(true);

            if (isEditModeAttachmentAddModal) {
                updateHistoryRecord();
                return;
            }
            if (type === 'Yes') {
                handleYesAction();
            } else {
                handleNoAction();
            }
        }
    }

    // const onClickYes = async () => {
    //     const selectedItem = SelectedData.current;
    //     const newTaskDate = moment(SelectedData.current.TaskDateUpdate);
    //     const newCompletionDate = moment(SelectedData.current.fullCompletionDate);
    //     let updateTaskDate: any;
    //     let updateCompletionDate: any;
    //     let complete: any = false;
    //     if (selectedItem?.Frequency === "Yearly") {
    //         updateTaskDate = newTaskDate.add(1, 'year');
    //         updateCompletionDate = newCompletionDate.add(1, 'year');
    //     } else if (selectedItem?.Frequency === "Quarterly") {
    //         updateTaskDate = newTaskDate.add(3, 'months');
    //         updateCompletionDate = newCompletionDate.add(3, 'months');
    //     } else if (selectedItem?.Frequency === "Monthly") {
    //         updateTaskDate = newTaskDate.add(1, 'month');
    //         updateCompletionDate = newCompletionDate.add(1, 'month');
    //     } else if (selectedItem?.Frequency === "Weekly") {
    //         updateTaskDate = newTaskDate.add(1, 'week');
    //         updateCompletionDate = newCompletionDate.add(1, 'week');
    //     } else if (selectedItem?.Frequency === "Daily") {
    //         updateTaskDate = newTaskDate.add(1, 'day');
    //         updateCompletionDate = newCompletionDate.add(1, 'day');
    //     } else if (selectedItem?.Frequency === "Half Yearly") {
    //         updateTaskDate = newTaskDate.add(6, 'months');
    //         updateCompletionDate = newCompletionDate.add(6, 'months');
    //     } else if (selectedItem?.Frequency === "Fortnightly") {
    //         updateTaskDate = newTaskDate.add(15, 'days');
    //         updateCompletionDate = newCompletionDate.add(15, 'days');
    //     }

    //     let FinalTaskDate;
    //     let FinalCompletionDate;
    //     FinalTaskDate = !!updateTaskDate ? new Date(updateTaskDate) : undefined;
    //     FinalCompletionDate = !!updateCompletionDate ? new Date(updateCompletionDate) : undefined;
    //     complete = false;

    //     // const data: any = {
    //     //     TaskDate: FinalTaskDate,
    //     //     CompletionDate: FinalCompletionDate,
    //     //     IsCompleted: complete,
    //     //     Comment: dataState?.Comment
    //     // };

    //     // const Createdata: any = {
    //     //     Title: selectedItem?.Title,
    //     //     TaskDate: !!selectedItem?.TaskDateUpdate ? new Date(selectedItem?.TaskDateUpdate) : undefined,
    //     //     CompletionDate: !!selectedItem?.fullCompletionDate ? new Date(selectedItem?.fullCompletionDate) : undefined,
    //     //     PeriodicId: selectedItem?.ID,
    //     // };

    //     const createdata: any = {
    //         Title: selectedItem.Title,
    //         Cost: selectedItem?.Cost ? parseFloat(selectedItem.Cost.toString().replace(/[$,]/g, '')) : 0,
    //         TaskDate: FinalTaskDate,
    //         CompletionDate: FinalCompletionDate,
    //         Area: !!selectedItem?.Area ? selectedItem.Area : "",
    //         Frequency: !!selectedItem?.Frequency ? selectedItem.Frequency : "",
    //         JobCompletion: !!selectedItem?.JobCompletion ? selectedItem.JobCompletion : "",
    //         Week: selectedItem?.Week?.value ?? selectedItem?.Week ?? "",
    //         Month: selectedItem?.Month?.value ?? selectedItem?.Month ?? "",
    //         Year: selectedItem?.Year?.value ?? selectedItem?.Year ?? "",
    //         SiteNameId: !!selectedItem.SiteNameId ? selectedItem.SiteNameId : 0,
    //         WorkType: !!selectedItem?.WorkType ? selectedItem.WorkType : "",
    //         EventNumber: !!selectedItem?.EventNumber ? selectedItem.EventNumber : null,
    //         Hours: !!selectedItem?.Hours ? selectedItem.Hours : "",
    //         StaffNumber: !!selectedItem?.StaffNumber ? selectedItem.StaffNumber : "",
    //         IsNotification: !!selectedItem?.IsNotification ? selectedItem.IsNotification : false,
    //         SubLocation: !!selectedItem?.SubLocation ? selectedItem.SubLocation : "",
    //         Comment: dataState?.comment?.trim(),
    //         IsCompleted: complete
    //     };

    //     const objUpdateData = {
    //         Inactive: true
    //     }

    //     await provider.createItem(createdata, ListNames.Periodic).then(async (res: any) => {
    //         let uploadid = res?.data?.ID;
    //         provider.addAttachment(ListNames.Periodic, uploadid, dataState.selectedFiles).then((res: any[]) => {
    //             console.log("success");
    //         }).catch((error) => {
    //             console.log("error", error);
    //         });
    //         console.log("Periodic History Insert Succefully");
    //     }).catch(err => console.log(err));
    //     await provider.updateItemWithPnP(objUpdateData, ListNames.Periodic, selectedItem?.ID);
    //     // await provider.updateItemWithPnP(data, ListNames.Periodic, selectedItem?.ID);
    //     console.log("Update");
    //     setIsLoading(false);
    //     const toastMessage = 'Periodic history update successfully!';
    //     const toastId = toastService.loading('Loading...');
    //     toastService.updateLoadingWithSuccess(toastId, toastMessage);
    //     _Periodic();
    //     hidePopup();
    // };

    const handleYesAction = async () => {
        const item = SelectedData.current;

        try {
            // --------------------------------------------
            // 1️⃣ Calculate next TaskDate & CompletionDate
            // --------------------------------------------
            const newTaskDate = moment(item.TaskDateUpdate);
            const newCompletionDate = moment(item.fullCompletionDate);

            const addMap: any = {
                "Yearly": { y: 1 },
                "Quarterly": { M: 3 },
                "Monthly": { M: 1 },
                "Weekly": { w: 1 },
                "Daily": { d: 1 },
                "Half Yearly": { M: 6 },
                "Fortnightly": { d: 15 }
            };

            const delta = addMap[item.Frequency];
            if (delta) {
                newTaskDate.add(delta);
                newCompletionDate.add(delta);
            }

            // --------------------------------------------
            // 2️⃣ Mark current item as inactive
            // --------------------------------------------
            await provider.updateItemWithPnP(
                { Inactive: true },
                ListNames.Periodic,
                item.ID
            );

            const IsHistoryId = item?.IsHistoryId ? item?.IsHistoryId : item.ID;
            // --------------------------------------------
            // 3️⃣ Prepare NEW ITEM with parent IsHistoryId
            // --------------------------------------------
            const newItem: any = {
                Title: item.Title,
                Cost: item?.Cost ? parseFloat(item.Cost.toString().replace(/[$,]/g, '')) : 0,
                TaskDate: newTaskDate?.toDate(),
                CompletionDate: newCompletionDate?.toDate(),
                Area: item?.Area || "",
                Frequency: item?.Frequency || "",
                JobCompletion: item?.JobCompletion || "",
                Week: item?.Week?.value ?? item?.Week ?? "",
                Month: item?.Month?.value ?? item?.Month ?? "",
                Year: item?.Year?.value ?? item?.Year ?? "",
                SiteNameId: item?.SiteNameId || 0,
                WorkType: item?.WorkType || "",
                EventNumber: item?.EventNumber || null,
                Hours: item?.Hours || "",
                StaffNumber: item?.StaffNumber || "",
                IsNotification: item?.IsNotification || false,
                SubLocation: item?.SubLocation || "",
                Comment: dataState.comment?.trim(),
                IsCompleted: false,
                IsHistoryIdId: IsHistoryId
            };

            // --------------------------------------------
            // 4️⃣ Create new item
            // --------------------------------------------
            const response = await provider.createItem(newItem, ListNames.Periodic);
            const newItemId = response?.data?.ID;

            // --------------------------------------------
            // 5️⃣ Upload attachments
            // --------------------------------------------
            if (dataState.selectedFiles?.length > 0) {
                await provider.addMultipleAttachment(ListNames.Periodic, newItemId, dataState.selectedFiles);
            }

            toastService.success("New Periodic task created successfully!");

        } catch (error) {
            console.log("Error in YES flow:", error);
            toastService.error("Error occurred!");
        }

        setIsLoading(false);
        _Periodic();
        closePopup();
    };


    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };

    const handleNoAction = async () => {
        const item = SelectedData.current;

        try {
            // 1️⃣ Update only the current item
            await provider.updateItemWithPnP(
                {
                    IsCompleted: true,
                    Comment: dataState.comment?.trim()
                },
                ListNames.Periodic,
                item.ID
            );

            // 2️⃣ Attach files to same record
            if (dataState.selectedFiles?.length > 0) {
                await provider.addMultipleAttachment(ListNames.Periodic, item.ID, dataState.selectedFiles);
            }

            toastService.success("Periodic task updated successfully!");

        } catch (error) {
            console.log("Error in NO flow:", error);
            toastService.error("Error occurred!");
        }

        setIsLoading(false);
        _Periodic();
        closePopup();
    };

    // const onClickNo = async () => {
    //     const data: any = {
    //         IsCompleted: true,
    //     };
    //     await provider.updateItemWithPnP(data, ListNames.Periodic, SelectedData.current.ID);
    //     console.log("Update");
    //     _Periodic();
    //     hidePopup();
    // };

    // const onFileSelection = (e: any): void => {
    //     const { files } = e.target;
    //     const selectedFiles: { name: string; fileContent: File }[] = [];

    //     if (files && files.length > 0) {
    //         for (const file of files as any) {
    //             const cleanedName = file.name.replace(/[\s]+/g, '_');
    //             selectedFiles.push({
    //                 name: cleanedName,
    //                 fileContent: file
    //             });
    //         }
    //     }
    //     setDataState((prev: any) => ({
    //         ...prev,
    //         selectedFiles: selectedFiles
    //     }));
    // };

    // const onFileSelection = (e: any): void => {
    //     const { files } = e.target;
    //     const selectedFiles: { name: string; fileContent: File }[] = [];
    //     const invalidFiles: string[] = [];

    //     if (files && files.length > 0) {
    //         for (const file of files) {
    //             if (file.type.startsWith('image/') || file.type === 'application/pdf') {
    //                 const cleanedName = file.name.replace(/[\s]+/g, '_');
    //                 selectedFiles.push({
    //                     name: cleanedName,
    //                     fileContent: file
    //                 });
    //             } else {
    //                 invalidFiles.push(file.name);
    //             }
    //         }
    //     }

    //     if (invalidFiles.length > 0) {
    //         // e.target.value = '';
    //         setDataState((prevState: any) => ({
    //             ...prevState,
    //             isFormValidationModelOpen: true,
    //             validationMessage: [
    //                 "Only image files and PDFs are allowed.",
    //                 ...invalidFiles
    //             ],
    //             subject: "Invalid Files"
    //         }));
    //         setFileInputKey(prev => prev + 1);
    //     } else {
    //         setDataState((prev: any) => ({
    //             ...prev,
    //             selectedFiles: selectedFiles
    //         }));
    //     }
    // };

    const onFileSelection = async (e: any): Promise<void> => {
        const { files } = e.target;
        const newSelectedFiles: any[] = [];
        const invalidFiles: string[] = [];

        if (files && files.length > 0) {
            for (const file of files) {

                // Prevent duplicates
                const isDuplicate = dataState.selectedFiles?.some(
                    (f: any) => f.name.toLowerCase() === file.name.toLowerCase()
                );
                if (isDuplicate) {
                    invalidFiles.push(file.name + " (duplicate)");
                    continue;
                }

                // Validate allowed types
                if (file.type.startsWith("image/") || file.type === "application/pdf") {
                    const cleanedName = file.name.replace(/\s+/g, "_");
                    const arrayBuffer = await file.arrayBuffer();

                    newSelectedFiles.push({
                        name: cleanedName,
                        fileContent: arrayBuffer
                    });
                } else {
                    invalidFiles.push(file.name);
                }
            }
        }

        if (invalidFiles.length > 0) {
            setDataState((prev: any) => ({
                ...prev,
                isFormValidationModelOpen: true,
                validationMessage: [
                    "Only images & PDFs are allowed. Duplicate files not allowed.",
                    ...invalidFiles
                ],
                subject: "Invalid Files"
            }));
            setFileInputKey(prev => prev + 1);
            return;
        }

        // 👉 APPEND instead of REPLACE
        setDataState((prev: any) => ({
            ...prev,
            selectedFiles: [...(prev.selectedFiles || []), ...newSelectedFiles]
        }));

        // Reset input to allow reselecting same filename again
        setFileInputKey(prev => prev + 1);
    };

    const removeSelectedFile = (index: number) => {
        setDataState((prev: any) => {
            const updatedFiles = [...prev.selectedFiles];
            updatedFiles.splice(index, 1);

            return {
                ...prev,
                selectedFiles: updatedFiles
            };
        });

        // 🔥 Reset the file input visually
        setFileInputKey(prev => prev + 1);
    };


    const onClickValidationClose = () => {
        setDataState((prevState: any) => ({ ...prevState, isFormValidationModelOpen: false }))
    }

    const getPeriodicHistoryitems = async () => {
        try {
            setIsLoading(true);
            const select = ["ID,Title,TaskDate,Area,SiteNameId,SiteName/Title,SiteName/StateNameValue,CompletionDate,Cost,Frequency,JobCompletion,Month,Week,Year,EventNumber,Hours,StaffNumber,WorkType,IsCompleted,IsNotification,SubLocation,Modified,Inactive,IsHistoryId/Id,IsArchived,Comment,AttachmentFiles"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteName,IsHistoryId,AttachmentFiles"],
                listName: ListNames.Periodic,
                filter: `IsHistoryId eq '${PeriodicHistoryRecordId.current}'`
            };
            const periodicHistoryData = await provider.getItemsByQuery(queryStringOptions);
            setPeriodicHistoryItems(periodicHistoryData);
        } catch (err) {
            console.log(err)
        } finally {
            setIsLoading(false);
        }
    };

    const returnErrorMessage = (): any => {
        return (
            (dataState.validationMessage && dataState.validationMessage.length > 0) && (
                <ul>
                    {dataState.validationMessage?.map((error: any, ind: any) => <li className="errorPoint" key={ind}>{error}</li>)}
                </ul>
            )
        );
    };

    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        const showFileSection = (dataState.selectedFiles?.length > 0) || (isEditModeAttachmentAddModal && SelectedData.current?.attachmentFiles?.length > 0);

        return <>
            {isShowHistoryModel &&
                <PeriodicHistoryDialog
                    manageComponentView={props.manageComponentView}
                    context={context}
                    provider={provider}
                    isModelOpen={true}
                    PeriodicId={PeriodicHistoryRecordId.current}
                    onClickClose={onClickClose}
                    handleViewAttachment={handleViewAttachment}
                    onClickEditHistory={onClickEditHistory}
                    selectedItemForHistory={selectedHistoryItem}
                    historyItems={periodicHistoryItems}
                />
            }
            {attachmentDialogState.isOpen && (
                <AttachmentPopup
                    isOpen={attachmentDialogState.isOpen}
                    onClose={() =>
                        setAttachmentDialogState(prev => ({
                            ...prev,
                            isOpen: false,
                            selectedItem: null
                        }))
                    }
                    selectedItem={attachmentDialogState.selectedItem}
                />
            )}
            <CustomModal isModalOpenProps={hideDialog} setModalpopUpFalse={() => toggleHideDialog()} subject={"Delete  Confirmation "} message={<div>Are you sure you want to delete this Periodic?</div>} yesButtonText="Yes" closeButtonText={"No"} onClickOfYes={onclickdelete} />
            <CustomModal
                isModalOpenProps={archiveDialog}
                setModalpopUpFalse={() => setArchiveDialog(false)}
                subject={selectedArchiveItem?.IsArchived ? "Unarchive Confirmation" : "Archive Confirmation"}
                message={
                    <div>
                        Are you sure you want to{" "}
                        {selectedArchiveItem?.IsArchived ? "unarchive" : "archive"} this Periodic?
                    </div>
                }
                yesButtonText="Yes"
                closeButtonText="No"
                onClickOfYes={onClickArchiveConfirm}
            />
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
            {isLoading && <Loader />}
            <div className={!!props.siteMasterId ? "" : "boxCard boxCard-mt-0"}>
                {!props.siteMasterId && <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                        <h1 className="mainTitle">Periodic</h1>
                    </div>
                </div>}
                <div className="formGroup more-page-wrapper">
                    <div className="ms-Grid mt-3">
                        <div className="ms-Grid-row ptop-5">
                            {!props.siteMasterId && <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                                <div className="formControl">
                                    <MultiStateFilter
                                        loginUserRoleDetails={currentUserRoleDetail}
                                        selectedState={selectedStatesId || []}
                                        onStateChange={onStateChange}
                                        provider={provider}
                                        isRequired={false}
                                        isClearable={true}
                                    />
                                </div>
                            </div>}
                            {!props.siteMasterId && <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                                <div className="formControl">
                                    <MultipleSiteFilter
                                        isPermissionFiter={true}
                                        loginUserRoleDetails={currentUserRoleDetail}
                                        selectedSiteIds={selectedSiteIds}
                                        selectedSiteTitles={selectedSiteTitles}
                                        selectedSCSite={selectedSCSites}
                                        selectedState={selectedStatesId || []}
                                        onSiteChange={handleSiteChange}
                                        provider={provider}
                                        isRequired={true}
                                        AllOption={true}
                                    />
                                </div>
                            </div>}
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2">
                                <div className="formControl">
                                    <PeriodicFilter
                                        SiteNameId={props?.siteMasterId || undefined}
                                        selectedPeriodic={selectedPeriodic}
                                        onPeriodicChange={onPeriodicChange}
                                        provider={provider}
                                        isRequired={true}
                                        AllOption={true} />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2">
                                <div className="formControl">
                                    <WeekFilter
                                        selectedWeek={selectedWeek}
                                        onWeekChange={onWeekChange}
                                        provider={provider}
                                        isRequired={true}
                                        AllOption={true} />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2">
                                <div className="formControl">
                                    <MonthFilter
                                        selectedMonth={selectedMonth}
                                        onMonthChange={onMonthChange}
                                        provider={provider}
                                        isRequired={true}
                                        AllOption={true} />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2">
                                <div className="formControl">
                                    <YearFilter
                                        selectedYear={selectedYear}
                                        onYearChange={onYearChange}
                                        provider={provider}
                                        isRequired={true}
                                        AllOption={true} />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2">
                                <div className="formControl">
                                    <ReactDropdown
                                        options={[
                                            { value: "All", text: "All", key: "All", label: "All" },
                                            { value: "Archived", text: "Archived", key: "Archived", label: "Archived" },
                                            { value: "UnArchived", text: "UnArchived", key: "UnArchived", label: "UnArchived" }
                                        ]}
                                        defaultOption={archiveFilter}
                                        isSorted={false}
                                        onChange={handleArchiveFilterChange}
                                        isMultiSelect={false}
                                    />
                                </div>
                            </div>
                            {/* <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 view-switch-div">
                                <CommonGridView onViewChange={handleViewChange} />
                            </div> */}

                        </div>

                    </div>


                    <div className={!!props.siteMasterId ? "formGroup mt-2 siteformgroupcard" : "formGroup mt-2"} id="listingDiv">
                        {currentView === ViewType.grid ? <>
                            <MemoizedDetailList
                                manageComponentView={props.manageComponentView}
                                columns={columnsPeriodic}
                                items={ListPeriodic || []}
                                reRenderComponent={true}
                                CustomselectionMode={(!!props.siteMasterId && isVisibleCrud.current) ? SelectionMode.multiple : SelectionMode.none}
                                searchable={true}
                                isAddNew={true}
                                onItemInvoked={_onItemInvoked}
                                onSelectedItem={_onItemSelected}
                                addEDButton={isDisplayEDbtn && isVisibleCrud.current && <>
                                    <div className='dflex'>
                                        {<Link className="actionBtn iconSize btnEdit " onClick={onclickEdit}>
                                            <TooltipHost content={"Edit Detail"} id={tooltipId}>
                                                <FontAwesomeIcon icon="edit" />
                                            </TooltipHost>
                                        </Link>}
                                        <Link className="actionBtn iconSize btnDanger  ml-10" onClick={onclickconfirmdelete}>
                                            <TooltipHost content={"Delete"} id={tooltipId}>
                                                <FontAwesomeIcon icon="trash-alt" />
                                            </TooltipHost>
                                        </Link>

                                    </div>
                                </>}
                                addNewContent={
                                    <>
                                        <div className="dflex">
                                            {(!!ListPeriodic && ListPeriodic.length > 0) &&
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
                                            {/* {downloadDisable && isVisibleCrud.current && props.siteMasterId ?

                                                <Link className="actionBtn iconSize btnInfo ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                                    text="">
                                                    <TooltipHost
                                                        content={"Sample Excel File Not Available"}
                                                        id={tooltipId}
                                                    >
                                                        {isVisibleCrud.current && <FontAwesomeIcon
                                                            icon={"download"}
                                                        />}
                                                    </TooltipHost></Link> :

                                                <> */}
                                            {isVisibleCrud.current && props.siteMasterId &&
                                                <Link className="actionBtn iconSize disable btnMove ml-10" style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                                    text="">
                                                    <TooltipHost
                                                        content={"Download Sample Excel File"}
                                                        id={tooltipId}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={"download"}
                                                        />
                                                    </TooltipHost>   </Link>}
                                            {/* </>
                                            } */}
                                            {isVisibleCrud.current && props.siteMasterId &&
                                                <Link className="actionBtn iconSize btnDanger ml-10 dticon" style={{ paddingBottom: "2px" }} onClick={onclickUpload}
                                                    text="">
                                                    <TooltipHost
                                                        content={"Upload Excel File"}
                                                        id={tooltipId}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={"upload"}
                                                        />
                                                    </TooltipHost>    </Link>}
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
                                            {!!props.siteMasterId && <>
                                                {(isVisibleCrud.current && isVisibleCrud.current && <PrimaryButton className="btn btn-primary" onClick={onclickAdd} text="Add" />)}
                                            </>}

                                        </div>
                                    </>
                                }
                            />
                        </> :
                            <>
                                <div className="dflex btn-back-ml">
                                    {!!props.siteMasterId && <>
                                        {(isVisibleCrud.current && isVisibleCrud.current && <PrimaryButton className="btn btn-primary mr-10" onClick={onclickAdd} text="Add" />)}
                                    </>}
                                    {(!!ListPeriodic && ListPeriodic.length > 0) &&
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
                                    {/* {downloadDisable && isVisibleCrud.current && props.siteMasterId ?

                                        <Link className="actionBtn iconSize btnInfo ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                            text="">
                                            <TooltipHost
                                                content={"Sample Excel File Not Available"}
                                                id={tooltipId}
                                            >
                                                {isVisibleCrud.current && <FontAwesomeIcon
                                                    icon={"download"}
                                                />}
                                            </TooltipHost></Link> :

                                        <> */}
                                    {isVisibleCrud.current && props.siteMasterId &&
                                        <Link className="actionBtn iconSize disable btnMove ml-10" style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                            text="">
                                            <TooltipHost
                                                content={"Download Sample Excel File"}
                                                id={tooltipId}
                                            >
                                                <FontAwesomeIcon
                                                    icon={"download"}
                                                />
                                            </TooltipHost>   </Link>}
                                    {/* </>
                                    } */}
                                    {isVisibleCrud.current && props.siteMasterId &&
                                        <Link className="actionBtn iconSize btnDanger ml-10 dticon" style={{ paddingBottom: "2px" }} onClick={onclickUpload}
                                            text="">
                                            <TooltipHost
                                                content={"Upload Excel File"}
                                                id={tooltipId}
                                            >
                                                <FontAwesomeIcon
                                                    icon={"upload"}
                                                />
                                            </TooltipHost>    </Link>}
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
                                <PeriodicDetailsCardView
                                    items={ListPeriodic as any || []}
                                    siteMasterId={props.siteMasterId}
                                    manageComponentView={props.manageComponentView}
                                    _onclickHistory={_onclickHistory}
                                    _onclickEdit={onclickEdit}
                                    _onclickconfirmdelete={onclickconfirmdelete}
                                    isEditDelete={props?.siteMasterId ? true : false}
                                />
                            </>
                        }
                    </div>

                </div>
            </div>
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
                    <Popup
                        className={popupStyles.root}
                        role="dialog"
                        aria-modal="true"
                        onDismiss={closePopup}
                    >
                        <Overlay onClick={closePopup} />

                        <FocusTrapZone>
                            <div role="document" className={popupStyles.content}
                                style={{ padding: "20px", maxWidth: "700px", width: "650px" }}
                            >

                                {/* Header */}
                                <div style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    marginBottom: 15
                                }}>
                                    <h2 style={{ margin: 0 }}>
                                        {isEditModeAttachmentAddModal ? "Edit History Record" : "Create Task"}
                                    </h2>

                                    <IconButton
                                        iconProps={{ iconName: 'Cancel' }}
                                        ariaLabel="Close"
                                        onClick={closePopup}
                                    />
                                </div>

                                {/* Record Identification Section */}
                                <div
                                    style={{
                                        marginBottom: 20,
                                        borderRadius: 6,
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        rowGap: "10px",
                                        columnGap: "25px"
                                    }}
                                >
                                    <div>
                                        <strong>Periodic Title</strong><br />
                                        {SelectedData.current?.Title}
                                    </div>

                                    <div>
                                        <strong>Sub Location</strong><br />
                                        {SelectedData.current?.SubLocation}
                                    </div>

                                    <div>
                                        <strong>Area</strong><br />
                                        {SelectedData.current?.Area}
                                    </div>

                                    <div>
                                        <strong>Work Type</strong><br />
                                        {SelectedData.current?.WorkType}
                                    </div>
                                </div>

                                {/* Comment Field */}
                                <div>
                                    <Label className="formLabel">
                                        Comment <span className="required">*</span>
                                    </Label>

                                    <TextField
                                        className="formControl"
                                        multiline
                                        rows={3}
                                        name="Comment"
                                        value={dataState.comment}
                                        onChange={(event: any) => {
                                            setDataState((prev: any) => ({
                                                ...prev,
                                                comment: event.target.value
                                            }));
                                        }}
                                    />
                                </div>

                                {/* Attachments */}
                                <div style={{ marginTop: 15 }}>
                                    <Label className="formLabel">
                                        Attachments <span className="required">*</span>
                                    </Label>

                                    <input
                                        ref={fileInputRef}
                                        key={fileInputKey}
                                        type="file"
                                        accept="image/*,application/pdf"
                                        multiple
                                        onChange={onFileSelection}
                                        style={{ display: "none" }}
                                    />

                                    <PrimaryButton
                                        onClick={() => fileInputRef.current?.click()}
                                        className="btn btn-primary"
                                        style={{ marginBottom: 15 }}
                                    >
                                        CHOOSE FILES
                                    </PrimaryButton>

                                    {/* Show Table Only When Files Exist */}
                                    {showFileSection && (
                                        <div
                                            style={{
                                                border: "1px solid #ddd",
                                                borderRadius: 6,
                                                overflow: "hidden"
                                            }}
                                        > {/* SCROLLABLE AREA */}
                                            <div
                                                style={{
                                                    maxHeight: dataState.selectedFiles?.length > 4 ? "200px" : "auto",
                                                    overflowY: dataState.selectedFiles?.length > 4 ? "auto" : "visible"
                                                }}
                                            >
                                                {/* Table Header */}
                                                <div
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns: "80% 20%",
                                                        background: "#f3f2f1",
                                                        padding: "8px 12px",
                                                        fontWeight: 600,
                                                        position: "sticky",
                                                        top: 0,
                                                        zIndex: 10
                                                    }}
                                                >
                                                    <span>File Name</span>
                                                    <span>Action</span>
                                                </div>

                                                {/* New Selected Files */}
                                                {dataState.selectedFiles?.map((file: any, index: number) => (
                                                    <div
                                                        key={`new-${index}`}
                                                        style={{
                                                            display: "grid",
                                                            gridTemplateColumns: "80% 20%",
                                                            padding: "8px 12px",
                                                            borderBottom: "1px solid #eee",
                                                            alignItems: "center"
                                                        }}
                                                    >
                                                        <span>{file.name}</span>

                                                        <IconButton
                                                            iconProps={{ iconName: "Delete" }}
                                                            onClick={() => removeSelectedFile(index)}
                                                            styles={{ icon: { color: "red" } }}
                                                        />
                                                    </div>
                                                ))}

                                                {/* Existing Files (Edit Mode) */}
                                                {isEditModeAttachmentAddModal &&
                                                    SelectedData.current?.attachmentFiles?.map((fileUrl: any, index: number) => {
                                                        const fileName = fileUrl.split("/").pop();

                                                        return (
                                                            <div
                                                                key={`existing-${index}`}
                                                                style={{
                                                                    display: "grid",
                                                                    gridTemplateColumns: "80% 20%",
                                                                    padding: "8px 12px",
                                                                    borderBottom: "1px solid #eee",
                                                                    alignItems: "center"
                                                                }}
                                                            >
                                                                <a href={fileUrl} target="_blank">{fileName}</a>

                                                                <IconButton
                                                                    iconProps={{ iconName: "Delete" }}
                                                                    onClick={() => {
                                                                        setFileToDelete(fileName);
                                                                        setIsDeleteConfirmOpen(true);
                                                                    }}
                                                                    styles={{ icon: { color: "red" } }}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Toggle Yes/No */}
                                {!isEditModeAttachmentAddModal && (<div style={{
                                    marginTop: 20,
                                    // display: "flex",
                                    // alignItems: "center",
                                    // justifyContent: "space-between"
                                }}>
                                    <Label style={{ fontWeight: 600 }}>Do you want to create a new task {SelectedData.current.Frequency}?</Label>

                                    <Toggle
                                        inlineLabel
                                        defaultChecked={false}
                                        className="mb-0"
                                        onChange={(e, checked) => {
                                            setTaskToggleValue(checked ? "Yes" : "No");
                                        }}
                                    />
                                </div>)}

                                {/* Footer Buttons */}
                                <DialogFooter>
                                    <PrimaryButton
                                        text={isEditModeAttachmentAddModal ? "Update" : "Save"}
                                        onClick={() => validation(taskToggleValue)}
                                        className="btn btn-primary"
                                    />
                                    <DefaultButton
                                        text="Close"
                                        onClick={closePopup}
                                        className="btn btn-danger"
                                    />
                                </DialogFooter>
                            </div>
                        </FocusTrapZone>
                    </Popup>
                </Layer>
            )}
            {dataState.isFormValidationModelOpen &&
                <CustomModal
                    isModalOpenProps={dataState.isFormValidationModelOpen}
                    setModalpopUpFalse={onClickValidationClose}
                    subject={dataState.subject}
                    message={returnErrorMessage() as any}
                    closeButtonText={"Close"} />}
            {isDeleteConfirmOpen && (
                <CustomModal
                    isModalOpenProps={isDeleteConfirmOpen}
                    setModalpopUpFalse={() => {
                        setIsDeleteConfirmOpen(false);
                        setFileToDelete(null);
                    }}
                    subject="Delete Attachment"
                    message={`Are you sure you want to delete "${fileToDelete}"?`}
                    removeButtonText="Delete"
                    onClickOfRemove={deleteExistingAttachment}
                    closeButtonText="Cancel"
                />
            )}
        </>;
    }
};