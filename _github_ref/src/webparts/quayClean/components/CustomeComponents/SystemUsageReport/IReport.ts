export interface IReportState {
    Id: number;
    Title: string;
}

export interface IReportSites {
    Id: number;
    Title: string;
    StateId: number;
    StateName: string;
    totalUserCount: number;
}

export interface IReportUserActivityLog {
    ID: number;
    SiteNameId: number;
    SiteName: string;
    State: string;
    UserName: string;
    ActionType: string;
    EntityType: string;
    EntityId: string;
    EntityName: string;
    Details: string;
    AuthorId: number;
    AuthorEmail: string;
    Created: string;
    OrgCreated: string;
    OrgModified: string;
    Modified: string;
    SiteNameCategory: string;
}

export interface IReportSiteRow {
    label: any;
    totalSitesCount: any;
    activeSiteCount: any;
    indent: any;
    expandable: boolean;
    children: any;
    defaultExpanded?: boolean;
    onClickRow?: any;
    item?: any
    difference: number;
    activeUsers?: number;
    activeUsersCount: number;
    avgLoginsDay: any
    topEntityTypesCount: any[];
    isLastLevel?: boolean
}

export interface IReportsCombineState extends IReportState {
    totalSiteCount: number;
    activeSiteCount: number;
}

export interface IReportsTopSites {
    totalSiteCount: number;
    activeSiteCount: number;
}
