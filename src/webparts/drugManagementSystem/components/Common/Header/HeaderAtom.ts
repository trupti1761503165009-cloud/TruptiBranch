import { atom } from "jotai";
import { IDrugManagementSystemProps } from "../../IDrugManagementSystemProps";

export interface IHeaderprops {
    custProps: IDrugManagementSystemProps;
    loadComponent: any;
    itemId: number | undefined,
    previousComponent: string;
}

export const HeaderDetails = atom({} as IHeaderprops)