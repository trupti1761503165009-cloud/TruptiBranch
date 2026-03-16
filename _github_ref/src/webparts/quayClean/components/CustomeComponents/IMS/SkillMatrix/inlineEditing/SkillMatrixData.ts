/* eslint-disable @typescript-eslint/no-use-before-define */


import { useCallback, useEffect, useState, useMemo } from "react";
import { useBoolean } from "@uifabric/react-hooks";
import { ListNames, SortOrder } from "../../../../../../../Common/Enum/ComponentNameEnum";
import { ICamlQueryFilter } from "../../../../../../../Common/Constants/DocumentConstants";
import IPnPQueryOptions from "../../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { getStringValue, getErrorMessage, getNumberValue, splitIntoBatches } from "../../../../../../../Common/Util";
import { TableData, SkillMatrixFields, NOData } from "./SkillMatrixFields";

type Props = {
    listName: ListNames;
    provider: any;
    RecordId: any;
    IsPopupTrue: boolean;
}

export function SkillMatrixData(props: Props) {
    const [percentComplete, setPercentComplete] = useState<number>(0);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isCreate, setIsCreate] = useState<boolean>(false);
    const [dialogHeader, setDialogHeader] = useState<string>("");
    const [dialogMessage, setDialogMessage] = useState<string>("");
    const [NoRecordId, setNoRecordId] = useState<any>(0);
    const [RecordStatus, setRecordStatus] = useState<any>(0);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [IsTraining, setIsTraining] = useState<boolean>(false);
    const [tableData, setTableData] = useState<TableData[]>([]);
    const [noData, setNoData] = useState<NOData[]>([]);
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [selectedCompleted, setSelectedCompleted] = useState<{ label: string, value: string | number }>({ value: '', label: 'Change All Status' });
    const PAGE_LENGTH: number = 500;
    const [error, setError] = useState<Error>((undefined as unknown) as Error);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
    const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
    const [ErrorData, setErrorData] = useState<JSX.Element[]>([]);  // Manage error messages state

    const [isPopupVisible2, { setTrue: showPopup2, setFalse: hidePopup2 }] = useBoolean(false);
    const hasError = useMemo(() => {
        return !error ? false : true;
    }, [error]);

    const allPromiseProgress = (itemCreationPromises: any[], successResult: any): Promise<any> => {
        let progress = 0;
        successResult(0);
        for (const awaitedItemCreation of itemCreationPromises) {
            awaitedItemCreation.then((file: any) => {
                progress++;
                const progPercentage = ((progress * 100) / itemCreationPromises?.length).toFixed(2);
                successResult(progPercentage, file);
            }).catch((e: any) => {
                progress++;
                const progPercentage = ((progress * 100) / itemCreationPromises?.length).toFixed(2);
                successResult(progPercentage, false);
            });
        }
        return Promise.all(itemCreationPromises);
    };

    const saveDataInBatches = async (data: any[]): Promise<boolean> => {
        const createUpdateItems: any[] = [];
        const batches: number[][] = splitIntoBatches(data, 100);
        batches.map(async (batch: any, i: number) => {
            // if (isCreate)
            //     createUpdateItems.push(provider.createItemInBatch(batch, ListNames.TableEdit));
            // else
            //     createUpdateItems.push(provider.updateItemInBatch(batch, ListNames.TableEdit));
        });

        const resultData: any[] = [];
        await allPromiseProgress(createUpdateItems, (progPercentage: number, response: any) => {
            if (response) {
                resultData.push(response);
            }
            else {
                resultData.push(null);
            }
            setPercentComplete(((progPercentage / 100) + percentComplete) % 1);
        });

        const finalResult = resultData.map((resultItem: any) => {
            return resultItem !== null;
        });
        return finalResult.length === resultData.length
    }

    const handleSave = async () => {
        setIsLoading(true);
        if (isCreate) {
            const removeIdAndIdFromData = (data: TableData[]): Omit<TableData, 'Completed' | 'ID'>[] => {
                return data.map(({ Completed, ID, ...rest }) => rest);
            };
            const tableDataWithoutId = removeIdAndIdFromData(tableData);
            // console.table(tableDataWithoutId);
            await saveDataInBatches(tableDataWithoutId);
            await loadBatchOfItems();
            setIsLoading(false);
            // alert("Saved Successfully");
        }
        else {
            const errormsg: any = [];
            const loggedMessages = new Set<string>();
            let isBlankSignature = false;


            const removeIDAndUserFromData = (data: TableData[]): Omit<TableData, 'User' | 'ID'>[] => {
                return data.map(({ [SkillMatrixFields.ID]: _, [SkillMatrixFields.ID]: __, ...rest }) => rest);
            };
            const tableDataWithoutUser = removeIDAndUserFromData(tableData);

            const updatedData = tableDataWithoutUser.map(item => ({
                Id: item.Id,
                SignatureCleaner: item.SignatureCleaner,
                SignatureTrainer: item.SignatureTrainer,
                Completed: item.Completed
            }));
            updatedData.forEach((item) => {
                if (item.Completed === "Yes") {
                    if (!item.SignatureTrainer && !loggedMessages.has("Trainer signature is required")) {
                        isBlankSignature = true;
                        errormsg.push('Trainer signature is required');
                        loggedMessages.add("Trainer signature is required");
                    }
                    if (!item.SignatureCleaner && !loggedMessages.has("Cleaner signature is required")) {
                        isBlankSignature = true;
                        errormsg.push('Cleaner signature is required');
                        loggedMessages.add("Cleaner signature is required");
                    }
                }
            });
            if (errormsg.length > 0) {
                setErrorData(errormsg);
                showPopup2();
                setIsLoading(false);
            } else {
                await props.provider.updateListItemsInBatchPnP(ListNames.SkillMatrixMasterData, updatedData);
                setIsLoading(false);
                hidePopup2();  // Close popup if no errors
            }

        }
    };

    const mappingData = (listItems: any): TableData[] => {
        if (!!listItems) {
            try {
                const listItemsData: any[] = listItems.map((itemObj: any, index: number) => {
                    const item: TableData = {
                        [SkillMatrixFields.Title]: getStringValue(itemObj?.Title),
                        [SkillMatrixFields.SkillMatrix]: getStringValue(itemObj?.SkillMatrix),
                        [SkillMatrixFields.SignatureCleaner]: itemObj?.SignatureCleaner === "Yes" ? true : false,
                        [SkillMatrixFields.SignatureTrainer]: itemObj?.SignatureTrainer === "Yes" ? true : false, // For SignatureTrainer
                        [SkillMatrixFields.ID]: getNumberValue(itemObj?.ID), // Use this for ID
                        [SkillMatrixFields.Id]: getNumberValue(itemObj?.Id),
                        [SkillMatrixFields.IMSNos]: getStringValue(itemObj?.IMSNos),
                        [SkillMatrixFields.SkillMatrixTitle]: getStringValue(itemObj?.SkillMatrixTitle),
                        [SkillMatrixFields.Trainer]: undefined,
                        [SkillMatrixFields.IsTraining]: undefined,
                        [SkillMatrixFields.Completed]: getStringValue(itemObj?.Completed)
                    };

                    return item;
                });
                return listItemsData;
            } catch (e) {
                setError(e);
            }
        }
        return [];
    }

    const loadData = async (pageToken: string, sortOptions: { sortColumn: string, sortOrder: SortOrder }, filterFields?: ICamlQueryFilter[]) => {
        try {
            const select = ["ID,Title,Completed,IMSNos,SkillMatrixId,SkillMatrix/Title,SignatureTrainer,SignatureCleaner,SkillMatrixName,IsTraining"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `SkillMatrixId eq ${props.RecordId}`,
                expand: ["SkillMatrix"],

                listName: ListNames.SkillMatrixMasterData,
            };
            const localResponse = await props.provider.getItemsByQuery(queryStringOptions);
            return localResponse;
        } catch (error) {
            const _error = getErrorMessage(error);
            setError(_error);
            return null;
        }
    }


    const generateData = () => {
        try {
            const select = ["ID,Title,Completed,IMSNos,SkillMatrixId,SkillMatrix/Title,SignatureTrainer,SignatureCleaner,SkillMatrixName,IsTraining"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `SkillMatrixId eq ${props.RecordId}`,
                expand: ["SkillMatrix"],
                listName: ListNames.SkillMatrixMasterData,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {

                    const listItemsData: any[] = results.map((itemObj: any, index: number) => {
                        const item: TableData = {
                            [SkillMatrixFields.Title]: getStringValue(itemObj?.Title),
                            [SkillMatrixFields.SkillMatrix]: getStringValue(itemObj?.SkillMatrix.Title),
                            [SkillMatrixFields.SignatureCleaner]: itemObj?.SignatureCleaner,
                            [SkillMatrixFields.SignatureTrainer]: itemObj?.SignatureTrainer, // For SignatureTrainer
                            [SkillMatrixFields.ID]: index, // Use this for ID
                            [SkillMatrixFields.Id]: itemObj?.ID,
                            [SkillMatrixFields.IMSNos]: getStringValue(itemObj?.IMSNos),
                            [SkillMatrixFields.SkillMatrixTitle]: getStringValue(itemObj?.SkillMatrixName),
                            [SkillMatrixFields.Trainer]: undefined,
                            [SkillMatrixFields.IsTraining]: itemObj?.IsTraining,
                            [SkillMatrixFields.Completed]: getStringValue(itemObj?.Completed)
                        };

                        return item;
                    });
                    setTableData(listItemsData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
        }
    };

    const loadBatchOfItems = async (): Promise<void> => {
        try {
            const localResponse = await loadData("", { sortColumn: "ID", sortOrder: SortOrder.Descending });
            const listItems = mappingData(localResponse?.Row);
            setTableData(listItems);
            setIsLoading(false);
        } catch (error) {
            console.error('An error occurred while loading batch of items:', error);
        }
    };


    const updateCellData = useCallback((rowId: number, columnId: string, value: string | boolean) => {
        // Update the table data
        if (columnId === "IsTraining") {
            setIsTraining(true);
        } else {
            setIsTraining(false);
        }
        setTableData((oldData) =>
            oldData?.map((row) => {
                if (row[SkillMatrixFields.Id] === rowId) {
                    if (columnId == "Completed" && value == "No") {
                        return {
                            ...row,
                            SignatureTrainer: false,
                            SignatureCleaner: false,
                            [columnId]: value,
                        };
                    } else {
                        return {
                            ...row,
                            IsTraining: false,
                            [columnId]: value,
                        };
                    }

                }
                return row;
            })
        );

        if (columnId === "Completed" && value === "No") {
            setNoRecordId(rowId);
            setRecordStatus(value);
        } else {
            setNoRecordId(rowId);
            setRecordStatus(value);
        }
    }, []);

    const handleRowSelection = useCallback((rowId: number, checked: boolean) => {
        setSelectedRows((prevSelected) => {
            const newSelected = new Set(prevSelected);
            if (checked) {
                newSelected.add(rowId);
            } else {
                newSelected.delete(rowId);
            }
            return newSelected;
        });
    }, []);

    const handleCompletedChange = useCallback((completed: string) => {
        setSelectedCompleted({ value: completed, label: completed });
        setTableData((oldData) =>
            oldData?.map((row) => {
                if (selectedRows.has(row[SkillMatrixFields.Id])) {
                    return {
                        ...row,
                        [SkillMatrixFields.Completed]: completed,
                    };
                }
                return row;
            })
        );
    }, [selectedRows]);

    const toggleIsActiveForSelectedRows = (isActive: boolean) => {
        selectedRows.forEach((rowId) => {
            updateCellData(rowId, SkillMatrixFields.SignatureTrainer, isActive);
        });
    };
    const toggleCleanerForSelectedRows = (isActive: boolean) => {
        selectedRows.forEach((rowId) => {
            updateCellData(rowId, SkillMatrixFields.SignatureCleaner, isActive);
        });
    };

    useEffect(() => {
        void (async function (): Promise<void> {
            setIsLoading(true);
            // await loadBatchOfItems();
            if (props.RecordId)
                generateData();
            else
                await loadBatchOfItems();
        })();
    }, []);

    return {
        isLoading,
        isModalOpen,
        errorMessages,
        dialogHeader,
        dialogMessage,
        hideDialog,
        isSuccess,
        percentComplete,
        showModal,
        hideModal,
        toggleHideDialog,
        handleSave,
        tableData,
        noData,
        selectedRows,
        selectedCompleted,
        setSelectedRows,
        handleCompletedChange,
        handleRowSelection,
        toggleIsActiveForSelectedRows,
        toggleCleanerForSelectedRows,
        updateCellData,
        error,
        hasError,
        ErrorData,
        setErrorData,
        NoRecordId,
        RecordStatus,
        IsTraining
    }


}