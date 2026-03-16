import * as React from 'react';
const imgLogo = require('../../../../assets/images/logo.png');
const QueensLandLogo = require('../../../../assets/images/QueensLandLogo.png');
const sydneyLogo = require('../../../../assets/images/Showgroundlogo.png');
interface InductionCertificateProps {
    detailData: any;
    courseData: any;
    inductionData: any;
}

const InductionCertificate: React.FC<InductionCertificateProps> = ({ detailData, courseData, inductionData }) => {
    const percentageReal = courseData?.TotalQuestions > 1 ? (courseData?.TotalCorrectAnswers / courseData?.TotalQuestions) * 100 : 0;
    return (
        <div className="indcr-certificate-container" id="DetailInductionReportPDF">
            <div className="indcr-certificate">
                <div className="indcr-header">
                    {(inductionData.Title)?.toLowerCase() === "sydney showground" ? <img src={sydneyLogo} alt="University Logo" className="indcr-logo" /> : <img src={QueensLandLogo} alt="University Logo" className="indcr-logo" />}

                    <span>Course Version: <span id="courseVersion">1</span></span>
                </div>
                <h2 id="courseTitle"><b>{courseData.CourseMaster}</b></h2>
                <p><strong>Name:</strong> <span id="name">{detailData.FullAttendees.Title}</span> &emsp; <strong>Company Name:</strong> <span id="company">QUAYCLEAN AUSTRALIA PTY. LTD.</span></p>
                <p><strong>I.D. Number:</strong> <span id="idNumber">{detailData.FullAttendees.Id.toString().padStart(6, '0')}</span></p>

                {courseData?.TotalQuestions > 1 &&
                    <div className='mtqr mb5'><b>Induction Score for {courseData?.CourseMaster} is {Number(percentageReal.toFixed(2))}%</b></div>}
                <div className="indcr-acknowledgement">
                    <p><strong>ACKNOWLEDGEMENT:</strong> I acknowledge that I have personally read and understood the induction, successfully answered the questionnaire, and agree to abide by all the requirements outlined in the induction.</p>
                </div>
                <div className="indcr-signature">
                    <p>Signed: {detailData.Signature ? <img src={detailData.Signature} alt="Signature" className="signature-image" /> : '___________________________'}</p>
                    <p>Date: ___________________________</p>
                </div>
                <p><strong>Expiry:</strong> <span id="expiry">{detailData.ExpiryDate}</span></p>
            </div>
            <div className="indcr-small-card">
                {/* <img src={QueensLandLogo} alt="University Logo" className="indcr-logo" /> */}
                {(inductionData.Title)?.toLowerCase() === "sydney showground" ? <img src={sydneyLogo} alt="University Logo" className="indcr-logo" /> : <img src={QueensLandLogo} alt="University Logo" className="indcr-logo" />}
                <h3>Course Licence For</h3>
                <p><strong>Name:</strong> <span id="smallName">{detailData.FullAttendees.Title}</span></p>
                <p><strong>I.D. Number:</strong> <span id="smallId">{detailData.FullAttendees.Id.toString().padStart(6, '0')}</span></p>
                <p><strong>Company:</strong> <span id="smallCompany">QUAYCLEAN AUSTRALIA PTY. LTD.</span></p>
                <p><strong>Course:</strong> <span id="smallCourse">{courseData.CourseMaster}</span></p>
                <p><strong>Date:</strong> <span id="smallDate">{detailData.Created}</span></p>
                <p><strong>Time:</strong> <span id="smallTime">{detailData.Time}</span></p>
                <p><strong>Expiry:</strong> <span id="smallExpiry">{detailData.ExpiryDate}</span></p>
            </div>
        </div>
    );
};

export default InductionCertificate;
