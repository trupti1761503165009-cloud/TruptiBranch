import { Label, Link, PrimaryButton, TooltipHost } from '@fluentui/react';
import * as React from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface ISignatureProps {
    label: string,
    email: string,
    name: any,
    isDisplayNameEmail: boolean,
    getDataUrl(dataUrl: any): void;
    defaultSignature?: string;
}

export const SignatureComponent: React.FC<ISignatureProps> = (props) => {

    const sigCanvas = React.useRef<any>(null);
    const [isSave, setisSave] = React.useState<boolean>(true);
    const [isDirty, setIsDirty] = React.useState(false);
    const [isSignatureSaved, setIsSignatureSaved] = React.useState(false);
    const clear = React.useCallback(() => {
        sigCanvas.current?.clear();
        setisSave(true);
        setIsDirty(false);
    }, [sigCanvas]);

    const saveSignature = React.useCallback(() => {
        if (sigCanvas.current) {
            const dataUrl = sigCanvas.current.toDataURL('image/png');
            // const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png');
            props.getDataUrl(dataUrl);
            setIsDirty(false);
            setIsSignatureSaved(true);
            setisSave(false);
        }
    }, [sigCanvas]);

    React.useEffect(() => {
        if (props.defaultSignature && sigCanvas.current) {
            sigCanvas.current.clear();
            sigCanvas.current.fromDataURL(props.defaultSignature);
        }
    }, [props.defaultSignature]);

    return (
        <>
            <div className='ms-Grid-row signature-container'>
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1, display: "flex" }}>
                        <Label className="signature-title">{props.label}</Label>
                    </div>
                    <div style={{ display: "flex", marginRight: '0px', marginBottom: '3px' }}>

                        <Link
                            className={`actionBtn iconSize btnGreen dticon ${!isDirty ? 'signaturebtn-disabled' : ''} ${isSignatureSaved ? 'signaturebtn-Filled' : ''}`}
                            onClick={() => { saveSignature() }} >
                            <TooltipHost content={"Save Signature"} >
                                <FontAwesomeIcon icon={"save"} />
                            </TooltipHost>
                        </Link>

                        <Link className="actionBtn iconSize btnDanger dticon"
                            onClick={() => { clear(),setIsSignatureSaved(false) }} >
                            <TooltipHost content={"Clear Signature"}>
                                <FontAwesomeIcon icon={"undo"} />
                            </TooltipHost>
                        </Link>
                    </div>
                </div>

                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                    <SignatureCanvas
                        ref={sigCanvas}
                        penColor="black"
                        onEnd={() => setIsDirty(true)}
                        canvasProps={{ className: 'signature-canvas' }}
                    />
                </div>
                {props?.isDisplayNameEmail === true &&
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12">
                        <Label className='signature-name'>{props.name}</Label>
                        <Label className='signature-email'>Email: {props.email}</Label>
                    </div>}
            </div>

        </>
    )
}
