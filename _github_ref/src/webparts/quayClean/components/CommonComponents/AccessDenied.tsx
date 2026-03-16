/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";

const AccessDenied = () => {
    React.useEffect(() => {
        let custDiv = document.getElementById("SuiteNavPlaceholder");
        if (!!custDiv)
            custDiv.style.display = "none";

    }, []);
    return (
        <div className="pageFrame backpattern">
            <div className="dflex flexcolumn textcenter">
                <div>
                    <img src={require("../../assets/images/AccessDenied.png")} height="450px" width="70%" />
                    <div className="adtext">Unfortunately, it seems you currently do not have access to the SharePoint. Please contact your relevant manager to request access.</div>

                    <div className="adtext mt-2">
                        If you encounter any issues, feel free to reach out directly to <a href="mailto:dattatray@quayclean.com.au">dattatray@quayclean.com.au</a> or <a href="mailto:treta@quayclean.com.au">treta@quayclean.com.au</a>.</div>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;
