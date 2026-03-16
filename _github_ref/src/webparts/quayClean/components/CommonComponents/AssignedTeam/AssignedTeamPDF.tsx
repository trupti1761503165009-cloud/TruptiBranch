import moment from 'moment';
import * as React from 'react';
import { DateFormat } from '../../../../../Common/Constants/CommonConstants';
// import AssetPrintPDF from './AssetPrintPDF';

interface IAssignedTeamPDFProps {
    // siteName: string;
    // qCState: string;
    assignedTeam: any[];
    imgLogo: string;
    allSkillSetData: any[];
    fileData: any[];

}

export const AssignedTeamPDF: React.FC<IAssignedTeamPDFProps> = (props) => {
    const Card = (item: any) => {
        return <div className="assign-Team-card-pdf">
            <div className="table-card-item-pdf" key={item.id}>
                <div className="member-name-text mt-2">{item.SiteName}{item?.StateName && (
                    <span className="assign-Team-Pdf-State"> ({item.StateName})</span>
                )}</div>
                <div className="profile-section">
                    <div className="at-profile">
                        <img src={item.attachmentURl || item} alt={item.aTUserName} />
                    </div>
                    <div className="member-details">
                        <div className="member-name-text">{item.aTUserName}</div>
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
                    {/* {props.allSkillSetData
                        .filter((s) => s?.AssociatedTeamId === item?.id)
                        .map((skillSetItem) => (
                            <li key={skillSetItem.id} className="ss-mb5 skillsetBadge">
                                <div style={{ fontWeight: "bold" }}>{skillSetItem.Title}</div>
                                <div>{skillSetItem.CardNumber}</div>
                                <div>{skillSetItem.ExpiryDate}</div>
                            </li>
                        ))} */}
                    {item?.Skills?.map((skillSetItem: any) => (
                        <li key={skillSetItem.id} className="ss-mb5 skillsetBadge">
                            <div style={{ fontWeight: "bold" }}>{skillSetItem.Title}</div>
                            <div>{skillSetItem.CardNumber}</div>
                            <div>{skillSetItem.ExpiryDate}</div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    };

    return (
        // <div id="AssignedTeamPDF" className="dnone">
        <div id="AssignedTeamPDF" className="dnone">
            <div className='assigned-team-container'>
                <div id="pdf-content" className="apdf-container">
                    <>
                        <div className="assigned-team-header">
                            <div className="header-left">
                                <img src={props.imgLogo || ""} alt="Logo" />
                                <h2>Assigned Team</h2>
                            </div>
                            <div className="header-right">Total: {props.assignedTeam.length || 0}</div>
                        </div>

                    </>
                    <div className="sub-container">
                        {(props.assignedTeam.length > 0) && props.assignedTeam.map((i: any, index: any) => {
                            // return <Card key={index} item={i} />
                            return Card(i)
                        }
                        )
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};


