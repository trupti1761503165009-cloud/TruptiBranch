import { Dialog, DialogFooter, IDialogContentProps } from '@fluentui/react/lib/Dialog';
import { useBoolean, useId } from '@fluentui/react-hooks';
import * as React from 'react';
import { ContextualMenu, DefaultButton, Toggle } from '@fluentui/react';
import ReactToPrint from 'react-to-print';
import { useRef } from 'react';
interface IMessageDialogProps {
    dialogContentProps?: IDialogContentProps;
    //dialogContentProps: any;
    dialogClose: () => void;
    displayOkayButton?: boolean;
    dialogOkay?: () => void;
    dialogContent: any;
    dialogWidht?: number;
    closeButtonText?: string;
    dialogqrDetails?: any;
    dialogquChemical?: string;
}

export const MessageDialog: React.FunctionComponent<IMessageDialogProps> = (props: IMessageDialogProps): React.ReactElement<IMessageDialogProps> => {
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
    const [isDraggable,] = useBoolean(false);
    const [IsActive, setIsActive] = React.useState<boolean | undefined>(false);
    const labelId: string = useId('dialogLabel');
    const subTextId: string = useId('subTextLabel');
    let CurrentRef = useRef<any>();
    let CurrentRef2 = useRef<any>();
    function _onChangeToggle(ev: React.MouseEvent<HTMLElement>, checked?: boolean) {
        setIsActive(checked);
    }

    const dialogStyles = { main: { maxWidth: !!props.dialogWidht ? 800 : 800 } };
    const dragOptions = {
        moveMenuItemText: 'Move',
        closeMenuItemText: 'Close',
        menu: ContextualMenu,
        keepInBounds: true,
    };

    const modalProps = React.useMemo(
        () => ({
            isBlocking: true,
            titleAriaId: labelId,
            subtitleAriaId: subTextId,
            styles: dialogStyles,
            dragOptions: isDraggable ? dragOptions : undefined,
        }),
        [isDraggable, labelId, subTextId],
    );


    React.useEffect(() => {
        toggleHideDialog();
    }, []);
    const pageStyle = `
        @page {
        //   size: landscape;
        }

        @media all {
          .pagebreak {
            display: none;
          }
        }
        @media print {
            .testcls{
                margin-left: 154px !important;
            }
            .imgWidth{
                width: 55% !important;
            }
            .imgWidth2{
                width: 75% !important;
            }
            .scan-lbl{
                font-size: 26px !important;
            }
            
            div {
                font-family: NotoSans !important;
                font-size: 26px !important;
            }
        }
        @media print {
          .pagebreak {
            page-break-before: always;
          }
        .ml-lbl{
            margin-left:300px;
        }
        }
      `;
    return (
        <>

            <Dialog
                hidden={hideDialog}
                onDismiss={() => { props.dialogClose(); toggleHideDialog(); }}
                dialogContentProps={props?.dialogContentProps}
                modalProps={modalProps}
                maxWidth={IsActive ? 600 : 340}
                minWidth={IsActive ? 600 : 340}
            >
                {props.dialogquChemical != "Chemical" ?
                    <div>
                        {IsActive === false ?
                            <div ref={CurrentRef} >
                                <div className="mt-3 ml-lbl testcls"><b>Serial Number :</b> {props.dialogqrDetails.SerialNumber ? props.dialogqrDetails.SerialNumber : ""}</div>
                                <div className="mt-3 ml-lbl testcls"><b>Asset Name :</b> {props.dialogqrDetails.Title ? props.dialogqrDetails.Title : ""}</div>
                                {/* {!!props.dialogContent ? props.dialogContent : <></>} */}
                                <div style={{ textAlign: "center" }}>
                                    <img className="imgWidth" style={{ width: '75%' }} src={props.dialogContent} />
                                </div>
                                <div className="scan-lbl" style={{ textAlign: "center" }}>
                                    Scan this QR code for more detail.
                                </div>
                            </div> :
                            <div>
                                <div className="container" ref={CurrentRef2}>
                                    <div className="row">
                                        <div className="col-lg-6 col-md-12 mb-3 textCenter pad-0">
                                            {/* {!!props.dialogContent ? props.dialogContent : <></>} */}
                                            <img className="imgWidth2" style={{ width: '75%' }} src={props.dialogContent} />
                                            <div className="">
                                                Scan this QR code for more detail.
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-12 mb-3">
                                            <div className="row mt-row">
                                                <div className="col-lg-9 col-md-12 mb-3">
                                                    <div className="row mt-3">
                                                        <div className="col-md-12 col-sm-6 col-12 mb-2">
                                                            <div className="formGroup">
                                                                <label className="">
                                                                    <b>Serial Number</b>
                                                                </label>
                                                                <div className="listDetail">{props.dialogqrDetails.SerialNumber ? props.dialogqrDetails.SerialNumber : ""}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-12 col-sm-6 col-12 mb-2">
                                                            <div className="formGroup">
                                                                <label className="">
                                                                    <b>Asset Name</b>
                                                                </label>
                                                                <div className="listDetail">{props.dialogqrDetails.Title ? props.dialogqrDetails.Title : ""}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }</div> : <div>
                        {IsActive === false ?
                            <div ref={CurrentRef}>
                                <div className="mt-3 ml-lbl testcls"><b>Chemical Name :</b> {props.dialogqrDetails.Title ? props.dialogqrDetails.Title : ""}</div>
                                <div className="mt-3 ml-lbl testcls"><b>Notes :</b> {props.dialogqrDetails.SerialNumber ? props.dialogqrDetails.SerialNumber : ""}</div>
                                {/* {!!props.dialogContent ? props.dialogContent : <></>} */}
                                <div style={{ textAlign: "center" }}>
                                    <img className="imgWidth" style={{ width: '75%' }} src={props.dialogContent} />
                                </div>
                                <div className="scan-lbl" style={{ textAlign: "center" }}>
                                    Scan this QR code for more detail.
                                </div>
                            </div> :
                            <div>
                                <div className="container" ref={CurrentRef2}>
                                    <div className="row">
                                        <div className="col-lg-6 col-md-12 mb-3 textCenter pad-0">
                                            {/* {!!props.dialogContent ? props.dialogContent : <></>} */}
                                            <img className="imgWidth2" style={{ width: '75%' }} src={props.dialogContent} />
                                            <div className="">
                                                Scan this QR code for more detail.
                                            </div>
                                        </div>
                                        <div className="col-lg-6 col-md-12 mb-3">
                                            <div className="row mt-row">
                                                <div className="col-lg-9 col-md-12 mb-3">
                                                    <div className="row mt-3">
                                                        <div className="col-md-12 col-sm-6 col-12 mb-2">
                                                            <div className="formGroup">
                                                                <label className="">
                                                                    <b>Chemical Name</b>
                                                                </label>
                                                                <div className="listDetail">{props.dialogqrDetails.Title ? props.dialogqrDetails.Title : ""}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-12 col-sm-6 col-12 mb-2">
                                                            <div className="formGroup">
                                                                <label className="">
                                                                    <b>Notes</b>
                                                                </label>
                                                                <div className="listDetail">{props.dialogqrDetails.SerialNumber ? props.dialogqrDetails.SerialNumber : ""}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>}
                <div className="ml-lbl">
                    <Toggle label="Landscape?"
                        onText="On" offText="Off"
                        // checked={}
                        onChange={_onChangeToggle} />
                </div>
                {!props.closeButtonText &&
                    <DialogFooter>
                        {props.displayOkayButton && <DefaultButton onClick={() => {
                            if (!!props.dialogOkay)
                                props?.dialogOkay();
                            toggleHideDialog();
                        }} className="btn btn-primary" text="Ok" />}

                        <ReactToPrint
                            bodyClass="printCls pd print-agreement"
                            content={() => IsActive ? CurrentRef2.current : CurrentRef.current}
                            pageStyle={pageStyle}
                            // content={() => IsActive ? CurrentRef3.current : CurrentRef3.current}
                            trigger={() => (
                                <DefaultButton className="btn btn-primary">
                                    Print
                                </DefaultButton>
                            )}
                        />
                        <DefaultButton onClick={() => { props.dialogClose(); toggleHideDialog(); }} className="btn btn-danger" text="Close" />
                    </DialogFooter>
                }
            </Dialog >
        </>
    );
};