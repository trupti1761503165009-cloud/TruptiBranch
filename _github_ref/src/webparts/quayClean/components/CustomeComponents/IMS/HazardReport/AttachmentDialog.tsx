/* eslint-disable  */
import * as React from "react";
import { useState } from "react";
import { DefaultButton, IconButton } from "@fluentui/react/lib/Button";
import { Stack } from "@fluentui/react/lib/Stack";
import { Modal, FontWeights, getTheme, IButtonStyles, mergeStyleSets, IIconProps } from "office-ui-fabric-react";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { getHazardAttachments } from "../../../CommonComponents/CommonMethods";
import { Loader } from "../../../CommonComponents/Loader";


interface IAttachmentDialogProps {
    isOpen: any;
    onClose(): void;
    selectedItem: any;
    isView?: any
}

const AttachmentDialog: React.FC<IAttachmentDialogProps> = ({ isOpen, onClose, selectedItem, isView }) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context } = appGlobalState;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [modalWidth, setModalWidth] = React.useState("750px");
    const theme = getTheme();

    const showPrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? attachments.length - 1 : prev - 1));
    };

    const showNext = () => {
        setCurrentIndex((prev) => (prev === attachments.length - 1 ? 0 : prev + 1));
    };

    React.useEffect(() => {
        const handleResize = () => {
            setModalWidth(window.innerWidth <= 768 ? "90%" : "750px");
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    React.useEffect(() => {
        if (selectedItem) {
            (async () => {
                setIsLoading(true);
                if (isView) {
                    setAttachments(selectedItem?.Attachment);
                } else {
                    const data = await getHazardAttachments(provider, context, selectedItem);
                    setAttachments(data);
                }
                setCurrentIndex(0);
                setIsLoading(false);
            })();
        } else {
            setAttachments([]);
            setIsLoading(false);
        }
    }, [selectedItem]);

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

    const renderPreview = () => {
        if (attachments.length === 0) return null;

        const { fileUrl, fileType } = attachments[currentIndex];

        if (fileType === "image") {
            return (
                <img
                    src={fileUrl}
                    style={{
                        maxWidth: "100%",
                        maxHeight: "400px",
                        borderRadius: 8,
                        margin: "0 auto",
                        display: "block"
                    }}
                />
            );
        }

        if (fileType === "video") {
            return (
                <video
                    controls
                    style={{
                        maxWidth: "100%",
                        maxHeight: "400px",
                        borderRadius: 8
                    }}
                >
                    <source src={fileUrl} />
                </video>
            );
        }

        return (
            <DefaultButton
                text="Download File"
                onClick={() => window.open(fileUrl, "_blank")}
            />
        );
    };

    return (
        <>
            {isLoading && <Loader />}
            <Modal
                titleAriaId="titleId"
                isOpen={isOpen}
                onDismiss={onClose}
                isBlocking={true}
                isModeless={false}
                isDarkOverlay={true}
                containerClassName={contentStyles.container}
            >
                <div className={contentStyles.header}>
                    <h2 className={contentStyles.heading} id="titleId">Hazard Attachments</h2>
                    <IconButton
                        styles={iconButtonStyles}
                        iconProps={cancelIcon}
                        ariaLabel="Close popup modal"
                        onClick={onClose}
                    />
                </div>
                <div
                    className={contentStyles.body} >
                    <div>
                        {attachments.length > 0 ? (
                            <Stack horizontalAlign="center" tokens={{ childrenGap: 15 }}>
                                <div style={{ maxHeight: "400px", overflow: "auto", textAlign: "center" }}>
                                    {renderPreview()}
                                </div>

                                <Stack horizontal tokens={{ childrenGap: 15 }} horizontalAlign="center">
                                    <IconButton iconProps={{ iconName: "ChevronLeft" }} onClick={showPrev} />
                                    <span>
                                        {currentIndex + 1} / {attachments.length}
                                    </span>
                                    <IconButton iconProps={{ iconName: "ChevronRight" }} onClick={showNext} />
                                </Stack>
                                <Stack horizontal wrap tokens={{ childrenGap: 8 }} horizontalAlign="center">
                                    {attachments.map((att, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setCurrentIndex(idx)}
                                            style={{
                                                width: 50,
                                                height: 50,
                                                cursor: "pointer",
                                                border:
                                                    idx === currentIndex
                                                        ? "2px solid #0078D4"
                                                        : "1px solid #ccc",
                                                borderRadius: 4,
                                                overflow: "hidden",
                                                background: "#f3f2f1"
                                            }}
                                        >
                                            {att.fileType === "image" ? (
                                                <img
                                                    src={att.fileUrl}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            ) : att.fileType === "video" ? (
                                                <video style={{ width: "100%", height: "100%", objectFit: "cover" }}>
                                                    <source src={att.fileUrl} />
                                                </video>
                                            ) : (
                                                <span style={{ fontSize: 10 }}>{att.fileType.toUpperCase()}</span>
                                            )}
                                        </div>
                                    ))}
                                </Stack>
                            </Stack>
                        ) : (
                            <p>No attachments available.</p>
                        )}

                        <div className="dataJustifyBetween mt-3 flex-wrap" style={{ justifyContent: "flex-end", display: "flex" }}>
                            <div>
                                <DefaultButton
                                    className="btn btn-danger"
                                    style={{ marginLeft: "5px" }}
                                    onClick={onClose}
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

export default AttachmentDialog;
