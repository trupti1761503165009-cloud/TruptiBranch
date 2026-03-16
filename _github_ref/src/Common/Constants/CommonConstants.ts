import { IBreadcrumbItem } from "@fluentui/react";
import { ComponentNameEnum } from "../Enum/ComponentNameEnum";
import { ICardsArray } from "../../webparts/quayClean/components/CustomeComponents/IMS/WorkplaceInspection/IMSReportCards";
import { IReactDropOptionProps } from "../../webparts/quayClean/components/CommonComponents/reactSelect/IReactDropOptionProps";

// export const DateFormat: string = "DD/MM/YYYY";
// export const DateTimeFormate: string = "DD/MM/YYYY HH:mm A";
export const regexemail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const DateFormat: string = "DD-MM-YYYY";
export const YearDateFormat: string = "YYYY-MM-DD";
// export const DateTimeFormate: string = "DD-MM-YYYY HH:mm A";
export const DateTimeFormate: string = "DD-MM-YYYY HH:mm";
export const regexPhoneNumber = /^\+?[1-9]\d{1,14}$/;
export const systemUsageReportWidthPrint = "1036px"
export const printSize = "826px"
export enum AMStatus {
    InUse = "In Use",
    Moving = "Moving",
    NotInUse = "Not In Use",
    OutofOrder = "Out of Order"
}

export enum PrintTypeName {
    Cable = "Cable",
    TestDate = "TestDate",
}


export const dateRangeForServiceDueDate: number = 30;
export const SpecificDocumentType: string[] = ["doc", "docx", "rtf", "xls", "xlsx", "ppt", "pptx", "pdf", "txt"];
export enum DocumentValidationEnum {
    All = "All",
    Specific = "Specific"
}

export const attendeeOptions: any[] = [
    { key: 'Quayclean Employee', text: 'Quayclean Employee' },
    { key: 'Other Employee', text: 'Other Employee' },
];
export const attendeeContractorOptions: any[] = [
    { key: 'Quayclean Employee', text: 'Quayclean Employee' },
    { key: 'Other Employee', text: 'Other Employee' },
    { key: 'Other Contractor', text: 'Other Contractor' },
];

export const ImageTypeCheck: string[] = ['gif', 'jpeg', 'png', 'jpg'];

export const tenantNames: string[] = ["tretainfotech", "treta", "quaycleanaustralia"];
// export const tenantNames: string[] = ["treta"];

export const items: IBreadcrumbItem[] = [
    { text: 'Files', key: 'Files' },
    { text: 'Folder 1', key: 'f1' },
    { text: 'Folder 2', key: 'f2' },
    { text: 'Folder 3', key: 'f3' },
    { text: 'Folder 4 (non-clickable)', key: 'f4' },
    { text: 'Folder 5', key: 'f5' },
    { text: 'Folder 6', key: 'f6' },
    { text: 'Folder 7', key: 'f7' },
    { text: 'Folder 8', key: 'f8' },
    { text: 'Folder 9', key: 'f9' },
    { text: 'Folder 10', key: 'f10' },
    { text: 'Folder 11', key: 'f11', isCurrentItem: true },
];

export const monthLabels = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];


export enum ActionPriority {
    None = "58941717-817f-4c7c-a6f6-5cd05e2bbfde",
    Low = "16ba4717-adc9-4d48-bf7c-044cfe0d2727",
    Medium = "ce87c58a-eeb2-4fde-9dc4-c6e85f1f4055",
    High = "02eb40c1-4f46-40c5-be16-d32941c96ec9",
    Resolved = "450484b1-56cd-4784-9b49-a3cf97d0c0ad",
    Open = "547ed646-5e34-4732-bb54-a199d304368a"
}

export enum APISiteLink {
    // SafetyCulture = "https://safetycultureapi.tretainfotech.com",
    SafetyCulture = "https://safetycultureapi.quaycleanresources.com.au",
    Microkeeper = "https://microkeeper.tretainfotech.com"
}

export const DashBoardNavigation: string[] = ['Assets', 'Chemicals', 'Audit Reports', 'News', 'Sites', 'Help Desk', 'Periodic', 'Client Response', 'Chemical Usage', 'Assigned Team', 'Job Control  Checklist', 'Inspection', 'Document Library', 'Quaysafe',];
export const DashBoardNavigationUser: string[] = ['Assets', 'Chemicals', 'Audit Reports', 'News', 'Sites', 'Help Desk', 'Periodic', 'Client Response', 'Documents'];
export const siteGroupsAdmin: string = "Quayclean Admin";
export const MicrosoftOfficeDocumentType: string[] = ["doc", "docx", "rtf", "xls", "xlsx", "ppt", "pptx", "ods"];

