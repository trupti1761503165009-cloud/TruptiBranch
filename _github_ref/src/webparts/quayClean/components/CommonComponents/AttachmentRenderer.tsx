import React, { useState } from 'react';
import { Panel, PanelType } from 'office-ui-fabric-react'; // Adjust import based on your UI library

interface AttachmentRendererProps {
    attachmentUrl: string;
}

const AttachmentRenderer: React.FC<AttachmentRendererProps> = ({ attachmentUrl }) => {
    const [showModal, setShowModal] = useState(false);
    const [documentURL, setDocumentURL] = useState<string>("");

    const attachmentName: string = attachmentUrl.split('/').pop() ?? ""; // Extract the file name from the URL
    const extension: string = attachmentName?.split('.').pop()?.toLowerCase() ?? ""; // Extract the file extension and convert it to lowercase

    // Define allowed extensions for each type
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    const videoExtensions = ['mp4', 'webm', 'ogg'];
    const documentExtensions = [
        'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'odt', 'ods', // Add more extensions as needed
    ];

    const handleDocumentClick = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent the default anchor behavior
        //setDocumentURL(attachmentUrl);
        setDocumentURL(`${attachmentUrl}?web=1&embedded=true`);
        setShowModal(true); // Show the panel when the document link is clicked
    };

    return (
        <>
            {imageExtensions.includes(extension) ? (
                <div className="card mt-1 associated-document">
                    <img src={attachmentUrl} alt={attachmentName} />
                </div>
            ) : videoExtensions.includes(extension) ? (
                <div className="card mt-1 associated-document">
                    <video controls className="video-width-mobile">
                        <source src={attachmentUrl} type={`video/${extension}`} />
                        Your browser does not support the video tag.
                    </video>
                </div>
            ) : documentExtensions.includes(extension) ? (
                <div className="card mt-1 w-100">
                    <span className="cursorPointer" onClick={handleDocumentClick}>
                        {attachmentName}
                    </span>
                </div>
            ) : (
                // Fallback for unsupported file types
                <div className="card mt-1 w-100">
                    <a href={attachmentUrl} target="_blank" rel="noopener noreferrer">
                        {attachmentName} (unsupported type)
                    </a>
                </div>
            )}

            {/* Panel for displaying documents */}
            <Panel
                isOpen={showModal}
                onDismiss={() => setShowModal(false)}
                type={PanelType.extraLarge}
                headerText="Document View">
                <iframe src={documentURL} style={{ width: "100%", height: "85vh" }} title="Document Viewer" />
            </Panel>
        </>
    );
};

export default AttachmentRenderer;
