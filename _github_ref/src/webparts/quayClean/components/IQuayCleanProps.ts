import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDataProvider } from "../../../DataProvider/Interface/IDataProvider";
import { ICurrentUser } from "../../../Interfaces/ICurrentUser";

export interface IQuayCleanProps {
  provider: IDataProvider;
  context: WebPartContext;
  adQuery: any;
  cdQuery: any;
  isShowQRCode: any;
  currentUser: ICurrentUser;
  compNameQuery?: string;
  isClientView?: boolean;
  siteId?: any;
}
export interface IQueryString {
  assetDetailQuery: any;
}
