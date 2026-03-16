/* eslint-disable no-case-declarations */
import { useAtomValue } from "jotai";
import { IHelpDeskInLineEditProps } from "./HelpDeskInLineEdit";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import React from "react";
import { IColumn } from "@fluentui/react";
import { IAddHelpDeskItem } from "../../../../../Interfaces/IAddNewHelpDesk";
import { ControlType, DateTimeFormate } from "../../../../../Common/Constants/CommonConstants";
import { ConvertDateToStringFormat, getStateBySiteId, getStateNameBySiteId, logGenerator, removeElementOfBreadCrum } from "../../../../../Common/Util";
import { toastService } from "../../../../../Common/ToastService";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import CamlBuilder from "camljs";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { getCallTypeOptions } from "../../CommonComponents/CommonMethods";
import { Messages } from "../../../../../Common/Constants/Messages";
import moment from "moment";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";

export interface IHelpDeskInLineEditDataState {
    isLoading: boolean;
    isFormValidationModelOpen: boolean;
    validationMessage: any;
    column: IColumn[];
    item: IAddHelpDeskItem[];
    selectedQCPriority: any;
    keyUpdate: number;
    EventName: string;
    isDeleteDialogOpen: boolean;
    deleteItemId: number;
    isReload: boolean;
    isAddPopUP: boolean;
    addPopUpTitle: string;
    felidData: any[];
    validationFelidData: string[];
}

