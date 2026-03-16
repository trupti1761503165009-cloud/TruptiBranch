
import { IDrugManagementSystemProps } from "../drugManagementSystem/components/IDrugManagementSystemProps";
import { IEmployeeItem, IGroupItem } from "../Shared/constants/defaultValues";


export interface IAppGlobalState extends IDrugManagementSystemProps {
    componentName: string;
    loadComponent: (componentName: string, _prevComponentName?: string, itemId?: any, PermitType?: any) => void;
    prevComponentName: string;
    itemId?: number;
    folderPath?: string;
    SPUserInfo: any;
    UserDetail: IEmployeeItem | any;
    UserGroups: IGroupItem[] | any;
    IsAdmin: boolean | any;
    IsHumanResource: boolean | any;
    IsProjectManager: boolean | any;
    currentYear: string
}

export interface IPAFormState {
    IsPAForm: boolean;
}