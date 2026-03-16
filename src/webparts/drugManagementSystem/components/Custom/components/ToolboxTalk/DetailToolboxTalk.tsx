// /* eslint-disable react/jsx-key */
// /* eslint-disable @typescript-eslint/no-use-before-define */
// import { Panel, PanelType, PrimaryButton } from "@fluentui/react";
// import * as React from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { useBoolean } from "@fluentui/react-hooks";
// import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
// import { toastService } from "../../../../../../Common/ToastService";
// import { logGenerator, removeElementOfBreadCrum, generateAndSaveKendoPDF, UserActivityLog } from "../../../../../../Common/Util";
// import { IFileWithBlob } from "../../../../../../DataProvider/Interface/IFileWithBlob";
// import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
// import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../../Interfaces/IAddNewHelpDesk";
// import CommonPopup from "../../../CommonComponents/CommonSendEmailPopup";
// import CustomModal from "../../../CommonComponents/CustomModal";
// import { Loader } from "../../../CommonComponents/Loader";
// import moment from "moment";
// import ToolboxAttachments from "../../../CommonComponents/ToolboxAttachments ";
// import { useAtomValue } from "jotai";
// import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
// import { DateFormat, DateTimeFormate } from "../../../../../../Common/Constants/CommonConstants";
// import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
// import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
// import QuaysafeSignatureBlocks from "../SignatureBlock";
// const imgLogo = require('../../../../assets/images/logo.png');

// export const DetailToolboxTalk: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
//     const [value, setValue] = React.useState(props.initialValue);
//     const [isLoading, setIsLoading] = React.useState<boolean>(false);
//     const appGlobalState = useAtomValue(appGlobalStateAtom);
//     const { currentUserRoleDetail } = appGlobalState;
//     const selectedZoneDetails = useAtomValue(selectedZoneAtom);
//     const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
//     const isCall = React.useRef<boolean>(true);
//     const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
//     const [SiteData, setSiteData] = React.useState<any[]>([]);
//     const [ToolboxTalk, setToolboxTalk] = React.useState<any[]>([]);
//     const [SignatureData, setSignatureData] = React.useState<any[]>([]);
//     const [IsSD, setIsSD] = React.useState<boolean>(false);
//     const [ToolboxTalkData, setToolboxTalkData] = React.useState<any[]>([]);
//     const [ToolboxTalkDetailsData, setToolboxTalkDetailsData] = React.useState<any[]>([]);
//     const [AllMasterData, setAllMasterData] = React.useState<any[]>([]);
//     const [AllDetailData, setAllDetailData] = React.useState<any[]>([]);
//     const [SiteName, setSiteName] = React.useState<any>(props?.componentProps?.siteName);
//     const [StateName, setStateName] = React.useState<string>();
//     const [title, setTitle] = React.useState<string>("");
//     const [sendToEmail, setSendToEmail] = React.useState<string>("");
//     const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
//     const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
//     const [displayerror, setDisplayError] = React.useState<boolean>(false);
//     const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
//     const notFoundImage = require('../../../../../quayClean/assets/images/NotFoundImg.png');
//     const [AllSignatureData, seAllSignatureData] = React.useState<any[]>([]);

//     const [imageURL, setImageURL] = React.useState("");
//     const [showModal, setShowModal] = React.useState(false);
//     const toggleModal = (imgURL: string | undefined) => {
//         setImageURL(imgURL ? imgURL : "");
//         setShowModal(!showModal);
//     };


