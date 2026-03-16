import { Breadcrumb, Label, PrimaryButton, TextField } from "@fluentui/react";
import * as React from "react";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum, } from "../../../../../Common/Enum/ComponentNameEnum";
import CustomModal from "../../CommonComponents/CustomModal";
import { Loader } from "../../CommonComponents/Loader";
import { toastService } from "../../../../../Common/ToastService";
import { ValidateForm } from "../../../../../Common/Validation";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../Interfaces/IAddNewHelpDesk";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { getSiteGroupsPermission, logGenerator, removeElementOfBreadCrum, UserActivityLog } from "../../../../../Common/Util";
import { HMHFilterFilter } from "../../../../../Common/Filter/HowManyHoursFilter";
import { ManufacturerFilter } from "../../../../../Common/Filter/ManufacturerFilter";
import { useAtomValue } from "jotai";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";


export const AddAssetTypeMaster = (props: IHelpDeskFormProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [selectedHMH, setSelectedHMH] = React.useState<any>("");
     const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const [selectedManufacturer, setSelectedManufacturer] = React.useState<any>();
    const { isAddNewHelpDesk } = props;
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
        HowManyHours: "",
        Manufacturer: ""
    });

    const onHMHChange = (HMHId: string): void => {
        setSelectedHMH(HMHId);
        setNewFromObj((prevState: any) => ({ ...prevState, HowManyHours: HMHId }));
    };

    const onManufacturerChange = (manufacturer: any): void => {
        setSelectedManufacturer(manufacturer.text);
        setNewFromObj((prevState: any) => ({ ...prevState, Manufacturer: manufacturer.value }));
    };

    const getAssetTypeMasterByID = (Id: number) => {
        if (!!Id) {
            const select = ["ID,Title,HowManyHours,Manufacturer"];
            const filter = `ID eq ${Id}`;
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.AssetTypeMaster,
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
                    case "Manufacturer":
                        error.push(<div>Manufacturer is required</div>);
                        break;
                    case "Title":
                        error.push(<div>Asset Type is required</div>);
                        break;
                    case "HowManyHours":
                        error.push(<div>How Many Hours is required</div>);
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
                "required": ['Title', 'HowManyHours', 'Manufacturer'],
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
                const toastMessage = (newFromObj.Id && newFromObj.Id > 0) ? 'Asset Type has been updated successfully!' : 'Asset Type has been added successfully!';
                if (newFromObj.Id && newFromObj.Id > 0) {
                    await props.provider.updateItemWithPnP(newFromObj, ListNames.AssetTypeMaster, newFromObj.Id);
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        ActionType: UserActivityActionTypeEnum.Update,
                        // SiteNameId: newFromObj?.SiteNameId,
                        EntityType: UserActionEntityTypeEnum.AssetTypeMaster,
                        EntityId: newFromObj.Id,
                        EntityName: `${newFromObj.Title}`,
                        Details: `Update Asset Type Master`
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                }
                else {
                    await props.provider.createItem(newFromObj, ListNames.AssetTypeMaster).then((res) => {
                        const logObj = {
                            UserName: props?.loginUserRoleDetails?.title,
                            ActionType: UserActivityActionTypeEnum.Create,
                            // SiteNameId: newFromObj?.SiteNameId,
                            EntityType: UserActionEntityTypeEnum.AssetTypeMaster,
                            EntityId: res?.data?.ID,
                            EntityName: `${newFromObj.Title}`,
                            Details: `Create Asset Type Master`
                        };
                        void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                    }).catch((error) => {
                        console.log(error);
                    });
                }
                const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.AssetTypeMaster, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
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
                    const objItem = await getAssetTypeMasterByID(props.componentProps.siteMasterId);
                    setSelectedHMH(objItem.HowManyHours);
                    setSelectedManufacturer(objItem.Manufacturer);
                    const items: any = {
                        Id: parseInt(objItem.Id),
                        Title: !!objItem.Title ? objItem.Title : "",
                        HowManyHours: !!objItem.HowManyHours ? objItem.HowManyHours : "",
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

    const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
    React.useEffect(() => {
        props.provider.getCurrentUser().then(async (currentUserResponse) => {
            const groups = await getSiteGroupsPermission(props.provider);
            if (groups.some((r: any) => r.Id === currentUserResponse.Id)) {
                setIsAdmin(true);
            }
        }).catch(console.error);
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
                            <div><h1 className="mainTitle">Asset Type Master Form</h1></div>
                            <div className="dFlex">
                                <div>
                                    <PrimaryButton className="btn btn-danger justifyright floatright"
                                        onClick={() => {
                                            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                            props.manageComponentView({
                                                currentComponentName: ComponentNameEnum.AssetTypeMaster, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
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
                                <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">
                                    <Label className="formLabel">Manufacturer<span className="required">*</span></Label>
                                    <ManufacturerFilter
                                        loginUserRoleDetails={props.loginUserRoleDetails}
                                        selectedManufacturer={selectedManufacturer}
                                        defaultOption={selectedManufacturer}
                                        onManufacturerChange={onManufacturerChange}
                                        provider={props.provider}
                                        isAdmin={isAdmin}
                                        defaultSelectedSitesId={!!selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId}
                                        isRequired={true} />
                                </div>
                                <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">
                                    <TextField className="formControl" label="Asset Type" placeholder="Enter Asset Type"
                                        value={newFromObj?.Title}
                                        required
                                        onChange={(event, value) => {
                                            setNewFromObj((prevState: any) => ({ ...prevState, Title: value }));
                                        }} />
                                </div>
                                <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4">
                                    <Label className="formLabel">Frequency<span className="required">*</span></Label>
                                    <HMHFilterFilter
                                        selectedHMH={selectedHMH}
                                        defaultOption={!!selectedHMH ? selectedHMH : ""}
                                        onHMHChange={onHMHChange}
                                        provider={props.provider}
                                        isRequired={true} />
                                </div>
                            </div>
                        </div>

                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <PrimaryButton
                                style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                className="btn btn-primary"
                                text={state.isAddNewHelpDesk ? 'Save' : "Update"}
                                onClick={onClickSaveOrUpdate}
                            />
                            <PrimaryButton
                                style={{ marginBottom: "5px", marginTop: "10px" }}
                                className="btn btn-danger"
                                text="Cancel"
                                onClick={() => {
                                    const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                    props.manageComponentView({
                                        currentComponentName: ComponentNameEnum.AssetTypeMaster, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
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
