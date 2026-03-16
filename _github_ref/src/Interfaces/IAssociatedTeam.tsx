export interface IAssociatedTeam {
    id: number;
    title: string;
    aTUserName: string;
    aTRole: string;
    Index?: number | any;
    siteName?: number;
    siteNameId?: number;
    userImage?: string;
    SkillSet?: any[];
    OperatorType?: any;
    Notes?: string;
    attachmentURl?: string
}

export interface INewEditAssociatedTeam {
    Title?: string;
    Notes?: string;
    ATUserName?: string;
    ATRole?: string;
    SiteNameId?: number;
    SiteName?: string;
    userImageAttachment?: any,
    profilerImageUrl?: string,
    SkillSet?: any[];
    IsDailyOperator?: any;
    OperatorType?: any;
    Index?: number;
    Email?: any;
    UserId?: any;
    Location?: string[];
    DateOfBirth?: any
    isDOBExist?: boolean
}
// ATRole
// ATUserName