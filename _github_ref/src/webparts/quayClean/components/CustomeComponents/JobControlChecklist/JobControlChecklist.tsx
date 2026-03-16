/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IQuayCleanState } from "../../QuayClean";
import { Loader } from "../../CommonComponents/Loader";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { ComponentNameEnum, ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { DialogType, Link, PrimaryButton, TooltipHost } from "office-ui-fabric-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBoolean, useId } from "@fluentui/react-hooks";
import CustomModal from "../../CommonComponents/CustomModal";
import { toastService } from "../../../../../Common/ToastService";
import { delay, generateExcelTable, getErrorMessageValue, logGenerator, onBreadcrumbItemClicked } from "../../../../../Common/Util";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import DraggableJobContChecklist from "../../CommonComponents/DragDrop/DraggableJobContChecklist";
import { IExportColumns } from "../EquipmentChecklist/Question";
import DragAndDrop from "../../CommonComponents/FileUpload/DragandDrop";
import { ValidateForm } from "../../../../../Common/Validation";
import * as XLSX from 'xlsx';
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import { JobControlChecklistFilter } from "../../../../../Common/Filter/JobControlChecklistFrequency";

export interface IAssociateChemicalProps {
    provider: IDataProvider;
    context: WebPartContext;
    breadCrumItems: IBreadCrum[];
    manageComponentView(componentProp: IQuayCleanState): any;
    loginUserRoleDetails: ILoginUserRoleDetails;
    siteMasterId?: number;
}

export const JobControlChecklist = (props: IAssociateChemicalProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [Data, setData] = React.useState<any[]>([]);
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [Drag, setDrag] = React.useState<boolean>(false);
    const [flag, setFlag] = React.useState(false);
    const [downloadDisable, setdownloadDisable] = React.useState<boolean>(true);
    const [AddExcel, setAddExcel] = React.useState<boolean>(false);
    const [excelData, setexcelData] = React.useState<any[]>([]);
    const [uploadData, setuploadData] = React.useState<any[]>([]);
    const [isreload, setisreload] = React.useState<boolean>(false);
    const [notFoundDialog, setnotFoundDialog] = React.useState<boolean>(false);
    const [JobControlChecklist, setJobControlChecklist] = React.useState<any>("");

    const onJobControlChecklistChange = (ValueId: string): void => {
        setJobControlChecklist(ValueId);
        // setNewFromObj((prevState: any) => ({ ...prevState, Frequency: ValueId }));
    };
    const handleFlagUpdate = () => {
        setFlag(!flag); // Toggle flag value
    };

    const [state, setState] = React.useState<any>({
        isShowAssetHistoryModel: false,
        isShowMovingHistoryModel: false,
        isShowMovingModel: false,
        isShowAcquireModel: false,
        isShowDueDateModel: false,
        siteNameId: 0,
        assetMasterId: 0,
        isReload: false,
        isQRCodeModelOpen: false,
        qrCodeUrl: "",
        isUploadModelOpen: false,
        movingHistory: "",
        mdlConfigurationFile: "",
        qrDetails: "",
        isUploadFileValidationModelOpen: false,
        dialogContentProps: {
            type: DialogType.normal,
            title: 'In Correct Formate',
            closeButtonAriaLabel: 'Close',
            subText: "",
        },
        uploadFileErrorMessage: "",
        isUploadColumnValidationModelOpen: false,
        isAssociatModel: false,
        AssetTypeMasterId: 0,
        ATMManufacturer: "",
        AssetTypeMaster: ""
    });


    const _Data = () => {
        setIsLoading(true);
        try {
            let Filter = "";
            if (JobControlChecklist != "") {
                Filter = `Frequency eq '${JobControlChecklist}' and IsDeleted ne 1`;
            } else {
                Filter = `IsDeleted ne 1`;
            }
            const select = ["ID,Title,Frequency,Index"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.JobControlChecklist,
                filter: Filter
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                id: data.ID,
                                Title: !!data.Title ? data.Title : '',
                                Question: !!data.Title ? data.Title : '',
                                Frequency: !!data.Frequency ? data.Frequency : '',
                                Index: !!data.Index ? data.Index : null,
                            }
                        );
                    });
                    const sorted = UsersListData.map((item: any) => ({
                        ...item,
                        Index: item?.Index === "" ? Infinity : Number(item?.Index)
                    })).sort((a, b) => a.Index - b.Index);
                    setData(sorted);
                    setDrag(true);
                    setIsLoading(false);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
                const errorObj = { ErrorMethodName: "_Data", CustomErrormessage: "error in get data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
                const errorMessage = getErrorMessageValue(error.message);
                setError(errorMessage);
                sethasError(true);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "_Data", CustomErrormessage: "error in get data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            // const _error = getErrorMessage(ex);
            const errorMessage = getErrorMessageValue(ex.message);
            setError(errorMessage);
            sethasError(true);
        }
    };

    const onclickEdit = () => {
        try {
            setisDisplayEDbtn(false);
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({ text: UpdateItem.FirstName, key: UpdateItem.FirstName, currentCompomnetName: ComponentNameEnum.AddJobControlChecklist, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.JobControlChecklist, siteMasterId: UpdateItem.Id, isShowDetailOnly: false, breadCrumItems: breadCrumItems } });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AddJobControlChecklist, siteMasterId: UpdateItem.ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId
            });
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickEdit", CustomErrormessage: "error in on click edit", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            // void logGenerator(props.provider, errorObj);
        }
    };

    const _onItemSelected = (item: any): void => {

        if (item.length > 0) {
            if (item.length == 1) {
                setIsDisplayEditButtonview(true);
                setUpdateItem(item[0]);
            } else {
                setIsDisplayEditButtonview(false);
                setUpdateItem(item);
            }
            setisDisplayEDbtn(true);
        } else {
            setUpdateItem(null);
            setisDisplayEDbtn(false);
        }
    };

    const onclickconfirmdelete = () => {
        // setDeleteRecordId(UpdateItem.Id);
        toggleHideDialog();
    };

    const _confirmDeleteItem = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        try {
            if (!!UpdateItem) {
                const processUpdateItem = (input: any) => {
                    if (Array.isArray(input)) {
                        return input.map(item => ({
                            Id: item.ID,
                            IsDeleted: true
                        }));
                    } else if (typeof input === 'object' && input !== null) {
                        return [{ Id: input.ID, IsDeleted: true }];
                    } else {
                        return [];
                    }
                };
                const newObjects = processUpdateItem(UpdateItem);
                if (newObjects.length > 0) {
                    await props.provider.updateListItemsInBatchPnP(ListNames.JobControlChecklist, newObjects)
                }

                if (Array.isArray(UpdateItem)) {
                    for (let index = 0; index < UpdateItem.length; index++) {
                        // await props.provider.deleteItem(ListNames.JobControlChecklist, UpdateItem[index].ID);
                        await props.provider.RemoveUserFromGroup("Quayclean Clients", UpdateItem[index].ClientId).then((response) => {
                        }).catch((error) => {
                            console.log(error);
                        });
                        if (index === UpdateItem.length - 1) {
                            _Data();
                        }
                    }
                    setUpdateItem(null);
                } else {
                    // await props.provider.deleteItem(ListNames.JobControlChecklist, UpdateItem.ID);
                    await props.provider.RemoveUserFromGroup("Quayclean Clients", UpdateItem.ClientId).then((response) => {
                    }).catch((error) => {
                        console.log(error);
                    });
                    setUpdateItem(null);
                    _Data();
                }
                toastService.updateLoadingWithSuccess(toastId, "Record deleted successfully!");
                toggleHideDialog();
                setisDisplayEDbtn(false);
                setUpdateItem(null);
            }
            setIsLoading(false);
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  _confirmDeleteItem",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_confirmDeleteItem HelpDeskList"
            };
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };

    const _closeDeleteConfirmation = () => {
        toggleHideDialog();
    };
    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };

    const onclickExportToExcel = async () => {
        try {
            let exportColumns: IExportColumns[] = [
                {
                    header: "Question",
                    key: "Question"
                },
                {
                    header: "Frequency",
                    key: "Frequency"
                },

            ];
            generateExcelTable(Data, exportColumns, `Job-Control_Checklist_Sample_Data.xlsx`);
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickExportToExcel", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const onclickUpload = () => {
        setAddExcel(true);
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: true }));
    };
    const onClickCloseModel = () => {
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false }));
        setAddExcel(false);
    };

    const handleSelectedRecordsChange = (records: any[]) => {
        // setSelectedRecords(records);
        if (records.length > 0) {
            if (records.length == 1) {
                setIsDisplayEditButtonview(true);
                setUpdateItem(records[0]);

            } else {
                setIsDisplayEditButtonview(false);
                setUpdateItem(records);

            }
            setisDisplayEDbtn(true);
        } else {
            setUpdateItem(null);
            // setDeleteId(0);
            setisDisplayEDbtn(false);
        }
    };

    const onclickDownload = async () => {
        try {
            let url = props.context.pageContext.web.absoluteUrl + '/Shared%20Documents/MasterFiles/JobControlChecklist.xlsx';
            let fileName = "JobControlChecklist";
            let downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickDownload", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };
    const setFilesToState = (files: any[]) => {
        try {
            const selectedFiles: any[] = [];
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];
                    const selectedFile: any = {
                        file: file,
                        name: file.name,
                        key: i
                    };
                    selectedFiles.push(selectedFile);
                }
                setState((prevState: any) => ({ ...prevState, mdlConfigurationFile: selectedFiles }));
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "MDLConfiguration setFilesToState", CustomErrormessage: "setFilesToState", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const uploadFileValidation = (e: any) => {
        const validationFields: any = {
            "excel": ["name"],
        };
        let file: any;
        if (e.type == 'change') {
            file = e.target.files[0];
        } else {
            file = e.dataTransfer?.files[0];
        }
        let isValid = ValidateForm(file, validationFields);
        return isValid.isValid;
    };

    const handleFileUpload = (event: any) => {
        try {
            let errorobj: any[] = [];
            const file: any = event;
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                let dataJSONHeaderChek: any[] = XLSX.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0];
                const expectedColumnNames = ['Question', 'Frequency'];
                let isColumnsValid = true;

                for (let index = 0; index < expectedColumnNames.length; index++) {
                    isColumnsValid = dataJSONHeaderChek.indexOf(expectedColumnNames[index]) >= 0;
                    if (!isColumnsValid) {
                        errorobj.push(expectedColumnNames[index]);
                    }
                }
                //  let dataJSONHeaderChek: any[] = XLSX.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0];
                const excelData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
                if (errorobj.length == 0) {
                    let finalExcelData = excelData.map((item: any) => {
                        return {
                            Title: item.Question,
                            Frequency: item.Frequency,
                        };
                    });
                    setexcelData(finalExcelData);
                } else {
                    let message = <div><b > Following fields are missing from the excel </b><ul>{errorobj.map(((r: any, index: any) => {
                        if (index === 0) {
                            return <> <li className="errorPoint">  {r} </li> </>;
                        } else {
                            return <li className="errorPoint">  {r} </li>;
                        }

                    }))}</ul></div>;
                    setIsLoading(false);
                    setState((prevState: any) => ({ ...prevState, uploadFileErrorMessage: message, isUploadColumnValidationModelOpen: true }));
                }
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            const errorObj = { ErrorMethodName: "handleFileUpload", CustomErrormessage: "error in on handle file upload", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const handleChange = async (e: any): Promise<void> => {
        let isVaild = uploadFileValidation(e);
        try {
            if (isVaild) {
                e.preventDefault();
                e.stopPropagation();
                if (e.type == 'change') {
                    if (e.target.files && e.target.files[0]) {
                        const selectedFiles: any[] = e.target.files;
                        setFilesToState(selectedFiles);
                        handleFileUpload(selectedFiles[0]);
                    }
                } else {
                    if (e.dataTransfer?.files && e.dataTransfer?.files[0]) {
                        const selectedFiles: any[] = e.dataTransfer?.files;
                        setFilesToState(selectedFiles);
                        handleFileUpload(selectedFiles[0]);
                    }
                }
            } else {
                setState((prevState: any) => ({ ...prevState, isUploadFileValidationModelOpen: true }));
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "handleChange", CustomErrormessage: "handleChange", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const removeFile = async (id: number | string) => {
        try {
            const newFiles = state.mdlConfigurationFile.filter((file: IFileWithBlob) => file.key != id);
            setState((prevState: any) => ({ ...prevState, mdlConfigurationFile: newFiles }));
        } catch (error) {
            const errorObj = { ErrorMethodName: "removeFile", CustomErrormessage: "removeFile", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const handleDrop = async (e: any) => {
        let isVaild = uploadFileValidation(e);

        try {
            if (isVaild) {
                e.preventDefault();
                e.stopPropagation();

                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const selectedFiles: any[] = e.dataTransfer.files;
                    setFilesToState(selectedFiles);
                    handleFileUpload(selectedFiles[0]);
                }
            } else {
                setState((prevState: any) => ({ ...prevState, isUploadFileValidationModelOpen: true }));
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "MDLConfiguration handleDrop", CustomErrormessage: "handleDrop", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const onCancel = async () => {
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
    };
    const onSaveFiles = () => {
        setIsLoading(true);
        try {
            if (uploadData && uploadData.length > 0) {
                const toastMessage = 'Record Insert successfully!';
                const toastId = toastService.loading('Loading...');
                props.provider.createItemInBatch(uploadData, ListNames.JobControlChecklist).then(async (results: any) => {
                    setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
                    let record = results.map((item: { data: any; }) => item.data);
                    _Data();
                    let recordId = record.map((i: { ID: any; }) => i.ID);
                    if (false) delay(500);
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    setisreload(!isreload ? true : false);

                    setIsLoading(false);
                }).catch(err => console.log(err));
            } else {
                setIsLoading(false);
                setnotFoundDialog(true);
                setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "onSaveFiles", CustomErrormessage: "error in save file data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (!!excelData) {
            if (excelData.length > 0) {
                const data: any = JSON.stringify(excelData, null, 2);
                const jsondata: any = JSON.parse(data);
                const formatData = jsondata;
                if (!!formatData) {
                    setuploadData(formatData);
                }
            }
        }
    }, [excelData]);

    const DranAndDrop = <>
        <DragAndDrop
            provider={props.provider}
            files={state.mdlConfigurationFile}
            handleChange={(e: any) => handleChange(e)}
            removeFile={removeFile}
            handleDrop={(e: any) => handleDrop(e)}
            onCancel={onCancel}
            onSaveFiles={onSaveFiles}
            isMultiple={false}
        />
    </>;


    React.useEffect(() => {
        _Data();
        props.provider.getDocumentByURL().then((results: any[]) => {
            if (!!results) {
                let fileNameArray = results.map(item => item.FileLeafRef == "JobControlChecklist.xlsx");
                for (let i = 0; i < fileNameArray.length; i++) {
                    if (fileNameArray[i] == true) {
                        setdownloadDisable(false);
                    }
                }
            }
        }).catch((error) => {
            console.log(error);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "useEffect", CustomErrormessage: "error in useEffect", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        });
    }, [isRefreshGrid, JobControlChecklist]);

    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {
                state.isUploadModelOpen &&
                <CustomModal dialogWidth="900px" isModalOpenProps={state.isUploadModelOpen} setModalpopUpFalse={onClickCloseModel} subject={"Upload"} message={DranAndDrop}
                    closeButtonText={""} />
            }
            {isLoading && <Loader />}
            <CustomModal isModalOpenProps={hideDialog}
                setModalpopUpFalse={_closeDeleteConfirmation}
                subject={"Delete Item"}
                message={'Are you sure, you want to delete this record?'}
                yesButtonText="Yes"
                closeButtonText={"No"}
                onClickOfYes={_confirmDeleteItem} />
            <div className="boxCard">
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                        <h1 className="mainTitle">Monthly KPI's</h1>
                    </div>
                </div>
                <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg3 ms-xl3 mt-3 jcc-ml-11">
                        <div className="formControl">
                            <JobControlChecklistFilter
                                selectedJobControlChecklist={JobControlChecklist}
                                defaultOption={!!JobControlChecklist ? JobControlChecklist : ""}
                                onJobControlChecklistChange={onJobControlChecklistChange}
                                provider={props.provider}
                                AllOption={true}
                                isRequired={true} />
                        </div>
                    </div>
                </div>


                <div className="formGroup">

                    <div className={window.innerWidth > 768 ? 'dflex mr-10 justify-content-end mb-3' : 'mr-10 justify-content-end mb-3'}>
                        { }

                        {Data.length > 0 && window.innerWidth > 768 &&
                            <div className="showPageCount">Showing 1 to {Data?.length} of {Data?.length} records</div>}
                        {isDisplayEDbtn &&
                            <div className='dflex justify-content-end'>
                                {isDisplayEditButtonview && <Link className="actionBtn iconSize btnEdit" onClick={onclickEdit}>
                                    <TooltipHost content={"Edit Detail"} id={tooltipId}>
                                        <FontAwesomeIcon icon="edit" />
                                    </TooltipHost>
                                </Link>}
                                <Link className="actionBtn iconSize btnDanger ml-10 mr-6px" onClick={onclickconfirmdelete}>
                                    <TooltipHost content={"Delete"} id={tooltipId}>
                                        <FontAwesomeIcon icon="trash-alt" />
                                    </TooltipHost>
                                </Link>
                            </div>}
                        {Data.length > 0 && window.innerWidth <= 768 &&
                            <div className="showPageCounts">Showings 1 to {Data?.length} of {Data?.length} records</div>}
                        <div className="dflex mb-sm-3 mobile-icon-space">
                            {(!!Data && Data.length > 0) &&
                                <Link className="actionBtn clsexport iconSize btnEdit ml-10 " style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                    text="">
                                    <TooltipHost
                                        content={"Export to excel"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon
                                            icon={"file-excel"}
                                        />
                                    </TooltipHost></Link>}
                            {/* {downloadDisable ?
                                <Link className="actionBtn iconSize btnInfo ml-10" disabled={true} style={{ paddingBottom: "2px" }}
                                    text="">
                                    <TooltipHost
                                        content={"Sample Excel File Not Available"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon
                                            icon={"download"}
                                        />
                                    </TooltipHost></Link> :

                                <> */}

                            <Link className="actionBtn iconSize disable btnMove ml-10" style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                text="">
                                <TooltipHost
                                    content={"Download Sample Excel File"}
                                    id={tooltipId}
                                >
                                    <FontAwesomeIcon
                                        icon={"download"}
                                    />
                                </TooltipHost>   </Link>
                            {/* </>} */}

                            <Link className="actionBtn iconSize btnDanger ml-10 dticon icon-mr-8" style={{ paddingBottom: "2px" }} onClick={onclickUpload}
                                text="">
                                <TooltipHost
                                    content={"Upload Excel File"}
                                    id={tooltipId}
                                >
                                    <FontAwesomeIcon
                                        icon={"upload"}
                                    />
                                </TooltipHost>    </Link>
                            <Link className="actionBtn iconSize btnRefresh icon-mr" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                text="">
                                <TooltipHost
                                    content={"Refresh Grid"}
                                    id={tooltipId}
                                >
                                    <FontAwesomeIcon
                                        icon={"arrows-rotate"}
                                    />
                                </TooltipHost>    </Link>
                            <PrimaryButton text="Add" className="btn btn-primary "
                                onClick={() => {
                                    let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                    breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddJobControlChecklist, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddJobControlChecklist, isAddClient: true, breadCrumItems: breadCrumItems } });
                                    props.manageComponentView({ currentComponentName: ComponentNameEnum.AddJobControlChecklist, isAddNewSite: true, breadCrumItems: breadCrumItems, originalSiteMasterId: props.siteMasterId });
                                    setIsLoading(false);
                                }}
                            />
                        </div>



                    </div>
                    {Drag &&
                        <DraggableJobContChecklist
                            provider={props.provider}
                            data={Data}
                            onSelectedRecordsChange={handleSelectedRecordsChange}
                            flag={flag}
                            isEdit={props?.loginUserRoleDetails?.isAdmin || props?.loginUserRoleDetails?.isStateManager || props?.loginUserRoleDetails?.isSiteManager}
                            setFlag={setFlag} />
                    }
                </div>
            </div>
        </>;
    }
};