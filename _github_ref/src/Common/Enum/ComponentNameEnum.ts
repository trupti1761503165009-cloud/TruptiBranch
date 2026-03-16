import { WebPartContext } from "@microsoft/sp-webpart-base";
import {
  DateFormat,
  DateTimeFormate,
  PrintTypeName,
} from "../Constants/CommonConstants";
import { Environment, EnvironmentType } from "@microsoft/sp-core-library";

export const mainSiteURL = "https://quaycleandemo.tretainfotech.com/";
export const qaSiteURL = "https://quaycleanqa.tretainfotech.com/";
export const devSiteURL = "https://quaycleandemo.tretainfotech.com/";
export const updateQRUser: any[] = [
  "krunal.b.patel@treta.onmicrosoft.com".toLocaleLowerCase(),
  "Treta@quayclean.com.au".toLocaleLowerCase(),
];
export const qrcodeSiteURL = "https://www.quaycleanresources.com.au/";
export const qrcodeSiteURLNew = "https://www.quaycleanresources.com.au/";
export const stageSiteURLNew = "https://quaycleanqa.quaycleanresources.com.au/";

export enum ComponentNameEnum {
  AddNewSite = "AddNewSite",
  ProjectDetails = "ProjectDetails",
  ViewSite = "ViewSite",
  LatestViewSite = "LatestViewSite",
  ZoneViceSiteDetails = "ZoneViceSiteDetails",
  DashBoard = "DashBoard",
  HelpDeskForm = "HelpDeskForm",
  Chemicals = "Chemicals",
  News = "News",
  Documents = "Documents",
  AddNewAsset = "AddNewAsset",
  AssetDetails = "AssetDetails",
  ClientResponseForm = "ClientResponseForm",
  ClientResponseList = "ClientResponseList",
  ManagePeriodicList = "ManagePeriodicList",
  ChemicalMaster = "ChemicalMaster",
  AddNewChemical = "AddNewChemical",
  ViewChemicalDetail = "ViewChemicalDetail",
  HelpDeskList = "HelpDeskList",
  EquipmentAsset = "EquipmentAsset",
  ManagePeriodicForm = "ManagePeriodicForm",
  ClientResponseView = "ClientResponseView",
  AssetList = "AssetList",
  AssociatedChemicalMaster = "AssociatedChemicalMaster",
  HelpDeskDetailView = "HelpDeskDetailView",
  AssociateChemical = "AssociateChemical",
  PeriodicDetails = "PeriodicDetails",
  AddNewPeriodic = "AddNewPeriodic",
  NavigationLinks = "Navigation Links",
  AccessDenied = "AccessDenied",
  DocumentsLib = "DocumentsLib",
  UpdateQr = "UpdateQr",
  AuditReport = "AuditReport",
  Client = "Client",
  AddClient = "AddClient",
  Question = "Question",
  AddQuestion = "AddQuestion",
  AssetTypeMaster = "AssetTypeMaster",
  AddAssetTypeMaster = "AddAssetTypeMaster",
  Inspection = "Inspection",
  DailyOperatorChecklist = "DailyOperatorChecklist",
  JobControlChecklist = "JobControlChecklist",
  EOMChecklist = "EOMChecklist",
  AddJobControlChecklist = "AddJobControlChecklist",
  ViewJobControlChecklist = "ViewJobControlChecklist",
  AssociateJobControlChecklist = "AssociateJobControlChecklist",
  PDFViewJobControlChecklist = "PDFViewJobControlChecklist",
  AddToolboxTalk = "AddToolboxTalk",
  ListToolboxTalk = "ListToolboxTalk",
  DetailToolboxTalk = "DetailToolboxTalk",
  AddToolboxIncident = "AddToolboxIncident",
  ListToolboxIncident = "ListToolboxIncident",
  DetailToolboxIncident = "DetailToolboxIncident",
  ListSkillMatrix = "ListSkillMatrix",
  AddSkillMatrix = "AddSkillMatrix",
  DetailSkillMatrix = "DetailSkillMatrix",
  AddWorkplaceInspection = "AddWorkplaceInspection",
  ListWorkplaceInspection = "ListWorkplaceInspection",
  DetailWorkplaceInspection = "DetailWorkplaceInspection",
  AddCorrectiveActionReport = "AddCorrectiveActionReport",
  ListCorrectiveActionReport = "ListCorrectiveActionReport",
  DetailCorrectiveActionReport = "DetailCorrectiveActionReport",
  SkillMatrixs = "SkillMatrixs",
  Quaysafe = "Quaysafe",
  AssignedTeam = "AssignedTeam",
  SafetyCultureReport = "SafetyCultureReport",
  MasterReport = "MasterReport",
  Events = "Events",
  AddInduction = "AddInduction",
  DetailInduction = "DetailInduction",
  ListSiteSafetyAudit = "ListSiteSafetyAudit",
  AddSiteSafetyAudit = "AddSiteSafetyAudit",
  DetailSiteSafetyAudit = "DetailSiteSafetyAudit",
  WHSMeetingGrid = "WHSMeetingGrid",
  WHSMeetingDetail = "WHSMeetingDetail",
  UserActivityLog = "UserActivityLog",
  HelpDeskInLieEdit = "HelpDeskInLieEdit",
  WHSCommitteeMeeting = "WHSCommitteeMeeting",
  WHSCommitteeInspection = "WHSCommitteeInspection",
  ManageSites = "ManageSites",
  ExportListSchema = "ExportListSchema",
  ManageUserDetails = "ManageUserDetails",
  ManageSitesCrud = "ManageSitesCrud",
  WHSMeetingAgendaGrid = "WHSMeetingAgendaGrid",
  Employee = "Employee",
  AddEmployee = "AddEmployee",
  Documentation = "Documentation",
  Reports = "Reports",
  SynergySessions = "SynergySessions",
  PoliciesandProcedures = "PoliciesandProcedures",
  GlobalAssetsList = "GlobalAssetsList",
  AddGlobalAsset = "AddGlobalAsset",
  ViewMasterAssetDetails = "ViewMasterAssetDetails",
  AssociateEOMChecklist = "AssociateEOMChecklist",
  PDFViewEOMChecklist = "PDFViewEOMChecklist",
  ViewEOMChecklist = "ViewEOMChecklist",
  MicrokeeperDocumentation = "MicrokeeperDocumentation",
  SystemUsageReport = "SystemUsageReport",
  SiteDetailView = "SiteDetailView",
  SiteDetailGrid = "SiteDetailGrid",
  ViewHazardFormDetail = "ViewHazardFormDetail",
  HazardChartDashboard = "HazardChartDashboard",
  ListCRIssues = "ListCRIssues",
  ViewClientResponseFormDetail = "ViewClientResponseFormDetail",
  ClientResponseChartDashboard = "ClientResponseChartDashboard"
}

