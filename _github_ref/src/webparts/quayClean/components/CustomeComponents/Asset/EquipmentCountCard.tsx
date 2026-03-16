import * as React from "react";
import { formatPrice, formatPriceDecimal } from "../../../../../Common/Util";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";
import { useAtomValue } from "jotai";
require('../../../assets/css/collapsibleCardSection.css');
let nonoverdue = require('../../../assets/images/link/nonoverdue.svg');
let overdue = require('../../../assets/images/link/overdue.svg');
let value = require('../../../assets/images/link/value.svg');
let repair = require('../../../assets/images/link/repair.svg');
let total = require('../../../assets/images/link/total.svg');

export interface IEquipmentCountCard {
    data: any;
    handleCardClick: (title: string | null) => void;
}

export const EqupmentCountCard = (props: IEquipmentCountCard) => {

    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [activeCard, setActiveCard] = React.useState<string | null>(null);
    const { data, handleCardClick } = props;
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const handleCardClickInternal = (title: string) => {
        if (activeCard === title) {
            setActiveCard(null);
            handleCardClick(null); // Remove parameter (pass null)
        } else {
            setActiveCard(title);
            handleCardClick(title); // Pass the h3 tag content
        }
    };

    const toggleSection = () => {
        setIsCollapsed(!isCollapsed);
    };

    const getCardClassName = (title: string) => {
        return `card ${activeCard === title ? 'active-card' : ''}`;
    };

    return <>
        <div className={isSiteLevelComponent ? "collapsible-section card-margin" : "collapsible-section"}>
            <button className="toggle-icon" onClick={toggleSection}>
                {isCollapsed ? '➕' : '➖'} {/* Change icon based on state */}
            </button>
            <div className={`pageTopCount ${isCollapsed ? 'hidden' : ''}`}>
                <div
                    className={getCardClassName('Total Assets')}
                    onClick={() => handleCardClickInternal('Total Assets')}
                >
                    <h3>Total Assets</h3>
                    <div className="card-content">
                        <img src={total} alt="Assets Icon" />
                        <p className="card-number">{data?.totalAssets}</p>
                    </div>
                </div>
                <div
                    className={getCardClassName('Total Assets Value')}
                    onClick={() => handleCardClickInternal('Total Assets Value')}
                >
                    <h3>Book Value</h3>
                    <div className="card-content">
                        <img src={value} alt="Site Value Icon" />
                        <p className="card-number">{formatPriceDecimal(data?.totalSiteValue || 0)}</p>
                    </div>
                </div>
                <div
                    className={getCardClassName('Services Due in 1 Month')}
                    onClick={() => handleCardClickInternal('Services Due in 1 Month')}
                >
                    <h3>Services Due in 1 Month</h3>
                    <div className="card-content">
                        <img src={nonoverdue} alt="Services Due Icon" />
                        <p className="card-number">{data?.numberOfServicesDueNextMonth}</p>
                    </div>
                </div>
                <div
                    className={getCardClassName('Overdue Services')}
                    onClick={() => handleCardClickInternal('Overdue Services')}
                >
                    <h3>Overdue Services</h3>
                    <div className="card-content">
                        <img src={overdue} alt="Overdue Services Icon" />
                        <p className="card-number">{data?.numberOfOverdueServices}</p>
                    </div>
                </div>
                <div
                    className={getCardClassName('Repairs/Broken Assets')}
                    onClick={() => handleCardClickInternal('Repairs/Broken Assets')}
                >
                    <h3>Repairs/Broken Assets</h3>
                    <div className="card-content">
                        <img src={repair} alt="Repairs Icon" />
                        <p className="card-number">{data?.numberOfRepairsBroken}</p>
                    </div>
                </div>
            </div>
        </div>
    </>
};