import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { IErrorLog } from "../../../../../Interfaces/IErrorLog";
import { getSiteMasterItems, logGenerator, UserActivityLog } from "../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames, UserActionEntityTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { IReactSelectOptionProps } from "../../../../../Interfaces/IReactSelectOptionProps";
import { Label } from "@fluentui/react";
import CustomModal from "../../CommonComponents/CustomModal";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { INewAssetMaster } from "../../../../../Interfaces/IAssetMaster";
import { AMStatus } from "../../../../../Common/Constants/CommonConstants";
import { toastService } from "../../../../../Common/ToastService";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
export interface IMoveAssetProps {
    provider: IDataProvider;
    assetMasterId: number;
    assetMasterName?: any;
    originalsitemasterid?: any;
    isModelOpen: boolean;
    context: WebPartContext;
    onClickClose(): any;
    StateId: any;
}

export interface IMoveAssetState {
    siteMasterOptions: IReactSelectOptionProps[];
    assetMastesItems: any;
    dialogContent: any;
    isModelOpen: boolean;
    SiteMasterId?: number;
}

export const MoveAsset = (props: IMoveAssetProps) => {
    const [state, SetState] = React.useState<IMoveAssetState>({
        siteMasterOptions: [],
        assetMastesItems: null,
        dialogContent: null,
        isModelOpen: props.isModelOpen,
    });
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;

    const getAssetMasterItemsById = () => {
        const queryOptions: IPnPQueryOptions = {
            listName: ListNames.AssetMaster,
            id: props.assetMasterId
        };

        return props.provider.getByItemByIDQuery(queryOptions);
    };

    const onSiteNameSelect = (option: IReactSelectOptionProps, actionMeta: any): void => {
        try {
            SetState(prevState => ({ ...prevState, SiteMasterId: option.value }));

        } catch (error) {
            console.log(error);

        }
    };

    const onCloseModel = () => {
        props.onClickClose();
        SetState(prevState => ({ ...prevState, isModelOpen: false }));
    };

    const onClickOfYes = async () => {
        try {
            const toastMessage = 'Move Asset Completed successfully!';
            let editObj: INewAssetMaster = {
                SiteNameId: state.SiteMasterId,
                AMStatus: AMStatus.Moving,
                SendEmailToDynamicSiteManager: true
            };
            if (!!state.SiteMasterId) {
                const toastId = toastService.loading('Loading...');
                await props.provider.updateItemWithPnP(editObj, ListNames.AssetMaster, props.assetMasterId);
                const logObj = {
                    UserName: currentUserRoleDetail?.title,
                    SiteNameId: props.originalsitemasterid,
                    ActionType: "Update",
                    EntityType: UserActionEntityTypeEnum.EquipmentAsset,
                    EntityId: Number(props.assetMasterId),
                    EntityName: state?.assetMastesItems?.Title || "",
                    Details: `Moving Equipment/Asset`,
                    StateId: props?.StateId
                };
                void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                props.onClickClose();
                SetState(prevState => ({ ...prevState, isModelOpen: false }));
            } else {
                toastService.error('Data is Missing ');
            }

        } catch (error) {
            const errorObj: IErrorLog = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error in onClickOfYes  ",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "Add New Project  Move Asset::  onClickOfYes  "
            };
            console.log(errorObj);
            void logGenerator(props.provider, errorObj);

        }

    };

    React.useEffect(() => {
        try {
            void (async () => {
                const [siteMasterItems, assetMastesItems] = await Promise.all([getSiteMasterItems(props?.provider, props?.StateId), getAssetMasterItemsById()]);
                let siteNameOption: IReactSelectOptionProps[] = siteMasterItems.map((items: any) => {
                    return {
                        label: items.Title,
                        value: items.Id,
                    };
                });
                siteNameOption = siteNameOption.filter((r) => r.value != assetMastesItems.SiteNameId);
                SetState(prevState => ({ ...prevState, siteMasterOptions: siteNameOption, assetMastesItems: assetMastesItems }));
            })();
        } catch (error) {
            const errorObj: IErrorLog = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error in useEffect  ",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "Add New Project  Move Asset::  useEffect  "
            };
            // await logGenerator(props.provider, errorObj);
            console.log(errorObj);

        }
    }, []);

    return <>
        <CustomModal isModalOpenProps={state.isModelOpen}
            setModalpopUpFalse={onCloseModel}
            subject={state.assetMastesItems?.Title}
            // message={state.dialogContent}
            message={<><Label className="labelform">Move Site</Label><ReactDropdown
                options={state.siteMasterOptions}
                onChange={onSiteNameSelect}
                defaultOption={state.SiteMasterId}
                isMultiSelect={false}
                placeholder={'Site Name'} /></>}
            closeButtonText={"Close"}
            onClickOfYes={onClickOfYes} yesButtonText={"Save"}
            isBlocking={true}
            isModeless={false} />
    </>;

};