import { ClientResponseForm } from "./../webparts/quayClean/components/CustomeComponents/ClientResponse/ClientResponseForm";
import { IcurrentloginDetails } from "../webparts/quayClean/components/CommonComponents/HeaderComponent";
import { INavigationLinks } from "./INavigationLinks";
import { IReactSelectOptionProps } from "./IReactSelectOptionProps";
import { ICustomPeoplePicker } from "../webparts/quayClean/components/CustomeComponents/WHSForms/IAddWHSMeetingFroms";
import { IDropdownOption } from "@fluentui/react";

export interface IAddNewSiteState {
  siteMasterOptions: IReactSelectOptionProps[];
  stateMasterOptions: IReactSelectOptionProps[];
  siteMasterItems: ISiteMaster[];
  isdisableField: boolean;
  HelpDeskTypeOptions: IReactSelectOptionProps[];
  isaddNewSite: boolean;
  isEditSite: boolean;
  viewSiteItem?: ISiteMaster;
  isformValidationModelOpen: boolean;
  validationMessage: any;
  isUpdateNewSite?: boolean;
  isEditSiteImagePanelOpen: boolean;
  isEditSiteImageDeleted: boolean;
  isEditSiteHeaderPanelOpen: boolean;
  isEditSiteHeaderDeleted: boolean;
  isUpdateShowDetailOnly: boolean;
  isShowDetailOnly?: boolean;
  isVisibleCrud: boolean;
  personaManagerArray: any[];
  personaSupervisorArray: any[];
  personaADUserArray: any[];
  navLinksItems: INavigationLinks[];
  currentloginDetails: IcurrentloginDetails;
  isAssetLocationOpen?: boolean;
  assetLocationPermission?: IAssetLocationPermission[];
  assetLocationManagerSupervisorData: any[];
  assetLocationOptions: IDropdownOption[];
  assetSucessMessageBar: boolean;
  isReload: boolean;
  DynamicSiteManagerOptions?: any[];
}

export interface IAssetLocationPermission {
  ID: number;
  Title: string;
  ManagerSupervisorId: number;
  ManagerSupervisor: ICustomPeoplePicker;
  Location: string[];
  IsManager: boolean;
}

export interface ISiteMaster {
  Id: number;
  siteName: string; //Site Name;
  qCState: any;
  qCStateId: number;
  helpDeskType: string;
  helpDeskTypeId: number;
  helpDeskNeeded: boolean;
  siteManagerTitle: string;
  siteManagerEmail: string;
  siteManagerId: number;
  siteSupervisorTitle: string;
  siteSupervisorEmail: string;
  siteSupervisorId: number;
  aDUserId: number;
  aDUserEmail: string;
  aDUserTitle: string;
  siteImageUrl?: string;
  siteHeaderUrl?: string;
  ExistingSiteLink?: string;
  HelpDesk?: boolean;
  Periodic?: boolean;
  JobCode?: number;
  ClientResponse?: boolean;
  JobControlChecklist?: boolean;
  ManageEvents?: boolean;
  IsResourceRecovery?: boolean;
  Category: string;
  SiteCategoryId: number;
}

export interface IAddSiteMasterObj {
  Title?: string; //SiteName;
  ADUserId?: any;
  SiteManagerId?: any[];
  SiteSupervisorId?: any[];
  SiteSupervisor?: any[];
  QCStateId?: any;
  HelpDeskTypeId?: any;
  HelpDeskNeeded?: boolean;
  eLearning?: boolean;
  SiteImage?: any;
  SiteImageThumbnailUrl?: any;
  SiteHeader?: any;
  SiteHeaderThumbnailUrl?: any;
  ExistingSiteLink?: any;
  JobCode?: number;
  HelpDesk?: any;
  Periodic?: any;
  ClientResponse?: any;
  JobControlChecklist?: any;
  ManageEvents?: any;
  IsResourceRecovery?: boolean;
  SubLocation?: any;
  SiteCategoryId?: number;
  // SiteCategoryTitle?: string;
  Category?: string;
  SSWasteReport?: boolean;
  Users?: any;
  UsersId?: any[];
  BreakDownBy?: any;
  SCSiteId?: any;
  AmenitiesFeedbackForm?: any;
  IsDailyCleaningDuties?: any;
  DynamicSiteManagerId?: any;
  StateNameValue?: string;
}

export interface IDefaultSelcetdFromItems {
  Id: number;
  siteName: any;
  qCState: number;
  aDUser: any;
  helpDeskType: number;
  helpDeskNeeded: any;
  siteManager: any;
  siteSupervisor: any;
  SiteImage: any;
  SiteHeader: any;
  ExistingSiteLink?: any;
  sitenamestr: any;
  JobCode: string;
  SiteCategoryId: number | undefined;
  Category: string;
  // selectedDynamicSiteManager: any;
}
