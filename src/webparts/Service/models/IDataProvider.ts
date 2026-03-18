import { IFileWithBlob } from "./IFileWithBlob";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "./IPnPQueryOptions";
import { ICategory, IDrug, ICTDFolder, ITemplate, IDocument, IWorkflowApproval, IUserRole, IReportStats } from "../Service";

export interface IDataProvider {
    createItem(objItems: any, listName: string): Promise<any>;
    updateItem(objItems: any, listName: string, itemId: number): Promise<any>;
    createItemInBatch(objItems: any[], listName: string): Promise<any>;
    getItemsByQuery(queryOptions: IPnPQueryOptions): Promise<any>;
    getAllItems(queryOptions: IPnPQueryOptions): Promise<any>;
    getByItemByID(queryOptions: IPnPQueryOptions, id: number): Promise<any>;
    getItemsByCAMLQuery(listName: string, xmlQuery: string, overrideParameters?: any, siteUrl?: string): Promise<any[]>;
    updateListItemsInBatchPnP(listName: string, objItems: any[]): Promise<any>;
    updateListItemsInMultipleListInBatchPnP(objItems: any[]): Promise<any>;
    getCurrentUser(): Promise<any>;
    getPropertiesFor(usersArray: any): Promise<any>;
    getSearchDocument(data: any): Promise<any>;
    deleteItem(listName: string, itemId: number): Promise<any>;
    createFolder(folderUrl: string, metadata?: any): Promise<any>;
    uploadFile(file: IFileWithBlob, metadataUpdate?: boolean, metadata?: any): Promise<any>;
    getVersionHistoryById(listName: string, itemId: number): Promise<any>;
    createItemWithAttchment(objItems: any, listName: string, file: any[]): Promise<any>;
    UpdateItemWithAttachment(ID: number, objItems: any, listName: string, file: any, oldAttachmnetName?: any): Promise<any>;
    loadBatchOfItems(pageNumber: number): Promise<any>;
    getBatchItemsItemsByQuery(queryOptions: IPnPQueryOptions): Promise<any[]>;
    getItemsInBatchByCAMLQuery(pnpQueryOptions: IPnPCAMLQueryOptions): Promise<any>;
    choiceOption(listName: string, fieldName: string): Promise<any>;
    DeleteItemsWithBatch(listName: string, objItems: any[]): Promise<any>;
    deleteAttachmentsPnP(listName: string, itemId: number, fileName: string): Promise<any>;
    // getFileContent(fileurl: String): Promise<any>;
    createItemWithBatchAttachments(objItems: any, listName: string, file: any[]): Promise<any>;
    UpdateItemWithBatchAttachments(ID: number, objItems: any, listName: string, file: any, oldAttachmnetName?: any): Promise<any>;
    addMultipleAttachments(listName: string, itemId: any, Files: any): Promise<any>;
    getFileContent(listName: string, itemId: number, fileName: string): Promise<any>;
    _Document(UploadFolderName: string, libraryName: string): Promise<any>;
    updateFolderName(FolderName: string, UpdateFolderName: string, libraryName: string): Promise<any>;
    getDocumentLibraryrootFolderItems(libraryName: string): Promise<any>;
    getChildFolders(folderServerRelativeUrl: string): Promise<any>;
    gettopNavigationBarTitle(): Promise<any>;
    getAllSiteCollection(Siteurl: string): Promise<any>;
    shareObject(Shareobj: any): Promise<any>;
    copyFile(sourceUrl: string, targetUrl: string): Promise<any>;
    copyFolder(sourceUrl: string, targetUrl: string): Promise<any>;
    createBlankOfficeFile(fileType: string, folderServerRelativeUrl: string, baseName: string): Promise<{ serverRelativeUrl: string; fileName: string; itemId: number }>;
    getAccessibleSites(): Promise<any>;
    getDocumentLibraries(sourceUrl: string): Promise<any>;
    createOfficeDocument(fileType: string, sourcePath: string): Promise<any>;
    getCurrentUserGroups(): Promise<any>;
    getUsersFromGroup(groupName: string): Promise<any>;
    addUserToGroup(userLoginName: string, groupName: string): Promise<void>;
    removeUserFromGroup(userId: number, groupName: string): Promise<void>;
    getFileContents(fileUrl: string): Promise<any>;
    uploadFileInLibrary(folderPath: string, updatedExcel: string): Promise<any>;
    uploadFiles(filePath: string, fileBuffer: ArrayBuffer, contentType: string): Promise<any>;
    deleteMultipleFiles(fileUrls: string[]): Promise<boolean[]>;

    // DMS Category Operations
    getCategories(): Promise<ICategory[]>;
    createCategory(data: Omit<ICategory, 'id'>): Promise<ICategory>;
    updateCategory(id: number, data: Partial<ICategory>): Promise<void>;
    deleteCategory(id: number): Promise<void>;

    // DMS Drug Operations
    getDrugs(): Promise<IDrug[]>;
    createDrug(data: Omit<IDrug, 'id'>): Promise<IDrug>;
    updateDrug(id: number, data: Partial<IDrug>): Promise<void>;
    deleteDrug(id: number): Promise<void>;

    // DMS CTD Folder Operations
    getCTDFolders(): Promise<ICTDFolder[]>;
    createCTDFolder(data: Omit<ICTDFolder, 'id'>): Promise<ICTDFolder>;
    updateCTDFolder(id: number, data: Partial<ICTDFolder>): Promise<void>;
    deleteCTDFolder(id: number): Promise<void>;

    // DMS Template Operations
    getTemplates(): Promise<ITemplate[]>;
    uploadTemplate(file: File, metadata: Partial<ITemplate>): Promise<ITemplate>;
    updateTemplate(id: number, data: Partial<ITemplate>): Promise<void>;
    deleteTemplate(id: number): Promise<void>;

    // DMS Document Operations
    getDocuments(): Promise<IDocument[]>;
    createDocument(data: Partial<IDocument>): Promise<IDocument>;
    updateDocument(id: number, data: Partial<IDocument>): Promise<void>;
    deleteDocument(id: number): Promise<void>;

    // DMS Workflow Approval Operations
    getWorkflowApprovals(): Promise<IWorkflowApproval[]>;
    createWorkflowApproval(data: Omit<IWorkflowApproval, 'id'>): Promise<IWorkflowApproval>;
    updateWorkflowApproval(id: number, data: Partial<IWorkflowApproval>): Promise<void>;

    // DMS User Role Operations
    getUserRoles(): Promise<IUserRole[]>;

    // DMS Report Operations
    getReportStats(): Promise<IReportStats>;

    // Helper Methods
    getFieldChoices(listName: string, fieldName: string): Promise<string[]>;
    getUniqueRecordsByColumnName(listName: string, columnName: string): Promise<string[]>;

    // New Master Data Methods
    getTemplatesMaster(): Promise<string[]>;
    getCTDModulesMaster(): Promise<string[]>;
    getECTDSectionsMaster(): Promise<string[]>;
    getCountriesMaster(): Promise<string[]>;

    // File Operations
    checkInFile(serverRelativePath: string): Promise<void>;
}

