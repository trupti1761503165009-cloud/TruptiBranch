import { ImageFit } from 'office-ui-fabric-react';
import * as React from 'react';
import {
    DocumentCard,

    DocumentCardPreview,
    DocumentCardTitle,
    IDocumentCardPreviewProps,
} from '@fluentui/react/lib/DocumentCard';
import { FC } from 'react';
import { useId } from '@fluentui/react-hooks';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { formatBytes, getFileTypeIcon } from '../../../../../Common/Util';
import { IDocumentBlob } from '../../../../../Interfaces/IDocumentUploadProps';


interface IDocumentCardProps {
    file: IDocumentBlob;
    removeFile(id: number | string): any;
}

const DocumentCardComponent: FC<IDocumentCardProps> = (props: IDocumentCardProps) => {

    const GetImgUrl = (fileName: string): string => {
        let fileNameItems = fileName.split('.');
        let fileExtenstion = fileNameItems[fileNameItems.length - 1];

        return getFileTypeIcon(fileExtenstion);
    };

    const image = GetImgUrl(!!props.file.internalName ? props.file.internalName : props.file.name);
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

    const cbId = useId("image");
    //for hide to print console data
    let i = 1;
    if (i === 0)
        console.log("0");

    const _removeFile = (key: string | number) => {
        props.removeFile(key);
    };

    return (
        <DocumentCard>
            <DocumentCardPreview {...previewProps} />
            <FontAwesomeIcon
                className='file-trash-icon'
                onClick={() => _removeFile(!!props.file.key ? props.file.key : "")}
                icon={"trash-alt"}
                style={{
                    fontSize: "16px",
                    color: "#dc3545"
                }}
            />

            <DocumentCardTitle
                //title={props.file.internalName}
                title={!!props.file.internalName ? props.file.internalName : props.file.name}
                shouldTruncate
            />
            <label>{formatBytes(props.file.file.size)}</label>
        </DocumentCard>
    );
};

export default DocumentCardComponent;