//     const _ToolboxTalk = () => {
//         setIsLoading(true);
//         try {
//             const select = ["ID,MeetingDate,Subject,Location,ShiftType,ChairpersonId,Chairperson/Title,Chairperson/Name,SiteNameId,SiteName/Title,MeetingID,Attendees,MinutesTakenAndRecordedBy,DiscussionPoints,MattersfromPreviousMeetings,NewMattersforDiscussion,Comments,Attachments,AttachmentFiles,AttendeesEmailId,AttendeesEmail/Email"];
//             const queryStringOptions: IPnPQueryOptions = {
//                 select: select,
//                 expand: ["SiteName", "Chairperson", "AttachmentFiles", "AttendeesEmail"],
//                 filter: `Id eq '${props?.siteMasterId}'`,
//                 listName: ListNames.ToolboxTalk,
//             };
//             props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
//                 if (!!results) {
//                     const UsersListData = results.map((data) => {
//                         const fixImgURL = `${props.context.pageContext.web.serverRelativeUrl}/Lists/ToolboxTalk/Attachments/${data.ID}/`;
//                         let attachmentFiledata: string[] = []; // Array to hold all attachment URLs
//                         if (data.AttachmentFiles.length > 0) {
//                             try {
//                                 data.AttachmentFiles.forEach((AttachmentData: { ServerRelativeUrl: string; FileName: string; }) => {
//                                     if (AttachmentData && AttachmentData.ServerRelativeUrl) {
//                                         attachmentFiledata.push(AttachmentData.ServerRelativeUrl);
//                                     } else if (AttachmentData && AttachmentData.FileName) {
//                                         attachmentFiledata.push(fixImgURL + AttachmentData.FileName);
//                                     } else {
//                                         attachmentFiledata.push(notFoundImage);
//                                     }
//                                 });
//                             } catch (error) {
//                                 console.error("Error parsing AttachmentFiles JSON:", error);
//                                 attachmentFiledata.push(notFoundImage);
//                             }
//                         } else {
//                             attachmentFiledata = [];
//                         }
//                         return (
//                             {
//                                 ID: data.ID,
//                                 Title: data.Title,
//                                 MeetingDate: !!data.MeetingDate ? moment(data.MeetingDate).format(DateFormat) : '',
//                                 SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
//                                 SiteName: !!data.SiteName ? data.SiteName.Title : '',
//                                 MeetingID: !!data.MeetingID ? data.MeetingID : '',
//                                 Attendees: !!data.Attendees ? data.Attendees : '',
//                                 Location: !!data.Location ? data.Location : '',
//                                 ShiftType: !!data.ShiftType ? data.ShiftType : '',
//                                 Subject: !!data.Subject ? data.Subject : '',
//                                 MinutesTakenAndRecordedBy: !!data.MinutesTakenAndRecordedBy ? data.MinutesTakenAndRecordedBy : '',
//                                 DiscussionPoints: !!data.DiscussionPoints ? data.DiscussionPoints : '',
//                                 MattersfromPreviousMeetings: !!data.MattersfromPreviousMeetings ? data.MattersfromPreviousMeetings : '',
//                                 NewMattersforDiscussion: !!data.NewMattersforDiscussion ? data.NewMattersforDiscussion : '',
//                                 Comments: !!data.Comments ? data.Comments : '',
//                                 Chairperson: (!!data.ChairpersonId && data.ChairpersonId.length > 0) ? data.Chairperson.map((i: { Title: any; }) => i.Title) : '',
//                                 AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : '',
//                                 AttendeesEmail: (!!data.AttendeesEmail && data.AttendeesEmail.length > 0) ? data.AttendeesEmail.map((i: { Email: any; }) => i.Email) : '',
//                                 Attachment: attachmentFiledata,
//                             }
//                         );
//                     });
//                     setToolboxTalk(UsersListData);
//                     setIsLoading(false);
//                 }
//             }).catch((error: any) => {
//                 console.log(error);
//                 const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
//                 void logGenerator(props.provider, errorObj);
//                 setIsLoading(false);
//             });
//         } catch (ex) {
//             console.log(ex);
//             const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
//             void logGenerator(props.provider, errorObj);
//             setIsLoading(false);
//         }
//     };
//     const getState = (siteNameId: any) => {
//         try {
//             let queryOptions: IPnPQueryOptions = {
//                 listName: ListNames.SitesMaster,
//                 select: ["Id", "QCStateId"],
//                 filter: `Id eq ${siteNameId}`
//             };
//             return props.provider.getItemsByQuery(queryOptions);
//         } catch (error) {
//             console.log(error);
//             setIsLoading(false);
//         }
//         return [];
//     };

//     const _userActivityLog = async () => {
//         try {
//             let orgSiteId = props?.componentProps?.originalSiteMasterId || ToolboxTalk[0].SiteNameId;
//             let data = await getState(orgSiteId);
//             if (props?.componentProps?.qCStateId || data[0]?.QCStateId) {
//                 const todayDate = moment().format("YYYY-MM-DD");
//                 const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
//                 const queryStringOptions: IPnPQueryOptions = {
//                     select: select,
//                     listName: ListNames.UserActivityLog,
//                     filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityId eq '${props?.siteMasterId}' and SiteNameId eq '${orgSiteId}' and EntityType eq '${UserActionEntityTypeEnum.ToolboxTalk}' and ActionType eq 'Details View' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
//                 };
//                 const results = await props.provider.getItemsByQuery(queryStringOptions);
//                 if (results && results.length > 0) {
//                     const listData = results.map((data) => ({
//                         ID: data.ID,
//                         Count: data.Count ?? '',
//                     }));
//                     let updateObj = {
//                         Count: listData[0]?.Count + 1,
//                     };
//                     await props.provider.updateItemWithPnP(updateObj, ListNames.UserActivityLog, Number(listData[0]?.ID));
//                 } else {
//                     const logObj = {
//                         UserName: currentUserRoleDetail?.title,
//                         SiteNameId: orgSiteId,
//                         ActionType: UserActivityActionTypeEnum.DetailsView,
//                         Email: currentUserRoleDetail?.emailId,
//                         EntityType: UserActionEntityTypeEnum.ToolboxTalk,
//                         EntityId: props?.siteMasterId,
//                         EntityName: ToolboxTalk[0]?.MeetingID,
//                         Count: 1,
//                         Details: "Details View",
//                         StateId: props?.componentProps?.qCStateId || data[0]?.QCStateId,
//                         LogFor: UserActionLogFor.Both
//                     };
//                     void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
//                 }
//                 isCall.current = false;
//             }
//         } catch (error) {
//             console.error("Error fetching user activity log:", error);
//         } finally {
//             // setIsLoading(false);
//         }