export const HelpDeskInLineEditData = (props: IHelpDeskInLineEditProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const defaultItem = {
        Id: 0,
        Title: "",
        StartingDateTime: new Date() as any,
        Caller: "",
        Location: "",
        Area: "",
        HDCategory: "",
        ReportHelpDesk: false,
        HDStatus: "Pending",
        EventName: "",
        QCPriority: "Low",
        SiteNameId: props.originalSiteMasterId,
        HelpDeskName: "",
        SubLocation: "",
        indexNumber: 0,
        CallType: "",
        CompletionDateTime: undefined,

    }
    // const itemRed = React.useRef<IAddHelpDeskItem[]>([defaultItem])
    const { provider, context, currentUserRoleDetail } = appGlobalState;

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
        item: [defaultItem],
        selectedQCPriority: "",
        keyUpdate: Math.random(),
        isReload: false,
    });

    const [CallTypeOptions, setCallTypeOptions] = React.useState<any[]>([]);

    const onClickValidationClose = () => {
        setState((prevState) => ({ ...prevState, isFormValidationModelOpen: false }))
    }

    const onCloseClick = () => {
        if (isSiteLevelComponent) {
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                selectedZoneDetails: selectedZoneDetails,
                isShowDetailOnly: true,
                pivotName: "HelpDeskListKey",
            });
        } else {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AddNewSite, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "HelpDeskListKey"
            });
        }
    }
    const onChangeControl = (value: any, indexNumber: any, columnName: string, controlType: ControlType) => {
        let items = [...state.item];  // safer clone
        let index = items.findIndex(i => i.indexNumber == indexNumber);

        if (index > -1) {
            switch (controlType) {

                case ControlType.string:
                    const cleaned = value?.trim() === "" ? "" : value;   // ⬅ KEY FIX
                    items[index] = {
                        ...items[index],
                        [columnName]: cleaned
                    };
                    setState(prev => ({
                        ...prev,
                        item: items
                    }));
                    break;

                case ControlType.number:
                    items[index] = {
                        ...items[index],
                        [columnName]: Number(value)
                    };
                    setState(prev => ({
                        ...prev,
                        item: items
                    }));
                    break;

                case ControlType.Date:
                    if (value !== undefined) {
                        items[index] = {
                            ...items[index],
                            [columnName]: value
                        };
                        setState(prev => ({
                            ...prev,
                            item: items
                        }));
                    }
                    break;

                case ControlType.Toggle:
                    items[index] = {
                        ...items[index],
                        [columnName]: value
                    };
                    setState(prev => ({
                        ...prev,
                        item: items
                    }));
                    break;

                default:
                    break;
            }
        }

        return value;
    };


    const onClickAddPopUp = (title: string) => {
        setState((prevState) => ({ ...prevState, addPopUpTitle: title, isAddPopUP: true }))
    }

    const onClickAddPopUpClose = (isReload: boolean) => {
        // setState((prevState) => ({ ...prevState, addPopUpTitle: "", isAddPopUP: false, isReload: isReload ? !prevState.isReload : prevState.isReload }))
        setState((prevState) => ({ ...prevState, addPopUpTitle: "", isAddPopUP: false, refreshFilterTitle: prevState.addPopUpTitle, keyUpdate: isReload ? Math.random() : prevState.keyUpdate }))
    }
    // const onChangeEventName = (value: string) => {
    //     setState((prevState: any) => ({ ...prevState, EventName: value }))
    // }
    const onChangeEventName = (value: string) => {
        const cleaned = value.trim() === "" ? "" : value; // ⬅ IMPORTANT FIX
        setState((prevState: any) => ({ ...prevState, EventName: cleaned }));
    };


    const onCloseDeleteDialog = () => {
        setState((prevState) => ({ ...prevState, isDeleteDialogOpen: false }))
    }

    const updateValidationFields = (felidData: any[]) => {
        const FieldsArrayCurrent = felidData || []; // Ensure it's an array
        const validationMapping: { [key: string]: string } = {
            "Help Desk Description": "Title",
            "Caller": "Caller",
            "Call Type": "CallType",
            "Starting Date": "StartingDateTime",
            "Location": "Location",
            "Area": "Area",
            "Category": "HDCategory",
            "Reported Help Desk": "ReportHelpDesk",
            "Status": "HDStatus",
            "Event Name": "EventName",
            "Priority": "QCPriority",
            "Help Desk Name": "HelpDeskName"
        };
        let newRequiredFields: string[];
        if (FieldsArrayCurrent.length === 0) {
            newRequiredFields = Object.values(validationMapping);
        } else {
            newRequiredFields = FieldsArrayCurrent
                .map((field: any) => validationMapping[field])
                .filter(Boolean);
        }
        setState((prevState) => ({ ...prevState, validationFelidData: newRequiredFields }));
    };

    const onClickYesDelete = async () => {
        setState((prevState) => ({ ...prevState, isLoading: true }));
        const toastId = toastService.loading('Loading...');
        try {
            if (!!state.deleteItemId && state.deleteItemId > 0) {
                await provider.updateItem({ IsDeleted: true }, ListNames.HelpDesk, state.deleteItemId)
                toastService.updateLoadingWithSuccess(toastId, "Record deleted successfully!");
            }
            setState((prevState) => ({ ...prevState, isLoading: false, isDeleteDialogOpen: false, isReload: !prevState.isReload, deleteItemId: 0 }));
        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  _confirmDeleteItem",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_confirmDeleteItem HelpDeskList"
            };
            void logGenerator(provider, errorObj);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setState((prevState) => ({ ...prevState, isLoading: false }));

        }
    }

    const onClickSaveUpdate = async () => {

        const toastId = toastService.loading('Loading...');

        try {
            setState((prevState) => ({ ...prevState, isLoading: false }));
            let isValid: boolean = true;
            let isCompletionDate: Boolean = false;
            if (state.item.length > 0) {
                // let blankItem = state.item.filter((i: IAddHelpDeskItem) => {
                //     return !i.Title && !i.Caller && !i.StartingDateTime && !i.Location && !i.Area && !i.HDCategory && !i.ReportHelpDesk && !i.HDStatus && !i.EventName && !i.QCPriority && !i.QCPriority && !i.HelpDeskName
                // })
                let felidCheck = state.validationFelidData.length > 0 ? props.isEditMultiple ? state.validationFelidData : state.validationFelidData.filter((i) => i != "EventName") : []
                let blankItem = felidCheck.length > 0 ? state.item.filter((i: any) => {
                    return felidCheck.filter(field => i[field] === '' || i[field] === null || i[field] === undefined).length > 0
                }) : [];
                if (blankItem.length > 0) {
                    isValid = false;
                }
            }
            let isEventValidation: boolean = (!state.felidData || state.felidData.length === 0 || state.felidData[0]?.Field?.includes("Event Name")) ? true : false
            let isEventReq = props.isEditMultiple ? false : isEventValidation ? !state.EventName : false
            // ✅ Extra validation: Completion DateTime must not be earlier than Starting DateTime

            for (let item of state.item) {
                if (item?.StartingDateTime && item?.CompletionDateTime) {
                    let start = new Date(item.StartingDateTime);
                    let end = new Date(item.CompletionDateTime);
                    if (typeof item.StartingDateTime === "string" && item.StartingDateTime.includes("-")) {
                        const [day, month, yearAndTime] = item.StartingDateTime.split("-");
                        const [year, time] = yearAndTime.split(" ");
                        start = new Date(`${year}-${month}-${day} ${time}`);
                    }
                    if (typeof item.CompletionDateTime === "string" && item.CompletionDateTime.includes("-")) {
                        const [day, month, yearAndTime] = item.CompletionDateTime.split("-");
                        const [year, time] = yearAndTime.split(" ");
                        end = new Date(`${year}-${month}-${day} ${time}`);
                    }

                    if (end.getTime() <= start.getTime()) {
                        isCompletionDate = true;
                    }
                }
            }
            // if (isValid && !!state.EventName ) {
            if (isValid && isEventReq == false && isCompletionDate == false) {
                const toastMessage = props.isEditMultiple ? 'Details updated successfully!' : 'Helpdesk created successfully!';
                if (state.item.length > 0) {
                    setState((prevState) => ({ ...prevState, isLoading: true }));
                    let allPromise: any[] = [];
                    let newItems: any[] = [];
                    let updatedItems: any[] = [];
                    newItems = state.item.filter((i: IAddHelpDeskItem) => i.Id == 0);
                    updatedItems = state.item.filter((i: IAddHelpDeskItem) => !!i.Id && i.Id > 0);
                    if (newItems.length > 0 && (props.isEditMultiple == undefined || props.isEditMultiple == false)) {
                        newItems = newItems.map(({ Id, indexNumber, ...i }) => {
                            return { ...i, EventName: !!state.EventName ? state.EventName : "" }
                        });
                        // allPromise.push(provider.createItemInBatch(newItems, ListNames.HelpDesk))
                        let createData = await provider.createItemInBatch(newItems, ListNames.HelpDesk)
                        const statename = await getStateNameBySiteId(provider, Number(props.originalSiteMasterId));
                        if (!!createData && createData.length > 0) {
                            let logArray = createData.map((i: any) => {
                                return {
                                    UserName: currentUserRoleDetail?.title,
                                    ActionType: UserActivityActionTypeEnum.Create,
                                    SiteNameId: Number(props.originalSiteMasterId),
                                    EntityType: UserActionEntityTypeEnum.HelpDesk,
                                    EntityId: Number(i.data.Id),
                                    StateName: statename,
                                    EntityName: i?.data?.Title,
                                    Details: `Create Help Desk`
                                }
                            });
                            await provider.createItemInBatch(logArray, ListNames.UserActivityLog)
                        }

                    }
                    if (updatedItems.length > 0 && (!!props.isEditMultiple && props.isEditMultiple)) {
                        updatedItems = updatedItems.map(({ indexNumber, SiteNameId, ...i }) => {
                            return i
                        });

                        // allPromise.push(provider.updateListItemsInBatchPnP(ListNames.HelpDesk, updatedItems))
                        let updateData = await provider.updateListItemsInBatchPnP(ListNames.HelpDesk, updatedItems)
                        if (!!updateData && updateData.length > 0) {
                            const statename = await getStateNameBySiteId(provider, Number(props.originalSiteMasterId));
                            let logArray = updatedItems.map((i: any) => {
                                return {
                                    UserName: currentUserRoleDetail?.title,
                                    ActionType: UserActivityActionTypeEnum.Update,
                                    SiteNameId: Number(props.originalSiteMasterId),
                                    EntityType: UserActionEntityTypeEnum.HelpDesk,
                                    EntityId: Number(i.Id),
                                    EntityName: i?.Title,
                                    StateName: statename,
                                    Details: `Update Help Desk`
                                }
                            });
                            await provider.createItemInBatch(logArray, ListNames.UserActivityLog)
                        }

                    }
                    // let data = await Promise.all(allPromise)
                    setState((prevState) => ({ ...prevState, isLoading: false }));
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    onCloseClick();
                }

            } else {
                let error: any
                if (isEventReq && !isValid && isCompletionDate) {
                    error = <ul>
                        <li className="errorPoint">Event Name required</li>
                        <li className="errorPoint">Please fill all required field</li>
                        <li className="errorPoint">{Messages.CompletionTimeEarlier}</li>
                    </ul>;
                } else if (isEventReq && isCompletionDate) {
                    error = <ul>
                        <li className="errorPoint">Event Name required</li>
                        <li className="errorPoint">{Messages.CompletionTimeEarlier}</li>
                    </ul>;
                } else if (isCompletionDate && !isValid) {
                    error = <ul>
                        <li className="errorPoint">Please fill all required field</li>
                        <li className="errorPoint">{Messages.CompletionTimeEarlier}</li>
                    </ul>;
                } else if (!isValid && isEventReq) {
                    error = <ul>
                        <li className="errorPoint">Please fill all required field</li>
                        <li className="errorPoint">Event Name required</li>
                    </ul>;
                } else if (isEventReq) {
                    error = <ul>
                        <li className="errorPoint">Event Name required</li>
                    </ul>;
                } else if (isCompletionDate) {
                    error = <ul>
                        <li className="errorPoint">{Messages.CompletionTimeEarlier}</li>
                    </ul>;
                }
                else if (!isValid) {
                    error = <ul>
                        <li className="errorPoint">Please fill all required field</li>
                    </ul>;
                }

                setState(prevState => ({
                    ...prevState,
                    isFormValidationModelOpen: true,
                    validationMessage: error,
                    isLoading: false
                }));
                toastService.dismiss(toastId);
            }

        } catch (error) {
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  onClickSaveOrUpdate",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onClickSaveOrUpdate HelpDeskForm"
            };

            void logGenerator(provider, errorObj);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setState((prevState) => ({ ...prevState, isLoading: false }));
        }

    }
    const onClickAdd = () => {
        let obj = { ...defaultItem, indexNumber: state.item.length }
        let item = [...state.item, obj]
        setState((prevState) => ({
            ...prevState, item: item
        }))
    }


    const onClickRemoveItem = (indexNumber: number) => {

        if (state.item.length > 0) {
            let item = state.item.filter((i) => i.indexNumber != indexNumber);
            item = item.map((i, index) => ({ ...i, indexNumber: index }));
            // check old Update or not 
            let findIndex = state.item.findIndex(i => i.indexNumber == indexNumber);
            let itemObj: any = findIndex > -1 ? state.item[findIndex] : ""
            if (!!itemObj && itemObj.Id > 0) {
                setState((prevState: any) => ({ ...prevState, isDeleteDialogOpen: true, deleteItemId: state.item[findIndex].Id }))

            } else {
                setState((prevState) => ({
                    ...prevState, item: item,
                    keyUpdate: Math.random()
                }))
            }


        }
    }

    const onClickFieldData = () => {

        setState((prevState) => ({ ...prevState, isLoading: true }));
        try {
            const select = ["ID,Title,Field,SiteNameId"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.HelpDeskField,
                filter: `SiteNameId eq '${props.componentProps.originalSiteMasterId}'`
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const listData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                Field: !!data.Field ? data.Field : '',
                            }
                        );
                    });
                    if (listData.length > 0)
                        updateValidationFields(listData[0].Field);
                    setState((prevState) => ({ ...prevState, isLoading: false, felidData: listData }));
                }
            }).catch((error: any) => {
                console.log(error);

                setState((prevState) => ({ ...prevState, isLoading: false }))
            });
        } catch (ex) {
            setState((prevState) => ({ ...prevState, isLoading: false }))
            console.log(ex);


        }
    }


    const getHelpDeskItem = async () => {

        try {
            let items: IAddHelpDeskItem[] = [defaultItem];
            if (props.isEditMultiple && props.editItemId) {
                const camlQuery = new CamlBuilder()
                    .View(["Id", "ID", "Title", "StartingDateTime", "CompletionDateTime", "Caller", "Location", "Area", "HDCategory", "ReportHelpDesk", "HDStatus", "EventName", "QCPriority", "SubLocation", "SiteNameId", "HelpDeskName", "FirstName", "LastName", "EmailAddress", "Venue", "StateId", "Notes", "CallType"])
                    .Scope(CamlBuilder.ViewScope.RecursiveAll)
                    .RowLimit(5000, true)
                    .Query()
                    .Where()
                    .LookupField("SiteName").Id().EqualTo(Number(props.originalSiteMasterId))
                    // .And()
                    // .BooleanField("IsDeleted").IsFalse()
                    .And()
                    .NumberField("ID").In(props.editItemId)
                    .ToString()
                let data = await provider.getItemsByCAMLQuery(ListNames.HelpDesk, camlQuery, { SortField: "ID", SortDir: "Asc" })
                if (!!data && data.length > 0) {
                    data = data.filter((i: any) => i.IsDeleted == undefined || i.IsDeleted != true)
                    items = data.map((i: any, index) => {
                        return {
                            Id: !!i.ID ? Number(i.ID) : 0,
                            Title: !!i.Title ? i.Title : "",
                            StartingDateTime: !!i.StartingDateTime ? new Date(i["StartingDateTime."]) : undefined,
                            Caller: !!i.Caller ? i.Caller : "",
                            Location: !!i.Location ? i.Location : "",
                            Area: !!i.Area ? i.Area : "",
                            HDCategory: !!i.HDCategory ? i.HDCategory : "",
                            ReportHelpDesk: i?.ReportHelpDesk == "Yes" ? true : false,
                            HDStatus: !!i.HDStatus ? i.HDStatus : "",
                            EventName: !!i.EventName ? i.EventName : "",
                            QCPriority: !!i.QCPriority ? i.QCPriority : "",
                            SiteNameId: !!i.SiteName ? i.SiteName[0].lookupId : null,
                            HelpDeskName: !!i.HelpDeskName ? i.HelpDeskName : "",
                            SubLocation: !!i.SubLocation ? i.SubLocation : "",
                            indexNumber: index,
                            CallType: !!i.CallType ? i.CallType : "",
                            CompletionDateTime: !!i.CompletionDateTime ? new Date(i["CompletionDateTime."]) : undefined,
                            // CompletionDateTime: i.CompletionDateTime
                            //     ? moment(i.CompletionDateTime, "M/D/YYYY h:mm A").toDate()
                            //     : undefined,
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

    const getOptionList = async () => {
        const callTypeOptions = await getCallTypeOptions(provider);
        setCallTypeOptions(callTypeOptions);
    };

    React.useEffect(() => {
        (async () => {
            try {
                if (props.originalSiteMasterId) {
                    setState((prevState: any) => ({ ...prevState, isLoading: true }));
                    const [items] = await Promise.all([getHelpDeskItem(), onClickFieldData(), getOptionList()])
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


    return {
        state,
        CallTypeOptions,
        onClickValidationClose,
        onClickAdd,
        // generateColumn,
        onChangeControl,
        onClickRemoveItem,
        onClickSaveUpdate,
        onChangeEventName,
        onCloseDeleteDialog,
        onClickYesDelete,
        onClickAddPopUp,
        onClickAddPopUpClose,
        onCloseClick
        // itemRed
    }

}