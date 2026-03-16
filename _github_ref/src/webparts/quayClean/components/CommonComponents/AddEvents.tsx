/* eslint-disable @rushstack/security/no-unsafe-regexp */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-floating-promises */
import * as React from 'react';
import { Layer, Overlay, FocusTrapZone, TextField, DialogFooter, PrimaryButton, DefaultButton, mergeStyleSets, Popup, DatePicker, Label, Dropdown } from 'office-ui-fabric-react';
import { useBoolean, useId } from '@uifabric/react-hooks';
import { defaultDatePickerStrings, Link, Toggle, TooltipHost } from '@fluentui/react';
import { useAtomValue } from 'jotai';
import { ListNames, UserActionEntityTypeEnum } from '../../../../Common/Enum/ComponentNameEnum';
import { onFormatDate, UserActivityLog } from '../../../../Common/Util';
import { appGlobalStateAtom } from '../../../../jotai/appGlobalStateAtom';
import { toastService } from '../../../../Common/ToastService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RichText } from "@pnp/spfx-controls-react/lib/RichText";
import { MultipleSiteFilter } from '../../../../Common/Filter/MultipleSiteFilter';
import { Loader } from './Loader';
interface IAddEventProps {
    onclickAddEvent: () => void;
    SiteName?: number;
    editEventData?: any;
    isEditMode?: boolean;
    SiteEvent: boolean
}

