/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { PrimaryButton } from "@fluentui/react";
import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBoolean } from "@fluentui/react-hooks";
import {
  ComponentNameEnum,
  ListNames,
  UserActionEntityTypeEnum,
  UserActionLogFor,
  UserActivityActionTypeEnum,
} from "../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../Common/ToastService";
import {
  logGenerator,
  removeElementOfBreadCrum,
  generateAndSaveKendoPDF,
  UserActivityLog,
} from "../../../../../../Common/Util";
import { IFileWithBlob } from "../../../../../../DataProvider/Interface/IFileWithBlob";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import {
  IHelpDeskFormProps,
  IHelpDeskFormState,
} from "../../../../../../Interfaces/IAddNewHelpDesk";
import CommonPopup from "../../../CommonComponents/CommonSendEmailPopup";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Loader } from "../../../CommonComponents/Loader";
import moment from "moment";
import { ViewTemplate } from "./ViewDocument";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { DateTimeFormate } from "../../../../../../Common/Constants/CommonConstants";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
const imgLogo = require("../../../../assets/images/logo.png");

export const DetailWorkplaceInspection: React.FC<IHelpDeskFormProps> = (
  props: IHelpDeskFormProps
) => {
  const [value, setValue] = React.useState(props.initialValue);
  const appGlobalState = useAtomValue(appGlobalStateAtom);
  const { currentUserRoleDetail } = appGlobalState;
  const selectedZoneDetails = useAtomValue(selectedZoneAtom);
  const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
  const isCall = React.useRef<boolean>(true);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [WICMDData, setWICMDData] = React.useState<any[]>([]);
  const [WICMData, setWICMData] = React.useState<any[]>([]);
  const [MasterData, setMasterData] = React.useState<any[]>([]);
  const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
  const [WICData, setWICData] = React.useState<any[]>([]);
  const [SignatureData, setSignatureData] = React.useState<any[]>([]);
  const [IsSD, setIsSD] = React.useState<boolean>(false);
  const [SiteName, setSiteName] = React.useState<any>(
    props?.breadCrumItems[0]?.text
  );
  const [StateName, setStateName] = React.useState<string>();
  const [title, setTitle] = React.useState<string>("");
  const [sendToEmail, setSendToEmail] = React.useState<string>("");
  const [displayerrortitle, setDisplayErrorTitle] =
    React.useState<boolean>(false);
  const [displayerroremail, setDisplayErrorEmail] =
    React.useState<boolean>(false);
  const [displayerror, setDisplayError] = React.useState<boolean>(false);
  const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] =
    useBoolean(false);
  const notFoundImage = require("../../../../../quayClean/assets/images/NotFoundImg.png");
  const [AllSignatureData, seAllSignatureData] = React.useState<any[]>([]);
  const [attachments, setAttachments] = React.useState<any>();
  const AllMasterData = React.useRef<any[]>([]);
  const [fileURL, setFileURL] = React.useState<string>('');
  const [isOpenDoc, { setTrue: showDoc, setFalse: hideDoc }] = useBoolean(false);
  const openModal = () => { showDoc(); };

  const _SkillMatrixSignature = () => {
    setIsLoading(true);
    try {
      const select = [
        "ID,QuaycleanEmployeeId,QuaycleanEmployee/Email,QuaycleanEmployee/FirstName,QuaycleanEmployee/LastName,WorkplaceInspectionChecklistId,Created,Signature",
      ];
      const expand = ["QuaycleanEmployee"];
      const queryStringOptions: IPnPQueryOptions = {
        select: select,
        expand: expand,
        filter: `WorkplaceInspectionChecklistId eq ${props?.siteMasterId}`,
        listName: ListNames.WorkplaceInspectionChecklistSignature,
      };
      props.provider
        .getItemsByQuery(queryStringOptions)
        .then((results: any[]) => {
          if (!!results) {
            const SignatureData = results.map((data) => {
              return {
                ID: data.ID,
                QuaycleanEmployeeId: !!data.QuaycleanEmployeeId
                  ? data.QuaycleanEmployeeId
                  : "",
                QuaycleanEmployeeEmail: !!data.QuaycleanEmployeeId
                  ? data.QuaycleanEmployee.Email
                  : "",
                WorkplaceInspectionChecklistId:
                  !!data.WorkplaceInspectionChecklistId
                    ? data.WorkplaceInspectionChecklistId
                    : "",
                Signature: !!data.Signature ? data.Signature : "",
                Name: !!data.QuaycleanEmployeeId
                  ? data.QuaycleanEmployee.FirstName +
                  " " +
                  data.QuaycleanEmployee.LastName
                  : "",
                Created: !!data.Created
                  ? moment(data.Created).format(DateTimeFormate)
                  : "",
              };
            });

            setSignatureData(SignatureData);
            setIsLoading(false);
            setTimeout(() => {
              setIsSD(true);
            }, 500);
          }
        })
        .catch((error: any) => {
          console.log(error);
          const errorObj = {
            ErrorMethodName: "_QuestionData",
            CustomErrormessage: "error in get Question data",
            ErrorMessage: error.toString(),
            ErrorStackTrace: "",
            PageName: "QuayClean.aspx",
          };
          void logGenerator(props.provider, errorObj);
          setIsLoading(false);
        });
    } catch (ex) {
      console.log(ex);
      const errorObj = {
        ErrorMethodName: "_QuestionData",
        CustomErrormessage: "error in get Question data",
        ErrorMessage: ex.toString(),
        ErrorStackTrace: "",
        PageName: "QuayClean.aspx",
      };
      void logGenerator(props.provider, errorObj);
      setIsLoading(false);
    }
  };

  const WICMasterData = async () => {
    setIsLoading(true);
    try {
      const select = ["ID,WICMId,WICM/Title,Comment,MasterId,Attachments,AttachmentFiles"];
      const queryStringOptions: IPnPQueryOptions = {
        select: select,
        expand: ["WICM", "AttachmentFiles"],
        filter: `MasterId eq '${props?.siteMasterId}'`,
        listName: ListNames.WorkplaceInspectionChecklistMasterData,
      };
      await props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
        if (!!results) {
          const UsersListData: any = results.map((data) => {
            const fixImgURL = `${props.context.pageContext.web.serverRelativeUrl}/Lists/ToolboxTalk/Attachments/${data.ID}/`;
            let attachmentFiledata: string[] = []; // Array to hold all attachment URLs

            if (data.AttachmentFiles.length > 0) {
              try {
                data.AttachmentFiles.forEach((AttachmentData: { ServerRelativeUrl: string; FileName: string; }) => {
                  if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                    attachmentFiledata.push(AttachmentData.ServerRelativeUrl);
                  } else if (AttachmentData && AttachmentData.FileName) {
                    attachmentFiledata.push(fixImgURL + AttachmentData.FileName);
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
                Comment: !!data.Comment ? data.Comment : 'N/A',
                MasterId: !!data.MasterId ? data.MasterId : '',
                WICMId: !!data.WICMId ? data.WICMId : '',
                WICM: !!data.WICM ? data.WICM.Title : '',
                Attachment: attachmentFiledata,
                AttachmentFiles: data.AttachmentFiles,
              }
            );
          });
          AllMasterData.current = UsersListData;
          setIsLoading(false);
        }
      }).catch((error: any) => {
        console.log(error);
        const errorObj = { ErrorMethodName: "MasterData", CustomErrormessage: "error in get master data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
        void logGenerator(props.provider, errorObj);
        setIsLoading(false);
      });
    } catch (ex) {
      console.log(ex);
      const errorObj = { ErrorMethodName: "MasterData", CustomErrormessage: "error in get master data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
      void logGenerator(props.provider, errorObj);
      setIsLoading(false);
    }
  };

  const _WorkplaceInspectionChecklist = () => {
    setIsLoading(true);
    try {
      const select = [
        "ID,EnabledChecklistId,EnabledChecklist/Title,InspectionDate,Title,Subject,Location,ChairpersonId,Chairperson/Title,Chairperson/Name,Chairperson/EMail,SiteNameId,SiteName/Title,Attendees,AttendeesEmailId,AttendeesEmail/Email,Created,Modified,Comment,Attachments,AttachmentFiles",
      ];
      const queryStringOptions: IPnPQueryOptions = {
        select: select,
        expand: ["SiteName", "Chairperson", "AttendeesEmail", "EnabledChecklist", "AttachmentFiles"],
        filter: `Id eq '${props?.siteMasterId}'`,
        listName: ListNames.WorkplaceInspectionChecklist,
      };
      props.provider
        .getItemsByQuery(queryStringOptions)
        .then((results: any[]) => {
          if (!!results) {
            const UsersListData = results.map((data) => {
              const fixImgURL = `${props.context.pageContext.web.serverRelativeUrl}/Lists/ToolboxTalk/Attachments/${data.ID}/`;
              let attachmentFiledata: string[] = []; // Array to hold all attachment URLs

              if (data.AttachmentFiles.length > 0) {
                try {
                  data.AttachmentFiles.forEach((AttachmentData: { ServerRelativeUrl: string; FileName: string; }) => {
                    if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                      attachmentFiledata.push(AttachmentData.ServerRelativeUrl);
                    } else if (AttachmentData && AttachmentData.FileName) {
                      attachmentFiledata.push(fixImgURL + AttachmentData.FileName);
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

              return {
                ID: data.ID,
                Title: data.Title,
                SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                SiteName: !!data.SiteName ? data.SiteName.Title : "",
                Attendees: !!data.Attendees ? data.Attendees : "",
                Location: !!data.Location ? data.Location : "",
                Subject: !!data.Subject ? data.Subject : "",
                Chairperson: (!!data.ChairpersonId && data.ChairpersonId.length > 0) ? data.Chairperson.map((i: { Title: any }) => i.Title) : "",
                AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : "",
                AttendeesEmail: (!!data.AttendeesEmail && data.AttendeesEmail.length > 0) ? data.AttendeesEmail.map((i: { Email: any }) => i.Email) : "",
                Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
                InspectionDate: !!data.InspectionDate ? moment(data.InspectionDate).format("DD-MM-YYYY") : "",
                Modified: !!data.Modified ? data.Modified : null,
                ChairpersonEmail: !!data.Chairperson ? data.Chairperson[0].EMail : "",
                Email: (!!data.ChairpersonId && data.ChairpersonId.length > 0) ? data.Chairperson.map((i: { EMail: any }) => i.EMail) : "",
                EnabledChecklistId: !!data.EnabledChecklistId ? data.EnabledChecklistId : [],
                Attachment: attachmentFiledata,
                AttachmentFiles: data.AttachmentFiles,
                Comment: data.Comment ? data.Comment : ""
              };
            });
            setWICData(UsersListData);
            setAttachments(UsersListData[0].Attachment);
            setIsLoading(false);
          }
        })
        .catch((error: any) => {
          console.log(error);
          const errorObj = {
            ErrorMethodName: "_QuestionData",
            CustomErrormessage: "error in get Question data",
            ErrorMessage: error.toString(),
            ErrorStackTrace: "",
            PageName: "QuayClean.aspx",
          };
          void logGenerator(props.provider, errorObj);
          setIsLoading(false);
        });
    } catch (ex) {
      console.log(ex);
      const errorObj = {
        ErrorMethodName: "_QuestionData",
        CustomErrormessage: "error in get Question data",
        ErrorMessage: ex.toString(),
        ErrorStackTrace: "",
        PageName: "QuayClean.aspx",
      };
      void logGenerator(props.provider, errorObj);
      setIsLoading(false);
    }
  };

  const _WICMData = () => {
    setIsLoading(true);
    try {
      const select = ["ID,Title,AttachFile,IsComment,IsNote,UserNote"];
      const queryStringOptions: IPnPQueryOptions = {
        select: select,
        listName: ListNames.WorkplaceInspectionChecklistMaster,
      };
      props.provider
        .getItemsByQuery(queryStringOptions)
        .then((results: any[]) => {
          if (!!results) {
            const UsersListData = results.map((data) => {
              return {
                ID: data.ID,
                Title: data.Title,
                AttachFile: data.AttachFile ? data.AttachFile : false,
                IsComment: data.IsComment ? data.IsComment : false,
                IsNote: !!data.IsNote ? data.IsNote : "",
                UserNote: !!data.UserNote ? data.UserNote : ""
              };
            });
            setWICMData(UsersListData);
            setIsLoading(false);
          }
        })
        .catch((error: any) => {
          console.log(error);
          const errorObj = {
            ErrorMethodName: "_WICMData",
            CustomErrormessage: "error in get Question data",
            ErrorMessage: error.toString(),
            ErrorStackTrace: "",
            PageName: "QuayClean.aspx",
          };
          void logGenerator(props.provider, errorObj);
          setIsLoading(false);
        });
    } catch (ex) {
      console.log(ex);
      const errorObj = {
        ErrorMethodName: "_WICMData",
        CustomErrormessage: "error in get Question data",
        ErrorMessage: ex.toString(),
        ErrorStackTrace: "",
        PageName: "QuayClean.aspx",
      };
      void logGenerator(props.provider, errorObj);
      setIsLoading(false);
    }
  };

  const createRecordsForAttendees = () => {
    const { AttendeesEmailId, AttendeesEmail, Attendees } = WICData[0];

    const attendeeRecords = AttendeesEmailId.map((emailId: any, index: any) => {
      const matchingSignature = SignatureData.find(
        (signature: any) => signature.QuaycleanEmployeeId === emailId
      );

      return {
        QuaycleanEmployeeEmail: AttendeesEmail[index],
        QuaycleanEmployeeId: emailId,
        Name: Attendees.split(", ")[index],
        Signature: matchingSignature ? matchingSignature.Signature : "",
        Created: matchingSignature ? matchingSignature.Created : "",
      };
    });
    return attendeeRecords;
  };

  React.useEffect(() => {
    if (IsSD && WICData.length > 0) {
      const generatedRecords = createRecordsForAttendees();
      seAllSignatureData(generatedRecords);
    }
  }, [IsSD, WICData]);

  const [state, SetState] = React.useState<IHelpDeskFormState>({
    CallerOptions: [],
    CategoryOptions: [],
    EventOptions: [],
    isdisableField: !!isAddNewHelpDesk ? false : true,
    isAddNewHelpDesk: !!isAddNewHelpDesk,
    isformValidationModelOpen: false,
    validationMessage: null,
  });

  const onclickSendEmail = () => {
    showPopup();
  };

  const _WICMMaterData = () => {
    setIsLoading(true);
    try {
      const select = [
        "ID,Title,Response,WorkplaceInspectionMasterId,WorkplaceInspectionMaster/Title",
      ];
      const queryStringOptions: IPnPQueryOptions = {
        select: select,
        expand: ["WorkplaceInspectionMaster"],
        listName: ListNames.WorkplaceInspectionChecklistMasterDetails,
      };
      props.provider
        .getItemsByQuery(queryStringOptions)
        .then((results: any[]) => {
          if (!!results) {
            const UsersListData = results.map((data) => {
              return {
                ID: data.ID,
                Title: data.Title,
                Response: !!data.Response ? data.Response : "",
                WorkplaceInspectionMasterId: !!data.WorkplaceInspectionMasterId
                  ? data.WorkplaceInspectionMasterId
                  : "",
                WorkplaceInspectionMaster: !!data.WorkplaceInspectionMaster
                  ? data.WorkplaceInspectionMaster.Title
                  : "",
              };
            });
            setMasterData(UsersListData);
            setIsLoading(false);
          }
        })
        .catch((error: any) => {
          console.log(error);
          const errorObj = {
            ErrorMethodName: "_QuestionData",
            CustomErrormessage: "error in get Question data",
            ErrorMessage: error.toString(),
            ErrorStackTrace: "",
            PageName: "QuayClean.aspx",
          };
          void logGenerator(props.provider, errorObj);
          setIsLoading(false);
        });
    } catch (ex) {
      console.log(ex);
      const errorObj = {
        ErrorMethodName: "_QuestionData",
        CustomErrormessage: "error in get Question data",
        ErrorMessage: ex.toString(),
        ErrorStackTrace: "",
        PageName: "QuayClean.aspx",
      };
      void logGenerator(props.provider, errorObj);
      setIsLoading(false);
    }
  };

  const _WICMDData = () => {
    setIsLoading(true);

    try {
      const select = [
        "ID,Title,Response,SiteNameId,SiteName/Title,MasterId,WICMId,WICM/Title",
      ];
      const queryStringOptions: IPnPQueryOptions = {
        select: select,
        filter: `MasterId eq '${props?.siteMasterId}'`,
        expand: ["SiteName", "WICM"],
        listName: ListNames.WorkplaceInspectionChecklistMasterDetailsData,
      };
      props.provider
        .getItemsByQuery(queryStringOptions)
        .then((results: any[]) => {
          if (!!results) {
            const ListData = results.map((data) => {
              const matchingMasterData = MasterData.find(
                (master) => master.ID === data.WICMId
              );
              const matchingCommentData = MasterData?.filter(
                (masterData) => masterData.ID === data.WICMDId
              );
              return {
                ID: data.ID,
                Title: !!data.Title ? data.Title : "",
                Response: !!data.Response ? data.Response : "",
                SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                SiteName: !!data.SiteName ? data.SiteName.Title : "",
                MasterId: !!data.MasterId ? data.MasterId : "",
                WICMDId: !!data.WICMId ? data.WICMId : "",
                WICMD: !!data.WICM ? data.WICM.Title : "",
                WorkplaceInspectionMasterId: matchingMasterData
                  ? matchingMasterData.WorkplaceInspectionMasterId
                  : "",
                WorkplaceInspectionMaster: matchingMasterData
                  ? matchingMasterData
                  : "",
              };
            });
            setWICMDData(ListData);
            setIsLoading(false);
          }
        })
        .catch((error: any) => {
          console.log(error);
          const errorObj = {
            ErrorMethodName: "_QuestionData",
            CustomErrormessage: "error in get Question data",
            ErrorMessage: error.toString(),
            ErrorStackTrace: "",
            PageName: "QuayClean.aspx",
          };
          void logGenerator(props.provider, errorObj);
          setIsLoading(false);
        });
    } catch (ex) {
      console.log(ex);
      const errorObj = {
        ErrorMethodName: "_QuestionData",
        CustomErrormessage: "error in get Question data",
        ErrorMessage: ex.toString(),
        ErrorStackTrace: "",
        PageName: "QuayClean.aspx",
      };
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

  const onChangeTitle = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    setTitle(newValue || "");
    if (newValue) {
      setDisplayErrorTitle(false);
    }
  };

  const onChangeSendToEmail = (
    event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    setSendToEmail(newValue || "");
    if (newValue) {
      setDisplayErrorEmail(false);
      setDisplayErrorEmail(false);
    }
    const enteredValue = newValue;
    const emailPattern =
      /^([^\s@]+@[^\s@]+\.[^\s@]+)(\s*;\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/;
    if (!enteredValue || emailPattern.test(enteredValue)) {
      setDisplayError(false);
    } else {
      setDisplayError(true);
    }
  };

  const onClickDownload = async (): Promise<void> => {
    setIsLoading(true);
    let fileName: string = SiteName + '-Workplace Inspection Checklist' + "-" + (!!WICData[0]?.InspectionDate ? WICData[0]?.InspectionDate : "");
    let fileblob: any = await generateAndSaveKendoPDF(
      "WorkplaceInspectionChecklistPDFCode",
      fileName,
      false,
      true
    );
    setIsLoading(false);
    // let url = URL.createObjectURL(fileblob);
    // let a = document.createElement('a');
    // a.href = url;
    // a.download = SiteName + '- Workplace Inspection Checklist';
    // a.click();
    //  setIsLoading(false);
  };

  const onClickSendEmail = async (): Promise<void> => {
    setIsLoading(true);
    const isTitleEmpty = !title;
    const isEmailEmpty = !sendToEmail;
    const isEmailInvalid =
      !isEmailEmpty &&
      !sendToEmail
        ?.split(";")
        .every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));

    setDisplayErrorTitle(isTitleEmpty);
    setDisplayErrorEmail(isEmailEmpty);
    setDisplayError(isEmailInvalid);

    if (!isTitleEmpty && !isEmailEmpty && !isEmailInvalid) {
      let fileName: string = SiteName + '-Workplace Inspection Checklist' + "-" + (!!WICData[0]?.InspectionDate ? WICData[0]?.InspectionDate : "");
      let fileblob: any = await generateAndSaveKendoPDF(
        "WorkplaceInspectionChecklistPDFCode",
        fileName,
        false
      );
      const file: IFileWithBlob = {
        file: fileblob,
        name: `${fileName}.pdf`,
        overwrite: true,
      };
      let toastMessage: string = "";
      const toastId = toastService.loading("Loading...");
      toastMessage = "Email sent successfully!";
      let insertData: any = {
        Title: title,
        SendToEmail: sendToEmail,
        StateName: StateName,
        SiteName: SiteName,
        EmailType: "WorkplaceInspectionChecklist",
      };
      props.provider
        .createItem(insertData, ListNames.SendEmailTempList)
        .then((item: any) => {
          props.provider
            .uploadAttachmentToList(
              ListNames.SendEmailTempList,
              file,
              item.data.Id
            )
            .then(() => {
              console.log("Upload Success");
            })
            .catch((err: any) => console.log(err));
          toastService.updateLoadingWithSuccess(toastId, toastMessage);
          onClickCancel();
          const logObj = {
            UserName: currentUserRoleDetail?.title,
            SiteNameId: props?.componentProps?.originalSiteMasterId || WICData[0]?.SiteNameId, // Match index dynamically
            ActionType: UserActivityActionTypeEnum.SendEmail,
            EntityType: UserActionEntityTypeEnum.WorkplaceInspection,
            LogFor: UserActionLogFor.Both,
            // EntityId: UpdateItem[index]?.ID, // Use res dynamically
            EntityName: title, // Match index dynamically
            Details: `Send Email Workplace Inspection to ${sendToEmail}`,
            StateId: props?.componentProps?.qCStateId
          };
          void UserActivityLog(props.provider, logObj, currentUserRoleDetail);
          setIsLoading(false);
        })
        .catch((err: any) => console.log(err));
    } else {
      setIsLoading(false);
    }
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
      let orgSiteId = props?.componentProps?.originalSiteMasterId || WICData[0]?.SiteNameId;
      let data = await getState(orgSiteId);
      if (props?.componentProps?.qCStateId || data[0]?.QCStateId) {
        const todayDate = moment().format("YYYY-MM-DD");
        const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
        const queryStringOptions: IPnPQueryOptions = {
          select: select,
          listName: ListNames.UserActivityLog,
          filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityId eq '${props?.siteMasterId}' and SiteNameId eq '${orgSiteId}' and EntityType eq '${UserActionEntityTypeEnum.WorkplaceInspection}' and ActionType eq 'Details View' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
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
            EntityType: UserActionEntityTypeEnum.WorkplaceInspection,
            EntityId: props?.siteMasterId,
            EntityName: WICData[0]?.Title,
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
    if (!!WICData && WICData.length > 0 && WICData[0]?.Title !== undefined && isCall.current == true) {
      isCall.current = false;
      _userActivityLog();
    }
  }, [WICData]);

  React.useEffect(() => {
    if (props?.componentProps?.originalState) {
      setStateName(props.componentProps.originalState);
    }
    WICMasterData();
    _WorkplaceInspectionChecklist();
    _WICMMaterData();
    _SkillMatrixSignature();
    _WICMData();
  }, []);

  React.useEffect(() => {
    if (MasterData.length > 0) _WICMDData();
  }, [MasterData]);


  const onClickClose = () => {
    // if (props?.componentProps?.originalSiteMasterId) {
    //   const breadCrumItems = removeElementOfBreadCrum(
    //     props.breadCrumItems
    //   );
    //   props.manageComponentView({
    //     currentComponentName:
    //       ComponentNameEnum.AddNewSite,
    //     originalState: StateName,
    //     dataObj: props.componentProps.dataObj,
    //     breadCrumItems: breadCrumItems,
    //     siteMasterId: props.originalSiteMasterId,
    //     isShowDetailOnly: true,
    //     siteName: props.componentProps.siteName,
    //     qCState: props.componentProps.qCState,
    //     pivotName: "IMSKey",
    //     qCStateId: props?.componentProps?.qCStateId,
    //     view: props.componentProps.viewType,
    //     subpivotName: "WorkplaceInspection",
    //   });
    // } 
    if (isSiteLevelComponent) {
      props.manageComponentView({
        currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
        selectedZoneDetails: selectedZoneDetails,
        isShowDetailOnly: true,
        pivotName: "IMSKey",
        subpivotName: "WorkplaceInspection",
      });
    }
    else {
      const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
      manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, breadCrumItems: breadCrumItems, view: props.componentProps.viewType, subpivotName: "WorkplaceInspection" });
    }
  };
  return (
    <>
      {isLoading && <Loader />}

      {state.isformValidationModelOpen && (
        <CustomModal
          isModalOpenProps={state.isformValidationModelOpen}
          setModalpopUpFalse={() => {
            SetState((prevState: any) => ({
              ...prevState,
              isformValidationModelOpen: false,
            }));
          }}
          subject={"Missing data"}
          message={state.validationMessage}
          closeButtonText={"Close"}
        />
      )}

      <div className="workplaceInspectionChecklist-Detail">
        <div className="ms-Grid">
          {WICData.length > 0 && (
            <div className="ms-Grid">
              <div className="ms-Grid-row">
                <div id="ToolboxTalk" className="asset-card-2-header-jcc margin-bot-80">
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
                        onClickCancel={onClickCancel}
                        onclickSendEmail={onclickSendEmail}
                      />
                    </div>
                    <div className="va-b inlineBlock">
                      <PrimaryButton
                        className="btn btn-primary send-email-btn"
                        onClick={onClickDownload}
                      >
                        <FontAwesomeIcon icon="download" className="clsbtnat" />
                        <div>PDF</div>
                      </PrimaryButton>
                    </div>
                  </div>
                  <div className="">
                    <div className="boxCard">
                      <div id="WorkplaceInspectionChecklistPDFCode">
                        <div className="head-tbl-space">
                          <table
                            className="table-toolbox-talk cell-space-0"
                            style={{ width: "100%", border: "1px solid black" }}
                          >
                            <tr>
                              <th className="th-toolbox-talk-logo-2 pl-10 bg-white br-1">
                                {" "}
                                <img
                                  src={imgLogo}
                                  height="30px"
                                  className="course-img-first img-mt qclogoims"
                                />
                              </th>
                              <td className="td-toolbox-talk middle-box">
                                <div>Workplace Inspection Checklist</div>
                              </td>
                              <td className="td-toolbox-talk blue-box pl-10">
                                <div>Document No.</div>
                                <div>{WICData[0].Title}</div>
                              </td>
                            </tr>
                          </table>
                        </div>
                        <div className="asset-card-2-header-jcc">
                          <div className="table-toolbox-talk mt-3">
                            <div className="row">
                              <div className="td-toolbox-talk-detail">
                                <b>Date:</b>
                              </div>
                              <div className="td-toolbox-talk-detail">
                                {WICData[0]?.InspectionDate}
                              </div>
                            </div>
                            <div className="row">
                              <div className="td-toolbox-talk-detail"><b>Subject:</b></div>
                              <div className="td-toolbox-talk-detail">{WICData[0]?.Subject}</div>
                            </div>
                            <div className="row">
                              <div className="td-toolbox-talk-detail">
                                <b>Job Site:</b>
                              </div>
                              <div className="td-toolbox-talk-detail">
                                {WICData[0]?.SiteName}
                              </div>
                            </div>
                            <div className="row">
                              <div className="td-toolbox-talk-detail">
                                <b>Inspected Location:</b>
                              </div>
                              <div className="td-toolbox-talk-detail">
                                {WICData[0]?.Location}
                              </div>
                            </div>
                            <div className="row">
                              <div className="td-toolbox-talk-detail">
                                <b>Checked By:</b>
                              </div>
                              <div className="td-toolbox-talk-detail">
                                {WICData[0]?.Chairperson}
                              </div>
                            </div>
                            <div className="row">
                              <div className="td-toolbox-talk-detail">
                                <b>Attendees</b>
                              </div>
                              {/* <div className="td-toolbox-talk-detail">
                                {WICData[0]?.Attendees}
                              </div> */}
                              <div className="td-toolbox-talk-detail badge-css-attendees">
                                {
                                  WICData[0]?.Attendees.split(',').map((name: any) => (
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
                              <div>
                                {WICMData.length > 0 &&
                                  WICMDData.length > 0 &&
                                  MasterData.length > 0 && (
                                    <div>
                                      {WICMData.map((item) => {
                                        const details = WICMDData.filter(
                                          (detail) =>
                                            detail.WorkplaceInspectionMasterId ===
                                            item.ID
                                        );
                                        const files = AllMasterData.current.filter(
                                          (detail: any) =>
                                            detail.WICMId ===
                                            item.ID
                                        );
                                        return (

                                          <div key={item.ID}>
                                            {WICData[0]?.EnabledChecklistId?.includes(item.ID) && (
                                              <>
                                                <div className="sub-main-header-text mt-3 dflex">
                                                  {item.Title}
                                                </div>

                                                <>
                                                  {details.length > 0 ? (
                                                    <div>
                                                      <table className="sub-toolbox-table mt-2">
                                                        <thead>
                                                          <tr className="sub-toolbox-tr">
                                                            <th className="sub-toolbox-th">
                                                              Check For
                                                            </th>
                                                            <th className="sub-toolbox-th">
                                                              Response
                                                            </th>
                                                          </tr>
                                                        </thead>
                                                        <tbody>
                                                          {details.map((detail) => (
                                                            <tr
                                                              className="sub-toolbox-tr"
                                                              key={detail.ID}
                                                            >
                                                              <td className="sub-toolbox-td-item">
                                                                {detail.Title}
                                                              </td>
                                                              <td className="sub-toolbox-td-response">
                                                                {detail.Response}
                                                              </td>
                                                            </tr>
                                                          ))}
                                                        </tbody>
                                                      </table>
                                                      {item.IsNote === true &&
                                                        <div className="mb-1 richTextrenderUlLi">
                                                          <td className="td-toolbox-talk "><b>Note:</b></td>
                                                          <div dangerouslySetInnerHTML={{ __html: item.UserNote }} />
                                                        </div>
                                                      }
                                                      {item.AttachFile &&
                                                        <>
                                                          <div className="pdf-lbl-talk mt-1"><b>Files</b></div>
                                                          <div className="mt-1">
                                                            {files[0]?.Attachment.length > 0 ? <ul style={{ marginTop: "5px" }}>
                                                              {
                                                                files[0]?.Attachment.map((filePath: any, index: any) => {

                                                                  const fileName = filePath.split('/').pop();
                                                                  return (
                                                                    <li
                                                                      key={index}
                                                                      style={{
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        cursor: 'pointer',
                                                                        textDecoration: 'underline',
                                                                        marginBottom: '6px',
                                                                      }}
                                                                      onClick={() => {
                                                                        setFileURL(filePath);
                                                                        openModal();
                                                                      }}
                                                                    ><FontAwesomeIcon icon="circle" className="val-icon-2" />
                                                                      <span>{fileName}</span>
                                                                    </li>
                                                                  );

                                                                })
                                                              }
                                                            </ul>
                                                              :
                                                              <div>No files are available</div>

                                                            }
                                                          </div>
                                                        </>
                                                      }
                                                      {(item.IsComment) && (
                                                        <>
                                                          <div className="pdf-lbl-talk mt-1"><b>Comments</b></div>
                                                          <div className="mt-1 richTextrenderUlLi">
                                                            <div className="mb-10" dangerouslySetInnerHTML={{ __html: files[0]?.Comment }} />
                                                          </div>
                                                        </>
                                                      )}
                                                    </div>
                                                  ) : (
                                                    <div className=""></div>
                                                  )}
                                                </>
                                              </>
                                            )}
                                          </div>


                                        );
                                      })}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          {AllSignatureData.length > 0 && AllSignatureData.map((item: any, index: number) => (
                            <>
                              <div
                                className={`signature-container mb-5 ${(index === 0 || (index + 1) % 8 === 0) ? 'page-break' : ''}`}
                                key={item.QuaycleanEmployeeId}
                              >
                                {index === 0 &&
                                  <div className="main-header-text-signature mt-3 viewSignature">Cleaner Signature</div>}
                                <div className="signature-container mb-5 viewSignature">
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

                              </div>
                            </>
                          ))}
                        </div>

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
              {isOpenDoc === true &&
                <ViewTemplate
                  isViewDocument={undefined}
                  isOpen={isOpenDoc}
                  hideDoc={hideDoc}
                  fileURL={fileURL}
                  mProps={props}
                />
              }
            </div>

          )}
        </div>
      </div>
    </>
  );
};
