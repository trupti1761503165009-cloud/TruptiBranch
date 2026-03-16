/* eslint-disable react/self-closing-comp */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { Link, PrimaryButton, ProgressIndicator, TooltipHost } from "@fluentui/react";
import * as React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { CommonConstSiteName, ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../Common/ToastService";
import { logGenerator, removeElementOfBreadCrum, generateAndSaveKendoPDF, UserActivityLog } from "../../../../../../Common/Util";
import { IFileWithBlob } from "../../../../../../DataProvider/Interface/IFileWithBlob";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IHelpDeskFormProps, IHelpDeskFormState } from "../../../../../../Interfaces/IAddNewHelpDesk";
import CommonPopup from "../../../CommonComponents/CommonSendEmailPopup";
import CustomModal from "../../../CommonComponents/CustomModal";
import { Loader } from "../../../CommonComponents/Loader";
import moment from "moment";
import { Accordion } from "@pnp/spfx-controls-react/lib/controls/accordion/Accordion";
import InductionCertificate from "./PDFInduction";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import { DateFormat } from "../../../../../../Common/Constants/CommonConstants";
const imgLogo = require('../../../../assets/images/logo.png');

export const DetailInduction: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const [value, setValue] = React.useState(props.initialValue);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail } = appGlobalState;
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
    const [SiteName, setSiteName] = React.useState<any>(props?.breadCrumItems[0]?.text);
    const [StateName, setStateName] = React.useState<string>(props?.componentProps?.loginUserRoleDetails?.userItems[0]?.QCState?.Title);
    const [title, setTitle] = React.useState<string>("");
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
    const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
    const [displayerror, setDisplayError] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const notFoundImage = require('../../../../../quayClean/assets/images/NotFoundImg.png');
    const [CleanerName, setCleanerName] = React.useState<string>("");
    const [ChairPersonName, setChairPersonName] = React.useState<string>("");
    const [InductionData, setInductionData] = React.useState<any[]>([]);
    const tooltipId = useId('tooltip');
    const [InductionDetailData, setInductionDetailData] = React.useState<any[]>([]);
    const [UserCourseData, setUserCourseData] = React.useState<any[]>([]);
    const [CourseMasterData, setCourseMasterData] = React.useState<any[]>([]);


    const [detailData, setDetailData] = React.useState<any>(null);
    const [courseData, setCourseData] = React.useState<any>(null);


    const _getInductionMasterList = () => {
        setIsLoading(true);
        try {
            // let custfilter = "IsActive eq 1 and IsDeleted ne 1"; // Start with IsActive filter
            const select = ["ID,Title,InductionDate,InductionID,FormStatus,IsActive,ChairpersonId,Chairperson/Title,AttendeesEmailId,AttendeesEmail/Email,AttendeesEmail/Id,AttendeesEmail/Title,SiteNameId,SiteName/Title,Attendees,Created,Modified,ContractorEmailId,ContractorEmail/Email,ContractorEmail/Id,ContractorEmail/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteName,AttendeesEmail,Chairperson,ContractorEmail"],
                filter: `ID eq '${props.siteMasterId}'`,
                listName: ListNames.InductionMaster,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const listData = results.map((data) => {
                        let fullAttendees: any = [];
                        if (data.ContractorEmailId.length > 0) {
                            const emails = [...data.AttendeesEmail, ...data.ContractorEmail]
                            fullAttendees = emails
                        } else {
                            fullAttendees = data.AttendeesEmailId ? data.AttendeesEmail : []
                        }
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                InductionDate: !!data.InductionDate ? moment(data.InductionDate).format(DateFormat) : '',
                                OrgInductionDate: !!data.InductionDate ? data.InductionDate : null,
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : '',
                                SiteName: !!data.SiteName ? data.SiteName.Title : '',
                                InductionID: !!data.InductionID ? data.InductionID : '',
                                Attendees: !!data.Attendees ? data.Attendees : '',
                                Created: !!data.Created ? moment(data.Created).format('DD/MM/YYYY hh:mm A') : '',
                                Modified: !!data.Modified ? data.Modified : null,
                                FormStatus: !!data.FormStatus ? data.FormStatus : '',
                                IsActive: !!data.IsActive ? data.IsActive : false,
                                ChairpersonID: !!data.ChairpersonId ? data.ChairpersonId : null,
                                Chairperson: !!data.ChairpersonId ? data.Chairperson.Title : null,
                                AttendeesEmailId: !!data.AttendeesEmailId ? data.AttendeesEmailId : [],
                                ContractorEmailId: !!data.ContractorEmailId ? data.ContractorEmailId : [],
                                FullAttendees: fullAttendees,
                            }
                        );
                    });
                    setChairPersonName(listData[0]?.Chairperson)
                    let filteredData: any[];
                    if (!!props.siteMasterId || props.loginUserRoleDetails?.isAdmin) {
                        filteredData = listData;
                    } else {
                        let AllSiteIds: any[] = props.loginUserRoleDetails?.currentUserAllCombineSites || [];
                        filteredData = !!listData && listData?.filter(item =>
                            AllSiteIds.includes(item?.SiteNameId)
                        );
                    }
                    filteredData = filteredData?.sort((a: any, b: any) => {
                        return moment(b.Modified).diff(moment(a.Modified));
                    });
                    setInductionData(filteredData);
                    _getInductionDetailList(listData[0]);
                    // setIsLoading(false);

                }
            }).catch((error: any) => {
                console.log(error);
                const errorObj = { ErrorMethodName: "_getCorrectiveActionReportList", CustomErrormessage: "error in get Question data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(props.provider, errorObj);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_getCorrectiveActionReportList", CustomErrormessage: "error in get Question data", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const _getInductionDetailList = async (item: any) => {
        try {
            const select = ["ID,InductionMasterId,AttendeesEmailId,AttendeesEmail/Email,AttendeesEmail/Id,AttendeesEmail/Title,ContractorEmailId,ContractorEmail/Email,ContractorEmail/Id,ContractorEmail/Title,InductionKey,Created,Signature"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["AttendeesEmail,ContractorEmail"],
                filter: `InductionMasterId eq '${item.ID}'`,
                listName: ListNames.InductionDetail,
            };
            await props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {

                    const listDetailData = results.map((data) => {
                        let fullAttendees: any = [];
                        if (data.ContractorEmailId) {
                            fullAttendees = data.ContractorEmail
                        } else {
                            fullAttendees = data.AttendeesEmailId ? data.AttendeesEmail : []
                        }
                        return {
                            ID: data.ID,
                            InductionKey: data.InductionKey || '',
                            AttendeesEmailId: data.AttendeesEmailId || [],
                            ContractorEmailId: data.ContractorEmailId || [],
                            FullAttendees: fullAttendees,
                            OrgCreated: data.Created || '',
                            Signature: data.Signature || '',
                            Created: data.Created ? moment(data.Created).format(DateFormat) : '',
                            Time: data.Created ? moment(data.Created).format('hh:mm') : '',
                            CompletionDate: data.Created
                                ? moment(data.Created).add(1, 'month').format(DateFormat)
                                : '',
                            ExpiryDate: data.Created
                                ? moment(data.Created).add(1, 'year').format(DateFormat)
                                : ''
                        };
                    });
                    let filterdata: any;
                    if (SiteName === CommonConstSiteName.SydneyShowground) {
                        filterdata = listDetailData.filter(items => (items.AttendeesEmailId === props?.componentProps?.MasterId || items.ContractorEmailId === props?.componentProps?.MasterId));
                    } else {
                        filterdata = listDetailData.filter(items => items.AttendeesEmailId === props?.componentProps?.MasterId);
                    }

                    setInductionDetailData(filterdata);
                    if (filterdata.length > 0) {
                        _getUserCourseInductionDetail(filterdata);
                    }
                }
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
        }
    };

    const _getUserCourseInductionDetail = async (items: any) => {
        try {
            const select = ["ID,InductionDetailId,CourseMasterId,CourseMaster/Title,TotalCorrectAnswers,TotalWrongAnswers,TotalQuestions"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["CourseMaster"],
                filter: items.map((i: any) => `InductionDetailId eq '${i.ID}'`).join(" or "),
                listName: ListNames.UserCourseInductionDetail,
            };
            await props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const listData = results.map((data) => {
                        const totalCorrect = data.TotalCorrectAnswers || 0;
                        const totalWrong = data.TotalWrongAnswers || 0;
                        const totalQuestions = data.TotalQuestions || 0;

                        return {
                            ID: data.ID,
                            InductionDetailId: data.InductionDetailId || '',
                            CourseMasterId: data.CourseMasterId || 0,
                            CourseMaster: data.CourseMaster?.Title || '',
                            TotalCorrectAnswers: totalCorrect,
                            TotalWrongAnswers: totalWrong,
                            TotalQuestions: totalQuestions,
                            Status: totalCorrect + totalWrong === totalQuestions ? "Complete" : "Pending",
                            Percentage: totalQuestions > 0 ? ((totalCorrect + totalWrong) / totalQuestions) * 100 : 0
                        };
                    });

                    const inductionDetailIds = listData.length > 0
                        ? Array.from(new Set(listData.map(item => item.InductionDetailId)))
                        : items.map((item: any) => item.ID); // Use items' IDs if listData is empty

                    // Create a map for quick lookup of existing records
                    const courseMasterMap = new Map<string, Set<number>>();

                    listData.forEach((item: any) => {
                        const key = `${item.InductionDetailId}`;
                        if (!courseMasterMap.has(key)) {
                            courseMasterMap.set(key, new Set());
                        }
                        courseMasterMap.get(key)?.add(item.CourseMasterId);
                    });

                    // Generate missing records
                    const missingRecords = inductionDetailIds.flatMap((inductionDetailId: any) =>
                        CourseMasterData.filter(course =>
                            !courseMasterMap.get(`${inductionDetailId} `)?.has(course.ID)
                        ).map(course => ({
                            ID: 0,
                            InductionDetailId: inductionDetailId,
                            CourseMasterId: course.ID,
                            CourseMaster: course.Title,
                            TotalCorrectAnswers: 0,
                            TotalWrongAnswers: 0,
                            TotalQuestions: 0,
                            Status: "Pending"
                        }))
                    );

                    // If listData is empty, initialize it with items (setting InductionDetailId = ID)
                    const baseData = listData.length > 0 ? listData : items.map((item: any) => ({
                        ID: 0,
                        InductionDetailId: item.ID, // Set InductionDetailId from item.ID
                        CourseMasterId: 0,
                        CourseMaster: "",
                        TotalCorrectAnswers: 0,
                        TotalWrongAnswers: 0,
                        TotalQuestions: 0,
                        Status: "Pending"
                    }));

                    // Merge existing records with missing ones
                    // let FinalData = [...baseData, ...missingRecords];
                    const mergeCourseData = (baseData: any[], missingRecords: any[]): any[] => {
                        // Create a Set of CourseMasterId from baseData for quick lookup
                        const baseDataIds = new Set(baseData.map(item => item.CourseMasterId));

                        // Filter out missingRecords where CourseMasterId exists in baseData
                        const filteredMissingRecords = missingRecords.filter(item => !baseDataIds.has(item.CourseMasterId));

                        // Merge baseData with the filtered missingRecords
                        return [...baseData, ...filteredMissingRecords];
                    };

                    // Example usage
                    const mergedData = mergeCourseData(baseData, missingRecords);

                    const filteredData = mergedData.filter(item =>
                        CourseMasterData?.some(course => course.ID === item.CourseMasterId)
                    );

                    setUserCourseData(filteredData ? filteredData : mergedData);
                    setIsLoading(false);
                }
            }).catch((error: any) => {
                console.log(error);
                setIsLoading(false);
            });
        } catch (ex) {
            console.log(ex);
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
        let fileblob: any = await generateAndSaveKendoPDF("DetailInductionReportPDFCode", SiteName + '- Corrective Action Report', false, true);
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
            const fileName = `${SiteName} Induction`;
            let fileblob: any = await generateAndSaveKendoPDF("DetailInductionReportPDFCode", fileName, false);
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
                EmailType: "InductionReport",
                Cleaner: CleanerName
            };
            props.provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                props.provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
                    console.log("Upload Success");
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: props?.componentProps?.originalSiteMasterId || props?.componentProps?.UpdateItem?.SiteNameId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.SendEmail,
                        EntityType: UserActionEntityTypeEnum.Induction,
                        // EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        EntityName: title, // Match index dynamically
                        Details: `Send Email Induction to ${sendToEmail}`
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

    React.useEffect(() => {
        _getCourseMaster();
    }, []);

    React.useEffect(() => {
        if (CourseMasterData.length > 0)
            _getInductionMasterList();
    }, [CourseMasterData]);

    const _getCourseMaster = () => {
        setIsLoading(true);
        try {
            const queryStringOptions: IPnPQueryOptions = {
                select: ["ID,Title"],
                listName: ListNames.CourseMaster,
                filter: `SiteNameId eq ${props.originalSiteMasterId} and IsDeleted ne 1`,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const listData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                            }
                        );
                    });
                    setCourseMasterData(listData);
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

    const onClickClose = () => {
        if (props?.componentProps?.originalSiteMasterId) {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AddNewSite, view: props.componentProps.viewType, dataObj: props.componentProps.dataObj, breadCrumItems: breadCrumItems, siteMasterId: props.originalSiteMasterId, isShowDetailOnly: true, siteName: props.componentProps.siteName, qCState: props.componentProps.qCState, pivotName: "IMSKey", subpivotName: "Induction",

            });
        } else {
            const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, view: props.componentProps.viewType, breadCrumItems: breadCrumItems, subpivotName: "Induction" });
        }
    };

    const onClickGenerateCert = async (detail: any, course: any) => {
        setDetailData(detail);
        setCourseData(course);
    }

    React.useEffect(() => {
        const generatePDF = async () => {
            if (detailData && courseData) {
                let fileNameGenerator = "";
                if (SiteName === CommonConstSiteName.SydneyShowground) {
                    fileNameGenerator = `${InductionDetailData[0]?.FullAttendees?.Title} - SRES 2025 Induction Certificate`
                } else {
                    fileNameGenerator = `${InductionDetailData[0]?.FullAttendees?.Title} - 2025 Induction Certificate`
                }
                try {
                    // Wait for the PDF generation to complete
                    let fileblob: any = await generateAndSaveKendoPDF(
                        "DetailInductionReportPDF",
                        `${fileNameGenerator}`,
                        false,
                        true
                    );

                    // Clear data only after PDF is generated
                    if (fileblob) {
                        setDetailData(null);
                        setCourseData(null);
                    }
                } catch (error) {
                    console.error("Error generating PDF:", error);
                }
            }
        };

        generatePDF();
    }, [detailData, courseData]);

    return <>
        {isLoading && <Loader />}
        {state.isformValidationModelOpen &&
            <CustomModal
                isModalOpenProps={state.isformValidationModelOpen} setModalpopUpFalse={() => {
                    SetState((prevState: any) => ({ ...prevState, isformValidationModelOpen: false }));
                }} subject={"Missing data"}
                message={state.validationMessage} closeButtonText={"Close"} />}

        <div className="induction-Detail">
            <div className="ms-Grid">
                {InductionData.length > 0 &&
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
                                    <div className="boxCard">
                                        <div id="DetailInductionReportPDFCode">
                                            <div className="head-tbl-space">
                                                <table className="table-toolbox-talk cell-space-0" style={{ width: "100%", border: "1px solid black" }} >
                                                    <tr>
                                                        <th className="th-toolbox-talk-logo pl-10 bg-white br-1" > <img src={imgLogo} height="30px" className="course-img-first img-mt qclogoims" /></th>
                                                        <td className="td-toolbox-talk middle-box">
                                                            {props?.componentProps?.siteName === CommonConstSiteName.SydneyShowground ?
                                                                <div>Sydney Showground Induction</div> :
                                                                <div>University of Queensland Induction</div>}
                                                        </td>
                                                        <td className="td-toolbox-talk blue-box pl-10"><div>Document No</div><div>QC-IN-13-F1</div></td>
                                                    </tr>
                                                </table>
                                            </div>
                                            <div className="meeting-id-cls"><div className="td-toolbox-talk blue-text dflex justify-content-end meeting-spc-cls"><div className="toggle-className">Induction ID: {InductionData[0]?.Title}</div></div></div>
                                            <div className="asset-card-2-header-jcc">
                                                <div className="table-toolbox-talk mt-3">
                                                    <div className="row">
                                                        <div className="td-toolbox-talk-detail"><b>Induction Date:</b></div>
                                                        <div className="td-toolbox-talk-detail">{InductionData[0]?.InductionDate}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="td-toolbox-talk-detail"><b>Induction Send By:</b></div>
                                                        <div className="td-toolbox-talk-detail">{ChairPersonName}</div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="td-toolbox-talk-detail"><b>Induction Candidates:</b></div>
                                                        <div className="td-toolbox-talk-detail badge-css-attendees">
                                                            {
                                                                InductionData[0]?.Attendees.split(',').map((name: any) => (
                                                                    <span className="attendees-badge-cls" key={name.trim()}>
                                                                        {name.trim()}
                                                                    </span>
                                                                ))
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="container-fluid">
                                                <div className="row justify-content-center">
                                                    <div className="col-md-12">
                                                        {InductionDetailData?.map((detail: any) => {
                                                            const courses = UserCourseData?.filter(
                                                                (course: any) => course.InductionDetailId === detail.ID
                                                            );

                                                            return (
                                                                <div className="card mb-3" key={detail.ID}>
                                                                    <div className="card-body">
                                                                        <div className="row">
                                                                            <div className="col-md-12">
                                                                                <Accordion title={detail.FullAttendees.Title} defaultCollapsed={false}>
                                                                                    {courses.length > 0 ? (
                                                                                        courses.map((course: any) => (
                                                                                            <div key={course.ID}>
                                                                                                {course.CourseMaster !== "" && (
                                                                                                    <div className="course-list">
                                                                                                        <div className="course-item d-flex align-items-center p-3 border-bottom">
                                                                                                            {course.Status === "Pending" ? (
                                                                                                                <div className="icon icon-bg-blue fw-bold me-3 text-danger">
                                                                                                                    <FontAwesomeIcon icon={"spinner"} />
                                                                                                                </div>
                                                                                                            ) : (
                                                                                                                <div className="icon icon-bg-green fw-bold me-3 text-danger">
                                                                                                                    <FontAwesomeIcon icon={"check"} />
                                                                                                                </div>
                                                                                                            )}
                                                                                                            <div className="flex-grow-1">
                                                                                                                <small className="text-muted">
                                                                                                                    Complete by <strong>{detail.CompletionDate}</strong>
                                                                                                                </small>
                                                                                                                <br />
                                                                                                                <strong className="mm-w">{course.CourseMaster}</strong>

                                                                                                                {/* ✅ Progress Bar Below Course Title */}
                                                                                                                <div className="mm-w" style={{ width: "100%", marginTop: "8px", background: "#e0e0e0", borderRadius: "5px", height: "8px", overflow: "hidden" }}>
                                                                                                                    <div
                                                                                                                        style={{
                                                                                                                            width: `${course.Percentage}% `,
                                                                                                                            backgroundColor: course.Percentage === 100 ? "#28a745" : course.Percentage > 0 ? "#ffc107" : "transparent",
                                                                                                                            height: "100%",
                                                                                                                            transition: "width 0.5s ease-in-out"
                                                                                                                        }}
                                                                                                                    ></div>
                                                                                                                </div>
                                                                                                                {/* <small className="text-muted">{course?.Percentage?.toFixed(2) || 0}% Completed</small> */}
                                                                                                                <small className="text-muted">
                                                                                                                    {course?.Percentage ? `${Math.round(course.Percentage)}% Completed` : "Not Started"}
                                                                                                                </small>


                                                                                                            </div>

                                                                                                            <span
                                                                                                                className={`badge px-3 py-1 spn-status ${course.Status === "Complete" ? "greenBadge" : "yellowBadgeact"} `}
                                                                                                            >
                                                                                                                {course.Status.toUpperCase()}
                                                                                                            </span>

                                                                                                            {course.Status === "Pending" ? (
                                                                                                                <div></div>
                                                                                                            ) : (
                                                                                                                <Link
                                                                                                                    onClick={() => onClickGenerateCert(detail, course)}
                                                                                                                    className="actionBtn btnDownload dticon mw-24"
                                                                                                                >
                                                                                                                    <TooltipHost content={"Download"} id={`tooltip - ${course.ID} `}>
                                                                                                                        <FontAwesomeIcon icon={"download"} />
                                                                                                                    </TooltipHost>
                                                                                                                </Link>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        ))
                                                                                    ) : (
                                                                                        <p className="text-muted p-3">No courses available</p>
                                                                                    )}



                                                                                </Accordion>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
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
                    </div>

                }
            </div>
            {detailData && courseData && (
                <InductionCertificate detailData={detailData} courseData={courseData} inductionData={props.componentProps.dataObj} />
            )}
        </div>
    </>
};