/* eslint-disable max-lines */
/* eslint-disable react/self-closing-comp */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IQuayCleanState } from "../../QuayClean";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import CustomModal from "../../CommonComponents/CustomModal";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { DatePicker, DefaultButton, DialogFooter, FocusTrapZone, IColumn, Label, Layer, Link, Overlay, Panel, PanelType, Popup, PrimaryButton, SelectionMode, Slider, TextField, Toggle, TooltipHost, defaultDatePickerStrings, mergeStyleSets } from "@fluentui/react";
import { ListNames, OperatorTypeEnum, UserActionEntityTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { IReactSelectOptionProps } from "../../../../../Interfaces/IReactSelectOptionProps";
import { Loader } from "../../CommonComponents/Loader";
import { INewEditAssociatedTeam } from "../../../../../Interfaces/IAssociatedTeam";
import { toastService } from "../../../../../Common/ToastService";
import { GetSortOrder, UserActivityLog, getCAMLQueryFilterExpression, getConvertedDate, logGenerator, mapSingleValue, onFormatDate, saveNewThumbNailImage, saveThumbNailImage } from "../../../../../Common/Util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { ValidateForm } from "../../../../../Common/Validation";
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import moment from "moment";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import CamlBuilder from "camljs";
import Select, { ActionMeta } from 'react-select';
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import { TeamEmployeeFilter } from "../../../../../Common/Filter/TeamEmployeeFilter";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { QuayCleanChoices } from "../../../../../Common/QuayCleanChoices";
import { DataType, DateFormat } from "../../../../../Common/Constants/CommonConstants";
import { ICamlQueryFilter, FieldType, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { ISelectedZoneDetails } from "../../../../../Interfaces/ISelectedZoneDetails";
import { SiteFilter } from "../../../../../Common/Filter/SiteFilter";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

export interface IAddNewMemberProps {
    provider: IDataProvider;
    manageComponentView(componentProp: IQuayCleanState): any;
    isModelOpen: boolean;
    closeModel(): any;
    context: WebPartContext;
    siteMasterId: any;
    qCState: string;
    qCStateId: any;
    EmailArray: any;
    associatedEditobj: any;
    isNewUserAdd: boolean;
    loginUserRoleDetails: any;
    selectedZoneDetails?: ISelectedZoneDetails
    isEdtFlag?: boolean
    isReload?: boolean;
    CloseModelNewMember(): any
}

export interface IAddNewMemberState {
    isModelOpen: boolean;
    userNameOptions: IReactSelectOptionProps[];
    userRoleOptions: IReactSelectOptionProps[];
}



export const AddNewMember = (props: IAddNewMemberProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [imageURL, setImageURL] = React.useState("");
    const [showModal, setShowModal] = React.useState(false);
    // const [isAvailableImage, setIsAvailableImage] = React.useState<boolean>(!!props.associatedEditobj.attachmentURl ? true : false);
    const toggleModal = (imgURL: string | undefined) => {
        setImageURL(imgURL ? imgURL : "");
        imageURL;
        setShowModal(!showModal);
    };
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, currentUserRoleDetail } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const canvasWidth = 490;
    const [showModal2, setShowModal2] = React.useState(false);
    const [selectedPDFs, setSelectedPDFs] = React.useState<any[]>([])
    const [isCall, setisCall] = React.useState(true);
    const openModal = () => { setShowModal2(true); };
    const closeModal = () => { setShowModal2(false); };
    const [fileURL, setFileURL] = React.useState<string>('');
    const Fileref: any = React.useRef(null);
    const [selectedDocument, setselectedDocument] = React.useState<any[]>([]);
    const tooltipId = useId('tooltip');
    const [validationMessage, setValidationMessage] = React.useState<any>();
    const [DocumentTypeOptions, setDocumentTypeOptions] = React.useState<any[]>([]);
    const [isformValidationModelOpen, setIsformValidationModelOpen] = React.useState<boolean>(false);
    const [isErrorModelOpen, setIsErrorModelOpen] = React.useState<boolean>(false);
    const [selectedSkillArraySet, setSelectedSkillArraySet] = React.useState<any[]>(props?.associatedEditobj?.SkillSet);
    const [selectedCertificate, setSelectedCertificate] = React.useState<any>("");
    const [DocumentDataList, setDocumentDataList] = React.useState<any[]>([]);
    let [TempDocumentDataList, setTempDocumentDataList] = React.useState<any[]>([]);
    const [DocumentFolderNameByEmpId, setDocumentFolderNameByEmpId] = React.useState<any>(null);
    const [viewWarningDocument, setviewWarningDocument] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [isPopupVisibleDoc, { setTrue: showPopupDoc, setFalse: hidePopupDoc }] = useBoolean(false);
    const [selectedSkillSet, setSelectedSkillSet] = React.useState<any>();
    const [serviceDueDate, setServiceDueDate] = React.useState<any>(null);
    const [SkillSetData, setSkillSetData] = React.useState<any[]>([]);
    const [ErrorExpiryDate, setErrorExpiryDate] = React.useState<boolean>(false);
    const [ErrorSkillSet, setErrorSkillSet] = React.useState<boolean>(false);
    const [ErrorCN, setErrorCN] = React.useState<boolean>(false);
    const [updateCurrentID, setupdateCurrentID] = React.useState<number>(props?.associatedEditobj.id);
    const [originalImageData, setOriginalImageData] = React.useState<ImageData | null>(null);
    const [isShowRestBlur, setIsShowRestBlur] = React.useState<boolean>(false);
    const [userForm, setUserForm] = React.useState<INewEditAssociatedTeam>({
        ATRole: !!props.associatedEditobj.aTRole ? props.associatedEditobj.aTRole : "",
        Notes: !!props.associatedEditobj.Notes ? props.associatedEditobj.Notes : "",
        ATUserName: !!props.associatedEditobj.aTUserName ? props.associatedEditobj.aTUserName : "",
        Email: !!props.associatedEditobj.Email ? props.associatedEditobj.Email : "",
        UserId: !!props.associatedEditobj.UserId ? Number(String(props.associatedEditobj.UserId).replace(/,/g, '').trim()) : "",
        OperatorType: !!props.associatedEditobj.OperatorType ? props.associatedEditobj.OperatorType : "",
        userImageAttachment: !!props.associatedEditobj.attachmentURl ? props.associatedEditobj.attachmentURl : "",
        profilerImageUrl: !!props.associatedEditobj.attachmentURl ? props.associatedEditobj.attachmentURl : "",
        Location: !!props.associatedEditobj.Location ? props.associatedEditobj.Location : [],
        DateOfBirth: !!props.associatedEditobj.DateOfBirth ? props.associatedEditobj.DateOfBirth : undefined,
        isDOBExist: !!props.associatedEditobj?.DateOfBirth,
        SiteName: !!props.associatedEditobj.SiteName ? props.associatedEditobj.SiteName : ""
    });
    const [EmailExist, setEmailExist] = React.useState<boolean>(false);
    const [DisableUpdate, setDisableUpdate] = React.useState<boolean>(false);
    let skillsetUpdateId = React.useRef<any>(null);
    let SkillSetItems = React.useRef<any[]>([]);
    let skillset = React.useRef<any[]>([]);
    let certificatearray = React.useRef<any[]>([]);
    const [title, settitle] = React.useState<string>("");
    const [state, setState] = React.useState<IAddNewMemberState>({
        isModelOpen: props.isModelOpen,
        userNameOptions: [],
        userRoleOptions: []
    });
    const [StateId, setStateId] = React.useState<any>(0);
    const [IsSubLocation, setIsSubLocation] = React.useState<boolean>(false);
    const [isAvailableImage, setIsAvailableImage] = React.useState<boolean>(false);
    const [width, setWidth] = React.useState<string>("450px");

    const [image, setImage] = React.useState<string | null>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);
    const [updateSkillSet, setupdateSkillSet] = React.useState(false);

    const [isDrawing, setIsDrawing] = React.useState(false);
    const [start, setStart] = React.useState<any>({ x: 0, y: 0 });
    const [blurStrength, setBlurStrength] = React.useState(10); // Default blur strength
    const historyRef = React.useRef<ImageData[]>([]);
    const historyIndexRef = React.useRef<number>(-1);
    const [current, setCurrent] = React.useState<any>({ x: 0, y: 0 }); // <-- current point
    const [blurHistory, setBlurHistory] = React.useState<any[]>([]); // <-- stores history of blurs
    const [isImage, setIsImage] = React.useState<boolean>(false);
    const [quaycleanEmployeeListData, setQuaycleanEmployeeListData] = React.useState<any[]>([]);
    const [EmployeeOptions, setEmployeeOptions] = React.useState<any[]>([]);
    const [keyEmployeeUpdate, setKeyEmployeeUpdate] = React.useState<number>(Math.random());
    const [keyUpdate, setKeyUpdate] = React.useState<any>(0);

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("550px");
        }
    }, [window.innerWidth]);

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
            // minHeight: "375px",
            left: '50%',
            maxWidth: '600px',
            maxHeight: '90%',
            width: width,
            overflowY: 'auto',
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
        }
    });

    const [selectedEmployee, setSelectedEmployee] = React.useState<number | null>(null);
    const [selectedSite, setSelectedSite] = React.useState<any>("");
    const handleEmployeeChange = (EmployeeId: any, option?: any) => {
        setDisableUpdate(false);
        setIsLoading(true);
        const isEmailMatched = props?.EmailArray?.includes(EmployeeId.key.trim());
        // if (props?.associatedEditobj?.Email === EmployeeId.key && props.associatedEditobj.SiteName == selectedSite) {
        //     setEmailExist(false);
        // } else {
        //     setEmailExist(isEmailMatched);
        // }
        SkillSetItems.current = [];
        if (EmployeeId) {

            const employeeId = parseInt(EmployeeId?.value);
            const filterEmployeeData = quaycleanEmployeeListData?.find((item: any) => item.Id === employeeId);
            if (filterEmployeeData?.SkillsArray.length > 0) {
                SkillSetItems.current = filterEmployeeData?.SkillsArray;
            } else {
                setSkillSetData([]);
            }

            getOptionList();
        }
        if (selectedSite) {
            const queryOptions: IPnPQueryOptions = {
                select: ["ID"],
                filter: `UserId eq ${EmployeeId?.value} and SiteNameId eq ${selectedSite} and IsDeleted ne 1`,
                listName: ListNames.SitesAssociatedTeam,
                top: 1
            };
            props.provider.getItemsByQuery(queryOptions).then((results: any[]) => {
                if (results && results.length > 0) {
                    setEmailExist(true);
                } else {
                    setEmailExist(false);
                }
                // getOptionList();
            }).catch((error) => {
                console.log(error);
                // getOptionList();
            });
        }
        const updatedText = EmployeeId?.items?.Notes?.replace(" bold ", " <strong>bold</strong> ");
        setSelectedEmployee(EmployeeId.value);
        setIsAvailableImage(!!EmployeeId?.items?.imgURl ? true : false)
        getEmployeeDateOfBirth(EmployeeId.value)
        setSelectedPDFs(!!EmployeeId?.items?.imgURl ? EmployeeId?.items?.selectedpdf : [])
        setUserForm(prevState => ({
            ...prevState,
            Title: EmployeeId.text,
            UserId: EmployeeId.value,
            ATUserName: EmployeeId.text,
            Email: EmployeeId.key,
            Notes: updatedText,
            userImageAttachment: !!EmployeeId?.items?.imgURl ? EmployeeId?.items?.selectedpdf : "",
            profilerImageUrl: !!EmployeeId?.items?.imgURl ? EmployeeId?.items?.imgURl : ""
        }));
        setIsLoading(false);
    };

    const onSiteChange = (selectedOption: any) => {
        setSelectedSite(selectedOption?.value);
        setSelectedEmployee(null);
        setUserForm(prev => ({ ...prev, Location: [] }));
        setEmailExist(false);
        setSkillSetData([]);
    };

    // If you need to update it later based on some condition
    React.useEffect(() => {
        if (props?.associatedEditobj?.attachmentURl) {
            const attachmentUrl = props.associatedEditobj.attachmentURl;
            if (attachmentUrl && attachmentUrl.includes("UserBlank")) {
                setIsAvailableImage(false);
                console.log("IsAvailable: false");
            } else {
                setIsAvailableImage(true);
                console.log("IsAvailable: true");
            }
        }
        // if (props?.associatedEditobj?.aTUserName != "" && props?.associatedEditobj?.Email === "") {
        //     setDisableUpdate(true);
        // } else {
        //     setDisableUpdate(false);
        // }

    }, [props.associatedEditobj.attachmentURl]);

    // const [selectedOperatorType, setSelectedOperatorType] = React.useState<any[]>([]);
    // const onOperatorTypeChange = (OperatorType: any): void => {
    //     setSelectedOperatorType(OperatorType);
    //     setUserForm(prevState => ({ ...prevState, OperatorType: OperatorType }));
    // };
    const [selectedOperatorType, setSelectedOperatorType] = React.useState<string>("");

    const onClear = () => {
        settitle("");
        setselectedDocument([]);
        setSelectedOperatorType("");
        setDocumentDataList([]);
        setFileURL("");
        setSkillSetData([]);
        userForm.ATRole = "";
        userForm.Notes = "";
        userForm.ATUserName = "";
        userForm.Email = "";
        userForm.OperatorType = "";
        userForm.userImageAttachment = "";
        userForm.profilerImageUrl = "";

    }
    /**
     * Change Operator Type dropdown to Machine Operator toggle onchange.
     * Updated by Trupti on 18/9/2025.
     * @param checked 
     */
    const onOperatorTypeToggleChange = (checked?: boolean): void => {
        const operatorType = checked ? OperatorTypeEnum.MachineOperator : '';
        setSelectedOperatorType(operatorType);
        setUserForm(prev => ({ ...prev, OperatorType: operatorType }));
    };

    // const onChangeUserName = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
    //     setUserForm(prevState => ({ ...prevState, Title: newValue, ATUserName: newValue }));
    // };
    const onSkillSetChangeSingle = (skillsetId: any): void => {
        setSelectedSkillSet(skillsetId);
        if (skillsetId === undefined) {
            setErrorSkillSet(true);
        }
        else {
            setErrorSkillSet(false);
        }
    };

    const onChangeTitle = (event: any): void => {
        settitle(event.target.value);
        if (event.target.value === "") {
            setErrorCN(true);
        } else {
            setErrorCN(false);
        }
    };
    const onSkillSetChange = (selectedOptions: IReactSelectOptionProps[], actionMeta: ActionMeta<any>) => {
        const selectedValues = selectedOptions.map(option => option.value);
        setSelectedSkillArraySet(selectedValues);
    };

    const onCertificateChange = (CertificateId: string, name: any): void => {
        setSelectedCertificate(CertificateId);
    };
    const onChangeRole = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setUserForm(prevState => ({ ...prevState, ATRole: newValue }));
    };

    const onChangeLocation = (value: any[]) => {
        setUserForm(prevState => ({ ...prevState, Location: value }));
    }

    const onChangeNotes = (newText: string): string => {
        const updatedText = newText.replace(" bold ", " <strong>bold</strong> ");
        setUserForm(prevState => ({ ...prevState, Notes: updatedText }));
        return updatedText;
    };

    const onCloseModel = () => {
        onClear();
        props.closeModel();
        // setState(prevState => ({ ...prevState, isModelOpen: false }));
    };

    const onCloseclickModel = () => {
        onClear();
        props.CloseModelNewMember();
        // setState(prevState => ({ ...prevState, isModelOpen: false }));
    };
    const documentSelectionChange = (e: any) => {
        let files = e.target.files;
        setselectedDocument(files);
    };



    const DocumentsValidateForm = () => {
        setValidationMessage([]);
        let messages: any = [];
        let file = selectedDocument;
        let fileUploadBlob = { name: !!file.length ? file[0].name : "", content: !!file.length ? file[0] : "" };
        if (!selectedCertificate) {
            messages.push("Certificate type is required");
        } else {
            if (!selectedDocument.length) {
                messages.push("Certificate file is required");
            } else {
                if (fileUploadBlob.name.split('.')[fileUploadBlob.name.split('.').length - 1] === 'xls' || fileUploadBlob.name.split('.')[fileUploadBlob.name.split('.').length - 1] === 'xlsx' || fileUploadBlob.name.split('.')[fileUploadBlob.name.split('.').length - 1] === 'ods' || fileUploadBlob.name.split('.')[fileUploadBlob.name.split('.').length - 1] === 'zip' || fileUploadBlob.name.split('.')[fileUploadBlob.name.split('.').length - 1] === 'html') {
                    // messages.push("Upload only png/jpg and pdf");
                }
            }
        }
        setValidationMessage(messages);
        return messages.length > 0;
    };

    function changeFileName(file: File, newFileName: string): File {
        const extension = file.name.split('.').pop();
        return new File([file], newFileName + '.' + extension, { type: file.type, lastModified: file.lastModified });

    }
    // const onClick_DocumentSave = (evt: any) => {
    //     if (DocumentsValidateForm()) {
    //         setIsformValidationModelOpen(true);
    //         evt.preventDefault(); setDocumentFolderNameByEmpId;
    //     }
    //     else {
    //         if (isImage) {
    //             const canvas = canvasRef.current;
    //             if (!canvas) return;
    //             let formData = new FormData();
    //             canvas.toBlob(async (blob) => {
    //                 if (!blob) return;

    //                 // Convert Blob to File (optional, if needed)
    //                 const file = new File([blob], "blurred-image.png", { type: "image/png" });
    //                 const uploadfile: IFileWithBlob = {
    //                     file: blob,
    //                     name: "blurred-image.png",
    //                     overwrite: true
    //                 };
    //                 // Create FormData for Upload

    //                 formData.append("file", file);

    //                 // const item: any = {
    //                 //     Title: "Test Attachment",
    //                 // };
    //                 // props.provider.createItem(item, 'AAA').then((item: any) => {
    //                 //     props.provider.uploadAttachmentToList('AAA', uploadfile, item.Id).then(() => {
    //                 //         console.log("Upload Success");
    //                 //     }).catch((err: any) => console.log(err));
    //                 // }).catch(err => console.log(err));
    //                 console.log("formData", formData);

    //                 let mainfile = selectedDocument;
    //                 const fileUploadBlob: any = { name: file.name, content: file };
    //                 let DocumentData = {
    //                     Certificates: !!selectedCertificate ? selectedCertificate.value : "",
    //                 };
    //                 let newFilename = selectedCertificate.value.replace(" ", "") + "-" + moment().format("DDMMYYYYhhmmss");
    //                 const updatedFile = changeFileName(file, newFilename);
    //                 const fileUploadBlob1: any = { name: updatedFile.name, content: updatedFile };
    //                 // console.log(fileUploadBlob1);
    //                 certificatearray.current.push({
    //                     fileUploadBlob: fileUploadBlob1.content,
    //                     UploadURL: props.context.pageContext.site.serverRelativeUrl + "/" + ListNames.CertificatesLibrary,
    //                     DocumentData: DocumentData,
    //                     SiteNameId: props.siteMasterId
    //                 });
    //                 setSelectedCertificate("");
    //                 setImage(null);
    //                 setIsImage(false);
    //                 setselectedDocument([]);

    //                 const userData = {
    //                     ATUser: [],
    //                     ATUserId: updateCurrentID,
    //                     ATUserName: "",
    //                     Email: "",
    //                     Certificates: selectedCertificate.value,
    //                     CertificatesName: fileUploadBlob1.name,
    //                     ID: updateCurrentID + 1,
    //                     LinkingUrl: "",
    //                     ServerRelativeUrl: ""
    //                 };
    //                 TempDocumentDataList.push(userData);
    //                 setDocumentDataList([]);

    //                 Fileref.current.value = "";
    //                 hidePopupDoc();
    //             }, "image/png");
    //         } else {
    //             let file = selectedDocument;
    //             const fileUploadBlob: any = { name: file[0].name, content: file[0] };
    //             let DocumentData = {
    //                 Certificates: !!selectedCertificate ? selectedCertificate.value : "",
    //             };
    //             let newFilename = selectedCertificate.value.replace(" ", "") + "-" + moment().format("DDMMYYYYhhmmss");
    //             const updatedFile = changeFileName(file[0], newFilename);
    //             const fileUploadBlob1: any = { name: updatedFile.name, content: updatedFile };
    //             // console.log(fileUploadBlob1);
    //             certificatearray.current.push({
    //                 fileUploadBlob: fileUploadBlob1.content,
    //                 UploadURL: props.context.pageContext.site.serverRelativeUrl + "/" + ListNames.CertificatesLibrary,
    //                 DocumentData: DocumentData,
    //                 SiteNameId: props.siteMasterId
    //             });
    //             setSelectedCertificate("");
    //             setselectedDocument([]);

    //             const userData = {
    //                 ATUser: [],
    //                 ATUserId: updateCurrentID,
    //                 ATUserName: "",
    //                 Email: "",
    //                 Certificates: selectedCertificate.value,
    //                 CertificatesName: fileUploadBlob1.name,
    //                 ID: updateCurrentID + 1,
    //                 LinkingUrl: "",
    //                 ServerRelativeUrl: ""
    //             };
    //             TempDocumentDataList.push(userData);
    //             setDocumentDataList([]);
    //             Fileref.current.value = "";
    //             hidePopupDoc();
    //         }





    //     }
    // };

    const errorMessageGenrate = (item: any): void => {
        const error: any[] = [];
        let errormessage: any;
        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                switch (key) {
                    case "ATUserName":
                        error.push(<div>Employee Name is required</div>);
                        break;
                    case "ATRole":
                        error.push(<div>Role is required</div>);
                        break;
                    // case "userImageAttachment":
                    //     error.push(<div>Client image is required</div>);
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

    const onClickOfYes = async () => {
        try {
            let toastMessage: string = "";
            let validationFields;
            let isValidateRecord;

            validationFields = {
                "requiredText": ['ATUserName', 'ATRole']
            };
            if (!!userForm)
                isValidateRecord = ValidateForm(userForm, validationFields);

            let error: any;
            let isVaild: boolean;
            if (!!isValidateRecord) {
                if (isValidateRecord?.isValid == false) {
                    isVaild = isValidateRecord?.isValid;
                    error = errorMessageGenrate(isValidateRecord);
                } else {
                    isVaild = true;
                }
                setValidationMessage(error);
                setIsformValidationModelOpen(!isVaild);
            } else {
                isVaild = false;
                error = <ul><li className="errorPoint">Please fill the form  </li></ul>;
                setValidationMessage(error);
                setIsformValidationModelOpen(!isVaild);
            }

            if (isVaild) {
                if (!selectedSite) {
                    setIsformValidationModelOpen(true);
                    setValidationMessage(<ul><li className="errorPoint">Please select a site.</li></ul>);
                    return;
                }
                setIsLoading(true);
                const toastId = toastService.loading('Loading...');

                let skillJsonString = "";
                if (SkillSetItems.current?.length > 0) {
                    const skillDataToSave = SkillSetItems.current.map((skill: any) => ({
                        SkillName: skill?.Title || "",
                        ExpiryDate: skill?.ExpiryDate ? moment(skill?.ExpiryDate, 'DD-MM-YYYY').format('YYYY-MM-DD') : "",
                        DocumentNumber: skill?.CardNumber || ""
                    }));

                    skillJsonString = JSON.stringify(skillDataToSave);
                }

                let skillSetObj = {
                    DateOfBirth: userForm?.DateOfBirth ? moment(userForm.DateOfBirth).format('YYYY-MM-DD') : '',
                    Skills: skillJsonString
                }
                await provider.updateItemWithPnP(skillSetObj, ListNames.QuaycleanEmployee, userForm.UserId);
                if (props.isNewUserAdd) {
                    toastMessage = 'New Member added successfully!';
                    const currentDateTimeString = moment().format('YYYYMMDDHHmmss');
                    const currentDateTimeNumber = Number(currentDateTimeString);
                    // let valArray = userForm?.OperatorType?.split(', ').map((item: any) => item?.trim());
                    /** Change for Opertor Type dropdown to toggle. */
                    let valArray = userForm?.OperatorType ? [userForm.OperatorType] : [];
                    const item: INewEditAssociatedTeam = {
                        Title: userForm?.ATUserName,
                        ATUserName: userForm?.ATUserName,
                        UserId: userForm?.UserId,
                        Email: userForm?.Email,
                        ATRole: userForm?.ATRole,
                        OperatorType: valArray,
                        // IsDailyOperator: userForm?.IsDailyOperator ? userForm.IsDailyOperator : false,
                        SiteNameId: selectedSite,
                        Notes: userForm?.Notes,
                        Index: currentDateTimeNumber,
                        Location: !!userForm?.Location ? userForm.Location : [],

                    };

                    // const siteUrl: string = props.context.pageContext.web.absoluteUrl + `/${props.qCState}`
                    let createdId: number = 0;
                    let apiArray: any = [];
                    await props.provider.createItem(item, ListNames.SitesAssociatedTeam).then(async (item: any) => {
                        createdId = item.data.Id;
                        const logObj = {
                            UserName: currentUserRoleDetail?.title,
                            SiteNameId: selectedSite, // Match index dynamically
                            ActionType: "Create",
                            EntityType: UserActionEntityTypeEnum.AssignedTeam,
                            EntityId: createdId, // Use res dynamically
                            EntityName: userForm?.ATUserName, // Match index dynamically
                            Details: `Add Assigned Team Member`,
                            StateId: props?.qCStateId
                        };
                        // let DateOfBirth = {
                        //     DateOfBirth: userForm?.DateOfBirth ? new Date(userForm.DateOfBirth) : null
                        // }
                        // await provider.updateItemWithPnP(DateOfBirth, ListNames.QuaycleanEmployee, userForm.UserId);
                        void UserActivityLog(provider, logObj, currentUserRoleDetail);
                        // if (SkillSetItems.current.length > 0) {
                        //     const dataWithAssociatedTeamId = SkillSetItems.current.map(item => ({
                        //         ...item,
                        //         AssociatedTeamId: createdId
                        //     }));


                        //     dataWithAssociatedTeamId.forEach(async (skillitem: any) => {
                        //         await props.provider.createItem(skillitem, ListNames.SkillSet).then(async (item: any) => {
                        //             onClickCancel();
                        //         }).catch(err => console.log(err));
                        //     });
                        // } else {

                        // }
                        // certificatearray.current?.map((cftItem: any) => {
                        //     let DocumentData1 = {
                        //         ATUserId: !!item ? item.data.ID : "",
                        //         Certificates: !!cftItem.DocumentData?.Certificates ? cftItem.DocumentData?.Certificates : "",
                        //         SiteNameId: selectedSite
                        //     };
                        //     apiArray.push(props.provider.uploadFilewithSiteUrl(cftItem.fileUploadBlob, cftItem.UploadURL, true, DocumentData1));
                        // });
                        await Promise.all(apiArray);
                        await props.provider.updateItem({ Notes: userForm?.Notes }, ListNames.QuaycleanEmployee, Number(userForm.UserId))

                        const hasNoImage = !userForm?.userImageAttachment || (!isAvailableImage) && (Array.isArray(userForm?.userImageAttachment) && userForm?.userImageAttachment?.length === 0);
                        if (hasNoImage) {
                            await props.provider.updateItem({ Profile: "" }, ListNames.QuaycleanEmployee, Number(userForm.UserId));
                            toastService.updateLoadingWithSuccess(toastId, toastMessage);
                            onClear();
                            onCloseModel();
                            setIsLoading(false);
                        } else if (Array.isArray(userForm?.userImageAttachment) && (!isAvailableImage) && userForm?.userImageAttachment?.length > 0) {
                            await Promise.all(userForm?.userImageAttachment?.map((file: any) =>
                                props.provider.uploadImageToImageColumn(file, ListNames.QuaycleanEmployee, "Profile", Number(userForm.UserId))
                            ));
                            toastService.updateLoadingWithSuccess(toastId, toastMessage);
                            onClear();
                            onCloseModel();
                            setIsLoading(false);
                        } else {
                            toastService.updateLoadingWithSuccess(toastId, toastMessage);
                            onClear();
                            onCloseModel();
                            setIsLoading(false);
                        }
                    }).catch(err => console.log(err));

                } else {
                    toastMessage = 'Client Deatil Updated successfully!';
                    // let valArray = userForm?.OperatorType?.split(', ').map((item: any) => item?.trim());
                    /** Change for Opertor Type dropdown to toggle */
                    let valArray = userForm?.OperatorType ? [userForm.OperatorType] : [];
                    const item: INewEditAssociatedTeam = {
                        Title: userForm?.ATUserName,
                        ATUserName: userForm?.ATUserName,
                        UserId: userForm?.UserId,
                        Email: userForm?.Email,
                        ATRole: userForm?.ATRole,
                        OperatorType: valArray,
                        // IsDailyOperator: userForm?.IsDailyOperator ? userForm.IsDailyOperator : false,
                        SiteNameId: selectedSite,
                        Notes: userForm?.Notes,
                        Location: !!userForm?.Location ? userForm.Location : [],
                    };
                    let apiArray: any = [];
                    await props.provider.updateItemWithPnPSiteUrl(item, ListNames.SitesAssociatedTeam, updateCurrentID).then(async (items: any) => {
                        const logObj = {
                            UserName: currentUserRoleDetail?.title,
                            SiteNameId: selectedSite, // Match index dynamically
                            ActionType: "Update",
                            EntityType: UserActionEntityTypeEnum.AssignedTeam,
                            EntityId: updateCurrentID, // Use res dynamically
                            EntityName: userForm?.ATUserName, // Match index dynamically
                            Details: `Update Assigned Team Member`,
                            StateId: props?.qCStateId
                        };

                        // let DateOfBirth = {
                        //     DateOfBirth: userForm?.DateOfBirth ? new Date(userForm.DateOfBirth) : undefined
                        // }
                        // await provider.updateItemWithPnP(DateOfBirth, ListNames.QuaycleanEmployee, userForm.UserId);
                        void UserActivityLog(provider, logObj, currentUserRoleDetail);

                        // if (SkillSetItems.current.length > 0) {
                        //     const dataWithAssociatedTeamId = SkillSetItems.current.map(item => ({
                        //         ...item,
                        //         AssociatedTeamId: updateCurrentID
                        //     }));


                        //     dataWithAssociatedTeamId.forEach(async (skillitem: any) => {
                        //         await props.provider.createItem(skillitem, ListNames.SkillSet).then(async (item: any) => {
                        //             onClickCancel();
                        //         }).catch(err => console.log(err));
                        //     });
                        // } else {

                        // }
                        await props.provider.updateItem({ Notes: userForm?.Notes }, ListNames.QuaycleanEmployee, Number(userForm.UserId))

                        // Check if image was deleted (empty string or empty array)
                        const hasNoImage = !userForm?.userImageAttachment || (!isAvailableImage) && (Array.isArray(userForm?.userImageAttachment) && userForm?.userImageAttachment?.length === 0);

                        if (hasNoImage) {
                            // Clear Profile column if image was deleted
                            await props.provider.updateItem({ Profile: "" }, ListNames.QuaycleanEmployee, Number(userForm.UserId));

                            onClear();
                            onCloseModel();
                            setIsLoading(false);
                        } else if (Array.isArray(userForm?.userImageAttachment) && (!isAvailableImage) && userForm?.userImageAttachment?.length > 0) {
                            // Upload all new images
                            await Promise.all(userForm.userImageAttachment.map((file: any) =>
                                props.provider.uploadImageToImageColumn(file, ListNames.QuaycleanEmployee, "Profile", Number(userForm.UserId))
                            ));

                            onClear();
                            onCloseModel();
                            setIsLoading(false);
                        } else {
                            onClear();
                        }
                        // certificatearray.current?.map((cftItem: any) => {
                        //     let DocumentData1 = {
                        //         ATUserId: !!updateCurrentID ? updateCurrentID : "",
                        //         Certificates: !!cftItem.DocumentData?.Certificates ? cftItem.DocumentData?.Certificates : "",
                        //         SiteNameId: selectedSite
                        //     };
                        //     apiArray.push(props.provider.uploadFilewithSiteUrl(cftItem.fileUploadBlob, cftItem.UploadURL, true, DocumentData1));
                        // });
                        // await Promise.all(apiArray);
                        toastService.updateLoadingWithSuccess(toastId, toastMessage);
                        setTimeout(() => {
                            onClear();
                            setIsLoading(false);
                            onCloseModel();
                        }, 2000);

                    });
                }
            }
            setIsAvailableImage(false);


        } catch (error) {
            setIsErrorModelOpen(true);
            setIsLoading(false);
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  onClickOfYes",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onClickOfYes AddNewMember"
            };
            void logGenerator(props.provider, errorObj);
        }

    };

    const _onClickDeleteUserImage = async () => {
        setIsAvailableImage(false);
        setIsLoading(true);
        // const siteUrl: string = props.context.pageContext.web.absoluteUrl + `/${props.qCState}`
        // const attachemntName: string = props.associatedEditobj.attachmentURl.split('/').pop();
        const attachemntName: string = props.associatedEditobj?.attachmentURl?.split('/')?.pop();
        // if (updateCurrentID) {
        //     await props.provider.deleteAttachment(ListNames.SitesAssociatedTeam, updateCurrentID, attachemntName);
        // }
        // if (Number(props?.associatedEditobj?.UserId) > 0) {
        //     await props.provider.deleteAttachment(ListNames.QuaycleanEmployee, Number(props?.associatedEditobj?.UserId), attachemntName);
        //     await props.provider.updateItem({ Profile: JSON.stringify({ serverRelativeUrl: "" }) }, ListNames.SitesAssociatedTeam, Number(props?.associatedEditobj?.UserId));
        // }

        setUserForm(prevState => ({ ...prevState, userImageAttachment: "", profilerImageUrl: "" }));
        setIsLoading(false);
    };

    const pdfSelectionChange = (e: any) => {
        console.log(e);

        // let isVaild = uploadFileValidation(e);

        e.preventDefault();
        e.stopPropagation();
        if (e.target.files && e.target.files[0]) {
            const files = e.target.files;
            const selectedPDFs: IFileWithBlob[] = [];
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    let nameWithoutSpace = files[i].name.replace(/[\s.]+/g, '');
                    let extension = files[i].name.split('.').pop();
                    const timestamp = new Date().getTime();
                    nameWithoutSpace = nameWithoutSpace.replace(extension, "");
                    const file = files[i];
                    const CreatorName = `${timestamp}_${nameWithoutSpace}.${extension}`;
                    const selectedPDF: IFileWithBlob = {
                        file: file,
                        name: CreatorName,
                        // folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/EquipmentsImage`,
                        folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/EmployeePhoto`,
                        overwrite: true
                    };
                    selectedPDFs.push(selectedPDF);
                }
            }
            setUserForm(prevState => ({ ...prevState, userImageAttachment: selectedPDFs }));
        }

    };

    // const DeleteDocument = (Data: any) => {
    //     let attachments = [...DocumentDataList];
    //     setDocumentDataList([]);
    //     certificatearray.current = certificatearray.current.filter(item => item.DocumentData.Certificates !== Data.Certificates);
    //     if (Data.LinkingUrl == "") {
    //         const index = attachments.indexOf(Data);
    //         if (index !== -1) {
    //             attachments.splice(index, 1);
    //         }
    //         setDocumentDataList(attachments);
    //         if (attachments.length > 0) {
    //             let filterOption = attachments.map((res: any) => {
    //                 let test = DocumentTypeOptions?.filter((item: any) => item.value === res.Certificates && res.ATUserId === updateCurrentID);
    //                 return test[0];
    //             });
    //             let removeNull = filterOption.filter(item => item != undefined);
    //             const spfxArray = removeNull.map(item => ({ ...item, isDisabled: false }));
    //             const mergedArray = spfxArray.concat(DocumentTypeOptions);
    //             const filteredArray = mergedArray.filter((item, index, array: any) => {
    //                 return item.isDisabled === false || array.findIndex((i: any) => i.key === item.key) === index;
    //             });
    //             let uniqueKeys: any = {};
    //             const filteredArrayuniq = filteredArray.filter(card => {
    //                 if (uniqueKeys[card.key]) {
    //                     return false;
    //                 } else {
    //                     uniqueKeys[card.key] = true;
    //                     return true;
    //                 }
    //             });
    //             // Iterate through the DocumentTypeOptions array

    //             // eslint-disable-next-line no-return-assign

    //             // eslint-disable-next-line no-return-assign
    //             let newData = DocumentTypeOptions.filter(r => r.value == Data.Certificates).map(t => t.isDisabled = false);

    //             setDocumentTypeOptions(DocumentTypeOptions);
    //         }
    //     } else {
    //         const lastSlashIndex = Data.ServerRelativeUrl.lastIndexOf('/');
    //         const directoryPath = Data.ServerRelativeUrl.slice(0, lastSlashIndex);
    //         const filename = Data.ServerRelativeUrl.slice(lastSlashIndex + 1);
    //         props.provider.deleteFileFromFolder(directoryPath, filename);
    //         setTimeout(() => {
    //         }, 1500);
    //     }
    // };


    const EditSkillSet = async (Data: any) => {
        setupdateSkillSet(true);
        // if (Data) {
        //     if (Data.ID) {
        //         skillsetUpdateId.current = Data.ID;
        //         // await props.provider.deleteItem(ListNames.SkillSet, Data.ID);
        //         // getSkillSet();
        //         const defaultDateStr = Data?.ExpiryDate;
        //         const [day, month, year] = defaultDateStr.split("-").map(Number);
        //         const parsedDate = new Date(year, month - 1, day);
        //         let option = {
        //             key: Data?.Title,
        //             label: Data?.Title,
        //             text: Data?.Title,
        //             value: Data?.Title,
        //         }
        //         setSelectedSkillSet(option);
        //         setServiceDueDate(parsedDate);
        //         settitle(Data?.CardNumber);
        //         showPopup();
        //     } else {
        //         skillsetUpdateId.current = null;
        //         const defaultDateStr = Data?.ExpiryDate;
        //         const [day, month, year] = defaultDateStr.split("-").map(Number);
        //         const parsedDate = new Date(year, month - 1, day);
        //         let option = {
        //             key: Data?.Title,
        //             label: Data?.Title,
        //             text: Data?.Title,
        //             value: Data?.Title,
        //         }
        //         setSelectedSkillSet(option);
        //         setServiceDueDate(parsedDate);
        //         settitle(Data?.CardNumber);
        //         showPopup();

        //     }
        // } else {

        // }
        skillsetUpdateId.current = null;
        const defaultDateStr = Data?.ExpiryDate;
        const [day, month, year] = defaultDateStr.split("-").map(Number);
        const parsedDate = new Date(year, month - 1, day);
        let option = {
            key: Data?.Title,
            label: Data?.Title,
            text: Data?.Title,
            value: Data?.Title,
        }
        setSelectedSkillSet(option);
        setServiceDueDate(parsedDate);
        settitle(Data?.CardNumber);
        showPopup();
    };

    const DeleteSkillSet = async (Data: any) => {
        if (Data) {
            // if (Data.ID) {
            //     // await props.provider.deleteItem(ListNames.SkillSet, Data.ID);
            //     // getSkillSet();
            //     SkillSetItems.current = SkillSetItems.current.filter(
            //         (item) => item.Title !== Data.Title
            //     );
            //     let skillJsonString = "";
            //     if (SkillSetItems.current?.length > 0) {
            //         const skillDataToSave = SkillSetItems.current?.map((skill: any) => ({
            //             SkillName: skill?.Title || "",
            //             ExpiryDate: skill?.ExpiryDate ? moment(skill?.ExpiryDate, 'DD-MM-YYYY').format('YYYY-MM-DD') : "",
            //             DocumentNumber: skill?.CardNumber || ""
            //         }));

            //         skillJsonString = JSON.stringify(skillDataToSave);
            //     }

            //     let skillSetObj = {
            //         // DateOfBirth: userForm?.DateOfBirth ? new Date(userForm.DateOfBirth) : null,
            //         Skills: skillJsonString
            //     }
            //     await provider.updateItemWithPnP(skillSetObj, ListNames.QuaycleanEmployee, userForm.UserId);
            //     setSkillSetData([]);
            //     getOptionList();
            // } else {
            //     SkillSetItems.current = SkillSetItems.current.filter(
            //         (item) => item.Title !== Data.Title
            //     );
            //     setSkillSetData([]);
            //     // getSkillSet();
            //     // SkillSetColumn();
            //     getOptionList();
            // }
            setIsLoading(true);
            const updatedSkillSet = SkillSetItems.current.filter(
                (item) => item.Title !== Data.Title
            );
            SkillSetItems.current = updatedSkillSet;
            const filterUpdate = updatedSkillSet.filter((itm: any) => itm?.isNew === false);
            let skillJsonString = "";
            if (filterUpdate?.length > 0) {
                const skillDataToSave = filterUpdate?.map((skill: any) => ({
                    SkillName: skill?.Title || "",
                    ExpiryDate: skill?.ExpiryDate ? moment(skill?.ExpiryDate, 'DD-MM-YYYY').format('YYYY-MM-DD') : "",
                    DocumentNumber: skill?.CardNumber || ""
                }));

                skillJsonString = JSON.stringify(skillDataToSave);
            }

            let skillSetObj = {
                Skills: skillJsonString
            }
            await provider.updateItemWithPnP(skillSetObj, ListNames.QuaycleanEmployee, userForm.UserId);

            setSkillSetData([]);
            getOptionList();
            setIsLoading(false);
        } else {
            let datalist = SkillSetItems.current.filter((item: any) => item.Title !== Data?.Title);
            SkillSetItems.current = datalist;
            // setSkillSetItems(datalist);
            // getSkillSet();
            getOptionList();
            setIsLoading(false);
        }

    };

    const SkillSetColumn = () => {
        const column: any[] = [
            { key: "key1", name: 'Skill Set', fieldName: 'Title', isResizable: true, minWidth: 120, maxWidth: 240, isSortingRequired: true },
            { key: "key3", name: 'Card Number', fieldName: 'CardNumber', isResizable: true, minWidth: 120, maxWidth: 240, isSortingRequired: true },
            {
                key: 'key2', name: 'Expiry Date', fieldName: 'ExpiryDate', minWidth: 120, maxWidth: 240, isResizable: false,
                onRender: (item: any) => {
                    return (
                        <div>{item.ExpiryDate}</div>
                    );
                }
            }, {
                key: "ACTION", name: 'ACTION', fieldName: 'ID', isResizable: true, minWidth: 80, maxWidth: 100,
                onRender: ((itemID: any) => {
                    return <>
                        <div className='dflex'>
                            <div>
                                <Link onClick={() => DeleteSkillSet(itemID)} className="actionBtn btnDanger iconSize tooltipcls">
                                    <TooltipHost content="Are you sure, you want to delete this file?" id={tooltipId}>
                                        <FontAwesomeIcon icon="trash-alt" />
                                    </TooltipHost>
                                </Link>
                            </div>   <div>
                                <Link onClick={() => EditSkillSet(itemID)} className="actionBtn btnEdit iconSize tooltipcls report-dd-ml-1">
                                    <TooltipHost content="Edit Skillset" id={tooltipId}>
                                        <FontAwesomeIcon icon="edit" />
                                    </TooltipHost>
                                </Link>
                            </div>
                        </div>
                    </>;
                })
            },
        ];
        return column;
    };

    const getSkillSet = () => {
        try {
            let filter = `AssociatedTeamId eq 0`;
            if (updateCurrentID) {
                filter = `AssociatedTeamId eq ${updateCurrentID}`;
            }
            let queryOptions: IPnPQueryOptions = {
                listName: ListNames.SkillSet,
                select: ["Id", "Title", "ExpiryDate", "CardNumber"],
                filter: filter,
            };
            props.provider.getItemsByQuery(queryOptions).then((results: any) => {
                if (!!results) {
                    let SkillSetData: any = results.map((data: any) => {
                        let SkillSetItem: any = {
                            ID: data.ID,
                            Title: !!data.Title ? data.Title : "",
                            ExpiryDate: !!data.ExpiryDate ? getConvertedDate(data.ExpiryDate) : "",
                            ExpiryDateConvert: !!data.ExpiryDate ? getConvertedDate(data.ExpiryDate) : "",
                            CardNumber: !!data.CardNumber ? data.CardNumber : "",
                        };
                        return SkillSetItem;
                    });
                    if (!props.isNewUserAdd) {
                        setSkillSetData(SkillSetData);
                        skillset.current = SkillSetData;
                    }
                    getOptionList();
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (error) {
            console.log(error);
            setIsLoading(false);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  getSkillSet",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect GetSkillSet"
            };
            void logGenerator(props.provider, errorObj);
        }
    };


    const _onItemSelected = (item: any): void => {
    };

    // React.useEffect(() => {
    //     if (DocumentTypeOptions.length > 0) {
    //         // Removed _getDocumentData call
    //     }
    // }, [DocumentTypeOptions]);

    // React.useEffect(() => {
    //     if (props?.associatedEditobj && DocumentTypeOptions.length > 0)
    //         // Removed _getDocumentData call
    // }, [props?.associatedEditobj]);

    React.useEffect(() => {
        if (props.isNewUserAdd)
            onClear();
    }, [props.isNewUserAdd]);


    React.useEffect(() => {
        try {
            void (async () => {
                setIsLoading(true);
                if (props.isNewUserAdd) {
                    setUserForm({});
                    onClear();
                    setIsAvailableImage(false);
                    // getDocumentTypeOptions();
                    getOptionList();
                    setIsLoading(false);
                    // getSkillSet();
                } else {
                    // getSkillSet();
                    // SkillSetItems.current = [];
                    // if (updateCurrentID) {
                    //     const employeeId = updateCurrentID;
                    //     const filterEmployeeData = quaycleanEmployeeListData?.find((item: any) => item.Id === employeeId);
                    //     if (filterEmployeeData?.SkillsArray.length > 0) {
                    //         SkillSetItems.current = filterEmployeeData?.SkillsArray;
                    //     } else {
                    //         setSkillSetData([]);
                    //     }

                    //     getOptionList();
                    // }
                    // getDocumentTypeOptions();
                    setIsLoading(false);
                }

            })();
        } catch (error) {

            setIsErrorModelOpen(true);
            setIsLoading(false);
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect Add new Memeber"
            };
            void logGenerator(props.provider, errorObj);
        }
    }, []);

    // const [Options, setOptions] = React.useState<any>();
    const [Options, setOptions] = React.useState([]);

    // const formatDates = (data: any) => {
    //     return data.map((item: any) => {
    //         if (item.ExpiryDate) {
    //             return {
    //                 ...item,
    //                 ExpiryDate: moment(item.ExpiryDate).format(DateFormat)
    //             };
    //         }
    //         return item;
    //     });
    // };

    const getOptionList = async (): Promise<void> => {
        setOptions([]);
        let dropvalue: any = [];
        await props.provider.choiceOption(ListNames.SitesAssociatedTeam, "SkillSet").then(async (response) => {
            response.map((value: any) => {
                dropvalue.push({ value: value, key: value, text: value, label: value });
            });
            if (SkillSetItems.current.length > 0) {
                let proOptions: any = getDisabledOptions(SkillSetItems.current, dropvalue);
                setOptions(proOptions);
                // const formattedData = await formatDates(SkillSetItems.current);
                setSkillSetData(SkillSetItems.current);
                setKeyUpdate(Math.random());
            } else {
                setOptions(dropvalue);
            }
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        if (!props.isNewUserAdd && props.associatedEditobj.SiteNameId) {
            setSelectedSite(props.associatedEditobj.SiteNameId);
        }
    }, []);

    React.useEffect(() => {
        if (selectedSite) {
            try {
                const select = ["ID,Title,QCStateId,SubLocation"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    filter: `ID eq '${selectedSite}'`,
                    listName: ListNames.SitesMaster,
                };
                props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                    if (!!results) {
                        const SiteData: any = results.map((data) => {
                            return (
                                {
                                    ID: data.ID,
                                    Title: data.Title,
                                    StateId: !!data.QCStateId ? data.QCStateId : null,
                                    SubLocation: !!data.SubLocation ? data.SubLocation : false
                                }
                            );
                        });
                        setIsSubLocation(SiteData[0]?.SubLocation);
                        setStateId(SiteData[0].StateId);
                    }
                }).catch((error) => {
                    console.log(error);
                    setIsLoading(false);
                });
            } catch (ex) {
                console.log(ex);
            }
        }
    }, [selectedSite]);

    React.useEffect(() => {
        if (serviceDueDate !== null) {
            setErrorExpiryDate(false);
        }

    }, [serviceDueDate]);

    const onClickSkillSet = () => {
        showPopup();
    };
    const getDisabledOptions = (data: any, option: any) => {
        const disabledTitles = data.map((item: any) => item.Title);
        return option.map((opt: any) => ({
            ...opt,
            disabled: disabledTitles.includes(opt.value)
        }));
    };

    const onClickSave = async (type: any) => {

        if (!serviceDueDate || !selectedSkillSet?.key?.trim() || !title?.trim()) {
            if (!serviceDueDate) {
                setErrorExpiryDate(true);
            } else {
                setErrorExpiryDate(false);
            }

            if (!selectedSkillSet?.key?.trim()) {
                setErrorSkillSet(true);
            } else {
                setErrorSkillSet(false);
            }

            if (!title?.trim()) {
                setErrorCN(true);
            } else {
                setErrorCN(false);
            }
        } else {
            if (type === "Save") {
                const item: any = {
                    Title: selectedSkillSet.key?.trim(),
                    ExpiryDate: moment(serviceDueDate).format('DD-MM-YYYY'),
                    SiteNameId: props.siteMasterId,
                    CardNumber: title?.trim(),
                    SkillName: selectedSkillSet.key?.trim(),
                    isNew: true,
                    SiteName: selectedSite
                };
                SkillSetItems.current.push(item);
                // const processedOptions = getDisabledOptions(SkillSetItems.current, Options);
                getOptionList();
                setServiceDueDate(null);
                setSelectedSkillSet(null);
                hidePopup();
                settitle("");
                setupdateSkillSet(false);
            } else {
                // const item: any = {
                //     ExpiryDate: serviceDueDate,
                //     CardNumber: title
                // };
                // if (skillsetUpdateId.current) {
                //     await props.provider.updateItemWithPnP(item, ListNames.SkillSet, Number(skillsetUpdateId.current));
                //     getSkillSet();
                // }
                setIsLoading(true);
                const updatedItems = SkillSetItems.current.map(item => {
                    if (item.Title === selectedSkillSet.key) {
                        return {
                            ...item,
                            // ExpiryDate: serviceDueDate,
                            ExpiryDate: moment(serviceDueDate).format('DD-MM-YYYY'),
                            CardNumber: title?.trim()
                        };
                    }
                    return item;
                });
                SkillSetItems.current = updatedItems;
                let skillJsonString = "";
                const filterUpdate = updatedItems.filter((itm: any) => itm?.isNew === false);

                if (filterUpdate?.length > 0) {
                    const skillDataToSave = filterUpdate?.map((skill: any) => ({
                        SkillName: skill?.Title?.trim() || "",
                        ExpiryDate: skill?.ExpiryDate ? moment(skill?.ExpiryDate, 'DD-MM-YYYY').format('YYYY-MM-DD') : "",
                        DocumentNumber: skill?.CardNumber || ""
                    }));

                    skillJsonString = JSON.stringify(skillDataToSave);
                }

                let skillSetObj = {
                    Skills: skillJsonString
                }
                await provider.updateItemWithPnP(skillSetObj, ListNames.QuaycleanEmployee, userForm.UserId);

                hidePopup();
                getOptionList();
                settitle("");
                setServiceDueDate(null);
                setSelectedSkillSet(null);
                setIsLoading(false);
                setupdateSkillSet(false);
                // alert('test')
            }
        }

    };
    const onClickAddCertificate = () => {
        showPopupDoc();
    };

    const onClickCancel = () => {
        hidePopup();
        hidePopupDoc();
        setServiceDueDate(null);
        settitle("");
        setSelectedSkillSet(null);
        setSelectedCertificate("")
        setErrorExpiryDate(false);
        setErrorSkillSet(false);
        setErrorCN(false);
        setImage("")
        setIsImage(false)
        setupdateSkillSet(false);
    };

    const handleFileUpload = (event: any) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        const isImageType = file.type.startsWith('image/');
        setIsImage(isImageType);
        if (isImageType) {
            setselectedDocument(event.target.files);
            reader.onload = (event: any) => {
                setBlurHistory([])
                setIsShowRestBlur(false);
                const img: any = new Image();
                img.onload = () => {
                    setImage(img);

                    const canvas: any = canvasRef.current;
                    const ctx = canvas.getContext("2d");
                    const aspectRatio = img.width / img.height;
                    const canvasHeight = canvasWidth / aspectRatio;

                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;


                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);


            const canvas = canvasRef.current;
            if (!canvas) return;

            canvas.toBlob(async (blob) => {
                if (!blob) return;

                // Convert Blob to File (optional, if needed)
                const file = new File([blob], "blurred-image.png", { type: "image/png" });
                let uploadfile: IFileWithBlob = {
                    file: blob,
                    name: "blurred-image.png",
                    overwrite: true
                };
                // Create FormData for Upload
                const formData = new FormData();
                formData.append("file", file);
                let fileobj: IFileWithBlob[] = [];
                fileobj.push(uploadfile);
                // setselectedDocument(fileobj);
            }, "image/png");
        } else {
            setImage(null)
            let files = event.target.files;
            setselectedDocument(files);
        }


    };

    React.useEffect(() => {
        if (!image || !canvasRef.current) return;
        const FIXED_WIDTH = 504;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.src = image;
        img.onload = () => {
            const scaleFactor = FIXED_WIDTH / img.width;
            const newHeight = img.height * scaleFactor;

            canvas.width = FIXED_WIDTH;
            canvas.height = newHeight;

            ctx.drawImage(img, 0, 0, FIXED_WIDTH, newHeight);
            ctxRef.current = ctx;
        };
    }, [image]);

    const handleMouseDown = (e: any) => {
        if (canvasRef.current) {


            const rect = canvasRef.current.getBoundingClientRect();
            setStart({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
            setIsDrawing(true);
        }
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing) return;

        const canvas: any = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCurrent({ x, y });

        if (image) {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height); // redraw image for each move
        }

        drawPreviousBlurs(ctx); // keep previous blurs
        drawSelectionRect(ctx, start, { x, y });
    };
    const drawPreviousBlurs = (ctx: any) => {
        // Draw all previous blurs
        blurHistory.forEach(({ x, y, width, height, blurredData }) => {
            ctx.putImageData(blurredData, x, y);
        });
    };

    const drawSelectionRect = (ctx: any, start: any, end: any) => {
        const x = start.x;
        const y = start.y;
        const width = end.x - start.x;
        const height = end.y - start.y;
        ctx.strokeStyle = "#f0eaea";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    };

    const handleMouseUp = () => {
        setIsDrawing(false);

        const canvas: any = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const x = Math.min(start.x, current.x);
        const y = Math.min(start.y, current.y);
        const width = Math.abs(current.x - start.x);
        const height = Math.abs(current.y - start.y);

        if (!image || width === 0 || height === 0) return;

        // Create temp canvas to blur region
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext("2d") as any;

        tempCtx.filter = `blur(${blurStrength}px)`; // Apply dynamic blur intensity
        tempCtx.drawImage(
            canvas,
            x, y, width, height,
            0, 0, width, height
        );

        const blurred = tempCtx.getImageData(0, 0, width, height);
        ctx.putImageData(blurred, x, y);

        // Save blur history
        setIsShowRestBlur(true);
        setBlurHistory([
            ...blurHistory,
            { x, y, width, height, blurredData: blurred, blurStrength },
        ]);
    };

    // Undo action
    const undoLastBlur = () => {
        if (blurHistory.length === 0) return;

        // Remove the last blur
        const newBlurHistory = [...blurHistory];
        newBlurHistory.pop();
        setBlurHistory(newBlurHistory);

        // Redraw the canvas without the last blur
        const canvas: any = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height); // clear the canvas

        // Redraw the image
        if (image) {
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        }

        // Redraw remaining blurred regions
        drawPreviousBlurs(ctx);
    };

    // Redo action
    const handleRedo = () => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current += 1;
            restoreFromHistory();
        }
    };

    // Restore canvas from history
    const restoreFromHistory = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;

        ctx.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
    };


    React.useEffect(() => {
        if (image && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx: any = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            setOriginalImageData(imageData);
        }
    }, [image]);

    const resetBlur = () => {
        if (!originalImageData || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx: any = canvas.getContext("2d");
        ctx.putImageData(originalImageData, 0, 0);
        setIsShowRestBlur(false);
        setBlurHistory([]); // Clear blur history as well
    };

    const getEmployeeDateOfBirth = async (EmpId: any) => {
        if (!StateId) return;

        const queryOptions: IPnPQueryOptions = {
            select: ["Id", "DateOfBirth"],
            filter: `Id eq ${!!EmpId ? EmpId : null} and IsDeleted ne 1 and Inactive ne 1`,
            listName: ListNames.QuaycleanEmployee
        };

        try {
            const response = await props.provider.getItemsByQuery(queryOptions);
            if (response && response.length > 0) {
                const dob = response[0].DateOfBirth ? new Date(response[0].DateOfBirth) : null;
                setUserForm(prev => ({
                    ...prev,
                    DateOfBirth: dob,
                    isDOBExist: !!response[0].DateOfBirth
                }));
            } else {
                setUserForm(prev => ({
                    ...prev,
                    DateOfBirth: null,
                    isDOBExist: false
                }));
            }

        } catch (error) {
            console.error("Error fetching Date of Birth:", error);
        }
    };

    // const getEmployeenameList = async (): Promise<void> => {
    //     const camlQuery = new CamlBuilder()
    //         .View([
    //             "Id",
    //             "FirstName",
    //             "LastName",
    //             "StateId",
    //             "State",
    //             "Email",
    //             "Phone",
    //             "IsDeleted",
    //             "Skills",
    //             'Profile',
    //             "Notes",
    //             "DateOfBirth"
    //         ])
    //         .Scope(CamlBuilder.ViewScope.RecursiveAll)
    //         .RowLimit(5000, true)
    //         .Query();

    //     const filterFields: ICamlQueryFilter[] = [
    //         {
    //             fieldName: "IsDeleted",
    //             fieldValue: true,
    //             fieldType: FieldType.Boolean,
    //             LogicalType: LogicalType.NotEqualTo
    //         },
    //         {
    //             fieldName: "Inactive",
    //             fieldValue: true,
    //             fieldType: FieldType.Boolean,
    //             LogicalType: LogicalType.NotEqualTo
    //         }
    //     ];

    //     const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
    //     camlQuery.Where().All(categoriesExpressions);
    //     const pnpQueryOptions: IPnPCAMLQueryOptions = {
    //         listName: ListNames.QuaycleanEmployee,
    //         queryXML: camlQuery.ToString(),
    //         pageToken: "",
    //         pageLength: 100000
    //     }
    //     const localResponse = await props.provider.getItemsInBatchByCAMLQuery(pnpQueryOptions);
    //     const results = localResponse?.Row;

    //     let employeeList = results.filter((data: any) =>
    //         data.State.some((state: any) => state.lookupId === StateId)
    //     );
    //     let dropvalue: any = [];

    //     employeeList.map(async (Employee: any) => {
    //         let FullName = Employee.FirstName + " " + Employee.LastName;
    //         let imgURL: string = "";
    //         let selectedpdf: any[] = [];
    //         if (!!Employee?.Profile && Employee?.Profile?.fileName) {
    //             // imgURl = `${props.context.pageContext.web.absoluteUrl}/Lists/${ListNames.QuaycleanEmployeeInt}/Attachments/${Number(Employee.ID)}/${Employee.Profile.fileName}`
    //             // const response = await fetch(imgURl);
    //             // const blob = await response.blob();
    //             // const file = new File([blob], "image.png", { type: blob.type });
    //             imgURL = `${props.context.pageContext.web.absoluteUrl}/Lists/${ListNames.QuaycleanEmployeeInt}/Attachments/${Number(Employee.ID)}/${Employee.Profile.fileName}`;
    //             const response = await fetch(imgURL);
    //             const blob = await response.blob();

    //             // extract file name from URL
    //             const fileName = imgURL.substring(imgURL.lastIndexOf('/') + 1);

    //             // convert blob to File with extracted name
    //             const file = new File([blob], fileName, { type: blob.type });
    //             const selectedPDF: IFileWithBlob = {
    //                 file: file,
    //                 name: fileName,
    //                 // folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/EquipmentsImage`,
    //                 folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/Shared Documents`,
    //                 overwrite: true
    //             };
    //             selectedpdf.push(selectedPDF)

    //         }

    //         dropvalue.push({ value: Employee.ID, key: Employee.Email, text: FullName, label: FullName, items: { ...Employee, imgURl: imgURL, selectedpdf: selectedpdf } });
    //     });

    //     const employeeSkillData = results?.map((item: any) => {
    //         let skillsArray: any[] = [];

    //         const skills = item?.Skills?.trim();
    //         if (skills) {
    //             try {
    //                 const skillsData = JSON.parse(skills);
    //                 skillsArray = skillsData?.map((skill: any) => ({
    //                     Title: skill?.SkillName || "",
    //                     ExpiryDate: skill?.ExpiryDate ? moment(skill?.ExpiryDate).format('DD-MM-YYYY') : "",
    //                     ExpiryDateConvert: skill?.ExpiryDate ? getConvertedDate(skill.ExpiryDate) : "",
    //                     CardNumber: skill?.DocumentNumber || "",
    //                     isNew: false
    //                 })) || [];

    //             } catch (error) {
    //                 console.error("Invalid JSON for item ID:", item?.ID, error);
    //             }
    //         }

    //         return {
    //             ...item,
    //             Id: Number(item.ID),
    //             SkillsArray: skillsArray,
    //         };
    //     });
    //     SkillSetItems.current = [];
    //     if (props?.associatedEditobj?.UserId) {
    //         const employeeId = props?.associatedEditobj?.UserId;
    //         const filterEmployeeData = employeeSkillData?.find((item: any) => item.Id === employeeId);
    //         if (filterEmployeeData?.SkillsArray.length > 0) {
    //             SkillSetItems.current = filterEmployeeData?.SkillsArray;
    //         } else {
    //             setSkillSetData([]);
    //         }

    //         getOptionList();
    //     }
    //     // setSkillSetData(employeeSkillData);
    //     setQuaycleanEmployeeListData(employeeSkillData);
    //     setEmployeeOptions(dropvalue);
    //     setKeyEmployeeUpdate(Math.random())
    // };

    const getEmployeenameList = async (): Promise<void> => {
        const camlQuery = new CamlBuilder()
            .View([
                "Id",
                "FirstName",
                "LastName",
                "StateId",
                "State",
                "Email",
                "Phone",
                "IsDeleted",
                "Skills",
                "Profile",
                "Notes",
                "DateOfBirth"
            ])
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(5000, true)
            .Query();

        const filterFields: ICamlQueryFilter[] = [
            {
                fieldName: "IsDeleted",
                fieldValue: true,
                fieldType: FieldType.Boolean,
                LogicalType: LogicalType.NotEqualTo
            },
            {
                fieldName: "Inactive",
                fieldValue: true,
                fieldType: FieldType.Boolean,
                LogicalType: LogicalType.NotEqualTo
            }
        ];

        const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
        camlQuery.Where().All(categoriesExpressions);

        const pnpQueryOptions: IPnPCAMLQueryOptions = {
            listName: ListNames.QuaycleanEmployee,
            queryXML: camlQuery.ToString(),
            pageToken: "",
            pageLength: 100000
        };

        const localResponse = await props.provider.getItemsInBatchByCAMLQuery(pnpQueryOptions);
        const results = localResponse?.Row || [];

        // filter by state
        const employeeList = results.filter((data: any) =>
            data.State?.some((state: any) => state.lookupId === StateId)
        );

        const dropvalue: any[] = [];

        // Use Promise.all to wait for all async image fetches
        await Promise.all(
            employeeList.map(async (Employee: any) => {
                const FullName = `${Employee.FirstName} ${Employee.LastName}`;
                let imgURL = "";
                let selectedpdf: IFileWithBlob[] = [];

                if (Employee?.Profile?.fileName) {
                    imgURL = `${props.context.pageContext.web.absoluteUrl}/Lists/${ListNames.QuaycleanEmployeeInt}/Attachments/${Number(Employee.ID)}/${Employee.Profile.fileName}`;

                    // const response = await fetch(imgURL);
                    // const blob = await response.blob();

                    // // extract file name from URL
                    // const fileName = imgURL.substring(imgURL.lastIndexOf("/") + 1);

                    // // convert blob to File with extracted name
                    // const file = new File([blob], fileName, { type: blob.type });

                    // selectedpdf.push({
                    //     file: file,
                    //     name: fileName,
                    //     folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/EmployeePhoto`,
                    //     overwrite: true
                    // });
                }
                if (Employee?.Profile?.serverRelativeUrl) {
                    imgURL = Employee?.Profile?.serverRelativeUrl
                }

                dropvalue.push({
                    value: Employee.ID,
                    key: Employee.Email,
                    text: FullName,
                    label: FullName,
                    items: { ...Employee, imgURl: imgURL, selectedpdf: [] }
                });
            })
        );

        // Process employee skill data
        const employeeSkillData = results.map((item: any) => {
            let skillsArray: any[] = [];
            const skills = item?.Skills?.trim();

            if (skills) {
                try {
                    const skillsData = JSON.parse(skills);
                    skillsArray =
                        skillsData?.map((skill: any) => ({
                            Title: skill?.SkillName || "",
                            ExpiryDate: skill?.ExpiryDate ? moment(skill.ExpiryDate).format("DD-MM-YYYY") : "",
                            ExpiryDateConvert: skill?.ExpiryDate ? getConvertedDate(skill.ExpiryDate) : "",
                            CardNumber: skill?.DocumentNumber || "",
                            isNew: false
                        })) || [];
                } catch (error) {
                    console.error("Invalid JSON for item ID:", item?.ID, error);
                }
            }

            return {
                ...item,
                Id: Number(item.ID),
                SkillsArray: skillsArray
            };
        });

        // Handle skill set data for specific employee
        SkillSetItems.current = [];
        if (props?.associatedEditobj?.UserId) {
            const employeeId = props.associatedEditobj.UserId;
            const filterEmployeeData = employeeSkillData.find((item: any) => item.Id == employeeId);

            if (filterEmployeeData?.SkillsArray?.length > 0) {
                SkillSetItems.current = filterEmployeeData.SkillsArray;
            } else {
                setSkillSetData([]);
            }

            getOptionList();
        }

        // Finally update state after all async work done
        setQuaycleanEmployeeListData(employeeSkillData);
        setEmployeeOptions(dropvalue);
        setKeyEmployeeUpdate(Math.random());
    };

    React.useEffect(() => {
        if (StateId > 0) {
            getEmployeenameList();
        }

    }, [StateId]);

    const validateDate = (date: string): boolean => {
        // Moment's strict parsing ensures the date matches exactly the "DD-MM-YYYY" format
        const parsedDate = moment(date, DateFormat, true); // true for strict parsing
        return parsedDate.isValid();
    };

    // React.useEffect(() => {
    //     getEmployeeDateOfBirth(props?.associatedEditobj?.UserId);
    // }, [StateId]);

    const modelContent = <>
        <div className="ms-SPLegacyFabricBlock">
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6 ">
                        <Label className="formLabel">
                            Site<span className="required">*</span>
                        </Label>
                        {!props.isNewUserAdd ? (
                            <TextField
                                value={userForm.SiteName || ""}
                                disabled
                            />
                        ) : (
                            <SiteFilter
                                isPermissionFiter={true}
                                loginUserRoleDetails={props.loginUserRoleDetails}
                                selectedSite={selectedSite}
                                onSiteChange={onSiteChange}
                                provider={props.provider}
                                isRequired={true}
                                AllOption={false}
                                selectedSites={selectedZoneDetails}
                                isDisabled={false}
                            />
                        )}
                    </div>
                    {/* <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6 ">
                        <Label>Employee Name<span className="required">*</span></Label>
                        {EmployeeOptions?.length > 0 &&
                            <TeamEmployeeFilter
                                key={keyEmployeeUpdate}
                                selectedEmployee={selectedEmployee ?? 0} // Pass the selected employee ID
                                defaultOption={!props.isNewUserAdd ? props?.associatedEditobj?.UserId : null}
                                onEmployeeChange={handleEmployeeChange} // Handle employee selection
                                provider={props.provider} // Pass the provider instance
                                isRequired={true}
                                siteNameId={selectedSite} // Replace with actual site name ID if needed
                                AllOption={false} // Include an "All" option
                                qCState={StateId} // Example state filter
                                placeholder="Select Employees"
                                employeeOptions={EmployeeOptions || []}
                                isDisabled={!props.isNewUserAdd ? true : !selectedSite}
                            // isCloseMenuOnSelect={false}
                            />}
                        {EmailExist &&
                            <span className="required mt-1">The client already exists.</span>}
                    </div> */}
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6">
                        <Label>
                            Employee Name<span className="required">*</span>
                        </Label>

                        {!props.isNewUserAdd ? (
                            <TextField
                                value={props.associatedEditobj?.aTUserName || ""}
                                disabled
                            />
                        ) : (
                            <TeamEmployeeFilter
                                key={keyEmployeeUpdate}
                                selectedEmployee={selectedEmployee ?? 0} // Pass the selected employee ID
                                defaultOption={!props.isNewUserAdd ? props?.associatedEditobj?.UserId : null}
                                onEmployeeChange={handleEmployeeChange} // Handle employee selection
                                provider={props.provider} // Pass the provider instance
                                isRequired={true}
                                siteNameId={selectedSite} // Replace with actual site name ID if needed
                                AllOption={false} // Include an "All" option
                                qCState={StateId} // Example state filter
                                placeholder="Select Employees"
                                employeeOptions={EmployeeOptions || []}
                                isDisabled={!props.isNewUserAdd ? true : !selectedSite}
                            // isCloseMenuOnSelect={false}
                            />
                        )}
                        {EmailExist && (
                            <span className="required mt-1">
                                The Employee already exists.
                            </span>
                        )}
                    </div>

                </div>
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6">
                        <TextField label="Role"
                            required
                            className="formControl"
                            value={userForm?.ATRole}
                            name="RoleName"
                            placeholder="Enter Role"
                            onChange={onChangeRole}
                        />
                    </div>
                    {IsSubLocation && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6">
                        <Label>Location</Label>
                        <QuayCleanChoices
                            isMultiSelect={true}
                            onChange={onChangeLocation}
                            provider={props.provider}
                            defaultOption={(userForm.Location as any) || []}
                            siteNameId={selectedSite}
                            placeHolder="Select Asset Location"
                            keyTitle={""}
                            isAssetLocation={true}
                            isCloseMenuOnSelect={false}
                            label={""}
                            header={""} />
                    </div>}
                    {/* <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6">
                        <Label>Date of Birth</Label>
                        {userForm?.DateOfBirth ? (
                            <TextField
                                value={onFormatDate(userForm?.DateOfBirth)}
                                disabled
                                className="formControl"
                            />
                        ) : (
                            <DatePicker
                                allowTextInput
                                ariaLabel="Select a date."
                                value={userForm.DateOfBirth}
                                className="formControl"
                                onSelectDate={(date?: Date) => setUserForm(prev => ({ ...prev, DateOfBirth: date }))}
                                formatDate={onFormatDate}
                                strings={defaultDatePickerStrings}
                            />
                        )}
                    </div> */}

                </div>
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg4">
                        <Label className="formLabel">Date of Birth</Label>
                        <DatePicker
                            allowTextInput
                            placeholder="Select a date Of Birth"
                            ariaLabel="Select a date."
                            value={userForm?.DateOfBirth ? new Date(userForm.DateOfBirth) : undefined}
                            // value={userForm?.DateOfBirth ? new Date(userForm.DateOfBirth) : undefined}
                            className="formControl"
                            onSelectDate={(date?: Date) =>
                                setUserForm(prev => ({
                                    ...prev,
                                    DateOfBirth: date,
                                    isDOBExist: false
                                }))
                            }
                            formatDate={onFormatDate}
                            strings={defaultDatePickerStrings}
                            disabled={userForm?.isDOBExist}
                        />
                    </div>
                </div>
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                        <RichText
                            label="Profile Notes"
                            value={userForm?.Notes}
                            onChange={onChangeNotes}
                            isEditMode={true}
                        />
                    </div>
                </div>
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6 ">
                        {isAvailableImage ?
                            <>
                                <div>
                                    <Label className="labelform">Profile Picture</Label>
                                    <div className="formControl pt-2 pb-2 dflex">
                                        <span className="cursorPointer"
                                            onClick={() => toggleModal(userForm?.profilerImageUrl)} >
                                            View Image
                                        </span>
                                        <Link className="actionBtn iconSize btnDanger mtm9 ml-10" onClick={_onClickDeleteUserImage}>
                                            <TooltipHost
                                                content="Are you sure, you want to delete this image?"
                                                id={tooltipId}
                                            >
                                                <FontAwesomeIcon className="cursorPointer" icon="trash-alt" onClick={() => _onClickDeleteUserImage()} />
                                            </TooltipHost>
                                        </Link>
                                    </div>
                                </div>
                            </>
                            :
                            < TextField
                                type="file"
                                label="Profile Picture"
                                className="formControl"
                                name="Client Image"
                                accept="image/*"
                                placeholder="Enter Input"
                                onChange={pdfSelectionChange}
                            />
                        }
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6 ">
                        {/* Updated the Operator Type to a Machine Operator toggle..
                            Updated by Trupti on 18/9/2025.
                        */}
                        <Label className="labelform">Is Machine Operator?</Label>
                        <Toggle
                            onText="Yes"
                            offText="No"
                            // checked={(selectedOperatorType || userForm?.OperatorType) == OperatorTypeEnum.MachineOperator}
                            checked={selectedOperatorType ? selectedOperatorType === OperatorTypeEnum.MachineOperator : userForm?.OperatorType?.split(",")?.map((item: any) => item.trim()).includes(OperatorTypeEnum.MachineOperator)}
                            onChange={(a, checked) => onOperatorTypeToggleChange(checked)}
                        />
                        {/* <Label className="labelform">Operator Type</Label>
                        <OperatorTypeFilter
                            selectedOperatorType={selectedOperatorType}
                            defaultOption={userForm?.OperatorType?.split(', ')}
                            onOperatorTypeChange={onOperatorTypeChange}
                            provider={props.provider}
                            isRequired={false}
                            AllOption={false}
                        /> */}
                        {/* <OperatorTypeFilter
                            selectedOperatorType={selectedOperatorType}
                            defaultOption={userForm.OperatorType}
                            onOperatorTypeChange={onOperatorTypeChange}
                            provider={props.provider}
                            isRequired={false}
                            AllOption={true}
                        /> */}
                    </div>
                </div>
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 mem-but-mar button-right">
                        <PrimaryButton text="Add Skill Set" className={`mrt15 me1 btn ${EmailExist ? '' : 'btn-primary'} btn-main buttonmain MsgSendButton`} onClick={onClickSkillSet} disabled={EmailExist ? true : false} />
                    </div>
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div id="SkillSetGrid" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                <MemoizedDetailList
                                    key={keyUpdate}
                                    columns={SkillSetColumn() as any}
                                    items={SkillSetData || []}
                                    reRenderComponent={true}
                                    onSelectedItem={_onItemSelected}
                                    //searchable={true}
                                    CustomselectionMode={SelectionMode.none}
                                    manageComponentView={function (componentProp: any) {
                                        throw new Error('Function not implemented.');
                                    }}
                                    isAddNew={true}
                                    gridId="SkillSetGrid"
                                    isPagination={false}
                                // IsViewPagination={true}
                                // key={isRender}
                                // addNewContent={<PrimaryButton text="Add Leave Type" className="btn btn-primary" />}
                                />
                            </div>
                        </div>
                    </div>
                    {/* <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 button-right button-right-space">
                        <PrimaryButton text="Add Certificate" className='mrt15 me1 btn btn-primary btn-main buttonmain MsgSendButton' onClick={onClickAddCertificate} />
                    </div> */}
                    {/* <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div id="ATCertGrid" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 mt-2">
                                <MemoizedDetailList
                                    columns={DocumentColumn() as any}
                                    items={DocumentDataList || []}
                                    reRenderComponent={true}
                                    onSelectedItem={_onItemSelected}
                                    //searchable={true}
                                    CustomselectionMode={SelectionMode.none}
                                    manageComponentView={function (componentProp: any) {
                                        throw new Error('Function not implemented.');
                                    }}
                                    isAddNew={true}
                                    gridId="ATCertGrid"
                                    isPagination={false}
                                // IsViewPagination={true}
                                // key={isRender}
                                // addNewContent={<PrimaryButton text="Add Leave Type" className="btn btn-primary" />}
                                />
                            </div>
                        </div>
                    </div> */}

                </div>

            </div>
        </div >

    </>;

    const isYesButtonDisabled =
        !userForm?.ATUserName?.trim() ||
        !userForm?.ATRole?.trim() ||
        EmailExist ||
        DisableUpdate ||
        (props.isNewUserAdd == true && !selectedSite);

    return <>
        {isLoading && <Loader />}
        {isErrorModelOpen && <CustomModal closeButtonText="Close" isModalOpenProps={isErrorModelOpen} setModalpopUpFalse={() => { setIsErrorModelOpen(false); }} subject={"Something went wrong."} message={<div className="dflex" ><FontAwesomeIcon className="actionBtn btnPDF dticon" icon="circle-exclamation" /> <div className="error">Please try again later.</div></div>} />}

        {
            <CustomModal
                isModalOpenProps={props?.isModelOpen}
                setModalpopUpFalse={onCloseclickModel}
                subject={props.isNewUserAdd ? "Add" : "Update Detail"}
                message={modelContent}
                closeButtonText={"Cancel"}
                onClickOfYes={onClickOfYes}
                yesButtonText={props.isNewUserAdd ? "Save" : 'Update'}
                dialogWidth="700px"
                isYesButtonDisbale={isYesButtonDisabled}
            />
        }
        {isformValidationModelOpen &&
            < CustomeDialog
                isDialogOpen={isformValidationModelOpen}
                dialogMessage={validationMessage}
                closeText={"Close"}
                dialogWidth="400px"
                onClickClose={() => {
                    setIsformValidationModelOpen(false);
                    setValidationMessage("");

                }} />
        }

        <Panel
            isOpen={showModal}
            onDismiss={() => toggleModal("")}
            type={PanelType.medium}
            headerText="Image View">
            <img src={imageURL} style={{ width: "100%", height: "85vh" }} />
            {/* <img src={`${imageURL}`} alt="Before Image 1" style={{ maxHeight: '100%' }} /> */}
        </Panel>

        <Panel
            isOpen={showModal2}
            onDismiss={() => closeModal()}
            type={PanelType.extraLarge}
            headerText="Document View"
        >
            <iframe src={fileURL} style={{ width: "90%", height: "90vh" }} />
        </Panel>

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
                            <h2 className="mt-10">Add Skill Set</h2>
                            <div className="mt-2">
                                <Label className="formLabel">Skill Set<span className="required"> *</span></Label>
                                <Select
                                    placeholder="Select Skill Set"
                                    required
                                    value={selectedSkillSet}
                                    onChange={onSkillSetChangeSingle}
                                    isOptionDisabled={(option) => option.disabled}
                                    isDisabled={updateSkillSet}
                                    options={Options}
                                />

                                {ErrorSkillSet &&
                                    <div className="requiredlink">Skill Set is Required</div>}
                            </div>
                            <div className="mt-2">
                                <Label className="formLabel">Card Number<span className="required"> *</span></Label>
                                <TextField className="formControl" placeholder="Enter Card Number"
                                    value={title}
                                    onChange={onChangeTitle}
                                    maxLength={30}
                                />
                                {ErrorCN &&
                                    <div className="requiredlink">Card Number is Required</div>}
                            </div>

                            <div className="">
                                <Label className="formLabel">Expiry Date<span className="required"> *</span></Label>
                                <DatePicker allowTextInput
                                    ariaLabel="Select a date."
                                    value={serviceDueDate}
                                    onSelectDate={setServiceDueDate as (date?: Date) => void}
                                    formatDate={onFormatDate}
                                    strings={defaultDatePickerStrings}
                                    minDate={new Date()} />
                                {ErrorExpiryDate &&
                                    <div className="requiredlink">Expiry Date is Required</div>}
                            </div>

                            <DialogFooter>
                                {updateSkillSet ? <PrimaryButton text="Update" onClick={() => onClickSave("Update")} className='mrt15 css-b62m3t-container btn btn-primary' /> :
                                    <PrimaryButton text="Save" onClick={() => onClickSave("Save")} className='mrt15 css-b62m3t-container btn btn-primary' />}
                                <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickCancel} />
                            </DialogFooter>

                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}
        {/* {isPopupVisibleDoc && (
            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={hidePopupDoc}
                >
                    <Overlay onClick={hidePopupDoc} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Add Certificate</h2>
                            <div className={`mt-2  ${isImage ? "" : "dropDownTeam"} `}>
                                <label className="dialog-dd-lbl formLabel">Certificate <span className="required">* </span></label>
                                <Select
                                    required
                                    placeholder="Select Certificate"
                                    value={selectedCertificate}
                                    classNamePrefix={"teamDropDown"}
                                    onChange={onCertificateChange}
                                    options={DocumentTypeOptions}
                                />
                            </div>

                            <div className="mt-2">
                                <label className="dialog-dd-lbl">Document <span className="required">* </span></label>
                                <input
                                    type="file"
                                    ref={Fileref}
                                    id="documentcert"
                                    name="Client Image"
                                    className="formControl"
                                    // accept="image/*"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods,.odp,.jpg,.jpeg,.png,.gif,.bmp,.svg,.webp"
                                    // accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods,.odp"
                                    onChange={handleFileUpload} />
                                {(isImage && image) && <div style={{ margin: "10px 0", display: "flex" }}>
                                    <div >
                                        {blurHistory.length > 0 && <Link className="actionBtn btnView dticon" onClick={undoLastBlur}>
                                            <TooltipHost content={"Undo Blur"} id={tooltipId}>
                                                <FontAwesomeIcon icon="rotate-left" />
                                            </TooltipHost>
                                        </Link>}


                                    </div>
                                    {isShowRestBlur && <Link className="actionBtn btnView dticon" onClick={resetBlur}>
                                        <TooltipHost content={"Reset blur"} id={tooltipId}>
                                            <FontAwesomeIcon icon="arrows-rotate" />
                                        </TooltipHost>
                                    </Link>}
                                    <div style={{ marginRight: "10px", }}>
                                        <Link className="actionBtn btnView dticon"  >
                                            <TooltipHost content={"Select the area and adjust the blur."} id={tooltipId}>
                                                <FontAwesomeIcon icon="exclamation-circle" />
                                            </TooltipHost>
                                        </Link>
                                    </div>
                                    <div style={{ width: "150px", marginTop: "-10px" }}>
                                        <Slider
                                            label="Blur Strength"
                                            className="mt-10"
                                            min={5}
                                            max={30}
                                            value={blurStrength}
                                            showValue
                                            onChange={(value) => setBlurStrength(Number(value))}
                                        />
                                    </div>

                                </div>}
                                {(isImage && image) && (
                                    <div className="canvas-img-cl">
                                        <canvas
                                            ref={canvasRef}
                                            onMouseDown={handleMouseDown}
                                            onMouseMove={handleMouseMove}
                                            onMouseUp={handleMouseUp}
                                            style={{ cursor: "crosshair" }}
                                        ></canvas>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <PrimaryButton text="Add" onClick={onClick_DocumentSave} className='mrt15 css-b62m3t-container btn btn-primary' />
                                <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickCancel} />
                            </DialogFooter>
                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer >
        )} */}
    </>;

};