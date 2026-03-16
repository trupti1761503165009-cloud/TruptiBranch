// import { IDropdownOption } from "@fluentui/react";
// import * as React from "react";
// import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
// import { ListNames } from "../Enum/ComponentNameEnum";
// import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
// import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
// import { ActionMeta } from "react-select";

// interface IActivityLogUserMasterFilterProps {
//     selectedActivityLogUser: number | string | undefined;
//     onOptionChange: (option: any) => void;
//     defaultOption?: string;
//     provider: IDataProvider;
//     isRequired?: boolean;
//     placeholder?: string;
//     AllOption?: boolean;
//     isMultipleSelect?: boolean;
//     isClearable?: boolean

// }

// export const ActivityLogUserFilter: React.FunctionComponent<IActivityLogUserMasterFilterProps> = (props: IActivityLogUserMasterFilterProps): React.ReactElement => {
//     const [optionsList, setOptionsList] = React.useState<IDropdownOption[]>();
//     const [defaultState, setDefaultState] = React.useState<any>(props?.selectedActivityLogUser);

//     const _onOptionChange = (option: any, actionMeta: ActionMeta<any>): void => {
//         props.onOptionChange(option);
//         // setDefaultState(option?.value);

//         props.onOptionChange(option);
//         if (props.isMultipleSelect) {
//             setDefaultState(option?.map((i: any) => i.value));
//             // setDefaultState(option?.value);
//         } else {
//             setDefaultState(option?.value);
//         }


//     };

//     const getListItems = (): void => {
//         const select = ["Id,UserName"];
//         const queryStringOptions: IPnPQueryOptions = {
//             select: select,
//             listName: ListNames.UserActivityLog
//         };
//         let dropvalue: any = [];
//         if (props.AllOption === true) {
//             dropvalue.push({ key: '', text: '', value: '', label: " --All Username--" });
//         }

//         props.provider.getItemsByQuery(queryStringOptions).then((response: any) => {
//             response.map((State: any) => {
//                 dropvalue.push({ value: State.UserName, key: State.UserName, text: State.UserName, label: State.UserName });
//             });
//             setOptionsList(dropvalue);
//         }).catch((error) => {
//             console.log(error);
//         });
//     };

//     React.useEffect(() => {
//         getListItems();
//     }, []);

//     return <>
//         {optionsList &&
//             <ReactDropdown
//                 options={optionsList}
//                 isMultiSelect={props?.isMultipleSelect || false}
//                 isClearable={props.isClearable || undefined}
//                 defaultOption={defaultState || props?.selectedActivityLogUser}
//                 onChange={_onOptionChange}
//                 placeholder={props.placeholder || "Select Username"}
//             />
//         }
//     </>;
// };
import { IDropdownOption } from "@fluentui/react";
import * as React from "react";
import IPnPQueryOptions from "../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames } from "../Enum/ComponentNameEnum";
import { IDataProvider } from "../../DataProvider/Interface/IDataProvider";
import { ReactDropdown } from "../../webparts/quayClean/components/CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";

interface IActivityLogUserMasterFilterProps {
    selectedActivityLogUser: number | string | undefined;
    onOptionChange: (option: any) => void;
    defaultOption?: string;
    provider: IDataProvider;
    isRequired?: boolean;
    placeholder?: string;
    AllOption?: boolean;
    isMultipleSelect?: boolean;
    isClearable?: boolean;
    isCloseMenuOnSelect?: boolean;
}

// 🔹 Simple in-memory cache for dropdown options
let cachedUserOptions: any[] | null = null;

export const ActivityLogUserFilter: React.FunctionComponent<IActivityLogUserMasterFilterProps> = (
    props: IActivityLogUserMasterFilterProps
): React.ReactElement => {
    const [optionsList, setOptionsList] = React.useState<IDropdownOption[]>();
    const [defaultState, setDefaultState] = React.useState<any>(props?.selectedActivityLogUser);

    const _onOptionChange = (option: any, actionMeta: ActionMeta<any>): void => {
        props.onOptionChange(option);

        if (props.isMultipleSelect) {
            setDefaultState(option?.map((i: any) => i.value));
        } else {
            setDefaultState(option?.value);
        }
    };

    const getListItems = (): void => {
        // If cache exists, use it instead of fetching
        if (cachedUserOptions && cachedUserOptions.length > 0) {
            setOptionsList(cachedUserOptions);
            return;
        }

        const select = ["Id,UserName"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.UserActivityLog,
        };

        let dropvalue: any[] = [];
        if (props.AllOption === true) {
            dropvalue.push({ key: "", text: "", value: "", label: " --All Username--" });
        }

        props.provider
            .getItemsByQuery(queryStringOptions)
            .then((response: any) => {
                response.forEach((State: any) => {
                    dropvalue.push({
                        value: State.UserName,
                        key: State.UserName,
                        text: State.UserName,
                        label: State.UserName,
                    });
                });

                // Store in cache
                cachedUserOptions = dropvalue;
                setOptionsList(dropvalue);
            })
            .catch((error) => {
                console.error(error);

                // If error but cache exists, fallback to cache
                if (cachedUserOptions && cachedUserOptions.length > 0) {
                    setOptionsList(cachedUserOptions);
                }
            });
    };

    React.useEffect(() => {
        getListItems();
    }, []);

    return (
        <>
            {optionsList && (
                <ReactDropdown
                    options={optionsList || []}
                    isMultiSelect={props?.isMultipleSelect || false}
                    isClearable={props.isClearable || undefined}
                    defaultOption={defaultState || props?.selectedActivityLogUser}
                    onChange={_onOptionChange}
                    placeholder={props.placeholder || "Select Username"}
                    // isCloseMenuOnSelect={props.isMultipleSelect || false}
                    // isCloseMenuOnSelect={!props?.isMultipleSelect || undefined}
                    isCloseMenuOnSelect={props.isCloseMenuOnSelect != undefined ? props.isCloseMenuOnSelect : undefined}
                />
            )}
        </>
    );
};
