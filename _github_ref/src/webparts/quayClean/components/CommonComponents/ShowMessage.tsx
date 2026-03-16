import * as React from 'react';

enum EMessageType {
    INFO = 'info',
    ERROR = 'error',
    SUCCESS = 'success',
}

import { IShowMessageProps } from './IShowMessageProps';

export const ShowMessage: React.FunctionComponent<IShowMessageProps> = (props: React.PropsWithChildren<IShowMessageProps>) => {
    const { messageType, children, message, isShow } = props;
    const [renderMessageIcon, setRenderMessageIcon] = React.useState<any>(null);
    const RenderError = React.useCallback(() => {
        return (
            <>
                <div className="">
                    <b style={{ width: "100%" }}>{message}</b>
                </div>
            </>
        );
    }, [message]);

    React.useEffect(() => {
        switch (messageType) {
            case EMessageType.SUCCESS:
                setRenderMessageIcon("Success");
                break;
            case EMessageType.INFO:
                setRenderMessageIcon("Info");
                break;
            default:
                break;
        }
    }, [messageType]);

    if (!isShow) {
        return <></>;
    }

    if (messageType === EMessageType.ERROR) {
        return <RenderError />;
    }

    return (
        <>
            <div>
                {renderMessageIcon}
                <b>{message}</b>
                {children}
            </div>
        </>
    );
};
