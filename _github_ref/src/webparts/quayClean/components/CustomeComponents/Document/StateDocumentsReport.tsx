/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Pivot, PivotItem } from "@fluentui/react";
import StateAddDocumentReport from "./StateAddDocumentReport";
import StateLinkDocumentReport from "./StateLinkDocumentReport";
import StateLinkURLReport from "./StateLinkURLReport";

export interface IAssociateChemicalProps {
    ChartData: any;
    isChartOnly?: boolean;
}
interface ChartDataItem {
    ActionType: string;
    EntityType: string;
}

export const StateDocumentsReport = (props: IAssociateChemicalProps) => {
    const [selectedKey, setselectedKey] = React.useState<any>();
    const _onLinkClick = (item: PivotItem): void => {
        if (item.props.itemKey == "Safety Culture") {
            console.log();
        }
        setselectedKey(item.props.itemKey);
    };

    return <>
        <div className='ms-Grid-row p-14'>
            <div className='ms-md12 ms-sm12 ms-Grid-col'>
                <div className='dashboard-card p00'>
                    <div className='p-15 height211 lightgrey2'>
                        <div className="">
                            <Pivot aria-label="Basic Pivot Example" id="SCpivot" selectedKey={selectedKey}
                                onLinkClick={_onLinkClick}>
                                <PivotItem headerText="Add Document" itemKey="AddDocument">
                                    <div className="">
                                        <div className="formGroup mt-3">
                                            <StateAddDocumentReport
                                                isChartOnly={props.isChartOnly}
                                                data={props.ChartData}
                                            />
                                        </div>
                                    </div>
                                </PivotItem>
                                <PivotItem headerText="Link Document" itemKey="LinkDocument">
                                    <div className="">
                                        <div className="formGroup mt-3">
                                            <StateLinkDocumentReport
                                                isChartOnly={props.isChartOnly}
                                                data={props.ChartData}
                                            />
                                        </div>
                                    </div>
                                </PivotItem>
                                <PivotItem headerText="Link URL" itemKey="LinkURL">
                                    <div className="">
                                        <div className="formGroup mt-3">
                                            <StateLinkURLReport
                                                isChartOnly={props.isChartOnly}
                                                data={props.ChartData}
                                            />
                                        </div>
                                    </div>
                                </PivotItem>
                            </Pivot>
                        </div >
                    </div>
                </div>
            </div>
        </div >
    </>;
}