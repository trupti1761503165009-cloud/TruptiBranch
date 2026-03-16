/* eslint-disable */
import * as React from "react";
import { DefaultButton, IconButton, Label, PrimaryButton } from "@fluentui/react";
import { ListNames } from "../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../Common/ToastService";
import { IDataProvider } from "../../../../../../DataProvider/Interface/IDataProvider";
import { Loader } from "../../../CommonComponents/Loader";
import { EmployeeFilter } from "../../../../../../Common/Filter/EmployeeFilter";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import CustomModal from "../../../CommonComponents/CustomModal";
import { useAtomValue } from "jotai";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";

export interface IManageSiteArea {
    isManageSiteArea: boolean;
    provider: IDataProvider;
    currentUserRoleDetail: any;
    onClose(isRefresh: boolean): void;
    siteInfo: any; // must contain siteMasterId
}

export const ManageSiteAreaPanel = (props: IManageSiteArea) => {

    /* ================= STATE ================= */

    const [siteStaffIds, setSiteStaffIds] = React.useState<number[]>([]);
    const [siteStaffOptions, setSiteStaffOptions] = React.useState<any[]>([]);
    const [selectedToAdd, setSelectedToAdd] = React.useState<number[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const [confirmState, setConfirmState] = React.useState<{
        isModelOpen: boolean;
        staffId?: number;
        staffName?: string;
    }>({ isModelOpen: false });

    /* ================= LOAD SITE STAFF ================= */

    const loadSiteStaff = async () => {
        try {
            setIsLoading(true);

            const siteQuery: IPnPQueryOptions = {
                listName: ListNames.SitesMaster,
                select: ["ID", "StaffMembersId"],
                filter: `ID eq ${!!selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId[0]}`,
                top: 1
            };

            const siteItems = await props.provider.getItemsByQuery(siteQuery);
            const staffIds = siteItems?.[0]?.StaffMembersId || [];

            setSiteStaffIds(staffIds);

            if (!staffIds.length) {
                setSiteStaffOptions([]);
                return;
            }

            const staffFilter = staffIds
                .map((id: any) => `Id eq ${id}`)
                .join(" or ");
            const staffQuery: IPnPQueryOptions = {
                listName: ListNames.QuaycleanEmployee,
                select: ["Id", "Title"],
                filter: staffFilter
            };

            const staffItems = await props.provider.getItemsByQuery(staffQuery);

            setSiteStaffOptions(
                staffItems.map((e: any) => ({
                    value: e.Id,
                    label: e.Title
                }))
            );

        } catch (error) {
            console.error("Error loading site staff", error);
        } finally {
            setIsLoading(false);
        }
    };

    /* ================= EFFECT ================= */

    React.useEffect(() => {
        console.log(selectedZoneDetails);
        
        if (props.isManageSiteArea && !!selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId[0]) {
            loadSiteStaff();
        }
    }, [props.isManageSiteArea, !!selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId[0]]);

    /* ================= ADD STAFF ================= */

    const onAddStaff = async () => {
        if (!selectedToAdd.length) return;

        const updatedStaffIds = [
            ...siteStaffIds,
            ...selectedToAdd
        ];

        await updateSiteStaff(updatedStaffIds, 'ADD');
    };

    /* ================= DELETE STAFF ================= */

    const onClickDeleteStaff = (staff: any) => {
        setConfirmState({
            isModelOpen: true,
            staffId: staff.value,
            staffName: staff.label
        });
    };

    const onConfirmDeleteStaff = async () => {
        if (!confirmState.staffId) return;

        const updatedStaffIds = siteStaffIds.filter(
            id => id !== confirmState.staffId
        );

        await updateSiteStaff(updatedStaffIds, 'DELETE');
        setConfirmState({ isModelOpen: false });
    };

    const onCloseModel = () => {
        setConfirmState({ isModelOpen: false });
    };

    /* ================= UPDATE SITE ================= */

    const updateSiteStaff = async (staffIds: number[], action: "ADD" | "DELETE") => {
        setIsLoading(true);
        const toastId = toastService.loading(
            action === "ADD"
                ? "Adding staff member..."
                : "Removing staff member..."
        );

        try {
            await props.provider.updateItem(
                { StaffMembersId: staffIds },
                ListNames.SitesMaster,
                !!selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId[0]
                // selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails.defaultSelectedSitesId && selectedZoneDetails.defaultSelectedSitesId[0]
            );

            let successMessage = "Staff updated successfully.";

            if (action === "ADD") {
                successMessage = "Staff Member Added successfully.";
            }

            if (action === "DELETE") {
                successMessage = "Staff Member Removed successfully.";
            }

            toastService.updateLoadingWithSuccess(toastId, successMessage);

            setSelectedToAdd([]);
            loadSiteStaff();

        } catch (error) {
            console.error("Update staff failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    /* ================= RENDER ================= */

    return (
        <>
            {props.isManageSiteArea && (
                <div className="overlay" onClick={() => props.onClose(true)} />
            )}

            <aside className={`drawer site-area-drawer ${props.isManageSiteArea ? "open" : ""}`}>
                {isLoading && <Loader />}

                {/* HEADER */}
                <div className="flex items-center justify-between mb-3">
                    <h3>Manage Staff Members</h3>
                    <button className="btn" onClick={() => props.onClose(true)}>✕</button>
                </div>

                {/* ADD STAFF */}
                <Label className="mt-3">Staff Members</Label>

                <div className="flex gap8 items-end align-items-center">
                    <div style={{ width: "80%" }}>
                        <EmployeeFilter
                            provider={props.provider}
                            isMultiSelect
                            qCState={!!selectedZoneDetails?.defaultSelectedSites && selectedZoneDetails?.defaultSelectedSites[0]?.QCStateId}
                            placeholder="Select staff"
                            defaultOption={selectedToAdd}          // ✅ IDs
                            excludedEmployeeIds={siteStaffIds}     // (optional but recommended)
                            onEmployeeChange={(emps: any[]) => {
                                // convert selected objects → IDs
                                setSelectedToAdd(emps.map(e => e.value));
                            }}
                        />
                    </div>

                    <PrimaryButton
                        text="Add"
                        iconProps={{ iconName: "Add" }}
                        className={(!selectedToAdd.length ? "" : "btn-primary")}
                        disabled={!selectedToAdd.length}
                        onClick={onAddStaff}
                    />
                </div>

                {/* EXISTING STAFF */}
                <Label className="mt-4">Existing Staff Members</Label>

                {siteStaffOptions.length === 0 && (
                    <div className="info-text">No staff assigned</div>
                )}


                {siteStaffOptions.length > 0 && (
                    <div className="staff-table-container">
                        <table className="staff-table">
                            <thead>
                                <tr className="staff-border-bot">
                                    <th>Staff Name</th>
                                    <th className="action-col">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {siteStaffOptions.map(staff => (
                                    <tr key={staff.value}>
                                        <td className="staff-name">{staff.label}</td>
                                        <td className="action-col">
                                            <IconButton
                                                iconProps={{ iconName: "Delete" }}
                                                title="Remove"
                                                ariaLabel="Remove staff"
                                                className="delete-btn"
                                                onClick={() => onClickDeleteStaff(staff)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </aside>

            {/* CONFIRM DELETE MODAL */}
            {confirmState.isModelOpen && (
                <CustomModal
                    isModalOpenProps={confirmState.isModelOpen}
                    setModalpopUpFalse={onCloseModel}
                    subject={"Confirmation"}
                    message={
                        <div>
                            Are you sure you want to remove{" "}
                            <strong>{confirmState.staffName}</strong> from this site?
                        </div>
                    }
                    closeButtonText={"Cancel"}
                    yesButtonText="Remove"
                    onClickOfYes={onConfirmDeleteStaff}
                    isBlocking={true}
                    isModeless={false}
                />
            )}
        </>
    );
};