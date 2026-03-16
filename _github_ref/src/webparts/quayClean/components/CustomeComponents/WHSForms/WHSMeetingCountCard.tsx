import * as React from "react";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TooltipHost } from "office-ui-fabric-react";
require('../../../assets/css/collapsibleCardSection.css');

let total = require('../../../assets/images/Quaysafe/all.png');
let pendingSignature = require('../../../assets/images/Quaysafe/pending.png');
let completedSignature = require('../../../assets/images/Quaysafe/completed.png');

export interface ICountCard {
    data: any;
    handleCardClick: (title: string | null) => void;
}

export const WHSMeetingCountCard = (props: ICountCard) => {

    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [activeCard, setActiveCard] = React.useState<string | null>(null);
    const { data, handleCardClick } = props;

    /* =======================
       CARD CONFIG
    ======================= */
    const cardConfig: any = {
        "Total": {
            cardClass: "TotalCard",
            colorClass: "TotalCardColor",
            patternClass: "TotalCard-pattern"
        },
        "Completed Signature": {
            cardClass: "CompletedCard",
            colorClass: "CompletedCardColor",
            patternClass: "CompletedCard-pattern"
        },
        "Pending signature": {
            cardClass: "PendingCard",
            colorClass: "PendingCardColor",
            patternClass: "PendingCard-pattern"
        }
    };

    /* =======================
       HANDLERS
    ======================= */
    const handleCardClickInternal = (title: string) => {
        if (activeCard === title) {
            setActiveCard(null);
            handleCardClick(null);
        } else {
            setActiveCard(title);
            handleCardClick(title);
        }
    };

    const toggleSection = () => {
        setIsCollapsed(!isCollapsed);
    };

    const getCardClassName = (title: string) => {
        const cfg = cardConfig[title];
        return `
            card
            ${cfg.cardClass || ""}
            ${activeCard === title ? "active-card" : ""}
        `;
    };

    /* =======================
       RENDER
    ======================= */
    return (
        <>
            <div className="collapsible-section quaysafeCountCard m-0">
                <button className="toggle-icon" onClick={toggleSection}>
                    {isCollapsed ? '➕' : '➖'}
                </button>

                <div className={`pageTopCount ${isCollapsed ? 'hidden' : ''}`}>

                    {/* TOTAL */}
                    <div
                        className={getCardClassName('Total')}
                        onClick={() => handleCardClickInternal('Total')}
                    >
                        <div className="card-content">
                            <img src={total} alt="Total Meetings" />
                            <div className="card-block-text">
                                <h3 className={cardConfig["Total"].colorClass}>Total</h3>
                                <p className={`card-number ${cardConfig["Total"].colorClass}`}>
                                    {data?.total || 0}
                                </p>
                            </div>
                        </div>
                        <div className={`pattern ${cardConfig["Total"].patternClass}`}></div>
                        {activeCard === "Total" && (
                            <div className="filter-icon-wrapper">
                                <TooltipHost content="Filter Applied">
                                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                </TooltipHost>
                            </div>
                        )}
                    </div>

                    {/* COMPLETED SIGNATURE */}
                    <div
                        className={getCardClassName('Completed Signature')}
                        onClick={() => handleCardClickInternal('Completed Signature')}
                    >
                        <div className="card-content">
                            <img src={completedSignature} alt="Completed Signature" />
                            <div className="card-block-text">
                                <h3 className={cardConfig["Completed Signature"].colorClass}>
                                    Completed Signature
                                </h3>
                                <p className={`card-number ${cardConfig["Completed Signature"].colorClass}`}>
                                    {data?.totalCompletedSignature || 0}
                                </p>
                            </div>
                        </div>
                        <div className={`pattern ${cardConfig["Completed Signature"].patternClass}`}></div>
                        {activeCard === "Completed Signature" && (
                            <div className="filter-icon-wrapper">
                                <TooltipHost content="Filter Applied">
                                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                </TooltipHost>
                            </div>
                        )}
                    </div>

                    {/* PENDING SIGNATURE */}
                    <div
                        className={getCardClassName('Pending signature')}
                        onClick={() => handleCardClickInternal('Pending signature')}
                    >
                        <div className="card-content">
                            <img src={pendingSignature} alt="Pending Signature" />
                            <div className="card-block-text">
                                <h3 className={cardConfig["Pending signature"].colorClass}>
                                    Pending Signature
                                </h3>
                                <p className={`card-number ${cardConfig["Pending signature"].colorClass}`}>
                                    {data?.totalPendingSignature || 0}
                                </p>
                            </div>
                        </div>
                        <div className={`pattern ${cardConfig["Pending signature"].patternClass}`}></div>
                        {activeCard === "Pending signature" && (
                            <div className="filter-icon-wrapper">
                                <TooltipHost content="Filter Applied">
                                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                </TooltipHost>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
};

// import * as React from "react";
// require('../../../assets/css/collapsibleCardSection.css');

// let pendingSignature = require('../../../assets/images/signature-Pending.svg');
// let completedSignature = require('../../../assets/images/signature-Completed.svg');
// let total = require('../../../assets/images/link/total.svg');

// export interface ICountCard {
//     data: any;
//     handleCardClick: (title: string | null) => void;
// }

// export const WHSMeetingCountCard = (props: ICountCard) => {

//     const [isCollapsed, setIsCollapsed] = React.useState(false);
//     const [activeCard, setActiveCard] = React.useState<string | null>(null);
//     const { data, handleCardClick } = props;

//     const handleCardClickInternal = (title: string) => {
//         if (activeCard === title) {
//             setActiveCard(null);
//             handleCardClick(null);
//         } else {
//             setActiveCard(title);
//             handleCardClick(title);
//         }
//     };

//     const toggleSection = () => {
//         setIsCollapsed(!isCollapsed);
//     };

//     const getCardClassName = (title: string) => {
//         return `card ${activeCard === title ? 'active-card' : ''}`;
//     };

//     return <>
//         <div className="collapsible-section">
//             <button className="toggle-icon" onClick={toggleSection}>
//                 {isCollapsed ? '➕' : '➖'} {/* Change icon based on state */}
//             </button>
//             <div className={`pageTopCount ${isCollapsed ? 'hidden' : ''}`}>

//                 <div
//                     className={getCardClassName('Total')}
//                     onClick={() => handleCardClickInternal('Total')}
//                 >
//                     <h3>Total</h3>
//                     <div className="card-content">
//                         <img src={total} alt="Services Due Icon" />
//                         <p className="card-number">{data?.total || 0}</p>
//                     </div>
//                 </div>
//                 <div
//                     className={getCardClassName('Completed Signature')}
//                     onClick={() => handleCardClickInternal('Completed Signature')}
//                 >
//                     <h3>Completed Signature</h3>
//                     <div className="card-content">
//                         <img src={completedSignature} alt="Completed Signature" />
//                         <p className="card-number">{data?.totalCompletedSignature || 0}</p>
//                     </div>
//                 </div>
//                 <div
//                     className={getCardClassName('Pending signature')}
//                     onClick={() => handleCardClickInternal('Pending signature')}
//                 >
//                     <h3>Pending Signature</h3>
//                     <div className="card-content">
//                         <img src={pendingSignature} alt="Pending signature" />
//                         <p className="card-number">{data?.totalPendingSignature || 0}</p>
//                     </div>
//                 </div>

//             </div>
//         </div>
//     </>
// };