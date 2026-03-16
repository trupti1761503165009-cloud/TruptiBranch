import { IReactSelectOptionProps } from "./IReactSelectOptionProps";

export interface IAddNewChemicalState {
    // ManufacturerOptions: IReactSelectOptionProps[];
    HazardousOptions: IReactSelectOptionProps[];
    // StorageClassOptions: IReactSelectOptionProps[];
    // PPERequiredOptions: IReactSelectOptionProps[];
    // HazClassOptions: IReactSelectOptionProps[];
    isdisableField: boolean;
    isAddNewChemical: boolean;
    isformValidationModelOpen: boolean;
    validationMessage: any;
    isSDSDocument?: boolean
}

export interface ChemicalItem {
    ID: number;
    Title: string;
    Manufacturer: string;
    SDSDate: string;
    Hazardous: string;
    HazClass: string[];
    StorageRequest: string;
    pH: number;
    StorageClass: string;
    SDS: string;
    PPERequired: string[];
    QCNotes: string;
    NumberOfItems: number;
    ExpirationDate: string;
    SDSDocument: string;
    ProductPhoto: string;
}

export interface HyperlinkType {
    Description: string;
    Url: string;
}

export interface IAddChemicalObj {
    Title?: string;
    Id?: number;
    Manufacturer?: string;
    SDSDate?: Date;
    SDSDateUpdate?: Date;
    Hazardous?: string;
    HazClass?: any;
    StorageRequest?: string;
    pH?: any;
    NumberOfItems?: any;
    StorageClass?: string;
    SDS?: any;
    PPERequired?: any;
    QCNotes?: string;
    ExpirationDate?: Date;
    //SDSDocument?: string;
    ProductPhoto?: any;
    ProductPhotoThumbnailUrl?: string
    SDSFile?: any;
    IsSDSDocument?: any;
}

export interface ISiteAssociatedChemical {
    SiteName?: string;
    StateName?: string;
    ExpirationDate?: string;
}