import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { IQuayCleanState } from "../../QuayClean";
import { IDropdownOption } from "@fluentui/react";
import { ISelectedZoneDetails } from "../../../../../Interfaces/ISelectedZoneDetails";

export class ClientResponseFields {
    static readonly Id = 'Id';
    static readonly ID = 'ID';
    static readonly Title = 'Title';
    static readonly SiteName = 'SiteName';
    static readonly SiteId = 'SiteId';
    static readonly State = 'State';
    static readonly StateId = 'StateId';
    static readonly IsDeleted = 'IsDeleted';
    static readonly Category = 'Category';
    static readonly SubCategory = 'SubCategory';
    static readonly Response = 'Response';
    static readonly IsArchive = 'IsArchive';
    static readonly AssignedTo = "AssignedTo";
    static readonly ResponseFormId = "ResponseFormId";
    static readonly ResolvedBy = "ResolvedBy";
    static readonly ReportedBy = "ReportedBy";
    static readonly ClientResponseStatus = "Status";
    static readonly AssignedToName = "AssignedToName";
    static readonly QuaycleanEmployee = "QuaycleanEmployee";
    static readonly Created = "Created";
    static readonly SubmissionDate = "SubmissionDate";
    static readonly Status = "Status";
    static readonly Comment = "Comment";
    static readonly StateName = "StateName";
    static readonly SubmissionDateDisplay = "SubmissionDateDisplay";
    static readonly StaffMembers = "StaffMembers";
    static readonly SiteNameTitle = 'SiteName/Title';
    static readonly StaffMembersName = 'StaffMembers/Title';
    static readonly StaffMembersEmail = 'StaffMembers/Email';
    static readonly StaffMembersId = 'StaffMembers/Id';
    static readonly SiteArea = "SiteArea";
    static readonly IsDefaultSiteArea = "IsDefaultSiteArea";
    static readonly SiteCategory = "SiteCategory";
    static readonly SiteCategoryName = "SiteCategoryName";
    static readonly ResolvedDate = "ResolvedDate";
}

export class ClientResponseViewFields {
    static readonly Id = 'Id';
    static readonly ID = 'ID';
    static readonly ResponseFormId = 'Form ID';
    static readonly Title = 'Title';
    static readonly Site = 'Site';
    static readonly SiteName = 'Site Name';
    static readonly State = 'State';
    static readonly QRLogo = 'QR Logo';
    static readonly LogoTitle = "Report an Issue";
    static readonly Category = 'Category';
    static readonly SubCategory = 'Sub Category';
    static readonly SubmittedBy = "Submitted By";
    static readonly SubmissionDate = "Submission Date";
    static readonly UploadedPhoto = "Uploaded Photo(s)";
    static readonly Questions = "Questions";
    static readonly StaffMembers = "Staff Members";
    static readonly SiteArea = "Site Area";
    static readonly IsDefaultSiteArea = "Default Area";
    static readonly AssignedTo = "Assigned To";
    static readonly ResolvedDate = "Resolved Date";
    static readonly ResolvedBy = "Resolved By";
    static readonly ReportedBy = "Reported By";
    static readonly AssignedToName = "AssignedToName";
    static readonly ClientResponse = "Client Feedback";
    static readonly ClientResponseStatus = "Status";
}

export enum ClientResponseEnum {
    ClientResponseReportTitle = "Client Feedback Report",
    ClientResponseDetails = "Client Feedback Details",
    NoInformationProvided = "No Information Provided",
    CommonDetails = "Common Details",
    StateWiseCount = "State Wise Feedback Count",
    SiteWiseCount = "Site Wise Feedback Count",
    CategoryWiseCount = "Category Wise Count",
    SubCategoryWiseCount = "Sub Category Wise Count",
    SubmissionDateWiseCount = "Submission Date Wise Count",
    UserWiseCount = "Sub Category Counts by Reporters",
    SubCategoryByCategory = "Sub Category Counts by Category"

}

export enum ClientResponseChartMenuEnum {
    Grid = "Grid",
    Dashboard = "Dashboard",
    SiteReport = "SiteReport",
    MasterReport = "MasterReport",
    Reports = "Reports",
    StateWiseResponse = "StateWiseResponse",
    SiteWiseResponse = "SiteWiseResponse",
    CategoryWiseReport = "CategoryWiseReport",
    SubCategoryWiseReport = "SubCategoryWiseReport",
    SubmissionDateWiseReport = "SubmissionDateWiseReport",
    UserWiseSubCategory = "UserWiseSubCategory",
    SubCategoryByResponse = "SubCategoryByResponse",
    SubCategoryByResponseTrend = "SubCategoryByResponseTrend"
}

