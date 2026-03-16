/* eslint-disable @typescript-eslint/no-use-before-define */
import React from "react"
import { IReportSites, IReportState, IReportUserActivityLog } from "../../IReport";
import { PrimaryButton, TooltipHost } from "@fluentui/react";
import NoRecordFound from "../../../../CommonComponents/NoRecordFound";
import { UserLevelEngagementScoreChart } from "./UserLevelEngagementScoreChart";
import { generateAndSaveKendoPDFHelpDesk } from "../../../../../../../Common/Util";
import { toastService } from "../../../../../../../Common/ToastService";
import { IFileWithBlob } from "../../../../../../../DataProvider/Interface/IFileWithBlob";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../../jotai/appGlobalStateAtom";
import { ListNames } from "../../../../../../../Common/Enum/ComponentNameEnum";
import CommonPopup from "../../../../CommonComponents/CommonSendEmailPopup";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Loader } from "../../../../CommonComponents/Loader";

export interface IUserLevelEngagementScoreProps {
    stateItems: IReportState[];
    siteItems: IReportSites[];
    userActivityLogItems: IReportUserActivityLog[];
    allUserActivityLogItems: IReportUserActivityLog[];
    isExpandDisable?: boolean;
    isGenratePdf?: boolean;
    isDashboardView?: boolean;
    filterState?: any[];
    filterSites?: any[];
    filterUser?: any[];
    filterEntityType?: any[];
    filterActionType?: any[];
    startDate?: any;
    endDate?: any;
}

export interface IUserLevelEngagementScoreState {
    items: any[];

    isPopupVisible: boolean;
    title: string;
    sendToEmail: string;
    displayErrorTitle: boolean;
    displayErrorEmail: boolean
    displayError: boolean;
    isLoading: boolean;
    isGenratePDF: boolean
}