//     };
//     React.useEffect(() => {
//         if (!!ToolboxTalk && ToolboxTalk.length > 0 && ToolboxTalk[0]?.MeetingID !== undefined && isCall.current == true) {
//             isCall.current = false;
//             _userActivityLog();
//         }
//     }, [ToolboxTalk]);

//     const createRecordsForAttendees = () => {
//         const {
//             AttendeesEmailId,
//             AttendeesEmail,
//             Attendees,
//         } = ToolboxTalk[0];

//         // Map through each AttendeesEmailId to create the object
//         const attendeeRecords = AttendeesEmailId.map((emailId: any, index: any) => {
//             // Find matching record in _ToolboxTalkSignature based on QuaycleanEmployeeId
//             const matchingSignature = SignatureData.find(
//                 (signature: any) => signature.QuaycleanEmployeeId === emailId
//             );

//             return {
//                 QuaycleanEmployeeEmail: AttendeesEmail[index],
//                 QuaycleanEmployeeId: emailId,
//                 Name: Attendees.split(", ")[index], // Splitting Attendees to get the correct name
//                 Signature: matchingSignature ? matchingSignature.Signature : "",
//                 Created: matchingSignature ? matchingSignature.Created : "",
//             };
//         });
//         return attendeeRecords;
//     };
//     React.useEffect(() => {
//         if (IsSD && ToolboxTalk.length > 0) {
//             const generatedRecords = createRecordsForAttendees();
//             seAllSignatureData(generatedRecords);
//         }
//     }, [IsSD, ToolboxTalk]);

//     const [state, SetState] = React.useState<IHelpDeskFormState>({
//         CallerOptions: [],
//         CategoryOptions: [],
//         EventOptions: [],
//         isdisableField: !!isAddNewHelpDesk ? false : true,
//         isAddNewHelpDesk: !!isAddNewHelpDesk,
//         isformValidationModelOpen: false,
//         validationMessage: null
//     });

//     const onclickSendEmail = () => {
//         showPopup();
//     };

//     const _ToolboxTalkData = () => {
//         setIsLoading(true);
//         try {
//             const select = ["ID,Title,IsShow,IsComment"];
//             const queryStringOptions: IPnPQueryOptions = {
//                 select: select,
//                 filter: `IsShow eq 1`,
//                 listName: ListNames.ToolboxTalkMaster,
//             };
//             props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
//                 if (!!results) {
//                     const UsersListData = results.map((data) => {
//                         const matchingCommentData = AllMasterData?.filter(
//                             (masterData) => masterData.ToolboxTalkMasterId === data.ID
//                         );
//                         const isShow = matchingCommentData.length > 0 && matchingCommentData[0].IsShow === true;
//                         const comment = matchingCommentData.length > 0 ? matchingCommentData[0].Comment : '';

//                         return {
//                             ID: data.ID,
//                             Title: data.Title,
//                             IsShow: isShow,
//                             IsComment: !!data.IsComment ? data.IsComment : '',
//                             Comment: comment // Add Comment if match found
//                         };
//                     });

//                     setToolboxTalkData(UsersListData);
//                     setIsLoading(false);
//                 }
//             }).catch((error: any) => {
//                 console.log(error);
//                 const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
//                 void logGenerator(props.provider, errorObj);
//                 setIsLoading(false);
//             });
//         } catch (ex) {
//             console.log(ex);
//             const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
//             void logGenerator(props.provider, errorObj);
//             setIsLoading(false);
//         }
//     };

