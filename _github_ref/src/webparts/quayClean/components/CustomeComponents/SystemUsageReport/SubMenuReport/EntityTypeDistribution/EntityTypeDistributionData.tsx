import React from "react"
import { IEntityTypeDistributionProps } from "./EntityTypeDistribution"
import { IReportUserActivityLog } from "../../IReport";
import { IFileWithBlob } from "../../../../../../../DataProvider/Interface/IFileWithBlob";
import { toastService } from "../../../../../../../Common/ToastService";
import { ListNames } from "../../../../../../../Common/Enum/ComponentNameEnum";
import { generateAndSaveKendoPDFHelpDesk, generateExcelTable } from "../../../../../../../Common/Util";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../../../jotai/appGlobalStateAtom";

export interface IEntityTypeDistributionDataState {
    items: any[];
    isGenratePDF: boolean
    isPopupVisible: boolean;
    title: string;
    sendToEmail: string;
    displayErrorTitle: boolean;
    displayErrorEmail: boolean
    displayError: boolean;
    isLoading: boolean;
}

export const EntityTypeDistributionData = (props: IEntityTypeDistributionProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider } = appGlobalState;
    const [state, setState] = React.useState<IEntityTypeDistributionDataState>({
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


    const groupLogs = (data: IReportUserActivityLog[]): any[] => {
        // Group by EntityType
        const entityMap: Record<string, IReportUserActivityLog[]> = {};
        data.forEach(item => {
            if (!entityMap[item.EntityType]) {
                entityMap[item.EntityType] = [];
            }
            entityMap[item.EntityType].push(item);
        });

        return Object.entries(entityMap).map(([entityType, entityItems]) => {
            // Group by State within EntityType
            const stateMap: Record<string, IReportUserActivityLog[]> = {};
            entityItems.forEach(item => {
                if (!stateMap[item.State]) {
                    stateMap[item.State] = [];
                }
                stateMap[item.State].push(item);
            });

            const stateChildren: any[] = Object.entries(stateMap).map(([state, stateItems]) => {
                // Group by SiteName within State
                const siteMap: Record<string, IReportUserActivityLog[]> = {};
                stateItems.forEach(item => {
                    if (!siteMap[item.SiteName]) {
                        siteMap[item.SiteName] = [];
                    }
                    siteMap[item.SiteName].push(item);
                });

                const siteChildren: any[] = Object.entries(siteMap).map(([site, siteItems]) => ({
                    name: site,
                    // siteCount: siteItems.length || 0,
                    entityCount: siteItems.length || 0
                }));

                return {
                    name: state,
                    // stateCount: stateItems.length,
                    entityCount: siteChildren.length || 0,
                    siteCount: siteChildren.length || 0,
                    children: siteChildren,
                    // isExpandable: siteChildren.length > 0
                };
            });

            return {
                name: entityType,
                entityCount: entityItems.length || 0,
                stateCount: stateChildren.length || 0,
                siteCount: stateChildren?.length > 0 ? (stateChildren[0]?.children?.length || 0) : 0,
                children: stateChildren,
                // isExpandable: stateChildren.length > 0
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
            const fileName: string = 'Entity Type Distribution Report';
            setState((prevState: any) => ({ ...prevState, isGenratePDF: true }))
            setTimeout(async () => {
                const fileblob: any = await generateAndSaveKendoPDFHelpDesk("EntityTypeDistributionRepo", fileName, false, true, true);
                const el = document.getElementById("EntityTypeDistributionRepo");
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
            await generateAndSaveKendoPDFHelpDesk("EntityTypeDistributionRepo", "Entity Type Distribution Report", false, true, true);
            const el = document.getElementById("EntityTypeDistributionRepo");
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
            let data = groupLogs(props.userActivityLogItems)
            setState((prevState) => ({ ...prevState, items: data }));

        } catch (error) {
            console.log(error);
        }

    }, [props.userActivityLogItems]);

    return {
        state,
        generateExcelTable,
        onClickDownload,
        onClickCancel,
        onChangeTitle,
        onClickSendEmail,
        onChangeSendToEmail,
        onClickShowEmailModel
    }
}