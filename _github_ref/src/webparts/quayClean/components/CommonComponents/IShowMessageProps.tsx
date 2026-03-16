import * as React from 'react';
import { EMessageType } from '../../../../Interfaces/MessageType';

export interface IShowMessageProps {
    isShow: boolean;
    messageType: EMessageType;
    message: string | React.ReactNode;
    children?: React.ReactNode;
}
