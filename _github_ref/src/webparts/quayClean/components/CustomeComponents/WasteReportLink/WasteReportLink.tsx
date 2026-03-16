/* eslint-disable  */
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { PrimaryButton } from "@fluentui/react";
import { WasteReportPivot } from "../../../../../Common/Enum/WasteReportEnum";
import React from "react";
import { decryptWasteValue, encryptWasteValue } from "../../../../../Common/Util";

export interface IWasteReportProps {
    siteMasterId: any;
    siteName: any
}

export const WasteReportLink = (props: IWasteReportProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { context } = appGlobalState;
    const [wasteReportLink, setWasteReportLink] = React.useState("");

    React.useEffect(() => {
        const siteUrl: string = context.pageContext.web.absoluteUrl;
        const encryptedSiteName = encryptWasteValue(props?.siteName);
        if (!!siteUrl) {
            let wasteReportLink = "";
            const baseSitesUrl = siteUrl.split('/sites')[0] + '/sites';
            const urlParts = siteUrl.replace(/^https?:\/\//, '').split('.');
            const foundTenantName = urlParts[0]?.toLowerCase();
            if (foundTenantName === "treta") {
                wasteReportLink = `${baseSitesUrl}/SSWasteReport/SitePages/SSWasteReport.aspx?SiteName=${encryptedSiteName}`;
            } else if (foundTenantName === "quaycleanaustralia") {
                wasteReportLink = `${baseSitesUrl}/SSClientPortal/SitePages/SSWasteReport.aspx?SiteName=${encryptedSiteName}`;
            }
            setWasteReportLink(wasteReportLink);
            // const siteName: any = decryptWasteValue(encryptedSiteName);
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
                                text={WasteReportPivot.WasteReport}
                                onClick={() => {
                                    window.open(wasteReportLink, '_blank');
                                }}
                            />
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
