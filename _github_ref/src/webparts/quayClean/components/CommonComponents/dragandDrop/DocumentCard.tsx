import { ImageFit } from 'office-ui-fabric-react';
import * as React from 'react';
import {
    DocumentCard,
    DocumentCardPreview,
    DocumentCardTitle,
    IDocumentCardPreviewProps,
} from '@fluentui/react/lib/DocumentCard';
import { FC } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatBytes, getFileTypeIcon } from '../../../../../Common/Util';
interface IDocumentCardProps {
    file: any;
    removeFile(id: number | string): any;
}

const DocumentCardComponent: FC<IDocumentCardProps> = React.memo(({ file, removeFile }: IDocumentCardProps) => {
    const GetImgUrl = (fileName: string): string => {
        const fileNameItems = fileName.split('.');
        const fileExtenstion = fileNameItems[fileNameItems.length - 1];
        return getFileTypeIcon(fileExtenstion);
    };

    const image = GetImgUrl(!!file.internalName ? file.internalName : file.name);
    const previewProps: IDocumentCardPreviewProps = {
        previewImages: [
            {
                name: 'Revenue stream proposal fiscal year 2016 version02.pptx',
                linkProps: {
                    href: 'http://bing.com',
                    target: '_blank',
                },
                previewImageSrc: image,
                imageFit: ImageFit.cover,
            },
        ],
    };

    const _removeFile = (key: string | number) => {
        removeFile(key);
    };

    return (
        <DocumentCard>
            <DocumentCardPreview {...previewProps} />
            <FontAwesomeIcon
                className='file-trash-icon'
                onClick={() => _removeFile(!!file.key ? file.key : 0)}
                icon={"trash-alt"}
                style={{
                    fontSize: "16px",
                    color: "#dc3545"
                }}
            />

            <DocumentCardTitle
                title={!!file.internalName ? file.internalName : file.name}
                shouldTruncate
            />
            <label>{formatBytes(file.file.size)}</label>
        </DocumentCard>
    );
});

export default DocumentCardComponent;

