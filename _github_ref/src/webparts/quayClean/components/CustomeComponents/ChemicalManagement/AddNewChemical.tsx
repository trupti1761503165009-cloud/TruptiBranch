/* eslint-disable require-atomic-updates */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { Breadcrumb, PrimaryButton, TextField, defaultDatePickerStrings } from "@fluentui/react";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { DatePicker, Label, Panel, PanelType, TooltipHost } from "office-ui-fabric-react";
import { IReactSelectOptionProps } from "../../../../../Interfaces/IReactSelectOptionProps";
import { ActionMeta } from "react-select";
import { IAddNewChemicalState, IAddChemicalObj, HyperlinkType } from "../../../../../Interfaces/IAddNewChemical";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ValidateForm } from "../../../../../Common/Validation";
import { IQuayCleanState } from "../../QuayClean";
import { ComponentNameEnum, devSiteURL, ListNames, mainSiteURL, qaSiteURL, qrcodeSiteURL, stageSiteURLNew, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import CustomModal from "../../CommonComponents/CustomModal";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');
import moment from "moment";
import { toastService } from "../../../../../Common/ToastService";
import { Loader } from "../../CommonComponents/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { delay, genrateDropDownFormate, logGenerator, onFormatDate, removeElementOfBreadCrum, saveThumbNailImage, UserActivityLog } from "../../../../../Common/Util";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { GenrateQRCode } from "../../CommonComponents/GenrateQRCode";
import * as qrcode from 'qrcode';
import { Environment, EnvironmentType } from "@microsoft/sp-core-library";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { ChemicalCommonFilter } from "../../../../../Common/Filter/ChemicalCommonFilter";
import { ViewDocument } from "../../CommonComponents/ViewDocument";
import { _getDocumentData } from "../../CommonComponents/CommonMethods";
import { useBoolean } from "@fluentui/react-hooks";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";

export interface IAddNewChemicalProps {
    provider: IDataProvider;
    context: WebPartContext;
    isAddNewProject?: boolean;
    manageComponentView(componentProp: IQuayCleanState): any;
    siteMasterId?: number;
    breadCrumItems: IBreadCrum[];
    loginUserRoleDetails: any;
    componentProp: IQuayCleanState;
}

export const AddNewChemical = (props: IAddNewChemicalProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const { isAddNewProject, manageComponentView, context, siteMasterId } = props;
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail, currentUser } = appGlobalState;
    const [newFromObj, setNewFromObj] = React.useState<IAddChemicalObj>({
        Title: "",
        Manufacturer: "",
        SDSDate: undefined,
        Hazardous: "",
        HazClass: "",
        StorageRequest: "",
        pH: "",
        NumberOfItems: "",
        StorageClass: "",
        SDS: "",
        PPERequired: "",
        QCNotes: "",
        ExpirationDate: undefined,
        Id: 0,
        SDSFile: ''
    });
    const [state, SetState] = React.useState<IAddNewChemicalState>({
        // ManufacturerOptions: [],
        HazardousOptions: [],
        // StorageClassOptions: [],
        // PPERequiredOptions: [],
        // HazClassOptions: [],
        isdisableField: !!isAddNewProject ? false : true,
        //siteMasterItems: [],
        isAddNewChemical: !!isAddNewProject,
        isformValidationModelOpen: false,
        validationMessage: null,
        isSDSDocument: false
    });

    const [selectedFiles, setSelectedFiles] = React.useState<IFileWithBlob[]>([]);
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const [ImageDeleted, setImageDeleted] = React.useState<boolean>(true);
    const [imageURL, setImageURL] = React.useState("");
    const [showModal, setShowModal] = React.useState(false);
    const [oldProductUrl, setOldProductUrl] = React.useState<string>("");
    const toggleModal = (imgURL: string | undefined) => {
        setImageURL(imgURL ? imgURL : "");
        setShowModal(!showModal);
    };
    const [isShowModelQR, setIsShowModelQR] = React.useState<boolean>(false);
    const itemurlQR = React.useRef<any>();
    const itemsRefQR = React.useRef<any>();

    const [showFileModal, setShowFileModal] = React.useState(false);
    const [SDSFileDeleted, setSDSFileDeleted] = React.useState<boolean>(true);
    const [SDSFileURL, setSDSFileURL] = React.useState("");
    const [selectedSDSFiles, setSelectedSDSFiles] = React.useState<IFileWithBlob[]>([]);
    const [oldSDSFileID, setOldSDSFileID] = React.useState<any>(0);
    const [linkInputs, setLinkInputs] = React.useState<string[]>(['']);

    const [hideDialogdelete, { toggle: toggleHideDialogdelete }] = useBoolean(false);
    const ControlName = React.useRef<any>();
    const Index = React.useRef<any>();

    const handleAddLinkInput = React.useCallback(() => {
        setLinkInputs(prev => {
            const lastIndex = prev.length - 1;
            // Try to read the real input element value (this captures the very latest typed char)
            const lastInputElem = document.getElementById(`sds-link-${lastIndex}`) as HTMLInputElement | null;
            const lastValue = lastInputElem ? lastInputElem.value.trim() : (prev[lastIndex] || '').trim();

            // if last is empty, don't add a new one
            if (lastValue === '') {
                return prev;
            }

            const updated = [...prev, ''];

            // update SDS.Url with new list (cleaned)
            setNewFromObj(prevState => ({
                ...prevState,
                SDS: {
                    ...prevState.SDS,
                    Url: updated.map(u => u.trim()).filter(Boolean).join(','),
                    Description: prevState.SDS?.Description || ''
                }
            }));

            return updated;
        });
    }, [setNewFromObj]);

    const handleLinkChange = React.useCallback((index: number, value: string) => {
        setLinkInputs(prev => {
            const updated = [...prev];
            updated[index] = value;
            // update SDS.Url using the cleaned list (no blanks)
            setNewFromObj(prevState => ({
                ...prevState,
                SDS: {
                    ...prevState.SDS,
                    Url: updated.map(u => u.trim()).filter(Boolean).join(','),
                    Description: prevState.SDS?.Description || ''
                }
            }));
            return updated;
        });
    }, [setNewFromObj]);




    const handleDeleteLinkInput = React.useCallback((index: number) => {
        setLinkInputs(prev => {
            const updated = prev.filter((_, i) => i !== index);
            setNewFromObj(prevState => ({
                ...prevState,
                SDS: {
                    ...prevState.SDS,
                    Url: updated.map(u => u.trim()).filter(Boolean).join(','),
                    Description: prevState.SDS?.Description || ''
                }
            }));
            return updated.length ? updated : [''];
        });
    }, [setNewFromObj]);

    React.useEffect(() => {
        if (typeof newFromObj?.SDS?.Url === 'string') {
            const urls = newFromObj.SDS.Url.split(',').map((u: any) => u.trim()).filter(Boolean);
            setLinkInputs(prev => {
                const same = urls.length === prev.length && urls.every((v: any, i: any) => v === prev[i]);
                return same ? prev : (urls.length ? urls : ['']);
            });
        }
    }, [newFromObj?.SDS?.Url]);

    // Join links on save or wherever needed
    const getCombinedSDSLinks = () => {
        return linkInputs.filter(link => !!link.trim()).join(', ');
    };



    const toggleFileModal = (imgURL: string | undefined) => {
        setSDSFileURL(imgURL ? imgURL : "");
        setShowFileModal(!showFileModal);
    };
    const getChemicalDetailByID = (ChemicalId: number) => {
        if (!!ChemicalId) {
            const selectItem = ["ID,Title,Manufacturer,ProductPhotoThumbnailUrl,SDSDate,Hazardous,HazClass,StorageRequest,pH,StorageClass,SDS,PPERequired,QCNotes,NumberOfItems,ExpirationDate,SDSDocument,ProductPhoto,IsSDSDocument"];
            const filter = `ID eq ${ChemicalId}`;
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.ChemicalRegistration,
                select: selectItem,
                //expand: ['SiteManager,HelpDeskType,QCState,ADUser'],
                filter: filter,
                id: ChemicalId
            };
            return props.provider.getByItemByIDQuery(queryOptions);
        }
    };

    const bindChoicesGroupsOptions = async () => {
        // const [ManufacturerOptions, HazClassOptions, StorageClassOptions, PPERequiredOptions, HazardousOptions] = await Promise.all([
        const [HazardousOptions] = await Promise.all([

            props.provider.choiceOption(ListNames.ChemicalRegistration, "Hazardous"),
        ]);

        const hazardouesOpt = genrateDropDownFormate(HazardousOptions);

        SetState(prevState => ({ ...prevState, HazardousOptions: hazardouesOpt }));
    };

    React.useEffect(() => {

        try {
            setIsLoading(true);
            // eslint-disable-next-line no-void
            void (async () => {
                bindChoicesGroupsOptions();
                if (siteMasterId && siteMasterId > 0) {

                    const chemicalItem = await getChemicalDetailByID(siteMasterId);

                    // const fixImgURL = '/sites/Quayclean/Lists/ChemicalRegistration/Attachments/' + chemicalItem.ID + "/";
                    const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/ChemicalRegistration/Attachments/' + chemicalItem.ID + "/";
                    let productPhotoURL;
                    if (chemicalItem.ProductPhoto) {
                        try {
                            const productPhotoData = JSON.parse(chemicalItem.ProductPhoto);
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

                    let SDSFileURL = "";
                    try {
                        const data = await _getDocumentData(siteMasterId, props.provider);
                        // const fileData = data?.[0];
                        // if (fileData?.FileRef) {
                        //     SDSFileURL = fileData.FileRef;
                        //     setOldSDSFileID(fileData.ID);
                        //     setSDSFileDeleted(false);
                        // }
                        if (Array.isArray(data)) {
                            const validFiles = data.filter(item => item?.FileRef);

                            if (validFiles.length) {
                                const urls = validFiles.map(file => file.FileRef.trim());
                                const ids = validFiles.map(file => file.ID);

                                SDSFileURL = urls.join(', ');               // Comma-separated URLs
                                setOldSDSFileID(ids);                       // Store all IDs
                                setSDSFileDeleted(false);                   // Mark not deleted
                            } else {
                                SDSFileURL = "";
                                setOldSDSFileID([]);                        // Empty array
                                setSDSFileDeleted(true);                    // Mark deleted
                            }
                        }

                    } catch (error) {
                        console.error("Error fetching SDS document data:", error);
                    }

                    let hyperLink;
                    const formattedSDSDate = chemicalItem.SDSDate ? moment(chemicalItem.SDSDate).format('MM-DD-YYYY') : null;
                    const formattedExpirationDate = chemicalItem.ExpirationDate ? moment(chemicalItem.ExpirationDate).format('MM-DD-YYYY') : null;
                    const sdsURL = (chemicalItem.SDS) ? chemicalItem?.SDS?.Url : "";


                    // Always update isSDSDocument state based on value
                    SetState(prevState => ({ ...prevState, isSDSDocument: !!chemicalItem.IsSDSDocument }));

                    // Prepare hyperlink object if SDS URL exists
                    if (sdsURL) {
                        hyperLink = {
                            Description: "",
                            Url: sdsURL
                        } as HyperlinkType;
                    }


                    const items: IAddChemicalObj = {
                        Id: parseInt(chemicalItem.Id),
                        Title: !!chemicalItem.Title ? chemicalItem.Title : "",
                        Manufacturer: !!chemicalItem.Manufacturer ? chemicalItem.Manufacturer : "",
                        SDSDate: !!formattedSDSDate ? new Date(formattedSDSDate) : undefined,
                        Hazardous: !!chemicalItem.Hazardous ? chemicalItem.Hazardous : "",
                        HazClass: !!chemicalItem.HazClass ? chemicalItem.HazClass : "",
                        StorageRequest: !!chemicalItem.StorageRequest ? chemicalItem.StorageRequest : "",
                        StorageClass: !!chemicalItem.StorageClass ? chemicalItem.StorageClass : "",
                        pH: !!chemicalItem.pH ? chemicalItem.pH : "",
                        SDS: hyperLink,
                        PPERequired: !!chemicalItem.PPERequired ? chemicalItem.PPERequired : "",
                        QCNotes: !!chemicalItem.QCNotes ? chemicalItem.QCNotes : "",
                        NumberOfItems: !!chemicalItem.NumberOfItems ? chemicalItem.NumberOfItems : "",
                        ExpirationDate: !!formattedExpirationDate ? new Date(formattedExpirationDate) : undefined,
                        //SDSDocument: !!chemicalItem.SDSDocument ? chemicalItem.SDSDocument : "",
                        ProductPhoto: !!productPhotoURL ? productPhotoURL : "",
                        SDSFile: !!SDSFileURL ? SDSFileURL : ""
                    };
                    //setDefaultSelcetdFromItems(items);
                    setNewFromObj(items);
                    setImageDeleted(false);
                    if (productPhotoURL.split('/').pop() === "NotFoundImg_15f37076872698f99e30750028e2f28e.png") {
                        setImageDeleted(true);
                    }
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                }
                setIsLoading(false);
            })();


        } catch (error) {
            setIsLoading(false);
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect AddNewChemical"
            };
            void logGenerator(props.provider, errorObj);
        }

    }, []);

    const onChemicalTitleChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setNewFromObj(prevState => ({ ...prevState, Title: newValue }));
    };

    const onSDSChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        // const hyperlink = {
        //     'Description': '',
        //     'Url': newValue,
        // };
        setNewFromObj(prevState => ({ ...prevState, SDS: { Url: (newValue) ? newValue : '', Description: '' } }));
    };

    const onNumberOfItemsChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        //setNewFromObj(prevState => ({ ...prevState, NumberOfItems: newValue }))
        setNewFromObj(prevState => ({ ...prevState, NumberOfItems: newValue ? parseInt(newValue, 10) : 0 }));
    };

    const onChangeStorageRequest = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setNewFromObj(prevState => ({ ...prevState, StorageRequest: newValue }));
    };

    const onChangePH = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        const re = /^-?\d*\.?\d*$/;
        // Check if newValue is defined before using it
        if (newValue !== undefined && (newValue === '' || re.test(newValue))) {
            setNewFromObj(prevState => ({ ...prevState, pH: newValue ? parseFloat(newValue) : 0 }));
        } else {
            setNewFromObj(prevState => ({ ...prevState, pH: 0 }));
        }
    };

    const onChangeQCNotes = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setNewFromObj(prevState => ({ ...prevState, QCNotes: newValue }));
    };


    const onChnageManufacturer = (option: any) => {
        setNewFromObj(prevState => ({ ...prevState, Manufacturer: option }));
    };

    const onChangeHazardous = (option: IReactSelectOptionProps, actionMeta: ActionMeta<any>) => {
        setNewFromObj(prevState => ({ ...prevState, Hazardous: option.value }));
    };


    const onChangeHazClass = (selectedValues: any) => {
        setNewFromObj(prevState => ({ ...prevState, HazClass: selectedValues }));
    };

    // const onChangStorageClass = (option: IReactSelectOptionProps, actionMeta: ActionMeta<any>) => {
    //     setNewFromObj(prevState => ({ ...prevState, StorageClass: option.value }));
    // };
    const onChangStorageClass = (option: any) => {
        setNewFromObj(prevState => ({ ...prevState, StorageClass: option }));
    };


    const onChangPPERequired = (selectedValues: any) => {
        setNewFromObj(prevState => ({ ...prevState, PPERequired: selectedValues }));
    };

    const fileSelectionChange = (e: any) => {
        const files = e.target.files;
        const selectedFiles: IFileWithBlob[] = [];
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
                    folderServerRelativeURL: `${context.pageContext.web.serverRelativeUrl}/SiteAssets/ChemicalRegistrationImages`,
                    overwrite: true
                };
                selectedFiles.push(selectedFile);
            }
        }
        setSelectedFiles(selectedFiles);
        //}
    };

    const errorMessageGenrate = (item: any) => {
        const error: any[] = [];
        let errormessage: any;
        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                switch (key) {
                    case "Manufacturer":
                        error.push(<div>Manufacturer is required</div>);
                        break;
                    case "Title":
                        error.push(<div>Chemical Title is required</div>);
                        break;
                    case "SDSDate":
                        error.push(<div>SDS Date  is required</div>);
                        break;
                    case "Hazardous":
                        error.push(<div>Hazardous is required</div>);
                        break;
                    case "HazClass":
                        error.push(<div>Haz Class is required</div>);
                        break;
                    case "StorageRequest":
                        error.push(<div>Storage Request is required</div>);
                        break;
                    case "pH":
                        error.push(<div>pH is required</div>);
                        break;
                    case "NumberOfItems":
                        error.push(<div>Number Of Items is required</div>);
                        break;
                    case "StorageClass":
                        error.push(<div>Storage Class is required</div>);
                        break;
                    case "SDS":
                        error.push(<div>SDS is required</div>);
                        break;
                    case "PPERequired":
                        error.push(<div>PPE Required is required</div>);
                        break;
                    case "QCNotes":
                        error.push(<div>Notes is required</div>);
                        break;
                    case "ExpirationDate":
                        error.push(<div>Expiration Date is required</div>);
                        break;
                    case "SDSURL":
                        error.push(<div>Enter valid SDS URL</div>);
                        break;
                    case "ProductPhoto":
                        error.push(<div>Product Photo is required</div>);
                        break;
                    case "InvalidProductPhoto":
                        error.push(<div>Product Photo is select valid image</div>);
                        break;
                    // case "SDSFile":
                    //     error.push(<div>SDS document is required</div>);
                    //     break;
                    // case "SDSDocument":
                    //     error.push(<div>SDSDocument : required</div>);
                    //     break;
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

    const afterQrGenrate = async (url: any) => {

        let data = dataURItoBlob(url);
        let QrName = itemsRefQR.current?.Title.replace("#", '').split(' ').join('') + "-" + itemsRefQR.current.Id;
        const file: IFileWithBlob = {
            file: data,
            // name: "QrCode.png",
            name: `${QrName}.png`,
            folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/ChemicalQrCode`,
            overwrite: true
        };
        let fileUpload: any;
        let Photo;
        fileUpload = await props.provider.uploadFile(file);
        Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl });
        await props.provider.updateItemWithPnP({ QRCode: Photo }, ListNames.ChemicalRegistration, itemsRefQR.current.Id);
        setIsShowModelQR(false);
        setIsLoading(false);
        onClickClose();
        // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
        // manageComponentView({ currentComponentName: ComponentNameEnum.ChemicalMaster, breadCrumItems: breadCrumItems });
    };

    const genratedQrcode = (baseUrl: any) => {
        afterQrGenrate(baseUrl);
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

            let url = `${filterqrcodeURL}Chemical/ChemicalDetail?ItemId=${Id}`;
            const qrCodeDatas = await qrcode.toDataURL(url);
            let data = dataURItoBlob(qrCodeDatas);
            let QrName = items?.Title.replace("#", '').split(' ').join('') + "-" + Id;
            const file: IFileWithBlob = {
                file: data,
                // name: "QrCode.png",
                name: `${QrName}.png`,
                folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/ChemicalQrCode`,
                overwrite: true
            };
            let fileUpload: any;
            let Photo;
            fileUpload = await props.provider.uploadFile(file);
            Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl });
            await props.provider.updateItemWithPnP({ QRCode: Photo }, ListNames.ChemicalRegistration, Id);

        } catch (error) {
            const errorObj = { ErrorMethodName: "qrupload", CustomErrormessage: "error in qr code upload", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const SDSFileSelectionChange = (e: any) => {
        const files = e.target.files;
        const selectedFiles: IFileWithBlob[] = [];
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
                    folderServerRelativeURL: `${context.pageContext.web.serverRelativeUrl}/ChemicalRegistrationSDS`,
                    overwrite: true
                };
                selectedFiles.push(selectedFile);
            }
        }
        setSelectedSDSFiles(selectedFiles);
    };

    const SDSFileupload = async (Id: any) => {
        try {
            for (const file of selectedSDSFiles) {
                await props.provider.uploadFile(file, true, {
                    ChemicalRegistrationId: parseInt(Id)
                });
            }
            // const file = selectedSDSFiles[0];
            // await props.provider.uploadFile(file, true, { ChemicalRegistrationId: parseInt(Id) });
        } catch (error) {
            const errorObj = { ErrorMethodName: "SDSFileupload", CustomErrormessage: "error in SDS File upload", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const deleteSDSFile = async () => {
        try {
            await props.provider.deleteItem(ListNames.ChemicalRegistrationSDS, oldSDSFileID);
        } catch (error) {
            const errorObj = { ErrorMethodName: "deleteSDSFile", CustomErrormessage: "error in SDS File delete", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const onClickSaveOrUpdate = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        try {
            let isValidateRecord;
            let validationFields = {
                "required": ['Title', 'Manufacturer', 'Hazardous', 'HazClass', 'StorageRequest', 'pH', 'NumberOfItems', 'StorageClass', 'PPERequired', 'QCNotes'],
                "requiredDate": ['SDSDate', 'ExpirationDate']
            };
            // if (!state.isSDSDocument) {
            //     validationFields.required.push('SDS');
            // }
            if (!!newFromObj)
                isValidateRecord = ValidateForm(newFromObj, validationFields);

            let error: any;
            let isValid: boolean;
            if (!!isValidateRecord) {

                if (

                    newFromObj &&
                    newFromObj.SDS &&
                    (newFromObj.SDS.Url || newFromObj.SDS.Url === "")
                ) {
                    const urlRegExp = /^(ftp|http|https):\/\/[^ "]+$/;
                    const urls = (newFromObj.SDS.Url || "").split(",").map((url: any) => url.trim());

                    const allValid = urls.every((url: any) => urlRegExp.test(url));

                    if (!allValid) {
                        isValid = false;
                        isValidateRecord.isValid = false;
                        isValidateRecord.SDSURL = "Please enter valid URL(s), separated by commas.";
                    }
                }

                if (
                    newFromObj && !state.isSDSDocument &&
                    (!newFromObj.SDS.Url || newFromObj.SDS.Url === "" || newFromObj.SDS.Url === undefined)
                ) {
                    isValid = false;
                    isValidateRecord.isValid = false;
                    isValidateRecord.SDSURL = "Enter SDS URL.";
                }


                if (!newFromObj.Id || newFromObj.Id <= 0) {
                    if (selectedFiles.length <= 0) {
                        isValid = false;
                        isValidateRecord.isValid = false;
                        isValidateRecord.ProductPhoto = "ProductPhoto required";
                    } else if (selectedFiles.length >= 0) {
                        // List of valid image extensions
                        const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
                        const fileName = selectedFiles[0].file.name;

                        const fileExtension = fileName.split('.').pop().toLowerCase();
                        if (validImageExtensions.indexOf(fileExtension) !== -1) {
                            console.log('File is an image.');
                        } else {
                            isValid = false;
                            isValidateRecord.isValid = false;
                            isValidateRecord.InvalidProductPhoto = "ProductPhoto select valid image";
                        }
                    }
                } else {
                    if (newFromObj.ProductPhoto == "" && selectedFiles.length <= 0) {
                        isValid = false;
                        isValidateRecord.isValid = false;
                        isValidateRecord.ProductPhoto = "ProductPhoto required";
                    } else if (selectedFiles.length >= 0 && newFromObj.ProductPhoto == "") {
                        // List of valid image extensions
                        const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
                        const fileName = selectedFiles[0].file.name;

                        const fileExtension = fileName.split('.').pop().toLowerCase();
                        if (validImageExtensions.indexOf(fileExtension) !== -1) {
                            console.log('File is an image.');
                        } else {
                            isValid = false;
                            isValidateRecord.isValid = false;
                            isValidateRecord.InvalidProductPhoto = "ProductPhoto select valid image";
                        }
                    }

                }

                if (isValidateRecord?.isValid === false) {
                    isValid = isValidateRecord?.isValid;
                    error = errorMessageGenrate(isValidateRecord);
                } else {
                    isValid = true;
                }
                SetState(prevState => ({ ...prevState, isformValidationModelOpen: !isValid, validationMessage: error }));
            } else {
                isValid = false;
                error = <ul><li>Please fill the form  </li></ul>;
                SetState(prevState => ({ ...prevState, isformValidationModelOpen: !isValid, validationMessage: error }));
            }


            let createdId: number = 0;
            if (isValid) {
                const tempNewObject: IAddChemicalObj = { ...newFromObj };
                if (state.isSDSDocument) {
                    // delete tempNewObject.SDS;
                    // tempNewObject.SDS = null;
                    delete tempNewObject.SDSFile;
                    tempNewObject.IsSDSDocument = true;
                }
                if (!state.isSDSDocument) {
                    delete tempNewObject.SDSFile;
                    tempNewObject.IsSDSDocument = true;
                }
                if (selectedFiles.length > 0) {
                    let thumnailImgs;
                    if (tempNewObject.Id && tempNewObject.Id > 0) {
                        thumnailImgs = await saveThumbNailImage(props.provider, selectedFiles[0], ListNames.QuaycleanAssets, true, oldProductUrl);
                    } else {
                        thumnailImgs = await saveThumbNailImage(props.provider, selectedFiles[0], ListNames.QuaycleanAssets);
                    }
                    tempNewObject.ProductPhoto = thumnailImgs.Photo;
                    tempNewObject.ProductPhotoThumbnailUrl = thumnailImgs.EncodedAbsThumbnailUrl;
                } else {
                    delete tempNewObject.ProductPhoto;
                    delete tempNewObject.ProductPhotoThumbnailUrl;
                }
                const toastMessage = (tempNewObject.Id && tempNewObject.Id > 0) ? 'Chemical detail updated successfully!' : 'New chemical created successfully!';
                if (tempNewObject.Id && tempNewObject.Id > 0) {
                    await props.provider.updateItemWithPnP(tempNewObject, ListNames.ChemicalRegistration, tempNewObject.Id);
                    createdId = tempNewObject.Id;
                    // if (state.isSDSDocument && selectedSDSFiles.length > 0) {
                    //     await SDSFileupload(createdId);
                    // }
                    if (selectedSDSFiles.length > 0) {
                        await SDSFileupload(createdId);
                    }
                    if (SDSFileDeleted && oldSDSFileID > 0) {
                        await deleteSDSFile();
                    }

                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: props.siteMasterId,
                        ActionType: UserActivityActionTypeEnum.Update,
                        EntityType: UserActionEntityTypeEnum.Chemical,
                        EntityId: Number(createdId),
                        EntityName: tempNewObject?.Title?.toString().trim() || "",
                        Details: `Update Chemical ${tempNewObject?.Title?.toString().trim()}`
                    };
                    void UserActivityLog(props.provider, logObj, currentUserRoleDetail);

                    onClickClose();
                    // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                    // manageComponentView({ currentComponentName: ComponentNameEnum.ChemicalMaster, breadCrumItems: breadCrumItems });
                }
                else {
                    if (tempNewObject.SDS === "") {
                        delete tempNewObject.SDS;
                    }

                    await props.provider.createItem(tempNewObject, ListNames.ChemicalRegistration).then(async (item: any) => {
                        createdId = item.data.Id;

                        const logObj = {
                            UserName: currentUserRoleDetail?.title,
                            SiteNameId: props.siteMasterId,
                            ActionType: UserActivityActionTypeEnum.Create,
                            EntityType: UserActionEntityTypeEnum.Chemical,
                            EntityId: Number(createdId),
                            EntityName: tempNewObject?.Title?.toString().trim() || "",
                            Details: `Create Chemical ${tempNewObject?.Title?.toString().trim()}`
                        };
                        void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
                        // setIsLoading(false);
                        // props.manageComponentView({ currentComponentName: ComponentNameEnum.ViewSite });
                    }).catch(err => console.log(err));
                    if (!!createdId) {
                        await qrupload(createdId, tempNewObject);
                    }
                    if (state.isSDSDocument && selectedSDSFiles.length > 0) {
                        await SDSFileupload(createdId);
                    }
                }
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                onClickClose();
                // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                // manageComponentView({ currentComponentName: ComponentNameEnum.ChemicalMaster, breadCrumItems: breadCrumItems });
                setIsLoading(false);
            } else {
                toastService.dismiss(toastId);
                setIsLoading(false);
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            if (false) delay(100);
            const errorMessage = 'error in on Click Save Or Update';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };

    const onClickClose = () => {
        if (props?.componentProp?.IsMasterChemical === true) {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            manageComponentView({ currentComponentName: ComponentNameEnum.ChemicalMaster, view: props?.componentProp?.view, breadCrumItems: breadCrumItems });
        } else {
            if (!isSiteLevelComponent) {
                const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                manageComponentView({ currentComponentName: ComponentNameEnum.AssociateChemical, view: props?.componentProp?.view, breadCrumItems: breadCrumItems });
            } else {
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                    selectedZoneDetails: selectedZoneDetails,
                    isShowDetailOnly: true,
                    pivotName: "ChemicalKey",
                });
                // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                // props.manageComponentView({
                //     currentComponentName: !!props.preViousCompomentName ? props.preViousCompomentName : ComponentNameEnum.AddNewSite, view: props?.componentProp?.view, dataObj: props.componentProp.dataObj, breadCrumItems: breadCrumItems, IsSupervisor: props.componentProp.IsSupervisor, siteMasterId: props.componentProp.MasterId, isShowDetailOnly: true, siteName: props.componentProp.siteName, qCState: props.componentProp.qCState, pivotName: "ChemicalKey"
                // });
            }
        }
        // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
        // manageComponentView({ currentComponentName: ComponentNameEnum.ChemicalMaster, breadCrumItems: breadCrumItems });
    };


    const _onClickDeleteUploadFile = (controlName: string, index?: number) => {
        ControlName.current = controlName;
        Index.current = index;
        toggleHideDialogdelete();

    };
    // const _onClickDeleteFinalDelete = (): void => {

    const _onClickDeleteFinalDelete = (): void => {
        switch (ControlName.current) {
            case "ProductPhoto":
                setImageDeleted(true);
                setOldProductUrl(newFromObj.ProductPhoto);
                setNewFromObj(prevState => ({ ...prevState, ProductPhoto: "" }));
                break;

            case "SDSFile":
                if (typeof Index.current === 'number') {
                    const fileList = (newFromObj.SDSFile || "")
                        .split(",")
                        .map((f: string) => f.trim());

                    // Get the file URL to delete
                    const fileUrl = fileList[Index.current];
                    if (fileUrl) {
                        try {
                            // Extract FileDirRef and FileLeafRef
                            const urlParts = fileUrl.split("/");
                            const fileLeafRef = urlParts[urlParts.length - 1];
                            const fileDirRef = fileUrl.substring(0, fileUrl.lastIndexOf("/"));

                            // Call your file deletion method
                            props.provider.deleteFileFromFolder(fileDirRef, fileLeafRef);
                        } catch (err) {
                            console.error("Error deleting file from library", err);
                        }
                    }

                    // Remove from the list
                    fileList.splice(Index.current, 1);

                    const updatedSDSFile = fileList.join(", ");
                    setNewFromObj(prevState => ({ ...prevState, SDSFile: updatedSDSFile }));

                    if (fileList.length === 0) {
                        setSDSFileDeleted(true);
                    }
                } else {
                    // fallback: clear all
                    setSDSFileDeleted(true);
                    setNewFromObj(prevState => ({ ...prevState, SDSFile: "" }));
                }
                break;

            default:
                break;
        }

        toggleHideDialogdelete();
    };




    const _onSDSDocumentClick = () => {

        SetState(prevState => ({ ...prevState, isSDSDocument: true }));
    }
    const _onSDSDLinkClick = () => {

        SetState(prevState => ({ ...prevState, isSDSDocument: false }));
    }
    const _closeDeleteConfirmation = (): void => {
        toggleHideDialogdelete();
    };

    return <>
        {isLoading && <Loader />}
        {isShowModelQR && <CustomModal isModalOpenProps={isShowModelQR} setModalpopUpFalse={() => {
            setIsShowModelQR(false);
        }} subject={"Genrating QR code ..."} message={<GenrateQRCode url={itemurlQR.current} getTheQRUrl={genratedQrcode} />} />}
        {state.isformValidationModelOpen &&
            <CustomModal
                isModalOpenProps={state.isformValidationModelOpen} setModalpopUpFalse={() => {
                    SetState(prevState => ({ ...prevState, isformValidationModelOpen: false }));
                }} subject={"Missing data"}
                message={state.validationMessage} closeButtonText={"Close"} />}
        <CustomModal isModalOpenProps={hideDialogdelete}
            setModalpopUpFalse={_closeDeleteConfirmation}
            subject={"Delete Item"}
            message={"This image will be deleted permanently, Are you sure, you want to delete it? "}
            yesButtonText="Yes"
            closeButtonText={"No"}
            onClickOfYes={_onClickDeleteFinalDelete} />
        <div className="boxCard">
            <div className="formGroup">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween">
                            <div><h1 className="mainTitle">Chemical Form</h1></div>
                            <div className="dFlex">
                                <div>
                                    <PrimaryButton className="btn btn-danger justifyright floatright"
                                        onClick={onClickClose}
                                        text="Close" />
                                </div>
                            </div>

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
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <>
                                <div className="ms-Grid-row">
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl4 ">
                                        <TextField label="Chemical Title"
                                            required
                                            className="formControl"
                                            name="chemicalTitle"
                                            placeholder="Enter Input"
                                            maxLength={255}
                                            value={newFromObj?.Title}
                                            onChange={onChemicalTitleChange}
                                        />
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl4 ">

                                        {!isAddNewProject && ImageDeleted === false &&
                                            <>
                                                <Label className="labelform">Product Photo <span className="required">*</span></Label>
                                                <div className="formControl">
                                                    <span className="cursorPointer"
                                                        onClick={() => toggleModal(newFromObj?.ProductPhoto)} >
                                                        View Image
                                                    </span>
                                                    <FontAwesomeIcon className="ml5" icon="trash-alt" onClick={() => _onClickDeleteUploadFile("ProductPhoto")} />
                                                </div>
                                            </>
                                        }
                                        {ImageDeleted === true &&
                                            <>
                                                <Label className="labelform">Product Photo<span className="required">*</span></Label>
                                                <TextField
                                                    type="file"
                                                    className="FileUpload formControl"
                                                    accept="image/*"
                                                    name="productPhoto"
                                                    onChange={fileSelectionChange} />
                                            </>
                                        }
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl4 ">
                                        <TextField label="No Of Item "
                                            required
                                            type="number"
                                            className="formControl"
                                            name="NumberOfItems"
                                            placeholder="Enter Input"
                                            maxLength={5}
                                            value={newFromObj?.NumberOfItems?.toString()}
                                            onChange={onNumberOfItemsChange}
                                        />
                                    </div>



                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl4 ">
                                        <div className="formControl">
                                            <Label className="labelform">Manufacturer<span className="required">*</span></Label>
                                            <ChemicalCommonFilter
                                                onChange={onChnageManufacturer}
                                                provider={props.provider}
                                                defaultOption={newFromObj?.Manufacturer}
                                                placeHolder="Select Manufacturer"
                                                keyTitle={'Manufacturer'}
                                                label={"Manufacturer"}
                                                header={"Add Manufacturer"}
                                                listName={ListNames.ChemicalChoices}
                                                isAddNew={true}
                                                isCloseMenuOnSelect={true}
                                            />
                                        </div>
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl4 ">
                                        <DatePicker
                                            label="SDS Date "
                                            showMonthPickerAsOverlay={true}
                                            strings={defaultDatePickerStrings}
                                            placeholder="Select a date..."
                                            ariaLabel="Select a date"
                                            isRequired={true}
                                            formatDate={onFormatDate}
                                            value={newFromObj?.SDSDate}
                                            onSelectDate={(date?: Date) => {
                                                //   const strDate = onFormatDate(date ? date : undefined);                                                    
                                                if (date !== undefined) {
                                                    setNewFromObj(prevState => ({ ...prevState, SDSDate: date }));
                                                    //setDefaultSelcetdFromItems(prevState => ({ ...prevState, SDSDate: date }));
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl4">
                                        <div className="formControl">
                                            <Label className="labelform">Hazardous<span className="required">*</span></Label>
                                            <ReactDropdown options={state.HazardousOptions}
                                                defaultOption={newFromObj?.Hazardous}
                                                isMultiSelect={false}
                                                placeholder={'Hazardous'}
                                                onChange={onChangeHazardous}
                                            />
                                        </div>
                                    </div>



                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl4 ">
                                        <div className="formControl">
                                            <Label className="labelform">Haz Class<span className="required">*</span></Label>
                                            <ChemicalCommonFilter
                                                onChange={onChangeHazClass}
                                                provider={props.provider}
                                                defaultOption={newFromObj?.HazClass}
                                                placeHolder="Select HazClass"
                                                keyTitle={'HazClass'}
                                                label={"HazClass"}
                                                header={"Add HazClass"}
                                                listName={ListNames.ChemicalChoices}
                                                isAddNew={true}
                                                isMultiSelect={true}
                                                isCloseMenuOnSelect={true}
                                            />
                                        </div>
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl4 ">
                                        <TextField label="Storage Request "
                                            className=""
                                            required
                                            name="StorageRequest"
                                            placeholder="Enter Input"
                                            maxLength={255}
                                            value={newFromObj?.StorageRequest}
                                            onChange={onChangeStorageRequest}
                                        />
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl4 ">
                                        <TextField
                                            type="number"
                                            label="pH "
                                            required
                                            className=""
                                            name="pH"
                                            maxLength={5}
                                            placeholder="Enter Input"
                                            onChange={onChangePH}
                                            value={newFromObj?.pH?.toString()} // Convert the numeric value to a string for display
                                        />
                                    </div>


                                </div>
                                <div className="ms-Grid-row">
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl4 ">
                                        <div className="formControl">
                                            <Label className="labelform">Storage Class<span className="required">*</span></Label>
                                            <ChemicalCommonFilter
                                                onChange={onChangStorageClass}
                                                provider={props.provider}
                                                defaultOption={newFromObj?.StorageClass}
                                                placeHolder="Select Storage Class"
                                                keyTitle={'StorageClass'}
                                                label={"Storage Class"}
                                                header={"Add Storage Class"}
                                                listName={ListNames.ChemicalChoices}
                                                isAddNew={true}
                                                isCloseMenuOnSelect={true}
                                            />
                                        </div>
                                    </div>


                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl4 ">
                                        <div className="formControl">
                                            <Label className="labelform">PPE Required<span className="required">*</span></Label>
                                            <ChemicalCommonFilter
                                                onChange={onChangPPERequired}
                                                provider={props.provider}
                                                defaultOption={newFromObj?.PPERequired}
                                                placeHolder="Select PPE Required"
                                                keyTitle={'PPERequired'}
                                                label={"PPE Required"}
                                                header={"Add PPE Required"}
                                                listName={ListNames.ChemicalChoices}
                                                isAddNew={true}
                                                isMultiSelect={true}
                                                isCloseMenuOnSelect={true}
                                            />
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl4 ">
                                        <div className="">
                                            <DatePicker
                                                label="Expiration Date "
                                                showMonthPickerAsOverlay={true}
                                                placeholder="Select a date..."
                                                ariaLabel="Select a date"
                                                strings={defaultDatePickerStrings}
                                                isRequired={true}
                                                formatDate={onFormatDate}
                                                value={newFromObj?.ExpirationDate}
                                                onSelectDate={(date?: Date) => {
                                                    //const strDate = onFormatDate(date ? date : undefined);
                                                    if (date !== undefined) {
                                                        setNewFromObj(prevState => ({ ...prevState, ExpirationDate: date }));
                                                        //setDefaultSelcetdFromItems(prevState => ({ ...prevState, ExpirationDate: date }));
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="ms-Grid-row">
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg8 ms-xl4">
                                        <div className="formControl">
                                            <Label className="labelform">SDS<span className="required">*</span></Label>

                                            <div>
                                                {/* Toggle Buttons */}
                                                <div className="ttadd" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                                    {!siteMasterId && (<div>
                                                        {!state.isSDSDocument ? (
                                                            <TooltipHost content="Add Document">
                                                                <FontAwesomeIcon
                                                                    className="ml-5 ddadd"
                                                                    icon="paperclip"
                                                                    onClick={_onSDSDocumentClick}
                                                                />
                                                            </TooltipHost>
                                                        ) : (
                                                            <TooltipHost content="Add Link">
                                                                <FontAwesomeIcon
                                                                    className="ml-5 ddadd"
                                                                    icon="link"
                                                                    onClick={_onSDSDLinkClick}
                                                                />
                                                            </TooltipHost>
                                                        )}
                                                    </div>)}
                                                    <div>
                                                        {/* Add Link button moved here */}
                                                        <TooltipHost content="Add another link">
                                                            <FontAwesomeIcon
                                                                icon="plus"
                                                                className="cursorPointer ddadd"
                                                                onClick={handleAddLinkInput}
                                                                title="Add another link"
                                                            />
                                                        </TooltipHost>
                                                    </div>
                                                </div>

                                                {/* --- Always show linkInputs --- */}
                                                <div style={{ marginTop: 10 }}>
                                                    {linkInputs.map((link, index) => {
                                                        const trimmedLink = link.trim();

                                                        return (
                                                            <div
                                                                key={index}
                                                                style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}
                                                            >
                                                                {/* If editing and link is non-empty, show clickable link */}
                                                                {(siteMasterId && siteMasterId > 0) && trimmedLink !== "" ? (
                                                                    <span
                                                                        className="cursorPointer"
                                                                        onClick={() => window.open(trimmedLink, "_blank")}
                                                                        style={{ textDecoration: "underline", color: "#0078d4", flex: 1 }}
                                                                    >
                                                                        {trimmedLink.split("/").pop() || `Link ${index + 1}`}
                                                                    </span>
                                                                ) : (
                                                                    <TextField
                                                                        value={link}
                                                                        onChange={(_, newValue) => handleLinkChange(index, newValue || "")}
                                                                        styles={{ root: { flex: 1 } }}
                                                                        placeholder={`Link ${index + 1}`}
                                                                    />
                                                                )}

                                                                {/* Delete icon (only if more than 1 link) */}
                                                                {linkInputs.length > 1 && (
                                                                    <FontAwesomeIcon
                                                                        icon="trash-alt"
                                                                        onClick={() => handleDeleteLinkInput(index)}
                                                                        style={{ marginLeft: 10, cursor: "pointer", color: "red" }}
                                                                    />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>


                                                {/* --- Conditionally show document upload section --- */}
                                                {(state.isSDSDocument || siteMasterId) && (
                                                    <div style={{ marginTop: 10 }}>
                                                        {/* Show existing files */}
                                                        {!isAddNewProject && SDSFileDeleted === false && (newFromObj?.SDSFile || "")
                                                            .split(",")
                                                            .filter((f: any) => f.trim() !== "")
                                                            .map((fileUrl: string, index: number) => {
                                                                const trimmedUrl = fileUrl.trim();
                                                                const fileName = trimmedUrl.split("/").pop();

                                                                return (
                                                                    <div key={index} style={{ marginBottom: 8 }}>
                                                                        <span
                                                                            className="cursorPointer"
                                                                            onClick={() => toggleFileModal(trimmedUrl)}
                                                                            style={{ textDecoration: "underline", color: "#0078d4" }}
                                                                        >
                                                                            {fileName || `View File ${index + 1}`}
                                                                        </span>
                                                                        <FontAwesomeIcon
                                                                            className="ml5"
                                                                            icon="trash-alt"
                                                                            onClick={() => _onClickDeleteUploadFile("SDSFile", index)}
                                                                            style={{ marginLeft: 10, cursor: "pointer", color: "red" }}
                                                                        />
                                                                    </div>
                                                                );
                                                            })}

                                                        {/* Show file upload control for new or replaced files */}
                                                        {(SDSFileDeleted || true || siteMasterId) && (
                                                            <TextField
                                                                type="file"
                                                                className="FileUpload formControl"
                                                                name="SDSFile"
                                                                onChange={SDSFileSelectionChange}
                                                                multiple
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                        </div>
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                        <TextField label="Notes "
                                            required
                                            multiline rows={3}
                                            className="formControl"
                                            name="QCNotes"
                                            placeholder="Notes"
                                            maxLength={500}
                                            value={newFromObj?.QCNotes}
                                            onChange={onChangeQCNotes}
                                        />
                                    </div>
                                </div>

                                <div className="ms-Grid-row">
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                        <PrimaryButton
                                            style={{ margin: "5px", marginTop: "10px" }}
                                            className="btn btn-primary"
                                            text={state.isAddNewChemical ? 'Save' : "Update"}
                                            onClick={onClickSaveOrUpdate}
                                        //onClick={state.isAddNewChemical ? onClickSave : onClickUpdate}
                                        />
                                        <PrimaryButton
                                            style={{ margin: "5px", marginTop: "10px" }}
                                            className="btn btn-danger"
                                            text="cancel"
                                            onClick={onClickClose}
                                        />

                                    </div>
                                </div>
                            </>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <Panel
            isOpen={showModal}
            onDismiss={() => toggleModal("")}
            type={PanelType.extraLarge}
            headerText="Image View">
            <img src={imageURL} style={{ width: "100%", height: "85vh" }} />
        </Panel>
        {showFileModal === true &&
            <ViewDocument
                isViewDocument={undefined}
                isOpen={showFileModal}
                hideDoc={() => { toggleFileModal('') }}
                FileRef={SDSFileURL}
                context={props.context}
            />
        }
    </>;
};
