/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { TooltipHost } from "@fluentui/react";
import * as React from "react";
import { ListNames } from "../../../../../../Common/Enum/ComponentNameEnum";
import { logGenerator } from "../../../../../../Common/Util";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
import { IHelpDeskFormProps } from "../../../../../../Interfaces/IAddNewHelpDesk";
import { Loader } from "../../../CommonComponents/Loader";
import moment from "moment";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useId } from "@fluentui/react-hooks";
import { DateFormat, DateTimeFormate } from "../../../../../../Common/Constants/CommonConstants";



export const GridViewSkillMatrix: React.FC<IHelpDeskFormProps> = (props: IHelpDeskFormProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const { isAddNewHelpDesk, manageComponentView, siteMasterId } = props;
    const [DetailsData, setDetailsData] = React.useState<any[]>([]);
    const [SignatureData, setSignatureData] = React.useState<any[]>([]);
    const [SkillMatrixData, setSkillMatrixData] = React.useState<any[]>([]);
    const [CleanerName, setCleanerName] = React.useState<string>("");
    const tooltipId = useId('tooltip');
    const [IsSD, setIsSD] = React.useState<boolean>(false);
    const [AllSignatureData, seAllSignatureData] = React.useState<any>();
    const [CompentencyData, setCompentencyData] = React.useState<any[]>([]);

    const _CompenencyData = () => {
        try {
            const select = ["ID,Title,Completed,IMSNos,SkillMatrixId,SignatureTrainer,SignatureCleaner,SkillMatrixName,IsTraining,IsInCompletent,IsCompetent"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `SkillMatrixId eq '${props?.siteMasterId}' and IsInCompletent eq 1`,

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

    React.useEffect(() => {
        if (IsSD && SkillMatrixData.length > 0) {
            const generatedRecords = createRecordsForAttendees();
            seAllSignatureData(generatedRecords);
        }
    }, [IsSD, SkillMatrixData]);


    const _SkillMatrixData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,TrainingAttendance,FormStatus,ChairpersonId,Chairperson/Title,Chairperson/EMail,VenueTrained,Created,Modified,AttendeesEmailId,AttendeesEmail/Email"];
            // const select = ["ID,Title,TrainingAttendance,ChairpersonId,Chairperson/Title,Chairperson/EMail,VenueTrained,SiteNameId,SiteName/Title,Created,Modified,AttendeesEmailId,AttendeesEmail/Email"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["AttendeesEmail", "Chairperson"],
                filter: `ID eq '${props?.siteMasterId}' and IsActive eq 1`,
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
                                Chairperson: !!data.Chairperson ? data.Chairperson[0].Title : '',
                                ChairpersonEmail: !!data.Chairperson ? data.Chairperson[0].EMail : ''
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
                    setTimeout(() => {
                        setIsSD(true);
                    }, 500);
                    setSignatureData(SignatureData);
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

    const _SkillMatrixDetailsData = () => {
        try {
            const select = ["ID,Title,Completed,IMSNos,SkillMatrixId,SignatureTrainer,SignatureCleaner,SkillMatrixName,Modified,IsInCompletent,IsCompetent"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `SkillMatrixId eq '${props?.siteMasterId}'`,
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
    React.useEffect(() => {
        if (props?.siteMasterId && props?.siteMasterId > 0) {
            _SkillMatrixDetailsData();
            _SkillMatrixSignature();
            _SkillMatrixData();
            _CompenencyData();
        }
    }, [props?.siteMasterId]);

    return <>
        {isLoading && <Loader />}
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
            <div className="table-sm mt-3">
                <div className="table-header-sm">
                    <div className="text-left-sm">Induction Training Units</div>
                    <div className="mw-160">IMS Nos.</div>
                    <div className="mw-140">Completed</div>
                    <div className="mw-110">Date</div>
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
                                    <div className="mw-90">{detail.Modified}</div>

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
            </div>}


        <div className="page-break ml-16px">
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
                    <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg6 ">
                        <div className="mar-left-16px">
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
                    <div className="ms-Grid-col ms-sm6 ms-md6 ms-lg6 ">
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
    </>;
};