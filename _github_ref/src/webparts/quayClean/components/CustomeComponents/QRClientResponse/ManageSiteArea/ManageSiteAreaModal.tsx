/* eslint-disable  */
import { DefaultButton, FontWeights, getTheme, IButtonStyles, IconButton, IIconProps, Label, mergeStyleSets, Modal, PrimaryButton, TextField } from "@fluentui/react";
import { useBoolean } from "@fluentui/react-hooks";
import * as React from "react";
import { Messages } from "../../../../../../Common/Constants/Messages";
import { ListNames, UserActivityActionTypeEnum, UserActionEntityTypeEnum, UserActionLogFor } from "../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../Common/ToastService";
import { IDataProvider } from "../../../../../../DataProvider/Interface/IDataProvider";
import { Loader } from "../../../CommonComponents/Loader";
import { UserActivityLog } from "../../../../../../Common/Util";
import { ClientResponseViewFields } from "../ClientResponseFields";
import { EmployeeFilter } from "../../../../../../Common/Filter/EmployeeFilter";
import moment from "moment";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";

export interface IManageSiteArea {
    isManageSiteArea?: any;
    provider: IDataProvider;
    currentUserRoleDetail: any;
    onClose(isRefresh: boolean): void;
    selectedItem: any;
    // isManageStaff: boolean;
    subAreaData: any;
    siteInfo: any;
}

