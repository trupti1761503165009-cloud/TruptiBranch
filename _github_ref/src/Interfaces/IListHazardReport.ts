import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDataProvider } from "../DataProvider/Interface/IDataProvider";
import { IQuayCleanState } from "../webparts/quayClean/components/QuayClean";
import { IBreadCrum } from "./IBreadCrum";
import { ISelectedZoneDetails } from "./ISelectedZoneDetails";

export interface IListHazardReport {
  provider: IDataProvider;
  context: WebPartContext;
  manageComponentView(componentProp: IQuayCleanState): any;
  siteMasterId?: number;
  breadCrumItems: IBreadCrum[];
  loginUserRoleDetails: any;
  componentProps?: IQuayCleanState;
  view?: any;
  siteName?: any;
  isDirectView?: boolean;
  qCStateId?: any;
  isNotGeneral?: any;
  stateTabData?: any;
  isHideAction?: any;
  selectedZoneDetails?: ISelectedZoneDetails

}