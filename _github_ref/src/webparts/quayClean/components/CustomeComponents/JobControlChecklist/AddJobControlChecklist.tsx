import { Breadcrumb, Label, PrimaryButton, TextField } from "@fluentui/react";
import * as React from "react";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum, } from "../../../../../Common/Enum/ComponentNameEnum";
import CustomModal from "../../CommonComponents/CustomModal";
import { Loader } from "../../CommonComponents/Loader";
import { toastService } from "../../../../../Common/ToastService";
import { ValidateForm } from "../../../../../Common/Validation";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../Interfaces/IAddNewHelpDesk";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { getStateBySiteId, logGenerator, removeElementOfBreadCrum, UserActivityLog } from "../../../../../Common/Util";
import { JobControlChecklistFilter } from "../../../../../Common/Filter/JobControlChecklistFrequency";

export const AddJobControlChecklist = (props: IHelpDeskFormProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { isAddNewHelpDesk } = props;
    const [emailError, setEmailError] = React.useState<any>("");
    const [IdExists, setIdExists] = React.useState<boolean>(false);
    const [JobControlChecklist, setJobControlChecklist] = React.useState<any>("");
    const [state, SetState] = React.useState<IHelpDeskFormState>({
        CallerOptions: [],
        CategoryOptions: [],
        EventOptions: [],
        isdisableField: !!isAddNewHelpDesk ? false : true,
        isAddNewHelpDesk: !!isAddNewHelpDesk,
        isformValidationModelOpen: false,
        validationMessage: null
    });

    const [newFromObj, setNewFromObj] = React.useState<any>({
        Id: 0,
        Title: "",
        Frequency: "",
    });

    const onJobControlChecklistChange = (ValueId: string): void => {
        setJobControlChecklist(ValueId);
        setNewFromObj((prevState: any) => ({ ...prevState, Frequency: ValueId }));
    };

    const getQuestionByID = (Id: number) => {
        if (!!Id) {
            const select = ["ID,Title,Frequency"];
            const filter = `ID eq ${Id}`;
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.JobControlChecklist,
                select: select,
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

                    case "Title":
                        error.push(<div>Question is required</div>);
                        break;
                    case "Frequency":
                        error.push(<div>Frequency is required</div>);
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


    const onClickSaveOrUpdate = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        try {
            let isValidateRecord;
            let validationFields: any;
            validationFields = {
                "required": ['Title', 'Frequency'],
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
                const toastMessage = (newFromObj.Id && newFromObj.Id > 0) ? 'Job control checklist question has been updated successfully!' : 'Job control checklist question has been added successfully!';
                if (newFromObj.Id && newFromObj.Id > 0) {
                    await props.provider.updateItemWithPnP(newFromObj, ListNames.JobControlChecklist, newFromObj.Id);
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        // SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                        ActionType: UserActivityActionTypeEnum.Update,
                        EntityType: UserActionEntityTypeEnum.JobControlChecklist,
                        EntityId: Number(newFromObj.Id),
                        EntityName: newFromObj.Title,
                        Details: `Update Job Control Checklist`
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                }
                else {
                    await props.provider.createItem(newFromObj, ListNames.JobControlChecklist).then(async (res) => {
                        let createdId = res.data.Id;
                        const logObj = {
                            UserName: props?.loginUserRoleDetails?.title,
                            // SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                            ActionType: UserActivityActionTypeEnum.Create,
                            EntityType: UserActionEntityTypeEnum.JobControlChecklist,
                            EntityId: Number(createdId),
                            EntityName: newFromObj.Title,
                            Details: `Add Job Control Checklist`
                        };
                        void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                    })
                }
                const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.JobControlChecklist, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
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
                ErrorMethodName: "onClickSaveOrUpdate Client"
            };
            void logGenerator(props.provider, errorObj);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        try {
            setIsLoading(true);
            // eslint-disable-next-line no-void
            void (async () => {
                if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
                    const objItem = await getQuestionByID(props.componentProps.siteMasterId);
                    setJobControlChecklist(objItem.Frequency);
                    const items: any = {
                        Id: parseInt(objItem.Id),
                        Title: !!objItem.Title ? objItem.Title : "",
                        Frequency: !!objItem.Frequency ? objItem.Frequency : "",
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
            const errorObj = { ErrorMethodName: "useEffect Help desk form ", CustomErrormessage: "error in use effect Help desk form", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            console.log(error);
        }

    }, []);

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
                            <div> <h1 className="mainTitle">Equipment Checklist Form</h1></div>
                            <div className="dFlex">
                                <div>
                                    <PrimaryButton className="btn btn-danger justifyright floatright"
                                        onClick={() => {
                                            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                            props.manageComponentView({
                                                currentComponentName: ComponentNameEnum.JobControlChecklist, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
                                            });
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
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 mb-3">
                            <div className="ms-Grid-row">

                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12">
                                    <TextField className="formControl" label="Question" placeholder="Enter Question"
                                        value={newFromObj?.Title}
                                        required
                                        multiline
                                        rows={3}
                                        onChange={(event, value) => {
                                            setNewFromObj((prevState: any) => ({ ...prevState, Title: value }));
                                        }} />
                                </div>

                                <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">
                                    <Label className="formLabel">Frequency<span className="required"> *</span></Label>
                                    <div className="formControl">
                                        <JobControlChecklistFilter
                                            selectedJobControlChecklist={JobControlChecklist}
                                            defaultOption={!!JobControlChecklist ? JobControlChecklist : ""}
                                            onJobControlChecklistChange={onJobControlChecklistChange}
                                            provider={props.provider}
                                            isRequired={true} />
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">

                            {(emailError || IdExists) ?
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
                                        currentComponentName: ComponentNameEnum.JobControlChecklist, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
                                    });
                                }}
                            />

                        </div>
                    </div>
                </div>
            </div>
        </div >
    </>;

};
