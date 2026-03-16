import React from 'react';

interface HtmlContentProps {
    html: string;
    id?: string;
    className?: string;
}

const HtmlContent: React.FC<HtmlContentProps> = ({ html, id, className }) => {
    return (
        // <div
        //     id={id}
        //     className='rich-text-display'
        //     dangerouslySetInnerHTML={{ __html: html }}
        // />
        <div className="custom-rich-text" id={id}>
            <div
                dangerouslySetInnerHTML={{ __html: html }}
            />
        </div>
    );
};

export default HtmlContent;
