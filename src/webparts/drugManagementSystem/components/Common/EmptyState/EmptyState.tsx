import * as React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faInbox, faPlus } from '@fortawesome/free-solid-svg-icons';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: IconDefinition;
  primaryAction?: {
    text: string;
    onClick: () => void;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'Get started by adding your first item',
  icon = faInbox,
  primaryAction,
  secondaryAction
}) => {
  return (
    <div className="empty-state-modern">
      <div className="empty-state-modern__content">
        <div className="empty-state-modern__icon">
          <FontAwesomeIcon icon={icon} size="3x" />
        </div>
        <h3 className="empty-state-modern__title">{title}</h3>
        <p className="empty-state-modern__description">{description}</p>
        <div className="empty-state-modern__actions">
          {primaryAction && (
            <PrimaryButton
              iconProps={{ iconName: 'Add' }}
              onClick={primaryAction.onClick}
              styles={{
                root: { marginRight: 8 },
                icon: { marginRight: 6 }
              }}
            >
              {primaryAction.text}
            </PrimaryButton>
          )}
          {secondaryAction && (
            <DefaultButton onClick={secondaryAction.onClick}>
              {secondaryAction.text}
            </DefaultButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
