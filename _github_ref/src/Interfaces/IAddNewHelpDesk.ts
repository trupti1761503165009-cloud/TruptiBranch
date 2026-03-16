import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDataProvider } from "../DataProvider/Interface/IDataProvider";
import { IReactSelectOptionProps } from "./IReactSelectOptionProps";
import { IQuayCleanState } from "../webparts/quayClean/components/QuayClean";
import { IBreadCrum } from "./IBreadCrum";
import { ISelectedZoneDetails } from "./ISelectedZoneDetails";

export interface IHelpDeskFormProps {
  provider: IDataProvider;
  context: WebPartContext;
  isAddNewHelpDesk?: boolean;
  manageComponentView(componentProp: IQuayCleanState): any;
  siteMasterId?: number;
  breadCrumItems: IBreadCrum[];
  loginUserRoleDetails: any;
  originalSiteMasterId: any;
  componentProps: IQuayCleanState;
  isReload?: boolean;
  initialValue?: string;
  originalState?: string;
  isNotGeneral?: boolean;
  view?: any;
  isForm?: boolean;
  siteName?: any;
  isDirectView?: boolean;
  qCStateId?: any;
  hidebtn?: boolean;
  selectedZoneDetails?: ISelectedZoneDetails;
   isZoneEdit?: boolean;

}

export interface IHelpDeskFormState {
  CallerOptions: IReactSelectOptionProps[];
  CategoryOptions: IReactSelectOptionProps[];
  EventOptions: IReactSelectOptionProps[];
  isdisableField: boolean;
  isAddNewHelpDesk: boolean;
  isformValidationModelOpen: boolean;
  validationMessage: any;
}

export interface IHelpDeskItem {
  Id?: number;
  Title?: string;
  StartingDateTime?: Date | any;
  Caller?: string;
  Location?: string;
  QCAreaId?: any;
  Area?: any;
  HDCategory?: string;
  ReportHelpDesk?: boolean;
  HDStatus?: string;
  EventName?: string;
  QCPriority?: string;
  SubLocation?: string;
  SiteNameId?: any;
  HelpDeskName?: string;
  FirstName?: string;
  LastName?: string;
  EmailAddress?: string;
  Venue?: string;
  StateId?: any;
  Notes?: string;
  CallType?: any;
  CompletionDateTime?: Date | any;
}
export interface IAddHelpDeskItem extends IHelpDeskItem {
  indexNumber: number;
}

export interface IClientItem {
  Id?: number;
  FirstName?: string;
  LastName?: string;
  EmailAddress?: string;
  ClientId?: any;
  Venue?: string;
  StateId?: any;
  Notes?: string;
  SiteNameId?: any;
}

export interface IEmployeeItem {
  Id?: number;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  StateId?: [];
  Phone?: string;
  EmployeeId?: string;
  IsQuaycleanUser?: boolean;
}

export interface IHelpDeskItemView {
  Id?: number;
  Title?: string;
  SiteName?: string;
  SiteNameId?: number;
  Caller?: string;
  Location?: string;
  SubLocation?: string;
  QCAreaId?: number;
  QCArea?: string;
  Area?: string;
  StartingDateTime?: string | undefined;
  HDCategory?: string;
  HDStatus?: string;
  ReportHelpDesk?: string;
  EventName?: string;
  QCPriority?: string;
  HelpDeskName?: string;
  CallType?: any;
  CompletionDateTime?: string | undefined;
  Duration?: any
}
