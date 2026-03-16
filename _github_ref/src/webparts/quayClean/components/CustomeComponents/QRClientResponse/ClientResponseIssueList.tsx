
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { PivotItem, Pivot } from "office-ui-fabric-react";
import React from "react";
import { CRPivotEnum } from "../../../../../Common/Enum/WasteReportEnum";
import { IQuayCleanState } from "../../QuayClean";
import { ManageSiteArea } from "./ManageSiteArea/ManageSiteArea";
import { ListCRIssues } from "./IssuesList/ListCRIssues";
import { useAtomValue } from "jotai";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";

export interface ICRProps {
    PivotData?: any
    siteMasterId: any;
    manageComponentView(componentProp: IQuayCleanState): any;
    URL?: String;
    qCState?: string;
    breadCrumItems: any[];
    componentProps: IQuayCleanState;
    view?: any;
    qCStateId?: any;
    isZoneView?: boolean;
}

export const ClientResponseIssueList = (props: ICRProps) => {
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const [selectedKey, setselectedKey] = React.useState<any>(props?.componentProps?.subpivotName);

    const _onLinkClick = (item: PivotItem): void => {
        setselectedKey(item.props.itemKey);
    };

    return <>

        <div className={(isSiteLevelComponent || props?.isZoneView) ? "" : "boxCard-mt-0"}>
            {(!isSiteLevelComponent && !props?.isZoneView) && <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                    <h1 className="mainTitle">Client Response</h1>
                </div>
            </div>}

            <div className='ms-Grid-row p-14 pmt-15 more-page-wrapper'>
                <div className='ms-md12 ms-sm12 ms-Grid-col'>
                    <div className="">
                        <ListCRIssues
                            loginUserRoleDetails={props.componentProps.loginUserRoleDetails}
                            manageComponentView={props.manageComponentView}
                            // siteMasterId={props.componentProps.siteMasterId}
                            siteMasterId={props.siteMasterId}
                            breadCrumItems={props.componentProps.breadCrumItems || []}
                            componentProps={props.componentProps}
                            view={props.view}
                            isNotGeneral={true}
                        />
                    </div>
                    {/* <Pivot aria-label="Basic Pivot Example" id="SCpivot" selectedKey={selectedKey}
                        onLinkClick={_onLinkClick}>
                        <PivotItem headerText={CRPivotEnum.IssueList} itemKey={CRPivotEnum.IssueKey}>
                            
                        </PivotItem>
                        <PivotItem headerText={CRPivotEnum.ManageSubSite} itemKey={CRPivotEnum.ManageSubsiteKey}>
                            <div className=''>
                                <ManageSiteArea
                                    manageComponentView={props.manageComponentView}
                                    siteMasterId={props.componentProps.siteMasterId}
                                    breadCrumItems={props.componentProps.breadCrumItems || []}
                                    componentProps={props.componentProps}
                                    originalSiteMasterId={props.componentProps.originalSiteMasterId}
                                    isNotGeneral={false}
                                    view={props.view}
                                    qCStateId={props?.qCStateId}
                                />
                            </div>
                        </PivotItem>
                    </Pivot> */}
                </div>
            </div>
        </div>
    </>;
};