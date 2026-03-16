import * as React from "react";
import { IQuayCleanState } from "../QuayClean";
import { ComponentNameEnum, QueryStringForms } from "../../../../Common/Enum/ComponentNameEnum";
import { ViewSite } from "./Site/ViewSite";
import { Chemicals } from "./Chemicals";
import { News } from "./News";
import { HelpDeskForm } from "./HelpDesk/HelpDeskForm";
import { ChemicalMaster } from "./ChemicalManagement/ChemicalMaster";
import { AddNewChemical } from "./ChemicalManagement/AddNewChemical";
import { HelpDeskList } from "./HelpDesk/HelpDeskList";
import { ClientResponseForm } from "./ClientResponse/ClientResponseForm";
import { ManagePeriodicList } from "./Preodic/ManagePeriodicList";
import { ManagePeriodicForm } from "./Preodic/ManagePeriodicForm";
import { AssetDetails } from "./Asset/AssetDetails";
import { ClientResponseList } from "./ClientResponse/ClientResponseList";
import { ClientResponseView } from "./ClientResponse/ClientResponseView";
import { AddNewSite } from "./AddSite/AddNewSite";
import { ViewChemicalDetail } from "./ChemicalManagement/ViewChemicalDetail";
import { DashBoard } from "./DashBoard";
import { AssetList } from "./Asset/AssetList";
import { AssociatedChemicalMaster } from "./ChemicalManagement/AssociatedChemicalMaster";
import { HelpDeskDetailView } from "./HelpDesk/HelpDeskDetailView";
import { AddNewAsset } from "./Asset/AddNewAsset";
import { PeriodicDetails } from "./Preodic/PeriodicDetails";
import { AddNewPeriodic } from "./Preodic/AddNewPeriodic";
import AccessDenied from "../CommonComponents/AccessDenied";
import { AuditReports } from "./AuditReport/AuditReports";
import { Client } from "./Client/Client";
import { AddClient } from "./Client/AddClient";
import { Question } from "./EquipmentChecklist/Question";
import { AddQuestion } from "./EquipmentChecklist/AddQuestion";
import { AssetTypeMaster } from "./EquipmentChecklist/AssetTypeMaster";
import { AddAssetTypeMaster } from "./EquipmentChecklist/AddAssetTypeMaster";
import { Inspectionlist } from "./SafetyCulture/Inspection";
import { UpdateQRCode } from "./QRCode/UpdateQRCode";
import { DailyOperatorChecklist } from "./CheckList/DailyOperatorChecklist";
import { JobControlChecklist } from "./JobControlChecklist/JobControlChecklist";
import { AddJobControlChecklist } from "./JobControlChecklist/AddJobControlChecklist";
import { ViewJobControlChecklist } from "./CheckList/ViewJobControlChecklist";
import { AssociateJobControlChecklist } from "./JobControlChecklist/AssociateJobControlChecklist";
import { PDFViewJobControlChecklist } from "./JobControlChecklist/PDFViewJobControlChecklist";
import { AddToolboxTalk } from "./IMS/ToolboxTalk/AddToolboxTalk";
import { ListToolboxTalk } from "./IMS/ToolboxTalk/ListToolboxTalk";
import { DetailToolboxTalk } from "./IMS/ToolboxTalk/DetailToolboxTalk";
import { AddToolboxIncident } from "./IMS/ToolboxIncident/AddToolboxIncident";
import { ListToolboxIncident } from "./IMS/ToolboxIncident/ListToolboxIncident";
import { DetailToolboxIncident } from "./IMS/ToolboxIncident/DetailToolboxIncident";
import { ListSkillMatrix } from "./IMS/SkillMatrix/ListSkillMatrix";
import { AddSkillMatrix } from "./IMS/SkillMatrix/AddSkillMatrix";
import { DetailSkillMatrix } from "./IMS/SkillMatrix/DetailSkillMatrix";
import { AddWorkplaceInspection } from "./IMS/WorkplaceInspection/AddWorkplaceInspection";
import { DetailWorkplaceInspection } from "./IMS/WorkplaceInspection/DetailWorkplaceInspection";
import { ListWorkplaceInspection } from "./IMS/WorkplaceInspection/ListWorkplaceInspection";
import { AddCorrectiveActionReport } from "./IMS/CorrectiveActionReport/AddCorrectiveActionReport";
import { ListCorrectiveActionReport } from "./IMS/CorrectiveActionReport/ListCorrectiveActionReport";
import { DetailCorrectiveActionReport } from "./IMS/CorrectiveActionReport/DetailCorrectiveActionReport";
import { SkillMatrixs } from "./IMS/SkillMatrix/inlineEditing/SkillMatrixs";
import { IMS } from "./IMS/IMS";
import { AssociateChemical } from "./ChemicalManagement/AssociateChemical";
import { IQuayCleanProps } from "../IQuayCleanProps";
import { appGlobalStateAtom } from "../../../../jotai/appGlobalStateAtom";
import { selectedZoneAtom } from "../../../../jotai/selectedZoneAtom";
import { useAtom } from "jotai";
import { HeaderComponent } from "../CommonComponents/HeaderComponent";
import { AssignedTeam } from "./AssignTeam/AssignedTeam";
import { DocumentsLib } from "./ChemicalManagement/DocumentsLib";
import { SafetyCultureReport } from "../CommonComponents/Chart/ChartInspectionData";
import { MasterReport } from "../CommonComponents/Chart/MasterReport";
import { Events } from "./Events/Events";
import { AddInduction } from "./IMS/Induction/AddInduction";
import { DetailInduction } from "./IMS/Induction/DetailInduction";
import { ListSiteSafetyAudit } from "./IMS/SiteSafetyAudit/ListSiteSafetyAudit";
import { AddSiteSafetyAudit } from "./IMS/SiteSafetyAudit/AddSiteSafetyAudit";
import { DetailSiteSafetyAudit } from "./IMS/SiteSafetyAudit/DetailSiteSafetyAudit";
import { WHSMeetingDetail } from "./WHSForms/WHSMeetingDetail";
import { UserActivityLog } from "./UserActivityLog";
import { HelpDeskInLineEdit } from "./HelpDesk/HelpDeskInLineEdit";
import { WHSMeetingGrid } from "./WHSForms/WHSMeetingGrid";
import { ManageSites } from "./ManageSites/ManageSites";
import { ExportListSchema } from "../CommonComponents/ExportListSchema";
import { ManageSitesCrud } from "./ManageSites/Groups/ManageSitesCrud/ManageSitesCrud";
import { AddPeriodicInlineEdit } from "./Preodic/AddPeriodicInlineEdit";
import { ManageUserDetails } from "./ManageSites/Users/Details/ManageUserDetails";
import { AddClientResponseInlineEdit } from "./ClientResponse/AddClientResponseInlineEdit";
import { Employee } from "./Employee/ListEmployee";
import { AddEmployee } from "./Employee/AddEmployee";
import { Documentation } from "../CommonComponents/Documantation";
import { WHSMeetingAgendaGrid } from "./WHSMeetingAgenda/WHSMeetingAgendaGrid";
import { Reports } from "./Reports/Reports";
import { SynergySessions } from "./Synergy Sessions/SynergySessions";
import { PoliciesandProcedures } from "./Synergy Sessions/PoliciesandProcedures";
import { GlobalAssetsList } from "./GlobalAsset/GlobalAssetsList";
import { AddGlobalAsset } from "./GlobalAsset/AddGlobalAsset";
import { ViewMasterAssetDetails } from "./Asset/ViewMasterAssetDetails";
import { ViewEOMChecklist } from "./CheckList/ViewEOMChecklist";
import { AssociateEOMChecklist } from "./JobControlChecklist/AssociateEOMChecklist";
import { PDFViewEOMChecklist } from "./JobControlChecklist/PDFViewEOMChecklist";
import { MicrokeeperDocumantation } from "../CommonComponents/MicrokeeperDocumantation";
import { SystemUsageReport } from "./SystemUsageReport/SystemUsageReport";
import SiteDetailView from "./SiteDetailView/SiteDetailView";
import { SiteDetailGrid } from "./SiteDetailView/SiteDetailGrid/SiteDetailGrid";
import { ViewHazardFormDetail } from "./IMS/HazardReport/ViewHazardFormDetail";
import { HazardChartDashboard } from "./IMS/HazardReportCharts/HazardChartDashboard";
import { ClientResponseIssueList } from "./QRClientResponse/ClientResponseIssueList";
import { ViewClientResponseFormDetail } from "./QRClientResponse/IssuesList/ViewClientResponseFormDetail";
import { ListCRIssues } from "./QRClientResponse/IssuesList/ListCRIssues";
import { LatestViewSite } from "./Site/LatestViewSite";
import { ZoneViceSiteDetails } from "./AddSite/ZoneViceSiteDetails";
import { ISelectedZoneDetails } from "../../../../Interfaces/ISelectedZoneDetails";
import { EquipmentAsset } from "./Asset/EquipmentAsset";
import { ClientResponseChartDashboard } from "./ClientResponseCharts/ClientResponseChartDashboard";
import { isSiteLevelComponentAtom } from "../../../../jotai/isSiteLevelComponentAtom";

