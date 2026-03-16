import * as React from 'react';

const ResponseHeader: React.FC<any> = ({ header, title, isHazardForm }) => {
    return (
        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 mb-3 p-0">
            <div className="navHeader" style={{ borderBottom: '1px solid #dddddd', padding: '10px' }}>
                <div className="pdfnavBrand">

                    <img
                        src={isHazardForm ? require('../../../../assets/images/hazardImages/hazard_qc-logo-long.png') : require('../../../../assets/images/qc-logo-long.svg')}
                        alt="Quayclean logo"
                        className="header-logo qclogoims"
                    />

                    <div className="hazardHeaderPDF">
                        <div className="headerTitle">{title}</div>
                        <div className="headerSubTitle">{header ? header : "-"}</div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default ResponseHeader;