import React from 'react';
import AttachmentRenderer from './AttachmentRenderer';

const SiteSafetyAuditAttachment = ({ ToolboxTalk, Title, Type }: any) => {
    // Check if attachments exist
    let attachments = [];
    if (Type === "Creator") {
        attachments = ToolboxTalk?.CreatorAttachment;
    } else if (Type === "Master") {
        attachments = ToolboxTalk?.MasterAttachment;
    } else {
        attachments = ToolboxTalk?.Attachment;
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
                attachments
                    .filter((attachmentUrl: string) => attachmentUrl.includes(Title)) // Filter attachments that contain the Title
                    .map((filteredAttachment: string, index: number) => (
                        <AttachmentRenderer key={index} attachmentUrl={filteredAttachment} />
                    ))
            ) : (
                <div className='AT-No-Attachment'>No attachments found</div>
            )}

        </div>
    );
};

export default SiteSafetyAuditAttachment;
