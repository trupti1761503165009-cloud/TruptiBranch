import { TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
require('../../../../../assets/css/collapsibleCardSection.css');
import { faFilter } from "@fortawesome/free-solid-svg-icons";

export interface ICountCard {
    data: any;
    handleCardClick: (titles: string[] | null) => void;
    context: any;
}

export const MultipleHazardCountCards = (props: ICountCard) => {

    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [hazardData, setHazardData] = React.useState([]);
    const [selectedCards, setSelectedCards] = React.useState<string[]>([]);
    const { data, handleCardClick } = props;

    const handleCardClickInternal = (title: string) => {
        let updatedSelected;

        if (selectedCards.includes(title)) {
            // Remove from selection
            updatedSelected = selectedCards.filter(t => t !== title);
        } else {
            // Add to selection
            updatedSelected = [...selectedCards, title];
        }

        setSelectedCards(updatedSelected);
        handleCardClick(updatedSelected.length ? updatedSelected : null);
    };

    const toggleSection = () => {
        setIsCollapsed(!isCollapsed);
    };

    const getCardClassName = (title: string) => {
        return `${selectedCards.includes(title) ? 'active-card' : ''}`;
    };

    React.useEffect(() => {
        setHazardData(props.data);
    }, [props.data]);

    return (
        <div className="hazardCountCard">
            <div className={`collapsible-section ${isCollapsed ? "pb-20" : ""}`}>
                <button className="toggle-icon" onClick={toggleSection}>
                    {isCollapsed ? '➕' : '➖'}
                </button>

                <div className={`pageTopCount ${isCollapsed ? 'hidden' : ''}`}>
                    {hazardData.map((hazard: any, i: any) => (
                        <div
                            key={i}
                            className={`card ${getCardClassName(hazard.hazardType)}`}
                            style={{ background: hazard.bgcolor }}
                            onClick={() => handleCardClickInternal(hazard.hazardType)}
                        >
                            <div className="pattern" style={{ background: hazard.patterncolor }}></div>

                            {selectedCards.includes(hazard.hazardType) && (
                                <div className="filter-icon-wrapper">
                                    <TooltipHost content="Filter Applied">
                                        <FontAwesomeIcon icon={faFilter} className="filter-icon" />
                                    </TooltipHost>
                                </div>
                            )}

                            <div className="card-content">
                                <img src={hazard.iconUrl} alt={hazard.hazardType} />
                                <div className="card-block-text">
                                    <h3 style={{ color: hazard.color }}>{hazard.hazardType}</h3>
                                    <p className="card-number" style={{ color: hazard.color }}>{hazard.listCount}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
