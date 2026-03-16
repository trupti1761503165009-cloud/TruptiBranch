import * as React from 'react';

type Props = {
    chemical: any;
};


const ChemicalPrintPDF = React.memo((props: Props) => {
    const { chemical } = props;
    return (
        <div className="asset-card keep-together">
            <img className="asset-image" src={chemical.ProductPhotoThumbnailUrl} alt="Asset Image" />
            <div className="asset-details keep-together">
                <div className="asset-item">
                    <label>Chemical Name</label>
                    <div>{chemical.Title}</div>
                </div>
                <div className="asset-item">
                    <label>Manufacturer</label>
                    <div>{chemical.Manufacturer}</div>
                </div>
                <div className="asset-item">
                    <label>SDS Date</label>
                    <div className="badge-common">{chemical.SDSDate}</div>
                </div>
                <div className="asset-item">
                    <label>Expiration Date</label>
                    <div className="badge-common">{chemical.ExpirationDate}</div>
                </div>
                <div className="asset-item">
                    <label>Hazardous</label>
                    {(chemical?.Hazardous === "Yes" || chemical?.Hazardous === "YES") ?
                        <div className='badge-available'>Yes</div> :
                        <div className='badge-no'>No</div>
                    }
                </div>
                <div className="asset-item">
                    <label>Has Class</label>
                    <div>{chemical?.HazClass?.join(', ')}</div>
                </div>
                <div className="asset-item">
                    <label>Storage Request</label>
                    <div>{chemical?.StorageRequest?.length > 50 ? chemical.StorageRequest.substring(0, 50) + "..." : chemical.StorageRequest}</div>
                </div>
                <div className="asset-item">
                    <label>PH</label>
                    <div>{chemical.pH}</div>
                </div>
            </div>
            <img className="qr-code" src={chemical.QRCodeUrl} alt="QR Code" />
        </div>
    );
});

export default ChemicalPrintPDF;
