import * as React from "react";
import { formatPrice } from "../../../../../../Common/Util";
// require('../../../assets/css/collapsibleCardSection.css');
require('../../../../assets/css/collapsibleCardSection.css');
let nonoverdue = require('../../../../assets/images/link/nonoverdue.svg');
let overdue = require('../../../../assets/images/link/overdue.svg');
let inactive = require('../../../../assets/images/link/inactive.svg');
let expire = require('../../../../assets/images/link/expire.svg');
let total = require('../../../../assets/images/link/total.svg');

export interface IEquipmentCountCard {
    data: any;
    handleCardClick: (title: string | null) => void;
}

export const InductionCountCard = (props: IEquipmentCountCard) => {

    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [activeCard, setActiveCard] = React.useState<string | null>(null);
    const { data, handleCardClick } = props;

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
        <div className="collapsible-section">
            <button className="toggle-icon" onClick={toggleSection}>
                {isCollapsed ? '➕' : '➖'} {/* Change icon based on state */}
            </button>
            <div className={`pageTopCount ${isCollapsed ? 'hidden' : ''}`}>
                <div
                    className={getCardClassName('Total Induction')}
                    onClick={() => handleCardClickInternal('Total Induction')}
                >
                    <h3>Total Induction</h3>
                    <div className="card-content">
                        <img src={total} alt="Total Induction" />
                        <p className="card-number">{data?.totalInduction}</p>
                    </div>
                </div>
                <div
                    className={getCardClassName('Completed Induction')}
                    onClick={() => handleCardClickInternal('Completed Induction')}
                >
                    <h3>Completed Induction</h3>
                    <div className="card-content">
                        <img src={nonoverdue} alt="Completed Induction" />
                        <p className="card-number">{data?.completedInduction}</p>
                    </div>
                </div>
                <div
                    className={getCardClassName('Pending Induction')}
                    onClick={() => handleCardClickInternal('Pending Induction')}
                >
                    <h3>Pending Induction</h3>
                    <div className="card-content">
                        <img src={overdue} alt="Pending Induction" />
                        <p className="card-number">{data?.pendingInduction}</p>
                    </div>
                </div>
                <div
                    className={getCardClassName('Inactive Induction')}
                    onClick={() => handleCardClickInternal('Inactive Induction')}
                >
                    <h3>Inactive Induction</h3>
                    <div className="card-content">
                        <img src={inactive} alt="Inactive Induction" />
                        <p className="card-number">{data?.inactiveInduction}</p>
                    </div>
                </div>
                <div
                    className={getCardClassName('Expired Induction')}
                    onClick={() => handleCardClickInternal('Expired Induction')}
                >
                    <h3>Expired Induction</h3>
                    <div className="card-content">
                        <img src={expire} alt="Expired Induction" />
                        <p className="card-number">{data?.expiredInduction}</p>
                    </div>
                </div>
                {/* <div
                    className={getCardClassName('Not Started Induction')}
                    onClick={() => handleCardClickInternal('Not Started Induction')}
                >
                    <h3>Not Started Induction</h3>
                    <div className="card-content">
                        <img src={overdue} alt="Repairs Icon" />
                        <p className="card-number">{data?.notStartedInduction}</p>
                    </div>
                </div> */}
            </div>
        </div>
    </>
};