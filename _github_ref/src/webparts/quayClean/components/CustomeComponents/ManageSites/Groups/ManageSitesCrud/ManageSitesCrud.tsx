/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-key */
import React from "react"
import { ManageSitesCrudData } from "./ManageSitesCrudData"
import { Loader } from "../../../../CommonComponents/Loader"
import { IQuayCleanState } from "../../../../QuayClean";
import { Checkbox, Link, Panel, PanelType, PersonaSize, PrimaryButton, TextField, TooltipHost } from "@fluentui/react";
import { ComponentNameEnum, ListNames } from "../../../../../../../Common/Enum/ComponentNameEnum";
import { UserPersonaById } from "../../../../CommonComponents/UserPersonaById";
import { appGlobalStateAtom } from "../../../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CustomModal from "../../../../CommonComponents/CustomModal";
import { CustomeDialog } from "../../../../CommonComponents/CustomeDialog";
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import { ICustomPeoplePicker } from "../../../WHSForms/IAddWHSMeetingFroms";
import NoRecordFound from "../../../../CommonComponents/NoRecordFound";
import { WasteReportViewFields } from "../../../../../../../Common/Enum/WasteReportEnum";
import IPnPQueryOptions from "../../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { toastService } from "../../../../../../../Common/ToastService";
import { HazardPrintQrCode } from "../../../IMS/HazardReport/HazardPrintQrCode";
import { UserPersonaByEmail } from "../../../../UserPersonaByEmail";
import { selectedZoneAtom } from "../../../../../../../jotai/selectedZoneAtom";
import { canShowSiteActionButtons } from "../../../../../../../Common/Util";

export interface IManageSitesCrudProps {
    siteMasterId: number;
    manageComponentView(componentProp: IQuayCleanState): any;
    isGroupViewPage?: boolean;
    isSiteInformationView?: boolean;
    isCrudShow?: boolean;
    onclickEdit?: any;
    onclickViewQR?: any;
    onClickAccesLocation?: any;
    onClickSubLocation?: any;
    onClickAddAccess?: any;
    isShowSuperVisorAccess?: any;
    isShowAssetLocationAccess?: any;
    onClickReload?: any;
    qrCodeSrc?: string;
    dataObj?: any;
    siteName?: any;
    IsSupervisor?: any;
    qCState?: any,
    MasterId?: any,
    qCStateId?: any,
    componentProp?: any;
    breadCrumItems?: any;
}

