/* eslint-disable no-async-promise-executor */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDataProvider } from "./Interface/IDataProvider";
import IPnPQueryOptions, { IAttachment, IPnPCAMLQueryOptions } from "./Interface/IPnPQueryOptions";
import { SPFI, SPFx, spfi } from "@pnp/sp";
import { getSP } from "./Config";
import { IItem, IItemAddResult, IItemUpdateResult } from "@pnp/sp/items";
import "@pnp/sp/search";
import { IRenderListDataParameters } from "@pnp/sp/lists";
import { createBatch } from "@pnp/sp/batching";
import { IFileWithBlob } from "./Interface/IFileWithBlob";
import { IFileAddResult } from "@pnp/sp/files";
import { ListNames } from "../Common/Enum/ComponentNameEnum";


export const getUniueRecordsByColumnName = (items: any[], columnName: string) => {
    const lookup: any = {};
    const result: any[] = [];
    if (!!items) {
        for (let index = 0; index < items?.length; index++) {
            const item = items[index];
            const name = item[columnName];
            if (!(name in lookup)) {
                lookup[name] = 1;
                result.push(item);
            }
        }
        return result;
    }
    else {
        return [];
    }
};

export default class Service implements IDataProvider {
    private _webPartContext: WebPartContext;
    private _sp: SPFI;

    constructor(_context: WebPartContext) {
        this._webPartContext = _context;
        this._sp = getSP(this._webPartContext);
    }
    getListId(listName: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public uploadAttachmentToList(listName: string, attachmentFileObj: any, itemId: number): Promise<any> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<any>(async (resolve: (results: any) => void, reject: (error: any) => void): Promise<void> => {
            let item = await this._sp.web.lists.getByTitle(listName).items.getById(itemId);
            item.attachmentFiles.add(attachmentFileObj.name, attachmentFileObj.file).then(v => {
                resolve(v);
            }, (error: any): void => {
                console.log("Error in Update Attachment in the list - " + listName);
                reject(error);
            });
        });
    }

    // Helper function to upload a single attachment
    private async uploadSingleAttachment(item: any, fileObj: any): Promise<any> {
        try {
            return await item.attachmentFiles.add(fileObj.name, fileObj.file);
        } catch (error) {
            console.error(`Failed to upload file ${fileObj.name}:`, error);
            throw error; // Rethrow to handle errors in the main method
        }
    }

    // Main method to upload multiple attachments sequentially
    public async uploadAttachmentsToListSequential(listName: string, attachmentFiles: any[], itemId: number): Promise<any[]> {
        try {
            let item = await this._sp.web.lists.getByTitle(listName).items.getById(itemId);
            let results: any[] = [];

            for (const fileObj of attachmentFiles) {
                const result = await this.uploadSingleAttachment(item, fileObj);
                results.push(result);
            }

            return results;
        } catch (error) {
            console.log("Error in uploading attachments to the list - " + listName);
            throw error; // Propagate the error to handle it in the calling code
        }
    }


    public uploadImageToImageColumn = async (file: any, listName: string, columnName: string, Id: number) => {
        try {
            if (!!file) {

                // Step 1️⃣ — Upload the image to the Site Assets or any folder
                const folder = await this._sp.web.getFolderByServerRelativePath(file.folderServerRelativeURL);
                const uploadedFile = await folder.files.addUsingPath(file.name, file.file, { Overwrite: true });

                // Step 2️⃣ — Get the file server-relative URL
                const serverRelativeUrl = uploadedFile.data.ServerRelativeUrl;

                // Step 3️⃣ — Add list item with image column set
                const addedItem = await this._sp.web.lists.getByTitle(listName).items.getById(Id).update({
                    // [columnName]: {
                    //     Description: "Profile picture ",
                    //     Url: serverRelativeUrl,
                    // },
                    [columnName]: JSON.stringify({
                        Description: "Profile picture ",
                        serverRelativeUrl: serverRelativeUrl,
                    })
                });



                console.log("✅ Item added successfully:", addedItem);
            }
        } catch (error) {
            console.error("❌ Error uploading image:", error);
        }
    };



    public uploadAttachmentToListSiteUrl(listName: string, attachmentFileObj: any, itemId: number, siteUrl?: string): Promise<any> {
        // eslint-disable-next-line no-async-promise-executor
        // const spWeb = spfi(siteUrl).using(SPFx(this._webPartContext));
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<any>(async (resolve: (results: any) => void, reject: (error: any) => void): Promise<void> => {
            let item = await this._sp.web.lists.getByTitle(listName).items.getById(itemId);
            item.attachmentFiles.add(attachmentFileObj.name, attachmentFileObj.file).then(v => {
                resolve(v);
            }, (error: any): void => {
                console.log("Error in Update Attachment in the list - " + listName);
                reject(error);
            });
        });
    }

