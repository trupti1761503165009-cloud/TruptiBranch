/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { ListNames, UserActionEntityTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { IReactSelectOptionProps } from "../../../../../Interfaces/IReactSelectOptionProps";
import { Checkbox, DefaultButton, DialogFooter, Dropdown, FocusTrapZone, IconButton, IDropdownOption, Label, Layer, Link, mergeStyleSets, Overlay, Panel, PanelType, Popup, PrimaryButton, TextField, TooltipHost } from "@fluentui/react";
import CustomModal from "../../CommonComponents/CustomModal";
import { toastService } from "../../../../../Common/ToastService";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ManufacturerATMFilter } from "../../../../../Common/Filter/ManufacturerATM";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loader } from "../../CommonComponents/Loader";
import { ChecklistTypeFilter } from "../../../../../Common/Filter/QuestionChecklistType";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import moment from "moment";
import { getStateBySiteId, UserActivityLog } from "../../../../../Common/Util";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { IReactDropOptionProps } from "../../CommonComponents/reactSelect/IReactDropOptionProps";
import { QuestionTypeFilter } from "../../../../../Common/Filter/QuestionType";
import { QuestionOptionFilter } from "../../../../../Common/Filter/QuestionOption";

export interface IAssetTypeMasterProps {
    provider: IDataProvider;
    assetMasterId: number;
    isModelOpen: boolean;
    context: WebPartContext;
    onClickClose(): any;
    AssetTypeMasterId: Number;
    assetMasterName?: any;
    AssetTypeMaster: string;
    ATMManufacturer: string;
    siteNameId?: any;
}

export interface IAssetTypeMasterState {
    siteMasterOptions: IReactSelectOptionProps[];
    assetMastesItems: any;
    dialogContent: any;
    isModelOpen: boolean;
    SiteMasterId?: number;
}

