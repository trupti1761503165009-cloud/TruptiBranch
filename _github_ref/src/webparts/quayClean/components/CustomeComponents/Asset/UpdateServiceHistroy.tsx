import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { CustomModal } from "../../CommonComponents/CustomModal";
import { DatePicker, Label, TextField, Toggle, defaultDatePickerStrings } from "@fluentui/react";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { INewAssetMaster } from "../../../../../Interfaces/IAssetMaster";
import IPnPQueryOptions, { IAttachment } from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames, UserActionEntityTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { IErrorLog } from "../../../../../Interfaces/IErrorLog";
import { getStateBySiteId, logGenerator, onFormatDate, UserActivityLog } from "../../../../../Common/Util";
import { INewAssetHistory } from "../../../../../Interfaces/IAssetHistory";
import { toastService } from "../../../../../Common/ToastService";
import { ValidateForm } from "../../../../../Common/Validation";
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
export interface IUpdateServiceHistroyProps {
    provider: IDataProvider;
    assetMasterId: number;
    alldata: any;
    isModelOpen: boolean;
    onClickClose(): any;
    context: WebPartContext;

}

export interface IUpdateServiceHistroyState {
    isModelOpen: boolean;
    attachment: IAttachment;
    invoice: IAttachment;
    assetMasterItems: any;
    isformValidationModelOpen: boolean;
    validationMessage: any;
}

