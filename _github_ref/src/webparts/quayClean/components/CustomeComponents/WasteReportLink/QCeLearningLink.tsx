/* eslint-disable  */
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { PrimaryButton } from "@fluentui/react";
import { SitePageName, WasteReportPivot } from "../../../../../Common/Enum/WasteReportEnum";
import React from "react";
import { encryptValue } from "../../../../../Common/Util";

export interface IQCeLearningLinkProps {
    siteMasterId: any;
}

export const QCeLearningLink = (props: IQCeLearningLinkProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { context } = appGlobalState;
    const [eLearningLink, seteLearningLink] = React.useState("");

    React.useEffect(() => {
        const siteUrl: string = context.pageContext.web.absoluteUrl;
        if (!!siteUrl) {
            if (!!props?.siteMasterId) {
                let eLearningLink = `${context.pageContext.web.absoluteUrl}/SitePages/${SitePageName.QCeLearning}?SiteId=${encryptValue(props?.siteMasterId)}`
                seteLearningLink(eLearningLink);
            } else {
                let eLearningLink = `${context.pageContext.web.absoluteUrl}/SitePages/${SitePageName.QCeLearning}`
                seteLearningLink(eLearningLink);
            }

            // const siteName: any = decryptWasteValue(encryptedSiteId);
            // console.log(siteName);
        }
    }, []);

    return (
        <div className="mt-10">
            <div className="ms-Grid">
                <div className="ms-Grid-row">
                    <div className="">
                        <div className="formGroup dflex mt-2">
                            <PrimaryButton
                                className="btn btn-primary ml-10"
                                text={WasteReportPivot.QCeLEarning}
                                onClick={() => {
                                    window.open(eLearningLink, '_blank');
                                }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
