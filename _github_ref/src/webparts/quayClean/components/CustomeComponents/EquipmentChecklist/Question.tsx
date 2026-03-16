/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { DefaultButton, DialogFooter, DialogType, FocusTrapZone, Layer, mergeStyleSets, Overlay, Popup, PrimaryButton, TooltipHost } from "office-ui-fabric-react";
import { Loader } from "../../CommonComponents/Loader";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { IQuayCleanState } from "../../QuayClean";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { toastService } from "../../../../../Common/ToastService";
import CustomModal from "../../CommonComponents/CustomModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { delay, generateExcelTable, getAssetTypeMaster, getCAMLQueryFilterExpression, getErrorMessageValue, logGenerator, onBreadcrumbItemClicked, UserActivityLog } from "../../../../../Common/Util";
import { AssetTypeMasterFilter } from "../../../../../Common/Filter/AssetTypeMaster";
import { QuestionOptionFilter } from "../../../../../Common/Filter/QuestionOption";
import { ChecklistTypeFilter } from "../../../../../Common/Filter/QuestionChecklistType";
import { QuestionManufacturerFilter } from "../../../../../Common/Filter/QuestionManufacturer";
import DragAndDrop from "../../CommonComponents/FileUpload/DragandDrop";
import { ValidateForm } from "../../../../../Common/Validation";
import * as XLSX from 'xlsx';
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import CamlBuilder from "camljs";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { faIndustry, faListCheck, faCubes, faKeyboard, faFilter } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "@fluentui/react";
import { IHelpDeskFormState } from "../../../../../Interfaces/IAddNewHelpDesk";
import { ManageAssetTypeCategoriesDrawer } from "../AssetType/ManageAssetTypeCategoriesDrawer";
import { AddQuestionDrawer } from "./AddQuestionDrawer";
const moduleImg = require("../../../assets/images/module.svg");
const allAppImg = require("../../../assets/images/AllAppMenu.svg");

export interface IAssociateChemicalProps {
    provider: IDataProvider;
    context: WebPartContext;
    breadCrumItems: IBreadCrum[];
    manageComponentView(componentProp: IQuayCleanState): any;
    loginUserRoleDetails: ILoginUserRoleDetails;
    siteMasterId?: number;
    originalSiteMasterId: any;
    componentProps: IQuayCleanState;
}

export interface IExportColumns {
    header: string;
    key: string;
    width?: number;
}

