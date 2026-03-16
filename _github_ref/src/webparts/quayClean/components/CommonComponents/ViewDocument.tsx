import { Panel, PanelType } from "@fluentui/react";
import * as React from "react";
import { MicrosoftOfficeDocumentType } from "../../../../Common/Constants/CommonConstants";
export interface IViewDocumentProps {
    isViewDocument: any;
    isOpen?: any;
    hideDoc?: any;
    FileRef?: any;
    context?: any;
}

export const ViewDocument = (props: IViewDocumentProps) => {
    const [DocumentPath, setDocumentPath] = React.useState<string>("");
    React.useEffect(() => {
        let DocumentFullPath;
        const filePath: string = props.FileRef
        const embedFullFilePath = `${props.context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${!!filePath ? filePath : ""}&action=embedview`;
        const fileType = filePath.split('.').pop();
        if (MicrosoftOfficeDocumentType.indexOf(fileType || '') >= 0)
            DocumentFullPath = embedFullFilePath;
        else
            DocumentFullPath = (fileType === "zip" ? `${filePath}?web = 1 & action=embedview` : filePath);
        setDocumentPath(DocumentFullPath);
    }, []);

    return (

        <Panel
            isOpen={props.isOpen}
            onDismiss={() => props.hideDoc()}
            type={PanelType.extraLarge}
            headerText="View File">
            <iframe key={1} src={DocumentPath} style={{ width: "100%", height: "85vh" }} />
        </Panel>
    );

};
{/* <Panel
                headerText="View Document"
                isBlocking={false}
                isOpen={props.isOpen}
                onDismiss={props.hideDoc}
                type={PanelType.customNear}
                closeButtonAriaLabel="Close"
            >
                <div className="ms-Grid">
                    <div className="ms-Grid-row" style={{ marginBottom: 15 }}>
                        <div className="ms-Grid-col ms-sm10 ms-md10 ms-lg10">
                            <div className="workflowIframe">
                                <iframe
                                    key={1}
                                    src={DocumentPath}
                                    style={{ width: "100%", height: "85vh" }}
                                />
                            </div>

                        </div>
                    </div>
                </div>
            </Panel> */}