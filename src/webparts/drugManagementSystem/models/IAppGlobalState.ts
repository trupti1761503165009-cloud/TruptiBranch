import { WebPartContext } from '@microsoft/sp-webpart-base';
import { IUserRoleDetails } from './IUserRoleDetails';
import { IDataProvider } from '../../Service/models/IDataProvider';

export interface IAppGlobalState {
  provider: IDataProvider;
  context: WebPartContext;
  currentUser: any;
  currentUserRoleDetail: IUserRoleDetails;
  description?: string;
  componentName?: string;
  prevComponentName?: string;
  itemId?: number;
  isSidebarHidden?: boolean;
}