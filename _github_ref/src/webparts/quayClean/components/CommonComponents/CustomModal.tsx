import { DefaultButton, FontWeights, getTheme, IButtonStyles, IconButton, IIconProps, mergeStyleSets, Modal } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import * as React from 'react';
interface ICustomModalProps {
    isModalOpenProps: boolean;
    setModalpopUpFalse?: (isModalOpen: boolean) => void;
    onClickOfYes?: () => void;
    subject: string;
    message: any;
    dialogWidth?: string;
    closeButtonText?: string;
    yesButtonText?: string;
    thirdButtonText?: string;
    onClickThirdButton?: () => void;
    isYesButtonDisbale?: boolean;
    // qrCodeUrl?: string;
    onClickOfRemove?: () => void;
    removeButtonText?: string;
    isRemoveButtonDisbale?: boolean;
    onClose?: () => void;
    isBlocking?: boolean;
    isModeless?: boolean
}

export const CustomModal: React.FunctionComponent<ICustomModalProps> = (props: ICustomModalProps): React.ReactElement<ICustomModalProps> => {
    const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
    const theme = getTheme();
    const contentStyles = mergeStyleSets({
        container: {
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'stretch',
            width: !!props.dialogWidth ? props.dialogWidth : "500px"
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

    const hideModalEvent = (): void => {
        if (props.setModalpopUpFalse) {
            props.setModalpopUpFalse(false);
        }

        if (props.onClose) props.onClose();
        hideModal();
    };

    React.useEffect(() => {
        if (props.isModalOpenProps) { showModal(); }
        else hideModal();
    }, [props.isModalOpenProps, isModalOpen]);


    return (
        <Modal
            titleAriaId={"titleId"}
            isOpen={isModalOpen}
            onDismiss={() => hideModalEvent()}
            isModeless={props.isModeless ? true : false}
            isBlocking={props.isBlocking ? true : false}
            isDarkOverlay={true}
            containerClassName={contentStyles.container}
        >
            <div className={contentStyles.header}>
                <h2 className={contentStyles.heading} id={"titleId"}>
                    {props.subject}
                </h2>
                <IconButton
                    styles={iconButtonStyles}
                    iconProps={cancelIcon}
                    ariaLabel="Close popup modal"
                    onClick={() => hideModalEvent()}
                />
            </div>
            <div className={contentStyles.body}>
                <p>
                    {props.message}
                </p>
                <p>
                    <div className="d-flex justifyright customButton">
                        {!!props?.onClickOfRemove &&
                            <DefaultButton disabled={!!props.isRemoveButtonDisbale ? props.isRemoveButtonDisbale : false} style={{ marginRight: "5px" }}
                                className={!!props.isRemoveButtonDisbale ? "" : "btn btn-primary"}
                                // className="btn btn-primary" 
                                text={props.removeButtonText}
                                onClick={() => {
                                    !!props?.onClickOfRemove && props?.onClickOfRemove();
                                }} />}
                        {!!props?.onClickOfYes &&
                            <DefaultButton disabled={!!props.isYesButtonDisbale ? props.isYesButtonDisbale : false} style={{ marginRight: "5px" }}
                                className={!!props.isYesButtonDisbale ? "" : "btn btn-primary"}
                                // className="btn btn-primary" 
                                text={props.yesButtonText}
                                onClick={() => {
                                    !!props?.onClickOfYes && props?.onClickOfYes();
                                }} />}

                        {!!props.closeButtonText && <DefaultButton className="btn btn-danger" onClick={() => hideModalEvent()} text={props.closeButtonText} />
                        }
                        {!!props.onClickThirdButton && <DefaultButton className="btn btn-gray" style={{ marginLeft: "5px" }} onClick={() => !!props.onClickThirdButton && props.onClickThirdButton()} text={props.thirdButtonText} />
                        }

                    </div>
                </p>
            </div>
        </Modal>
    );
};

export default CustomModal;