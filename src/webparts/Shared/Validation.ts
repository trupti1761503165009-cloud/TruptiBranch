/* eslint-disable @typescript-eslint/explicit-function-return-type */
export enum ValidationType {
    Required = "required",
    Email = "email",
    Number = "number",
    DateRange = "dateRange",
    EndDateValidation = "endDateValidation",
    NumberLimit9999 = "numberLimit9999",
    PhoneNumber = "phoneNumber",
    Excel = "excel",
    PDF = "pdf"
}

const validEmail = new RegExp('^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$');
const validNumber = new RegExp(/^-?\d+(\.\d+)?$/);
// eslint-disable-next-line no-useless-escape
const validPhoneNumber = new RegExp('\[0-9]{10}');
const diffDays = (date: any, otherDate: any) => Math.ceil((date - otherDate) / (1000 * 60));

const getString = (str: string) => {
    return (!!str ? str : "");
};

export const ValidateForm = (data: any, fields: any[]) => {
    let isValid = true;
    const fieldsObj: any = {};
    for (let index = 0; index < fields.length; index++) {
        const field = fields[index];
        for (let i = 0; i < field.type.length; i++) {
            const element = field.type[i];
            switch (element) {
                case ValidationType.Required:
                    if (
                        fieldsObj["isValid" + field.fieldName] === undefined ||
                        fieldsObj["isValid" + field.fieldName]
                    ) {
                        const value = data[field.fieldName];

                        const isValueValid = Array.isArray(value)
                            ? value.length > 0
                            : !!getString(value);

                        fieldsObj["isValid" + field.fieldName] = isValueValid;

                        if (!isValueValid) {
                            fieldsObj["errorMessage" + field.fieldName] = field.displayText + " is required.";
                            isValid = false;
                        }
                    }
                    break;
                case ValidationType.EndDateValidation:
                    if (fieldsObj["isValid" + field.fieldName] === undefined || fieldsObj["isValid" + field.fieldName]) {
                        fieldsObj["isValid" + field.fieldName] = !!getString(data[field.fieldName]) ? true : false;
                        const dates = data[field.fieldName]?.split(",");
                        if (dates.length === 2 && (new Date(dates[1]) > new Date(dates[0]))) {
                            fieldsObj["isValid" + field.fieldName] = false;
                            fieldsObj["errorMessage" + field.fieldName] = field.displayText + " must be greater than " + new Date(dates[0]) + ".";
                            isValid = false;
                        }
                    }
                    break;
                case ValidationType.Email:
                    if (fieldsObj["isValid" + field.fieldName] === undefined || fieldsObj["isValid" + field.fieldName]) {
                        fieldsObj["isValid" + field.fieldName] = validEmail.test(data[field.fieldName]);
                        if (!fieldsObj["isValid" + field.fieldName]) {
                            fieldsObj["errorMessage" + field.fieldName] = field.displayText + " is not a valid email address.";
                            isValid = false;
                        }
                    }
                    break;
                case ValidationType.Number:
                    if (fieldsObj["isValid" + field.fieldName] === undefined || fieldsObj["isValid" + field.fieldName]) {
                        fieldsObj["isValid" + field.fieldName] = validNumber.test(data[field.fieldName]);
                        if (!fieldsObj["isValid" + field.fieldName]) {
                            fieldsObj["errorMessage" + field.fieldName] = field.displayText + " is not a number. Only numbers allowed.";
                            isValid = false;
                        }
                        else if (data[field.fieldName] < 1) {
                            fieldsObj["errorMessage" + field.fieldName] = field.displayText + " is must be greater than 0.";
                            isValid = false;
                            fieldsObj["isValid" + field.fieldName] = false;
                        }
                    }
                    break;
                case ValidationType.NumberLimit9999:
                    if (fieldsObj["isValid" + field.fieldName] === undefined || fieldsObj["isValid" + field.fieldName]) {
                        fieldsObj["isValid" + field.fieldName] = validNumber.test(data[field.fieldName]);
                        if (!fieldsObj["isValid" + field.fieldName]) {
                            fieldsObj["errorMessage" + field.fieldName] = field.displayText + " is not a number. Only numbers allowed.";
                            isValid = false;
                        } else if (data[field.fieldName] > 9999) {
                            fieldsObj["errorMessage" + field.fieldName] = field.displayText + " is must be less than 9999.";
                            isValid = false;
                            fieldsObj["isValid" + field.fieldName] = false;
                        }
                    }
                    break;
                case ValidationType.DateRange:
                    //End date must be greater than start date atleast 5 min.
                    if (fieldsObj["isValid" + field.fieldName] === undefined || fieldsObj["isValid" + field.fieldName]) {
                        const diff = diffDays(new Date(data[field.fieldName].EndDateTime), new Date(data[field.fieldName].StartDateTime));
                        if (diff < 5) {
                            fieldsObj["isValid" + field.fieldName] = false;
                            fieldsObj["errorMessage" + field.fieldName] = field.displayText + " is not a valid date. Minimum 5 min greater than " + field.displaySecondaryText + " time.";
                            isValid = false;
                        }
                    }
                    break;
                case ValidationType.PhoneNumber:
                    if (fieldsObj["isValid" + field.fieldName] === undefined || fieldsObj["isValid" + field.fieldName]) {
                        fieldsObj["isValid" + field.fieldName] = validPhoneNumber.test(data[field.fieldName]);
                        if (!fieldsObj["isValid" + field.fieldName]) {
                            fieldsObj["errorMessage" + field.fieldName] = field.displayText + " is not a valid phone number.";
                            isValid = false;
                        }
                    }
                    break;
                case ValidationType.Excel:
                    if (fieldsObj["isValid" + field.fieldName] === undefined || fieldsObj["isValid" + field.fieldName]) {
                        const extension = data[field.fieldName].split(".").pop();
                        const allowedExtensionsRegx = /(\.xlsx|\.xls)$/i;
                        fieldsObj["isValid" + field.fieldName] = allowedExtensionsRegx.test(extension);
                        if (!fieldsObj["isValid" + field.fieldName]) {
                            fieldsObj["errorMessage" + field.fieldName] = field.displayText + " is not a valid phone number.";
                            isValid = false;
                        }
                    }
                    break;
                case ValidationType.PDF:
                    if (fieldsObj["isValid" + field.fieldName] === undefined || fieldsObj["isValid" + field.fieldName]) {
                        const extension = data[field.fieldName].split(".").pop();
                        const allowedExtensionsRegx = /(\.pdf|\.pdf)$/i;
                        fieldsObj["isValid" + field.fieldName] = allowedExtensionsRegx.test(extension);
                        if (!fieldsObj["isValid" + field.fieldName]) {
                            fieldsObj["errorMessage" + field.fieldName] = field.displayText + " is not a valid phone number.";
                            isValid = false;
                        }
                    }
                    break
                default:
                    if (fieldsObj["isValid" + field.fieldName] === undefined || fieldsObj["isValid" + field.fieldName]) {
                        fieldsObj["isValid" + field.fieldName] = false;
                        if (!fieldsObj["isValid" + field.fieldName]) {
                            fieldsObj["errorMessage" + field.fieldName] = field.displayText + " Something went wrong.";
                            isValid = false;
                        }
                    }
                    break;
            }
            if (fieldsObj["isValid" + field.fieldName]) {
                fieldsObj["errorMessage" + field.fieldName] = "";
            }
        }

    }
    return { isValid: isValid, fields: fieldsObj };
};