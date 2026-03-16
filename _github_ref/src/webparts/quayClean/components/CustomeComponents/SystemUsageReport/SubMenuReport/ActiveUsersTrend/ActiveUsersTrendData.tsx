import React from "react";
import { IActiveUsersTrendProps } from "./ActiveUsersTrend";
import { ListNames } from "../../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../../Common/ToastService";
import { generateAndSaveKendoPDFHelpDesk, generateExcelTable } from "../../../../../../../Common/Util";
import { IFileWithBlob } from "../../../../../../../DataProvider/Interface/IFileWithBlob";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../../jotai/appGlobalStateAtom";

export interface IActiveUsersTrendDataState {
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

export const ActiveUsersTrendData = (props: IActiveUsersTrendProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider } = appGlobalState;
    const [state, setState] = React.useState<IActiveUsersTrendDataState>({
        items: [],
        isGenratePDF: !!props.isGenratePdf ? props.isGenratePdf : false,
        title: "",
        sendToEmail: "",
        displayError: false,
        displayErrorTitle: false,
        displayErrorEmail: false,
        isLoading: false,
        isPopupVisible: false,
    });

    const getUniqueUserCountByDay = (data: any[]) => {
        // Step 1: Group users by date
        const userCountByDay: Record<string, Set<string>> = data.reduce((acc, item) => {
            if (!item.Created || !item.UserName) return acc;

            const date = item.Created.split(' ')[0];

            if (!acc[date]) {
                acc[date] = new Set<string>();
            }

            acc[date].add(item.UserName);
            return acc;
        }, {} as Record<string, Set<string>>);

        // Step 2: Convert Sets to counts
        return Object.entries(userCountByDay)
            .map(([date, usersSet]) => ({
                date,
                uniqueUserCount: usersSet.size
            }))
            .sort((a, b) => {
                const [d1, m1, y1] = a.date.split('-').map(Number);
                const [d2, m2, y2] = b.date.split('-').map(Number);
                return new Date(y1, m1 - 1, d1).getTime() - new Date(y2, m2 - 1, d2).getTime();
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
            const fileName: string = 'Active Users Trend Report';
            setState((prevState: any) => ({ ...prevState, isGenratePDF: true }))
            setTimeout(async () => {
                const fileblob: any = await generateAndSaveKendoPDFHelpDesk("ActiveUsersTrend", fileName, false, true, true);
                const el = document.getElementById("ActiveUsersTrend");
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
            await generateAndSaveKendoPDFHelpDesk("ActiveUsersTrend", "Active Users Trend Report", false, true, true);
            const el = document.getElementById("ActiveUsersTrend");
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
            let data = getUniqueUserCountByDay(props.userActivityLogItems)
            setState((prevState: any) => ({ ...prevState, items: data }))

        } catch (error) {
            console.log(error);

        }
    }, [props.userActivityLogItems,])


    React.useEffect(() => {
        setState((prevState: any) => ({ ...prevState, isGenratePDF: props.isGenratePdf }))
    }, [props.isGenratePdf])

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