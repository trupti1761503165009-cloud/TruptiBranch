export enum FeildType {
    User = "User",
    Text = "Text",
    Number = "Number",
    DateTime = "DateTime",
    Date = "Date",
    Boolean = "boolean",
    LookupField = "Lookup",
    Choices = "Choices",
}

export const ColumnTypeArray: any[] = [FeildType.LookupField, FeildType.User]