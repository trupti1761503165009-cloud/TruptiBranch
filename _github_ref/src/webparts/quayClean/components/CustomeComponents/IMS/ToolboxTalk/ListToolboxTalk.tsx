/* eslint-disable no-self-assign */
/* eslint-disable no-lone-blocks */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { IColumn, IDropdownOption, Link, PrimaryButton, SelectionMode, TooltipHost } from "@fluentui/react";
import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { _siteDataUtil, deleteToolboxTalkDetails, deleteToolboxTalkMaster, generateExcelTable, getCAMLQueryFilterExpression, logGenerator, mapSingleValue, onBreadcrumbItemClicked, UserActivityLog } from "../../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IHelpDeskFormProps } from "../../../../../../Interfaces/IAddNewHelpDesk";
import { Loader } from "../../../CommonComponents/Loader";
import { MemoizedDetailList } from "../../../../../../Common/DetailsList";
import { IBreadCrum } from "../../../../../../Interfaces/IBreadCrum";
import { useBoolean, useId } from "@fluentui/react-hooks";
import moment from "moment";
import CustomModal from "../../../CommonComponents/CustomModal";
import { toastService } from "../../../../../../Common/ToastService";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom, appSiteStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { ToolboxCardView } from "../CardView/ToolboxCardView";
import { MultipleSiteFilter } from "../../../../../../Common/Filter/MultipleSiteFilter";
import { CopyIMSLink } from "../../../../../../Common/CopyIMSLink";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { ToolboxTalkCountCard } from "./ToolboxTalkCountCard";
import { IExportColumns } from "../../UserActivityLog";
import { DataType } from "../../../../../../Common/Constants/CommonConstants";
import { SendEmailIMS } from "../../../../../../Common/SendEmailIMS";
import { IMSLocationFilter } from "../../../../../../Common/Filter/IMSLocationFilter";
import { PreDateRangeFilterQuaySafe } from "../../../../../../Common/Filter/PreDateRangeFilterQuaySafe";
import CamlBuilder from "camljs";
import { ICustomPeoplePicker, ILookup } from "../../WHSForms/IAddWHSMeetingFroms";
import { FieldType, LogicalType } from "../../../../../../Common/Constants/DocumentConstants";
import ProgressBarWithTooltip from "../../../../../../Common/ProgressBarWithTooltip";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import TabMenu from "../../../../../../Common/TabMenu";
import { IReactDropOptionProps } from "../../../CommonComponents/reactSelect/IReactDropOptionProps";
import { IMSAttendeesFilter } from "../../../../../../Common/Filter/IMSAttendeesFilter";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
import { formatSPDateToLocal } from "../../../CommonComponents/CommonMethods";
const notFoundImage = require('../../../../../quayClean/assets/images/NotFoundImg.png');


