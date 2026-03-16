/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
export const apiURL: string = 'https://sphrms.tretainfotech.com';

export enum ListNames {
    Leave = "Leave",
    LeaveType = "LeaveType",
    Holiday = "Holiday",
    Employee = "Employee",
    Attendance = "Attendance",
    AttendanceDetails = "AttendanceDetails",
    AttendanceHistory = "AttendanceHistory",
    EmployeeContactDetails = "EmployeeContactDetails",
    Country = "Country",
    State = "State",
    City = "City",
    Location = "Location",
    Department = "Department",
    Designation = "Designation",
    EmployeeProgression = "EmployeeProgression",
    EmployeeStatus = "EmployeeStatus",
    EmployeeOtherDetails = "EmployeeOtherDetails",
    SharedDocuments = "Shared Documents",
    Documents = "Documents",
    LeaveBalance = "LeaveBalance",
    FinancialYear = "FinancialYear",
    WorkingWeekHourSetting = "WorkingWeekHourSetting",
    WorkingWeekHourSettingDetail = "WorkingWeekHourSettingDetail",
    LeaveRule = "LeaveRule",
    FrozenAttendanceReport = "FrozenAttendanceReport",
    DeviceLocation = "DeviceLocation",
    WorkOnHolidayRequest = "WorkOnHolidayRequest",
    VerifyEmailAddress = "VerifyEmailAddress",
    EmployeeReportingPersonHistory = "EmployeeReportingPersonHistory",
    EmailTemplate = "EmailTemplate",
    // AttendanceHistory = "AttendanceHistory"
    MonthlyFrozenAttendance = "MonthlyFrozenAttendance",
    MonthlyFrozenSalary = "MonthlyFrozenSalary",
    DownTimeMaster = "DownTimeMaster",
    DownTimeDetail = "DownTimeDetail",
}

interface IDefaultValues {
    PageLength: number;
    DateFormat: string;
    TimeFormat: string;
    DateTimeFormat: string;
    Time: string;
    FilterDateFormat: string;
    DateOfBirthFormat: string;
    GetMonthFormat: string;
    NewHireDateFormat: string;
    YearFormat: string;
    MonthFormat: string;
    DayFormat: string;
    DefaultLocation: string;
    DocumentFormat: string;
    GetYearFormat: string;
}

export let defaultValues: IDefaultValues = {
    PageLength: 20,
    DateFormat: "DD-MM-YYYY",
    TimeFormat: "HH:mm:ss",
    DateTimeFormat: "DD-MM-YYYY hh:mm:ss",
    Time: "hh:mm",
    FilterDateFormat: "YYYY-MM-DD",
    DateOfBirthFormat: "D MMM",
    GetMonthFormat: "MMM",
    NewHireDateFormat: "YYYY-MM-DD",
    YearFormat: "YYYY",
    MonthFormat: "M",
    DayFormat: "D",
    DefaultLocation: "Treta Infotech",
    DocumentFormat: "DDMMYYYYhhmmss",
    GetYearFormat: "YY",
};
export enum ComponentNameEnum {
    Leave = "Leave",
}

export const pageLength = 10;

export interface IFinancialYearItem {
    ID: number;
    LocationId: number;
    FinancialStartDate: Date;
    FinancialEndDate: Date;
    Title: string;
}

export interface IEmployeeItem {
    ID: number;
    LocationId: number;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    EmployeeStatus: string;
    FinancialYearId: number;
    FinancialStartDate: any;
    FinancialEndDate: any;
    EmployeeRole: string;
    Designation: string;
}
export interface IGroupItem {
    Title: any;
    value: number;
    label: string;
}

export interface IEmployeeLeaveBalance {
    ID: number;
    AllocatedLeave: number;
    TakenLeave: number;
    EmployeeId: number;
    PendingLeave: number;
    Balance: number;
    LeaveTypeId: number;
    LeaveName: string;
    IsFrozen: boolean;
    LeaveRuleId: number;
    FinancialYearId: number;
}

export interface IWorkingWeekHourSettingItem {
    ID: number;
    LocationId: number;
    ConfigurationName: string;
    EffectiveDate: Date;
    ExpireDate: Date;
    FullDayHours: number;
    MinFullDayHours: number;
    HalfDayHours: number;
    ProductiveHours: number;
    DayWorkStartTime: Date;
    MonthlyAllowedMisPunch: number;
    WeekSettingDetail: IWorkingWeekHourSettingDetailItem[] | undefined;
    LabOutMinutes: number;
}
export interface IWorkingWeekHourSettingDetailItem {
    ID: number;
    WorkingWeekHourSettingId: number;
    DayIndex: number;
    DayName: string;
    DayOption: string;
}

