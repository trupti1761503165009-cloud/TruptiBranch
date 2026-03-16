export interface IWHSUsers {
    StateId: number[];
    UserId: number;
    User: ICustomPeoplePicker;
    Email: string;
    UserRole: string;
    ShortForm: string;
    UserName: string;
    Title: string;
    Id: number;
}

export interface ICustomPeoplePicker {
    Id: number;
    emailId: string;
    title: string;
    imageURl?: string;
}

export interface IAddWHSCommitteeMeetingDetail {
    DueCompletedDate?: Date | any;
    WHSCommitteeMeetingMasterId: number | any;
    WHOId: number[];
    Description: string;
    Item: string;
    ItemNo?: string;
    IsCompleted?: boolean;
    Title: string;
    Id?: number;
}

export interface IWHSCommitteeMeetingDetail {
    DueCompletedDate: Date | any;
    WHSCommitteeMeetingMaster: ILookup;
    WHO: ILookup[];
    Description: string;
    Item: string;
    ItemNo: string;
    IsCompleted: boolean;
    Title: string;
}

export interface IAddWHSCommitteeMeetingMaster {
    MinutesCirculatedTo: string[];
    MeetingDate: Date | any;
    ApologiesId: number[];
    AttendeesId: number[];
    Other: string;
    EndTime: string;
    StartTime: string;
    Location: string;
    Title: string;
    Id?: number
}


export interface IWHSCommitteeMeetingMaster {
    MinutesCirculatedTo: string[];
    MeetingDate: Date | any;
    Apologies: ILookup[];
    Attendees: ILookup[];
    Other: string;
    EndTime: string;
    StartTime: string;
    Location: string;
    Title: string;
    Id: number;
    Created?: any;
    Editor?: ICustomPeoplePicker;
    Modified?: any;
    Author?: ICustomPeoplePicker;
    AttendeesArray?: any;
    mainAttendees?: any[]
}

export interface ILookup {
    Id: number
    value: any
}