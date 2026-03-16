import { IQuayCleanState } from "../webparts/quayClean/components/QuayClean";

export interface IAdCode {
    siteMasterId: any
}

export interface ICardProps {
    items: any,
    isTabView: any,
    viewType: any,
    manageComponentView(componentProp: IQuayCleanState): any;
    isEditDelete?: boolean;
    _onclickEdit: (itemID: any) => void;
    _onclickconfirmdelete: (itemID: any) => void;
    IMSsiteMasterId?: any;
    isNotGeneral?: any;
    _SkillMatrixSignature?: (ID: any, item: any) => void;
    _onclickView?: (itemID: any) => void;
    _onclickUnarchive?: (itemID: any) => void;
    _onclickSiteUpdate?: (itemID: any) => void;
}

export interface IIssueCardProps {
    items: any,
    isTabView?: any,
    viewType?: any,
    manageComponentView(componentProp: IQuayCleanState): any;
    isEditDelete?: boolean;
    IMSsiteMasterId?: any;
    isNotGeneral?: any;
    _onclickView: (itemID: any) => void;
    _onclickUnarchive?: (itemID: any) => void;
    _onclickSiteUpdate?: (itemID: any) => void;
    _onclickAttachment: (itemID: any) => void;
    _onclickResolved?: (itemID: any) => void;
    _onclickReAssigned?: (itemID: any) => void;
    isChartView?: any;
}