/* eslint-disable react/jsx-key */
import * as React from "react";
import { Checkbox, DefaultButton, FontWeights, IButtonStyles, IDetailsColumnProps, IIconProps, IconButton, Label, Link, Modal, Toggle, getTheme, mergeStyleSets, } from "@fluentui/react";
import ReactToPrint from "react-to-print";
import { useRef } from "react";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { _onItemSelected, generateAndSaveKendoPDF, generateAndSaveKendoPDFHelpDesk, generateAndSaveKendoPDFQR, isWithinNextMonthRange } from "../../../../../Common/Util";
import { IQuayCleanState } from "../../QuayClean";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PrimaryButton } from "office-ui-fabric-react";
import { Loader } from "../../CommonComponents/Loader";
import { printSize } from "../../../../../Common/Constants/CommonConstants";
export interface IPrintQrCodeProps {
    items?: any[];
    onClickClose(): any;
    isAssetQR: boolean;
    isChemicalQR: boolean;
    manageComponentView(componentProp: IQuayCleanState): any;
    isDetailView?: boolean;
    isAssociatedChemical?: boolean;
    visibleColumn?: string[];
}

export interface IPrintQrCodeState {

}



const pageStyleThermalPrint = `

@media print {
    @page {
        size:  4in 4in;
        margin: 0 auto;
        /* imprtant to logo margin */
        sheet-size: 300px 250mm portrait;
        /* imprtant to set paper size */
    }

    html,
    body {
        margin: 0;
        padding: 0
    }

   .printContainer {
    /* width: 250px; */
    width: 4.5in !important;
    height: 2.3in !important;
    margin: auto !important;
    text-align: justify !important;
    /* padding: 15px !important; */
    padding-top: 25px;
    /* margin-top: 10px; */
    border:none !important;
    /* margin-bottom: 0.64in !important; */
    padding-bottom: 0.20in !important;
    /* padding-top: 35px !important; */
    /* padding-top: 0.45in !important; */
}

.printContainerCable {
    /* width: 250px; */
    width: 4.5in !important;
    height: 2.3in !important;
    margin: auto !important;
    /*padding: 10px;*/
    /*border: 2px dotted #000;*/
    text-align: justify !important;
    /* padding: 15px !important; */
    /* margin-top: 10px; */
    border:none !important;
    /* margin-bottom: 0.64in !important; */
    /* padding-bottom: 0.20in !important; */
    /* padding-top: 35px !important; */
    /* padding-top: 0.45in !important; */
}

.printContainerBreak {
    /* width: 250px !important; */
    width: 4.5in !important;
    height: 2.3in !important;
    margin: auto;
    /* margin: auto !important; */
    /* margin-top: 10px !important; */
    text-align: justify !important;
    /* padding: 15px !important; */
     border:none !important;
      /* margin-bottom: 0.64in !important; */
    /* padding-top: 0.20in !important; */
    padding-top: 35px !important;
    page-break-after: always !important;
}

    .textcenter {
        text-align: center !important;
    }

    .imgroatethermal {
        width: 110px !important;
    }

    .text-center {
        text-align: center !important;
        font-size: small !important;

    }

  .qrcode {
    width: 130px !important;
    display: flex;
}

    .truncateqr2 {
        font-size: small !important;
        display: -webkit-box !important;
        -webkit-box-orient: vertical !important;
        overflow: hidden !important;
        -webkit-line-clamp: 2 !important;
        max-height: 3.6em !important;
    }

    .truncateqr1 {
        font-size: small !important;
        display: -webkit-box !important;
        -webkit-box-orient: vertical !important;
        overflow: hidden !important;
        -webkit-line-clamp: 1 !important;
        max-height: 3.6em !important;
    }

    .mtqr {
        margin-top: 5px !important;
    }

    .colQRTh-lg-4 {
        width: 40% !important;
    }

    .colQRTh-lg-6 {
        width: 60% !important;
        padding: 0 5px !important;
    }

    .colQRTh-lg-12 {
        width: 100% !important;
    }

    .text-left {
        text-align: left !important;
        font-size: small !important;
    }

   
    .dflexQR {
    /* margin-top: 30px; */
    /* margin-bottom: 30px; */
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
}
    dflex{
         display: flex !important;
    }

    .rowQR {
        display: -webkit-box !important;
        display: -ms-flexbox !important;
        display: flex !important;
        -ms-flex-wrap: wrap !important;
        flex-wrap: wrap !important;
        margin-right: -15px !important;
        margin-left: -15px !important;
        /* padding-top: 0.10in !important; */
         height: 100%;

    }

    .colQR-lg-20 {
        width: 20% !important;
    }

    .colQRCB-lg-20 {
        display: block !important;
        width: 20px !important;
        height: 100% !important;
        display: flex !important;
        flex-direction: row-reverse !important;
        transform: rotate(90deg) !important;
        justify-content: center !important;
    }

    .colQR-lg-80 {
        width: 80% !important;
    }

    .colQRTh-lg-2-5 {
        width: 20% !important;
    }

    .mt35 {
        margin-top: 33px !important;
    }

    .colQRTh-lg-40 {
        width: 40% !important;
    }

    .colQRThCB-lg-40 {
        width: 40% !important;
        transform: rotate(-90deg) !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        text-align: center !important;
    }

    .vtext {
        writing-mode: vertical-rl !important;
        display: inline-block;
        /* text-orientation: upright */
    }

    .vcenter {
        justify-content: center !important;
        align-content: center !important;
        display: flex !important;
       
    }

    .colQR-lg-3 {
        width: 25% !important;
        margin-top: 15px !important;
    }
    .fsmall {
        font-size: small !important;
    } 
    .pt5{
            padding-left: 25px !important;
    }
    .colQRTh-lg-45 {
    width: 45% !important;
}
    .printCard {
    /* width: 250px; */
    width: 4.5in !important;
    height: 2.3in !important;
    margin: auto !important;
    /*padding: 10px;*/
    /*border: 2px dotted #000;*/
    text-align: justify !important;
    padding: 15px !important;
    /* margin-top: 10px; */
    border:none !important;
    margin-bottom: 0.64in !important;
    padding-bottom: 0.20in !important;
}
.mtm-8 {
    margin-left: -8px !important;
}

    
.xlarge {
    font-size: x-large;
}

.bold {
    font-weight: 600!important;
}
.colQRTh-lg-15 {
    width: 15% !important;
}

.colQRTh-lg-5 {
    width: 5% !important;
}
.mt5 {
    margin-top: 5px !important;
}


}
      `;


const pageStyleA4Print = `
 

        @media print {
            .a4 body {
                -webkit-print-color-adjust: exact;
            }
        }

            `


export const updateProjectMDL = (mdlDetails: any[], columnName: any, allcheked: any) => {
    try {
        let allMDLDetails: any[];
        allMDLDetails = [...mdlDetails];
        let projectMDL: any[] = [];
        if (mdlDetails.length > 0) {
            switch (columnName) {
                case "SelectAll":
                    projectMDL = allMDLDetails.map(r => ({
                        ...r,
                        isPrintQrCode: allcheked,
                    }));
                    break;
            }

        }
        return projectMDL;
    } catch (error) {
        const errorObj = { ErrorMethodName: "MDLConfiguration updateProjectMDL", CustomErrormessage: "updateProjectMDL", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "KECDMS.aspx" };
        // void logGenerator(props.provider, errorObj);
        console.log(errorObj);

    }
};



