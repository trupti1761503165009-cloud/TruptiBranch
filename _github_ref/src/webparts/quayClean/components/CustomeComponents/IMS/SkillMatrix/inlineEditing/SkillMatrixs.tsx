/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { useRef, useState, useCallback } from 'react';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { Toggle } from '@fluentui/react/lib/Toggle';
import { ChoiceGroup, DatePicker, defaultDatePickerStrings, Dropdown, TextField } from '@fluentui/react';
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from '../../../../../../../Common/Enum/ComponentNameEnum';
import { ShowMessage } from '../../../../CommonComponents/ShowMessage';
import { EMessageType } from '../../../../../../../Interfaces/MessageType';
import { Loader } from '../../../../CommonComponents/Loader';
import { SkillMatrixRow } from './SkillMatrixRow';
import { IHelpDeskFormProps } from '../../../../../../../Interfaces/IAddNewHelpDesk';
import { getStateBySiteId, onFormatDate, removeElementOfBreadCrum, UserActivityLog, _siteData } from '../../../../../../../Common/Util';
import { SkillMatrixFields } from './SkillMatrixFields';
import ReactDropdown from '../../../../CommonComponents/reactSelect/ReactSelectDropdown';
import { SignatureComponent } from '../../../../CommonComponents/SignatureComponent';
import moment from 'moment';
import IPnPQueryOptions from '../../../../../../../DataProvider/Interface/IPnPQueryOptions';
import { TrainingAttendanceFilter } from '../../../../../../../Common/Filter/TrainingAttendanceFilter';
import { DefaultButton, DialogFooter, FocusTrapZone, Layer, mergeStyleSets, Overlay, Popup } from "@fluentui/react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useBoolean } from '@fluentui/react-hooks';
import { SkillMatrixData } from './SkillMatrixData';
import { AddSingleOtherEmployee } from '../../../../../../../Common/AddSingleOtherEmployee';
import { attendeeOptions, DateFormat, DateTimeFormate } from '../../../../../../../Common/Constants/CommonConstants';
import { appGlobalStateAtom } from '../../../../../../../jotai/appGlobalStateAtom';
import { useAtomValue } from 'jotai';
import { SiteFilter } from '../../../../../../../Common/Filter/SiteFilter';
import { IMSLocationCommonFilter } from '../../../../../../../Common/Filter/IMSLocationCommonFilter';
import { isSiteLevelComponentAtom } from '../../../../../../../jotai/isSiteLevelComponentAtom';
import { selectedZoneAtom } from '../../../../../../../jotai/selectedZoneAtom';
const imgLogo = require('../../../../../assets/images/logo.png');

const dropdownOptions = [
    { key: 'Yes', text: 'Yes' },
    { key: 'No', text: 'No' },
    { key: 'N/A', text: 'N/A' }
];

