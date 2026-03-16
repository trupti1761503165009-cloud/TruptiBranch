export interface IAssetMaster {
    assetName: string;
    id: number;
    siteName: string;
    siteNameId: number;
    assetPhoto: any;
    manufacturer: any;
    assetType: string;
    model: string;
    serialNumber: string;
    purchaseDate: Date;
    purchasePrice: string;
    numberOfItems: number;
    dueDate: Date;
    conditionNotes: string;
    assetLink: any;
    serviceDueDate: Date;
    currentOwnerId: number;
    currentOwnerTitle: string;
    currentOwnerEmail: string;
    previousOwnerId: number;
    previousOwnerTitle: string;
    previousOwnerEmail: string;
    ServiceCompleteById: number;
    ServiceUpdatedBy?: any;
    ServiceCompleteByTitle: string;
    ServiceCompleteByEmail: string;
    aMStatus: string;
    qCColor: string;

}

export interface INewAssetMaster {
    Title?: string;
    SiteNameId?: number;
    AssetPhoto?: any;
    Manufacturer?: any;
    AssetType?: string;
    Model?: string;
    SerialNumber?: string;
    PurchaseDate?: Date;
    PurchasePrice?: string;
    NumberOfItems?: number;
    DueDate?: Date;
    ConditionNotes?: string;
    AssetLink?: any;
    ServiceDueDate?: Date;
    CurrentOwnerId?: number;
    PreviousOwnerId?: number;
    ServiceCompleteById?: any;
    ServiceUpdatedBy?: any;
    AMStatus?: string;
    QCColor?: string;
    QCOrder?: string;
    IsServiceCompleted?: boolean;
    SendEmailToDynamicSiteManager?: boolean;
}