const AddEvent: React.FC<IAddEventProps> = (props) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { onclickAddEvent, editEventData, isEditMode = false } = props;
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail, provider } = appGlobalState;
    const [width, setWidth] = React.useState<string>("850px");
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [assetPurchaseDate, setAssetPurchaseDate] = React.useState<Date | undefined>(new Date());
    const [selectedChecklistType, setSelectedChecklistType] = React.useState<string>("Marketing's");
    const [isFormValid, setIsFormValid] = React.useState(true);
    const tooltipId = useId('tooltip');
    const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>([]);
    const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>([]);
    const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>([]);


    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSiteIds(siteIds);
        setSelectedSiteTitles(siteTitles);
        setSelectedSCSites(siteSC);
        if (siteIds && siteIds.length > 0) {
            setErrors(prev => ({ ...prev, Site: "" }));
            setIsFormValid(true);
        }
    };
    const [formData, setFormData] = React.useState({
        EventTitle: '',
        Label: '',
        EventLink: '',
        EventImage: '',
        EventDescription: '',
        IsActive: true,
    });
    const [errors, setErrors] = React.useState({
        Site: "",
        EventTitle: "",
        Label: "",
        EventLink: "",
        EventImage: "",
        EventDescription: "",
    });

    const popupStyles = mergeStyleSets({
        root: {
            background: 'rgba(0, 0, 0, 0.2)',
            bottom: '0',
            left: '0',
            position: 'fixed',
            right: '0',
            top: '0',
        },
        content: {
            background: 'white',
            left: '50%',
            maxWidth: '820px',
            maxHeight: '770px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
            overflowY: 'auto',
            // Default for large screens
            height: 'calc(100vh - 80px)',
            '@media (max-width: 1200px)': { // Medium screens
                height: 'calc(100vh - 40px)',
            },
            '@media (max-width: 768px)': { // Small screens
                height: 'calc(100vh - 10px)',
            }
        }
    });

    const urlRegex = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

    const onDropdownChange = (event: React.FormEvent<HTMLDivElement>, option: any) => {
        setSelectedChecklistType(option.key);
    };

    const onClickCancel = () => {
        hidePopup();
        resetForm();
        setSelectedSiteIds([])
    }

    const handleRichTextChange = (name: string, value: string): string => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setIsFormValid(true);
        return value;
    };

    const validate = () => {
        const newErrors: typeof errors = {
            Site: !props.SiteEvent ? selectedSiteIds && selectedSiteIds.length > 0 ? "" : "Site Name is required." : "",
            EventTitle: formData.EventTitle ? "" : "Event Title is required.",
            Label: '',
            EventLink: formData.EventLink
                ? urlRegex.test(formData.EventLink)
                    ? ""
                    : "Please enter a valid Event link."
                : "Event Link is required.",
            EventImage: formData.EventImage
                ? urlRegex.test(formData.EventImage)
                    ? ""
                    : "Please enter a valid Event image link."
                : "Event Image Link is required.",
            EventDescription: ''
        };
        setErrors(newErrors);
        const isValid = Object.values(newErrors).every((error) => error === "");
        setIsFormValid(isValid);
        return isValid;
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
        setIsFormValid(true);
    };

    const _onChangeToggle = (event: React.MouseEvent<HTMLElement>, checked?: boolean) => {
        setFormData((prev) => ({ ...prev, IsActive: checked || false }));
    };

    const resetForm = () => {
        setFormData({
            EventTitle: '',
            Label: '',
            EventLink: '',
            EventImage: '',
            EventDescription: '',
            IsActive: true,
        });
        setErrors({
            Site: "",
            EventTitle: "",
            Label: "",
            EventLink: "",
            EventImage: "",
            EventDescription: "",
        });
        setAssetPurchaseDate(new Date());
        setSelectedChecklistType("Marketing's");
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        setIsLoading(true); // Start loader
        const toastId = toastService.loading(isEditMode ? 'Updating event...' : 'Creating event...');
        const toastMessage = isEditMode ? 'Event has been updated successfully!' : 'Event has been added successfully!';

        const siteData = props?.SiteEvent
            ? {
                SiteEvent: props?.SiteName || props?.editEventData?.SiteName ? true : false,
                ...(props?.SiteName && { SiteNameId: props.SiteName }),
            }
            : {
                SiteEvent: selectedSiteIds.length > 0 ? true : false,
                ...(selectedSiteIds.length > 0 && { SiteNameId: selectedSiteIds[0] }),
            };

        const EventData = {
            Title: formData.EventTitle,
            Label: formData.Label,
            EventLink: { Url: formData.EventLink, Description: "Event Link" },
            EventImage: { Url: formData.EventImage },
            EventDescription: formData.EventDescription,
            EventDateTime: assetPurchaseDate,
            NewsEventType: selectedChecklistType,
            LinkFor: "Client Dashboard",
            IsActive: formData.IsActive,
            ...siteData,
        };
        try {
            if (isEditMode) {
                await provider.updateItem(EventData, ListNames.EventMaster, editEventData.ID);
                const logObj = {
                    UserName: currentUserRoleDetail?.title,
                    ActionType: "Update",
                    SiteNameId: props.SiteEvent ? Number(props.SiteName) : selectedSiteIds.length > 0 ? Number(selectedSiteIds[0]) : undefined,
                    EntityType: UserActionEntityTypeEnum.Event,
                    EntityId: Number(editEventData.ID),
                    EntityName: formData.EventTitle,
                    Details: `Update Event`
                };
                void UserActivityLog(provider, logObj, currentUserRoleDetail);
            } else {
                const item = await provider.createItem(EventData, ListNames.EventMaster);
                const createdId = item.data.Id;
                const logObj = {
                    UserName: currentUserRoleDetail?.title,
                    SiteNameId: selectedSiteIds.length > 0 ? Number(selectedSiteIds[0]) : undefined,
                    ActionType: "Create",
                    EntityType: UserActionEntityTypeEnum.Event,
                    EntityId: Number(createdId),
                    EntityName: formData.EventTitle,
                    Details: `Add Event`
                };
                void UserActivityLog(provider, logObj, currentUserRoleDetail);
            }

            toastService.updateLoadingWithSuccess(toastId, toastMessage);
            hidePopup();
            resetForm();
            onclickAddEvent();
            props.onclickAddEvent();
            setSelectedSiteIds([])
        } catch (error) {
            console.error(error);
            // toastService.updateLoadingWithError(toastId, "Something went wrong while saving the event.");
        } finally {
            setIsLoading(false); // Stop loader
        }
    };


    React.useEffect(() => {
        if (isEditMode && editEventData) {
            setFormData({
                EventTitle: editEventData.Title || '',
                Label: editEventData.Label || '',
                EventLink: editEventData.EventLink || '',
                EventImage: editEventData.Image || '',
                EventDescription: editEventData.EventDescription || '',
                IsActive: editEventData.IsActive,
            });
            setAssetPurchaseDate(new Date(editEventData.OrgEventDateTime) || new Date());
            setSelectedChecklistType(editEventData.NewsEventType || "Marketing's");
        }
    }, [isEditMode, editEventData]);

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("850px");
        }
    }, [window.innerWidth]);

    return (
        <>
            {isLoading && <Loader />}
            {isEditMode ? (
                <Link className="actionBtn iconSize btnEdit" onClick={showPopup}>
                    <TooltipHost content={"Edit Detail"} id={tooltipId}>
                        <FontAwesomeIcon icon="edit" />
                    </TooltipHost>
                </Link>
            ) : (
                <PrimaryButton className="btn btn-primary" onClick={showPopup}>
                    Add Event
                </PrimaryButton>
            )}

            {isPopupVisible && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup}>
                        <Overlay onClick={hidePopup} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles.content}>
                                <h2 className="mt-10">{isEditMode ? "Update Event" : "Add Event"}</h2>
                                <div className="ms-Grid-row add-event-dialog-padding">
                                    {!props.SiteEvent &&
                                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12">
                                            <Label className="formLabel">Site Name<span className="required">*</span></Label>
                                            <MultipleSiteFilter
                                                isPermissionFiter={true}
                                                loginUserRoleDetails={currentUserRoleDetail}
                                                selectedSiteIds={selectedSiteIds}
                                                selectedSiteTitles={selectedSiteTitles}
                                                selectedSCSite={selectedSCSites}
                                                onSiteChange={handleSiteChange}
                                                provider={provider}
                                                isRequired={true}
                                                AllOption={true}
                                                isMultiSelect={false}
                                                className="site-dropdown-modal"
                                                isClearable={false}
                                            />
                                            {errors.Site && <div className="error-message" style={{ marginTop: "5px", color: "rgb(164, 38, 44)" }}>{errors.Site}</div>}
                                        </div>}
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12">
                                        <TextField
                                            className="formControl mt-1"
                                            name="EventTitle"
                                            label="Event Title"
                                            required
                                            placeholder="Enter Event Title"
                                            value={formData.EventTitle}
                                            onChange={handleInputChange}
                                            errorMessage={errors.EventTitle}
                                        />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12">
                                        <TextField
                                            className="formControl mt-1"
                                            name="Label"
                                            label="Label"
                                            placeholder="Enter Label"
                                            value={formData.Label}
                                            onChange={handleInputChange}
                                            errorMessage={errors.Label}
                                        />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12">
                                        <Label className="formLabel">Event Date<span className="required">*</span></Label>
                                        <DatePicker
                                            allowTextInput
                                            ariaLabel="Select a date."
                                            value={assetPurchaseDate}
                                            className="formControl"
                                            onSelectDate={setAssetPurchaseDate as (date?: Date) => void}
                                            formatDate={onFormatDate}
                                            strings={defaultDatePickerStrings}
                                        />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12">
                                        <TextField
                                            className="formControl mt-1"
                                            name="EventLink"
                                            label="Event Link"
                                            required
                                            placeholder="Enter Event Link"
                                            value={formData.EventLink}
                                            onChange={handleInputChange}
                                            errorMessage={errors.EventLink}
                                        />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12">
                                        <TextField
                                            className="formControl mt-1"
                                            name="EventImage"
                                            label="Event Image Link"
                                            required
                                            placeholder="Enter Event Image Link"
                                            value={formData.EventImage}
                                            onChange={handleInputChange}
                                            errorMessage={errors.EventImage}
                                        />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 event-dd-cls">
                                        <Label className="formLabel">News Event Type<span className="required">*</span></Label>
                                        <Dropdown
                                            // label="Checklist Type"
                                            className="formControl"
                                            selectedKey={selectedChecklistType} // Controlled component
                                            onChange={onDropdownChange}
                                            options={[
                                                { key: "Marketing's", text: "Marketing's" },
                                                { key: "Sports", text: "Sports" }
                                            ]}
                                        />
                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12" >
                                        <Label className="formLabel">Event Description</Label>
                                        <RichText
                                            value={formData.EventDescription} // Existing value from state
                                            onChange={(text) => handleRichTextChange("EventDescription", text)}
                                            isEditMode={true}
                                            placeholder="Enter Event Description"
                                        />

                                    </div>
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12" >
                                        <div className="formControl mt-1">
                                            <Toggle
                                                label="Is Active"
                                                onText="Yes"
                                                offText="No"
                                                defaultChecked={formData.IsActive} // Default to true, can be set dynamically
                                                onChange={_onChangeToggle} // Use the _onChangeCable function to update the state
                                            />
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <PrimaryButton
                                        text={isEditMode ? "Update" : "Save"}
                                        onClick={handleSubmit}
                                        className={`mrt15 css-b62m3t-container ${isFormValid ? 'btn btn-primary' : 'btn btn-secondary'}`}
                                        disabled={!isFormValid} // Disable the button if form is not valid
                                    />
                                    <DefaultButton text="Cancel" className='secondMain btn btn-danger mr-16' onClick={onClickCancel} />
                                </DialogFooter>
                            </Popup>
                        </FocusTrapZone>
                    </Popup >
                </Layer >
            )}
        </>
    );
};

export default AddEvent;
