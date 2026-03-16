import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAtomValue } from "jotai";

import React from "react";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import CommonPopup from "../CommonSendEmailPopup";
import { Loader } from "../Loader";
import { PrimaryButton } from "@fluentui/react";
import { EmailPdfHandlerData } from "./EmailPdfHandlerData";


export const EmailPdfHandler = () => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider } = appGlobalState;

    const {
        state,
        onClickCancel,
        onChangeTitle,
        onChangeSendToEmail,
        onClickSendEmail,
        onClickShowEmailModel,
        onClickDownload,
    } = EmailPdfHandlerData();

    return (
        <>
            {state.isLoading && <Loader />}
            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dflex mt-2">
                <div className="mla">
                    <CommonPopup
                        isPopupVisible={state.isPopupVisible}
                        hidePopup={onClickCancel}
                        title={state.title}
                        sendToEmail={state.sendToEmail}
                        onChangeTitle={onChangeTitle}
                        onChangeSendToEmail={onChangeSendToEmail}
                        displayerrortitle={state.displayErrorTitle}
                        displayerroremail={state.displayErrorEmail}
                        displayerror={state.displayError}
                        onClickSendEmail={onClickSendEmail}
                        onClickCancel={onClickCancel}
                        onclickSendEmail={onClickShowEmailModel}
                    />
                    <PrimaryButton className="btn btn-primary mla" onClick={onClickDownload}>
                        <FontAwesomeIcon icon="download" className="clsbtnat" />
                        <div>PDF</div>
                    </PrimaryButton>
                </div>
            </div>
        </>
    );
};