//     const _ToolboxTalkDetailsData = () => {
//         setIsLoading(true);
//         try {
//             const select = ["ID,Title,Response,ToolboxTalkMasterId,ToolboxTalkMaster/Title"];
//             const queryStringOptions: IPnPQueryOptions = {
//                 select: select,
//                 expand: ["ToolboxTalkMaster"],
//                 listName: ListNames.ToolboxTalkDetails,
//             };
//             props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
//                 if (!!results) {
//                     const UsersListData = results.map((data) => {
//                         const matchingDetailsData = AllDetailData?.find(
//                             (detailsDataItem) => detailsDataItem.ToolboxTalkDetailsId === data.ID
//                         );
//                         const response = matchingDetailsData ? matchingDetailsData.Response : '';
//                         return {
//                             ID: data.ID,
//                             Title: data.Title,
//                             Response: response, // Updated response from DetailsData
//                             ToolboxTalkMasterId: !!data.ToolboxTalkMasterId ? data.ToolboxTalkMasterId : '',
//                             ToolboxTalkMaster: !!data.ToolboxTalkMaster ? data.ToolboxTalkMaster.Title : '',
//                             outputStatus: response // Add outputStatus field with the matched response
//                         };
//                     });
//                     setToolboxTalkDetailsData(UsersListData);
//                     setIsLoading(false);
//                 }

//             }).catch((error: any) => {
//                 console.log(error);
//                 const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
//                 void logGenerator(props.provider, errorObj);
//                 setIsLoading(false);
//             });
//         } catch (ex) {
//             console.log(ex);
//             const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
//             void logGenerator(props.provider, errorObj);
//             setIsLoading(false);
//         }
//     };


//     //Details Data
//     const MasterData = () => {
//         setIsLoading(true);
//         try {
//             const select = ["ID,ToolboxTalkMasterId,ToolboxTalkMaster/Title,IsShow,Comment,MasterId,SiteNameId,SiteName/Title"];
//             const queryStringOptions: IPnPQueryOptions = {
//                 select: select,
//                 expand: ["ToolboxTalkMaster", "SiteName"],
//                 filter: `IsShow eq 1 and MasterId eq '${props?.siteMasterId}'`,
//                 listName: ListNames.ToolboxTalkMasterData,
//             };
//             props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
//                 if (!!results) {
//                     const UsersListData = results.map((data) => {
//                         return (
//                             {
//                                 ID: data.ID,
//                                 IsShow: !!data.IsShow ? data.IsShow : '',
//                                 Comment: !!data.Comment ? data.Comment : '',
//                                 MasterId: !!data.MasterId ? data.MasterId : '',
//                                 SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
//                                 SiteName: !!data.SiteName ? data.SiteName.Title : '',
//                                 ToolboxTalkMasterId: !!data.ToolboxTalkMasterId ? data.ToolboxTalkMasterId : '',
//                                 ToolboxTalkMaster: !!data.ToolboxTalkMaster ? data.ToolboxTalkMaster.Title : ''
//                             }
//                         );
//                     });
//                     setAllMasterData(UsersListData);
//                     setIsLoading(false);
//                 }
//             }).catch((error: any) => {
//                 console.log(error);
//                 const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
//                 void logGenerator(props.provider, errorObj);
//                 setIsLoading(false);
//             });
//         } catch (ex) {
//             console.log(ex);
//             const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
//             void logGenerator(props.provider, errorObj);
//             setIsLoading(false);
//         }
//     };

//     const DetailsData = () => {
//         setIsLoading(true);
//         try {
//             const select = ["ID,ToolboxTalkDetailsId,ToolboxTalkDetails/Title,Response,MasterId,SiteNameId,SiteName/Title"];
//             const queryStringOptions: IPnPQueryOptions = {
//                 select: select,
//                 expand: ["ToolboxTalkDetails", "SiteName"],
//                 filter: `MasterId eq '${props?.siteMasterId}'`,
//                 listName: ListNames.ToolboxTalkDetailsData,
//             };
//             props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
//                 if (!!results) {
//                     const UsersListData = results.map((data) => {
//                         return (
//                             {
//                                 ID: data.ID,
//                                 Response: !!data.Response ? data.Response : '',
//                                 MasterId: !!data.MasterId ? data.MasterId : '',
//                                 SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
//                                 SiteName: !!data.SiteName ? data.SiteName.Title : '',
//                                 ToolboxTalkDetailsId: !!data.ToolboxTalkDetailsId ? data.ToolboxTalkDetailsId : '',
//                                 ToolboxTalkDetails: !!data.ToolboxTalkDetails ? data.ToolboxTalkDetails.Title : ''
//                             }
//                         );
//                     });
//                     setAllDetailData(UsersListData);
//                     setIsLoading(false);
//                 }
//             }).catch((error: any) => {
//                 console.log(error);
//                 const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
//                 void logGenerator(props.provider, errorObj);
//                 setIsLoading(false);
//             });
//         } catch (ex) {
//             console.log(ex);
//             const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
//             void logGenerator(props.provider, errorObj);
//             setIsLoading(false);
//         }
//     };

