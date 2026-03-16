import { Link, TooltipHost } from "@fluentui/react"
import { faFilter } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { IActiveCard } from "../../../CommonComponents/Chart/HelpDeskCard"
import strings from "QuayCleanWebPartStrings"

export interface IIMSReportCardsProps {
    data: any[];
    handleCardClick?(card: IActiveCard[], defaultFilter?: string[]): void;
    cardsArray: ICardsArray[];
    isIMSReport?: boolean;
    filterColumnValue?: string[];
}


export interface ICardsArray {
    cardName: string;
    cardValue: string;
    columnName: string;
    colorName: string;
    isFilterApply?: boolean;

}
type CardCount = { [key: string]: { [cardValue: string]: number } };
export const IMSReportCards = (props: IIMSReportCardsProps) => {
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


    const getCardCount = (items: any[]): any => {
        const cardCount: any = {};

        if (items && items.length > 0) {

            // Initialize cardCount structure
            props.cardsArray.forEach(option => {
                if (!cardCount[option.columnName]) {
                    cardCount[option.columnName] = {};
                }
                if (option.cardValue === "") {
                    cardCount[option.columnName]["uniqueValue"] = new Set();
                } else {

                    cardCount[option.columnName][option.cardValue] = 0;
                }
            });


            for (let item of items) {
                cardCount["All"] = cardCount["All"] || {};
                cardCount["All"]["All"] = (cardCount["All"]["All"] || 0) + 1;

                props.cardsArray.forEach(option => {
                    const itemValue = item[option.columnName];

                    if (option.cardValue === "") {
                        if (itemValue) {
                            cardCount[option.columnName]["uniqueValue"].add(itemValue);
                        }
                    } else if (String(itemValue) === String(option.cardValue)) {
                        cardCount[option.columnName][option.cardValue] =
                            (cardCount[option.columnName][option.cardValue] || 0) + 1;
                    }
                });
            }

            Object.keys(cardCount).forEach(column => {
                if (cardCount[column]["uniqueValue"] instanceof Set) {
                    const size = cardCount[column]["uniqueValue"].size;
                    if (size > 0) {
                        cardCount[column]["uniqueValue"] = size;
                    } else {
                        delete cardCount[column];
                    }
                }
            });
        }

        return cardCount;
    };

    React.useEffect(() => {


        let data = props.data.length > 0 ? ((!!props.filterColumnValue && props.filterColumnValue.length > 0) ? props.data.filter((i) => props.filterColumnValue?.includes(i.EntityType)) : props.data) : []
        // let cardCount = props.isIMSReport ? getCardCountIMS(data) : getCardCount(data);
        let cardCount = getCardCount(data);
        setCount(cardCount);
        setKeyUpdate(Math.random());
    }, [props.data])


    return <div className="helpDeskCard ">

        <div className="dashboard-container">
            <div className="dashboard" key={keyUpdate}>
                {props.cardsArray.length > 0 && props.cardsArray.map((item: ICardsArray) => {
                    let isApplyFilter = (item.isFilterApply == undefined && (!!item.cardValue ? (!!count && !!count[item.columnName]) && count[item.columnName][item.cardValue] : (!!count && !!count[item.columnName] && !!count[item.columnName]["uniqueValue"] ? count[item.columnName]["uniqueValue"] : 0) > 0))
                    return <div className={`card  ${isApplyFilter ? "hoverCard" : ""}  ${item.colorName} ${activeCard.filter((i) => i.value == item.cardValue && i.columnName == item.columnName).length > 0 ? "active" : ""}`}
                        onClick={() => isApplyFilter && handleCardClickInternal(item.cardValue, item.columnName, item.columnName)}>

                        {activeCard.filter((i) => i.value == item.cardValue && i.columnName == item.columnName).length > 0 && (
                            <span className="justifyright" style={{ position: "absolute" }}>
                                <TooltipHost content={"Filter Apply"}>
                                    <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                </TooltipHost>
                            </span>
                        )}

                        {/* <h2>  {!!item.cardValue ? (!!count && !!count[item.columnName]) && count[item.columnName][item.cardValue] : (!!count && !!count[item.columnName] && !!count[item.columnName]["uniqueValue"] ? count[item.columnName]["uniqueValue"] : 0)}</h2> */}
                        <h2>  {!!item.cardValue ? ((!!count && !!count[item.columnName]) ? count[item.columnName][item.cardValue] : 0) : (!!count && !!count[item.columnName] && !!count[item.columnName]["uniqueValue"] ? count[item.columnName]["uniqueValue"] : 0)}</h2>
                        <p>{item.cardName}</p>
                    </div>
                })}
            </div>
        </div>
    </div>

}