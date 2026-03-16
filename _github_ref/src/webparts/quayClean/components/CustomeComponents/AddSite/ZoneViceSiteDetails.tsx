/* eslint-disable */
/* eslint-disable @microsoft/spfx/import-requires-chunk-name */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { DefaultButton, IContextualMenuProps, ITag, Link, mergeStyleSets, MessageBar, MessageBarType, Panel, PanelType, Pivot, PivotItem, PrimaryButton, TextField, TooltipHost } from "@fluentui/react";
import { DialogFooter, Dropdown, FocusTrapZone, IDropdownOption, Layer, Overlay, Popup } from "office-ui-fabric-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { IQuayCleanState } from "../../QuayClean";
import { ComponentNameEnum, getExternalUrl, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum, viewDetailStickHeaders, ZoneViceSiteDetailsPivot } from "../../../../../Common/Enum/ComponentNameEnum";
import { IErrorLog } from "../../../../../Interfaces/IErrorLog";
import { _copyAndSortNew, sortLevel2Dynamic, encryptValue, encryptWasteValue, getCAMLQueryFilterExpression, getPeopleDifferences, getSiteGroupsPermission, getSiteMasterItems, getStateMasterItems2, logGenerator, mapSingleValue, onBreadcrumbItemClicked, removeElementOfBreadCrum, UserActivityLog } from "../../../../../Common/Util";
import CustomModal from "../../CommonComponents/CustomModal";

import { IAddNewSiteState, IAddSiteMasterObj, IAssetLocationPermission, IDefaultSelcetdFromItems } from "../../../../../Interfaces/IAddNewSite";
import { EquipmentAsset } from "../Asset/EquipmentAsset";

// const AssociateChemical = React.lazy(() => require("../ChemicalManagement/AssociateChemical"));
import { AssociateChemical } from '../ChemicalManagement/AssociateChemical'

import { ManageSitesCrud } from "../ManageSites/Groups/ManageSitesCrud/ManageSitesCrud";
import { AssignedTeam } from "../AssignTeam/AssignedTeam";
import { AuditReports } from "../AuditReport/AuditReports";
import { DocumentsLib } from "../ChemicalManagement/DocumentsLib";
import { IMS } from "../IMS/IMS";
import { Events } from "../Events/Events";
import { HelpDeskList } from "../HelpDesk/HelpDeskList";
import { ManagePeriodicList } from "../Preodic/ManagePeriodicList";
import { ClientResponseIssueList } from "../QRClientResponse/ClientResponseIssueList";
import { ViewJobControlChecklist } from "../CheckList/ViewJobControlChecklist";
import { Reports } from "../Reports/Reports";
import { SynergySessions } from "../Synergy Sessions/SynergySessions";
import { PoliciesandProcedures } from "../Synergy Sessions/PoliciesandProcedures";
import { ResourceRecovery } from "../ResourceRecovery/ResourceRecovery";