export const WHSUserNavBarName: string = "WHS"

export const ExtraNavBar: any = {
    Title: "Update QR Code ",
    NavType: "App Link",
    URL: "",
    ComponentName: "UpdateQr",
    QROrder: 11,
    IsActive: true,
    IsLabel: false,
    Parent: "",
    TargetAudience: [],
}

export const WHSChairpersonOnlyMenu = [
    "Home",
    WHSUserNavBarName,
    "WHS Committee Inspection",
    "WHS Committee Meeting"
]


export enum UserACtionType {
    Create = "Create",
    Update = "Update",
    Delete = "Delete",
    Login = "Login",
    Visit = "Visit",
    DetailsView = "DetailsView"

}

export enum OptionColorType {
    Positive = "Positive",
    Negative = "Negative",
    Neutral = "Neutral",
}

export enum DataType {
    string = "string",
    number = "number",
    JsonParse = "JsonParse",
    numberOnly = "numberOnly",// ex 1,50,00 retrun 15000
    peoplePicker = "people",
    peoplePickerMultiple = "peoplePickerMultiple",
    userImage = "userImage",
    peoplePickerExpand = "peopleExpand",
    peopleExpandMuilt = "peopleExpandMuilt",
    peopleId = "peopleId",
    peopleIdMuilt = "peopleIdMuilt",
    peopleEmail = "peopleEmail",
    peopleTitle = "peopleTitle",
    stringArray = "stringArray",
    Boolean = "Boolean",
    YesNo = "YesNo",
    TrueYesNo = "TrueYesNo",
    YesNoTrue = "YesNoTrue",
    YesNoTrueOnly = "YesNoTrueOnly",
    Date = "Date",
    DateDDMMYYY = "DateDD-MM-YYYY",
    newDate = "newDate",
    DateRUndefined = "DateRUndefined",
    DateTime = "DateTime",
    lookup = "lookup",
    lookupMuilt = "lookupMuilt",
    lookupValue = "lookupValue",
    lookupId = "lookupId",
    lookupIdMuilt = "lookupIdMuilt",
    Image = "Image",
    Hyperlink = "Hyperlink",
    ImageJson = "ImageJson",
    ImageName = "ImageName",
    ChoiceMultiple = "ChoiceMultiple"
}

export enum ControlType {
    string = "string",
    peoplePicker = "peoplePicker",
    peoplePickerMultiple = "peoplePickerMultiple",
    number = "number",
    Choice = "Choice",
    ChoiceMultiple = "ChoiceMultiple",
    ChoiceCheckBox = "ChoiceCheckBox",
    ChoiceCheckBoxMultiple = "ChoiceCheckBoxMultiple",
    Image = "Image",
    HyperlinkType = "HyperlinkType",
    Date = "Date",
    DropDown = "DropDown",
    DropDownMultiple = "DropDownMultiple",
    RichText = "RichText",
    Toggle = "Toggle"


}

export enum MinutesCirculatedToValue {
    Noticeboard = "Notice board",
    Lunchroom = "Lunchroom",
    Toolboxtalks = "Toolbox talks",
    Executivemeetings = "Executive meetings",
    Emails = "Emails",
    Other = "Other",
}


export const IMSReportCardOptions: ICardsArray[] = [
    { cardName: "Total Activity", cardValue: "All", columnName: "All", colorName: "black", isFilterApply: false },
    { cardName: "Total Sites", cardValue: "", columnName: "SiteName", colorName: "red", isFilterApply: false },
    { cardName: "Update", cardValue: "Update", columnName: "ActionType", colorName: "green" },
    { cardName: "Create", cardValue: "Create", columnName: "ActionType", colorName: "green" },
    { cardName: "Delete", cardValue: "Delete", columnName: "ActionType", colorName: "green" },
    { cardName: "Details View", cardValue: "Details View", columnName: "ActionType", colorName: "green" },
    { cardName: "Toolbox Talk", cardValue: "Toolbox Talk", columnName: "EntityType", colorName: "blue" },
    // { cardName: "Toolbox Incident", cardValue: "Toolbox Incident", columnName: "EntityType", colorName: "blue" },
    { cardName: "Skill Matrix", cardValue: "Skill Matrix", columnName: "EntityType", colorName: "blue" },
    { cardName: "Workplace Inspection", cardValue: "Workplace Inspection", columnName: "EntityType", colorName: "blue" },
    { cardName: "Corrective Action Report", cardValue: "Corrective Action Report", columnName: "EntityType", colorName: "blue" },
    { cardName: "WHS Committee Inspection", cardValue: "WHS Committee Inspection", columnName: "EntityType", colorName: "blue" },
    { cardName: "WHS Committee Meeting", cardValue: "WHS Committee Meeting", columnName: "EntityType", colorName: "blue" },

]

