/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-key */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-self-assign */
/* eslint-disable require-atomic-updates */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ComponentNameEnum, devSiteURL, ListNames, mainSiteURL, qaSiteURL, qrcodeSiteURL, stageSiteURLNew, UserActionEntityTypeEnum, UserActivityActionTypeEnum, ViewType } from "../../../../../Common/Enum/ComponentNameEnum";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IQuayCleanState } from "../../QuayClean";
import {
    getAssetHistory, getConvertedDate,
    getErrorMessageValue, logGenerator,
    onBreadcrumbItemClicked, generateAndSaveKendoPDF,
    formatPrice,
    generateExcelTable,
    UserActivityLog,
    getCAMLQueryFilterExpression,
    mapSingleValue,
    _isOverdue,
    saveCopyThumbNailImage,
    copyListAttachmentToAnotherList,
    formatPriceDecimal,
    parsePriceNumber,
    getStateBySiteId,
    getStateBySiteNameId,
    getSiteGroupsPermission,
} from "../../../../../Common/Util";

import { DialogType, PrimaryButton, mergeStyleSets } from "office-ui-fabric-react";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');
import { DefaultButton, IContextualMenuProps, Link, SelectionMode, Shimmer, ShimmerElementType, Slider, Spinner, SpinnerSize, TooltipHost } from "@fluentui/react";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { AMStatus, DataType } from "../../../../../Common/Constants/CommonConstants";
import { isWithinNextMonthRange } from "../../../../../Common/Util";
import { Loader } from "../../CommonComponents/Loader";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { SPHttpClient } from "@microsoft/sp-http";
import moment from "moment";
import * as XLSX from 'xlsx';
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import CustomModal from "../../CommonComponents/CustomModal";
import DragAndDrop from "../../CommonComponents/FileUpload/DragandDrop";
import { toastService } from "../../../../../Common/ToastService";
import { ValidateForm } from "../../../../../Common/Validation";
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import * as qrcode from 'qrcode';
import CommonPopup from "../../CommonComponents/CommonSendEmailPopup";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import { Environment, EnvironmentType } from "@microsoft/sp-core-library";
import { EqupmentCountCard } from "./EquipmentCountCard";
import { Suspense } from "react";
import { AssetCardView } from "./AssetCardView";
import { appGlobalStateAtom, appSiteStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { Provider, useAtom, useAtomValue } from "jotai";

import { IExportColumns } from "../EquipmentChecklist/Question";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import CamlBuilder from "camljs";
import { IAssetLocationPermission } from "../../../../../Interfaces/IAddNewSite";
import { Messages } from "../../../../../Common/Constants/Messages";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";
import { getParsedImageUrl, getSiteAssetQRCode } from "../../CommonComponents/CommonMethods";
import { LazyLoadImage } from "react-lazy-load-image-component";
const imgLogo = require('../../../../quayClean/assets/images/qc_logo.png');

const AssetHistory = React.lazy(() =>
    import("./AssetHistory").then(module => ({ default: module.AssetHistory }))
);
const AcquireAsset = React.lazy(() =>
    import("./AcquireAsset").then(module => ({ default: module.AcquireAsset }))
);
const MoveAsset = React.lazy(() =>
    import("./MoveAsset").then(module => ({ default: module.MoveAsset }))
);
const UpdateServiceHistroy = React.lazy(() =>
    import("./UpdateServiceHistroy").then(module => ({ default: module.UpdateServiceHistroy }))
);
const MovingHistory = React.lazy(() =>
    import("./MovingHistory").then(module => ({ default: module.MovingHistory }))
);
const AssociatAssetType = React.lazy(() =>
    import("./AssociatAssetType").then(module => ({ default: module.AssociatAssetType }))
);
const PrintQrCode = React.lazy(() =>
    import("../QRCode/PrintQrCode").then(module => ({ default: module.PrintQrCode }))
);
const GenrateQRCode = React.lazy(() =>
    import("../../CommonComponents/GenrateQRCode").then(module => ({ default: module.GenrateQRCode }))
);
const PdfGenerateEquipment = React.lazy(() =>
    import("../../CommonComponents/AssetPDF/PdfGenerateEquipment").then(module => ({ default: module.default }))
);
const AssetNameFilterLazy = React.lazy(() =>
    import("../../../../../Common/Filter/AssetName").then(module => ({ default: module.AssetNameFilter }))
);
const SerialNumberFilterLazy = React.lazy(() =>
    import("../../../../../Common/Filter/SerialNumberFilter").then(module => ({ default: module.SerialNumberFilter }))
);
const AssetLocationFilterLazy = React.lazy(() =>
    import("../../../../../Common/Filter/AssetLocationFilter").then(module => ({ default: module.AssetLocationFilter }))
);
const ManufacturerFilterLazy = React.lazy(() =>
    import("../../../../../Common/Filter/ManufacturerFilter").then(module => ({ default: module.ManufacturerFilter }))
);
const StatusFilterLazy = React.lazy(() =>
    import("../../../../../Common/Filter/StatusFilter").then(module => ({ default: module.StatusFilter }))
);
const FANumberFilterLazy = React.lazy(() =>
    import("../../../../../Common/Filter/FANumberFilter").then(module => ({ default: module.FANumberFilter }))
);

export interface IEquipmentAssetProps {
    provider: IDataProvider;
    context: WebPartContext;
    siteMasterId: any;
    manageComponentView(componentProp: IQuayCleanState): any;
    URL?: String;
    qCState?: string;
    siteName?: string;
    breadCrumItems: any[];
    componentProp: IQuayCleanState;
    loginUserRoleDetails: ILoginUserRoleDetails;
    IsSupervisor?: boolean;
    dataObj?: any;
    dataObj2?: any;
    view?: string;
    isShowAssetLocationAccess?: any;
    isSiteInformationView?: boolean;
    onClickAccesLocation?: any;
}

mergeStyleSets({
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
        maxWidth: '600px',
        width: '300px',
        padding: '0 1.5em 2em',
        position: 'absolute',
        top: '50%',
        transform: 'translate(-50%, -50%)',
    }
});

interface IEquipmentAssetState {
    isShowAssetHistoryModel: boolean;
    assetLocationPermission: IAssetLocationPermission[]
    isShowMovingHistoryModel: boolean;
    isShowMovingModel: boolean;
    isShowDueDateModel: boolean;
    isShowAcquireModel: boolean;
    siteNameId: number;
    assetMasterId: number;
    assetMasterName?: string;
    isReload: boolean;
    siteMasterId?: any;
    MasterId?: any;
    isQRCodeModelOpen: boolean;
    qrCodeUrl: string;
    qrDetails: any;
    isUploadModelOpen: boolean;
    mdlConfigurationFile: any;
    isUploadFileValidationModelOpen: boolean;
    dialogContentProps: any;
    movingHistory: any;
    uploadFileErrorMessage: any;
    isUploadColumnValidationModelOpen: boolean;
    dataObj?: any;
    isAssociatModel: boolean;
    AssetTypeMasterId: Number;
    AssetTypeMaster: string;
    ATMManufacturer: string;
    isShowCopyAssetModal: boolean;
    CopyAssetItem: any;
    isPrintSettingDialogOpen: boolean;
    finalSelectedPrintOptions: string[];
    selectedPrintOptions: string[];
    siteModuleConfiguration: any;
    isReloadPrint: boolean;
    isAssetHistoryAndPermissionLoaded: boolean
}

export interface IExcelUploadProps {
    spHttpClient: SPHttpClient;
}
export interface IExcelUploadState {
    excelData: any[];
}

