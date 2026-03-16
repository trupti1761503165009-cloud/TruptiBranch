/* eslint-disable*/
import { PrimaryButton } from "@fluentui/react";
import { useAtomValue } from "jotai";
import React from "react";
import { ComponentNameEnum } from "../../../../../Common/Enum/ComponentNameEnum";



import { MinutesCirculatedToValue } from "../../../../../Common/Constants/CommonConstants";


import { WHSMeetingDetailsData } from "./WHSMeetingDetailsData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loader } from "../../CommonComponents/Loader";
import { IQuayCleanState } from "../../QuayClean";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import CommonPopup from "../../CommonComponents/CommonSendEmailPopup";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";

export interface IWHSMeetingDetailProps {
    manageComponentView(componentProp: IQuayCleanState): any;
    whsMasterId: number;
    provider: IDataProvider;
    context: WebPartContext;
    isAddNewHelpDesk?: boolean;
    siteMasterId?: number;
    breadCrumItems: IBreadCrum[];
    loginUserRoleDetails: any;
    originalSiteMasterId: any;
    componentProps: IQuayCleanState;
    isReload?: boolean;
    initialValue?: string;
    originalState?: string;
    isNotGeneral?: boolean;
    view?: any;
    isForm?: boolean;
    isDirectView?: boolean;
    isWHSMeetingAgenda?: boolean;
}