export enum DayConfig {
    FullDay = "FullDay",
    OffDay = "OffDay",
    HalfDay = "HalfDay",
    Holiday = "Holiday",
    Absent = "Absent",
}
export enum LeaveStatusEnum {
    Approved = "Approved", // Leave has been approved by a supervisor or system
    Rejected = "Rejected", // Leave request was rejected
    Pending = "Pending",   // Leave request is awaiting review
    Cancelled = "Cancelled", // Leave request was cancelled by the requester
    CancelRequested = "Cancel Requested", //Approved Leave Cancel Request
}
export enum AttednanceRequestStatusEnum {
    Approved = "Approved",
    Rejected = "Rejected",
    Pending = "Pending",
    Cancelled = "Cancelled",
    PartialApproved = "Partial Approved"
}


export enum AttendanceRequestTypeEnum {
    WorkFromHome = "Work From Home",
    WorkOnHoliday = "Work On Holiday",
    OnSiteWork = "On Site Work",
    WorkPriorOfficialTime = "Work Prior Official Time",
    MissPunch = "Miss Punch",
}

export const AttendanceRequestTypeAbbreviations: any = {
    "Work From Home": "WFH",
    "Work On Holiday": "WOH",
    "On Site Work": "OSW",
    "Work Prior Office": "WPO",
    "Miss Punch": "MP",
    "Work Prior Official Time": "WPO",
    "Miss Punch Settlement": "MP",
    "Holiday": "Holiday",
    "Absent": "Absent",
    "OffDay": "Off Day",
};

// Utility function to get abbreviation from full name
export const getAttendanceAbbreviation = (fullName: string): string => {
    return AttendanceRequestTypeAbbreviations[fullName] || "Unknown"; // Default case if not found
};

export interface IAppliedLeaveItem {
    ID: number;
    LeaveTypeId: number;
    AppliedDate: Date | undefined;
    FromDate: Date;
    ToDate: Date;
    Days: number;
    LeaveStatus: string;
    EmployeeId: number;
    IsHalfDay: boolean;
    IsFirstHalf: boolean;
}

export interface ILeaveTypeConfigItem {
    ID: number;
    LeaveTypeId: number;
    Days: number;
    Frequency: string;
    EffectiveDate: Date;
    ExpiryDate: Date;
    HRMSLocationId: number;
    AllowedHalfDay: boolean;
    MonthlyLeaveDays: number;
    QuarterlyLeaveDays: number;
    LeaveSubmittedBeforeDays: number;
}

export interface IHolidayDetailItem {
    ID: number;
    LocationId: number;
    FromDate: Date;
    ToDate: Date;
    Holiday: string;
    Days: number;
}
export interface IUserInfo {
    SPUserInfo: any; // Consider defining a more specific type for SPUserInfo if possible
    UserDetail: IEmployeeItem | null; // Allow UserDetail to be null
    UserGroups: IGroupItem[] | null;
    IsAdmin: boolean;
    IsHumanResource: boolean;
    IsProjectManager: boolean;
}

export enum GroupEnum {
    HR = "TIPL.HR",
    Admin = "TIPL.Admin",
    ProjectManager = 'TIPL.Manager'
}
export enum EmployeeRole {
    PM = "Project Manager",
}
export interface IEmployeeModelHRMS {
    FirstName: string;
    MiddleName: string;
    LastName: string;
    EmailId: string;
    Gender: string;
    BirthDate: string;
    JoiningDate: string;
    //EmployeeStatusId: number;
    DepartmentId: number;
    DesignationId: number;
    LocationId: number;
    //RoleName: string;
    //CTC: number,
    ProbationPeriod: number;
    //SourceOfHireId1: number;
    MobileNo: string;
    //OfficeExtention: number;
    CountryId: number;
    StateId: number;
    CityId: number;
    IsActive: boolean;
    DeviceCode: string;
    SharepointEmployeeId: number;
}

export interface IEmployeeLeaveDetailItem {
    ID: number;
    Days: number;
    LeaveStatus: string;
    Comment: string;
    EmployeeId: number;
    ApprovedBy: string;
    LeaveType: string;
    LeaveTypeSortForm: string;
    LeaveTypeId: number;
    LeaveBalanceId: number;
    LeaveRuleId: number;
    FromDate: Date;
    ToDate: Date;
    IsFirstHalf: boolean;
    IsHalfDay: boolean;
}

export interface IEmployeeAttendanceRequestDetailItem {
    //StartTime(StartTime: any): unknown;
    StartTime: Date;
    ID: number;
    AttendanceDate: Date;
    AttendanceEndDate: Date;
    RequestType: string;
    AttendanceStatus: string;
    EmployeeId: number;
    ApprovedBy: string;
}

