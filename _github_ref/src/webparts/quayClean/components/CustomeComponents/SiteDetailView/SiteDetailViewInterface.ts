import { ICustomPeoplePicker } from "../WHSForms/IAddWHSMeetingFroms";

export interface ISiteDetailViewItems {
    SitesMasterDetails: ISitesMasterDetails;
    AssetMaster: IAssetMaster;
    SitesAssociatedChemical: ISitesAssociatedChemical;
    URLLink: { totalCount: number };
    DocumentsLink: { totalCount: number };
    SiteDocuments: { totalCount: number };
    SitesAssociatedTeam: { totalCount: number, atRoleGroup: [], all: any[] };
    summeryDetail: { reportDate: string, generatedBy: string };
    dateRange: { startDate: string; endDate: string; }
    ToolboxTalk: IQuaySafeTab;
    ToolboxIncident: IQuaySafeTab;
    SkillMatrix: IQuaySafeTab;
    CorrectiveActionReport: IQuaySafeTab;
    WorkplaceInspectionChecklist: IQuaySafeTab;
    SiteSafetyAudit: IQuaySafeTab;
    WHSCommitteeMeeting: { totalCount: number };
    WHSCommitteeMeetingAgenda: { totalCount: number };
    Periodic: { totalCount: number };
    JobControlChecklistDetails: { totalCount: number, notYetCheckedCount: number };
    EventMaster: { totalCount: number, eventDateTimeCount: number };
    ClientResponse: { totalCount: number };
    HelpDesk: { totalCount: number, lowCount: number, highCount: number, pendingCount: number, mediumCount: number };
    AuditInspectionData: { totalCount: number, averageScore: string, lowScore: string, highScore: string, OwnerCount: any };
    // Date Range Property
    URLLinkDateRange: { totalCount: number };
    DocumentsLinkDateRange: { totalCount: number };
    SiteDocumentsDateRange: { totalCount: number };
    SitesAssociatedTeamDateRange: { totalCount: number, atRoleGroup: [], all: any[] };
    AssetMasterDateRange: IAssetMaster;
    SitesAssociatedChemicalDateRange: ISitesAssociatedChemical;
    ToolboxTalkDateRange: IQuaySafeTab;
    ToolboxIncidentDateRange: IQuaySafeTab;
    SkillMatrixDateRange: IQuaySafeTab;
    CorrectiveActionReportDateRange: IQuaySafeTab;
    WorkplaceInspectionChecklistDateRange: IQuaySafeTab;
    SiteSafetyAuditDateRange: IQuaySafeTab;
    WHSCommitteeMeetingDateRange: { totalCount: number };
    WHSCommitteeMeetingAgendaDateRange: { totalCount: number };
    PeriodicDateRange: { totalCount: number };
    JobControlChecklistDetailsDateRange: { totalCount: number, notYetCheckedCount: number };
    EventMasterDateRange: { totalCount: number, eventDateTimeCount: number };
    ClientResponseDateRange: { totalCount: number };
    HelpDeskDateRange: { totalCount: number, lowCount: number, highCount: number, pendingCount: number, mediumCount: number };
    AuditInspectionDataDateRange: { totalCount: number, averageScore: string, lowScore: string, highScore: string, OwnerCount: any };



}





export interface IQuaySafeTab {
    totalCount: number;
    submittedCount: number;
    draftCount: number;
}

export interface ISitesMasterDetails {
    name: string;
    state: string;
    category: string;
    lastReportGeneratedDate: any;
    whoGenerated: any;
    siteManager: ICustomPeoplePicker[];
    siteSupervisor: ICustomPeoplePicker[];
    adClient: ICustomPeoplePicker[];
    siteManagerId: number[];
    siteSupervisorId: number[];
    adClientId: number[];
    totalMember: number;
    periodic: boolean;
    helpDeskNeeded: boolean;
    clientResponse: boolean;
    jobControlChecklist: boolean;
    manageEvents: boolean;
    ssWasteReport: boolean;
    amenitiesFeedbackForm: boolean;
    isDailyCleaningDuties: boolean;
    dynamicSiteManagerId: number;
    dynamicSiteManager: ICustomPeoplePicker;
}


export interface ISitesMasterGridDetails {
    ID: number;
    jobCode: any;
    name: string;
    state: string;
    category: string;
    lastReportGeneratedDate: any;
    whoGenerated: any;
    siteManager: ICustomPeoplePicker[];
    siteSupervisor: ICustomPeoplePicker[];
    adClient: ICustomPeoplePicker[];
    siteManagerId: number[];
    siteSupervisorId: number[];
    adClientId: number[];
    totalMember: number;
    periodic: boolean;
    helpDeskNeeded: boolean;
    clientResponse: boolean;
    jobControlChecklist: boolean;
    manageEvents: boolean;
    ssWasteReport: boolean;
    amenitiesFeedbackForm: boolean;
    isDailyCleaningDuties: boolean;
    AssetMaster: IAssetMaster;
    SitesAssociatedChemical: ISitesAssociatedChemical;
    ToolboxTalk: IQuaySafeTab;
    ToolboxIncident: IQuaySafeTab;
    SkillMatrix: IQuaySafeTab;
    CorrectiveActionReport: IQuaySafeTab;
    WorkplaceInspectionChecklist: IQuaySafeTab;
    SiteSafetyAudit: IQuaySafeTab;
    WHSCommitteeMeetingAgenda: { totalCount: number };
    WHSCommitteeMeeting: { totalCount: number };
    Periodic: { totalCount: number };
    JobControlChecklistDetails: { totalCount: number, notYetCheckedCount: number }
    EventMaster: { totalCount: number, eventDateTimeCount: number };
    SitesAssociatedTeam: { totalCount: number, atRoleGroup: any[], };
    URLLink: { totalCount: number };
    DocumentsLink: { totalCount: number };
    SiteDocuments: { totalCount: number };
    HelpDesk: { totalCount: number, lowCount: number, highCount: number, pendingCount: number, mediumCount: number };
    ClientResponse: { totalCount: number };
    AuditInspectionData: { totalCount: number, averageScore: any, lowScore: any, highScore: any, OwnerCount: any };
    dynamicSiteManagerId: number;
    dynamicSiteManager: ICustomPeoplePicker;
}


export interface IAssetMaster {
    totalAssetsCount: number;
    repairsRequiredCount: number;
    overdueServicesCount: number;
    serviceDueCountOneMonth: number;
    assetValue: number;
}

export interface ISitesAssociatedChemical {
    totalChemicalCount: number;
    expiringSoonCount: number;
    expiredCount: number;
    hazardousCount: number;
    nonHazardousCount: number;
}


export interface ISiteDetailGridData {
    ID: number;
    JobCode: string;

}

export interface ICards {
    blankSiteManagerCount: number;
    blankSiteSuperVisorCount: number;
    blankClient: number;
    blankAssetCount: number;
    blankChemicalCount: number;
    totalCount: number
}

export interface IConfigurationColumn {
    label: string;
    value: boolean;
    display?: string;
    parent?: string;
    disable?: boolean;
    isParent?: boolean
}