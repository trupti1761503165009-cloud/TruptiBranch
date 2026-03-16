/* eslint-disable  */
import * as React from "react";
import { Checkbox, DefaultButton, FontWeights, IButtonStyles, IIconProps, IconButton, Modal, TextField, Toggle, getTheme, mergeStyleSets, } from "@fluentui/react";
import { useRef } from "react";
import ReactToPrint from "react-to-print";
import { generateAndSaveKendoPDFPrint } from "../../../../../../Common/Util";
import { Loader } from "../../../CommonComponents/Loader";
import { ClientResponseViewFields } from "../ClientResponseFields";

export interface IPrintQrCodeProps {
    provider: any;
    selectedItems?: any;
    onClickClose(): any;
    siteName: any;
}

const qcLogo = require('../../../../assets/images/hazardImages/hazard_qc-logo-long.png');
const pageStyleThermalPrint = `

@media print {
    @page {
        size:  4in 4in;
        margin: 0 auto;
        sheet-size: 300px 250mm portrait;
    }

    html,
    body {
        margin: 0;
        padding: 0
    }

     .print-option {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        padding: 0;
    }

    .print-option .card {
        width: 30% !important;
        margin-bottom: 20px;
        page-break-inside: avoid; /* prevent card from splitting across pages */
        box-sizing: border-box;
    }

    /* Force new page after every 3 cards */
    // .print-option .card:nth-child(3n) {
    //     page-break-after: always;
    // }

    body {
        -webkit-print-color-adjust: exact; /* prints background colors correctly */
    }

    .btn, .no-print {
        display: none !important;
    }

}
      `;

export const PrintMultipleQrCode = (props: IPrintQrCodeProps) => {

    const printRef = useRef<HTMLDivElement>(null);
    const [modalWidth, setModalWidth] = React.useState("1050px");
    const [isLoading, setIsLoading] = React.useState(false);
    const [selected, setSelected] = React.useState({
        siteName: true,
        siteArea: true
    });
    const [isLandscap, setIsLandScap] = React.useState<any>(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
    const [customTitle, setCustomTitle] = React.useState<string>("");

    const theme = getTheme();

    React.useEffect(() => {
        const handleResize = () => {
            setModalWidth(window.innerWidth <= 768 ? "90%" : "1050px");
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
            overflowY: 'auto',
            maxHeight: '80vh',
            paddingBottom: '0px',
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

    const onclickPDFDownload = async () => {
        setIsLoading(true);
        setIsGeneratingPDF(true);

        setTimeout(async () => {
            const now = new Date();
            const currentTime = `${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}`;
            const fileName = `${props.siteName}_QRCodes_${currentTime}`;
            await generateAndSaveKendoPDFPrint("MultipleQRCodes", fileName, false, true, !isLandscap);
            setIsGeneratingPDF(false);
            setIsLoading(false);
        }, 1000);
    };

    const onLandscapToggleChange = (event: React.MouseEvent<HTMLElement, MouseEvent>, checked?: boolean | undefined) => {
        setIsLandScap(checked);
    };

    const handleChange = (key: string, checked?: boolean) => {
        setSelected(prev => ({
            ...prev,
            [key]: checked ?? false,
        }));
    };


    const cancelIcon: IIconProps = { iconName: 'Cancel' };
    if (!props.selectedItems) return null;

    return (
        <>
            {isLoading && <Loader />}
            <Modal
                titleAriaId="titleId"
                isOpen={!!props.selectedItems}
                onDismiss={props.onClickClose}
                isBlocking={true}
                isModeless={false}
                isDarkOverlay={true}
                className="print-modal"
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
                        <div className="checkbox-container">
                            <span style={{ fontWeight: '600', fontSize: '15px' }}>Include in View: </span>
                            <Checkbox
                                label={ClientResponseViewFields.SiteName}
                                checked={selected.siteName}
                                onChange={(_, checked) => handleChange('siteName', checked)}
                            />
                            <Checkbox
                                label={ClientResponseViewFields.SiteArea}
                                checked={selected.siteArea}
                                onChange={(_, checked) => handleChange('siteArea', checked)}
                            />

                            <span style={{ fontWeight: '600', fontSize: '15px' }}>Download PDF in: </span>

                            <Toggle
                                checked={isLandscap}
                                className="var-toggle"
                                onText={'Landscape'}
                                offText={'Portrait'}
                                onChange={onLandscapToggleChange}
                                role="checkbox"
                                styles={{ root: { marginBottom: 0 } }}
                            />

                            <span style={{ fontWeight: '600', fontSize: '15px' }}>QR Title: </span>
                            <TextField
                                placeholder="Enter title to display"
                                value={customTitle}
                                onChange={(_, val) => setCustomTitle(val || "")}
                                styles={{ root: { minWidth: 250, maxWidth: 300 } }}
                            />
                        </div>

                        <div className="multi-print-container mt-3" id="MultipleQRCodes" ref={printRef}>
                            {props.selectedItems?.length > 0 && (
                                <div className="site-group">
                                    {props.selectedItems
                                        .reduce((acc: any[], item: any, index: number) => {
                                            const size = isGeneratingPDF
                                                ? (isLandscap === true ? 8 : 9)
                                                : props.selectedItems.length;

                                            const groupIndex = Math.floor(index / size);
                                            if (!acc[groupIndex]) acc[groupIndex] = [];
                                            acc[groupIndex].push(item);
                                            return acc;
                                        }, [])
                                        .map((group: any[], groupIndex: number) => (
                                            <div
                                                key={groupIndex}
                                                className={`${groupIndex > 0 ? "page-break" : ""}`}
                                            >
                                                {groupIndex === 0 && props.selectedItems[0]?.SiteName && (
                                                    <div className="print-siteTitle">
                                                        <strong>Site:</strong> {props.selectedItems[0].SiteName}
                                                    </div>
                                                )}

                                                <div className="print-option">
                                                    {group.map((item: any, index: number) => (
                                                        <div key={index} className="card">
                                                            <div className="title">
                                                                <img src={qcLogo} alt="Logo" className="qclogoims qc-logo-img" />
                                                            </div>
                                                            <div className="feedback-box">
                                                                <img src={item.QRCodeUrl} alt="QR Code" className="qclogoims" />
                                                            </div>

                                                            <div className="subtitle">
                                                                {customTitle.trim() !== "" ? customTitle : ClientResponseViewFields.LogoTitle}
                                                            </div>

                                                            {selected?.siteName && item.SiteName && (
                                                                <div className="text-content">{item.SiteName}</div>
                                                            )}

                                                            {selected?.siteArea && item.SiteArea && (
                                                                <div className="text-content">{item.SiteArea}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>

                        <div className="sticky-footer flex-wrap">
                            <div>
                                <DefaultButton className="btn btn-primary" onClick={onclickPDFDownload}>
                                    PDF
                                </DefaultButton>
                                <ReactToPrint
                                    content={() => printRef.current}
                                    pageStyle={pageStyleThermalPrint}
                                    trigger={() => (
                                        <DefaultButton className="btn btn-primary"
                                            style={{ marginLeft: "5px" }}>
                                            Print
                                        </DefaultButton>
                                    )}
                                />
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
        </>

    );

};