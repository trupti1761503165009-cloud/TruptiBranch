/* eslint-disable */
import * as React from "react";
import {
    Modal,
    PrimaryButton,
    DefaultButton,
    Label,
    mergeStyleSets,
    IconButton,
    getTheme,
    FontWeights
} from "@fluentui/react";
import { EmployeeFilter } from "../../../../../../Common/Filter/EmployeeFilter";
import { toastService } from "../../../../../../Common/ToastService";
import { ListNames, getExternalUrlForClientResponses } from "../../../../../../Common/Enum/ComponentNameEnum";
import { Loader } from "../../../CommonComponents/Loader";
import CustomModal from "../../../CommonComponents/CustomModal";
import { SmsServices } from "../../../../../../DataProvider/SmsServices";
import { encryptValue } from "../../../../../../Common/Util";

interface ICRReassignModalProps {
    isOpen: boolean;
    selectedItem: any;
    provider: any;
    currentUserRoleDetail: any;
    onClose: (isRefresh: boolean) => void;
    siteInfo: any;
    context: any;
}

export const CRReassignModal: React.FC<ICRReassignModalProps> = ({
    isOpen,
    selectedItem,
    provider,
    currentUserRoleDetail,
    siteInfo,
    context,
    onClose
}) => {

    const [isValidationOpen, setIsValidationOpen] = React.useState(false);
    const [validationMessage, setValidationMessage] = React.useState<string>("");
    const [selectedUserIds, setSelectedUserIds] = React.useState<number[]>([]);
    const [selectedUsersPhoneNumbers, setSelectedUsersPhoneNumbers] = React.useState<number[]>([]);
    const [selectedUserOptions, setSelectedUserOptions] = React.useState<any[]>([]);

    const [isLoading, setIsLoading] = React.useState(false);

    const theme = getTheme();

    const styles = mergeStyleSets({
        container: {
            width: window.innerWidth <= 768 ? "90%" : "450px",
            display: "flex",
            flexDirection: "column"
        },
        header: {
            padding: "12px 16px",
            borderTop: "4px solid #1300a6",
            fontSize: theme.fonts.large.fontSize,
            fontWeight: FontWeights.semibold,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
        },
        body: {
            padding: "16px"
        },
        footer: {
            display: "flex",
            justifyContent: "flex-end",
            gap: "8px",
            padding: "16px"
        }
    });

    React.useEffect(() => {
        if (selectedItem?.AssignedToId) {
            const ids = Array.isArray(selectedItem.AssignedToId)
                ? selectedItem.AssignedToId
                : [selectedItem.AssignedToId];

            setSelectedUserIds(ids);
        } else {
            setSelectedUserIds([]);
        }
    }, [selectedItem]);

    const updateSiteStaffMembersIfRequired = async () => {
        if (!siteInfo?.ID) return;

        const existingStaffIds: number[] =
            siteInfo?.StaffMembers?.map((s: any) => s.Id) || [];

        // find newly selected users not in staff
        const newStaffIds = selectedUserIds.filter(
            id => !existingStaffIds.includes(id)
        );

        if (newStaffIds.length === 0) return; // nothing to update

        const updatedStaffIds = [...existingStaffIds, ...newStaffIds];

        await provider.updateItem(
            {
                StaffMembersId: updatedStaffIds
            },
            ListNames.SitesMaster,
            siteInfo.ID
        );
    };

    const onSave = async () => {
        /* ================= Validation ================= */
        if (!selectedUserIds || selectedUserIds.length === 0) {
            setValidationMessage("Please select employee to reassign.");
            setIsValidationOpen(true);
            return;
        }

        setIsLoading(true);
        // 🔹 Show loading toast
        const toastId = toastService.loading("Reassigning task...");


        try {
            /* ================= UPDATE ONLY AssignedTo ================= */
            await provider.updateItem(
                { AssignedToId: selectedUserIds },
                ListNames.ClientResponsesSubmission,
                selectedItem.ID
            );

            // 🔥 add missing staff automatically
            await updateSiteStaffMembersIfRequired();

            /* ================= SEND SMS ================= */
            const smsService = new SmsServices();
            const externalURL = getExternalUrlForClientResponses(context);

            for (const emp of selectedUserOptions) {

                if (!emp?.data?.Phone) continue;
                const encryptedSiteID = encryptValue(selectedItem.SiteNameId ? selectedItem.SiteNameId : 0);
                // const encryptedLocationID = encryptValue(selectedItem.ResponseJSON?.siteAreaId ? selectedItem.ResponseJSON?.siteAreaId : 0);

                // const link = `${externalURL}/ClientResponse/Login` + `?siteId=${encryptedSiteID}` + `&location=${encryptedLocationID}`;
                const link = `${externalURL}/ClientResponse/Login` + `?siteId=${encryptedSiteID}`;

                const clientName = `${emp.data.FirstName} ${emp.data.LastName}`;

                const message =
                    `Hello ${clientName}, A client has reported an issue at ` +
                    `${selectedItem.SiteName}, ${selectedItem.SiteArea}. ` +
                    `Please click the link below to review and resolve the issue: ${link}`;

                await smsService.sendSMSAsync({
                    phone: emp.data.Phone,
                    message
                });
            }

            /* ================= USER ACTIVITY LOG ================= */
            // const logObj = {
            //     UserName: currentUserRoleDetail?.title,
            //     SiteNameId: selectedItem?.SiteNameId,
            //     ActionType: UserActivityActionTypeEnum.Update,
            //     EntityType: UserActionEntityTypeEnum.ClientResponse,
            //     EntityId: selectedItem.ID,
            //     EntityName: selectedItem.ResponseFormId,
            //     Details: `Reassigned issue`,
            //     LogFor: UserActionLogFor.Both,
            //     StateId: selectedItem?.stateId,
            //     Email: currentUserRoleDetail?.emailId,
            //     Count: 1
            // };

            // void UserActivityLog(provider, logObj, currentUserRoleDetail);

            // ✅ SUCCESS TOAST
            toastService.updateLoadingWithSuccess(
                toastId,
                "Task reassigned successfully"
            );

            onClose(true); // refresh grid

        } catch (error) {
            console.error("Reassign error:", error);
            setValidationMessage("Failed to reassign. Please try again.");
            setIsValidationOpen(true);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            {isLoading && <Loader />}

            <Modal
                isOpen={isOpen}
                onDismiss={() => onClose(false)}
                isBlocking={true}
                containerClassName={styles.container}
            >
                <div className={styles.header}>
                    <span>Reassign</span>
                    <IconButton iconProps={{ iconName: "Cancel" }} onClick={() => onClose(false)} />
                </div>

                <div className={styles.body}>
                    <Label>
                        Assign To <span className="required">*</span>
                    </Label>

                    <EmployeeFilter
                        defaultOption={selectedUserIds}   // ✅ IDS ONLY
                        onEmployeeChange={(employees: any[]) => {
                            const ids = employees.map((e: any) => e.value);
                            const phoneNumbers = employees.map((e: any) => e.data?.Phone);
                            setSelectedUsersPhoneNumbers(phoneNumbers);
                            setSelectedUserOptions(employees);
                            setSelectedUserIds(ids);
                        }}
                        provider={provider}
                        // AllOption={false}
                        isMultiSelect={true}
                        qCState={selectedItem?.stateId}
                        placeholder="Select Employee"
                    />

                </div>

                <div className={styles.footer}>
                    <DefaultButton text="Cancel" onClick={() => onClose(false)} />
                    <PrimaryButton text="Reassign" className="btn-primary" onClick={onSave} />
                </div>
            </Modal>
            {isValidationOpen && (
                <CustomModal
                    isModalOpenProps={isValidationOpen}
                    setModalpopUpFalse={() => setIsValidationOpen(false)}
                    subject="Data missing"
                    message={validationMessage}
                    closeButtonText="Close"
                />
            )}
        </>
    );
};