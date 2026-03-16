export default interface IPnPQueryOptions {
    select?: string[];
    filter?: any;
    expand?: string[];
    top?: number;
    skip?: number;
    orderBy?: string;
    isSortOrderAsc?: boolean;
    listName: string;
    listInternalName?: string;
    siteUrl?: string;
    id?: number
}

export interface IAttachment {
    name: string,
    fileContent: any

}

export interface IPnPCAMLQueryOptions {
    listName: string;
    queryXML?: string;
    siteUrl?: string;
    pageToken?: string | "";
    pageLength?: number;
    FolderServerRelativeUrl?: string | "";
    overrideParameters?: { SortField: string, SortDir: string } | { SortField: "Id", SortDir: "Desc" };
}