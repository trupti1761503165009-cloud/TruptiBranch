import * as React from 'react';
import { Layer, Overlay, FocusTrapZone, TextField, DialogFooter, PrimaryButton, DefaultButton, mergeStyleSets, Popup } from 'office-ui-fabric-react';
import { ICommonPopupProps } from '../../../../Interfaces/ICommonPopupProps';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Toggle } from '@fluentui/react';

const CommonPopup: React.FC<ICommonPopupProps> = (props) => {
    const {
        isPrice,
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
        onclickSendEmail,
        onToggleChange,
        data
    } = props;
    const [width, setWidth] = React.useState<string>("500px");
    const [showToggle, setShowToggle] = React.useState<boolean>(false);
    const [toggleValue, setToggleValue] = React.useState<boolean>(false);
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("500px");
        }
    }, [window.innerWidth]);


    const handleToggleChange = (_: any, checked?: boolean) => {
        setToggleValue(checked || false);
        onToggleChange?.(checked || false);
    };



    React.useEffect(() => {
        if (isPrice) {
            setShowToggle(true);
        } else {
            setShowToggle(false);
        }
    }, [isPrice]);

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
            <PrimaryButton className="btn btn-primary send-email-btn" onClick={onclickSendEmail}>
                <FontAwesomeIcon icon="paper-plane" className="clsbtnat" /><div>Email</div>
            </PrimaryButton>
            {isPopupVisible && (
                <Layer>
                    <Popup className={popupStyles.root} role="dialog" aria-modal="true" onDismiss={hidePopup}>
                        <Overlay onClick={hidePopup} />
                        <FocusTrapZone>
                            <Popup role="document" className={popupStyles.content}>
                                <>{(!!props.data && props.data.length == 0) ?
                                    <><h2 className="mt-10">Warning</h2>
                                        <div className="mt-10">Please select at least one user.</div>
                                    </>
                                    :
                                    <>
                                        <h2 className="mt-10">Send Email </h2>
                                        <TextField className="formControl mt-20" name='title' label="Receiver Name" required placeholder="Enter Receiver name" value={title} onChange={onChangeTitle} />
                                        {displayerrortitle && <div className="requiredlink">Enter receiver name</div>}
                                        <TextField className="formControl" name='sendToEmail' label="Receiver Email" required placeholder="Enter Receiver email" value={sendToEmail} onChange={onChangeSendToEmail} />
                                        {displayerroremail && <div className="requiredlink">Enter receiver email</div>}
                                        {displayerror && <div className="requiredlink">Enter valid email</div>}
                                        {showToggle && isPrice && (
                                            <Toggle
                                                className="formControl formtoggle"
                                                label="Show Book value?"
                                                checked={toggleValue}
                                                onChange={handleToggleChange}
                                            />
                                        )
                                        }
                                    </>}
                                </>
                                <DialogFooter>
                                    {(!props.data) ?
                                        <PrimaryButton text="Send" onClick={onClickSendEmail} className='mrt15 css-b62m3t-container btn btn-primary' /> :
                                        (!!props.data && props.data.length > 0) && <PrimaryButton text="Send" onClick={onClickSendEmail} className='mrt15 css-b62m3t-container btn btn-primary' />}
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

export default CommonPopup;
