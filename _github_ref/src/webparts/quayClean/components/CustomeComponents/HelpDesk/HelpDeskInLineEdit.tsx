/* eslint-disable */

import * as React from "react";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { IQuayCleanState } from "../../QuayClean";
import { HelpDeskInLineEditData } from "./HelpDeskInLineEditData";
import { Loader } from "../../CommonComponents/Loader";
import CustomModal from "../../CommonComponents/CustomModal";
import { Breadcrumb, PrimaryButton, ScrollablePane, ScrollbarVisibility, TextField, Toggle, TooltipHost } from "@fluentui/react";
import { _onItemSelected, removeElementOfBreadCrum } from "../../../../../Common/Util";
import { ComponentNameEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { IAddHelpDeskItem } from "../../../../../Interfaces/IAddNewHelpDesk";
import { ControlType } from "../../../../../Common/Constants/CommonConstants";
import { HDCommonFilter } from "../../../../../Common/Filter/HDCommonFilter";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import { DateConvention, DateTimePicker, TimeConvention, TimeDisplayControlType } from "@pnp/spfx-controls-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AddHDChoiceOption } from "../../../../../Common/Filter/AddHDChoiceOption";
import { useId } from "@fluentui/react-hooks";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";

export interface IHelpDeskInLineEditProps {

    isAddNewHelpDesk?: boolean;
    manageComponentView(componentProp: IQuayCleanState): any;
    siteMasterId?: number;
    breadCrumItems: IBreadCrum[];
    loginUserRoleDetails: any;
    originalSiteMasterId: any;
    componentProps: IQuayCleanState;
    isReload?: boolean;
    initialValue?: string;
    originalState?: string;
    isNotGeneral?: boolean;
    view?: any;
    isForm?: boolean;
    siteName?: any;
    isEditMultiple?: boolean;
    editItemId?: number[],

}

export const HelpDeskInLineEdit = (props: IHelpDeskInLineEditProps) => {
    const { state, CallTypeOptions, onClickValidationClose, onClickAdd, onChangeControl, onClickRemoveItem, onClickSaveUpdate, onChangeEventName, onCloseDeleteDialog, onClickYesDelete, onClickAddPopUp, onClickAddPopUpClose, onCloseClick } = HelpDeskInLineEditData(props)
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const tooltipId = useId('tooltip');
    const { provider, context } = appGlobalState;
    return <div>
        {state.isLoading && <Loader />}
        {state.isFormValidationModelOpen && <CustomModal
            isModalOpenProps={state.isFormValidationModelOpen} setModalpopUpFalse={onClickValidationClose} subject={"Missing data"}
            message={state.validationMessage} closeButtonText={"Close"} />}


        {state.isAddPopUP && <AddHDChoiceOption
            provider={provider}
            siteNameId={props.originalSiteMasterId}
            isPopupVisible={state.isAddPopUP}
            onClickClose={onClickAddPopUpClose}
            Title={state.addPopUpTitle}
        />
        }
        {state.isDeleteDialogOpen && <CustomModal isModalOpenProps={state.isDeleteDialogOpen}
            setModalpopUpFalse={onCloseDeleteDialog}
            subject={"Delete Item"}
            message={'Are you sure, you want to delete this record?'}
            yesButtonText="Yes"
            closeButtonText={"No"}
            onClickOfYes={onClickYesDelete} />}
        <div className="boxCard">
            <div className="formGroup">
                <h1 className="mainTitle">Help Desk form</h1>
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                            <div className="customebreadcrumb">
                                <Breadcrumb
                                    items={props.breadCrumItems}
                                    maxDisplayedItems={3}
                                    ariaLabel="Breadcrumb with items rendered as buttons"
                                    overflowAriaLabel="More links"
                                />
                            </div>
                        </div>
                        {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Event Name")) && <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4">
                            {/* {(props.isEditMultiple == undefined || props.isEditMultiple == false) && <TextField className=""
                                label="Event Name"
                                placeholder="Enter Event Name"
                                value={state?.EventName}
                                required
                                onChange={(event, value) => onChangeEventName(value ? value : "")}
                            />} */}
                            {(props.isEditMultiple == undefined || props.isEditMultiple == false) && (
                                <TextField
                                    className=""
                                    label="Enter Event Name"
                                    placeholder="Enter Event Name"
                                    value={state?.EventName}
                                    required
                                    onChange={(event, value) => onChangeEventName(value || "")}
                                />
                            )}


                        </div>}
                        {(props.isEditMultiple == undefined || props.isEditMultiple == false) && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dflex " style={{ justifyContent: "end", marginBottom: "10px" }}>
                            <PrimaryButton text="Add" className="btn btn-primary "
                                onClick={onClickAdd} />
                        </div>}

                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 inlineEdit " style={{ overflow: "auto" }}>
                            {!!state.item && state.item.length > 0 ?
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Action</th>
                                            {((!!props.isEditMultiple && props.isEditMultiple) && (!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Event Name"))) && <th style={{ minWidth: "160px" }}>Event Name</th>}
                                            {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Help Desk Description")) && <th style={{ minWidth: "320px" }}>Help Desk Description  </th>}
                                            {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Caller")) && <th style={{ minWidth: "160px" }}>Caller
                                                <span><TooltipHost content="Add New Value" id={tooltipId} >
                                                    <FontAwesomeIcon className="ml-5 " icon='plus' onClick={() => onClickAddPopUp("Caller")} />
                                                </TooltipHost>
                                                </span>
                                            </th>}
                                            {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Call Type")) && <th style={{ minWidth: "160px" }}>Call Type</th>}
                                            {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Starting Date")) && <th style={{ minWidth: "240px" }}>Starting Date</th>}
                                            {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Completion Date")) && <th style={{ minWidth: "240px" }}> Completion Date</th>}
                                            {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Location")) && <th style={{ minWidth: "175px" }}>Location
                                                <span><TooltipHost content="Add New Value" id={tooltipId} >
                                                    <FontAwesomeIcon className="ml-5 " icon='plus' onClick={() => onClickAddPopUp("Location")} />
                                                </TooltipHost>
                                                </span>
                                            </th>}
                                            {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Sub Location")) && <th style={{ minWidth: "180px" }}>Sub Location
                                                <span>
                                                    <TooltipHost content="Add New Value" id={tooltipId} >
                                                        <FontAwesomeIcon className="ml-5 " icon='plus' onClick={() => onClickAddPopUp("Sub Location")} />
                                                    </TooltipHost>
                                                </span>
                                            </th>}
                                            {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Area")) && <th style={{ minWidth: "160px" }}>Area <span>
                                                <TooltipHost content="Add New Value" id={tooltipId} >
                                                    <FontAwesomeIcon className="ml-5 " icon='plus' onClick={() => onClickAddPopUp("Area")} />
                                                </TooltipHost>
                                            </span>
                                            </th>}
                                            {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Category")) && <th style={{ minWidth: "240px" }}>Category
                                                <span><TooltipHost content="Add New Value" id={tooltipId} >
                                                    <FontAwesomeIcon className="ml-5 " icon='plus' onClick={() => onClickAddPopUp("Category")} />
                                                </TooltipHost>
                                                </span>
                                            </th>}
                                            {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Status")) && <th style={{ minWidth: "160px" }}>Status
                                                <span><TooltipHost content="Add New Value" id={tooltipId} >
                                                    <FontAwesomeIcon className="ml-5 " icon='plus' onClick={() => onClickAddPopUp("Status")} />
                                                </TooltipHost>
                                                </span>
                                            </th>}
                                            {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Help Desk Name")) && <th style={{ minWidth: "225px" }}>Help Desk Name
                                                <span><TooltipHost content="Add New Value" id={tooltipId} >
                                                    <FontAwesomeIcon className="ml-5 " icon='plus' onClick={() => onClickAddPopUp("HelpDesk")} />
                                                </TooltipHost>
                                                </span>
                                            </th>}
                                            {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Priority")) && <th style={{ minWidth: "160px" }}>Prority
                                                <span><TooltipHost content="Add New Value" id={tooltipId} >
                                                    <FontAwesomeIcon className="ml-5 " icon='plus' onClick={() => onClickAddPopUp("Priority")} />
                                                </TooltipHost>
                                                </span>
                                            </th>}
                                            {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Reported Help Desk")) && <th style={{ minWidth: "175px" }} className="">Reported Help Desk ?</th>}

                                        </tr>
                                    </thead>
                                    <tbody key={state.keyUpdate}>
                                        {state.item.length > 0 &&
                                            state.item.map((item: IAddHelpDeskItem, index) => {
                                                return <tr >
                                                    <td>
                                                        {state.item.length !== 1 ? <TooltipHost content={"Remove"}>
                                                            <FontAwesomeIcon
                                                                className='file-trash-icon'
                                                                onClick={() => onClickRemoveItem(item.indexNumber)}
                                                                icon={"trash-alt"}
                                                                style={{
                                                                    fontSize: "16px",
                                                                    color: "#dc3545"
                                                                }}
                                                            />
                                                        </TooltipHost>
                                                            :
                                                            <TooltipHost content={"Remove"}>
                                                                <FontAwesomeIcon
                                                                    className='file-trash-icon'
                                                                    icon={"trash-alt"}
                                                                    aria-disabled
                                                                    style={{
                                                                        fontSize: "16px",
                                                                        color: "#686868ff"
                                                                    }}
                                                                />
                                                            </TooltipHost>
                                                        }
                                                    </td>
                                                    {((!!props.isEditMultiple && props.isEditMultiple) && (!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Event Name"))) &&
                                                        <td >
                                                            <TextField
                                                                className={!!item.EventName ? "" : "reqinlineEdit"}
                                                                placeholder="Enter Event Name"
                                                                value={item?.EventName}
                                                                onChange={(event, value) => onChangeControl(value, item.indexNumber, "EventName", ControlType.string)}
                                                            />
                                                        </td>}
                                                    {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Help Desk Description")) && <td>
                                                        <TextField className={!!item.Title ? "" : "reqinlineEdit"}
                                                            placeholder="Enter HelpDesk Description"
                                                            value={item.Title || ""}
                                                            onChange={(event, value) => {
                                                                onChangeControl(value, item.indexNumber, "Title", ControlType.string);

                                                            }}
                                                        />
                                                    </td>}
                                                    {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Caller")) && <td>
                                                        <HDCommonFilter
                                                            className={!!item.Caller ? "" : "reqinlineEdit"}
                                                            onHDChange={(assetId: any) => onChangeControl(assetId, item.indexNumber, "Caller", ControlType.string)}
                                                            provider={provider}
                                                            defaultOption={item.Caller ? item.Caller as any : 0}
                                                            // defaultOption={newFromObj?.Caller}
                                                            siteNameId={props.componentProps.originalSiteMasterId}
                                                            Title="Caller"

                                                        />
                                                    </td>}
                                                    {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Call Type")) && <td>
                                                        <ReactDropdown
                                                            isMultiSelect={false}
                                                            options={CallTypeOptions}
                                                            placeholder={'Call Type'}
                                                            defaultOption={item.CallType ? item.CallType as any : ''}
                                                            onChange={(event, value) => {
                                                                onChangeControl(event?.value, item.indexNumber, "CallType", ControlType.string);
                                                            }}
                                                            className={!!item.CallType ? "" : "reqinlineEdit"}
                                                        // isClearable={true}
                                                        />
                                                    </td>}
                                                    {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Starting Date")) && <td className={!!item.StartingDateTime ? "" : "reqinlineEdit"}>
                                                        <DateTimePicker
                                                            formatDate={(date: Date) => { return date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'numeric', day: '2-digit' }).replace(/-/g, '/'); }}
                                                            dateConvention={DateConvention.DateTime}
                                                            timeConvention={TimeConvention.Hours12}
                                                            timeDisplayControlType={TimeDisplayControlType.Dropdown}
                                                            // value={item?.StartingDateTime}
                                                            value={item?.StartingDateTime}
                                                            onChange={(date?: Date) => onChangeControl(date, item.indexNumber, "StartingDateTime", ControlType.Date)} maxDate={(item.CompletionDateTime) || undefined}
                                                        />
                                                    </td>}
                                                    {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Completion Date")) && <td>
                                                        <DateTimePicker
                                                            formatDate={(date: Date) =>
                                                                date.toLocaleDateString('nl-NL', { year: 'numeric', month: 'numeric', day: '2-digit' }).replace(/-/g, '/')
                                                            }
                                                            dateConvention={DateConvention.DateTime}
                                                            timeConvention={TimeConvention.Hours12}
                                                            timeDisplayControlType={TimeDisplayControlType.Dropdown}
                                                            value={item?.CompletionDateTime ? new Date(item.CompletionDateTime) : undefined}
                                                            onChange={(date?: Date) => onChangeControl(date, item.indexNumber, "CompletionDateTime", ControlType.Date)}
                                                            minDate={item?.StartingDateTime ? new Date(item.StartingDateTime) : undefined}
                                                            maxDate={new Date()}
                                                        />

                                                    </td>}
                                                    {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Location")) && <td>
                                                        <HDCommonFilter
                                                            className={!!item.Location ? "" : "reqinlineEdit"}
                                                            onHDChange={(assetId: any) => onChangeControl(assetId, item.indexNumber, "Location", ControlType.string)}
                                                            provider={provider}
                                                            defaultOption={item.Location ? item.Location as any : 0}

                                                            siteNameId={props.componentProps.originalSiteMasterId}
                                                            Title="Location"
                                                            isHideAddNew={false}
                                                            placeHolder="Select"
                                                        />
                                                    </td>}
                                                    {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Sub Location")) && <td>
                                                        <HDCommonFilter

                                                            onHDChange={(assetId: any) => onChangeControl(assetId, item.indexNumber, "SubLocation", ControlType.string)}
                                                            provider={provider}
                                                            defaultOption={item.SubLocation ? item.SubLocation as any : 0}
                                                            siteNameId={props.componentProps.originalSiteMasterId}
                                                            Title="Sub Location"
                                                            placeHolder="Select"
                                                            isHideAddNew={false}
                                                        />
                                                    </td>}
                                                    {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Area")) && <td>
                                                        <HDCommonFilter
                                                            className={!!item.Area ? "" : "reqinlineEdit"}
                                                            onHDChange={(assetId: any) => onChangeControl(assetId, item.indexNumber, "Area", ControlType.string)}
                                                            provider={provider}
                                                            defaultOption={item.Area ? item.Area as any : 0}
                                                            siteNameId={props.componentProps.originalSiteMasterId}
                                                            Title="Area"
                                                            placeHolder="Select"
                                                            isHideAddNew={false}
                                                        />
                                                    </td>}
                                                    {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Category")) && <td>
                                                        <HDCommonFilter
                                                            className={!!item.HDCategory ? "" : "reqinlineEdit"}
                                                            onHDChange={(assetId: any) => onChangeControl(assetId, item.indexNumber, "HDCategory", ControlType.string)}
                                                            provider={provider}
                                                            defaultOption={item.HDCategory ? item.HDCategory as any : 0}

                                                            siteNameId={props.componentProps.originalSiteMasterId}
                                                            Title="Category"
                                                            isHideAddNew={false}
                                                            placeHolder="Select"
                                                        />
                                                    </td>}
                                                    {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Status")) && <td>
                                                        <HDCommonFilter
                                                            className={!!item.HDStatus ? "" : "reqinlineEdit"}
                                                            onHDChange={(assetId: any) => onChangeControl(assetId, item.indexNumber, "HDStatus", ControlType.string)}
                                                            provider={provider}
                                                            defaultOption={item.HDStatus ? item.HDStatus as any : 0}

                                                            siteNameId={props.componentProps.originalSiteMasterId}
                                                            Title="Status"
                                                            placeHolder="Select"
                                                            isHideAddNew={false}
                                                        />
                                                    </td>}
                                                    {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Help Desk Name")) && <td>
                                                        <HDCommonFilter
                                                            className={!!item.HelpDeskName ? "" : "reqinlineEdit"}
                                                            onHDChange={(assetId: any) => onChangeControl(assetId, item.indexNumber, "HelpDeskName", ControlType.string)}
                                                            provider={provider}

                                                            defaultOption={item.HelpDeskName ? item.HelpDeskName as any : ""}
                                                            siteNameId={props.componentProps.originalSiteMasterId}
                                                            Title="HelpDesk"
                                                            placeHolder="Select"
                                                            isHideAddNew={false}
                                                        />
                                                    </td>}
                                                    {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Priority")) && <td>
                                                        <HDCommonFilter
                                                            onHDChange={(assetId: any) => onChangeControl(assetId, item.indexNumber, "QCPriority", ControlType.string)}
                                                            provider={provider}
                                                            defaultOption={item.QCPriority ? item.QCPriority as any : 0}
                                                            className={!!item.QCPriority ? "" : "reqinlineEdit"}
                                                            siteNameId={props.componentProps.originalSiteMasterId}
                                                            Title="Priority"
                                                            placeHolder="Select"
                                                            isHideAddNew={false}
                                                        />
                                                    </td>}
                                                    {(!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Reported Help Desk")) && <td>
                                                        <Toggle
                                                            className="formControl formtoggle"
                                                            checked={item.ReportHelpDesk}
                                                            onChange={(event, value) => {
                                                                onChangeControl(value, item.indexNumber, "ReportHelpDesk", ControlType.Toggle);
                                                            }}
                                                        />
                                                    </td>}


                                                </tr>


                                            })

                                        }

                                    </tbody>
                                </table>
                                : <NoRecordFound />}

                        </div>

                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <PrimaryButton
                                style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                className="btn btn-primary"
                                onClick={onClickSaveUpdate}
                                text={props.isEditMultiple ? "Update" : 'Save'}
                            // onClick={onClickSaveOrUpdate}
                            />
                            <PrimaryButton
                                style={{ marginBottom: "5px", marginTop: "10px" }}
                                className="btn btn-danger"
                                text="Cancel"
                                onClick={onCloseClick}
                            />

                        </div>
                    </div>
                </div>
            </div>
        </div >

    </div >
}
