import React from "react"
import { ResourceRecoveryData } from "./ResourceRecoveryData"
import { Loader } from "../../CommonComponents/Loader"
import { AddDocumentCardView } from "../ChemicalManagement/AddDocumentCardView";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { IQuayCleanState } from "../../QuayClean";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DefaultButton, DialogFooter, FocusTrapZone, Layer, Link, Overlay, Popup, PrimaryButton, SelectionMode, TextField, TooltipHost, ProgressIndicator } from "@fluentui/react";
import { useId } from "@fluentui/react-hooks";
import CustomModal from "../../CommonComponents/CustomModal";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import DragandDropFilePicker from "../../CommonComponents/dragandDrop/DragandDropFilePicker";
import CustomBreadcrumb from "../../CommonComponents/breadcrumb/CustomBreadcrumb";

export interface IResourceRecoveryProps {
    siteNameId: any;
    view?: any;
    manageComponentView(componentProp: IQuayCleanState): any;
    siteName: string;
    loginUserRoleDetails: ILoginUserRoleDetails;
    qCStateId: any;
    qCState: any;

}


export const ResourceRecovery = (props: IResourceRecoveryProps) => {

    const tooltipId = useId('tooltip');
    const { state, onClickPopupCreateFolder,
        _onItemInvoked
        , onClickAddDocument,
        _onItemSelected,
        onclickRefreshGrid,
        addDocumentColumn,
        onClickConfirmDelete,
        onClickDeleteYes,
        onClickPopupCreateFolderClose,
        onChangeFolderName,
        popupStyles,
        onClickCreateFolderSave,
        popupStyles2,
        uploadedFileCount,
        setFilesToState,
        onClickUpload,
        onCloseRenameModel,
        onChangeRename,
        onClickRename,
        setSourcePath,
        context

    } = ResourceRecoveryData(props)
    return <div>
        {state.isLoading && <Loader />}
        {(
            <CustomModal isModalOpenProps={state.isDeleteDialogShow} setModalpopUpFalse={() => onClickConfirmDelete()}
                subject={"Delete  Confirmation "}
                message={<div>Are you sure, you want to delete?</div>}
                yesButtonText="Yes" closeButtonText={"No"}
                onClickOfYes={onClickDeleteYes} />
        )}
        {state.isAddFileModelShow && (
            <Layer>
                <Popup
                    className={popupStyles2.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={onClickAddDocument}
                >
                    <Overlay onClick={onClickAddDocument} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles2.content}>
                            <h2 className="mt-20">Upload Files</h2>
                            <React.Fragment>
                                <div className="mt15">
                                    <DragandDropFilePicker isMultiple={true} setFilesToState={setFilesToState} />
                                </div>

                                {state.isUploadingFile && <div className="progress-fileUpload">
                                    <div className="progress-Content">
                                        <ProgressIndicator label="Uploading Files..."
                                            description={`Successfully uploaded ${uploadedFileCount} file(s) out of ${state.uploadFiles?.length}`}
                                            ariaValueText="Uploading Files..."
                                            barHeight={10}
                                            percentComplete={state.percentComplete}
                                        />
                                    </div>
                                </div>
                                }
                            </React.Fragment >
                            <DialogFooter>
                                {/* <PrimaryButton text="Upload" onClick={onClickUpload} className='mrt15 css-b62m3t-container btn btn-primary'
                                        /> */}
                                <PrimaryButton
                                    text="Upload"
                                    onClick={onClickUpload}
                                    className={`mrt15 css-b62m3t-container btn ${!state.uploadFiles || state.uploadFiles.length === 0 ? 'btn-sec' : 'btn-primary'}`}
                                    disabled={!state.uploadFiles || state.uploadFiles.length === 0}
                                />
                                <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickAddDocument} />
                            </DialogFooter>
                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}

        {state.isRenameModelShow && (
            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={onCloseRenameModel}
                >
                    <Overlay onClick={onCloseRenameModel} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Rename </h2>
                            <TextField className="formControl mt-20" label="Rename " placeholder="Enter New Name"
                                value={state.rename}
                                onChange={onChangeRename} />
                            {!state.rename &&
                                <div className="requiredlink">Enter New Name</div>}

                            <DialogFooter>
                                {/* {isUpdateURL &&
                                            <PrimaryButton text="Update" onClick={onClickLinkUpdate} className='mrt15 css-b62m3t-container btn btn-primary'
                                            />}
                                        {!isUpdateURL && <>
                                            {(displayerrorTitle || displayerror) ?
                                                <PrimaryButton text="Save" onClick={onClickLinkSave} disabled={true} className='mrt15 css-b62m3t-container btn btn-secondary'
                                                /> :
                                                <PrimaryButton text="Save" onClick={onClickLinkSave} className='mrt15 css-b62m3t-container btn btn-primary'
                                                />}</>} */}
                                <PrimaryButton text="Rename" onClick={onClickRename} className='mrt15 css-b62m3t-container btn btn-primary'
                                />
                                <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onCloseRenameModel} />
                            </DialogFooter>

                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}

        {state.isCreateFolderModelShow && (
            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={onClickPopupCreateFolderClose}
                >
                    <Overlay onClick={onClickPopupCreateFolderClose} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Create Folder</h2>
                            <TextField className="formControl mt-20" label="Folder Name" placeholder="Enter new folder name"
                                value={state.newFolderName}
                                required
                                errorMessage={state.isFolderAllReadyPresent ? "Folder Name all ready present" : ""}
                                onChange={onChangeFolderName} />

                            <DialogFooter>
                                <PrimaryButton
                                    text="Create"
                                    disabled={(state?.newFolderName.trim() === "" || state.isFolderAllReadyPresent)}
                                    onClick={() => onClickCreateFolderSave()}
                                    className={`mrt15 css-b62m3t-container btn ${(state?.newFolderName.trim() === "" || state.isFolderAllReadyPresent) ? 'btn-sec' : 'btn-primary'}`}
                                />
                                <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickPopupCreateFolderClose} />
                            </DialogFooter>

                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}
        <div className={!!props.siteNameId ? "" : "boxCard"}>
            <div className='ms-Grid-row p-14 pmt-15'>
                <div className='ms-md12 ms-sm12 ms-Grid-col'>
                    <div className='card dashboard-card p00'>
                        <div className='card-header'>
                            <div className='p-15 height211 lightgrey2'>
                                <div className="" id="SCpivot">
                                    <React.Suspense fallback={<></>}>
                                        {props.siteName ?
                                            <CustomBreadcrumb
                                                siteServerRelativeURL={`${context.pageContext.web.serverRelativeUrl}`}
                                                parentBreadCrumbItem={{
                                                    key: `${context.pageContext.web.serverRelativeUrl}/${"ResourceRecovery"}/${props.siteName}`,
                                                    text: `${props.siteName}`
                                                }}
                                                setSourcePath={setSourcePath} // set a new path when click on breadcrumb item.
                                                newBreadcrumbItem={state.newBreadcrumbItem || undefined} // add a new item in breadcrumb when folder is clicked
                                            /> :
                                            <CustomBreadcrumb
                                                siteServerRelativeURL={`${context.pageContext.web.serverRelativeUrl}`}
                                                parentBreadCrumbItem={{
                                                    key: `${context.pageContext.web.serverRelativeUrl}/${"ResourceRecovery"}`,
                                                    text: `${"Resource Recovery"}`
                                                }}
                                                setSourcePath={setSourcePath} // set a new path when click on breadcrumb item.
                                                newBreadcrumbItem={state.newBreadcrumbItem || undefined} // add a new item in breadcrumb when folder is clicked
                                            />
                                        }
                                    </React.Suspense>
                                    <div className='p-15 msgridpad'>
                                        <div className="">
                                            <div className='card-box-new mb30 '>
                                                <div className="ms-Grid-row justify-content-start">
                                                    <div className="ms-Grid-row justify-content-start">
                                                        {state.currentView === "grid" ? <>
                                                            <MemoizedDetailList
                                                                manageComponentView={props.manageComponentView}
                                                                columns={addDocumentColumn() as any}
                                                                // items={state.items.length > 0 || state.notFound ? state.items : state.allItems}

                                                                items={state.items || []}
                                                                reRenderComponent={true}
                                                                searchable={true}
                                                                isAddNew={true}
                                                                CustomselectionMode={props.siteNameId ? SelectionMode.multiple : SelectionMode.none}
                                                                onItemInvoked={_onItemInvoked}
                                                                onSelectedItem={_onItemSelected}
                                                                addEDButton={(state.isDisplayEditButton) && <>
                                                                    <Link className="actionBtn btnDanger iconSize  ml-10" onClick={onClickConfirmDelete}>
                                                                        <TooltipHost content={"Delete"} id={tooltipId}>
                                                                            <FontAwesomeIcon icon="trash-alt" />
                                                                        </TooltipHost>
                                                                    </Link>
                                                                </>}
                                                                addNewContent={<div className="dflex pb-1 mb-sm-3">
                                                                    <Link className="actionBtn iconSize btnRefresh add-doc-icon-m" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                                                        text="">
                                                                        <TooltipHost
                                                                            content={"Refresh Grid"}
                                                                            id={tooltipId}
                                                                        >
                                                                            <FontAwesomeIcon
                                                                                icon={"arrows-rotate"}
                                                                            />
                                                                        </TooltipHost> </Link>

                                                                    <>
                                                                        {props.siteNameId &&
                                                                            <div>
                                                                                <TooltipHost
                                                                                    content={"Create New Folder"}
                                                                                    id={tooltipId}
                                                                                >
                                                                                    <PrimaryButton text="Create Folder" onClick={onClickPopupCreateFolder} className="btn btn-primary ml5" />
                                                                                </TooltipHost>
                                                                                <TooltipHost
                                                                                    content={"Add Document"}
                                                                                    id={tooltipId}
                                                                                >
                                                                                    <PrimaryButton text="Add" onClick={onClickAddDocument} className="btn btn-primary ml5" />
                                                                                </TooltipHost>
                                                                            </div>}
                                                                    </>
                                                                </div>
                                                                }
                                                            />
                                                        </> :
                                                            <>
                                                                <AddDocumentCardView
                                                                    items={[]}
                                                                // items={filtercalmData2.length > 0 || notFoundFF2 ? filtercalmData2 : calmData2}
                                                                />
                                                            </>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

        </div>

    </div>

}