export enum ListNames {
  SitesMaster = "Sites Master",
  StateMaster = "State Master",
  SiteCategory = "Site Category",
  NavigationLinks = "Navigation Links",
  AssetMaster = "Asset Master",
  SitesAssociatedChemical = "Associated Chemical",
  SitesAssociatedTeam = "Associated Team",
  HelpDesk = "Help Desk",
  HelpDeskType = "Help Desk Type",
  ErrorlogGeneratorListName = "Error log Generator",
  AssetHistory = "Asset History",
  ChemicalRegistration = "Chemical Registration",
  UsersMaster = "Users Master",
  EventMaster = "Events",
  UserRole = "User Role",
  QCArea = "QC Area",
  Documents = "Documents",
  // DocumentsDisplayName = 'Documents',
  DocumentsDisplayName = "Client Documents",
  DocumentsInternalName = "ClientDocuments",
  QuayCleanLink = "Quay Clean Link",
  ClientResponse = "Client Response",
  Periodic = "Periodic",
  PeriodicHistory = "Periodic History",
  PictureLibrary = "Picture Library",
  PictureLibraryInternalName = "PictureLibrary",
  VideoList = "Video List",
  QuaycleanSlider = "Quayclean Slider",
  TeamPhoto = "TeamPhoto",
  QuaycleanAssets = "Quayclean Assets",
  HomeDescription = "Home Description",
  SharedDocuments = "Shared Documents",
  DocumentsLink = "Documents Link",
  CertificatesLibrary = "TeamCertificates",
  HelpDeskChoices = "Help Desk Choices",
  AssetLocationChoices = "Asset Location Choices",
  PeriodicChoices = "Periodic Choices",
  AuditReportEmail = "Audit Report Email",
  URLLink = "URL Link",
  SkillSet = "Skill Set",
  Client = "Client",
  AuditInspectionData = "Audit Inspection Data",
  QuestionMaster = "Question Master",
  AssetTypeMaster = "Asset Type Master",
  ChecklistResponseMaster = "Checklist Response Master",
  ChecklistResponseDetails = "Checklist Response Details",
  OptionColorMaster = "Option Color Master",
  DailyUsageReportEmail = "Daily Usage Report Email",
  SendEmailTempList = "Send Email Temp List",
  JobControlChecklist = "Job Control Checklist",
  JobControlChecklistDetails = "Job Control Checklist Details",
  JobControlChecklistHistory = "Job Control Checklist History",
  JobControlChecklistMaster = "Job Control Checklist Master",
  ToolboxTalkMaster = "Toolbox Talk Master",
  ToolboxTalkDetails = "Toolbox Talk Details",
  QuaycleanEmployee = "Quayclean Employee",
  QuaycleanEmployeeInt = "QuaycleanEmployee",
  ToolboxTalk = "Toolbox Talk",
  ToolboxTalkDetailsData = "Toolbox Talk Details Data",
  ToolboxTalkMasterData = "Toolbox Talk Master Data",
  ToolboxIncidentMaster = "Toolbox Incident Master",
  ToolboxIncidentDetails = "Toolbox Incident Details",
  ToolboxIncident = "Toolbox Incident",
  ToolboxIncidentMasterData = "Toolbox Incident Master Data",
  ToolboxIncidentDetailsData = "Toolbox Incident Details Data",
  ToolboxTalkSignature = "Toolbox Talk Signature",
  SkillMatrix = "Skill Matrix",
  SkillMatrixMaster = "Skill Matrix Master",
  SkillMatrixMasterData = "Skill Matrix Master Data",
  ToolboxIncidentSignature = "Toolbox Incident Signature",
  TrainingMaterial = "TrainingMaterial",
  SkillMatrixSignature = "Skill Matrix Signature",
  WorkplaceInspectionChecklist = "Workplace Inspection Checklist",
  WorkplaceInspectionChecklistMaster = "Workplace Inspection Checklist Master",
  WorkplaceInspectionChecklistMasterDetails = "Workplace Inspection Checklist Master Details",
  WorkplaceInspectionChecklistMasterDetailsData = "Workplace Inspection Checklist Master Details Data",
  CorrectiveActionReportMaster = "Corrective Action Report Master",
  CorrectiveActionReportDetails = "Corrective Action Report Details",
  CorrectiveActionReport = "Corrective Action Report",
  CorrectiveActionReportMasterData = "Corrective Action Report Master Data",
  CorrectiveActionReportDetailsData = "Corrective Action Report Details Data",
  CorrectiveActionReportSignature = "Corrective Action Report Signature",
  WorkplaceInspectionChecklistSignature = "Workplace Inspection Checklist Signature",
  ClientResponseChoices = "Client Response Choices",
  SkillMatrixInfo = "Skill Matrix Info",
  IMSTemplateMaster = "Quaysafe Template Master",
  IMSTemplateToolboxTalkMasterData = "Quaysafe Template Toolbox Talk Master Data",
  IMSTemplateToolboxTalk = "Quaysafe Template Toolbox Talk",
  IMSTemplateToolboxIncidentMasterData = "Quaysafe Template Toolbox Incident Master Data",
  IMSTemplateToolboxIncidentDetailsData = "Quaysafe Template Toolbox Incident Details Data",
  IMSTemplateWorkplaceInspectionDetailsData = "Quaysafe Template Workplace Inspection Details Data",
  IMSTemplateCorrectiveActionReportMasterData = "Quaysafe Template Corrective Action Report Master Data",
  IMSTemplateCorrectiveActionReportDetailsData = "Quaysafe Template Corrective Action Report Details Data",
  Questions = "Questions",
  SiteSupervisorPermission = "SiteSupervisorPermission",
  SiteAssetLocationPermission = "Site Asset Location Permission",
  WorkplaceInspectionChecklistMasterData = "Workplace Inspection Checklist Master Data",
  ReportPermission = "Report Permission",
  InductionMaster = "Induction Master",
  InductionDetail = "Induction Detail",
  UserCourseInductionDetail = "User Course Induction Detail",
  CourseMaster = "Course Master",
  SiteSafetyAudit = "Site Safety Audit",
  SiteSafetyAuditMaster = "Site Safety Audit Master",
  ComplianceChecksList = "Compliance Checks List",
  ComplianceSections = "Compliance Sections",
  WHSUsers = "WHSUsers",
  ComplianceSectionsData = "Compliance Sections Data",
  ComplianceChecksListData = "Compliance Checks List Data",
  SiteSafetyAuditSignature = "Site Safety Audit Signature",
  QuaycleanContractor = "Quayclean Contractor",
  WHSCommitteeMeetingDetail = "WHS Committee Meeting Detail",
  WHSCommitteeMeetingMaster = "WHS Committee Meeting Master",
  WHSSignature = "WHSSignature",
  HelpDeskField = "Help Desk Field",
  UserActivityLog = "User Activity Log",
  IMSChoices = "Quaysafe Choices",
  QuaycleanChoices = "Quayclean Choices",
  QuaycleanUserGuide = "Quayclean User Guide",
  SiteBudgetAdditionalHours = "Site Budget Additional Hours",
  SiteBudgetAllocationHours = "Site Budget Allocation Hours",
  PublicHoliday = "Public Holiday",
  MicrokeeperLink = "Microkeeper Link",
  SendNotificationTempList = "Send Notification Temp List",
  SynergySessions = "SynergySessions",
  UserWiseFavourite = "User Wise Favourite",
  PoliciesandProcedures = "PoliciesandProcedures",
  ChemicalChoices = "Chemical Choices",
  ChemicalRegistrationSDS = "ChemicalRegistrationSDS",
  GlobalAssets = "Global Assets",
  QuaycleanMasterAssets = "QuaycleanMasterAssets",
  EOMChecklist = "EOM Checklist",
  EOMChecklistDetails = "EOM Checklist Details",
  EOMChecklistHistory = "EOM Checklist History",
  EOMChecklistMaster = "EOM Checklist Master",
  JobControlChecklistQuestion = "Job Control Checklist Question",
  EOMChecklistQuestion = "EOM Checklist Question",
  SiteDocuments = "SiteDocuments",
  AuditInspectionPermission = "Audit Inspection Permission",
  SiteAuditReportConfiguration = "Site Audit Report Configuration",
  SiteModuleConfiguration = "Site Module Configuration",
  HazardFormResponses = "Hazard Form Responses",
  ResourceRecovery = "ResourceRecovery",
  ClientResponseFields = "Client Responses",
  SiteAreas = "Site Areas",
  ClientResponsesSubmission = "Client Response Submission",
  ClientResponseForm = "Client Response Form JSON"
}

