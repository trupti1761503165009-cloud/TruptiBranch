//public static ValidateForm(data, fields) {
export const ValidateForm = (data: any, fields: any) => {
  let validationCheckResult: any = { isValid: true };
  let isValid = true;

  for (const optType in fields) {
    if (Object.prototype.hasOwnProperty.call(fields, optType)) {
      switch (optType) {
        // case "required":
        //   for (let fieldIndex = 0; fieldIndex < fields[optType].length; fieldIndex++) {
        //     let currentValue = data[fields[optType][fieldIndex]];
        //     if (typeof currentValue !== "boolean") {
        //       // Check for empty values, -1, empty array, empty object, or strings with only spaces
        //       if (!currentValue || currentValue == -1 ||
        //         (Array.isArray(currentValue) && currentValue.length === 0) ||
        //         (!Array.isArray(currentValue) && typeof currentValue === 'object' && Object.keys(currentValue).length === 0) ||
        //         (typeof currentValue === 'string' && currentValue.trim().length === 0)) {
        //         validationCheckResult[fields[optType][fieldIndex]] = `${fields[optType][fieldIndex]} required`;
        //         isValid = false;
        //       }
        //     }
        //   }
        //   break;
        // case "required":
        //   for (
        //     let fieldIndex = 0;
        //     fieldIndex < fields[optType].length;
        //     fieldIndex++
        //   ) {
        //     let currentValue = data[fields[optType][fieldIndex]];

        //     if (
        //       typeof currentValue === "string" &&
        //       currentValue.trim() === ""
        //     ) {
        //       // If the field contains only spaces or is blank
        //       validationCheckResult[fields[optType][fieldIndex]] =
        //         fields[optType][fieldIndex] + " required";
        //       isValid = false;
        //     }
        //   }
        //   break;
        case "required":
          for (
            let fieldIndex = 0;
            fieldIndex < fields[optType].length;
            fieldIndex++
          ) {
            let fieldName = fields[optType][fieldIndex];
            let currentValue = data[fieldName];

            // if (
            //   (typeof currentValue === "string" &&
            //     currentValue.trim() === "") ||
            //   (Array.isArray(currentValue) && currentValue.length === 0)
            // ) {
            //   // Field is either an empty string or an empty array
            //   validationCheckResult[fieldName] = fieldName + " required";
            //   isValid = false;
            // }

            const isInvalid =
              currentValue == null ||
              (typeof currentValue === "string" && currentValue.trim() === "") ||
              (Array.isArray(currentValue) && currentValue.length === 0) ||
              (typeof currentValue === "object" && !Array.isArray(currentValue) && Object.keys(currentValue).length === 0);

            if (isInvalid) {
              validationCheckResult[fieldName] = `${fieldName} required`;
              isValid = false;
            }
          }
          break;

        case "requiredText":
          for (
            let fieldIndex = 0;
            fieldIndex < fields[optType].length;
            fieldIndex++
          ) {
            let currentValue = data[fields[optType][fieldIndex]];
            if (typeof currentValue != "boolean")
              if (
                !currentValue ||
                currentValue == -1 ||
                (Array.isArray(currentValue) && currentValue.length == 0) ||
                (!Array.isArray(currentValue) &&
                  typeof currentValue === "object" &&
                  Object.keys.length == 0)
              ) {
                validationCheckResult[fields[optType][fieldIndex]] =
                  fields[optType][fieldIndex] + " required";
                isValid = false;
              }
          }
          break;

        case "requiredDate":
          for (
            let fieldIndex = 0;
            fieldIndex < fields[optType].length;
            fieldIndex++
          ) {
            let currentValue = data[fields[optType][fieldIndex]];
            if (typeof currentValue != "boolean")
              if (
                !currentValue ||
                currentValue == -1 ||
                (Array.isArray(currentValue) && currentValue.length == 0) ||
                (!Array.isArray(currentValue) &&
                  typeof currentValue === "object" &&
                  Object.keys.length == 0)
              ) {
                validationCheckResult[fields[optType][fieldIndex]] =
                  fields[optType][fieldIndex] + " required";
                isValid = false;
              }
          }
          break;
        case "phone":
          for (
            let fieldIndex = 0;
            fieldIndex < fields[optType].length;
            fieldIndex++
          ) {
            let currentValue = data[fields[optType][fieldIndex]];
            if (
              currentValue ||
              currentValue != -1 ||
              (Array.isArray(currentValue) && currentValue.length > 0)
            ) {
              ///let regExp = /^\(\d{3}\) \d{3}[ ]{1}[-]{1}[ ]{1}\d{4}$/;
              let regExp = /^\d{10}$/;
              let result = regExp.test(currentValue);
              if (!result) {
                isValid = false;
                validationCheckResult[fields[optType][fieldIndex]] =
                  fields[optType][fieldIndex] + " phone";
              }
            }
          }
          break;
        case "number":
          for (
            let fieldIndex = 0;
            fieldIndex < fields[optType].length;
            fieldIndex++
          ) {
            let currentValue = data[fields[optType][fieldIndex]];
            if (
              currentValue ||
              currentValue != -1 ||
              (Array.isArray(currentValue) && currentValue.length > 0)
            ) {
              ///let regExp = /^\(\d{3}\) \d{3}[ ]{1}[-]{1}[ ]{1}\d{4}$/;
              //let regExp = /^\d*\.?\d*$/;
              let regExp = /^(\d{0,2}(\.\d{1,2})?|100(\.00?)?)$/;
              let result = regExp.test(currentValue);
              if (!result) {
                isValid = false;
                validationCheckResult[fields[optType][fieldIndex]] =
                  fields[optType][fieldIndex] + "  number";
              }
            }
          }
          break;
        case "email":
          for (
            let fieldIndex = 0;
            fieldIndex < fields[optType].length;
            fieldIndex++
          ) {
            let currentValue = data[fields[optType][fieldIndex]];
            if (
              currentValue ||
              currentValue != -1 ||
              (Array.isArray(currentValue) && currentValue.length > 0)
            ) {
              let regexemail =
                /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
              let result = regexemail.test(currentValue);
              if (!result) {
                isValid = false;
                validationCheckResult[fields[optType][fieldIndex]] =
                  fields[optType][fieldIndex] + " email";
              }
            }
          }
          break;
        case "regular":
          for (let fieldKey in fields[optType]) {
            //if (fields[optType].hasOwnProperty(fieldKey)) {
            if (
              Object.prototype.hasOwnProperty.call(fields[optType], fieldKey)
            ) {
              if (!validationCheckResult[fieldKey]) {
                let regExp = new RegExp(fields[optType][fieldKey]);
                let result = regExp.test(data[fields[optType][fieldKey]]);
                if (!result) {
                  isValid = false;
                  validationCheckResult[fieldKey] = fieldKey + " is not Valid";
                }
              }
            }
          }
          break;
        case "zip":
          for (
            let fieldIndex = 0;
            fieldIndex < fields[optType].length;
            fieldIndex++
          ) {
            let currentValue = data[fields[optType][fieldIndex]];
            if (
              currentValue ||
              currentValue != -1 ||
              (Array.isArray(currentValue) && currentValue.length > 0)
            ) {
              let regExp = new RegExp("[0-9]{5}");
              let result = regExp.test(currentValue);
              if (!result) {
                isValid = false;
                validationCheckResult[fields[optType][fieldIndex]] =
                  fields[optType][fieldIndex] + " zip";
              }
            }
          }
          break;
        case "excel":
          {
            let extension = data.name.substr(data.name.lastIndexOf("."));
            let allowedExtensionsRegx = /(\.xlsx|\.xls)$/i;
            let isAllowed = allowedExtensionsRegx.test(extension);
            if (!isAllowed) {
              isValid = false;
            }
          }
          break;
        case "pdf":
          {
            let extension = data.name.substr(data.name.lastIndexOf("."));
            let allowedExtensionsRegx = /(\.pdf|\.pdf)$/i;
            let isAllowed = allowedExtensionsRegx.test(extension);
            if (!isAllowed) {
              isValid = false;
            }
          }
          break;
        default:
          break;
      }
      validationCheckResult.isValid = isValid;
    }
  }
  return validationCheckResult;
};
