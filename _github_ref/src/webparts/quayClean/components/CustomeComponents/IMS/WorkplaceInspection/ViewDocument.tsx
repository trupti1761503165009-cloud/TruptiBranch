import { Panel, PanelType } from "@fluentui/react";
import * as React from "react";
import { MicrosoftOfficeDocumentType } from "../../../../../../Common/Constants/CommonConstants";
export interface IViewDocumentProps {
    isViewDocument: any;
    isOpen?: any;
    hideDoc?: any;
    fileURL?: any;
    mProps?: any;
}

export const ViewTemplate= (props: IViewDocumentProps) => {
    const [DocumentPath, setDocumentPath] = React.useState<string>("");
    React.useEffect(() => {
        let DocumentFullPath;
        const filePath: string = props.fileURL
        const embedFullFilePath = `${props.mProps.context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${!!props.fileURL ? props.fileURL : ""}&action=embedview`;
        const fileType = filePath.split('.').pop();

        if (fileType === 'txt') {
            DocumentFullPath = `${window.location.origin}/:t:/r${!!props.fileURL ? props.fileURL : props.mProps.context.pageContext.web.serverRelativeUrl}?csf=1&web=1&e=jo7Y0q`;
        } else if (fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png' || fileType === 'gif') {

            DocumentFullPath = `${window.location.origin}${props.fileURL || props.mProps.context.pageContext.web.serverRelativeUrl}`;
        } else if (MicrosoftOfficeDocumentType.indexOf(fileType || '') >= 0) {
            DocumentFullPath = embedFullFilePath;
        } else
            DocumentFullPath = (fileType === "zip" ? `${filePath}?web = 1 & action=embedview` : filePath);
        setDocumentPath(DocumentFullPath);
    }, []);

    return (
        <div>
            <Panel
                headerText="Document View"
                isBlocking={false}
                isOpen={props.isOpen}
                onDismiss={props.hideDoc}
                type={PanelType.extraLarge}
                closeButtonAriaLabel="Close"
            >
                <iframe src={DocumentPath} style={{ width: "100%", height: "90vh" }} />
            </Panel>
        </div>
    );

};