export const EquipmentAsset = (props: IEquipmentAssetProps) => {
    const [assetHistoryItems, setAssetHistoryItems] = React.useState<any[]>([]);
    const [state, setState] = React.useState<IEquipmentAssetState>({
        isShowAssetHistoryModel: false,
        isPrintSettingDialogOpen: false,
        finalSelectedPrintOptions: [],
        isShowMovingHistoryModel: false,
        isShowMovingModel: false,
        isShowAcquireModel: false,
        siteModuleConfiguration: "",
        isShowDueDateModel: false,
        selectedPrintOptions: [],
        siteNameId: 0,
        assetMasterId: 0,
        assetMasterName: "",
        isReload: false,
        isQRCodeModelOpen: false,
        qrCodeUrl: "",
        isUploadModelOpen: false,
        assetLocationPermission: [],
        movingHistory: "",
        mdlConfigurationFile: "",
        isReloadPrint: false,
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
        AssetTypeMaster: "",
        isShowCopyAssetModal: false,
        CopyAssetItem: undefined,
        isAssetHistoryAndPermissionLoaded: false
    });
    const appSiteState = useAtomValue(appSiteStateAtom);
    const { PermissionArray } = appSiteState;
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail, currentUser } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const isVisibleCrud = React.useRef<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [allDataForExcel, setDataForExcel] = React.useState<any>([]);
    const [DeleteId, setDeleteId] = React.useState<any>();
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [selectedSerialNumber, setSelectedSerialNumber] = React.useState<any>();
    const [selectedManufacturer, setSelectedManufacturer] = React.useState<any>();
    const [selectedStatus, setSelectedStatus] = React.useState<any>();
    const [ListEquipment, setListEquipment] = React.useState<any>([]);
    const [FilteredData, setFilteredData] = React.useState<any>([]);
    const [SummaryData, setSummaryData] = React.useState<any>([]);
    const [updateQRCodeItems, setUpdateQRCodeItems] = React.useState<any[]>([])
    // const [columnsEquipment, setcolumnsEquipment] = React.useState<any>([]);
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [excelData, setexcelData] = React.useState<any[]>([]);
    const [uploadData, setuploadData] = React.useState<any[]>([]);
    const [userData, setuserData] = React.useState<any[]>([]);
    //const [SiteData, setSiteData] = React.useState<any[]>([]);
    const [isDisplayFilterDialog, setisDisplayFilterDialog] = React.useState<boolean>(false);
    const [notFoundDialog, setnotFoundDialog] = React.useState<boolean>(false);
    const [lblAll, setlblAll] = React.useState<boolean>(false);
    const [downloadDisable, setdownloadDisable] = React.useState<boolean>(true);
    const [isShowModelQR, setIsShowModelQR] = React.useState<boolean>(false);
    const itemurlQR = React.useRef<any>();
    const itemsRefQR = React.useRef<any>();
    const [keyUpdate, setKeyUpdate] = React.useState<number>(Math.random());
    const [isPrintQRModelOpent, setIsPrintQRModelOpent] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [title, setTitle] = React.useState<string>("");
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
    const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
    const [displayerror, setDisplayError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isPdfGenerating, setIsPdfGenerating] = React.useState(false);
    const [filterType, setFilterType] = React.useState<any>("");
    const [lowerValue, setLowerValue] = React.useState(1);
    const [upperValue, setUpperValue] = React.useState(1000000);
    const [minPrice, setMinPrice] = React.useState<number | null>(null);
    const [maxPrice, setMaxPrice] = React.useState<number | null>(null);
    const [MainQRCodeSiteUrl, setMainQRCodeSiteUrl] = React.useState<any>(qrcodeSiteURL);
    const [selectedAssetLocation, setSelectedAssetLocation] = React.useState<any>();
    const [DisplayPrice, setDisplayPrice] = React.useState<boolean>(false);
    const [selectedFANumber, setSelectedFANumber] = React.useState<any>();
    const [isSelectedData, setisSelectedData] = React.useState<boolean>(false);
    const [selectedCardItems, setSelectedCardItems] = React.useState<any[]>([]);
    const lastLoadedSitesRef = React.useRef<string>("");//get the new data of asset history and permission
    const dataRef = React.useRef<{ assetHistory: any[], assetLocationPermission: any[] }>({
        assetHistory: [],
        assetLocationPermission: []
    })
    const onChangeSlider = (newValue: number, rangeValue?: [number, number]) => {
        if (rangeValue) {
            setLowerValue(rangeValue[0]);
            setUpperValue(rangeValue[1]);
            setFilterType("Sroll");
        } else {
            setLowerValue(newValue);
        }
    };
    const [currentView, setCurrentView] = React.useState(props?.view ? "card" : 'grid');

    const [selectedAssetNames, setSelectedAssetNames] = React.useState<any[]>([]);

    const handleViewChange = (view: string) => {
        setCurrentView(view);
        setisSelectedData(false);
        setSelectedCardItems([]);
    };
    const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setTitle(newValue || "");
        if (newValue) {
            setDisplayErrorTitle(false);
        }
    };

    const onChangeSendToEmail = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setSendToEmail(newValue || "");
        if (newValue) {
            setDisplayErrorEmail(false);
            setDisplayErrorEmail(false);
        }

        const enteredValue = newValue;
        const emailPattern = /^([^\s@]+@[^\s@]+\.[^\s@]+)(\s*;\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/;

        if (!enteredValue || emailPattern.test(enteredValue)) {
            setDisplayError(false);
        } else {
            setDisplayError(true);
        }
    };

    const onClickDownloadPDF = async (): Promise<void> => {
        setIsLoading(true);
        setIsPdfGenerating(true);
        const fileName = `${selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails?.defaultSelectedSites && selectedZoneDetails?.defaultSelectedSites[0]?.SiteName + '- Asset' : 'Asset Master'}`;
        const ListEquipment = !!isDisplayEDbtn ? UpdateItem : FilteredData;
        try {
            const fileblob: any = await generateAndSaveKendoPDF("pdfGenerateEquipment", fileName, ListEquipment);
            const url = window?.URL?.createObjectURL(fileblob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${fileName}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsPdfGenerating(false);
        }
    };


    const onClickSendEmail = async (): Promise<void> => {
        setIsLoading(true);
        setIsPdfGenerating(true);
        const isTitleEmpty = !title;
        const isEmailEmpty = !sendToEmail;
        const isEmailInvalid = !isEmailEmpty && !sendToEmail?.split(';').every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));

        setDisplayErrorTitle(isTitleEmpty);
        setDisplayErrorEmail(isEmailEmpty);
        setDisplayError(isEmailInvalid);

        if (!isTitleEmpty && !isEmailEmpty && !isEmailInvalid) {

            const fileName = `${selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails?.defaultSelectedSites && selectedZoneDetails?.defaultSelectedSites[0]?.SiteName + '- Asset' : 'Asset Master'}`;
            let fileblob: any = await generateAndSaveKendoPDF("pdfGenerateEquipment", fileName);
            const file: IFileWithBlob = {
                file: fileblob,
                name: `${fileName}.pdf`,
                overwrite: true
            };
            let toastMessage: string = "";
            const toastId = toastService.loading('Loading...');
            toastMessage = 'Email sent successfully!';
            let insertData: any = {
                Title: title,
                SendToEmail: sendToEmail,
                StateName: props?.qCState,
                SiteName: props?.siteName,
                EmailType: "Asset"
            };
            props.provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                props.provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
                    console.log("Upload Success");
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: props?.siteMasterId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.SendEmail,
                        EntityType: UserActionEntityTypeEnum.EquipmentAsset,
                        // EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        EntityName: title, // Match index dynamically
                        Details: `Send Email Equipment/Asset to ${sendToEmail}`,
                        StateId: props?.componentProp?.dataObj?.StateId || props?.dataObj?.StateId
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);

                    // SPComponentLoader.loadCss(require("../../../assets/css/pdfnone.css"));
                }).catch(err => console.log(err));
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                onClickCancel();
                setIsLoading(false);
                // setIsPdfGenerating(false);
            }).catch(err => console.log(err));
        } else {
            setIsLoading(false);
            setIsPdfGenerating(false);
        }
    };

    const onClickCancel = (): void => {
        resetForm();
        hidePopup();
    };

    const resetForm = (): void => {
        setTitle("");
        setSendToEmail("");
        setDisplayErrorTitle(false);
        setDisplayErrorEmail(false);
        setDisplayError(false);
    }

    const handleFileUpload = (event: any) => {
        try {
            let errorobj: any[] = [];
            const file: any = event;
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                let dataJSONHeaderChek: any[] = XLSX.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0];
                const expectedColumnNames = ['Title', 'Model', 'SerialNumber', 'PurchasePrice', 'ConditionNotes', 'AMStatus', 'Manufacturer', 'AssetType', 'QCColor', 'PurchaseDate', 'ServiceDueDate', 'AssetLink', 'PreviousOwnerId', 'CurrentOwnerId'];
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
                    setexcelData(excelData);
                } else {
                    let message = <div><b > Following fields are missing from the excel </b><ul>{errorobj.map(((r: any, index: any) => {
                        if (index === 0) {
                            return <> <li className="errorPoint">  {r} </li> </>;
                        } else {
                            return <li className="errorPoint">  {r} </li>;
                        }

                    }))}</ul></div>;
                    setIsLoading(false);
                    setState(prevState => ({ ...prevState, uploadFileErrorMessage: message, isUploadColumnValidationModelOpen: true }));
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            const errorObj = { ErrorMethodName: "handleFileUpload", CustomErrormessage: "error in on handle file upload", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };
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
                setState(prevState => ({ ...prevState, mdlConfigurationFile: selectedFiles }));
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
                setState(prevState => ({ ...prevState, isUploadFileValidationModelOpen: true }));
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
                setState(prevState => ({ ...prevState, isUploadFileValidationModelOpen: true }));
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "MDLConfiguration handleDrop", CustomErrormessage: "handleDrop", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
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

    const onclickSendEmail = () => {
        showPopup();
    };

    const onclickDownload = async () => {
        try {
            let url = props.context.pageContext.web.absoluteUrl + '/Shared%20Documents/MasterFiles/AssetsMaster.xlsx';
            let fileName = "AssetsMaster";
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

    const onclickExportToExcel = async () => {
        setIsLoading(true);
        try {
            let exportColumns: IExportColumns[] = [
                {
                    header: "Site Name",
                    key: "SiteName"
                },
                {
                    header: "State Name",
                    key: "StateName"
                },
                {
                    header: "Name",
                    key: "Title"
                },
                {
                    header: "Acquisition Value",
                    key: "FormatAcquisitionValue"
                },
                {
                    header: "FA Number",
                    key: "FormatFANumber"
                },
                {
                    header: "Asset Type",
                    key: "AssetType"
                },
                {
                    header: "Manufacturer",
                    key: "Manufacturer"
                },
                {
                    header: "Model",
                    key: "Model"
                },
                {
                    header: "Color",
                    key: "QCColor"
                },
                {
                    header: "Status",
                    key: "Status"
                },
                {
                    header: "Book Value",
                    key: "FormatPrice"
                },
                {
                    header: "Service Due Date",
                    key: "ServiceDueDate"
                },
                {
                    header: "Serial Number",
                    key: "SerialNumber"
                },
                // {
                //     header: "Number Of Items",
                //     key: "NumberOfItems"
                // },
                // {
                //     header: "Order",
                //     key: "QCOrder"
                // },
                {
                    header: "Purchase Date",
                    key: "FormatPurchasePrice"
                },
                {
                    header: "Asset Link",
                    key: "AssetLinkURL"
                },
                {
                    header: "Condition Notes",
                    key: "ConditionNotes"
                },
                {
                    header: "Current Owner",
                    key: "CurrentOwner"
                },
                {
                    header: "Previous Owner",
                    key: "PreviousOwner"
                },
                {
                    header: "Asset Location",
                    key: "AssetCategory"
                }
            ];
            generateExcelTable(selectedCardItems.length > 0 ? selectedCardItems : !!isSelectedData ? UpdateItem : FilteredData, exportColumns, `${selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails?.defaultSelectedSites && selectedZoneDetails?.defaultSelectedSites[0]?.SiteName + '- Asset.xlsx' : 'Asset Master.xlsx'}`);
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickExportToExcel", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const onclickUpload = () => {
        setState(prevState => ({ ...prevState, isUploadModelOpen: true }));
    };

    const onclickEdit = (predata: any) => {
        setisDisplayEDbtn(false);
        if (!!UpdateItem) {
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({ text: UpdateItem[0].Title, key: UpdateItem[0].Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewAsset, dataObj2: props.dataObj, siteMasterId: props.siteMasterId, dataObj: UpdateItem, siteName: props.siteName, qCState: props.qCState, breadCrumItems: breadCrumItems, pivotName: "EquipmentKey" } });
            props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewAsset, dataObj2: props.dataObj, siteMasterId: props.siteMasterId, dataObj: UpdateItem, siteName: props.siteName, qCState: props.qCState, pivotName: "EquipmentKey", breadCrumItems: breadCrumItems });
        }
        let data: any[] = [];
        if (!!predata.ID) {
            data.push(predata);
            if (!!data) {
                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                breadCrumItems.push({ text: data[0].Title, key: data[0].Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewAsset, dataObj2: props.dataObj, siteMasterId: props.siteMasterId, dataObj: data, siteName: props.siteName, qCState: props.qCState, breadCrumItems: breadCrumItems, pivotName: "EquipmentKey" } });
                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewAsset, dataObj2: props.dataObj, siteMasterId: props.siteMasterId, dataObj: data, siteName: props.siteName, qCState: props.qCState, pivotName: "EquipmentKey", breadCrumItems: breadCrumItems });
            }
        }
    };

    const onclickAdd = () => {
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddNewAsset, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewAsset, dataObj2: props.dataObj, siteName: props.siteName, qCState: props.qCState, siteMasterId: props.siteMasterId, breadCrumItems: breadCrumItems } });
        props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewAsset, dataObj2: props.dataObj, siteName: props.siteName, qCState: props.qCState, siteMasterId: props.siteMasterId, breadCrumItems: breadCrumItems });
    };

    const _onclickAssociate = (item: any) => {

    };

    // const _siteData = () => {
    //     setIsLoading(true);
    //     try {
    //         const select = ["ID,Title,SiteManagerId,SiteManager/Title,SiteManager/Name,SiteManager/EMail,SiteImageThumbnailUrl,Category"];
    //         const expand = ["SiteManager"];
    //         const queryStringOptions: IPnPQueryOptions = {
    //             select: select,
    //             expand: expand,
    //             listName: ListNames.SitesMaster,
    //         };

    //         props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
    //             if (!!results) {
    //                 const UsersListData = results.map((data) => {
    //                     return (
    //                         {
    //                             ID: data.ID,
    //                             Title: data.Title,
    //                             SiteManagerId: data.SiteManagerId,
    //                             SiteManager: !!data.SiteManagerId ? data.SiteManager.Title : '',
    //                             SiteManagerEmail: !!data.SiteManager ? data.SiteManager.EMail : '',
    //                         }
    //                     );
    //                 });
    //                 setSiteData(UsersListData);
    //                 // const siteNameArray = UsersListData.map(item => item.ID);
    //             }
    //         }).catch((error) => {
    //             setIsLoading(false);
    //             console.log(error);
    //             const errorObj = { ErrorMethodName: "_siteData", CustomErrormessage: "error in get site data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
    //             void logGenerator(props.provider, errorObj);
    //         });
    //     } catch (ex) {
    //         setIsLoading(false);
    //         console.log(ex);
    //         const errorObj = { ErrorMethodName: "_siteData", CustomErrormessage: "error in get site data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
    //         void logGenerator(props.provider, errorObj);
    //     }
    // };

    // const _onclickMovingHistory = (item: any) => {
    //     void (async () => {
    //         if (!!item.ID) {
    //             let data = await props.provider.getVersionHistoryById(ListNames.AssetMaster, item.ID);
    //             const uniqueNameArray = data.reduce((uniqueNames: any[], item: { SiteName: { LookupValue: any; }; }) => {
    //                 const hasName = uniqueNames.find((i: { SiteName: { LookupValue: any; }; }) => i.SiteName.LookupValue === item.SiteName.LookupValue);
    //                 if (!hasName) {
    //                     uniqueNames.push(item);
    //                 }
    //                 return uniqueNames;
    //             }, []);
    //             setState(prevState => ({ ...prevState, isShowMovingHistoryModel: true, movingHistory: uniqueNameArray, isShowAcquireModel: false, isShowDueDateModel: false, isShowMovingModel: false, siteNameId: 0, assetMasterId: 0 }));
    //         }
    //     })();
    // };

    const _onclickMovingHistory = (item: any) => {
        void (async () => {
            if (!!item.ID) {
                let data = await props.provider.getVersionHistoryById(ListNames.AssetMaster, item.ID);
                const filteredRecords = data.filter(
                    (record: any) =>
                        record.AMStatus?.trim().toLowerCase() === "moving" ||
                        record.VersionLabel?.trim() === "1.0"
                );
                const sortedItemVersionHistory = filteredRecords.sort((a: any, b: any) => b.VersionLabel - (a.VersionLabel));
                setState(prevState => ({
                    ...prevState,
                    isShowMovingHistoryModel: true,
                    movingHistory: sortedItemVersionHistory,
                    isShowAcquireModel: false,
                    isShowDueDateModel: false,
                    isShowMovingModel: false,
                    siteNameId: 0,
                    assetMasterId: 0
                }));
            }
        })();
    };


    const _onclickDetailsView = (item: any) => {
        setIsLoading(true);
        setTimeout(() => {
            try {
                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                breadCrumItems.push({
                    text: item.Title, key: item.Title, currentCompomnetName: ComponentNameEnum.AssetDetails,
                    onClick: onBreadcrumbItemClicked,
                    manageComponent: props.manageComponentView,
                    manageCompomentItem: {
                        currentComponentName: ComponentNameEnum.AssetDetails, dataObj: props.dataObj, MasterId: props.siteMasterId, siteMasterId: item.ID, siteName: props.siteName,
                        IsSupervisor: props.IsSupervisor, qCState: props.qCState, qCStateId: props?.componentProp?.dataObj?.StateId || props?.dataObj?.StateId, breadCrumItems: breadCrumItems, pivotName: "EquipmentKey"
                    }
                });
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.AssetDetails,
                    dataObj: props.dataObj,
                    siteName: props.siteName,
                    IsSupervisor: props.IsSupervisor,
                    qCState: props.qCState,
                    MasterId: props.siteMasterId,
                    qCStateId: props?.componentProp?.dataObj?.StateId || props?.dataObj?.StateId,
                    siteMasterId: item.ID,
                    breadCrumItems: breadCrumItems,
                    pivotName: "EquipmentKey"
                });
                // setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
                const errorObj = { ErrorMethodName: "_onclickDetailsView", CustomErrormessage: "error in on click details view", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
                setIsLoading(false);
            }
        }, 500);

    };

    const _isWithinNextMonthRange = (givenFullDate: string): boolean => {
        if (!givenFullDate) return false;
        const today = moment().startOf('day');
        const oneMonthFromNow = moment().add(1, 'month').endOf('day');
        const date = moment(givenFullDate);
        return date.isSameOrAfter(today) && date.isSameOrBefore(oneMonthFromNow);
    };

    // Helper function to check if the date is overdue


    const getAssetSummary = (AssetListData: any) => {
        const totalAssets = AssetListData.length; // Total number of assets

        const totalSiteValue = AssetListData.reduce((sum: any, asset: any) => {
            return sum + parseFloat(asset.PurchasePrice || 0);
        }, 0); // Total sum of PurchasePrice

        const numberOfRepairsBroken = AssetListData.filter((asset: any) => {
            return asset.Status === "Broken" || asset.Status === "In repair"; // Check Status for broken/repair assets
        }).length;

        const numberOfServicesDueNextMonth = AssetListData.filter((asset: any) => {
            if (!!asset.fullServiceDueDate) {
                return _isWithinNextMonthRange(asset.fullServiceDueDate);
            }

        }).length;

        const numberOfOverdueServices = AssetListData.filter((asset: any) => {
            return _isOverdue(asset.fullServiceDueDate);
        }).length;

        return {
            totalAssets,
            totalSiteValue,
            numberOfRepairsBroken,
            numberOfServicesDueNextMonth,
            numberOfOverdueServices
        };
    };

    const _onclickCopyAsset = (itemID: any) => {
        setState(prevState => ({ ...prevState, isShowCopyAssetModal: true, CopyAssetItem: itemID }));
    }

    const onClickViewAttachment = async (items: any) => {
        let attachmentUrl: any = "";
        try {
            setIsLoading(true);
            const attachments = await props.provider.getListItemAttachments(
                ListNames.AssetMaster,
                items.ID
            );
            attachmentUrl = attachments?.length > 0 ? attachments[0]?.ServerRelativeUrl : null;
            setIsLoading(false);
            window.open(attachmentUrl, '_blank');
        } catch (error) {
            setIsLoading(true);
            console.error("Error fetching attachments:", error);
        }
    }

    const shimmerWithElementSecondRow = [
        { type: ShimmerElementType.circle, height: 24 },
        { type: ShimmerElementType.gap, width: '2%' },
        { type: ShimmerElementType.line, height: 16, width: '20%' },
        { type: ShimmerElementType.gap, width: '5%' },
        { type: ShimmerElementType.line, height: 16, width: '20%' },
        { type: ShimmerElementType.gap, width: '10%' },
        { type: ShimmerElementType.line, height: 16, width: '15%' },
        { type: ShimmerElementType.gap, width: '10%' },
        { type: ShimmerElementType.line, height: 16 },
    ];


    const QRCodeRenderer: React.FC<{ item: any }> = ({ item }) => {
        const [qrCodeUrl, setQrCodeUrl] = React.useState<string | null>(null);
        const [loading, setLoading] = React.useState(false);

        React.useEffect(() => {
            let isMounted = true;

            const loadQRCode = async () => {
                if (!item?.SiteNameId) return;

                setLoading(true);
                try {
                    const url = await getSiteAssetQRCode(props.context, item.ID);
                    if (isMounted) {
                        setQrCodeUrl(url);
                    }
                } finally {
                    if (isMounted) {
                        setLoading(false);
                    }
                }
            };

            loadQRCode();

            return () => {
                isMounted = false;
            };
        }, [item?.SiteNameId, item?.ID]);

        return (
            <TooltipHost content="View QR Code" id={tooltipId}>
                <div
                    onClick={() => {
                        if (!qrCodeUrl) return;

                        setKeyUpdate(Math.random());
                        setState(prev => ({
                            ...prev,
                            isQRCodeModelOpen: true,
                            qrDetails: { ...item, QRCode: qrCodeUrl },
                            qrCodeUrl: qrCodeUrl
                        }));
                    }}
                    style={{ cursor: qrCodeUrl ? 'pointer' : 'default' }}
                >
                    {loading ? (
                        <Spinner size={SpinnerSize.small} />
                    ) : (
                        <LazyLoadImage
                            src={qrCodeUrl || notFoundImage}
                            width={75}
                            height={75}
                            placeholderSrc={notFoundImage}
                            alt="QR Code"
                            className="course-img-first"
                            effect="blur"
                        />
                    )}
                </div>
            </TooltipHost>
        );
    };

    const VisibleImage: React.FC<{ src: string }> = ({ src }) => {
        const ref = React.useRef<HTMLDivElement>(null);
        const [show, setShow] = React.useState(false);

        React.useEffect(() => {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setShow(true);
                        observer.disconnect();
                    }
                },
                { rootMargin: "100px" }
            );

            if (ref.current) observer.observe(ref.current);
            return () => observer.disconnect();
        }, []);

        return (
            <div ref={ref} style={{ width: 75, height: 75 }}>
                {show ? (
                    <img
                        src={src}
                        width={75}
                        height={75}
                        className="course-img-first"
                        loading="lazy"
                    />
                ) : (
                    <img
                        src={notFoundImage}
                        width={75}
                        height={75}
                        className="course-img-first"
                    />
                )}
            </div>
        );
    };


    const columnsEquipment = React.useMemo(() => {
        const columns: any[] = [
            {
                key: "key10", name: 'Action', fieldName: 'ID', isResizable: false, minWidth: 120, maxWidth: 130,
                onRender: ((itemID: any) => {
                    let isDueDate: boolean = false;
                    if (!!itemID.DueDate) {
                        isDueDate = isWithinNextMonthRange(itemID.fullServiceDueDate);
                    }
                    return <>
                        <div className='dflex action-wrap'>
                            <div><Link className="actionBtn btnMoving dticon" onClick={(e) => {
                                _onclickMovingHistory(itemID);
                            }}>
                                <TooltipHost
                                    content={"Moving History"}
                                    id={tooltipId}
                                >
                                    <FontAwesomeIcon icon="timeline" />
                                </TooltipHost>
                            </Link></div >

                            <div><Link className="actionBtn btnInfo dticon" onClick={() => {
                                setState(prevState => ({ ...prevState, isShowAssetHistoryModel: true, isShowMovingHistoryModel: false, isShowAcquireModel: false, isShowDueDateModel: false, isShowMovingModel: false, siteNameId: itemID.SiteNameId, assetMasterId: itemID.ID, assetMasterName: itemID.Title }));
                            }}>
                                <TooltipHost
                                    content={"Asset History"}
                                    id={tooltipId}
                                >
                                    <FontAwesomeIcon icon="clock-rotate-left" />
                                </TooltipHost>
                            </Link></div >

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
                            <div>
                                {isVisibleCrud.current && isVisibleCrud.current &&

                                    (itemID.Status == AMStatus.Moving ?
                                        <Link className="actionBtn btnGreen dticon" onClick={() => {
                                            setState(prevState => ({ ...prevState, isShowAcquireModel: true, isShowMovingHistoryModel: false, isShowAssetHistoryModel: false, isShowDueDateModel: false, isShowMovingModel: false, siteNameId: itemID.SiteNameId, assetMasterId: itemID.ID, assetMasterName: itemID.Title }));
                                        }}>
                                            <TooltipHost
                                                content={"Acquire Asset"}
                                                id={tooltipId}
                                            >
                                                <FontAwesomeIcon icon="hand-holding" />
                                            </TooltipHost>
                                        </Link> :

                                        <>
                                            <Link className="actionBtn btnMove dticon" onClick={() => {
                                                setState(prevState => ({ ...prevState, isShowMovingModel: true, isShowMovingHistoryModel: false, siteNameId: itemID.SiteNameId, assetMasterId: itemID.ID }));
                                            }}>
                                                <TooltipHost
                                                    content={"Move Asset"}
                                                    id={tooltipId}
                                                >
                                                    <FontAwesomeIcon icon="people-carry-box" />
                                                </TooltipHost>
                                            </Link>
                                        </>
                                    )
                                }
                            </div >
                            {(itemID.AssetTypeMasterId === 0 && (currentUserRoleDetail.isAdmin || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isSiteManager || currentUserRoleDetail.isSiteSupervisor)) &&
                                <div><Link className="actionBtn btnGreen dticon" onClick={() => {
                                    setState(prevState => ({ ...prevState, AssetTypeMasterId: 0, AssetTypeMaster: "", ATMManufacturer: "", isShowAssetHistoryModel: false, isAssociatModel: true, assetMasterName: itemID.Title, isShowMovingModel: false, isShowDueDateModel: false, siteNameId: itemID.SiteNameId, assetMasterId: itemID.ID }));
                                }}>
                                    <TooltipHost
                                        content={"Associate Asset Type"}
                                        id={tooltipId}
                                    >
                                        <div onClick={() => _onclickAssociate(itemID)}>
                                            <FontAwesomeIcon icon="plus" /></div>
                                    </TooltipHost>
                                </Link>
                                </div >
                            }

                            {itemID.AssetTypeMasterId !== 0 && <div><Link className="actionBtn btnGreen dticon" onClick={() => {
                                setState(prevState => ({ ...prevState, AssetTypeMasterId: itemID.AssetTypeMasterId, AssetTypeMaster: itemID.AssetTypeMaster, ATMManufacturer: itemID.ATMManufacturer, isShowAssetHistoryModel: false, isAssociatModel: true, isShowMovingModel: false, isShowDueDateModel: false, siteNameId: itemID.SiteNameId, assetMasterId: itemID.ID }));
                            }}>
                                <TooltipHost
                                    content={"Update Associated Asset Type"}
                                    id={tooltipId}
                                >
                                    <div><FontAwesomeIcon icon="left-right" /></div>
                                </TooltipHost>
                            </Link></div >}

                            {(isDueDate && isVisibleCrud.current) &&
                                <div><Link className="actionBtn btnDanger dticon" onClick={() => {
                                    if (isVisibleCrud.current)
                                        setState(prevState => ({ ...prevState, isShowAcquireModel: false, isShowMovingHistoryModel: false, isShowAssetHistoryModel: false, isShowDueDateModel: true, isShowMovingModel: false, siteNameId: itemID.SiteNameId, assetMasterId: itemID.ID }));
                                }}>
                                    <TooltipHost
                                        content={"Due Date"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon icon="circle-exclamation" />
                                    </TooltipHost>
                                </Link></div >}

                            {(currentUserRoleDetail.isAdmin || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isSiteManager || currentUserRoleDetail.isSiteSupervisor) && <div>

                                <Link className="actionBtn btnRefresh dticon" onClick={() => {
                                    _onclickCopyAsset(itemID);
                                }}>
                                    <TooltipHost
                                        content={"Copy Asset Item"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon icon="copy" />
                                    </TooltipHost>
                                </Link>
                            </div >}
                        </div >
                    </>;
                })
            },
            {
                key: 'Photo', name: 'QR Code', fieldName: 'QRCode', minWidth: 90, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => <QRCodeRenderer item={item} />

            },
            {
                key: 'Photo', name: 'Photo', fieldName: 'AssetPhotoThumbnailUrl', minWidth: 90, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => {

                    if (!item.AssetPhotoThumbnailUrl) return null;
                    return <VisibleImage src={item.AssetPhotoThumbnailUrl} />;
                    // return (
                    //     //if (!item.AssetPhotoThumbnailUrl) return null;
                    //     // <img src={item.AssetPhotoThumbnailUrl} height="75px" width="110px" className="course-img-first" />
                    //     // <ViewSiteImage
                    //     //     item={item}
                    //     //     prefix={"PhotoImage" + item.ID}
                    //     //     imageUrl={item.AssetPhotoThumbnailUrl}
                    //     //     width={75}
                    //     //     height={75}
                    //     //     alt="event photo"
                    //     //     className="course-img-first"
                    //     // />

                    //     <LazyLoadImage src={item.AssetPhotoThumbnailUrl}
                    //         width={75} height={75}
                    //         placeholderSrc={notFoundImage}
                    //         alt="photo"
                    //         className="course-img-first"
                    //         effect="blur"
                    //     />                    
                }
            },
        ];
        if (selectedZoneDetails?.defaultSelectedSitesId?.length !== 1) {
            columns.push({
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
            });
        }

        columns.push(
            // { key: "key1", name: 'Name', fieldName: 'Title', isResizable: true, minWidth: 70, maxWidth: 150, isSortingRequired: true },
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
            {
                key: "AcquisitionValue", name: 'Acquisition Value', fieldName: 'AcquisitionValue', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true,
                onRender: ((itemID: any) => {
                    return <>
                        <div className="">{!!itemID.AcquisitionValue ? formatPriceDecimal(itemID.AcquisitionValue) : ""}</div>
                    </>;
                })
            },
            {
                key: "key7", name: 'Book Value', fieldName: 'PurchasePrice', isResizable: true, minWidth: 80, maxWidth: 120, isSortingRequired: true,

                onRender: ((itemID: any) => {

                    return <>
                        <div className="">{formatPriceDecimal(itemID.PurchasePrice)}</div>
                    </>;
                })
            },
            { key: "key2", name: 'Manufacturer', fieldName: 'Manufacturer', isResizable: true, minWidth: 100, maxWidth: 180, isSortingRequired: true },
            { key: "key3", name: 'Model', fieldName: 'Model', isResizable: true, minWidth: 70, maxWidth: 150, isSortingRequired: true },
            { key: "key4", name: 'Asset Type', fieldName: 'AssetType', isResizable: true, minWidth: 70, maxWidth: 150, isSortingRequired: true },
            { key: "key5", name: 'Color', fieldName: 'QCColor', isResizable: true, minWidth: 80, maxWidth: 120, isSortingRequired: true },
            { key: "key6", name: 'Status', fieldName: 'Status', isResizable: true, minWidth: 70, maxWidth: 150, isSortingRequired: true },
            { key: "AssetCategory", name: 'Location', fieldName: 'AssetCategory', isResizable: true, minWidth: 80, maxWidth: 100, isSortingRequired: true },
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
                    if (item.SerialNumber) {
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
                key: 'Attachment', name: 'Assets Manual', fieldName: 'Attachment', minWidth: 100, maxWidth: 150, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => {
                    if (item.isAttachment) {
                        return (
                            <>  <Link className="actionBtn btnPDF dticon" target="_blank" rel="noopenernoreferrer" onClick={() => { onClickViewAttachment(item) }}>
                                <TooltipHost
                                    content={"View Asset Manual"}
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
                                    content={"Asset Manual Not Available"}
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
                key: "FANumber", name: 'FA Number', fieldName: 'FANumber', isResizable: true, minWidth: 80, maxWidth: 150, isSortingRequired: true,
                onRender: (item: any) => {
                    return item.FANumber ? `${item.FANumber}` : "";
                }
            },
        );

        return columns;
    }, [selectedZoneDetails]);

    const _EquipmentMaster = async (
        assetHistory?: any[],
        assetLocationPermission?: IAssetLocationPermission[]
    ) => {
        let assetHistoryItem = assetHistory || (assetHistoryItems?.length > 0 ? assetHistoryItems : []);
        setIsLoading(true);

        let assetPermission = assetLocationPermission || state.assetLocationPermission;
        const filterFields: any[] = [];

        if (selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId?.length > 0) {
            filterFields.push({
                fieldName: "SiteName",
                fieldValue: selectedZoneDetails?.defaultSelectedSitesId,
                fieldType: FieldType.LookupById,
                LogicalType: LogicalType.In
            });
            filterFields.push({
                fieldName: "IsDeleted",
                fieldValue: true,
                fieldType: FieldType.Boolean,
                LogicalType: LogicalType.NotEqualTo
            });
        } else if (selectedZoneDetails && selectedZoneDetails?.selectedSitesId?.length > 0) {
            filterFields.push({
                fieldName: "SiteName",
                fieldValue: selectedZoneDetails?.selectedSitesId,
                fieldType: FieldType.LookupById,
                LogicalType: LogicalType.In
            });

            filterFields.push({
                fieldName: "IsDeleted",
                fieldValue: true,
                fieldType: FieldType.Boolean,
                LogicalType: LogicalType.NotEqualTo
            });
        }
        if (selectedAssetNames?.length > 0) {
            filterFields.push({
                fieldName: "Title",
                fieldValue: selectedAssetNames,
                fieldType: FieldType.Text,
                LogicalType: LogicalType.In
            });
        }

        if (selectedSerialNumber) {
            filterFields.push({
                fieldName: "SerialNumber",
                fieldValue: selectedSerialNumber,
                fieldType: FieldType.Text,
                LogicalType: LogicalType.EqualTo
            });
        }

        if (selectedFANumber) {
            filterFields.push({
                fieldName: "FANumber",
                fieldValue: selectedFANumber,
                fieldType: FieldType.Text,
                LogicalType: LogicalType.EqualTo
            });
        }

        if (selectedAssetLocation) {
            filterFields.push({
                fieldName: "AssetCategory",
                fieldValue: selectedAssetLocation,
                fieldType: FieldType.Text,
                LogicalType: LogicalType.EqualTo
            });
        }

        if (selectedManufacturer) {
            filterFields.push({
                fieldName: "Manufacturer",
                fieldValue: selectedManufacturer,
                fieldType: FieldType.Text,
                LogicalType: LogicalType.EqualTo
            });
        }

        if (selectedStatus) {
            filterFields.push({
                fieldName: "AMStatus",
                fieldValue: selectedStatus,
                fieldType: FieldType.Text,
                LogicalType: LogicalType.EqualTo
            });
        }

        const batchSize = 2000;
        let allResults: any[] = [];
        let pageToken = "";
        let isPaged: boolean = true;

        do {
            const camlQuery = new CamlBuilder()
                .View([
                    "ID",
                    "Title",
                    "SiteName",
                    "AssetCategory",
                    "Manufacturer",
                    "Model",
                    "QCColor",
                    "AMStatus",
                    "PurchasePrice",
                    "PurchaseDate",
                    "ServiceDueDate",
                    "SerialNumber",
                    "AssetLink",
                    "WebsiteLink",
                    "ConditionNotes",
                    "CurrentOwner",
                    "PreviousOwner",
                    "QRCode",
                    "AssetPhoto",
                    "AssetPhotoThumbnailUrl",
                    "AssetTypeMaster",
                    "Modified",
                    "RealImagesLinks",
                    "AssetNo",
                    "FANumber",
                    "EquipmentType",
                    "AcquisitionValue",
                    "Attachments",
                    "AssetType"
                ])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(batchSize, true)
                .Query();
            if (filterFields.length > 0) {
                camlQuery.Where().All(getCAMLQueryFilterExpression(filterFields));
            }
            let queryXML = camlQuery.ToString();

            const queryOptions: any = {
                listName: ListNames.AssetMaster,
                queryXML: queryXML,
                pageToken
            };

            const localResponse = await props.provider.getItemsInBatchByCAMLQuery(queryOptions);

            if (!!localResponse.NextHref) {
                pageToken = localResponse.NextHref.split('?')[1];
            } else {
                isPaged = false;
            }

            allResults = [...allResults, ...localResponse.Row];
            console.log('Equipment Results combined Array Length', allResults.length);
        } while (isPaged);

        try {
            const results = allResults;
            console.log('All results fetched:', allResults.length);
            if (!results) return;
            let res = results;
            if (
                !currentUserRoleDetail.isAdmin && !currentUserRoleDetail.isStateManager && (currentUserRoleDetail.isSiteManager || currentUserRoleDetail.isSiteSupervisor)
            ) {
                const allowedLocations =
                    assetPermission?.flatMap(i => i.Location) || [];

                if (allowedLocations.length > 0) {
                    res = res.filter(i =>
                        allowedLocations.includes(i.AssetCategory)
                    );
                }
            }
            console.log('Results after permission filtering:', res.length);

            const AssetListData = await Promise.all(
                res.map(async (data: any) => {
                    const fixImgURL = `${props.context.pageContext.web.serverRelativeUrl}/Lists/AssetMaster/Attachments/${data.ID}/`;


                    // const QRCodeUrl = await getCRSiteAreaQRCodeURL(props?.context, data?.SiteName?.[0]?.lookupId, data?.ID);
                    const acquisitionValue = data.AcquisitionValue;
                    const testedDate = assetHistoryItem.find((r: any) =>
                        r.SiteNameId === data.SiteName?.[0]?.lookupId &&
                        r.AssetMasterId === data.ID
                    )?.Created || data.Created;
                    let arraylink: any;
                    let filename: any;
                    if (data?.RealImagesLinks != "") {
                        arraylink = data?.RealImagesLinks?.split(',').map((link: string) => link.trim());
                        filename = arraylink?.map((link: any) => {
                            const parts = link?.split('/');
                            return parts[parts.length - 1];
                        });
                    }
                    // const stateName = stateMap[data.SiteName?.[0]?.lookupId] || "";
                    // let assetPhotoThumbnailUrl = notFoundImage;
                    // if (data.AssetPhotoThumbnailUrl) {
                    //     if (typeof data.AssetPhotoThumbnailUrl === 'string') {
                    //         assetPhotoThumbnailUrl = data.AssetPhotoThumbnailUrl;
                    //     } else if (data.AssetPhotoThumbnailUrl.Url) {
                    //         assetPhotoThumbnailUrl = data.AssetPhotoThumbnailUrl.Url;
                    //     } else if (data.AssetPhotoThumbnailUrl.serverRelativeUrl) {
                    //         assetPhotoThumbnailUrl = props.context.pageContext.web.absoluteUrl + data.AssetPhotoThumbnailUrl.serverRelativeUrl;
                    //     }
                    // }
                    const AssetPhotoURL = data.AssetPhoto ? getParsedImageUrl(data.AssetPhoto, fixImgURL, notFoundImage) : notFoundImage;
                    return {
                        ID: data.ID,
                        Title: data.Title || "",
                        SiteNameId: data.SiteName?.[0]?.lookupId || "",
                        SiteName: data.SiteName?.[0]?.lookupValue || "",
                        // StateName: stateName,
                        AssetType: data.AssetType || "",
                        Manufacturer: data.Manufacturer || "",
                        FANumber: data.FANumber || "",
                        Model: data.Model || "",
                        QCColor: data.QCColor || "",
                        Status: data.AMStatus || "",
                        PurchasePrice: data.PurchasePrice ? parsePriceNumber(data.PurchasePrice) : "",
                        FormatPrice: data.PurchasePrice ? formatPriceDecimal(parsePriceNumber(data.PurchasePrice)) : "",
                        ServiceDueDate: data.ServiceDueDate ? getConvertedDate(data.ServiceDueDate) : "",
                        SerialNumber: data.SerialNumber || "",
                        AssetImage: AssetPhotoURL,
                        Attachment: "",//just for temp
                        isAttachment: (data.Attachments === "1" || data.Attachments === true) ? true : false,
                        DueDate: data.ServiceDueDate || "",
                        PurchaseDate: data.PurchaseDate || "",
                        AssetLink: data.AssetLink || "",
                        WebsiteLink: data.WebsiteLink || "",
                        ConditionNotes: data.ConditionNotes || "",
                        CurrentOwnerId: data.CurrentOwner?.ID || "",
                        PreviousOwnerId: data.PreviousOwner?.ID || "",
                        CurrentOwner: data.CurrentOwner?.EMail || "",
                        PreviousOwner: data.PreviousOwner?.EMail || "",
                        // QRCode: QRCodeUrl,
                        QRCode: "",
                        Modified: data.Modified || null,
                        AssetTypeMasterId: data.AssetTypeMaster?.ID || 0,
                        AssetTypeMaster: data.AssetTypeMaster?.Title || "",
                        ATMManufacturer: data.ATMManufacturer || "",
                        AssetCategory: data.AssetCategory || "",
                        fullServiceDueDate: data.ServiceDueDate || "",
                        AssetPhotoThumbnailUrl: data.AssetPhotoThumbnailUrl,
                        TestedDate: getConvertedDate(testedDate),
                        RealImagesLinks: data.RealImagesLinks || "",
                        RealImagesLinksArray: arraylink || "",
                        RealImagesLinksfilename: filename || "",
                        AssetNo: data.AssetNo || "",
                        EquipmentType: data.EquipmentType || "",
                        AcquisitionValue: acquisitionValue || "",
                        FormatAcquisitionValue: acquisitionValue ? formatPriceDecimal(acquisitionValue) : "",
                        FormatFANumber: data.FANumber ? `${data.FANumber}` : "",
                        AssetLinkURL: data.AssetLink ? data.AssetLink.Url : "",
                    };
                })
            );

            AssetListData.sort((a, b) =>
                moment(b.Modified).diff(moment(a.Modified))
            );
            const prices = AssetListData.map((asset: any) => parseFloat(asset.PurchasePrice)).filter(price => !isNaN(price));

            if (prices.length > 0) {
                setMinPrice(Math.min(...prices));
                setMaxPrice(Math.max(...prices));
            }

            setDataForExcel(AssetListData);
            const assetSummary = getAssetSummary(AssetListData);
            setSummaryData(assetSummary);
            setListEquipment(AssetListData);
            // setListEquipment(AssetListData.filter((r: any) => !!r && !!r.ID));
            // let matchingRecords: any = [];
            // const stateName = selectedZoneDetails?.defaultSelectedSitesId?.[0] ? stateMap[selectedZoneDetails.defaultSelectedSitesId[0]] || stateMap[selectedZoneDetails.s[0]] : "";
            // const IsFilter = selectedSerialNumber || selectedAssetLocation || selectedManufacturer || selectedStatus || selectedFANumber || (selectedAssetNames && selectedAssetNames.length > 0);
            // if (currentUserRoleDetail?.isAdmin) {
            //     if (stateName || IsFilter) {
            //         matchingRecords = AssetListData.filter((record: any) => record.StateName === stateName);
            //         setListEquipment(matchingRecords.filter((r: { ID: any; }) => !!r && !!r.ID));
            //     } else {
            //         setListEquipment(AssetListData.filter((r: any) => !!r && !!r.ID));
            //     }
            // } else {
            //     if (currentUserRoleDetail?.isStateManager) {
            //         if ((!!assetPermission && assetPermission.length > 0) || IsFilter) {
            //             matchingRecords = AssetListData.filter((record: any) => assetPermission.some(p => p.Location.includes(record?.AssetCategory)));
            //             setListEquipment(matchingRecords.filter((r: { ID: any; }) => !!r && !!r.ID));
            //         }
            //     } else {
            //         if (stateName || IsFilter) {
            //             matchingRecords = AssetListData.filter((record: any) => record.StateName === stateName);
            //             setListEquipment(matchingRecords.filter((r: { ID: any; }) => !!r && !!r.ID));
            //         } else {
            //             setListEquipment(AssetListData.filter((r: any) => !!r && !!r.ID));
            //         }
            //     }
            // }

            setIsLoading(false);
        } catch (ex) {
            console.log(ex);
            void logGenerator(props.provider, {
                ErrorMethodName: "_EquipmentMaster",
                CustomErrormessage: "error in get equipment/asset master (CAML)",
                ErrorMessage: ex.toString(),
                ErrorStackTrace: "",
                PageName: "QuayClean.aspx"
            });
            sethasError(true);
            setIsLoading(false);
        }
    };

    const _onClickSearch = async () => {
        if (!selectedSerialNumber && !selectedAssetLocation && !selectedStatus && !selectedManufacturer && !selectedAssetNames && lblAll === false) {
            setisDisplayFilterDialog(true);
        } else {
            let assetHistoryItems = await getAssetHistory(props.provider);
            _EquipmentMaster(assetHistoryItems,);
        }
    };

    const onclickdelete = async (predata?: any) => {
        setIsLoading(true);
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

                UpdateItem.forEach((res: any, index: any) => {
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: UpdateItem[index]?.SiteNameId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.Delete,
                        EntityType: UserActionEntityTypeEnum.EquipmentAsset,
                        EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        EntityName: UpdateItem[index]?.Title, // Match index dynamically
                        Details: `Delete Equipment/Asset`,
                        StateId: props?.componentProp?.dataObj?.StateId || props?.dataObj?.StateId
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                });
                const newObjects = processUpdateItem(UpdateItem);
                if (newObjects.length > 0) {
                    await props.provider.updateListItemsInBatchPnP(ListNames.AssetMaster, newObjects);
                }
            }
            setisDisplayEDbtn(false);
            setIsDisplayEditButtonview(false);
            toggleHideDialog();
            setIsLoading(false);
            _EquipmentMaster();
        }
        catch (ex) {
            const errorObj = {
                ErrorMessage: ex.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  onclickdelete",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onclickdelete"
            };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
            console.log(ex);
        }
    };

    const onAssetNameChange = (selectedAssets: any[]): void => {
        // const selectedValues = selectedAssets.map(asset => asset.value); // Extract values from selected options
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
    // const onFANumberChange = (FANumber: any): void => {
    //     setSelectedFANumber(FANumber.text);
    //     if (FANumber.label == " --All FA Number--") {
    //         setlblAll(true);
    //     }
    // };
    const onFANumberChange = (FANumber: any): void => {
        if (FANumber.value === "") {  // Check if it's the "All" option
            setSelectedFANumber("");  // Pass blank
            setlblAll(true);
        } else {
            setSelectedFANumber(FANumber.text); // Normal selected FA Number
            setlblAll(false);
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
    const onClickClose = () => {
        setState(prevState => ({ ...prevState, isAssociatModel: false, isShowDueDateModel: false, isShowMovingHistoryModel: false, isShowAssetHistoryModel: false, isShowMovingModel: false, isShowAcquireModel: false, isReload: !state.isReload }));
    };

    const getSiteAssetLocationPermission = async () => {
        try {
            let permissionData: IAssetLocationPermission[] = []
            const camlQuery = new CamlBuilder()
                .View(["ID", "Title", "ManagerSupervisor", "IsManager", "SiteName", "Location"])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query()
            let filterFields: ICamlQueryFilter[] = [];
            if (props?.siteMasterId) {

                filterFields.push({
                    fieldName: "SiteName",
                    fieldValue: props.siteMasterId,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.EqualTo
                });
            }



            if (currentUserRoleDetail.isAdmin == false && currentUserRoleDetail.isStateManager == false && (currentUserRoleDetail.isSiteManager == true || currentUserRoleDetail.isSiteSupervisor == true)) {
                filterFields.push({
                    fieldName: "ManagerSupervisor",
                    fieldValue: currentUser.userId,
                    fieldType: FieldType.User,
                    LogicalType: LogicalType.EqualTo
                });
            }
            if (filterFields.length > 0) {
                const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
                camlQuery.Where().All(categoriesExpressions);
            }
            let data = await props.provider.getItemsByCAMLQuery(ListNames.SiteAssetLocationPermission, camlQuery.ToString());
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
        } catch (error) {

            console.log("getSiteAssetLocationPermission" + error);
            return []
        }
    }

    React.useEffect(() => {
        // props.provider._Document("QRCode").then(() => {
        // }).catch((error) => {
        //     const errorObj = {
        //         ErrorMessage: error.toString(),
        //         ErrorStackTrace: "",
        //         CustomErrormessage: "Error is occuring while  useEffect",
        //         PageName: "QuayClean.aspx",
        //         ErrorMethodName: "useEffect ChemicalQrCode"
        //     };
        //     void logGenerator(props.provider, errorObj);
        // });

        props.provider.getDocumentByURL().then((results: any[]) => {
            if (!!results) {
                let fileNameArray = results.map(item => item.FileLeafRef == "AssetsMaster.xlsx");
                for (let i = 0; i < fileNameArray.length; i++) {
                    if (fileNameArray[i] == true) {
                        setdownloadDisable(false);
                    }
                }
            }
        }).catch((error) => {
            console.log(error);
        });
        //_siteData();
    }, [isRefreshGrid]);


    React.useEffect(() => {
        (async () => {
            try {
                const siteModuleConfiguration = await getSiteModuleConfiguration();
                if (!!siteModuleConfiguration && !!siteModuleConfiguration?.ID) {
                    let selectedPrintOptions = (!!siteModuleConfiguration.ConfigurationJson) ? siteModuleConfiguration.ConfigurationJson : state.selectedPrintOptions
                    setState((prevState) => ({
                        ...prevState, siteModuleConfiguration:
                            siteModuleConfiguration,
                        selectedPrintOptions: selectedPrintOptions,
                        finalSelectedPrintOptions: selectedPrintOptions
                    }))

                }
            } catch (error) {
                console.log(error);

            }
        })()

    }, [state.isReloadPrint]);

    React.useEffect(() => {
        (async () => {
            let assetHistory: any[] = [];
            let assetLocationPermission: any[] = [];
            const siteIdsKey = selectedZoneDetails?.defaultSelectedSitesId?.join(",") || "";
            if (!state.isAssetHistoryAndPermissionLoaded || lastLoadedSitesRef.current !== siteIdsKey) {
                let [assetHistory, assetLocationPermission] = await Promise.all([getAssetHistory(props.provider), getSiteAssetLocationPermission()])
                dataRef.current = {
                    assetHistory: assetHistory,
                    assetLocationPermission: assetLocationPermission

                }
                assetLocationPermission = assetLocationPermission;
                assetHistory = assetHistory;
                setState((prevState) => ({ ...prevState, isAssetHistoryAndPermissionLoaded: true }))
            }
            lastLoadedSitesRef.current = siteIdsKey;

            setAssetHistoryItems(assetHistory);
            setState((prevState: any) => ({ ...prevState, assetLocationPermission: assetLocationPermission }))
            _EquipmentMaster(assetHistory, assetLocationPermission);
        })();
    }, [state.isReload, selectedSerialNumber, selectedFANumber, selectedAssetLocation, selectedStatus, selectedManufacturer, selectedAssetNames, isRefreshGrid, selectedZoneDetails]);

    const dataURItoBlob = (dataURI: string) => {
        let byteString = atob(dataURI.split(',')[1]);
        let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        let ab = new ArrayBuffer(byteString.length);
        let ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        let blob = new Blob([ab], { type: mimeString });
        return blob;
    };

    const afterQrGenrate = async (url: any, items: any, Id: any) => {
        let data = dataURItoBlob(url);
        let QrName = items.Title.split(' ').join('') + "-" + Id;
        const file: IFileWithBlob = {
            file: data,
            name: `${QrName}.png`,
            folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/QRCode`,
            overwrite: true
        };
        let fileUpload: any;
        let Photo;
        fileUpload = await props.provider.uploadFile(file);
        Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl });
        await props.provider.updateItemWithPnP({ QRCode: Photo }, ListNames.AssetMaster, Id);
        setIsShowModelQR(false);
    };

    const genratedQrcode = (baseUrl: any) => {
        afterQrGenrate(baseUrl, itemsRefQR.current, itemsRefQR.current.ID);
    };

    const qrupload = async (Id: any, items: any) => {
        try {
            let filterqrcodeURL = qrcodeSiteURL;
            if (props.context && (Environment.type === EnvironmentType.SharePoint || Environment.type === EnvironmentType.ClassicSharePoint)) {
                const currentUrl: string = props.context.pageContext.web.absoluteUrl.toLowerCase();
                if (currentUrl.indexOf('https://quaycleanaustralia.sharepoint.com') > -1) {
                    filterqrcodeURL = qrcodeSiteURL;
                } else if (currentUrl.indexOf('https://treta.sharepoint.com/sites/quaycleanqa') > -1) {
                    filterqrcodeURL = qaSiteURL;
                } else if (currentUrl.indexOf('https://treta.sharepoint.com/sites/quaycleandev') > -1) {
                    filterqrcodeURL = devSiteURL;
                } else if (currentUrl.indexOf('https://quaycleanqa.quaycleanresources.com.au') > -1) {
                    filterqrcodeURL = stageSiteURLNew;
                }
                else {
                    filterqrcodeURL = mainSiteURL;
                }
            } else {
                filterqrcodeURL = qrcodeSiteURL;
            }

            let url = `${filterqrcodeURL}Assets/AssetsDetail?ItemId=${Id}`;
            const qrCodeDatas = await qrcode.toDataURL(url);
            let data = dataURItoBlob(qrCodeDatas);
            // let QrName = items.Title.split(' ').join('') + "-" + Id;
            let safeTitle = items.Title.replace(/[^a-zA-Z0-9-_]/g, "");
            let QrName = `${safeTitle}-${Id}`;

            const file: IFileWithBlob = {
                file: data,
                name: `${QrName}.png`,
                folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/QRCode`,
                overwrite: true
            };
            let fileUpload: any = await props.provider.uploadFile(file);
            // let Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl });
            // await props.provider.updateItemWithPnP({ QRCode: Photo }, ListNames.AssetMaster, Id);

            // const Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl });
            // await props.provider.updateItemWithPnP({ QRCode: Photo }, ListNames.AssetMaster, itemsRefQR.current.Id).then(() => {
            //     console.log("saved");

            // }).catch((error) => {
            //     console.log('error', error);

            // });
            // const Photo = { serverRelativeUrl: fileUpload.data.ServerRelativeUrl };
            const Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl });
            await props.provider.updateItemWithPnP({ QRCode: Photo }, ListNames.AssetMaster, Id);
        } catch (error) {
            const errorObj = { ErrorMethodName: "qrupload", CustomErrormessage: "error in upload qr code", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const _onItemInvoked = (item: any): void => {
        _onclickDetailsView(item);
    };
    const onClickCloseModel = () => {
        setState(prevState => ({ ...prevState, isUploadModelOpen: false }));
    };
    const _onItemSelected = (item: any): void => {
        if (item.length > 0) {
            if (item.length == 1) {
                setisSelectedData(true)
                setUpdateItem(item);
                setIsDisplayEditButtonview(true);
                setDeleteId(item[0].ID);
            } else {
                setisSelectedData(true)
                setUpdateItem(item);
                setIsDisplayEditButtonview(false);
                setUpdateItem(item);
            }
            setisDisplayEDbtn(true);

        } else {
            setisSelectedData(false)
            setUpdateItem([]);
            setDeleteId(0);
            setisDisplayEDbtn(false);
        }
    };

    React.useEffect(() => {
        if (ListEquipment.length > 0) {
            const filterList = () => {
                if (filterType) {
                    let filteredList = ListEquipment;
                    if (filterType === 'Overdue Services') {
                        filteredList = ListEquipment.filter((item: any) => _isOverdue(item.fullServiceDueDate));
                    } else if (filterType === 'Services Due in 1 Month') {
                        filteredList = ListEquipment.filter((item: any) => _isWithinNextMonthRange(item.fullServiceDueDate));
                    } else if (filterType === 'Repairs/Broken Assets') {
                        filteredList = ListEquipment.filter((x: any) => x.Status === "In repair");
                    }
                    if (upperValue !== null || lowerValue !== null) {
                        filteredList = filteredList.filter(
                            (item: any) =>
                                item.PurchasePrice &&
                                parseFloat(item.PurchasePrice) >= lowerValue &&
                                parseFloat(item.PurchasePrice) <= upperValue
                        );
                    }
                    console.log('Filtered list length:', filteredList.length, 'from original:', ListEquipment.length);
                    setFilteredData(filteredList); // Set filtered data to state
                    setIsLoading(false);
                } else {
                    setFilteredData(ListEquipment);
                    setIsLoading(false);
                }
            };
            setIsLoading(true);
            filterList();

        } else {
            setFilteredData([]);
        }
    }, [ListEquipment, filterType, upperValue, lowerValue]);

    React.useEffect(() => {
        let isVisibleCrud1 = (!!PermissionArray && PermissionArray.includes('Equipment / Assets') || props.loginUserRoleDetails.isStateManager || props.loginUserRoleDetails.isAdmin || props.loginUserRoleDetails?.siteManagerItem.filter((r: any) => r.Id == props.siteMasterId && r.SiteManagerId?.indexOf(props.loginUserRoleDetails.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;
    }, []);

    React.useEffect(() => {
        props.provider.getSiteUsers().then((results) => {
            setuserData(results);
        }).catch((error) => {
            console.log(error);
            const errorObj = { ErrorMethodName: "useEffect(getSiteUsers data)", CustomErrormessage: "error in get site client data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        });

        if (!!excelData && !!userData) {
            if (excelData.length > 0) {
                const data: any = JSON.stringify(excelData, null, 2);
                const jsondata: any = JSON.parse(data);
                const formatData = jsondata.map((i: any) => ({
                    ...i, SiteNameId: 0
                }));
                if (!!formatData) {
                    const formattedData = formatData.map((item: {
                        SiteNameId: any;
                        PreviousOwnerId: any;
                        CurrentOwnerId: any;
                        AssetLink: any;
                        PurchasePrice: string;
                        SerialNumber: string;
                        ServiceDueDate: any;
                        PurchaseDate: moment.MomentInput;
                    }) => {
                        if (item.PurchaseDate) {
                            item.PurchaseDate = moment(item.PurchaseDate, "DD-MM-YYYY").format("YYYY-MM-DD[T]HH:mm:ss[Z]");
                        }
                        if (item.ServiceDueDate) {
                            item.ServiceDueDate = moment(item.ServiceDueDate, "DD-MM-YYYY").format("YYYY-MM-DD[T]HH:mm:ss[Z]");
                        }
                        if (item.PurchasePrice) {
                            item.PurchasePrice = item.PurchasePrice.toString();
                        }
                        if (item.SerialNumber) {
                            item.SerialNumber = item.SerialNumber.toString();
                        }
                        if (item.AssetLink) {
                            item.AssetLink = { Url: item.AssetLink };
                        }
                        if (item.PreviousOwnerId) {
                            const pOwnerId = userData.filter(x => x.Email === item.PreviousOwnerId);
                            item.PreviousOwnerId = pOwnerId.length > 0 ? pOwnerId[0].Id : null;
                        }
                        else {
                            item.PreviousOwnerId = null;
                        }
                        if (item.CurrentOwnerId) {
                            const cOwnerId = userData.filter(x => x.Email === item.CurrentOwnerId);
                            item.CurrentOwnerId = cOwnerId.length > 0 ? cOwnerId[0].Id : null;
                        }
                        else {
                            item.CurrentOwnerId = null;
                        }
                        if (item.SiteNameId === 0) {
                            // const siteName = SiteData.filter(x => x.Title === item.SiteNameId);
                            item.SiteNameId = props.siteMasterId;
                        }
                        return item;
                    });
                    setuploadData(formattedData);
                }
            }
        }
    }, [excelData]);

    const removeFile = async (id: number | string) => {
        try {
            const newFiles = state.mdlConfigurationFile.filter((file: IFileWithBlob) => file.key != id);
            setState(prevState => ({ ...prevState, mdlConfigurationFile: newFiles }));
        } catch (error) {
            const errorObj = { ErrorMethodName: "removeFile", CustomErrormessage: "removeFile", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const onCancel = async () => {
        setState(prevState => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
    };

    const _onSearchTextChangeForExcel = (data: any) => {
        setDataForExcel(data);
    };

    const onSaveFiles = () => {
        setIsLoading(true);
        try {
            if (uploadData && uploadData.length > 0) {
                const toastMessage = 'Record Insert successfully!';
                const toastId = toastService.loading('Loading...');
                const BATCH_SIZE = 25; // Control the number of concurrent uploads

                const titles = uploadData.map((item: any) => item?.Title).join(', ');
                props.provider.createItemInBatch(uploadData, ListNames.AssetMaster).then(async (results: any) => {
                    setState(prevState => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
                    let record = results.map((item: { data: any }) => item.data);
                    let recordId = record.map((i: { ID: any }) => i.ID);
                    let start = 0;
                    while (start < recordId.length) {
                        // Create batches of promises
                        // const batch = recordId.slice(start, start + BATCH_SIZE).map((id: any, idx: number) => {
                        //     return qrupload(id, record[start + idx]);
                        // });
                        const batch = record.slice(start, start + BATCH_SIZE).map((rec: any) => {
                            return qrupload(rec.ID, rec);
                        });
                        await Promise.all(batch);
                        start += BATCH_SIZE;
                    }
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: props?.siteMasterId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.Create,
                        EntityType: UserActionEntityTypeEnum.EquipmentAsset,
                        // EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        EntityName: "Excel Upload", // Match index dynamically
                        Details: `Create record using excel upload for ${titles}`,
                        StateId: props?.componentProp?.dataObj?.StateId || props?.dataObj?.StateId
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                    setIsLoading(false);
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    setState(prevState => ({ ...prevState, isReload: !state.isReload }));
                }).catch(err => console.log(err));
            } else {
                setIsLoading(false);
                setnotFoundDialog(true);
                setState(prevState => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "onSaveFiles", CustomErrormessage: "error in save file data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const onClosePrintConfiguration = () => {
        setState((prevState) => ({ ...prevState, isPrintSettingDialogOpen: false, finalSelectedPrintOptions: state.selectedPrintOptions }));
    }

    const onClickPrintConfigurationOpen = () => {
        setState((prevState) => ({ ...prevState, isPrintSettingDialogOpen: true }));
    }

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

    const menuProps: IContextualMenuProps = {
        items: [
            {
                key: "downloadPdf",
                text: "Export PDF",
                iconProps: { iconName: "PDF", style: { color: "#D7504C" } },
                onClick: (ev, item) => { onClickDownloadPDF() },
            },
            {
                key: "exportExcel",
                text: "Export to Excel",
                iconProps: { iconName: "ExcelDocument", style: { color: "orange" } },
                onClick: (ev, item) => { onclickExportToExcel() },
            },
        ],
    };

    const onCloseModel = () => {
        setisDisplayFilterDialog(false);
    };
    const handlePriceToggle = (value: boolean) => {
        setDisplayPrice(value);
    };

    const onOkModel = () => {
        setnotFoundDialog(false);
        setState(prevState => ({ ...prevState, isUploadModelOpen: true }));
    };

    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };

    const handleCardClick = (title: string | null) => {
        if (title) {
            setFilterType(title);
        } else {
            setFilterType("");
        }
    };

    const clickPrintOptionButton = (key: string) => {
        const selectedPrintOptions = state.finalSelectedPrintOptions || [];
        let updatedOptions: string[];

        if (selectedPrintOptions.includes(key)) {
            // Remove if present
            updatedOptions = selectedPrintOptions.filter((item) => item !== key);
        } else {
            // Add if not present
            updatedOptions = [...selectedPrintOptions, key];
        }
        // setState((prevState: any) => ({ ...prevState, selectedPrintOptions: updatedOptions, printKey: Math.random() }))
        setState((prevState: any) => ({
            ...prevState,
            finalSelectedPrintOptions: updatedOptions

        }))
    }

    const printFieldOptions = () => {
        return <div className="">
            <PrimaryButton
                text="Serial Number"
                label="SerialNumber"
                className={`cursorPointer ${state.finalSelectedPrintOptions.indexOf("SerialNumber") > -1 ? "printSelect" : "printUnSelect"}`}
                onClick={() => clickPrintOptionButton("SerialNumber")}
            />
            <PrimaryButton
                text="Asset Name"
                label="AsstetName"
                className={`cursorPointer ml-10 ${state.finalSelectedPrintOptions.indexOf("AsstetName") > -1 ? "printSelect" : "printUnSelect"}`}
                onClick={() => clickPrintOptionButton("AsstetName")}
            />
            <PrimaryButton
                text="Due Date"
                label="ServiceDueDate"
                className={`cursorPointer ml-10 ${state.finalSelectedPrintOptions.indexOf("ServiceDueDate") > -1 ? "printSelect " : "printUnSelect"}`}
                onClick={() => clickPrintOptionButton("ServiceDueDate")}
            />
            <PrimaryButton
                text="Tested Date"
                label="TestedDate"
                className={`cursorPointer ml-10 ${state.finalSelectedPrintOptions.indexOf("TestedDate") > -1 ? "printSelect " : "printUnSelect"}`}
                onClick={() => clickPrintOptionButton("TestedDate")}
            />
            <PrimaryButton
                text="Test Status"
                label="TestStatus"
                className={`cursorPointer ml-10  ${state.finalSelectedPrintOptions.indexOf("TestStatus") > -1 ? "printSelect  " : "printUnSelect"}`}
                onClick={() => clickPrintOptionButton("TestStatus")}
            />
            <PrimaryButton
                text="FA Number"
                label="FANumber"
                className={`cursorPointer ml-10  ${state.finalSelectedPrintOptions.indexOf("FANumber") > -1 ? "printSelect  " : "printUnSelect"}`}
                onClick={() => clickPrintOptionButton("FANumber")}
            />

        </div >
    }

    const onClickPrintConfigSave = async () => {

        try {

            let isEditMode: boolean = (!!state.siteModuleConfiguration && !!state.siteModuleConfiguration?.ID && Number(state.siteModuleConfiguration?.ID)) ? true : false
            const toastId = toastService.loading(isEditMode ? 'Updating Configuration...' : 'Saving Configuration...');
            const toastMessage = isEditMode ? 'Configuration has been updated successfully!' : 'Configuration has been added successfully!';
            setState((prevState) => ({ ...prevState, isLoading: true }));
            let obj = {
                Title: "EquipmentAssetQR",
                SiteNameId: props.siteMasterId,
                ConfigurationJson: JSON.stringify(state.finalSelectedPrintOptions)
            }
            if (isEditMode) {
                await props.provider.updateItem({ ConfigurationJson: JSON.stringify(state.finalSelectedPrintOptions) }, ListNames.SiteModuleConfiguration, Number(state.siteModuleConfiguration?.ID))
            } else {
                await props.provider.createItem(obj, ListNames.SiteModuleConfiguration)
            }

            toastService.updateLoadingWithSuccess(toastId, toastMessage);
            setState((prevState) => ({
                ...prevState, isPrintSettingDialogOpen: false, isLoading: false, isReloadPrint: !prevState.isReloadPrint,
                selectedPrintOptions: state.finalSelectedPrintOptions
            }));
        } catch (error) {
            console.log(error);
            setState((prevState) => ({ ...prevState, isPrintSettingDialogOpen: false, isLoading: false, }));
        }

    }


    const getSiteModuleConfiguration = async () => {
        let item: any = ""
        if (props.siteMasterId) {
            const camlQuery = new CamlBuilder()
                .View(["ID", "Title", "ConfigurationJson", "SiteName"])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query()
                .Where()
                .TextField('Title').EqualTo("EquipmentAssetQR")
                .And()
                .LookupField('SiteName').Id().EqualTo(props.siteMasterId)
                .ToString()

            let data = await props.provider.getItemsByCAMLQuery(ListNames.SiteModuleConfiguration, camlQuery);
            if (!!data && data.length > 0) {
                let element = data[0];
                item = {
                    ID: mapSingleValue(element.ID, DataType.number),
                    Title: mapSingleValue(element.Title, DataType.string),
                    ConfigurationJson: mapSingleValue(element.ConfigurationJson, DataType.JsonParse),

                }

            }
        }
        return item;
    }

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setCurrentView('card');
            setisSelectedData(false);
            setSelectedCardItems([]);
        } else {
            setCurrentView('grid');
            setisSelectedData(false);
            setSelectedCardItems([]);
        }
    }, []);

    const copyQrupload = async (Id: any, items: any): Promise<void> => {

        let filterqrcodeURL = qrcodeSiteURL;
        if (props.context && (Environment.type === EnvironmentType.SharePoint || Environment.type === EnvironmentType.ClassicSharePoint)) {
            const currentUrl: string = props.context.pageContext.web.absoluteUrl.toLowerCase();
            if (currentUrl.indexOf('https://quaycleanaustralia.sharepoint.com') > -1) {
                filterqrcodeURL = qrcodeSiteURL;
            } else if (currentUrl.indexOf('https://treta.sharepoint.com/sites/quaycleanqa') > -1) {
                filterqrcodeURL = qaSiteURL;
            } else if (currentUrl.indexOf('https://treta.sharepoint.com/sites/quaycleandev') > -1) {
                filterqrcodeURL = devSiteURL;
            } else if (currentUrl.indexOf('https://quaycleanqa.quaycleanresources.com.au') > -1) {
                filterqrcodeURL = stageSiteURLNew;
            }
            else {
                filterqrcodeURL = mainSiteURL;
            }
        } else {
            filterqrcodeURL = qrcodeSiteURL;
        }

        try {
            // let url = `http://quayclean.tretainfotech.com/Assets/AssetsDetail?ItemId=${Id}`;
            let url = `${filterqrcodeURL}Assets/AssetsDetail?ItemId=${Id}`;
            const qrCodeDatas = await qrcode.toDataURL(url);
            const data = dataURItoBlob(qrCodeDatas);
            const QrName = items?.Title.split(' ').join('') + '-' + Id;
            const file: IFileWithBlob = {
                file: data,
                name: `${QrName}.png`,
                folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/QRCode`,
                overwrite: true
            };
            const fileUpload = await props.provider.uploadFile(file);
            const Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl });
            await props.provider.updateItemWithPnP({ QRCode: Photo }, ListNames.AssetMaster, Id);
        } catch (error) {
            const errorObj = { ErrorMethodName: "qr upload", CustomErrormessage: "error in upload qr code", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }

    };

    const escapeRegExp = (string: string) => {
        return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    const getNextCopyName = async (originalName: string, siteMasterId: string, provider: any) => {
        try {
            const filterArray: string[] = [`IsDeleted ne 1`];
            if (!!props.siteMasterId) {
                filterArray.push(`SiteNameId eq '${props.siteMasterId}'`);
            }
            const encodedName = originalName.replace(/'/g, "''");
            filterArray.push(`startswith(Title, '${encodedName}')`);

            const queryStringOptions: IPnPQueryOptions = {
                select: ["Title"],
                listName: ListNames.AssetMaster,
                filter: filterArray.join(" and ")
            };

            const results: any[] = await provider.getItemsByQuery(queryStringOptions);
            const existingNames = results.map(r => r.Title);
            const regex = new RegExp(`^${escapeRegExp(originalName)}(?: Copy (\\d+))?$`, "i");

            let maxCopyNumber = 0;
            for (const name of existingNames) {
                const match = name.match(regex);
                if (match && match[1]) {
                    const num = parseInt(match[1]);
                    if (num > maxCopyNumber) maxCopyNumber = num;
                }
            }
            return `${originalName} Copy ${maxCopyNumber + 1}`;
        } catch (error) {
            console.error("Error generating copy name:", error);
            return `${originalName} Copy 1`;
        }
    }

    // const onClickPrintQRCode = async () => {
    //     setIsLoading(true)
    //     let updateQRCodeItems: any[] = ListEquipment;
    //     if (ListEquipment.length > 0) {
    //         updateQRCodeItems = await ListEquipment.map(async (i: any) => {
    //             const QRCodeUrl = await getCRSiteAreaQRCodeURL(props?.context, i.SiteNameId, i?.ID);
    //             return {
    //                 ...i,
    //                 QRCode: QRCodeUrl
    //             }
    //         })

    //     }
    //     setUpdateQRCodeItems(updateQRCodeItems)
    //     setIsLoading(false)
    //     setIsPrintQRModelOpent(true)



    // }
    const onClickPrintQRCode = async () => {
        try {
            setIsLoading(true);

            let updateQRCodeItems: any[] = [];

            if (ListEquipment?.length > 0) {
                updateQRCodeItems = await Promise.all(
                    ListEquipment.map(async (i: any) => {
                        const QRCodeUrl = await getSiteAssetQRCode(
                            props.context,
                            i.ID
                        );

                        return {
                            ...i,
                            QRCode: QRCodeUrl
                        };
                    })
                );
            }

            setUpdateQRCodeItems(updateQRCodeItems);
            setIsPrintQRModelOpent(true);
        } catch (error) {
            console.error("Error while generating QR codes", error);
        } finally {
            setIsLoading(false);
        }
    };



    const onClickCopyAsset = async () => {
        setIsLoading(true);
        try {
            if (!!state.CopyAssetItem) {
                const newAssetName = await getNextCopyName(state.CopyAssetItem?.Title, props.siteMasterId, props.provider);

                const copyItem = state.CopyAssetItem;
                let thumnailImgs = await saveCopyThumbNailImage(props.provider, copyItem?.AssetPhotoThumbnailUrl, ListNames.QuaycleanAssets);
                let Photo = thumnailImgs?.Photo;
                let thumnailImgsUrl = thumnailImgs?.EncodedAbsThumbnailUrl;

                const data: any = {
                    Title: newAssetName?.toString().trim(),
                    Model: copyItem?.Model || "",
                    // SerialNumber: copyItem?.SerialNumber || "",
                    PurchasePrice: copyItem?.PurchasePrice || "",
                    AssetNo: copyItem?.AssetNo || "",
                    EquipmentType: copyItem?.EquipmentType,
                    ConditionNotes: copyItem?.ConditionNotes,
                    // AssetLink: copyItem.AssetLink ? copyItem.AssetLink : "",
                    PurchaseDate: copyItem?.PurchaseDate ? new Date(copyItem?.PurchaseDate) : undefined,
                    ServiceDueDate: copyItem?.DueDate ? new Date(copyItem?.DueDate) : undefined,
                    AMStatus: copyItem?.Status,
                    Manufacturer: copyItem?.Manufacturer,
                    CurrentOwnerId: !!copyItem?.CurrentOwnerId ? copyItem?.CurrentOwnerId : undefined,
                    PreviousOwnerId: !!copyItem?.PreviousOwnerId ? copyItem?.PreviousOwnerId : undefined,
                    AssetType: copyItem?.AssetType,
                    QCColor: copyItem?.QCColor,
                    AssetCategory: copyItem?.AssetCategory,
                    AssetPhoto: Photo,
                    SiteNameId: !!copyItem?.SiteNameId ? copyItem?.SiteNameId : undefined,
                    WebsiteLink: copyItem?.WebsiteLink,
                    AssetPhotoThumbnailUrl: thumnailImgsUrl,
                    RealImagesLinks: copyItem?.RealImagesLinks,
                    AcquisitionValue: !!copyItem?.AcquisitionValue ? copyItem?.AcquisitionValue : "",
                    FANumber: !!copyItem?.FANumber ? copyItem?.FANumber : "",
                };

                if (copyItem?.AssetLink) {
                    data.AssetLink = copyItem.AssetLink
                }

                let toastMessage: string = "";
                const toastId = toastService.loading('Loading...');
                toastMessage = Messages.CopyAssetSuccessfully;
                let createdId = 0
                await props.provider.createItem(data, ListNames.AssetMaster).then(async (item: any) => {
                    createdId = item.data.Id;
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: props.siteMasterId,
                        ActionType: UserActivityActionTypeEnum.Copy,
                        EntityType: UserActionEntityTypeEnum.EquipmentAsset,
                        EntityId: Number(createdId),
                        EntityName: data.Title.toString().trim(),
                        Details: `Copy Equipment/Asset ${data.Title.toString().trim()}`,
                        StateId: props.dataObj?.StateId || props.dataObj?.QCStateId
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);

                    if (copyItem?.isAttachment) {
                        let attachmentUrl: any = "";
                        const attachments = await props.provider.getListItemAttachments(
                            ListNames.AssetMaster,
                            copyItem.ID
                        );
                        attachmentUrl = attachments?.length > 0 ? attachments[0]?.ServerRelativeUrl : null;
                        if (attachmentUrl) {
                            await copyListAttachmentToAnotherList(props.provider, copyItem?.Attachment, ListNames.AssetMaster, createdId).then((file: any) => {
                                console.log("Success");
                            });
                        }
                    }
                    if (!!createdId) {
                        await copyQrupload(createdId, data);
                    }
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);

                }).catch(err => console.log(err));
            }
            setState(prevState => ({ ...prevState, isShowCopyAssetModal: false, CopyAssetItem: undefined }));
            setIsLoading(false);
            _EquipmentMaster();
        }
        catch (ex) {
            const errorObj = {
                ErrorMessage: ex.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while onClickCopyAsset",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onClickCopyAsset"
            };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
            console.log(ex);
        }
    };

    const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
    React.useEffect(() => {
        props.provider.getCurrentUser().then(async (currentUserResponse) => {
            const groups = await getSiteGroupsPermission(props.provider);
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
            <Suspense fallback={<div><Loader /></div>}>
                {isPrintQRModelOpent && ListEquipment && ListEquipment.length > 0 && (
                    <PrintQrCode
                        visibleColumn={state.selectedPrintOptions || []}
                        manageComponentView={props.manageComponentView}
                        items={updateQRCodeItems}
                        onClickClose={() => setIsPrintQRModelOpent(false)}
                        isAssetQR={true}
                        isChemicalQR={false}
                        isDetailView={false}
                        key={0}
                    />
                )}
            </Suspense>

            {/* {state.isPrintSettingDialogOpen &&
                <CustomeDialog
                    isDialogOpen={state.isPrintSettingDialogOpen}
                    onClickClose={onClosePrintConfiguration}
                    dialogMessage={"Hello"} />

            } */}
            {state.isPrintSettingDialogOpen &&
                <CustomModal
                    isBlocking={true}
                    dialogWidth="900px"
                    isModalOpenProps={state.isPrintSettingDialogOpen}
                    subject={"Select Print Field"}
                    message={<div>{printFieldOptions()}</div>}
                    onClose={onClosePrintConfiguration}
                    onClickOfYes={onClickPrintConfigSave}
                    yesButtonText="Save"

                    closeButtonText="Close"
                />
            }

            {isShowModelQR &&
                <CustomModal isModalOpenProps={isShowModelQR} setModalpopUpFalse={() => {
                    setIsShowModelQR(false);
                }} subject={"Genrating QR code ..."}
                    message={<React.Suspense fallback={<></>}><GenrateQRCode url={itemurlQR.current} getTheQRUrl={genratedQrcode} /></React.Suspense>}
                    isBlocking={true}
                    isModeless={false}
                />
            }
            {isDisplayFilterDialog &&
                <CustomModal
                    isModalOpenProps={isDisplayFilterDialog}
                    dialogWidth={"300px"}
                    setModalpopUpFalse={onCloseModel}
                    subject={"Warning"}
                    message={<div>Please select filter value</div>}
                    yesButtonText="Ok"
                    onClickOfYes={onCloseModel}
                    isBlocking={true}
                    isModeless={false}
                />}
            {notFoundDialog &&
                <CustomModal
                    isModalOpenProps={notFoundDialog}
                    dialogWidth={"300px"}
                    setModalpopUpFalse={onOkModel}
                    subject={"Warning"}
                    message={<div>No record found</div>}
                    yesButtonText="Close"
                    onClickOfYes={onOkModel}
                    isBlocking={true}
                    isModeless={false}
                />}

            {state.isQRCodeModelOpen &&
                <React.Suspense fallback={<></>}>
                    <PrintQrCode

                        visibleColumn={state.selectedPrintOptions || []}
                        isDetailView={true} key={keyUpdate} manageComponentView={props.manageComponentView} items={[state.qrDetails]} onClickClose={() => setState(prevState => ({ ...prevState, isQRCodeModelOpen: false }))} isAssetQR={true} isChemicalQR={false} />
                </React.Suspense>
            }
            {<CustomModal isModalOpenProps={hideDialog} setModalpopUpFalse={() => toggleHideDialog()} subject={"Delete  Confirmation "} message={<div>Are you sure, you want to delete this record?</div>} yesButtonText="Yes" closeButtonText={"No"} onClickOfYes={onclickdelete} isBlocking={true}
                isModeless={false} />}

            {state.isUploadFileValidationModelOpen &&
                <CustomeDialog dialogContentProps={state.dialogContentProps}
                    closeText="Close" onClickClose={() => {
                        setState(prevState => ({ ...prevState, isUploadFileValidationModelOpen: false }));
                    }}
                    dialogMessage={"Kindly upload file in excel format."}
                    isDialogOpen={state.isUploadFileValidationModelOpen} />}
            {state.isShowAssetHistoryModel && <React.Suspense fallback={<></>}><AssetHistory assetMasterId={state.assetMasterId} IsSupervisor={props.IsSupervisor} context={props.context} provider={props.provider} siteNameId={state.siteNameId} onClickClose={onClickClose} isModelOpen={state.isShowAssetHistoryModel} /></React.Suspense>}
            {state.isShowMovingHistoryModel && <div className="movingHistory">
                <React.Suspense fallback={<></>}><MovingHistory assetMasterId={state.assetMasterId} movingHistory={state.movingHistory} context={props.context} provider={props.provider} siteNameId={state.siteNameId} onClickClose={onClickClose} isModelOpen={state.isShowMovingHistoryModel} /></React.Suspense>
            </div>
            }
            {state.isShowAcquireModel && <React.Suspense fallback={<></>}><AcquireAsset provider={props.provider} StateId={props?.componentProp?.dataObj?.StateId || props?.dataObj?.StateId} originalsitemasterid={props.siteMasterId} assetMasterId={state.assetMasterId} assetMasterName={state.assetMasterName} onClickClose={onClickClose} isModelOpen={state.isShowAcquireModel} /></React.Suspense>}
            {state.isShowMovingModel && <React.Suspense fallback={<></>}><MoveAsset provider={props.provider} StateId={props?.componentProp?.dataObj?.StateId || props?.dataObj?.StateId} originalsitemasterid={props.siteMasterId} assetMasterId={state.assetMasterId} assetMasterName={state.assetMasterName} onClickClose={onClickClose} isModelOpen={state.isShowMovingModel} context={props.context} /></React.Suspense>}
            {state.isShowDueDateModel && <React.Suspense fallback={<></>}><UpdateServiceHistroy provider={props.provider} assetMasterId={state.assetMasterId} onClickClose={onClickClose} isModelOpen={state.isShowDueDateModel} context={props.context} alldata={state} /></React.Suspense>}
            {state.isUploadColumnValidationModelOpen && <CustomeDialog isDialogOpen={state.isUploadColumnValidationModelOpen}
                dialogContentProps={state.dialogContentProps}
                onClickClose={() => setState(prevState => ({ ...prevState, isUploadColumnValidationModelOpen: false, isUploadModelOpen: false, mdlConfigurationFile: [] }))}
                dialogMessage={state.uploadFileErrorMessage} closeText={"Close"} />}
            {state.isAssociatModel && <React.Suspense fallback={<></>}><AssociatAssetType siteNameId={props.siteMasterId} assetMasterName={state.assetMasterName} AssetTypeMasterId={state.AssetTypeMasterId} AssetTypeMaster={state.AssetTypeMaster} ATMManufacturer={state.ATMManufacturer} assetMasterId={state.assetMasterId} context={props.context} provider={props.provider} onClickClose={onClickClose} isModelOpen={state.isAssociatModel} /></React.Suspense>}

            <CustomModal
                isModalOpenProps={state.isShowCopyAssetModal}
                setModalpopUpFalse={() => setState(prevState => ({ ...prevState, isShowCopyAssetModal: false, CopyAssetItem: undefined }))}
                subject={"Confirmation "} message={<div>{Messages.CopyAssetItemMessage}</div>}
                yesButtonText="Yes"
                closeButtonText="No"
                onClickOfYes={onClickCopyAsset}
                isBlocking={true}
                isModeless={false} />

            {isLoading && <Loader />}
            <div className={isSiteLevelComponent ? "" : "boxCard"}>
                {!isSiteLevelComponent && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                    <h1 className="mainTitle">Assets</h1>
                </div>}
                {(selectedZoneDetails && selectedZoneDetails?.selectedSitesId || selectedZoneDetails?.defaultSelectedSitesId) && <EqupmentCountCard data={SummaryData} handleCardClick={handleCardClick} />}


                <div className={`ms-Grid-row filtermrg asset-list ${isSiteLevelComponent ? "zoneCardBox" : ""}`}>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ">
                        <div className="formControl">

                            <React.Suspense fallback={<></>}><AssetNameFilterLazy
                                selectedAssetName={selectedAssetNames}
                                onAssetNameChange={onAssetNameChange}
                                provider={props.provider}
                                isRequired={true}
                                siteNameId={props.siteMasterId}
                                defaultSelectedSitesId={!!selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId}
                                AllOption={true}
                                isAdmin={isAdmin} /></React.Suspense>
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ">
                        <div className="formControl">
                            <React.Suspense fallback={<></>}><SerialNumberFilterLazy
                                selectedSerialNumber={selectedSerialNumber}
                                onSerialNumberChange={onSerialNumberChange}
                                provider={props.provider}
                                isRequired={true}
                                AllOption={true}
                                isAdmin={isAdmin}
                                defaultSelectedSitesId={!!selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId}
                                siteNameId={props.siteMasterId} /></React.Suspense>
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ">
                        <div className="formControl">
                            <React.Suspense fallback={<></>}><AssetLocationFilterLazy
                                loginUserRoleDetails={props.loginUserRoleDetails}
                                selectedAssetLocation={selectedAssetLocation}
                                onAssetLocationChange={onAssetLocationChange}
                                provider={props.provider}
                                isRequired={true}
                                isAdmin={isAdmin}
                                siteNameId={props.siteMasterId}
                                defaultSelectedSitesId={!!selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId}
                                AllOption={true} /></React.Suspense>
                        </div>
                    </div>

                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ">
                        <div className="formControl">
                            <React.Suspense fallback={<></>}><ManufacturerFilterLazy
                                selectedManufacturer={selectedManufacturer}
                                onManufacturerChange={onManufacturerChange}
                                siteNameId={props.siteMasterId}
                                provider={props.provider}
                                AllOption={true}
                                isAdmin={isAdmin}
                                defaultSelectedSitesId={!!selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId}
                                isRequired={true} /></React.Suspense>
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ">
                        <div className="formControl">
                            <React.Suspense fallback={<></>}><StatusFilterLazy
                                selectedStatus={selectedStatus}
                                onStatusChange={onStatusChange}
                                provider={props.provider}
                                AllOption={true}
                                isRequired={true} /></React.Suspense>
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2">
                        <div className="formControl">
                            <React.Suspense fallback={<></>}><FANumberFilterLazy
                                selectedFANumber={selectedFANumber}
                                onFANumberChange={onFANumberChange}
                                provider={props?.provider}
                                siteNameId={props?.siteMasterId}
                                AllOption={true}
                                isAdmin={isAdmin}
                                defaultSelectedSitesId={!!selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId}
                                loginUserRoleDetails={props?.loginUserRoleDetails}
                            /></React.Suspense>
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md8 ms-lg8 ms-xl2 ">
                        <div className="formControl">
                            <Slider
                                ranged
                                min={0}
                                max={!!maxPrice ? maxPrice : 500000}
                                // step={250}
                                defaultValue={100000}
                                defaultLowerValue={1}
                                onChange={onChangeSlider}
                                valueFormat={(value: number) => `$${value}`}
                            />
                        </div>
                    </div>
                    {false && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg2">
                        <PrimaryButton className="btnSearch btn btn-primary" onClick={() => _onClickSearch()} text="Search" />
                        {/* <input type="file" accept=".xlsx" onChange={handleFileUpload} /> */}
                    </div>}
                </div>




                {currentView === "grid" ?
                    <div className={isSiteLevelComponent ? "zoneCardBox" : ""}>
                        <MemoizedDetailList
                            manageComponentView={props.manageComponentView}
                            columns={columnsEquipment}
                            items={FilteredData || []}
                            reRenderComponent={true}
                            CustomselectionMode={isVisibleCrud.current ? SelectionMode.multiple : SelectionMode.none}
                            searchable={true}
                            isAddNew={true}
                            onItemInvoked={_onItemInvoked}
                            onSelectedItem={_onItemSelected}
                            _onSearchTextChangeForExcel={_onSearchTextChangeForExcel}
                            addEDButton={isDisplayEDbtn && isVisibleCrud.current && <>
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

                            addNewContent={isVisibleCrud.current ?
                                <div className='dflex'>
                                    {!!(selectedZoneDetails?.isSinglesiteSelected) && <Link className="actionBtn iconSize btnEdit ml-10" style={{ paddingBottom: "2px" }} onClick={onClickPrintConfigurationOpen}
                                        text="">
                                        <TooltipHost
                                            content={"Print Setting"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon
                                                icon={"gear"} />
                                        </TooltipHost>
                                    </Link>}
                                    {(!!allDataForExcel && allDataForExcel.length > 0) && (selectedZoneDetails?.isSinglesiteSelected) &&
                                        <>

                                            <Link className="actionBtn iconSize btnInfo ml-10" style={{ paddingBottom: "2px" }}
                                                onClick={() => onClickPrintQRCode()}
                                                text="">
                                                <TooltipHost
                                                    content={"Print QR Code"}
                                                    id={tooltipId}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={"print"} />
                                                </TooltipHost>
                                            </Link>
                                            {/* <Link className="actionBtn iconSize btnEdit ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                        text="">
                                        <TooltipHost
                                            content={"Export to excel"}
                                            id={tooltipId}
                                        >
                                            {isVisibleCrud.current && <FontAwesomeIcon
                                                icon={"file-excel"}
                                            />}
                                        </TooltipHost>
                                    </Link> */}
                                        </>

                                    }{
                                        isVisibleCrud.current && <>
                                            {downloadDisable && (selectedZoneDetails?.isSinglesiteSelected) ?
                                                <Link className="actionBtn iconSize btnInfo ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                                    text="">
                                                    <TooltipHost
                                                        content={"Sample Excel File Not Available"}
                                                        id={tooltipId}
                                                    >
                                                        {isVisibleCrud.current && <FontAwesomeIcon
                                                            icon={"download"}
                                                        />}
                                                    </TooltipHost></Link> :

                                                <>
                                                    {(selectedZoneDetails?.isSinglesiteSelected) &&
                                                        <Link className="actionBtn iconSize disable btnMove ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                                            text="">
                                                            <TooltipHost
                                                                content={"Download Sample Excel File"}
                                                                id={tooltipId}
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={"download"}
                                                                />
                                                            </TooltipHost>
                                                        </Link>
                                                    }
                                                </>
                                            }
                                            {(selectedZoneDetails?.isSinglesiteSelected) &&
                                                <Link className="actionBtn iconSize btnDanger ml-10 dticon" style={{ paddingBottom: "2px" }} onClick={onclickUpload}
                                                    text="">
                                                    <TooltipHost
                                                        content={"Upload Excel File"}
                                                        id={tooltipId}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={"upload"}
                                                        />
                                                    </TooltipHost>
                                                </Link>
                                            }

                                            {FilteredData && FilteredData.length > 0 &&
                                                <>
                                                    <Link className="actionBtn iconSize btnRefresh refresh-icon-m" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
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
                                                    {
                                                        <Link Link className="btn-back-ml-4 dticon">
                                                            <TooltipHost content="Export options">
                                                                <DefaultButton
                                                                    text="Export"
                                                                    iconProps={{ iconName: "Download", style: { color: "#ffffff" } }}
                                                                    menuProps={menuProps}
                                                                    className="btn export-btn-primary"
                                                                />
                                                            </TooltipHost>
                                                        </Link>
                                                    }
                                                    {/* Add Manage Location Access Button */}
                                                    {(props.isShowAssetLocationAccess && props.isSiteInformationView) && (selectedZoneDetails?.isSinglesiteSelected) && <PrimaryButton className="btn btn-primary no-wrap-button dticon" text="Location Access" onClick={!!props.onClickAccesLocation && props.onClickAccesLocation} style={{ marginLeft: "4px" }} />}
                                                    {
                                                        <div className="ml-4-mobile">
                                                            <TooltipHost
                                                                content={"Send Email With PDF"}
                                                                id={tooltipId}>
                                                                <CommonPopup
                                                                    isPopupVisible={isPopupVisible}
                                                                    isPrice={true}
                                                                    hidePopup={hidePopup}
                                                                    title={title}
                                                                    sendToEmail={sendToEmail}
                                                                    onChangeTitle={onChangeTitle}
                                                                    onChangeSendToEmail={onChangeSendToEmail}
                                                                    displayerrortitle={displayerrortitle}
                                                                    displayerroremail={displayerroremail}
                                                                    displayerror={displayerror}
                                                                    onClickSendEmail={onClickSendEmail}
                                                                    onClickCancel={onClickCancel}
                                                                    onclickSendEmail={onclickSendEmail}
                                                                    onToggleChange={handlePriceToggle}
                                                                />
                                                            </TooltipHost>
                                                        </div>}
                                                </>
                                            }
                                            <TooltipHost
                                                content={"Add New Asset"}
                                                id={tooltipId}
                                            >

                                                <PrimaryButton className="btn btn-primary" onClick={onclickAdd} text="Add" />
                                            </TooltipHost>
                                            <div className="grid-list-view">
                                                <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`}
                                                    onClick={() => handleViewChange("grid")}>
                                                    <TooltipHost content={"List View"} id={tooltipId}>
                                                        <FontAwesomeIcon icon="list" />
                                                    </TooltipHost>
                                                </Link>
                                                <Link
                                                    className={`grid-list-btn ${currentView !== "grid" ? "active" : ""}`}
                                                    onClick={() => {
                                                        handleViewChange("card");
                                                        // setUpdateItem([]);
                                                    }}>
                                                    <TooltipHost content={"Card View"} id={tooltipId}>
                                                        <FontAwesomeIcon icon="th" />
                                                    </TooltipHost>
                                                </Link>
                                            </div>
                                        </>
                                    }
                                </div > :
                                <div className='dflex'> {(!!allDataForExcel && allDataForExcel.length > 0) &&
                                    <>


                                        <Link className="btn-back-ml-4 dticon">
                                            <TooltipHost content="Export options">
                                                <DefaultButton
                                                    text="Export"
                                                    iconProps={{ iconName: "Download", style: { color: "#ffffff" } }}
                                                    menuProps={menuProps}
                                                    className="btn export-btn-primary"
                                                />
                                            </TooltipHost>
                                        </Link>
                                        <div className="ml-4-mobile">
                                            <TooltipHost
                                                content={"Send Email With PDF"}
                                                id={tooltipId}>
                                                <div className="">
                                                    <CommonPopup
                                                        isPopupVisible={isPopupVisible}
                                                        isPrice={true}
                                                        hidePopup={hidePopup}
                                                        title={title}
                                                        sendToEmail={sendToEmail}
                                                        onChangeTitle={onChangeTitle}
                                                        onChangeSendToEmail={onChangeSendToEmail}
                                                        displayerrortitle={displayerrortitle}
                                                        displayerroremail={displayerroremail}
                                                        displayerror={displayerror}
                                                        onClickSendEmail={onClickSendEmail}
                                                        onClickCancel={onClickCancel}
                                                        onclickSendEmail={onclickSendEmail}
                                                        onToggleChange={handlePriceToggle}
                                                    />
                                                </div>
                                            </TooltipHost>
                                        </div>
                                        <div className="grid-list-view">
                                            <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`}
                                                onClick={() => handleViewChange("grid")}>
                                                <TooltipHost content={"List View"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="list" />
                                                </TooltipHost>
                                            </Link>
                                            <Link
                                                className={`grid-list-btn ${currentView !== "grid" ? "active" : ""}`}
                                                onClick={() => {
                                                    handleViewChange("card");
                                                    // setUpdateItem([]);
                                                }}>
                                                <TooltipHost content={"Card View"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="th" />
                                                </TooltipHost>
                                            </Link>
                                        </div>
                                    </>



                                }
                                    {
                                        isVisibleCrud.current && <>
                                            {downloadDisable && (selectedZoneDetails?.isSinglesiteSelected) ?
                                                <Link className="actionBtn iconSize btnInfo ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                                    text="">
                                                    <TooltipHost
                                                        content={"Sample Excel File Not Available"}
                                                        id={tooltipId}
                                                    >
                                                        && <FontAwesomeIcon
                                                            icon={"download"}
                                                        />
                                                    </TooltipHost></Link> :

                                                <>
                                                    {(selectedZoneDetails?.isSinglesiteSelected) &&
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
                                                    }
                                                </>
                                            }
                                        </>
                                    }
                                </div >
                            }

                        />
                    </div > :
                    <>
                        {isVisibleCrud.current ?
                            <div className='dflex flex-wrap topInnerPadding icon-Shift-Right' >
                                {(selectedZoneDetails?.isSinglesiteSelected) && <Link className="actionBtn iconSize btnEdit ml-10" style={{ paddingBottom: "2px" }} onClick={onClickPrintConfigurationOpen}
                                    text="">
                                    <TooltipHost
                                        content={"Print Setting"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon
                                            icon={"gear"} />
                                    </TooltipHost>
                                </Link>}
                                {(!!allDataForExcel && allDataForExcel.length > 0) && (selectedZoneDetails?.isSinglesiteSelected) &&
                                    <>
                                        {(selectedZoneDetails?.isSinglesiteSelected) && <Link className="actionBtn iconSize btnInfo ml-10" style={{ paddingBottom: "2px" }}
                                            onClick={() => onClickPrintQRCode()}
                                            text="">
                                            <TooltipHost
                                                content={"Print QR Code"}
                                                id={tooltipId}
                                            >
                                                <FontAwesomeIcon
                                                    icon={"print"} />
                                            </TooltipHost>
                                        </Link>}
                                        {/* <Link className="actionBtn iconSize btnEdit ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                        text="">
                                        <TooltipHost
                                            content={"Export to excel"}
                                            id={tooltipId}
                                        >
                                            {isVisibleCrud.current && <FontAwesomeIcon
                                                icon={"file-excel"}
                                            />}
                                        </TooltipHost>
                                    </Link> */}

                                    </>

                                }{
                                    isVisibleCrud.current && <>
                                        {downloadDisable && (selectedZoneDetails?.isSinglesiteSelected) ?
                                            <Link className="actionBtn iconSize btnInfo ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                                text="">
                                                <TooltipHost
                                                    content={"Sample Excel File Not Available"}
                                                    id={tooltipId}
                                                >
                                                    {isVisibleCrud.current && <FontAwesomeIcon
                                                        icon={"download"}
                                                    />}
                                                </TooltipHost></Link> :
                                            <>
                                                {(selectedZoneDetails?.isSinglesiteSelected) &&
                                                    < Link className="actionBtn iconSize disable btnMove ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                                        text="">
                                                        <TooltipHost
                                                            content={"Download Sample Excel File"}
                                                            id={tooltipId}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={"download"}
                                                            />
                                                        </TooltipHost>
                                                    </Link>}

                                            </>
                                        }
                                        {(selectedZoneDetails?.isSinglesiteSelected) &&
                                            <Link className="actionBtn iconSize btnDanger ml-10 dticon" style={{ paddingBottom: "2px" }} onClick={onclickUpload}
                                                text="">
                                                <TooltipHost
                                                    content={"Upload Excel File"}
                                                    id={tooltipId}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={"upload"}
                                                    />
                                                </TooltipHost>
                                            </Link>
                                        }
                                        {FilteredData && FilteredData.length > 0 &&
                                            <>
                                                <Link className="actionBtn iconSize btnRefresh refresh-icon-m" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
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
                                                {
                                                    <Link className="btn-back-ml-4 dticon">
                                                        <TooltipHost content="Export options">
                                                            <DefaultButton
                                                                text="Export"
                                                                iconProps={{ iconName: "Download" }}
                                                                menuProps={menuProps}
                                                                className="btn export-btn-primary"
                                                            />
                                                        </TooltipHost>
                                                    </Link>
                                                }
                                                {(props.isShowAssetLocationAccess && props.isSiteInformationView) && (selectedZoneDetails?.isSinglesiteSelected) && <TooltipHost
                                                    content={"Location Access"}
                                                >
                                                    <PrimaryButton
                                                        iconProps={{ iconName: "Settings" }}
                                                        className="btn btn-primary no-wrap-button dticon"
                                                        text="Location Access"
                                                        onClick={!!props.onClickAccesLocation && props.onClickAccesLocation}
                                                        style={{ marginLeft: "4px" }}
                                                    />
                                                </TooltipHost>}
                                                {
                                                    <div className="ml-4-mobile">
                                                        <TooltipHost
                                                            content={"Send Email With PDF"}
                                                            id={tooltipId}>
                                                            <div className="">
                                                                <CommonPopup
                                                                    isPopupVisible={isPopupVisible}
                                                                    isPrice={true}
                                                                    hidePopup={hidePopup}
                                                                    title={title}
                                                                    sendToEmail={sendToEmail}
                                                                    onChangeTitle={onChangeTitle}
                                                                    onChangeSendToEmail={onChangeSendToEmail}
                                                                    displayerrortitle={displayerrortitle}
                                                                    displayerroremail={displayerroremail}
                                                                    displayerror={displayerror}
                                                                    onClickSendEmail={onClickSendEmail}
                                                                    onClickCancel={onClickCancel}
                                                                    onclickSendEmail={onclickSendEmail}
                                                                    onToggleChange={handlePriceToggle}
                                                                />
                                                            </div>
                                                        </TooltipHost>
                                                    </div>
                                                }
                                                <TooltipHost
                                                    content={"Add New Asset"}
                                                    id={tooltipId}
                                                >
                                                    <PrimaryButton className="btn btn-primary" onClick={onclickAdd} text="Add" />
                                                </TooltipHost>
                                                <span className="grid-list-view">
                                                    <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`}
                                                        onClick={() => handleViewChange("grid")}>
                                                        <TooltipHost content={"List View"} id={tooltipId}>
                                                            <FontAwesomeIcon icon="list" />
                                                        </TooltipHost>
                                                    </Link>
                                                    <Link
                                                        className={`ml-10 grid-list-btn ${currentView !== "grid" ? "active" : ""}`}
                                                        onClick={() => handleViewChange("card")}>
                                                        <TooltipHost content={"Card View"} id={tooltipId}>
                                                            <FontAwesomeIcon icon="th" />
                                                        </TooltipHost>
                                                    </Link>
                                                </span>
                                            </>
                                        }


                                    </>
                                }
                            </div > :
                            <div className='dflex flex-wrap topInnerPadding'> {(!!allDataForExcel && allDataForExcel.length > 0) &&
                                // <Link Link className="actionBtn iconSize btnEdit ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                //     text="">
                                //     <TooltipHost
                                //         content={"Export to excel"}
                                //         id={tooltipId}
                                //     >
                                //         <FontAwesomeIcon
                                //             icon={"file-excel"}
                                //         />
                                //     </TooltipHost>
                                // </Link>
                                <>


                                    <Link className="btn-back-ml-4 dticon mla">
                                        <TooltipHost content="Export options">
                                            <DefaultButton
                                                text="Export"
                                                iconProps={{ iconName: "Download", style: { color: "#ffffff" } }}
                                                menuProps={menuProps}
                                                className="btn export-btn-primary"
                                            />
                                        </TooltipHost>
                                    </Link>
                                    <div className="ml-4-mobile">
                                        <TooltipHost
                                            content={"Send Email With PDF"}
                                            id={tooltipId}>
                                            <div className="">
                                                <CommonPopup
                                                    isPopupVisible={isPopupVisible}
                                                    isPrice={true}
                                                    hidePopup={hidePopup}
                                                    title={title}
                                                    sendToEmail={sendToEmail}
                                                    onChangeTitle={onChangeTitle}
                                                    onChangeSendToEmail={onChangeSendToEmail}
                                                    displayerrortitle={displayerrortitle}
                                                    displayerroremail={displayerroremail}
                                                    displayerror={displayerror}
                                                    onClickSendEmail={onClickSendEmail}
                                                    onClickCancel={onClickCancel}
                                                    onclickSendEmail={onclickSendEmail}
                                                    onToggleChange={handlePriceToggle}
                                                />
                                            </div>
                                        </TooltipHost>
                                    </div>
                                    <div className="grid-list-view">
                                        <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`}
                                            onClick={() => handleViewChange("grid")}>
                                            <TooltipHost content={"List View"} id={tooltipId}>
                                                <FontAwesomeIcon icon="list" />
                                            </TooltipHost>
                                        </Link>
                                        <Link
                                            className={`grid-list-btn ${currentView !== "grid" ? "active" : ""}`}
                                            onClick={() => {
                                                handleViewChange("card");
                                                // setUpdateItem([]);
                                            }}>
                                            <TooltipHost content={"Card View"} id={tooltipId}>
                                                <FontAwesomeIcon icon="th" />
                                            </TooltipHost>
                                        </Link>
                                    </div>
                                </>

                            }
                                {
                                    isVisibleCrud.current && <>
                                        {downloadDisable && (selectedZoneDetails?.isSinglesiteSelected) ?
                                            <Link className="actionBtn iconSize btnInfo ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                                text="">
                                                <TooltipHost
                                                    content={"Sample Excel File Not Available"}
                                                    id={tooltipId}
                                                >
                                                    && <FontAwesomeIcon
                                                        icon={"download"}
                                                    />
                                                </TooltipHost></Link> :

                                            <>
                                                {(selectedZoneDetails?.isSinglesiteSelected) &&
                                                    <Link className="actionBtn iconSize disable btnMove ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                                        text="">
                                                        <TooltipHost
                                                            content={"Download Sample Excel File"}
                                                            id={tooltipId}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={"download"}
                                                            />
                                                        </TooltipHost>
                                                    </Link>
                                                }
                                            </>
                                        }

                                    </>
                                }
                            </div >
                        }
                        <AssetCardView
                            _onclickDetailsView={_onclickDetailsView}
                            _onclickMovingHistory={_onclickMovingHistory}
                            _onclickEdit={onclickEdit}  // Pass _onclickEdit
                            items={!!isSelectedData ? UpdateItem : FilteredData}
                            manageComponentView={props.manageComponentView}
                            setState={setState}
                            setKeyUpdate={setKeyUpdate}
                            _onclickconfirmdelete={onclickconfirmdelete}
                            isEditDelete={true}
                            menu={true}
                            onSelectCards={setSelectedCardItems}
                            _onclickCopyAsset={_onclickCopyAsset}
                        />
                    </>
                }

            </div >
            {
                state.isUploadModelOpen &&
                <CustomModal dialogWidth="900px" isModalOpenProps={state.isUploadModelOpen} setModalpopUpFalse={onClickCloseModel} subject={"Upload"} message={DranAndDrop}
                    closeButtonText={""} isBlocking={true}
                    isModeless={false} />
            }

            {/* <div className={`${isPdfGenerating ? 'hide-pdf' : ''}`}> */}
            {isPdfGenerating && (
                <React.Suspense fallback={<></>}>
                    <PdfGenerateEquipment
                        ListEquipment={selectedCardItems.length > 0
                            ? selectedCardItems
                            : !!isSelectedData
                                ? UpdateItem
                                : FilteredData}
                        imgLogo={imgLogo}
                        DisplayPrice={DisplayPrice} context={props.context}                        //onDone={() => setIsPdfGenerating(false)} // unmount after PDF generation
                    />
                </React.Suspense>
            )}
            {/* </div> */}
        </>;
    }
};