export const SkillMatrixs: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const [Ispopup, setIspopup] = useState(false);
    const {
        isLoading,
        isModalOpen,
        errorMessages,
        dialogHeader,
        dialogMessage,
        hideDialog,
        isSuccess,
        percentComplete,
        showModal,
        hideModal,
        toggleHideDialog,
        handleSave,
        tableData,
        noData,
        selectedRows,
        selectedCompleted,
        setSelectedRows,
        handleCompletedChange,
        handleRowSelection,
        toggleIsActiveForSelectedRows,
        toggleCleanerForSelectedRows,
        updateCellData,
        error,
        hasError,
        ErrorData,
        setErrorData,
        NoRecordId,
        RecordStatus,
        IsTraining,


    } = SkillMatrixData({ listName: ListNames.SkillMatrixMasterData, provider: props.provider, RecordId: props.siteMasterId, IsPopupTrue: Ispopup });

    const [StateId, setStateId] = React.useState<string>(props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);
    const [Today, setToday] = React.useState<string>(moment().format('DD-MM-YYYY'));
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail, currentUser } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const [GeneratedID, setGeneratedID] = React.useState<string>("");
    const [UpdateID, setUpdateID] = React.useState<any>(0);
    const [IsUpdate, setIsUpdate] = React.useState<boolean>(false);
    const [StateName, setStateName] = React.useState<string>();
    const [SiteData, setSiteData] = React.useState<any[]>([]);
    const [selectedSite, setSelectedSite] = React.useState<any>("");
    const [ManagerOptions, setManagerOptions] = React.useState<any[]>();
    const [defaultManager, setDefaultManager] = React.useState<any>(props?.componentProps?.loginUserRoleDetails?.Id);
    const [selectedManager, setSelectedManager] = React.useState<any>(props?.componentProps?.loginUserRoleDetails?.title);
    const [selectedTrainingAttendance, setSelectedTrainingAttendance] = React.useState<any>(null);
    const [selectedTrainingEmailId, setSelectedTrainingEmailId] = React.useState<any>(null);
    const [ClientLookUp, setClientLookUp] = React.useState<number>();
    const [noRecordObjects, setNoRecordObjects] = React.useState<any[]>([]);
    const [signatureURL, setSignatureURL] = React.useState<string | null>(null);
    const [signatureURLFull, setSignatureURLFull] = React.useState<string | null>(null);
    const [SkillMatrixDataobj, setSkillMatrixDataobj] = React.useState<any[]>([]);
    const [MeetingLocation, setMeetingLocation] = React.useState<string>("");
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [isPopupVisibleResend, { setTrue: showPopupResend, setFalse: hidePopupResend }] = useBoolean(false);
    const [isPopupVisible2, { setTrue: showPopup2, setFalse: hidePopup2 }] = useBoolean(false);
    const [EData, setEData] = React.useState<any[]>([]);
    const [DocumentData, setDocumentData] = React.useState<any[]>([]);
    const [MatchingItem, setMatchingItem] = React.useState<string>("");
    const [GroupData, setGroupData] = React.useState<any[]>([]);
    const [TrainingData, setTrainingData] = React.useState<any[]>([]);
    const [isCompleted, setIsCompleted] = useState(true);
    const [SignUpdateId, setSignUpdateId] = React.useState<number>(0);
    const [SkillMatrixInfoId, setSkillMatrixInfoId] = React.useState<number>(0);
    const [isLoadings, setIsLoadings] = React.useState<boolean>(false);
    const [SkillMatrixTitle, setSkillMatrixTitle] = React.useState<string>("");
    const [FormStatus, setFormStatus] = React.useState<string>("");
    const [selectedAttendeeType, setSelectedAttendeeType] = React.useState<string | undefined>('Quayclean Employee');
    const [selectedAttendeeOptions, setSelectedAttendeeOptions] = React.useState<any[]>([]);
    const isVisibleCrud = React.useRef<boolean>(false);
    const onChange = React.useCallback((ev: React.SyntheticEvent<HTMLElement>, option: any) => {
        setSelectedAttendeeType(option.key);
    }, []);
    const comDataRef = useRef<any[]>([]);
    const [Update, setUpdate] = useState(0); // Trigger re-render

    const updateComData = useCallback(() => {
        setUpdate(prev => prev + 1); // Trigger re-render
    }, []);

    const onIMSLocationChange = (loc: any): void => {
        setMeetingLocation(loc);
    };

    const onSiteChange = (selectedOption: any): void => {
        setSelectedSite(selectedOption?.value);
    };

    const onChangeMeetingLocation = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setMeetingLocation(newValue || "");
    };
    const onTrainingAttendanceChange = (TrainingAttendance: any): void => {
        setClientLookUp(TrainingAttendance.value);
        setSelectedTrainingAttendance(TrainingAttendance.text);
    };

    const onEmployeeChange = async (selectedOptions: any): Promise<void> => {
        setSelectedAttendeeOptions(selectedOptions);
        setClientLookUp(selectedOptions.value);
        setSelectedTrainingAttendance(selectedOptions.text);
    }

    const _onManagerChange = (option: any): void => {
        setSelectedManager(option?.label);
        setDefaultManager(option?.value);
    };

    const [width, setWidth] = React.useState<string>("400px");
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("400px");
        }
    }, [window.innerWidth]);


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
            maxWidth: '500px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
        }
    });


    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error.message} />
            </div>
        </div>
    }

    const onCloseClick = () => {
        if (props.isForm) {
            console.log();
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
                if (props.componentProps.isNotGeneral === false) {
                    const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                    props.manageComponentView({ currentComponentName: ComponentNameEnum.ListSkillMatrix, qCStateId: props?.componentProps?.qCStateId, breadCrumItems: breadCrumItems, subpivotName: "SkillMatrix", selectedZoneDetails: props.componentProps.selectedZoneDetails });
                } else {
                    const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                    props.manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, breadCrumItems: breadCrumItems, subpivotName: "SkillMatrix", selectedZoneDetails: props.componentProps.selectedZoneDetails });
                }
            }
        }
    };

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

    const _SkillMatrixDataobj = () => {
        try {
            const select = ["ID,Title,FormStatus,SkillMatrixDate,TrainingAttendance,AttendeesEmailId,AttendeesEmail/Email,VenueTrained,Created,Modified"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `Id eq '${props?.componentProps?.siteMasterId}' and IsActive eq 1`,
                expand: ["AttendeesEmail"],
                listName: ListNames.SkillMatrix,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    let SkillMatrixDataobj = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                SkillMatrixDate: !!data.SkillMatrixDate ? data.SkillMatrixDate : '',
                                SkillMatrixDateFormat: !!data.SkillMatrixDate ? moment(data.SkillMatrixDate).format(DateFormat) : '',
                                Date: !!data.Created ? moment(data.Created).format(DateFormat) : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                FormStatus: !!data.FormStatus ? data.FormStatus : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                TrainingAttendance: !!data.TrainingAttendance ? data.TrainingAttendance : '',
                                VenueTrained: !!data.VenueTrained ? data.VenueTrained : '',
                                Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
                                Modified: !!data.Modified ? data.Modified : null,
                                AttendeesEmail: !!data.AttendeesEmailId ? data.AttendeesEmail : '',
                                AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : 0,
                            }
                        );
                    });
                    SkillMatrixDataobj = SkillMatrixDataobj.sort((a: any, b: any) => {
                        return moment(b.Modified).diff(moment(a.Modified));
                    });
                    setFormStatus(SkillMatrixDataobj[0]?.FormStatus);
                    setSkillMatrixTitle(SkillMatrixDataobj[0]?.Title);
                    if (props?.componentProps?.isAllEdit === true) {
                        setMeetingLocation(SkillMatrixDataobj[0]?.VenueTrained);
                        setSelectedTrainingAttendance(SkillMatrixDataobj[0]?.TrainingAttendance);
                        setClientLookUp(SkillMatrixDataobj[0]?.AttendeesEmailId);
                        setToday(SkillMatrixDataobj[0]?.SkillMatrixDateFormat);
                    }
                    setSkillMatrixDataobj(SkillMatrixDataobj);
                }
            }).catch((error: any) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
        }
    };

    React.useEffect(() => {
        setSelectedSite(props?.originalSiteMasterId);
        let isVisibleCrud1 = (currentUserRoleDetail.isStateManager || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;
        if (!!props?.siteMasterId && props?.siteMasterId > 0) {
            setUpdateID(props?.siteMasterId);
        }
        // _siteData(); // removed local function
        if (props?.componentProps?.originalState) {
            setStateName(props.componentProps.originalState);
        }
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
        let errormsg: any = []; // Clear error messages on each render
        const loggedMessages = new Set<string>(); // Clear logged messages on each render
        let isBlankSignature = false; // Reset flag on each render
        if (signatureURL == null || signatureURL == "") {
            errormsg.push('Trainer short signature is required');
        }
        if (signatureURLFull == null || signatureURLFull == "") {
            errormsg.push('Trainer signature is required');
        }
        if (MeetingLocation == null || MeetingLocation == "") {
            errormsg.push('Venue train is required');
        }
        tableData.forEach((item) => {
            if (item.Completed === "Yes") {
                // Check for missing signatures
                if (!item.SignatureCleaner && !loggedMessages.has("Cleaner signature is required")) {
                    isBlankSignature = true;
                    errormsg.push('Cleaner signature is required');
                    loggedMessages.add("Cleaner signature is required");
                }
                if (!item.SignatureTrainer && !loggedMessages.has("Trainer signature is required")) {
                    isBlankSignature = true;
                    errormsg.push('Trainer signature is required');
                    loggedMessages.add("Trainer signature is required");
                }
            }
        });

        if (errormsg.length > 0) {
            setEData(errormsg);
        } else {
            setEData([]); // Clear error state if no errors
        }

        if ((NoRecordId > 0 && RecordStatus === "No") || IsTraining === true) {
            if (signatureURL == null && signatureURLFull == null) {
                showPopup();
            }
        } else if (RecordStatus !== "No" && NoRecordId > 0) {
            if (!!comDataRef.current && comDataRef.current.length > 0) {
                comDataRef.current = comDataRef.current.filter((row: any) => row.Id !== NoRecordId);
                updateComData(); // Trigger re-render
            }
        }

    }, [tableData, signatureURL, signatureURLFull, MeetingLocation, NoRecordId, RecordStatus]);



    React.useEffect(() => {
    }, [tableData]);

    React.useEffect(() => {
        if (!!comDataRef.current && comDataRef.current.length > 0) {
            const allIMSNos: string[] = comDataRef.current.flatMap(item => parseIMSNos(item.IMSNos));
            const matchingIDs = DocumentData.filter(doc =>
                allIMSNos.some(ims => doc.FileLeafRef.includes(ims))
            ).map(doc => doc.ID);
            const resultString = matchingIDs.join(', ');
            setMatchingItem(resultString);

        }
        const newObjects = tableData.map((tableItem: any) => {
            const isTraining = comDataRef.current.some((comItem: any) => comItem.Id === tableItem.Id);
            return {
                Id: tableItem.Id,
                IsTraining: isTraining // true if match, false if not
            };
        });
        setTrainingData(newObjects);

    }, [Update, comDataRef.current]);

    const updateSignatureFields = (tableData: any, recordId: any) => {
        return tableData.map((item: any) => {
            if (item.Id === recordId) {
                // Update SignatureCleaner and SignatureTrainer fields
                return {
                    ...item,
                    SignatureCleaner: false,
                    SignatureTrainer: false
                };
            }
            return item;
        });
    };

    const onClickYesResend = async () => {
        try {
            if (EData.length > 0) {
                setIsLoadings(false);
                showPopup2();
            } else {


                setIsLoadings(true);
                const SkillMatrixUpdate = { IsActive: false };
                await props.provider.updateItemWithPnP(SkillMatrixUpdate, ListNames.SkillMatrix, UpdateID);
                let siteid = Number(selectedSite) || Number(props?.originalSiteMasterId)
                const stateId = await getStateBySiteId(props.provider, siteid);
                const logObj = {
                    UserName: props?.loginUserRoleDetails?.title,
                    SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                    ActionType: UserActivityActionTypeEnum.Update,
                    EntityType: UserActionEntityTypeEnum.SkillMatrix,
                    EntityId: UpdateID,
                    StateId: stateId,
                    LogFor: UserActionLogFor.Both,
                    EntityName: GeneratedID,
                    Details: `Update Skill Matrix`
                };
                void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                const SkillMatrixDate = moment(Today, DateFormat).toDate();
                const SkillMatrixCreate = {
                    Title: SkillMatrixTitle,
                    IsCompleted: isCompleted,
                    IntialEmail: false,
                    SkillMatrixDate: SkillMatrixDate.toISOString(),
                    TrainingAttendance: selectedTrainingAttendance || "",
                    ChairpersonId: [defaultManager],
                    AttendeesEmailId: ClientLookUp || [],
                    VenueTrained: MeetingLocation || "",
                    TrainingDocument: MatchingItem || "",
                    FormStatus: 'Submitted',
                    IsActive: true,
                    HistoryId: UpdateID || 0
                };

                const newSkillMatrix = await props.provider.createItem(SkillMatrixCreate, ListNames.SkillMatrix);
                const createdId = newSkillMatrix.data.Id;
                const updatedTableData = tableData.map(item => {
                    const { ID, Id, Trainer, SkillMatrix, SkillMatrixTitle, ...rest } = item;
                    return {
                        ...rest,
                        SkillMatrixId: createdId,
                        SkillMatrixName: SkillMatrixTitle
                    };
                });
                await props.provider.createItemInBatch(updatedTableData, ListNames.SkillMatrixMasterData);

                // Third update: Update SkillMatrixInfo with the new SkillMatrix ID
                if (SkillMatrixInfoId > 0) {
                    const UpdateInfoData = { SkillMatrixId: Number(createdId), SiteNameId: Number(selectedSite) || props.originalSiteMasterId };
                    await props.provider.updateItemWithPnP(UpdateInfoData, ListNames.SkillMatrixInfo, SkillMatrixInfoId);
                }

                const UpdateSignData = { IsActive: false };
                await props.provider.updateItemWithPnP(UpdateSignData, ListNames.SkillMatrixSignature, SignUpdateId);

                const SkillMatrixSignature = {
                    SkillMatrixId: createdId,
                    QuaycleanEmployeeId: ClientLookUp,
                    IsActive: true,
                    TrainerSignatureShort: signatureURL,
                    TrainerSignatureFull: signatureURLFull,
                };
                await props.provider.createItem(SkillMatrixSignature, ListNames.SkillMatrixSignature);

                await handleSave();
                hidePopupResend();
                // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                // if (props?.componentProps?.isNotGeneral === false) {
                //     props.manageComponentView({ currentComponentName: ComponentNameEnum.ListSkillMatrix, breadCrumItems });
                // } else {
                //     props.manageComponentView({
                //         currentComponentName: ComponentNameEnum.AddNewSite,
                //         originalState: props.componentProps.originalState,
                //         dataObj: props.componentProps.dataObj,
                //         breadCrumItems,
                //         siteMasterId: props.originalSiteMasterId,
                //         isShowDetailOnly: true,
                //         siteName: props.componentProps.siteName,
                //         qCState: props.componentProps.qCState,
                //         pivotName: "IMSKey",
                //         subpivotName: "SkillMatrix",
                //     });
                // }
                onCloseClick();

            }
        } catch (error) {
            console.error("Error during API calls: ", error);
        } finally {
            setIsLoadings(false);
        }
    };

    const onClickNoResend = () => {
        handleSavePre('Submitted');
        setIsLoadings(false);
    };

    const onClickYes = () => {
        setIsLoadings(true);
        const recordIndex = tableData.findIndex((row) => row.Id === NoRecordId);
        if (recordIndex > 0) {
            tableData[recordIndex].IsTraining = true;
        }

        setIspopup(true);
        const matchingRow = tableData.find((row) => row.Id === NoRecordId);
        if (matchingRow) {
            const newObject = {
                Id: matchingRow.Id,
                Title: matchingRow.Title,
                IMSNos: matchingRow.IMSNos
            };
            comDataRef.current.push(newObject);
            updateComData(); // Trigger re-render
        }
        const updatedTableData = updateSignatureFields(tableData, NoRecordId);

        if (!!updatedTableData && updatedTableData.length > 0) {
            const groupedDetails = updatedTableData.reduce((acc: any, detail: any) => {
                if (!acc[detail.SkillMatrixTitle]) {
                    acc[detail.SkillMatrixTitle] = [];
                }
                acc[detail.SkillMatrixTitle].push(detail);
                return acc;
            }, {} as { [key: string]: typeof updatedTableData });
            setGroupData(groupedDetails);
        }
        hidePopup();
        setIsLoadings(false);
    };

    const onClickNo = () => {
        if (comDataRef.current.length > 0) {
            comDataRef.current = comDataRef.current.filter((row: any) => row.Id !== NoRecordId);
            updateComData(); // Trigger re-render
        }
        hidePopup();
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

    const handleSavePreSubmit = async (type: string) => {
        showPopupResend();
    }

    const handleSavePre = async (type: string) => {
        setIsLoadings(true);
        if (EData.length > 0 && type === "Submitted") {
            setIsLoadings(false);
            showPopup2();
        } else {
            await props.provider.updateListItemsInBatchPnP(ListNames.SkillMatrixMasterData, TrainingData);
            const SkillMatrixDate = moment(Today, DateFormat).toDate();
            const SkillMatrix = {
                IsCompleted: isCompleted,
                IntialEmail: true,
                SkillMatrixDate: SkillMatrixDate.toISOString(),
                TrainingAttendance: !!selectedTrainingAttendance ? selectedTrainingAttendance : "",
                ChairpersonId: [defaultManager],
                AttendeesEmailId: !!ClientLookUp ? ClientLookUp : [],
                VenueTrained: !!MeetingLocation ? MeetingLocation : "",
                TrainingDocument: !!MatchingItem ? MatchingItem : "",
                FormStatus: type
            };
            await props.provider.updateItemWithPnP(SkillMatrix, ListNames.SkillMatrix, UpdateID);
            let siteid = Number(selectedSite) || Number(props?.originalSiteMasterId)
            const stateId = await getStateBySiteId(props.provider, siteid);
            const logObj = {
                UserName: props?.loginUserRoleDetails?.title,
                SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                ActionType: UserActivityActionTypeEnum.Update,
                EntityType: UserActionEntityTypeEnum.SkillMatrix,
                EntityId: UpdateID,
                EntityName: GeneratedID,
                LogFor: UserActionLogFor.Both,
                StateId: stateId,
                Details: `Update Skill Matrix`
            };
            void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
            const UpdateInfoData = { SiteNameId: Number(selectedSite) || props.originalSiteMasterId };
            await props.provider.updateItemWithPnP(UpdateInfoData, ListNames.SkillMatrixInfo, SkillMatrixInfoId);

            const UpdateSignData = {
                IsActive: false,
                TrainerSignatureShort: signatureURL,
                TrainerSignatureFull: signatureURLFull,
            };
            await props.provider.updateItemWithPnP(UpdateSignData, ListNames.SkillMatrixSignature, SignUpdateId);

            const SkillMatrixSignature = {
                SkillMatrixId: props.siteMasterId,
                QuaycleanEmployeeId: ClientLookUp,
                IsActive: true,
                TrainerSignatureShort: signatureURL,
                TrainerSignatureFull: signatureURLFull,
            }
            props.provider.createItem(SkillMatrixSignature, ListNames.SkillMatrixSignature);

            handleSave();
            setTimeout(() => {
                hidePopupResend();
                // if (props?.componentProps?.isNotGeneral === false) {
                //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                //     props.manageComponentView({ currentComponentName: ComponentNameEnum.ListSkillMatrix, breadCrumItems: breadCrumItems });
                // } else {
                //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                //     props.manageComponentView({
                //         currentComponentName: ComponentNameEnum.AddNewSite, originalState: props.componentProps.originalState, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "SkillMatrix",
                //     });
                // }
                onCloseClick();
            }, 1500);
        }
    };

    const onClickClose = () => {
        hidePopup();
        hidePopup2();
        hidePopupResend();
    }

    const _DocumentData = async () => {
        props.provider.getTrainingMaterial().then((results: any[]) => {
            if (!!results) {
                setDocumentData(results);
            }
        }).catch((error) => {
            console.log(error);
        });
    };


    React.useEffect(() => {
        if (SiteData && SiteData.length > 0) {
            const optionSiteManager: any[] = [];
            SiteData?.forEach((site: any) => {
                site?.SiteManagerId?.forEach((managerId: any, index: number) => {
                    optionSiteManager?.push({
                        value: managerId,
                        // key: managerId,
                        // text: site.SiteManagerName[index],
                        label: site.SiteManagerName[index]
                    });
                });
            });
            setManagerOptions(optionSiteManager); // assuming you have a state called setSiteManagerOptions
        }

    }, [SiteData]);

    const fetchSkillMatrixInfo = () => {
        const select = ["ID,SkillMatrixId,SiteNameId,SiteName/Title"];
        const expand = ["SiteName"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            expand: expand,
            filter: `SkillMatrixId eq '${props.siteMasterId}'`,
            listName: ListNames.SkillMatrixInfo,
        };
        props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
            if (!!results) {
                setSkillMatrixInfoId(results[0]?.ID);
                setSelectedSite(results[0]?.SiteNameId);

            }
        }).catch((error) => {
            console.log(error);
        });
    };

    React.useEffect(() => {
        fetchSkillMatrixInfo();
    }, [props.siteMasterId]);

    React.useEffect(() => {
        fetchSkillMatrixInfo();
        if (SkillMatrixData.length > 0) {
            try {
                const select = ["ID,IsActive,SkillMatrixId"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    filter: `SkillMatrixId eq '${props.siteMasterId}' and IsActive eq 1`,
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

    React.useEffect(() => {
        _DocumentData();
        if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0 && props?.componentProps?.IsUpdate) {
            setIsUpdate(true);
            _SkillMatrixDataobj();
        }
        if (props?.componentProps?.isAllEdit === true) {
            _SkillMatrixDataobj();
        }
    }, []);

    React.useEffect(() => {
        const hasIncompleteRecord = tableData.some(item => item.Completed !== "Yes");
        setIsCompleted(!hasIncompleteRecord);

        if (!!tableData && tableData.length > 0) {
            const groupedDetails = tableData.reduce((acc: any, detail: any) => {
                if (!acc[detail.SkillMatrixTitle]) {
                    acc[detail.SkillMatrixTitle] = [];
                }
                acc[detail.SkillMatrixTitle].push(detail);
                return acc;
            }, {} as { [key: string]: typeof tableData });
            setGroupData(groupedDetails);
        }
    }, [tableData]);


    return (
        <React.Fragment>
            {isLoading &&
                <Loader />
            }
            {isLoadings && <Loader />}
            {isPopupVisibleResend && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopupResend}>
                        <Overlay onClick={hidePopupResend} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles.content}>
                                <h2 className="mt-10">Confirmation</h2>
                                <div className="mt-3">
                                    Do you want to resend the updated form to the attendees?
                                </div>

                                <DialogFooter>
                                    <PrimaryButton text="Yes" onClick={onClickYesResend} className='mrt15 css-b62m3t-container btn btn-primary' />
                                    <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNoResend} />
                                </DialogFooter>
                            </Popup>
                        </FocusTrapZone>
                    </Popup>
                </Layer>)
            }
            <div className="mt-10">
                <div className="ms-Grid ">
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div id="ToolboxTalk">
                                <div className="">
                                    <div className={window.innerWidth <= 768 ? "asset-card-2-header-jcc-2 boxCard incident-pad margin-bot-80" : "asset-card-2-header-jcc-2 boxCard margin-bot-80"}>
                                        <table className="table-toolbox-talk cell-space-0" style={{ width: "100%", border: "1px solid black" }} >
                                            <tr>
                                                <th className="th-toolbox-talk-logo pl-10 bg-white br-1" > <img src={imgLogo} height="30px" className="course-img-first img-mt" /></th>
                                                <td className="td-toolbox-talk middle-box"><div>Skill Matrix</div></td>
                                                <td className="td-toolbox-talk blue-box pl-10"><div>Skill Matrix Id</div><div>{SkillMatrixDataobj[0]?.Title}</div></td>
                                            </tr>
                                        </table>
                                        <table className="table-toolbox-talk">
                                            <tr>
                                                <td className="td-toolbox-talk"><b>Meeting Date:</b></td>
                                                <td className="td-toolbox-talk"> <DatePicker
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
                                                /></td>
                                            </tr>
                                            {props?.componentProps?.isNotGeneral === false ? <div></div> : <tr>
                                                <td className="td-toolbox-talk"><b>Job Site:</b></td>
                                                {isVisibleCrud.current ?
                                                    <td className="td-toolbox-talk max-wid-180-card">
                                                        <SiteFilter
                                                            isPermissionFiter={true}
                                                            loginUserRoleDetails={props?.loginUserRoleDetails}
                                                            selectedSite={selectedSite}
                                                            selectedSites={selectedZoneDetails}
                                                            onSiteChange={onSiteChange}
                                                            provider={props.provider}
                                                            isRequired={true}
                                                            AllOption={false} /></td>
                                                    :
                                                    <td className="td-toolbox-talk max-wid-180-card">{props?.breadCrumItems[0]?.text}</td>}
                                            </tr>}
                                            <tr>{IsUpdate === false ?
                                                <td className="td-toolbox-talk"><b>Meeting Chairperson:<span className="required"> *</span></b></td> :
                                                <td className="td-toolbox-talk"><b>Meeting Chairperson:</b></td>}

                                                {ManagerOptions && IsUpdate === false ?
                                                    <td className="td-toolbox-talk formControl">

                                                        <ReactDropdown
                                                            name={"MeetingChairperson"}
                                                            options={ManagerOptions}
                                                            isMultiSelect={false}
                                                            // defaultOption={defaultManager || selectedManager}
                                                            defaultOption={{ label: selectedManager, value: defaultManager }}
                                                            onChange={(option: { value: any; }) => _onManagerChange(option)}
                                                            // onChange={_onManagerChange}
                                                            isClearable={false}
                                                            isDisabled={selectedSite == "" || selectedSite == null}
                                                            placeholder={"Select Site Name"} />
                                                    </td> : <td className="td-toolbox-talk max-wid-180"> {SiteData[0]?.SiteManagerName?.join(', ')}</td>
                                                }
                                            </tr>
                                            <tr>{IsUpdate === false ?
                                                <td className="td-toolbox-talk"><b>Venue Trained:<span className="required"> *</span></b></td> :
                                                <td className="td-toolbox-talk"><b>Venue Trained:</b></td>}
                                                {IsUpdate === false ?
                                                    <td className="td-toolbox-talk">
                                                        {/* <TextField className="formControl"
                                                            name='VenueTrained' placeholder="Enter Venue Trained"
                                                            value={MeetingLocation} onChange={onChangeMeetingLocation} /> */}
                                                        <IMSLocationCommonFilter
                                                            onIMSLocationChange={onIMSLocationChange}
                                                            provider={props.provider}
                                                            selectedIMSLocation={MeetingLocation}
                                                            defaultOption={!!MeetingLocation ? MeetingLocation : ""}
                                                            siteNameId={selectedSite}
                                                            Title="Skill Matrix"
                                                            Label="Venue Trained"
                                                            placeHolder="Select Venue Trained"
                                                        />
                                                    </td> :

                                                    <td className="td-toolbox-talk"> {SkillMatrixDataobj[0]?.VenueTrained}</td>}
                                            </tr>
                                            <tr>
                                                <td className="td-toolbox-talk"><b>Attendee Type: <span className="required"> *</span></b></td>
                                                <td className="td-toolbox-talk">
                                                    <div className="divAttendeeType">
                                                        <ChoiceGroup selectedKey={selectedAttendeeType} options={attendeeOptions} onChange={onChange} />
                                                    </div>
                                                </td>
                                            </tr>
                                            <tr>  {IsUpdate === false ?
                                                <td className="td-toolbox-talk"><b>Attendees:<span className="required"> *</span></b></td> :
                                                <td className="td-toolbox-talk"><b>Attendees:</b></td>}
                                                {IsUpdate === false ? <td className="td-toolbox-talk">
                                                    {/* <TrainingAttendanceFilter
                                                        loginUserRoleDetails={props.loginUserRoleDetails}
                                                        selectedTrainingAttendance={selectedTrainingAttendance}
                                                        onTrainingAttendanceChange={onTrainingAttendanceChange}
                                                        provider={props.provider}
                                                        isRequired={true}
                                                        siteNameId={0}
                                                        qCState={StateId}
                                                        defaultOption={ClientLookUp || selectedTrainingAttendance}
                                                        AllOption={false} /> */}

                                                    <AddSingleOtherEmployee
                                                        onEmployeeChange={onEmployeeChange}
                                                        provider={props.provider}
                                                        // StateId={SiteData[0]?.StateId}
                                                        StateId={props.isForm ? StateId : StateId || StateId}
                                                        isDisabled={StateId !== undefined ? false : true}
                                                        isCloseMenuOnSelect={false}
                                                        defaultOption={ClientLookUp}
                                                        isMultiselected={false}
                                                        selectedAttendeeType={selectedAttendeeType}
                                                        selectedAttendeeOptions={selectedAttendeeOptions}
                                                    />
                                                </td> :
                                                    <td className="td-toolbox-talk">{SkillMatrixDataobj[0]?.TrainingAttendance}</td>}
                                            </tr>
                                        </table>

                                        {window?.innerWidth <= 768 ?
                                            <div>
                                                <div className="row skill-border mt-2 sm-card-header">
                                                    <div className="dflex">
                                                        <div className="mw-new">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedRows.size === tableData?.length}
                                                                onChange={(e) => {
                                                                    const checked = e.target.checked;
                                                                    setSelectedRows(checked ? new Set(tableData?.map(row => row[SkillMatrixFields.Id])) : new Set());
                                                                }}
                                                            /><b>Select All</b>
                                                        </div>
                                                        <div className="mw-160 ml-56-per-update-card">
                                                            <Dropdown
                                                                selectedKey={selectedCompleted?.value || 'N/A'} // Use the value property for selectedKey
                                                                options={dropdownOptions}
                                                                disabled={selectedRows.size === 0}
                                                                placeholder="Select Status"
                                                                onChange={(e: any, option: any) => handleCompletedChange(option?.key || '')}
                                                            />
                                                        </div>
                                                        <div className="mw-90 mtl-10-update">
                                                            <Toggle
                                                                disabled={selectedRows.size === 0}
                                                                onChange={(e, checked) => toggleIsActiveForSelectedRows(checked ?? false)}
                                                            />
                                                        </div>
                                                        <div className="mw-90 mtl-105">
                                                            <Toggle
                                                                disabled={selectedRows.size === 0}
                                                                onChange={(e, checked) => toggleCleanerForSelectedRows(checked ?? false)}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                            </div> :
                                            <div className="table-sm mt-2">
                                                <div className="table-header-sm">
                                                    <div className="mw-40">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedRows.size === tableData?.length}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                setSelectedRows(checked ? new Set(tableData?.map(row => row[SkillMatrixFields.Id])) : new Set());
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="text-left-sml">Induction Training Units</div>
                                                    <div className="mw-160">IMSNos</div>

                                                    <div className="mw-160">
                                                        Completed
                                                    </div>
                                                    <div className="mw-90">
                                                        Trainer Signature?
                                                    </div>
                                                    <div className="mw-90">
                                                        Cleaner Signature?
                                                    </div>
                                                    <div className="mw-90">
                                                        Is Training?
                                                    </div>{
                                                    }
                                                </div>
                                                <div className="dflex">
                                                    <div className="mw-160 ml-56-per-update">
                                                        <Dropdown
                                                            selectedKey={selectedCompleted?.value || 'N/A'}  // Use the value property for selectedKey
                                                            options={dropdownOptions}
                                                            disabled={selectedRows.size === 0}
                                                            placeholder="Select Status"
                                                            onChange={(e: any, option: any) => handleCompletedChange(option?.key || '')}
                                                        />
                                                    </div>
                                                    <div className="mw-90 min-wid-118 mtl-10-update">
                                                        <Toggle
                                                            disabled={selectedRows.size === 0}
                                                            onChange={(e, checked) => toggleIsActiveForSelectedRows(checked ?? false)}
                                                        />
                                                    </div>
                                                    <div className="mw-90 min-wid-90 mtl-105">
                                                        <Toggle
                                                            disabled={selectedRows.size === 0}
                                                            onChange={(e, checked) => toggleCleanerForSelectedRows(checked ?? false)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>}

                                        <div className="table-body">
                                            {Object.entries(GroupData).map(([skillMatrix, detail]) => (
                                                <React.Fragment key={skillMatrix}>
                                                    <div className="location-sm">{skillMatrix}</div>
                                                    {detail?.map((row: any) => (
                                                        <SkillMatrixRow
                                                            key={row[SkillMatrixFields.Id]}
                                                            row={row}
                                                            onCellChange={updateCellData}
                                                            onRowSelection={handleRowSelection}
                                                            selectedRows={selectedRows}
                                                        />
                                                    ))}
                                                </React.Fragment>
                                            ))}
                                        </div>

                                        {!!comDataRef.current && comDataRef.current.length > 0 &&
                                            <>
                                                <div className="main-header-text mt-4">Provide Training</div>
                                                <div className="sub-main-header-text mt-2">Following are the skills which cleaner don't know and ready to learn</div>
                                            </>
                                        }
                                        {!!comDataRef.current && comDataRef.current.length > 0 &&
                                            <div className="table-sm mt-2">
                                                <div className="table-header-sm">
                                                    <div className="text-left-sm">Title</div>
                                                    <div className="mw-160">IMS Nos.</div>
                                                    <div className="mw-160">Signature</div>
                                                </div>
                                                <div>
                                                    {comDataRef.current
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
                                            </div>
                                        }


                                        <div className="ms-Grid-row ">
                                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6 ">
                                                <div className='sign-add'>
                                                    <SignatureComponent label={'Trainer Short Signature'} defaultSignature={!!signatureURL ? signatureURL : ""} isDisplayNameEmail={false} email={'ashish.s.prajapati@treta.onmicrosoft.com'} name="Ashish Prajapati 4/9/2024 15:12 PM" getDataUrl={getDataUrl}></SignatureComponent>
                                                </div>
                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6 ">
                                                <div className='sign-add'>
                                                    <SignatureComponent label={'Trainer Signature'} defaultSignature={!!signatureURLFull ? signatureURLFull : ""} isDisplayNameEmail={false} email={'ashish.s.prajapati@treta.onmicrosoft.com'} name="Ashish Prajapati 4/9/2024 15:12 PM" getDataUrl={getDataUrlFull}></SignatureComponent>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="asset-card-2-header-jcc-2 mar-bot-40">
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 toolkit-btn">
                                                <PrimaryButton
                                                    style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                                    className="btn btn-primary"
                                                    text={'Save as Draft'}
                                                    onClick={() => handleSavePre('Draft')}
                                                />
                                                <PrimaryButton
                                                    style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                                    className="btn btn-primary"
                                                    text={(FormStatus !== "Submitted") ? 'Save and Send' : 'Update'}
                                                    onClick={() => {
                                                        if (FormStatus !== "Submitted") {
                                                            handleSavePre('Submitted')
                                                            // handleSavePreSubmit('Submitted')
                                                        } else {
                                                            //onClickYes();
                                                            {
                                                                EData.length > 0 &&
                                                                    showPopup2();
                                                            }
                                                            {
                                                                EData.length === 0 &&
                                                                    showPopupResend();
                                                            }

                                                        }
                                                    }
                                                    }

                                                // onClick={() => handleSavePreSubmit('Submitted')}
                                                />
                                                <PrimaryButton
                                                    style={{ marginBottom: "5px", marginTop: "10px" }}
                                                    className="btn btn-danger"
                                                    text="Cancel"
                                                    onClick={onCloseClick}
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
            {
                isPopupVisible && (
                    <Layer>
                        <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup}>
                            <Overlay onClick={hidePopup} />
                            <FocusTrapZone>
                                <Popup role="document" className={popupStyles.content}>
                                    <h2 className="mt-10">Confirmation</h2>
                                    <div className="mt-3">Do you want provide the training to the Cleaner?</div>
                                    <DialogFooter>
                                        <PrimaryButton text="Yes" onClick={onClickYes} className='mrt15 css-b62m3t-container btn btn-primary' />
                                        <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickNo} />
                                    </DialogFooter>
                                </Popup>
                            </FocusTrapZone>
                        </Popup>
                    </Layer>
                )
            }
            {
                isPopupVisible2 && (
                    <Layer>
                        <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup2}>
                            <Overlay onClick={hidePopup2} />
                            <FocusTrapZone>
                                <Popup role="document" className={popupStyles.content}>
                                    <h2 className="mt-10">Missing Data</h2>
                                    <div className="mt-3">
                                        <ul>
                                            {!!EData && EData.length > 0 ? (
                                                EData.map((error, index) => (
                                                    <li key={index} className="val-m dflex">
                                                        <FontAwesomeIcon icon="circle" className="val-icon-2" /> {error}
                                                    </li>
                                                ))
                                            ) : (
                                                <li>No errors</li>  // Optional: In case ErrorData is empty
                                            )}
                                        </ul>
                                    </div>
                                    <DialogFooter>
                                        <DefaultButton text="Close" className="secondMain btn btn-danger" onClick={onClickClose} />
                                    </DialogFooter>
                                </Popup>
                            </FocusTrapZone>
                        </Popup>
                    </Layer>
                )
            }

        </React.Fragment >

    );
};

export default SkillMatrixs;
