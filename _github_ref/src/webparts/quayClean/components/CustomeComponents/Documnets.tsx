import * as React from "react";
import { Documnet } from "./AuditReport/Documnet";
import { IQuayCleanState } from "../QuayClean";
import { IDataProvider } from "../../../../DataProvider/Interface/IDataProvider";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IBreadCrum } from "../../../../Interfaces/IBreadCrum";
export interface IDocumnetsProps {
    provider: IDataProvider;
    manageComponentView(componentProp: IQuayCleanState): any;
    currentCompomentName: string;
    context: WebPartContext;
    breadCrumItems: IBreadCrum[];
    loginUserRoleDetails: any;
    siteName: any;
    componentProp: IQuayCleanState;
}
export const Documnets = (props: IDocumnetsProps) => {
    return <Documnet
        loginUserRoleDetails={props.loginUserRoleDetails}
        currentCompomentName={props.currentCompomentName}
        provider={props.provider}
        manageComponentView={props.manageComponentView}
        context={props.context}
        isViewSiteDialog={false}
        siteName={props.siteName}
        breadCrumItems={props.breadCrumItems}
        componentProp={props.componentProp}
    />;
};