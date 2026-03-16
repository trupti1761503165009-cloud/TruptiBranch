import * as React from 'react';
import { Dialog, DialogFooter, DialogType } from '@fluentui/react/lib/Dialog';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationCircle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

export type MessageType = 'success' | 'error' | 'warning' | 'info' | 'validation';

interface MessageDialogProps {
  hidden: boolean;
  onDismiss: () => void;
  type: MessageType;
  title: string;
  message: string;
  fields?: string[]; // For validation errors
  showCancel?: boolean;
  onConfirm?: () => void;
  confirmText?: string;
}

export const MessageDialog: React.FC<MessageDialogProps> = ({
  hidden,
  onDismiss,
  type,
  title,
  message,
  fields = [],
  showCancel = false,
  onConfirm,
  confirmText = 'OK'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FontAwesomeIcon icon={faCheckCircle} style={{ fontSize: 48, color: '#43A047' }} />;
      case 'error':
        return <FontAwesomeIcon icon={faTimes} style={{ fontSize: 48, color: '#E53935' }} />;
      case 'warning':
        return <FontAwesomeIcon icon={faExclamationCircle} style={{ fontSize: 48, color: '#FB8C00' }} />;
      case 'validation':
        return <FontAwesomeIcon icon={faExclamationCircle} style={{ fontSize: 48, color: '#FB8C00' }} />;
      default:
        return <FontAwesomeIcon icon={faInfoCircle} style={{ fontSize: 48, color: '#1E88E5' }} />;
    }
  };

  const getHeaderColor = () => {
    switch (type) {
      case 'success': return '#E8F5E9';
      case 'error': return '#FFEBEE';
      case 'warning': return '#FFF3E0';
      case 'validation': return '#FFF3E0';
      default: return '#E3F2FD';
    }
  };

  return (
    <Dialog
      hidden={hidden}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.largeHeader,
        title: title,
        styles: {
          header: { background: getHeaderColor(), padding: '20px 24px' },
          title: { fontWeight: 600, fontSize: 18 }
        }
      }}
      modalProps={{
        isBlocking: true,
        styles: { main: { maxWidth: 480, minWidth: 380, borderRadius: 8 } }
      }}
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        {getIcon()}
        <p style={{ marginTop: 16, fontSize: 14, color: '#333', lineHeight: 1.6 }}>
          {message}
        </p>
        {fields.length > 0 && (
          <div style={{ textAlign: 'left', marginTop: 16, background: '#FFF8E1', padding: 12, borderRadius: 6 }}>
            <strong style={{ fontSize: 13, color: '#E65100' }}>Please fill the following required fields:</strong>
            <ul style={{ margin: '8px 0 0 16px', padding: 0 }}>
              {fields.map((field) => (
                <li key={field} style={{ fontSize: 13, color: '#BF360C', marginTop: 4 }}>
                  {field}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <DialogFooter styles={{ actions: { justifyContent: 'center' } }}>
        {showCancel && (
          <DefaultButton onClick={onDismiss} text="Cancel" style={{ marginRight: 8 }} />
        )}
        <PrimaryButton
          onClick={onConfirm || onDismiss}
          text={confirmText}
          styles={{
            root: {
              background: type === 'success' ? '#43A047' : type === 'error' ? '#E53935' : '#1E88E5',
              borderColor: type === 'success' ? '#43A047' : type === 'error' ? '#E53935' : '#1E88E5',
              minWidth: 100
            },
            rootHovered: {
              background: type === 'success' ? '#388E3C' : type === 'error' ? '#C62828' : '#1565C0',
              borderColor: type === 'success' ? '#388E3C' : type === 'error' ? '#C62828' : '#1565C0'
            }
          }}
        />
      </DialogFooter>
    </Dialog>
  );
};
