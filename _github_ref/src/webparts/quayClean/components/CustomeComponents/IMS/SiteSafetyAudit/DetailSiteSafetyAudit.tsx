/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { DefaultButton, DialogFooter, FocusTrapZone, IDropdownOption, Layer, mergeStyleSets, Overlay, Popup, PrimaryButton } from "@fluentui/react";
import * as React from "react";
import { useBoolean } from "@fluentui/react-hooks";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { _getIMSTemplateDetail, generateAndSaveKendoPDF, removeElementOfBreadCrum, UserActivityLog } from "../../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../../Interfaces/IAddNewHelpDesk";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Loader } from "../../../CommonComponents/Loader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SuccessComponent from "../../../CommonComponents/SuccessComponent";
import SiteSafetyAuditAttachment from "../../../CommonComponents/SiteSafetyAuditAttachment";
import { Accordion } from "@pnp/spfx-controls-react";
import CommonPopup from "../../../CommonComponents/CommonSendEmailPopup";
import { IFileWithBlob } from "../../../../../../DataProvider/Interface/IFileWithBlob";
import { toastService } from "../../../../../../Common/ToastService";
import moment from "moment";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { DateTimeFormate } from "../../../../../../Common/Constants/CommonConstants";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
const imgLogo = require('../../../../assets/images/logo.png');
const notFoundImage = require('../../../../../quayClean/assets/images/NotFoundImg.png');
const dropdownOptions = [
    { key: 'Yes', text: 'Yes' },
    { key: 'No', text: 'No' },
    { key: 'N/A', text: 'N/A' }
];


