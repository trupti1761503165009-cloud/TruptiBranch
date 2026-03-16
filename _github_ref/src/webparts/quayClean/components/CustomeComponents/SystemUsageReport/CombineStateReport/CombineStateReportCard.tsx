import React from "react";
import { IActiveCard } from "../../../CommonComponents/Chart/HelpDeskCard";
import { ICardsArray } from "../../IMS/WorkplaceInspection/IMSReportCards";

export interface ICombineStateReportProps {
    data: any;
    handleCardClick?(card: IActiveCard[], defaultFilter?: string[]): void;
    cardsArray: ICardsArray[];
    filterColumnValue?: string[];
}

export const CombineStateReportCard = (props: ICombineStateReportProps) => {

    const [activeCard, setActiveCard] = React.useState<IActiveCard[]>([]);
    const [count, setCount] = React.useState<any>();
    const [keyUpdate, setKeyUpdate] = React.useState<number>(Math.random());
    return <div className="combineStateReport  sysUsage-card">

        <div className="dashboard-container">
            <div className="dashboard" key={keyUpdate}>
                {props.cardsArray.length > 0 && props.cardsArray.map((item: ICardsArray) => {
                    let isApplyFilter = (item.isFilterApply == undefined && (!!item.cardValue ? (!!count && !!count[item.columnName]) && count[item.columnName][item.cardValue] : (!!count && !!count[item.columnName] && !!count[item.columnName]["uniqueValue"] ? count[item.columnName]["uniqueValue"] : 0) > 0))
                    return <div className={`card  ${isApplyFilter ? "hoverCard" : ""}  ${item.colorName} ${activeCard.filter((i) => i.value == item.cardValue && i.columnName == item.columnName).length > 0 ? "active" : ""}`}
                    >
                        <h2>  {props.data[item.columnName]}</h2>
                        <p>{item.cardName}</p>
                    </div>
                })}
            </div>
        </div>
    </div>

}