//     const onClickCancel = (): void => {
//         resetForm();
//         hidePopup();
//     };

//     const resetForm = (): void => {
//         setTitle("");
//         setSendToEmail("");
//         setDisplayErrorTitle(false);
//         setDisplayErrorEmail(false);
//         setDisplayError(false);
//     };

//     const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
//         setTitle(newValue || "");
//         if (newValue) {
//             setDisplayErrorTitle(false);
//         }
//     };

//     const onChangeSendToEmail = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
//         setSendToEmail(newValue || "");
//         if (newValue) {
//             setDisplayErrorEmail(false);
//             setDisplayErrorEmail(false);
//         }
//         const enteredValue = newValue;
//         const emailPattern = /^([^\s@]+@[^\s@]+\.[^\s@]+)(\s*;\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/;
//         if (!enteredValue || emailPattern.test(enteredValue)) {
//             setDisplayError(false);
//         } else {
//             setDisplayError(true);
//         }
//     };


//     const onClickDownload = async (): Promise<void> => {
//         setIsLoading(true);
//         let fileName: string = SiteName + '-Toolbox Talk' + "-" + (!!ToolboxTalk[0]?.MeetingDate ? ToolboxTalk[0]?.MeetingDate : "");
//         let fileblob: any = await generateAndSaveKendoPDF("DetailToolboxTalkPDFCode", fileName, false, true);
//         setIsLoading(false);
//     };

//     const onClickSendEmail = async (): Promise<void> => {
//         setIsLoading(true);
//         const isTitleEmpty = !title;
//         const isEmailEmpty = !sendToEmail;
//         const isEmailInvalid = !isEmailEmpty && !sendToEmail?.split(';').every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));

//         setDisplayErrorTitle(isTitleEmpty);
//         setDisplayErrorEmail(isEmailEmpty);
//         setDisplayError(isEmailInvalid);

//         if (!isTitleEmpty && !isEmailEmpty && !isEmailInvalid) {
//             // const fileName = `${SiteName} Toolbox Talk.pdf`;
//             let fileName: string = SiteName + '-Toolbox Talk' + "-" + (!!ToolboxTalk[0]?.MeetingDate ? ToolboxTalk[0]?.MeetingDate : "");
//             let fileblob: any = await generateAndSaveKendoPDF("DetailToolboxTalkPDFCode", fileName, false);
//             const file: IFileWithBlob = {
//                 file: fileblob,
//                 name: `${fileName}.pdf`,
//                 overwrite: true
//             };
//             let toastMessage: string = "";
//             const toastId = toastService.loading('Loading...');
//             toastMessage = 'Email sent successfully!';
//             let insertData: any = {
//                 Title: title,
//                 SendToEmail: sendToEmail,
//                 StateName: StateName,
//                 SiteName: SiteName,
//                 EmailType: "ToolboxTalk"
//             };
//             props.provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
//                 props.provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
//                     console.log("Upload Success");
//                     const logObj = {
//                         UserName: currentUserRoleDetail?.title,
//                         SiteNameId: props?.componentProps?.originalSiteMasterId || ToolboxTalk[0].SiteNameId, // Match index dynamically
//                         ActionType: UserActivityActionTypeEnum.SendEmail,
//                         EntityType: UserActionEntityTypeEnum.ToolboxTalk,
//                         // EntityId: UpdateItem[index]?.ID, // Use res dynamically
//                         EntityName: title, // Match index dynamically
//                         Details: `Send Email Toolbox Talk to ${sendToEmail}`,
//                         StateId: props?.componentProps?.qCStateId,
//                         LogFor: UserActionLogFor.Both
//                     };
//                     void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
//                 }).catch((err: any) => console.log(err));
//                 toastService.updateLoadingWithSuccess(toastId, toastMessage);
//                 onClickCancel();
//                 setIsLoading(false);
//             }).catch((err: any) => console.log(err));
//         } else {
//             setIsLoading(false);
//         }
//     };


