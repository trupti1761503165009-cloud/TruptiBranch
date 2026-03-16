import React from "react";
import { IActiveCard } from "../../../CommonComponents/Chart/HelpDeskCard";
import { ICardsArray } from "../../IMS/WorkplaceInspection/IMSReportCards";
import { TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";

export interface ICombineStateReportProps {
    data: any;
    handleCardClick?(card: IActiveCard[], defaultFilter?: string[]): void;
    cardsArray: ICardsArray[];
    filterColumnValue?: string[];
}

export const TopLowSitesCard = (props: ICombineStateReportProps) => {

    const [activeCard, setActiveCard] = React.useState<IActiveCard[]>([]);
    const [count, setCount] = React.useState<any>();
    const [keyUpdate, setKeyUpdate] = React.useState<number>(Math.random());
    const handleCardClickInternal = (title: string, columnName: string, type: string) => {
        let activeCardsFilter: IActiveCard[] = [];
        if (type == "All") {
            let sameCard = activeCard.filter((i) => i.value == title);
            if (sameCard.length > 0) {
                activeCardsFilter = []

            } else {
                activeCardsFilter = [{ value: title, type: type, columnName: columnName }]

            }
        } else {
            let sameCardActionType = activeCard.filter((i) => i.type == type);

            if (sameCardActionType.length > 0) {
                let checkCardItems = sameCardActionType.filter((j) => j.value == title);
                if (checkCardItems.length > 0) {

                    let filterCard = activeCard.filter((i) => i.value != title);
                    activeCardsFilter = filterCard
                } else {
                    let filterCard = activeCard.filter((i) => i.type != type);
                    activeCardsFilter = [...filterCard, { value: title, type: type, columnName: columnName }]

                }
            } else {
                activeCardsFilter = [...activeCard, { value: title, type: type, columnName: columnName }]
            }

        }
        setActiveCard(activeCardsFilter)
        if (props.handleCardClick)
            props.handleCardClick(activeCardsFilter, props.filterColumnValue);
    };

    return <div className="combineStateReport  sysUsage-card">

        <div className="dashboard-container">
            <div className="dashboard" key={keyUpdate}>
                {props.cardsArray.length > 0 && props.cardsArray.map((item: ICardsArray) => {
                    let isApplyFilter = item?.isFilterApply ? true : false
                    return <div className={`card  ${isApplyFilter ? "hoverCard" : ""}  ${item.colorName} ${activeCard.filter((i) => i.value == item.cardValue && i.columnName == item.columnName).length > 0 ? "active" : ""}`}
                        onClick={() => isApplyFilter && handleCardClickInternal(item.cardValue, item.columnName, item.columnName)}
                    >
                        {activeCard.filter((i) => i.value == item.cardValue && i.columnName == item.columnName).length > 0 && (
                            <span className="justifyright" style={{ position: "absolute" }}>
                                <TooltipHost content={"Filter Apply"}>
                                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                </TooltipHost>
                            </span>
                        )}
                        <h2>  {props.data[item.columnName]}</h2>
                        <p>{item.cardName}</p>
                    </div>
                })}
            </div>
        </div>
    </div>

}