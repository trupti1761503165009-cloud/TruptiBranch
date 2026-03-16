/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-void */
/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { Breadcrumb, Dialog, DialogType, Label, Link, Panel, PanelType, PrimaryButton, TextField, TooltipHost } from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IQuayCleanState } from "../../QuayClean";
import { logGenerator, removeElementOfBreadCrum, saveThumbNailImage, imgValidation, UserActivityLog } from "../../../../../Common/Util";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { AssetTypeFilter } from "../../../../../Common/Filter/AssetTypeFilter";
import { ColorFilter } from "../../../../../Common/Filter/ColorFilter";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import { Loader } from "../../CommonComponents/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomModal from "../../CommonComponents/CustomModal";
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import { toastService } from "../../../../../Common/ToastService";
import { AssetFields, AssetViewFields } from "./AssetFields";
import { Messages } from "../../../../../Common/Constants/Messages";
import { MasterManufacturerFilter } from "../../../../../Common/Filter/MasterManufacturerFilter";
import { getAttachmentDataUrl, getParsedImageUrl } from "../../CommonComponents/CommonMethods";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import moment from "moment";
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');
export interface IAddNewAssetProps {
    provider: IDataProvider;
    context: WebPartContext;
    isAddNewAsset?: boolean;
    manageComponentView(componentProp: IQuayCleanState): any;
    isShowDetailOnly?: boolean;
    dataObj?: any;
    componentProp: IQuayCleanState;
    loginUserRoleDetails: any;
}