export enum QRFolderName {
  AssetQRCode = "QRCode",
  ChemicalQRCode = "ChemicalQrCode",
}

export enum APISiteLink {
  // SafetyCulture = "https://safetycultureapi.tretainfotech.com",
  SafetyCulture = "https://safetycultureapi.quaycleanresources.com.au",
  Microkeeper = "https://microkeeper.tretainfotech.com",
}

interface IDefaultValues {
  numberOfQuestions: number;
  passingScore: number;
  DateFormate: string;
  DateTimeFormate: string;
  ReportDateFormate: string;
  FilterDateFormate: string;
  PageLength: number;
  DateRangeDays: number;
  recentlyCompletedTrainingDays: number;
  ExcelFileFieldArray: any;
}
export let defaultValues: IDefaultValues = {
  numberOfQuestions: 10,
  passingScore: 9,
  DateFormate: DateFormat,
  DateTimeFormate: DateTimeFormate,
  ReportDateFormate: DateFormat,
  FilterDateFormate: "YYYY-MM-DD",
  PageLength: 50,
  DateRangeDays: 90,
  recentlyCompletedTrainingDays: 7,
  ExcelFileFieldArray: [
    "Title",
    "Model",
    "SerialNumber",
    "PurchasePrice",
    // "QCOrder",
    // "NumberOfItems",
    "ConditionNotes",
    "AMStatus",
    "Manufacturer",
    "AssetType",
    "QCColor",
    "PurchaseDate",
    "ServiceDueDate",
    "AssetLink",
    "PreviousOwnerId",
    "CurrentOwnerId",
    "SiteNameId",
  ],
};

