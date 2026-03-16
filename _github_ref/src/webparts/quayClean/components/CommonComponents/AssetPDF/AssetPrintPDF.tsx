import * as React from 'react';
import { formatPrice, formatPriceDecimal } from '../../../../../Common/Util';
import { getSiteAssetQRCode } from '../CommonMethods';
import { WebPartContext } from '@microsoft/sp-webpart-base';

type Props = {
    asset: any;
    DisplayPrice: boolean;
    context: WebPartContext;
};

const AssetPrintPDF = React.memo((props: Props) => {
    const { asset, DisplayPrice } = props;    
    return (
        <div className="asset-card keep-together">
            <img className="asset-image" src={asset?.AssetPhotoThumbnailUrl} alt="Asset Image" />
            <div className="asset-details keep-together">
                <div className="asset-item">
                    <label>Site Name</label>
                    <div>{asset?.SiteName}</div>
                </div>
                <div className="asset-item">
                    <label>State Name</label>
                    <div>{asset?.StateName}</div>
                </div>
                <div className="asset-item">
                    <label>Asset Name</label>
                    <div>{asset?.Title}</div>
                </div>
                <div className="asset-item">
                    <label>Asset Type</label>
                    <div>{asset?.AssetType}</div>
                </div>
                <div className="asset-item">
                    <label>Manufacturer</label>
                    <div>{asset?.Manufacturer}</div>
                </div>
                <div className="asset-item">
                    <label>Serial Number</label>
                    <div className='badge-common'>{asset?.SerialNumber}</div>
                </div>
                <div className="asset-item">
                    <label>Model</label>
                    <div className='badge-common'>{asset?.Model}</div>
                </div>
                <div className="asset-item">
                    <label>Status</label>
                    {asset?.Status === "Available" && <div className='badge-available'>{asset?.Status}</div>}
                    {asset?.Status === "Reserved" && <div className='badge-reserved'>{asset?.Status}</div>}
                    {asset?.Status === "In use" && <div className='badge-inuse'>{asset?.Status}</div>}
                    {asset?.Status === "In repair" && <div className='badge-inrepair'>{asset?.Status}</div>}
                    {asset?.Status === "Retired" && <div className='badge-retired'>{asset?.Status}</div>}
                </div>
                <div className="asset-item">
                    <label>Service Due</label>
                    <div>{asset?.ServiceDueDate}</div>
                </div>
                <div className="asset-item">
                    <label>Asset Location</label>
                    <div>{asset?.AssetCategory}</div>
                </div>
                {DisplayPrice &&
                    <div className="asset-item">
                        <label>Book Value</label>
                        <div>{formatPriceDecimal(asset?.PurchasePrice)}</div>
                    </div>}
                <div className="asset-item">
                    <label>Acquisition Value</label>
                    <div>{asset?.AcquisitionValue ? formatPriceDecimal(asset?.AcquisitionValue) : ''}</div>
                </div>
                {
                    asset?.AcquisitionValue > 1000 && (
                        <div className="asset-item">
                            <label>FA Number</label>
                            <div> {!!asset?.FANumber ? asset.FANumber : ""}</div>
                        </div>
                    )
                }
            </div>
            <img className="qr-code" src={asset?.QRCode} alt="QR Code" />            
        </div >
    );
});

export default AssetPrintPDF;