export const ManageSitesCrud = (props: IManageSitesCrudProps) => {

    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const { state, onClickCloseAddNew, onClickAddEdit, scrollTopRef, onPeoplePickerChange, onClickSaveDialog, onClickYesDelete, handleDownloadQR, onCloseDeleteDialog, onClickDeleteButton, handleDownload, handleOpenHazardQRModal, oncloseHazardModal } = ManageSitesCrudData(props);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isDetails, setIsDetails] = React.useState<boolean>(false);
    const [isDetailsEOM, setIsDetailsEOM] = React.useState<boolean>(false);
    const [ListData, setListData] = React.useState<any[]>([]);
    const [QuestionData, setQuestionData] = React.useState<any[]>([]);
    const [QuestionDataEOM, setQuestionDataEOM] = React.useState<any[]>([]);
    const [ListDataEOM, setListDataEOM] = React.useState<any[]>([]);
    const [items, setItems] = React.useState<any[]>([]);
    const [itemsEOM, setItemsEOM] = React.useState<any[]>([]);
    const [isAllSelected, setIsAllSelected] = React.useState(true);
    const [isAllSelectedEOM, setIsAllSelectedEOM] = React.useState(true);
    const [editModeId, setEditModeId] = React.useState<any>(null); // Track the active edit mode
    const [editData, setEditData] = React.useState<Record<string, string>>({});
    const [editModeIdEOM, setEditModeIdEOM] = React.useState<any>(null); // Track the active edit mode
    const [editDataEOM, setEditDataEOM] = React.useState<Record<string, string>>({});
    const [isSaved, setIsSaved] = React.useState<boolean>(false);
    const [isNewSaved, setIsNewSaved] = React.useState<boolean>(false);
    const [isSavedEOM, setIsSavedEOM] = React.useState<boolean>(false);
    const [isNewSavedEOM, setIsNewSavedEOM] = React.useState<boolean>(false);
    const [selectedItemsEOM, setSelectedItemsEOM] = React.useState<any[]>([]);
    const [selectedItems, setSelectedItems] = React.useState<any[]>([]);
    const [UpdateData, setUpdateData] = React.useState<any[]>([]);
    const [isUpdated, setIsUpdated] = React.useState<boolean>(false);
    const [UpdateDataEOM, setUpdateDataEOM] = React.useState<any[]>([]);
    const [isUpdatedEOM, setIsUpdatedEOM] = React.useState<boolean>(false);
    const [canShowAddEditButton, setCanShowAddEditButton] = React.useState<boolean>(false);
    let currentnumber = 0;
    let currentnumbereom = 0;
    React.useEffect(() => {
        const updatedData = items.map(({ ID, ...rest }) => ({
            JCCId: Number(ID),
            ...rest,
        }));
        const updatedDataObj = updatedData.map(item => {
            const {
                ID,
                SpaceOption,
                Modified,
                isEditable,
                isSelected,
                ...rest
            } = item;

            return {
                ...rest,                    // keeps Title, Index, Frequency, etc.
                Frequency: item.Frequency,  // explicitly keep Frequency (optional, since it's in rest anyway)
                IsEdited: isSelected,       // Rename isSelected to IsEdited
                SiteNameId: props?.siteMasterId
            };
        });
        setSelectedItems(updatedDataObj);
    }, [items]);

    React.useEffect(() => {
        const updatedData = itemsEOM.map(({ ID, ...rest }) => ({
            JCCId: Number(ID),
            ...rest,
        }));
        const updatedDataObj = updatedData.map(item => {
            const {
                ID,
                SpaceOption,
                Modified,
                isEditable,
                isSelected,
                ...rest
            } = item;

            return {
                ...rest,                    // keeps Title, Index, Frequency, etc.
                Frequency: item.Frequency,  // explicitly keep Frequency (optional, since it's in rest anyway)
                IsEdited: isSelected,       // Rename isSelected to IsEdited
                SiteNameId: props?.siteMasterId
            };
        });
        setSelectedItemsEOM(updatedDataObj);
    }, [itemsEOM]);

    const toggleSelectAll = () => {
        const newSelectState = !isAllSelected;
        setIsAllSelected(newSelectState);
        setItems(prevItems =>
            prevItems.map(item => ({
                ...item,
                isSelected: newSelectState
            }))
        );
    };

    const toggleSelectAllEOM = () => {
        const newSelectStateEOM = !isAllSelectedEOM;
        setIsAllSelectedEOM(newSelectStateEOM);
        setItemsEOM(prevItems =>
            prevItems.map(item => ({
                ...item,
                isSelected: newSelectStateEOM
            }))
        );
    };

    const mergeItems = (updatedItems: any, listData: any) => {
        const questionMasterIds = updatedItems.map((item: any) => Number(item.JCC));
        let lastTimestamp = 0;
        let counter = 0;
        listData.forEach((item: any) => {
            const timestamp = Date.now();
            if (timestamp === lastTimestamp) {
                counter++;
            } else {
                counter = 0;  // Reset counter if the timestamp changes
                lastTimestamp = timestamp;
            }
            const uniquePart = (timestamp % 100000000).toString().padStart(8, '0');  // 8 digits from timestamp
            const uniqueId = (uniquePart + counter.toString().padStart(3, '0')).slice(0, 8); // Add counter and ensure 8 digits
            let id = uniqueId;
            if (!questionMasterIds.includes(Number(item.ID))) {
                const newItem = {
                    ID: id + Number(item.ID),  // Unique ID
                    Title: item.Title,
                    isSelected: false,
                    Frequency: item.Frequency,
                    Modified: item.Modified,
                    JCC: Number(item.ID),
                    Index: "0",
                    SiteNameId: updatedItems[0]?.SiteNameId,  // Adjust based on your context
                    SiteName: "Null"
                };
                updatedItems.push(newItem);
            }
        });
        return updatedItems;
    };

    const mergeItemsEOM = (updatedItems: any, listData: any) => {
        const questionMasterIds = updatedItems.map((item: any) => Number(item.JCC));
        let lastTimestamp = 0;
        let counter = 0;
        listData.forEach((item: any) => {
            const timestamp = Date.now();
            if (timestamp === lastTimestamp) {
                counter++;
            } else {
                counter = 0;  // Reset counter if the timestamp changes
                lastTimestamp = timestamp;
            }
            const uniquePart = (timestamp % 100000000).toString().padStart(8, '0');  // 8 digits from timestamp
            const uniqueId = (uniquePart + counter.toString().padStart(3, '0')).slice(0, 8); // Add counter and ensure 8 digits
            let id = uniqueId;
            if (!questionMasterIds.includes(Number(item.ID))) {
                const newItem = {
                    ID: id + Number(item.ID),  // Unique ID
                    Title: item.Title,
                    isSelected: false,
                    Frequency: item.Frequency,
                    Modified: item.Modified,
                    JCC: Number(item.ID),
                    Index: "0",
                    SiteNameId: updatedItems[0]?.SiteNameId,  // Adjust based on your context
                    SiteName: "Null"
                };
                updatedItems.push(newItem);
            }
        });
        return updatedItems;
    };

    React.useEffect(() => {
        if (UpdateData.length > 0) {
            const updatedItems = UpdateData.map(({ ID, Title, IsEdited, ...rest }) => ({
                ID,
                Title,
                isSelected: IsEdited ? true : false, // Use IsEdited to determine initial selection state
                ...rest
            }));
            const result = mergeItems(updatedItems, QuestionData);
            // console.log(result);
            setItems(result);
            const allEditable =
                result.length > 0 && result.every((item: any) => item.isSelected === true);

            setIsAllSelected(allEditable);
        }
    }, [UpdateData, QuestionData]);

    React.useEffect(() => {
        if (UpdateDataEOM.length > 0) {
            const updatedItems = UpdateDataEOM.map(({ ID, Title, IsEdited, ...rest }) => ({
                ID,
                Title,
                isSelected: IsEdited ? true : false, // Use IsEdited to determine initial selection state
                ...rest
            }));
            const result = mergeItemsEOM(updatedItems, QuestionDataEOM);
            setItemsEOM(result);
            const allEditable =
                result.length > 0 && result.every((item: any) => item.isSelected === true);
            setIsAllSelectedEOM(allEditable);
        }
    }, [UpdateDataEOM, QuestionDataEOM]);



    const onClickSave = async () => {
        setIsLoading(true);
        let toastMessage: string = "";
        const toastId = toastService.loading('Loading...');
        toastMessage = 'Job control checklist question saved successfully!';

        if (!!selectedItems && selectedItems.length > 0) {
            await provider.createItemInBatch(selectedItems, ListNames.JobControlChecklistQuestion);
            // setIsLoading(false);
            setIsSaved(true);
            setIsNewSaved(false);
            setIsDetails(false);
            setItems([]);
            setUpdateData([]);
            setSelectedItems([]);
            setQuestionData([]);
            toastService.updateLoadingWithSuccess(toastId, toastMessage);
            console.log("Success");
            setIsLoading(false);
        }
    };

    const onClickSaveEOM = async () => {
        setIsLoading(true);
        let toastMessage: string = "";
        const toastId = toastService.loading('Loading...');
        toastMessage = 'Manager’s monthly KPI’s question saved successfully!';

        if (!!selectedItemsEOM && selectedItemsEOM.length > 0) {
            await provider.createItemInBatch(selectedItemsEOM, ListNames.EOMChecklistQuestion);
            // setIsLoading(false);
            setIsSavedEOM(true);
            setIsNewSavedEOM(false);
            setIsDetailsEOM(false);
            setItemsEOM([]);
            setUpdateDataEOM([]);
            setSelectedItemsEOM([]);
            setQuestionDataEOM([]);
            toastService.updateLoadingWithSuccess(toastId, toastMessage);
            console.log("Success");
            setIsLoading(false);
        }
    };

    const onClickManageQuestion = async () => {
        setIsLoading(true)
        onClickAssignedQuestion();
        setIsDetails(true);
    };

    const onClickManageQuestionEOM = async () => {
        setIsLoading(true)
        onClickAssignedQuestionEOM();
        setIsDetailsEOM(true);
    };

    const onClickUpdate = async () => {
        setIsLoading(true);
        const updatedData = selectedItems
            .filter(item => item.SiteName !== "Null")  // Filter out items with SiteName === "Null"
            .map(item => ({
                Id: Number(item.JCCId),  // Rename QuestionMasterId to ID
                Title: item.Title,                  // Keep the Title field
                IsEdited: item.IsEdited             // Keep the IsEdited field
            }));

        let toastMessage: string = "";
        const toastId = toastService.loading('Loading...');
        toastMessage = 'Question update successfully!';

        const filteredQuestions = selectedItems
            .filter(item => item.SiteName === "Null")  // Filter for SiteName "Null"
            .map(({ SiteName, JCC, ...rest }) => ({
                JCCId: JCC, // Ensure you're using the 4-digit value from JCC
                ...rest,  // Spread the rest of the fields into the object
            }));


        let updatedQuestions = filteredQuestions.map((filteredQuestion) => {
            const selectedItem = selectedItems.find(
                (item) => item.JCCId === filteredQuestion.JCCId
            );
            if (selectedItem) {
                // Update JCCId with the value from the selectedItems
                return {
                    ...filteredQuestion,
                    JCCId: selectedItem.JCC
                };
            }
            return filteredQuestion;
        });

        if (!!updatedQuestions && updatedQuestions.length > 0) {
            await provider.createItemInBatch(updatedQuestions, ListNames.JobControlChecklistQuestion);
            updatedQuestions = [];
        }

        if (!!updatedData && updatedData.length > 0) {
            await provider.updateListItemsInBatchPnP(ListNames.JobControlChecklistQuestion, updatedData);

            toastService.updateLoadingWithSuccess(toastId, toastMessage);
            console.log("Success");
            setIsDetails(false);
            setIsUpdated(true);
            setItems([]);
            setUpdateData([]);
            setEditData({});
            setQuestionData([]);
            setEditModeId(null);
            setIsLoading(false);
        }
    };
    React.useEffect(() => {
        const permission = canShowSiteActionButtons(
            selectedZoneDetails?.defaultSelectedSitesId || [],
            currentUserRoleDetail
        );

        setCanShowAddEditButton(permission);
    }, [selectedZoneDetails, currentUserRoleDetail]);

    const onClickUpdateEOM = async () => {
        setIsLoading(true);
        const updatedData = selectedItemsEOM
            .filter(item => item.SiteName !== "Null")  // Filter out items with SiteName === "Null"
            .map(item => ({
                Id: Number(item.JCCId),  // Rename QuestionMasterId to ID
                Title: item.Title,                  // Keep the Title field
                IsEdited: item.IsEdited             // Keep the IsEdited field
            }));

        let toastMessage: string = "";
        const toastId = toastService.loading('Loading...');
        toastMessage = 'Manager’s monthly KPI’s question update successfully!';

        const filteredQuestionsEOM = selectedItemsEOM
            .filter(item => item.SiteName === "Null")  // Filter for SiteName "Null"
            .map(({ SiteName, JCC, ...rest }) => ({
                JCCId: JCC, // Ensure you're using the 4-digit value from JCC
                ...rest,  // Spread the rest of the fields into the object
            }));


        let updatedQuestions = filteredQuestionsEOM.map((filteredQuestion) => {
            const selectedItem = selectedItemsEOM.find(
                (item) => item.JCCId === filteredQuestion.JCCId
            );
            if (selectedItem) {
                // Update JCCId with the value from the selectedItems
                return {
                    ...filteredQuestion,
                    JCCId: selectedItem.JCC
                };
            }
            return filteredQuestion;
        });

        if (!!updatedQuestions && updatedQuestions.length > 0) {
            await provider.createItemInBatch(updatedQuestions, ListNames.EOMChecklistQuestion);
            updatedQuestions = [];
        }

        if (!!updatedData && updatedData.length > 0) {
            await provider.updateListItemsInBatchPnP(ListNames.EOMChecklistQuestion, updatedData);

            toastService.updateLoadingWithSuccess(toastId, toastMessage);
            console.log("Success");
            setIsDetailsEOM(false);
            setIsUpdatedEOM(true);
            setItemsEOM([]);
            setUpdateDataEOM([]);
            setQuestionDataEOM([]);
            setEditDataEOM({});
            setEditModeIdEOM(null);
            setIsLoading(false);
        }
    };

    const onClickAssignedQuestion = () => {
        const select = ["ID,Title,SiteNameId,Frequency,Index,SiteName/Title,IsEdited,JCCId"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            expand: ['SiteName'],
            listName: ListNames.JobControlChecklistQuestion,
            filter: `SiteNameId eq '${props.siteMasterId}'`
        };
        provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
            if (!!results) {
                const EditItem = results.map((data) => {
                    return (
                        {
                            ID: data.ID,
                            Title: data.Title,
                            SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                            Frequency: !!data.Frequency ? data.Frequency : '',
                            IsEdited: data.IsEdited,
                            Index: !!data.Index ? data.Index : 0,
                            Modified: !!data.Modified ? data.Modified : null,
                            SiteName: !!data.SiteNameId ? data.SiteName.Title : '',
                            JCC: !!data.JCCId ? data.JCCId : null,
                        }
                    );
                });

                if (!!EditItem && EditItem.length > 0) {
                    onClickQuestion('IsEdit');
                    setUpdateData(EditItem);
                    setIsSaved(true);
                    setIsNewSaved(false);
                    setIsLoading(false);

                } else {
                    setIsNewSaved(true);
                    onClickQuestion('IsNew');

                }
            }
        }).catch((error: any) => {
            console.log(error);
        });
    }

    const onClickAssignedQuestionEOM = () => {
        const select = ["ID,Title,SiteNameId,Frequency,Index,SiteName/Title,IsEdited,JCCId"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            expand: ['SiteName'],
            listName: ListNames.EOMChecklistQuestion,
            filter: `SiteNameId eq '${props.siteMasterId}'`
        };
        provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
            if (!!results) {
                const EditItemEOM = results.map((data) => {
                    return (
                        {
                            ID: data.ID,
                            Title: data.Title,
                            SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                            Frequency: !!data.Frequency ? data.Frequency : '',
                            IsEdited: data.IsEdited,
                            Index: !!data.Index ? data.Index : 0,
                            Modified: !!data.Modified ? data.Modified : null,
                            SiteName: !!data.SiteNameId ? data.SiteName.Title : '',
                            JCC: !!data.JCCId ? data.JCCId : null,
                        }
                    );
                });

                if (!!EditItemEOM && EditItemEOM.length > 0) {
                    onClickQuestionEOM('IsEdit');
                    setUpdateDataEOM(EditItemEOM);
                    setIsSavedEOM(true);
                    setIsNewSavedEOM(false);
                    setIsLoading(false);
                } else {
                    setIsNewSavedEOM(true);
                    onClickQuestionEOM('IsNew');
                }
            }
        }).catch((error: any) => {
            console.log(error);
        });
    }

    const onClickQuestion = (type: any) => {
        const select = ["ID,Title,Frequency,Index"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.JobControlChecklist,
        };
        provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
            if (!!results) {
                const Listitem = results.map((data) => {
                    return (
                        {
                            ID: data.ID,
                            Title: data.Title,
                            Frequency: !!data.Frequency ? data.Frequency : '',
                            Index: !!data.Index ? data.Index : 0,
                        }
                    );
                });
                setQuestionData(Listitem);
                if (type == 'IsNew')
                    setListData(Listitem);
            }
            setIsLoading(false);

        }).catch((error: any) => {
            console.log(error);
        });
    }

    const onClickQuestionEOM = (type: any) => {
        const select = ["ID,Title,Frequency,Index"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.EOMChecklist,
        };
        provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
            if (!!results) {
                const Listitem = results.map((data) => {
                    return (
                        {
                            ID: data.ID,
                            Title: data.Title,
                            Frequency: !!data.Frequency ? data.Frequency : '',
                            Index: !!data.Index ? data.Index : 0,
                        }
                    );
                });
                setQuestionDataEOM(Listitem);
                if (type == 'IsNew')
                    setListDataEOM(Listitem);
            }
            setIsLoading(false);
        }).catch((error: any) => {
            console.log(error);
        });
    }

    const onRenderFooterContent = () => {

        if (isSaved && !isNewSaved) {
            return <div className="dflex">
                {!!items && items.length > 0 && <div className="margin-sm-add-btn-panel">
                    <PrimaryButton className="btn btn-primary" onClick={onClickUpdate} text="Update" />
                </div>}
                <div className="margin-sm-add-btn-panel">
                    <PrimaryButton className="btn btn-danger" onClick={onClickClose} text="Close" />
                </div>
            </div>;
        } else {
            return <div className="dflex">

                {!!items && items.length > 0 && <div className="margin-sm-add-btn-panel">
                    <PrimaryButton className="btn btn-primary" onClick={onClickSave} text="Save" />
                </div>}
                <div className="margin-sm-add-btn-panel">
                    <PrimaryButton className="btn btn-danger" onClick={onClickClose} text="Close" />
                </div>
            </div>;
        }

    };

    const onRenderFooterContentEOM = () => {

        if (isSavedEOM && !isNewSavedEOM) {
            return <div className="dflex">
                {!!itemsEOM && itemsEOM.length > 0 && <div className="margin-sm-add-btn-panel">
                    <PrimaryButton className="btn btn-primary" onClick={onClickUpdateEOM} text="Update" />
                </div>}
                <div className="margin-sm-add-btn-panel">
                    <PrimaryButton className="btn btn-danger" onClick={onClickCloseEOM} text="Close" />
                </div>
            </div>;
        } else {
            return <div className="dflex">

                {!!itemsEOM && itemsEOM.length > 0 && <div className="margin-sm-add-btn-panel">
                    <PrimaryButton className="btn btn-primary" onClick={onClickSaveEOM} text="Save" />
                </div>}
                <div className="margin-sm-add-btn-panel">
                    <PrimaryButton className="btn btn-danger" onClick={onClickCloseEOM} text="Close" />
                </div>
            </div>;
        }

    };

    const toggleEditMode = (id: string) => {
        setEditModeId(id);
        setEditData(prev => ({
            ...prev,
            [id]: items.find(item => item.ID === id)?.Title || '', // Initialize editData for this item
        }));
    };

    const toggleEditModeEOM = (id: string) => {
        setEditModeIdEOM(id);
        setEditDataEOM(prev => ({
            ...prev,
            [id]: itemsEOM.find(item => item.ID === id)?.Title || '', // Initialize editData for this item
        }));
    };

    const onCheckboxChange = (id: string, isSelected: boolean) => {
        const updatedItems = items.map(item =>
            item.ID === id ? { ...item, isSelected: !isSelected } : item
        );
        setItems(updatedItems);
        setIsAllSelected(updatedItems.every(item => item.isSelected)); // Update the "Select All" state
    };


    const onCheckboxChangeEOM = (id: string, isSelected: boolean) => {
        const updatedItemsEOM = itemsEOM.map(item =>
            item.ID === id ? { ...item, isSelected: !isSelected } : item
        );
        setItemsEOM(updatedItemsEOM);
        setIsAllSelectedEOM(updatedItemsEOM.every(item => item.isSelected)); // Update the "Select All" state
    };

    const saveEdit = (id: string) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.ID === id
                    ? { ...item, Title: editData[id] || item.Title }
                    : item
            )
        );
        setEditModeId(null); // Exit edit mode
        setEditData((prev: any) => {
            const { [id]: _, ...rest } = prev; // Remove the saved entry from editData
            return rest;
        });
    };

    const saveEditEOM = (id: string) => {
        setItemsEOM(prevItems =>
            prevItems.map(item =>
                item.ID === id
                    ? { ...item, Title: editDataEOM[id] || item.Title }
                    : item
            )
        );
        setEditModeIdEOM(null); // Exit edit mode
        setEditDataEOM((prev: any) => {
            const { [id]: _, ...rest } = prev; // Remove the saved entry from editData
            return rest;
        });
    };

    const cancelEdit = () => {
        setEditModeId(null); // Exit edit mode without saving changes
        setEditData((prev: any) => {
            const { [editModeId]: _, ...rest } = prev; // Clear the temporary edit entry
            return rest;
        });
    };

    const cancelEditEOM = () => {
        setEditModeIdEOM(null); // Exit edit mode without saving changes
        setEditDataEOM((prev: any) => {
            const { [editModeIdEOM]: _, ...rest } = prev; // Clear the temporary edit entry
            return rest;
        });
    };

    React.useEffect(() => {
        currentnumber = currentnumber + 1;
        const newItems = ListData.map(item => ({
            ...item,
            isEditable: false,
            isSelected: true
        }));
        setItems(newItems);
        const allEditable =
            newItems.length > 0 && newItems.every(item => item.isEditable === true);
        setIsAllSelected(allEditable);

        if (currentnumber === 1 && newItems.length > 0 && newItems.every(item => item.isEditable === false)) {
            setIsAllSelected(true);
        }
    }, [ListData]);

    React.useEffect(() => {
        currentnumbereom = currentnumbereom + 1;
        const newItems = ListDataEOM.map(item => ({
            ...item,
            isEditable: false,
            isSelected: true
        }));
        setItemsEOM(newItems);
        const allEditable =
            newItems.length > 0 && newItems.every(item => item.isEditable === true);
        setIsAllSelectedEOM(allEditable);

        if (currentnumbereom === 1 && newItems.length > 0 && newItems.every(item => item.isEditable === false)) {
            setIsAllSelectedEOM(true);
        }
    }, [ListDataEOM]);



    const onRenderDialogContent = () => {
        return <PeoplePicker

            context={context as any}
            titleText={state.type || ""}
            personSelectionLimit={100}
            defaultSelectedUsers={state.addItemId ? [state.addItemEmail] : []}
            required={true}
            ensureUser={true}
            showHiddenInUI={false}
            errorMessage={state.isShowError ? "this user already present" : ""}
            principalTypes={[PrincipalType.User]}
            onChange={onPeoplePickerChange}
            resolveDelay={1000} />

    }

    const onClickClose = (): void => {
        setItems([]);
        setUpdateData([]);
        setEditData({});
        setQuestionData([]);
        setEditModeId(null);
        setIsDetails(false);

    };
    const onClickCloseEOM = (): void => {
        setItemsEOM([]);
        setUpdateDataEOM([]);
        setEditDataEOM({});
        setQuestionDataEOM([]);
        setEditModeIdEOM(null);
        setIsDetailsEOM(false);
    };

    return <div className={` manageSite ${!props.isSiteInformationView && "boxCardNo"}`} ref={scrollTopRef}>
        {isLoading && <Loader />}
        {state.isAddDialogShow && <CustomeDialog
            isDialogOpen={state.isAddDialogShow}
            isDisable={(state?.addItemId > 0 && !state.isShowError) ? false : true}
            onClickClose={onClickCloseAddNew}
            saveButtonText={"Save"}
            onClickYes={onClickSaveDialog}
            title={state.isAddNew ? `Add ${state.type}` : `Update ${state.type}`}
            closeText="Cancel"
            dialogMessage={onRenderDialogContent()}
        />}
        {state.isLoading && <Loader />}
        <HazardPrintQrCode
            isHazardQrModelOpen={state.isHazardQrModelOpen}
            onClickClose={oncloseHazardModal}
            HazardQRImage={state.HazardQRCodeImage}
            siteName={props.siteName}
        />
        {state.isDeleteDialogOpen && <CustomModal isModalOpenProps={state.isDeleteDialogOpen}
            setModalpopUpFalse={onCloseDeleteDialog}
            subject={"Delete Item"}
            message={'Are you sure, you want to delete this record?'}
            yesButtonText="Yes"
            closeButtonText={"No"}
            onClickOfYes={onClickYesDelete} />}
        <div className="ms-Grid" >
            <div className="ms-Grid-row  ">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 " >
                    <div className="dflex" style={{ justifyContent: "end", marginBottom: "15px" }}>
                        {!props.isSiteInformationView && <PrimaryButton className="btn btn-danger " onClick={() => {
                            props.manageComponentView({ currentComponentName: ComponentNameEnum.ManageSites, selectedKey: props.isGroupViewPage ? "Groups" : "Sites" });
                        }} text="Back" />}
                    </div>
                    <div className="boxCardNormal" style={{ padding: "0px" }}>
                        <div className="ms-Grid-row manageSiteGroupheader" style={{ fontSize: "18px" }}>

                            <div className={`ms-Grid-col ms-sm12 ms-md12 ms-lg12 mt-10 ${props.isSiteInformationView && "justifyContentBetween dflex"} `}>
                                <h2> Site Details</h2>
                                <div>
                                    {canShowAddEditButton ? <div className="dflex">
                                        {/* <div className="formgroup eql-height">
                                            <Link className="actionBtn iconSize btnPrimary dticon" onClick={handleOpenHazardQRModal}>
                                                <TooltipHost content={"Print Hazard QR Code"} >
                                                    <FontAwesomeIcon icon="qrcode" />
                                                </TooltipHost>
                                            </Link>
                                        </div> */}

                                        <div className="formgroup eql-height ml-10">
                                            <Link className="actionBtn iconSize btnEdit dticon" onClick={!!props.onclickEdit && props.onclickEdit}>
                                                <TooltipHost content={"Edit Site"}>
                                                    <FontAwesomeIcon icon="edit" />
                                                </TooltipHost>
                                            </Link>
                                        </div>
                                        <div className="formgroup eql-height ml-10">
                                            <Link className="actionBtn iconSize btnDownload dticon" onClick={handleDownload}>
                                                <TooltipHost content={"Print QR Code"} >
                                                    <FontAwesomeIcon icon="print" />
                                                </TooltipHost>
                                            </Link>

                                        </div>
                                        <div className="formgroup eql-height ml-10">
                                            <Link className="actionBtn iconSize btnDanger dticon" onClick={handleDownloadQR}>
                                                <TooltipHost content={"Download QR Code"} >
                                                    <FontAwesomeIcon icon="download" />
                                                </TooltipHost>
                                            </Link>

                                        </div>
                                        <div className="formgroup eql-height ml-10">
                                            <Link className="actionBtn btnGray  dticon" onClick={() => {
                                                props.manageComponentView({
                                                    currentComponentName: ComponentNameEnum.SiteDetailView,
                                                    dataObj: props?.componentProp?.dataObj,
                                                    siteNameId: props.siteMasterId,
                                                    siteName: props.siteName,
                                                    IsSupervisor: props.IsSupervisor,
                                                    qCState: props.qCState,
                                                    MasterId: props.siteMasterId,
                                                    qCStateId: props?.componentProp?.dataObj?.StateId || props?.dataObj?.StateId,
                                                    siteMasterId: props.siteMasterId,
                                                    breadCrumItems: props.breadCrumItems,
                                                });
                                            }}>
                                                <TooltipHost
                                                    content={"Run Site Audit Report"}
                                                >
                                                    {/* <FontAwesomeIcon icon={faChartBar} /> */}
                                                    <img src={require('../../../../../assets/images/SiteAuditReport.png')} className="siteAuditIcon" />
                                                </TooltipHost>
                                            </Link>

                                        </div>
                                    </div> :
                                        props.isSiteInformationView && <div className="formgroup eql-height ">

                                            {/* <Link className="actionBtn iconSize btnPrimary dticon" onClick={handleOpenHazardQRModal}>
                                                <TooltipHost content={"Print Hazard QR Code"} >
                                                    <FontAwesomeIcon icon="qrcode" />
                                                </TooltipHost>
                                            </Link> */}

                                            <Link className="actionBtn iconSize btnDownload dticon ml-10" onClick={handleDownload}>
                                                <TooltipHost content={"Print QR Code"} >
                                                    <FontAwesomeIcon icon="print" />
                                                </TooltipHost>
                                            </Link>
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg3 mt-10 " >
                                <div className="siteimg-logo">
                                    <img src={state.siteMasterItems?.siteImageUrl} className="img-fluid" />
                                </div>
                            </div>

                            {(!props.isGroupViewPage) ?
                                <>
                                    <div className={props.isSiteInformationView ? "ms-Grid-col ms-sm12 ms-md9 ms-lg7 mt-10" : "ms-Grid-col ms-sm12 ms-md9 ms-lg9 mt-10"} style={{ paddingLeft: "50px" }}>
                                        <div className="ms-Grid-row  ">
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12  ptb-10" >

                                                <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                                    Site Name
                                                </label>
                                                <div className=" ">
                                                    {!!state.siteMasterItems?.Title ? state.siteMasterItems?.Title : "-"}

                                                </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ptb-10" >

                                                <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                                    Category
                                                </label>
                                                <div className=" ">
                                                    {!!state.siteMasterItems?.Category ? state.siteMasterItems?.Category : "-"}
                                                </div>

                                            </div>

                                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ptb-10" >

                                                <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                                    State
                                                </label>
                                                <div className=" ">
                                                    {!!state.siteMasterItems?.QCStateName ? state.siteMasterItems?.QCStateName : "-"}

                                                </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ptb-10" >

                                                <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                                    Job Code
                                                </label>
                                                <div className=" ">
                                                    {!!state.siteMasterItems?.JobCode ? state.siteMasterItems?.JobCode : "-"}
                                                </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ptb-10" >

                                                <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                                    Dynamic Site Manager
                                                </label>
                                                <div className=" ">
                                                    {!!state.siteMasterItems?.DynamicSiteManager ? state.siteMasterItems?.DynamicSiteManager : "-"}
                                                </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg14 ptb-10" >

                                                <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                                    Safety Culture Id
                                                </label>
                                                <div className=" ">
                                                    {!!state.siteMasterItems?.SCSiteId ? state.siteMasterItems?.SCSiteId : "-"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {props.isSiteInformationView && <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg2 mt-10  text-align-right " >
                                        {props.qrCodeSrc ? (
                                            <img
                                                src={props.qrCodeSrc}
                                                alt="QR Code"
                                                style={{ border: '1px solid #ccc', borderRadius: '5px', width: "150px" }}
                                            />
                                        ) : (
                                            <p>Generating QR Code...</p>
                                        )}
                                    </ div>}

                                </>
                                :


                                <div className="ms-Grid-col ms-sm12 ms-md9 ms-lg9 mt-10 " style={{ paddingLeft: "50px" }}>
                                    <div className="ms-Grid-row  ">
                                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6  ptb-10" >

                                            <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                                Site Name
                                            </label>
                                            <div className=" ">
                                                {!!state.siteMasterItems?.Title ? state.siteMasterItems?.Title : "-"}

                                            </div>
                                        </div>
                                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6 ptb-10" >

                                            <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                                State
                                            </label>
                                            <div className=" ">
                                                {!!state.siteMasterItems?.QCStateName ? state.siteMasterItems?.QCStateName : "-"}

                                            </div>
                                        </div>
                                    </div>
                                </div>

                            }
                        </div>
                    </div>
                </div>


            </div>
            <div className="ms-Grid-row ">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                    <div className="formgroup eql-height boxCardNormal">
                        <div className="justifyContentBetween dflex">
                            <h3> Site Manager</h3>
                            <div>
                                {/* {(props.isShowAssetLocationAccess && props.isSiteInformationView) && <PrimaryButton className="btn btn-primary mr-10" text="Manage Location Access" onClick={!!props.onClickAccesLocation && props.onClickAccesLocation} />} */}
                                {(props.isCrudShow || !props.isSiteInformationView) && <PrimaryButton text="Add" className="btn btn-primary " onClick={() => onClickAddEdit(true, "SiteManagerId", "Site Manager")} />}
                            </div>
                        </div>
                        <div className="inputText  ptop-5">
                            {!!state.siteMasterItems ? (state.siteMasterItems?.SiteManagerId.length > 0 ?

                                <div className="dflex fwrap" style={{ width: "100%" }}>
                                    {state.siteMasterItems?.SiteManagerId.map((i: ICustomPeoplePicker) => {
                                        return <div className="personaCard dflex">
                                            {/* <UserPersonaById
                                                isHoverShow={true}
                                                className="ptop-5"
                                                context={context}
                                                AuthorId={i.Id}
                                                provider={provider}
                                                personSize={PersonaSize.size72}
                                            /> */}
                                            <UserPersonaByEmail
                                                email={i.emailId}
                                                title={i.title}
                                                size={PersonaSize.size24}
                                                showHoverDetail={true}
                                            />
                                            {/* {(props.isCrudShow || !props.isSiteInformationView) &&
                                                <div className="actionBtn btnDanger dticon zindex"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => onClickDeleteButton(i.Id, "SiteManagerId")}
                                                >
                                                    <FontAwesomeIcon icon={"trash-alt"} />
                                                </div>} */}

                                        </div>
                                    })}
                                </div>

                                : <NoRecordFound isSmall={true} />) : <NoRecordFound isSmall={true} />}
                        </div>
                    </div>
                </div>
            </div>
            <div className="ms-Grid-row ">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                    <div className="formgroup eql-height ptop boxCardNormal">
                        <div className="justifyContentBetween dflex">
                            <h3>  Site Supervisor</h3>
                            <div className="dflex">
                                {(props.isSiteInformationView && props.isShowSuperVisorAccess) &&
                                    <TooltipHost
                                        content={"Supervisor Access"}
                                    >
                                        <PrimaryButton
                                            iconProps={{ iconName: "Settings" }}
                                            className="btn btn-primary mr-10"
                                            text="Supervisor Access"
                                            onClick={!!props.onClickAddAccess && props.onClickAddAccess}
                                        />
                                    </TooltipHost>}
                                {(props.isCrudShow || !props.isSiteInformationView) && <PrimaryButton text="Add" className="btn btn-primary " onClick={() => onClickAddEdit(true, "SiteSupervisorId", "Site Supervisor")} />}

                            </div>
                        </div>
                        <div className="inputText  ptop-5">
                            {!!state.siteMasterItems ? (state.siteMasterItems?.SiteSupervisorId.length > 0 ?

                                <div className="dflex fwrap" style={{ width: "100%" }}>
                                    {state.siteMasterItems?.SiteSupervisorId.map((i: ICustomPeoplePicker) => {
                                        return <div className="personaCard dflex">

                                            {/* <UserPersonaById
                                                isHoverShow={true}
                                                className="ptop-5"
                                                context={context}
                                                AuthorId={i.Id}
                                                provider={provider}
                                                personSize={PersonaSize.size72}
                                            /> */}
                                            <UserPersonaByEmail
                                                email={i.emailId}
                                                title={i.title}
                                                size={PersonaSize.size24}
                                                showHoverDetail={true}
                                            />
                                            {/* {(props.isCrudShow || !props.isSiteInformationView) &&

                                                <div className="actionBtn btnDanger dticon zindex"
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => onClickDeleteButton(i.Id, "SiteSupervisorId")}
                                                >
                                                    <FontAwesomeIcon icon={"trash-alt"} />

                                                </div>} */}

                                        </div>
                                    })}
                                </div>

                                : <NoRecordFound isSmall={true} />) : <NoRecordFound isSmall={true} />}
                        </div>
                    </div>
                </div>
            </div>

            <div className="ms-Grid-row ">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                    <div className="formgroup eql-height ptop boxCardNormal">
                        <div className="justifyContentBetween dflex">
                            <h3> Client</h3>
                            <div>

                                {(props.isCrudShow || !props.isSiteInformationView) && <PrimaryButton text="Add" className="btn btn-primary " onClick={() => onClickAddEdit(true, "ADUserId", "Client")} />}
                            </div>

                        </div>
                        <div className="inputText ptop-5 ">
                            {!!state.siteMasterItems ? (state.siteMasterItems?.ADUserId.length > 0 ?

                                <div className="dflex fwrap" style={{ width: "100%" }}>
                                    {state.siteMasterItems?.ADUserId.map((i: ICustomPeoplePicker) => {
                                        return <div className="personaCard dflex">
                                            {/* <UserPersonaById
                                                isHoverShow={true}
                                                className="ptop-5"
                                                context={context}
                                                AuthorId={i.Id}
                                                provider={provider}
                                                personSize={PersonaSize.size72}
                                            /> */}
                                            <UserPersonaByEmail
                                                email={i.emailId}
                                                title={i.title}
                                                size={PersonaSize.size24}
                                                showHoverDetail={true}
                                            />
                                        </div>
                                    })}
                                </div>
                                : <NoRecordFound isSmall={true} />) : <NoRecordFound isSmall={true} />}
                        </div>
                    </div>
                </div>

            </div>
            {((!props.isGroupViewPage)) && <div className="ms-Grid-row ">
                {(props.isCrudShow || currentUserRoleDetail.isUser) && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                    <div className="formgroup eql-height ptop boxCardNormal">
                        <div className="justifyContentBetween dflex pt-10">
                            <h3> Configuration</h3>
                            <div>
                                {props.isCrudShow &&
                                    <TooltipHost
                                        content={"Manager KPI's Question"}
                                    >
                                        <PrimaryButton
                                            iconProps={{ iconName: "Settings" }}
                                            className="btn btn-primary mr-10"
                                            text="Manager KPI's Question"
                                            onClick={onClickManageQuestionEOM}
                                        />
                                    </TooltipHost>}
                                {props.isCrudShow &&
                                    <TooltipHost
                                        content={"Site KPI's Question"}
                                    >
                                        <PrimaryButton
                                            iconProps={{ iconName: "Settings" }}
                                            className="btn btn-primary mr-10"
                                            text="Site KPI's Question"
                                            onClick={onClickManageQuestion}
                                        />
                                    </TooltipHost>}
                                {/* {state?.siteMasterItems?.SubLocation && <PrimaryButton className="btn btn-primary" text="Add Location" onClick={!!props.onClickSubLocation && props.onClickSubLocation} />} */}
                            </div>
                        </div>

                        <div className="ms-Grid-row pt-10">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 linkGroup configuration-toggle">

                                <div>
                                    <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                        Periodic
                                    </label>
                                    <div className="inputText listDetail ">
                                        {!!state.siteMasterItems ? (state.siteMasterItems?.Periodic ? "Yes" : "No") : "No"}
                                    </div>
                                </div>
                                <div>

                                    <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                        Help Desk
                                    </label>
                                    <div className="inputText listDetail ">
                                        {!!state.siteMasterItems ? (state.siteMasterItems?.HelpDesk ? "Yes" : "No") : "No"}
                                    </div>
                                </div>
                                <div>

                                    <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                        Client Response
                                    </label>
                                    <div className="inputText listDetail ">
                                        {!!state.siteMasterItems ? (state.siteMasterItems?.ClientResponse ? "Yes" : "No") : "No"}
                                    </div>
                                </div>


                                <div>
                                    <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                        Site KPI's
                                    </label>
                                    <div className="inputText listDetail ">
                                        {!!state.siteMasterItems ? (state.siteMasterItems?.JobControlChecklist ? "Yes" : "No") : "No"}
                                    </div>
                                </div>
                                <div>
                                    <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                        Manage Events
                                    </label>
                                    <div className="inputText listDetail ">
                                        {!!state.siteMasterItems ? (state.siteMasterItems?.ManageEvents ? "Yes" : "No") : "No"}
                                    </div>
                                </div>
                                <div>
                                    <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                        eLearning
                                    </label>
                                    <div className="inputText listDetail ">
                                        {!!state.siteMasterItems ? (state.siteMasterItems?.eLearning ? "Yes" : "No") : "No"}
                                    </div>
                                </div>
                                <div>
                                    <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                        {WasteReportViewFields.WasteReport}
                                    </label>
                                    <div className="inputText listDetail ">
                                        {!!state.siteMasterItems ? (state.siteMasterItems?.SSWasteReport ? "Yes" : "No") : "No"}
                                    </div>
                                </div>
                                <div>
                                    <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                        {WasteReportViewFields.AmenitiesFeedbackForm}
                                    </label>
                                    <div className="inputText listDetail ">
                                        {!!state.siteMasterItems ? (state.siteMasterItems?.AmenitiesFeedbackForm ? "Yes" : "No") : "No"}
                                    </div>
                                </div>
                                <div>
                                    <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                        {WasteReportViewFields.DailyDutiesChecklists}
                                    </label>
                                    <div className="inputText listDetail ">
                                        {!!state.siteMasterItems ? (state.siteMasterItems?.IsDailyCleaningDuties ? "Yes" : "No") : "No"}
                                    </div>
                                </div>
                                <div>
                                    <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                        {WasteReportViewFields.IsResourceRecovery}
                                    </label>
                                    <div className="inputText listDetail ">
                                        {!!state.siteMasterItems ? (state.siteMasterItems?.IsResourceRecovery ? "Yes" : "No") : "No"}
                                    </div>
                                </div>

                                <div>
                                    <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                        Existing SharePoint Site Link
                                    </label>
                                    <div className="inputText listDetail ">
                                        {state.siteMasterItems?.ExistingSiteLink ?
                                            <div className="dflex">
                                                <Link
                                                    className="actionBtn dticon sitelinkBtn linkColor"
                                                    style={{ backgroundColor: "transparent" }}
                                                    onClick={() => {
                                                        const url = state.siteMasterItems?.ExistingSiteLink;
                                                        if (url) {
                                                            window.open(url, '_blank');
                                                        }
                                                    }}
                                                >
                                                    <TooltipHost content={"View Existing SharePoint Site Link"} >
                                                        <FontAwesomeIcon icon="link" /><span className="linklbl linkColor">Click to open</span>
                                                    </TooltipHost>
                                                </Link> </div> :
                                            <span>Link not found</span>}


                                    </div>
                                </div>
                                <div>
                                    <label className="viewLabel" style={{ backgroundColor: "transparent" }}>
                                        Do you have location available?
                                    </label>
                                    <div className="inputText listDetail ">
                                        {!!state.siteMasterItems ? (state.siteMasterItems?.SubLocation ? "Yes" : "No") : "No"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>}

            </div>}
            {!props.isSiteInformationView && <div className="ms-Grid-row ">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dflex" style={{ justifyContent: "end", marginBottom: "15px" }}>
                    <PrimaryButton className="btn btn-danger " onClick={() => {
                        props.manageComponentView({ currentComponentName: ComponentNameEnum.ManageSites, selectedKey: props.isGroupViewPage ? "Groups" : "Sites" });
                    }} text="Back" />

                </div>
            </div>}

        </div>

        {isDetails &&
            <Panel
                isOpen={isDetails}
                onDismiss={onClickClose}
                type={PanelType.custom}
                headerText="Site KPI's Question"
                onRenderFooterContent={onRenderFooterContent}
                customWidth="800px"
            >

                {!!items && items.length > 0 &&
                    <div>
                        <Checkbox
                            label="Select All"
                            checked={isAllSelected}
                            onChange={toggleSelectAll}
                            styles={{ root: { marginBottom: '12px' } }}
                        />
                        {items
                            .map(item => (
                                <div
                                    key={item.ID}
                                    style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}
                                >

                                    <div className="panel-icon-right">
                                        <Checkbox
                                            checked={item.isSelected}
                                            onChange={() => onCheckboxChange(item.ID, item.isSelected)}
                                        />
                                    </div>
                                    {editModeId === item.ID ? (
                                        <>
                                            <TextField
                                                className="formControl"
                                                style={{ marginTop: '3px' }}
                                                value={editData[item.ID] || item.Title}
                                                onChange={(e, newValue) =>
                                                    setEditData(prev => ({
                                                        ...prev,
                                                        [item.ID]: newValue || '',
                                                    }))
                                                }
                                            />
                                            <div className="panel-icon-left dflex">
                                                <Link
                                                    className="actionBtn btnEditName dticon"
                                                    onClick={() => saveEdit(item.ID)}
                                                >
                                                    <TooltipHost content="Save" id={`save_tooltip_${item.ID}`}>
                                                        <FontAwesomeIcon icon="save" />
                                                    </TooltipHost>
                                                </Link>
                                                <Link
                                                    className="actionBtn btnDanger dticon"
                                                    onClick={cancelEdit}
                                                >
                                                    <TooltipHost content="Cancel" id={`cancel_tooltip_${item.ID}`}>
                                                        <FontAwesomeIcon icon="times" />
                                                    </TooltipHost>
                                                </Link>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="question-span-cls" style={{ border: '1px solid #d8d8d8', borderRadius: "5px", padding: '10px' }}>{item.Title}</span>
                                            <div className="panel-icon-left">
                                                {editModeId === null && (
                                                    <Link
                                                        className="actionBtn btnMoving dticon"
                                                        onClick={() => toggleEditMode(item.ID)}
                                                    >
                                                        <TooltipHost content="Edit" id={`edit_tooltip_${item.ID}`}>
                                                            <FontAwesomeIcon icon="edit" />
                                                        </TooltipHost>
                                                    </Link>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                    </div>
                }
                {items.length === 0 &&
                    <div>
                        <NoRecordFound />
                    </div>}
                {/* <div>
                            <h3>Selected Records</h3>
                            <pre>{JSON.stringify(getSelectedItems(), null, 2)}</pre>
                        </div> */}
            </Panel >
        }

        {isDetailsEOM &&
            <Panel
                isOpen={isDetailsEOM}
                onDismiss={onClickCloseEOM}
                type={PanelType.custom}
                headerText="Manager KPI's Question"
                onRenderFooterContent={onRenderFooterContentEOM}
                customWidth="800px"
            >

                {!!itemsEOM && itemsEOM.length > 0 &&
                    <div>
                        <Checkbox
                            label="Select All"
                            checked={isAllSelectedEOM}
                            onChange={toggleSelectAllEOM}
                            styles={{ root: { marginBottom: '12px' } }}
                        />
                        {itemsEOM
                            .map(item => (
                                <div
                                    key={item.ID}
                                    style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}
                                >

                                    <div className="panel-icon-right">
                                        <Checkbox
                                            checked={item.isSelected}
                                            onChange={() => onCheckboxChangeEOM(item.ID, item.isSelected)}
                                        />
                                    </div>
                                    {editModeIdEOM === item.ID ? (
                                        <>
                                            <TextField
                                                className="formControl"
                                                style={{ marginTop: '3px' }}
                                                value={editDataEOM[item.ID] || item.Title}
                                                onChange={(e, newValue) =>
                                                    setEditDataEOM(prev => ({
                                                        ...prev,
                                                        [item.ID]: newValue || '',
                                                    }))
                                                }
                                            />
                                            <div className="panel-icon-left dflex">
                                                <Link
                                                    className="actionBtn btnEditName dticon"
                                                    onClick={() => saveEditEOM(item.ID)}
                                                >
                                                    <TooltipHost content="Save" id={`save_tooltip_${item.ID}`}>
                                                        <FontAwesomeIcon icon="save" />
                                                    </TooltipHost>
                                                </Link>
                                                <Link
                                                    className="actionBtn btnDanger dticon"
                                                    onClick={cancelEditEOM}
                                                >
                                                    <TooltipHost content="Cancel" id={`cancel_tooltip_${item.ID}`}>
                                                        <FontAwesomeIcon icon="times" />
                                                    </TooltipHost>
                                                </Link>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="question-span-cls" style={{ border: '1px solid #d8d8d8', borderRadius: "5px", padding: '10px' }}>{item.Title}</span>
                                            <div className="panel-icon-left">
                                                {editModeIdEOM === null && (
                                                    <Link
                                                        className="actionBtn btnMoving dticon"
                                                        onClick={() => toggleEditModeEOM(item.ID)}
                                                    >
                                                        <TooltipHost content="Edit" id={`edit_tooltip_${item.ID}`}>
                                                            <FontAwesomeIcon icon="edit" />
                                                        </TooltipHost>
                                                    </Link>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                    </div>
                }

                {itemsEOM.length === 0 &&
                    <div>
                        <NoRecordFound />
                    </div>}
                {/* <div>
                            <h3>Selected Records</h3>
                            <pre>{JSON.stringify(getSelectedItems(), null, 2)}</pre>
                        </div> */}
            </Panel >
        }
    </div >
}