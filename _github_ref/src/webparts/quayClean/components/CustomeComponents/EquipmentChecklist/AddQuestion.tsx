import { Breadcrumb, IDropdownOption, Label, PrimaryButton, TextField, Toggle } from "@fluentui/react";
import * as React from "react";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum, } from "../../../../../Common/Enum/ComponentNameEnum";
import CustomModal from "../../CommonComponents/CustomModal";
import { Loader } from "../../CommonComponents/Loader";
import { toastService } from "../../../../../Common/ToastService";
import { ValidateForm } from "../../../../../Common/Validation";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../Interfaces/IAddNewHelpDesk";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { logGenerator, removeElementOfBreadCrum, UserActivityLog } from "../../../../../Common/Util";
import { QuestionTypeFilter } from "../../../../../Common/Filter/QuestionType";
import { AssetTypeMasterFilter } from "../../../../../Common/Filter/AssetTypeMaster";
import { QuestionOptionFilter } from "../../../../../Common/Filter/QuestionOption";
import { ChecklistTypeFilter } from "../../../../../Common/Filter/ChecklistType";
import { ManufacturerATMFilter } from "../../../../../Common/Filter/ManufacturerATM";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";


export const AddQuestion = (props: IHelpDeskFormProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { isAddNewHelpDesk } = props;
    const [emailError, setEmailError] = React.useState<any>("");
    const [selectedManufacturerATM, setSelectedManufacturerATM] = React.useState<any>();
    const [IdExists, setIdExists] = React.useState<boolean>(false);
    const [selectedQuestionType, setSelectedQuestionType] = React.useState<any>("Choice");
    const [selectedQuestionOption, setSelectedQuestionOption] = React.useState<any>("Yes|No|N/A");
    const [selectedAssetTypeMaster, setSelectedAssetTypeMaster] = React.useState<any>("");
    const [selectedChecklistType, setSelectedChecklistType] = React.useState<any>("Both");
    const [IsRequired, setIsRequired] = React.useState<boolean>(false);
    const [optionsList, setOptionsList] = React.useState<IDropdownOption[]>([]);
    const [defaultOption, setDefaultOption] = React.useState<any>();
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
        AssetTypeId: "",
        Option: "Yes|No|N/A",
        IsRequired: null,
        QuestionType: "Choice",
        ChecklistType: "Both",
        IsActive: true,
        Manufacturer: ""
    });

    // const _onSiteChange = (option: any, actionMeta: ActionMeta<any>): void => {
    //     setSelectedOption(option?.text);
    //     setDefaultOption(option?.value);

    // };

    const onManufacturerATMChange = (manufacturer: any): void => {
        setSelectedAssetTypeMaster("");
        setSelectedManufacturerATM(manufacturer.text);
        setNewFromObj((prevState: any) => ({ ...prevState, Manufacturer: manufacturer.value, AssetTypeId: null }));
    };

    function _onChangeIsRequired(ev: React.MouseEvent<HTMLElement>, checked?: boolean) {
        if (checked !== undefined) {
            setIsRequired(checked);
            setNewFromObj((prevState: any) => ({ ...prevState, IsRequired: checked }));
        }
    }

    const onQuestionTypeChange = (QuestionTypeId: string): void => {
        setSelectedQuestionType(QuestionTypeId);
        if (QuestionTypeId !== "Choice") {
            setNewFromObj((prevState: any) => ({ ...prevState, Option: "" }));
        } else {
            setNewFromObj((prevState: any) => ({ ...prevState, Option: "Yes|No|N/A" }));
            setSelectedQuestionOption("Yes|No|N/A");
        }
        setNewFromObj((prevState: any) => ({ ...prevState, QuestionType: QuestionTypeId }));
    };

    const onQuestionOptionChange = (QuestionOptionId: string): void => {
        setSelectedQuestionOption(QuestionOptionId);
        setNewFromObj((prevState: any) => ({ ...prevState, Option: QuestionOptionId }));
    };

    const onChecklistTypeChange = (ChecklistTypeId: string): void => {
        setSelectedChecklistType(ChecklistTypeId);
        setNewFromObj((prevState: any) => ({ ...prevState, ChecklistType: ChecklistTypeId }));
    };

    const onAssetTypeMasterChange = (AssetTypeMasterId: any): void => {
        setSelectedAssetTypeMaster(AssetTypeMasterId.value);
        setDefaultOption(AssetTypeMasterId?.value);
        setNewFromObj((prevState: any) => ({ ...prevState, AssetTypeId: AssetTypeMasterId.value }));
    };


    const getQuestionByID = (Id: number) => {
        if (!!Id) {
            const select = ["ID,Title,AssetTypeId,AssetType/Title,Option,IsRequired,QuestionType,ChecklistType,Manufacturer"];
            const expand = ["AssetType"];
            const filter = `ID eq ${Id}`;
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.QuestionMaster,
                select: select,
                expand: expand,
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
                    case "Manufacturer":
                        error.push(<div>Manufacturer is required</div>);
                        break;
                    case "AssetTypeId":
                        error.push(<div>Asset Type is required</div>);
                        break;
                    case "Option":
                        error.push(<div>Option is required</div>);
                        break;
                    case "QuestionType":
                        error.push(<div>Question Type is required</div>);
                        break;
                    case "ChecklistType":
                        error.push(<div>Checklist Type is required</div>);
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
            if (selectedQuestionType === "Choice") {
                validationFields = {
                    "required": ['Title', 'Manufacturer', 'AssetTypeId', 'Option', 'QuestionType', 'ChecklistType'],
                };
            } else {
                validationFields = {
                    "required": ['Title', 'Manufacturer', 'AssetTypeId', 'QuestionType', 'ChecklistType'],
                };
            }


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
                const toastMessage = (newFromObj.Id && newFromObj.Id > 0) ? 'Checklist question has been updated successfully!' : 'Checklist question has been added successfully!';
                if (newFromObj.Id && newFromObj.Id > 0) {
                    await props.provider.updateItemWithPnP(newFromObj, ListNames.QuestionMaster, newFromObj.Id);
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        // SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                        ActionType: UserActivityActionTypeEnum.Update,
                        EntityType: UserActionEntityTypeEnum.QuestionBank,
                        EntityId: Number(newFromObj.Id),
                        EntityName: newFromObj.Title,
                        Details: `Update Question`
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                }
                else {
                    await props.provider.createItem(newFromObj, ListNames.QuestionMaster).then((res) => {
                        let createdId = res.data.Id;
                        const logObj = {
                            UserName: props?.loginUserRoleDetails?.title,
                            // SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                            ActionType: UserActivityActionTypeEnum.Create,
                            EntityType: UserActionEntityTypeEnum.QuestionBank,
                            EntityId: Number(createdId),
                            EntityName: newFromObj.Title,
                            Details: `Add Question`
                        };
                        void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                    })
                }
                const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.Question, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
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
                    setIsRequired(objItem.IsRequired);
                    setSelectedAssetTypeMaster(objItem.AssetTypeId);
                    setSelectedQuestionOption(objItem.Option);
                    setSelectedQuestionType(objItem.QuestionType);
                    setSelectedChecklistType(objItem.ChecklistType);
                    setSelectedManufacturerATM(objItem.Manufacturer);
                    const items: any = {
                        Id: parseInt(objItem.Id),
                        Title: !!objItem.Title ? objItem.Title : "",
                        AssetTypeId: !!objItem.AssetTypeId ? objItem.AssetTypeId : "",
                        Option: !!objItem.Option ? objItem.Option : "",
                        IsRequired: !!objItem.IsRequired ? objItem.IsRequired : false,
                        QuestionType: !!objItem.QuestionType ? objItem.QuestionType : "",
                        ChecklistType: !!objItem.ChecklistType ? objItem.ChecklistType : "",
                        Manufacturer: !!objItem.Manufacturer ? objItem.Manufacturer : "",
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

    React.useEffect(() => {

        const select = ["Id,Title"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.AssetTypeMaster,
            filter: `Manufacturer eq '${selectedManufacturerATM}'`
        };
        let dropvalue: any = [];
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((State: any) => {
                dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
            });
            setOptionsList(dropvalue);
        }).catch((error) => {
            console.log(error);
        });

    }, [selectedManufacturerATM]);

    return <>
        {isLoading && <Loader />}

        {state.isformValidationModelOpen &&
            <CustomModal
                isModalOpenProps={state.isformValidationModelOpen} setModalpopUpFalse={() => {
                    SetState(prevState => ({ ...prevState, isformValidationModelOpen: false }));
                }} subject={"Missing data"}
                message={state.validationMessage} closeButtonText={"Close"} />}

        <div className="outer-boxcard">
            <div className="boxCard">
                <div className="formGroup">
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween">
                                <div><h1 className="mainTitle">Equipment Checklist Form</h1></div>
                                <div className="dFlex">
                                    <div>
                                        <PrimaryButton className="btn btn-danger justifyright floatright"
                                            onClick={() => {
                                                const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                                props.manageComponentView({
                                                    currentComponentName: ComponentNameEnum.Question, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
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
                                        <Label className="formLabel">Manufacturer<span className="required">*</span></Label>
                                        <ManufacturerATMFilter
                                            selectedManufacturerATM={selectedManufacturerATM}
                                            defaultOption={!!selectedManufacturerATM ? selectedManufacturerATM : ""}
                                            onOptionChange={onManufacturerATMChange}
                                            provider={props.provider}
                                            isRequired={true} />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">
                                        <Label className="formLabel">Asset Type<span className="required"> *</span></Label>
                                        <div className="formControl">
                                            {/* <AssetTypeMasterFilter
                                            selectedAssetTypeMaster={selectedAssetTypeMaster}
                                            defaultOption={!!selectedAssetTypeMaster ? selectedAssetTypeMaster : ""}
                                            onOptionChange={onAssetTypeMasterChange}
                                            provider={props.provider}
                                            isRequired={true} /> */}


                                            < ReactDropdown
                                                options={optionsList}
                                                isMultiSelect={false}
                                                defaultOption={!!selectedAssetTypeMaster ? selectedAssetTypeMaster : ""}
                                                onChange={onAssetTypeMasterChange}
                                                placeholder={"Asset Type"}
                                            />
                                        </div>
                                    </div>


                                    <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">
                                        <Label className="formLabel">Question Type<span className="required"> *</span></Label>
                                        <div className="formControl">
                                            <QuestionTypeFilter
                                                selectedQuestionType={selectedQuestionType}
                                                defaultOption={!!selectedQuestionType ? selectedQuestionType : ""}
                                                onQuestionTypeChange={onQuestionTypeChange}
                                                provider={props.provider}
                                                isRequired={true} />
                                        </div>
                                    </div>
                                    {selectedQuestionType === "Choice" &&
                                        <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">
                                            <Label className="formLabel">Options<span className="required"> *</span></Label>
                                            <div className="formControl">
                                                <QuestionOptionFilter
                                                    selectedQuestionOption={selectedQuestionOption}
                                                    defaultOption={!!selectedQuestionOption ? selectedQuestionOption : ""}
                                                    onQuestionOptionChange={onQuestionOptionChange}
                                                    provider={props.provider}
                                                    isRequired={true} />
                                            </div>
                                        </div>}
                                    <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">
                                        <Label className="formLabel">Checklist Type<span className="required"> *</span></Label>
                                        <div className="formControl">
                                            <ChecklistTypeFilter
                                                selectedChecklistType={selectedChecklistType}
                                                defaultOption={!!selectedChecklistType ? selectedChecklistType : ""}
                                                onChecklistTypeChange={onChecklistTypeChange}
                                                provider={props.provider}
                                                isRequired={true} />
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">
                                        <Toggle label="Is Required"
                                            onText="Yes" offText="No"
                                            checked={IsRequired}
                                            onChange={_onChangeIsRequired} />
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
                                            currentComponentName: ComponentNameEnum.Question, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
                                        });
                                    }}
                                />

                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </div>
    </>;

};
