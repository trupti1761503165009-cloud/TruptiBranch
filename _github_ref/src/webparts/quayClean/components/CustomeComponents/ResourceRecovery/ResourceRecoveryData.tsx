import React from "react"
import { IResourceRecoveryProps } from "./ResourceRecovery"
import { IColumn, Link, mergeStyleSets, TooltipHost } from "@fluentui/react";
import { useId } from "@fluentui/react-hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { cleanLink, getCAMLQueryFilterExpression, getFileTypeIcon, UserActivityLog } from "../../../../../Common/Util";
import moment from "moment";
import { DateTimeFormate, MicrosoftOfficeDocumentType } from "../../../../../Common/Constants/CommonConstants";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import CamlBuilder from "camljs";
import { ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import { Fabric } from "office-ui-fabric-react";
import { toastService } from "../../../../../Common/ToastService";


export interface IResourceRecoveryState {
    isLoading: boolean;
    currentView: string;
    isRefreshGrid: boolean;
    items: any[];
    allItems: any[]
    isDisplayEditButton: boolean;
    selectedItems: any;
    selectedFile: any;
    selectedFolder: any;
    isDeleteDialogShow: boolean;
    isReloadDocument: boolean
    isCreateFolderModelShow: boolean;
    width: string;
    newFolderName: string;
    finalLastLink: string;
    preData: any[];
    isAddFileModelShow: boolean;
    uploadFiles: any[];
    isUploadingFile: boolean;
    percentComplete: number;
    isUploadLink: boolean;
    renameFileRef: string;
    rename: string;
    isRenameModelShow: boolean;
    newBreadcrumbItem: any;
    lastFolder: any;
    notFound: boolean;
    sourcePath: string;
    isFolderAllReadyPresent: boolean;

}

export interface ICustomBreadcrumbItem {
    text: string;
    key: string;
}

export const ResourceRecoveryData = (props: IResourceRecoveryProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const tooltipId = useId('tooltip');
    let uploadedFileCount = 0;
    const [state, setState] = React.useState<IResourceRecoveryState>({
        isLoading: false,
        currentView: props?.view ? props?.view : 'grid',
        preData: [],
        isRefreshGrid: false,
        uploadFiles: [],
        isFolderAllReadyPresent: false,
        items: [],
        allItems: [],
        newFolderName: "",
        isDisplayEditButton: false,
        newBreadcrumbItem: undefined,
        selectedItems: "",
        selectedFile: "",
        selectedFolder: "",
        isDeleteDialogShow: false,
        isReloadDocument: false,
        isCreateFolderModelShow: false,
        width: "500px",
        finalLastLink: "",
        isAddFileModelShow: false,
        isUploadingFile: false,
        percentComplete: 0,
        isUploadLink: false,
        renameFileRef: "",
        rename: "",
        isRenameModelShow: false,
        lastFolder: "",
        notFound: false,
        sourcePath: ""
    })
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
            maxWidth: '550px',
            width: state.width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
        }
    });
    const popupStyles2 = mergeStyleSets({
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
            maxWidth: '1200px',
            width: '90%',
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
        }
    });

    const onClickAddDocument = () => {
        setState((prevState) => ({ ...prevState, isAddFileModelShow: !prevState.isAddFileModelShow, uploadFiles: [], isUploadingFile: false }));
        // showPopup2();
    };

    const onClickPopupCreateFolder = () => {
        setState((prevState) => ({ ...prevState, isCreateFolderModelShow: true }));
    };

    const onClickPopupCreateFolderClose = () => {
        setState((prevState) => ({ ...prevState, isCreateFolderModelShow: false, newFolderName: "" }));

    }

    const onclickRefreshGrid = () => {
        setState((prevState: any) => ({ ...prevState, isRefreshGrid: !prevState.isRefreshGrid }));
    };

    const _getAllDocuments = async (link?: string) => {
        try {
            const filterFields: ICamlQueryFilter[] = [];
            if (props.siteNameId) {
                filterFields.push({
                    fieldName: "SiteName",
                    fieldValue: props.siteNameId,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.EqualTo
                });
            }
            let folderPath: any;
            if (link == "" || link == undefined) {
                if (props.siteName) {
                    folderPath = context.pageContext.web.serverRelativeUrl + `/${ListNames.ResourceRecovery}/` + props.siteName;
                } else {
                    folderPath = context.pageContext.web.serverRelativeUrl + `/${ListNames.ResourceRecovery}`;
                }
            } else {
                folderPath = link;
            }
            filterFields.push({
                fieldName: "FileDirRef",
                fieldValue: folderPath,
                fieldType: FieldType.Text,
                LogicalType: LogicalType.EqualTo
            });
            let camlQuery = new CamlBuilder().View()
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query();
            if (filterFields) {
                const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
                camlQuery.Where().All(categoriesExpressions);
            }
            setState((prevState: any) => ({ ...prevState, isLoading: true }));
            let allFoldersfiles = await provider.getItemsByCAMLQuery(ListNames.ResourceRecovery, camlQuery.ToString());

            let filteredData: any[];
            if (!!props.siteNameId || currentUserRoleDetail?.isAdmin) {
                filteredData = allFoldersfiles;
            } else {
                let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                filteredData = !!allFoldersfiles && allFoldersfiles?.filter((item: any) =>
                    AllSiteIds.includes(item?.SiteName[0]?.lookupId)
                );
            }
            filteredData = filteredData?.sort((a: any, b: any) => {
                return moment(b.Modified).diff(moment(a.Modified));
            });


            if (!!filteredData) {
                const data = filteredData.map((data) => {
                    const filePath: string = `${data.EncodedAbsUrl}`;
                    let DocumentFullPath;
                    const embedFullFilePath = `${context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${data.EncodedAbsUrl}&action=embedview`;
                    const fileType = filePath.split('.').pop();
                    if (MicrosoftOfficeDocumentType.indexOf(fileType || '') >= 0)
                        DocumentFullPath = embedFullFilePath;
                    else
                        DocumentFullPath = (fileType === "zip" ? `${filePath}?web = 1 & action=embedview` : filePath);
                    return {
                        ID: data.ID,
                        SiteNameId: !!data.SiteName[0]?.lookupId ? data.SiteName[0]?.lookupId : "",
                        SiteName: !!data.SiteName[0]?.lookupValue ? data.SiteName[0]?.lookupValue : "",
                        DocumentsLink: !!data.EncodedAbsUrl ? data.EncodedAbsUrl : "",
                        FileDirRef: !!data.FileDirRef ? data.FileDirRef : "",
                        FileLeafRef: !!data.FileLeafRef ? data.FileLeafRef : "",
                        ContentType: !!data.ContentType ? data.ContentType : "",
                        FileRef: !!data.FileRef ? data.FileRef : "",
                        previewUrl: DocumentFullPath,
                        CreatedBy: !!data.Author ? data.Author[0].title : "",
                        ModifiedBy: !!data.Editor ? data.Editor[0].title : "",
                        Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
                        Modified: !!data.Modified ? moment(data.Modified).format(DateTimeFormate) : "",
                    };
                });
                let res: any[] = [];
                let folderPath: any;
                if (link == "" || link == undefined) {
                    if (props.siteName) {
                        folderPath = `/${ListNames.ResourceRecovery}/` + props.siteName;
                    } else {
                        folderPath = `/${ListNames.ResourceRecovery}`
                    }
                    if (data.length > 0) {
                        res = data.filter(item => item.FileDirRef.endsWith(folderPath));
                    }
                } else {
                    folderPath = link;
                    if (data.length > 0) {
                        res = data.filter(item => item.FileDirRef == link);
                    }
                }
                // if (res.length == 0) {
                //     setnotFoundFF2(true);
                //     setfiltercalmData2([]);
                // } else {
                //     setnotFoundFF2(false);
                //     setfiltercalmData2(res);
                //     setpreData2(res);
                // }
                // setcalmData2(AssetListData);

                setState((prevState: any) => ({ ...prevState, items: res, allItems: data, preData: res }))
                setState((prevState: any) => ({ ...prevState, isLoading: false }));

                // setIsLoading(false);
                return { data, res };

            }
        } catch (error) {
            setState((prevState: any) => ({ ...prevState, isLoading: false }))

        }

    };

    const allPromiseProgress = (fileUploadPromises: any[], fileUploadProgress: any): Promise<any> => {
        let progress = 0;
        fileUploadProgress(0);
        for (const awaitFileUpload of fileUploadPromises) {
            awaitFileUpload.then((file: any) => {
                progress++;
                const progPercentage = ((progress * 100) / fileUploadPromises?.length).toFixed(2);
                fileUploadProgress(progPercentage, file);
            });
        }
        return Promise.all(fileUploadPromises);
    };

    const setSourcePath = (value: string) => {
        setState((prevState) => ({ ...prevState, sourcePath: value }));

    }

    const onClickUpload = async () => {
        setState((prevState: any) => ({ ...prevState, allItems: [], isUploadingFile: true }));
        let apiArray: any = [];
        let i = 0;
        let link;
        state.uploadFiles?.map((cftItem: any) => {
            let DocumentData1 = {
                SiteNameId: props.siteNameId
            };
            apiArray.push(provider.uploadFilewithSiteUrl(cftItem.file, cftItem.folderServerRelativeURL, true, DocumentData1).then(async (item: any) => {
                console.log();
            }).catch(err => console.log(err)));
            if (i == 0) {
                link = cftItem.folderServerRelativeURL;
                i = i + 1;
            }
        });

        state.uploadFiles.forEach((res: any) => {
            const logObj = {
                UserName: props?.loginUserRoleDetails?.title,
                SiteNameId: props.siteNameId,
                ActionType: UserActivityActionTypeEnum.Create,
                EntityType: UserActionEntityTypeEnum.AddResourceRecovery,
                // EntityId: res?.ID,
                EntityName: res?.name,
                Details: `Create Document (Add Document)`,
                StateId: props?.qCStateId
            };
            void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
        });

        const resultData: any[] = [];
        await allPromiseProgress(apiArray, (progPercentage: number, file: any) => {
            if (file) {
                resultData.push(file);
                uploadedFileCount += 1;
            }
            setState((prevState) => ({ ...prevState, percentComplete: ((progPercentage / 100) + prevState.percentComplete) % 1 }));
        });
        if (resultData.length === state.selectedFile.length) {
            uploadedFileCount = 0;
            setState((prevState) => ({ ...prevState, uploadFiles: [] }));
        }

        setState((prevState) => ({ ...prevState, isUploadingFile: false, uploadFiles: [], isAddFileModelShow: false }))
        await Promise.all(apiArray);
        setState((prevState) => ({ ...prevState, isUploadingFile: true, isUploadLink: true }));
        _getAllDocuments(link);

    };

    React.useEffect(() => {
        (async () => {
            try {
                // setState((prevState) => ({ ...prevState, isLoading: true }))
                await _getAllDocuments();
                // setState((prevState: any) => ({ ...prevState, isLoading: false, }))
            } catch (error) {
                console.log(error);

            }
        })()


        // }, [state.isRefreshGrid]);
    }, []);
    React.useEffect(() => {
        try {
            (async () => {
                let folderName = `${context.pageContext.web.serverRelativeUrl}/${ListNames.ResourceRecovery}/${props.siteName}`
                let filterFields: any[] = []
                filterFields.push({
                    fieldName: "ServerUrl",
                    fieldValue: folderName,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                });
                let camlQuery = new CamlBuilder().View()
                    .Scope(CamlBuilder.ViewScope.RecursiveAll)
                    .RowLimit(5000, true)
                    .Query();
                if (filterFields) {
                    const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
                    camlQuery.Where().All(categoriesExpressions);
                }
                let isFolderPresent = await provider.getItemsByCAMLQuery(ListNames.ResourceRecovery, camlQuery.ToString());
                console.log(isFolderPresent);

                if (isFolderPresent.length == 0) {

                    await provider.createFolder(folderName, {
                        SiteNameId: Number(props.siteNameId)
                    })
                }

            })();

        } catch (error) {
            console.log("check the folder present or not" + error);

        }

    }, []);

    const _onItemInvoked = (): void => {
    };

    const _onItemSelected = (item: any): void => {
        if (item.length > 0) {
            const file = item.filter((i: any) => i.ContentType === "Document");
            const folder = item.filter((i: any) => i.ContentType === "Folder");
            // setDeleteFolder(Folder);  this is selectedFolder
            // setDeleteFile(Document);   this is selectedFile 
            // setDeleteId2(item);  this is selectedItems
            // setisDisplayEDbtn2(true);
            setState((prevState: any) => ({ ...prevState, isDisplayEditButton: true, selectedItems: item, selectedFile: file, selectedFolder: folder }));

        } else {
            // setDeleteId2(0);
            // setisDisplayEDbtn2(false);
            setState((prevState: any) => ({ ...prevState, isDisplayEditButton: false, selectedItems: "" }));
        }
    };

    const onClickConfirmDelete = () => {
        setState((prevState) => ({ ...prevState, isDeleteDialogShow: !prevState.isDeleteDialogShow }));
    }
    const onChangeRename = (event: any, newValue: string): void => {

        setState((prevState: any) => ({ ...prevState, rename: newValue }))

    };

    const onChangeFolderName = (e: any, newValue: string) => {
        let items = state.items.map(r => r.FileLeafRef.toLowerCase());
        let isFolderAllReadyPresent: boolean = false;
        if (items.length > 0) {
            isFolderAllReadyPresent = items.indexOf(newValue.toLocaleLowerCase()) > -1;
        }

        setState((prevState: any) => ({ ...prevState, newFolderName: newValue || "", isFolderAllReadyPresent: isFolderAllReadyPresent }));
    }

    const setFilesToState = (files: any[]) => {
        try {
            const selectedFiles: IFileWithBlob[] = [];
            let newFolderName;
            if (state.finalLastLink == "" || state.finalLastLink == undefined) {
                if (state.items.length > 0) {
                    newFolderName = `${state.items[0].FileDirRef}`;
                }
                else {
                    if (state.preData.length > 0) {
                        newFolderName = `${state.preData[0].FileRef}`;
                    } else {
                        newFolderName = `${context.pageContext.web.serverRelativeUrl}/${ListNames.ResourceRecovery}/${props.siteName}`;
                    }
                }
            } else {
                newFolderName = state.finalLastLink;
            }


            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const selectedFile: IFileWithBlob = {
                        file: file,
                        name: file.name,
                        folderServerRelativeURL: newFolderName || "",
                        overwrite: true,
                        key: i
                    };
                    selectedFiles.push(selectedFile);
                }

                setState((prevState: any) => ({ ...prevState, uploadFiles: selectedFiles }))
            } else {
                setState((prevState: any) => ({ ...prevState, uploadFiles: [] }))
            }
        } catch (error) {
            console.log(error);
        }
    };

    const onClickCreateFolderSave = async () => {
        try {
            const toastId = toastService.loading('Creating folder...');
            const toastMessage = 'Folder has been created successfully...';
            setState((prevState: any) => ({ ...prevState, isLoading: true }))
            let newFolderName = "";
            let finalnewFolderName = "";
            let test = "";
            if (state.items.length > 0) {
                newFolderName = `${state.items[0].FileDirRef}/${state.newFolderName}`;
                test = `${state.items[0].FileDirRef}`;
            }
            else {
                if (state.preData.length > 0) {
                    newFolderName = `${state.preData[0].FileRef}/${state.newFolderName}`;
                    test = `${state.preData[0].FileRef}`;
                } else {
                    newFolderName = `${context.pageContext.web.serverRelativeUrl}/${ListNames.ResourceRecovery}/${props.siteName}/${state.newFolderName}`;
                }
            }
            if (state.finalLastLink == "" || state.finalLastLink == undefined) {
                finalnewFolderName = newFolderName;
            } else {
                finalnewFolderName = `${state.finalLastLink}/${state.newFolderName}`;
            }
            const cleanedLink = cleanLink(finalnewFolderName);

            await provider.createFolder(cleanedLink, {
                SiteNameId: Number(props.siteNameId)
            }).then(async () => {

                const logObj = {
                    UserName: props?.loginUserRoleDetails?.title,
                    SiteNameId: Number(props.siteNameId),
                    ActionType: UserActivityActionTypeEnum.Create,
                    EntityType: UserActionEntityTypeEnum.AddResourceRecovery,
                    // EntityId: res?.ID,
                    EntityName: state.newFolderName,
                    Details: `Create Folder Path ${finalnewFolderName}`,
                    StateId: props?.qCStateId
                };
                void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
                _getAllDocuments(state.finalLastLink);
                setState((prevState: any) => ({ ...prevState, isCreateFolderModelShow: false, newFolderName: "" }))
            });
            setState((prevState: any) => ({ ...prevState, isLoading: false }))
            toastService.updateLoadingWithSuccess(toastId, toastMessage);

        } catch (error) {
            console.log(error);

            setState((prevState: any) => ({ ...prevState, isLoading: false }))
        }

    }

    const onClickDeleteYes = () => {
        const toastId = toastService.loading('Deleting folder...');
        const toastMessage = 'Folder has been deleted successfully...';
        setState((prevState: any) => ({ ...prevState, isLoading: true }))
        try {
            const deleteFile = state.selectedFile;
            if (deleteFile.length > 0) {

                for (let index = 0; index < deleteFile.length; index++) {
                    provider.deleteFileFromFolder(deleteFile[index].FileDirRef, deleteFile[index].FileLeafRef);
                    // setSourcePath(DeleteFile[index].FileDirRef);
                    setTimeout(() => {
                        _getAllDocuments(deleteFile[index].FileDirRef);
                    }, 1000);
                }
                deleteFile?.forEach((res: any) => {
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: res?.SiteNameId,
                        ActionType: UserActivityActionTypeEnum.Delete,
                        EntityType: UserActionEntityTypeEnum.ResourceRecovery,
                        EntityId: Number(res?.ID),
                        EntityName: res?.FileLeafRef,
                        Details: `Delete file path ${res?.FileDirRef}`,
                        StateId: props?.qCStateId
                    };
                    void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
                });

            }
            const deleteFolder = state.selectedFolder
            if (deleteFolder.length > 0) {
                for (let indexs = 0; indexs < deleteFolder.length; indexs++) {
                    provider.deleteFolder(deleteFolder[indexs].FileRef);
                    // setSourcePath(DeleteFolder[indexs].FileDirRef);

                    setTimeout(() => {
                        _getAllDocuments(deleteFolder[indexs].FileDirRef);
                    }, 1000);
                }
                deleteFolder?.forEach((res: any) => {
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: res?.SiteNameId,
                        ActionType: UserActivityActionTypeEnum.Delete,
                        EntityType: UserActionEntityTypeEnum.ResourceRecovery,
                        EntityId: Number(res?.ID),
                        EntityName: res?.FileLeafRef,
                        Details: `Delete folder path ${res?.FileDirRef}`,
                        StateId: props?.qCStateId
                    };
                    void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
                });
            }

            setState((prevState: any) => ({ ...prevState, isDeleteDialogShow: false, isReloadDocument: true }))
            setTimeout(() => {
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                setState((prevState: any) => ({ ...prevState, isLoading: false }))
            }, 1000);
        } catch (ex) {
            console.log(ex);
            setState((prevState: any) => ({ ...prevState, isLoading: false }))
            // setIsLoading(false);
        }

    }

    const onCloseRenameModel = () => {
        setState((prevState: any) => ({ ...prevState, isRenameModelShow: false }))

    }




    const onClickRename = async () => {
        const toastId = toastService.loading('Renaming folder...');
        const toastMessage = 'Folder has been renamed successfully...';
        setState((prevState: any) => ({ ...prevState, isLoading: true }));
        let newLink = state.renameFileRef.substring(0, state.renameFileRef.lastIndexOf('/'));
        provider.RenameFile(state.renameFileRef, state.rename).then((res: any) => {
            console.log(res);
            _getAllDocuments(newLink);

            setState((prevState: any) => ({ ...prevState, isLoading: false }));
        }).catch((error: any) => {
            console.log(error);
            setState((prevState: any) => ({ ...prevState, isLoading: false }));
        });

        const logObj = {
            UserName: props?.loginUserRoleDetails?.title,
            SiteNameId: props.siteNameId,
            ActionType: UserActivityActionTypeEnum.Update,
            EntityType: UserActionEntityTypeEnum.AddResourceRecovery,
            // EntityId: res?.ID,
            EntityName: state.rename,
            Details: `Rename folder name path ${newLink}`,
            StateId: props?.qCStateId
        };
        void UserActivityLog(provider, logObj, props?.loginUserRoleDetails)
        setState((prevState) => ({ ...prevState, isRenameModelShow: false }))
        toastService.updateLoadingWithSuccess(toastId, toastMessage);
    };

    const onClickFolder2 = async (currentFolderName: string) => {
        const folderPath = "/" + currentFolderName;
        if (state.allItems.length > 0) {
            setState((prevState: any) => ({ ...prevState, finalLastLink: state.allItems[0].FileDirRef + folderPath }));
        }
        _getAllDocuments(state.allItems[0].FileDirRef + folderPath);
        setSourcePath("");

        setState((prevState) => ({ ...prevState, lastFolder: "" }))
        let results: any[] = [];
        let res: any[] = [];

        if (state.allItems.length > 0) {
            results = state.allItems.filter(item => item.FileDirRef.endsWith(folderPath));
            if (results.length == 0) {
                res = state.allItems.filter(item => item.FileRef.endsWith(folderPath));
            }
        }

        if (results.length != 0) {
            let newBreadcrumbItem: ICustomBreadcrumbItem = {
                text: `${currentFolderName}`,
                key: `${results[0]?.FileDirRef}`,
            };
            setState((prevState: any) => ({ ...prevState, newBreadcrumbItem: newBreadcrumbItem }))
            setSourcePath(results[0]?.FileDirRef);
        } else {
            let newBreadcrumbItem: ICustomBreadcrumbItem = {
                text: `${currentFolderName}`,
                key: `${res[0]?.FileRef}`,
            };
            let newBreadcrumbItem2: ICustomBreadcrumbItem = {
                text: currentFolderName || '', // Fallback in case of undefined
                key: res[0]?.FileRef || '', // Fallback in case of undefined
            };
            if (newBreadcrumbItem2.text && newBreadcrumbItem2.key) {
                setState((prevState: any) => ({ ...prevState, newBreadcrumbItem: newBreadcrumbItem2 }))
            } else {
                console.error("Breadcrumb item contains undefined values.");
            }

            // setNewBreadcrumbItem(newBreadcrumbItem);
            setSourcePath(res[0]?.FileRef);
        }
        setState((prevState) => ({ ...prevState, lastFolder: folderPath }))
        if (results.length == 0) {
            setState((prevState) => ({ ...prevState, notFound: true, isDisplayEditButton: false, items: [] }));

        } else {
            setState((prevState) => ({ ...prevState, notFound: false, isDisplayEditButton: false, items: results, preData: results }));

        }
    };

    // React.useEffect(() => {
    //     if (state.lastFolder != "" && state.isUploadLink == false) {
    //         let results: any[] = [];
    //         if (state.allItems.length > 0) {
    //             results = state.allItems.filter(item => item.FileDirRef.endsWith(state.lastFolder));
    //         }
    //         if (results.length == 0) {

    //             setState((prevState: any) => ({ ...prevState, items: [] }))
    //         } else {
    //             setState((prevState: any) => ({ ...prevState, items: results, preData: results }))
    //         }
    //     }
    // }, [state.allItems]);

    React.useEffect(() => {
        if (state.sourcePath != "") {
            let results: any[] = [];
            if (state.allItems.length > 0) {
                results = state.allItems.filter(item => item.FileDirRef.endsWith(state.sourcePath));
            }
            if (results.length == 0) {

                setState((prevState: any) => ({ ...prevState, items: [] }))

            } else {
                setState((prevState: any) => ({ ...prevState, items: results, preData: results }))
            }
        }


        setState((prevState) => ({ ...prevState, finalLastLink: state.sourcePath }))
        _getAllDocuments(state.sourcePath);
        setState((prevState) => ({ ...prevState, isReloadDocument: true }))
        // setisReloadDocument(false);
    }, [state.sourcePath, state.isRefreshGrid]);

    // React.useEffect(() => {
    //     if (state.sourcePath != "" && state.isReloadDocument === true) {
    //         let results: any[] = [];
    //         if (state.allItems.length > 0) {
    //             results = state.allItems.filter(item => item.FileDirRef.endsWith(state.sourcePath));
    //         }
    //         if (results.length == 0) {

    //             setState((prevState) => ({ ...prevState, items: [] }))
    //         } else {
    //             setState((prevState) => ({ ...prevState, items: results, preData: results }));
    //         }
    //     }
    //     setState((prevState) => ({ ...prevState, finalLastLink: state.sourcePath, isRefreshGrid: false }))

    //     _getAllDocuments(state.sourcePath);
    // }, [state.sourcePath, state.isReloadDocument, state.isRefreshGrid]);



    const onClickRenameDialog = async (item: any) => {
        let orgName = item.FileLeafRef.replace(/\.[^/.]+$/, "");
        setState((prevState) => ({ ...prevState, renameFileRef: item.FileRef, rename: orgName, isRenameModelShow: true }));

    };

    const addDocumentColumn = (): IColumn[] => {
        let columns: any[] = [
            {
                key: "Action", name: 'Action', fieldName: '', isResizable: true, minWidth: 50, maxWidth: 60,
                onRender: ((item: any) => {
                    return <>
                        <div className='dflex'>
                            {item.ContentType != "Folder" ?
                                <>
                                    {props.siteNameId && <div>
                                        <Link className="actionBtn btnView dticon"
                                            onClick={() => { onClickRenameDialog(item); }}
                                        >
                                            <TooltipHost content={"Rename"} id={tooltipId}>
                                                <FontAwesomeIcon icon="edit" />
                                            </TooltipHost>
                                        </Link>
                                    </div>}
                                    <div>
                                        <Link className="actionBtn btnDownload dticon"
                                            onClick={() => {
                                                provider.downloadFile(
                                                    item.FileRef, item.FileLeafRef);
                                            }}
                                        >
                                            <TooltipHost content={"Download"} id={tooltipId}>
                                                <FontAwesomeIcon icon="download" />
                                            </TooltipHost>
                                        </Link>
                                    </div>
                                </> :
                                <>
                                    {props.siteNameId && <div>
                                        <Link className="actionBtn btnView dticon"
                                            onClick={() => {
                                                onClickRenameDialog(item);

                                            }}
                                        >
                                            <TooltipHost content={"Rename"} id={tooltipId}>
                                                <FontAwesomeIcon icon="edit" />
                                            </TooltipHost>
                                        </Link>
                                    </div>}
                                </>
                            }
                        </div >
                    </>;
                })
            },
            {
                key: "key1", name: 'Documents', fieldName: 'FileLeafRef', isResizable: true, minWidth: 400, maxWidth: 500, onRender: ((item: any) => {
                    let fileIcon = getFileTypeIcon(item?.FileLeafRef);
                    return <>
                        <div className="container-document">
                            <Link
                                onClick={() => {
                                    if (item.ContentType === "Folder") {
                                        onClickFolder2(item.FileLeafRef);
                                    } else {
                                        const fileExtension = item.FileLeafRef.split('.').pop().toLowerCase();
                                        const isPDF = fileExtension === 'pdf';
                                        const url = isPDF ? item.DocumentsLink : item.DocumentsLink + "?web=1";
                                        window.open(url, "_blank");
                                    }
                                }}

                            >
                                <TooltipHost
                                    content={item.ContentType === "Folder" ? "Click to open" : "View Document"}
                                    id={tooltipId}
                                >
                                    {item.ContentType === "Folder" ?
                                        <FontAwesomeIcon className="folderBtn btnfolder dticon" icon="folder" /> :
                                        <img className="fileIcon dticon" src={fileIcon} />
                                    }
                                    {item.FileLeafRef}
                                </TooltipHost>
                            </Link>
                            {/* <FontAwesomeIcon className="rightIcon-document" icon="ellipsis-vertical" onClick={onIconClick} /> */}

                        </div>

                    </>;
                })
            },
            { key: "SiteName", name: 'Site Name', fieldName: 'SiteName', isResizable: true, minWidth: 150, maxWidth: 200, isSortingRequired: true },
            { key: "key5", name: 'Created', fieldName: 'Created', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true },
            { key: "key2", name: 'Created By', fieldName: 'CreatedBy', isResizable: true, minWidth: 90, maxWidth: 150, isSortingRequired: true },
            { key: "key4", name: 'Modified', fieldName: 'Modified', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true },
            { key: "key4", name: 'Modified By', fieldName: 'ModifiedBy', isResizable: true, minWidth: 90, maxWidth: 150, isSortingRequired: true },
        ];
        if (props.siteNameId) {
            columns = columns.filter(item => item.key !== "SiteName");
        }
        return columns;
    };

    return {
        state,
        popupStyles,
        popupStyles2,
        onClickAddDocument,
        addDocumentColumn,
        onClickPopupCreateFolder,
        onclickRefreshGrid,
        _onItemInvoked,
        onClickPopupCreateFolderClose,
        _onItemSelected,
        onClickConfirmDelete,
        onClickDeleteYes,
        onChangeFolderName,
        onClickCreateFolderSave,
        uploadedFileCount,
        setFilesToState,
        onClickUpload,
        onCloseRenameModel,
        onChangeRename,
        onClickRename,
        context,
        setSourcePath
    }

}