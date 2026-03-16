/* eslint-disable */
import * as React from "react";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ActionDetailsEnum, ComponentNameEnum, defaultValues, EntityNameEnum, getExternalUrl, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { IQuayCleanState } from "../../QuayClean";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Breadcrumb, FocusTrapZone, IconButton, Layer, Link, mergeStyleSets, Overlay, Persona, PersonaSize, Popup, PrimaryButton, Toggle, TooltipHost } from "@fluentui/react";
import { Loader } from "../../CommonComponents/Loader";
import { _onItemSelected, getConvertedDate, logGenerator, showPremissionDeniedPage as showPermissionDeniedPage, getErrorMessageValue, getCAMLQueryFilterExpression, UserActivityLog } from "../../../../../Common/Util";
import { AssociateChemicalDialog } from "./ViewSiteDialog";
import moment from "moment";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/sitelogo.jpg');
const siteLogoImage = require('../../../../quayClean/assets/images/sitelogo.jpg');
import { onBreadcrumbItemClicked } from "../../../../../Common/Util";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { DateFormat, MicrosoftOfficeDocumentType } from "../../../../../Common/Constants/CommonConstants";
import { AuditReports } from "../AuditReport/AuditReports";
import DialogComponent from "../../CommonComponents/ErrorDialog";
import { IDialogMessageState } from "../../../../../Interfaces/IDialogState";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { SiteCardView } from "./SiteCardView";
import { Inspectionlist } from "../SafetyCulture/Inspection";
import { MultipleSiteFilter } from "../../../../../Common/Filter/MultipleSiteFilter";
import CamlBuilder from "camljs";
import { ICamlQueryFilter, FieldType, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import 'react-lazy-load-image-component/src/effects/blur.css';
import { MultiSiteManagerFilter } from "../../../../../Common/Filter/MultiSiteManagerFilter";
import { MultiUserFilter } from "../../../../../Common/Filter/MultiUserFilter";
import { MultiStateFilter } from "../../../../../Common/Filter/MultiStateFilter";
//import { ViewSiteImage } from "../../CommonComponents/ViewSiteImage";
import CustomModal from "../../CommonComponents/CustomModal";
import { FavoriteFields } from "../../../../../Common/Constants/FavouriteFields";
import { Messages } from "../../../../../Common/Constants/Messages";
import { toastService } from "../../../../../Common/ToastService";
import { UserPersonaByEmail } from "../../UserPersonaByEmail";
import { LazyLoadImage } from "react-lazy-load-image-component";
export interface IViewSiteProps {
    manageComponentView(componentProp: IQuayCleanState): any;
    breadCrumItems: IBreadCrum[];
    view?: any;
    selectedSiteTitles?: any;
    selectedState?: any;
    selectedSiteManagers?: any;
    selectedADUsers?: any;
    selectedSCSites: any;
    selectedSiteIds: any;
}

interface IFilterRef {
    selectedSiteTitles: any[];
    selectedState: any[];
    selectedSiteManagers: any[];
    selectedADUsers: any[];
    selectedSCSites: any[];
    selectedSiteIds: any[];
}

export const ViewSite = (props: IViewSiteProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [columnsUser, setcolumnsUser] = React.useState<any>([]);
    let viewSitesData = React.useRef<any>(null);
    let viewAllSitesData = React.useRef<any[]>([]);
    let ListEquipment = React.useRef<any[] | undefined>(undefined);
    let ListTeam = React.useRef<any[] | undefined>(undefined);
    let ListChemical = React.useRef<any[] | undefined>(undefined);
    let ListInspection = React.useRef<any[] | undefined>(undefined);
    let ListDocuments = React.useRef<any[] | undefined>(undefined);
    const [SiteName, setSiteName] = React.useState<any[]>([]);
    const [isShowAssetHistoryModel, setisShowAssetHistoryModel] = React.useState<boolean>(false);
    const [isDocumnetViewSiteDialog, setIsDocumnetViewSiteDialog] = React.useState<boolean>(false);
    const [DialogData, setDialogData] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    let DisplaySite = React.useRef<string>("");
    const [PageName, setPageName] = React.useState<string>("");
    const [isAdmin, setisAdmin] = React.useState<boolean>(currentUserRoleDetail?.isAdmin);
    const [isStateManager, setisStateManager] = React.useState<boolean>(currentUserRoleDetail?.isStateManager);
    const [isCount, setIsCount] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const tooltipId2 = useId('tooltip');
    let CurrentRefSN = React.useRef<any>();
    let CurrentSiteNameId = React.useRef<any>();
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [width, setWidth] = React.useState<string>("1280px");
    const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>(props.selectedSiteIds || []);
    const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>(props.selectedSiteTitles || []);
    const [selectedSiteManagers, setSelectedSiteManagers] = React.useState<any[]>(props.selectedSiteManagers || []);
    const [selectedADUsers, setSelectedADUsers] = React.useState<number[]>(props.selectedADUsers || []);
    const [selectedState, setSelectedState] = React.useState<number[]>(props.selectedState || []);
    const [showFavConfirmation, setShowFavConfirmation] = React.useState(false);
    const [favouriteRecordItem, setFavouriteRecordItem] = React.useState<any>();
    const favouriteData = React.useRef<any[]>([]);
    const [isRender, setIsRender] = React.useState<boolean>(false);
    const [isToggleFavourite, setIsToggleFavorite] = React.useState<any>(true);
    const [isToggleArchive, setIsToggleArchive] = React.useState<any>(false);
    const count = React.useRef(0);
    const [selectedArchiveItem, setSelectedArchiveItem] = React.useState<any>(null);
    const [archiveDialog, setArchiveDialog] = React.useState(false);

    const filerRef = React.useRef<IFilterRef>({
        selectedSiteTitles: props.selectedSiteTitles || [],
        selectedState: props.selectedState || [],
        selectedSiteManagers: props.selectedSiteManagers || [],
        selectedADUsers: props.selectedADUsers || [],
        selectedSCSites: props.selectedSCSites || [],
        selectedSiteIds: props.selectedSiteIds || []
    })


    const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>(props.selectedSCSites || []);
    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSiteIds(siteIds);
        setSelectedSiteTitles(siteTitles);
        setSelectedSCSites(siteSC);
        filerRef.current = {
            ...filerRef.current,
            selectedSiteTitles: siteTitles,
            selectedSCSites: siteSC,
            selectedSiteIds: siteIds,
        }
    };

    const onADUserChange = (selectedUsers: number[]): void => {
        setSelectedADUsers(selectedUsers); // Update the state with the selected IDs
        filerRef.current = {
            ...filerRef.current,
            selectedADUsers: selectedUsers,
        }

    };

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
            height: "85vh",
            maxWidth: '1280px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
        },
        closeButton: {
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            background: 'transparent',
            border: 'none',
            color: '#000',
            cursor: 'pointer',
            selectors: {
                ':hover': {
                    color: '#1300a6',
                },
            },
        },
    });


    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("1280px");
        }
    }, [window.innerWidth]);

    const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : 'grid');

    const handleViewChange = (view: string) => {
        setCurrentView(view);
    };

    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);

    const [dialogState, setDialogState] = React.useState<IDialogMessageState>({
        dialogHeader: "",
        dialogMessage: "",
        isSuccess: false
    });

    const [HideErrorDialog, setHideErrorDialog] = React.useState(true);

    const ToggleHideErrorDialog = () => {
        setHideErrorDialog(!HideErrorDialog);
    };

    const handleCancelOrSuccessClick = () => {
        console.log('Dialog action performed');
    };
    const closeConfirmationDialog = () => {
        setShowFavConfirmation(false);
    }

    const _loadSiteData = async (stateId?: any) => {

        try {
            let filter: any = "";
            let filterArray = [];
            if (currentUserRoleDetail.isAdmin === true) {

                if (!!selectedSiteTitles && selectedSiteTitles.length > 0) {
                    // const siteFilters = selectedSiteTitles.map((site: any) => `Title eq '${site}'`).join(" or ");
                    const siteFilters = selectedSiteTitles.map((site: any) => `Title eq '${site.replace(/'/g, "''")}'`).join(" or ");
                    filterArray.push(siteFilters);
                }

                if (selectedState && selectedState.length > 0) {
                    const filterConditions = selectedState.map((stateId: number) => `QCStateId eq '${stateId}'`);
                    filterArray.push(filterConditions.join(' or ')); // Join conditions with 'or' for multiple values
                }


                if (filterArray.length > 0) {
                    if (!!filter && filterArray.length > 1)
                        filter = filter + " and (" + filterArray.join(" and ") + ")";
                    else
                        filter = filterArray.join(" and ");
                }

            } else {

                // if (isStateManager === true) {
                //     if (selectedADUsers.length > 0) {
                //         const userFilters = selectedADUsers.map((id) => `ADUserId eq '${id}'`);
                //         filterArray.push(`(${userFilters.join(" or ")})`);
                //     }
                // } else {
                //     filter = `(SiteManagerId eq '${currentUser?.userId}' or ADUserId eq '${currentUser?.userId}' or  SiteSupervisorId eq  '${currentUser?.userId}')`;
                // }
                if (isStateManager === true) {
                    if (selectedADUsers.length > 0) {
                        const userFilters = selectedADUsers.map((id) => `ADUserId eq '${id}'`);
                        filterArray.push(`(${userFilters.join(" or ")})`);
                    }
                } else if (!!selectedADUsers && selectedADUsers.length > 0) {
                    if (selectedADUsers.length > 0) {
                        const userFilters = selectedADUsers.map((id) => `ADUserId eq '${id}'`);
                        filterArray.push(`(${userFilters.join(" or ")})`);
                    }
                } else if (currentUserRoleDetail.isShowOnlyChairPerson && currentUserRoleDetail.whsChairpersonsStateId.length > 0) {
                    const filterConditions = currentUserRoleDetail.whsChairpersonsStateId.map((stateId: number) => `QCStateId eq '${stateId}'`);
                    filterArray.push(filterConditions.join(' or '));
                }
                else {
                    filter = `(SiteManagerId eq '${currentUser?.userId}' or ADUserId eq '${currentUser?.userId}' or  SiteSupervisorId eq  '${currentUser?.userId}')`;
                }

                if (!!selectedSiteTitles && selectedSiteTitles.length > 0) {
                    // const siteFilters = selectedSiteTitles.map((site: any) => `Title eq '${site}'`).join(" or ");
                    const siteFilters = selectedSiteTitles.map((site: any) => `Title eq '${site.replace(/'/g, "''")}'`).join(" or ");
                    filterArray.push(siteFilters);
                }

                if (selectedState && selectedState.length > 0) {
                    const filterConditions = selectedState.map((stateId: number) => `QCStateId eq '${stateId}'`);
                    filterArray.push(filterConditions.join(' or ')); // Join conditions with 'or' for multiple values
                }


                if (filterArray.length > 0) {
                    if (!!filter)
                        filter = filter + " and (" + filterArray.join(" and ") + ")";
                    else
                        filter = filterArray.join(" and ");
                }
            }
            const externalURL = getExternalUrl(context);
            let OB = "";
            OB = `Modified`;
            const queryStringOptions: IPnPQueryOptions = {
                select: ["ID,Title,SiteImage,SiteManagerId,ADUserId,ADUser/Id,ADUser/Title,ADUser/Name,QCStateId,SiteManager/Title,SiteManager/Id,SiteManager/Name,SiteManager/EMail,SiteImageThumbnailUrl,HelpDesk,Periodic,ClientResponse,JobControlChecklist,ManageEvents,SiteSupervisorId,SiteSupervisor/Title,SiteSupervisor/Id,SiteSupervisor/Name,SiteSupervisor/EMail,QCState/Title,Category,IsDeleted,SiteCategoryId,StaffMembers/Id"],
                expand: ["SiteManager,ADUser,SiteSupervisor,QCState,StaffMembers"],
                filter: filter,
                listName: ListNames.SitesMaster,
                orderBy: OB,
                isSortOrderAsc: false
            };

            const results = await provider.getItemsByQuery(queryStringOptions);

            if (results) {
                let UsersListData = results.map((data) => {
                    const fixImgURL = `${context.pageContext.web.serverRelativeUrl}/Lists/SitesMaster/Attachments/${data.ID}/`;
                    let PhotoURL;
                    try {
                        const PhotoData = data.SiteImage ? JSON?.parse(data.SiteImage) : null;
                        PhotoURL = PhotoData?.serverRelativeUrl || fixImgURL + PhotoData?.fileName || notFoundImage;
                    } catch {
                        PhotoURL = notFoundImage;
                    }

                    return {
                        ID: data.ID,
                        Id: data.Id,
                        Title: data.Title,
                        SiteManagerId: data.SiteManagerId,
                        StateId: data.QCStateId,
                        SiteManager: data.SiteManager?.Title || '',
                        SiteManagerEmail: data.SiteManager?.EMail || '',
                        Image: PhotoURL,
                        SiteImageThumbnailUrl: data.SiteImageThumbnailUrl || "",
                        HelpDesk: data.HelpDesk,
                        Periodic: data.Periodic,
                        ClientResponse: data.ClientResponse,
                        JobControlChecklist: data.JobControlChecklist,
                        ManageEvents: data.ManageEvents,
                        UserUS: (!!data.ADUserId && data.ADUserId.length > 0) ? data.ADUser.map((i: { Title: any; }) => i.Title) : '',
                        SM: (!!data.SiteManagerId && data.SiteManagerId.length > 0) ? data.SiteManager.map((i: { Title: any; }) => i.Title) : '',
                        SS: (!!data.SiteSupervisorId && data.SiteSupervisorId.length > 0) ? data.SiteSupervisor.map((i: { Title: any; }) => i.Title) : '',
                        // MasterUserUS: !!data.ADUserId ? data.ADUser : [],
                        MasterUserUS: !!data.ADUserId ? data.ADUser.map((user: any) => ({
                            ...user,
                            EMail: user.Name.split('i:0#.f|membership|').filter(Boolean)[0]
                        })) : [],
                        MasterSM: !!data.SiteManagerId ? data.SiteManager : [],
                        MasterSS: !!data.SiteSupervisorId ? data.SiteSupervisor : [],
                        StaffMembers: !!data.StaffMembers ? data.StaffMembers : [],
                        ADUser: !!data.ADUserId ? data.ADUser.Title : '',
                        ADUserId: !!data.ADUserId ? data.ADUserId : "",
                        QCStateId: !!data.QCStateId ? data.QCStateId : "",
                        QCState: !!data.QCStateId ? data.QCState.Title : "",
                        Modified: !!data.Modified ? data.Modified : null,
                        img: !!data?.SiteImageThumbnailUrl ? data?.SiteImageThumbnailUrl : notFoundImage,
                        Category: !!data.Category ? data.Category : "",
                        SiteCategoryId: data?.SiteCategoryId,
                        IsDeleted: !!data.IsDeleted ? data.IsDeleted : false,
                    };
                }).sort((a: any, b: any) => moment(b.Modified).diff(moment(a.Modified)));

                let statenames = CurrentRefSN.current;

                let filtered = selectedSiteManagers.length > 0
                    ? UsersListData?.filter((record: any) =>
                        record.SiteManagerId?.some((id: number) => selectedSiteManagers.includes(id))
                    )
                    : UsersListData;

                if (selectedADUsers.length > 0) {
                    filtered = filtered?.filter((record: any) =>
                        selectedADUsers.some((id) => (!!record.ADUserId && record.ADUserId.length > 0) && record.ADUserId?.includes(id))
                    );
                }

                // Determine what data to display based on roles
                if (isAdmin) {
                    viewAllSitesData.current =
                        selectedSiteManagers.length > 0 || selectedADUsers.length > 0
                            ? filtered
                            : UsersListData;
                }
                else if (isStateManager) {
                    const filteredRecords = UsersListData.filter((record: any) => statenames?.includes(record.QCStateId));
                    viewAllSitesData.current = filteredRecords;
                } else {
                    viewAllSitesData.current = selectedSiteManagers.length > 0 ? filtered : UsersListData;
                }
                // setIsLoading(false);
                // setIsCount(true);
                setIsRender(true);
                const siteNameArray = isAdmin
                    ? UsersListData.map(item => item.ID)
                    : isStateManager
                        ? UsersListData.filter(item => stateId?.includes(item.StateId)).map(item => item.ID)
                        : UsersListData.map(item => item.ID);

                setSiteName(siteNameArray);
            }
        } catch (ex) {
            console.log(ex);
            const errorObj = {
                ErrorMessage: ex.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error occurred while fetching site data",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "loadSiteData"
            };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
            setError(getErrorMessageValue(ex.message));
        }
    };

    const _stateData = async () => {
        try {
            const queryStringOptions: IPnPQueryOptions = {
                select: ["ID,Title,StateManagerId,StateManager/Title,StateManager/Name,StateManager/EMail,WHSChairpersonId,WHSChairperson/Title, WHSChairperson/EMail,WHSChairperson/Id"],
                expand: ["StateManager,WHSChairperson"],
                listName: ListNames.StateMaster,
                filter: `StateManagerId eq '${currentUser?.userId}'`
            };

            const results = await provider.getItemsByQuery(queryStringOptions);

            if (results?.length) {
                const stateData = results.map(data => ({
                    ID: data.ID,
                    Title: data.Title,
                    StateManagerId: data.StateManagerId,
                    StateManager: data.StateManager?.Title || '',
                    StateManagerEmail: data.StateManager?.EMail || '',
                }));

                const matchingTitles = stateData
                    .filter(item => item.StateManagerId?.includes(currentUser?.userId))
                    .map(item => item.ID);

                CurrentRefSN.current = matchingTitles;
                _loadSiteData(matchingTitles);
            }
        } catch (error) {
            console.error(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error occurred while fetching state data",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_stateData"
            };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
            setError(getErrorMessageValue(error.message));
        }
    };

    const onSiteManagerChange = (siteManagerIds: any[]): void => {
        setSelectedSiteManagers(siteManagerIds);
        filerRef.current = {
            ...filerRef.current,
            selectedSiteManagers: siteManagerIds,
        }
        // setSelectedSiteManagerId()
    };

    const onStateChange = (stateIds: number[], options: any): void => {
        setSelectedState(stateIds); // Store the selected state IDs as an array
        filerRef.current = {
            ...filerRef.current,
            selectedState: stateIds,
        }
    };

    const onClickClose = () => {
        setisShowAssetHistoryModel(false);
        setIsDocumnetViewSiteDialog(false);

    };

    const _onChange = (ev: React.MouseEvent<HTMLElement>, checked?: boolean) => {
        setIsToggleFavorite(checked);
        setIsRender(true);
    };

    const _onChangeArchive = (ev: React.MouseEvent<HTMLElement>, checked?: boolean) => {
        setIsToggleArchive(checked);
        setIsRender(true);
    };

    const reloadFavouriteData = async (): Promise<void> => {
        setIsLoading(true);
        const favData = await getFavouriteData();
        favouriteData.current = favData;
        setShowFavConfirmation(false);
        setFavouriteRecordItem(undefined);
        setIsRender(true);
    };

    const onClickFavRecordYes = async () => {
        setIsLoading(true);
        const isExist = favouriteData.current.find(favItem => favItem.SiteId === favouriteRecordItem?.Id);
        const toastId = toastService.loading('Loading...');
        const objData = {
            SiteId: favouriteRecordItem?.Id,
            Favourite: !favouriteRecordItem?.IsFavourite
        }
        const msg = objData.Favourite === true ? Messages.FavouriteSaveSuccess : Messages.FavouriteRemoveSuccess;
        if (isExist) {
            await provider.updateItemWithPnP(objData, ListNames.UserWiseFavourite, isExist?.Id).then(() => {
                toastService.updateLoadingWithSuccess(toastId, msg);
            });
        } else {
            await provider.createItem(objData, ListNames.UserWiseFavourite).then(() => {
                toastService.updateLoadingWithSuccess(toastId, msg);
            });
        }
        reloadFavouriteData();
        setIsLoading(false);
        try {
            _userFavActivityLog(objData);
        } catch (error) {
            console.error("Error creating user activity log:", error);
        }
    };

    const getFavouriteData = async () => {
        try {
            let filterFields: any[] = [
                {
                    fieldName: FavoriteFields.Author,
                    fieldValue: currentUser.userId,
                    fieldType: FieldType.User,
                    LogicalType: LogicalType.EqualTo
                }
            ];
            const camlQuery = new CamlBuilder()
                .View([
                    FavoriteFields.Id,
                    FavoriteFields.Favourite,
                    FavoriteFields.Site
                ])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query()

            const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);

            if (filterFields?.length > 0) {
                camlQuery.Where().All(categoriesExpressions);
            }
            const localResponse = await provider.getItemsByCAMLQuery(ListNames.UserWiseFavourite, camlQuery.ToString(), null, "");
            const data = localResponse.map((item: any) => ({
                SiteId: item.Site[0].lookupId,
                Favourite: item.Favourite === "Yes" ? true : false,
                Id: parseInt(item.ID),
            }));
            return data;
        } catch (error) {
            console.error("Error fetching favourite items:", error);
            return [];
        }
    };

    const _getChemicalMasterList = (item: any, ChemicalName: any[]) => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,Manufacturer,SDSDate,ProductPhotoThumbnailUrl,Hazardous,HazClass,StorageRequest,pH,StorageClass,SDS,PPERequired,QCNotes,NumberOfItems,ExpirationDate,SDSDocument,ProductPhoto"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: "",
                listName: ListNames.ChemicalRegistration,
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const matchingRecords = results.filter(record => ChemicalName.includes(record.ID));
                    // const matchingRecords = results.filter(record => ChemicalName.includes(record.Title));
                    const chemicalListData = matchingRecords.map((data) => {

                        const fixImgURL = '/sites/Quayclean/Lists/ChemicalRegistration/Attachments/' + data.ID + "/";
                        let productPhotoURL;
                        if (data.ProductPhoto) {
                            try {
                                const productPhotoData = JSON.parse(data.ProductPhoto);
                                if (productPhotoData && productPhotoData.serverRelativeUrl) {
                                    productPhotoURL = productPhotoData.serverRelativeUrl;
                                } else if (productPhotoData && productPhotoData.fileName) {
                                    productPhotoURL = fixImgURL + productPhotoData.fileName;
                                } else {
                                    productPhotoURL = notFoundImage;
                                }
                            } catch (error) {
                                console.error("Error parsing ProductPhoto JSON:", error);
                                productPhotoURL = notFoundImage;
                            }
                        } else {
                            productPhotoURL = notFoundImage;
                        }

                        const formattedSDSDate = data.SDSDate ? moment(data.SDSDate).format(DateFormat) : null;
                        const formattedExpirationDate = data.ExpirationDate ? moment(data.ExpirationDate).format(DateFormat) : null;
                        const compareDate = data.ExpirationDate ? moment(data.ExpirationDate).format(defaultValues.FilterDateFormate) + "T18:00:00Z" : null;
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                Manufacturer: data.Manufacturer,
                                SDSDate: formattedSDSDate,
                                ExpirationDate: formattedExpirationDate,
                                compareDate: !!compareDate ? compareDate : "",
                                Hazardous: data.Hazardous,
                                HazClass: data.HazClass,
                                StorageRequest: data.StorageRequest,
                                pH: data.pH,
                                SDS: data.SDS ? data.SDS.Url : "",
                                PPERequired: data.PPERequired,
                                ProductPhoto: productPhotoURL,
                                FullExpirationDate: !!data.ExpirationDate ? data.ExpirationDate : "",
                                ProductPhotoThumbnailUrl: !!data.ProductPhotoThumbnailUrl ? data.ProductPhotoThumbnailUrl : notFoundImage,
                            }
                        );
                    });
                    // const matchingRecords = chemicalListData.filter(record => ChemicalName.includes(record.Title));
                    setDialogData(chemicalListData);
                    setIsLoading(false);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
                console.log(error);
                const errorObj = {
                    ErrorMessage: error.toString(),
                    ErrorStackTrace: "",
                    CustomErrormessage: "Error is occuring while _getChemicalMasterList",
                    PageName: "QuayClean.aspx",
                    ErrorMethodName: "_getChemicalMasterList"
                };
                void logGenerator(provider, errorObj);
                setIsLoading(false);
                const errorMessage = getErrorMessageValue(error.message);
                setError(errorMessage);
            });

        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
            const errorObj = {
                ErrorMessage: ex.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while _getChemicalMasterList",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_getChemicalMasterList"
            };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
            const errorMessage = getErrorMessageValue(error.message);
            setError(errorMessage);
        }
    };

    const _EquipmentMaster = (item: any) => {
        setIsLoading(true);
        try {
            const select = ["ID,Attachments,AssetCategory,AttachmentFiles,AssetPhotoThumbnailUrl,QRCode,Title,SiteNameId,AssetType,Manufacturer,Model,QCColor,AMStatus,PurchasePrice,PurchaseDate,ServiceDueDate,SerialNumber,ConditionNotes,AssetLink,AssetPhoto,PreviousOwnerId,PreviousOwner/EMail,CurrentOwnerId,CurrentOwner/EMail"];
            const expand = ["PreviousOwner", "CurrentOwner", "AttachmentFiles"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.AssetMaster,
                filter: `SiteNameId eq '${item}' and IsDeleted ne 1`,
                expand: expand
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const AssetListData = results.map((data) => {
                        const fixImgURL = context.pageContext.web.serverRelativeUrl + '/Lists/AssetMaster/Attachments/' + data.ID + "/";
                        let AssetPhotoURL;
                        let attachmentFiledata;
                        let QRCodeUrl: string = '';
                        if (data.AttachmentFiles.length > 0) {
                            try {
                                const AttachmentData = data.AttachmentFiles[0];
                                if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                                    attachmentFiledata = AttachmentData.ServerRelativeUrl;
                                } else if (AttachmentData && AttachmentData.FileName) {
                                    attachmentFiledata = fixImgURL + AttachmentData.FileName;
                                } else {
                                    attachmentFiledata = notFoundImage;
                                }
                            } catch (error) {
                                console.error("Error parsing AssetPhoto JSON:", error);
                                attachmentFiledata = notFoundImage;
                            }
                        } else {
                            attachmentFiledata = null;
                        }
                        if (data.AssetPhoto) {
                            try {
                                const AssetPhotoData = JSON.parse(data.AssetPhoto);
                                if (AssetPhotoData && AssetPhotoData.serverRelativeUrl) {
                                    AssetPhotoURL = AssetPhotoData.serverRelativeUrl;
                                } else if (AssetPhotoData && AssetPhotoData.fileName) {
                                    AssetPhotoURL = fixImgURL + AssetPhotoData.fileName;
                                } else {
                                    AssetPhotoURL = notFoundImage;
                                }
                            } catch (error) {
                                console.error("Error parsing AssetPhoto JSON:", error);
                                AssetPhotoURL = notFoundImage;
                            }
                        } else {
                            AssetPhotoURL = notFoundImage;
                        }
                        if (data.QRCode) {
                            try {
                                const QRCodePhotoData = JSON.parse(data.QRCode);
                                if (QRCodePhotoData && QRCodePhotoData.serverRelativeUrl) {
                                    QRCodeUrl = QRCodePhotoData.serverRelativeUrl;
                                } else if (QRCodePhotoData && QRCodePhotoData.fileName) {
                                    QRCodeUrl = fixImgURL + QRCodePhotoData.fileName;
                                } else {
                                    QRCodeUrl = notFoundImage;
                                }
                            } catch (error) {
                                console.error("Error parsing QRCodePhotoData JSON:", error);
                                QRCodeUrl = notFoundImage;
                            }
                        } else {
                            QRCodeUrl = notFoundImage;
                        }
                        return (
                            {
                                ID: data.ID,
                                Title: !!data.Title ? data.Title : "",
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                                AssetType: !!data.AssetType ? data.AssetType : "",
                                Manufacturer: !!data.Manufacturer ? data.Manufacturer : "",
                                Model: !!data.Model ? data.Model : "",
                                QCColor: !!data.QCColor ? data.QCColor : "",
                                Status: !!data.AMStatus ? data.AMStatus : "",
                                PurchasePrice: !!data.PurchasePrice ? data.PurchasePrice : "",
                                ServiceDueDate: !!data.ServiceDueDate ? getConvertedDate(data.ServiceDueDate) : "",
                                SerialNumber: !!data.SerialNumber ? data.SerialNumber : "",
                                AssetImage: AssetPhotoURL,
                                Attachment: attachmentFiledata,
                                // NumberOfItems: !!data.NumberOfItems ? data.NumberOfItems : "",
                                AssetCategory: !!data.AssetCategory ? data.AssetCategory : "",
                                // QCOrder: !!data.QCOrder ? data.QCOrder : "",
                                DueDate: !!data.ServiceDueDate ? data.ServiceDueDate : "",
                                fullServiceDueDate: !!data.ServiceDueDate ? data.ServiceDueDate : "",
                                PurchaseDate: !!data.PurchaseDate ? data.PurchaseDate : "",
                                AssetLink: !!data.AssetLink ? data.AssetLink : "",
                                ConditionNotes: !!data.ConditionNotes ? data.ConditionNotes : "",
                                CurrentOwnerId: !!data.CurrentOwnerId ? data.CurrentOwnerId : "",
                                PreviousOwnerId: !!data.PreviousOwnerId ? data.PreviousOwnerId : "",
                                CurrentOwner: !!data.CurrentOwner ? data.CurrentOwner.EMail : "",
                                PreviousOwner: !!data.PreviousOwner ? data.PreviousOwner.EMail : "",
                                AssetPhotoThumbnailUrl: !!data.AssetPhotoThumbnailUrl ? data.AssetPhotoThumbnailUrl : notFoundImage,
                                QRCode: QRCodeUrl

                            }
                        );
                    });
                    setDialogData(AssetListData);
                    setIsLoading(false);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
                const errorObj = {
                    ErrorMessage: error.toString(),
                    ErrorStackTrace: "",
                    CustomErrormessage: "Error is occuring while _EquipmentMaster",
                    PageName: "QuayClean.aspx",
                    ErrorMethodName: "_EquipmentMaster"
                };
                void logGenerator(provider, errorObj);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
            const errorObj = {
                ErrorMessage: ex.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while _EquipmentMaster",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_EquipmentMaster"
            };
            void logGenerator(provider, errorObj);
        }
    };

    const _onClickCount = (item: number, pageName: string) => {
        CurrentSiteNameId.current = item;
        setDialogData([]);

        let objData: any;
        switch (pageName) {
            case "DocumentsPage":
                objData = ListDocuments.current ? ListDocuments.current : "";
                break;
            case "TeamsPage":
                objData = ListTeam.current ? ListTeam.current : "";
                break;
            case "ChemicalsPage":
                objData = ListChemical.current ? ListChemical.current : "";
                break;
            case "InspectionsPage":
                objData = ListInspection.current ? ListInspection.current : "";
                break;
            default:
                objData = undefined
                break;
        }

        const DisplaySiteName = viewSitesData?.current?.find((x: any) => x.ID === item);
        DisplaySite.current = DisplaySiteName?.Title || "";

        setPageName(pageName);
        let DialogData = objData?.filter((x: any) => x.SiteNameId === item);
        const FinalChemicalName: string[] = DialogData?.map((item: { ChemicalsId: any; }) => item.ChemicalsId);

        switch (pageName) {
            case "DocumentsPage":
                setDialogData(DialogData);
                setIsDocumnetViewSiteDialog(true);
                break;
            case "InspectionsPage":
                showPopup();
                // setIsInspectionDialog(true);
                // setisShowAssetHistoryModel(true);
                setDialogData(DialogData);
                break;
            case "TeamsPage":
                setisShowAssetHistoryModel(true);
                setDialogData(DialogData);
                break;
            case "ChemicalsPage":
                setisShowAssetHistoryModel(true);
                _getChemicalMasterList(item, FinalChemicalName);
                break;
            default:
                setisShowAssetHistoryModel(true);
                _EquipmentMaster(item);
                break;
        }
    };

    const loadSitesCountData = (DocumentData?: any, ListTeamGrouped?: any, ListChemicalGrouped?: any, ListEquipmentGrouped?: any, ListInspectionGrouped?: any) => {

        let UsersListData = viewSitesData.current?.map((data: any) => {
            return {
                ...data,
                Assets: (!!ListEquipmentGrouped && ListEquipmentGrouped.length > 0) ? ListEquipmentGrouped.filter((item: any) => item.SiteNameId == data.Id).length : -1,
                Chemical: (!!ListChemicalGrouped && ListChemicalGrouped.length > 0) ? ListChemicalGrouped.filter((item: any) => item.SiteNameId == data.Id).length : -1,
                Inspection: (!!ListInspectionGrouped && ListInspectionGrouped.length > 0) ? ListInspectionGrouped.filter((item: any) => item.SiteNameId == data.Id).length : -1,
                Team: (!!ListTeamGrouped && ListTeamGrouped.length > 0) ? ListTeamGrouped.filter((item: any) => item.SiteNameId == data.Id).length : -1,
                // Documents: DocumentData ? DocumentData.filter((item: any) => item.SiteNameId == data.Id && !item.isFolder).length : -1,
            };
        }).sort((a: any, b: any) => moment(b.Modified).diff(moment(a.Modified)));
        // });
        viewSitesData.current = UsersListData;
    };

    const _InspectionData = async () => {
        try {
            const camlQuery = new CamlBuilder()
                .View([
                    "Id",
                    "Title",
                    "DocNumber",
                    "Archived",
                    "Status",
                    "SiteName",
                    "Score",
                    "Owner",
                    "Conductedon",
                    "Created",
                    "Modified",
                    "Completed",
                    "InspectionTitle",
                    "TemplateName",
                    "TemplateId",
                    "WebReportURL",
                    "Location",
                    "ItemsCompleted",
                    "LastEditor"
                ])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query();

            const filterFields: ICamlQueryFilter[] = [
                {
                    fieldName: "Archived",
                    fieldValue: false,
                    fieldType: FieldType.Boolean,
                    LogicalType: LogicalType.EqualTo
                }];

            const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
            camlQuery.Where().All(categoriesExpressions);

            const pnpQueryOptions: IPnPCAMLQueryOptions = {
                listName: ListNames.AuditInspectionData,
                queryXML: camlQuery.ToString(),
                pageToken: "",
                pageLength: 100000
            }
            const localResponse = await provider.getItemsInBatchByCAMLQuery(pnpQueryOptions);
            const results = localResponse?.Row;

            if (!!results) {
                const ListData = results.map((data: any) => {
                    return {
                        ID: data.ID,
                        Title: data.Title,
                        DocNumber: !!data.DocNumber ? data.DocNumber : '',
                        SiteNameId: !!data.SiteName ? data.SiteName[0]?.lookupId : '',
                        SiteName: !!data?.SiteName ? data.SiteName[0]?.lookupValue : '',
                        Score: !!data.Score ? data.Score : '',
                        Owner: !!data.Owner ? data.Owner : '',
                        srtCompleted: !!data.Completed ? moment(data.Completed).format('YYYY-MM-DD') : '9999-12-31', // Format for sorting
                        srtConductedon: !!data.Conductedon ? moment(data.Conductedon).format('YYYY-MM-DD') : '',
                        Conductedon: !!data.Conductedon ? moment(data.Conductedon).format('DD MMM YYYY') : '',
                        Created: !!data.Created ? moment(data.Created).format('DD MMM YYYY HH:MM A') : '',
                        Modified: !!data.Modified ? moment(data.Modified).format('DD MMM YYYY HH:MM A') : '',
                        Completed: !!data.Completed ? moment(data.Completed).format('DD MMM YYYY') : '31 Dec 9999',
                        InspectionTitle: !!data.InspectionTitle ? data.InspectionTitle : '',
                        TemplateName: !!data.TemplateName ? data.TemplateName : '',
                        TemplateId: !!data.TemplateId ? data.TemplateId : '',
                        WebReportURL: !!data.WebReportURL ? data.WebReportURL : '',
                        Status: !!data.Status ? data.Status : '',
                        Location: !!data.Location ? data.Location : '',
                        ItemsCompleted: !!data.ItemsCompleted ? data.ItemsCompleted : '',
                        LastEditor: !!data.Editor ? data.Editor.Title : ""
                    };
                });

                let filteredData: any[];
                if (currentUserRoleDetail?.isAdmin) {
                    filteredData = ListData;
                } else {
                    let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                    filteredData = !!ListData && ListData?.filter((item: any) =>
                        AllSiteIds.includes(item?.SiteNameId)
                    );
                }

                setIsLoading(false);
                return filteredData;
            }
            return [];
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
    };


    const _associatedTeam = async () => {
        try {
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.SitesAssociatedTeam,
                select: ["Id", "SiteNameId", "Title", "SkillSet", "ATRole", "ATUserName", "Attachments", "AttachmentFiles", "Location"],
                expand: ["AttachmentFiles"],
                filter: `IsDeleted ne 1`
            };

            const results = await provider.getItemsByQuery(queryOptions);

            if (results) {
                const TeamsListData = results.map((data) => {
                    let attachmentFiledata: any = null;

                    if (data.AttachmentFiles?.length > 0) {
                        const fixImgURL = `${context.pageContext.web.serverRelativeUrl}/Lists/AssetMaster/Attachments/${data.Id}/`;

                        try {
                            const AttachmentData = data.AttachmentFiles[0];

                            if (AttachmentData) {
                                attachmentFiledata = AttachmentData.ServerRelativeUrl
                                    ? AttachmentData.ServerRelativeUrl
                                    : `${fixImgURL}${AttachmentData.FileName || ""}`;
                            }
                        } catch (error) {
                            console.error("Error parsing AssetPhoto JSON:", error);
                        }
                    }

                    return {
                        ID: data.ID,
                        Title: data.Title,
                        SiteNameId: data.SiteNameId || 0,
                        UserName: data.ATUserName || "",
                        Role: data.ATRole || "",
                        SkillSet: data.SkillSet || "",
                        userImageAttachment: attachmentFiledata,
                    };
                });

                return TeamsListData;
            }

            // Return an empty array if no results are found
            return [];
        } catch (error) {
            console.error("Error fetching associated team:", error);

            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occurring while fetching associated team",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "View Site"
            };

            await logGenerator(provider, errorObj);
            setIsLoading(false);

            // Return an empty array if an error occurs
            return [];
        }
    };

    const _associatedEquipment = async () => {
        try {
            const select = ["ID,Title,SiteNameId"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.AssetMaster,
                filter: `IsDeleted ne 1`
            };

            const results = await provider.getItemsByQuery(queryStringOptions);

            if (results) {
                const EquipmentsListData = results.map((data) => ({
                    ID: data.ID,
                    Title: data.Title,
                    SiteNameId: data.SiteNameId,
                }));

                return EquipmentsListData;
            }

            return [];
        } catch (error) {
            console.error("Error fetching associated equipment:", error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occurring while fetching associated equipment",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "associate equipment"
            };
            await logGenerator(provider, errorObj);
            setIsLoading(false);
            return [];
        }
    };

    const _associatedDocuments = async () => {
        const queryOptions: IPnPQueryOptions = {
            listName: ListNames.DocumentsDisplayName,
            select: ['Title,Id,FileLeafRef,FileRef,SiteNameId,FSObjType,FileDirRef,ServerRedirectedEmbedUrl'],
        };

        try {
            const items = await provider.getItemsByQuery(queryOptions);

            if (items) {
                const documents = items.map((data: any) => {
                    const filePath: string = data.ServerRedirectedEmbedUrl
                        ? data.ServerRedirectedEmbedUrl
                        : data.FileLeafRef
                            ? `${window.location.origin}${data.FileRef}`
                            : "";

                    const embedFullFilePath = `${context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${data.ServerRedirectedEmbedUrl || ""}&action=embedview`;
                    const fileType = filePath.split('.').pop();

                    const DocumentFullPath = MicrosoftOfficeDocumentType.includes(fileType || '')
                        ? embedFullFilePath
                        : fileType === "zip"
                            ? `${filePath}?web=1&action=embedview`
                            : filePath;

                    return {
                        ID: data.ID,
                        id: data.ID,
                        title: data.Title || "",
                        SiteNameId: data.SiteNameId,
                        fileLeafRef: data.FileLeafRef,
                        previewUrl: DocumentFullPath,
                        isFolder: data.FSObjType === "1",
                        fileRef: data.FileRef || "",
                        fileDirRef: data.FileDirRef || "",
                        isFolderNumber: data.FSObjType === "1" ? 0 : 1,
                        parent: data.FileDirRef ? data.FileDirRef.split('/').filter((r: any) => !!r) : [],
                    };
                });

                return documents;
            }

            return [];
        } catch (error) {
            console.error("Error fetching associated documents:", error);
            return [];
        }
    };

    const _associatedChemical = async () => {
        try {
            const select = ["ID,Title,SiteNameId,ChemicalsId"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.SitesAssociatedChemical,
                filter: `IsDeleted ne 1`
            };

            const results = await provider.getItemsByQuery(queryStringOptions);

            if (results) {
                const ChemicalsListData = results.map((data) => ({
                    ID: data.ID,
                    Title: data.Title,
                    SiteNameId: data.SiteNameId,
                    ChemicalsId: data.ChemicalsId
                }));
                return ChemicalsListData;
            }

            return [];
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occurring while fetching associated chemicals",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_associatedChemical"
            };

            await logGenerator(provider, errorObj);
            setIsLoading(false);

            return [];
        }
    };

    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };


    const _onclickDetailsView = (itemID: any) => {
        try {
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewSite, dataObj: itemID, siteMasterId: itemID.ID, isShowDetailOnly: true, siteName: itemID.Title, qCState: itemID.QCState, breadCrumItems: breadCrumItems } });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AddNewSite,
                dataObj: itemID,
                siteMasterId: itemID.ID,
                isShowDetailOnly: true,
                view: currentView,
                siteName: itemID.Title,
                qCState: itemID.QCState,
                qCStateId: itemID.QCStateId,
                breadCrumItems: breadCrumItems,
                viewSelectedSiteTitlesFilter: filerRef?.current?.selectedSiteTitles,
                viewSelectedStateFilter: filerRef?.current?.selectedState,
                viewSelectedSiteManagersFilter: filerRef?.current?.selectedSiteManagers,
                viewSelectedADUsersFilter: filerRef?.current?.selectedADUsers,
                viewSelectedSCSitesFilter: filerRef?.current?.selectedSCSites,
                viewSelectedSiteIdsFilter: filerRef?.current?.selectedSiteIds
            });
        } catch (error) {
            const errorObj = { ErrorMethodName: "_onclickDetailsView", CustomErrormessage: "error in on click details view", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }
    };

    const renderSM = (smList: any[]) => {
        const displayNames = smList.length > 5
            ? smList.slice(0, 5).concat(['...'])
            : smList;
        return (
            <>
                {displayNames.map((name, index) => (
                    <span key={index} className={name !== '...' ? "attendees-badge-cls" : ''}>{name}</span>
                ))}
            </>
        );
    };

    const renderToolTipsSM = (smList: any[]) => {
        return (
            <>
                {smList.map((name, index) => (
                    <span key={index} className="attendees-badge-cls">{name}</span>
                ))}
            </>
        );
    };

    const renderSS = (ssList: any[]) => {
        const displayNames = ssList.length > 5
            ? ssList.slice(0, 5).concat(['...'])
            : ssList;
        return (
            <>
                {displayNames.map((name, index) => (
                    <span key={index} className={name !== '...' ? "attendees-badge-cls" : ''}>{name}</span>
                ))}
            </>
        );
    };

    const renderToolTipsSS = (ssList: any[]) => {
        return (
            <>
                {ssList.map((name, index) => (
                    <span key={index} className="attendees-badge-cls">{name}</span>
                ))}
            </>
        );
    };

    const renderUserUS = (userusList: any[]) => {
        const displayNames = userusList.length > 5
            ? userusList.slice(0, 5).concat(['...'])
            : userusList;
        return (
            <>
                {displayNames.map((name, index) => (
                    <span key={index} className={name !== '...' ? "attendees-badge-cls" : ''}>{name}</span>
                ))}
            </>
        );
    };

    const renderToolTipsUserUS = (userusList: any[]) => {
        return (
            <>
                {userusList.map((name, index) => (
                    <span key={index} className="attendees-badge-cls">{name}</span>
                ))}
            </>
        );
    };
    const onClickArchiveToggle = (item: any) => {
        setSelectedArchiveItem(item);
        setArchiveDialog(true);
    };

    const onClickArchiveConfirm = async () => {
        const item = selectedArchiveItem;
        if (!item) return;
        const isArchived = item?.IsDeleted === true;
        try {
            await provider.updateItemWithPnP(
                { IsDeleted: !isArchived },
                ListNames.SitesMaster,
                item.ID
            );
            toastService.success(
                `Item successfully ${isArchived ? "unarchived" : "archived"}`
            );
            setArchiveDialog(false);
            setSelectedArchiveItem(null);
            // _Periodic(); // Refresh
            // setDataState((prev: any) => ({
            //     ...prev,
            //     comment: "",
            //     selectedFiles: []
            // }));
            // // Reset file input field
            // setFileInputKey(prev => prev + 1);
            setIsRefreshGrid(prevState => !prevState);
        } catch (err) {
            toastService.error("Error while updating archive status");
            console.log(err);
        }
    };


    const setColumns = () => {
        setcolumnsUser([
            {
                key: "key7", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 100, maxWidth: 150,
                onRender: ((itemID: any) => {
                    const isArchived = itemID?.IsDeleted === true;
                    return <div>

                        <div className="action-buttons"><Link className="actionBtn btnView dticon" onClick={() => {
                        }}>
                            <TooltipHost
                                content={"Details"}
                                id={tooltipId}
                            >
                                <div onClick={() => _onclickDetailsView(itemID)}>
                                    <FontAwesomeIcon icon="eye" /></div>
                            </TooltipHost>
                        </Link>
                            <Link className="actionBtn btnEdit dticon" onClick={() => {
                            }}>
                                <TooltipHost
                                    content={"Favourite"}
                                    id={tooltipId}
                                >
                                    <div onClick={() => { setFavouriteRecordItem(itemID); setShowFavConfirmation(true) }}>
                                        <FontAwesomeIcon icon={itemID.IsFavourite ? 'star' : ['far', 'star']} />
                                    </div>
                                </TooltipHost>
                            </Link>
                            {/* <Link
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
                            </Link> */}
                            {/* <Link className="actionBtn btnDanger  dticon" onClick={() => {
                            }}>
                                <TooltipHost
                                    content={"Run Site Audit Report"}
                                    id={tooltipId}
                                >
                                    <div onClick={() =>
                                        props.manageComponentView({
                                            currentComponentName: ComponentNameEnum.SiteDetailView,
                                            dataObj: itemID,
                                            siteMasterId: itemID.ID,
                                            view: currentView,
                                            siteName: itemID.Title,
                                            qCState: itemID.QCState,
                                            qCStateId: itemID.QCStateId,
                                            viewSelectedSiteTitlesFilter: filerRef?.current?.selectedSiteTitles,
                                            viewSelectedStateFilter: filerRef?.current?.selectedState,
                                            viewSelectedSiteManagersFilter: filerRef?.current?.selectedSiteManagers,
                                            viewSelectedADUsersFilter: filerRef?.current?.selectedADUsers,
                                            viewSelectedSCSitesFilter: filerRef?.current?.selectedSCSites,
                                            viewSelectedSiteIdsFilter: filerRef?.current?.selectedSiteIds,
                                            preViousComponentName: ComponentNameEnum.ViewSite
                                        })

                                    }>
                                        <FontAwesomeIcon icon={faPlay} />
                                    </div>
                                </TooltipHost>
                            </Link> */}

                        </div >
                    </div >
                })
            },
            {
                key: 'Photo', name: 'Photo', fieldName: 'img', minWidth: 110, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => {
                    return (
                        // <img src={item.img} height="75px" width="110px" className="course-img-first" />
                        <LazyLoadImage src={item.img}
                            width={110} height={75}
                            placeholderSrc={notFoundImage}
                            alt="site photo"
                            className="course-img-first"
                            effect="blur"
                        />
                        // <ViewSiteImage
                        //     item={item}
                        //     prefix={"ViewSiteImage"}

                        //     imageUrl={item.img}
                        //     width={110} height={75}
                        //     alt="event photo"
                        //     className="course-img-first"
                        // />
                    );
                }
            },
            {
                key: "key1", name: 'Site Name', fieldName: 'Title', isResizable: true, minWidth: 150, maxWidth: 300, isSortingRequired: true,
                onRender: ((itemID: any) => {
                    return (
                        <>
                            <Link onClick={() => {
                                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewSite, dataObj: itemID, siteMasterId: itemID.ID, isShowDetailOnly: true, siteName: itemID.Title, qCState: itemID.QCState, breadCrumItems: breadCrumItems } });
                                props.manageComponentView({
                                    currentComponentName: ComponentNameEnum.AddNewSite,
                                    dataObj: itemID, siteMasterId: itemID.ID,
                                    isShowDetailOnly: true, siteName: itemID.Title,
                                    qCState: itemID.QCState, breadCrumItems: breadCrumItems,
                                    viewSelectedSiteTitlesFilter: filerRef?.current?.selectedSiteTitles,
                                    viewSelectedStateFilter: filerRef?.current?.selectedState,
                                    viewSelectedSiteManagersFilter: filerRef?.current?.selectedSiteManagers,
                                    viewSelectedADUsersFilter: filerRef?.current?.selectedADUsers,
                                    viewSelectedSCSitesFilter: filerRef?.current?.selectedSCSites,
                                    viewSelectedSiteIdsFilter: filerRef?.current?.selectedSiteIds
                                });
                            }}>
                                <TooltipHost content={"View Site"} id={tooltipId}>
                                    {itemID.Title}
                                </TooltipHost>
                            </Link>
                        </>
                    );

                })
            },
            {
                key: "key2", name: 'Site Manager', fieldName: 'SM', isResizable: true, minWidth: 180, maxWidth: 300, isSortingRequired: true,
                onRender: (itemID: any) => {
                    const maxDisplayCount = 3;
                    const displayedItems = itemID?.MasterSM?.slice(0, maxDisplayCount) || [];
                    const remainingItems = itemID?.MasterSM?.slice(maxDisplayCount) || [];
                    const totalItems = itemID?.MasterSM || [];
                    const tooltipContent = (
                        <div className="tooltip-persona-list">
                            {totalItems.map((item: { EMail: string; Title: string }) => (
                                <div key={item.EMail} className="attendees-badge-cls">
                                    <Persona
                                        imageUrl={`${window.location.origin}/_layouts/15/userPhoto.aspx?accountName=${item.EMail}&Size=S`}
                                        text={item.Title}
                                        secondaryText={item.EMail}
                                        size={PersonaSize.size24}
                                        imageAlt="IMG"
                                    />
                                </div>
                            ))}
                        </div>
                    );
                    return (
                        <>
                            <div className="cls-pointer">
                                {displayedItems.map((item: { EMail: string; Title: string, Id: number }, Index: any) => (
                                    <div key={item.Title} className="attendees-badge-cls-2">

                                        {/* <UserPersonaById
                                            context={context}
                                            AuthorId={item?.Id}
                                            provider={provider}
                                            isHoverShow={true}
                                        /> */}
                                        <UserPersonaByEmail
                                            email={item.EMail}
                                            title={item.Title}
                                            size={PersonaSize.size24}
                                            showHoverDetail={true}
                                        />
                                    </div>
                                ))}
                                {remainingItems.length > 0 && (
                                    <Link className="tooltipcls">
                                        <TooltipHost content={tooltipContent} className="cls-pointer" id={`tooltipId`}>
                                            <div className="remaining-count-cls">
                                                +{remainingItems.length} more
                                            </div>
                                        </TooltipHost>
                                    </Link >
                                )}
                            </div>
                        </>
                    );
                },
            },
            {
                key: "key3", name: 'Site Supervisor', fieldName: 'SS', isResizable: true, minWidth: 180, maxWidth: 300, isSortingRequired: true,
                onRender: (itemID: any) => {
                    const maxDisplayCount = 3;
                    const displayedItems = itemID?.MasterSS?.slice(0, maxDisplayCount) || [];
                    const remainingItems = itemID?.MasterSS?.slice(maxDisplayCount) || [];
                    const totalItems = itemID?.MasterSS || [];
                    const tooltipContent = (
                        <div className="tooltip-persona-list">
                            {totalItems.map((item: { EMail: string; Title: string }) => (
                                <div key={item.EMail} className="attendees-badge-cls">
                                    <Persona
                                        imageUrl={`${window.location.origin}/_layouts/15/userPhoto.aspx?accountName=${item.EMail}&Size=S`}
                                        text={item.Title}
                                        secondaryText={item.EMail}
                                        size={PersonaSize.size24}
                                        imageAlt="IMG"
                                    />
                                </div>
                            ))}
                        </div>
                    );
                    return (
                        <>
                            <div className="cls-pointer">
                                {displayedItems.map((item: { EMail: string; Title: string, Id: number }, Index: any) => (

                                    <div key={item.Title} className="attendees-badge-cls-2">
                                        {/* <Persona
                                            imageUrl={`${window.location.origin}/_layouts/15/userPhoto.aspx?accountName=${item.EMail}&Size=S`}
                                            text={item.Title}
                                            secondaryText={item.EMail}
                                            size={PersonaSize.size24}
                                            imageAlt="IMG"
                                        /> */}
                                        {/* <UserPersonaById
                                            context={context}
                                            AuthorId={item?.Id}
                                            provider={provider}
                                            isHoverShow={true}
                                        /> */}
                                        <UserPersonaByEmail
                                            email={item.EMail}
                                            title={item.Title}
                                            size={PersonaSize.size24}
                                            showHoverDetail={true}
                                        />
                                    </div>
                                ))}
                                {remainingItems.length > 0 && (
                                    <Link className="tooltipcls">
                                        <TooltipHost content={tooltipContent} className="cls-pointer" id={`tooltipId`}>
                                            <div className="remaining-count-cls">
                                                +{remainingItems.length} more
                                            </div>
                                        </TooltipHost>
                                    </Link >
                                )}
                            </div>
                        </>
                    );
                },
            },
            {
                key: "ADUser", name: 'Client', fieldName: 'ADUser', isResizable: true, minWidth: 200, maxWidth: 240, isSortingRequired: true,
                onRender: (itemID: any) => {
                    const maxDisplayCount = 3;
                    const displayedItems = itemID?.MasterUserUS?.slice(0, maxDisplayCount) || [];
                    const remainingItems = itemID?.MasterUserUS?.slice(maxDisplayCount) || [];
                    const totalItems = itemID?.MasterUserUS || [];
                    const tooltipContent = (
                        <div className="tooltip-persona-list">
                            {totalItems.map((item: { EMail: string; Title: string }) => (
                                <div key={item.EMail} className="attendees-badge-cls">
                                    <Persona
                                        imageUrl={`${window.location.origin}/_layouts/15/userPhoto.aspx?accountName=${item.EMail}&Size=S`}
                                        text={item.Title}
                                        secondaryText={item.EMail}
                                        size={PersonaSize.size24}
                                        imageAlt="IMG"
                                    />
                                </div>
                            ))}
                        </div>
                    );

                    return (
                        <>

                            <div className="cls-pointer">
                                {displayedItems.map((item: { EMail: string; Title: string, Id: number }, Index: any) => (

                                    <div key={item.Title} className="attendees-badge-cls-2">

                                        {/* <UserPersonaById
                                            context={context}
                                            AuthorId={item?.Id}
                                            provider={provider}
                                            isHoverShow={true}
                                        /> */}
                                        <UserPersonaByEmail
                                            email={item.EMail}
                                            title={item.Title}
                                            size={PersonaSize.size24}
                                            showHoverDetail={true}
                                        />
                                        {/* <Persona
                                            imageUrl={`${window.location.origin}/_layouts/15/userPhoto.aspx?accountName=${item.EMail}&Size=S`}
                                            text={item.Title}
                                            secondaryText={item.EMail}
                                            size={PersonaSize.size24}
                                            imageAlt="IMG"
                                        /> */}
                                    </div>

                                ))}
                                {remainingItems.length > 0 && (
                                    <Link className="tooltipcls">
                                        <TooltipHost content={tooltipContent} className="cls-pointer" id={`tooltipId`}>
                                            <div className="remaining-count-cls">
                                                +{remainingItems.length} more
                                            </div>
                                        </TooltipHost>
                                    </Link >
                                )}
                            </div>

                        </>
                    );
                },
            },
            {
                key: "ADUser", name: 'Category', fieldName: 'Category', isResizable: true, minWidth: 160, maxWidth: 180, isSortingRequired: true,
            },
            { key: "QCState", name: 'State', fieldName: 'QCState', isResizable: true, minWidth: 70, maxWidth: 140, isSortingRequired: true },
            {
                key: "key3", name: 'Equipment/Asset', fieldName: 'Assets', isResizable: true, minWidth: 130, maxWidth: 160,
                onRender: ((itemID: any) => {
                    if (itemID.Assets >= 0) {
                        return <div className="cursorPointer primaryColor" onClick={() => _onClickCount(itemID.ID, "AssetsPage")}>
                            <Link className="primaryColor">
                                <TooltipHost content={"View Detail"} id={tooltipId}>
                                    <div className={`${itemID.Assets > 0 ? 'countBadge' : ""}`}>{itemID.Assets}</div>
                                </TooltipHost>
                            </Link></div >;
                    } else {
                        if (ListEquipment.current == undefined) {
                            return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                        } else {
                            return 0;
                        }
                    }
                })
            },
            {
                key: "key4", name: 'Chemicals', fieldName: 'Chemical', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true,
                onRender: ((itemID: any) => {
                    if (itemID.Chemical >= 0) {
                        return <div className="cursorPointer primaryColor" onClick={() => _onClickCount(itemID.ID, "ChemicalsPage")}>
                            <Link className="primaryColor">
                                <TooltipHost content={"View Detail"} id={tooltipId}>
                                    <div className={`${itemID.Chemical > 0 ? 'countBadge' : ""}`}>{itemID.Chemical}</div>
                                </TooltipHost>
                            </Link></div >;
                    } else {
                        if (ListChemical.current == undefined) {
                            return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                        } else {
                            return <div className="cursorPointer">0</div>;
                        }
                    }
                })
            },
            {
                key: "key5", name: 'Assigned Teams', fieldName: 'Team', isResizable: true, minWidth: 110, maxWidth: 150,
                onRender: ((itemID: any) => {
                    if (itemID.Team >= 0) {
                        return <div className="cursorPointer primaryColor" onClick={() => _onClickCount(itemID.ID, "TeamsPage")}>
                            <Link className="primaryColor">
                                <TooltipHost content={"View Detail"} id={tooltipId}>
                                    <div className={`${itemID.Team > 0 ? 'countBadge' : ""}`}>{itemID.Team}</div>
                                </TooltipHost>
                            </Link></div >;
                    } else {
                        if (ListTeam.current == undefined) {
                            return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                        } else {
                            return 0;
                        }
                    }
                })
            },
            {
                key: "key5", name: 'Inspections', fieldName: 'Inspection', isResizable: true, minWidth: 110, maxWidth: 150,
                onRender: ((itemID: any) => {
                    if (itemID.Inspection >= 0) {
                        return <div className="cursorPointer primaryColor" onClick={() => _onClickCount(itemID.ID, "InspectionsPage")}>
                            <Link className="primaryColor">
                                <TooltipHost content={"View Detail"} id={tooltipId}>
                                    <div className={`${itemID.Inspection > 0 ? 'countBadge' : ""}`}>{itemID.Inspection}</div>
                                </TooltipHost>
                            </Link></div >;
                    } else {
                        if (ListInspection.current == undefined) {
                            return <FontAwesomeIcon className="quickImg spinerColor" icon={"spinner"} spin />;
                        } else {
                            return 0;
                        }
                    }
                })
            },
        ]);
    }

    React.useEffect(() => {
        if (viewSitesData.current != null && isCount === true) {
            loadSitesCountData(ListDocuments.current, ListTeam.current, ListChemical.current, ListEquipment.current, ListInspection.current);
            setIsCount(false);
        } else if (!viewSitesData.current) {
            setIsCount(false);
        }

    }, [isCount]);

    React.useEffect(() => {
        const permission = showPermissionDeniedPage(currentUserRoleDetail);

        if (!permission.length) {
            props.manageComponentView({ currentComponentName: ComponentNameEnum.AccessDenied });
        } else {
            (async () => {
                setColumns();
                const favData = await getFavouriteData();
                favouriteData.current = favData;
                isStateManager ? await _stateData() : await _loadSiteData();
                const [equipmentData, chemicalData, teamData, inspectionData] = await Promise.all([
                    _associatedEquipment(),
                    // _associatedDocuments(),
                    _associatedChemical(),
                    _associatedTeam(),
                    _InspectionData()
                ]);
                ListEquipment.current = equipmentData;
                ListTeam.current = teamData;
                ListChemical.current = chemicalData;
                ListInspection.current = inspectionData;
                setIsCount(true);
            })();
        }
    }, [isRefreshGrid]);

    React.useEffect(() => {
        void (async () => {
            if ((selectedState || selectedSiteManagers || selectedSiteTitles != undefined || selectedADUsers) && count.current > 0) {
                _loadSiteData();
            }
        })();
    }, [selectedState, selectedSiteManagers, selectedSiteTitles, selectedADUsers, isRefreshGrid]);

    React.useEffect(() => {
        try {
            if (isRender) {
                setIsLoading(true);
                setIsRender(false);

                // Build Favourite Set
                const favouriteSiteIds = new Set(
                    favouriteData.current
                        .filter(fav => fav.Favourite)
                        .map(fav => fav.SiteId)
                );

                // Add IsFavourite field into all sites
                const siteListWithFavourites = viewAllSitesData.current?.map(site => ({
                    ...site,
                    IsFavourite: favouriteSiteIds.has(site.Id)
                })) || [];

                // -------------------------------
                // APPLY FILTERS
                // -------------------------------

                let filteredList = [...siteListWithFavourites];

                // ⭐ FAVOURITE FILTER
                if (isToggleFavourite) {
                    filteredList = filteredList.filter(item => item.IsFavourite === true);
                }

                // 📦 ARCHIVE FILTER
                if (isToggleArchive) {
                    // Show only archived
                    filteredList = filteredList.filter(item => item.IsDeleted === true);
                } else {
                    // Show only NON archived
                    filteredList = filteredList.filter(item => item.IsDeleted === false);
                }

                // -------------------------------------

                viewSitesData.current = filteredList;

                if (isToggleFavourite) {
                    const filterFavData = siteListWithFavourites.filter(data => data.IsFavourite === true);
                    if (count.current == 0 && filterFavData.length == 0) {
                        viewSitesData.current = siteListWithFavourites;
                        setIsToggleFavorite(false);
                    } else {
                        viewSitesData.current = filterFavData;
                    }

                } else {
                    viewSitesData.current = siteListWithFavourites;
                }
                setIsCount(true);
                setIsLoading(false);
                count.current = count.current + 1;
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error);
        }
    }, [isRender]);


    // React.useEffect(() => {
    //     try {
    //         if (isRender) {
    //             setIsLoading(true);
    //             setIsRender(false);
    //             const favouriteSiteIds = new Set(favouriteData.current.filter(fav => fav.Favourite).map(fav => fav.SiteId));
    //             const siteListWithFavourites = viewAllSitesData.current?.map(site => ({
    //                 ...site,
    //                 IsFavourite: favouriteSiteIds.has(site.Id)
    //             }));

    //             if (isToggleFavourite) {
    //                 const filterFavData = siteListWithFavourites.filter(data => data.IsFavourite === true);
    //                 if (count.current == 0 && filterFavData.length == 0) {
    //                     viewSitesData.current = siteListWithFavourites;
    //                     setIsToggleFavorite(false);
    //                 } else {
    //                     viewSitesData.current = filterFavData;
    //                 }

    //             } else {
    //                 viewSitesData.current = siteListWithFavourites;
    //             }
    //             setIsCount(true);
    //             setIsLoading(false);
    //             count.current = count.current + 1;
    //         }
    //     }

    //     catch (error) {
    //         setIsLoading(false);
    //         console.log(error);

    //     }
    // }, [isRender]);

    const _onItemInvoked = (itemID: any): void => {
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({
            text: itemID.Title,
            key: itemID.Title,
            currentCompomnetName: ComponentNameEnum.AddNewSite,
            onClick: onBreadcrumbItemClicked,
            manageComponent: props.manageComponentView,
            manageCompomentItem: {
                currentComponentName: ComponentNameEnum.AddNewSite,
                siteMasterId: itemID.ID,
                dataObj: itemID,
                isShowDetailOnly: true,
                siteName: itemID.Title,
                qCState: itemID.QCState,
                breadCrumItems: breadCrumItems
            }
        });
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.AddNewSite, dataObj: itemID, siteMasterId: itemID.ID, isShowDetailOnly: true, siteName: itemID.Title, qCState: itemID.QCState, breadCrumItems: breadCrumItems,
            viewSelectedSiteTitlesFilter: filerRef?.current?.selectedSiteTitles,
            viewSelectedStateFilter: filerRef?.current?.selectedState,
            viewSelectedSiteManagersFilter: filerRef?.current?.selectedSiteManagers,
            viewSelectedADUsersFilter: filerRef?.current?.selectedADUsers,
            viewSelectedSCSitesFilter: filerRef?.current?.selectedSCSites,
            viewSelectedSiteIdsFilter: filerRef?.current?.selectedSiteIds
        });
    };

    const _userFavActivityLog = async (objData: any) => {
        setIsLoading(true);
        try {
            const entityName = objData.Favourite ? EntityNameEnum.FavoriteSite : EntityNameEnum.UnFavoriteSite;
            const actionDetail = objData.Favourite ? ActionDetailsEnum.FavoriteSite : ActionDetailsEnum.UnFavoriteSite;
            const actionType = objData.Favourite ? UserActivityActionTypeEnum.Favourite : UserActivityActionTypeEnum.Unfavourite;
            const todayDate = moment().format("YYYY-MM-DD");
            const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.UserActivityLog,
                filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityType eq '${UserActionEntityTypeEnum.Site}' and ActionType eq '${actionType}' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
            };
            const results = await provider.getItemsByQuery(queryStringOptions);
            if (results && results.length > 0) {
                const listData = results.map((data) => ({
                    ID: data.ID,
                    Count: data.Count ?? '',
                }));
                let updateObj = {
                    Count: listData[0]?.Count + 1,
                };
                await provider.updateItemWithPnP(updateObj, ListNames.UserActivityLog, Number(listData[0]?.ID));
            } else {
                const logObj = {
                    UserName: currentUserRoleDetail?.title,
                    ActionType: actionType,
                    Email: currentUserRoleDetail?.emailId,
                    EntityType: UserActionEntityTypeEnum.Site,
                    EntityName: entityName,
                    Count: 1,
                    Details: actionDetail
                };
                void UserActivityLog(provider, logObj, currentUserRoleDetail);
            }
        } catch (error) {
            console.error("Error fetching user activity log:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const _userActivityLog = async () => {
        setIsLoading(true);
        try {
            const todayDate = moment().format("YYYY-MM-DD");
            const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.UserActivityLog,
                filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityType eq '${UserActionEntityTypeEnum.Site}' and ActionType eq 'Visit' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
            };
            const results = await provider.getItemsByQuery(queryStringOptions);
            if (results && results.length > 0) {
                const listData = results.map((data) => ({
                    ID: data.ID,
                    Count: data.Count ?? '',
                }));
                let updateObj = {
                    Count: listData[0]?.Count + 1,
                };
                await provider.updateItemWithPnP(updateObj, ListNames.UserActivityLog, Number(listData[0]?.ID));
            } else {
                const logObj = {
                    UserName: currentUserRoleDetail?.title,
                    // SiteNameId: UpdateItem[index]?.SiteNameId,
                    ActionType: UserActivityActionTypeEnum.Visit,
                    Email: currentUserRoleDetail?.emailId,
                    EntityType: UserActionEntityTypeEnum.Site,
                    // EntityId: UpdateItem[index]?.ID,
                    EntityName: "View Site",
                    Count: 1,
                    Details: "View Site"
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
        if (window.innerWidth <= 768) {
            setCurrentView('card');
        } else {
            setCurrentView('grid');
        }
    }, []);

    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {isLoading && <Loader />}

            {isShowAssetHistoryModel && DialogData.length > 0 && PageName != "" &&
                < AssociateChemicalDialog manageComponentView={props.manageComponentView} DisplaySiteName={DisplaySite.current} context={context} provider={provider} DialogDate={DialogData} PageName={PageName} siteNameId={0} isModelOpen={isShowAssetHistoryModel} onClickClose={onClickClose} />}

            {isDocumnetViewSiteDialog &&
                <AuditReports
                    siteName={DisplaySite.current}
                    data={DialogData}
                    provider={provider}
                    manageComponentView={props.manageComponentView}
                    context={context}
                    isViewSiteDialog={isDocumnetViewSiteDialog}
                    isCloseVieSiteDialog={onClickClose} />
            }

            <CustomModal
                isModalOpenProps={archiveDialog}
                setModalpopUpFalse={() => setArchiveDialog(false)}
                subject={selectedArchiveItem?.IsDeleted ? "Unarchive Confirmation" : "Archive Confirmation"}
                message={
                    <div>
                        Are you sure you want to{" "}
                        {selectedArchiveItem?.IsDeleted ? "unarchive" : "archive"} this Site?
                    </div>
                }
                yesButtonText="Yes"
                closeButtonText="No"
                onClickOfYes={onClickArchiveConfirm}
            />

            {isPopupVisible && (
                <Layer>
                    <Popup
                        className={popupStyles.root}
                        role="dialog"
                        aria-modal="true"
                        onDismiss={hidePopup}
                    >
                        <Overlay onClick={hidePopup} />
                        <FocusTrapZone>
                            <div role="document" className={popupStyles.content}>
                                <IconButton
                                    iconProps={{ iconName: 'Cancel' }}
                                    ariaLabel="Close popup"
                                    className={popupStyles.closeButton}
                                    onClick={hidePopup}
                                />
                                <h2 className="mt-15">{DisplaySite.current}</h2>
                                <Inspectionlist siteName={CurrentSiteNameId.current}
                                    siteView={true} existingData={ListInspection.current} />
                            </div>
                        </FocusTrapZone>
                    </Popup>
                </Layer>
            )}

            <div className="boxCard">
                <div className="formGroup">
                    <div className="ms-Grid mb-3">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <h1 className="mainTitle">Sites</h1>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <div className="customebreadcrumb">
                                    <Breadcrumb
                                        items={props.breadCrumItems}
                                        maxDisplayedItems={3}
                                        ariaLabel="Breadcrumb with items rendered as buttons"
                                        overflowAriaLabel="More links"
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                <div className="formControl">

                                    <MultipleSiteFilter
                                        isPermissionFilterUpdate={true}
                                        isPermissionFiter={true}
                                        loginUserRoleDetails={currentUserRoleDetail}
                                        selectedSiteIds={selectedSiteIds}
                                        selectedSiteTitles={selectedSiteTitles}
                                        selectedSCSite={selectedSCSites}
                                        onSiteChange={handleSiteChange}
                                        provider={provider}
                                        isRequired={true}
                                        AllOption={true}
                                    />
                                </div>
                            </div>
                            {isAdmin == true && <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                <div className="formControl">
                                    <MultiSiteManagerFilter
                                        selectedSiteManager={selectedSiteManagers} // Pass the array here
                                        onSiteManagerChange={onSiteManagerChange}
                                        provider={provider}
                                        isRequired={true}
                                        AllOption={true}
                                    />
                                </div>
                            </div>}
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                <div className="formControl">
                                    <MultiUserFilter
                                        selectedADUser={selectedADUsers} // Pass the array of selected users
                                        onADUserChange={onADUserChange} // Pass the updated handler
                                        provider={provider}
                                        isRequired={true}
                                        AllOption={true}
                                        permission={currentUserRoleDetail}
                                    />
                                </div>
                            </div>
                            {(currentUserRoleDetail.isAdmin || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isSiteSupervisor || currentUserRoleDetail.isWHSChairperson) &&
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                    <div className="formControl">
                                        <MultiStateFilter
                                            loginUserRoleDetails={currentUserRoleDetail}
                                            selectedState={selectedState}
                                            onStateChange={onStateChange}
                                            provider={provider}
                                            isRequired={true}
                                            AllOption={true}
                                        />
                                    </div>
                                </div>}
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 mt-2">
                                <Toggle
                                    onText={Messages.ShowAllSites}
                                    offText={Messages.ShowFavourite}
                                    checked={isToggleFavourite}
                                    onChange={_onChange} />
                            </div>
                            {/* <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 mt-2">
                                <Toggle
                                    onText={Messages.ShowArchiveSites}
                                    offText={Messages.ShowUnarchive}
                                    checked={isToggleArchive}
                                    onChange={_onChangeArchive} />
                            </div> */}
                        </div>
                    </div>
                    {currentView === "grid" ? <>
                        <MemoizedDetailList
                            manageComponentView={props.manageComponentView}
                            columns={columnsUser}
                            items={viewSitesData.current || []}
                            reRenderComponent={true}
                            searchable={true}
                            isAddNew={true}
                            onItemInvoked={_onItemInvoked}
                            onSelectedItem={_onItemSelected}
                            addNewContent={(currentUserRoleDetail.isAdmin || currentUserRoleDetail.isStateManager) &&
                                <div className="dflex">
                                    <Link className="actionBtn iconSize btnRefresh refresh-icon-m-vs" style={{ paddingBottom: "0px" }} onClick={onclickRefreshGrid}
                                        text="">
                                        <TooltipHost
                                            content={"Refresh Grid"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon
                                                icon={"arrows-rotate"}
                                            />
                                        </TooltipHost>    </Link>

                                    <PrimaryButton text="Add" className="btn btn-primary"
                                        onClick={() => {
                                            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                            breadCrumItems.push({ text: 'Add Form', key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddNewChemical, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewSite, isAddNewSite: true, breadCrumItems: breadCrumItems } });
                                            props.manageComponentView({
                                                currentComponentName: ComponentNameEnum.AddNewSite, isAddNewSite: true, breadCrumItems: breadCrumItems,

                                                viewSelectedSiteTitlesFilter: filerRef?.current?.selectedSiteTitles,
                                                viewSelectedStateFilter: filerRef?.current?.selectedState,
                                                viewSelectedSiteManagersFilter: filerRef?.current?.selectedSiteManagers,
                                                viewSelectedADUsersFilter: filerRef?.current?.selectedADUsers,
                                                viewSelectedSCSitesFilter: filerRef?.current?.selectedSCSites,
                                                viewSelectedSiteIdsFilter: filerRef?.current?.selectedSiteIds
                                            });
                                        }} />
                                </div>
                            } />
                    </> :
                        <>

                            {(currentUserRoleDetail.isAdmin || currentUserRoleDetail.isStateManager) && <div className="dflex btn-back-ml">

                                <PrimaryButton text="Add" className="btn btn-primary"
                                    onClick={() => {
                                        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                        breadCrumItems.push({ text: 'Add Form', key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddNewChemical, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewSite, isAddNewSite: true, breadCrumItems: breadCrumItems } });
                                        props.manageComponentView({
                                            currentComponentName: ComponentNameEnum.AddNewSite, isAddNewSite: true, breadCrumItems: breadCrumItems,
                                            viewSelectedSiteTitlesFilter: filerRef?.current?.selectedSiteTitles,
                                            viewSelectedStateFilter: filerRef?.current?.selectedState,
                                            viewSelectedSiteManagersFilter: filerRef?.current?.selectedSiteManagers,
                                            viewSelectedADUsersFilter: filerRef?.current?.selectedADUsers,
                                            viewSelectedSCSitesFilter: filerRef?.current?.selectedSCSites,
                                            viewSelectedSiteIdsFilter: filerRef?.current?.selectedSiteIds
                                        });
                                    }} />

                                <Link className="actionBtn iconSize btnRefresh refresh-icon-m-vs" style={{ paddingBottom: "0px" }} onClick={onclickRefreshGrid}
                                    text="">
                                    <TooltipHost
                                        content={"Refresh Grid"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon
                                            icon={"arrows-rotate"}
                                        />
                                    </TooltipHost>    </Link>
                            </div>}
                            <SiteCardView
                                _onclickDetailsView={_onclickDetailsView}
                                items={viewSitesData.current}
                                manageComponentView={props.manageComponentView}
                                // Pass the additional props
                                ListDocuments={ListDocuments}
                                ListTeam={ListTeam}
                                ListChemical={ListChemical}
                                ListEquipment={ListEquipment}
                                _onClickCount={_onClickCount}
                                onFavouriteClick={(item) => {
                                    setFavouriteRecordItem(item);
                                    setShowFavConfirmation(true);
                                }}
                            />
                        </>
                    }
                </div>
            </div >
            <CustomModal isModalOpenProps={showFavConfirmation}
                setModalpopUpFalse={closeConfirmationDialog}
                // subject={Messages.FavouriteItem}
                subject={Messages.Confirmation}
                message={favouriteRecordItem?.IsFavourite === true ? Messages.RemoveFavourite : Messages.AddFavourite}
                yesButtonText="Yes"
                closeButtonText={"No"}
                onClickOfYes={onClickFavRecordYes} />
            <DialogComponent
                message={dialogState.dialogMessage}
                HideErrorDialog={HideErrorDialog}
                ToggleHideErrorDialog={ToggleHideErrorDialog}
                dialogHeader={dialogState.dialogHeader}
                isSuccess={dialogState.isSuccess}
                cancelOrSuccessClick={handleCancelOrSuccessClick}
            />
        </>
    }
};