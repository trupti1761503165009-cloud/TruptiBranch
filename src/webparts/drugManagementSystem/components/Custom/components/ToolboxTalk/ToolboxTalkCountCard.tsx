// /* eslint-disable react/self-closing-comp */
// import { faFilter } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { TooltipHost } from "office-ui-fabric-react";
// import * as React from "react";
// require('../../../../assets/css/collapsibleCardSection.css');
// let nonoverdue = require('../../../../assets/images/Quaysafe/submitted.png');
// let overdue = require('../../../../assets/images/Quaysafe/draft.png');
// let total = require('../../../../assets/images/Quaysafe/all.png');
// let pendingSignature = require('../../../../assets/images/Quaysafe/pending.png');
// let completedSignature = require('../../../../assets/images/Quaysafe/completed.png');

// export interface ICountCard {
//     data: any;
//     handleCardClick: (title: string | null) => void;
// }

// export const ToolboxTalkCountCard = (props: ICountCard) => {
//     const [isCollapsed, setIsCollapsed] = React.useState(false);
//     const [activeCard, setActiveCard] = React.useState<string | null>(null);
//     const { data, handleCardClick } = props;

//     /** CARD CONFIG FOR COLORS + PATTERN CLASS */
//     const cardConfig: any = {
//         "Total Toolbox Talk": {
//             cardClass: "TotalCard",
//             colorClass: "TotalCardColor",
//             patternClass: "TotalCard-pattern"
//         },
//         "Total Submitted": {
//             cardClass: "SubmitCard",
//             colorClass: "SubmitCardColor",
//             patternClass: "SubmitCard-pattern"
//         },
//         "Total Save as Draft": {
//             cardClass: "DraftCard",
//             colorClass: "DraftCardColor",
//             patternClass: "DraftCard-pattern"
//         },
//         "Completed Signature": {
//             cardClass: "CompletedCard",
//             colorClass: "CompletedCardColor",
//             patternClass: "CompletedCard-pattern"
//         },
//         "Pending signature": {
//             cardClass: "PendingCard",
//             colorClass: "PendingCardColor",
//             patternClass: "PendingCard-pattern"
//         }
//     };

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

//     /** Apply card classes dynamically */
//     const getCardClassName = (title: string) => {
//         const cfg = cardConfig[title];

//         return `
//             card 
//             ${cfg.cardClass || ""} 
//             ${activeCard === title ? "active-card" : ""}
//         `;
//     };

//     return (
//         <>
//             <div className="collapsible-section quaysafeCountCard m-0">
//                 <button className="toggle-icon" onClick={toggleSection}>
//                     {isCollapsed ? '➕' : '➖'}
//                 </button>

//                 <div className={`pageTopCount ${isCollapsed ? 'hidden' : ''}`}>
//                     <div
//                         className={getCardClassName('Total Toolbox Talk')}
//                         onClick={() => handleCardClickInternal('Total Toolbox Talk')}>
//                         <div className="card-content">
//                             <img src={total} alt="Toolbox Talk Icon" />
//                             <div className="card-block-text">
//                                 <h3 className={cardConfig["Total Toolbox Talk"].colorClass}>Total Toolbox Talk</h3>
//                                 <p className={`card-number ${cardConfig["Total Toolbox Talk"].colorClass}`}>
//                                     {data?.totalToolboxTalk}
//                                 </p>
//                             </div>
//                         </div>
//                         <div className={`pattern ${cardConfig["Total Toolbox Talk"].patternClass}`}></div>
//                         {activeCard === "Total Toolbox Talk" && (
//                             <div className="filter-icon-wrapper">
//                                 <TooltipHost content="Filter Applied">
//                                     <FontAwesomeIcon icon={faFilter} className="filter-icon" />
//                                 </TooltipHost>
//                             </div>
//                         )}
//                     </div>

