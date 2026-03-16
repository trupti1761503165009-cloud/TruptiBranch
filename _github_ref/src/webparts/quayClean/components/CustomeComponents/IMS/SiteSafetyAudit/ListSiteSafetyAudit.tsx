/* eslint-disable no-lone-blocks */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { IColumn, IDropdownOption, Link, PrimaryButton, SelectionMode, TooltipHost } from "@fluentui/react";
import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { _siteDataUtil, generateExcelTable, getCAMLQueryFilterExpression, logGenerator, mapSingleValue, onBreadcrumbItemClicked, UserActivityLog } from "../../../../../../Common/Util";
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
import { ActionMeta } from "react-select";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { WHSCommitteeCountCard } from "../../../CommonComponents/WHSCommitteeCountCard";
import { IExportColumns } from "../../EquipmentChecklist/Question";
import { faL, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { DataType, DateFormat, DateTimeFormate } from "../../../../../../Common/Constants/CommonConstants";
import { SendEmailIMS } from "../../../../../../Common/SendEmailIMS";
import { IMSLocationFilter } from "../../../../../../Common/Filter/IMSLocationFilter";
import { PreDateRangeFilterQuaySafe } from "../../../../../../Common/Filter/PreDateRangeFilterQuaySafe";
import ProgressBarWithTooltip from "../../../../../../Common/ProgressBarWithTooltip";
import CamlBuilder from "camljs";
import { ICamlQueryFilter, FieldType, LogicalType } from "../../../../../../Common/Constants/DocumentConstants";
import { IToolboxTalkSignatureData } from "../ToolboxTalk/ListToolboxTalk";
import TabMenu from "../../../CommonComponents/TabMenu";
import { IReactDropOptionProps } from "../../../CommonComponents/reactSelect/IReactDropOptionProps";
import { IMSAttendeesFilter } from "../../../../../../Common/Filter/IMSAttendeesFilter";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
const notFoundImage = require('../../../../../quayClean/assets/images/NotFoundImg.png');
export const ListSiteSafetyAudit: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, currentUserRoleDetail, context } = appGlobalState;
    const appSiteState = useAtomValue(appSiteStateAtom);
    const { PermissionArray } = appSiteState;
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [SiteSafetyAuditData, setSiteSafetyAuditData] = React.useState<any[]>([]);
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
    const [FilteredData, setFilteredData] = React.useState<any>([]);
    const [ChairPersonOptions, setChairPersonOptions] = React.useState<IDropdownOption[]>([]);
    const [defaultChairPerson, setDefaultChairPerson] = React.useState<any>(null);
    const [selectedChairPerson, setSelectedChairPerson] = React.useState<any>(null);
    const [WHSIdOptions, setWHSIdOptions] = React.useState<IDropdownOption[]>([]);
    const [defaultWHSId, setDefaultWHSId] = React.useState<any>(null);
    const [selectedWHSId, setSelectedWHSId] = React.useState<any>(null);
    const [SiteData, setSiteData] = React.useState<any[]>([]);
    const [fromDate, setFromDate] = React.useState<Date | any>();
    const [toDate, setToDate] = React.useState<Date | any>();
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);
    const [filterFromDate, setFilterFromDate] = React.useState<any>(undefined);
    const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: 'Top 30 Records', text: 'Top 30 Records' });
    const [shouldRefreshOptions, setShouldRefreshOptions] = React.useState(true);
    // const [attendeesOptions, setAttendeesOptions] = React.useState<IReactDropOptionProps[]>([]);
    // const [selectedAttendees, setSelectedAttendees] = React.useState<IReactDropOptionProps>("" as any)
    const [stateTabData, setStateTabData] = React.useState<any>([]);
    const [stateCountData, setStateCountData] = React.useState<any>();
    const [selectedStateId, setSelectedStateId] = React.useState<any[]>([]);
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

    const onStateChange = (option: any): void => {
        if (option) {
            let stateId: any[] = [option]
            setSelectedStateId(stateId)
        } else {
            setSelectedStateId([])
        }
    };

    // const onChangeAttendeesFilter = (value: IReactDropOptionProps) => {
    //     if (!!value) {
    //         setSelectedAttendees(value)
    //     } else {
    //         setSelectedAttendees("" as any)
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


    const _onWHSIdChange = (option: any, actionMeta: ActionMeta<any>): void => {
        setSelectedWHSId(option?.text);
        setDefaultWHSId(option?.value);
    };

    const [SummaryData, setSummaryData] = React.useState<any>([]);
    const [TARBOptions, setTARBOptions] = React.useState<IDropdownOption[]>([]);
    const [defaultTARB, setDefaultTARB] = React.useState<any>(null);
    const [selectedTARB, setSelectedTARB] = React.useState<any>(null);
    const [filterType, setFilterType] = React.useState<any>("");
    const [selectedLocation, setSelectedLocation] = React.useState<any[]>([]);
    const [showCopyDialog, setShowCopyDialog] = React.useState(false);
    const [copyRecordItem, setCopyRecordItem] = React.useState<any>();
    const _onTARBChange = (option: any, actionMeta: ActionMeta<any>): void => {
        setSelectedTARB(option?.text);
        setDefaultTARB(option?.value);
    };
    const _onChairPersonChange = (option: any, actionMeta: ActionMeta<any>): void => {
        setSelectedChairPerson(option?.text);
        setDefaultChairPerson(option?.value);
    };

    const onChangeLocationFilter = (value: any) => {
        if (!!value && value.length > 0) {
            let items: any[] = value.map((i: any) => i.value)
            setSelectedLocation(items)
        } else {
            setSelectedLocation([])
        }
    }

    const handleCardClick = (title: string | null) => {
        if (title) {
            setFilterType(title);
        } else {
            setFilterType("");
        }
    };


    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSiteIds(siteIds);
        setSelectedSiteTitles(siteTitles);
        setSelectedSCSites(siteSC);
    };

    const closeCopyDialog = () => {
        setShowCopyDialog(false);
    }
    const onClickCopyRecordYes = () => {
        onClickCopy(copyRecordItem)
    }

    const _SiteSafetyAuditData = (stateItems: any[], filerSiteData?: any[]) => {
        setIsLoading(true);
        // setSelectedAttendees("" as any)
        let custfilter;


        if (selectedSiteIds !== null && selectedSiteIds.length > 0) {
            const siteIdFilter = selectedSiteIds.map(id => `SiteNameId eq '${id}'`).join(" or ");
            custfilter = `(${siteIdFilter}) and IsActive eq 1 and IsDeleted ne 1`;
        } else {
            custfilter = !!props.siteMasterId
                ? `SiteNameId eq ${props.siteMasterId} and IsActive eq 1 and IsDeleted ne 1`
                : "IsActive eq 1 and IsDeleted ne 1";
        }

        // Additional filters
        if (defaultChairPerson) custfilter += ` and WHSUsersId eq '${defaultChairPerson}'`;
        if (defaultTARB) custfilter += ` and MinutesTakenAndRecordedBy eq '${defaultTARB}'`;
        if (defaultWHSId) custfilter += ` and MeetingID eq '${defaultWHSId}'`;

        const isTop30 = selectedItem?.key === 'Top 30 Records';
        if (!isTop30 && selectedItem?.key !== 'All Dates') {
            if (filterFromDate) {
                custfilter += ` and Created ge '${new Date(new Date(`${filterFromDate}T00:00:00`).toUTCString()).toISOString()}'`;
            }

            if (filterToDate) {
                custfilter += ` and Created le '${new Date(new Date(`${filterToDate}T23:59:59`).toUTCString()).toISOString()}'`;
            }
        }


        try {
            const select = ["ID,MeetingDate,FormStatus,IsActive,ShortSignature,Signature,CreatedDate,Location,ChairpersonId,Chairperson/Title,Chairperson/Name,Created,Modified,SiteNameId,SiteName/Title,MeetingID,MinutesTakenAndRecordedBy,WHSUsersId,WHSUsers/UserName,Attendees,Attachments,AttachmentFiles,SignatureDoneBy/Id"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteName", "Chairperson", "WHSUsers", "AttachmentFiles", "SignatureDoneBy"],
                filter: custfilter,
                listName: ListNames.SiteSafetyAudit,
            };
            provider.getItemsByQuery(queryStringOptions).then(async (results: any[]) => {
                if (!!results) {

                    if (isTop30) {
                        results = results
                            .sort((a, b) => new Date(b.Modified).getTime() - new Date(a.Modified).getTime()) // sort latest first
                            .slice(0, 30); // take only top 30
                    }

                    if (!!selectedLocation && selectedLocation.length > 0) {
                        results = results.filter((i) => selectedLocation.indexOf(i.Location) > -1)
                    }
                    if (props.isDirectView == true && currentUserRoleDetail.isAdmin == false) {
                        let siteMasterData = !!filerSiteData ? filerSiteData : SiteData
                        if (siteMasterData.length > 0) {
                            const siteMasterId = siteMasterData.map((item) => item.ID);
                            results = results.filter((i) => siteMasterId.indexOf(i.SiteNameId) > -1)
                        }

                    }
                    let safetyAuditId: number[] = [];
                    if (!!props.siteMasterId && props.siteMasterId > 0 && results.length > 0) {
                        safetyAuditId = results.map((r) => r.ID).filter((value, index, self) => self.indexOf(value) === index);

                    }
                    if ((selectedSiteIds !== null && selectedSiteIds.length > 0)) {
                        safetyAuditId = results.map((r) => r.ID).filter((value, index, self) => self.indexOf(value) === index);
                    }


                    // let siteSafetyAuditSignatureData = signatureItems;

                    let UsersListData = results.map((data) => {
                        const fixImgURL = `${context.pageContext.web.serverRelativeUrl}/Lists/SiteSafetyAudit/Attachments/${data.ID}/`;
                        let attachmentFiledata: string[] = []; // Array to hold all attachment URLs

                        if (data.AttachmentFiles.length > 0) {
                            try {
                                data.AttachmentFiles.forEach((AttachmentData: { ServerRelativeUrl: string; FileName: string; }) => {
                                    if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                                        attachmentFiledata.push(AttachmentData.ServerRelativeUrl);
                                    } else if (AttachmentData && AttachmentData.FileName) {
                                        attachmentFiledata.push(fixImgURL + AttachmentData.FileName);
                                    } else {
                                        attachmentFiledata.push(notFoundImage);
                                    }
                                });
                            } catch (error) {
                                console.error("Error parsing AttachmentFiles JSON:", error);
                                attachmentFiledata.push(notFoundImage);
                            }
                        } else {
                            attachmentFiledata = [];
                        }
                        const FullAttendees = !!data.WHSUsersId
                            ? data.WHSUsersId.map((id: number, index: number) => ({
                                Id: id,
                                Title: data.WHSUsers[index]?.UserName || '',
                            }))
                            : [];

                        let completedSignatureCount: number = 0;
                        let completedSignData: any[] = [];
                        let pendingUserName: any[] = []
                        // if (siteSafetyAuditSignatureData?.length > 0) {
                        completedSignData = data?.SignatureDoneBy || [];
                        let completedSingUserId = completedSignData?.map(r => r.Id) || [];
                        pendingUserName = FullAttendees?.filter((i: any) => completedSingUserId.indexOf(i.Id) == -1)?.map((r: any) => r?.Title) || [];
                        completedSignatureCount = completedSignData?.length
                        // }
                        let pendingUserId: any[] = [];
                        pendingUserId = FullAttendees.filter((i: any) => completedSingUserId.indexOf(i.Id) == -1)?.map((r: any) => r?.Id) || [];

                        let totalSignature: number = 0
                        if (!!FullAttendees && FullAttendees?.length) {
                            totalSignature = FullAttendees?.length || 0
                        }
                        const stateId = stateItems?.find((i) => Number(i.ID) == Number(data?.SiteNameId))?.QCStateId || ""

                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                FullAttendees: FullAttendees,
                                // isSignatureLoading: isSignatureDataGet == true ? false : true,
                                isSignatureLoading: false,
                                completedSignature: completedSignatureCount,
                                renderCompletedTotalSignature: `${completedSignatureCount}/${totalSignature}`,
                                totalSignature: totalSignature,
                                pendingUserNames: pendingUserName,
                                pendingUserId: pendingUserId,
                                // isCompletedSignature: totalSignature == completedSignatureCount || 0,
                                isCompletedSignature: ((totalSignature > 0) ? totalSignature == completedSignatureCount : false) || false,
                                MeetingDate: !!data.MeetingDate ? moment(data.MeetingDate).format(DateFormat) : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                MeetingID: !!data.MeetingID ? data.MeetingID : '',
                                Attendees: !!data.Attendees ? data.Attendees : '',
                                Location: !!data.Location ? data.Location : '',
                                Created: !!data.CreatedDate ? moment(data.CreatedDate).format(DateTimeFormate) : '',
                                MinutesTakenAndRecordedBy: !!data.MinutesTakenAndRecordedBy ? data.MinutesTakenAndRecordedBy : '',
                                Modified: !!data.Modified ? data.Modified : null,
                                FormStatus: !!data.FormStatus ? data.FormStatus : '',
                                IsActive: !!data.IsActive ? data.IsActive : false,
                                OrgMeetingDate: !!data.MeetingDate ? data.MeetingDate : null,
                                CreatedDate: !!data.CreatedDate ? data.CreatedDate : new Date(),
                                Chairperson: !!data.ChairpersonId ? data.Chairperson.map((i: { Title: any; }) => i.Title) : '',
                                ChairpersonID: !!data.ChairpersonId ? data.ChairpersonId : null,
                                WHSUsersId: !!data.WHSUsersId ? data.WHSUsersId : null,
                                WHSUsers: (!!data.WHSUsersId && data.WHSUsersId.length > 0) ? data.WHSUsers.map((i: { UserName: any; }) => i.UserName) : '',
                                WHSUsersName: (!!data.WHSUsersId && data.WHSUsersId.length > 0) ? data.WHSUsers.map((i: { UserName: any }) => i.UserName)?.join(', ') : '',
                                Attachment: attachmentFiledata,
                                AttachmentFiles: data.AttachmentFiles,
                                Signature: !!data.Signature ? data.Signature : '',
                                ShortSignature: !!data.ShortSignature ? data.ShortSignature : '',
                                FullAttendeesArray: FullAttendees,
                                stateId
                            }
                        );
                    });

                    if (shouldRefreshOptions && (results?.length > 0)) {
                        const options = UsersListData.flatMap(item =>
                            item.WHSUsersId.map((id: any, index: any) => ({ value: id, key: id, text: item.WHSUsers[index], label: item.WHSUsers[index] }))
                        );
                        options.push({
                            value: "", key: "", text: "", label: " --All Chairperson--"
                        });
                        setChairPersonOptions(options);

                        const tarbOptions = UsersListData.map(item => ({
                            value: item.MinutesTakenAndRecordedBy,
                            key: item.MinutesTakenAndRecordedBy,
                            text: item.MinutesTakenAndRecordedBy,
                            label: item.MinutesTakenAndRecordedBy,
                        })).filter(option => option.value); // Filter out empty values

                        tarbOptions.push({ value: "", key: "", text: "", label: " --All Taken & Recorded By--" });
                        setTARBOptions(tarbOptions);

                        const whsIdOptions = UsersListData.map(item => ({
                            value: item.MeetingID,
                            key: item.MeetingID,
                            text: item.MeetingID,
                            label: item.MeetingID,
                        })).filter(option => option.value); // Filter out empty values

                        whsIdOptions.push({
                            value: "", key: "", text: "", label: " --All WHS Committee--"
                        });

                        setWHSIdOptions(whsIdOptions);
                        setShouldRefreshOptions(false);
                    }

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

                    const WHSCommitteeSummary = getSummaryData(filteredData);
                    setSummaryData(WHSCommitteeSummary);
                    // let attendeesOptions = genrateAttendeesOptions(filteredData);
                    // setAttendeesOptions(attendeesOptions);
                    setSiteSafetyAuditData(filteredData);
                    // if (isSignatureDataGet == false) {
                    //     setIsSetSignatureData(true);
                    // }
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

    const getSummaryData = (ListData: any) => {
        const totalWHSCommittee = ListData.length; // Total count (same as totalAssets)
        const totalSubmittedData = ListData.filter((asset: any) =>
            asset.FormStatus === "submit"
        ).length;

        const totalSaveAsDraftData = ListData.filter((asset: any) =>
            asset.FormStatus === "draft"
        ).length;
        const uniqueUsers = new Set();
        ListData.forEach((item: any) => {
            if (item.WHSUsers) {
                item.WHSUsers.forEach((user: string) => uniqueUsers.add(user));
            }
        });
        const totalUniqueUsers = uniqueUsers.size;
        // const totalCompletedSignature = ListData.filter((i: any) => i.isCompletedSignature == true).length;
        // const totalPendingSignature = ListData.filter((i: any) => i.isCompletedSignature == false).length;
        const attendeeId =
            !!defaultChairPerson && defaultChairPerson
                ? defaultChairPerson
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
            totalWHSCommittee,
            totalSubmittedData,
            totalSaveAsDraftData,
            totalUniqueUsers,
            totalPendingSignature,
            totalCompletedSignature
        };
    };

    const onClickCopy = async (data: any) => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        const toastMessage = "WHS Committee record has been copied successfully!";
        const timestamp = Date.now();
        const uniquePart = (timestamp % 100000).toString().padStart(6, '0');
        const Generateid = `SSA-${uniquePart}`;
        const WHSCommitteeData = {
            Title: Generateid,
            SiteNameId: Number(data.SiteNameId) || Number(props?.originalSiteMasterId),
            MeetingDate: data.OrgMeetingDate ? new Date(data.OrgMeetingDate).toISOString() : new Date().toISOString(),
            MeetingID: Generateid,
            Location: data.Location || "N/A",
            MinutesTakenAndRecordedBy: data.MinutesTakenAndRecordedBy || "",
            FormStatus: "draft", // Default to "Draft"
            IsSendEmail: false, // Default to false
            CreatedDate: data.CreatedDate ? new Date() : new Date(),
            Attendees: data.Attendees || "",
            WHSUsersId: data.WHSUsersId || [],
        };

        let UsersListData: any[] = [];
        let DetailListData: any[] = [];
        const MasterData = () => {
            try {
                const select = ["ID,Title,IsEnabled,SiteSafetyAuditId,MasterId,ComplianceSectionsId"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    filter: `MasterId eq '${data.ID}'`,
                    listName: ListNames.ComplianceSectionsData,
                };
                props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                    if (!!results) {
                        UsersListData = results.map((data) => {
                            return {
                                ID: data.ID,
                                Title: !!data.Title ? data.Title : "",
                                SiteSafetyAuditMasterId: !!data.SiteSafetyAuditId ? data.SiteSafetyAuditId : '',
                                IsEnabled: !!data.IsEnabled ? data.IsEnabled : "",
                                ComplianceSectionsId: !!data.ComplianceSectionsId ? data.ComplianceSectionsId : '',
                            };
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
        const DetailsData = () => {
            try {
                const select = ["ID,Title,MasterId,ComplianceSectionsChecklistId,Weightage,Answer,ComplianceSectionsId,ComplianceSectionsDataId"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    filter: `MasterId eq '${data.ID}'`,
                    listName: ListNames.ComplianceChecksListData,
                };
                props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                    if (!!results) {
                        DetailListData = results.map((data) => {
                            return (
                                {
                                    ID: data.ID,
                                    Title: data.Title,
                                    Answer: !!data.Answer ? data.Answer : '',
                                    Weightage: !!data.Weightage ? data.Weightage : '',
                                    ComplianceSectionsId: !!data.ComplianceSectionsId ? data.ComplianceSectionsId : '',
                                    ComplianceSectionsChecklistId: !!data.ComplianceSectionsChecklistId ? data.ComplianceSectionsChecklistId : '',
                                    ComplianceSectionsDataId: !!data.ComplianceSectionsDataId ? data.ComplianceSectionsDataId : '',
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
        DetailsData();
        MasterData();

        await props.provider.createItem(WHSCommitteeData, ListNames.SiteSafetyAudit).then(async (item: any) => {
            let createdId = item.data.Id;
            props.provider.copyAttachments(ListNames.SiteSafetyAudit, data.ID, ListNames.SiteSafetyAudit, createdId);
            if (createdId > 0) {

                const MasterObjects = UsersListData.map((item: any) => {
                    return {
                        MasterId: createdId,
                        Title: item.Title,
                        SiteSafetyAuditId: item.SiteSafetyAuditMasterId,
                        IsEnabled: item.IsEnabled == "" ? false : item.IsEnabled,
                        ComplianceSectionsId: item.ComplianceSectionsId,
                    };
                });
                const DetailsObjects = DetailListData.map((item: any) => {
                    return {
                        MasterId: createdId,
                        Title: item.Title,
                        Answer: item.Answer,
                        Weightage: item.Weightage,
                        ComplianceSectionsChecklistId: item.ComplianceSectionsChecklistId,
                        ComplianceSectionsId: item.ComplianceSectionsId,
                        // ComplianceSectionsDataId: item.ComplianceSectionsDataId,
                    };
                });

                const batchInsert = async (data: any[], listName: string, chunkSize = 25) => {
                    const chunks = [];
                    for (let i = 0; i < data.length; i += chunkSize) {
                        chunks.push(data.slice(i, i + chunkSize));
                    }
                    return Promise.all(chunks.map(chunk => props.provider.createItemInBatch(chunk, listName)));
                };

                // Run ComplianceSectionsData and ComplianceSectionsChecklist in parallel
                const [complianceResponse] = await Promise.all([
                    batchInsert(MasterObjects, ListNames.ComplianceSectionsData),
                ]);

                // Map ComplianceSectionsChecklist to ComplianceSectionsData IDs
                const updatedChecklistsData = DetailsObjects.map(checklistItem => {
                    const matchingResItem = complianceResponse.flat().find((ite: any) => ite.data.ComplianceSectionsId === checklistItem.ComplianceSectionsId);
                    return {
                        ...checklistItem,
                        ComplianceSectionsDataId: matchingResItem ? matchingResItem.data.ID : null
                    };
                });

                // Insert ComplianceSectionsChecklist in parallel
                await batchInsert(updatedChecklistsData, ListNames.ComplianceChecksListData);
                toastService.updateLoadingWithSuccess(toastId, toastMessage);

                _SiteSafetyAuditData(siteData.current);
                setShowCopyDialog(false);
                setIsLoading(false);
            }
        }
        );
    }

    const [isPopupOpen, setIsPopupOpen] = React.useState(false);
    const [popupData, setPopupData] = React.useState<any>(null);
    const [isSendEmailPopupOpen, setIsSendEmailPopupOpen] = React.useState(false);

    const onClickSendEmail = async (item: any) => {

        setPopupData(item)
        setIsSendEmailPopupOpen(true);
    }

    const handleCloseSendEmail = () => {
        setPopupData(null)
        setIsSendEmailPopupOpen(false);
        setIsRefreshGrid(prevState => !prevState);
    }

    const handleOpenPopup = (item: any) => {
        setPopupData(item); // Pass item data to popup
        setIsPopupOpen(true); // Open popup
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false); // Close popup
        setPopupData(null); // Clear data
    };

    const onclickExportToExcel = async () => {
        try {
            let exportColumns: IExportColumns[] = [
                { header: "WHS Committee Id", key: "MeetingID" },
                { header: "WHS Committee Date", key: "MeetingDate" },
                { header: "Location", key: "Location" },
                { header: "Chairperson", key: "WHSUsersName" },
                { header: "Taken And Recorded By", key: "MinutesTakenAndRecordedBy" },
                { header: "Attendees", key: "Attendees" },
                { header: "Site Name", key: "SiteName" },
                { header: "Form Status", key: "FormStatus" },
                { header: "Completed/ Total Signature", key: "renderCompletedTotalSignature" },
                { header: "Created Date", key: "Created" },
            ];
            generateExcelTable(FilteredData, exportColumns, `${props?.componentProps?.siteName} - WHS Committee Inspection.xlsx`);
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
    //         await props.provider.updateItem({ IsSendEmail: false }, ListNames.SiteSafetyAudit, item.ID)
    //         toastService.updateLoadingWithSuccess(toastId, toastMessage);
    //     }
    // }

    const SiteSafetyAuditColumn = (): IColumn[] => {
        let columns: any[] = [
            {
                key: "key11", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 100, maxWidth: 120,
                onRender: ((itemID: any) => {
                    return <>
                        <div className='dflex'>

                            <Link className="actionBtn btnView dticon" onClick={() => {
                                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.DetailSiteSafetyAudit, siteMasterId: itemID.ID, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState } });
                                props.manageComponentView({
                                    currentComponentName: ComponentNameEnum.DetailSiteSafetyAudit, qCStateId: props?.qCStateId, UpdateItem: itemID, originalState: props.originalState || props.componentProps.originalState, dataObj: props.componentProps.dataObj, siteMasterId: itemID.ID, originalSiteMasterId: props.siteMasterId, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, isDirectView: props.isDirectView
                                });
                            }}>
                                <TooltipHost content={"View Detail"} id={tooltipId}>
                                    <FontAwesomeIcon icon="eye" />
                                </TooltipHost>
                            </Link>
                            {((!!props.siteMasterId || props.isDirectView) &&
                                (currentUserRoleDetail.isAdmin || currentUserRoleDetail.isSiteManager || currentUserRoleDetail.isSiteSupervisor || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isWHSChairperson) && (currentUserRoleDetail.isWHSChairperson || currentUserRoleDetail.isSiteSupervisor)) ? (
                                // {(!!props.siteMasterId &&
                                //     (currentUserRoleDetail.isAdmin || currentUserRoleDetail.isSiteManager || currentUserRoleDetail.isStateManager)) ? (
                                <Link className="actionBtn btnEditName dticon" onClick={() => {
                                    setCopyRecordItem(itemID)
                                    setShowCopyDialog(true);
                                    // onClickCopy(itemID)
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
            { key: 'MeetingID', name: 'WHS Committee Id', fieldName: 'MeetingID', isResizable: true, minWidth: 140, maxWidth: 180, isSortingRequired: true },
            { key: 'MeetingDate', name: 'WHS Committee Date', fieldName: 'MeetingDate', isResizable: true, minWidth: 140, maxWidth: 180, isSortingRequired: true },
            { key: 'Location', name: 'Location', fieldName: 'Location', isResizable: true, minWidth: 120, maxWidth: 180, isSortingRequired: true },
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
            // {
            //     key: 'Chairperson', name: 'Chairperson', fieldName: 'Attendees', isResizable: true, minWidth: 180, maxWidth: 240, isSortingRequired: true,
            //     onRender: (item: any) => {
            //         if (item.Attendees !== "") {
            //             return (
            //                 <>
            //                     <Link className="tooltipcls">
            //                         <TooltipHost content={renderToolTipsAttendees(item.Attendees)} id={tooltipId}>
            //                             {renderAttendees(item.Attendees)}
            //                         </TooltipHost>
            //                     </Link>
            //                 </>
            //             );
            //         }
            //     },
            // },
            {
                key: 'Chairperson', name: 'Chairperson', fieldName: 'WHSUsers', isResizable: true, minWidth: 140, maxWidth: 180, isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.WHSUsers) {
                        return (
                            <>
                                {item?.WHSUsers?.join(", ")}
                            </>
                        );
                    }
                },
            },
            { key: 'MinutesTakenAndRecordedBy', name: 'Taken And Recorded By', fieldName: 'MinutesTakenAndRecordedBy', isResizable: true, minWidth: 150, maxWidth: 200, isSortingRequired: true },
            {
                key: 'FormStatus', name: 'Form Status', fieldName: 'FormStatus', isResizable: true, minWidth: 80, maxWidth: 100, isSortingRequired: true, onRender: (item: any) => {
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
        if (!!props.siteMasterId) {
            columns = columns.filter(item => item.key != "SiteName")
        }
        return columns;
    };

    const onclickEdit = (predata: any) => {
        setisDisplayEDbtn(false);
        if (!!UpdateItem) {
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({ text: UpdateItem.FirstName, key: UpdateItem.FirstName, currentCompomnetName: ComponentNameEnum.AddSiteSafetyAudit, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, IsUpdate: true, siteMasterId: UpdateItem.Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, isDirectView: props.isDirectView } });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AddSiteSafetyAudit, qCStateId: props?.qCStateId, UpdateItem: UpdateItem, dataObj: props.componentProps.dataObj, originalState: props.originalState || props.componentProps.originalState, siteMasterId: UpdateItem.ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: !!props.siteMasterId ? props.siteMasterId : UpdateItem.SiteNameId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, isDirectView: props.isDirectView,
            });
        }
        let data: any[] = [];
        if (!!predata?.ID) {
            data.push(predata);
            if (!!data) {
                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                breadCrumItems.push({ text: data[0].FirstName, key: data[0].FirstName, currentCompomnetName: ComponentNameEnum.AddSiteSafetyAudit, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.HelpDeskForm, IsUpdate: true, siteMasterId: data[0].Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, isDirectView: props.isDirectView } });
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.AddSiteSafetyAudit, qCStateId: props?.qCStateId, UpdateItem: data[0], dataObj: props.componentProps.dataObj, originalState: props.originalState || props.componentProps.originalState, siteMasterId: data[0].ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: !!props.siteMasterId ? props.siteMasterId : data[0].SiteNameId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, isDirectView: props.isDirectView
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
                        EntityType: UserActionEntityTypeEnum.WHSCommitteeInspection,
                        LogFor: UserActionLogFor.Both,
                        EntityId: res?.ID,
                        EntityName: res?.MeetingID,
                        Details: `Delete WHS Committee Inspection`,
                        StateId: props?.qCStateId
                    };
                    void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
                });
                const deleteIDsArray = Array.isArray(UpdateItem)
                    ? UpdateItem.map((item: any) => item.Id || item.ID)
                    : [UpdateItem.ID || UpdateItem.Id];

                if (newObjects.length > 0) {
                    await provider.updateListItemsInBatchPnP(ListNames.SiteSafetyAudit, newObjects);
                    _SiteSafetyAuditData(siteData.current);
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


    const getSiteMasterData = async () => {
        try {
            let data: any[] = [];
            let filter: any
            if (!!currentUserRoleDetail.whsChairpersonsStateId && currentUserRoleDetail.whsChairpersonsStateId.length > 0) {
                const siteIdFilter = currentUserRoleDetail.whsChairpersonsStateId.map(id => `QCStateId eq '${id}'`).join(" or ");
                filter = siteIdFilter
            }
            const select = ["ID,Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: filter,
                listName: ListNames.SitesMaster,
            };
            await props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const SiteData: any = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                            }
                        );
                    });
                    setSiteData(SiteData);
                    data = SiteData
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });

            return data
        } catch (ex) {
            console.log(ex);
        }
    }

    React.useEffect(() => {
        if (props.isDirectView && currentUserRoleDetail.isAdmin == false) {
            (async () => {
                const siteItems = await _siteDataUtil(provider);
                siteData.current = siteItems

                let data = await getSiteMasterData()
                _SiteSafetyAuditData(siteItems, data);
            })()
        } else {
            // _SiteSafetyAuditData();
            (async () => {
                const siteItems = await _siteDataUtil(provider);
                siteData.current = siteItems
                await _SiteSafetyAuditData(siteItems);
            })()
        }

    }, [isRefreshGrid, props.isReload, selectedSiteIds, defaultChairPerson, defaultTARB, defaultWHSId, selectedLocation, filterFromDate, filterToDate, selectedItem]);

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setCurrentView('card');
        } else {
            setCurrentView('grid');
        }
    }, []);

    const _closeDeleteConfirmation = () => {
        toggleHideDialog();
    };

    React.useEffect(() => {
        const filterList = () => {
            let filteredList = SiteSafetyAuditData;
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
            // if (!!selectedAttendees && selectedAttendees?.label) {
            //     filteredList = filteredList.filter(r => r.AttendeesEmailId.includes(selectedAttendees?.value))
            // }
            // const Summary = getSummaryData(filteredList);
            // setSummaryData(Summary);
            if (!!selectedStateId && selectedStateId.length > 0) {
                filteredList = filteredList.filter((i) => selectedStateId.includes(i.stateId));
            }
            setStateCountData(groupedCountArray);
            const attendeeId =
                !!defaultChairPerson && defaultChairPerson
                    ? defaultChairPerson
                    : null;
            if (filterType === "Total WHS Committee" || filterType === "Total Unique Chairperson") {
                filteredList = SiteSafetyAuditData;
            } else if (filterType === "Total Submitted") {
                filteredList = SiteSafetyAuditData.filter((item: any) =>
                    item.FormStatus === "submit"
                );
            } else if (filterType === "Total Save as Draft") {
                filteredList = SiteSafetyAuditData.filter((item: any) =>
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
            // setIsLoading(false);
            setFilteredData(filteredList);
        };
        // setIsLoading(true);
        filterList();
    }, [SiteSafetyAuditData, filterType, selectedStateId]);

    return <>
        {isLoading && <Loader />}
        <CustomModal isModalOpenProps={showCopyDialog}
            setModalpopUpFalse={closeCopyDialog}
            subject={"Copy Item"}
            message={'Are you sure, you want to copy this record?'}
            yesButtonText="Yes"
            closeButtonText={"No"}
            onClickOfYes={onClickCopyRecordYes} />

        {popupData && (
            <CopyIMSLink
                isOpen={isPopupOpen}
                closePopup={handleClosePopup}
                Data={popupData}
                Context={context}
                Page="SiteSafetyAudit"
                PageId="SiteSafetyAuditId"
                provider={provider}
            />
        )}
        {isSendEmailPopupOpen && (
            <SendEmailIMS
                isOpen={isSendEmailPopupOpen}
                closePopup={handleCloseSendEmail}
                Data={popupData}
                Context={context}
                Page="SiteSafetyAudit"
                provider={provider} />
        )}
        <CustomModal isModalOpenProps={hideDialog}
            setModalpopUpFalse={_closeDeleteConfirmation}
            subject={"Delete Item"}
            message={'Are you sure, you want to delete this record?'}
            yesButtonText="Yes"
            closeButtonText={"No"}
            onClickOfYes={_confirmDeleteItem} />
        <div className={props.isDirectView ? "boxCard" : ""}>
            {props.isDirectView && <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                    <h1 className="mainTitle">WHS Committee Inspection</h1>
                </div>
            </div>}
            <WHSCommitteeCountCard data={SummaryData} handleCardClick={handleCardClick} />

            <div className="ms-Grid mt-3">
                <div className="ms-Grid-row ptop-5">
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
                                    selectedState={selectedStateId || []}
                                    isRequired={true}
                                    AllOption={true}
                                />
                            </div>
                        </div>
                    </div>}
                    {ChairPersonOptions &&
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                            <div className="formControl ims-site-pad">
                                <div className="formControl">
                                    <ReactDropdown
                                        options={ChairPersonOptions} isMultiSelect={false}
                                        defaultOption={defaultChairPerson || selectedChairPerson}
                                        onChange={_onChairPersonChange}
                                        isClearable
                                        placeholder={"Select Chairperson"} />
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
                                    Title={"Site Safety Audit"}
                                    isMultiSelect={true}
                                    isClearable={true}
                                />
                            </div>
                        </div>
                    </div>
                    {TARBOptions &&
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                            <div className="formControl ims-site-pad">
                                <div className="formControl">
                                    <ReactDropdown
                                        options={TARBOptions} isMultiSelect={false}
                                        defaultOption={defaultTARB || selectedTARB}
                                        onChange={_onTARBChange}
                                        isClearable
                                        placeholder={"Taken & Recorded By"} />
                                </div>
                            </div>
                        </div>}
                    {WHSIdOptions &&
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                            <div className="formControl ims-site-pad">
                                <div className="formControl">
                                    <ReactDropdown
                                        options={WHSIdOptions} isMultiSelect={false}
                                        defaultOption={defaultWHSId || selectedWHSId}
                                        onChange={_onWHSIdChange}
                                        isClearable
                                        placeholder={"WHS Committee"} />
                                </div>
                            </div>
                        </div>}
                    {/* <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
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
                    </div> */}
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 site-filter-mt-8">
                        <div className="formControl ims-site-pad">
                            <div className="formControl">
                                <PreDateRangeFilterQuaySafe
                                    fromDate={fromDate}
                                    toDate={toDate}
                                    onFromDateChange={onChangeFromDate}
                                    onToDateChange={onChangeToDate}
                                    isClearable
                                    onChangeRangeOption={onChangeRangeOption}
                                    IsLast30Record={true}
                                />
                            </div>
                        </div>
                    </div>
                    {(!isSiteLevelComponent) && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 mb-2">
                        {stateTabData.length > 0 && <TabMenu
                            stateMasterItems={stateTabData}
                            onStateChange={(option: any) => onStateChange(option)} />}
                    </div>}
                </div>
            </div>
            <div className="formGroup">
                {currentView === "grid" ? <>
                    <MemoizedDetailList
                        manageComponentView={props.manageComponentView}
                        columns={SiteSafetyAuditColumn() as any}
                        items={FilteredData || []}
                        reRenderComponent={true}
                        onSelectedItem={_onItemSelected}
                        searchable={true}
                        CustomselectionMode={
                            ((!!props.siteMasterId || (currentUserRoleDetail.isWHSChairperson && props.isDirectView)) &&
                                (!!PermissionArray && PermissionArray?.includes('Quaysafe') || currentUserRoleDetail.isAdmin || (currentUserRoleDetail.isWHSChairperson && props.isDirectView) || currentUserRoleDetail.isStateManager || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0) && (currentUserRoleDetail.isWHSChairperson))

                                ? SelectionMode.multiple
                                : SelectionMode.none}

                        addEDButton={<>
                            {(currentUserRoleDetail.isWHSChairperson && isDisplayEDbtn) && <>
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
                                    <Link className="actionBtn iconSize btnEdit ml-10" disabled={FilteredData?.length == 0 || FilteredData == undefined} style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                        text="">
                                        <TooltipHost
                                            content={FilteredData?.length == 0 || FilteredData == undefined ? "Record not found" : "Export to excel"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon
                                                icon={"file-excel"}
                                            />
                                        </TooltipHost>
                                    </Link>
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
                                    {/* {props.siteMasterId && (!!PermissionArray && PermissionArray?.includes('Quaysafe') || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0 || currentUserRoleDetail.isStateManager) && */}
                                    {((props.siteMasterId || currentUserRoleDetail.isWHSChairperson) && (!!PermissionArray && PermissionArray?.includes('Quaysafe') || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0 || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isWHSChairperson) && currentUserRoleDetail.isWHSChairperson) &&
                                        <PrimaryButton text="Add" className="btn btn-primary"
                                            onClick={() => {
                                                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                                breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddSiteSafetyAudit, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddSiteSafetyAudit, isAddClient: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState } });
                                                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddSiteSafetyAudit, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, originalState: props.originalState || props.componentProps.originalState, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, isDirectView: props.isDirectView });
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
                            {((props.siteMasterId || currentUserRoleDetail.isWHSChairperson) && (currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0 || currentUserRoleDetail.isStateManager) && currentUserRoleDetail.isWHSChairperson) &&
                                <PrimaryButton text="Add" className="btn btn-primary margin-sm-add"
                                    onClick={() => {
                                        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                        breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddSiteSafetyAudit, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddSiteSafetyAudit, isAddClient: true, breadCrumItems: breadCrumItems, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState } });
                                        props.manageComponentView({ currentComponentName: ComponentNameEnum.AddSiteSafetyAudit, qCStateId: props?.qCStateId, dataObj: props.componentProps.dataObj, originalState: props.originalState || props.componentProps.originalState, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState });
                                        setIsLoading(false);
                                    }}
                                />
                            }
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
                            items={SiteSafetyAuditData}
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