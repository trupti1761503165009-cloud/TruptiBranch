import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { PrimaryButton } from '@fluentui/react/lib/Button';

require("./dialogStyle.css")
interface IDialogComponentProps {
    message: string;
    hideDialog: boolean;
    toggleHideDialog: any;
    dialogHeader: string;
    isSuccess: boolean;
    cancelOrSuccessClick: () => void;
    children?: React.ReactNode;
}

const modelProps = {
    isBlocking: true,
    styles: { main: { maxWidth: 500, minWidth: 450 } },
};

export const DialogComponent: React.FunctionComponent<IDialogComponentProps> = React.memo((props: IDialogComponentProps) => {
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
                    {props.isSuccess ?
                        <PrimaryButton onClick={props.cancelOrSuccessClick} text="Ok" className='firstMain' />
                        :
                        <PrimaryButton onClick={props.toggleHideDialog} text="Close" className='firstMain' />
                    }

                </DialogFooter>
            </Dialog>
        </>
    );
});
