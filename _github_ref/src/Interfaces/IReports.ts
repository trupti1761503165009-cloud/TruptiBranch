import { IReactDropOptionProps } from "../webparts/quayClean/components/CommonComponents/reactSelect/IReactDropOptionProps";
import { ICustomPeoplePicker, ILookup } from "../webparts/quayClean/components/CustomeComponents/WHSForms/IAddWHSMeetingFroms";

export interface ITimeSheet {
    accuracy_Off: string;
    accuracy_On: string;
    approved: number;
    break_Category: string;
    client_Business: string;
    client_Contact: string;
    client_ID: string;
    clock_Off: string;
    clock_On: string;
    count: number;
    daily_Shifts: string;
    date: string;
    did_Ordinary_Hours_Start_Before_6am: string;//boolean
    did_Ordinary_Hours_go_Past_6am: string;//boolean
    diff_Loc_Check: string;//Yes ;No
    diff_Loc_Key: string;
    employee_ID: any;
    employee_Name: string;
    employeeNameAdjusted: string;
    end_of_Ordinary_Window: string;
    hours: string;
    hours_hh_mm: string;
    id: number;
    jobCode: string;
    job_ID: string;
    job_Title2: string;
    job_Title_Official: string;
    latitude_Off: any;
    latitude_On: any;
    longitude_Off: any;
    longitude_On: any;
    location: string;
    method: string;
    method_Off: string;
    monthYear: any;
    method_On: string;
    multiple_Shift_Daily: string;
    month: string;
    year: string
    note: any;
    ordinary_Hours: string;
    original_Off: string;
    original_On: string;
    owner: string;
    paid_Breaks: string;
    payroll_ID: string;
    public_Holiday: string;//boolean
    service_Territory: string;
    shift_Classification: string;
    shift_Key: string;
    shift_Non_Shift_Check: string;
    site_Manager: string;
    shift: string;
    start_of_Ordinary_Window: string;
    third_Party_Job_ID: string;
    unpaid_Breaks: string;
    user: string;
    username: string;
    week: number;
    weekday: string;
    who_Approved: any;
    who_Changed_Off: any;
    who_Changed_On: any;
    work_Window: any;
}

export interface ISiteBudgetAllocationHours {
    ID: number;
    QCState: ILookup;
    QCStateValue: string;
    Year: string;
    PeriodicMonth: number;
    EventHours: number;
    SchoolHolidaysHours: number;
    PeriodicalsHours: number;
    BGTMonthHours: number;
    ACTMonthHours: number;
    JobCodeOld: string;
    SiteManage: ICustomPeoplePicker;
    Owner: string;
    ParentAccount: string;
    AccountName: string;
    JobCode: string;
    IsActive: boolean;
    AdditionDetails: IAdditionDetails[];
    dividedBGTMonthHours: number;
    totalBGTMonthHours: any;
    calculateTotalFromDay: any[];
    timeSheetDayVice: ITimeSheet[];
    roasterData: IRoasterData[];
    onlyBGTMonthHours: number;
    HoursType: string;
    SiteNameId: number;
    SiteName: ILookup;
    EffectiveFrom: string;
    EffectiveDate: string;
    PeriodicData: { dateDay: number, hours: number }[];
    MonthViceData: {
        label: string,
        hours: number,
        month: number
    }[];
    AllWeekData: {
        dayName: string;
        hours: number;
        isPublicHoliday: boolean;
    }[];

    PublicHoliday: number;
    Sunday: number;
    Saturday: number;
    Friday: number;
    Thursday: number;
    Wednesday: number;
    Tuesday: number;
    Monday: number;
    SiteManagerId: ICustomPeoplePicker;
    FinancialYear: string;
    IsPeriodicHours: boolean;
}


interface IAdditionDetails {
    Date: any;
    AddedHours: number;
}

export interface ISiteBudgetAdditionalHours {
    ID: number;
    Date: Date | any;
    SiteBudgetAllocationHoursId: number;
    AdditionHours: number;
    Title: string;
}



export interface IWeekOptions extends IReactDropOptionProps {
    startDate: any;
    endDate: any;
    financialYear: any;
    weekNumber: any;

}


export interface IRoasterData {
    breakTime: string;
    date: string;
    eUserName: string;
    eid: string;
    endTime: string;
    hide: string;
    jid: string;
    lid: string;
    note: string;
    roid: string;
    rosterTime: string;
    startTime: string;
    monthYear: string,
    month: string,
    year: string,
}




export interface IAPIData {
    Title: string, URL: string, IsActive: boolean;
}