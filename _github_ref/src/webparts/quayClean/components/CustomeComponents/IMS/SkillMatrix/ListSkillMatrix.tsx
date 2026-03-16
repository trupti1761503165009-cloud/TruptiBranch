/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { DefaultButton, DialogFooter, FocusTrapZone, IColumn, IDropdownOption, Layer, Link, mergeStyleSets, Overlay, Popup, PrimaryButton, SelectionMode, TooltipHost } from "@fluentui/react";
import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { _siteDataUtil, deleteSkillMatrixInfo, deleteSkillMatrixMaster, generateExcelTable, getCAMLQueryFilterExpression, logGenerator, mapSingleValue, onBreadcrumbItemClicked, UserActivityLog } from "../../../../../../Common/Util";
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
import { SkillMatrixCardView } from "../CardView/SkillMatrixCardView";
import { MultipleSiteFilter } from "../../../../../../Common/Filter/MultipleSiteFilter";
import CamlBuilder from "camljs";
import { ICamlQueryFilter, FieldType, LogicalType } from "../../../../../../Common/Constants/DocumentConstants";
import { CopyIMSLink } from "../../../../../../Common/CopyIMSLink";
import { SkillMatrixCountCard } from "./SkillMatrixCountCard";
import { IExportColumns } from "../../UserActivityLog";
import { SendEmailIMS } from "../../../../../../Common/SendEmailIMS";
import { PreDateRangeFilterQuaySafe } from "../../../../../../Common/Filter/PreDateRangeFilterQuaySafe";
import { DataType, DateTimeFormate } from "../../../../../../Common/Constants/CommonConstants";
import ProgressBarWithTooltip from "../../../../../../Common/ProgressBarWithTooltip";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import TabMenu from "../../../CommonComponents/TabMenu";
import { IReactDropOptionProps } from "../../../CommonComponents/reactSelect/IReactDropOptionProps";
import { IMSAttendeesFilter } from "../../../../../../Common/Filter/IMSAttendeesFilter";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
import { formatSPDateToLocal } from "../../../CommonComponents/CommonMethods";


