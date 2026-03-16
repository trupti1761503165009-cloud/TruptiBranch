import { TooltipHost } from 'office-ui-fabric-react';
import React, { useState } from 'react';

export interface IProgressBarWithTooltipProps {
    progressValue: number;
    maxValue: number;
    renderCompletedTotalSignature: string;
    pendingSingUserName?: any[]
}

const ProgressBarWithTooltip = (props: IProgressBarWithTooltipProps) => {
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });


    const renderToolTipsAttendees = (attendees: any) => {
        const attendeesList = attendees; // Split by comma and space
        const displayNames = attendeesList;
        return (
            <><div className='mar-bot-10'>Pending attendees:</div>
                {displayNames.map((name: any, index: any) => (
                    <span key={index} className={name !== '...' ? "attendees-badge-cls" : ''}>{name}</span>
                ))}
            </>
        );
    };

    const handleMouseMove = (event: any) => {
        const progressBar = event.target;
        const offsetX = event.nativeEvent.offsetX;

        // Correct percentage calculation for the tooltip
        const percentage = Math.round((props.progressValue / props.maxValue) * 100);

        setTooltipPosition({
            left: offsetX - 40,
            top: progressBar.offsetTop - 30,
        });

        setTooltipVisible(true);
    };

    const handleMouseOut = () => {
        setTooltipVisible(false);
    };



    const progressPercentage = Math.round((props.progressValue / props.maxValue) * 100);

    return (
        // <div style={{ position: 'relative', width: "150px" }}>
        //     <TooltipHost content={props.renderCompletedTotalSignature || ""}>
        //         <progress
        //             value={props.progressValue}
        //             max={props.maxValue}
        //             className='quaySafebar'
        //         >

        //             Your browser does not support the progress element.
        //         </progress>
        //         <div
        //             className='quaySafeProgressBar'
        //         >
        //             {props.renderCompletedTotalSignature} ({progressPercentage}%)
        //         </div>
        //     </TooltipHost>
        // </div>
        // <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        //     <div style={{ position: "relative", width: "150px", textAlign: "center" }}>
        //         <TooltipHost content={props.renderCompletedTotalSignature || ""}>
        //             <progress
        //                 value={props.progressValue}
        //                 max={props.maxValue}
        //                 className="quaySafebar"
        //                 style={{ width: "100%" }}
        //             >
        //                 Your browser does not support the progress element.
        //             </progress>
        //             <div className="quaySafeProgressBar">
        //                 {props.renderCompletedTotalSignature} ({progressPercentage}%)
        //             </div>
        //         </TooltipHost>
        //     </div>
        // </div>
        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
            <div style={{ position: "relative", width: "150px", textAlign: "center" }}>
                <TooltipHost
                    // content={props.renderCompletedTotalSignature || ""}
                    content={(!!props.pendingSingUserName && props.pendingSingUserName.length > 0) ? renderToolTipsAttendees(props.pendingSingUserName) : (props.renderCompletedTotalSignature || "")}
                >
                    <progress
                        value={props.progressValue}
                        max={props.maxValue}
                        className="quaySafebar"
                    >
                        Your browser does not support the progress element.
                    </progress>
                    <div className="quaySafeProgressBar">
                        {props.renderCompletedTotalSignature} ({!!progressPercentage ? progressPercentage : 0}%)
                    </div>
                </TooltipHost>
            </div>
        </div>


    );
};

export default ProgressBarWithTooltip;