    public async createFolder(folderUrl: string, metadata?: any): Promise<any> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            this._sp.web.folders.addUsingPath(folderUrl).then(async (response) => {

                if (metadata) {
                    await response.folder.getItem().then(async (item: IItem) => {
                        await item.update(metadata).then((updateItem: any) => {
                            resolve(updateItem?.item?.Id);
                        });
                    });
                }
                resolve(response.data);
            }, (error: any): any => {
                console.log("Error in Creating Item", error);
                reject(error);
            });
        });
    }



    public async renameFolder(currentFolderUrl: string, newFolderName: string): Promise<any> {
        return new Promise<any>(async (resolve: (result: any) => void, reject: (error: any) => void): Promise<void> => {
            try {
                const parentFolderPath = currentFolderUrl.substring(0, currentFolderUrl.lastIndexOf("/"));
                const newFolderUrl = `${parentFolderPath}/${newFolderName}`;

                await this._sp.web.getFolderByServerRelativePath(currentFolderUrl).moveByPath(newFolderUrl);
                resolve({ message: "Folder renamed successfully", newFolderUrl });
            } catch (error) {
                console.error("Error renaming folder:", error);
                reject(error);
            }
        });
    }

    public createItem(objItems: any, listName: string): Promise<any> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            this._sp.web.lists.getByTitle(listName).items.add(objItems).then((itemAddedResult: IItemAddResult): any => {
                resolve(itemAddedResult);
            }, (error: any): any => {
                console.log("Error in Creating Item");
                reject(error);
            });
        });
    }
    public async uploadFileWithData(file: IFileWithBlob, metadataUpdate?: boolean, metadata: any = null): Promise<any> {
        const folder = `${ListNames.SharedDocuments}/${file}`;
        let UpdatelistFolders: any = await this._sp.web.folders.addUsingPath(folder);
        const folderPath = UpdatelistFolders.data.ServerRelativeUrl;
        let folderP = this._sp.web.getFolderByServerRelativePath(folderPath);
        let item = await folderP.getItem();
        await item.update(metadata);
        return UpdatelistFolders;
    }
    public async uploadFileWithDataInDocLibrary(file: IFileWithBlob, metadataUpdate?: boolean, metadata: any = null): Promise<any> {
        const folder = `${ListNames.CertificatesLibrary}/${file}`;
        let UpdatelistFolders: any = await this._sp.web.folders.addUsingPath(folder);
        const folderPath = UpdatelistFolders.data.ServerRelativeUrl;
        let folderP = this._sp.web.getFolderByServerRelativePath(folderPath);
        let item = await folderP.getItem();
        await item.update(metadata);
        return UpdatelistFolders;
    }

    public createItemWithSiteUrl(objItems: any, listName: string, siteUrl: string): Promise<any> {
        const spWeb = spfi(siteUrl).using(SPFx(this._webPartContext));
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            spWeb.web.lists.getByTitle(listName).items.add(objItems).then((itemAddedResult: IItemAddResult): any => {
                resolve(itemAddedResult);
            }, (error: any): any => {
                console.log("Error in Creating Item");
                reject(error);
            });
        });
    }

    public updateItem(objItems: any, listName: string, itemId: number): Promise<any> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            this._sp.web.lists.getByTitle(listName).items
                .getById(itemId).update(objItems)
                .then((itemUpdateResult: IItemUpdateResult) => {
                    resolve(itemUpdateResult);
                }, (error: any): void => {
                    console.log("Error in updating item in - " + listName);
                    reject(error);
                });
        });
    }

    public createItemInBatch(objItems: any[], listName: string, Url?: string): Promise<any[]> {

        let list;
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            if (!!Url) {
                const spWeb = spfi(Url).using(SPFx(this._webPartContext));
                list = spWeb.web.lists.getByTitle(listName);

                const [batchedSP, execute] = spWeb.batched();
                list = batchedSP.web.lists.getByTitle(listName);
                let res: any[] = [];
                for (let index = 0; index < objItems.length; index++) {
                    const element = objItems[index];
                    list.items.add(element).then((r: any) => res.push(r))
                        .catch((err: any) => {
                            let error = {
                                err: err,
                                items: element
                            }
                            reject(error);
                        });
                }
                // Executes the batched calls
                execute().then(() => {
                    resolve(res);
                }, (error: any): any => {
                    console.log("Error in Creating Item");
                    reject(error);
                });

            } else {
                list = this._sp.web.lists.getByTitle(listName);
                const [batchedSP, execute] = this._sp.batched();
                list = batchedSP.web.lists.getByTitle(listName);
                let res: any[] = [];
                for (let index = 0; index < objItems.length; index++) {
                    const element = objItems[index];
                    list.items.add(element).then((r: any) => res.push(r)).catch((err: any) => {
                        console.log(err);
                        let error = {
                            err: err,
                            items: element
                        }
                        reject(error);
                    });
                }
                execute().then(() => {
                    resolve(res);
                }, (error: any): any => {
                    console.log("Error in Creating Item");
                    reject(error);
                });
            }

        });
    }
    public async createItemInBatchHelpDesk(
        objItems: any[],
        listName: string,
        Url?: string
    ): Promise<{ successResults: any[]; failedResults: any[] }> {
        return new Promise(async (resolve, reject) => {
            try {
                let list: any;
                let batchedSP: any;
                let execute: any;

                if (Url) {
                    const spWeb = spfi(Url).using(SPFx(this._webPartContext));
                    [batchedSP, execute] = spWeb.batched();
                    list = batchedSP.web.lists.getByTitle(listName);
                } else {
                    [batchedSP, execute] = this._sp.batched();
                    list = batchedSP.web.lists.getByTitle(listName);
                }

                const successResults: any[] = [];
                const failedResults: any[] = [];

                for (let i = 0; i < objItems.length; i++) {
                    const element = objItems[i];
                    list.items
                        .add(element)
                        .then((r: any) => {
                            successResults.push(r);
                        })
                        .catch((err: any) => {
                            failedResults.push({
                                item: element,
                                error: err
                            });
                        });
                }

                await execute();

                resolve({
                    successResults,
                    failedResults
                });
            } catch (error) {
                console.error("Error in batch creation:", error);
                reject(error);
            }
        });
    }


    public createItemInBatchWithAttachment(objItems: any[], listName: string, Url?: string): Promise<any[]> {

        let list: any;
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            if (!!Url) {
                const spWeb = spfi(Url).using(SPFx(this._webPartContext));
                list = spWeb.web.lists.getByTitle(listName);

                const [batchedSP, execute] = spWeb.batched();
                list = batchedSP.web.lists.getByTitle(listName);
                let res: any[] = [];
                for (let index = 0; index < objItems.length; index++) {
                    // const element = objItems[index];
                    const { Files, ...listItemData } = objItems[index];
                    list.items.add(listItemData).then(async (r: any) => {
                        if (Files && Files.length > 0) {
                            const itemRef = list.items.getById(r.data.Id);
                            for (const file of Files) {
                                await itemRef.attachmentFiles.add(file.name, file); // Async operation
                            }
                        }
                        res.push(r)
                    }
                    ).catch((err: any) => { console.log(err); reject(err); });
                }
                // Executes the batched calls
                execute().then(() => {
                    resolve(res);
                }, (error: any): any => {
                    console.log("Error in Creating Item");
                    reject(error);
                });

            } else {
                list = this._sp.web.lists.getByTitle(listName);
                const [batchedSP, execute] = this._sp.batched();
                list = batchedSP.web.lists.getByTitle(listName);
                let res: any[] = [];
                for (let index = 0; index < objItems.length; index++) {
                    // const element = objItems[index];
                    const { Files, ...listItemData } = objItems[index];
                    list.items.add(listItemData).then(async (r: any) => {
                        if (Files && Files.length > 0) {
                            const itemRef = list.items.getById(r.data.Id);
                            for (const file of Files) {
                                await itemRef.attachmentFiles.add(file.name, file); // Async operation
                            }
                        }
                        res.push(r)
                    }
                    ).catch((err: any) => { console.log(err); reject(err); });
                }
                // Executes the batched calls
                execute().then(() => {
                    resolve(res);
                }, (error: any): any => {
                    console.log("Error in Creating Item");
                    reject(error);
                });
            }
        });
    }

    public createItemInBatchWithCopyAttachment(objItems: any[], listName: string, Url?: string): Promise<any[]> {

        let list: any;
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            if (!!Url) {
                const spWeb = spfi(Url).using(SPFx(this._webPartContext));
                list = spWeb.web.lists.getByTitle(listName);

                const [batchedSP, execute] = spWeb.batched();
                list = batchedSP.web.lists.getByTitle(listName);
                let res: any[] = [];
                for (let index = 0; index < objItems.length; index++) {
                    const { AttachmentFiles, ID, ...listItemData } = objItems[index];
                    list.items.add(listItemData).then(async (r: any) => {
                        if (AttachmentFiles.length > 0) {
                            this.copyAttachments(listName, ID, listName, r.data.Id)
                        }
                        res.push(r)
                    }
                    ).catch((err: any) => { console.log(err); reject(err); });
                }
                // Executes the batched calls
                execute().then(() => {
                    resolve(res);
                }, (error: any): any => {
                    console.log("Error in Creating Item");
                    reject(error);
                });

            } else {
                list = this._sp.web.lists.getByTitle(listName);
                const [batchedSP, execute] = this._sp.batched();
                list = batchedSP.web.lists.getByTitle(listName);
                let res: any[] = [];
                for (let index = 0; index < objItems.length; index++) {
                    const { AttachmentFiles, ID, ...listItemData } = objItems[index];
                    list.items.add(listItemData).then(async (r: any) => {
                        if (AttachmentFiles.length > 0) {
                            this.copyAttachments(listName, ID, listName, r.data.Id)
                        }
                        res.push(r)
                    }
                    ).catch((err: any) => { console.log(err); reject(err); });
                }
                // Executes the batched calls
                execute().then(() => {
                    resolve(res);
                }, (error: any): any => {
                    console.log("Error in Creating Item");
                    reject(error);
                });
            }
        });
    }

    public async getItemsByQuery(queryOptions: IPnPQueryOptions): Promise<any[]> {
        try {
            let _list;
            const { filter, select, expand, top, skip, listName, orderBy, isSortOrderAsc } = queryOptions;
            if (!!queryOptions.siteUrl) {
                const spWeb = spfi(queryOptions.siteUrl).using(SPFx(this._webPartContext));
                _list = spWeb.web.lists.getByTitle(listName);
            } else {
                _list = this._sp.web.lists.getByTitle(listName);
            }

            const fetchTop = !!top ? (top >= 5000 ? 4999 : top) : 4999;
            let result = _list.items;
            if (select) result = result.select(...select);
            if (filter) result = result.filter(filter);
            if (expand) result = result.expand(...expand);
            if (fetchTop) result = result.top(fetchTop);
            if (orderBy) result = result.orderBy(orderBy, isSortOrderAsc);
            if (skip) result = result.skip(skip);
            let listItems = [];
            let items: any;
            items = await result.getPaged();
            listItems = items.results;
            while (items.hasNext) {
                items = await items.getNext();
                listItems = [...listItems, ...items.results];
            }
            return listItems;
        } catch (error) {
            throw new Error(error);
        }
    }

    public getSiteGroups(groupName: string): Promise<any> {
        return this._sp.web.siteGroups.getByName(groupName).users();
        // return spWebB.web.roleAssignments();
    }

    public async getAllItems(queryOptions: IPnPQueryOptions): Promise<any[]> {
        try {
            const { filter, select, expand, top, skip, listName, orderBy, isSortOrderAsc } = queryOptions;
            let _list = this._sp.web.lists.getByTitle(listName);
            let result = _list.items;
            if (filter) result = result.filter(filter);
            if (select) result = result.select(...select);
            if (expand) result = result.expand(...expand);
            if (top) result = result.top(top);
            if (orderBy) result = result.orderBy(orderBy, isSortOrderAsc);
            if (skip) result = result.skip(skip);
            return await result.getAll();
        } catch (e) {
            throw new Error(e);
        }
    }

    public async getItemsByCAMLQuery(listName: string, xmlQuery: string, overrideParameters: any = { SortField: "Title", SortDir: "Asc" }, siteUrl?: string): Promise<any[]> {
        try {
            let isPaged: boolean = true;
            let allData: any[] = [];
            let pageToken = "";
            do {
                const renderListDataParams: IRenderListDataParameters = {
                    ViewXml: xmlQuery,
                    Paging: pageToken,
                };

                let r;
                if (!!siteUrl) {
                    const spWeb = spfi(siteUrl).using(SPFx(this._webPartContext));
                    r = await spWeb.web.lists.getByTitle(listName).renderListDataAsStream(renderListDataParams, overrideParameters);
                } else {
                    r = await this._sp.web.lists.getByTitle(listName).renderListDataAsStream(renderListDataParams, overrideParameters);
                }

                // const r = await this._sp.web.lists.getByTitle(listName).renderListDataAsStream(renderListDataParams, overrideParameters);
                if (!!r.NextHref) {
                    pageToken = r.NextHref.split('?')[1];
                } else {
                    isPaged = false;
                }
                allData = [...allData, ...r.Row];
            } while (isPaged);
            if (allData.length > 0) {
                allData = [...getUniueRecordsByColumnName(allData, "ID")];
            }
            return allData;
        } catch (error) {
            throw new Error(error);
        }
    }

    public updateItemWithPnP(objItems: any, listName: string, itemId: number): Promise<any> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            this._sp.web.lists.getByTitle(listName).items
                .getById(itemId).update(objItems)
                .then((itemUpdateResult: IItemUpdateResult) => {
                    resolve(objItems);
                }, (error: any): void => {
                    console.log("Error in updating item in -" + listName);
                    reject(error);
                });
        });
    }

    public async choiceOption(listName: string, fieldName: string): Promise<any> {
        const list = await this._sp.web.lists.getByTitle(listName).fields.filter(`EntityPropertyName eq '${fieldName}'`).select('Choices')();
        return list[0]?.Choices;
    }

    public async GetFields(listName: string, fieldName: string): Promise<any> {
        const list = this._sp.web.lists.getByTitle(listName);
        const field = await list.fields.getByTitle(fieldName)();
        if (field && field.TypeAsString === 'Choice') {
            return field.Choices;
            // console.log('Choice column values:', choices);
        } else if (field && field.TypeAsString === 'MultiChoice') {
            return field.Choices;
        }
    }

    public async AddUserToGroup(groupName: string, userEmail: string): Promise<any> {
        try {
            const group = await this._sp.web.siteGroups.getByName(groupName);
            const user = await group.users.add(`i:0#.f|membership|${userEmail}`);
            return user;
        } catch (error) {
            console.error('Error adding user to group:', error);
            throw error;
        }
    }

    public async RemoveUserFromGroup(groupName: string, userId: number): Promise<any> {
        try {
            const group = await this._sp.web.siteGroups.getByName(groupName)();
            await this._sp.web.siteGroups.getById(group.Id).users.removeById(userId);
        } catch (error) {
            console.error(`Error removing user from group: ${error}`);
        }
    }

    public async updateTheThumbLine(listName: string, file: any, oldFileUrl: string): Promise<any> {
        // const rootFolder = await this._sp.web.lists.getByTitle(listName).rootFolder.select("ServerRelativeUrl")();
        // Upload the file to the root folder
        const result = await this._sp.web.getFileByServerRelativePath(oldFileUrl).setContentChunked(file);
        return result;

    }

    public async createTheThumbLine(listName: string, file: IFileWithBlob): Promise<any> {

        const rootFolder = await this._sp.web.lists.getByTitle(listName).rootFolder.select("ServerRelativeUrl")();
        let fileUpload: IFileAddResult | any;
        if (rootFolder.ServerRelativeUrl) {
            if (file.file?.size <= 10485760) {
                fileUpload = await this._sp.web.getFolderByServerRelativePath(`${rootFolder.ServerRelativeUrl}`).
                    files.addUsingPath(file.name, file.file, { Overwrite: true });

            }
            else {
                //large upload
                fileUpload = await this._sp.web.getFolderByServerRelativePath(`${rootFolder.ServerRelativeUrl}`).files
                    .addChunked(file.name, file.file, data => {
                        console.log(`progress`);
                    }, true);
            }
        }
        return fileUpload;
    }

    public async getFileBlobByUrl(serverRelativeUrl: string): Promise<Blob> {
        const file = await this._sp.web.getFileByServerRelativePath(serverRelativeUrl);
        const blob = await file.getBlob();
        return blob;
    }

    public updateItemWithPnPSiteUrl(objItems: any, listName: string, itemId: number, siteUrl?: string): Promise<any> {
        // const spWeb = spfi(siteUrl).using(SPFx(this._webPartContext));
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            this._sp.web.lists.getByTitle(listName).items
                .getById(itemId).update(objItems)
                .then((itemUpdateResult: IItemUpdateResult) => {
                    resolve(itemUpdateResult);
                }, (error: any): void => {
                    console.log("Error in updating item in -" + listName);
                    reject(error);
                });
        });
    }
    public addAttachment(listName: string, id: number, files: IAttachment): Promise<any> {
        return this._sp.web.lists.getByTitle(listName).items.getById(id).attachmentFiles.add(files.name, files.fileContent);
    }

    public async addMultipleAttachment(listName: string, id: number, files: IAttachment[]): Promise<any> {
        const item = this._sp.web.lists.getByTitle(listName).items.getById(id);

        for (const file of files) {
            try {
                await item.attachmentFiles.add(file.name, file.fileContent);
            } catch (error) {
                console.error(`Error uploading file ${file.name}:`, error);
            }
        }

        return true;
    }
    public async additemsWithAttachment(listName: string, objItems: any, files: any): Promise<any> {
        try {
            const itemAddedResult = await this._sp.web.lists.getByTitle(listName).items.add(objItems);

            if (files) {
                const attachment = await itemAddedResult.item.attachmentFiles.add(files.name, files.fileContent);
                return itemAddedResult;
            } else {
                return itemAddedResult;
            }
        } catch (error) {
            console.log("Error in creating item: " + error);
            throw error;
        }
    }

    public async deleteAttachmentIfAvailable(listName: string, itemId: number, attachmentName: string, siteUrl?: string): Promise<void> {
        try {
            const item: IItem = this._sp.web.lists.getByTitle(listName).items.getById(itemId);

            // 🔍 Get all attachments for the item
            const attachments = await item.attachmentFiles();

            // ✅ Check if the attachment exists
            const fileExists = attachments.some((a: any) => a.FileName === attachmentName);

            if (fileExists) {
                // 🗑️ Delete only if available
                await item.attachmentFiles.getByName(attachmentName).delete();
                console.log(`Attachment '${attachmentName}' deleted successfully.`);
            } else {
                console.log(`Attachment '${attachmentName}' not found. Skipping delete.`);
            }
        } catch (error) {
            console.error(`Error deleting attachment '${attachmentName}':`, error);
            throw error; // optional: rethrow if you want caller to handle it
        }
    }

    public deleteAttachment(listName: string, itemId: number, attachmentName: string, siteUrl?: string): Promise<any> {
        const item: IItem = this._sp.web.lists.getByTitle(listName).items.getById(itemId);
        return item.attachmentFiles.getByName(attachmentName).delete();
    }

    getByItemByID(listName: string, id: number): Promise<any> {
        try {
            return this._sp.web.lists.getByTitle(listName).items.getById(id)();
        }
        catch (error) { throw new Error(error); }
    }
    getByItemByIDQuery(queryOptions: any): Promise<any> {
        try {
            return this._sp.web.lists.getByTitle(queryOptions.listName).items.getById(queryOptions.id).select(queryOptions.select).expand(queryOptions.expand)();
        }
        catch (error) { throw new Error(error); }
    }

    public updateListItemsInBatchPnP(listName: string, objItems: any[]): Promise<any> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            const [batchedSP, execute] = this._sp.batched();

            const list = batchedSP.web.lists.getByTitle(listName);
            let res: any[] = [];
            for (let index = 0; index < objItems.length; index++) {
                const element = objItems[index];
                let obj = { ...element };
                delete obj.Id;
                list.items.getById(element.Id).update(obj).then((r: any) => res.push(r)).catch((err: any) => { console.log(err); reject(err); });
            }
            // Executes the batched calls
            execute().then(() => {
                resolve(res);
            }, (error: any): any => {
                console.log("Error in Creating Item");
                reject(error);
            });
        });
    }

    public updateListItemsInBatchWithAttachment(listName: string, objItems: any[]): Promise<any> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            const [batchedSP, execute] = this._sp.batched();

            const list = batchedSP.web.lists.getByTitle(listName);
            let res: any[] = [];
            for (let index = 0; index < objItems.length; index++) {
                const element = objItems[index];
                // let obj = { ...element };
                const { Files, Id, ...updateData } = element;
                // delete obj.Id;
                list.items.getById(element.Id).update(updateData).then(async (r: any) => {
                    if (Files && Files.length > 0) {
                        const itemRef = list.items.getById(Id);
                        for (const file of Files) {
                            try {
                                await itemRef.attachmentFiles.add(file.name, file);
                                console.log(`File ${file.name} attached to item with ID ${Id}`);
                            } catch (fileErr) {
                                console.error(`Error attaching file ${file.name} to item ${Id}:`, fileErr);
                                throw fileErr; // Rethrow the file attachment error
                            }
                        }
                    }
                    res.push(r)
                }).catch((err: any) => { console.log(err); reject(err); });
            }
            // Executes the batched calls
            execute().then(() => {
                resolve(res);
            }, (error: any): any => {
                console.log("Error in Creating Item");
                reject(error);
            });
        });
    }

    public async getCurrentUser(): Promise<any> {
        try {
            await this._sp.web.siteUsers();
            return await this._sp.web.currentUser();
        }
        catch (error) {
            throw new Error(error);
        }
    }
    public async getUserPropertiesFor(accountName: string): Promise<any> {
        const profile = await this._sp.profiles.getPropertiesFor(accountName);
        return profile;
    }

    public async getUserIdByEmail(email: string): Promise<number> {
        try {
            const user = await this._sp.web.siteUsers.getByEmail(email).select("Id")(); // Corrected line
            return user.Id; // Return the user ID
        } catch (error) {
            return 0; // Return
            // throw new Error(`Failed to get user ID for email ${email}: ${error}`);
        }
    }


    public async getSiteUsers(): Promise<any> {
        try {
            return await this._sp.web.siteUsers();
        }
        catch (error) {
            throw new Error(error);
        }
    }
    public deleteItem(listName: string, itemId: number, Url: string): Promise<boolean> {
        let _list: any;
        if (!!Url) {
            // const spWeb = spfi(Url).using(SPFx(this._webPartContext));
            _list = this._sp.web.lists.getByTitle(listName);
        } else {
            _list = this._sp.web.lists.getByTitle(listName);
        }
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            _list.items.getById(itemId).delete()
                .then(() => {
                    resolve(true);
                }, (error: any): void => {
                    console.log("Error in deleting Item from -" + listName);
                    reject(false);
                });
        });
    }
    public getSiteList(): Promise<any> {
        let filter = `Hidden eq false`
        return this._sp.web.lists.filter(filter)();
    }

    public async getUserName(id: any) {
        const userDetails = await this._sp.web.getUserById(id)();
        return userDetails;
    }

    public async getPropertiesFor(name: any): Promise<any> {
        let userProfile = await this._sp.profiles.getPropertiesFor(name);
        return userProfile;
    }


    public async getlistSchema(listName: string): Promise<any> {
        try {

            const _list = await this._sp.web.lists.getByTitle(listName).fields()
            return _list;
        }
        catch (error) { throw new Error(error); }
    }

    public async getVersionHistoryById(listName: string, itemId: number): Promise<any[]> {
        return new Promise<any>((resolve: (results: any[]) => void, reject: (error: any) => void): void => {
            this._sp.web.lists.getByTitle(listName).items.getById(itemId).versions()
                .then((itemVersionHistory: any[]) => {
                    const sortedItemVersionHistory = itemVersionHistory.sort((a: any, b: any) => b.VersionLabel - (a.VersionLabel));
                    resolve(sortedItemVersionHistory);
                }, (error: any): void => {
                    console.log("Error in get version history by -" + listName);
                    reject([]);
                });
        });
    }

    public publishDocumentByURL(fileRef: string, comment: string = ""): Promise<void> {
        return this._sp.web.getFileByServerRelativePath(fileRef).publish(comment).then((_: any) => {
        });
    }

    public getDocumentByServerRelativePath(ServerRelativePath: string): Promise<void> {
        return this._sp.web.getFileByServerRelativePath(ServerRelativePath).listItemAllFields.select("EncodedAbsThumbnailUrl,FileRef,FileLeafRef,ID")();
    }


    public isAvailbleDocumnetByServerRelativePath(ServerRelativePath: string): Promise<any> {
        return this._sp.web.getFileByServerRelativePath(ServerRelativePath).exists();
    }

    public getDocumentByURL(document?: string): Promise<any> {
        return this._sp.web.lists.getByTitle("Documents").items.select("FileLeafRef", "FileDirRef", "File", "Id")
            .getAll()
            .then((items) => {
                return items;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    public getTrainingMaterial(document?: string): Promise<any> {
        return this._sp.web.lists.getByTitle("TrainingMaterial").items.select("FileLeafRef", "FileDirRef", "File", "Id")()
            .then((items) => {
                return items;
            })
            .catch((error) => {
                console.error(error);
            });
    }

    public async _Document(UploadFolderName: string): Promise<any> {
        const listFolders = await this._sp.web.lists.getByTitle(`SiteAssets/${UploadFolderName}`).rootFolder.folders().then((res) => {
            return res;
        }).catch((e) => { return ""; });

        if (listFolders.length > 0) {
            let folderName: string = "Test";
            return this._sp.web.lists.getByTitle(`SiteAssets/${UploadFolderName}`).items.add({
                FileSystemObjectType: 1, // Indicates that this is a folder
                FileLeafRef: folderName, // The name of the folder
            }).then((result) => {
                console.log(`Folder "${folderName}" created successfully`);
            }).catch((error) => {
                console.error(`Error creating folder: ${error.message}`);
            });
        } else {
            const folderAddResult = await this._sp.web.folders.addUsingPath(`SiteAssets/${UploadFolderName}`).then((res) => {
                return res;
            }).catch((e) => { return ""; });

            // const folder = await this._sp.web.folders.getByUrl("Documents")();
            return folderAddResult;
        }
    }



    public async delteItemsBatch(listName: string, itemId: any[]): Promise<any> {
        try {
            const list = await this._sp.web.lists.getByTitle(listName);
            // const items = await list.items.getAll();
            const [batchedListBehavior, execute] = createBatch(list);
            list.using(batchedListBehavior);
            itemId.forEach(async (i: any) => {
                await list.items.getById(i).delete();
            });
            await execute();
        }
        catch {
            console.log("delete");
        }
    }

    downloadFile = async (filePath: string, fileName: string): Promise<any> => {
        return await this._sp.web.getFileByServerRelativePath(filePath).getBlob()
            .then((blob: any) => {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.click();
            });
    };

    public async deleteFileFromFolder(folderUrl: string, fileName: string): Promise<void> {
        try {
            const folder = this._sp.web.getFolderByServerRelativePath(folderUrl);
            const file = folder.files.getByUrl(fileName);
            await file.delete();
            console.log(`File has been deleted successfully.`);
        } catch (error) {
            console.error(`Error deleting file:`, error);
        }
    }
    public async deleteFolder(folderUrl: string): Promise<void> {
        try {
            const folder = this._sp.web.getFolderByServerRelativePath(folderUrl);
            await folder.delete();
            console.log(`Folder has been deleted successfully.`);
        } catch (error) {
            console.error(`Error deleting folder:`, error);
        }
    }

    public UpdateItemWithAttachment(ID: number, listName: string, file: any, objItems?: any, oldAttachmnetName?: any): Promise<any> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            this._sp.web.lists.getByTitle(listName).items.getById(ID).update(objItems)
                .then(async (itemAddedResult: IItemAddResult) => {
                    if (!!file) {
                        if (!!oldAttachmnetName) {
                            await itemAddedResult.item.attachmentFiles.getByName(oldAttachmnetName).delete();
                        }
                        await itemAddedResult.item.attachmentFiles.add(file.name, file.content);
                    }
                    resolve(itemAddedResult);
                }, (error: any): any => {
                    console.log("Error in Updating  Item" + ID);
                    reject(error);
                }).catch((e: any) => {
                    console.log(e);
                });
        });
    }

    public async uploadFile(file: IFileWithBlob, metadataUpdate?: boolean, metadata: any = null): Promise<any> {
        let fileUpload: IFileAddResult | any;
        if (file.folderServerRelativeURL) {
            if (file.file?.size <= 10485760) {
                fileUpload = await this._sp.web.getFolderByServerRelativePath(file.folderServerRelativeURL).
                    files.addUsingPath(file.name, file.file, { Overwrite: true });
                if (metadataUpdate) {
                    const item = await fileUpload.file.getItem();
                    await item.update(metadata);
                }
            }
            else {
                //large upload
                fileUpload = await this._sp.web.getFolderByServerRelativePath(file.folderServerRelativeURL).files
                    .addChunked(file.name, file.file, data => {
                        console.log(`progress`);
                    }, true);
                if (metadataUpdate) {
                    const item = await fileUpload.file.getItem();
                    await item.update(metadata);
                }
            }
        }
        return fileUpload;
    }
    public async uploadFilewithSiteUrl2(file: IFileWithBlob, metadataUpdate?: boolean, metadata: any = null,): Promise<any> {
        let fileUpload: IFileAddResult | any;
        // const spWeb = spfi(siteUrl).using(SPFx(this._webPartContext));
        if (file.folderServerRelativeURL) {
            if (file.file[0]?.size <= 10485760) {
                fileUpload = await this._sp.web.getFolderByServerRelativePath(file.folderServerRelativeURL).
                    files.addUsingPath(file.name, file.file, { Overwrite: true });
                if (metadataUpdate) {
                    const item = await fileUpload.file.getItem();
                    await item.update(metadata);
                }
            }
            else {
                //large upload
                fileUpload = await this._sp.web.getFolderByServerRelativePath(file.folderServerRelativeURL).files
                    .addChunked(file.name, file.file, data => {
                        console.log(`progress`);
                    }, true);
                if (metadataUpdate) {
                    const item = await fileUpload.file.getItem();
                    await item.update(metadata);
                }
            }
        }

        return fileUpload;
    }
    public async uploadFilewithSiteUrl(file: any, siteUrl: string, metadataUpdate?: boolean, metadata: any = null,): Promise<any> {
        let fileUpload: IFileAddResult | any;
        const spWeb = spfi(siteUrl).using(SPFx(this._webPartContext));


        if (siteUrl) {
            fileUpload = await this._sp.web.getFolderByServerRelativePath(siteUrl).
                files.addUsingPath(file.name, file, { Overwrite: true });
            if (metadataUpdate) {
                const item = await fileUpload.file.getItem();
                await item.update(metadata);
            }
        }

        return fileUpload;
    }
    public async FolderByServerSiteUrl(url: string): Promise<any> {
        const folder = await this._sp.web.getFolderByServerRelativePath(url).folders();
        //console.log(folder);//add filter and remove form array
        return folder;
    }
    public async FileByServerSiteUrl(url: string): Promise<any> {
        const folder = await this._sp.web.getFolderByServerRelativePath(url).files();
        // console.log(folder);
        return folder;
    }

    public async RenameFileByServerSiteUrl(url: string): Promise<any> {
        const file = await this._sp.web.getFileByServerRelativePath(url).select("*")();
        return file;
    }





    public async RenameFile(url: string, newName: string): Promise<any> {
        let item;
        let getFolder = this._sp.web.getFolderByServerRelativePath(url);
        item = await getFolder.getItem();
        await item.update({ FileLeafRef: newName.trim() });
    }

    public async _Documentlib(UploadFolderName: string, metadata?: any): Promise<any> {
        const listFolders = await this._sp.web.lists.getByTitle(`SiteDocuments/${UploadFolderName}`).rootFolder.folders().then((res) => {
            return res;
        }).catch((e) => { return ""; });

        if (listFolders.length > 0) {
            let folderName: string = "Test";
            return this._sp.web.lists.getByTitle(`SiteDocuments/${UploadFolderName}`).items.add({
                FileSystemObjectType: 1, // Indicates that this is a folder
                FileLeafRef: folderName, // The name of the folder
            }).then((result) => {
                console.log(`Folder "${folderName}" created successfully`);
            }).catch((error) => {
                console.error(`Error creating folder: ${error.message}`);
            });
        } else {
            // const folderAddResult = await this._sp.web.folders.addUsingPath(`SiteDocuments/${UploadFolderName}`).then((res) => {
            //     return res;
            // }).catch((e) => { return ""; });
            // return folderAddResult;
            const folderAddResult = await this._sp.web.folders
                .addUsingPath(`SiteDocuments/${UploadFolderName}`)
                .then(async (res) => {
                    if (!!metadata) {
                        // Get the list item associated with the folder
                        const item = await res.folder.getItem();

                        // Update metadata (custom columns)
                        await item.update(metadata);
                    }

                    return res;
                })
                .catch((e) => {
                    console.error("Error creating folder or setting metadata:", e);
                    return "";
                });
            return folderAddResult
        }
    }
    public async getItemsInBatchByCAMLQuery(pnpQueryOptions: IPnPCAMLQueryOptions): Promise<any> {
        try {
            let isPaged: boolean = true;
            let allData: any[] = [];
            let pageToken = pnpQueryOptions.pageToken;
            let response: any;
            const pageLength = pnpQueryOptions.pageLength || 5000;
            do {
                const renderListDataParams: IRenderListDataParameters = {
                    ViewXml: pnpQueryOptions.queryXML,
                    Paging: pageToken,
                };

                if (pnpQueryOptions.FolderServerRelativeUrl) {
                    renderListDataParams.FolderServerRelativeUrl = pnpQueryOptions.FolderServerRelativeUrl;
                }

                if (!!pnpQueryOptions.siteUrl) {
                    const spWeb = spfi(pnpQueryOptions.siteUrl).using(SPFx(this._webPartContext));
                    response = await spWeb.web.lists.getByTitle(pnpQueryOptions.listName).renderListDataAsStream(renderListDataParams, pnpQueryOptions.overrideParameters, undefined);
                } else {
                    response = await this._sp.web.lists.getByTitle(pnpQueryOptions.listName).renderListDataAsStream(renderListDataParams, pnpQueryOptions.overrideParameters, undefined);
                }
                if (response) {
                    allData = [...allData, ...response.Row];
                    if (allData?.length < pageLength && response?.NextHref) {
                        pageToken = response.NextHref.split('?')[1];
                    } else {
                        isPaged = false;
                    }
                } else {
                    isPaged = false;
                }
            } while (isPaged);
            if (response?.Row)
                response.Row = allData;
            return response;
        } catch (error) {
            console.log(pnpQueryOptions.listName);
            await this.getErrorObject(error);
        }
    }

    public async getErrorObject(e: any): Promise<any> {
        const _error = { message: "", name: "" };
        if (e?.isHttpRequestError) {
            const json = await (<any>e).response.json();
            _error.message = typeof json["odata.error"] === "object" ? json["odata.error"].message.value : e.message;
            if ((<any>e).status === 404) {
                console.error((<any>e).statusText);
            }

        } else {
            console.log(e.message);
            _error.message = e.message;
        }
        throw new Error(JSON.stringify(_error));
    }

    public async copyAttachments(sourceListTitle: string, sourceItemId: number, targetListTitle: string, targetItemId: number): Promise<any> {
        try {
            // 1. Get attachments from the source item
            const sourceAttachments: any[] = await this._sp.web.lists.getByTitle(sourceListTitle)
                .items.getById(sourceItemId)
                .attachmentFiles();

            if (sourceAttachments.length === 0) {
                console.log("No attachments found in the source item.");
                return;
            }

            // 2. Loop through each attachment, download and re-upload to the target item
            for (const attachment of sourceAttachments) {
                // 2.1. Fetch the content of the attachment as a Blob
                const attachmentFile = await this._sp.web.getFileByServerRelativePath(attachment.ServerRelativeUrl).getBlob();

                // 2.2. Upload the attachment to the target list item
                await this._sp.web.lists.getByTitle(targetListTitle)
                    .items.getById(targetItemId)
                    .attachmentFiles.add(attachment.FileName, attachmentFile);
            }
        } catch (error) {
            console.error("Error copying attachments: ", error);
        }
    }
    public uploadListAttachmentToList(listName: string, attachmentFileObj: any, itemId: number): Promise<any> {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise<any>(async (resolve: (results: any) => void, reject: (error: any) => void): Promise<void> => {
            let item = await this._sp.web.lists.getByTitle(listName).items.getById(itemId);
            item.attachmentFiles.add(attachmentFileObj.name, attachmentFileObj).then(v => {
                resolve(v);
            }, (error: any): void => {
                console.log("Error&nbsp;in&nbsp;Update&nbsp;Attachment&nbsp;in&nbsp;the&nbsp;list&nbsp;-&nbsp;" + listName);
                reject(error);
            });
        });
    }

    public async readFileContent(fileServerRelativeUrl: string, type: "text" | "json" | "buffer" = "text"): Promise<any> {
        try {
            const file = await this._sp.web.getFileByServerRelativePath(fileServerRelativeUrl);
            const blob: Blob = await file.getBlob();

            if (type === "buffer") {
                return await blob.arrayBuffer();
            }

            const text = await blob.text();

            if (type === "json") {
                return JSON.parse(text);
            }

            return text;
        } catch (err) {
            console.error("Error reading file:", err);
            return null;
        }
    }

    public async getFileContentByFilter(libraryName: string, type: "text" | "json" | "buffer" = "text", filter: any): Promise<any> {
        try {
            const items = await this._sp.web.lists
                .getByTitle(libraryName)
                .items
                .filter(filter)
                .select("Id", "File/ServerRelativeUrl")
                .expand("File")
                .top(1)();

            if (!items || items.length === 0) {
                console.warn("No file found for given category, returning null");
                return null;
            }

            const fileUrl = items[0].File.ServerRelativeUrl;
            const file = await this._sp.web.getFileByServerRelativePath(fileUrl);
            const blob: Blob = await file.getBlob();

            if (type === "buffer") {
                return blob.arrayBuffer();
            }

            const text = await blob.text();

            if (type === "json") {
                return JSON.parse(text);
            }

            return text;
        } catch (e) {
            console.warn("Error in getting file content", e);
            return null;
        }
    }
    public getListItemAttachments(
        listName: string,
        itemId: number
    ): Promise<any[]> {
        return new Promise<any[]>(async (resolve, reject): Promise<void> => {
            try {
                const attachments =
                    await this._sp.web.lists
                        .getByTitle(listName)
                        .items
                        .getById(itemId)
                        .attachmentFiles();

                resolve(attachments);
            } catch (error) {
                console.log(
                    "Error in getting attachments from list - " + listName
                );
                reject(error);
            }
        });
    }

}