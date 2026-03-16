/* eslint-disable  */
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { PrimaryButton } from "@fluentui/react";
import { SitePageName, WasteReportPivot } from "../../../../../Common/Enum/WasteReportEnum";
import React from "react";
import { encryptValue } from "../../../../../Common/Util";

export interface IAmenitiesFeedbackFormLinkProps {
    siteMasterId: any;
}

export const AmenitiesFeedbackFormLink = (props: IAmenitiesFeedbackFormLinkProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { context } = appGlobalState;
    const [amenitiesFeedbackLink, setAmenitiesFeedbackLink] = React.useState("");

    React.useEffect(() => {
        const siteUrl: string = context.pageContext.web.absoluteUrl;
        if (!!siteUrl) {
            let amenitiesFeedbackLink = `${context.pageContext.web.absoluteUrl}/SitePages/${SitePageName.AmenitiesFeedbackForm}?SiteId=${encryptValue(props?.siteMasterId)}`
            setAmenitiesFeedbackLink(amenitiesFeedbackLink);
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
                                text={WasteReportPivot.AmenitiesFeedbackForm}
                                onClick={() => {
                                    window.open(amenitiesFeedbackLink, '_blank');
                                }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
