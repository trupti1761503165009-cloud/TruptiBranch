// /* eslint-disable @typescript-eslint/no-use-before-define */
// import { Breadcrumb, IDropdownOption, Label, PrimaryButton, TextField } from "@fluentui/react";
// import * as React from "react";
// import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum, } from "../../../../../Common/Enum/ComponentNameEnum";
// import CustomModal from "../../CommonComponents/CustomModal";
// import { Loader } from "../../CommonComponents/Loader";
// import { toastService } from "../../../../../Common/ToastService";
// import { ValidateForm } from "../../../../../Common/Validation";
// import { IHelpDeskFormProps, IHelpDeskFormState, IClientItem } from "../../../../../Interfaces/IAddNewHelpDesk";
// import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
// import { logGenerator, removeElementOfBreadCrum, UserActivityLog } from "../../../../../Common/Util";
// import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
// import { ActionMeta } from "react-select";
// import { IReactSelectOptionProps } from "../../../../../Interfaces/IReactSelectOptionProps";
// import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
// import { useAtomValue } from "jotai";
// import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";

// export const AddClient = (props: IHelpDeskFormProps) => {
//     const [stateOptions, setStateOptions] = React.useState<IDropdownOption[]>([]);
//     const [isLoading, setIsLoading] = React.useState<boolean>(false);
//     const [Client, setClient] = React.useState<number[]>([]);
//     const [selectedClient, setselectedClient] = React.useState<any[]>([]);
//     const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
//     const [selectedHDCaller, setSelectedHDCaller] = React.useState<any>("");
//     const [siteOptions, setSiteOptions] = React.useState<IDropdownOption[]>([]);
//     const [emailError, setEmailError] = React.useState<any>("");
//     const [defaultState, setDefaultState] = React.useState<any>();
//     const [defaultSite, setDefaultSite] = React.useState<any>();
//     const [ClientId, setClientId] = React.useState<any[]>([]);
//     const [CurrentUser, setCurrentUser] = React.useState<any[]>([]);
//     const [CurrentSiteMasterId, setCurrentSiteMasterId] = React.useState<any>(0);
//     const [CurrentClientId, setCurrentClientId] = React.useState<any>(0);
//     const [IdExists, setIdExists] = React.useState<boolean>(false);
//     const [isDisabled, setIsDisabled] = React.useState<boolean>(false);
//     const [state, SetState] = React.useState<IHelpDeskFormState>({
//         CallerOptions: [],
//         CategoryOptions: [],
//         EventOptions: [],
//         isdisableField: !!isAddNewHelpDesk ? false : true,
//         isAddNewHelpDesk: !!isAddNewHelpDesk,
//         isformValidationModelOpen: false,
//         validationMessage: null
//     });
//     const [newFromObj, setNewFromObj] = React.useState<IClientItem>({
//         Id: 0,
//         FirstName: "",
//         LastName: "",
//         EmailAddress: "",
//         StateId: "",
//         Notes: "",
//         SiteNameId: ""
//     });

//     const appGlobalState = useAtomValue(appGlobalStateAtom);
//     const { provider, context, currentUserRoleDetail } = appGlobalState;

//     const _onSiteChange = (option: any, actionMeta: ActionMeta<any>): void => {
//         setDefaultSite(option?.value);
//         setNewFromObj((prevState: any) => ({ ...prevState, SiteNameId: option?.value }));

//         const select = ["Id,Title,ADUserId"];
//         let filter = `Id eq '${option?.value}'`;
//         const queryStringOptions: IPnPQueryOptions = {
//             select: select,
//             filter: filter,
//             listName: ListNames.SitesMaster
//         };
//         props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
//             if (response.length > 0) {
//                 setCurrentUser(response[0].ADUserId);
//                 setCurrentSiteMasterId(response[0].Id);
//             }
//         }).catch((error) => {
//             console.log(error);
//         });


//     };
//     const _onStateChange = (option: any, actionMeta: ActionMeta<any>): void => {
//         setDefaultState(option?.value);
//         let filter = "";
//         setNewFromObj((prevState: any) => ({ ...prevState, StateId: option.value }));
//         const select = ["Id,Title,ADUserId"];
//         if (option.value != null || option.value != undefined || option.value != "") {
//             filter = `QCStateId eq '${option.value}'`;
//         } else {
//             filter = `QCStateId eq '${defaultSite}'`;
//         }

