import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { PrimaryButton } from '@fluentui/react/lib/Button';

// require("./dialogStyle.css")

interface IDialogConfirmationComponentProps {
    message: string;
    hideDialog: boolean;
    toggleHideDialog: any;
    dialogHeader: string;
    yesText: string;
    noText: string;
    yesClick: () => void;
    children?: React.ReactNode;
}

const modelProps = {
    isBlocking: true,
    styles: { main: { maxWidth: 500, minWidth: 450 } },
};

export const DialogConfirmationComponent: React.FunctionComponent<IDialogConfirmationComponentProps> = React.memo((props: IDialogConfirmationComponentProps) => {
    const dialogContentProps = {
        type: DialogType.largeHeader,
        title: props.dialogHeader || "Information",
        subText: props.message
    };

    return (
        <>
            <Dialog
                hidden={props.hideDialog}
                onDismiss={props.toggleHideDialog}
                dialogContentProps={dialogContentProps}
                modalProps={modelProps}
            >
                {props.children}
                <DialogFooter>
                    <PrimaryButton onClick={props.yesClick} text={`${props.yesText}`} className='btn-primary' />
                    <PrimaryButton onClick={props.toggleHideDialog} text={`${props.noText}`} className='btn-danger' />
                </DialogFooter>
            </Dialog>
        </>
    );
});