export const ManageSiteAreaModal = (props: IManageSiteArea) => {

    const [modalWidth, setModalWidth] = React.useState("500px");
    const [selectedStaff, setSelectedStaff] = React.useState<any>([]);
    const [siteArea, setSiteArea] = React.useState<any>("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [errors, setErrors] = React.useState({
        siteArea: false,
        staff: false,
        duplicateSiteArea: false
    });


    const theme = getTheme();

    React.useEffect(() => {
        const handleResize = () => {
            setModalWidth(window.innerWidth <= 768 ? "90%" : "550px");
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

        setErrors(prev => ({
            ...prev,
            siteArea: false,
            staff: false,
            duplicateSiteArea: false
        }));

        let isValid = true;

        // if (!props.isManageStaff && (!siteArea || siteArea?.trim() === "")) {
        if (!siteArea || siteArea?.trim() === "") {
            setErrors(prev => ({
                ...prev,
                siteArea: true,
            }));
            isValid = false;
        }

        if (!selectedStaff || selectedStaff.length === 0) {
            setErrors(prev => ({
                ...prev,
                staff: true
            }));
            isValid = false;
        }

        if (!isValid) return;
        // if (!props.isManageStaff) {
        const newName = siteArea?.trim().toLowerCase();
        const isDuplicate = props.subAreaData?.some((item: any) => {
            if (props.selectedItem && item.ID === props.selectedItem.ID) {
                return false;
            }
            return item.SiteArea?.trim().toLowerCase() === newName;
        });

        if (isDuplicate) {
            setErrors(prev => ({
                ...prev,
                duplicateSiteArea: true
            }));
            return;
        }
        // }
        setIsLoading(true);

        // const siteAreaName = props.isManageStaff ? props?.siteInfo?.Title : siteArea;
        const objData = {
            SiteNameId: props?.siteInfo?.ID,
            SiteArea: siteArea?.trim(),
            StaffMembersId: selectedStaff
        };

        try {
            let itemId: any;
            let toastId = "";
            const isEditMode = !!props.selectedItem;
            if (isEditMode) {
                toastId = "Updating...";
                itemId = props.selectedItem.ID
                await props.provider.updateItem(objData, ListNames.SiteAreas, itemId);
            } else {
                toastId = "Creating site area...";
                const result = await props.provider.createItem(objData, ListNames.SiteAreas);
                itemId = result?.data?.Id;
            }

            setIsLoading(false);
            if (props.selectedItem) {
                _userActivityLog(objData);
            } else {
                const logObj = {
                    UserName: props.currentUserRoleDetail?.title,
                    SiteNameId: props.siteInfo?.ID,
                    ActionType: UserActivityActionTypeEnum.Create,
                    EntityType: UserActionEntityTypeEnum.ClientResponse,
                    EntityId: itemId,
                    EntityName: objData.SiteArea,
                    Details: `Created sub area for ${props.siteInfo?.Title}`,
                    LogFor: UserActionLogFor.Both,
                    StateId: props.siteInfo?.QCStateId,
                    Email: props.currentUserRoleDetail?.emailId,
                    Count: 1
                };
                void UserActivityLog(props.provider, logObj, props.currentUserRoleDetail);
            }
            toggleHideDialog();
            props.onClose(true);

            const successMessage = isEditMode ? Messages.UpdatedSuccessfully : Messages.AddSiteAreaSuccessfully;
            toastService.updateLoadingWithSuccess(toastId, successMessage);
        } catch (error) {
            console.error("Error:", error);
            setIsLoading(false);
        }
    };

    const onChangeSiteArea = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setSiteArea(newValue);
        if (newValue && newValue?.trim() !== "") {
            setErrors(prev => ({
                ...prev,
                siteArea: false,
                duplicateSiteArea: false
            }));
        }
    };

    const _userActivityLog = async (objData: any) => {
        try {
            if (props?.selectedItem) {
                const todayDate = moment().format("YYYY-MM-DD");
                const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    listName: ListNames.UserActivityLog,
                    filter: `Email eq '${props.currentUserRoleDetail?.emailId}' and EntityId eq '${props?.selectedItem?.ID}' and SiteNameId eq '${props.siteInfo?.ID}' and EntityType eq '${UserActionEntityTypeEnum.ClientResponse}' and ActionType eq 'Update' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
                };
                const results = await props.provider.getItemsByQuery(queryStringOptions);
                if (results && results.length > 0) {
                    const listData = results.map((data: any) => ({
                        ID: data.ID,
                        Count: data.Count ?? '',
                    }));
                    let updateObj = {
                        Count: listData[0]?.Count + 1,
                    };
                    await props.provider.updateItemWithPnP(updateObj, ListNames.UserActivityLog, Number(listData[0]?.ID));
                } else {

                    const logObj = {

                        UserName: props.currentUserRoleDetail?.title,
                        SiteNameId: props.siteInfo?.ID,
                        ActionType: UserActivityActionTypeEnum.Update,
                        Email: props.currentUserRoleDetail?.emailId,
                        EntityType: UserActionEntityTypeEnum.ClientResponse,
                        EntityId: props?.selectedItem?.ID,
                        EntityName: objData.SiteArea,
                        LogFor: UserActionLogFor.Both,
                        Count: 1,
                        Details: `Updated ${props.siteInfo?.Title} sub area`,
                        StateId: props.siteInfo?.QCStateId,
                    };
                    void UserActivityLog(props.provider, logObj, props.currentUserRoleDetail);
                }
            }
        } catch (error) {
            console.error("Error fetching user activity log:", error);
        } finally {
            // setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (props.selectedItem) {
            setIsLoading(true);
            setSiteArea(props.selectedItem.SiteArea);
            const staffIds = props.selectedItem.StaffMembersId || [];
            setSelectedStaff(staffIds);
            setTimeout(() => {
                setIsLoading(false);
            }, 500);
        }
    }, [props.selectedItem]);


    return (
        <>
            {isLoading && <Loader />}
            <Modal
                titleAriaId="titleId"
                isOpen={props.isManageSiteArea}
                onDismiss={() => props.onClose(false)}
                isBlocking={true}
                // isModeless={props.selectedSite ? false : true}
                isDarkOverlay={true}
                containerClassName={contentStyles.container}
            >
                <div className={contentStyles.header}>
                    <h2 className={contentStyles.heading} id="titleId">
                        {/* {props.isManageStaff ? Messages.ManageStaff : Messages.ManageSiteArea} */}
                        {Messages.ManageSiteArea}
                    </h2>
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
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 mb-2">
                                <Label>
                                    {ClientResponseViewFields.SiteArea} <span className="required">*</span>
                                </Label>

                                <TextField
                                    name="SiteArea"
                                    placeholder="Enter Site Area"
                                    value={siteArea}
                                    onChange={onChangeSiteArea}
                                    disabled={props.selectedItem?.IsDefaultSiteArea}
                                />
                                {errors?.duplicateSiteArea && (
                                    <div className="requiredlink">{Messages.SiteAreaExist}</div>
                                )}

                                {errors?.siteArea && (
                                    <div className="requiredlink">{Messages.SiteArea}</div>
                                )}
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                                <Label>{ClientResponseViewFields.StaffMembers} <span className="required">*</span></Label>
                                <EmployeeFilter
                                    defaultOption={selectedStaff}
                                    onEmployeeChange={(employees: any[]) => {
                                        const staff = employees.map((x: any) => x.value);
                                        setSelectedStaff(staff);
                                        if (staff.length > 0) {
                                            // setErrorStaff(false);
                                            setErrors(prev => ({
                                                ...prev,
                                                staff: false
                                            }));
                                        }
                                    }}
                                    provider={props.provider}
                                    // AllOption={false}
                                    qCState={props?.siteInfo?.QCStateId}
                                    placeholder={"--Select Staff Members--"}
                                    isCloseMenuOnSelect={false}
                                    isMultiSelect={true}
                                />
                                {errors.staff && (
                                    <div className="requiredlink">{Messages.StaffRequired}</div>
                                )}
                            </div>
                        </div>

                        <div className="dataJustifyBetween mt-3 flex-wrap" style={{ justifyContent: "flex-end", display: "flex" }}>
                            <div>
                                <PrimaryButton
                                    text={props.selectedItem ? "Update" : "Save"}
                                    className={"btn btn-primary"}
                                    onClick={() => { onSubmitForm() }}
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