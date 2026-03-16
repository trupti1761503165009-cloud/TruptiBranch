/* eslint-disable*/
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { IQuayCleanState } from "../../QuayClean";
import { DialogType, Label, Layer, Link, mergeStyleSets, PrimaryButton, SelectionMode, TextField, TooltipHost } from "@fluentui/react";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { Loader } from "../../CommonComponents/Loader";
import { _copyAndSort, calculateDuration, ConvertDateToStringFormat, delay, generateAndSaveKendoPDFHelpDesk, generateExcelTable, generateExcelTableHelpDesk, getChoicesListOptions, getErrorMessage, getUniueRecordsByColumnName, logGenerator, onBreadcrumbItemClicked, scrollFunction, showPremissionDeniedPage, UserActivityLog, validateDateTimeRows } from "../../../../../Common/Util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { IHelpDeskItemView } from "../../../../../Interfaces/IAddNewHelpDesk";
import CustomModal from "../../CommonComponents/CustomModal";
import { toastService } from "../../../../../Common/ToastService";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { DateFormat, DateTimeFormate } from "../../../../../Common/Constants/CommonConstants";
import { HDCommonFilter } from "../../../../../Common/Filter/HDCommonFilter";
import DragAndDrop from "../../CommonComponents/FileUpload/DragandDrop";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import { ValidateForm } from "../../../../../Common/Validation";
import * as XLSX from 'xlsx';
import moment from "moment";
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { appGlobalStateAtom, appSiteStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { HelpDeskDetailsCardView } from "./HelpDeskDetailsCardView";
import { MultipleSiteFilter } from "../../../../../Common/Filter/MultipleSiteFilter";
import { IExportColumns } from "../EquipmentChecklist/Question";
import { PreDateRangeFilter } from "../../../../../Common/Filter/PreDateRangeFilter";
import { DefaultButton, DialogFooter, Dropdown, FocusTrapZone, IDropdownOption, MessageBar, MessageBarType, Overlay, Popup } from "office-ui-fabric-react";
import { HelpDeskCard, IActiveCard, ICount } from "../../CommonComponents/Chart/HelpDeskCard";
import { HelpDeskCategoryChart } from "../../CommonComponents/Chart/HelpDeskCategoryChart";
import { IReactDropOptionProps } from "../../CommonComponents/reactSelect/IReactDropOptionProps";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import CommonPopup from "../../CommonComponents/CommonSendEmailPopup";
import { DateConvention, DateTimePicker, TimeConvention, TimeDisplayControlType } from "@pnp/spfx-controls-react";
import { Messages } from "../../../../../Common/Constants/Messages";
import { StateFilter } from "../../../../../Common/Filter/StateFilter";
import { MultiStateFilter } from "../../../../../Common/Filter/MultiStateFilter";
import { formatSPDateToLocal } from "../../CommonComponents/CommonMethods";
export interface IHelpDeskListProps {
    manageComponentView(componentProp: IQuayCleanState): any;
    breadCrumItems: IBreadCrum[];
    siteName?: string;
    siteMasterId?: number;
    originalSiteMasterId: any;
    IsSupervisor?: boolean;
    componentProps: IQuayCleanState;
    dataObj?: any;
    view?: any;
    qCStateId?: any;
}

const dropdownOptions: IDropdownOption[] = [
    { key: 'selectAll', text: 'Select All' },
    { key: 'Help Desk Description', text: 'Help Desk Description' },
    { key: 'Caller', text: 'Caller' },
    { key: 'Starting Date', text: 'Starting Date' },
    { key: 'Location', text: 'Location' },
    { key: 'Sub Location', text: 'Sub Location' },
    { key: 'Area', text: 'Area' },
    { key: 'Category', text: 'Category' },
    { key: 'Status', text: 'Status' },
    { key: 'Help Desk Name', text: 'Help Desk Name' },
    { key: 'Priority', text: 'Priority' },
    { key: 'Event Name', text: 'Event Name' },
    { key: 'Reported Help Desk', text: 'Reported Help Desk' },
    { key: 'Call Type', text: 'Call Type' },
    { key: 'Completion Date', text: 'Completion Date' },
];

export interface IHelpDeskListState {
    isGraphView: boolean;
    cardFilter: IActiveCard[];
    activeCardName: IActiveCard[];
    yearOptions: IReactDropOptionProps[];
    monthOptions: IReactDropOptionProps[];
    selectedYear: any;
    selectedMonth: any;
    isSendEmail: boolean;
    isAllSendEmail: boolean;
    htmlId: string;
    isPrint: boolean;
    callTypeOptions?: any[];
    eventNameOptions?: any[];
    selectedCallType?: any;
    selectedEventName?: any;

}

export const HelpDeskList = (props: IHelpDeskListProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const appSiteState = useAtomValue(appSiteStateAtom);
    const { PermissionArray } = appSiteState;
    const isVisibleCrud = React.useRef<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [helpDeskListItems, setHelpDeskListItems] = React.useState<IHelpDeskItemView[]>([]);
    const [helpDeskCardItems, setHelpDeskCardItems] = React.useState<IHelpDeskItemView[]>([]);
    const [filteredItems, setFilteredItems] = React.useState<IHelpDeskItemView[]>([]);
    const [reloadGrid, setReloadGrid] = React.useState(false);
    const isCrudVisible = React.useRef<boolean>(false);
    // const [HelpDeskNameOption, setHelpDeskNameOption] = React.useState<any[]>([]);
    // const [catagoryOption, setCatagoryOption] = React.useState<any[]>([]);
    // const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
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
    const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);
    const [currentView, setCurrentView] = React.useState<string>('grid');
    const [FieldData, setFieldData] = React.useState<any>();
    const [showSaveMessageBar, setSaveShowMessageBar] = React.useState<boolean>(false);
    const [showUpdateMessageBar, setUpdateShowMessageBar] = React.useState<boolean>(false);
    const [DisplayAllField, setDisplayAllField] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [title, setTitle] = React.useState<string>("");
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
    const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
    const [displayerror, setDisplayError] = React.useState<boolean>(false);
    const [isCompletionDateVisible, { setTrue: showPopupCompletionDate, setFalse: hidePopupCompletionDate }] = useBoolean(false);
    const [completionDateTime, setCompletionDateTime] = React.useState<Date>();
    const [updateHelpDeskId, setUpdateHelpDeskId] = React.useState<any>();
    const [dateError, setDateError] = React.useState<string>('');
    // const [selectedEventName, setSelectedEventName] = React.useState<any>();
    // const [selectedCallType, setSelectedCallType] = React.useState<any>();
    // const [eventNameOptions, setEventNameOptions] = React.useState<any[]>([]);
    // const [callTypeOptions, setCallTypeOptions] = React.useState<any[]>([]);
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
            title: 'In Correct Format',
            closeButtonAriaLabel: 'Close',
            subText: "",
        },
        uploadFileErrorMessage: "",
        isUploadColumnValidationModelOpen: false,
        HelpDescription: "",
        StartingDateTime: undefined
    });

    const [helpDeskState, setHelpDeskState] = React.useState<IHelpDeskListState>({
        isGraphView: false,
        cardFilter: [],
        activeCardName: [],
        selectedMonth: null,
        selectedYear: "",
        yearOptions: [],
        monthOptions: [],
        callTypeOptions: [],
        eventNameOptions: [],
        selectedCallType: undefined,
        selectedEventName: undefined,
        isAllSendEmail: false,
        isSendEmail: false,
        htmlId: "",
        isPrint: false
    })

    const [width, setWidth] = React.useState<string>("500px");
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("500px");
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
            maxWidth: '400px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
        }
    });

    const handleViewChange = (view: string) => {
        // This will handle the view change
        setCurrentView(view);
    };
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setCurrentView('card');
        } else {
            setCurrentView('grid');
        }
    }, []);


    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [columnsHelpDesk, setcolumnsHelpDesk] = React.useState<any>([]);

    const onStatusChange = React.useCallback((selectedOption: any) => {
        setSelectedStatus(selectedOption);
        setHelpDeskState((prevState: any) => ({ ...prevState, cardFilter: "" }))
    }, []);
    const onEventNameChange = React.useCallback((selectedOption: any) => {
        // setSelectedEventName(selectedOption?.value);
        setHelpDeskState((prevState: any) => ({ ...prevState, selectedEventName: selectedOption?.value }));
        setHelpDeskState((prevState: any) => ({ ...prevState, cardFilter: "" }))
    }, []);
    const onCallTypeChange = React.useCallback((selectedOption: any) => {
        // setSelectedCallType(selectedOption?.value);
        setHelpDeskState((prevState: any) => ({ ...prevState, selectedCallType: selectedOption?.value }));
        setHelpDeskState((prevState: any) => ({ ...prevState, cardFilter: "" }))
    }, []);
    const onCategoryChange = React.useCallback((selectedOption: any) => {
        setSelectedCategory(selectedOption);
        setHelpDeskState((prevState: any) => ({ ...prevState, cardFilter: "" }))
    }, []);
    const onChangeHelpDeskName = React.useCallback((selectedOption: any) => {
        setSelectedHelpDeskName(selectedOption);
        setHelpDeskState((prevState: any) => ({ ...prevState, cardFilter: "" }))
    }, []);

    const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>([]);
    const [selectedStates, setSelectedStates] = React.useState<any[]>([])
    const [selectedStatesId, setSelectedStatesId] = React.useState<any[]>([]);
    const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>([]);
    const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>([]);
    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSiteIds(siteIds);
        setSelectedSiteTitles(siteTitles);
        setHelpDeskState((prevState: any) => ({ ...prevState, cardFilter: "" }))
        setSelectedSCSites(siteSC);
    };

    const onStateChange = (stateIds: number[], options?: any) => {
        setSelectedStates((!!options && options.length > 0) ? options.map((r: any) => r.text) : [])
        setSelectedStatesId((!!stateIds && stateIds.length > 0) ? stateIds : [])
        setSelectedSiteIds([]);
        setSelectedSiteTitles([]);
        setSelectedSCSites([]);
    }

    const [fromDate, setFromDate] = React.useState<Date | any>();
    const [toDate, setToDate] = React.useState<Date | any>();
    const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: '', text: 'select' });
    const [filterFromDate, setFilterFromDate] = React.useState<any>(undefined);
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);

    const onChangeRangeOption = (item: IDropdownOption): void => {
        setSelectedItem(item);
        setIsRefreshGrid(prevState => !prevState);
        setHelpDeskState((prevState: any) => ({ ...prevState, cardFilter: "" }))
    };

    const onChangeToDate = (filterDate: any, date?: Date) => {
        setFilterToDate(filterDate);
        setToDate(date);
        setHelpDeskState((prevState: any) => ({ ...prevState, cardFilter: "" }))
    };
    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setFromDate(date);
        setFilterFromDate(filterDate);
    };

    const onCloseSendEmail = () => {
        setTitle("");
        setSendToEmail("");
        setHelpDeskState((prevState) => ({ ...prevState, isSendEmail: false, isAllSendEmail: false, htmlId: "", isPrint: false }))
    }
    const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setTitle(newValue || "");
        if (newValue) {
            setDisplayErrorTitle(false);
        }
    };

    const onChangeSendToEmail = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setSendToEmail(newValue || "");
        if (newValue) {
            setDisplayErrorEmail(false);
            setDisplayErrorEmail(false);
        }
        const enteredValue = newValue;
        const emailPattern = /^([^\s@]+@[^\s@]+\.[^\s@]+)(\s*;\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/;
        if (!enteredValue || emailPattern.test(enteredValue)) {
            setDisplayError(false);
        } else {
            setDisplayError(true);
        }
    };

    const onClickSendEmail = async (): Promise<void> => {
        setIsLoading(true)
        const isTitleEmpty = !title;
        const isEmailEmpty = !sendToEmail;
        const isEmailInvalid = !isEmailEmpty && !sendToEmail?.split(';').every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));

        setDisplayErrorTitle(isTitleEmpty);
        setDisplayErrorEmail(isEmailEmpty);
        setDisplayError(isEmailInvalid);

        if (!isTitleEmpty && !isEmailEmpty && !isEmailInvalid) {
            let year = new Date().getFullYear()
            const fileName = !!props?.dataObj?.Title ? `${props?.dataObj?.Title} - Help Desk Report ${year}.pdf` : `Help Desk Report ${year}.pdf`
            let fileblob: any = await generateAndSaveKendoPDFHelpDesk(helpDeskState.htmlId, fileName, false,);
            const file: IFileWithBlob = {
                file: fileblob,
                name: `${fileName}`,
                overwrite: true
            };
            let toastMessage: string = "";
            const toastId = toastService.loading('Loading...');
            toastMessage = 'Email sent successfully!';
            let insertData: any = {
                Title: title,
                SendToEmail: sendToEmail,
                // StateName: SiteData[0]?.QCState,
                // SiteName: SiteData[0]?.Title,
                StateName: !!props?.dataObj?.Title ? props?.dataObj?.Title : "",
                SiteName: !!props?.dataObj?.Title ? props?.dataObj?.Title : "",
                EmailType: "HelpDeskReport"
            };
            provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
                    console.log("Upload Success");
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: props.componentProps.siteMasterId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.SendEmail,
                        EntityType: UserActionEntityTypeEnum.HelpDesk,
                        // EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        EntityName: title, // Match index dynamically
                        Details: `Send Email Help Desk to ${sendToEmail}`,
                        StateId: props?.qCStateId
                    };
                    void UserActivityLog(provider, logObj, currentUserRoleDetail);
                }).catch((err: any) => console.log(err));
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                setTitle("")
                setSendToEmail("")
                onCloseSendEmail();
                setHelpDeskState((prevState: any) => ({ ...prevState, isPrint: false }))
                setIsLoading(false)
            }).catch((err: any) => console.log(err));
        } else {
            setIsLoading(false)

        }
    };

    const onClickDownload = async (id: any): Promise<void> => {
        // const fileName = `WHS-Committee Meeting Minutes ${state.whsCommitteeMeetingMasterItem.MeetingDate}`;
        // const fileName = `WHS Committee MOM 21-06-2002`;
        const fileName = `test`;
        setIsLoading(true)
        setHelpDeskState((prevState: any) => ({ ...prevState, isPrint: true }))
        setTimeout(async () => {
            await generateAndSaveKendoPDFHelpDesk("cardHelpDesk", fileName, false, true);
            setIsLoading(false)
            setHelpDeskState((prevState: any) => ({ ...prevState, isPrint: false }))
        }, 1500);


    };

    const onClickSendEmailChart = (isAll: boolean, id: string) => {

        setHelpDeskState((prevState: any) => ({ ...prevState, isSendEmail: true, isAllSendEmail: isAll, htmlId: id, isPrint: true }))
    }

    const handleDropdownChange = (
        event: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption
    ) => {
        if (!option) return;

        setSelectedOptions((prev: string[]) => {
            // Get all options except "Select All"
            const allKeys = dropdownOptions
                .filter((opt) => opt.key !== 'selectAll')
                .map((opt) => opt.key as string);

            if (option.key === 'selectAll') {
                // Toggle Select All
                const isSelectedAll = prev.length === allKeys.length;
                return isSelectedAll ? [] : allKeys; // Select all or clear all
            } else {
                // Normal selection/deselection
                const newSelection = option.selected
                    ? [...prev, option.key as string] // Add selection
                    : prev.filter((key) => key !== option.key); // Remove selection

                const isAllSelected = newSelection.length === allKeys.length;
                return isAllSelected ? allKeys : newSelection;
            }
        });
    };


    const onClickFieldData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,Field,SiteNameId"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.HelpDeskField,
                filter: `SiteNameId eq '${props.componentProps.siteMasterId}'`
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
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
                    setSelectedOptions(listData[0]?.Field);
                    if (listData.length > 0) {
                        setDisplayAllField(false);
                    } else {
                        setDisplayAllField(true);
                        const allOptionTexts = [
                            "Help Desk Description",
                            "Caller",
                            "Starting Date",
                            "Location",
                            "Sub Location",
                            "Area",
                            "Category",
                            "Status",
                            "Help Desk Name",
                            "Priority",
                            "Event Name",
                            "Reported Help Desk",
                            "Call Type",
                            "Completion Date",
                        ];
                        setSelectedOptions(allOptionTexts);
                    }
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

    const _getHelpDeskListItems = async () => {
        let custfilter = !!props.siteMasterId ? `SiteNameId eq ${props.siteMasterId} and IsDeleted ne 1` : `IsDeleted ne 1`;
        if (filterFromDate == null || filterToDate == null) {
            if (selectedItem.text === "Custom Range") {
                // toggleHideDialog();
            } else if (selectedItem.text === "select") {
                // No action needed as per original logic
            }
        } else if (!!filterFromDate && !!filterToDate) {
            custfilter += ` and (StartingDateTime ge datetime'${filterFromDate}T00:00:00Z' and StartingDateTime le datetime'${filterToDate}T23:59:59Z')`;
        }
        const select = ["Id,Area,Title,StartingDateTime,Caller,Location,SubLocation,QCArea/Id,QCArea/Title,HDCategory,ReportHelpDesk,HDStatus,EventName,HelpDeskName,QCPriority,SiteName/Id,SiteName/Title,SiteName/StateNameValue,Modified,CallType,CompletionDateTime"];
        const expand = ["SiteName,QCArea"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            expand: expand,
            filter: custfilter,
            listName: ListNames.HelpDesk,
        };
        //  For permission manage start
        let siteNameIdArray: any[] = [];
        let adUserArray: any[] = [];
        if (currentUserRoleDetail.isSiteManager) {
            // get the site manager related Asset master 
            siteNameIdArray = currentUserRoleDetail?.siteManagerItem.map(r => r.ID);
        }
        let userRole: string = "Admin";
        if (!!PermissionArray && PermissionArray?.includes('Help Desk')) {
            isCrudVisible.current = true;
        } else {
            if (currentUserRoleDetail.isAdmin) {
                userRole = 'Admin';
                isCrudVisible.current = true;
            } else {
                if (currentUserRoleDetail.isStateManager) {
                    userRole = 'Admin';
                    isCrudVisible.current = true;
                } else {
                    if (currentUserRoleDetail?.siteManagerItem.filter(r => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0) {

                        // get the site manager related clinet  master 
                        siteNameIdArray = currentUserRoleDetail?.siteManagerItem.map(r => r.ID);
                        isCrudVisible.current = true;

                        userRole = 'Admin';
                    } else if (currentUserRoleDetail.isUser) {
                        // get the User  related clinet master
                        adUserArray = currentUserRoleDetail.userItems.map(r => r.ID);
                        isCrudVisible.current = false;
                        userRole = 'Admin';
                    }
                }
            }
        }

        //  For permission manage end
        return await provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
            if (!!results) {
                return results.map((data) => {
                    const duration = data?.StartingDateTime && data?.CompletionDateTime ? calculateDuration(data) : "";
                    switch (userRole) {
                        case 'Admin':
                            return (
                                {
                                    Id: data.Id,
                                    Title: !!data.Title ? data.Title : "",
                                    SiteName: !!data.SiteName ? data.SiteName.Title : "",
                                    SiteNameId: !!data.SiteName ? data.SiteName.Id : 0,
                                    StateName: !!data.SiteName ? data.SiteName.StateNameValue : "",
                                    QCArea: !!data.QCArea ? data.QCArea.Title : "",
                                    QCAreaId: !!data.QCArea ? data.QCArea.Id : 0,
                                    Caller: !!data.Caller ? data.Caller : "",
                                    Area: !!data.Area ? data.Area : "",
                                    Location: !!data.Location ? data.Location : "",
                                    SubLocation: !!data.SubLocation ? data.SubLocation : "",
                                    //QCArea: !!data.QCArea ? data.QCArea : "",
                                    StartDateYear: !!data.StartingDateTime ? new Date(data.StartingDateTime).getFullYear() : "",
                                    StartDateMonth: !!data.StartingDateTime ? new Date(data.StartingDateTime).getMonth() : "",
                                    // StartingDateTime: !!data.StartingDateTime ? ConvertDateToStringFormat(data.StartingDateTime, DateTimeFormate) : "",
                                    StartingDateTime: !!data.StartingDateTime ? formatSPDateToLocal(data.StartingDateTime) : "",
                                    StartingDateCard: !!data.StartingDateTime ? ConvertDateToStringFormat(data.StartingDateTime, DateFormat) : "",
                                    HDCategory: !!data.HDCategory ? data.HDCategory : "",
                                    HDStatus: !!data.HDStatus ? data.HDStatus : "",
                                    ReportHelpDesk: !!data.ReportHelpDesk ? "Yes" : "No",
                                    EventName: !!data.EventName ? data.EventName : "",
                                    HelpDeskName: !!data.HelpDeskName ? data.HelpDeskName : "",
                                    QCPriority: !!data.QCPriority ? data.QCPriority : "",
                                    Modified: !!data.Modified ? data.Modified : null,
                                    CallType: !!data.CallType ? data.CallType : "",
                                    // CompletionDateTime: !!data.CompletionDateTime ? ConvertDateToStringFormat(data.CompletionDateTime, DateTimeFormate) : "",
                                    CompletionDateTime: !!data.CompletionDateTime ? formatSPDateToLocal(data.CompletionDateTime) : "",
                                    Duration: duration,
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
                                        StateName: !!data.SiteName ? data.SiteName.StateNameValue : "",
                                        StartDateYear: !!data.StartingDateTime ? new Date(data.StartingDateTime).getFullYear() : "",
                                        Area: !!data.Area ? !!data.Area : "",
                                        QCArea: !!data.QCArea ? data.QCArea.Title : "",
                                        QCAreaId: !!data.QCArea ? data.QCArea.Id : 0,
                                        Caller: !!data.Caller ? data.Caller : "",
                                        Location: !!data.Location ? data.Location : "",
                                        StartDateMonth: !!data.StartingDateTime ? new Date(data.StartingDateTime).getMonth() : "",
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
                                        CallType: !!data.CallType ? data.CallType : "",
                                        CompletionDateTime: !!data.CompletionDateTime ? ConvertDateToStringFormat(data.CompletionDateTime, DateTimeFormate) : "",
                                        Duration: duration,
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
                                        StateName: !!data.SiteName ? data.SiteName.StateNameValue : "",
                                        QCArea: !!data.QCArea ? data.QCArea.Title : "",
                                        StartDateMonth: !!data.StartingDateTime ? new Date(data.StartingDateTime).getMonth() : "",
                                        QCAreaId: !!data.QCArea ? data.QCArea.Id : 0,
                                        StartDateYear: !!data.StartingDateTime ? new Date(data.StartingDateTime).getFullYear() : "",
                                        Caller: !!data.Caller ? data.Caller : "",
                                        Area: !!data.Area ? !!data.Area : "",
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
                                        CallType: !!data.CallType ? data.CallType : "",
                                        CompletionDateTime: !!data.CompletionDateTime ? ConvertDateToStringFormat(data.CompletionDateTime, DateTimeFormate) : "",
                                        Duration: duration,
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

    React.useEffect(() => {
        if (props.componentProps.siteMasterId) {
            onClickFieldData();
        }
        let isVisibleCrud1 = (!!PermissionArray && PermissionArray?.includes('Help Desk') || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;
    }, []);

    React.useEffect(() => {
        _siteData();
        const className = document.querySelector('ARTICLE')?.children[0].children[0].classList[0];
        let el: any = document.querySelector(!!className ? `.${className}` : "");
        if (!!el) {
            el.onscroll = function () {
                scrollFunction(175);
            };
        }
        getHDChoicesList();
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
                //let column = genrateColumn();
                // const [helpdeskOPt, Category] = await Promise.all([getChoicesListOptions(provider, ListNames.HelpDesk, "HelpDeskName", true), getChoicesListOptions(provider, ListNames.HelpDesk, "HD Category", true), getChoicesListOptions(provider, ListNames.HelpDesk, "QCPriority")]);
                // setHelpDeskNameOption(helpdeskOPt);
                // setCatagoryOption(Category);

                let items: any[] = await _getHelpDeskListItems();

                items = items.sort((a: any, b: any) => {
                    return moment(b.Modified).diff(moment(a.Modified));
                });
                setHelpDeskListItems(items.filter(r => !!r && !!r.Id));

                let yearOptions: IReactDropOptionProps[] = [];
                if (items.length > 0) {
                    let yearItems = getUniueRecordsByColumnName(items, "StartDateYear")
                    yearOptions = yearItems.filter((yr) => yr.StartDateYear).map((r) => ({ value: r.StartDateYear, label: r.StartDateYear }));
                    yearOptions.push({ value: "blank", label: "(Blank)" });
                    yearOptions = _copyAndSort(yearOptions, "value", true);
                }

                let callTypeOptions = await getChoicesListOptions(provider, ListNames.HelpDesk, "CallType", false);
                callTypeOptions.unshift({ value: "All", label: "--All--" });
                // setCallTypeOptions(callTypeOptions);
                setHelpDeskState((prevState: any) => ({ ...prevState, callTypeOptions: callTypeOptions }));

                let eventNameOptions: IReactDropOptionProps[] = [];
                if (items.length > 0) {
                    let eventItems = getUniueRecordsByColumnName(items, "EventName");
                    eventNameOptions = eventItems.map((r) => ({ value: r.EventName, label: r.EventName }));
                    eventNameOptions = _copyAndSort(eventNameOptions, "value", true);
                    eventNameOptions.unshift({ value: "All", label: "--All--" });
                }
                if (eventNameOptions.length > 0) {
                    eventNameOptions = eventNameOptions.filter((i) => !!i.label)
                }

                setHelpDeskState((prevState: any) => ({ ...prevState, eventNameOptions: eventNameOptions }));

                const monthOptions = [
                    { value: 1, label: 'January', val: 0 },
                    { value: 2, label: 'February', val: 1 },
                    { value: 3, label: 'March', val: 2 },
                    { value: 4, label: 'April', val: 3 },
                    { value: 5, label: 'May', val: 4 },
                    { value: 6, label: 'June', val: 5 },
                    { value: 7, label: 'July', val: 6 },
                    { value: 8, label: 'August', val: 7 },
                    { value: 9, label: 'September', val: 8 },
                    { value: 10, label: 'October', val: 9 },
                    { value: 11, label: 'November', val: 10 },
                    { value: 12, label: 'December', val: 11 }
                ];
                setHelpDeskState((prevState) => ({ ...prevState, yearOptions: yearOptions, monthOptions: monthOptions }));

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
    }, [reloadGrid, isRefreshGrid, filterToDate]);

    React.useEffect(() => {
        const filterList = async () => {
            setIsLoading(true);
            let filteredData: any[];
            let cardItems: any[] = [];
            if (!!props.siteMasterId || currentUserRoleDetail.isAdmin) {
                filteredData = helpDeskListItems;
                cardItems = helpDeskListItems
            } else {
                let AllSiteIds: any[] = currentUserRoleDetail.currentUserAllCombineSites || [];
                filteredData = helpDeskListItems.filter(item =>
                    AllSiteIds.includes(item.SiteNameId)
                );
                cardItems = filteredData
            }

            if (selectedStates.length > 0 && Array.isArray(selectedStates)) {
                filteredData = filteredData.filter(x => selectedStates.includes(x.StateName));
            }

            if (selectedSiteIds.length > 0 && Array.isArray(selectedSiteIds)) {
                filteredData = filteredData.filter(x => selectedSiteIds.includes(x.SiteNameId));
            }

            // if (selectedStatus) {
            //     filteredData = filteredData.filter(x => x.HDStatus === selectedStatus);
            // }

            if (selectedStatus) {
                filteredData = filteredData.filter(x => x.HDStatus === selectedStatus);
            }
            if (selectedCategory) {
                filteredData = filteredData.filter(x => x.HDCategory === selectedCategory);
            }
            if (selectedHelpDeskName) {
                filteredData = filteredData.filter(x => x.HelpDeskName === selectedHelpDeskName);
            }
            if (helpDeskState.selectedMonth != null && (helpDeskState.selectedMonth >= 0 || helpDeskState.selectedMonth == 0)) {
                filteredData = filteredData.filter(x => x.StartDateMonth == helpDeskState.selectedMonth);
            }
            if (helpDeskState.selectedYear) {
                if (helpDeskState.selectedYear === 'blank') {
                    filteredData = filteredData.filter(x => x.StartDateYear == "");
                } else {
                    filteredData = filteredData.filter(x => x.StartDateYear == helpDeskState.selectedYear);
                }
            }
            if (helpDeskState.selectedEventName && helpDeskState.selectedEventName != "All") {
                filteredData = filteredData.filter(x => x.EventName === helpDeskState.selectedEventName);
            }
            if (helpDeskState.selectedCallType && helpDeskState.selectedCallType != "All") {
                filteredData = filteredData.filter(x => x.CallType === helpDeskState.selectedCallType);
            }

            if (!!helpDeskState.cardFilter && helpDeskState.cardFilter.length > 0) {
                cardItems = filteredData
                let isCheckAll = helpDeskState.cardFilter.filter((i) => i.type != "All")
                if (isCheckAll.length > 0) {
                    filteredData = filteredData.filter((x: any) => {
                        return helpDeskState.cardFilter.every((j) => {
                            return x[j.columnName] === j.value;
                        });
                    });


                } else {
                    filteredData = filteredData
                }
                setHelpDeskState((prevState) => ({ ...prevState, activeCardName: helpDeskState.cardFilter }))
            } else {
                setHelpDeskState((prevState) => ({ ...prevState, activeCardName: [] }))
                cardItems = filteredData
            }

            setHelpDeskCardItems(cardItems)

            setFilteredItems(filteredData);
            setIsLoading(false);
        };

        void filterList();
    }, [selectedStatus, selectedSiteIds, selectedCategory, selectedHelpDeskName, helpDeskListItems, helpDeskState.cardFilter, helpDeskState.selectedMonth, helpDeskState.selectedYear, helpDeskState.selectedCallType, helpDeskState.selectedEventName]);

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
    const _closeDeleteConfirmation = () => {
        // setDeleteRecordId(0);
        toggleHideDialog();
    };
    const _onItemSelected = (item: any): void => {

        if (item.length > 0) {
            if (item.length == 1) {
                // setIsDisplayEditButtonview(true);
                setUpdateItem(item[0]);
            } else {
                // setIsDisplayEditButtonview(false);
                setUpdateItem(item);
            }

            // setUpdateItem(item[0]);
            setisDisplayEDbtn(true);
        } else {
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
                breadCrumItems.push({ text: Array.isArray(UpdateItem) ? UpdateItem[0].Title : UpdateItem.Title, key: Array.isArray(UpdateItem) ? UpdateItem[0].Title : UpdateItem.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, siteMasterId: Array.isArray(UpdateItem) ? UpdateItem[0].Id : UpdateItem.Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems } });
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.HelpDeskInLieEdit, qCStateId: props?.qCStateId, dataObj: props.dataObj, helpDeskEditItemId: Array.isArray(UpdateItem) ? UpdateItem.map((i: any) => i.Id) : [UpdateItem.Id], siteMasterId: UpdateItem.Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId
                });
            }
            let data: any[] = [];
            if (!!predata.ID) {
                data.push(predata);
                if (!!data && data.length > 0) {
                    let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                    breadCrumItems.push({ text: data[0].Title, key: data[0]?.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, siteMasterId: data[0]?.Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems } });
                    props.manageComponentView({
                        currentComponentName: ComponentNameEnum.HelpDeskInLieEdit, qCStateId: props?.qCStateId, dataObj: props.dataObj, helpDeskEditItemId: Array.isArray(UpdateItem) ? UpdateItem.map((i: any) => i.Id) : [UpdateItem.Id], siteMasterId: data[0].Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId
                    });
                }
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickEdit", CustomErrormessage: "error in on click edit", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };

    const _confirmDeleteItem = async () => {
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
                const newObjects = processUpdateItem(UpdateItem);
                if (newObjects.length > 0) {
                    await provider.updateListItemsInBatchPnP(ListNames.HelpDesk, newObjects)
                }

                toastService.updateLoadingWithSuccess(toastId, "Record deleted successfully!");
                // setDeleteRecordId(0);
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
    const onclickExportToExcel = async () => {
        try {
            let exportColumns: IExportColumns[] = [
                {
                    header: "Help Desk Description",
                    key: "Title"
                },
                {
                    header: "Area",
                    key: "QCArea"
                },
                {
                    header: "Site Name",
                    key: "SiteName"
                },
                {
                    header: "Caller",
                    key: "Caller"
                },
                {
                    header: "Call Type",
                    key: "Call Type"
                },
                {
                    header: "Sub Location",
                    key: "SubLocation"
                },
                {
                    header: "Location",
                    key: "Location"
                },
                {
                    header: "Starting Date Time",
                    key: "StartingDateTime"
                },
                {
                    header: "Completion Date Time",
                    key: "CompletionDateTime"
                },
                {
                    header: "Duration",
                    key: "Duration"
                },
                {
                    header: "Category",
                    key: "HDCategory"
                },
                {
                    header: "Status",
                    key: "HDStatus"
                },
                {
                    header: "Report Help Desk",
                    key: "ReportHelpDesk"
                },
                {
                    header: "Event Name",
                    key: "EventName"
                },
                {
                    header: "Help Desk Name",
                    key: "HelpDeskName"
                },
                {
                    header: "Priority",
                    key: "QCPriority"
                },

            ];
            generateExcelTable(filteredItems, exportColumns, `${props.componentProps.siteName ? props.componentProps.siteName : "Master" + "_HelpDesk"}.xlsx`);
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickExportToExcel", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }
    };
    const parseExcelDate = (date?: string | Date): Date | null => {
        if (!date) return null;
        if (date instanceof Date) return date;
        if (typeof date === "string" && date.includes("-")) {
            const [day, month, yearAndTime] = date.split("-");
            const [year, time] = yearAndTime.split(" ");
            return new Date(`${year}-${month}-${day} ${time}`);
        }
        return new Date(date);
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
                const expectedColumnNames = ['SubLocation', 'StartingDateTime', 'Caller', 'Location', 'Priority', 'Status', 'HelpDeskName', 'Category', 'Area', 'EventName', 'ReportHelpDesk', 'CallType', 'HelpDeskDescription'];
                // const expectedColumnNames = ['Title', 'Caller', 'Location'];
                let isColumnsValid = true;

                for (let index = 0; index < expectedColumnNames.length; index++) {
                    isColumnsValid = dataJSONHeaderChek.indexOf(expectedColumnNames[index]) >= 0;
                    if (!isColumnsValid) {
                        errorobj.push(expectedColumnNames[index]);
                    }
                }
                //  let dataJSONHeaderChek: any[] = XLSX.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0];
                const excelData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
                const invalidRows = validateDateTimeRows(excelData);
                // const importantColumns = ['Title', 'StartingDateTime', 'CompletionDateTime', 'Caller', 'Location', 'Priority', 'Status', 'HelpDeskName', 'Category', 'Area', 'EventName', 'ReportHelpDesk', 'CallType'];
                // const blankImportantRows = excelData.filter((row: any) =>
                //     importantColumns.some(col => !row[col] || row[col].toString().trim() === "")
                // );
                if (errorobj.length === 0 && invalidRows.length === 0) {
                    setexcelData(excelData);
                } else {
                    let message: any;
                    if (errorobj.length > 0) {
                        message = (
                            <div>
                                <b>Following fields are missing from the excel</b>
                                <ul>
                                    {errorobj.map((r: any, index: any) => (
                                        <li key={index} className="errorPoint">{r}</li>
                                    ))}
                                </ul>
                            </div>
                        );
                    } else if (invalidRows.length > 0) {
                        message = (
                            <div>
                                <b>{Messages.CompletionTimeErrorInExcel}</b>
                                <table className="bordered-table mt-2">
                                    <thead>
                                        <tr>
                                            <th className="col-title">Title</th>
                                            <th className="col-start">Starting Date Time</th>
                                            <th className="col-completion">Completion Date Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invalidRows.map((row: any, idx: number) => (
                                            <tr key={idx}>
                                                <td>{row?.Title || "Blank"}</td>
                                                <td>{row?.StartingDateTime || "Blank"}</td>
                                                <td>{row?.CompletionDateTime || "Blank"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    }
                    // else if (blankImportantRows.length > 0) {
                    //     message = (
                    //         <div>
                    //             <b>The following rows have blank fields:</b>
                    //             <table className="bordered-table mt-2">
                    //                 <thead>
                    //                     <tr>
                    //                         <th className="col-title">Title</th>
                    //                         <th className="col-start">Starting Date Time</th>
                    //                         <th className="col-completion">Completion Date Time</th>
                    //                     </tr>
                    //                 </thead>
                    //                 <tbody>
                    //                     {invalidRows.map((row: any, idx: number) => (
                    //                         <tr key={idx}>
                    //                             <td>{row?.Title || "Blank"}</td>
                    //                             <td>{row?.StartingDateTime || "Blank"}</td>
                    //                             <td>{row?.CompletionDateTime || "Blank"}</td>
                    //                         </tr>
                    //                     ))}
                    //                 </tbody>
                    //             </table>
                    //         </div>
                    //     );
                    // }
                    setIsLoading(false);
                    setState((prevState: any) => ({
                        ...prevState,
                        uploadFileErrorMessage: message,
                        isUploadColumnValidationModelOpen: true
                    }));
                }
            };

            reader.readAsArrayBuffer(file);
        } catch (error) {
            const errorObj = {
                ErrorMethodName: "handleFileUpload",
                CustomErrormessage: "error in on handle file upload",
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                PageName: "QuayClean.aspx"
            };
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
        let error: any[] = [];
        try {
            if (uploadData && uploadData.length > 0) {
                const toastMessage = 'Record Insert successfully!';
                const toastId = toastService.loading('Loading...');
                const data = checkAndUpdateObjects(uploadData, HDData.current);
                const updatedData = uploadData.map(item => {
                    const { HelpDeskDescription, ...rest } = item;
                    return {
                        ...rest,
                        Title: HelpDeskDescription
                    };
                });

                let items = updatedData.map(r => {
                    return {
                        ...r,
                        CompletionDateTime: !!r.CompletionDateTime ? r.CompletionDateTime : null,
                        StartingDateTime: !!r.StartingDateTime ? r.StartingDateTime : null

                    }
                })
                const titles = items.map((item: any) => item?.Title).join(', ');
                provider.createItemInBatchHelpDesk(items, ListNames.HelpDesk).then(async (results: any) => {
                    setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
                    setReloadGrid(true);
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    setIsLoading(false);
                    console.log(results);
                    let errorItems: any[] = [];
                    if (!!results?.failedResults && results?.failedResults?.length > 0) {
                        errorItems = results.failedResults.map((r: any, index: any) => {
                            const { SiteNameId, ...rest } = r.item;
                            return { ...rest, 'Status': "", 'Category': "", 'Priority': "" };
                        });
                        if (!!errorItems && errorItems?.length > 0)
                            generateExcelTableHelpDesk(errorItems, [], `SkipOrErrorItems.xlsx`);

                    }
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: props?.siteMasterId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.Create,
                        EntityType: UserActionEntityTypeEnum.HelpDesk,
                        // EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        EntityName: "Excel Upload", // Match index dynamically
                        Details: `Create record using excel upload for ${titles}`,
                        StateId: props?.qCStateId
                    };
                    void UserActivityLog(provider, logObj, currentUserRoleDetail);

                }).catch((err: any) => {
                    console.log(err);


                });
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

    const onChangeYear = (value: IReactDropOptionProps) => {
        setHelpDeskState((prevState) => ({ ...prevState, selectedYear: !!value ? value.value : "" }))

    }
    const onChangeMonth = (value: any) => {
        if (value) {
            setHelpDeskState((prevState) => ({ ...prevState, selectedMonth: value.val }))
        } else {
            setHelpDeskState((prevState) => ({ ...prevState, selectedMonth: null }))
        }

    }
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
                        CompletionDateTime: moment.MomentInput
                        ReportHelpDesk: any;
                    }) => {
                        if (item.StartingDateTime) {
                            item.StartingDateTime = moment(item.StartingDateTime, "DD-MM-YYYY HH:mm").utc().format("YYYY-MM-DD[T]HH:mm:ss[Z]");
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
                        if (item.CompletionDateTime) {
                            item.CompletionDateTime = moment(item.CompletionDateTime, "DD-MM-YYYY HH:mm").utc().format("YYYY-MM-DD[T]HH:mm:ss[Z]");
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
    const parseStartingDateTime = (dateStr: string) => {
        // assuming format "dd-MM-yyyy HH:mm"
        const [datePart, timePart] = dateStr.split(" ");
        const [dd, mm, yyyy] = datePart.split("-").map(Number);
        if (timePart) {
            const [hours, minutes] = timePart.split(":").map(Number);
            return new Date(yyyy, mm - 1, dd, hours, minutes);
        }
        return new Date(yyyy, mm - 1, dd);
    };

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

    const _onItemInvoked = (itemID: any): void => {
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskDetailView, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems } });
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.HelpDeskDetailView, qCStateId: props?.qCStateId, dataObj: props.dataObj, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.originalSiteMasterId
        });

    };

    const _onItemName = (itemID: any): void => {
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskDetailView, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems } });
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.HelpDeskDetailView, qCStateId: props?.qCStateId, dataObj: props.dataObj, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.originalSiteMasterId
        });

    };

    const onclickConfigure = () => {
        showPopup();
    }
    const onclickCompletionDateConfigure = (data: any) => {
        showPopupCompletionDate();
        setUpdateHelpDeskId(data?.Id);
        setState((prevState: any) => ({
            ...prevState,
            HelpDescription: data?.Title,
            StartingDateTime: data?.StartingDateTime
        }));

    }

    const onClickYes = async () => {
        setIsLoading(true);
        const FieldDataObj = {
            Field: selectedOptions || [],
            SiteNameId: Number(props.componentProps.siteMasterId)
        };
        if (FieldData.length > 0) {
            setUpdateShowMessageBar(true);
            await provider.updateItemWithPnP(FieldDataObj, ListNames.HelpDeskField, FieldData[0]?.ID);
            await onClickFieldData();
            setIsLoading(false);
            hidePopup();
            setTimeout(() => {
                setUpdateShowMessageBar(false);
            }, 4000);
        } else {
            setSaveShowMessageBar(true);
            await provider.createItem(FieldDataObj, ListNames.HelpDeskField).then(async (item: any) => {
                await onClickFieldData();
                setIsLoading(false);
                hidePopup();
                setTimeout(() => {
                    setSaveShowMessageBar(false);
                }, 4000);
            });
        }
    }

    const onClickSaveComDate = async () => {
        try {
            if (!completionDateTime) {
                setDateError("Please select a completion date.");
                return;
            }

            let startDateTime: Date | undefined = undefined;
            if (state?.StartingDateTime) {
                const [datePart, timePart, meridian] = state?.StartingDateTime.split(" ");
                const [day, month, year] = datePart.split("-");
                let [hours, minutes] = timePart.split(":").map(Number);
                if (meridian === "PM" && hours < 12) hours += 12;
                if (meridian === "AM" && hours === 12) hours = 0;

                startDateTime = new Date(Number(year), Number(month) - 1, Number(day), hours, minutes);
            }
            const completion = new Date(completionDateTime);
            if (startDateTime && completion?.getTime() <= startDateTime.getTime()) {
                setDateError(Messages.CompletionTimeEarlier);
                return;
            }
            setDateError("");
            setIsLoading(true);
            const toastId = toastService.loading("Update completion date...");
            const FieldDataObj = {
                CompletionDateTime: completionDateTime ? new Date(completionDateTime) : null,
            };
            if (FieldDataObj) {
                await provider.updateItemWithPnP(FieldDataObj, ListNames.HelpDesk, updateHelpDeskId);
                setReloadGrid(true);
                toastService.updateLoadingWithSuccess(toastId, "Completion date updated successfully!");
                setIsLoading(false);
                hidePopupCompletionDate();
                setCompletionDateTime(undefined);
                setTimeout(() => {
                    setUpdateShowMessageBar(false);
                }, 4000);
            }
        } catch (error) {
            console.error("Error updating completion date:", error);
            setIsLoading(false);
        }
    };


    const onClickCompDateNo = () => {
        hidePopupCompletionDate();
        setCompletionDateTime(undefined);
        setDateError("");
    }

    const onClickNo = () => {
        hidePopup();
    }

    const handleCardClick = (card: IActiveCard[]) => {
        setHelpDeskState((prevState) => ({ ...prevState, cardFilter: card }))
    }

    React.useEffect(() => {
        if (!!props.siteMasterId) {

            const allColumns = [
                {
                    key: "Action", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 90, maxWidth: 120,
                    onRender: ((itemID: any) => {
                        return <>
                            <div className='dflex'>
                                <Link className="actionBtn btnView dticon" onClick={() => {
                                    let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                    breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskDetailView, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems } });
                                    props.manageComponentView({
                                        currentComponentName: ComponentNameEnum.HelpDeskDetailView, qCStateId: props?.qCStateId, dataObj: props.dataObj, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.originalSiteMasterId || itemID.SiteNameId
                                    });
                                }}>
                                    <TooltipHost content={"View Detail"} id={tooltipId}>
                                        <FontAwesomeIcon icon="eye" />
                                    </TooltipHost>
                                </Link>
                                {((!itemID?.CompletionDateTime || itemID?.CompletionDateTime === "") &&
                                    (!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Completion Date") && FieldData[0]?.Field?.includes("Starting Date"))
                                ) && (
                                        <Link className="actionBtn btnGreen dticon" onClick={() => onclickCompletionDateConfigure(itemID)}>
                                            <TooltipHost content={"Update Completion Date"} id={tooltipId}>
                                                <FontAwesomeIcon icon="check" />
                                            </TooltipHost>
                                        </Link>
                                    )}
                            </div>
                        </>;
                    })
                },
                {
                    key: 'Help Desk Description', name: 'Help Desk Description', fieldName: 'Title', isResizable: true, minWidth: 180, maxWidth: 200, isSortingRequired: true,
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
                { key: 'Starting Date', name: ' Starting Date & Time', fieldName: 'StartingDateTime', isResizable: true, minWidth: 170, maxWidth: 200, isSortingRequired: true },
                { key: 'Completion Date', name: 'Completion Date & Time', fieldName: 'CompletionDateTime', isResizable: true, minWidth: 170, maxWidth: 200, isSortingRequired: true },
                ...(FieldData && FieldData[0]?.Field?.includes('Completion Date') ? [
                    { key: 'Duration', name: 'Duration', fieldName: 'Duration', isResizable: true, minWidth: 170, maxWidth: 200 }
                ] : []),
                { key: 'Call Type', name: 'Call Type', fieldName: 'CallType', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true },
                { key: 'Location', name: 'Location', fieldName: 'Location', isResizable: true, minWidth: 140, maxWidth: 180, isSortingRequired: true },
                { key: 'Sub Location', name: 'Sub Location', fieldName: 'SubLocation', isResizable: true, minWidth: 140, maxWidth: 180, isSortingRequired: true },
                { key: 'Priority', name: 'Priority', fieldName: 'QCPriority', minWidth: 70, maxWidth: 100, isSortingRequired: true },
                { key: 'Category', name: 'Category', fieldName: 'HDCategory', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true },
                {
                    key: 'Status', name: 'Status', fieldName: 'HDStatus', minWidth: 90, maxWidth: 100, isSortingRequired: true,
                    onRender: (item: any) => {
                        let badgeClass = '';
                        if (item.HDStatus === "Pending") {
                            badgeClass = 'pendingBadge statusBadge badge';
                        }
                        else if (item.HDStatus === "In progress") {
                            badgeClass = 'inProgressBadge statusBadge badge';
                        }
                        else if (item.HDStatus === "Completed") {
                            badgeClass = 'completedBadge statusBadge badge';
                        }
                        return (
                            <>
                                <div className={badgeClass}>
                                    {item.HDStatus}
                                </div>
                            </>
                        );
                    },
                },
                { key: 'Event Name', name: 'Event Name', fieldName: 'EventName', isResizable: true, minWidth: 170, maxWidth: 240, isSortingRequired: true },
                {
                    key: 'Reported Help Desk', name: 'Report Help Desk ?', fieldName: 'ReportHelpDesk', minWidth: 140, maxWidth: 160, isSortingRequired: true,
                    onRender: (item: any) => {
                        let badgeClass = '';
                        if (item.ReportHelpDesk === "No") {
                            badgeClass = 'redBadge mw-50 badge';
                        }
                        else {
                            badgeClass = 'greenBadge mw-50 badge truncate';
                        }
                        return (
                            <>
                                <div className={badgeClass}>
                                    {item.ReportHelpDesk}
                                </div>
                            </>
                        );
                    },
                },
                { key: 'Help Desk Name', name: 'Help Desk Description', fieldName: 'HelpDeskName', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true },
            ];
            const filteredColumns = DisplayAllField || !FieldData?.length
                ? [...allColumns] // clone array to avoid mutating original
                : allColumns.filter(col => col.key === "Action" || (FieldData[0]?.Field || []).includes(col.key));

            const completionIndex = filteredColumns.findIndex(col => col.key === "Completion Date");

            if (completionIndex > -1) {
                filteredColumns.splice(completionIndex + 1, 0, {
                    key: 'Duration',
                    name: 'Duration',
                    fieldName: 'Duration',
                    isResizable: true,
                    minWidth: 170,
                    maxWidth: 200
                });
            }
            setcolumnsHelpDesk(filteredColumns);
        } else {
            setcolumnsHelpDesk([
                {
                    key: "Action", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 90, maxWidth: 100,
                    onRender: ((itemID: any) => {
                        return <>
                            <div className='dflex'>
                                <div>
                                    <Link className="actionBtn btnView dticon" onClick={() => {
                                        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                        breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskDetailView, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems } });
                                        props.manageComponentView({
                                            currentComponentName: ComponentNameEnum.HelpDeskDetailView, qCStateId: props?.qCStateId, dataObj: props.dataObj, siteMasterId: itemID.Id, isShowDetailOnly: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.originalSiteMasterId || itemID.SiteNameId
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
                    key: 'Title', name: 'Help Desk Description', fieldName: 'Title', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true,
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
                { key: 'Starting Date', name: ' Starting Date & Time', fieldName: 'StartingDateTime', isResizable: true, minWidth: 170, maxWidth: 200, isSortingRequired: true },
                { key: 'Completion Date', name: 'Completion Date & Time', fieldName: 'CompletionDateTime', isResizable: true, minWidth: 170, maxWidth: 200, isSortingRequired: true },

                { key: 'Duration', name: 'Duration', fieldName: 'Duration', isResizable: true, minWidth: 170, maxWidth: 200 }
                ,
                { key: 'Caller', name: 'Caller', fieldName: 'Caller', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true },
                { key: 'Call Type', name: 'Call Type', fieldName: 'CallType', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true },
                { key: 'Location', name: 'Location', fieldName: 'Location', isResizable: true, minWidth: 140, maxWidth: 280, isSortingRequired: true },
                { key: 'SubLocation', name: 'Sub Location', fieldName: 'SubLocation', isResizable: true, minWidth: 140, maxWidth: 240, isSortingRequired: true },

                { key: 'QCPriority', name: 'Priority', fieldName: 'QCPriority', minWidth: 70, maxWidth: 100, isSortingRequired: true },
                { key: 'Category', name: 'Category', fieldName: 'HDCategory', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true },
                {
                    key: 'HDStatus', name: 'Status', fieldName: 'HDStatus', minWidth: 90, maxWidth: 100, isSortingRequired: true,
                    onRender: (item: any) => {
                        let badgeClass = '';
                        if (item.HDStatus === "Pending") {
                            badgeClass = 'pendingBadge statusBadge badge';
                        }
                        else if (item.HDStatus === "In progress") {
                            badgeClass = 'inProgressBadge statusBadge badge';
                        }
                        else if (item.HDStatus === "Completed") {
                            badgeClass = 'completedBadge statusBadge badge';
                        }
                        return (
                            <>
                                <div className={badgeClass}>
                                    {item.HDStatus}
                                </div>
                            </>
                        );
                    },
                },
                { key: 'EventName', name: 'Event Name', fieldName: 'EventName', isResizable: true, minWidth: 170, maxWidth: 240, isSortingRequired: true },
                {
                    key: 'ReportHelpDesk', name: 'Report HelpDesk', fieldName: 'ReportHelpDesk', minWidth: 80, maxWidth: 100, isSortingRequired: true,
                    onRender: (item: any) => {
                        let badgeClass = '';
                        if (item.ReportHelpDesk === "No") {
                            badgeClass = 'redBadge mw-50 badge';
                        }
                        else {
                            badgeClass = 'greenBadge mw-50 badge truncate';
                        }
                        return (
                            <>
                                <div className={badgeClass}>
                                    {item.ReportHelpDesk}
                                </div>
                            </>
                        );
                    },
                },
                { key: 'HelpDeskName', name: 'Help Desk Description', fieldName: 'HelpDeskName', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true },

            ]);
        }
    }, [FieldData, DisplayAllField]);


    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {isLoading && <Loader />}
            {helpDeskState.isSendEmail && <CommonPopup
                isPopupVisible={helpDeskState.isSendEmail}
                hidePopup={onCloseSendEmail}
                title={title}
                sendToEmail={sendToEmail}
                onChangeTitle={onChangeTitle}
                onChangeSendToEmail={onChangeSendToEmail}
                displayerrortitle={displayerrortitle}
                displayerroremail={displayerroremail}
                displayerror={displayerror}
                onClickSendEmail={onClickSendEmail}
                onClickCancel={onCloseSendEmail}
                onclickSendEmail={() => setHelpDeskState((prevState) => ({ ...prevState, isSendEmail: true }))}
            />}
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
            <div className={!!props.siteMasterId ? "" : "boxCard"}>
                {!props.siteMasterId && <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                        <h1 className="mainTitle">Help Desk</h1>
                    </div>
                </div>}
                <div className="formGroup more-page-wrapper">

                    <div className="ms-Grid mt-3">
                        {/* <div className="ms-Grid-row ptop-5 dflex"> */}
                        <div className="ms-Grid-row">
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
                            {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Status")) && (
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                                    <div className="formControl">
                                        <HDCommonFilter
                                            onHDChange={onStatusChange}
                                            provider={provider}
                                            selectedHD={selectedStatus}
                                            AllOption={true}
                                            siteNameId={props.siteMasterId}
                                            Title="Status"
                                            placeHolder="Status"
                                        />
                                    </div>
                                </div>)}
                            {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Category")) && (
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                                    <div className="formControl">
                                        <HDCommonFilter
                                            onHDChange={onCategoryChange}
                                            provider={provider}
                                            selectedHD={selectedCategory}
                                            AllOption={true}
                                            siteNameId={props.siteMasterId}
                                            Title="Category"
                                            placeHolder="Category"
                                        />
                                    </div>
                                </div>
                            )}
                            {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Help Desk Name")) && (
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                                    <div className="formControl">
                                        <HDCommonFilter
                                            onHDChange={onChangeHelpDeskName}
                                            provider={provider}
                                            selectedHD={selectedHelpDeskName}
                                            AllOption={true}
                                            siteNameId={props.siteMasterId}
                                            Title="HelpDesk"
                                            placeHolder="Help Desk"
                                        />
                                    </div>
                                </div>
                            )}
                            {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Starting Date")) && (
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2">
                                    <div className="formControl">
                                        <ReactDropdown
                                            isSorted={false}
                                            placeholder="Year"
                                            options={helpDeskState.yearOptions || []}
                                            isMultiSelect={false}
                                            isClearable={true}
                                            defaultOption={helpDeskState.selectedYear || ""}
                                            onChange={onChangeYear}
                                        />
                                    </div>
                                </div>
                            )}
                            {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Starting Date")) && (
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                                    <div className="formControl">
                                        <ReactDropdown
                                            isSorted={false}
                                            isClearable={true}
                                            placeholder="Month"
                                            options={helpDeskState.monthOptions || []}
                                            isMultiSelect={false}
                                            defaultOption={(helpDeskState.selectedMonth != null ? helpDeskState.selectedMonth + 1 : "") || ""}
                                            onChange={onChangeMonth}
                                        />
                                    </div>
                                </div>
                            )}
                            {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Event Name")) && (
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                                    <div className="formControl">
                                        <ReactDropdown
                                            isSorted={false}
                                            // isClearable={true}
                                            placeholder="Event Name"
                                            options={helpDeskState.eventNameOptions || []}
                                            isMultiSelect={false}
                                            defaultOption={helpDeskState.selectedEventName || ""}
                                            onChange={onEventNameChange}
                                        />
                                    </div>
                                </div>
                            )}
                            {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Call Type")) && (
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                                    <div className="formControl">
                                        <ReactDropdown
                                            isSorted={false}
                                            // isClearable={true}
                                            placeholder="Call Type"
                                            options={helpDeskState.callTypeOptions || []}
                                            isMultiSelect={false}
                                            defaultOption={helpDeskState.selectedCallType || ""}
                                            onChange={onCallTypeChange}
                                        />
                                    </div>
                                </div>
                            )}
                            {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Starting Date")) && (
                                // <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2">
                                //     <div className="formControl">
                                <PreDateRangeFilter
                                    fromDate={fromDate}
                                    toDate={toDate}
                                    onFromDateChange={onChangeFromDate}
                                    onToDateChange={onChangeToDate}
                                    onChangeRangeOption={onChangeRangeOption}
                                    isUIFlex={true}
                                />
                                //     </div>
                                // </div>
                            )}
                            {!!props?.originalSiteMasterId && props?.originalSiteMasterId != undefined && isVisibleCrud.current &&
                                <div className={`ms-Grid-col ms-sm12 ${props.siteMasterId
                                    ? selectedItem?.text === "Custom Range"
                                        ? "ms-md6 ms-lg4 ms-xl4"
                                        : "ms-md6 ms-lg8 ms-xl8"
                                    : selectedItem?.text === "Custom Range"
                                        ? "ms-md12 ms-lg12 ms-xl12 mla"
                                        : "ms-md6 ms-lg ms-xl4 mla"
                                    }`}>
                                    <div className="dflex">

                                        {!!selectedOptions && selectedOptions.length > 0 && <div className="mla linklbl">
                                            <Link
                                                className="actionBtn iconSize btnMove dticon custdd-icon"
                                                onClick={() => onclickConfigure()}
                                            >
                                                <TooltipHost content={"Configure Help Desk Field"} id={`tooltip`}>
                                                    <FontAwesomeIcon icon="gear" />
                                                </TooltipHost>
                                            </Link>
                                        </div>}
                                        {helpDeskState.isGraphView &&
                                            <> <div className="">
                                                <Link
                                                    className="actionBtn iconSize btnMove dticon custdd-icon"
                                                    onClick={() => onClickSendEmailChart(true, "cardHelpDesk")}
                                                >
                                                    <TooltipHost content={"Send Email Report"}>
                                                        <FontAwesomeIcon icon={'paper-plane'} />
                                                    </TooltipHost>
                                                </Link>
                                            </div>
                                                {helpDeskState?.cardFilter.length > 0 && <div className="">
                                                    <Link
                                                        className="actionBtn iconSize btnMove dticon custdd-icon"
                                                        onClick={() => handleCardClick([])}
                                                    >
                                                        <TooltipHost content={"Clear Card Filter"}>
                                                            <FontAwesomeIcon icon={'rotate-left'} />
                                                        </TooltipHost>
                                                    </Link>
                                                </div>}
                                            </>
                                        }

                                        <div className="">
                                            <Link
                                                className="actionBtn iconSize btnMove dticon custdd-icon"
                                                onClick={() => setHelpDeskState((prevState) => ({ ...prevState, isGraphView: !prevState.isGraphView }))}
                                            >
                                                <TooltipHost content={helpDeskState.isGraphView ? "Grid view" : "Graph view"} id={`tooltip`}>
                                                    <FontAwesomeIcon icon={helpDeskState.isGraphView ? "table-cells" : "chart-simple"} />
                                                </TooltipHost>
                                            </Link>
                                        </div>
                                    </div>
                                </div>}
                            {!(!!props?.originalSiteMasterId && props?.originalSiteMasterId != undefined && isVisibleCrud.current) &&
                                <>
                                    <div className={props.siteMasterId ? "ms-Grid-col ms-sm12 ms-md6 ms-lg8 ms-xl8"
                                        : props.siteMasterId && selectedItem.text === "Custom Range" ?
                                            "ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl4" :
                                            selectedItem.text === "Custom Range" ?
                                                "ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 mla" : "ms-Grid-col ms-sm12 ms-md6 ms-lg ms-xl4 mla"}>
                                        <div className="dflex">
                                            {helpDeskState.isGraphView &&
                                                <><div className="mla linklbl">
                                                    <Link
                                                        className="actionBtn iconSize btnMove dticon custdd-icon"
                                                        onClick={() => onClickSendEmailChart(true, "cardHelpDesk")}
                                                    >
                                                        <TooltipHost content={"Send Email Report"}>
                                                            <FontAwesomeIcon icon={'paper-plane'} />
                                                        </TooltipHost>
                                                    </Link>
                                                </div>
                                                    {helpDeskState?.cardFilter.length > 0 && <div className="">
                                                        <Link
                                                            className="actionBtn iconSize btnMove dticon custdd-icon"
                                                            onClick={() => handleCardClick([])}
                                                        >
                                                            <TooltipHost content={"Clear Card Filter"}>
                                                                <FontAwesomeIcon icon={'rotate-left'} />
                                                            </TooltipHost>
                                                        </Link>
                                                    </div>}</>
                                            }
                                            <div className={helpDeskState.isGraphView ? "" : "mla linklbl"}>
                                                <Link
                                                    className="actionBtn iconSize btnMove dticon custdd-icon"
                                                    onClick={() => setHelpDeskState((prevState) => ({ ...prevState, isGraphView: !prevState.isGraphView }))}
                                                >
                                                    <TooltipHost content={helpDeskState.isGraphView ? "Grid view" : "Graph view"} id={`tooltip`}>
                                                        <FontAwesomeIcon icon={helpDeskState.isGraphView ? "table-cells" : "chart-simple"} />
                                                    </TooltipHost>
                                                </Link>
                                            </div>
                                        </div>
                                    </div></>

                            }
                        </div>
                    </div>

                    {helpDeskState.isGraphView ?
                        <div>
                            <div className="ms-Grid mt-3" id="cardHelpDesk">
                                <div className="ms-Grid-row ">
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                        <HelpDeskCard
                                            activeCardName={helpDeskState.activeCardName}
                                            handleCardClick={handleCardClick}
                                            // count={helpDeskState.cardCounts}
                                            items={helpDeskCardItems}
                                        />
                                    </div>
                                    {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Category")) && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                        <HelpDeskCategoryChart isPrint={helpDeskState.isPrint} items={filteredItems} columnName="HDCategory" title="Help Desk Categories" isPieView={true} viewFelid={(!!FieldData && FieldData.length > 0) ? FieldData[0]?.Field : []} isGenerateOther={true} id="HelpDeskCategories" onClickSendEmail={(id) => onClickSendEmailChart(false, id)} />
                                    </div>}
                                    {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Area")) && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 page-break  mt-10">
                                        <HelpDeskCategoryChart isPrint={helpDeskState.isPrint} items={filteredItems} columnName="Area" title="Help Desk Area" isPieView={true} viewFelid={(!!FieldData && FieldData.length > 0) ? FieldData[0]?.Field : []} isGenerateOther={true} id="HelpDeskArea" onClickSendEmail={(id) => onClickSendEmailChart(false, id)} />
                                    </div>}
                                    {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Starting Date")) && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 page-break mt-10">
                                        <HelpDeskCategoryChart isPrint={helpDeskState.isPrint} items={filteredItems} columnName="StartingDateCard" title="Help Desk Date & Time" isPieView={true} viewFelid={(!!FieldData && FieldData.length > 0) ? FieldData[0]?.Field : []} isGenerateOther={true} id="HelpDeskDateTime" onClickSendEmail={(id) => onClickSendEmailChart(false, id)} />
                                    </div>}

                                </div>
                            </div>

                        </div>
                        : <div className="formGroup mt-2" id="listingDiv">
                            {currentView === "grid" ? <>
                                <MemoizedDetailList
                                    manageComponentView={props.manageComponentView}
                                    columns={columnsHelpDesk as any}
                                    items={filteredItems || []}
                                    reRenderComponent={true}
                                    onSelectedItem={_onItemSelected}
                                    searchable={true}
                                    onItemInvoked={_onItemInvoked}
                                    CustomselectionMode={(!!props.siteMasterId && isVisibleCrud.current) ? SelectionMode.multiple : SelectionMode.none}
                                    addEDButton={(isDisplayEDbtn && isCrudVisible.current) && <>
                                        <div className='dflex mb-sm-3'>
                                            {/* {isDisplayEditButtonview && <Link className="actionBtn iconSize btnEdit " onClick={onclickEdit}>
                                            <TooltipHost content={"Edit Detail"} id={tooltipId}>
                                                <FontAwesomeIcon icon="edit" />
                                            </TooltipHost>
                                        </Link>} */}
                                            <Link className="actionBtn iconSize btnEdit " onClick={onclickEdit}>
                                                <TooltipHost content={"Edit Detail"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="edit" />
                                                </TooltipHost>
                                            </Link>
                                            <Link className="actionBtn iconSize btnDanger ml-10" onClick={onclickconfirmdelete}>
                                                <TooltipHost content={"Delete"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="trash-alt" />
                                                </TooltipHost>
                                            </Link>
                                        </div>
                                    </>}
                                    isAddNew={true}
                                    addNewContent={
                                        <>
                                            <div className="dflex mb-sm-3">
                                                {(!!filteredItems && filteredItems.length > 0) &&
                                                    <Link className="actionBtn clsexport iconSize btnEdit ml-10" style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                                        text="">
                                                        <TooltipHost
                                                            content={"Export to excel"}
                                                            id={tooltipId}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={"file-excel"}
                                                            />
                                                        </TooltipHost></Link>
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
                                                        </TooltipHost></Link> : */}
                                                <>
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
                                                </>
                                                {/* } */}
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
                                                    {isCrudVisible.current && isVisibleCrud.current && <PrimaryButton text="Add" className="btn btn-primary "
                                                        onClick={() => {
                                                            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                                            // breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.HelpDeskForm, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, isAddNewSite: true, breadCrumItems: breadCrumItems, dataObj: props.dataObj } });
                                                            // props.manageComponentView({ currentComponentName: ComponentNameEnum.HelpDeskForm, dataObj: props.dataObj, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId });
                                                            breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.HelpDeskInLieEdit, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, isAddNewSite: true, breadCrumItems: breadCrumItems, dataObj: props.dataObj } });
                                                            props.manageComponentView({ currentComponentName: ComponentNameEnum.HelpDeskInLieEdit, qCStateId: props?.qCStateId, dataObj: props.dataObj, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId });
                                                            setIsLoading(false);
                                                        }} />} </>}
                                            </div>
                                        </>
                                    } />

                            </> :
                                <>
                                    <div className="dflex">
                                        {!!props.siteMasterId && <>
                                            {isCrudVisible.current && <PrimaryButton text="Add" className="btn btn-primary "
                                                onClick={() => {
                                                    let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                                    breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.HelpDeskForm, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, isAddNewSite: true, breadCrumItems: breadCrumItems, dataObj: props.dataObj } });
                                                    props.manageComponentView({ currentComponentName: ComponentNameEnum.HelpDeskForm, qCStateId: props?.qCStateId, dataObj: props.dataObj, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId });
                                                    setIsLoading(false);
                                                }} />} </>}
                                        {(!!filteredItems && filteredItems.length > 0) &&
                                            <Link className="actionBtn clsexport iconSize btnEdit ml-10" style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                                text="">
                                                <TooltipHost
                                                    content={"Export to excel"}
                                                    id={tooltipId}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={"file-excel"}
                                                    />
                                                </TooltipHost></Link>

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
                                                </TooltipHost></Link> : */}

                                        <>

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
                                        </>
                                        {/* } */}
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
                                    <HelpDeskDetailsCardView
                                        //columns={columnsHelpDesk as any}

                                        items={filteredItems as any || []}
                                        siteMasterId={props.siteMasterId}
                                        manageComponentView={props.manageComponentView}
                                        _onclickEdit={onclickEdit}
                                        _onclickconfirmdelete={onclickconfirmdelete}
                                        isEditDelete={props?.siteMasterId ? true : false}
                                    />
                                </>
                            }
                        </div>}
                </div>
            </div >
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
            {
                isPopupVisible && (
                    <Layer>
                        <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup}>
                            <Overlay onClick={hidePopup} />
                            <FocusTrapZone>
                                <Popup role="document" className={popupStyles.content}>
                                    <h2 className="mt-10">Configure Help Desk Field</h2>
                                    <div className="mt-2">
                                        {showSaveMessageBar &&
                                            <MessageBar messageBarType={MessageBarType.success}>
                                                <div className="inputText">Columns has been saved successfully!</div>
                                            </MessageBar>}
                                        {showUpdateMessageBar &&
                                            <MessageBar messageBarType={MessageBarType.success}>
                                                <div className="inputText">Columns has been updated successfully!</div>
                                            </MessageBar>}
                                    </div>
                                    <div className="mt-2"><b>Select Column</b></div>
                                    <div className="formControl custdd-multiple mt img-mt">
                                        <Dropdown
                                            placeholder="Select"
                                            multiSelect
                                            options={dropdownOptions}
                                            selectedKeys={
                                                selectedOptions.length === dropdownOptions.length - 1
                                                    ? ['selectAll', ...selectedOptions] // Ensure "Select All" appears selected when all options are selected
                                                    : selectedOptions
                                            }
                                            onChange={handleDropdownChange}
                                        />

                                    </div>
                                    <DialogFooter>
                                        <PrimaryButton text="Save" onClick={onClickYes} className='mrt15 css-b62m3t-container btn btn-primary' />
                                        <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickNo} />
                                    </DialogFooter>
                                </Popup>
                            </FocusTrapZone>
                        </Popup>
                    </Layer>)
            }
            <CustomModal
                isModalOpenProps={isCompletionDateVisible}
                dialogWidth="450px"
                subject="Select Completion Date Time"
                message={
                    <>
                        <div className="ms-Grid-row">
                            {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Help Desk Description")) && (
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6 ">
                                    <label className="viewLabel" > Help Desk Description </label >
                                    <div className="mt1 listDetail inputText"> {state?.HelpDescription || ""} </div>
                                </div>
                            )}
                            {(!FieldData || FieldData.length === 0 || FieldData[0]?.Field?.includes("Starting Date")) && (
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6">
                                    <div className="formGroup">
                                        <label className="viewLabel">
                                            Starting Date Time
                                        </label>
                                        <div className="mt1 listDetail inputText">{state?.StartingDateTime}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="ms-Grid-row ">
                            <Label className="formLabel">
                                Completion Date Time <span className="required">*</span>
                            </Label>
                            <div className="formControl custdd-multiple mt img-mt">
                                <DateTimePicker
                                    formatDate={(date: Date) =>
                                        date
                                            ? date
                                                .toLocaleDateString("nl-NL", {
                                                    year: "numeric",
                                                    month: "2-digit",
                                                    day: "2-digit",
                                                })
                                                .replace(/-/g, "/")
                                            : ""
                                    }
                                    dateConvention={DateConvention.DateTime}
                                    timeConvention={TimeConvention.Hours12}
                                    timeDisplayControlType={TimeDisplayControlType.Dropdown}
                                    value={completionDateTime}
                                    onChange={(date?: Date) => setCompletionDateTime(date)}
                                    minDate={
                                        state?.StartingDateTime ? parseStartingDateTime(state.StartingDateTime) : undefined
                                    }
                                />
                                {dateError && (
                                    <span className="required">{dateError}</span>
                                )}
                            </div>
                        </div>
                    </>
                }
                closeButtonText="Cancel"
                onClickOfYes={onClickSaveComDate}
                isYesButtonDisbale={!completionDateTime}
                yesButtonText="Save"
                onClose={onClickCompDateNo}
            />
        </>;
    }
}