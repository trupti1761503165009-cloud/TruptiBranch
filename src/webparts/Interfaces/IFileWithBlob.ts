export interface IFileWithBlob {
    name: string;
    file: any;
    folderServerRelativeURL: string;
    overwrite?: boolean;
    key?: number | string;
}