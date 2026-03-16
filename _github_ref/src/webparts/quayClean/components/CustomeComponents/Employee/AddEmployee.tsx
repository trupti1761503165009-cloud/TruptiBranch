/* eslint-disable @typescript-eslint/no-use-before-define */
import { Breadcrumb, IDropdownOption, Label, Panel, PanelType, PrimaryButton, TextField, Toggle } from "@fluentui/react";
import * as React from "react";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum, } from "../../../../../Common/Enum/ComponentNameEnum";
import CustomModal from "../../CommonComponents/CustomModal";
import { Loader } from "../../CommonComponents/Loader";
import { toastService } from "../../../../../Common/ToastService";
import { ValidateForm } from "../../../../../Common/Validation";
import { IHelpDeskFormProps, IHelpDeskFormState, IEmployeeItem } from "../../../../../Interfaces/IAddNewHelpDesk";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { imgValidation, logGenerator, removeElementOfBreadCrum, UserActivityLog } from "../../../../../Common/Util";
import { ActionMeta } from "react-select";
import { IReactSelectOptionProps } from "../../../../../Interfaces/IReactSelectOptionProps";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";

export const AddEmployee = (props: IHelpDeskFormProps) => {
    const [stateOptions, setStateOptions] = React.useState<IDropdownOption[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [Client, setClient] = React.useState<number[]>([]);
    const [selectedClient, setselectedClient] = React.useState<any[]>([]);
    const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
    const [siteOptions, setSiteOptions] = React.useState<IDropdownOption[]>([]);
    const [emailError, setEmailError] = React.useState<any>("");
    const [phoneError, setPhoneError] = React.useState<any>("");
    const [firstNameError, setFirstNameError] = React.useState<string>('');
    const [lastNameError, setLastNameError] = React.useState<string>('');

    const [employeeIdError, setEmployeeIdError] = React.useState('');
    const [defaultState, setDefaultState] = React.useState<any>();
    const [defaultSite, setDefaultSite] = React.useState<any>();
    const [ClientId, setClientId] = React.useState<any[]>([]);
    const [CurrentUser, setCurrentUser] = React.useState<any[]>([]);
    const [CurrentSiteMasterId, setCurrentSiteMasterId] = React.useState<any>(0);
    const [CurrentClientId, setCurrentClientId] = React.useState<any>(0);
    const [IdExists, setIdExists] = React.useState<boolean>(false);
    const [isDisabled, setIsDisabled] = React.useState<boolean>(false);
    const [profileFile, setProfileFile] = React.useState<any>(null);
    const [IsAttachment, setIsAttachment] = React.useState<boolean>(false);
    const [IsDeleteAttachment, setIsDeleteAttachment] = React.useState<boolean>(false);
    const [Profile, setProfile] = React.useState<any>(null);
    const [UpdateEmpId, setUpdateEmpId] = React.useState<any>("");
    const [UpdateEmail, setUpdateEmail] = React.useState<any>("");
    const [UpdatePhone, setUpdatePhone] = React.useState<any>("");
    const [state, SetState] = React.useState<IHelpDeskFormState>({
        CallerOptions: [],
        CategoryOptions: [],
        EventOptions: [],
        isdisableField: !!isAddNewHelpDesk ? false : true,
        isAddNewHelpDesk: !!isAddNewHelpDesk,
        isformValidationModelOpen: false,
        validationMessage: null
    });
    const [newFromObj, setNewFromObj] = React.useState<IEmployeeItem>({
        Id: 0,
        FirstName: "",
        LastName: "",
        Email: "",
        StateId: [],
        Phone: "",
        IsQuaycleanUser: false
    });
    const [imageURL, setImageURL] = React.useState("");
    const [showModal, setShowModal] = React.useState(false);

    const toggleModal = (imgURL: string | undefined) => {
        setImageURL(imgURL ? imgURL : "");
        setShowModal(!showModal);
    };

    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail } = appGlobalState;

    const phoneRegexIndia = /^(?:\+91|91)?[6-9]\d{9}$/;
    const phoneRegexAus = /^(?:\+61|61|0)?4\d{8}$/;

    const handleFirstNameChange = (event: any, value: string) => {
        const trimmed = value?.trim();
        setNewFromObj(prevState => ({
            ...prevState,
            FirstName: value
        }));

        if (!trimmed) {
            setFirstNameError('First Name is required.');
        } else if (trimmed.length > 50) {
            setFirstNameError('First Name cannot exceed 50 characters.');
        } else {
            setFirstNameError('');
        }
    };

    const handleLastNameChange = (event: any, value: string) => {
        const trimmed = value?.trim();
        setNewFromObj(prevState => ({
            ...prevState,
            LastName: value
        }));
        if (trimmed.length > 50) {
            setLastNameError('Last Name cannot exceed 50 characters.');
        } else {
            setLastNameError('');
        }
    };



    const handlePhoneChange = (event: any, value: string) => {
        setNewFromObj(prevState => ({ ...prevState, Phone: value }));
        const trimmed = value?.toString().trim();
        let filteredPhone = props?.componentProps?.empPhones || [];
        if (
            props?.componentProps?.siteMasterId &&
            props?.componentProps?.siteMasterId > 0 &&
            UpdatePhone !== ""
        ) {
            filteredPhone = filteredPhone.filter(
                (id: number) => id !== UpdatePhone
            );
        }
        if (!trimmed) {
            // Allow blank value
            setPhoneError('');
        } else if (!phoneRegexIndia.test(trimmed) && !phoneRegexAus.test(trimmed)) {
            setPhoneError('Please enter a valid phone number using digits only.');
        } else if (
            trimmed &&
            filteredPhone.some((email: any) => email.toLowerCase() === trimmed.toLowerCase())
        ) {
            setPhoneError('Phone already exists.');
        } else {
            setPhoneError('');
        }
    };

    const employeeIdRegex = /^\d{6}$/;

    const handleEmployeeIdChange = (event: any, value: string) => {
        setNewFromObj(prevState => ({ ...prevState, EmployeeId: value }));
        const trimmed = value?.toString().trim();

        let filteredEmpIds = props?.componentProps?.empIds || [];
        if (
            props?.componentProps?.siteMasterId &&
            props?.componentProps?.siteMasterId > 0 &&
            UpdateEmpId !== ""
        ) {
            filteredEmpIds = filteredEmpIds.filter(
                (id: number) => id !== Number(UpdateEmpId)
            );
        }


        if (!trimmed) {
            // Allow blank value
            setEmployeeIdError('');
        } else if (!employeeIdRegex.test(trimmed)) {
            setEmployeeIdError('Employee Id must be 6 digits.');
        } else if (filteredEmpIds.includes(Number(trimmed))) {
            setEmployeeIdError('Employee Id already exists.');
        } else {
            setEmployeeIdError('');
        }
    };


    const _onChangeToggle = (event: React.MouseEvent<HTMLElement>, checked?: boolean) => {
        setNewFromObj((prev) => ({ ...prev, IsQuaycleanUser: checked || false }));
    };

    const _onStateChange = (selectedList: any, selectedItem: any): void => {
        setDefaultState(selectedList.map((item: any) => item.value));
        setNewFromObj((prevState: any) => ({ ...prevState, StateId: selectedList.map((item: any) => item.value) }));
    };


    // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;

    const handleEmailChange = (event: any, value: any) => {
        setNewFromObj(prevState => ({ ...prevState, Email: value }));
        const trimmed = value?.toString().trim();
        // Prepare filtered list
        let filteredempEmails = props?.componentProps?.empEmails || [];
        if (
            props?.componentProps?.siteMasterId &&
            props?.componentProps?.siteMasterId > 0 &&
            UpdateEmail !== ""
        ) {
            filteredempEmails = filteredempEmails.filter(
                (email: string) => email.toLowerCase() !== UpdateEmail.toLowerCase()
            );
        }

        // Validation
        // if (trimmed && !emailRegex.test(trimmed)) {
        //     setEmailError('Please enter a valid email address.');
        // } else if (
        //     trimmed &&
        //     filteredempEmails.some((email: any) => email.toLowerCase() === trimmed.toLowerCase())
        // ) {
        //     setEmailError('Email already exists.');
        // } else {
        //     setEmailError('');
        // }

        if (trimmed && trimmed.length > 64) {
            setEmailError('Email cannot exceed 64 characters.');
        } else if (trimmed && !emailRegex.test(trimmed)) {
            setEmailError('Please enter a valid email address.');
        } else if (
            trimmed &&
            filteredempEmails.some((email: any) => email.toLowerCase() === trimmed.toLowerCase())
        ) {
            setEmailError('Email already exists.');
        } else {
            setEmailError('');
        }

    };


    const getEmployeeDetailByID = (Id: number) => {
        if (!!Id) {
            const selectItem = ["Id,EmployeeId,FirstName,LastName,Email,StateId,State/Title,Phone,IsQuaycleanUser,Attachments,AttachmentFiles"];
            const expandItem = ["State,AttachmentFiles"];
            const filter = `ID eq ${Id} and IsDeleted ne 1 and Inactive ne 1`;
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.QuaycleanEmployee,
                select: selectItem,
                expand: expandItem,
                filter: filter,
                id: Id
            };
            return props.provider.getByItemByIDQuery(queryOptions);
        }
    };

    const errorMessageGenrate = (item: any) => {
        const error: any[] = [];
        let errormessage: any;

        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                switch (key) {
                    case "FirstName":
                        error.push(<div>First Name is required</div>);
                        break;
                    case "StateId":
                        error.push(<div>State is required</div>);
                        break;
                    default:
                        break;
                }
            }
        }
        // if (newFromObj.StateId === undefined || newFromObj.StateId.length === 0) {
        //     error.push(<div>State is required</div>);
        // }
        const phoneValue = newFromObj.Phone?.toString().trim();

        if (phoneValue) {
            const indiaRegExp = /^(?:\+91|91)?[6-9]\d{9}$/;
            const ausRegExp = /^(?:\+61|61)?4\d{8}$/;
            if (!indiaRegExp.test(phoneValue) && !ausRegExp.test(phoneValue)) {
                error.push(<div>Please enter a valid phone number using digits only.</div>);
            }
        }

        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                switch (key) {
                    case "Email":
                        error.push(<div>Email is required</div>);
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
        return error;
    };

    const _clientData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,ClientId,Client/Title,Client/Name,Client/EMail"];
            const expand = ["Client"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                filter: `IsDeleted ne 1`,
                listName: ListNames.Client,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const ClientListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                ClientId: !!data.ClientId ? data.ClientId : 0,
                                Client: !!data.Client ? data.Client.Title : ''
                                // ClientId: !!data.ClientId ? data.ClientId[0] : '',
                                // Client: !!data.Client ? data.Client[0].Title : ''
                            }
                        );
                    });
                    const clientIds = ClientListData.map((item: any) => item.ClientId);
                    setClientId(clientIds);
                    setIsLoading(false);
                }
            }).catch((error) => {
                console.log(error);
            });
        } catch (ex) {
            console.log(ex);
        }
    };

    const onClickSaveOrUpdate = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        try {
            let isValidateRecord;
            const validationFields = {
                // "required": ['FirstName', 'StateId', 'ClientId', 'Email'],
                "required": ['FirstName', 'StateId', 'Email'],
            };

            if (!!newFromObj)
                isValidateRecord = ValidateForm(newFromObj, validationFields);

            let error: any;
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
                error = <ul><li>Please fill the form  </li></ul>;
                SetState(prevState => ({ ...prevState, isformValidationModelOpen: !isValid, validationMessage: error }));
            }
            if (isValid) {
                const toastMessage = (newFromObj.Id && newFromObj.Id > 0) ? 'Details updated successfully!' : 'Employee created successfully!';
                if (newFromObj.Id && newFromObj.Id > 0) {
                    let newClientObj = {
                        ...newFromObj,  // Spread the original object's properties
                        Title: newFromObj?.FirstName + (newFromObj?.LastName ? " " + newFromObj.LastName : ""),
                        StateId: newFromObj.StateId && newFromObj.StateId.length > 0 ? newFromObj.StateId : []
                    };

                    await props.provider.updateItemWithPnP(newClientObj, ListNames.QuaycleanEmployee, newFromObj.Id);
                    // if (Profile?.FileName !== undefined && IsDeleteAttachment)
                    //     await props.provider.deleteAttachment(ListNames.QuaycleanEmployee, newFromObj.Id, Profile?.FileName);
                    // if (!!profileFile) {
                    //     props.provider.uploadAttachmentToList(ListNames.QuaycleanEmployee, profileFile, newFromObj.Id).then(() => {
                    //         console.log();
                    //     }).catch(err => console.log(err));
                    // }
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        ActionType: UserActivityActionTypeEnum.Update,
                        EntityType: UserActionEntityTypeEnum.Employee,
                        EntityId: newFromObj?.Id,
                        EntityName: `${newFromObj?.FirstName} ${newFromObj?.LastName}`,
                        Details: `Update Employee`,
                        StateId: newFromObj.StateId
                    };
                    void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);

                }
                else {
                    delete newFromObj.Id;
                    let newClientObj = {
                        ...newFromObj,  // Spread the original object's properties
                        // Title: newFromObj?.FirstName + " " + newFromObj?.LastName,
                        Title: newFromObj?.FirstName + (newFromObj?.LastName ? " " + newFromObj.LastName : ""),
                        StateId: newFromObj.StateId && newFromObj.StateId.length > 0 ? newFromObj.StateId : []
                    };

                    await props.provider.createItem(newClientObj, ListNames.QuaycleanEmployee).then((res) => {
                        // props.provider.uploadAttachmentToList(ListNames.QuaycleanEmployee, profileFile, res.data.Id).then(() => {
                        //     console.log();

                        // }).catch(err => console.log(err));
                        const logObj = {
                            UserName: props?.loginUserRoleDetails?.title,
                            ActionType: UserActivityActionTypeEnum.Create,
                            EntityType: UserActionEntityTypeEnum.Employee,
                            EntityId: res?.data?.ID,
                            EntityName: `${newFromObj.FirstName} ${newFromObj.LastName}`,
                            Details: `Create Employee`,
                            StateId: newFromObj.StateId
                        };
                        void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);

                    }).catch((error) => {
                        console.log(error);
                    });
                }
                const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.Employee, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
                });
                setIsLoading(false);
            } else {
                toastService.dismiss(toastId);
                setIsLoading(false);
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  onClickSaveOrUpdate",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onClickSaveOrUpdate Employee"
            };
            void logGenerator(props.provider, errorObj);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };

    const getStatenameList = (): void => {
        const select = ["Id,Title"];
        let filter = ``;
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.StateMaster,
            filter: filter,
        };
        let dropvalue: any = [];
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {

            const { isAdmin, isStateManager, isSiteManager, stateManagerStateItem, siteManagerItem } = currentUserRoleDetail;
            const uniqueSiteIdList: number[] = Array.from(new Set(siteManagerItem.map(item => item.QCStateId)));

            response.map((State: any) => {
                let IsAllowOption = false;

                if (isAdmin) {
                    IsAllowOption = true;
                } else if (isStateManager && stateManagerStateItem.includes(State.Id)) {
                    IsAllowOption = true;
                } else if (isSiteManager && uniqueSiteIdList.includes(State.Id)) {
                    IsAllowOption = true;
                }


                if (IsAllowOption) {
                    dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
                }
            });

            setStateOptions(dropvalue);
        }).catch((error) => {
            console.log(error);
        });
    };


    React.useEffect(() => {
        try {
            _clientData();
            getStatenameList();
            setIsLoading(true);
            // eslint-disable-next-line no-void
            void (async () => {
                if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
                    const objItem = await getEmployeeDetailByID(props.componentProps.siteMasterId);

                    // setselectedClient([objItem.Client[0]?.EMail]);
                    setselectedClient([objItem.Client?.EMail]);
                    setDefaultState(objItem.StateId);
                    setDefaultSite(objItem.SiteNameId);
                    // setCurrentClientId([objItem.Client[0]?.Id]);
                    setCurrentClientId([objItem.Client?.Id]);
                    // if (objItem?.AttachmentFiles?.length > 0) {
                    //     setIsAttachment(true);
                    // }
                    setUpdateEmpId(objItem?.EmployeeId);
                    setUpdateEmail(objItem?.Email);
                    setUpdatePhone(objItem?.Phone);

                    // setImageURL(objItem?.AttachmentFiles[0]?.ServerRelativeUrl);
                    // setProfile(objItem?.AttachmentFiles[0]);
                    const items: any = {
                        Id: parseInt(objItem.Id),
                        FirstName: !!objItem.FirstName ? objItem.FirstName : "",
                        LastName: !!objItem.LastName ? objItem.LastName : "",
                        StateId: !!objItem.StateId ? objItem.StateId : "",
                        Phone: !!objItem.Phone ? objItem.Phone : "",
                        Email: !!objItem.Email ? objItem.Email : "",
                        EmployeeId: !!objItem.EmployeeId ? objItem.EmployeeId : "",
                        IsQuaycleanUser: !!objItem.IsQuaycleanUser ? objItem.IsQuaycleanUser : false
                    };

                    setNewFromObj(items);
                    setIsLoading(false);
                } else {
                    setIsLoading(false);
                }
                setIsLoading(false);
            })();


        } catch (error) {
            setIsLoading(false);

            console.log(error);
        }

    }, []);

    React.useEffect(() => {
        if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
            setIsDisabled(true);
        } else {
            setIsDisabled(false);
        }
    }, []);


    const fileSelectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.target.files?.[0];
        if (file) {
            const timestamp = new Date().getTime();
            const fileNameParts = file.name.split('.');
            const extension = fileNameParts.pop();
            const baseName = fileNameParts.join('.');
            const uniqueFileName = `${timestamp}_${baseName}.${extension}`;

            const selectedFile: IFileWithBlob = {
                file,
                name: uniqueFileName,
                folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/Shared Documents`,
                overwrite: true
            };
            setProfileFile(selectedFile);
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
                            <div> <h1 className="mainTitle">Add Employee form</h1></div>
                            <div className="dFlex">
                                <div>
                                    <PrimaryButton
                                        className="btn btn-danger"
                                        text="Close"
                                        onClick={() => {
                                            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                            props.manageComponentView({
                                                currentComponentName: ComponentNameEnum.Employee, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
                                            });
                                        }}
                                    />
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
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ml--7 mlr0">
                            <div className="cls-dyn-row">
                                <div className="">
                                    <Label className="formLabel">Employee Id<span className="required"></span></Label>
                                    <TextField className="formControl" placeholder="Enter Employee Id"
                                        value={newFromObj?.EmployeeId}
                                        onChange={handleEmployeeIdChange}
                                        errorMessage={employeeIdError}
                                    />
                                </div>

                                <div className="">
                                    <Label className="formLabel">First Name<span className="required">*</span></Label>
                                    {/* <TextField className="formControl" placeholder="Enter First Name"
                                        value={newFromObj?.FirstName}
                                        onChange={(event, value) => {
                                            setNewFromObj(prevState => ({ ...prevState, FirstName: value }));
                                        }} /> */}
                                    <TextField
                                        className="formControl"
                                        placeholder="Enter First Name"
                                        value={newFromObj?.FirstName}
                                        onChange={handleFirstNameChange}
                                        errorMessage={firstNameError}
                                    />
                                </div>
                                <div className="">
                                    <Label className="formLabel">Last Name<span className="required"></span></Label>
                                    {/* <TextField className="formControl" placeholder="Enter Last Name"
                                        value={newFromObj?.LastName}
                                        onChange={(event, value) => {
                                            setNewFromObj(prevState => ({ ...prevState, LastName: value }));
                                        }} /> */}
                                    <TextField
                                        className="formControl"
                                        placeholder="Enter Last Name"
                                        value={newFromObj?.LastName}
                                        onChange={handleLastNameChange}
                                        errorMessage={lastNameError}
                                    />
                                </div>
                                <div className="">
                                    <Label className="formLabel">State<span className="required">*</span></Label>
                                    <div className="">
                                        <ReactDropdown
                                            options={stateOptions}
                                            defaultOption={defaultState}
                                            isMultiSelect={true}
                                            onChange={_onStateChange}
                                            // isDisabled={isDisabled}
                                            placeholder={'State'}
                                        />
                                    </div>
                                </div>
                                <div className="">
                                    <Label className="formLabel">Phone<span className="required"></span></Label>
                                    <TextField className="" placeholder="Enter Phone"
                                        value={newFromObj?.Phone}
                                        onChange={handlePhoneChange}
                                        errorMessage={phoneError}
                                    />
                                </div>
                                <div className="">
                                    <Label className="formLabel">Email<span className="required">*</span></Label>
                                    <TextField className="" placeholder="Enter Email"
                                        value={newFromObj?.Email}

                                        onChange={handleEmailChange}
                                        errorMessage={emailError}
                                    />
                                </div>
                                {/* <div className="">
                                    <Label className="formLabel">Profile<span className="required"></span></Label>
                                    {IsAttachment === true && <>
                                       <div className="formControl">
                                            <span className="cursorPointer"
                                                onClick={() => toggleModal(imageURL)} >
                                                View Profile
                                            </span>
                                            <FontAwesomeIcon className="ml5" icon="trash-alt" onClick={() => _onClickDeleteUploadFile()} />
                                        </div>
                                    </>
                                    }
                                    {IsAttachment === false &&
                                        <>
                                            <TextField type="file"
                                                accept="image/*"
                                                className='formControl'

                                                placeholder="Enter Input"
                                                onChange={fileSelectionChange} />
                                        </>
                                    }
                                </div> */}
                                <div className="">
                                    <Label className="formLabel">Quayclean User?<span className="required"></span></Label>
                                    <Toggle
                                        onText="Yes"
                                        offText="No"
                                        checked={newFromObj.IsQuaycleanUser}
                                        // defaultChecked={IsUser} // Default to true, can be set dynamically
                                        onChange={_onChangeToggle} // Use the _onChangeCable function to update the state
                                    />
                                </div>




                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">

                            {(employeeIdError || phoneError || emailError || IdExists || firstNameError || lastNameError) ?
                                <PrimaryButton
                                    style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                    className="btn btn-secondary"
                                    disabled={true}
                                    text={state.isAddNewHelpDesk ? 'Save' : "Update"}
                                    onClick={onClickSaveOrUpdate}
                                /> :
                                <PrimaryButton
                                    style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                    className="btn btn-primary"
                                    text={state.isAddNewHelpDesk ? 'Save' : "Update"}
                                    onClick={onClickSaveOrUpdate}
                                />
                            }

                            <PrimaryButton
                                style={{ marginBottom: "5px", marginTop: "10px" }}
                                className="btn btn-danger"
                                text="Cancel"
                                onClick={() => {
                                    const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                    props.manageComponentView({
                                        currentComponentName: ComponentNameEnum.Employee, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
                                    });
                                }}
                            />

                        </div>
                    </div>
                </div>
            </div>
        </div >
        <Panel
            isOpen={showModal}
            onDismiss={() => toggleModal(imageURL)}
            type={PanelType.extraLarge}
            headerText="Image View">
            <img src={imageURL} style={{ width: "100%", height: "85vh" }} />
            {/* <img src={`${imageURL}`} alt="Before Image 1" style={{ maxHeight: '100%' }} /> */}
        </Panel>
    </>;

};
