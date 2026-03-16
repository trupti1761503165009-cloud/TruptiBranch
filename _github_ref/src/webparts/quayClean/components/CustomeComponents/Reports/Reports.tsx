/* eslint-disable  */
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { IQuayCleanState } from "../../QuayClean";
import React from "react";
import { PrimaryButton } from "@fluentui/react";
import { encryptValue } from "../../../../../Common/Util";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { Pivot, PivotItem } from "office-ui-fabric-react";
import { ViewEOMChecklist } from "../CheckList/ViewEOMChecklist";
import { MicrokeeperDocumantation } from "../../CommonComponents/MicrokeeperDocumantation";

export interface IReportsProps {
    siteMasterId: any;
    siteDetail: any;
    isSiteView?: boolean;
    manageComponentView: (componentProp: IQuayCleanState) => any;

    breadCrumItems: IBreadCrum[];
    siteName?: string;
    originalSiteMasterId: any;
    IsSupervisor?: boolean;
    componentProps: IQuayCleanState;
    dataObj?: any;
    isReload?: boolean;
    originalState?: any;
}

export const Reports = (props: IReportsProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail } = appGlobalState;
    //  const [selectedKey, setselectedKey] = React.useState<any>(props?.subpivotName || props?.componentProp?.subpivotName);
    const [selectedKey, setselectedKey] = React.useState<any>();
    const _onLinkClick = (item: PivotItem): void => {
        if (item.props.itemKey == "Safety Culture") {
        }
        setselectedKey(item.props.itemKey);
    };
    return (
        <div className="mt-10 more-page-wrapper">
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="pl-8 pr-8">
                        <div className="formGroup dflex mt-2">

                        </div>
                        <div className='height211 lightgrey2'>
                            <div className="">
                                {/* <Pivot aria-label="Basic Pivot Example" id="SCpivot" selectedKey={selectedKey}
                                    onLinkClick={_onLinkClick}> */}
                                    {/* <PivotItem headerText="Manager’s Monthly KPI’s" itemKey="Manager’sMonthlyKPI’s">
                                        <div className="">
                                            <ViewEOMChecklist
                                                manageComponentView={props.manageComponentView}
                                                siteMasterId={props.siteMasterId}
                                                originalState={props.originalState}
                                                originalSiteMasterId={props.originalSiteMasterId}
                                                IsSupervisor={props.IsSupervisor}
                                                dataObj={props?.dataObj}
                                                breadCrumItems={props.breadCrumItems || []}
                                                componentProps={props.componentProps}
                                            />

                                        </div>
                                    </PivotItem> */}
                                    {/* <PivotItem headerText="Documentation" itemKey="Documentation"> */}
                                        <div className='mt-2'>
                                            <MicrokeeperDocumantation
                                                loginUserRoleDetails={props.componentProps.loginUserRoleDetails}
                                                provider={provider}
                                                context={context}
                                                manageComponentView={props.manageComponentView}
                                                breadCrumItems={props.breadCrumItems || []} />
                                        </div>
                                    {/* </PivotItem> */}
                                    {/* <PivotItem headerText="Microkeeper Link" itemKey="MicrokeeperLink">
                                        <div className='mt-2'>
                                            <PrimaryButton
                                                className="btn btn-primary ml-10"
                                                text="Microkeeper"
                                                onClick={() => {
                                                    const IMSDshboardPageLink = `${context.pageContext.web.absoluteUrl}/SitePages/Microkeeper.aspx?SiteId=${encryptValue(props?.siteMasterId)}`
                                                    window.open(IMSDshboardPageLink, '_blank')
                                                }}
                                            />
                                        </div>
                                    </PivotItem> */}

                                {/* </Pivot> */}
                            </div >
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