//         const queryStringOptions: IPnPQueryOptions = {
//             select: select,
//             filter: filter,
//             listName: ListNames.SitesMaster
//         };
//         let dropvalue: any = [];
//         let nameofstate: any = [];
//         props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {

//             const { isAdmin, isStateManager, isSiteManager, stateManagerStateItem, siteManagerItem } = currentUserRoleDetail;
//             const uniqueSiteIdList: number[] = Array.from(new Set(siteManagerItem.map(item => item.Id)));

//             response.map((Site: any) => {
//                 let IsAllowOption = false;
//                 if (isAdmin) {
//                     IsAllowOption = true;
//                 } else if (isStateManager) {
//                     IsAllowOption = true;
//                 } else if (isSiteManager && uniqueSiteIdList.includes(Site.Id)) {
//                     IsAllowOption = true;
//                 }

//                 if (IsAllowOption) {
//                     dropvalue.push({ value: Site.Id, key: Site.Id, text: Site.Title, label: Site.Title });
//                     nameofstate.push(Site.Id);
//                 }
//             });
//             setSiteOptions(dropvalue);
//         }).catch((error) => {
//             console.log(error);
//             const errorObj = { ErrorMethodName: "onStateChange", CustomErrormessage: "error in on set sites master data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
//             void logGenerator(props.provider, errorObj);
//         });
//     };

//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     const handleEmailChange = (event: any, value: any) => {
//         setNewFromObj(prevState => ({ ...prevState, EmailAddress: value }));
//         if (value && !emailRegex.test(value)) {
//             setEmailError('Please enter a valid email address.');
//         } else {
//             setEmailError('');
//         }
//     };

//     const getPeoplePickerItems = (items: any[]) => {
//         let PersonList: number[] = items.map((person) => {
//             return person.id;
//         });
//         let Person: number[] = items.map((person) => {
//             return person.secondaryText;
//         });
//         const idExists = ClientId.includes(PersonList[0]);
//         if (idExists) {
//             if (CurrentClientId[0] === PersonList[0]) {
//                 setIdExists(false);
//             } else {
//                 setIdExists(true);
//             }
//         } else {

//             setIdExists(false);
//         }
//         setClient(PersonList);
//         setselectedClient(Person);
//         if (PersonList.length === 0) {
//             const newData = CurrentUser.filter((item: any) => item !== CurrentClientId[0]);
//             setCurrentUser(newData);
//         }
//         setNewFromObj((prevState: any) => ({ ...prevState, ClientId: PersonList ? PersonList : 0 }));
//     };

//     const getClientDetailByID = (Id: number) => {
//         if (!!Id) {
//             const selectItem = ["Id,FirstName,LastName,SiteNameId,SiteName/Title,EmailAddress,StateId,State/Title,Notes,Client/Id,Client/Title,Client/EMail"];
//             const expandItem = ["Client,State,SiteName"];
//             const filter = `ID eq ${Id} and IsDeleted ne 1`;
//             const queryOptions: IPnPQueryOptions = {
//                 listName: ListNames.Client,
//                 select: selectItem,
//                 expand: expandItem,
//                 filter: filter,
//                 id: Id
//             };
//             return props.provider.getByItemByIDQuery(queryOptions);
//         }
//     };

//     const errorMessageGenrate = (item: any) => {
//         const error: any[] = [];
//         let errormessage: any;
//         for (const key in item) {
//             if (Object.prototype.hasOwnProperty.call(item, key)) {
//                 switch (key) {
//                     case "FirstName":
//                         error.push(<div>First Name is required</div>);
//                         break;
//                     case "StateId":
//                         error.push(<div>State is required</div>);
//                         break;
//                     // case "ClientId":
//                     //     error.push(<div>Client is required</div>);
//                     //     break;
//                     case "EmailAddress":
//                         error.push(<div>Email is required</div>);
//                         break;
//                     default:
//                         break;
//                 }
//             }
//         }
//         errormessage = <><ul>{error.map((i: any) => {
//             return <li className="errorPoint">{i}</li>;
//         })}</ul></>;
//         return errormessage;
//         return error;
//     };

