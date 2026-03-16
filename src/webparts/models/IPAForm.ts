export interface IPAFormData {
    Id?: any;
    Title?: any
    EmplNameId: any,
    EmplName: string,
    EmployeeNameId: string;
    ProjectName: string;
    ProjManagerId: any[];
    RoleInProject: { value: string, label: string };
    ModeofProject: { value: string, label: string };
    RoleInProjectOptions: { value: string, label: string }[] | any;
    ModeofProjectOptions: { value: string, label: string }[] | any;
    StartDate: Date | any;
    EndDate: Date | any;
    EstimatedHours: number | any;
    ActualHour: number | any;
    PreparedDocument: any[];
    PreparedDocumentOptions: { value: string, label: string }[] | any;
    WorkedModuleName: string;
    ProjectExperience: string;
    Learnings: string;
    SkillUsed: string;
    SPUserId?: any
    PAStatus?: string;
    PAYear?: string;
    AllProjectSubmissiondata: any[],
    IsReviewed?: boolean;
}
