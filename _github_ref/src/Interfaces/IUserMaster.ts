export interface IUserMaster {
    id: number;
    userName: string;//Title 
    aDUserTitle: string;
    aDUserEmail: string;
    aDUserId: string;
    qCRoleId: number;
    qCRole: string;
    userImage: string;

}

export interface IAssignedTeam {
    id: number;
    title: string;
    aTUserName: string;
    aTRole: string;
    siteNameId: number;
    Notes: string;
    attachmentURl: string;
    SkillSet: string;
    IsDailyOperator: string;
}

export interface ISkillSet {
    ID: number;
    Title: string;
    SiteNameId: number;
    AssociatedTeamId: number;
    ExpiryDate: string;
    CardNumber: string;
}
