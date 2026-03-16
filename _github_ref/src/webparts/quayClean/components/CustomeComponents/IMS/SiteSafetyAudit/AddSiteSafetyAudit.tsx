/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { DatePicker, DefaultButton, defaultDatePickerStrings, DialogFooter, Dropdown, FocusTrapZone, IDropdownOption, Layer, mergeStyleSets, Overlay, Popup, PrimaryButton, TextField, Toggle } from "@fluentui/react";
import * as React from "react";
import { useBoolean } from "@fluentui/react-hooks";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../Common/ToastService";
import { _getIMSTemplateDetail, onFormatDate, removeElementOfBreadCrum, UserActivityLog } from "../../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../../Interfaces/IAddNewHelpDesk";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Loader } from "../../../CommonComponents/Loader";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ActionMeta } from "react-select";
import { SiteFilter } from "../../../../../../Common/Filter/SiteFilter";
import SuccessComponent from "../../../CommonComponents/SuccessComponent";
import { WHSUsersFilter } from "../../../../../../Common/Filter/WHSUsers";
import { Accordion } from "@pnp/spfx-controls-react";
import { SignatureComponent } from "../../../CommonComponents/SignatureComponent";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { IMSLocationCommonFilter } from "../../../../../../Common/Filter/IMSLocationCommonFilter";
import { DateFormat } from "../../../../../../Common/Constants/CommonConstants";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
const imgLogo = require('../../../../assets/images/logo.png');
const notFoundImage = require('../../../../../quayClean/assets/images/NotFoundImg.png');
const dropdownOptions = [
    { key: 'Yes', text: 'Yes' },
    { key: 'No', text: 'No' },
    { key: 'N/A', text: 'N/A' }
];



