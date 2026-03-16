/* eslint-disable  */
import * as React from "react";
import { useState } from "react";
import { DefaultButton, IconButton } from "@fluentui/react/lib/Button";
import { Stack } from "@fluentui/react/lib/Stack";
import { FontWeights, getTheme, IButtonStyles, mergeStyleSets, IIconProps } from "@fluentui/react";
import { Loader } from "../../CommonComponents/Loader";
import { getFileType } from "../../CommonComponents/CommonMethods";
import { Panel, PanelType } from "@fluentui/react";

interface IAttachmentPopupProps {
    isOpen: any;
    onClose(): void;
    selectedItem: any;
}

const AttachmentPopup: React.FC<IAttachmentPopupProps> = ({ isOpen, onClose, selectedItem }) => {
    // const appGlobalState = useAtomValue(appGlobalStateAtom);
    // const { provider, context } = appGlobalState;
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [attachments, setAttachments] = useState<any[]>([]);
    const [modalWidth, setModalWidth] = React.useState("500px");
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
                setAttachments(selectedItem?.attachmentFiles);
                setCurrentIndex(0);
                setIsLoading(false);
            })();
        } else {
            setAttachments([]);
            setIsLoading(false);
        }
    }, [selectedItem]);

    return (
        <>
            <Panel
                isOpen={isOpen}
                onDismiss={onClose}
                type={PanelType.extraLarge}
                closeButtonAriaLabel="Close"
                isBlocking={false}
                onRenderNavigation={() => (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "16px",
                            fontSize: "20px",
                            fontWeight: 600
                        }}
                    >
                        {/* Panel Title */}
                        <span>Attachments</span>

                        {/* Custom Close Button */}
                        <IconButton
                            iconProps={{ iconName: "Cancel" }}
                            ariaLabel="Close"
                            onClick={onClose}
                            styles={{
                                root: {
                                    backgroundColor: "red",
                                    color: "white",
                                    borderRadius: "4px",
                                    width: 32,
                                    height: 32
                                },
                                rootHovered: {
                                    backgroundColor: "#b00000",
                                    color: "white",
                                }
                            }}
                        />
                    </div>
                )}
            // onRenderFooterContent={() => (
            //     <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
            //         <DefaultButton className="btn btn-danger" onClick={onClose}>Close</DefaultButton>
            //     </div>
            // )}
            // isFooterAtBottom={true}
            >
                {isLoading && <Loader />}

                {attachments.length > 0 ? (
                    <Stack horizontalAlign="center" tokens={{ childrenGap: 10 }}>

                        {/* === MAIN PREVIEW (FULL WIDTH & FULL HEIGHT) === */}
                        <div
                            style={{
                                width: "100%",
                                height: "74vh",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                background: "#f5f5f5",
                                borderRadius: 8,
                                overflow: "hidden"
                            }}
                        >
                            {(() => {
                                const fileUrl = attachments[currentIndex];
                                const fileType = getFileType(fileUrl);

                                if (fileType === "image") {
                                    return (
                                        <img
                                            src={fileUrl}
                                            alt="Preview"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain"
                                            }}
                                        />
                                    );
                                } else if (fileType === "pdf") {
                                    return (
                                        <iframe
                                            src={fileUrl}
                                            title="PDF Viewer"
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                border: "none"
                                            }}
                                        />
                                    );
                                } else {
                                    return (
                                        <DefaultButton
                                            text={`Download ${fileType.toUpperCase()}`}
                                            onClick={() => window.open(fileUrl, "_blank")}
                                        />
                                    );
                                }
                            })()}
                        </div>

                        {/* === NAVIGATION (Previous / Next) === */}
                        <Stack horizontal tokens={{ childrenGap: 15 }} horizontalAlign="center">
                            <IconButton iconProps={{ iconName: "ChevronLeft" }} onClick={showPrev} />
                            <span>{currentIndex + 1} / {attachments.length}</span>
                            <IconButton iconProps={{ iconName: "ChevronRight" }} onClick={showNext} />
                        </Stack>

                        {/* === THUMBNAILS === */}
                        <Stack horizontal wrap tokens={{ childrenGap: 8 }} horizontalAlign="center">
                            {attachments.map((fileUrl, idx) => {
                                const fileType = getFileType(fileUrl);

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        style={{
                                            width: 60,
                                            height: 60,
                                            cursor: "pointer",
                                            border: idx === currentIndex ? "2px solid #0078D4" : "1px solid #ccc",
                                            borderRadius: 4,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: "#f3f2f1",
                                            overflow: "hidden"
                                        }}
                                    >
                                        {fileType === "image" ? (
                                            <img
                                                src={fileUrl}
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover"
                                                }}
                                            />
                                        ) : (
                                            <span style={{ fontSize: 10 }}>{fileType.toUpperCase()}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </Stack>
                    </Stack>
                ) : (
                    <p>No attachments available.</p>
                )}

            </Panel>
        </>
    );
};

export default AttachmentPopup;