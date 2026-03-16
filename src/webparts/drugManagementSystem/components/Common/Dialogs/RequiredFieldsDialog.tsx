import * as React from 'react';
import { Dialog, DialogFooter, DialogType } from '@fluentui/react/lib/Dialog';
import { PrimaryButton } from '@fluentui/react/lib/Button';

interface RequiredFieldsDialogProps {
  hidden: boolean;
  onDismiss: () => void;
  fields: string[];
}

export const RequiredFieldsDialog: React.FC<RequiredFieldsDialogProps> = ({ hidden, onDismiss, fields }) => {
  return (
    <Dialog
      hidden={hidden}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.largeHeader,
        title: 'These fields are required',
        subText: fields.length ? 'Please fill the following fields:' : undefined
      }}
      modalProps={{ isBlocking: true, styles: { main: { maxWidth: 520, minWidth: 420 } } }}
    >
      {fields.length > 0 ? (
        <ul className="msg">
          {fields.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ) : null}
      <DialogFooter>
        <PrimaryButton onClick={onDismiss} text="Ok" className="firstMain" />
      </DialogFooter>
    </Dialog>
  );
};

