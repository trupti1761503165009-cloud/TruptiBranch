import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import CustomModal from "../../CommonComponents/CustomModal";
import { DialogType, TextField } from "@fluentui/react";
import { IAttachment } from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import { DocumnetLibrarayName, ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../Common/ToastService";
import { Loader } from "../../CommonComponents/Loader";
import { imgValidation, logGenerator } from "../../../../../Common/Util";
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export interface IAddTeamPhotoProps {
    provider: IDataProvider;
    context: WebPartContext;
    qCState: string;
    siteMasterId: any;
    isModelOpen: boolean;
    onCloseClick(): any;
    isUpdate: boolean;
    teamPhotoId: number;

}

export interface IAddTeamPhotoState {
    isModelOpen: boolean;
    teamPhoto: any;
    isValid: boolean;
    errorMessage: string;
}

export const AddTeamPhoto = (props: IAddTeamPhotoProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isErrorModelOpen, setIsErrorModelOpen] = React.useState<boolean>(false);
    const [state, setState] = React.useState<IAddTeamPhotoState>({
        isModelOpen: props.isModelOpen,
        teamPhoto: null,
        isValid: true,
        errorMessage: ""
    });

    const closeModel = () => {
        setState(prevState => ({ ...prevState, isModelOpen: false }));
        props.onCloseClick();
    };


    const onClickOfYes = async () => {
        try {
            // const siteUrl: string = props.context.pageContext.web.absoluteUrl + `/${props.qCState}`;
            if (props.isUpdate) {
                // await props.provider.updateItemWithPnPSiteUrl({ IsActivePhoto: false }, ListNames.TeamPhoto, props.teamPhotoId, siteUrl);
                await props.provider.updateItemWithPnPSiteUrl({ IsActivePhoto: false }, ListNames.TeamPhoto, props.teamPhotoId);
            }
            if (!!state.teamPhoto) {

                const isVaild = imgValidation(state.teamPhoto.name);
                if (isVaild) {
                    setIsLoading(true);
                    const toastMessage = 'Team Photo Uploaded successfully!';
                    let file: IFileWithBlob = {
                        name: state.teamPhoto.name,
                        file: state.teamPhoto.fileContent[0],
                        folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/${DocumnetLibrarayName.TeamPhoto}`,
                        // folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl + '/' + props.qCState}/${DocumnetLibrarayName.TeamPhoto}`,
                        overwrite: true,

                    };

                    // const siteUrl: string = props.context.pageContext.web.absoluteUrl + `/${props.qCState}`;
                    const toastId = toastService.loading('Loading...');

                    // await props.provider.uploadFilewithSiteUrl(file, siteUrl, true, { SiteNameId: props.siteMasterId, IsActivePhoto: true });
                    await props.provider.uploadFilewithSiteUrl2(file, true, { SiteNameId: props.siteMasterId, IsActivePhoto: true });
                    setIsLoading(false);
                    closeModel();
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                } else {
                    setState(prevState => ({ ...prevState, isValid: false, errorMessage: 'Allow only Images Types ' }));
                }
            } else {
                setState(prevState => ({ ...prevState, isValid: false, errorMessage: 'Image is missing' }));
            }
        } catch (error) {
            setIsErrorModelOpen(true);
            setIsLoading(false);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  onClickOfYes",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onClickOfYes AddTeamPhoto"
            };
            void logGenerator(props.provider, errorObj);
        }
    };

    const onChnageFile = (event: any) => {
        let file: IAttachment = {
            name: event.target.files[0].name,
            fileContent: event.target.files
        };
        setState((prevState: any) => ({ ...prevState, teamPhoto: file, isValid: true, errorMessage: "" }));
    };

    const modelContext = <>
        <TextField type="file"
            name="Files"
            className='FileUpload formControl'
            label="Team Photo"
            accept="image/*"
            onChange={onChnageFile}

            errorMessage={state.isValid ? '' : state.errorMessage}
        />


    </>;
    return <>
        {isLoading && <Loader />}
        {isErrorModelOpen && <CustomeDialog closeText="Close" isDialogOpen={isErrorModelOpen} onClickClose={() => { setIsErrorModelOpen(false); }} dialogContentProps={{ type: DialogType.normal, title: 'Something went wrong.', closeButtonAriaLabel: 'Close' }} dialogMessage={<div className="dflex" ><FontAwesomeIcon className="actionBtn btnPDF dticon" icon="circle-exclamation" /> <div className="error">Please try again later.</div></div>} />}
        {state.isModelOpen &&
            <CustomModal
                isModalOpenProps={state.isModelOpen}
                setModalpopUpFalse={closeModel}
                subject={"Add Team Photo "}
                message={modelContext}
                yesButtonText="Save"
                onClickOfYes={onClickOfYes}
                closeButtonText={"Close"} />
        }
    </>;


};