/* eslint-disable react/jsx-key */
import * as React from "react";
const imgLogo = require('../../../../quayClean/assets/images/qc_logo.png');
import { ICheckListMasterDetail } from "../../../../../Interfaces/ICheckListDetail";
import { PrimaryButton } from "office-ui-fabric-react";
import { Accordion } from "@pnp/spfx-controls-react";
import { generateAndSaveKendoPDF } from "../../../../../Common/Util";

const CheckListInfo: React.FC<{ data: ICheckListMasterDetail }> = ({ data }) => {
    return (
        <>
            <div id="pdfGenerate" className="">
                <div className="fltEnd">
                    <PrimaryButton
                        className="btn btn-primary noExport mb-2"
                        text="PDF"
                        onClick={() => {
                            const sanitizeFileName = (name: string) => name.replace(/[^a-z0-9]/gi, '_');
                            const fileName = `${sanitizeFileName(data?.title ?? 'Untitled')}_${sanitizeFileName(data?.operatorName ?? 'UnknownOperator')}_${sanitizeFileName(data?.date ?? 'UnknownDate')}`;
                            // const onClickDownload = async (): Promise<void> => {
                            //     let fileblob: any = await generateAndSaveKendoPDF("pdfJCC", SiteName + '- Job Control Checklist', false, true);
                            // };
                            generateAndSaveKendoPDF("pdfGenerateV2", fileName, true, true);
                        }}
                    />
                </div>
                {/* <div className="mainTitle mb-3">Overview</div> */}

                <Accordion title={"Overview"} defaultCollapsed={false} className={"itemCell jAccordion"} key={1} collapsedIcon={"ChevronUp"} expandedIcon={"ChevronDown"}>
                    <div className="card mb-2">
                        <div className="cardBody">
                            <div className="mb-2">
                                <img src={imgLogo} height="75px" width="75px" className="course-img-first" />
                            </div>
                            <h4 className="mb-0">Cleaning Report - {data?.title}</h4>
                            <div className="mb-2">{data?.operatorName} / {data?.date} / {data?.location}</div>
                        </div>
                        <div className="cardTable">

                            <div className="cardTableInner">
                                Inspection score
                                <div className="fnt18 fwBold">
                                    {data?.totalPositiveQuestions || 0}/{data?.totalQuestions || 0} ({data?.totalPercentage || 0}&nbsp;%)
                                </div>
                            </div>
                            <div className="cardTableInner">
                                Flagged items
                                <div className="fnt18 fwBold">
                                    {data?.totalNegativeQuestions || 0}
                                </div>
                            </div>
                            <div className="cardTableInner">
                                Created actions
                                <div className="fnt18 fwBold">
                                    0
                                </div>
                            </div>

                        </div>
                    </div>

                    <div className="card mb-2">
                        <div className="cardBody">
                            <div className="captions">
                                <b> Site conducted</b>
                            </div>
                            <div className="mb-2">{data?.siteConducted}</div>
                        </div>
                    </div>

                    <div className="card mb-2">
                        <div className="cardBody">
                            <div className="captions">
                                <b> Conducted on</b>
                            </div>
                            <div className="dateCaptions">
                                <div className="mb-2">{data?.conductedOn}</div>
                                {/* <div className="mb-2">{data?.conductedTime}</div> */}
                            </div>
                        </div>
                    </div>
                    <div className="card mb-2">
                        <div className="cardBody">
                            <div className="captions">
                                <b>Operator Name</b>
                            </div>
                            <div className="mb-2">{data?.operatorName}</div>
                        </div>
                    </div>
                </Accordion>


                {/* <div className="mainTitle mb-3">Daily Operator Checklist</div> */}
                <Accordion title={"Daily Operator Checklist"} defaultCollapsed={false} className={"itemCell jAccordion mt-3"} key={2} collapsedIcon={"ChevronUp"} expandedIcon={"ChevronDown"}>
                    {data?.questionAnswerList && data.questionAnswerList.length > 0 && data.questionAnswerList.map((objItem: { Question: string; Answer: string; AttachmentFiles?: any[] }, index: number) => {
                        let badgeclassName = "";

                        switch (objItem?.Answer) {
                            case "Safe":
                            case "Good":
                            case "Yes":
                            case "Compliant":
                                badgeclassName = "BadgeSuccess";
                                break;
                            case "No":
                            case "At Risk":
                            case "Fail":
                            case "Non-Compliant":
                            case "Poor":
                                badgeclassName = "BadgeFailure";
                                break;
                            default:
                                badgeclassName = "";
                                break;
                        }

                        const attachmentFiles = objItem.AttachmentFiles && objItem.AttachmentFiles.length > 0 ? objItem.AttachmentFiles : [];

                        return (
                            <div className="card mb-2" key={index}>
                                <div className="cardBody">
                                    <div className="captions">
                                        <b>{objItem.Question}</b>
                                    </div>
                                    <div className="mb-2">
                                        <span className={`badge ${badgeclassName}`}>
                                            {objItem.Answer}
                                        </span>
                                    </div>

                                    <div className="mediaDiv">
                                        {attachmentFiles.length > 0 && attachmentFiles.map((attachmentItem, attachmentIndex) => {
                                            let attachmentFiledata = "";
                                            // const fixImgURL = `${props.context.pageContext.web.serverRelativeUrl}/Lists/AssetMaster/Attachments/${attachmentItem.Id}/`;
                                            const fixImgURL = "";

                                            try {
                                                const AttachmentData = attachmentItem;
                                                if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                                                    attachmentFiledata = AttachmentData.ServerRelativeUrl;
                                                } else if (AttachmentData && AttachmentData.FileName) {
                                                    attachmentFiledata = fixImgURL + AttachmentData.FileName;
                                                } else {
                                                    attachmentFiledata = "";
                                                }
                                            } catch (error) {
                                                console.error("Error parsing AssetPhoto JSON:", error);
                                                attachmentFiledata = "";
                                            }

                                            return (
                                                <div key={attachmentIndex}>
                                                    <img src={attachmentFiledata} height="75px" width="75px" className="course-img-first" />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </Accordion>

                {/* <div className="mainTitle mb-3">Sign-off</div> */}
                <Accordion title={"Sign-off"} defaultCollapsed={false} className={"itemCell jAccordion mt-3"} key={3} collapsedIcon={"ChevronUp"} expandedIcon={"ChevronDown"}>
                    <div className="card mb-2">
                        <div className="cardBody">
                            <div className="captions">
                                <b> Signature</b>
                            </div>
                            <div className="mb-2">
                                <img src={`${data?.signature}`} height="80px" width="240px" className="course-img-first signatureBox" alt="Signature" key={data?.SiteNameId || 0} />
                            </div>
                        </div>
                    </div>

                    <div className="card mb-2">
                        <div className="cardBody">
                            <div className="captions">
                                <b> Date</b>
                            </div>
                            <div className="mb-2">{data?.date}</div>
                        </div>
                    </div>
                </Accordion>


                {/* <div className="mainTitle mb-3">Media summary</div> */}
                <Accordion title={"Media summary"} defaultCollapsed={false} className={"itemCell jAccordion mt-3 mb-1"} key={4} collapsedIcon={"ChevronUp"} expandedIcon={"ChevronDown"}>
                    <div className="card mb-2">
                        <div className="cardBody mediaDiv">

                            {data?.AttachmentFiles?.length > 0 && data.AttachmentFiles.map((attachmentItem: { ServerRelativeUrl: any; FileName: any; }, attachmentIndex: React.Key | null | undefined) => {
                                let attachmentFileData = "";
                                const fixImgURL = "";

                                try {
                                    const { ServerRelativeUrl, FileName } = attachmentItem;
                                    if (ServerRelativeUrl) {
                                        attachmentFileData = ServerRelativeUrl;
                                    } else if (FileName) {
                                        attachmentFileData = fixImgURL + FileName;
                                    }
                                } catch (error) {
                                    console.error("Error parsing AssetPhoto JSON:", error);
                                }

                                return (
                                    <div key={attachmentIndex} className="ml5">
                                        <img src={attachmentFileData} height="75px" width="75px" className="course-img-first" alt="attachment" />
                                    </div>
                                );
                            })}



                            {data?.questionAnswerList && data.questionAnswerList.length > 0 && data.questionAnswerList.map((objItem: { Question: string; Answer: string; AttachmentFiles?: any[] }) => {
                                const attachmentFiles = objItem.AttachmentFiles && objItem.AttachmentFiles.length > 0 ? objItem.AttachmentFiles : [];
                                return (
                                    <>
                                        {
                                            attachmentFiles.length > 0 && attachmentFiles.map((attachmentItem, attachmentIndex) => {
                                                let attachmentFiledata = "";
                                                // const fixImgURL = `${props.context.pageContext.web.serverRelativeUrl}/Lists/AssetMaster/Attachments/${attachmentItem.Id}/`;
                                                const fixImgURL = "";

                                                try {
                                                    const AttachmentData = attachmentItem;
                                                    if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                                                        attachmentFiledata = AttachmentData.ServerRelativeUrl;
                                                    } else if (AttachmentData && AttachmentData.FileName) {
                                                        attachmentFiledata = fixImgURL + AttachmentData.FileName;
                                                    } else {
                                                        attachmentFiledata = "";
                                                    }
                                                } catch (error) {
                                                    console.error("Error parsing AssetPhoto JSON:", error);
                                                    attachmentFiledata = "";
                                                }

                                                return (
                                                    <div key={attachmentIndex} className="ml5">
                                                        <img src={attachmentFiledata} height="75px" width="75px" className="course-img-first" />
                                                    </div>
                                                );
                                            })
                                        }
                                    </>
                                );
                            })}

                        </div>
                    </div>
                </Accordion>

            </div>

            <div id="pdfGenerateV2" className="dnone" key={data?.ID}>
                {/* <div className="card mb-2">
                    <div className="cardBody">
                        <div className="mb-2">
                            <img src={imgLogo} height="75px" width="75px" className="course-img-first" />
                        </div>
                        <h4 className="mb-0">Cleaning Report - {data?.title}</h4>
                        <div className="mb-2">{data?.operatorName} / {data?.date} / {data?.location}</div>
                    </div>

                </div> */}

                <table cellSpacing="0" width="100%" className="wts sub-toolbox-table mt-2 noborder">
                    <tbody>
                        <tr className="sub-toolbox-tr nobackgroundcolor">
                            <td
                                className="pt-16 pl-16 pr-16 wts  text-start">
                                <div className="">
                                    <img src={imgLogo} height="90px" width="90px" className="course-img-first" />
                                </div>
                            </td>
                        </tr>
                        <tr className="sub-toolbox-tr">
                            <td
                                className="pb-16 pl-16 pr-16 wts  text-start">
                                <span className="mb-0 headerPDF">{data?.title} &nbsp;-&nbsp; Daily Operator Checklist</span>
                            </td>

                        </tr>
                        <tr className="sub-toolbox-tr">
                            <td
                                className=" pt-16 pb-16 pl-16 pr-16 wts  text-start">
                                <span className="headerOperatorName">{data?.date} &nbsp;/&nbsp;{data?.operatorName} &nbsp;/&nbsp;{data?.location}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <table width="100%" className="wts sub-toolbox-table mt-2 noborder">
                    <tbody>
                        <tr className="sub-toolbox-tr">
                            <td
                                className="bg-ltcolor pt-16 pb-16 pl-16 pr-16 wts bb1 text-start">
                                <span
                                    className="bg-ltcolor mt-0 mb-8 word-break f16 fw-bold">
                                    Score </span>
                                <span className="f-right">{data?.totalPositiveQuestions || 0}&nbsp;/&nbsp;{data?.totalQuestions || 0}&nbsp;({data?.totalPercentage || 0}&nbsp;%)</span>

                            </td>
                            <td
                                className="bg-ltcolor pt-16 pb-16 pl-16 pr-16 wts bb1 text-start">
                                <span
                                    className="bg-ltcolor mt-0 mb-8 word-break f16 fw-bold">
                                    Flagged items </span>
                                <span className="f-right">{data?.totalNegativeQuestions || 0}</span>

                            </td>
                            <td
                                className="bg-ltcolor pt-16 pb-16 pl-16 pr-16 wts bb1 text-start">
                                <span
                                    className="bg-ltcolor mt-0 mb-8 word-break f16 fw-bold">
                                    Actions </span>
                                <span className="f-right">0</span>
                            </td>
                        </tr>
                        <tr className="sub-toolbox-tr">
                            <td colSpan={2}
                                className="pt-16 pb-16 pl-16 bb1 text-start f16 fw-bold bb1 wts">
                                <span
                                    className="mt-0 mb-8 word-break f16 fw-bold">
                                    Site conducted </span>

                            </td>
                            <td
                                className="pt-16 pb-16 pl-16 bb1 text-end f16  bb1 wts">
                                <p
                                    className="mt-0 mb-0 word-break pb-16 pl-16 text-end f16">
                                    {data?.siteConducted}</p>
                            </td>
                        </tr>
                        <tr className="sub-toolbox-tr">
                            <td colSpan={2}
                                className="pt-16 pb-16 pl-16 bb1 text-start f16 fw-bold bb1 wts">
                                <span
                                    className="mt-0 mb-8 word-break f16 fw-bold">
                                    Conducted on </span>

                            </td>
                            <td
                                className="pt-16 pb-16 pl-16 bb1 text-end f16  bb1 wts">
                                <p
                                    className="mt-0 mb-0 word-break pb-16 pl-16 text-end f16">
                                    {data?.conductedOn}</p>
                            </td>
                        </tr>
                        <tr className="sub-toolbox-tr">
                            <td colSpan={2}
                                className="pt-16 pb-16 pl-16 bb1 text-start f16 fw-bold bb1 wts">
                                <span
                                    className="mt-0 mb-8 word-break f16 fw-bold">
                                    Operator Name </span>

                            </td>
                            <td
                                className="pt-16 pb-16 pl-16 bb1 text-end f16  bb1 wts">
                                <p
                                    className="mt-0 mb-0 word-break pb-16 pl-16 text-end f16">
                                    {data?.operatorName}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* checklist */}
                <table width="100%" className="wts sub-toolbox-table mt-2 page-break noborder">
                    <tbody>
                        <tr className="sub-toolbox-tr">
                            <td colSpan={2}
                                className="bg-ltcolor pt-16 pb-16 pl-16 pr-16 wts bb1 text-start">
                                <span
                                    className="bg-ltcolor mt-0 mb-8 word-break f16 fw-bold">
                                    Daily Operator Checklist
                                </span>

                            </td>

                            <td
                                className="bg-ltcolor pt-16 pb-16 pl-16 pr-16 wts bb1 text-end wp-25">
                                {data?.totalPositiveQuestions || 0}&nbsp;/&nbsp;{data?.totalQuestions || 0}&nbsp;({data?.totalPercentage || 0}&nbsp;%)
                            </td>
                        </tr>
                        <tr className="sub-toolbox-tr">
                            <td colSpan={2}
                                className="bg-white pt-16 pb-16 pl-16 pr-16 wts bb1 text-start">
                                <span
                                    className="mt-0 mb-8 word-break f16 fw-bold">
                                    Daily Operator Checklist
                                </span>

                            </td>

                            <td
                                className="bg-gray pt-16 pb-16 pl-16 pr-16 wts bb1 text-end text-white">
                                {data?.location}
                            </td>
                        </tr>

                        <tr className="sub-toolbox-tr">
                            <td colSpan={2}
                                className="bg-ltcolor pt-16 pb-16 pl-16 pr-16 wts bb1 text-start">
                                <span
                                    className="bg-ltcolor mt-0 mb-8 word-break f16 fw-bold">
                                    Conquest Sport EDGE
                                </span>

                            </td>

                            <td
                                className="bg-ltcolor pt-16 pb-16 pl-16 pr-16 wts bb1 text-end">
                                {data?.totalPositiveQuestions || 0}&nbsp;/&nbsp;{data?.totalQuestions || 0}&nbsp;({data?.totalPercentage || 0}&nbsp;%)
                            </td>
                        </tr>
                        {data?.questionAnswerList && data.questionAnswerList.length > 0 && data.questionAnswerList.map((objItem: { Question: string; Answer: string; AttachmentFiles?: any[] }) => {
                            let badgeclassName = "";

                            switch (objItem?.Answer) {
                                case "Safe":
                                case "Good":
                                case "Yes":
                                case "Compliant":
                                    badgeclassName = "bg-green";
                                    break;
                                case "No":
                                case "At Risk":
                                case "Fail":
                                case "Non-Compliant":
                                case "Poor":
                                    badgeclassName = "bg-red";
                                    break;
                                default:
                                    badgeclassName = "";
                                    break;
                            }


                            return (

                                <tr className="sub-toolbox-tr">
                                    <td colSpan={2}
                                        className="bg-lightcolor pt-16 pb-16 pl-16 pr-16 wts bb1 text-start sub-toolbox-td-item">
                                        <span
                                            className="bg-lightcolor1 mt-0 mb-8 word-break f16 fw-bold">
                                            {objItem.Question}
                                        </span>

                                    </td>

                                    <td
                                        className={`pt-16 pb-16 pl-16 pr-16 wts bb1 text-end fw-600 ${badgeclassName} sub-toolbox-td-item`}>
                                        {objItem.Answer}
                                    </td>
                                </tr>

                            );
                        })}

                    </tbody>
                </table>


                <table width="100%" className="wts sub-toolbox-table mt-2 page-break noborder">
                    <tbody>
                        <tr className="sub-toolbox-tr">
                            <td
                                className="bg-ltcolor pt-16 pb-16 pl-16 pr-16 wts bb1 text-start">
                                <span
                                    className="bg-ltcolor mt-0 mb-8 word-break f16 fw-bold">
                                    Sign-off
                                </span>
                            </td>
                            <td
                                className="bg-lightcolor pt-16 pb-16 pl-16 pr-16 wts bb1 text-end">
                                <img src={`${data?.signature}`} height="80px" width="240px" className="course-img-first signatureBox" alt="Signature" key={data?.SiteNameId || 0} />
                            </td>
                        </tr>

                        <tr className="sub-toolbox-tr">
                            <td
                                className="bg-lightcolor pt-16 pb-16 pl-16 pr-16 wts bb1 text-start">
                                <span
                                    className="bg-lightcolor mt-0 mb-8 word-break f16 fw-bold">
                                    Date
                                </span>

                            </td>

                            <td
                                className="bg-lightcolor pt-16 pb-16 pl-16 pr-16 wts bb1 text-end">
                                {data?.date}
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>
        </>
    );
};

export default CheckListInfo;
