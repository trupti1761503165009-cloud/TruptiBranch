import * as React from "react";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";

type Props = {
    setFilesToState: (files: any[]) => void;
};

export function dragandDropFilePickerData(props: Props) {
    const { setFilesToState } = props;
    const [dragActive, setDragActive] = React.useState(false);
    const inputRef = React.useRef<any>();
    const [files, setFiles] = React.useState<any[]>([]);

    const handleDrop = (e: any) => {
        try {
            e.preventDefault();
            e.stopPropagation();
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const selectedFiles: any[] = [];
                const files = e.dataTransfer?.files;
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const selectedFile: IFileWithBlob = {
                        file: file,
                        name: file.name,
                        folderServerRelativeURL: "",
                        overwrite: true,
                        key: i
                    };
                    selectedFiles.push(selectedFile);
                }
                setFiles(selectedFiles);
                setFilesToState(files);
            }
        } catch (error) {
            console.log(error);
        }
    };


    const onHandleDrop = (e: any): void => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleDrop(e);
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

    const removeFile = (id: number | string) => {
        const newFiles = files.filter((file: any) => file.key !== id);
        setFiles(newFiles);
        setFilesToState(newFiles);
    };

    const handleChange = (e: any): void => {
        try {
            e.preventDefault();
            if (e.target.files && e.target.files[0]) {
                const selectedFiles: any[] = [];
                const files = e.target.files;
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const selectedFile: IFileWithBlob = {
                        file: file,
                        name: file.name,
                        folderServerRelativeURL: "",
                        overwrite: true,
                        key: i
                    };
                    selectedFiles.push(selectedFile);
                }
                setFiles(selectedFiles);
                setFilesToState(files);
            }
        } catch (error) {
            console.log(error);
        }
    };

    const onButtonClick = (): void => {
        if (!!inputRef.current)
            inputRef.current.click();
    };

    return {
        files,
        dragActive,
        inputRef,
        removeFile,
        handleChange,
        handleDrag,
        onHandleDrop,
        onButtonClick
    };
}