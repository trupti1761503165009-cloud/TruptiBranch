import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import QRCodeTemplate from "./QRCodeTemplate";
import html2canvas from "html2canvas";

interface IGenrateQRCodeProps {
    url?: string;
    getTheQRUrl(url: any): any;
}
export const GenrateQRCode = (props: IGenrateQRCodeProps) => {

    const getCanvas = () => {
        const qr = document.getElementById("fancy-qr-code");
        if (!qr) return;

        return html2canvas(qr, {
            onclone: snapshot => {
                const qrElement = snapshot.getElementById("fancy-qr-code");
                if (!qrElement) return;
                // Make element visible for cloning
                qrElement.style.display = "block";
            },
        });
    };
    const downloadQRCode = async () => {
        const canvas = await getCanvas();
        if (!canvas) throw new Error("<canvas> not found in DOM");

        const pngUrl = canvas
            .toDataURL("image/png");
        return pngUrl;

    };

    React.useEffect(() => {
        (async () => {
            let QRCodeUrl = await downloadQRCode();
            props.getTheQRUrl(QRCodeUrl);
        })();

    }, []);
    return (
        <>
            {/* <QRCodeTemplate  ><QRCodeSVG
                size={150}
                value={props.url}
            > </QRCodeSVG></QRCodeTemplate> */}
            <QRCodeTemplate>
                {props.url ? (
                    <QRCodeSVG size={150} value={props.url} />
                ) : (
                    <p>No URL provided</p>
                )}
            </QRCodeTemplate>

        </>
    );
};