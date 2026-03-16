import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { Label, PrimaryButton, TextField, Toggle } from "@fluentui/react";
import { ManufacturerATMFilter } from "../../../../../Common/Filter/ManufacturerATM";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { QuestionTypeFilter } from "../../../../../Common/Filter/QuestionType";
import { QuestionOptionFilter } from "../../../../../Common/Filter/QuestionOption";
import { ChecklistTypeFilter } from "../../../../../Common/Filter/QuestionChecklistType";
import { ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { logGenerator, UserActivityLog } from "../../../../../Common/Util";
import { toastService } from "../../../../../Common/ToastService";
import { IDropdownOption } from "office-ui-fabric-react";
import { IHelpDeskFormState } from "../../../../../Interfaces/IAddNewHelpDesk";
import { ValidateForm } from "../../../../../Common/Validation";
import CustomModal from "../../CommonComponents/CustomModal";

interface IAddQuestionDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    provider: IDataProvider;
    // siteNameId?: any;
    onAfterChange?: () => void;
    // moduleImg: string;
    isAddNewHelpDesk: boolean;
    loginUserRoleDetails: any;
    componentProps: any;
}

export const AddQuestionDrawer: React.FC<IAddQuestionDrawerProps> = ({
    isOpen,
    onClose,
    provider,
    // siteNameId,
    onAfterChange,
    // moduleImg,
    isAddNewHelpDesk,
    loginUserRoleDetails,
    componentProps
}) => {

    const [isLoading, setIsLoading] = React.useState<boolean>(false);
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
            return provider.getByItemByIDQuery(queryOptions);
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

    const resetForm = () => {
        setNewFromObj({
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

        setSelectedManufacturerATM("");
        setSelectedAssetTypeMaster("");
        setSelectedQuestionType("Choice");
        setSelectedQuestionOption("Yes|No|N/A");
        setSelectedChecklistType("Both");
        setIsRequired(false);
        setOptionsList([]);
        setDefaultOption(undefined);

        SetState(prev => ({
            ...prev,
            isformValidationModelOpen: false,
            validationMessage: null
        }));
    };

    const onCloseDrawer = () => {
        resetForm();
        onClose();
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
                    await provider.updateItemWithPnP(newFromObj, ListNames.QuestionMaster, newFromObj.Id);
                    const logObj = {
                        UserName: loginUserRoleDetails?.title,
                        // SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                        ActionType: UserActivityActionTypeEnum.Update,
                        EntityType: UserActionEntityTypeEnum.QuestionBank,
                        EntityId: Number(newFromObj.Id),
                        EntityName: newFromObj.Title,
                        Details: `Update Question`
                    };
                    void UserActivityLog(provider, logObj, loginUserRoleDetails);
                }
                else {
                    await provider.createItem(newFromObj, ListNames.QuestionMaster).then((res) => {
                        let createdId = res.data.Id;
                        const logObj = {
                            UserName: loginUserRoleDetails?.title,
                            // SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                            ActionType: UserActivityActionTypeEnum.Create,
                            EntityType: UserActionEntityTypeEnum.QuestionBank,
                            EntityId: Number(createdId),
                            EntityName: newFromObj.Title,
                            Details: `Add Question`
                        };
                        void UserActivityLog(provider, logObj, loginUserRoleDetails);
                    })
                }
                // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                onCloseDrawer();
                onAfterChange?.();
                // props.manageComponentView({
                //     currentComponentName: ComponentNameEnum.Question, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
                // });
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
            void logGenerator(provider, errorObj);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (!isOpen) return;

        // 🔹 EDIT MODE
        if (componentProps?.siteMasterId && componentProps.siteMasterId > 0) {
            setIsLoading(true);

            (async () => {
                try {
                    const item = await getQuestionByID(componentProps.siteMasterId);

                    setNewFromObj({
                        Id: Number(item.Id),
                        Title: item.Title || "",
                        AssetTypeId: item.AssetTypeId || "",
                        Option: item.Option || "",
                        IsRequired: !!item.IsRequired,
                        QuestionType: item.QuestionType || "Choice",
                        ChecklistType: item.ChecklistType || "Both",
                        IsActive: true,
                        Manufacturer: item.Manufacturer || ""
                    });

                    setSelectedManufacturerATM(item.Manufacturer);
                    setSelectedAssetTypeMaster(item.AssetTypeId);
                    setSelectedQuestionType(item.QuestionType);
                    setSelectedQuestionOption(item.Option);
                    setSelectedChecklistType(item.ChecklistType);
                    setIsRequired(!!item.IsRequired);

                } catch (error) {
                    console.error("Failed to load question", error);
                } finally {
                    setIsLoading(false);
                }
            })();
        }

        else {
            resetForm();
        }

    }, [isOpen, componentProps?.siteMasterId]);


    // React.useEffect(() => {
    //     try {
    //         setIsLoading(true);
    //         // eslint-disable-next-line no-void
    //         void (async () => {
    //             if (componentProps?.siteMasterId && componentProps?.siteMasterId > 0) {
    //                 const objItem = await getQuestionByID(componentProps.siteMasterId);
    //                 setIsRequired(objItem.IsRequired);
    //                 setSelectedAssetTypeMaster(objItem.AssetTypeId);
    //                 setSelectedQuestionOption(objItem.Option);
    //                 setSelectedQuestionType(objItem.QuestionType);
    //                 setSelectedChecklistType(objItem.ChecklistType);
    //                 setSelectedManufacturerATM(objItem.Manufacturer);
    //                 const items: any = {
    //                     Id: parseInt(objItem.Id),
    //                     Title: !!objItem.Title ? objItem.Title : "",
    //                     AssetTypeId: !!objItem.AssetTypeId ? objItem.AssetTypeId : "",
    //                     Option: !!objItem.Option ? objItem.Option : "",
    //                     IsRequired: !!objItem.IsRequired ? objItem.IsRequired : false,
    //                     QuestionType: !!objItem.QuestionType ? objItem.QuestionType : "",
    //                     ChecklistType: !!objItem.ChecklistType ? objItem.ChecklistType : "",
    //                     Manufacturer: !!objItem.Manufacturer ? objItem.Manufacturer : "",
    //                 };
    //                 setNewFromObj(items);
    //                 setIsLoading(false);
    //             } else {
    //                 setIsLoading(false);
    //             }
    //             setIsLoading(false);
    //         })();

    //     } catch (error) {
    //         setIsLoading(false);
    //         const errorObj = { ErrorMethodName: "useEffect Help desk form ", CustomErrormessage: "error in use effect Help desk form", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
    //         void logGenerator(provider, errorObj);
    //         console.log(error);
    //     }

    // }, []);

    React.useEffect(() => {

        const select = ["Id,Title"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.AssetTypeMaster,
            filter: `Manufacturer eq '${selectedManufacturerATM}'`
        };
        let dropvalue: any = [];
        provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((State: any) => {
                dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
            });
            setOptionsList(dropvalue);
        }).catch((error) => {
            console.log(error);
        });

    }, [selectedManufacturerATM]);

    return (
        <>
            {isOpen && <div className="overlay show" onClick={onCloseDrawer} />}

            <aside className={`drawer asset-type-drawer ${isOpen ? "open" : ""}`}>
                <div className="flex items-center mb-3 justify-between">
                    <h3>Equipment Checklist Form</h3>
                    <button className="btn" onClick={onCloseDrawer}>✕</button>
                </div>
                <div className="formGroup">
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
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

                                    <div className="ms-Grid-col ms-sm12">
                                        <Label className="formLabel">Manufacturer<span className="required">*</span></Label>
                                        <ManufacturerATMFilter
                                            selectedManufacturerATM={selectedManufacturerATM}
                                            defaultOption={!!selectedManufacturerATM ? selectedManufacturerATM : ""}
                                            onOptionChange={onManufacturerATMChange}
                                            provider={provider}
                                            isRequired={true} />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12">
                                        <Label className="formLabel">Asset Type<span className="required"> *</span></Label>
                                        <div className="formControl">
                                            {/* <AssetTypeMasterFilter
                                                            selectedAssetTypeMaster={selectedAssetTypeMaster}
                                                            defaultOption={!!selectedAssetTypeMaster ? selectedAssetTypeMaster : ""}
                                                            onOptionChange={onAssetTypeMasterChange}
                                                            provider={props.provider}
                                                            isRequired={true} /> */}


                                            <ReactDropdown
                                                options={optionsList}
                                                isMultiSelect={false}
                                                defaultOption={!!selectedAssetTypeMaster ? selectedAssetTypeMaster : ""}
                                                onChange={onAssetTypeMasterChange}
                                                placeholder={"Asset Type"}
                                            />
                                        </div>
                                    </div>


                                    <div className="ms-Grid-col ms-sm12">
                                        <Label className="formLabel">Question Type<span className="required"> *</span></Label>
                                        <div className="formControl">
                                            <QuestionTypeFilter
                                                selectedQuestionType={selectedQuestionType}
                                                defaultOption={!!selectedQuestionType ? selectedQuestionType : ""}
                                                onQuestionTypeChange={onQuestionTypeChange}
                                                provider={provider}
                                                isRequired={true} />
                                        </div>
                                    </div>
                                    {selectedQuestionType === "Choice" &&
                                        <div className="ms-Grid-col ms-sm12">
                                            <Label className="formLabel">Options<span className="required"> *</span></Label>
                                            <div className="formControl">
                                                <QuestionOptionFilter
                                                    selectedQuestionOption={selectedQuestionOption}
                                                    defaultOption={!!selectedQuestionOption ? selectedQuestionOption : ""}
                                                    onQuestionOptionChange={onQuestionOptionChange}
                                                    provider={provider}
                                                    isRequired={true} />
                                            </div>
                                        </div>}
                                    <div className="ms-Grid-col ms-sm12">
                                        <Label className="formLabel">Checklist Type<span className="required"> *</span></Label>
                                        <div className="formControl">
                                            <ChecklistTypeFilter
                                                selectedChecklistType={selectedChecklistType}
                                                defaultOption={!!selectedChecklistType ? selectedChecklistType : ""}
                                                onChecklistTypeChange={onChecklistTypeChange}
                                                provider={provider}
                                                isRequired={true} />
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm12">
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
                                        text={isAddNewHelpDesk ? 'Save' : "Update"}
                                        onClick={onClickSaveOrUpdate}
                                    /> :
                                    <PrimaryButton
                                        style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                        className="btn btn-primary"
                                        text={isAddNewHelpDesk ? 'Save' : "Update"}
                                        onClick={onClickSaveOrUpdate}
                                    />
                                }

                                <PrimaryButton
                                    style={{ marginBottom: "5px", marginTop: "10px" }}
                                    className="btn btn-danger"
                                    text="Cancel"
                                    onClick={onCloseDrawer}
                                // onClick={() => {
                                //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                //     props.manageComponentView({
                                //         currentComponentName: ComponentNameEnum.Question, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
                                //     });
                                // }}
                                />

                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            {state.isformValidationModelOpen && (
                <CustomModal
                    isModalOpenProps={state.isformValidationModelOpen}
                    setModalpopUpFalse={() =>
                        SetState(prev => ({
                            ...prev,
                            isformValidationModelOpen: false
                        }))
                    }
                    subject="Missing data"
                    message={state.validationMessage}
                    closeButtonText="Close"
                />
            )}
        </>
    );
};