import React from "react";
import { ISiteUserVsAccessedUserProps } from "./SiteUserVsAccessedUser";
import { _copyAndSort, generateAndSaveKendoPDFHelpDesk, GetSortOrder } from "../../../../../../../Common/Util";
import { IFileWithBlob } from "../../../../../../../DataProvider/Interface/IFileWithBlob";
import { toastService } from "../../../../../../../Common/ToastService";
import { ListNames } from "../../../../../../../Common/Enum/ComponentNameEnum";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../../jotai/appGlobalStateAtom";

export interface ISiteUserVsAccessedUserDataState {
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

export const SiteUserVsAccessedUserData = (props: ISiteUserVsAccessedUserProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider } = appGlobalState;
    const [state, setState] = React.useState<ISiteUserVsAccessedUserDataState>({
        items: [],
        isGenratePDF: !!props.isGeneratePdf ? props.isGeneratePdf : false,
        title: "",
        sendToEmail: "",
        displayError: false,
        displayErrorTitle: false,
        displayErrorEmail: false,
        isLoading: false,
        isPopupVisible: false,
    });


    const enrichSitesWithActiveUsers = (siteItems: any[], userLogs: any[]) => {

        const userMap: Record<number, Set<string>> = {};
        const userIdMap: Record<number, Set<string>> = {};

        userLogs.forEach((log) => {
            if (!userMap[log.SiteNameId]) {
                userMap[log.SiteNameId] = new Set();
            }
            userMap[log.SiteNameId].add(log.UserName);
        });
        userLogs.forEach((log) => {
            if (!userIdMap[log.SiteNameId]) {
                userIdMap[log.SiteNameId] = new Set();
            }
            userIdMap[log.SiteNameId].add(log.AuthorId);
        });
        return siteItems.map((site) => {
            const activeUsers = userMap[site.Id]?.size || 0;
            const activeUsersId = userIdMap[site.Id] || undefined;
            console.log(activeUsersId);
            let assignedActiveUser: number = 0
            if (!!site?.uniqueUsersId && site?.uniqueUsersId?.length > 0 && !!activeUsersId) {

                const userArray = Array.from(activeUsersId)
                const filteredIds = site?.uniqueUsersId.filter((id: any) => userArray.includes(id));
                assignedActiveUser = filteredIds.length || 0
            }

            // const assignedUsers = site.totalUserCount || 0;
            // const difference = assignedUsers - activeUsers || 0
            // return {
            //     ...site,
            //     activeUserCount: activeUsers,
            //     difference: difference >= 0 ? difference : 0,
            //     totalUserCount: site.totalUserCount || 0

            // };
            const assignedUsers = site.totalUserCount || 0;
            const difference = assignedUsers - assignedActiveUser || 0
            return {
                ...site,
                activeUserCount: assignedActiveUser,
                difference: difference >= 0 ? difference : 0,
                totalUserCount: site.totalUserCount || 0

            };
        });
    }
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
            const fileName: string = 'Site User Vs Accessed User Report';
            setState((prevState: any) => ({ ...prevState, isGenratePDF: true }))
            setTimeout(async () => {
                const fileblob: any = await generateAndSaveKendoPDFHelpDesk("SiteUserVsAccessedUser", fileName, false, true, true);
                const el = document.getElementById("SiteUserVsAccessedUser");
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
            await generateAndSaveKendoPDFHelpDesk("SiteUserVsAccessedUser", "Site User Vs Accessed User Report", false, true, true);
            const el = document.getElementById("SiteUserVsAccessedUser");
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
            let siteItems: any[] = _copyAndSort(props.siteItems, "StateName", false)
            let data = enrichSitesWithActiveUsers(siteItems, props.userActivityLogItems)
            setState((prevState) => ({ ...prevState, items: data }));
        } catch (error) {
            console.log(error);

        }
    }, [props.userActivityLogItems, props.siteItems])
    React.useEffect(() => {
        setState((prevState: any) => ({ ...prevState, isGenratePDF: props.isGeneratePdf }))
    }, [props.isGeneratePdf])
    return {
        state,
        onClickDownload,
        onClickCancel,
        onChangeTitle,
        onClickSendEmail,
        onChangeSendToEmail,
        onClickShowEmailModel
    }

}