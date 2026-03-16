import * as React from "react";
import {
    Dialog,
    DialogType,
    PrimaryButton,
    DefaultButton,
    TextField,
    Dropdown,
    IDropdownOption
} from "office-ui-fabric-react";
import { toastService } from "../../../../../../Common/ToastService";
import { ListNames } from "../../../../../../Common/Enum/ComponentNameEnum";
import { ILoginUserRoleDetails } from "../../../../../../Interfaces/ILoginUserRoleDetails";
import { Icon, Label } from "@fluentui/react";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";

interface ICRResolveModalProps {
    isOpen: boolean;
    issueItem: any;
    context: any;
    currentUserRoleDetail: ILoginUserRoleDetails;
    provider: any; // ✅ REQUIRED for attachment upload
    onClose: (refresh?: boolean) => void;
}

// const statusOptions: IDropdownOption[] = [
//     { key: "Resolved", text: "Resolved" },
//     { key: "Not an Issue", text: "Not an Issue" }
// ];
const statusOptions = [
    { value: "Resolved", label: "Resolved" },
    { value: "Not an Issue", label: "Not an Issue" }
];

const imageExt = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"];
const videoExt = ["mp4", "mov", "wmv", "avi", "mkv", "webm"];

export const CRResolveModal: React.FC<ICRResolveModalProps> = ({
    isOpen,
    issueItem,
    currentUserRoleDetail,
    provider,
    onClose
}) => {

    const [isValidationOpen, setIsValidationOpen] = React.useState(false);
    const [validationMessage, setValidationMessage] = React.useState<string>("");
    const [status, setStatus] = React.useState<any | null>(null);
    const [comment, setComment] = React.useState<string>("");
    const [files, setFiles] = React.useState<File[]>([]);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    /* ================= File Selection ================= */
    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files ? Array.from(e.target.files) : [];

        setFiles(prev => {
            const merged = [...prev];
            selectedFiles.forEach(f => {
                if (!merged.some(m => m.name === f.name)) {
                    merged.push(f);
                }
            });
            return merged;
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeFile = (name: string) => {
        setFiles(prev => prev.filter(f => f.name !== name));
    };

    const getEmployeeByEmail = async (email: string): Promise<number | null> => {
        try {
            const query = {
                listName: ListNames.QuaycleanEmployee,
                select: ["Id", "Email"],
                filter: `Email eq '${email}'`,
                top: 1
            };

            const items = await provider.getItemsByQuery(query);

            if (items && items.length > 0) {
                return items[0]; // ✅ Employee list item ID
            }

            return null;
        } catch (error) {
            console.error("Error fetching employee by email", error);
            return null;
        }
    };


    /* ================= Save ================= */
    const onSave = async () => {
        if (!status) {
            setValidationMessage("Please select status.");
            setIsValidationOpen(true);
            return;
        }

        const toastId = toastService.loading("Resolving issue...");

        try {
            /* ================= STEP 1: FIND EMPLOYEE ================= */
            console.log(currentUserRoleDetail);

            const currentUserEmail = currentUserRoleDetail?.emailId || "";

            let resolvedByEmployee: any = null;

            if (currentUserEmail) {
                resolvedByEmployee = await getEmployeeByEmail(currentUserEmail);
            }

            /* ================= STEP 2: BUILD UPDATE PAYLOAD ================= */

            const updatePayload: any = {
                Status: status,
                Comment: comment || "",
                ResolvedDate: new Date()
            };

            // Only add ResolvedById IF employee exists
            if (resolvedByEmployee) {
                updatePayload.ResolvedById = resolvedByEmployee?.Id;
                updatePayload.ResolvedByName = currentUserRoleDetail.title;
            }

            /* ================= STEP 3: UPDATE ITEM ================= */

            await provider.updateItem(
                updatePayload,
                ListNames.ClientResponsesSubmission,
                issueItem.ID
            );

            /* ================= STEP 4: UPLOAD ATTACHMENTS ================= */

            if (files.length > 0) {
                const renamedFiles = files.map(f => ({
                    name: `cleaner_${f.name}`,
                    file: f
                }));

                await provider.uploadAttachmentsToListSequential(
                    ListNames.ClientResponsesSubmission,
                    renamedFiles,
                    issueItem.ID
                );
            }

            toastService.updateLoadingWithSuccess(
                toastId,
                "Task resolved successfully"
            );

            onClose(true);

        } catch (error) {
            console.error("Resolve error:", error);
            setValidationMessage("Error while resolving task. Please try again.");
            setIsValidationOpen(true);
        }
    };

    /* ================= Render Preview ================= */
    const renderPreview = (file: File) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        const url = URL.createObjectURL(file);

        if (imageExt.includes(ext)) {
            return (
                <img
                    src={url}
                    // className="cr-preview-thumb"
                    alt={file.name}
                    onLoad={() => URL.revokeObjectURL(url)}
                />
            );
        }

        if (videoExt.includes(ext)) {
            return (
                <video
                    src={url}
                    controls
                    // className="cr-preview-thumb"
                    onLoadedData={() => URL.revokeObjectURL(url)}
                />
            );
        }

        return (
            <div className="cr-file-preview">
                <i className="ms-Icon ms-Icon--Page" />
                <span>{file.name}</span>
            </div>
        );
    };

    return (
        <>
            <Dialog
                hidden={!isOpen}
                dialogContentProps={{
                    type: DialogType.largeHeader,
                    title: "Resolve Form"
                }}
                minWidth={600}
                onDismiss={() => onClose(false)}
            >
                {/* Status */}
                {/* <Dropdown
                    label="Status"
                    placeholder="Select Status"
                    className="resolve-status"
                    options={statusOptions}
                    selectedKey={status ?? null}
                    onChange={(_, opt) => setStatus(opt?.key as string)}
                    required
                    calloutProps={{
                        className: "resolve-status-callout",
                        styles: {
                            calloutMain: {
                                minHeight: "auto !important",
                                maxHeight: 120,
                                overflowY: "auto"
                            }
                        }
                    }}
                /> */}
                {/* Status */}
                <Label required>Status</Label>

                <ReactDropdown
                    options={statusOptions}
                    isMultiSelect={false}
                    placeholder="Select Status"
                    defaultOption={status}
                    onChange={(opt) => {
                        setStatus(opt?.value);
                    }}
                    isClearable={true}
                />

                {/* Comment */}
                <TextField
                    label="Comment"
                    multiline
                    rows={4}
                    value={comment}
                    onChange={(_, val) => setComment(val || "")}
                />

                {/* File Upload */}
                {/* Upload Photo / Video */}
                <Label className="ms-Label">Upload Photo / Video</Label>

                <div className="upload-btn-wrapper mb-3">
                    <div className="file-input">
                        <input
                            ref={fileInputRef}
                            type="file"
                            id="resolveFile"
                            className="file-input__input"
                            multiple
                            accept="image/*,video/*"
                            onChange={onFileChange}
                        />

                        <label className="file-input__label" htmlFor="resolveFile">
                            <span className="flex-gap-5">
                                <Icon iconName="Attach" />
                                Upload file
                            </span>
                        </label>
                    </div>

                    {/* Preview */}
                    {files.length > 0 && (
                        <div className="preview-list cr-preview-list">
                            {files.map(f => (
                                <div key={f.name} className="preview-item cr-preview-item">
                                    {renderPreview(f)}
                                    <button
                                        className="preview-remove cr-remove-btn"
                                        onClick={() => removeFile(f.name)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ marginTop: 20, textAlign: "right" }}>
                    <DefaultButton
                        text="Close"
                        className="btn-danger"
                        onClick={() => onClose(false)}
                    />
                    <PrimaryButton
                        className="btn-primary"
                        text="Save changes"
                        style={{ marginLeft: 10 }}
                        onClick={onSave} />
                </div>
                <Dialog
                    hidden={!isValidationOpen}
                    dialogContentProps={{
                        type: DialogType.normal,
                        title: "Data missing",
                        subText: validationMessage
                    }}
                    modalProps={{
                        isBlocking: true,
                        styles: {
                            main: {
                                zIndex: 2000000
                            }
                        }
                    }}
                    onDismiss={() => setIsValidationOpen(false)}
                >
                    <PrimaryButton
                        text="Close"
                        onClick={() => setIsValidationOpen(false)}
                    />
                </Dialog>
                {/* {isValidationOpen && (
                    <Layer styles={{ root: { zIndex: 2000000 } }}>
                        <CustomModal
                            isModalOpenProps={isValidationOpen}
                            setModalpopUpFalse={() => setIsValidationOpen(false)}
                            subject="Data missing"
                            message={validationMessage}
                            closeButtonText="Close"
                        />
                    </Layer>
                )} */}
            </Dialog>
        </>
    );
};