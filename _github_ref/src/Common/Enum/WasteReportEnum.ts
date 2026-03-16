import { QCeLearningLink } from "../../webparts/quayClean/components/CustomeComponents/WasteReportLink/QCeLearningLink";

export class WasteReportFields {
    static readonly WasteReport = "WasteReport";
    static readonly Users = "Users";
    static readonly BreakDownBy = "Break Down By";
    static readonly AmenitiesFeedbackForm = "AmenitiesFeedbackForm";

}

export class WasteReportViewFields {
    static readonly WasteReport = "Waste Report";
    static readonly Users = "Users";
    static readonly AmenitiesFeedbackForm = "Amenities Feedback Form";
    static readonly DailyDutiesChecklists = "Daily Duties Checklists";
    static readonly BreakDownBy = "Break Down By";
    static readonly IsResourceRecovery = "Resource Recovery";
}

export enum WasteReportPivot {
    WasteReport = "Waste Report",
    QCeLEarning = "eLearning",
    WasteReportKey = "WasteReport",
    AmenitiesFeedbackFormKey = "AmenitiesFeedbackForm",
    AmenitiesFeedbackForm = "Amenities Feedback Form",
    DailyCleaningDutiesKey = "DailyCleaningDuties",
    DailyCleaningDuties = "Daily Cleaning Duties",
    ResourceRecovery = "Resource Recovery"
}

export enum SitePageName {
    AmenitiesFeedbackForm = "AmenitiesFeedbackForm.aspx",
    DailyCleaningDuties = "DailyCleaningDuties.aspx",
    QCeLearning = "QCeLearning.aspx",
    QuayClean = "QuayClean.aspx"

}

export enum CRPivotEnum {
    IssueKey = "IssuesList",
    ManageSubsiteKey = "ManageSubsiteKey",
    IssueList = "Responses",
    ManageSubSite = "Area Management",
    ManageSiteArea = "Manage Site Area",
    ManageStaff = "Manage Staff"
}