export const UpdateServiceHistroy = (props: IUpdateServiceHistroyProps) => {
    const [servicesCompletedBy, setservicesCompletedBy] = React.useState<any[]>([]);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail, currentUser } = appGlobalState;
    const [files, setFiles] = React.useState<any[]>([]);
    const [state, setState] = React.useState<IUpdateServiceHistroyState>({
        attachment: {
            name: "",
            fileContent: null
        },
        invoice: {
            name: "",
            fileContent: null
        },
        isModelOpen: props.isModelOpen,
        assetMasterItems: null,
        isformValidationModelOpen: false,
        validationMessage: ""
    });
    const [assetMasterObj, setAssetMasterObj] = React.useState<INewAssetMaster>({
        IsServiceCompleted: true
    });

    const onCloseModel = () => {
        setState((prevState: any) => ({ ...prevState, attachment: [], invoice: [] }));
        props.onClickClose();

        setState(prevState => ({ ...prevState, isModelOpen: false }));
    };


    const onChangeServiceCompleted = (event: React.MouseEvent<HTMLElement, MouseEvent>, checked?: boolean | undefined) => {
        setAssetMasterObj(prevState => ({ ...prevState, IsServiceCompleted: checked }));
    };

    // const onChnageSiteManger = (items: IPersonaProps[]) => {
    //     setAssetMasterObj((prevState: any) => ({ ...prevState, ServiceCompleteById: items.length > 0 ? items[0].id : 0 }));
    // };

    const onChnageSiteManger = (event: any): void => {
        setservicesCompletedBy(event.target.value);
        setAssetMasterObj((prevState: any) => ({ ...prevState, ServiceCompleteById: event.target.value ? event.target.value : "" }));
    };

    const onChnageDatePicker = (event: any) => {
        setAssetMasterObj((prevState: any) => ({ ...prevState, ServiceDueDate: event }));
    };



    const onChnageFile = (event: any) => {
        let nameWithoutSpace = event.target.files[0].name.replace(/[\s.]+/g, '');
        let extension = event.target.files[0].name.split('.').pop();
        nameWithoutSpace = nameWithoutSpace.replace(extension, "");
        let file: IAttachment = {
            // name: event.target.files[0].name,
            name: `${nameWithoutSpace}.${extension}`,
            fileContent: event.target.files[0]
        };

        setState((prevState: any) => ({ ...prevState, attachment: file }));
    };

    const onChnageInvoice = (event: any) => {
        // let nameWithoutSpace = "Invoice" + event.target.files[0].name.replace(/[\s.]+/g, '');
        let nameWithoutSpace = "Invoice";
        let extension = event?.target?.files[0]?.name?.split('.')?.pop();
        nameWithoutSpace = nameWithoutSpace?.replace(extension, "");

        let file: IAttachment = {
            // name: event.target.files[0].name,
            name: `${nameWithoutSpace}.${extension}`,
            fileContent: event.target.files[0]
        };
        setState((prevState: any) => ({ ...prevState, invoice: file }));

    };

    const errorMessageGenrate = (item: any) => {
        const error: any[] = [];
        let errormessage: any;
        for (const key in item) {
            if (Object.prototype.hasOwnProperty.call(item, key)) {
                switch (key) {
                    case "ServiceCompleteById":
                        error.push(<div>Service Updated by is required</div>);
                        break;
                    case "ServiceDueDate":
                        error.push(<div>Next Service Date is required</div>);
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

    const onClickOfYes = async () => {

        try {
            const validationFields = {
                "requiredDate": ['ServiceDueDate']
            };

            // for asset master 
            let editAssetMasterObj: INewAssetMaster = {
                ServiceUpdatedBy: assetMasterObj.ServiceCompleteById,
                // ServiceCompleteById: assetMasterObj.ServiceCompleteById,
                IsServiceCompleted: assetMasterObj.IsServiceCompleted,
                ServiceDueDate: assetMasterObj.ServiceDueDate
            };
            const isValid = ValidateForm({ ...editAssetMasterObj, attachment: state.attachment.name }, validationFields);
            let errormessage = errorMessageGenrate(isValid);
            if (isValid.isValid) {
                if (!!state.assetMasterItems) {
                    let assetHistory: INewAssetHistory = {
                        Title: state.assetMasterItems.Title,
                        ServiceDate: new Date(),
                        SiteNameId: state.assetMasterItems.SiteNameId,
                        // ServiceCompleteById: assetMasterObj.ServiceCompleteById,
                        ServiceUpdatedBy: assetMasterObj.ServiceCompleteById,
                        AssetMasterId: props.assetMasterId
                    };
                    const toastMessage = 'Service Date  updated successfully!';
                    const toastId = toastService.loading('Loading...');
                    if (state.invoice.fileContent != null && state.attachment.fileContent != null) {
                        await props.provider.updateItemWithPnP(editAssetMasterObj, ListNames.AssetMaster, props.assetMasterId).then((results: any[]) => {
                            props.provider.additemsWithAttachment(ListNames.AssetHistory, assetHistory, state.invoice).then((res: any) => {

                                let uploadid = res?.data?.ID;
                                props.provider.addAttachment(ListNames.AssetHistory, uploadid, state.attachment).then((res: any[]) => {
                                    console.log("success");
                                });

                            });
                        });
                    } else if (state.attachment.fileContent != null) {
                        await props.provider.updateItemWithPnP(editAssetMasterObj, ListNames.AssetMaster, props.assetMasterId).then((results: any[]) => {
                            props.provider.additemsWithAttachment(ListNames.AssetHistory, assetHistory, state.attachment).then((res: any) => {

                            });
                        });
                    } else {
                        await props.provider.updateItemWithPnP(editAssetMasterObj, ListNames.AssetMaster, props.assetMasterId).then((results: any[]) => {
                            props.provider.additemsWithAttachment(ListNames.AssetHistory, assetHistory, state.invoice).then((res: any) => {

                            });
                        });
                    }
                    const stateId = await getStateBySiteId(props.provider, state?.assetMasterItems?.SiteNameId);

                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: state?.assetMasterItems?.SiteNameId,
                        ActionType: "Update",
                        StateId: stateId,
                        EntityType: UserActionEntityTypeEnum.EquipmentAsset,
                        EntityId: Number(props.assetMasterId),
                        EntityName: state?.assetMasterItems?.Title?.toString().trim(),
                        Details: `Update Equipment/Asset Services`
                    };
                    void UserActivityLog(props.provider, logObj, currentUserRoleDetail);


                    setState((prevState: any) => ({ ...prevState, attachment: [], invoice: [] }));
                    setState((prevState: any) => ({
                        ...prevState, attachment: {
                            name: "",
                            fileContent: null
                        }, invoice: {
                            name: "",
                            fileContent: null
                        }
                    }));
                    // await Promise.all([props.provider.updateItemWithPnP(editAssetMasterObj, ListNames.AssetMaster, props.assetMasterId), props.provider.additemsWithAttachment(ListNames.AssetHistory, assetHistory, state.attachment)]);
                    setState(prevState => ({ ...prevState, isModelOpen: false }));
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    props.onClickClose();
                }
            }
            else {
                setState(prevState => ({ ...prevState, validationMessage: errormessage, isformValidationModelOpen: true }));
            }
        } catch (error) {
            const errorObj: IErrorLog = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error in onClickOfYes  ",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "Add New Project  Move Asset::  onClickOfYes  "
            };
            void logGenerator(props.provider, errorObj);
            console.log(errorObj);
        }

    };
    const today = new Date();
    const modelContent = <>
        <div className="ms-SPLegacyFabricBlock">
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6 ">
                        <div className="formControl">
                            <TextField type="Text"
                                label="Service Updated by"
                                onChange={onChnageSiteManger}
                                placeholder="Enter Service Updated by"
                            />
                            {/* <PeoplePicker
                                context={props.context as any}
                                titleText="Service Completed by"
                                personSelectionLimit={1}
                                showtooltip={true}
                                required={true}
                                ensureUser={true}
                                showHiddenInUI={false}
                                principalTypes={[PrincipalType.User]}
                                onChange={onChnageSiteManger}
                                resolveDelay={1000} /> */}

                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg6 ">
                        <Label className="labelForm">Next Service Date<span className="required">*</span></Label>
                        <DatePicker
                            className="formControl"
                            placeholder="Enter Date"
                            formatDate={onFormatDate}
                            onSelectDate={onChnageDatePicker}
                            // DatePicker uses English strings by default. For localized apps, you must override this prop.
                            strings={defaultDatePickerStrings}
                            minDate={today}
                        />
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                        <div className="formControl">
                            <TextField type="file"
                                label="Add Badge"
                                onChange={onChnageFile}
                                placeholder="Select New File"
                            />
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                        <div className="formControl">
                            <TextField type="file"
                                label="Add Invoice"
                                onChange={onChnageInvoice}
                                placeholder="Select Invoice"
                            />
                        </div>
                    </div>
                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                        <div className="formControl">
                            <Toggle

                                label="Service Completed"
                                checked={assetMasterObj.IsServiceCompleted}
                                className=" formtoggle"
                                onText="On"
                                offText="Off"
                                onChange={onChangeServiceCompleted}
                                role="checkbox"
                            />

                        </div>
                    </div>

                </div>
            </div>
        </div >

    </>;

    React.useEffect(() => {
        void (async () => {
            const queryOptions: IPnPQueryOptions = {
                listName: ListNames.AssetMaster,
                select: ['Title,SiteNameId'],
                id: props.assetMasterId,
            };
            let assetItems = await props.provider.getByItemByIDQuery(queryOptions);
            setState(prevState => ({ ...prevState, assetMasterItems: assetItems }));
        })();
    });

    return <>
        {state.isformValidationModelOpen &&
            <CustomeDialog
                isDialogOpen={state.isformValidationModelOpen}
                onClickClose={() => {
                    setState(prevState => ({ ...prevState, isformValidationModelOpen: false }));
                }}
                dialogMessage={state.validationMessage}
                closeText="Close"
            />}
        <CustomModal isModalOpenProps={state.isModelOpen}
            setModalpopUpFalse={onCloseModel}
            subject={'Update Equipment Service'}
            // message={state.dialogContent}
            message={modelContent}
            closeButtonText={"Close"}
            onClickOfYes={onClickOfYes} yesButtonText={"Save"}
            dialogWidth="750px"
            isBlocking={true}
            isModeless={false} />

    </>;

};