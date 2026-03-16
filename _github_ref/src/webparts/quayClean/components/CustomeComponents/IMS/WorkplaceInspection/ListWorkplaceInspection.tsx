/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { IColumn, IDropdownOption, Link, PrimaryButton, SelectionMode, TooltipHost } from "@fluentui/react";
import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComponentNameEnum, ListNames, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { _siteDataUtil, deleteWICMaster, deleteWICMDetails, generateExcelTable, getCAMLQueryFilterExpression, logGenerator, mapSingleValue, onBreadcrumbItemClicked, UserActivityLog } from "../../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
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
import { WorkplaceCardView } from "../CardView/WorkplaceCardView";
import { MultipleSiteFilter } from "../../../../../../Common/Filter/MultipleSiteFilter";
import { CopyIMSLink } from "../../../../../../Common/CopyIMSLink";
import { ActionMeta } from "react-select";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { WorkplaceInspectionCountCard } from "./WorkplaceInspectionCountCard";
import { IExportColumns } from "../../EquipmentChecklist/Question";
import { DataType, DateFormat } from "../../../../../../Common/Constants/CommonConstants";
import { SendEmailIMS } from "../../../../../../Common/SendEmailIMS";
import { IMSLocationFilter } from "../../../../../../Common/Filter/IMSLocationFilter";
import { PreDateRangeFilterQuaySafe } from "../../../../../../Common/Filter/PreDateRangeFilterQuaySafe";
import { FieldType, LogicalType } from "../../../../../../Common/Constants/DocumentConstants";
import CamlBuilder from "camljs";
import ProgressBarWithTooltip from "../../../../../../Common/ProgressBarWithTooltip";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import TabMenu from "../../../CommonComponents/TabMenu";
import { IReactDropOptionProps } from "../../../CommonComponents/reactSelect/IReactDropOptionProps";
import { IMSAttendeesFilter } from "../../../../../../Common/Filter/IMSAttendeesFilter";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
import { formatSPDateToLocal } from "../../../CommonComponents/CommonMethods";

