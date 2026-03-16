import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PrimaryButton } from "office-ui-fabric-react";
import React from "react";
import { IDataProvider } from "../../../../../../DataProvider/Interface/IDataProvider";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { generateAndSaveKendoHazardPDF, getclientResponseStatusClassName, removeElementOfBreadCrum, UserActivityLog } from "../../../../../../Common/Util";
import { formatSPDateToLocal, generatePdfFileName, getFileType, getState } from "../../../CommonComponents/CommonMethods";
import { Loader } from "../../../CommonComponents/Loader";
import { useBoolean } from "@fluentui/react-hooks";
import { IFileWithBlob } from "../../../../../../DataProvider/Interface/IFileWithBlob";
import { toastService } from "../../../../../../Common/ToastService";
import CommonPopup from "../../../CommonComponents/CommonSendEmailPopup";
import moment from "moment";
import { HazardEnum } from "../../../../../../Common/Enum/HazardFields";
import AttachmentDialog from "../../IMS/HazardReport/AttachmentDialog";
import { ClientResponseEnum, ClientResponseFields, ClientResponseViewFields } from "../ClientResponseFields";
import { CRPivotEnum } from "../../../../../../Common/Enum/WasteReportEnum";
import ResponseHeader from "../../IMS/HazardReport/HazardHeader";
import { useAtomValue } from "jotai";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
// const fileCircleInfo = require("../../../../assets/images/hazardImages/file-circle-info.svg");
const termsInfo = require("../../../../assets/images/hazardImages/terms-info.svg");
// const bulletPoint = require("../../../../assets/images/hazardImages/bullet-point.png");
const hazardVideoImg = require("../../../../assets/images/hazardImages/HazardVideo.png");
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
export const ViewClientResponseFormDetail = (props: any) => {
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const [formDetail, setFormDetail] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [stateData, setStateData] = React.useState<any>("");
    const [title, setTitle] = React.useState<string>("");
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
    const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
    const [displayerror, setDisplayError] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = React.useState(false);
    const [attachmentViewType, setAttachmentViewType] = React.useState<
        "CLIENT" | "CLEANER" | null
    >(null);
    const clientResponseFileData = React.useRef<any>();
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
            let fileName: string = generatePdfFileName(`${formDetail?.SiteName?.replace(/\s+/g, '')}_CR`);

            let fileblob: any = await generateAndSaveKendoHazardPDF("ResponseDetail", fileName, false, false);
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
                StateName: formDetail?.State || "All State",
                SiteName: formDetail?.SiteName || "All Site",
                EmailType: "ClientResponseFormDetailPDF",
                ReportName: "Client Feedback"
            };
            props.provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                props.provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {

                    const logObj = {
                        UserName: props.loginUserRoleDetails?.title,
                        SiteNameId: formDetail?.SiteNameId,
                        ActionType: UserActivityActionTypeEnum.SendEmail,
                        EntityType: UserActionEntityTypeEnum.ClientResponse,
                        EntityName: title,
                        Details: `Send Email Client Feedback to ${sendToEmail}`,
                        LogFor: UserActionLogFor.Both,
                        StateId: stateData?.QCStateId,
                        EntityId: props?.responseFormId,
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
            if (isSiteLevelComponent) {
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                    selectedZoneDetails: selectedZoneDetails,
                    isShowDetailOnly: true,
                    pivotName: "CRIssueListKey",
                    subpivotName: "CRPivotEnum.IssueKey",
                });
            }
            else {
                const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
                props.manageComponentView({ currentComponentName: ComponentNameEnum.ListCRIssues, view: props?.componentProps?.view, breadCrumItems: breadCrumItems });
            }
            // if (props?.componentProps?.originalSiteMasterId) {
            //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            //     props.manageComponentView({
            //         currentComponentName: ComponentNameEnum.AddNewSite, qCStateId: props?.componentProps?.qCStateId, view: props.componentProps.viewType, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "CRIssueListKey", subpivotName: CRPivotEnum.IssueKey,
            //     });
            // } else {
            //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            //     props.manageComponentView({ currentComponentName: ComponentNameEnum.ListCRIssues, view: props?.componentProps?.view, breadCrumItems: breadCrumItems });
            // }
        }

    };

    // send Email end

    const getFormDataById = async (provider: IDataProvider, context: any, itemId: any) => {
        try {
            const select = [
                ClientResponseFields.ID,
                ClientResponseFields.Category,
                ClientResponseFields.SubCategory,
                ClientResponseFields.SiteName,
                "SiteName/Title",
                "SiteName/Id",
                "SiteName/StateNameValue",
                "ResolvedByName",
                "ResolvedDate",
                ClientResponseFields.ReportedBy,
                ClientResponseFields.ClientResponseStatus,
                ClientResponseFields.Comment,
                ClientResponseFields.Response,
                ClientResponseFields.Created,
                ClientResponseFields.SubmissionDate,
                ClientResponseFields.ResponseFormId,
                "Attachments",
                "AttachmentFiles"
            ];
            const expand = ["AttachmentFiles", ClientResponseFields.SiteName];

            const queryOptions: IPnPQueryOptions = {
                select,
                listName: ListNames.ClientResponsesSubmission,
                id: itemId,
                expand: expand
            };

            const data = await provider.getByItemByIDQuery(queryOptions);
            const fixImgURL = `${context.pageContext.web.serverRelativeUrl}/Lists/${ListNames.ClientResponsesSubmission}/Attachments/${data?.ID}/`;

            console.log(data);
            const attachments = data?.AttachmentFiles?.map((file: any) => {
                const fileName = file.FileName;
                if (fileName === `${data?.ResponseFormId}.pdf`) return null;

                const fileUrl = file.ServerRelativeUrl || fixImgURL + fileName;

                const fileType = getFileType(fileName);
                return { fileName, fileUrl, fileType, isImage: fileType === 'image' ? true : false };
            })?.filter(Boolean) || [];

            const responseFormData = JSON.parse(data?.Response);

            const formData = {
                FormID: responseFormData?.formid,
                ResponseFormId: data?.ResponseFormId,
                Category: data.Category || "",
                SubCategory: data.SubCategory || "",
                SiteNameId: data?.SiteName?.Id,
                SiteName: data?.SiteName?.Title,
                State: data?.SiteName?.StateNameValue,
                ReportedBy: data?.ReportedBy,
                Status: data?.Status,
                Comment: data?.Comment,
                ResolveDate: data?.ResolvedDate ? formatSPDateToLocal(data?.ResolvedDate, true) : "-",
                ResolvedByName: data?.ResolvedByName,
                // SubmittedBy: responseFormData?.submittedBy?.name,
                SubmissionDate: data?.SubmissionDate ? formatSPDateToLocal(data?.SubmissionDate, true) : "-",
                Response: responseFormData,
                Attachment: attachments
            };

            return formData;
        } catch (error: any) {
            console.error("Error fetching client feedback form data:", error);
            setIsLoading(false);
            return [];
        }
    };

    const _userActivityLog = async (formDetail: any) => {
        try {
            let orgSiteId = formDetail?.SiteNameId;
            let data = await getState(orgSiteId, props.provider);
            setStateData(data[0]);
            if (props?.componentProps?.qCStateId || data[0]?.QCStateId) {
                const todayDate = moment().format("YYYY-MM-DD");
                const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    listName: ListNames.UserActivityLog,
                    filter: `Email eq '${props.loginUserRoleDetails?.emailId}' and EntityId eq '${props?.responseFormId}' and SiteNameId eq '${orgSiteId}' and EntityType eq '${UserActionEntityTypeEnum.ClientResponse}' and ActionType eq 'Details View' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
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
                        EntityType: UserActionEntityTypeEnum.ClientResponse,
                        EntityId: props?.responseFormId,
                        EntityName: formDetail?.ResponseFormId,
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

    const onClickClientAttachment = () => {
        setAttachmentViewType("CLIENT");
        setIsAttachmentModalOpen(true);
    };

    const onClickCleanerAttachment = () => {
        setAttachmentViewType("CLEANER");
        setIsAttachmentModalOpen(true);
    };

    const getFormData = async () => {
        const data = await getFormDataById(props.provider, props.context, props.responseFormId);
        setFormDetail(data);
        if (data) {
            _userActivityLog(data);
        }

        setIsLoading(false);
    };

    const getTitleIconUrl = (fileUrl: string, context: any) => {
        if (!fileUrl) return "";

        fileUrl = fileUrl.replace(/^(\.\.\/)+/, "");
        fileUrl = fileUrl.replace(/^\//, "");
        return `${context.pageContext.web.serverRelativeUrl}/${fileUrl}`;
    };


    const getClientResponseFileContent = async () => {
        const siteCategoryId = props.componentProps?.dataObj?.SiteCategoryId || undefined;

        if (siteCategoryId) {
            const filter = `SiteCategoryId eq ${siteCategoryId}`
            const fileContent = await props.provider.getFileContentByFilter(ListNames.ClientResponseForm, 'json', filter);
            clientResponseFileData.current = fileContent;
        } else {
            const fileName = `${props.context.pageContext.web.serverRelativeUrl}/ClientResponseForm/DefaultForm.json`;
            const fileContent = await props.provider.readFileContent(fileName, 'json');
            clientResponseFileData.current = fileContent;
        }
    }

    React.useEffect(() => {
        const fetchData = async () => {
            if (props.responseFormId) {
                await Promise.all([getFormData(), getClientResponseFileContent()]);
            } else {
                setFormDetail(null);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [props.responseFormId]);

    const onClickDownload = async (): Promise<void> => {
        setIsLoading(true);
        let fileName: string = generatePdfFileName(`${formDetail?.SiteName?.replace(/\s+/g, '')}_CR`);
        await generateAndSaveKendoHazardPDF("ResponseDetail", fileName, false, true, true);
        setIsLoading(false);
    };

    const onClickAttachment = () => {
        // scrollPosition = window.scrollY;
        setIsAttachmentModalOpen(true);
    }

    const clientAttachments =
        formDetail?.Attachment?.filter(
            (file: any) => !file.fileName?.toLowerCase().startsWith("cleaner_")
        ) || [];

    const cleanerAttachments =
        formDetail?.Attachment?.filter(
            (file: any) => file.fileName?.toLowerCase().startsWith("cleaner_")
        ) || [];

    const ResponseAnswers: React.FC<IProps> = ({ answers, isAttachment }) => {
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
                        return null;
                    }
                    return (
                        <div className={`${ans.type === "file" ? "qc-col-md-12" : "qc-col-md-6"} mb-3 hazard-ans-wrapper keep-together`} key={index}>
                            {/* Question Label */}

                            <div className="haz-que">{ans.label || "-"}</div>

                            {(ans.type === "text" || ans.type === "textarea") && (
                                <div className="hazard-ans">
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
                        <div className="haz-que">{isFileQue ? isFileQue : ClientResponseViewFields.UploadedPhoto}</div>

                        {clientAttachments?.length > 0 ? (
                            <div className="media-image-ans">
                                {/* {formDetail.Attachment.map((file: any, i: number) => ( */}
                                {clientAttachments.map((file: any, i: number) => (
                                    <div className="media-image-list" key={i}>
                                        {file?.fileType === 'image' ? (
                                            <img src={file?.fileUrl} className="media-img qclogoims" alt="media" onClick={onClickClientAttachment} />
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
                <div id="ResponseDetail" className="pdfHazardDiv">
                    <div id="pdf-border-wrap">
                        <div className="qc-container mb-80">
                            <div className="qc-row qc-row qchazard-form-content">
                                <ResponseHeader
                                    isHazardForm={false}
                                    header={`${formDetail?.ResponseFormId}`}
                                    title={ClientResponseViewFields.ClientResponse}
                                />
                                <div className="qc-col-md-12 mb-3 pdf-hazard-mb0">
                                    <div className="">
                                        <div className="qc-row">
                                            <div className="qc-col-md-3 qc-col-6 mb-3">
                                                <label className="qc-form-label d-block">{ClientResponseViewFields.SiteName}</label>
                                                <div className="hightlight-text hightlight-text-main fw-bold">
                                                    {formDetail?.SiteName}
                                                </div>
                                            </div>
                                            <div className="qc-col-md-3 qc-col-6 mb-3">
                                                <label className="qc-form-label d-block">{ClientResponseViewFields.State}</label>
                                                <div className="hightlight-text hightlight-text-main fw-bold">
                                                    {formDetail?.State}
                                                </div>
                                            </div>
                                            <div className="qc-col-md-3 qc-col-6 mb-3">
                                                <label className="qc-form-label d-block">{ClientResponseViewFields.Category}</label>
                                                <div className="hazard-badge">{formDetail?.Category}</div>
                                            </div>

                                            <div className="qc-col-md-3 qc-col-6 mb-3">
                                                <label className="qc-form-label d-block">{ClientResponseViewFields.SubCategory}</label>
                                                <div className="subhazard-badge">{formDetail?.SubCategory}</div>
                                            </div>

                                            <div className="qc-col-md-3 qc-col-6 mb-3">
                                                <label className="qc-form-label d-block">Date of Submission</label>
                                                <div className="hightlight-text">{formDetail?.SubmissionDate}</div>
                                            </div>

                                            {/* <div className="qc-col-md-3 qc-col-6 mb-3">
                                                <label className="qc-form-label d-block">{ClientResponseViewFields.ReportedBy}</label>
                                                <div>{formDetail?.ReportedBy}</div>
                                            </div> */}

                                            <div className="qc-col-md-3 qc-col-6 mb-3">
                                                <label className="qc-form-label d-block">Status</label>
                                                <div className={getclientResponseStatusClassName(formDetail?.Status)}>{formDetail?.Status}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* <div className="qc-col-md-12 mb-3 pdf-hazard-mb0 bt-2">
                                    <div className="question-ans">
                                        <div className="qc-row">
                                            <div className="qc-col-12">
                                                <div className="qc-form-title title-back-group">
                                                    <div className="flex-center">
                                                        <img src={getTitleIconUrl(clientResponseFileData.current?.titles?.viewDynamicQuestionTitle?.iconUrl, props.context) || fileCircleInfo} alt="Provide Details" className="form-img qclogoims" />
                                                        <h1>{clientResponseFileData.current?.titles?.viewDynamicQuestionTitle?.title || HazardEnum.HazardResponseDetails}</h1>
                                                    </div>
                                                </div>
                                            </div>
                                            {formDetail && <ResponseAnswers
                                                answers={formDetail?.Response?.response?.hazardType?.subHazardType?.answers || []}
                                                isAttachment={false}
                                            />}
                                        </div>
                                    </div>
                                </div> */}

                                <div className="qc-col-md-12 mb-3 pdf-hazard-mb0 bt-2">
                                    <div className="question-ans">
                                        <div className="qc-row">
                                            <div className="qc-col-12">
                                                <div className="qc-form-title title-back-group">
                                                    <div className="flex-center">
                                                        <img src={getTitleIconUrl(clientResponseFileData.current?.commonSection?.iconUrl, props.context) || termsInfo} alt="Provide Details" className="form-img qclogoims" />
                                                        <h1>
                                                            {clientResponseFileData.current?.titles?.commonSection?.title || ClientResponseEnum.CommonDetails}
                                                        </h1>
                                                    </div>
                                                </div>
                                            </div>

                                            {formDetail && <ResponseAnswers
                                                answers={formDetail?.Response?.response || []}
                                                isAttachment={true}
                                            />}
                                        </div>
                                    </div>
                                </div>
                                {/* ================= CLEANER RESPONSE DETAILS ================= */}
                                {['Resolved', 'Not an Issue'].includes(formDetail?.Status) && <div className="qc-col-md-12 mb-3 pdf-hazard-mb0 bt-2">
                                    <div className="question-ans">
                                        <div className="qc-row">
                                            <div className="qc-col-12">
                                                <div className="qc-form-title title-back-group">
                                                    <div className="flex-center">
                                                        <img src={getTitleIconUrl(clientResponseFileData.current?.commonSection?.iconUrl, props.context) || termsInfo} alt="Provide Details" className="form-img qclogoims" />
                                                        <h1>Cleaner Response Details</h1>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="qc-col-md-6 mb-3 hazard-ans-wrapper keep-together">
                                                <label className="qc-form-label d-block">Resolve Date</label>
                                                <div className="hightlight-text">{formDetail?.ResolveDate}</div>
                                            </div>
                                            <div className="qc-col-md-6 mb-3 hazard-ans-wrapper keep-together">
                                                <label className="qc-form-label d-block">Resolve By</label>
                                                <div className="hightlight-text">{formDetail?.ResolvedByName}</div>
                                            </div>
                                            <div className="qc-col-12 mb-3 hazard-ans-wrapper keep-together">
                                                <label className="qc-form-label d-block">Comment</label>
                                                {formDetail?.Comment ?
                                                    <div className="hightlight-text">{formDetail?.Comment}</div>
                                                    : <div className="hazard-ans">No Comment</div>}
                                            </div>
                                            <div className="qc-col-md-12 mb-3 hazard-ans-wrapper keep-together">
                                                <div className="haz-que mb-3">Uploaded Images</div>

                                                <div className="media-image-ans">
                                                    {cleanerAttachments?.length > 0
                                                        ? cleanerAttachments.map((file: any, i: number) => (
                                                            <div className="media-image-list" key={i}>
                                                                {file.fileType === "image" ? (
                                                                    <img
                                                                        src={file.fileUrl}
                                                                        className="media-img qclogoims"
                                                                        alt="cleaner upload"
                                                                        onClick={onClickCleanerAttachment}
                                                                    />
                                                                ) : (
                                                                    <video
                                                                        src={file.fileUrl}
                                                                        className="media-img qclogoims"
                                                                        controls
                                                                    />
                                                                )}
                                                            </div>
                                                        )) : (
                                                            <div className="hazard-ans">No image available</div>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>}
                                <div className="va-b inlineBlock mb-3">
                                    <PrimaryButton
                                        className="btn btn-danger send-email-btn justifyright floatright"
                                        text="Close"
                                        onClick={onClickClose}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isAttachmentModalOpen && (
                    <AttachmentDialog
                        isOpen={isAttachmentModalOpen}
                        onClose={() => {
                            setIsAttachmentModalOpen(false);
                            setAttachmentViewType(null);
                        }}
                        selectedItem={{
                            ...formDetail,
                            Attachment:
                                attachmentViewType === "CLEANER"
                                    ? cleanerAttachments
                                    : clientAttachments
                        }}
                        isView={true}
                    />
                )}
            </div>
        </div>

    );
};
