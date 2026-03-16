
import { dragandDropFilePickerData } from './DragandDropFilePickerData';
import DocumentCardComponent from './DocumentCard';
import * as React from 'react';
require('./file.css');


type Props = {
    setFilesToState: (files: any[]) => void;
    isMultiple?: boolean;
};

const DragandDropFilePicker: React.FC<Props> = ({ setFilesToState, isMultiple }) => {
    const {
        files,
        dragActive,
        inputRef,
        removeFile,
        handleChange,
        handleDrag,
        onHandleDrop,
    } = dragandDropFilePickerData({ setFilesToState });

    return (
        <div className="ms-Grid">
            <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12 mb16">
                    <div>
                        <div id="form-file-upload" className='formfileupload' onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
                            <input ref={inputRef} type="file" id="input-file-upload" multiple={isMultiple || false} onChange={(e) => {
                                handleChange(e)
                            }} />
                            {dragActive && <div id="drag-file-element"
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={onHandleDrop} />
                            }
                            {files.length === 0 &&
                                <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
                                    <div>
                                        <h3>Drag and drop your file here</h3>
                                    </div>
                                </label>
                            }

                            {(!dragActive && files.length > 0) &&
                                <div className='filesContainerGrid document-list'>
                                    {
                                        files?.map((file: any, indx: number) => {
                                            return <DocumentCardComponent key={`dc-${indx}`} file={file} removeFile={(id: number) => {
                                                removeFile(id);
                                                inputRef.current.value = ""
                                            }} />
                                        })
                                    }
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DragandDropFilePicker