const selectedZoneDetails: any = {
    selectedSitesId: [],
    selectedSites: [
        { Id: 1, QCStateId: 7, SiteName: "Sydney Showground", State: "NSW" },
        { Id: 2, QCStateId: 6, SiteName: "Melbourne Cricket Ground", State: "QLD" },
        { Id: 3, QCStateId: 9, SiteName: "Sydney Showground", State: "VIC" },
    ]
};


export interface ICompomentContainerProps {
    appProps: IQuayCleanProps;
    componentProps: IQuayCleanState;
    manageComponentView(componentProp: IQuayCleanState): any;
    loadComponent?: (_componentName: string, _prevComponentName?: string, itemId?: number) => void;
    componentName: string;
    prevComponentName: string;
    onClickNav(currentNave: string, id: string): any;
}

export const CompomentContainer = (props: ICompomentContainerProps) => {
    const { componentProps, appProps, manageComponentView, onClickNav } = props;
    const [isForm, setIsForm] = React.useState<boolean>(false);
    const [appGlobalState, setAppGlobalState] = useAtom(appGlobalStateAtom);
    const [, setSelectedZoneObj] = useAtom(selectedZoneAtom);
    const [, setIsSiteLevelComponent] = useAtom(isSiteLevelComponentAtom);
    const { provider, context, adQuery, cdQuery } = appGlobalState;
    React.useEffect(() => {
        if (!!adQuery && !!adQuery) {
            props.manageComponentView({ currentComponentName: ComponentNameEnum.AssetDetails, siteMasterId: adQuery.siteMasterId });
            props.onClickNav("Assets", "assets");
        }
        if (!!cdQuery) {
            props.manageComponentView({ currentComponentName: ComponentNameEnum.ViewChemicalDetail, siteMasterId: cdQuery.siteMasterId });
            props.onClickNav("Chemicals", "chemicals");
        }
        if (!!props?.appProps?.compNameQuery) {
            let name = props.appProps.compNameQuery
            setIsForm(true);
        }
    }, []);
    // const onClickAccesLocation = () => {
    //     SetState((prevState: any) => ({
    //         ...prevState,
    //         isAssetLocationOpen: true,
    //         isReload: !prevState.isReload
    //     }));
    // };
    React.useEffect(() => {
        if (props?.appProps?.compNameQuery) {
            if (props.appProps.compNameQuery.toLowerCase() == QueryStringForms.ToolboxTalk) {
                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddToolboxTalk });
            } else if (props.appProps.compNameQuery.toLowerCase() == QueryStringForms.ToolboxIncident) {
                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddToolboxIncident });
            } else if (props.appProps.compNameQuery.toLowerCase() == QueryStringForms.SiteSafetyAudit) {
                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddSiteSafetyAudit });
            } else if (props.appProps.compNameQuery.toLowerCase() == QueryStringForms.SkillMatrix) {
                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddSkillMatrix });
            } else if (props.appProps.compNameQuery.toLowerCase() == QueryStringForms.WorkplaceInspection) {
                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddWorkplaceInspection });
            } else if (props.appProps.compNameQuery.toLowerCase() == QueryStringForms.CorrectiveActionReport) {
                props.manageComponentView({ currentComponentName: ComponentNameEnum.AddCorrectiveActionReport });
            } else {
                props.manageComponentView({ currentComponentName: ComponentNameEnum.DashBoard });
            }
        }
    }, [props.appProps.compNameQuery]);

    React.useEffect(() => {
        const masterComponents = [
            ComponentNameEnum.AssetList,
            ComponentNameEnum.AssignedTeam,
            ComponentNameEnum.Quaysafe,
            ComponentNameEnum.ClientResponseList,
            ComponentNameEnum.HelpDeskList,
            ComponentNameEnum.ManagePeriodicList,
            ComponentNameEnum.ViewJobControlChecklist,
            ComponentNameEnum.AssociateChemical,
            ComponentNameEnum.WHSMeetingAgendaGrid,
            ComponentNameEnum.WHSCommitteeMeeting,
            ComponentNameEnum.WHSCommitteeInspection,
            ComponentNameEnum.ListCRIssues
        ];
        if (masterComponents.includes(componentProps.currentComponentName as any)) {
            setSelectedZoneObj(undefined);
            setIsSiteLevelComponent(false);
        }
    }, [componentProps.currentComponentName]);

    React.useEffect(() => {
        setAppGlobalState({
            ...appGlobalState,
            ...appProps,
            selectedZoneDetails: componentProps?.selectedZoneDetails || "" as any,
            componentName: componentProps.currentComponentName,
            currentUserRoleDetail: componentProps.loginUserRoleDetails,
            isClientView: appProps.isClientView,
            siteId: appProps.siteId,
            prevComponentName: ComponentNameEnum.DashBoard,
        });
    }, [appProps, componentProps.currentComponentName]);

    const currentFnComponent = () => {
        switch (componentProps.currentComponentName) {
            case ComponentNameEnum.AddNewSite:
                return <AddNewSite
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    componentProps={componentProps}
                    context={context}
                    isAddNewSite={componentProps.isAddNewSite}
                    isShowDetailOnly={componentProps.isShowDetailOnly}
                    manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    siteName={componentProps.siteName}
                    qCState={componentProps.qCState}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    pivotName={componentProps.pivotName}
                    componentProp={componentProps}
                    IsSupervisor={componentProps.IsSupervisor}
                    isZoneEdit={componentProps.isZoneEdit}
                    isZoneAddNewSite={componentProps.isZoneAddNewSite}
                />;

                break;
            case ComponentNameEnum.ZoneViceSiteDetails:
                return <ZoneViceSiteDetails
                    selectedZoneDetails={props?.componentProps?.selectedZoneDetails}
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    viewBy={props.componentProps.viewBy}
                    componentProps={componentProps}
                    context={context}
                    isShowDetailOnly={componentProps.isShowDetailOnly}
                    manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    siteName={componentProps.siteName}
                    qCState={componentProps.qCState}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    pivotName={componentProps.pivotName}
                    componentProp={componentProps}
                    IsSupervisor={componentProps.IsSupervisor}
                // loginUserRoleDetails={componentProps.loginUserRoleDetails}
                // provider={provider}
                // componentProps={componentProps}
                // context={context}
                // isShowDetailOnly={componentProps.isShowDetailOnly || true}
                // manageComponentView={manageComponentView}
                // siteMasterId={componentProps.siteMasterId || 542}
                // siteName={componentProps.siteName || "Melbourne Cricket Ground"}
                // qCState={componentProps.qCState || "VIC"}
                // breadCrumItems={componentProps.breadCrumItems || []}
                // pivotName={componentProps.pivotName}
                // componentProp={componentProps}
                // IsSupervisor={componentProps.IsSupervisor}
                />;

                break;

            case ComponentNameEnum.DashBoard:
                return <DashBoard
                    manageComponentView={manageComponentView}
                    onClickNav={props.onClickNav}
                    appProps={appProps}
                />;

                break;
            case ComponentNameEnum.HelpDeskForm:
                return <HelpDeskForm
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.AddClient:
                return <AddClient
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.AddEmployee:
                return <AddEmployee
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.AddQuestion:
                return <AddQuestion
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.AssociateJobControlChecklist:
                return <AssociateJobControlChecklist
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.AssociateEOMChecklist:
                return <AssociateEOMChecklist
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.PDFViewJobControlChecklist:
                return <PDFViewJobControlChecklist
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.PDFViewEOMChecklist:
                return <PDFViewEOMChecklist
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.AddToolboxTalk:
                return <AddToolboxTalk
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    isForm={isForm}
                    selectedZoneDetails={props?.componentProps?.selectedZoneDetails}
                    isZoneEdit={componentProps.isZoneEdit}
                />;
                break;
            case ComponentNameEnum.AddSiteSafetyAudit:
                return <AddSiteSafetyAudit
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    isForm={isForm}
                    isDirectView={componentProps.isDirectView}
                />;
                break;
            case ComponentNameEnum.AddInduction:
                return <AddInduction
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    isForm={isForm}
                />;
                break;
            case ComponentNameEnum.AddSkillMatrix:
                return <AddSkillMatrix
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    isNotGeneral={false}
                    isForm={isForm}
                    selectedZoneDetails={props?.componentProps?.selectedZoneDetails}
                />;
                break;
            case ComponentNameEnum.AddWorkplaceInspection:
                return <AddWorkplaceInspection
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    isForm={isForm}
                    selectedZoneDetails={props?.componentProps?.selectedZoneDetails}
                />;
                break;
            case ComponentNameEnum.ListToolboxTalk:
                return <ListToolboxTalk
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.ListSiteSafetyAudit:
                return <ListSiteSafetyAudit
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.ListWorkplaceInspection:
                return <ListWorkplaceInspection
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.ListSkillMatrix:
                return <ListSkillMatrix
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    isNotGeneral={false}
                />;
                break;
            case ComponentNameEnum.SkillMatrixs:
                return <SkillMatrixs
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    selectedZoneDetails={props?.componentProps?.selectedZoneDetails}
                />;
                break;
            case ComponentNameEnum.DetailToolboxTalk:
                return <DetailToolboxTalk
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.DetailSiteSafetyAudit:
                return <DetailSiteSafetyAudit
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    isDirectView={componentProps.isDirectView}
                />;
                break;
            case ComponentNameEnum.DetailWorkplaceInspection:
                return <DetailWorkplaceInspection
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.DetailSkillMatrix:
                return <DetailSkillMatrix
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    isNotGeneral={false}
                />;
                break;
            case ComponentNameEnum.AddJobControlChecklist:
                return <AddJobControlChecklist
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.AddAssetTypeMaster:
                return <AddAssetTypeMaster
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.HelpDeskList:
                return <HelpDeskList
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    manageComponentView={manageComponentView}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps} />;
                break;
            case ComponentNameEnum.AssignedTeam:
                return <AssignedTeam
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    IsSupervisor={componentProps.IsSupervisor}
                    qCState={componentProps.qCState}
                />;
                break;

            case ComponentNameEnum.ViewJobControlChecklist:
                return <ViewJobControlChecklist
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    manageComponentView={manageComponentView}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps} />;
                break;

            case ComponentNameEnum.ViewEOMChecklist:
                return <ViewEOMChecklist
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    manageComponentView={manageComponentView}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps} />;
                break;
            case ComponentNameEnum.HelpDeskDetailView:
                return <HelpDeskDetailView
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewProject={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.AssetList:
                // return <AssetList
                //     manageComponentView={manageComponentView}
                //     view={props?.componentProps?.view}
                //     breadCrumItems={componentProps.breadCrumItems || []} />;
                return (
                    <EquipmentAsset
                        isSiteInformationView={true}
                        isShowAssetLocationAccess={
                            componentProps.loginUserRoleDetails.isAdmin ||
                            componentProps.loginUserRoleDetails.isStateManager
                        }
                        // onClickAccesLocation={onClickAccesLocation}
                        loginUserRoleDetails={componentProps.loginUserRoleDetails}
                        breadCrumItems={componentProps.breadCrumItems || []}
                        provider={provider}
                        context={context}
                        manageComponentView={manageComponentView}
                        siteMasterId={componentProps.siteMasterId}
                        siteName={componentProps.siteName}
                        qCState={componentProps.qCState}
                        IsSupervisor={componentProps.IsSupervisor}
                        dataObj={componentProps?.dataObj}
                        componentProp={componentProps}

                    />
                );

                break;
            case ComponentNameEnum.Chemicals:
                return <Chemicals />;
                break;
            case ComponentNameEnum.ChemicalMaster:
                return <ChemicalMaster
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    manageComponentView={manageComponentView}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    IsMasterChemical={true}
                    view={props?.componentProps?.view}
                    context={context} />;
                break;
            case ComponentNameEnum.AddNewChemical:
                return <AddNewChemical
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewProject={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProp={props.componentProps}
                />;
                break;
            case ComponentNameEnum.ViewChemicalDetail:
                return <ViewChemicalDetail
                    provider={provider}
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    context={context}
                    isAddNewProject={componentProps.isAddNewSite}
                    manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    IsSupervisor={componentProps.IsSupervisor}
                    siteName={componentProps.siteName}
                    qCState={componentProps.qCState}
                    preViousCompomentName={componentProps.preViousComponentName}
                    componentProp={props.componentProps} />;

                break;
            case ComponentNameEnum.AssociatedChemicalMaster:
                return <AssociatedChemicalMaster
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    manageComponentView={manageComponentView}
                    context={context} />;
                break;
            case ComponentNameEnum.News:
                return <News provider={provider} loginUserRoleDetails={componentProps.loginUserRoleDetails} manageComponentView={manageComponentView} context={context} />;
                break;
            case ComponentNameEnum.AddNewAsset:
                return <AddNewAsset
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    dataObj={componentProps.dataObj}
                    siteMasterId={componentProps.siteMasterId}
                    context={context}
                    siteName={componentProps.siteName}
                    qCState={componentProps.qCState}
                    manageComponentView={manageComponentView}
                    componentProp={componentProps}

                />;
                break;
            case ComponentNameEnum.AddNewPeriodic:
                // return <AddNewPeriodic
                //     loginUserRoleDetails={componentProps.loginUserRoleDetails}
                //     provider={provider}
                //     dataObj={componentProps.dataObj}
                //     context={context}
                //     manageComponentView={manageComponentView}
                //     componentProp={componentProps}
                //     siteMasterId={componentProps.siteMasterId}
                // />;
                return <AddPeriodicInlineEdit
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    dataObj={componentProps.dataObj}
                    context={context}
                    manageComponentView={manageComponentView}
                    componentProp={componentProps}
                    siteMasterId={componentProps.siteMasterId}
                />;
                break;
            case ComponentNameEnum.AssetDetails:
                return <AssetDetails
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    IsSupervisor={componentProps.IsSupervisor}
                    siteMasterId={componentProps.siteMasterId}
                    manageComponentView={manageComponentView}
                    siteName={componentProps.siteName}
                    qCState={componentProps.qCState}
                    preViousCompomentName={componentProps.preViousComponentName}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProp={props.componentProps}
                    pivotName={componentProps.pivotName} />;
                break;
            case ComponentNameEnum.PeriodicDetails:
                return <PeriodicDetails
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    periodicData={componentProps.periodicData}
                    manageComponentView={manageComponentView}
                    preViousCompomentName={componentProps.preViousComponentName}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    siteMasterId={componentProps.siteMasterId}
                    componentProp={props.componentProps} />;
                break;
            case ComponentNameEnum.Documents:
                return <AuditReports
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider} manageComponentView={manageComponentView}
                    context={context} currentCompomentName={componentProps.currentComponentName}
                    siteName={componentProps.siteName}
                    componentProp={props.componentProps}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    isViewSiteDialog={false} />;
                break;

            // case ComponentNameEnum.ViewSite:
            //     return <ViewSite
            //         manageComponentView={manageComponentView}
            //         view={props?.componentProps?.view}
            //         breadCrumItems={componentProps.breadCrumItems || []}
            //         selectedADUsers={props?.componentProps?.viewSelectedADUsersFilter}
            //         selectedSiteTitles={props?.componentProps?.viewSelectedSiteTitlesFilter}
            //         selectedState={props?.componentProps?.viewSelectedStateFilter}
            //         selectedSiteManagers={props?.componentProps?.viewSelectedSiteManagersFilter}
            //         selectedSCSites={props?.componentProps?.viewSelectedSCSitesFilter}
            //         selectedSiteIds={props?.componentProps?.viewSelectedSiteIdsFilter}
            //     />;

            //     break;
            case ComponentNameEnum.ViewSite:
            case ComponentNameEnum.LatestViewSite:
                return <LatestViewSite
                    manageComponentView={manageComponentView}
                    viewBy={props.componentProps.viewBy}
                    view={props?.componentProps?.view}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    selectedADUsers={props?.componentProps?.viewSelectedADUsersFilter}
                    selectedSiteTitles={props?.componentProps?.viewSelectedSiteTitlesFilter}
                    selectedState={props?.componentProps?.viewSelectedStateFilter}
                    selectedSiteManagers={props?.componentProps?.viewSelectedSiteManagersFilter}
                    selectedSCSites={props?.componentProps?.viewSelectedSCSitesFilter}
                    selectedSiteIds={props?.componentProps?.viewSelectedSiteIdsFilter}

                />;

                break;
            case ComponentNameEnum.ClientResponseForm:
                return <AddClientResponseInlineEdit
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    dataObj={componentProps.dataObj}
                    context={context}
                    manageComponentView={manageComponentView}
                    componentProp={componentProps}
                    siteMasterId={componentProps.siteMasterId}
                />;
                // return <ClientResponseForm
                //     isAddNewClientResponse={componentProps.isAddNewSite}
                //     manageComponentView={manageComponentView}
                //     siteMasterId={componentProps.siteMasterId}
                //     breadCrumItems={componentProps.breadCrumItems || []}
                //     componentProps={props.componentProps}
                //     originalSiteMasterId={componentProps.originalSiteMasterId}
                //     view={props?.componentProps?.view}
                // />;


                break;
            case ComponentNameEnum.ClientResponseList:
                return <ClientResponseList
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    isAddNewClientResponse={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    view={props?.componentProps?.view}
                />;

                break;
            case ComponentNameEnum.ClientResponseView:
                return <ClientResponseView
                    provider={provider}
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    context={context}
                    isAddNewProject={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps} originalSiteMasterId={componentProps.originalSiteMasterId}
                    view={props?.componentProps?.view}
                />;

                break;
            case ComponentNameEnum.ManagePeriodicList:
                return <ManagePeriodicList
                    manageComponentView={manageComponentView}
                    componentProp={componentProps}
                    breadCrumItems={componentProps.breadCrumItems || []} />;

                break;
            case ComponentNameEnum.ManagePeriodicForm:
                return <ManagePeriodicForm loginUserRoleDetails={componentProps.loginUserRoleDetails} provider={provider} manageComponentView={manageComponentView} breadCrumItems={componentProps.breadCrumItems || []} />;
                break;
            case ComponentNameEnum.AccessDenied:
                return <AccessDenied />;
            case ComponentNameEnum.Inspection:
                return <Inspectionlist
                    siteName={componentProps.siteName}
                    siteView={false}
                    existingData={componentProps.existingData}
                />;
                break;
            case ComponentNameEnum.SafetyCultureReport:
                return <SafetyCultureReport
                    siteName={componentProps.siteName}
                    tab={"All"} />;
                break;
            case ComponentNameEnum.MasterReport:
                return <MasterReport
                    siteMasterId={componentProps.siteMasterId}
                />;
                break;
            case ComponentNameEnum.UpdateQr:
                return <UpdateQRCode
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    manageComponentView={manageComponentView}
                />;
                break;
            case ComponentNameEnum.Client:
                return <Client
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    manageComponentView={manageComponentView}
                    breadCrumItems={componentProps.breadCrumItems || []} />;
                break;
            case ComponentNameEnum.Employee:
                return <Employee
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    manageComponentView={manageComponentView}
                    breadCrumItems={componentProps.breadCrumItems || []} />;
                break;
            case ComponentNameEnum.Documentation:
                return <Documentation
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    manageComponentView={manageComponentView}
                    breadCrumItems={componentProps.breadCrumItems || []} />;
                break;
            case ComponentNameEnum.MicrokeeperDocumentation:
                return <MicrokeeperDocumantation
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    manageComponentView={manageComponentView}
                    breadCrumItems={componentProps.breadCrumItems || []} />;
                break;
            case ComponentNameEnum.JobControlChecklist:
                return <JobControlChecklist
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    manageComponentView={manageComponentView}
                    breadCrumItems={componentProps.breadCrumItems || []} />;
                break;
            case ComponentNameEnum.Question:
                return <Question
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    manageComponentView={manageComponentView}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    componentProps={props.componentProps}
                />;
                break;
            case ComponentNameEnum.UserActivityLog:
                return <UserActivityLog
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    manageComponentView={manageComponentView}
                    breadCrumItems={componentProps.breadCrumItems || []} />;
                break;
            case ComponentNameEnum.AssetTypeMaster:
                return <AssetTypeMaster
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    manageComponentView={manageComponentView}
                    breadCrumItems={componentProps.breadCrumItems || []} />;
                break;
            case ComponentNameEnum.AuditReport:
                return <AuditReports
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    manageComponentView={manageComponentView}
                    context={context}
                    currentCompomentName={componentProps.currentComponentName}
                    siteName={componentProps.siteName}
                    componentProp={props.componentProps}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    tab={"notab"}
                    isViewSiteDialog={false} />;
                break;
            case ComponentNameEnum.DocumentsLib:
                return <DocumentsLib
                    siteNameId={componentProps.siteMasterId}

                    manageComponentView={manageComponentView}
                    IsSupervisor={componentProps.IsSupervisor}
                    qCState={componentProps.qCState}
                    siteName={componentProps.siteName} />;
                break;
            case ComponentNameEnum.SynergySessions:
                return <SynergySessions
                    siteNameId={componentProps.siteMasterId}
                    manageComponentView={manageComponentView}
                    IsSupervisor={true}
                    siteView={false}
                    qCState={componentProps.qCState}
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    siteName={componentProps.siteName} />
                break;
            case ComponentNameEnum.PoliciesandProcedures:
                return <PoliciesandProcedures
                    siteNameId={componentProps.siteMasterId}
                    manageComponentView={manageComponentView}
                    IsSupervisor={true}
                    siteView={false}
                    qCState={componentProps.qCState}
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    siteName={componentProps.siteName} />
                break;
            case ComponentNameEnum.DailyOperatorChecklist:
                return <DailyOperatorChecklist
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    IsSupervisor={componentProps.IsSupervisor}
                    siteMasterId={componentProps.siteMasterId}
                    manageComponentView={manageComponentView}
                    siteName={componentProps.siteName}
                    qCState={componentProps.qCState}
                    preViousCompomentName={componentProps.preViousComponentName}
                    currentCompomentName={componentProps.currentComponentName}
                    componentProp={props.componentProps}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    checkListObj={componentProps.checkListObj}
                />
                break;
            case ComponentNameEnum.AddToolboxIncident:
                return <AddToolboxIncident
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    isForm={isForm}
                    selectedZoneDetails={props?.componentProps?.selectedZoneDetails}
                />
                break;
            case ComponentNameEnum.ListToolboxIncident:
                return <ListToolboxIncident
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}

                />;
                break;
            case ComponentNameEnum.DetailToolboxIncident:
                return <DetailToolboxIncident
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.AddCorrectiveActionReport:
                return <AddCorrectiveActionReport
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    isForm={isForm}
                    selectedZoneDetails={props?.componentProps?.selectedZoneDetails}
                />;
                break;
            case ComponentNameEnum.ListCorrectiveActionReport:
                return <ListCorrectiveActionReport
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;

            case ComponentNameEnum.AssociateChemical:
                return <AssociateChemical
                    manageComponentView={manageComponentView}
                    siteNameId={componentProps.siteMasterId}
                    qCState={componentProps.qCState}
                    siteName={componentProps.siteName}
                    IsSupervisor={componentProps.IsSupervisor}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    dataObj={componentProps.dataObj}
                // siteMasterId={componentProps.siteMasterId}
                />;
                break;
            case ComponentNameEnum.Events:
                return <Events
                    manageComponentView={manageComponentView}
                    qCState={componentProps.qCState}
                    siteName={componentProps.siteName}
                    IsSupervisor={componentProps.IsSupervisor}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    dataObj={componentProps.dataObj}
                    siteMasterId={componentProps.siteMasterId}
                    provider={provider}
                    context={context}
                    componentProp={props.componentProps}
                    loginUserRoleDetails={componentProps.loginUserRoleDetails} />;
                break;

            case ComponentNameEnum.DetailCorrectiveActionReport:
                return <DetailCorrectiveActionReport
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.DetailInduction:
                return <DetailInduction
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.Quaysafe:
                return <IMS
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProp={props.componentProps}
                    dataObj={componentProps.dataObj}
                    subpivotName={""}
                    originalState={""}
                    siteName={""}
                    qCState={componentProps.qCState}
                    IsSupervisor={componentProps.IsSupervisor}
                />;
                break;
            case ComponentNameEnum.WHSMeetingDetail:
                return <WHSMeetingDetail
                    isWHSMeetingAgenda={componentProps.isWHSMeetingAgenda}
                    isDirectView={componentProps.isDirectView}
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    whsMasterId={props.componentProps.whsMasterId || 0}
                />;
                break;
            case ComponentNameEnum.HelpDeskInLieEdit:
                return <HelpDeskInLineEdit
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    editItemId={componentProps.helpDeskEditItemId}
                    isEditMultiple={!!componentProps.helpDeskEditItemId && componentProps.helpDeskEditItemId.length > 0 ? true : false}
                    isAddNewHelpDesk={componentProps.isAddNewSite} manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.WHSCommitteeMeeting:
                return <WHSMeetingGrid
                    isDirectView={true}
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite}
                    manageComponentView={props.manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    isNotGeneral={true}
                />
                break;

            case ComponentNameEnum.WHSMeetingAgendaGrid:
                return <WHSMeetingAgendaGrid
                    isDirectView={true}
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite}
                    manageComponentView={props.manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    isNotGeneral={true}
                />
            case ComponentNameEnum.WHSCommitteeInspection:
                return <ListSiteSafetyAudit
                    isDirectView={true}
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    isAddNewHelpDesk={componentProps.isAddNewSite}
                    manageComponentView={props.manageComponentView}
                    originalState={""}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                    isNotGeneral={true}

                />
                break;
            case ComponentNameEnum.ManageSites:
                return <ManageSites manageComponentView={props.manageComponentView} selectedKey={componentProps.selectedKey} />
                break;
            case ComponentNameEnum.ExportListSchema:
                return <ExportListSchema />
                break;
            case ComponentNameEnum.ManageUserDetails:
                return <ManageUserDetails data={componentProps.manageSiteUserItem} manageComponentView={props.manageComponentView} />
                break;
            case ComponentNameEnum.ManageSitesCrud:
                return <ManageSitesCrud isGroupViewPage={componentProps.isGroupViewPage} siteMasterId={componentProps.originalSiteMasterId} manageComponentView={props.manageComponentView} />
                // return <SitesComponent />
                break;
            case ComponentNameEnum.Reports:
                return <Reports
                    siteMasterId={componentProps.siteMasterId}
                    siteDetail={undefined}
                    manageComponentView={manageComponentView} breadCrumItems={[]} originalSiteMasterId={undefined} componentProps={props?.componentProps?.view} />
                // return <SitesComponent />
                break;
            case ComponentNameEnum.GlobalAssetsList:
                return <GlobalAssetsList
                    manageComponentView={manageComponentView}
                    view={props?.componentProps?.view}
                    breadCrumItems={componentProps.breadCrumItems || []} />;
                break;
            case ComponentNameEnum.AddGlobalAsset:
                return <AddGlobalAsset
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    manageComponentView={manageComponentView}
                    componentProp={componentProps}
                />;
                break;
            case ComponentNameEnum.ViewMasterAssetDetails:
                return <ViewMasterAssetDetails
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    IsSupervisor={componentProps.IsSupervisor}
                    masterAssetId={componentProps.masterAssetId}
                    manageComponentView={manageComponentView}
                    preViousCompomentName={componentProps.preViousComponentName}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProp={props.componentProps} />;
                break;
            case ComponentNameEnum.SystemUsageReport:
                return <SystemUsageReport loginUserRoleDetails={componentProps.loginUserRoleDetails} />;
                break;
            case ComponentNameEnum.SiteDetailView:
                return <SiteDetailView
                    siteMasterId={componentProps.siteMasterId || 0}
                    redirectFrom={componentProps.preViousComponentName}
                    manageComponentView={manageComponentView}
                    componentProps={componentProps}
                    dataObj={componentProps.dataObj}
                    siteName={componentProps.siteName}
                    IsSupervisor={componentProps.IsSupervisor}
                    qCState={componentProps.qCState}
                    MasterId={componentProps.MasterId}
                    qCStateId={componentProps.qCStateId}
                    componentProp={componentProps}
                    breadCrumItems={componentProps.breadCrumItems}

                />;
                break;
            case ComponentNameEnum.SiteDetailGrid:
                return <SiteDetailGrid
                    manageComponentView={manageComponentView}

                />;
                break;
            case ComponentNameEnum.ViewHazardFormDetail:
                return <ViewHazardFormDetail
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    manageComponentView={manageComponentView}
                    hazardFormId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.HazardChartDashboard:
                return <HazardChartDashboard loginUserRoleDetails={componentProps.loginUserRoleDetails} manageComponentView={manageComponentView} />;
                break;
            case ComponentNameEnum.ListCRIssues:
                return <ListCRIssues
                    manageComponentView={manageComponentView}
                    siteMasterId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    selectedZoneDetails={componentProps?.selectedZoneDetails}
                // qCState={componentProps.qCState} 
                />;
                break;
            case ComponentNameEnum.ViewClientResponseFormDetail:
                return <ViewClientResponseFormDetail
                    loginUserRoleDetails={componentProps.loginUserRoleDetails}
                    provider={provider}
                    context={context}
                    manageComponentView={manageComponentView}
                    responseFormId={componentProps.siteMasterId}
                    breadCrumItems={componentProps.breadCrumItems || []}
                    componentProps={props.componentProps}
                    originalSiteMasterId={componentProps.originalSiteMasterId}
                />;
                break;
            case ComponentNameEnum.ClientResponseChartDashboard:
                return <ClientResponseChartDashboard loginUserRoleDetails={componentProps.loginUserRoleDetails} manageComponentView={manageComponentView} componentProps={componentProps} />;
                break;
            default:
                break;

        }
    };
    return <>
        {provider !== undefined && <>
            {componentProps.currentComponentName != ComponentNameEnum.AccessDenied && isForm === false &&
                <HeaderComponent
                    isShowQRCode={appProps.isShowQRCode}
                    onClickNav={onClickNav}
                    componentProps={componentProps}
                    manageComponentView={manageComponentView}
                    isClientView={appProps.isClientView}
                    siteId={appProps.siteId}
                />
            }
            {currentFnComponent()}
        </>
        }
    </>;
};


