export interface ICommonPopupProps {
    isPopupVisible: boolean;
    hidePopup: () => void;
    title: string;
    sendToEmail: string;
    onChangeTitle: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void;
    onChangeSendToEmail: (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => void;
    displayerrortitle: boolean;
    displayerroremail: boolean;
    displayerror: boolean;
    onClickSendEmail: () => void;
    onClickCancel: () => void;
    onclickSendEmail: () => void;
    isPrice?: boolean;
    onToggleChange?: (value: boolean) => void;
    data?: any[];
}
