export interface IEmployee {
    Id?: number;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Email: string;
    PhoneNumber: string;
    Status: string;
    DepartmentId: number;
    ManagerId: number;
    ManagerEmails?: string;
}

export interface IEmployeeView extends IEmployee {
    ID?: number;
    DepartmentValue?: string;
    DepartmentCode?: string;
    CityName?: string;
    Department?: any;
    ManagerValue?: string;
    Manager?: any;
}