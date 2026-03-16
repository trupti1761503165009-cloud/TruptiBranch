import * as React from 'react';
import { Dialog, DialogType, DialogFooter } from '@fluentui/react/lib/Dialog';
import { PrimaryButton } from '@fluentui/react/lib/Button';
import { useId, useBoolean } from '@fluentui/react-hooks';

interface ICustomeDialogProps {
    isDialogOpen: boolean;
    onClickClose(): any;
    closeText?: string;
    saveButtonText?: string;
    dialogMessage: any;
    dialogContentProps?: any;
    dialogWidth?: any;
    title?: string;
    onClickYes?(): any;
    isDisable?: boolean

}

export const CustomeDialog = (props: ICustomeDialogProps) => {
    const dialogStyles = {
        main: { maxWidth: !!props.dialogWidth ? props.dialogWidth : 450 }
    };
    const dialogContentProps = {
        type: DialogType.normal,
        title: !!props.title ? props.title : 'Missing data',
        closeButtonAriaLabel: 'Close',
    };
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(!props.isDialogOpen);
    const labelId: string = useId('dialogLabel');
    const subTextId: string = useId('subTextLabel');

    const modalProps = React.useMemo(
        () => ({
            titleAriaId: labelId,
            subtitleAriaId: subTextId,
            isBlocking: false,
            styles: dialogStyles,
        }),
        [labelId, subTextId],
    );

    const onClickClose = () => {
        props.onClickClose();
        toggleHideDialog();

    };

    return (
        <>
            <Dialog
                hidden={hideDialog}
                onDismiss={toggleHideDialog}
                dialogContentProps={!!props.dialogContentProps ? props.dialogContentProps : dialogContentProps}
                modalProps={modalProps}
                minWidth={!!props.dialogWidth ? props.dialogWidth : 450}
            >
                {props.dialogMessage}
                <DialogFooter>
                    {(!!props.saveButtonText && props.onClickYes) && <PrimaryButton disabled={!!props.isDisable ? props.isDisable : false} className={props.isDisable ? "" : "btn btn-primary"} onClick={props.onClickYes} text={props.saveButtonText} />}
                    {!!props.closeText && < PrimaryButton className="btn btn-danger" onClick={onClickClose} text={props.closeText} />}
                </DialogFooter>
            </Dialog>
        </>
    );
};
