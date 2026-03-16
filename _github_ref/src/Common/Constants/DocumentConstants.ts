export enum FieldType {
    Boolean = "boolean",
    Text = "Text",
    Integer = "Integer",
    Number = "Number",
    User = "User",
    Choice = "Choice",
    DateTime = "DateTime",
    LookupById = "LookupById",
    LookupByValue = "LookupByValue"
}

export enum LogicalType {
    EqualTo = "EqualTo",
    NotEqualTo = "NotEqualTo",
    LessThan = "LessThan",
    GreaterThan = "GreaterThan",
    GreaterThanOrEqualTo = "GreaterThanOrEqualTo",
    LessThanOrEqualTo = "LessThanOrEqualTo",
    Contains = "Contains",
    IsNull = "IsNull",
    IsNotNull = "IsNotNull",
    BeginsWith = "BeginsWith",
    In = "In",
}

export interface ICamlQueryFilter {
    fieldName: string;
    fieldValue: any;
    fieldType: FieldType;
    LogicalType: LogicalType
}