export interface AttendanceRecord {
    Title?: string;
    ID: number;
    AttendanceDate: Date;
    AttendanceDateTime: Date;
    Type: 'IN' | 'OUT';
    DeviceName: string;
    AttendanceRequestId: number;
    AttendanceRequestStatus: string;
    EntryOrigin: string;
    //AttendanceRequestType: string;
}

export interface ReportRow {
    Title?: string;
    InTime: string;
    OutTime: string;
    Type: string;
    DeviceName: string;
    ProductiveHour: string;
    OutHour: string;
    AttendanceRequestId: number;
    AttendanceRequestStatus: string;
    ExcludedHours?: string | undefined;
}

export interface AttendanceDetailReportData {
    AttendanceDate?: string;
    FirstInTime: string;
    LastOutTime: string;
    TotalInHours: string;
    TotalOutHours: string;
    ExcludedHours?: string | undefined;
    OfficeStartTime?: string | undefined | null;
    ReportRows: ReportRow[];
}

export interface IAttendanceRequest {
    ID: number;
    AttendanceDate: Date;
    RequestType: string;
    TotalHourCalculationType: string;
    AttendanceStatus: string;
    DetailRows: IAttendanceRequestDetail[];
}

export interface IAttendanceRequestDetail {
    Title?: string;
    RequestType?: string;
    ID: number;
    //AttendanceDate: Date;
    AttendanceStatus: string;
    AttendanceId: number;
    StartTime: Date | undefined | null;
    EndTime: Date | undefined | null;
    Comment?: string;
}

export interface IEmployeeID {
    ID: number;
}

export enum FormControlLengthEnum {
    TextBoxControl = 150,
    PhoneNumberControl = 10,
    DescriptionControl = 500,
    CTCControl = 8,
    DaysControl = 2,
    OTPControl = 6,
    PancardNoControl = 9,
    UANNoControl = 12,
    BankACNoControl = 15,
    PFNoControl = 22,
    RuleDaysControl = 4,
    DeviceCode = 5,
}

export enum SideBarLink {
    DocLink = "https://tretainfotech.sharepoint.com/sites/doclib/SOPs/Forms/AllItems.aspx",
    DotNetCodingStandard = "https://tretainfotech.sharepoint.com/sites/doclib/SOPs/Forms/AllItems.aspx",
    SharePointGuidelines = "https://tretainfotech.sharepoint.com/sites/doclib/SOPs/Forms/AllItems.aspx",
    BlogCredentials = "https://tretainfotech.sharepoint.com/sites/doclib/SOPs/Forms/AllItems.aspx",
    HRPolicy = "https://tretainfotech.sharepoint.com/sites/doclib/SOPs/Forms/AllItems.aspx",
    ConfirmationForm = "https://tretainfotech.sharepoint.com/sites/doclib/SOPs/Forms/AllItems.aspx",
    EOQPolicy = "https://tretainfotech.sharepoint.com/sites/doclib/SOPs/Forms/AllItems.aspx",

}

export interface ISelectedAttendanceRequest {
    ID: number;
    RequestType: string;
    WorkOnHolidayType: string;
    AttendanceDate: Date;
    EmployeeId: number;
    DeviceLocationId: number | undefined;
    ApprovalStatus: string;
}

export type Type_ApprovalType = 'Approved' | 'Rejected' | '' | undefined;

export interface SelectedAttendanceDetail {
    Id: number;
    Status: string;
    Comment?: string;
}

export interface IAttendanceStatesticsItem {
    TotalDays: number;
    TotalWorkingDays: number;
    TotalHolidays: number;
    TotalOffDays: number;
    TotalHalfDays: number;
    TotalAbsentDays: number;
    TotalPresentDays: number;
    TotalLeave: number;
    TotalApprovedLeave: number;
}

export interface DownTimeItem {
    ID: number;
    AttendanceDate: Date;
    StartTime: Date;
    EndTime: Date;
    Comment: string;
}

export interface AttendanceRecordDetail {
    EmployeeId: number;
    ID: number;
    AttendanceDate: Date;
    AttendanceDateTime: Date;
    Type: 'IN' | 'OUT';
    DeviceName: string;
    AttendanceRequestId: number;
    AttendanceRequestStatus: string;
    //AttendanceRequestType: string;
}


export interface FrozenSalaryData {
    ID: number;
    Month: number;
    Year: number;
    IsSalaryProcessed: boolean;
    TotalWorkingDays: number;
    TotalHolidays: number;
    TotalOffDays: number;
    LocationId: number;
    LocationName: string;
}

export interface AttendanceRecordDetailCustom {
    EmployeeId: number;
    DeviceLocationId: number;
    AttendanceDateTime: Date;
    EntryExitType: boolean;
    Title: string;
}