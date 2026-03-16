import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PrimaryButton } from "office-ui-fabric-react";
import React from "react";
import { IDataProvider } from "../../../../../../DataProvider/Interface/IDataProvider";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { HazardEnum, HazardFields, HazardViewFields } from "../../../../../../Common/Enum/HazardFields";
import { generateAndSaveKendoHazardPDF, removeElementOfBreadCrum, UserActivityLog } from "../../../../../../Common/Util";
import { convertToAMPM, formatSPDateToLocal, generatePdfFileName, getFileType, getState } from "../../../CommonComponents/CommonMethods";
import { Loader } from "../../../CommonComponents/Loader";
import { useBoolean } from "@fluentui/react-hooks";
import { IFileWithBlob } from "../../../../../../DataProvider/Interface/IFileWithBlob";
import { toastService } from "../../../../../../Common/ToastService";
import CommonPopup from "../../../CommonComponents/CommonSendEmailPopup";
import HazardHeader from "./HazardHeader";
import moment from "moment";
import AttachmentDialog from "./AttachmentDialog";
import ResponseHeader from "./HazardHeader";
import { useAtomValue } from "jotai";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
const fileCircleInfo = require("../../../../assets/images/hazardImages/file-circle-info.svg");
const termsInfo = require("../../../../assets/images/hazardImages/terms-info.svg");
// const bulletPoint = require("../../../../assets/images/hazardImages/bullet-point.png");
const hazardVideoImg = require("../../../../assets/images/hazardImages/HazardVideo.png");
const notFoundImage = require('../../../../assets/images/NotFoundImg.png');
interface IAnswer {
    id: string;
    label: string;
    type: string;
    value: any;
}
interface IProps {
    answers: IAnswer[];
    isAttachment: boolean;
}
export const ViewHazardFormDetail = (props: any) => {
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const [hazardFormDetail, setHazardFormDetail] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [stateData, setStateData] = React.useState<any>("");
    const [title, setTitle] = React.useState<string>("");
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
    const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
    const [displayerror, setDisplayError] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = React.useState(false);
    const fileHazardData = React.useRef<any>();
    // send Email start

    const resetForm = (): void => {
        setTitle("");
        setSendToEmail("");
        setDisplayErrorTitle(false);
        setDisplayErrorEmail(false);
        setDisplayError(false);
    };
    const onClickCancel = (): void => {
        resetForm();
        hidePopup();
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
    const onClickSendEmail = async (): Promise<void> => {
        setIsLoading(true);
        const isTitleEmpty = !title?.trim();
        const isEmailEmpty = !sendToEmail?.trim();
        const isEmailInvalid = !isEmailEmpty && !sendToEmail?.split(';').every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));

        setDisplayErrorTitle(isTitleEmpty);
        setDisplayErrorEmail(isEmailEmpty);
        setDisplayError(isEmailInvalid);

        if (!isTitleEmpty && !isEmailEmpty && !isEmailInvalid) {
            let fileName: string = generatePdfFileName(`${hazardFormDetail?.SiteName?.replace(/\s+/g, '')}_HZ`);

            let fileblob: any = await generateAndSaveKendoHazardPDF("HazardReportDetail", fileName, false, false);
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
                StateName: hazardFormDetail?.State || "All State",
                SiteName: hazardFormDetail?.SiteName || "All Site",
                EmailType: "HazardFormDetailPDF",
                ReportName: "Hazard Report"
            };
            props.provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                props.provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {

                    const logObj = {
                        UserName: props.loginUserRoleDetails?.title,
                        SiteNameId: hazardFormDetail?.SiteNameId,
                        ActionType: UserActivityActionTypeEnum.SendEmail,
                        EntityType: UserActionEntityTypeEnum.HazardReport,
                        EntityName: title,
                        Details: `Send Email Hazard Report to ${sendToEmail}`,
                        LogFor: UserActionLogFor.Both,
                        StateId: stateData?.QCStateId,
                        EntityId: props?.hazardFormId,
                        Email: props.loginUserRoleDetails?.emailId,
                        Count: 1,
                    };
                    void UserActivityLog(props.provider, logObj, props.loginUserRoleDetails);
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

    const onClickClose = () => {

        if (props.isChartView) {
            props.onBack();
        } else {
            // if (props?.componentProps?.originalSiteMasterId) {
            //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            //     props.manageComponentView({
            //         currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.qCStateId, view: props.componentProps.viewType, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "HazardReport",
            //     });
            // } 
            if (isSiteLevelComponent) {
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                    selectedZoneDetails: selectedZoneDetails,
                    isShowDetailOnly: true,
                    pivotName: "IMSKey",
                    subpivotName: "HazardReport",
                });
            }
            else {
                const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                props.manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, view: props.componentProps.viewType, breadCrumItems: breadCrumItems, subpivotName: "HazardReport" });
            }
        }

    };

    // send Email end

    const getHazardFormDataById = async (provider: IDataProvider, context: any, itemId: any) => {
        try {
            const select = [
                HazardFields.ID,
                HazardFields.HazardType,
                HazardFields.HazardSubType,
                HazardFields.SiteName,
                "SiteName/Title",
                "SiteName/Id",
                "SiteName/StateNameValue",
                HazardFields.SubmittedBy,
                // "SubmittedBy/Title",
                HazardFields.Response,
                HazardFields.Created,
                HazardFields.SubmissionDate,
                HazardFields.HazardFormId,
                "Attachments",
                "AttachmentFiles"
            ];
            const expand = ["AttachmentFiles", HazardFields.SiteName];

            const queryOptions: IPnPQueryOptions = {
                select,
                listName: ListNames.HazardFormResponses,
                id: itemId,
                expand: expand
            };

            const data = await provider.getByItemByIDQuery(queryOptions);
            const fixImgURL = `${context.pageContext.web.serverRelativeUrl}/Lists/${ListNames.HazardFormResponses}/Attachments/${data?.ID}/`;

            // const imageUrls: string[] = data?.AttachmentFiles?.map((file: any) =>
            //     file.ServerRelativeUrl || (file.FileName ? fixImgURL + file.FileName : notFoundImage)
            // ) || [];
            // const attachments = data?.AttachmentFiles?.map((file: any) => {
            //     const fileName = file.FileName;
            //     if (fileName === `${data?.HazardFormId}.pdf`) {
            //         return null;
            //     }
            //     const fileUrl = file.ServerRelativeUrl || (fileName ? fixImgURL + fileName : notFoundImage);
            //     const isImage = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff?|jfif|heic|heif)$/i.test(fileName);
            //     return {
            //         fileName,
            //         fileUrl,
            //         isImage: isImage
            //     };
            // })?.filter(Boolean) || [];

            const attachments = data?.AttachmentFiles?.map((file: any) => {
                const fileName = file.FileName;
                if (fileName === `${data?.HazardFormId}.pdf`) return null;

                const fileUrl = file.ServerRelativeUrl || fixImgURL + fileName;

                const fileType = getFileType(fileName);
                return { fileName, fileUrl, fileType, isImage: fileType === 'image' ? true : false };
            })?.filter(Boolean) || [];

            const hazardFormData = JSON.parse(data?.Response);

            const formData = {
                FormID: hazardFormData?.formid,
                HazardFormId: data?.HazardFormId,
                HazardType: data.HazardType || "",
                HazardSubType: data.HazardSubType || "",
                SiteNameId: data?.SiteName?.Id,
                SiteName: data?.SiteName?.Title,
                State: data?.SiteName?.StateNameValue,
                SubmittedBy: hazardFormData?.submittedBy?.name,
                SubmissionDate: data?.SubmissionDate ? formatSPDateToLocal(data?.SubmissionDate, true) : "-",
                Response: hazardFormData,
                Attachment: attachments
            };

            return formData;
        } catch (error: any) {
            console.error("Error fetching hazard form data:", error);
            setIsLoading(false);
            return [];
        }
    };

    const _userActivityLog = async (hazardFormDetail: any) => {
        try {
            let orgSiteId = hazardFormDetail?.SiteNameId;
            let data = await getState(orgSiteId, props.provider);
            setStateData(data[0]);
            if (props?.componentProps?.qCStateId || data[0]?.QCStateId) {
                const todayDate = moment().format("YYYY-MM-DD");
                const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    listName: ListNames.UserActivityLog,
                    filter: `Email eq '${props.loginUserRoleDetails?.emailId}' and EntityId eq '${props?.hazardFormId}' and SiteNameId eq '${orgSiteId}' and EntityType eq '${UserActionEntityTypeEnum.HazardReport}' and ActionType eq 'Details View' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
                };
                const results = await props.provider.getItemsByQuery(queryStringOptions);
                if (results && results.length > 0) {
                    const listData = results.map((data: any) => ({
                        ID: data.ID,
                        Count: data.Count ?? '',
                    }));
                    let updateObj = {
                        Count: listData[0]?.Count + 1,
                    };
                    await props.provider.updateItemWithPnP(updateObj, ListNames.UserActivityLog, Number(listData[0]?.ID));
                } else {
                    const logObj = {
                        UserName: props.loginUserRoleDetails?.title,
                        SiteNameId: orgSiteId,
                        ActionType: UserActivityActionTypeEnum.DetailsView,
                        Email: props.loginUserRoleDetails?.emailId,
                        EntityType: UserActionEntityTypeEnum.HazardReport,
                        EntityId: props?.hazardFormId,
                        EntityName: hazardFormDetail?.HazardFormId,
                        LogFor: UserActionLogFor.Both,
                        Count: 1,
                        Details: "Details View",
                        StateId: props?.componentProps?.qCStateId || data[0]?.QCStateId
                    };
                    void UserActivityLog(props.provider, logObj, props.loginUserRoleDetails);
                }
            }
        } catch (error) {
            console.error("Error fetching user activity log:", error);
        } finally {
            // setIsLoading(false);
        }
    };

    const getHazardData = async () => {
        const data = await getHazardFormDataById(props.provider, props.context, props.hazardFormId);
        setHazardFormDetail(data);
        if (data) {
            _userActivityLog(data);
        }

        setIsLoading(false);
    };

    const getHazardTitleIconUrl = (fileUrl: string, context: any) => {
        if (!fileUrl) return "";

        fileUrl = fileUrl.replace(/^(\.\.\/)+/, "");
        fileUrl = fileUrl.replace(/^\//, "");
        return `${context.pageContext.web.serverRelativeUrl}/${fileUrl}`;
    };


    const getHazardFileContent = async () => {
        const fileName = `${props.context.pageContext.web.serverRelativeUrl}/HazardReportForm/HazardReportForm.json`;
        const fileContent = await props.provider.readFileContent(fileName, 'json');
        fileHazardData.current = fileContent;
    }

    React.useEffect(() => {
        const fetchData = async () => {
            if (props.hazardFormId) {
                await Promise.all([getHazardData(), getHazardFileContent()]);
            } else {
                setHazardFormDetail(null);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [props.hazardFormId]);

    const onClickDownload = async (): Promise<void> => {
        setIsLoading(true);
        let fileName: string = generatePdfFileName(`${hazardFormDetail?.SiteName?.replace(/\s+/g, '')}_HZ`);
        let fileblob: any = await generateAndSaveKendoHazardPDF("HazardReportDetail", fileName, false, true, true);
        setIsLoading(false);
    };

    const onClickAttachment = () => {
        // scrollPosition = window.scrollY;
        setIsAttachmentModalOpen(true);
    }

    const HazardAnswers: React.FC<IProps> = ({ answers, isAttachment }) => {
        let isFileQue = '';
        return (
            <div className="qc-row">

                {answers.map((ans, index) => {
                    const isEmptyValue =
                        ans.value === null ||
                        ans.value === undefined ||
                        ans.value === "" ||
                        (Array.isArray(ans.value) && ans.value.length === 0);
                    if (ans.type === "file" && isAttachment) {
                        isFileQue = ans.label;
                        return null; // do NOT render anything (no empty space)
                    }
                    return (
                        <div className={`${ans.type === "file" ? "qc-col-md-12" : "qc-col-md-6"} mb-3 hazard-ans-wrapper keep-together`} key={index}>
                            {/* Question Label */}

                            <div className="haz-que">{ans.label || "-"}</div>

                            {(ans.type === "text" || ans.type === "textarea" || ans.type === "location") && (
                                <div className="hazard-ans">
                                    {/* <img src={bulletPoint} className="ans-img qclogoims" alt="bullet" /> */}
                                    {!isEmptyValue ? ans.value : HazardEnum.NoInformationProvided}
                                </div>
                            )}

                            {(ans.type === "choice" || ans.type === "radio") &&
                                typeof ans.value === "string" && (
                                    <div className="radio-option">
                                        {!isEmptyValue ? ans.value : HazardEnum.NoInformationProvided}
                                    </div>
                                )}
                            {/* Multuple choice */}
                            {ans.type === "choice" && Array.isArray(ans.value) && !isEmptyValue ? (
                                ans.value.map((val, i) => (
                                    <div className="hazard-ans" key={i}>
                                        {/* <img src={checkImg} className="ans-img qclogoims" alt="check" /> */}
                                        {val}
                                    </div>
                                ))
                            ) : ans.type === "choice" && Array.isArray(ans.value) && isEmptyValue ? (
                                <div className="hazard-ans">-</div>
                            ) : null}

                            {ans.type === "number" && (
                                <div className="hazard-ans d-inline-block">
                                    {!isEmptyValue ? ans.value : HazardEnum.NoInformationProvided}
                                </div>
                            )}

                            {ans.type === "datetime" && (
                                <div className="site-state-text">
                                    {/* {!isEmptyValue
                                        ? formatSPDateToLocal(ans.value, true)
                                        : HazardEnum.NoInformationProvided} */}
                                    {!isEmptyValue
                                        ? ans.value
                                        : HazardEnum.NoInformationProvided}
                                </div>
                            )}

                            {/* File */}
                            {ans.type === "file" && !isAttachment && (
                                <div className="media-image-ans">
                                    {!isEmptyValue ? (
                                        ans.value.map((file: any, i: any) => (
                                            <div className="media-image-list" key={i}>
                                                {file?.fileName.match(
                                                    /\.(jpg|jpeg|png|gif)$/i
                                                ) ? (
                                                    <img
                                                        src={file?.fileUrl}
                                                        className="media-img qclogoims"
                                                        alt="media"
                                                    />
                                                ) : (
                                                    <video
                                                        src={file?.fileUrl}
                                                        className="media-img qclogoims"
                                                        controls
                                                    />
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="hazard-ans">No image available</div>
                                    )}
                                </div>
                            )}

                            {(!ans.type ||
                                !["text", "textarea", "choice", "radio", "number", "datetime", "file"].includes(ans.type)
                            ) && (
                                    <div className="hazard-ans">
                                        {!isEmptyValue ? ans.value : HazardEnum.NoInformationProvided}
                                    </div>
                                )}
                        </div>
                    );
                })}

                {isAttachment && (
                    <div className="qc-col-md-12 mb-3 hazard-ans-wrapper keep-together">
                        <div className="haz-que">{isFileQue ? isFileQue : HazardViewFields.UploadedPhoto}</div>

                        {hazardFormDetail?.Attachment?.length > 0 ? (
                            <div className="media-image-ans">
                                {hazardFormDetail.Attachment.map((file: any, i: number) => (
                                    // <div className="media-image-list" key={i}>
                                    //     <img
                                    //         src={file}
                                    //         className="media-img qclogoims"
                                    //         alt="media"
                                    //     />
                                    // </div>
                                    <div className="media-image-list" key={i}>
                                        {file?.fileType === 'image' ? (
                                            <img src={file?.fileUrl} className="media-img qclogoims" alt="media" onClick={onClickAttachment} />
                                        ) : (
                                            <>
                                                <video src={file?.fileUrl} className="media-img qclogoims noExport" controls />
                                                <img
                                                    src={hazardVideoImg}
                                                    className="media-img qclogoims dnone" alt="media"
                                                />
                                            </>


                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="hazard-ans">No image available</div>
                        )}
                    </div>
                )}

            </div>
        );
    };

    return (
        <div className="hazard-Detail">
            <div className="qc-hazardform ">
                {isLoading && <Loader />}
                <div className="qc-container" style={{ marginTop: props.isChartView ? "" : "75px" }}>
                    <div className="qc-row">
                        <div className="col-md-12">
                            {!props.hidebtn && (
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
                                            <FontAwesomeIcon icon="download" className="clsbtnat" />
                                            <div>PDF</div>
                                        </PrimaryButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div id="HazardReportDetail" className="pdfHazardDiv">
                    <div id="pdf-border-wrap">
                        <div className="qc-container">
                            <div className="qc-row qc-row qchazard-form-content">
                                <ResponseHeader
                                    isHazardForm={true}
                                    header={`${hazardFormDetail?.HazardFormId}`}
                                    title="Hazard Report"
                                />
                                <div className="qc-col-md-12 mb-3 pdf-hazard-mb0">
                                    {/* <div className="qchazard-form-content"> */}
                                    <div className="">
                                        <div className="qc-row">
                                            {/* <div className="qc-col-12 noExport">
                                            <div className="qc-form-title">
                                                <h1>Hazard ID: {hazardFormDetail?.HazardFormId}</h1>
                                            </div>
                                        </div> */}

                                            <div className="qc-col-md-6 mb-3">
                                                <label className="qc-form-label d-block">Site Name</label>
                                                <div className="hightlight-text hightlight-text-main fw-bold">
                                                    {hazardFormDetail?.SiteName}
                                                    {/* <span className="site-state-text">({hazardFormDetail?.State})</span> */}
                                                </div>
                                            </div>
                                            <div className="qc-col-md-6 mb-3">
                                                <label className="qc-form-label d-block">State</label>
                                                <div className="hightlight-text hightlight-text-main fw-bold">
                                                    {/* {hazardFormDetail?.SiteName} */}
                                                    {/* <span className="site-state-text"> */}
                                                    {hazardFormDetail?.State}

                                                    {/* </span> */}
                                                </div>
                                            </div>
                                            <div className="qc-col-md-3 qc-col-6 mb-3">
                                                <label className="qc-form-label d-block">Hazard Type</label>
                                                <div className="hazard-badge">{hazardFormDetail?.HazardType}</div>
                                            </div>

                                            <div className="qc-col-md-3 qc-col-6 mb-3">
                                                <label className="qc-form-label d-block">Sub Hazard Type</label>
                                                <div className="subhazard-badge">{hazardFormDetail?.HazardSubType}</div>
                                            </div>

                                            <div className="qc-col-md-3 qc-col-6 mb-3">
                                                <label className="qc-form-label d-block">Date of Submission</label>
                                                <div className="hightlight-text">{hazardFormDetail?.SubmissionDate}</div>
                                            </div>

                                            <div className="qc-col-md-3 qc-col-6 mb-3">
                                                <label className="qc-form-label d-block">{HazardViewFields.SubmittedBy}</label>
                                                <div>{hazardFormDetail?.SubmittedBy}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* PROVIDE DETAILS SECTION */}
                                <div className="qc-col-md-12 mb-3 pdf-hazard-mb0 bt-2">
                                    {/* <div className="qchazard-form-content"> */}
                                    <div className="question-ans">
                                        <div className="qc-row">
                                            <div className="qc-col-12">
                                                <div className="qc-form-title title-back-group">
                                                    <div className="flex-center">
                                                        <img src={getHazardTitleIconUrl(fileHazardData.current?.titles?.viewDynamicQuestionTitle?.iconUrl, props.context) || fileCircleInfo} alt="Provide Details" className="form-img qclogoims" />
                                                        <h1>{fileHazardData.current?.titles?.viewDynamicQuestionTitle?.title || HazardEnum.HazardResponseDetails}</h1>
                                                    </div>
                                                </div>
                                            </div>
                                            {hazardFormDetail && <HazardAnswers
                                                answers={hazardFormDetail?.Response?.response?.hazardType?.subHazardType?.answers || []}
                                                isAttachment={false}
                                            />}
                                        </div>
                                    </div>
                                </div>

                                {/* COMMON DETAILS */}
                                <div className="qc-col-md-12 mb-3 pdf-hazard-mb0 bt-2">
                                    {/* <div className="qchazard-form-content"> */}
                                    <div className="question-ans">
                                        <div className="qc-row">
                                            <div className="qc-col-12">
                                                <div className="qc-form-title title-back-group">
                                                    <div className="flex-center">
                                                        {/* <img src={termsInfo} alt="Common Details" className="form-img qclogoims" />
                                                    <h1>Common Details</h1> */}
                                                        <img src={getHazardTitleIconUrl(fileHazardData.current?.titles?.viewCommonQuestionTitle?.iconUrl, props.context) || termsInfo} alt="Provide Details" className="form-img qclogoims" />
                                                        <h1>
                                                            {fileHazardData.current?.titles?.viewCommonQuestionTitle?.title || HazardEnum.CommonDetails}
                                                        </h1>

                                                    </div>
                                                </div>
                                            </div>

                                            {hazardFormDetail && <HazardAnswers
                                                answers={hazardFormDetail?.Response?.response?.commonQuestions.answers || []}
                                                isAttachment={true}
                                            />}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isAttachmentModalOpen && <AttachmentDialog
                    isOpen={isAttachmentModalOpen}
                    onClose={() => {
                        setIsAttachmentModalOpen(false);
                    }}
                    selectedItem={hazardFormDetail}
                    isView={true}
                />}

            </div>
        </div>

    );
};
