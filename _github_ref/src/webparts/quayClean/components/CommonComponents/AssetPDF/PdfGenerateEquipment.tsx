import * as React from 'react';
import AssetPrintPDF from './AssetPrintPDF';
import { WebPartContext } from '@microsoft/sp-webpart-base';
import { getSiteAssetQRCode } from '../CommonMethods';

interface PdfGenerateEquipmentProps {
    ListEquipment: Array<any>;
    imgLogo: string;
    DisplayPrice?: boolean;
    context: WebPartContext;
}

const PdfGenerateEquipment: React.FC<PdfGenerateEquipmentProps> = (props) => {

    const [assetsForPdf, setAssetsForPdf] = React.useState<any[]>([]);
    const [qrLoading, setQrLoading] = React.useState(true);

    // 🔥 Auto-run when component is mounted
    React.useEffect(() => {
        let mounted = true;

        const generateAllQRCodes = async () => {
            try {
                const enrichedAssets = await Promise.all(
                    props.ListEquipment.map(async (asset) => {
                        if (!asset?.ID) return asset;

                        const qrUrl = await getSiteAssetQRCode(props.context, asset.ID);

                        return {
                            ...asset,
                            QRCode: qrUrl   // 👈 attach QR here
                        };
                    })
                );

                if (mounted) {
                    setAssetsForPdf(enrichedAssets);
                    setQrLoading(false);
                }
            } catch (e) {
                console.error("QR generation failed", e);
                setQrLoading(false);
            }
        };

        generateAllQRCodes();

        return () => { mounted = false; };
    }, [props.ListEquipment]);

    return (
        <div id="pdfGenerateEquipment" className="dnone">

            {qrLoading && (
                <div className="pdf-loader">
                    Preparing QR codes...
                </div>
            )}

            {!qrLoading && (
                <div>
                    <div id="pdf-content" className="apdf-container">

                        <table width="100%" className="wts EquipmentTable">
                            <tbody>
                                <tr>
                                    <td className="pt-16 pl-16 pr-16 wts text-start">
                                        <div className="asset-Details-Title">
                                            <img src={props.imgLogo} height="90px" width="90px" />
                                            <div>Asset List</div>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td className="pb-16 pl-16 pr-16 wts text-start total-td">
                                        <span className="Total">
                                            Total: {props.ListEquipment.length}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        {/* ✅ Render only prepared data */}
                        {assetsForPdf.map((asset, index) => (
                            <AssetPrintPDF
                                key={index}
                                asset={asset}
                                DisplayPrice={props.DisplayPrice || false} context={props.context} />
                        ))}

                    </div>
                </div>
            )}
        </div>
    );
};

export default PdfGenerateEquipment;