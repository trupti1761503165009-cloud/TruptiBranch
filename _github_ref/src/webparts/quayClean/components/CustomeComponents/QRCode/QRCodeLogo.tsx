import * as React from "react";
import QRCode from "qrcode.react";
interface IQRCodeLogoProps {
    url?: string;
}
export const QRCodeLogo = (props: IQRCodeLogoProps) => {
    return (
        <div>
            <QRCode value={'http://quayclean.tretainfotech.com/Assets/AssetsDetail?ItemId=182'} size={200}
                // imageSettings={{
                //     src: require('../../../assets/images/qrlogo.png'),
                //     width: 40,
                //     height: 40,

                // }}
                // style={{ frameBorder: 1 }}
                style={{
                    border: "1px solid black", // Use CSS border property for styling
                }}
                imageSettings={{
                    src: require('../../../assets/images/qrlogo2.png'),
                    excavate: true,
                    width: 40,
                    height: 40,
                }}
            />
        </div>
    );
};