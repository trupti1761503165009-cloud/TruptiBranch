import * as React from 'react';
import { Label } from '@fluentui/react';

interface RequiredLabelProps {
  text: string;
  required?: boolean;
}

export const RequiredLabel: React.FC<RequiredLabelProps> = ({ text, required = true }) => {
  return (
    <Label className="labelform">
      {text}
      {required ? <span className="required">*</span> : null}
    </Label>
  );
};

