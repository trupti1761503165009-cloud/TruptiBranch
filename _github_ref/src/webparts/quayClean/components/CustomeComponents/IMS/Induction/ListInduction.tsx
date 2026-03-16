/* eslint-disable max-lines */
/* eslint-disable no-prototype-builtins */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { Checkbox, DefaultButton, DialogFooter, DialogType, FocusTrapZone, IColumn, IDropdownOption, Layer, Link, mergeStyleSets, MessageBar, MessageBarType, Overlay, Popup, PrimaryButton, SelectionMode, Toggle, TooltipHost } from "@fluentui/react";
import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CommonConstSiteName, ComponentNameEnum, ListNames } from "../../../../../../Common/Enum/ComponentNameEnum";
import { generateExcelTable, getCAMLQueryFilterExpression, getDataSorted, logGenerator, onBreadcrumbItemClicked } from "../../../../../../Common/Util";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IHelpDeskFormProps } from "../../../../../../Interfaces/IAddNewHelpDesk";
import { Loader } from "../../../CommonComponents/Loader";
import { MemoizedDetailList } from "../../../../../../Common/DetailsList";
import { IBreadCrum } from "../../../../../../Interfaces/IBreadCrum";
import { useBoolean, useId } from "@fluentui/react-hooks";
import moment from "moment";
import CustomModal from "../../../CommonComponents/CustomModal";
import { toastService } from "../../../../../../Common/ToastService";
import { appGlobalStateAtom, appSiteStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { MultipleSiteFilter } from "../../../../../../Common/Filter/MultipleSiteFilter";
import CamlBuilder from "camljs";
import { ICamlQueryFilter, FieldType, LogicalType } from "../../../../../../Common/Constants/DocumentConstants";
import { CopyIMSLink } from "../../../../../../Common/CopyIMSLink";
import { ActionMeta } from "react-select";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { PreDateRangeFilter } from "../../../../../../Common/Filter/PreDateRangeFilter";
import DragAndDrop from "../../../CommonComponents/FileUpload/DragandDrop";
import { ValidateForm } from "../../../../../../Common/Validation";
import * as XLSX from 'xlsx';
import { IFileWithBlob } from "../../../../../../DataProvider/Interface/IFileWithBlob";
import { IExportColumns } from "../../EquipmentChecklist/Question";
import { InductionCountCard } from "./InductionCountCard";
import { DateFormat, DateTimeFormate } from "../../../../../../Common/Constants/CommonConstants";

export const ListInduction: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const appSiteState = useAtomValue(appSiteStateAtom);
    const { PermissionArray } = appSiteState;
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [UserCourseInductionData, setUserCourseInductionData] = React.useState<any[]>([]);
    const [InductionDetail, setInductionDetail] = React.useState<any[]>([]);
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>([]);
    const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>([]);
    const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>([]);
    const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : 'grid');
    const [filterType, setFilterType] = React.useState<any>("");
    const [ManagerOptions, setManagerOptions] = React.useState<IDropdownOption[]>([]);
    const [defaultManager, setDefaultManager] = React.useState<any>(null);
    const [selectedManager, setSelectedManager] = React.useState<any>(null);
    const [fromDate, setFromDate] = React.useState<Date | any>();
    const [toDate, setToDate] = React.useState<Date | any>();
    const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: '', text: 'select' });
    const [isPopupVisible4, { setTrue: showPopup4, setFalse: hidePopup4 }] = useBoolean(false);
    const [filterFromDate, setFilterFromDate] = React.useState<any>(undefined);
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);
    const [notFoundDialog, setnotFoundDialog] = React.useState<boolean>(false);
    const [downloadDisable, setdownloadDisable] = React.useState<boolean>(true);
    const [excelData, setexcelData] = React.useState<any[]>([]);
    const [AttendeesData, setAttendeesData] = React.useState<any[]>([]);
    const [ValMessage, setValMessage] = React.useState<string>("");
    const [showResendMessage, setShowResendMessage] = React.useState(false);
    const [SummaryData, setSummaryData] = React.useState<any>([]);
    const Spinner = React.useRef<boolean>(true);
    const CourseName = React.useRef<any>("");
    const Course1Name = React.useRef<any>("");
    const Course2Name = React.useRef<any>("");
    const Course3Name = React.useRef<any>("");
    const Course4Name = React.useRef<any>("");
    const AttendeesValMessage = React.useRef<string>("");
    const ContractorValMessage = React.useRef<string>("");
    const ChairpersonValMessage = React.useRef<string>("");
    const nonMatchAttendees = React.useRef<string>("");
    const nonMatchContractor = React.useRef<string>("");
    const undefineChairperson = React.useRef<any>([]);
    const orgExcelData = React.useRef<any>([]);
    // const [toggleItems, setToggleItems] = React.useState<any[]>([]);
    const InActiveMessage = React.useRef<any>("");
    const CheckBoxId = React.useRef<any>("");
    const CourseMasterData = React.useRef<any>([]);
    const SydneyShowData = React.useRef<any>([]);
    const _onManagerChange = (option: any, actionMeta: ActionMeta<any>): void => {
        setSelectedManager(option?.text);
        setDefaultManager(option?.value);
    };
    const [FilteredData, setFilteredData] = React.useState<any>([]);
    const [columnsInduction, setcolumnsInduction] = React.useState<any>([]);
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
        isAssociatModel: false,
        AssetTypeMasterId: 0,
        ATMManufacturer: "",
        AssetTypeMaster: ""
    });

    const onChangeRangeOption = (item: IDropdownOption): void => {
        setSelectedItem(item);
        setIsRefreshGrid(prevState => !prevState);
    };

    const onChangeToDate = (filterDate: any, date?: Date) => {
        setFilterToDate(filterDate);
        setToDate(date);
    };
    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setFromDate(date);
        setFilterFromDate(filterDate);
    };

    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSiteIds(siteIds);
        setSelectedSiteTitles(siteTitles);
        setSelectedSCSites(siteSC);
    };
    const [isPopupVisible2, { setTrue: showPopup2, setFalse: hidePopup2 }] = useBoolean(false);
    const [isPopupVisible3, { setTrue: showPopup3, setFalse: hidePopup3 }] = useBoolean(false);
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

    const handleCardClick = (title: string | null) => {
        if (title) {
            setFilterType(title);
        } else {
            setFilterType("");
        }
    };

    const [isPopupOpen, setIsPopupOpen] = React.useState(false);
    const [popupData, setPopupData] = React.useState<any>(null);

    let InductionDetailData = React.useRef<any>();
    let InductionDetailStatusData = React.useRef<any>();
    let UpdateItems = React.useRef<any>();
    const onClickExpired = async (item: any) => {
        UpdateItems.current = item;
        showPopup2();
    }

    const onClickYes = async () => {
        const updatedData = {
            ExpiryDate: moment(UpdateItems?.current?.ExpiryDate).add(1, 'months').toISOString(),
            Status: "",
            IsResend: true
        };
        await provider.updateItemWithPnP(updatedData, ListNames.InductionDetail, UpdateItems.current.ID);
        _getInductionDetailData();
        hidePopup2();
    }

    const onClickNo = async () => {
        hidePopup2();
        hidePopup3();
        hidePopup4();
    }

    const onclickResend = async (item: any) => {
        await props?.provider?.updateItemWithPnP({ IsResend: true }, ListNames.InductionDetail, item?.ID);
        setShowResendMessage(true);
        setTimeout(() => setShowResendMessage(false), 3000);
    };
    const handleOpenPopup = async (item: any) => {
        setIsLoading(true);
        try {
            const select = ["ID,InductionMasterId,AttendeesEmailId,AttendeesEmail/Email,AttendeesEmail/Id,AttendeesEmail/Title,InductionKey,Status,ExpiryDate,ContractorEmailId,ContractorEmail/Email,ContractorEmail/Id,ContractorEmail/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["AttendeesEmail,ContractorEmail"],
                filter: `ID eq '${item.ID}' and SiteNameId eq '${props.originalSiteMasterId}'`,
                listName: ListNames.InductionDetail,
            };
            await provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const listData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                InductionKey: !!data.InductionKey ? data.InductionKey : '',
                                AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : [],
                                ContractorEmailId: !!data.ContractorEmailId ? data.ContractorEmailId : [],
                                FullAttendees: !!data.AttendeesEmailId ? [data.AttendeesEmail] : !!data.ContractorEmailId ? [data.ContractorEmail] : [],
                            }
                        );
                    });
                    InductionDetailData.current = listData;
                    setPopupData(item);
                    setIsLoading(false);
                    setIsPopupOpen(true);
                }
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
        }
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false); // Close popup
        setPopupData(null); // Clear data
        InductionDetailData.current = [];
    };

    const _getUserCourseInductionList = () => {
        setIsLoading(true);
        try {
            const select = ["ID,InductionDetailId,TotalCorrectAnswers,TotalWrongAnswers,TotalQuestions,CourseMasterId,CourseMaster/Title,Modified"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["CourseMaster"],
                listName: ListNames.UserCourseInductionDetail,
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const masterData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                InductionDetailId: !!data.InductionDetailId ? data.InductionDetailId : "",
                                TotalCorrectAnswers: !!data.TotalCorrectAnswers ? data.TotalCorrectAnswers : null,
                                TotalWrongAnswers: !!data.TotalWrongAnswers ? data.TotalWrongAnswers : '',
                                TotalQuestions: !!data.TotalQuestions ? data.TotalQuestions : '',
                                CourseMasterId: !!data.CourseMasterId ? data.CourseMasterId : '',
                                CourseMaster: !!data.CourseMaster ? data.CourseMaster.Title : '',
                                // Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : '',
                                // Modified: !!data.Modified ? data.Modified : null,
                            }
                        );
                    });

                    let filterData = masterData?.sort((a: any, b: any) => {
                        return moment(b.Modified).diff(moment(a.Modified));
                    });
                    setUserCourseInductionData(filterData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "_getUserCourseInductionList", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_getUserCourseInductionList", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };

    const _getInductionMasterList = () => {
        setIsLoading(true);
        try {
            let custfilter = `IsActive eq 1 and IsDeleted ne 1 and SiteNameId eq '${props.originalSiteMasterId}'`;

            const select = ["ID,Title,InductionDate,InductionID,FormStatus,IsActive,ChairpersonId,AttendeesEmailId,AttendeesEmail/Email,AttendeesEmail/Id,AttendeesEmail/Title,ContractorEmailId,ContractorEmail/Email,ContractorEmail/Id,ContractorEmail/Title,SiteNameId,SiteName/Title,Attendees,Created,Modified"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteName,AttendeesEmail,ContractorEmail"],
                filter: custfilter,
                listName: ListNames.InductionMaster,
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const listData = results.map((data) => {
                        let fullAttendees: any = [];
                        if (data.ContractorEmailId.length > 0) {
                            const emails = [...data.AttendeesEmail, ...data.ContractorEmail]
                            fullAttendees = emails
                        } else {
                            fullAttendees = data.AttendeesEmailId ? data.AttendeesEmail : []
                        }
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                InductionDate: !!data.InductionDate ? moment(data.InductionDate).format(DateFormat) : '',
                                OrgInductionDate: !!data.InductionDate ? data.InductionDate : null,
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                InductionID: !!data.InductionID ? data.InductionID : '',
                                Attendees: !!data.Attendees ? data.Attendees : '',
                                Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : '',
                                Modified: !!data.Modified ? data.Modified : null,
                                FormStatus: !!data.FormStatus ? data.FormStatus : '',
                                IsActive: !!data.IsActive ? data.IsActive : false,
                                ChairpersonID: !!data.ChairpersonId ? data.ChairpersonId : null,
                                AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : [],
                                ContractorEmailId: !!data.ContractorEmailId ? data.ContractorEmailId : [],
                                FullAttendees: fullAttendees,
                            }
                        );
                    });

                    const transformData = (data: any[]) => {
                        const result: any[] = [];

                        data.forEach(record => {
                            record.FullAttendees.forEach((attendee: any) => {
                                result.push({
                                    ...record,
                                    FullAttendees: [attendee], // Keep only one attendee per record
                                    Attendees: attendee.Title, // Update Attendees field to match the single attendee
                                    AttendeesEmailId: [attendee.Id] // Keep only one email ID per record
                                });
                            });
                        });

                        return result;
                    };
                    // Example Usage
                    const transformedData = transformData(listData);
                    let filteredData: any[];
                    if (!!props.siteMasterId || currentUserRoleDetail?.isAdmin) {
                        filteredData = transformedData;
                    } else {
                        let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                        filteredData = !!transformedData && transformedData?.filter(item =>
                            AllSiteIds.includes(item?.SiteNameId)
                        );
                    }
                    filteredData = filteredData?.sort((a: any, b: any) => {
                        return moment(b.Modified).diff(moment(a.Modified));
                    });
                    // setInductionData(filteredData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "_getCorrectiveActionReportList", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_getCorrectiveActionReportList", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };

    const onclickUpload = () => {
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: true }));
    };
    const onClickCloseModel = () => {
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false }));
    };
    const onCancel = async () => {
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
    };

    const handleToggleChange = async (itemID: number, checked?: boolean) => {
        try {
            setIsLoading(true);

            const updatedData = {
                AccreditationApply: checked
            };
            await provider.updateItemWithPnP(updatedData, ListNames.InductionDetail, itemID);
            const updatedItems = InductionDetail.map(item =>
                item.ID === itemID ? { ...item, AccreditationApply: checked } : item
            );
            setInductionDetail(updatedItems);
            setIsLoading(false);
        } catch (error) {
            console.error("Error updating item:", error);
        }
    };

    const onToggleChange = (itemID: any, checked: boolean | undefined): void => {
        CheckBoxId.current = itemID.ID;
        InActiveMessage.current = checked ? "Inactive" : "Active";

        if (InActiveMessage.current !== "") {
            showPopup4();
        }

        itemID.IsActive = checked;
    };

    const onClickYesCheckBox = async (): Promise<void> => {
        let UpdateData = {
            InActive: InActiveMessage.current == "Inactive" ? true : false
        }
        await props.provider.updateItemWithPnP(UpdateData, ListNames.InductionDetail, CheckBoxId.current);
        setIsRefreshGrid(prevState => !prevState);
        hidePopup4();
    };

    const InductionColumn = (): IColumn[] => {
        let columns: any[] = [
            {
                key: "key11", name: 'Action', fieldName: 'ID', Index: 1, isResizable: true, minWidth: 70, maxWidth: 120,
                onRender: ((itemID: any) => {
                    return <>
                        <div className='dflex' onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
                            <Link className="actionBtn btnView dticon no-select" onClick={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                breadCrumItems.push({
                                    text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: {
                                        currentComponentName: ComponentNameEnum.DetailInduction, siteMasterId: itemID.InductionMasterId, isShowDetailOnly: true,
                                        siteName: props.componentProps.siteName, qCState: props.componentProps.qCState,
                                        breadCrumItems: breadCrumItems
                                    }
                                });
                                props.manageComponentView({
                                    currentComponentName: ComponentNameEnum.DetailInduction, MasterId: itemID.AttendeesEmailId || itemID.ContractorEmailId, dataObj: props.componentProps.dataObj, siteMasterId: itemID.InductionMasterId, originalSiteMasterId: props.siteMasterId, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState
                                });
                            }}>
                                <TooltipHost content={"View Detail"} id={tooltipId}>
                                    <FontAwesomeIcon icon="eye" />
                                </TooltipHost>
                            </Link>
                            {(currentUserRoleDetail.isAdmin || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isSiteManager || currentUserRoleDetail.isSiteSupervisor || currentUserRoleDetail.isWHSChairperson) && <Link
                                className="actionBtn btnEdit dticon"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    handleOpenPopup(itemID)
                                }}
                            >
                                <TooltipHost content={"Copy Link"} id={`tooltip_${itemID.InductionMasterId}`}>
                                    <FontAwesomeIcon icon="link" />
                                </TooltipHost>
                            </Link>}
                            <Link
                                className="actionBtn btnView dticon"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    onclickResend(itemID)
                                }}
                            >
                                <TooltipHost content={"Resend Email"}>
                                    <FontAwesomeIcon icon="paper-plane" />
                                </TooltipHost>
                            </Link>
                            {itemID.Status === "Expired" &&
                                <div><Link className="actionBtn btnDanger dticon"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        onClickExpired(itemID)
                                    }}>
                                    <TooltipHost
                                        content={"Expired"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon icon="circle-exclamation" />
                                    </TooltipHost>
                                </Link></div >}
                        </div>
                    </>;
                })
            },

            { key: 'Induction', name: 'Induction', fieldName: 'Induction', Index: 3, isResizable: true, minWidth: 60, maxWidth: 120, isSortingRequired: true },
            { key: 'InductionDate', name: 'Induction Date', fieldName: 'InductionDate', Index: 4, isResizable: true, minWidth: 70, maxWidth: 120, isSortingRequired: true },
            {
                key: 'Attendees', name: 'Induction Candidates', fieldName: 'AttendeesEmail', Index: 5, isResizable: true, minWidth: 160, maxWidth: 320, isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.AttendeesEmail !== "" || item.ContractorEmail !== "") {
                        return (
                            <>
                                <Link className="tooltipcls">
                                    <TooltipHost content={item.AttendeesEmail || item.ContractorEmail} id={tooltipId}>
                                        {item.AttendeesEmail ? item.AttendeesEmail : item.ContractorEmail + ' (Contractor)'}
                                    </TooltipHost>
                                </Link>
                            </>
                        );
                    }
                },
            },
            {
                key: 'Chairperson', name: 'Send By', fieldName: 'Chairperson', Index: 6, isResizable: true, minWidth: 100, maxWidth: 180, isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.Chairperson.length > 0) {
                        return (
                            <>
                                {item.Chairperson[0]}
                            </>
                        );
                    }
                },
            },
            {
                key: 'SiteName', name: 'Site Name', fieldName: 'SiteName', Index: 7, isResizable: true, minWidth: 180, maxWidth: 280, isSortingRequired: true,
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
                key: 'Course', name: 'Course', fieldName: 'Course', Index: 8, isResizable: true, minWidth: 90, maxWidth: 120, isSortingRequired: true,
                onRender: ((itemID: any) => {
                    if (Spinner.current) {
                        return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                    } else {
                        if (itemID.Course !== "Not Started") {
                            return <div className="cursorPointer primaryColor">
                                <Link className="primaryColor">
                                    <TooltipHost content={itemID.CourseName} id={tooltipId}>
                                        {itemID.Course === "Completed" &&
                                            <div className="greenBadge">{itemID.Course}</div>}
                                        {itemID.Course === "Pending" &&
                                            <div className="redBadge">{itemID.Course}</div>}
                                        {itemID.Course !== "Completed" && itemID.Course !== "Pending" &&
                                            <div className="redBadge">Pending</div>}
                                    </TooltipHost>
                                </Link></div >;
                        } else {
                            if (itemID.Course === "Not Started") {
                                return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                            } else {
                                return 0;
                            }
                        }
                    }
                })
            },
            {
                key: 'Course1', name: 'Course 1', fieldName: 'Course1', Index: 9, isResizable: true, minWidth: 90, maxWidth: 120, isSortingRequired: true,
                onRender: ((itemID: any) => {
                    if (Spinner.current) {
                        return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                    } else {
                        if (itemID.Course1 !== "Not Started") {
                            return <div className="cursorPointer primaryColor">
                                <Link className="primaryColor">
                                    <TooltipHost id={tooltipId} content={itemID.CourseName1}>
                                        {itemID.Course1 === "Completed" &&
                                            <div className="greenBadge">{itemID.Course1}</div>}
                                        {itemID.Course1 === "Pending" &&
                                            <div className="redBadge">{itemID.Course1}</div>}
                                        {itemID.Course1 !== "Completed" && itemID.Course1 !== "Pending" &&
                                            <div className="redBadge">Pending</div>}
                                    </TooltipHost>
                                </Link></div >;
                        } else {
                            if (itemID.Course1 === "Not Started") {
                                return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                            } else {
                                return 0;
                            }
                        }
                    }
                })
            },
            {
                key: 'Course2', name: 'Course 2', fieldName: 'Course2', Index: 10, isResizable: true, minWidth: 90, maxWidth: 120, isSortingRequired: true,
                onRender: ((itemID: any) => {
                    if (Spinner.current) {
                        return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                    } else {
                        if (itemID.Course2 !== "Not Started") {
                            return <div className="cursorPointer primaryColor">
                                <Link className="primaryColor">
                                    <TooltipHost id={tooltipId} content={itemID.CourseName2}>
                                        {itemID.Course2 === "Completed" &&
                                            <div className="greenBadge">{itemID.Course2}</div>}
                                        {itemID.Course2 === "Pending" &&
                                            <div className="redBadge">{itemID.Course2}</div>}
                                        {itemID.Course2 !== "Completed" && itemID.Course2 !== "Pending" &&
                                            <div className="redBadge">Pending</div>}
                                    </TooltipHost>
                                </Link></div >;
                        } else {
                            if (itemID.Course1 === "Not Started") {
                                return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                            } else {
                                return 0;
                            }
                        }
                    }
                })
            },
            {
                key: 'Course3', name: 'Course 3', fieldName: 'Course3', Index: 11, isResizable: true, minWidth: 90, maxWidth: 120, isSortingRequired: true,
                onRender: ((itemID: any) => {
                    if (Spinner.current) {
                        return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                    } else {
                        if (itemID.Course3 !== "Not Started") {
                            return <div className="cursorPointer primaryColor">
                                <Link className="primaryColor">
                                    <TooltipHost id={tooltipId} content={itemID.CourseName3}>
                                        {itemID.Course3 === "Completed" &&
                                            <div className="greenBadge">{itemID.Course3}</div>}
                                        {itemID.Course3 === "Pending" &&
                                            <div className="redBadge">{itemID.Course3}</div>}
                                        {itemID.Course3 !== "Completed" && itemID.Course3 !== "Pending" &&
                                            <div className="redBadge">Pending</div>}
                                    </TooltipHost>
                                </Link></div >;
                        } else {
                            if (itemID.Course1 === "Not Started") {
                                return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                            } else {
                                return 0;
                            }
                        }
                    }
                })
            },
            {
                key: 'Course4', name: 'Course 4', fieldName: 'Course4', Index: 12, isResizable: true, minWidth: 90, maxWidth: 120, isSortingRequired: true,
                onRender: ((itemID: any) => {
                    if (Spinner.current) {
                        return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                    } else {
                        if (itemID.Course4 !== "Not Started") {
                            return <div className="cursorPointer primaryColor">
                                <Link className="primaryColor">
                                    <TooltipHost id={tooltipId} content={itemID.CourseName4}>
                                        {itemID.Course4 === "Completed" &&
                                            <div className="greenBadge">{itemID.Course4}</div>}
                                        {itemID.Course4 === "Pending" &&
                                            <div className="redBadge">{itemID.Course4}</div>}
                                        {itemID.Course4 !== "Completed" && itemID.Course4 !== "Pending" &&
                                            <div className="redBadge">Pending</div>}
                                    </TooltipHost>
                                </Link></div >;
                        } else {
                            if (itemID.Course1 === "Not Started") {
                                return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                            } else {
                                return 0;
                            }
                        }
                    }
                })
            },

            { key: 'Created', name: 'Created Date', fieldName: 'Created', Index: 14, isResizable: true, minWidth: 80, maxWidth: 150, isSortingRequired: true },

        ];
        if (props.siteName === CommonConstSiteName.SydneyShowground) {
            columns.push({
                key: 'AccreditationApply', name: 'Accreditation Apply', fieldName: 'AccreditationApply', Index: 13, isResizable: true, minWidth: 80, maxWidth: 150, isSortingRequired: false,
                onRender: (item: any) => (

                    <Toggle
                        className="formtoggle no-select"
                        checked={item.AccreditationApply}
                        onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}
                        onChange={(event, checked) => { event.stopPropagation(); event.preventDefault(); handleToggleChange(item.ID, checked) }}
                    />
                )
            },)
        }


        if (props.componentProps.siteName === CommonConstSiteName.SydneyShowground || props.componentProps.siteName === CommonConstSiteName.TheUniversityofQueensland) {
            columns.push({
                key: "InActive", name: 'Inactive', fieldName: 'ID', Index: 2, isResizable: true, minWidth: 50, maxWidth: 60,
                onRender: ((itemID: any) => {
                    return (
                        <>

                            <div className="dflex">

                                <Toggle
                                    label=""
                                    checked={itemID.InActive} // Set the default checked state
                                    onChange={(e, checked) => onToggleChange(itemID, checked)} // Pass itemID and new state
                                />
                            </div>
                        </>)
                })
            })
        }
        getDataSorted(columns, "Index")
        if (!!props.siteMasterId) {
            columns = columns.filter(item => item.key != "SiteName")
        }
        // if (props?.componentProps?.siteMasterId === 66 || props.componentProps.siteName === CommonConstSiteName.TheUniversityofQueensland) {
        if (props.componentProps.siteName === CommonConstSiteName.TheUniversityofQueensland) {
            columns = columns.filter(item => item.key != "Course")
        }

        // if (props?.componentProps?.siteMasterId !== 66 && props.componentProps.siteName !== CommonConstSiteName.TheUniversityofQueensland) {
        if (props.componentProps.siteName !== CommonConstSiteName.TheUniversityofQueensland) {
            const unwantedKeys = ["Course1", "Course2", "Course3", "Course4"];
            columns = columns.filter(item => !unwantedKeys.includes(item.key));
        }
        return columns;
    };

    const _onItemSelected = (item: any): void => {
        if (item.length > 0) {
            if (item.length == 1) {
                setIsDisplayEditButtonview(true);
                setUpdateItem(item[0]);
            } else {
                setIsDisplayEditButtonview(false);
                setUpdateItem(item);
            }
            setisDisplayEDbtn(true);
        } else {
            setUpdateItem(null);
            setisDisplayEDbtn(false);
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

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setCurrentView('card');
        } else {
            setCurrentView('grid');
        }

        let columns: any[] = [
            {
                key: "key11", name: 'Action', fieldName: 'ID', Index: 1, isResizable: true, minWidth: 70, maxWidth: 120,
                onRender: ((itemID: any) => {
                    return <>
                        <div className='dflex' onMouseDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()}>
                            <Link className="actionBtn btnView dticon no-select" onClick={(event) => {
                                event.stopPropagation();
                                event.preventDefault();
                                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                breadCrumItems.push({
                                    text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: {
                                        currentComponentName: ComponentNameEnum.DetailInduction, siteMasterId: itemID.InductionMasterId, isShowDetailOnly: true,
                                        siteName: props.componentProps.siteName, qCState: props.componentProps.qCState,
                                        breadCrumItems: breadCrumItems
                                    }
                                });
                                props.manageComponentView({
                                    currentComponentName: ComponentNameEnum.DetailInduction, MasterId: itemID.AttendeesEmailId || itemID.ContractorEmailId, dataObj: props.componentProps.dataObj, siteMasterId: itemID.InductionMasterId, originalSiteMasterId: props.siteMasterId, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState
                                });
                            }}>
                                <TooltipHost content={"View Detail"} id={tooltipId}>
                                    <FontAwesomeIcon icon="eye" />
                                </TooltipHost>
                            </Link>
                            {(currentUserRoleDetail.isAdmin || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isSiteManager || currentUserRoleDetail.isSiteSupervisor || currentUserRoleDetail.isWHSChairperson) && <Link
                                className="actionBtn btnEdit dticon"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    handleOpenPopup(itemID)
                                }}
                            >
                                <TooltipHost content={"Copy Link"} id={`tooltip_${itemID.InductionMasterId}`}>
                                    <FontAwesomeIcon icon="link" />
                                </TooltipHost>
                            </Link>}
                            <Link
                                className="actionBtn btnView dticon"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    event.preventDefault();
                                    onclickResend(itemID)
                                }}
                            >
                                <TooltipHost content={"Resend Email"}>
                                    <FontAwesomeIcon icon="paper-plane" />
                                </TooltipHost>
                            </Link>
                            {itemID.Status === "Expired" &&
                                <div><Link className="actionBtn btnDanger dticon"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        event.preventDefault();
                                        onClickExpired(itemID)
                                    }}>
                                    <TooltipHost
                                        content={"Expired"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon icon="circle-exclamation" />
                                    </TooltipHost>
                                </Link></div >}
                        </div>
                    </>;
                })
            },

            { key: 'Induction', name: 'Induction', fieldName: 'Induction', Index: 3, isResizable: true, minWidth: 60, maxWidth: 120, isSortingRequired: true },
            { key: 'InductionDate', name: 'Induction Date', fieldName: 'InductionDate', Index: 4, isResizable: true, minWidth: 70, maxWidth: 120, isSortingRequired: true },
            {
                key: 'Attendees', name: 'Induction Candidates', fieldName: 'AttendeesEmail', Index: 5, isResizable: true, minWidth: 160, maxWidth: 320, isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.AttendeesEmail !== "" || item.ContractorEmail !== "") {
                        return (
                            <>
                                <Link className="tooltipcls">
                                    <TooltipHost content={item.AttendeesEmail || item.ContractorEmail} id={tooltipId}>
                                        {item.AttendeesEmail ? item.AttendeesEmail : item.ContractorEmail + ' (Contractor)'}
                                    </TooltipHost>
                                </Link>
                            </>
                        );
                    }
                },
            },
            {
                key: 'Chairperson', name: 'Send By', fieldName: 'Chairperson', Index: 6, isResizable: true, minWidth: 100, maxWidth: 180, isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.Chairperson.length > 0) {
                        return (
                            <>
                                {item.Chairperson[0]}
                            </>
                        );
                    }
                },
            },
            {
                key: 'SiteName', name: 'Site Name', fieldName: 'SiteName', Index: 7, isResizable: true, minWidth: 180, maxWidth: 280, isSortingRequired: true,
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
                key: 'Course', name: 'Course', fieldName: 'Course', Index: 8, isResizable: true, minWidth: 90, maxWidth: 120, isSortingRequired: true,
                onRender: ((itemID: any) => {
                    if (Spinner.current) {
                        return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                    } else {
                        if (itemID.Course !== "Not Started") {
                            return <div className="cursorPointer primaryColor">
                                <Link className="primaryColor">
                                    <TooltipHost content={itemID.CourseName} id={tooltipId}>
                                        {itemID.Course === "Completed" &&
                                            <div className="greenBadge">{itemID.Course}</div>}
                                        {itemID.Course === "Pending" &&
                                            <div className="redBadge">{itemID.Course}</div>}
                                        {itemID.Course !== "Completed" && itemID.Course !== "Pending" &&
                                            <div className="redBadge">Pending</div>}
                                    </TooltipHost>
                                </Link></div >;
                        } else {
                            if (itemID.Course === "Not Started") {
                                return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                            } else {
                                return 0;
                            }
                        }
                    }
                })
            },
            {
                key: 'Course1', name: 'Course 1', fieldName: 'Course1', Index: 9, isResizable: true, minWidth: 90, maxWidth: 120, isSortingRequired: true,
                onRender: ((itemID: any) => {
                    if (Spinner.current) {
                        return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                    } else {
                        if (itemID.Course1 !== "Not Started") {
                            return <div className="cursorPointer primaryColor">
                                <Link className="primaryColor">
                                    <TooltipHost id={tooltipId} content={itemID.CourseName1}>
                                        {itemID.Course1 === "Completed" &&
                                            <div className="greenBadge">{itemID.Course1}</div>}
                                        {itemID.Course1 === "Pending" &&
                                            <div className="redBadge">{itemID.Course1}</div>}
                                        {itemID.Course1 !== "Completed" && itemID.Course1 !== "Pending" &&
                                            <div className="redBadge">Pending</div>}
                                    </TooltipHost>
                                </Link></div >;
                        } else {
                            if (itemID.Course1 === "Not Started") {
                                return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                            } else {
                                return 0;
                            }
                        }
                    }
                })
            },
            {
                key: 'Course2', name: 'Course 2', fieldName: 'Course2', Index: 10, isResizable: true, minWidth: 90, maxWidth: 120, isSortingRequired: true,
                onRender: ((itemID: any) => {
                    if (Spinner.current) {
                        return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                    } else {
                        if (itemID.Course2 !== "Not Started") {
                            return <div className="cursorPointer primaryColor">
                                <Link className="primaryColor">
                                    <TooltipHost id={tooltipId} content={itemID.CourseName2}>
                                        {itemID.Course2 === "Completed" &&
                                            <div className="greenBadge">{itemID.Course2}</div>}
                                        {itemID.Course2 === "Pending" &&
                                            <div className="redBadge">{itemID.Course2}</div>}
                                        {itemID.Course2 !== "Completed" && itemID.Course2 !== "Pending" &&
                                            <div className="redBadge">Pending</div>}
                                    </TooltipHost>
                                </Link></div >;
                        } else {
                            if (itemID.Course1 === "Not Started") {
                                return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                            } else {
                                return 0;
                            }
                        }
                    }
                })
            },
            {
                key: 'Course3', name: 'Course 3', fieldName: 'Course3', Index: 11, isResizable: true, minWidth: 90, maxWidth: 120, isSortingRequired: true,
                onRender: ((itemID: any) => {
                    if (Spinner.current) {
                        return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                    } else {
                        if (itemID.Course3 !== "Not Started") {
                            return <div className="cursorPointer primaryColor">
                                <Link className="primaryColor">
                                    <TooltipHost id={tooltipId} content={itemID.CourseName3}>
                                        {itemID.Course3 === "Completed" &&
                                            <div className="greenBadge">{itemID.Course3}</div>}
                                        {itemID.Course3 === "Pending" &&
                                            <div className="redBadge">{itemID.Course3}</div>}
                                        {itemID.Course3 !== "Completed" && itemID.Course3 !== "Pending" &&
                                            <div className="redBadge">Pending</div>}
                                    </TooltipHost>
                                </Link></div >;
                        } else {
                            if (itemID.Course1 === "Not Started") {
                                return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                            } else {
                                return 0;
                            }
                        }
                    }
                })
            },
            {
                key: 'Course4', name: 'Course 4', fieldName: 'Course4', Index: 12, isResizable: true, minWidth: 90, maxWidth: 120, isSortingRequired: true,
                onRender: ((itemID: any) => {
                    if (Spinner.current) {
                        return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                    } else {
                        if (itemID.Course4 !== "Not Started") {
                            return <div className="cursorPointer primaryColor">
                                <Link className="primaryColor">
                                    <TooltipHost id={tooltipId} content={itemID.CourseName4}>
                                        {itemID.Course4 === "Completed" &&
                                            <div className="greenBadge">{itemID.Course4}</div>}
                                        {itemID.Course4 === "Pending" &&
                                            <div className="redBadge">{itemID.Course4}</div>}
                                        {itemID.Course4 !== "Completed" && itemID.Course4 !== "Pending" &&
                                            <div className="redBadge">Pending</div>}
                                    </TooltipHost>
                                </Link></div >;
                        } else {
                            if (itemID.Course1 === "Not Started") {
                                return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                            } else {
                                return 0;
                            }
                        }
                    }
                })
            },

            { key: 'Created', name: 'Created Date', fieldName: 'Created', Index: 14, isResizable: true, minWidth: 80, maxWidth: 150, isSortingRequired: true },

        ];
        if (props.siteName === CommonConstSiteName.SydneyShowground) {
            columns.push({
                key: 'AccreditationApply', name: 'Accreditation Apply', fieldName: 'AccreditationApply', Index: 13, isResizable: true, minWidth: 80, maxWidth: 150, isSortingRequired: false,
                onRender: (item: any) => (

                    <Toggle
                        className="formtoggle no-select"
                        checked={item.AccreditationApply}
                        onClick={(event) => { event.stopPropagation(); event.preventDefault(); }}
                        onChange={(event, checked) => { event.stopPropagation(); event.preventDefault(); handleToggleChange(item.ID, checked) }}
                    />
                )
            },)
        }


        if (props.componentProps.siteName === CommonConstSiteName.SydneyShowground || props.componentProps.siteName === CommonConstSiteName.TheUniversityofQueensland) {
            columns.push({
                key: "InActive", name: 'Inactive', fieldName: 'ID', Index: 2, isResizable: true, minWidth: 50, maxWidth: 60,
                onRender: ((itemID: any) => {
                    return (
                        <>

                            <div className="dflex">

                                <Toggle
                                    label=""
                                    checked={itemID.InActive} // Set the default checked state
                                    onChange={(e, checked) => onToggleChange(itemID, checked)} // Pass itemID and new state
                                />
                            </div>
                        </>)
                })
            })
        }
        getDataSorted(columns, "Index")
        if (!!props.siteMasterId) {
            columns = columns.filter(item => item.key != "SiteName")
        }
        // if (props?.componentProps?.siteMasterId === 66 || props.componentProps.siteName === CommonConstSiteName.TheUniversityofQueensland) {
        if (props.componentProps.siteName === CommonConstSiteName.TheUniversityofQueensland) {
            columns = columns.filter(item => item.key != "Course")
        }

        // if (props?.componentProps?.siteMasterId !== 66 && props.componentProps.siteName !== CommonConstSiteName.TheUniversityofQueensland) {
        if (props.componentProps.siteName !== CommonConstSiteName.TheUniversityofQueensland) {
            const unwantedKeys = ["Course1", "Course2", "Course3", "Course4"];
            columns = columns.filter(item => !unwantedKeys.includes(item.key));
        }
        setcolumnsInduction(columns);
    }, []);


    const onclickDownload = async () => {
        try {
            let url = props.context.pageContext.web.absoluteUrl + '/Shared%20Documents/MasterFiles/Induction.xlsx';
            let fileName = "Induction";
            let downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickDownload", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    React.useEffect(() => {
        props.provider.getDocumentByURL().then((results: any[]) => {
            if (!!results) {
                let fileNameArray = results.map(item => item.FileLeafRef == "Induction.xlsx");
                for (let i = 0; i < fileNameArray.length; i++) {
                    if (fileNameArray[i] == true) {
                        setdownloadDisable(false);
                    }
                }
            }
        }).catch((error) => {
            console.log(error);
        });
        _getCourseMasterData();
        _getInductionMasterList();
        _getInductionDetailData();
        _getUserCourseInductionList();
        _getAttendeesData();

    }, []);

    const _getCourseMasterData = () => {
        try {
            const select = ["ID,IsDeleted,Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `SiteNameId eq '${props?.originalSiteMasterId}' and IsDeleted ne 1`,
                listName: ListNames.CourseMaster,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const listData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: !!data.Title ? data.Title : ''
                            }
                        );
                    });
                    if (props.componentProps.siteName === CommonConstSiteName.SydneyShowground) {
                        SydneyShowData.current = listData;
                        CourseName.current = listData[0]?.Title;
                    }
                    if (props.componentProps.siteName === CommonConstSiteName.TheUniversityofQueensland) {
                        CourseMasterData.current = listData;
                        Course1Name.current = listData[0]?.Title
                        Course2Name.current = listData[1]?.Title
                        Course3Name.current = listData[2]?.Title
                        Course4Name.current = listData[3]?.Title
                    }
                }
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);

        }
    }
    const _getAttendeesData = () => {
        try {
            const select = ["ID,AttendeesEmailId,AttendeesEmail/Email,AttendeesEmail/Id,AttendeesEmail/Title,ContractorEmailId,ContractorEmail/Email,ContractorEmail/Id,ContractorEmail/Title,AccreditationApply"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["AttendeesEmail,ContractorEmail"],
                filter: `SiteNameId eq '${props?.originalSiteMasterId}' and IsDeleted ne 1`,
                listName: ListNames.InductionDetail,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const listData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                InductionKey: !!data.InductionKey ? data.InductionKey : '',
                                AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : [],
                                ContractorEmailId: !!data.ContractorEmailId ? data.ContractorEmailId : [],
                                FullAttendees: !!data.AttendeesEmailId ? data.AttendeesEmail : !!data.ContractorEmailId ? data.ContractorEmail : [],
                                AccreditationApply: data.AccreditationApply
                            }
                        );
                    });
                    setAttendeesData(listData);
                    // setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);

        }
    }
    const _getInductionDetailData = (UserCourseInductionData?: any) => {
        try {
            let custfilter = `SiteNameId eq '${props.originalSiteMasterId}' and IsDeleted ne 1`;
            if (defaultManager !== null && defaultManager !== "" && defaultManager !== undefined) {
                custfilter += ` and ChairpersonId eq '${defaultManager}'`;
            }
            if (filterFromDate == null || filterToDate == null) {
                if (selectedItem.text === "Custom Range") {
                    // toggleHideDialog();
                } else if (selectedItem.text === "select") {
                    // No action needed as per original logic
                }
            } else if (!!filterFromDate && !!filterToDate) {
                custfilter += ` and (Created ge datetime'${filterFromDate}T00:00:00Z' and Created le datetime'${filterToDate}T23:59:59Z')`;
            }

            const select = ["ID,InductionMasterId,ChairpersonId,Chairperson/Title,InductionMaster/Title,AttendeesEmailId,AttendeesEmail/Email,AttendeesEmail/Id,AttendeesEmail/Title,ContractorEmailId,ContractorEmail/Email,ContractorEmail/Id,ContractorEmail/Title,InductionKey,Status,Created,SiteNameId,SiteName/Title,AccreditationApply,ExpiryDate,Modified,InActive"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["AttendeesEmail,SiteName,InductionMaster,Chairperson,ContractorEmail"],
                listName: ListNames.InductionDetail,
                filter: custfilter,
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const maxCourses = 4;

                    let listData = results.map((data) => {
                        const userCourses = UserCourseInductionData?.filter(
                            (course: any) => course?.InductionDetailId === data.ID
                        );

                        let courseStatus: any = {};
                        let singlecourse: any = {};

                        // Initialize CourseMasterData dynamically
                        CourseMasterData.current.slice(0, maxCourses).forEach((course: any, index: any) => {
                            courseStatus[course.Title] = "Not Found";
                        });

                        // Initialize SydneyShowData dynamically
                        SydneyShowData.current.forEach((course: any) => {
                            singlecourse[course.Title] = "Not Found";
                        });

                        userCourses?.forEach((course: any) => {
                            const totalCorrect = course.TotalCorrectAnswers || 0;
                            const totalWrong = course.TotalWrongAnswers || 0;
                            const status = (totalCorrect + totalWrong === course.TotalQuestions) ? "Completed" : "Pending";

                            if (courseStatus.hasOwnProperty(course.CourseMaster)) {
                                courseStatus[course.CourseMaster] = status;
                                Spinner.current = false;
                            }

                            if (singlecourse.hasOwnProperty(course.CourseMaster)) {
                                singlecourse[course.CourseMaster] = status;
                                Spinner.current = false;
                            }
                        });

                        const courseEntries = Object.entries(courseStatus);
                        return {
                            ID: data.ID,
                            InductionKey: data.InductionKey || '',
                            InductionMasterId: data.InductionMasterId || '',
                            Induction: data.InductionMasterId ? data.InductionMaster.Title : '',
                            AttendeesEmailId: data.AttendeesEmailId || '',
                            ContractorEmailId: !!data.ContractorEmailId ? data.ContractorEmailId : '',
                            AttendeesEmail: data.AttendeesEmailId ? data.AttendeesEmail.Title : '',
                            ContractorEmail: !!data.ContractorEmailId ? data.ContractorEmail.Title : '',
                            Candidate: data.AttendeesEmailId ? data.AttendeesEmail.Title : !!data.ContractorEmailId ? data.ContractorEmail.Title : '',
                            FullAttendees: data.AttendeesEmailId ? data.AttendeesEmail : '',
                            Status: data.Status || '',
                            SiteNameId: data.SiteNameId || '',
                            SiteName: data.SiteNameId ? data.SiteName.Title : '',
                            InductionDate: data.Created ? moment(data.Created).format(DateFormat) : '',
                            Created: data.Created ? moment(data.Created).format('DD/MM/YYYY hh:mm A') : '',
                            // FullAttendeesArray: data.AttendeesEmailId ? [data.AttendeesEmail] : [],
                            FullAttendeesArray: data.AttendeesEmailId ? [data.AttendeesEmail] : data.ContractorEmailId ? [data.ContractorEmail] : [],
                            ExpiryDate: data.ExpiryDate || '',
                            Modified: data.Modified || null,
                            ChairpersonID: data.ChairpersonId ? [data.ChairpersonId] : null,
                            Chairperson: data.ChairpersonId ? [data.Chairperson.Title] : '',
                            ChairpersonName: data.ChairpersonId ? data.Chairperson.Title : '',
                            InActive: data.InActive || false,
                            AccreditationApply: data.AccreditationApply,
                            AccreditationApplyYesNo: data.AccreditationApply ? 'Yes' : 'No',
                            InActiveYesNo: data.InActive ? 'Yes' : 'No',
                            Course: SydneyShowData.current.length > 0 ? singlecourse[SydneyShowData.current[0].Title] : "Not Found",
                            CourseName: SydneyShowData.current.length > 0 ? SydneyShowData.current[0].Title : '',
                            ...courseEntries.slice(0, maxCourses).reduce((acc: any, [key, value], index) => {
                                acc[`Course${index + 1}`] = value;
                                acc[`CourseName${index + 1}`] = key;
                                return acc;
                            }, {}),
                            TempCourse: SydneyShowData.current.length > 0 ? singlecourse[SydneyShowData.current[0].Title] : "Pending",
                            TempCourseName: SydneyShowData.current.length > 0 ? SydneyShowData.current[0].Title : '',
                            ...courseEntries.slice(0, maxCourses).reduce((acc: any, [key, value], index) => {
                                acc[`TempCourse${index + 1}`] = value;
                                acc[`TempCourseName${index + 1}`] = key;
                                return acc;
                            }, {}),
                        };
                    });

                    listData = listData?.sort((a: any, b: any) => {
                        return moment(b.Modified).diff(moment(a.Modified));
                    });

                    if (props.siteName === CommonConstSiteName.SydneyShowground) {
                        getInductionSummary(listData);
                    }
                    if (props.siteName === CommonConstSiteName.TheUniversityofQueensland) {
                        getInductionSummaryforQueens(listData);
                    }
                    setInductionDetail(listData);


                    // setToggleItems(listData);
                    if (ManagerOptions?.length === 0) {
                        //const transformData = (listData: { ChairpersonID: any; Chairperson: any }[]) => {
                        const transformData = (listData: { ChairpersonID: any; Chairperson: any }[] | null | undefined) => {
                            if (!listData || !Array.isArray(listData)) return [];
                            return listData.map((item: any) => ({
                                value: item?.ChairpersonID?.[0] ?? "",
                                key: item?.ChairpersonID?.[0] ?? "",
                                text: item?.Chairperson?.[0] ?? "",
                                label: item?.Chairperson?.[0] ?? ""
                            }));
                        };
                        let options = transformData(listData);
                        options.push({
                            value: "",
                            key: "",
                            text: "",
                            label: " --All Send By--"
                        });
                        setManagerOptions(options);
                    }
                    InductionDetailStatusData.current = listData;

                    setIsLoading(false);
                    setIsPopupOpen(true);
                }

            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);

        }
    };

    const getInductionSummary = (ListData: any) => {
        const totalInduction = ListData.length;
        const completedInduction = ListData.filter((item: any) => item.Course === "Completed").length;
        const pendingInduction = ListData.filter((item: any) => item.Course !== "Completed" && item.InActive === false && item.Status !== "Expired").length;
        const notStartedInduction = ListData.filter((item: any) =>
            item.Course !== "Pending" && item.Course !== "Completed"
        ).length;
        const expiredInduction = ListData.filter((item: any) => item.Status === "Expired").length;
        const inactiveInduction = ListData.filter((item: any) => item.InActive === true || item.InActive === "true").length;
        if (totalInduction === notStartedInduction) {
            console.log("All inductions not started");
        } else {
            setSummaryData({
                totalInduction,
                completedInduction,
                pendingInduction,
                expiredInduction,
                inactiveInduction
            });
        }
    };


    const getInductionSummaryforQueens = (ListData: any) => {
        const totalInduction = ListData.length; // Total number of induction records
        const completedInduction = ListData.filter((item: any) =>
            item.Course1 === "Completed" &&
            item.Course2 === "Completed" &&
            item.Course3 === "Completed" &&
            item.Course4 === "Completed"
        ).length;

        const pendingInduction = ListData.filter((item: any) =>
            (item.Course1 !== "Completed" ||
                item.Course2 !== "Completed" ||
                item.Course3 !== "Completed" ||
                item.Course4 !== "Completed") &&
            item.InActive === false &&
            item.Status !== "Expired"
        ).length;

        const notStartedInduction = ListData.filter((item: any) =>
            item.Course1 !== "Pending" && item.Course1 !== "Completed" &&
            item.Course2 !== "Pending" && item.Course2 !== "Completed" &&
            item.Course3 !== "Pending" && item.Course3 !== "Completed" &&
            item.Course4 !== "Pending" && item.Course4 !== "Completed"
        ).length;
        const expiredInduction = ListData.filter((item: any) => item.Status === "Expired").length;
        const inactiveInduction = ListData.filter((item: any) => item.InActive === true || item.InActive === "true").length;
        if (totalInduction === notStartedInduction) {
            console.log(); // Do nothing or handle separately
        } else {
            setSummaryData({
                totalInduction,
                completedInduction,
                pendingInduction,
                expiredInduction,
                inactiveInduction
            });
        }
    };

    const _closeDeleteConfirmation = () => {
        toggleHideDialog();
    };

    const _confirmDeleteItem = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
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
                const newObjects = processUpdateItem(UpdateItem);
                const deleteIDsArray = Array.isArray(UpdateItem)
                    ? UpdateItem.map((item: any) => item.Id || item.ID)
                    : [UpdateItem.ID || UpdateItem.Id];
                if (newObjects.length > 0) {

                    await provider.updateListItemsInBatchPnP(ListNames.InductionDetail, newObjects);
                    // await deleteCARMaster(provider, deleteIDsArray);
                    // await deleteCARMDetails(provider, deleteIDsArray);
                    // _getInductionMasterList();
                    setexcelData([]);
                    setAttendeesData([]);
                    _getAttendeesData();
                    setIsRefreshGrid(prevState => !prevState);
                    orgExcelData.current = [];
                    _getInductionDetailData();
                }

                toastService.updateLoadingWithSuccess(toastId, "Record deleted successfully!");
                toggleHideDialog();
                setisDisplayEDbtn(false);
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  _confirmDeleteItem",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_confirmDeleteItem CorrectiveActionReport"
            };
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        _getInductionMasterList();
        _getUserCourseInductionList();
        _getInductionDetailData();
    }, [isRefreshGrid, props.isReload, selectedSiteIds, defaultManager, filterToDate]);

    React.useEffect(() => {
        if (UserCourseInductionData.length > 0) {
            _getInductionDetailData(UserCourseInductionData);
        }
    }, [UserCourseInductionData]);

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
            void logGenerator(props.provider, errorObj);
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

    const getQuaycleanEmployeeList = async (emailArrayval: any, empObject: any): Promise<{ Email: any, ID: any }[]> => {
        const camlQuery = new CamlBuilder()
            .View([
                "Id",
                "Title",
                "FirstName",
                "LastName",
                "StateId",
                "State",
                "Email",
                "Phone",
                "IsDeleted"
            ])
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(5000, true)
            .Query();

        const filterFields: ICamlQueryFilter[] = [
            {
                fieldName: "IsDeleted",
                fieldValue: true,
                fieldType: FieldType.Boolean,
                LogicalType: LogicalType.NotEqualTo
            },
            {
                fieldName: "Inactive",
                fieldValue: true,
                fieldType: FieldType.Boolean,
                LogicalType: LogicalType.NotEqualTo
            }
        ];

        filterFields.push({
            fieldName: "Email",
            fieldValue: emailArrayval,
            fieldType: FieldType.Text,
            LogicalType: LogicalType.In
        });
        const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
        camlQuery.Where().All(categoriesExpressions);
        const pnpQueryOptions: IPnPCAMLQueryOptions = {
            listName: ListNames.QuaycleanEmployee,
            queryXML: camlQuery.ToString(),
            pageToken: "",
            pageLength: 100000
        }
        const localResponse = await props.provider.getItemsInBatchByCAMLQuery(pnpQueryOptions);
        const results = localResponse?.Row;
        const res = results.map((item: any) => item);
        const resEmails = new Set(res.map((item: any) => item.Email.toLowerCase()));
        // Filter Attendees whose email and title don't match
        const nonMatchingAttendees = orgExcelData.current
            .filter((attendee: any) =>
                attendee.Type === "Employee" &&
                !res.some((item: any) =>
                    item.Email.toLowerCase() === attendee.AttendeesEmail.toLowerCase() &&
                    item.Title.toLowerCase() === attendee.Attendees.toLowerCase()
                )
            )
            .map((attendee: any) => attendee.Attendees);



        nonMatchAttendees.current = orgExcelData.current
            .filter((attendee: any) =>
                attendee.Type === "Employee" &&
                !res.some((item: any) =>
                    item.Email.toLowerCase() === attendee.AttendeesEmail.toLowerCase() &&
                    item.Title.toLowerCase() === attendee.Attendees.toLowerCase()
                )
            )
            .map((attendee: any) => ({
                Email: attendee.AttendeesEmail,
                Title: attendee.Attendees
            }));

        if (nonMatchingAttendees.length > 0) {
            AttendeesValMessage.current = `Induction Candidate ${nonMatchingAttendees.join(", ")} not exist (Register), so these entries will be skipped.`;
        } else {
            AttendeesValMessage.current = "";
        }

        return res;

    };

    const getQuaycleanContractorList = async (emailArrayval: any, conObject: any): Promise<{ Email: any, ID: any }[]> => {
        const camlQuery = new CamlBuilder()
            .View([
                "Id",
                "Title",
                "FirstName",
                "LastName",
                "StateId",
                "State",
                "Email",
                "Phone",
                "IsDeleted"
            ])
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(5000, true)
            .Query();

        const filterFields: ICamlQueryFilter[] = [
            {
                fieldName: "IsDeleted",
                fieldValue: true,
                fieldType: FieldType.Boolean,
                LogicalType: LogicalType.NotEqualTo
            },
        ];

        filterFields.push({
            fieldName: "Email",
            fieldValue: emailArrayval,
            fieldType: FieldType.Text,
            LogicalType: LogicalType.In
        });
        const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
        camlQuery.Where().All(categoriesExpressions);
        const pnpQueryOptions: IPnPCAMLQueryOptions = {
            listName: ListNames.QuaycleanContractor,
            queryXML: camlQuery.ToString(),
            pageToken: "",
            pageLength: 100000
        }
        const localResponse = await props.provider.getItemsInBatchByCAMLQuery(pnpQueryOptions);
        const results = localResponse?.Row;
        const res = results.map((item: any) => item);
        // Filter Attendees whose email and title don't match
        const nonMatchingAttendees = orgExcelData.current
            .filter((attendee: any) =>
                attendee.Type === "Contractor" &&
                !res.some((item: any) =>
                    item.Email.toLowerCase() === attendee.AttendeesEmail.toLowerCase() &&
                    item.Title.toLowerCase() === attendee.Attendees.toLowerCase()
                )
            )
            .map((attendee: any) => attendee.Attendees);

        nonMatchContractor.current = orgExcelData.current
            .filter((attendee: any) =>
                attendee.Type === "Contractor" &&
                !res.some((item: any) =>
                    item.Email.toLowerCase() === attendee.AttendeesEmail.toLowerCase() &&
                    item.Title.toLowerCase() === attendee.Attendees.toLowerCase()
                )
            )
            .map((attendee: any) => ({
                Email: attendee.AttendeesEmail,
                Title: attendee.Attendees
            }));


        if (nonMatchingAttendees.length > 0) {
            ContractorValMessage.current = `Induction Contractor ${nonMatchingAttendees.join(", ")} not exist (Register), so these entries will be skipped.`;
        } else {
            ContractorValMessage.current = "";
        }

        return res;

    };

    const createNewDataObject = async (
        Data: any[],
        emailArray: any[]
    ) => {
        const empObject = Data
            .filter(({ Type }) => Type === "Employee") // Filter only Employee type
            .map(({ AttendeesEmail, Attendees }) => ({
                Email: AttendeesEmail,
                Name: Attendees
            }));
        const conObject = Data
            .filter(({ Type }) => Type === "Contractor") // Filter only Employee type
            .map(({ AttendeesEmail, Attendees }) => ({
                Email: AttendeesEmail,
                Name: Attendees
            }));

        const empArray = Data.filter((item: any) => item.Type === "Employee")
            .map((item: any) => item.AttendeesEmail);

        const conArray = Data.filter((item: any) => item.Type === "Contractor")
            .map((item: any) => item.AttendeesEmail);

        let EmpData = await getQuaycleanEmployeeList(empArray, empObject);
        let ConData = await getQuaycleanContractorList(conArray, conObject);

        // setexcelData(excelData);
        const formattedDate = moment().format('DD-MM-YYYY');
        const MeetingDate = moment(formattedDate, DateFormat).toDate();
        const chairpersonIds: string[] = [];
        // Use Promise.all to wait for all async operations inside map
        const newData = await Promise.all(Data.map(async (item) => {

            const matchedEmployee = EmpData.find(
                (emp: any) => emp.Email === item.AttendeesEmail && emp.Title.toLowerCase() === item.Attendees.toLowerCase()
            );

            const matchedContractor = ConData.find(
                (emp: any) => emp.Email === item.AttendeesEmail && emp.Title.toLowerCase() === item.Attendees.toLowerCase()
            );

            const generateGenId = (): string => {
                const timestamp = Date.now().toString().slice(-5); // Get last 5 digits of timestamp
                const randomPart = Math.floor(Math.random() * 90000 + 10000).toString(); // Generate a 5-digit random number
                const uniquePart = (parseInt(timestamp) + parseInt(randomPart)).toString().slice(-6); // Ensure 6 digits
                const paddedUniquePart = uniquePart.padStart(6, '0'); // Ensure 6 digits with leading zeros if needed
                return `IND-${paddedUniquePart}`;
            };

            // Usage inside a loop
            const GenIds = Array.from({ length: 1 }, () => generateGenId()); // Example: Generate 5 unique GenIds
            let curUser = await provider.getUserIdByEmail(item.ChairpersonId);
            if (curUser === undefined || curUser === 0) {
                chairpersonIds.push(item.ChairpersonId);
            }
            undefineChairperson.current = chairpersonIds;

            return {
                Attendees: item.Attendees,
                ChairpersonId: Number(curUser),
                Title: GenIds[0],
                InductionID: GenIds[0],
                InductionDate: MeetingDate,
                IsSendEmail: true,
                SiteNameId: Number(props?.originalSiteMasterId),
                ...(item.Type === "Contractor"
                    ? { ContractorEmailId: matchedContractor ? [Number(matchedContractor?.ID)] : null }
                    : { AttendeesEmailId: matchedEmployee ? [Number(matchedEmployee?.ID)] : null })
            };

        }));

        return newData;  // This will be an array of resolved objects, not promises
    };

    const handleFileUpload = (event: any) => {
        try {
            let errorobj: any[] = [];
            const file: any = event;
            const reader = new FileReader();
            reader.onload = async (e: any) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                let dataJSONHeaderChek: any[] = XLSX.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0];
                const expectedColumnNames = ['AttendeesEmail', 'Attendees', 'ChairpersonId'];
                let isColumnsValid = true;


                for (let index = 0; index < expectedColumnNames.length; index++) {
                    isColumnsValid = dataJSONHeaderChek.indexOf(expectedColumnNames[index]) >= 0;
                    if (!isColumnsValid) {
                        errorobj.push(expectedColumnNames[index]);
                    }
                }
                //  let dataJSONHeaderChek: any[] = XLSX.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0];
                const excelData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
                if (errorobj.length == 0) {
                    orgExcelData.current = excelData
                    const emailArray = excelData.map((item: any) => item.AttendeesEmail);

                    const result = await createNewDataObject(excelData, emailArray);
                    setexcelData(result);

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
            void logGenerator(props.provider, errorObj);
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
            void logGenerator(props.provider, errorObj);
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
            void logGenerator(props.provider, errorObj);
        }
    };

    const removeFile = async (id: number | string) => {
        try {
            const newFiles = state.mdlConfigurationFile.filter((file: IFileWithBlob) => file.key != id);
            setState((prevState: any) => ({ ...prevState, mdlConfigurationFile: newFiles }));
        } catch (error) {
            const errorObj = { ErrorMethodName: "removeFile", CustomErrormessage: "removeFile", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const filterExcelData = (excelData: any[], AttendeesData: any[], orgExcelData: any[]) => {
        const removedAttendees: string[] = [];
        const attendeeNotFound: string[] = [];
        const removedContractors: string[] = [];
        const contractorNotFound: string[] = [];

        let filteredExcelData = excelData.filter((item) => {
            if (item?.ChairpersonId === "0") {
                return false;
            }
            const emailId = item?.AttendeesEmailId?.[0] ?? item?.ContractorEmailId?.[0] ?? "";
            if (!emailId) {
                if (item?.AttendeesEmailId?.length) {
                    attendeeNotFound.push(item.Attendees);
                } else {
                    contractorNotFound.push(item.Attendees);
                }
                return false;
            }
            const isMatch = AttendeesData.some(
                (attendee) => attendee.AttendeesEmailId === emailId || attendee.ContractorEmailId === emailId
            );

            if (isMatch) {
                if (item?.AttendeesEmailId?.length) {
                    removedAttendees.push(item.Attendees);
                } else {
                    removedContractors.push(item.Attendees);
                }
            }
            return !isMatch;
        });

        filteredExcelData = filteredExcelData.filter((item) => item.ChairpersonId !== 0);

        const filteredOrgExcelData = orgExcelData
            .filter((item) => {

                if (item.Type === "Employee") {
                    return (
                        removedAttendees.includes(item.Attendees) ||
                        (Array.isArray(nonMatchAttendees.current) &&
                            nonMatchAttendees.current.some(
                                (attendee: any) =>
                                    attendee.Email === item.AttendeesEmail &&
                                    attendee.Title === item.Attendees
                            )) ||
                        (undefineChairperson.current ?? []).includes(item.ChairpersonId)
                    );
                } else if (item.Type === "Contractor") {
                    return (
                        removedContractors.includes(item.Attendees) ||
                        (Array.isArray(nonMatchContractor.current) &&
                            nonMatchContractor.current.some(
                                (contractor: any) =>
                                    contractor.Email === item.AttendeesEmail &&
                                    contractor.Title === item.Attendees
                            )) ||
                        (undefineChairperson.current ?? []).includes(item.ChairpersonId)
                    );
                }

                return false;
            })
            .map((item) => {
                let notes = "";
                if (item.Type === "Employee") {
                    if (removedAttendees.includes(item.Attendees)) {
                        notes = "Attendees already exist";
                    } else if (
                        Array.isArray(nonMatchAttendees.current) &&
                        nonMatchAttendees.current.some(
                            (attendee: any) =>
                                attendee.Email === item.AttendeesEmail &&
                                attendee.Title === item.Attendees
                        )
                    ) {
                        notes = "Attendees not found";
                    } else if ((undefineChairperson.current ?? []).includes(item.ChairpersonId)) {
                        notes = "Chairperson not found";
                    }
                } else if (item.Type === "Contractor") {
                    if (removedContractors.includes(item.Attendees)) {
                        notes = "Contractor already exists";
                    } else if (
                        Array.isArray(nonMatchContractor.current) &&
                        nonMatchContractor.current.some(
                            (contractor: any) =>
                                contractor.Email === item.AttendeesEmail &&
                                contractor.Title === item.Attendees
                        )
                    ) {
                        notes = "Contractor not found";
                    } else if ((undefineChairperson.current ?? []).includes(item.ChairpersonId)) {
                        notes = "Chairperson not found";
                    }
                }


                return notes ? { ...item, Notes: notes } : item;
            });


        if (undefineChairperson.current.length > 0) {
            ChairpersonValMessage.current = `Chairperson email ${undefineChairperson.current.join(", ")} not exist or do not have permission, so these entries will be skipped.`;
        } else {
            ChairpersonValMessage.current = "";
        }

        return {
            filteredExcelData,
            filteredOrgExcelData,
            removedAttendees,
            attendeeNotFound,
            removedContractors,
            contractorNotFound
        };
    };

    const onSaveFiles = () => {
        setIsLoading(true);
        try {
            if (!!excelData && excelData.length > 0) {
                const toastMessage = 'Record Insert successfully!';
                const toastId = toastService.loading('Loading...');
                const BATCH_SIZE = 25; // Control the number of concurrent uploads

                const { filteredExcelData, filteredOrgExcelData, removedAttendees, attendeeNotFound } = filterExcelData(excelData, AttendeesData, orgExcelData.current);
                if (filteredOrgExcelData.length > 0) {
                    try {
                        let exportColumns: IExportColumns[] = [
                            {
                                header: "AttendeesEmail",
                                key: "AttendeesEmail"
                            },
                            {
                                header: "Attendees",
                                key: "Attendees"
                            },
                            {
                                header: "ChairpersonId",
                                key: "ChairpersonId"
                            },
                            {
                                header: "Error Message",
                                key: "Notes"
                            },
                        ];
                        generateExcelTable(filteredOrgExcelData, exportColumns, `Skipped Induction Entries.xlsx`);
                    } catch (error) {
                        const errorObj = { ErrorMethodName: "onclickExportToExcel", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                        void logGenerator(props.provider, errorObj);
                        setIsLoading(false);
                    }
                }
                let valmessage: any = "";
                if (removedAttendees.length > 0) {
                    valmessage = `Induction Candidate or Contractor ${removedAttendees.join(", ")} already exist, so these entries will be skipped.`;
                    setValMessage(valmessage);
                } else {
                    valmessage = "";
                    setValMessage("");
                }
                try {
                    props.provider.createItemInBatch(filteredExcelData, ListNames.InductionMaster).then(async (results: any) => {
                        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
                        const generateUniqueKey = (): string => {
                            const timestamp = Date.now().toString(36); // Convert timestamp to base36
                            const randomStr = Math.random().toString(36).substring(2, 8); // Generate random string
                            return (timestamp + randomStr).substring(0, 12).toUpperCase(); // Ensure it's 12 chars
                        };

                        // Create new array of objects dynamically
                        const newData = results.map((it: any) => {
                            const data = it.data;
                            return {
                                InductionMasterId: data.ID,
                                SiteNameId: props?.originalSiteMasterId,
                                InductionKey: generateUniqueKey(),
                                ChairpersonId: data.ChairpersonId,
                                ExpiryDate: moment().add(1, "months").toISOString(),
                                ...(data.AttendeesEmailId.length > 0
                                    ? { AttendeesEmailId: data.AttendeesEmailId[0] }
                                    : { ContractorEmailId: data.ContractorEmailId[0] })
                            };

                        });
                        props.provider.createItemInBatch(newData, ListNames.InductionDetail).then(async (res: any) => {
                            setexcelData([]);
                            setAttendeesData([]);
                            _getAttendeesData();
                            setIsRefreshGrid(prevState => !prevState);
                            orgExcelData.current = [];
                        })
                        setIsLoading(false);
                        toastService.updateLoadingWithSuccess(toastId, toastMessage);
                        if (valmessage !== "" || AttendeesValMessage.current !== "" || ChairpersonValMessage.current !== "" || ContractorValMessage.current !== "") {
                            showPopup3();
                        }

                        setState((prevState: any) => ({ ...prevState, isReload: !state.isReload }));
                    });
                } catch (error) {
                    console.error("Error creating items in batch:", error);
                    setIsLoading(false);
                }
            } else {
                setIsLoading(false);
                setnotFoundDialog(true);
                setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "onSaveFiles", CustomErrormessage: "error in save file data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const DranAndDrop = <>
        <DragAndDrop
            provider={props.provider}
            files={state.mdlConfigurationFile}
            handleChange={(e: any) => handleChange(e)}
            removeFile={removeFile}
            handleDrop={(e: any) => handleDrop(e)}
            onCancel={onCancel}
            onSaveFiles={onSaveFiles}
            isMultiple={false}
        />
    </>;

    const onclickExportToExcel = async () => {
        try {
            let exportColumns: IExportColumns[] = [
                { header: "Induction", key: "Induction" },
                { header: "Induction Date", key: "InductionDate" },
                { header: "Induction Candidates", key: "Candidate" },
                { header: "Send By", key: "ChairpersonName" },
                { header: "Site Name", key: "SiteName" },
                { header: "Created Date", key: "Created" },
                { header: "Accreditation Apply", key: "AccreditationApplyYesNo" },
                { header: `Course (${CourseName.current})`, key: "Course" },
                { header: `Course 1(${Course1Name.current})`, key: "Course1" },
                { header: `Course 2(${Course2Name.current})`, key: "Course2" },
                { header: `Course 3(${Course3Name.current})`, key: "Course3" },
                { header: `Course 4(${Course4Name.current})`, key: "Course4" },
                { header: "Inactive", key: "InActiveYesNo" }
            ];

            // Filter out specific columns based on site name
            if (props.siteName === CommonConstSiteName.SydneyShowground) {
                exportColumns = exportColumns.filter(col =>
                    !["Course1", "Course2", "Course3", "Course4"].includes(col.key)
                );
            } else if (props.siteName === CommonConstSiteName.TheUniversityofQueensland) {
                exportColumns = exportColumns.filter(col =>
                    !["Course", "AccreditationApplyYesNo"].includes(col.key)
                );
            }

            // Replace "Not Found" with "Pending" for Course1, Course2, Course3, and Course4
            const updatedData = FilteredData.map((item: any) => ({
                ...item,
                Course: item.Course === "Not Found" ? "Pending" : item.Course,
                Course1: item.Course1 === "Not Found" ? "Pending" : item.Course1,
                Course2: item.Course2 === "Not Found" ? "Pending" : item.Course2,
                Course3: item.Course3 === "Not Found" ? "Pending" : item.Course3,
                Course4: item.Course4 === "Not Found" ? "Pending" : item.Course4
            }));

            generateExcelTable(updatedData, exportColumns, `${props.siteName} - Induction.xlsx`);
        } catch (error) {
            const errorObj = {
                ErrorMethodName: "onclickExportToExcel",
                CustomErrormessage: "error in download",
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                PageName: "QuayClean.aspx"
            };
            void logGenerator(props.provider, errorObj);
        }
    };



    React.useEffect(() => {
        const filterList = () => {
            let filteredList = InductionDetail;

            // Define course fields based on siteName
            const courseKeys =
                props.siteName === CommonConstSiteName.SydneyShowground
                    ? ["Course"]
                    : props.siteName === CommonConstSiteName.TheUniversityofQueensland
                        ? ["Course1", "Course2", "Course3", "Course4"]
                        : [];

            if (filterType === "Total Induction") {
                filteredList = InductionDetail;
            } else if (filterType === "Completed Induction") {
                filteredList = InductionDetail.filter((item: any) =>
                    courseKeys.every((course) => item[course] === "Completed")
                );
            } else if (filterType === "Pending Induction") {
                filteredList = InductionDetail.filter((item: any) =>
                    courseKeys.some((course) => item[course] !== "Completed" && item.InActive === false && item.Status !== "Expired")
                );

                // const pendingInduction = ListData.filter((item: any) =>
                //     (item.Course1 !== "Completed" ||
                //         item.Course2 !== "Completed" ||
                //         item.Course3 !== "Completed" ||
                //         item.Course4 !== "Completed") &&
                //     item.InActive === false &&
                //     item.Status !== "Expired"
                // ).length;
            } else if (filterType === "Inactive Induction") {
                filteredList = InductionDetail.filter((item: any) => item.InActive === true || item.InActive === "true");
            } else if (filterType === "Expired Induction") {
                filteredList = InductionDetail.filter((item: any) => item.Status === "Expired");
            }
            setFilteredData(filteredList);

        };


        (async () => {
            setIsLoading(true);
            await filterList();
            setIsLoading(false);// Set filtered data to state
        })()
    }, [InductionDetail, filterType, props.siteName]);

    return <>
        {isLoading && <Loader />}

        {
            state.isUploadModelOpen &&
            <CustomModal dialogWidth="900px" isModalOpenProps={state.isUploadModelOpen} setModalpopUpFalse={onClickCloseModel} subject={"Upload"} message={DranAndDrop}
                closeButtonText={""} />
        }

        {popupData && InductionDetailData.current.length > 0 && (
            <CopyIMSLink
                isOpen={isPopupOpen}
                closePopup={handleClosePopup}
                Data={popupData}
                provider={props.provider}
                InductionMasterData={InductionDetailData.current}
                Context={context}
                Page="Induction"
                PageId="InductionDetailId"
            />
        )}

        {
            isPopupVisible3 && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup3}>
                        <Overlay onClick={hidePopup3} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles.content}>
                                <h2 className="mt-10">Warning</h2>
                                <div className="mt-3">
                                    <ul>
                                        {ValMessage !== "" && <li className="val-m">
                                            <FontAwesomeIcon icon="circle" className="val-icon" /> {`Some Induction Candidate already exist, so these entries will be skipped.`}
                                        </li>}
                                        {AttendeesValMessage.current !== "" && <li className="val-m">
                                            <FontAwesomeIcon icon="circle" className="val-icon" /> {`Some Induction Candidate not exist (Register), so these entries will be skipped.`}
                                        </li>}
                                        {ContractorValMessage.current !== "" && <li className="val-m">
                                            <FontAwesomeIcon icon="circle" className="val-icon" /> {`Some Induction Contractor not exist (Register), so these entries will be skipped.`}
                                        </li>}
                                        {ChairpersonValMessage.current !== "" && <li className="val-m">
                                            <FontAwesomeIcon icon="circle" className="val-icon" /> {`Some Chairperson email not exist or do not have permission, so these entries will be skipped.`}
                                        </li>}

                                    </ul></div>
                                <div className="mt-3"><b>Note:-</b> Skilled entries file downloaded automatically.</div>
                                <DialogFooter>
                                    <PrimaryButton text="Ok" className='mrt15 css-b62m3t-container btn btn-primary' onClick={onClickNo} />
                                </DialogFooter>
                            </Popup>
                        </FocusTrapZone>
                    </Popup>
                </Layer>
            )
        }

        {
            isPopupVisible2 && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup2}>
                        <Overlay onClick={hidePopup2} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles.content}>
                                <h2 className="mt-10">Confirmation</h2>
                                <div className="mt-3">
                                    Are you sure want to send this link?</div>
                                <DialogFooter>
                                    <PrimaryButton text="Yes" onClick={onClickYes} className='mrt15 css-b62m3t-container btn btn-primary' />
                                    <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNo} />
                                </DialogFooter>
                            </Popup>
                        </FocusTrapZone>
                    </Popup>
                </Layer>
            )
        }

        <CustomModal isModalOpenProps={hideDialog}
            setModalpopUpFalse={_closeDeleteConfirmation}
            subject={"Delete Item"}
            message={'Are you sure, you want to delete this record?'}
            yesButtonText="Yes"
            closeButtonText={"No"}
            onClickOfYes={_confirmDeleteItem} />

        <InductionCountCard data={SummaryData} handleCardClick={handleCardClick} />
        <div className="ms-Grid mt-3">
            <div className="ms-Grid-row ptop-5">
                {ManagerOptions &&
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                        <div className="formControl ims-site-pad">
                            <div className="formControl">
                                <ReactDropdown
                                    options={ManagerOptions} isMultiSelect={false}
                                    defaultOption={defaultManager || selectedManager}
                                    onChange={_onManagerChange}
                                    placeholder={"Select Send By"} />
                            </div>
                        </div>
                    </div>}

                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                    <div className="formControl ims-site-pad">
                        <div className="formControl">
                            <PreDateRangeFilter
                                fromDate={fromDate}
                                toDate={toDate}
                                onFromDateChange={onChangeFromDate}
                                onToDateChange={onChangeToDate}
                                onChangeRangeOption={onChangeRangeOption}
                            />
                        </div>
                    </div>
                </div>
                {!props.siteMasterId && <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                    <div className="formControl ims-site-pad">
                        <div className="formControl">
                            <MultipleSiteFilter
                                isPermissionFiter={true}
                                loginUserRoleDetails={currentUserRoleDetail}
                                selectedSiteIds={selectedSiteIds}
                                selectedSiteTitles={selectedSiteTitles}
                                selectedSCSite={selectedSCSites}
                                onSiteChange={handleSiteChange}
                                provider={provider}
                                isRequired={true}// Pass the reset state
                                AllOption={true} />
                        </div>
                    </div>
                </div>}
            </div>
        </div>
        <div className="boxCardq">
            <div className="formGroup">
                <div className="mt-2">
                    {showResendMessage && (
                        <MessageBar messageBarType={MessageBarType.success}>
                            <div className="inputText">Email resend successfully!</div>
                        </MessageBar>
                    )}
                </div>
                {currentView === "grid" ? <>
                    <MemoizedDetailList
                        manageComponentView={props.manageComponentView}
                        columns={columnsInduction}
                        items={FilteredData || []}
                        reRenderComponent={true}
                        onSelectedItem={_onItemSelected}
                        searchable={true}
                        CustomselectionMode={
                            (!!props.siteMasterId &&
                                (!!PermissionArray && PermissionArray?.includes('Quaysafe') || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0 || currentUserRoleDetail.isStateManager))
                                ? SelectionMode.multiple
                                : SelectionMode.none
                        }
                        addEDButton={<>
                            <div className='dflex'>
                                {isDisplayEDbtn && <>
                                    <div className='dflex'>
                                        {/* {isDisplayEditButtonview && <Link className="actionBtn iconSize btnEdit " onClick={onclickEdit}>
                                        <TooltipHost content={"Edit Detail"} id={tooltipId}>
                                            <FontAwesomeIcon icon="edit" />
                                        </TooltipHost>
                                    </Link>} */}
                                        <Link className="actionBtn iconSize btnDanger  ml-10" onClick={onclickconfirmdelete}>
                                            <TooltipHost content={"Delete"} id={tooltipId}>
                                                <FontAwesomeIcon icon="trash-alt" />
                                            </TooltipHost>
                                        </Link>
                                    </div>
                                </>}
                                <Link className="actionBtn iconSize btnEdit ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                    text="">
                                    <TooltipHost
                                        content={"Export to excel"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon
                                            icon={"file-excel"}
                                        />
                                    </TooltipHost>
                                </Link>
                                {downloadDisable ?
                                    <Link className="actionBtn iconSize btnInfo ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                        text="">
                                        <TooltipHost
                                            content={"Sample Excel File Not Available"}
                                            id={tooltipId}
                                        >
                                            {/* {isVisibleCrud.current && <FontAwesomeIcon
                                                icon={"download"}
                                            />} */}
                                            <FontAwesomeIcon
                                                icon={"download"}
                                            />
                                        </TooltipHost></Link> :

                                    <>
                                        <Link className="actionBtn iconSize disable btnMove ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                            text="">
                                            <TooltipHost
                                                content={"Download Sample Excel File"}
                                                id={tooltipId}
                                            >
                                                <FontAwesomeIcon
                                                    icon={"download"}
                                                />
                                            </TooltipHost>   </Link>
                                    </>
                                }

                                <Link className="actionBtn iconSize btnDanger ml-10 dticon" style={{ paddingBottom: "2px" }} onClick={onclickUpload}
                                    text="">
                                    <TooltipHost
                                        content={"Upload Excel File"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon
                                            icon={"upload"}
                                        />
                                    </TooltipHost>    </Link>
                            </div>
                        </>}
                        isAddNew={true}
                        addNewContent={
                            <>
                                <div className="dflex">
                                    <Link className="actionBtn iconSize btnRefresh icon-mr" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                        text="">
                                        <TooltipHost
                                            content={"Refresh Grid"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon
                                                icon={"arrows-rotate"}
                                            />
                                        </TooltipHost>    </Link>
                                    {props.siteMasterId && (!!PermissionArray && PermissionArray?.includes('Quaysafe') || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0 || currentUserRoleDetail.isStateManager) &&
                                        <PrimaryButton text="Add" className="btn btn-primary "
                                            onClick={() => {
                                                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                                breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddInduction, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddInduction, isAddClient: true, breadCrumItems: breadCrumItems } });
                                                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddInduction, siteName: props?.componentProps?.siteName, dataObj: props.componentProps.dataObj, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId });
                                                setIsLoading(false);
                                            }}
                                        />}
                                </div>
                            </>
                        } />
                </> :
                    <>
                        <div className="dflex btn-back-ml">
                            {props.siteMasterId && (currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0 || currentUserRoleDetail.isStateManager) &&
                                <PrimaryButton text="Add" className="btn btn-primary margin-sm-add"
                                    onClick={() => {
                                        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                        breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddInduction, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddInduction, isAddClient: true, breadCrumItems: breadCrumItems } });
                                        props.manageComponentView({ currentComponentName: ComponentNameEnum.AddInduction, siteName: props?.componentProps?.siteName, dataObj: props.componentProps.dataObj, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId });
                                        setIsLoading(false);
                                    }}
                                />}
                            <Link className="actionBtn iconSize btnRefresh icon-mr" style={{ paddingBottom: "2px", marginLeft: "1px" }} onClick={onclickRefreshGrid}
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
                        {/* <CorrectiveActionCardView
                            items={InductionData}
                            isTabView={false}
                            viewType={'card'}
                            manageComponentView={props.manageComponentView}
                            isEditDelete={!!props?.siteMasterId ? true : false}
                            _onclickEdit={onclickEdit}
                            _onclickconfirmdelete={onclickconfirmdelete}
                            IMSsiteMasterId={props.siteMasterId || undefined}
                        /> */}

                    </>
                }
            </div>
        </div>
        {
            isPopupVisible4 && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup4}>
                        <Overlay onClick={hidePopup4} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles.content}>
                                <h2 className="mt-10">Confirmation</h2>
                                <div className="mt-3">
                                    {InActiveMessage.current == "Inactive" ? "Are you sure you want to disable induction" : "Are you sure you want to enable induction"}</div>
                                <DialogFooter>
                                    <PrimaryButton text="Yes" onClick={onClickYesCheckBox} className='mrt15 css-b62m3t-container btn btn-primary' />
                                    <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNo} />
                                </DialogFooter>
                            </Popup>
                        </FocusTrapZone>
                    </Popup>
                </Layer>
            )
        }
    </>;
};