//     const _clientData = () => {
//         setIsLoading(true);
//         try {
//             const select = ["ID,ClientId,Client/Title,Client/Name,Client/EMail"];
//             const expand = ["Client"];
//             const queryStringOptions: IPnPQueryOptions = {
//                 select: select,
//                 expand: expand,
//                 filter: `IsDeleted ne 1`,
//                 listName: ListNames.Client,
//             };
//             props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
//                 if (!!results) {
//                     const ClientListData = results.map((data) => {
//                         return (
//                             {
//                                 ID: data.ID,
//                                 ClientId: !!data.ClientId ? data.ClientId : 0,
//                                 Client: !!data.Client ? data.Client.Title : ''
//                                 // ClientId: !!data.ClientId ? data.ClientId[0] : '',
//                                 // Client: !!data.Client ? data.Client[0].Title : ''
//                             }
//                         );
//                     });
//                     const clientIds = ClientListData.map((item: any) => item.ClientId);
//                     setClientId(clientIds);
//                     setIsLoading(false);
//                 }
//             }).catch((error) => {
//                 console.log(error);
//             });
//         } catch (ex) {
//             console.log(ex);
//         }
//     };

//     const onClickSaveOrUpdate = async () => {
//         setIsLoading(true);
//         const toastId = toastService.loading('Loading...');
//         try {
//             let isValidateRecord;
//             const validationFields = {
//                 // "required": ['FirstName', 'StateId', 'ClientId', 'EmailAddress'],
//                 "required": ['FirstName', 'StateId', 'EmailAddress'],
//             };

//             if (!!newFromObj)
//                 isValidateRecord = ValidateForm(newFromObj, validationFields);

//             let error: any;
//             let isValid: boolean;
//             if (!!isValidateRecord) {
//                 if (isValidateRecord?.isValid === false) {
//                     isValid = isValidateRecord?.isValid;
//                     error = errorMessageGenrate(isValidateRecord);
//                 } else {
//                     isValid = true;
//                 }
//                 SetState(prevState => ({ ...prevState, isformValidationModelOpen: !isValid, validationMessage: error }));
//             } else {
//                 isValid = false;
//                 error = <ul><li>Please fill the form  </li></ul>;
//                 SetState(prevState => ({ ...prevState, isformValidationModelOpen: !isValid, validationMessage: error }));
//             }
//             if (isValid) {
//                 const toastMessage = (newFromObj.Id && newFromObj.Id > 0) ? 'Details updated successfully!' : 'Client created successfully!';
//                 if (newFromObj.Id && newFromObj.Id > 0) {
//                     let newClientObj = {
//                         ...newFromObj,  // Spread the original object's properties
//                         ClientId: newFromObj.ClientId && newFromObj.ClientId.length > 0 ? newFromObj.ClientId[0] : null
//                     };

//                     await props.provider.updateItemWithPnP(newClientObj, ListNames.Client, newFromObj.Id);
//                     const logObj = {
//                         UserName: props?.loginUserRoleDetails?.title,
//                         ActionType: UserActivityActionTypeEnum.Update,
//                         SiteNameId: newFromObj?.SiteNameId,
//                         EntityType: UserActionEntityTypeEnum.Client,
//                         EntityId: newFromObj?.Id,
//                         EntityName: `${newFromObj?.FirstName} ${newFromObj?.LastName}`,
//                         Details: `Update Client`,
//                         StateId: newFromObj.StateId
//                     };
//                     void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
//                     if (newClientObj.ClientId > 0) {
//                         if (newFromObj.ClientId[0] === CurrentClientId[0]) {
//                             console.log();
//                         } else {
//                             await props.provider.AddUserToGroup("Quayclean Clients", selectedClient[0]).then((response) => {
//                             }).catch((error) => {
//                                 console.log(error);
//                             });
//                             await props.provider.RemoveUserFromGroup("Quayclean Clients", CurrentClientId[0]).then((response) => {
//                             }).catch((error) => {
//                                 console.log(error);
//                             });
//                         }
//                         CurrentUser.push(newFromObj.ClientId[0]);
//                         const uniqueValues = Array.from(new Set(CurrentUser));
//                         let ClientData = {
//                             ADUserId: uniqueValues
//                         };
//                         await props.provider.updateItemWithPnP(ClientData, ListNames.SitesMaster, CurrentSiteMasterId);
//                     }
//                 }
//                 else {
//                     delete newFromObj.Id;
//                     let newClientObj = {
//                         ...newFromObj,  // Spread the original object's properties
//                         ClientId: newFromObj.ClientId && newFromObj.ClientId.length > 0 ? newFromObj.ClientId[0] : null
//                     };

