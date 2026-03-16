/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { PrimaryButton, TooltipHost } from "@fluentui/react";
import * as React from "react";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { logGenerator, removeElementOfBreadCrum, generateAndSaveKendoPDF, UserActivityLog } from "../../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../../Interfaces/IAddNewHelpDesk";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Loader } from "../../../CommonComponents/Loader";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CommonPopup from "../../../CommonComponents/CommonSendEmailPopup";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { IFileWithBlob } from "../../../../../../DataProvider/Interface/IFileWithBlob";
import { toastService } from "../../../../../../Common/ToastService";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { DateFormat, DateTimeFormate } from "../../../../../../Common/Constants/CommonConstants";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
const imgLogo = require('../../../../assets/images/logo.png');

export const DetailSkillMatrix: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const isCall = React.useRef<boolean>(true);
    const [SkillMatrixData, setSkillMatrixData] = React.useState<any[]>([]);
    const [DetailsData, setDetailsData] = React.useState<any[]>([]);
    const [CompentencyData, setCompentencyData] = React.useState<any[]>([]);
    const [SiteName, setSiteName] = React.useState<any>(props?.breadCrumItems[0]?.text);
    const [StateName, setStateName] = React.useState<string>(props?.componentProps?.loginUserRoleDetails?.userItems[0]?.QCState?.Title);
    const [StateId, setStateId] = React.useState<string>(props?.breadCrumItems[0]?.manageCompomentItem?.dataObj?.QCStateId);
    const [Today, setToday] = React.useState<string>(moment().format('DD-MM-YYYY'));
    const [AllSignatureData, seAllSignatureData] = React.useState<any>();
    const [title, setTitle] = React.useState<string>("");
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
    const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
    const [displayerror, setDisplayError] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [CleanerName, setCleanerName] = React.useState<string>("");
    const [SignatureData, setSignatureData] = React.useState<any[]>([]);
    const [IsSD, setIsSD] = React.useState<boolean>(false);
    const [detailSiteName, setdetailSiteName] = React.useState<string>("");
    const tooltipId = useId('tooltip');

    const [state, SetState] = React.useState<IHelpDeskFormState>({
        CallerOptions: [],
        CategoryOptions: [],
        EventOptions: [],
        isdisableField: !!isAddNewHelpDesk ? false : true,
        isAddNewHelpDesk: !!isAddNewHelpDesk,
        isformValidationModelOpen: false,
        validationMessage: null
    });

    const _CompenencyData = () => {
        try {
            const select = ["ID,Title,Completed,IMSNos,SkillMatrixId,SignatureTrainer,SignatureCleaner,SkillMatrixName,IsTraining,IsInCompletent,IsCompetent"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `SkillMatrixId eq '${props?.componentProps?.siteMasterId}' and IsInCompletent eq 1`,

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
                                IsCompetent: !!data.IsCompetent === true ? 'Yes' : 'No',
                            }
                        );
                    });
                    setCompentencyData(DetailData);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
        }
    };

    const _SkillMatrixSignature = () => {
        setIsLoading(true);
        try {
            const select = ["ID,CleanerSignatureFull,CleanerSignatureShort,TrainerSignatureShort,TrainerSignatureFull,QuaycleanEmployeeId,QuaycleanEmployee/Email,QuaycleanEmployee/FirstName,QuaycleanEmployee/LastName,SkillMatrixId,Created,TrainerCompetencySignatureFull,TrainerCompetencySignatureShort,CleanerCompetencySignatureFull,CleanerCompetencySignatureShort"];
            const expand = ["QuaycleanEmployee"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                filter: `SkillMatrixId eq ${props?.siteMasterId} and IsActive eq 1`,
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
                            CleanerSort: !!data.CleanerSignatureShort ? data.CleanerSignatureShort : '',
                            Trainer: !!data.TrainerSignatureFull ? data.TrainerSignatureFull : '',
                            TrainerSort: !!data.TrainerSignatureShort ? data.TrainerSignatureShort : '',
                            Name: !!data.QuaycleanEmployeeId ? data.QuaycleanEmployee.FirstName + " " + data.QuaycleanEmployee.LastName : '',
                            Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
                            TrainerCompetencySignatureFull: !!data.TrainerCompetencySignatureFull ? data.TrainerCompetencySignatureFull : '',
                            TrainerCompetencySignatureShort: !!data.TrainerCompetencySignatureShort ? data.TrainerCompetencySignatureShort : '',
                            CleanerCompetencySignatureFull: !!data.CleanerCompetencySignatureFull ? data.CleanerCompetencySignatureFull : '',
                            CleanerCompetencySignatureShort: !!data.CleanerCompetencySignatureShort ? data.CleanerCompetencySignatureShort : '',
                        };
                    });
                    setSignatureData(SignatureData);
                    setIsLoading(false);
                    setTimeout(() => {
                        setIsSD(true);
                    }, 500);

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
        if (IsSD && SkillMatrixData.length > 0) {
            const generatedRecords = createRecordsForAttendees();
            seAllSignatureData(generatedRecords);
        }
    }, [IsSD, SkillMatrixData]);

    const createRecordsForAttendees = () => {
        const {
            AttendeesEmailId,
            AttendeesEmail,
            Attendees,
        } = SkillMatrixData[0];

        // Find matching record in _ToolboxTalkSignature based on QuaycleanEmployeeId
        const matchingSignature = SignatureData.find(
            (signature: any) => signature.QuaycleanEmployeeId === AttendeesEmailId
        );

        // Create the record for the single attendee
        const attendeeRecord = {
            QuaycleanEmployeeEmail: AttendeesEmail,
            QuaycleanEmployeeId: AttendeesEmailId,
            Name: Attendees, // No need to split if there's only one name
            Signature: matchingSignature ? matchingSignature.Signature : "",
            Created: matchingSignature ? matchingSignature.Created : "",
        };

        return attendeeRecord;
    };

    const _SkillMatrixData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,TrainingAttendance,SkillMatrixDate,FormStatus,ChairpersonId,Chairperson/Title,Chairperson/EMail,VenueTrained,Created,Modified,AttendeesEmailId,AttendeesEmail/Email"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["AttendeesEmail", "Chairperson"],
                filter: `ID eq '${props?.componentProps?.siteMasterId}' and IsActive eq 1`,
                listName: ListNames.SkillMatrix,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    let SkillMatrix = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                Date: !!data.Created ? moment(data.Created).format(DateFormat) : '',
                                SkillMatrixDate: !!data.SkillMatrixDate ? moment(data.SkillMatrixDate).format(DateFormat) : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                FormStatus: !!data.FormStatus ? data.FormStatus : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                TrainingAttendance: !!data.TrainingAttendance ? data.TrainingAttendance : '',
                                VenueTrained: !!data.VenueTrained ? data.VenueTrained : '',
                                Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
                                Modified: !!data.Modified ? data.Modified : null,
                                Attendees: !!data.TrainingAttendance ? data.TrainingAttendance : '',
                                AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : '',
                                AttendeesEmail: !!data.AttendeesEmail ? data.AttendeesEmail.Email : '',
                                Chairperson: (!!data.Chairperson && data.Chairperson.length > 0) ? data.Chairperson[0].Title : '',
                                ChairpersonEmail: (!!data.Chairperson && data.Chairperson.length > 0) ? data.Chairperson[0].EMail : ''
                            }
                        );
                    });
                    setCleanerName(SkillMatrix[0]?.TrainingAttendance);
                    setSkillMatrixData(SkillMatrix);
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
        try {
            const select = ["ID,Title,SiteManagerId,SiteManager/Title,QCStateId,Category"];
            const expand = ["SiteManager"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                filter: `ID eq ${props.originalSiteMasterId}`,
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
                                SiteManagerName: (!!data.SiteManagerId && data.SiteManagerId.length > 0) ? data.SiteManager.map((i: { Title: any; }) => i.Title) : '',
                                SiteManagerEmail: (!!data.SiteManager && data.SiteManager.length > 0) ? data.SiteManager.map((i: { EMail: any; }) => i.EMail) : '',
                                StateId: !!data.QCStateId ? data.QCStateId : null
                            }
                        );
                    });
                    setdetailSiteName(SiteData[0]?.Title);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
        }
    }, []);

    const _SkillMatrixDetailsData = () => {
        try {
            const select = ["ID,Title,Completed,IMSNos,SkillMatrixId,SignatureTrainer,SignatureCleaner,SkillMatrixName,Modified,IsInCompletent,IsCompetent"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `SkillMatrixId eq '${props?.componentProps?.siteMasterId}'`,
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
                                SignatureTrainer: !!data.SignatureTrainer === true ? 'Yes' : 'No',
                                SignatureCleaner: !!data.SignatureCleaner === true ? 'Yes' : 'No',
                                Modified: !!data.Modified ? moment(data.Modified).format(DateFormat) : '',
                                IsInCompletent: !!data.IsInCompletent === true ? 'Yes' : 'No',
                                IsCompetent: !!data.IsCompetent === true ? 'Yes' : 'No',
                            }
                        );
                    });
                    const groupedDetails = DetailData.reduce((acc: any, detail: any) => {
                        if (!acc[detail.SkillMatrix]) {
                            acc[detail.SkillMatrix] = [];
                        }
                        acc[detail.SkillMatrix].push(detail);
                        return acc;
                    }, {} as { [key: string]: typeof DetailData });
                    setDetailsData(groupedDetails);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
        }
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
            let fileName: string = SiteName + ' - Skill Matrix' + "-" + (!!SkillMatrixData[0]?.SkillMatrixDate ? SkillMatrixData[0]?.SkillMatrixDate : "");
            let fileblob: any = await generateAndSaveKendoPDF("SkillMatrixPDFCode", fileName, false);
            const file: IFileWithBlob = {
                file: fileblob,
                name: `${fileName}.pdf`,
                overwrite: true
            };
            let toastMessage: string = "";
            const toastId = toastService.loading('Loading...');
            toastMessage = 'Email sent successfully!';
            let insertData: any = {
                Title: title,
                SendToEmail: sendToEmail,
                StateName: StateName,
                SiteName: SiteName,
                EmailType: "SkillMatrix",
                Cleaner: CleanerName
            };
            props.provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                props.provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
                    console.log("Upload Success");
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: props?.componentProps?.originalSiteMasterId || props.originalSiteMasterId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.SendEmail,
                        EntityType: UserActionEntityTypeEnum.SkillMatrix,
                        // EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        EntityName: title, // Match index dynamically
                        LogFor: UserActionLogFor.Both,
                        Details: `Send Email Skill Matrix to ${sendToEmail}`,
                        StateId: props?.componentProps?.qCStateId
                    };
                    void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
                }).catch((err: any) => console.log(err));
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                onClickCancel();
                setIsLoading(false);
            }).catch((err: any) => console.log(err));
        } else {
            setIsLoading(false);
        }
    };

    const onclickSendEmail = () => {
        showPopup();
    };


    const onClickCancel = (): void => {
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


    const onClickDownload = async (): Promise<void> => {
        setIsLoading(true);
        let fileName: string = SiteName + '-Skill Matrix' + "-" + (!!SkillMatrixData[0]?.SkillMatrixDate ? SkillMatrixData[0]?.SkillMatrixDate : "");
        let fileblob: any = await generateAndSaveKendoPDF("SkillMatrixPDFCode", fileName, false, true);
        setIsLoading(false);
    };

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
            let orgSiteId = props?.componentProps?.originalSiteMasterId || props.originalSiteMasterId;
            let data = await getState(orgSiteId);
            if (props?.componentProps?.qCStateId || data[0]?.QCStateId) {
                const todayDate = moment().format("YYYY-MM-DD");
                const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    listName: ListNames.UserActivityLog,
                    filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityId eq '${props?.siteMasterId}' and SiteNameId eq '${orgSiteId}' and EntityType eq '${UserActionEntityTypeEnum.SkillMatrix}' and ActionType eq 'Details View' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
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
                        EntityType: UserActionEntityTypeEnum.SkillMatrix,
                        EntityId: props?.siteMasterId,
                        EntityName: SkillMatrixData[0]?.Title,
                        LogFor: UserActionLogFor.Both,
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

        if (!!SkillMatrixData && SkillMatrixData.length > 0 && SkillMatrixData[0]?.Title !== undefined && isCall.current == true) {
            isCall.current = false;
            _userActivityLog();
        }
    }, [SkillMatrixData]);

    React.useEffect(() => {
        if (props?.componentProps?.originalState) {
            setStateName(props.componentProps.originalState)
        }
        _SkillMatrixSignature();
        _CompenencyData();
    }, []);

    React.useEffect(() => {
        if (props?.componentProps?.siteMasterId && props?.componentProps?.siteMasterId > 0) {
            _SkillMatrixData();
            _SkillMatrixDetailsData();
        }
    }, []);
    // const onClickClose = (isCancelQuaysafe = false) => {
    //     if (props.componentProps.isNotGeneral === false) {
    //         const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
    //         manageComponentView({ currentComponentName: ComponentNameEnum.ListSkillMatrix, qCStateId: props?.componentProps?.qCStateId, view: props.componentProps.viewType, breadCrumItems: breadCrumItems, subpivotName: "SkillMatrix" });
    //     } else {
    //         if (isCancelQuaysafe) {
    //             const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
    //             manageComponentView({ currentComponentName: ComponentNameEnum.ListSkillMatrix, qCStateId: props?.componentProps?.qCStateId, view: props.componentProps.viewType, breadCrumItems: breadCrumItems, subpivotName: "SkillMatrix" });
    //         } else if (props?.componentProps?.originalSiteMasterId) {
    //             const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
    //             props.manageComponentView({
    //                 currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.qCStateId, originalState: StateName, view: props.componentProps.viewType, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "SkillMatrix",
    //             });
    //         } else {
    //             const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
    //             manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, view: props.componentProps.viewType, breadCrumItems: breadCrumItems, subpivotName: "SkillMatrix" });
    //         }
    //     }

    // };

    const onClickClose = () => {
        if (props.componentProps.isNotGeneral === false) {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            manageComponentView({ currentComponentName: ComponentNameEnum.ListSkillMatrix, qCStateId: props?.componentProps?.qCStateId, view: props.componentProps.viewType, breadCrumItems: breadCrumItems, subpivotName: "SkillMatrix" });
        } else {
            const breadCrumItemsList = props?.componentProps?.breadCrumItems || [];
            // if (props?.componentProps?.originalSiteMasterId && props?.componentProps?.qCStateId && breadCrumItemsList.length > 0 && breadCrumItemsList[0]?.currentCompomnetName === "AddNewSite") {
            //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            //     props.manageComponentView({
            //         currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.qCStateId, originalState: StateName, view: props.componentProps.viewType, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "SkillMatrix",
            //     });
            // } 
            if (isSiteLevelComponent) {
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                    selectedZoneDetails: selectedZoneDetails,
                    isShowDetailOnly: true,
                    pivotName: "IMSKey",
                    subpivotName: "SkillMatrix",
                });
            }
            else {
                const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, view: props.componentProps.viewType, breadCrumItems: breadCrumItems, subpivotName: "SkillMatrix" });
            }
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
        <div className="skillMarix-Detail">
            <div className="mt-10">
                <div className="ms-Grid ">

                    <div className="ms-Grid-row">
                        <div className="asset-card-2-header-jcc-skill-matrix margin-bot-80">
                            <div className="formGroup btnStickyDetails noExport">
                                <div className="va-b inlineBlock">
                                    <PrimaryButton
                                        className="btn btn-danger send-email-btn"
                                        text="Close"
                                        onClick={onClickClose}
                                    />
                                </div>
                                <div className="va-b inlineBlock">
                                    <CommonPopup
                                        isPopupVisible={isPopupVisible} hidePopup={hidePopup} title={title} sendToEmail={sendToEmail} onChangeTitle={onChangeTitle} onChangeSendToEmail={onChangeSendToEmail} displayerrortitle={displayerrortitle} displayerroremail={displayerroremail} displayerror={displayerror} onClickSendEmail={onClickSendEmail} onClickCancel={onClickCancel} onclickSendEmail={onclickSendEmail}
                                    />
                                </div>
                                <div className="va-b inlineBlock">
                                    <PrimaryButton className="btn btn-primary send-email-btn" onClick={onClickDownload}>
                                        <FontAwesomeIcon icon="download" className="clsbtnat" /><div>PDF</div>
                                    </PrimaryButton>
                                </div>
                            </div>
                            <div className="" >
                                <div className="boxCard b-class">
                                    <div id="SkillMatrixPDFCode">
                                        <div className="head-tbl-space">
                                            <table className="table-toolbox-talk cell-space-0" style={{ width: "100%", border: "1px solid black" }} >
                                                <tr>
                                                    <th className="th-toolbox-talk-logo pl-10 bg-white br-1" > <img src={imgLogo} height="30px" className="course-img-first img-mt qclogoims" /></th>
                                                    <td className="td-toolbox-talk middle-box"><div>Skill Matrix</div></td>
                                                    <td className="td-toolbox-talk blue-box pl-10"><div>Skill Matrix Id</div><div>{SkillMatrixData[0]?.Title}</div></td>
                                                </tr>
                                            </table>
                                        </div>
                                        <div className="table-toolbox-talk sm-m14">
                                            <div className="row">
                                                <div className="td-toolbox-talk-detail"><b>Meeting Date:</b></div>
                                                <div className="td-toolbox-talk-detail">{SkillMatrixData[0]?.SkillMatrixDate}</div>
                                            </div>
                                            <div className="row">
                                                <div className="td-toolbox-talk-detail"><b>Job Site:</b></div>
                                                <div className="td-toolbox-talk-detail">{(props?.breadCrumItems[0]?.text === "IMS" || props?.breadCrumItems[0]?.text === "ListSkillMatrix") ? props?.breadCrumItems[1]?.text : props?.breadCrumItems[0]?.text}
                                                </div>
                                                {props?.breadCrumItems[0]?.text === undefined && props.isNotGeneral === false &&
                                                    <div className="td-toolbox-talk-detail inspection-mt-10">{props.componentProps.siteName}</div>
                                                }
                                            </div>
                                            <div className="row">
                                                <div className="td-toolbox-talk-detail"><b>Training Manager Name:</b></div>
                                                <div className="td-toolbox-talk-detail">{SkillMatrixData[0]?.Chairperson}</div>
                                            </div>
                                            <div className="row">
                                                <div className="td-toolbox-talk-detail"><b>Venue Trained:</b></div>
                                                <div className="td-toolbox-talk-detail">{SkillMatrixData[0]?.VenueTrained}</div>
                                            </div>
                                            <div className="row">
                                                <div className="td-toolbox-talk-detail"><b>Attendees:</b></div>
                                                <div className="td-toolbox-talk-detail"><span className="attendees-badge-cls">{SkillMatrixData[0]?.TrainingAttendance}</span></div>
                                            </div>
                                        </div>
                                        {window.innerWidth <= 768 ?
                                            <>
                                                <div className="row skill-border">
                                                    {Object.entries(DetailsData).map(([skillMatrix, details]) => (
                                                        <React.Fragment key={skillMatrix}>
                                                            <div className="col-12">
                                                                <div className="main-header-text ">{skillMatrix}</div>
                                                            </div>
                                                            {details.map((detail: any) => (
                                                                <div className="col-lg-6 col-md-12 mb-4">
                                                                    <div className="thumbCard">
                                                                        <div className="thumbTitle position-relative">
                                                                            <div className="card-imnage-info">
                                                                                <div>
                                                                                    <label className="card-label">Induction Training Units</label>
                                                                                    <div className="">{detail.Title}</div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="row fnt-14 mx-0 ">

                                                                            <div className="card-other-content">
                                                                                <label className="card-label">IMS Nos.</label>
                                                                                <div className="fw-medium">{detail.IMSNos}</div>
                                                                            </div>
                                                                            <div className="card-other-content">
                                                                                <label className="card-label">Completed</label>
                                                                                <div className="fw-medium">{detail.Completed} {detail.IsCompetent === "Yes" && <TooltipHost content={"Training Is Completed"} id={tooltipId}>
                                                                                    <FontAwesomeIcon className="actionBtn btnDanger dticon ad-icon-danger mar-left-10" icon='info-circle' />
                                                                                </TooltipHost>}</div>
                                                                            </div>

                                                                            <div className="card-other-content">
                                                                                <label className="card-label">Date</label>
                                                                                <div className="fw-medium">{detail.Modified}</div>
                                                                            </div>
                                                                            <div className="card-other-content">
                                                                                <label className="card-label">Signature Trainer</label>
                                                                                <div className="fw-medium">{detail.IsInCompletent === "Yes" ?
                                                                                    <div>
                                                                                        {detail.IsInCompletent === "Yes" ? (
                                                                                            <>
                                                                                                {(SignatureData[0]?.TrainerCompetencySignatureShort === undefined || SignatureData[0]?.TrainerCompetencySignatureShort === null || SignatureData[0]?.TrainerCompetencySignatureShort === "") ? (
                                                                                                    <div className="signature-image-sort"></div>
                                                                                                ) : (
                                                                                                    <img
                                                                                                        src={SignatureData[0]?.TrainerCompetencySignatureShort}
                                                                                                        alt="TrainerCompetencySignatureShort"
                                                                                                        className="signature-image-sort"
                                                                                                    />
                                                                                                )}
                                                                                            </>
                                                                                        ) : (
                                                                                            <></>
                                                                                        )}</div>
                                                                                    :
                                                                                    <div>
                                                                                        {detail.SignatureTrainer === "Yes" ? (
                                                                                            <>
                                                                                                {(SignatureData[0]?.TrainerSort === undefined || SignatureData[0]?.TrainerSort === null || SignatureData[0]?.TrainerSort === "") ? (
                                                                                                    <div className="signature-image-sort"></div>
                                                                                                ) : (
                                                                                                    <img
                                                                                                        src={SignatureData[0]?.TrainerSort}
                                                                                                        alt="TrainerSort"
                                                                                                        className="signature-image-sort"
                                                                                                    />
                                                                                                )}
                                                                                            </>
                                                                                        ) : (
                                                                                            <></>
                                                                                        )}
                                                                                    </div>
                                                                                }</div>
                                                                            </div>
                                                                            <div className="card-other-content">
                                                                                <label className="card-label">Signature Cleaner</label>
                                                                                <div className="fw-medium">{detail.IsInCompletent === "Yes" ?
                                                                                    <div>
                                                                                        {detail.IsInCompletent === "Yes" ? (
                                                                                            <>
                                                                                                {(SignatureData[0]?.CleanerCompetencySignatureShort === undefined || SignatureData[0]?.CleanerCompetencySignatureShort === null || SignatureData[0]?.CleanerCompetencySignatureShort === "") ? (
                                                                                                    <div className="signature-image-sort"></div>
                                                                                                ) : (
                                                                                                    <img
                                                                                                        src={SignatureData[0]?.CleanerCompetencySignatureShort}
                                                                                                        alt="CleanerCompetencySignatureShort"
                                                                                                        className="signature-image-sort"
                                                                                                    />
                                                                                                )}
                                                                                            </>
                                                                                        ) : (
                                                                                            <></>
                                                                                        )}</div>
                                                                                    :
                                                                                    <div>
                                                                                        {detail.SignatureCleaner === "Yes" ? (
                                                                                            <>
                                                                                                {(SignatureData[0]?.CleanerSort === undefined || SignatureData[0]?.CleanerSort === null || SignatureData[0]?.CleanerSort === "") ? (
                                                                                                    <div className="signature-image-sort"></div>
                                                                                                ) : (
                                                                                                    <img
                                                                                                        src={SignatureData[0]?.CleanerSort}
                                                                                                        alt="CleanerSort"
                                                                                                        className="signature-image-sort"
                                                                                                    />
                                                                                                )}
                                                                                            </>
                                                                                        ) : (
                                                                                            <></>
                                                                                        )}
                                                                                    </div>
                                                                                }</div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </React.Fragment>
                                                    ))}
                                                </div>

                                            </> :
                                            <div className="sm-pad-14">
                                                <div className="table-sm">
                                                    <div className="table-header-sm">
                                                        <div className="text-left-sm">Induction Training Units</div>
                                                        <div className="mw-160">IMS Nos.</div>
                                                        <div className="mw-140">Completed</div>
                                                        <div className="mw-90">Date</div>
                                                        <div className="mw-90">Signature Trainer</div>
                                                        <div className="mw-90">Signature Cleaner</div>
                                                    </div>
                                                    <div>
                                                        {Object.entries(DetailsData).map(([skillMatrix, details]) => (
                                                            <React.Fragment key={skillMatrix}>
                                                                <div className="location-sm">{skillMatrix}</div>
                                                                {details.map((detail: any) => (
                                                                    <div className="table-row-sm" key={detail.ID}>
                                                                        <div className="text-left-sm">{detail.Title}</div>
                                                                        <div className="mw-160">{detail.IMSNos}</div>
                                                                        <div className="mw-140 dflex">{detail.Completed} {detail.IsCompetent === "Yes" && <TooltipHost content={"Training Is Completed"} id={tooltipId}>
                                                                            <FontAwesomeIcon className="actionBtn btnDanger dticon ad-icon-danger mar-left-10" icon='info-circle' />
                                                                        </TooltipHost>}</div>
                                                                        {/* <div className="mw-90">{detail.Modified}</div> */}
                                                                        <div className="mw-90">{SkillMatrixData[0]?.SkillMatrixDate}</div>

                                                                        <div className="mw-90">
                                                                            {detail.IsInCompletent === "Yes" ?
                                                                                <div>
                                                                                    {detail.IsInCompletent === "Yes" ? (
                                                                                        <>
                                                                                            {(SignatureData[0]?.TrainerCompetencySignatureShort === undefined || SignatureData[0]?.TrainerCompetencySignatureShort === null || SignatureData[0]?.TrainerCompetencySignatureShort === "") ? (
                                                                                                <div className="signature-image-sort"></div>
                                                                                            ) : (
                                                                                                <img
                                                                                                    src={SignatureData[0]?.TrainerCompetencySignatureShort}
                                                                                                    alt="TrainerCompetencySignatureShort"
                                                                                                    className="signature-image-sort"
                                                                                                />
                                                                                            )}
                                                                                        </>
                                                                                    ) : (
                                                                                        <></>
                                                                                    )}</div>
                                                                                :
                                                                                <div>
                                                                                    {detail.SignatureTrainer === "Yes" ? (
                                                                                        <>
                                                                                            {(SignatureData[0]?.TrainerSort === undefined || SignatureData[0]?.TrainerSort === null || SignatureData[0]?.TrainerSort === "") ? (
                                                                                                <div className="signature-image-sort"></div>
                                                                                            ) : (
                                                                                                <img
                                                                                                    src={SignatureData[0]?.TrainerSort}
                                                                                                    alt="TrainerSort"
                                                                                                    className="signature-image-sort"
                                                                                                />
                                                                                            )}
                                                                                        </>
                                                                                    ) : (
                                                                                        <></>
                                                                                    )}
                                                                                </div>
                                                                            }
                                                                        </div>

                                                                        <div className="mw-90">
                                                                            {detail.IsInCompletent === "Yes" ?
                                                                                <div>
                                                                                    {detail.IsInCompletent === "Yes" ? (
                                                                                        <>
                                                                                            {(SignatureData[0]?.CleanerCompetencySignatureShort === undefined || SignatureData[0]?.CleanerCompetencySignatureShort === null || SignatureData[0]?.CleanerCompetencySignatureShort === "") ? (
                                                                                                <div className="signature-image-sort"></div>
                                                                                            ) : (
                                                                                                <img
                                                                                                    src={SignatureData[0]?.CleanerCompetencySignatureShort}
                                                                                                    alt="CleanerCompetencySignatureShort"
                                                                                                    className="signature-image-sort"
                                                                                                />
                                                                                            )}
                                                                                        </>
                                                                                    ) : (
                                                                                        <></>
                                                                                    )}</div>
                                                                                :
                                                                                <div>
                                                                                    {detail.SignatureCleaner === "Yes" ? (
                                                                                        <>
                                                                                            {(SignatureData[0]?.CleanerSort === undefined || SignatureData[0]?.CleanerSort === null || SignatureData[0]?.CleanerSort === "") ? (
                                                                                                <div className="signature-image-sort"></div>
                                                                                            ) : (
                                                                                                <img
                                                                                                    src={SignatureData[0]?.CleanerSort}
                                                                                                    alt="CleanerSort"
                                                                                                    className="signature-image-sort"
                                                                                                />
                                                                                            )}
                                                                                        </>
                                                                                    ) : (
                                                                                        <></>
                                                                                    )}
                                                                                </div>
                                                                            }

                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>}
                                        <div className="sm-m14">
                                            <div className="">I <b><u>{SkillMatrixData[0]?.TrainingAttendance}</u></b> have been trained and understand the training units which are
                                                required to fulfil my position. I have undertaken training using the guidelines provided in Quayclean's Staff Handbook, Site Manual,
                                                Site Risk Assessment, & Safe Work Method Statements.
                                            </div>
                                        </div>


                                        <div className="page-break">
                                            <div className="ms-Grid-row ">
                                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6 ">
                                                    <div>
                                                        <div className="main-header-text-signature mt-3">Trainer Signature</div>

                                                        <div className="signature-container mb-5">
                                                            <div className="Signature-cls">
                                                                <div className="new-sig-cls">
                                                                    <div className="signature-title"><b>Signature: </b></div>
                                                                    <div className="signature-width">
                                                                        {SignatureData[0]?.Trainer != "" ?
                                                                            <>
                                                                                {(SignatureData[0]?.Trainer === undefined || SignatureData[0]?.Trainer === null || SignatureData[0]?.Trainer === "") ?
                                                                                    <div className="signature-image"></div> :
                                                                                    <img
                                                                                        src={SignatureData[0]?.Trainer}
                                                                                        alt="Trainer"
                                                                                        className="signature-image"
                                                                                    />}
                                                                            </>
                                                                            :
                                                                            <div className="signature-image"></div>}
                                                                    </div>
                                                                </div>
                                                                <div className="signature-details-view mar-left-67">
                                                                    {SignatureData[0]?.Created !== "" ?
                                                                        <span className="signature-created">{SkillMatrixData[0]?.Chairperson} - {SignatureData[0]?.Created}</span> :
                                                                        <span className="signature-created">{SkillMatrixData[0]?.Chairperson}</span>}

                                                                </div>
                                                            </div>
                                                            <div className="signature-email"><b>Email: </b><span className="sub-email">{SkillMatrixData[0]?.ChairpersonEmail}</span></div>
                                                        </div>
                                                    </div>

                                                </div>
                                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6 ">
                                                    <div>
                                                        {!!AllSignatureData && AllSignatureData.QuaycleanEmployeeId > 0 &&
                                                            <div className="main-header-text-signature mt-3">Cleaner Signature</div>}
                                                        {!!AllSignatureData && AllSignatureData.QuaycleanEmployeeId > 0 &&
                                                            <div className="signature-container mb-5">
                                                                <div className="Signature-cls">
                                                                    <div className="new-sig-cls">
                                                                        <div className="signature-title"><b>Signature: </b></div>
                                                                        <div className="signature-width">
                                                                            {AllSignatureData.Signature != "" ? <>
                                                                                <img
                                                                                    src={AllSignatureData.Signature}
                                                                                    alt="Signature"
                                                                                    className="signature-image"
                                                                                    style={{
                                                                                    }}
                                                                                /></> :
                                                                                <div className="signature-image"></div>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="signature-details-view mar-left-67">
                                                                        {AllSignatureData.Created !== "" ?
                                                                            <span className="signature-created">{AllSignatureData.Name} - {AllSignatureData.Created}</span> :
                                                                            <span className="signature-created">{AllSignatureData.Name}</span>}

                                                                    </div>
                                                                </div>
                                                                <div className="signature-email"><b>Email: </b><span className="sub-email">{AllSignatureData.QuaycleanEmployeeEmail}</span></div>
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {CompentencyData.length > 0 && <>
                                            <div className="main-header-text mt-4">Competency Review</div>
                                            <div className="sub-main-header-text mt-2">Following are the skills which cleaner don't know and ready to learn</div></>
                                        }
                                        {CompentencyData.length > 0 &&
                                            <div className="table-sm mt-2">
                                                <div className="table-header-sm">
                                                    <div className="text-left-sm">Title</div>
                                                    <div className="mw-160">IMS Nos.</div>
                                                    <div className="mw-140">Competency Signature</div>
                                                    {/* <div className="mw-160">Signature</div> */}
                                                </div>
                                                <div>
                                                    {CompentencyData.map((detail: any) => (
                                                        <div className="table-row-sm" key={detail.ID}>
                                                            <div className="text-left-sm">{detail.Title}</div>
                                                            <div className="mw-160">{detail.IMSNos}</div>
                                                            <div className="mw-140">
                                                                {(SignatureData[0]?.TrainerCompetencySignatureShort === undefined || SignatureData[0]?.TrainerCompetencySignatureShort === null || SignatureData[0]?.TrainerCompetencySignatureShort === "") ? (
                                                                    <div className="signature-image-sort"></div>
                                                                ) : (
                                                                    <img
                                                                        src={SignatureData[0]?.TrainerCompetencySignatureShort}
                                                                        alt="TrainerCompetencySignatureShort"
                                                                        className="signature-image-sort"
                                                                    />
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                    }
                                                </div>
                                            </div>}

                                        {CompentencyData.length > 0 &&
                                            <div className="">
                                                <div className="ms-Grid-row ">
                                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6 ">
                                                        <div className="">
                                                            <div className="main-header-text-signature mt-3">Trainer Competency Signature</div>

                                                            <div className="signature-container mb-5">
                                                                <div className="Signature-cls">
                                                                    <div className="new-sig-cls">
                                                                        <div className="signature-title"><b>Signature: </b></div>
                                                                        <div className="signature-width">
                                                                            {SignatureData[0]?.TrainerCompetencySignatureFull != "" ?
                                                                                <>
                                                                                    {(SignatureData[0]?.TrainerCompetencySignatureFull === undefined || SignatureData[0]?.TrainerCompetencySignatureFull === null || SignatureData[0]?.TrainerCompetencySignatureFull === "") ?
                                                                                        <div className="signature-image"></div> :
                                                                                        <img
                                                                                            src={SignatureData[0]?.TrainerCompetencySignatureFull}
                                                                                            alt="TrainerCompetencySignatureFull"
                                                                                            className="signature-image"
                                                                                        />}
                                                                                </>
                                                                                :
                                                                                <div className="signature-image"></div>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="signature-details-view mar-left-67">
                                                                        {SignatureData[0]?.Created !== "" ?
                                                                            <span className="signature-created">{SkillMatrixData[0]?.Chairperson} - {SignatureData[0]?.Created}</span> :
                                                                            <span className="signature-created">{SkillMatrixData[0]?.Chairperson}</span>}
                                                                    </div>
                                                                </div>
                                                                <div className="signature-email"><b>Email: </b><span className="sub-email">{SkillMatrixData[0]?.ChairpersonEmail}</span></div>
                                                            </div>

                                                        </div>
                                                    </div>
                                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6 ">
                                                        <div>
                                                            {!!AllSignatureData && AllSignatureData.QuaycleanEmployeeId > 0 &&
                                                                <div className="main-header-text-signature mt-3">Cleaner Competency Signature</div>}
                                                            {!!AllSignatureData && AllSignatureData.QuaycleanEmployeeId > 0 &&

                                                                <div className="signature-container mb-5">
                                                                    <div className="Signature-cls">
                                                                        <div className="new-sig-cls">
                                                                            <div className="signature-title"><b>Signature: </b></div>
                                                                            <div className="signature-width">
                                                                                {(SignatureData[0]?.CleanerCompetencySignatureFull !== "") ? <>
                                                                                    <img
                                                                                        src={SignatureData[0]?.CleanerCompetencySignatureFull}
                                                                                        alt="Signature"
                                                                                        className="signature-image"
                                                                                        style={{
                                                                                        }}
                                                                                    /></> :
                                                                                    <div className="signature-image"></div>}
                                                                            </div>
                                                                        </div>
                                                                        <div className="signature-details-view mar-left-67">
                                                                            {AllSignatureData.Created !== "" ?
                                                                                <span className="signature-created">{AllSignatureData.Name} - {AllSignatureData.Created}</span> :
                                                                                <span className="signature-created">{AllSignatureData.Name}</span>}
                                                                        </div>
                                                                    </div>
                                                                    <div className="signature-email"><b>Email: </b><span className="sub-email">{AllSignatureData.QuaycleanEmployeeEmail}</span></div>
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        }



                                        {/* <div className="mt-4">Signed:.....................................................................................  Date:................................................................</div> */}
                                        <div className="asset-card-2-header-jcc-2 mar-bot-40 noExport">
                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 toolkit-btn">
                                                <PrimaryButton
                                                    style={{ marginBottom: "5px", marginTop: "10px" }}
                                                    className="btn btn-danger"
                                                    text="Close"
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
        </div>
    </>;
};