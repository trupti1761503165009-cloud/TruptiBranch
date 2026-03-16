import { useAtom } from "jotai";

import { useState } from "react";
import { useBoolean } from "@uifabric/react-hooks";
import * as XLSX from 'xlsx';

import { IFileWithBlob } from "../../../../Service/models/IFileWithBlob";
import { splitIntoBatches } from "../Util";
import { appGlobalStateAtom } from "../../../../jotai/appGlobalStateAtom";
import { ListNames } from "../../../../Shared/Enum/ListNames";


type Props = {
    columnsToRead: any[];
    listName: ListNames;
    cancelOrSuccessClick: () => void;
}

const importFileMessages = {
    "NoRecordFoundTosave": "No data found to save.",
    "ImportSuccess": "Excel file has been imported successfully!",
    "ImportFailed": "Error in importing file!",
}

export function importExcelData(props: Props) {
    const [files, setFiles] = useState<IFileWithBlob[]>([]);
    const [percentComplete, setPercentComplete] = useState<number>(0);
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [dialogHeader, setDialogHeader] = useState<string>("");
    const [dialogMessage, setDialogMessage] = useState<string>("");
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
    const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
    const [appGlobalState] = useAtom(appGlobalStateAtom);
    const { provider } = appGlobalState;
    const { columnsToRead, cancelOrSuccessClick } = props;
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

    const saveDataInBatches = async (readExcelData: any[]): Promise<boolean> => {
        const createItems: any[] = [];
        const batches: number[][] = splitIntoBatches(readExcelData, 100);
        batches.map(async (batch: any, i: number) => {
            createItems.push(provider.createItemInBatch(batch, "DemoClients"));
        });

        const resultData: any[] = [];
        await allPromiseProgress(createItems, (progPercentage: number, response: any) => {
            if (response) {
                resultData.push(response);
                console.log("Batch success");
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

    const processExcelData = (excelData: any) => {
        if (!!excelData && excelData.length > 0) {
            const data: any = JSON.stringify(excelData, null, 2);
            const jsonData: any = JSON.parse(data);
            const fields = columnsToRead.map(item => item.fieldName);
            const saveData = jsonData?.map((item: any) => {
                const saveItemObj: any = {};
                fields.forEach(element => {
                    saveItemObj[element] = item[element];
                });
                return saveItemObj;
            });

            setIsLoading(true);
            void (async () => {
                const success = await saveDataInBatches(saveData)
                if (success) {
                    setIsLoading(false);
                    setDialogHeader("Success");
                    setDialogMessage(importFileMessages.ImportSuccess)
                    setIsSuccess(true);
                    hideModal();
                    toggleHideDialog();
                }
                else {
                    setIsLoading(false);
                    setDialogHeader("Warning");
                    setDialogMessage(importFileMessages.ImportFailed)
                    setIsSuccess(false);
                    toggleHideDialog();
                }
            })()
        }
        else {
            setDialogHeader("Warning");
            setDialogMessage(importFileMessages.NoRecordFoundTosave)
            setIsSuccess(false);
        }
    }

    const readExcelFileAndValidateColumn = (filedata: any) => {
        setErrorMessages([]);
        const errorobj: string[] = [];
        const file: any = filedata[0]?.file;
        const reader = new FileReader();
        reader.onload = async (e: any) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const columnHeader: any[] = XLSX.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]], {
                header: 1, defval: "", raw: false
            })[0];
            let isColumnsValid = true;
            columnsToRead.forEach(element => {
                isColumnsValid = columnHeader.indexOf(element.fieldName) >= 0;
                if (!isColumnsValid) {
                    errorobj.push(element.fieldName);
                    return null;
                }
            })
            if (errorobj.length > 0) {
                setErrorMessages(errorobj);
                setDialogHeader("Warning");
                setDialogMessage("Following columns are missing from the excel, please select the correct excel file.")
                setIsSuccess(false);
                toggleHideDialog();
            }
            else {
                const excelData: any = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
                processExcelData(excelData);
            }
        }
        reader.readAsArrayBuffer(file);
    }

    const onClickCloseModel = () => {
        hideModal();
    };

    const onSuccessClick = () => {
        toggleHideDialog();
        cancelOrSuccessClick();
    };

    const onFileSelected = (_selectedFiles: any) => {
        const selectedFiles: IFileWithBlob[] = [];
        if (_selectedFiles.length > 0) {
            for (let i = 0; i < _selectedFiles.length; i++) {
                const file = _selectedFiles[i];
                const selectedFile: IFileWithBlob = {
                    file: file,
                    name: file.name,
                    folderServerRelativeURL: "",
                    overwrite: true,
                    key: i
                };
                selectedFiles.push(selectedFile);
            }
            setFiles(selectedFiles);
        }

    };

    const onSaveFiles = () => {
        if (files && files.length > 0)
            readExcelFileAndValidateColumn(files);
    }

    return {
        files,
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
        onSuccessClick,
        onClickCloseModel,
        onSaveFiles,
        onFileSelected
    }
} 