//                     await props.provider.createItem(newClientObj, ListNames.Client).then((res) => {

//                         const logObj = {
//                             UserName: props?.loginUserRoleDetails?.title,
//                             ActionType: UserActivityActionTypeEnum.Create,
//                             SiteNameId: newFromObj?.SiteNameId,
//                             EntityType: UserActionEntityTypeEnum.Client,
//                             EntityId: res?.data?.ID,
//                             EntityName: `${newFromObj.FirstName} ${newFromObj.LastName}`,
//                             Details: `Create Client`,
//                             StateId: newFromObj.StateId
//                         };
//                         void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);

//                     }).catch((error) => {
//                         console.log(error);
//                     });

//                     if (newClientObj.ClientId > 0) {


//                         props.provider.AddUserToGroup("Quayclean Clients", selectedClient[0]).then((response) => {
//                         }).catch((error) => {
//                             console.log(error);
//                         });

//                         setCurrentUser((prevState) => {
//                             const updatedArray = Array.isArray(prevState) ? [...prevState, newFromObj.ClientId[0]] : [newFromObj.ClientId[0]];
//                             const uniqueValues = Array.from(new Set(updatedArray));
//                             let ClientData = {
//                                 ADUserId: uniqueValues,
//                             };
//                             props.provider.updateItemWithPnP(ClientData, ListNames.SitesMaster, CurrentSiteMasterId);
//                             return uniqueValues;
//                         });

//                     }
//                 }
//                 const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
//                 toastService.updateLoadingWithSuccess(toastId, toastMessage);
//                 props.manageComponentView({
//                     currentComponentName: ComponentNameEnum.Client, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
//                 });
//                 setIsLoading(false);
//             } else {
//                 toastService.dismiss(toastId);
//                 setIsLoading(false);
//             }
//             setIsLoading(false);
//         } catch (error) {
//             console.log(error);
//             const errorObj = {
//                 ErrorMessage: error.toString(),
//                 ErrorStackTrace: "",
//                 CustomErrormessage: "Error is occuring while  onClickSaveOrUpdate",
//                 PageName: "QuayClean.aspx",
//                 ErrorMethodName: "onClickSaveOrUpdate Client"
//             };
//             void logGenerator(props.provider, errorObj);
//             const errorMessage = 'Something went wrong! Please try again later!';
//             toastService.showError(toastId, errorMessage);
//             setIsLoading(false);
//         }
//     };

//     const getStatenameList = (): void => {
//         const select = ["Id,Title"];
//         let filter = ``;
//         // if (currentUserRoleDetail.isAdmin) {
//         //     filter = ``
//         // }
//         // else if (currentUserRoleDetail.isStateManager) {
//         //     filter = ``
//         // }
//         // else if (currentUserRoleDetail.isSiteManager) {
//         //     filter = ``
//         // }

//         const queryStringOptions: IPnPQueryOptions = {
//             select: select,
//             listName: ListNames.StateMaster,
//             filter: filter,
//         };
//         let dropvalue: any = [];
//         props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {

//             const { isAdmin, isStateManager, isSiteManager, stateManagerStateItem, siteManagerItem } = currentUserRoleDetail;
//             const uniqueSiteIdList: number[] = Array.from(new Set(siteManagerItem.map(item => item.QCStateId)));

//             response.map((State: any) => {
//                 let IsAllowOption = false;

//                 if (isAdmin) {
//                     IsAllowOption = true;
//                 } else if (isStateManager && stateManagerStateItem.includes(State.Id)) {
//                     IsAllowOption = true;
//                 } else if (isSiteManager && uniqueSiteIdList.includes(State.Id)) {
//                     IsAllowOption = true;
//                 }


//                 if (IsAllowOption) {
//                     dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
//                 }
//             });

//             setStateOptions(dropvalue);
//         }).catch((error) => {
//             console.log(error);
//         });
//     };