export const ListSkillMatrix: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const appSiteState = useAtomValue(appSiteStateAtom);
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const { PermissionArray } = appSiteState;
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [SkillMatrixData, setSkillMatrixData] = React.useState<any[]>([]);
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : 'grid');
    const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>([]);
    const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>([]);
    const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>([]);
    const [width, setWidth] = React.useState<string>("400px");
    const [isPopupOpen, setIsPopupOpen] = React.useState(false);
    const [popupData, setPopupData] = React.useState<any>(null);
    const [isSendEmailPopupOpen, setIsSendEmailPopupOpen] = React.useState(false);
    const [FilteredData, setFilteredData] = React.useState<any>([]);
    const [SummaryData, setSummaryData] = React.useState<any>([]);
    const [filterType, setFilterType] = React.useState<any>("");
    const [fromDate, setFromDate] = React.useState<Date | any>();
    const [toDate, setToDate] = React.useState<Date | any>();
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);
    const [filterFromDate, setFilterFromDate] = React.useState<any>(undefined);
    const [TrainingAttendance, setTrainingAttendance] = React.useState<string>("");
    const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: 'Top 30 Records', text: 'Top 30 Records' });
    const [shouldRefreshOptions, setShouldRefreshOptions] = React.useState(true);
    const [stateTabData, setStateTabData] = React.useState<any>([]);
    const [stateCountData, setStateCountData] = React.useState<any>();
    const [selectedStateId, setSelectedStateId] = React.useState<any[]>([]);
    const [attendeesOptions, setAttendeesOptions] = React.useState<IReactDropOptionProps[]>([]);
    const [selectedAttendees, setSelectedAttendees] = React.useState<IReactDropOptionProps>("" as any)
    let siteData = React.useRef<any>([]);
    const [TotalCount, setTotalCount] = React.useState<any>(0);
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

    const genrateAttendeesOptions = (data: any[]) => {
        let attendeesOptions: IReactDropOptionProps[] = [];
        if (data.length > 0) {
            let attendees = data.map(r => r.FullAttendeesArray).flat()
            if (attendees.length > 0) {

                if (attendees.length > 0) {
                    attendees = attendees.filter((i) => !!i.Title)
                    attendeesOptions = attendees.map((i) => {
                        return { label: i.Title, value: i.AttendeesEmailId }
                    })
                }
                const uniqueAttendees = Array.from(
                    new Map(attendees.map(item => [item.value, item])).values()
                );
            }
        }
        return attendeesOptions;
    }

    const onStateChange = (option: any): void => {
        if (option) {
            let stateId: any[] = [option]
            setSelectedStateId(stateId)
        } else {
            setSelectedStateId([])
        }
    };

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

    const handleCardClick = (title: string | null) => {
        if (title) {
            setFilterType(title);
        } else {
            setFilterType("");
        }
    };

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


    const onClickNo = () => {
        hidePopup();
    };

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


    const _SkillMatrixInfoData = async (stateItems: any[]) => {
        setIsLoading(true);

        try {
            let filterFields: any[] = [];

            if (selectedSiteIds && selectedSiteIds.length > 0) {
                filterFields.push({
                    fieldName: "SiteName",
                    fieldValue: selectedSiteIds,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.In
                });
            } else if (selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId?.length > 0) {
                filterFields.push({
                    fieldName: "SiteName",
                    fieldValue: selectedZoneDetails?.defaultSelectedSitesId,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.In
                });
            } else {
                if (selectedZoneDetails && selectedZoneDetails?.selectedSitesId?.length > 0) {
                    filterFields.push({
                        fieldName: "SiteName",
                        fieldValue: selectedZoneDetails?.selectedSitesId,
                        fieldType: FieldType.LookupById,
                        LogicalType: LogicalType.In
                    });
                }
            }

            filterFields.push({
                fieldName: "IsDeleted",
                fieldValue: true,
                fieldType: FieldType.Boolean,
                LogicalType: LogicalType.NotEqualTo
            });

            let camlQuery = new CamlBuilder()
                .View([
                    "ID",
                    "SiteName",
                    "SkillMatrix",
                    "AttendeesEmail"
                    ,"StateName"
                ])
                .LeftJoin("SiteName", "SiteName").
                Select('StateNameValue', "StateName")
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query();

            if (filterFields.length > 0) {
                const expressions = getCAMLQueryFilterExpression(filterFields);
                camlQuery.Where().All(expressions);
            }

            const results = await provider.getItemsByCAMLQuery(
                ListNames.SkillMatrixInfo,
                camlQuery.ToString()
            );

            if (results) {
                const SkillMatrixInfoData = results.map((data: any) => {
                    const siteId = data?.SiteName?.[0]?.lookupId;
                    const stateId = stateItems?.find(i => Number(i.ID) === Number(siteId))?.QCStateId || "";
                    return {
                        ID: data.ID,
                        SiteNameId: siteId || "",
                        SiteName: !!data.SiteName ? data.SiteName[0].lookupValue : '',
                        SkillMatrixId: data?.SkillMatrix?.[0]?.lookupId || "",
                        SkillMatrix: data?.SkillMatrix?.[0]?.lookupValue || "",
                        AttendeesEmailId: data?.AttendeesEmail?.[0]?.lookupId || "",
                        AttendeesEmail: data?.AttendeesEmail?.[0]?.lookupValue || "",
                        stateId
                    };
                });

                await _SkillMatrixData(SkillMatrixInfoData);
            }
        } catch (ex) {
            console.log(ex);
            void logGenerator(provider, {
                ErrorMethodName: "_getSkillMatrixInfoData",
                CustomErrormessage: "error in get SkillMatrixInfo data",
                ErrorMessage: ex.toString(),
                ErrorStackTrace: "",
                PageName: "QuayClean.aspx"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // const onClickSendEmail = async (item: any) => {

    //     if (!!item.ID && item.ID > 0) {
    //         const toastId = toastService.loading('Loading...');
    //         const toastMessage = 'Email sent successfully!';
    //         await props.provider.updateItem({ IntialEmail: false }, ListNames.SkillMatrix, item.ID)
    //         toastService.updateLoadingWithSuccess(toastId, toastMessage);
    //     }
    // }
    // const _SkillMatrixInfoData = async (stateItems: any[]) => {
    //     setIsLoading(true);

    //     try {
    //         let filterFields: any[] = [];

    //         if (selectedSiteIds && selectedSiteIds.length > 0) {
    //             filterFields.push({
    //                 fieldName: "SiteName",
    //                 fieldValue: selectedSiteIds,
    //                 fieldType: FieldType.LookupById,
    //                 LogicalType: LogicalType.EqualTo
    //             });
    //         }
    //         // else if (props.siteMasterId) {
    //         else if (props?.selectedZoneDetails && props?.selectedZoneDetails?.selectedSitesId?.length > 0) {
    //             filterFields.push({
    //                 fieldName: "SiteName",
    //                 fieldValue: props?.selectedZoneDetails?.selectedSitesId,
    //                 fieldType: FieldType.LookupById,
    //                 LogicalType: LogicalType.In
    //             });
    //         }
    //         filterFields.push({
    //             fieldName: "IsDeleted",
    //             fieldValue: true,
    //             fieldType: FieldType.Boolean,
    //             LogicalType: LogicalType.NotEqualTo
    //         });

    //         let camlQuery = new CamlBuilder()
    //             .View([
    //                 "ID",
    //                 "SiteName",
    //                 "SkillMatrix",
    //                 "AttendeesEmail"
    //             ])
    //             .Scope(CamlBuilder.ViewScope.RecursiveAll)
    //             .RowLimit(5000, true)
    //             .Query();

    //         if (filterFields.length > 0) {
    //             const expressions = getCAMLQueryFilterExpression(filterFields);
    //             camlQuery.Where().All(expressions);
    //         }

    //         const results = await provider.getItemsByCAMLQuery(
    //             ListNames.SkillMatrixInfo,
    //             camlQuery.ToString()
    //         );

    //         if (results) {
    //             const SkillMatrixInfoData = results.map((data: any) => {
    //                 const siteId = data?.SiteName?.[0]?.lookupId;
    //                 const stateId = stateItems?.find(i => Number(i.ID) === Number(siteId))?.QCStateId || "";
    //                 return {
    //                     ID: data.ID,
    //                     SiteNameId: siteId || "",
    //                     SiteName: !!data.SiteName ? data.SiteName[0].lookupValue : '',
    //                     SkillMatrixId: data?.SkillMatrix?.[0]?.lookupId || "",
    //                     SkillMatrix: data?.SkillMatrix?.[0]?.lookupValue || "",
    //                     AttendeesEmailId: data?.AttendeesEmail?.[0]?.lookupId || "",
    //                     AttendeesEmail: data?.AttendeesEmail?.[0]?.lookupValue || "",
    //                     stateId
    //                 };
    //             });

    //             await _SkillMatrixData(SkillMatrixInfoData);
    //         }
    //     } catch (ex) {
    //         console.log(ex);
    //         void logGenerator(provider, {
    //             ErrorMethodName: "_getSkillMatrixInfoData",
    //             CustomErrormessage: "error in get SkillMatrixInfo data",
    //             ErrorMessage: ex.toString(),
    //             ErrorStackTrace: "",
    //             PageName: "QuayClean.aspx"
    //         });
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const getSkillMatrixSignature = async (skillMatrixId?: number[]) => {
        try {
            let skillMatrixSignatureData: any[] = [];

            const camlQuery = new CamlBuilder()
                .View(['ID', 'Title', 'SkillMatrix', 'QuaycleanEmployee', 'IsActive'])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)

                .RowLimit(5000, true)
                .Query()
            let filterFields: ICamlQueryFilter[] = [{
                fieldName: "IsActive",
                fieldValue: true,
                fieldType: FieldType.Boolean,
                LogicalType: LogicalType.EqualTo
            },
            {
                fieldName: "CleanerSignature",
                fieldValue: true,
                fieldType: FieldType.Boolean,
                LogicalType: LogicalType.EqualTo
            }
            ];


            // if (!!skillMatrixId && skillMatrixId.length > 0) {
            //     filterFields.push({
            //         fieldName: "SkillMatrix",
            //         fieldValue: skillMatrixId,
            //         fieldType: FieldType.LookupById,
            //         LogicalType: LogicalType.In
            //     });
            // }


            if (filterFields.length > 0) {
                const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
                camlQuery.Where().All(categoriesExpressions);
            }

            let data = await props.provider.getItemsByCAMLQuery(ListNames.SkillMatrixSignature, camlQuery.ToString());
            if (!!data && data.length > 0) {
                skillMatrixSignatureData = data.map((i) => {
                    return {
                        ID: mapSingleValue(i.ID, DataType.number),
                        Title: mapSingleValue(i.Title, DataType.string),
                        // Signature: mapSingleValue(i.Signature, DataType.string),
                        SkillMatrix: mapSingleValue(i.SkillMatrix, DataType.lookup),
                        QuaycleanEmployee: mapSingleValue(i.QuaycleanEmployee, DataType.lookup),
                        QuaycleanEmployeeId: mapSingleValue(i.QuaycleanEmployee, DataType.lookupId)
                    }
                })
            }
            // setSkillMatrixSignatureItems(skillMatrixSignatureData);
            // setIsSignatureDataGet(true)
            return skillMatrixSignatureData;
        } catch (error) {
            // setIsSignatureDataGet(true)
            console.log(error);
            return [];
        }

    }

    const _SkillMatrixData = async (SkillMatrixInfoData: any[]) => {
        setIsLoading(true);
        try {
            let filterFields: any[] = [];
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
                }
            );
            const isTop30Records = selectedItem?.key === "Top 30 Records";
            if (!isTop30Records) {
                if (filterFromDate) {
                    filterFields.push({
                        fieldName: "Created",
                        fieldValue: new Date(filterFromDate + 'T00:00:00').toISOString(),
                        fieldType: FieldType.DateTime,
                        LogicalType: LogicalType.GreaterThanOrEqualTo
                    });
                }
                if (filterToDate) {
                    filterFields.push({
                        fieldName: "Created",
                        fieldValue: new Date(filterToDate + 'T23:59:59').toISOString(),
                        fieldType: FieldType.DateTime,
                        LogicalType: LogicalType.LessThanOrEqualTo
                    });
                }
            }

            let camlQuery = new CamlBuilder()
                .View([
                    "ID",
                    "Title",
                    "FormStatus",
                    "SkillMatrixDate",
                    "TrainingAttendance",
                    "VenueTrained",
                    "Created",
                    "Modified",
                    "IsCompleted",
                    "SignatureDoneBy"
                ])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(isTop30Records ? 30 : 5000, isTop30Records ? false : true)
                .Query();

            if (filterFields.length > 0) {
                const expressions = getCAMLQueryFilterExpression(filterFields);
                camlQuery.Where().All(expressions);
            }
            const results = await provider.getItemsByCAMLQuery(
                ListNames.SkillMatrix,
                camlQuery.ToString(),
                {
                    SortField: "Modified",
                    SortDir: "Desc"
                }
            );
            if (results) {
                let skillMatrixId: number[] = [];
                if (!!props.siteMasterId && props.siteMasterId > 0 && results.length > 0) {
                    skillMatrixId = results.map((r) => r.ID).filter((value, index, self) => self.indexOf(value) === index);
                }
                if ((selectedSiteIds !== null && selectedSiteIds.length > 0)) {
                    skillMatrixId = results.map((r) => r.ID).filter((value, index, self) => self.indexOf(value) === index);
                }
                // let skillMatrixSignatureData = await getSkillMatrixSignature(skillMatrixId);
                // let skillMatrixSignatureData: any[] = skillMatrixSignatureItems;
                let SkillMatrixData = results.map((data) => {
                    let matchingInfo = SkillMatrixInfoData.find(
                        (info: any) => info.SkillMatrixId == data.ID
                    );

                    // Transform the matchingInfo object into FullAttendees[0] with dynamic key mapping
                    let skillMatrixSignatureData: any[] = data?.SignatureDoneBy;

                    let transformedFullAttendees = matchingInfo
                        ? [
                            {
                                Id: matchingInfo.AttendeesEmailId,
                                SiteNameId: matchingInfo.SiteNameId,
                                SiteName: matchingInfo.SiteName,
                                SkillMatrixId: matchingInfo.SkillMatrixId,
                                SkillMatrix: matchingInfo.SkillMatrix,
                                Title: data.TrainingAttendance, // Renamed dynamically
                                AttendeesEmailId: matchingInfo.AttendeesEmailId,
                                stateId: matchingInfo.stateId
                            },
                        ]
                        : [];

                    const completedSignatureCount: number = skillMatrixSignatureData.length || 0;
                    const pendingSignatureUserNames = completedSignatureCount === 0 ? [!!data.TrainingAttendance ? data.TrainingAttendance : ""] : [];
                    // if (skillMatrixSignatureData?.length > 0) {
                    // let userId = (!!transformedFullAttendees && transformedFullAttendees.length > 0) ? transformedFullAttendees.map((r: any) => r.AttendeesEmailId) : []
                    // completedSignatureCount = skillMatrixSignatureData.filter(i => i.Id == data.ID && userId.indexOf(i?.QuaycleanEmployeeId) > -1)?.length || 0;
                    // }
                    let totalSignature: number = 1;
                    return {
                        Id: data.ID, // Renamed from ID to Id
                        ID: data.ID,
                        // isSignatureLoading: isSignatureDataGet == true ? false : true,
                        isSignatureLoading: false,
                        pendingUserNames: pendingSignatureUserNames,
                        completedSignature: completedSignatureCount,
                        renderCompletedTotalSignature: `${completedSignatureCount}/${totalSignature}`,
                        totalSignature: totalSignature,
                        // isCompletedSignature: totalSignature == completedSignatureCount || 0,
                        isCompletedSignature: ((totalSignature > 0) ? totalSignature == completedSignatureCount : false) || false,
                        Title: data.Title,
                        FormStatus: !!data.FormStatus ? data.FormStatus : "",
                        Date: !!data.Created ? moment(data.Created).format("DD/MM/YYYY") : "",
                        TrainingAttendance: !!data.TrainingAttendance ? data.TrainingAttendance : "",
                        VenueTrained: !!data.VenueTrained ? data.VenueTrained : "",
                        // Created: !!data.Created ? moment(data.Created).format("DD-MM-YYYY hh:mm A") : "",
                        Created: !!data.Created ? formatSPDateToLocal(data.Created) : "",
                        Modified: !!data.Modified ? data.Modified : null,
                        IsCompleted: !!data.IsCompleted ? data.IsCompleted : null,
                        SkillMatrixDate: !!data.SkillMatrixDate ? moment(data.SkillMatrixDate).format("DD-MM-YYYY") : "",
                        SiteName: matchingInfo ? matchingInfo.SiteName : "",
                        SiteNameId: matchingInfo ? matchingInfo.SiteNameId : null,
                        stateId: matchingInfo ? matchingInfo.stateId : "",
                        FullAttendees: transformedFullAttendees, // Updated to be an array with transformed keys
                        FullAttendeesArray: transformedFullAttendees,
                    };
                });

                if (!!props.siteMasterId) {
                    SkillMatrixData = SkillMatrixData.filter((data: any) => data.SiteNameId === props.siteMasterId);
                }
                SkillMatrixData = SkillMatrixData.sort((a: any, b: any) => {
                    return moment(b.Modified).diff(moment(a.Modified));
                });

                if (props.isNotGeneral === true && props.siteMasterId === undefined) {
                    const filteredSkillMatrixData = SkillMatrixData.filter((item: any) => item.SiteNameId !== null);

                    // PermissionData
                    let filteredData: any[];
                    if (!!props.siteMasterId || currentUserRoleDetail?.isAdmin) {
                        filteredData = filteredSkillMatrixData;
                    } else {
                        let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                        filteredData = !!filteredSkillMatrixData && filteredSkillMatrixData?.filter((item: any) =>
                            AllSiteIds.includes(item?.SiteNameId)
                        );
                    }
                    // filteredData = filteredData?.sort((a: any, b: any) => {
                    //     return moment(b.Modified).diff(moment(a.Modified));
                    // });

                    // if (isTop30Records) {
                    //     filteredData = filteredData.slice(0, 30);
                    // }
                    if (shouldRefreshOptions && results?.length > 0) {
                        let attendeesOptions = genrateAttendeesOptions(filteredData);
                        setAttendeesOptions(attendeesOptions);
                        setShouldRefreshOptions(false);
                    }
                    setSkillMatrixData(filteredData);
                    // if (isSignatureDataGet == false) {
                    //     setIsSetSignatureData(true);
                    // } else {
                    const Summary = await getSummaryData(filteredData);
                    setSummaryData(Summary);
                    // }
                }
                else {
                    // PermissionData
                    let filteredData: any[];
                    if (!!props.siteMasterId || currentUserRoleDetail?.isAdmin) {
                        filteredData = SkillMatrixData;
                    } else {
                        let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                        filteredData = !!SkillMatrixData && SkillMatrixData?.filter((item: any) =>
                            AllSiteIds.includes(item?.SiteNameId)
                        );
                    }
                    filteredData = filteredData?.sort((a: any, b: any) => {
                        return moment(b.Modified).diff(moment(a.Modified));
                    });

                    if (isTop30Records) {
                        filteredData = filteredData.slice(0, 30);
                    }
                    let attendeesOptions = genrateAttendeesOptions(filteredData);
                    setAttendeesOptions(attendeesOptions);
                    setSkillMatrixData(filteredData);
                    // if (isSignatureDataGet == false) {

                    //     setIsSetSignatureData(true);
                    // } else {
                    const Summary = await getSummaryData(filteredData);
                    setSummaryData(Summary);
                    // }
                }
            }

        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }
    };
    // const _SkillMatrixData = async (SkillMatrixInfoData: any[]) => {
    //     setIsLoading(true);
    //     try {
    //         let filterFields: any[] = [];
    //         filterFields.push(
    //             {
    //                 fieldName: "IsActive",
    //                 fieldValue: true,
    //                 fieldType: FieldType.Boolean,
    //                 LogicalType: LogicalType.EqualTo
    //             },
    //             {
    //                 fieldName: "IsDeleted",
    //                 fieldValue: true,
    //                 fieldType: FieldType.Boolean,
    //                 LogicalType: LogicalType.NotEqualTo
    //             }
    //         );
    //         const isTop30Records = selectedItem?.key == "Top 30 Records";
    //         if (!isTop30Records) {
    //             if (filterFromDate) {
    //                 filterFields.push({
    //                     fieldName: "Created",
    //                     fieldValue: filterFromDate,
    //                     fieldType: FieldType.DateTime,
    //                     LogicalType: LogicalType.GreaterThanOrEqualTo
    //                 });
    //             }
    //             if (filterToDate) {
    //                 filterFields.push({
    //                     fieldName: "Created",
    //                     fieldValue: filterToDate,
    //                     fieldType: FieldType.DateTime,
    //                     LogicalType: LogicalType.LessThanOrEqualTo
    //                 });
    //             }
    //         }

    //         let camlQuery = new CamlBuilder()
    //             .View([
    //                 "ID",
    //                 "Title",
    //                 "FormStatus",
    //                 "SkillMatrixDate",
    //                 "TrainingAttendance",
    //                 "VenueTrained",
    //                 "Created",
    //                 "Modified",
    //                 "IsCompleted",
    //                 "SignatureDoneBy"
    //             ])
    //             .Scope(CamlBuilder.ViewScope.RecursiveAll)
    //             .RowLimit(isTop30Records ? 30 : 5000, !isTop30Records)
    //             .Query();

    //         if (filterFields.length > 0) {
    //             const expressions = getCAMLQueryFilterExpression(filterFields);
    //             camlQuery.Where().All(expressions);
    //         }

    //         const results = await provider.getItemsByCAMLQuery(
    //             ListNames.SkillMatrix,
    //             camlQuery.ToString()
    //         );

    //         if (results) {
    //             let SkillMatrixData = results.map((data: any) => {
    //                 let matchingInfo = SkillMatrixInfoData.find(
    //                     (info: any) => info.SkillMatrixId == data.ID
    //                 );

    //                 const completedSignatureCount = data?.SignatureDoneBy?.length || 0;
    //                 const totalSignature = 1;

    //                 return {
    //                     Id: data.ID,
    //                     ID: data.ID,
    //                     Title: data.Title,
    //                     FormStatus: data.FormStatus || "",
    //                     Date: data.Created ? moment(data.Created).format("DD/MM/YYYY") : "",
    //                     Created: data.Created ? moment(data.Created).format("DD-MM-YYYY hh:mm A") : "",
    //                     Modified: data.Modified || null,
    //                     SkillMatrixDate: data.SkillMatrixDate ? moment(data.SkillMatrixDate).format("DD-MM-YYYY") : "",
    //                     TrainingAttendance: data.TrainingAttendance || "",
    //                     VenueTrained: data.VenueTrained || "",
    //                     completedSignature: completedSignatureCount,
    //                     totalSignature,
    //                     renderCompletedTotalSignature: `${completedSignatureCount}/${totalSignature}`,
    //                     isCompletedSignature: totalSignature > 0 && completedSignatureCount === totalSignature,
    //                     SiteName: matchingInfo?.SiteName || "",
    //                     SiteNameId: matchingInfo?.SiteNameId || null,
    //                     stateId: matchingInfo?.stateId || "",
    //                     FullAttendees: matchingInfo ? [{
    //                         Id: matchingInfo.AttendeesEmailId,
    //                         Title: matchingInfo.AttendeesEmail,
    //                         SiteNameId: matchingInfo.SiteNameId,
    //                         SiteName: matchingInfo.SiteName,
    //                         SkillMatrixId: matchingInfo.SkillMatrixId,
    //                         stateId: matchingInfo.stateId
    //                     }] : [],
    //                     FullAttendeesArray: matchingInfo ? [{
    //                         Id: matchingInfo.AttendeesEmailId,
    //                         Title: matchingInfo.AttendeesEmail
    //                     }] : [],
    //                     isSignatureLoading: false
    //                 };
    //             });

    //             // Permission handling
    //             if (!props.siteMasterId && !currentUserRoleDetail?.isAdmin) {
    //                 const allowedSites = currentUserRoleDetail?.currentUserAllCombineSites || [];
    //                 SkillMatrixData = SkillMatrixData.filter(item =>
    //                     allowedSites.includes(item.SiteNameId)
    //                 );
    //             }

    //             SkillMatrixData = SkillMatrixData.sort((a, b) =>
    //                 moment(b.Modified).diff(moment(a.Modified))
    //             );

    //             if (isTop30Records) {
    //                 SkillMatrixData = SkillMatrixData.slice(0, 30);
    //             }

    //             setSkillMatrixData(SkillMatrixData);

    //             const Summary = await getSummaryData(SkillMatrixData);
    //             setSummaryData(Summary);
    //         }
    //     } catch (ex) {
    //         console.log(ex);
    //         void logGenerator(provider, {
    //             ErrorMethodName: "_getSkillMatrixData",
    //             CustomErrormessage: "error in get SkillMatrix data",
    //             ErrorMessage: ex.toString(),
    //             ErrorStackTrace: "",
    //             PageName: "QuayClean.aspx"
    //         });
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const getSummaryData = (ListData: any) => {
        const totalSkillMatrix = ListData.length; // Total count (same as totalAssets)
        const totalSubmittedData = ListData.filter((asset: any) =>
            asset.FormStatus === "Submitted"
        ).length;

        const totalSaveAsDraftData = ListData.filter((asset: any) =>
            asset.FormStatus !== "Submitted"
        ).length;
        // const totalCompletedSignature = ListData.filter((i: any) => i.isCompletedSignature == true).length;
        // const totalPendingSignature = ListData.filter((i: any) => i.isCompletedSignature == false).length;
        const totalSignature = ListData.reduce(
            (sum: any, item: any) => sum + (item.totalSignature || 0),
            0
        );
        const totalCompletedSignature = ListData.reduce(
            (sum: any, item: any) => sum + (item.completedSignature || 0),
            0
        );
        const totalPendingSignature = totalSignature - totalCompletedSignature;
        return {
            totalSkillMatrix,
            totalSubmittedData,
            totalSaveAsDraftData,
            totalCompletedSignature,
            totalPendingSignature
        };
    };

    const onclickExportToExcel = async () => {
        try {
            let exportColumns: IExportColumns[] = [
                { header: "Skill Matrix", key: "Title" },
                { header: "Skill Matrix Date", key: "SkillMatrixDate" },
                { header: "Venue Trained", key: "VenueTrained" },
                { header: "Attendees", key: "TrainingAttendance" },
                { header: "Site Name", key: "SiteName" },
                { header: "State Name", key: "StateName" },
                { header: "Form Status", key: "FormStatus" },
                { header: "Completed/ Total Signature", key: "renderCompletedTotalSignature" },
                { header: "Created Date", key: "Created" },
            ];

            generateExcelTable(FilteredData, exportColumns, `${selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails?.defaultSelectedSites && selectedZoneDetails?.defaultSelectedSites[0]?.SiteName + '- Skill Matrix.xlsx' : 'Skill Matrix Master.xlsx'}`);
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
                            <div>
                                <Link className="actionBtn btnView dticon" onClick={() => {
                                    let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                    breadCrumItems.push({ text: itemID.SiteName, key: itemID.SiteName, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.DetailSkillMatrix, siteMasterId: itemID.ID, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, isShowDetailOnly: true, breadCrumItems: breadCrumItems } });
                                    props.manageComponentView({
                                        currentComponentName: ComponentNameEnum.DetailSkillMatrix, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, isNotGeneral: props.isNotGeneral, originalState: props.originalState || props.componentProps.originalState, siteMasterId: itemID.ID, originalSiteMasterId: props.siteMasterId || itemID.SiteNameId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, breadCrumItems: breadCrumItems, isDirectView: true
                                    });
                                }}>
                                    <TooltipHost content={"View Detail"} id={tooltipId}>
                                        <FontAwesomeIcon icon="eye" />
                                    </TooltipHost>
                                </Link>
                            </div>
                            {itemID.IsCompleted !== true && props.siteMasterId &&
                                <div>
                                    <Link className="actionBtn btnInfo dticon" onClick={() => { _SkillMatrixSignature(itemID.ID, itemID) }}>
                                        <TooltipHost content={"Competency"} id={tooltipId}>
                                            <FontAwesomeIcon icon="plus" />
                                        </TooltipHost>
                                    </Link>
                                </div>}
                            {(currentUserRoleDetail.isAdmin || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isSiteManager || currentUserRoleDetail.isSiteSupervisor || currentUserRoleDetail.isWHSChairperson) && <Link
                                className="actionBtn btnEdit dticon"
                                onClick={() => handleOpenPopup(itemID)}
                            >
                                <TooltipHost content={"Copy Link"} id={`tooltip_${itemID.ID}`}>
                                    <FontAwesomeIcon icon="link" />
                                </TooltipHost>
                            </Link>}
                            {(itemID?.FormStatus == "Submitted") && <Link
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
            { key: 'SkillMatrixDate', name: 'Skill Matrix Date', fieldName: 'SkillMatrixDate', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            { key: 'SkillMatrix', name: 'Skill Matrix', fieldName: 'Title', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            {
                key: 'renderCompletedTotalSignature', name: 'Completed/ Total Signature', fieldName: 'renderCompletedTotalSignature', isResizable: true, minWidth: 220, maxWidth: 220, isSortingRequired: true,
                onRender: (item: any) => {

                    return item.isSignatureLoading ? <div>
                        <span style={{ width: "75px" }}>
                            <FontAwesomeIcon className="spinerColor" icon={faSpinner} spin />
                        </span>
                    </div> :
                        <ProgressBarWithTooltip
                            renderCompletedTotalSignature={item?.renderCompletedTotalSignature}
                            progressValue={item?.completedSignature}
                            maxValue={item?.totalSignature}
                            pendingSingUserName={item?.pendingUserNames}
                        />
                },
            },
            { key: 'VenueTrained', name: 'Venue Trained', fieldName: 'VenueTrained', isResizable: true, minWidth: 100, maxWidth: 250, isSortingRequired: true },
            {
                key: 'TrainingAttendance', name: 'Attendees', fieldName: 'TrainingAttendance', isResizable: true, minWidth: 100, maxWidth: 250, isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.Attendees !== "") {
                        return (
                            <>
                                <Link className="tooltipcls">
                                    <TooltipHost content={item.TrainingAttendance} id={tooltipId}>
                                        <span className="attendees-badge-cls">{item.TrainingAttendance}</span>
                                    </TooltipHost>
                                </Link>
                            </>
                        );
                    }
                },
            },
            { key: 'FormStatus', name: 'Form Status', fieldName: 'FormStatus', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            { key: 'Created', name: 'Created Date', fieldName: 'Created', isResizable: true, minWidth: 100, maxWidth: 200, isSortingRequired: true },
        ];
        if (selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId?.length == 1) {
            columns = columns.filter(item => item.key != "SiteName")
        }
        if (props.siteMasterId === 197) {
            columns = columns.filter(item => item.key !== "Created");
        }

        return columns;
    };

    const onclickEdit = (predata: any) => {
        setisDisplayEDbtn(false);
        if (!!UpdateItem) {
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({ text: UpdateItem.FirstName, key: UpdateItem.FirstName, currentCompomnetName: ComponentNameEnum.SkillMatrixs, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, IsUpdate: true, siteMasterId: UpdateItem.Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState } });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.SkillMatrixs, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, isNotGeneral: props.isNotGeneral, isAllEdit: true, UpdateItemID: UpdateItem.ID, originalState: props.originalState || props.componentProps.originalState, siteMasterId: UpdateItem.ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, selectedZoneDetails: props.selectedZoneDetails
            });
        } else {
            let data: any[] = [];
            if (!!predata?.ID) {
                data.push(predata);
                if (!!data) {
                    let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                    breadCrumItems.push({ text: data[0].FirstName, key: data[0].FirstName, currentCompomnetName: ComponentNameEnum.SkillMatrixs, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, IsUpdate: true, siteMasterId: data[0].Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState } });
                    props.manageComponentView({
                        currentComponentName: ComponentNameEnum.SkillMatrixs, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, isNotGeneral: props.isNotGeneral, isAllEdit: true, UpdateItemID: data[0].ID, originalState: props.originalState || props.componentProps.originalState, siteMasterId: data[0].ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, selectedZoneDetails: props.selectedZoneDetails
                    });
                }
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

    const _SkillMatrixSignature = (CurrentId: any, itemID: any) => {
        setTrainingAttendance(itemID?.TrainingAttendance);
        setIsLoading(true);
        try {

            const select = ["ID,IsLearningCompleted"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `SkillMatrixId eq ${CurrentId} and IsActive eq 1`,
                listName: ListNames.SkillMatrixSignature,
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const SignatureData = results.map((data) => {
                        return {
                            ID: data.ID,
                            IsLearningCompleted: !!data.IsLearningCompleted ? data.IsLearningCompleted : false,
                        };
                    });
                    if (SignatureData[0].IsLearningCompleted === true) {
                        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                        breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddSkillMatrix, siteMasterId: itemID.ID, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState } });
                        props.manageComponentView({
                            currentComponentName: ComponentNameEnum.AddSkillMatrix, dataObj: props.componentProps.dataObj, IsUpdate: true, originalState: props.originalState || props.componentProps.originalState, siteMasterId: itemID.ID, originalSiteMasterId: props.siteMasterId, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState
                        });
                    } else {
                        showPopup();
                    }
                    setIsLoading(false);
                }
            }).catch((error: any) => {
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
                        EntityType: UserActionEntityTypeEnum.SkillMatrix,
                        EntityId: res?.ID,
                        EntityName: res?.Title,
                        LogFor: UserActionLogFor.Both,
                        Details: `Delete Skill Matrix`,
                        StateId: props?.qCStateId
                    };
                    void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
                });
                const deleteIDsArray = Array.isArray(UpdateItem)
                    ? UpdateItem.map((item: any) => item.Id || item.ID)
                    : [UpdateItem.ID || UpdateItem.Id];

                if (newObjects.length > 0) {
                    const siteNameId = Array.isArray(UpdateItem)
                        ? UpdateItem[0]?.SiteNameId
                        : UpdateItem?.SiteNameId;

                    await deleteSkillMatrixInfo(provider, deleteIDsArray, siteNameId);
                    setIsRefreshGrid(prevState => !prevState);
                }
                // const deleteIDsArray = Array.isArray(UpdateItem)
                //     ? UpdateItem.map((item: any) => item.Id || item.ID)
                //     : [UpdateItem.ID || UpdateItem.Id];
                // if (newObjects.length > 0) {
                //     // await provider.updateListItemsInBatchPnP(ListNames.SkillMatrix, newObjects);
                //     // await provider.updateListItemsInBatchPnP(ListNames.SkillMatrixInfo, newObjects);
                //     await deleteSkillMatrixInfo(provider, deleteIDsArray);
                //     // await deleteSkillMatrixMaster(provider, deleteIDsArray);
                //     setIsRefreshGrid(prevState => !prevState);
                // }
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
        // _SkillMatrixInfoData();
        (async () => {
            const siteItems = await _siteDataUtil(provider);
            siteData.current = siteItems
            await _SkillMatrixInfoData(siteItems);
        })()
    }, [isRefreshGrid, props.isReload, selectedSiteIds, filterFromDate, filterToDate, selectedItem, selectedZoneDetails]);


    const _closeDeleteConfirmation = () => {
        toggleHideDialog();
    };


    const onChangeAttendeesFilter = (value: IReactDropOptionProps) => {
        if (!!value) {
            setSelectedAttendees(value)
        } else {
            setSelectedAttendees("" as any)
        }
    }

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setCurrentView('card');
        } else {
            setCurrentView('grid');
        }
    }, []);

    React.useEffect(() => {
        const filterList = () => {
            let filteredList = SkillMatrixData;
            const siteIdToQCStateMap = new Map<string, string>(
                siteData.current.map((item: { ID: any; QCStateId: any; }) => [item.ID, item.QCStateId])
            );
            if (!!selectedAttendees && selectedAttendees?.label) {
                // filteredList = filteredList.filter(r => r.AttendeesEmailId.includes(selectedAttendees?.value))
                filteredList = filteredList.filter(r => r?.FullAttendeesArray?.filter((J: any) => J.AttendeesEmailId == selectedAttendees?.value).length > 0)

            }
            const Summary = getSummaryData(filteredList);
            setSummaryData(Summary);
            setTotalCount(filteredList?.length);
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
            setStateCountData(groupedCountArray);
            if (filterType === "Total Skill Matrix") {
                filteredList = SkillMatrixData;
            } else if (filterType === "Total Submitted") {
                filteredList = SkillMatrixData.filter((item: any) =>
                    item.FormStatus === "Submitted"
                );
            } else if (filterType === "Total Save as Draft") {
                filteredList = SkillMatrixData.filter((item: any) =>
                    item.FormStatus !== "Submitted"
                );
            } else if (filterType === "Pending signature") {
                filteredList = SkillMatrixData.filter((item: any) =>
                    item.isCompletedSignature == false
                );
            }
            else if (filterType === "Completed Signature") {
                filteredList = SkillMatrixData.filter((item: any) =>
                    item.isCompletedSignature == true
                );
            }
            // setIsLoading(false);
            setFilteredData(filteredList);
        };
        // setIsLoading(true);
        filterList();
        // }, [SkillMatrixData, filterType, skillMatrixSignatureItems]);
    }, [SkillMatrixData, filterType, selectedStateId, selectedAttendees]);

    return <>
        {isLoading && <Loader />}
        {popupData && (
            <CopyIMSLink
                isOpen={isPopupOpen}
                closePopup={handleClosePopup}
                Data={popupData}
                Context={context}
                Page="SkillMatrix"
                PageId="SkillMatrixId"
                provider={provider}
            />
        )}
        {isSendEmailPopupOpen && (
            <SendEmailIMS
                isOpen={isSendEmailPopupOpen}
                closePopup={handleCloseSendEmail}
                Data={popupData}
                Context={context}
                Page="SkillMatrix"
                provider={provider} />
        )}
        <CustomModal isModalOpenProps={hideDialog}
            setModalpopUpFalse={_closeDeleteConfirmation}
            subject={"Delete Item"}
            message={'Are you sure, you want to delete this record?'}
            yesButtonText="Yes"
            closeButtonText={"No"}
            onClickOfYes={_confirmDeleteItem} />
        <div className={props.isNotGeneral == true ? "" : "boxCard"}>
            <SkillMatrixCountCard data={SummaryData} handleCardClick={handleCardClick} />
            <div className={(!!props.siteMasterId || props.isNotGeneral === true) ? "" : "boxCard"}>
                {!props.siteMasterId && props.isNotGeneral === false && <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                        <h1 className="mainTitle">Skill Matrix</h1>
                    </div>
                </div>}
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
                                        isRequired={true}// Pass the reset state
                                        AllOption={true} />
                                </div>
                            </div>
                        </div>}
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
                                columns={ClientColumn() as any}
                                items={FilteredData || []}
                                reRenderComponent={true}
                                onSelectedItem={_onItemSelected}
                                searchable={true}
                                CustomselectionMode={
                                    (  // !!props.siteMasterId &&
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

                                            {
                                                // (!!props.siteMasterId || props.isNotGeneral === false) &&
                                                (currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0 ||
                                                    (!!PermissionArray && PermissionArray?.includes('Quaysafe') && currentUserRoleDetail?.isSiteSupervisor) ||
                                                    (currentUserRoleDetail?.isStateManager)) &&
                                                <PrimaryButton text="Add " className="btn btn-primary "
                                                    onClick={() => {
                                                        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                                        breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddSkillMatrix, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddSkillMatrix, isAddClient: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, selectedZoneDetails: props.selectedZoneDetails } });
                                                        props.manageComponentView({ currentComponentName: ComponentNameEnum.AddSkillMatrix, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, isNotGeneral: props.isNotGeneral, originalState: props.originalState || props.componentProps.originalState, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, selectedZoneDetails: props.selectedZoneDetails });
                                                        setIsLoading(false);
                                                    }}
                                                />}
                                        </div>
                                    </>
                                } />
                        </> :
                            <>
                                <div className="dflex btn-back-ml">
                                    {
                                        // (!!props.siteMasterId || props.isNotGeneral === false) &&
                                        (currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0 ||
                                            (!!PermissionArray && PermissionArray?.includes('Quaysafe') && currentUserRoleDetail?.isSiteSupervisor) ||
                                            (currentUserRoleDetail?.isStateManager)) &&
                                        <PrimaryButton text="Add" className="btn btn-primary margin-sm-add"
                                            onClick={() => {
                                                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                                breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddSkillMatrix, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddSkillMatrix, isAddClient: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, selectedZoneDetails: props.selectedZoneDetails } });
                                                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddSkillMatrix, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, isNotGeneral: props.isNotGeneral, originalState: props.originalState || props.componentProps.originalState, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, selectedZoneDetails: props.selectedZoneDetails });
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
                                        </TooltipHost>
                                    </Link>
                                </div>
                                <SkillMatrixCardView
                                    items={SkillMatrixData}
                                    isTabView={false}
                                    viewType={'card'}
                                    manageComponentView={props.manageComponentView}
                                    isEditDelete={!!props?.siteMasterId ? true : false}
                                    _onclickEdit={onclickEdit}
                                    IMSsiteMasterId={props.siteMasterId || undefined}
                                    _onclickconfirmdelete={onclickconfirmdelete}
                                    isNotGeneral={props?.isNotGeneral}
                                    _SkillMatrixSignature={_SkillMatrixSignature}
                                />
                            </>
                        }
                    </div>
                </div>
            </div>
        </div>
        {
            isPopupVisible && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup}>
                        <Overlay onClick={hidePopup} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles.content}>
                                <h2 className="mt-10">Warning</h2>
                                <div className="mt-3">
                                    <strong>{TrainingAttendance}</strong> has not completed the training yet,
                                    Please wait till <strong>{TrainingAttendance}</strong> to complete the learning.
                                </div>
                                <DialogFooter>
                                    <DefaultButton text="Close" className='secondMain btn btn-danger' onClick={onClickNo} />
                                </DialogFooter>
                            </Popup>
                        </FocusTrapZone>
                    </Popup>
                </Layer>
            )
        }
    </>;
};