export const PrintQrCode = (props: IPrintQrCodeProps) => {
    const GenratedPrint = React.useRef<any>(null);
    const [isLargeModelView, setIsLargeModelView] = React.useState<boolean>(props.isDetailView ? false : true);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [isPdfGenerating, setIsPdfGenerating] = React.useState<boolean>(false);
    // const [propsItems, setPropsItems] = React.useState<any[]>(!!props.items ? props.items : [])
    const propsItems = React.useRef<any[]>(!!props.items ? props.items : [])
    const [isCableView, setIsCableView] = React.useState<boolean>(false);
    const [isTestedView, setIsTestedView] = React.useState<boolean>(true);
    const [isStickerView, setIsStickerView] = React.useState<boolean>(true);
    const [isA4Print, setIsA4Print] = React.useState<boolean>(false);
    const [isAciveLandScape, setIsAciveLandScape] = React.useState<boolean>(false);
    const [isthermalPrint, setIsthermalPrint] = React.useState<boolean>(false);
    const [isSelctionModeOpen, setIsSelctionModeOpen] = React.useState<boolean>(false);
    const headerChekbox = React.useRef<boolean>(false);
    const [isRender, setIsRender] = React.useState<boolean>(true);
    const [selectionGrid, setSelectionGrid] = React.useState<any[]>([]);
    const [items, setItems] = React.useState<any[]>([]);
    const [allItems, setAllItems] = React.useState<any[]>(!!props.items ? props.items : []);
    const [selectetdPrintQRCodeItems, setSelectetdPrintQRCodeItems] = React.useState<any[]>([]);
    const [keyUpdate, setKeyUpdate] = React.useState<number>(Math.random());
    const itemsref = React.useRef<any>([]);
    const [searchText, setSearchText] = React.useState<string>("");
    let CurrentRefthermalPrint = useRef<any>();
    const [isPrintQRModelOpent, setIsPrintQRModelOpent] = React.useState<boolean>(false);
    const [width, setWidth] = React.useState<string>("800px");
    const theme = getTheme();


    // const columnVisibility =
    //     (props.visibleColumn == undefined)
    //         ? new Proxy({}, {
    //             get: (_: any, key: string) => props.visibleColumn != undefined && props.visibleColumn.includes(key)
    //         })
    //         : new Proxy({}, { get: () => true });
    const columnVisibility =
        Array.isArray(props.visibleColumn) && props.visibleColumn.length > 0
            ? new Proxy({}, {
                get: (_: any, key: string) => props?.visibleColumn?.includes(key)
            })
            : new Proxy({}, { get: () => true });


    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("700px");
        }
    }, [window.innerWidth]);

    const contentStyles = mergeStyleSets({
        container: {
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'stretch',
            width: (isLargeModelView) ? "1000px" : width
        },
        header: [
            theme.fonts.xLargePlus,
            {
                flex: '1 1 auto',
                borderTop: `4px solid #1300a6`,
                color: theme.palette.neutralPrimary,
                display: 'flex',
                alignItems: 'center',
                fontWeight: FontWeights.semibold,
                padding: '12px 12px 14px 24px',
            },
        ],
        heading: {
            color: theme.palette.neutralPrimary,
            fontWeight: FontWeights.semibold,
            fontSize: 'inherit',
            margin: '0',
        },
        body: {
            flex: '4 4 auto',
            padding: '0 24px 24px 24px',
            overflowY: 'hidden',
            selectors: {
                p: { margin: '14px 0' },
                'p:first-child': { marginTop: 0 },
                'p:last-child': { marginBottom: 0 },
            },
        },
    });

    const iconButtonStyles: Partial<IButtonStyles> = {
        root: {
            color: theme.palette.neutralPrimary,
            marginLeft: 'auto',
            marginTop: '4px',
            marginRight: '2px',
        },
        rootHovered: {
            color: theme.palette.neutralDark,
        },
    };

    const cancelIcon: IIconProps = { iconName: 'Cancel' };


    const _onChangeCable = (ev: any, checked: boolean) => {
        setIsCableView(checked);
        setIsStickerView(true)
        setIsA4Print(false);
    };
    // const _onChangeCheckboxTest = (ev: any, checked: boolean) => {
    //     setIsTestedView(checked);
    // };

    const _onChangeSticker = (ev: any, checked: boolean) => {
        setIsStickerView(checked);
        setIsA4Print(checked ? false : true)
    };
    const updateProjectMDL = (mdlDetails: any[], columnName: any, allcheked: any) => {
        try {
            let allMDLDetails: any[];
            allMDLDetails = [...mdlDetails];
            let projectMDL: any[] = [];
            if (mdlDetails.length > 0) {
                switch (columnName) {
                    case "SelectAll":
                        projectMDL = allMDLDetails.map(r => ({
                            ...r,
                            isPrintQrCode: allcheked,
                        }));
                        break;
                }

            }
            return projectMDL;
        } catch (error) {
            const errorObj = { ErrorMethodName: "MDLConfiguration updateProjectMDL", CustomErrormessage: "updateProjectMDL", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "KECDMS.aspx" };
            // void logGenerator(props.provider, errorObj);
            console.log(errorObj);

        }
    };
    const isEven = (n: any) => {
        return (n % 2 == 0);
    };

    const onChangeA4Print = (ev: any, checked: boolean) => {
        setIsA4Print(checked);
        setIsCableView(false);
        setIsStickerView(checked ? false : true)
    }

    const genrateThermalPrintAsset = () => {
        return <> <div className="dataJustifyBetween mb20 flex-wrap">
            <div className="printQROptions">
                <Label>Print Option:</Label>
                <Checkbox label="Sticker" onChange={_onChangeSticker} checked={isStickerView} />
                <Checkbox label="Cable" onChange={_onChangeCable} checked={isCableView} />
                <Checkbox label="A4 Printing" onChange={onChangeA4Print} checked={isA4Print} />
            </div>

            <div >
                <ReactToPrint
                    content={() => CurrentRefthermalPrint.current}
                    pageStyle={pageStyleThermalPrint}
                    trigger={() => (
                        <DefaultButton className="btn btn-primary" style={{ marginLeft: "5px" }}>
                            Print
                        </DefaultButton>
                    )}
                />
                <DefaultButton className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={() => { setKeyUpdate(Math.random()); setIsPrintQRModelOpent(false); setIsLargeModelView(true); }} >
                    Back
                </DefaultButton>
            </div>
        </div>
            <div id="printDiv" ref={CurrentRefthermalPrint}>
                {!!selectetdPrintQRCodeItems && selectetdPrintQRCodeItems?.map((i: any, index: number) => {
                    if (isEven(index + 1)) {
                        if (isTestedView) {
                            return <>
                                <div className="printContainerBreak">

                                    <div className="rowQR">

                                        <div className="colQRTh-lg-4">
                                            <div className="dflexQR">
                                                <div >
                                                    <div>
                                                        <img src={require('../../../assets/images/logo.png')} className="imgroatethermal ml-10" alt="QR Code" />
                                                    </div>
                                                    <img src={i.QRCode} alt="QR Code" className="qrcode" />

                                                </div>
                                            </div>
                                        </div>
                                        <div className="colQRTh-lg-6">
                                            <div className="text-left">TESTED TO AN/NZS 3760 </div>
                                            {columnVisibility['SerialNumber'] && <div className="text-left  truncateqr2 mtqr"><b>Serial Number</b>: {i.SerialNumber}</div>}
                                            {columnVisibility['AsstetName'] && <div className="text-left  truncateqr2 mtqr"><b>Asset Name</b>: {i.Title}</div>}
                                            {columnVisibility['ServiceDueDate'] && <div className="text-left mtqr truncateqr2"> <b>Due Date</b>: {i.ServiceDueDate}</div>}
                                            {columnVisibility['FANumber'] && <div className="text-left mtqr truncateqr2"> <b>FA Number</b>: {i.FANumber}</div>}
                                            {columnVisibility['TestedDate'] && <div className="text-left  truncateqr2 mtqr"><b>Tested Date</b>: {i?.TestedDate}</div>}
                                            {columnVisibility['TestStatus'] && <div className="text-left  truncateqr2 mtqr dflex"><b>Test Status: PASS</b></div>}

                                        </div>
                                        <div className="colQRTh-lg-12">
                                            <div className="text-center">Scan this QR code for more detail.</div>
                                        </div>
                                    </div>
                                </div>
                            </>;
                        } else {
                            return <>
                                <div className="printContainerBreak">

                                    <div className="rowQR">
                                        <div className="colQRTh-lg-4">
                                            <div className="dflexQR">
                                                <div >
                                                    <div>
                                                        <img src={require('../../../assets/images/logo.png')} className="imgroatethermal ml-10" alt="QR Code" />
                                                    </div>
                                                    <img src={i.QRCode} alt="QR Code" className="qrcode" />

                                                </div>
                                            </div>
                                        </div>
                                        <div className="colQRTh-lg-6">
                                            {columnVisibility['SerialNumber'] && <>  <div className="text-left"><b>Serial Number </b></div>
                                                <div className="text-left truncateqr2">{i.SerialNumber}</div>
                                            </>}
                                            {columnVisibility['AsstetName'] && <>
                                                <div className="text-left mtqr"><b>Asset Name: </b></div>
                                                <div className="text-left truncateqr2">{i.Title}</div>
                                            </>}
                                        </div>
                                        <div className="colQRTh-lg-12">
                                            <div className="text-center">Scan this QR code for more detail.</div>
                                        </div>
                                    </div>
                                </div>
                            </>;
                        }
                    } else {
                        if (isTestedView) {
                            return <>
                                <div className="printContainer">

                                    <div className="rowQR">
                                        <div className="colQRTh-lg-4">
                                            <div className="dflexQR">
                                                <div >
                                                    <div>
                                                        <img src={require('../../../assets/images/logo.png')} className="imgroatethermal ml-10" alt="QR Code" />
                                                    </div>
                                                    <img src={i.QRCode} alt="QR Code" className="qrcode" />

                                                </div>
                                            </div>
                                        </div>
                                        <div className="colQRTh-lg-6">
                                            <div className="text-left">TESTED TO AN/NZS 3760 </div>
                                            {columnVisibility['SerialNumber'] && <div className="text-left  truncateqr2 mtqr"><b>Serial Number</b>: {i.SerialNumber}</div>}
                                            {columnVisibility['AsstetName'] && <div className="text-left  truncateqr2 mtqr"><b>Asset Name</b>: {i.Title}</div>}
                                            {columnVisibility['ServiceDueDate'] && <div className="text-left mtqr truncateqr2"> <b>Due Date</b>: {i?.ServiceDueDate}</div>}
                                            {columnVisibility['FANumber'] && <div className="text-left mtqr truncateqr2"> <b>FA Number</b>: {i?.FANumber}</div>}
                                            {columnVisibility['TestedDate'] && <div className="text-left  truncateqr2 mtqr"><b>Tested Date</b>: {i?.TestedDate}</div>}
                                            {columnVisibility['TestStatus'] && <div className="text-left  truncateqr2 mtqr dflex"><b>Test Status: PASS</b></div>}
                                        </div>
                                        <div className="colQRTh-lg-12">
                                            <div className="text-center">Scan this QR code for more detail.</div>
                                        </div>
                                    </div>
                                </div>
                            </>;
                        } else {
                            return <>
                                <div className="printContainer">
                                    <div className="rowQR">
                                        <div className="colQRTh-lg-4">
                                            <div className="dflexQR">
                                                <div >
                                                    <div>
                                                        <img src={require('../../../assets/images/logo.png')} className="imgroatethermal ml-10" alt="QR Code" />
                                                    </div>
                                                    <img src={i.QRCode} alt="QR Code" className="qrcode" />

                                                </div>
                                            </div>
                                        </div>
                                        <div className="colQRTh-lg-6">

                                            {columnVisibility['SerialNumber'] && <><div className="text-left"><b>Serial Number </b></div>

                                                <div className="text-left truncateqr2">{i.SerialNumber}</div>
                                            </>}
                                            {columnVisibility['AsstetName'] && <><div className="text-left mtqr"><b>Asset Name: </b></div>
                                                <div className="text-left truncateqr2">{i.Title}</div>
                                            </>}
                                        </div>
                                        <div className="colQRTh-lg-12">
                                            <div className="text-center">Scan this QR code for more detail.</div>
                                        </div>
                                    </div>
                                </div>
                            </>;
                        }
                    }

                })
                }
            </div>
        </>;

    };

    const genrateThermalPrintAssetCableView = () => {
        return <> <div className="dataJustifyBetween mb20 flex-wrap">
            <div className="printQROptions">
                <Label>Print Option:</Label>
                <Checkbox label="Sticker" onChange={_onChangeSticker} checked={isStickerView} />
                <Checkbox label="Cable" onChange={_onChangeCable} checked={isCableView} />
                <Checkbox label="A4 Printing" onChange={onChangeA4Print} checked={isA4Print} />
            </div>
            <div >

                <ReactToPrint
                    content={() => CurrentRefthermalPrint.current}
                    pageStyle={pageStyleThermalPrint}
                    trigger={() => (
                        <DefaultButton className="btn btn-primary">
                            Print
                        </DefaultButton>
                    )}
                />
                <DefaultButton className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={() => { setKeyUpdate(Math.random()); setIsPrintQRModelOpent(false); setIsLargeModelView(true); }} >
                    Back
                </DefaultButton>
            </div>
        </div>
            <div id="printDiv" ref={CurrentRefthermalPrint}>
                {!!selectetdPrintQRCodeItems && selectetdPrintQRCodeItems?.map((i: any, index: number) => {
                    if (isEven(index + 1)) {
                        if (isTestedView) {
                            return <>
                                <div className="printContainerCable">
                                    <div className="rowQR">
                                        <div className="colQRTh-lg-45">
                                            <div className="dflexQR">
                                                <div className="colQR-lg-10 text-center vcenter scanQR">
                                                    <div className="vtext fsmall mt5"> Scan this QR code for more detail. </div>
                                                </div>
                                                <div className="colQR-lg-70" >
                                                    <img src={i.QRCode} alt="QR Code" className="qrcode" />
                                                </div>
                                                <div className="colQRCB-lg-20">
                                                    <img src={require('../../../assets/images/logo.png')} className="imgroatethermal " alt="QR Code" />
                                                </div>

                                            </div>
                                        </div>
                                        <div className="colQRTh-lg-5 text-center dflex  mtm-8 ">
                                            <div className="vtext fsmall"><b> TESTED TO AN/NZS 3760</b>
                                            </div>

                                        </div>
                                        <div className="colQRTh-lg-5 text-center dflex fsmall">
                                            <h3 className="vtext  "><FontAwesomeIcon icon="caret-up" /> Caution <FontAwesomeIcon icon="sort-down" /></h3>

                                        </div>
                                        <div className="colQRThCB-lg-40 pt-30 ">
                                            <table className="fsmall text-left" >
                                                <tr >

                                                    {columnVisibility['SerialNumber'] && <td className="dinline">
                                                        <tr className="bold">Serial No</tr>
                                                        <tr className="truncateqr2">{i.SerialNumber}</tr>
                                                    </td>}
                                                    {columnVisibility['AsstetName'] && <td >
                                                        <tr className="bold">Asset Name</tr>
                                                        <tr className=" truncateqr2">{i.Title}</tr>
                                                    </td>}
                                                </tr>
                                                <tr>


                                                    {columnVisibility['ServiceDueDate'] && <td >
                                                        <tr className="bold">Due Date</tr>
                                                        <tr className="">{i.ServiceDueDate}</tr>
                                                    </td>}
                                                    {columnVisibility['FANumber'] && <td >
                                                        <tr className="bold">FA Number</tr>
                                                        <tr className="truncateqr2">{i?.FANumber}</tr>
                                                    </td>}
                                                </tr>
                                                <tr>
                                                    {/* {columnVisibility['TestedDate'] && <td colSpan={2} >
                                                        <tr className="bold">Tested Date & Status</tr>
                                                        <tr className="dflex">{i?.TestedDate} (<h3>PASS</h3>)</tr>
                                                    </td>} */}

                                                    {columnVisibility['TestedDate'] && <td >
                                                        <tr className="bold">Tested Date</tr>
                                                        <tr className="">{i?.TestedDate}</tr>
                                                    </td>}
                                                    {columnVisibility['TestStatus'] && <td >
                                                        <tr className="bold">Test Status</tr>
                                                        <tr className=""><h3>PASS</h3></tr>
                                                    </td>}

                                                </tr>
                                            </table>
                                        </div>

                                    </div>
                                </div>
                            </>;
                        } else {
                            return <>
                                <div className="printContainerCable">
                                    <div className="rowQR">
                                        <div className="colQRTh-lg-45">
                                            <div className="dflexQR">
                                                <div className="colQR-lg-10 text-center vcenter scanQR">
                                                    <div className="vtext fsmall mt5"> Scan this QR code for more detail. </div>
                                                </div>
                                                <div className="colQR-lg-70" >
                                                    <img src={i.QRCode} alt="QR Code" className="qrcode" />
                                                </div>
                                                <div className="colQRCB-lg-20">
                                                    <img src={require('../../../assets/images/logo.png')} className="imgroatethermal " alt="QR Code" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="colQRTh-lg-15 text-center vcenter fsmall">
                                            <h3 className="vtext "><FontAwesomeIcon icon="caret-up" /> Caution <FontAwesomeIcon icon="sort-down" /></h3>
                                        </div>
                                        <div className="colQRThCB-lg-40 pt-30 ">
                                            {columnVisibility['SerialNumber'] && <> <div className="fsmall"><b>Serial Number </b></div>
                                                <div className=" truncateqr2 fsmall">{i.SerialNumber}</div>
                                            </>}
                                            {columnVisibility['AsstetName'] && <>
                                                <div className=" mtqr fsmall"><b>Asset Name </b></div>
                                                <div className=" truncateqr2 fsmall">{i.Title}</div>
                                            </>}
                                        </div>

                                    </div>
                                </div >
                            </>;
                        }
                    } else {
                        if (isTestedView) {
                            return <>
                                <div className="printContainerCable">
                                    <div className="rowQR">
                                        <div className="colQRTh-lg-45">
                                            <div className="dflexQR">
                                                <div className="colQR-lg-10 text-center vcenter scanQR">
                                                    <div className="vtext fsmall mt5"> Scan this QR code for more detail. </div>
                                                </div>
                                                <div className="colQR-lg-70" >
                                                    <img src={i.QRCode} alt="QR Code" className="qrcode" />
                                                </div>
                                                <div className="colQRCB-lg-20">
                                                    <img src={require('../../../assets/images/logo.png')} className="imgroatethermal " alt="QR Code" />
                                                </div>

                                            </div >
                                        </div >
                                        <div className="colQRTh-lg-5 text-center dflex  mtm-8 ">
                                            <div className="vtext fsmall"><b> TESTED TO AN/NZS 3760</b>
                                            </div>

                                        </div>
                                        <div className="colQRTh-lg-5 text-center dflex fsmall">
                                            <h3 className="vtext  "><FontAwesomeIcon icon="caret-up" /> Caution <FontAwesomeIcon icon="sort-down" /></h3>

                                        </div>
                                        <div className="colQRThCB-lg-40 pt-30 ">
                                            <table className="fsmall text-left" >
                                                <tr >

                                                    {columnVisibility['SerialNumber'] && <td className="dinline">
                                                        <tr className="bold">Serial No</tr>
                                                        <tr className="truncateqr2">{i.SerialNumber}</tr>
                                                    </td>}
                                                    {columnVisibility['AsstetName'] && <td >
                                                        <tr className="bold">Asset Name</tr>
                                                        <tr className=" truncateqr2">{i.Title}</tr>
                                                    </td>}
                                                </tr>
                                                <tr>


                                                    {columnVisibility['ServiceDueDate'] && <td >
                                                        <tr className="bold">Due Date</tr>
                                                        <tr className="">{i.ServiceDueDate}</tr>
                                                    </td>}
                                                    {columnVisibility['FANumber'] && <td >
                                                        <tr className="bold">FA Number</tr>
                                                        <tr className="truncateqr2">{i?.FANumber}</tr>
                                                    </td>}
                                                </tr>
                                                <tr>
                                                    {/* {columnVisibility['TestedDate'] && <td colSpan={2} >
                                                        <tr className="bold">Tested Date & Status</tr>
                                                        <tr className="dflex">{i?.TestedDate} (<h3>PASS</h3>)</tr>
                                                    </td>} */}
                                                    {columnVisibility['TestedDate'] && <td >
                                                        <tr className="bold">Tested Date</tr>
                                                        <tr className="">{i?.TestedDate}</tr>
                                                    </td>}

                                                    {columnVisibility['TestStatus'] && <td >
                                                        <tr className="bold">Test Status</tr>
                                                        <tr className=""><h3>PASS</h3></tr>
                                                    </td>}

                                                </tr>
                                            </table>
                                        </div>

                                    </div >
                                </div >
                            </>;
                        } else {
                            return <>
                                <div className="printContainerCable">
                                    <div className="rowQR">
                                        <div className="colQRTh-lg-45">
                                            <div className="dflexQR">
                                                <div className="colQR-lg-10 text-center vcenter scanQR">
                                                    <div className="vtext fsmall mt5"> Scan this QR code for more detail. </div>
                                                </div>
                                                <div className="colQR-lg-70" >
                                                    <img src={i.QRCode} alt="QR Code" className="qrcode" />
                                                </div>
                                                <div className="colQRCB-lg-20">
                                                    <img src={require('../../../assets/images/logo.png')} className="imgroatethermal " alt="QR Code" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="colQRTh-lg-15 text-center vcenter fsmall">
                                            <h3 className="vtext "><FontAwesomeIcon icon="caret-up" /> Caution <FontAwesomeIcon icon="sort-down" /></h3>
                                        </div>
                                        <div className="colQRThCB-lg-40 pt-30 ">
                                            {columnVisibility['SerialNumber'] && <> <div className="fsmall"><b>Serial Number </b></div>
                                                <div className=" truncateqr2 fsmall">{i.SerialNumber}</div>
                                            </>}
                                            {columnVisibility['AsstetName'] && <><div className=" mtqr fsmall"><b>Asset Name </b></div>
                                                <div className=" truncateqr2 fsmall">{i.Title}</div>
                                            </>}

                                        </div>

                                    </div>
                                </div>
                            </>;
                        }
                    }
                })
                }
            </div >
        </>;

    };

    const genrateA4AssetSizePrint = () => {
        return <> <div className="dataJustifyBetween mb20 flex-wrap">
            <div className="printQROptions">
                <Label>Print Option:</Label>
                <Checkbox label="Sticker" onChange={_onChangeSticker} checked={isStickerView} />
                <Checkbox label="A4 Printing" onChange={onChangeA4Print} checked={isA4Print} />
            </div>
            <div >
                <DefaultButton className="btn btn-primary"
                    onClick={() => {
                        let fileName = "AssetQRCode"
                        setIsLoading(true)
                        setIsPdfGenerating(true);
                        try {
                            setTimeout(async () => {
                                await generateAndSaveKendoPDFQR("printDiv", fileName, false, true);
                                setIsLoading(false);
                                setIsPdfGenerating(false);
                            }, 500);

                        } catch (error) {
                            setIsPdfGenerating(false);
                            setIsLoading(false);
                            console.log(error);

                        }

                    }}
                >
                    Download
                </DefaultButton>
                <ReactToPrint
                    content={() => CurrentRefthermalPrint.current}
                    pageStyle={pageStyleA4Print}
                    trigger={() => (
                        <DefaultButton className="btn btn-primary" style={{ marginLeft: "5px" }}>
                            Print
                        </DefaultButton>
                    )}
                />
                <DefaultButton className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={() => { setKeyUpdate(Math.random()); setIsPrintQRModelOpent(false); setIsLargeModelView(true); }} >
                    Back
                </DefaultButton>
            </div>
        </div>
            <div id="printDiv" ref={CurrentRefthermalPrint} style={{ width: isPdfGenerating ? printSize : "" }}>
                <div className="a4">
                    <div className={`${isPdfGenerating ? "page-kendo" : "page"}`} >
                        {!!selectetdPrintQRCodeItems && selectetdPrintQRCodeItems?.map((i: any, index: number) => {
                            return <div
                                className={`${isPdfGenerating ? "a4-single-label-kendo keep-together" : "a4-single-label keep-together"} ${(index + 1) % 9 === 0 ? "printA4Break keep-together" : "keep-together"}`}
                            >
                                {/* <div className={`a4-single-label ${(index + 1) % 9 === 0 ? "printContainerBreak" : ""}`} > */}
                                <div className={`${isPdfGenerating ? "a4-single-item-kendo" : "a4-single-item"}`} >
                                    <div><img src={require('../../../assets/images/logo.png')} className="brand-logo" /></div>
                                    <div className="qr-code-outer"><img src={i.QRCode} alt="QR" className={`${isPdfGenerating ? "qr-code-img-kendo" : "qr-code-img"}`} />
                                        <span className="scan-me-label">SCAN ME</span></div>
                                    <div className={`truncate-two-lines ${isPdfGenerating ? "location-qr-text-kendo" : "location-qr-text"}`} >{i.Title}</div>
                                    <div className="breakText">{i?.SerialNumber}</div>
                                    <div className="breakText">{i?.FANumber}</div>

                                </div>
                            </div>

                        })
                        }
                    </div>
                </div>
            </div >
        </>;

    }

    const genrateA4ChemicalSizePrint = () => {
        return <> <div className="dataJustifyBetween mb20 flex-wrap">
            <div className="printQROptions">
                <Label>Print Option:</Label>
                <Checkbox label="Sticker" onChange={_onChangeSticker} checked={isStickerView} />
                <Checkbox label="A4 Printing" onChange={onChangeA4Print} checked={isA4Print} />
            </div>
            <div >
                <DefaultButton className="btn btn-primary"
                    onClick={() => {
                        let fileName = "ChemicalQRCode"
                        setIsLoading(true)
                        setIsPdfGenerating(true);
                        try {
                            setTimeout(async () => {
                                await generateAndSaveKendoPDFQR("printDiv", fileName, false, true);
                                setIsLoading(false);
                                setIsPdfGenerating(false);
                            }, 500);

                        } catch (error) {
                            setIsPdfGenerating(false);
                            setIsLoading(false);
                            console.log(error);

                        }

                    }}
                >
                    Download
                </DefaultButton>
                <ReactToPrint
                    content={() => CurrentRefthermalPrint.current}
                    pageStyle={pageStyleA4Print}
                    trigger={() => (
                        <DefaultButton className="btn btn-primary" style={{ marginLeft: "5px" }}>
                            Print
                        </DefaultButton>
                    )}
                />
                <DefaultButton className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={() => { setKeyUpdate(Math.random()); setIsPrintQRModelOpent(false); setIsLargeModelView(true); }} >
                    Back
                </DefaultButton>
            </div>
        </div>
            <div id="printDiv" ref={CurrentRefthermalPrint} style={{ width: isPdfGenerating ? printSize : "" }}>
                <div className="a4">
                    <div className={`${isPdfGenerating ? "page-kendo" : "page"}`} >
                        {!!selectetdPrintQRCodeItems && selectetdPrintQRCodeItems?.map((i: any, index: number) => {
                            return <div
                                className={`${isPdfGenerating ? "a4-single-label-kendo keep-together" : "a4-single-label keep-together"} ${(index + 1) % 9 === 0 ? "printA4Break keep-together" : "keep-together"}`}
                            >
                                {/* <div className={`a4-single-label ${(index + 1) % 9 === 0 ? "printContainerBreak" : ""}`} > */}
                                <div className={`${isPdfGenerating ? "a4-single-item-kendo" : "a4-single-item"}`} >
                                    <div><img src={require('../../../assets/images/logo.png')} className="brand-logo" /></div>
                                    <div className="qr-code-outer"><img src={i.QRCodeUrl} alt="QR" className={`${isPdfGenerating ? "qr-code-img-kendo" : "qr-code-img"}`} />
                                        <span className="scan-me-label">SCAN ME</span></div>
                                    <div className={`truncate-two-lines ${isPdfGenerating ? "location-qr-text-kendo" : "location-qr-text"}`} >{i.Title}</div>
                                    {/* <div className="">{i?.SerialNumber}</div> */}
                                </div>
                            </div>

                        })
                        }
                    </div>
                </div>
            </div >
        </>;

    }

    // const genrateA4ChemicalSizePrint = () => {
    //     return <> <div className="dataJustifyBetween mb20 flex-wrap">
    //         <div className="printQROptions">
    //             <Label>Print Option:</Label>
    //             <Checkbox label="Sticker" onChange={_onChangeSticker} checked={isStickerView} />
    //             <Checkbox label="A4 Printing" onChange={onChangeA4Print} checked={isA4Print} />
    //         </div>
    //         <div >
    //             {/* <DefaultButton className="btn btn-primary"

    //                 onClick={() => {
    //                     let fileName = "AssetQRCode"
    //                     setIsLoading(true)
    //                     setIsPdfGenerating(true);
    //                     try {
    //                         setTimeout(async () => {
    //                             await generateAndSaveKendoPDFQR("printDiv", fileName, false, true);
    //                             setIsLoading(false);
    //                             setIsPdfGenerating(false);
    //                         }, 500);

    //                     } catch (error) {
    //                         setIsPdfGenerating(false);
    //                         setIsLoading(false);
    //                         console.log(error);

    //                     }

    //                 }}
    //             >
    //                 Download
    //             </DefaultButton> */}
    //             <ReactToPrint
    //                 content={() => CurrentRefthermalPrint.current}
    //                 pageStyle={pageStyleA4Print}
    //                 trigger={() => (
    //                     <DefaultButton className="btn btn-primary" style={{ marginLeft: "5px" }}>
    //                         Print
    //                     </DefaultButton>
    //                 )}
    //             />
    //             <DefaultButton className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={() => { setKeyUpdate(Math.random()); setIsPrintQRModelOpent(false); setIsLargeModelView(true); }} >
    //                 Back
    //             </DefaultButton>
    //         </div>
    //     </div>
    //         <div id="printDiv" ref={CurrentRefthermalPrint} style={{ width: isPdfGenerating ? printSize : "" }}>
    //             <div className="a4">
    //                 <div className="page">
    //                     {!!selectetdPrintQRCodeItems && selectetdPrintQRCodeItems?.map((i: any, index: number) => {
    //                         return <div
    //                             className={`a4-single-label ${(index + 1) % 9 === 0 ? "printA4Break" : ""}`}
    //                         >
    //                             {/* <div className={`a4-single-label ${(index + 1) % 9 === 0 ? "printContainerBreak" : ""}`} > */}
    //                             <div className="a4-single-item">
    //                                 <div><img src={require('../../../assets/images/logo.png')} className="brand-logo" /></div>
    //                                 <div><img src={i.QRCodeUrl} alt="QR" className="qr-code-img" /></div>
    //                                 <div className="location-qr-text truncate-two-lines">{i?.Title}</div>
    //                                 {/* <div className="">{i?.SerialNumber}</div> */}
    //                             </div>
    //                         </div>

    //                     })
    //                     }
    //                 </div>
    //             </div>
    //         </div >
    //     </>;

    // }

    const genrateThermalPrintChemical = () => {
        return <> <div className="dataJustifyBetween mb20 flex-wrap">
            {/* <Toggle label="Cable Print ? "
                onText="On" offText="Off"
                defaultChecked={isCableView}
                onChange={_onChangeCable} /> */}
            <div className="printQROptions">
                <Label>Print Option:</Label>
                <Checkbox label="Sticker" onChange={_onChangeSticker} checked={isStickerView} />
                <Checkbox label="Cable" onChange={_onChangeCable} checked={isCableView} />
                <Checkbox label="A4 Printing" onChange={onChangeA4Print} checked={isA4Print} />
            </div>
            <div >
                <ReactToPrint
                    content={() => CurrentRefthermalPrint.current}
                    pageStyle={pageStyleThermalPrint}
                    trigger={() => (
                        <DefaultButton className="btn btn-primary">
                            Print
                        </DefaultButton>
                    )}
                />
                <DefaultButton className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={() => { setKeyUpdate(Math.random()); setIsPrintQRModelOpent(false); setIsLargeModelView(true); }} >
                    Back
                </DefaultButton>
            </div>
        </div>
            <div id="printDiv" ref={CurrentRefthermalPrint}>
                {!!selectetdPrintQRCodeItems && selectetdPrintQRCodeItems?.map((i: any, index: number) => {
                    if (isEven(index + 1)) {
                        return <>
                            <div className="printContainerBreak">
                                <div className="rowQR">
                                    <div className="colQRTh-lg-4">
                                        <div className="dflexQR">
                                            <div >
                                                <div>
                                                    <img src={require('../../../assets/images/logo.png')} className="imgroatethermal ml-10" alt="QR Code" />
                                                </div>
                                                <img src={i.QRCodeUrl} alt="QR Code" className="qrcode" />

                                            </div>
                                        </div>
                                    </div>
                                    <div className="colQRTh-lg-6">
                                        {columnVisibility['ChemicalName'] && <><div className="text-left"><b>Chemical Name </b></div>
                                            <div className="text-left truncateqr2">{i.Title}</div>
                                        </>}
                                        {columnVisibility['ExpirationDate'] && <>
                                            <div className="text-left mtqr"><b>Expiration Date </b></div>
                                            <div className="text-left truncateqr2">{i.ExpirationDate}</div>
                                        </>}
                                        {columnVisibility['Hazardous'] && <>
                                            <div className="text-left"><b>Hazardous </b></div>
                                            <div className="text-left truncateqr2">{i.Hazardous}</div>
                                        </>}
                                        {columnVisibility['PH'] && <>
                                            <div className="text-left"><b>PH </b></div>
                                            <div className="text-left truncateqr2">{i.pH}</div>
                                        </>}


                                    </div>
                                    <div className="colQRTh-lg-12">
                                        <div className="text-center">Scan this QR code for more detail.</div>
                                    </div>
                                </div>
                            </div>
                        </>;

                    } else {
                        return <>
                            <div className="printContainer">
                                <div className="rowQR">
                                    <div className="colQRTh-lg-4">
                                        <div className="dflexQR">
                                            <div >
                                                <div>
                                                    <img src={require('../../../assets/images/logo.png')} className="imgroatethermal ml-10" alt="QR Code" />
                                                </div>
                                                <img src={i.QRCodeUrl} alt="QR Code" className="qrcode" />

                                            </div>
                                        </div>
                                    </div>
                                    <div className="colQRTh-lg-6">
                                        {columnVisibility['ChemicalName'] && <>  <div className="text-left"><b>Chemical Name </b></div>
                                            <div className="text-left truncateqr2">{i.Title}</div>
                                        </>}
                                        {columnVisibility['ExpirationDate'] && <>
                                            <div className="text-left mtqr"><b>Expiration Date </b></div>
                                            <div className="text-left truncateqr2">{i.ExpirationDate}</div>
                                        </>}
                                        {columnVisibility['Hazardous'] && <>
                                            <div className="text-left"><b>Hazardous </b></div>
                                            <div className="text-left truncateqr2">{i.Hazardous}</div>
                                        </>}
                                        {columnVisibility['PH'] && <>
                                            <div className="text-left"><b>PH </b></div>
                                            <div className="text-left truncateqr2">{i.pH}</div>
                                        </>}

                                    </div>
                                    <div className="colQRTh-lg-12">
                                        <div className="text-center">Scan this QR code for more detail.</div>
                                    </div>
                                </div>
                            </div>
                        </>;


                    }

                })
                }
            </div>
        </>;

    };

    const genrateThermalPrintChemicalCableView = () => {
        return <> <div className="dataJustifyBetween mb20 flex-wrap">

            <div className="printQROptions">
                <Label>Print Option:</Label>
                <Checkbox label="Sticker" onChange={_onChangeSticker} checked={isStickerView} />
                <Checkbox label="Cable" onChange={_onChangeCable} checked={isCableView} />
                <Checkbox label="A4 Printing" onChange={onChangeA4Print} checked={isA4Print} />
            </div>

            <div >
                <ReactToPrint
                    content={() => CurrentRefthermalPrint.current}
                    pageStyle={pageStyleThermalPrint}
                    trigger={() => (
                        <DefaultButton className="btn btn-primary">
                            Print
                        </DefaultButton>
                    )}
                />
                <DefaultButton className="btn btn-danger" style={{ marginLeft: "5px" }} onClick={() => { setKeyUpdate(Math.random()); setIsPrintQRModelOpent(false); setIsLargeModelView(true); }} >
                    Back
                </DefaultButton>
            </div>
        </div>
            <div id="printDiv" ref={CurrentRefthermalPrint}>
                {!!selectetdPrintQRCodeItems && selectetdPrintQRCodeItems?.map((i: any, index: number) => {
                    if (isEven(index + 1)) {

                        return <>
                            <div className="printContainerCable">
                                <div className="rowQR">
                                    <div className="colQRTh-lg-45">
                                        <div className="dflexQR">
                                            <div className="colQR-lg-10 text-center vcenter scanQR">
                                                <div className="vtext fsmall mt5"> Scan this QR code for more detail. </div>
                                            </div>
                                            <div className="colQR-lg-70" >
                                                <img src={i.QRCodeUrl} alt="QR Code" className="qrcode" />
                                            </div>
                                            <div className="colQRCB-lg-20">
                                                <img src={require('../../../assets/images/logo.png')} className="imgroatethermal " alt="QR Code" />
                                            </div>

                                        </div>
                                    </div>
                                    <div className="colQRTh-lg-5 text-center dflex fsmall">
                                        <h3 className="vtext  "><FontAwesomeIcon icon="caret-up" /> Caution <FontAwesomeIcon icon="sort-down" /></h3>
                                    </div>
                                    <div className="colQRThCB-lg-40 pt-30 ">
                                        <table className="fsmall text-left" >
                                            <tr >
                                                {columnVisibility['ChemicalName'] && <td className="dinline">
                                                    <tr className="bold">Chemical Name</tr>
                                                    <tr className="truncateqr2">{i.Title}</tr>
                                                </td>}
                                                {columnVisibility['ExpirationDate'] && <td>
                                                    <tr className="bold">Expiration Date</tr>
                                                    <tr className="truncateqr2">{i.ExpirationDate}</tr>

                                                </td>}
                                            </tr>
                                            <tr >
                                                {columnVisibility['Hazardous'] && <td >
                                                    <tr className="bold">Hazardous</tr>
                                                    <tr className="truncateqr2">{i.Hazardous}</tr>
                                                </td>}
                                                {columnVisibility['PH'] && <td>
                                                    <tr className="bold">PH</tr>
                                                    <tr className="truncateqr2">{i.pH}</tr>

                                                </td>}
                                            </tr>
                                        </table>
                                    </div>

                                </div>
                            </div >
                        </>;

                    } else {

                        return <>
                            <div className="printContainerCable">
                                <div className="rowQR">
                                    <div className="colQRTh-lg-45">
                                        <div className="dflexQR">
                                            <div className="colQR-lg-10 text-center vcenter scanQR">
                                                <div className="vtext fsmall mt5"> Scan this QR code for more detail. </div>
                                            </div>
                                            <div className="colQR-lg-70" >
                                                <img src={i.QRCodeUrl} alt="QR Code" className="qrcode" />
                                            </div>
                                            <div className="colQRCB-lg-20">
                                                <img src={require('../../../assets/images/logo.png')} className="imgroatethermal " alt="QR Code" />
                                            </div>

                                        </div>
                                    </div>
                                    <div className="colQRTh-lg-5 text-center dflex fsmall">
                                        <h3 className="vtext  "><FontAwesomeIcon icon="caret-up" /> Caution <FontAwesomeIcon icon="sort-down" /></h3>
                                    </div>
                                    <div className="colQRThCB-lg-40 pt-30 ">
                                        <table className="fsmall text-left" >
                                            <tr >
                                                {columnVisibility['ChemicalName'] && <td className="dinline">
                                                    <tr className="bold">Chemical Name</tr>
                                                    <tr className="truncateqr2">{i.Title}</tr>
                                                </td>}
                                                {columnVisibility['ExpirationDate'] && <td>
                                                    <tr className="bold">Expiration Date</tr>
                                                    <tr className="truncateqr2">{i.ExpirationDate}</tr>

                                                </td>}
                                            </tr>
                                            <tr >
                                                {columnVisibility['Hazardous'] && <td >
                                                    <tr className="bold">Hazardous</tr>
                                                    <tr className="truncateqr2">{i.Hazardous}</tr>
                                                </td>}
                                                {columnVisibility['PH'] && <td>
                                                    <tr className="bold">PH</tr>
                                                    <tr className="truncateqr2">{i.pH}</tr>

                                                </td>}
                                            </tr>
                                        </table>
                                    </div>

                                </div>
                            </div >
                        </>;

                    }

                })
                }
            </div >
        </>;

    };




    const _onIsSelectedRenderHeader = (detailsHeaderProps: IDetailsColumnProps) => {
        return <>
            <Checkbox
                label=""
                defaultChecked={headerChekbox.current}
                onChange={(ev: any, checked: boolean) => {
                    headerChekbox.current = checked;
                    let allItems = updateProjectMDL(itemsref.current, "SelectAll", checked);
                    itemsref.current = allItems;
                    if (allItems) {
                        setItems(allItems);
                        setIsRender(true);
                        setKeyUpdate(Math.random());
                    }
                }}
            />
        </>;
    };

    const onIsSelectedRender = (item: any) => {
        return <Checkbox
            defaultChecked={item.isPrintQrCode}
            onChange={(ev?: any, checked?: boolean) => {

                let data = itemsref.current.map((r: any) => ({ ...r, isPrintQrCode: item.ID == r.ID ? checked : r.isPrintQrCode }));
                itemsref.current = data;

                let propsItemsUpdate: any[] = []
                propsItemsUpdate = propsItems.current.map((r: any) => ({ ...r, isPrintQrCode: item.ID == r.ID ? checked : r.isPrintQrCode }));
                // setPropsItems(propsItemsUpdate);
                propsItems.current = propsItemsUpdate;
                setIsRender(true);
                setItems(data);
                setKeyUpdate(Math.random());
                let AllItemData = allItems.map((r: any) => ({ ...r, isPrintQrCode: item.ID == r.ID ? checked : r.isPrintQrCode }));
                setAllItems(AllItemData);

            }}
        />;
    };
    const genrateTheColumnasset = () => {
        const column = [
            {
                key: 'IsSelected', name: ' ', fieldName: 'isPrintQrCode', minWidth: 5, maxWidth: 5, isRowHeader: true, isResizable: true, data: 'string', isPadded: true,
                onRenderHeader: _onIsSelectedRenderHeader,
                onRender: onIsSelectedRender
            },
            {
                key: 'Photo', name: 'Photo', fieldName: 'AssetPhotoThumbnailUrl', minWidth: 110, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => {
                    return (
                        <img src={item.AssetPhotoThumbnailUrl} height="75px" width="75px" className="course-img-first" />
                    );
                }
            },
            {
                key: "key1", name: 'Name', fieldName: 'Title', isResizable: true, minWidth: 100, maxWidth: 150,
            },
            { key: "key2", name: 'Manufacturer', fieldName: 'Manufacturer', isResizable: true, minWidth: 100, maxWidth: 150 },
            { key: "key3", name: 'Model', fieldName: 'Model', isResizable: true, minWidth: 100, maxWidth: 150 },
            { key: "key4", name: 'Asset Type', fieldName: 'AssetType', isResizable: true, minWidth: 70, maxWidth: 150, },
            { key: "key5", name: 'Color', fieldName: 'QCColor', isResizable: true, minWidth: 60, maxWidth: 100 },
            { key: "key6", name: 'Status', fieldName: 'Status', isResizable: true, minWidth: 70, maxWidth: 100, },
            { key: "key7", name: 'Price', fieldName: 'PurchasePrice', isResizable: true, minWidth: 60, maxWidth: 100, },
            // { key: "key8", name: 'Service Due Date', fieldName: 'ServiceDueDate', isResizable: true, minWidth: 120, maxWidth: 150, },
            {
                key: 'key8', name: 'Service Due Date', fieldName: 'ServiceDueDate', minWidth: 120, maxWidth: 160,
                onRender: ((itemID: any) => {
                    let isDueDate: boolean = false;
                    if (!!itemID.DueDate) {
                        isDueDate = isWithinNextMonthRange(itemID.fullServiceDueDate);
                    }
                    return <>
                        <div className='dflex'>
                            {(isDueDate) &&
                                <div className="redBadgeact badge-mar-o">{itemID.ServiceDueDate}</div>

                            }
                        </div ></>;
                })
            },
            {
                key: "key9", name: 'Serial Number', fieldName: 'SerialNumber', isResizable: true, minWidth: 100, maxWidth: 100,
            }

        ];
        return column;
    };

    const genrateAssignedchecmical = () => {
        let column: any[] = [
            { key: 'IsSelected', name: ' ', fieldName: 'isPrintQrCode', minWidth: 5, maxWidth: 5, isRowHeader: true, isResizable: true, data: 'string', isPadded: true, onRenderHeader: _onIsSelectedRenderHeader, onRender: onIsSelectedRender },
            {
                key: 'Photo', name: 'Photo', fieldName: 'ProductPhotoThumbnailUrl', minWidth: 110, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => {
                    return (
                        <img src={item.ProductPhotoThumbnailUrl} height="75px" width="110px" className="course-img-first" />
                    );
                }
            },
            { key: "key1", name: 'Chemical', fieldName: 'Title', isResizable: true, minWidth: 170, maxWidth: 240, isSortingRequired: true },
            { key: "key3", name: 'pH', fieldName: 'pH', isResizable: true, minWidth: 40, maxWidth: 70, isSortingRequired: true },
            { key: "key4", name: 'Hazardous', fieldName: 'Hazardous', isResizable: true, minWidth: 40, maxWidth: 70 },
        ];
        return column;
    };

    const genrateColumnChemical = () => {
        let column: any[] = [
            { key: 'IsSelected', name: ' ', fieldName: 'isPrintQrCode', minWidth: 5, maxWidth: 5, isRowHeader: true, isResizable: true, data: 'string', isPadded: true, onRenderHeader: _onIsSelectedRenderHeader, onRender: onIsSelectedRender },
            {
                key: "key0", name: 'Chemical Photo', fieldName: 'ProductPhotoThumbnailUrl', isResizable: true, minWidth: 100, maxWidth: 150, className: 'courseimg-column',
                onRender: (item: any) => (
                    !!item.ProductPhoto ?
                        <img src={!!item.ProductPhotoThumbnailUrl ? item.ProductPhotoThumbnailUrl : require('../../../assets/images/imgalt.svg')} alt="Product Photo" className="course-img-first" style={{ width: '110px', height: '65px' }} /> :
                        <FontAwesomeIcon style={{ width: '65px', height: '65px' }}
                            icon={"image"}
                        // height={100}
                        />
                ),
            },
            { key: "key1", name: 'Chemical Name', fieldName: 'Title', isResizable: true, minWidth: 140, maxWidth: 170, },
            { key: "key2", name: 'Manufacturer', fieldName: 'Manufacturer', isResizable: true, minWidth: 100, maxWidth: 150, },
            { key: "key3", name: 'SDS Date', fieldName: 'SDSDate', isResizable: true, minWidth: 90, maxWidth: 100, },
            {
                key: "key5", name: 'Hazardous', fieldName: 'Hazardous', isResizable: true, minWidth: 70, maxWidth: 100,
                onRender: (item: any) => {
                    let badgeClass = '';
                    if (item.Hazardous === "YES") {
                        badgeClass = 'redBadge mw-50 badge';
                    }
                    else {
                        badgeClass = 'greenBadge mw-50 badge truncate';
                    }
                    return (
                        <>
                            <div className={badgeClass}>
                                {item.Hazardous}
                            </div>
                        </>
                    );
                },
            },
            {
                key: "key6", name: 'Has Class', fieldName: 'HazClass', isResizable: true, minWidth: 110, maxWidth: 110,
                onRender: (item: any) => {
                    const divItems = Array.isArray(item.HazClass) && item.HazClass.map((option: any, index: number) => (
                        <div key={index} className='greenBadge badge truncate'>
                            {option}
                        </div>
                    ));
                    return (<>{divItems}</>);
                },
            },
            // { key: "key7", name: 'Storage Req.', fieldName: 'StorageRequest', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            {
                key: "key7", name: 'Storage Req.', fieldName: 'StorageRequest', isResizable: true, minWidth: 200, maxWidth: 200,
                onRender: (item: any) => {
                    if (item.StorageRequest != null) {
                        return (
                            <>
                                <Link className="tooltipcls">
                                    {item.StorageRequest.length > 75 ? `${item.StorageRequest.slice(0, 75)}...` : item.StorageRequest}
                                </Link>
                            </>
                        );
                    } else {
                        <Link className="tooltipcls">
                            {item.StorageRequest}
                        </Link>;
                    }
                },
            },
            { key: "key8", name: 'pH', fieldName: 'pH', isResizable: true, minWidth: 30, maxWidth: 100, isSortingRequired: true },
        ];
        return column;
    };

    const searchFilterData = (data: any, searchText: any) => {
        setSearchText(searchText);
        if (!!searchText) {
            itemsref.current = data;
            setItems(data);
            setKeyUpdate(Math.random);
            setIsRender(true);

        } else {
            if (propsItems.current) {
                itemsref.current = propsItems.current;
                setItems(propsItems.current);
                setKeyUpdate(Math.random);
                // setIsRender(true);
            } else {
                itemsref.current = props.items;
                setItems(!!props.items ? props.items : []);
                setKeyUpdate(Math.random);
            }

        }

    }

    const selectionGridRender = () => {
        const sortedItems = items.sort((a, b) => {
            return (a.isPrintQrCode === b.isPrintQrCode) ? 0 : a.isPrintQrCode ? -1 : 1;
        });
        const sortedallItems = allItems.sort((a, b) => {
            return (a.isPrintQrCode === b.isPrintQrCode) ? 0 : a.isPrintQrCode ? -1 : 1;
        });
        const grid = < MemoizedDetailList
            allData={sortedallItems}
            searchText={searchText}
            key={keyUpdate}
            onSelectedItem={_onItemSelected}
            items={sortedItems}
            _onSearchTextChangeForExcel={searchFilterData}
            isAddNew={true}
            addNewContent={<PrimaryButton disabled={items.filter(r => r.isPrintQrCode).length == 0} className={items.filter(r => r.isPrintQrCode).length == 0 ? "formtoggle" : "btn btn-primary formtoggle"} onClick={() => {
                setIsPrintQRModelOpent(true);
                setIsthermalPrint(true);
                setIsLargeModelView(false);
                setSelectetdPrintQRCodeItems(items.filter(r => r.isPrintQrCode));

            }} text="Print" />}
            searchable={true}
            reRenderComponent={isRender}
            isContainerHeightDisable={true}
            columns={selectionGrid as any}
            manageComponentView={props.manageComponentView}
            pageLength={(!!props.items && props.items.length > 0) ? 50 : 10}
        />;
        return grid;
    };

    React.useEffect(() => {
        if (props.isDetailView) {
            setIsthermalPrint(true);
            setIsSelctionModeOpen(false);
            setIsRender(true);
            if (props.items) {
                setItems(props.items);
                setKeyUpdate(Math.random());
                setIsPrintQRModelOpent(true);
                setSelectetdPrintQRCodeItems(props.items);
            }
        }

    }, [props.isDetailView]);

    React.useEffect(() => {
        let column: any[] = [];
        if (props.isAssetQR) {
            column = genrateTheColumnasset();

        }
        if (props.isChemicalQR) {
            column = genrateColumnChemical();
        }

        if (props.isAssociatedChemical) {
            column = genrateAssignedchecmical();
        }

        if (!!props.items && props.items?.length > 0) {
            let items = props.items.map(r => ({ ...r, isPrintQrCode: false }));
            itemsref.current = items;
            setItems(items);
        }
        setSelectionGrid(column);
        GenratedPrint.current = selectionGridRender();
        if (props.isDetailView) {
            setIsSelctionModeOpen(false);
        } else {
            setIsSelctionModeOpen(true);
        }

    }, [isSelctionModeOpen]);

    const onClickCloseSelectionItems = () => {
        setIsSelctionModeOpen(false);
        props.onClickClose();

    };
    const onClickClosePrintModel = () => {

        setIsPrintQRModelOpent(false); setIsSelctionModeOpen(true);

    };
    React.useMemo(() => {
        GenratedPrint.current = selectionGridRender();
    }, [keyUpdate]);



    React.useMemo(() => {
        if (isPrintQRModelOpent) {
            if (props.isAssetQR) {
                if (isCableView) {
                    GenratedPrint.current = genrateThermalPrintAssetCableView();
                } else if (isA4Print) {
                    GenratedPrint.current = genrateA4AssetSizePrint()
                }
                else {
                    GenratedPrint.current = genrateThermalPrintAsset();
                }
                setIsPrintQRModelOpent(true);

            }
            if (props.isChemicalQR) {
                if (isCableView) {
                    GenratedPrint.current = genrateThermalPrintChemicalCableView();
                } else if (isA4Print) {
                    GenratedPrint.current = genrateA4ChemicalSizePrint()
                }
                else {
                    GenratedPrint.current = genrateThermalPrintChemical();
                }
                setIsPrintQRModelOpent(true);
            }
        }
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else if (isA4Print) {
            setWidth("800px");
        } else {
            setWidth("800px")
        }

    }, [isAciveLandScape, isPrintQRModelOpent, isthermalPrint, isCableView, isTestedView, isA4Print, isStickerView, isPdfGenerating]);



    return <>
        {isPrintQRModelOpent && <Modal
            titleAriaId={"titleId"}
            isOpen={isPrintQRModelOpent}
            onDismiss={() => onClickClosePrintModel()}
            isBlocking={false}
            isModeless={true}
            isDarkOverlay={true}
            containerClassName={contentStyles.container}
        >
            <div className={contentStyles.header}>
                <h2 className={contentStyles.heading} id={"titleId"}>
                    Print
                </h2>
                <IconButton
                    styles={iconButtonStyles}
                    iconProps={cancelIcon}
                    ariaLabel="Close popup modal"
                    onClick={() => onClickClosePrintModel()}
                />
            </div>
            <div className={contentStyles.body}>
                <p>
                    {GenratedPrint.current}
                </p>

            </div>
        </Modal >
        }

        {
            isSelctionModeOpen && <Modal
                titleAriaId={"titleId"}
                isOpen={isSelctionModeOpen}
                onDismiss={() => onClickCloseSelectionItems()}
                isBlocking={false}
                isModeless={true}
                isDarkOverlay={true}
                containerClassName={contentStyles.container}
            >
                <div className={contentStyles.header}>
                    <h2 className={contentStyles.heading} id={"titleId"}>
                        Select QR code to print
                    </h2>
                    <IconButton
                        styles={iconButtonStyles}
                        iconProps={cancelIcon}
                        ariaLabel="Close popup modal"
                        onClick={() => onClickCloseSelectionItems()}
                    />
                </div>
                {isLoading && <Loader />}
                <div className={contentStyles.body}>
                    {GenratedPrint.current}
                </div>
            </Modal>
        }



    </>;


};