/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { Panel, PanelType, PrimaryButton } from "@fluentui/react";
import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBoolean } from "@fluentui/react-hooks";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../Common/ToastService";
import { logGenerator, removeElementOfBreadCrum, generateAndSaveKendoPDF, UserActivityLog } from "../../../../../../Common/Util";
import { IFileWithBlob } from "../../../../../../DataProvider/Interface/IFileWithBlob";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../../Interfaces/IAddNewHelpDesk";
import CommonPopup from "../../../CommonComponents/CommonSendEmailPopup";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Loader } from "../../../CommonComponents/Loader";
import moment from "moment";
import ToolboxAttachments from "../../../CommonComponents/ToolboxAttachments ";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { DateFormat, DateTimeFormate } from "../../../../../../Common/Constants/CommonConstants";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
const imgLogo = require('../../../../assets/images/logo.png');

export const DetailToolboxIncident: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {


    const [value, setValue] = React.useState(props.initialValue);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail } = appGlobalState;
        const selectedZoneDetails = useAtomValue(selectedZoneAtom);
        const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const isCall = React.useRef<boolean>(true);
    const [ToolboxTalk, setToolboxTalk] = React.useState<any[]>([]);
    const [SignatureData, setSignatureData] = React.useState<any[]>([]);
    const [IsSD, setIsSD] = React.useState<boolean>(false);
    const [ToolboxTalkData, setToolboxTalkData] = React.useState<any[]>([]);
    const [ToolboxTalkDetailsData, setToolboxTalkDetailsData] = React.useState<any[]>([]);
    const [AllMasterData, setAllMasterData] = React.useState<any[]>([]);
    const [AllDetailData, setAllDetailData] = React.useState<any[]>([]);
    const [SiteName, setSiteName] = React.useState<any>(props?.breadCrumItems[0]?.text);
    const [StateName, setStateName] = React.useState<string>(props?.componentProps?.loginUserRoleDetails?.userItems[0]?.QCState?.Title);
    const [title, setTitle] = React.useState<string>("");
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
    const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
    const [displayerror, setDisplayError] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const notFoundImage = require('../../../../../quayClean/assets/images/NotFoundImg.png');
    const [AllSignatureData, seAllSignatureData] = React.useState<any[]>([]);
    const [CleanerName, setCleanerName] = React.useState<string>("");
    const [ChairPersonName, setChairPersonName] = React.useState<string>("");
    const [MasterComment, setMasterComment] = React.useState<any>("");
    const _getToolboxIncident = () => {
        setIsLoading(true);
        try {
            const select = ["ID,IncidentDate,Subject,Location,ChairpersonId,Chairperson/Title,Chairperson/Name,SiteNameId,SiteName/Title,ReportId,Attendees,AttendeesEmailId,AttendeesEmail/Email,Attachments,AttachmentFiles,Created,MasterComment"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteName", "Chairperson", "AttachmentFiles", "AttendeesEmail"],
                filter: `Id eq '${props?.siteMasterId}'`,
                listName: ListNames.ToolboxIncident,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        const fixImgURL = `${props.context.pageContext.web.serverRelativeUrl}/Lists/ToolboxIncident/Attachments/${data.ID}/`;
                        let attachmentFiledata: string[] = []; // Array to hold all attachment URLs
                        let creatorFileAttachments: string[] = []; // CreatorFile URLs
                        let masterFileAttachments: string[] = []; // MasterFile URLs

                        if (data.AttachmentFiles.length > 0) {
                            try {
                                data.AttachmentFiles.forEach((AttachmentData: { ServerRelativeUrl: string; FileName: string; }) => {
                                    if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                                        attachmentFiledata.push(AttachmentData.ServerRelativeUrl);
                                        // Separate filtering based on FileName
                                        if (AttachmentData.FileName.includes("CreatorFile")) {
                                            creatorFileAttachments.push(AttachmentData.ServerRelativeUrl);
                                        } else if (AttachmentData.FileName.includes("MasterFile")) {
                                            masterFileAttachments.push(AttachmentData.ServerRelativeUrl);
                                        }
                                    } else if (AttachmentData && AttachmentData.FileName) {
                                        const fileUrl = fixImgURL + AttachmentData.FileName;
                                        attachmentFiledata.push(fileUrl);

                                        // Separate filtering based on FileName
                                        if (AttachmentData.FileName.includes("CreatorFile")) {
                                            creatorFileAttachments.push(fileUrl);
                                        } else if (AttachmentData.FileName.includes("MasterFile")) {
                                            masterFileAttachments.push(fileUrl);
                                        }
                                    } else {
                                        attachmentFiledata.push(notFoundImage);
                                    }
                                });
                            } catch (error) {
                                console.error("Error parsing AttachmentFiles JSON:", error);
                                attachmentFiledata.push(notFoundImage);
                            }
                        } else {
                            attachmentFiledata = [];
                        }
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                MeetingDate: !!data.IncidentDate ? moment(data.IncidentDate).format(DateFormat) : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                ReportId: !!data.ReportId ? data.ReportId : '',
                                Attendees: !!data.Attendees ? data.Attendees : '',
                                Location: !!data.Location ? data.Location : '',
                                Subject: !!data.Subject ? data.Subject : '',
                                Chairperson: (!!data.ChairpersonId && data.ChairpersonId.length > 0) ? data.Chairperson.map((i: { Title: any; }) => i.Title) : '',
                                AttendeesEmail: (!!data.AttendeesEmail && data.AttendeesEmail.length > 0) ? data.AttendeesEmail.map((i: { Email: any; }) => i.Email) : '',
                                AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : [],
                                Attachment: attachmentFiledata,
                                CreatorAttachment: creatorFileAttachments,
                                MasterAttachment: masterFileAttachments,
                                AttachmentFiles: data.AttachmentFiles,
                                MasterComment: !!data.MasterComment ? data.MasterComment : '',
                            }
                        );
                    });
                    setMasterComment(UsersListData[0]?.MasterComment);
                    setCleanerName(UsersListData[0]?.Attendees);
                    setChairPersonName(UsersListData[0]?.Chairperson);
                    setToolboxTalk(UsersListData);
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

    const createRecordsForAttendees = () => {
        const {
            AttendeesEmailId,
            AttendeesEmail,
            Attendees,
        } = ToolboxTalk[0];

        // Map through each AttendeesEmailId to create the object
        const attendeeRecords = AttendeesEmailId.map((emailId: any, index: any) => {
            // Find matching record in _ToolboxTalkSignature based on QuaycleanEmployeeId
            const matchingSignature = SignatureData.find(
                (signature: any) => signature.QuaycleanEmployeeId === emailId
            );

            return {
                QuaycleanEmployeeEmail: AttendeesEmail[index],
                QuaycleanEmployeeId: emailId,
                Name: Attendees.split(", ")[index], // Splitting Attendees to get the correct name
                Signature: matchingSignature ? matchingSignature.Signature : "",
                Created: matchingSignature ? matchingSignature.Created : "",
            };
        });
        return attendeeRecords;
    };

    React.useEffect(() => {
        if (IsSD && ToolboxTalk.length > 0) {
            const generatedRecords = createRecordsForAttendees();
            seAllSignatureData(generatedRecords);
        }
    }, [IsSD, ToolboxTalk]);

    const [state, SetState] = React.useState<IHelpDeskFormState>({
        CallerOptions: [],
        CategoryOptions: [],
        EventOptions: [],
        isdisableField: !!isAddNewHelpDesk ? false : true,
        isAddNewHelpDesk: !!isAddNewHelpDesk,
        isformValidationModelOpen: false,
        validationMessage: null
    });

    const onclickSendEmail = () => {
        showPopup();
    };

    const _getToolboxIncidentMaster = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,SubTitle,DisplayOrder,SectionType,IsShow,IsComment,CommentTitle,IsDisplayBothTitle"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `IsShow eq 1`,
                listName: ListNames.ToolboxIncidentMaster,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        const matchingCommentData = AllMasterData?.filter(
                            (masterData) => masterData.ToolboxIncidentMasterId === data.ID
                        );
                        const isShow = matchingCommentData.length > 0 && matchingCommentData[0].IsShow === true;
                        const comment = matchingCommentData.length > 0 ? matchingCommentData[0].Comment : '';

                        return {
                            ID: data.ID,
                            Title: data.Title,
                            SubTitle: !!data.SubTitle ? data.SubTitle : '',
                            DisplayOrder: !!data.DisplayOrder ? data.DisplayOrder : 0,
                            SectionType: !!data.SectionType ? data.SectionType : '',
                            IsDisplayBothTitle: (data.IsDisplayBothTitle && data.IsDisplayBothTitle != null) ? data.IsDisplayBothTitle : false,
                            IsShow: isShow,
                            IsComment: (data.IsComment && data.IsComment != null) ? data.IsComment : false,
                            CommentTitle: !!data.CommentTitle ? data.CommentTitle : '',
                            Comment: comment
                        };
                    });

                    setToolboxTalkData(UsersListData);
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

    const _getToolboxIncidentDetails = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,QuestionType,Response,ToolboxIncidentMasterId,ToolboxIncidentMaster/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["ToolboxIncidentMaster"],
                listName: ListNames.ToolboxIncidentDetails,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        const matchingDetailsData = AllDetailData?.find(
                            (detailsDataItem) => detailsDataItem.ToolboxIncidentDetailsId === data.ID
                        );
                        const response = matchingDetailsData ? matchingDetailsData.Response : '';
                        return {
                            ID: data.ID,
                            Title: data.Title,
                            Response: response, // Updated response from DetailsData
                            ToolboxIncidentMasterId: !!data.ToolboxIncidentMasterId ? data.ToolboxIncidentMasterId : '',
                            ToolboxIncidentMaster: !!data.ToolboxIncidentMaster ? data.ToolboxIncidentMaster.Title : '',
                            outputStatus: response //
                        };
                    });
                    setToolboxTalkDetailsData(UsersListData);
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


    //Details Data
    const _getToolboxIncidentMasterData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,ToolboxIncidentMasterId,ToolboxIncidentMaster/Title,IsShow,Comment,MasterId,SiteNameId,SiteName/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["ToolboxIncidentMaster", "SiteName"],
                filter: `IsShow eq 1 and MasterId eq '${props?.siteMasterId}'`,
                listName: ListNames.ToolboxIncidentMasterData,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                IsShow: !!data.IsShow ? data.IsShow : '',
                                Comment: !!data.Comment ? data.Comment : '',
                                MasterId: !!data.MasterId ? data.MasterId : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                ToolboxIncidentMasterId: !!data.ToolboxIncidentMasterId ? data.ToolboxIncidentMasterId : '',
                                ToolboxIncidentMaster: !!data.ToolboxIncidentMaster ? data.ToolboxIncidentMaster.Title : ''
                            }
                        );
                    });
                    setAllMasterData(UsersListData);
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

    const _getToolboxIncidentDetailsData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,ToolboxIncidentDetailsId,ToolboxIncidentDetails/Title,Response,MasterId,SiteNameId,SiteName/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["ToolboxIncidentDetails", "SiteName"],
                filter: `MasterId eq '${props?.siteMasterId}'`,
                listName: ListNames.ToolboxIncidentDetailsData,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const UsersListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Response: !!data.Response ? data.Response : '',
                                MasterId: !!data.MasterId ? data.MasterId : '',
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                ToolboxIncidentDetailsId: !!data.ToolboxIncidentDetailsId ? data.ToolboxIncidentDetailsId : '',
                                ToolboxIncidentDetails: !!data.ToolboxIncidentDetails ? data.ToolboxIncidentDetails.Title : ''
                            }
                        );
                    });
                    setAllDetailData(UsersListData);
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
        let fileName: string = SiteName + '-Incident Report' + "-" + (!!ToolboxTalk[0]?.MeetingDate ? ToolboxTalk[0]?.MeetingDate : "");
        let fileblob: any = await generateAndSaveKendoPDF("DetailToolboxIncidentPDFCode", fileName, false, true);
        setIsLoading(false);
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
            let fileName: string = SiteName + '-Incident Report' + "-" + (!!ToolboxTalk[0]?.MeetingDate ? ToolboxTalk[0]?.MeetingDate : "");
            let fileBlob: any = await generateAndSaveKendoPDF("DetailToolboxIncidentPDFCode", fileName, false);
            const file: IFileWithBlob = {
                file: fileBlob,
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
                EmailType: "ToolboxIncident",
                Cleaner: CleanerName
            };
            props.provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                props.provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
                    console.log("Upload Success");
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: props?.componentProps?.originalSiteMasterId || ToolboxTalk[0]?.SiteNameId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.SendEmail,
                        EntityType: UserActionEntityTypeEnum.IncidentReport,
                        // EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        EntityName: title, // Match index dynamically
                        Details: `Send Email Toolbox Incident to ${sendToEmail}`,
                        LogFor: UserActionLogFor.Both,
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

    const _getToolboxIncidentSignature = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Signature,QuaycleanEmployeeId,QuaycleanEmployee/Email,QuaycleanEmployee/FirstName,QuaycleanEmployee/LastName,ToolboxIncidentId,Created"];
            const expand = ["QuaycleanEmployee"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                filter: `ToolboxIncidentId eq ${props?.siteMasterId}`,
                listName: ListNames.ToolboxIncidentSignature,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const SignatureData = results.map((data) => {
                        return {
                            ID: data.ID,
                            QuaycleanEmployeeId: !!data.QuaycleanEmployeeId ? data.QuaycleanEmployeeId : '',
                            QuaycleanEmployeeEmail: !!data.QuaycleanEmployeeId ? data.QuaycleanEmployee.Email : '',
                            ToolboxIncidentId: !!data.ToolboxIncidentId ? data.ToolboxIncidentId : '',
                            Signature: !!data.Signature ? data.Signature : '',
                            Name: !!data.QuaycleanEmployeeId ? data.QuaycleanEmployee.FirstName + " " + data.QuaycleanEmployee.LastName : '',
                            Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
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

        _getToolboxIncidentSignature();
        _getToolboxIncident();
        _getToolboxIncidentMasterData();
        _getToolboxIncidentDetailsData();

    }, []);
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
            let orgSiteId = props?.componentProps?.originalSiteMasterId || ToolboxTalk[0]?.SiteNameId;
            let data = await getState(orgSiteId);
            if (props?.componentProps?.qCStateId || data[0]?.QCStateId) {
                const todayDate = moment().format("YYYY-MM-DD");
                const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    listName: ListNames.UserActivityLog,
                    filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityId eq '${props?.siteMasterId}' and SiteNameId eq '${orgSiteId}' and EntityType eq '${UserActionEntityTypeEnum.IncidentReport}' and ActionType eq 'Details View' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
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
                        EntityType: UserActionEntityTypeEnum.IncidentReport,
                        EntityId: props?.siteMasterId,
                        EntityName: ToolboxTalk[0]?.ReportId,
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
        if (!!ToolboxTalk && ToolboxTalk.length > 0 && ToolboxTalk[0]?.ReportId !== undefined && isCall.current == true) {
            isCall.current = false;
            _userActivityLog();
        }
    }, [ToolboxTalk]);


    React.useEffect(() => {
        if (AllMasterData.length > 0)
            _getToolboxIncidentMaster();
    }, [AllMasterData]);

    React.useEffect(() => {
        if (AllDetailData.length > 0)
            _getToolboxIncidentDetails();
    }, [AllDetailData]);

    const onClickClose = () => {
        // if (props?.componentProps?.originalSiteMasterId) {
        //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
        //     props.manageComponentView({
        //         currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.qCStateId, view: props.componentProps.viewType, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "ToolboxIncident",
        //     });
        // } 
        if (isSiteLevelComponent) {
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                selectedZoneDetails: selectedZoneDetails,
                isShowDetailOnly: true,
                pivotName: "IMSKey",
                subpivotName: "ToolboxIncident",
            });
        }
        else {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, view: props.componentProps.viewType, breadCrumItems: breadCrumItems, subpivotName: "ToolboxIncident" });
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

        <div className="incident-Detail">
            <div className="ms-Grid">
                {ToolboxTalk.length > 0 &&
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            {/* <div id="ToolboxTalk" className="asset-card-2-header-jcc-2 margin-bot-80"> */}
                            <div
                                id="ToolboxTalk"
                                className={`margin-bot-80 ${!props.hidebtn
                                    ? "asset-card-2-header-jcc-2"
                                    : "asset-card-2-header-jcc-2-nopad"
                                    }`}
                            >
                                {!props.hidebtn && <div className="formGroup btnStickyDetails noExport">
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
                                </div>}
                                <div className="">
                                    <div className={`${!props.hidebtn
                                        ? "boxCard"
                                        : ""
                                        }`}>
                                        <div id="DetailToolboxIncidentPDFCode">
                                            <div className="head-tbl-space">
                                                <table className="table-toolbox-talk cell-space-0" style={{ width: "100%", border: "1px solid black" }} >
                                                    <tr>
                                                        <th className="th-toolbox-talk-logo pl-10 bg-white br-1" > <img src={imgLogo} height="30px" className="course-img-first img-mt qclogoims" /></th>
                                                        <td className="td-toolbox-talk middle-box"><div>NCR & Incident Report</div></td>
                                                        <td className="td-toolbox-talk blue-box pl-10"><div>Document No</div><div>QC-CP-08-F2</div></td>
                                                    </tr>
                                                </table>
                                            </div>
                                            <div className="meeting-id-cls"><div className="td-toolbox-talk blue-text dflex justify-content-end meeting-spc-cls"><div className="toggle-className">NCR and Incident Report: {ToolboxTalk[0]?.ReportId}</div></div></div>
                                            <div className="asset-card-2-header-jcc">
                                                <div className="table-toolbox-talk mt-3">
                                                    <div className="row">
                                                        <div className="td-toolbox-talk-detail"><b>Date:</b></div>
                                                        <div className="td-toolbox-talk-detail">{ToolboxTalk[0]?.MeetingDate}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="td-toolbox-talk-detail"><b>Subject:</b></div>
                                                        <div className="td-toolbox-talk-detail">{ToolboxTalk[0]?.Subject}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="td-toolbox-talk-detail"><b>Job Site:</b></div>
                                                        <div className="td-toolbox-talk-detail">{ToolboxTalk[0]?.SiteName}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="td-toolbox-talk-detail"><b>Location:</b></div>
                                                        <div className="td-toolbox-talk-detail">{ToolboxTalk[0]?.Location}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="td-toolbox-talk-detail"><b>Incident recorded by:</b></div>
                                                        <div className="td-toolbox-talk-detail">{ChairPersonName}</div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="td-toolbox-talk-detail"><b>Incident reported by:</b></div>
                                                        {/* <div className="td-toolbox-talk-detail">{ToolboxTalk[0]?.Attendees}</div> */}
                                                        <div className="td-toolbox-talk-detail badge-css-attendees">
                                                            {
                                                                ToolboxTalk[0]?.Attendees.split(',').map((name: any) => (
                                                                    <span className="attendees-badge-cls" key={name.trim()}>
                                                                        {name.trim()}
                                                                    </span>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                </div>


                                                <div>
                                                    <div>
                                                        {ToolboxTalkData.map((item: any) => {
                                                            // Check if item.IsShow is true
                                                            if (item.IsShow) {
                                                                const details = ToolboxTalkDetailsData.filter((detail: any) => detail.ToolboxIncidentMasterId === item.ID);

                                                                const isMainTitle = !item.SubTitle || item.IsDisplayBothTitle;
                                                                const titleText = isMainTitle ? item.Title : item.SubTitle;
                                                                const titleClass = isMainTitle ? "main-header-text mt-3 dflex" : "sub-main-header-text mt-2 dflex";
                                                                const isDisplayTitle = (titleText == "Basic Detail") ? false : true;

                                                                return (
                                                                    <div key={item.ID} className="">
                                                                        {/* <div className="sub-main-header-text mt-3"> */}
                                                                        {isDisplayTitle == true && (
                                                                            <div className={titleClass}>
                                                                                {/* {item.Title} */}
                                                                                {titleText}
                                                                            </div>
                                                                        )}

                                                                        {item.IsDisplayBothTitle == true && (
                                                                            <div className="sub-main-header-text mt-2">
                                                                                {item.SubTitle}
                                                                            </div>
                                                                        )}

                                                                        {(details.length > 0) && item.SectionType === "MultiQuestions" ? (
                                                                            <table cellSpacing="0" className="sub-toolbox-table mt-2 ">
                                                                                <thead>
                                                                                    <tr className="sub-toolbox-tr">
                                                                                        <th className="sub-toolbox-th">Item</th>
                                                                                        <th className="sub-toolbox-th">Response</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {details.map((detail: any) => (
                                                                                        <tr className="sub-toolbox-tr keep-together" key={detail.ID}>
                                                                                            <td className="sub-toolbox-td-item">{detail.Title}</td>
                                                                                            <td className="sub-toolbox-td-item">{detail.outputStatus}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        ) : (
                                                                            <div className="mt-1"></div>
                                                                        )}

                                                                        {item.SectionType === "RichTextbox" && (
                                                                            <div className="keep-together">
                                                                                {item.SubTitle === "Nature/Extent of Damage" && (
                                                                                    <ToolboxAttachments ToolboxTalk={ToolboxTalk} Type="Creator" />
                                                                                )}
                                                                                <div className="mt-1 toolbox-detail richTextrenderUlLi">
                                                                                    {item.Comment !== "" ? (
                                                                                        <div className="mb-10" dangerouslySetInnerHTML={{ __html: item.Comment }} />
                                                                                    ) : (
                                                                                        <div className="mb-10">N/A</div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {item.IsComment && (
                                                                            <div className="keep-together">
                                                                                <div className="sub-main-header-text mt-2"><b>{item.CommentTitle ? item.CommentTitle : "Comments"}</b></div>
                                                                                <div className="mt-1 toolbox-detail richTextrenderUlLi">
                                                                                    {item.Comment !== "" ? (
                                                                                        <div className="mb-10" dangerouslySetInnerHTML={{ __html: item.Comment }} />

                                                                                    ) : (
                                                                                        <div className="mb-10">N/A</div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            }
                                                            // Return null if item.IsShow is not true
                                                            return null;
                                                        })}

                                                    </div>
                                                </div>
                                            </div>
                                            <div className="keep-together mar-left-signature">

                                                <ToolboxAttachments ToolboxTalk={ToolboxTalk} Type="Master" />

                                                <div className="mt-1 toolbox-detail richTextrenderUlLi">
                                                    {MasterComment !== "" ? (
                                                        <div className="mb-10" dangerouslySetInnerHTML={{ __html: MasterComment }} />
                                                    ) : (
                                                        <div className="mb-10">N/A</div>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                {AllSignatureData.length > 0 && AllSignatureData.map((item: any, index: number) => (
                                                    // <div className="signature-container mb-5" key={item.QuaycleanEmployeeId}> {/* Add a unique key */}
                                                    <>
                                                        <div
                                                            className={`signature-container mb-5 ${(index === 0 || (index + 1) % 8 === 0) ? 'page-break' : ''}`}
                                                            key={item.QuaycleanEmployeeId}
                                                        >
                                                            {index === 0 &&
                                                                <div className="main-header-text-signature mt-3">Cleaner Signature</div>}

                                                            <div className="Signature-cls">
                                                                <div className="new-sig-cls">
                                                                    <div className="signature-title"><b>Signature: </b></div>
                                                                    <div className="signature-width">
                                                                        {item.Signature != "" &&
                                                                            <img src={item.Signature} alt="Signature" className="signature-image" />}
                                                                    </div>
                                                                </div>
                                                                <div className="signature-details-view mar-left-67">
                                                                    {item.Created !== "" ?
                                                                        <span className="signature-created">{item.Name} - {item.Created}</span> :
                                                                        <span className="signature-created">{item.Name}</span>}
                                                                </div>
                                                            </div>
                                                            <div className="signature-email"><b>Email: </b><span className="sub-email">{item.QuaycleanEmployeeEmail}</span></div>

                                                        </div>
                                                    </>
                                                ))}
                                            </div>
                                            {!props.hidebtn && <div className="asset-card-2-header-jcc-2 mar-bot-40 noExport">
                                                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 toolkit-btn">
                                                    <PrimaryButton
                                                        style={{ marginBottom: "5px", marginTop: "10px" }}
                                                        className="btn btn-danger"
                                                        text="Close"
                                                        onClick={onClickClose}

                                                    />
                                                </div>
                                            </div>}
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                }
            </div>
        </div>
    </>
};