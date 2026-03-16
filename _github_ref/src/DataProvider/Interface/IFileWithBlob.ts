// export interface IFileWithBlob {
//     name: string;
//     content: any;
// }
export interface IFileWithBlob {
    name: string;
    file: any;
    folderServerRelativeURL?: string;
    overwrite?: boolean;
    key?: number | string;
    internalName?: string;
}