export const AddGlobalAsset = (props: IAddNewAssetProps) => {
    // const [selectedManufacturer, setSelectedManufacturer] = React.useState<any>("");
    // const [selectedAssetType, setSelectedAssetType] = React.useState<any>("");
    // const [selectedColor, setSelectedColor] = React.useState<any>("");

    const [validationMessages, setValidationMessages] = React.useState<any[]>([]);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [selectedFiles, setSelectedFiles] = React.useState<IFileWithBlob[]>([]);
    const [selectedPDFs, setSelectedPDFs] = React.useState<IFileWithBlob[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isUpdate, setIsUpdate] = React.useState<boolean>(false);
    const [IsDeleted, setIsDeleted] = React.useState<boolean>(true);
    const [IsPDF, setIsPDF] = React.useState<boolean>(true);
    const [isImageErrorModelOpen, setIsImageErrorModelOpen] = React.useState<boolean>(false);
    const [IsManualPDFDeleted, setIsManualPDFDeleted] = React.useState<boolean>(true);
    const [isReload, setisReload] = React.useState<boolean>(false);
    const [url, setAssetManualUrl] = React.useState<string>("");
    const [isPanelOpen, setisPanelOpen] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
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
        AssetLink: "",
        Attachment: "",
        WebsiteLink: "",
        Manufacturer: "",
        AssetType: "",
        Color: "",

    });
    const [imageURL, setImageURL] = React.useState("");
    const [showModal, setShowModal] = React.useState(false);
    const [displayerror, setdisplayerror] = React.useState<boolean>(false);
    const [displayerrorweblink, setdisplayerrorweblink] = React.useState<boolean>(false);
    const [videoLinks, setVideoLinks] = React.useState<any>([]);
    const [currentLink, setCurrentLink] = React.useState<string>("");
    const [selectedData, setSelectedData] = React.useState<any>();

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

    const onManufacturerChange = (manufacturer: any): void => {
        // setSelectedManufacturer(manufacturer.text);
        // setAddAssetDataList({ ...addAssetDataList, Manufacturer: manufacturer.value });
        setAddAssetDataList((prev: any) => ({ ...prev, Manufacturer: manufacturer }));
    };
    const onAssetTypeChange = (assetTypeId: string): void => {
        // setSelectedAssetType(assetTypeId);
        // setAddAssetDataList({ ...addAssetDataList, AssetType: assetTypeId });
        setAddAssetDataList((prev: any) => ({ ...prev, AssetType: assetTypeId }));

    };
    const onColorChange = (colorId: string): void => {
        // setSelectedColor(colorId);
        setAddAssetDataList({ ...addAssetDataList, Color: colorId });
    };

    const addAssetdata = (event: any): void => {
        // setAddAssetDataList({ ...addAssetDataList, [event.target.name]: event.target.value });
        setAddAssetDataList((prev: any) => ({ ...prev, [event.target.name]: event.target.value }));

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
        }
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
        const { Title, Model, WebsiteLink, Color, AssetType, Manufacturer } = addAssetDataList;
        setValidationMessages([]);
        const messages = [];

        if (!Title || Title.trim() === "") {
            messages.push("Title is required");
        }
        if (isUpdate) {
            if (selectedFiles.length <= 0 && selectedData?.AssetImage === "") {
                messages.push("Device Photo is required");
            }
            if (IsDeleted === true && selectedFiles.length <= 0) {
                messages.push("Device Photo is required");
            }
        } else {
            if (selectedFiles.length <= 0) {
                messages.push("Device Photo is required");
            }
        }
        if (!Manufacturer) {
            messages.push("Manufacturer is required");
        }
        if (!Model || Model.trim() === "") {
            messages.push("Model is required");
        }
        if (!AssetType) {
            messages.push("Asset Type is required");
        }
        if (!Color || Color.trim() === "") {
            messages.push("Color is required");
        }
        if (!videoLinks || videoLinks?.length <= 0) {
            messages.push("Video Link is required");
        }
        if (!WebsiteLink || WebsiteLink.trim() === "") {
            messages.push("Website Link is required");
        }
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
        if (IsManualPDFDeleted == true && selectedPDFs.length === 0) {
            messages.push("Assets Manual is required");
        }
        setValidationMessages(messages);
        return messages.length > 0;
    };

    const _onClickDeleteUploadFile = (): void => {
        setIsDeleted(true);
    };
    const _onClickDeleteManualPDF = async (): Promise<void> => {
        // await props.provider.deleteAttachment(ListNames.GlobalAssets, selectedData?.ID, addAssetDataList.Attachment);
        setIsManualPDFDeleted(true);
    };

    const _userActivityLog = async () => {

        setIsLoading(true);
        try {
            const todayDate = moment().format("YYYY-MM-DD");
            const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.UserActivityLog,
                filter: `Email eq '${props.loginUserRoleDetails?.emailId}' and EntityId eq '${props.componentProp?.masterAssetId}' and EntityType eq '${UserActionEntityTypeEnum.MasterAssets}' and ActionType eq 'Update' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
            };
            const results = await props.provider.getItemsByQuery(queryStringOptions);
            if (results && results.length > 0) {
                const listData = results.map((data) => ({
                    ID: data.ID,
                    Count: data.Count ?? '',
                }));
                let updateObj = {
                    Count: listData[0]?.Count + 1,
                };
                await props.provider.updateItemWithPnP(updateObj, ListNames.UserActivityLog, Number(listData[0]?.ID));
            } else {
                const logObj = {
                    UserName: props?.loginUserRoleDetails?.title,
                    ActionType: UserActivityActionTypeEnum.Update,
                    EntityType: UserActionEntityTypeEnum.MasterAssets,
                    EntityId: Number(selectedData?.ID),
                    EntityName: addAssetDataList.Title.toString().trim(),
                    Details: `Update Master Asset ${addAssetDataList.Title.toString().trim()}`,
                    Count: 1,
                    Email: props?.loginUserRoleDetails?.emailId,
                };
                void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
            }
        } catch (error) {
            console.error("Error fetching user activity log:", error);
        } finally {
            setIsLoading(false);
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
                let thumnailImgsUrl: any;

                if (isUpdate) {
                    if (selectedFiles.length <= 0) {
                        Photo = JSON.stringify({ serverRelativeUrl: selectedData?.AssetImage });
                        thumnailImgsUrl = selectedData?.AssetPhotoThumbnailUrl;
                    } else {
                        let thumnailImgs = await saveThumbNailImage(props.provider, selectedFiles[0], ListNames.QuaycleanMasterAssets, true, selectedData?.AssetImage);
                        Photo = thumnailImgs.Photo;
                        thumnailImgsUrl = thumnailImgs.EncodedAbsThumbnailUrl;
                    }
                } else {
                    let thumnailImgs = await saveThumbNailImage(props.provider, selectedFiles[0], ListNames.QuaycleanMasterAssets);
                    Photo = thumnailImgs.Photo;
                    thumnailImgsUrl = thumnailImgs.EncodedAbsThumbnailUrl;
                }
                let createdId: number = 0;
                const data: any = {
                    Title: addAssetDataList.Title.toString().trim(),
                    AssetPhoto: Photo,
                    Manufacturer: addAssetDataList.Manufacturer,
                    Model: addAssetDataList.Model,
                    AssetType: addAssetDataList.AssetType,
                    QCColor: addAssetDataList.Color,
                    AssetLink: { Url: addAssetDataList.AssetLink },
                    WebsiteLink: addAssetDataList.WebsiteLink,
                    AssetPhotoThumbnailUrl: thumnailImgsUrl,
                };

                if (isUpdate) {
                    let toastMessage: string = "";
                    const toastId = toastService.loading('Loading...');
                    toastMessage = Messages.UpdateMasterAsset;
                    if (IsManualPDFDeleted && selectedData.Attachment) {
                        await props.provider.deleteAttachment(ListNames.GlobalAssets, selectedData?.ID, selectedData.Attachment);
                    }

                    await props.provider.updateItemWithPnP(data, ListNames.GlobalAssets, selectedData?.ID);
                    createdId = selectedData?.ID;
                    // const logObj = {
                    //     UserName: props?.loginUserRoleDetails?.title,
                    //     ActionType: UserActivityActionTypeEnum.Update,
                    //     EntityType: UserActionEntityTypeEnum.MasterAssets,
                    //     EntityId: Number(selectedData?.ID),
                    //     EntityName: addAssetDataList.Title.toString().trim(),
                    //     Details: `Update Master Asset ${addAssetDataList.Title.toString().trim()}`
                    // };
                    // void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);

                    if (selectedPDFs.length > 0) {
                        selectedPDFs.forEach(async file => {
                            await props.provider.uploadAttachmentToList(ListNames.GlobalAssets, file, createdId).then((file: any) => {
                                console.log("Success");
                            });
                        });
                    }
                    _userActivityLog();
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    setIsLoading(false);
                    props.manageComponentView({ currentComponentName: ComponentNameEnum.GlobalAssetsList });
                } else {
                    let toastMessage: string = "";
                    const toastId = toastService.loading('Loading...');
                    toastMessage = Messages.AddMasterAsset;
                    await props.provider.createItem(data, ListNames.GlobalAssets).then(async (item: any) => {
                        createdId = item.data.Id;
                        const logObj = {
                            UserName: props?.loginUserRoleDetails?.title,
                            ActionType: UserActivityActionTypeEnum.Create,
                            EntityType: UserActionEntityTypeEnum.MasterAssets,
                            EntityId: Number(createdId),
                            EntityName: addAssetDataList.Title.toString().trim(),
                            Details: `Add New Master Asset ${addAssetDataList.Title.toString().trim()}`,
                            Count: 1,
                            Email: props?.loginUserRoleDetails?.emailId,
                        };
                        void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);

                        if (selectedPDFs.length > 0) {
                            selectedPDFs.forEach(async file => {
                                await props.provider.uploadAttachmentToList(ListNames.GlobalAssets, file, createdId).then((file: any) => {
                                    console.log("Success");
                                });
                            });
                        }

                    }).catch(err => console.log(err));
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    setIsLoading(false);
                    props.manageComponentView({ currentComponentName: ComponentNameEnum.GlobalAssetsList });
                }
            }

        } catch (error) {
            const errorObj = { ErrorMethodName: "onClick_SaveAsset", CustomErrormessage: "error in save master asset", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const fileSelectionChange = (e: any): void => {
        const files = e.target.files;
        const selectedFiles: IFileWithBlob[] = [];
        // let isValid = imgValidation(files[0].name);
        let isValid = false;
        if (files.length > 0) {
            isValid = imgValidation(files[0]?.name);
        }
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

    const manualSelectionChange = (e: any) => {
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
        } else {
            setSelectedPDFs([]);
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
    React.useEffect(() => {

        try {
            const masterId = props.componentProp?.masterAssetId;
            if (!!masterId && masterId > 0) {
                void (async () => {
                    const select = [AssetFields.Title,
                    AssetFields.Id,
                    AssetFields.Manufacturer,
                    AssetFields.Model,
                    AssetFields.AssetType,
                    AssetFields.QCColor,
                    AssetFields.AssetLink,
                    // AssetFields.AssetsManual,
                    AssetFields.WebsiteLink,
                    AssetFields.Attachments,
                    AssetFields.AssetPhoto,
                    AssetFields.AttachmentFiles,
                    AssetFields.AssetPhotoThumbnailUrl,
                    ];
                    const expand = ["AttachmentFiles"];
                    const queryStringOptions: IPnPQueryOptions = {
                        select: select,
                        listName: ListNames.GlobalAssets,
                        // filter: filter,
                        expand: expand,
                        id: masterId
                    };
                    const data = await props.provider.getByItemByIDQuery(queryStringOptions);

                    const fixImgURL = `${props.context.pageContext.web.serverRelativeUrl}/Lists/GlobalAssets/Attachments/${data.Id}/`;
                    const attachmentFiledata = getAttachmentDataUrl(data?.AttachmentFiles, fixImgURL, notFoundImage);
                    const AssetPhotoURL = data?.AssetPhoto ? getParsedImageUrl(data?.AssetPhoto, fixImgURL, notFoundImage) : notFoundImage;

                    setIsManualPDFDeleted(false);
                    setIsUpdate(true);
                    let fileatttachmentfilename;
                    if (AssetPhotoURL?.split('/').pop() === "NotFoundImg_15f37076872698f99e30750028e2f28e.png") {
                        setIsDeleted(true);
                    } else {
                        setIsDeleted(false);
                    }
                    if (attachmentFiledata == null) {
                        setIsManualPDFDeleted(true);
                    } else {
                        const urlParts = attachmentFiledata?.split('/');
                        fileatttachmentfilename = urlParts[urlParts?.length - 1];
                    }

                    let arr = data?.AssetLink?.Url?.split(',');
                    setVideoLinks(arr);
                    setAddAssetDataList({
                        Title: data?.Title || "",
                        Model: data?.Model || "",
                        AssetLink: data?.AssetLink?.Url || "",
                        WebsiteLink: data?.WebsiteLink || "",
                        Attachment: attachmentFiledata ? fileatttachmentfilename : "",
                        Manufacturer: data?.Manufacturer || "",
                        AssetType: data?.AssetType || "",
                        Color: data?.QCColor || ""
                    });

                    setSelectedData({
                        Id: parseInt(data?.ID) || masterId,
                        ID: parseInt(data?.ID) || masterId,
                        Title: data?.Title || "",
                        Model: data?.Model || "",
                        WebsiteLink: data?.WebsiteLink || "",
                        Attachment: attachmentFiledata,
                        Manufacturer: data?.Manufacturer || "",
                        AssetType: data?.AssetType || "",
                        QCColor: data?.QCColor || "",
                        AssetLink: data?.AssetLink || "",
                        AssetPhotoThumbnailUrl: data?.AssetPhotoThumbnailUrl || notFoundImage,
                        AssetImage: AssetPhotoURL,
                    });

                    // addAssetDataList.Title = selectedData?.Title;
                    // addAssetDataList.Model = selectedData?.Model;
                    // addAssetDataList.AssetLink = selectedData?.AssetLink?.Url;

                    // addAssetDataList.WebsiteLink = selectedData?.WebsiteLink;
                    // addAssetDataList.Attachment = selectedData?.Attachment ? fileatttachmentfilename : "";
                    // addAssetDataList.Model = selectedData?.Manufacturer;
                    // addAssetDataList.Model = selectedData?.QCColor;
                })();


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

    return <>

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
        <div className="boxCard">
            <div className="formGroup">

                <div className="formGroup">
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween">
                                <div> <h1 className="mainTitle">Asset Form</h1></div>
                                <div className="dFlex">
                                    <div>
                                        <PrimaryButton className="btn btn-danger justifyright floatright"
                                            onClick={() => {
                                                props.manageComponentView({ currentComponentName: ComponentNameEnum.GlobalAssetsList });
                                            }}
                                            text="Close" />
                                    </div>
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <div className="customebreadcrumb">
                                    <Breadcrumb
                                        items={props.componentProp.breadCrumItems || []}
                                        maxDisplayedItems={3}
                                        ariaLabel="Breadcrumb with items rendered as buttons"
                                        overflowAriaLabel="More links"
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">{AssetViewFields.AssetTitle}<span className="required">*</span></Label>
                                        <TextField className="formControl" name="Title" value={addAssetDataList.Title} onChange={addAssetdata} />
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">{AssetViewFields.AssetPhoto}<span className="required">*</span></Label>
                                        {!!props.componentProp.masterAssetId && IsDeleted == false && <>
                                            {/* <div className="formControl">
                                                <span className="cursorPointer"
                                                    onClick={() => toggleModal(selectedData?.AssetImage)} >
                                                    View Image
                                                </span>
                                                <FontAwesomeIcon className="ml5 required" icon="trash-alt" onClick={_onClickDeleteUploadFile} />
                                            </div> */}
                                            <div className="inline-action-row">
                                                <span
                                                    className="inline-action-text"
                                                    onClick={() => toggleModal(selectedData?.AssetImage)}
                                                >
                                                    View Image
                                                </span>

                                                <FontAwesomeIcon
                                                    icon="trash-alt"
                                                    className="inline-action-delete"
                                                    onClick={_onClickDeleteUploadFile}
                                                />
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
                                        />}
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">{AssetViewFields.Manufacturer}<span className="required">*</span></Label>
                                        <div className="formControl">
                                            <MasterManufacturerFilter
                                                defaultOption={!!addAssetDataList.Manufacturer ? addAssetDataList.Manufacturer : ""}
                                                onManufacturerChange={onManufacturerChange}
                                                provider={props.provider}
                                                isRequired={true}
                                                listName={ListNames.GlobalAssets}
                                                isMultiple={false}
                                            />
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">{AssetViewFields.Model}<span className="required">*</span></Label>
                                        <TextField className="formControl" name="Model" value={addAssetDataList.Model} onChange={addAssetdata} />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">

                                        <Label className="formLabel">{AssetViewFields.AssetType}<span className="required">*</span></Label>
                                        <div className="formControl">
                                            <AssetTypeFilter
                                                selectedAssetType={addAssetDataList.AssetType}
                                                defaultOption={!!addAssetDataList.AssetType ? addAssetDataList.AssetType : ""}
                                                onAssetTypeChange={onAssetTypeChange}
                                                provider={props.provider}
                                                isRequired={true}
                                                AllOption={false}
                                                listName={ListNames.GlobalAssets}
                                            />
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">{AssetViewFields.QCColor}<span className="required">*</span></Label>
                                        <div className="formControl">
                                            <ColorFilter
                                                selectedColor={addAssetDataList.Color}
                                                defaultOption={!!addAssetDataList.Color ? addAssetDataList.Color : ""}
                                                onColorChange={onColorChange}
                                                provider={props.provider}
                                                isRequired={true}
                                                listName={ListNames.GlobalAssets}
                                            />
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg3">
                                        <Label className="formLabel">{AssetViewFields.AssetsManual}<span className="required">*</span></Label>
                                        {!!props.componentProp?.masterAssetId && IsManualPDFDeleted == false && <>
                                            <Link className="" target="_blank" onClick={() => {
                                                setAssetManualUrl(selectedData?.Attachment.trim());
                                                setisPanelOpen(true);
                                            }}>
                                                <div className="img-name-text"> {selectedData?.Attachment?.split('/').pop()} </div>
                                            </Link><FontAwesomeIcon className='required' icon="trash-alt" onClick={_onClickDeleteManualPDF} />
                                        </>}
                                        {IsManualPDFDeleted == true && < TextField
                                            type="file"
                                            className="formControl"
                                            name="AssetPDF"
                                            accept="application/pdf"
                                            placeholder="Enter Input"
                                            onChange={manualSelectionChange}
                                        />}

                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg9 mt4px">
                                        <Label className="formLabel">{AssetViewFields.AssetLink}<span className="required">*</span></Label>
                                        {displayerror === false &&
                                            <div className="ttadd">
                                                <TooltipHost content="Add New Value" id={tooltipId} onClick={onClickAddLink}>
                                                    <FontAwesomeIcon className="ml-5 ddadd" icon='plus' onClick={onClickAddLink} />
                                                </TooltipHost>
                                            </div>}
                                        <TextField
                                            className="formControl"
                                            name="AssetLink"
                                            value={currentLink}
                                            onChange={handleLinkChange}
                                        />
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
                                                    <FontAwesomeIcon className="ml5 required clsPointer" icon="trash-alt" onClick={() => handleDeleteLink(index)} />
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

                                                <FontAwesomeIcon
                                                    icon="trash-alt"
                                                    className="compact-link-delete"
                                                    onClick={() => handleDeleteLink(index)}
                                                />
                                            </div>
                                        ))}

                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg9">
                                        <Label className="formLabel">Website Link<span className="required">*</span></Label>
                                        <TextField className="formControl" name="WebsiteLink" value={addAssetDataList.WebsiteLink} onChange={addAssetdata} />
                                        {displayerrorweblink &&
                                            <div className="requiredlink">Enter Valid Link</div>}
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 formGroup">
                                        {(displayerrorweblink === false && displayerror === false) &&
                                            <>{isUpdate ? <PrimaryButton className="btn btn-primary" onClick={onClick_SaveAsset} text="Update" /> : <PrimaryButton className="btn btn-primary" onClick={onClick_SaveAsset} text="Save" />}</>
                                        }

                                        {(displayerrorweblink || displayerror) &&
                                            <>{isUpdate ? <PrimaryButton className="btn btn-sec" text="Update" /> : <PrimaryButton className="btn btn-sec" text="Save" />}</>
                                        }

                                        <PrimaryButton
                                            style={{ margin: "5px", marginTop: "10px" }}
                                            className="btn btn-danger"
                                            text="Close"
                                            onClick={() => {
                                                props.manageComponentView({ currentComponentName: ComponentNameEnum.GlobalAssetsList });
                                            }} />
                                    </div>
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
    </>;

};