export const DetailSiteSafetyAudit: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const [value, setValue] = React.useState(props.initialValue);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const { currentUserRoleDetail } = appGlobalState;
    const isCall = React.useRef<boolean>(true);
    const siteName = React.useRef<any>("");
    const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
    const [SiteData, setSiteData] = React.useState<any[]>([]);
    const [SSAMaster, setSSAMaster] = React.useState<any[]>([]);
    const [SSAMasterTitle, setSSAMasterTitle] = React.useState<any[]>([]);
    const [ComplianceSections, setComplianceSections] = React.useState<any[]>([]);
    const [ComplianceSectionsChecklist, setComplianceSectionsChecklist] = React.useState<any[]>([]);
    const [AllSignatureData, seAllSignatureData] = React.useState<any>();
    const [selectedStatus, setSelectedStatus] = React.useState<{ [key: string]: string }>({});
    const [visibility, setVisibility] = React.useState<{ [key: string]: boolean }>({});
    const [selectedWHSUsersArray, setSelectedWHSUsersArray] = React.useState<any[]>([]);
    const [selectedAttendees, setSelectedAttendees] = React.useState<any[]>([]);
    const [AllMasterData, setAllMasterData] = React.useState<any[]>([]);
    const [AllDetailData, setAllDetailData] = React.useState<any[]>([]);
    const [CreatedDate, setCreatedDate] = React.useState<Date>();
    const [ToolboxTalkData, setToolboxTalkData] = React.useState<any[]>([]);
    const [StateName, setStateName] = React.useState<string>();
    const [StateId, setStateId] = React.useState<string>(props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);
    const [MeetingLocation, setMeetingLocation] = React.useState<string>("");
    const [Minutestakenandrecordedby, setMinutestakenandrecordedby] = React.useState<string>("");
    const [GeneratedID, setGeneratedID] = React.useState<string>("");
    const [WHSMeetingDate, setWHSMeetingDate] = React.useState<string>("");
    const [UpdateItemId, setUpdateItemId] = React.useState<any>();
    const [IsUpdate, setIsUpdate] = React.useState<boolean>(false);
    const [attachments, setAttachments] = React.useState<any>();
    const [isComponentClosed, setIsComponentClosed] = React.useState(false);
    const [defaultManager, setDefaultManager] = React.useState<any>(props?.loginUserRoleDetails?.Id);
    const [ManagerOptions, setManagerOptions] = React.useState<IDropdownOption[]>();
    const [isPopupVisible2, { setTrue: showPopup2, setFalse: hidePopup2 }] = useBoolean(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [ErrorData, setErrorData] = React.useState<any[]>([]);
    const [width, setWidth] = React.useState<string>("400px");
    const [signatureURL, setSignatureURL] = React.useState<string | null>(null);
    const [signatureURLFull, setSignatureURLFull] = React.useState<string | null>(null);
    const [title, setTitle] = React.useState<string>("");
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
    const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
    const [displayerror, setDisplayError] = React.useState<boolean>(false);

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

    const [base64Logo, setBase64Logo] = React.useState<string | null>(null);
    const [isImageLoaded, setIsImageLoaded] = React.useState(false);

    // Convert Image to Base64 for Better PDF Rendering
    const toBase64 = async (url: string) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    };


    const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setTitle(newValue || "");
        if (newValue) {
            setDisplayErrorTitle(false);
        }
    };

    const onChangeSendToEmail = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setSendToEmail(newValue || "");
        if (newValue) {
            setDisplayErrorEmail(false);
            setDisplayErrorEmail(false);
        }
        const enteredValue = newValue;
        const emailPattern = /^([^\s@]+@[^\s@]+\.[^\s@]+)(\s*;\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/;
        if (!enteredValue || emailPattern.test(enteredValue)) {
            setDisplayError(false);
        } else {
            setDisplayError(true);
        }
    };

    const onclickSendEmail = () => {
        showPopup();
    };
    const onClickCancelEmail = (): void => {
        resetForm();
        hidePopup();
    };

    const resetForm = (): void => {
        setTitle("");
        setSendToEmail("");
        setDisplayErrorTitle(false);
        setDisplayErrorEmail(false);
        setDisplayError(false);
    };

    const onClickSendEmail = async (): Promise<void> => {
        setIsLoading(true);
        const isTitleEmpty = !title;
        const isEmailEmpty = !sendToEmail;
        const isEmailInvalid = !isEmailEmpty && !sendToEmail?.split(';').every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));

        setDisplayErrorTitle(isTitleEmpty);
        setDisplayErrorEmail(isEmailEmpty);
        setDisplayError(isEmailInvalid);

        if (!isTitleEmpty && !isEmailEmpty && !isEmailInvalid) {
            let fileName: string = (props.componentProps.siteName || siteName.current) + '-WHS Committee Checklist' + "-" + (!!WHSMeetingDate ? WHSMeetingDate : "");
            let fileblob: any = await generateAndSaveKendoPDF("DetailSiteSafetyAuditPDFCode", fileName, false);
            const file: IFileWithBlob = {
                file: fileblob,
                name: `${fileName}`,
                overwrite: true
            };
            let toastMessage: string = "";
            const toastId = toastService.loading('Loading...');
            toastMessage = 'Email sent successfully!';
            let insertData: any = {
                Title: title,
                SendToEmail: sendToEmail,
                StateName: StateName,
                SiteName: props.componentProps.siteName || siteName.current,
                EmailType: "SiteSafetyAudit"
            };
            props.provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                props.provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: props?.componentProps?.originalSiteMasterId || props?.componentProps?.UpdateItem?.SiteNameId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.SendEmail,
                        EntityType: UserActionEntityTypeEnum.WHSCommitteeInspection,
                        // EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        LogFor: UserActionLogFor.Both,
                        EntityName: title, // Match index dynamically
                        Details: `Send Email WHS Committee Inspection to ${sendToEmail}`,
                        StateId: props?.componentProps?.qCStateId
                    };
                    void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
                }).catch((err: any) => console.log(err));
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                // onClickCancel();
                resetForm();
                hidePopup();
                setIsLoading(false);
            }).catch((err: any) => console.log(err));
        } else {
            setIsLoading(false);
        }
    };
    // Load Image as Base64
    React.useEffect(() => {
        toBase64(imgLogo).then(base64Img => {
            setBase64Logo(base64Img);
            setIsImageLoaded(true);
        });
    }, [imgLogo]);

    const [masterStateId, setMasterStateId] = React.useState(SiteData[0]?.StateId || props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);

    React.useEffect(() => {
        setMasterStateId(SiteData[0]?.StateId || props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);
    }, [SiteData[0]?.StateId, StateId]);


    const [state, SetState] = React.useState<IHelpDeskFormState>({
        CallerOptions: [],
        CategoryOptions: [],
        EventOptions: [],
        isdisableField: !!isAddNewHelpDesk ? false : true,
        isAddNewHelpDesk: !!isAddNewHelpDesk,
        isformValidationModelOpen: false,
        validationMessage: null
    });

    const initialToggles = ToolboxTalkData.reduce((acc, item) => {
        acc[item.ID] = false;
        return acc;
    }, {});

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
    // const onClickCancel = (): void => {
    //     if (props.isForm) {
    //         window.open('');
    //     } else {
    //         const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
    //         if (!props?.originalSiteMasterId) {
    //             // props.manageComponentView({
    //             //     currentComponentName: ComponentNameEnum.WHSCommitteeInspection, qCStateId: props?.componentProps?.qCStateId, originalState: StateName, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "SiteSafetyAudit",
    //             // });

    //             const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
    //             props.manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, breadCrumItems: breadCrumItems, view: props.componentProps.viewType, subpivotName: "SiteSafetyAudit", });

    //         } else {
    //             props.manageComponentView({
    //                 currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.qCStateId, originalState: StateName, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "SiteSafetyAudit",
    //             });
    //         }

    //     }
    // };


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

    const SignatureData = (WHSUsers: any) => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,Signature,SiteSafetyAuditId,SiteSafetyAudit/Title,WHSUsersId,WHSUsers/UserName,Created"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteSafetyAudit,WHSUsers"],
                filter: `SiteSafetyAuditId eq '${props?.componentProps?.siteMasterId}'`,
                listName: ListNames.SiteSafetyAuditSignature,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const SignatureListData = WHSUsers.map((user: any) => {
                        // Find matching record in results
                        const matchedData = results.find((data) => data.WHSUsers?.UserName === user);
                        if (matchedData) {
                            return {
                                ID: matchedData.ID,
                                Title: matchedData.Title,
                                Signature: matchedData.Signature || '',
                                Created: matchedData.Created ? moment(matchedData.Created).format(DateTimeFormate) : '',
                                WHSUsersId: matchedData.WHSUsersId || 0,
                                WHSUsers: matchedData.WHSUsers?.UserName || '',
                            };
                        } else {
                            return {
                                ID: '',
                                Title: '',
                                Signature: '',
                                Created: '',
                                WHSUsersId: 0,
                                WHSUsers: user, // Use the missing user's name
                            };
                        }
                    });

                    seAllSignatureData(SignatureListData);
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

    React.useEffect(() => {
        if (props?.componentProps?.originalState) {
            setStateName(props.componentProps.originalState);
        }
        if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
            setUpdateItemId(props?.componentProps?.siteMasterId);
            setIsUpdate(true);
            let updatedata = props?.componentProps?.UpdateItem;
            setGeneratedID(updatedata.MeetingID);
            setWHSMeetingDate(updatedata?.MeetingDate)
            // setSelectedManager(updatedata.Chairperson[0]);
            // setDefaultManager(updatedata.ChairpersonID[0]);
            siteName.current = updatedata.SiteName;
            setMinutestakenandrecordedby(updatedata.MinutesTakenAndRecordedBy);
            setMeetingLocation(updatedata.Location);
            setSelectedAttendees(updatedata.WHSUsersId);
            setSelectedWHSUsersArray(updatedata.WHSUsers);
            setAttachments(updatedata.Attachment)
            setSignatureURLFull(updatedata.Signature);
            setSignatureURL(updatedata.ShortSignature);
            setCreatedDate(updatedata.Created)
            _SiteSafetuAuditMasterData();
            MasterData();
            DetailsData();
            SignatureData(updatedata.WHSUsers);
        }
    }, []);

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

    if (isComponentClosed) {
        return <SuccessComponent />;
    }

    const onClickDownload = async (): Promise<void> => {
        setIsLoading(true);
        let fileName: string = (props.componentProps.siteName || siteName.current) + '-WHS Committee Checklist' + "-" + (!!WHSMeetingDate ? WHSMeetingDate : "");
        let fileblob: any = await generateAndSaveKendoPDF("DetailSiteSafetyAuditPDFCode", fileName, false, true);
        setIsLoading(false);
    };

    const handleDropdownChange = (id: number, option: IDropdownOption | undefined) => {
        setSelectedStatus(prev => ({ ...prev, [id]: option?.key as string }));
    };

    const handleToggle = (id: number, checked: boolean) => {
        setVisibility(prev => ({ ...prev, [id]: checked }));
    };

    const [overallStats, setOverallStats] = React.useState({
        totalQuestions: 0,
        totalYesOrNAResponses: 0,
        totalWeightageAll: 0,
        totalWeightageYesOrNA: 0,
        overallPercentage: "0.00",
        totalWeightageForYesAndNA: 0,
        totalNoResponse: 0 // New state for sum of weightage where status = "Yes" or "N/A"
    });

    // Compute the overall statistics
    React.useEffect(() => {
        let totalQuestions = 0;
        let totalYesOrNAResponses = 0;
        let totalWeightageAll = 0;
        let totalWeightageYesOrNA = 0;
        let totalWeightageForYesAndNA = 0; // New variable
        let totalNoResponse = 0;

        SSAMasterTitle.forEach(title => {
            const matchedMasters = SSAMaster.filter(master => master.Title === title);
            if (matchedMasters.length === 0 || !visibility[title]) return;

            matchedMasters.forEach(master => {
                const allChecklistItems = ComplianceSections
                    .filter(section => section.SiteSafetyAuditMasterId === master.ID)
                    .flatMap(section =>
                        ComplianceSectionsChecklist.filter(checklist => checklist.ComplianceSectionsId === section.ID)
                    );

                totalQuestions += allChecklistItems.length;
                totalYesOrNAResponses += allChecklistItems.filter(item =>
                    selectedStatus[item.ID] === "Yes" || selectedStatus[item.ID] === "N/A"
                ).length;
                totalWeightageAll += allChecklistItems.reduce((sum, item) => sum + (item.Weightage || 0), 0);
                totalWeightageYesOrNA += allChecklistItems
                    .filter(item => selectedStatus[item.ID] === "Yes" || selectedStatus[item.ID] === "N/A")
                    .reduce((sum, item) => sum + (item.Weightage || 0), 0);

                // Store sum of weightage for Yes/N.A separately
                totalWeightageForYesAndNA += allChecklistItems
                    .filter(item => selectedStatus[item.ID] === "Yes" || selectedStatus[item.ID] === "N/A")
                    .reduce((sum, item) => sum + (item.Weightage || 0), 0);
            });
        });

        const overallPercentage = totalWeightageAll > 0
            ? ((totalYesOrNAResponses / totalQuestions) * 100).toFixed(2)
            : "0.00";
        totalNoResponse = totalQuestions - totalYesOrNAResponses;
        setOverallStats({
            totalQuestions,
            totalYesOrNAResponses,
            totalWeightageAll,
            totalWeightageYesOrNA,
            overallPercentage,
            totalWeightageForYesAndNA,
            totalNoResponse // Update new state
        });
    }, [SSAMasterTitle, SSAMaster, ComplianceSections, ComplianceSectionsChecklist, selectedStatus, visibility]);

    const getState = (siteNameId: any) => {
        try {
            let queryOptions: IPnPQueryOptions = {
                listName: ListNames.SitesMaster,
                select: ["Id", "QCStateId"],
                filter: `Id eq ${siteNameId}`
            };
            return props.provider.getItemsByQuery(queryOptions);
        } catch (error) {
            console.log(error);
            setIsLoading(false);
        }
        return [];
    };

    const _userActivityLog = async () => {
        try {
            let orgSiteId = props?.componentProps?.originalSiteMasterId || props?.componentProps?.UpdateItem?.SiteNameId;
            let data = await getState(orgSiteId);
            if (props?.componentProps?.qCStateId || data[0]?.QCStateId) {
                const todayDate = moment().format("YYYY-MM-DD");
                const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    listName: ListNames.UserActivityLog,
                    filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityId eq '${props?.siteMasterId}' and SiteNameId eq '${orgSiteId}' and EntityType eq '${UserActionEntityTypeEnum.WHSCommitteeInspection}' and ActionType eq 'Details View' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
                };
                const results = await props.provider.getItemsByQuery(queryStringOptions);
                if (results && results.length > 0) {
                    const listData = results.map((data) => ({
                        ID: data.ID,
                        Count: data.Count ?? '',
                    }));
                    let updateObj = {
                        Count: listData[0]?.Count + 1,
                    };
                    await props.provider.updateItemWithPnP(updateObj, ListNames.UserActivityLog, Number(listData[0]?.ID));
                } else {
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: orgSiteId,
                        ActionType: UserActivityActionTypeEnum.DetailsView,
                        Email: currentUserRoleDetail?.emailId,
                        EntityType: UserActionEntityTypeEnum.WHSCommitteeInspection,
                        EntityId: props?.siteMasterId,
                        LogFor: UserActionLogFor.Both,
                        EntityName: props?.componentProps?.UpdateItem?.MeetingID,
                        Count: 1,
                        Details: "Details View",
                        StateId: props?.componentProps?.qCStateId || data[0]?.QCStateId
                    };
                    void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
                }
                isCall.current = false;
            }
        } catch (error) {
            console.error("Error fetching user activity log:", error);
        } finally {
            // setIsLoading(false);
        }
    };
    React.useEffect(() => {
        if (!!props?.componentProps?.UpdateItem && props?.componentProps?.UpdateItem?.MeetingID !== undefined && isCall.current == true) {
            isCall.current = false;
            _userActivityLog();
        }
    }, []);

    return <>
        {isLoading && <Loader />}
        {state.isformValidationModelOpen &&
            <CustomModal
                isModalOpenProps={state.isformValidationModelOpen} setModalpopUpFalse={() => {
                    SetState((prevState: any) => ({ ...prevState, isformValidationModelOpen: false }));
                }} subject={"Missing data"}
                message={state.validationMessage} closeButtonText={"Close"} />}
        <div className="whsInspection-Detail">
            <div className="mt-10">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div id="ToolboxTalk" className="asset-card-2-header-jcc-2 margin-bot-80">
                            <div className="formGroup btnSticky">
                                <div className="va-b inlineBlock">
                                    <PrimaryButton
                                        className="btn btn-danger send-email-btn"
                                        text="Close"
                                        onClick={onClickCancel}
                                    />
                                </div>
                                <div className="va-b inlineBlock">
                                    <CommonPopup
                                        isPopupVisible={isPopupVisible}
                                        hidePopup={hidePopup}
                                        title={title}
                                        sendToEmail={sendToEmail}
                                        onChangeTitle={onChangeTitle}
                                        onChangeSendToEmail={onChangeSendToEmail}
                                        displayerrortitle={displayerrortitle}
                                        displayerroremail={displayerroremail}
                                        displayerror={displayerror}
                                        onClickSendEmail={onClickSendEmail}
                                        onClickCancel={onClickCancelEmail}
                                        onclickSendEmail={onclickSendEmail}
                                    />
                                </div>
                                <div className="va-b inlineBlock">
                                    <PrimaryButton className="btn btn-primary send-email-btn-toolbox-talk" onClick={onClickDownload}>
                                        <FontAwesomeIcon icon="download" className="clsbtnat" /><div>PDF</div>
                                    </PrimaryButton>
                                </div>
                            </div>


                            <div className="" id="DetailSiteSafetyAuditPDFCode">
                                <div className="boxCard bg-white bg-padding">
                                    <table id="DetailSiteSafetyAuditPDFCode" className="table-toolbox-talk cell-space-0" style={{ width: "100%", border: "1px solid black" }} >
                                        <tr>
                                            <th className="th-toolbox-talk-logo pl-10 bg-white br-1">
                                                {isImageLoaded ? (
                                                    <img src={base64Logo || imgLogo} height="30px" className="course-img-first img-mt" />
                                                ) : (
                                                    <div>Loading...</div> // Placeholder while image loads
                                                )}
                                            </th>
                                            <td className="td-toolbox-talk middle-box">
                                                <div>WHS Committee Inspection Checklist</div>
                                            </td>
                                            <td className="td-toolbox-talk blue-box pl-10">
                                                <div>Document No</div>
                                                <div>QC-CP-13-F1</div>
                                            </td>
                                        </tr>
                                    </table>
                                    <div className="meeting-id-cls"><div className="td-toolbox-talk blue-text dflex"><div className="toggle-class">WHS Committee Id: {GeneratedID}</div></div></div>
                                    <div className="autableContainer">
                                        <div className="autableHeader">
                                            <div className="autableHeaderItem">Score</div>
                                            <div className="autableHeaderItem">Flagged items</div>
                                            <div className="autableHeaderItem">Actions</div>
                                        </div>
                                        <div className="autableRow">
                                            <div className="autableCell">
                                                {overallStats.totalYesOrNAResponses} / {overallStats.totalQuestions} ({overallStats.overallPercentage}%)
                                            </div>
                                            <div className="autableCell">{overallStats.totalNoResponse}</div>
                                            <div className="autableCell">-</div>
                                        </div>
                                    </div>
                                    <div className="autableDetailContainer">
                                        <div className="detailsContainer2">
                                            <div className="detailsRow">
                                                <div className="detailsLabel">WHS Committee Id</div>
                                                <div className="detailsValue au-t-text-right">{GeneratedID}</div>
                                            </div>

                                            <div className="detailsRow">
                                                <div className="detailsLabel">Job Site</div>
                                                <div className="detailsValue au-t-text-right">{props?.componentProps?.siteName || siteName.current}</div>
                                            </div>

                                            <div className="detailsRow">
                                                <div className="detailsLabel">WHS Committee Chairperson</div>
                                                <div className="detailsValue au-t-text-right">{selectedWHSUsersArray}</div>
                                            </div>

                                            <div className="detailsRow">
                                                <div className="detailsLabel">Taken and recorded by</div>
                                                <div className="detailsValue au-t-text-right">{Minutestakenandrecordedby}</div>
                                            </div>

                                            <div className="detailsRow">
                                                <div className="detailsLabel">WHS Committee Location</div>
                                                <div className="detailsValue au-t-text-right">
                                                    {MeetingLocation}
                                                    <br />
                                                    {/* <span className="coordinates">(-33.89408260043816, 151.2242161712208)</span> */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className="overall-stats">
                                    <h3>Overall Audit Summary</h3>
                                    <p><strong>Total Questions:</strong> {overallStats.totalQuestions}</p>
                                    <p><strong>Yes / N/A Responses:</strong> {overallStats.totalYesOrNAResponses}</p>
                                    <p><strong>Total Weightage (All):</strong> {overallStats.totalWeightageAll.toFixed(2)}</p>
                                    <p><strong>Total Weightage (Yes / N/A):</strong> {overallStats.totalWeightageForYesAndNA.toFixed(2)}</p>
                                    <p><strong>Overall Percentage:</strong> {overallStats.overallPercentage}%</p>
                                </div> */}

                                    <div className="mt-4">
                                        {SSAMasterTitle.map(title => {
                                            const matchedMasters = SSAMaster.filter(master => master.Title === title);
                                            if (matchedMasters.length === 0 || !visibility[title]) return null; // Skip if no matching masters or visibility is false
                                            // Get all checklist items for all matched masters
                                            const allChecklistItems = matchedMasters.flatMap(master =>
                                                ComplianceSections
                                                    .filter(section => section.SiteSafetyAuditMasterId === master.ID)
                                                    .flatMap(section =>
                                                        ComplianceSectionsChecklist.filter(checklist => checklist.ComplianceSectionsId === section.ID)
                                                    )
                                            );
                                            // Count total audit questions
                                            const totalQuestions = allChecklistItems.length;
                                            // Count responses with "Yes" or "N/A"
                                            const totalYesOrNAResponses = allChecklistItems.filter(item =>
                                                selectedStatus[item.ID] === "Yes" || selectedStatus[item.ID] === "N/A"
                                            ).length;
                                            // Calculate total weightage for all checklist items
                                            const totalWeightageAll = allChecklistItems.reduce((sum, item) => sum + (item.Weightage || 0), 0);
                                            // Calculate total weightage for "Yes" or "N/A" responses
                                            const totalWeightageYesOrNA = allChecklistItems
                                                .filter(item => selectedStatus[item.ID] === "Yes" || selectedStatus[item.ID] === "N/A")
                                                .reduce((sum, item) => sum + (item.Weightage || 0), 0);
                                            // Calculate percentage based on weightage
                                            const percentage = totalWeightageAll > 0
                                                ? ((totalWeightageYesOrNA / totalWeightageAll) * 100).toFixed(2)
                                                : "0.00";
                                            const newpercentage = totalWeightageAll > 0
                                                ? ((totalYesOrNAResponses / totalQuestions) * 100).toFixed(2)
                                                : "0.00";
                                            return (
                                                <div key={title} className="at-border" style={{ padding: '0px', marginBottom: '5px' }}>
                                                    {/* Only show this table if visibility[title] is true */}
                                                    {visibility[title] && (
                                                        <>
                                                            <div className="at-tbl auditContainer audit-mb5">
                                                                <div className="at-tbl-header auditHeader">
                                                                    <div className="at-tbl-title auditTitle">{title}</div>
                                                                    <div className="at-tbl-score auditScore dflex">
                                                                        <div className="dflex mla">
                                                                            <span>{totalYesOrNAResponses} / {totalQuestions} ({newpercentage}%)</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* <table className="audit-table audit-mb5">
                                                            <thead>
                                                                <tr className="mt-1">
                                                                    <th colSpan={2} className="audit-header">{title}</th>
                                                                    <th className="audit-score dflex">
                                                                        <div className="dflex mla">
                                                                            <span>{totalYesOrNAResponses} / {totalQuestions} ({percentage}%)</span>
                                                                        </div>
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                        </table> */}
                                                        </>
                                                    )}

                                                    {visibility[title] && (
                                                        <>
                                                            {matchedMasters.map(master => {
                                                                const masterChecklistItems = ComplianceSections
                                                                    .filter(section => section.SiteSafetyAuditMasterId === master.ID)
                                                                    .flatMap(section =>
                                                                        ComplianceSectionsChecklist.filter(checklist => checklist.ComplianceSectionsId === section.ID)
                                                                    );

                                                                const masterTotalQuestions = masterChecklistItems.length;
                                                                const masterYesOrNAResponses = masterChecklistItems.filter(item =>
                                                                    selectedStatus[item.ID] === "Yes" || selectedStatus[item.ID] === "N/A"
                                                                ).length;
                                                                const masterTotalWeightage = masterChecklistItems.reduce((sum, item) => sum + (item.Weightage || 0), 0);
                                                                const masterWeightageYesOrNA = masterChecklistItems
                                                                    .filter(item => selectedStatus[item.ID] === "Yes" || selectedStatus[item.ID] === "N/A")
                                                                    .reduce((sum, item) => sum + (item.Weightage || 0), 0);
                                                                const masterPercentage = masterTotalWeightage > 0
                                                                    ? ((masterWeightageYesOrNA / masterTotalWeightage) * 100).toFixed(2)
                                                                    : "0.00";

                                                                return (
                                                                    <div key={master.ID} className="at-p-10">
                                                                        <table className="audit-table audit-mb2" style={{ padding: '0px', marginTop: '3px' }}>
                                                                            <thead>
                                                                                <tr>
                                                                                    <th colSpan={2} className="audit-subheader at-bor-left">{master.Name}</th>
                                                                                    <th className="audit-subscore at-bor-right dflex">{masterYesOrNAResponses} / {masterTotalQuestions} ({masterWeightageYesOrNA.toFixed(2)}%)</th>
                                                                                </tr>
                                                                            </thead>
                                                                        </table>

                                                                        {ComplianceSections.filter(section => section.SiteSafetyAuditMasterId === master.ID).map(section => {
                                                                            const checklistItems = ComplianceSectionsChecklist.filter(checklist => checklist.ComplianceSectionsId === section.ID);
                                                                            const yesOrNAResponses = checklistItems.filter(item =>
                                                                                selectedStatus[item.ID] === "Yes" || selectedStatus[item.ID] === "N/A"
                                                                            ).length;
                                                                            return checklistItems.length > 0 ? (
                                                                                <Accordion
                                                                                    title={`${section.Title} (${yesOrNAResponses}/${checklistItems.length})`}
                                                                                    defaultCollapsed={false}
                                                                                    className={"itemCell jAccordion"}
                                                                                    key={section.ID}
                                                                                    collapsedIcon={"ChevronUp"}
                                                                                    expandedIcon={"ChevronDown"}
                                                                                >
                                                                                    {checklistItems.map(item => (
                                                                                        <div className="card mb-2 accordion_mar keep-together" key={item.ID}>
                                                                                            <div className="cardBody">
                                                                                                <div className="audit-question" style={{ padding: '5px 0' }}>
                                                                                                    <div className="mb-1">{item.Title}</div>
                                                                                                    <div className="status-badge-container">
                                                                                                        <span className={`status-badge ${selectedStatus[item.ID] === "Yes" ? "AT-yes-Badge" : selectedStatus[item.ID] === "No" ? "AT-no-Badge" : selectedStatus[item.ID] === "N/A" ? "AT-na-Badge" : ''}`}>
                                                                                                            {selectedStatus[item.ID] || "Pending"}
                                                                                                        </span>
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
                                                            <div className="sub-main-header-text mt-2 ml-10 mb-2"><b>Media Summary</b></div>
                                                            <div className="mb-3 ml-10">
                                                                <SiteSafetyAuditAttachment Title={title} ToolboxTalk={props?.componentProps?.UpdateItem} />
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        <div className="page-break">
                                            <div className="ms-Grid-row ">
                                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6">
                                                    <div>
                                                        <div className="signature-section">
                                                            <div className="main-header-text-signature mt-3">Chairperson Signature</div>
                                                            {AllSignatureData?.length > 0 &&
                                                                AllSignatureData.map((signatureData: any, index: any) => (
                                                                    (
                                                                        <div key={index} className="signature-container mb-5">
                                                                            <div className="Signature-cls">
                                                                                <div className="new-sig-cls">
                                                                                    <div className="signature-title"><b>Signature: </b></div>
                                                                                    <div className="signature-width">
                                                                                        {signatureData.Signature ? (
                                                                                            <img
                                                                                                src={signatureData.Signature}
                                                                                                alt="Signature"
                                                                                                className="signature-image"
                                                                                            />
                                                                                        ) : (
                                                                                            <div className="signature-image"></div>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                <div className="signature-details-view mar-left-67">
                                                                                    <span className="signature-created">
                                                                                        {signatureData.WHSUsers} {signatureData.Created ? `- ${signatureData.Created}` : ""}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                            {/* <div className="signature-email">
                                                                            <b>Email: </b>
                                                                            <span className="sub-email">{signatureData.QuaycleanEmployeeEmail}</span>
                                                                        </div> */}
                                                                        </div>

                                                                    )
                                                                ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {/* <div className="page-break">
                                        <div className="ms-Grid-row ">
                                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6 ">
                                                <div>
                                                    <div className="main-header-text-signature mt-3">Signature</div>

                                                    <div className="signature-container mb-5">
                                                        <div className="Signature-cls">
                                                            <div className="new-sig-cls">
                                                                <div className="signature-title"><b>Signature: </b></div>
                                                                <div className="signature-width">
                                                                    {signatureURLFull != "" ?
                                                                        <>
                                                                            {(signatureURLFull === undefined || signatureURLFull === null || signatureURLFull === "") ?
                                                                                <div className="signature-image"></div> :
                                                                                <img
                                                                                    src={signatureURLFull}
                                                                                    alt="Trainer"
                                                                                    className="signature-image"
                                                                                />}
                                                                        </>
                                                                        :
                                                                        <div className="signature-image"></div>}
                                                                </div>
                                                            </div>
                                                            <div className="signature-details-view mar-left-67">
                                                                {CreatedDate !== undefined ?
                                                                    <span className="signature-created">{selectedWHSUsersArray} - {CreatedDate}</span> :
                                                                    <span className="signature-created">{selectedWHSUsersArray}</span>}

                                                            </div>
                                                        </div>
                                                         <div className="signature-email"><b>Email: </b><span className="sub-email">{SkillMatrixData[0]?.ChairpersonEmail}</span></div> 
                                                    </div>
                                                </div>

                                            </div>
                                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6 ">
                                                <div>
                                                    {signatureURL != null && signatureURL != "" &&
                                                        <div className="main-header-text-signature mt-3">Short Signature</div>}
                                                    {signatureURL != null && signatureURL != "" &&
                                                        <div className="signature-container mb-5">
                                                            <div className="Signature-cls">
                                                                <div className="new-sig-cls">
                                                                    <div className="signature-title"><b>Signature: </b></div>
                                                                    <div className="signature-width">
                                                                        {signatureURL != "" ? <>
                                                                            <img
                                                                                src={signatureURL}
                                                                                alt="Signature"
                                                                                className="signature-image"
                                                                                style={{
                                                                                }}
                                                                            /></> :
                                                                            <div className="signature-image"></div>}
                                                                    </div>
                                                                </div>
                                                                <div className="signature-details-view mar-left-67">
                                                                    {CreatedDate !== undefined ?
                                                                        <span className="signature-created">{selectedWHSUsersArray} - {CreatedDate}</span> :
                                                                        <span className="signature-created">{selectedWHSUsersArray}</span>}

                                                                </div>
                                                            </div>
                                                             <div className="signature-email"><b>Email: </b><span className="sub-email">{AllSignatureData.QuaycleanEmployeeEmail}</span></div> 
                                                        </div>
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}
                                    </div>
                                    <div className="asset-card-2-header-jcc-2 mar-bot-40 noExport">
                                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 toolkit-btn">
                                            <PrimaryButton
                                                style={{ marginBottom: "5px", marginTop: "10px" }}
                                                className="btn btn-danger"
                                                text="Close"
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
        </div>
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