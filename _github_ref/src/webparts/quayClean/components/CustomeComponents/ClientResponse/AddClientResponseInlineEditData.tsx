/* eslint-disable  */
import * as React from "react";
import { useBoolean } from "@fluentui/react-hooks";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { generateId, getTableHeight, onlyDeleteThumbNail, removeElementOfBreadCrum, saveThumbNailImage } from "../../../../../Common/Util";
import { ComponentNameEnum, ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { ValidationType } from "../../CommonComponents/Validation 1";
import { IHelpDeskInLineEditDataState } from "../HelpDesk/HelpDeskInLineEditData";
import { IAddHelpDeskItem } from "../../../../../Interfaces/IAddNewHelpDesk";
import CamlBuilder from "camljs";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import { toastService } from "../../../../../Common/ToastService";
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');

interface IDialogMessageState {
    dialogHeader: string;
    dialogMessage: string;
    isSuccess: boolean;
}

export const AddClientResponseInlineEditData = (props: any) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context } = appGlobalState;
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
    const [BeforeImage1Deleted, setBeforeImage1Deleted] = React.useState<boolean>(false);
    const [BeforeImage2Deleted, setBeforeImage2Deleted] = React.useState<boolean>(false);
    const [AfterImage1Deleted, setAfterImage1Deleted] = React.useState<boolean>(false);
    const [AfterImage2Deleted, setAfterImage2Deleted] = React.useState<boolean>(false);

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
        LogInTime: undefined as any,
        Location: "",
        SubLocation: "",
        Request: "",
        WhoAreInvolved: "",
        BeforeImage1: "",
        BeforeImage2: "",
        AfterImage1: "",
        AfterImage2: "",
        HasTheSolutionWorked: false,
        IsCompleted: false,
        CleaningFeedback: "",
        indexNumber: 0,
    }
    const onClickAddPopUp = (title: string) => {
        ChoiceTitle.current = title;
        showPopup();
        // setState((prevState) => ({ ...prevState, addPopUpTitle: title, isAddPopUP: true }))
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
        if (!last || last.Title || last.LogInTime || last.Location || last.SubLocation || last.Request || last.WhoAreInvolved || last.BeforeImage1 ||
            last.BeforeImage2 || last.AfterImage1 || last.AfterImage2 || last.HasTheSolutionWorked || last.IsCompleted ||
            last.CleaningFeedback
        ) {

            setPeriodicItems([...periodicItems, {
                Id: generateId(),
                LogInTime: undefined,
                Title: "",
                Location: "",
                SubLocation: "",
                Request: "",
                WhoAreInvolved: "",
                BeforeImage1: null,
                BeforeImage2: null,
                AfterImage1: null,
                AfterImage2: null,
                HasTheSolutionWorked: false,
                IsCompleted: false,
                CleaningFeedback: "",
                isNew: true
            }]);

            setTimeout(() => {
                newItemRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                newItemRef.current?.focus?.();
            }, 100);
        };
    };

    const _Update = () => {

    }
    React.useEffect(() => {
        setTimeout(() => {
            textFieldRef.current?.focus?.(); // ✅ Use .focus() safely
        }, 100);
        (async () => {
            try {
                if (props?.componentProp?.originalSiteMasterId) {
                    setState((prevState: any) => ({ ...prevState, isLoading: true }));
                    const [items] = await Promise.all([getPeriodicItem()]);
                    setPeriodicItems(items as any);
                    // setState((prevState: any) => ({ ...prevState, isLoading: false, item: items, EventName: (!!items && items.length > 0) ? items[0].EventName : prevState.EventName, keyUpdate: Math.random() }));
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


    const getPeriodicItem = async () => {
        try {
            let items: IAddHelpDeskItem[] = [defaultItem];
            // if (props.componentProps.isEditMultiple && props.componentProps.editItemId) {
            if (props.componentProp.editItemId) {
                const camlQuery = new CamlBuilder()
                    .View(["Id", "ID", "Title", "SiteNameId", "IsCompleted", "LogInTime", "Area", "Request", "WhoAreInvolved", "HasTheSolutionWorked",
                        "BeforeImage1", "BeforeImage2", "AfterImage1", "AfterImage2", "Building", "Feedback"
                    ])
                    .Scope(CamlBuilder.ViewScope.RecursiveAll)
                    .RowLimit(5000, true)
                    .Query()
                    .Where()
                    .LookupField("SiteName").Id().EqualTo(Number(props?.componentProp?.originalSiteMasterId))
                    // .And()
                    // .BooleanField("IsDeleted").IsFalse()
                    .And()
                    .NumberField("ID").In(props.componentProp.editItemId)
                    .ToString()
                let data = await provider.getItemsByCAMLQuery(ListNames.ClientResponse, camlQuery, { SortField: "ID", SortDir: "Asc" })
                if (!!data && data.length > 0) {
                    data = data.filter((i: any) => i.IsDeleted == undefined || i.IsDeleted != true)
                    items = data.map((i: any, index) => {
                        return {
                            Id: !!i.ID ? Number(i.ID) : 0,
                            Title: !!i.Title ? i.Title : "",
                            SiteNameId: !!i.SiteName ? i.SiteName[0].lookupId : null,
                            LogInTime: !!i.LogInTime ? new Date(i.LogInTime) : undefined,
                            Area: !!i.Area ? i.Area : "",
                            Location: !!i.Area ? i.Area : "",
                            SubLocation: !!i.Building ? i.Building : "",
                            CleaningFeedback: !!i.Feedback ? i.Feedback : "",
                            Request: !!i.Request ? i.Request : "",
                            WhoAreInvolved: !!i.WhoAreInvolved ? i.WhoAreInvolved : "",
                            HasTheSolutionWorked: i?.HasTheSolutionWorked == "Yes" ? true : false,
                            IsCompleted: i?.IsCompleted == "Yes" ? true : false,
                            BeforeImage1: i?.BeforeImage1?.serverRelativeUrl || "",
                            BeforeImage2: i?.BeforeImage2?.serverRelativeUrl || "",
                            AfterImage1: i?.AfterImage1?.serverRelativeUrl || "",
                            AfterImage2: i?.AfterImage2?.serverRelativeUrl || "",
                            indexNumber: index
                        }
                    })
                }
            }
            return items;

        } catch (error) {
            let errorLogObj: any = {
                ErrorMessage: "",
                Title: "HelpDeskInLineEditData",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "getHelpDeskItem",
                FileName: "HelpDeskInLineEditData",
                Error: `${error}`
            }
            console.log(errorLogObj);
        }

    }

    const handlePaste = (e: React.ClipboardEvent) => {
        const clipboardData = e.clipboardData.getData('text');
        const parsed = clipboardData
            .split('\n')
            .map(line => line.trim().split('\t'))
            .filter(arr => arr.length > 1);
        if (parsed.length > 0) {
            e.preventDefault();
            const newRows: any[] = parsed
                .map(([LogInTime, Title, Location, SubLocation, Request, WhoAreInvolved, HasTheSolutionWorked, IsCompleted, CleaningFeedback]) => {
                    let selectedDate = (() => { const [d, m, y] = LogInTime.split('/'); return new Date(`${y}-${m}-${d}`); })();
                    return {
                        Id: generateId(),
                        LogInTime: selectedDate || null,
                        Title: Title,
                        Location: Location,
                        SubLocation: SubLocation,
                        Request: Request,
                        WhoAreInvolved: WhoAreInvolved,
                        HasTheSolutionWorked: HasTheSolutionWorked === "Yes" ? true : false,
                        IsCompleted: IsCompleted === "Yes" ? true : false,
                        CleaningFeedback: CleaningFeedback,
                        isNew: true
                    };
                });

            setPeriodicItems(prev => {
                const cleanedPrev = [...prev];
                const last = cleanedPrev[cleanedPrev.length - 1];
                const isLastEmpty = last && !last.LogInTime && !last.Title && !last.Location && !last.SubLocation && !last.Request &&
                    !last.WhoAreInvolved && !last.HasTheSolutionWorked && !last.IsCompleted && !last.CleaningFeedback;
                if (isLastEmpty) cleanedPrev.pop();

                return [...cleanedPrev, ...newRows];
            });
        }

    };

    const onClickRedirect = () => {
        // const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
        // props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProp?.qCStateId, dataObj: props.componentProp.dataObj2, breadCrumItems: breadCrumItems, siteMasterId: !!props?.componentProp?.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProp.siteName, qCState: props.componentProp.qCState, pivotName: "ClientResponseListKey" });
        const breadCrumItems = removeElementOfBreadCrum(props.componentProp.breadCrumItems || []);
        props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProp?.dataObj?.QCStateId, dataObj: props?.componentProp?.dataObj, breadCrumItems: props?.componentProp?.breadCrumItems, siteMasterId: props?.componentProp?.originalSiteMasterId, isShowDetailOnly: true, siteName: props?.componentProp?.dataObj?.Title, qCState: props?.componentProp?.dataObj?.QCState, pivotName: "ClientResponseListKey" });
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

    const deleteSelectedData = (ID: any, isNew: any) => {
        setDeleteItem({
            Id: ID,
            isNew: isNew
        });
        setConfirmationMsg('');
        toggleHideDialog();
        toggleHideConfirmationDialog();
    };

    const uploadFileAndUpdateObject = async (selectedImage: IFileWithBlob[], isUpdate?: boolean, oldImgUrl?: string) => {
        let data: any = {
            Photo: JSON.stringify({ serverRelativeUrl: "" }),
            EncodedAbsThumbnailUrl: ""
        };
        if (!!selectedImage || isUpdate) {
            if (isUpdate) {
                if (selectedImage.length > 0) {
                    data = await saveThumbNailImage(provider, selectedImage[0], ListNames.QuaycleanAssets, isUpdate, oldImgUrl);
                } else {
                    if (!!oldImgUrl)
                        data = await onlyDeleteThumbNail(provider, ListNames.QuaycleanAssets, oldImgUrl);
                }
            } else {
                if (selectedImage.length > 0)
                    data = await saveThumbNailImage(provider, selectedImage[0], ListNames.QuaycleanAssets);
            }
            // const fileUpload = await provider.uploadFile(selectedImage[0]);
            return data;
        }
        return '';
    };

    const savePeriodicData = async (objFormData: any) => {
        const toastId = toastService.loading('Loading...');
        const toastMessage = 'Client Response has been added successfully!';
        const tempId = objFormData.Id;
        delete objFormData.Id;
        delete objFormData.isNew;
        let BeforeImage1: any = await uploadFileAndUpdateObject(objFormData?.BeforeImage1);
        let BeforeImage2: any = await uploadFileAndUpdateObject(objFormData?.BeforeImage2);
        let AfterImage1: any = await uploadFileAndUpdateObject(objFormData?.AfterImage1);
        let AfterImage2: any = await uploadFileAndUpdateObject(objFormData?.AfterImage2);
        let BI1 = BeforeImage1?.Photo;
        let BI2 = BeforeImage2?.Photo;
        let AI1 = AfterImage1?.Photo;
        let AI2 = AfterImage2?.Photo;

        let BI1ThumbnailUrl = BeforeImage1?.EncodedAbsThumbnailUrl;
        let BI2ThumbnailUrl = BeforeImage2?.EncodedAbsThumbnailUrl;
        let AI1ThumbnailUrl = AfterImage1?.EncodedAbsThumbnailUrl;
        let AI2ThumbnailUrl = AfterImage2?.EncodedAbsThumbnailUrl;
        const createdata: any = {
            Title: objFormData.Title,
            LogInTime: !!objFormData?.LogInTime ? objFormData.LogInTime : undefined,
            Area: objFormData?.Location?.value ?? objFormData?.Location ?? "",
            Building: objFormData?.SubLocation?.value ?? objFormData?.SubLocation ?? "",
            WhoAreInvolved: objFormData?.WhoAreInvolved?.value ?? objFormData?.WhoAreInvolved ?? "",
            Request: !!objFormData?.Request ? objFormData.Request : "",
            BeforeImage1: BI1 ? BI1 : "",
            BeforeImage2: BI2 ? BI2 : "",
            AfterImage1: AI1 ? AI1 : "",
            AfterImage2: AI2 ? AI2 : "",
            BeforeImage1ThumbnailUrl: BI1ThumbnailUrl ? BI1ThumbnailUrl : "",
            BeforeImage2ThumbnailUrl: BI2ThumbnailUrl ? BI2ThumbnailUrl : "",
            AfterImage1ThumbnailUrl: AI1ThumbnailUrl ? AI1ThumbnailUrl : "",
            AfterImage2ThumbnailUrl: AI2ThumbnailUrl ? AI2ThumbnailUrl : "",
            SiteNameId: !!props?.componentProp?.originalSiteMasterId ? props?.componentProp?.originalSiteMasterId : null,
            IsCompleted: !!objFormData?.IsCompleted ? objFormData.IsCompleted : false,
            Feedback: !!objFormData?.CleaningFeedback ? objFormData.CleaningFeedback : "",
        };

        provider.createItem(createdata, ListNames.ClientResponse).then(async (response: any) => {
            toastService.updateLoadingWithSuccess(toastId, toastMessage);
            setIsLoading(false);
            setErrorMessages([]);
            setDialogState({
                dialogHeader: "Success",
                dialogMessage: '',
                isSuccess: true
            });
            toggleHideErrorMsgDialog();
            setPeriodicItems(prev => {
                const updated = [...prev];
                const index = updated.findIndex(item => item.Id === tempId);

                if (index !== -1) {
                    const data = response.data;
                    updated[index] = {
                        ...updated[index],
                        Id: data.ID,
                        Month: data.Month,
                        Year: data.Year,
                        Precinct: data.Precinct,
                        MonthAdjustment: data.MonthAdjustment,
                        StartDate: data.StartDate,
                        DaysInMonth: data.DaysInMonth,
                        CLNumber: data.CLNumber,
                        BuildingName: data.BuildingName,
                        BuildingNumber: data.BuildingNumber,
                        Room: data.Room,
                        CLDescription: data.CLDescription,
                        Approved: data.Approved === true ? true : false,
                        isNew: false
                    };
                }
                return updated;
            });
            onClickRedirect();

            // loadItems(selectedMonth, selectedYear);
        });
    };

    const updatePeriodicData = (objFormData: any, Id: any) => {

        delete objFormData.Id;
        delete objFormData.isNew;
        objFormData = {
            ...objFormData,
            StartDate: new Date(objFormData.StartDate)
        }

        provider.updateItemWithPnP(objFormData, ListNames.ClientResponse, Id).then(async () => {
            setIsLoading(false);
            setErrorMessages([]);
            setDialogState({
                dialogHeader: "Success",
                dialogMessage: 'Messages.UpdateVariationTracker',
                isSuccess: true
            });
            toggleHideErrorMsgDialog();
            setPeriodicItems(prev =>
                prev.map(item =>
                    item.Id === Id
                        ? {
                            ...item,
                            ...objFormData,
                            Id,
                            isNew: false
                        }
                        : item
                )
            );
            // loadItems(selectedMonth, selectedYear);
        });
    };
    const validationFields = [
        {
            type: [ValidationType.Required],
            fieldName: "Title",
            displayText: "Title is required"
        },
        {}
    ];

    const onSaveData = (item: any) => {
        let objData = {
            ...item
        };
        let objDataArray: any[] = [];
        objDataArray[0] = objData;
        let allValid = true;
        const requiredFields = ["LogInTime", "Title", "Request", "CleaningFeedback"];
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
        const validationMessage: string = validatePeriodicItems(objDataArray);
        if (!allValid) {
            setState(prevState => ({ ...prevState, isFormValidationModelOpen: true, validationMessage: validationMessage, isLoading: false }));
        } else {
            setIsLoading(true);
            if (props?.componentProp?.IsUpdate) {
                updatePeriodicData(objData, item.Id);
            } else {
                savePeriodicData(objData);
            }
            // if (item.isNew) {
            // } else {
            // }
        }
    };

    const saveAllData = async () => {
        let allValid = true;
        const requiredFields = ["LogInTime", "Title", "Request", "CleaningFeedback"];
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
            setState(prevState => ({ ...prevState, isFormValidationModelOpen: true, validationMessage: validationMessage, isLoading: false }));
        } else {
            setIsLoading(true);
            let newRecords: any[] = [];
            let updateRecords: any[] = [];


            const cleanImageFields = (items: any[]): any[] => {
                return items.map(item => {
                    const newItem = { ...item };
                    if (!Array.isArray(newItem.BeforeImage1) || newItem.BeforeImage1.length !== 1) {
                        delete newItem.BeforeImage1;
                    }
                    if (!Array.isArray(newItem.BeforeImage2) || newItem.BeforeImage2.length !== 1) {
                        delete newItem.BeforeImage2;
                    }
                    if (!Array.isArray(newItem.AfterImage1) || newItem.AfterImage1.length !== 1) {
                        delete newItem.AfterImage1;
                    }
                    if (!Array.isArray(newItem.AfterImage2) || newItem.AfterImage2.length !== 1) {
                        delete newItem.AfterImage2;
                    }
                    return newItem;
                });
            };


            // Usage
            const cleanedItems = cleanImageFields(periodicItems);

            const updatedFormData = await Promise.all(
                cleanedItems?.map(async (formItem: any) => {
                    const updatedItem: any = {};

                    const imageFields = ["BeforeImage1", "BeforeImage2", "AfterImage1", "AfterImage2"];

                    for (const field of imageFields) {
                        const uploadResult = await uploadFileAndUpdateObject(formItem[field]);

                        updatedItem[field] = uploadResult?.Photo || null;
                        updatedItem[`${field}ThumbnailUrl`] = uploadResult?.EncodedAbsThumbnailUrl || null;
                    }

                    return updatedItem;
                })
            );

            const imageFields = [
                "BeforeImage1", "BeforeImage1ThumbnailUrl",
                "BeforeImage2", "BeforeImage2ThumbnailUrl",
                "AfterImage1", "AfterImage1ThumbnailUrl",
                "AfterImage2", "AfterImage2ThumbnailUrl"
            ];

            const records = await cleanedItems?.map((item, index) => {
                const { StartDate, indexNumber, isNew, Location, SubLocation, CleaningFeedback, ...rest } = item;
                const imageData = updatedFormData[index];
                const mergedImages: any = {};

                imageFields.forEach(field => {
                    if (imageData?.[field]) {
                        mergedImages[field] = imageData[field];
                    }
                });

                return {
                    ...rest,
                    ...mergedImages,
                    SiteNameId: props?.componentProp?.originalSiteMasterId || null,
                    Area: Location?.value ?? Location ?? "",
                    Building: SubLocation?.value ?? SubLocation ?? "",
                    Feedback: CleaningFeedback?.value ?? CleaningFeedback ?? "",
                    WhoAreInvolved: rest?.WhoAreInvolved?.value ?? rest?.WhoAreInvolved ?? "",
                    HasTheSolutionWorked: rest?.HasTheSolutionWorked === "No" || rest?.HasTheSolutionWorked == null || rest?.HasTheSolutionWorked === false ? false : true,
                    IsCompleted: rest?.IsCompleted === "No" || rest?.IsCompleted == null || rest?.IsCompleted === false ? false : true
                };
            });

            if (props?.componentProp?.IsUpdate) {
                updateRecords = records;
            } else {
                const removeFieldFromRecords = (records: any[], fieldToRemove: string): any[] => {
                    return records.map(record => {
                        const newRecord = { ...record };
                        delete newRecord[fieldToRemove];
                        return newRecord;
                    });
                };
                // Usage
                const updatedRecords = removeFieldFromRecords(records, "Id");


                newRecords = updatedRecords;
            }

            const enhancedUpdateRecords = updateRecords.map(updateItem => {
                const matchingPeriodicItem = periodicItems.find(
                    periodicItem => periodicItem.Id === updateItem.Id
                );

                if (!matchingPeriodicItem) return updateItem;

                const fieldsToCheck = [
                    'BeforeImage1',
                    'BeforeImage2',
                    'AfterImage1',
                    'AfterImage2',
                ];

                const additionalFields: Record<string, string> = {};

                fieldsToCheck.forEach(field => {
                    if (!matchingPeriodicItem[field as keyof typeof matchingPeriodicItem]) {
                        additionalFields[field] = '';
                        additionalFields[`${field}ThumbnailUrl`] = '';
                    }
                });

                return {
                    ...updateItem,
                    ...additionalFields,
                };
            });

            console.log("new obj", enhancedUpdateRecords);


            try {
                const promises = [];
                if (newRecords.length > 0) {
                    const toastId = toastService.loading('Loading...');
                    const toastMessage = 'Client Response has been added successfully!';
                    promises.push(provider.createItemInBatch(newRecords, ListNames.ClientResponse));
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                }
                if (updateRecords.length > 0) {
                    const toastId = toastService.loading('Loading...');
                    const toastMessage = 'Client Response has been updated successfully!';
                    // promises.push(provider.updateListItemsInBatchPnP(ListNames.ClientResponse, updateRecords));
                    promises.push(provider.updateListItemsInBatchPnP(ListNames.ClientResponse, enhancedUpdateRecords));
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                }

                await Promise.all(promises);
                // await loadItems(selectedMonth, selectedYear);
                setIsLoading(false);
                onClickRedirect();
                setErrorMessages([]);
                setDialogState({
                    dialogHeader: "Success",
                    dialogMessage: 'Messages.AddAllVariationTracker',
                    isSuccess: true
                });
                toggleHideErrorMsgDialog();
            } catch (error) {
                setDialogState({
                    dialogHeader: "Error",
                    dialogMessage: "An error occurred while saving data. Please try again.",
                    isSuccess: false
                });
            }
        }
    };

    const _onClickDeleteUploadFile = (id: any, controlName: string) => {
        updateCellData(id, controlName, "");
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

    const deleteItemById = async (id: any) => {
        try {
            await provider.deleteItem(ListNames.PeriodicHistory, id);
        } catch (error) {
            console.error(`Failed to delete item with ID ${id}`, error);
        }
    };

    const deleteAllItems = async (deleteAllIds: any[]) => {
        try {
            const deletePromises = deleteAllIds.map((id: any) => deleteItemById(id));
            await Promise.all(deletePromises);
            setPeriodicItems(prev =>
                prev.filter(item => !deleteAllIds.includes(item.Id))
            );
            setIsLoading(false);
            setErrorMessages([]);
            setDialogState({
                dialogHeader: "Success",
                dialogMessage: 'Messages.DeleteAllVariationTracker',
                isSuccess: true
            });
            toggleHideErrorMsgDialog();
            // loadItems(selectedMonth, selectedYear);
        } catch (error) {
            console.error('Error deleting items:', error);
        }
    };

    const deletedData = async (items: any) => {
        setIsLoading(true);
        let deleteAllId = items.map((data: any) => { return data.Id; });
        deleteAllItems(deleteAllId);
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
    const onClick_SaveClientResponse = async (evt: { preventDefault: () => void; }) => {
        try {
            const elementExists = AddedValues.includes(title);
            if (!elementExists) {
                const data: any = {
                    Title: ChoiceTitle.current,
                    ChoiceValue: title,
                    SiteNameId: props?.componentProp?.originalSiteMasterId,
                    IsActive: true
                };
                await props.provider.createItem(data, ListNames.ClientResponseChoices).then(async (item: any) => {
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
    const fileSelectionChange = (e: React.ChangeEvent<HTMLInputElement>, rowId: number, columnKey: string) => {
        const { files } = e.target;
        const selectedFiles: IFileWithBlob[] = [];

        if (files && files.length > 0) {
            const folderServerRelativeURL = `${context.pageContext.web.serverRelativeUrl}/SiteAssets/ClientResponseImages`;
            const overwrite = true;

            for (const file of files as any) {
                const timestamp = new Date().getTime();
                const fileParts = file.name.split('.');
                const ExtensionName = fileParts.pop();
                const FileName = fileParts.join('.');
                const CreatorName = `${timestamp}_${FileName}.${ExtensionName}`;
                const selectedFile: IFileWithBlob = {
                    file,
                    name: CreatorName,
                    folderServerRelativeURL,
                    overwrite
                };
                selectedFiles.push(selectedFile);
            }
            // Update data for the field (e.g., BeforeImage1)
            updateCellData(rowId, columnKey, selectedFiles);

        }
    };

    return {
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
        _Update,
        heightOfContainer,
        setSelectedRows,
        setdelselectedItem,
        selectedRows,
        handleRowSelection,
        updateCellData,
        onSaveData,
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
        _onClickDeleteUploadFile,
        BeforeImage1Deleted,
        BeforeImage2Deleted,
        AfterImage1Deleted,
        AfterImage2Deleted
    }
};