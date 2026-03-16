export interface IDocumentBlob {
    name: string;
    file: any;
    folderServerRelativeURL?: string;
    overwrite?: boolean;
    key?: number | string;
    internalName: string;
}