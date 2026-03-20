/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { WebPartContext } from "@microsoft/sp-webpart-base";

import { IDataProvider } from "./models/IDataProvider";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "./models/IPnPQueryOptions";

import { SPFI, SPFx, spfi } from "@pnp/sp";
import { getSP } from "./models/PnPJSConfig";
import { IItem, IItemAddResult, IItemUpdateResult } from "@pnp/sp/items";
import "@pnp/sp/search";
import { IRenderListDataParameters } from "@pnp/sp/lists";
import { IFileAddResult } from "@pnp/sp/files";
import { HttpRequestError } from "@pnp/queryable";
import { IFileWithBlob } from "./models/IFileWithBlob";

import { SharingRole } from "@pnp/sp/sharing";
import { ListNames } from "../Shared/Enum/ListNames";

// DMS Model Interfaces
export interface ICategory {
    id: number;
    name: string;
    description?: string;
    parentId?: number;
    level: number; // 1=Category, 2=Group, 3=SubGroup, 4=Artifact
    status: 'Active' | 'Inactive';
    documentCategory?: string;
    group?: string;
    subGroup?: string;
    artifactName?: string;
    templateName?: string;
    ctdModule?: string;
    ectdSection?: string;
    ectdSubsection?: string;
    ectdCode?: string;
    documents?: number;
}

export interface IDrug {
    id: number;
    name: string;
    category?: string;
    status: 'Active' | 'Inactive' | 'In Development';
    description?: string;
    ctdStructure?: 'ectd' | 'dossier';
}

export interface ICTDFolder {
    id: number;
    folderId: string;
    name: string;
    parentFolderId?: string;
    sortOrder: number;
    isFolder: boolean;
}

export interface ITemplate {
    id: number;
    name: string;
    category?: string;
    categoryId?: number;
    country?: string;
    countryId?: number;
    mappedCTDFolder?: string;
    mappedCTDFolderId?: number;
    eCTDSection?: string;
    eCTDSectionId?: number;
    eCTDSubsection?: string;
    status: 'Active' | 'Inactive';
    mappingType: 'eCTD' | 'GMP' | 'None';
    uploadDate?: string;
    fileRef?: string;
}

export interface IDocument {
    id: number;
    name: string;
    fileName?: string;
    fileRef?: string;
    category?: string;
    categoryId?: number;
    drugName?: string;
    drugId?: number;
    status: string;
    lastModified?: string;
    author?: string;
    authorId?: number;
    reviewer?: string;
    reviewerId?: number;
    approver?: string;
    approverId?: number;
    comments?: IComment[];
    ctdFolder?: string;
    ctdModule?: string;
    submodule?: string;
    template?: string;
    templateId?: number;
    content?: string;
    version?: number;
    createdDate?: string;
    sentBy?: string;
    sharePointUrl?: string;
}

export interface IComment {
    id: number;
    author: string;
    text: string;
    timestamp: string;
}

export interface IWorkflowApproval {
    id: number;
    documentId: number;
    requestedBy?: string;
    requestedById?: number;
    approver?: string;
    approverId?: number;
    decision?: 'Approved' | 'Rejected';
    decisionComment?: string;
    requestedOn?: string;
    decidedOn?: string;
    cycle: number;
}

export interface IUserRole {
    id: number;
    userId?: number;
    userName?: string;
    role: 'Admin' | 'HR' | 'Author' | 'Approver';
    permissions?: string[];
}

export interface IReportStats {
    totalDocuments: number;
    draftCount: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    approvalRate: number;
}