export const WHSMeetingDetail = (props: IWHSMeetingDetailProps) => {
    const { state, onClickDownload, hidePopup, onClickClose, isPopupVisible, title, sendToEmail, onclickSendEmail, onChangeTitle, onClickCancel, onChangeSendToEmail, onClickSendEmail, displayerrortitle, displayerroremail, displayerror, AllSignatureData } = WHSMeetingDetailsData(props);
    return <div className="whsMeeting-Detail">
        <div className="asset-card-2-header-jcc" style={{ maxWidth: "900px" }}>
            <div className="ms-Grid">
                {state.isLoading && <Loader />}
                <div className="ms-Grid-row">
                    <div className="boxCard" >
                        {/* <div style={{ display: "flex", justifyContent: "end" }}>
                        <PrimaryButton
                            style={{ marginBottom: "5px", marginTop: "10px", marginRight: "5px" }}
                            className="btn btn-primary"
                            text="Print"
                            onClick={onClickDownload} />
                    </div> */}
                        <div className="ms-Grid-row sticky-top-btn" style={{ marginTop: "-60px" }}>
                            <div className="jcc-btn-mt asset-card-2-header-jcc-btn">
                                <div className="formGroup dflex">
                                    <div>
                                        <PrimaryButton
                                            className="btn-danger send-email-btn"
                                            text="Close"
                                            onClick={() => onClickClose()}
                                        />
                                    </div>
                                    <div className="">
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
                                    <div>
                                        <PrimaryButton
                                            className="btn btn-primary send-email-btn"
                                            onClick={onClickDownload}
                                        >
                                            <FontAwesomeIcon icon="download" className="clsbtnat" />
                                            <div>PDF</div>
                                        </PrimaryButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="">
                            <div id="whsCommitteeMeetingPrint" style={{ padding: "5px" }} >
                                <table className="table-toolbox-talk cell-space-0" style={{ width: "100%", border: "1px solid black" }} >
                                    <tr>
                                        <th className="th-toolbox-talk-logo pl-10 bg-white br-1" > <img src={state.imageBase64} height="30px" className="course-img-first img-mt" /></th>
                                        <td className="td-toolbox-talk middle-box"><div>{!props.isWHSMeetingAgenda ? "WHS Committee Meeting Minutes" : "WHS Committee Meeting Agenda"}    </div></td>
                                        <td className="td-toolbox-talk blue-box pl-10"><div>WHS No</div><div>QC-CP-11-F1</div></td>
                                    </tr>
                                </table>
                                <div className="meeting-id-cls"><div className="td-toolbox-talk blue-text dflex"><div className="toggle-class">Meeting ID: {state?.whsCommitteeMeetingMasterItem?.Title}</div></div></div>
                                <div className="viewWHS mt-20">
                                    {/* Meeting Section Start */}
                                    <section>
                                        <div className="">

                                            <div className="header">Meeting Details</div>
                                            <p className="fontsize-14" style={{ padding: "5px" }}>
                                                The Quayclean Work Health and Safety (WHS) Committee is dedicated to ensuring a safe, healthy, and compliant work environment for all employees, customers, and stakeholders. The committee plays a vital role in shaping, implementing and monitoring Quayclean’s health and safety policies and practices.
                                            </p>

                                            <div className="whsDetailContainer mt-20">
                                                <div className="detailsContainer2">
                                                    <div className="detailsRow">
                                                        <div className="detailsLabel">Location</div>
                                                        <div className="detailsValue au-t-text-right">{state?.whsCommitteeMeetingMasterItem?.Location}</div>
                                                    </div>

                                                    <div className="detailsRow">
                                                        <div className="detailsLabel">Date</div>
                                                        <div className="detailsValue au-t-text-right">{state?.whsCommitteeMeetingMasterItem?.MeetingDate}</div>
                                                    </div>

                                                    <div className="detailsRow">
                                                        <div className="detailsLabel">Start Time</div>
                                                        <div className="detailsValue au-t-text-right">{state?.whsCommitteeMeetingMasterItem?.StartTime}</div>
                                                    </div>

                                                    <div className="detailsRow">
                                                        <div className="detailsLabel">End Time</div>
                                                        <div className="detailsValue au-t-text-right">{state?.whsCommitteeMeetingMasterItem?.EndTime}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-10">
                                                <div className="sub-header">Attendees</div>
                                                <table>
                                                    <tbody>
                                                        {state?.whsCommitteeMeetingMasterItem?.Attendees.length > 0 && state?.whsCommitteeMeetingMasterItem?.Attendees.map((i) => {
                                                            let whsuser = state.whsUserData.find((j) => j.Id == i.Id);
                                                            return <tr>
                                                                <td>{whsuser?.UserName}</td>
                                                                <td>{whsuser?.UserRole}</td>
                                                            </tr>
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="Apologies mt-10">
                                                <div className="sub-header">Apologies</div>
                                                <table>
                                                    <tbody>
                                                        {state?.whsCommitteeMeetingMasterItem?.Apologies.length > 0 && state?.whsCommitteeMeetingMasterItem?.Apologies.map((i) => {
                                                            let whsuser = state.whsUserData.find((j) => j.Id == i.Id);
                                                            return <tr>
                                                                <td>{whsuser?.UserName}</td>
                                                                <td>{whsuser?.UserRole}</td>
                                                            </tr>
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </section>
                                    {/* Meeting Section End */}
                                    {!props.isWHSMeetingAgenda && <section>
                                        <div className="mt-10">
                                            <div className="viewWHS">
                                                <div className="header">Acknowledgement of Country </div>
                                                <div style={{ paddingLeft: "5px" }}>
                                                    In the spirit of reconciliation Quayclean acknowledges the Traditional Custodians of country
                                                    throughout Australia and their connections to land, sea and community. We pay our respect
                                                    to their Elders past, present and future and extend that respect to all Aboriginal and Torres
                                                    Strait Islander peoples here today.
                                                </div>
                                            </div>

                                        </div>
                                    </section>}
                                    {/* Key Discussion Items  Start */}

                                    <section>
                                        <div className="mt-10">
                                            <div className="header">Key Discussion Items </div>
                                            <div className="mt-10">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: "150px" }}>Items</th>
                                                            <th style={{ width: "480px" }}>Description</th>
                                                            <th style={{ width: "100px" }}>Who</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {state.whsCommitteeMeetingDetailItemKeyItems.length > 0 ?
                                                            state.whsCommitteeMeetingDetailItemKeyItems.map((i) => {
                                                                let whoId: number[] = i.WHO.length > 0 ? i.WHO.map((i) => i.Id) : []
                                                                return <tr>
                                                                    <td style={{ width: "150px" }}>{i.Item}</td>
                                                                    <td style={{ width: "480px" }} className="richTextrenderUlLi" ><p dangerouslySetInnerHTML={{ __html: i?.Description }} ></p></td>
                                                                    <td style={{ width: "100px" }} className="">{i.WHO.length > 0 ? whoId.map((i) => {
                                                                        let data = state.whsUserData.find((j) => j.Id == i)
                                                                        return <span className="attendees-badge-cls">{data?.ShortForm}</span>
                                                                    }) : ""}
                                                                    </td>
                                                                </tr>
                                                            })
                                                            :
                                                            <tr>
                                                                <td><NoRecordFound /></td>
                                                            </tr>
                                                        }
                                                    </tbody>

                                                </table>
                                            </div>

                                        </div>
                                    </section>
                                    {/* Key Discussion Items  End */}

                                    {/* Action Items Start */}

                                    {state.whsCommitteeMeetingDetailItemActionItemsNotCompleted.length > 0 && <section>
                                        <div className="mt-10">
                                            <div className="header">{!props.isWHSMeetingAgenda ? "Action Items" : "Outstanding Action Items"}</div>
                                            <div className="mt-10">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: "75px" }}>Item Number</th>
                                                            <th style={{ width: "445px" }}>Description</th>
                                                            <th style={{ width: "100px" }}>Due Date</th>
                                                            <th style={{ width: "100px" }}>Who</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {state.whsCommitteeMeetingDetailItemActionItemsNotCompleted.length > 0 ?
                                                            state.whsCommitteeMeetingDetailItemActionItemsNotCompleted.map((i) => {
                                                                let whoId: number[] = i.WHO.length > 0 ? i.WHO.map((i) => i.Id) : []
                                                                return <tr>
                                                                    <td style={{ width: "75px" }}>{i.ItemNo}</td>
                                                                    <td style={{ width: "445px" }} className="richTextrenderUlLi"><p dangerouslySetInnerHTML={{ __html: i?.Description }} ></p></td>
                                                                    <td style={{ width: "100px" }}>{i.DueCompletedDate}</td>
                                                                    <td style={{ width: "100px" }} className="">{i.WHO.length > 0 ? whoId.map((i) => {
                                                                        let data = state.whsUserData.find((j) => j.Id == i)
                                                                        return <span className="attendees-badge-cls">{data?.ShortForm}</span>
                                                                    }) : ""}
                                                                    </td>
                                                                </tr>
                                                            })
                                                            :
                                                            <tr>
                                                                <td><NoRecordFound /></td>
                                                            </tr>
                                                        }
                                                    </tbody>
                                                </table>
                                            </div>

                                        </div>
                                    </section>}
                                    {/* Action Items End */}

                                    {/* Completed Action Items Start */}
                                    {state.whsCommitteeMeetingDetailItemActionCompleted.length > 0 && <section>
                                        <div className="mt-10">
                                            <div className="header">Completed Action Items</div>
                                            <div className="mt-10">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ width: "75px" }} >Item Number</th>
                                                            <th style={{ width: "445px" }}>Description</th>
                                                            <th style={{ width: "100px" }} >Completed</th>
                                                            <th style={{ width: "100px" }} >Who</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {state.whsCommitteeMeetingDetailItemActionCompleted.map((i) => {
                                                            let whoId: number[] = i.WHO.length > 0 ? i.WHO.map((i) => i.Id) : []
                                                            return <tr>
                                                                <td style={{ width: "75px" }}>{i.ItemNo}</td>
                                                                <td style={{ width: "455px" }} className="richTextrenderUlLi"><p dangerouslySetInnerHTML={{ __html: i?.Description }} ></p></td>
                                                                <td style={{ width: "100px" }}>{i.DueCompletedDate}</td>
                                                                <td style={{ width: "100px" }} className="">{i.WHO.length > 0 ? whoId.map((i) => {
                                                                    let data = state.whsUserData.find((j) => j.Id == i)
                                                                    return <span className="attendees-badge-cls">{data?.ShortForm}</span>
                                                                }) : ""}
                                                                </td>
                                                            </tr>
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                        </div>
                                    </section>}

                                    {/* Completed Action Items End */}

                                    {/* Completed Action Items Start */}
                                    {!props.isWHSMeetingAgenda && <section>
                                        <div className="mt-10 " >
                                            <div className="header">Minutes Circulated to all QuayClean employees and other relevant stakeholders</div>
                                            <div className="mt-10">
                                                <div className="whsDetailContainer mt-20">
                                                    <div className="detailsContainer2">
                                                        <div className="detailsRow">
                                                            <div className="detailsLabel">Notice board</div>
                                                            <div className="detailsValue au-t-text-right">
                                                                <span className={state?.whsCommitteeMeetingMasterItem?.MinutesCirculatedTo?.indexOf(MinutesCirculatedToValue.Noticeboard) > -1 ? "yes-Badge" : "no-Badge"}> {state?.whsCommitteeMeetingMasterItem?.MinutesCirculatedTo?.indexOf(MinutesCirculatedToValue.Noticeboard) > -1 ? "Yes" : "No"}</span>
                                                            </div>
                                                        </div>

                                                        <div className="detailsRow">
                                                            <div className="detailsLabel">Lunchroom</div>
                                                            <div className="detailsValue au-t-text-right">
                                                                <span className={state?.whsCommitteeMeetingMasterItem?.MinutesCirculatedTo?.indexOf(MinutesCirculatedToValue.Lunchroom) > -1 ? "yes-Badge" : "no-Badge"}> {state?.whsCommitteeMeetingMasterItem?.MinutesCirculatedTo?.indexOf(MinutesCirculatedToValue.Lunchroom) > -1 ? "Yes" : "No"}</span>
                                                            </div>
                                                        </div>

                                                        <div className="detailsRow">
                                                            <div className="detailsLabel">Toolbox talks</div>
                                                            <div className="detailsValue au-t-text-right">
                                                                <span className={state?.whsCommitteeMeetingMasterItem?.MinutesCirculatedTo?.indexOf(MinutesCirculatedToValue.Toolboxtalks) > -1 ? "yes-Badge" : "no-Badge"}> {state?.whsCommitteeMeetingMasterItem?.MinutesCirculatedTo?.indexOf(MinutesCirculatedToValue.Toolboxtalks) > -1 ? "Yes" : "No"}</span>
                                                            </div>
                                                        </div>

                                                        <div className="detailsRow">
                                                            <div className="detailsLabel">Executive meetings</div>
                                                            <div className="detailsValue au-t-text-right">
                                                                <span className={state?.whsCommitteeMeetingMasterItem?.MinutesCirculatedTo?.indexOf(MinutesCirculatedToValue.Executivemeetings) > -1 ? "yes-Badge" : "no-Badge"}> {state?.whsCommitteeMeetingMasterItem?.MinutesCirculatedTo?.indexOf(MinutesCirculatedToValue.Executivemeetings) > -1 ? "Yes" : "No"}</span>
                                                            </div>
                                                        </div>
                                                        <div className="detailsRow">
                                                            <div className="detailsLabel">Emails</div>
                                                            <div className="detailsValue au-t-text-right">
                                                                <span className={state?.whsCommitteeMeetingMasterItem?.MinutesCirculatedTo?.indexOf(MinutesCirculatedToValue.Emails) > -1 ? "yes-Badge" : "no-Badge"}> {state?.whsCommitteeMeetingMasterItem?.MinutesCirculatedTo?.indexOf(MinutesCirculatedToValue.Emails) > -1 ? "Yes" : "No"}</span>
                                                            </div>
                                                        </div>
                                                        {state?.whsCommitteeMeetingMasterItem?.MinutesCirculatedTo?.indexOf(MinutesCirculatedToValue.Other) > -1 && <div className="detailsRow">
                                                            <div className="detailsLabel">Other</div>
                                                            <div className="detailsValue au-t-text-right">
                                                                <span > {state?.whsCommitteeMeetingMasterItem?.Other}</span>
                                                            </div>
                                                        </div>}
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </section>}
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
                                                                    </div>

                                                                )
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {state.isPrint == false && <div className="dflex justify-content-right">
                                        <PrimaryButton

                                            onClick={() => onClickClose()}
                                            className="btn btn-danger mt5"
                                            text="Close"
                                        />
                                    </div>}
                                    {/* Completed Action Items End */}
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>

}