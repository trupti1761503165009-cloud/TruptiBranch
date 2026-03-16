import * as React from "react";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";
import { useAtomValue } from "jotai";
require('../../../assets/css/collapsibleCardSection.css');
let nonoverdue = require('../../../assets/images/link/nonoverdue.svg');
let expire = require('../../../assets/images/link/expire.svg');
let value = require('../../../assets/images/link/value.svg');
let broken = require('../../../assets/images/link/broken.svg');
let hazardous = require('../../../assets/images/link/hazardous.svg');
let nonhazardous = require('../../../assets/images/link/safe.svg');
let total = require('../../../assets/images/link/total.svg');

export interface IChemicalCountCard {
    data: any;
    handleCardClick: (title: string | null) => void;
}

export const ChemicalCountCard = (props: IChemicalCountCard) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
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
        <div className={isSiteLevelComponent ? "collapsible-section card-margin" : "collapsible-section"}>
            <button className="toggle-icon" onClick={toggleSection}>
                {isCollapsed ? '➕' : '➖'} {/* Change icon based on state */}
            </button>
            <div className={`pageTopCount ${isCollapsed ? 'hidden' : ''}`}>
                <div
                    className={getCardClassName('Total Chemical')}
                    onClick={() => handleCardClickInternal('Total Chemical')}
                >
                    <h3>Total Chemical</h3>
                    <div className="card-content">
                        <img src={total} alt="Assets Icon" />
                        <p className="card-number">{data?.totalChemicals}</p>
                    </div>
                </div>
                <div
                    className={getCardClassName('Expiry in 1 Month')}
                    onClick={() => handleCardClickInternal('Expiry in 1 Month')}
                >
                    <h3>Expiry in 1 Month</h3>
                    <div className="card-content">
                        <img src={nonoverdue} alt="Expiry in 1 Month" />
                        <p className="card-number">{data?.numberOfExpiringNextMonth}</p>
                    </div>
                </div>

                <div
                    className={getCardClassName('Expired Chemicals')}
                    onClick={() => handleCardClickInternal('Expired Chemicals')}
                >
                    <h3>Expired Chemicals</h3>
                    <div className="card-content">
                        <img src={expire} alt="Expired Chemicals Icon" />
                        <p className="card-number">{data?.numberOfExpiredChemicals}</p>
                    </div>
                </div>

                <div
                    className={getCardClassName('Hazardous')}
                    onClick={() => handleCardClickInternal('Hazardous')}
                >
                    <h3>Hazardous</h3>
                    <div className="card-content">
                        <img src={hazardous} alt="Repairs Icon" />
                        <p className="card-number">{data?.numberOfHazardous}</p>
                    </div>
                </div>

                <div
                    className={getCardClassName('Non Hazardous')}
                    onClick={() => handleCardClickInternal('Non Hazardous')}
                >
                    <h3>Non Hazardous</h3>
                    <div className="card-content">
                        <img src={nonhazardous} alt="Repairs Icon" />
                        <p className="card-number">{data?.numberOfNonHazardous}</p>
                    </div>
                </div>

            </div>
        </div>
    </>
};