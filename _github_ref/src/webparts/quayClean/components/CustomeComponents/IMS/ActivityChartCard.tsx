import * as React from 'react';
import { Label, TooltipHost, PrimaryButton, Link } from '@fluentui/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ActivityChartCardProps {
    total: number;
    groupByDate: boolean;
    setGroupByDate: (value: boolean) => void;
    graphView: boolean;
    onClickChartIcon: () => void;
    chartRef: React.RefObject<HTMLDivElement>;
}

const ActivityChartCard: React.FC<ActivityChartCardProps> = ({
    total,
    groupByDate,
    setGroupByDate,
    graphView,
    onClickChartIcon,
    chartRef
}) => {
    return (
        <div className="ims-chart-card mt-3">
            <div className="chart-header d-flex justify-content-between align-items-center dflex">
                <div>
                    <Label className="chart-label">Total User Activities Report</Label>
                    <div className="chart-number chart-green">{total}</div>
                </div>

                <div className="dflex">
                    <div>
                        <PrimaryButton
                            text={groupByDate ? "Show User-wise" : "Show Date-wise"}
                            onClick={() => setGroupByDate(!groupByDate)}
                            className="btn btn-primary"
                            style={{ marginTop: "27px", marginLeft: "5px" }}
                        />
                    </div>
                    <div className='mb--36-chart'>
                        <Link
                            className="actionBtn iconSize btnMove dticon custdd-icon"
                            onClick={onClickChartIcon}
                        >
                            <TooltipHost content={graphView ? "Graph view" : "Grid view"} id="tooltip">
                                <FontAwesomeIcon icon={graphView ? "chart-simple" : "table-cells"} />
                            </TooltipHost>
                        </Link>
                    </div>
                </div>
            </div>
            <div>
                <div ref={chartRef} style={{ width: '100%', height: '450px' }} />
            </div>
        </div>
    );
};

export default ActivityChartCard;
