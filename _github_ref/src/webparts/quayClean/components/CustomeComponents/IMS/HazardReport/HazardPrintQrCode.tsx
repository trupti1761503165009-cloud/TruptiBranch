import * as React from "react";
import { DefaultButton, FontWeights, IButtonStyles, IIconProps, IconButton, Modal, getTheme, mergeStyleSets, } from "@fluentui/react";
import { useRef } from "react";
import ReactToPrint from "react-to-print";
import { HazardViewFields } from "../../../../../../Common/Enum/HazardFields";
const qcLogo = require('../../../../assets/images/hazardImages/hazard_qc-logo-long.png');
import html2canvas from "html2canvas";
import { Loader } from "../../../CommonComponents/Loader";
import { useAtomValue } from "jotai";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
export interface IPrintQrCodeProps {
    isHazardQrModelOpen?: any;
    onClickClose(): any;
    HazardQRImage?: any;
    siteName: any;
    // manageComponentView(componentName: any): any;
}

// const pageStyleThermalPrint = `

// @media print {
//     @page {
//         size:  4in 4in;
//         margin: 0 auto;
//         sheet-size: 300px 250mm portrait;
//     }

//     html,
//     body {
//         margin: 0;
//         padding: 0
//     }

//   .qrcode {
//     width: 130px !important;
//     display: flex;
// }
// }
//       `;

const pageStyleThermalPrint = `
  .print-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
      width: 100%;
  }

  .print-container .card {
      background: #fff;
      border: 1px solid #000;
      border-radius: 0;
      box-sizing: border-box;
      height: 350px;
      overflow: hidden;
      padding: 20px;
      text-align: center;
      width: 312px;
  }

  .print-container .title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 0;
  }

  .print-container .qrcode-box {
      height: 220px;
      width: 220px;
      margin: 0 auto;
  }

  .print-container .subtitle {
      color: #1300a6;
      font-size: 20px;
      font-weight: 700;
      margin-top: 10px;
  }

  .print-container .qc-logo-img {
      height: 40px;
      max-width: 100%;
  }

  @media print {
      @page {
          size: 4in 4in;
          margin: 0;
      }

      html, body {
          margin: 0;
          padding: 0;
      }

      .qrcode-box img {
          width: 100%;
          height: 100%;
          border-radius: 10px;
          object-fit: contain;
      }

      .text-center {
          text-align: center !important;
          font-size: small !important;
      }
  }
`;

export const HazardPrintQrCode = (props: IPrintQrCodeProps) => {
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const printRef = useRef<HTMLDivElement>(null);
    const downloadRef = useRef<HTMLDivElement>(null);
    const [modalWidth, setModalWidth] = React.useState("500px");
    const [isLoading, setIsLoading] = React.useState(false);
    const theme = getTheme();

    React.useEffect(() => {
        const handleResize = () => {
            setModalWidth(window.innerWidth <= 768 ? "90%" : "500px");
        };
        handleResize(); // Initial
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const contentStyles = mergeStyleSets({
        container: {
            display: 'flex',
            flexFlow: 'column nowrap',
            alignItems: 'stretch',
            width: modalWidth
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

    const handleDownloadQrImage = async () => {
        if (downloadRef.current) {
            setIsLoading(true);
            const element = downloadRef.current;
            const canvas = await html2canvas(element, {
                // scale: 3,
                useCORS: true,
            });
            const dataUrl = canvas.toDataURL("image/png");

            const now = new Date();
            const time = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
            // const siteName = props.siteName.replace(/\s+/g, '');
            const siteName = (selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails?.defaultSelectedSites?.[0]?.SiteName : props.siteName)?.replace(/\s+/g, '');
            const link = document.createElement("a");
            link.href = dataUrl;
            link.download = `${siteName}_HazardQRCode_${time}.png`;
            link.click();
            setIsLoading(false);
        }
    };

    return (
        <div>
            {isLoading && <Loader />}
            <Modal
                titleAriaId="titleId"
                isOpen={!!props.isHazardQrModelOpen}
                onDismiss={props.onClickClose}
                isBlocking={true}
                isModeless={false}
                isDarkOverlay={true}
                containerClassName={contentStyles.container}
            >
                <div className={contentStyles.header}>
                    <h2 className={contentStyles.heading} id="titleId">Print</h2>
                    <IconButton
                        styles={iconButtonStyles}
                        iconProps={cancelIcon}
                        ariaLabel="Close popup modal"
                        onClick={props.onClickClose}
                    />
                </div>
                <div className={contentStyles.body}>
                    <div>
                        <div className="print-container" id="HazardQRCode" ref={printRef}>
                            <div className="card" ref={downloadRef}>
                                <div className="title">
                                    <img src={qcLogo} alt="Logo" className="qc-logo-img qclogoims" />
                                </div>

                                <div className="qrcode-box">
                                    <img src={props.HazardQRImage} alt="QR Code" className="qclogoims" />
                                </div>
                                <div className="subtitle">{HazardViewFields.LogoTitle}</div>

                            </div>
                        </div>
                        <div className="dataJustifyBetween mt-2 flex-wrap" style={{ justifyContent: "flex-end", display: "flex" }}>
                            <div>
                                <ReactToPrint
                                    content={() => printRef.current}
                                    pageStyle={pageStyleThermalPrint}
                                    trigger={() => (
                                        <DefaultButton className="btn btn-primary">
                                            Print
                                        </DefaultButton>
                                    )}
                                />
                                <DefaultButton
                                    className="btn btn-primary"
                                    style={{ marginLeft: "5px" }}
                                    onClick={handleDownloadQrImage}>
                                    Download
                                </DefaultButton>
                                <DefaultButton
                                    className="btn btn-danger"
                                    style={{ marginLeft: "5px" }}
                                    onClick={props.onClickClose}
                                >
                                    Close
                                </DefaultButton>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>

    );

};