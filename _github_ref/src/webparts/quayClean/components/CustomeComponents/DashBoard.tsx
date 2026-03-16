/* eslint-disable react/jsx-no-target-blank */
/* eslint-disable no-return-assign */
/* eslint-disable prefer-const */
import * as React from "react";
import { IQuayCleanState } from "../QuayClean";
import IPnPQueryOptions from "../../../../DataProvider/Interface/IPnPQueryOptions";
import { ComponentNameEnum, ListNames, OperatorTypeEnum, UserActionEntityTypeEnum, UserActivityActionTypeEnum, ZoneViceSiteDetailsPivot } from "../../../../Common/Enum/ComponentNameEnum";
import { Loader } from "../CommonComponents/Loader";
import { IEvent } from "../../../../Interfaces/IEvent";
import { SortArrayWithColumn, UserActivityLog, getConvertedDate, getNavlinks, getSiteMasterItemsForDashBoard, htmlToText, logGenerator, onBreadcrumbItemClicked } from "../../../../Common/Util";
import { IAssociatedTeam } from "../../../../Interfaces/IAssociatedTeam";
import NoRecordFound from "../CommonComponents/NoRecordFound";
import { EvnetImgDialog } from "./EvnetImgDialog";
import CountUp from 'react-countup';
import { IDropdownOption, PrimaryButton, TextField, Tooltip, TooltipHost } from "office-ui-fabric-react";
import CustomModal from "../CommonComponents/CustomModal";
import { ILoginUserRoleDetails } from "../../../../Interfaces/ILoginUserRoleDetails";
import { IcurrentloginDetails } from "../CommonComponents/HeaderComponent";
import { INavigationLinks } from "../../../../Interfaces/INavigationLinks";
import { DashBoardNavigation, DashBoardNavigationUser } from "../../../../Common/Constants/CommonConstants";
import { ImageSliders } from "./ImageSliders";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IHomeDescription } from "../../../../Interfaces/IHomeDescription";
import { IBreadCrum } from "../../../../Interfaces/IBreadCrum";
import { ScrollablePane, ScrollbarVisibility, Toggle } from "@fluentui/react";
import { ReactDropdown } from "../CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { IDialogMessageState } from "../../../../Interfaces/IDialogState";
import DialogComponent from "../CommonComponents/ErrorDialog";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../jotai/appGlobalStateAtom";
import AddEvent from "../CommonComponents/AddEvents";
import moment from "moment";
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useId } from "@fluentui/react-hooks";
import { ISelectedZoneDetails } from "../../../../Interfaces/ISelectedZoneDetails";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const QCHeader = require('../../../quayClean/assets/images/QCHeader.png');
const notFoundImage = require('../../../quayClean/assets/images/blank-white.png');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const noVideoThumbLink = require('../../assets/images/Videoclip.png');
// const blankProfile = require('../../assets/images/blank-profile.png');
// const blankProfile = require('../../assets/images/UserBlank.svg');
const blankProfile = require('../../assets/images/User-Paceholder.png');
const eventDefaultPhoto = require('../../assets/images/EventPlaceholder.svg');
export interface IDashBoardProps {
    manageComponentView(componentProp: IQuayCleanState): any;
    // componentProps: IQuayCleanState;
    onClickNav(currentNave: string, id: string): any;
    appProps: any;
}

export interface IDashBoardState {
    videoLink: any;
    eventItems: IEvent[];
    isViewMoreEvent: boolean;
    isViewMoreUpComingEvent: boolean;
    isViewMoreHelpDesk: boolean;
    renderEventItems: IEvent[];
    assignedTeamItems: IAssociatedTeam[];
    isViewMoreassignedTeam: boolean;
    currentUserItems: any;
    adminSiteManageImg: string;
    isUser: boolean;
    isAdminorSitemanger: boolean;
    isEvnetImgDialogOpen: boolean;
    evnetImgUrl: string;
    assignedItemSiteNameGroups: any[];
    renderassignedItemSiteNameGroups: any[];
    videoItems: any[];
    isVideoModelOpen?: boolean;
    isScroll?: boolean;
    playVideoLink: string;
    currentloginDetails: IcurrentloginDetails;
    navLinksItems: INavigationLinks[];
    HomeDescription?: IHomeDescription;
    userRole: ILoginUserRoleDetails;
}

