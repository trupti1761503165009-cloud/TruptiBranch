/* eslint-disable no-prototype-builtins */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable no-void */
/* eslint-disable react/jsx-key */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { Breadcrumb, DefaultButton, IBasePickerSuggestionsProps, IContextualMenuProps, ITag, Link, mergeStyleSets, MessageBar, MessageBarType, Panel, PanelType, Pivot, PivotItem, PrimaryButton, TagPicker, TextField, TooltipHost } from "@fluentui/react";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { Checkbox, DialogFooter, Dropdown, FocusTrapZone, Icon, IDropdownOption, IPersonaProps, IPivotItemProps, Label, Layer, Overlay, Popup, Toggle } from "office-ui-fabric-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IReactSelectOptionProps } from "../../../../../Interfaces/IReactSelectOptionProps";
import { ActionMeta } from "react-select";
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { IQuayCleanState } from "../../QuayClean";
import { APISiteLink, ComponentNameEnum, getExternalUrl, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum, viewDetailStickHeaders } from "../../../../../Common/Enum/ComponentNameEnum";
import { IErrorLog } from "../../../../../Interfaces/IErrorLog";
import { encryptValue, encryptWasteValue, getCAMLQueryFilterExpression, getPeopleDifferences, getSiteGroupsPermission, getSiteMasterItems, getStateMasterItems2, logGenerator, mapSingleValue, onBreadcrumbItemClicked, removeElementOfBreadCrum, saveThumbNailImage, UserActivityLog } from "../../../../../Common/Util";
import CustomModal from "../../CommonComponents/CustomModal";
import { EquipmentAsset } from "../Asset/EquipmentAsset";
import { IAddNewSiteState, IAddSiteMasterObj, IAssetLocationPermission, IDefaultSelcetdFromItems, ISiteMaster } from "../../../../../Interfaces/IAddNewSite";
import { AssociateChemical } from "../ChemicalManagement/AssociateChemical";
import { toastService } from "../../../../../Common/ToastService";
import { Loader } from "../../CommonComponents/Loader";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { IcurrentloginDetails } from "../../CommonComponents/HeaderComponent";
import { HelpDeskList } from "../HelpDesk/HelpDeskList";
import { ManagePeriodicList } from "../Preodic/ManagePeriodicList";
import { ClientResponseList } from "../ClientResponse/ClientResponseList";
import { DocumentsLib } from "../ChemicalManagement/DocumentsLib";
import { AuditReports } from "../AuditReport/AuditReports";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { AssignedTeam } from "../AssignTeam/AssignedTeam";
import { ViewJobControlChecklist } from "../CheckList/ViewJobControlChecklist";
import { IMS } from "../IMS/IMS";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import { useAtom, useAtomValue } from "jotai";
import { appGlobalStateAtom, appSiteStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { Events } from "../Events/Events";
import QRCode from 'qrcode';
import moment from "moment";
import { QuayCleanChoices } from "../../../../../Common/QuayCleanChoices";
import CamlBuilder from "camljs";
import { DataType, items } from "../../../../../Common/Constants/CommonConstants";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { ManageSitesCrud } from "../ManageSites/Groups/ManageSitesCrud/ManageSitesCrud";
import { Reports } from "../Reports/Reports";
import axios from "axios";
import { SitePageName, WasteReportPivot, WasteReportViewFields } from "../../../../../Common/Enum/WasteReportEnum";
import { WasteReportLink } from "../WasteReportLink/WasteReportLink";
import { SynergySessions } from "../Synergy Sessions/SynergySessions";
import { PoliciesandProcedures } from "../Synergy Sessions/PoliciesandProcedures";
import { AmenitiesFeedbackFormLink } from "../AmenitiesFeedbackFormLink/AmenitiesFeedbackFormLink";
import { Messages } from "../../../../../Common/Constants/Messages";
import { DailyCleaningDutisPageLink } from "../DailyCleaningDutisPageLink/DailyCleaningDutisPageLink";
import { SiteSettingsToggles } from "./SiteSettingsToggles";
import { ResourceRecovery } from "../ResourceRecovery/ResourceRecovery";
import { ClientResponseIssueList } from "../QRClientResponse/ClientResponseIssueList";
import { ISelectedZoneDetails } from "../../../../../Interfaces/ISelectedZoneDetails";
import { QuayCleanSimpleListDropdown } from "../../../../../Common/Filter/QuayCleanSimpleListDropdown";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/sitelogo.jpg');
const QCHeader = require('../../../../quayClean/assets/images/QCHeader.png');
export interface IAddNewSiteProps {
    provider: IDataProvider;
    componentProps: IQuayCleanState,
    context: WebPartContext;
    isAddNewSite?: boolean;
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

const breakDownByOptions: any = [
    { label: "Diversion Rate", value: "Diversion Rate" },
    { label: "By Cost", value: "By Cost" },
    { label: "Opera House", value: "Opera House" }
];


export const AddNewSite = (props: IAddNewSiteProps) => {
    const { provider, isAddNewSite, manageComponentView, siteMasterId, siteName } = props;
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail } = appGlobalState;
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [IsSupervisor, setIsSupervisor] = React.useState<boolean>(false);
    const [selectedKey, setselectedKey] = React.useState<any>(props.pivotName ? props.pivotName : "SiteKey");
    // const [selectedKey, setselectedKey] = React.useState<any>("EquipmentKey");
    const cogTooltipId = useId('cogTooltip');
    const tooltipId = useId('tooltip');
    const [newFromObj, setNewFromObj] = React.useState<IAddSiteMasterObj>();
    const [oldProductUrl, setOldProductUrl] = React.useState<string>("");
    const [oldHeaderUrl, setOldHeaderUrl] = React.useState<string>("");
    const [displayerror, setdisplayerror] = React.useState<boolean>(false);
    const [displaysiteerror, setdisplaysiteerror] = React.useState<boolean>(false);
    const [displaysiteerror2, setdisplaysiteerror2] = React.useState<boolean>(false);
    const [isCategoryDisable, setIsCategoryDisable] = React.useState<boolean>(true);
    const [SLSucessMessageBar, setSLSucessMessageBar] = React.useState<boolean>(false);
    const [SLDeleteMessageBar, setSLDeleteMessageBar] = React.useState<boolean>(false);
    const [SLExistsMessageBar, setSLExistsMessageBar] = React.useState<boolean>(false);
    const [keyUpdateCategoryOptions, setKeyUpdateCategoryOptions] = React.useState<number>(Math.random());
    const [ExistingSiteLink, setExistingSiteLink] = React.useState<string>("");
    const [width, setWidth] = React.useState<string>("650px");
    const [JobCode, setJobCode] = React.useState<string>("");
    const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);
    const [SiteData, setSiteData] = React.useState<any>();
    let CurrentRefSiteName = React.useRef<any>();
    let PivotData = React.useRef<any>([]);
    const [selectedUsers, setselectedUsers] = React.useState<any[]>([]);
    const [selectedUsers2, setselectedUsers2] = React.useState<any[]>([]);
    const [selectedADUsers2, setselectedADUsers2] = React.useState<any[]>([]);
    const [Users, setUsers] = React.useState<number[]>([]);
    const [Users2, setUsers2] = React.useState<number[]>([]);
    const [ADUsers2, setADUsers2] = React.useState<number[]>([]);
    let HidePivot = React.useRef<boolean>(false);
    const [IsPivot, setIsPivot] = React.useState<boolean>(false);
    const isVisibleReport = React.useRef<boolean>(false);
    const [OldSM, setOldSM] = React.useState<any[]>([]);
    const [OldSS, setOldSS] = React.useState<any[]>([]);
    const [NewSM, setNewSM] = React.useState<any[]>([]);
    const [NewSS, setNewSS] = React.useState<any[] | null>(null);
    const [StateName, setStateName] = React.useState<any>("");
    let CurrentStateName = React.useRef<any>();
    let uniqueJobCode = React.useRef<any>();
    let initialSelectedTags: any = [];
    const [isNewDocument, setisNewDocument] = React.useState<boolean>(false);
    const [isNewDocumentPaP, setisNewDocumentPaP] = React.useState<boolean>(false);
    const [isPrintSettingsPanelOpen, setIsPrintSettingsPanelOpen] = React.useState(false);
    const permissionArray = React.useRef<any>(undefined);

    const onClickPrintConfigurationOpen = () => {
        setIsPrintSettingsPanelOpen(true);
    };
    const selectedZoneDetails: any = {
        selectedSitesId: [640, 628, 623, 584, 580, 563, 543, 542, 524, 521, 496, 469, 464],
        selectedSites: [
            { Id: 1, QCStateId: 7, SiteName: "Sydney Showground", State: "NSW" },
            { Id: 2, QCStateId: 6, SiteName: "Melbourne Cricket Ground", State: "QLD" },
            { Id: 3, QCStateId: 9, SiteName: "Sydney Showground", State: "VIC" },
        ]
    };
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
        SiteCategoryId: undefined,
        sitenamestr: "",
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
    const [selectedWasteUsers, setselectedWasteUsers] = React.useState<any[]>([]);
    const [isPopupVisibleWaste, { setTrue: showPopupWaste, setFalse: hidePopupWaste }] = useBoolean(false);
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
    const [qrCodeSrc, setQrCodeSrc] = React.useState<string>('');
    const [subLocations, setSubLocations] = React.useState([{ Title: '', SiteNameId: props?.siteMasterId }]);
    const isButtonDisabled = subLocations.some(item => item.Title.trim() === '');
    const [jobApiFailed, setJobApiFailed] = React.useState<boolean>(false);
    const [showJobCodeFailedMessageBar, setshowJobCodeFailedMessageBar] = React.useState<boolean>(false);
    const handleLocationChange = (index: number, value: string) => {
        const updated = [...subLocations];
        updated[index].Title = value;
        setSubLocations(updated);
    };

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
        setSubLocations([{ Title: '', SiteNameId: props?.siteMasterId }]);
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
        setSubLocations([{ Title: '', SiteNameId: props?.siteMasterId }]);
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

            const siteId = props?.siteMasterId;
            const stateId = props?.componentProp?.dataObj?.StateId;
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

            const siteId = props?.siteMasterId;
            const stateId = props?.componentProp?.dataObj?.StateId;
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
    const fetchMicrokeeperLink = (): Promise<any[]> => {
        const select = ["ID,Title,IsActive,URL"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            filter: `IsActive eq 1`,
            listName: ListNames.MicrokeeperLink,
        };
        return props.provider.getItemsByQuery(queryStringOptions);
    };

    const fetchJobsData = async (): Promise<any[]> => {
        try {
            const links = await fetchMicrokeeperLink();
            if (!links || links.length === 0) {
                setJobApiFailed(true);
                return [];
            }
            const url = links[0]?.URL?.Url;
            const batchSize = 15000;
            const initParams = {
                page: 1,
                rowNumber: 1,
                sortRowName: "Title",
                sortRowDirection: "asc",
                jobSearch: "",
            };

            const initResp = await axios.post(`${url}/api/Microkeeper/GetJobsData`, initParams);
            const totalRecords = initResp?.data?.value?.noOfRecords || 0;
            const totalPages = Math.ceil(totalRecords / batchSize);

            const requests: Promise<any>[] = [];
            for (let page = 1; page <= totalPages; page++) {
                const params = {
                    page,
                    rowNumber: batchSize,
                    sortRowName: "Title",
                    sortRowDirection: "asc",
                    jobSearch: "",
                };
                requests.push(axios.post(`${url}/api/Microkeeper/GetJobsData`, params));
            }

            const responses = await Promise.all(requests);
            setJobApiFailed(false);
            return responses.flatMap(res => res?.data?.value?.jobs || []);
        } catch (error) {
            setJobApiFailed(true);
            const errorObj = {
                ErrorMethodName: "fetchJobsData",
                CustomErrormessage: "Error fetching jobs from Microkeeper API",
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                PageName: "QuayClean.aspx"
            };
            void logGenerator(props.provider, errorObj);
            return [];
        }
    };
    // const fetchJobsData = async (): Promise<any[]> => {

    //     const batchSize = 15000;
    //     const initParams = {
    //         page: 1,
    //         rowNumber: 1,
    //         sortRowName: "Title",
    //         sortRowDirection: "asc",
    //         jobSearch: "",
    //     };
    //     let url = APISiteLink.Microkeeper;
    //     try {
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
    //         const errorObj = { ErrorMethodName: "fetchJobsData", CustomErrormessage: "error in get Job code form Microkeeper api", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
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


    const tagItems: ITag[] = uniqueJobCode.current?.map((item: any) => ({ key: item, name: item }));
    // const initialSelectedTags: ITag[] = JobCode
    //    ?.split(',')
    //    ?.map((code: any) => code.trim())
    //    ?.filter((code: any) => code.length > 0)
    //    ?.map((code: any) => ({ key: code, name: code }));
    const [selectedTags, setSelectedTags] = React.useState<ITag[]>(initialSelectedTags);

    const suggestionProps: IBasePickerSuggestionsProps = {
        suggestionsHeaderText: 'Suggested Job Codes',
        noResultsFoundText: 'No matching job code',
    };



    const filterSuggestions = (filterText: string, selectedItems: ITag[]): ITag[] => {
        if (jobApiFailed) {
            if (filterText?.trim()) {
                const toastId = toastService.loading("Loading job data...");
                toastService.showError(toastId, Messages.Jobdatafailed);
            }
            return [];
        }
        if (!filterText) return [];

        return tagItems?.filter(tag => tag?.name?.startsWith(filterText)).filter(tag => !selectedTags?.some(selected => selected.key === tag.key));
    };

    const createGenericTag = (input: string): ITag => {
        const trimmed = input?.trim();
        const isValid = /^[0-9]+(\.[0-9]+)?$/.test(trimmed); // Only allow numbers / decimal

        return isValid ? { key: trimmed, name: trimmed } : { key: '', name: '' };
    };

    const onChange = (items: ITag[] | undefined): void => {
        if (jobApiFailed) {
            const toastId = toastService.loading("Loading job data...");
            toastService.showError(toastId, Messages.Jobdatafailed);
            return;
        }
        const updated = items?.filter(tag => tag.key !== '') || [];
        setSelectedTags(updated);

        const selectedString = updated?.map(tag => tag.name)?.join(', ');
        setNewFromObj((prev: any) => ({
            ...prev,
            JobCode: selectedString
        }));
    };

    React.useEffect(() => {
        if (props?.siteMasterId) {
            SynergySessionsData();
            PoliciesandProceduresData();
        }
        try {
            void (async () => {
                setIsLoading(true);

                const fetched = await fetchJobsData();
                const uniqueTitles = getUniqueTitlePrefixes(fetched);
                uniqueJobCode.current = uniqueTitles;
            })();
        } catch (error) {
            setIsLoading(false);
            console.log(error);
        }
    }, []);

    // React.useEffect(() => {
    //     const initialSelected: ITag[] = JobCode
    //        ?.split(',')
    //        ?.map((code: any) => code.trim())
    //        ?.filter((code: any) => code.length > 0)
    //        ?.map((code: any) => ({ key: code, name: code }));
    //     setSelectedTags(initialSelected);
    // }, [JobCode]);

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
        if (props.siteMasterId &&
            !props.loginUserRoleDetails.isAdmin &&
            !props.loginUserRoleDetails.isStateManager &&
            props.loginUserRoleDetails?.siteManagerItem.filter(r => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(props.loginUserRoleDetails.Id) > -1).length === 0 &&
            props.loginUserRoleDetails.isSiteSupervisor) {
            setIsLoading(true);
            try {
                const select = ["ID,SupervisorId,Permission,SiteNameId"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    listName: ListNames.SiteSupervisorPermission,
                    filter: `SiteNameId eq '${props.siteMasterId}' and SupervisorId eq '${props?.componentProp?.loginUserRoleDetails?.Id}'`
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


    function _onChangePeriodic(ev: React.MouseEvent<HTMLElement>, checked?: boolean) {
        if (checked !== undefined) {
            setIsPeriodic(checked);
            setNewFromObj((prevState: any) => ({ ...prevState, Periodic: checked }));
        }
    }
    function _onChangeHelpDesk(ev: React.MouseEvent<HTMLElement>, checked?: boolean) {
        if (checked !== undefined) {
            setIsHelpDesk(checked);
            setNewFromObj((prevState: any) => ({ ...prevState, HelpDesk: checked }));
        }
    }
    function _onChangeClientResponse(ev: React.MouseEvent<HTMLElement>, checked?: boolean) {
        if (checked !== undefined) {
            setIsClientResponse(checked);
            setNewFromObj((prevState: any) => ({ ...prevState, ClientResponse: checked }));
        }
    }
    function _onChangeJobControlChecklist(ev: React.MouseEvent<HTMLElement>, checked?: boolean) {
        if (checked !== undefined) {
            setIsJobControlChecklist(checked);
            setNewFromObj((prevState: any) => ({ ...prevState, JobControlChecklist: checked }));
        }
    }
    function _onChangeManageEvents(ev: React.MouseEvent<HTMLElement>, checked?: boolean) {
        if (checked !== undefined) {
            setIsManageEvents(checked);
            setNewFromObj((prevState: any) => ({ ...prevState, ManageEvents: checked }));
        }
    }
    function _onChangeIsResourceRecovery(ev: React.MouseEvent<HTMLElement>, checked?: boolean) {
        if (checked !== undefined) {
            setIsResourceRecovery(checked);
            setNewFromObj((prevState: any) => ({ ...prevState, IsResourceRecovery: checked }));
        }
    }
    function _onChangeELearning(ev: React.MouseEvent<HTMLElement>, checked?: boolean) {
        if (checked !== undefined) {
            setNewFromObj((prevState: any) => ({ ...prevState, eLearning: checked }));
            setELearning(checked)
        }
    }
    function _onChangeSSWasteReport(ev: React.MouseEvent<HTMLElement>, checked?: boolean) {
        if (checked !== undefined) {
            setIsSSWasteReport(checked);
            setNewFromObj((prevState: any) => ({ ...prevState, SSWasteReport: checked }));
        }
    }
    function _onChangeAmenities(ev: React.MouseEvent<HTMLElement>, checked?: boolean) {
        if (checked !== undefined) {
            setIsAmenitiesFeedbackForm(checked);
            setNewFromObj((prevState: any) => ({ ...prevState, AmenitiesFeedbackForm: checked }));
        }
    }
    function _onChangeDailyCleaningDuties(ev: React.MouseEvent<HTMLElement>, checked?: boolean) {
        if (checked !== undefined) {
            setIsDailyCleaningDuties(checked);
            setNewFromObj((prevState: any) => ({ ...prevState, IsDailyCleaningDuties: checked }));
        }
    }
    const getUsersPeoplePicker = (items: any[]) => {
        let PersonList: number[] = items.map((person) => {
            return person.id;
        });
        let Person: number[] = items.map((person) => {
            return person.secondaryText;
        });
        setselectedWasteUsers(Person);
        setNewFromObj((prevState: any) => ({ ...prevState, UsersId: PersonList ? PersonList : [] }));
    };

    const onChnageBreakDownBy = (option: IReactSelectOptionProps, actionMeta: ActionMeta<any>): void => {
        setNewFromObj((prevState: any) => ({ ...prevState, BreakDownBy: option.value }));

    };

    function _onChangeSubLocation(ev: React.MouseEvent<HTMLElement>, checked?: boolean) {
        if (checked !== undefined) {
            setIsSubLocation(checked);
            setNewFromObj((prevState: any) => ({ ...prevState, SubLocation: checked }));
        }
    }

    const onClickCancel = () => {
        hidePopup();
    }
    const onancelclick = () => {
        SetState(prev => ({ ...prev, isAssetLocationOpen: false }))
    }
    const _userActivityLog = async () => {
        setIsLoading(true);
        try {
            let orgSiteId = props.componentProp.siteMasterId || props.siteMasterId;
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
                    StateId: newFromObj?.QCStateId || props?.componentProp?.dataObj?.StateId,
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

    const _manageSubLocation = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,SiteNameId,IsActive"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.AssetLocationChoices,
                filter: `SiteNameId eq '${props.siteMasterId}' and IsActive eq 1`
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
                filter: `SiteNameId eq '${props.siteMasterId}'`
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

            filterFields.push({
                fieldName: "SiteName",
                fieldValue: props.siteMasterId,
                fieldType: FieldType.LookupById,
                LogicalType: LogicalType.EqualTo
            });
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
            SiteNameId: Number(props.siteMasterId)
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

    const onChangeExistingSiteLink = (event: any): void => {
        setExistingSiteLink(event.target.value);
        setNewFromObj((prevState: any) => ({ ...prevState, ExistingSiteLink: event.target.value || "" }));
        if (event.target.value == "" || event.target.value == undefined) {
            setdisplayerror(false);
        }
        const enteredValue = event.target.value;
        const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
        if (!enteredValue || urlPattern.test(enteredValue)) {
            setdisplayerror(false);
        } else {
            setdisplayerror(true);
        }
    };

    const onChangeSafetyCulture = (event: any): void => {
        const value = event.target.value || "";
        setNewFromObj((prevState: any) => ({ ...prevState, SCSiteId: value }));
    };

    const onChangeJobCode = (event: any): void => {
        const value = event.target.value;
        const digitsOnly = value.replace(/\D/g, ''); // Remove non-digit characters
        setJobCode(digitsOnly);
        setNewFromObj((prevState: any) => ({ ...prevState, JobCode: digitsOnly }));
    };

    const getStateMasterItems = async () => {
        const queryOptions: IPnPQueryOptions = {
            listName: ListNames.StateMaster,
        };
        return await provider.getItemsByQuery(queryOptions);
    };

    const onSiteNameSelect = async (option: IReactSelectOptionProps, actionMeta: any): Promise<void> => {
        try {
            const selectditems = state.siteMasterItems.filter((items: ISiteMaster) => items.Id == option.value)[0];
            setDefaultSelcetdFromItems((prevProps: any) => ({
                ...prevProps, siteName: option.value, qCState: selectditems.qCStateId, siteManager: selectditems.siteManagerEmail, siteSupervisor: selectditems.siteSupervisorEmail, aDUser: selectditems.aDUserEmail, Id: selectditems.Id, SiteImage: selectditems.siteImageUrl, SiteHeader: selectditems.siteHeaderUrl, ExistingSiteLink: selectditems.ExistingSiteLink,
                JobCode: selectditems.JobCode,
                Category: selectditems.Category,
                SiteCategoryId: selectditems.SiteCategoryId
            }));

            SetState((prevState: any) => ({ ...prevState, isdisableField: false }));
            // setExistingSiteLink(selectditems.ExistingSiteLink?.toString);
        } catch (error) {
            const errorObj = { ErrorMethodName: "onSiteNameSelect", CustomErrormessage: "error in on site name", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const onDynamicSiteManager = (option: IReactSelectOptionProps, actionMeta: ActionMeta<any>): void => {
        setNewFromObj((prevState: any) => ({ ...prevState, DynamicSiteManagerId: option?.value || null }));
    };

    const onChnageUser = (items: IPersonaProps[]): void => {
        setNewFromObj((prevState: any) => ({ ...prevState, ADUserId: items.length > 0 ? items[0].id : 0 }));
    };

    const onSiteNameChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setNewFromObj((prevState: any) => ({ ...prevState, Title: newValue }));
        if (newValue == "") {
            setdisplaysiteerror2(true);
        } else {
            setdisplaysiteerror2(false);
        }
        const trimmedValue = newValue?.trim() || '';
        const lowerTrimmedValue = trimmedValue.toLowerCase();
        const lowerDefaultSiteName = defaultSelcetdFromItems.sitenamestr?.trim().toLowerCase() || '';
        const currentSiteNames = CurrentRefSiteName?.current?.map((name: any) => name.toLowerCase()) || [];

        if (currentSiteNames.includes(lowerTrimmedValue) && lowerDefaultSiteName !== lowerTrimmedValue) {
            setdisplaysiteerror(true);
        } else {
            setdisplaysiteerror(false);
            setNewFromObj((prevState) => ({ ...prevState, Title: newValue }));
        }


        // if (CurrentRefSiteName?.current.includes(trimmedValue) && defaultSelcetdFromItems.sitenamestr !== newValue) {
        //     setdisplaysiteerror(true);
        // } else {
        //     setdisplaysiteerror(false);
        //     setNewFromObj((prevState) => ({ ...prevState, Title: newValue }));
        // }

    };

    const onChnageSiteManger = (items: IPersonaProps[]): void => {
        setNewFromObj((prevState: any) => ({ ...prevState, SiteManagerId: items.length > 0 ? items[0].id : 0 }));
    };

    const getPeoplePickerItems = (items: any[]) => {
        let PersonList: number[] = items.map((person) => {
            return person.id;
        });
        let Person: number[] = items.map((person) => {
            return person.secondaryText;
        });
        setNewSS(items);
        setUsers(PersonList);
        setselectedUsers(Person);
        setNewFromObj((prevState: any) => ({ ...prevState, SiteSupervisorId: PersonList ? PersonList : 0 }));
    };

    const getPeoplePickerItems2 = (items: any[]) => {
        let PersonList: number[] = items.map((person) => {
            return person.id;
        });
        let Person: number[] = items.map((person) => {
            return person.secondaryText;
        });
        const siteManagerOptions = items.map((manager: any) => ({
            key: manager.id,
            value: manager.id,
            text: manager.text || manager.secondaryText,
            label: manager.text || manager.secondaryText,
        }));
        const isManagerExist = items?.find((itm: any) => itm.id === newFromObj?.DynamicSiteManagerId);
        if (!isManagerExist) {
            setNewFromObj((prevState: any) => ({ ...prevState, DynamicSiteManagerId: null }));
        }
        SetState((prevState: any) => ({ ...prevState, DynamicSiteManagerOptions: siteManagerOptions }));

        setNewSM(items);
        setUsers2(PersonList);
        setselectedUsers2(Person);
        setNewFromObj((prevState: any) => ({ ...prevState, SiteManagerId: PersonList ? PersonList : 0 }));
    };

    const getPeoplePickerItemsADUser = (items: any[]) => {
        let PersonList: number[] = items.map((person) => {
            return person.id;
        });
        let Person: number[] = items.map((person) => {
            return person.secondaryText;
        });
        setADUsers2(PersonList);
        setselectedADUsers2(Person);
        setNewFromObj((prevState: any) => ({ ...prevState, ADUserId: PersonList ? PersonList : 0 }));
    };

    const onChnageSiteSupervisor = (items: IPersonaProps[]): void => {
        setNewFromObj((prevState: any) => ({ ...prevState, SiteManagerId: items.length > 0 ? items[0].id : 0 }));
    };

    const onChnageState = (option: IReactSelectOptionProps, actionMeta: ActionMeta<any>): void => {
        setDefaultSelcetdFromItems((prevState: any) => ({ ...prevState, qCState: option.value }));
        setNewFromObj((prevState: any) => ({ ...prevState, QCStateId: option.value }));
        setIsCategoryDisable(false);
        setKeyUpdateCategoryOptions(Math.random())
        setNewFromObj((prevState: any) => ({
            ...prevState,
            CategoryId: undefined,
            Category: undefined
        }));
    };

    // const onChangeCategory = (value: string): void => {
    //     setNewFromObj((prevState: any) => ({ ...prevState, Category: value }));
    // };


    const onAddNewClick = (): void => {
        setselectedUsers2([]);
        setselectedADUsers2([]);
        setselectedUsers([]);
        SetState((prevState: any) => ({ ...prevState, isaddNewSite: true, isdisableField: false }));
        setDefaultSelcetdFromItems((prevState: any) => ({
            ...prevState, siteManager: [], siteSupervisor: [], siteName: 0, aDUser: 0, qCState: 0
        }));
    };

    const onEditClickSite = (): void => {
        SetState((prevState: any) => ({ ...prevState, isEditSite: true, isdisableField: false }));
    };

    const errorMessageGenrate = (item?: any): void => {
        const error: any[] = [];
        if (displaysiteerror2) {
            error.push(<div>Site Name is required</div>);
        }
        if (displaysiteerror) {
            error.push(<div>This site name already exists. Please choose a different name.</div>);
        }
        let errormessage: any;
        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                switch (key) {
                    case "Title":
                        error.push(<div>Site Name is required</div>);
                        break;
                    case "SiteManagerId":
                        error.push(<div>Site Manager is required</div>);
                        break;
                    case "QCStateId":
                        error.push(<div>State is required qqq</div>);
                        break;
                    // case "SiteImageFile":
                    //     error.push(<div>Site Logo is required</div>);
                    //     break;
                    // case "SiteImage":
                    //     error.push(<div>Site Logo is required</div>);
                    //     break;
                    // case "SiteHeaderFile":
                    //     error.push(<div>Site Header is required</div>);
                    //     break;
                    // case "SiteHeader":
                    //     error.push(<div>Site Header is required</div>);
                    //     break;
                    case "UsersId":
                        error.push(<div>Users are required</div>);
                        break;
                    case "BreakDownBy":
                        error.push(<div>Break Down By is required</div>);
                        break;
                    default:
                        break;
                }
            }
        }
        errormessage = <><ul>{error.map((i: any) => {
            return <li className="errorPoint">{i}</li>;
        })}</ul></>;
        return errormessage;
    };

    const _onClickDeleteUploadFile = () => {
        SetState(prevState => ({ ...prevState, isEditSiteImageDeleted: true }));
        setOldProductUrl(defaultSelcetdFromItems.SiteImage);
        setDefaultSelcetdFromItems(prevState => ({ ...prevState, SiteImage: "" }));
        setNewFromObj((prevState: any) => ({ ...prevState, SiteImage: "", SiteImageThumbnailUrl: "" }));
    };

    const _onClickDeleteUploadFileHeader = () => {
        SetState(prevState => ({ ...prevState, isEditSiteHeaderDeleted: true }));
        setOldHeaderUrl(defaultSelcetdFromItems.SiteHeader);
        setDefaultSelcetdFromItems(prevState => ({ ...prevState, SiteHeader: "" }));
        setNewFromObj((prevState: any) => ({ ...prevState, SiteHeader: "", SiteHeaderThumbnailUrl: "" }));
    };

    const siteFileSave = async (file: any) => {
        try {
            setIsLoading(true);
            if (state.isaddNewSite || state.isEditSiteImageDeleted) {
                let data = await saveThumbNailImage(props.provider, file, ListNames.QuaycleanAssets);
                setNewFromObj(prevState => ({ ...prevState, SiteImage: data.Photo, SiteImageThumbnailUrl: data.EncodedAbsThumbnailUrl }));
                setIsLoading(false);
                return data.Photo;
            } else {
                if (!!oldProductUrl) {
                    let data = await saveThumbNailImage(props.provider, file, ListNames.QuaycleanAssets, true, oldProductUrl);
                    setNewFromObj(prevState => ({ ...prevState, SiteImage: data.Photo, SiteImageThumbnailUrl: data.EncodedAbsThumbnailUrl }));
                    setIsLoading(false);
                    return data.Photo;
                } else {
                    let data = await saveThumbNailImage(props.provider, file, ListNames.QuaycleanAssets);
                    setNewFromObj(prevState => ({ ...prevState, SiteImage: data.Photo, SiteImageThumbnailUrl: data.EncodedAbsThumbnailUrl }));
                    setIsLoading(false);
                    return data.Photo;
                }
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error);
        }
    };

    const siteFileSaveHeader = async (file: any) => {
        try {
            setIsLoading(true);
            if (state.isaddNewSite || state.isEditSiteHeaderDeleted) {
                let data = await saveThumbNailImage(props.provider, file, ListNames.QuaycleanAssets);
                setNewFromObj(prevState => ({ ...prevState, SiteHeader: data.Photo, SiteHeaderThumbnailUrl: data.EncodedAbsThumbnailUrl }));
                setIsLoading(false);
                return data.Photo;
            } else {
                if (!!oldHeaderUrl) {
                    let data = await saveThumbNailImage(props.provider, file, ListNames.QuaycleanAssets, true, oldHeaderUrl);
                    setNewFromObj(prevState => ({ ...prevState, SiteHeader: data.Photo, SiteHeaderThumbnailUrl: data.EncodedAbsThumbnailUrl }));
                    setIsLoading(false);
                    return data.Photo;
                }
                else {
                    let data = await saveThumbNailImage(props.provider, file, ListNames.QuaycleanAssets);
                    setNewFromObj(prevState => ({ ...prevState, SiteHeader: data.Photo, SiteHeaderThumbnailUrl: data.EncodedAbsThumbnailUrl }));
                    setIsLoading(false);
                    return data.Photo;
                }
            }
        } catch (error) {
            setIsLoading(false);
            console.log(error);
        }
    };

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

                    // if (isEmpty) {
                    //     // Mark that at least one field is empty
                    //     const fieldLabel = fieldLabelMap[field] || field;
                    //     validationErrors.push(`<li class="errorPoint">${fieldLabel} is required</li>`);
                    // } else {
                    //     allFieldsEmpty = false;
                    // }
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
                StateId: newFromObj?.QCStateId || props?.componentProp?.dataObj?.StateId,
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

    const onClickClose = (): void => {
        SetState(prevState => ({ ...prevState, isEditSiteImageDeleted: false }));
        // setOldProductUrl(defaultSelcetdFromItems.SiteImage);
        // setDefaultSelcetdFromItems(prevState => ({ ...prevState, SiteImage: "" }));
        setNewFromObj((prevState: any) => ({ ...prevState, SiteImage: oldProductUrl }));

        SetState(prevState => ({ ...prevState, isEditSiteHeaderDeleted: false }));
        // setOldHeaderUrl(defaultSelcetdFromItems.SiteHeader);
        // setDefaultSelcetdFromItems(prevState => ({ ...prevState, SiteHeader: "" }));
        setNewFromObj((prevState: any) => ({ ...prevState, SiteHeader: oldHeaderUrl }));


        if (props.isAddNewSite) {
            manageComponentView({
                currentComponentName: ComponentNameEnum.ViewSite, viewSelectedADUsersFilter: props?.componentProps?.viewSelectedADUsersFilter,
                viewSelectedSiteManagersFilter: props?.componentProps?.viewSelectedSiteManagersFilter,
                viewSelectedSiteTitlesFilter: props?.componentProps?.viewSelectedSiteTitlesFilter,
                viewSelectedStateFilter: props?.componentProps?.viewSelectedStateFilter,
                viewSelectedSCSitesFilter: props?.componentProps?.viewSelectedSCSitesFilter,
                viewSelectedSiteIdsFilter: props?.componentProps?.viewSelectedSiteIdsFilter,
            });
        } else {
            SetState(prevState => ({ ...prevState, isUpdateShowDetailOnly: true, isShowDetailOnly: true, isUpdateNewSite: false, isAddNewSite: false, isEditSite: false }));
        }
    };

    const _onLinkClick = (item: PivotItem): void => {
        setselectedKey(item.props.itemKey);
    };

    const handleSupervisorPermissionChange = (SupervisorPermissionIds: string[]): void => {
        console.log('Selected Supervisor Permissions:', SupervisorPermissionIds);
        setSelectedPermissions(SupervisorPermissionIds);
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
            filter: `SiteNameId eq '${props.siteMasterId}'`
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
                        const oldFilterUrl = `${props.context.pageContext.web.serverRelativeUrl}/${"SiteDocuments"}/${props.siteName}`;
                        const oldFilterUrlResourceRecovery = `${props.context.pageContext.web.serverRelativeUrl}/${ListNames.ResourceRecovery}/${props.siteName}`;
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
                        StateId: props?.componentProp?.dataObj?.StateId || newFromObj?.QCStateId,
                        Details: `Update Site ${response?.Title}`
                    };
                    void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
                    if (props?.siteMasterId) {
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
                        currentComponentName: ComponentNameEnum.AddNewSite, dataObj: Data, siteMasterId: state.viewSiteItem?.Id, isShowDetailOnly: true, siteName: state.viewSiteItem?.siteName, qCState: state.viewSiteItem?.qCState, breadCrumItems: breadCrumItems
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

    // Added this Function to Update StateNameValue column Data to All Sites - Ashish Prajapati(04-11-2025)
    // const updateAllStateNameValues = async () => {
    //     try {
    //         console.log("🔄 Starting bulk update of StateNameValue...");

    //         // Step 1: Get all items from SitesMaster list
    //         const allItems = await props.provider.getAllItems({
    //             listName: ListNames.SitesMaster,
    //             select: ["Id", "QCStateId", "Title"],
    //         });

    //         if (!allItems || allItems.length === 0) {
    //             console.log("No items found in SitesMaster list.");
    //             return;
    //         }

    //         console.log(`📄 Found ${allItems.length} items. Preparing updates...`);

    //         // Step 2: Build array of update objects
    //         const updateObjects = allItems
    //             .map((item: any) => {
    //                 const stateName = getStateNameFromId(item?.QCStateId);
    //                 if (!stateName) {
    //                     console.log(`Skipping item ID ${item.Id}: No state name found for QCStateId ${item.QCStateId}`);
    //                     return null;
    //                 }

    //                 return {
    //                     Id: item.Id,
    //                     StateNameValue: stateName,
    //                 };
    //             })
    //             .filter((x) => x !== null);

    //         if (updateObjects.length === 0) {
    //             console.log("⚠️ No valid updates to process.");
    //             return;
    //         }

    //         console.log(`🛠️ Updating ${updateObjects.length} items in batches...`);

    //         // Step 3: Use your existing provider method to update in batch
    //         await props.provider.updateListItemsInBatchPnP(ListNames.SitesMaster, updateObjects);

    //         console.log("✅ All StateNameValue fields updated successfully!");
    //     } catch (error) {
    //         console.error("❌ Error updating StateNameValue for all items:", error);
    //     }
    // };


    const onSiteFileSelectionChange = async (e: any) => {
        setNewFromObj((prevState: any) => ({ ...prevState, SiteImage: "Image" }));
        try {
            const files = e.target.files;
            let selectedFile: any;
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const timestamp = new Date().getTime();
                    const FileName = file.name.split('.').slice(0, -1).join('.');
                    const ExtensionName = file.name.split('.').pop();
                    const CreatorName = `${timestamp}_${FileName}.${ExtensionName}`;
                    // // const previewUrl = URL.createObjectURL(file);
                    // // setNewFromObj(prev => ({ ...prev, SiteImage: previewUrl }));
                    // SetState(prev => ({ ...prev, isEditSiteImageDeleted: false }));
                    selectedFile = {
                        file: file,
                        name: CreatorName,
                        folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/SiteImages`,
                        overwrite: true
                    };
                }
                await siteFileSave(selectedFile);
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "onSiteFileSelectionChange", CustomErrormessage: "error in on file selection change", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const onSiteFileSelectionChangeHeader = async (e: any) => {
        setNewFromObj((prevState: any) => ({ ...prevState, SiteHeader: "Header" }));
        try {
            const files = e.target.files;
            let selectedFile: any;
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const timestamp = new Date().getTime();
                    const FileName = file.name.split('.').slice(0, -1).join('.');
                    const ExtensionName = file.name.split('.').pop();
                    const CreatorName = `${timestamp}_${FileName}.${ExtensionName}`;
                    // const previewUrl = URL.createObjectURL(file);
                    // setNewFromObj(prev => ({ ...prev, SiteHeader: previewUrl }));
                    // SetState(prev => ({ ...prev, isEditSiteHeaderDeleted: false }));
                    selectedFile = {
                        file: file,
                        name: CreatorName,
                        folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/SiteImages`,
                        overwrite: true
                    };
                }
                await siteFileSaveHeader(selectedFile);
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "onSiteFileSelectionChange", CustomErrormessage: "error in on file selection change", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const getChoicesList = async (): Promise<void> => {
        let dropvalue: any = [];
        const select = ["Id,Title,SiteNameId,IsActive"];
        let filterQuery = 'IsActive eq 1';

        // Conditionally add the SiteNameId filter
        if (props.siteMasterId !== null && props.siteMasterId !== undefined) {
            filterQuery += ` and SiteNameId eq '${props.siteMasterId}'`;
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
        if (!!siteMasterId) {
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.SitesMaster,
                select: ['Id,Title,ADUserId,SiteManagerId,eLearning,SCSiteId,SubLocation,ExistingSiteLink,JobCode,QCStateId,SiteManager/Title,SiteManager/Id,SiteSupervisor/Id,SiteManager/EMail,SiteSupervisorId,SiteSupervisor/Title,SiteSupervisor/EMail,QCState/Title,ADUser/Title,ADUser/Name,SiteImage,SiteImageThumbnailUrl,SiteHeader,SiteHeaderThumbnailUrl,HelpDesk,Periodic,ClientResponse,JobControlChecklist,ManageEvents,IsResourceRecovery,Category,SSWasteReport,UsersId,Users/Title,Users/Name,BreakDownBy,AmenitiesFeedbackForm,IsDailyCleaningDuties,DynamicSiteManager/Title,DynamicSiteManager/Id,DynamicSiteManager/EMail'],
                expand: ['SiteManager,SiteSupervisor,QCState,ADUser,Users,DynamicSiteManager'],
                id: !!siteMasterId ? siteMasterId : 0
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
        SetState((prevState: any) => ({ ...prevState, isaddNewSite: false, isUpdateShowDetailOnly: false, isUpdateNewSite: true, isdisableField: false }));
        try {
            let siteMasterItems = await getSiteMasteItemsByID();
            let SiteImageUrl: string;
            let SiteHeaderUrl: string;
            const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/SitesMaster/Attachments/' + siteMasterItems.Id + "/";
            if (siteMasterItems.SiteImage) {
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
            const siteManagerOptions = siteMasterItems?.SiteManager?.map((manager: any) => ({
                key: manager.Id,
                value: manager.Id,
                text: manager.Title,
                label: manager.Title,
            }));
            // SetState((prevState: any) => ({ ...prevState, DynamicSiteManagerOptions: siteManagerOptions }));

            CurrentStateName.current = siteMasterItems?.QCState?.Title;
            setIsHelpDesk(siteMasterItems?.HelpDesk);
            setIsPeriodic(siteMasterItems?.Periodic);
            setIsClientResponse(siteMasterItems?.ClientResponse);
            setIsJobControlChecklist(siteMasterItems?.JobControlChecklist);
            setIsManageEvents(siteMasterItems?.ManageEvents);
            setIsResourceRecovery(siteMasterItems?.IsResourceRecovery);

            setELearning(siteMasterItems?.eLearning)
            // setDefaultSelcetdFromItems((prevProps: any) => ({ ...prevProps, siteName: props.siteMasterId, sitenamestr: siteMasterItems.Title, qCState: siteMasterItems.QCStateId, siteManager: siteMasterItems.SiteManager?.EMail, siteSupervisor: siteMasterItems.SiteSupervisor?.EMail, aDUser: siteMasterItems.ADUser?.EMail, ExistingSiteLink: siteMasterItems.ExistingSiteLink, JobCode: siteMasterItems.JobCode, Id: siteMasterItems.Id, SiteImage: SiteImageUrl, SiteHeader: SiteHeaderUrl }));
            setDefaultSelcetdFromItems((prevProps: any) => ({ ...prevProps, siteName: props.siteMasterId, sitenamestr: siteMasterItems.Title, qCState: siteMasterItems.QCStateId, siteManager: siteMasterItems.SiteManager?.EMail, siteSupervisor: siteMasterItems.SiteSupervisor?.EMail, aDUser: !!siteMasterItems.ADUserId ? siteMasterItems.ADUser.map((user: any) => user.Name.split('i:0#.f|membership|').filter(Boolean)[0]) : [], ExistingSiteLink: siteMasterItems.ExistingSiteLink, JobCode: siteMasterItems.JobCode, Id: siteMasterItems.Id, SiteImage: SiteImageUrl, SiteHeader: SiteHeaderUrl }));
            setselectedUsers2(siteMasterItems.SiteManager?.map((r: { EMail: any; }) => r.EMail));
            setOldSM(siteMasterItems.SiteManager);

            setselectedUsers(siteMasterItems.SiteSupervisor?.map((r: { EMail: any; }) => r.EMail));
            setOldSS(siteMasterItems.SiteSupervisor);
            setExistingSiteLink(siteMasterItems?.ExistingSiteLink);
            setIsSubLocation(siteMasterItems?.SubLocation);
            setJobCode(siteMasterItems?.JobCode);
            initialSelectedTags = siteMasterItems?.JobCode
                ?.split(',')
                ?.map((code: any) => code.trim())
                ?.filter((code: any) => code.length > 0)
                ?.map((code: any) => ({ key: code, name: code }));

            if (siteMasterItems.QCStateId) {
                setIsCategoryDisable(false);
                setKeyUpdateCategoryOptions(Math.random())
            }
            setNewFromObj((prevState: any) => ({
                ...prevState,
                QCStateId: siteMasterItems.QCStateId,
                SiteCategoryId: siteMasterItems.Category?.Id,
                Category: siteMasterItems.Category.Title,
                SCSiteId: siteMasterItems?.SCSiteId
            }));

            setStateName(siteMasterItems?.QCState?.Title);

            // setselectedADUsers2(siteMasterItems.ADUser?.map((r: { EMail: any; }) => r.EMail));
            if (!!siteMasterItems.ADUserId && siteMasterItems.ADUserId.length > 0)
                setselectedADUsers2(siteMasterItems.ADUser.map((user: any) => user.Name.split('i:0#.f|membership|').filter(Boolean)[0]));
            setNewFromObj((prevState: any) => ({ ...prevState, Title: siteMasterItems.Title, UsersId: siteMasterItems.UsersId ? siteMasterItems.UsersId : [], BreakDownBy: siteMasterItems.BreakDownBy, SiteManagerId: siteMasterItems.SiteManagerId ? siteMasterItems.SiteManagerId : [], DynamicSiteManagerId: siteMasterItems?.DynamicSiteManager?.Id }));
            SetState((prevState: any) => ({ ...prevState, isdisableField: false, DynamicSiteManagerOptions: siteManagerOptions || [] }));
            setIsSSWasteReport(siteMasterItems.SSWasteReport);
            setIsAmenitiesFeedbackForm(siteMasterItems.AmenitiesFeedbackForm);
            setIsDailyCleaningDuties(siteMasterItems.IsDailyCleaningDuties);
            if (siteMasterItems.SSWasteReport) {
                const defaultSelectedPeople = Array.isArray(siteMasterItems.Users)
                    ? siteMasterItems.Users.map((person: any) => person.Title)
                    : [];
                setselectedWasteUsers(defaultSelectedPeople);
            } else {
                setselectedWasteUsers([]);
            }

        } catch (error) {
            console.log(error);
            const errorObj = { ErrorMethodName: "onclickEdit", CustomErrormessage: "error in on click edit", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
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

        fetchSubLocation();
    }, []);
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
                filter: `Id eq ${props?.siteMasterId}`,
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

            const siteMasterItems = await getSiteMasterItems(props.provider);
            const stateMasterItems = await getStateMasterItems2(props.provider);
            const filterdata = siteMasterItems.filter((r: any) => r.Id == props.siteMasterId);
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

            let groups = await getSiteGroupsPermission(props.provider);
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
        _userActivityLog();
        if (props?.siteMasterId) {
            _sitePivotData();
        }
        _manageSubLocation();
        const externalURL = getExternalUrl(props.context);
        const qrcodeUrl = `${externalURL}/SiteDetail?siteid=${selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails?.defaultSelectedSitesId : ""}`;
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

    }, []);

    React.useEffect(() => {
        if (state?.viewSiteItem?.siteName !== "" && state?.viewSiteItem?.qCState !== "" && state?.personaManagerArray?.length !== 0 && state?.personaManagerArray?.length !== undefined) {
            HidePivot.current = false;
            setIsPivot(true);
        } else {
            if (state?.viewSiteItem?.siteName === undefined && state?.viewSiteItem?.qCState === undefined && state?.personaManagerArray?.length === 0) {
                console.log();

            } else {
                HidePivot.current = true;
                setIsPivot(false);
                showPopup3();
            }

        }
    }, [state?.viewSiteItem?.siteName, state?.viewSiteItem?.qCState, state?.personaManagerArray]);


    React.useEffect(() => {
        if (props.isAddNewSite === true) {
            onAddNewClick();
        }
        let isVisibleCrud = (props.loginUserRoleDetails.isStateManager || props.loginUserRoleDetails.isAdmin || props.loginUserRoleDetails?.siteManagerItem.filter(r => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(props.loginUserRoleDetails.Id) > -1).length > 0);
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

    // const onChangeLocation = (value: any, index: number) => {
    //     let items = state.assetLocationManagerSupervisorData;
    //     let prevOptions = [...items[index].Location]
    //     if (value.selected) {
    //         prevOptions = [...prevOptions, value.key]
    //     } else {
    //         prevOptions = prevOptions.length > 0 ? prevOptions.filter((i: any) => i != value.key) : []
    //     }
    //     items[index] = {
    //         ...items[index],
    //         "Location": prevOptions
    //     }
    //     SetState((prevState) => ({ ...prevState, assetLocationManagerSupervisorData: items }));

    // }
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
                        Title: !!props.siteName ? props.siteName : "",
                        SiteNameId: props.siteMasterId
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
            void (async () => {
                setIsLoading(true);
                getSiteMaster();
                getNavlinks();
                let filterSiteData;
                let filterStateData;
                let siteNameOption: IReactSelectOptionProps[];
                let stateOption: IReactSelectOptionProps[];
                if ((!!isAddNewSite && isAddNewSite) || (!!state.isUpdateNewSite && state.isUpdateNewSite)) {
                    const [siteItems, stateItems] = await Promise.all([getSiteMasterItems(provider), getStateMasterItems()]);
                    if (props?.loginUserRoleDetails?.isStateManager && !props?.loginUserRoleDetails?.isAdmin) {
                        filterSiteData = siteItems.filter(item => props?.loginUserRoleDetails?.stateManagerStateItem.includes(item.QCStateId));
                        siteNameOption = filterSiteData.map((items: any) => {
                            return {
                                label: items.Title,
                                value: items.Id
                            };
                        });
                        filterStateData = stateItems.filter(item => props?.loginUserRoleDetails?.stateManagerStateItem.includes(item.ID));
                        stateOption = filterStateData.map((items: any) => {
                            return {
                                label: items.Title,
                                value: items.Id
                            };
                        });
                    } else {
                        siteNameOption = siteItems.map((items: any) => {
                            return {
                                label: items.Title,
                                value: items.Id
                            };
                        });
                        stateOption = stateItems.map((items: any) => {
                            return {
                                label: items.Title,
                                value: items.Id
                            };
                        });
                    }

                    let siteMasterItems: any[] = siteItems.map((items: any) => {
                        let SiteImageUrl: string;
                        let SiteHeaderUrl: string;
                        const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/SitesMaster/Attachments/' + items.Id + "/";
                        if (items?.SiteImage) {
                            try {
                                const SitePhotoData = JSON?.parse(items?.SiteImage);
                                if (SitePhotoData && SitePhotoData?.serverRelativeUrl) {
                                    SiteImageUrl = SitePhotoData?.serverRelativeUrl;
                                } else if (SitePhotoData && SitePhotoData?.fileName) {
                                    SiteImageUrl = fixImgURL + SitePhotoData?.fileName;
                                } else {
                                    SiteImageUrl = "";
                                }
                            } catch (error) {
                                // console.error("Error parsing QRCodePhotoData JSON:", error);
                                SiteImageUrl = "";
                            }
                        } else {
                            SiteImageUrl = "";
                        }
                        if (items?.SiteHeader) {
                            try {
                                const SitePhotoData = JSON.parse(items?.SiteHeader);
                                if (SitePhotoData && SitePhotoData?.serverRelativeUrl) {
                                    SiteHeaderUrl = SitePhotoData?.serverRelativeUrl;
                                } else if (SitePhotoData && SitePhotoData?.fileName) {
                                    SiteHeaderUrl = fixImgURL + SitePhotoData?.fileName;
                                } else {
                                    SiteHeaderUrl = "";
                                }
                            } catch (error) {
                                // console.error("Error parsing QRCodePhotoData JSON:", error);
                                SiteHeaderUrl = "";
                            }
                        } else {
                            SiteHeaderUrl = "";
                        }
                        return {
                            Id: items.Id,
                            siteName: !!items.Title ? items.Title : "",
                            qCState: !!items.QCStateId ? items.QCState.Title : "",
                            qCStateId: !!items.QCStateId ? items.QCStateId : "",
                            siteManagerTitle: !!items.SiteManagerId ? items.SiteManager?.Title : "",
                            siteManagerEmail: !!items.SiteManagerId ? items.SiteManager?.EMail : "",
                            siteManagerId: !!items.SiteManagerId ? items.SiteManagerId : "",
                            aDUserId: !!items.ADUserId ? items.ADUserId : "",
                            // aDUserEmail: !!items.ADUserId ? items.ADUser?.EMail : "",
                            aDUserEmail: !!items.ADUserId ? items.ADUser.map((user: any) => user.Name.split('i:0#.f|membership|').filter(Boolean)[0]) : "",
                            aDUserTitle: !!items.ADUserId ? items.ADUser?.Title : "",
                            SiteImageUrl: SiteImageUrl,
                            SiteHeaderUrl: SiteHeaderUrl,
                            ExistingSiteLink: !!items.ExistingSiteLink ? items.ExistingSiteLink : "",
                            JobCode: !!items.JobCode ? items.JobCode : "",
                            HelpDesk: !!items?.HelpDesk,
                            Periodic: !!items?.Periodic,
                            ClientResponse: !!items?.ClientResponse,
                            JobControlChecklist: !!items?.JobControlChecklist,
                            ManageEvents: !!items?.ManageEvents,
                            IsResourceRecovery: !!items?.IsResourceRecovery,
                            eLearning: !!items?.eLearning,
                            SiteCategoryId: !!items?.SiteCategoryId,
                            Category: !!items?.Category ? items?.Category : ""
                        };
                    });
                    SetState((prevState: any) => ({ ...prevState, siteMasterOptions: siteNameOption, stateMasterOptions: stateOption, siteMasterItems: siteMasterItems }));
                } else {
                    let SiteImageUrl: string;
                    let SiteHeaderUrl: string;
                    let [siteMasterItems, siteManageLocationData] = await Promise.all([getSiteMasteItemsByID(), getManageLocation(), getChoicesList()]);


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
                        Id: siteMasterItems.Id,
                        siteName: !!siteMasterItems.Title ? siteMasterItems.Title : "",
                        qCState: !!siteMasterItems.QCStateId ? siteMasterItems.QCState.Title : "",
                        qCStateId: !!siteMasterItems.QCStateId ? siteMasterItems.QCStateId : "",
                        siteManagerTitle: !!siteMasterItems.SiteManagerId ? siteMasterItems.SiteManager?.map((r: { Title: any; }) => r.Title) : "",
                        siteManagerEmail: !!siteMasterItems.SiteManagerId ? siteMasterItems.SiteManager?.map((r: { EMail: any; }) => r.EMail) : "",
                        siteManagerId: !!siteMasterItems.SiteManagerId ? siteMasterItems.SiteManagerId : "",
                        aDUserTitle: !!siteMasterItems.ADUserId ? siteMasterItems.ADUser?.map((r: { Title: any; }) => r.Title) : "",
                        // aDUserEmail: !!siteMasterItems.ADUserId ? siteMasterItems.ADUser?.map((r: { EMail: any; }) => r.EMail) : "",
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
                        Category: siteMasterItems?.Category
                            ? {
                                Id: siteMasterItems.Category.Id,
                                Title: siteMasterItems.Category.Title
                            }
                            : undefined
                        // Category: !!siteMasterItems?.Category ? siteMasterItems?.Category : ""
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
                    // console.log(deleteAssetPermissonIDS);
                    // Delete the Sub locaiton for removed the Users
                    if (!!deleteAssetPermissonIDS && deleteAssetPermissonIDS.length > 0) {
                        await props.provider.delteItemsBatch(ListNames.SiteAssetLocationPermission, deleteAssetPermissonIDS)
                    }


                    setNewFromObj((prevState: any) => ({ ...prevState, QCStateId: items.qCStateId }));
                    // SetState((prevState: any) => ({ ...prevState, viewSiteItem: items, assetLocationManagerSupervisorData: managerSupervisor, personaManagerArray: siteMasterItems.SiteManager, personaSupervisorArray: siteMasterItems.SiteSupervisor, personaADUserArray: siteMasterItems.ADUser }));
                    SetState((prevState: any) => ({
                        ...prevState, viewSiteItem: items, assetLocationManagerSupervisorData: managerSupervisor, personaManagerArray: siteMasterItems.SiteManager, personaSupervisorArray: siteMasterItems.SiteSupervisor, personaADUserArray: !!siteMasterItems.ADUserId ? siteMasterItems.ADUser.map((user: any) => ({
                            ...user,
                            EMail: user.Name.split('i:0#.f|membership|').filter(Boolean)[0]
                        })) : []
                    }));

                }
                setTimeout(() => {
                    setIsLoading(false);
                }, 1000);
            })();
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            const errorObj = { ErrorMethodName: "useeEffect", CustomErrormessage: "error in use Effect", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    }, [state.isUpdateNewSite, state.isReload]);


    const onClickWasterReport = () => {
        const siteUrl: string = props.context.pageContext.web.absoluteUrl;
        const encryptedSiteName = encryptWasteValue(props?.siteName ? props?.siteName : PivotData.current?.SSWasteReport);
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
            ... ((IsPivot && isVisibleReport.current) ? [{
                key: "Microkeeper",
                text: "Microkeeper",
                iconProps: { iconName: "DynamicSMBLogo", style: { color: "#1E88E5" } },
                onClick: () => {
                    if (props.siteMasterId) {
                        const IMSDshboardPageLink = `${props.context.pageContext.web.absoluteUrl}/SitePages/Microkeeper.aspx?SiteId=${encryptValue(props?.siteMasterId)}`
                        window.open(IMSDshboardPageLink, '_blank')
                    }
                },
            }] : []),
            ...(((PivotData.current === undefined || PivotData.current?.SSWasteReport !== "No") && IsPivot) ? [{
                key: "Waste Report",
                text: "Waste Report",
                iconProps: { iconName: "RecycleBin", style: { color: "#E53935" } },
                onClick: () => { onClickWasterReport() },
            }] : []),
            ...(((PivotData.current === undefined || PivotData.current?.AmenitiesFeedbackForm !== "No") && IsPivot) ? [{
                key: "Amenities Feedback Form",
                text: "Amenities Feedback Form",
                iconProps: { iconName: "OfficeFormsLogoInverse", style: { color: "#43A047" } },
                onClick: () => {
                    const siteUrl: string = props.context.pageContext.web.absoluteUrl;
                    if (!!siteUrl && props?.siteMasterId) {
                        let amenitiesFeedbackLink = `${props.context.pageContext.web.absoluteUrl}/SitePages/${SitePageName.AmenitiesFeedbackForm}?SiteId=${encryptValue(props?.siteMasterId)}`

                        window.open(amenitiesFeedbackLink, '_blank');

                    }

                },
            }] : []),
            ...(((PivotData.current === undefined || PivotData.current?.IsDailyCleaningDuties !== "No") && IsPivot) ? [{
                key: "Daily Cleaning Duties",
                text: "Daily Cleaning Duties",
                iconProps: { iconName: "ProductList", style: { color: "#00897B" } },
                onClick: (ev: any, item: any) => {
                    const siteUrl: string = props.context.pageContext.web.absoluteUrl;
                    if (!!siteUrl && props?.siteMasterId) {
                        let dailyCleanigDutiesPageLink = `${props.context.pageContext.web.absoluteUrl}/SitePages/${SitePageName.DailyCleaningDuties}?SiteId=${encryptValue(props?.siteMasterId)}`

                        window.open(dailyCleanigDutiesPageLink, '_blank');
                    }
                },
            }] : []),
            ...((!PivotData.current || PivotData.current?.eLearning !== "No") ? [
                {
                    key: "eLearning",
                    text: "eLearning",
                    iconProps: { iconName: "D365TalentLearn", style: { color: "#8E24AA" } },
                    onClick: () => {
                        const siteUrl = props.context.pageContext.web.absoluteUrl;
                        if (siteUrl) {
                            const link = props?.siteMasterId
                                ? `${siteUrl}/SitePages/${SitePageName.QCeLearning}?SiteId=${encryptValue(props.siteMasterId)}`
                                : `${siteUrl}/SitePages/${SitePageName.QCeLearning}`;
                            window.open(link, "_blank");
                        }
                    },
                }
            ] : []),
            ... ((IsPivot && isVisibleReport.current) ? [{
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

    const showNew = true; // Your condition based on logic

    function _customRenderer(
        link?: IPivotItemProps,
        defaultRenderer?: (link?: IPivotItemProps) => any | null,
    ): any | any {
        if (!link || !defaultRenderer) {
            return null;
        }

        return (
            <span style={{ flex: '0 1 100%' }}>
                {defaultRenderer({ ...link, itemIcon: undefined })}
                <Icon iconName={link.itemIcon} style={{ color: 'red' }} />
            </span>
        );
    }



    return <>
        {isLoading && <Loader />}
        {state.isEditSiteImagePanelOpen &&
            <Panel
                isOpen={state.isEditSiteImagePanelOpen}
                onDismiss={() => SetState(prevState => ({ ...prevState, isEditSiteImagePanelOpen: false }))}
                type={PanelType.extraLarge}
                headerText="Image View">
                <img src={defaultSelcetdFromItems.SiteImage} style={{ width: "100%", height: "85vh" }} />
            </Panel>
        }
        {state.isEditSiteHeaderPanelOpen &&
            <Panel
                isOpen={state.isEditSiteHeaderPanelOpen}
                onDismiss={() => SetState(prevState => ({ ...prevState, isEditSiteHeaderPanelOpen: false }))}
                type={PanelType.extraLarge}
                headerText="Header View">
                <img src={defaultSelcetdFromItems.SiteHeader} style={{ width: "100%", height: "85vh" }} />
            </Panel>
        }
        {state.isformValidationModelOpen &&
            <CustomModal
                isModalOpenProps={state.isformValidationModelOpen} setModalpopUpFalse={() => {
                    SetState((prevState: any) => ({ ...prevState, isformValidationModelOpen: false }))
                }} subject={"Data missing"}
                message={state.validationMessage} closeButtonText={"Close"} />}
        <div className="boxCard">
            <div className="formgroup eql-height-periodic">

                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween">
                            <div className="customebreadcrumb">
                                <Breadcrumb
                                    items={props.breadCrumItems}
                                    maxDisplayedItems={3}
                                    ariaLabel="Breadcrumb with items rendered as buttons"
                                    overflowAriaLabel="More links"
                                />
                            </div>
                            <div className="dFlex">
                                <div>

                                    <PrimaryButton className="btn btn-danger justifyright floatright" onClick={() => {
                                        const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                        manageComponentView({
                                            currentComponentName: ComponentNameEnum.ViewSite, view: props?.componentProp?.view, breadCrumItems: breadCrumItems,
                                            viewSelectedADUsersFilter: props?.componentProps?.viewSelectedADUsersFilter,
                                            viewSelectedSiteManagersFilter: props?.componentProps?.viewSelectedSiteManagersFilter,
                                            viewSelectedSiteTitlesFilter: props?.componentProps?.viewSelectedSiteTitlesFilter,
                                            viewSelectedStateFilter: props?.componentProps?.viewSelectedStateFilter,
                                            viewSelectedSCSitesFilter: props?.componentProps?.viewSelectedSCSitesFilter,
                                            viewSelectedSiteIdsFilter: props?.componentProps?.viewSelectedSiteIdsFilter,
                                        })
                                    }} text="Back" />
                                </div>
                                {/* <Link
                                    className="actionBtn iconSize btnEdit ml-10"
                                    style={{ paddingBottom: "2px" }}
                                    onClick={onClickPrintConfigurationOpen}
                                >
                                    <TooltipHost content="Print Setting" id={tooltipId}>
                                        <FontAwesomeIcon icon="gear" />
                                    </TooltipHost>
                                </Link> */}
                            </div>

                        </div>

                        <div className={`ms-Grid-col ms-sm12 ms-md12 ms-lg12 ${viewDetailStickHeaders.indexOf(selectedKey) > -1 && "viewPage"}`}>
                            {(isAddNewSite || state.isUpdateNewSite) &&
                                <Pivot aria-label="Basic Pivot Example"
                                    overflowBehavior={'menu'}   >
                                    <PivotItem headerText=""
                                        itemIcon="Home" >
                                        {/* <PrimaryButton 
                                        text="Update All Sites State" 
                                        onClick={()=>{
                                            updateAllStateNameValues();
                                        }} /> */}
                                        <div className="ms-Grid">
                                            <div className="ms-Grid-row">
                                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                                                    {state.isEditSite ?
                                                        <TextField label="Site Name"
                                                            required
                                                            className="formControl"
                                                            name="siteName"
                                                            value={newFromObj?.Title ? newFromObj?.Title : ""}
                                                            placeholder="Enter Input"
                                                            onChange={onSiteNameChange}
                                                        />
                                                        :

                                                        <div className="formControl">
                                                            <div className="dataJustifyBetween">

                                                                {state.isUpdateNewSite ?
                                                                    <>
                                                                        <div >
                                                                            <Label className="labelForm">Site Name<span className="required">*</span></Label>
                                                                        </div>
                                                                        <div >
                                                                            <Link onClick={onEditClickSite}>
                                                                                <TooltipHost
                                                                                    content={"Edit Site"}
                                                                                    id={cogTooltipId}
                                                                                >
                                                                                    <FontAwesomeIcon
                                                                                        className="actionIcon "
                                                                                        icon={"edit"}
                                                                                    />
                                                                                </TooltipHost>
                                                                            </Link>
                                                                        </div>
                                                                    </>
                                                                    : <>
                                                                        <div>
                                                                            <Label className="labelForm">Site Name<span className="required">*</span></Label>
                                                                        </div>
                                                                    </>
                                                                }
                                                            </div>
                                                            {!state.isUpdateNewSite ?
                                                                <TextField
                                                                    className=""
                                                                    name="siteName"
                                                                    value={newFromObj?.Title ? newFromObj?.Title : defaultSelcetdFromItems.sitenamestr}
                                                                    placeholder="Enter Input"
                                                                    onChange={onSiteNameChange}
                                                                /> :
                                                                <ReactDropdown
                                                                    options={state.siteMasterOptions}
                                                                    onChange={onSiteNameSelect}
                                                                    isDisabled={!state.isaddNewSite}
                                                                    defaultOption={defaultSelcetdFromItems?.siteName}
                                                                    isMultiSelect={false}
                                                                    placeholder={'Site Name'}
                                                                />}
                                                        </div>}
                                                </div>
                                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg8 ">
                                                    <div className="ms-Grid">
                                                        <div className="ms-Grid-row">
                                                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6 ">
                                                                <div className="formControl">
                                                                    <Label className="labelForm">State<span className="required">*</span></Label>
                                                                    <ReactDropdown options={state.stateMasterOptions}
                                                                        isDisabled={(state.isdisableField || !state.isaddNewSite) && IsPivot}
                                                                        defaultOption={!!defaultSelcetdFromItems ? defaultSelcetdFromItems?.qCState : props.siteName}
                                                                        isMultiSelect={false}
                                                                        onChange={onChnageState}
                                                                        placeholder={'State'}
                                                                    />
                                                                </div>
                                                            </div>
                                                            {/* <div className="ms-Grid-col ms-sm12  ms-md4 ms-lg4 mb4">
                                                                <Label className="labelForm">Job Code<span className="required"></span></Label>
                                                                {state.isaddNewSite ?
                                                                    // <TextField
                                                                    //     className="formControl"
                                                                    //     label="Job Code"
                                                                    //     placeholder="Enter New Value"
                                                                    //     onChange={onChangeJobCode} />
                                                                    <TagPicker
                                                                        onResolveSuggestions={filterSuggestions}
                                                                        onEmptyResolveSuggestions={() => tagItems}
                                                                        onChange={onChange}
                                                                        selectedItems={selectedTags}
                                                                        inputProps={{
                                                                            placeholder: 'Type or select job codes...',
                                                                            onBlur: () => { }
                                                                        }}
                                                                        onInputChange={input => input}
                                                                        createGenericItem={createGenericTag}
                                                                        pickerSuggestionsProps={suggestionProps}
                                                                    />
                                                                    :
                                                                    // <TextField
                                                                    //     className="formControl"
                                                                    //     label="Job Code"
                                                                    //     placeholder="Enter New Value"
                                                                    //     value={!!JobCode ? JobCode : ""}

                                                                    //     onChange={onChangeJobCode} />
                                                                    <TagPicker
                                                                        onResolveSuggestions={filterSuggestions}
                                                                        onEmptyResolveSuggestions={() => tagItems}
                                                                        onChange={onChange}
                                                                        selectedItems={selectedTags}
                                                                        inputProps={{
                                                                            placeholder: 'Type or select job codes...',
                                                                            onBlur: () => { }
                                                                        }}
                                                                        onInputChange={input => input}
                                                                        createGenericItem={createGenericTag}
                                                                        pickerSuggestionsProps={suggestionProps}
                                                                    />
                                                                }

                                                            </div> */}
                                                            <div className="ms-Grid-col ms-sm12  ms-md6 ms-lg6 mb6" >
                                                                <Label className="formLabel">Category<span className="required"></span></Label>
                                                                <QuayCleanSimpleListDropdown
                                                                    provider={props.provider}
                                                                    listName={ListNames.SiteCategory}
                                                                    label="Category"
                                                                    header="Add Category"
                                                                    placeHolder="Select Category"
                                                                    isAddNew={true}
                                                                    isDisabled={isCategoryDisable}
                                                                    defaultOption={newFromObj?.Category}
                                                                    onChange={(item) => {
                                                                        console.log(item);
                                                                        setNewFromObj(prev => ({
                                                                            ...prev,
                                                                            SiteCategoryId: item.Id,
                                                                            Category: item.Title
                                                                        }));
                                                                    }}
                                                                />

                                                                {/* <QuayCleanChoices
                                                                    key={keyUpdateCategoryOptions}
                                                                    onChange={onChangeCategory}
                                                                    provider={props.provider}
                                                                    keyTitle={"SitesMasterCategory"}
                                                                    label={"Category"}
                                                                    isAddNew={true}
                                                                    isDisable={isCategoryDisable}
                                                                    isStateFilterApply={true}
                                                                    defaultOption={newFromObj?.Category ? newFromObj.Category : ""}
                                                                    header={"Add Category"}
                                                                    qcStateId={newFromObj?.QCStateId || ""}
                                                                /> */}

                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                                    <div className="formControl">
                                                        <PeoplePicker
                                                            disabled={state.isdisableField}
                                                            context={props.context as any}
                                                            titleText="Site Manager"
                                                            personSelectionLimit={100}
                                                            defaultSelectedUsers={selectedUsers2 ? selectedUsers2 : [defaultSelcetdFromItems.siteManager]}
                                                            showtooltip={true}
                                                            required={true}
                                                            ensureUser={true}
                                                            showHiddenInUI={false}
                                                            principalTypes={[PrincipalType.User]}
                                                            onChange={getPeoplePickerItems2}
                                                            resolveDelay={1000} />

                                                    </div>
                                                </div>

                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                                    <div className="formControl">
                                                        <PeoplePicker
                                                            disabled={state.isdisableField}
                                                            context={props.context as any}
                                                            titleText="Site Supervisor"
                                                            personSelectionLimit={100}
                                                            defaultSelectedUsers={selectedUsers}
                                                            showtooltip={true}
                                                            ensureUser={true}
                                                            showHiddenInUI={false}
                                                            principalTypes={[PrincipalType.User]}
                                                            onChange={getPeoplePickerItems}
                                                            resolveDelay={1000} />
                                                    </div>
                                                </div>
                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                                    <div className="formControl">
                                                        <PeoplePicker
                                                            disabled={state.isdisableField}
                                                            context={props.context as any}
                                                            titleText="Client"
                                                            personSelectionLimit={100}
                                                            defaultSelectedUsers={selectedADUsers2 ? selectedADUsers2 : [defaultSelcetdFromItems.aDUser]}
                                                            showtooltip={true}
                                                            ensureUser={true}
                                                            showHiddenInUI={false}
                                                            principalTypes={[PrincipalType.User]}
                                                            required={false}
                                                            onChange={getPeoplePickerItemsADUser}
                                                            resolveDelay={1000} />
                                                    </div>
                                                </div>
                                                <div className="ms-Grid-col ms-sm6 ms-md3 ms-lg3">
                                                    <div className="formControl dynamicSiteManager">
                                                        <Label className="labelForm">Dynamic Site Manager</Label>
                                                        <ReactDropdown
                                                            options={state.DynamicSiteManagerOptions || []}
                                                            onChange={onDynamicSiteManager}
                                                            defaultOption={newFromObj?.DynamicSiteManagerId}
                                                            isMultiSelect={false}
                                                            placeholder={'Dynamic Site Manager'}
                                                            isClearable={true}
                                                        />

                                                    </div>
                                                </div>
                                                <div className="ms-Grid-col ms-sm6 ms-md3 ms-lg3">
                                                    <div className="formControl">
                                                        <Label className="labelForm">Job Code<span className="required"></span></Label>
                                                        {state.isaddNewSite ?
                                                            // <TextField
                                                            //     className="formControl"
                                                            //     label="Job Code"
                                                            //     placeholder="Enter New Value"
                                                            //     onChange={onChangeJobCode} />

                                                            <TagPicker
                                                                onResolveSuggestions={filterSuggestions}
                                                                onEmptyResolveSuggestions={() => []}
                                                                onChange={onChange}
                                                                selectedItems={selectedTags}
                                                                inputProps={{
                                                                    placeholder: 'Type or select job codes...',
                                                                    onBlur: () => { }
                                                                }}
                                                                onInputChange={input => input}
                                                                createGenericItem={createGenericTag}
                                                                pickerSuggestionsProps={suggestionProps}
                                                            />
                                                            :
                                                            <TagPicker
                                                                onResolveSuggestions={filterSuggestions}
                                                                onEmptyResolveSuggestions={() => []}
                                                                onChange={onChange}
                                                                selectedItems={selectedTags}
                                                                inputProps={{
                                                                    placeholder: 'Type or select job codes...',
                                                                    onBlur: () => { }
                                                                }}
                                                                onInputChange={input => input}
                                                                createGenericItem={createGenericTag}
                                                                pickerSuggestionsProps={suggestionProps}
                                                            />
                                                        }
                                                    </div>
                                                </div>
                                                <div className="ms-Grid-col ms-sm6 ms-md3 ms-lg3">
                                                    <div className="formControl">
                                                        {state.isaddNewSite ?
                                                            <TextField
                                                                className="formControl"
                                                                label="Existing SharePoint Site Link"
                                                                placeholder="Enter New Value"
                                                                onChange={onChangeExistingSiteLink} />
                                                            :
                                                            <TextField
                                                                className="formControl"
                                                                label="Existing SharePoint Site Link"
                                                                placeholder="Enter New Value"
                                                                value={!!ExistingSiteLink ? ExistingSiteLink : ""}

                                                                onChange={onChangeExistingSiteLink} />
                                                        }
                                                        {displayerror &&
                                                            <div className="requiredlink">Enter Valid Link</div>}
                                                    </div>
                                                    {/* <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg6 "> */}

                                                </div>
                                                <div className="ms-Grid-col ms-sm6 ms-md3 ms-lg3 ">
                                                    {(props.loginUserRoleDetails.isAdmin) &&
                                                        <TextField
                                                            className="formControl"
                                                            label="Safety Culture Id"
                                                            placeholder="Enter New Value"
                                                            value={!!newFromObj?.SCSiteId ? newFromObj?.SCSiteId : ""}
                                                            onChange={onChangeSafetyCulture} />
                                                    }
                                                </div>



                                                <div className="ms-Grid-col ms-sm12 ms-md8 ms-lg8 ">

                                                    {(state.isaddNewSite) ?
                                                        <div className="radioCheckGroup">
                                                            <div className="">
                                                                <Toggle label="Periodic"
                                                                    onText="On" offText="Off"
                                                                    checked={IsPeriodic}
                                                                    onChange={_onChangePeriodic} />
                                                            </div>
                                                            <div className="">
                                                                <Toggle label="Help Desk"
                                                                    onText="On" offText="Off"
                                                                    checked={IsHelpDesk}
                                                                    onChange={_onChangeHelpDesk} />
                                                            </div>
                                                            <div className="">
                                                                <Toggle label="Client Response"
                                                                    onText="On" offText="Off"
                                                                    checked={IsClientResponse}
                                                                    onChange={_onChangeClientResponse} />
                                                            </div>
                                                            <div className="">
                                                                <Toggle label="Site KPI's"
                                                                    onText="On" offText="Off"
                                                                    checked={IsJobControlChecklist}
                                                                    onChange={_onChangeJobControlChecklist} />
                                                            </div>
                                                            <div className="">
                                                                <Toggle label="Manage Events"
                                                                    onText="On" offText="Off"
                                                                    checked={IsManageEvents}
                                                                    onChange={_onChangeManageEvents} />
                                                            </div>
                                                            <div className="">
                                                                <Toggle label="eLearning"
                                                                    onText="On" offText="Off"
                                                                    checked={eLearning}
                                                                    onChange={_onChangeELearning} />
                                                            </div>

                                                            <>
                                                                <div className="">
                                                                    <Toggle label={WasteReportViewFields.WasteReport}
                                                                        onText="On" offText="Off"
                                                                        checked={IsSSWasteReport}
                                                                        onChange={_onChangeSSWasteReport}
                                                                        disabled={!currentUserRoleDetail.isAdmin} />
                                                                </div>
                                                                <div className="">
                                                                    <Toggle label={WasteReportViewFields.AmenitiesFeedbackForm}
                                                                        onText="On" offText="Off"
                                                                        checked={IsAmenitiesFeedbackForm}
                                                                        onChange={_onChangeAmenities}
                                                                        disabled={!currentUserRoleDetail.isAdmin} />
                                                                </div>
                                                                <div className="">
                                                                    <Toggle label={WasteReportViewFields.DailyDutiesChecklists}
                                                                        onText="On" offText="Off"
                                                                        checked={IsDailyCleaningDuties}
                                                                        onChange={_onChangeDailyCleaningDuties}
                                                                        disabled={!currentUserRoleDetail.isAdmin} />
                                                                </div>
                                                                <div className="">
                                                                    <Toggle label={WasteReportViewFields.IsResourceRecovery}
                                                                        onText="On" offText="Off"
                                                                        checked={IsResourceRecovery}
                                                                        onChange={_onChangeIsResourceRecovery}
                                                                        disabled={!currentUserRoleDetail.isAdmin} />
                                                                </div>
                                                            </>

                                                        </div>
                                                        :
                                                        <>
                                                            {<>
                                                                <div className="radioCheckGroup">
                                                                    <div className="">
                                                                        <Toggle label="Periodic"
                                                                            onText="On" offText="Off"
                                                                            checked={IsPeriodic}
                                                                            onChange={_onChangePeriodic} />
                                                                    </div>
                                                                    <div className="">
                                                                        <Toggle label="Help Desk"
                                                                            onText="On" offText="Off"
                                                                            checked={IsHelpDesk}
                                                                            onChange={_onChangeHelpDesk} />
                                                                    </div>
                                                                    <div className="">
                                                                        <Toggle label="Client Response"
                                                                            onText="On" offText="Off"
                                                                            checked={IsClientResponse}
                                                                            onChange={_onChangeClientResponse} />
                                                                    </div>
                                                                    <div className="">
                                                                        <Toggle label="Site KPI's"
                                                                            onText="On" offText="Off"
                                                                            checked={IsJobControlChecklist}
                                                                            onChange={_onChangeJobControlChecklist} />
                                                                    </div>
                                                                    <div className="">
                                                                        <Toggle label="Manage Events"
                                                                            onText="On" offText="Off"
                                                                            checked={IsManageEvents}
                                                                            onChange={_onChangeManageEvents} />
                                                                    </div>
                                                                    <div className="">
                                                                        <Toggle label="eLearning"
                                                                            onText="On" offText="Off"
                                                                            checked={eLearning}
                                                                            onChange={_onChangeELearning} />
                                                                    </div>
                                                                    <>
                                                                        <div className="">
                                                                            <Toggle label={WasteReportViewFields.WasteReport}
                                                                                onText="On" offText="Off"
                                                                                checked={IsSSWasteReport}
                                                                                onChange={_onChangeSSWasteReport}
                                                                                disabled={!currentUserRoleDetail.isAdmin}
                                                                            />
                                                                        </div>
                                                                        <div className="">
                                                                            <Toggle label={WasteReportViewFields.AmenitiesFeedbackForm}
                                                                                onText="On" offText="Off"
                                                                                checked={IsAmenitiesFeedbackForm}
                                                                                onChange={_onChangeAmenities}
                                                                                disabled={!currentUserRoleDetail.isAdmin} />
                                                                        </div>
                                                                        <div className="">
                                                                            <Toggle label={WasteReportViewFields.DailyDutiesChecklists}
                                                                                onText="On" offText="Off"
                                                                                checked={IsDailyCleaningDuties}
                                                                                onChange={_onChangeDailyCleaningDuties}
                                                                                disabled={!currentUserRoleDetail.isAdmin} />
                                                                        </div>
                                                                        <div className="">
                                                                            <Toggle label={WasteReportViewFields.IsResourceRecovery}
                                                                                onText="On" offText="Off"
                                                                                checked={IsResourceRecovery}
                                                                                onChange={_onChangeIsResourceRecovery}
                                                                                disabled={!currentUserRoleDetail.isAdmin} />
                                                                        </div>
                                                                    </>

                                                                </div>
                                                            </>}
                                                        </>}
                                                </div>
                                                <div className="ms-Grid-col ms-sm6 ms-md4 ms-lg4" style={{ marginTop: "24px", minHeight: "76px" }}>
                                                    {(props.loginUserRoleDetails.isAdmin || props.loginUserRoleDetails.isStateManager || props.loginUserRoleDetails?.siteManagerItem.filter(r => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(props.loginUserRoleDetails.Id) > -1).length > 0) &&
                                                        <>
                                                            <TooltipHost
                                                                content={"Supervisor Access"}
                                                            >
                                                                <PrimaryButton
                                                                    iconProps={{ iconName: "Settings" }}
                                                                    className="btn btn-primary mb5 mt-1"
                                                                    onClick={onClickAddAccess}
                                                                    text="Supervisor Access"
                                                                />
                                                            </TooltipHost>
                                                        </>
                                                    }
                                                    {/* {(props.loginUserRoleDetails.isAdmin || props.loginUserRoleDetails.isStateManager) &&
                                                        <PrimaryButton className="btn btn-primary justifyright floatright mb5 mt-1" text="Manage Location Access" onClick={() => {
                                                            SetState((prevState) => ({
                                                                ...prevState, isAssetLocationOpen: true,
                                                            }));

                                                        }} />
                                                    } */}
                                                </div>


                                                {IsSSWasteReport === true && (
                                                    <>
                                                        <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4">
                                                            <div className="formControl">
                                                                <PeoplePicker
                                                                    context={props.context as any}
                                                                    titleText={WasteReportViewFields.Users}
                                                                    personSelectionLimit={100}
                                                                    defaultSelectedUsers={selectedWasteUsers ?? []}
                                                                    showtooltip={true}
                                                                    required={true}
                                                                    ensureUser={true}
                                                                    showHiddenInUI={false}
                                                                    principalTypes={[PrincipalType.User]}
                                                                    onChange={getUsersPeoplePicker}
                                                                    resolveDelay={1000} />
                                                            </div>
                                                        </div>
                                                        <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4">
                                                            <div className="formControl">
                                                                <Label className="labelform">{WasteReportViewFields.BreakDownBy}<span className="required">*</span></Label>
                                                                <ReactDropdown
                                                                    options={breakDownByOptions}
                                                                    defaultOption={!!newFromObj ? newFromObj?.BreakDownBy : undefined}
                                                                    isMultiSelect={false}
                                                                    onChange={onChnageBreakDownBy}
                                                                    placeholder={WasteReportViewFields.BreakDownBy}
                                                                />
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                                {/* <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 mb4">
                                                    {(state.isaddNewSite || state.isEditSiteImageDeleted) ?
                                                        <TextField
                                                            type="file"
                                                            label="Site Logo"
                                                            className="FileUpload formControl"
                                                            accept="image/*"
                                                            name="productPhoto"
                                                            onChange={onSiteFileSelectionChange}
                                                        /> : <>
                                                            {!!defaultSelcetdFromItems.SiteImage && <>
                                                                <Label className="labelform">Site Logo</Label>
                                                                <div className="formControl pt-2 pb-2" >
                                                                    <span className="cursorPointer"
                                                                        onClick={() => SetState(prevState => ({ ...prevState, isEditSiteImagePanelOpen: true }))}
                                                                    >
                                                                        View Image
                                                                    </span>
                                                                    <FontAwesomeIcon className="ml5 " icon="trash-alt" onClick={() => {
                                                                        _onClickDeleteUploadFile();
                                                                    }}
                                                                    />
                                                                </div>
                                                            </>}
                                                        </>}
                                                </div> */}
                                                <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 mb4">
                                                    {(!defaultSelcetdFromItems?.SiteImage || state.isEditSiteImageDeleted) ? (
                                                        <TextField
                                                            type="file"
                                                            label="Site Logo"
                                                            className="FileUpload formControl"
                                                            accept="image/*"
                                                            name="productPhoto"
                                                            onChange={onSiteFileSelectionChange}
                                                        />
                                                    ) : (
                                                        <>
                                                            <Label className="labelform">Site Logo</Label>
                                                            <div className="formControl pt-2 pb-2">
                                                                <span
                                                                    className="cursorPointer"
                                                                    onClick={() =>
                                                                        SetState(prevState => ({
                                                                            ...prevState,
                                                                            isEditSiteImagePanelOpen: true
                                                                        }))
                                                                    }
                                                                >
                                                                    View Image
                                                                </span>
                                                                <FontAwesomeIcon
                                                                    className="ml5"
                                                                    icon="trash-alt"
                                                                    onClick={_onClickDeleteUploadFile}
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {/* <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 mb4">
                                                    {(state.isaddNewSite || state.isEditSiteHeaderDeleted) ? <TextField
                                                        type="file"
                                                        label="Site Header"
                                                        className="FileUpload formControl"
                                                        accept="image/*"
                                                        name="productPhoto"
                                                        onChange={onSiteFileSelectionChangeHeader}
                                                    /> : <>
                                                        {!!defaultSelcetdFromItems.SiteHeader && <>
                                                            <Label className="labelform">Site Header</Label>
                                                            <div className="formControl pt-2 pb-2" >
                                                                <span className="cursorPointer"
                                                                    onClick={() => SetState(prevState => ({ ...prevState, isEditSiteHeaderPanelOpen: true }))}
                                                                >
                                                                    View Header
                                                                </span>
                                                                <FontAwesomeIcon className="ml5 " icon="trash-alt" onClick={() => {
                                                                    _onClickDeleteUploadFileHeader();
                                                                }}
                                                                />
                                                            </div>
                                                        </>}
                                                    </>}
                                                </div> */}
                                                <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 mb4">
                                                    {(!defaultSelcetdFromItems?.SiteHeader || state.isEditSiteHeaderDeleted) ? (
                                                        <TextField
                                                            type="file"
                                                            label="Site Header"
                                                            className="FileUpload formControl"
                                                            accept="image/*"
                                                            name="productPhoto"
                                                            onChange={onSiteFileSelectionChangeHeader}
                                                        />
                                                    ) : (
                                                        <>
                                                            <Label className="labelform">Site Header</Label>
                                                            <div className="formControl pt-2 pb-2">
                                                                <span
                                                                    className="cursorPointer"
                                                                    onClick={() =>
                                                                        SetState(prevState => ({
                                                                            ...prevState,
                                                                            isEditSiteHeaderPanelOpen: true
                                                                        }))
                                                                    }
                                                                >
                                                                    View Header
                                                                </span>
                                                                <FontAwesomeIcon
                                                                    className="ml5"
                                                                    icon="trash-alt"
                                                                    onClick={_onClickDeleteUploadFileHeader}
                                                                />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                                {/* Toggle */}
                                                <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 mb4 dflex">
                                                    <Toggle label="Do you have location available?"
                                                        onText="Yes" offText="No"
                                                        checked={IsSubLocation}
                                                        onChange={_onChangeSubLocation} />
                                                    {IsSubLocation && <PrimaryButton className="btn btn-primary mr-10 loc-mt-10" text="Add location" onClick={onClickSubLocation} />}
                                                </div>
                                                {/* <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 mb4">

                                                </div> */}
                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ml-master-5">
                                                    {displayerror ?
                                                        <PrimaryButton
                                                            style={{ margin: "5px", marginTop: "10px" }}
                                                            disabled={true}
                                                            className={!!state.isdisableField ? "" : "btn btn-secondary"}
                                                            text={state.isaddNewSite ? 'Save' : "Update"}
                                                            onClick={state.isaddNewSite ? onClickSave : onClickUpdate}
                                                        /> :
                                                        <PrimaryButton
                                                            style={{ margin: "5px", marginTop: "10px" }}
                                                            disabled={!!state.isdisableField ? state.isdisableField : false}
                                                            className={!!state.isdisableField ? "" : "btn btn-primary"}
                                                            text={state.isaddNewSite ? 'Save' : "Update"}
                                                            onClick={state.isaddNewSite ? onClickSave : onClickUpdate}
                                                        />
                                                    }
                                                    <PrimaryButton
                                                        style={{ margin: "5px", marginTop: "10px" }}
                                                        className="btn btn-danger"
                                                        text="Cancel"
                                                        onClick={onClickClose}
                                                    />
                                                </div>
                                            </div>
                                        </div >
                                    </PivotItem >
                                </Pivot >
                            }

                            {
                                state.isShowDetailOnly && state.isUpdateShowDetailOnly &&
                                <div>

                                    <Link className="btn-back-ml-4 dticon appLinksButton">
                                        <TooltipHost content="App links">
                                            <DefaultButton
                                                text="App links"
                                                iconProps={{ iconName: "AppIconDefaultAdd", style: { color: "#ffffff" } }}
                                                menuProps={menuProps}
                                                className="btn export-btn-primary"
                                            />
                                        </TooltipHost>
                                    </Link>
                                    <Pivot aria-label="Basic Pivot Example" selectedKey={selectedKey}
                                        overflowBehavior={'menu'}
                                        className="siteInformationPivot"
                                        onLinkClick={_onLinkClick}
                                    >
                                        <PivotItem
                                            headerText="" itemKey="SiteKey"
                                            itemIcon="Home"
                                        >
                                            <ManageSitesCrud
                                                onClickReload={onClickReload}
                                                isShowSuperVisorAccess={(props.loginUserRoleDetails.isAdmin || props.loginUserRoleDetails.isStateManager || props.loginUserRoleDetails?.siteManagerItem.filter(r => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(props.loginUserRoleDetails.Id) > -1).length > 0)}
                                                isShowAssetLocationAccess={(props.loginUserRoleDetails.isAdmin || props.loginUserRoleDetails.isStateManager)}
                                                onClickAddAccess={onClickAddAccess}
                                                onClickAccesLocation={onClickAccesLocation}
                                                onClickSubLocation={onClickSubLocation}
                                                onclickViewQR={onclickViewQR}
                                                onclickEdit={onclickEdit}
                                                qrCodeSrc={qrCodeSrc}
                                                isCrudShow={(state.isVisibleCrud && !IsSupervisor)}
                                                isSiteInformationView={true}
                                                siteMasterId={props.siteMasterId || 0} manageComponentView={manageComponentView}
                                                // dataObj={props.dat}
                                                siteName={props.siteName}
                                                IsSupervisor={props.IsSupervisor}
                                                qCState={props.qCState}
                                                MasterId={props.siteMasterId}
                                                qCStateId={props.qCState}
                                                componentProp={props.componentProps}
                                                breadCrumItems={props.breadCrumItems}

                                            />
                                        </PivotItem>
                                        {IsPivot &&
                                            <PivotItem headerText="Equipment/Assets" itemKey="EquipmentKey" itemIcon="DeveloperTools"
                                            // onRenderItemLink={_customRenderer() as any}
                                            >
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
                                                    siteMasterId={props.siteMasterId}
                                                    siteName={props.siteName}
                                                    qCState={props.qCState}
                                                    IsSupervisor={IsSupervisor}
                                                    dataObj={props?.componentProp?.dataObj}
                                                    componentProp={props.componentProp}
                                                />
                                            </PivotItem>}
                                        {IsPivot &&
                                            <PivotItem headerText="Chemicals" itemKey="ChemicalKey" itemIcon="TestAutoSolid">
                                                < AssociateChemical
                                                    breadCrumItems={props.breadCrumItems}
                                                    siteNameId={props.siteMasterId}
                                                    manageComponentView={manageComponentView}
                                                    IsSupervisor={IsSupervisor}
                                                    dataObj={props?.componentProp?.dataObj}
                                                    loginUserRoleDetails={props.loginUserRoleDetails}
                                                    qCState={props.qCState} siteName={props.siteName} />

                                            </PivotItem>}
                                        {IsPivot &&
                                            <PivotItem headerText="Assigned Team" itemKey="TeamKey" itemIcon="Teamwork">
                                                <AssignedTeam
                                                    loginUserRoleDetails={props.loginUserRoleDetails}
                                                    provider={props.provider}
                                                    manageComponentView={manageComponentView}
                                                    IsSupervisor={IsSupervisor}
                                                    context={props.context}
                                                    qCState={!!props.qCState ? props.qCState : ""}
                                                    siteMasterId={props.siteMasterId}
                                                    qCStateId={props?.componentProp?.dataObj?.StateId}
                                                    siteName={props.siteName}
                                                    selectedZoneDetails={selectedZoneDetails}
                                                />
                                            </PivotItem>}
                                        {IsPivot &&
                                            <PivotItem headerText="Safety Culture" itemKey="DocumentKey" itemIcon="Communications">
                                                <AuditReports
                                                    isViewSiteDialog={false}
                                                    provider={props.provider}
                                                    manageComponentView={manageComponentView}
                                                    siteMasterId={props.siteMasterId}
                                                    context={props.context}
                                                    IsSupervisor={IsSupervisor}
                                                    siteName={props.siteName}
                                                    componentProp={props.componentProp}
                                                    loginUserRoleDetails={props.loginUserRoleDetails}
                                                    qCState={!!props.qCState ? props.qCState : ""}
                                                />
                                            </PivotItem>}
                                        {IsPivot &&
                                            <PivotItem headerText="Document Library" itemKey="DocumentsKey" itemIcon="FabricFormLibrary">
                                                <DocumentsLib
                                                    siteNameId={props.siteMasterId}
                                                    manageComponentView={manageComponentView}
                                                    IsSupervisor={IsSupervisor}
                                                    loginUserRoleDetails={props.loginUserRoleDetails}
                                                    qCStateId={props?.componentProp?.dataObj?.StateId}
                                                    qCState={props.qCState}
                                                    siteName={props.siteName} />
                                            </PivotItem>}
                                        {IsPivot &&
                                            <PivotItem headerText="Quaysafe" itemKey="IMSKey" itemIcon="Shield">
                                                < IMS
                                                    loginUserRoleDetails={props.loginUserRoleDetails}
                                                    breadCrumItems={props.breadCrumItems}
                                                    provider={provider}
                                                    context={props.context}
                                                    originalState={props?.qCState}
                                                    manageComponentView={manageComponentView}
                                                    siteMasterId={props.siteMasterId}
                                                    siteName={props.siteName}
                                                    qCState={props.qCState}
                                                    qCStateId={props?.componentProp?.dataObj?.StateId}
                                                    IsSupervisor={IsSupervisor}
                                                    subpivotName={props?.componentProp?.subpivotName}
                                                    dataObj={props?.componentProp?.dataObj}
                                                    view={props?.componentProp?.view}
                                                    PivotData={PivotData.current}
                                                    componentProp={props.componentProp} />
                                            </PivotItem>}
                                        {((PivotData.current === undefined || PivotData.current?.ManageEvents !== "No") && IsPivot) &&
                                            <PivotItem headerText="Events" itemKey="EventsKey" itemIcon="Calendar">
                                                < Events
                                                    loginUserRoleDetails={props.loginUserRoleDetails}
                                                    provider={provider}
                                                    context={props.context}
                                                    siteMasterId={props.siteMasterId}
                                                    siteName={props.siteName}
                                                    componentProp={props.componentProp} manageComponentView={function (componentProp: IQuayCleanState) {
                                                        throw new Error("Function not implemented.")
                                                    }} breadCrumItems={[]} />
                                            </PivotItem>}

                                        {(PivotData.current === undefined || PivotData.current?.HelpDesk !== "No") && IsPivot && (
                                            <PivotItem headerText={`Help Desk`} itemKey={`HelpDeskListKey`} itemIcon="ContactInfo">
                                                <HelpDeskList
                                                    manageComponentView={manageComponentView}
                                                    originalSiteMasterId={props.componentProp.siteMasterId}
                                                    siteMasterId={props.siteMasterId}
                                                    IsSupervisor={IsSupervisor}
                                                    dataObj={props?.componentProp?.dataObj}
                                                    breadCrumItems={props.breadCrumItems || []}
                                                    componentProps={props.componentProp}
                                                    qCStateId={props?.componentProp?.dataObj?.StateId}
                                                />
                                            </PivotItem>
                                        )}
                                        {(PivotData.current === undefined || PivotData.current?.Periodic !== "No") && IsPivot && (
                                            <PivotItem headerText={`Periodic`} itemKey={`ManagePeriodicListKey`} itemIcon="Clock">
                                                <ManagePeriodicList
                                                    manageComponentView={manageComponentView}
                                                    componentProp={props.componentProp}
                                                    siteMasterId={props.siteMasterId}
                                                    IsSupervisor={IsSupervisor}
                                                    dataObj={props?.componentProp?.dataObj}
                                                    qCStateId={props?.componentProp?.dataObj?.StateId}
                                                    breadCrumItems={props.componentProp.breadCrumItems || []} />
                                            </PivotItem>
                                        )}
                                        {/* {(PivotData.current === undefined || PivotData.current?.ClientResponse !== "No") && IsPivot && (
                                            <PivotItem headerText={`Client Response`} itemKey={`ClientResponseListKey`} itemIcon="Message">
                                                <ClientResponseList
                                                    originalSiteMasterId={props.componentProp.siteMasterId}
                                                    IsSupervisor={IsSupervisor}
                                                    isAddNewClientResponse={props.componentProp.isAddNewSite} manageComponentView={manageComponentView}
                                                    siteMasterId={props.componentProp.siteMasterId}
                                                    breadCrumItems={props.componentProp.breadCrumItems || []}
                                                    dataObj={props?.componentProp?.dataObj}
                                                    qCStateId={props?.componentProp?.dataObj?.StateId}
                                                    componentProps={props.componentProp}
                                                />
                                            </PivotItem>
                                        )} */}
                                        {(PivotData.current === undefined || PivotData.current?.ClientResponse !== "No") && IsPivot && (
                                            <PivotItem headerText={`Client Response`} itemKey={`CRIssueListKey`} itemIcon="Message">
                                                <ClientResponseIssueList
                                                    qCState={props.qCState}
                                                    // breadCrumItems={props.componentProp.breadCrumItems || []}
                                                    breadCrumItems={props.breadCrumItems}
                                                    qCStateId={props?.componentProp?.dataObj?.StateId}
                                                    componentProps={props.componentProp}
                                                    view={props?.componentProp?.view}
                                                    siteMasterId={props.componentProp.siteMasterId}
                                                    manageComponentView={manageComponentView}
                                                />
                                            </PivotItem>
                                        )}
                                        {IsPivot && (
                                            <PivotItem headerText={`Monthly KPI's`} itemKey={`ViewJobControlChecklistKey`} itemIcon="BarChartVertical">
                                                <ViewJobControlChecklist
                                                    manageComponentView={manageComponentView}
                                                    originalState={props?.qCState}
                                                    originalSiteMasterId={props.componentProp.siteMasterId}
                                                    siteMasterId={props.siteMasterId}
                                                    IsSupervisor={IsSupervisor}
                                                    JobControlChecklist={PivotData.current?.JobControlChecklist}
                                                    dataObj={props?.componentProp?.dataObj}
                                                    breadCrumItems={props.breadCrumItems || []}
                                                    componentProps={props.componentProp} />
                                            </PivotItem>
                                        )}

                                        {/* {(PivotData.current === undefined || PivotData.current?.EOMChecklist !== "No") && IsPivot && (
                                        <PivotItem headerText={`EOM Checklist`} itemKey={`ViewEOMChecklistKey`}>
                                            <ViewEOMChecklist
                                                manageComponentView={manageComponentView}
                                                originalState={props?.qCState}
                                                originalSiteMasterId={props.componentProp.siteMasterId}
                                                siteMasterId={props.siteMasterId}
                                                IsSupervisor={IsSupervisor}
                                                dataObj={props?.componentProp?.dataObj}
                                                breadCrumItems={props.breadCrumItems || []}
                                                componentProps={props.componentProp} />
                                        </PivotItem>
                                    )} */}
                                        {IsPivot && isVisibleReport.current &&
                                            <PivotItem headerText="Microkeeper" itemKey="Microkeeper" itemIcon="AppIconDefault">
                                                <Reports
                                                    manageComponentView={manageComponentView}
                                                    isSiteView={true}
                                                    siteMasterId={props.siteMasterId}
                                                    siteDetail={state.viewSiteItem}

                                                    originalState={props?.qCState}
                                                    originalSiteMasterId={props.componentProp.siteMasterId}
                                                    IsSupervisor={IsSupervisor}
                                                    dataObj={props?.componentProp?.dataObj}
                                                    breadCrumItems={props.breadCrumItems || []}
                                                    componentProps={props.componentProp}
                                                />
                                                {/* <ViewEOMChecklist
                                                manageComponentView={manageComponentView}
                                                 siteMasterId={props.siteMasterId}

                                                originalState={props?.qCState}
                                                originalSiteMasterId={props.componentProp.siteMasterId}
                                                IsSupervisor={IsSupervisor}
                                                dataObj={props?.componentProp?.dataObj}
                                                breadCrumItems={props.breadCrumItems || []}
                                                componentProps={props.componentProp} /> */}
                                            </PivotItem>}

                                        {/* {(PivotData.current === undefined || PivotData.current?.SSWasteReport !== "No") && IsPivot && (
                                        <PivotItem headerText={WasteReportPivot.WasteReport} itemKey={WasteReportPivot.WasteReportKey}>
                                            <WasteReportLink
                                                siteMasterId={props.siteMasterId}
                                                siteName={props?.siteName ? props?.siteName : PivotData.current?.SSWasteReport}
                                            />
                                        </PivotItem>
                                    )} */}

                                        {/* {(PivotData.current === undefined || PivotData.current?.AmenitiesFeedbackForm !== "No") && IsPivot && (
                                        <PivotItem headerText={WasteReportPivot.AmenitiesFeedbackForm} itemKey={WasteReportPivot.AmenitiesFeedbackFormKey}>
                                            <AmenitiesFeedbackFormLink
                                                siteMasterId={props.siteMasterId}
                                            />
                                        </PivotItem>
                                    )} */}
                                        {/* {(PivotData.current === undefined || PivotData.current?.IsDailyCleaningDuties !== "No") && IsPivot && (
                                        <PivotItem headerText={WasteReportPivot.DailyCleaningDuties} itemKey={WasteReportPivot.DailyCleaningDutiesKey}>
                                            <DailyCleaningDutisPageLink
                                                siteMasterId={props.siteMasterId}
                                            />
                                        </PivotItem>
                                    )} */}
                                        {IsPivot && isVisibleReport.current &&
                                            <PivotItem headerText="Safetember" itemKey="SynergySessions" itemIcon="DocumentSearch"
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
                                                <SynergySessions
                                                    siteView={true}
                                                    siteNameId={props?.siteMasterId}
                                                    manageComponentView={manageComponentView}
                                                    IsSupervisor={true}
                                                    qCState={props?.qCState}
                                                    qCStateId={props?.componentProp?.dataObj?.StateId}
                                                    loginUserRoleDetails={props?.loginUserRoleDetails}
                                                    siteName={undefined} />
                                            </PivotItem>}

                                        {IsPivot && isVisibleReport.current &&
                                            <PivotItem headerText="Policies and Procedures" itemKey="PoliciesandProcedures" itemIcon="DocumentSet"
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
                                                <PoliciesandProcedures
                                                    siteView={true}
                                                    siteNameId={props?.siteMasterId}
                                                    manageComponentView={manageComponentView}
                                                    IsSupervisor={true}
                                                    qCState={props?.qCState}
                                                    qCStateId={props?.componentProp?.dataObj?.StateId}
                                                    loginUserRoleDetails={props?.loginUserRoleDetails}
                                                    siteName={undefined} />
                                            </PivotItem>}
                                        {(PivotData.current === undefined || PivotData.current?.IsResourceRecovery !== "No") && IsPivot && (
                                            <PivotItem headerText={WasteReportPivot.ResourceRecovery} itemKey={WasteReportPivot.ResourceRecovery} itemIcon="SyncStatus">
                                                <ResourceRecovery
                                                    siteNameId={props.siteMasterId}
                                                    manageComponentView={manageComponentView}
                                                    siteName={props?.siteName || ""}
                                                    loginUserRoleDetails={props?.loginUserRoleDetails}
                                                    qCStateId={props?.componentProp?.dataObj?.StateId}
                                                    qCState={props.qCState}
                                                />
                                            </PivotItem>
                                        )}
                                        {/* <PivotItem headerText={`Local Storage`} itemKey={`LocalStorage`}>
                                        <LocalStorage
                                            provider={provider}
                                            context={props.context}
                                        />
                                    </PivotItem> */}
                                        {/* {masterMenu()} */}
                                    </Pivot>
                                </div>
                            }
                        </div >
                        {
                            state.isShowDetailOnly && state.isUpdateShowDetailOnly &&
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <PrimaryButton className="btn btn-danger justifyright floatright mb5" onClick={() => {
                                    const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems)
                                    manageComponentView({
                                        currentComponentName: ComponentNameEnum.ViewSite, view: props?.componentProp?.view, breadCrumItems: breadCrumItems,

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
                                {/* <PrimaryButton text="Save" className='mrt15 css-b62m3t-container btn btn-primary' onClick={handleSubmit} /> */}
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
                                                        {/* <td className="custom-cell-ans custom-cell-ans-mw">
                                                            <Dropdown
                                                                placeholder="select location"
                                                                multiSelect
                                                                options={(state.assetLocationOptions as any) || []}
                                                                selectedKeys={item.Location || []}
                                                                onChange={(event, option) => onChangeLocation(option, index)}
                                                            />

                                                        </td> */}
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
                                    {/* <PrimaryButton text="Save" className='mrt15 css-b62m3t-container btn btn-primary' onClick={handleSubmit} /> */}
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
                                                                {/* <h6 style={{ color: "#979798" }}>{item.isManager ? "Manager" : "Supervisor"}</h6> */}
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