//     const _ToolboxTalkSignature = () => {
//         setIsLoading(true);
//         try {
//             const select = ["ID,Signature,QuaycleanEmployeeId,QuaycleanEmployee/Email,QuaycleanEmployee/FirstName,QuaycleanEmployee/LastName,ToolboxTalkId,Created"];
//             const expand = ["QuaycleanEmployee"];
//             const queryStringOptions: IPnPQueryOptions = {
//                 select: select,
//                 expand: expand,
//                 filter: `ToolboxTalkId eq ${props?.siteMasterId}`,
//                 listName: ListNames.ToolboxTalkSignature,
//             };
//             props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
//                 if (!!results) {
//                     const SignatureData = results.map((data) => {
//                         return {
//                             ID: data.ID,
//                             QuaycleanEmployeeId: !!data.QuaycleanEmployeeId ? data.QuaycleanEmployeeId : '',
//                             QuaycleanEmployeeEmail: !!data.QuaycleanEmployeeId ? data.QuaycleanEmployee.Email : '',
//                             ToolboxTalkId: !!data.ToolboxTalkId ? data.ToolboxTalkId : '',
//                             Signature: !!data.Signature ? data.Signature : '',
//                             Name: !!data.QuaycleanEmployeeId ? data.QuaycleanEmployee.FirstName + " " + data.QuaycleanEmployee.LastName : '',
//                             Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
//                         };
//                     });
//                     setSignatureData(SignatureData);
//                     setIsLoading(false);
//                     setTimeout(() => {
//                         setIsSD(true);
//                     }, 500);

//                 }
//             }).catch((error: any) => {
//                 console.log(error);
//                 const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
//                 void logGenerator(props.provider, errorObj);
//                 setIsLoading(false);
//             });
//         } catch (ex) {
//             console.log(ex);
//             const errorObj = { ErrorMethodName: "_QuestionData", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
//             void logGenerator(props.provider, errorObj);
//             setIsLoading(false);
//         }
//     };

//     React.useEffect(() => {
//         if (props?.componentProps?.originalState) {
//             setStateName(props.componentProps.originalState)
//         }
//         _ToolboxTalkSignature();
//         // _siteData();
//         _ToolboxTalk();
//         MasterData();
//         DetailsData();

//     }, []);


//     React.useEffect(() => {
//         if (AllMasterData.length > 0)
//             _ToolboxTalkData();
//     }, [AllMasterData]);

//     React.useEffect(() => {
//         if (AllDetailData.length > 0)
//             _ToolboxTalkDetailsData();
//     }, [AllDetailData]);

//     const onClickClose = () => {
//         if (isSiteLevelComponent) {
//             props.manageComponentView({
//                 currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
//                 selectedZoneDetails: selectedZoneDetails,
//                 isShowDetailOnly: true,
//                 pivotName: "IMSKey",
//                 subpivotName: "ToolboxTalk",
//             });
//         }
//         else {
//             const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
//             manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, breadCrumItems: breadCrumItems, view: props.componentProps.viewType, subpivotName: "ToolboxTalk" });
//         }
//     };

//     const renderAttendees = (attendees: any) => {
//         const attendeesList = attendees.split(", "); // Split by comma and space
//         const displayNames = attendeesList;
//         return (
//             <>
//                 {displayNames.map((name: any, index: any) => (
//                     <span key={index} className="attendees-badge-cls">{name}</span>
//                 ))}
//             </>
//         );
//     };

//     return <>
//         {isLoading && <Loader />}

//         {state.isformValidationModelOpen &&
//             <CustomModal
//                 isModalOpenProps={state.isformValidationModelOpen} setModalpopUpFalse={() => {
//                     SetState((prevState: any) => ({ ...prevState, isformValidationModelOpen: false }));
//                 }} subject={"Missing data"}
//                 message={state.validationMessage} closeButtonText={"Close"} />}


//         <div className="toolboxTalk-Detail">
//             <div className="ms-Grid">

