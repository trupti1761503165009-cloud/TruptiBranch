import * as React from "react";
import { MessageDialog } from "../../CommonComponents/MessageDialog";
export interface IQrCodeModelProps {
    hideModel(): any;
    isModelOpen: boolean;
    qrCodeUrl: string;
    qrDetails?: any;
    quChemical?: string;
}
export const QrCodeModel = (props: IQrCodeModelProps) => {

    return <>
        <MessageDialog
            dialogClose={props.hideModel}
            // dialogContent={<img style={{ width: '100%' }} src={props.qrCodeUrl} />}
            dialogContent={props.qrCodeUrl}
            dialogqrDetails={props.qrDetails}
            dialogquChemical={props.quChemical}
        />
    </>;
};