export const AddSiteSafetyAudit: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const [value, setValue] = React.useState(props.initialValue);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail, currentUser } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const isVisibleCrud = React.useRef<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
    const [SiteData, setSiteData] = React.useState<any[]>([]);
    const [SSAMaster, setSSAMaster] = React.useState<any[]>([]);
    const [SSAMasterTitle, setSSAMasterTitle] = React.useState<any[]>([]);
    const [ComplianceSections, setComplianceSections] = React.useState<any[]>([]);
    const [ComplianceSectionsChecklist, setComplianceSectionsChecklist] = React.useState<any[]>([]);
    const [selectedStatus, setSelectedStatus] = React.useState<{ [key: string]: string }>({});
    const [visibility, setVisibility] = React.useState<{ [key: string]: boolean }>({});
    const [uploadedFiles, setUploadedFiles] = React.useState<{ [key: string]: File[] }>({});
    const [selectedWHSUsersArray, setSelectedWHSUsersArray] = React.useState<any[]>([]);
    const [selectedWHSUsers, setSelectedWHSUsers] = React.useState<string>("");
    const [selectedAttendees, setSelectedAttendees] = React.useState<any[]>([]);
    const [AllMasterData, setAllMasterData] = React.useState<any[]>([]);
    const [AllDetailData, setAllDetailData] = React.useState<any[]>([]);
    const [FormStatus, setFormStatus] = React.useState<string>("");
    const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
    const [TemplateDetail, setTemplateDetail] = React.useState<any>();
    const [IMSTemplateToolboxTalkMasterData, setIMSTemplateToolboxTalkMasterData] = React.useState<any[]>([]);
    const [IMSTemplateToolboxTalk, setIMSTemplateToolboxTalk] = React.useState<any[]>([]);
    const [ToolboxTalkData, setToolboxTalkData] = React.useState<any[]>([]);

    const [StateName, setStateName] = React.useState<string>();
    const [StateId, setStateId] = React.useState<string>(props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);
    const [title, setTitle] = React.useState<string>("");
    const [MeetingLocation, setMeetingLocation] = React.useState<string>("");
    const [Minutestakenandrecordedby, setMinutestakenandrecordedby] = React.useState<string>("");
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
    const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
    const [displayerror, setDisplayError] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [isTemplatePopupVisible, { setTrue: showTemplatePopup, setFalse: hideTemplatePopup }] = useBoolean(false);
    const [GeneratedID, setGeneratedID] = React.useState<string>("");
    const [selectedToolBoxTalkStatus, setSelectedToolBoxTalkStatus] = React.useState<any>({});
    const [comments, setComments] = React.useState<any>({});
    const [MFPM, setMFPM] = React.useState<string>("");
    const [NMFD, setNMFD] = React.useState<string>("");
    const [ClientLookUp, setClientLookUp] = React.useState<number[]>([]);
    const [DiscussionPoints, setDiscussionPoints] = React.useState<string>("");
    const [MainComments, setMainComments] = React.useState<string>("");
    const [Today, setToday] = React.useState<string>(moment().format('DD-MM-YYYY'));
    const [selectedEmployee, setSelectedEmployee] = React.useState<any>();
    const [UpdateItemId, setUpdateItemId] = React.useState<any>();
    const [signatureURL, setSignatureURL] = React.useState<string | null>(null);
    const [signatureURLFull, setSignatureURLFull] = React.useState<string | null>(null);
    const [ToolboxTalk, setToolboxTalk] = React.useState<any>();
    const [IsUpdate, setIsUpdate] = React.useState<boolean>(false);
    const [attachments, setAttachments] = React.useState<any>();
    const [isComponentClosed, setIsComponentClosed] = React.useState(false);
    const [templateAttachments, setTemplateAttachments] = React.useState<any>();
    const [ListAttachmentsFiles, setListAttachmentsFiles] = React.useState<any>();
    const [defaultManager, setDefaultManager] = React.useState<any>(props?.loginUserRoleDetails?.Id);
    const [selectedManager, setSelectedManager] = React.useState<any>();
    const [ManagerOptions, setManagerOptions] = React.useState<IDropdownOption[]>();
    const [isPopupVisible2, { setTrue: showPopup2, setFalse: hidePopup2 }] = useBoolean(false);
    const [ErrorData, setErrorData] = React.useState<any[]>([]);
    const [selectedSite, setSelectedSite] = React.useState<any>("");
    const TemplateData = React.useRef<any>(null);
    const [selectedAttendeeType, setSelectedAttendeeType] = React.useState<string | undefined>('Quayclean Employee');
    const [selectedAttendeeOptions, setSelectedAttendeeOptions] = React.useState<any[]>([]);
    const [IsLimit, setIsLimit] = React.useState<boolean>(false);
    const [width, setWidth] = React.useState<string>("400px");
    const getDataUrl = (dataURL: string) => {
        if (dataURL) {
            setSignatureURL(dataURL);
        }
    };

    const onIMSLocationChange = (loc: any): void => {
        setMeetingLocation(loc);
    };

    const getDataUrlFull = (dataURL: string) => {
        if (dataURL) {
            setSignatureURLFull(dataURL);
        }
    };
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("400px");
        }
    }, [window.innerWidth]);
    const onClickNo = () => {
        hidePopup2();
    }
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

    const onWHSUsersChange = (selectedAssets: any[]): void => {
        const selectedValues = selectedAssets.map(asset => asset.text?.toString().trim());
        const selectedValuesId = selectedAssets.map(asset => asset.value);
        setSelectedWHSUsersArray(selectedValues);
        setSelectedAttendees(selectedValuesId);
        const joinedValues = selectedValues.join(", ");
        setSelectedWHSUsers(joinedValues);
    };
    const onChange = React.useCallback((ev: React.SyntheticEvent<HTMLElement>, option: any) => {
        setSelectedAttendeeType(option.key);
    }, []);

    const _onManagerChange = (option: any, actionMeta: ActionMeta<any>): void => {
        setSelectedManager(option?.text);
        setDefaultManager(option?.value);
    };


    const [masterStateId, setMasterStateId] = React.useState(SiteData[0]?.StateId || props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);

    React.useEffect(() => {
        setMasterStateId(SiteData[0]?.StateId || props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);
    }, [SiteData[0]?.StateId, StateId]);


    const [fileattachment, setfileattachment] = React.useState({
        isMultipleFiles: true,
        Files: [],
        isOverwriteFile: true
    });

    const [state, SetState] = React.useState<IHelpDeskFormState>({
        CallerOptions: [],
        CategoryOptions: [],
        EventOptions: [],
        isdisableField: !!isAddNewHelpDesk ? false : true,
        isAddNewHelpDesk: !!isAddNewHelpDesk,
        isformValidationModelOpen: false,
        validationMessage: null
    });

    const onEmployeeChange = (selectedOptions: any[]): void => {
        setSelectedAttendeeOptions(selectedOptions);
        const selectedEmployeeIds = selectedOptions.map(option => option.text).join(', ');
        const valuesArray = selectedOptions.map((item: any) => item.value);
        setClientLookUp(valuesArray);
        setSelectedEmployee(selectedEmployeeIds);
        if (selectedOptions.length > 50) {
            setIsLimit(true);
        } else {
            setIsLimit(false);
        }
    };

    const initialToggles = ToolboxTalkData.reduce((acc, item) => {
        acc[item.ID] = false;
        return acc;
    }, {});

    const [showToggles, setShowToggles] = React.useState<any>(initialToggles);

    const onClickCancel = () => {
        if (props.isForm) {
            window.open('');
        } else {
            if (isSiteLevelComponent) {
                // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                // props.manageComponentView({
                //     currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.qCStateId, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "ToolboxIncident",
                // });
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                    selectedZoneDetails: selectedZoneDetails,
                    isShowDetailOnly: true,
                    pivotName: "IMSKey",
                    subpivotName: "SiteSafetyAudit",
                });
            } else {
                if (props.isDirectView) {
                    const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                    props.manageComponentView({
                        currentComponentName: ComponentNameEnum.WHSCommitteeInspection, qCStateId: props?.componentProps?.qCStateId, originalState: StateName, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "SiteSafetyAudit",
                    });
                } else {
                    const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                    manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, view: props.componentProps.viewType, breadCrumItems: breadCrumItems, subpivotName: "SiteSafetyAudit", selectedZoneDetails: props.componentProps.selectedZoneDetails });
                }

            }
        }

    };


    const handleToggleChange = (itemId: any, checked: any) => {
        setShowToggles((prev: any) => ({
            ...prev,
            [itemId]: checked
        }));
    };

    const onMainCommentsChange = (newText: string) => {
        newText = newText.replace(" bold ", " <strong>bold</strong> ");
        setMainComments(newText);
        return newText;
    };

    const onToolBoxTalkStatusChange = (detailId: any, newStatus: any) => {
        setSelectedToolBoxTalkStatus((prev: any) => ({
            ...prev,
            [detailId]: newStatus
        }));
    };

    const _siteData = () => {
        try {
            let filter = "";
            if (props.isForm && (selectedSite !== "" || selectedSite !== undefined)) {
                filter = `ID eq ${selectedSite}`;
            } else {
                filter = `ID eq ${!!props?.originalSiteMasterId ? props?.originalSiteMasterId : selectedSite}`;
            }
            const select = ["ID,Title,SiteManagerId,SiteManager/Title,SiteManager/Name,SiteManager/EMail,QCStateId,Category"];
            const expand = ["SiteManager"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                filter: filter,
                listName: ListNames.SitesMaster,
            };

            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const SiteData: any = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                SiteManagerId: data.SiteManagerId,
                                SiteManagerName: !!data.SiteManagerId ? data.SiteManager.map((i: { Title: any; }) => i.Title) : '',
                                SiteManagerEmail: !!data.SiteManager ? data.SiteManager.map((i: { EMail: any; }) => i.EMail) : '',
                                StateId: !!data.QCStateId ? data.QCStateId : null
                            }
                        );
                    });
                    setSiteData(SiteData);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
        }
    };

    // const _getIMSTemplateToolboxTalkMasterData = async (masterId: number) => {
    //     try {
    //         const select = [
    //             "ID", "Title", "ToolboxTalkMasterId", "ToolboxTalkMaster/Id", "ToolboxTalkMaster/Title",
    //             "Comment", "MasterId", "IsShow"
    //         ];
    //         const expand = ["ToolboxTalkMaster"];
    //         const queryStringOptions: IPnPQueryOptions = {
    //             select,
    //             expand,
    //             filter: `MasterId eq ${masterId}`,
    //             listName: ListNames.IMSTemplateToolboxTalkMasterData,
    //         };

    //         const results = await props.provider.getItemsByQuery(queryStringOptions);
    //         return results?.map(data => ({
    //             ID: data.ID,
    //             Title: data.Title,
    //             ToolboxTalkMasterId: data.ToolboxTalkMasterId ?? 0,
    //             Comment: data.Comment ?? '',
    //             MasterId: data.MasterId ?? 0,
    //             IsShow: data.IsShow ?? false,
    //         })) || [];
    //     } catch (error) {
    //         console.error("Error fetching IMSTemplateToolboxTalkMasterData:", error);
    //         setIsLoading(false);
    //     }
    // };

    // const _getIMSTemplateToolboxTalk = async (masterId: number) => {
    //     try {
    //         const select = [
    //             "ID", "Title", "ToolboxTalkDetailsId", "ToolboxTalkDetails/Id", "ToolboxTalkDetails/Title",
    //             "ToolboxTalkMasterId", "ToolboxTalkMaster/Id", "ToolboxTalkMaster/Title", "Response", "MasterId"
    //         ];
    //         const expand = ["ToolboxTalkDetails", "ToolboxTalkMaster"];
    //         const queryStringOptions: IPnPQueryOptions = {
    //             select,
    //             expand,
    //             filter: `MasterId eq ${masterId}`,
    //             listName: ListNames.IMSTemplateToolboxTalk,
    //         };

    //         const results = await props.provider.getItemsByQuery(queryStringOptions);
    //         return results?.map(data => ({
    //             ID: data.ID,
    //             Title: data.Title,
    //             ToolboxTalkDetailsId: data.ToolboxTalkDetailsId ?? 0,
    //             ToolboxTalkMasterId: data.ToolboxTalkMasterId ?? 0,
    //             Response: data.Response ?? '',
    //             MasterId: data.MasterId ?? '',
    //         })) || [];
    //     } catch (error) {
    //         console.error("Error fetching IMSTemplateToolboxTalk data:", error);
    //         setIsLoading(false);
    //     }
    // };

    // React.useEffect(() => {
    //     const fetchData = async () => {
    //         if (TemplateDetail?.ID) {
    //             try {
    //                 const [IMSTemplateToolboxTalkMasterData, IMSTemplateToolboxTalk] = await Promise.all([
    //                     _getIMSTemplateToolboxTalkMasterData(TemplateDetail.ID),
    //                     _getIMSTemplateToolboxTalk(TemplateDetail.ID)
    //                 ]);

    //                 setIMSTemplateToolboxTalkMasterData(IMSTemplateToolboxTalkMasterData ?? []);
    //                 setIMSTemplateToolboxTalk(IMSTemplateToolboxTalk ?? []);
    //             } catch (error) {
    //                 console.error("Error fetching IMSTemplate data:", error);
    //             }
    //         }
    //     };
    //     fetchData();
    // }, [TemplateDetail]);

    React.useEffect(() => {
        _siteData();
    }, [selectedSite]);


    const _SiteSafetuAuditMasterData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,Name,Key"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.SiteSafetyAuditMaster,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const SSAMasterData = results.map((data) => {
                        return {
                            ID: data.ID,
                            Title: !!data.Title ? data.Title : "",
                            Name: !!data.Name ? data.Name : "",
                            Key: !!data.Key ? data.Key : "",
                        };
                    });
                    const uniqueTitles: string[] = SSAMasterData
                        .map(item => item.Title)
                        .filter((title, index, self) => self.indexOf(title) === index);
                    setSSAMasterTitle(uniqueTitles);
                    setSSAMaster(SSAMasterData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    };

    const _ComplianceSectionsData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,SiteSafetyAuditMasterId,SiteSafetyAuditMaster/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteSafetyAuditMaster"],
                listName: ListNames.ComplianceSections,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const ListData = results.map((data) => {
                        return {
                            ID: data.ID,
                            Title: !!data.Title ? data.Title : "",
                            SiteSafetyAuditMasterId: !!data.SiteSafetyAuditMasterId ? data.SiteSafetyAuditMasterId : '',
                            SiteSafetyAuditMaster: !!data.SiteSafetyAuditMaster ? data.SiteSafetyAuditMaster.Title : ''
                        };
                    });
                    setComplianceSections(ListData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    };

    const _ComplianceChecksListrData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,ComplianceSectionsId,ComplianceSections/Title,Weightage"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["ComplianceSections"],
                listName: ListNames.ComplianceChecksList,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const ListData = results.map((data) => {
                        return {
                            ID: data.ID,
                            Title: !!data.Title ? data.Title : "",
                            ComplianceSectionsId: !!data.ComplianceSectionsId ? data.ComplianceSectionsId : '',
                            ComplianceSections: !!data.ComplianceSections ? data.ComplianceSections.Title : '',
                            Weightage: !!data.Weightage ? data.Weightage : '',
                        };
                    });
                    setComplianceSectionsChecklist(ListData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    };

    const resetForm = (): void => {
        setTitle("");
        setSendToEmail("");
        setDisplayErrorTitle(false);
        setDisplayErrorEmail(false);
        setDisplayError(false);
    };

    const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setTitle(newValue || "");
        if (newValue) {
            setDisplayErrorTitle(false);
        }
    };

    const onChangeMeetingLocation = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setMeetingLocation(newValue || "");
    };

    const onChangeMinutestakenandrecordedby = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setMinutestakenandrecordedby(newValue || "");
    };

    const transformUploadedFiles = (uploadedFiles: Record<string, any[]>) => {
        let allFiles: any[] = [];
        Object.entries(uploadedFiles).forEach(([category, files]) => {
            files.forEach(file => {
                allFiles.push({
                    ...file, // Keep original file properties
                    category // Retain category association
                });
            });
        });
        return allFiles;
    };


    const onClickSaveOrUpdate = async (type: string) => {
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        let isValidForm = true;
        const IsCreateNewRecord = (type == "create") ? true : false;
        type = (type == "create") ? "submit" : type;
        try {
            const MeetingDate = moment(Today, DateFormat).toDate();
            if (IsUpdate && !IsCreateNewRecord) {
                setIsLoading(true);
                const toastMessage = "Site Safety Audit has been updated successfully!";
                const finalizeUpdate = () => {
                    setTimeout(() => {
                        onClickCancel();
                        setIsLoading(false);
                        toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    }, 1000);
                };
                // Transform data for batch update
                const transformedArray = Object.entries(selectedStatus).map(([key, value]) => ({
                    Id: Number(key),
                    Answer: value
                }));

                const transformedData = AllMasterData.map(item => ({
                    Id: item.ID,
                    IsEnabled: visibility[item.SiteSafetyAuditMaster] === true ? true : false // Explicitly set false if condition fails
                }));

                const SiteSafetyAuditUpdateData = {
                    Location: MeetingLocation || "N/A",
                    // ChairpersonId: [defaultManager],
                    MinutesTakenAndRecordedBy: Minutestakenandrecordedby || "",
                    Attendees: selectedWHSUsers || "",
                    WHSUsersId: selectedAttendees,
                    FormStatus: type,
                    MeetingDate: MeetingDate,
                    SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                    // ShortSignature: signatureURL,
                    // Signature: signatureURLFull,
                };

                // Function to batch update in chunks
                const batchUpdate = async (data: any[], listName: string, chunkSize = 25) => {
                    const chunks = [];
                    for (let i = 0; i < data.length; i += chunkSize) {
                        chunks.push(data.slice(i, i + chunkSize));
                    }
                    return Promise.all(chunks.map(chunk => props.provider.updateListItemsInBatchPnP(listName, chunk)));
                };
                const logObj = {
                    UserName: props?.loginUserRoleDetails?.title,
                    SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                    ActionType: UserActivityActionTypeEnum.Update,
                    EntityType: UserActionEntityTypeEnum.WHSCommitteeInspection,
                    LogFor: UserActionLogFor.Both,
                    EntityId: Number(UpdateItemId),
                    EntityName: GeneratedID,
                    Details: `Update WHS Committee Inspection`,
                    StateId: props?.componentProps?.qCStateId
                };
                void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                try {
                    // Execute updates in parallel
                    await Promise.all([
                        batchUpdate(transformedArray, ListNames.ComplianceChecksListData),  // 189 items
                        batchUpdate(transformedData, ListNames.ComplianceSectionsData),     // 59 items
                        props.provider.updateItemWithPnP(SiteSafetyAuditUpdateData, ListNames.SiteSafetyAudit, UpdateItemId),
                    ]);

                    // Handle file uploads asynchronously
                    const Fileresult = transformUploadedFiles(uploadedFiles);
                    if (Fileresult.length > 0) {
                        setIsLoading(true);
                        props.provider.uploadAttachmentsToListSequential(ListNames.SiteSafetyAudit, Fileresult, UpdateItemId)
                            .then(() => console.log("All files uploaded successfully"))
                            .catch((error: any) => console.error("Failed to upload files", error))
                            .finally(() => finalizeUpdate());
                    } else {
                        finalizeUpdate();
                    }
                } catch (error) {
                    console.error("Error updating data", error);
                    setIsLoading(false);
                }

                // Final update function


            } else {
                setIsLoading(true);
                let isValid = true;
                let createdId: number = 0;

                // Helper function to navigate after completion
                const handleNavigation = () => {
                    if (props.isForm) {
                        setIsComponentClosed(true);
                        setIsLoading(false);
                    } else {
                        setIsLoading(false);
                        const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                        props.manageComponentView({
                            currentComponentName: props.isDirectView ? ComponentNameEnum.WHSCommitteeInspection : ComponentNameEnum.AddNewSite,
                            originalState: StateName,
                            dataObj: props.componentProps.dataObj,
                            breadCrumItems: breadCrumItems,
                            siteMasterId: props.isDirectView ? "" : props.originalSiteMasterId,
                            isShowDetailOnly: true,
                            siteName: props.componentProps.siteName,
                            qCState: props.componentProps.qCState,
                            pivotName: "IMSKey",
                            subpivotName: "SiteSafetyAudit",
                            isDirectView: props.isDirectView
                        });
                    }
                };

                // Helper function to show validation errors
                const showValidationErrors = () => {
                    const errormsg: any[] = [];
                    if (masterStateId === undefined) errormsg.push(<div>Job site is required</div>);
                    if (defaultManager == null) errormsg.push(<div>Manager is required</div>);
                    if (Minutestakenandrecordedby == "") errormsg.push(<div>Audit taken and recorded by is required</div>);
                    if (selectedWHSUsers == "") errormsg.push(<div>WHS Committee Chairperson is required</div>);
                    if (MeetingLocation == "") errormsg.push(<div>WHS Committee location is required</div>);
                    // if (signatureURL == null || signatureURL == "") errormsg.push(<div>Sort signature is required</div>);
                    // if (signatureURLFull == null || signatureURLFull == "") errormsg.push(<div>Signature is required</div>);
                    setErrorData(errormsg);
                    if (errormsg.length > 0)
                        showPopup2();
                    toastService.dismiss(toastId);
                };
                if (
                    isValid &&
                    Minutestakenandrecordedby.trim() !== "" &&
                    MeetingLocation.trim() !== "" &&
                    selectedWHSUsers.trim() !== ""
                    // (signatureURL && signatureURL.trim() !== "") &&  // Ensure it's NOT null or empty
                    // (signatureURLFull && signatureURLFull.trim() !== "") // Ensure it's NOT null or empty
                ) {
                    const toastMessage = "Site Safety Audit has been added successfully!";
                    const SiteSafetyAuditData = {
                        Title: GeneratedID ?? "",
                        MeetingDate,
                        MeetingID: GeneratedID ?? "",
                        Location: MeetingLocation || "N/A",
                        MinutesTakenAndRecordedBy: Minutestakenandrecordedby || "",
                        SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                        Attendees: selectedWHSUsers || "",
                        WHSUsersId: selectedAttendees,
                        FormStatus: type,
                        CreatedDate: IsUpdate ? ToolboxTalk?.CreatedDate ?? new Date() : new Date(),
                        // ShortSignature: signatureURL,
                        // Signature: signatureURLFull,
                    };

                    const Fileresult = transformUploadedFiles(uploadedFiles);

                    try {
                        // Insert the Site Safety Audit entry
                        const item = await props.provider.createItem(SiteSafetyAuditData, ListNames.SiteSafetyAudit);
                        createdId = item.data.Id;
                        const logObj = {
                            UserName: props?.loginUserRoleDetails?.title,
                            SiteNameId: Number(selectedSite) || Number(props?.originalSiteMasterId),
                            ActionType: UserActivityActionTypeEnum.Create,
                            EntityType: UserActionEntityTypeEnum.WHSCommitteeInspection,
                            EntityId: Number(createdId),
                            LogFor: UserActionLogFor.Both,
                            EntityName: GeneratedID,
                            Details: `Add WHS Committee Inspection`,
                            StateId: props?.componentProps?.qCStateId
                        };
                        void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                        if (createdId > 0) {
                            const ComplianceSectionsData: any[] = ComplianceSections.map(section => ({
                                IsEnabled: visibility[section.SiteSafetyAuditMaster] ?? false,
                                MasterId: createdId,
                                ComplianceSectionsId: Number(section.ID),
                                Title: section.Title,
                                SiteSafetyAuditId: section.SiteSafetyAuditMasterId
                            }));

                            const processedChecklistsData: any[] = ComplianceSectionsChecklist.map(checklist => ({
                                Answer: selectedStatus[checklist.ID.toString()] ?? "N/A",
                                MasterId: createdId,
                                ComplianceSectionsChecklistId: checklist.ID,
                                Title: checklist.Title,
                                ComplianceSectionsId: checklist.ComplianceSectionsId,
                                Weightage: checklist.Weightage
                            }));

                            // Function to batch insert in chunks
                            const batchInsert = async (data: any[], listName: string, chunkSize = 25) => {
                                const chunks = [];
                                for (let i = 0; i < data.length; i += chunkSize) {
                                    chunks.push(data.slice(i, i + chunkSize));
                                }
                                return Promise.all(chunks.map(chunk => props.provider.createItemInBatch(chunk, listName)));
                            };

                            // Run ComplianceSectionsData and ComplianceSectionsChecklist in parallel
                            const [complianceResponse] = await Promise.all([
                                batchInsert(ComplianceSectionsData, ListNames.ComplianceSectionsData),
                            ]);

                            // Map ComplianceSectionsChecklist to ComplianceSectionsData IDs
                            const updatedChecklistsData = processedChecklistsData.map(checklistItem => {
                                const matchingResItem = complianceResponse.flat().find((ite: any) => ite.data.ComplianceSectionsId === checklistItem.ComplianceSectionsId);
                                return {
                                    ...checklistItem,
                                    ComplianceSectionsDataId: matchingResItem ? matchingResItem.data.ID : null
                                };
                            });

                            // Insert ComplianceSectionsChecklist in parallel
                            await batchInsert(updatedChecklistsData, ListNames.ComplianceChecksListData);

                            // Parallelize file uploads while inserting data
                            if (Fileresult.length > 0) {
                                setIsLoading(true);
                                props.provider.uploadAttachmentsToListSequential(ListNames.SiteSafetyAudit, Fileresult, createdId)
                                    .then(() => {
                                        console.log("All files uploaded successfully");
                                        toastService.updateLoadingWithSuccess(toastId, toastMessage);
                                    })
                                    .catch((error: any) => {
                                        console.error("Failed to upload files", error);
                                    })
                                    .finally(() => {
                                        // setIsLoading(false);
                                        handleNavigation();
                                    });
                            } else {
                                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                                // setIsLoading(false);
                                handleNavigation();
                            }
                        }
                    } catch (err) {
                        console.error("Error in processing", err);
                        setIsLoading(false);
                    }
                } else {
                    setIsLoading(false);
                    showValidationErrors();
                }
                // setIsLoading(false);
            }

        } catch (error) {
            console.log(error);
            const errorMessage = 'Something went wrong! Please try again later!';
            toastService.showError(toastId, errorMessage);
            setIsLoading(false);
        }
    };


    const MasterData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,IsEnabled,SiteSafetyAuditId,SiteSafetyAudit/Title,MasterId,ComplianceSectionsId"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteSafetyAudit"],
                filter: `MasterId eq '${props?.componentProps?.siteMasterId}'`,
                listName: ListNames.ComplianceSectionsData,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const ListData = results.map((data) => {
                        return {
                            ID: data.ID,
                            Title: !!data.Title ? data.Title : "",
                            SiteSafetyAuditMasterId: !!data.SiteSafetyAuditId ? data.SiteSafetyAuditId : '',
                            SiteSafetyAuditMaster: !!data.SiteSafetyAuditId ? data.SiteSafetyAudit.Title : '',
                            IsEnabled: !!data.IsEnabled ? data.IsEnabled : "",
                            ComplianceSectionsId: !!data.ComplianceSectionsId ? data.ComplianceSectionsId : '',
                        };
                    });
                    setComplianceSections(ListData);
                    setAllMasterData(ListData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    };

    const DetailsData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,MasterId,ComplianceSectionsChecklistId,Weightage,Answer,ComplianceSectionsDataId,ComplianceSectionsData/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["ComplianceSectionsData"],
                filter: `MasterId eq '${props?.componentProps?.siteMasterId}'`,
                listName: ListNames.ComplianceChecksListData,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                Answer: !!data.Answer ? data.Answer : '',
                                Weightage: !!data.Weightage ? data.Weightage : '',
                                MasterId: !!data.MasterId ? data.MasterId : '',
                                ComplianceSectionsChecklistId: !!data.ComplianceSectionsChecklistId ? data.ComplianceSectionsChecklistId : '',
                                ComplianceSectionsId: !!data.ComplianceSectionsDataId ? data.ComplianceSectionsDataId : '',
                                ComplianceSections: !!data.ComplianceSectionsData ? data.ComplianceSectionsData.Title : ''
                            }
                        );
                    });
                    setComplianceSectionsChecklist(UsersListData);
                    setAllDetailData(UsersListData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    };

    const onDeleteFile = (FileName: any) => {
        props.provider.deleteAttachment(ListNames.SiteSafetyAudit, UpdateItemId, FileName);
        const updatedAttachments = attachments.filter((filePath: any) => filePath.split('/').pop() !== FileName);
        setAttachments(updatedAttachments);
    }

    const onDeleteTemplateAttachmentFile = (FileName: any) => {
        // provider.deleteAttachment(ListNames.IMSTemplateMaster, ToolboxTalk?.ID, FileName);
        const updatedAttachments = templateAttachments.filter((filePath: any) => filePath.split('/').pop() !== FileName);
        const updatedAttach = ListAttachmentsFiles.filter((i: any) => { return i.FileName !== FileName });
        setTemplateAttachments(updatedAttachments);
        setListAttachmentsFiles(updatedAttach);
    }

    React.useEffect(() => {
        setSelectedSite(props?.originalSiteMasterId);
        let isVisibleCrud1 = (currentUserRoleDetail.isShowOnlyChairPerson || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;
        if (props?.componentProps?.originalState) {
            setStateName(props.componentProps.originalState);
        }
        if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
            setUpdateItemId(props?.componentProps?.siteMasterId);
            setIsUpdate(true);
            let updatedata = props?.componentProps?.UpdateItem;
            setGeneratedID(updatedata.MeetingID);
            // setSelectedManager(updatedata.Chairperson[0]);
            // setDefaultManager(updatedata.ChairpersonID[0]);
            setMinutestakenandrecordedby(updatedata.MinutesTakenAndRecordedBy);
            setMeetingLocation(updatedata.Location);
            setSelectedAttendees(updatedata.WHSUsersId);
            setSelectedWHSUsersArray(updatedata.WHSUsers);
            setAttachments(updatedata.Attachment);
            setFormStatus(updatedata.FormStatus)
            setToday(updatedata.MeetingDate);
            _SiteSafetuAuditMasterData();
            MasterData();
            DetailsData();
        } else {

            _SiteSafetuAuditMasterData();
            _ComplianceSectionsData();
            _ComplianceChecksListrData();
            let SM = props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.SM;
            const formattedDate = moment().format('DD-MM-YYYY');
            setToday(formattedDate);
            const timestamp = Date.now();
            const uniquePart = (timestamp % 100000).toString().padStart(6, '0');
            const id = `SSA-${uniquePart}`;
            setGeneratedID(id);
        }
    }, []);

    const getDropdownOptions = (data: any) => {
        const options = data
            .map((item: any) => item.TemplateName)
            .filter((name: any, index: any, self: any) => name && self.indexOf(name) === index) // remove duplicates and empty strings
            .map((name: any) => ({ key: name, text: name }));

        return options;
    };

    React.useEffect(() => {
        if (SiteData && SiteData.length > 0) {
            const optionSiteManager: any[] = [];
            SiteData.forEach((site: any) => {
                site?.SiteManagerId?.forEach((managerId: any, index: number) => {
                    optionSiteManager.push({
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
        const uniqueAuditMasters = new Map<string, boolean>();
        AllMasterData.forEach(item => {
            const { SiteSafetyAuditMaster, IsEnabled } = item;
            if (!uniqueAuditMasters.has(SiteSafetyAuditMaster)) {
                uniqueAuditMasters.set(SiteSafetyAuditMaster, false);
            }
            if (IsEnabled === true) {
                uniqueAuditMasters.set(SiteSafetyAuditMaster, true);
            }
        });
        setVisibility(Object.fromEntries(uniqueAuditMasters));
    }, [AllMasterData]);

    React.useEffect(() => {
        const transformedData = AllDetailData.reduce((acc, item) => {
            acc[item.ID.toString()] = item.Answer || "N/A"; // Convert ID to string and set default "N/A"
            return acc;
        }, {} as Record<string, string>);

        setSelectedStatus(transformedData);
    }, [AllDetailData]);

    const onClickYesConfirm = () => {
        hidePopup();
        onClickSaveOrUpdate('create');
    }

    const onClickNoConfirm = () => {
        hidePopup();
        onClickSaveOrUpdate('submit');
    }

    const onClickYesLoadTemplateData = () => {
        setMFPM(TemplateDetail?.MattersfromPreviousMeetings ?? "");
        setNMFD(TemplateDetail?.NewMattersforDiscussion ?? "");
        setDiscussionPoints(TemplateDetail?.DiscussionPoints ?? "");
        setMainComments(TemplateDetail?.Comments ?? "");
        setTemplateAttachments(TemplateDetail.Attachment);
        setListAttachmentsFiles(TemplateDetail.AttachmentFiles);
        if (IMSTemplateToolboxTalkMasterData && IMSTemplateToolboxTalkMasterData.length > 0) {
            const commentArray: any = {};
            const defaultToggles: any = {};
            IMSTemplateToolboxTalkMasterData.forEach((item: any) => {
                commentArray[item.ToolboxTalkMasterId] = item.Comment;
                defaultToggles[item.ToolboxTalkMasterId] = item.IsShow;
            });
            setComments(commentArray);
            setShowToggles(defaultToggles);
        }
        if (IMSTemplateToolboxTalk && IMSTemplateToolboxTalk.length > 0) {
            const selectedStatus: any = {};
            IMSTemplateToolboxTalk.forEach((item: any) => {
                selectedStatus[item.ToolboxTalkDetailsId] = item.Response
            });
            setSelectedToolBoxTalkStatus(selectedStatus);
        }
        hideTemplatePopup();
    }

    const onClickNoLoadTemplateData = () => {
        hideTemplatePopup();
    }


    const onSiteChange = (selectedOption: any): void => {
        setSelectedSite(selectedOption?.value);
        setMeetingLocation("");
    };

    if (isComponentClosed) {
        // Render the success component only when the current one is closed
        return <SuccessComponent />;
    }


    const handleDropdownChange = (id: number, option: IDropdownOption | undefined) => {
        setSelectedStatus(prev => ({ ...prev, [id]: option?.key as string }));
    };

    const handleToggle = (id: number, checked: boolean) => {
        setVisibility(prev => ({ ...prev, [id]: checked }));
    };

    const fileSelectionChange = (event: any, title: any) => {
        let files = event.target.files;
        if (files.length > 0) {
            let selectedFiles: any[] = [];

            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                let FileName = file.name.split('.').slice(0, -1).join('.'); // Extract file name
                let ExtensionName = file.name.split('.').pop(); // Extract file extension
                let NewFileName = `${FileName}_${title}${i + 1}.${ExtensionName}`;

                let selectedFile: any = {
                    file: file,
                    name: NewFileName,
                    folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/Shared Documents`,
                    overwrite: true
                };

                selectedFiles.push(selectedFile);
            }

            // Store files per title
            setUploadedFiles(prevFiles => ({
                ...prevFiles,
                [title]: selectedFiles // Replace existing files for this title
            }));
        }
    };


    return <>
        {isLoading && <Loader />}
        {state.isformValidationModelOpen &&
            <CustomModal
                isModalOpenProps={state.isformValidationModelOpen} setModalpopUpFalse={() => {
                    SetState((prevState: any) => ({ ...prevState, isformValidationModelOpen: false }));
                }} subject={"Missing data"}
                message={state.validationMessage} closeButtonText={"Close"} />}
        <div className="mt-10">
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div id="ToolboxTalk" className="asset-card-2-header-jcc-2 margin-bot-80">
                        <div className="formGroup btnSticky">
                            <div className="va-b inlineBlock">
                                <PrimaryButton
                                    className="btn btn-danger"
                                    text="Close"
                                    onClick={onClickCancel}
                                />
                            </div>
                        </div>
                        <div className="">
                            <div className="boxCard">
                                <table className="table-toolbox-talk cell-space-0" style={{ width: "100%", border: "1px solid black" }} >
                                    <tr>
                                        <th className="th-toolbox-talk-logo pl-10 bg-white br-1" > <img src={imgLogo} height="30px" className="course-img-first img-mt" /></th>
                                        <td className="td-toolbox-talk middle-box"><div>WHS Committee Inspection Checklist</div></td>
                                        <td className="td-toolbox-talk blue-box pl-10"><div>Document No</div><div>QC-CP-13-F1</div></td>
                                    </tr>
                                </table>
                                <div className="meeting-id-cls"><div className="td-toolbox-talk blue-text dflex"><div className="toggle-class">WHS Committee Id: {GeneratedID}</div></div></div>
                                <table className="table-toolbox-talk">
                                    <tr>
                                        <td className="td-toolbox-talk"><b>WHS Committee Date:</b></td>
                                        <td className="td-toolbox-talk">
                                            {/* {Today} */}


                                            <DatePicker
                                                showMonthPickerAsOverlay={true}
                                                strings={defaultDatePickerStrings}
                                                placeholder="Select a date..."
                                                ariaLabel="Select a date"
                                                formatDate={onFormatDate}
                                                value={selectedDate || moment(Today, DateFormat).toDate()} // Use selectedDate state
                                                onSelectDate={(date?: Date) => {
                                                    if (date) {
                                                        setSelectedDate(date); // Update the selected date state
                                                        const strDate = moment(date).format(DateFormat);
                                                        setToday(strDate);
                                                    }
                                                }}
                                            />

                                            {/* <DatePicker
                                                showMonthPickerAsOverlay={true}
                                                strings={defaultDatePickerStrings}
                                                placeholder="Select a date..."
                                                ariaLabel="Select a date"
                                                formatDate={onFormatDate}
                                                value={IsUpdate
                                                    ? moment(Today, DateFormat).toDate()
                                                    : moment(Today, DateFormat).toDate()}
                                                onSelectDate={(date?: Date) => {
                                                    if (date !== undefined) {
                                                        const strDate = moment(date).format(DateFormat);
                                                        //onToolBoxTalkStatusChange(detailItem.ID, strDate);
                                                        setToday(strDate);
                                                    }
                                                }}
                                            /> */}
                                        </td>
                                    </tr>
                                    <tr>
                                        {isVisibleCrud.current ?
                                            <td className="td-toolbox-talk"><b>Job Site: <span className="required">*</span></b></td>
                                            :
                                            <td className="td-toolbox-talk"><b>Job Site:</b></td>
                                        }
                                        {isVisibleCrud.current ?
                                            <td className="td-toolbox-talk">
                                                <SiteFilter
                                                    isPermissionFiter={true}
                                                    loginUserRoleDetails={props.loginUserRoleDetails}
                                                    selectedSite={selectedSite}
                                                    onSiteChange={onSiteChange}
                                                    provider={props.provider}
                                                    isRequired={true}
                                                    AllOption={false} />
                                            </td> :
                                            <td className="td-toolbox-talk">{(props?.breadCrumItems[0]?.text === "Add Form" || props?.breadCrumItems[0]?.text === "ViewSite") ? props?.breadCrumItems[1]?.text : props?.breadCrumItems[0]?.text}</td>
                                        }
                                    </tr>
                                    <tr>
                                        <td className="td-toolbox-talk"><b>WHS Committee Chairperson: <span className="required"> *</span></b></td>
                                        <td className="td-toolbox-talk">
                                            <WHSUsersFilter
                                                selectedWHSUsers={selectedWHSUsersArray}
                                                selectedWHSUsersId={selectedAttendees}
                                                onWHSUsersChange={onWHSUsersChange}
                                                provider={props.provider}
                                                isRequired={true}
                                                StateId={props.siteMasterId}
                                                AllOption={true}
                                            />
                                        </td>
                                    </tr>
                                    {/* {props.isForm === true && selectedSite === "" ?
                                        <tr></tr> :
                                        <tr>{IsUpdate ?
                                            <td className="td-toolbox-talk"><b>Safety Audit Chairperson:</b></td> :
                                            <td className="td-toolbox-talk"><b>Safety Audit Chairperson: <span className="required"> *</span></b> </td>}
                                            {ManagerOptions ?
                                                <td className="td-toolbox-talk">
                                                    <ReactDropdown
                                                        options={ManagerOptions} isMultiSelect={false}
                                                        defaultOption={defaultManager || selectedManager}
                                                        onChange={_onManagerChange}
                                                        placeholder={"Select Chairperson"} />
                                                </td> : <td className="td-toolbox-talk"> {ToolboxTalk?.Chairperson}</td>
                                                // </td> : <td className="td-toolbox-talk"> {SiteData[0]?.SiteManagerName?.join(', ')}</td>
                                            }
                                        </tr>
                                    } */}

                                    <tr>
                                        {IsUpdate ?
                                            <td className="td-toolbox-talk"><b>WHS Committee Location:</b></td> :
                                            <td className="td-toolbox-talk"><b>WHS Committee Location:<span className="required"> *</span></b></td>}

                                        <td className="td-toolbox-talk">
                                            {/* <TextField className="formControl"
                                            name='MeetingLocation'
                                            placeholder="Enter WHS Committee Location"
                                            value={MeetingLocation}
                                            onChange={onChangeMeetingLocation} /> */}
                                            <IMSLocationCommonFilter
                                                onIMSLocationChange={onIMSLocationChange}
                                                provider={props.provider}
                                                selectedIMSLocation={MeetingLocation}
                                                defaultOption={!!MeetingLocation ? MeetingLocation : ""}
                                                siteNameId={props.originalSiteMasterId ? props.originalSiteMasterId : selectedSite}
                                                Title="WHS Committee Location"
                                                Label="WHS Committee Location"
                                                placeHolder="Select WHS Committee Location"
                                                IsUpdate={IsUpdate}
                                            />
                                        </td>
                                    </tr>
                                    <tr>
                                        {IsUpdate ?
                                            <td className="td-toolbox-talk"><b>Taken and recorded by:</b></td> :
                                            <td className="td-toolbox-talk"><b>Taken and recorded by: <span className="required"> *</span></b></td>}
                                        <td className="td-toolbox-talk"><TextField className="formControl" name='Minutestakenandrecordedby' placeholder="Enter Audit taken and recorded by" value={Minutestakenandrecordedby} onChange={onChangeMinutestakenandrecordedby} /></td>
                                    </tr>
                                </table>

                                <div className="mt-4">
                                    {SSAMasterTitle.map(title => {
                                        const matchedMasters = SSAMaster.filter(master => master.Title === title);
                                        if (matchedMasters.length === 0) return null; // Skip if no matching masters

                                        // Get all checklist items for this title
                                        const allChecklistItems = ComplianceSectionsChecklist.filter(item =>
                                            ComplianceSections.some(section =>
                                                matchedMasters.some(master => section.SiteSafetyAuditMasterId === master.ID && section.ID === item.ComplianceSectionsId)
                                            )
                                        );

                                        const totalQuestions = allChecklistItems.length;
                                        const totalYesNA = allChecklistItems.filter(item => selectedStatus[item.ID] === "Yes" || selectedStatus[item.ID] === "N/A").length;

                                        // Calculate total weightage for Yes/N.A items
                                        const totalWeightageYesNA = allChecklistItems
                                            .filter(item => selectedStatus[item.ID] === "Yes" || selectedStatus[item.ID] === "N/A")
                                            .reduce((sum, item) => sum + (item.Weightage || 0), 0); // Assuming `Weightage` field exists

                                        const totalWeightageAll = allChecklistItems.reduce((sum, item) => sum + (item.Weightage || 0), 0);
                                        const weightagePercentage = totalWeightageAll > 0 ? ((totalWeightageYesNA / totalWeightageAll) * 100).toFixed(2) : "0.00";

                                        return (
                                            <div key={title} className="at-border" style={{ padding: '0px', marginBottom: '5px' }}>
                                                <table className="audit-table audit-mb5">
                                                    <thead>
                                                        <tr className="mt-1">
                                                            <th colSpan={2} className="audit-header">{title}</th>
                                                            <th className="audit-score dflex">
                                                                <div className="dflex mla">
                                                                    {/* Display Total Yes/N.A, Total Questions, Weightage Sum and Percentage */}
                                                                    <span className="audit-mt6 mt-2">{totalYesNA}/{totalQuestions} | {totalWeightageYesNA.toFixed(2)} ({weightagePercentage}%)</span>
                                                                    <span className="ml5">
                                                                        <Toggle className="mla mt-2"
                                                                            checked={visibility[title] ?? false}
                                                                            onChange={(e, checked) => handleToggle(title, checked!)}
                                                                        />
                                                                    </span>
                                                                </div>
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                </table>

                                                {visibility[title] && (
                                                    <>
                                                        {matchedMasters.map(master => {
                                                            const masterChecklistItems = ComplianceSectionsChecklist.filter(item =>
                                                                ComplianceSections.some(section => section.SiteSafetyAuditMasterId === master.ID && section.ID === item.ComplianceSectionsId)
                                                            );

                                                            const masterTotalQuestions = masterChecklistItems.length;
                                                            const masterTotalYesNA = masterChecklistItems.filter(item => selectedStatus[item.ID] === "Yes" || selectedStatus[item.ID] === "N/A").length;

                                                            const masterTotalWeightageYesNA = masterChecklistItems
                                                                .filter(item => selectedStatus[item.ID] === "Yes" || selectedStatus[item.ID] === "N/A")
                                                                .reduce((sum, item) => sum + (item.Weightage || 0), 0);

                                                            const masterTotalWeightageAll = masterChecklistItems.reduce((sum, item) => sum + (item.Weightage || 0), 0);
                                                            const masterWeightagePercentage = masterTotalWeightageAll > 0 ? ((masterTotalWeightageYesNA / masterTotalWeightageAll) * 100).toFixed(2) : "0.00";

                                                            return (
                                                                <div key={master.ID} className="at-p-10">
                                                                    <table className="audit-table audit-mb2" style={{ padding: '0px', marginTop: '3px' }}>
                                                                        <thead>
                                                                            <tr>
                                                                                <th colSpan={2} className="audit-subheader at-bor-left">{master.Name}</th>
                                                                                <th className="audit-subscore at-bor-right dflex">
                                                                                    <div className="dflex mla">
                                                                                        {/* Display per master */}
                                                                                        <span className="audit-mt6">{masterTotalYesNA}/{masterTotalQuestions} | {masterTotalWeightageYesNA.toFixed(2)} ({masterWeightagePercentage}%)</span>
                                                                                        <span className="ml5">
                                                                                            <Dropdown
                                                                                                placeholder="Status"
                                                                                                options={dropdownOptions}
                                                                                                onChange={(e, option) => {
                                                                                                    masterChecklistItems.forEach(item => handleDropdownChange(item.ID, option));
                                                                                                }}
                                                                                            />
                                                                                        </span>
                                                                                    </div>
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                    </table>

                                                                    {ComplianceSections.filter(section => section.SiteSafetyAuditMasterId === master.ID).map(section => {
                                                                        const checklistItems = ComplianceSectionsChecklist.filter(checklist => checklist.ComplianceSectionsId === section.ID);
                                                                        const totalQuestions = checklistItems.length;
                                                                        const totalYesNA = checklistItems.filter(item => selectedStatus[item.ID] === "Yes" || selectedStatus[item.ID] === "N/A").length;

                                                                        return totalQuestions > 0 ? (
                                                                            <Accordion title={`${section.Title} (${totalYesNA}/${totalQuestions})`} defaultCollapsed={false} className={"itemCell jAccordion"} key={section.ID} collapsedIcon={"ChevronUp"} expandedIcon={"ChevronDown"}>

                                                                                {checklistItems.map(item => (
                                                                                    <div className="card mb-2 accordion_mar">
                                                                                        <div className="cardBody">
                                                                                            <div key={item.ID} className="audit-question" style={{ padding: '5px 0' }}>
                                                                                                <div className="mb-1">{item.Title}</div>
                                                                                                <div className="button-group">
                                                                                                    {["Yes", "No", "N/A"].map((status) => {
                                                                                                        const className = status === "N/A" ? "n-a" : status.toLowerCase();
                                                                                                        return (
                                                                                                            <button
                                                                                                                key={status}
                                                                                                                className={`status-button ${selectedStatus[item.ID] === status ? className : ""}`}
                                                                                                                onClick={() => handleDropdownChange(item.ID, { key: status, text: status })}
                                                                                                                style={{ flex: 1 }}
                                                                                                            >
                                                                                                                {status}
                                                                                                            </button>
                                                                                                        );
                                                                                                    })}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ))}

                                                                            </Accordion>
                                                                        ) : null;
                                                                    })}

                                                                </div>
                                                            );
                                                        })}
                                                        <div className="AT-Add-Attachment-P">
                                                            <div>
                                                                <ul>
                                                                    {!!attachments && attachments.length > 0 && attachments
                                                                        .filter((filePath: string) => {
                                                                            const fileName = filePath.split('/').pop()?.toLowerCase() || "";
                                                                            return fileName.includes(title.toLowerCase());
                                                                        })
                                                                        .map((filePath: string, index: number) => {
                                                                            const fileName = filePath.split('/').pop();
                                                                            return (
                                                                                <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
                                                                                    <span>{fileName}</span>
                                                                                    <FontAwesomeIcon
                                                                                        icon="trash-alt"
                                                                                        style={{ marginLeft: '10px' }}
                                                                                        className="ml5 dlticonDoc tooltipcls required"
                                                                                        onClick={() => onDeleteFile(fileName)}
                                                                                    />
                                                                                </li>
                                                                            );
                                                                        })}
                                                                </ul>

                                                            </div>
                                                            <TextField type="file"
                                                                onChange={(event) => fileSelectionChange(event, title)}
                                                                name={`Files_${title}`}
                                                                className='FileUpload mt-1'
                                                                multiple
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {/* <div className="ms-Grid-row ">
                                    <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg6 ">
                                        <div className='sign-add'>
                                            <SignatureComponent label={'Sort Signature'} defaultSignature={!!signatureURL ? signatureURL : ""} isDisplayNameEmail={false} email={'ashish.s.prajapati@treta.onmicrosoft.com'} name="Ashish Prajapati 4/9/2024 15:12 PM" getDataUrl={getDataUrl}></SignatureComponent>
                                        </div>
                                    </div>
                                    <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg6 ">
                                        <div className='sign-add-2'>
                                            <SignatureComponent label={'Signature'} defaultSignature={!!signatureURLFull ? signatureURLFull : ""} isDisplayNameEmail={false} email={'ashish.s.prajapati@treta.onmicrosoft.com'} name="Ashish Prajapati 4/9/2024 15:12 PM" getDataUrl={getDataUrlFull}></SignatureComponent>
                                        </div>
                                    </div>
                                </div> */}

                                <div className="asset-card-2-header-jcc-2 mar-bot-40">
                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 toolkit-btn">

                                        {FormStatus !== "submit" &&
                                            <PrimaryButton
                                                style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                                className="btn btn-primary"
                                                text="Save as Draft"
                                                onClick={() => onClickSaveOrUpdate('draft')}
                                            />
                                        }

                                        {props?.componentProps?.siteMasterId === undefined && (FormStatus === "draft" || FormStatus === "") ?
                                            <PrimaryButton
                                                style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                                className="btn btn-primary"
                                                text={(FormStatus === "draft" || FormStatus === "") ? 'Save and Send' : 'Update'}
                                                onClick={() => {
                                                    if (ToolboxTalk == null || ToolboxTalk?.FormStatus !== "submit") {
                                                        onClickSaveOrUpdate('submit');
                                                    } else {
                                                        //onClickYes();
                                                        showPopup();
                                                    }
                                                }}
                                            /> :
                                            <>
                                                {FormStatus === "draft" ? <PrimaryButton
                                                    style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                                    className="btn btn-primary"
                                                    text="Save and Send"
                                                    onClick={() => {
                                                        if (ToolboxTalk == null || ToolboxTalk?.FormStatus !== "submit") {
                                                            onClickSaveOrUpdate('submit')
                                                        } else {
                                                            //onClickYes();
                                                            showPopup();
                                                        }
                                                    }}
                                                />
                                                    :
                                                    <PrimaryButton
                                                        style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                                                        className="btn btn-primary"
                                                        text={'Update'}
                                                        onClick={() => {
                                                            if (ToolboxTalk == null || ToolboxTalk?.FormStatus !== "submit") {
                                                                onClickSaveOrUpdate('submit');
                                                            } else {
                                                                //onClickYes();
                                                                showPopup();
                                                            }
                                                        }}
                                                    />}
                                            </>
                                        }

                                        <PrimaryButton
                                            style={{ marginBottom: "5px", marginTop: "10px" }}
                                            className="btn btn-danger"
                                            text="Cancel"
                                            onClick={() => onClickCancel()}
                                        />

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div >
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
                                        {ErrorData.map((error, index) => (
                                            <li key={index} className="val-m">
                                                <FontAwesomeIcon icon="circle" className="val-icon" /> {error.props.children}
                                            </li>
                                        ))}
                                    </ul></div>
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