//                 {ToolboxTalk.length > 0 &&
//                     <div className="ms-Grid" >
//                         <div className="ms-Grid-row">
//                             <div id="ToolboxTalk" className="asset-card-2-header-jcc-2 margin-bot-80">
//                                 <div className="formGroup btnSticky noExport">
//                                     <div className="va-b inlineBlock">
//                                         <PrimaryButton
//                                             className="btn btn-danger send-email-btn"
//                                             text="Close"
//                                             onClick={onClickClose}
//                                         />
//                                     </div>
//                                     <div className="va-b inlineBlock">
//                                         <CommonPopup
//                                             isPopupVisible={isPopupVisible} hidePopup={hidePopup} title={title} sendToEmail={sendToEmail} onChangeTitle={onChangeTitle} onChangeSendToEmail={onChangeSendToEmail} displayerrortitle={displayerrortitle} displayerroremail={displayerroremail} displayerror={displayerror} onClickSendEmail={onClickSendEmail} onClickCancel={onClickCancel} onclickSendEmail={onclickSendEmail}
//                                         />
//                                     </div>
//                                     <div className="va-b inlineBlock">
//                                         <PrimaryButton className="btn btn-primary send-email-btn-toolbox-talk" onClick={onClickDownload}>
//                                             <FontAwesomeIcon icon="download" className="clsbtnat" /><div>PDF</div>
//                                         </PrimaryButton>
//                                     </div>
//                                 </div>
//                                 <div className="">
//                                     <div className="ims-card-mt0 boxCard ims-card-mt0">
//                                         <div id="DetailToolboxTalkPDFCode">
//                                             <div className="head-tbl-space">
//                                                 <table className="table-toolbox-talk cell-space-0" style={{ width: "100%", border: "1px solid black" }} >
//                                                     <tr>
//                                                         <th className="th-toolbox-talk-logo pl-10 bg-white br-1" > <img src={imgLogo} height="30px" className="course-img-first img-mt qclogoims" /></th>
//                                                         <td className="td-toolbox-talk middle-box"><div>Toolbox Meeting Agenda & Minutes</div></td>
//                                                         <td className="td-toolbox-talk blue-box pl-10"><div>Document No</div><div>QC-CP-13-F1</div></td>
//                                                     </tr>
//                                                 </table>
//                                             </div>
//                                             <div className="meeting-id-cls"><div className="td-toolbox-talk blue-text dflex justify-content-end meeting-spc-cls"><div className="toggle-className">Meeting ID: {ToolboxTalk[0]?.MeetingID}</div></div></div>
//                                             <div className="asset-card-2-header-jcc">
//                                                 <div className="table-toolbox-talk mt-3">
//                                                     <div className="row">
//                                                         <div className="td-toolbox-talk-detail"><b>Meeting Date:</b></div>
//                                                         <div className="td-toolbox-talk-detail">{ToolboxTalk[0]?.MeetingDate}</div>
//                                                     </div>
//                                                     <div className="row">
//                                                         <div className="td-toolbox-talk-detail"><b>Subject:</b></div>
//                                                         <div className="td-toolbox-talk-detail">{ToolboxTalk[0]?.Subject}</div>
//                                                     </div>
//                                                     <div className="row">
//                                                         <div className="td-toolbox-talk-detail"><b>Job Site:</b></div>
//                                                         <div className="td-toolbox-talk-detail">{ToolboxTalk[0]?.SiteName}</div>
//                                                     </div>
//                                                     <div className="row">
//                                                         <div className="td-toolbox-talk-detail"><b>Meeting Chairperson:</b></div>
//                                                         <div className="td-toolbox-talk-detail">{ToolboxTalk[0]?.Chairperson}</div>
//                                                     </div>
//                                                     <div className="row">
//                                                         <div className="td-toolbox-talk-detail"><b>Meeting Location:</b></div>
//                                                         <div className="td-toolbox-talk-detail">{ToolboxTalk[0]?.Location}</div>
//                                                     </div>
//                                                     <div className="row">
//                                                         <div className="td-toolbox-talk-detail"><b>Shift Type:</b></div>
//                                                         <div className="td-toolbox-talk-detail">{ToolboxTalk[0]?.ShiftType}</div>
//                                                     </div>
//                                                     <div className="row">
//                                                         <div className="td-toolbox-talk-detail"><b>Minutes taken and recorded by:</b></div>
//                                                         <div className="td-toolbox-talk-detail">{ToolboxTalk[0]?.MinutesTakenAndRecordedBy}</div>
//                                                     </div>
//                                                     <div className="row">
//                                                         <div className="td-toolbox-talk-detail"><b>Attendees:</b></div>
//                                                         {/* <div className="td-toolbox-talk-detail">{ToolboxTalk[0]?.Attendees}</div> */}
//                                                         <div className="td-toolbox-talk-detail badge-css-attendees">
//                                                             {
//                                                                 ToolboxTalk[0]?.Attendees.split(',').map((name: any) => (
//                                                                     <span className="attendees-badge-cls" key={name.trim()}>
//                                                                         {name.trim()}
//                                                                     </span>
//                                                                 ))
//                                                             }
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                                 <div className="main-header-text mt-3">Meeting Agenda</div>
//                                                 <div className="sub-main-header-text mt-2">Acknowledgement of Country</div>
//                                                 <div className="fontsize-16 toolbox-detail">
//                                                     In the spirit of reconciliation Quayclean acknowledges the Traditional Custodians of country
//                                                     throughout Australia and their connections to land, sea and community. We pay our respect
//                                                     to their Elders past, present and future and extend that respect to all Aboriginal and Torres
//                                                     Strait Islander peoples here today.
//                                                 </div>
//                                                 <div className="sub-main-header-text mt-2">Matters from Previous Meetings</div>
//                                                 <div className="mt-1 toolbox-detail richTextrenderUlLi">
//                                                     <div dangerouslySetInnerHTML={{ __html: ToolboxTalk[0]?.MattersfromPreviousMeetings }} />
//                                                 </div>

