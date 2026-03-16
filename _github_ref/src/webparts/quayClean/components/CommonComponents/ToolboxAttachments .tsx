import React from 'react';
import AttachmentRenderer from './AttachmentRenderer';

const ToolboxAttachments = ({ ToolboxTalk, Type }: any) => {
    // Check if attachments exist
    let attachments = [];
    if (Type === "Creator") {
        attachments = ToolboxTalk[0]?.CreatorAttachment;
    } else if (Type === "Master") {
        attachments = ToolboxTalk[0]?.MasterAttachment;
    } else {
        attachments = ToolboxTalk[0]?.Attachment;
    }

    // Sort attachments: non-image documents first, then images
    const sortedAttachments = attachments.sort((a: string, b: string) => {
        const extA: string = a.split('.').pop()?.toLowerCase() ?? "";
        const extB: string = b.split('.').pop()?.toLowerCase() ?? "";

        const documentExtensions = [
            'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'csv', 'odt', 'ods', // Add more extensions as needed
        ];
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];

        const isADocument = documentExtensions.includes(extA);
        const isBDocument = documentExtensions.includes(extB);
        const isAImage = imageExtensions.includes(extA);
        const isBImage = imageExtensions.includes(extB);

        // Prioritize documents over images
        if (isADocument && !isBDocument) return -1; // A is document, B is not
        if (!isADocument && isBDocument) return 1; // B is document, A is not
        return 0; // Both are documents or both are images, maintain original order
    });

    return (
        <div className="attachments-container link-word-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {attachments.length > 0 ? (
                sortedAttachments.map((attachmentUrl: string, index: number) => (
                    <AttachmentRenderer key={index} attachmentUrl={attachmentUrl} />
                ))
            ) : (
                <div>No attachments found</div>
            )}
        </div>
    );
};

export default ToolboxAttachments;
