import React from "react"
import { ILowSiteUsageProps } from "./LowSiteUsage"
import { ListNames } from "../../../../../../../Common/Enum/ComponentNameEnum";
import { toastService } from "../../../../../../../Common/ToastService";
import { generateAndSaveKendoPDFHelpDesk } from "../../../../../../../Common/Util";
import { IFileWithBlob } from "../../../../../../../DataProvider/Interface/IFileWithBlob";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../../jotai/appGlobalStateAtom";

export interface ILowSiteUsageDataState {
    items: any[];
    allItems: any[]
    cardCounts: any;
    chartCounts: any;
    isPopupVisible: boolean;
    title: string;
    sendToEmail: string;
    displayErrorTitle: boolean;
    displayErrorEmail: boolean
    displayError: boolean;
    isLoading: boolean;
    isGenratePDF: boolean
}

export const LowSiteUsageData = (props: ILowSiteUsageProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider } = appGlobalState;
    const [state, setState] = React.useState<ILowSiteUsageDataState>({
        items: [],
        chartCounts: {
            activeSites: 0,
            inActiveSites: 0,
        },
        allItems: [],
        cardCounts: {
            activeSites: 0,
            inActiveSites: 0,
        },
        isGenratePDF: !!props.isGenratePdf ? props.isGenratePdf : false,
        title: "",
        sendToEmail: "",
        displayError: false,
        displayErrorTitle: false,
        displayErrorEmail: false,
        isLoading: false,
        isPopupVisible: false,
    });




    const findSiteActivityCounts = (
        userActivities: any[],
        sites: any[],
        threshold: number // default to 0 if not provided
    ) => {
        // Group logs by siteId and count
        const activityCountMap: Record<number, number> = {};

        userActivities.forEach((log) => {
            const siteId = Number(log.SiteNameId);
            if (!isNaN(siteId)) {
                activityCountMap[siteId] = (activityCountMap[siteId] || 0) + 1;
            }
        });

        // Map activity count into sites
        const siteActivityList: any[] = sites.map((site) => {
            const activityCount = activityCountMap[site.Id] || 0;
            return {
                siteId: site.Id,
                siteName: site.Title,
                state: site.StateName,
                totalUserCount: site.totalUserCount,
                activityCount,
                isInActive: activityCount === 0,
                isLowActive: activityCount > 0 && activityCount < threshold, // NEW FLAG
                isHighActive: threshold < activityCount
            };
        });

        // Sort by activity count (ascending)
        siteActivityList.sort((a, b) => a.activityCount - b.activityCount);

        // Summary counts
        const activeSiteCount = siteActivityList.filter((s) => !s.isInActive).length;
        const inactiveSiteCount = siteActivityList.filter((s) => s.isInActive).length;
        const lowActiveSiteCount = siteActivityList.filter((s) => s.isLowActive).length;
        const highActiveSiteCount = siteActivityList.filter((s) => s.isHighActive).length;
        return {
            siteActivityList,
            activeSiteCount,
            inactiveSiteCount,
            lowActiveSiteCount,
            highActiveSiteCount
        };
    };


    const handleCardClick = (card: any[], defaultFilter?: string[]) => {

        let filterItems: any[] = state.allItems
        // for (let index = 0; index < card.length; index++) {
        //     const element = card[index].columnName;
        //     switch (element) {
        //         case "highActiveSites":
        //             filterItems = filterItems.filter((s) => s.isHighActive)
        //             break;
        //         case "lowActiveSiteCount":
        //             filterItems = filterItems.filter((s) => s.isLowActive)
        //             break;
        //         case "inActiveSites":
        //             filterItems = filterItems.filter((s) => s.isInActive)
        //             break;

        //         default:
        //             break;
        //     }
        // }
        let filterConditions: ((s: any) => boolean)[] = [];

        for (let index = 0; index < card.length; index++) {
            const element = card[index].columnName;
            switch (element) {
                case "highActiveSites":
                    filterConditions.push((s) => s.isHighActive);
                    break;
                case "lowActiveSiteCount":
                    filterConditions.push((s) => s.isLowActive);
                    break;
                case "inActiveSites":
                    filterConditions.push((s) => s.isInActive);
                    break;
                default:
                    break;
            }
        }

        if (filterConditions.length > 0) {
            filterItems = filterItems.filter((s) =>
                filterConditions.some((cond) => cond(s))
            );
        }

        const inactiveSiteCount = filterItems.filter((s) => s.isInActive).length;
        const lowActiveSiteCount = filterItems.filter((s) => s.isLowActive).length;
        const highActiveSiteCount = filterItems.filter((s) => s.isHighActive).length;

        let chartCounts: Record<string, number> = {
            activeSites: 0,
            inActiveSites: inactiveSiteCount,
            lowActiveSiteCount: lowActiveSiteCount,
            highActiveSites: highActiveSiteCount,
        };

        // Remove properties where value is 0
        Object.keys(chartCounts).forEach((key) => {
            if (chartCounts[key] === 0) {
                delete chartCounts[key];
            }
        });

        setState((prevState: any) => ({ ...prevState, items: filterItems, chartCounts: chartCounts }));


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
            const fileName: string = 'No Usage Site Report';
            setState((prevState: any) => ({ ...prevState, isGenratePDF: true }))
            setTimeout(async () => {
                const fileblob: any = await generateAndSaveKendoPDFHelpDesk("NoUsageSiteReport", fileName, false, true, true);
                const el = document.getElementById("NoUsageSiteReport");
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
            await generateAndSaveKendoPDFHelpDesk("NoUsageSiteReport", "No Usage Site Report", false, true, true);
            const el = document.getElementById("NoUsageSiteReport");
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
        const { siteActivityList, inactiveSiteCount, activeSiteCount, lowActiveSiteCount, highActiveSiteCount } = findSiteActivityCounts(props.userActivityLogItems, props.siteItems, 50);
        const cardCounts = {
            activeSites: activeSiteCount || 0,
            inActiveSites: inactiveSiteCount || 0,
            totalSites: props.siteItems.length || 0,
            lowActiveSiteCount: lowActiveSiteCount || 0,
            highActiveSites: highActiveSiteCount || 0

        }
        setState((prevState) => ({ ...prevState, allItems: siteActivityList, items: siteActivityList, chartCounts: cardCounts, cardCounts: cardCounts }));
    }, [props.siteItems, props.userActivityLogItems])

    return {
        state,
        handleCardClick,
        onClickDownload,
        onClickCancel,
        onChangeTitle,
        onClickSendEmail,
        onChangeSendToEmail,
        onClickShowEmailModel
    }
}