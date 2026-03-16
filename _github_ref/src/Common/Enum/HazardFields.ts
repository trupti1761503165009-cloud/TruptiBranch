import { DateFormat, DateTimeFormate } from "../Constants/CommonConstants";

export class HazardFields {
  static readonly Id = "Id";
  static readonly ID = "ID";
  static readonly Title = "Title";
  static readonly SiteName = "SiteName";
  static readonly SiteId = "SiteId";
  static readonly State = "State";
  static readonly StateId = "StateId";
  static readonly IsDeleted = "IsDeleted";
  static readonly HazardType = "HazardType";
  static readonly HazardSubType = "HazardSubType";
  static readonly Response = "Response";
  static readonly IsArchive = "IsArchive";
  static readonly SubmittedBy = "SubmittedBy";
  static readonly SubmittedByName = "SubmittedByName";
  static readonly QuaycleanEmployee = "QuaycleanEmployee";
  static readonly Created = "Created";
  static readonly SubmissionDate = "SubmissionDate";
  static readonly HazardFormId = "HazardFormId";
  static readonly Status = "Status";
  static readonly StateName = "StateName";
  static readonly SubmissionDateDisplay = "SubmissionDateDisplay";
}

export class HazardViewFields {
  static readonly Id = "Id";
  static readonly ID = "ID";
  static readonly FormID = "Form ID";
  static readonly Title = "Title";
  static readonly Site = "Site";
  static readonly SiteName = "Site Name";
  static readonly State = "State";
  static readonly QRLogo = "QR Logo";
  static readonly LogoTitle = "Report Hazard";
  static readonly HazardType = "Hazard Type";
  static readonly HazardSubType = "Sub Hazard Type";
  static readonly SubmittedBy = "Submitted By";
  static readonly SubmissionDate = "Submission Date";
  static readonly UploadedPhoto = "Uploaded Photo(s)";
  static readonly Questions = "Questions";
  static readonly Description = "Description";
}

export enum HazardEnum {
  HazardReportTitle = "Hazard Report",
  HazardResponseDetails = "Hazard Response Details",
  NoInformationProvided = "No Information Provided",
  CommonDetails = "Common Details",
  StateWiseCount = "State Wise Hazard Count",
  SiteWiseCount = "Site Wise Hazard Count",
  HazardTypeWiseCount = "Hazard Type Wise Count",
  SubHazardTypeWiseCount = "Sub Hazard Type Wise Count",
  SubmissionDateWiseCount = "Submission Date Wise Count",
  UserWiseCount = "Sub-Hazard Counts by Reporters",
  SubHazardByHazard = "Sub-Hazard Counts by Hazard Type",
}

export enum DateOptionType {
  Today = "Today",
  Yesterday = "Yesterday",
  CurrentWeek = "CurrentWeek",
  LastWeek = "LastWeek",
  Last7Days = "Last7Days",
  ThisMonth = "ThisMonth",
  LastMonth = "LastMonth",
  Last30Days = "Last30Days",
  CustomRange = "CustomRange",
}

export enum HazardChartMenuEnum {
  Grid = "Grid",
  Dashboard = "Dashboard",
  SiteReport = "SiteReport",
  MasterReport = "MasterReport",
  Reports = "Reports",
  StateWiseHazard = "StateWiseHazard",
  SiteWiseHazard = "SiteWiseHazard",
  HazardTypeWiseReport = "HazardTypeWiseReport",
  SubHazardTypeWiseReport = "SubHazardTypeWiseReport",
  SubmissionDateWiseReport = "SubmissionDateWiseReport",
  UserWiseSubHazard = "UserWiseSubHazard",
  SubHazardByHazard = "SubHazardByHazard",
  SubHazardByHazardTrend = "SubHazardByHazardTrend",
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

export const HZStateColor = [
  { key: "ACT", colorCode: "#007bff" },
  { key: "NSW", colorCode: "#e74c3c" },
  { key: "QLD", colorCode: "#00d5c9" },
  { key: "SA", colorCode: "#1300a6" },
  { key: "TAS", colorCode: "#6c5ce7" },
  { key: "VIC", colorCode: "#f39c12" },
  { key: "WA", colorCode: "#1abc9c" },
];

export const defaultBarColors = [
  "#519393",
  "#dda563",
  "#fac858",
  "#73c0de",
  "#3ba272",
  "#fc8452",
  "#9a60b4",
  "#ea7ccc",
];
export interface HazardData {
  Id?: number;
  HazardType: string;
  HazardSubType: string;
  SiteName: string;
  SubmittedBy: string;
  SubmissionDate: string;
  State: string;
  HazardFormId: any;
  SubmissionDateDisplay?: any;
  SubmissionTimestamp?: any;
}

export interface ChartDataItem {
  label: string;
  count?: number;
  children?: ChartDataItem[];
  level: string;
  tooltip?: any;
  hazardType?: string;
  subHazard?: string;
  submissionDate?: string;
  reporterName?: string;
  siteName?: any;
  state?: any;
}

export interface HazardGridProps {
  data: HazardData[];
  isPDFGenerating?: boolean;
  siteName?: any;
  groupBy?: any;
}

export enum HazardGridTitles {
  State = "Hazard Report by State",
  SiteName = "Hazard Report by Site",
  HazardType = "Hazard Report by Hazard Type",
  HazardSubType = "Hazard Report by Sub Hazard",
  SubmissionDate = "Hazard Report by Submission Date",
  SubmittedBy = "Sub Hazard Counts by Reporters",
  SubHazardByHazard = "Sub Hazard Counts by Hazard Type",
  SubHazardByHazardTrend = "Trend of Sub Hazard Counts by Hazard Type",
}

export interface ReportProps {
  data: any[];
  width?: any;
  height?: any;
  title?: any;
}
