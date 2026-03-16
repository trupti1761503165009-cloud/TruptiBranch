/* eslint-disable  */
import * as React from "react";
import { Link, TooltipHost, PrimaryButton, TextField, DatePicker, Toggle, Breadcrumb, defaultDatePickerStrings, Layer, Popup, Overlay, DefaultButton, DialogFooter, FocusTrapZone, mergeStyleSets, Label, Panel, PanelType } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { onFormatDate, removeElementOfBreadCrum } from "../../../../../Common/Util";
import { Loader } from "../../CommonComponents/Loader";
import { ComponentNameEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import CustomModal from "../../CommonComponents/CustomModal";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import { useId } from "@fluentui/react-hooks";
import { AddClientResponseInlineEditData } from "./AddClientResponseInlineEditData";
import { CRCommonFilter } from "../../../../../Common/Filter/CRCommonFilter";

export const AddClientResponseInlineEdit = (props: any) => {
    const {
        fileSelectionChange,
        ChoiceTitle,
        title,
        hidePopup,
        isPopupVisible,
        onClickClose,
        onClick_SaveClientResponse,
        onChangeTitle,
        _confirmDeleteItem,
        _closeDeleteConfirmation,
        hideDialog,
        textFieldRef,
        state,
        onClickValidationClose,
        isLoading,
        periodicItems,
        _addItem,
        setSelectedRows,
        setdelselectedItem,
        selectedRows,
        updateCellData,
        deleteSelectedAllData,
        deleteSelectedData,
        saveAllData,
        handlePaste,
        onClickAddPopUp,
        _onClickDeleteUploadFile,
        BeforeImage1Deleted,
        BeforeImage2Deleted,
        AfterImage1Deleted,
        AfterImage2Deleted
    } = AddClientResponseInlineEditData(props);
    const tooltipId = useId('tooltip');
    const allRowsSelected = periodicItems?.length > 0 && periodicItems?.every((row: { Id: number; }) => selectedRows.has(row.Id));
    const showIcon = periodicItems?.length > 0 && periodicItems?.some((row: { Id: number; }) => selectedRows.has(row.Id));
    const [width, setWidth] = React.useState<string>("500px");
    const [imageURL, setImageURL] = React.useState("");
    const [showModal, setShowModal] = React.useState(false);
    const toggleModal = (imgURL: string | undefined) => {
        setImageURL(imgURL ? imgURL : "");
        setShowModal(!showModal);
    };
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("500px");
        }
    }, [window.innerWidth]);
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
            maxWidth: '550px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
        }
    });

    return (
        <>{isLoading && <Loader />}
            {state.isFormValidationModelOpen && <CustomModal
                isModalOpenProps={state.isFormValidationModelOpen} setModalpopUpFalse={onClickValidationClose} subject={"Missing data"}
                message={state.validationMessage} closeButtonText={"Close"} />}
            <div className="boxCard">
                <div className="formGroup">
                    <div className="formGroup">
                        <div className="ms-Grid">
                            <div className="ms-Grid-row">
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween">
                                    <div><h1 className="mainTitle">Client Response Form</h1></div>
                                    <div className="dFlex">
                                        <div>
                                            <PrimaryButton className="btn btn-danger justifyright floatright"
                                                onClick={() => {
                                                    // props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProp?.dataObj?.QCStateId, dataObj: props.componentProp.dataObj2, breadCrumItems: breadCrumItems, siteMasterId: props.siteMasterId, isShowDetailOnly: true, siteName: props.componentProp.siteName, qCState: props.componentProp.qCState, pivotName: "ManagePeriodicListKey" });
                                                    props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProp?.dataObj?.QCStateId, dataObj: props?.componentProp?.dataObj, breadCrumItems: props?.componentProp?.breadCrumItems, siteMasterId: props?.componentProp?.originalSiteMasterId, isShowDetailOnly: true, siteName: props?.componentProp?.dataObj?.Title, qCState: props?.componentProp?.dataObj?.QCState, pivotName: "ClientResponseListKey" });

                                                }}

                                                text="Close" />
                                        </div>
                                    </div>

                                </div>
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                    <div className="customebreadcrumb">
                                        <Breadcrumb
                                            items={props.componentProp.breadCrumItems || []}
                                            maxDisplayedItems={3}
                                            ariaLabel="Breadcrumb with items rendered as buttons"
                                            overflowAriaLabel="More links"
                                        />
                                    </div>
                                </div>
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                    <div className="inline-button-row">
                                        {showIcon && <>

                                            {periodicItems?.length === 1 ?
                                                <Link className="actionBtn btnGrey iconSize  ml-10" onClick={() => {
                                                }} >
                                                    <TooltipHost content={"Delete"}>
                                                        <FontAwesomeIcon icon="trash-alt" style={{ fontSize: "16px" }} />
                                                    </TooltipHost>
                                                </Link> :
                                                <Link className="actionBtn btnDanger iconSize  ml-10" onClick={() => {
                                                    deleteSelectedAllData();

                                                }} >
                                                    <TooltipHost content={"Delete"}>
                                                        <FontAwesomeIcon icon="trash-alt" style={{ fontSize: "16px" }} />
                                                    </TooltipHost>
                                                </Link>
                                            }
                                            <span style={{ marginLeft: "5px" }}> Delete Selected Records</span>
                                        </>}

                                        <div className="add-button-container">
                                            {periodicItems?.length > 0 && props?.componentProp?.IsUpdate !== true && <Link className="actionBtn btnGreen iconSize  ml-6" onClick={() => {
                                                saveAllData();
                                            }} >
                                                <TooltipHost content={"Save All"}>
                                                    <FontAwesomeIcon icon="floppy-disk" style={{ fontSize: "16px" }} />
                                                </TooltipHost>
                                            </Link>}

                                            {/* <span style={{ marginRight: 2 }} className="label">Total Records: </span>
                                            <span style={{ color: "grey", fontWeight: 500, marginRight: 10 }}>
                                                {periodicItems.length}
                                            </span> */}
                                            {props?.componentProp?.IsUpdate !== true ?
                                                <PrimaryButton
                                                    text="Add"
                                                    className="btn-primary"
                                                    onClick={() => {
                                                        _addItem();
                                                    }}
                                                /> :
                                                <PrimaryButton
                                                    text="Update"
                                                    className="btn-primary"
                                                    onClick={() => {
                                                        saveAllData();
                                                    }}
                                                />
                                            }
                                        </div>
                                    </div>
                                </div>

                                <div onPaste={periodicItems?.length > 0 ? handlePaste : undefined} className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 inlineEdit" style={{ overflow: "auto", marginTop: 10 }}>
                                    {periodicItems?.length > 0 ? <table>
                                        <thead>
                                            <tr>
                                                <th>
                                                    <input
                                                        type="checkbox"
                                                        checked={allRowsSelected}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;
                                                            setSelectedRows(checked ? new Set(periodicItems?.map((row: { [x: string]: any; }) => row.Id)) : new Set());
                                                            setdelselectedItem(checked ? periodicItems : []);
                                                        }}
                                                    />
                                                </th>
                                                {props?.componentProp?.IsUpdate !== true &&
                                                    <th className="inline-mw-100">Action</th>}
                                                <th className="inline-mw-150">Login Time</th>
                                                <th className="inline-mw-170">Client Name</th>
                                                <th className="inline-mw-160">Location<span><TooltipHost content="Add New Value" id={tooltipId} >
                                                    <FontAwesomeIcon className="ml-5 " icon='plus' onClick={() => onClickAddPopUp("Location")} />
                                                </TooltipHost>
                                                </span></th>
                                                <th className="inline-mw-180">Sub Location<span><TooltipHost content="Add New Value" id={tooltipId} >
                                                    <FontAwesomeIcon className="ml-5 " icon='plus' onClick={() => onClickAddPopUp("Sub Location")} />
                                                </TooltipHost>
                                                </span></th>
                                                <th className="inline-mw-180">Request</th>
                                                <th className="inline-mw-170">Who Are Involved<span><TooltipHost content="Add New Value" id={tooltipId} >
                                                    <FontAwesomeIcon className="ml-5 " icon='plus' onClick={() => onClickAddPopUp("Who Are Involved")} />
                                                </TooltipHost>
                                                </span></th>
                                                <th className="inline-mw-fu">Before Image 1</th>
                                                <th className="inline-mw-fu">Before Image 2</th>
                                                <th className="inline-mw-fu">After Image 1</th>
                                                <th className="inline-mw-fu">After Image 2</th>
                                                <th className="inline-mw-150">Has the solution worked?</th>
                                                <th className="inline-mw-150">Is Completed?</th>
                                                <th className="inline-mw-150">Cleaning Feedback</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {periodicItems?.length > 0 &&
                                                periodicItems?.map((row: any) => {
                                                    return <tr >
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                checked={allRowsSelected}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    setSelectedRows(checked ? new Set(periodicItems?.map((row: { [x: string]: any; }) => row.Id)) : new Set());
                                                                    setdelselectedItem(checked ? periodicItems : []);
                                                                }}
                                                            />
                                                        </td>
                                                        {props?.componentProp?.IsUpdate !== true && <td>
                                                            <div className="dflex">
                                                                {/* <Link className="actionBtn btnGreen iconSize  ml-6" onClick={(e) => {
                                                                    onSaveData(row);
                                                                }} >
                                                                    <TooltipHost content={"Save"}>
                                                                        <FontAwesomeIcon icon="floppy-disk" style={{ fontSize: "16px" }} />
                                                                    </TooltipHost>
                                                                </Link> */}
                                                                  {periodicItems?.length === 1 ?
                                                                <Link className="actionBtn btnGrey iconSize  ml-6 ml5" onClick={() => {
                                                                }} >
                                                                    <TooltipHost content={"Delete"}>
                                                                        <FontAwesomeIcon icon="trash-alt" style={{ fontSize: "16px" }} />
                                                                    </TooltipHost>
                                                                </Link>:
                                                                 <Link className="actionBtn btnDanger iconSize  ml-6 ml5" onClick={() => {

                                                                    deleteSelectedData(row.Id, row.isNew);
                                                                }} >
                                                                    <TooltipHost content={"Delete"}>
                                                                        <FontAwesomeIcon icon="trash-alt" style={{ fontSize: "16px" }} />
                                                                    </TooltipHost>
                                                                </Link>

                                                            }
                                                            </div>
                                                        </td>}
                                                        <td>
                                                            <div className={!row?.LogInTime ? "req-border-red" : ""}>
                                                                <DatePicker allowTextInput
                                                                    ariaLabel="Select a date."
                                                                    value={row.LogInTime ? new Date(row.LogInTime) : undefined}
                                                                    onSelectDate={(newValue) => updateCellData(row.Id, 'LogInTime', (newValue))}
                                                                    formatDate={onFormatDate}
                                                                    strings={defaultDatePickerStrings} />
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className={!row?.Title ? "req-border-red" : ""}>
                                                                <TextField name="Client Name" value={row.Title} onChange={(e, newValue) => updateCellData(row.Id, "Title", newValue || '')} />
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <CRCommonFilter
                                                                onCRChange={(newValue) => updateCellData(row.Id, 'Location', (newValue))}
                                                                provider={props.provider}
                                                                selectedHD={row.Location}
                                                                defaultOption={!!row.Location ? row.Location : props.dataObj ? props.dataObj[0]?.Location : ""}
                                                                // defaultOption={newFromObj?.Area}
                                                                siteNameId={props?.componentProp?.originalSiteMasterId}
                                                                Title="Location"
                                                                placeHolder="Select Location"
                                                                isReq={true}
                                                                HideAddOption={true}
                                                                isRefresh={title}
                                                                isFocus={textFieldRef}
                                                            />
                                                        </td>
                                                        <td>
                                                            <CRCommonFilter
                                                                onCRChange={(newValue) => updateCellData(row.Id, 'SubLocation', (newValue))}
                                                                provider={props.provider}
                                                                selectedHD={row.SubLocation}
                                                                defaultOption={!!row.SubLocation ? row.SubLocation : props.dataObj ? props.dataObj[0]?.SubLocation : ""}
                                                                // defaultOption={newFromObj?.Area}
                                                                siteNameId={props?.componentProp?.originalSiteMasterId}
                                                                Title="Sub Location"
                                                                placeHolder="Select Sub Location"
                                                                isReq={true}
                                                                HideAddOption={true}
                                                                isRefresh={title}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className={!row?.Request ? "req-border-red" : ""}>
                                                                <TextField name="Request" value={row.Request} onChange={(e, newValue) => updateCellData(row.Id, "Request", newValue || '')} />
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <CRCommonFilter
                                                                onCRChange={(newValue) => updateCellData(row.Id, 'WhoAreInvolved', (newValue))}
                                                                provider={props.provider}
                                                                selectedHD={row.WhoAreInvolved}
                                                                defaultOption={!!row.WhoAreInvolved ? row.WhoAreInvolved : props.dataObj ? props.dataObj[0]?.WhoAreInvolved : ""}
                                                                // defaultOption={newFromObj?.Area}
                                                                siteNameId={props?.componentProp?.originalSiteMasterId}
                                                                Title="Who Are Involved"
                                                                placeHolder="Select Who Are Involved"
                                                                isReq={true}
                                                                HideAddOption={true}
                                                                isRefresh={title}
                                                            />
                                                        </td>
                                                        <td>
                                                            {props?.componentProp?.IsUpdate && BeforeImage1Deleted === false && row?.BeforeImage1 !== "" ?
                                                                <div className="formControl pt-2 pb-2">
                                                                    <span className="cursorPointer"
                                                                        onClick={() => toggleModal(row?.BeforeImage1)} >
                                                                        View Image
                                                                    </span>
                                                                    <FontAwesomeIcon className="ml5" icon="trash-alt" onClick={() => _onClickDeleteUploadFile(row.Id, "BeforeImage1")} />
                                                                </div>
                                                                : <div>
                                                                    <TextField
                                                                        key={`before-image1-${row.Id}`}
                                                                        type="file"
                                                                        className="FileUpload formControl"
                                                                        accept="image/*"
                                                                        onChange={(e: any) => fileSelectionChange(e, row.Id, 'BeforeImage1')}
                                                                    />
                                                                </div>}
                                                        </td>
                                                        <td>
                                                            {props?.componentProp?.IsUpdate && BeforeImage2Deleted === false && row?.BeforeImage2 !== "" ?
                                                                <div className="formControl pt-2 pb-2">
                                                                    <span className="cursorPointer"
                                                                        onClick={() => toggleModal(row?.BeforeImage2)} >
                                                                        View Image
                                                                    </span>
                                                                    <FontAwesomeIcon className="ml5" icon="trash-alt" onClick={() => _onClickDeleteUploadFile(row.Id, "BeforeImage2")} />
                                                                </div>
                                                                :
                                                                <div>
                                                                    <TextField
                                                                        key={`before-image2-${row.Id}`}
                                                                        type="file"
                                                                        className="FileUpload formControl"
                                                                        accept="image/*"
                                                                        onChange={(e: any) => fileSelectionChange(e, row.Id, 'BeforeImage2')}
                                                                    />
                                                                </div>}
                                                        </td>
                                                        <td>
                                                            {props?.componentProp?.IsUpdate && AfterImage1Deleted === false && row?.AfterImage1 !== "" ?
                                                                <div className="formControl pt-2 pb-2">
                                                                    <span className="cursorPointer"
                                                                        onClick={() => toggleModal(row?.AfterImage1)} >
                                                                        View Image
                                                                    </span>
                                                                    <FontAwesomeIcon className="ml5" icon="trash-alt" onClick={() => _onClickDeleteUploadFile(row.Id, "AfterImage1")} />
                                                                </div>
                                                                :
                                                                <div>
                                                                    <TextField
                                                                        key={`after-image1-${row.Id}`}
                                                                        type="file"
                                                                        className="FileUpload formControl"
                                                                        accept="image/*"
                                                                        onChange={(e: any) => fileSelectionChange(e, row.Id, 'AfterImage1')}
                                                                    />
                                                                </div>}
                                                        </td>
                                                        <td>
                                                            {props?.componentProp?.IsUpdate && AfterImage2Deleted === false && row?.AfterImage2 !== "" ?
                                                                <div className="formControl pt-2 pb-2">
                                                                    <span className="cursorPointer"
                                                                        onClick={() => toggleModal(row?.AfterImage2)} >
                                                                        View Image
                                                                    </span>
                                                                    <FontAwesomeIcon className="ml5" icon="trash-alt" onClick={() => _onClickDeleteUploadFile(row.Id, "AfterImage2")} />
                                                                </div>
                                                                : <div>
                                                                    <TextField
                                                                        key={`after-image2-${row.Id}`}
                                                                        type="file"
                                                                        className="FileUpload formControl"
                                                                        accept="image/*"
                                                                        onChange={(e: any) => fileSelectionChange(e, row.Id, 'AfterImage2')}
                                                                    />
                                                                </div>}
                                                        </td>
                                                        <td>
                                                            <Toggle
                                                                checked={row.HasTheSolutionWorked ?? false}
                                                                onChange={(e, checked) => updateCellData(row.Id, 'HasTheSolutionWorked', checked ?? false)}
                                                                className="custom-toggle"
                                                            />
                                                        </td>
                                                        <td>
                                                            <Toggle
                                                                checked={row.IsCompleted ?? false}
                                                                onChange={(e, checked) => updateCellData(row.Id, 'IsCompleted', checked ?? false)}
                                                                className="custom-toggle"
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className={!row?.CleaningFeedback ? "req-border-red" : ""}>
                                                                <TextField name="Cleaning Feedback" value={row.CleaningFeedback} onChange={(e, newValue) => updateCellData(row.Id, "CleaningFeedback", newValue || '')} />
                                                            </div>
                                                        </td>
                                                    </tr>
                                                })
                                            }
                                        </tbody>
                                    </table> :
                                        <NoRecordFound />}
                                </div>
                                <div className={`ms-Grid-col ms-lg12 ms-md12 ms-sm12`} style={{ padding: 0, marginTop: 5 }}>
                                    <p style={{ fontSize: '9px', marginTop: '5px', }}>
                                        Note: You can copy data directly from Excel and paste it into this grid.
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div >
                </div >
            </div >
            <CustomModal isModalOpenProps={hideDialog}
                setModalpopUpFalse={_closeDeleteConfirmation}
                subject={"Delete Item"}
                message={'Are you sure, you want to delete this record?'}
                yesButtonText="Yes"
                closeButtonText={"No"}
                onClickOfYes={_confirmDeleteItem} />
            <Panel
                isOpen={showModal}
                onDismiss={() => toggleModal("")}
                type={PanelType.extraLarge}
                headerText="Image View">
                <img src={imageURL} style={{ width: "100%", height: "85vh" }} />
                {/* <img src={`${imageURL}`} alt="Before Image 1" style={{ maxHeight: '100%' }} /> */}
            </Panel>
            {
                isPopupVisible && (
                    <Layer>
                        <Popup
                            className={popupStyles.root}
                            role="dialog"
                            aria-modal="true"
                            onDismiss={hidePopup}
                        >
                            <Overlay onClick={hidePopup} />
                            <FocusTrapZone>
                                <div role="document" className={popupStyles.content}>
                                    <h2 className="mt-10">Add Client Response {ChoiceTitle.current} choice</h2>
                                    <TextField className="formControl mt-20" label={ChoiceTitle.current} placeholder="Enter New Value"
                                        value={title}
                                        required
                                        onChange={onChangeTitle} />
                                    <DialogFooter>
                                        <PrimaryButton
                                            text="Save"
                                            disabled={title.trim() === ""}
                                            onClick={onClick_SaveClientResponse}
                                            className={`mrt15 css-b62m3t-container btn ${title.trim() === "" ? 'btn-sec' : 'btn-primary'}`}
                                        />
                                        <DefaultButton text="Close" className='secondMain btn btn-danger' onClick={onClickClose} />
                                    </DialogFooter>
                                </div>
                            </FocusTrapZone>
                        </Popup>
                    </Layer>
                )
            }
        </>
    );
};