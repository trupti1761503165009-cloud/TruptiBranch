export interface ICheckListDetail {
    PreId: number;
    PostId: number;
    AssetMasterId?: number;
    SiteNameId?: number;
}

export interface ICheckListMasterDetail {
    ID: number;
    SiteNameId: number;
    AssetMasterId: number;
    operatorName: string;
    title: string;
    date: string;
    location: string;
    inspectionScores: string[];
    siteConducted: string;
    conductedOn: string;
    conductedTime: string;
    checklistType: string;
    signature: string;
    questionAnswerList?: any;
    totalQuestions: number;
    totalPositiveQuestions: number;
    totalNegativeQuestions: number;
    totalPercentage: string;
    Attachments: boolean;
    AttachmentFiles: any;
}
