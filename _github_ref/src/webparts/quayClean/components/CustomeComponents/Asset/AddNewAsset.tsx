/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-void */
/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { Breadcrumb, DatePicker, Dialog, DialogType, IPersonaProps, Label, Link, Panel, PanelType, PrimaryButton, TextField, TooltipHost, defaultDatePickerStrings } from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IQuayCleanState } from "../../QuayClean";
import { StatusFilter } from "../../../../../Common/Filter/StatusFilter";
import { ManufacturerFilter } from "../../../../../Common/Filter/ManufacturerFilter";
import { onFormatDate, logGenerator, removeElementOfBreadCrum, saveThumbNailImage, imgValidation, UserActivityLog, saveNewThumbNailImage, copyListAttachmentToAnotherList } from "../../../../../Common/Util";
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { ComponentNameEnum, devSiteURL, ListNames, mainSiteURL, qaSiteURL, qrcodeSiteURL, stageSiteURLNew, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { AssetTypeFilter } from "../../../../../Common/Filter/AssetTypeFilter";
import { ColorFilter } from "../../../../../Common/Filter/ColorFilter";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import { Loader } from "../../CommonComponents/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomModal from "../../CommonComponents/CustomModal";
import { ValidateForm } from "../../../../../Common/Validation";
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import { GenrateQRCode } from "../../CommonComponents/GenrateQRCode";
import * as qrcode from 'qrcode';
import { toastService } from "../../../../../Common/ToastService";
import { Environment, EnvironmentType } from "@microsoft/sp-core-library";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { QuayCleanChoices } from "../../../../../Common/QuayCleanChoices";
import { MasterAssetDialog } from "../Site/MasterAssetDialog";
import { Messages } from "../../../../../Common/Constants/Messages";
import { MasterManufacturerFilter } from "../../../../../Common/Filter/MasterManufacturerFilter";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { SiteFilter } from "../../../../../Common/Filter/SiteFilter";
import { ISelectedZoneDetails } from "../../../../../Interfaces/ISelectedZoneDetails";
import { useAtom, useAtomValue } from "jotai";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";
export interface IAddNewAssetProps {
    provider: IDataProvider;
    context: WebPartContext;
    isAddNewAsset?: boolean;
    manageComponentView(componentProp: IQuayCleanState): any;
    siteMasterId: any;
    isShowDetailOnly?: boolean;
    dataObj?: any;
    qCState?: string;
    siteName?: string;
    componentProp: IQuayCleanState;
    loginUserRoleDetails: any;
    selectedZoneDetails?: ISelectedZoneDetails
}

export const AddNewAsset = (props: IAddNewAssetProps) => {
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const [selectedStatus, setSelectedStatus] = React.useState<any>("");
    const [selectedManufacturer, setSelectedManufacturer] = React.useState<any>("");
    const [selectedAssetType, setSelectedAssetType] = React.useState<any>("");
    const [selectedColor, setSelectedColor] = React.useState<any>("");
    // const [selectedAssetCategory, setSelectedAssetCategory] = React.useState<any>("");
    const [selectedSite, setSelectedSite] = React.useState<any>();
    const [assetPurchaseDate, setAssetPurchaseDate] = React.useState<any>(null);
    const [serviceDueDate, setServiceDueDate] = React.useState<any>(null);
    const [CurrentOwner, setCurrentOwner] = React.useState<any>(0);
    const [PreviousOwner, setPreviousOwner] = React.useState<any>(0);
    const [validationMessages, setValidationMessages] = React.useState<any[]>([]);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [selectedFiles, setSelectedFiles] = React.useState<IFileWithBlob[]>([]);
    const [selectedRealFiles, setSelectedRealFiles] = React.useState<IFileWithBlob[]>([]);
    const [selectedPDFs, setSelectedPDFs] = React.useState<IFileWithBlob[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [selectedCurrentOwner, setselectedCurrentOwner] = React.useState<any[]>([]);
    const [selectedPreviousOwner, setselectedPreviousOwner] = React.useState<any[]>([]);
    const [isUpdate, setIsUpdate] = React.useState<boolean>(false);
    const [IsDeleted, setIsDeleted] = React.useState<boolean>(true);
    const [IsPDF, setIsPDF] = React.useState<boolean>(true);
    const [isImageErrorModelOpen, setIsImageErrorModelOpen] = React.useState<boolean>(false);
    const [isRealImageErrorModelOpen, setRealIsImageErrorModelOpen] = React.useState<boolean>(false);
    const [IsPDFDeleted, setIsPDFDeleted] = React.useState<boolean>(true);
    const [isShowModelQR, setIsShowModelQR] = React.useState<boolean>(false);
    const [isReload, setisReload] = React.useState<boolean>(false);
    const [DisplayRealImgControl, setDisplayRealImgControl] = React.useState<boolean>(false);
    const itemurlQR = React.useRef<any>();
    const itemsRefQR = React.useRef<any>();
    const deletefileName = React.useRef<any>();
    const [url, seturl] = React.useState<string>("");
    const [isPanelOpen, setisPanelOpen] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const [hideDialogdelete, { toggle: toggleHideDialogdelete }] = useBoolean(false);
    const [hideConfirmationDialog, { toggle: toggleConfirmationDialog }] = useBoolean(false);
    const [AssetsData, setAssetsData] = React.useState<any[]>([]);

    const [state, setState] = React.useState<any>({
        isUploadFileValidationModelOpen: false,
        dialogContentProps: {
            type: DialogType.normal,
            title: 'Incorrect Formate',
            closeButtonAriaLabel: 'Close',
            subText: "",
        },
    });
    const [addAssetDataList, setAddAssetDataList] = React.useState<any>({
        Title: "",
        Model: "",
        SerialNumber: "",
        PurchasePrice: "",
        // QCOrder: "",
        // NumberOfItems: "",
        ConditionNotes: "",
        AssetLink: "",
        Attachment: "",
        WebsiteLink: "",
        AssetNo: "",
        EquipmentType: "",
        FANumber: "",
        AcquisitionValue: "",
    });
    const [imageURL, setImageURL] = React.useState("");
    const [showModal, setShowModal] = React.useState(false);
    const [displayerror, setdisplayerror] = React.useState<boolean>(false);
    const [displayerrorweblink, setdisplayerrorweblink] = React.useState<boolean>(false);
    const [videoLinks, setVideoLinks] = React.useState<any>([]);
    const [currentLink, setCurrentLink] = React.useState<string>("");
    const [isShowMasterAssetModel, setIsShowMasterAssetModel] = React.useState<boolean>(!!props.dataObj ? false : true);
    const [selectedMasterItem, setSelectedMasterItem] = React.useState<any>(undefined);
    const [isDisable, setIsDisable] = React.useState<boolean>(false);
    const [selectedHDAssetLocation, setSelectedHDAssetLocation] = React.useState<any>("");
    const [equipmentOptions, setEquipmentOptions] = React.useState<any[]>([]);
    const [showFAField, setShowFAField] = React.useState(false);

    const getEquipmentTypeOptions = (): void => {
        let dropdownValues: any[] = [];
        props.provider.choiceOption(ListNames.AssetMaster, "EquipmentType")
            .then((response) => {
                response.forEach((value: any) => {
                    dropdownValues.push({ value: value, label: value });
                });
                setEquipmentOptions(dropdownValues);
            })
            .catch((error) => {
                console.log("Error fetching EquipmentType options:", error);
            });
    };

    React.useEffect(() => {
        getEquipmentTypeOptions();
    }, []);
    const _onEquipmentTypeChange = (option: any): void => {
        setAddAssetDataList((prev: any) => ({
            ...prev,
            EquipmentType: option?.value
        }));
    };
    const onHDChangeAssetLocation = (AssetLocationId: any): void => {
        setSelectedHDAssetLocation(AssetLocationId);
        // setNewFromObj(prevState => ({ ...prevState, AssetLocation: AssetLocationId }));
    };
    const onSiteChange = (selectedOption: any): void => {
        setSelectedSite(selectedOption?.value);
    };

    const handleLinkChange = (event: any) => {
        setCurrentLink(event.target.value);
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

    const onClickAddLink = () => {
        if (currentLink.trim() !== "") {
            const trimmedLink = currentLink.trim();
            const updatedVideoLinks = videoLinks ? [...videoLinks, trimmedLink] : [trimmedLink];
            const urlString = updatedVideoLinks.join(', ');
            setVideoLinks(updatedVideoLinks);
            setAddAssetDataList({ ...addAssetDataList, AssetLink: urlString });
            setCurrentLink("");
        }

    };

    const handleLinkClick = (link: any) => {
        window.open(link, '_blank');
    };

    const handleDeleteLink = (index: any) => {
        const updatedLinks = videoLinks.filter((_: any, i: any) => i !== index);
        setVideoLinks(updatedLinks);
        const urlString = updatedLinks.join(', ');
        setAddAssetDataList({ ...addAssetDataList, AssetLink: urlString });
    };

    const toggleModal = (imgURL: string | undefined) => {
        setImageURL(imgURL ? imgURL : "");
        setShowModal(!showModal);
    };


    const onChangeCurrentOwner = (items: IPersonaProps[]): void => {
        setCurrentOwner(items.length > 0 ? items[0].id : 0);
    };
    const onChangePreviousOwner = (items: IPersonaProps[]): void => {
        setPreviousOwner(items.length > 0 ? items[0].id : 0);
    };
    const onStatusChange = (status: any): void => {
        setSelectedStatus(status.text);
    };
    const onManufacturerChange = (manufacturer: any): void => {
        // setSelectedManufacturer(manufacturer.text);
        setSelectedManufacturer(manufacturer);
    };
    const onAssetTypeChange = (assetTypeId: string): void => {
        setSelectedAssetType(assetTypeId);
    };
    const onColorChange = (colorId: string): void => {
        setSelectedColor(colorId);
    };
    // const onAssetCategoryChange = (AssetCategoryId: string): void => {
    //     setSelectedAssetCategory(AssetCategoryId);
    // };
    const addAssetdata = (event: any): void => {
        let { name, value } = event.target;
        if (name === "AcquisitionValue" || name === "PurchasePrice") {
            value = value.replace(/[^0-9.]/g, "");
            const parts = value.split(".");
            if (parts.length > 2) {
                value = parts[0] + "." + parts.slice(1).join("").replace(/\./g, "");
            }
        } else if (name === "FANumber") {
            value = value.replace(/[^0-9]/g, "");
        }
        const updatedData = { ...addAssetDataList, [name]: value };
        if (name === "AcquisitionValue") {
            const numericValue = Number(value);
            if (numericValue > 1000) {
                setShowFAField(true);
            } else {
                setShowFAField(false);
                updatedData.FANumber = "";
                // setAddAssetDataList({ ...addAssetDataList, FANumber: "" });
            }
        }
        // setAddAssetDataList({ ...addAssetDataList, [event.target.name]: event.target.value });
        if (event.target.name === "WebsiteLink") {
            if (event.target.value == "" || event.target.value == undefined) {
                setdisplayerrorweblink(false);
            }
            const enteredValue = event.target.value;
            const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
            if (!enteredValue || urlPattern.test(enteredValue)) {
                setdisplayerrorweblink(false);
            } else {
                setdisplayerrorweblink(true);
            }
            // Then handle AcquisitionValue-based logic

        }
        setAddAssetDataList(updatedData);
    };

    const dialogContentProps = {
        type: DialogType.normal,
        title: 'Validation Summary',
        closeButtonAriaLabel: 'Close'
    };
    const modalPropsStyles = { main: { maxWidth: 450 } };
    const modalProps = React.useMemo(
        () => ({
            isBlocking: true,
            styles: modalPropsStyles,
        }),
        [],
    );

    const validateForm = () => {
        const { Title, Model, SerialNumber, PurchasePrice, NumberOfItems, AssetLink, WebsiteLink } = addAssetDataList;
        setValidationMessages([]);
        const messages = [];
        // let seenCombinations = new Set();
        // Check if Title is missing or only spaces
        if (!Title || Title.trim() === "") {
            messages.push("Title Is Required");
        }
        if (!selectedSite) {
            messages.push("Site Is Required");
        }
        if (isUpdate) {
            if (selectedFiles.length <= 0 && props.dataObj[0].AssetImage === "") {
                messages.push("Device Photo Is Required");
            }
            if (IsDeleted === true && selectedFiles.length <= 0) {
                messages.push("Device Photo Is Required");
            }
        } else {
            if (selectedFiles.length <= 0 && !selectedMasterItem?.AssetImage) {
                messages.push("Device Photo Is Required");
            }
            if (IsDeleted === true && selectedFiles.length <= 0) {
                messages.push("Device Photo Is Required");
            }
        }

        // Check if Model is missing or only spaces
        if (!Model || Model.trim() === "") {
            messages.push("Model Is Required");
        }

        if (!selectedAssetType) {
            messages.push("Asset Type Is Required");
        }
        // Check if SerialNumber is missing or only spaces
        if (!SerialNumber || SerialNumber.trim() === "") {
            messages.push("Serial Number Is Required");
        }

        if (SerialNumber && SerialNumber.trim() !== "") {
            for (let i = 0; i < AssetsData.length; i++) {
                if (!!props.dataObj) {
                    if (
                        props.dataObj[0].SerialNumber.trim().toLowerCase() === SerialNumber.trim().toLowerCase() &&
                        props.dataObj[0].Model.trim().toLowerCase() === Model.trim().toLowerCase()
                    ) {
                        // same record – skip
                        continue;
                    } else {
                        if (
                            AssetsData[i].Model.trim().toLowerCase() === Model.trim().toLowerCase() &&
                            AssetsData[i].SerialNumber.trim().toLowerCase() === SerialNumber.trim().toLowerCase()
                        ) {
                            messages.push(
                                `Serial Number:${SerialNumber} already exists for Model: ${Model}`
                            );
                            break; // ✅ stop loop after first match
                        }
                    }
                } else {
                    if (
                        AssetsData[i].Model.trim().toLowerCase() === Model.trim().toLowerCase() &&
                        AssetsData[i].SerialNumber.trim().toLowerCase() === SerialNumber.trim().toLowerCase()
                    ) {
                        messages.push(
                            `Serial Number:${SerialNumber} already exists for Model: ${Model}`
                        );
                        break; // ✅ stop loop here too
                    }
                }
            }
        }


        // for (let i = 0; i < AssetsData.length; i++) {
        //     if (!!props.dataObj) {
        //         // alert("dataObj: " + props.dataObj);
        //         if (props.dataObj[0].SerialNumber.trim().toLowerCase() === SerialNumber.trim().toLowerCase() &&
        //             props.dataObj[0].Model.trim().toLowerCase() === Model.trim().toLowerCase()) {
        //             console.log();
        //         } else {
        //             if (
        //                 AssetsData[i].Model.trim().toLowerCase() === Model.trim().toLowerCase() &&
        //                 AssetsData[i].SerialNumber.trim().toLowerCase() === SerialNumber.trim().toLowerCase()
        //             ) {
        //                 messages.push(
        //                     `Serial Number:${SerialNumber} already exists for Model: ${Model}`
        //                 );
        //             }
        //         }
        //     } else {
        //         if (
        //             AssetsData[i].Model.trim().toLowerCase() === Model.trim().toLowerCase() &&
        //             AssetsData[i].SerialNumber.trim().toLowerCase() === SerialNumber.trim().toLowerCase()
        //         ) {
        //             messages.push(
        //                 `Serial Number:${SerialNumber} already exists for Model: ${Model}`
        //             );
        //         }
        //     }
        // }

        if (!PurchasePrice) {
            messages.push("Book Value Is Required");
        }

        if (!!PurchasePrice) {
            if (!/^\d+(\.\d+)?$/.test(PurchasePrice) || Number(PurchasePrice) <= 0) {
                messages.push("Enter Valid Book value (Number Only & Greater than 0)");
            }
        }

        if (!!addAssetDataList?.AcquisitionValue) {
            if (!/^\d+(\.\d+)?$/.test(addAssetDataList.AcquisitionValue) || Number(addAssetDataList.AcquisitionValue) <= 0) {
                messages.push("Enter a valid Acquisition Value (numbers only and greater than 0)");
            }
            if (Number(addAssetDataList.AcquisitionValue) > 1000) {
                const faRegex = /^\d{4,6}$/;
                const faNumber = addAssetDataList?.FANumber?.trim() || "";
                if (faNumber !== "" && !faRegex.test(faNumber)) {
                    messages.push("Enter valid FA Number (only 4 to 6 digits allowed)");
                }
            }
        }
        if (assetPurchaseDate == null) {
            messages.push("Purchase Date Is Required");
        }

        if (!selectedStatus) {
            messages.push("Status Is Required");
        }

        if (!selectedManufacturer) {
            messages.push("Manufacturer Is Required");
        }

        // if (CurrentOwner === 0 || CurrentOwner === "" || CurrentOwner === null) {
        //     messages.push("Current Owner Is Required");
        // }

        if (!!WebsiteLink) {
            const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
            if (!WebsiteLink.trim() || !urlPattern.test(WebsiteLink)) {
                messages.push("Enter Valid Website Link");
            }
        }

        if (IsPDF === false) {
            messages.push("AssetPDF must be PDF Only");
        }

        if (isImageErrorModelOpen) {
            messages.push("Device Photo must be image Only");
        }

        setValidationMessages(messages);
        return messages.length > 0;
    };


    const _onClickDeleteUploadFile = (): void => {

        setIsDeleted(true);
    };
    const _onClickDeleteUploadPDF = async (): Promise<void> => {
        await props.provider.deleteAttachment(ListNames.AssetMaster, props.dataObj[0].ID, addAssetDataList.Attachment);
        setIsPDFDeleted(true);
    };

    const dataURItoBlob = (dataURI: string): Blob => {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: mimeString });
        return blob;

    };

    const afterQrGenrate = async (url: any) => {
        const data = dataURItoBlob(url);
        const QrName = itemsRefQR.current.Title.split(' ').join('') + '-' + itemsRefQR.current.Id;
        const file: IFileWithBlob = {
            file: data,
            name: `${QrName}.png`,
            folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/QRCode`,
            overwrite: true
        };
        const fileUpload = await props.provider.uploadFile(file);
        const Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl });
        await props.provider.updateItemWithPnP({ QRCode: Photo }, ListNames.AssetMaster, itemsRefQR.current.Id);
        setIsShowModelQR(false);
        setIsLoading(false);
        onpageClose()
        // const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
        // props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProp.dataObj2, isShowDetailOnly: true, pivotName: "EquipmentKey", siteMasterId: props.siteMasterId, siteName: props.siteName, qCState: props.qCState, breadCrumItems: breadCrumItems });
    };

    const genratedQrcode = (baseUrl: any) => {
        afterQrGenrate(baseUrl);
    };

    const qrupload = async (Id: any, items: any): Promise<void> => {

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
            const QrName = items.Title.split(' ').join('') + '-' + Id;
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

    const onClick_SaveAsset = async (evt: { preventDefault: () => void; }) => {
        try {

            if (validateForm()) {
                toggleHideDialog();
                evt.preventDefault();
            }
            else {
                setIsLoading(true);
                let Photo;

                // let fileUpload: any;
                let link = [];
                let linkstr = "";
                let thumnailImgsUrl: any;
                for (let i = 0; i < selectedRealFiles.length; i++) {
                    const fileUpload = await props.provider.uploadFile(selectedRealFiles[i]);
                    const Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl });
                    const absurl = props.context.pageContext.web.absoluteUrl;
                    const trimmedUrl = absurl.split('/').slice(0, -2).join('/');
                    const photoObj = JSON.parse(Photo);
                    const fullUrl = `${trimmedUrl}${photoObj.serverRelativeUrl}`;
                    link.push(fullUrl);
                    linkstr = link.join(', ');
                }
                if (isUpdate) {
                    if (selectedFiles.length <= 0) {
                        Photo = JSON.stringify({ serverRelativeUrl: props.dataObj[0].AssetImage });
                        thumnailImgsUrl = props.dataObj[0].AssetPhotoThumbnailUrl;
                    } else {
                        let thumnailImgs = await saveThumbNailImage(props.provider, selectedFiles[0], ListNames.QuaycleanAssets, true, props.dataObj[0].AssetImage);
                        Photo = thumnailImgs.Photo;
                        thumnailImgsUrl = thumnailImgs.EncodedAbsThumbnailUrl;
                        // fileUpload = await props.provider.uploadFile(selectedFiles[0]);
                        //   fileUpload = await props.provider.uploadFile(selectedFiles[0]);
                        // Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl });
                    }

                    // const updatedData = props.dataObj.map((item: any) => ({
                    //     ...item,
                    //     RealImagesLinks: finaldata,
                    //     RealImagesLinksArray: newReallinkdata
                    // }));
                } else {
                    // if (selectedFiles?.length <= 0 && IsDeleted === false) {
                    //     let thumnailImgs = await saveNewThumbNailImage(props.provider, selectedMasterItem?.AssetPhotoThumbnailUrl, ListNames.QuaycleanAssets);
                    //     Photo = thumnailImgs.Photo;
                    //     thumnailImgsUrl = thumnailImgs.EncodedAbsThumbnailUrl;
                    // } else {
                    //     let thumnailImgs = await saveThumbNailImage(props.provider, selectedFiles[0], ListNames.QuaycleanAssets);
                    //     Photo = thumnailImgs.Photo;
                    //     thumnailImgsUrl = thumnailImgs.EncodedAbsThumbnailUrl;
                    // }
                    let thumnailImgs = await saveNewThumbNailImage(props.provider, selectedMasterItem?.AssetPhotoThumbnailUrl, ListNames.QuaycleanAssets);
                    Photo = thumnailImgs.Photo;
                    thumnailImgsUrl = thumnailImgs.EncodedAbsThumbnailUrl;

                    // fileUpload = await props.provider.uploadFile(selectedFiles[0]);
                    // Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl }); 
                }
                if (props.dataObj != undefined) {
                    if (props.dataObj[0].RealImagesLinks != "" && linkstr != "") {
                        let propsvalue = props?.dataObj[0]?.RealImagesLinks;
                        const mergedSet = new Set([
                            ...propsvalue.split(', '),
                            ...linkstr.split(', ')
                        ]);
                        let newArray = Array.from(mergedSet).join(', ');
                        linkstr = newArray;
                    }
                    else {
                        if (props?.dataObj[0]?.RealImagesLinks != "") {
                            linkstr = props?.dataObj[0]?.RealImagesLinks;
                        }
                    }
                }
                let createdId: number = 0;
                const data: any = {
                    Title: addAssetDataList.Title.toString().trim(),
                    Model: addAssetDataList.Model,
                    SerialNumber: addAssetDataList.SerialNumber,
                    PurchasePrice: !!addAssetDataList.PurchasePrice ? String(!!addAssetDataList.PurchasePrice) : "",
                    AssetNo: !!addAssetDataList.AssetNo ? addAssetDataList.AssetNo : "",
                    EquipmentType: !!addAssetDataList.EquipmentType ? addAssetDataList?.EquipmentType : "",
                    ConditionNotes: addAssetDataList.ConditionNotes,
                    AssetLink: { Url: addAssetDataList.AssetLink },
                    PurchaseDate: assetPurchaseDate,
                    ServiceDueDate: serviceDueDate,
                    AMStatus: selectedStatus,
                    Manufacturer: selectedManufacturer,
                    CurrentOwnerId: CurrentOwner,
                    PreviousOwnerId: PreviousOwner,
                    AssetType: selectedAssetType,
                    QCColor: selectedColor,
                    AssetCategory: selectedHDAssetLocation,
                    AssetPhoto: Photo,
                    SiteNameId: selectedSite || props.siteMasterId,
                    WebsiteLink: addAssetDataList.WebsiteLink,
                    // AssetPhotoThumbnailUrl: thumnailImgs.EncodedAbsThumbnailUrl
                    AssetPhotoThumbnailUrl: thumnailImgsUrl,
                    RealImagesLinks: !!linkstr ? linkstr : "",
                    AcquisitionValue: !!addAssetDataList.AcquisitionValue ? addAssetDataList.AcquisitionValue : "",
                    FANumber: !!addAssetDataList?.FANumber ? `FA-${addAssetDataList.FANumber}` : ""
                };

                if (isUpdate) {
                    let toastMessage: string = "";
                    const toastId = toastService.loading('Loading...');
                    toastMessage = 'Asset update successfully!';
                    await props.provider.updateItemWithPnP(data, ListNames.AssetMaster, 1080);
                    createdId = props.dataObj[0]?.ID;
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: props.siteMasterId,
                        ActionType: UserActivityActionTypeEnum.Update,
                        EntityType: UserActionEntityTypeEnum.EquipmentAsset,
                        EntityId: Number(props.dataObj[0]?.ID),
                        EntityName: addAssetDataList.Title.toString().trim(),
                        Details: `Update Equipment/Asset ${addAssetDataList.Title.toString().trim()}`,
                        StateId: props?.componentProp?.dataObj2?.StateId || props?.componentProp?.dataObj2?.QCStateId
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                    if (selectedPDFs.length > 0) {
                        selectedPDFs.forEach(async file => {
                            await props.provider.uploadAttachmentToList(ListNames.AssetMaster, file, createdId).then((file: any) => {

                                setIsLoading(false);
                                onpageClose();
                                // const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
                                // props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProp.dataObj2, isShowDetailOnly: true, pivotName: "EquipmentKey", siteMasterId: props.siteMasterId, siteName: props.siteName, qCState: props.qCState, breadCrumItems: breadCrumItems });
                            });
                        });
                    } else {
                        toastService.updateLoadingWithSuccess(toastId, toastMessage);
                        setIsLoading(false);
                        onpageClose();
                        // const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
                        // props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProp.dataObj2, isShowDetailOnly: true, pivotName: "EquipmentKey", siteMasterId: props.siteMasterId, siteName: props.siteName, qCState: props.qCState, breadCrumItems: breadCrumItems });
                    }
                } else {
                    // const fileUpload = await props.provider.uploadFile(selectedRealFiles);
                    let toastMessage: string = "";
                    const toastId = toastService.loading('Loading...');
                    toastMessage = 'Asset insert successfully!';
                    await props.provider.createItem(data, ListNames.AssetMaster).then(async (item: any) => {
                        createdId = item.data.Id;
                        const logObj = {
                            UserName: props?.loginUserRoleDetails?.title,
                            SiteNameId: props.siteMasterId,
                            ActionType: UserActivityActionTypeEnum.Create,
                            EntityType: UserActionEntityTypeEnum.EquipmentAsset,
                            EntityId: Number(createdId),
                            EntityName: addAssetDataList.Title.toString().trim(),
                            Details: `Add New Equipment/Asset ${addAssetDataList.Title.toString().trim()}`,
                            StateId: props?.componentProp?.dataObj2?.StateId || props?.componentProp?.dataObj2?.QCStateId
                        };
                        void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);

                        if (selectedPDFs.length > 0) {
                            selectedPDFs.forEach(async file => {
                                await props.provider.uploadAttachmentToList(ListNames.AssetMaster, file, createdId).then((file: any) => {
                                    console.log("Success");
                                });
                            });
                        }
                        if (selectedPDFs.length <= 0 && selectedMasterItem?.Attachment) {
                            await copyListAttachmentToAnotherList(props.provider, selectedMasterItem?.Attachment, ListNames.AssetMaster, createdId).then((file: any) => {
                                console.log("Success");
                            });
                        }
                    }).catch(err => console.log(err));
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    if (!!createdId) {
                        await qrupload(createdId, data);
                    }
                    setIsLoading(false);
                    onpageClose();
                    // const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
                    // props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProp.dataObj2, isShowDetailOnly: true, pivotName: "EquipmentKey", siteMasterId: props.siteMasterId, siteName: props.siteName, qCState: props.qCState, breadCrumItems: breadCrumItems });
                }

            }

        } catch (error) {
            const errorObj = { ErrorMethodName: "onClick_SaveAsset", CustomErrormessage: "error in save asset", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const fileSelectionChange = (e: any): void => {
        const files = e.target.files;
        const selectedFiles: IFileWithBlob[] = [];
        let isValid = imgValidation(files[0].name);
        if (isValid) {
            setIsImageErrorModelOpen(false);
        } else {
            setIsImageErrorModelOpen(true);
        }
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const timestamp = new Date().getTime();
                const FileName = file.name.split('.').slice(0, -1).join('.');
                const ExtensionName = file.name.split('.').pop();
                const CreatorName = `${timestamp}_${FileName}.${ExtensionName}`;
                const selectedFile: IFileWithBlob = {
                    file: file,
                    name: CreatorName,
                    folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/EquipmentsImage`,
                    //folderServerRelativeURL: `/SiteAssets/ChemicalRegistrationImages`,
                    overwrite: true
                };
                selectedFiles.push(selectedFile);
            }
        }
        setSelectedFiles(selectedFiles);
    };

    const realImagesFileChange = (e: any): void => {
        const files = e.target.files;
        const selectedFiles: IFileWithBlob[] = [];
        // let isValid = imgValidation(files[0]?.name);
        let isValid = true;

        if (files && files.length > 0) {
            isValid = imgValidation(files[0].name);
        }

        if (isValid) {
            setRealIsImageErrorModelOpen(false);
        } else {
            setRealIsImageErrorModelOpen(true);
        }
        if (files.length > 0) {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const timestamp = new Date().getTime();
                const FileName = file.name.split('.').slice(0, -1).join('.');
                const ExtensionName = file.name.split('.').pop();
                const CreatorName = `${timestamp}${i}_${FileName}.${ExtensionName}`;
                const selectedFile: IFileWithBlob = {
                    file: file,
                    name: CreatorName,
                    folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/EquipmentsRealImage`,
                    //folderServerRelativeURL: `/SiteAssets/ChemicalRegistrationImages`,
                    overwrite: true
                };
                selectedFiles.push(selectedFile);
            }
        }
        setSelectedRealFiles(selectedFiles);
    };

    const uploadFileValidation = (e: any) => {
        const validationFields: any = {
            "pdf": ["name"],
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

    const pdfSelectionChange = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPDF(true);
        if (e.target.files && e.target.files[0]) {
            const files = e.target.files;
            const selectedPDFs: IFileWithBlob[] = [];
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const timestamp = new Date().getTime();
                    const FileName = file.name.split('.').slice(0, -1).join('.');
                    const ExtensionName = file.name.split('.').pop();
                    const CreatorName = `${timestamp}_${FileName}.${ExtensionName}`;
                    const selectedPDF: IFileWithBlob = {
                        file: file,
                        name: CreatorName,
                        // folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/EquipmentsImage`,
                        folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/Shared Documents`,
                        overwrite: true
                    };
                    selectedPDFs.push(selectedPDF);
                }
            }
            setSelectedPDFs(selectedPDFs);
        }
    };

    const returnErrorMessage = (): any => {
        return (
            validationMessages.length > 0 &&
            <ul>
                {validationMessages.map((vm: React.Key | null | undefined) => <li className="errorPoint" key={vm}>{vm}</li>)}
            </ul>
        );

    };

    const onpageClose = () => {
        if (isSiteLevelComponent) {
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                selectedZoneDetails: selectedZoneDetails,
                isShowDetailOnly: true,
                pivotName: "EquipmentKey",
            });
        } else {
            // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            // props.manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, breadCrumItems: breadCrumItems, view: props.componentProps.viewType, subpivotName: "ToolboxTalk", selectedZoneDetails: props.componentProps.selectedZoneDetails });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AssetList,
                siteMasterId: props.componentProp?.siteMasterId,
                siteName: props.componentProp?.siteName,
                qCState: props.componentProp?.qCState,
                IsSupervisor: props.componentProp?.IsSupervisor,
                selectedZoneDetails: selectedZoneDetails
                // breadCrumItems: props.breadCrumItems,
                // dataObj: props.componentProp?.dataObj,
                // isSiteInformationView: true
            });
        }
    }

    React.useEffect(() => {
        _EquipmentMaster();
        props.provider._Document("QRCode").then(() => {
        }).catch((error) => {
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect AddNewAsset"
            };
            void logGenerator(props.provider, errorObj);
        });
        try {
            if (!!props.dataObj) {
                let editDueDate = new Date(props.dataObj[0].DueDate);
                let editPurchaseDate = new Date(props.dataObj[0].PurchaseDate);
                setIsDeleted(false);
                setIsPDFDeleted(false);
                setIsUpdate(true);
                setIsDisable(true);
                let fileatttachmentfilename;
                if (props.dataObj[0].AssetImage?.split('/').pop() === "NotFoundImg_15f37076872698f99e30750028e2f28e.png") {
                    setIsDeleted(true);
                }
                if (props.dataObj[0].Attachment == null) {
                    setIsPDFDeleted(true);
                } else {
                    const urlParts = props.dataObj[0]?.Attachment?.split('/');
                    fileatttachmentfilename = urlParts[urlParts?.length - 1];
                }

                if (props.dataObj[0].DueDate != "") {
                    setServiceDueDate(editDueDate);
                } else {
                    setServiceDueDate(null);
                }
                if (props?.dataObj[0]?.PurchaseDate != "") {
                    setAssetPurchaseDate(editPurchaseDate);
                } else {
                    setAssetPurchaseDate(null);
                }
                addAssetDataList.Title = props.dataObj[0].Title;
                addAssetDataList.Model = props.dataObj[0].Model;
                addAssetDataList.SerialNumber = props.dataObj[0].SerialNumber;
                // addAssetDataList.NumberOfItems = props.dataObj[0].NumberOfItems;
                addAssetDataList.PurchasePrice = props.dataObj[0].PurchasePrice;
                addAssetDataList.AssetNo = props.dataObj[0]?.AssetNo;
                addAssetDataList.EquipmentType = props.dataObj[0]?.EquipmentType;
                addAssetDataList.AcquisitionValue = props?.dataObj[0]?.AcquisitionValue;
                addAssetDataList.FANumber = props?.dataObj[0]?.FANumber ? props.dataObj[0]?.FANumber.replace(/^FA-/, "") : "";
                // addAssetDataList.QCOrder = props.dataObj[0].QCOrder;
                addAssetDataList.ConditionNotes = props.dataObj[0].ConditionNotes;
                addAssetDataList.AssetLink = props.dataObj[0]?.AssetLink?.Url;
                let arr = props.dataObj[0]?.AssetLink?.Url?.split(',');
                setVideoLinks(arr);
                addAssetDataList.WebsiteLink = props.dataObj[0].WebsiteLink;
                addAssetDataList.Attachment = props.dataObj[0]?.Attachment ? fileatttachmentfilename : "";
                setSelectedAssetType(props.dataObj[0].AssetType);
                setSelectedStatus(props.dataObj[0].Status);
                setSelectedManufacturer(props.dataObj[0].Manufacturer);
                // setServiceDueDate(editDueDate);
                setSelectedColor(props.dataObj[0].QCColor);
                // setSelectedAssetCategory(props.dataObj[0].AssetCategory);
                setSelectedHDAssetLocation(props.dataObj[0].AssetCategory);
                setCurrentOwner(props.dataObj[0].CurrentOwnerId || null);
                setPreviousOwner(!!props.dataObj[0].PreviousOwnerId ? props.dataObj[0].PreviousOwnerId : null);
                setselectedCurrentOwner(props.dataObj[0]?.CurrentOwner ? [props.dataObj[0].CurrentOwner] : []);
                setselectedPreviousOwner([props.dataObj[0].PreviousOwner]);
                setSelectedSite(props.dataObj[0].SiteNameId);

            }
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            const errorObj = { ErrorMethodName: "useEffect AddNewAsset", CustomErrormessage: "error in set assets by id", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
        setisReload(false);
    }, [isReload]);
    const onPanelclose = () => {
        setisPanelOpen(false);
    };
    const onRenderFooterContent = () => {
        return <div>
            <PrimaryButton className="btn btn-danger" onClick={onPanelclose} text="Close" />
        </div>;
    };

    const onClickRealImageDelete = () => {
        setIsLoading(true);
        let Path = `${props.context.pageContext.web.absoluteUrl}`;
        const pathSegments = Path.split('/');
        const lastTwoSegments = pathSegments.slice(-2);
        const joinedSegments = lastTwoSegments.join('/');
        let mainpath = `/${joinedSegments}/SiteAssets/EquipmentsRealImage`;


        let newReallinkdata: any;
        let newImageName: any;
        const desiredRecord = props.dataObj[0]?.RealImagesLinksArray?.filter((item: any) => item.includes(deletefileName.current));
        let linkstr = desiredRecord.join(', ');
        newReallinkdata = props.dataObj[0]?.RealImagesLinksArray?.filter((urli: any) => urli !== linkstr);

        let finaldata = newReallinkdata.join(', ');
        props.provider.deleteFileFromFolder(mainpath, deletefileName.current);
        const dataq: any = {
            RealImagesLinks: !!finaldata ? finaldata : ""
        };
        props.provider.updateItemWithPnP(dataq, ListNames.AssetMaster, props.dataObj[0].ID);
        newImageName = props.dataObj[0]?.RealImagesLinksfilename.filter((item: any) => item !== deletefileName.current);

        const updatedData = props.dataObj.map((item: any) => ({
            ...item,
            RealImagesLinks: finaldata,
            RealImagesLinksArray: newReallinkdata,
            RealImagesLinksfilename: newImageName
        }));

        props.dataObj = updatedData;
        setisReload(true);
        setIsLoading(false);
        toggleHideDialogdelete();
    };

    const _closeDeleteConfirmation = (): void => {
        toggleHideDialogdelete();
    };

    const onClickUpdateRealImages = (): void => {
        setDisplayRealImgControl(true);
    };

    const _confirmDeleteItem = (filename: any): void => {
        deletefileName.current = filename;
        toggleHideDialogdelete();
    };

    const _EquipmentMaster = () => {
        let filter = `SiteNameId eq '${props.siteMasterId}' and IsDeleted ne 1`;

        try {
            const select = ["ID,Title,SiteNameId,Model,SerialNumber"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.AssetMaster,
                filter: filter
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    let AssetListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: !!data.Title ? data.Title : "",
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                                Model: !!data.Model ? data.Model : "",
                                SerialNumber: !!data.SerialNumber ? data.SerialNumber : "",
                            }
                        );
                    });
                    setAssetsData(AssetListData);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
        }
    };

    const onClickClose = () => {
        const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
        // props.manageComponentView({
        //     currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProp.dataObj2, siteMasterId: props.siteMasterId, isShowDetailOnly: true, siteName: props.siteName, qCState: props.qCState, pivotName: "EquipmentKey", breadCrumItems: breadCrumItems
        // });
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.EquipmentAsset,
            siteMasterId: props.componentProp?.siteMasterId,
            siteName: props.componentProp?.siteName,
            qCState: props.componentProp?.qCState,
            IsSupervisor: props.componentProp?.IsSupervisor,
            selectedZoneDetails: props.componentProp?.selectedZoneDetails,
            // breadCrumItems: props.breadCrumItems,
            // dataObj: props.componentProp?.dataObj,
            // isSiteInformationView: true
        });
    }

    const handleMasterAssetSave = (data: any) => {
        setIsShowMasterAssetModel(false);
        setIsDisable(true);
        setSelectedMasterItem(data);
    };

    React.useEffect(() => {
        if (selectedMasterItem) {
            setIsDeleted(false);
            setIsPDFDeleted(false);
            setIsDisable(true);
            let fileatttachmentfilename;
            if (selectedMasterItem?.AssetImage?.split('/').pop() === "NotFoundImg_15f37076872698f99e30750028e2f28e.png") {
                setIsDeleted(true);
            }
            if (selectedMasterItem?.Attachment == null) {
                setIsPDFDeleted(true);
            } else {
                const urlParts = selectedMasterItem?.Attachment?.split('/');
                fileatttachmentfilename = urlParts[urlParts?.length - 1];
            }

            addAssetDataList.Title = selectedMasterItem?.Title;
            addAssetDataList.Model = selectedMasterItem?.Model;
            addAssetDataList.AssetLink = selectedMasterItem?.AssetLink?.Url;
            let arr = selectedMasterItem?.AssetLink?.Url?.split(',');
            setVideoLinks(arr);
            addAssetDataList.WebsiteLink = selectedMasterItem?.WebsiteLink;
            addAssetDataList.Attachment = selectedMasterItem?.Attachment ? fileatttachmentfilename : "";
            setSelectedAssetType(selectedMasterItem?.AssetType);
            setSelectedManufacturer(selectedMasterItem?.Manufacturer);
            setSelectedColor(selectedMasterItem?.QCColor);
        }

    }, [selectedMasterItem]);

    return <>
        {isShowModelQR && <CustomModal isModalOpenProps={isShowModelQR} setModalpopUpFalse={() => {
            setIsShowModelQR(false);
        }} subject={"Genrating QR code ..."} message={<GenrateQRCode url={itemurlQR.current} getTheQRUrl={genratedQrcode} />} />}
        <Panel
            isOpen={showModal}
            onDismiss={() => toggleModal("")}
            type={PanelType.extraLarge}
            headerText="Image View">
            <img src={imageURL} style={{ width: "100%", height: "85vh" }} />
        </Panel>
        {state.isUploadFileValidationModelOpen &&
            <CustomeDialog dialogContentProps={state.dialogContentProps}
                closeText="Close" onClickClose={() => {
                    setState((prevState: any) => ({ ...prevState, isUploadFileValidationModelOpen: false }));
                }}
                dialogMessage={"Kindly upload file in pdf format."}
                isDialogOpen={state.isUploadFileValidationModelOpen} />}
        {isLoading && <Loader />}
        <div className="AssetBoxCard">
            <div className="formGroup">
                <div className="formGroup">
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 qc-form-content">
                                <div className="ms-Grid-row p-0-5">
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween">
                                        <div> <h1 className="mainTitle">Asset Form</h1></div>
                                        <div className="dFlex">
                                            <div>
                                                <PrimaryButton className="btn btn-danger justifyright floatright"
                                                    onClick={onpageClose}
                                                    text="Close" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md8 ms-lg8 ">
                                        <div className="customebreadcrumb">
                                            <Breadcrumb
                                                items={props.componentProp.breadCrumItems || []}
                                                maxDisplayedItems={3}
                                                ariaLabel="Breadcrumb with items rendered as buttons"
                                                overflowAriaLabel="More links"
                                            />
                                        </div>
                                    </div>
                                    {isUpdate && isDisable && <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4">
                                        <div className="" style={{ float: 'right' }}>
                                            <Link className="actionBtn dticon btnEdit " onClick={() => { toggleConfirmationDialog() }}>
                                                <TooltipHost content={"Edit Detail"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="edit" />
                                                </TooltipHost>
                                            </Link>
                                        </div>
                                    </div>}
                                </div>
                                <div className="ms-Grid-row p-2-12">
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Site<span className="required">*</span></Label>
                                        <SiteFilter
                                            isPermissionFiter={true}
                                            loginUserRoleDetails={props.loginUserRoleDetails}
                                            selectedSite={selectedSite}
                                            onSiteChange={onSiteChange}
                                            provider={props.provider}
                                            isRequired={true}
                                            AllOption={false}
                                            selectedSites={selectedZoneDetails}
                                        />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Asset Title<span className="required">*</span></Label>
                                        <TextField className="formControl" name="Title" value={addAssetDataList.Title} onChange={addAssetdata} disabled={isDisable ? isDisable : false} />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Device Photo<span className="required">*</span></Label>
                                        {!isUpdate && <>
                                            <div className="formControl">
                                                <span className="cursorPointer"
                                                    onClick={() => toggleModal(selectedMasterItem?.AssetImage)} >
                                                    View Image
                                                </span>
                                            </div>
                                        </>
                                        }
                                        {!!props.dataObj && IsDeleted == false && <>
                                            {/* <div> {props.dataObj[0].AssetImage.split('/').pop()} <FontAwesomeIcon icon="trash-alt" onClick={_onClickDeleteUploadFile} /></div> */}
                                            {/* <div className="formControl">
                                                <span className="cursorPointer"
                                                    onClick={() => toggleModal(props.dataObj[0].AssetImage)} >
                                                    View Image
                                                </span>
                                                {!isDisable && <FontAwesomeIcon className="ml5 required" icon="trash-alt" onClick={_onClickDeleteUploadFile} />}
                                            </div> */}
                                            <div className="inline-action-row">
                                                <span
                                                    className="inline-action-text"
                                                    onClick={() => toggleModal(props.dataObj[0].AssetImage)}
                                                >
                                                    View Image
                                                </span>

                                                {!isDisable && (
                                                    <FontAwesomeIcon
                                                        icon="trash-alt"
                                                        className="inline-action-delete"
                                                        onClick={_onClickDeleteUploadFile}
                                                    />
                                                )}
                                            </div>

                                        </>
                                        }
                                        {IsDeleted == true && < TextField
                                            type="file"
                                            className="formControl"
                                            name="AssetPhoto"
                                            accept="image/*"
                                            placeholder="Enter Input"
                                            onChange={fileSelectionChange}
                                            disabled={isDisable ? isDisable : false}
                                            value={undefined}
                                        />}
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Manufacturer<span className="required">*</span></Label>
                                        <div className="formControl">
                                            {/* <ManufacturerFilter
                                                selectedManufacturer={selectedManufacturer}
                                                defaultOption={!!selectedManufacturer ? selectedManufacturer : ""}
                                                onManufacturerChange={onManufacturerChange}
                                                provider={props.provider}
                                                isRequired={true}
                                                isDisable={isDisable ? isDisable : false}
                                            /> */}

                                            <MasterManufacturerFilter
                                                defaultOption={selectedManufacturer}
                                                onManufacturerChange={onManufacturerChange}
                                                provider={props.provider}
                                                isRequired={true}
                                                AllOption={false}
                                                listName={ListNames.AssetMaster}
                                                isMultiple={false}
                                                isDisable={isDisable ? isDisable : false}
                                            />
                                        </div>
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Model<span className="required">*</span></Label>
                                        <TextField className="formControl" name="Model" value={addAssetDataList.Model} onChange={addAssetdata} disabled={isDisable ? isDisable : false} />
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Asset Type<span className="required">*</span></Label>
                                        <div className="formControl">
                                            <AssetTypeFilter
                                                selectedAssetType={selectedAssetType}
                                                defaultOption={!!selectedAssetType ? selectedAssetType : ""}
                                                onAssetTypeChange={onAssetTypeChange}
                                                provider={props.provider}
                                                isRequired={true}
                                                AllOption={false}
                                                isDisable={isDisable ? isDisable : false}
                                            />
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Color<span className="required" /></Label>
                                        <div className="formControl">
                                            <ColorFilter
                                                selectedColor={selectedColor}
                                                defaultOption={!!selectedColor ? selectedColor : props.dataObj ? props.dataObj[0].AssetType : ""}
                                                onColorChange={onColorChange}
                                                provider={props.provider}
                                                isRequired={true}
                                                isDisable={isDisable ? isDisable : false}
                                            />
                                        </div>
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Assets Manual</Label>
                                        {!isUpdate && <>
                                            <Link className="" target="_blank" onClick={() => {
                                                seturl(selectedMasterItem?.Attachment.trim());
                                                setisPanelOpen(true);
                                            }}>
                                                <div className="img-name-text"> {selectedMasterItem?.Attachment?.split('/').pop()} </div>
                                            </Link>
                                        </>
                                        }
                                        {!!props.dataObj && IsPDFDeleted == false && <>
                                            <Link className="" target="_blank" onClick={() => {
                                                seturl(props.dataObj[0].Attachment.trim());
                                                setisPanelOpen(true);
                                            }}>
                                                <div className="img-name-text"> {props.dataObj[0].Attachment?.split('/').pop()} </div>
                                            </Link>
                                            {!isDisable && <FontAwesomeIcon className='required' icon="trash-alt" onClick={_onClickDeleteUploadPDF} />}
                                        </>}
                                        {IsPDFDeleted == true && < TextField
                                            type="file"
                                            className="formControl"
                                            name="AssetPDF"
                                            accept="application/pdf"
                                            placeholder="Enter Input"
                                            onChange={pdfSelectionChange}
                                            disabled={isDisable ? isDisable : false}
                                        />}

                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg9 mt4px">
                                        <Label className="formLabel">Video Link<span className="required"></span></Label>
                                        {isDisable != true && displayerror === false &&
                                            <div className="ttadd">
                                                <TooltipHost content="Add New Value" id={tooltipId} onClick={onClickAddLink}>
                                                    <FontAwesomeIcon className="ml-5 ddadd" icon='plus' onClick={onClickAddLink} />
                                                </TooltipHost>
                                            </div>}

                                        {isDisable != true &&
                                            <TextField
                                                className="formControl"
                                                name="AssetLink"
                                                value={currentLink}
                                                onChange={handleLinkChange}
                                            />}
                                        {displayerror &&
                                            <div className="requiredlink">Enter Valid Link</div>}

                                        {/* {videoLinks?.map((link: any, index: any) => (
                                            <div key={index} className="video-link-item">
                                                <div className="VideoLinkCLS">
                                                    <TooltipHost content={link}>
                                                        <span
                                                            onClick={() => handleLinkClick(link)}
                                                            style={{ cursor: 'pointer', color: 'blue', marginRight: '10px', marginLeft: '0px', marginBottom: '3px' }}
                                                        >
                                                            {`Video Link ${index + 1}`}
                                                        </span>
                                                    </TooltipHost>
                                                    {isDisable != true && <FontAwesomeIcon className="ml5 required clsPointer" icon="trash-alt" onClick={() => handleDeleteLink(index)} />}
                                                </div>
                                            </div>
                                        ))} */}
                                        {videoLinks?.map((link: any, index: number) => (
                                            <div key={index} className="compact-video-link">
                                                <TooltipHost content={link}>
                                                    <span
                                                        className="compact-link-text"
                                                        onClick={() => handleLinkClick(link)}
                                                    >
                                                        {`Link ${index + 1}`}
                                                    </span>
                                                </TooltipHost>

                                                {!isDisable && (
                                                    <FontAwesomeIcon
                                                        icon="trash-alt"
                                                        className="compact-link-delete"
                                                        onClick={() => handleDeleteLink(index)}
                                                    />
                                                )}
                                            </div>
                                        ))}

                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg9 mt4px">
                                        <Label className="formLabel">Website Link<span className=""></span></Label>
                                        <TextField className="formControl" name="WebsiteLink" value={addAssetDataList.WebsiteLink} onChange={addAssetdata}
                                            disabled={isDisable ? isDisable : false}
                                        />
                                        {displayerrorweblink &&
                                            <div className="requiredlink">Enter Valid Link</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 qc-form-content">

                                <div className="ms-Grid-row p-2-12">
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Status<span className="required">*</span></Label>
                                        <div className="formControl">
                                            <StatusFilter
                                                selectedStatus={selectedStatus}
                                                defaultOption={!!selectedStatus ? selectedStatus : props.dataObj ? props.dataObj[0].Status : ""}
                                                onStatusChange={onStatusChange}
                                                provider={props.provider}
                                                isRequired={true}
                                            />
                                        </div>
                                    </div>

                                    {/* Serial Number */}
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Serial Number<span className="required">*</span></Label>
                                        <TextField
                                            className="formControl"
                                            name="SerialNumber"
                                            value={addAssetDataList.SerialNumber}
                                            onChange={addAssetdata}
                                        />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Acquisition Value</Label>
                                        <TextField
                                            className="formControl"
                                            name="AcquisitionValue"
                                            placeholder="Enter Acquisition Value"
                                            value={addAssetDataList?.AcquisitionValue}
                                            onChange={addAssetdata}
                                        />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <>
                                            <Label className="formLabel">FA Number</Label>
                                            <TextField
                                                className="formControl FANumber-disable-txt"
                                                name="FANumber"
                                                maxLength={6}
                                                disabled={addAssetDataList?.AcquisitionValue <= 1000}
                                                placeholder="Enter 4-6 digit FA Number"
                                                value={addAssetDataList?.FANumber || ""}
                                                onChange={(e, newValue) =>
                                                    addAssetdata({ target: { name: "FANumber", value: newValue } })
                                                }
                                                prefix="FA-"
                                            />
                                        </>
                                    </div>
                                </div>
                                <div className="ms-Grid-row p-2-12">
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Book Value<span className="required">*</span></Label>
                                        <TextField
                                            className="formControl"
                                            name="PurchasePrice"
                                            value={addAssetDataList.PurchasePrice}
                                            onChange={addAssetdata}
                                        />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Purchase Date<span className="required">*</span></Label>
                                        <DatePicker
                                            allowTextInput
                                            ariaLabel="Select a date."
                                            value={assetPurchaseDate}
                                            className="formControl"
                                            onSelectDate={setAssetPurchaseDate as (date?: Date) => void}
                                            formatDate={onFormatDate}
                                            strings={defaultDatePickerStrings}
                                        />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Due Date<span className="required" /></Label>
                                        <DatePicker
                                            allowTextInput
                                            ariaLabel="Select a date."
                                            value={serviceDueDate}
                                            onSelectDate={setServiceDueDate as (date?: Date) => void}
                                            formatDate={onFormatDate}
                                            strings={defaultDatePickerStrings}
                                        />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Equipment Type</Label>
                                        <ReactDropdown
                                            options={equipmentOptions}
                                            isMultiSelect={false}
                                            placeholder="Select Equipment Type"
                                            defaultOption={addAssetDataList?.EquipmentType}
                                            onChange={_onEquipmentTypeChange}
                                        />
                                    </div>
                                </div>
                                <div className="ms-Grid-row p-2-12">

                                    {/* <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <TextField
                                            label="Asset No"
                                            className="formControl"
                                            name="AssetNo"
                                            value={addAssetDataList?.AssetNo}
                                            onChange={addAssetdata}
                                        />
                                    </div> */}
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Location<span className="required" /></Label>
                                        <div className="formControl">
                                            <QuayCleanChoices
                                                onChange={onHDChangeAssetLocation}
                                                provider={props.provider}
                                                defaultOption={selectedHDAssetLocation}
                                                siteNameId={props.siteMasterId}
                                                placeHolder="Select Asset Location"
                                                keyTitle={""}
                                                isAssetLocation={true}
                                                label={""}
                                                header={""}
                                            />
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Current Owner</Label>
                                        <div className="formControl">
                                            <PeoplePicker
                                                context={props.context as any}
                                                personSelectionLimit={1}
                                                showtooltip={true}
                                                required={true}
                                                ensureUser={true}
                                                showHiddenInUI={false}
                                                principalTypes={[PrincipalType.User]}
                                                onChange={onChangeCurrentOwner}
                                                defaultSelectedUsers={selectedCurrentOwner}
                                                resolveDelay={1000}
                                            />
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">Previous Owner<span className="required" /></Label>
                                        <div className="formControl">
                                            <PeoplePicker
                                                context={props.context as any}
                                                personSelectionLimit={1}
                                                showtooltip={true}
                                                required={true}
                                                ensureUser={true}
                                                showHiddenInUI={false}
                                                principalTypes={[PrincipalType.User]}
                                                defaultSelectedUsers={selectedPreviousOwner}
                                                onChange={onChangePreviousOwner}
                                                resolveDelay={1000}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="ms-Grid-row p-2-12">
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                        <Label className="formLabel">Condition Notes<span className="required"></span></Label>
                                        <TextField
                                            className="formControl"
                                            multiline
                                            rows={5}
                                            name="ConditionNotes"
                                            value={addAssetDataList.ConditionNotes}
                                            onChange={addAssetdata}
                                        />
                                    </div>
                                </div>
                                {/* <div className="ms-Grid-row p-2-12">
                                    {isUpdate && props.dataObj[0]?.RealImagesLinksArray?.length > 0 ? (
                                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                            <Label className="formLabel">Asset's Real Image(s)<span className="required"></span></Label>
                                            <div className="ttadd">
                                                <TooltipHost content="Add New Asset's Real Image(s)" id={tooltipId}>
                                                    <FontAwesomeIcon className="ddaddicon" icon='plus' onClick={onClickUpdateRealImages} />
                                                </TooltipHost>
                                            </div>
                                            {DisplayRealImgControl && (
                                                <TextField
                                                    type="file"
                                                    className="formControl mt5"
                                                    name="AssetRealPhoto"
                                                    accept="image/*"
                                                    onChange={realImagesFileChange}
                                                    multiple
                                                />
                                            )}
                                            <ul className="imageLinksList">
                                                {props.dataObj[0]?.RealImagesLinksArray.map((link: string, index: React.Key) => (
                                                    <li key={index} className="imageLinkItem imgLinkList" style={{ display: "flex", padding: "3px" }}>
                                                        <Link target="_blank" onClick={() => { seturl(link.trim()); setisPanelOpen(true); }}>
                                                            <TooltipHost content="View Asset's Real Image(s)" id={`${tooltipId}-${index}`}>
                                                                <span className="img-name-text">{props.dataObj[0]?.RealImagesLinksfilename[index]}</span>
                                                            </TooltipHost>
                                                        </Link>
                                                        <Link className="mr-10" onClick={() => _confirmDeleteItem(props.dataObj[0]?.RealImagesLinksfilename[index])}>
                                                            <TooltipHost content="Delete Asset's Real Image(s)" id={`${tooltipId}-${index}`}>
                                                                <FontAwesomeIcon icon="trash-alt" className="ml5 dlticonDoc tooltipcls required" />
                                                            </TooltipHost>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                            <Label className="formLabel">Asset's Real Image(s) t</Label>
                                            <TextField
                                                type="file"
                                                className="formControl"
                                                name="AssetRealPhoto"
                                                accept="image/*"
                                                onChange={realImagesFileChange}
                                                multiple
                                            />
                                        </div>
                                    )}
                                </div> */}

                                <div className="ms-Grid-row p-2-12">
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">
                                            Asset's Real Image(s)
                                            <span className="required"></span>
                                        </Label>

                                        {isUpdate && (
                                            <div className="ttadd">
                                                <TooltipHost content="Add New Asset's Real Image(s)" id={tooltipId}>
                                                    <FontAwesomeIcon className="ddaddicon" icon='plus' onClick={onClickUpdateRealImages} />
                                                </TooltipHost>
                                            </div>
                                        )}

                                        {/* ✅ Always render the file input */}
                                        {(DisplayRealImgControl || !isUpdate || props.dataObj[0]?.RealImagesLinksArray?.length === 0) && (
                                            <TextField
                                                type="file"
                                                className="formControl mt5"
                                                name="AssetRealPhoto"
                                                accept="image/*"
                                                onChange={realImagesFileChange}
                                                multiple
                                            />
                                        )}

                                        {/* Existing images list */}
                                        {isUpdate && props.dataObj[0]?.RealImagesLinksArray?.length > 0 && (
                                            <ul className="imageLinksList">
                                                {props.dataObj[0]?.RealImagesLinksArray.map((link: string, index: React.Key) => (
                                                    <li key={index} className="imageLinkItem imgLinkList" style={{ display: "flex", padding: "3px" }}>
                                                        <Link
                                                            target="_blank"
                                                            onClick={() => { seturl(link.trim()); setisPanelOpen(true); }}
                                                        >
                                                            <TooltipHost content="View Asset's Real Image(s)" id={`${tooltipId}-${index}`}>
                                                                <span className="img-name-text">
                                                                    {props.dataObj[0]?.RealImagesLinksfilename[index]}
                                                                </span>
                                                            </TooltipHost>
                                                        </Link>

                                                        <Link
                                                            className="mr-10"
                                                            onClick={() =>
                                                                _confirmDeleteItem(props.dataObj[0]?.RealImagesLinksfilename[index])
                                                            }
                                                        >
                                                            <TooltipHost content="Delete Asset's Real Image(s)" id={`${tooltipId}-${index}`}>
                                                                <FontAwesomeIcon icon="trash-alt" className="ml5 dlticonDoc tooltipcls required" />
                                                            </TooltipHost>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>


                                {/* Row 6: Buttons */}
                                <div className="ms-Grid-row p-2-12 formGroup">
                                    {(displayerrorweblink === false && displayerror === false) ? (
                                        isUpdate
                                            ? <PrimaryButton className="btn btn-primary" onClick={onClick_SaveAsset} text="Update" />
                                            : <PrimaryButton className="btn btn-primary" onClick={onClick_SaveAsset} text="Save" />
                                    ) : (
                                        isUpdate
                                            ? <PrimaryButton className="btn btn-sec" text="Update" />
                                            : <PrimaryButton className="btn btn-sec" text="Save" />
                                    )}

                                    <PrimaryButton
                                        style={{ margin: "5px", marginTop: "10px" }}
                                        className="btn btn-danger"
                                        text="Close"
                                        onClick={onpageClose}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </div >
        </div >

        {hideDialog &&
            <CustomModal isModalOpenProps={hideDialog} setModalpopUpFalse={() => {
                toggleHideDialog();
            }} subject={"Data Is Missing"} message={returnErrorMessage() as any} closeButtonText={"Close"} />
        }
        {false && <Dialog
            hidden={hideDialog}
            onDismiss={toggleHideDialog}
            dialogContentProps={dialogContentProps}
            modalProps={modalProps}>
            {validationMessages.length > 0 &&
                <ul>
                    {validationMessages.map((vm: React.Key | null | undefined) => <li className="errorPoint" key={vm}>{vm}</li>)}
                </ul>
            }
            <PrimaryButton text="Close" onClick={toggleHideDialog} className='me1 btn-clr' />
        </Dialog>}
        <Panel
            isOpen={isPanelOpen}
            onDismiss={() => onPanelclose()}
            type={PanelType.large}
            onRenderFooterContent={onRenderFooterContent}
        >
            <iframe
                src={url}
                style={{ width: "100%", height: "100vh" }}
            />

        </Panel>
        <CustomModal isModalOpenProps={hideDialogdelete}
            setModalpopUpFalse={_closeDeleteConfirmation}
            subject={"Delete Item"}
            message={"This image will be deleted permanently, Are you sure, you want to delete it? "}
            yesButtonText="Yes"
            closeButtonText={"No"}
            onClickOfYes={onClickRealImageDelete} />

        <CustomModal isModalOpenProps={hideConfirmationDialog}
            setModalpopUpFalse={() => { toggleConfirmationDialog() }}
            subject={"Update Details"}
            message={Messages.UpdateAssetItem}
            yesButtonText="Yes"
            closeButtonText={"cancel"}
            onClickOfYes={() => { toggleConfirmationDialog(); setIsDisable(false); }} />

        {isShowMasterAssetModel &&
            <MasterAssetDialog
                manageComponentView={props.manageComponentView}
                context={props.context}
                provider={props.provider}
                isModelOpen={isShowMasterAssetModel}
                onClickClose={onpageClose}
                onSave={handleMasterAssetSave}
                loginUserRoleDetails={props.loginUserRoleDetails} />}
    </>;

};