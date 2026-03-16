import { WebPartContext } from "@microsoft/sp-webpart-base";
import { ICurrentUser } from "../../jotai/IcurrentUseratom";
import { IDataProvider } from "../../Service/models/IDataProvider";

export interface IDrugManagementSystemProps {
  description: string;
  currentUser: ICurrentUser;
  provider: IDataProvider;
  context: WebPartContext;
}
