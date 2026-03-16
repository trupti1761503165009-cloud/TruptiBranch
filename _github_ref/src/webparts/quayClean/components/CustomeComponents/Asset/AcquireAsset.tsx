import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import CustomModal from "../../CommonComponents/CustomModal";
import { IErrorLog } from "../../../../../Interfaces/IErrorLog";
import { INewAssetMaster } from "../../../../../Interfaces/IAssetMaster";
import { AMStatus } from "../../../../../Common/Constants/CommonConstants";
import { ListNames, UserActionEntityTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../Common/ToastService";
import { logGenerator, UserActivityLog } from "../../../../../Common/Util";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
export interface IAcquireAssetProps {
    provider: IDataProvider;
    assetMasterId: number;
    assetMasterName?: any;
    originalsitemasterid?: any;
    isModelOpen: boolean;
    StateId: any;
    onClickClose(): any;
}

export interface IAcquireAssetState {
    isModelOpen: boolean;
}

export const AcquireAsset = (props: IAcquireAssetProps) => {
    const [state, SetState] = React.useState<IAcquireAssetState>({
        isModelOpen: props.isModelOpen
    });
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;

    const onCloseModel = () => {
        props.onClickClose();
        SetState(prevState => ({ ...prevState, isModelOpen: false }));
    };

    const onClickOfYes = async () => {
        try {
            const toastMessage = 'Acquire Asset Completed!';
            const editObj: INewAssetMaster = {
                AMStatus: AMStatus.InUse

            };
            const toastId = toastService.loading('Loading...');
            await props.provider.updateItemWithPnP(editObj, ListNames.AssetMaster, props.assetMasterId);
            const logObj = {
                UserName: currentUserRoleDetail?.title,
                SiteNameId: props.originalsitemasterid,
                ActionType: "Update",
                EntityType: UserActionEntityTypeEnum.EquipmentAsset,
                EntityId: Number(props.assetMasterId),
                EntityName: props?.assetMasterName || "",
                Details: `Acquire Equipment/Asset`,
                StateId: props?.StateId
            };
            void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
            toastService.updateLoadingWithSuccess(toastId, toastMessage);
            props.onClickClose();
            SetState(prevState => ({ ...prevState, isModelOpen: false }));
        } catch (error) {
            const errorObj: IErrorLog = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error in onClickOfYes  ",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "Add New Project  AcquireAsset::  onClickOfYes  "
            };
            void logGenerator(props.provider, errorObj)
        }
    };

    return <>
        <CustomModal
            isModalOpenProps={state.isModelOpen}
            setModalpopUpFalse={onCloseModel}
            subject={"Confirmation"}
            message={<div>Are you sure you would like to acquire this item?</div>}
            closeButtonText={"Cancel"}
            yesButtonText="Acquire"
            onClickOfYes={onClickOfYes}
            isBlocking={true}
            isModeless={false}
        />
    </>;

};