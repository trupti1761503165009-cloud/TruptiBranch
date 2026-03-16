/* eslint-disable no-case-declarations */
import { TooltipHost } from "@fluentui/react";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react"

export interface IHelpDeskCardProps {
    handleCardClick(card: IActiveCard[]): void;
    items: any[];
    activeCardName: IActiveCard[];
    isOtherReport?: boolean;
}

export interface ICount {
    totalCount: number;
    completed: number;
    inProgress: number;
    pending: number;
    high: number;
    low: number;
    medium: number;
    external: number;
    internal: number;
}

export interface IActiveCard {
    type: string,
    value: string;
    columnName: string
    postFixText?: string
}
export const HelpDeskCard = (props: IHelpDeskCardProps) => {
    const [activeCard, setActiveCard] = React.useState<IActiveCard[]>([]);
    const [count, setCount] = React.useState<ICount>({
        totalCount: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        high: 0,
        low: 0,
        medium: 0,
        external: 0,
        internal: 0
    })

    const locations = [
        "External", "Internal"
    ]
    const Priority = [
        "High", "Medium", "Low"
    ]
    const Status = [
        "Pending", "Completed", "In progress"
    ]


    const handleCardClickInternal = (title: string, columnName: string, type: string) => {
        // setActiveCard(title)
        let activeCardsFilter: IActiveCard[] = []
        switch (type) {
            case "Location":
                let sameCardLocation = activeCard.filter((i) => i.type == "Location");

                if (sameCardLocation.length > 0) {
                    let checkCardItems = sameCardLocation.filter((j) => j.value == title);
                    if (checkCardItems.length > 0) {
                        // remove that active card
                        let filterCard = activeCard.filter((i) => i.value != title);
                        activeCardsFilter = filterCard
                        // setActiveCard(filterCard);


                    } else {
                        // add the active card
                        let filterCard = activeCard.filter((i) => i.type != type);
                        // setActiveCard([...filterCard, { value: title, type: type, columnName: columnName }]);
                        activeCardsFilter = filterCard

                    }
                } else {
                    activeCardsFilter = [...activeCard, { value: title, type: type, columnName: columnName }]
                    // setActiveCard([...activeCard, { value: title, type: type, columnName: columnName }]);
                }




                break;
            case "Priority":
                let sameCardPriority = activeCard.filter((i) => i.type == "Priority");

                if (sameCardPriority.length > 0) {
                    let checkCardItems = sameCardPriority.filter((j) => j.value == title);
                    if (checkCardItems.length > 0) {
                        // remove that active card
                        let filterCard = activeCard.filter((i) => i.value != title);
                        activeCardsFilter = filterCard

                        // setActiveCard(filterCard);



                    } else {
                        // add the active card
                        let filterCard = activeCard.filter((i) => i.type != type);
                        activeCardsFilter = [...filterCard, { value: title, type: type, columnName: columnName }]

                        // setActiveCard([...filterCard, { value: title, type: type, columnName: columnName }]);

                    }
                } else {
                    activeCardsFilter = [...activeCard, { value: title, type: type, columnName: columnName }]
                    // setActiveCard([...activeCard, { value: title, type: type, columnName: columnName }]);
                }


                break;
            case "Status":
                let sameCardStatus = activeCard.filter((i) => i.type == "Status");
                if (sameCardStatus.length > 0) {
                    let checkCardItems = sameCardStatus.filter((j) => j.value == title);
                    if (checkCardItems.length > 0) {
                        // remove that active card
                        let filterCard = activeCard.filter((i) => i.value != title);
                        activeCardsFilter = filterCard

                        // setActiveCard(filterCard);


                    } else {
                        // add the active card
                        let filterCard = activeCard.filter((i) => i.type != type);
                        activeCardsFilter = [...filterCard, { value: title, type: type, columnName: columnName }]
                        // setActiveCard();

                    }
                } else {
                    activeCardsFilter = [...activeCard, { value: title, type: type, columnName: columnName }]
                    // setActiveCard([...activeCard, { value: title, type: type, columnName: columnName }]);
                }


                break;
            case "All":
                let sameCard = activeCard.filter((i) => i.value == title);
                if (sameCard.length > 0) {
                    // let filterCard = activeCard.filter((i) => i.value != title);
                    // setActiveCard([])
                    activeCardsFilter = []

                } else {
                    activeCardsFilter = [{ value: title, type: type, columnName: columnName }]

                }
                break;
            default:
                break;
        }
        setActiveCard(activeCardsFilter)
        if (props.handleCardClick)
            props.handleCardClick(activeCardsFilter);
    };

    const getCardCount = (items: any[]): ICount => {
        let cardCount: ICount = {
            totalCount: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            high: 0,
            low: 0,
            medium: 0,
            external: 0,
            internal: 0
        };


        if (items && items.length > 0) {
            for (let item of items) {
                cardCount.totalCount++; // Count total items

                // Count locations
                if (item.Location === "External") cardCount.external++;
                if (item.Location === "Internal") cardCount.internal++;

                // Count HDStatus
                if (item.HDStatus === "Pending") cardCount.pending++;
                if (item.HDStatus === "Completed") cardCount.completed++;
                if (item.HDStatus === "In progress") cardCount.inProgress++;

                // Count QCPriority
                if (item.QCPriority === "High") cardCount.high++;
                if (item.QCPriority === "Medium") cardCount.medium++;
                if (item.QCPriority === "Low") cardCount.low++;
            }
        }

        return cardCount;
    }

    React.useEffect(() => {
        let cardCount = getCardCount(props.items);
        setCount(cardCount);


    }, [props.items])


    React.useEffect(() => {
        setActiveCard(props.activeCardName)
    }, [props.activeCardName])

    return <div>
        <div className="helpDeskCard ">

            <div className="dashboard-container">

                <div className="dashboard">

                    <div
                        className={`card black hoverCard ${activeCard.filter((i) => i.value == "Total Request").length > 0 ? "active" : ""}`}
                        onClick={() => handleCardClickInternal('Total Request', "All", "All")}
                    >
                        {activeCard.filter((i) => i.value == "Total Request").length > 0 && (
                            <span className="justifyright">
                                <TooltipHost content={"Filter Apply"}>
                                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                </TooltipHost>
                            </span>
                        )}
                        <h2>{count.totalCount}</h2>
                        <p>Total Request</p>
                    </div>

                    <div
                        className={`card green hoverCard ${activeCard.filter((i) => i.value == "Completed").length > 0 ? "active" : ""}`}
                        onClick={() => handleCardClickInternal('Completed', "HDStatus", "Status")}
                    >
                        {activeCard.filter((i) => i.value == "Completed").length > 0 && (
                            <span className="justifyright">
                                <TooltipHost content={"Filter Apply"}>
                                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                </TooltipHost>
                            </span>
                        )}
                        <h2>{count.completed}</h2>
                        <p>Completed</p>
                    </div>

                    <div
                        className={`card green  hoverCard ${activeCard.filter((i) => i.value == "In progress").length > 0 ? "active" : ""}`}
                        onClick={() => handleCardClickInternal('In progress', "HDStatus", "Status")}
                    >
                        {activeCard.filter((i) => i.value == "In progress").length > 0 && (
                            <span className="justifyright">
                                <TooltipHost content={"Filter Apply"}>
                                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                </TooltipHost>
                            </span>
                        )}
                        <h2>{count.inProgress}</h2>
                        <p>In Progress</p>
                    </div>

                    <div
                        className={`card green  hoverCard ${activeCard.filter((i) => i.value == "Pending").length > 0 ? "active" : ""}`}
                        onClick={() => handleCardClickInternal('Pending', "HDStatus", "Status")}
                    >
                        {activeCard.filter((i) => i.value == "Pending").length > 0 && (
                            <span className="justifyright">
                                <TooltipHost content={"Filter Apply"}>
                                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                </TooltipHost>
                            </span>
                        )}
                        <h2>{count.pending}</h2>
                        <p>Pending</p>
                    </div>

                    <div
                        className={`card blue  hoverCard ${activeCard.filter((i) => i.value == "High").length > 0 ? "active" : ""}`}
                        onClick={() => handleCardClickInternal('High', "QCPriority", "Priority")}
                    >
                        {activeCard.filter((i) => i.value == "High").length > 0 && (
                            <span className="justifyright">
                                <TooltipHost content={"Filter Apply"}>
                                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                </TooltipHost>
                            </span>
                        )}
                        <h2>{count.high}</h2>
                        <p>High</p>
                    </div>

                    <div
                        className={`card blue hoverCard ${activeCard.filter((i) => i.value == "Medium").length > 0 ? "active" : ""}`}
                        onClick={() => handleCardClickInternal('Medium', "QCPriority", "Priority")}
                    >
                        {activeCard.filter((i) => i.value == "Medium").length > 0 && (
                            <span className="justifyright">
                                <TooltipHost content={"Filter Apply"}>
                                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                </TooltipHost>
                            </span>
                        )}
                        <h2>{count.medium}</h2>
                        <p>Medium</p>
                    </div>

                    <div
                        className={`card blue hoverCard ${activeCard.filter((i) => i.value == "Low").length > 0 ? "active" : ""}`}
                        onClick={() => handleCardClickInternal('Low', "QCPriority", "Priority")}
                    >
                        {activeCard.filter((i) => i.value == "Low").length > 0 && (
                            <span className="justifyright">
                                <TooltipHost content={"Filter Apply"}>
                                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                </TooltipHost>
                            </span>
                        )}
                        <h2>{count.low}</h2>
                        <p>Low</p>
                    </div>

                    <div
                        className={`card red hoverCard ${activeCard.filter((i) => i.value == "External").length > 0 ? "active" : ""}`}
                        onClick={() => handleCardClickInternal('External', "Location", "Location")}
                    >
                        {activeCard.filter((i) => i.value == "External").length > 0 && (
                            <span className="justifyright">
                                <TooltipHost content={"Filter Apply"}>
                                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                </TooltipHost>
                            </span>
                        )}
                        <h2>{count.external}</h2>
                        <p>External</p>
                    </div>

                    <div
                        className={`card red hoverCard ${activeCard.filter((i) => i.value == "Internal").length > 0 ? "active" : ""}`}
                        onClick={() => handleCardClickInternal('Internal', "Location", "Location")}
                    >
                        {activeCard.filter((i) => i.value == "Internal").length > 0 && (
                            <span className="justifyright">
                                <TooltipHost content={"Filter Apply"}>
                                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                </TooltipHost>
                            </span>
                        )}
                        <h2>{count.internal}</h2>
                        <p>Internal</p>
                    </div>

                </div>



            </div>
        </div>

    </div>
}