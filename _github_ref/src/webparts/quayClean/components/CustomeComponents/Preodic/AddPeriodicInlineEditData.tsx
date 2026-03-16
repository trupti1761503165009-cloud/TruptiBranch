/* eslint-disable  */
import * as React from "react";
import { useBoolean } from "@fluentui/react-hooks";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { generateId, getTableHeight, removeElementOfBreadCrum } from "../../../../../Common/Util";
import { ComponentNameEnum, ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { IHelpDeskInLineEditDataState } from "../HelpDesk/HelpDeskInLineEditData";
import { IAddHelpDeskItem } from "../../../../../Interfaces/IAddNewHelpDesk";
import { toastService } from "../../../../../Common/ToastService";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";

interface IDialogMessageState {
    dialogHeader: string;
    dialogMessage: string;
    isSuccess: boolean;
}

export const AddPeriodicInlineEditData = (props: any) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [errorMessages, setErrorMessages] = React.useState<string[]>([]);
    const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());
    const [delselectedItem, setdelselectedItem] = React.useState<any>([]);
    const [hideErrorMsgDialog, { toggle: toggleHideErrorMsgDialog }] = useBoolean(true);
    const [periodicItems, setPeriodicItems] = React.useState<any[]>([]);
    const [hideConfirmationDialog, { toggle: toggleHideConfirmationDialog }] = useBoolean(true);
    const [confirmationMsg, setConfirmationMsg] = React.useState<any>('');
    const newItemRef = React.useRef<HTMLDivElement | null>(null);
    const textFieldRef = React.useRef<HTMLInputElement | null>(null);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [title, settitle] = React.useState<string>("");
    const [AddedValues, setAddedValues] = React.useState<any[]>([]);
    const ChoiceTitle = React.useRef<any>(null);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = React.useState(false);
    const [currentAttachmentRow, setCurrentAttachmentRow] = React.useState<any>(null);

    const [confirmFileDelete, setConfirmFileDelete] = React.useState(false);
    const [fileToDelete, setFileToDelete] = React.useState<string | null>(null);

    const [state, setState] = React.useState<IHelpDeskInLineEditDataState>({
        isLoading: false,
        validationFelidData: [],
        felidData: [],
        addPopUpTitle: "",
        isAddPopUP: false,
        deleteItemId: 0,
        isDeleteDialogOpen: false,
        EventName: "",
        isFormValidationModelOpen: false,
        validationMessage: null,
        column: [],
        // item: [{ Id: 0 }],
        item: [],
        selectedQCPriority: "",
        keyUpdate: Math.random(),
        isReload: false
    });
    const [deleteItem, setDeleteItem] = React.useState<any>({
        Id: "",
        isNew: true
    });
    const [dialogState, setDialogState] = React.useState<IDialogMessageState>({
        dialogHeader: "",
        dialogMessage: "",
        isSuccess: false
    });
    const defaultItem = {
        Id: 0,
        Title: "",
        TaskDate: undefined as any,
        CompletionDate: undefined as any,
        Area: "",
        SubLocation: "",
        WorkType: "",
        Frequency: "",
        Week: "",
        Month: "",
        Year: "",
        JobCompletion: "",
        EventNumber: "",
        Hours: "",
        Cost: "",
        StaffNumber: "",
        IsCompleted: false,
        IsNotification: false,
        indexNumber: 0,
        Comment: ""
    }
    const onClickAddPopUp = (title: string) => {
        ChoiceTitle.current = title;
        showPopup();
    }
    const onClickValidationClose = () => {
        setState((prevState) => ({ ...prevState, isFormValidationModelOpen: false }))
    }
    const [heightOfContainer, setHeightOfContainer] = React.useState<number>(Math.round(window.innerHeight) - 320);

    const setGridHeight = React.useCallback(() => {
        const _componentHeight = getTableHeight(185);
        setHeightOfContainer(_componentHeight);
    }, []);

    React.useEffect(() => {
        setGridHeight();
        const handleResize = () => {
            setGridHeight();
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [periodicItems]);

    const _addItem = () => {
        setTimeout(() => {
            textFieldRef.current?.focus?.(); // ✅ Use .focus() safely
        }, 100);
        const last = periodicItems[periodicItems.length - 1];
        if (!last || last.Area || last.SubLocation || last.WorkType || last.Title || last.Frequency || last.Week || last.Month ||
            last.Year || last.JobCompletion || last.TaskDate || last.CompletionDate || last.EventNumber ||
            last.Cost || last.StaffNumber || last.Hours
        ) {

            setPeriodicItems([...periodicItems, {
                Id: generateId(),
                TaskDate: undefined,
                CompletionDate: undefined,
                Area: "",
                SubLocation: "",
                WorkType: "",
                Title: "",
                Frequency: "",
                Week: "",
                Month: "",
                Year: "",
                JobCompletion: "",
                EventNumber: "",
                IsNotification: false,
                IsCompleted: false,
                Hours: "",
                Cost: "",
                StaffNumber: "",
                isNew: true,
                Comment: "",
                Attachments: []
            }]);

            setTimeout(() => {
                newItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                newItemRef.current?.focus?.();
            }, 100);
        };
    };

    React.useEffect(() => {
        setTimeout(() => {
            textFieldRef.current?.focus?.(); // ✅ Use .focus() safely
        }, 100);
        (async () => {
            try {
                if (props.siteMasterId) {
                    setState((prevState: any) => ({ ...prevState, isLoading: true }));
                    const [items] = await Promise.all([getPeriodicItem()]);
                    setPeriodicItems(items as any);
                    setState((prevState: any) => ({ ...prevState, isLoading: false, item: items, EventName: prevState.EventName, keyUpdate: Math.random() }));
                }
            } catch (error) {
                setState((prevState: any) => ({ ...prevState, isLoading: false }));
                let errorLogObj: any = {
                    ErrorMessage: "",
                    Title: "HelpDeskInLineEditData",
                    PageName: "QuayClean.aspx",
                    ErrorMethodName: "useEffect",
                    FileName: "HelpDeskInLineEditData",
                    Error: `${error}`
                }
                console.log(errorLogObj);
            }
        })()
    }, [state.isReload])

    // const getPeriodicItem = async () => {
    //     try {
    //         let items: IAddHelpDeskItem[] = [defaultItem];
    //         // if (props.componentProps.isEditMultiple && props.componentProps.editItemId) {
    //         if (props.componentProp.editItemId) {
    //             const camlQuery = new CamlBuilder()
    //                 .View(["Id", "ID", "Title", "TaskDate", "CompletionDate", "SubLocation", "Area", "WorkType", "Frequency",
    //                     "Week", "Month", "Year", "JobCompletion", "SiteNameId", "EventNumber", "Hours", "Cost", "StaffNumber", 
    //                     "IsCompleted", "IsNotification", "Comment"])
    //                 .Scope(CamlBuilder.ViewScope.RecursiveAll)
    //                 .RowLimit(5000, true)
    //                 .Query()
    //                 .Where()
    //                 .LookupField("SiteName").Id().EqualTo(Number(props.siteMasterId))
    //                 // .And()
    //                 // .BooleanField("IsDeleted").IsFalse()
    //                 .And()
    //                 .NumberField("ID").In(props.componentProp.editItemId)
    //                 .ToString()
    //             let data = await provider.getItemsByCAMLQuery(ListNames.Periodic, camlQuery, { SortField: "ID", SortDir: "Asc" })
    //             if (!!data && data.length > 0) {
    //                 data = data.filter((i: any) => i.IsDeleted == undefined || i.IsDeleted != true)
    //                 items = data.map((i: any, index) => {
    //                     return {
    //                         Id: !!i.ID ? Number(i.ID) : 0,
    //                         Title: !!i.Title ? i.Title : "",
    //                         TaskDate: !!i.TaskDate ? new Date(i.TaskDate) : undefined,
    //                         CompletionDate: !!i.CompletionDate ? new Date(i.CompletionDate) : undefined,
    //                         SubLocation: !!i.SubLocation ? i.SubLocation : "",
    //                         Area: !!i.Area ? i.Area : "",
    //                         WorkType: !!i.WorkType ? i.WorkType : "",
    //                         Frequency: !!i.Frequency ? i.Frequency : "",
    //                         Week: !!i.Week ? i.Week : "",
    //                         Month: !!i.Month ? i.Month : "",
    //                         Year: !!i.Year ? i.Year : "",
    //                         // ReportHelpDesk: i?.ReportHelpDesk == "Yes" ? true : false,
    //                         SiteNameId: !!i.SiteName ? i.SiteName[0].lookupId : null,
    //                         JobCompletion: !!i.JobCompletion ? i.JobCompletion : "",
    //                         EventNumber: !!i.EventNumber ? i.EventNumber : "",
    //                         Hours: !!i.Hours ? i.Hours : "",
    //                         Cost: !!i.Cost ? parseFloat(i.Cost.toString().replace(/[$,]/g, '')) : "",
    //                         StaffNumber: !!i.StaffNumber ? i.StaffNumber : "",
    //                         IsNotification: i?.IsNotification == "Yes" ? true : false,
    //                         IsCompleted: i?.IsCompleted == "Yes" ? true : false,
    //                         indexNumber: index,
    //                         Comment: i?.Comment ? i?.Comment : ""
    //                     }
    //                 })
    //             }
    //         }
    //         return items;

    //     } catch (error) {
    //         let errorLogObj: any = {
    //             ErrorMessage: "",
    //             Title: "HelpDeskInLineEditData",
    //             PageName: "QuayClean.aspx",
    //             ErrorMethodName: "getHelpDeskItem",
    //             FileName: "HelpDeskInLineEditData",
    //             Error: `${error}`
    //         }
    //         console.log(errorLogObj);
    //     }

    // }
    const getPeriodicItem = async () => {
        try {
            let items: IAddHelpDeskItem[] = [defaultItem];

            if (props.componentProp.editItemId) {

                // -------------------- PNP QUERY --------------------
                const select = [
                    "ID",
                    "Title",
                    "TaskDate",
                    "CompletionDate",
                    "SubLocation",
                    "Area",
                    "WorkType",
                    "Frequency",
                    "Week",
                    "Month",
                    "Year",
                    "JobCompletion",
                    "SiteNameId",
                    "SiteName/Title",
                    "EventNumber",
                    "Hours",
                    "Cost",
                    "StaffNumber",
                    "IsCompleted",
                    "IsDeleted",
                    "IsNotification",
                    "Comment",
                    "AttachmentFiles"
                ];

                // Build filter: SiteNameId + multiple ID values
                const idsFilter = props.componentProp.editItemId
                    .map((id: number) => `ID eq ${id}`)
                    .join(" or ");

                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    expand: ["SiteName,AttachmentFiles"],
                    listName: ListNames.Periodic,
                    filter: `SiteNameId eq ${props.siteMasterId} and (${idsFilter})`
                };
                // ------------ Fetch with PnP -------------
                let data = await provider.getItemsByQuery(queryStringOptions);

                // -------------------- MAP RESULT --------------------
                if (data?.length > 0) {
                    data = data.filter((i: any) => i.IsDeleted === undefined || i.IsDeleted !== true);

                    items = data.map((i: any, index: number) => ({
                        Id: i.ID ?? 0,
                        Title: i.Title ?? "",
                        TaskDate: i.TaskDate ? new Date(i.TaskDate) : undefined,
                        CompletionDate: i.CompletionDate ? new Date(i.CompletionDate) : undefined,
                        SubLocation: i.SubLocation ?? "",
                        Area: i.Area ?? "",
                        WorkType: i.WorkType ?? "",
                        Frequency: i.Frequency ?? "",
                        Week: i.Week ?? "",
                        Month: i.Month ?? "",
                        Year: i.Year ?? "",
                        SiteNameId: i.SiteNameId ?? null,
                        JobCompletion: i.JobCompletion ?? "",
                        EventNumber: i.EventNumber ?? "",
                        Hours: i.Hours ?? "",
                        Cost: i.Cost ? parseFloat(i.Cost.toString().replace(/[$,]/g, "")) : "",
                        StaffNumber: i.StaffNumber ?? "",
                        IsNotification: i.IsNotification === "Yes" || i.IsNotification === true,
                        IsCompleted: i.IsCompleted === "Yes" || i.IsCompleted === true,
                        indexNumber: index,
                        Comment: i.Comment ?? "",
                        attachments: i.AttachmentFiles || []    // ⭐ Now attachments available
                    }));
                }
            }

            return items;

        } catch (error) {
            console.log({
                ErrorMessage: "",
                Title: "HelpDeskInLineEditData",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "getHelpDeskItem",
                FileName: "HelpDeskInLineEditData",
                Error: `${error}`
            });
        }
    };


    const handlePaste = (e: React.ClipboardEvent) => {
        const clipboardData = e.clipboardData.getData('text');
        const parsed = clipboardData
            .split('\n')
            .map(line => line.trim().split('\t'))
            .filter(arr => arr.length > 1);
        if (parsed.length > 0) {
            e.preventDefault();
            const newRows: any[] = parsed
                .map(([Area, SubLocation, WorkType, Title, Frequency, Week, Month, Year, JobCompletion, TaskDate, CompletionDate, EventNumber, Hours, Cost, StaffNumber]) => {
                    let selectedDate = (() => { const [d, m, y] = TaskDate.split('/'); return new Date(`${y}-${m}-${d}`); })();
                    let selectedDate2 = (() => { const [d, m, y] = CompletionDate.split('/'); return new Date(`${y}-${m}-${d}`); })();
                    return {
                        Id: generateId(),
                        Area: Area,
                        SubLocation: SubLocation,
                        WorkType: WorkType,
                        Title: Title,
                        Frequency: Frequency,
                        Week: Week,
                        Month: Month,
                        Year: Year,
                        JobCompletion: JobCompletion,
                        TaskDate: selectedDate || null,
                        CompletionDate: selectedDate2 || null,
                        EventNumber: EventNumber,
                        Hours: Hours,
                        Cost: Cost,
                        StaffNumber: StaffNumber,
                        isNew: true
                    };
                });

            setPeriodicItems(prev => {
                const cleanedPrev = [...prev];
                const last = cleanedPrev[cleanedPrev.length - 1];
                const isLastEmpty = last && !last.Area && !last.SubLocation && !last.WorkType && !last.Title && !last.Frequency &&
                    !last.Week && !last.Month && !last.Year && !last.JobCompletion && !last.TaskDate && !last.CompletionDate && !last.EventNumber &&
                    !last.Hours && !last.Cost && !last.StaffNumber && !last.Hours;
                if (isLastEmpty) cleanedPrev.pop();

                return [...cleanedPrev, ...newRows];
            });
        }

    };

    const onClickRedirect = () => {
        if (isSiteLevelComponent) {
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                selectedZoneDetails: selectedZoneDetails,
                isShowDetailOnly: true,
                pivotName: "ManagePeriodicListKey",
            });
        }
        else {
            const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
            props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProp?.qCStateId, dataObj: props.componentProp.dataObj2, breadCrumItems: breadCrumItems, siteMasterId: props.siteMasterId, isShowDetailOnly: true, siteName: props.componentProp.siteName, qCState: props.componentProp.qCState, pivotName: "ManagePeriodicListKey" });
        }


    };

    const deleteSelectedAllData = () => {
        setDeleteItem({
            Id: "",
            isNew: true
        });
        setConfirmationMsg('Messages.DeleteConfirm');
        toggleHideDialog();
        toggleHideConfirmationDialog();
    };

    // const deleteSelectedData = (ID: any, isNew: any) => {
    //     setDeleteItem({
    //         Id: ID,
    //         isNew: isNew
    //     });
    //     setConfirmationMsg('');
    //     toggleHideDialog();
    //     toggleHideConfirmationDialog();
    // };

    const deleteSelectedData = async (id: number, isNew: boolean) => {
        setIsLoading(true);

        await deleteAllItems([{ Id: id, isNew }]); // pass object

        setIsLoading(false);
    };

    // const savePeriodicData = (objFormData: any) => {
    //     const toastId = toastService.loading('Loading...');
    //     const toastMessage = 'Periodic has been added successfully!';
    //     const tempId = objFormData.Id;
    //     delete objFormData.Id;
    //     delete objFormData.isNew;
    //     const createdata: any = {
    //         Title: objFormData.Title,
    //         Cost: objFormData?.Cost ? parseFloat(objFormData.Cost.toString().replace(/[$,]/g, '')) : 0,
    //         TaskDate: !!objFormData?.TaskDate ? objFormData.TaskDate : undefined,
    //         CompletionDate: !!objFormData?.CompletionDate ? objFormData.CompletionDate : undefined,
    //         Area: !!objFormData?.Area ? objFormData.Area : "",
    //         Frequency: !!objFormData?.Frequency ? objFormData.Frequency : "",
    //         JobCompletion: !!objFormData?.JobCompletion ? objFormData.JobCompletion : "",
    //         Week: objFormData?.Week?.value ?? objFormData?.Week ?? "",
    //         Month: objFormData?.Month?.value ?? objFormData?.Month ?? "",
    //         Year: objFormData?.Year?.value ?? objFormData?.Year ?? "",
    //         SiteNameId: !!props.siteMasterId ? props.siteMasterId : 0,
    //         WorkType: !!objFormData?.WorkType ? objFormData.WorkType : "",
    //         EventNumber: !!objFormData?.EventNumber ? objFormData.EventNumber : null,
    //         Hours: !!objFormData?.Hours ? objFormData.Hours : "",
    //         StaffNumber: !!objFormData?.StaffNumber ? objFormData.StaffNumber : "",
    //         IsCompleted: !!objFormData?.IsCompleted ? objFormData.IsCompleted : false,
    //         IsNotification: !!objFormData?.IsNotification ? objFormData.IsNotification : false,
    //         SubLocation: !!objFormData?.SubLocation ? objFormData.SubLocation : "",
    //     };

    //     provider.createItem(createdata, ListNames.Periodic).then(async (response: any) => {
    //         toastService.updateLoadingWithSuccess(toastId, toastMessage);
    //         setIsLoading(false);
    //         setErrorMessages([]);
    //         setDialogState({
    //             dialogHeader: "Success",
    //             dialogMessage: '',
    //             isSuccess: true
    //         });
    //         toggleHideErrorMsgDialog();
    //         setPeriodicItems(prev => {
    //             const updated = [...prev];
    //             const index = updated.findIndex(item => item.Id === tempId);

    //             if (index !== -1) {
    //                 const data = response.data;
    //                 updated[index] = {
    //                     ...updated[index],
    //                     Id: data.ID,
    //                     Month: data.Month,
    //                     Year: data.Year,
    //                     Precinct: data.Precinct,
    //                     MonthAdjustment: data.MonthAdjustment,
    //                     StartDate: data.StartDate,
    //                     DaysInMonth: data.DaysInMonth,
    //                     CLNumber: data.CLNumber,
    //                     BuildingName: data.BuildingName,
    //                     BuildingNumber: data.BuildingNumber,
    //                     Room: data.Room,
    //                     CLDescription: data.CLDescription,
    //                     Approved: data.Approved === true ? true : false,
    //                     isNew: false
    //                 };
    //             }
    //             return updated;
    //         });
    //         onClickRedirect();
    //     });
    // };

    // const updatePeriodicData = (objFormData: any, Id: any) => {

    //     delete objFormData.Id;
    //     delete objFormData.isNew;
    //     objFormData = {
    //         ...objFormData,
    //         StartDate: new Date(objFormData.StartDate)
    //     }

    //     provider.updateItemWithPnP(objFormData, ListNames.Periodic, Id).then(async () => {
    //         setIsLoading(false);
    //         setErrorMessages([]);
    //         setDialogState({
    //             dialogHeader: "Success",
    //             dialogMessage: 'Messages.UpdateVariationTracker',
    //             isSuccess: true
    //         });
    //         toggleHideErrorMsgDialog();
    //         setPeriodicItems(prev =>
    //             prev.map(item =>
    //                 item.Id === Id
    //                     ? {
    //                         ...item,
    //                         ...objFormData,
    //                         Id,
    //                         isNew: false
    //                     }
    //                     : item
    //             )
    //         );
    //         // loadItems(selectedMonth, selectedYear);
    //     });
    // };

    // const validationFields = [
    //     {
    //         type: [ValidationType.Required],
    //         fieldName: "Title",
    //         displayText: "Title is required"
    //     },
    //     {}
    // ];

    // const onSaveData = (item: any) => {
    //     let objData = {
    //         ...item
    //     };
    //     let objDataArray: any[] = [];
    //     objDataArray[0] = objData;
    //     let allValid = true;
    //     const requiredFields = ["Title", "TaskDate", "Frequency", "Area", "Week", "Month", "Year"];
    //     const validatePeriodicItems = (items: any[]): string => {
    //         for (let item of items) {
    //             for (let field of requiredFields) {
    //                 if (
    //                     item[field] === null ||
    //                     item[field] === undefined ||
    //                     item[field].toString().trim() === ""
    //                 ) {
    //                     allValid = false;
    //                     return "Please fill all required fields";
    //                 }
    //             }
    //         }
    //         return "";
    //     };
    //     const validationMessage: string = validatePeriodicItems(objDataArray);
    //     if (!allValid) {
    //         setState(prevState => ({ ...prevState, isFormValidationModelOpen: true, validationMessage: validationMessage, isLoading: false }));
    //     } else {
    //         setIsLoading(true);
    //         if (props?.componentProp?.IsUpdate) {
    //             updatePeriodicData(objData, item.Id);
    //         } else {
    //             savePeriodicData(objData);
    //         }
    //         // if (item.isNew) {
    //         // } else {
    //         // }
    //     }
    // };

    // const saveAllData = async () => {
    //     let allValid = true;
    //     const requiredFields = ["Title", "TaskDate", "Frequency", "Area", "Week", "Month", "Year"];
    //     const validatePeriodicItems = (items: any[]): string => {
    //         for (let item of items) {
    //             for (let field of requiredFields) {
    //                 if (
    //                     item[field] === null ||
    //                     item[field] === undefined ||
    //                     item[field].toString().trim() === ""
    //                 ) {
    //                     allValid = false;
    //                     return "Please fill all required fields";
    //                 }
    //             }
    //         }
    //         return "";
    //     };
    //     const validationMessage: string = validatePeriodicItems(periodicItems);


    //     if (!allValid) {
    //         setState(prevState => ({ ...prevState, isFormValidationModelOpen: true, validationMessage: validationMessage, isLoading: false }));
    //     } else {
    //         setIsLoading(true);
    //         let newRecords: any[] = [];
    //         let updateRecords: any[] = [];
    //         if (props?.componentProp?.IsUpdate) {
    //             // let updateRecords = periodicItems.filter(item => !item.isNew);
    //             updateRecords = periodicItems.map(({ StartDate, indexNumber, isNew, ...rest }) => ({
    //                 ...rest,
    //                 Cost: parseFloat(rest.Cost.toString().replace(/[$,]/g, '')),
    //                 SiteNameId: !!props.siteMasterId ? props.siteMasterId : 0,
    //                 Week: rest?.Week?.value ?? rest?.Week ?? "",
    //                 Month: rest?.Month?.value ?? rest?.Month ?? "",
    //                 Year: rest?.Year?.value ?? rest?.Year ?? "",
    //                 IsNotification: rest?.IsNotification === "No" || rest?.IsNotification == null || rest?.IsNotification === false ? false : true,
    //                 IsCompleted: rest?.IsCompleted === "No" || rest?.IsCompleted == null || rest?.IsCompleted === false ? false : true
    //             }));
    //         } else {
    //             // let newRecords = periodicItems.filter(item => item.isNew);
    //             newRecords = periodicItems.map(({ Id, StartDate, indexNumber, isNew, ...rest }) => ({
    //                 ...rest,
    //                 Cost: parseFloat(rest.Cost.toString().replace(/[$,]/g, '')),
    //                 SiteNameId: !!props.siteMasterId ? props.siteMasterId : 0,
    //                 Week: rest?.Week?.value ?? rest?.Week ?? "",
    //                 Month: rest?.Month?.value ?? rest?.Month ?? "",
    //                 Year: rest?.Year?.value ?? rest?.Year ?? "",
    //             }));
    //         }

    //         try {
    //             const promises = [];
    //             if (newRecords.length > 0) {
    //                 const toastId = toastService.loading('Loading...');
    //                 const toastMessage = 'Periodic has been added successfully!';
    //                 promises.push(provider.createItemInBatch(newRecords, ListNames.Periodic));
    //                 toastService.updateLoadingWithSuccess(toastId, toastMessage);
    //             }
    //             if (updateRecords.length > 0) {
    //                 const toastId = toastService.loading('Loading...');
    //                 const toastMessage = 'Periodic has been updated successfully!';
    //                 promises.push(provider.updateListItemsInBatchPnP(ListNames.Periodic, updateRecords));
    //                 toastService.updateLoadingWithSuccess(toastId, toastMessage);
    //             }

    //             await Promise.all(promises);
    //             // await loadItems(selectedMonth, selectedYear);
    //             setIsLoading(false);
    //             onClickRedirect();
    //             setErrorMessages([]);
    //             setDialogState({
    //                 dialogHeader: "Success",
    //                 dialogMessage: 'Messages.AddAllVariationTracker',
    //                 isSuccess: true
    //             });
    //             toggleHideErrorMsgDialog();
    //         } catch (error) {
    //             setDialogState({
    //                 dialogHeader: "Error",
    //                 dialogMessage: "An error occurred while saving data. Please try again.",
    //                 isSuccess: false
    //             });
    //         }
    //     }
    // };

    const saveAllData = async () => {
        let allValid = true;
        const requiredFields = ["Title", "TaskDate", "Frequency", "Area", "Week", "Month", "Year"];

        const validatePeriodicItems = (items: any[]): string => {
            for (let item of items) {
                for (let field of requiredFields) {
                    if (
                        item[field] === null ||
                        item[field] === undefined ||
                        item[field].toString().trim() === ""
                    ) {
                        allValid = false;
                        return "Please fill all required fields";
                    }
                }
            }
            return "";
        };

        const validationMessage: string = validatePeriodicItems(periodicItems);

        if (!allValid) {
            setState(prev => ({
                ...prev,
                isFormValidationModelOpen: true,
                validationMessage,
                isLoading: false
            }));
            return;
        }

        setIsLoading(true);

        let newRecords: any[] = [];
        let updateRecords: any[] = [];
        let newRecordAttachments: any[] = [];
        // -------------------- SPLIT NEW / UPDATE --------------------
        if (props?.componentProp?.IsUpdate) {
            updateRecords = periodicItems.map(({ StartDate, indexNumber, isNew, attachments, newFiles, ...rest }) => ({
                ...rest,
                Cost: parseFloat(rest.Cost.toString().replace(/[$,]/g, "")),
                SiteNameId: props.siteMasterId ?? 0,
                Week: rest?.Week?.value ?? rest?.Week ?? "",
                Month: rest?.Month?.value ?? rest?.Month ?? "",
                Year: rest?.Year?.value ?? rest?.Year ?? "",
                IsNotification: !!rest?.IsNotification,
                IsCompleted: !!rest?.IsCompleted,

                // keep files for later upload, NOT for SharePoint update
                attachments,
                __newFiles: newFiles
            }));
        } else {
            newRecords = periodicItems.map(
                ({ Id, StartDate, indexNumber, isNew, newFiles, __newFiles, ...rest }) => {

                    // Store newFiles separately so we can upload later
                    newRecordAttachments.push(newFiles || []);

                    const clean = { ...rest };

                    delete clean["indexNumber"];
                    delete clean["isNew"];
                    delete clean["StartDate"];
                    delete clean["attachments"];
                    delete clean["newFiles"];
                    delete clean["__newFiles"];

                    return {
                        ...clean,
                        Cost: parseFloat(rest.Cost.toString().replace(/[$,]/g, "")),
                        SiteNameId: props.siteMasterId ?? 0,
                        Week: rest?.Week?.value ?? rest?.Week ?? "",
                        Month: rest?.Month?.value ?? rest?.Month ?? "",
                        Year: rest?.Year?.value ?? rest?.Year ?? ""
                    };
                }
            );
        }

        try {
            // ======================================================
            //                CREATE NEW RECORDS
            // ======================================================
            if (newRecords.length > 0) {
                const toastId = toastService.loading("Loading...");
                const toastMessage = "Periodic has been added successfully!";

                const createdItems = await provider.createItemInBatch(newRecords, ListNames.Periodic);
                toastService.updateLoadingWithSuccess(toastId, toastMessage);

                // Upload attachments for new items
                for (let i = 0; i < createdItems.length; i++) {
                    const itemId = createdItems[i].data.Id;
                    const files = newRecordAttachments[i];

                    if (files && files.length > 0) {
                        const preparedFiles = await Promise.all(
                            files.map(async (file: File) => ({
                                name: file.name,
                                fileContent: await file.arrayBuffer()
                            }))
                        );

                        await provider.addMultipleAttachment(ListNames.Periodic, itemId, preparedFiles);
                    }
                }
            }

            // ======================================================
            //                UPDATE EXISTING RECORDS
            // ======================================================
            if (updateRecords.length > 0) {
                const toastId = toastService.loading("Loading...");
                const toastMessage = "Periodic has been updated successfully!";

                // ---- CLEAN OUT NON-SP FIELDS ----
                const updatePayload = updateRecords.map(r => {
                    const clean = { ...r };

                    delete clean["attachments"];
                    delete clean["newFiles"];
                    delete clean["__newFiles"];
                    delete clean["indexNumber"];
                    delete clean["isNew"];

                    return clean;
                });

                // ---- UPDATE ITEMS ----
                await provider.updateListItemsInBatchPnP(ListNames.Periodic, updatePayload);
                toastService.updateLoadingWithSuccess(toastId, toastMessage);

                // ---- UPLOAD NEW ATTACHMENTS ----
                for (let i = 0; i < updateRecords.length; i++) {
                    const record = updateRecords[i];
                    const itemId = record.Id;

                    const newFiles = record.__newFiles || [];
                    if (newFiles.length > 0) {
                        const preparedFiles = await Promise.all(
                            newFiles.map(async (file: File) => ({
                                name: file.name,
                                fileContent: await file.arrayBuffer()
                            }))
                        );

                        await provider.addMultipleAttachment(ListNames.Periodic, itemId, preparedFiles);
                    }
                }
            }

            // ---------------- FINISH ----------------
            setIsLoading(false);
            onClickRedirect();
            setErrorMessages([]);
            setDialogState({
                dialogHeader: "Success",
                dialogMessage: "Messages.AddAllVariationTracker",
                isSuccess: true
            });
            toggleHideErrorMsgDialog();

        } catch (error) {
            console.error("Save error:", error);
            setDialogState({
                dialogHeader: "Error",
                dialogMessage: "An error occurred while saving data. Please try again.",
                isSuccess: false
            });
            setIsLoading(false);
        }
    };

    const updateCellData = React.useCallback((rowId: number, columnId: string, value: any) => {
        setPeriodicItems((prevData: any) => {
            const updatedData = [...prevData];
            let updatedItem: any;
            const indexToUpdate = updatedData.findIndex((item: any) => item.Id === rowId);
            if (indexToUpdate !== -1) {
                updatedItem = { ...updatedData[indexToUpdate], [columnId]: value };
                updatedData[indexToUpdate] = updatedItem;
            }
            return updatedData;
        });
    }, []);

    const cancelClick = (): void => {
        setErrorMessages([]);
        toggleHideErrorMsgDialog();
    };

    const confirmYes = async () => {
        setIsLoading(true);
        if (deleteItem.Id) {
            deleteRowData(deleteItem.Id, deleteItem.isNew);
        } else {
            deletedData(delselectedItem);
        };
        setDeleteItem({
            Id: "",
            isNew: true
        });
        toggleHideConfirmationDialog();

    };
    const _confirmDeleteItem = async () => {
        setIsLoading(true);
        if (deleteItem.Id) {
            deleteRowData(deleteItem.Id, deleteItem.isNew);
        } else {
            deletedData(delselectedItem);
        };
        setDeleteItem({
            Id: "",
            isNew: true
        });
        toggleHideDialog();
        toggleHideConfirmationDialog();
    };

    const deleteItemById = async (id: number, isNew: boolean) => {
        if (isNew) return;

        try {
            await provider.deleteItem(ListNames.Periodic, id);
        } catch (error) {
            console.error(`Failed to delete item with ID ${id}`, error);
        }
    };

    const deleteAllItems = async (deleteItems: any[]) => {
        try {
            // First delete from SharePoint only items that are NOT new
            const deletePromises = deleteItems
                .filter(item => !item.isNew)
                .map(item => deleteItemById(item.Id, item.isNew));

            await Promise.all(deletePromises);

            // Update UI: remove all (new + old)
            setPeriodicItems(prev =>
                prev.filter(item => !deleteItems.some(d => d.Id === item.Id))
            );

            setIsLoading(false);
            setErrorMessages([]);

            setDialogState({
                dialogHeader: "Success",
                dialogMessage: "Messages.DeleteAllVariationTracker",
                isSuccess: true,
            });

            toggleHideErrorMsgDialog();
        } catch (error) {
            console.error("Error deleting items:", error);
        }
    };
    // const deleteAllItems = async (deleteAllIds: any[]) => {
    //     try {
    //         const deletePromises = deleteAllIds.map((id: any) => deleteItemById(id));
    //         await Promise.all(deletePromises);
    //         setPeriodicItems(prev =>
    //             prev.filter(item => !deleteAllIds.includes(item.Id))
    //         );
    //         setIsLoading(false);
    //         setErrorMessages([]);
    //         setDialogState({
    //             dialogHeader: "Success",
    //             dialogMessage: 'Messages.DeleteAllVariationTracker',
    //             isSuccess: true
    //         });
    //         toggleHideErrorMsgDialog();
    //         // loadItems(selectedMonth, selectedYear);
    //     } catch (error) {
    //         console.error('Error deleting items:', error);
    //     }
    // };

    const deletedData = async (items: any[]) => {
        setIsLoading(true);
        await deleteAllItems(items);  // send objects, not IDs
    };

    const handleRowSelection = React.useCallback((rowId: number, isChecked: boolean, row) => {
        setdelselectedItem((prevSelectedRows: any) => {
            const updatedData = [...prevSelectedRows];
            let updatedItem: any = updatedData;
            if (isChecked) {
                updatedItem.push(row);
            } else {
                updatedItem = updatedData.filter(itm => itm.Id !== rowId);
            }
            return updatedItem;
        });

        setSelectedRows((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (isChecked) {
                newSelected.add(rowId);
            } else {
                newSelected.delete(rowId);
            }
            return newSelected;
        });

    }, []);

    const deleteRowData = (Id: any, isNew?: boolean) => {
        if (isNew) {
            const updatedItems = periodicItems.filter((item: any) => item.Id !== Id);
            setPeriodicItems(updatedItems);
            setIsLoading(false);
        } else {
            provider.deleteItem(ListNames.PeriodicHistory, Id).then(async () => {
                setPeriodicItems(prev =>
                    prev.filter(item => item.Id !== Id)
                );
                setIsLoading(false);
                setErrorMessages([]);
                setDialogState({
                    dialogHeader: "Success",
                    dialogMessage: 'Messages.DeleteVariationTracker',
                    isSuccess: true
                });
                toggleHideErrorMsgDialog();
                // loadItems(selectedMonth, selectedYear);
            }).catch((err: any) => {
                console.log(err);
                setIsLoading(false);
            });
        }

    };
    const onChangeTitle = (event: any): void => {
        settitle(event.target.value);
    };
    const onClickClose = (): void => {
        settitle("");
        hidePopup();
    };
    const _closeDeleteConfirmation = () => {
        toggleHideDialog();
    };
    const onClick_SavePeriodic = async (evt: { preventDefault: () => void; }) => {
        try {
            const elementExists = AddedValues.includes(title);
            if (!elementExists) {
                const data: any = {
                    Title: ChoiceTitle.current,
                    ChoiceValue: title,
                    SiteNameId: props?.siteMasterId,
                    IsActive: true
                };
                await props.provider.createItem(data, ListNames.PeriodicChoices).then(async (item: any) => {
                    console.log("Insert Successfully");
                    // props.onPeriodicChange(title);
                    onClickClose();
                }).catch((err: any) => console.log(err));
            } else {
                props.onPeriodicChange(title);
                onClickClose();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const openAttachmentManager = (row: any) => {
        setCurrentAttachmentRow(row);
        setIsAttachmentModalOpen(true);
    };

    const onSelectNewFiles = async (e: any) => {
        const files: File[] = Array.from(e.target.files || []) as File[];
        if (files.length === 0) return;

        const validFiles: File[] = [];
        const invalidFiles: string[] = [];

        for (const file of files) {
            // ---------- DUPLICATE CHECK ----------
            const normalizeName = (name: string): string =>
                name.split("?")[0].toLowerCase().trim();

            const fileLowerName = normalizeName(file.name);

            const existingNewFiles = (currentAttachmentRow.newFiles || []).map(
                (f: File) => normalizeName(f.name)
            );

            const existingAttachmentFiles = (currentAttachmentRow.attachments || []).map(
                (file: any) => normalizeName(file.FileName || "")
            );

            const isDuplicate =
                existingNewFiles.includes(normalizeName(fileLowerName)) ||
                existingAttachmentFiles.includes(normalizeName(fileLowerName));

            if (isDuplicate) {
                invalidFiles.push(`${file.name} (duplicate)`);
                continue;
            }

            // Type validation
            const isImage = file.type.startsWith("image/");
            const isPDF = file.type === "application/pdf";

            if (!isImage && !isPDF) {
                invalidFiles.push(`${file.name} (invalid file type)`);
                continue;
            }

            const cleaned = new File([file], file.name.replace(/\s+/g, "_"), {
                type: file.type
            });

            validFiles.push(cleaned);
        }

        // INVALID FILES FOUND → Show your existing validation popup
        if (invalidFiles.length > 0) {
            setState(prev => ({
                ...prev,
                isFormValidationModelOpen: true,
                validationMessage: [
                    "Only images & PDFs are allowed. Duplicate files not allowed.",
                    ...invalidFiles
                ]
            }));

            e.target.value = "";
            return;
        }

        // 1. Update modal UI state
        setCurrentAttachmentRow((prev: any) => ({
            ...prev,
            newFiles: [...(prev?.newFiles || []), ...validFiles]
        }));

        // 2. Update main table row state
        updateCellData(currentAttachmentRow.Id, "newFiles", [
            ...(currentAttachmentRow.newFiles || []),
            ...validFiles
        ]);

        e.target.value = "";
    };

    const requestDeleteFile = (fileName: string) => {
        setFileToDelete(fileName);
        setConfirmFileDelete(true);   // Open confirmation modal
    };

    // const confirmDeleteExistingFile = () => {
    //     if (!fileToDelete) return;

    //     // UPDATE MODAL
    //     setCurrentAttachmentRow((prev: any) => ({
    //         ...prev,
    //         attachments: prev.attachments.filter((a: any) => a.FileName !== fileToDelete),
    //         removedExistingFiles: [
    //             ...(prev.removedExistingFiles || []),
    //             fileToDelete,
    //         ]
    //     }));

    //     // UPDATE TABLE
    //     updateCellData(
    //         currentAttachmentRow.Id,
    //         "attachments",
    //         currentAttachmentRow.attachments.filter((a: any) => a.FileName !== fileToDelete)
    //     );

    //     updateCellData(
    //         currentAttachmentRow.Id,
    //         "removedExistingFiles",
    //         [
    //             ...(currentAttachmentRow.removedExistingFiles || []),
    //             fileToDelete
    //         ]
    //     );

    //     // Close modal
    //     setConfirmFileDelete(false);
    //     setFileToDelete(null);
    // };

    const confirmDeleteExistingFile = async () => {
        if (!fileToDelete) return;

        try {
            setIsLoading(true);

            const itemId = currentAttachmentRow.Id;
            const listName = ListNames.Periodic;

            // 1️⃣ DELETE FROM SHAREPOINT IMMEDIATELY
            await provider.deleteAttachment(listName, itemId, fileToDelete);

            // 2️⃣ UPDATE MODAL STATE (remove file from attachments)
            setCurrentAttachmentRow((prev: any) => ({
                ...prev,
                attachments: prev.attachments.filter((a: any) => a.FileName !== fileToDelete),
            }));

            // 3️⃣ UPDATE TABLE
            updateCellData(
                itemId,
                "attachments",
                currentAttachmentRow.attachments.filter((a: any) => a.FileName !== fileToDelete)
            );

        } catch (err) {
            console.error("Error deleting attachment:", err);
        } finally {
            // Close modal
            setConfirmFileDelete(false);
            setFileToDelete(null);
            setIsLoading(false);
        }
    };
    const cancelDeleteExistingFile = () => {
        setConfirmFileDelete(false);
        setFileToDelete(null);
    };

    const removeNewFile = (index: number) => {
        const updated = currentAttachmentRow.newFiles.filter((_: any, i: number) => i !== index);

        // UPDATE MODAL
        setCurrentAttachmentRow((prev: any) => ({
            ...prev,
            newFiles: updated
        }));

        // UPDATE TABLE
        updateCellData(currentAttachmentRow.Id, "newFiles", updated);
    };

    return {
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
        heightOfContainer,
        setSelectedRows,
        setdelselectedItem,
        selectedRows,
        handleRowSelection,
        updateCellData,
        // onSaveData,
        dialogState,
        toggleHideErrorMsgDialog,
        hideErrorMsgDialog,
        errorMessages,
        cancelClick,
        deleteSelectedAllData,
        confirmationMsg,
        hideConfirmationDialog,
        toggleHideConfirmationDialog,
        confirmYes,
        deleteSelectedData,
        saveAllData,
        handlePaste,
        onClickAddPopUp,
        newItemRef,
        openAttachmentManager,
        onSelectNewFiles,
        removeNewFile,
        isAttachmentModalOpen,
        currentAttachmentRow,
        setIsAttachmentModalOpen,
        requestDeleteFile,
        confirmFileDelete,
        cancelDeleteExistingFile,
        fileToDelete,
        confirmDeleteExistingFile,
        onClickRedirect
    }
};