export const UserLevelEngagementScore = (props: IUserLevelEngagementScoreProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider } = appGlobalState;
    const mainProps = props
    const [state, setState] = React.useState<IUserLevelEngagementScoreState>({
        items: [],

        isGenratePDF: !!props.isGenratePdf ? props.isGenratePdf : false,
        title: "",
        sendToEmail: "",
        displayError: false,
        displayErrorTitle: false,
        displayErrorEmail: false,
        isLoading: false,
        isPopupVisible: false,
    })


    const analyzeUserActivities = (filterLogs: any[], allLogs: any[]) => {
        const loginCountMap: Record<number, number> = {};
        const userMap: Record<number, any> = {};

        // Pass 1: build login counts from allLogs
        allLogs.forEach(log => {
            if (typeof log.ActionType === "string" && log.ActionType.toLowerCase().includes("login")) {
                const userId = log.AuthorId;
                loginCountMap[userId] = (loginCountMap[userId] || 0) + 1;
            }
        });

        // Pass 2: process filterLogs for activities
        filterLogs.forEach(log => {
            const userId = log.AuthorId;
            if (!userMap[userId]) {
                userMap[userId] = {
                    userId,
                    userName: log.UserName,
                    email: log.AuthorEmail,
                    totalActivities: 0,
                    loginCount: loginCountMap[userId] || 0, // O(1) lookup
                };
            }
            userMap[userId].totalActivities++;
        });

        const result = Object.values(userMap);

        // Sort only once
        const sortedByActivity = result.sort((a, b) => b.totalActivities - a.totalActivities);
        const topPerforming = sortedByActivity[0] || null;
        const leastActive = sortedByActivity[sortedByActivity.length - 1] || null;

        return { allUsers: sortedByActivity, topPerforming, leastActive };
    };


    const renderRows = (
        nodes: any[],
        indent = 0,
        onClickRow?: any
    ) => {
        return nodes.map((node: any, index: number) => (
            <SiteRow
                key={index}
                label={node?.userName}
                labelTwo={node.totalActivities}
                labelTheree={node.loginCount}
                labelFour={node.activeUserCount}
                labelFive={node.difference}
                indent={indent}
                expandable={props.isExpandDisable ? false : (node.isExpandable || node.isLastLevel)}
                defaultExpanded={node.defaultExpanded}
                onClickRow={onClickRow}
                item={node?.item || ""}
                isLastLevel={node?.isLastLevel} // 👈 pass flag
            >
                {(node?.children && !node?.isLastLevel) ? (
                    renderRows(node?.children, indent + 1, onClickRow)
                ) : node?.isLastLevel ? ( // 👈 check flag
                    <tr>
                        <td colSpan={7} style={{ paddingLeft: `${(indent + 1) * 16 + 16}px`, paddingTop: "10px", paddingBottom: "10px", paddingRight: "10px" }}>
                            {/* Dummy Grid */}
                            <table className="sites-table sub-Grid-table" >
                                <thead>
                                    <tr className=" subGrid">
                                        <th className="site-cell padding-6">Entity Type</th>
                                        <th className="site-cell padding-6">Entity Name</th>
                                        <th className="site-cell padding-6">Details</th>
                                        <th className="site-cell padding-6">User Name</th>
                                        <th className="site-cell padding-6">Action Type</th>
                                        <th className="site-cell padding-6">Site Name</th>
                                        <th className="site-cell padding-6">Time Stamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {node?.items?.length > 0 ?
                                        node?.items.map((j: any) => {
                                            return <tr className="site-row">
                                                <td className="site-cell padding-6">{j?.EntityType}</td>
                                                <td className="site-cell padding-6">{j?.EntityName}</td>
                                                <td className="site-cell padding-6">{j?.Details}</td>
                                                <td className="site-cell padding-6">{j?.UserName}</td>
                                                <td className="site-cell padding-6">{j?.ActionType}</td>
                                                <td className="site-cell padding-6">{j?.SiteName}</td>
                                                <td className="site-cell padding-6">{j?.Created}</td>
                                            </tr>

                                        })
                                        :

                                        <tr><td colSpan={7}> <NoRecordFound /></td></tr>
                                    }
                                </tbody>
                            </table>
                        </td>
                    </tr>
                ) : (
                    <NoRecordFound />
                )}
            </SiteRow>
        ));
    };

    const SiteRow = (props: any) => {
        const [expanded, setExpanded] = React.useState(props?.defaultExpanded);

        return (
            <>
                <tr
                    className={`site-row siteLevel${props.indent} ${props.expandable ? "" : "cursorDefault"}`}
                    onClick={
                        props?.expandable
                            ? () => setExpanded(!expanded)
                            : () => !!props.onClickRow && props.onClickRow(props)
                    }
                    data-indent={props?.indent}
                >
                    <td
                        className={`site-cell ${expanded ? "expanded" : ""}`}
                    // style={{ paddingLeft: `${props.indent * 16 + 16 + (props.expandable ? 0 : 17)}px` }}
                    // style={{ paddingLeft: !mainProps.isExpandDisable ? `${props.indent * 16 + 16 + (props.expandable ? 0 : 17)}px` : '' }}
                    >
                        {props?.expandable && <span>{expanded ? "▼" : "▶"} </span>}
                        {props?.label}
                    </td>
                    <td className="site-cell">{props?.labelTwo}</td>
                    {/* {!state.isHideLoginCount && <td className="site-cell">{props?.labelTheree}</td>} */}
                    <td className="site-cell">{props?.labelTheree}</td>
                    {/* <td className="site-cell">{props?.labelFour}</td> */}
                </tr>
                {expanded && props?.children}
            </>
        );
    };


    const onClickCancel = () => {
        setState((prevState: any) => ({ ...prevState, title: "", sendToEmail: "", displayError: false, displayErrorEmail: false, displayErrorTitle: false, isPopupVisible: false }))
    };


    const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
        setState((prevState: any) => ({ ...prevState, title: newValue || "", displayErrorTitle: !!newValue ? false : prevState.displayErrorTitle }))

    }

    const onChangeSendToEmail = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setState((prevState: any) => ({ ...prevState, sendToEmail: newValue || "", displayErrorEmail: !!newValue ? false : prevState.displayErrorEmail }))

        const enteredValue = newValue;
        const emailPattern = /^([^\s@]+@[^\s@]+\.[^\s@]+)(\s*;\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/;

        if (!enteredValue || emailPattern.test(enteredValue)) {

            setState((prevState: any) => ({ ...prevState, displayError: false }))
        } else {

            setState((prevState: any) => ({ ...prevState, displayError: true }))
        }
    };
    const onClickSendEmail = async (): Promise<void> => {
        const isTitleEmpty = !state.title;
        const isEmailEmpty = !state.sendToEmail;
        const isEmailInvalid = !isEmailEmpty && !state.sendToEmail?.split(';').every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));


        setState((prevState: any) => ({ ...prevState, displayError: isEmailInvalid, displayErrorEmail: isEmailEmpty, displayErrorTitle: isTitleEmpty, isLoading: true }))

        if (!isTitleEmpty && !isEmailEmpty && !isEmailInvalid) {
            const fileName: string = 'User Level Engagement Score Report';
            setState((prevState: any) => ({ ...prevState, isGenratePDF: true }))
            setTimeout(async () => {
                const fileblob: any = await generateAndSaveKendoPDFHelpDesk("UserLevelEngagement", fileName, false, true, true);
                const el = document.getElementById("UserLevelEngagement");
                if (el) {
                    el.style.removeProperty("font-family");
                }
                const file: IFileWithBlob = {
                    file: fileblob,
                    name: `${fileName}.pdf`,
                    overwrite: true
                };
                let toastMessage: string = "";
                const toastId = toastService.loading('Loading...');
                toastMessage = 'Email sent successfully!';
                const insertData: any = {
                    Title: state.title,
                    SendToEmail: state.sendToEmail,
                    StateName: "All State",
                    SiteName: "All Site",
                    EmailType: "SystemUsageReport",
                };
                provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                    provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
                        console.log("Upload Success");
                    }).catch((err: any) => console.log(err));
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                    onClickCancel();
                    setState((prevState: any) => ({ ...prevState, isGenratePDF: false, isLoading: false }))
                }).catch((err: any) => console.log(err));
                setState((prevState: any) => ({ ...prevState, isGenratePDF: false, isLoading: false }))
            }, 1000);

        } else {
            setState((prevState: any) => ({ ...prevState, isGenratePDF: false, isLoading: false }))
        }
    };


    const onClickShowEmailModel = () => {
        setState((prevState) => ({ ...prevState, isPopupVisible: true }))
    }

    const onClickDownload = async (): Promise<void> => {
        setState((prevState) => ({ ...prevState, isGenratePDF: true, isLoading: true }))
        setTimeout(async () => {
            await generateAndSaveKendoPDFHelpDesk("UserLevelEngagement", "User Level Engagement Score Report", false, true, true);
            const el = document.getElementById("UserLevelEngagement");
            if (el) {
                el.style.removeProperty("font-family");
            }
            // await generateAndSaveKendoPDF("combineStateReport", "ACT vs BGT vs Roaster Report", false, true);
            setState((prevState) => ({ ...prevState, isGenratePDF: false, isLoading: false, }))
        }, 1000);

    };
    React.useEffect(() => {
        setState((prevState: any) => ({ ...prevState, isGenratePDF: state.isGenratePDF }))
    }, [state.isGenratePDF])

    React.useEffect(() => {
        try {
            let data = analyzeUserActivities(props.userActivityLogItems, props.allUserActivityLogItems);
            setState((prevState) => ({ ...prevState, items: data.allUsers, }))

        } catch (error) {
            console.log(error);

        }
    }, [props.userActivityLogItems]);
    return <div className="ms-Grid-row systemLevel">
        {state.isLoading && <Loader />}
        {!props.isDashboardView && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dflex mt-2 mb-2">
            <div className="mla">
                <CommonPopup
                    isPopupVisible={state.isPopupVisible}
                    hidePopup={onClickCancel} title={state.title}
                    sendToEmail={state.sendToEmail}
                    onChangeTitle={onChangeTitle}
                    onChangeSendToEmail={onChangeSendToEmail}
                    displayerrortitle={state.displayErrorTitle}
                    displayerroremail={state.displayErrorEmail}
                    displayerror={state.displayError}
                    onClickSendEmail={onClickSendEmail}
                    onClickCancel={onClickCancel}
                    onclickSendEmail={onClickShowEmailModel}
                />
                <PrimaryButton className="btn btn-primary mla " onClick={onClickDownload}>
                    <FontAwesomeIcon icon="download" className="clsbtnat" /><div>PDF</div>
                </PrimaryButton>
            </div>
        </div>}
        <div id="UserLevelEngagement">
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                <UserLevelEngagementScoreChart

                    chartData={state.items}
                    isGenratePdf={state.isGenratePDF}
                />
            </div>
            {!props.isDashboardView &&
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                    <div className="table-container sysUsage-card">

                        <div className={state.isGenratePDF ? "" : "systemUseTableHeight mt-3"}>

                            <table className="sites-table ">
                                <thead>
                                    <tr className="systemUse ">
                                        <th className="site-cell">User Name</th>
                                        <th className="site-cell">Total Activities</th>
                                        {/* {!state.isHideLoginCount && <th className="site-cell">Login Count</th>} */}
                                        <th className="site-cell">Login Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <>
                                        {state.items.length > 0 ?
                                            <>
                                                {renderRows(state.items, 0)}
                                            </>
                                            : <tr> <td colSpan={3}> <NoRecordFound /></td></tr>}
                                    </>
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>}
        </div>
    </div>

}