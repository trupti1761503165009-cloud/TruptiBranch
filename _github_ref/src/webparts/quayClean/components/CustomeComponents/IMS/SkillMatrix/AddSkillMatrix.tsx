/* eslint-disable no-prototype-builtins */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { ChoiceGroup, DatePicker, DefaultButton, defaultDatePickerStrings, DialogFooter, Dropdown, FocusTrapZone, IDropdownOption, Layer, mergeStyleSets, Overlay, Popup, PrimaryButton, TextField, Toggle } from "@fluentui/react";

import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor } from "../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../Common/ToastService";
import { logGenerator, onFormatDate, removeElementOfBreadCrum, _siteData, UserActivityLog } from "../../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../../Interfaces/IAddNewHelpDesk";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Loader } from "../../../CommonComponents/Loader";
import moment from "moment";
import { TrainingAttendanceFilter } from "../../../../../../Common/Filter/TrainingAttendanceFilter";
import { useBoolean } from "@fluentui/react-hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactDropdown } from "../../../CommonComponents/ReactDropdown";
import { ActionMeta } from "react-select";
import { SignatureComponent } from "../../../CommonComponents/SignatureComponent";
import React from "react";
import { IBreadCrum } from "../../../../../../Interfaces/IBreadCrum";
import { GridViewSkillMatrix } from "./GridViewSkillMatrixs";
import { SiteFilter } from "../../../../../../Common/Filter/SiteFilter";
import SuccessComponent from "../../../CommonComponents/SuccessComponent";
import { AddOtherEmployee } from "../../../../../../Common/AddOtherEmployee";
import { attendeeOptions, DateFormat, DateTimeFormate } from "../../../../../../Common/Constants/CommonConstants";
import { AddSingleOtherEmployee } from "../../../../../../Common/AddSingleOtherEmployee";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
import { IMSLocationCommonFilter } from "../../../../../../Common/Filter/IMSLocationCommonFilter";
const imgLogo = require('../../../../assets/images/logo.png');
const dropdownOptions = [
    { key: 'Yes', text: 'Yes' },
    { key: 'No', text: 'No' },
    { key: 'N/A', text: 'N/A' }
];
const CompetencyOptions = [
    { key: 'Yes', text: 'Yes' },
    { key: 'No', text: 'No' }
];



