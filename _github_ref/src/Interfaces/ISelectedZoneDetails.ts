export interface ISelectedZoneDetails {
    selectedSitesId: number[];
    selectedSites: ISelectedSites[] | any;
    zoneName?: string;
    zoneId?: number;
    siteCount?: number;
    defaultSelectedSites?: ISelectedSites[];
    defaultSelectedSitesId?: number[];
    isSinglesiteSelected?: boolean;
}

export interface ISelectedSites {
    Id: number;
    QCStateId: number;
    SiteName: string;
    State: string;
    siteImage: string;
    siteCategory: string;
}