export const UserReportCardOptions: ICardsArray[] = [
    { cardName: "Total Action", cardValue: "All", columnName: "All", colorName: "black", isFilterApply: false },
    { cardName: "Total Sites", cardValue: "", columnName: "SiteName", colorName: "red", isFilterApply: false },
    { cardName: "Users", cardValue: "", columnName: "Email", colorName: "green", isFilterApply: false },
]
export const UserReportSitesCardOptions: ICardsArray[] = [
    { cardName: "Total Action", cardValue: "All", columnName: "All", colorName: "black", isFilterApply: false },
    { cardName: "Total Sites", cardValue: "", columnName: "SiteName", colorName: "red", isFilterApply: false },
    { cardName: "Users", cardValue: "", columnName: "Email", colorName: "green", isFilterApply: false },
    { cardName: "Login", cardValue: "Login", columnName: "ActionType", colorName: "blue" },
    { cardName: "Visit", cardValue: "Visit", columnName: "ActionType", colorName: "blue" },
    { cardName: "Update", cardValue: "Update", columnName: "ActionType", colorName: "blue" },
    { cardName: "Delete", cardValue: "Delete", columnName: "ActionType", colorName: "blue" },
    { cardName: "Create", cardValue: "Create", columnName: "ActionType", colorName: "blue" },
    { cardName: "Details View", cardValue: "Details View", columnName: "ActionType", colorName: "blue" }

]

export const UserReportEquipmentAssetsCardOptions: ICardsArray[] = [
    { cardName: "Total Action", cardValue: "All", columnName: "All", colorName: "black", isFilterApply: false },
    { cardName: "Total Sites", cardValue: "", columnName: "SiteName", colorName: "red", isFilterApply: false },
    { cardName: "Users", cardValue: "", columnName: "Email", colorName: "green", isFilterApply: false },
    { cardName: "Create", cardValue: "Create", columnName: "ActionType", colorName: "blue" },
    { cardName: "Update", cardValue: "Update", columnName: "ActionType", colorName: "blue" },
    { cardName: "Delete", cardValue: "Delete", columnName: "ActionType", colorName: "blue" },
    { cardName: "Details View", cardValue: "Details View", columnName: "ActionType", colorName: "blue" },
]

export const UserReportChemicalCardOptions: ICardsArray[] = [
    { cardName: "Total Action", cardValue: "All", columnName: "All", colorName: "black", isFilterApply: false },
    { cardName: "Total Sites", cardValue: "", columnName: "SiteName", colorName: "red", isFilterApply: false },
    { cardName: "Users", cardValue: "", columnName: "Email", colorName: "green", isFilterApply: false },
    { cardName: "Create", cardValue: "Create", columnName: "ActionType", colorName: "blue" },
    { cardName: "Update", cardValue: "Update", columnName: "ActionType", colorName: "blue" },
    { cardName: "Delete", cardValue: "Delete", columnName: "ActionType", colorName: "blue" },
    { cardName: "Details View", cardValue: "Details View", columnName: "ActionType", colorName: "blue" },
]

export const UserReportHelpDeskCardOptions: ICardsArray[] = [
    { cardName: "Total Action", cardValue: "All", columnName: "All", colorName: "black", isFilterApply: false },
    { cardName: "Total Sites", cardValue: "", columnName: "SiteName", colorName: "red", isFilterApply: false },
    { cardName: "Users", cardValue: "", columnName: "Email", colorName: "green", isFilterApply: false },
    { cardName: "Create", cardValue: "Create", columnName: "ActionType", colorName: "blue" },
    { cardName: "Update", cardValue: "Update", columnName: "ActionType", colorName: "blue" },
    { cardName: "Delete", cardValue: "Delete", columnName: "ActionType", colorName: "blue" },
    { cardName: "Details View", cardValue: "Details View", columnName: "ActionType", colorName: "blue" },
]



