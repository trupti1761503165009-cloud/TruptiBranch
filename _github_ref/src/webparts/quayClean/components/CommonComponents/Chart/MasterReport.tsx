import * as React from "react";
import { Loader } from "../Loader";
import { Pivot, PivotItem } from "@fluentui/react";
import { SafetyCultureReport } from "./ChartInspectionData";
export interface IDocumnetProps {
    siteMasterId: any;
}

export const MasterReport = (props: IDocumnetProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [selectedKey, setselectedKey] = React.useState<any>("Overview");

    const _onLinkClick = (item: PivotItem): void => {
        setselectedKey(item.props.itemKey);
    };

    return <>
        {isLoading && <Loader />}

        <div className="boxCard">
            <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                    <h1 className="mainTitle">Safety Culture Report</h1>
                </div>
            </div>
            <div className='ms-Grid-row p-14'>
                <div className='ms-md12 ms-sm12 ms-Grid-col'>
                    <div className='dashboard-card p00'>
                        <div className='p-15 height211 lightgrey2'>
                            <Pivot aria-label="Basic Pivot Example" id="SCpivot" selectedKey={selectedKey} onLinkClick={_onLinkClick}>
                                <PivotItem headerText="Overview" itemKey="Overview">
                                    <div className="">
                                        <SafetyCultureReport siteName={props.siteMasterId} tab="Overview" />
                                    </div>
                                </PivotItem>
                                <PivotItem headerText="Conducted" itemKey="Conducted">
                                    <div className="">
                                        <SafetyCultureReport siteName={props.siteMasterId} tab="Conducted" />
                                    </div>
                                </PivotItem>
                                <PivotItem headerText="Performance" itemKey="Performance">
                                    <div className="">
                                        <SafetyCultureReport siteName={props.siteMasterId} tab="Performance" />
                                    </div>
                                </PivotItem>
                            </Pivot>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>;
};