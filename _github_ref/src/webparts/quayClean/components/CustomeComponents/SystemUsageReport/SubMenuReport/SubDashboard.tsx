import React from "react"
import { Loader } from "../../../CommonComponents/Loader";
import { generateAndSaveKendoPDFHelpDesk } from "../../../../../../Common/Util";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import CommonPopup from "../../../CommonComponents/CommonSendEmailPopup";
import { toastService } from "../../../../../../Common/ToastService";
import { ListNames } from "../../../../../../Common/Enum/ComponentNameEnum";
import { IFileWithBlob } from "../../../../../../DataProvider/Interface/IFileWithBlob";
import { PrimaryButton } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CombineStateReport } from "../CombineStateReport/CombineStateReport";
import { IReportSites, IReportState, IReportUserActivityLog } from "../IReport";
import { TopLowSites } from "../TopLowSites/TopLowSites";
import { EntityTypeDistribution } from "./EntityTypeDistribution/EntityTypeDistribution";
import { ActiveUsersTrend } from "./ActiveUsersTrend/ActiveUsersTrend";
import { LowSiteUsage } from "./LowSiteUsage/LowSiteUsage";
import { UserLevelEngagementScore } from "./UserLevelEngagementScore/UserLevelEngagementScore";
import { SummeryCard } from "../SummeryCard";
import { SiteUserVsAccessedUser } from "./SiteUserVsAccessedUser/SiteUserVsAccessedUser";

export interface ISubDashboardProps {
    stateItems: IReportState[];
    siteItems: IReportSites[];
    userActivityLogItems: IReportUserActivityLog[];
    allUserActivityLogItems: IReportUserActivityLog[];
    allStateItems: IReportState[];
    allSiteItems: IReportSites[];
    filterState: any[];
    filterSites: any[];
    filterUser: any[];
    filterEntityType: any[];
    filterActionType: any[];
    startDate: any;
    endDate: any;
}

export interface ISubDashboardState {
    isGenratePDF: boolean;
    isLoading: boolean;
    isPopupVisible: boolean;
    title: string;
    sendToEmail: string;
    displayErrorTitle: boolean;
    displayErrorEmail: boolean
    displayError: boolean;
}

