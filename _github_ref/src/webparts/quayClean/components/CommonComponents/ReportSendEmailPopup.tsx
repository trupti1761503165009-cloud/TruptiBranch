import * as React from 'react';
import { Layer, Overlay, FocusTrapZone, TextField, DialogFooter, PrimaryButton, DefaultButton, mergeStyleSets, Popup } from '@fluentui/react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export interface ICommonPopupProps {
    isPopupVisible: boolean;
    hidePopup: () => void;
    title: string;
    sendToEmail: string;
    onChangeTitle: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void;
    onChangeSendToEmail: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void;
    displayerrortitle: boolean;
    displayerroremail: boolean;
    displayerror: boolean;
    onClickSendEmail: (type: "PDF" | "Excel") => void;
    onClickCancel: () => void;
    onclickSendEmailPopup: () => void;
    isPrice?: boolean;
    onToggleChange?: (value: boolean) => void;
    isExcel?: boolean;
}

const ReportSendEmailPopup: React.FC<ICommonPopupProps> = (props) => {
    const {
        isPopupVisible,
        hidePopup,
        title,
        sendToEmail,
        onChangeTitle,
        onChangeSendToEmail,
        displayerrortitle,
        displayerroremail,
        displayerror,
        onClickSendEmail,
        onClickCancel,
        onclickSendEmailPopup,
        isExcel
    } = props;
    const [width, setWidth] = React.useState<string>("500px");
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("500px");
        }
    }, [window.innerWidth]);

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
        }
    });

    return (
        <>
            <PrimaryButton className="btn btn-primary" onClick={onclickSendEmailPopup}>
                <FontAwesomeIcon icon="paper-plane" className="clsbtnat" /><div>Email</div>
            </PrimaryButton>
            {isPopupVisible && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup}>
                        <Overlay onClick={hidePopup} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles.content}>
                                <h2 className="mt-10">Send Email </h2>
                                <TextField className="formControl mt-20" name='title' label="Receiver Name" required placeholder="Enter Receiver name" value={title} onChange={onChangeTitle} />
                                {displayerrortitle && <div className="requiredlink">Enter receiver name</div>}
                                <TextField className="formControl" name='sendToEmail' label="Receiver Email" required placeholder="Enter Receiver email" value={sendToEmail} onChange={onChangeSendToEmail} />
                                {displayerroremail && <div className="requiredlink">Enter receiver email</div>}
                                {displayerror && <div className="requiredlink">Enter valid email</div>}

                                <DialogFooter>
                                    <PrimaryButton text="Send" onClick={() => onClickSendEmail(isExcel ? 'Excel' : 'PDF')} className='mrt15 css-b62m3t-container btn btn-primary' />
                                    <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickCancel} />
                                </DialogFooter>
                            </Popup>
                        </FocusTrapZone>
                    </Popup>
                </Layer>
            )}
        </>
    );
};

export default ReportSendEmailPopup;