//     React.useEffect(() => {
//         try {
//             _clientData();
//             getStatenameList();
//             setIsLoading(true);
//             // eslint-disable-next-line no-void
//             void (async () => {
//                 if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
//                     const objItem = await getClientDetailByID(props.componentProps.siteMasterId);

//                     const select = ["Id,Title"];
//                     const filter = `QCStateId eq '${objItem.StateId}'`;
//                     const queryStringOptions: IPnPQueryOptions = {
//                         select: select,
//                         filter: filter,
//                         listName: ListNames.SitesMaster
//                     };
//                     let dropvalue: any = [];
//                     let nameofstate: any = [];
//                     props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
//                         response.map((Site: any) => {
//                             dropvalue.push({ value: Site.Id, key: Site.Id, text: Site.Title, label: Site.Title });
//                             nameofstate.push(Site.Id);
//                         });
//                         setSiteOptions(dropvalue);
//                     }).catch((error) => {
//                         console.log(error);
//                     });

//                     const select2 = ["Id,Title,ADUserId"];
//                     let filter2 = `Id eq '${objItem.SiteNameId}'`;
//                     const queryStringOptions2: IPnPQueryOptions = {
//                         select: select2,
//                         filter: filter2,
//                         listName: ListNames.SitesMaster
//                     };
//                     props.provider.getItemsByQuery(queryStringOptions2).then((response: any) => {
//                         if (response.length > 0) {
//                             //setCurrentUser(response[0].ADUserId);
//                             setCurrentUser(response[0]?.ADUserId || []);
//                             setCurrentSiteMasterId(response[0].Id);
//                         }
//                     }).catch((error) => {
//                         console.log(error);
//                     });


//                     // setselectedClient([objItem.Client[0]?.EMail]);
//                     setselectedClient([objItem.Client?.EMail]);
//                     setDefaultState(objItem.StateId);
//                     setDefaultSite(objItem.SiteNameId);
//                     // setCurrentClientId([objItem.Client[0]?.Id]);
//                     setCurrentClientId([objItem.Client?.Id]);
//                     const items: any = {
//                         Id: parseInt(objItem.Id),
//                         FirstName: !!objItem.FirstName ? objItem.FirstName : "",
//                         LastName: !!objItem.LastName ? objItem.LastName : "",
//                         SiteNameId: !!objItem.SiteNameId ? objItem.SiteNameId : "",
//                         StateId: !!objItem.StateId ? objItem.StateId : "",
//                         Notes: !!objItem.Notes ? objItem.Notes : "",
//                         EmailAddress: !!objItem.EmailAddress ? objItem.EmailAddress : "",
//                         // ClientId: !!objItem.Client ? [objItem.Client[0]?.Id] : "",
//                         ClientId: !!objItem.Client ? [objItem.Client?.Id] : "",
//                     };
//                     setNewFromObj(items);
//                     setIsLoading(false);
//                 } else {
//                     setIsLoading(false);
//                 }
//                 setIsLoading(false);
//             })();


//         } catch (error) {
//             setIsLoading(false);

//             console.log(error);
//         }

//     }, []);

//     React.useEffect(() => {
//         if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
//             setIsDisabled(true);
//         } else {
//             setIsDisabled(false);
//         }
//     }, []);

//     return <>
//         {isLoading && <Loader />}

//         {state.isformValidationModelOpen &&
//             <CustomModal
//                 isModalOpenProps={state.isformValidationModelOpen} setModalpopUpFalse={() => {
//                     SetState(prevState => ({ ...prevState, isformValidationModelOpen: false }));
//                 }} subject={"Missing data"}
//                 message={state.validationMessage} closeButtonText={"Close"} />}

//         <div className="boxCard">
//             <div className="formGroup">
//                 <div className="ms-Grid">
//                     <div className="ms-Grid-row">
//                         <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween">
//                             <div> <h1 className="mainTitle">Add Client form</h1></div>
//                             <div className="dFlex">
//                                 <div>
//                                     <PrimaryButton
//                                         className="btn btn-danger"
//                                         text="Close"
//                                         onClick={() => {
//                                             const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
//                                             props.manageComponentView({
//                                                 currentComponentName: ComponentNameEnum.Client, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
//                                             });
//                                         }}
//                                     />
//                                 </div>
//                             </div>

