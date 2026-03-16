export enum FieldType {
    Boolean = "boolean",
    Text = "Text",
    Number = "Number",
    DateTime = "DateTime",
    Lookup = "Lookup",
    LookupById = "LookupById",
    User = "User",
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