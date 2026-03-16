import * as React from 'react';
import { Label, PrimaryButton, Link, TooltipHost, Button } from '@fluentui/react';

interface GenericChartCardProps {
    total: number;
    chartRef: React.RefObject<HTMLDivElement>;
    viewMode: 'byEntity' | 'byAction';
    setViewMode: (mode: 'byEntity' | 'byAction') => void;
    graphView: boolean;
    onClickChartIcon: () => void;
    setDrillDownData: (data: null) => void;
    setDrillDownUserData: (data: null) => void;
    drillDownData: any;
    drillDownUserData: any;
    chartHeight?: number;
}

const GenericChartCard: React.FC<GenericChartCardProps> = ({
    total,
    chartRef,
    viewMode,
    setViewMode,
    graphView,
    onClickChartIcon,
    setDrillDownData,
    setDrillDownUserData,
    drillDownData,
    drillDownUserData,
    chartHeight = 500
}) => {
    return (
        <div className="ims-chart-card mt-3">
            <div className="chart-header d-flex justify-content-between align-items-center dflex">
                <div>
                    <Label className="chart-label">
                        Total Activity by {viewMode === 'byAction' ? 'Action and Entity Report' : 'Entity and Action Report'}
                    </Label>
                </div>
                <div className="dflex">
                    <div>
                        {(drillDownData || drillDownUserData) && (
                            <div className="">
                                <PrimaryButton
                                    text="Back"
                                    className="btn btn-primary"
                                    style={{ marginTop: "27px", marginLeft: "5px" }}
                                    onClick={() => {
                                        if (drillDownUserData) setDrillDownUserData(null);
                                        else if (drillDownData) setDrillDownData(null);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <div>
                        <PrimaryButton
                            text={viewMode === 'byEntity' ? "Show By Action" : "Show By Entity"}
                            onClick={() => setViewMode(viewMode === 'byEntity' ? 'byAction' : 'byEntity')}
                            className="btn btn-primary"
                            style={{ marginTop: "27px", marginLeft: "5px" }}
                        />
                    </div>
                </div>
            </div>
            <div>
                <div ref={chartRef} style={{ width: '100%', height: `${chartHeight}px` }} />
            </div>
        </div>
    );
};

export default GenericChartCard;
