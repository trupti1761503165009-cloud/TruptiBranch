/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from "react";

export const AccessDenied = () => {

    return (
        <div className="pageFrame backpattern">
            <div className="Accessdenied_dflex flexcolumn textcenter">
                <h1 className="display1">403</h1>
                <h4>Access Denied</h4>
                <p className="mt15">Sorry, you don&apos;t have permission to access this page.</p>

            </div>
        </div>
    );
};

export default AccessDenied;