export const UserReportEquipmentChecklistOptions: ICardsArray[] = [
    { cardName: "Total Action", cardValue: "All", columnName: "All", colorName: "black", isFilterApply: false },
    { cardName: "Users", cardValue: "", columnName: "Email", colorName: "green", isFilterApply: false },
    { cardName: "Create", cardValue: "Create", columnName: "ActionType", colorName: "blue" },
    { cardName: "Update", cardValue: "Update", columnName: "ActionType", colorName: "blue" },
    { cardName: "Delete", cardValue: "Delete", columnName: "ActionType", colorName: "blue" },
    { cardName: "Details View", cardValue: "Details View", columnName: "ActionType", colorName: "blue" },
]




export enum LoadCombineStateReportEnum {

    Dashboard = "Dashboard",
    CombineStateReport = "Combine State Report",
    TopTenSite = "Top 10 Site",
    SummaryReport = "SummaryReport",
    BottomTenSite = "Bottom 10 Site",
    SubDashboard = "SubDashboard",
    TopStateByTotalActivities = "Top State By Total Activities",
    StateSitePortalAccess = "StateSitePortalAccess",
    SiteWiseActivityVolume = "SiteWiseActivityVolume",
    SiteUserAccessedUsers = "SiteUserAccessedUsers",
    EntityTypeDistribution = "EntityTypeDistribution",
    ActiveUsersTrendOverTime = "ActiveUsersTrendOverTime",
    NoUsageSiteReport = "NoUsageSiteReport",
    UserLevelEngagementScore = "UserLevelEngagementScore",
    ActivityTypeCountsReport = "ActivityTypeCountsReport"




}


export const CombineStateReportCardsOptions: any[] = [
    { cardName: "Total Sites", cardValue: "", columnName: "totalSitesCount", colorName: "black", },
    { cardName: "Sites with Portal Access", cardValue: "", columnName: "activeSitesCount", colorName: "red", },
    { cardName: "% With Access", cardValue: "", columnName: "difference", colorName: "green", },
    { cardName: "Active Users", cardValue: "", columnName: "activeUserCount", colorName: "blue", isHideSubMenu: true },
    { cardName: "Average Login Day", cardValue: "", columnName: "avgLoginsDay", colorName: "purple", isHideSubMenu: true },
];

export const LowSiteCard: ICardsArray[] = [
    { cardName: "Total Sites", cardValue: "", columnName: "totalSites", colorName: "black", },
    { cardName: "High Active Sites", cardValue: "highActiveSites", columnName: "highActiveSites", colorName: "red", isFilterApply: true },
    { cardName: "Low Active Sites", cardValue: "lowActiveSiteCount", columnName: "lowActiveSiteCount", colorName: "green", isFilterApply: true },
    { cardName: "No Active Sites", cardValue: "inActiveSites", columnName: "inActiveSites", colorName: "blue", isFilterApply: true },
];

export const TopLowReportCardOption: ICardsArray[] = [
    { cardName: "ACT", cardValue: "", columnName: "actCount", colorName: "black", },
    { cardName: "NSW", cardValue: "", columnName: "nswCount", colorName: "red", },
    { cardName: "QLD", cardValue: "", columnName: "qldCount", colorName: "green", },
    { cardName: "SA", cardValue: "", columnName: "saCount", colorName: "blue" },
    { cardName: "TAS", cardValue: "", columnName: "tasCount", colorName: "purple" },
    { cardName: "VIC", cardValue: "", columnName: "vicCount", colorName: "orange" },
    { cardName: "WA", cardValue: "", columnName: "waCount", colorName: "teal" },
]

export const TopLowReportStateCardOption: ICardsArray[] = [
    { cardName: "ACT", cardValue: "", columnName: "actCount", colorName: "black", },
    { cardName: "NSW", cardValue: "", columnName: "nswCount", colorName: "red", },
    { cardName: "QLD", cardValue: "", columnName: "qldCount", colorName: "green", },
    { cardName: "SA", cardValue: "", columnName: "saCount", colorName: "blue" },
    { cardName: "TAS", cardValue: "", columnName: "tasCount", colorName: "purple" },
    { cardName: "VIC", cardValue: "", columnName: "vicCount", colorName: "orange" },
    { cardName: "WA", cardValue: "", columnName: "waCount", colorName: "teal" },
]
export const StateColor = [
    { cardName: "ACT", colorCode: "#000", },
    { cardName: "NSW", colorCode: "#e74c3c", },
    { cardName: "QLD", colorCode: "#00d5c9", },
    { cardName: "SA", colorCode: "#1300a6" },
    { cardName: "TAS", colorCode: "#6c5ce7" },
    { cardName: "VIC", colorCode: "#f39c12" },
    { cardName: "WA", colorCode: "#1abc9c" },
]