export const ListWorkplaceInspection: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const appSiteState = useAtomValue(appSiteStateAtom);
    const { PermissionArray } = appSiteState;
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [GridData, setGridData] = React.useState<any[]>([]);
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const AllMasterData = React.useRef<any[]>([]);
    const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : 'grid');
    const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>([]);
    const [isPopupOpen, setIsPopupOpen] = React.useState(false);
    const [popupData, setPopupData] = React.useState<any>(null);
    const [isSendEmailPopupOpen, setIsSendEmailPopupOpen] = React.useState(false);
    const [showCopyDialog, setShowCopyDialog] = React.useState(false);
    const [copyRecordItem, setCopyRecordItem] = React.useState<any>();
    const [ManagerOptions, setManagerOptions] = React.useState<IDropdownOption[]>([]);
    const [defaultManager, setDefaultManager] = React.useState<any>(null);
    const [selectedManager, setSelectedManager] = React.useState<any>(null);
    const [FilteredData, setFilteredData] = React.useState<any>([]);
    const [SummaryData, setSummaryData] = React.useState<any>([]);
    const [selectedLocation, setSelectedLocation] = React.useState<any[]>([]);
    const [filterType, setFilterType] = React.useState<any>("");
    const [fromDate, setFromDate] = React.useState<Date | any>();
    const [toDate, setToDate] = React.useState<Date | any>();
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);
    const [filterFromDate, setFilterFromDate] = React.useState<any>(undefined);
    const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>([]);
    const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>([]);
    const [shouldRefreshOptions, setShouldRefreshOptions] = React.useState(true);
    const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: 'Top 30 Records', text: 'Top 30 Records' });
    const [TotalCount, setTotalCount] = React.useState<any>(0);
    const [stateTabData, setStateTabData] = React.useState<any>([]);
    const [stateCountData, setStateCountData] = React.useState<any>();
    const [selectedStateId, setSelectedStateId] = React.useState<any[]>([]);
    const [attendeesOptions, setAttendeesOptions] = React.useState<IReactDropOptionProps[]>([]);
    const [selectedAttendees, setSelectedAttendees] = React.useState<IReactDropOptionProps>("" as any)
    let siteData = React.useRef<any>([]);

    React.useEffect(() => {
        if (stateCountData != undefined) {
            const countLookup = Object.fromEntries(stateCountData.map((item: any) => [Number(item.Id), item.Count]));
            let stateItems: any[] = currentUserRoleDetail.stateMasterItems;
            const { isAdmin, isSiteManager, isStateManager, isSiteSupervisor, isUser, isWHSChairperson } = currentUserRoleDetail
            if (isAdmin || isSiteManager || isStateManager || isSiteSupervisor || isUser) {
                stateItems = currentUserRoleDetail.stateMasterItems;
            } else if (isWHSChairperson) {
                stateItems = currentUserRoleDetail.stateMasterItems.filter(r => currentUserRoleDetail.whsChairpersonsStateId.includes(r.ID))
            }
            const stateData = stateItems.map((title: any) => ({
                Id: title.Id,
                Count: countLookup[title.Id] || 0,
                Title: title.Title
            }));
            setStateTabData(stateData);
        }
    }, [stateCountData]);

    const onChangeRangeOption = (item: IDropdownOption): void => {
        setSelectedItem(item);
        setShouldRefreshOptions(true);
    };
    const onChangeToDate = (filterDate: any, date?: Date) => {
        setFilterToDate(filterDate);
        setToDate(date);
    };
    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setFromDate(date);
        setFilterFromDate(filterDate);
    };


    const onChangeAttendeesFilter = (value: IReactDropOptionProps) => {
        if (!!value) {
            setSelectedAttendees(value)
        } else {
            setSelectedAttendees("" as any)
        }
    }


    const handleCardClick = (title: string | null) => {
        if (title) {
            setFilterType(title);
        } else {
            setFilterType("");
        }
    };
    const _onManagerChange = (option: any, actionMeta: ActionMeta<any>): void => {
        setSelectedManager(option?.text);
        setDefaultManager(option?.value);
    };

    const onChangeLocationFilter = (value: any) => {
        if (!!value && value.length > 0) {
            let items: any[] = value.map((i: any) => i.value)
            setSelectedLocation(items)
        } else {
            setSelectedLocation([])
        }
    }

    const handleOpenPopup = (item: any) => {
        setPopupData(item); // Pass item data to popup
        setIsPopupOpen(true); // Open popup
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false); // Close popup
        setPopupData(null); // Clear data
    };
    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSiteIds(siteIds);
        setSelectedSiteTitles(siteTitles);
        setSelectedSCSites(siteSC);
    };

    const onClickSendEmail = async (item: any) => {

        setPopupData(item)
        setIsSendEmailPopupOpen(true);
    }

    const handleCloseSendEmail = () => {
        setPopupData(null)
        setIsSendEmailPopupOpen(false);
        setIsRefreshGrid(prevState => !prevState);
    }


    const closeCopyDialog = () => {
        setShowCopyDialog(false);
    }
    const onClickCopyRecordYes = () => {
        onClickCopy(copyRecordItem)
    }

    const genrateAttendeesOptions = (data: any[]) => {
        let attendeesOptions: IReactDropOptionProps[] = [];
        if (data.length > 0) {
            let attendees = data.map(r => r.FullAttendeesArray).flat()
            if (attendees.length > 0) {
                const uniqueAttendees = Array.from(
                    new Map(attendees.map(item => [item.Id, item])).values()
                );
                if (uniqueAttendees.length > 0) {
                    attendeesOptions = uniqueAttendees.map((i) => {
                        return { label: i.Title, value: i.Id }
                    })
                }
            }
        }

        return attendeesOptions;
    }


    const _WorkplaceInspectionData = async (stateItems: any[]) => {
        setIsLoading(true);
        try {
            let filterFields: any[] = [];
            if (selectedSiteIds !== null && selectedSiteIds.length > 0) {
                filterFields.push(
                    {
                        fieldName: "SiteName",
                        fieldValue: selectedSiteIds,
                        fieldType: FieldType.LookupById,
                        LogicalType: LogicalType.In
                    },
                    {
                        fieldName: "IsActive",
                        fieldValue: true,
                        fieldType: FieldType.Boolean,
                        LogicalType: LogicalType.EqualTo
                    },
                    {
                        fieldName: "IsDeleted",
                        fieldValue: true,
                        fieldType: FieldType.Boolean,
                        LogicalType: LogicalType.NotEqualTo
                    }
                )
            } else {
                // if (!!props.siteMasterId) {
                if (selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId?.length > 0) {
                    filterFields.push({
                        fieldName: "SiteName",
                        fieldValue: selectedZoneDetails?.defaultSelectedSitesId,
                        fieldType: FieldType.LookupById,
                        LogicalType: LogicalType.In
                    },
                        {
                            fieldName: "IsActive",
                            fieldValue: true,
                            fieldType: FieldType.Boolean,
                            LogicalType: LogicalType.EqualTo
                        },
                        {
                            fieldName: "IsDeleted",
                            fieldValue: true,
                            fieldType: FieldType.Boolean,
                            LogicalType: LogicalType.NotEqualTo
                        }
                    )
                } else {
                    if (selectedZoneDetails && selectedZoneDetails?.selectedSitesId?.length > 0) {
                        filterFields.push({
                            fieldName: "SiteName",
                            fieldValue: selectedZoneDetails?.selectedSitesId,
                            fieldType: FieldType.LookupById,
                            LogicalType: LogicalType.In
                        },
                            {
                                fieldName: "IsActive",
                                fieldValue: true,
                                fieldType: FieldType.Boolean,
                                LogicalType: LogicalType.EqualTo
                            },
                            {
                                fieldName: "IsDeleted",
                                fieldValue: true,
                                fieldType: FieldType.Boolean,
                                LogicalType: LogicalType.NotEqualTo
                            }
                        )
                    } else {
                        filterFields.push(
                            {
                                fieldName: "IsActive",
                                fieldValue: true,
                                fieldType: FieldType.Boolean,
                                LogicalType: LogicalType.EqualTo
                            },
                            {
                                fieldName: "IsDeleted",
                                fieldValue: true,
                                fieldType: FieldType.Boolean,
                                LogicalType: LogicalType.NotEqualTo
                            })
                    }
                }
            }


            let isTopRecordOnly = selectedItem?.key == "Top 30 Records" ? true : false;
            if (selectedItem?.key !== 'All Dates' && !!selectedItem) {
                if (filterFromDate && filterToDate) {
                    filterFields.push({
                        fieldName: `Created`,
                        fieldValue: `${filterFromDate}`,
                        fieldType: FieldType.DateTime,
                        LogicalType: LogicalType.GreaterThanOrEqualTo
                    });
                    filterFields.push({
                        fieldName: `Created`,
                        fieldValue: `${filterToDate}`,
                        fieldType: FieldType.DateTime,
                        LogicalType: LogicalType.LessThanOrEqualTo
                    })
                }
                else {
                    const endDate = moment().format('YYYY-MM-DD');
                    const startDate = moment().subtract(29, 'days').format('YYYY-MM-DD');
                    const dateField = "Created";
                    if (selectedItem?.key != "Top 30 Records") {
                        filterFields.push({
                            fieldName: `${dateField}`,
                            fieldValue: `${startDate}`,
                            fieldType: FieldType.DateTime,
                            LogicalType: LogicalType.GreaterThanOrEqualTo
                        });
                        filterFields.push({
                            fieldName: `${dateField}`,
                            fieldValue: `${endDate}`,
                            fieldType: FieldType.DateTime,
                            LogicalType: LogicalType.LessThanOrEqualTo
                        })
                    }
                }
            }
            if (!!selectedLocation && selectedLocation.length > 0) {
                filterFields.push({
                    fieldName: "Location",
                    fieldValue: selectedLocation,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.In
                })
            }
            if (defaultManager !== null && defaultManager !== "" && defaultManager !== undefined) {
                const managerValue = defaultManager?.toLowerCase();
                filterFields.push({
                    fieldName: "Chairperson",
                    fieldValue: managerValue,
                    fieldType: FieldType.LookupByValue,
                    LogicalType: LogicalType.EqualTo
                });
            }
            if (!!selectedAttendees && selectedAttendees?.value) {
                filterFields.push({
                    fieldName: "AttendeesEmail",
                    fieldValue: selectedAttendees?.value,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.EqualTo
                });
            }



            let camlQuery;
            camlQuery = new CamlBuilder().View(["ID", "Subject", "Title", "IsActive", "Chairperson", "InspectionDate", "FormStatus", "Location", "SiteName", "AttendeesEmail", "Attendees", "Created", "Modified", "SignatureDoneBy","StateName"])
                .LeftJoin("SiteName", "SiteName").
                Select('StateNameValue', "StateName")
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(isTopRecordOnly ? 30 : 5000, isTopRecordOnly ? false : true)
                .Query()

            if (filterFields.length > 0) {
                const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
                camlQuery.Where().All(categoriesExpressions);
            }

            await provider.getItemsByCAMLQuery(ListNames.WorkplaceInspectionChecklist, camlQuery.ToString(),
                {
                    SortField: "Modified",
                    SortDir: "Desc",
                }
            ).then(async (results: any[]) => {
                if (!!results) {
                    let toolboxTalkId: number[] = [];
                    if (!!props.siteMasterId && props.siteMasterId > 0 && results.length > 0) {
                        toolboxTalkId = results.map((r) => r.ID).filter((value, index, self) => self.indexOf(value) === index);
                    }

                    // let WorkplaceInspectionSignatureData = signatureItems;
                    let UsersListData = results.map((data) => {
                        const fullAttendees = data.AttendeesEmail?.map((attendee: any) => ({
                            Id: attendee.lookupId, // Set Id directly from AttendeesEmail
                            Title: data.Attendees.split(', ')
                                .find((name: string, index: number) => index === data.AttendeesEmail.indexOf(attendee)) || '',
                        })) || [];
                        let completedSignatureCount: number = 0;
                        let completedSignData: any[] = data?.SignatureDoneBy;
                        let pendingUserName: any[] = []

                        let AttendeesEmailId = mapSingleValue(data.AttendeesEmail, DataType.lookupIdMuilt)
                        // if (WorkplaceInspectionSignatureData?.length > 0) {
                        // completedSignData = WorkplaceInspectionSignatureData.filter(i => i.WorkplaceInspectionChecklist.Id == data.ID && (AttendeesEmailId?.length > 0 && AttendeesEmailId.indexOf(i.QuaycleanEmployeeId) > -1)) || []
                        let completedSingUserId = completedSignData.map(r => r.lookupId) || [];
                        pendingUserName = fullAttendees.filter((i: any) => completedSingUserId.indexOf(i.Id) == -1)?.map((r: any) => r?.Title) || []
                        let pendingUserId: any[] = [];
                        pendingUserId = fullAttendees.filter((i: any) => completedSingUserId.indexOf(i.Id) == -1)?.map((r: any) => r?.Id) || []

                        completedSignatureCount = completedSignData?.length
                        // }
                        let totalSignature: number = 0
                        if (!!data?.AttendeesEmail && data?.AttendeesEmail?.length) {
                            totalSignature = data?.AttendeesEmail?.length || 0
                        }
                        const stateId = stateItems?.find((i) => Number(i.ID) == Number(data?.SiteName?.[0]?.lookupId))?.QCStateId || ""
                        return (
                            {
                                ID: parseInt(data.ID),
                                Title: !!data.Title ? data.Title : '',
                                SiteNameId: !!data.SiteName ? data.SiteName[0].lookupId : '',
                                completedSignature: completedSignatureCount,
                                renderCompletedTotalSignature: `${completedSignatureCount}/${totalSignature}`,
                                // isSignatureLoading: isSignatureDataGet == true ? false : true,
                                isSignatureLoading: false,
                                totalSignature: totalSignature,
                                pendingUserNames: pendingUserName,
                                pendingUserId: pendingUserId,
                                fullAttendees: fullAttendees,
                                AttendeesEmailId: AttendeesEmailId,
                                mainAttendeesEmail: data.AttendeesEmail,
                                // isCompletedSignature: totalSignature == completedSignatureCount || 0,
                                isCompletedSignature: ((totalSignature > 0) ? totalSignature == completedSignatureCount : false) || false,
                                SiteName: !!data.SiteName ? data.SiteName[0].lookupValue : '',
                                MeetingID: !!data.Title ? data.Title : '',
                                Attendees: !!data.Attendees ? data.Attendees : '',
                                Subject: !!data.Subject ? data.Subject : '',
                                ChairpersonName: !!data.Chairperson ? data.Chairperson?.map((item: any) => item.value).join(', ') : '',
                                Location: !!data.Location ? data.Location : '',
                                FormStatus: !!data.FormStatus ? data.FormStatus : '',
                                Created: !!data.Created ? formatSPDateToLocal(data.Created) : "",
                                Modified: !!data.Modified ? data.Modified : null,
                                FullAttendees: fullAttendees.length > 0 ? fullAttendees : [],
                                FullAttendeesArray: fullAttendees.length > 0 ? fullAttendees : [],
                                InspectionDate: !!data.InspectionDate ? moment(data.InspectionDate).format('DD-MM-YYYY') : '',
                                IsActive: !!data.IsActive ? (data.IsActive == "Yes" ? true : false) : false,
                                stateId
                            }
                        );
                    });

                    // UsersListData = UsersListData.sort((a: any, b: any) => {
                    //     return moment(b.Modified).diff(moment(a.Modified));
                    // });
                    let filteredData: any[];
                    if (!!props.siteMasterId || currentUserRoleDetail?.isAdmin) {
                        filteredData = UsersListData;
                    } else {
                        let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                        filteredData = !!UsersListData && UsersListData?.filter(item =>
                            AllSiteIds.includes(item?.SiteNameId)
                        );
                    }
                    filteredData = filteredData?.sort((a: any, b: any) => {
                        return moment(b.Modified).diff(moment(a.Modified));
                    });

                    if (shouldRefreshOptions && results.length > 0) {
                        const transformData = (UsersListData: { ChairpersonName: string; }[]) => {
                            return UsersListData.map((item: any) => ({
                                value: item.ChairpersonName ? item.ChairpersonName : '',
                                key: item.ChairpersonName ? item.ChairpersonName : '',
                                text: item.ChairpersonName ? item.ChairpersonName : '',
                                label: item.ChairpersonName ? item.ChairpersonName : ''
                            }));
                        };
                        let options = transformData(UsersListData);
                        options.push({
                            value: "",
                            key: "",
                            text: "",
                            label: " --All Checked By--"
                        });
                        setManagerOptions(options);
                        let attendeesOptions = genrateAttendeesOptions(filteredData);
                        setAttendeesOptions(attendeesOptions);
                        setShouldRefreshOptions(false);
                    }

                    setGridData(filteredData);
                    const Summary = getSummaryData(filteredData);
                    setSummaryData(Summary);

                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "_WorkplaceInspectionData", CustomErrormessage: "error in get _WorkplaceInspectionData", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "IMSDashboard.tsx" };
                void logGenerator(provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_WorkplaceInspectionData", CustomErrormessage: "error in get _WorkplaceInspectionData", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "IMSDashboard.tsx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };

    const getSummaryData = (ListData: any) => {
        const totalWorkplaceInspection = ListData.length; // Total count (same as totalAssets)
        const totalSubmittedData = ListData.filter((asset: any) =>
            asset.FormStatus === "submit"
        ).length;

        const totalSaveAsDraftData = ListData.filter((asset: any) =>
            asset.FormStatus === "draft"
        ).length;
        // const totalCompletedSignature = ListData.filter((i: any) => i.isCompletedSignature == true).length;
        // const totalPendingSignature = ListData.filter((i: any) => i.isCompletedSignature == false).length;
        const attendeeId =
            selectedAttendees && selectedAttendees.value
                ? selectedAttendees.value
                : null;
        let totalSignature = 0;
        let totalCompletedSignature = 0;
        let totalPendingSignature = 0;
        if (attendeeId) {
            ListData.forEach((item: any) => {
                const fullCount = item.totalSignature || 0;
                if (item.pendingUserId.includes(attendeeId)) {
                    totalPendingSignature += 1;
                } else {
                    totalCompletedSignature += 1;
                }
            });
            totalSignature = totalPendingSignature + totalCompletedSignature;
        }
        else {
            totalSignature = ListData.reduce(
                (sum: any, item: any) => sum + (item.totalSignature || 0),
                0
            );
            totalCompletedSignature = ListData.reduce(
                (sum: any, item: any) => sum + (item.completedSignature || 0),
                0
            );
            totalPendingSignature = totalSignature - totalCompletedSignature;
        }
        return {
            totalWorkplaceInspection,
            totalSubmittedData,
            totalSaveAsDraftData,
            totalPendingSignature,
            totalCompletedSignature
        };
    };

    const onStateChange = (option: any): void => {
        if (option) {
            let stateId: any[] = [option]
            setSelectedStateId(stateId)
        } else {
            setSelectedStateId([])
        }
    };

    const WICMasterData = async (Id: any) => {
        setIsLoading(true);
        try {
            const select = ["ID,WICMId,WICM/Title,Comment,MasterId,Attachments,AttachmentFiles"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["WICM", "AttachmentFiles"],
                filter: `MasterId eq '${Id}'`,
                listName: ListNames.WorkplaceInspectionChecklistMasterData,
            };
            await props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData: any = results.map((data) => {

                        return (
                            {
                                ID: data.ID,
                                Comment: !!data.Comment ? data.Comment : '',
                                MasterId: !!data.MasterId ? data.MasterId : '',
                                WICMId: !!data.WICMId ? data.WICMId : '',
                                AttachmentFiles: data.AttachmentFiles
                            }
                        );
                    });
                    AllMasterData.current = UsersListData;
                }
            }).catch((error: any) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "MasterData", CustomErrormessage: "error in get master data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "MasterData", CustomErrormessage: "error in get master data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const onClickCopy = async (data: any) => {
        setIsLoading(true);
        const formattedDate = moment().format('DD-MM-YYYY');
        const IncidentDate = moment(formattedDate, DateFormat).toDate();
        const timestamp = Date.now();
        const uniquePart = (timestamp % 100000).toString().padStart(6, '0');
        const Generateid = `WIC-${uniquePart}`;

        const WICData = {
            Title: Generateid,
            Location: data.Location,
            Subject: data.Subject,
            ChairpersonId: [data.ChairpersonID ? data.ChairpersonID[0] : []],
            SiteNameId: Number(data.SiteNameId) || Number(props?.originalSiteMasterId),
            Attendees: data.Attendees || "",
            AttendeesEmailId: data.AttendeesEmailId || [],
            InspectionDate: data.OrgInspectionDate ? new Date(data.OrgInspectionDate).toISOString() : new Date().toISOString(),
            FormStatus: "draft",
            CreatedDate: data.CreatedDate ? new Date() : new Date(),
            HistoryId: null, // Default to null
            IsSendEmail: false, // Default to false
            EnabledChecklistId: data.EnabledChecklistId ? data.EnabledChecklistId : []
        };

        let ListData: any[] = [];
        const getDetailsData = () => {
            try {
                const select = ["ID,Title,Response,SiteNameId,WICMId,MasterId"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    filter: `MasterId eq '${data.ID}'`,
                    listName: ListNames.WorkplaceInspectionChecklistMasterDetailsData,
                };
                props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                    if (!!results) {
                        ListData = results.map((data) => {
                            return (
                                {
                                    ID: data.ID,
                                    Title: data.Title,
                                    Response: !!data.Response ? data.Response : '',
                                    SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                    WICMId: !!data.WICMId ? data.WICMId : '',
                                    MasterId: !!data.MasterId ? data.MasterId : '',
                                }
                            );
                        });
                    }
                }).catch((error: any) => {
                    console.log(error);
                    setShowCopyDialog(false);
                    setIsLoading(false);
                });
            } catch (ex) {
                console.log(ex);
                setShowCopyDialog(false);
                setIsLoading(false);
            }
        };
        getDetailsData();
        WICMasterData(data.ID);
        await props.provider.createItem(WICData, ListNames.WorkplaceInspectionChecklist).then(async (item: any) => {
            let createdId = item.data.Id;
            if (createdId > 0) {
                const MasterObjects = ListData.map((item: any) => {
                    return {
                        MasterId: createdId,
                        Title: item.Title,
                        Response: item.Response,
                        SiteNameId: data.SiteNameId,
                        WICMId: item.WICMId,
                    };
                });
                const WICMasterData = AllMasterData.current?.map((itm: any) => {
                    return {
                        ID: itm.ID,
                        MasterId: createdId,
                        Comment: itm.Comment,
                        WICMId: itm.WICMId,
                        AttachmentFiles: itm.AttachmentFiles
                    };
                });

                Promise.all([await props.provider.createItemInBatchWithCopyAttachment(WICMasterData, ListNames.WorkplaceInspectionChecklistMasterData), await props.provider.createItemInBatch(MasterObjects, ListNames.WorkplaceInspectionChecklistMasterDetailsData)])
                // await props.provider.createItemInBatchWithCopyAttachment(WICMasterData, ListNames.WorkplaceInspectionChecklistMasterData);
                // await props.provider.createItemInBatch(MasterObjects, ListNames.WorkplaceInspectionChecklistMasterDetailsData);
                console.log("Success Master");
                _WorkplaceInspectionData(siteData.current);
                setShowCopyDialog(false);
                setIsLoading(false);
            }
        }
        );
    }

    const renderAttendees = (attendees: any) => {
        const attendeesList = attendees.split(", "); // Split by comma and space
        const displayNames = attendeesList.length > 5 ?
            attendeesList.slice(0, 5).concat(['...']) :
            attendeesList;
        return (
            <>
                {displayNames.map((name: any, index: any) => (
                    <span key={index} className={name !== '...' ? "attendees-badge-cls" : ''}>{name}</span>
                ))}
            </>
        );
    };

    const renderToolTipsAttendees = (attendees: any) => {
        const attendeesList = attendees.split(", "); // Split by comma and space
        const displayNames = attendeesList;
        return (
            <>
                {displayNames.map((name: any, index: any) => (
                    <span key={index} className={name !== '...' ? "attendees-badge-cls" : ''}>{name}</span>
                ))}
            </>
        );
    };

    const onclickExportToExcel = async () => {
        try {
            let exportColumns: IExportColumns[] = [
                { header: "Workplace Inspection", key: "Title" },
                { header: "Inspection Date", key: "InspectionDate" },
                { header: "Subject", key: "Subject" },
                { header: "Location", key: "Location" },
                { header: "Attendees", key: "Attendees" },
                { header: "Checked By", key: "ChairpersonName" },
                { header: "Site Name", key: "SiteName" },
                { header: "State Name", key: "StateName" },
                { header: "Form Status", key: "FormStatus" },
                { header: "Completed/ Total Signature", key: "renderCompletedTotalSignature" },
                { header: "Created Date", key: "Created" },
            ];

            generateExcelTable(FilteredData, exportColumns, `${selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails?.defaultSelectedSites && selectedZoneDetails?.defaultSelectedSites[0]?.SiteName + '- Workplace Inspection.xlsx' : 'Workplace Inspection Master.xlsx'}`);
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

    // const onClickSendEmail = async (item: any) => {

    //     if (!!item.ID && item.ID > 0) {
    //         const toastId = toastService.loading('Loading...');
    //         const toastMessage = 'Email sent successfully!';
    //         await props.provider.updateItem({ IsSendEmail: true }, ListNames.WorkplaceInspectionChecklist, item.ID)
    //         toastService.updateLoadingWithSuccess(toastId, toastMessage);
    //     }
    // }

    const GridColumn = (): IColumn[] => {
        let columns: any[] = [
            {
                key: "key11", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 100, maxWidth: 120,
                onRender: ((itemID: any) => {
                    return <>
                        <div className='dflex'>

                            <Link className="actionBtn btnView dticon" onClick={() => {
                                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.DetailWorkplaceInspection, siteMasterId: itemID.ID, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState } });
                                props.manageComponentView({
                                    currentComponentName: ComponentNameEnum.DetailWorkplaceInspection, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, originalState: props.originalState || props.componentProps.originalState, siteMasterId: itemID.ID, originalSiteMasterId: props.siteMasterId, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState
                                });
                            }}>
                                <TooltipHost content={"View Detail"} id={tooltipId}>
                                    <FontAwesomeIcon icon="eye" />
                                </TooltipHost>
                            </Link>

                            {(!!props.siteMasterId &&
                                (currentUserRoleDetail.isAdmin || currentUserRoleDetail.isSiteManager || currentUserRoleDetail.isSiteSupervisor || currentUserRoleDetail.isStateManager)) ? (
                                <Link className="actionBtn btnEditName dticon" onClick={() => {
                                    setCopyRecordItem(itemID);
                                    setShowCopyDialog(true);
                                }}>
                                    <TooltipHost content={"Copy Record"} id={tooltipId}>
                                        <FontAwesomeIcon icon="copy" />
                                    </TooltipHost>
                                </Link>
                            ) : (
                                <div></div>
                            )}

                            {(currentUserRoleDetail.isAdmin || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isSiteManager || currentUserRoleDetail.isSiteSupervisor || currentUserRoleDetail.isWHSChairperson) && <Link
                                className="actionBtn btnEdit dticon"
                                onClick={() => handleOpenPopup(itemID)}
                            >
                                <TooltipHost content={"Copy Link"} id={`tooltip_${itemID.ID}`}>
                                    <FontAwesomeIcon icon="link" />
                                </TooltipHost>
                            </Link>}
                            {(itemID?.FormStatus == "submit" && itemID?.pendingUserNames?.length !== 0) && <Link
                                className="actionBtn btnDanger iconSize tooltipcls "

                                onClick={() => onClickSendEmail(itemID)}
                            >
                                <TooltipHost content={"Send Email"} id={`tooltip_${itemID.ID}`}>
                                    <FontAwesomeIcon icon="paper-plane" />
                                </TooltipHost>
                            </Link>}
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
            { key: 'Title', name: 'Workplace Inspection', fieldName: 'Title', isResizable: true, minWidth: 100, maxWidth: 120, isSortingRequired: true },
            { key: 'InspectionDate', name: 'Inspection Date', fieldName: 'InspectionDate', isResizable: true, minWidth: 70, maxWidth: 120, isSortingRequired: true },
            { key: 'Subject', name: 'Subject', fieldName: 'Subject', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            { key: 'Location', name: 'Location', fieldName: 'Location', isResizable: true, minWidth: 150, maxWidth: 220, isSortingRequired: true },
            {
                key: 'renderCompletedTotalSignature', name: 'Completed/ Total Signature', fieldName: 'renderCompletedTotalSignature', isResizable: true, minWidth: 220, maxWidth: 220, isSortingRequired: true,
                onRender: (item: any) => {
                    return item.isSignatureLoading ? <div>
                        <span style={{ width: "75px" }}>
                            <FontAwesomeIcon className="spinerColor" icon={faSpinner} spin />
                        </span>
                    </div> : <ProgressBarWithTooltip renderCompletedTotalSignature={item?.renderCompletedTotalSignature} progressValue={item?.completedSignature} maxValue={item?.totalSignature} pendingSingUserName={item.pendingUserNames} />
                },
            },
            {
                key: 'Attendees', name: 'Attendees', fieldName: 'Attendees', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.Attendees !== "") {
                        return (
                            <>
                                <Link className="tooltipcls">
                                    <TooltipHost content={renderToolTipsAttendees(item.Attendees)} id={tooltipId}>
                                        {renderAttendees(item.Attendees)}
                                    </TooltipHost>
                                </Link>
                            </>
                        );
                    }
                },
            },
            { key: 'Chairperson', name: 'Checked By', fieldName: 'ChairpersonName', isResizable: true, minWidth: 100, maxWidth: 180, isSortingRequired: true },
            {
                key: 'FormStatus', name: 'Form Status', fieldName: 'FormStatus', isResizable: true, minWidth: 80, maxWidth: 120, isSortingRequired: true, onRender: (item: any) => {
                    if (item.FormStatus == "draft") {
                        return "Draft";
                    }
                    else if (item.FormStatus == "submit") {
                        return "Submitted";
                    } else {
                        return "";
                    }
                },
            },
            { key: 'Created', name: 'Created Date', fieldName: 'Created', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
        ];
        if (selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId?.length == 1) {
            columns = columns.filter(item => item.key != "SiteName")
        }
        return columns;
    };

    const onclickEdit = (predata: any) => {
        setisDisplayEDbtn(false);
        if (!!UpdateItem) {
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({ text: UpdateItem.FirstName, key: UpdateItem.FirstName, currentCompomnetName: ComponentNameEnum.AddWorkplaceInspection, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, IsUpdate: true, siteMasterId: UpdateItem.Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState } });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AddWorkplaceInspection, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, originalState: props.originalState || props.componentProps.originalState, siteMasterId: UpdateItem.ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems, IsUpdate: true, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState
            });
        }
        let data: any[] = [];
        if (!!predata?.ID) {
            data.push(predata);
            if (!!data) {

                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                breadCrumItems.push({ text: data[0].FirstName, key: data[0].FirstName, currentCompomnetName: ComponentNameEnum.AddWorkplaceInspection, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, IsUpdate: true, siteMasterId: data[0].Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState } });
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.AddWorkplaceInspection, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, originalState: props.originalState || props.componentProps.originalState, siteMasterId: data[0].ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems, IsUpdate: true, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState
                });
            }
        }
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
        setSelectedStateId([]);
        setFilterType("");
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
                const items = Array.isArray(UpdateItem) && UpdateItem.length > 0 ? UpdateItem : [UpdateItem];
                items.forEach((res: any) => {
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: res?.SiteNameId,
                        ActionType: UserActivityActionTypeEnum.Delete,
                        EntityType: "Workplace Inspection",
                        EntityId: res?.ID,
                        EntityName: res?.Title,
                        Details: `Delete Workplace Inspection`,
                        StateId: props?.qCStateId,
                        LogFor: UserActionLogFor.Both
                    };
                    void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
                });
                const deleteIDsArray = Array.isArray(UpdateItem)
                    ? UpdateItem.map((item: any) => item.Id || item.ID)
                    : [UpdateItem.ID || UpdateItem.Id];
                if (newObjects.length > 0) {
                    await provider.updateListItemsInBatchPnP(ListNames.WorkplaceInspectionChecklist, newObjects);
                    await deleteWICMaster(provider, deleteIDsArray);
                    await deleteWICMDetails(provider, deleteIDsArray);
                    _WorkplaceInspectionData(siteData.current);
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
                ErrorMethodName: "_confirmDeleteItem ListToolbox Talk"
            };
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        // _WorkplaceInspectionData(siteData.current);
        (async () => {
            const siteItems = await _siteDataUtil(provider);
            siteData.current = siteItems
            await _WorkplaceInspectionData(siteItems);
        })()
    }, [isRefreshGrid, props.isReload, selectedSiteIds, defaultManager, selectedAttendees, selectedLocation, filterFromDate, filterToDate, selectedZoneDetails]);

    const _closeDeleteConfirmation = () => {
        toggleHideDialog();
    };

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setCurrentView('card');
        } else {
            setCurrentView('grid');
        }
    }, []);

    React.useEffect(() => {
        const filterList = () => {
            let filteredList = GridData;
            const siteIdToQCStateMap = new Map<string, string>(
                siteData.current.map((item: { ID: any; QCStateId: any; }) => [item.ID, item.QCStateId])
            );
            // if (!!selectedAttendees && selectedAttendees?.label) {
            //     filteredList = filteredList.filter(r => r.AttendeesEmailId.includes(selectedAttendees?.value))

            // }
            const Summary = getSummaryData(filteredList);
            setSummaryData(Summary);

            const groupedByQCState: any = filteredList.reduce((acc: any, item: any) => {
                const qcStateId = siteIdToQCStateMap.get(item.SiteNameId);
                if (qcStateId) {
                    acc[qcStateId] = (acc[qcStateId] || 0) + 1;
                }
                return acc;
            }, {} as any);

            const groupedCountArray = Object.entries(groupedByQCState).map(([qcStateId, count]) => ({
                Id: qcStateId,
                Count: count,
            }));
            if (!!selectedStateId && selectedStateId.length > 0) {
                filteredList = filteredList.filter((i) => selectedStateId.includes(i.stateId));
            }
            const attendeeId =
                selectedAttendees && selectedAttendees.value
                    ? selectedAttendees.value
                    : null;
            setTotalCount(filteredList?.length);
            setStateCountData(groupedCountArray);
            if (filterType === "Total Workplace Inspection") {
                filteredList = GridData;
            } else if (filterType === "Total Submitted") {
                filteredList = GridData.filter((item: any) =>
                    item.FormStatus === "submit"
                );
            } else if (filterType === "Total Save as Draft") {
                filteredList = GridData.filter((item: any) =>
                    item.FormStatus === "draft"
                );
            } else if (filterType === "Pending signature") {
                filteredList = filteredList.filter((item: any) => {
                    const isPending = item.totalSignature !== item.completedSignature;

                    if (attendeeId) {
                        // user-level pending
                        return isPending && item.pendingUserId.includes(attendeeId);
                    }

                    return isPending;
                });

            }
            else if (filterType === "Completed Signature") {
                filteredList = filteredList.filter((item: any) => {
                    const isCompleted = item.completedSignature > 0;

                    if (attendeeId) {
                        // user-level completed
                        return !item.pendingUserId.includes(attendeeId);
                    }

                    return isCompleted;
                });

            }
            setIsLoading(false);
            setFilteredData(filteredList);
        };
        setIsLoading(true);
        filterList();
    }, [GridData, filterType, selectedStateId]);

    return <>
        {isLoading && <Loader />}
        {popupData && (
            <CopyIMSLink
                isOpen={isPopupOpen}
                closePopup={handleClosePopup}
                Data={popupData}
                Context={context}
                Page="WorkplaceInspectionChecklistReport"
                PageId="WorkplaceInspectionChecklistId"
                provider={provider}

            />
        )}
        {isSendEmailPopupOpen && (
            <SendEmailIMS
                isOpen={isSendEmailPopupOpen}
                closePopup={handleCloseSendEmail}
                Data={popupData}
                Context={context}
                Page="WorkplaceInspectionChecklistReport"
                provider={provider} />
        )}
        <CustomModal isModalOpenProps={showCopyDialog}
            setModalpopUpFalse={closeCopyDialog}
            subject={"Copy Item"}
            message={'Are you sure, you want to copy this record?'}
            yesButtonText="Yes"
            closeButtonText={"No"}
            onClickOfYes={onClickCopyRecordYes} />
        <CustomModal isModalOpenProps={hideDialog}
            setModalpopUpFalse={_closeDeleteConfirmation}
            subject={"Delete Item"}
            message={'Are you sure, you want to delete this record?'}
            yesButtonText="Yes"
            closeButtonText={"No"}
            onClickOfYes={_confirmDeleteItem} />

        <WorkplaceInspectionCountCard data={SummaryData} handleCardClick={handleCardClick} />

        <div className="ms-Grid mt-3">
            <div className="ms-Grid-row ptop-5">
                {!isSiteLevelComponent && <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
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
                                selectedState={selectedStateId || []}
                                isRequired={true}
                                AllOption={true}
                            />
                        </div>
                    </div>
                </div>}
                {ManagerOptions &&
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                        <div className="formControl ims-site-pad">
                            <div className="formControl">
                                <ReactDropdown
                                    options={ManagerOptions} isMultiSelect={false}
                                    defaultOption={defaultManager || selectedManager}
                                    onChange={_onManagerChange}
                                    isClearable={true}
                                    placeholder={"Select Checked By"} />
                            </div>
                        </div>
                    </div>}
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                    <div className="formControl ims-site-pad">
                        <div className="formControl">
                            <IMSLocationFilter
                                onChange={onChangeLocationFilter}
                                provider={provider}
                                selectedOptions={selectedLocation || []}
                                context={context}
                                SiteNameId={props.siteMasterId}
                                Title={"Workplace Inspection Checklist"}
                                isMultiSelect={true}
                                isClearable={true}
                            />
                        </div>
                    </div>
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                    <div className="formControl ims-site-pad">
                        <div className="formControl">
                            <IMSAttendeesFilter
                                options={attendeesOptions || []}
                                onChange={onChangeAttendeesFilter}
                                selectedOptions={selectedAttendees?.label || []}
                                isMultiSelect={false}

                                isClearable={true}
                            />
                        </div>
                    </div>
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                    <div className="formControl ims-site-pad">
                        <div className="formControl">
                            <PreDateRangeFilterQuaySafe
                                fromDate={fromDate}
                                toDate={toDate}
                                onFromDateChange={onChangeFromDate}
                                onToDateChange={onChangeToDate}
                                isClearable={true}
                                onChangeRangeOption={onChangeRangeOption}
                                IsLast30Record={true}
                            />
                        </div>
                    </div>
                </div>
                {(!isSiteLevelComponent) && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 mb-2">
                    {stateTabData.length > 0 && <TabMenu
                        stateMasterItems={stateTabData}
                        TotalCount={TotalCount}
                        onStateChange={(option: any) => onStateChange(option)} />}
                </div>}
            </div>
        </div>
        <div className="boxCardq">
            <div className="formGroup">
                {currentView === "grid" ? <>
                    <MemoizedDetailList
                        manageComponentView={props.manageComponentView}
                        columns={GridColumn() as any}
                        items={FilteredData || []}
                        reRenderComponent={true}
                        onSelectedItem={_onItemSelected}
                        searchable={true}
                        CustomselectionMode={
                            (// !!props.siteMasterId &&
                                (!!PermissionArray && PermissionArray?.includes('Quaysafe') || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0 || currentUserRoleDetail.isStateManager))
                                ? SelectionMode.multiple
                                : SelectionMode.none
                        }
                        addEDButton={<>
                            {isDisplayEDbtn && <>
                                <div className='dflex'>

                                    {isDisplayEditButtonview && <Link className="actionBtn iconSize btnEdit " onClick={onclickEdit}>
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
                        </>}
                        isAddNew={true}
                        addNewContent={
                            <>
                                <div className="dflex">
                                    {
                                        <Link Link className="actionBtn iconSize btnEdit ml-10" disabled={FilteredData?.length == 0 || FilteredData == undefined} style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                            text="">
                                            <TooltipHost
                                                content={FilteredData?.length == 0 || FilteredData == undefined ? "Record not found" : "Export to excel"}
                                                id={tooltipId}
                                            >
                                                <FontAwesomeIcon
                                                    icon={"file-excel"}
                                                />
                                            </TooltipHost>
                                        </Link>}
                                    <Link className="actionBtn iconSize btnRefresh icon-mr ml-10" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                        text="">
                                        <TooltipHost
                                            content={"Refresh Grid"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon
                                                icon={"arrows-rotate"}
                                            />
                                        </TooltipHost>    </Link>
                                    {(!!PermissionArray && PermissionArray?.includes('Quaysafe') || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0 || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isWHSChairperson) &&
                                        <PrimaryButton text="Add" className="btn btn-primary "
                                            onClick={() => {
                                                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                                breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddWorkplaceInspection, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddWorkplaceInspection, isAddClient: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, selectedZoneDetails: props.selectedZoneDetails } });
                                                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddWorkplaceInspection, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, originalState: props.originalState || props.componentProps.originalState, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, selectedZoneDetails: props.selectedZoneDetails });
                                                setIsLoading(false);
                                            }}
                                        />}
                                </div>
                            </>
                        } />
                </> :
                    <>
                        <div className="dflex btn-back-ml">
                            {(currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0 || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isWHSChairperson) &&
                                <PrimaryButton text="Add" className="btn btn-primary margin-sm-add"
                                    onClick={() => {
                                        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                        breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddWorkplaceInspection, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddWorkplaceInspection, isAddClient: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState } });
                                        props.manageComponentView({ currentComponentName: ComponentNameEnum.AddWorkplaceInspection, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, originalState: props.originalState || props.componentProps.originalState, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState });
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
                        <WorkplaceCardView
                            items={GridData}
                            isTabView={false}
                            viewType={'card'}
                            manageComponentView={props.manageComponentView}
                            isEditDelete={!!props?.siteMasterId ? true : false}
                            _onclickEdit={onclickEdit}
                            _onclickconfirmdelete={onclickconfirmdelete}
                            IMSsiteMasterId={props.siteMasterId || undefined}
                        />
                    </>
                }
            </div>
        </div>
    </>;
};