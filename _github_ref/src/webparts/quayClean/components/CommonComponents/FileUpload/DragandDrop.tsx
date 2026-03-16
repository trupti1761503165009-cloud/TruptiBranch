/* eslint-disable react/jsx-key */
/* eslint-disable react/self-closing-comp */
import { DefaultButton, PrimaryButton } from 'office-ui-fabric-react';
import * as React from 'react';
import DocumentCardComponent from './DocumentCard';
import { IDataProvider } from '../../../../../DataProvider/Interface/IDataProvider';
import { IFileWithBlob } from '../../../../../DataProvider/Interface/IFileWithBlob';
import { IDocumentBlob } from '../../../../../Interfaces/IDocumentUploadProps';
require("../../../assets/css/file.css");

interface DragAndDropProps {
    provider: IDataProvider;
    files: IDocumentBlob[] | IFileWithBlob[];
    handleChange: (e: any) => void;
    removeFile(id: number | string): any;
    handleDrop: (e: any) => void;
    onCancel(): void;
    onSaveFiles(): void;
    isMultiple: boolean;
}

const DragAndDrop: React.FC<DragAndDropProps> = (props) => {
    const { provider, files, handleChange, removeFile, handleDrop, onCancel, onSaveFiles, isMultiple } = props;
    const [dragActive, setDragActive] = React.useState(false);
    const inputRef = React.useRef<any>();
    const onHandleDrop = (e: any): void => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleDrop(e);
        //for hide to print console data
        let i = 1;
        if (i === 0)
            console.log();
    };

    // handle drag events
    const handleDrag = (e: any): void => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    // triggers the input when the button is clicked
    const onButtonClick = (): void => {
        if (!!inputRef.current)
            inputRef.current.click();
    };

    return (
        <>
            <div className="pt20">
                <div className="ms-Grid">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-lg12 mb16 d-none">
                            <button className="upload-button" onClick={onButtonClick}>Upload a file</button>
                        </div>
                        <div className="ms-Grid-col ms-lg12 mb16">
                            <div>
                                <div id="form-file-upload" onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
                                    <input ref={inputRef} accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel,text/comma-separated-values, text/csv, application/csv" type="file" id="input-file-upload" multiple={isMultiple} onChange={(e) => {
                                        handleChange(e);
                                    }} />
                                    {dragActive && <div id="drag-file-element"
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={onHandleDrop}>
                                    </div>
                                    }
                                    {files?.length === 0 &&
                                        <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
                                            <div>
                                                <h3>Drag and drop your file here</h3>
                                            </div>
                                        </label>
                                    }

                                    {(!dragActive && files?.length > 0) &&
                                        <div className='filesContainerGrid document-list'>
                                            {
                                                files?.map((file: any, indx: number) => {
                                                    return <DocumentCardComponent file={file} removeFile={(id: number) => {
                                                        removeFile(id);
                                                        inputRef.current.value = "";
                                                    }} />;
                                                })
                                            }
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="ms-Grid-col ms-lg12 mb16 textRight">
                            <PrimaryButton disabled={(!!props.files && props.files?.length > 0) ? false : true} className={(!!props.files && props.files?.length > 0) ? 'btn btn-primary marleft' : ''} onClick={onSaveFiles}>Save</PrimaryButton>
                            <DefaultButton className='btn btn-danger marleft' onClick={onCancel}>Close</DefaultButton>
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
};

export default DragAndDrop;


