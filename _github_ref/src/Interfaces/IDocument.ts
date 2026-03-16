export interface IDocument {
    id: number;
    siteNameId: number;
    fileLeafRef: string;
    fileRef: string;
    fileDirRef: string;
    title: string;
    documenttUrl: string;
    previewUrl: string;
    isFolder?: boolean;
    currentItemKey?: any;
    parent?: any;
    ChangeName?: any;
}