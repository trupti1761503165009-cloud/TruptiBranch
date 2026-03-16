import {
    PresenceBadgeStatus
} from "@fluentui/react-components";

export interface IDocuments {
    Id: number;
    ID?: number;
    Title: string;
    FileRef: string;
    FileLeafRef: string;
    FileDirRef: string;
    FileSizeDisplay: string;
    File_x0020_Size?: string;
    File_x0020_Type: string;
    AuthorValue: string;
    AuthorId: number;
    Author?: any;
    EditorValue: string;
    EditorId: number;
    Editor?: any;
    Modified: string;
    Created: string;
    FSObjType: number;
    siteUrl?: any;
    FolderChildCount: any
}


type FileCell = {
    label: string;
    link: string;
    icon: JSX.Element;
};

type DateCell = {
    label: string;
    timestamp: number;
};
type FileSizeCell = {
    label: string;
    size: number;
};

type PeopleCell = {
    label: string;
    status: PresenceBadgeStatus;
};

export interface Documents {
    Id: number;
    ID?: number;
    file: FileCell
    author: PeopleCell;
    lastUpdated: DateCell;
    editor: PeopleCell;
    created: DateCell;
    fileSize: FileSizeCell;
    fsObjectType: number;
    fileType: string;
    fileDirRef?: string;
}