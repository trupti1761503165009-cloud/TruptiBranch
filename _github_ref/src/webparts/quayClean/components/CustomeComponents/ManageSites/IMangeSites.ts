import { ICustomPeoplePicker, ILookup } from "../WHSForms/IAddWHSMeetingFroms";

export interface IUsers {
  isGuestUser: boolean;
  id: number;
  title: string;
  email: string;
  loginName: string;
  isSiteAdmin: boolean;
  imageURL: string;
}

export interface ISitesMaster {
  HelpDeskType: ILookup;
  QCState: ILookup;
  JobCode: number;
  SiteSupervisor: ICustomPeoplePicker[];
  SiteManager: ICustomPeoplePicker[];
  ADUser: ICustomPeoplePicker[];
  SiteSupervisorId: number[];
  SiteManagerId: number[];
  ADUserId: number[];
  Category: string;
  Title: string;
  Id: number;
  lastLogDate?: any;
  OrgSitesModified?: any;
}

export interface ISitesMasterCrud {
  QCStateName: string;
  QCStateId: number;
  SiteSupervisorId: ICustomPeoplePicker[];
  SiteManagerId: ICustomPeoplePicker[];
  ADUserId: ICustomPeoplePicker[];
  Category: string;
  Title: string;
  Id: number;
  siteImageUrl: string;
  JobCode: string;
  SCSiteId: string;
  ExistingSiteLink: string;
  Periodic: boolean;
  HelpDesk: boolean;
  eLearning: boolean;
  ClientResponse: boolean;
  JobControlChecklist: boolean;
  ManageEvents: boolean;
  IsResourceRecovery: boolean;
  SubLocation: boolean;
  SSWasteReport: any;
  AmenitiesFeedbackForm?: any;
  IsDailyCleaningDuties?: any;
  DynamicSiteManager?: any;
}

export interface ISitesMasterGroups extends ISitesMaster {
  SiteSupervisorCount: number;
  SiteManagerCount: number;
  ADUserCount: number;
}

export interface IUserGridData extends IUsers {
  associatedSitesCount: number;
  lastActivityDate: any;
  associatedSites: ISitesMaster[];
  orgLastActivityDate: any;
}

export interface IUserActivityLog {
  EntityType: string;
  ActionType: string;
  State: ILookup;
  SiteName: ILookup;
  Count: number;
  EntityId: number;
  Email: string;
  Details: string;
  EntityName: string;
  UserName: string;
  IsActive: boolean;
  Title: string;
  Id: number;
  Modified: any;
  OrgModified: any;
  OrgCreated: any;
  Created: any;
  CreatedBy: ICustomPeoplePicker;
}
