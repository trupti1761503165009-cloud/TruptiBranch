import { TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
require('../../../../assets/css/collapsibleCardSection.css');
import { faFilter } from "@fortawesome/free-solid-svg-icons";
export interface ICountCard {
    data: any;
    handleCardClick: (title: string | null) => void;
    context: any;
    selectedCard: any;
}

export const ClientResponseCountCards = (props: ICountCard) => {

    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [countData, setCountData] = React.useState([]);
    const [activeCard, setActiveCard] = React.useState<string | null>(null);
    const { data, handleCardClick } = props;

    const handleCardClickInternal = (title: string) => {
        if (activeCard === title) {
            // setActiveCard(null);
            handleCardClick(null);
        } else {
            // setActiveCard(title);
            handleCardClick(title);
        }
    };

    const toggleSection = () => {
        setIsCollapsed(!isCollapsed);
    };

    const getCardClassName = (title: string) => {
        return `${activeCard === title ? 'active-card' : ''}`;
    };

    React.useEffect(() => {
        setCountData(props.data)
    }, [props.data]);

    React.useEffect(() => {
        if (activeCard === props.selectedCard) {
            setActiveCard(null);
        } else {
            setActiveCard(props.selectedCard);
        }
    }, [props.selectedCard]);

    return (
        <div className="hazardCountCard" >
            <div className={`collapsible-section m-0  ${isCollapsed ? "pb-20" : ""}`}>
                <button className="toggle-icon" onClick={toggleSection}>
                    {isCollapsed ? '➕' : '➖'}
                </button>

                <div className={`pageTopCount ${isCollapsed ? 'hidden' : ''}`}>

                    {countData?.map((category: any, i: any) => (
                        <div
                            key={i}
                            className={`card ${getCardClassName(category.category)}`}
                            style={{ background: category.bgcolor }}
                            onClick={() => handleCardClickInternal(category.category)}
                        >
                            <div className="pattern" style={{ background: category.patterncolor }}></div>
                            {activeCard === category.category && (
                                <div className="filter-icon-wrapper">
                                    <TooltipHost content="Filter Applied">
                                        <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                    </TooltipHost>
                                </div>
                            )}
                            <div className="card-content">
                                <img
                                    src={category.iconUrl}
                                    alt={category.category}
                                />

                                <div className="card-block-text">
                                    <h3 style={{ color: category.color }}>{category.category}</h3>
                                    <p className="card-number" style={{ color: category.color }}>{category.listCount}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div >
    );

};