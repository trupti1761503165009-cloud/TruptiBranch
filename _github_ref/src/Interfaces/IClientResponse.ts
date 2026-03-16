import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDataProvider } from "../DataProvider/Interface/IDataProvider";
import { IReactSelectOptionProps } from "./IReactSelectOptionProps";
import { IQuayCleanState } from "../webparts/quayClean/components/QuayClean";
import { ILoginUserRoleDetails } from "./ILoginUserRoleDetails";
//import { IBreadCrum } from "./IBreadCrum";

export interface IClientResponseListProps {
    isAddNewClientResponse?: boolean;
    manageComponentView(componentProp: IQuayCleanState): any;
    siteMasterId?: number;
    breadCrumItems: any[];
    //loginUserRoleDetails: ILoginUserRoleDetails;
    componentProps: IQuayCleanState;
    originalSiteMasterId: any;
    IsSupervisor?: boolean;
    dataObj?: any;
    view?: any;
    qCStateId?: any;
}

export interface IClientResponseListState {
    CallerOptions: IReactSelectOptionProps[];
    CategoryOptions: IReactSelectOptionProps[];
    EventOptions: IReactSelectOptionProps[];
    isdisableField: boolean;
    isAddNewClientResponse: boolean;
    isformValidationModelOpen: boolean;
    validationMessage: any;
}


export interface IClientResponseItem {
    Id?: number;
    Title?: string;
    Quarter?: string;
    LogInTime?: Date | undefined;
    ResponseCompletionDate?: Date | undefined;
    SiteNameId?: number;
    Area?: any;
    Request?: string;
    ActionPlan?: string;
    WhoAreInvolved?: string;
    HasTheSolutionWorked?: boolean;
    BeforeImage1?: string;
    BeforeImage2?: string;
    AfterImage1?: string;
    AfterImage2?: string;
    Year?: string;
    Building?: string;
    Feedback?: string;
    IsCompleted?: boolean;
    BeforeImage1ThumbnailUrl?: string;
    BeforeImage2ThumbnailUrl?: string;
    AfterImage1ThumbnailUrl?: string;
    AfterImage2ThumbnailUrl?: string;
}

export interface IClientResponseItemView {
    Id: number;
    Title?: string;
    Quarter?: string;
    LogInTime?: string;
    SiteName?: string;
    ResponseCompletionDate?: string;
    SiteNameId?: number;
    Area?: string;
    //StartingDateTime?: string | undefined;
    Request?: string;
    ActionPlan?: string;
    WhoAreInvolved?: string;
    HasTheSolutionWorked?: string;
    IsCompleted?: string;
    BeforeImage1?: string;
    BeforeImage2?: string;
    AfterImage1?: string;
    AfterImage2?: string;
    Year?: string;
    Building?: string;
    Feedback?: string;
    BeforeImage1ThumbnailUrl?: string;
    BeforeImage2ThumbnailUrl?: string;
    AfterImage1ThumbnailUrl?: string;
    AfterImage2ThumbnailUrl?: string;
}