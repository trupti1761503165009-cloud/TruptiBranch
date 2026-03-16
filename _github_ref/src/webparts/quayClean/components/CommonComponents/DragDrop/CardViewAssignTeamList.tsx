import { Checkbox, Link, TooltipHost } from "@fluentui/react";
import React from "react";
import NoRecordFound from "../NoRecordFound";
import moment from "moment";
import { DateFormat } from "../../../../../Common/Constants/CommonConstants";
import { Loader } from "../Loader";
import { useId } from "@fluentui/react-hooks";
const blankProfile = require('../../../assets/images/User-Paceholder.png');

interface CardViewListProps {
    data: any[];
    SkillSetData: any[];
    selectedRecords: any[];
    onCheckboxChange: (item: any) => void;
    onDoubleClick?: (item: any) => void;
    isSiteName?: boolean;
}
export const CardViewAssignTeamList: React.FC<CardViewListProps> = ({
    data,
    SkillSetData,
    selectedRecords,
    onCheckboxChange,
    onDoubleClick,
    isSiteName
}) => {
    const [items, setItems] = React.useState<any[]>([]);
    const [itemsSS, setItemsSS] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const tooltipId = useId('tooltip');
    React.useEffect(() => {
        if (Array.isArray(data)) {
            setItems(data);
            setIsLoading(false);
        }
    }, [data]);

    React.useEffect(() => {
        if (Array.isArray(SkillSetData)) {
            setItemsSS(SkillSetData);
        }
    }, [SkillSetData]);
    console.log("selectedRecords", selectedRecords);

    return (
        <>
            {isLoading && <Loader />}
            {items?.map((item) => (
                <div
                    className="table-card-item  drag-drop-icon"
                    key={item.id}
                    onClick={() => onCheckboxChange(item)}

                    style={{ cursor: isSiteName ? 'pointer' : '', }}
                    onDoubleClick={() => onDoubleClick && onDoubleClick(item)}
                >
                    <Checkbox
                        label=""
                        checked={selectedRecords.some(r => r.id === item.id)}
                        onChange={() => onCheckboxChange(item)}
                        className="checkbox-Position"
                    />

                    <div className="profile-section">
                        <div className="at-profile">
                            <img src={item.attachmentURl || blankProfile} alt={item.aTUserName} />
                        </div>
                        <div className="member-details">
                            <div className="site-icon-center">
                                <img src={require('../../../assets/images/site_Icon.svg')} height="16px" width="16px" />
                                <div className="member-other-text">{item.SiteName}</div>
                            </div>
                            <Link className="member-name-text" style={{ cursor: "pointer" }}>
                                <TooltipHost content={item.aTUserName} id={tooltipId}>
                                    <div onClick={() => onDoubleClick && onDoubleClick(item)}>
                                        {item.aTUserName}
                                    </div>
                                </TooltipHost>
                            </Link>
                            <div className="member-other-text">{item.aTRole}</div>
                            {item.DateOfBirth && (
                                <div className="member-other-text">
                                    {moment(item.DateOfBirth).format(DateFormat)}
                                </div>
                            )}
                            {item.OperatorType && (
                                <div className="member-other-text">{item.OperatorType}</div>
                            )}
                        </div>
                    </div>
                    <ul className="skill-set-ul">
                        {/* {itemsSS.filter((s) => s.AssociatedTeamId === item.id).length > 0 &&
                            itemsSS
                                .filter((s) => s.AssociatedTeamId === item.id)
                                .map((skillSetItem) => (
                                    <li key={skillSetItem.id} className="ss-mb5 skillsetBadge">
                                        <div style={{ fontWeight: "bold" }}>{skillSetItem.Title}</div>
                                        <div>{skillSetItem.CardNumber}</div>
                                        <div>{skillSetItem.ExpiryDate}</div>
                                    </li>
                                ))
                        } */}
                        {item?.Skills?.length > 0 &&
                            item?.Skills?.map((skillSetItem: any) => (
                                <li key={skillSetItem.id} className="ss-mb5 skillsetBadge">
                                    <div style={{ fontWeight: "bold" }}>{skillSetItem.Title}</div>
                                    <div>{skillSetItem.CardNumber}</div>
                                    <div>{skillSetItem.ExpiryDate}</div>
                                </li>
                            ))
                        }
                    </ul>

                </div>

            ))}

        </>
    );
};