export const SubDashboard = (props: ISubDashboardProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider } = appGlobalState;
    const [state, setState] = React.useState<ISubDashboardState>({
        title: "",
        sendToEmail: "",
        displayError: false,
        displayErrorTitle: false,
        displayErrorEmail: false,
        isGenratePDF: false,
        isLoading: false,
        isPopupVisible: false,
    })

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
            const fileName: string = 'Summery Report';
            setState((prevState: any) => ({ ...prevState, isGenratePDF: true }))
            setTimeout(async () => {
                const fileblob: any = await generateAndSaveKendoPDFHelpDesk("summeryReport", fileName, false, true, true);
                const el = document.getElementById("summeryReport");
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
            await generateAndSaveKendoPDFHelpDesk("summeryReport", "Summery Report", false, true, true);
            const el = document.getElementById("summeryReport");
            if (el) {
                el.style.removeProperty("font-family");
            }
            // await generateAndSaveKendoPDF("combineStateReport", "ACT vs BGT vs Roaster Report", false, true);
            setState((prevState) => ({ ...prevState, isGenratePDF: false, isLoading: false, }))
        }, 1000);

    };


    return <div className="ms-Grid-row ">
        {state.isLoading && <Loader />}
        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dflex mt-2">
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

        </div>
        <div id="summeryReport">
            {(state.isGenratePDF) && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 sysUsage-cardNo">
                <SummeryCard
                    stateNames={props.filterState || []}
                    siteName={props.filterSites || []}
                    entityType={props.filterEntityType || []}
                    actionType={props.filterActionType || []}
                    users={props.filterUser || []}
                    stateDate={props.startDate}
                    endDate={props.endDate}
                />
            </div>}
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 sysUsage-cardNo">
                <h2 className="subTitle">State-Site vs Portal Access</h2>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                <CombineStateReport
                    isGenratePdf={state.isGenratePDF}
                    isDashboardView={true}
                    stateItems={props.stateItems || []}
                    siteItems={props.siteItems || []}
                    userActivityLogItems={props.userActivityLogItems || []}
                    startDate={props.startDate}
                    endDate={props.endDate}
                    isExpandDisable={true}
                    isSubMenu={true}
                />
            </div>

            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 sysUsage-cardNo page-break">
                <h2 className="subTitle"> Top State By Total Activities</h2>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                <TopLowSites
                    isGenratePdf={state.isGenratePDF}
                    isDashboardView={true}
                    stateItems={props.stateItems || []}
                    siteItems={props.siteItems || []}
                    userActivityLogItems={props.userActivityLogItems || []}
                    startDate={props.startDate}
                    endDate={props.endDate}
                    isStateViewOnly={true}
                    isExpandDisable={true}
                />
            </div>

            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 sysUsage-cardNo page-break">
                <h2 className="subTitle"> Site Volume</h2>

            </div>
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                <TopLowSites
                    isGenratePdf={state.isGenratePDF}
                    isDashboardView={true}
                    stateItems={props.stateItems || []}
                    siteItems={props.siteItems || []}
                    userActivityLogItems={props.userActivityLogItems || []}
                    startDate={props.startDate}
                    endDate={props.endDate}
                    isExpandDisable={true}
                />

            </div>
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 sysUsage-cardNo page-break">
                <h2 className="subTitle"> Site-Wise Assigned Users VS Accessed Users</h2>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                <SiteUserVsAccessedUser
                    isGeneratePdf={state.isGenratePDF}
                    stateItems={props.stateItems || []}
                    siteItems={props.siteItems || []}
                    userActivityLogItems={props.userActivityLogItems || []}
                    isExpandDisable={true}
                    isDashboardView={true}
                    startDate={props.startDate}
                    endDate={props.endDate} />
            </div>

            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 sysUsage-cardNo page-break">
                <h2 className="subTitle"> Entity Type Distribution</h2>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                <EntityTypeDistribution
                    isGenratePdf={state.isGenratePDF}
                    stateItems={props.stateItems || []}
                    isDashboardView={true}
                    siteItems={props.siteItems || []}
                    userActivityLogItems={props.userActivityLogItems || []}
                    isExpandDisable={true}

                />
            </div>


            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 sysUsage-cardNo page-break">
                <h2 className="subTitle"> Active Users Trend Over Time</h2>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                <ActiveUsersTrend
                    isGenratePdf={state.isGenratePDF}
                    stateItems={props.stateItems || []}
                    isDashboardView={true}
                    siteItems={props.siteItems || []}
                    userActivityLogItems={props.userActivityLogItems || []}
                    isExpandDisable={true}
                />
            </div>



            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 sysUsage-cardNo page-break">
                <h2 className="subTitle">No Usage Site Report </h2>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                <LowSiteUsage
                    isGenratePdf={state.isGenratePDF}
                    isDashboardView={true}
                    stateItems={props.stateItems || []}
                    siteItems={props.siteItems || []}
                    userActivityLogItems={props.userActivityLogItems || []}
                    isExpandDisable={true}
                />
            </div>

            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 sysUsage-cardNo page-break">
                <h2 className="subTitle">User-Level Engagement Score </h2>
            </div>
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                <UserLevelEngagementScore
                    allUserActivityLogItems={props.allUserActivityLogItems || []}
                    isGenratePdf={state.isGenratePDF}
                    isDashboardView={true}
                    stateItems={props.filterState || []}
                    siteItems={props.filterSites || []}
                    userActivityLogItems={props.userActivityLogItems || []}

                />
            </div>
        </div>



    </div>

}