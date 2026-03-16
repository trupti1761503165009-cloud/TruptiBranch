/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { Pivot, PivotItem, PrimaryButton } from "@fluentui/react";
import { useId } from "@fluentui/react-hooks";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { IQuayCleanState } from "../../QuayClean";
import { _onItemSelected } from "../../../../../Common/Util";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDocument } from "../../../../../Interfaces/IDocument";
import { Loader } from "../../CommonComponents/Loader";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { ListToolboxTalk } from "./ToolboxTalk/ListToolboxTalk";
import { ListSkillMatrix } from "./SkillMatrix/ListSkillMatrix";
import { ListToolboxIncident } from "./ToolboxIncident/ListToolboxIncident";
import { ListWorkplaceInspection } from "./WorkplaceInspection/ListWorkplaceInspection";
import { ListCorrectiveActionReport } from "./CorrectiveActionReport/ListCorrectiveActionReport";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { CommonConstSiteName, ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { ListInduction } from "./Induction/ListInduction";
import { ListSiteSafetyAudit } from "./SiteSafetyAudit/ListSiteSafetyAudit";
import { WHSMeetingGrid } from "../WHSForms/WHSMeetingGrid";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { WHSMeetingAgendaGrid } from "../WHSMeetingAgenda/WHSMeetingAgendaGrid";
import { QCeLearningLink } from "../WasteReportLink/QCeLearningLink";
import { WasteReportPivot } from "../../../../../Common/Enum/WasteReportEnum";
import { HazardEnum } from "../../../../../Common/Enum/HazardFields";
import { ListHazardReport } from "./HazardReport/ListHazardReport";
import { ISelectedZoneDetails } from "../../../../../Interfaces/ISelectedZoneDetails";

export interface IIMSProps {
    provider: IDataProvider;
    PivotData?: any
    context: WebPartContext;
    siteMasterId: any;
    manageComponentView(componentProp: IQuayCleanState): any;
    URL?: String;
    qCState?: string;
    siteName?: string;
    breadCrumItems: any[];
    componentProp: IQuayCleanState;
    loginUserRoleDetails: ILoginUserRoleDetails;
    IsSupervisor?: boolean;
    subpivotName?: string;
    dataObj?: any;
    dataObj2?: any;
    originalState?: string;
    isZoneView?: boolean;
    view?: any;
    qCStateId?: any;
    selectedZoneDetails?: ISelectedZoneDetails;
}

export interface IDocumnetState {
    column?: any[];
    documentItem: IDocument[];
    isDocumentPanelOpen: boolean;
    isDocumentPanelActionOpen: boolean;
    documnetUrl: string;
    isRelod: boolean;
}

// const selectedZoneDetails: any = {
//     selectedSitesId: [640, 628, 623, 607, 559, 542, 532, 527, 524, 521, 496, 494, 492],
//     selectedSites: [
//         { Id: 1, QCStateId: 7, SiteName: "Sydney Showground", State: "NSW" },
//         { Id: 2, QCStateId: 6, SiteName: "Melbourne Cricket Ground", State: "QLD" },
//         { Id: 3, QCStateId: 9, SiteName: "Sydney Showground", State: "VIC" },
//     ]
// };
// const selectedZoneDetailsToolboxIncident: any = {
//     selectedSitesId: [628, 625, 624, 559, 555, 545, 542, 527, 524],
//     selectedSites: [
//         { Id: 1, QCStateId: 7, SiteName: "Sydney Showground", State: "NSW" },
//         { Id: 2, QCStateId: 6, SiteName: "Melbourne Cricket Ground", State: "QLD" },
//         { Id: 3, QCStateId: 9, SiteName: "Sydney Showground", State: "VIC" },
//     ]
// };
// const selectedZoneDetailsHazard: any = {
//     selectedSitesId: [617, 615, 449, 343],
//     selectedSites: [
//         { Id: 1, QCStateId: 7, SiteName: "Sydney Showground", State: "NSW" },
//         { Id: 2, QCStateId: 6, SiteName: "Melbourne Cricket Ground", State: "QLD" },
//         { Id: 3, QCStateId: 9, SiteName: "Sydney Showground", State: "VIC" },
//     ]
// };
export const IMS = (props: IIMSProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail } = appGlobalState;
    const [filterFields, setFilterFields] = React.useState<ICamlQueryFilter[]>([{
        fieldName: "SiteName",
        fieldValue: "",
        fieldType: FieldType.LookupById,
        LogicalType: LogicalType.IsNotNull,
    }]);
    const [selectedFileName, setSelectedFileName] = React.useState<any>("");
    const [selectedKey, setselectedKey] = React.useState<any>(props?.subpivotName || props?.componentProp?.subpivotName);
    // const [selectedKey, setselectedKey] = React.useState<any>("HazardReport");
    const [state, setState] = React.useState<IDocumnetState>({
        column: [],
        documentItem: [],
        isDocumentPanelOpen: false,
        isDocumentPanelActionOpen: false,
        documnetUrl: "",
        isRelod: false
    });

    const tooltipId = useId('tooltip');

    const onClickClose = () => {
    };

    const _onLinkClick = (item: PivotItem): void => {
        if (item.props.itemKey == "Safety Culture") {
        }
        setselectedKey(item.props.itemKey);
    };

    return <>

        {isLoading && <Loader />}

        <div className={(!!props.siteMasterId || props.isZoneView) ? "" : "boxCard"}>
            {(!props.siteMasterId && !props?.isZoneView) && <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                    <h1 className="mainTitle">Quaysafe</h1>
                </div>
            </div>}

            <div className='ms-Grid-row p-14 pmt-15 more-page-wrapper'>
                <div className='ms-md12 ms-sm12 ms-Grid-col'>
                    <div className='dashboard-card p00'>
                        <div className='card-header'></div>
                        <div className='height211 lightgrey2'>
                            <div className="Quaysafe-all-wrapper">
                                <Pivot aria-label="Basic Pivot Example"
                                    id="SCpivot" selectedKey={selectedKey}
                                    overflowBehavior={'menu'}

                                    onLinkClick={_onLinkClick}>
                                    <PivotItem headerText="Toolbox Talk" itemKey="ToolboxTalk">
                                        <div className="">
                                            <ListToolboxTalk
                                                loginUserRoleDetails={props.componentProp.loginUserRoleDetails}
                                                provider={props.provider}
                                                context={props.context}
                                                isAddNewHelpDesk={props.componentProp.isAddNewSite}
                                                manageComponentView={props.manageComponentView}
                                                originalState={props.originalState}
                                                siteMasterId={props.componentProp.siteMasterId}
                                                breadCrumItems={props.componentProp.breadCrumItems || []}
                                                componentProps={props.componentProp}
                                                originalSiteMasterId={props.componentProp.originalSiteMasterId}
                                                isNotGeneral={true}
                                                view={props.view}
                                                qCStateId={props?.qCStateId}
                                                selectedZoneDetails={props.selectedZoneDetails}
                                            />
                                        </div>
                                    </PivotItem>
                                    <PivotItem headerText="Incident Report" itemKey="ToolboxIncident">
                                        <div className=''>
                                            <div className="">
                                                <ListToolboxIncident
                                                    loginUserRoleDetails={props.componentProp.loginUserRoleDetails}
                                                    provider={props.provider}
                                                    context={props.context}
                                                    isAddNewHelpDesk={props.componentProp.isAddNewSite}
                                                    manageComponentView={props.manageComponentView}
                                                    siteMasterId={props.componentProp.siteMasterId}
                                                    breadCrumItems={props.componentProp.breadCrumItems || []}
                                                    componentProps={props.componentProp}
                                                    originalState={props.originalState}
                                                    originalSiteMasterId={props.siteMasterId}
                                                    isNotGeneral={true}
                                                    view={props.view}
                                                    qCStateId={props?.qCStateId}
                                                    selectedZoneDetails={props.selectedZoneDetails}
                                                />
                                            </div>
                                        </div>
                                    </PivotItem>
                                    <PivotItem headerText={HazardEnum.HazardReportTitle} itemKey="HazardReport">
                                        <div className=''>
                                            <ListHazardReport
                                                loginUserRoleDetails={props.componentProp.loginUserRoleDetails}
                                                provider={props.provider}
                                                context={props.context}
                                                manageComponentView={props.manageComponentView}
                                                siteMasterId={props.componentProp.siteMasterId}
                                                breadCrumItems={props.componentProp.breadCrumItems || []}
                                                componentProps={props.componentProp}
                                                view={props.view}
                                                isNotGeneral={true}
                                                selectedZoneDetails={props.selectedZoneDetails}
                                            />
                                        </div>

                                    </PivotItem>
                                    <PivotItem headerText="Skill Matrix" itemKey="SkillMatrix">
                                        <div className="">
                                            <ListSkillMatrix
                                                loginUserRoleDetails={props.componentProp.loginUserRoleDetails}
                                                provider={props.provider}
                                                context={props.context}
                                                originalState={props.originalState}
                                                isAddNewHelpDesk={props.componentProp.isAddNewSite}
                                                manageComponentView={props.manageComponentView}
                                                siteMasterId={props.componentProp.siteMasterId}
                                                breadCrumItems={props.componentProp.breadCrumItems || []}
                                                componentProps={props.componentProp}
                                                originalSiteMasterId={props.componentProp.originalSiteMasterId}
                                                isNotGeneral={true}
                                                view={props.view}
                                                qCStateId={props?.qCStateId}
                                                selectedZoneDetails={props.selectedZoneDetails}
                                            />
                                        </div>
                                    </PivotItem>
                                    <PivotItem headerText="Workplace Inspection Checklist" itemKey="WorkplaceInspection">
                                        <div className="">
                                            <ListWorkplaceInspection
                                                loginUserRoleDetails={props.componentProp.loginUserRoleDetails}
                                                provider={props.provider}
                                                context={props.context}
                                                originalState={props.originalState}
                                                isAddNewHelpDesk={props.componentProp.isAddNewSite}
                                                manageComponentView={props.manageComponentView}
                                                siteMasterId={props.componentProp.siteMasterId}
                                                breadCrumItems={props.componentProp.breadCrumItems || []}
                                                componentProps={props.componentProp}
                                                originalSiteMasterId={props.componentProp.originalSiteMasterId}
                                                isNotGeneral={true}
                                                view={props.view}
                                                qCStateId={props?.qCStateId}
                                                selectedZoneDetails={props.selectedZoneDetails}
                                            />
                                        </div>
                                    </PivotItem>
                                    <PivotItem headerText="Corrective Action Report" itemKey="CorrectiveActionReport">
                                        <div className=''>
                                            <div className="">
                                                <ListCorrectiveActionReport
                                                    loginUserRoleDetails={props.componentProp.loginUserRoleDetails}
                                                    provider={props.provider}
                                                    context={props.context}
                                                    isAddNewHelpDesk={props.componentProp.isAddNewSite}
                                                    manageComponentView={props.manageComponentView}
                                                    siteMasterId={props.componentProp.siteMasterId}
                                                    breadCrumItems={props.componentProp.breadCrumItems || []}
                                                    componentProps={props.componentProp}
                                                    originalState={props.originalState}
                                                    originalSiteMasterId={props.siteMasterId}
                                                    isNotGeneral={true}
                                                    view={props.view}
                                                    qCStateId={props?.qCStateId}
                                                    selectedZoneDetails={props.selectedZoneDetails}
                                                />
                                            </div>
                                        </div>
                                    </PivotItem>
                                    <PivotItem headerText="WHS Committee Inspection" itemKey="SiteSafetyAudit">
                                        <div className="">
                                            <ListSiteSafetyAudit
                                                loginUserRoleDetails={props.componentProp.loginUserRoleDetails}
                                                provider={props.provider}
                                                context={props.context}
                                                isAddNewHelpDesk={props.componentProp.isAddNewSite}
                                                manageComponentView={props.manageComponentView}
                                                originalState={props.originalState}
                                                siteMasterId={props.componentProp.siteMasterId}
                                                breadCrumItems={props.componentProp.breadCrumItems || []}
                                                componentProps={props.componentProp}
                                                originalSiteMasterId={props.componentProp.originalSiteMasterId}
                                                isNotGeneral={true}
                                                view={props.view}
                                                qCStateId={props?.qCStateId}
                                            />
                                        </div>
                                    </PivotItem>
                                    {(props.siteName === CommonConstSiteName.TheUniversityofQueensland || props.siteName === CommonConstSiteName.SydneyShowground) &&
                                        <PivotItem headerText="Induction" itemKey="Induction">
                                            <div className=''>
                                                <div className="">
                                                    <ListInduction
                                                        loginUserRoleDetails={props.componentProp.loginUserRoleDetails}
                                                        provider={props.provider}
                                                        context={props.context}
                                                        isAddNewHelpDesk={props.componentProp.isAddNewSite}
                                                        manageComponentView={props.manageComponentView}
                                                        siteMasterId={props.componentProp.siteMasterId}
                                                        breadCrumItems={props.componentProp.breadCrumItems || []}
                                                        componentProps={props.componentProp}
                                                        originalState={props.originalState}
                                                        originalSiteMasterId={props.siteMasterId}
                                                        isNotGeneral={true}
                                                        view={props.view}
                                                        siteName={props.siteName}
                                                        qCStateId={props?.qCStateId}
                                                    />
                                                </div>
                                            </div>
                                        </PivotItem>}
                                    <PivotItem headerText="WHS Committee Meeting" itemKey="WHSCommitteeMeeting">
                                        <div className="">
                                            <WHSMeetingGrid
                                                loginUserRoleDetails={props.componentProp.loginUserRoleDetails}
                                                provider={props.provider}
                                                context={props.context}
                                                isAddNewHelpDesk={props.componentProp.isAddNewSite}
                                                manageComponentView={props.manageComponentView}
                                                originalState={props.originalState}
                                                siteMasterId={props.componentProp.siteMasterId}
                                                breadCrumItems={props.componentProp.breadCrumItems || []}
                                                componentProps={props.componentProp}
                                                originalSiteMasterId={props.componentProp.originalSiteMasterId}
                                                isNotGeneral={true}
                                                qCStateId={props?.qCStateId}
                                            />
                                        </div>
                                    </PivotItem>
                                    <PivotItem headerText="WHS Committee Agenda" itemKey="WHSCommitteeAgenda">
                                        <div className="">
                                            <WHSMeetingAgendaGrid
                                                loginUserRoleDetails={props.componentProp.loginUserRoleDetails}
                                                provider={props.provider}
                                                context={props.context}
                                                isAddNewHelpDesk={props.componentProp.isAddNewSite}
                                                manageComponentView={props.manageComponentView}
                                                originalState={props.originalState}
                                                siteMasterId={props.componentProp.siteMasterId}
                                                breadCrumItems={props.componentProp.breadCrumItems || []}
                                                componentProps={props.componentProp}
                                                originalSiteMasterId={props.componentProp.originalSiteMasterId}
                                                isNotGeneral={true}
                                                qCStateId={props?.qCStateId}
                                            />
                                        </div>
                                    </PivotItem>
                                    {/* <PivotItem headerText="Quaysafe News" itemKey="IMSNews">

                                        <div className="mt-10">
                                            <div className="ms-Grid">
                                                <div className="ms-Grid-row">
                                                    <div className="">
                                                        <div className="formGroup dflex mt-3">
                                                            <PrimaryButton
                                                                className="btn btn-primary ml-10"
                                                                text="Quaysafe News"
                                                                onClick={() => {
                                                                    const IMSDshboardPageLink = `${props.context.pageContext.web.absoluteUrl}/SitePages/QuaysafeDashboard.aspx`;
                                                                    window.open(IMSDshboardPageLink, '_blank');
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>

                                    </PivotItem> */}

                                    {/* {(currentUserRoleDetail.isAdmin && currentUserRoleDetail.isSiteManager) && ( */}
                                    {/* {(!props.PivotData || (!!props?.PivotData && props.PivotData?.eLearning !== "No")) && (
                                        <PivotItem headerText={WasteReportPivot.QCeLEarning} itemKey={WasteReportPivot.QCeLEarning}>
                                            <QCeLearningLink
                                                siteMasterId={props.siteMasterId}
                                            />
                                        </PivotItem>
                                    )} */}

                                </Pivot>
                            </div >
                        </div>
                    </div>
                </div>
            </div >
        </div>
    </>;
};