export const AddSkillMatrix: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const [value, setValue] = React.useState(props.initialValue);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail, currentUser } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
    const [SkillMatrixMaster, setSkillMatrixMaster] = React.useState<any[]>([]);
    const [SMData, setSMData] = React.useState<any[]>([]);
    const [TransformData, setTransformData] = React.useState<any[]>([]);
    const [PreTransformData, setPreTransformData] = React.useState<any[]>([]);
    const [selectedTrainingAttendance, setSelectedTrainingAttendance] = React.useState<any>(null);
    const [CreateSMData, setCreateSMData] = React.useState<any[]>([]);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [isPopupVisible2, { setTrue: showPopup2, setFalse: hidePopup2 }] = useBoolean(false);
    const [isPopupVisibleLink, { setTrue: showPopupLink, setFalse: hidePopupLink }] = useBoolean(false);
    const [SelectedItem, setSelectedItem] = React.useState<number>();
    const [UpdateItem, setUpdateItem] = React.useState<number>();
    const [noRecordObjects, setNoRecordObjects] = React.useState<any[]>([]);
    const [IsReload, setIsReload] = React.useState<boolean>(false);
    const [ErrorData, setErrorData] = React.useState<any[]>([]);
    const [defaultManager, setDefaultManager] = React.useState<any>(props?.componentProps?.loginUserRoleDetails?.Id);
    const [selectedManager, setSelectedManager] = React.useState<any>();
    const [ManagerOptions, setManagerOptions] = React.useState<IDropdownOption[] | any>();
    const [SkillMatrixData, setSkillMatrixData] = React.useState<any[]>([]);
    const [DocumentData, setDocumentData] = React.useState<any[]>([]);
    const [DetailsData, setDetailsData] = React.useState<any[]>([]);
    const [MatchingItem, setMatchingItem] = React.useState<string>("");
    const [SignUpdateId, setSignUpdateId] = React.useState<number>(0);
    const [SiteData, setSiteData] = React.useState<any[]>([]);
    const [ToolboxTalkData, setToolboxTalkData] = React.useState<any[]>([]);
    const [SiteName, setSiteName] = React.useState<any>(props?.breadCrumItems[0]?.text);
    const [StateName, setStateName] = React.useState<string>();
    const [StateId, setStateId] = React.useState<string>(props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);
    const [MeetingLocation, setMeetingLocation] = React.useState<string>("");
    const [GeneratedID, setGeneratedID] = React.useState<string>("");
    const [ClientLookUp, setClientLookUp] = React.useState<number>();
    const [Today, setToday] = React.useState<string>(moment().format('DD-MM-YYYY'));
    const [SiteManager, setSiteManager] = React.useState<any>(props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.SM);
    const [UpdateItemId, setUpdateItemId] = React.useState<any>();
    const [IsUpdate, setIsUpdate] = React.useState<boolean>(false);
    const [showToggles, setShowToggles] = React.useState<any>({});
    const [showToggles2, setShowToggles2] = React.useState<any>({});
    const [toggleEnabled, setToggleEnabled] = React.useState<any>({});
    const [signatureURL, setSignatureURL] = React.useState<string | null>(null);
    const [signatureURLFull, setSignatureURLFull] = React.useState<string | null>(null);
    const [selectedRows, setSelectedRows] = React.useState<{ [key: string]: boolean }>({});
    const [isAllSelected, setIsAllSelected] = React.useState(false);
    const selectedRowCount = Object.values(selectedRows).filter(Boolean).length;
    const [multiSelectDropdownValue, setMultiSelectDropdownValue] = React.useState<string | undefined>(undefined);
    const [multiSelectTrainerToggle, setMultiSelectTrainerToggle] = React.useState(false);
    const [multiSelectCleanerToggle, setMultiSelectCleanerToggle] = React.useState(false);
    const [num, setNum] = React.useState(false);
    const [InfoData, setInfoData] = React.useState<any[]>([]);
    const [IsLinked, setIsLinked] = React.useState<boolean>(false);
    const [IsRecordExist, setIsRecordExist] = React.useState<boolean>(false);
    const [LinkId, setLinkId] = React.useState<number>(0);
    const [ShowLink, setShowLink] = React.useState<boolean>(false);
    const [currentLinkId, setCurrentLinkId] = React.useState(LinkId);
    const [FormStatus, setFormStatus] = React.useState<string>("");
    const [selectedSite, setSelectedSite] = React.useState<any>("");
    const [isComponentClosed, setIsComponentClosed] = React.useState(false);
    const isVisibleCrud = React.useRef<boolean>(false);
    const [width, setWidth] = React.useState<string>("500px");
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("500px");
        }
    }, [window.innerWidth]);

    const [masterStateId, setMasterStateId] = React.useState(SiteData[0]?.StateId || props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);

    const popupStyles = mergeStyleSets({
        root: {
            background: 'rgba(0, 0, 0, 0.2)',
            bottom: '0',
            left: '0',
            position: 'fixed',
            right: '0',
            top: '0',
        },
        content: {
            background: 'white',
            left: '50%',
            maxWidth: '400px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
        }
    });

    React.useEffect(() => {
        setMasterStateId(SiteData[0]?.StateId || props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);
    }, [SiteData[0]?.StateId, StateId]);

    const onSiteChange = (selectedOption: any): void => {
        setMeetingLocation("");
        setSelectedSite(selectedOption?.value);
    };

    const onIMSLocationChange = (loc: any): void => {
        setMeetingLocation(loc);
    };

    React.useEffect(() => {
        setCurrentLinkId(LinkId);
    }, [LinkId]);

    const handleMultiToggleChange = (isTrainerToggle: boolean, value: boolean) => {
        Object.keys(selectedRows).forEach((itemId) => {
            if (selectedRows[itemId]) { // Only update if row is selected
                if (isTrainerToggle) {
                    handleToggleChange(itemId, value); // Apply change for Signature Trainer
                } else {
                    handleToggleChange2(itemId, value); // Apply change for Signature Cleaner
                }
            }
        });
    };

    const handleToggleChangeForAll = (isTrainerToggle: boolean, checked: boolean | undefined) => {
        const safeChecked = checked ?? false; // Default to false if checked is undefined
        setMultiSelectTrainerToggle(isTrainerToggle ? safeChecked : multiSelectTrainerToggle);
        setMultiSelectCleanerToggle(isTrainerToggle ? multiSelectCleanerToggle : safeChecked);
        handleMultiToggleChange(isTrainerToggle, safeChecked); // Handle toggle change
    };

    const handleSelectAll = (checked: boolean) => {
        const newSelectedRows = Object.fromEntries(
            Object.entries(SkillMatrixMaster).flatMap(([skillMatrix, details]) =>
                details.map((detail: any) => [detail.ID, checked])
            )
        );
        setSelectedRows(newSelectedRows);
        setIsAllSelected(checked);
    };
    const handleRowCheckboxChange = (id: string, checked: boolean) => {
        setSelectedRows(prevSelected => ({
            ...prevSelected,
            [id]: checked,
        }));
    };

    const handleMultiSelectDropdownChange = (selectedKey: string) => {
        setNum(true);
        if (selectedKey == "Yes") {
            setMultiSelectTrainerToggle(true);
            setMultiSelectCleanerToggle(true);
        } else {
            setMultiSelectTrainerToggle(false);
            setMultiSelectCleanerToggle(false);
        }
        Object.keys(selectedRows).forEach((itemId) => {
            if (selectedRows[itemId]) { // Only update if row is selected
                onToolBoxTalkStatusChange(itemId, selectedKey); // Apply the dropdown change
                // Update the toggleEnabled state based on the selectedKey
                setToggleEnabled((prev: any) => ({
                    ...prev,
                    [itemId]: selectedKey === 'No' ? false : true,
                }));
                if (selectedKey !== 'Yes') {


                    setShowToggles((prev: any) => ({
                        ...prev,
                        [itemId]: false
                    }));
                    setShowToggles2((prev: any) => ({
                        ...prev,
                        [itemId]: false
                    }));
                }
            }
        });

        setMultiSelectDropdownValue(selectedKey);
        setNum(true);
    };

    const _onManagerChange = (option: any, actionMeta: ActionMeta<any>): void => {
        setSelectedManager(option?.text);
        setDefaultManager(option?.value);
    };

    const initialStatus = SMData.reduce((acc: any, detail: any) => {
        acc[detail.ID] = "N/A";
        return acc;
    }, {});

    const [selectedToolBoxTalkStatus, setSelectedToolBoxTalkStatus] = React.useState<any>(initialStatus);
    const [SignatureData, setSignatureData] = React.useState<any[]>([]);

    const _SkillMatrixSignature = () => {
        setIsLoading(true);
        try {
            const select = ["ID,CleanerSignatureFull,CleanerSignatureFullShort,TrainerSignatureShort,TrainerSignatureFull,QuaycleanEmployeeId,QuaycleanEmployee/Email,QuaycleanEmployee/FirstName,QuaycleanEmployee/LastName,SkillMatrixId,Created"];
            const expand = ["QuaycleanEmployee"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                filter: `SkillMatrixId eq ${props?.componentProps?.UpdateItemID} and IsActive eq 1`,
                listName: ListNames.SkillMatrixSignature,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const SignatureData = results.map((data) => {
                        return {
                            ID: data.ID,
                            QuaycleanEmployeeId: !!data.QuaycleanEmployeeId ? data.QuaycleanEmployeeId : '',
                            QuaycleanEmployeeEmail: !!data.QuaycleanEmployeeId ? data.QuaycleanEmployee.Email : '',
                            SkillMatrixId: !!data.SkillMatrixId ? data.SkillMatrixId : '',
                            Signature: !!data.CleanerSignatureFull ? data.CleanerSignatureFull : '',
                            Cleaner: !!data.CleanerSignatureFull ? data.CleanerSignatureFull : '',
                            CleanerSort: !!data.CleanerSignatureFullShort ? data.CleanerSignatureFullShort : '',
                            Trainer: !!data.TrainerSignatureFull ? data.TrainerSignatureFull : '',
                            TrainerSort: !!data.TrainerSignatureShort ? data.TrainerSignatureShort : '',
                            Name: !!data.QuaycleanEmployeeId ? data.QuaycleanEmployee.FirstName + " " + data.QuaycleanEmployee.LastName : '',
                            Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
                        };
                    });
                    setSignatureData(SignatureData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (props.componentProps.isAllEdit === true) {
            const initialToggles1 = PreTransformData.reduce((acc: any, detail: any) => {
                acc[detail.ID] = detail.SignatureTrainer === "Yes";
                setToggleEnabled((prev: any) => ({
                    ...prev,
                    [detail.ID]: acc
                }));
                return acc;

            }, {});
            const initialToggles2 = PreTransformData.reduce((acc: any, detail: any) => {
                acc[detail.ID] = detail.SignatureCleaner === "Yes";
                return acc;
            }, {});
            setShowToggles(initialToggles1);
            setShowToggles2(initialToggles2);
        } else {
            const initialToggles = SMData.reduce((acc: any, detail: any) => {
                acc[detail.ID] = false;
                return acc;
            }, {});
            setShowToggles(initialToggles);
            setShowToggles2(initialToggles);
        }
    }, [SMData, PreTransformData]);

    const onToolBoxTalkStatusChange = (itemId: any, selectedKey: any) => {
        setNum(false);
        setSelectedItem(itemId);
        setSelectedToolBoxTalkStatus((prev: any) => ({
            ...prev,
            [itemId]: selectedKey
        }));

        if (selectedKey === 'No') {
            if (props.componentProps.isAllEdit) {
                const updatedPreTransformData = PreTransformData.map((item) => {
                    if (item.ID === itemId && selectedKey === 'No' && props.componentProps.isAllEdit) {
                        return {
                            ...item,
                            SignatureTrainer: "No",
                            SignatureCleaner: "No",
                        };
                    }
                    return item;
                });
                setPreTransformData(updatedPreTransformData);
            }
            if (IsUpdate) {
                hidePopup();
                const selectedData = SMData?.find(item => Number(item.ID) === Number(SelectedItem));
                const noRecordObject = {
                    Id: SelectedItem,
                    Status: 'No',
                    Title: selectedData.Title,
                    SkillMatrix: selectedData.SkillMatrix,
                    IMSNos: selectedData.IMSNos
                };
                setNoRecordObjects((prev: any) => [...prev, noRecordObject]);
                setIsReload(true);
            } else {
                showPopup();
            }
            setShowToggles((prev: any) => ({
                ...prev,
                [itemId]: false
            }));
            setShowToggles2((prev: any) => ({
                ...prev,
                [itemId]: false
            }));
        }
        else {
            const updatedNoRecordObjects = noRecordObjects.filter(item => Number(item.Id) !== Number(itemId));
            /**
 * When Value select true then default set true 
 */
            if (selectedKey === "Yes") {
                setShowToggles((prev: any) => ({
                    ...prev,
                    [itemId]: true
                }));
                setShowToggles2((prev: any) => ({
                    ...prev,
                    [itemId]: true
                }));
            } else if (selectedKey === "N/A") {
                setShowToggles((prev: any) => ({
                    ...prev,
                    [itemId]: false
                }));
                setShowToggles2((prev: any) => ({
                    ...prev,
                    [itemId]: false
                }));
            }
            setNoRecordObjects(updatedNoRecordObjects);
            setIsReload(true);
        }

        setToggleEnabled((prev: any) => {
            if (selectedKey === 'Yes' && prev[itemId] === true) {
                return {
                    ...prev,
                    [itemId]: false // Set value to false
                };
            } else if (selectedKey === 'No') {
                return {
                    ...prev,
                    [itemId]: false // Handle the case for "No"
                };
            } else {
                return {
                    ...prev,
                    [itemId]: true // Handle other cases
                };
            }
        });

    };

    const setArrayOfDocument = () => {
        const allIMSNos: string[] = noRecordObjects.flatMap(item => parseIMSNos(item.IMSNos));
        const matchingIDs = DocumentData.filter(doc =>
            allIMSNos.some(ims => doc.FileLeafRef.includes(ims))
        ).map(doc => doc.ID);
        const resultString = matchingIDs.join(', ');
        setMatchingItem(resultString);
    };

    const parseIMSNos = (imsNos: string): string[] => {
        const result: string[] = [];
        const parts = imsNos.split(' ');
        if (parts.length !== 2) return result;
        const prefix = parts[0];
        const numbers = parts[1];
        if (numbers.includes('-')) {
            const [start, end] = numbers.split('-').map(num => parseInt(num, 10));
            for (let i = start; i <= end; i++) {
                result.push(`${prefix} ${i.toString().padStart(3, '0')}`);
            }
        } else if (numbers.includes('&')) {
            const individualNumbers = numbers.split('&');
            individualNumbers.forEach(num => {
                result.push(`${prefix} ${num.padStart(3, '0')}`);
            });
        } else {
            result.push(`${prefix} ${numbers}`);
        }
        return result;
    };

    React.useEffect(() => {
        if (props?.componentProps?.isAllEdit !== true) {
            if (noRecordObjects.length > 0) {
                setArrayOfDocument();
                const updatedSMMasterData = SMData.map(item => {
                    const isTraining = noRecordObjects.some((noRecord: any) => Number(noRecord.Id) === item.ID);
                    return {
                        ...item,
                        IsTraining: isTraining
                    };
                });
                const groupedDetails = updatedSMMasterData.reduce((acc: any, detail: any) => {
                    if (!acc[detail.SkillMatrix]) {
                        acc[detail.SkillMatrix] = [];
                    }
                    acc[detail.SkillMatrix].push(detail);
                    return acc;
                }, {} as { [key: string]: typeof updatedSMMasterData });
                setSkillMatrixMaster(groupedDetails);
            } else {
                setArrayOfDocument();
                const updatedSMMasterData = SMData.map(item => {
                    const isTraining = noRecordObjects.some((noRecord: any) => Number(noRecord.Id) === item.ID);
                    return {
                        ...item,
                        IsTraining: false
                    };
                });
                const groupedDetails = updatedSMMasterData.reduce((acc: any, detail: any) => {
                    if (!acc[detail.SkillMatrix]) {
                        acc[detail.SkillMatrix] = [];
                    }
                    acc[detail.SkillMatrix].push(detail);
                    return acc;
                }, {} as { [key: string]: typeof updatedSMMasterData });
                setSkillMatrixMaster(groupedDetails);
            }
        } else {
            if (noRecordObjects.length > 0) {
                setArrayOfDocument();
                const updatedSMMasterData = PreTransformData.map(item => {
                    const isTraining = noRecordObjects.some((noRecord: any) => noRecord.Id === item.ID);
                    return {
                        ...item,
                        IsTraining: isTraining,
                        IsInCompletent: isTraining
                    };
                });
                const groupedDetails = updatedSMMasterData.reduce((acc: any, detail: any) => {
                    if (!acc[detail.SkillMatrix]) {
                        acc[detail.SkillMatrix] = [];
                    }
                    acc[detail.SkillMatrix].push(detail);
                    return acc;
                }, {} as { [key: string]: typeof updatedSMMasterData });
                setTransformData(groupedDetails);
            }
        }

    }, [noRecordObjects]);

    React.useEffect(() => {
        if (SkillMatrixData.length > 0) {
            try {
                const select = ["ID,IsActive,SkillMatrixId"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    filter: `SkillMatrixId eq '${SkillMatrixData[0]?.ID}' and IsActive eq 1`,
                    listName: ListNames.SkillMatrixSignature,
                };
                props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                    if (!!results) {
                        setSignUpdateId(results[0]?.ID);
                    }
                }).catch((error) => {
                    console.log(error);
                });
            } catch (ex) {
                console.log(ex);
            }
        }
    }, [SkillMatrixData]);

    const handleToggleChange = (itemId: any, checked: any) => {
        setShowToggles((prev: any) => ({
            ...prev,
            [itemId]: checked
        }));
    };

    const handleToggleChange2 = (itemId: any, checked: any) => {
        setShowToggles2((prev: any) => ({
            ...prev,
            [itemId]: checked
        }));
    };

    const fetchSkillMatrixRecords = (TrainingAttendance: any): Promise<any[]> => {
        const select = ["ID,AttendeesEmailId,FormStatus"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            filter: `AttendeesEmailId eq '${TrainingAttendance.value}' and IsActive eq 1`,
            listName: ListNames.SkillMatrix,
        };
        return props.provider.getItemsByQuery(queryStringOptions);
    };

    const fetchSkillMatrixInfo = (TrainingAttendance: any): Promise<any[]> => {
        const select = ["ID,SiteNameId,SiteName/Title"];
        const expand = ["SiteName"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            expand: expand,
            filter: `AttendeesEmailId eq '${TrainingAttendance.value}' and IsDeleted ne 1'`,
            listName: ListNames.SkillMatrixInfo,
        };
        return props.provider.getItemsByQuery(queryStringOptions);
    };

    const [selectedAttendeeType, setSelectedAttendeeType] = React.useState<string | undefined>('Quayclean Employee');
    const [selectedAttendeeOptions, setSelectedAttendeeOptions] = React.useState<any[]>([]);
    const onChange = React.useCallback((ev: React.SyntheticEvent<HTMLElement>, option: any) => {
        setSelectedAttendeeType(option.key);
    }, []);

    const onEmployeeChange = async (selectedOptions: any): Promise<void> => {
        setSelectedAttendeeOptions(selectedOptions);

        setClientLookUp(selectedOptions.value);
        setIsLoading(true); // Start loading state

        try {
            const [skillMatrixResults, skillMatrixInfoResults] = await Promise.all([
                fetchSkillMatrixRecords(selectedOptions),
                fetchSkillMatrixInfo(selectedOptions)
            ]);
            setFormStatus(skillMatrixResults[0]?.FormStatus);
            let IsRecord = false;
            if (skillMatrixResults && skillMatrixResults.length > 0) {
                setLinkId(skillMatrixResults[0]?.Id);
                setIsRecordExist(true);
                if (!props.originalSiteMasterId) {
                    // setClientLookUp(undefined);
                    // setSelectedTrainingAttendance(null);
                }
                IsRecord = true;
            } else {
                setLinkId(0);
                setIsRecordExist(false);
                IsRecord = false;
            }

            if (skillMatrixInfoResults) {
                const InfoData = skillMatrixInfoResults.map((data) => {
                    return {
                        ID: data.ID,
                        SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                        SiteName: !!data.SiteName ? data.SiteName.Title : '',
                    };
                });
                setInfoData(InfoData);

                // Determine which target site to check for (selectedSite if user chose one, otherwise current original site)
                const targetSiteId = selectedSite || props.originalSiteMasterId;
                // Check if the site exists in the results
                const siteExists = InfoData.some(item => item.SiteNameId === targetSiteId);

                // Update state based on the `IsRecord` and `siteExists` conditions
                setIsLinked(IsRecord && !siteExists);
                setShowLink(IsRecord && siteExists);

                if (!siteExists) {
                    setSelectedTrainingAttendance(selectedOptions.text);
                }
            }

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false); // End loading state
        }
    };

    const onTrainingAttendanceChange = async (TrainingAttendance: any): Promise<void> => {
        setClientLookUp(TrainingAttendance.value);
        setIsLoading(true); // Start loading state

        try {
            const [skillMatrixResults, skillMatrixInfoResults] = await Promise.all([
                fetchSkillMatrixRecords(TrainingAttendance),
                fetchSkillMatrixInfo(TrainingAttendance)
            ]);
            setFormStatus(skillMatrixResults[0]?.FormStatus);
            let IsRecord = false;
            if (skillMatrixResults && skillMatrixResults.length > 0) {
                setLinkId(skillMatrixResults[0]?.Id);
                setIsRecordExist(true);
                if (!props.originalSiteMasterId) {
                    // setClientLookUp(undefined);
                    // setSelectedTrainingAttendance(null);
                }
                IsRecord = true;
            } else {
                setLinkId(0);
                setIsRecordExist(false);
                IsRecord = false;
            }

            if (skillMatrixInfoResults) {
                const InfoData = skillMatrixInfoResults.map((data) => {
                    return {
                        ID: data.ID,
                        SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                        SiteName: !!data.SiteName ? data.SiteName.Title : '',
                    };
                });
                setInfoData(InfoData);

                // Determine which target site to check for (selectedSite if user chose one, otherwise current original site)
                const targetSiteId = selectedSite || props.originalSiteMasterId;
                // Check if the site exists in the results
                const siteExists = InfoData.some(item => item.SiteNameId === targetSiteId);

                // Update state based on the `IsRecord` and `siteExists` conditions
                setIsLinked(IsRecord && !siteExists);
                setShowLink(IsRecord && siteExists);

                if (!siteExists) {
                    setSelectedTrainingAttendance(TrainingAttendance.text);
                }
            }

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false); // End loading state
        }
    };

    const [state, SetState] = React.useState<IHelpDeskFormState>({
        CallerOptions: [],
        CategoryOptions: [],
        EventOptions: [],
        isdisableField: !!isAddNewHelpDesk ? false : true,
        isAddNewHelpDesk: !!isAddNewHelpDesk,
        isformValidationModelOpen: false,
        validationMessage: null
    });

    React.useEffect(() => {
        if (ToolboxTalkData.length > 0) {
            const initialToggles = ToolboxTalkData.reduce((acc, item) => {
                acc[item.ID] = true;
                return acc;
            }, {});
            setShowToggles(initialToggles);
        }
    }, [ToolboxTalkData]);

    const onClickEdit = (itemId: any) => {
        setSelectedItem(itemId);
        setUpdateItem(itemId);
        showPopup();
    };

    const onClickLinkButton = async () => {
        showPopup();
    };

    const onClickEditButton = async () => {
        showPopupLink();
        // setShowLink(false);
    };

    const onClickLink = async () => {
        const SkillMatrixInfo = {
            SkillMatrixId: LinkId ? LinkId : 0,
            AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
            SiteNameId: selectedSite || Number(props?.originalSiteMasterId),
        }
        try {
            const created: any = await props.provider.createItem(SkillMatrixInfo, ListNames.SkillMatrixInfo);
            // Update InfoData immediately so UI reflects the newly linked site
            const siteId = selectedSite || Number(props?.originalSiteMasterId);
            const siteName = SiteData?.find((s: any) => Number(s.ID) === Number(siteId))?.Title || props.componentProps?.siteName || '';
            const newEntry = {
                ID: created?.ID || 0,
                SiteNameId: siteId,
                SiteName: siteName
            };
            setInfoData((prev: any[]) => {
                // avoid duplicates
                const exists = prev.some(i => Number(i.SiteNameId) === Number(siteId));
                return exists ? prev : [...prev, newEntry];
            });
            setIsLinked(false);
            setShowLink(true);
        } catch (err) {
            console.error('Error linking SkillMatrixInfo', err);
        }
    };

    const _DocumentData = async () => {
        props.provider.getTrainingMaterial().then((results: any[]) => {
            if (!!results) {
                setDocumentData(results);
            }
        }).catch((error) => {
            console.log(error);
        });
    };

    const _SkillMatrixData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,TrainingAttendance,FormStatus,AttendeesEmailId,AttendeesEmail/Email,VenueTrained,Created,Modified"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `Id eq '${props?.componentProps?.siteMasterId}' and IsActive eq 1`,
                expand: ["AttendeesEmail"],
                listName: ListNames.SkillMatrix,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    let SkillMatrixData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                Date: !!data.Created ? moment(data.Created).format(DateFormat) : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                FormStatus: !!data.FormStatus ? data.FormStatus : '',
                                TrainingAttendance: !!data.TrainingAttendance ? data.TrainingAttendance : '',
                                VenueTrained: !!data.VenueTrained ? data.VenueTrained : '',
                                Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
                                Modified: !!data.Modified ? data.Modified : null,
                                AttendeesEmail: !!data.AttendeesEmailId ? data.AttendeesEmail : '',
                                AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : 0,
                            }
                        );
                    });
                    SkillMatrixData = SkillMatrixData.sort((a: any, b: any) => {
                        return moment(b.Modified).diff(moment(a.Modified));
                    });
                    if (props?.componentProps?.isAllEdit === true) {
                        setMeetingLocation(SkillMatrixData[0]?.VenueTrained);
                        setSelectedTrainingAttendance(SkillMatrixData[0]?.TrainingAttendance);
                        setSelectedTrainingAttendance(SkillMatrixData[0]?.AttendeesEmailId);
                    }
                    setSkillMatrixData(SkillMatrixData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const _SkillMatrixDetailsData = () => {
        try {
            let filter = "";
            if (props.componentProps.isAllEdit === true) {
                filter = `SkillMatrixId eq '${props?.componentProps?.UpdateItemID}'`;
            } else {
                filter = `SkillMatrixId eq '${props?.componentProps?.siteMasterId}' and IsTraining eq 1`;
            }
            const select = ["ID,Title,Completed,IMSNos,SkillMatrixId,SignatureTrainer,SignatureCleaner,SkillMatrixName,IsTraining"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: filter,
                // filter: `SkillMatrixId eq '${props?.componentProps?.siteMasterId}' and IsTraining eq 1`,

                listName: ListNames.SkillMatrixMasterData,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const DetailData: any = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: !!data.Title ? data.Title : '',
                                IMSNos: !!data.IMSNos ? data.IMSNos : '',
                                Completed: !!data.Completed ? data.Completed : '',
                                SkillMatrix: !!data.SkillMatrixName ? data.SkillMatrixName : '',
                                SkillMatrixId: !!data.SkillMatrixId ? data.SkillMatrixId : '',
                                IsTraining: !!data.IsTraining === true ? 'Yes' : 'No',
                                SignatureTrainer: !!data.SignatureTrainer === true ? 'Yes' : 'No',
                                SignatureCleaner: !!data.SignatureCleaner === true ? 'Yes' : 'No',
                            }
                        );
                    });

                    setDetailsData(DetailData);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
        }
    };

    const _SkillMaatrixMasterData = () => {
        try {
            const select = ["ID,Title,IMSNos,SkillMatrix"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.SkillMatrixMaster,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const SMMasterData: any = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: !!data.Title ? data.Title : '',
                                IMSNos: !!data.IMSNos ? data.IMSNos : '',
                                SkillMatrix: !!data.SkillMatrix ? data.SkillMatrix : '',
                            }
                        );
                    });
                    setSMData(SMMasterData);
                    const groupedDetails = SMMasterData.reduce((acc: any, detail: any) => {
                        if (!acc[detail.SkillMatrix]) {
                            acc[detail.SkillMatrix] = [];
                        }
                        acc[detail.SkillMatrix].push(detail);
                        return acc;
                    }, {} as { [key: string]: typeof SMMasterData });
                    setSkillMatrixMaster(groupedDetails);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
        }
    };




    const onClickClose = () => {
        if (props.isForm) {
            console.log();
        } else {
            if (isSiteLevelComponent) {
                // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                // props.manageComponentView({
                //     currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.qCStateId, originalState: StateName, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "SkillMatrix",
                // });
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                    selectedZoneDetails: selectedZoneDetails,
                    isShowDetailOnly: true,
                    pivotName: "IMSKey",
                    subpivotName: "SkillMatrix",
                });
            } else {
                if (props.componentProps.isNotGeneral === false) {
                    const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                    manageComponentView({ currentComponentName: ComponentNameEnum.ListSkillMatrix, qCStateId: props?.componentProps?.qCStateId, breadCrumItems: breadCrumItems, subpivotName: "SkillMatrix", selectedZoneDetails: props.componentProps.selectedZoneDetails });
                } else {
                    const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                    manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, breadCrumItems: breadCrumItems, subpivotName: "SkillMatrix", selectedZoneDetails: props.componentProps.selectedZoneDetails });
                }
            }
        }
    };

    const SaveUpdateClose = () => {
        if (props.isForm) {
            setIsComponentClosed(true);
        } else {
            if (isSiteLevelComponent) {
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                    selectedZoneDetails: selectedZoneDetails,
                    isShowDetailOnly: true,
                    pivotName: "IMSKey",
                    subpivotName: "SkillMatrix",
                });
            } else {
                // if (props.isNotGeneral === false) {
                //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                //     manageComponentView({ currentComponentName: ComponentNameEnum.ListSkillMatrix, qCStateId: props?.componentProps?.qCStateId, breadCrumItems: breadCrumItems, subpivotName: "SkillMatrix" });
                // } else {
                const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, breadCrumItems: breadCrumItems, subpivotName: "SkillMatrix" });
                // }
            }
        }
    }

    React.useEffect(() => {
        const FINALOBJ = SMData.map(item => ({
            ID: item.ID,
            Title: item.Title,
            SkillMatrixName: item.SkillMatrix,
            Completed: selectedToolBoxTalkStatus[item.ID] || "N/A", // Use "N/A" if no status is found
            IMSNos: item.IMSNos,
            SignatureTrainer: showToggles[item.ID] || false, // Use false if no toggle value is found
            SignatureCleaner: showToggles2[item.ID] || false // Use false if no toggle value is found
        }));
        setCreateSMData(FINALOBJ);


    }, [SMData, selectedToolBoxTalkStatus, showToggles, showToggles2]);

    React.useEffect(() => {
        setSelectedSite(props?.originalSiteMasterId);
        let isVisibleCrud1 = (currentUserRoleDetail.isStateManager || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;
        if (props?.componentProps?.isAllEdit === true || IsUpdate) {
            _SkillMatrixSignature();
        }
        _DocumentData();
        if (props?.componentProps?.originalState) {
            setStateName(props.componentProps.originalState);
        }
        _SkillMaatrixMasterData();
        let SM = props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.SM;
        const formattedDate = moment().format('DD-MM-YYYY');
        setToday(formattedDate);
        const timestamp = Date.now();
        const uniquePart = (timestamp % 100000).toString().padStart(6, '0');
        const id = `IBM-SM-${uniquePart}`;
        setGeneratedID(id);
    }, []);

    React.useEffect(() => {
        const loadSiteData = async () => {
            if (selectedSite) {
                const { SiteData, StateId } = await _siteData(props.provider, selectedSite);
                setSiteData(SiteData);
                setStateId(StateId);
            }
        };
        loadSiteData();
    }, [selectedSite]);

    React.useEffect(() => {
        if (!selectedSite && selectedZoneDetails?.defaultSelectedSitesId?.length === 1) {
            setSelectedSite(selectedZoneDetails.defaultSelectedSitesId[0]);
        }
    }, [selectedZoneDetails]);

    const onChangeMeetingLocation = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setMeetingLocation(newValue || "");
    };

    const onClickSaveOrUpdate = async (type: string) => {
        const errormsg: any[] = [];
        try {
            if (!selectedSite || selectedSite == "") {
                errormsg.push(<div>Site is required</div>);
            }
            if (props?.componentProps?.isAllEdit) {
                const toastId = toastService.loading('Loading...');
                const toastMessage = 'Skill Matrix has been updatted successfully!';
                const statusArray = Object.keys(selectedToolBoxTalkStatus).map(key => ({
                    Id: Number(key),
                    Completed: selectedToolBoxTalkStatus[key],
                    SignatureTrainer: showToggles[key] !== undefined ? showToggles[key] : false,
                    SignatureCleaner: showToggles2[key] !== undefined ? showToggles2[key] : false,
                    IsTraining: false
                }));

                const loggedMessages = new Set<string>();
                let isBlankSignature = false;

                if (type === "Submitted") {
                    if (signatureURL == null || signatureURL == "") {
                        errormsg.push(<div>Trainer short signature is required</div>);
                    }
                    if (signatureURLFull == null || signatureURLFull == "") {
                        errormsg.push(<div>Trainer signature is required</div>);
                    }

                    statusArray.forEach((item) => {
                        if (item.Completed === "Yes") {
                            if (!item.SignatureTrainer && !loggedMessages.has("Trainer signature is required")) {
                                isBlankSignature = true;
                                errormsg.push(<div>Trainer signature is required</div>);
                                loggedMessages.add("Trainer signature is required");
                            }
                            if (!item.SignatureCleaner && !loggedMessages.has("Cleaner signature is required")) {
                                isBlankSignature = true;
                                errormsg.push(<div>Cleaner signature is required</div>);
                                loggedMessages.add("Cleaner signature is required");
                            }
                        }
                    });
                }
                if (errormsg.length > 0) {
                    setErrorData(errormsg);
                    setIsLoading(false);
                    showPopup2();
                } else {
                    await props.provider.updateListItemsInBatchPnP(ListNames.SkillMatrixMasterData, statusArray);
                    const UpdateSignData = {
                        IsActive: false,
                        TrainerSignatureShort: signatureURL,
                        TrainerSignatureFull: signatureURLFull,
                    };

                    await props.provider.updateItemWithPnP(UpdateSignData, ListNames.SkillMatrixSignature, SignUpdateId);
                    setTimeout(() => {
                        // if (props.isForm) {
                        //     setIsComponentClosed(true);
                        // } else {
                        //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                        //     props.manageComponentView({
                        //         currentComponentName: ComponentNameEnum.AddNewSite, originalState: StateName, isReload: true, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "SkillMatrix",
                        //     });
                        // }
                        SaveUpdateClose();
                        setIsLoading(false);
                    }, 1000);
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                }
            }
            if (IsUpdate) {
                setIsLoading(true);
                const lengths = Object.keys(selectedToolBoxTalkStatus).length;
                const statusArray = Object.keys(selectedToolBoxTalkStatus).map(key => ({
                    Id: key,
                    Completed: selectedToolBoxTalkStatus[key],
                    SignatureTrainer: showToggles[key] !== undefined ? showToggles[key] : false,
                    SignatureCleaner: showToggles2[key] !== undefined ? showToggles2[key] : false,
                    IsTraining: false,
                    IsCompetent: true
                }));
                const loggedMessages = new Set<string>();
                let isBlankSignature = false;
                if (type === "Submitted") {
                    if (signatureURLFull == "" || signatureURLFull == undefined) {
                        isBlankSignature = true;
                        errormsg.push(<div>Trainer signature is required</div>);
                        loggedMessages.add("Trainer signature is required");
                    }

                    if (signatureURL == "" || signatureURL == undefined) {
                        isBlankSignature = true;
                        errormsg.push(<div>Trainer short signature is required</div>);
                        loggedMessages.add("Trainer short signature is required");
                    }

                }
                if (isBlankSignature === false && errormsg.length === 0) {
                    const toastId = toastService.loading('Loading...');
                    const toastMessage = 'Skill Matrix has been submitted successfully!';
                    let NoMail = statusArray?.some(record => record?.Completed === "Yes");
                    const UpdateSignData = {
                        IsCompetencyMail: NoMail,
                        TrainerCompetencySignatureFull: signatureURLFull,
                        TrainerCompetencySignatureShort: signatureURL
                    };
                    await props.provider.updateItemWithPnP(UpdateSignData, ListNames.SkillMatrixSignature, SignUpdateId);
                    await props.provider.updateListItemsInBatchPnP(ListNames.SkillMatrixMasterData, statusArray);
                    const UpdateData = {
                        IsCompleted: true,
                        CompetencyMail: NoMail
                    };

                    await props.provider.updateItemWithPnP(UpdateData, ListNames.SkillMatrix, UpdateItemId);
                    setTimeout(() => {
                        // if (props.isForm) {
                        //     setIsComponentClosed(true);
                        // } else {
                        //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                        //     props.manageComponentView({
                        //         currentComponentName: ComponentNameEnum.AddNewSite, originalState: StateName, isReload: true, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "SkillMatrix",
                        //     });
                        // }
                        SaveUpdateClose();
                        setIsLoading(false);
                    }, 1000);
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                } else {

                    setErrorData(errormsg);
                    setIsLoading(false);
                    showPopup2();
                }



            } else {
                if (props?.componentProps?.isAllEdit !== true) {
                    setIsLoading(true);
                    const loggedMessages = new Set<string>();
                    let isBlankSignature = false;
                    if (type === "Submitted") {
                        if (signatureURL == null || signatureURL == "") {
                            errormsg.push(<div>Trainer short signature is required</div>);
                        }
                        if (signatureURLFull == null || signatureURLFull == "") {
                            errormsg.push(<div>Trainer signature is required</div>);
                        }
                        if (!selectedSite && props.isForm) {
                            errormsg.push(<div>Job site is required</div>);
                        }
                        CreateSMData.forEach((item) => {
                            if (item.Completed === "Yes") {
                                let isBlankSignature = false;
                                if (!item.SignatureTrainer && !loggedMessages.has("Trainer signature is required")) {
                                    isBlankSignature = true;
                                    errormsg.push(<div>Trainer signature is required</div>);
                                    loggedMessages.add("Trainer signature is required");
                                }
                                if (!item.SignatureCleaner && !loggedMessages.has("Cleaner signature is required")) {
                                    isBlankSignature = true;
                                    errormsg.push(<div>Cleaner signature is required</div>);
                                    loggedMessages.add("Cleaner signature is required");
                                }
                            }
                        })
                    }
                    if (type === "Draft") {
                        if (MeetingLocation === "") {
                            errormsg.push(<div>Venue trained is required</div>);
                        }
                    }
                    if (selectedTrainingAttendance != null && MeetingLocation !== "" && errormsg.length === 0) {
                        // if (SMData.length === CreateSMData.length && selectedTrainingAttendance != null && MeetingLocation !== "" && isBlankSignature === false) {
                        setIsLoading(true);
                        const toastId = toastService.loading('Loading...');
                        let status;
                        if (noRecordObjects.length > 0) {
                            status = false;
                        } else {
                            status = true;
                        }
                        let isValid = true;
                        let createdId: number = 0;
                        if (isValid) {
                            const toastMessage = 'Skill Matrix has been added successfully!';
                            // const currentDateDate = new Date();
                            const SkillMatrixDate = moment(Today, DateFormat).toDate();
                            let SkillMatrix = {
                                Title: GeneratedID,
                                TrainingAttendance: !!selectedTrainingAttendance ? selectedTrainingAttendance : "",
                                ChairpersonId: [defaultManager],
                                AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
                                VenueTrained: !!MeetingLocation ? MeetingLocation : "",
                                TrainingDocument: !!MatchingItem ? MatchingItem : "",
                                SkillMatrixDate: SkillMatrixDate.toISOString(),
                                IsCompleted: status,
                                FormStatus: type
                            };
                            props.provider.createItem(SkillMatrix, ListNames.SkillMatrix).then(async (item: any) => {
                                createdId = item.data.Id;
                                const logObj = {
                                    UserName: props?.loginUserRoleDetails?.title,
                                    SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                                    ActionType: "Create",
                                    EntityType: UserActionEntityTypeEnum.SkillMatrix,
                                    EntityId: Number(createdId),
                                    EntityName: GeneratedID,
                                    Details: `Add Skill Matrix`,
                                    LogFor: UserActionLogFor.Both,
                                    StateId: props?.componentProps?.qCStateId
                                };
                                void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                                if (createdId > 0) {

                                    const SkillMatrixInfo = {
                                        SkillMatrixId: createdId,
                                        AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
                                        SiteNameId: props.isForm ? selectedSite : Number(props?.originalSiteMasterId)
                                    };

                                    const SkillMatrixSignature = {
                                        SkillMatrixId: createdId,
                                        QuaycleanEmployeeId: ClientLookUp,
                                        IsActive: true,
                                        TrainerSignatureShort: signatureURL,
                                        TrainerSignatureFull: signatureURLFull,
                                    }
                                    if (props?.originalSiteMasterId || props.isForm) {
                                        await props.provider.createItem(SkillMatrixInfo, ListNames.SkillMatrixInfo);
                                    }
                                    await props.provider.createItem(SkillMatrixSignature, ListNames.SkillMatrixSignature);

                                    const updatedCreateSMData = CreateSMData.map(item => {
                                        const isTraining = noRecordObjects.some(noRecord => noRecord.Id === item.ID);
                                        const { ID, ...rest } = item;
                                        return {
                                            ...rest,
                                            IsTraining: isTraining,
                                            IsInCompletent: isTraining,
                                            SkillMatrixId: createdId
                                        };
                                    });

                                    props.provider.createItemInBatch(updatedCreateSMData, ListNames.SkillMatrixMasterData);
                                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                                    setTimeout(() => {
                                        setIsLoading(false);
                                        // if (props.isForm) {
                                        //     setIsComponentClosed(true);
                                        // } else {
                                        //     if (props?.originalSiteMasterId) {
                                        //         const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                        //         props.manageComponentView({
                                        //             currentComponentName: ComponentNameEnum.AddNewSite, originalState: StateName, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "SkillMatrix",
                                        //         });
                                        //     } else {
                                        //         if (props.isNotGeneral === false) {
                                        //             const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                        //             manageComponentView({ currentComponentName: ComponentNameEnum.ListSkillMatrix, breadCrumItems: breadCrumItems, subpivotName: "SkillMatrix" });

                                        //         } else {
                                        //             const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                                        //             manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, breadCrumItems: breadCrumItems, subpivotName: "SkillMatrix" });
                                        //         }
                                        //     }
                                        // }
                                        SaveUpdateClose();
                                    }, 1000);

                                }

                            }).catch(err => console.log(err));
                            setTimeout(() => {
                                setIsLoading(false);
                            }, 1000);
                        } else {
                            toastService.dismiss(toastId);
                            setIsLoading(false);
                        }
                    } else {
                        setIsLoading(false);
                        if (type === "Submitted") {
                            if (selectedTrainingAttendance == null) {
                                errormsg.push(<div>Attendees is required</div>);
                            }
                            if (MeetingLocation == "") {
                                errormsg.push(<div>Venue trained is required</div>);
                            }
                        }
                        setErrorData(errormsg);
                        setIsLoading(false);
                        showPopup2();
                    }


                }
            }

        } catch (error) {
            console.log(error);
            const toastId = toastService.loading('Loading...');
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  onClickSaveOrUpdate",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onClickSaveOrUpdate Toolbox Talk"
            };
            void logGenerator(props.provider, errorObj);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        if (ErrorData.length > 0) {
            showPopup2()
        }
    }, [ErrorData]);

    const onClickYesLink = () => {
        setShowLink(false);
        try {
            if (props.isForm) {
                setIsComponentClosed(true);
            } else {
                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.SkillMatrixs, isAllEdit: true, UpdateItemID: LinkId, originalState: props.originalState || props.componentProps.originalState, siteMasterId: LinkId, isShowDetailOnly: false, breadCrumItems: breadCrumItems, originalSiteMasterId: props.originalSiteMasterId, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState
                });
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickEdit", CustomErrormessage: "error in on click edit", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };

        }

    }
    const onClickNoLink = () => {
        hidePopupLink();
    }
    const onClickYes = () => {
        hidePopup();
        if (IsLinked && selectedSite) {
            onClickLink();
            setIsLinked(false);
        } else {
            if (selectedRowCount > 0 && num == true) {
                Object.entries(selectedRows).forEach(([id, value]) => {
                    const selectedData = SMData?.find(item => String(item.ID) === id);

                    const noRecordObject = {
                        // Id: SelectedItem,
                        Id: selectedData?.ID,
                        Status: 'No',
                        Title: selectedData.Title,
                        SkillMatrix: selectedData.SkillMatrix,
                        IMSNos: selectedData.IMSNos,
                        IsTraining: true
                    };
                    setNoRecordObjects((prev: any) => [...prev, noRecordObject]);
                    setIsReload(true);
                });
            } else {
                const selectedData = SMData?.find(item => Number(item.ID) === Number(SelectedItem));
                const noRecordObject = {
                    Id: SelectedItem,
                    Status: 'No',
                    Title: !!selectedData ? selectedData?.Title : "",
                    SkillMatrix: !!selectedData ? selectedData?.SkillMatrix : "",
                    IMSNos: !!selectedData ? selectedData?.IMSNos : "",
                    IsTraining: true
                };
                setNoRecordObjects((prev: any) => [...prev, noRecordObject]);
                setIsReload(true);
            }
        }
    }

    const onClickNo = () => {
        if (IsLinked && props.originalSiteMasterId) {
            // setIsLinked(false);
            // setClientLookUp(undefined);
            // setSelectedTrainingAttendance(null);
        }
        if (IsRecordExist) {
            setIsRecordExist(false);
        } else {
            const updatedNoRecordObjects = noRecordObjects.filter(item => Number(item.Id) !== Number(SelectedItem));
            setNoRecordObjects(updatedNoRecordObjects);
        }
        hidePopup();
        hidePopup2();
    }

    React.useEffect(() => {
        if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0 && props?.componentProps?.IsUpdate) {
            setUpdateItemId(props?.componentProps?.siteMasterId);
            setIsUpdate(true);
            _SkillMatrixData();
            _SkillMatrixDetailsData();
        }
        if (props?.componentProps?.isAllEdit === true) {
            _SkillMatrixData();
            _SkillMatrixDetailsData();
        }
    }, []);

    React.useEffect(() => {
        if (SiteData && SiteData?.length > 0) {
            const optionSiteManager: any[] = [];
            SiteData?.forEach((site: any) => {
                site?.SiteManagerId?.forEach((managerId: any, index: number) => {
                    optionSiteManager?.push({
                        value: managerId,
                        key: managerId,
                        text: site.SiteManagerName[index],
                        label: site.SiteManagerName[index]
                    });
                });
            });
            optionSiteManager.push({
                value: props.loginUserRoleDetails.Id,
                key: props.loginUserRoleDetails.Id,
                text: props.loginUserRoleDetails.title,
                label: props.loginUserRoleDetails.title
            });
            setManagerOptions(optionSiteManager); // assuming you have a state called setSiteManagerOptions
        }

    }, [SiteData]);

    React.useEffect(() => {
        if (SMData.length > 0 && DetailsData.length > 0) {
            DetailsData.forEach(detailItem => {
                const smMasterIndex = SMData.findIndex(
                    smItem => smItem.Title === detailItem.Title && smItem.IMSNos === detailItem.IMSNos
                );
                if (smMasterIndex !== -1) {
                    SMData[smMasterIndex] = {
                        ...SMData[smMasterIndex],
                        NewCompleted: detailItem.Completed,
                        IsTraining: detailItem.IsTraining,
                        ID: detailItem.ID,
                        SignatureTrainer: detailItem.SignatureTrainer,
                        SignatureCleaner: detailItem.SignatureCleaner,
                        SkillMatrixId: detailItem.SkillMatrixId,
                    };
                }
            });
            setPreTransformData(SMData);
        }
    }, [SMData, DetailsData]);

    React.useEffect(() => {
        if (IsRecordExist && !props.originalSiteMasterId) {
            showPopup2();
        }
    }, [IsRecordExist]);

    React.useEffect(() => {
        if (PreTransformData.length > 0) {
            const groupedDetails = PreTransformData.reduce((acc: any, detail: any) => {
                if (!acc[detail.SkillMatrix]) {
                    acc[detail.SkillMatrix] = [];
                }
                acc[detail.SkillMatrix].push(detail);
                return acc;
            }, {} as { [key: string]: typeof SMData });

            setTransformData(groupedDetails);
        }
    }, [PreTransformData]);

    const getDataUrl = (dataURL: string) => {
        if (dataURL) {
            setSignatureURL(dataURL);
        }
    };

    const getDataUrlFull = (dataURL: string) => {
        if (dataURL) {
            setSignatureURLFull(dataURL);
        }
    };

    if (isComponentClosed) {
        return <SuccessComponent />;
    }
    return <>
        {isLoading && <Loader />}

        {state.isformValidationModelOpen &&
            <CustomModal
                isModalOpenProps={state.isformValidationModelOpen} setModalpopUpFalse={() => {
                    SetState((prevState: any) => ({ ...prevState, isformValidationModelOpen: false }));
                }} subject={"Missing data"}
                message={state.validationMessage} closeButtonText={"Close"} />}

        <div className="mt-10">
            <div className="ms-Grid ">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div id="ToolboxTalk" className="asset-card-2-header-jcc-2 margin-bot-80">
                            <div className="formGroup btnSticky">
                                <div className="va-b inlineBlock">
                                    <PrimaryButton
                                        className="btn btn-danger"
                                        text="Close"
                                        onClick={onClickClose}
                                    />
                                </div>
                            </div>
                            <div className="">
                                <div className="boxCard">
                                    <table className="table-toolbox-talk cell-space-0" style={{ width: "100%", border: "1px solid black" }} >
                                        <tr>
                                            <th className="th-toolbox-talk-logo-sm pl-10 bg-white br-1" > <img src={imgLogo} height="30px" className="course-img-first img-mt" /></th>
                                            <td className="td-toolbox-talk middle-box"><div>Skill Matrix</div></td>
                                            <td className="td-toolbox-talk blue-box pl-10"><div>Skill Matrix Id</div><div>{GeneratedID}</div></td>
                                        </tr>
                                    </table>
                                    <table className="table-toolbox-talk">
                                        <tr>
                                            <td className="td-toolbox-talk"><b>Meeting Date:</b></td>
                                            <td className="td-toolbox-talk">
                                                <DatePicker
                                                    showMonthPickerAsOverlay={true}
                                                    strings={defaultDatePickerStrings}
                                                    placeholder="Select a date..."
                                                    ariaLabel="Select a date"
                                                    formatDate={onFormatDate}
                                                    value={IsUpdate
                                                        ? moment(Today, DateFormat).toDate()
                                                        : moment(Today, DateFormat).toDate()}  // Use undefined instead of null
                                                    onSelectDate={(date?: Date) => {
                                                        if (date !== undefined) {
                                                            const strDate = moment(date).format(DateFormat);
                                                            //onToolBoxTalkStatusChange(detailItem.ID, strDate);
                                                            setToday(strDate);
                                                        }
                                                    }}
                                                />
                                            </td>
                                        </tr>
                                        {/* {(props?.isNotGeneral === false && !props.componentProps.originalSiteMasterId) ? <div></div> : <tr> */}
                                        {(props?.isNotGeneral === false) ? <div></div> : <tr>
                                            <td className="td-toolbox-talk"><b>Job Site:</b></td>
                                            {isVisibleCrud.current ?
                                                <SiteFilter
                                                    isPermissionFiter={true}
                                                    loginUserRoleDetails={props.loginUserRoleDetails}
                                                    selectedSite={selectedSite}
                                                    onSiteChange={onSiteChange}
                                                    provider={props.provider}
                                                    isRequired={true}
                                                    AllOption={false}
                                                    selectedSites={selectedZoneDetails} />
                                                :
                                                <td className="td-toolbox-talk">{(props?.breadCrumItems[0]?.text === "Add Form" || props?.breadCrumItems[0]?.text === "ViewSite") ? props?.breadCrumItems[1]?.text : props?.breadCrumItems[0]?.text}
                                                </td>
                                            }
                                        </tr>}

                                        {
                                            // props.isForm === true && 
                                            <tr>
                                                <td className="td-toolbox-talk"><b>Job Site: <span className="required">*</span></b></td>
                                                <td className="td-toolbox-talk">
                                                    <SiteFilter
                                                        isPermissionFiter={true}
                                                        loginUserRoleDetails={props.loginUserRoleDetails}
                                                        selectedSite={selectedSite}
                                                        onSiteChange={onSiteChange}
                                                        provider={props.provider}
                                                        isRequired={true}
                                                        AllOption={false}
                                                        selectedSites={selectedZoneDetails} />
                                                </td>
                                            </tr>}
                                        {
                                            // props.isForm && selectedSite &&
                                            <tr>{IsUpdate === false ?
                                                <td className="td-toolbox-talk"><b>Training Manager Name:<span className="required"> *</span></b></td> :
                                                <td className="td-toolbox-talk"><b>Training Manager Name:</b></td>}
                                                {IsUpdate === false ?
                                                    <td className="td-toolbox-talk formControl">
                                                        <ReactDropdown
                                                            options={ManagerOptions} isMultiSelect={false}
                                                            defaultOption={defaultManager || selectedManager}
                                                            onChange={_onManagerChange}
                                                            isClearable={false}
                                                            isDisabled={selectedSite == "" || selectedSite == null}
                                                            placeholder={"Select Site Name"} />
                                                    </td> : <td className="td-toolbox-talk"> {SiteData[0]?.SiteManagerName?.join(', ')}</td>
                                                }
                                            </tr>
                                        }
                                        <tr>{IsUpdate === false ?
                                            <td className="td-toolbox-talk"><b>Venue Trained:<span className="required"> *</span></b></td> :
                                            <td className="td-toolbox-talk"><b>Venue Trained:</b></td>}
                                            {IsUpdate === false ?
                                                <td className="td-toolbox-talk">
                                                    {/* <TextField className="formControl"
                                                        name='VenueTrained'
                                                        placeholder="Enter Venue Trained"
                                                        value={MeetingLocation}
                                                        onChange={onChangeMeetingLocation} /> */}

                                                    <IMSLocationCommonFilter
                                                        onIMSLocationChange={onIMSLocationChange}
                                                        provider={props.provider}
                                                        selectedIMSLocation={MeetingLocation}
                                                        defaultOption={!!MeetingLocation ? MeetingLocation : ""}
                                                        siteNameId={selectedSite || props.originalSiteMasterId}
                                                        Title="Skill Matrix"
                                                        Label="Venue Trained"
                                                        placeHolder="Select Venue Trained"
                                                        IsUpdate={IsUpdate}
                                                    />
                                                </td> :
                                                <td className="td-toolbox-talk"> {SkillMatrixData[0]?.VenueTrained}</td>}
                                        </tr>
                                        <tr>
                                            <td className="td-toolbox-talk"><b>Attendee Type: <span className="required"> *</span></b></td>
                                            <td className="td-toolbox-talk">
                                                <div className="divAttendeeType">
                                                    <ChoiceGroup selectedKey={selectedAttendeeType} options={attendeeOptions} onChange={onChange} />
                                                </div>
                                            </td>
                                        </tr>
                                        {
                                            // (masterStateId !== undefined) && 
                                            (
                                                <tr>  {IsUpdate === false ?
                                                    <td className="td-toolbox-talk"><b>Attendees:<span className="required"> *</span></b></td> :
                                                    <td className="td-toolbox-talk"><b>Attendees:</b></td>}
                                                    {/* {IsUpdate === false ? <td className="td-toolbox-talk">
                                                    <TrainingAttendanceFilter
                                                        loginUserRoleDetails={props.loginUserRoleDetails}
                                                        selectedTrainingAttendance={selectedTrainingAttendance}
                                                        onTrainingAttendanceChange={onTrainingAttendanceChange}
                                                        provider={props.provider}
                                                        isRequired={true}
                                                        siteNameId={0}
                                                        qCState={props.isForm ? masterStateId : StateId}
                                                        defaultOption={ClientLookUp || selectedTrainingAttendance}
                                                        AllOption={false} />
                                                </td> :
                                                    <td className="td-toolbox-talk">{SkillMatrixData[0]?.TrainingAttendance}</td>} */}

                                                    <AddSingleOtherEmployee
                                                        onEmployeeChange={onEmployeeChange}
                                                        provider={props.provider}
                                                        // StateId={SiteData[0]?.StateId}
                                                        StateId={props.isForm ? masterStateId : StateId || masterStateId}
                                                        isDisabled={masterStateId !== undefined ? false : true}
                                                        isCloseMenuOnSelect={false}
                                                        defaultOption={ClientLookUp}
                                                        isMultiselected={false}
                                                        selectedAttendeeType={selectedAttendeeType}
                                                        selectedAttendeeOptions={selectedAttendeeOptions}
                                                    />
                                                </tr>)}
                                    </table>

                                    {/* {!!InfoData && InfoData.length > 0 && props.originalSiteMasterId && <tr> */}
                                    {!!InfoData && InfoData.length > 0 && <tr>
                                        <div className="sub-main-header-text mt-2"><b>This Attendee's Skill Matrix Checklist has been used in following site:</b></div>
                                        <ul>
                                            {InfoData.map((item) => (
                                                <div className="dflex"><FontAwesomeIcon icon="circle" className="val-icon-sm" /><li className="att-exist-skill-mat" key={item.ID}>{item.SiteName}</li></div>
                                            ))}
                                        </ul>
                                    </tr>}

                                    {/* {IsLinked && props.originalSiteMasterId && <div className=" mt-3"> */}
                                    {IsLinked && <div className=" mt-3">
                                        <div className="td-toolbox-talk mt-2"><b>This Attendee's Skill Matrix Checklist has been already present, do you want to link in the current site?</b></div>
                                        <div><PrimaryButton
                                            style={{ marginTop: "6px", marginLeft: "0px" }}
                                            className="btn btn-primary"
                                            text="Link Attendees to Current site"
                                            onClick={onClickLinkButton}
                                        /></div>
                                    </div>}

                                    {currentLinkId > 0 &&
                                        <GridViewSkillMatrix
                                            loginUserRoleDetails={props.componentProps.loginUserRoleDetails}
                                            provider={props.provider}
                                            context={props.context}
                                            isAddNewHelpDesk={props.componentProps.isAddNewSite}
                                            manageComponentView={props.manageComponentView}
                                            siteMasterId={currentLinkId} // Use the updated itemID here
                                            breadCrumItems={[]} // Pass the updated breadCrumItems
                                            componentProps={props.componentProps}
                                            originalSiteMasterId={props.componentProps.originalSiteMasterId}
                                            isNotGeneral={false}
                                        />}
                                    {IsUpdate && <>
                                        <div className="main-header-text mt-4">Competency Review </div>
                                        <div className="sub-main-header-text mt-2">Following are the skills which cleaner don't know and ready to learn</div></>
                                    }

                                    {window.innerWidth <= 768 ?
                                        <div>
                                            <div className="row skill-border mt-2">
                                                {selectedTrainingAttendance && !IsLinked && !ShowLink && InfoData.length === 0 && <div className="mobile-card-header">
                                                    {selectedTrainingAttendance && !IsLinked && !ShowLink && InfoData.length === 0 && <div className="">
                                                        <input
                                                            type="checkbox"
                                                            checked={isAllSelected}
                                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                                        /><b>Select All</b>
                                                    </div>}
                                                    {selectedRowCount > 0 && (
                                                        <div className="dflex">
                                                            <div className="mw-160 ml-56-per-update-card">
                                                                <Dropdown
                                                                    selectedKey={multiSelectDropdownValue}
                                                                    options={IsUpdate ? CompetencyOptions : dropdownOptions}
                                                                    placeholder="Select Status"
                                                                    onChange={(e: any, option: any) => handleMultiSelectDropdownChange(option.key)}
                                                                />
                                                            </div>
                                                            <div className="mw-90 mtl-10-update-card">
                                                                <Toggle
                                                                    checked={multiSelectTrainerToggle}
                                                                    onChange={(e, checked) => handleToggleChangeForAll(true, checked)}
                                                                    className="mt-2"
                                                                />
                                                            </div>
                                                            <div className="mw-90 min-wid-90 mtl-105-card">
                                                                <Toggle
                                                                    checked={multiSelectCleanerToggle}
                                                                    onChange={(e, checked) => handleToggleChangeForAll(false, checked)}
                                                                    className="mt-2"
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>}
                                                <div className="">

                                                    {selectedTrainingAttendance && !IsLinked && !ShowLink && InfoData.length === 0 && Object.entries(SkillMatrixMaster).map(([skillMatrix, details]) => (

                                                        <React.Fragment key={skillMatrix}>
                                                            <div className="dflex">
                                                                <div className="col-12 dflex">
                                                                    <div className="main-header-text ">{skillMatrix}</div>
                                                                </div>
                                                            </div>
                                                            {details.map((detail: any) => (
                                                                <div className="col-lg-6 col-md-12 mb-4" key={detail.ID}>
                                                                    <div className="thumbCard">
                                                                        <div className="thumbTitle position-relative">
                                                                            <div className="card-imnage-info dflex">
                                                                                <div className="mt-10">
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={!!selectedRows[detail.ID]}
                                                                                        onChange={(e) => handleRowCheckboxChange(detail.ID, e.target.checked)}
                                                                                    />
                                                                                </div>
                                                                                <div>
                                                                                    <label className="card-label">Induction Training Units</label>
                                                                                    <div>{detail.Title}</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="row fnt-14 mx-0">
                                                                            <div className="card-other-content">
                                                                                <label className="card-label">IMS Nos.</label>
                                                                                <div className="fw-medium">{detail.IMSNos}</div>
                                                                            </div>

                                                                            <div className="card-other-content">
                                                                                <label className="card-label">Completed</label>
                                                                                <div className="fw-medium">
                                                                                    <Dropdown
                                                                                        selectedKey={selectedToolBoxTalkStatus[detail.ID] || 'N/A'}
                                                                                        options={dropdownOptions}
                                                                                        placeholder="Select Status"
                                                                                        onChange={(e: any, option: any) => onToolBoxTalkStatusChange(detail.ID, option.key)}
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            <div className="card-other-content">
                                                                                <label className="card-label">Trainer Toggle</label>
                                                                                <div className="fw-medium">
                                                                                    <Toggle
                                                                                        checked={!!showToggles[detail.ID]}
                                                                                        onChange={(e, checked) => handleToggleChange(detail.ID, checked)}
                                                                                        className="mt-2"
                                                                                        disabled={!toggleEnabled[detail.ID]} // Disable if dropdown not selected
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            <div className="card-other-content">
                                                                                <label className="card-label">Cleaner Toggle</label>
                                                                                <div className="fw-medium">
                                                                                    <Toggle
                                                                                        checked={!!showToggles2[detail.ID]}
                                                                                        onChange={(e, checked) => handleToggleChange2(detail.ID, checked)}
                                                                                        className="mt-2"
                                                                                        disabled={!toggleEnabled[detail.ID]} // Disable if dropdown not selected
                                                                                    />
                                                                                </div>
                                                                            </div>

                                                                            <div className="card-other-content">
                                                                                <label className="card-label">Actions</label>
                                                                                <div className="fw-medium">
                                                                                    {detail.IsTraining ? (
                                                                                        <FontAwesomeIcon
                                                                                            className="actionIcon"
                                                                                            icon={"edit"}
                                                                                            onClick={(e) => onClickEdit(detail.ID)}
                                                                                        />
                                                                                    ) : (
                                                                                        <span></span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>

                                        </div> :
                                        <div>
                                            {((selectedTrainingAttendance && !IsLinked && !ShowLink && InfoData.length == 0) || IsUpdate) &&
                                                <div className="table-sm mt-2">
                                                    <div className="table-header-sm">
                                                        {IsUpdate !== true && <div className="mw-40">
                                                            <input
                                                                type="checkbox"
                                                                checked={isAllSelected}
                                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                            />
                                                        </div>}
                                                        <div className="text-left-sm">Induction Training Units</div>
                                                        <div className="mw-160">IMS Nos.</div>
                                                        {IsUpdate ? <div className="mw-160">Is the staff member competent?</div> : <div className="mw-160">Completed</div>}
                                                        <div className="mw-90">Signature Trainer</div>
                                                        <div className="mw-90">Signature Cleaner</div>
                                                        {IsUpdate !== true && <div className="mw-90">Is Training</div>}
                                                    </div>

                                                    <div>
                                                        {selectedRowCount > 0 && (
                                                            <div className="dflex">
                                                                <div className="mw-160 ml-56-per-update">
                                                                    <Dropdown
                                                                        selectedKey={multiSelectDropdownValue}
                                                                        options={IsUpdate ? CompetencyOptions : dropdownOptions}
                                                                        placeholder="Select Status"
                                                                        onChange={(e: any, option: any) => handleMultiSelectDropdownChange(option.key)}
                                                                    />
                                                                </div>
                                                                <div className="mw-90 min-wid-118 mtl-10-update">
                                                                    <Toggle
                                                                        checked={multiSelectTrainerToggle}
                                                                        onChange={(e, checked) => handleToggleChangeForAll(true, checked)}
                                                                        className="mt-2"
                                                                    />
                                                                </div>
                                                                <div className="mw-90 min-wid-90 mtl-105">
                                                                    <Toggle
                                                                        checked={multiSelectCleanerToggle}
                                                                        onChange={(e, checked) => handleToggleChangeForAll(false, checked)}
                                                                        className="mt-2"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {IsUpdate ? <>
                                                            {DetailsData.map((detail: any) => (
                                                                <div className="table-row-sm" key={detail.ID}>
                                                                    {IsUpdate !== true && <div className="mw-40">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!selectedRows[detail.ID]}
                                                                            onChange={(e) => handleRowCheckboxChange(detail.ID, e.target.checked)}
                                                                        />
                                                                    </div>}
                                                                    <div className="text-left-sm">{detail.Title}</div>
                                                                    <div className="mw-160">{detail.IMSNos}</div>
                                                                    <div className="mw-160">
                                                                        <Dropdown
                                                                            selectedKey={selectedToolBoxTalkStatus[detail.ID]}
                                                                            options={CompetencyOptions}
                                                                            placeholder="Select Status"
                                                                            onChange={(e: any, option: any) => onToolBoxTalkStatusChange(detail.ID, option.key)}
                                                                        /></div>
                                                                    <div className="mw-90">
                                                                        <Toggle
                                                                            checked={!!showToggles[detail.ID]}
                                                                            onChange={(e, checked) => handleToggleChange(detail.ID, checked)}

                                                                            className="mt-2"
                                                                            disabled={!toggleEnabled[detail.ID]} // Disable if dropdown not selected
                                                                        /></div>
                                                                    <div className="mw-90"><Toggle
                                                                        checked={!!showToggles2[detail.ID]}
                                                                        onChange={(e, checked) => handleToggleChange2(detail.ID, checked)}
                                                                        className="mt-2"
                                                                        disabled={!toggleEnabled[detail.ID]} // Disable if dropdown not selected
                                                                    /></div>
                                                                    {IsUpdate !== true && <div className="mw-90">{detail.IsTraining ? <FontAwesomeIcon
                                                                        className="actionIcon "
                                                                        icon={"edit"}
                                                                        onClick={(e) => onClickEdit(detail.ID)}
                                                                    /> : <span></span>}</div>}
                                                                </div>
                                                            ))}
                                                        </> :
                                                            <>
                                                                {props?.componentProps?.isAllEdit === true ?
                                                                    <div>
                                                                    </div>
                                                                    : <div>
                                                                        {/* Create Code */}
                                                                        {selectedTrainingAttendance && !IsLinked && !ShowLink && InfoData.length == 0 && Object.entries(SkillMatrixMaster).map(([skillMatrix, details]) => (
                                                                            <React.Fragment key={skillMatrix}>
                                                                                <div className="location-sm">{skillMatrix}</div>
                                                                                {details.map((detail: any) => (
                                                                                    <div className="table-row-sm" key={detail.ID}>
                                                                                        <div className="mw-40">
                                                                                            <input
                                                                                                type="checkbox"
                                                                                                checked={!!selectedRows[detail.ID]}
                                                                                                onChange={(e) => handleRowCheckboxChange(detail.ID, e.target.checked)}
                                                                                            />
                                                                                        </div>

                                                                                        <div className="text-left-sm">{detail.Title}</div>
                                                                                        <div className="mw-160">{detail.IMSNos}</div>
                                                                                        <div className="mw-160">
                                                                                            <Dropdown
                                                                                                selectedKey={selectedToolBoxTalkStatus[detail.ID] || 'N/A'}
                                                                                                options={dropdownOptions}
                                                                                                placeholder="Select Status"
                                                                                                onChange={(e: any, option: any) => onToolBoxTalkStatusChange(detail.ID, option.key)}
                                                                                            /></div>
                                                                                        <div className="mw-90">
                                                                                            <Toggle
                                                                                                checked={!!showToggles[detail.ID]}
                                                                                                onChange={(e, checked) => handleToggleChange(detail.ID, checked)}

                                                                                                className="mt-2"
                                                                                                disabled={!toggleEnabled[detail.ID]} // Disable if dropdown not selected
                                                                                            /></div>
                                                                                        <div className="mw-90"><Toggle
                                                                                            checked={!!showToggles2[detail.ID]}
                                                                                            onChange={(e, checked) => handleToggleChange2(detail.ID, checked)}
                                                                                            className="mt-2"
                                                                                            disabled={!toggleEnabled[detail.ID]} // Disable if dropdown not selected
                                                                                        /></div>
                                                                                        <div className="mw-90">{detail.IsTraining ? <FontAwesomeIcon
                                                                                            className="actionIcon "
                                                                                            icon={"edit"}
                                                                                            onClick={(e) => onClickEdit(detail.ID)}
                                                                                        /> : <span></span>}</div>
                                                                                    </div>
                                                                                ))}
                                                                            </React.Fragment>
                                                                        ))}
                                                                    </div>
                                                                }

                                                            </>}
                                                    </div>
                                                </div>}
                                        </div>
                                    }
                                    {noRecordObjects.length > 0 && <>
                                        <div className="main-header-text mt-4">Provide Training</div>
                                        <div className="sub-main-header-text mt-2">Following are the skills which cleaner don't know and ready to learn</div></>
                                    }
                                    {noRecordObjects.length > 0 &&
                                        <div className="table-sm mt-2">
                                            <div className="table-header-sm">
                                                <div className="text-left-sm">Title</div>
                                                <div className="mw-160">IMS Nos.</div>
                                                <div className="mw-160">Signature</div>
                                            </div>
                                            <div>
                                                {noRecordObjects
                                                    .filter((detail: any, index: number, self: any[]) =>
                                                        index === self.findIndex((t) => t.Title === detail.Title)
                                                    )
                                                    .map((detail: any) => (
                                                        <div className="table-row-sm" key={detail.Id}>
                                                            <div className="text-left-sm">{detail.Title}</div>
                                                            <div className="mw-160">{detail.IMSNos}</div>
                                                            <div className="mw-160"></div>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>}
                                    {((selectedTrainingAttendance && !IsLinked && !ShowLink && InfoData.length == 0) || IsUpdate) &&
                                        <div className="ms-Grid-row ">
                                            <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg6 ">
                                                <div className='sign-add'>
                                                    <SignatureComponent label={'Trainer Short Signature'} defaultSignature={!!signatureURL ? signatureURL : ""} isDisplayNameEmail={false} email={'ashish.s.prajapati@treta.onmicrosoft.com'} name="Ashish Prajapati 4/9/2024 15:12 PM" getDataUrl={getDataUrl}></SignatureComponent>
                                                </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg6 ">
                                                <div className='sign-add-2'>
                                                    <SignatureComponent label={'Trainer Signature'} defaultSignature={!!signatureURLFull ? signatureURLFull : ""} isDisplayNameEmail={false} email={'ashish.s.prajapati@treta.onmicrosoft.com'} name="Ashish Prajapati 4/9/2024 15:12 PM" getDataUrl={getDataUrlFull}></SignatureComponent>
                                                </div>
                                            </div>
                                        </div>}
                                    <div className="asset-card-2-header-jcc-2 mar-bot-40">
                                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 toolkit-btn">
                                            {selectedTrainingAttendance && !IsLinked && !ShowLink && InfoData.length == 0 &&
                                                <PrimaryButton
                                                    style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                                    className="btn btn-primary"
                                                    text="Save as Draft"
                                                    onClick={() => onClickSaveOrUpdate('Draft')}
                                                />
                                            }

                                            {((selectedTrainingAttendance && !IsLinked && !ShowLink && InfoData.length == 0) || IsUpdate) &&
                                                <PrimaryButton
                                                    style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                                    className="btn btn-primary"
                                                    text={state.isAddNewHelpDesk ? 'Save and Send' : "Submit"}
                                                    onClick={() => onClickSaveOrUpdate('Submitted')}
                                                />}
                                            {ShowLink && FormStatus !== "Draft" &&
                                                <PrimaryButton
                                                    style={{ marginTop: "10px", marginRight: "5px" }}
                                                    className="btn btn-primary"
                                                    text="Edit"
                                                    onClick={onClickEditButton}
                                                />
                                            }
                                            <PrimaryButton
                                                style={{ marginBottom: "5px", marginTop: "10px" }}
                                                className="btn btn-danger"
                                                text={(selectedTrainingAttendance && !IsLinked && !ShowLink) ? "Cancel" : "Close"}
                                                onClick={onClickClose}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div >

        {isPopupVisible && (
            <Layer>
                <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup}>
                    <Overlay onClick={hidePopup} />
                    <FocusTrapZone>
                        <Popup role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Confirmation</h2>
                            {IsLinked ? <div className="mt-3">Are you sure you want to link to current site?</div>
                                : <div className="mt-3">Do you want provide the training to the Cleaner?</div>}
                            <DialogFooter>
                                <PrimaryButton text="Yes" onClick={onClickYes} className='mrt15 css-b62m3t-container btn btn-primary' />
                                <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNo} />
                            </DialogFooter>
                        </Popup>
                    </FocusTrapZone>
                </Popup>
            </Layer>)
        }
        {isPopupVisibleLink && (
            <Layer>
                <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopupLink}>
                    <Overlay onClick={hidePopupLink} />
                    <FocusTrapZone>
                        <Popup role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Warning</h2>
                            <div className="mt-3">Selected attendees data is already exist do you want to edit this record!!</div>
                            <DialogFooter>
                                <PrimaryButton text="Yes" onClick={onClickYesLink} className='mrt15 css-b62m3t-container btn btn-primary' />
                                <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNoLink} />
                            </DialogFooter>
                        </Popup>
                    </FocusTrapZone>
                </Popup>
            </Layer>)
        }  {
            isPopupVisible2 && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup2}>
                        <Overlay onClick={hidePopup2} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles.content}>
                                {IsRecordExist ?
                                    <h2 className="mt-10">Warning</h2> :
                                    <h2 className="mt-10">Missing Data</h2>}

                                {IsRecordExist ? <div className="mt-3">
                                    Selected attendees data is already exist please select different attendees!!
                                </div> :
                                    <div className="mt-3"> <ul>
                                        {ErrorData.map((error, index) => (
                                            <li key={index} className="val-m">
                                                <FontAwesomeIcon icon="circle" className="val-icon" /> {error.props.children}
                                            </li>
                                        ))}
                                    </ul></div>}

                                <DialogFooter>
                                    <DefaultButton text="Close" className='secondMain btn btn-danger' onClick={onClickNo} />
                                </DialogFooter>
                            </Popup>
                        </FocusTrapZone>
                    </Popup>
                </Layer>
            )
        }
    </>;
};