export const TopSiteLoadOptions: any[] = [
    { value: 5, label: "Show 05" },
    { value: 10, label: "Show 10" },
    { value: 15, label: "Show 15" },
    { value: 20, label: "Show 20" },
    { value: 25, label: "Show 25" },
    { value: 30, label: "Show 30" },
    { value: 35, label: "Show 35" },
    { value: 45, label: "Show 45" },
    { value: 45, label: "Show 45" },
    { value: 50, label: "Show 50" },

]

export const CombineStateTopInterCation: any[] = [
    { value: 3, label: "Top Interaction 03" },
    { value: 6, label: "Top Interaction 06" },
    { value: 9, label: "Top Interaction 09" },
    { value: 12, label: "Top Interaction 12" },
    { value: 100, label: "Show All" }

]
export const TopUserActivityByOptions: any[] = [
    { value: "Sites", label: "User Activity by Sites" },
    { value: "State", label: "User Activity by State" },
]

export const yesNoOptions: any[] = [
    { value: 'Yes', label: "Yes" },
    { value: "No", label: "No" }
]

export const topDataOptions = [
    { key: 10, label: "Top 10", value: 10 },
    { key: 20, label: "Top 20", value: 20 },
    { key: 30, label: "Top 30", value: 30 },
    { key: 50, label: "Top 50", value: 50 },
    { key: 0, label: "All", value: "all" },
];

export const NO_SITE_CATEGORY_ID = -1;

export let Base64Image = "data:image/png;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCABAAEADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+sbxD4n03w3bCS8kJlYfu4E5d/8AAe5o8T+IIPDejSXkgDyn5IY8/fft+Hc14HqGo3Wq30t5eStLPIcsx/kPQe1a06fNq9iZSsdPrHxI1zUnZbWQWEB6LD9/Hu3X8sVys97d3Tbri6mmY9TJIWP61e8P6HP4g1RbOFgigb5JCM7FHf616haeAvD9rGFe1a4cdXlkOT+AwP0rZyhDQz1Z5Db3t3asGtrmaFh0MchU/pXVaP8AEnXNNdVupBfwDqs33/wbr+ea7S88A+H7qMqlq1u56PFIcj8DkfpXl/iDQ5/D+qNZzMHUjfHIBjep7/WhShPQNUe4+H/E+m+JLYyWchEqj95A/Dp+Hce4rZr5q0/ULrSr6K8s5WinjOVYfyPqPavfPDHiCDxJo0d5GAko+SaPP3H7/h3FY1KfLqtjSMrnlXxI1ltS8TyWqtmCyHlKP9rqx/Pj8K46p724a6v7i4Y5aWVnJ9yc1BXVFWVjJu7PQfhaB9p1M45CRjP4tXpVcH8L7eNdLvbkD968wjJ9goI/9CNd5XLV+JlrYK81+KQH2nTDjkpIM/itelVwfxQt420uyuSP3qTmMHPYqSf/AEEUUviQPY8wrsfhtrLab4njtWbEF6PKYdt3VT+fH/Aq46p7K4a1v7a4U4aKVXB9wQa6pK6sSnZhewNa39xbsMNFKyH6gkVBXY/EnRm03xO90qkQXo81T239GH58/jXHURd1cGrM7j4b6w1tqkmmSOBDcgsgP/PQf4gH8hXqdfO8M0lvPHNC5SSNgyMOoI6GvoO1dpbSGR/vPGrN9SK560bO5UWS15F488QvqeqvYRMv2O0fA2/xPjBJ+nIr0jxJdTWfhy/uLdikqREqw7ds14T1p0Y9RSYVPY27Xd/bWyjLSyrGB9SBUFdj8NtGbUvE6XTLmCyHmsccbuij8+f+A1vJ2VxJXZ6r4m8PweJNHkspSElHzwy4+4/+HY14cfDmrjV5NLFjK13GcMoHAHrnpj3r6KqOSFJOSPm9R1rkhUcVY0cbnmeg/DmC2ZLjV5BPIDkQJ9wfU9/5fWu8qZ7aRenzD2qIqR1BH1FTKTluK1iOaGO4gkhmQPFIpV1boQeorzzWvhp96bR5/f7PMf5N/j+dejhSegJ+gqVLaRuo2j3pxm47Ba54BHoGqyasmliylW8c4EbLjj1z0x79K908M+H4PDejx2URDyn55pcfffv+HYVqxwxxnIUbsY3Ec1JTnUclYcY2P//Z"