export interface IShareDocument {
    fileUrl: string;
    userEmail: any;
    role: SharingRole | string;
    emailBody?: any;
    currentUserName: any;

}
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


    getSearchDocument(data: any): Promise<any> {
        throw new Error('Method not implemented.');
    }

    public async createItem(objItems: any, listName: string): Promise<any> {
        try {
            const itemAddedResult = await this._sp.web.lists.getByTitle(listName).items.add(objItems);
            return itemAddedResult;
        } catch (error) {
            console.log("Error in Creating Item", error);
            throw error;
        }
    }

    // Detects a SharePoint 423 file-lock error regardless of how PnPjs surfaces it.
    private _is423(error: any): boolean {
        const status = Number(
            (error as HttpRequestError)?.response?.status ??
            error?.status ??
            error?.data?.status ??
            0
        );
        if (status === 423) return true;
        const msg = String(error?.message || error || '').toLowerCase();
        return msg.includes('[423]') || (msg.includes('423') && msg.includes('lock'));
    }

    // Updates list item metadata via the SharePoint SOAP endpoint, which bypasses
    // the co-authoring file lock that blocks REST MERGE/validateUpdateListItem.
    private async _updateItemViaSoap(objItems: any, listName: string, itemId: number): Promise<void> {
        // absoluteUrl may be a URL object or string depending on SPFx version — normalise to string
        const webUrl: string = String(this._webPartContext.pageContext.web.absoluteUrl).replace(/\/$/, '');

        const fieldsXml = Object.entries(objItems).map(([k, v]) => {
            const raw = (v === null || v === undefined) ? '' : String(v);
            const safe = raw.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            return `<Field Name="${k}">${safe}</Field>`;
        }).join('');

        const soapBody = [
            '<?xml version="1.0" encoding="utf-8"?>',
            '<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
            '  xmlns:xsd="http://www.w3.org/2001/XMLSchema"',
            '  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">',
            '<soap:Body>',
            '<UpdateListItems xmlns="http://schemas.microsoft.com/sharepoint/soap/">',
            `<listName>${listName}</listName>`,
            '<updates><Batch>',
            '<Method ID="1" Cmd="Update">',
            `<Field Name="ID">${itemId}</Field>`,
            fieldsXml,
            '</Method></Batch></updates>',
            '</UpdateListItems></soap:Body></soap:Envelope>'
        ].join('');

        // Prefer the in-page form digest (no extra HTTP call); fall back to contextinfo
        let digest: string = (this._webPartContext as any)?.pageContext?.legacyPageContext?.formDigestValue || '';
        if (!digest) {
            try {
                const digestResp = await fetch(`${webUrl}/_api/contextinfo`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: { 'Accept': 'application/json;odata=nometadata', 'Content-Type': 'application/json' }
                });
                const digestJson = await digestResp.json();
                digest = digestJson.FormDigestValue || '';
            } catch (_) {
                // continue without digest — some SharePoint versions don't require it on same origin
            }
        }

        const soapResp = await fetch(`${webUrl}/_vti_bin/Lists.asmx`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': 'http://schemas.microsoft.com/sharepoint/soap/UpdateListItems',
                ...(digest ? { 'X-RequestDigest': digest } : {})
            },
            body: soapBody
        });
        if (!soapResp.ok) {
            throw new Error(`SOAP UpdateListItems failed: HTTP ${soapResp.status}`);
        }
        const xml = await soapResp.text();
        // SOAP returns HTTP 200 even for errors — check the XML error code
        const errorCodeMatch = xml.match(/<ErrorCode>([^<]+)<\/ErrorCode>/);
        if (errorCodeMatch && errorCodeMatch[1] !== '0x00000000') {
            const errText = xml.match(/<ErrorText>([^<]*)<\/ErrorText>/)?.[1] || `ErrorCode ${errorCodeMatch[1]}`;
            throw new Error(`SOAP UpdateListItems error: ${errText}`);
        }
    }

    public async updateItem(objItems: any, listName: string, itemId: number): Promise<any> {
        try {
            const itemUpdateResult = await this._sp.web.lists.getByTitle(listName).items.getById(itemId).update(objItems);
            return itemUpdateResult;
        } catch (error: any) {
            if (this._is423(error)) {
                // File is locked by Word Online.
                // Fallback 1: validateUpdateListItem (form-based metadata update)
                console.warn('[updateItem] 423 lock — retrying via validateUpdateListItem');
                try {
                    const formValues = Object.entries(objItems).map(([FieldName, val]) => ({
                        FieldName,
                        FieldValue: (typeof val === 'boolean') ? (val ? '1' : '0')
                                  : (val === null || val === undefined) ? ''
                                  : String(val)
                    }));
                    return await this._sp.web.lists
                        .getByTitle(listName).items.getById(itemId)
                        .validateUpdateListItem(formValues, false);
                } catch (fallback1Error: any) {
                    // Fallback 2: SOAP UpdateListItems — bypasses co-authoring file lock
                    console.warn('[updateItem] validateUpdateListItem also failed — retrying via SOAP');
                    try {
                        await this._updateItemViaSoap(objItems, listName, itemId);
                        return { success: true };
                    } catch (soapError: any) {
                        console.error('[updateItem] SOAP fallback failed', soapError);
                        throw fallback1Error;
                    }
                }
            }
            console.log("Error in updating item in -" + listName);
            throw error;
        }
    }

    public async createItemInBatch(objItems: any[], listName: string): Promise<any[]> {
        const [batchedSP, execute] = this._sp.batched();
        const list = batchedSP.web.lists.getByTitle(listName);
        const promises = objItems.map(element => list.items.add(element));
        try {
            const results = await Promise.all(promises);
            await execute();
            return results;
        } catch (error) {
            console.log("Error in Creating Item", error);
            throw error;
        }
    }

    public async getItemsByQuery(queryOptions: IPnPQueryOptions): Promise<any> {
        try {
            const { filter, select, expand, top, skip, listName, orderBy, isSortOrderAsc } = queryOptions;
            const fetchTop = !!top ? (top >= 5000 ? 4999 : top) : 4999;
            const _list = this._sp.web.lists.getByTitle(listName);
            let result = _list.items;
            if (select) result = result.select(...select);
            if (filter) result = result.filter(filter);
            if (expand) result = result.expand(...expand);
            if (fetchTop) result = result.top(fetchTop);
            if (orderBy) result = result.orderBy(orderBy, isSortOrderAsc);
            if (skip) result = result.skip(skip);
            let listItems: any[] = [];
            let items: any;
            items = await result.getPaged();
            listItems = items.results;
            while (items.hasNext) {
                items = await items.getNext();
                listItems = [...listItems, ...items.results];
            }
            return listItems;
        } catch (error) {
            await this.getErrorObject(error);
        }
    }

    public async getAllItems(queryOptions: IPnPQueryOptions): Promise<any> {
        try {
            const { filter, select, expand, top, skip, listName, orderBy, isSortOrderAsc } = queryOptions;
            const _list = this._sp.web.lists.getByTitle(listName);
            let result = _list.items;
            if (filter) result = result.filter(filter);
            if (select) result = result.select(...select);
            if (expand) result = result.expand(...expand);
            if (top) result = result.top(top);
            if (orderBy) result = result.orderBy(orderBy, isSortOrderAsc);
            if (skip) result = result.skip(skip);
            return await result.getAll();
        } catch (e) {
            await this.getErrorObject(e);
        }
    }

    public getByItemByID(queryOptions: IPnPQueryOptions, id: number): Promise<any> {
        try {
            const { select, expand } = queryOptions;
            const _list = this._sp.web.lists.getByTitle(queryOptions.listName);
            let result = _list.items.getById(id);
            if (select) result = result.select(...select);
            if (expand) result = result.expand(...expand);
            return result();
        }
        catch (error) { throw new Error(error); }
    }

    public updateListItemsInBatchPnP(listName: string, objItems: any[]): Promise<any> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            const [batchedSP, execute] = this._sp.batched();

            const list = batchedSP.web.lists.getByTitle(listName);
            const res: any[] = [];
            for (let index = 0; index < objItems.length; index++) {
                const element = objItems[index];
                const obj = { ...element };
                delete obj.Id;
                delete obj.License;
                list.items.getById(element.Id).update(obj).then(r => res.push(r)).catch(err => { console.log(err); reject(err); });
            }
            execute().then(() => {
                resolve(res);
            }, (error: any): any => {
                console.log("Error in Creating Item");
                reject(error);
            });
        });
    }

    public updateListItemsInMultipleListInBatchPnP(objItems: any[]): Promise<any> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            const [batchedSP, execute] = this._sp.batched();

            const res: any[] = [];
            for (let index = 0; index < objItems.length; index++) {
                const element = objItems[index];
                const obj = { ...element };
                delete obj.Id;
                delete obj.listName;
                const list = batchedSP.web.lists.getByTitle(element.listName);
                list.items.getById(element.Id).update(obj).then(r => res.push(r)).catch(err => { console.log(err); reject(err); });
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
            return await this._sp.web.currentUser();
        }
        catch (error) {
            throw new Error(error);
        }
    }

    public async getCurrentUserGroups(): Promise<any> {
        let groups = await this._sp.web.currentUser.groups();
        return groups;
    }

    public async createFolder(folderUrl: string, metadata?: any): Promise<any> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            this._sp.web.folders.addUsingPath(folderUrl).then(async (response) => {
                console.log("Folder is created at " + response.data.ServerRelativeUrl);
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

    public async uploadFile(file: IFileWithBlob, metadataUpdate?: boolean, metadata: any = null): Promise<any> {
        let fileUpload: IFileAddResult;
        if (file.file?.size <= 10485760 || file.file?.file?.size <= 10485760) {
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
        return fileUpload;
    }

    public deleteItem(listName: string, itemId: number): Promise<boolean> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            const numericId = Number(itemId);
            if (!numericId || isNaN(numericId) || numericId <= 0) {
                console.log("Invalid item ID for deletion from -" + listName + ", id:", itemId);
                reject(new Error(`Invalid item ID: ${itemId}`));
                return;
            }
            this._sp.web.lists.getByTitle(listName).items.getById(numericId).delete()
                .then(_ => {
                    resolve(true);
                }, (error: any): void => {
                    console.log("Error in deleting Item from -" + listName, error);
                    reject(error);
                });
        });
    }
    public deleteMultipleFiles(fileUrls: string[]): Promise<boolean[]> {
        return new Promise<boolean[]>((resolve, reject) => {
            const [batchedSP, execute] = this._sp.batched();
            const results: boolean[] = [];

            fileUrls.forEach(url => {
                batchedSP.web.getFileByServerRelativePath(url).delete()
                    .then(() => results.push(true))
                    .catch((err) => {
                        console.error("Error deleting file:", url, err);
                        results.push(false);
                    });
            });

            execute()
                .then(() => resolve(results))
                .catch((error) => {
                    console.error("Batch deletion failed", error);
                    reject(error);
                });
        });
    }


    public async choiceOption(listName: string, fieldName: string): Promise<any> {
        const list = this._sp.web.lists.getByTitle(listName);
        const field = await list.fields.getByTitle(fieldName)();
        if (field && field.TypeAsString === 'Choice') {
            return field.Choices;
            // console.log('Choice column values:', choices);
        } else if (field && field.TypeAsString === 'MultiChoice') {
            return field.Choices;
        }
    }


    public async getVersionHistoryById(listName: string, itemId: number): Promise<any[]> {
        return new Promise<any>((resolve: (results: any[]) => void, reject: (error: any) => void): void => {
            this._sp.web.lists.getByTitle(listName).items.getById(itemId).versions()
                .then((itemVersionHistory: any[]) => {
                    const sortedItemVersionHistory = itemVersionHistory.sort((a: any, b: any) => b.VersionId - (a.VersionId));
                    resolve(sortedItemVersionHistory);
                }, (error: any): void => {
                    console.log("Error in get version history by -" + listName);
                    reject([]);
                });
        });
    }

    getPropertiesFor(usersArray: any): Promise<any> {
        throw new Error("Method not implemented.");
    }

    public async getItemsByCAMLQuery(listName: string, xmlQuery: string, overrideParameters: any = {}, siteUrl?: string): Promise<any> {
        try {
            let isPaged: boolean = true;
            let allData: any[] = [];
            let pageToken = "";
            do {
                const renderListDataParams: IRenderListDataParameters = {
                    ViewXml: xmlQuery,
                    Paging: pageToken,
                    RenderOptions: 2,
                };

                let r;
                if (!!siteUrl) {
                    const spWeb = spfi(siteUrl).using(SPFx(this._webPartContext));
                    r = await spWeb.web.lists.getByTitle(listName).renderListDataAsStream(renderListDataParams, overrideParameters);
                } else {
                    r = await this._sp.web.lists.getByTitle(listName).renderListDataAsStream(renderListDataParams, overrideParameters);
                }

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
            await this.getErrorObject(error);
        }
    }

    // public createItemWithAttchment(objItems: any, listName: string, file: any): Promise<any> {
    //     return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
    //         this._sp.web.lists.getByTitle(listName).items.add(objItems)
    //             .then(async (itemAddedResult: IItemAddResult): Promise<any> => {
    //                 if (!!file)
    //                     await itemAddedResult.item.attachmentFiles.add(file.name, file.content);
    //                 resolve(itemAddedResult);
    //             }
    //             ).catch((error: any): any => {
    //                 console.log("Error in Creating Item");
    //                 reject(error);
    //             });
    //     });
    // }
    public createItemWithAttchment(objItems: any, listName: string, files: any[]): Promise<any> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            this._sp.web.lists.getByTitle(listName).items.add(objItems)
                .then(async (itemAddedResult: IItemAddResult): Promise<any> => {
                    if (files && files.length > 0) {
                        for (const file of files) {
                            await itemAddedResult.item.attachmentFiles.add(file.name, file.content);
                        }


                    }
                    resolve(itemAddedResult);
                })
                .catch((error: any): any => {
                    console.log("Error in Creating Item");
                    reject(error);
                });
        });
    }

    public createItemWithBatchAttachments(objItems: any, listName: string, files: any[]): Promise<any> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            this._sp.web.lists.getByTitle(listName).items.add(objItems)
                .then(async (itemAddedResult: IItemAddResult): Promise<any> => {
                    try {
                        if (files && files.length > 0) {
                            const attachmentPromises = files.map(async file =>
                                await itemAddedResult.item.attachmentFiles.add(file.name, file.content)
                            )
                            await Promise.all(attachmentPromises).then(results => resolve(results))
                                .catch(error => reject(error));
                        }
                        // resolve(itemAddedResult);
                    } catch (error) {
                        console.log("Error in Adding Attachments");
                        reject(error);
                    }
                })
                .catch((error: any): any => {
                    console.log("Error in Creating Item");
                    reject(error);
                });
        });
    }
    public UpdateItemWithBatchAttachments(ID: number, objItems: any, listName: string, file: any, oldAttachmnetName?: any): Promise<any> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            if (objItems.Id)
                delete objItems.Id;
            const res: any[] = [];
            this._sp.web.lists.getByTitle(listName).items.getById(ID).update(objItems)
                .then(async (itemAddedResult: IItemAddResult) => {
                    if (file && file.length > 0) {
                        file.map(async (file: any) =>
                            await itemAddedResult.item.attachmentFiles.add(file.name, file.content).then((data) => {
                                res.push(data)
                            })
                        );
                        resolve(res);
                    }

                }, (error: any): any => {
                    console.log("Error in Updating  Item" + ID);
                    reject(error);
                }).catch((e: any) => {
                    console.log(e);
                });
        });
    }

    public async addMultipleAttachments(listName: string, itemId: any, Files: any): Promise<any> {

        const item = this._sp.web.lists.getByTitle(listName).items.getById(itemId);
        if (Files?.length > 0) {
            for (let i = 0; i < Files.length; i++) {
                await item.attachmentFiles.add(Files[i].name, Files[i].content);
            }

        }
    }
    // public addMultipleAttachments(listName: string, itemId: number, files: any[]): Promise<any> {
    //     return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
    //         const attachmentPromises = files.map(file =>
    //             this._sp.web.lists.getByTitle(listName).items.getById(itemId).attachmentFiles.add(file.name, file.content)
    //         );

    //         Promise.all(attachmentPromises)
    //             .then(results => resolve(results))
    //             .catch(error => reject(error));
    //     });
    // }

    public UpdateItemWithAttachment(ID: number, objItems: any, listName: string, file: any, oldAttachmnetName?: any): Promise<any> {
        return new Promise<any>((resolve: (results: any) => void, reject: (error: any) => void): void => {
            if (objItems.Id)
                delete objItems.Id;
            this._sp.web.lists.getByTitle(listName).items.getById(ID).update(objItems)
                .then(async (itemAddedResult: IItemAddResult) => {
                    if (!!file) {
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

    public loadBatchOfItems = async (skip: number): Promise<any> => {
        try {
            const response = await this._sp.web.lists.getByTitle("Employee").items
                .select("FirstName,Id") // Specify the fields you want to retrieve
                .top(20)
                .skip(skip)
                .orderBy("ID", true)
                .getPaged();

            if (!response) {
                return [];
            }

            return response.results;
        } catch (e) {
            console.error('An error occurred while loading batch of items:', e);
            await this.getErrorObject(e);
        }
    };

    public async getBatchItemsItemsByQuery(queryOptions: IPnPQueryOptions): Promise<any> {
        try {
            const { filter, select, expand, batchSize, skip, listName, orderBy, isSortOrderAsc } = queryOptions;
            const fetchTop = !!batchSize ? (batchSize >= 5000 ? 4999 : batchSize) : 4999;
            const _list = this._sp.web.lists.getByTitle(listName);
            let result = _list.items;
            if (select) result = result.select(...select);
            if (filter) result = result.filter(filter);
            if (expand) result = result.expand(...expand);
            if (fetchTop) result = result.top(fetchTop);
            if (orderBy) result = result.orderBy(orderBy, isSortOrderAsc);
            if (skip) result = result.skip(skip);
            const items = await result.getPaged();
            return items;
        } catch (e) {
            await this.getErrorObject(e);
        }
    }

    public async getItemsInBatchByCAMLQuery(pnpQueryOptions: IPnPCAMLQueryOptions): Promise<any> {
        try {
            let isPaged: boolean = true;
            let allData: any[] = [];
            let pageToken = pnpQueryOptions.pageToken;
            let response: any;
            const pageLength = pnpQueryOptions.pageLength || 0;
            do {
                const renderListDataParams: IRenderListDataParameters = {
                    ViewXml: pnpQueryOptions.queryXML,
                    Paging: pageToken,
                };

                if (pnpQueryOptions.FolderServerRelativeUrl) {
                    renderListDataParams.FolderServerRelativeUrl = pnpQueryOptions.FolderServerRelativeUrl
                }

                if (!!pnpQueryOptions.siteUrl) {
                    const spWeb = spfi(pnpQueryOptions.siteUrl).using(SPFx(this._webPartContext));
                    response = await spWeb.web.lists.getByTitle(pnpQueryOptions.listName).renderListDataAsStream(renderListDataParams, pnpQueryOptions.overrideParameters, undefined);
                } else {
                    response = await this._sp.web.lists.getByTitle(pnpQueryOptions.listName).renderListDataAsStream(renderListDataParams, pnpQueryOptions.overrideParameters, undefined);
                }
                if (response) {
                    allData = [...allData, ...response.Row];
                    if ((response?.Row.length === 0 || allData?.length < pageLength) && response?.NextHref) {
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

    private async getErrorObject(e: any) {
        const _error = { message: "", name: "" };
        if (e?.isHttpRequestError) {
            const json = await (<HttpRequestError>e).response.json();
            _error.message = typeof json["odata.error"] === "object" ? json["odata.error"].message.value : e.message;
            if ((<HttpRequestError>e).status === 404) {
                console.error((<HttpRequestError>e).statusText);
            }

        } else {
            console.log(e.message);
            _error.message = e.message;
        }
        throw new Error(JSON.stringify(_error));
    }
    public async DeleteItemsWithBatch(listName: string, objItems: any[]): Promise<any> {
        const [batchedSP, execute] = this._sp.batched();
        const list = batchedSP.web.lists.getByTitle(listName);
        const promises = objItems.map(element => list.items.getById(element.Id).delete());
        try {
            const results = await Promise.all(promises);
            await execute();
            return results;
        } catch (error) {
            console.log("Error in Deleting Items", error);
            throw error;
        }
    }
    public async getFileContent(listName: string, itemId: number, fileName: string): Promise<any> {
        let item = this._sp.web.lists.getByTitle(listName).items.getById(itemId);
        const blob = await item.attachmentFiles.getByName(fileName).getBuffer();
        return blob;
    }
    public async deleteAttachmentsPnP(listName: string, itemId: number, fileName: string): Promise<any> {
        try {
            const item = this._sp.web.lists.getByTitle(listName).items.getById(itemId);
            await item.attachmentFiles.getByName(fileName).delete();
            return true;
        } catch (error) {
            console.log("Error in Deleting Attachment", error);
            throw error;
        }
    }
    public async getFileContents(fileUrl: string): Promise<any> {
        let item = await this._sp.web.getFileByServerRelativePath(fileUrl).getBuffer();
        return item
    }

    public async checkInFile(serverRelativePath: string): Promise<void> {
        try {
            const file = this._sp.web.getFileByServerRelativePath(serverRelativePath);
            const fileInfo: any = await file.select('CheckOutType', 'LockedByUser/Title').expand('LockedByUser')();
            if (fileInfo.CheckOutType === 0) {
                return;
            }
            await file.checkin('', 1);
        } catch (error: any) {
            const errorCode: number = error?.data?.responseBody?.['odata.error']?.code
                ? parseInt(error.data.responseBody['odata.error'].code.split(',')[0], 10)
                : (error?.status ?? 0);
            if (errorCode === -2147018894 || (error?.message ?? '').includes('-2147018894')) {
                let lockedBy: string | undefined;
                try {
                    const fileInfo: any = await this._sp.web
                        .getFileByServerRelativePath(serverRelativePath)
                        .select('LockedByUser/Title')
                        .expand('LockedByUser')();
                    lockedBy = fileInfo?.LockedByUser?.Title;
                } catch (_) {
                }
                const lockError: any = new Error(
                    lockedBy
                        ? `FILE_LOCKED_BY:${lockedBy}`
                        : 'FILE_LOCKED'
                );
                lockError.isFileLockError = true;
                lockError.lockedBy = lockedBy;
                throw lockError;
            }
            throw error;
        }
    }

    public async uploadFileInLibrary(folderPath: string, updatedExcel: string, fileContent?: ArrayBuffer): Promise<any> {
        let item = await this._sp.web.getFolderByServerRelativePath(folderPath).files.addUsingPath(folderPath, updatedExcel, { Overwrite: true });
        return item
    }

    public async _Document(UploadFolderName: string, libraryName: string): Promise<any> {
        const listFolders = await this._sp.web.lists.getByTitle(`${libraryName}/${UploadFolderName}`).rootFolder.folders().then((res) => {
            return res;
        }).catch((e) => { return ""; });

        if (listFolders.length > 0) {
            let folderName: string = "Test";
            return this._sp.web.lists.getByTitle(`${libraryName}/${UploadFolderName}`).items.add({
                FileSystemObjectType: 1, // Indicates that this is a folder
                FileLeafRef: folderName, // The name of the folder
            }).then((result) => {
                console.log(`Folder "${folderName}" created successfully`);
            }).catch((error) => {
                console.error(`Error creating folder: ${error.message}`);
            });
        } else {
            const folderAddResult = await this._sp.web.folders.addUsingPath(`${libraryName}/${UploadFolderName}`).then((res) => {
                return res;
            }).catch((e) => { return ""; });

            // const folder = await this._sp.web.folders.getByUrl("Documents")();
            return folderAddResult;
        }
    }
    public async updateFolderName(FolderName: string, UpdateFolderName: string, libraryName: string): Promise<any> {
        const folder = this._sp.web.getFolderByServerRelativePath(`${libraryName}/${FolderName}`);
        const item = await folder.getItem();
        const result = await item.update({ FileLeafRef: UpdateFolderName });
        return result;
    }


    public getDocumentLibraryrootFolderItems = async (libraryName: string) => {
        try {
            const rootFolder = await this._sp.web.lists.getByTitle(libraryName).rootFolder;

            const folders = await rootFolder.folders();
            const files = await rootFolder.files();

            return [...folders, ...files];

        } catch (error) {
            console.error("Error fetching root folders and files: ", error);
        }

    }
    public getChildFolders = async (folderServerRelativeUrl: string) => {
        try {
            const folder = await this._sp.web.getFolderByServerRelativePath(folderServerRelativeUrl);
            const folders = await folder.folders();
            const files = await folder.files();
            return [...folders, ...files];

        } catch (error) {
            console.error("Error fetching child folders: ", error);
        }
    }

    public gettopNavigationBarTitle = async () => {
        try {
            const response = await this._sp.navigation.getMenuNodeKey("/sites/ModernDesigns/_api/web/navigation/TopNavigationbar");


            // const titles = response.map((item: any) => item.title);
            return response;

        } catch (error) {
            console.error("Error fetching child folders: ", error);
        }
    }

    // public getAllSharePointSites = async () => {
    //     try {
    //         const result = await this._sp.search({
    //             Querytext: "contentclass:STS_Site",
    //             RowLimit: 500,
    //         });
    //         const sites: any = result.PrimarySearchResults.map((site: any) => ({
    //             Title: site.Title,
    //             url: site.Path,
    //             description: site.Description,
    //             exists: false,  
    //             accessDenied: false 
    //         }));

    //         console.log(sites);

    //         return sites;
    //     } catch (error) {
    //         console.error("Error fetching sites:", error);
    //     }
    // }

    public getAllSiteCollection = async (siteUrl: string) => {
        try {
            const response = await fetch(`${siteUrl}/_api/web`, {
                method: "GET",
                headers: {
                    Accept: "application/json;odata=verbose",
                },
            });

            if (response.ok) {
                const siteDetails = await response.json();
                return { exists: true, accessDenied: false, details: siteDetails };
            } else if (response.status === 403) {
                return { exists: true, accessDenied: true, url: siteUrl };
            } else if (response.status === 404) {
                return { exists: false, notFound: true, url: siteUrl };
            } else {
                return { exists: false, unknownError: true, url: siteUrl };
            }
        } catch (error) {
            console.error("Error checking site existence:", error);
        }
    };
    public async shareObject(item: IShareDocument): Promise<any> {
        try {
            let email: any[] = item.userEmail.length > 0 ? item.userEmail.map((i: any) => ({ Key: `i:0#.f|membership|${i}` })) : []
            return await this._sp.web.shareObjectRaw({
                url: item.fileUrl,
                // peoplePickerInput: JSON.stringify([{ Key: `i:0#.f|membership|${item.userEmail}` }]),
                peoplePickerInput: JSON.stringify(email),
                roleValue: `role: ${item.role}`,
                groupId: 0,
                propagateAcl: true,
                sendEmail: true,
                includeAnonymousLinkInEmail: false,
                emailSubject: "Sharing File",
                // emailBody: !!item.emailBody ? item.emailBody : "Here's the document that shared with you.",
                emailBody: !!item.emailBody ? item.emailBody : `Here's the document that ${item.currentUserName} shared with you.`,
                // Here's the document that Krunal Patel shared with you.
                useSimplifiedRoles: true,
            });
        } catch (error) {
            throw new Error(error.message || "An error occurred while sharing the object.");
        }
    }
    public copyFile = async (sourceUrl: string, targetUrl: string) => {
        try {
            // Copy the file to the target location
            await this._sp.web.getFileByServerRelativePath(sourceUrl).copyTo(targetUrl, true); // Set `true` for overwrite
            console.log("File copied successfully!");
        } catch (error) {
            console.error("Error copying file:", error);
        }
    };
    public async getAccessibleSites(): Promise<any[]> {
        try {
            const sites = await this._sp.search({
                Querytext: '*',
                QueryTemplate: 'contentclass:STS_Site OR contentclass:STS_Web',
                RowLimit: 500
            });
            return sites.PrimarySearchResults.map((site) => ({
                Title: site.Title,
                url: site.Path,
                description: site.Description,
                exists: false,
                accessDenied: false
            }));
        } catch (error) {
            console.error("Error fetching accessible sites:", error);
            return [];
        }
    }
    public async getDocumentLibraries(siteUrl: string): Promise<any[]> {
        try {
            const libraries = await this._sp.web.lists
                .filter("BaseTemplate eq 101 and Hidden eq false")
                .select("Title,RootFolder/ServerRelativeUrl")
                .expand("RootFolder")();
            return libraries.map((lib) => ({
                title: lib.Title,
                url: lib.RootFolder.ServerRelativeUrl
            }));
        } catch (error) {
            console.error("Error fetching document libraries:", error);
            return [];
        }
    }

    public copyFolder = async (sourceUrl: string, targetUrl: string) => {
        try {
            await this.ensureFolderExists(targetUrl);

            const files = await this._sp.web.getFolderByServerRelativePath(sourceUrl).files();
            const folders = await this._sp.web.getFolderByServerRelativePath(sourceUrl).folders();

            for (const file of files) {
                const sourceFileUrl = file.ServerRelativeUrl;
                const targetFileUrl = `${targetUrl}/${file.Name}`;
                await this._sp.web.getFileByServerRelativePath(sourceFileUrl).copyTo(targetFileUrl, true);
            }
            for (const subfolder of folders) {
                const subfolderSourceUrl = subfolder.ServerRelativeUrl;
                const subfolderTargetUrl = `${targetUrl}/${subfolder.Name}`;
                await this.copyFolder(subfolderSourceUrl, subfolderTargetUrl);
            }

            console.log("Folder copied successfully!");
        } catch (error) {
            console.error("Error copying folder:", error);
        }
    };

    private ensureFolderExists = async (folderUrl: string): Promise<void> => {
        try {
            const folder = await this._sp.web.getFolderByServerRelativePath(folderUrl).select("Exists")();
            if (folder?.Exists) {
                console.log(`Folder already exists: ${folderUrl}`);
            } else {
                throw new Error("Folder does not exist");
            }
        } catch (error) {
            try {
                await this._sp.web.folders.addUsingPath(folderUrl).then(async (response) => {
                    console.log(`Folder created: ${folderUrl}`);
                });

            } catch (creationError) {
                console.error(`Error creating folder at ${folderUrl}:`, creationError);
            }
        }
    };

    public async createOfficeDocument(fileType: string, sourcePath: string): Promise<void> {
        const sourcePathurl = sourcePath || `${this._webPartContext.pageContext.web.serverRelativeUrl}/${ListNames.SharedDocumentsPath}`;
        const baseFileName = fileType.toLowerCase() === "docx" ? "Document" : fileType.toLowerCase() === "xlsx" ? "Book" : "Presentation";
        let fileName = `${baseFileName}.${fileType.toLowerCase()}`;
        try {
            const folder = await this._sp.web.getFolderByServerRelativePath(sourcePathurl).files();
            const existingFiles = folder.map((file: any) => file.Name);

            let counter = 1;
            let fileExists = true;
            while (fileExists) {
                fileExists = false;
                existingFiles.forEach((existingFile) => {
                    if (existingFile === fileName) {
                        fileName = `${baseFileName}${counter}.${fileType.toLowerCase()}`;
                        counter++;
                        fileExists = true;
                    }
                });
            }
            await this._sp.web.getFolderByServerRelativePath(sourcePathurl).files.addTemplateFile(`${sourcePathurl}/${fileName}`, this.getTemplateType(fileType));
            const fileUrl = `${this._webPartContext.pageContext.web.absoluteUrl}/${ListNames.SharedDocumentsPath}/${fileName}`;
            window.open(fileUrl, "_blank");
        } catch (error) {
            console.error("Error creating document:", error);
        }
    }

    public getTemplateType(fileType: string): number {
        switch (fileType) {
            case "docx":
                return 1;
            case "xlsx":
                return 2;
            case "pptx":
                return 3;
            default:
                return 0;
        }
    }

    public async createBlankOfficeFile(
        fileType: string,
        folderServerRelativeUrl: string,
        baseName: string
    ): Promise<{ serverRelativeUrl: string; fileName: string; itemId: number }> {
        const type = (fileType || "docx").toLowerCase();
        const ext = type.startsWith(".") ? type : `.${type}`;

        const sanitize = (value: string) =>
            String(value || "Document")
                .trim()
                // SharePoint blocks these characters in file names
                .replace(/[\\/:*?"<>|#%&{}~]+/g, "_")
                .replace(/\s+/g, "_")
                .replace(/_+/g, "_")
                .replace(/^_+|_+$/g, "")
                .slice(0, 80) || "Document";

        const base = sanitize(baseName);
        const folderUrl = folderServerRelativeUrl;

        const existing = await this._sp.web
            .getFolderByServerRelativePath(folderUrl)
            .files.select("Name")();

        const existingNames = new Set((existing || []).map((f: any) => String(f.Name || "").toLowerCase()));

        let fileName = base.endsWith(ext) ? base : `${base}${ext}`;
        let counter = 1;
        while (existingNames.has(fileName.toLowerCase())) {
            const stem = base.endsWith(ext) ? base.slice(0, -ext.length) : base;
            fileName = `${stem}_${counter}${ext}`;
            counter += 1;
        }

        const addResult = await this._sp.web
            .getFolderByServerRelativePath(folderUrl)
            .files.addTemplateFile(`${folderUrl}/${fileName}`, this.getTemplateType(type.replace(".", "")));

        const item = await addResult.file.getItem();
        const itemData: any = await (item as any).select("Id", "FileRef")();

        return {
            serverRelativeUrl: itemData?.FileRef || `${folderUrl}/${fileName}`,
            fileName,
            itemId: itemData?.Id || 0
        };
    }
    public getUsersFromGroup = async (groupName: string): Promise<{ value: number; label: string; email: string; loginName: string }[]> => {
        const mapUsers = (users: any[]) => users.map(user => ({
            value: user.Id,
            label: user.Title,
            email: user.Email,
            loginName: user.LoginName
        }));
        try {
            // 1. Try exact name match first
            try {
                const users = await this._sp.web.siteGroups.getByName(groupName).users();
                return mapUsers(users);
            } catch {
                // Exact match failed — fall back to case-insensitive partial search
            }
            // 2. Get all site groups and find best match (case-insensitive contains)
            const allGroups = await this._sp.web.siteGroups();
            const lc = groupName.toLowerCase();
            const matchingGroup = allGroups.find((g: any) =>
                g.Title.toLowerCase() === lc ||
                g.Title.toLowerCase().includes(lc) ||
                lc.includes(g.Title.toLowerCase())
            );
            if (!matchingGroup) {
                console.warn(`DMS: No site group found matching "${groupName}"`);
                return [];
            }
            const users = await this._sp.web.siteGroups.getById(matchingGroup.Id).users();
            return mapUsers(users);
        } catch (error) {
            console.error(`Error fetching users from group ${groupName}:`, error);
            return [];
        }
    };

    public addUserToGroup = async (userLoginName: string, groupName: string): Promise<void> => {
        try {
            await this._sp.web.siteGroups.getByName(groupName).users.add(userLoginName);
        } catch (error) {
            console.error(`Error adding user ${userLoginName} to group ${groupName}:`, error);
            throw error;
        }
    };

    public removeUserFromGroup = async (userId: number, groupName: string): Promise<void> => {
        try {
            await this._sp.web.siteGroups.getByName(groupName).users.removeById(userId);
        } catch (error) {
            console.error(`Error removing user ${userId} from group ${groupName}:`, error);
            throw error;
        }
    };


    public getFilesFromFolder = async (employeeName: string, year: string): Promise<any[]> => {
        try {
            const folderPath = `ProjectsPA/${employeeName}/${year}`; // Adjust path if different
            const files = await this._sp.web.getFolderByServerRelativePath(folderPath).files.select("*", "ListItemAllFields")();

            return files.map((file: any) => ({
                Name: file.Name,
                Url: file?.ServerRelativeUrl,
                // IsProjectAdded: file?.ListItemAllFields?.IsProjectAdded || "false"
            }));
        } catch (error) {
            console.error("Error fetching files:", error);
            return [];
        }
    };

    public uploadDocumentToLibrary = async (file: File, employeeName: string, year: string): Promise<void> => {
        const folderUrl = `ProjectsPA/${employeeName}/${year}`;
        try {
            // Step 1: Check existing files
            const files = await this.getFilesFromFolder(employeeName, year);
            // const isProjectAdded = files.some(f => f.IsProjectAdded === "true");
            // if (!isProjectAdded) {
            //     console.log("IsProjectAdded is false, retrying...");
            //     setTimeout(async () => {
            //         await this.uploadDocumentToLibrary(file, employeeName, year);
            //     }, 3000);
            //     return;
            // }

            const arrayBuffer = await file.arrayBuffer();

            const uploadedFile = await this._sp.web
                .getFolderByServerRelativePath(folderUrl)
                .files.addUsingPath(file.name, arrayBuffer, { Overwrite: true });


            const item = await uploadedFile.file.getItem();
            await item.update({
                Title: file.name,

            });

            console.log("Document uploaded successfully.");
        } catch (error) {
            console.error("Upload failed:", error);
        }
    };



    public uploadFiles = async (filePath: string, fileBuffer: ArrayBuffer, contentType: string) => {
        // Extract folder path and file name from filePath
        const lastSlashIndex = filePath.lastIndexOf("/");
        const folderPath = filePath.substring(0, lastSlashIndex);
        const fileName = filePath.substring(lastSlashIndex + 1);

        try {
            const fileAddResult = await this._sp.web
                .getFolderByServerRelativePath(folderPath)
                .files.addUsingPath(fileName, fileBuffer, { Overwrite: true });

            console.log(`File uploaded successfully: ${fileName}`);
            return fileAddResult;
        } catch (error) {
            console.error("Error uploading file", error);
            throw error;
        }
    };



    // public getAllSharePointSites = async (): Promise<any[]> => {
    //     const _graphClient = await this._webPartContext.msGraphClientFactory.getClient("3");
    //     let allSites: any[] = [];
    //     try {
    //         const sitesResponse = await _graphClient.api('/sites?search=*').version('v1.0').get();
    //         allSites = sitesResponse.value;
    //     } catch (error) {
    //         console.log("Unable to get site collections", error);
    //     }
    //     return allSites;
    // };

    // ==================== DMS CATEGORY OPERATIONS ====================

    public async getCategories(): Promise<ICategory[]> {
        const query = `
        <View>
            <ViewFields>
                <FieldRef Name="ID" />
                <FieldRef Name="Title" />
                <FieldRef Name="Description" />
                <FieldRef Name="DocumentCategory" />
                <FieldRef Name="Group" />
                <FieldRef Name="SubGroup" />
                <FieldRef Name="Status" />
                <FieldRef Name="Documents" />
            </ViewFields>
            <Query>
                <OrderBy>
                    <FieldRef Name="Title" Ascending="TRUE" />
                </OrderBy>
            </Query>
            <RowLimit>5000</RowLimit>
        </View>`;

        const items = await this.getItemsByCAMLQuery(ListNames.Categories, query);
        return (items || []).map((item: any) => ({
            id: item.ID,
            name: item.Title,
            description: item.Description,
            documentCategory: item.DocumentCategory,
            group: item.Group,
            subGroup: item.SubGroup,
            status: item.Status || 'Active',
            documents: item.Documents ? parseInt(item.Documents) : 0,
            level: 4 // Default to leaf level for now, hierarchy handled by properties
        }));
    }

    public async createCategory(data: any): Promise<ICategory> {
        const result = await this.createItem({
            Title: data.name,
            Description: data.description,
            DocumentCategory: data.documentCategory,
            Group: data.group,
            SubGroup: data.subGroup,
            ArtifactName: data.artifactName,
            TemplateName: data.templateName,
            Status: data.status,
            CTDModule: data.ctdModule,
            eCTDSection: data.ectdSection,
            eCTDSubsection: data.ectdSubsection,
            eCTDCode: data.ectdCode
        }, ListNames.Categories);
        return {
            id: result.data.ID,
            ...data
        };
    }

    public async updateCategory(id: number, data: any): Promise<void> {
        const updateData: any = {};
        if (data.name) updateData.Title = data.name;
        if (data.description !== undefined) updateData.Description = data.description;
        if (data.documentCategory !== undefined) updateData.DocumentCategory = data.documentCategory;
        if (data.group !== undefined) updateData.Group = data.group;
        if (data.subGroup !== undefined) updateData.SubGroup = data.subGroup;
        if (data.artifactName !== undefined) updateData.ArtifactName = data.artifactName;
        if (data.templateName !== undefined) updateData.TemplateName = data.templateName;
        if (data.status) updateData.Status = data.status;
        if (data.ctdModule !== undefined) updateData.CTDModule = data.ctdModule;
        if (data.ectdSection !== undefined) updateData.eCTDSection = data.ectdSection;
        if (data.ectdSubsection !== undefined) updateData.eCTDSubsection = data.ectdSubsection;
        if (data.ectdCode !== undefined) updateData.eCTDCode = data.ectdCode;

        await this.updateItem(updateData, ListNames.Categories, id);
    }

    public async deleteCategory(id: number): Promise<void> {
        await this.deleteItem(ListNames.Categories, id);
    }

    // ==================== DMS DRUG OPERATIONS ====================

    public async getDrugs(): Promise<IDrug[]> {
        const query = `
        <View>
            <ViewFields>
                <FieldRef Name="ID" />
                <FieldRef Name="Title" />
                <FieldRef Name="Category" />
                <FieldRef Name="Status" />
                <FieldRef Name="Description" />
            </ViewFields>
            <Query>
                <OrderBy>
                    <FieldRef Name="Title" Ascending="TRUE" />
                </OrderBy>
            </Query>
            <RowLimit>5000</RowLimit>
        </View>`;

        const items = await this.getItemsByCAMLQuery(ListNames.DrugsDatabase, query);
        return (items || []).map((item: any) => ({
            id: item.ID,
            name: item.Title,
            category: item.Category,
            status: item.Status || 'Active',
            description: item.Description
        }));
    }

    public async createDrug(data: Omit<IDrug, 'id'>): Promise<IDrug> {
        const result = await this.createItem({
            Title: data.name,
            Category: data.category,
            Status: data.status,
            Description: data.description
        }, ListNames.DrugsDatabase);
        return {
            id: result.data.ID,
            ...data
        };
    }

    public async updateDrug(id: number, data: Partial<IDrug>): Promise<void> {
        const updateData: any = {};
        if (data.name) updateData.Title = data.name;
        if (data.category !== undefined) updateData.Category = data.category;
        if (data.status) updateData.Status = data.status;
        if (data.description !== undefined) updateData.Description = data.description;
        await this.updateItem(updateData, ListNames.DrugsDatabase, id);
    }

    public async deleteDrug(id: number): Promise<void> {
        await this.deleteItem(ListNames.DrugsDatabase, id);
    }

    // ==================== DMS CTD FOLDER OPERATIONS ====================

    public async getCTDFolders(): Promise<ICTDFolder[]> {
        try {
            const items = await this.getAllItems({
                listName: ListNames.CTDFolders,
                select: ['ID', 'Title', 'FolderId', 'ParentFolderId', 'SortOrder', 'IsFolder'],
                orderBy: 'SortOrder',
                isSortOrderAsc: true
            });
            return (items || []).map((item: any) => ({
                id: item.ID,
                folderId: item.FolderId || String(item.ID),
                name: item.Title,
                parentFolderId: item.ParentFolderId,
                sortOrder: item.SortOrder || 0,
                isFolder: item.IsFolder !== false
            }));
        } catch (error) {
            console.error('Error fetching CTD folders:', error);
            return [];
        }
    }

    public async createCTDFolder(data: Omit<ICTDFolder, 'id'>): Promise<ICTDFolder> {
        const result = await this.createItem({
            Title: data.name,
            FolderId: data.folderId,
            ParentFolderId: data.parentFolderId,
            SortOrder: data.sortOrder,
            IsFolder: data.isFolder
        }, ListNames.CTDFolders);
        return {
            id: result.data.ID,
            ...data
        };
    }

    public async updateCTDFolder(id: number, data: Partial<ICTDFolder>): Promise<void> {
        const updateData: any = {};
        if (data.name) updateData.Title = data.name;
        if (data.folderId !== undefined) updateData.FolderId = data.folderId;
        if (data.parentFolderId !== undefined) updateData.ParentFolderId = data.parentFolderId;
        if (data.sortOrder !== undefined) updateData.SortOrder = data.sortOrder;
        if (data.isFolder !== undefined) updateData.IsFolder = data.isFolder;
        await this.updateItem(updateData, ListNames.CTDFolders, id);
    }

    public async deleteCTDFolder(id: number): Promise<void> {
        await this.deleteItem(ListNames.CTDFolders, id);
    }

    // ==================== DMS TEMPLATE OPERATIONS ====================

    public async getTemplates(): Promise<ITemplate[]> {
        const query = `
        <View>
            <ViewFields>
                <FieldRef Name="ID" />
                <FieldRef Name="Title" />
                <FieldRef Name="FileLeafRef" />
                <FieldRef Name="FileRef" />
                <FieldRef Name="Category" />
                <FieldRef Name="Country" />
                <FieldRef Name="MappedCTDFolder" />
                <FieldRef Name="eCTDSection" />
                <FieldRef Name="eCTDSubsection" />
                <FieldRef Name="Status" />
                <FieldRef Name="MappingType" />
                <FieldRef Name="Modified" />
            </ViewFields>
            <Query>
                <OrderBy>
                    <FieldRef Name="Modified" Ascending="FALSE" />
                </OrderBy>
            </Query>
            <RowLimit>5000</RowLimit>
        </View>`;

        const items = await this.getItemsByCAMLQuery(ListNames.Templates, query);
        return (items || []).map((item: any) => ({
            id: item.ID,
            name: item.FileLeafRef || item.Title,
            fileRef: item.FileRef,
            category: item.Category_x003a_Title?.Value || item.Category?.[0]?.lookupValue, // Handle lookup expansion manually if needed or check raw response
            categoryId: item.Category?.[0]?.lookupId,
            country: item.Country_x003a_Title?.Value || item.Country?.[0]?.lookupValue,
            countryId: item.Country?.[0]?.lookupId,
            mappedCTDFolder: item.MappedCTDFolder_x003a_Title?.Value || item.MappedCTDFolder?.[0]?.lookupValue,
            mappedCTDFolderId: item.MappedCTDFolder?.[0]?.lookupId,
            eCTDSection: item.eCTDSection_x003a_Title?.Value || item.eCTDSection?.[0]?.lookupValue,
            eCTDSectionId: item.eCTDSection?.[0]?.lookupId,
            eCTDSubsection: item.eCTDSubsection,
            status: item.Status || 'Active',
            mappingType: item.MappingType || 'None',
            uploadDate: item.Modified ? new Date(item.Modified).toISOString().split('T')[0] : ''
        }));
    }



    public async uploadTemplate(file: File, metadata: Partial<ITemplate>): Promise<ITemplate> {
        const folderPath = `${this._webPartContext.pageContext.web.serverRelativeUrl}/${ListNames.Templates}`;
        const arrayBuffer = await file.arrayBuffer();

        const uploadResult = await this._sp.web
            .getFolderByServerRelativePath(folderPath)
            .files.addUsingPath(file.name, arrayBuffer, { Overwrite: true });

        const item = await uploadResult.file.getItem();
        const updateData: any = {};
        if (metadata.categoryId) updateData.CategoryId = metadata.categoryId;
        if (metadata.countryId) updateData.CountryId = metadata.countryId;
        if (metadata.mappedCTDFolderId) updateData.MappedCTDFolderId = metadata.mappedCTDFolderId;
        if (metadata.eCTDSectionId) updateData.ECTDSectionId = metadata.eCTDSectionId;
        if (metadata.eCTDSubsection) updateData.ECTDSubsection = metadata.eCTDSubsection;
        if (metadata.status) updateData.Status = metadata.status;
        if (metadata.mappingType) updateData.MappingType = metadata.mappingType;

        if (Object.keys(updateData).length > 0) {
            await item.update(updateData);
        }

        const itemData: any = await item.select('ID', 'FileLeafRef', 'FileRef', 'Modified')();
        return {
            id: itemData.ID,
            name: itemData.FileLeafRef,
            fileRef: itemData.FileRef,
            status: metadata.status || 'Active',
            mappingType: metadata.mappingType || 'None',
            uploadDate: itemData.Modified ? new Date(itemData.Modified).toISOString().split('T')[0] : ''
        };
    }

    public async updateTemplate(id: number, data: Partial<ITemplate>): Promise<void> {
        const updateData: any = {};
        if (data.categoryId !== undefined) updateData.CategoryId = data.categoryId || null;
        if (data.countryId !== undefined) updateData.CountryId = data.countryId || null;
        if (data.mappedCTDFolderId !== undefined) updateData.MappedCTDFolderId = data.mappedCTDFolderId || null;
        if (data.eCTDSectionId !== undefined) updateData.ECTDSectionId = data.eCTDSectionId || null;
        if (data.eCTDSubsection !== undefined) updateData.ECTDSubsection = data.eCTDSubsection;
        if (data.status) updateData.Status = data.status;
        if (data.mappingType) updateData.MappingType = data.mappingType;
        await this.updateItem(updateData, ListNames.Templates, id);
    }

    public async deleteTemplate(id: number): Promise<void> {
        await this.deleteItem(ListNames.Templates, id);
    }

    // ==================== DMS DOCUMENT OPERATIONS ====================

    public async getDocuments(): Promise<IDocument[]> {
        const query = `
        <View>
            <ViewFields>
                <FieldRef Name="ID" />
                <FieldRef Name="Title" />
                <FieldRef Name="FileLeafRef" />
                <FieldRef Name="FileRef" />
                <FieldRef Name="Modified" />
                <FieldRef Name="Created" />
                <FieldRef Name="Status" />
                <FieldRef Name="Version" />
                <FieldRef Name="Comments" />
                <FieldRef Name="CTDFolder" />
                <FieldRef Name="CTDModule" />
                <FieldRef Name="Submodule" />
                <FieldRef Name="Content" />
                <FieldRef Name="SharePointURL" />
                <FieldRef Name="Author" />
                <FieldRef Name="Reviewer" />
                <FieldRef Name="Approver" />
                <FieldRef Name="SentBy" />
                <FieldRef Name="Category" />
                <FieldRef Name="Drug" />
                <FieldRef Name="Template" />
            </ViewFields>
            <Query>
                <OrderBy>
                    <FieldRef Name="Modified" Ascending="FALSE" />
                </OrderBy>
            </Query>
            <RowLimit>5000</RowLimit>
        </View>`;

        const items = await this.getItemsByCAMLQuery(ListNames.DMSDocuments, query);
        return (items || []).map((item: any) => ({
            id: item.ID,
            name: item.FileLeafRef || item.Title,
            fileName: item.FileLeafRef,
            fileRef: item.FileRef,
            category: item.Category?.[0]?.lookupValue || item.Category,
            categoryId: item.Category?.[0]?.lookupId,
            drugName: item.Drug?.[0]?.lookupValue || item.Drug,
            drugId: item.Drug?.[0]?.lookupId,
            status: item.Status || 'Draft',
            lastModified: item.Modified ? new Date(item.Modified).toISOString().split('T')[0] : '',
            author: item.Author?.[0]?.lookupValue || item.Author,
            authorId: item.Author?.[0]?.lookupId,
            reviewer: item.Reviewer?.[0]?.lookupValue || item.Reviewer,
            reviewerId: item.Reviewer?.[0]?.lookupId,
            approver: item.Approver?.[0]?.lookupValue || item.Approver,
            approverId: item.Approver?.[0]?.lookupId,
            comments: item.Comments ? JSON.parse(item.Comments) : [],
            ctdFolder: item.CTDFolder,
            ctdModule: item.CTDModule,
            submodule: item.Submodule,
            template: item.Template?.[0]?.lookupValue || item.Template,
            templateId: item.Template?.[0]?.lookupId,
            content: item.Content,
            version: item.Version || 1,
            createdDate: item.Created ? new Date(item.Created).toISOString().split('T')[0] : '',
            sentBy: item.SentBy?.[0]?.lookupValue || item.SentBy,
            sharePointUrl: item.SharePointURL?.Url || item.FileRef
        }));
    }



    // ==================== DMS DOCUMENT OPERATIONS ====================

    public async createDocument(document: Omit<IDocument, 'id'>): Promise<IDocument> {
        try {
            const sp = getSP();
            const list = sp.web.lists.getByTitle(ListNames.DMSDocuments);
            const result = await list.items.add({
                Title: document.name,
                Status: document.status,
                Category: document.category,
                Content: document.content,
                Version: document.version
            });
            return {
                ...document,
                id: result.data.Id
            };
        } catch (error) {
            console.error('Error creating document:', error);
            throw error;
        }
    }

    public async updateDocument(id: number, document: Partial<IDocument>): Promise<void> {
        try {
            const sp = getSP();
            const list = sp.web.lists.getByTitle(ListNames.DMSDocuments);
            const updateData: Record<string, unknown> = {};
            if (document.name) updateData.Title = document.name;
            if (document.status) updateData.Status = document.status;
            if (document.category) updateData.Category = document.category;
            if (document.content) updateData.Content = document.content;
            if (document.version) updateData.Version = document.version;
            await list.items.getById(id).update(updateData);
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    }

    public async deleteDocument(id: number): Promise<void> {
        try {
            const sp = getSP();
            const list = sp.web.lists.getByTitle(ListNames.DMSDocuments);
            await list.items.getById(id).delete();
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }


    // ==================== DMS WORKFLOW OPERATIONS ====================

    public async getWorkflowApprovals(): Promise<IWorkflowApproval[]> {
        try {
            const sp = getSP();
            const list = sp.web.lists.getByTitle(ListNames.WorkflowsApprovals);
            const items = await list.items.select('Id', 'DocumentId', 'RequestedById', 'ApproverId', 'Decision', 'DecisionComment', 'Created', 'Modified', 'Cycle')();
            return items.map((item: any) => ({
                id: item.Id,
                documentId: item.DocumentId,
                requestedById: item.RequestedById,
                approverId: item.ApproverId,
                decision: item.Decision,
                decisionComment: item.DecisionComment,
                requestedOn: item.Created,
                decidedOn: item.Modified,
                cycle: item.Cycle || 1
            }));
        } catch (error) {
            console.error('Error fetching workflow approvals:', error);
            return [];
        }
    }

    public async createWorkflowApproval(approval: Omit<IWorkflowApproval, 'id'>): Promise<IWorkflowApproval> {
        try {
            const sp = getSP();
            const list = sp.web.lists.getByTitle(ListNames.WorkflowsApprovals);
            const result = await list.items.add({
                DocumentId: approval.documentId,
                RequestedById: approval.requestedById,
                ApproverId: approval.approverId,
                Decision: approval.decision,
                DecisionComment: approval.decisionComment,
                Cycle: approval.cycle
            });
            return {
                ...approval,
                id: result.data.Id
            };
        } catch (error) {
            console.error('Error creating workflow approval:', error);
            throw error;
        }
    }

    public async updateWorkflowApproval(id: number, approval: Partial<IWorkflowApproval>): Promise<void> {
        try {
            const sp = getSP();
            const list = sp.web.lists.getByTitle(ListNames.WorkflowsApprovals);
            const updateData: Record<string, unknown> = {};
            if (approval.decision) updateData.Decision = approval.decision;
            if (approval.decisionComment) updateData.DecisionComment = approval.decisionComment;
            if (approval.cycle) updateData.Cycle = approval.cycle;
            await list.items.getById(id).update(updateData);
        } catch (error) {
            console.error('Error updating workflow approval:', error);
            throw error;
        }
    }

    // ==================== DMS USER ROLE OPERATIONS ====================

    public async getUserRoles(): Promise<IUserRole[]> {
        try {
            const sp = getSP();
            const list = sp.web.lists.getByTitle(ListNames.UserRolesPermissions);
            const items = await list.items.select('Id', 'UserId', 'UserName', 'Role', 'Permissions')();
            return items.map((item: any) => ({
                id: item.Id,
                userId: item.UserId,
                userName: item.UserName,
                role: item.Role,
                permissions: item.Permissions ? item.Permissions.split(',') : []
            }));
        } catch (error) {
            console.error('Error fetching user roles:', error);
            return [];
        }
    }

    // ==================== DMS REPORT OPERATIONS ====================

    public async getReportStats(): Promise<IReportStats> {
        try {
            const documents = await this.getDocuments();
            const totalDocuments = documents.length;
            const draftCount = documents.filter(d => d.status === 'Draft').length;
            const pendingCount = documents.filter(d => d.status === 'Pending Approval').length;
            const approvedCount = documents.filter(d => d.status === 'Approved' || d.status === 'Final' || d.status === 'Signed').length;
            const rejectedCount = documents.filter(d => d.status === 'Rejected').length;
            const decidedCount = approvedCount + rejectedCount;
            const approvalRate = decidedCount > 0 ? Math.round((approvedCount / decidedCount) * 100) : 0;

            return {
                totalDocuments,
                draftCount,
                pendingCount,
                approvedCount,
                rejectedCount,
                approvalRate
            };
        } catch (error) {
            console.error('Error fetching report stats:', error);
            return {
                totalDocuments: 0,
                draftCount: 0,
                pendingCount: 0,
                approvedCount: 0,
                rejectedCount: 0,
                approvalRate: 0
            };
        }
    }

    // ==================== HELPER METHODS ====================

    public async getFieldChoices(listName: string, fieldName: string): Promise<string[]> {
        try {
            const field = await this._sp.web.lists.getByTitle(listName).fields.getByInternalNameOrTitle(fieldName)();
            return (field as any).Choices || [];
        } catch (error) {
            console.error(`Error fetching choices for ${fieldName} in ${listName}:`, error);
            return [];
        }
    }

    public async getUniqueRecordsByColumnName(listName: string, columnName: string): Promise<string[]> {
        try {
            const items = await this._sp.web.lists.getByTitle(listName).items.select(columnName).getAll();
            const uniqueValues = new Set(items.map((item: any) => item[columnName]).filter((val: any) => val));
            return Array.from(uniqueValues).sort() as string[];
        } catch (error) {
            console.error(`Error fetching unique records for ${columnName} in ${listName}:`, error);
            return [];
        }
    }

    // New Master Data Methods
    public async getTemplatesMaster(): Promise<string[]> {
        return this.getUniqueRecordsByColumnName(ListNames.Templates, 'FileLeafRef');
    }

    public async getCTDModulesMaster(): Promise<string[]> {
        return this.getUniqueRecordsByColumnName(ListNames.CTDFolders, 'Title');
    }

    public async getECTDSectionsMaster(): Promise<string[]> {
        return this.getUniqueRecordsByColumnName(ListNames.EctdSections, 'Title');
    }

    public async getCountriesMaster(): Promise<string[]> {
        return this.getUniqueRecordsByColumnName(ListNames.Countries, 'Title');
    }

    // ==================== GMP MODELS OPERATIONS ====================

    public async getGMPModels(): Promise<any[]> {
        try {
            const items = await this.getAllItems({
                listName: ListNames.GmpModels,
                select: ['ID', 'Title', 'Category', 'SubGroup', 'SortOrder'],
                orderBy: 'SortOrder',
                isSortOrderAsc: true
            });
            return (items || []).map((item: any) => ({
                id: item.ID,
                name: item.Title,
                category: item.Category || '',
                subGroup: item.SubGroup || '',
                sortOrder: item.SortOrder || 0
            }));
        } catch (error) {
            console.error('Error fetching GMP Models:', error);
            return [];
        }
    }

    public async createGMPModel(data: { name: string; category: string; subGroup?: string; sortOrder?: number }): Promise<any> {
        const result = await this.createItem({
            Title: data.name,
            Category: data.category,
            SubGroup: data.subGroup || '',
            SortOrder: data.sortOrder || 0
        }, ListNames.GmpModels);
        return { id: result.data.ID, ...data };
    }

    public async updateGMPModel(id: number, data: Partial<{ name: string; category: string; subGroup: string; sortOrder: number }>): Promise<void> {
        const updateData: any = {};
        if (data.name !== undefined) updateData.Title = data.name;
        if (data.category !== undefined) updateData.Category = data.category;
        if (data.subGroup !== undefined) updateData.SubGroup = data.subGroup;
        if (data.sortOrder !== undefined) updateData.SortOrder = data.sortOrder;
        await this.updateItem(updateData, ListNames.GmpModels, id);
    }

    public async deleteGMPModel(id: number): Promise<void> {
        await this.deleteItem(ListNames.GmpModels, id);
    }

    // ==================== TMF FOLDERS OPERATIONS ====================

    public async getTMFFolders(): Promise<any[]> {
        try {
            const items = await this.getAllItems({
                listName: ListNames.TMFFolders,
                select: ['ID', 'Title', 'FolderId', 'ParentFolderId', 'IsFolder', 'SortOrder',
                         'Zone', 'ZoneName', 'Section', 'SectionName', 'ArtifactId', 'ArtifactName', 'Reference'],
                orderBy: 'SortOrder',
                isSortOrderAsc: true
            });
            return (items || []).map((item: any) => ({
                id: item.ID,
                name: item.Title,
                folderId: item.FolderId || String(item.ID),
                parentFolderId: item.ParentFolderId || undefined,
                isFolder: item.IsFolder !== false && item.IsFolder !== 0,
                sortOrder: item.SortOrder || 0,
                zone: item.Zone || 0,
                zoneName: item.ZoneName || '',
                section: item.Section || '',
                sectionName: item.SectionName || '',
                artifactId: item.ArtifactId || '',
                artifactName: item.ArtifactName || '',
                reference: item.Reference || ''
            }));
        } catch (error) {
            console.error('Error fetching TMF Folders:', error);
            return [];
        }
    }

    public async createTMFFolder(data: { name: string; folderId: string; parentFolderId?: string; isFolder: boolean; sortOrder?: number; zone?: number; zoneName?: string; section?: string; sectionName?: string; artifactId?: string; artifactName?: string; reference?: string }): Promise<any> {
        const result = await this.createItem({
            Title: data.name,
            FolderId: data.folderId,
            ParentFolderId: data.parentFolderId || '',
            IsFolder: data.isFolder ? 1 : 0,
            SortOrder: data.sortOrder || 0,
            Zone: data.zone || 0,
            ZoneName: data.zoneName || '',
            Section: data.section || '',
            SectionName: data.sectionName || '',
            ArtifactId: data.artifactId || '',
            ArtifactName: data.artifactName || '',
            Reference: data.reference || ''
        }, ListNames.TMFFolders);
        return { id: result.data.ID, ...data };
    }

    public async updateTMFFolder(id: number, data: Partial<{ name: string; folderId: string; parentFolderId: string; isFolder: boolean; sortOrder: number; zone: number; zoneName: string; section: string; sectionName: string; artifactId: string; artifactName: string; reference: string }>): Promise<void> {
        const updateData: any = {};
        if (data.name !== undefined) updateData.Title = data.name;
        if (data.folderId !== undefined) updateData.FolderId = data.folderId;
        if (data.parentFolderId !== undefined) updateData.ParentFolderId = data.parentFolderId;
        if (data.isFolder !== undefined) updateData.IsFolder = data.isFolder ? 1 : 0;
        if (data.sortOrder !== undefined) updateData.SortOrder = data.sortOrder;
        if (data.zone !== undefined) updateData.Zone = data.zone;
        if (data.zoneName !== undefined) updateData.ZoneName = data.zoneName;
        if (data.section !== undefined) updateData.Section = data.section;
        if (data.sectionName !== undefined) updateData.SectionName = data.sectionName;
        if (data.artifactId !== undefined) updateData.ArtifactId = data.artifactId;
        if (data.artifactName !== undefined) updateData.ArtifactName = data.artifactName;
        if (data.reference !== undefined) updateData.Reference = data.reference;
        await this.updateItem(updateData, ListNames.TMFFolders, id);
    }

    public async deleteTMFFolder(id: number): Promise<void> {
        await this.deleteItem(ListNames.TMFFolders, id);
    }
}


