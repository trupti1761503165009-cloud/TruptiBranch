/* eslint-disable  */
import * as React from "react";
import { Link, TooltipHost, PrimaryButton, TextField, DatePicker, Toggle, Breadcrumb, defaultDatePickerStrings, Layer, Popup, Overlay, DefaultButton, DialogFooter, FocusTrapZone, mergeStyleSets, IconButton } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { onFormatDate, removeElementOfBreadCrum } from "../../../../../Common/Util";
import { Loader } from "../../CommonComponents/Loader";
import { AddPeriodicInlineEditData } from "./AddPeriodicInlineEditData";
import { ComponentNameEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { FrequencyFilter } from "../../../../../Common/Filter/FrequencyFilter";
import { JobCompletionFilter } from "../../../../../Common/Filter/JobCompletionFilter";
import { MonthFilter } from "../../../../../Common/Filter/MonthFilter";
import { PeriodicCommonFilter } from "../../../../../Common/Filter/PeriodicCommonFilter";
import { WeekFilter } from "../../../../../Common/Filter/WeekFilter";
import { YearFilter } from "../../../../../Common/Filter/YearFilter";
import CustomModal from "../../CommonComponents/CustomModal";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import { useId } from "@fluentui/react-hooks";

export const AddPeriodicInlineEdit = (props: any) => {
    const {
        ChoiceTitle,
        title,
        hidePopup,
        isPopupVisible,
        onClickClose,
        onClick_SavePeriodic,
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
        // onSaveData,
        deleteSelectedAllData,
        deleteSelectedData,
        saveAllData,
        handlePaste,
        onClickAddPopUp,
        openAttachmentManager,
        onSelectNewFiles,
        requestDeleteFile,
        removeNewFile,
        isAttachmentModalOpen,
        currentAttachmentRow,
        setIsAttachmentModalOpen,
        confirmFileDelete,
        cancelDeleteExistingFile,
        fileToDelete,
        confirmDeleteExistingFile,
        onClickRedirect
    } = AddPeriodicInlineEditData(props);
    const tooltipId = useId('tooltip');
    const allRowsSelected = !!periodicItems && periodicItems?.length > 0 && periodicItems?.every((row: { Id: number; }) => selectedRows?.has(row.Id));
    const showIcon = !!periodicItems && periodicItems?.length > 0 && periodicItems?.some((row: { Id: number; }) => selectedRows?.has(row.Id));
    const [width, setWidth] = React.useState<string>("500px");
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
            {state.isFormValidationModelOpen &&
                <CustomModal
                    isModalOpenProps={state.isFormValidationModelOpen}
                    setModalpopUpFalse={onClickValidationClose}
                    subject={"Missing data"}
                    message={state.validationMessage}
                    closeButtonText={"Close"} />}
            <div className="boxCard">
                <div className="formGroup">
                    <div className="formGroup">
                        <div className="ms-Grid">
                            <div className="ms-Grid-row">
                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dFlex justifyContentBetween">
                                    <div><h1 className="mainTitle">Periodic Formss</h1></div>
                                    <div className="dFlex">
                                        <div>
                                            <PrimaryButton className="btn btn-danger justifyright floatright"
                                                onClick={onClickRedirect}
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
                                            <Link className="actionBtn btnDanger iconSize  ml-10" onClick={() => {
                                                deleteSelectedAllData();
                                            }} >
                                                <TooltipHost content={"Delete"}>
                                                    <FontAwesomeIcon icon="trash-alt" style={{ fontSize: "16px" }} />
                                                </TooltipHost>
                                            </Link><span style={{ marginLeft: "5px" }}> Delete Selected Records</span>
                                        </>}

                                        <div className="add-button-container">
                                            {periodicItems?.length > 0 && props?.componentProp?.IsUpdate !== true && <Link className="actionBtn btnGreen iconSize  ml-6" onClick={() => {
                                                saveAllData();
                                            }} >
                                                <TooltipHost content={"Save All"}>
                                                    <FontAwesomeIcon icon="floppy-disk" style={{ fontSize: "16px" }} />
                                                </TooltipHost>
                                            </Link>}
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

                                <div onPaste={periodicItems.length > 0 ? handlePaste : undefined} className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 inlineEdit" style={{ overflow: "auto", marginTop: 10 }}>
                                    {periodicItems.length > 0 ? <table>
                                        <thead>
                                            <tr>
                                                <th>
                                                    <input
                                                        type="checkbox"
                                                        className="custom-periodic-checkbox"
                                                        checked={allRowsSelected}
                                                        onChange={(e) => {
                                                            const checked = e.target.checked;

                                                            if (checked) {
                                                                // Select all rows
                                                                const all = new Set(periodicItems.map((row) => row.Id));
                                                                setSelectedRows(all);
                                                                setdelselectedItem(periodicItems);
                                                            } else {
                                                                // Clear selection
                                                                setSelectedRows(new Set());
                                                                setdelselectedItem([]);
                                                            }
                                                        }}
                                                    />
                                                </th>
                                                {/* {props?.componentProp?.IsUpdate !== true && */}
                                                <th className="inline-mw-100">Action</th>
                                                {/* } */}
                                                <th className="inline-mw-160">Area <span><TooltipHost content="Add New Value" id={tooltipId} >
                                                    <FontAwesomeIcon className="ml-5 " icon='plus' onClick={() => onClickAddPopUp("Area")} />
                                                </TooltipHost>
                                                </span></th>
                                                <th className="inline-mw-180">Sub Location <span><TooltipHost content="Add New Value" id={tooltipId} >
                                                    <FontAwesomeIcon className="ml-5 " icon='plus' onClick={() => onClickAddPopUp("Sub Location")} />
                                                </TooltipHost>
                                                </span></th>
                                                <th className="inline-mw-170">Work Type <span><TooltipHost content="Add New Value" id={tooltipId} >
                                                    <FontAwesomeIcon className="ml-5 " icon='plus' onClick={() => onClickAddPopUp("Work Type")} />
                                                </TooltipHost>
                                                </span></th>
                                                <th className="inline-mw-150">Periodic Title</th>
                                                <th className="inline-mw-150">Frequency</th>
                                                <th className="inline-mw-100">Week</th>
                                                <th className="inline-mw-100">Month</th>
                                                <th className="inline-mw-100">Year</th>
                                                <th className="inline-mw-190">Job Completion</th>
                                                <th className="inline-mw-150">Task Date</th>
                                                <th className="inline-mw-150">Completion Date</th>
                                                <th className="inline-mw-150">Event Number</th>
                                                <th className="inline-mw-120">Hours</th>
                                                <th className="inline-mw-120">Cost</th>
                                                <th className="inline-mw-120">Staff Number</th>
                                                {props?.componentProp?.IsUpdate == true &&
                                                    <th className="inline-mw-120">Is Completed?</th>}
                                                <th className="inline-mw-150">Is Notification?</th>
                                                <th className="inline-mw-120">Comment</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {periodicItems.length > 0 &&
                                                periodicItems.map((row: any) => {
                                                    return <tr >
                                                        <td>
                                                            <input
                                                                type="checkbox"
                                                                className="custom-periodic-checkbox"
                                                                checked={selectedRows.has(row.Id)}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;

                                                                    setSelectedRows((prev) => {
                                                                        const updated = new Set(prev);

                                                                        if (checked) {
                                                                            updated.add(row.Id);
                                                                        } else {
                                                                            updated.delete(row.Id);
                                                                        }

                                                                        // Update delete selected items array
                                                                        const selectedItems = periodicItems.filter((i) => updated.has(i.Id));
                                                                        setdelselectedItem(selectedItems);

                                                                        return updated;
                                                                    });
                                                                }}
                                                            />
                                                        </td>
                                                        {/* {props?.componentProp?.IsUpdate !== true &&  */}
                                                        <td>
                                                            <div className="dflex">
                                                                {/* <Link className="actionBtn btnGreen iconSize  ml-6" onClick={() => {
                                                                    onSaveData(row);
                                                                }} >
                                                                    <TooltipHost content={"Save"}>
                                                                        <FontAwesomeIcon icon="floppy-disk" style={{ fontSize: "16px" }} />
                                                                    </TooltipHost>
                                                                </Link> */}
                                                                {props?.componentProp?.IsUpdate !== true &&
                                                                    <Link className="actionBtn btnDanger iconSize  ml-6 ml5" onClick={() => {
                                                                        deleteSelectedData(row.Id, row.isNew);
                                                                    }}>
                                                                        <TooltipHost content={"Delete"}>
                                                                            <FontAwesomeIcon icon="trash-alt" style={{ fontSize: "16px" }} />
                                                                        </TooltipHost>
                                                                    </Link>
                                                                }
                                                                &nbsp;
                                                                <Link
                                                                    className={`actionBtn btnDanger dticon`}
                                                                >
                                                                    <TooltipHost
                                                                        content={"Add Attachments"}
                                                                        id={tooltipId}
                                                                    >
                                                                        <div>
                                                                            <FontAwesomeIcon
                                                                                icon="paperclip"
                                                                                className="cursor-pointer mx-2"
                                                                                onClick={() => openAttachmentManager(row)}
                                                                            />
                                                                        </div>
                                                                    </TooltipHost>
                                                                </Link>
                                                            </div>
                                                        </td>
                                                        {/* } */}
                                                        <td>
                                                            <PeriodicCommonFilter
                                                                onPeriodicChange={(newValue) => updateCellData(row.Id, 'Area', (newValue))}
                                                                provider={props.provider}
                                                                selectedPeriodic={row.Area}
                                                                defaultOption={!!row.Area ? row.Area : props.dataObj ? props.dataObj[0]?.AssetType : ""}
                                                                siteNameId={props.siteMasterId}
                                                                Title="Area"
                                                                placeHolder="Select Area"
                                                                isReq={true}
                                                                isFocus={textFieldRef}
                                                                HideAddOption={true}
                                                                isRefresh={title}
                                                            />
                                                        </td>
                                                        <td>
                                                            <PeriodicCommonFilter
                                                                onPeriodicChange={(newValue) => updateCellData(row.Id, 'SubLocation', (newValue))}
                                                                provider={props.provider}
                                                                selectedPeriodic={row.SubLocation}
                                                                defaultOption={!!row.SubLocation ? row.SubLocation : props.dataObj ? props.dataObj[0]?.SubLocation : ""}
                                                                siteNameId={props.siteMasterId}
                                                                Title="Sub Location"
                                                                placeHolder="Select Sub Location"
                                                                HideAddOption={true}
                                                                isRefresh={title}
                                                            />
                                                        </td>
                                                        <td>
                                                            <PeriodicCommonFilter
                                                                onPeriodicChange={(newValue) => updateCellData(row.Id, 'WorkType', (newValue))}
                                                                provider={props.provider}
                                                                selectedPeriodic={row.WorkType}
                                                                defaultOption={!!row.WorkType ? row.WorkType : props.dataObj ? props.dataObj[0]?.WorkType : ""}
                                                                siteNameId={props.siteMasterId}
                                                                Title="Work Type"
                                                                placeHolder="Select Work Type"
                                                                HideAddOption={true}
                                                                isRefresh={title}
                                                            />
                                                        </td>
                                                        <td>
                                                            <div className={!row?.Title ? "req-border-red" : ""}>
                                                                <TextField name="Title" value={row.Title} onChange={(e, newValue) => updateCellData(row.Id, "Title", newValue || '')} />
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <FrequencyFilter
                                                                selectedFrequency={row.Frequency}
                                                                defaultOption={!!row.Frequency ? row.Frequency : props.dataObj ? props.dataObj[0]?.Frequency : ""}
                                                                onFrequencyChange={(newValue) => updateCellData(row.Id, 'Frequency', (newValue))}
                                                                provider={props.provider}
                                                                isRequired={true}
                                                                isReq={true} />
                                                        </td>
                                                        <td>
                                                            <WeekFilter
                                                                selectedWeek={row.Week}
                                                                defaultOption={!!row.Week ? row.Week : props.dataObj ? props.dataObj[0]?.Week : ""}
                                                                onWeekChange={(newValue) => updateCellData(row.Id, 'Week', (newValue))}
                                                                provider={props.provider}
                                                                isRequired={true}
                                                                isReq={true} />
                                                        </td>
                                                        <td>
                                                            <MonthFilter
                                                                selectedMonth={row.Month}
                                                                defaultOption={!!row.Month ? row.Month : props.dataObj ? props.dataObj[0]?.Month : ""}
                                                                onMonthChange={(newValue) => updateCellData(row.Id, 'Month', (newValue))}
                                                                provider={props.provider}
                                                                isRequired={true}
                                                                isReq={true} />
                                                        </td>
                                                        <td>
                                                            <YearFilter
                                                                selectedYear={row.Year}
                                                                defaultOption={!!row.Year ? row.Year : props.dataObj ? props.dataObj[0]?.Year : ""}
                                                                onYearChange={(newValue) => updateCellData(row.Id, 'Year', (newValue))}
                                                                provider={props.provider}
                                                                AllOption={false}
                                                                isRequired={true}
                                                                isReq={true} />
                                                        </td>
                                                        <td>
                                                            <JobCompletionFilter
                                                                selectedJobCompletion={row.JobCompletion}
                                                                defaultOption={!!row.JobCompletion ? row.JobCompletion : props.dataObj ? props.dataObj[0]?.JobCompletion : ""}
                                                                onJobCompletionChange={(newValue) => updateCellData(row.Id, 'JobCompletion', (newValue))}
                                                                provider={props.provider}
                                                                isRequired={true} />
                                                        </td>
                                                        <td>
                                                            <div className={!row?.TaskDate ? "req-border-red" : ""}>
                                                                <DatePicker allowTextInput
                                                                    ariaLabel="Select a date."
                                                                    value={row.TaskDate ? new Date(row.TaskDate) : undefined}
                                                                    onSelectDate={(newValue) => updateCellData(row.Id, 'TaskDate', (newValue))}
                                                                    formatDate={onFormatDate}
                                                                    strings={defaultDatePickerStrings} />
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <DatePicker allowTextInput
                                                                ariaLabel="Select a date."
                                                                value={row.CompletionDate ? new Date(row.CompletionDate) : undefined}

                                                                onSelectDate={(newValue) => updateCellData(row.Id, 'CompletionDate', (newValue))}
                                                                formatDate={onFormatDate}
                                                                strings={defaultDatePickerStrings} />
                                                        </td>
                                                        <td>
                                                            <TextField
                                                                name="EventNumber"
                                                                value={row.EventNumber}
                                                                onChange={(e: any) => updateCellData(row.Id, 'EventNumber', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <TextField
                                                                name="Hours"
                                                                value={row.Hours}
                                                                onChange={(e: any) => updateCellData(row.Id, 'Hours', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <TextField
                                                                name="Cost"
                                                                value={row.Cost}
                                                                onChange={(e: any) => updateCellData(row.Id, 'Cost', e.target.value)}
                                                            />
                                                        </td>
                                                        <td>
                                                            <TextField
                                                                name="StaffNumber"
                                                                value={row.StaffNumber}
                                                                onChange={(e: any) => updateCellData(row.Id, 'StaffNumber', e.target.value)}
                                                            />
                                                        </td>
                                                        {props?.componentProp?.IsUpdate == true &&
                                                            <td>
                                                                <Toggle
                                                                    checked={row.IsCompleted ?? false}
                                                                    onChange={(e, checked) => updateCellData(row.Id, 'IsCompleted', checked ?? false)}
                                                                    className="custom-toggle"
                                                                />
                                                            </td>}
                                                        <td>
                                                            <Toggle
                                                                checked={row.IsNotification ?? false}
                                                                onChange={(e, checked) => updateCellData(row.Id, 'IsNotification', checked ?? false)}
                                                                className="custom-toggle"
                                                            />
                                                        </td>
                                                        <td>
                                                            <TextField
                                                                name="Comment"
                                                                value={row.Comment || ""}
                                                                onChange={(e: any) => updateCellData(row.Id, 'Comment', e.target.value)}
                                                            />
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

            {isPopupVisible && (
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
                                <h2 className="mt-10">Add Periodic {ChoiceTitle.current} choice</h2>
                                <TextField className="formControl mt-20" label={ChoiceTitle.current} placeholder="Enter New Value"
                                    value={title}
                                    required
                                    onChange={onChangeTitle} />
                                <DialogFooter>
                                    <PrimaryButton
                                        text="Save"
                                        disabled={title.trim() === ""}
                                        onClick={onClick_SavePeriodic}
                                        className={`mrt15 css-b62m3t-container btn ${title.trim() === "" ? 'btn-sec' : 'btn-primary'}`}
                                    />
                                    <DefaultButton text="Close" className='secondMain btn btn-danger' onClick={onClickClose} />
                                </DialogFooter>
                            </div>
                        </FocusTrapZone>
                    </Popup>
                </Layer>
            )}

            {isAttachmentModalOpen && currentAttachmentRow && (
                <Layer>
                    <Popup
                        className={popupStyles.root}
                        role="dialog"
                        aria-modal="true"
                        onDismiss={() => setIsAttachmentModalOpen(false)}
                    >
                        <Overlay onClick={() => setIsAttachmentModalOpen(false)} />

                        <FocusTrapZone>
                            <div
                                role="document"
                                className={popupStyles.content}
                                style={{ padding: "20px", maxWidth: "650px", width: "650px" }}
                            >
                                {/* HEADER */}
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        marginBottom: 15
                                    }}
                                >
                                    <h2 style={{ margin: 0 }}>Manage Attachments</h2>

                                    <IconButton
                                        iconProps={{ iconName: "Cancel" }}
                                        ariaLabel="Close"
                                        onClick={() => setIsAttachmentModalOpen(false)}
                                    />
                                </div>

                                {/* Upload Button */}
                                <PrimaryButton
                                    text="Add Files"
                                    onClick={() => document.getElementById("hiddenFileUpload")?.click()}
                                    className="btn btn-primary"
                                    style={{ marginBottom: 20 }}
                                />

                                <input
                                    id="hiddenFileUpload"
                                    type="file"
                                    accept="image/*,application/pdf"
                                    multiple
                                    style={{ display: "none" }}
                                    onChange={onSelectNewFiles}
                                />

                                <div
                                    style={{
                                        border: "1px solid #ddd",
                                        borderRadius: 6,
                                        overflow: "hidden"
                                    }}
                                >
                                    {/* SCROLLABLE AREA */}
                                    <div
                                        style={{
                                            maxHeight:
                                                ((currentAttachmentRow.attachments?.length || 0) +
                                                    (currentAttachmentRow.newFiles?.length || 0)) > 6
                                                    ? "300px"
                                                    : "auto",
                                            overflowY:
                                                ((currentAttachmentRow.attachments?.length || 0) +
                                                    (currentAttachmentRow.newFiles?.length || 0)) > 6
                                                    ? "auto"
                                                    : "visible"
                                        }}
                                    >
                                        {/* TABLE HEADER */}
                                        <div
                                            style={{
                                                display: "grid",
                                                gridTemplateColumns: "80% 20%",
                                                background: "#f3f2f1",
                                                padding: "8px 12px",
                                                fontWeight: 600,
                                                position: "sticky",
                                                top: 0,
                                                zIndex: 10
                                            }}
                                        >
                                            <span>File Name</span>
                                            <span>Action</span>
                                        </div>

                                        {/* EXISTING FILES */}
                                        {currentAttachmentRow.attachments?.map((file: any, idx: number) => {
                                            // const fileURL = file.ServerRelativeUrl;
                                            const fileName = file.FileName;

                                            return (
                                                <div
                                                    key={`existing-${idx}`}
                                                    style={{
                                                        display: "grid",
                                                        gridTemplateColumns: "80% 20%",
                                                        padding: "8px 12px",
                                                        borderBottom: "1px solid #eee",
                                                        alignItems: "center"
                                                    }}
                                                >
                                                    {/* <a href={fileURL} target="_blank" rel="noreferrer">{fileName}</a> */}
                                                    <span>{fileName}</span>

                                                    <IconButton
                                                        iconProps={{ iconName: "Delete" }}
                                                        onClick={() => requestDeleteFile(fileName!)}
                                                        styles={{ icon: { color: "red" } }}
                                                    />
                                                </div>
                                            );
                                        })}

                                        {/* NEW FILES */}
                                        {currentAttachmentRow.newFiles?.map((file: File, idx: number) => (
                                            <div
                                                key={`new-${idx}`}
                                                style={{
                                                    display: "grid",
                                                    gridTemplateColumns: "80% 20%",
                                                    padding: "8px 12px",
                                                    borderBottom: "1px solid #eee",
                                                    alignItems: "center"
                                                }}
                                            >
                                                <span>{file.name}</span>

                                                <IconButton
                                                    iconProps={{ iconName: "Delete" }}
                                                    onClick={() => removeNewFile(idx)}
                                                    styles={{ icon: { color: "red" } }}
                                                />
                                            </div>
                                        ))}

                                        {(!currentAttachmentRow.attachments ||
                                            currentAttachmentRow.attachments.length === 0) &&
                                            (!currentAttachmentRow.newFiles ||
                                                currentAttachmentRow.newFiles.length === 0) && (
                                                <div style={{ padding: "12px", color: "#999", textAlign: "center" }}>
                                                    No files.
                                                </div>
                                            )}
                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div style={{ marginTop: 25, textAlign: "right" }}>
                                    <PrimaryButton
                                        text="Close"
                                        className="btn btn-danger"
                                        onClick={() => setIsAttachmentModalOpen(false)}
                                    />
                                </div>
                            </div>
                        </FocusTrapZone>
                    </Popup>
                </Layer>
            )}
            <CustomModal
                isModalOpenProps={confirmFileDelete}
                setModalpopUpFalse={cancelDeleteExistingFile}
                subject={"Delete Attachment"}
                message={`Are you sure you want to delete "${fileToDelete}"?`}
                yesButtonText="Yes"
                closeButtonText="No"
                onClickOfYes={confirmDeleteExistingFile}
            />
        </>
    );
};