import * as React from "react";
require('../../../assets/css/collapsibleCardSection.css');
let nonoverdue = require('../../../assets/images/link/nonoverdue.svg');
let overdue = require('../../../assets/images/link/overdue.svg');
let inactive = require('../../../assets/images/link/inactive.svg');
let active = require('../../../assets/images/link/active.svg');
let total = require('../../../assets/images/link/total.svg');

export interface IEquipmentCountCard {
    data: any;
    handleCardClick: (title: string | null) => void;
}

export const EmployeeCountCard = (props: IEquipmentCountCard) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const [activeCard, setActiveCard] = React.useState<string | null>('Active');
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

    React.useEffect(() => {
        // handleCardClickInternal('Active');
        // getCardClassName('Active');
    });

    React.useEffect(() => {
        handleCardClick("Active"); // Notify parent that "Active" is selected
    }, []);

    return <>
        <div className="collapsible-section">
            <button className="toggle-icon" onClick={toggleSection}>
                {isCollapsed ? '➕' : '➖'} {/* Change icon based on state */}
            </button>
            <div className={`pageTopCount ml-15px ${isCollapsed ? 'hidden' : ''}`}>
                <div
                    className={getCardClassName('Total Employee')}
                    onClick={() => handleCardClickInternal('Total Employee')}
                >
                    <h3>Total Employee</h3>
                    <div className="card-content">
                        <img src={total} alt="Total Employee" />
                        <p className="card-number">{data?.totalEmployee}</p>
                    </div>
                </div>

                <div
                    className={getCardClassName('Active')}
                    onClick={() => handleCardClickInternal('Active')}
                >
                    <h3>Active</h3>
                    <div className="card-content">
                        <img src={active} alt="Active" />
                        <p className="card-number">{data?.active}</p>
                    </div>
                </div>

                <div
                    className={getCardClassName('Inactive')}
                    onClick={() => handleCardClickInternal('Inactive')}
                >
                    <h3>Inactive</h3>
                    <div className="card-content">
                        <img src={inactive} alt="Inactive" />
                        <p className="card-number">{data?.inactive}</p>
                    </div>
                </div>

            </div>
        </div>
    </>
};