export interface IAssetHistory {
    id: number;
    title: string;
    serviceDate: any;
    siteNameId: number;
    serviceCompleteById?: any;
    ServiceCompleteBy?: any;
    serviceCompleteByTitle?: string;
    serviceCompleteByEmail?: string;
    attachments: boolean;
    ServiceUpdatedBy?: any;
    serverRelativeUrl: string;
    url?: string;
}
export interface INewAssetHistory {
    Title: string;
    ServiceDate: any;
    SiteNameId: number;
    ServiceCompleteById?: any;
    ServiceCompleteBy?: any;
    ServiceUpdatedBy?: any;
    AssetMasterId: number;
}
