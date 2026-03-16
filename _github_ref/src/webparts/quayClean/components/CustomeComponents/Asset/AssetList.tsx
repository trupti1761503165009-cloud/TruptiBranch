/* eslint-disable @microsoft/spfx/import-requires-chunk-name */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IQuayCleanState } from "../../QuayClean";
import { Loader } from "../../CommonComponents/Loader";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ComponentNameEnum, ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { _onItemSelected, getAssetHistory, getConvertedDate, isWithinNextMonthRange, logGenerator, onBreadcrumbItemClicked, showPremissionDeniedPage, getErrorMessageValue, formatPrice, formatPriceDecimal, getSiteGroupsPermission } from "../../../../../Common/Util";
import { IDropdownOption, PrimaryButton } from "office-ui-fabric-react";
import { Breadcrumb, Link, TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useId } from "@fluentui/react-hooks";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { UpdateServiceHistroy } from "./UpdateServiceHistroy";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import CustomModal from "../../CommonComponents/CustomModal";
import { MovingHistory } from "./MovingHistory";
import { AssociatAssetType } from "./AssociatAssetType";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { AssetCardView } from "./AssetCardView";
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';
import { MultiStateFilter } from "../../../../../Common/Filter/MultiStateFilter";
import { AssetLocationFilter } from "../../../../../Common/Filter/AssetLocationFilter";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');

const AssetHistory = React.lazy(() =>
    import("./AssetHistory").then(module => ({ default: module.AssetHistory }))
);
const PrintQrCode = React.lazy(() =>
    import("../QRCode/PrintQrCode").then(module => ({ default: module.PrintQrCode }))
);
const AssetNameFilter = React.lazy(() =>
    import("../../../../../Common/Filter/AssetName").then(module => ({ default: module.AssetNameFilter }))
);
const StatusFilter = React.lazy(() =>
    import("../../../../../Common/Filter/StatusFilter").then(module => ({ default: module.StatusFilter }))
);
const SerialNumberFilter = React.lazy(() =>
    import("../../../../../Common/Filter/SerialNumberFilter").then(module => ({ default: module.SerialNumberFilter }))
);
// const AssetLocationFilter = React.lazy(() =>
//     import("../../../../../Common/Filter/AssetLocationFilter").then(module => ({ default: module.AssetLocationFilter }))
// );
const ManufacturerFilter = React.lazy(() =>
    import("../../../../../Common/Filter/ManufacturerFilter").then(module => ({ default: module.ManufacturerFilter }))
);
const StateFilter = React.lazy(() =>
    import("../../../../../Common/Filter/StateFilter").then(module => ({ default: module.StateFilter }))
);

export interface IAssetListProps {
    manageComponentView(componentProp: IQuayCleanState): any;
    breadCrumItems: IBreadCrum[];
    view?: any;
}

export interface IAssetListState {
    isQrModelOpen: boolean;
    qrCodeUrl: string;
    isShowAssetHistoryModel: boolean,
    isAssociatModel: boolean,
    siteNameId: number;
    assetMasterId: number;
    isShowDueDateModel: boolean;
    qrDetails: any;
    isShowMovingHistoryModel: boolean,
    movingHistory: any[];
    AssetTypeMasterId: number;
    ATMManufacturer: string;
    AssetTypeMaster: string;
}

