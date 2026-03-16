import * as React from 'react';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';

export interface FormActionsProps {
  onSave: () => void;
  onCancel: () => void;
  saveText?: string;
  cancelText?: string;
  isSaving?: boolean;
  isDisabled?: boolean;
  saveIcon?: string;
  cancelIcon?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onSave,
  onCancel,
  saveText = 'Save',
  cancelText = 'Cancel',
  isSaving = false,
  isDisabled = false,
  saveIcon = 'Save',
  cancelIcon = 'Cancel'
}) => {
  return (
    <div className="form-actions">
      <PrimaryButton
        onClick={onSave}
        disabled={isDisabled || isSaving}
        iconProps={{ iconName: saveIcon }}
        className="form-actions__save"
      >
        {isSaving ? 'Saving...' : saveText}
      </PrimaryButton>
      <DefaultButton
        onClick={onCancel}
        disabled={isSaving}
        iconProps={{ iconName: cancelIcon }}
        className="form-actions__cancel"
      >
        {cancelText}
      </DefaultButton>
    </div>
  );
};

export default FormActions;