//                     <div
//                         className={getCardClassName('Total Submitted')}
//                         onClick={() => handleCardClickInternal('Total Submitted')}>
//                         <div className="card-content">
//                             <img src={nonoverdue} alt="Services Due Icon" />
//                             <div className="card-block-text">
//                                 <h3 className={cardConfig["Total Submitted"].colorClass}>Total Submitted</h3>
//                                 <p className={`card-number ${cardConfig["Total Submitted"].colorClass}`}>
//                                     {data?.totalSubmittedData}
//                                 </p>
//                             </div>
//                         </div>
//                         <div className={`pattern ${cardConfig["Total Submitted"].patternClass}`}></div>
//                         {activeCard === "Total Submitted" && (
//                             <div className="filter-icon-wrapper">
//                                 <TooltipHost content="Filter Applied">
//                                     <FontAwesomeIcon icon={faFilter} className="filter-icon" />
//                                 </TooltipHost>
//                             </div>
//                         )}
//                     </div>

//                     <div
//                         className={getCardClassName('Total Save as Draft')}
//                         onClick={() => handleCardClickInternal('Total Save as Draft')}>
//                         <div className="card-content">
//                             <img src={overdue} alt="Draft Icon" />
//                             <div className="card-block-text">
//                                 <h3 className={cardConfig["Total Save as Draft"].colorClass}>Total Save as Draft</h3>
//                                 <p className={`card-number ${cardConfig["Total Save as Draft"].colorClass}`}>
//                                     {data?.totalSaveAsDraftData}
//                                 </p>
//                             </div>
//                         </div>
//                         <div className={`pattern ${cardConfig["Total Save as Draft"].patternClass}`}></div>
//                          {activeCard === "Total Save as Draft" && (
//                             <div className="filter-icon-wrapper">
//                                 <TooltipHost content="Filter Applied">
//                                     <FontAwesomeIcon icon={faFilter} className="filter-icon" />
//                                 </TooltipHost>
//                             </div>
//                         )}
//                     </div>
                    
//                     <div
//                         className={getCardClassName('Completed Signature')}
//                         onClick={() => handleCardClickInternal('Completed Signature')}>
//                         <div className="card-content">
//                             <img src={completedSignature} alt="Completed Signature" />
//                             <div className="card-block-text">
//                                 <h3 className={cardConfig["Completed Signature"].colorClass}>Completed Signature</h3>
//                                 <p className={`card-number ${cardConfig["Completed Signature"].colorClass}`}>
//                                     {data?.totalCompletedSignature}
//                                 </p>
//                             </div>
//                         </div>
//                         <div className={`pattern ${cardConfig["Completed Signature"].patternClass}`}></div>
//                          {activeCard === "Completed Signature" && (
//                             <div className="filter-icon-wrapper">
//                                 <TooltipHost content="Filter Applied">
//                                     <FontAwesomeIcon icon={faFilter} className="filter-icon" />
//                                 </TooltipHost>
//                             </div>
//                         )}
//                     </div>

//                     <div
//                         className={getCardClassName('Pending signature')}
//                         onClick={() => handleCardClickInternal('Pending signature')}>
//                         <div className="card-content">
//                             <img src={pendingSignature} alt="Pending Signature" />
//                             <div className="card-block-text">
//                                 <h3 className={cardConfig["Pending signature"].colorClass}>Pending Signature</h3>
//                                 <p className={`card-number ${cardConfig["Pending signature"].colorClass}`}>
//                                     {data?.totalPendingSignature}
//                                 </p>
//                             </div>
//                         </div>
//                         <div className={`pattern ${cardConfig["Pending signature"].patternClass}`}></div>
//                          {activeCard === "Pending signature" && (
//                             <div className="filter-icon-wrapper">
//                                 <TooltipHost content="Filter Applied">
//                                     <FontAwesomeIcon icon={faFilter} className="filter-icon" />
//                                 </TooltipHost>
//                             </div>
//                         )}
//                     </div>

//                 </div>
//             </div>
//         </>
//     );
// };