export const AssociatAssetType = (props: IAssetTypeMasterProps) => {
    const [state, SetState] = React.useState<IAssetTypeMasterState>({
        siteMasterOptions: [],
        assetMastesItems: null,
        dialogContent: null,
        isModelOpen: props.isModelOpen,
    });
    const defaultQuestion = {
        // AssetTypeId: ,//Bind save time
        ChecklistType: "Both",
        Index: 0,
        IsEdited: true,
        IsRequired: true,
        // Manufacturer: "",//bind save time
        Option: "Yes|No|N/A",
        // QuestionMasterId: 1800,//not require
        QuestionType: "Choice",
        // SiteNameId: props.siteNameId,//bind save time
        Title: "",
        isNewAdded: true,
        isSelected: true,
        ID: "",
        Id: ""

    }
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const [isDeleteDialogShow, setIsDeleteDialogShow] = React.useState<boolean>(false)
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isSaved, setIsSaved] = React.useState<boolean>(false);
    const [isNewSaved, setIsNewSaved] = React.useState<boolean>(false);
    const [isUpdated, setIsUpdated] = React.useState<boolean>(false);
    const [selectedManufacturerATM, setSelectedManufacturerATM] = React.useState<any>(props.ATMManufacturer);
    const [selectedAssetTypeMaster, setSelectedAssetTypeMaster] = React.useState<any>(props.AssetTypeMasterId);
    const [optionsList, setOptionsList] = React.useState<IDropdownOption[]>([]);
    const [isActive, setisActive] = React.useState<any>(false);
    const [isDisable, setisDisable] = React.useState<any>(true);
    const [isVisibleIcon, setisVisibleIcon] = React.useState<any>(false);
    const [isPopupVisibleAction, { setTrue: showPopupAction, setFalse: hidePopupAction }] = useBoolean(false);
    const tooltipId = useId('tooltip');
    const [isDetails, setIsDetails] = React.useState<boolean>(false);
    const [ListData, setListData] = React.useState<any[]>([]);
    const [UpdateData, setUpdateData] = React.useState<any[]>([]);
    const [isAllSelected, setIsAllSelected] = React.useState(true);
    const [selectedItems, setSelectedItems] = React.useState<any[]>([]);
    const [editData, setEditData] = React.useState<Record<string, { Title: string, ChecklistType: string, QuestionType: string, Option: string }>>({});
    const [showError, setShowError] = React.useState<Record<string, string>>({})
    const [editModeId, setEditModeId] = React.useState<any>(null); // Track the active edit mode
    const [width, setWidth] = React.useState<string>("450px");
    const [isPanelOpen, setIsPanelOpen] = React.useState(true);
    const [selectedChecklistType, setSelectedChecklistType] = React.useState<string>("");
    const [isQuestionShowError, setIsQuestionShowError] = React.useState<Record<string, { isTitleErrorShow: boolean }>>({})
    // const onDropdownChange = (event: React.FormEvent<HTMLDivElement>, option: any) => {
    //     setSelectedChecklistType(option.key);
    //     // event.stopPropagation(); // Prevent panel close
    // };
    const onDropdownChange = (option: any) => {
        setSelectedChecklistType(!!option ? option : "");
        // event.stopPropagation(); // Prevent panel close
    };


    const onCancelDeleteClick = () => {
        setIsDeleteDialogShow(false)

    }



    const onDeleteYesClick = () => {
        const updateItems = items.filter((i) => i.ID != editModeId);
        setItems(updateItems)
        setIsDeleteDialogShow(false)
        setEditModeId(null);
        setEditData(prev => {
            const { [editModeId]: _, ...rest } = prev; // Clear the temporary edit entry
            return rest;
        });

    }

    const onClickClose = () => {
        if ((Number(props.AssetTypeMasterId) > 0 && props.ATMManufacturer !== "") || isSaved) {
            _EditData(props.AssetTypeMasterId, props.ATMManufacturer);
            setEditModeId(null);
        } else {
            _Data(selectedAssetTypeMaster);
            resetAllStates();
        }
        setIsDetails(false);
    };

    const resetAllStates = () => {
        // Reset all items to not selected
        setItems(prevItems =>
            prevItems.map(item => ({
                ...item,
                isSelected: false // Uncheck all checkboxes
            }))
        );
        // Reset the "Select All" state
        setIsAllSelected(false);
        // Close the edit mode
        setEditModeId(null);
        // Add any additional state reset logic here if necessary
    };


    const _onClickViewQuestion = () => {
        setIsDetails(true);
    };

    const onClickSave = async () => {
        let toastMessage: string = "";
        const toastId = toastService.loading('Loading...');
        toastMessage = 'Question update successfully!';
        setIsLoading(true);
        if (!!selectedItems && selectedItems.length > 0) {

            let UpdateItems = selectedItems.map((item) => {
                if (!!item?.isNewAdded) {
                    const { QuestionMasterId, isNewAdded, ID, Id, ...rest } = item
                    return {
                        ...rest,
                        AssetTypeId: !!selectedAssetTypeMaster ? selectedAssetTypeMaster : props.AssetTypeMasterId || null,
                        Manufacturer: selectedManufacturerATM || "",
                        SiteNameId: props.siteNameId || null,
                    }

                } else {
                    return item
                }

            })

            await props.provider.createItemInBatch(UpdateItems, ListNames.Questions);
            setIsLoading(false);
            setIsSaved(true);
            setIsNewSaved(false);
            setIsDetails(false);
            toastService.updateLoadingWithSuccess(toastId, toastMessage);
            console.log("Success");
        }
    };

    const onClickUpdate = async () => {
        let filterItems = selectedItems.filter((i) => i?.isNewAdded)
        let newAddQuestion: any[] = []
        if (!!filterItems.length) {
            newAddQuestion = filterItems.map((item) => {
                if (!!item?.isNewAdded) {
                    const { QuestionMasterId, isNewAdded, ID, Id, ...rest } = item
                    return {
                        ...rest,
                        AssetTypeId: !!selectedAssetTypeMaster ? selectedAssetTypeMaster : props.AssetTypeMasterId || null,
                        Manufacturer: selectedManufacturerATM || "",
                        SiteNameId: props.siteNameId || null,
                    }

                } else {
                    return item
                }

            })
        }
        let mainSelectedItems = selectedItems.filter((i) => !i?.isNewAdded)
        const updatedData = mainSelectedItems
            .filter(item => item.SiteName !== "Null")  // Filter out items with SiteName === "Null"
            .map(item => ({
                Id: Number(item.QuestionMasterId),  // Rename QuestionMasterId to ID
                Title: item.Title,                  // Keep the Title field
                IsEdited: item.IsEdited,
                ChecklistType: item.ChecklistType,
                QuestionType: item.QuestionType,
                Option: item.Option
                // Keep the IsEdited field
            }));

        let toastMessage: string = "";
        const toastId = toastService.loading('Loading...');
        toastMessage = 'Question update successfully!';

        const filteredQuestions = mainSelectedItems
            .filter(item => item.SiteName === "Null")  // Filter for SiteName "Null"
            .map(({ SiteName, QuestionMaster, ...rest }) => ({
                QuestionMasterId: QuestionMaster, // Ensure you're using the 4-digit value from QuestionMaster
                ...rest,  // Spread the rest of the fields into the object
            }));


        let updatedQuestions = filteredQuestions.map((filteredQuestion) => {
            const selectedItem = mainSelectedItems.find(
                (item) => item.QuestionMasterId === filteredQuestion.QuestionMasterId
            );
            if (selectedItem) {
                // Update QuestionMasterId with the value from the selectedItems
                return {
                    ...filteredQuestion,
                    QuestionMasterId: selectedItem.QuestionMaster
                };
            }
            return filteredQuestion;
        });

        setIsLoading(true);
        if (!!newAddQuestion && newAddQuestion.length > 0) {
            await props.provider.createItemInBatch(newAddQuestion, ListNames.Questions);
            newAddQuestion = [];
        }
        if (!!updatedQuestions && updatedQuestions.length > 0) {
            await props.provider.createItemInBatch(updatedQuestions, ListNames.Questions);
            updatedQuestions = [];
        }

        if (!!updatedData && updatedData.length > 0) {
            await props.provider.updateListItemsInBatchPnP(ListNames.Questions, updatedData);
            setIsLoading(false);
            toastService.updateLoadingWithSuccess(toastId, toastMessage);
            console.log("Success");
            setIsDetails(false);
            setIsUpdated(true);
        }
    };

    const onRenderFooterContent = () => {

        if (((Number(props.AssetTypeMasterId) > 0 && props.ATMManufacturer !== "") || isSaved) && !isNewSaved) {
            return <div className="dflex">
                {!!items && items.length > 0 && <div className="margin-sm-add-btn-panel">
                    <PrimaryButton className={!!editModeId ? "" : "btn btn-primary"} disabled={!!editModeId ? true : false} onClick={onClickUpdate} text="Update" />
                </div>}
                <div className="margin-sm-add-btn-panel">
                    <PrimaryButton className="btn btn-danger" onClick={onClickClose} text="Close" />
                </div>
            </div>;
        } else {
            return <div className="dflex">

                {!!items && items.length > 0 && <div className="margin-sm-add-btn-panel">
                    <PrimaryButton className={!!editModeId ? "" : "btn btn-primary"} disabled={!!editModeId ? true : false} onClick={onClickSave} text="Save" />
                </div>}
                <div className="margin-sm-add-btn-panel">
                    <PrimaryButton className="btn btn-danger" onClick={onClickClose} text="Close" />
                </div>
            </div>;
        }

    };

    const onAssetTypeMasterChange = (AssetTypeMasterId: any): void => {


        setSelectedAssetTypeMaster(AssetTypeMasterId.value);
        _Data(AssetTypeMasterId.value);
        _EditData(AssetTypeMasterId.value, selectedManufacturerATM);
        setisVisibleIcon(true);
    };

    const _Data = async (AssetTypeMasterId: any) => {
        try {
            const selectFields = [
                "ID", "Title", "Modified", "AssetTypeId", "AssetType", "AssetType/Title", "Option", "IsRequired", "QuestionType", "ChecklistType", "Manufacturer", "Index"
            ];
            const filterArray: string[] = [];
            filterArray.push(`<Eq><FieldRef Name='IsActive'/><Value Type='Integer'>1</Value></Eq>`);
            if (selectedManufacturerATM) {
                filterArray.push(`<Eq><FieldRef Name='Manufacturer'/><Value Type='Text'>${selectedManufacturerATM}</Value></Eq>`);
            }
            if (AssetTypeMasterId) {
                filterArray.push(`<Eq><FieldRef Name='AssetType' LookupId='TRUE'/><Value Type='Lookup'>${AssetTypeMasterId}</Value></Eq>`);
            }
            let combinedFilter = '';
            if (filterArray.length > 1) {
                combinedFilter = filterArray.reduce((prev, current) => `<And>${prev}${current}</And>`);
            } else if (filterArray.length === 1) {
                combinedFilter = filterArray[0];
            }
            // Wrap the combined filters in <Where> if there are any filters
            const queryFilter = combinedFilter ? `<Where>${combinedFilter}</Where>` : '';
            // Build CAML Query
            const camlQuery = `
    <View>
        <ViewFields>
            ${selectFields.map(field => `<FieldRef Name='${field}' />`).join('')}
        </ViewFields>
        <Query>
            ${queryFilter}
        </Query>
        <RowLimit>5000</RowLimit>
    </View>
`;


            const siteURL = props.context.pageContext.web.absoluteUrl;
            const results = await props.provider.getItemsByCAMLQuery(ListNames.QuestionMaster, camlQuery, null, siteURL);
            if (!!results) {
                const Listitem = results.map((data) => {
                    return (
                        {
                            ID: data.ID,
                            Title: data.Title,
                            AssetTypeId: !!data.AssetType[0] ? data.AssetType[0].lookupId : null,
                            AssetType: !!data.AssetType[0] ? data.AssetType[0].lookupValue : "",
                            Manufacturer: !!data.Manufacturer ? data.Manufacturer : "",
                            Option: !!data.Option ? data.Option : '',
                            SpaceOption: !!data.Option ? data.Option.includes('|') ? data.Option.replace(/\|/g, ' | ') : data.Option : '',
                            IsRequired: !!data.IsRequired === true ? true : false,
                            QuestionType: !!data.QuestionType ? data.QuestionType : '',
                            ChecklistType: !!data.ChecklistType ? data.ChecklistType : '',
                            Modified: !!data.Modified ? data.Modified : null,
                            Index: !!data.Index ? data.Index : 0,
                        }
                    );
                });
                setListData(Listitem);
            }

        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    };

    const _EditData = async (AssetTypeMaster: any, Manufacturer: any) => {
        try {
            const selectFields = [
                "ID", "QuestionMasterId", "QuestionMaster", "QuestionMaster/Title", "SiteNameId", "SiteName", "SiteName/Title", "Title", "Modified", "AssetTypeId", "AssetType", "AssetType/Title", "Option", "IsRequired", "QuestionType", "ChecklistType", "Manufacturer", "Index", "IsEdited"
            ];
            const filterArray: string[] = [];
            filterArray.push(`<Eq><FieldRef Name='IsActive'/><Value Type='Integer'>1</Value></Eq>`);
            filterArray.push(`<Eq><FieldRef Name='Manufacturer'/><Value Type='Text'>${Manufacturer}</Value></Eq>`);
            filterArray.push(`<Eq><FieldRef Name='AssetType' LookupId='TRUE'/><Value Type='Lookup'>${AssetTypeMaster}</Value></Eq>`);
            filterArray.push(`<Eq><FieldRef Name='SiteName' LookupId='TRUE'/><Value Type='Lookup'>${props?.siteNameId}</Value></Eq>`);
            let combinedFilter = '';
            if (filterArray.length > 1) {
                combinedFilter = filterArray.reduce((prev, current) => `<And>${prev}${current}</And>`);
            } else if (filterArray.length === 1) {
                combinedFilter = filterArray[0];
            }
            const queryFilter = combinedFilter ? `<Where>${combinedFilter}</Where>` : '';
            const camlQuery = `
    <View>
        <ViewFields>
            ${selectFields.map(field => `<FieldRef Name='${field}' />`).join('')}
        </ViewFields>
        <Query>
            ${queryFilter}
        </Query>
        <RowLimit>5000</RowLimit>
    </View>
`;

            const siteURL = props.context.pageContext.web.absoluteUrl;
            const results = await props.provider.getItemsByCAMLQuery(ListNames.Questions, camlQuery, null, siteURL);
            if (!!results) {
                const EditItem = results.map((data) => {
                    return (
                        {
                            ID: data.ID,
                            Title: data.Title,
                            AssetTypeId: !!data.AssetType[0] ? data.AssetType[0].lookupId : null,
                            QuestionMaster: !!data.QuestionMaster[0] ? data.QuestionMaster[0]?.lookupId : null,
                            AssetType: !!data.AssetType[0] ? data.AssetType[0].lookupValue : "",
                            Manufacturer: !!data.Manufacturer ? data.Manufacturer : "",
                            Option: !!data.Option ? data.Option.includes(' | ') ? data.Option.replace(/\|/g, '|') : data.Option : '',
                            SpaceOption: !!data.Option ? data.Option : '',
                            IsRequired: !!data.IsRequired === true ? true : false,
                            IsEdited: data.IsEdited,
                            QuestionType: !!data.QuestionType ? data.QuestionType : '',
                            ChecklistType: !!data.ChecklistType ? data.ChecklistType : '',
                            Modified: !!data.Modified ? data.Modified : null,
                            Index: !!data.Index ? data.Index : 0,
                            SiteNameId: !!data.SiteName[0] ? data.SiteName[0].lookupId : null,
                            SiteName: !!data.SiteName[0] ? data.SiteName[0].lookupValue : "",
                        }
                    );
                });
                setUpdateData(EditItem);
                if (!!EditItem && EditItem.length > 0) {
                    setIsSaved(true);
                    setIsNewSaved(false);
                } else {
                    setIsNewSaved(true);
                }
            }
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    };

    const onManufacturerATMChange = (manufacturer: any): void => {
        setSelectedManufacturerATM(manufacturer.text);
        // setSelectedManufacturerATM(manufacturer.value);
        setSelectedAssetTypeMaster("");
        setisVisibleIcon(false);
    };

    const onCloseModel = () => {
        props.onClickClose();
        SetState(prevState => ({ ...prevState, isModelOpen: false }));
    };

    React.useEffect(() => {

        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("450px");
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

    const mergeItems = (updatedItems: any, listData: any) => {
        // Extract all QuestionMaster IDs from updatedItems for quick lookup
        const questionMasterIds = updatedItems.map((item: any) => Number(item.QuestionMaster));

        // Iterate through ListData to check for missing records
        let lastTimestamp = 0;  // Store the last timestamp to avoid duplicate IDs within the same millisecond
        let counter = 0;  // Counter to ensure uniqueness even if multiple records are processed in the same millisecond

        listData.forEach((item: any) => {
            const timestamp = Date.now();
            // If the timestamp hasn't changed, increment the counter to ensure a unique ID
            if (timestamp === lastTimestamp) {
                counter++;
            } else {
                counter = 0;  // Reset counter if the timestamp changes
                lastTimestamp = timestamp;
            }

            // Generate a unique ID using timestamp and counter, ensuring the result is always 8 digits
            const uniquePart = (timestamp % 100000000).toString().padStart(8, '0');  // 8 digits from timestamp
            const uniqueId = (uniquePart + counter.toString().padStart(3, '0')).slice(0, 8); // Add counter and ensure 8 digits

            let id = uniqueId;  // Unique ID for the current item

            if (!questionMasterIds.includes(Number(item.ID))) {
                const newItem = {
                    ID: id + Number(item.ID),  // Unique ID
                    Title: item.Title,
                    isSelected: false,
                    AssetTypeId: item.AssetTypeId,
                    QuestionMaster: Number(item.ID),
                    AssetType: item.AssetType,
                    Manufacturer: item.Manufacturer,
                    Option: item.Option,
                    SpaceOption: item.SpaceOption,
                    IsRequired: item.IsRequired,
                    QuestionType: item.QuestionType,
                    ChecklistType: item.ChecklistType,
                    Modified: item.Modified,
                    Index: "0",
                    SiteNameId: updatedItems[0]?.SiteNameId,  // Adjust based on your context
                    SiteName: "Null"
                };

                // Add new item to updatedItems array
                updatedItems.push(newItem);
            }
        });
        return updatedItems;
    };


    const onClickYesDelete = async () => {
        try {
            const toastMessage = 'Delete Association successfully!';
            let editObj: any = {
                AssetTypeMasterId: null,
                ATMManufacturer: ""
            };
            if (!!props.assetMasterId) {
                const toastId = toastService.loading('Loading...');
                await props.provider.updateItemWithPnP(editObj, ListNames.AssetMaster, props.assetMasterId);
                const stateId = await getStateBySiteId(props.provider, Number(props.siteNameId));
                const logObj = {
                    UserName: currentUserRoleDetail?.title,
                    SiteNameId: Number(props.siteNameId),
                    ActionType: "Delete",
                    EntityType: UserActionEntityTypeEnum.EquipmentAsset,
                    EntityId: Number(props.assetMasterId),
                    EntityName: props.assetMasterName,
                    Details: `Delete Associate Asset Type`,
                    StateId: stateId,
                };
                void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                props.onClickClose();
                SetState(prevState => ({ ...prevState, isModelOpen: false }));
            } else {
                toastService.error('Data is Missing ');
            }

        } catch (error) {
            console.log(error);
        }
    };

    const onClickNoDelete = () => {
        hidePopupAction();
    };

    const onClickOfYes = async () => {
        try {
            const toastMessage = 'Asset Type Associated successfully!';
            let editObj: any = {
                AssetTypeMasterId: selectedAssetTypeMaster,
                ATMManufacturer: selectedManufacturerATM
            };
            if (!!props.assetMasterId) {
                const toastId = toastService.loading('Loading...');
                await props.provider.updateItemWithPnP(editObj, ListNames.AssetMaster, props.assetMasterId);
                const stateId = await getStateBySiteId(provider, Number(props.siteNameId));
                const logObj = {
                    UserName: currentUserRoleDetail?.title,
                    SiteNameId: Number(props.siteNameId),
                    ActionType: "Update",
                    EntityType: UserActionEntityTypeEnum.EquipmentAsset,
                    EntityId: Number(props.assetMasterId),
                    EntityName: props.assetMasterName,
                    Details: `Update Associate Asset Type`,
                    StateId: stateId,
                };
                void UserActivityLog(props.provider, logObj, currentUserRoleDetail);

                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                props.onClickClose();
                SetState(prevState => ({ ...prevState, isModelOpen: false }));
            } else {
                toastService.error('Data is Missing ');
            }

        } catch (error) {
            console.log(error);
        }
    };

    const onClickOfRemove = async () => {
        showPopupAction();
    };

    const saveEdit = (id: string) => {
        const currenItems = editData[id]

        if (!currenItems || !currenItems?.Title) {
            setIsQuestionShowError((prevState: any) => ({
                ...prevState,
                [id]: { isTitleErrorShow: true }
            }))


        } else {
            setIsQuestionShowError((prevState: any) => {
                const next = { ...prevState };
                delete next[id];   // remove the entry
                return next;
            });
            setItems(prevItems =>
                prevItems.map(item =>
                    item.ID === id
                        ? {
                            ...item,
                            Title: editData[id]?.Title || item.Title,
                            ChecklistType: editData[id]?.ChecklistType || item.ChecklistType,
                            QuestionType: editData[id]?.QuestionType,
                            Option: editData[id]?.QuestionType == "Choice" ? editData[id]?.Option : ""
                        }
                        : item
                )
            );
            setEditModeId(null); // Exit edit mode
            setEditData(prev => {
                const { [id]: _, ...rest } = prev; // Remove the saved entry from editData
                return rest;
            });
        }


    };

    const cancelEdit = (item: any) => {

        if (item?.isNewAdded) {
            setIsDeleteDialogShow(true);

        } else {
            setEditModeId(null);
            setEditData(prev => {
                const { [editModeId]: _, ...rest } = prev; // Clear the temporary edit entry
                return rest;
            });
        }
    };

    React.useEffect(() => {
        if (selectedAssetTypeMaster > 0 && selectedManufacturerATM !== "") {
            if (isSaved) {
                _EditData(selectedAssetTypeMaster, selectedManufacturerATM);
            } else {
                _EditData(props.AssetTypeMasterId, props.ATMManufacturer);
            }
        }
        let filter = "";
        if (selectedManufacturerATM) {
            filter = `Manufacturer eq '${selectedManufacturerATM}'`;
        } else {
            filter = `Manufacturer eq '${props.ATMManufacturer}'`;
        }

        const select = ["Id,Title"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.AssetTypeMaster,
            filter: `Manufacturer eq '${selectedManufacturerATM}'`
        };
        let dropvalue: any = [];
        props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
            response.map((State: any) => {
                dropvalue.push({ value: State.Id, key: State.Id, text: State.Title, label: State.Title });
            });
            setOptionsList(dropvalue);
        }).catch((error) => {
            console.log(error);
        });


    }, [selectedManufacturerATM, isSaved, isUpdated]);

    React.useEffect(() => {
        if (selectedManufacturerATM) {
            setisActive(true);
        } else {
            setisActive(false);
        }
        if (selectedManufacturerATM && selectedAssetTypeMaster) {
            setisDisable(false);
        } else {
            setisDisable(true);
        }

        if (props.AssetTypeMasterId !== 0) {
            setisVisibleIcon(true);
            _Data(selectedAssetTypeMaster);
        }
        setIsLoading(false);
    }, [selectedManufacturerATM, selectedAssetTypeMaster]);

    const [items, setItems] = React.useState<any[]>([]);


    React.useEffect(() => {
        setItems(
            ListData.map(item => ({
                ...item,
                isEditable: false,
                isSelected: true
            }))
        );
        setIsAllSelected(true);
    }, [ListData]);

    const onCheckboxChange = (id: string, isSelected: boolean) => {
        const updatedItems = items.map(item =>
            item.ID === id ? { ...item, isSelected: !isSelected } : item
        );
        setItems(updatedItems);
        setIsAllSelected(updatedItems.every(item => item.isSelected)); // Update the "Select All" state
    };

    const toggleEditMode = (id: string) => {
        setEditModeId(id); // Set the current item in edit mode
        const currenItems = items.find(item => item.ID === id)
        setEditData((prev: any) => ({
            ...prev,
            // [id]: items.find(item => item.ID === id)?.Title || '', // Initialize editData for this item
            [id]: {
                Title: currenItems?.Title || "",
                ChecklistType: currenItems.ChecklistType,
                QuestionType: currenItems.QuestionType,
                Option: currenItems.Option || "Yes|No|N/A"
            }
        }));
    };

    React.useEffect(() => {
        const updatedData = items.map(({ ID, ...rest }) => ({
            QuestionMasterId: Number(ID),
            ...rest,
        }));
        const updatedDataObj = updatedData.map(item => {
            const {
                ID,
                AssetType,
                SpaceOption,
                Modified,
                isEditable,
                isSelected,
                ...rest
            } = item;

            return {
                ...rest,
                IsEdited: isSelected, // Rename isSelected to isActive
                SiteNameId: props?.siteNameId
            };
        });
        setSelectedItems(updatedDataObj);
    }, [items]);


    const onClickAddNewQuestion = () => {
        const newQuestionCount = items.filter((i) => i.isNewAdded)?.length || 0;
        const newQuestionId = `New-${newQuestionCount + 1}`
        const newQuestion = { ...defaultQuestion, Id: `${newQuestionId}`, ID: `${newQuestionId}` }
        const allQuestion = [newQuestion, ...items]
        setEditModeId(newQuestionId)
        setEditData((prev: any) => ({
            ...prev,
            // [id]: items.find(item => item.ID === id)?.Title || '', // Initialize editData for this item
            [newQuestionId]: {
                Title: defaultQuestion?.Title || "",
                ChecklistType: defaultQuestion.ChecklistType,
                QuestionType: defaultQuestion.QuestionType,
                Option: defaultQuestion.Option || "Yes|No|N/A"
            }
        }));
        setItems(allQuestion)

    }


    React.useEffect(() => {
        if (UpdateData.length > 0) {

            const updatedItems = UpdateData.map(({ ID, Title, IsEdited, ...rest }) => ({
                ID,
                Title,
                isSelected: IsEdited === "Yes" ? true : false, // Use IsEdited to determine initial selection state
                ...rest
            }));
            const result = mergeItems(updatedItems, ListData);
            setItems(result);
        }
    }, [UpdateData]);

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


    return <>
        {isLoading && <Loader />}
        {props.AssetTypeMasterId === 0 ?
            <>
                <CustomModal isModalOpenProps={state.isModelOpen}
                    isBlocking={true}
                    isModeless={false}
                    setModalpopUpFalse={onCloseModel}
                    subject="Associate Asset Type"
                    message={<>
                        <Label className="formLabel">Manufacturer<span className="required">*</span></Label>
                        <ManufacturerATMFilter
                            selectedManufacturerATM={selectedManufacturerATM}
                            defaultOption={!!selectedManufacturerATM ? selectedManufacturerATM : ""}
                            onOptionChange={onManufacturerATMChange}
                            provider={props.provider}
                            isRequired={true} />

                        {isActive &&
                            <div>
                                <Label className="formLabel">Asset Type<span className="required"> *</span></Label>
                                <div className="formControl">
                                    < ReactDropdown
                                        options={optionsList}
                                        isMultiSelect={false}
                                        defaultOption={!!selectedAssetTypeMaster ? selectedAssetTypeMaster : props?.AssetTypeMaster}
                                        onChange={onAssetTypeMasterChange}
                                        placeholder={"Asset Type"}
                                    />
                                </div></div>}
                        {isVisibleIcon && <div className="mt-2 dflex cls-pointer" onClick={_onClickViewQuestion}> <span><Link className="actionBtn btnView dticon">
                            <TooltipHost content={"View Question"} id={tooltipId}>
                                <FontAwesomeIcon icon="eye" />
                            </TooltipHost>
                        </Link></span><span className="mt-1">View Questions</span></div >}
                    </>}
                    closeButtonText={"Close"}
                    onClickOfYes={onClickOfYes}
                    isYesButtonDisbale={isDisable}
                    yesButtonText={props.AssetTypeMasterId === 0 ? "Save" : "Update"}
                />
            </>
            :
            <>
                <CustomModal isModalOpenProps={state.isModelOpen}
                    setModalpopUpFalse={onCloseModel}
                    isBlocking={true}
                    isModeless={false}
                    subject="Associate Asset Type"
                    message={<>
                        <Label className="formLabel">Manufacturer<span className="required">*</span></Label>
                        <ManufacturerATMFilter
                            selectedManufacturerATM={selectedManufacturerATM}
                            defaultOption={!!selectedManufacturerATM ? selectedManufacturerATM : ""}
                            onOptionChange={onManufacturerATMChange}
                            provider={props.provider}
                            isRequired={true} />

                        <div>
                            <Label className="formLabel">Asset Type<span className="required"> *</span></Label>
                            <div className="formControl">
                                < ReactDropdown
                                    options={optionsList}
                                    isMultiSelect={false}
                                    defaultOption={!!selectedAssetTypeMaster ? selectedAssetTypeMaster : props?.AssetTypeMaster}
                                    onChange={onAssetTypeMasterChange}
                                    placeholder={"Asset Type"}
                                />
                            </div></div>
                        {isVisibleIcon && <div className="mt-2 dflex  cls-pointer" onClick={_onClickViewQuestion}> <span><Link className="actionBtn btnView dticon">
                            <TooltipHost content={"View Question"} id={tooltipId}>
                                <FontAwesomeIcon icon="eye" />
                            </TooltipHost>
                        </Link></span><span className="mt-1">View Questions</span></div >}
                    </>}
                    closeButtonText={"Close"}
                    onClickOfYes={onClickOfYes}
                    isYesButtonDisbale={isDisable}
                    yesButtonText={props.AssetTypeMasterId === 0 ? "Save" : "Update"}
                    onClickOfRemove={onClickOfRemove}
                    isRemoveButtonDisbale={isDisable}
                    removeButtonText={"Delete Association"}
                />
            </>
        }
        {isPopupVisibleAction && (
            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={hidePopupAction}
                >
                    <Overlay onClick={hidePopupAction} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Delete Confirmation</h2>
                            <div className="mt-3">Are you sure, you want to delete association?</div>
                            <DialogFooter>
                                <PrimaryButton text="Yes" onClick={onClickYesDelete} className='mrt15 css-b62m3t-container btn btn-primary'
                                />
                                <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNoDelete} />
                            </DialogFooter>
                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}

        {isDetails &&
            <Panel
                isOpen={isDetails}
                onDismiss={() => onClickClose()}
                isBlocking={true}
                type={PanelType.custom}
                headerText="Questions"
                onRenderFooterContent={onRenderFooterContent}
                customWidth="1000px"
            >
                <CustomModal
                    isModalOpenProps={isDeleteDialogShow}
                    onClose={onCancelDeleteClick}
                    onClickOfYes={onDeleteYesClick}
                    yesButtonText="Yes"
                    closeButtonText="No"
                    subject={"Warning"} message={"Are you sure you want to delete this item?"}
                />

                {!!items && items.length > 0 && <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md4 ms-lg4 ms-xl4 mb-10 panelOptions">
                        {/* <Dropdown
                            label="Checklist Type"
                            className="formControl"
                            selectedKey={selectedChecklistType} // Controlled component
                            onChange={onDropdownChange}
                            options={[
                                { key: 'Both', text: 'Both' },
                                { key: 'Pre', text: 'Pre' },
                                { key: 'Post', text: 'Post' },
                            ]}
                        /> */}

                        <ChecklistTypeFilter

                            defaultOption={selectedChecklistType}
                            onChecklistTypeChange={onDropdownChange}
                            AllOption={true}
                            // onChecklistTypeChange={(newValue) => [
                            //     setEditData(prev => ({
                            //         ...prev,
                            //         [item.ID]: { ...prev[item.ID], ChecklistType: newValue || item.ChecklistType },
                            //     }))
                            // ]}
                            provider={props.provider}
                            isRequired={false}

                        />

                    </div>
                </div>}
                {!!items && items.length > 0 &&
                    <div>
                        <div className="donlyFlex justifyContentBetween">
                            <Checkbox
                                label="Select All"
                                checked={isAllSelected}
                                onChange={toggleSelectAll}
                                styles={{ root: { marginBottom: '12px' } }}
                            />
                            {!editModeId && <Link className="actionBtn btnInfo dticon" onClick={onClickAddNewQuestion}>
                                <TooltipHost content={"Add New Question"} id={tooltipId} >
                                    <FontAwesomeIcon icon="plus" />
                                </TooltipHost>
                            </Link>}
                        </div>
                        {items
                            .filter(
                                // item => selectedChecklistType === "Both" || item?.ChecklistType === selectedChecklistType
                                item => !selectedChecklistType || item?.ChecklistType === selectedChecklistType
                            )
                            .map(item => (
                                <div
                                    key={item.ID}
                                    className="question-detail-outer"
                                >

                                    <div className="panel-icon-right">
                                        <Checkbox
                                            checked={item.isSelected}
                                            onChange={() => onCheckboxChange(item.ID, item.isSelected)}
                                        />
                                    </div>

                                    {editModeId === item.ID ? (
                                        <>
                                            <div className="assteQuestion">
                                                <TextField
                                                    errorMessage={isQuestionShowError[item.ID]?.isTitleErrorShow ? "Please enter the Question value." : ""}
                                                    className="formControl mb-0"
                                                    value={editData[item.ID].Title || item.Title}
                                                    onChange={(e, newValue) =>


                                                        setEditData(prev => ({
                                                            ...prev,
                                                            [item.ID]: { ...prev[item.ID], Title: newValue || '' },
                                                        }))
                                                    }
                                                />
                                                <div className="question-sub-control">
                                                    <ChecklistTypeFilter

                                                        defaultOption={editData[item.ID]?.ChecklistType || item?.ChecklistType}
                                                        onChecklistTypeChange={(newValue) => [
                                                            setEditData(prev => ({
                                                                ...prev,
                                                                [item.ID]: { ...prev[item.ID], ChecklistType: newValue || item.ChecklistType },
                                                            }))
                                                        ]}
                                                        provider={props.provider}
                                                        isRequired={false}
                                                    />

                                                    <QuestionTypeFilter

                                                        defaultOption={editData[item.ID]?.QuestionType || item?.QuestionType}
                                                        onQuestionTypeChange={(newValue) => {
                                                            setEditData(prev => ({
                                                                ...prev,
                                                                [item.ID]: { ...prev[item.ID], QuestionType: newValue || item.QuestionType },
                                                            }))

                                                        }}
                                                        provider={props.provider}
                                                        isRequired={false} />
                                                    {(editData[item.ID]?.QuestionType == "Choice") && <QuestionOptionFilter

                                                        defaultOption={editData[item.ID]?.Option || item?.Option}
                                                        onQuestionOptionChange={(newValue) => {
                                                            setEditData(prev => ({
                                                                ...prev,
                                                                [item.ID]: { ...prev[item.ID], Option: newValue || item.Option },
                                                            }))

                                                        }}
                                                        provider={props.provider}
                                                        isRequired={false}
                                                    />}
                                                </div>

                                            </div>

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
                                                    onClick={() => cancelEdit(item)}
                                                >
                                                    <TooltipHost content="Cancel" id={`cancel_tooltip_${item.ID}`}>
                                                        <FontAwesomeIcon icon="times" />
                                                    </TooltipHost>
                                                </Link>
                                            </div>
                                        </>

                                    ) : (
                                        <div className="question-details-wrapper">
                                            <span className="question-span-cls   question-Title">{item.Title}</span>
                                            <>
                                                {(
                                                    item.ChecklistType === "Pre" && (
                                                        <div className="greenBadge badge-min-width">Pre</div>
                                                    )
                                                ) ||
                                                    (
                                                        item.ChecklistType === "Post" && (
                                                            <div className="skyblueBadge badge-min-width">Post</div>
                                                        )
                                                    ) ||
                                                    (
                                                        item.ChecklistType === "Both" && (
                                                            <div className="yellowBadge badge-min-width">Both</div>
                                                        )
                                                    )}
                                                {(editData[item.ID]?.QuestionType || item?.QuestionType) ? <div className="questionTypeBadge">{editData[item.ID]?.QuestionType || item?.QuestionType}</div> : <div className="silverBadge">---</div>}
                                                {(editData[item.ID]?.Option || item?.Option) && <div className="silverBadge">{editData[item.ID]?.Option || item?.Option}</div>}

                                            </>
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
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                }
                {(items.length === 0 || items
                    .filter(
                        // item => selectedChecklistType === "Both" || item?.ChecklistType === selectedChecklistType
                        item => !selectedChecklistType || item?.ChecklistType === selectedChecklistType
                    ).length == 0) &&
                    <div>
                        <NoRecordFound />
                    </div>}
                {/* <div>
                    <h3>Selected Records</h3>
                    <pre>{JSON.stringify(getSelectedItems(), null, 2)}</pre>
                </div> */}
            </Panel >
        }
    </>;
};