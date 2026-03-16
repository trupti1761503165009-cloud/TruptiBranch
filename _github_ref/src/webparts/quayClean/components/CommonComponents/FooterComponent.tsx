import * as React from "react";
const instragram = require('../../assets/images/link/instagramsvg.svg');
const facebook = require('../../assets/images/link/facebooksvg.svg');
const linkedin = require('../../assets/images/link/linkedinsvg.svg');
export const FooterComponent = () => {
    return <>
        <footer className="footer mt-auto">
            <div className="footer-content">
                <span className="cb-phone"><span className="footer-text">P:</span> <a href="tel:1300897117">1300 897 117</a></span>
                <span className="cb-space footer-text"> | </span>
                <span className="cb-email"><span className="footer-text">E:</span> <a href="mailto:info@quayclean.com.au">info@quayclean.com.au</a></span>
                <span className="cb-social">
                    <a href="https://instagram.com/quayclean" target="_blank">
                        <img src={instragram} alt="Quayclean Instagram" />
                    </a>
                    <a href="http://www.linkedin.com/company/quayclean-australia-pty-ltd?trk=top_nav_home" target="_blank">
                        <img src={linkedin} alt="Quayclean LinkedIn" />
                    </a>
                    <a href="https://www.facebook.com/quayclean" target="_blank">
                        <img src={facebook} alt="Quayclean Facebook" />
                    </a>
                </span>
            </div>
        </footer>
    </>;
};