// // import * as React from "react";
// // require('../../../../assets/css/collapsibleCardSection.css');
// // let nonoverdue = require('../../../../assets/images/link/nonoverdue.svg');
// // let overdue = require('../../../../assets/images/link/overdue.svg');
// // let value = require('../../../../assets/images/link/value.svg');
// // let repair = require('../../../../assets/images/link/repair.svg');
// // let total = require('../../../../assets/images/link/total.svg');
// // let pendingSignature = require('../../../../assets/images/signature-Pending.svg');
// // let completedSignature = require('../../../../assets/images/signature-Completed.svg');

// // export interface ICountCard {
// //     data: any;
// //     handleCardClick: (title: string | null) => void;
// // }

// // export const ToolboxTalkCountCard = (props: ICountCard) => {

// //     const [isCollapsed, setIsCollapsed] = React.useState(false);
// //     const [activeCard, setActiveCard] = React.useState<string | null>(null);
// //     const { data, handleCardClick } = props;

// //     const handleCardClickInternal = (title: string) => {
// //         if (activeCard === title) {
// //             setActiveCard(null);
// //             handleCardClick(null);
// //         } else {
// //             setActiveCard(title);
// //             handleCardClick(title);
// //         }
// //     };

// //     const toggleSection = () => {
// //         setIsCollapsed(!isCollapsed);
// //     };

// //     const getCardClassName = (title: string) => {
// //         return `card ${activeCard === title ? 'active-card' : ''}`;
// //     };

// //     return <>
// //         <div className="collapsible-section">
// //             <button className="toggle-icon" onClick={toggleSection}>
// //                 {isCollapsed ? '➕' : '➖'} {/* Change icon based on state */}
// //             </button>
// //             <div className={`pageTopCount ${isCollapsed ? 'hidden' : ''}`}>
// //                 <div
// //                     className={getCardClassName('Total Toolbox Talk')}
// //                     onClick={() => handleCardClickInternal('Total Toolbox Talk')}>
// //                     <h3>Total Toolbox Talk</h3>
// //                     <div className="card-content">
// //                         <img src={total} alt="Toolbox Talk Icon" />
// //                         <p className="card-number">{data?.totalToolboxTalk}</p>
// //                     </div>
// //                 </div>

// //                 <div
// //                     className={getCardClassName('Total Submitted')}
// //                     onClick={() => handleCardClickInternal('Total Submitted')}
// //                 >
// //                     <h3>Total Submitted</h3>
// //                     <div className="card-content">
// //                         <img src={nonoverdue} alt="Services Due Icon" />
// //                         <p className="card-number">{data?.totalSubmittedData}</p>
// //                     </div>
// //                 </div>
// //                 <div
// //                     className={getCardClassName('Total Save as Draft')}
// //                     onClick={() => handleCardClickInternal('Total Save as Draft')}
// //                 >
// //                     <h3>Total Save as Draft</h3>
// //                     <div className="card-content">
// //                         <img src={overdue} alt="Total Save as Draft Icon" />
// //                         <p className="card-number">{data?.totalSaveAsDraftData}</p>
// //                     </div>
// //                 </div>
// //                 <div
// //                     className={getCardClassName('Completed Signature')}
// //                     onClick={() => handleCardClickInternal('Completed Signature')}
// //                 >
// //                     <h3>Completed Signature</h3>
// //                     <div className="card-content">
// //                         <img src={completedSignature} alt="Completed Signature" />
// //                         <p className="card-number">{data?.totalCompletedSignature}</p>
// //                     </div>
// //                 </div>
// //                 <div
// //                     className={getCardClassName('Pending signature')}
// //                     onClick={() => handleCardClickInternal('Pending signature')}
// //                 >
// //                     <h3>Pending Signature</h3>
// //                     <div className="card-content">
// //                         <img src={pendingSignature} alt="Pending signature" />
// //                         <p className="card-number">{data?.totalPendingSignature}</p>
// //                     </div>
// //                 </div>

// //             </div>
// //         </div>
// //     </>
// // };