export const AssetList = (props: IAssetListProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;

    const [isPrintQRModelOpent, setIsPrintQRModelOpent] = React.useState<boolean>(false);
    const [state, setState] = React.useState<IAssetListState>({
        isQrModelOpen: false,
        qrCodeUrl: "",
        isShowAssetHistoryModel: false,
        isAssociatModel: false,
        siteNameId: 0,
        assetMasterId: 0,
        isShowDueDateModel: false,
        qrDetails: "",
        isShowMovingHistoryModel: false,
        movingHistory: [],
        AssetTypeMasterId: 0,
        ATMManufacturer: "",
        AssetTypeMaster: ""
    });
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const [assetHistoryItems, setAssetHistoryItems] = React.useState<any[]>([]);
    const [selectedSerialNumber, setSelectedSerialNumber] = React.useState<any>();
    const [selectedAssetLocation, setSelectedAssetLocation] = React.useState<any>();
    const [selectedManufacturer, setSelectedManufacturer] = React.useState<any>();
    const [ListEquipment, setListEquipment] = React.useState<any>([]);
    const [columnsEquipment, setcolumnsEquipment] = React.useState<any>([]);
    const [selectedStatus, setSelectedStatus] = React.useState<any>();
    const [selectedState, setSelectedState] = React.useState<any[]>([]);
    // const [defaultSite, setDefaultSite] = React.useState<any>();
    // const [selectedSite, setSelectedSite] = React.useState<any>();
    const [defaultSite, setDefaultSite] = React.useState<any[]>([]); // Store an array of selected options
    const [selectedSite, setSelectedSite] = React.useState<any[]>([]);
    const [StateName, setStateName] = React.useState<any>();
    const [lblAll, setlblAll] = React.useState<boolean>(false);
    const [IsFilter, setIsFilter] = React.useState<boolean>(false);
    const [isDisplayFilterDialog, setisDisplayFilterDialog] = React.useState<boolean>(false);
    const [keyUpdate, setKeyUpdate] = React.useState<number>(Math.random());
    const [siteOptions, setSiteOptions] = React.useState<IDropdownOption[]>();
    const tooltipId = useId('tooltip');
    const [AssetSiteName, setAssetSiteName] = React.useState<any[]>(currentUserRoleDetail?.stateManagerSitesItemIds || []);
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    let CurrentRefSiteName = React.useRef<any>();

    const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : 'grid');
    const [selectedAssetNames, setSelectedAssetNames] = React.useState<any[]>([]);

    const handleViewChange = (view: string) => {
        setCurrentView(view);
    };

    const onAssetNameChange = (selectedAssets: any[]): void => {
        // const selectedValues = selectedAssets.map(asset => asset.value); // Extract values from selected options
        // setSelectedAssetNames(selectedValues);
        const selectedValues = selectedAssets.map(asset => asset.text?.toString().trim());
        setSelectedAssetNames(selectedValues);
        // Check if "All Asset" is selected
        if (selectedAssets.some(asset => asset.label === " --All Asset--")) {
            setlblAll(true);
        } else {
            setlblAll(false);
        }
    };

    const onSerialNumberChange = (serialNumber: any): void => {
        setSelectedSerialNumber(serialNumber.text);
        if (serialNumber.label == " --All Serial Number--") {
            setlblAll(true);
        }
    };
    const onAssetLocationChange = (AssetLocation: any): void => {
        setSelectedAssetLocation(AssetLocation.text);
        if (AssetLocation.label == " --All Asset Location--") {
            setlblAll(true);
        }
    };
    const onManufacturerChange = (manufacturer: any): void => {
        setSelectedManufacturer(manufacturer.text);
        if (manufacturer.label == " --All Manufacturer--") {
            setlblAll(true);
        }
    };
    const onStatusChange = (status: any): void => {
        setSelectedStatus(status.text);
        if (status.label == " --All Status--") {
            setlblAll(true);
        }
    };

    const _onSiteChange = (options: any[]): void => {
        const selectedSiteIds = options.map(option => option.value); // Store selected site IDs
        const selectedSite = options.map(option => option.text); // Store selected site IDs
        setSelectedSite(selectedSite); // Update state with selected site IDs
        // Update defaultSite to reflect the selected options
        setDefaultSite(selectedSiteIds);
        // Check if 'All Site' option is selected and set the label flag
        const isAllSelected = options.some(option => option.label === " --All Site--");
        setlblAll(isAllSelected);
    };


    const onStateChange = (stateId: number[], option: any): void => {
        setSelectedState(stateId); // Store the selected state IDs as an array

        if (stateId.length === 0 || stateId == undefined) {
            setStateName([]);
        }
        if (option.label == " --All State--") {
            setIsFilter(false);
            setStateName([]);
        } else {
            setIsFilter(true);
        }

        setSelectedSite([]);
        setSelectedState(stateId);
        const select = ["Id,Title"];
        const filter = stateId.map(Id => `QCStateId eq '${Id}'`).join(' or ');
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            filter: filter,
            listName: ListNames.SitesMaster
        };
        let dropvalue: any = [];
        let nameofstate: any = [];
        provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((Site: any) => {
                dropvalue.push({ value: Site.Id, key: Site.Id, text: Site.Title, label: Site.Title });
                nameofstate.push(Site.Id);
            });
            if (response.length > 0) {
                console.log();

            } else {
                setStateName([]);
            }
            setSiteOptions(dropvalue);
            setStateName(nameofstate);
        }).catch((error) => {
            console.log(error);
            const errorObj = { ErrorMethodName: "onStateChange", CustomErrormessage: "error in on set sites master data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        });
        if (stateId.length === 0 || stateId == undefined) {
            setStateName([]);
        }
    };

    const _onclickMovingHistory = (item: any) => {
        try {
            void (async () => {
                if (!!item.ID) {
                    let data = await provider.getVersionHistoryById(ListNames.AssetMaster, item.ID);
                    const filteredRecords = data.filter(
                        (record: any) =>
                            record.AMStatus?.trim().toLowerCase() === "moving" ||
                            record.VersionLabel?.trim() === "1.0"
                    );
                    const sortedItemVersionHistory = filteredRecords.sort((a: any, b: any) => b.VersionLabel - (a.VersionLabel));
                    setState(prevState => ({ ...prevState, isShowMovingHistoryModel: true, isShowAssetHistoryModel: false, isAssociatModel: false, movingHistory: sortedItemVersionHistory, isShowAcquireModel: false, isShowDueDateModel: false, isShowMovingModel: false, siteNameId: 0, assetMasterId: 0 }));
                }
            })();
        } catch (error) {
            const errorObj = { ErrorMethodName: "_onclickMovingHistory", CustomErrormessage: "error in on moving history", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }

    };

    const _onclickDetailsView = (item: any) => {
        try {
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({
                text: item.Title, key: item.Title,
                manageCompomentItem: { currentComponentName: ComponentNameEnum.AssetDetails, isMaster: true, view: currentView, siteMasterId: item.ID, MasterId: item.SiteNameId, preViousCompomentName: ComponentNameEnum.AssetList, breadCrumItems: breadCrumItems },
                currentCompomnetName: "AssetDetails",
                onClick: onBreadcrumbItemClicked,
                manageComponent: props.manageComponentView
            });
            props.manageComponentView({ currentComponentName: ComponentNameEnum.AssetDetails, isMaster: true, view: currentView, siteMasterId: item.ID, MasterId: item.SiteNameId, preViousComponentName: ComponentNameEnum.AssetList, breadCrumItems: breadCrumItems });
        } catch (error) {
            const errorObj = { ErrorMethodName: "_onclickDetailsView", CustomErrormessage: "error in on click details view", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }
    };



    const getColumns = () => {
        setcolumnsEquipment([
            {
                key: "key10", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 120, maxWidth: 150,
                onRender: ((itemID: any) => {
                    let isDueDate: boolean = false;
                    if (!!itemID.DueDate) {
                        isDueDate = isWithinNextMonthRange(itemID.fullServiceDueDate);

                    }
                    return <>
                        <div className='dflex'>
                            <div><Link className="actionBtn btnMoving dticon" onClick={() => {

                            }}>
                                <TooltipHost
                                    content={"Moving History"}
                                    id={tooltipId}
                                >
                                    <div onClick={() => _onclickMovingHistory(itemID)}>
                                        <FontAwesomeIcon icon="timeline" /></div>
                                </TooltipHost>
                            </Link></div >

                            <div><Link className="actionBtn btnInfo dticon" onClick={() => {
                                setState(prevState => ({ ...prevState, isShowAssetHistoryModel: true, isAssociatModel: false, isShowMovingModel: false, isShowDueDateModel: false, siteNameId: itemID.SiteNameId, assetMasterId: itemID.ID }));
                            }}>
                                <TooltipHost
                                    content={"Asset History"}
                                    id={tooltipId}
                                >
                                    <FontAwesomeIcon icon="clock-rotate-left" />
                                </TooltipHost>
                            </Link>
                            </div >
                            <div><Link className="actionBtn btnView dticon" onClick={() => {
                            }}>
                                <TooltipHost
                                    content={"Details"}
                                    id={tooltipId}
                                >
                                    <div onClick={() => _onclickDetailsView(itemID)}>
                                        <FontAwesomeIcon icon="eye" /></div>
                                </TooltipHost>
                            </Link></div >

                            {(isDueDate) &&
                                <div><Link className="actionBtn btnDanger dticon" onClick={() => {
                                    if (itemID.isCrudVisible)
                                        setState(prevState => ({ ...prevState, isShowAcquireModel: false, isShowAssetHistoryModel: false, isAssociatModel: false, isShowDueDateModel: true, isShowMovingModel: false, siteNameId: itemID.SiteNameId, assetMasterId: itemID.ID }));
                                }}>
                                    <TooltipHost
                                        content={"Due Date"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon icon="circle-exclamation" />
                                    </TooltipHost>
                                </Link></div >}
                        </div ></>;
                })
            },
            {
                key: 'Photo', name: 'Photo', fieldName: 'AssetPhotoThumbnailUrl', minWidth: 110, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => {
                    return (
                        // <img src={item.AssetPhotoThumbnailUrl} height="75px" width="75px" className="course-img-first" />
                        <LazyLoadImage src={item.AssetPhotoThumbnailUrl}
                            width={75} height={75}
                            placeholderSrc={notFoundImage}
                            alt="photo"
                            className="course-img-first"
                            effect="blur"
                        />
                    );
                }
            },
            {
                key: "key1", name: 'Name', fieldName: 'Title', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.Title != "") {
                        return (
                            <>
                                <Link className="tooltipcls">
                                    <TooltipHost content={item.Title} id={tooltipId}>
                                        <div onClick={() => _onclickDetailsView(item)}>{item.Title}</div>
                                    </TooltipHost>
                                </Link>
                            </>
                        );
                    }
                },
            },
            { key: "key2", name: 'Site Name', fieldName: 'SiteName', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            { key: "key2", name: 'Manufacturer', fieldName: 'Manufacturer', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            { key: "key3", name: 'Model', fieldName: 'Model', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            { key: "key4", name: 'Asset Type', fieldName: 'AssetType', isResizable: true, minWidth: 70, maxWidth: 150, isSortingRequired: true },
            { key: "key5", name: 'Color', fieldName: 'QCColor', isResizable: true, minWidth: 60, maxWidth: 100, isSortingRequired: true },
            { key: "key6", name: 'Status', fieldName: 'Status', isResizable: true, minWidth: 70, maxWidth: 100, isSortingRequired: true },
            { key: "AssetCategory", name: 'Asset Location', fieldName: 'AssetCategory', isResizable: true, minWidth: 70, maxWidth: 120, isSortingRequired: true },
            {
                key: "key7", name: 'Book value', fieldName: 'PurchasePrice', isResizable: true, minWidth: 60, maxWidth: 80, isSortingRequired: true,

                onRender: ((itemID: any) => {

                    return <>
                        <div className="">{formatPriceDecimal(itemID.PurchasePrice)}</div>
                    </>;
                })
            },
            {
                key: 'key8', name: 'Service Due Date', fieldName: 'ServiceDueDate', minWidth: 120, maxWidth: 160,
                onRender: ((itemID: any) => {
                    let isDueDate: boolean = false;
                    if (!!itemID.DueDate) {
                        isDueDate = isWithinNextMonthRange(itemID.fullServiceDueDate);
                    }
                    return <>
                        <div className='dflex'>
                            {isDueDate ?
                                <div className="redBadgeact badge-mar-o">{itemID.ServiceDueDate}</div>
                                : <div className={itemID.ServiceDueDate && "greenBadgeact badge-mar-o"}>{itemID.ServiceDueDate}</div>
                            }
                        </div ></>;
                })
            },
            {
                key: "key9", name: 'Serial Number', fieldName: 'SerialNumber', isResizable: true, minWidth: 100, maxWidth: 100, isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.SerialNumber != "") {
                        return (
                            <>
                                <Link className="tooltipcls">
                                    <TooltipHost content={item.SerialNumber} id={tooltipId}>
                                        {item.SerialNumber}
                                    </TooltipHost>
                                </Link>
                            </>
                        );
                    }
                },
            },

            {
                key: 'Attachment', name: 'Audit Reports', fieldName: 'Attachment', minWidth: 100, maxWidth: 150, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => {
                    if (item.Attachment != null) {
                        return (
                            <><Link className="actionBtn btnPDF dticon" target="_blank" rel="noopenernoreferrer" onClick={() => { window.open(item.Attachment, '_blank'); }}>
                                <TooltipHost
                                    content={"View Audit Reports"}
                                    id={tooltipId}
                                >
                                    <FontAwesomeIcon icon="file-pdf" />
                                </TooltipHost>

                            </Link></>
                        );
                    } else {
                        return (
                            <Link className="actionBtn btnDisable dticon">
                                <TooltipHost
                                    content={"Document Not Available"}
                                    id={tooltipId}
                                >
                                    <FontAwesomeIcon icon="file-pdf" />
                                </TooltipHost>

                            </Link >
                        );
                    }
                }
            },
            {
                key: 'Photo', name: 'QR Code', fieldName: 'QRCode', minWidth: 110, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => {
                    return (
                        <TooltipHost
                            content={"View QR Code"}
                            id={tooltipId}
                        >
                            <div onClick={() => {
                                setKeyUpdate(Math.random());
                                setState(prevState => ({ ...prevState, isQrModelOpen: true, qrDetails: item, qrCodeUrl: item.QRCode }));
                            }
                            }>
                                {/* <img src={item.QRCode} height="75px" width="75px" className="course-img-first" /> */}
                                <LazyLoadImage src={item.QRCode}
                                    width={75} height={75}
                                    placeholderSrc={notFoundImage}
                                    alt="photo"
                                    className="course-img-first"
                                    effect="blur"
                                />

                            </div>
                        </TooltipHost>
                    );
                }
            },

        ]);
    }

    const _EquipmentMaster = async (assetHistory?: any[], sites?: any) => {
        let assetHistoryItem = assetHistory || (assetHistoryItems?.length > 0 ? assetHistoryItems : []);
        setIsLoading(true);

        let filterArray: string[] = [];
        let siteNameIdArray: any[] = [];
        let adUserArray: any[] = [];
        let userRole: string = currentUserRoleDetail?.isAdmin ? 'Admin' :
            currentUserRoleDetail?.isStateManager ? 'StateManager' :
                currentUserRoleDetail?.isSiteManager ? 'SiteManager' :
                    currentUserRoleDetail?.isUser ? 'User' : '';

        // Handle SiteManager or User-specific logic
        if (userRole === 'SiteManager') {
            siteNameIdArray = currentUserRoleDetail?.siteManagerItem.map(r => r.ID);
        } else if (userRole === 'User') {
            adUserArray = currentUserRoleDetail?.userItems.map(r => r.ID);
        }

        // Construct CAML Query Filters
        const filterFields = [
            // { field: 'Title', value: selectedAssetNames },
            { field: 'SerialNumber', value: selectedSerialNumber },
            { field: 'AssetCategory', value: selectedAssetLocation },
            { field: 'Manufacturer', value: selectedManufacturer },
            { field: 'AMStatus', value: selectedStatus },
            { field: 'SiteName', value: defaultSite.length > 0 && defaultSite, lookup: true }
        ];

        filterFields.forEach(({ field, value, lookup }) => {
            if (value) {
                if (field === 'SiteName' && Array.isArray(value) && value.length > 0) {
                    // Handle multiple SiteName values
                    const validSites = value.filter(site => site != null && site !== ''); // Filter out null/empty values
                    if (validSites.length > 0) {
                        let siteFilter = '';

                        // Generate <Eq> tags for each valid site
                        const eqConditions = validSites.map(
                            site => `<Eq><FieldRef Name='${field}' LookupId='TRUE'/><Value Type='Lookup'>${site}</Value></Eq>`
                        );

                        // Wrap all <Eq> conditions in <Or> tags
                        while (eqConditions.length > 1) {
                            const first = eqConditions.shift();
                            const second = eqConditions.shift();
                            eqConditions.unshift(`<Or>${first}${second}</Or>`);
                        }

                        siteFilter = eqConditions[0]; // The final nested <Or> condition
                        filterArray.push(siteFilter);
                    }
                } else {
                    // For other fields or single values, add a regular <Eq>
                    filterArray.push(`<Eq><FieldRef Name='${field}'${lookup ? " LookupId='TRUE'" : ''}/><Value Type='${lookup ? 'Lookup' : 'Text'}'>${value}</Value></Eq>`);
                }
            }
        });

        const combinedFilter = filterArray.length > 1 ? filterArray.reduce((prev, current) => `<And>${prev}${current}</And>`) : filterArray[0] || '';
        const queryFilter = combinedFilter ? `<Where>${combinedFilter}</Where>` : '';

        const camlQuery = `
            <View>
                <ViewFields>
                    ${[
                "ID", "Attachments",
                'FANumber',
                "AssetCategory", "AttachmentFiles", "AssetPhotoThumbnailUrl", "QCOrder", "SiteName", "SiteName/Title",
                "QRCode", "Title", "SiteNameId", "AssetType", "NumberOfItems", "Manufacturer", "Model", "QCColor", "AMStatus",
                "PurchasePrice", "PurchaseDate", "ServiceDueDate", "SerialNumber", "ConditionNotes", "AssetLink", "AssetPhoto",
                "PreviousOwnerId", "PreviousOwner/EMail", "CurrentOwnerId", "CurrentOwner/EMail", "Created", "ATMManufacturer,FANumber",
                "AssetTypeMasterId", "AssetTypeMaster/Title"
            ].map(field => `<FieldRef Name='${field}' />`).join('')}
                </ViewFields>
                <Query>
                    ${queryFilter}
                </Query>
                <RowLimit>5000</RowLimit>
            </View>
        `;

        try {
            const siteURL = context.pageContext.web.absoluteUrl;
            const results = await provider.getItemsByCAMLQuery(ListNames.AssetMaster, camlQuery, null, siteURL);
            setIsLoading(true);

            const siteNameIdArray = currentUserRoleDetail?.isSiteManager ? currentUserRoleDetail.siteManagerItem.map(r => r.ID) : [];
            const adUserArray = currentUserRoleDetail?.isUser ? currentUserRoleDetail.userItems.map(r => r.ID) : [];
            const userRole = currentUserRoleDetail?.isAdmin ? 'Admin' :
                currentUserRoleDetail?.isStateManager ? 'StateManager' :
                    currentUserRoleDetail?.isSiteManager ? 'SiteManager' :
                        currentUserRoleDetail?.isUser ? 'User' : '';

            const processData = (data: any) => {
                const fixImgURL = `${context.pageContext.web.serverRelativeUrl}/Lists/AssetMaster/Attachments/${data.ID}/`;

                const getAttachmentDataUrl = (attachmentFiles: any[], baseUrl: string, defaultImage: string) => {
                    if (attachmentFiles?.length > 0) {
                        const attachment = attachmentFiles[0];
                        return attachment.ServerRelativeUrl || (attachment.FileName ? `${baseUrl}${attachment.FileName}` : defaultImage);
                    }
                    return null;
                };

                const getParsedImageUrl = (jsonData: string, baseUrl: string, defaultImage: string) => {
                    try {
                        const data = JSON.parse(jsonData);
                        return data.serverRelativeUrl || (data.fileName ? `${baseUrl}${data.fileName}` : defaultImage);
                    } catch {
                        return defaultImage;
                    }
                };

                const attachmentFiledata = getAttachmentDataUrl(data.AttachmentFiles, fixImgURL, notFoundImage);
                const AssetPhotoURL = data.AssetPhoto ? getParsedImageUrl(data.AssetPhoto, fixImgURL, notFoundImage) : notFoundImage;
                // const NewQRCodeUrl = data.QRCode?.serverRelativeUrl ? getParsedImageUrl(data.QRCode?.serverRelativeUrl, fixImgURL, notFoundImage) : notFoundImage;

                const testedDate = assetHistoryItem.find((r: any) => r.SiteNameId === data.SiteNameId && r.AssetMasterId === data.Id)?.Created;

                const commonFields = {
                    ID: data.ID,
                    Title: data.Title || "",
                    SiteNameId: data.SiteName[0]?.lookupId || "",
                    SiteName: data.SiteName[0]?.lookupValue || "",
                    AssetType: data.AssetType || "",
                    Manufacturer: data.Manufacturer || "",
                    Model: data.Model || "",
                    QCColor: data.QCColor || "",
                    FANumber: data?.FANumber || "",

                    Status: data.AMStatus || "",
                    PurchasePrice: data.PurchasePrice || "",
                    ServiceDueDate: data.ServiceDueDate ? getConvertedDate(data.ServiceDueDate) : "",
                    SerialNumber: data.SerialNumber || "",
                    AssetImage: AssetPhotoURL,
                    Attachment: attachmentFiledata,
                    // NumberOfItems: data.NumberOfItems || "",
                    AssetCategory: data.AssetCategory || "",
                    fullServiceDueDate: data.ServiceDueDate || "",
                    // QCOrder: data.QCOrder || "",
                    DueDate: data.ServiceDueDate || "",
                    PurchaseDate: data.PurchaseDate || "",
                    AssetLink: data.AssetLink || "",
                    ConditionNotes: data.ConditionNotes || "",
                    CurrentOwnerId: data.CurrentOwnerId || "",
                    PreviousOwnerId: data.PreviousOwnerId || "",
                    CurrentOwner: data.CurrentOwner?.EMail || "",
                    PreviousOwner: data.PreviousOwner?.EMail || "",
                    AssetTypeMasterId: data.AssetTypeMasterId || 0,
                    AssetTypeMaster: data.AssetTypeMaster?.Title || "",
                    ATMManufacturer: data.ATMManufacturer || "",
                    AssetPhotoThumbnailUrl: data.AssetPhotoThumbnailUrl || notFoundImage,
                    // QRCode: QRCodeUrl,
                    QRCode: data.QRCode?.serverRelativeUrl,
                    TestedDate: testedDate ? getConvertedDate(testedDate) : getConvertedDate(data.Created),
                };

                switch (userRole) {
                    case 'Admin':
                    case 'StateManager':
                        return { ...commonFields, isCrudVisible: true };

                    case 'SiteManager':
                        return siteNameIdArray.includes(commonFields?.SiteNameId) && currentUserRoleDetail.isSiteManager ? {
                            ...commonFields,
                            isCrudVisible: currentUserRoleDetail.isAdmin || currentUserRoleDetail.siteManagerItem.some(
                                (r: any) => r.Id === commonFields?.SiteNameId && r.SiteManagerId?.includes(currentUserRoleDetail.Id)
                            ),
                        } : null;

                    case 'User':
                        return adUserArray.includes(commonFields?.SiteNameId) && currentUserRoleDetail.isUser ? { ...commonFields, isCrudVisible: false } : null;

                    default:
                        return {};
                }
            };
            const preData = results.map(processData).filter(Boolean);

            const AssetListData = Array.isArray(selectedAssetNames) && selectedAssetNames.length > 0
                ? preData.filter((item: any) => selectedAssetNames.includes(item.Title))
                : preData; // Return full data if no filters applied

            // console.log(AssetListData);

            // const AssetListData = results.map(processData).filter(Boolean);

            let matchingRecords: any = [];
            if (currentUserRoleDetail?.isAdmin) {
                if ((!!StateName && StateName.length > 0) || IsFilter === true) {
                    matchingRecords = AssetListData.filter((record: any) => StateName.includes(record?.SiteNameId));
                    setListEquipment(matchingRecords.filter((r: { ID: any; }) => !!r && !!r.ID));
                } else {
                    setListEquipment(AssetListData.filter((r: any) => !!r && !!r.ID));
                }
            } else {
                if (currentUserRoleDetail?.isStateManager) {
                    if ((!!sites && sites.length > 0) || IsFilter === true) {
                        matchingRecords = AssetListData.filter((record: any) => sites.includes(record?.SiteNameId));
                        setListEquipment(matchingRecords.filter((r: { ID: any; }) => !!r && !!r.ID));
                    }
                } else {
                    if ((!!StateName && StateName.length > 0) || IsFilter === true) {
                        matchingRecords = AssetListData.filter((record: any) => StateName.includes(record?.SiteNameId));
                        setListEquipment(matchingRecords.filter((r: { ID: any; }) => !!r && !!r.ID));
                    } else {
                        setListEquipment(AssetListData.filter((r: any) => !!r && !!r.ID));
                    }
                }
            }

            setIsLoading(false);
        } catch (ex) {
            console.log(ex);
            const errorObj = {
                ErrorMessage: ex.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  EquipmentMaster",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "EquipmentMaster AssetList"
            };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
            const errorMessage = getErrorMessageValue(error.message);
            setError(errorMessage);
            sethasError(true);
        }
    };

    const _onItemInvoked = (itemID: any): void => {
        _onclickDetailsView(itemID);
    };

    const onClickClose = async () => {
        setState(prevState => ({
            ...prevState,
            isAssociatModel: false, isShowAssetHistoryModel: false, isShowDueDateModel: false, isShowMovingHistoryModel: false
        }));
        let assetHistoryItems = await getAssetHistory(provider);
        let sites = [];
        if (AssetSiteName.length > 0) {
            sites = AssetSiteName;
        } else {
            if (CurrentRefSiteName.current.length > 0) {
                sites = CurrentRefSiteName.current;
            }
        }
        _EquipmentMaster(assetHistoryItems, sites);
    };

    React.useEffect(() => {
        let permssiion = showPremissionDeniedPage(currentUserRoleDetail);
        if (permssiion.length == 0) {
            props.manageComponentView({ currentComponentName: ComponentNameEnum.AccessDenied });
        }
        (async () => {
            let assetHistory = assetHistoryItems;
            if (assetHistoryItems && assetHistoryItems.length == 0)
                assetHistory = await getAssetHistory(provider);
            if (assetHistory?.length) {
                setAssetHistoryItems(assetHistory);
            }
            if (!currentUserRoleDetail?.isStateManager) {
                _EquipmentMaster(assetHistory);
            } else if (currentUser) {
                const sites = AssetSiteName?.length ? AssetSiteName : CurrentRefSiteName.current || [];
                _EquipmentMaster(assetHistory, sites);
            }
        })();

    }, [isRefreshGrid, selectedStatus, StateName, selectedSite, selectedManufacturer, selectedAssetLocation, selectedSerialNumber, selectedAssetNames]);

    React.useEffect(() => {
        getColumns();
    }, []);

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setCurrentView('card');
        } else {
            // if (props.view == "" || props.view === undefined) {
            //     setCurrentView('grid');
            // }
            setCurrentView('grid');
        }
    }, []);

    const _onClickSearch = () => {
        if (!selectedStatus && !selectedSite && !selectedManufacturer && !selectedAssetLocation && !selectedSerialNumber && !selectedAssetNames && lblAll === false) {
            setisDisplayFilterDialog(true);
        } else {
            _EquipmentMaster();
        }
    };

    const onCloseModel = () => {
        setisDisplayFilterDialog(false);
    };

    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };

    const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
    React.useEffect(() => {
        provider.getCurrentUser().then(async (currentUserResponse) => {
            const groups = await getSiteGroupsPermission(provider);
            if (groups.some((r: any) => r.Id === currentUserResponse.Id)) {
                setIsAdmin(true);
            }
        }).catch(console.error);
    }, []);

    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>

            {isPrintQRModelOpent &&
                <React.Suspense fallback={<></>}>
                    <PrintQrCode manageComponentView={props.manageComponentView} items={ListEquipment} onClickClose={() => setIsPrintQRModelOpent(false)} isAssetQR={true} isChemicalQR={false} />
                </React.Suspense>}
            {isDisplayFilterDialog &&
                <CustomModal
                    isModalOpenProps={isDisplayFilterDialog}
                    dialogWidth={"300px"}
                    setModalpopUpFalse={onCloseModel}
                    subject={"Warning"}
                    message={<div>Please select filter value</div>}
                    yesButtonText="Ok"
                    onClickOfYes={onCloseModel}
                />}
            {isLoading && <Loader />}
            {state.isShowMovingHistoryModel && <MovingHistory assetMasterId={state.assetMasterId} movingHistory={state.movingHistory} context={context} provider={provider} siteNameId={state.siteNameId} onClickClose={onClickClose} isModelOpen={state.isShowMovingHistoryModel} />}
            {state.isShowAssetHistoryModel &&
                <React.Suspense fallback={<></>}>
                    <AssetHistory assetMasterId={state.assetMasterId} context={context} provider={provider} siteNameId={state.siteNameId} onClickClose={onClickClose} isModelOpen={state.isShowAssetHistoryModel} />
                </React.Suspense>
            }
            {state.isShowDueDateModel && <UpdateServiceHistroy provider={provider} assetMasterId={state.assetMasterId} onClickClose={onClickClose} isModelOpen={state.isShowDueDateModel} context={context} alldata={state} />}
            {state.isAssociatModel && <AssociatAssetType AssetTypeMasterId={state.AssetTypeMasterId} AssetTypeMaster={state.AssetTypeMaster} ATMManufacturer={state.ATMManufacturer} assetMasterId={state.assetMasterId} context={context} provider={provider} onClickClose={onClickClose} isModelOpen={state.isAssociatModel} />}
            {state.isQrModelOpen &&
                <React.Suspense fallback={<></>}>
                    <PrintQrCode isDetailView={true} key={keyUpdate} manageComponentView={props.manageComponentView} items={[state.qrDetails]} onClickClose={() => setState(prevState => ({ ...prevState, isQrModelOpen: false }))} isAssetQR={true} isChemicalQR={false} />
                </React.Suspense>
            }
            <div className="boxCard">
                <div className="formGroup">
                    <div className="ms-Grid mb-3">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <h1 className="mainTitle">Assets</h1>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <div className="customebreadcrumb">
                                    <Breadcrumb
                                        items={props.breadCrumItems as any[]}
                                        maxDisplayedItems={3}
                                        ariaLabel="Breadcrumb with items rendered as buttons"
                                        overflowAriaLabel="More links"
                                    />
                                </div>
                            </div>

                            <div className="filtermrg mt-2">
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                    <div className="formControl">
                                        <React.Suspense fallback={<></>}>
                                            <AssetNameFilter
                                                loginUserRoleDetails={currentUserRoleDetail}
                                                selectedAssetName={selectedAssetNames}
                                                onAssetNameChange={onAssetNameChange}
                                                provider={provider}
                                                isRequired={true}
                                                siteNameId={0}
                                                AllOption={true}
                                                defaultSelectedSitesId={!!selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId}
                                                isAdmin={isAdmin}
                                            />
                                        </React.Suspense>
                                    </div>
                                </div>
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                    <div className="formControl">
                                        <React.Suspense fallback={<></>}>
                                            <SerialNumberFilter
                                                loginUserRoleDetails={currentUserRoleDetail}
                                                selectedSerialNumber={selectedSerialNumber}
                                                onSerialNumberChange={onSerialNumberChange}
                                                provider={provider}
                                                isRequired={true}
                                                siteNameId={0}
                                                defaultSelectedSitesId={!!selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId}
                                                isAdmin={isAdmin}
                                                AllOption={true} />
                                        </React.Suspense>
                                    </div>
                                </div>
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                    <div className="formControl">
                                        <React.Suspense fallback={<></>}>
                                            <AssetLocationFilter
                                                loginUserRoleDetails={currentUserRoleDetail}
                                                selectedAssetLocation={selectedAssetLocation}
                                                onAssetLocationChange={onAssetLocationChange}
                                                provider={provider}
                                                isRequired={true}
                                                siteNameId={0}
                                                defaultSelectedSitesId={!!selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId}
                                                isAdmin={isAdmin}
                                                AllOption={true} />
                                        </React.Suspense>
                                    </div>
                                </div>
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                    <div className="formControl">
                                        <React.Suspense fallback={<></>}>
                                            <ManufacturerFilter
                                                loginUserRoleDetails={currentUserRoleDetail}
                                                selectedManufacturer={selectedManufacturer}
                                                onManufacturerChange={onManufacturerChange}
                                                provider={provider}
                                                isRequired={true}
                                                defaultSelectedSitesId={!!selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId}
                                                isAdmin={isAdmin}
                                                AllOption={true} />
                                        </React.Suspense>
                                    </div>
                                </div>
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                    <div className="formControl">
                                        <React.Suspense fallback={<></>}>
                                            <StatusFilter
                                                selectedStatus={selectedStatus}
                                                onStatusChange={onStatusChange}
                                                provider={provider}
                                                isRequired={true}
                                                AllOption={true} />
                                        </React.Suspense>
                                    </div>
                                </div>
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                    <div className="formControl">
                                        <React.Suspense fallback={<></>}>
                                            {/* <StateFilter
                                                loginUserRoleDetails={currentUserRoleDetail}
                                                selectedState={selectedState}
                                                onStateChange={onStateChange}
                                                provider={provider}
                                                isRequired={true}
                                                AllOption={true} /> */}
                                            <MultiStateFilter
                                                loginUserRoleDetails={currentUserRoleDetail}
                                                selectedState={selectedState}
                                                onStateChange={onStateChange}
                                                provider={provider}
                                                isRequired={true}
                                                AllOption={true}
                                            />
                                        </React.Suspense>
                                    </div>
                                </div>
                                {siteOptions && selectedState.length > 0 &&
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                        <div className="formControl">
                                            {/* <ReactDropdown
                                                options={siteOptions}
                                                isMultiSelect={false}
                                                defaultOption={defaultSite}
                                                onChange={_onSiteChange}
                                                placeholder={"Site"}
                                            /> */}
                                            <ReactDropdown
                                                options={siteOptions}
                                                isMultiSelect={true}  // Enable multiple selection
                                                defaultOption={defaultSite}
                                                onChange={_onSiteChange}
                                                placeholder={"Site"}
                                            />

                                        </div>
                                    </div>
                                }

                                {false && <div className="ms-Grid-col mb-2 ms-sm12 ms-md6 ms-lg4  ms-xl2">
                                    <PrimaryButton className="btnSearch btn btn-primary" onClick={() => _onClickSearch()} text="Search" />
                                </div>}
                            </div>

                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                {currentView === "grid" ? <>
                                    <MemoizedDetailList
                                        manageComponentView={props.manageComponentView}
                                        columns={columnsEquipment}
                                        items={ListEquipment || []}
                                        reRenderComponent={true}
                                        searchable={true}
                                        isAddNew={true}
                                        addNewContent={
                                            <div className={window.innerWidth > 768 ? "dflex mar-bot-10 mobile-icon-space" : "dflex mar-bot-10 mobile-icon-space"}>
                                                <Link className="actionBtn iconSize btnInfo  ml-10 dticon" style={{ paddingBottom: "2px" }} onClick={() => setIsPrintQRModelOpent(true)}
                                                    text="">
                                                    <TooltipHost
                                                        content={"Print QR Code"}
                                                        id={tooltipId}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={"print"}
                                                        />
                                                    </TooltipHost>
                                                </Link>
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

                                            </div>

                                        }
                                        onItemInvoked={_onItemInvoked}
                                        onSelectedItem={_onItemSelected}
                                    />
                                </> :
                                    <>
                                        <div className="dflex">
                                            <Link className="actionBtn iconSize btnInfo  ml-10 dticon" style={{ paddingBottom: "2px" }} onClick={() => setIsPrintQRModelOpent(true)}
                                                text="">
                                                <TooltipHost
                                                    content={"Print QR Code"}
                                                    id={tooltipId}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={"print"}
                                                    />
                                                </TooltipHost>
                                            </Link>
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
                                        </div>
                                        <AssetCardView
                                            _onclickDetailsView={_onclickDetailsView}
                                            _onclickMovingHistory={_onclickMovingHistory}
                                            items={ListEquipment}
                                            manageComponentView={props.manageComponentView}
                                            setState={setState}
                                            setKeyUpdate={setKeyUpdate}
                                            _onclickEdit={function (itemID: any): void {
                                                throw new Error("Function not implemented.");
                                            }} _onclickconfirmdelete={function (itemID: any): void {
                                                throw new Error("Function not implemented.");
                                            }} />

                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>;
    }


};