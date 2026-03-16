/* eslint-disable  */
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { PrimaryButton } from "@fluentui/react";
import { SitePageName, WasteReportPivot } from "../../../../../Common/Enum/WasteReportEnum";
import React from "react";
import { encryptValue } from "../../../../../Common/Util";

export interface IDailyCleaningDutisPageLinkProps {
    siteMasterId: any;
}

export const DailyCleaningDutisPageLink = (props: IDailyCleaningDutisPageLinkProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { context } = appGlobalState;
    const [dailyCleaningDutiesPageLink, setDailyCleaningDutiesPageLink] = React.useState("");

    React.useEffect(() => {
        const siteUrl: string = context.pageContext.web.absoluteUrl;
        if (!!siteUrl) {
            let dailyCleanigDutiesPageLink = `${context.pageContext.web.absoluteUrl}/SitePages/${SitePageName.DailyCleaningDuties}?SiteId=${encryptValue(props?.siteMasterId)}`
            setDailyCleaningDutiesPageLink(dailyCleanigDutiesPageLink);
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
                                text={WasteReportPivot.DailyCleaningDuties}
                                onClick={() => {
                                    window.open(dailyCleaningDutiesPageLink, '_blank');
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
