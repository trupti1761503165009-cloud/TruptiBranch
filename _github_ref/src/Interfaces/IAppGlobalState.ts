import { IQuayCleanProps } from "../webparts/quayClean/components/IQuayCleanProps";
import { ILoginUserRoleDetails } from "./ILoginUserRoleDetails";
import { ISelectedZoneDetails } from "./ISelectedZoneDetails";

export interface IAppGlobalState extends IQuayCleanProps {
    componentName: string;
    loadComponent?: (_componentName: string, _prevComponentName?: string, itemId?: number) => void;
    prevComponentName: string;
    itemId?: number;
    currentUserRoleDetail: ILoginUserRoleDetails;
    selectedZoneDetails: ISelectedZoneDetails
}

export interface IAppSiteState {
    PermissionArray: any;
}