export const Question = (props: IAssociateChemicalProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [Data, setData] = React.useState<any[]>([]);
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const tooltipId = useId('tooltip');
    const [selectedAssetTypeMaster, setSelectedAssetTypeMaster] = React.useState<any>("");
    const [selectedQuestionOption, setSelectedQuestionOption] = React.useState<any>("");
    const [downloadDisable, setdownloadDisable] = React.useState<boolean>(true);
    const [uploadData, setuploadData] = React.useState<any[]>([]);
    const [selectedChecklistType, setSelectedChecklistType] = React.useState<any>("");
    const [selectedQuestionManufacturer, setSelectedQuestionManufacturer] = React.useState<any>("");
    const [excelData, setexcelData] = React.useState<any[]>([]);
    const options = React.useRef<any>();
    const [isreload, setisreload] = React.useState<boolean>(false);

    const [newFromObj, setNewFromObj] = React.useState<any>({
        Id: 0,
        Title: "",
        HowManyHours: "",
        Manufacturer: ""
    });
    const [assetTypeState, SetAssetTypeState] = React.useState<IHelpDeskFormState>({
        CallerOptions: [],
        CategoryOptions: [],
        EventOptions: [],
        // isdisableField: !!isAddNewHelpDesk ? false : true,
        // isAddNewHelpDesk: !!isAddNewHelpDesk,
        isdisableField: false,
        isAddNewHelpDesk: true,
        isformValidationModelOpen: false,
        validationMessage: null
    });

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
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [flag, setFlag] = React.useState(false);
    const [Drag, setDrag] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [groupedData, setGroupedData] = React.useState<any>({});
    const [isRefreshSideBar, setIsRefreshSideBar] = React.useState<boolean>(true);
    const [openSidebarSection, setOpenSidebarSection] = React.useState<string[]>([]);
    const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = React.useState(false);
    const [isAddCategoryOpen, setIsAddCategoryOpen] = React.useState(false);
    const [showAddQuestion, setShowAddQuestion] = React.useState(false);
    const [isQuetionInEditMode, setIsQuetionInEditMode] = React.useState(false);
    const [editQuestionId, setEditQuestionId] = React.useState<number | null>(null);

    const [selectedAssetType, setSelectedAssetType] = React.useState<{ id: number; name: string; manufacturer: any } | null>(null);
    const assetTypeMasterData = React.useRef<any>();
    const [currentView, setCurrentView] = React.useState<string>(window.innerWidth <= 768 ? 'card' : 'grid');
    const tableItemsPerPage = 30;
    const [tablePage, setTablePage] = React.useState(1);
    const [cardPage, setCardPage] = React.useState(1);

    const cardTotalPages = Math.max(1, Math.ceil(Data.length / tableItemsPerPage));
    const paginatedCardData = React.useMemo(() => {
        const start = (cardPage - 1) * tableItemsPerPage;
        return Data.slice(start, start + tableItemsPerPage);
    }, [Data, cardPage]);

    const totalPages = Math.max(1, Math.ceil(Data.length / tableItemsPerPage));

    const paginatedTableData = React.useMemo(() => {
        const start = (tablePage - 1) * tableItemsPerPage;
        return Data.slice(start, start + tableItemsPerPage);
    }, [Data, tablePage]);

    React.useEffect(() => {
        setTablePage(1);
        setCardPage(1);
    }, [Data]);

    // const getPageNumbers = () => {
    //     const pages: (number | string)[] = [];
    //     const maxVisible = 5;

    //     if (totalPages <= maxVisible) {
    //         for (let i = 1; i <= totalPages; i++) pages.push(i);
    //     } else {
    //         pages.push(1);
    //         if (tablePage > 3) pages.push("...");
    //         const start = Math.max(2, tablePage - 1);
    //         const end = Math.min(totalPages - 1, tablePage + 1);
    //         for (let i = start; i <= end; i++) pages.push(i);
    //         if (tablePage < totalPages - 2) pages.push("...");
    //         pages.push(totalPages);
    //     }

    //     return pages;
    // };

    const getPageNumbers = (currentPage: number, totalPages: number) => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);

            if (currentPage > 3) pages.push("...");

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - 2) pages.push("...");

            pages.push(totalPages);
        }

        return pages;
    };


    const startRecord = Data.length === 0 ? 0 : (tablePage - 1) * tableItemsPerPage + 1;
    const endRecord = Math.min(tablePage * tableItemsPerPage, Data.length);

    const onChecklistTypeChange = (ChecklistTypeId: string): void => {
        setSelectedChecklistType(ChecklistTypeId);
    };

    const onQuestionManufacturerChange = (option: any): void => {
        const manufacturer = option?.value || undefined;
        setSelectedQuestionManufacturer(manufacturer);
        setSelectedAssetType(null);
        setisreload(!isreload ? true : false);
    };

    const onAssetTypeMasterChange = (AssetTypeMasterId: any): void => {
        setSelectedAssetTypeMaster(AssetTypeMasterId.value);
        setSelectedAssetType(null);
    };

    const onQuestionOptionChange = (QuestionOptionId: string): void => {
        setSelectedQuestionOption(QuestionOptionId);
    };

    const onclickUpload = () => {
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: true }));
    };

    const onClickCloseModel = () => {
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false }));
    };

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
            maxWidth: '500px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
        }
    });

    const _Data = async () => {
        setIsLoading(true);
        try {
            const filterFields: ICamlQueryFilter[] = [
                {
                    fieldName: "IsActive",
                    fieldValue: true,
                    fieldType: FieldType.Integer,
                    LogicalType: LogicalType.EqualTo
                }
            ];

            if (selectedChecklistType && selectedChecklistType != "All") {
                filterFields.push({
                    fieldName: `ChecklistType`,
                    fieldValue: selectedChecklistType,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                })
            }

            if (selectedQuestionManufacturer) {
                filterFields.push({
                    fieldName: `Manufacturer`,
                    fieldValue: selectedQuestionManufacturer,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                })
            }

            if (selectedQuestionOption) {
                filterFields.push({
                    fieldName: `Option`,
                    fieldValue: `${selectedQuestionOption}`,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                })
            }
            if (selectedAssetTypeMaster) {
                filterFields.push({
                    fieldName: `AssetType`,
                    fieldValue: selectedAssetTypeMaster,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.EqualTo
                })
            }

            const filterFieldsSite: ICamlQueryFilter[] = [];

            const camlQuery = new CamlBuilder()
                .View(["ID",
                    "Title",
                    "Modified",
                    "AssetTypeId",
                    "AssetType",
                    "AssetType/Title",
                    "Option",
                    "IsRequired",
                    "QuestionType",
                    "ChecklistType",
                    "Manufacturer",
                    "Index"])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query();

            const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
            const siteFilter: any[] = getCAMLQueryFilterExpression(filterFieldsSite);
            if (categoriesExpressions.length > 0) {
                camlQuery.Where().All(categoriesExpressions);
            }

            // camlQuery.Where().All(categoriesExpressions);
            // camlQuery.OrderByDesc(selectedInspection === "Conducted Date" ? "Conductedon" : "Completed");

            let finalQuery = camlQuery.ToString();
            if (filterFieldsSite.length > 0) {
                finalQuery = CamlBuilder.FromXml(camlQuery.ToString())
                    .ModifyWhere().AppendAnd().Any(siteFilter).ToString();
            }

            const pnpQueryOptions: IPnPCAMLQueryOptions = {
                listName: ListNames.QuestionMaster,
                queryXML: finalQuery,
                pageToken: "",
                pageLength: 100000
            }
            const localResponse = await props.provider.getItemsInBatchByCAMLQuery(pnpQueryOptions);
            const results = localResponse?.Row;

            // const selectFields = ["ID", "Title", "Modified", "AssetTypeId", "AssetType", "AssetType/Title", "Option", "IsRequired", "QuestionType", "ChecklistType", "Manufacturer", "Index"];
            // const filterArray: string[] = [];
            // filterArray.push(`<Eq><FieldRef Name='IsActive'/><Value Type='Integer'>1</Value></Eq>`);
            // if (selectedChecklistType) {
            //     filterArray.push(`<Eq><FieldRef Name='ChecklistType'/><Value Type='Text'>${selectedChecklistType}</Value></Eq>`);
            // }
            // if (selectedQuestionManufacturer) {
            //     filterArray.push(`<Eq><FieldRef Name='Manufacturer'/><Value Type='Text'>${selectedQuestionManufacturer}</Value></Eq>`);
            // }
            // if (selectedAssetTypeMaster) {
            //     filterArray.push(`<Eq><FieldRef Name='AssetType' LookupId='TRUE'/><Value Type='Lookup'>${selectedAssetTypeMaster}</Value></Eq>`);
            // }
            // if (selectedQuestionOption) {
            //     filterArray.push(`<Eq><FieldRef Name='Option'/><Value Type='Text'>${selectedQuestionOption}</Value></Eq>`);
            // }
            // let combinedFilter = '';
            // if (filterArray.length > 1) {
            //     combinedFilter = filterArray.reduce((prev, current) => `<And>${prev}${current}</And>`);
            // } else if (filterArray.length === 1) {
            //     combinedFilter = filterArray[0];
            // }
            // const queryFilter = combinedFilter ? `<Where>${combinedFilter}</Where>` : '';
            // const camlQuery = `<View>
            //     <ViewFields>
            //         ${selectFields.map(field => `<FieldRef Name='${field}' />`).join('')}
            //     </ViewFields>
            //     <Query>
            //         ${queryFilter}
            //     </Query>
            //     <RowLimit>5000</RowLimit>
            // </View>`;
            // const siteURL = props.context.pageContext.web.absoluteUrl;
            // const results = await props.provider.getItemsByCAMLQuery(ListNames.QuestionMaster, camlQuery, null, siteURL);
            if (!!results) {
                const ListData = results.map((data: any) => {
                    return (
                        {
                            ID: data.ID,
                            Title: data.Title,
                            AssetTypeId: !!data.AssetType[0] ? data.AssetType[0].lookupId : "",
                            AssetType: !!data.AssetType[0] ? data.AssetType[0].lookupValue : "",
                            Manufacturer: !!data.Manufacturer ? data.Manufacturer : "",
                            Option: !!data.Option ? data.Option : '',
                            SpaceOption: !!data.Option ? data.Option.includes('|') ? data.Option.replace(/\|/g, ' | ') : data.Option : '',
                            // IsRequired: !!data.IsRequired ? 'Yes' : 'No',
                            IsRequired: !!data?.IsRequired ? data?.IsRequired : 'No',
                            QuestionType: !!data.QuestionType ? data.QuestionType : '',
                            ChecklistType: !!data.ChecklistType ? data.ChecklistType : '',
                            Modified: !!data.Modified ? data.Modified : '',
                            Index: !!data.Index ? data.Index : null,
                        }
                    );
                });

                const sorted = ListData.map((item: any) => ({
                    ...item,
                    Index: item?.Index === "" ? Infinity : Number(item?.Index)
                })).sort((a: any, b: any) => a.Index - b.Index);
                // const top20Records = sorted.slice(0, 0);
                setData(sorted);
                setDrag(true);
            }
            setIsLoading(false);
            setIsRefreshSideBar(false);
            setIsRefreshGrid(false);

        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "_Data", CustomErrormessage: "error in get _data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            const errorMessage = getErrorMessageValue(error.message);
            setError(errorMessage);
            sethasError(true);
        }
    };

    const onclickEdit = (item: any) => {
        setEditQuestionId(item.ID);
        setShowAddQuestion(true);
        setIsQuetionInEditMode(true);
    };


    const onclickconfirmdelete = (item: any) => {
        setUpdateItem(item);
        toggleHideDialog();
    };

    const onclickDownload = async () => {
        try {
            let url = props.context.pageContext.web.absoluteUrl + '/Shared%20Documents/MasterFiles/QuestionBank.xlsx';
            let fileName = "QuestionBank";
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

    const onclickExportToExcel = async () => {
        try {
            let exportColumns: IExportColumns[] = [
                {
                    header: "Question",
                    key: "Title"
                },
                {
                    header: "Manufacturer",
                    key: "Manufacturer"
                },
                {
                    header: "Checklist Type",
                    key: "ChecklistType"
                },
                {
                    header: "Is Required",
                    key: "IsRequired"
                },
                {
                    header: "Option",
                    key: "Option"
                },
                {
                    header: "Asset Type",
                    key: "AssetType"
                },
                {
                    header: "Question Type",
                    key: "QuestionType"
                }

            ];
            generateExcelTable(Data, exportColumns, `Questions_Bank_Sample_Data.xlsx`);
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickExportToExcel", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const _confirmDeleteItem = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        const data = {
            IsActive: false
        };
        try {
            if (!!UpdateItem) {
                setIsRefreshSideBar(true);
                await props.provider.updateItemWithPnP(data, ListNames.QuestionMaster, UpdateItem.ID);
                setIsRefreshGrid(true);
                const logObj = {
                    UserName: props?.loginUserRoleDetails?.title,
                    SiteNameId: UpdateItem?.SiteNameId,
                    ActionType: UserActivityActionTypeEnum.Delete,
                    EntityType: UserActionEntityTypeEnum.QuestionBank,
                    EntityId: UpdateItem?.Id || UpdateItem?.ID,
                    EntityName: UpdateItem?.Title,
                    Details: `Delete Question`
                };
                void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                toastService.updateLoadingWithSuccess(toastId, "Record deleted successfully!");
                toggleHideDialog();
                setisDisplayEDbtn(false);
                setUpdateItem(undefined);
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

    const optionValue = (value?: string): string | undefined => {
        if (!value) return value;
        return value?.split("|").map(v => v.trim()).join("|");
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
                const expectedColumnNames = ['Title', 'Option', 'Is Required', 'Question Type', 'Checklist Type', 'Manufacturer', 'Asset Type'];
                let isColumnsValid = true;

                for (let index = 0; index < expectedColumnNames.length; index++) {
                    isColumnsValid = dataJSONHeaderChek.indexOf(expectedColumnNames[index]) >= 0;
                    if (!isColumnsValid) {
                        errorobj.push(expectedColumnNames[index]);
                    }
                }
                const excelData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
                if (errorobj.length == 0) {
                    let finalExcelData = excelData.map((item: any) => {
                        return {
                            Title: item.Title,
                            Option: optionValue(item.Option),
                            IsRequired: item['Is Required'],
                            QuestionType: item['Question Type'],
                            ChecklistType: item['Checklist Type'],
                            Manufacturer: item.Manufacturer,
                            AssetTypeId: item['Asset Type']
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

    const onSaveFiles = () => {
        setIsLoading(true);
        try {
            if (uploadData && uploadData.length > 0) {
                const toastMessage = 'Record Insert successfully!';
                const toastId = toastService.loading('Loading...');
                props.provider.createItemInBatch(uploadData, ListNames.QuestionMaster).then(async (results: any) => {
                    setIsRefreshSideBar(true);
                    setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
                    let record = results.map((item: { data: any; }) => item.data);
                    setIsRefreshGrid(true);
                    let recordId = record.map((i: { ID: any; }) => i.ID);
                    // qrupload(recordId, record)
                    if (false) delay(500);
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    setisreload(!isreload ? true : false);

                    setIsLoading(false);
                }).catch(err => console.log(err));
            } else {
                setIsLoading(false);
                setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "onSaveFiles", CustomErrormessage: "error in save file data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const onCancel = async () => {
        setState((prevState: any) => ({ ...prevState, isUploadModelOpen: false, mdlConfigurationFile: [] }));
    };

    React.useEffect(() => {
        const assetTypeMap = options.current?.reduce((acc: any, option: any) => {
            acc[option.text] = option.value;
            return acc;
        }, {});

        let unmatchedRecords: any[] = [];
        let createdId: any[] = [];
        unmatchedRecords = [];
        let dropvalue: any = [];
        if (excelData.length > 0) {
            const data: any = JSON.stringify(excelData, null, 2);
            const jsondata: any = JSON.parse(data);
            const formatData = jsondata.map((i: any) => {
                i.IsRequired =
                    i.IsRequired == 1 ||
                        i.IsRequired === true ||
                        i.IsRequired === 'TRUE' ? true : false;
                let matchedValue = assetTypeMap[i.AssetTypeId];
                if (matchedValue !== undefined) {
                    return { ...i, AssetTypeId: matchedValue };
                } else {
                    unmatchedRecords.push({ AssetTypeId: i.AssetTypeId, Manufacturer: i.Manufacturer });
                    return { ...i, AssetTypeId: i.AssetTypeId };
                }

            });
            const uniqueItems = Array.from(new Set(unmatchedRecords.map((item: any) => JSON.stringify(item)))).map((item: any) => JSON.parse(item));
            const promises = uniqueItems.map(async (itemss: any) => {
                let createdata = {
                    Title: itemss.AssetTypeId,
                    HowManyHours: "4 Hours",
                    Manufacturer: itemss.Manufacturer
                };
                try {
                    const item = await props.provider.createItem(createdata, ListNames.AssetTypeMaster);
                    createdId.push({ Id: item.data.Id, Title: item.data.Title });
                } catch (err) {
                    console.log(err);
                }
            });
            Promise.all(promises)
                .then(async () => {
                    const stateMasterItems = await getAssetTypeMaster(props.provider);

                    if (!!formatData && createdId.length > 0) {
                        createdId = [];
                        const formattedData = formatData.map((item: any) => {
                            item.IsRequired =
                                item.IsRequired == 1 ||
                                    item.IsRequired === true ||
                                    item.IsRequired === 'TRUE' ? true : false;
                            // Check if AssetTypeId is a string and find matching Title in stateMasterItems
                            if (typeof item.AssetTypeId === 'string') {
                                const match = stateMasterItems.find(
                                    (master) => master.Title === item.AssetTypeId
                                );
                                if (match) {
                                    item.AssetTypeId = match.Id;
                                }
                            }
                            return item;
                        });
                        setuploadData(formattedData);
                        AssetTypeMasterData();
                    } else {
                        setuploadData(formatData);
                    }
                })
                .catch((err) => console.log(err));
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

    const groupedDataByManufaturer = (items: any) => {
        if (!items || !items.length) {
            setGroupedData({});
            return;
        }
        const grouped = items.reduce((acc: any, item: any) => {
            const manufacturer = item.Manufacturer || "Unknown";

            if (!acc[manufacturer]) {
                acc[manufacturer] = [];
            }
            acc[manufacturer].push(item);
            return acc;
        }, {});
        const sortedGroupedData = Object.keys(grouped).sort((a, b) => a.localeCompare(b)).reduce((acc: any, key: string) => {
            acc[key] = grouped[key];
            return acc;
        }, {});

        setGroupedData(sortedGroupedData);
    }

    const AssetTypeMasterData = () => {
        const select = ["Id,Title,Manufacturer,HowManyHours,ReminderHours"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.AssetTypeMaster,
            filter: `IsDeleted ne 1`
        };
        let dropvalue: any = [];

        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((State: any) => {
                dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
            });
            options.current = dropvalue;
            assetTypeMasterData.current = response;
            groupedDataByManufaturer(response);
        }).catch((error) => {
            console.log(error);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "AssetTypeMasterData", CustomErrormessage: "error in get AssetType Master Data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        });
    };

    const onclickRefreshGrid = () => {
        setIsRefreshGrid(true);
    };

    const onClickUpdateOrder = () => {
    };

    const onClickCancelOrder = () => {
    };

    // React.useEffect(() => {
    //     _Data();
    // }, [isRefreshGrid, selectedAssetTypeMaster, selectedQuestionOption, selectedChecklistType, selectedQuestionManufacturer]);

    React.useEffect(() => {
        if (isRefreshGrid) {
            _Data();
        }
    }, [isRefreshGrid]);

    React.useEffect(() => {
        if (isRefreshSideBar) {
            AssetTypeMasterData();
        }
    }, [isRefreshSideBar]);

    React.useEffect(() => {
        AssetTypeMasterData();
        props.provider.getDocumentByURL().then((results: any[]) => {
            if (!!results) {
                let fileNameArray = results.map(item => item.FileLeafRef == "QuestionBank.xlsx");
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
        _Data();
    }, []);

    const toggleSidebarSection = (manufacturer: string) => {
        setOpenSidebarSection(prev => {
            if (prev.includes(manufacturer)) {
                return prev.filter(item => item !== manufacturer);
            }
            return [...prev, manufacturer];
        });
    };

    const openCategoryDrawer = () => setIsCategoryDrawerOpen(true);
    const closeCategoryDrawer = () => {
        setIsCategoryDrawerOpen(false);
        setIsAddCategoryOpen(false); // reset inner panel
    };

    const onAssetTypeClick = (assetTypeId: number, assetTypeName: string, manufacturer: string) => {
        setSelectedAssetType(prev => {
            if (prev?.id === assetTypeId) {
                setSelectedQuestionManufacturer(undefined);
                setSelectedAssetTypeMaster(undefined);
                setIsRefreshGrid(true);
                return null;
            }

            setSelectedQuestionManufacturer(manufacturer);
            setSelectedAssetTypeMaster(assetTypeId);
            setIsRefreshGrid(true);
            return {
                id: assetTypeId,
                name: assetTypeName,
                manufacturer
            };
        });
    };

    const onAddClick = () => {
        setEditQuestionId(null);
        setShowAddQuestion(true);
        setIsQuetionInEditMode(false);
    };

    const handleViewChange = (view: string) => {
        setCurrentView(view);
    };

    const getStatusClass = (isRequired: string): string =>
        isRequired === "Yes" ? "questatus-required" : "status-optional";

    const getBorderColor = (isRequired: string): string =>
        isRequired === "Yes" ? "var(--success)" : "var(--warning)";

    const getOptionsArray = (option?: string): string[] =>
        option ? option.split("|").map(o => o.trim()) : [];

    const onResetClick = () => {
        setSelectedQuestionManufacturer(undefined);
        setSelectedAssetTypeMaster(undefined);
        setSelectedChecklistType(undefined);
        setSelectedQuestionOption(undefined);
        setSelectedAssetType(null);
        setIsRefreshGrid(true);
    };

    const onSearchClick = () => {
        setIsRefreshGrid(true);
    }

    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {isLoading && <Loader />}
            <CustomModal isModalOpenProps={hideDialog}
                setModalpopUpFalse={_closeDeleteConfirmation}
                subject={"Delete Item"}
                message={'Are you sure, you want to delete this record?'}
                yesButtonText="Yes"
                closeButtonText={"No"}
                onClickOfYes={_confirmDeleteItem} />

            {
                state.isUploadModelOpen &&
                <CustomModal dialogWidth="900px" isModalOpenProps={state.isUploadModelOpen} setModalpopUpFalse={onClickCloseModel} subject={"Upload"} message={DranAndDrop}
                    closeButtonText={""} />
            }
            <div className="equipment-page">
                <aside className="sidebar">
                    <div className="sidebar-all-title">
                        <img src={allAppImg} /> All Asset Type
                    </div>
                    <div className="sidebar-group">
                        {Object.keys(groupedData).map((manufacturer: string) => {
                            const isOpen = openSidebarSection.includes(manufacturer);

                            return (
                                <div key={manufacturer}>
                                    <button className="cat-btn" onClick={() => toggleSidebarSection(manufacturer)}>
                                        <span className="accordion-icon"><img src={moduleImg} /></span>  {manufacturer}
                                        <span className="chev" style={{ marginLeft: "auto" }}>
                                            {/* <span className={`arrow ${isOpen ? "down" : "right"}`}></span> */}
                                            <span className="summary-right">{isOpen ? <FontAwesomeIcon icon={"angle-down"} /> : <FontAwesomeIcon icon={"angle-right"} />} </span>
                                        </span>
                                    </button>
                                    <div className="cat-list" style={{ display: isOpen ? "block" : "none" }}>
                                        {Array.from(
                                            new Map(groupedData[manufacturer].map((item: any) => [
                                                item.ID,
                                                { id: item.Id, name: item.Title, manufacturer: manufacturer }
                                            ])
                                            ).values()
                                        ).map((asset: any) => (
                                            <a key={asset.id}
                                                href="#"
                                                className={`cat-item ${selectedAssetType?.id === asset.id ? "active" : ""}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onAssetTypeClick(asset.id, asset.name, manufacturer);
                                                }}
                                            >
                                                {asset.name}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="sidebar-bottom">
                        <button className="btn" style={{ width: "100%" }} onClick={openCategoryDrawer}                        >
                            <FontAwesomeIcon icon={"gear"} /> Manage Asset Type
                        </button>
                    </div>
                </aside>
                <main className="content">
                    <div className="topbar">
                        <div>
                            <h1 style={{ margin: 0, fontSize: 20 }}>
                                Equipment Checklist
                                {!!selectedAssetType && <span
                                    className="muted"
                                    style={{ marginLeft: 8, padding: "3px 8px", borderRadius: 8, background: "#eef2ff", color: "var(--primary)", fontSize: 12 }}>
                                    {selectedAssetType?.name}
                                </span>}
                            </h1>
                        </div>

                        <div className="controls">
                            <div className="swtich-toggle-grid">
                                <button className={`swtichbtn ${currentView === "card" ? "active" : ""}`} id="viewCardsBtn" onClick={() => handleViewChange("card")}>
                                    <FontAwesomeIcon icon={"table-cells"} style={{ color: "#323130" }} /> Cards
                                </button>
                                <button className={`swtichbtn ${currentView === "grid" ? "active" : ""}`} id="viewTableBtn" onClick={() => handleViewChange("grid")} >
                                    <FontAwesomeIcon icon={"table"} style={{ color: "#323130" }} />  Table
                                </button>
                            </div>

                            <div className="topnav-line"></div>

                            {(!!Data && Data.length > 0) && <button className="btn btn-action-top" type="button" onClick={onclickExportToExcel}>
                                <TooltipHost content={"Export to excel"} id={tooltipId}>
                                    <FontAwesomeIcon icon={"file-excel"} style={{ color: 'orange' }} />
                                </TooltipHost>
                            </button>}

                            <button className="btn btn-action-top" type="button" onClick={onclickDownload}>
                                <TooltipHost content={"Download Sample Excel File"} id={tooltipId} >
                                    <FontAwesomeIcon icon={"download"} style={{ color: '#6f42c1' }} />
                                </TooltipHost>
                            </button>
                            <button className="btn btn-action-top" type="button" onClick={onclickUpload}>
                                <TooltipHost content={"Upload Excel File"} id={tooltipId} >
                                    <FontAwesomeIcon icon={"upload"} style={{ color: '#dc3545' }} />
                                </TooltipHost>
                            </button>
                            <button className="btn btn-action-top" type="button" onClick={() => {
                                setIsRefreshSideBar(true);
                                onclickRefreshGrid();
                            }}>

                                <TooltipHost content={"Refresh Grid"} id={tooltipId}>
                                    <FontAwesomeIcon icon={"arrows-rotate"} style={{ color: '#dd5f15' }} />
                                </TooltipHost>
                            </button>

                            <button className="btn btn-primary" onClick={onAddClick}><FontAwesomeIcon icon={"plus"} /> Add New</button>
                        </div>
                    </div>

                    {/* Filter Panel */}
                    <div className="panel">

                        <details className="filter-panel" id="filterDetails">
                            <summary>
                                <div className="summary-left">
                                    <span className="icon"><FontAwesomeIcon icon={faFilter} /></span>
                                    <span className="label">Filters &amp; Options</span>
                                </div>
                                <span className="summary-right">
                                    <FontAwesomeIcon icon={"angle-down"} /></span>
                            </summary>

                            <div className="panel-body" id="panelBody">

                                <div className="filters-grid">
                                    <div className="field">
                                        <label htmlFor="manufacturer">Manufacturer</label>
                                        <div>
                                            <QuestionManufacturerFilter
                                                selectedQuestionManufacturer={selectedQuestionManufacturer}
                                                defaultOption={!!selectedQuestionManufacturer ? selectedQuestionManufacturer : null}
                                                onOptionChange={onQuestionManufacturerChange}
                                                provider={props.provider}
                                                refreshNav={isreload}
                                                AllOption={true}
                                            />
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label htmlFor="assetType">Asset Type</label>
                                        <div>
                                            <AssetTypeMasterFilter
                                                selectedAssetTypeMaster={selectedAssetTypeMaster}
                                                defaultOption={!!selectedAssetTypeMaster ? selectedAssetTypeMaster : null}
                                                onOptionChange={onAssetTypeMasterChange}
                                                provider={props.provider}
                                                refreshNav={isreload}
                                                AllOption={true} />
                                        </div>
                                    </div>

                                    <div className="field">
                                        <label htmlFor="checklistType">Checklist Type</label>
                                        <div>
                                            <ChecklistTypeFilter
                                                selectedChecklistType={selectedChecklistType}
                                                defaultOption={!!selectedChecklistType ? selectedChecklistType : ""}
                                                onChecklistTypeChange={onChecklistTypeChange}
                                                provider={props.provider}
                                                refreshNav={isreload}
                                                AllOption={true}
                                            />
                                        </div>
                                    </div>
                                    <div className="field">
                                        <label htmlFor="options">Options</label>
                                        <div>
                                            <QuestionOptionFilter
                                                selectedQuestionOption={selectedQuestionOption}
                                                defaultOption={!!selectedQuestionOption ? selectedQuestionOption : ""}
                                                onQuestionOptionChange={onQuestionOptionChange}
                                                provider={props.provider}
                                                AllOption={true} />
                                        </div>
                                    </div>

                                </div>
                                <div className="mt-2" style={{ display: "flex", justifyContent: "right" }}>
                                    <PrimaryButton
                                        text='Search'
                                        iconProps={{ iconName: "Search" }}
                                        className='btn btn-primary'
                                        onClick={onSearchClick} />
                                    &nbsp;
                                    <DefaultButton
                                        text='Reset'
                                        iconProps={{ iconName: "Reset" }}
                                        className="btn btn-danger"
                                        onClick={onResetClick} />
                                </div>
                            </div>
                        </details>
                    </div>

                    {/* Cards View */}
                    {currentView === "card" && (
                        <div className="table-pagination-wrapper">

                            <div className="record-info">
                                Showing {(cardPage - 1) * tableItemsPerPage + 1} to {Math.min(cardPage * tableItemsPerPage, Data.length)} of {Data.length} records
                            </div>

                            <div className="table-pagination">
                                <button
                                    className="pag-btn"
                                    disabled={cardPage === 1}
                                    onClick={() => setCardPage(p => p - 1)}
                                >
                                    <FontAwesomeIcon icon={"angle-double-left"} className="pag-svg" />   Prev
                                </button>
                                {getPageNumbers(cardPage, cardTotalPages).map((p, i) =>
                                    p === "..." ? (
                                        <span key={i} className="pag-ellipsis">…</span>
                                    ) : (
                                        <button
                                            key={i}
                                            className={`pag-number ${cardPage === p ? "active" : ""}`}
                                            onClick={() => setCardPage(Number(p))}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}
                                <button
                                    className="pag-btn"
                                    disabled={cardPage === cardTotalPages}
                                    onClick={() => setCardPage(p => p + 1)}
                                >
                                    Next <FontAwesomeIcon icon={"angle-double-right"} />
                                </button>
                            </div>
                        </div>
                    )}

                    {currentView === "card" && (
                        <section id="cardsView">
                            {Data.length === 0 && (
                                <article className="card">
                                    <div className="muted" style={{ padding: 16, textAlign: "center" }}>
                                        No Record Found
                                    </div>
                                </article>
                            )}
                            <div className="cards-grid" id="cardsGrid">
                                {paginatedCardData.map((item: any, index: number) => (
                                    <article className="card" key={item.ID ?? index}>
                                        <div className="left-border" style={{ background: getBorderColor(item.IsRequired) }} />
                                        <div className="meta">
                                            <span className="accordion-icon"><FontAwesomeIcon icon={faCubes} style={{ color: "#5d9cef" }} /></span>
                                            <h4 className="spnAssetType">{item.AssetType}</h4>

                                            <span style={{ marginLeft: "auto" }}>
                                                <div className="ContextualMenu">
                                                    <IconButton
                                                        id="ContextualMenuButton1"
                                                        iconProps={{ iconName: 'MoreVertical' }}
                                                        split={false}
                                                        onRenderMenuIcon={() => null}
                                                        menuProps={{
                                                            shouldFocusOnMount: true,
                                                            styles: {
                                                                container: {
                                                                    minWidth: 120,
                                                                },
                                                            },
                                                            items: [
                                                                {
                                                                    key: 'edit',
                                                                    name: 'Edit',
                                                                    iconProps: { iconName: 'Edit', style: { color: 'orange' } },
                                                                    onClick: () => { onclickEdit(item) },
                                                                },
                                                                {
                                                                    key: 'delete',
                                                                    name: 'Delete',
                                                                    iconProps: { iconName: 'Delete', style: { color: '#dc3545' } },
                                                                    onClick: () => { onclickconfirmdelete(item) },
                                                                }
                                                            ],
                                                        }}
                                                    />

                                                </div>
                                            </span>
                                        </div>
                                        <h4 className="spnQuestion">{item.Title}</h4>

                                        <div className="question-meta mb-3">
                                            <div className="meta-row">
                                                <div className="meta-label">
                                                    <FontAwesomeIcon icon={faIndustry} />
                                                    <span>Manufacturer:</span>
                                                </div>
                                                <div className="meta-value">{item.Manufacturer}</div>
                                            </div>

                                            <div className="meta-row">
                                                <div className="meta-label">
                                                    <FontAwesomeIcon icon={faListCheck} />
                                                    <span>Checklist Type:</span>
                                                </div>
                                                <div className="meta-value">{item.ChecklistType}</div>
                                            </div>

                                            <div className="meta-row">
                                                <div className="meta-label">
                                                    <FontAwesomeIcon icon={faKeyboard} />
                                                    <span>Input Type:</span>
                                                </div>
                                                <div className="meta-value">{item.QuestionType}</div>
                                            </div>

                                            <div className="meta-row">
                                                <div className="meta-label">
                                                    <FontAwesomeIcon icon={'circle-exclamation'} />
                                                    <span>Required:</span>
                                                </div>
                                                <div className="meta-value">
                                                    <span className={getStatusClass(item.IsRequired)}>
                                                        {item.IsRequired === "Yes" ? <FontAwesomeIcon icon={'circle-check'} /> : <FontAwesomeIcon icon={'circle-xmark'} />}
                                                    </span>
                                                    {/* {item.IsRequired === "Yes" ? "Yes" : "No"} */}
                                                </div>
                                            </div>
                                        </div>


                                        <div className="card-footer">
                                            <div className="muted">Expected Response</div>
                                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                {getOptionsArray(item.Option).map((opt, i) => (
                                                    <div className="chip" key={i}>
                                                        {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                    </article>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Table View */}
                    {currentView === "grid" && (
                        <div className="table-pagination-wrapper">
                            <div className="record-info">
                                Showing {startRecord} to {endRecord} of {Data.length} records
                            </div>

                            {/* Pagination */}
                            <div className="table-pagination">
                                <button
                                    className="pag-btn"
                                    disabled={tablePage === 1}
                                    onClick={() => setTablePage(p => p - 1)}
                                >
                                    <FontAwesomeIcon icon={"angle-double-left"} className="pag-svg" /> Prev
                                </button>
                                {getPageNumbers(tablePage, totalPages).map((p, i) =>
                                    p === "..." ? (
                                        <span key={i} className="pag-ellipsis">…</span>
                                    ) : (
                                        <button
                                            key={i}
                                            className={`pag-number ${tablePage === p ? "active" : ""}`}
                                            onClick={() => setTablePage(Number(p))}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}

                                <button
                                    className="pag-btn"
                                    disabled={tablePage === totalPages}
                                    onClick={() => setTablePage(p => p + 1)}
                                >
                                    Next <FontAwesomeIcon icon={"angle-double-right"} className="pag-svg" />
                                </button>
                            </div>
                        </div>
                    )}

                    {currentView === "grid" && <section id="tableView" style={{ marginTop: 8 }}>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "25%" }}>Asset Type</th>
                                        <th style={{ width: "40%" }}>Checklist Item</th>
                                        <th style={{ width: "10%" }}>Details</th>
                                        <th style={{ width: "15%" }}>Response</th>
                                        <th style={{ width: "5%" }}>Required</th>
                                        <th style={{ width: "5%", textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="muted" style={{ textAlign: "center" }}>
                                                No Record Found
                                            </td>
                                        </tr>
                                    )}
                                    {paginatedTableData.map((item, index) => (
                                        <tr key={item.ID ?? index}>
                                            <td>{item.AssetType}</td>
                                            <td>{item.Title}</td>
                                            <td>
                                                <div className="muted questionDetails">
                                                    <span className="spnManufacturer">{item.Manufacturer}</span>
                                                    <span className="spnChecklistType">{item.ChecklistType}</span>
                                                    <span className="spnQuestionType"> {item.QuestionType}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                    {getOptionsArray(item.Option).map((opt, i) => (
                                                        <span key={i} className="chip">
                                                            {opt}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>

                                            <td>
                                                <span className={getStatusClass(item.IsRequired)}>
                                                    {item.IsRequired === "Yes" ? <FontAwesomeIcon icon={'circle-check'} /> : <FontAwesomeIcon icon={'circle-xmark'} />}
                                                </span>
                                            </td>

                                            <td style={{ textAlign: "right" }}>
                                                <div className="ContextualMenu">
                                                    <IconButton
                                                        id="ContextualMenuButton1"
                                                        iconProps={{ iconName: 'MoreVertical' }}
                                                        split={false}
                                                        onRenderMenuIcon={() => null}
                                                        menuProps={{
                                                            shouldFocusOnMount: true,
                                                            styles: {
                                                                container: {
                                                                    minWidth: 120,
                                                                },
                                                            },
                                                            items: [
                                                                {
                                                                    key: 'edit',
                                                                    name: 'Edit',
                                                                    iconProps: { iconName: 'Edit', style: { color: 'orange' } },
                                                                    onClick: () => { onclickEdit(item) },
                                                                },
                                                                {
                                                                    key: 'delete',
                                                                    name: 'Delete',
                                                                    iconProps: { iconName: 'Delete', style: { color: '#dc3545' } },
                                                                    onClick: () => { onclickconfirmdelete(item) },
                                                                }
                                                            ],
                                                        }}
                                                    />

                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                    }
                    <ManageAssetTypeCategoriesDrawer
                        isOpen={isCategoryDrawerOpen}
                        onClose={closeCategoryDrawer}
                        provider={props.provider}
                        siteNameId={props.componentProps?.siteNameId}
                        moduleImg={moduleImg}
                        onAfterChange={onclickRefreshGrid}
                    />
                    <AddQuestionDrawer
                        isOpen={showAddQuestion}
                        onClose={() => setShowAddQuestion(false)}
                        provider={props.provider}
                        isAddNewHelpDesk={!editQuestionId}
                        loginUserRoleDetails={props.loginUserRoleDetails}
                        componentProps={{
                            ...props.componentProps,
                            siteMasterId: editQuestionId
                        }}
                        onAfterChange={onclickRefreshGrid}
                    />

                </main>
            </div >
            {
                isPopupVisible && (
                    <Layer>
                        <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup}>
                            <Overlay onClick={hidePopup} />
                            <FocusTrapZone>
                                <Popup role="document" className={popupStyles.content}>
                                    <h2 className="mt-10">Confirm </h2>
                                    <div>Are you sure, you want to save this order?</div>
                                    <DialogFooter>
                                        <PrimaryButton text="Update" onClick={onClickUpdateOrder} className='mrt15 css-b62m3t-container btn btn-primary' />
                                        <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickCancelOrder} />
                                    </DialogFooter>
                                </Popup>
                            </FocusTrapZone>
                        </Popup>
                    </Layer>
                )
            }
            {assetTypeState.isformValidationModelOpen && (
                <CustomModal
                    isModalOpenProps={assetTypeState.isformValidationModelOpen}
                    setModalpopUpFalse={() =>
                        SetAssetTypeState(prev => ({
                            ...prev,
                            isformValidationModelOpen: false
                        }))
                    }
                    subject="Missing data"
                    message={assetTypeState.validationMessage}
                    closeButtonText="Close"
                />
            )}
        </>;
    }
};