export interface IToolboxTalkSignatureData {
    ID: number;
    Title: String;
    Signature: string;
    ToolboxTalk: ILookup;
    QuaycleanEmployee: ICustomPeoplePicker
}
export const ListToolboxTalk: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, currentUserRoleDetail, context } = appGlobalState;
    const appSiteState = useAtomValue(appSiteStateAtom);
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const { PermissionArray } = appSiteState;
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [ToolboxTalkDetailsData, setToolboxTalkDetailsData] = React.useState<any[]>([]);
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>([]);
    const [selectedStateId, setSelectedStateId] = React.useState<any[]>([]);
    const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>([]);
    const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>([]);
    const [ManagerOptions, setManagerOptions] = React.useState<IDropdownOption[]>([]);
    const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : 'grid');
    const [defaultManager, setDefaultManager] = React.useState<any>(null);
    const [selectedManager, setSelectedManager] = React.useState<any>(null);
    const [selectedMeetingLocation, setSelectedMeetingLocation] = React.useState<any[]>([]);
    const [FilteredData, setFilteredData] = React.useState<any>([]);
    const [SummaryData, setSummaryData] = React.useState<any>([]);
    const [filterType, setFilterType] = React.useState<any>("");
    const [fromDate, setFromDate] = React.useState<Date | any>();
    const [toDate, setToDate] = React.useState<Date | any>();
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);
    const [filterFromDate, setFilterFromDate] = React.useState<any>(undefined);
    const [stateTabData, setStateTabData] = React.useState<any>([]);
    const [stateCountData, setStateCountData] = React.useState<any>();
    const [attendeesOptions, setAttendeesOptions] = React.useState<IReactDropOptionProps[]>([]);
    const [selectedAttendees, setSelectedAttendees] = React.useState<IReactDropOptionProps>("" as any)
    let siteData = React.useRef<any>([]);
    const [TotalCount, setTotalCount] = React.useState<any>(0);
    // const [signatureItems, setSignatureItems] = React.useState<any[]>([]);
    // const [isSignatureDataGet, setIsSignatureDataGet] = React.useState<boolean>(false);
    // const [isSetSignatureData, setIsSetSignatureData] = React.useState<boolean>(false);
    const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: 'Top 30 Records', text: 'Top 30 Records' });
    const [shouldRefreshOptions, setShouldRefreshOptions] = React.useState(true);

    const onChangeRangeOption = (item: IDropdownOption): void => {
        setSelectedItem(item);
        setShouldRefreshOptions(true);
    };
    // const [showCopyDialog, { toggle: toggleShowCopyDialog }] = useBoolean(false);
    const [showCopyDialog, setShowCopyDialog] = React.useState(false);
    const [copyRecordItem, setCopyRecordItem] = React.useState<any>();

    // This States are using for the Shift Type Control
    const [shiftTypeOptions, setShiftTypeOptions] = React.useState<IDropdownOption[]>([]);
    const [selectedShiftType, setSelectedShiftType] = React.useState<any>("");

    // on Shit Type DropDown value change
    const _onShiftTypeChange = (option: any): void => {
        setSelectedShiftType(option?.text);
    };

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
    const onChangeToDate = (filterDate: any, date?: Date) => {
        setFilterToDate(filterDate);
        setToDate(date);
    };
    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setFromDate(date);
        setFilterFromDate(filterDate);
    };

    const onStateChange = (option: any): void => {
        // selectedState.current = option;
        if (option) {
            let stateId: any[] = [option]
            setSelectedStateId(stateId)
        } else {
            setSelectedStateId([])
        }

        // _ToolboxTalkData();
    };

    const onChangeLocationFilter = (value: any) => {
        if (!!value && value.length > 0) {
            let items: any[] = value.map((i: any) => i.value)
            setSelectedMeetingLocation(items)
        } else {
            setSelectedMeetingLocation([])
        }
    }

    const onChangeAttendeesFilter = (value: IReactDropOptionProps) => {
        if (!!value) {
            setSelectedAttendees(value)
        } else {
            setSelectedAttendees("" as any)
        }
    }

    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSiteIds(siteIds);
        setSelectedSiteTitles(siteTitles);
        setSelectedSCSites(siteSC);
    };


    // const getToolboxTalkSignature = async (ToolboxTalkId?: number[]) => {
    //     try {
    //         let toolboxTalkSignatureData: IToolboxTalkSignatureData[] = [];

    //         const camlQuery = new CamlBuilder()
    //             .View(['ID', 'Title', 'ToolboxTalk', 'Signature', 'QuaycleanEmployee'])
    //             .Scope(CamlBuilder.ViewScope.RecursiveAll)
    //             .RowLimit(5000, true)
    //             .Query()
    //         let filterFields: ICamlQueryFilter[] = [];
    //         // if (!!ToolboxTalkId && ToolboxTalkId.length > 0) {
    //         //     filterFields.push({
    //         //         fieldName: "ToolboxTalk",
    //         //         fieldValue: ToolboxTalkId,
    //         //         fieldType: FieldType.LookupById,
    //         //         LogicalType: LogicalType.In
    //         //     });
    //         // }

    //         if (filterFields.length > 0) {
    //             const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
    //             camlQuery.Where().All(categoriesExpressions);
    //         }

    //         let data = await props.provider.getItemsByCAMLQuery(ListNames.ToolboxTalkSignature, camlQuery.ToString());
    //         if (!!data && data.length > 0) {
    //             toolboxTalkSignatureData = data.map((i) => {
    //                 return {
    //                     ID: mapSingleValue(i.ID, DataType.number),
    //                     Title: mapSingleValue(i.Title, DataType.string),
    //                     Signature: mapSingleValue(i.Signature, DataType.string),
    //                     ToolboxTalk: mapSingleValue(i.ToolboxTalk, DataType.lookup),
    //                     QuaycleanEmployee: mapSingleValue(i.QuaycleanEmployee, DataType.lookup),
    //                     QuaycleanEmployeeId: mapSingleValue(i.QuaycleanEmployee, DataType.lookupId)
    //                 }
    //             })

    //         }
    //         setSignatureItems(toolboxTalkSignatureData);
    //         setIsSignatureDataGet(true)
    //         return toolboxTalkSignatureData;
    //     } catch (error) {
    //         setIsSignatureDataGet(true)
    //         console.log(error);
    //         return []
    //     }
    // }


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
    const selectedSiteIdss = selectedZoneDetails?.defaultSelectedSitesId || [];

    const isSiteManagerForSelectedSites = currentUserRoleDetail?.siteManagerItem?.some((site: any) =>
        selectedSiteIdss.includes(site.Id) &&
        site.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1
    );

    const isSiteSupervisorForSelectedSites = currentUserRoleDetail?.siteSupervisorItem?.some((site: any) =>
        selectedSiteIdss.includes(site.Id) &&
        site.SiteSupervisorId?.indexOf(currentUserRoleDetail.Id) > -1
    );
    const canShowAddButton =
        PermissionArray?.includes('Quaysafe') ||
        currentUserRoleDetail.isAdmin ||
        currentUserRoleDetail.isStateManager ||
        selectedSiteIdss.length == 0 && currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0 ||
        (
            selectedSiteIdss.length > 0 &&
            isSiteManagerForSelectedSites &&
            !(
                selectedSiteIdss.length === 1 &&
                isSiteSupervisorForSelectedSites &&
                !isSiteManagerForSelectedSites
            )
        );

    const _ToolboxTalkData = async (stateItems: any[]) => {
        setIsLoading(true);
        let filterFields: any[] = [];
        if (selectedSiteIds !== null && selectedSiteIds.length > 0) {
            filterFields.push({
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
                })
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
        if (!!selectedMeetingLocation && selectedMeetingLocation.length > 0) {
            filterFields.push({
                fieldName: "Location",
                fieldValue: selectedMeetingLocation,
                fieldType: FieldType.Text,
                LogicalType: LogicalType.In
            })
        }
        if (selectedShiftType !== null && selectedShiftType !== "" && selectedShiftType !== undefined) {
            filterFields.push({
                fieldName: "ShiftType",
                fieldValue: selectedShiftType,
                fieldType: FieldType.Text,
                LogicalType: LogicalType.EqualTo
            });
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

        camlQuery = new CamlBuilder()
            .View(["ID", "Title", "FormStatus", "IsActive", "Chairperson", "SiteName", 'AttendeesTitle', "MeetingDate", "Location", "ShiftType", "AttendeesEmail", "MeetingID", "Attendees", "Created", "MinutesTakenAndRecordedBy", "Subject", "Modified", "SignatureDoneBy","StateName"])
            .LeftJoin("SiteName", "SiteName").
            Select('StateNameValue', "StateName")
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(isTopRecordOnly ? 30 : 5000, isTopRecordOnly ? false : true)
            .Query()

        if (filterFields.length > 0) {
            const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
            camlQuery.Where().All(categoriesExpressions);
        }

        try {
            await provider.getItemsByCAMLQuery(ListNames.ToolboxTalk, camlQuery.ToString(),
                {
                    SortField: "Modified",
                    SortDir: "Desc",
                }).then(async (results: any) => {
                    if (results) {
                        let toolboxTalkId: number[] = [];
                        if (!!props.siteMasterId && props.siteMasterId > 0 && results.length > 0) {
                            toolboxTalkId = results.map((r: any) => r.ID).filter((value: any, index: any, self: any) => self.indexOf(value) === index);
                        }

                        // let toolboxTalkSignatureData = signatureItems;
                        const UsersListData = results.map((data: any) => {
                            const fullAttendees = data.AttendeesEmail?.map((attendee: any) => ({
                                Id: attendee.lookupId, // Set Id directly from AttendeesEmail
                                Title: data.Attendees.split(', ')
                                    .find((name: string, index: number) => index === data.AttendeesEmail.indexOf(attendee)) || '',
                            })) || [];
                            let completedSignatureCount: number = 0;
                            let completedSignData: any[] = data?.SignatureDoneBy || [];
                            let pendingUserName: any[] = [];
                            let pendingUserId: any[] = [];
                            let AttendeesEmailId = mapSingleValue(data.AttendeesEmail, DataType.lookupIdMuilt)
                            // if (toolboxTalkSignatureData?.length > 0) {
                            // completedSignData = toolboxTalkSignatureData.filter(i => i.ToolboxTalk.Id == data.ID && (AttendeesEmailId?.length > 0 && AttendeesEmailId.indexOf(i?.QuaycleanEmployeeId) > -1)) || []
                            let completedSingUserId = completedSignData?.map(r => r.lookupId) || [];
                            pendingUserName = fullAttendees.filter((i: any) => completedSingUserId.indexOf(i.Id) == -1)?.map((r: any) => r?.Title) || []
                            pendingUserId = fullAttendees.filter((i: any) => completedSingUserId.indexOf(i.Id) == -1)?.map((r: any) => r?.Id) || []
                            completedSignatureCount = completedSignData?.length
                            // }
                            let totalSignature: number = 0
                            if (!!data?.AttendeesEmail && data?.AttendeesEmail?.length) {
                                totalSignature = data?.AttendeesEmail?.length || 0
                            }
                            const stateId = stateItems?.find((i) => Number(i.ID) == Number(data?.SiteName?.[0]?.lookupId))?.QCStateId || ""
                            return {
                                ID: parseInt(data.ID),
                                Title: data.Title,
                                completedSignature: completedSignatureCount,
                                pendingUserNames: pendingUserName,
                                pendingUserId: pendingUserId,
                                fullAttendees: fullAttendees,
                                // isSignatureLoading: isSignatureDataGet == true ? false : true,
                                isSignatureLoading: false,
                                mainAttendeesEmail: data.AttendeesEmail,
                                AttendeesEmailId: AttendeesEmailId,
                                renderCompletedTotalSignature: `${completedSignatureCount}/${totalSignature}`,
                                totalSignature: totalSignature,
                                // isCompletedSignature: totalSignature == completedSignatureCount || 0,
                                isCompletedSignature: ((totalSignature > 0) ? totalSignature == completedSignatureCount : false) || false,
                                MeetingDate: !!data.MeetingDate ? moment(data.MeetingDate).format('DD-MM-YYYY') : '',
                                SiteNameId: !!data.SiteName ? data.SiteName[0].lookupId : '',
                                SiteName: !!data.SiteName ? data.SiteName[0].lookupValue : '',
                                MeetingID: !!data.MeetingID ? data.MeetingID : '',
                                Attendees: !!data.Attendees ? data.Attendees : '',
                                Location: !!data.Location ? data.Location : '',
                                ShiftType: !!data.ShiftType ? data.ShiftType : '',
                                FormStatus: !!data.FormStatus ? data.FormStatus : '',
                                ChairpersonName: !!data.Chairperson ? data.Chairperson?.map((item: any) => item.value).join(', ') : '',
                                Created: !!data.Created ? formatSPDateToLocal(data.Created) : "",
                                MinutesTakenAndRecordedBy: !!data.MinutesTakenAndRecordedBy ? data.MinutesTakenAndRecordedBy : '',
                                Subject: !!data.Subject ? data.Subject : '',
                                Modified: !!data.Modified ? data.Modified : null,
                                FullAttendees: fullAttendees.length > 0 ? fullAttendees : [],
                                FullAttendeesArray: fullAttendees.length > 0 ? fullAttendees : [],
                                IsActive: !!data.IsActive ? (data.IsActive == "Yes" ? true : false) : false,
                                stateId
                            };
                        });

                        let filteredData: any[];
                        if (!!props.siteMasterId || currentUserRoleDetail?.isAdmin) {
                            filteredData = UsersListData;
                        } else {
                            let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                            filteredData = !!UsersListData && UsersListData?.filter((item: any) =>
                                AllSiteIds.includes(item?.SiteNameId)
                            );
                        }
                        filteredData = filteredData?.sort((a: any, b: any) => {
                            return moment(b.Modified).diff(moment(a.Modified));
                        });
                        if (shouldRefreshOptions && results.length > 0) {
                            const transformData = (UsersListData: { ChairpersonID: number; Chairperson: string }[]) => {
                                return UsersListData.map((item: any) => ({
                                    value: item.ChairpersonName ? item.ChairpersonName : '',
                                    key: item.ChairpersonName ? item.ChairpersonName : '',
                                    text: item.ChairpersonName ? item.ChairpersonName : '',
                                    label: item.ChairpersonName ? item.ChairpersonName : ''
                                }));
                            };
                            let options = transformData(filteredData);
                            options.push({
                                value: "",
                                key: "",
                                text: "",
                                label: " --All Chairperson--"
                            });
                            let attendeesOptions = genrateAttendeesOptions(filteredData);
                            setAttendeesOptions(attendeesOptions);
                            setManagerOptions(options);
                            setShouldRefreshOptions(false);
                        }

                        setToolboxTalkDetailsData(filteredData);
                        const Summary = getSummaryData(filteredData);
                        setSummaryData(Summary);

                        setIsLoading(false);
                    }
                }).catch((error: any) => {
                    console.log(error);
                    const errorObj = { ErrorMethodName: "_ToolboxTalkData", CustomErrormessage: "error in get Toolbox Talk Data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "IMSDashboard.tsx" };
                    void logGenerator(provider, errorObj);
                    setIsLoading(false);
                });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_ToolboxTalkData", CustomErrormessage: "error in get Toolbox Talk Data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "IMSDashboard.tsx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };


    const getSummaryData = (ListData: any) => {
        const totalToolboxTalk = ListData.length; // Total count (same as totalAssets)
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
            totalToolboxTalk,
            totalSubmittedData,
            totalSaveAsDraftData,
            totalPendingSignature,
            totalCompletedSignature
        };
    };

    const uploadAttachment = async (attachment: any, itemId: any) => {
        try {
            const attachmentUrl = attachment.ServerRelativeUrl;
            const response = await fetch(attachmentUrl);
            const blob = await response.blob();
            const file = new File([blob], attachment.FileName);
            await props.provider.uploadListAttachmentToList(ListNames.ToolboxTalk, file, itemId);
        } catch (error) {
            console.error('Error uploading attachment:', error);
        }
    };

    const onClickCopy = async (data: any) => {
        console.time("onClickCopy")
        setIsLoading(true);
        const timestamp = Date.now();
        const uniquePart = (timestamp % 100000).toString().padStart(6, '0');
        const Generateid = `IBM-${uniquePart}`;
        const ToolBoxTalkData = {
            Title: Generateid,
            MeetingDate: data.OrgMeetingDate ? new Date(data.OrgMeetingDate).toISOString() : new Date().toISOString(),
            MeetingID: Generateid,
            Location: data.Location || "N/A",
            Subject: data.Subject || "",
            ChairpersonId: [data.ChairpersonID ? data.ChairpersonID[0] : ""],
            MinutesTakenAndRecordedBy: data.MinutesTakenAndRecordedBy || "",
            DiscussionPoints: data.DiscussionPoints || "",
            Comments: data.Comments || "N/A",
            MattersfromPreviousMeetings: data.MattersfromPreviousMeetings || "N/A",
            NewMattersforDiscussion: data.NewMattersforDiscussion || "",
            SiteNameId: Number(data.SiteNameId) || Number(props?.originalSiteMasterId),
            Attendees: data.Attendees || "",
            AttendeesEmailId: data.AttendeesEmailId || [],
            FormStatus: "draft", // Default to "Draft"
            CreatedDate: data.CreatedDate ? new Date() : new Date(),
            HistoryId: null, // Default to null
            IsSendEmail: false // Default to false
        };
        let UsersListData: any[] = [];
        let DetailListData: any[] = [];
        const MasterData = () => {
            try {
                const select = ["ID,ToolboxTalkMasterId,ToolboxTalkMaster/Title,IsShow,Comment,MasterId,SiteNameId,SiteName/Title"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    expand: ["ToolboxTalkMaster", "SiteName"],
                    filter: `MasterId eq '${data.ID}'`,
                    listName: ListNames.ToolboxTalkMasterData,
                };
                props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                    if (!!results) {
                        UsersListData = results.map((data) => {
                            return (
                                {
                                    ID: data.ID,
                                    IsShow: !!data.IsShow ? data.IsShow : false,
                                    Comment: !!data.Comment ? data.Comment : '',
                                    MasterId: !!data.MasterId ? data.MasterId : '',
                                    SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                    SiteName: !!data.SiteName ? data.SiteName?.Title : '',
                                    ToolboxTalkMasterId: !!data.ToolboxTalkMasterId ? data.ToolboxTalkMasterId : '',
                                    ToolboxTalkMaster: !!data.ToolboxTalkMaster ? data.ToolboxTalkMaster.Title : ''
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
                setShowCopyDialog(false);
                console.log(ex);
                setIsLoading(false);
            }
        };
        const DetailsData = () => {
            try {
                const select = ["ID,ToolboxTalkDetailsId,ToolboxTalkMasterId,Response,MasterId,SiteNameId"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    filter: `MasterId eq '${data.ID}'`,
                    listName: ListNames.ToolboxTalkDetailsData,
                };
                props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                    if (!!results) {
                        DetailListData = results.map((data) => {
                            return (
                                {
                                    ID: data.ID,
                                    Response: !!data.Response ? data.Response : '',
                                    MasterId: !!data.MasterId ? data.MasterId : '',
                                    SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                    ToolboxTalkDetailsId: !!data.ToolboxTalkDetailsId ? data.ToolboxTalkDetailsId : '',
                                    ToolboxTalkMasterId: !!data.ToolboxTalkMasterId ? data.ToolboxTalkMasterId : ''
                                }
                            );
                        });
                    }
                }).catch((error: any) => {
                    console.log(error);
                    setIsLoading(false);
                    setShowCopyDialog(false);

                });
            } catch (ex) {
                setShowCopyDialog(false);
                console.log(ex);
                setIsLoading(false);
            }
        };
        DetailsData();
        MasterData();

        await props.provider.createItem(ToolBoxTalkData, ListNames.ToolboxTalk).then(async (item: any) => {
            let createdId = item.data.Id;
            props.provider.copyAttachments(ListNames.ToolboxTalk, data.ID, ListNames.ToolboxTalk, createdId);
            if (createdId > 0) {
                if (data.AttachmentFiles && data.AttachmentFiles.length > 0) {
                    for (const attachment of data.AttachmentFiles) {
                        await uploadAttachment(attachment, createdId);
                    }
                }

                const MasterObjects = UsersListData.map((item: any) => {
                    return {
                        MasterId: createdId,
                        IsShow: item.IsShow,
                        Comment: item.Comment,
                        SiteNameId: item.SiteNameId,
                        ToolboxTalkMasterId: item.ToolboxTalkMasterId
                    };
                });
                const DetailsObjects = DetailListData.map((item: any) => {
                    return {
                        MasterId: createdId,
                        Response: item.Response,
                        ToolboxTalkDetailsId: item.ToolboxTalkDetailsId,
                        SiteNameId: item.SiteNameId,
                        ToolboxTalkMasterId: item.ToolboxTalkMasterId
                    };
                });

                Promise.all([await props.provider.createItemInBatch(DetailsObjects, ListNames.ToolboxTalkDetailsData), await props.provider.createItemInBatch(MasterObjects, ListNames.ToolboxTalkMasterData)])

                // await props.provider.createItemInBatch(DetailsObjects, ListNames.ToolboxTalkDetailsData);

                await _ToolboxTalkData(siteData.current);
                setIsLoading(false);
                setShowCopyDialog(false);
            }
        }

        );
        console.timeEnd("onClickCopy");

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

    const [isPopupOpen, setIsPopupOpen] = React.useState(false);
    const [isSendEmailPopupOpen, setIsSendEmailPopupOpen] = React.useState(false);
    const [popupData, setPopupData] = React.useState<any>(null);

    const handleOpenPopup = (item: any) => {
        setPopupData(item); // Pass item data to popup
        setIsPopupOpen(true); // Open popup
    };
    const handleClosePopup = () => {
        setIsPopupOpen(false); // Close popup
        setPopupData(null); // Clear data
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

    const onclickExportToExcel = async () => {
        try {
            let exportColumns: IExportColumns[] = [
                { header: "Meeting Id", key: "MeetingID" },
                { header: "Meeting Date", key: "MeetingDate" },
                { header: "Subject", key: "Subject" },
                { header: "Location", key: "Location" },
                { header: "Attendees", key: "Attendees" },
                { header: "Chairperson", key: "ChairpersonName" },
                { header: "Site Name", key: "SiteName" },
                { header: "State Name", key: "StateName" },
                { header: "Form Status", key: "FormStatus" },
                { header: "Minutes Taken And Recorded By", key: "MinutesTakenAndRecordedBy" },
                { header: "Completed/ Total Signature", key: "renderCompletedTotalSignature" },
                { header: "Created Date", key: "Created" },
            ];

            generateExcelTable(FilteredData, exportColumns, `${selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails?.defaultSelectedSites && selectedZoneDetails?.defaultSelectedSites[0]?.SiteName + '- Toolbox Talk.xlsx' : 'Toolbox Talk Master.xlsx'}`);
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


    const ClientColumn = (): IColumn[] => {
        let columns: any[] = [
            {
                key: "key11", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 100, maxWidth: 120,
                onRender: ((itemID: any) => {
                    return <>
                        <div className='dflex'>
                            <Link className="actionBtn btnView dticon" onClick={() => {
                                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.DetailToolboxTalk, siteMasterId: itemID.ID, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState } });
                                props.manageComponentView({
                                    currentComponentName: ComponentNameEnum.DetailToolboxTalk, originalState: props.originalState || props.componentProps.originalState, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, siteMasterId: itemID.ID, originalSiteMasterId: props.siteMasterId, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState,
                                });
                            }}>
                                <TooltipHost content={"View Detail"} id={tooltipId}>
                                    <FontAwesomeIcon icon="eye" />
                                </TooltipHost>
                            </Link>

                            {(!!props.siteMasterId &&
                                (currentUserRoleDetail.isAdmin || currentUserRoleDetail.isSiteManager || currentUserRoleDetail.isSiteSupervisor || currentUserRoleDetail.isStateManager)) ? (
                                <Link className="actionBtn btnEditName dticon" onClick={() => {
                                    setCopyRecordItem(itemID)
                                    setShowCopyDialog(true);

                                }
                                }  >
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
            { key: 'MeetingID', name: 'Meeting', fieldName: 'MeetingID', isResizable: true, minWidth: 70, maxWidth: 120, isSortingRequired: true },
            { key: 'MeetingDate', name: 'Meeting Date', fieldName: 'MeetingDate', isResizable: true, minWidth: 70, maxWidth: 120, isSortingRequired: true },
            { key: 'Subject', name: 'Subject', fieldName: 'Subject', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            { key: 'Location', name: 'Location', fieldName: 'Location', isResizable: true, minWidth: 70, maxWidth: 100, isSortingRequired: true },
            { key: 'ShiftType', name: 'Shift Type', fieldName: 'ShiftType', isResizable: true, minWidth: 70, maxWidth: 100, isSortingRequired: true },
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
                key: 'Attendees', name: 'Attendees', fieldName: 'Attendees', isResizable: true, minWidth: 180, maxWidth: 240, isSortingRequired: true,
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

            { key: 'ChairpersonName', name: 'Chairperson', fieldName: 'ChairpersonName', isResizable: true, minWidth: 100, maxWidth: 180, isSortingRequired: true },
            { key: 'MinutesTakenAndRecordedBy', name: 'Minutes Taken And Recorded By', fieldName: 'MinutesTakenAndRecordedBy', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            {
                key: 'FormStatus', name: 'Form Status', fieldName: 'FormStatus', isResizable: true, minWidth: 80, maxWidth: 150, isSortingRequired: true, onRender: (item: any) => {
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
            breadCrumItems.push({ text: UpdateItem.FirstName, key: UpdateItem.FirstName, currentCompomnetName: ComponentNameEnum.AddToolboxTalk, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, IsUpdate: true, siteMasterId: UpdateItem.Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState } });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AddToolboxTalk, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, originalState: props.originalState || props.componentProps.originalState, siteMasterId: UpdateItem.ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState
            });
        }
        let data: any[] = [];
        if (!!predata?.ID) {
            data.push(predata);
            if (!!data) {
                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                breadCrumItems.push({ text: data[0].FirstName, key: data[0].FirstName, currentCompomnetName: ComponentNameEnum.AddToolboxTalk, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, IsUpdate: true, siteMasterId: data[0].Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState } });
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.AddToolboxTalk, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, originalState: props.originalState || props.componentProps.originalState, siteMasterId: data[0].ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState
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
                        EntityType: UserActionEntityTypeEnum.ToolboxTalk,
                        EntityId: res?.ID,
                        EntityName: res?.MeetingID,
                        Details: `Delete Toolbox Talk`,
                        StateId: props?.qCStateId,
                        LogFor: UserActionLogFor.Both
                    };
                    void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
                });

                const deleteIDsArray = Array.isArray(UpdateItem)
                    ? UpdateItem.map((item: any) => item.Id || item.ID)
                    : [UpdateItem.ID || UpdateItem.Id];
                if (newObjects.length > 0) {
                    await provider.updateListItemsInBatchPnP(ListNames.ToolboxTalk, newObjects);
                    await deleteToolboxTalkMaster(provider, deleteIDsArray);
                    await deleteToolboxTalkDetails(provider, deleteIDsArray);
                    await _ToolboxTalkData(siteData.current);
                }
                toastService.updateLoadingWithSuccess(toastId, "Record deleted successfully!");
                toggleHideDialog();
                setisDisplayEDbtn(false);
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };

    const _getShiftTypeChoices = async () => {
        setIsLoading(true);
        try {
            // Fetch choices from your existing service function
            const roleChoices = await props.provider.choiceOption(ListNames.ToolboxTalk, "ShiftType");

            if (Array.isArray(roleChoices) && roleChoices.length > 0) {

                // Map each choice into a standardized option format
                const optionRoles = roleChoices.map((choice, index) => ({
                    key: index,            // unique key for UI components
                    value: choice,         // actual value
                    text: choice,          // display text
                    label: choice          // optional label (useful for UI libraries)
                }));

                // Save to state
                setShiftTypeOptions(optionRoles);
            } else {
                setShiftTypeOptions([]);
            }
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMethodName: "_getShiftTypeChoices",
                CustomErrormessage: "Error fetching Role choices",
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                PageName: "QuayClean.aspx",
            };
            void logGenerator(props.provider, errorObj);
        } finally {
            setIsLoading(false);
        }
    };



    React.useEffect(() => {
        (async () => {
            const siteItems = await _siteDataUtil(provider);
            siteData.current = siteItems
            await _ToolboxTalkData(siteItems);
        })()

    }, [isRefreshGrid, props.isReload, selectedSiteIds, defaultManager, selectedAttendees, selectedMeetingLocation, filterToDate, filterFromDate, selectedShiftType, selectedItem, selectedZoneDetails]);


    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setCurrentView('card');
        } else {
            setCurrentView('grid');
        }
        _getShiftTypeChoices();
    }, []);

    const _closeDeleteConfirmation = () => {
        toggleHideDialog();
    };
    const closeCopyDialog = () => {
        setShowCopyDialog(false);
    }
    const onClickCopyRecordYes = () => {
        onClickCopy(copyRecordItem)
    }



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

    React.useEffect(() => {
        const filterList = () => {
            let filteredList = ToolboxTalkDetailsData;
            const siteIdToQCStateMap = new Map<string, string>(
                siteData.current.map((item: { ID: any; QCStateId: any; }) => [item.ID, item.QCStateId])
            );
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
            setTotalCount(filteredList?.length);
            setStateCountData(groupedCountArray);
            const attendeeId =
                selectedAttendees && selectedAttendees.value
                    ? selectedAttendees.value
                    : null;

            if (filterType === "Total Toolbox Talk") {
                filteredList = filteredList;
            } else if (filterType === "Total Submitted") {
                filteredList = filteredList.filter((item: any) =>
                    item.FormStatus === "submit"
                );
            } else if (filterType === "Total Save as Draft") {
                filteredList = filteredList.filter((item: any) =>
                    item.FormStatus === "draft"
                );
            }
            else if (filterType === "Pending signature") {
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
            // setIsLoading(false);
            setFilteredData(filteredList);
        };
        // setIsLoading(true);
        filterList();
    }, [ToolboxTalkDetailsData, filterType, selectedStateId]);

    return <>
        {isLoading && <Loader />}

        {popupData && (
            <CopyIMSLink
                isOpen={isPopupOpen}
                closePopup={handleClosePopup}
                Data={popupData}
                Context={context}
                Page="ToolboxTalk"
                PageId="ToolboxTalkId"
                provider={provider}
            />
        )}
        {isSendEmailPopupOpen && (
            <SendEmailIMS
                isOpen={isSendEmailPopupOpen}
                closePopup={handleCloseSendEmail}
                Data={popupData}
                Context={context}
                Page="ToolboxTalk"
                provider={provider} />
        )}
        <CustomModal isModalOpenProps={hideDialog}
            setModalpopUpFalse={_closeDeleteConfirmation}
            subject={"Delete Item"}
            message={'Are you sure, you want to delete this record?'}
            yesButtonText="Yes"
            closeButtonText={"No"}
            onClickOfYes={_confirmDeleteItem} />

        <CustomModal isModalOpenProps={showCopyDialog}
            setModalpopUpFalse={closeCopyDialog}
            subject={"Copy Item"}
            message={'Are you sure, you want to copy this record?'}
            yesButtonText="Yes"
            closeButtonText={"No"}
            onClickOfYes={onClickCopyRecordYes} />


        <ToolboxTalkCountCard data={SummaryData} handleCardClick={handleCardClick} />

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
                                isRequired={true}
                                selectedState={selectedStateId || []}
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
                                    isClearable
                                    onChange={_onManagerChange}
                                    placeholder={"Select Chairperson"} />
                            </div>
                        </div>
                    </div>}
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                    <div className="formControl ims-site-pad">
                        <div className="formControl">
                            <ReactDropdown
                                options={shiftTypeOptions || []}
                                isMultiSelect={false}
                                defaultOption={selectedShiftType}
                                isSorted={false}
                                isClearable={true}
                                onChange={_onShiftTypeChange}
                                placeholder={"Select Shift Type"} />
                        </div>
                    </div>
                </div>
                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                    <div className="formControl ims-site-pad">
                        <div className="formControl">
                            <IMSLocationFilter
                                onChange={onChangeLocationFilter}
                                provider={provider}
                                selectedOptions={selectedMeetingLocation || []}
                                context={context}
                                SiteNameId={props.siteMasterId}
                                Title={"Toolbox Talk"}
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
                                onChangeRangeOption={onChangeRangeOption}
                                isClearable={true}
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
        </div >
        <div className="formGroup">
            {currentView === "grid" ? <>
                <MemoizedDetailList
                    manageComponentView={props.manageComponentView}
                    columns={ClientColumn() as any}
                    items={FilteredData || []}
                    reRenderComponent={true}
                    onSelectedItem={_onItemSelected}
                    searchable={true}
                    CustomselectionMode={
                        ( // !!props.siteMasterId &&
                            (!!PermissionArray && PermissionArray?.includes('Quaysafe') || currentUserRoleDetail.isAdmin || currentUserRoleDetail.isStateManager || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0))
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
                                {<Link className="actionBtn iconSize btnEdit ml-10" disabled={FilteredData?.length == 0 || FilteredData == undefined} style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
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
                                {canShowAddButton &&

                                    <PrimaryButton text="Add" className="btn btn-primary"
                                        onClick={() => {
                                            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                            breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddToolboxTalk, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddToolboxTalk, isAddClient: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, selectedZoneDetails: props.selectedZoneDetails } });
                                            props.manageComponentView({ currentComponentName: ComponentNameEnum.AddToolboxTalk, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, originalState: props.originalState || props.componentProps.originalState, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, selectedZoneDetails: props.selectedZoneDetails });
                                            setIsLoading(false);
                                        }}
                                    />
                                }
                            </div>
                        </>
                    } />
            </> :
                <>
                    <div className="dflex btn-back-ml">
                        {canShowAddButton && <PrimaryButton text="Add" className="btn btn-primary margin-sm-add"
                            onClick={() => {
                                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddToolboxTalk, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddToolboxTalk, isAddClient: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, selectedZoneDetails: props.selectedZoneDetails } });
                                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddToolboxTalk, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, originalState: props.originalState || props.componentProps.originalState, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, selectedZoneDetails: props.selectedZoneDetails });
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
                    <ToolboxCardView
                        items={ToolboxTalkDetailsData}
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
    </>;
};