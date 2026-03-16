import * as React from 'react';
import { Dialog, DialogType, DialogFooter, PrimaryButton } from '@fluentui/react';

interface IDialogComponentProps {
    message: string;
    HideErrorDialog: boolean;
    ToggleHideErrorDialog: () => void;
    dialogHeader: string;
    isSuccess: boolean;
    cancelOrSuccessClick: () => void;
    children?: React.ReactNode;
}

const DialogComponent: React.FC<IDialogComponentProps> = React.memo((props: IDialogComponentProps) => {
    const { message, HideErrorDialog, ToggleHideErrorDialog, dialogHeader, isSuccess, cancelOrSuccessClick, children } = props;

    const dialogContentProps = {
        type: DialogType.largeHeader,
        title: dialogHeader || "Information",
        subText: message
    };

    const closeOnSuccess = () => {
        ToggleHideErrorDialog();
        cancelOrSuccessClick();
    };

    return (
        <Dialog
            hidden={HideErrorDialog}
            onDismiss={ToggleHideErrorDialog}
            dialogContentProps={dialogContentProps}
            modalProps={{ isBlocking: true, styles: { main: { maxWidth: 500, minWidth: 450 } } }}
        >
            {children}
            <DialogFooter>
                {isSuccess ?
                    <PrimaryButton onClick={closeOnSuccess} text="Ok" className='btn-primary' />
                    :
                    <PrimaryButton onClick={ToggleHideErrorDialog} text="Close" className='btn-primary' />
                }
            </DialogFooter>
        </Dialog>
    );
});

export default DialogComponent;
