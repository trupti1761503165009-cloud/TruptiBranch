/* eslint-disable  */
import * as React from "react";
import { DefaultButton, FontWeights, IButtonStyles, IIconProps, IconButton, Label, Layer, MaskedTextField, Modal, PrimaryButton, getTheme, mergeStyleSets, } from "@fluentui/react";
import { ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { Loader } from "../../../CommonComponents/Loader";
import { HazardViewFields } from "../../../../../../Common/Enum/HazardFields";
import { SiteFilter } from "../../../../../../Common/Filter/SiteFilter";
import { useBoolean } from "@fluentui/react-hooks";
import { IDataProvider } from "../../../../../../DataProvider/Interface/IDataProvider";
import { toastService } from "../../../../../../Common/ToastService";
import { Messages } from "../../../../../../Common/Constants/Messages";
import { getState } from "../../../CommonComponents/CommonMethods";
import { UserActivityLog } from "../../../../../../Common/Util";

export interface IHazardSite {
    isHazardSiteUpdate?: any;
    provider: IDataProvider;
    currentUserRoleDetail: any;
    onClose(isRefresh: boolean): void;
    selectedItem: any;
}

export const ModalHazardSite = (props: IHazardSite) => {

    const [modalWidth, setModalWidth] = React.useState("500px");
    const [selectedSite, setSelectedSite] = React.useState<any>();
    // const [validationMessages, setValidationMessages] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);

    const theme = getTheme();

    React.useEffect(() => {
        const handleResize = () => {
            setModalWidth(window.innerWidth <= 768 ? "90%" : "650px");
        };

        handleResize(); // Initial
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const contentStyles = mergeStyleSets({
        container: {
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'stretch',
            width: modalWidth
        },
        header: [
            theme.fonts.xLargePlus,
            {
                flex: '1 1 auto',
                borderTop: `4px solid #1300a6`,
                color: theme.palette.neutralPrimary,
                display: 'flex',
                alignItems: 'center',
                fontWeight: FontWeights.semibold,
                padding: '12px 12px 14px 24px',
            },
        ],
        heading: {
            color: theme.palette.neutralPrimary,
            fontWeight: FontWeights.semibold,
            fontSize: 'inherit',
            margin: '0',
        },
        body: {
            flex: '4 4 auto',
            padding: '0 24px 24px 24px',
            overflowY: 'hidden',
            selectors: {
                p: { margin: '14px 0' },
                'p:first-child': { marginTop: 0 },
                'p:last-child': { marginBottom: 0 },
            },
        },
    });

    const iconButtonStyles: Partial<IButtonStyles> = {
        root: {
            color: theme.palette.neutralPrimary,
            marginLeft: 'auto',
            marginTop: '4px',
            marginRight: '2px',
        },
        rootHovered: {
            color: theme.palette.neutralDark,
        },
    };

    const cancelIcon: IIconProps = { iconName: 'Cancel' };

    const onSubmitForm = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Moving Hazard...');

        const existingResponse = props.selectedItem?.ResponseJSON || {};
        let updatedResponse = { ...existingResponse };

        updatedResponse.siteNameId = selectedSite;
        const responseString = JSON.stringify(updatedResponse);

        const formObj = {
            SiteNameId: selectedSite,
            Response: responseString
        };
        try {
            await props.provider.updateItemWithPnP(formObj, ListNames.HazardFormResponses, props.selectedItem?.Id);
            let data = await getState(selectedSite, props.provider);
            const logObj = {
                UserName: props.currentUserRoleDetail?.title,
                SiteNameId: selectedSite,
                ActionType: UserActivityActionTypeEnum.Update,
                EntityType: UserActionEntityTypeEnum.HazardReport,
                EntityId: props.selectedItem?.Id,
                EntityName: props.selectedItem?.HazardFormId,
                Details: `Moved this hazard to another site`,
                LogFor: UserActionLogFor.Both,
                StateId: data[0]?.QCStateId,
                Email: props.currentUserRoleDetail?.emailId,
                Count: 1
            };
            void UserActivityLog(props.provider, logObj, props.currentUserRoleDetail);
            setIsLoading(false);
            toggleHideDialog();
            props.onClose(true);
            toastService.updateLoadingWithSuccess(toastId, Messages.HazardMovedSuccessfully);

        } catch (error) {
            console.error('Error during form submission:', error);
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    }, []);

    return (
        <>
            {isLoading && <Loader />}
            <Modal
                titleAriaId="titleId"
                isOpen={props.isHazardSiteUpdate}
                onDismiss={() => props.onClose(false)}
                isBlocking={true}
                // isModeless={props.selectedSite ? false : true}
                isDarkOverlay={true}
                containerClassName={contentStyles.container}
            >
                <div className={contentStyles.header}>
                    <h2 className={contentStyles.heading} id="titleId">{Messages.HazardSiteUpdate}</h2>
                    <IconButton
                        styles={iconButtonStyles}
                        iconProps={cancelIcon}
                        ariaLabel="Close popup modal"
                        onClick={() => props.onClose(false)}
                    />
                </div>
                <div
                    className={contentStyles.body}
                    style={{ opacity: hideDialog ? 0.4 : 1 }}  >
                    <div>
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                <Label className="qc-form-label">Note: {Messages.HazardNote}</Label>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                                <Label className="">{HazardViewFields.SiteName} <span className="required">*</span></Label>
                                <SiteFilter
                                    isPermissionFiter={true}
                                    loginUserRoleDetails={props.currentUserRoleDetail}
                                    selectedSite={selectedSite}
                                    onSiteChange={(site) => {
                                        setSelectedSite(site?.value);
                                    }}
                                    provider={props.provider}
                                    isRequired={true}
                                    AllOption={false}
                                />
                            </div>
                        </div>

                        <div className="dataJustifyBetween mt-3 flex-wrap" style={{ justifyContent: "flex-end", display: "flex" }}>
                            <div>
                                <PrimaryButton
                                    text="Move"
                                    className={(selectedSite) ? "btn btn-primary" : ``}
                                    onClick={() => { onSubmitForm() }}
                                    disabled={(selectedSite) ? false : true}
                                />
                                <DefaultButton
                                    className="btn btn-danger"
                                    style={{ marginLeft: "5px" }}
                                    onClick={() => props.onClose(false)}
                                >
                                    Close
                                </DefaultButton>
                            </div>
                        </div>
                    </div>

                </div>
            </Modal>
        </>
    );

};