//                                                 <div className="sub-main-header-text mt-2">New Matters for Discussion</div>
//                                                 <div className="mt-1 toolbox-detail richTextrenderUlLi">
//                                                     <div dangerouslySetInnerHTML={{ __html: ToolboxTalk[0]?.NewMattersforDiscussion }} />
//                                                 </div>

//                                                 <div className="sub-main-header-text mt-2">Discussion Points</div>
//                                                 <div className="mt-1 toolbox-detail richTextrenderUlLi">
//                                                     <div dangerouslySetInnerHTML={{ __html: ToolboxTalk[0]?.DiscussionPoints }} />
//                                                 </div>

//                                                 <div className="sub-main-header-text mt-2">Associated Documents</div>
//                                                 <ToolboxAttachments ToolboxTalk={ToolboxTalk} />
//                                                 <div className="pdf-lbl-talk mt-1"><b>Comments</b></div>
//                                                 <div className="mt-1 toolbox-detail richTextrenderUlLi">
//                                                     <div dangerouslySetInnerHTML={{ __html: ToolboxTalk[0]?.Comments }}></div>
//                                                 </div>

//                                                 <div>
//                                                     <div>
//                                                         {ToolboxTalkData.map((item: any) => {
//                                                             // Check if item.IsShow is true
//                                                             if (item.IsShow) {
//                                                                 const details = ToolboxTalkDetailsData.filter((detail: any) => detail.ToolboxTalkMasterId === item.ID);

//                                                                 return (
//                                                                     <div key={item.ID} className="">
//                                                                         <div className="sub-main-header-text mt-3">
//                                                                             {item.Title}
//                                                                         </div>
//                                                                         {details.length > 0 ? (
//                                                                             <table cellSpacing="0" className="sub-toolbox-table mt-2 ">
//                                                                                 <thead>
//                                                                                     <tr className="sub-toolbox-tr">
//                                                                                         <th className="sub-toolbox-th">Item</th>
//                                                                                         <th className="sub-toolbox-th">Response</th>
//                                                                                     </tr>
//                                                                                 </thead>
//                                                                                 <tbody>
//                                                                                     {details.map((detail: any) => (
//                                                                                         <tr className="sub-toolbox-tr keep-together" key={detail.ID}>
//                                                                                             <td className="sub-toolbox-td-item">{detail.Title}</td>
//                                                                                             <td className="sub-toolbox-td-item">{detail.outputStatus}</td>
//                                                                                         </tr>
//                                                                                     ))}
//                                                                                 </tbody>
//                                                                             </table>
//                                                                         ) : (
//                                                                             <div className="mt-1">Record not found</div>
//                                                                         )}
//                                                                         {item.IsComment && (
//                                                                             <div className="keep-together">
//                                                                                 <div className="pdf-lbl-talk mt-1"><b>Comments</b></div>
//                                                                                 <div className="mt-1 toolbox-detail richTextrenderUlLi">
//                                                                                     {item.Comment !== "" ? (
//                                                                                         <div className="mb-10" dangerouslySetInnerHTML={{ __html: item.Comment }} />

//                                                                                     ) : (
//                                                                                         <div className="mb-10">N/A</div>
//                                                                                     )}
//                                                                                 </div>
//                                                                             </div>
//                                                                         )}
//                                                                     </div>
//                                                                 );
//                                                             }
//                                                             // Return null if item.IsShow is not true
//                                                             return null;
//                                                         })}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             {/* Signature Blocks */}
//                                             <div className="p-15">
//                                                 <QuaysafeSignatureBlocks
//                                                     signatureData={AllSignatureData ? AllSignatureData : []} />
//                                             </div>
//                                             <div className="asset-card-2-header-jcc-2 mar-bot-40 noExport">
//                                                 <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 toolkit-btn">
//                                                     <PrimaryButton
//                                                         style={{ marginBottom: "5px", marginTop: "10px" }}
//                                                         className="btn btn-danger"
//                                                         text="Close"
//                                                         onClick={onClickClose}
//                                                     />
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>

//                             </div>

//                         </div>
//                     </div>
//                 }
//             </div>
//         </div>

//         <Panel
//             isOpen={showModal}
//             onDismiss={() => toggleModal("")}
//             type={PanelType.extraLarge}
//             headerText="Image View">
//             <img src={imageURL} style={{ width: "100%", height: "85vh" }} />
//         </Panel>
//     </>
// };