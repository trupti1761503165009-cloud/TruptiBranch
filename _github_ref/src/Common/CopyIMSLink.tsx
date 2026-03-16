import React, { useState } from 'react';
import { Layer, Popup, Overlay, FocusTrapZone, MessageBar, MessageBarType, DialogFooter, DefaultButton, mergeStyleSets, Link, TooltipHost, } from '@fluentui/react';
import { getExternalUrl, ListNames, QuaySafeSendEmailTypeEnum } from './Enum/ComponentNameEnum';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IDataProvider } from '../DataProvider/Interface/IDataProvider';

export const CopyIMSLink = (props: any) => {
    const { Data, isOpen, closePopup, Page, PageId, Context, provider, InductionMasterData, isResendEmail } = props;
    const [showSaveMessageBar, setShowSaveMessageBar] = useState(false);
    const [showSaveMessageBarKey, setShowSaveMessageBarKey] = useState(false);
    const [showResendMessage, setShowResendMessage] = useState(false);
    const [width, setWidth] = React.useState<string>("450px");
    const popupStyles = mergeStyleSets({
        root: {
            background: 'rgba(0, 0, 0, 0.2)',
            bottom: '0',
            left: '0',
            position: 'fixed',
            right: '0',
            top: '0',
        },
        content: {
            background: 'white',
            left: '50%',
            maxWidth: '500px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 80px)',

            '@media (max-width: 1200px)': { // Medium screens
                maxHeight: 'calc(100vh - 40px)',
            },

            '@media (max-width: 768px)': { // Small screens
                maxHeight: 'calc(100vh - 10px)',
            }
        }
    });

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("500px");
        }
    }, [window.innerWidth]);

    const handleCopyLink = (link: string) => {
        navigator.clipboard.writeText(link);
        setShowSaveMessageBar(true);
        setTimeout(() => setShowSaveMessageBar(false), 3000); // Hide the message bar after 3 seconds
    };

    const onclickResend = async () => {
        await props?.provider?.updateItemWithPnP({ IsResend: true }, ListNames.InductionDetail, props?.Data?.ID);
        setShowResendMessage(true);
        setTimeout(() => setShowResendMessage(false), 3000);
    };

    const onClickQuaySafeEmail = async (attendee: any) => {

        if (Page == "SkillMatrix") {
            if (!!Data.ID && Data.ID > 0) {
                await props.provider.updateItem({ IntialEmail: false }, ListNames.SkillMatrix, Data.ID)
                setShowResendMessage(true);
            }

        } else {
            if (!!attendee && !!Data && Data.ID > 0) {
                let EmailType: string = ""
                switch (Page) {
                    case "ToolboxIncident":
                        EmailType = QuaySafeSendEmailTypeEnum.IncidentReport
                        break;
                    case "ToolboxTalk":
                        EmailType = QuaySafeSendEmailTypeEnum.ToolboxTalk
                        break;
                    case "WorkplaceInspectionChecklistReport":
                        EmailType = QuaySafeSendEmailTypeEnum.WorkplaceInspectionChecklistReport
                        break;
                    case "CorrectiveActionReport":
                        EmailType = QuaySafeSendEmailTypeEnum.CorrectiveActionReport
                        break;
                    case "SiteSafetyAudit":
                        EmailType = QuaySafeSendEmailTypeEnum.WHSCommitteeInspection
                        break;

                    default:
                        break;
                }
                let obj = {
                    Title: !!attendee.Title ? attendee.Title : "",
                    SendToEmail: !!attendee.Email ? attendee.Email : "",
                    EmailType: EmailType,
                    ItemId: Data.ID,
                    EmployeeId: !!attendee.Id ? attendee.Id : 0,
                }
                await props?.provider?.createItem(obj, ListNames.SendEmailTempList);
                setShowResendMessage(true);
                setTimeout(() => setShowResendMessage(false), 3000);
            }
        }
    }

    const handleCopyKey = (key: string) => {
        navigator.clipboard.writeText(key)
            .then(() => console.log("InductionKey copied!"))
            .catch((err) => console.error("Failed to copy:", err));
        setShowSaveMessageBarKey(true);
        setTimeout(() => setShowSaveMessageBarKey(false), 3000); // Hide the message bar after 3 seconds
    };

    return (
        isOpen && (
            <Layer>
                <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={closePopup}>
                    <Overlay onClick={closePopup} />
                    <FocusTrapZone>
                        <Popup role="document" className={popupStyles.content}>
                            <div className="ss-per-pad">
                                <h2 className="mt-10">Attendees Link</h2>
                                <div className="mt-2">
                                    {showSaveMessageBar && (
                                        <MessageBar messageBarType={MessageBarType.success}>
                                            <div className="inputText">Link copied successfully!</div>
                                        </MessageBar>
                                    )}
                                </div>
                                <div className="mt-2">
                                    {showSaveMessageBarKey && (
                                        <MessageBar messageBarType={MessageBarType.success}>
                                            <div className="inputText">Induction key copied successfully!</div>
                                        </MessageBar>
                                    )}
                                </div>
                                <div className="mt-2">
                                    {showResendMessage && (
                                        <MessageBar messageBarType={MessageBarType.success}>
                                            <div className="inputText">Email resend successfully!</div>
                                        </MessageBar>
                                    )}
                                </div>
                                {!!Data && Data?.FullAttendeesArray?.length > 0 && (
                                    <table className="custom-table-ans">
                                        <thead>
                                            <tr>
                                                <th className="custom-header-ans-link"><b>Attendees Name</b></th>
                                                {props?.InductionMasterData?.length > 0 && <th className="custom-header-ans"><b>Code</b></th>}
                                                <th className="custom-header-ans mw-90-action"><b>Action</b></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Data.FullAttendeesArray.map((attendee: any) => {
                                                const externalURL = getExternalUrl(Context);
                                                // {
                                                //     props.Page === "Induction" ?  
                                                // }
                                                const link = `${externalURL}/Quaysafe/${Page}?UserId=${attendee.Id}&${PageId}=${Data.ID}`;


                                                const inductionEntry = props?.InductionMasterData?.find(
                                                    (induction: any) => (induction?.AttendeesEmailId === attendee.Id || (induction?.ContractorEmailId && induction?.ContractorEmailId === attendee.Id))
                                                );
                                                const link2 = `${externalURL}/Induction/Index?${PageId}=${inductionEntry?.ID}&UserId=${attendee?.Id}`;
                                                return (
                                                    <tr key={attendee.Id}>
                                                        <td className="custom-cell-ans">
                                                            <h4>{attendee.Title}</h4>
                                                        </td>
                                                        {props?.InductionMasterData?.length > 0 && (
                                                            <td
                                                                style={{ cursor: 'pointer' } as React.CSSProperties}  // Force cursor with TypeScript casting
                                                                className="custom-cell-ans"
                                                                onClick={() => handleCopyKey(inductionEntry?.InductionKey)}


                                                            >
                                                                <TooltipHost content={"Click to Copy"}>
                                                                    <span>{inductionEntry ? inductionEntry.InductionKey : ''}</span>
                                                                </TooltipHost>
                                                            </td>
                                                        )}

                                                        <td className="custom-cell-ans custom-cell-ans-mw-save dflex mw-90-action">
                                                            {props?.Page === "Induction" ?
                                                                <Link
                                                                    className="actionBtn btnEditName dticon"
                                                                    onClick={() => handleCopyLink(link2)}
                                                                >
                                                                    <TooltipHost content={"Copy Link"}>
                                                                        <FontAwesomeIcon icon="copy" />
                                                                    </TooltipHost>
                                                                </Link>
                                                                :
                                                                <><Link
                                                                    className="actionBtn btnEditName dticon"
                                                                    onClick={() => handleCopyLink(link)}
                                                                >
                                                                    <TooltipHost content={"Copy Link"}>
                                                                        <FontAwesomeIcon icon="copy" />
                                                                    </TooltipHost>
                                                                </Link>
                                                                    {(!!isResendEmail && isResendEmail) && <Link
                                                                        className="actionBtn btnView dticon ml5"
                                                                        onClick={() => onClickQuaySafeEmail(attendee)}
                                                                    >
                                                                        <TooltipHost content={"Resend Email"}>
                                                                            <FontAwesomeIcon icon="paper-plane" />
                                                                        </TooltipHost>
                                                                    </Link>}
                                                                </>
                                                            }
                                                            {props?.Page === "Induction" &&
                                                                <Link
                                                                    className="actionBtn btnView dticon ml5"
                                                                    onClick={() => onclickResend()}
                                                                >
                                                                    <TooltipHost content={"Resend Email"}>
                                                                        <FontAwesomeIcon icon="paper-plane" />
                                                                    </TooltipHost>
                                                                </Link>
                                                            }
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}

                            </div>
                            <DialogFooter>
                                <DefaultButton
                                    text="Close"
                                    className="secondMain btn btn-danger mr-16 ss-per-mr"
                                    onClick={closePopup}
                                />
                            </DialogFooter>
                        </Popup>
                    </FocusTrapZone>
                </Popup >
            </Layer >
        )
    );
};

