import * as React from 'react';
import { MessageBar, MessageBarType } from '@fluentui/react';

export type ErrorType = 'error' | 'warning' | 'info' | 'success';

interface ErrorMessageProps {
  message: string;
  errorType: ErrorType;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, errorType }) => {
  let messageBarType: MessageBarType;

  switch (errorType) {
    case 'success':
      messageBarType = MessageBarType.success;
      break;
    case 'error':
      messageBarType = MessageBarType.error;
      break;
    case 'warning':
      messageBarType = MessageBarType.warning;
      break;
    case 'info':
      messageBarType = MessageBarType.info;
      break;
    default:
      messageBarType = MessageBarType.info;
  }

  return (
    <div className="dms-error-message-container" role="alert" aria-live="assertive">
      <MessageBar messageBarType={messageBarType} isMultiline={false}>
        {message}
      </MessageBar>
    </div>
  );
};

export default ErrorMessage;
