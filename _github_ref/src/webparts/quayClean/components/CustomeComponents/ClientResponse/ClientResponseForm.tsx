import * as React from "react";
import { Breadcrumb, Label, Panel, PanelType, PrimaryButton, TextField, Toggle } from "@fluentui/react";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { Loader } from "../../CommonComponents/Loader";
import { IClientResponseItem, IClientResponseListProps, IClientResponseListState } from "../../../../../Interfaces/IClientResponse";
import CustomModal from "../../CommonComponents/CustomModal";
import { toastService } from "../../../../../Common/ToastService";
import { ValidateForm } from "../../../../../Common/Validation";
import { DateConvention, DateTimePicker } from "@pnp/spfx-controls-react";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { getChoicesListOptions, getListImageFieldURL, logGenerator, onlyDeleteThumbNail, removeElementOfBreadCrum, saveThumbNailImage, UserActivityLog } from "../../../../../Common/Util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { CRCommonFilter } from "../../../../../Common/Filter/CRCommonFilter";
//import { useId } from "@fluentui/react-hooks";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');

export const ClientResponseForm: React.FC<IClientResponseListProps> = (props) => {

    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;

    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [updateTimeIsCompletedTrue, setUpdateTimeIsCompletedTrue] = React.useState<boolean>(false);
    const { isAddNewClientResponse, manageComponentView, siteMasterId } = props;
    const [state, SetState] = React.useState<IClientResponseListState>({
        CallerOptions: [],
        CategoryOptions: [],
        EventOptions: [],
        isdisableField: !!isAddNewClientResponse ? false : true,
        //siteMasterItems: [],
        isAddNewClientResponse: !!isAddNewClientResponse,
        isformValidationModelOpen: false,
        validationMessage: null
    });
    //const tooltipId = useId('tooltip');
    const [selectedBeforeImage1, setSelectedBeforeImage1] = React.useState<IFileWithBlob[]>([]);
    const [selectedBeforeImage2, setSelectedBeforeImage2] = React.useState<IFileWithBlob[]>([]);
    const [selectedAfterImage1, setSelectedAfterImage1] = React.useState<IFileWithBlob[]>([]);
    const [selectedAfterImage2, setSelectedAfterImage2] = React.useState<IFileWithBlob[]>([]);
    const [oldselectedBeforeImage1, setOldSelectedBeforeImage1] = React.useState<string>("");
    const [oldselectedBeforeImage2, setOldSelectedBeforeImage2] = React.useState<string>("");
    const [oldselectedAfterImage1, setOldSelectedAfterImage1] = React.useState<string>("");
    const [oldselectedAfterImage2, setOldSelectedAfterImage2] = React.useState<string>("");

    const [BeforeImage1Deleted, setBeforeImage1Deleted] = React.useState<boolean>(true);
    const [BeforeImage2Deleted, setBeforeImage2Deleted] = React.useState<boolean>(true);
    const [AfterImage1Deleted, setAfterImage1Deleted] = React.useState<boolean>(true);
    const [AfterImage2Deleted, setAfterImage2Deleted] = React.useState<boolean>(true);
    const [whoareinvolvedOption, setWhoareinvolvedOption] = React.useState<any[]>([]);
    const [buildingOption, setBuildingOption] = React.useState<any[]>([]);

    const [selectedHDArea, setSelectedHDArea] = React.useState<any>("");
    const [selectedWhoAreInvolved, setSelectedWhoAreInvolved] = React.useState<any>("");
    const [selectedBuilding, setSelectedBuilding] = React.useState<any>("");

    const [imageURL, setImageURL] = React.useState("");
    const [showModal, setShowModal] = React.useState(false);

    const toggleModal = (imgURL: string | undefined) => {
        setImageURL(imgURL ? imgURL : "");
        imageURL;
        setShowModal(!showModal);
    };


    const [newFromObj, setNewFromObj] = React.useState<IClientResponseItem>({
        Id: 0,
        Title: "",
        LogInTime: undefined,
        SiteNameId: props.originalSiteMasterId,
        Area: "",
        Request: "",
        WhoAreInvolved: "",
        HasTheSolutionWorked: false,
        BeforeImage1: "",
        BeforeImage2: "",
        AfterImage1: "",
        AfterImage2: "",
        Building: "",
        Feedback: "",
        IsCompleted: false
    });

    const onHDChangeArea = (Item: any): void => {
        setSelectedHDArea(Item);
        setNewFromObj(prevState => ({ ...prevState, Area: Item }));
    };

    const onChangeWhoAreInvolved = (Item: any): void => {
        setSelectedWhoAreInvolved(Item);
        setNewFromObj(prevState => ({ ...prevState, WhoAreInvolved: Item }));
    };
    const onChangeBuilding = (Item: any): void => {
        setSelectedBuilding(Item);
        setNewFromObj(prevState => ({ ...prevState, Building: Item }));
    };

    const getClientResponseDetailByID = (Id: number) => {
        if (!!Id) {
            const selectItem = ["Id,Title,IsCompleted,LogInTime,Area,Request,WhoAreInvolved,HasTheSolutionWorked,BeforeImage1,BeforeImage2,AfterImage1,AfterImage2,SiteName/Id,SiteName/Title,Building,Feedback"];
            const expandItem = ["SiteName"];
            const filter = `ID eq ${Id}`;
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.ClientResponse,
                select: selectItem,
                expand: expandItem,
                filter: filter,
                id: Id
            };
            return provider.getByItemByIDQuery(queryOptions);
        }
    };

    React.useEffect(() => {
        try {
            setIsLoading(true);
            // eslint-disable-next-line no-void
            void (async () => {

                const [whoareinvolved, building] = await Promise.all([getChoicesListOptions(provider, ListNames.ClientResponse, "WhoAreInvolved"), getChoicesListOptions(provider, ListNames.ClientResponse, "Building")]);
                setBuildingOption(building);
                setWhoareinvolvedOption(whoareinvolved);
                if (siteMasterId && siteMasterId > 0) {
                    const objItem = await getClientResponseDetailByID(siteMasterId);

                    const items: IClientResponseItem = {
                        Id: objItem.Id,
                        Title: !!objItem.Title ? objItem.Title : "",
                        //SiteName: !!objItem.SiteName ? objItem.SiteName.Title : "",
                        SiteNameId: !!props.originalSiteMasterId ? props.originalSiteMasterId : 0,
                        Area: !!objItem.Area ? objItem.Area : "",
                        Request: !!objItem.Request ? objItem.Request : "",
                        LogInTime: !!objItem.LogInTime ? new Date(objItem.LogInTime) : undefined,
                        WhoAreInvolved: !!objItem.WhoAreInvolved ? objItem.WhoAreInvolved : "",
                        HasTheSolutionWorked: objItem.HasTheSolutionWorked,
                        Building: !!objItem.Building ? objItem.Building : "",
                        Feedback: !!objItem.Feedback ? objItem.Feedback : "",
                        IsCompleted: objItem.IsCompleted,
                        BeforeImage1: getListImageFieldURL(objItem, "BeforeImage1", notFoundImage),
                        BeforeImage2: getListImageFieldURL(objItem, "BeforeImage2", notFoundImage),
                        AfterImage1: getListImageFieldURL(objItem, "AfterImage1", notFoundImage),
                        AfterImage2: getListImageFieldURL(objItem, "AfterImage2", notFoundImage),
                    };
                    setNewFromObj(items);
                    setBeforeImage1Deleted(false);
                    setBeforeImage2Deleted(false);
                    setAfterImage1Deleted(false);
                    setAfterImage2Deleted(false);

                    if (!!items.BeforeImage1 && items?.BeforeImage1.split('/').pop() === "NotFoundImg_15f37076872698f99e30750028e2f28e.png") {
                        setBeforeImage1Deleted(true);
                    }
                    if (!!items.BeforeImage2 && items.BeforeImage2.split('/').pop() === "NotFoundImg_15f37076872698f99e30750028e2f28e.png") {
                        setBeforeImage2Deleted(true);
                    }
                    if (!!items.AfterImage1 && items?.AfterImage1.split('/').pop() === "NotFoundImg_15f37076872698f99e30750028e2f28e.png") {
                        setAfterImage1Deleted(true);
                    }
                    if (!!items.AfterImage2 && items?.AfterImage2.split('/').pop() === "NotFoundImg_15f37076872698f99e30750028e2f28e.png") {
                        setAfterImage2Deleted(true);
                    }

                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                }
                setIsLoading(false);
            })();

        } catch (error) {
            setIsLoading(false);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect ClientResponseForm"
            };
            void logGenerator(provider, errorObj);
        }

    }, []);


    const errorMessageGenrate = (item: any) => {
        let error: any[] = [];
        let errormessage: any;
        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                switch (key) {

                    case "LogInTime":
                        error.push(<div>Log In Time  is required</div>);
                        break;
                    case "Title":
                        error.push(<div>Client Name is required</div>);
                        break;
                    case "Request":
                        error.push(<div>Request is required</div>);
                        break;
                    case "HasTheSolutionWorked":
                        error.push(<div>Has The Solution Worked is required</div>);
                        break;
                    case "SiteNameId":
                        error.push(<div>Site Name is required</div>);
                        break;
                    case "Feedback":
                        error.push(<div>Cleaning Feedback is required</div>);
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

    const uploadFileAndUpdateObject = async (selectedImage: IFileWithBlob[], isUpdate?: boolean, oldImgUrl?: string) => {

        let data: any = {
            Photo: JSON.stringify({ serverRelativeUrl: "" }),
            EncodedAbsThumbnailUrl: ""
        };
        if (!!selectedImage || isUpdate) {
            if (isUpdate) {
                if (selectedImage.length > 0) {
                    data = await saveThumbNailImage(provider, selectedImage[0], ListNames.QuaycleanAssets, isUpdate, oldImgUrl);
                } else {
                    if (!!oldImgUrl)
                        data = await onlyDeleteThumbNail(provider, ListNames.QuaycleanAssets, oldImgUrl);
                }
            } else {
                if (selectedImage.length > 0)
                    data = await saveThumbNailImage(provider, selectedImage[0], ListNames.QuaycleanAssets);
            }
            // const fileUpload = await provider.uploadFile(selectedImage[0]);
            return data;
        }
        return '';
    };

    const onClickSaveOrUpdate = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');

        try {
            let isValidateRecord;
            const validationFields = {
                "requiredDate": ["LogInTime"],
                "required": ['Title', 'SiteNameId', 'Request', 'HasTheSolutionWorked', 'Feedback'],

            };
            if (!!newFromObj)
                isValidateRecord = ValidateForm(newFromObj, validationFields);


            let error: any[] = [];
            let isValid: boolean;
            if (!!isValidateRecord) {
                if (isValidateRecord?.isValid === false) {
                    isValid = isValidateRecord?.isValid;
                    error = errorMessageGenrate(isValidateRecord);
                } else {
                    isValid = true;
                }
                SetState(prevState => ({ ...prevState, isformValidationModelOpen: !isValid, validationMessage: error }));
            } else {
                isValid = false;
                error.push(<ul><li className="errorPoint">Please fill the form  </li></ul>);
                SetState(prevState => ({ ...prevState, isformValidationModelOpen: !isValid, validationMessage: error }));
            }

            if (isValid) {
                const tempNewObject = { ...newFromObj };
                if (tempNewObject.Id && tempNewObject.Id > 0) {
                    if (BeforeImage1Deleted) {
                        if (!!newFromObj?.BeforeImage1 && newFromObj?.BeforeImage1.split('/').pop() === "NotFoundImg_15f37076872698f99e30750028e2f28e.png") {
                            let BeforeImage1: any = await uploadFileAndUpdateObject(selectedBeforeImage1);
                            tempNewObject.BeforeImage1 = BeforeImage1.Photo;
                            tempNewObject.BeforeImage1ThumbnailUrl = BeforeImage1.EncodedAbsThumbnailUrl;
                        } else {
                            let BeforeImage1: any = await uploadFileAndUpdateObject(selectedBeforeImage1, BeforeImage1Deleted, oldselectedBeforeImage1);
                            if (BeforeImage1.isDeleted) {
                                tempNewObject.BeforeImage1 = JSON.stringify({ serverRelativeUrl: "" });
                                tempNewObject.BeforeImage1ThumbnailUrl = "";

                            } else {
                                tempNewObject.BeforeImage1 = BeforeImage1.Photo;
                                tempNewObject.BeforeImage1ThumbnailUrl = BeforeImage1.EncodedAbsThumbnailUrl;
                            }
                        }


                    } else {
                        delete tempNewObject.BeforeImage1;

                    }
                    if (BeforeImage2Deleted) {
                        if (!!newFromObj?.BeforeImage2 && newFromObj?.BeforeImage2.split('/').pop() === "NotFoundImg_15f37076872698f99e30750028e2f28e.png") {
                            let BeforeImage2: any = await uploadFileAndUpdateObject(selectedBeforeImage2);
                            tempNewObject.BeforeImage2 = BeforeImage2.Photo;
                            tempNewObject.BeforeImage2ThumbnailUrl = BeforeImage2.EncodedAbsThumbnailUrl;
                        } else {
                            let BeforeImage2: any = await uploadFileAndUpdateObject(selectedBeforeImage2, BeforeImage2Deleted, oldselectedBeforeImage2);
                            if (BeforeImage2.isDeleted) {
                                tempNewObject.BeforeImage2 = JSON.stringify({ serverRelativeUrl: "" });
                                tempNewObject.BeforeImage2ThumbnailUrl = "";
                            } else {
                                tempNewObject.BeforeImage2 = BeforeImage2.Photo;
                                tempNewObject.BeforeImage2ThumbnailUrl = BeforeImage2.EncodedAbsThumbnailUrl;
                            }


                        }
                    } else {
                        delete tempNewObject.BeforeImage2;

                    }
                    if (AfterImage1Deleted) {
                        if (!!newFromObj?.AfterImage1 && newFromObj?.AfterImage1.split('/').pop() === "NotFoundImg_15f37076872698f99e30750028e2f28e.png") {
                            let AfterImage1: any = await uploadFileAndUpdateObject(selectedAfterImage1);
                            tempNewObject.AfterImage1 = AfterImage1.Photo;
                            tempNewObject.AfterImage1ThumbnailUrl = AfterImage1.EncodedAbsThumbnailUrl;
                        } else {

                            let AfterImage1: any = await uploadFileAndUpdateObject(selectedAfterImage1, AfterImage1Deleted, oldselectedAfterImage1);
                            if (AfterImage1.isDeleted) {
                                tempNewObject.AfterImage1 = JSON.stringify({ serverRelativeUrl: "" });
                                tempNewObject.AfterImage1ThumbnailUrl = "";
                            } else {
                                tempNewObject.AfterImage1ThumbnailUrl = AfterImage1.EncodedAbsThumbnailUrl;
                                tempNewObject.AfterImage1 = AfterImage1.Photo;
                            }

                        }

                    } else {
                        delete tempNewObject.AfterImage1;

                    }
                    if (AfterImage2Deleted) {
                        if (!!newFromObj?.AfterImage2 && newFromObj?.AfterImage2.split('/').pop() === "NotFoundImg_15f37076872698f99e30750028e2f28e.png") {
                            let AfterImage2: any = await uploadFileAndUpdateObject(selectedAfterImage2);
                            tempNewObject.AfterImage2 = AfterImage2.Photo;
                            tempNewObject.AfterImage2ThumbnailUrl = AfterImage2.EncodedAbsThumbnailUrl;
                        } else {
                            let AfterImage2: any = await uploadFileAndUpdateObject(selectedAfterImage2, AfterImage2Deleted, oldselectedAfterImage2);
                            if (AfterImage2.isDeleted) {
                                tempNewObject.AfterImage2 = JSON.stringify({ serverRelativeUrl: "" });
                                tempNewObject.AfterImage2ThumbnailUrl = "";
                            } else {
                                tempNewObject.AfterImage2 = AfterImage2.Photo;
                                tempNewObject.AfterImage2ThumbnailUrl = AfterImage2.EncodedAbsThumbnailUrl;
                            }

                        }
                    } else {
                        delete tempNewObject.AfterImage2;
                    }
                }

                else {
                    let BeforeImage1: any = await uploadFileAndUpdateObject(selectedBeforeImage1);
                    let BeforeImage2: any = await uploadFileAndUpdateObject(selectedBeforeImage2);
                    let AfterImage1: any = await uploadFileAndUpdateObject(selectedAfterImage1);
                    let AfterImage2: any = await uploadFileAndUpdateObject(selectedAfterImage2);
                    tempNewObject.BeforeImage1 = BeforeImage1.Photo;
                    tempNewObject.BeforeImage2 = BeforeImage2.Photo;
                    tempNewObject.AfterImage1 = AfterImage1.Photo;
                    tempNewObject.AfterImage2 = AfterImage2.Photo;

                    tempNewObject.BeforeImage1ThumbnailUrl = BeforeImage1.EncodedAbsThumbnailUrl;
                    tempNewObject.BeforeImage2ThumbnailUrl = BeforeImage2.EncodedAbsThumbnailUrl;
                    tempNewObject.AfterImage1ThumbnailUrl = AfterImage1.EncodedAbsThumbnailUrl;
                    tempNewObject.AfterImage2ThumbnailUrl = AfterImage2.EncodedAbsThumbnailUrl;

                }
                if (!tempNewObject.BeforeImage1) {
                    delete tempNewObject.BeforeImage1;
                }
                if (!tempNewObject.BeforeImage2) {
                    delete tempNewObject.BeforeImage2;
                }
                if (!tempNewObject.AfterImage1) {
                    delete tempNewObject.AfterImage1;
                }
                if (!tempNewObject.AfterImage2) {
                    delete tempNewObject.AfterImage2;
                }

                const toastMessage = tempNewObject.Id && tempNewObject.Id > 0 ? 'Details updated successfully!' : 'Client response created successfully!';

                if (tempNewObject.Id && tempNewObject.Id > 0) {
                    if (updateTimeIsCompletedTrue) {
                        await provider.updateItemWithPnP({ ...tempNewObject, ResponseCompletionDate: new Date() }, ListNames.ClientResponse, tempNewObject.Id).then((item: any) => {
                            const logObj = {
                                UserName: currentUserRoleDetail?.title,
                                SiteNameId: Number(props?.originalSiteMasterId),
                                ActionType: "Update",
                                EntityType: UserActionEntityTypeEnum.ClientResponse,
                                EntityId: item?.data?.Id,
                                EntityName: item?.data?.Title,
                                Details: `Update Client Response`
                            };
                            void UserActivityLog(provider, logObj, currentUserRoleDetail);
                        })
                    } else {
                        await provider.updateItemWithPnP(tempNewObject, ListNames.ClientResponse, tempNewObject.Id).then((item: any) => {
                            const logObj = {
                                UserName: currentUserRoleDetail?.title,
                                SiteNameId: Number(props?.originalSiteMasterId),
                                ActionType: "Update",
                                EntityType: UserActionEntityTypeEnum.ClientResponse,
                                EntityId: item?.Id,
                                EntityName: item?.Title,
                                Details: `Update Client Response`
                            };
                            void UserActivityLog(provider, logObj, currentUserRoleDetail);
                        })
                    }
                } else {
                    if (updateTimeIsCompletedTrue) {
                        await provider.createItem({ ...tempNewObject, ResponseCompletionDate: new Date() }, ListNames.ClientResponse).then((item: any) => {
                            const logObj = {
                                UserName: currentUserRoleDetail?.title,
                                SiteNameId: Number(props?.originalSiteMasterId),
                                ActionType: "Create",
                                EntityType: UserActionEntityTypeEnum.ClientResponse,
                                EntityId: item?.data?.Id,
                                EntityName: item?.data?.Title,
                                Details: `Create Client Response`
                            };
                            void UserActivityLog(provider, logObj, currentUserRoleDetail);
                        })
                    } else {
                        await provider.createItem(tempNewObject, ListNames.ClientResponse).then((item: any) => {
                            const logObj = {
                                UserName: currentUserRoleDetail?.title,
                                SiteNameId: Number(props?.originalSiteMasterId),
                                ActionType: "Create",
                                EntityType: UserActionEntityTypeEnum.ClientResponse,
                                EntityId: item?.data?.Id,
                                EntityName: item?.data?.Title,
                                Details: `Create Client Response`
                            };
                            void UserActivityLog(provider, logObj, currentUserRoleDetail);
                        })
                    }

                }

                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.componentProps.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "ClientResponseListKey" });
            } else {
                toastService.dismiss(toastId);
            }

        } catch (error) {
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  onClickSaveOrUpdate",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onClickSaveOrUpdate ClientResponseForm"
            };
            void logGenerator(provider, errorObj);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
        } finally {
            setIsLoading(false);
        }
    };


    const fileSelectionChange = (e: any) => {
        const { name, files } = e.target;
        const selectedFiles: IFileWithBlob[] = [];

        if (files.length > 0) {
            const folderServerRelativeURL = `${context.pageContext.web.serverRelativeUrl}/SiteAssets/ClientResponseImages`;
            const overwrite = true;

            for (const file of files) {
                const timestamp = new Date().getTime();
                const [FileName, ExtensionName] = file.name.split('.');
                const CreatorName = `${timestamp}_${FileName}.${ExtensionName}`;

                const selectedFile: IFileWithBlob = {
                    file,
                    name: CreatorName,
                    folderServerRelativeURL,
                    overwrite
                };

                selectedFiles.push(selectedFile);
            }
        }

        switch (name) {
            case "BeforeImage1":
                setNewFromObj(prevState => ({ ...prevState, BeforeImage1: selectedFiles[0].name }));
                setSelectedBeforeImage1(selectedFiles);
                break;
            case "BeforeImage2":
                setNewFromObj(prevState => ({ ...prevState, BeforeImage2: selectedFiles[0].name }));
                setSelectedBeforeImage2(selectedFiles);
                break;
            case "AfterImage1":
                setNewFromObj(prevState => ({ ...prevState, AfterImage1: selectedFiles[0].name }));
                setSelectedAfterImage1(selectedFiles);
                break;
            case "AfterImage2":
                setNewFromObj(prevState => ({ ...prevState, AfterImage2: selectedFiles[0].name }));
                setSelectedAfterImage2(selectedFiles);
                break;
            default:
                // Handle other cases if needed
                break;
        }
    };

    const _onClickDeleteUploadFile = (controlName: string) => {
        switch (controlName) {
            case "BeforeImage1":
                setBeforeImage1Deleted(true);
                setOldSelectedBeforeImage1(!!newFromObj?.BeforeImage1 ? newFromObj?.BeforeImage1 : "");
                setNewFromObj(prevState => ({ ...prevState, BeforeImage1: "" }));
                break;
            case "BeforeImage2":
                setBeforeImage2Deleted(true);

                setOldSelectedBeforeImage2(!!newFromObj?.BeforeImage2 ? newFromObj?.BeforeImage2 : "");
                setNewFromObj(prevState => ({ ...prevState, BeforeImage2: "" }));
                break;
            case "AfterImage1":
                setAfterImage1Deleted(true);
                setOldSelectedAfterImage1(!!newFromObj?.AfterImage1 ? newFromObj?.AfterImage1 : "");
                setNewFromObj(prevState => ({ ...prevState, AfterImage1: "" }));
                break;
            case "AfterImage2":
                setAfterImage2Deleted(true);
                setOldSelectedAfterImage2(!!newFromObj?.AfterImage2 ? newFromObj?.AfterImage2 : "");
                setNewFromObj(prevState => ({ ...prevState, AfterImage2: "" }));
                break;
            default:
                // Handle other cases if needed
                break;
        }
    };


    return <>
        {isLoading && <Loader />}

        {state.isformValidationModelOpen &&
            <CustomModal
                isModalOpenProps={state.isformValidationModelOpen} setModalpopUpFalse={() => {
                    SetState(prevState => ({ ...prevState, isformValidationModelOpen: false }));
                }} subject={"Missing data"}
                message={state.validationMessage} closeButtonText={"Close"} />}

        <div className="boxCard">
            <div className="formGroup">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween">
                            <div><h1 className="mainTitle">Client Response Form</h1></div>
                            <div className="dFlex">
                                <div>
                                    <PrimaryButton className="btn btn-danger justifyright floatright"
                                        onClick={() => {
                                            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                            props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.componentProps.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "ClientResponseListKey" });
                                        }}
                                        text="Close" />
                                </div>
                            </div>

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
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 hidedatelabel">
                            <Label className="labelform">Log in time<span className="required">*</span></Label>
                            <DateTimePicker
                                label=""  // Set label to an empty string to hide the heading
                                formatDate={(date: Date) => {
                                    return date.toLocaleDateString('nl-NL', {
                                        year: 'numeric',
                                        month: 'numeric',
                                        day: '2-digit'
                                    }).replace(/-/g, '/');
                                }}
                                dateConvention={DateConvention.Date}
                                value={newFromObj?.LogInTime}
                                onChange={(date?: Date) => {
                                    setNewFromObj(prevState => ({ ...prevState, LogInTime: date }));
                                }}
                            />

                        </div>

                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                            <Label className="labelform">Client Name<span className="required">*</span></Label>
                            <TextField className="formControl" placeholder="Enter"
                                value={newFromObj?.Title}
                                onChange={(event, value) => {
                                    setNewFromObj(prevState => ({ ...prevState, Title: value }));
                                }} />
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                            <Label className="labelform">Location</Label>
                            <div className="formControl">
                                <CRCommonFilter
                                    onCRChange={onHDChangeArea}
                                    provider={provider}
                                    selectedHD={selectedHDArea}
                                    defaultOption={newFromObj?.Area}
                                    siteNameId={props.componentProps.originalSiteMasterId}
                                    Title="Location"
                                    placeHolder="Select Location"
                                />
                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                            <Label className="labelform">Sub Location</Label>
                            <div className="formControl">
                                <CRCommonFilter
                                    onCRChange={onChangeBuilding}
                                    provider={provider}
                                    selectedHD={selectedBuilding}
                                    defaultOption={newFromObj?.Building}
                                    siteNameId={props.componentProps.originalSiteMasterId}
                                    Title="Sub Location"
                                    placeHolder="Select"
                                />
                            </div>
                        </div>

                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                            <Label className="labelform">Request<span className="required">*</span></Label>
                            <TextField className="formControl" placeholder="Enter"
                                value={newFromObj?.Request}
                                onChange={(event, value) => {
                                    setNewFromObj(prevState => ({ ...prevState, Request: value }));
                                }} />
                        </div>

                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                            <Label className="labelform">Who are involved</Label>
                            <div className="formControl">
                                <CRCommonFilter
                                    onCRChange={onChangeWhoAreInvolved}
                                    provider={provider}
                                    selectedHD={selectedWhoAreInvolved}
                                    defaultOption={newFromObj?.WhoAreInvolved}
                                    siteNameId={props.componentProps.originalSiteMasterId}
                                    Title="Who Are Involved"
                                    placeHolder="Select"
                                />
                            </div>
                        </div >

                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4">
                            {!isAddNewClientResponse && BeforeImage1Deleted === false &&
                                <>
                                    <div>
                                        <Label className="labelform">Before image 1<span className="required"></span></Label>
                                        <div className="formControl pt-2 pb-2">
                                            <span className="cursorPointer"
                                                onClick={() => toggleModal(newFromObj?.BeforeImage1)} >
                                                View Image 1
                                            </span>
                                            <FontAwesomeIcon className="ml5" icon="trash-alt" onClick={() => _onClickDeleteUploadFile("BeforeImage1")} />
                                        </div>
                                    </div>
                                </>

                            }
                            {BeforeImage1Deleted === true &&
                                <>
                                    <Label className="labelform">Before image 1<span className="required"></span></Label>
                                    <TextField
                                        type="file"
                                        className="FileUpload formControl"
                                        accept="image/*"
                                        name="BeforeImage1"
                                        onChange={fileSelectionChange} />
                                </>
                            }
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                            {!isAddNewClientResponse && BeforeImage2Deleted === false &&
                                <>
                                    <div >
                                        <Label className="labelform">Before image 2<span className="required"></span></Label>
                                        <div className="formControl pt-2 pb-2">
                                            <span className="cursorPointer"
                                                onClick={() => toggleModal(newFromObj?.BeforeImage2)} >
                                                View Image 2
                                            </span>
                                            <FontAwesomeIcon className="ml5" icon="trash-alt" onClick={() => _onClickDeleteUploadFile("BeforeImage2")} />
                                        </div>
                                    </div>
                                </>
                            }
                            {BeforeImage2Deleted === true &&
                                <>
                                    <Label className="labelform">Before image 2<span className="required"></span></Label>
                                    <TextField type="file"
                                        className='FileUpload formControl'
                                        accept="image/*"
                                        name="BeforeImage2"
                                        onChange={fileSelectionChange} />
                                </>
                            }
                        </div>

                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                            {!isAddNewClientResponse && AfterImage1Deleted === false &&
                                <>
                                    <div>
                                        <Label className="labelform">After image 1<span className="required"></span></Label>
                                        <div className="formControl pt-2 pb-2">
                                            <span className="cursorPointer"
                                                onClick={() => toggleModal(newFromObj?.AfterImage1)} >
                                                View Image 1
                                            </span>
                                            <FontAwesomeIcon className="ml5" icon="trash-alt" onClick={() => _onClickDeleteUploadFile("AfterImage1")} />
                                        </div>
                                    </div>
                                </>
                            }
                            {AfterImage1Deleted === true &&
                                <>
                                    <Label className="labelform">After image 1<span className="required"></span></Label>
                                    <TextField type="file"
                                        className='FileUpload formControl'
                                        accept="image/*"
                                        name="AfterImage1"
                                        onChange={fileSelectionChange}
                                    />
                                </>
                            }
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                            {!isAddNewClientResponse && AfterImage2Deleted === false &&
                                <>
                                    <div>
                                        <Label className="labelform">After image 2<span className="required"></span></Label>
                                        <div className="formControl pt-2 pb-2">

                                            <span className="cursorPointer"
                                                onClick={() => toggleModal(newFromObj?.AfterImage2)} >
                                                View Image 2
                                            </span>
                                            <FontAwesomeIcon className="ml5" icon="trash-alt" onClick={() => _onClickDeleteUploadFile("AfterImage2")} />
                                        </div>
                                    </div>
                                </>
                            }
                            {AfterImage2Deleted === true &&
                                <>
                                    <Label className="labelform">After image 2<span className="required"></span></Label>
                                    <TextField type="file"
                                        accept="image/*"
                                        className='FileUpload formControl'
                                        name="AfterImage2"
                                        onChange={fileSelectionChange} />
                                </>
                            }
                        </div>

                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                            <div className="formControl mb-3">
                                <Toggle
                                    className="formtoggle"
                                    label="Has the solution worked?"
                                    checked={newFromObj?.HasTheSolutionWorked}
                                    onChange={(event, checked) => {
                                        setNewFromObj(prevState => ({ ...prevState, HasTheSolutionWorked: checked }));
                                    }}
                                />
                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ">
                            <div className="formControl">
                                <Toggle
                                    className="formtoggle"
                                    label="Is Completed?"
                                    checked={newFromObj?.IsCompleted}
                                    onChange={(event, checked) => {
                                        setUpdateTimeIsCompletedTrue(checked ? checked : false);
                                        setNewFromObj(prevState => ({ ...prevState, IsCompleted: checked }));
                                    }}
                                />
                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <Label className="labelform">Cleaning Feedback <span className="required">*</span></Label>
                            <TextField multiline rows={3} className="formControl"
                                placeholder="Enter"
                                value={newFromObj?.Feedback}
                                onChange={(event, value) => {
                                    setNewFromObj(prevState => ({ ...prevState, Feedback: value }));
                                }} />
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                            <PrimaryButton
                                style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                className="btn btn-primary"
                                text={state.isAddNewClientResponse ? 'Save' : "Update"}
                                onClick={onClickSaveOrUpdate}
                            />
                            <PrimaryButton
                                style={{ marginBottom: "5px", marginTop: "10px" }}
                                className="btn btn-danger"
                                text="Close"
                                onClick={() => {
                                    const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                    props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.componentProps.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "ClientResponseListKey" });
                                }}
                            />
                        </div>

                    </div >
                </div >
            </div >
        </div >


        <Panel
            isOpen={showModal}
            onDismiss={() => toggleModal("")}
            type={PanelType.extraLarge}
            headerText="Image View">
            <img src={imageURL} style={{ width: "100%", height: "85vh" }} />
            {/* <img src={`${imageURL}`} alt="Before Image 1" style={{ maxHeight: '100%' }} /> */}
        </Panel>

    </>;

};