export interface IListIssues {
    manageComponentView(componentProp: IQuayCleanState): any;
    siteMasterId?: number;
    breadCrumItems: IBreadCrum[];
    loginUserRoleDetails: any;
    componentProps?: IQuayCleanState;
    view?: any;
    siteName?: any;
    isDirectView?: boolean;
    qCStateId?: any;
    isNotGeneral?: any;
    stateTabData?: any;
    isZoneView?: boolean;
    isHideAction?: any;
    selectedZoneDetails?: ISelectedZoneDetails
}

export interface ClientResponseData {
    Id?: number;
    Category: string;
    SubCategory: string;
    SiteName: string;
    ReportedBy: string;
    SubmissionDate: string;
    State: string;
    ResponseFormId: any;
    SubmissionDateDisplay?: any;
    SubmissionTimestamp?: any;
}

export interface ChartDataItem {
    label: string;
    count?: number;
    children?: ChartDataItem[];
    level: string;
    tooltip?: any;
    category?: string;
    subCategory?: string;
    submissionDate?: string;
    reporterName?: string;
    siteName?: any;
    state?: any;
}

export interface CRGridProps {
    data: ClientResponseData[];
    isPDFGenerating?: boolean;
    siteName?: any;
    groupBy?: any;
}

export enum CRGridTitles {
    ClientResponseRecords = "Client Feedback Records",
    ClientResponseReports = "Client Feedback Reports",
    ClientResponseMasterReport = "Client Feedback Master Report",
    State = "Client Feedback Report by State",
    SiteName = "Client Feedback Report by Site",
    Category = "Client Feedback Report by Category",
    SubCategory = "Client Feedback Report by Sub Category",
    SubmissionDate = "Client Feedback Report by Submission Date",
    ReportedBy = "Sub Category Counts by Reporters",
    SubCategoryByCategory = "Sub Category Counts by Category",
    SubCategoryByCategoryTrend = "Trend of Sub Category Counts by Category",
    NoCategory = "No Category",
    ClientFeedbackReport = "Client Feedback Report"
}

export interface ReportProps {
    data: any[];
    width?: any;
    height?: any;
    title?: any;
}

export interface IListSiteArea {
    provider: IDataProvider;
    context: WebPartContext;
    manageComponentView(componentProp: IQuayCleanState): any;
    siteMasterId?: number;
    breadCrumItems: IBreadCrum[];
    loginUserRoleDetails: any;
    componentProps?: IQuayCleanState;
    view?: any;
    siteName?: any;
    isDirectView?: boolean;
    qCStateId?: any;
    isNotGeneral?: any;
    stateTabData?: any;
    isHideAction?: any;
}

export interface IClientResponseData {
    ClientResponseData: any[];
    selectedCategory: any[];
    selectedSubCategory: any[];
    selectedReportedBy: any;
    selectedArchive: any;
    selectedResolvedBy: any;
    isRefresh: boolean;
    isRefreshOptions: boolean;
    ReportedByOptions: any[];
    ResolvedByOptions: any[];
    CategoryOptions: any[];
    SubCategoryOptions: any[];
    fromDate: any;
    toDate: any;
    filterFromDate: any;
    filterToDate: any;
    selectedDateItem: IDropdownOption;
    selectedIssueItem: any;
    isOpenArchiveModal: boolean;
    filterCategoryValue: any;
    filteredClientResponseData: any[];
    isLocalFilter: any;
    isQrModelOpen: boolean;
    QRCodeImage: any;
    isIssueSiteUpdate: any;
    isAttachmentModalOpen: any;
    stateTabData: any;
    stateCountData: any;
    selectedStateId: any;
    isReassignOpen: boolean,
    isResolveModalOpen: boolean;
    selectedStatus: string[];
    isCategoryChange: boolean;
    JSONFiles: any[];
    jsonFileContent: any;
    SiteCategoryCardData: any[];
    selectedSiteCategoryId: any;
    keyUpdate?: number;
    isCopyLinkClicked: boolean;
}

export interface IClientResponseDashboardData {
    ClientResponseData: any[];
    selectedIssueItem: any;
    isOpenArchiveModal: boolean;
    filteredClientResponseData: any[];
    isAttachmentModalOpen: any;
    isReassignOpen: boolean,
    isResolveModalOpen: boolean;
}