export const DashBoard = (props: IDashBoardProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, isClientView, siteId } = appGlobalState;
    const [isLoadingEmployee, setIsLoadingEmployee] = React.useState<boolean>(true);
    const [isErrorModelOpen, setIsErrorModelOpen] = React.useState<boolean>(false);
    const [isUser, setIsUser] = React.useState<boolean>(false);
    const [newsHeight, setNewsHeight] = React.useState<string>("");
    const [siteMasterItems, setSiteMasterItems] = React.useState<any[]>([]);
    const [siteOptions, setSiteOptions] = React.useState<IDropdownOption[]>();
    const [DailyOperatorOptions, setDailyOperatorOptions] = React.useState<IDropdownOption[]>();
    const [RoleOptions, setRoleOptions] = React.useState<IDropdownOption[]>();
    const [UserOptions, setUserOptions] = React.useState<IDropdownOption[]>();
    const [selectedUser, setSelectedUser] = React.useState<any>();
    const [selectedRole, setSelectedRole] = React.useState<any>();
    const [selectedDailyOperator, setSelectedDailyOperator] = React.useState<boolean>(false);
    const [defaultRole, setDefaultRole] = React.useState<any>();
    const [defaultDailyOperator, setDefaultDailyOperator] = React.useState<any>();
    const [SiteNameData, setSiteNameData] = React.useState<any>();
    const [AssignedTeamData, setAssignedTeamData] = React.useState<any>();
    const [isReload, setIsReload] = React.useState<boolean>(false);
    const [defaultSite, setDefaultSite] = React.useState<any[]>([]); // Array to store default selected sites
    const [selectedSite, setSelectedSite] = React.useState<any[]>([]); // Array to store currently selected sites
    const [userActivityData, setUserActivityData] = React.useState<any[]>([]);
    const [dialogState, setDialogState] = React.useState<IDialogMessageState>({
        dialogHeader: "",
        dialogMessage: "",
        isSuccess: false
    });
    const [HideErrorDialog, setHideErrorDialog] = React.useState(true);
    const [state, setState] = React.useState<IDashBoardState>({
        videoLink: "",
        eventItems: [],
        isScroll: false,
        isViewMoreEvent: false,
        renderEventItems: [],
        isViewMoreHelpDesk: false,
        isViewMoreUpComingEvent: false,
        assignedTeamItems: [],
        currentUserItems: null,
        isUser: false,
        adminSiteManageImg: "",
        isAdminorSitemanger: false,
        isEvnetImgDialogOpen: false,
        evnetImgUrl: "",
        assignedItemSiteNameGroups: [],
        videoItems: [],
        isVideoModelOpen: false,
        isViewMoreassignedTeam: false,
        renderassignedItemSiteNameGroups: [],
        playVideoLink: '',
        currentloginDetails: {
            admin: "",
            siteManger: '',
            user: '',
            title: "",
            emailId: "",
            Id: 0,
            arrayofPremission: [],
            isSiteSupervisor: "",
            isStateManager: false
        },
        navLinksItems: [],
        userRole: {
            isAdmin: false,
            isSiteManager: false,
            isUser: false,
            title: "",
            emailId: "",
            Id: 0,
            siteManagerItem: [],
            userItems: [],
            isSiteSupervisor: false,
            isStateManager: false,
            stateManagerSitesItemIds: [],
            stateManagerStateItem: [],
            stateMasterItems: [],
            userRoles: [],
            isWHSChairperson: false,
            whsChairpersonDetails: [],
            whsChairpersonTitle: [],
            isShowOnlyChairPerson: false,
            whsChairpersonsStateId: [],
            isCurrentUserZoneSiteAvailable: false
        }
    });
    const [filteredSites, setFilteredSites] = React.useState(state.assignedItemSiteNameGroups);
    const tooltipId = useId('tooltip');
    const ToggleHideErrorDialog = () => {
        setHideErrorDialog(!HideErrorDialog);
    };

    const handleCancelOrSuccessClick = () => {
        console.log('Dialog action performed');
    };

    const openDialog = () => {
        setHideErrorDialog(false);
    };

    const [searchTerm, setSearchTerm] = React.useState('');
    const handleSearchChange = (event: any, newValue: any) => {
        setSearchTerm(newValue);
    };

    const getUniqueRecordsByColumnName = (array: any, key: any) => {
        return array.filter((item: any, index: any, self: any) => self.findIndex((i: any) => i[key] === item[key]) === index);
    };

    const _onSiteChange = (options: any[], actionMeta: ActionMeta<any>): void => {
        const selectedValues = options.map(option => option.value); // Extract values from selected options
        setSelectedSite(selectedValues); // Update selected sites state
        setDefaultSite(selectedValues); // Update default sites state

        if (selectedValues.length === 0) {
            // Reset filter if no site is selected
            setFilteredSites(state.assignedItemSiteNameGroups);
        } else {
            // Filter based on selected site IDs
            const filtered = state.assignedItemSiteNameGroups.filter(site =>
                selectedValues.includes(site.siteNameId)
            );
            setFilteredSites(filtered);
        }
    };

    const _onRoleChange = (option: any, actionMeta: ActionMeta<any>): void => {
        setSelectedRole(option?.text);
        setDefaultRole(option?.value);
    };

    /**
     * Change Operator type dropdown onchange to machine operator toggle.
     * Updated by Trupti on 18/9/2025.
     * @param checked 
     */
    const onOperatorTypeToggleChange = (checked: boolean | undefined): void => {
        setSelectedDailyOperator(!!checked);
    };

    const bottomRef = React.useRef<null | HTMLDivElement>(null);

    React.useEffect(() => {
        if (state.isScroll) {
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 250);
        }
    }, [state.isScroll]);

    const getQuayCleanLink = () => {
        let queryOptions: IPnPQueryOptions = {
            listName: ListNames.QuayCleanLink,
            select: ['Id,Title']
        };
        return provider.getItemsByQuery(queryOptions);
    };

    // const getEventitems = (currentUser: any, data: any[]) => {
    //     const filter = `LinkFor eq 'Client Dashboard' and IsActive eq 1 and SiteEvent ne 1`;
    //     if (!!data && data.length > 0) {
    //         let queryOptions: IPnPQueryOptions = {
    //             listName: ListNames.EventMaster,
    //             select: ['Id,Title,EventDateTime,EventLink,NewsEventType,Label,EventImage,SiteNameId,SiteName/Title,EventDescription'],
    //             expand: ['SiteName'],
    //             filter: filter,
    //             orderBy: "EventDateTime",
    //             isSortOrderAsc: false
    //         };
    //         return provider.getItemsByQuery(queryOptions);
    //     } else {
    //         return [];
    //     }

    // };
    const getEventItems = async (currentUser: any) => {
        if (!currentUser) return [];
        const baseFilter = currentUser?.isAdmin
            ? `LinkFor eq 'Client Dashboard' and IsActive eq 1`
            : `LinkFor eq 'Client Dashboard' and IsActive eq 1 and SiteEvent eq 1`;

        let items: any[] = [];
        try {
            if (currentUser?.isAdmin) {
                const queryOptions: IPnPQueryOptions = {
                    listName: ListNames.EventMaster,
                    select: [
                        'Id,Title,EventDateTime,EventLink,NewsEventType,Label,EventImage,SiteNameId,SiteName/Title,EventDescription'
                    ],
                    expand: ['SiteName'],
                    filter: baseFilter,
                    orderBy: "EventDateTime",
                    isSortOrderAsc: false
                };
                items = await provider.getItemsByQuery(queryOptions);
            } else if (!currentUser.currentUserAllCombineSites || currentUser.currentUserAllCombineSites.length === 0) {
                const queryOptions: IPnPQueryOptions = {
                    listName: ListNames.EventMaster,
                    select: [
                        'Id,Title,EventDateTime,EventLink,NewsEventType,Label,EventImage,SiteNameId,SiteName/Title,EventDescription'
                    ],
                    expand: ['SiteName'],
                    filter: baseFilter,
                    orderBy: "EventDateTime",
                    isSortOrderAsc: false
                };
                items = await provider.getItemsByQuery(queryOptions);
            } else {
                const chunkSize = 50;
                const siteIds = currentUser.currentUserAllCombineSites;

                for (let i = 0; i < siteIds.length; i += chunkSize) {
                    const chunk = siteIds.slice(i, i + chunkSize);
                    const siteFilter = chunk.map((id: any) => `SiteNameId eq ${id}`).join(" or ");
                    const queryOptions: IPnPQueryOptions = {
                        listName: ListNames.EventMaster,
                        select: [
                            'Id,Title,EventDateTime,EventLink,NewsEventType,Label,EventImage,SiteNameId,SiteName/Title,EventDescription'
                        ],
                        expand: ['SiteName'],
                        filter: `${baseFilter} and (${siteFilter})`,
                        orderBy: "EventDateTime",
                        isSortOrderAsc: false
                    };
                    const chunkItems = await provider.getItemsByQuery(queryOptions);
                    items = items.concat(chunkItems);
                }
            }

            return items;
        } catch (error) {
            console.error("Error fetching event items:", error);
            return [];
        }
    };




    const getPicture = () => {
        try {
            const filter = `PictureType eq 'Home' and LinkFor eq 'Client Dashboard'`;
            const queryStringOptions: IPnPQueryOptions = {
                select: ['Title,Id,FileLeafRef,FileRef,PictureType'],
                filter: filter,
                listName: ListNames.PictureLibrary,
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const PictureData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                FileLeafRef: data.FileLeafRef,
                                FileRef: data.FileRef,
                                PictureType: data.PictureType
                            }
                        );
                    });
                    let link: any = [];
                    PictureData.map((item) => {
                        let url = `${context.pageContext.web.absoluteUrl}/${ListNames.PictureLibraryInternalName}/${item.FileLeafRef != "" ? item.FileLeafRef : ""}`;
                        link.push({ Url: url });
                    });
                }
            }).catch((error) => {
                console.log(error);
                setIsErrorModelOpen(true);
                setIsLoading(false);
                const errorObj = { ErrorMethodName: "getPicture", CustomErrormessage: "error in get picture", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(provider, errorObj);
            });
        } catch (ex) {
            console.log(ex);
            setIsErrorModelOpen(true);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "getPicture", CustomErrormessage: "error in get picture", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }
    };

    const getPictureLibrary = async (currentUser: any, siteMasterItems: any[]) => {
        const filter = `PictureType eq 'Admin' and LinkFor eq 'Client Dashboard'`;
        if (currentUser.isAdmin || currentUserRoleDetail.isShowOnlyChairPerson) {
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.PictureLibrary,
                filter: filter,
                select: ['Title,Id,FileLeafRef,FileRef,PictureType'],
            };
            let imgAdmin = await provider.getItemsByQuery(queryOptions);
            if (imgAdmin.length > 0) {
                return { url: context.pageContext.web.absoluteUrl + `/${ListNames.PictureLibraryInternalName}/` + imgAdmin[0]?.FileLeafRef, isUser: false }
            } else {
                const QCHeader = require('../../../quayClean/assets/images/QCHeader.png');
                return { url: QCHeader, isUser: false };
            }
        } else {
            let data = isClientView ? [] : siteMasterItems.filter(r => r.SiteManagerId?.indexOf(currentUser.Id) > -1);

            // let data = siteMasterItems.filter(r => r.SiteManagerId?.indexOf(currentUser.Id) > -1);
            if (data.length > 0) {
                const queryOptions: IPnPQueryOptions = {
                    listName: ListNames.PictureLibrary,
                    filter: filter,
                    select: ['Title,Id,FileLeafRef,FileRef,PictureType'],
                };
                let imgAdmin2 = await provider.getItemsByQuery(queryOptions);
                if (imgAdmin2 && imgAdmin2.length > 0) {
                    return { url: context.pageContext.web.absoluteUrl + `/${ListNames.PictureLibraryInternalName}/` + imgAdmin2[0]?.FileLeafRef, isUser: false }
                } else {
                    const QCHeader = require('../../../quayClean/assets/images/QCHeader.png');
                    return { url: QCHeader, isUser: false };
                }
            } else {
                if (currentUser.isStateManager) {
                    const queryOptions: IPnPQueryOptions = {
                        listName: ListNames.PictureLibrary,
                        filter: filter,
                        select: ['Title,Id,FileLeafRef,FileRef,PictureType'],
                    };
                    let imgAdmin2 = await provider.getItemsByQuery(queryOptions);
                    if (imgAdmin2 && imgAdmin2.length > 0) {
                        return { url: context.pageContext.web.absoluteUrl + `/${ListNames.PictureLibraryInternalName}/` + imgAdmin2[0]?.FileLeafRef, isUser: false };
                    } else {
                        const QCHeader = require('../../../quayClean/assets/images/QCHeader.png');
                        return { url: QCHeader, isUser: false };
                    }
                } else {
                    let data2 = isClientView ? [] : siteMasterItems.filter(r => r.SiteSupervisorId?.indexOf(currentUser.Id) > -1);

                    // let data2 = siteMasterItems.filter(r => r.SiteSupervisorId?.indexOf(currentUser.Id) > -1);
                    if (data2.length > 0) {
                        const queryOptions: IPnPQueryOptions = {
                            listName: ListNames.PictureLibrary,
                            filter: filter,
                            select: ['Title,Id,FileLeafRef,FileRef,PictureType'],
                        };
                        let imgAdmin2 = await provider.getItemsByQuery(queryOptions);
                        if (imgAdmin2 && imgAdmin2.length > 0) {
                            return { url: context.pageContext.web.absoluteUrl + `/${ListNames.PictureLibraryInternalName}/` + imgAdmin2[0]?.FileLeafRef, isUser: false };
                        } else {
                            const QCHeader = require('../../../quayClean/assets/images/QCHeader.png');
                            return { url: QCHeader, isUser: false };
                        }
                    } else {
                        setIsUser(true);
                        let siteHeaderUrl: string = '';
                        // let adUserData = siteMasterItems.filter(r => r.ADUserId?.indexOf(currentUser.Id) > -1);
                        let adUserData = isClientView ? siteMasterItems.filter(r => r.Id == siteId) : siteMasterItems.filter(r => r.ADUserId?.indexOf(currentUser.Id) > -1);

                        if (adUserData.length > 0) {
                            if (adUserData[0].SiteHeader) {
                                const fixImgURL = context.pageContext.web.serverRelativeUrl + '/Lists/SiteImages/Attachments/' + adUserData[0].Id + "/";
                                try {
                                    const SitePhotoData = JSON.parse(adUserData[0].SiteHeader);
                                    if (SitePhotoData && SitePhotoData.serverRelativeUrl) {
                                        return { url: siteHeaderUrl = SitePhotoData.serverRelativeUrl, isUser: true }
                                    } else if (SitePhotoData && SitePhotoData.fileName) {
                                        return { url: siteHeaderUrl = fixImgURL + SitePhotoData.fileName, isUser: true }
                                    } else {
                                        const QCHeader = require('../../../quayClean/assets/images/QCHeader.png');
                                        return { url: siteHeaderUrl = QCHeader, isUser: true }
                                    }
                                } catch (error) {
                                    console.log(error);
                                }
                            } else {
                                const QCHeader = require('../../../quayClean/assets/images/QCHeader.png');
                                return { url: siteHeaderUrl = QCHeader, isUser: false }
                            }
                        }
                    }
                }
            }
        }
    };

    const getVideoLink = async () => {
        const filter = `IsActive eq 1 and LinkFor eq 'Client Dashboard'`;
        const queryOptions: IPnPQueryOptions = {
            listName: ListNames.VideoList,
            select: ['Title,Id,VideoLink,VideoThumbnail,Source,IsActive,Description'],
            filter: filter,
            orderBy: 'QCOrder'
        };
        let data = await provider.getItemsByQuery(queryOptions);
        let videoItems: any[] = [];
        if (data.length > 0) {
            videoItems = data.map((items: any) => {
                let defaulturl = context.pageContext.web.absoluteUrl + '/Lists/VideoList/Attachments/' + items.Id + "/";
                let obj;
                let thumbnail;
                if (items.VideoThumbnail) {
                    obj = JSON.parse(items.VideoThumbnail);
                    // eslint-disable-next-line no-prototype-builtins
                    if (obj.hasOwnProperty("serverRelativeUrl")) {
                        thumbnail = obj.serverUrl + obj.serverRelativeUrl;
                    } else {
                        thumbnail = defaulturl + JSON.parse(items.VideoThumbnail).fileName.replace(/ /g, '%20');
                    }
                }
                return {
                    Id: items.Id,
                    VideoLink: !!items.VideoLink ? items.VideoLink.Url : "",
                    VideoThumbnail: !!thumbnail ? thumbnail : noVideoThumbLink,
                    Source: !!items.Source ? items.Source : "",
                    IsActive: !!items.IsActive ? items.IsActive : "",
                    Description: !!items.Description ? items.Description : "",
                };
            });
        }
        return videoItems;
    };

    const getAssignedTeam = async (currentUser: any, siteMasterItems: any) => {
        try {
            let assignedTeam: any[] = [];
            let queryOptions: IPnPQueryOptions;
            let filteredData: any;
            queryOptions = {
                listName: ListNames.SitesAssociatedTeam,
                select: ["Id", "SiteNameId", 'Title', 'Index', 'ATRole', "Location", "ATUserName", "Attachments", "AttachmentFiles", 'OperatorType', 'Modified'],
                expand: ["AttachmentFiles"],
                filter: "IsDeleted ne 1"
            };
            if (currentUser.isAdmin) {
                queryOptions = {
                    listName: ListNames.SitesAssociatedTeam,
                    select: ["Id", "SiteNameId", 'Title', 'Index', "Location", 'ATRole', "ATUserName", "Attachments", "AttachmentFiles", 'OperatorType', 'Modified'],
                    expand: ["AttachmentFiles"],
                    filter: "IsDeleted ne 1"
                };
                let data = await provider.getItemsByQuery(queryOptions);
                assignedTeam.push(data);
                return assignedTeam;
            } else {
                if (currentUser.isStateManager === true) {
                    queryOptions = {
                        listName: ListNames.SitesAssociatedTeam,
                        select: ["Id", "SiteNameId", 'Title', 'Index', "Location", 'ATRole', "ATUserName", "Attachments", "AttachmentFiles", 'OperatorType', 'Modified'],
                        expand: ["AttachmentFiles"],
                        filter: "IsDeleted ne 1"
                    };
                    let filteredData = await provider.getItemsByQuery(queryOptions);
                    let data = filteredData.filter(item => currentUser?.stateManagerSitesItemIds?.includes(item.SiteNameId));
                    assignedTeam.push(data);
                    return assignedTeam;
                } else {
                    if (currentUser.isUser) {
                        queryOptions = {
                            listName: ListNames.SitesAssociatedTeam,
                            select: ["Id", "SiteNameId", 'Title', 'Index', 'ATRole', "ATUserName", "Attachments", "AttachmentFiles", 'OperatorType', 'Modified'],
                            expand: ["AttachmentFiles"],
                            filter: `SiteNameId eq ${siteMasterItems[0].ID} and IsDeleted ne 1`
                        };
                        let data = await provider.getItemsByQuery(queryOptions);
                        assignedTeam.push(data);
                        return assignedTeam;
                    } else {
                        queryOptions = {
                            listName: ListNames.SitesAssociatedTeam,
                            select: ["Id", "SiteNameId", "Location", 'Title', 'Index', 'ATRole', "ATUserName", "Attachments", "AttachmentFiles", 'OperatorType', 'Modified'],
                            expand: ["AttachmentFiles"],
                            filter: "IsDeleted ne 1"
                        };
                        let data = await provider.getItemsByQuery(queryOptions);
                        if (data.length > 0) {
                            for (let index = 0; index < siteMasterItems.length; index++) {
                                filteredData = data.filter(item => {
                                    return item.SiteNameId === siteMasterItems[index].ID;
                                });
                                assignedTeam.push(filteredData);
                            }
                        }
                        return assignedTeam;
                    }
                }
            }
        } catch (error) {
            console.log(error);
            setIsErrorModelOpen(true);
            setIsLoading(false);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect DashBoard"
            };
            void logGenerator(provider, errorObj);
            setDialogState({
                dialogHeader: "Warning",
                dialogMessage: "Error is get Assigned Team Methode.",
                isSuccess: true
            });
            setHideErrorDialog(false);
        }
    };

    const setEventReadMoreHeight = () => {
        if (document.getElementsByClassName("newSubClass").length > 0) {
            const detailListHeight = document.getElementsByClassName("newSubClass");
            let height: any[] = [];
            for (let index = 0; index < detailListHeight.length; index++) {
                height.push(detailListHeight[index].clientHeight);
            }
            setNewsHeight(`${Math.max(...height)}px`);
        }
    };

    const getHomeDescriptionitems = async () => {
        const filter = `LinkFor eq 'Client Dashboard'`;
        const queryOptions: IPnPQueryOptions = {
            listName: ListNames.HomeDescription,
            select: ['Title ,TitleDescription,KMS,KMSDescription,Hours,HoursDescription,Staff,StaffDescription,Waste,WasteDescription,AmountOfPeople,AmountOfPeopleDescription'],
            filter: filter
        };
        let data = await provider.getItemsByQuery(queryOptions);
        let homeDescription: IHomeDescription[] = [];
        if (data.length > 0) {
            homeDescription = data.map((items: any) => {
                return {
                    Title: !!items.Title ? items.Title : "",
                    TitleDescription: !!items.TitleDescription ? htmlToText(items.TitleDescription) : "",
                    KMS: !!items.KMS ? items.KMS : 0,
                    KMSDescription: !!items.KMSDescription ? htmlToText(items.KMSDescription) : "",
                    Hours: !!items.Hours ? items.Hours : 0,
                    HoursDescription: !!items.HoursDescription ? htmlToText(items.HoursDescription) : "",
                    Staff: !!items.Staff ? items.Staff : 0,
                    StaffDescription: !!items.StaffDescription ? htmlToText(items.StaffDescription) : "",
                    Waste: !!items.Waste ? items.Waste : 0,
                    WasteDescription: !!items.WasteDescription ? htmlToText(items.WasteDescription) : "",
                    AmountOfPeople: !!items.AmountOfPeople ? items.AmountOfPeople : 0,
                    AmountOfPeopleDescription: !!items.AmountOfPeopleDescription ? htmlToText(items.AmountOfPeopleDescription) : "",
                    IsActive: items.IsActive
                };
            });
        }
        return homeDescription;
    };

    React.useEffect(() => {
        if (state.userRole?.Id != 0 && !!state.userRole?.Id)
            if (state.userRole?.userRoles.length == 0) {
                props.manageComponentView({ currentComponentName: ComponentNameEnum.AccessDenied });
            }
    }, [state.userRole?.userRoles]);

    React.useEffect(() => {
        setEventReadMoreHeight();
    }, [state.renderEventItems]);

    /**
     * OperatorType Filter
     * Rename the field from Daily Operator to Machine Operator.
     * Remove Checklist Operatoroption.
     * Updated by Trupti on 18/9/2025.
     */
    React.useEffect(() => {
        if (SiteNameData && SiteNameData.length > 0) {
            const optionSite: any[] = SiteNameData.map((item: any) => ({
                value: item.siteNameId,
                key: item.siteNameId,
                text: item.siteName,
                label: item.siteName
            }));
            optionSite.unshift({ key: '', text: '', value: '', label: ' --All--' });
            setSiteOptions(optionSite);
        }
    }, [SiteNameData]);

    React.useEffect(() => {
        if (AssignedTeamData && AssignedTeamData.length > 0) {
            const optionRole: any[] = AssignedTeamData.map((item: any) => ({
                value: item.id,
                key: item.id,
                text: item.aTRole,
                label: item.aTRole
            }));
            optionRole.unshift({ key: '', text: '', value: '', label: ' --All--' });
            setRoleOptions(optionRole);
        }
    }, [AssignedTeamData]);

    const _userActivityLog = async () => {
        setIsLoading(true);
        try {
            const todayDate = moment().format("YYYY-MM-DD");
            const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.UserActivityLog,
                filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityType eq '${UserActionEntityTypeEnum.Dashboard}' and ActionType eq 'Login' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
            };
            const results = await provider.getItemsByQuery(queryStringOptions);
            if (results && results.length > 0) {
                const listData = results.map((data) => ({
                    ID: data.ID,
                    Count: data.Count ?? '',
                }));
                setUserActivityData(listData);
                let updateObj = {
                    Count: listData[0]?.Count + 1,
                };
                await provider.updateItemWithPnP(updateObj, ListNames.UserActivityLog, Number(listData[0]?.ID));
            } else {
                setUserActivityData([]);
                const logObj = {
                    UserName: currentUserRoleDetail?.title,
                    // SiteNameId: UpdateItem[index]?.SiteNameId,
                    ActionType: UserActivityActionTypeEnum.Login,
                    Email: currentUserRoleDetail?.emailId,
                    EntityType: UserActionEntityTypeEnum.Dashboard,
                    // EntityId: UpdateItem[index]?.ID,
                    EntityName: "Dashboard",
                    Count: 1,
                    Details: "Login Dashboard"
                };
                void UserActivityLog(provider, logObj, currentUserRoleDetail);
            }
        } catch (error) {
            console.error("Error fetching user activity log:", error);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        _userActivityLog();
        if (AssignedTeamData && AssignedTeamData.length > 0) {
            const optionUser: any[] = AssignedTeamData
                .map((user: any) => ({
                    value: user.id,
                    key: user.id,
                    text: user.aTUserName,
                    label: user.aTUserName
                }));
            optionUser.unshift({ key: '', text: '', value: '', label: ' --All--' });
            setUserOptions(optionUser);
        }
    }, []);

    React.useEffect(() => {
        getPicture();
        try {
            setIsLoading(true);
            void (async () => {
                setState(prevState => ({
                    ...prevState,
                    userRole: currentUserRoleDetail
                }));

                const [videoItems, _siteMasterItems, homeDescription, data] = await Promise.all([
                    getVideoLink(),
                    getSiteMasterItemsForDashBoard(provider, true, currentUserRoleDetail, props.appProps.isClientView, props.appProps.siteId),

                    // getSiteMasterItemsForDashBoard(provider, true, currentUserRoleDetail),
                    getHomeDescriptionitems(),
                    getQuayCleanLink()
                ]);
                const adminSiteManagerUrl = await getPictureLibrary(currentUserRoleDetail, _siteMasterItems);
                setState(prevState => ({
                    ...prevState,
                    videoItems: videoItems,
                    HomeDescription: (homeDescription.length > 0 ? homeDescription[0] : undefined),
                    adminSiteManageImg: !!adminSiteManagerUrl?.url ? adminSiteManagerUrl.url : QCHeader,
                    isUser: !!adminSiteManagerUrl?.isUser ? adminSiteManagerUrl.isUser : false,
                    videoLink: data.length > 0 ? data[0].Title : undefined
                }));
                setSiteMasterItems(_siteMasterItems);
                setIsLoading(false);

                const eventItems = await getEventItems(currentUserRoleDetail);

                if (eventItems.length > 0) {
                    let events = eventItems.map((data: any) => {
                        return {
                            id: data.Id,
                            title: !!data.Title ? data.Title : "",
                            eventDateTime: !!data.EventDateTime ? getConvertedDate(data.EventDateTime) : "",
                            eventdt: !!data.EventDateTime ? moment(data.EventDateTime).format('DD MMM YYYY HH:MM A') : '',
                            SorteventDateTime: !!data.EventDateTime ? data.EventDateTime : "",
                            siteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                            siteName: !!data.SiteNameId ? data.SiteName.Title : "",
                            label: !!data.Label ? data.Label : "",
                            eventImage: !!data.EventImage ? data.EventImage.Url : "",
                            newsEventType: !!data.NewsEventType ? data.NewsEventType : "",
                            eventLink: !!data.EventLink ? data.EventLink.Url : "",
                            eventDescription: !!data.EventDescription ? data.EventDescription : ""
                        };
                    });
                    let renderItems: IEvent[] = [];
                    let length: number = events.length >= 4 ? 4 : events.length;
                    for (let index = 0; index < length; index++) {
                        renderItems.push(events[index]);
                    }
                    let renderUpComingItems: IEvent[] = [];
                    let upComing: any[] = events.filter((i: any) => new Date(i.eventDateTime) > new Date());
                    let length2: number = upComing.length >= 4 ? 4 : upComing.length;
                    for (let index = 0; index < length2; index++) {
                        renderUpComingItems.push(upComing[index]);
                    }

                    setState(prevState => ({
                        ...prevState,
                        eventItems: events,
                        renderEventItems: renderItems,
                        upComingEventItems: upComing,
                        renderUpComingEventItems: renderUpComingItems
                    }));
                }
                setEventReadMoreHeight();

                let assignedTeam = await getAssignedTeam(currentUserRoleDetail, _siteMasterItems);

                let newAssignedArray: any[] = [];
                if (!!assignedTeam && assignedTeam?.length > 0) {

                    for (let index = 0; index < assignedTeam.length; index++) {
                        if (index == 0) {
                            newAssignedArray = assignedTeam[index];
                        } else {
                            newAssignedArray = newAssignedArray.concat(assignedTeam[index]);
                        }
                    }
                }
                if (newAssignedArray.length > 0) {
                    let assignedTeamArray = newAssignedArray.map((u, index) => {
                        let siteName = _siteMasterItems.filter(r => r.Id == u.SiteNameId).length > 0 ? _siteMasterItems.filter(r => r.Id == u.SiteNameId)[0].Title : "";
                        let attachmentFiledata: any;
                        if (u.AttachmentFiles.length > 0) {
                            const fixImgURL = context.pageContext.web.serverRelativeUrl + '/Lists/AssetMaster/Attachments/' + u.Id + "/";
                            try {
                                const AttachmentData = u.AttachmentFiles[0];
                                if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                                    attachmentFiledata = AttachmentData.ServerRelativeUrl;
                                } else if (AttachmentData && AttachmentData.FileName) {
                                    attachmentFiledata = fixImgURL + AttachmentData.FileName;
                                } else {
                                    attachmentFiledata = "";
                                }
                            } catch (error) {
                                console.error("Error parsing AssetPhoto JSON:", error);
                                attachmentFiledata = "";
                            }
                        } else {
                            attachmentFiledata = null;
                        }
                        return {
                            id: !!u.ID ? u.ID : "",
                            aTUserName: !!u.ATUserName ? u.ATUserName : "",
                            aTRole: !!u.ATRole ? u.ATRole : "",
                            title: !!u.Title ? u.Title : "",
                            siteName: siteName,
                            siteNameId: !!u.SiteNameId ? u.SiteNameId : "",
                            userImage: attachmentFiledata,
                            OperatorType: !!u.OperatorType ? u.OperatorType : "",
                            index: u.Index,
                            modified: u.Modified
                        };

                    });
                    assignedTeamArray = SortArrayWithColumn(assignedTeamArray, "aTRole");
                    setAssignedTeamData(assignedTeamArray);
                    if (selectedRole) {
                        assignedTeamArray = assignedTeamArray?.filter((site: any) => site.aTRole === selectedRole);
                    }
                    if (selectedUser) {
                        assignedTeamArray = assignedTeamArray?.filter((site: any) => site.aTUserName === selectedUser);
                    }
                    /**
                     * Updated the Operator Type to a Machine Operator toggle.
                     * Updated by Trupti on 18/09/2025.
                     */
                    if (selectedDailyOperator) {
                        const operatorType = selectedDailyOperator ? OperatorTypeEnum.MachineOperator : "";
                        assignedTeamArray = assignedTeamArray?.filter((site: any) => site.OperatorType && site.OperatorType.includes(operatorType));
                    }


                    let siteName = assignedTeamArray.map((r: any) => ({ siteNameId: r.siteNameId, siteName: r.siteName }));
                    setSiteNameData(siteName);
                    if (selectedSite.length > 0) {
                        siteName = siteName.filter((site: any) => selectedSite.includes(site.siteNameId));
                    }

                    let uniqueSiteName = getUniqueRecordsByColumnName(siteName, "siteNameId");
                    let renderGroups: any[] = [];
                    uniqueSiteName = SortArrayWithColumn(uniqueSiteName, "siteName");
                    let length: number = uniqueSiteName.length >= 3 ? 3 : uniqueSiteName.length;
                    for (let index = 0; index < length; index++) {
                        renderGroups.push(uniqueSiteName[index]);
                    }
                    setState(prevState => ({ ...prevState, assignedTeamItems: assignedTeamArray, assignedItemSiteNameGroups: uniqueSiteName, renderassignedItemSiteNameGroups: renderGroups }));
                }
                setIsLoadingEmployee(false);
                let navLink = await getNavlinks(provider);
                if (currentUserRoleDetail.isShowOnlyChairPerson) {
                    navLink = []
                }
                setState(prevState => ({ ...prevState, navLinksItems: navLink }));
                setState(prevState => ({ ...prevState, currentUserItems: currentUserRoleDetail }));
                setTimeout(() => {
                    setIsLoading(false);
                }, 100);
            })();

        } catch (error) {
            setIsErrorModelOpen(true);
            setIsLoading(false);
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect DashBoard"
            };
            void logGenerator(provider, errorObj);
            setDialogState({
                dialogHeader: "Warning",
                dialogMessage: "Error is occuring while useEffect call.",
                isSuccess: true
            });
            setHideErrorDialog(false);
        }

    }, [selectedSite, selectedRole, selectedUser, selectedDailyOperator, isReload]);

    const onclickAddEvent = () => {
        setIsReload((prev) => !prev);
    };
    const stripHtml = (html: any) => {
        const doc = new DOMParser().parseFromString(html, "text/html");
        return doc.body.textContent || ""
    };

    // const sortByIndexWithBlankLast = (a: any, b: any) => {
    //     const aIndex = Number.isInteger(a.index) ? a.index : Number.MAX_SAFE_INTEGER;
    //     const bIndex = Number.isInteger(b.index) ? b.index : Number.MAX_SAFE_INTEGER;
    //     return aIndex - bIndex;
    // };

    const sortByIndexWithBlankLast = (a: any, b: any) => {
        const aHasValidIndex = Number.isInteger(a?.index);
        const bHasValidIndex = Number.isInteger(b?.index);

        // 1️⃣ Both have valid index → sort by index ASC
        if (aHasValidIndex && bHasValidIndex) {
            return a.index - b.index;
        }

        // 2️⃣ Only A has valid index → A first
        if (aHasValidIndex && !bHasValidIndex) return -1;

        // 3️⃣ Only B has valid index → B first
        if (!aHasValidIndex && bHasValidIndex) return 1;

        // 4️⃣ Both invalid (null / blank / undefined) → sort by id DESC
        const aId = Number(a?.id) || 0;
        const bId = Number(b?.id) || 0;
        return bId - aId;
    };



    return <>
        {isLoading && <Loader />}
        {isErrorModelOpen && <CustomModal closeButtonText="Close" isModalOpenProps={isErrorModelOpen} setModalpopUpFalse={() => { setIsErrorModelOpen(false); }} subject={"Something went wrong."} message={<div className="dflex" ><FontAwesomeIcon className="actionBtn btnPDF dticon" icon="circle-exclamation" /> <div className="error">Please try again later.</div></div>} />}
        {state.isVideoModelOpen && <CustomModal isModalOpenProps={state.isVideoModelOpen} setModalpopUpFalse={() => {
            setState(prevState => ({ ...prevState, isVideoModelOpen: false, isScroll: true }));
        }} subject={""} message={<iframe style={{ height: '450px', width: '100%' }} src={state.playVideoLink} />} dialogWidth="1000px" />}
        {state.isEvnetImgDialogOpen && <EvnetImgDialog onClickModelClose={() => {
            setState(prevState => ({ ...prevState, isEvnetImgDialogOpen: false }));
        }} imgUrl={state.evnetImgUrl} />}

        <section className={`homeSection ${state.isUser ? "homeSectionBackground " : ""}`} >
            <div className={`${state.isUser ? "heroBgWwrapper " : ""}`}>
                {!!state.adminSiteManageImg ?
                    <img src={!!state.adminSiteManageImg ? state.adminSiteManageImg : QCHeader} className={`img-fluid ${state.isUser ? "userImage" : "allimg w-100 maxHeigh"}`} alt="hero image" /> :
                    <NoRecordFound isNoImageFound={true} />
                }
            </div>

        </section>
        <section className="homeVectorWrapper ">
            <div className="quickLinkWrapper textCenter">
                {state.navLinksItems.length > 0 ? <>
                    {
                        state.navLinksItems.map((items: INavigationLinks) => {
                            let isVisibleNavBar: boolean = true;
                            let img: string = "";
                            let imageSVG = "";
                            switch (items.Title) {
                                case "News":
                                    img = require('../../assets/images/link/News.svg');
                                    imageSVG = `<svg width="41" height="27" viewBox="0 0 41 27" fill="var(--color-news)" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M39.2982 0H7.07596C6.15547 0 5.40929 0.74618 5.40929 1.66667V2.22222H2.63151C1.71102 2.22222 0.964844 2.9684 0.964844 3.88889V22.7778C0.964844 24.9256 2.70596 26.6667 4.85373 26.6667H37.6315C39.4725 26.6667 40.9648 25.1743 40.9648 23.3333V1.66667C40.9648 0.74618 40.2187 0 39.2982 0ZM4.85373 23.3333C4.70639 23.3333 4.56508 23.2748 4.4609 23.1706C4.35671 23.0664 4.29818 22.9251 4.29818 22.7778V5.55556H5.40929V22.7778C5.40929 22.9251 5.35076 23.0664 5.24657 23.1706C5.14238 23.2748 5.00108 23.3333 4.85373 23.3333ZM21.2426 22.2222H10.6871C10.2269 22.2222 9.85373 21.8491 9.85373 21.3889V20.8333C9.85373 20.3731 10.2269 20 10.6871 20H21.2426C21.7028 20 22.076 20.3731 22.076 20.8333V21.3889C22.076 21.8491 21.7028 22.2222 21.2426 22.2222ZM35.6871 22.2222H25.1315C24.6713 22.2222 24.2982 21.8491 24.2982 21.3889V20.8333C24.2982 20.3731 24.6713 20 25.1315 20H35.6871C36.1473 20 36.5204 20.3731 36.5204 20.8333V21.3889C36.5204 21.8491 36.1473 22.2222 35.6871 22.2222ZM21.2426 15.5556H10.6871C10.2269 15.5556 9.85373 15.1824 9.85373 14.7222V14.1667C9.85373 13.7065 10.2269 13.3333 10.6871 13.3333H21.2426C21.7028 13.3333 22.076 13.7065 22.076 14.1667V14.7222C22.076 15.1824 21.7028 15.5556 21.2426 15.5556ZM35.6871 15.5556H25.1315C24.6713 15.5556 24.2982 15.1824 24.2982 14.7222V14.1667C24.2982 13.7065 24.6713 13.3333 25.1315 13.3333H35.6871C36.1473 13.3333 36.5204 13.7065 36.5204 14.1667V14.7222C36.5204 15.1824 36.1473 15.5556 35.6871 15.5556ZM35.6871 8.88889H10.6871C10.2269 8.88889 9.85373 8.51576 9.85373 8.05556V5.27778C9.85373 4.81757 10.2269 4.44444 10.6871 4.44444H35.6871C36.1473 4.44444 36.5204 4.81757 36.5204 5.27778V8.05556C36.5204 8.51576 36.1473 8.88889 35.6871 8.88889Z" fill="var(--case-news)"/>
                                                </svg>`;
                                    break;
                                case "Sites":
                                    img = require('../../assets/images/link/Assets.svg');
                                    imageSVG = `<svg width="46" height="37" viewBox="0 0 46 37" fill="var(--case-sites)" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M35.65 16.1C29.9287 16.1 25.3 20.7287 25.3 26.45C25.3 32.1712 29.9287 36.8 35.65 36.8C41.3712 36.8 46 32.1712 46 26.45C46 20.7287 41.3712 16.1 35.65 16.1ZM40.25 26.9028C40.25 27.2837 39.9337 27.6 39.5528 27.6H35.1972C34.8163 27.6 34.5 27.2837 34.5 26.9028V21.3972C34.5 21.0163 34.8163 20.7 35.1972 20.7H36.1028C36.4837 20.7 36.8 21.0163 36.8 21.3972V25.3H39.5528C39.9337 25.3 40.25 25.6163 40.25 25.9972V26.9028ZM23 26.45C23 24.4519 23.4816 22.5616 24.3081 20.8797C23.7331 20.7719 23.1438 20.7 22.54 20.7H21.3397C19.7441 21.4331 17.9688 21.85 16.1 21.85C14.2313 21.85 12.4631 21.4331 10.8603 20.7H9.66C4.32687 20.7 0 25.0269 0 30.36V33.35C0 35.2547 1.54531 36.8 3.45 36.8H28.3978C25.1419 34.5072 23 30.7266 23 26.45ZM16.1 18.4C21.1816 18.4 25.3 14.2816 25.3 9.2C25.3 4.11844 21.1816 0 16.1 0C11.0184 0 6.9 4.11844 6.9 9.2C6.9 14.2816 11.0184 18.4 16.1 18.4Z" fill="var(--case-sites)" />
                                                        </svg>`;
                                    break;
                                case "Assets":
                                    img = require('../../assets/images/link/Assets.svg');
                                    imageSVG = `<svg width="46" height="37" viewBox="0 0 46 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <path d="M35.65 16.1C29.9287 16.1 25.3 20.7287 25.3 26.45C25.3 32.1712 29.9287 36.8 35.65 36.8C41.3712 36.8 46 32.1712 46 26.45C46 20.7287 41.3712 16.1 35.65 16.1ZM40.25 26.9028C40.25 27.2837 39.9337 27.6 39.5528 27.6H35.1972C34.8163 27.6 34.5 27.2837 34.5 26.9028V21.3972C34.5 21.0163 34.8163 20.7 35.1972 20.7H36.1028C36.4837 20.7 36.8 21.0163 36.8 21.3972V25.3H39.5528C39.9337 25.3 40.25 25.6163 40.25 25.9972V26.9028ZM23 26.45C23 24.4519 23.4816 22.5616 24.3081 20.8797C23.7331 20.7719 23.1438 20.7 22.54 20.7H21.3397C19.7441 21.4331 17.9688 21.85 16.1 21.85C14.2313 21.85 12.4631 21.4331 10.8603 20.7H9.66C4.32687 20.7 0 25.0269 0 30.36V33.35C0 35.2547 1.54531 36.8 3.45 36.8H28.3978C25.1419 34.5072 23 30.7266 23 26.45ZM16.1 18.4C21.1816 18.4 25.3 14.2816 25.3 9.2C25.3 4.11844 21.1816 0 16.1 0C11.0184 0 6.9 4.11844 6.9 9.2C6.9 14.2816 11.0184 18.4 16.1 18.4Z" fill="var(--case-assets)" />
                                                        </svg>`;
                                    break;
                                case "Chemicals":
                                    img = require('../../assets/images/link/Chemicals.svg');
                                    imageSVG = `<svg width="47" height="41" viewBox="0 0 47 41" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M36.9537 8.73795L31.3885 4.00446L38.9251 0L46.9648 4.53839L36.9537 8.73795ZM20.6791 5.08259L25.3715 2.18705L28.9345 5.73973L23.2461 8.71741L20.6791 5.08259ZM13.9948 5.76027L17.2702 3.49107L19.0363 6.40714L15.268 8.71741L13.9948 5.76027ZM11.6023 14.8165L10.6988 11.2433L13.7381 9.36429L15.0831 12.9888L11.6023 14.8165ZM9.42556 6.22232L11.8796 4.36384L12.7934 6.82813L10.0519 8.70714L9.42556 6.22232ZM7.02288 13.7487L6.65324 10.8326L8.94297 9.24107L9.56931 12.1879L7.02288 13.7487ZM3.88092 15.4531L6.01663 14.1388L6.35547 17.5683L4.00413 18.8004L3.88092 15.4531ZM1.10859 20.0634L3.08002 19.0161L3.12109 22.9384L0.964844 23.842L1.10859 20.0634ZM7.1769 26.1522L4.27109 27.0045L4.10681 22.1991L6.68404 21.1004L7.1769 26.1522ZM11.13 19.5705L7.93672 20.9054L7.40279 16.7161L10.2162 15.2375L11.13 19.5705ZM13.6148 31.2554L9.34342 31.8612L8.51172 25.3411L12.126 24.2321L13.6148 31.2554ZM16.5412 16.8906L18.718 22.7536L13.9742 24.15L12.5675 18.5951L16.5412 16.8906ZM25.3407 40.558L18.0608 40.2192L15.5657 30.3826L21.2336 29.4996L25.3407 40.558ZM16.6233 11.8388L20.9564 9.53884L23.8314 14.2518L18.6153 16.4388L16.6233 11.8388ZM20.8331 21.583L27.1273 19.6629L32.5488 28.5549L24.355 29.7152L20.8331 21.583ZM26.1108 12.7937L33.0211 9.83661L39.7465 16.5518L30.6492 19.242L26.1108 12.7937Z" fill="var(--case-chemicals)"/>
</svg>`;
                                    break;
                                case "Audit Reports":
                                    img = require('../../assets/images/link/Documents.svg');
                                    imageSVG = `<svg width="40" height="54" viewBox="0 0 40 54" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M23.3333 14.1667V0H2.5C1.11458 0 0 1.11458 0 2.5V50.8333C0 52.2188 1.11458 53.3333 2.5 53.3333H37.5C38.8854 53.3333 40 52.2188 40 50.8333V16.6667H25.8333C24.4583 16.6667 23.3333 15.5417 23.3333 14.1667ZM29.2812 26.6667H31.7708C32.5729 26.6667 33.1667 27.4062 32.9896 28.1979L29.0312 45.6979C28.9062 46.2708 28.3958 46.6667 27.8125 46.6667H23.8542C23.2812 46.6667 22.7812 46.2708 22.6458 45.7188C19.9583 34.9375 20.4792 37.2604 19.9792 34.2083H19.9271C19.8125 35.6979 19.6771 36.0208 17.2604 45.7188C17.125 46.2708 16.625 46.6667 16.0521 46.6667H12.1875C11.6042 46.6667 11.0938 46.2604 10.9688 45.6875L7.03125 28.1875C6.85417 27.4062 7.44792 26.6667 8.25 26.6667H10.8021C11.3958 26.6667 11.9167 27.0833 12.0312 27.6771C13.6562 35.8021 14.125 39.0833 14.2188 40.4062C14.3854 39.3438 14.9792 37 17.2812 27.625C17.4167 27.0625 17.9167 26.6771 18.5 26.6771H21.5312C22.1146 26.6771 22.6146 27.0729 22.75 27.6354C25.25 38.0937 25.75 40.5521 25.8333 41.1146C25.8125 39.9479 25.5625 39.2604 28.0833 27.6562C28.1875 27.0729 28.6979 26.6667 29.2812 26.6667ZM40 12.6979V13.3333H26.6667V0H27.3021C27.9688 0 28.6042 0.260417 29.0729 0.729167L39.2708 10.9375C39.7396 11.4062 40 12.0417 40 12.6979Z" fill="var(--case-audit-reports)"/>
</svg>`;
                                    break;
                                case "Help Desk":
                                    img = require('../../assets/images/link/helpdesks.svg');
                                    imageSVG = `<svg width="47" height="37" viewBox="0 0 47 37" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M36.0063 13.7984H25.0813V17.8234C25.0813 20.6768 22.7597 22.9984 19.9063 22.9984C17.0529 22.9984 14.7313 20.6768 14.7313 17.8234V9.08343L10.0666 11.8865C8.67944 12.7131 7.83131 14.2153 7.83131 15.8253V19.225L2.08132 22.5456C0.981639 23.1781 0.600702 24.5868 1.24039 25.6865L6.99038 35.6484C7.62288 36.7481 9.03162 37.1218 10.1313 36.4893L17.5632 32.1984H27.3813C29.9185 32.1984 31.9813 30.1356 31.9813 27.5984H33.1313C34.4035 27.5984 35.4313 26.5706 35.4313 25.2984V20.6984H36.0063C36.9622 20.6984 37.7313 19.9293 37.7313 18.9734V15.5234C37.7313 14.5675 36.9622 13.7984 36.0063 13.7984ZM46.6222 11.1103L40.8722 1.14844C40.2397 0.0487576 38.8309 -0.324992 37.7313 0.307507L30.2994 4.59844H22.9538C22.0913 4.59844 21.2504 4.84281 20.5172 5.29562L18.1094 6.79781C17.4338 7.21468 17.0313 7.95499 17.0313 8.74562V17.8234C17.0313 19.4118 18.3179 20.6984 19.9063 20.6984C21.4947 20.6984 22.7813 19.4118 22.7813 17.8234V11.4984H36.0063C38.2272 11.4984 40.0313 13.3025 40.0313 15.5234V17.5719L45.7812 14.2512C46.8809 13.6115 47.2547 12.21 46.6222 11.1103Z" fill="var(--case-help-desk)"/>
</svg>`;
                                    break;
                                case "Client Response":
                                    img = require('../../assets/images/link/clientresponse2.svg');
                                    imageSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="var(--case-client-response)" d="M163.9 136.9c-29.4-29.8-29.4-78.2 0-108s77-29.8 106.4 0l17.7 18 17.7-18c29.4-29.8 77-29.8 106.4 0s29.4 78.2 0 108L310.5 240.1c-6.2 6.3-14.3 9.4-22.5 9.4s-16.3-3.1-22.5-9.4L163.9 136.9zM568.2 336.3c13.1 17.8 9.3 42.8-8.5 55.9L433.1 485.5c-23.4 17.2-51.6 26.5-80.7 26.5H192 32c-17.7 0-32-14.3-32-32V416c0-17.7 14.3-32 32-32H68.8l44.9-36c22.7-18.2 50.9-28 80-28H272h16 64c17.7 0 32 14.3 32 32s-14.3 32-32 32H288 272c-8.8 0-16 7.2-16 16s7.2 16 16 16H392.6l119.7-88.2c17.8-13.1 42.8-9.3 55.9 8.5zM193.6 384l0 0-.9 0c.3 0 .6 0 .9 0z"/></svg>`;
                                    break;
                                case "Periodic":
                                    img = require('../../assets/images/link/periodic.svg');
                                    imageSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="var(--case-periodic)" d="M64 64C28.7 64 0 92.7 0 128V384c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H64zm16 64h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM64 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V240zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16zm80-176c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V144zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V240c0-8.8 7.2-16 16-16zM160 336c0-8.8 7.2-16 16-16H400c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H176c-8.8 0-16-7.2-16-16V336zM272 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM256 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H272c-8.8 0-16-7.2-16-16V240zM368 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM352 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H368c-8.8 0-16-7.2-16-16V240zM464 128h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V144c0-8.8 7.2-16 16-16zM448 240c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V240zm16 80h32c8.8 0 16 7.2 16 16v32c0 8.8-7.2 16-16 16H464c-8.8 0-16-7.2-16-16V336c0-8.8 7.2-16 16-16z"/></svg>`;
                                    break;
                                case "Documents":
                                    img = require('../../assets/images/link/link.svg');
                                    imageSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path fill="var(--case-documents)" d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372 74 321 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/></svg>`;
                                    break;

                                case "Chemical Usage":
                                    img = require('../../assets/images/link/chemical.svg');
                                    imageSVG = `
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" fill="var(--case-chemical-usage)">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier">

<defs>

<style>.cls-1{fill:none;stroke:var(--case-chemical-usage);stroke-miterlimit:10;stroke-width:1.91px;}</style>

</defs>

<line class="cls-1" x1="7.23" y1="1.5" x2="16.77" y2="1.5"/>

<path class="cls-1" d="M14.86,6.27V1.5H9.14V6.27L2.7,19.15a2.3,2.3,0,0,0-.25,1h0A2.32,2.32,0,0,0,4.77,22.5H19.23a2.32,2.32,0,0,0,2.32-2.32h0a2.3,2.3,0,0,0-.25-1Z"/>

<path class="cls-1" d="M6.89,10.76c5-2.17,5.31,1.9,10.42.41"/>

<line class="cls-1" x1="7.23" y1="18.68" x2="9.14" y2="18.68"/>

<line class="cls-1" x1="10.09" y1="14.86" x2="12" y2="14.86"/>

<line class="cls-1" x1="14.86" y1="16.77" x2="16.77" y2="16.77"/>

</g>

</svg>`;
                                    break;

                                case "Assigned Team":
                                    img = require('../../assets/images/link/AssignedTeam.svg');
                                    imageSVG = `
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="var(--case-assigned-team)">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier"> <!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools --> <title>ic_fluent_team_add_24_regular</title> <desc>Created with Sketch.</desc> <g id="🔍-Product-Icons" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="ic_fluent_team_add_24_regular" fill="#00d5c9" fill-rule="nonzero"> <path d="M17.5,12 C20.5375661,12 23,14.4624339 23,17.5 C23,20.5375661 20.5375661,23 17.5,23 C14.4624339,23 12,20.5375661 12,17.5 C12,14.4624339 14.4624339,12 17.5,12 Z M17.5,13.9992349 L17.4101244,14.0072906 C17.2060313,14.0443345 17.0450996,14.2052662 17.0080557,14.4093593 L17,14.4992349 L16.9996498,16.9992349 L14.4976498,17 L14.4077742,17.0080557 C14.2036811,17.0450996 14.0427494,17.2060313 14.0057055,17.4101244 L13.9976498,17.5 L14.0057055,17.5898756 C14.0427494,17.7939687 14.2036811,17.9549004 14.4077742,17.9919443 L14.4976498,18 L17.0006498,17.9992349 L17.0011076,20.5034847 L17.0091633,20.5933603 C17.0462073,20.7974534 17.207139,20.9583851 17.411232,20.995429 L17.5011076,21.0034847 L17.5909833,20.995429 C17.7950763,20.9583851 17.956008,20.7974534 17.993052,20.5933603 L18.0011076,20.5034847 L18.0006498,17.9992349 L20.5045655,18 L20.5944411,17.9919443 C20.7985342,17.9549004 20.9594659,17.7939687 20.9965098,17.5898756 L21.0045655,17.5 L20.9965098,17.4101244 C20.9594659,17.2060313 20.7985342,17.0450996 20.5944411,17.0080557 L20.5045655,17 L17.9996498,16.9992349 L18,14.4992349 L17.9919443,14.4093593 C17.9549004,14.2052662 17.7939687,14.0443345 17.5898756,14.0072906 L17.5,13.9992349 Z M14.2540247,10 C15.0885672,10 15.8169906,10.4543496 16.2054276,11.1291814 C15.6719841,11.2368176 15.1631195,11.409593 14.6865144,11.6387884 C14.5648628,11.550964 14.4153954,11.5 14.2540247,11.5 L9.75192738,11.5 C9.33771382,11.5 9.00192738,11.8357864 9.00192738,12.25 L9.00192738,16.4989513 C9.00192738,17.9098632 9.97557657,19.0933671 11.2876273,19.4142154 C11.4604353,19.9797789 11.7097452,20.5127963 12.0225923,21.0012092 L12.002976,21 C9.51711551,21 7.50192738,18.9848119 7.50192738,16.4989513 L7.50192738,12.25 C7.50192738,11.0073593 8.5092867,10 9.75192738,10 L14.2540247,10 Z M7.40645343,10.000271 C7.01177565,10.4116389 6.72426829,10.9266236 6.58881197,11.5003444 L4.25,11.5 C3.83578644,11.5 3.5,11.8357864 3.5,12.25 L3.5,14.99876 C3.5,16.3801567 4.61984327,17.5 6.00123996,17.5 C6.20123055,17.5 6.39573909,17.4765286 6.58216119,17.4321901 C6.66686857,17.9361103 6.82155533,18.416731 7.03486751,18.8640179 C6.70577369,18.9530495 6.35898976,19 6.00123996,19 C3.79141615,19 2,17.2085839 2,14.99876 L2,12.25 C2,11.059136 2.92516159,10.0843551 4.09595119,10.0051908 L4.25,10 L7.40645343,10.000271 Z M19.75,10 C20.9926407,10 22,11.0073593 22,12.25 L22.0008195,12.8103588 C20.8328473,11.6891263 19.2469007,11 17.5,11 L17.2548102,11.004539 L17.2548102,11.004539 C17.1009792,10.6291473 16.8766656,10.2891588 16.5994986,10.000271 L19.75,10 Z M18.5,4 C19.8807119,4 21,5.11928813 21,6.5 C21,7.88071187 19.8807119,9 18.5,9 C17.1192881,9 16,7.88071187 16,6.5 C16,5.11928813 17.1192881,4 18.5,4 Z M12,3 C13.6568542,3 15,4.34314575 15,6 C15,7.65685425 13.6568542,9 12,9 C10.3431458,9 9,7.65685425 9,6 C9,4.34314575 10.3431458,3 12,3 Z M5.5,4 C6.88071187,4 8,5.11928813 8,6.5 C8,7.88071187 6.88071187,9 5.5,9 C4.11928813,9 3,7.88071187 3,6.5 C3,5.11928813 4.11928813,4 5.5,4 Z M18.5,5.5 C17.9477153,5.5 17.5,5.94771525 17.5,6.5 C17.5,7.05228475 17.9477153,7.5 18.5,7.5 C19.0522847,7.5 19.5,7.05228475 19.5,6.5 C19.5,5.94771525 19.0522847,5.5 18.5,5.5 Z M12,4.5 C11.1715729,4.5 10.5,5.17157288 10.5,6 C10.5,6.82842712 11.1715729,7.5 12,7.5 C12.8284271,7.5 13.5,6.82842712 13.5,6 C13.5,5.17157288 12.8284271,4.5 12,4.5 Z M5.5,5.5 C4.94771525,5.5 4.5,5.94771525 4.5,6.5 C4.5,7.05228475 4.94771525,7.5 5.5,7.5 C6.05228475,7.5 6.5,7.05228475 6.5,6.5 C6.5,5.94771525 6.05228475,5.5 5.5,5.5 Z" id="🎨-Color" fill="var(--case-assigned-team)"> </path> </g> </g> </g>

</svg>`;
                                    break;
                                case "Job Control  Checklist":
                                    img = require('../../assets/images/link/checklist.svg');
                                    imageSVG = `
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier"> <path d="M2 5.5L3.21429 7L7.5 3" stroke="var(--case-job-control-checklist)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M2 12.5L3.21429 14L7.5 10" stroke="#00d5c9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M2 19.5L3.21429 21L7.5 17" stroke="#00d5c9" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M22 12H17M12 12H13.5" stroke="var(--case-job-control-checklist)" stroke-width="1.5" stroke-linecap="round"/> <path d="M12 19H17M20.5 19H22" stroke="#00d5c9" stroke-width="1.5" stroke-linecap="round"/> <path d="M22 5L12 5" stroke="var(--case-job-control-checklist)" stroke-width="1.5" stroke-linecap="round"/> </g>

</svg>`;
                                    break;
                                case "Inspection":
                                    img = require('../../assets/images/link/inspection2.svg');
                                    imageSVG = `
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
<svg width="800px" height="800px" viewBox="0 0 48 48" version="1" xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 48 48" fill="var(--case-inspection)">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier"> <path fill="var(--case-inspection)" d="M36,4H26c0,1.1-0.9,2-2,2s-2-0.9-2-2H12C9.8,4,8,5.8,8,8v32c0,2.2,1.8,4,4,4h24c2.2,0,4-1.8,4-4V8 C40,5.8,38.2,4,36,4z"/> <path  d="M36,41H12c-0.6,0-1-0.4-1-1V8c0-0.6,0.4-1,1-1h24c0.6,0,1,0.4,1,1v32C37,40.6,36.6,41,36,41z"/> <g fill="ffffff"> <path d="M26,4c0,1.1-0.9,2-2,2s-2-0.9-2-2h-7v4c0,1.1,0.9,2,2,2h14c1.1,0,2-0.9,2-2V4H26z"/> <path d="M24,0c-2.2,0-4,1.8-4,4s1.8,4,4,4s4-1.8,4-4S26.2,0,24,0z M24,6c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2 S25.1,6,24,6z"/> </g> <polygon fill="#ffffff" points="30.6,18.6 21.6,27.6 17.4,23.3 14.9,25.8 21.7,32.5 33.1,21.1"/> </g>

</svg>`;
                                    break;
                                case "Document Library":
                                    img = require('../../assets/images/link/docs.svg');
                                    imageSVG = `
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">

<!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
<svg fill="var(--case-document-library)" width="800px" height="800px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">

<g id="SVGRepo_bgCarrier" stroke-width="0"/>

<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>

<g id="SVGRepo_iconCarrier">

<path d="M263.508 346.359c0-11.782 9.551-21.333 21.333-21.333h303.012c11.78 0 21.333 9.551 21.333 21.333s-9.553 21.333-21.333 21.333H284.841c-11.782 0-21.333-9.551-21.333-21.333zm21.333 92.937c-11.782 0-21.333 9.553-21.333 21.333 0 11.785 9.551 21.333 21.333 21.333h303.012c11.78 0 21.333-9.549 21.333-21.333 0-11.78-9.553-21.333-21.333-21.333H284.841zm-21.333 135.599c0-11.78 9.551-21.333 21.333-21.333h303.012c11.78 0 21.333 9.553 21.333 21.333 0 11.785-9.553 21.333-21.333 21.333H284.841c-11.782 0-21.333-9.549-21.333-21.333zm21.333 92.535c-11.782 0-21.333 9.553-21.333 21.333 0 11.785 9.551 21.333 21.333 21.333h303.012c11.78 0 21.333-9.549 21.333-21.333 0-11.78-9.553-21.333-21.333-21.333H284.841z"/>

<path d="M325.731 43.151h15.654c1.387-.283 2.823-.432 4.294-.432s2.907.149 4.294.432H654.22c37.875 0 68.74 30.919 68.74 68.78v649.225c0 37.858-30.865 68.779-68.74 68.779H218.073c-37.873 0-68.741-30.921-68.741-68.779V212.754c0-.922.058-1.831.172-2.722.466-11.074 4.843-22.22 13.986-31.371L285.747 56.306c11.501-11.236 26.231-15.109 39.984-13.155zM193.673 208.819L315.626 86.765c.943-.899 1.808-1.238 2.577-1.366.895-.149 1.968-.049 3.028.39 1.055.437 1.833 1.1 2.312 1.78.366.52.73 1.278.803 2.512v70.051c0 .256.004.511.013.765v38.38c0 9.981-8.243 18.205-18.173 18.205H197.149c-1.328 0-2.141-.36-2.728-.777-.686-.486-1.363-1.285-1.806-2.354s-.529-2.115-.384-2.956c.124-.722.455-1.588 1.441-2.575zm173.34-123.001v3.525c.009.399.013.8.013 1.202v108.731c0 33.512-27.312 60.872-60.839 60.872L192 260.151v501.005c0 14.327 11.799 26.112 26.074 26.112h436.147c14.276 0 26.074-11.785 26.074-26.112V111.931c0-14.33-11.797-26.113-26.074-26.113H367.013z"/>

<path d="M777.485 128.521c-11.785 0-21.333 9.551-21.333 21.333s9.549 21.333 21.333 21.333h28.442c14.276 0 26.074 11.783 26.074 26.113v715.254c0 14.332-11.797 26.112-26.074 26.112H369.78c-14.275 0-26.074-11.785-26.074-26.112v-28.075c0-11.78-9.551-21.333-21.333-21.333s-21.333 9.553-21.333 21.333v28.075c0 37.862 30.868 68.779 68.741 68.779h436.147c37.875 0 68.74-30.916 68.74-68.779V197.3c0-37.861-30.865-68.78-68.74-68.78h-28.442z"/>

</g>

</svg>`;
                                    break;
                                case "Quaysafe":
                                    img = require('../../assets/images/link/meeting2.svg');
                                    imageSVG = `
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    
    <!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
    <svg fill="var(--case-quaysafe)" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 218.168 218.169" xml:space="preserve">
    
    <g id="SVGRepo_bgCarrier" stroke-width="0"/>
    
    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
    
    <g id="SVGRepo_iconCarrier"> <g> <g> <path d="M183.375,66.085c-8.36,0-15.155-9.709-15.155-18.07c0-8.366,6.795-15.159,15.155-15.159 c8.373,0,15.156,6.784,15.156,15.159C198.531,56.376,191.748,66.085,183.375,66.085z"/> <path d="M145.184,131.087l-2.546,46.631c-0.213,3.971,2.826,7.362,6.79,7.575c0.134,0.006,0.268,0.013,0.396,0.013 c3.794,0,6.96-2.973,7.179-6.796l2.235-41.077l6.156-1.242v41.917c0,3.312,2.679,5.992,5.991,5.992h40.791 c3.307,0,5.992-2.686,5.992-5.992v-47.288v-4.799v-15.776c0-3.304-2.686-5.992-5.992-5.992c-0.298,0-0.554,0.125-0.834,0.167 l0.499-0.554c0.987-1.105,1.535-2.533,1.535-4.016l-0.049-21.769c0-0.055-0.03-0.098-0.03-0.149 c-0.013-0.441-0.152-0.852-0.256-1.278c-0.092-0.335-0.116-0.685-0.262-1.002c-0.146-0.344-0.402-0.612-0.621-0.916 c-0.22-0.326-0.402-0.676-0.683-0.95c-0.231-0.225-0.542-0.359-0.815-0.542c-0.378-0.262-0.725-0.536-1.157-0.703 c-0.049-0.021-0.079-0.064-0.134-0.076c-0.548-0.198-12.672-4.552-23.784-5.1l-1.425,2.855h-0.043l4.037,31.433l-4.804,8.372 l-4.793-8.372l4.025-31.433h-0.043l-1.412-2.85c-10.724,0.524-22.348,4.576-23.663,5.045l-23.729,7.913l1.432-2.676 c0.304-0.584,0.085-1.309-0.5-1.614c-0.578-0.313-1.303-0.094-1.625,0.49l-2.601,4.902l-1.729,0.576 c-3.142,1.047-4.835,4.438-3.787,7.581c0.146,0.423,0.377,0.773,0.597,1.142l-4.427,8.378c-0.305,0.587-0.092,1.309,0.499,1.623 c0.177,0.092,0.372,0.137,0.566,0.137c0.414,0,0.841-0.231,1.06-0.636l4.037-7.621c0.98,0.679,2.162,1.066,3.386,1.066 c0.627,0,1.267-0.098,1.894-0.305l28.766-9.591c0.023-0.006,0.042-0.03,0.061-0.042c0.036-0.006,0.061,0,0.085-0.006 c0.049-0.018,2.107-0.749,5.151-1.617v39.169l-15.655,3.142C147.735,125.077,145.361,127.812,145.184,131.087z M201.393,97.572 l-1.23,1.373v-16.83c0.414,0.125,0.816,0.244,1.2,0.356L201.393,97.572z M206.215,110.128c0,0.049-0.024,0.08-0.024,0.116v11.04 l-6.04,1.412v-5.821L206.215,110.128z M177.383,140.367l28.808-6.771v38.526h-28.808V140.367z"/> <path d="M34.799,66.085c-8.372,0-15.159-9.709-15.159-18.07c0-8.366,6.787-15.159,15.159-15.159 c8.361,0,15.153,6.784,15.153,15.159C49.953,56.376,43.16,66.085,34.799,66.085z"/> <path d="M0,110.25v15.783v4.792v47.289c0,3.312,2.688,5.997,5.992,5.997h40.792c3.312,0,5.995-2.691,5.995-5.997v-41.918 l6.153,1.236l2.237,41.077c0.213,3.836,3.386,6.802,7.176,6.802c0.131,0,0.262,0,0.393-0.013c3.967-0.219,7.009-3.604,6.792-7.568 L72.985,131.1c-0.174-3.276-2.552-6.017-5.761-6.661l-15.658-3.154V82.121c0.423,0.125,0.825,0.238,1.197,0.351v24.393 c0,2.266,1.285,4.348,3.312,5.359l9.59,4.798c0.858,0.426,1.775,0.633,2.673,0.633c2.202,0,4.317-1.205,5.365-3.312 c1.477-2.959,0.286-6.563-2.688-8.047l-6.266-3.129V78.103c0-0.058-0.034-0.101-0.034-0.165c-0.012-0.441-0.155-0.858-0.262-1.285 c-0.085-0.329-0.116-0.679-0.25-0.989c-0.149-0.351-0.417-0.631-0.627-0.935c-0.225-0.32-0.405-0.664-0.688-0.932 c-0.234-0.228-0.542-0.365-0.828-0.56c-0.368-0.25-0.709-0.523-1.142-0.691c-0.042-0.018-0.079-0.063-0.131-0.076 c-0.548-0.197-12.674-4.551-23.793-5.1l-1.422,2.856h-0.036l4.028,31.432l-4.795,8.373l-4.801-8.373l4.034-31.432h-0.042 l-1.428-2.856c-11.113,0.548-23.239,4.902-23.781,5.1c-0.058,0.013-0.082,0.058-0.131,0.076c-0.432,0.168-0.786,0.448-1.16,0.704 c-0.274,0.189-0.588,0.32-0.819,0.542c-0.28,0.274-0.459,0.625-0.685,0.95c-0.213,0.305-0.469,0.572-0.618,0.917 c-0.144,0.311-0.167,0.661-0.262,1.001c-0.104,0.427-0.244,0.831-0.255,1.279c0,0.052-0.031,0.101-0.031,0.149v21.769 c-0.006,1.483,0.542,2.911,1.535,4.016l0.499,0.554c-0.28-0.042-0.536-0.167-0.837-0.167C2.688,104.259,0,106.94,0,110.25z M18.021,98.945l-1.227-1.373l0.024-15.101c0.387-0.113,0.786-0.231,1.203-0.356V98.945z M11.983,133.596l28.808,6.771v31.755 H11.983V133.596z M11.959,110.128l6.062,6.747v5.821l-6.038-1.412v-11.04C11.983,110.208,11.959,110.177,11.959,110.128z"/> <path d="M82.73,102.258h52.729c3.977,0,7.191,3.215,7.191,7.188c0,3.971-3.222,7.186-7.191,7.186h-1.315v61.476 c0,3.312-2.691,5.992-6.004,5.992H90.059c-3.312,0-5.995-2.686-5.995-5.992v-61.476H82.73c-3.97,0-7.188-3.215-7.188-7.186 C75.542,105.473,78.766,102.258,82.73,102.258z"/> </g> </g> </g>
    
    </svg>`;
                                    break;
                                default:
                                    break;
                            }
                            let permissionaItems: any[] = [];
                            for (let index = 0; index < items.TargetAudience.length; index++) {
                                state.userRole?.userRoles.indexOf(items.TargetAudience[index]) > -1 ? permissionaItems.push(items.TargetAudience[index]) : [];
                            }
                            isVisibleNavBar = (permissionaItems.length > 0 || items.TargetAudience.length == 0);
                            if (isUser) {
                                if (!!items.Title && DashBoardNavigationUser.indexOf(items.Title) > -1) {
                                    if (isVisibleNavBar) {

                                        if (items.Title == "Sites") {
                                            return <>
                                                <a className="quickLinkInner"
                                                    onClick={() => {
                                                        props.onClickNav(items.Title, items.Title.toLowerCase());
                                                        props.manageComponentView({ currentComponentName: items.ComponentName });
                                                    }}>
                                                    <div className="quickLinkItem richTextrenderUlLi">
                                                        <div className="quickImg" dangerouslySetInnerHTML={{ __html: imageSVG }} />
                                                    </div>
                                                    <div className="quickLinkText">{items.Title}</div>
                                                </a>
                                            </>;
                                        }
                                        if (items.Title == "Help Desk") {
                                            return <>
                                                <a className="quickLinkInner"
                                                    onClick={() => {
                                                        let breadCrumItems: IBreadCrum[] = [];
                                                        breadCrumItems.push({ text: siteMasterItems[0].Title, key: siteMasterItems[0].Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewSite, siteMasterId: siteMasterItems[0].ID, isShowDetailOnly: true, siteName: siteMasterItems[0].Title, qCState: siteMasterItems[0].QCState.Title, breadCrumItems: breadCrumItems } });
                                                        // props.manageComponentView({
                                                        //     currentComponentName: ComponentNameEnum.AddNewSite, siteMasterId: siteMasterItems[0].ID, isShowDetailOnly: true, siteName: siteMasterItems[0].Title, qCState: siteMasterItems[0].QCState.Title, pivotName: "HelpDeskListKey", breadCrumItems: []
                                                        // });
                                                        const selectedZoneDetails: ISelectedZoneDetails = {
                                                            selectedSites: [{
                                                                Id: siteMasterItems[0]?.ID,
                                                                QCStateId: siteMasterItems[0]?.QCStateId,
                                                                SiteName: siteMasterItems[0]?.Title,
                                                                State: siteMasterItems[0]?.QCState?.Title,
                                                                siteImage: siteMasterItems[0]?.SiteHeaderThumbnailUrl,
                                                                siteCategory: siteMasterItems[0]?.Category
                                                            }],
                                                            selectedSitesId: [siteMasterItems[0]?.ID],
                                                            siteCount: 0,
                                                            zoneId: "" as any,
                                                            zoneName: "" as any,

                                                            defaultSelectedSites: [{
                                                                Id: siteMasterItems[0]?.ID,
                                                                QCStateId: siteMasterItems[0]?.QCStateId,
                                                                SiteName: siteMasterItems[0]?.Title,
                                                                State: siteMasterItems[0]?.QCState?.Title,
                                                                siteImage: siteMasterItems[0]?.SiteHeaderThumbnailUrl,
                                                                siteCategory: siteMasterItems[0]?.Category
                                                            }],
                                                            defaultSelectedSitesId: [siteMasterItems[0]?.ID]
                                                        }
                                                        props.manageComponentView({
                                                            currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                                                            selectedZoneDetails: selectedZoneDetails,
                                                            isShowDetailOnly: true,
                                                            pivotName: "HelpDeskListKey",
                                                            viewBy: "site",
                                                            previousComponentName: ComponentNameEnum.DashBoard

                                                        });

                                                    }}>
                                                    <div className="quickLinkItem richTextrenderUlLi">
                                                        <div className="quickImg" dangerouslySetInnerHTML={{ __html: imageSVG }} />
                                                    </div>
                                                    <div className="quickLinkText">{items.Title}</div>
                                                </a>
                                            </>;
                                        }
                                        if (items.Title == "Periodic") {
                                            return <>
                                                <a className="quickLinkInner"
                                                    onClick={() => {
                                                        let breadCrumItems: IBreadCrum[] = [];
                                                        breadCrumItems.push({ text: siteMasterItems[0].Title, key: siteMasterItems[0].Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewSite, siteMasterId: siteMasterItems[0].ID, isShowDetailOnly: true, siteName: siteMasterItems[0].Title, qCState: siteMasterItems[0].QCState.Title, breadCrumItems: breadCrumItems } });
                                                        // props.manageComponentView({
                                                        //     currentComponentName: ComponentNameEnum.AddNewSite, siteMasterId: siteMasterItems[0].ID, isShowDetailOnly: true, siteName: siteMasterItems[0].Title, qCState: siteMasterItems[0].QCState.Title, pivotName: "ManagePeriodicListKey", breadCrumItems: []
                                                        // });
                                                        const selectedZoneDetails: ISelectedZoneDetails = {
                                                            selectedSites: [{
                                                                Id: siteMasterItems[0]?.ID,
                                                                QCStateId: siteMasterItems[0]?.QCStateId,
                                                                SiteName: siteMasterItems[0]?.Title,
                                                                State: siteMasterItems[0]?.QCState?.Title,
                                                                siteImage: siteMasterItems[0]?.SiteHeaderThumbnailUrl,
                                                                siteCategory: siteMasterItems[0]?.Category
                                                            }],
                                                            selectedSitesId: [siteMasterItems[0]?.ID],
                                                            siteCount: 0,
                                                            zoneId: "" as any,
                                                            zoneName: "" as any,

                                                            defaultSelectedSites: [{
                                                                Id: siteMasterItems[0]?.ID,
                                                                QCStateId: siteMasterItems[0]?.QCStateId,
                                                                SiteName: siteMasterItems[0]?.Title,
                                                                State: siteMasterItems[0]?.QCState?.Title,
                                                                siteImage: siteMasterItems[0]?.SiteHeaderThumbnailUrl,
                                                                siteCategory: siteMasterItems[0]?.Category
                                                            }],
                                                            defaultSelectedSitesId: [siteMasterItems[0]?.ID]
                                                        }
                                                        props.manageComponentView({
                                                            currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                                                            selectedZoneDetails: selectedZoneDetails,
                                                            isShowDetailOnly: true,
                                                            pivotName: "ManagePeriodicListKey",
                                                            viewBy: "site"

                                                        });

                                                    }}>
                                                    <div className="quickLinkItem richTextrenderUlLi">
                                                        <div className="quickImg" dangerouslySetInnerHTML={{ __html: imageSVG }} />
                                                    </div>
                                                    <div className="quickLinkText">{items.Title}</div>
                                                </a>
                                            </>;
                                        }
                                        if (items.Title == "Client Response") {
                                            return <>
                                                <a className="quickLinkInner"
                                                    onClick={() => {
                                                        let breadCrumItems: IBreadCrum[] = [];
                                                        breadCrumItems.push({ text: siteMasterItems[0].Title, key: siteMasterItems[0].Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewSite, siteMasterId: siteMasterItems[0].ID, isShowDetailOnly: true, siteName: siteMasterItems[0].Title, qCState: siteMasterItems[0].QCState.Title, breadCrumItems: breadCrumItems } });
                                                        // props.manageComponentView({
                                                        //     currentComponentName: ComponentNameEnum.AddNewSite, siteMasterId: siteMasterItems[0].ID, isShowDetailOnly: true, siteName: siteMasterItems[0].Title, qCState: siteMasterItems[0].QCState.Title, pivotName: "ClientResponseListKey", breadCrumItems: []
                                                        // });
                                                        const selectedZoneDetails: ISelectedZoneDetails = {
                                                            selectedSites: [{
                                                                Id: siteMasterItems[0]?.ID,
                                                                QCStateId: siteMasterItems[0]?.QCStateId,
                                                                SiteName: siteMasterItems[0]?.Title,
                                                                State: siteMasterItems[0]?.QCState?.Title,
                                                                siteImage: siteMasterItems[0]?.SiteHeaderThumbnailUrl,
                                                                siteCategory: siteMasterItems[0]?.Category
                                                            }],
                                                            selectedSitesId: [siteMasterItems[0]?.ID],
                                                            siteCount: 0,
                                                            zoneId: "" as any,
                                                            zoneName: "" as any,

                                                            defaultSelectedSites: [{
                                                                Id: siteMasterItems[0]?.ID,
                                                                QCStateId: siteMasterItems[0]?.QCStateId,
                                                                SiteName: siteMasterItems[0]?.Title,
                                                                State: siteMasterItems[0]?.QCState?.Title,
                                                                siteImage: siteMasterItems[0]?.SiteHeaderThumbnailUrl,
                                                                siteCategory: siteMasterItems[0]?.Category
                                                            }],
                                                            defaultSelectedSitesId: [siteMasterItems[0]?.ID]
                                                        }
                                                        props.manageComponentView({
                                                            currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                                                            selectedZoneDetails: selectedZoneDetails,
                                                            isShowDetailOnly: true,
                                                            pivotName: ZoneViceSiteDetailsPivot.CRIssueListKey,
                                                            viewBy: "site",
                                                            previousComponentName: ComponentNameEnum.DashBoard

                                                        });
                                                    }}>
                                                    <div className="quickLinkItem richTextrenderUlLi">
                                                        <div className="quickImg" dangerouslySetInnerHTML={{ __html: imageSVG }} />
                                                    </div>
                                                    <div className="quickLinkText">{items.Title}</div>
                                                </a>
                                            </>;
                                        }
                                        if (items.Title == "Documents") {
                                            return <>
                                                <a className="quickLinkInner"
                                                    onClick={() => {
                                                        let breadCrumItems: IBreadCrum[] = [];
                                                        breadCrumItems.push({ text: siteMasterItems[0].Title, key: siteMasterItems[0].Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewSite, siteMasterId: siteMasterItems[0].ID, isShowDetailOnly: true, siteName: siteMasterItems[0].Title, qCState: siteMasterItems[0].QCState.Title, breadCrumItems: breadCrumItems } });
                                                        // props.manageComponentView({
                                                        //     currentComponentName: ComponentNameEnum.AddNewSite, siteMasterId: siteMasterItems[0].ID, isShowDetailOnly: true, siteName: siteMasterItems[0].Title, qCState: siteMasterItems[0].QCState.Title, pivotName: "DocumentsKey", breadCrumItems: []
                                                        // });
                                                        const selectedZoneDetails: ISelectedZoneDetails = {
                                                            selectedSites: [{
                                                                Id: siteMasterItems[0]?.ID,
                                                                QCStateId: siteMasterItems[0]?.QCStateId,
                                                                SiteName: siteMasterItems[0]?.Title,
                                                                State: siteMasterItems[0]?.QCState?.Title,
                                                                siteImage: siteMasterItems[0]?.SiteHeaderThumbnailUrl,
                                                                siteCategory: siteMasterItems[0]?.Category
                                                            }],
                                                            selectedSitesId: [siteMasterItems[0]?.ID],
                                                            siteCount: 0,
                                                            zoneId: "" as any,
                                                            zoneName: "" as any,

                                                            defaultSelectedSites: [{
                                                                Id: siteMasterItems[0]?.ID,
                                                                QCStateId: siteMasterItems[0]?.QCStateId,
                                                                SiteName: siteMasterItems[0]?.Title,
                                                                State: siteMasterItems[0]?.QCState?.Title,
                                                                siteImage: siteMasterItems[0]?.SiteHeaderThumbnailUrl,
                                                                siteCategory: siteMasterItems[0]?.Category
                                                            }],
                                                            defaultSelectedSitesId: [siteMasterItems[0]?.ID]
                                                        }
                                                        props.manageComponentView({
                                                            currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                                                            selectedZoneDetails: selectedZoneDetails,
                                                            isShowDetailOnly: true,
                                                            pivotName: "DocumentsKey",
                                                            viewBy: "site",
                                                            previousComponentName: ComponentNameEnum.DashBoard

                                                        });
                                                    }}>
                                                    <div className="quickLinkItem richTextrenderUlLi">
                                                        <div className="quickImg" dangerouslySetInnerHTML={{ __html: imageSVG }} />
                                                    </div>
                                                    <div className="quickLinkText">{items.Title}</div>
                                                </a>
                                            </>;
                                        }
                                        if (items.Title == "Client Response") {
                                            return <>
                                                <a className="quickLinkInner"
                                                    onClick={() => {
                                                        let breadCrumItems: IBreadCrum[] = [];
                                                        breadCrumItems.push({ text: siteMasterItems[0].Title, key: siteMasterItems[0].Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewSite, siteMasterId: siteMasterItems[0].ID, isShowDetailOnly: true, siteName: siteMasterItems[0].Title, qCState: siteMasterItems[0].QCState.Title, breadCrumItems: breadCrumItems } });
                                                        // props.manageComponentView({
                                                        //     currentComponentName: ComponentNameEnum.AddNewSite, siteMasterId: siteMasterItems[0].ID, isShowDetailOnly: true, siteName: siteMasterItems[0].Title, qCState: siteMasterItems[0].QCState.Title, pivotName: "ClientResponseListKey", breadCrumItems: []
                                                        // });
                                                        const selectedZoneDetails: ISelectedZoneDetails = {
                                                            selectedSites: [{
                                                                Id: siteMasterItems[0]?.ID,
                                                                QCStateId: siteMasterItems[0]?.QCStateId,
                                                                SiteName: siteMasterItems[0]?.Title,
                                                                State: siteMasterItems[0]?.QCState?.Title,
                                                                siteImage: siteMasterItems[0]?.SiteHeaderThumbnailUrl,
                                                                siteCategory: siteMasterItems[0]?.Category
                                                            }],
                                                            selectedSitesId: [siteMasterItems[0]?.ID],
                                                            siteCount: 0,
                                                            zoneId: "" as any,
                                                            zoneName: "" as any,

                                                            defaultSelectedSites: [{
                                                                Id: siteMasterItems[0]?.ID,
                                                                QCStateId: siteMasterItems[0]?.QCStateId,
                                                                SiteName: siteMasterItems[0]?.Title,
                                                                State: siteMasterItems[0]?.QCState?.Title,
                                                                siteImage: siteMasterItems[0]?.SiteHeaderThumbnailUrl,
                                                                siteCategory: siteMasterItems[0]?.Category
                                                            }],
                                                            defaultSelectedSitesId: [siteMasterItems[0]?.ID]
                                                        }
                                                        props.manageComponentView({
                                                            currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                                                            selectedZoneDetails: selectedZoneDetails,
                                                            isShowDetailOnly: true,
                                                            pivotName: "ClientResponseListKey",
                                                            viewBy: "site",
                                                            previousComponentName: ComponentNameEnum.DashBoard

                                                        });
                                                    }}>
                                                    <div className="quickLinkItem richTextrenderUlLi">
                                                        <div className="quickImg" dangerouslySetInnerHTML={{ __html: imageSVG }} />
                                                    </div>
                                                    <div className="quickLinkText">{items.Title}</div>
                                                </a>
                                            </>;
                                        }
                                    }
                                }
                            } else {
                                if (!!items.Title && DashBoardNavigation.indexOf(items.Title) > -1) {
                                    if (isVisibleNavBar) {
                                        return <>
                                            <a className="quickLinkInner"
                                                onClick={() => {
                                                    props.onClickNav(items.Title, items.Title.toLowerCase());
                                                    props.manageComponentView({ currentComponentName: items.ComponentName });
                                                }}
                                            >
                                                <div className="quickLinkItem richTextrenderUlLi">
                                                    <div className="quickImg" dangerouslySetInnerHTML={{ __html: imageSVG }} />
                                                </div>
                                                <div className="quickLinkText">{items.Title}</div>
                                            </a>
                                        </>;
                                    }
                                }
                            }
                        }
                        )
                    }

                </> :
                    (!currentUserRoleDetail.isShowOnlyChairPerson) ? <a className="quickLinkInner">
                        <div className="quickLinkItem">
                            <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />
                        </div>
                        <div className="quickLinkText">Loading ...</div>
                    </a> : <div className="" style={{ marginTop: "5px", marginBottom: "5px" }}>
                        &nbsp;
                    </div>
                }
            </div>
            <section className="mb20">
                <ImageSliders provider={provider} context={context} />
            </section>
            <section className="newsEventSection ">

                <div className="container-fluid">
                    <div className="row">

                        <div className="col-12 textCenter mb-3">
                            <div>
                                {!!currentUserRoleDetail && currentUserRoleDetail.isAdmin && <div className="add-event-btn"><AddEvent onclickAddEvent={onclickAddEvent} SiteEvent={false} /></div>}
                                <div className="pageTitle">Latest News and Snapshots</div>
                            </div>
                        </div>
                        {state.renderEventItems.length > 0 ?
                            <>
                                {state.renderEventItems.map((data: IEvent, index) => {
                                    return <>
                                        <div className="col-md-3 mb-3 dashboard-card-mb-80">
                                            <div className="newsEventBox" >
                                                <div className="newsImageHover position-relative">
                                                    <a href="#" className="dFlex eventImg">
                                                        <LazyLoadImage src={data.eventImage}
                                                            placeholderSrc={eventDefaultPhoto}
                                                            alt="event photo"
                                                            className="img-fluid w-100"
                                                            effect="blur"
                                                        />
                                                    </a>
                                                    <div className="extraLinks">
                                                        <a href="#" className="extraLinkIcon" onClick={() => {
                                                            setState(prevState => ({ ...prevState, isEvnetImgDialogOpen: true, evnetImgUrl: data.eventImage }));
                                                        }}>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width={16}
                                                                height={16}
                                                                fill="currentColor"
                                                                className="bi bi-search"
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                                                            </svg>
                                                        </a>
                                                        <a href={data.eventLink} target="_blank" className="extraLinkIcon">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width={16}
                                                                height={16}
                                                                fill="currentColor"
                                                                className="bi bi-link-45deg"
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
                                                                <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
                                                            </svg>
                                                        </a>
                                                    </div>
                                                    <div className="newsHeader">
                                                        <h5 className="mb-3">
                                                            <a href="#">
                                                                {data.title}
                                                            </a>
                                                        </h5>
                                                    </div>
                                                    <div className="dateOverrightBadge">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            height="1em"
                                                            viewBox="0 0 448 512"
                                                        >
                                                            <path d="M128 0c17.7 0 32 14.3 32 32V64H288V32c0-17.7 14.3-32 32-32s32 14.3 32 32V64h48c26.5 0 48 21.5 48 48v48H0V112C0 85.5 21.5 64 48 64H96V32c0-17.7 14.3-32 32-32zM0 192H448V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V192zm64 80v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm128 0v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H208c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V272c0-8.8-7.2-16-16-16H336zM64 400v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16zm144-16c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H208zm112 16v32c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V400c0-8.8-7.2-16-16-16H336c-8.8 0-16 7.2-16 16z" />
                                                        </svg>
                                                        {" " + data.eventDateTime}
                                                    </div>
                                                </div>
                                                <div className="newsContents">
                                                    <div className="newSubClass" style={{ height: !!newsHeight ? newsHeight : "" }}>

                                                        {/* <p className="descraptionHeight" id={`descraptionHeight${index}`}>
                                                            <div dangerouslySetInnerHTML={{ __html: data.eventDescription }} />
                                                        </p> */}

                                                        <p className="descraptionHeight richTextrenderUlLi" id={`descraptionHeight${index}`}>
                                                            {stripHtml(data.eventDescription).length > 250 ? (
                                                                <>
                                                                    {stripHtml(data.eventDescription).substring(0, 250)}...
                                                                    <TooltipHost className="richTextrenderUlLi" content={<span dangerouslySetInnerHTML={{ __html: data.eventDescription }} />} id={tooltipId}>
                                                                        <span className="more-text" style={{ color: 'blue', cursor: 'pointer' }}>
                                                                            more
                                                                        </span>
                                                                    </TooltipHost>
                                                                </>
                                                            ) : (
                                                                stripHtml(data.eventDescription)
                                                            )}
                                                        </p>
                                                    </div>
                                                    <a href={data.eventLink} target="_blank" className="justifyright mt-10 " ><PrimaryButton className="btn btn-primary " text="Read More" /></a>
                                                </div>

                                            </div>
                                        </div>
                                    </>;
                                })
                                }
                                {state.eventItems.length >= 5 && <div className="col-sm-12 mt-1 mb-4 textCenter">
                                    <a href="#" className="btn btn-primary" onClick={() => {
                                        setNewsHeight("");
                                        let renderItems: IEvent[] = [];
                                        if (!state.isViewMoreEvent) {
                                            renderItems = state.eventItems;
                                        } else {
                                            let length: number = state.eventItems.length >= 4 ? 4 : state.eventItems.length;
                                            for (let index = 0; index < length; index++) {
                                                renderItems.push(state.eventItems[index]);
                                            }
                                        }
                                        setState(prevState => ({ ...prevState, renderEventItems: renderItems, isViewMoreEvent: !prevState.isViewMoreEvent }));
                                    }}>{state.isViewMoreEvent ? "View less" : "View more"}</a>
                                </div>}
                            </>
                            :
                            <div className="col-lg-12 col-md-12 col-sm-12 ">
                                <NoRecordFound />
                            </div>
                        }
                    </div>
                </div>
            </section>

            <section className="videoSection mb-3">

                <div className="row mx-0">
                    <div className="col-12 textCenter mb-3">
                        <div className="pageTitle">Video Link</div>
                        <span ref={bottomRef} />
                    </div>

                    <div className="leftVideoBlock col-md-6 col-sm-12 col-12" style={{ height: 350, backgroundImage: `url(${state.videoItems[0]?.VideoThumbnail})` }}>

                        <div className="videoPlayIcon" onClick={() => {
                            setState(prevState => ({ ...prevState, isVideoModelOpen: true, isScroll: false, playVideoLink: state.videoItems[0]?.VideoLink }));
                        }}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={64}
                                height={64}
                                fill="currentColor"
                                className="bi bi-play-fill"
                                viewBox="0 0 16 16"
                            >
                                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                            </svg>
                        </div>
                    </div>
                    <div className="rightVideoBlock col-md-6 col-sm-12 col-12" style={{ height: 350, backgroundImage: `url(${state.videoItems[1]?.VideoThumbnail})` }}>
                        <div className="videoPlayIcon" onClick={() => {
                            setState(prevState => ({ ...prevState, isVideoModelOpen: true, isScroll: false, playVideoLink: state.videoItems[1]?.VideoLink }));
                        }}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={64}
                                height={64}
                                fill="currentColor"
                                className="bi bi-play-fill"
                                viewBox="0 0 16 16"
                            >
                                <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </section>

            <div className="mb-5 lineVectorimg">
                <img src={require('../../assets/images/heroshape4.svg')} className="img-fluid w-100" />
            </div>
        </section >


        <section className="positionRelative bottomPadding brandPatternRight" style={{ background: 'white' }}>
            <div className="">
                <div className="container boxCard">
                    <div className="row">
                        <div className="col-12 textCenter mb-3">
                            <div className="pageTitle" id="employee-directory"
                            >Employee Directory</div>
                        </div>
                        <div className="justify-content-start dflex flex-wrap">
                            <div className="col-4 dash-filter">
                                <div className="formControl dash-fil-w">
                                    {siteOptions &&
                                        <ReactDropdown
                                            options={siteOptions}
                                            isMultiSelect={true}
                                            defaultOption={defaultSite || selectedSite}
                                            onChange={_onSiteChange}
                                            isClearable={true}
                                            placeholder={"Select Site Name"}
                                        />
                                    }
                                </div>
                            </div>
                            <div className="col-4 dash-filter">
                                <div className="formControl">
                                    <TextField
                                        onChange={handleSearchChange}
                                        value={searchTerm}
                                        placeholder="Search User Name"
                                    />
                                </div>
                            </div>
                            <div className="col-4 dash-filter">
                                <div className="formControl">
                                    {RoleOptions &&
                                        <ReactDropdown
                                            options={RoleOptions} isMultiSelect={false}
                                            defaultOption={defaultRole || selectedRole}
                                            onChange={_onRoleChange}
                                            isClearable={true}
                                            placeholder={"Select Role"}
                                        />
                                    }
                                </div>
                            </div>
                            {/* <div className="col-4 dash-filter">
                                <div className="formControl">
                                    {DailyOperatorOptions &&
                                        <ReactDropdown
                                            options={DailyOperatorOptions} isMultiSelect={false}
                                            defaultOption={defaultDailyOperator || selectedDailyOperator}
                                            onChange={_onDailyOperatorChange}
                                            isClearable={true}
                                            placeholder={"Select Operator Type"}
                                        />
                                    }
                                </div>
                            </div> */}
                            {/* change dropdown operator type dropdown to Machine Operator toggle.
                                Updated by Trupti on 18/9/2025. 
                            */}
                            <div className="col-4 dash-filter" style={{ marginLeft: '2px' }}>
                                <div className="formControl">
                                    <Toggle
                                        label="Machine Operator"
                                        onText="Yes"
                                        offText="No"
                                        checked={selectedDailyOperator}
                                        onChange={(e, checked) => onOperatorTypeToggleChange(checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        {state.assignedItemSiteNameGroups.length > 0 ?
                            <>
                                <div style={{ position: "relative", height: `calc(100vh - 400px)`, width: "100%" }}>
                                    <ScrollablePane className="ofxhide-dashboard" initialScrollPosition={0} scrollbarVisibility={ScrollbarVisibility.auto}>
                                        {state.assignedItemSiteNameGroups.map((i: any) => {
                                            const filteredTeamItems = getUniqueRecordsByColumnName(
                                                state.assignedTeamItems
                                                    .filter((data: any) => data.siteNameId === i.siteNameId)
                                                    .filter((data: any) => data.aTUserName.toLowerCase().includes(searchTerm.toLowerCase())),
                                                "aTUserName"
                                            );

                                            if (filteredTeamItems.length === 0) {
                                                return null;
                                            }

                                            return (
                                                <div className="row mlr0" key={i.siteNameId}>
                                                    <div className="col-12 mb-3">
                                                        <div className="EmployeeTitle">{i.siteName}</div>
                                                    </div>

                                                    {filteredTeamItems.length > 0 ? (
                                                        [...filteredTeamItems] // avoid mutating state
                                                            .sort(sortByIndexWithBlankLast)
                                                            .map((items: any) => (
                                                                <div className="col-md-4 col-sm-6 col-12 mb-3" key={items.id}>
                                                                    <div className="employeeWrapper">
                                                                        <div className="employeeItem">
                                                                            <div className="employeeAvatar">
                                                                                <LazyLoadImage
                                                                                    src={items.userImage || blankProfile}
                                                                                    width={72}
                                                                                    height={72}
                                                                                    placeholderSrc={blankProfile}
                                                                                    alt={items.aTUserName}
                                                                                    effect="blur"
                                                                                />
                                                                            </div>

                                                                            <div className="employeeLink">
                                                                                <div>{items.aTUserName}</div>
                                                                                <div className="employeeContent">{items.aTRole}</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                    ) : (
                                                        <div className="col-sm-12">
                                                            <NoRecordFound />
                                                        </div>
                                                    )}
                                                </div>
                                            );

                                        })}
                                    </ScrollablePane>
                                </div>
                            </> :
                            isLoadingEmployee ? <div className="col-sm-12 ">
                                <div className="quickLinkWrapper textCenter">
                                    <a className="quickLinkInner">
                                        <div className="quickLinkItem">
                                            <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />
                                        </div>
                                        <div className="quickLinkText">Loading ...</div>
                                    </a>
                                </div>
                            </div>
                                :
                                <div className="col-sm-12 ">
                                    <NoRecordFound />
                                </div>
                        }
                    </div>
                </div>
                <div className="mb-5 lineVectorimg">
                    <img src={require('../../assets/images/heroshape4.svg')} className="img-fluid w-100" />
                </div>
            </div>
        </section >
        <DialogComponent
            message={dialogState.dialogMessage}
            HideErrorDialog={HideErrorDialog}
            ToggleHideErrorDialog={ToggleHideErrorDialog}
            dialogHeader={dialogState.dialogHeader}
            isSuccess={dialogState.isSuccess}
            cancelOrSuccessClick={handleCancelOrSuccessClick}
        >
        </DialogComponent>
    </>;
};