//                         </div>
//                         <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
//                             <div className="customebreadcrumb">
//                                 <Breadcrumb
//                                     items={props.breadCrumItems}
//                                     maxDisplayedItems={3}
//                                     ariaLabel="Breadcrumb with items rendered as buttons"
//                                     overflowAriaLabel="More links"
//                                 />
//                             </div>
//                         </div>
//                         <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 mb-3">
//                             <div className="ms-Grid-row">
//                                 <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">
//                                     <TextField className="formControl" label="First Name" placeholder="Enter First Name"
//                                         value={newFromObj?.FirstName}
//                                         required
//                                         onChange={(event, value) => {
//                                             setNewFromObj(prevState => ({ ...prevState, FirstName: value }));
//                                         }} />
//                                 </div>
//                                 <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">
//                                     <TextField className="formControl" label="Last Name" placeholder="Enter Last Name"
//                                         value={newFromObj?.LastName}
//                                         onChange={(event, value) => {
//                                             setNewFromObj(prevState => ({ ...prevState, LastName: value }));
//                                         }} />
//                                 </div>
//                                 <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">
//                                     <TextField className="formControl" label="Client Email" placeholder="Enter Client Email"
//                                         value={newFromObj?.EmailAddress}
//                                         required
//                                         onChange={handleEmailChange}
//                                         errorMessage={emailError}
//                                     // onChange={(event, value) => {
//                                     //     setNewFromObj(prevState => ({ ...prevState, EmailAddress: value }));
//                                     // }} 
//                                     />
//                                 </div>
//                                 <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">

//                                     <Label className="labelForm">State<span className="required">*</span></Label>


//                                     <ReactDropdown
//                                         options={stateOptions}
//                                         defaultOption={defaultState}
//                                         isMultiSelect={false}
//                                         onChange={_onStateChange}
//                                         isDisabled={isDisabled}
//                                         placeholder={'State'}
//                                     />
//                                 </div>
//                                 <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">
//                                     <Label className="labelForm">Venue<span className="required">*</span></Label>


//                                     < ReactDropdown
//                                         options={siteOptions}
//                                         isMultiSelect={false}
//                                         defaultOption={defaultSite}
//                                         onChange={_onSiteChange}
//                                         isDisabled={isDisabled}
//                                         placeholder={"Venue"}
//                                     />

//                                 </div>
//                                 <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">
//                                     {<PeoplePicker
//                                         context={props.context as any}
//                                         titleText="Quayclean User"
//                                         personSelectionLimit={1}
//                                         showtooltip={true}
//                                         defaultSelectedUsers={selectedClient}
//                                         disabled={false}
//                                         ensureUser={true}
//                                         onChange={getPeoplePickerItems}
//                                         showHiddenInUI={false}
//                                         required={false}
//                                         principalTypes={[PrincipalType.User]}
//                                         resolveDelay={1000} />}
//                                     {IdExists && <span className="required">Client Already Exist</span>}
//                                 </div>
//                                 <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12">
//                                     <TextField className="formControl" label="Notes" placeholder="Enter Notes"
//                                         value={newFromObj?.Notes}
//                                         multiline
//                                         rows={3}
//                                         onChange={(event, value) => {
//                                             setNewFromObj(prevState => ({ ...prevState, Notes: value }));
//                                         }} />
//                                 </div>
//                             </div>
//                         </div>

//                         <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">

//                             {(emailError || IdExists) ?
//                                 <PrimaryButton
//                                     style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
//                                     className="btn btn-secondary"
//                                     disabled={true}
//                                     text={state.isAddNewHelpDesk ? 'Save' : "Update"}
//                                     onClick={onClickSaveOrUpdate}
//                                 /> :
//                                 <PrimaryButton
//                                     style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
//                                     className="btn btn-primary"
//                                     text={state.isAddNewHelpDesk ? 'Save' : "Update"}
//                                     onClick={onClickSaveOrUpdate}
//                                 />
//                             }

//                             <PrimaryButton
//                                 style={{ marginBottom: "5px", marginTop: "10px" }}
//                                 className="btn btn-danger"
//                                 text="Cancel"
//                                 onClick={() => {
//                                     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
//                                     props.manageComponentView({
//                                         currentComponentName: ComponentNameEnum.Client, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
//                                     });
//                                 }}
//                             />

//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div >
//     </>;

// };