import { toastService } from "../../../../../Common/ToastService";
import { Loader } from "../../CommonComponents/Loader";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { IcurrentloginDetails } from "../../CommonComponents/HeaderComponent";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import { useAtom, useAtomValue } from "jotai";
import { appGlobalStateAtom, appSiteStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import QRCode from 'qrcode';
import moment from "moment";
import CamlBuilder from "camljs";
import { DataType } from "../../../../../Common/Constants/CommonConstants";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import axios from "axios";
import { SitePageName, WasteReportPivot } from "../../../../../Common/Enum/WasteReportEnum";
import { Messages } from "../../../../../Common/Constants/Messages"
import { SiteSettingsToggles } from "./SiteSettingsToggles";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { ISelectedSites, ISelectedZoneDetails } from "../../../../../Interfaces/ISelectedZoneDetails";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
//import { ViewSiteImage } from "../../CommonComponents/ViewSiteImage";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";
import { LazyLoadImage } from "react-lazy-load-image-component";
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');
export interface IAddNewSiteProps {
    provider: IDataProvider;
    componentProps: IQuayCleanState,
    context: WebPartContext;
    isUpdateNewSite?: boolean;
    manageComponentView(componentProp: IQuayCleanState): any;
    siteMasterId?: number;
    isShowDetailOnly?: boolean;
    siteName?: string;
    qCState?: any;
    breadCrumItems: any[];
    pivotName?: string;
    subpivotName?: string;
    componentProp: IQuayCleanState;
    loginUserRoleDetails: ILoginUserRoleDetails;
    IsSupervisor?: boolean;
    PermissionArray?: any[];
    selectedZoneDetails?: ISelectedZoneDetails;
    viewBy?: string;
}

const dropdownOptions: IDropdownOption[] = [
    { key: 'selectAll', text: 'Select All' },
    { key: 'Equipment / Assets', text: 'Equipment / Assets' },
    { key: 'Chemical', text: 'Chemical' },
    { key: 'Assigned Team', text: 'Assigned Team' },
    { key: 'Document Library', text: 'Document Library' },
    { key: 'Help Desk', text: 'Help Desk' },
    { key: 'Periodic', text: 'Periodic' },
    { key: 'Client Response', text: 'Client Response' },
    { key: 'Quaysafe', text: 'Quaysafe' },
    { key: 'Job Control Checklist', text: `Monthly KPI's` },
];

export const ZoneViceSiteDetails = (props: IAddNewSiteProps) => {
    const { provider, manageComponentView, siteMasterId, siteName } = props;
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const [collapsed, setCollapsed] = React.useState(true);
    const [isShowOtherTab, setIsShowOtherTab] = React.useState<boolean>(false);
    const [search, setSearch] = React.useState("");
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [IsSupervisor, setIsSupervisor] = React.useState<boolean>(false);
    const [selectedKey, setselectedKey] = React.useState<any>(props.pivotName ? props.pivotName : "");
    const tooltipId = useId('tooltip');
    const [newFromObj, setNewFromObj] = React.useState<IAddSiteMasterObj>();
    const [displaysiteerror, setdisplaysiteerror] = React.useState<boolean>(false);
    const [isCategoryDisable, setIsCategoryDisable] = React.useState<boolean>(true);
    const [SLSucessMessageBar, setSLSucessMessageBar] = React.useState<boolean>(false);
    const [SLDeleteMessageBar, setSLDeleteMessageBar] = React.useState<boolean>(false);
    const [SLExistsMessageBar, setSLExistsMessageBar] = React.useState<boolean>(false);
    const [keyUpdateCategoryOptions, setKeyUpdateCategoryOptions] = React.useState<number>(Math.random());
    const [width, setWidth] = React.useState<string>("650px");
    const [JobCode, setJobCode] = React.useState<string>("");
    const [SiteData, setSiteData] = React.useState<any>();
    let CurrentRefSiteName = React.useRef<any>();
    let PivotData = React.useRef<any>([]);
    let HidePivot = React.useRef<boolean>(false);
    const isVisibleReport = React.useRef<boolean>(false);
    const [OldSM, setOldSM] = React.useState<any[]>([]);
    const [OldSS, setOldSS] = React.useState<any[]>([]);
    const [NewSM, setNewSM] = React.useState<any[]>([]);
    const [NewSS, setNewSS] = React.useState<any[] | null>(null);
    const [StateName, setStateName] = React.useState<any>("");
    let CurrentStateName = React.useRef<any>();
    //let uniqueJobCode = React.useRef<any>();
    let initialSelectedTags: any = [];
    const [isNewDocument, setisNewDocument] = React.useState<boolean>(false);
    const [isNewDocumentPaP, setisNewDocumentPaP] = React.useState<boolean>(false);
    const [isPrintSettingsPanelOpen, setIsPrintSettingsPanelOpen] = React.useState(false);
    const [selectedSites, setSelectedSites] = React.useState<number[]>([]);
    const [selectedZonesSites, setSelectedZonesSites] = React.useState<ISelectedZoneDetails | any>(props?.selectedZoneDetails || undefined);
    const [singleSelectSiteDetails, setSingleSelectSiteDetails] = React.useState<ISelectedSites>(undefined as any);
    const [multiSelectSiteDetails, setMultiSelectSiteDetails] = React.useState<ISelectedSites[]>([]);
    const permissionArray = React.useRef<any>(undefined);
    const [selectedZoneObj, setSelectedZoneObj] = useAtom(selectedZoneAtom);
    const [, setIsSiteLevelComponent] = useAtom(isSiteLevelComponentAtom);
    const [selectedTags, setSelectedTags] = React.useState<ITag[]>(initialSelectedTags);
    const [state, SetState] = React.useState<IAddNewSiteState>({
        siteMasterOptions: [],
        stateMasterOptions: [],
        isdisableField: true,
        siteMasterItems: [],
        HelpDeskTypeOptions: [],
        isaddNewSite: false,
        isUpdateNewSite: false,
        isformValidationModelOpen: false,
        validationMessage: null,
        isEditSiteImagePanelOpen: false,
        isEditSiteImageDeleted: false,
        isEditSiteHeaderPanelOpen: false,
        isEditSiteHeaderDeleted: false,
        isUpdateShowDetailOnly: true,
        isShowDetailOnly: props.isShowDetailOnly ? props.isShowDetailOnly : false,
        isVisibleCrud: false,
        personaManagerArray: [],
        personaSupervisorArray: [],
        isAssetLocationOpen: false,
        personaADUserArray: [],
        assetLocationOptions: [],
        assetLocationManagerSupervisorData: [],
        navLinksItems: [],
        isEditSite: false,
        currentloginDetails: {
            admin: "",
            siteManger: '',
            user: '',
            title: "",
            emailId: "",
            Id: 0,
            arrayofPremission: [],
            isSiteSupervisor: "",
            isStateManager: "",
            PermissionArray: ""

        },
        assetSucessMessageBar: false,
        isReload: false,
        DynamicSiteManagerOptions: []
    });
    const [defaultSelcetdFromItems, setDefaultSelcetdFromItems] = React.useState<IDefaultSelcetdFromItems>({
        siteName: "",
        qCState: 0,
        aDUser: "",
        helpDeskType: 0,
        helpDeskNeeded: false,
        siteManager: "",
        siteSupervisor: "",
        Id: 0,
        SiteImage: "",
        SiteHeader: "",
        ExistingSiteLink: "",
        JobCode: "",
        Category: "",
        sitenamestr: "",
        SiteCategoryId: undefined
        // selectedDynamicSiteManager: null
    });
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [IsHelpDesk, setIsHelpDesk] = React.useState<boolean>(true);
    const [IsPeriodic, setIsPeriodic] = React.useState<boolean>(true);
    const [IsClientResponse, setIsClientResponse] = React.useState<boolean>(true);
    const [IsJobControlChecklist, setIsJobControlChecklist] = React.useState<boolean>(true);
    const [IsManageEvents, setIsManageEvents] = React.useState<boolean>(true);
    const [IsResourceRecovery, setIsResourceRecovery] = React.useState<boolean>(false);
    const [eLearning, setELearning] = React.useState<boolean>(false);
    const [IsSSWasteReport, setIsSSWasteReport] = React.useState<boolean>(false);
    const [IsAmenitiesFeedbackForm, setIsAmenitiesFeedbackForm] = React.useState<boolean>(false);
    const [IsDailyCleaningDuties, setIsDailyCleaningDuties] = React.useState<boolean>(false);
    const [IsSubLocation, setIsSubLocation] = React.useState<boolean>(false);
    const [selectedOptions, setSelectedOptions] = React.useState<{ [key: string]: string[] }>({});
    const [permissionData, setPermissionData] = React.useState<any>();
    const [SubLocation, setSubLocation] = React.useState<any>([]);
    const [appSiteState, setAppSiteState] = useAtom(appSiteStateAtom);
    const [showSaveMessageBar, setSaveShowMessageBar] = React.useState<boolean>(false);
    const [showUpdateMessageBar, setUpdateShowMessageBar] = React.useState<boolean>(false);
    const [isPopupVisible2, { setTrue: showPopup2, setFalse: hidePopup2 }] = useBoolean(false);
    const [isPopupVisible3, { setTrue: showPopup3, setFalse: hidePopup3 }] = useBoolean(false);
    const [isPopupVisibleSL, { setTrue: showPopupSL, setFalse: hidePopupSL }] = useBoolean(false);
    const [SublocationExists, setSublocationExists] = React.useState<string>("");
    const [filteredSites, setFilteredSites] = React.useState<ISelectedSites[]>([])
    const [qrCodeSrc, setQrCodeSrc] = React.useState<string>('');
    const [subLocations, setSubLocations] = React.useState([{ Title: '', SiteNameId: props?.siteMasterId }]);
    const isButtonDisabled = subLocations.some(item => item.Title.trim() === '');
    const [jobApiFailed, setJobApiFailed] = React.useState<boolean>(false);
    const handleLocationChange = (index: number, value: string) => {
        const updated = [...subLocations];
        updated[index].Title = value;
        setSubLocations(updated);
    };

    const toggleSidebar = () => {
        setCollapsed(prev => !prev);
    };

    React.useEffect(() => {
        let filterSelectedSites: any[] = [];
        const defaultSelectedSitesId = props.selectedZoneDetails?.defaultSelectedSitesId || []
        if (!!props?.selectedZoneDetails && !!props?.selectedZoneDetails?.selectedSites && props?.selectedZoneDetails?.selectedSites.length > 0) {
            filterSelectedSites = props.selectedZoneDetails.selectedSites.filter((r: any) => defaultSelectedSitesId.includes(r.Id))
        }
        setMultiSelectSiteDetails(filterSelectedSites);
        if (defaultSelectedSitesId.length == 1) {
            setIsShowOtherTab(true);
            if (selectedKey == props?.pivotName) {
                setselectedKey(props?.pivotName);
            } else {
                setselectedKey(ZoneViceSiteDetailsPivot.SiteKey);
            }
            setSingleSelectSiteDetails(filterSelectedSites[0]);
        } else {
            setIsShowOtherTab(false);
            if (selectedKey == props?.pivotName) {
                setselectedKey(props?.pivotName);
            } else {
                setselectedKey(ZoneViceSiteDetailsPivot.EquipmentKey);
            }
            setSingleSelectSiteDetails(undefined as any);
        }
        const selectedZones: ISelectedZoneDetails = {
            selectedSitesId: defaultSelectedSitesId,
            selectedSites: filterSelectedSites,
            defaultSelectedSites: filterSelectedSites,
            defaultSelectedSitesId: defaultSelectedSitesId,
        }
        setSelectedZonesSites(selectedZones);
        setSelectedSites(defaultSelectedSitesId);
    }, [props.selectedZoneDetails])

    const onClickAddNewSite = () => {
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({ text: 'Add Form', key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddNewChemical, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewSite, isAddNewSite: true, breadCrumItems: breadCrumItems } });
        let obj = {
            ...props.selectedZoneDetails,
            defaultSelectedSites: selectedZonesSites,
            defaultSelectedSitesId: selectedSites

        }
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.AddNewSite,
            isAddNewSite: true,
            breadCrumItems: breadCrumItems,
            viewSelectedADUsersFilter: props?.componentProps?.viewSelectedADUsersFilter,
            viewSelectedSiteManagersFilter: props?.componentProps?.viewSelectedSiteManagersFilter,
            viewSelectedSiteTitlesFilter: props?.componentProps?.viewSelectedSiteTitlesFilter,
            viewSelectedStateFilter: props?.componentProps?.viewSelectedStateFilter,
            viewSelectedSCSitesFilter: props?.componentProps?.viewSelectedSCSitesFilter,
            viewSelectedSiteIdsFilter: props?.componentProps?.viewSelectedSiteIdsFilter,
            viewBy: props.viewBy,
            selectedZoneDetails: obj as any,
            isZoneAddNewSite: true
        });
    }

    const handleCheckboxChange = (id: number) => {
        setSelectedSites(prev => {
            const updatedSelectedSites = prev.includes(id)
                ? prev.filter(siteId => siteId !== id)
                : [...prev, id];

            let filterSelectedSites: any[] = [];
            if (props.selectedZoneDetails) {
                filterSelectedSites = props.selectedZoneDetails.selectedSites.filter((r: any) => updatedSelectedSites.includes(r.Id))
            }
            if (updatedSelectedSites?.length === 1 && filterSelectedSites?.length == 1) {
                setIsShowOtherTab(true);
                setselectedKey(ZoneViceSiteDetailsPivot.SiteKey);
                setSingleSelectSiteDetails(filterSelectedSites[0]);

            } else {
                setSingleSelectSiteDetails(undefined as any);
                setselectedKey(ZoneViceSiteDetailsPivot.EquipmentKey);
                setIsShowOtherTab(false);
            }
            setMultiSelectSiteDetails(filterSelectedSites);
            const selectedZones: ISelectedZoneDetails = {
                selectedSitesId: updatedSelectedSites,
                selectedSites: filterSelectedSites,
                defaultSelectedSites: updatedSelectedSites.length > 0 ? filterSelectedSites : [],
                defaultSelectedSitesId: updatedSelectedSites.length > 0 ? updatedSelectedSites : [],
            }
            setSelectedZonesSites(selectedZones)
            return updatedSelectedSites;
        });
    }
    const zoneObj: ISelectedZoneDetails = {
        selectedSites: props.selectedZoneDetails?.selectedSites || [],
        selectedSitesId: props.selectedZoneDetails?.selectedSitesId || [],
        siteCount: props.selectedZoneDetails?.siteCount || 0,
        zoneId: props.selectedZoneDetails?.zoneId || 0,
        zoneName: props.selectedZoneDetails?.zoneName || "",
        defaultSelectedSites: selectedZonesSites?.defaultSelectedSitesId?.length > 0 ? selectedZonesSites?.defaultSelectedSites : [],
        defaultSelectedSitesId: selectedZonesSites?.defaultSelectedSitesId?.length > 0 ? selectedZonesSites?.defaultSelectedSitesId : [],
        isSinglesiteSelected: selectedZonesSites?.defaultSelectedSitesId?.length == 1 ? true : false
    };

    React.useEffect(() => {
        setSelectedZoneObj(zoneObj);
        setIsSiteLevelComponent(true);
    }, [props.selectedZoneDetails, selectedZonesSites]);

    React.useEffect(() => {
        if (props.selectedZoneDetails) {
            let filteredSites = props.selectedZoneDetails.selectedSites
            if (search) {
                filteredSites = props.selectedZoneDetails.selectedSites.filter((site: any) =>
                    site.SiteName.toLowerCase().includes(search.toLowerCase())
                );
            }

            filteredSites = filteredSites.map((r: any) => {
                return {
                    ...r,
                    isSelected: selectedSites.includes(r.Id) || false
                }
            })
            filteredSites = sortLevel2Dynamic(filteredSites, "isSelected", true, "SiteName", false)
            setFilteredSites(filteredSites);
        }

    }, [props.selectedZoneDetails?.selectedSites, search, selectedSites])



    const handleSaveSL = async () => {
        /**
         * Check Location alredy exists or not.
         * updated by Trupti on 22-09-2025
        */
        const currentTitle = subLocations[0]?.Title?.trim().toLowerCase();
        const filtered = (state?.assetLocationOptions || []).filter(
            (loc: any) => loc?.key.trim().toLowerCase() === currentTitle
        );

        if (filtered.length > 0) {
            setSLExistsMessageBar(true);
            setSublocationExists(Messages.LocationalredyExists);
            setTimeout(() => {
                setSLExistsMessageBar(false);
            }, 2000);
            return;

        }
        setSublocationExists("");

        let toastMessage: string = "";
        let toastId: any;
        /**
         * Update toaster message outside Location model.
         * Updated by Trupti on 22-09-2025
        */
        await props.provider.createItemInBatch(subLocations, ListNames.AssetLocationChoices);
        setSubLocations([{ Title: '', SiteNameId: singleSelectSiteDetails?.Id }]);
        /**
         * Solve the issue Manage Location Access dropdown blank issue
         * Updated by Trupti on 19/9/25
         */
        getChoicesList();
        _manageSubLocation();
        setTimeout(() => {
            setSLSucessMessageBar(false);
        }, 2000);
    }

    const onClickDeleteSubLocation = async (item: any) => {
        setSLDeleteMessageBar(true);
        await provider.updateItemWithPnP({ IsActive: false }, ListNames.AssetLocationChoices, Number(item.ID));
        _manageSubLocation();
        /**
        * Solve the issue Manage Location Access dropdown blank issue
        * Updated by Trupti on 19/9/25
        */
        getChoicesList();
        setTimeout(() => {
            setSLDeleteMessageBar(false);
        }, 4000);
    }


    const onClickNo = () => {
        setSublocationExists("");
        setSubLocations([{ Title: '', SiteNameId: singleSelectSiteDetails?.Id }]);
        hidePopup2();
        hidePopup3();
        hidePopupSL();
    }

    const onclickViewQR = async () => {
        showPopup2();
    };

    const SynergySessionsData = () => {
        try {
            const select = ["ID,Created"];
            const threeDaysAgo = new Date();

            const siteId = singleSelectSiteDetails?.Id;
            const stateId = singleSelectSiteDetails?.QCStateId;
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `((SiteNameId eq ${siteId}) or (StateNameId eq ${stateId}) or (ViewType eq 'Both')) and (Created ge datetime'${threeDaysAgo.toISOString()}')`,
                // filter: `Created ge datetime'${threeDaysAgo.toISOString()}'`,
                listName: ListNames.SynergySessions,
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    if (results && results.length > 0) {
                        setisNewDocument(true);
                    } else {
                        setisNewDocument(false);
                    }
                }
            }).catch((error: any) => {
                console.log(error);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    };

    const PoliciesandProceduresData = () => {
        try {
            const select = ["ID,Created"];
            const threeDaysAgo = new Date();

            const siteId = singleSelectSiteDetails?.Id;
            const stateId = singleSelectSiteDetails?.QCStateId;
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `((SiteNameId eq ${siteId}) or (StateNameId eq ${stateId}) or (ViewType eq 'Both')) and (Created ge datetime'${threeDaysAgo.toISOString()}')`,
                // filter: `Created ge datetime'${threeDaysAgo.toISOString()}'`,
                listName: ListNames.PoliciesandProcedures,
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    if (results && results.length > 0) {
                        setisNewDocumentPaP(true);
                    } else {
                        setisNewDocumentPaP(false);
                    }
                }
            }).catch((error: any) => {
                console.log(error);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (qrCodeSrc) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>QR Code</title>
                            <style>
                                body { text-align: center; margin-top: 50px; }
                                img { border: 1px solid #ccc; border-radius: 8px; }
                            </style>
                        </head>
                        <body>
                            <img src="${qrCodeSrc}" alt="QR Code" />
                            <script>
                                window.onload = function() {
                                    window.print();
                                    window.close();
                                };
                            </script>
                        </body>
                    </html>
                `);
                printWindow.document.close();
            }
        }
    };
    // const fetchMicrokeeperLink = (): Promise<any[]> => {
    //     const select = ["ID,Title,IsActive,URL"];
    //     const queryStringOptions: IPnPQueryOptions = {
    //         select: select,
    //         filter: `IsActive eq 1`,
    //         listName: ListNames.MicrokeeperLink,
    //     };
    //     return props.provider.getItemsByQuery(queryStringOptions);
    // };

    // const fetchJobsData = async (): Promise<any[]> => {
    //     try {
    //         const links = await fetchMicrokeeperLink();
    //         if (!links || links.length === 0) {
    //             setJobApiFailed(true);
    //             return [];
    //         }
    //         const url = links[0]?.URL?.Url;
    //         const batchSize = 15000;
    //         const initParams = {
    //             page: 1,
    //             rowNumber: 1,
    //             sortRowName: "Title",
    //             sortRowDirection: "asc",
    //             jobSearch: "",
    //         };

    //         const initResp = await axios.post(`${url}/api/Microkeeper/GetJobsData`, initParams);
    //         const totalRecords = initResp?.data?.value?.noOfRecords || 0;
    //         const totalPages = Math.ceil(totalRecords / batchSize);

    //         const requests: Promise<any>[] = [];
    //         for (let page = 1; page <= totalPages; page++) {
    //             const params = {
    //                 page,
    //                 rowNumber: batchSize,
    //                 sortRowName: "Title",
    //                 sortRowDirection: "asc",
    //                 jobSearch: "",
    //             };
    //             requests.push(axios.post(`${url}/api/Microkeeper/GetJobsData`, params));
    //         }

    //         const responses = await Promise.all(requests);
    //         setJobApiFailed(false);
    //         return responses.flatMap(res => res?.data?.value?.jobs || []);
    //     } catch (error) {
    //         setJobApiFailed(true);
    //         const errorObj = {
    //             ErrorMethodName: "fetchJobsData",
    //             CustomErrormessage: "Error fetching jobs from Microkeeper API",
    //             ErrorMessage: error.toString(),
    //             ErrorStackTrace: "",
    //             PageName: "QuayClean.aspx"
    //         };
    //         void logGenerator(props.provider, errorObj);
    //         return [];
    //     }
    // };



    const getUniqueTitlePrefixes = (data: any[]): string[] => {
        const resultSet = new Set<string>();
        data.forEach(item => {
            let title = item.title;
            // Remove everything after "-"
            if (title.includes('-')) {
                title = title.split('-')[0];
            }
            // Remove numeric part after space (if any)
            const spaceSplit = title.split(' ');
            const firstPart = spaceSplit[0];
            resultSet.add(firstPart);
        });

        return Array.from(resultSet);
    };


    //const tagItems: ITag[] = uniqueJobCode.current?.map((item: any) => ({ key: item, name: item }));






    React.useEffect(() => {
        if (singleSelectSiteDetails?.Id) {
            SynergySessionsData();
            PoliciesandProceduresData();
            setIsLoading(false);
            return;
        }
        // try {
        //     void (async () => {
        //         setIsLoading(true);

        //         const fetched = await fetchJobsData();
        //         const uniqueTitles = getUniqueTitlePrefixes(fetched);
        //         uniqueJobCode.current = uniqueTitles;
        //         setIsLoading(false);
        //     })();
        // } catch (error) {
        //     setIsLoading(false);
        //     console.log(error);
        // }
        setIsLoading(false);
    }, [singleSelectSiteDetails]);



    React.useEffect(() => {
        if (!JobCode || typeof JobCode !== 'string') {
            setSelectedTags([]); // Handle null or undefined
            return;
        }

        const initialSelected: ITag[] = JobCode
            .split(',')
            .map(code => code.trim())
            .filter(code => code.length > 0)
            .map(code => ({ key: code, name: code }));

        setSelectedTags(initialSelected);
    }, [JobCode]);

    React.useEffect(() => {
        if (
            props.loginUserRoleDetails.isAdmin ||
            props.loginUserRoleDetails.isStateManager ||
            props.loginUserRoleDetails.isSiteManager ||
            props.loginUserRoleDetails.isSiteSupervisor) {
            isVisibleReport.current = true;
        } else {
            isVisibleReport.current = false;
        }
    }, []);


    React.useEffect(() => {
        if (singleSelectSiteDetails?.Id &&
            !props.loginUserRoleDetails.isAdmin &&
            !props.loginUserRoleDetails.isStateManager &&
            props.loginUserRoleDetails?.siteManagerItem.filter(r => r.Id == singleSelectSiteDetails?.Id && r.SiteManagerId?.indexOf(props.loginUserRoleDetails.Id) > -1).length === 0 &&
            props.loginUserRoleDetails.isSiteSupervisor) {
            setIsLoading(true);
            try {
                const select = ["ID,SupervisorId,Permission,SiteNameId"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    listName: ListNames.SiteSupervisorPermission,
                    filter: `SiteNameId eq '${singleSelectSiteDetails?.Id}' and SupervisorId eq '${props?.componentProp?.loginUserRoleDetails?.Id}'`
                };
                props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                    if (!!results) {
                        const PermissionDataArray = results.map((data) => {
                            return (
                                {
                                    ID: data.ID,
                                    SupervisorId: !!data.SupervisorId ? data.SupervisorId : '',
                                    Permission: !!data.Permission ? data.Permission : '',
                                }
                            );
                        });
                        setAppSiteState({
                            PermissionArray: !!PermissionDataArray ? PermissionDataArray[0]?.Permission : undefined,
                        });
                        permissionArray.current = !!PermissionDataArray ? PermissionDataArray[0]?.Permission : []
                    }
                }).catch((error: any) => {
                    console.log(error);
                    setIsLoading(false);
                });
            } catch (ex) {
                console.log(ex);
                setIsLoading(false);
            }
        } else {
            setAppSiteState({
                PermissionArray: undefined,
            });
        }
    }, [showUpdateMessageBar, showSaveMessageBar]);




    const onClickCancel = () => {
        hidePopup();
    }

    const _userActivityLog = async () => {
        setIsLoading(true);
        try {
            let orgSiteId = singleSelectSiteDetails?.Id;
            const todayDate = moment().format("YYYY-MM-DD");
            const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.UserActivityLog,
                filter: `Email eq '${currentUserRoleDetail?.emailId}' and SiteNameId eq '${orgSiteId}' and EntityType eq '${UserActionEntityTypeEnum.ViewSiteDetail}' and ActionType eq 'Visit' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
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
                    SiteNameId: orgSiteId,
                    ActionType: UserActivityActionTypeEnum.Visit,
                    Email: currentUserRoleDetail?.emailId,
                    EntityType: UserActionEntityTypeEnum.ViewSiteDetail,
                    EntityId: orgSiteId,
                    EntityName: "View Site",
                    Count: 1,
                    StateId: newFromObj?.QCStateId || singleSelectSiteDetails?.QCStateId,
                    Details: "View Site"
                };
                void UserActivityLog(provider, logObj, currentUserRoleDetail);
            }
        } catch (error) {
            setIsLoading(false);
            console.error("Error fetching user activity log:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const _manageSubLocation = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,SiteNameId,IsActive"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.AssetLocationChoices,
                filter: `SiteNameId eq '${singleSelectSiteDetails?.Id}' and IsActive eq 1`
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const PermissionData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                            }
                        );
                    });
                    setSubLocation(PermissionData);
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

    const onClickAddAccess = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,SupervisorId,Supervisor/Title,Supervisor/EMail,Permission,SiteNameId"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["Supervisor"],
                listName: ListNames.SiteSupervisorPermission,
                filter: `SiteNameId eq '${singleSelectSiteDetails?.Id}'`
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const PermissionData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                SupervisorId: !!data.SupervisorId ? data.SupervisorId : '',
                                Permission: !!data.Permission ? data.Permission : '',
                                Supervisor: !!data.Supervisor ? data.Supervisor.Title : '',
                                SupervisorEmail: !!data.Supervisor ? data.Supervisor.EMail : ''
                            }
                        );
                    });
                    setPermissionData(PermissionData);
                    showPopup();
                    setIsLoading(false);
                    // alert(1);
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

    const getManageLocation = async () => {

        try {
            let permissionData: IAssetLocationPermission[] = []
            const camlQuery = new CamlBuilder()
                .View(["ID", "Title", "ManagerSupervisor", "IsManager", "SiteName", "Location"])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query()
            // .ToString()
            let filterFields: ICamlQueryFilter[] = [];
            if (singleSelectSiteDetails?.Id) {


                filterFields.push({
                    fieldName: "SiteName",
                    fieldValue: singleSelectSiteDetails?.Id,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.EqualTo
                });
            }
            if (filterFields.length > 0) {
                const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
                camlQuery.Where().All(categoriesExpressions);
            }
            let data = await provider.getItemsByCAMLQuery(ListNames.SiteAssetLocationPermission, camlQuery.ToString())
            if (data && data.length > 0) {
                permissionData = data.map((i) => {
                    return {
                        ID: mapSingleValue(i.ID, DataType.number),
                        Title: mapSingleValue(i.Title, DataType.string),
                        ManagerSupervisorId: mapSingleValue(i.ManagerSupervisor, DataType.peopleId),
                        Location: mapSingleValue(i.Location, DataType.ChoiceMultiple),
                        ManagerSupervisor: mapSingleValue(i.ManagerSupervisor, DataType.peoplePicker),
                        IsManager: i.IsManager == "Yes" ? true : false
                    }

                })

            }
            return permissionData;
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    }

    React.useEffect(() => {
        if (SiteData && permissionData && permissionData.length > 0) {
            const defaultSelectedOptions: { [key: string]: string[] } = {};

            !!SiteData?.SiteSupervisor?.forEach((supervisor: any) => {
                permissionData?.forEach((permission: any) => {
                    if (
                        permission.SupervisorId === supervisor.Id ||
                        permission.SupervisorEmail.toLowerCase() === supervisor.EMail.toLowerCase()
                    ) {
                        defaultSelectedOptions[supervisor.EMail] = permission.Permission;
                    }
                });
            });

            setSelectedOptions(defaultSelectedOptions);
        }
    }, [SiteData, permissionData]);

    const handleDropdownChange = (
        supervisorEmail: string,
        event: React.FormEvent<HTMLDivElement>,
        option?: IDropdownOption
    ) => {
        if (!option) return;

        setSelectedOptions((prev) => {
            const currentSelection = prev[supervisorEmail] || [];
            const allKeys = dropdownOptions
                .filter((opt) => opt.key !== 'selectAll') // Exclude "selectAll" from other keys.
                .map((opt) => opt.key as string);

            if (option.key === 'selectAll') {
                const isSelectedAll = currentSelection.length === allKeys.length;
                return {
                    ...prev,
                    [supervisorEmail]: isSelectedAll ? [] : allKeys, // Select all options excluding "selectAll".
                };
            } else {
                const newSelection = option.selected
                    ? [...currentSelection, option.key as string]
                    : currentSelection.filter((key) => key !== option.key);

                const isAllSelected = newSelection.length === allKeys.length;

                return {
                    ...prev,
                    [supervisorEmail]: isAllSelected
                        ? allKeys // Automatically include all items but not "selectAll".
                        : newSelection,
                };
            }
        });
    };

    const handleSave = async (supervisor: { Title: string; EMail: any; Id: number }) => {
        setIsLoading(true);
        const PermissionDataObj = {
            SupervisorId: Number(supervisor.Id),
            Permission: selectedOptions[supervisor.EMail] || [],
            SiteNameId: Number(singleSelectSiteDetails?.Id)
        };

        const matchingRecord = permissionData.find(
            (record: any) => record.SupervisorId === PermissionDataObj.SupervisorId
        );

        if (matchingRecord) {
            setUpdateShowMessageBar(true);
            await props.provider.updateItemWithPnP(PermissionDataObj, ListNames.SiteSupervisorPermission, matchingRecord.ID);
            await onClickAddAccess();
            setIsLoading(false);
            setTimeout(() => {
                setUpdateShowMessageBar(false);
            }, 4000);
        } else {
            setSaveShowMessageBar(true);
            await props.provider.createItem(PermissionDataObj, ListNames.SiteSupervisorPermission).then(async (item: any) => {
                await onClickAddAccess();
                setIsLoading(false);
                setTimeout(() => {
                    setSaveShowMessageBar(false);
                }, 4000);
            });
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
            maxWidth: '850px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 80px)',

            '@media (max-width: 1200px)': { // Medium screens
                maxHeight: 'calc(100vh - 40px)',
            },

            '@media (max-width: 768px)': { // Small screens
                maxHeight: 'calc(100vh - 10px)',
            }
        }
    });

    const popupStyles2 = mergeStyleSets({
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
            maxWidth: '850px',
            width: '500px',
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 80px)',

            '@media (max-width: 1200px)': { // Medium screens
                maxHeight: 'calc(100vh - 40px)',
            },

            '@media (max-width: 768px)': { // Small screens
                maxHeight: 'calc(100vh - 10px)',
            }
        }
    });

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("650px");
        }
    }, [window.innerWidth]);





    const getStateNameFromId = (stateId: number): string => {
        const stateOptions = state.stateMasterOptions;
        const stateOpt = stateOptions.find(x => x.value === stateId);
        return stateOpt?.label || '';
    }

    const onClickSave = async () => {
        const toastMessage = 'New site created successfully!';
        try {
            setIsLoading(true);
            const validationFields = {
                required: ['Title', 'SiteManagerId', 'QCStateId']
            };

            const fieldLabelMap: Record<string, string> = {
                Title: 'Site Name',
                SiteManagerId: 'Site Manager',
                QCStateId: 'State',
                // SiteImage: 'Site Image',
                // SiteHeader: 'Site Header',
                UsersId: 'User',
                BreakDownBy: 'Break Down By'
            };

            if (IsSSWasteReport) {
                validationFields.required.push('UsersId', 'BreakDownBy');
            }

            let error: any;
            let isValid = true;
            const validationErrors: string[] = [];

            if (!!newFromObj) {
                let allFieldsEmpty = true;

                validationFields.required.forEach((field) => {
                    const value = (newFromObj as any)[field];
                    const isEmpty =
                        value === undefined ||
                        value === null ||
                        (typeof value === 'string' && value.trim() === '') ||
                        (Array.isArray(value) && value.length === 0);


                    if (isEmpty) {
                        // Mark that at least one field is empty
                        const fieldLabel = fieldLabelMap[field] || field;
                        validationErrors.push(`<li class="errorPoint">${fieldLabel} is required</li>`);
                    } else {
                        allFieldsEmpty = false;
                    }

                    // Additional site name error check
                });
                if (displaysiteerror === true) {
                    validationErrors.push(`<li class="errorPoint">This site name already exists. Please choose a different name.</li>`);
                }

                if (allFieldsEmpty) {
                    isValid = false;
                    validationErrors.length = 0; // Clear specific errors
                    validationErrors.push('<li class="errorPoint">Please fill the form</li>');
                } else if (validationErrors.length > 0) {
                    isValid = false;
                }
            } else {
                isValid = false;
                validationErrors.push('<li class="errorPoint">Please fill the form</li>');
            }


            // Show validation errors if any
            if (!isValid) {
                error = <ul dangerouslySetInnerHTML={{ __html: validationErrors.join('') }} />;
                SetState((prevState: any) => ({
                    ...prevState,
                    isformValidationModelOpen: true,
                    validationMessage: error
                }));
                setIsLoading(false);
                return;
            }

            const stateName = getStateNameFromId(newFromObj?.QCStateId);

            const dataToSave: IAddSiteMasterObj = {
                ...newFromObj,
                UsersId: IsSSWasteReport ? newFromObj?.UsersId : [],
                BreakDownBy: IsSSWasteReport ? newFromObj?.BreakDownBy : '',
                StateNameValue: stateName
            };

            const response = await props.provider.createItem(dataToSave, ListNames.SitesMaster);
            const objData = {
                SiteNameId: response.data.Id,
                SiteArea: newFromObj?.Title?.trim(),
                IsDefaultSiteArea: true
            }
            await props.provider.createItem(objData, ListNames.SiteAreas);
            const CreateFolder = {
                SiteNameId: response.data.Id,
                CreateCode: newFromObj?.Title + response.data.Id,
            };
            const CreateFolderMetaData = {
                SiteNameId: response.data.Id,
            };

            try {
                await props.provider.uploadFileWithData(CreateFolder.CreateCode, true, CreateFolderMetaData);
                console.log("Create folder");
            } catch (uploadError) {
                console.log(uploadError);
            }

            const logObj = {
                UserName: props?.loginUserRoleDetails?.title,
                SiteNameId: Number(response.data.Id),
                ActionType: UserActivityActionTypeEnum.Create,
                EntityType: UserActionEntityTypeEnum.ViewSiteDetail,
                EntityId: Number(response.data.Id),
                EntityName: response.data.Title,
                StateId: newFromObj?.QCStateId || singleSelectSiteDetails?.QCStateId,
                Details: `Add New Site ${response.data.Title}`
            };
            void UserActivityLog(props.provider, logObj, currentUserRoleDetail);

            const toastId = toastService.loading('Loading...');
            toastService.updateLoadingWithSuccess(toastId, toastMessage);

            manageComponentView({
                currentComponentName: ComponentNameEnum.ViewSite,
                viewSelectedADUsersFilter: props?.componentProps?.viewSelectedADUsersFilter,
                viewSelectedSiteManagersFilter: props?.componentProps?.viewSelectedSiteManagersFilter,
                viewSelectedSiteTitlesFilter: props?.componentProps?.viewSelectedSiteTitlesFilter,
                viewSelectedStateFilter: props?.componentProps?.viewSelectedStateFilter,
                viewSelectedSCSitesFilter: props?.componentProps?.viewSelectedSCSitesFilter,
                viewSelectedSiteIdsFilter: props?.componentProps?.viewSelectedSiteIdsFilter,
            });

            setIsLoading(false);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            const errorObj: IErrorLog = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error in onClickSave",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "Add New Project onClickSave method"
            };
            void logGenerator(props.provider, errorObj);
        }
    };

    const _onLinkClick = (item: PivotItem): void => {
        setselectedKey(item.props.itemKey);
    };


    const cleanSiteImageAndHeader = (newFromObj: any): any => {
        if (newFromObj.SiteImage && !newFromObj.SiteImageThumbnailUrl) {
            delete newFromObj.SiteImage;
        }

        if (newFromObj.SiteHeader && !newFromObj.SiteHeaderThumbnailUrl) {
            delete newFromObj.SiteHeader;
        }

        return newFromObj;
    };

    const onClickUpdate = async (): Promise<void> => {
        setIsLoading(true);
        localStorage.clear();
        const queryStringOptions: IPnPQueryOptions = {
            select: ["ID,SupervisorId,SiteNameId"],
            listName: ListNames.SiteSupervisorPermission,
            filter: `SiteNameId eq '${singleSelectSiteDetails?.Id}'`
        };
        props.provider.getItemsByQuery(queryStringOptions).then(async (results: any[]) => {
            if (!!results) {
                const PermissionDataArray = results.map((data) => {
                    return (
                        {
                            ID: data.ID,
                            SupervisorId: !!data.SupervisorId ? data.SupervisorId : '',
                        }
                    );
                });
                if (!!PermissionDataArray && PermissionDataArray.length > 0) {
                    const unmatchedIDs = PermissionDataArray
                        .filter(item => !!newFromObj?.SiteSupervisorId && !newFromObj?.SiteSupervisorId?.includes(item.SupervisorId))
                        .map(item => item.ID);
                    if (unmatchedIDs.length > 0) {
                        if (Array.isArray(unmatchedIDs)) {
                            for (let index = 0; index < unmatchedIDs.length; index++) {
                                await provider.deleteItem(ListNames.SiteSupervisorPermission, unmatchedIDs[index]);
                            }
                        }
                    }
                }
            }
        }).catch((error: any) => {
            console.log(error);
            setIsLoading(false);
        });

        const toastMessage = 'Site detail updated successfully!';
        try {
            const validationFields = {
                required: ['Title', 'SiteManagerId', 'QCStateId']
            };

            const fieldLabelMap: Record<string, string> = {
                Title: 'Site Name',
                SiteManagerId: 'Site Manager',
                QCStateId: 'State',
                UsersId: 'User',
                BreakDownBy: 'Break Down By'
            };
            if (IsSSWasteReport) {
                validationFields.required.push('UsersId', 'BreakDownBy');
            }
            let error: any;
            let isValid = true;
            const validationErrors: string[] = [];

            if (!!newFromObj) {
                validationFields.required.forEach((field) => {
                    // Only validate if field exists in the object
                    if (newFromObj.hasOwnProperty(field)) {
                        const value = (newFromObj as any)[field];
                        const isEmptyString = typeof value === 'string' && value.trim() === '';
                        const isEmptyArray = Array.isArray(value) && value.length === 0;

                        if (
                            value === undefined ||
                            value === null ||
                            isEmptyString ||
                            isEmptyArray
                        ) {
                            isValid = false;
                            const fieldLabel = fieldLabelMap[field] || field;
                            validationErrors.push(`<li class="errorPoint">${fieldLabel} is required</li>`);
                        }
                    }
                });

            } else {
                isValid = false;
                validationErrors.push('<li class="errorPoint">Please fill the form</li>');
            }
            if (displaysiteerror === true) {
                isValid = false;
                validationErrors.push(`<li class="errorPoint">This site name already exists. Please choose a different name.</li>`);
            }
            // Show validation errors if any
            if (!isValid) {
                error = <ul dangerouslySetInnerHTML={{ __html: validationErrors.join('') }} />;
                SetState((prevState: any) => ({
                    ...prevState,
                    isformValidationModelOpen: true,
                    validationMessage: error
                }));
                setIsLoading(false);
                return;
            }

            if (isValid) {
                const toastId = toastService.loading('Loading...');
                let lblHelpDesk;
                let lblPeriodic;
                let lblClientResponse;
                let lblJobControlChecklist;
                let lblManageEvents;

                let updateFromObj = cleanSiteImageAndHeader(newFromObj);
                const stateName = getStateNameFromId(newFromObj?.QCStateId);
                // await props.provider.updateItemWithPnP(updateFromObj, ListNames.SitesMaster, defaultSelcetdFromItems.Id).then((response: any) => {
                const dataToUpdate: IAddSiteMasterObj = {
                    ...updateFromObj,
                    UsersId: IsSSWasteReport ? updateFromObj?.UsersId : [],
                    BreakDownBy: IsSSWasteReport ? updateFromObj?.BreakDownBy : '',
                    StateNameValue: stateName
                };
                let SiteName = dataToUpdate?.Title || "";

                const result = getPeopleDifferences(OldSM, NewSM, OldSS, NewSS, SiteName, StateName || CurrentStateName.current);
                if (result.length > 0) {
                    await props.provider.createItemInBatch(result, ListNames.SendNotificationTempList);
                }
                await props.provider.updateItemWithPnP(dataToUpdate, ListNames.SitesMaster, defaultSelcetdFromItems.Id).then(async (response: any) => {
                    if (state.isEditSite) {
                        const oldFilterUrl = `${props.context.pageContext.web.serverRelativeUrl}/${"SiteDocuments"}/${singleSelectSiteDetails?.SiteName}`;
                        const oldFilterUrlResourceRecovery = `${props.context.pageContext.web.serverRelativeUrl}/${ListNames.ResourceRecovery}/${singleSelectSiteDetails?.SiteName}`;
                        // const oldFilterUrl = `${props.context.pageContext.web.serverRelativeUrl}/${"SiteDocuments"}/Test-shubham`;
                        const newFolderName = updateFromObj?.Title || "";
                        if (!!newFolderName) {
                            try {
                                await props.provider.renameFolder(oldFilterUrl, newFolderName);
                                await props.provider.renameFolder(oldFilterUrlResourceRecovery, newFolderName)
                            } catch (error) {
                                console.log(error);
                            }
                        }
                        // const

                    }
                    setNewSM([]);
                    setNewSS([]);
                    setOldSM([]);

                    setOldSS([]);
                    setStateName("");
                    if (response?.HelpDesk !== undefined) {
                        lblHelpDesk = response.HelpDesk;
                    } else {
                        lblHelpDesk = state.viewSiteItem?.HelpDesk;
                    }
                    if (response?.Periodic !== undefined) {
                        lblPeriodic = response.Periodic;
                    } else {
                        lblPeriodic = state.viewSiteItem?.Periodic;
                    }
                    if (response?.ClientResponse !== undefined) {
                        lblClientResponse = response.ClientResponse;
                    } else {
                        lblClientResponse = state.viewSiteItem?.ClientResponse;
                    }
                    if (response?.JobControlChecklist !== undefined) {
                        lblJobControlChecklist = response.JobControlChecklist;
                    } else {
                        lblJobControlChecklist = state.viewSiteItem?.JobControlChecklist;
                    }
                    if (response?.ManageEvents !== undefined) {
                        lblManageEvents = response.ManageEvents;
                    } else {
                        lblManageEvents = state.viewSiteItem?.ManageEvents;
                    }
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: defaultSelcetdFromItems?.Id,
                        ActionType: UserActivityActionTypeEnum.Update,
                        EntityType: UserActionEntityTypeEnum.ViewSiteDetail,
                        EntityId: defaultSelcetdFromItems?.Id,
                        EntityName: response?.Title,
                        StateId: singleSelectSiteDetails?.QCStateId || newFromObj?.QCStateId,
                        Details: `Update Site ${response?.Title}`
                    };
                    void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
                    if (singleSelectSiteDetails?.Id) {
                        _sitePivotData();
                    }
                }).catch((error) => {
                    console.log(error);
                });
                let Data = {
                    HelpDesk: lblHelpDesk,
                    Periodic: lblPeriodic,
                    ClientResponse: lblClientResponse,
                    JobControlChecklist: lblJobControlChecklist,
                    ManageEvents: lblManageEvents
                };
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                if (state.isUpdateNewSite) {
                    SetState(prevState => ({ ...prevState, isUpdateShowDetailOnly: true, isShowDetailOnly: true, isUpdateNewSite: false, isAddNewSite: false, isEditSiteImageDeleted: false, isEditSite: false }));
                    let breadCrumItems: IBreadCrum[] = [];
                    breadCrumItems.push({ text: state?.viewSiteItem?.siteName, key: state.viewSiteItem?.siteName, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: [] });

                    props.manageComponentView({
                        currentComponentName: ComponentNameEnum.AddNewSite,
                        dataObj: Data,
                        siteMasterId: state.viewSiteItem?.Id,
                        isShowDetailOnly: true,
                        siteName: state.viewSiteItem?.siteName,
                        qCState: state.viewSiteItem?.qCState,
                        breadCrumItems: breadCrumItems,
                        viewBy: props.viewBy,
                    });
                } else {
                    manageComponentView({
                        currentComponentName: ComponentNameEnum.ViewSite,
                        viewSelectedADUsersFilter: props?.componentProps?.viewSelectedADUsersFilter,
                        viewSelectedSiteManagersFilter: props?.componentProps?.viewSelectedSiteManagersFilter,
                        viewSelectedSiteTitlesFilter: props?.componentProps?.viewSelectedSiteTitlesFilter,
                        viewSelectedStateFilter: props?.componentProps?.viewSelectedStateFilter,
                        viewSelectedSCSitesFilter: props?.componentProps?.viewSelectedSCSitesFilter,
                        viewSelectedSiteIdsFilter: props?.componentProps?.viewSelectedSiteIdsFilter,
                        viewBy: props.viewBy,
                    });
                }
            } else {
                setIsLoading(false);
            }

        } catch (error) {
            const errorObj: IErrorLog = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error in onClickUpdate ",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "Add New Project  onClickUpdate method"
            };
            void logGenerator(props.provider, errorObj);
        }
    };


    const getChoicesList = async (): Promise<void> => {
        let dropvalue: any = [];
        const select = ["Id,Title,SiteNameId,IsActive"];
        let filterQuery = 'IsActive eq 1';

        // Conditionally add the SiteNameId filter
        if (singleSelectSiteDetails?.Id !== null && singleSelectSiteDetails?.Id !== undefined) {
            filterQuery += ` and SiteNameId eq '${singleSelectSiteDetails?.Id}'`;
        }

        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.AssetLocationChoices,
            filter: filterQuery
        };

        try {
            const response = await props.provider.getItemsByQuery(queryStringOptions);
            const options = response.map((CV: any) => ({
                value: CV.Title,
                key: CV.Title,
                text: CV.Title,
                label: CV.Title
            }));
            if (options.length > 0) {
                dropvalue.push({ key: "all", text: "Select All" });
                dropvalue.push(...options);
                SetState(prev => ({ ...prev, assetLocationOptions: dropvalue }));
            } else {
                SetState(prev => ({ ...prev, assetLocationOptions: [] }));
            }
        } catch (error) {
            console.log(error);
        }
    };

    const getSiteMasteItemsByID = () => {
        if (!!singleSelectSiteDetails?.Id) {
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.SitesMaster,
                select: ['Id,Title,ADUserId,SiteManagerId,eLearning,SCSiteId,SubLocation,ExistingSiteLink,JobCode,QCStateId,SiteManager/Title,SiteManager/Id,SiteSupervisor/Id,SiteManager/EMail,SiteSupervisorId,SiteSupervisor/Title,SiteSupervisor/EMail,QCState/Title,ADUser/Title,ADUser/Name,SiteImage,SiteImageThumbnailUrl,SiteHeader,SiteHeaderThumbnailUrl,HelpDesk,Periodic,ClientResponse,JobControlChecklist,ManageEvents,IsResourceRecovery,Category,SSWasteReport,UsersId,Users/Title,Users/Name,BreakDownBy,AmenitiesFeedbackForm,IsDailyCleaningDuties,DynamicSiteManager/Title,DynamicSiteManager/Id,DynamicSiteManager/EMail,SiteCategoryId'],
                expand: ['SiteManager,SiteSupervisor,QCState,ADUser,Users,DynamicSiteManager'],
                id: !!singleSelectSiteDetails?.Id ? singleSelectSiteDetails?.Id : 0
            };
            return provider.getByItemByIDQuery(queryOptions);
        }
    };

    const getSiteMasteItemsNames = () => {
        let queryOptions = {
            listName: ListNames.SitesMaster,
            select: ['Id,Title,QCStateId,QCState/Title,JobCode'],
            expand: ['QCState']
        };
        return props.provider.getItemsByQuery(queryOptions);
    };

    const onclickEdit = async () => {
        // SetState((prevState: any) => ({
        //     ...prevState,
        //     isaddNewSite: false,
        //     isUpdateShowDetailOnly: false,//pending
        //     isUpdateNewSite: true,//pending
        //     isdisableField: false//pending
        // }));
        let obj = {
            ...props.selectedZoneDetails,
            // siteCount: props.selectedZoneDetails?.siteCount,
            // zoneId: props.selectedZoneDetails?.zoneId || "",
            // zoneName: props.selectedZoneDetails?.zoneName || "",
            defaultSelectedSites: [{
                Id: singleSelectSiteDetails?.Id,
                QCStateId: singleSelectSiteDetails?.QCStateId,
                SiteName: singleSelectSiteDetails?.SiteName,
                State: singleSelectSiteDetails?.State,
                siteImage: singleSelectSiteDetails?.siteImage,
                siteCategory: singleSelectSiteDetails?.siteCategory
            }],
            defaultSelectedSitesId: [singleSelectSiteDetails.Id]
        }
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({ text: singleSelectSiteDetails?.SiteName, key: singleSelectSiteDetails?.SiteName, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewSite, dataObj: singleSelectSiteDetails, siteMasterId: singleSelectSiteDetails?.Id, isShowDetailOnly: true, siteName: singleSelectSiteDetails.SiteName, qCState: singleSelectSiteDetails?.State, breadCrumItems: breadCrumItems } });

        props.manageComponentView({
            currentComponentName: ComponentNameEnum.AddNewSite,
            dataObj: singleSelectSiteDetails,
            siteMasterId: singleSelectSiteDetails?.Id,
            isShowDetailOnly: false,
            siteName: singleSelectSiteDetails?.SiteName,
            qCState: singleSelectSiteDetails?.State,
            qCStateId: singleSelectSiteDetails?.QCStateId,
            breadCrumItems: breadCrumItems,
            isAddNewSite: false,
            // selectedZoneDetails: selectedZonesSites,
            selectedZoneDetails: obj as any,
            isZoneEdit: true,
            viewBy: props.viewBy,
        })
        // try {
        //     let siteMasterItems = await getSiteMasteItemsByID();
        //     let SiteImageUrl: string;
        //     let SiteHeaderUrl: string;
        //     const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/SitesMaster/Attachments/' + siteMasterItems.Id + "/";
        //     if (siteMasterItems.SiteImage) {
        //         try {
        //             const SitePhotoData = JSON.parse(siteMasterItems.SiteImage);
        //             if (SitePhotoData && SitePhotoData.serverRelativeUrl) {
        //                 SiteImageUrl = SitePhotoData.serverRelativeUrl;
        //             } else if (SitePhotoData && SitePhotoData.fileName) {
        //                 SiteImageUrl = fixImgURL + SitePhotoData.fileName;
        //             } else {
        //                 SiteImageUrl = "";
        //             }
        //         } catch (error) {
        //             console.error("Error parsing QRCodePhotoData JSON:", error);
        //             SiteImageUrl = "";
        //         }
        //     } else {
        //         SiteImageUrl = "";
        //     }
        //     if (siteMasterItems?.SiteHeader) {
        //         try {
        //             const SitePhotoData = JSON?.parse(siteMasterItems?.SiteHeader);
        //             if (SitePhotoData && SitePhotoData?.serverRelativeUrl) {
        //                 SiteHeaderUrl = SitePhotoData?.serverRelativeUrl;
        //             } else if (SitePhotoData && SitePhotoData?.fileName) {
        //                 SiteHeaderUrl = fixImgURL + SitePhotoData?.fileName;
        //             } else {
        //                 SiteHeaderUrl = "";
        //             }
        //         } catch (error) {
        //             console.error("Error parsing QRCodePhotoData JSON:", error);
        //             SiteHeaderUrl = "";
        //         }
        //     } else {
        //         SiteHeaderUrl = "";
        //     }
        //     const siteManagerOptions = siteMasterItems?.SiteManager?.map((manager: any) => ({
        //         key: manager.Id,
        //         value: manager.Id,
        //         text: manager.Title,
        //         label: manager.Title,
        //     }));
        //     // SetState((prevState: any) => ({ ...prevState, DynamicSiteManagerOptions: siteManagerOptions }));

        //     CurrentStateName.current = siteMasterItems?.QCState?.Title;
        //     setIsHelpDesk(siteMasterItems?.HelpDesk);
        //     setIsPeriodic(siteMasterItems?.Periodic);
        //     setIsClientResponse(siteMasterItems?.ClientResponse);
        //     setIsJobControlChecklist(siteMasterItems?.JobControlChecklist);
        //     setIsManageEvents(siteMasterItems?.ManageEvents);
        //     setIsResourceRecovery(siteMasterItems?.IsResourceRecovery);

        //     setELearning(siteMasterItems?.eLearning)
        //     // setDefaultSelcetdFromItems((prevProps: any) => ({ ...prevProps, siteName: singleSelectSiteDetails?.Id, sitenamestr: siteMasterItems.Title, qCState: siteMasterItems.QCStateId, siteManager: siteMasterItems.SiteManager?.EMail, siteSupervisor: siteMasterItems.SiteSupervisor?.EMail, aDUser: siteMasterItems.ADUser?.EMail, ExistingSiteLink: siteMasterItems.ExistingSiteLink, JobCode: siteMasterItems.JobCode, Id: siteMasterItems.Id, SiteImage: SiteImageUrl, SiteHeader: SiteHeaderUrl }));
        //     setDefaultSelcetdFromItems((prevProps: any) => ({ ...prevProps, siteName: singleSelectSiteDetails?.Id, sitenamestr: siteMasterItems.Title, qCState: siteMasterItems.QCStateId, siteManager: siteMasterItems.SiteManager?.EMail, siteSupervisor: siteMasterItems.SiteSupervisor?.EMail, aDUser: !!siteMasterItems.ADUserId ? siteMasterItems.ADUser.map((user: any) => user.Name.split('i:0#.f|membership|').filter(Boolean)[0]) : [], ExistingSiteLink: siteMasterItems.ExistingSiteLink, JobCode: siteMasterItems.JobCode, Id: siteMasterItems.Id, SiteImage: SiteImageUrl, SiteHeader: SiteHeaderUrl }));
        //     setselectedUsers2(siteMasterItems.SiteManager?.map((r: { EMail: any; }) => r.EMail));
        //     setOldSM(siteMasterItems.SiteManager);

        //     setselectedUsers(siteMasterItems.SiteSupervisor?.map((r: { EMail: any; }) => r.EMail));
        //     setOldSS(siteMasterItems.SiteSupervisor);
        //     setExistingSiteLink(siteMasterItems?.ExistingSiteLink);
        //     setIsSubLocation(siteMasterItems?.SubLocation);
        //     setJobCode(siteMasterItems?.JobCode);
        //     initialSelectedTags = siteMasterItems?.JobCode
        //         ?.split(',')
        //         ?.map((code: any) => code.trim())
        //         ?.filter((code: any) => code.length > 0)
        //         ?.map((code: any) => ({ key: code, name: code }));

        //     if (siteMasterItems.QCStateId) {
        //         setIsCategoryDisable(false);
        //         setKeyUpdateCategoryOptions(Math.random())
        //     }
        //     setNewFromObj((prevState: any) => ({ ...prevState, QCStateId: siteMasterItems.QCStateId, Category: siteMasterItems.Category, SCSiteId: siteMasterItems?.SCSiteId }));

        //     setStateName(siteMasterItems?.QCState?.Title);

        //     // setselectedADUsers2(siteMasterItems.ADUser?.map((r: { EMail: any; }) => r.EMail));
        //     if (!!siteMasterItems.ADUserId && siteMasterItems.ADUserId.length > 0)
        //         setselectedADUsers2(siteMasterItems.ADUser.map((user: any) => user.Name.split('i:0#.f|membership|').filter(Boolean)[0]));
        //     setNewFromObj((prevState: any) => ({ ...prevState, Title: siteMasterItems.Title, UsersId: siteMasterItems.UsersId ? siteMasterItems.UsersId : [], BreakDownBy: siteMasterItems.BreakDownBy, SiteManagerId: siteMasterItems.SiteManagerId ? siteMasterItems.SiteManagerId : [], DynamicSiteManagerId: siteMasterItems?.DynamicSiteManager?.Id }));
        //     SetState((prevState: any) => ({ ...prevState, isdisableField: false, DynamicSiteManagerOptions: siteManagerOptions || [] }));
        //     setIsSSWasteReport(siteMasterItems.SSWasteReport);
        //     setIsAmenitiesFeedbackForm(siteMasterItems.AmenitiesFeedbackForm);
        //     setIsDailyCleaningDuties(siteMasterItems.IsDailyCleaningDuties);
        //     if (siteMasterItems.SSWasteReport) {
        //         const defaultSelectedPeople = Array.isArray(siteMasterItems.Users)
        //             ? siteMasterItems.Users.map((person: any) => person.Title)
        //             : [];
        //         setselectedWasteUsers(defaultSelectedPeople);
        //     } else {
        //         setselectedWasteUsers([]);
        //     }

        // } catch (error) {
        //     console.log(error);
        //     const errorObj = { ErrorMethodName: "onclickEdit", CustomErrormessage: "error in on click edit", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
        //     void logGenerator(props.provider, errorObj);
        // }
    };

    React.useEffect(() => {
        const fetchSubLocation = async () => {
            try {
                const siteMasterItems = await getSiteMasteItemsByID();
                setIsSubLocation(siteMasterItems?.SubLocation);
            } catch (error) {
                console.error("Failed to fetch SubLocation:", error);
            }
        };
        if (singleSelectSiteDetails?.Id) {
            fetchSubLocation();
        }


    }, [singleSelectSiteDetails?.Id]);
    const getNavlinks = async () => {
        try {
            const filter = `IsActive eq 1 and LinkFor eq 'Client Dashboard'`;
            const queryOptions: IPnPQueryOptions = {
                listName: ComponentNameEnum.NavigationLinks,
                select: ['Title,NavType,URL,ComponentName,QROrder,IsActive,IsLabel,Parent,TargetAudience'],
                filter: filter,
                orderBy: "QROrder"
            };
            const navLinksData = await props.provider.getItemsByQuery(queryOptions);
            const navLink = navLinksData.map((i: any) => {
                return {
                    Title: !!i.Title ? i.Title : "",
                    NavType: !!i.NavType ? i.NavType : "",
                    URL: !!i.URL ? i.URL.Url : "",
                    ComponentName: !!i.ComponentName ? i.ComponentName : "",
                    QROrder: !!i.QROrder ? i.QROrder : 0,
                    IsActive: !!i.IsActive ? i.IsActive : false,
                    IsLabel: !!i.IsLabel ? i.IsLabel : false,
                    Parent: !!i.Parent ? i.Parent : "",
                    TargetAudience: !!i.TargetAudience ? i.TargetAudience : []
                };
            });
            SetState(prevState => ({ ...prevState, navLinksItems: navLink }));
        } catch (error) {
            const errorObj = { ErrorMethodName: "getNavlinks", CustomErrormessage: "error in get Nav links", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const _sitePivotData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,HelpDesk,eLearning,Periodic,ClientResponse,JobControlChecklist,ManageEvents,IsResourceRecovery,Category,SSWasteReport,AmenitiesFeedbackForm,IsDailyCleaningDuties"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `Id eq ${singleSelectSiteDetails?.Id}`,
                listName: ListNames.SitesMaster,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                SiteName: data.Title,
                                HelpDesk: !!data.HelpDesk ? "Yes" : "No",
                                Periodic: !!data.Periodic ? "Yes" : "No",
                                ClientResponse: !!data.ClientResponse ? "Yes" : "No",
                                JobControlChecklist: !!data.JobControlChecklist ? "Yes" : "No",
                                eLearning: !!data?.eLearning ? "Yes" : "No",
                                ManageEvents: !!data.ManageEvents ? "Yes" : "No",
                                IsResourceRecovery: !!data.IsResourceRecovery ? "Yes" : "No",
                                SSWasteReport: !!data.SSWasteReport ? "Yes" : "No",
                                AmenitiesFeedbackForm: !!data.AmenitiesFeedbackForm ? "Yes" : "No",
                                IsDailyCleaningDuties: !!data.IsDailyCleaningDuties ? "Yes" : "No"
                            }
                        );
                    });
                    PivotData.current = UsersListData[0];
                }
            }).catch((error) => {
                console.log(error);
            });
        } catch (ex) {
            console.log(ex);
        }
    };

    const getSiteMaster = async () => {
        try {
            const [siteMasterItems, stateMasterItems, groups] = await Promise.all([getSiteMasterItems(props.provider), getStateMasterItems2(props.provider), getSiteGroupsPermission(props.provider)]);
            const filterdata = siteMasterItems.filter((r: any) => r.Id == singleSelectSiteDetails?.Id);
            const isSupervisor = filterdata.map(r => r.SiteSupervisorId?.includes(props.loginUserRoleDetails.Id));
            if (isSupervisor[0] == true) {
                if (props.loginUserRoleDetails.isAdmin == false && props.loginUserRoleDetails.isSiteManager == false) {
                    setIsSupervisor(true);
                } else {
                    setIsSupervisor(false);
                }
            } else {
                setIsSupervisor(false);
            }


            // Check the permission for State 
            let arrayofPremission: any[] = [];
            let isNavBarhideDatta: IcurrentloginDetails = {
                admin: groups.filter((r: any) => r.Id == props.loginUserRoleDetails.Id).length > 0 ? arrayofPremission.push("Admin") : "",
                siteManger: siteMasterItems.filter(r => r.SiteManagerId?.indexOf(props.loginUserRoleDetails.Id) > -1).length > 0 ? arrayofPremission.push("Site Manager") : "",
                user: siteMasterItems.filter(r => r.ADUserId?.indexOf(props.loginUserRoleDetails.Id) > -1).length > 0 ? arrayofPremission.push("User") : "",
                isStateManager: stateMasterItems.filter(r => r.StateManagerId?.indexOf(props.loginUserRoleDetails.Id) > -1).length > 0 ? arrayofPremission.push("State Manager") : "",
                isSiteSupervisor: siteMasterItems.filter(r => r.SiteSupervisorId?.indexOf(props.loginUserRoleDetails.Id) > -1).length > 0 ? arrayofPremission.push("Site Supervisor") : "",
                title: props.loginUserRoleDetails.title,
                emailId: props.loginUserRoleDetails.emailId,
                Id: props.loginUserRoleDetails.Id,
                arrayofPremission: arrayofPremission,

            };
            SetState(prevState => ({ ...prevState, currentloginDetails: isNavBarhideDatta }));
        } catch (error) {
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "getSiteMaster", CustomErrormessage: "error in get Site Master", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    React.useEffect(() => {
        if (!!singleSelectSiteDetails && !!singleSelectSiteDetails?.Id) {


            _userActivityLog();
            if (singleSelectSiteDetails?.Id) {
                _sitePivotData();
            }
            _manageSubLocation();
            const externalURL = getExternalUrl(props.context);
            const qrcodeUrl = `${externalURL}/SiteDetail?siteid=${singleSelectSiteDetails ? singleSelectSiteDetails?.Id : ""}`;
            QRCode.toDataURL(qrcodeUrl, { width: 200, margin: 2 })
                .then((url: any) => setQrCodeSrc(url))
                .catch((err: any) => console.error('QR Code generation error:', err));

            const fetchSiteMasterItems = async () => {
                try {
                    const siteMasterItems = await getSiteMasteItemsNames();
                    const siteNameArray = siteMasterItems?.map((item: any) => item.Title);
                    CurrentRefSiteName.current = siteNameArray;
                } catch (error) {
                    console.error('Error fetching site master items:', error);
                }
            };
            fetchSiteMasterItems();
        }

    }, [singleSelectSiteDetails]);

    React.useEffect(() => {
        if (state?.viewSiteItem?.siteName !== "" && state?.viewSiteItem?.qCState !== "" && state?.personaManagerArray?.length !== 0 && state?.personaManagerArray?.length !== undefined) {
            HidePivot.current = false;
            // setIsPivot(true);
        } else {
            if (state?.viewSiteItem?.siteName === undefined && state?.viewSiteItem?.qCState === undefined && state?.personaManagerArray?.length === 0) {
                console.log();

            } else {
                HidePivot.current = true;
                // setIsPivot(false);
                showPopup3();
            }

        }
    }, [state?.viewSiteItem?.siteName, state?.viewSiteItem?.qCState, state?.personaManagerArray]);


    React.useEffect(() => {
        // if (props.isAddNewSite === true) {
        //     onAddNewClick();
        // }
        let isVisibleCrud = (props.loginUserRoleDetails.isStateManager || props.loginUserRoleDetails.isAdmin || props.loginUserRoleDetails?.siteManagerItem.filter(r => r.Id == singleSelectSiteDetails?.Id && r.SiteManagerId?.indexOf(props.loginUserRoleDetails.Id) > -1).length > 0);
        SetState(prevState => ({ ...prevState, isVisibleCrud: isVisibleCrud }));
    }, []);

    const transformData = (data: any) => {
        if (Array.isArray(data?.SiteSupervisor) && Array.isArray(data?.SiteSupervisorId)) {
            return {
                ...data,
                SiteSupervisor: data.SiteSupervisor.map((supervisor: any, index: any) => ({
                    ...supervisor,
                    Id: data.SiteSupervisorId[index],
                })),
            };
        }
        return data; // Return original data if the structure doesn't match
    };

    const onChangeLocation = (option: any, index: number) => {
        SetState((prev) => {
            const items = [...prev.assetLocationManagerSupervisorData];
            let prevOptions = [...(items[index].Location || [])];

            const allKeys = prev.assetLocationOptions
                .filter((opt: any) => opt.key !== "all")
                .map((opt: any) => opt.key);

            if (option.key === "all") {
                const isAllSelected = prevOptions.length === allKeys.length;
                prevOptions = isAllSelected ? [] : allKeys;
            } else {
                if (option.selected) {
                    prevOptions = [...prevOptions, option.key];
                } else {
                    prevOptions = prevOptions.filter((k) => k !== option.key);
                }
            }
            items[index] = {
                ...items[index],
                Location: prevOptions,
            };

            return { ...prev, assetLocationManagerSupervisorData: items };
        });
    };



    const onClickAccesLocation = () => {
        SetState((prevState: any) => ({ ...prevState, isAssetLocationOpen: true, isReload: !prevState.isReload }));
    }

    const onClickSubLocation = () => {
        showPopupSL();
    }

    /**
      * Hide Location Grid in Equipment tab.
      * Updated by Trupti on 19/9/25
     */
    const onClickSubLocationforEquipemntGrid = () => {
        showPopupSL();
    }
    const onClickReload = () => {
        SetState((prevState) => ({ ...prevState, isReload: !prevState.isReload }));
    }

    const onClickSaveAssetLocation = async (item: any) => {
        try {
            if (!!item) {
                if (!!item.assetLocationPermissionId && item.assetLocationPermissionId > 0) {
                    if (item?.Location && item?.Location?.length > 0) {
                        let obj2 = {
                            Location: item.Location,
                        }
                        await provider.updateItem(obj2, ListNames.SiteAssetLocationPermission, Number(item.assetLocationPermissionId));
                        SetState((prevState: any) => ({ ...prevState, assetSucessMessageBar: true, isReload: !prevState.isReload }));
                        setTimeout(() => {
                            SetState((prevState: any) => ({ ...prevState, assetSucessMessageBar: false }));
                        }, 4000);
                    } else {
                        await provider.deleteItem(ListNames.SiteAssetLocationPermission, Number(item.assetLocationPermissionId));
                        SetState((prevState: any) => ({ ...prevState, assetSucessMessageBar: true, isReload: !prevState.isReload }));
                        setTimeout(() => {
                            SetState((prevState: any) => ({ ...prevState, assetSucessMessageBar: false }));
                        }, 4000);
                    }


                } else {


                    delete item.Email;
                    let obj2 = {
                        ManagerSupervisorId: item.id,
                        Location: item.Location,
                        IsManager: item.isManager,
                        Title: !!singleSelectSiteDetails?.SiteName ? singleSelectSiteDetails?.SiteName : "",
                        SiteNameId: singleSelectSiteDetails?.Id
                    }
                    await provider.createItem(obj2, ListNames.SiteAssetLocationPermission);
                    SetState((prevState: any) => ({ ...prevState, assetSucessMessageBar: true, isReload: !prevState.isReload }));
                    setTimeout(() => {
                        SetState((prevState: any) => ({ ...prevState, assetSucessMessageBar: false, }));
                    }, 4000);
                }
            }
        } catch (error) {
            console.log("onClickSaveAssetLocation" + error);

        }
    }

    React.useEffect(() => {
        try {
            // if (singleSelectSiteDetails?.Id) {
            if (!!selectedZoneDetails && selectedZoneDetails?.defaultSelectedSitesId?.length === 1) {
                void (async () => {
                    setIsLoading(true);
                    getSiteMaster();
                    getNavlinks();
                    let SiteImageUrl: string;
                    let SiteHeaderUrl: string;
                    let [siteMasterItems, siteManageLocationData] = await Promise.all([getSiteMasteItemsByID(), getManageLocation(), getChoicesList()]);

                    if (!!siteMasterItems) {


                        // Call the function
                        const transformedData = transformData(siteMasterItems);
                        setSiteData(transformedData);
                        const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/SitesMaster/Attachments/' + siteMasterItems?.Id + "/";
                        if (siteMasterItems?.SiteImage) {
                            try {
                                const SitePhotoData = JSON.parse(siteMasterItems.SiteImage);
                                if (SitePhotoData && SitePhotoData.serverRelativeUrl) {
                                    SiteImageUrl = SitePhotoData.serverRelativeUrl;
                                } else if (SitePhotoData && SitePhotoData.fileName) {
                                    SiteImageUrl = fixImgURL + SitePhotoData.fileName;
                                } else {
                                    SiteImageUrl = "";
                                }
                            } catch (error) {
                                console.error("Error parsing QRCodePhotoData JSON:", error);
                                SiteImageUrl = "";
                            }
                        } else {
                            SiteImageUrl = "";
                        }
                        if (siteMasterItems?.SiteHeader) {
                            try {
                                const SitePhotoData = JSON?.parse(siteMasterItems?.SiteHeader);
                                if (SitePhotoData && SitePhotoData?.serverRelativeUrl) {
                                    SiteHeaderUrl = SitePhotoData?.serverRelativeUrl;
                                } else if (SitePhotoData && SitePhotoData?.fileName) {
                                    SiteHeaderUrl = fixImgURL + SitePhotoData?.fileName;
                                } else {
                                    SiteHeaderUrl = "";
                                }
                            } catch (error) {
                                console.error("Error parsing QRCodePhotoData JSON:", error);
                                SiteHeaderUrl = "";
                            }
                        } else {
                            SiteHeaderUrl = "";
                        }
                        const items: any = {
                            Id: siteMasterItems?.Id,
                            siteName: !!siteMasterItems.Title ? siteMasterItems.Title : "",
                            qCState: !!siteMasterItems.QCStateId ? siteMasterItems.QCState.Title : "",
                            qCStateId: !!siteMasterItems.QCStateId ? siteMasterItems.QCStateId : "",
                            siteManagerTitle: !!siteMasterItems.SiteManagerId ? siteMasterItems.SiteManager?.map((r: { Title: any; }) => r.Title) : "",
                            siteManagerEmail: !!siteMasterItems.SiteManagerId ? siteMasterItems.SiteManager?.map((r: { EMail: any; }) => r.EMail) : "",
                            siteManagerId: !!siteMasterItems.SiteManagerId ? siteMasterItems.SiteManagerId : "",
                            aDUserTitle: !!siteMasterItems.ADUserId ? siteMasterItems.ADUser?.map((r: { Title: any; }) => r.Title) : "",

                            aDUserEmail: !!siteMasterItems.ADUserId ? siteMasterItems.ADUser?.map((user: any) => user.Name.split('i:0#.f|membership|').filter(Boolean)[0]) : "",
                            aDUserId: !!siteMasterItems.ADUserId ? siteMasterItems.ADUserId : "",
                            siteSupervisorTitle: !!siteMasterItems.SiteSupervisorId ? siteMasterItems.SiteSupervisor?.map((r: { Title: any; }) => r.Title) : "",
                            siteSupervisorEmail: !!siteMasterItems.SiteSupervisorId ? siteMasterItems.SiteSupervisor?.map((r: { EMail: any; }) => r.EMail) : "",
                            siteSupervisorId: !!siteMasterItems.SiteSupervisorId ? siteMasterItems.SiteSupervisorId : "",
                            SiteImageUrl: SiteImageUrl,
                            SiteHeaderUrl: SiteHeaderUrl,
                            ExistingSiteLink: !!siteMasterItems.ExistingSiteLink ? siteMasterItems.ExistingSiteLink : "",
                            JobCode: !!siteMasterItems.JobCode ? siteMasterItems.JobCode : "",
                            personaManagerArray: siteMasterItems?.SiteManager,
                            personaSupervisorArray: siteMasterItems?.SiteSupervisor,
                            personaADUserArray: siteMasterItems?.ADUSer,
                            HelpDesk: siteMasterItems?.HelpDesk,
                            Periodic: siteMasterItems?.Periodic,
                            ClientResponse: siteMasterItems?.ClientResponse,
                            JobControlChecklist: siteMasterItems?.JobControlChecklist,
                            eLearning: siteMasterItems?.eLearning,
                            ManageEvents: siteMasterItems?.ManageEvents,
                            IsResourceRecovery: siteMasterItems?.IsResourceRecovery,
                            Category: !!siteMasterItems?.Category ? siteMasterItems?.Category : "",
                            SiteCategoryId: !!siteMasterItems?.SiteCategoryId ? siteMasterItems?.SiteCategoryId : "",
                        };
                        if (items.qCStateId) {
                            setIsCategoryDisable(false);
                            setKeyUpdateCategoryOptions(Math.random())
                        }
                        let managerSupervisor: any[] = [];
                        let deleteAssetPermissonIDS = []
                        if (!!siteMasterItems?.SiteManager && siteMasterItems?.SiteManager.length > 0) {
                            let siteManagerId: any[] = siteMasterItems?.SiteManager.map((i: any) => i.Id) || [];
                            let deleteIds: any[] = [];
                            if (!!siteManageLocationData && siteManageLocationData.length > 0) {
                                deleteIds = siteManageLocationData.filter((i) => i.IsManager == true && siteManagerId.indexOf(i.ManagerSupervisorId) == -1);
                            }

                            if (!!deleteIds && deleteIds.length > 0) {
                                deleteAssetPermissonIDS = deleteIds.map((i) => i.ID);
                            }


                            let manager = siteMasterItems?.SiteManager.map((i: any) => {
                                let location: any[] = []
                                let assetLocationPermissionId: number = 0;
                                if (!!siteManageLocationData && siteManageLocationData.length > 0) {
                                    let filterData = siteManageLocationData.find((j) => j.IsManager == true && j.ManagerSupervisorId == i.Id)
                                    if (!!filterData && !!filterData.Location && filterData.Location.length > 0) {
                                        location = filterData.Location;
                                        assetLocationPermissionId = filterData.ID

                                    }
                                }
                                let existing = state.assetLocationManagerSupervisorData?.find(
                                    (x) => x.id === i.Id && x.isManager === true
                                );

                                return {
                                    id: i.Id,
                                    Email: i.EMail,
                                    Title: i.Title,
                                    isManager: true,
                                    Location: !!location && location.length > 0 ? location : (existing?.Location || []),
                                    assetLocationPermissionId: assetLocationPermissionId,
                                }

                            })
                            managerSupervisor = manager
                        }
                        if (!!siteMasterItems?.SiteSupervisor && siteMasterItems?.SiteSupervisor.length > 0) {
                            let siteSupervisorId: any[] = siteMasterItems?.SiteSupervisor.map((i: any) => i.Id) || [];
                            let deleteSubIds: any[] = [];
                            if (!!siteManageLocationData && siteManageLocationData.length > 0) {
                                deleteSubIds = siteManageLocationData.filter((i) => i.IsManager == false && siteSupervisorId.indexOf(i.ManagerSupervisorId) == -1);
                            }
                            if (deleteSubIds.length > 0) {
                                deleteAssetPermissonIDS = [...deleteAssetPermissonIDS, ...deleteSubIds.map((i) => i.ID)]
                            }

                            let siteSupervisor = siteMasterItems?.SiteSupervisor.map((i: any) => {
                                let suplocation: string[] = [];
                                let assetLocationPermissionId: number = 0;
                                if (!!siteManageLocationData && siteManageLocationData.length > 0) {
                                    let filterData = siteManageLocationData.find((j) => j.IsManager == false && j.ManagerSupervisorId == i.Id)
                                    if (!!filterData && !!filterData.Location && filterData.Location.length > 0) {
                                        suplocation = filterData.Location;
                                        assetLocationPermissionId = filterData.ID

                                    }
                                }
                                let existing = state.assetLocationManagerSupervisorData?.find(
                                    (x) => x.id === i.Id && x.isManager === false
                                );
                                return {
                                    id: i.Id,
                                    Email: i.EMail,
                                    Title: i.Title,
                                    isManager: false,
                                    Location: !!suplocation && suplocation.length > 0 ? suplocation : (existing?.Location || []),
                                    assetLocationPermissionId: assetLocationPermissionId
                                }

                            })
                            managerSupervisor = [...managerSupervisor, ...siteSupervisor];
                        }

                        if (!!deleteAssetPermissonIDS && deleteAssetPermissonIDS.length > 0) {
                            await props.provider.delteItemsBatch(ListNames.SiteAssetLocationPermission, deleteAssetPermissonIDS)
                        }


                        setNewFromObj((prevState: any) => ({ ...prevState, QCStateId: items.qCStateId }));

                        SetState((prevState: any) => ({
                            ...prevState, viewSiteItem: items, assetLocationManagerSupervisorData: managerSupervisor, personaManagerArray: siteMasterItems.SiteManager, personaSupervisorArray: siteMasterItems.SiteSupervisor, personaADUserArray: !!siteMasterItems.ADUserId ? siteMasterItems.ADUser.map((user: any) => ({
                                ...user,
                                EMail: user.Name.split('i:0#.f|membership|').filter(Boolean)[0]
                            })) : []
                        }));
                    }

                    // }
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 1000);
                })();
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            const errorObj = { ErrorMethodName: "useeEffect", CustomErrormessage: "error in use Effect", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    }, [state.isUpdateNewSite, state.isReload, selectedZoneDetails?.defaultSelectedSitesId]);


    const onClickWasterReport = () => {
        const siteUrl: string = props.context.pageContext.web.absoluteUrl;
        const encryptedSiteName = encryptWasteValue(!!singleSelectSiteDetails?.SiteName ? singleSelectSiteDetails?.SiteName : PivotData.current?.SSWasteReport);
        if (!!siteUrl) {
            let wasteReportLink = "";
            const baseSitesUrl = siteUrl.split('/sites')[0] + '/sites';
            const urlParts = siteUrl.replace(/^https?:\/\//, '').split('.');
            const foundTenantName = urlParts[0]?.toLowerCase();
            if (foundTenantName === "treta") {
                wasteReportLink = `${baseSitesUrl}/SSWasteReport/SitePages/SSWasteReport.aspx?SiteName=${encryptedSiteName}`;
            } else if (foundTenantName === "quaycleanaustralia") {
                wasteReportLink = `${baseSitesUrl}/SSClientPortal/SitePages/SSWasteReport.aspx?SiteName=${encryptedSiteName}`;
            }
            window.open(wasteReportLink, '_blank');
            // const siteName: any = decryptWasteValue(encryptedSiteName);
            // console.log(siteName);
        }

    }
    const menuProps: IContextualMenuProps = {
        items: [
            ... ((isVisibleReport.current && singleSelectSiteDetails?.Id) ? [{
                key: "Microkeeper",
                text: "Microkeeper",
                iconProps: { iconName: "DynamicSMBLogo", style: { color: "#1E88E5" } },
                onClick: () => {
                    if (singleSelectSiteDetails?.Id) {
                        const IMSDshboardPageLink = `${props.context.pageContext.web.absoluteUrl}/SitePages/Microkeeper.aspx?SiteId=${encryptValue(singleSelectSiteDetails?.Id)}`
                        window.open(IMSDshboardPageLink, '_blank')
                    }
                },
            }] : []),
            ...(((PivotData.current === undefined || PivotData.current?.SSWasteReport !== "No")) ? [{
                key: "Waste Report",
                text: "Waste Report",
                iconProps: { iconName: "RecycleBin", style: { color: "#E53935" } },
                onClick: () => { onClickWasterReport() },
            }] : []),
            ...(((PivotData.current === undefined || PivotData.current?.AmenitiesFeedbackForm !== "No") && singleSelectSiteDetails?.Id) ? [{
                key: "Amenities Feedback Form",
                text: "Amenities Feedback Form",
                iconProps: { iconName: "OfficeFormsLogoInverse", style: { color: "#43A047" } },
                onClick: () => {
                    const siteUrl: string = props.context.pageContext.web.absoluteUrl;
                    if (!!siteUrl && singleSelectSiteDetails?.Id) {
                        let amenitiesFeedbackLink = `${props.context.pageContext.web.absoluteUrl}/SitePages/${SitePageName.AmenitiesFeedbackForm}?SiteId=${encryptValue(singleSelectSiteDetails?.Id)}`

                        window.open(amenitiesFeedbackLink, '_blank');

                    }

                },
            }] : []),
            ...(((PivotData.current === undefined || PivotData.current?.IsDailyCleaningDuties !== "No") && singleSelectSiteDetails?.Id) ? [{
                key: "Daily Cleaning Duties",
                text: "Daily Cleaning Duties",
                iconProps: { iconName: "ProductList", style: { color: "#00897B" } },
                onClick: (ev: any, item: any) => {
                    const siteUrl: string = props.context.pageContext.web.absoluteUrl;
                    if (!!siteUrl && singleSelectSiteDetails?.Id) {
                        let dailyCleanigDutiesPageLink = `${props.context.pageContext.web.absoluteUrl}/SitePages/${SitePageName.DailyCleaningDuties}?SiteId=${encryptValue(singleSelectSiteDetails?.Id)}`

                        window.open(dailyCleanigDutiesPageLink, '_blank');
                    }
                },
            }] : []),
            ...(((!PivotData.current || PivotData.current?.eLearning !== "No") && singleSelectSiteDetails?.Id) ? [
                {
                    key: "eLearning",
                    text: "eLearning",
                    iconProps: { iconName: "D365TalentLearn", style: { color: "#8E24AA" } },
                    onClick: () => {
                        const siteUrl = props.context.pageContext.web.absoluteUrl;
                        if (siteUrl) {
                            const link = singleSelectSiteDetails?.Id
                                ? `${siteUrl}/SitePages/${SitePageName.QCeLearning}?SiteId=${encryptValue(singleSelectSiteDetails?.Id)}`
                                : `${siteUrl}/SitePages/${SitePageName.QCeLearning}`;
                            window.open(link, "_blank");
                        }
                    },
                }
            ] : []),
            ... ((isVisibleReport.current) ? [{
                key: "Quaysafe News",
                text: "Quaysafe News",
                iconProps: { iconName: "News", style: { color: "#F57C00" } },
                onClick: () => {
                    const IMSDshboardPageLink = `${props.context.pageContext.web.absoluteUrl}/SitePages/QuaysafeDashboard.aspx`;
                    window.open(IMSDshboardPageLink, '_blank');
                },
            }] : []),

        ],
    };

    const renderLazyPivotContent = (
        pivotKey: string,
        Component: any,
        fallbackText: string = "Loading..."
    ) => {
        if (selectedKey !== pivotKey) return null;
        return (

            <React.Suspense fallback={<div>{fallbackText}</div>}>

                {Component}
            </React.Suspense>
        );

    };



    return <>
        {isLoading && <Loader />}
        {state.isEditSiteImagePanelOpen &&
            <Panel
                isOpen={state.isEditSiteImagePanelOpen}
                onDismiss={() => SetState(prevState => ({ ...prevState, isEditSiteImagePanelOpen: false }))}
                type={PanelType.extraLarge}
                headerText="Image View">
                {/* <ViewSiteImage
                    item={defaultSelcetdFromItems}
                    prefix={"SiteImage"}
                    imageUrl={defaultSelcetdFromItems.SiteImage}
                    width={100} height={85}
                    alt="photo"
                    className=""
                /> */}
                <LazyLoadImage src={defaultSelcetdFromItems.SiteImage}
                    width={100} height={85}
                    placeholderSrc={notFoundImage}
                    alt="site photo"
                    //className="course-img-first"
                    effect="blur"
                />
                {/* <img src={defaultSelcetdFromItems.SiteImage} style={{ width: "100%", height: "85vh" }} /> */}
            </Panel>
        }
        {state.isEditSiteHeaderPanelOpen &&
            <Panel
                isOpen={state.isEditSiteHeaderPanelOpen}
                onDismiss={() => SetState(prevState => ({ ...prevState, isEditSiteHeaderPanelOpen: false }))}
                type={PanelType.extraLarge}
                headerText="Header View">
                {/* <ViewSiteImage
                    item={defaultSelcetdFromItems}
                    prefix={"HeaderImage"}
                    imageUrl={defaultSelcetdFromItems.SiteImage}
                    width={100} height={85}
                    alt="photo"
                    className=""
                /> */}

                <LazyLoadImage src={defaultSelcetdFromItems.SiteImage}
                    width={100} height={85}
                    placeholderSrc={notFoundImage}
                    alt="site photo"
                    //className="course-img-first"
                    effect="blur"
                />
                {/* <img src={defaultSelcetdFromItems.SiteHeader} style={{ width: "100%", height: "85vh" }} /> */}
            </Panel>
        }
        {state.isformValidationModelOpen &&
            <CustomModal
                isModalOpenProps={state.isformValidationModelOpen} setModalpopUpFalse={() => {
                    SetState((prevState: any) => ({ ...prevState, isformValidationModelOpen: false }))
                }} subject={"Data missing"}
                message={state.validationMessage} closeButtonText={"Close"} />}
        <div className="boxCardNo zone-design zone-detail-view">

            <section className="zone-header">
                <div className="zone-header-left">
                    <h1 className="mainTitle">
                        {props.viewBy === "zone" ? props?.selectedZoneDetails?.zoneName : singleSelectSiteDetails?.SiteName ? singleSelectSiteDetails?.SiteName : props?.selectedZoneDetails?.zoneName || "Sites"
                        }
                    </h1>
                </div>

                <div className="zone-stats">
                    <div>
                        <PrimaryButton className="btn btn-danger justifyright floatright mb5" onClick={() => {
                            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems)
                            manageComponentView({
                                currentComponentName: props?.componentProp?.previousComponentName ? props?.componentProp?.previousComponentName : ComponentNameEnum.ViewSite, view: props?.componentProp?.view, breadCrumItems: breadCrumItems,
                                viewSelectedADUsersFilter: props?.componentProps?.viewSelectedADUsersFilter,
                                viewSelectedSiteManagersFilter: props?.componentProps?.viewSelectedSiteManagersFilter,
                                viewSelectedSiteTitlesFilter: props?.componentProps?.viewSelectedSiteTitlesFilter,
                                viewSelectedStateFilter: props?.componentProps?.viewSelectedStateFilter,
                                viewSelectedSCSitesFilter: props?.componentProps?.viewSelectedSCSitesFilter,
                                viewSelectedSiteIdsFilter: props?.componentProps?.viewSelectedSiteIdsFilter,
                                viewBy: props.viewBy
                            })
                        }} text="Back" />

                    </div>
                </div>
            </section>
            <div className="layout">
                <button className={`sidebar-toggle ${collapsed ? "toggle-rotate" : ""}`} onClick={toggleSidebar}>
                    {/* <FontAwesomeIcon icon={faBars} /> */}
                    {/* <FontAwesomeIcon icon={faAngleRight} /> */}
                    <img src={require('../../../assets/images/angles-right-solid.svg')} height="20px" width="20px" />
                </button>
                <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
                    {/* Header */}
                    <div className="sidebar-option-group">
                        <div className="search-box">
                            {/* <span className="material-icons-outlined">search</span> */}
                            <input
                                type="text"
                                placeholder="Search sites..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>


                    </div>

                    {/* Site List */}
                    <div className="site-list custom-scrollbar">
                        <div className="leftSelectedCount">
                            <h3>Sites</h3>
                            <div className="site-count-badge">
                                {selectedSites?.length || 0} / {filteredSites?.length || 0} Sites Selected
                            </div>
                        </div>
                        {filteredSites.map((site: any) => {
                            const selectedIds = selectedSites.length > 0 ? selectedSites : [];
                            const isSelected = selectedIds.includes(site.Id);

                            const isSiteView = props?.viewBy === "site" || (!props?.viewBy && props.selectedZoneDetails?.zoneName === "");

                            const isDisableCheckbox =
                                isSiteView && selectedIds.length === 1 && isSelected;

                            return (
                                <div
                                    key={site?.Id}
                                    className={`site-card ${isSelected ? "active" : ""}`}
                                    onClick={() => {
                                        if (!isDisableCheckbox) {
                                            handleCheckboxChange(site.Id);
                                        }
                                    }}
                                >
                                    <div className="site-header">
                                        <div className="site-title">
                                            <LazyLoadImage
                                                src={site.siteImage}
                                                placeholderSrc={notFoundImage}
                                                alt="photo"
                                                className="course-img-first"
                                                effect="blur"
                                            />
                                            <div className="site-details">
                                                <div>{site.SiteName}</div>
                                                <p className="site-meta">{site.siteCategory}</p>
                                            </div>
                                        </div>

                                        <input
                                            className="check-zone-input"
                                            type="checkbox"
                                            checked={isSelected}
                                            disabled={isDisableCheckbox}
                                        />
                                    </div>
                                </div>
                            );
                        })}


                        {filteredSites.length == 0 && <NoRecordFound isSmall={true} noRecordText="No sites available" />}
                    </div>
                    {/* Footer */}
                    {(currentUserRoleDetail.isAdmin || currentUserRoleDetail.isStateManager) && <div className="sidebar-footer">
                        <button className="add-site-btn" onClick={onClickAddNewSite}>
                            <span className="material-icons-outlined">
                                <FontAwesomeIcon icon={faPlusCircle} />
                            </span>
                            <span className="add-new-site-btn">Add New Site</span>
                        </button>
                    </div>}
                </aside>

                {/* Main Content */}
                <main className="content-area calcWidth">
                    <div className="formgroup eql-height-periodic">
                        <div className={` ${viewDetailStickHeaders.indexOf(selectedKey) > -1 && "viewPage"}`}>
                            {
                                state.isShowDetailOnly && state.isUpdateShowDetailOnly &&
                                <div>

                                    {(!!menuProps?.items && menuProps?.items.length > 0) && <Link className="btn-back-ml-4 dticon appLinksButton">
                                        <TooltipHost content="App links">
                                            <DefaultButton
                                                text="App links"
                                                iconProps={{ iconName: "AppIconDefaultAdd", style: { color: "#ffffff" } }}
                                                menuProps={menuProps}
                                                className="btn export-btn-primary"
                                            />
                                        </TooltipHost>
                                    </Link>}
                                    <Pivot aria-label="Basic Pivot Example" selectedKey={selectedKey}
                                        overflowBehavior={'menu'}
                                        className="siteInformationPivot"
                                        onLinkClick={_onLinkClick}
                                    >
                                        {isShowOtherTab && <PivotItem
                                            headerText="" itemKey={ZoneViceSiteDetailsPivot.SiteKey}
                                            itemIcon="Home"
                                        >
                                            {renderLazyPivotContent(
                                                ZoneViceSiteDetailsPivot.SiteKey,
                                                <ManageSitesCrud
                                                    onClickReload={onClickReload}
                                                    isShowSuperVisorAccess={(props.loginUserRoleDetails.isAdmin || props.loginUserRoleDetails.isStateManager || props.loginUserRoleDetails?.siteManagerItem.filter(r => r.Id == singleSelectSiteDetails?.Id && r.SiteManagerId?.indexOf(props.loginUserRoleDetails.Id) > -1).length > 0)}
                                                    isShowAssetLocationAccess={(props.loginUserRoleDetails.isAdmin || props.loginUserRoleDetails.isStateManager)}
                                                    onClickAddAccess={onClickAddAccess}
                                                    onClickAccesLocation={onClickAccesLocation}
                                                    onClickSubLocation={onClickSubLocation}
                                                    onclickViewQR={onclickViewQR}
                                                    onclickEdit={onclickEdit}
                                                    qrCodeSrc={qrCodeSrc}
                                                    isCrudShow={(state.isVisibleCrud && !IsSupervisor)}
                                                    isSiteInformationView={true}
                                                    siteMasterId={singleSelectSiteDetails?.Id || 0} manageComponentView={manageComponentView}
                                                    // dataObj={props.dat}
                                                    siteName={singleSelectSiteDetails?.SiteName}
                                                    IsSupervisor={props.IsSupervisor}
                                                    qCState={singleSelectSiteDetails?.State}
                                                    MasterId={singleSelectSiteDetails?.Id}
                                                    qCStateId={singleSelectSiteDetails?.QCStateId}
                                                    componentProp={props.componentProps}
                                                    breadCrumItems={props.breadCrumItems}

                                                />
                                            )}
                                        </PivotItem>}

                                        <PivotItem headerText="Equipment/Assets" itemKey={ZoneViceSiteDetailsPivot.EquipmentKey} itemIcon="DeveloperTools">


                                            {renderLazyPivotContent(
                                                ZoneViceSiteDetailsPivot.EquipmentKey,
                                                <EquipmentAsset
                                                    /**
                                                    * Move Manage Location Access to Equipment tab.
                                                    * Updated by Trupti on 19/9/25
                                                    */
                                                    isSiteInformationView={true}
                                                    isShowAssetLocationAccess={(props.loginUserRoleDetails.isAdmin || props.loginUserRoleDetails.isStateManager)}
                                                    onClickAccesLocation={onClickAccesLocation}
                                                    loginUserRoleDetails={props.loginUserRoleDetails}
                                                    breadCrumItems={props.breadCrumItems}
                                                    provider={provider}
                                                    context={props.context}
                                                    manageComponentView={manageComponentView}
                                                    siteMasterId={singleSelectSiteDetails?.Id}
                                                    siteName={singleSelectSiteDetails?.SiteName}
                                                    qCState={singleSelectSiteDetails?.State}
                                                    IsSupervisor={IsSupervisor}
                                                    dataObj={props?.componentProp?.dataObj}
                                                    componentProp={props.componentProp}
                                                />

                                            )}
                                        </PivotItem>

                                        {isShowOtherTab && <PivotItem headerText="Chemicals" itemKey={ZoneViceSiteDetailsPivot.ChemicalKey} itemIcon="TestAutoSolid">

                                            {renderLazyPivotContent(
                                                ZoneViceSiteDetailsPivot.ChemicalKey,
                                                < AssociateChemical
                                                    breadCrumItems={props.breadCrumItems}
                                                    siteNameId={singleSelectSiteDetails?.Id}
                                                    manageComponentView={manageComponentView}
                                                    IsSupervisor={IsSupervisor}
                                                    dataObj={props?.componentProp?.dataObj}
                                                    loginUserRoleDetails={props.loginUserRoleDetails}
                                                    qCState={singleSelectSiteDetails?.State} siteName={singleSelectSiteDetails?.SiteName} />
                                            )}
                                            {selectedKey == ZoneViceSiteDetailsPivot.ChemicalKey && <React.Suspense fallback={<div>Loading Equipment...</div>}>

                                            </React.Suspense>}

                                        </PivotItem>}

                                        <PivotItem headerText="Assigned Team" itemKey={ZoneViceSiteDetailsPivot.TeamKey} itemIcon="Teamwork">
                                            {renderLazyPivotContent(
                                                ZoneViceSiteDetailsPivot.TeamKey,
                                                <AssignedTeam
                                                    loginUserRoleDetails={props.loginUserRoleDetails}
                                                    provider={props.provider}
                                                    manageComponentView={manageComponentView}
                                                    IsSupervisor={IsSupervisor}
                                                    context={props.context}
                                                    qCState={!!singleSelectSiteDetails?.State ? singleSelectSiteDetails?.State : ""}
                                                    siteMasterId={singleSelectSiteDetails?.Id}
                                                    qCStateId={singleSelectSiteDetails?.QCStateId}
                                                    siteName={singleSelectSiteDetails?.SiteName}

                                                />

                                            )}

                                        </PivotItem>
                                        {(isShowOtherTab) &&
                                            <PivotItem headerText="Safety Culture" itemKey={ZoneViceSiteDetailsPivot.DocumentKey} itemIcon="Communications">
                                                {renderLazyPivotContent(
                                                    ZoneViceSiteDetailsPivot.DocumentKey,
                                                    <AuditReports
                                                        isViewSiteDialog={false}
                                                        provider={props.provider}
                                                        manageComponentView={manageComponentView}
                                                        siteMasterId={singleSelectSiteDetails?.Id}
                                                        context={props.context}
                                                        IsSupervisor={IsSupervisor}
                                                        siteName={singleSelectSiteDetails?.SiteName}
                                                        componentProp={props.componentProp}
                                                        loginUserRoleDetails={props.loginUserRoleDetails}
                                                        qCState={!!singleSelectSiteDetails?.State ? singleSelectSiteDetails?.State : ""}
                                                    />

                                                )}

                                            </PivotItem>}
                                        {isShowOtherTab &&
                                            <PivotItem headerText="Document Library" itemKey={ZoneViceSiteDetailsPivot.DocumentsKey} itemIcon="FabricFormLibrary">
                                                {renderLazyPivotContent(
                                                    ZoneViceSiteDetailsPivot.DocumentsKey,
                                                    <DocumentsLib
                                                        siteNameId={singleSelectSiteDetails?.Id}
                                                        manageComponentView={manageComponentView}
                                                        IsSupervisor={IsSupervisor}
                                                        loginUserRoleDetails={props.loginUserRoleDetails}
                                                        qCStateId={singleSelectSiteDetails?.QCStateId}
                                                        qCState={singleSelectSiteDetails?.State}
                                                        siteName={singleSelectSiteDetails?.SiteName} />

                                                )}

                                            </PivotItem>}

                                        <PivotItem headerText="Quaysafe" itemKey={ZoneViceSiteDetailsPivot.IMSKey} itemIcon="Shield">
                                            {renderLazyPivotContent(
                                                ZoneViceSiteDetailsPivot.IMSKey,
                                                < IMS
                                                    loginUserRoleDetails={props.loginUserRoleDetails}
                                                    breadCrumItems={props.breadCrumItems}
                                                    provider={provider}
                                                    context={props.context}
                                                    originalState={props?.qCState}
                                                    manageComponentView={manageComponentView}
                                                    isZoneView={true}
                                                    siteMasterId={singleSelectSiteDetails?.Id}
                                                    siteName={singleSelectSiteDetails?.SiteName}
                                                    qCState={singleSelectSiteDetails?.State}
                                                    qCStateId={singleSelectSiteDetails?.QCStateId}
                                                    IsSupervisor={IsSupervisor}
                                                    subpivotName={props?.componentProp?.subpivotName}
                                                    dataObj={props?.componentProp?.dataObj}
                                                    view={props?.componentProp?.view}
                                                    PivotData={PivotData.current}
                                                    componentProp={props.componentProp}
                                                />

                                            )}

                                        </PivotItem>
                                        {((PivotData.current === undefined || PivotData.current?.ManageEvents !== "No") && isShowOtherTab) &&
                                            <PivotItem headerText="Events" itemKey={ZoneViceSiteDetailsPivot.EventsKey} itemIcon="Calendar">
                                                {renderLazyPivotContent(
                                                    ZoneViceSiteDetailsPivot.EventsKey,
                                                    < Events
                                                        loginUserRoleDetails={props.loginUserRoleDetails}
                                                        provider={provider}
                                                        context={props.context}
                                                        siteMasterId={singleSelectSiteDetails?.Id}
                                                        siteName={singleSelectSiteDetails?.SiteName}
                                                        componentProp={props.componentProp} manageComponentView={function (componentProp: IQuayCleanState) {
                                                            throw new Error("Function not implemented.")
                                                        }} breadCrumItems={[]} />

                                                )}

                                            </PivotItem>
                                        }

                                        {isShowOtherTab && (PivotData.current === undefined || PivotData.current?.HelpDesk !== "No") && (
                                            <PivotItem headerText={`Help Desk`} itemKey={ZoneViceSiteDetailsPivot.HelpDeskListKey} itemIcon="ContactInfo">
                                                {renderLazyPivotContent(
                                                    ZoneViceSiteDetailsPivot.HelpDeskListKey,
                                                    <HelpDeskList
                                                        manageComponentView={manageComponentView}
                                                        originalSiteMasterId={props.componentProp.siteMasterId}
                                                        siteMasterId={singleSelectSiteDetails?.Id}
                                                        IsSupervisor={IsSupervisor}
                                                        dataObj={props?.componentProp?.dataObj}
                                                        breadCrumItems={props.breadCrumItems || []}
                                                        componentProps={props.componentProp}
                                                        qCStateId={singleSelectSiteDetails?.QCStateId}
                                                    />

                                                )}

                                            </PivotItem>
                                        )}
                                        {isShowOtherTab && (PivotData.current === undefined || PivotData.current?.Periodic !== "No") && (
                                            <PivotItem headerText={`Periodic`} itemKey={ZoneViceSiteDetailsPivot.ManagePeriodicListKey} itemIcon="Clock">
                                                {renderLazyPivotContent(
                                                    ZoneViceSiteDetailsPivot.ManagePeriodicListKey,
                                                    <ManagePeriodicList
                                                        manageComponentView={manageComponentView}
                                                        componentProp={props.componentProp}
                                                        siteMasterId={singleSelectSiteDetails?.Id}
                                                        IsSupervisor={IsSupervisor}
                                                        dataObj={props?.componentProp?.dataObj}
                                                        qCStateId={singleSelectSiteDetails?.QCStateId}
                                                        breadCrumItems={props.componentProp.breadCrumItems || []} />

                                                )}

                                            </PivotItem>
                                        )}

                                        ({PivotData.current === undefined || PivotData.current?.ClientResponse !== "No"}) && (
                                        <PivotItem headerText={`Client Response`} itemKey={ZoneViceSiteDetailsPivot.CRIssueListKey} itemIcon="Message">
                                            {renderLazyPivotContent(
                                                ZoneViceSiteDetailsPivot.CRIssueListKey,
                                                <ClientResponseIssueList
                                                    qCState={singleSelectSiteDetails?.State}
                                                    isZoneView={true}
                                                    // breadCrumItems={props.componentProp.breadCrumItems || []}
                                                    breadCrumItems={props.breadCrumItems}
                                                    qCStateId={singleSelectSiteDetails?.QCStateId}
                                                    componentProps={props.componentProp}
                                                    view={props?.componentProp?.view}
                                                    //siteMasterId={props.componentProp.siteMasterId}
                                                    siteMasterId={singleSelectSiteDetails?.Id}
                                                    manageComponentView={manageComponentView}
                                                />

                                            )}

                                        </PivotItem>
                                        )
                                        {isShowOtherTab && (
                                            <PivotItem headerText={`Monthly KPI's`} itemKey={ZoneViceSiteDetailsPivot.ViewJobControlChecklistKey} itemIcon="BarChartVertical">
                                                {renderLazyPivotContent(
                                                    ZoneViceSiteDetailsPivot.ViewJobControlChecklistKey,
                                                    <ViewJobControlChecklist
                                                        manageComponentView={manageComponentView}
                                                        originalState={props?.qCState}
                                                        originalSiteMasterId={selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId[0]}
                                                        siteMasterId={singleSelectSiteDetails?.Id}
                                                        IsSupervisor={IsSupervisor}
                                                        JobControlChecklist={PivotData.current?.JobControlChecklist}
                                                        dataObj={props?.componentProp?.dataObj}
                                                        breadCrumItems={props.breadCrumItems || []}
                                                        componentProps={props.componentProp} />

                                                )}

                                            </PivotItem>
                                        )}


                                        {(isShowOtherTab && isVisibleReport.current) &&
                                            <PivotItem headerText="Microkeeper" itemKey={ZoneViceSiteDetailsPivot.Microkeeper} itemIcon="AppIconDefault">
                                                {renderLazyPivotContent(
                                                    ZoneViceSiteDetailsPivot.Microkeeper,
                                                    <Reports
                                                        manageComponentView={manageComponentView}
                                                        isSiteView={true}
                                                        siteMasterId={singleSelectSiteDetails?.Id}
                                                        siteDetail={state.viewSiteItem}

                                                        originalState={props?.qCState}
                                                        originalSiteMasterId={props.componentProp.siteMasterId}
                                                        IsSupervisor={IsSupervisor}
                                                        dataObj={props?.componentProp?.dataObj}
                                                        breadCrumItems={props.breadCrumItems || []}
                                                        componentProps={props.componentProp}
                                                    />

                                                )}


                                            </PivotItem>}


                                        {isShowOtherTab && isVisibleReport.current &&
                                            <PivotItem headerText="Safetember" itemKey={ZoneViceSiteDetailsPivot.SynergySessions} itemIcon="DocumentSearch"
                                                onRenderItemLink={(link, defaultRenderer) => {
                                                    return (
                                                        <span style={{ display: '', alignItems: 'center', gap: 6 }}>
                                                            {defaultRenderer?.(link)}
                                                            {isNewDocument && <span
                                                                style={{
                                                                    backgroundColor: 'green',
                                                                    color: 'white',
                                                                    fontSize: '11px',
                                                                    fontWeight: 'bold',
                                                                    padding: '1px 6px 2px 3px',
                                                                    borderRadius: '8px',
                                                                    animation: 'blink 2.2s linear infinite',
                                                                    marginTop: '-4px',
                                                                    marginLeft: '4px',
                                                                    height: '18px'
                                                                }}
                                                            >
                                                                <span className="new-text"> NEW</span>
                                                            </span>}
                                                        </span>
                                                    );
                                                }}>
                                                {renderLazyPivotContent(
                                                    ZoneViceSiteDetailsPivot.SynergySessions,
                                                    <SynergySessions
                                                        siteView={true}
                                                        siteNameId={singleSelectSiteDetails?.Id}
                                                        manageComponentView={manageComponentView}
                                                        IsSupervisor={true}
                                                        qCState={props?.qCState}
                                                        qCStateId={singleSelectSiteDetails?.QCStateId}
                                                        loginUserRoleDetails={props?.loginUserRoleDetails}
                                                        siteName={undefined} />

                                                )}

                                            </PivotItem >}

                                        {
                                            (isShowOtherTab && isVisibleReport.current) &&
                                            <PivotItem headerText="Policies and Procedures" itemKey={ZoneViceSiteDetailsPivot.PoliciesandProcedures} itemIcon="DocumentSet"
                                                onRenderItemLink={(link, defaultRenderer) => {
                                                    return (
                                                        <span style={{ display: '', alignItems: 'center', gap: 6 }}>
                                                            {defaultRenderer?.(link)}
                                                            {isNewDocumentPaP && <span
                                                                style={{
                                                                    backgroundColor: 'green',
                                                                    color: 'white',
                                                                    fontSize: '11px',
                                                                    fontWeight: 'bold',
                                                                    padding: '1px 6px 2px 3px',
                                                                    borderRadius: '8px',
                                                                    animation: 'blink 2.2s linear infinite',
                                                                    marginTop: '-4px',
                                                                    marginLeft: '4px',
                                                                    height: '18px'
                                                                }}
                                                            >
                                                                <span className="new-text"> NEW</span>
                                                            </span>}
                                                        </span>
                                                    );
                                                }}>
                                                {renderLazyPivotContent(
                                                    ZoneViceSiteDetailsPivot.PoliciesandProcedures,
                                                    <PoliciesandProcedures
                                                        siteView={true}
                                                        siteNameId={singleSelectSiteDetails?.Id}
                                                        manageComponentView={manageComponentView}
                                                        IsSupervisor={true}
                                                        qCState={singleSelectSiteDetails?.State}
                                                        qCStateId={singleSelectSiteDetails?.QCStateId}
                                                        loginUserRoleDetails={props?.loginUserRoleDetails}
                                                        siteName={undefined} />

                                                )}

                                            </PivotItem>
                                        }
                                        {
                                            ((PivotData.current === undefined || PivotData.current?.IsResourceRecovery !== "No") && isShowOtherTab) && (
                                                <PivotItem headerText={WasteReportPivot.ResourceRecovery} itemKey={WasteReportPivot.ResourceRecovery} itemIcon="SyncStatus">
                                                    {renderLazyPivotContent(
                                                        WasteReportPivot.ResourceRecovery,
                                                        <ResourceRecovery
                                                            siteNameId={singleSelectSiteDetails?.Id}
                                                            manageComponentView={manageComponentView}
                                                            siteName={singleSelectSiteDetails?.SiteName || ""}
                                                            loginUserRoleDetails={props?.loginUserRoleDetails}
                                                            qCStateId={singleSelectSiteDetails?.QCStateId}
                                                            qCState={singleSelectSiteDetails?.State}
                                                        />
                                                    )}
                                                    {selectedKey == WasteReportPivot.ResourceRecovery && <React.Suspense fallback={<div>Loading Equipment...</div>}>

                                                    </React.Suspense>}
                                                </PivotItem>
                                            )
                                        }
                                    </Pivot >
                                </div >
                            }
                        </div >
                        <div className="ms-Grid">
                            <div className="ms-Grid-row">

                                {
                                    state.isShowDetailOnly && state.isUpdateShowDetailOnly &&
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                        <PrimaryButton className="btn btn-danger justifyright floatright mb5" onClick={() => {
                                            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems)
                                            manageComponentView({
                                                currentComponentName: props?.componentProp?.previousComponentName ? props?.componentProp?.previousComponentName : ComponentNameEnum.ViewSite, view: props?.componentProp?.view, breadCrumItems: breadCrumItems,

                                                viewSelectedADUsersFilter: props?.componentProps?.viewSelectedADUsersFilter,
                                                viewSelectedSiteManagersFilter: props?.componentProps?.viewSelectedSiteManagersFilter,
                                                viewSelectedSiteTitlesFilter: props?.componentProps?.viewSelectedSiteTitlesFilter,
                                                viewSelectedStateFilter: props?.componentProps?.viewSelectedStateFilter,
                                                viewSelectedSCSitesFilter: props?.componentProps?.viewSelectedSCSitesFilter,
                                                viewSelectedSiteIdsFilter: props?.componentProps?.viewSelectedSiteIdsFilter,
                                            })
                                        }} text="Back" />
                                    </div>
                                }

                            </div >
                        </div >
                    </div >
                </main >
            </div >


        </div >
        {isPopupVisible && (
            <Layer>
                <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup}>
                    <Overlay onClick={hidePopup} />
                    <FocusTrapZone>
                        <Popup role="document" className={popupStyles.content}>
                            <div className="ss-per-pad">
                                <h2 className="mt-10">Site Supervisor Permission </h2>
                                <div className="mt-2">
                                    {showSaveMessageBar &&
                                        <MessageBar messageBarType={MessageBarType.success}>
                                            <div className="inputText">Permission has been saved successfully!</div>
                                        </MessageBar>}
                                    {showUpdateMessageBar &&
                                        <MessageBar messageBarType={MessageBarType.success}>
                                            <div className="inputText">Permission has been updated successfully!</div>
                                        </MessageBar>}
                                </div>
                                <div className="mt-3">{SiteData?.SiteSupervisor === undefined && <NoRecordFound />}</div>
                                {!!SiteData && SiteData?.SiteSupervisor?.length > 0 && (
                                    <table className="custom-table-ans">
                                        <thead>
                                            <tr>
                                                <th className="custom-header-ans"><b>Site Supervisor Name</b></th>
                                                <th className="custom-header-ans"><b>Permission Menu</b></th>
                                                <th className="custom-header-ans"><b>Action</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {SiteData?.SiteSupervisor?.length > 0 && SiteData?.SiteSupervisor?.map((supervisor: any) => (
                                                <tr key={supervisor.EMail}>
                                                    <td className="custom-cell-ans">
                                                        <h4>{supervisor.Title}</h4>
                                                    </td>
                                                    <td className="custom-cell-ans custom-cell-ans-mw">
                                                        <Dropdown
                                                            placeholder="Select permission"
                                                            multiSelect
                                                            options={dropdownOptions}
                                                            selectedKeys={selectedOptions[supervisor.EMail] || []}
                                                            onChange={(event, option) => handleDropdownChange(supervisor.EMail, event, option)}
                                                        />
                                                    </td>
                                                    <td className="custom-cell-ans custom-cell-ans-mw-save">
                                                        <Link
                                                            className="actionBtn iconSize btnGreen dticon"
                                                            onClick={() => handleSave(supervisor)}
                                                        >
                                                            <TooltipHost content={"Give Permission"} id={`tooltip-${supervisor.EMail}`}>
                                                                <FontAwesomeIcon icon="save" />
                                                            </TooltipHost>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            <DialogFooter>
                                <DefaultButton text="Close" className='secondMain btn btn-danger mr-16 ss-per-mr' onClick={onClickCancel} />
                            </DialogFooter>
                        </Popup>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )
        }

        {
            state.isAssetLocationOpen && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" onDismiss={hidePopup}>
                        {/* <Overlay onClick={hidePopup} /> */}
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles.content}>
                                <div className="ss-per-pad">
                                    <div className="dFlex justifyContentBetween alignItemsCenter">
                                        <h2 className="mt-10">Site Equipment/Asset Permission</h2>
                                        {IsSubLocation &&
                                            <PrimaryButton
                                                className="btn btn-primary"
                                                text="Add Location"
                                                onClick={onClickSubLocationforEquipemntGrid}

                                            />}

                                    </div>
                                    <div className="mt-2">
                                        {state.assetSucessMessageBar &&
                                            <MessageBar messageBarType={MessageBarType.success}>
                                                <div className="inputText">{Messages.Locationassigned}</div>
                                            </MessageBar>}
                                    </div>
                                    <div className="mt-3">{!state?.assetLocationManagerSupervisorData && <NoRecordFound />}</div>
                                    {!!state.assetLocationManagerSupervisorData && state?.assetLocationManagerSupervisorData?.length > 0 && (
                                        <table className="custom-table-ans">
                                            <thead>
                                                <tr>
                                                    <th className="custom-header-ans"><b>Manager/Supervisor</b></th>
                                                    <th className="custom-header-ans"><b>Location</b></th>
                                                    <th className="custom-header-ans"><b>Action</b></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {state.assetLocationManagerSupervisorData?.length > 0 && state?.assetLocationManagerSupervisorData?.map((item: any, index: number) => (
                                                    <tr key={item.EMail}>
                                                        <td className="custom-cell-ans">
                                                            <h4>{item.Title} </h4>
                                                            <h6 style={{ color: "#979798" }}>{item.isManager ? "Manager" : "Supervisor"}</h6>
                                                        </td>
                                                        <td className="custom-cell-ans custom-cell-ans-mw">
                                                            {state.assetLocationOptions?.length > 0 ? (
                                                                <Dropdown
                                                                    placeholder="Select location"
                                                                    multiSelect
                                                                    options={state.assetLocationOptions as any}
                                                                    selectedKeys={item.Location || []}
                                                                    onChange={(event, option) => onChangeLocation(option, index)}
                                                                />
                                                            ) : (
                                                                <span style={{ color: "#979798" }}>No Location Found</span>
                                                            )}
                                                        </td>
                                                        <td className="custom-cell-ans custom-cell-ans-mw-save">
                                                            <Link
                                                                className={`actionBtn iconSize ${!item.assetLocationPermissionId && item.assetLocationPermissionId == 0 && (!item.Location || item.Location.length === 0) ? "btnGrey" : "btnGreen"} dticon`}
                                                                onClick={(!item.assetLocationPermissionId && item.assetLocationPermissionId == 0 && (!item.Location || item.Location.length === 0))
                                                                    ? undefined
                                                                    : () => onClickSaveAssetLocation(item)
                                                                }
                                                            >
                                                                <TooltipHost content={"Give Permission"} id={`tooltip-${item.Title}`}>
                                                                    <FontAwesomeIcon icon="save" />
                                                                </TooltipHost>
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                                <DialogFooter>
                                    <DefaultButton
                                        text="Close"
                                        className="secondMain btn btn-danger mr-16 ss-per-mr"
                                        onClick={() => {
                                            SetState(prev => ({ ...prev, isAssetLocationOpen: false, assetLocationManagerSupervisorData: [] }));

                                        }}
                                    />
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
                    <Popup className={popupStyles2.root} role="dialog" aria-modal="true" onDismiss={hidePopup2}>
                        <Overlay onClick={hidePopup2} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles2.content}>
                                <h2 className="mt-10">QR Code</h2>
                                <div className="mt-3">
                                    {qrCodeSrc ? (
                                        <div className="dflex">
                                            <div>
                                                <img
                                                    src={qrCodeSrc}
                                                    alt="QR Code"
                                                    style={{ border: '1px solid #ccc', borderRadius: '5px' }}
                                                />
                                            </div>
                                            <div>
                                                <PrimaryButton className="btn btn-primary ml-10" text="Print QR Code" onClick={handleDownload} />
                                            </div>
                                        </div>
                                    ) : (
                                        <p>Generating QR Code...</p>
                                    )}
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

        {
            isPopupVisible3 && (
                <Layer>
                    <Popup className={popupStyles2.root} role="dialog" aria-modal="true" onDismiss={hidePopup3}>
                        <Overlay onClick={hidePopup3} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles2.content}>
                                <h2 className="mt-10">Warning</h2>
                                <div className="mt-3">

                                    <div className="dflex">
                                        <div style={{ marginTop: '10px' }}>
                                            {state?.personaManagerArray === undefined && state?.viewSiteItem?.qCState === "" && (
                                                <div>Site Manager and State are required</div>
                                            )}
                                            {state?.personaManagerArray === undefined && state?.viewSiteItem?.qCState !== "" && (
                                                <div>Site Manager is required</div>
                                            )}
                                            {state?.personaManagerArray !== undefined && state?.viewSiteItem?.qCState === "" && (
                                                <div>State is required qqqq</div>
                                            )}
                                            {displaysiteerror &&
                                                <div>This site name already exists. Please choose a different name.</div>
                                            }
                                            <div style={{ marginTop: '10px', }}>
                                                <b> Notes: Update record to access full site.</b>
                                            </div>
                                        </div>
                                    </div>
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

        {
            isPopupVisibleSL && (
                <Layer>
                    <Popup className={popupStyles2.root} role="dialog" aria-modal="true" onDismiss={hidePopupSL}>
                        <Overlay onClick={hidePopupSL} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles2.content}>
                                {/* Location Section */}
                                <div className="mt-10">
                                    <h3>Add Location</h3>
                                    <div className="mt-2">
                                        {SLSucessMessageBar &&
                                            <MessageBar messageBarType={MessageBarType.success}>
                                                <div className="inputText">Location has been added successfully!</div>
                                            </MessageBar>}
                                        {SLDeleteMessageBar &&
                                            <MessageBar messageBarType={MessageBarType.success}>
                                                <div className="inputText">Location has been deleted successfully!</div>
                                            </MessageBar>}
                                        {SLExistsMessageBar &&
                                            <MessageBar messageBarType={MessageBarType.error}>
                                                <div className="inputText">{SublocationExists}</div>
                                            </MessageBar>}
                                    </div>
                                    {subLocations.map((item, index) => (
                                        <div className="dflex mb-2 mt-2" style={{ alignItems: "center" }}>
                                            <TextField
                                                value={item.Title}
                                                onChange={(e, newValue) => handleLocationChange(index, newValue || "")}
                                                styles={{
                                                    fieldGroup: {
                                                        minWidth: "400px",
                                                        maxWidth: "400px",
                                                    },
                                                }}
                                            />
                                            <Link
                                                className={`actionBtn iconSize ${isButtonDisabled ? 'btnGrey' : 'btnGreen'} dticon ml-10`}
                                                onClick={handleSaveSL}
                                                disabled={isButtonDisabled}
                                                style={{ textAlign: "center" }}
                                            >
                                                <TooltipHost content={"Save Location"} id={`tooltip-${item.Title}`}>
                                                    <FontAwesomeIcon icon="save" />
                                                </TooltipHost>
                                            </Link>
                                        </div>

                                    ))}
                                    {/* hide Location Grid in Equipment tab*/}
                                    <>
                                        <div className="mt-3">{!SubLocation && <NoRecordFound />}</div>
                                        {!!SubLocation && SubLocation?.length > 0 && (
                                            <table className="custom-table-ans">
                                                <thead>
                                                    <tr>
                                                        <th className="custom-header-ans w-70" style={{ minWidth: '400px' }}><b>Location</b></th>
                                                        <th className="custom-header-ans"><b>Action</b></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {SubLocation?.length > 0 && SubLocation?.map((item: any, index: number) => (
                                                        <tr key={item.ID}>
                                                            <td className="custom-cell-ans">
                                                                <h4>{item.Title} </h4>
                                                            </td>

                                                            <td className="custom-cell-ans custom-cell-ans-mw-save">
                                                                <Link
                                                                    className="actionBtn iconSize btnDanger dticon"
                                                                    onClick={() => onClickDeleteSubLocation(item)}
                                                                >
                                                                    <TooltipHost content={"Delete Location"} id={`tooltip-${item.Title}`}>
                                                                        <FontAwesomeIcon icon="trash" />
                                                                    </TooltipHost>
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}</>
                                </div>
                                <DialogFooter>
                                    <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickNo} />
                                </DialogFooter>
                            </Popup >
                        </FocusTrapZone >
                    </Popup >
                </Layer >
            )
        }
        <Panel
            isOpen={isPrintSettingsPanelOpen}
            onDismiss={() => setIsPrintSettingsPanelOpen(false)}
            headerText="Print Configuration"
            closeButtonAriaLabel="Close"
            isLightDismiss
        >
            <SiteSettingsToggles
                toggleValues={{
                    Periodic: IsPeriodic,
                    HelpDesk: IsHelpDesk,
                    ClientResponse: IsClientResponse,
                    JobControlChecklist: IsJobControlChecklist,
                    ManageEvents: IsManageEvents,
                    IsResourceRecovery: IsResourceRecovery,
                    SSWasteReport: IsSSWasteReport,
                    AmenitiesFeedbackForm: IsAmenitiesFeedbackForm,
                    IsDailyCleaningDuties: IsDailyCleaningDuties,
                }}
                isAdmin={currentUserRoleDetail.isAdmin}
                onToggleChange={(field: any, value: any) => {
                    switch (field) {
                        case 'Periodic':
                            setIsPeriodic(value);
                            break;
                        case 'HelpDesk':
                            setIsHelpDesk(value);
                            break;
                        case 'ClientResponse':
                            setIsClientResponse(value);
                            break;
                        case 'JobControlChecklist':
                            setIsJobControlChecklist(value);
                            break;
                        case 'ManageEvents':
                            setIsManageEvents(value);
                            break;
                        case 'IsResourceRecovery':
                            setIsResourceRecovery(value);
                            break;
                        case 'SSWasteReport':
                            setIsSSWasteReport(value);
                            break;
                        case 'AmenitiesFeedbackForm':
                            setIsAmenitiesFeedbackForm(value);
                            break;
                        case 'IsDailyCleaningDuties':
                            setIsDailyCleaningDuties(value);
                            break;
                    }
                    setNewFromObj(prev => ({
                        ...prev,
                        [field]: value,
                    }));
                }}
            />
            <div style={{ marginTop: 20 }}>
                <PrimaryButton
                    text={'Save'}
                    onClick={state.isaddNewSite ? onClickSave : onClickUpdate}
                    className="btn btn-primary"
                    style={{ marginRight: 8 }}
                />
                <DefaultButton
                    text="Cancel"
                    onClick={() => setIsPrintSettingsPanelOpen(false)}
                />
            </div>
        </Panel>

    </>

}