export enum DocumnetLibrarayName {
  TeamPhoto = "TeamPhoto",
}

export const pageLength = 50;
export const chemicalExpirationBeforeDays = 30;

export const HazardousOptions = [
  { key: "YES", text: "YES" },
  { key: "NO", text: "NO" },
];

export const LocationData = [
  { value: "Internal", label: "Internal" },
  { value: "External", label: "External" },
];

export const IsCompletedData = [
  { value: "", label: " --All Is Completed--" },
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

export const StatusData = [
  { key: "", text: "", value: "", label: " --All Status--" },
  { value: "Pending", label: "Pending" },
  { value: "In progress", label: "In progress" },
  { value: "Completed", label: "Completed" },
];

export const PrintTypeOpt = [
  { value: PrintTypeName.Cable, label: PrintTypeName.Cable },
  { value: PrintTypeName.TestDate, label: PrintTypeName.TestDate },
];

export enum SortOrder {
  Ascending = "Asc",
  Descending = "Desc",
}

export function getExternalUrl(context: WebPartContext): string {
  let apiURL: string;

  // Check if context is available and the environment is SharePoint
  if (
    context &&
    (Environment.type === EnvironmentType.SharePoint ||
      Environment.type === EnvironmentType.ClassicSharePoint)
  ) {
    const currentUrl: string =
      context.pageContext.web.absoluteUrl.toLowerCase();

    // Map URLs to their corresponding external URLs
    // First check for the more specific 'quaycleanqa'
    if (
      currentUrl.indexOf("https://treta.sharepoint.com/sites/quaycleanqa") > -1
    ) {
      apiURL = "https://quaycleanqa.quaycleanresources.com.au";
    } else if (
      currentUrl.indexOf("https://treta.sharepoint.com/sites/quayclean") > -1
    ) {
      apiURL = "https://quaycleandemo.tretainfotech.com";
    } else if (
      currentUrl.indexOf("https://quaycleanaustralia.sharepoint.com") > -1
    ) {
      apiURL = "https://www.quaycleanresources.com.au";
    } else {
      // Default URL if none of the above match
      apiURL = "https://quaycleandemo.tretainfotech.com";
    }
  } else {
    // Fallback URL if the environment is not SharePoint
    apiURL = "https://quaycleandemo.tretainfotech.com";
  }

  return apiURL;
}

export function getExternalUrlForClientResponses(context: WebPartContext): string {
  let apiURL: string;

  // Check if context is available and the environment is SharePoint
  if (
    context &&
    (Environment.type === EnvironmentType.SharePoint ||
      Environment.type === EnvironmentType.ClassicSharePoint)
  ) {
    const currentUrl: string =
      context.pageContext.web.absoluteUrl.toLowerCase();

    // Map URLs to their corresponding external URLs
    // First check for the more specific 'quaycleanqa'
    if (
      currentUrl.indexOf("https://treta.sharepoint.com/sites/quaycleanqa") > -1
    ) {
      apiURL = "https://clientresponsedemo.quaycleanresources.com.au";
    } else if (
      currentUrl.indexOf("https://treta.sharepoint.com/sites/quayclean") > -1
    ) {
      apiURL = "https://clientresponsedemo.quaycleanresources.com.au";
    } else if (
      currentUrl.indexOf("https://quaycleanaustralia.sharepoint.com") > -1
    ) {
      apiURL = "https://clientresponse.quaycleanresources.com.au";
    } else {
      // Default URL if none of the above match
      apiURL = "https://clientresponsedev.quaycleanresources.com.au/";
    }
  } else {
    // Fallback URL if the environment is not SharePoint
    apiURL = "https://clientresponsedev.quaycleanresources.com.au";
  }

  return apiURL;
}

export enum QueryStringForms {
  ToolboxTalk = "addtoolboxtalk",
  ToolboxIncident = "addtoolboxincident",
  SkillMatrix = "addskillmatrix",
  CorrectiveActionReport = "addcorrectiveactionreport",
  WorkplaceInspection = "addworkplaceinspection",
  SiteSafetyAudit = "addsitesafetyaudit",
}

export enum ViewType {
  grid = "grid",
  card = "card",
}

export enum CommonConstSiteName {
  SydneyShowground = "Sydney Showground",
  TheUniversityofQueensland = "The University of Queensland",
}

export enum UserActionLogFor {
  ClientDashboard = "Client Dashboard",
  QuaysafeDashboard = "Quaysafe Dashboard",
  Both = "Both"
}

export enum UserActionEntityTypeEnum {
  EquipmentAsset = "Equipment/ Asset",
  Asset = "Asset",
  Site = "View All Site",
  Chemical = "Chemical Master",
  AssignedTeam = "Assigned Team",
  HelpDesk = "Help Desk",
  Periodic = "Periodic",
  ClientResponse = "Client Response",
  Inspection = "Inspection",
  Action = "Safety Culture Action",
  Issue = "Safety Culture Issue",
  AddDocument = "Add Document",
  Document = "Document",
  ResourceRecovery = "Resource Recovery",
  AddResourceRecovery = "Add Resource Recovery",
  LinkDocument = "Link Document",
  LinkURL = "Link URL",
  Event = "Event",
  Client = "Client",
  QuestionBank = "Equipment Question Bank",
  AssetTypeMaster = "Asset Type Master",
  ToolboxTalk = "Toolbox Talk",
  IncidentReport = "Incident Report",
  SkillMatrix = "Skill Matrix",
  WorkplaceInspectionChecklist = "Workplace Inspection Checklist",
  WorkplaceInspection = "Workplace Inspection",
  CorrectiveActionReport = "Corrective Action Report",
  WHSCommitteeInspection = "WHS Committee Inspection",
  WHSCommitteeMeeting = "WHS Committee Meeting",
  AssociateChemical = "Associate Chemical",
  JobControlChecklist = "Job Control Checklist",
  EOMChecklist = "EOM Checklist",
  Dashboard = "Dashboard",
  ViewSite = "View Site",
  Induction = "Induction",
  Employee = "Employee",
  MasterAssets = "Master Assets",
  ViewSiteDetail = "View Site Detail",
  HazardReport = "Hazard Report",
  HazardReportChart = "Hazard Report Chart",
  ClientResponseReportChart = "Client Response Report Chart"
}

export enum UserActivityActionTypeEnum {
  Create = "Create",
  Update = "Update",
  Visit = "Visit",
  SendEmail = "Send Email",
  Delete = "Delete",
  Login = "Login",
  DetailsView = "Details View",
  Favourite = "Favourite",
  Unfavourite = "Unfavourite",
  Copy = "Copy",
  Unarchive = "Unarchive",
  ViewChart = "View Chart"
}

export enum EntityNameEnum {
  FavoriteSite = "Favourite Site",
  UnFavoriteSite = "Unfavourite Site",
}

export enum ActionDetailsEnum {
  FavoriteSite = "Site added to favourites",
  UnFavoriteSite = "Site removed from favourites",
}

export enum QuaySafeSendEmailTypeEnum {
  ToolboxTalk = "Resend ToolboxTalk",

  IncidentReport = "Resend Incident Report",
  WorkplaceInspectionChecklistReport = "Resend WorkplaceInspectionChecklistReport",
  CorrectiveActionReport = "Resend CorrectiveActionReport",
  WHSCommitteeInspection = "Resend WHS Committee Inspection",
}

export const viewDetailStickHeaders = ["SiteKey", "TeamKey", "DocumentKey"];
export enum WHSCommitteeMeetingTypeEnum {
  WHSCommitteeMeetingAgenda = "WHS Committee Meeting Agenda",
  WHSCommitteeMeetingMinutes = "WHS Committee Meeting Minutes",
}

export enum HoursTypeEnum {
  Daily = "Daily",
  Monthly = "Monthly",
}
export enum OperatorTypeEnum {
  MachineOperator = "Machine Operator"
}

export enum ViewSiteDesign {
  ViewByZone = "View By Group",
  ViewBySite = "View By Site",
  NoZoneLabel = "No Zone"
}



export enum ZoneViceSiteDetailsPivot {
  SiteKey = "SiteKey",
  EquipmentKey = "EquipmentKey",
  ChemicalKey = "ChemicalKey",
  TeamKey = "TeamKey",
  DocumentKey = "DocumentKey",
  DocumentsKey = "DocumentsKey",
  IMSKey = "IMSKey",
  EventsKey = "EventsKey",
  HelpDeskListKey = "HelpDeskListKey",
  ManagePeriodicListKey = "ManagePeriodicListKey",
  CRIssueListKey = "CRIssueListKey",
  ViewJobControlChecklistKey = "ViewJobControlChecklistKey",
  Microkeeper = "Microkeeper",
  SynergySessions = 'SynergySessions',
  PoliciesandProcedures = "PoliciesandProcedures"





}