/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { IQuayCleanState } from "../../QuayClean";
import { ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { logGenerator, getFileTypeIcon, scrollFunction, getCAMLQueryFilterExpression, UserActivityLog } from "../../../../../Common/Util";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { DefaultButton, Dialog, DialogFooter, DialogType, FocusTrapZone, IColumn, Layer, Link, Overlay, Panel, PanelType, Pivot, PivotItem, Popup, PrimaryButton, ProgressIndicator, SelectionMode, TextField, mergeStyleSets, IContextualMenuItem, ContextualMenu } from "office-ui-fabric-react";
import { Loader } from "../../CommonComponents/Loader";
import { useBoolean, useId } from "@fluentui/react-hooks";
import CustomModal from "../../CommonComponents/CustomModal";
import { TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DocumentsLibDialog } from "./DocumentsLibDialog";
import CamlBuilder from "camljs";
import DragandDropFilePicker from "../../CommonComponents/dragandDrop/DragandDropFilePicker";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import CustomBreadcrumb from "../../CommonComponents/breadcrumb/CustomBreadcrumb";
import { ICamlQueryFilter, FieldType, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { DateTimeFormate, MicrosoftOfficeDocumentType } from "../../../../../Common/Constants/CommonConstants";
import { toastService } from "../../../../../Common/ToastService";
import moment from "moment";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom, appSiteStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { AddDocumentCardView } from "./AddDocumentCardView";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');
export interface ICustomBreadcrumbItem {
    text: string;
    key: string;
}

export interface IAssociateChemicalProps {
    siteNameId: any;
    manageComponentView(componentProp: IQuayCleanState): any;
    URL?: string;
    qcState?: any;
    siteName: any;
    qCState?: any;
    qCStateId?: any;
    IsSupervisor?: boolean;
    view?: any;
    loginUserRoleDetails?: any;
}

const dialogContentProps = {
    type: DialogType.normal,
    title: "Warning Message",
    closeButtonAriaLabel: "Close",
    subText: "Please Select Date Range!!",
};

const popupStyles2 = mergeStyleSets({
    root: {
        background: 'rgba(0, 0, 0, 0.2)',
        bottom: '0',
        left: '0',
        position: 'fixed',
        right: '0',
        top: '0',
    },
    content: {
        background: 'white',
        left: '50%',
        maxWidth: '1200px',
        width: '90%',
        padding: '0 1.5em 2em',
        position: 'absolute',
        top: '50%',
        transform: 'translate(-50%, -50%)',
    }
});

let uploadedFileCount = 0;

export interface IAssociateChemicalState {
    isReload: boolean;
    isQRCodeModelOpen: boolean;
    qrCodeUrl: string;
    qrDetails: string;
    quChemical: string;
}

export const DocumentsLib = (props: IAssociateChemicalProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const appSiteState = useAtomValue(appSiteStateAtom);
    const { PermissionArray } = appSiteState;
    const [state, setState] = React.useState<IAssociateChemicalState>({
        isReload: false,
        isQRCodeModelOpen: false,
        qrCodeUrl: "",
        qrDetails: "",
        quChemical: ""

    });
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [isReloadDocument, setisReloadDocument] = React.useState<boolean>(false);
    const [isReloadDocument2, setisReloadDocument2] = React.useState<boolean>(false);
    const [DeleteFolder, setDeleteFolder] = React.useState<any>();
    const [DeleteFile, setDeleteFile] = React.useState<any>();
    const [DeleteId, setDeleteId] = React.useState<any>();
    const [DeleteURLId, setDeleteURLId] = React.useState<any>();
    const [DeleteId2, setDeleteId2] = React.useState<any>();
    const [isShowAssetHistoryModel, setisShowAssetHistoryModel] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [URL, setURL] = React.useState<any>();
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const [isDisplayEDbtn2, setisDisplayEDbtn2] = React.useState<boolean>(false);
    const [selectedChemical, setSelectedChemical] = React.useState<any>("");
    const [AssocitedChemicalArray, setAssocitedChemicalArray] = React.useState<any>([]);
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
    const [hideDialogdelete, { toggle: toggleHideDialogdelete }] = useBoolean(false);
    const [hideDialogdeleteURL, { toggle: toggleHideDialogdeleteURL }] = useBoolean(false);
    const [hideDialogdelete2, { toggle: toggleHideDialogdelete2 }] = useBoolean(false);
    const [isDisplayFilterDialog, setisDisplayFilterDialog] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const isVisibleCrud = React.useRef<boolean>(false);
    const [calmData, setcalmData] = React.useState<any[]>([]);
    const [filtercalmData, setfiltercalmData] = React.useState<any[]>([]);
    const [notFoundFF, setnotFoundFF] = React.useState<boolean>(false);
    const [displayback, setdisplayback] = React.useState<boolean>(false);
    const [documnetUrl, setdocumnetUrl] = React.useState<string>("");
    const [isDocumentPanelOpen, setisDocumentPanelOpen] = React.useState<boolean>(false);
    const [preData, setpreData] = React.useState<any[]>([]);
    const [selectedKey, setselectedKey] = React.useState<any>("Add Document");
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [title, settitle] = React.useState<string>("");
    const [calmData2, setcalmData2] = React.useState<any[]>([]);
    const [filtercalmData2, setfiltercalmData2] = React.useState<any[]>([]);
    const [notFoundFF2, setnotFoundFF2] = React.useState<boolean>(false);
    const [preData2, setpreData2] = React.useState<any[]>([]);
    const [isPopupVisible2, { setTrue: showPopup2, setFalse: hidePopup2 }] = useBoolean(false);
    const [files, setFiles] = React.useState<IFileWithBlob[]>([]);
    const [percentComplete, setPercentComplete] = React.useState(0);
    const [LastFolder, setLastFolder] = React.useState<string>("");
    const [isuploadlink, setisuploadlink] = React.useState<boolean>(false);
    let defaultBreadCrumb = undefined;
    const [finalLastLink, setfinalLastLink] = React.useState<string>("");
    let [newBreadcrumbItem, setNewBreadcrumbItem] = React.useState<ICustomBreadcrumbItem | undefined>(defaultBreadCrumb);
    let [sourcePath, setSourcePath] = React.useState<string>("");
    const [URLLinkData, setURLLinkData] = React.useState<any[]>([]);
    const [isPopupVisibleURL, { setTrue: showPopupURL, setFalse: hidePopupURL }] = useBoolean(false);
    const [isPopupVisibleRename, { setTrue: showPopupRename, setFalse: hidePopupRename }] = useBoolean(false);
    const [LinkName, setLinkName] = React.useState<string>("");
    const [Rename, setRename] = React.useState<string>("");
    const [RenameFileRef, setRenameFileRef] = React.useState<string>("");
    const [LinkURL, setLinkURL] = React.useState<string>("");
    const [displayerrorRename, setdisplayerrorRename] = React.useState<boolean>(false);
    const [displayerror, setdisplayerror] = React.useState<boolean>(false);
    const [displayerrorSiteURL, setdisplayerrorSiteURL] = React.useState<boolean>(false);
    const [displayerrorTitle, setdisplayerrorTitle] = React.useState<boolean>(false);
    const [isUpdateURL, setisUpdateURL] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [menuTarget, setMenuTarget] = React.useState(null);
    const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : 'grid');
    const handleViewChange = (view: string) => {
        setCurrentView(view);
    };

    const [width, setWidth] = React.useState<string>("500px");
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("500px");
        }
    }, [window.innerWidth]);

    const popupStyles = mergeStyleSets({
        root: {
            background: 'rgba(0, 0, 0, 0.2)',
            bottom: '0',
            left: '0',
            position: 'fixed',
            right: '0',
            top: '0',
        },
        content: {
            background: 'white',
            left: '50%',
            maxWidth: '550px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
        }
    });

    const menuItems: IContextualMenuItem[] = [
        {
            key: 'move',
            text: 'Move',
            iconProps: { iconName: 'Move' },
            onClick: () => { console.log('Move clicked'); }
        },
        {
            key: 'copy',
            text: 'Copy',
            iconProps: { iconName: 'Copy' },
            onClick: () => { console.log('Copy clicked'); }
        },
        {
            key: 'share',
            text: 'Share',
            iconProps: { iconName: 'Share' },
            onClick: () => { console.log('Share clicked'); }
        },
        {
            key: 'rename',
            text: 'Rename',
            iconProps: { iconName: 'Rename' },
            onClick: () => { console.log('Rename clicked'); }
        },
        {
            key: 'open',
            text: 'Open',
            iconProps: { iconName: 'box' },
            onClick: () => { console.log('Open clicked'); }
        },
        {
            key: 'copylink',
            text: 'Copy Link',
            iconProps: { iconName: 'Link' },
            onClick: () => { console.log('Copy Link clicked'); }
        },
    ];

    const onIconClick = (event: any) => {
        setMenuTarget(event.currentTarget);
    };

    const onMenuDismiss = () => {
        setMenuTarget(null);
    };

    const _onLinkClick = (item: PivotItem): void => {
        if (item.props.itemKey == "Link Document") {
            setLastFolder("");
            setSourcePath("");
            setNewBreadcrumbItem(undefined);
            _getAllDocuments();
        }
        setselectedKey(item.props.itemKey);
    };

    const onclickconfirmdeleteURL = () => {
        toggleHideDialogdeleteURL();
    };

    const onclickconfirmdelete = () => {
        toggleHideDialogdelete();
    };

    const onclickconfirmdelete2 = () => {
        toggleHideDialogdelete2();
    };

    const onChangeTitle = (event: any): void => {
        settitle(event.target.value);
    };

    const onChangeLinkName = (event: any): void => {
        const value = event.target.value;
        setLinkName(value);
        if (!value.trim()) {
            setdisplayerrorTitle(true);     // empty OR spaces-only → error
        } else {
            setdisplayerrorTitle(false);
        }
    };

    const onChangeRename = (event: any): void => {
        setRename(event.target.value);
        if (event.target.value == "" || event.target.value == undefined) {
            setdisplayerrorRename(true);
        } else {
            setdisplayerrorRename(false);
        }
    };

    const onChangeLinkURL = (event: any): void => {
        setLinkURL(event.target.value);
        if (event.target.value == "" || event.target.value == undefined) {
            setdisplayerror(false);
            setdisplayerrorSiteURL(true);
        } else {
            setdisplayerrorSiteURL(false);
        }
        const enteredValue = event.target.value;
        const urlPattern = /^(ftp|http|https):\/\/[^ "]+$/;
        if (!enteredValue || urlPattern.test(enteredValue)) {
            setdisplayerror(false);
        } else {
            setdisplayerror(true);
        }
    };

    const onClickFolder = async (currentFolderName: string) => {
        let results: any[] = [];
        const folderPath = "/" + currentFolderName;
        if (calmData.length > 0) {
            results = calmData.filter(item => item.FileDirRef.endsWith(folderPath));
        }
        if (currentFolderName == "DocumentLibrary") {
            setdisplayback(false);
        } else {
            setdisplayback(true);
        }
        setdisplayback(true);
        if (results.length == 0) {
            setisDisplayEDbtn(false);
            setnotFoundFF(true);
            setfiltercalmData([]);
        } else {
            setnotFoundFF(false);
            setfiltercalmData(results);
            setpreData(results);
        }
    };
    const onClickFolder2 = async (currentFolderName: string) => {
        const folderPath = "/" + currentFolderName;
        if (calmData2.length > 0) {
            setfinalLastLink(calmData2[0].FileDirRef + folderPath);
        }
        _getAllDocuments(calmData2[0].FileDirRef + folderPath);
        setSourcePath("");
        setLastFolder("");
        let results: any[] = [];
        let res: any[] = [];

        if (calmData2.length > 0) {
            results = calmData2.filter(item => item.FileDirRef.endsWith(folderPath));
            if (results.length == 0) {
                res = calmData2.filter(item => item.FileRef.endsWith(folderPath));
            }
        }

        if (results.length != 0) {
            let newBreadcrumbItem: ICustomBreadcrumbItem = {
                text: `${currentFolderName}`,
                key: `${results[0]?.FileDirRef}`,
            };
            setNewBreadcrumbItem(newBreadcrumbItem);
            setSourcePath(results[0]?.FileDirRef);
        } else {
            let newBreadcrumbItem: ICustomBreadcrumbItem = {
                text: `${currentFolderName}`,
                key: `${res[0]?.FileRef}`,
            };
            let newBreadcrumbItem2: ICustomBreadcrumbItem = {
                text: currentFolderName || '', // Fallback in case of undefined
                key: res[0]?.FileRef || '', // Fallback in case of undefined
            };
            if (newBreadcrumbItem2.text && newBreadcrumbItem2.key) {
                setNewBreadcrumbItem(newBreadcrumbItem2);
            } else {
                console.error("Breadcrumb item contains undefined values.");
            }

            // setNewBreadcrumbItem(newBreadcrumbItem);
            setSourcePath(res[0]?.FileRef);
        }
        setLastFolder(folderPath);
        if (results.length == 0) {
            setisDisplayEDbtn2(false);
            setnotFoundFF2(true);
            setfiltercalmData2([]);
        } else {
            setnotFoundFF2(false);
            setfiltercalmData2(results);
            setpreData2(results);
        }
    };
    const _onClickBack = () => {
        let results: any[] = [];
        let secondLastName: any;
        let link = filtercalmData[0]?.FileRef;
        if (link == undefined) {

            link = preData[0]?.FileRef;
            const parts = link.split('/');
            secondLastName = parts[parts.length - 2];
        } else {
            const parts = link.split('/');
            secondLastName = parts[parts.length - 3];
        }
        if (secondLastName == "DocumentLibrary") {
            setdisplayback(false);
        } else {
            secondLastName = '/' + secondLastName;
            setdisplayback(true);
        }
        if (calmData.length > 0) {
            results = calmData.filter(item => item.FileDirRef.endsWith(secondLastName));
        }
        if (results.length == 0) {
            setnotFoundFF(true);
            setfiltercalmData([]);
        } else {
            setnotFoundFF(false);
            setfiltercalmData(results);
        }
    };

    const _getAllDocuments = async (link?: string) => {
        const filterFields: ICamlQueryFilter[] = [];
        if (props.siteNameId) {
            filterFields.push({
                fieldName: "SiteName",
                fieldValue: props.siteNameId,
                fieldType: FieldType.LookupById,
                LogicalType: LogicalType.EqualTo
            });
        }
        let folderPath: any;
        if (link == "" || link == undefined) {
            if (props.siteName) {
                folderPath = context.pageContext.web.serverRelativeUrl + "/SiteDocuments/" + props.siteName;
            } else {
                folderPath = context.pageContext.web.serverRelativeUrl + "/SiteDocuments";
            }
        } else {
            folderPath = link;
        }
        filterFields.push({
            fieldName: "FileDirRef",
            fieldValue: folderPath,
            fieldType: FieldType.Text,
            LogicalType: LogicalType.EqualTo
        });
        let camlQuery = new CamlBuilder().View()
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(5000, true)
            .Query();
        if (filterFields) {
            const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
            camlQuery.Where().All(categoriesExpressions);
        }
        let allFoldersfiles = await provider.getItemsByCAMLQuery("SiteDocuments", camlQuery.ToString());

        let filteredData: any[];
        if (!!props.siteNameId || currentUserRoleDetail?.isAdmin) {
            filteredData = allFoldersfiles;
        } else {
            let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
            filteredData = !!allFoldersfiles && allFoldersfiles?.filter(item =>
                AllSiteIds.includes(item?.SiteName[0]?.lookupId)
            );
        }
        filteredData = filteredData?.sort((a: any, b: any) => {
            return moment(b.Modified).diff(moment(a.Modified));
        });


        if (!!filteredData) {
            const AssetListData = filteredData.map((data) => {
                const filePath: string = `${data.EncodedAbsUrl}`;
                let DocumentFullPath;
                const embedFullFilePath = `${context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${data.EncodedAbsUrl}&action=embedview`;
                const fileType = filePath.split('.').pop();
                if (MicrosoftOfficeDocumentType.indexOf(fileType || '') >= 0)
                    DocumentFullPath = embedFullFilePath;
                else
                    DocumentFullPath = (fileType === "zip" ? `${filePath}?web = 1 & action=embedview` : filePath);
                return {
                    ID: data.ID,
                    SiteNameId: !!data.SiteName[0]?.lookupId ? data.SiteName[0]?.lookupId : "",
                    SiteName: !!data.SiteName[0]?.lookupValue ? data.SiteName[0]?.lookupValue : "",
                    DocumentsLink: !!data.EncodedAbsUrl ? data.EncodedAbsUrl : "",
                    FileDirRef: !!data.FileDirRef ? data.FileDirRef : "",
                    FileLeafRef: !!data.FileLeafRef ? data.FileLeafRef : "",
                    ContentType: !!data.ContentType ? data.ContentType : "",
                    FileRef: !!data.FileRef ? data.FileRef : "",
                    previewUrl: DocumentFullPath,
                    CreatedBy: !!data.Author ? data.Author[0].title : "",
                    ModifiedBy: !!data.Editor ? data.Editor[0].title : "",
                    Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
                    Modified: !!data.Modified ? moment(data.Modified).format(DateTimeFormate) : "",
                };
            });
            let res: any[] = [];
            let folderPath: any;
            if (link == "" || link == undefined) {
                if (props.siteName) {
                    folderPath = "/SiteDocuments/" + props.siteName;
                } else {
                    folderPath = "/SiteDocuments"
                }
                if (AssetListData.length > 0) {
                    res = AssetListData.filter(item => item.FileDirRef.endsWith(folderPath));
                }
            } else {
                folderPath = link;
                if (AssetListData.length > 0) {
                    res = AssetListData.filter(item => item.FileDirRef == link);
                }
            }
            if (res.length == 0) {
                setnotFoundFF2(true);
                setfiltercalmData2([]);
            } else {
                setnotFoundFF2(false);
                setfiltercalmData2(res);
                setpreData2(res);
            }
            setcalmData2(AssetListData);
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        }
    };

    const removeDuplicates = (data: any) => {
        const seen = new Set<string>();
        const uniqueData = [];
        const removedIds = [];

        for (const item of data) {
            if (!seen.has(item.FileRef)) {
                seen.add(item.FileRef);
                uniqueData.push(item);
            } else {
                removedIds.push(item.ID);
            }
        }

        return { uniqueData, removedIds };
    };

    const _getDocumentsLink = () => {
        try {
            const select = ["ID,Title,SiteNameId,SiteName/Title,DocumentsLink,Created,Modified,FileLeafRef0,FileDirRef0,ContentType0,FileRef0,AuthorId,EditorId,Author/Title,Editor/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["Author,Editor,SiteName"],
                filter: props.siteNameId ? `(SiteNameId eq '${props.siteNameId}' and IsDeleted ne 1)` : `IsDeleted ne 1`,
                listName: ListNames.DocumentsLink,
            };
            provider.getItemsByQuery(queryStringOptions).then(async (results: any[]) => {
                if (!!results) {
                    const AssetListData = results.map((data) => {
                        const filePath: string = `${context.pageContext.web.absoluteUrl}/DocumentLibrary/${data.FileRef0}`;
                        return {
                            ID: data.ID,
                            SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                            SiteName: !!data.SiteName ? data.SiteName?.Title : "",
                            DocumentsLink: !!data.DocumentsLink ? data.DocumentsLink : "",
                            FileDirRef: !!data.FileDirRef0 ? data.FileDirRef0 : "",
                            FileLeafRef: !!data.FileLeafRef0 ? data.FileLeafRef0 : "",
                            ContentType: !!data.ContentType0 ? data.ContentType0 : "",
                            FileRef: !!data.FileRef0 ? data.FileRef0 : "",
                            CreatedBy: !!data.Author ? data.Author.Title : "",
                            ModifiedBy: !!data.Editor ? data.Editor.Title : "",
                            Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
                            Modified: !!data.Modified ? moment(data.Modified).format(DateTimeFormate) : "",
                        };
                    });
                    const { uniqueData, removedIds } = removeDuplicates(AssetListData);

                    let filteredData: any[];
                    if (!!props.siteNameId || currentUserRoleDetail?.isAdmin) {
                        filteredData = uniqueData;
                    } else {
                        let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                        filteredData = !!uniqueData && uniqueData?.filter(item =>
                            AllSiteIds.includes(item?.SiteNameId)
                        );
                    }
                    filteredData = filteredData?.sort((a: any, b: any) => {
                        return moment(b.Modified).diff(moment(a.Modified));
                    });


                    let res: any[] = [];
                    const folderPath = "/DocumentLibrary";
                    if (filteredData.length > 0) {
                        res = filteredData.filter(item => item.FileDirRef.endsWith(folderPath));
                    }
                    setdisplayback(false);
                    if (res.length == 0) {
                        setnotFoundFF(true);
                        setfiltercalmData([]);
                    } else {
                        setnotFoundFF(false);
                        setfiltercalmData(res);
                        setpreData(res);
                    }
                    setcalmData(filteredData);
                    if (removedIds.length > 0) {
                        for (const id of removedIds) {
                            await provider.deleteItem(ListNames.DocumentsLink, id);
                        }
                    }

                }
            }).catch((error) => {
                console.log(error);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_associatedChemical", CustomErrormessage: "error in get associate chemical", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }

    };

    const AddDocumentColumn = (): IColumn[] => {
        let columns: any[] = [
            {
                key: "Action", name: 'Action', fieldName: '', isResizable: true, minWidth: 50, maxWidth: 60,
                onRender: ((item: any) => {
                    return <>
                        <div className='dflex'>
                            {item.ContentType != "Folder" ?
                                <>
                                    {props.siteNameId && isVisibleCrud.current && <div>
                                        <Link className="actionBtn btnView dticon" onClick={() => {
                                            onClickRenameDialog(item);

                                        }}>
                                            <TooltipHost content={"Rename"} id={tooltipId}>
                                                <FontAwesomeIcon icon="edit" />
                                            </TooltipHost>
                                        </Link>
                                    </div>}
                                    <div>
                                        <Link className="actionBtn btnDownload dticon" onClick={() => {
                                            provider.downloadFile(
                                                item.FileRef, item.FileLeafRef);
                                        }}>
                                            <TooltipHost content={"Download"} id={tooltipId}>
                                                <FontAwesomeIcon icon="download" />
                                            </TooltipHost>
                                        </Link>
                                    </div>
                                </> :
                                <>
                                    {props.siteNameId && isVisibleCrud.current && <div>
                                        <Link className="actionBtn btnView dticon" onClick={() => {
                                            onClickRenameDialog(item);

                                        }}>
                                            <TooltipHost content={"Rename"} id={tooltipId}>
                                                <FontAwesomeIcon icon="edit" />
                                            </TooltipHost>
                                        </Link>
                                    </div>}
                                </>
                            }
                        </div >
                    </>;
                })
            },
            {
                key: "key1", name: 'Documents', fieldName: 'FileLeafRef', isResizable: true, minWidth: 400, maxWidth: 500, onRender: ((item: any) => {
                    let fileIcon = getFileTypeIcon(item.FileLeafRef);
                    return <>
                        <div className="container-document">
                            <Link onClick={() => {
                                if (item.ContentType === "Folder") {
                                    onClickFolder2(item.FileLeafRef);
                                } else {
                                    const fileExtension = item.FileLeafRef.split('.').pop().toLowerCase();
                                    const isPDF = fileExtension === 'pdf';
                                    const url = isPDF ? item.DocumentsLink : item.DocumentsLink + "?web=1";
                                    window.open(url, "_blank");
                                }
                            }}>
                                <TooltipHost
                                    content={item.ContentType === "Folder" ? "Click to open" : "View Document"}
                                    id={tooltipId}
                                >
                                    {item.ContentType === "Folder" ?
                                        <FontAwesomeIcon className="folderBtn btnfolder dticon" icon="folder" /> :
                                        <img className="fileIcon dticon" src={fileIcon} />
                                    }
                                    {item.FileLeafRef}
                                </TooltipHost>
                            </Link>
                            {/* <FontAwesomeIcon className="rightIcon-document" icon="ellipsis-vertical" onClick={onIconClick} /> */}

                        </div>

                    </>;
                })
            },
            { key: "SiteName", name: 'Site Name', fieldName: 'SiteName', isResizable: true, minWidth: 150, maxWidth: 200, isSortingRequired: true },
            {
                key: "key5", name: 'Created', fieldName: 'Created', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true
            },
            { key: "key2", name: 'Created By', fieldName: 'CreatedBy', isResizable: true, minWidth: 90, maxWidth: 150, isSortingRequired: true },
            { key: "key4", name: 'Modified', fieldName: 'Modified', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true },
            { key: "key4", name: 'Modified By', fieldName: 'ModifiedBy', isResizable: true, minWidth: 90, maxWidth: 150, isSortingRequired: true },
        ];
        if (props.siteNameId) {
            columns = columns.filter(item => item.key !== "SiteName");
        }
        return columns;
    };

    const getFileViewerUrl = (fileUrl: string) => {
        const fileExtension = fileUrl.split('.').pop()?.toLowerCase();
        switch (fileExtension) {
            case 'pdf':
                return fileUrl;
            case 'doc':
            case 'docx':
            case 'ppt':
            case 'pptx':
            case 'xls':
            case 'xlsx':
                return `${context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${encodeURIComponent(fileUrl)}&action=embedview`;
            default:
                return fileUrl;
        }
    };

    const DocumentsLinkColumn = (): IColumn[] => {
        let columns: any[] = [
            {
                key: "Action", name: 'Action', fieldName: '', isResizable: true, minWidth: 50, maxWidth: 60,
                onRender: ((item: any) => {
                    return <>
                        {item.ContentType != "Folder" &&
                            <div className='dflex'>
                                <div>
                                    <Link className="actionBtn btnView dticon" onClick={() => {
                                        setState(prevState => ({ ...prevState, isDocumentPanelOpen: true, documnetUrl: item.FileRef }));
                                        // setdocumnetUrl(item.DocumentsLink);
                                        setdocumnetUrl(getFileViewerUrl(item.FileRef));
                                        setisDocumentPanelOpen(true);
                                    }}>

                                        <TooltipHost content={"View Document"} id={tooltipId}>
                                            <FontAwesomeIcon icon="eye" />
                                        </TooltipHost>
                                    </Link>
                                </div>
                                <div>
                                    <Link className="actionBtn btnDownload dticon" onClick={() => {
                                        provider.downloadFile(
                                            item.FileRef, item.FileLeafRef);
                                        // setState(prevState => ({...prevState, isDocumentPanelOpen: true, documnetUrl: item.previewUrl }));
                                    }}>
                                        <TooltipHost content={"Download"} id={tooltipId}>
                                            <FontAwesomeIcon icon="download" />
                                        </TooltipHost>
                                    </Link>
                                </div>
                            </div >
                        }
                    </>;
                })

            },
            {
                key: "key1", name: 'Documents', fieldName: 'FileLeafRef', isResizable: true, minWidth: 400, maxWidth: 500, onRender: ((item: any) => {
                    let fileIcon = getFileTypeIcon(item.FileLeafRef);
                    return <>
                        <div style={{ display: "flex" }} >
                            <Link onClick={() => {
                                if (item.ContentType == "Folder") {
                                    onClickFolder(item.FileLeafRef);
                                } else {
                                    const fileExtension = item.FileLeafRef.split('.').pop().toLowerCase();
                                    const isPDF = fileExtension === 'pdf';
                                    const url = isPDF ? item.FileRef : item.FileRef + "?web=1";
                                    window.open(url, "_blank");
                                }
                            }}>
                                <TooltipHost
                                    content={item.ContentType == "Folder" ? "Click to open" : "View Document"}
                                    id={tooltipId}
                                >
                                    {item.ContentType == "Folder" ? <FontAwesomeIcon className="folderBtn btnfolder dticon" icon="folder" /> : <img className="fileIcon dticon" src={fileIcon} />}
                                    {item.FileLeafRef}
                                </TooltipHost>

                            </Link>
                        </div>
                    </>;
                })
            },
            { key: "SiteName", name: 'Site Name', fieldName: 'SiteName', isResizable: true, minWidth: 150, maxWidth: 200, isSortingRequired: true },
            { key: "key5", name: 'Created', fieldName: 'Created', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true },
            { key: "key2", name: 'Created By', fieldName: 'CreatedBy', isResizable: true, minWidth: 90, maxWidth: 150, isSortingRequired: true },
            { key: "key4", name: 'Modified', fieldName: 'Modified', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true },
            { key: "key4", name: 'Modified By', fieldName: 'ModifiedBy', isResizable: true, minWidth: 90, maxWidth: 150, isSortingRequired: true },

        ];
        if (props.siteNameId) {
            columns = columns.filter(item => item.key !== "SiteName");
        }

        return columns;
    };

    const URLLinkColumn = (): IColumn[] => {
        let columns: any[] = [
            { key: "SiteName", name: 'Site Name', fieldName: 'SiteName', isResizable: true, minWidth: 150, maxWidth: 200, isSortingRequired: true },
            {
                key: "key1", name: 'Link Name', fieldName: 'Title', isResizable: true, minWidth: 150, maxWidth: 300,
                onRender: ((item: any) => {
                    return <>
                        <div style={{ display: "flex" }} >
                            <Link
                                onClick={() => {
                                    const url = item.LinkURL;
                                    if (url) {
                                        window.open(url, '_blank');
                                    }
                                }}
                            >
                                <TooltipHost content={"Visit Link"} id={tooltipId}>
                                    {item.Title}
                                </TooltipHost>
                            </Link>
                        </div>
                    </>;
                })
            },
            { key: "key2", name: 'Link URL', fieldName: 'LinkURL', isResizable: true, minWidth: 150, maxWidth: 300, isSortingRequired: true },
        ];
        if (props.siteNameId) {
            columns = columns.filter(item => item.key != "SiteName")
        }
        return columns;
    };
    const onclickdeleteURL = async () => {
        setIsLoading(true);
        try {
            const processUpdateItem = (input: any) => {
                if (Array.isArray(input)) {
                    return input.map(item => ({
                        Id: item.ID,
                        IsDeleted: true
                    }));
                } else if (typeof input === 'object' && input !== null) {
                    return [{ Id: input.ID, IsDeleted: true }];
                } else {
                    return [];
                }
            };
            const newObjects = processUpdateItem(DeleteURLId);
            const items = Array.isArray(DeleteURLId) && DeleteURLId.length > 0 ? DeleteURLId : [DeleteURLId];
            items.forEach((res: any) => {
                const logObj = {
                    UserName: props?.loginUserRoleDetails?.title,
                    SiteNameId: res?.SiteNameId,
                    ActionType: UserActivityActionTypeEnum.Delete,
                    EntityType: UserActionEntityTypeEnum.LinkURL,
                    EntityId: res?.ID,
                    EntityName: res?.Title,
                    Details: `Delete URL Link`,
                    StateId: props?.qCStateId
                };
                void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
            });
            if (newObjects.length > 0) {
                await provider.updateListItemsInBatchPnP(ListNames.URLLink, newObjects)
            }

            toggleHideDialogdeleteURL();
            setisDisplayEDbtn(false);
            setIsLoading(false);
            _getURLLinkData();
        } catch (ex) {
            const errorObj = {
                ErrorMessage: ex.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  onclickdeleteurl",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onclickdelete URLLink"
            };
            void logGenerator(provider, errorObj);
            console.log(ex);
        }
    };

    const onclickdelete = async () => {
        setIsLoading(true);
        try {
            const deleteFileRefs = DeleteId.map((item: any) => item.FileRef);
            const matchingIDs = calmData
                .filter(item => deleteFileRefs.some((deleteRef: any) => item.FileRef.includes(deleteRef)))
                .map(item => item.ID);
            const uniqueMatchingIDs = matchingIDs.filter((id, index, self) => self.indexOf(id) === index);

            const result = uniqueMatchingIDs.map(id => ({
                Id: id,
                IsDeleted: true
            }));

            DeleteId?.forEach((res: any) => {
                const logObj = {
                    UserName: props?.loginUserRoleDetails?.title,
                    SiteNameId: res?.SiteNameId,
                    ActionType: UserActivityActionTypeEnum.Delete,
                    EntityType: UserActionEntityTypeEnum.Document,
                    EntityId: Number(res?.ID),
                    EntityName: res?.FileLeafRef,
                    Details: `Delete link document path ${res?.FileDirRef}`,
                    StateId: props?.qCStateId
                };
                void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
            });

            if (result.length > 0) {
                await provider.updateListItemsInBatchPnP(ListNames.DocumentsLink, result)
            }
            toggleHideDialogdelete();
            setisDisplayEDbtn(false);
            setIsLoading(false);
            _getDocumentsLink();
        } catch (ex) {
            const errorObj = {
                ErrorMessage: ex.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  onclickdelete",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onclickdelete AssociateChemical"
            };
            void logGenerator(provider, errorObj);
            console.log(ex);
        }
    };
    const onclickdelete2 = async () => {
        setIsLoading(true);

        try {
            if (DeleteFile.length > 0) {
                for (let index = 0; index < DeleteFile.length; index++) {
                    provider.deleteFileFromFolder(DeleteFile[index].FileDirRef, DeleteFile[index].FileLeafRef);
                    // setSourcePath(DeleteFile[index].FileDirRef);
                    setTimeout(() => {
                        _getAllDocuments(DeleteFile[index].FileDirRef);
                    }, 1000);
                }
                DeleteFile?.forEach((res: any) => {
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: res?.SiteNameId,
                        ActionType: UserActivityActionTypeEnum.Delete,
                        EntityType: UserActionEntityTypeEnum.Document,
                        EntityId: Number(res?.ID),
                        EntityName: res?.FileLeafRef,
                        Details: `Delete file path ${res?.FileDirRef}`,
                        StateId: props?.qCStateId
                    };
                    void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
                });

            }
            if (DeleteFolder.length > 0) {
                for (let indexs = 0; indexs < DeleteFolder.length; indexs++) {
                    provider.deleteFolder(DeleteFolder[indexs].FileRef);
                    // setSourcePath(DeleteFolder[indexs].FileDirRef);

                    setTimeout(() => {
                        _getAllDocuments(DeleteFile[indexs].FileDirRef);
                    }, 1000);
                }
                DeleteFile?.forEach((res: any) => {
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: res?.SiteNameId,
                        ActionType: UserActivityActionTypeEnum.Delete,
                        EntityType: UserActionEntityTypeEnum.Document,
                        EntityId: Number(res?.ID),
                        EntityName: res?.FileLeafRef,
                        Details: `Delete folder path ${res?.FileDirRef}`,
                        StateId: props?.qCStateId
                    };
                    void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
                });
            }
            // setcalmData2([]);
            setfiltercalmData2([]);
            setisDisplayEDbtn2(false);

            setisReloadDocument(true);
            setisReloadDocument2(true);
            toggleHideDialogdelete2();
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        } catch (ex) {
            console.log(ex);
            // setIsLoading(false);
        }
    };

    React.useEffect(() => {
        _getURLLinkData();
        const className = document.querySelector('ARTICLE')?.children[0].children[0].classList[0];
        let el: any = document.querySelector(!!className ? `.${className}` : "");
        if (!!el) {
            el.onscroll = function () {
                scrollFunction(240);
            };
        }
        let isVisibleCrud1 = (!!PermissionArray && PermissionArray.includes('Document Library') || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.Id == props.siteNameId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;
    }, [isRefreshGrid]);

    React.useEffect(() => {
        const refreshPath =
            sourcePath ||
            finalLastLink ||
            "";

        _getAllDocuments(refreshPath);
        _getDocumentsLink();
    }, [isRefreshGrid]);

    React.useEffect(() => {
        if (LastFolder != "" && isuploadlink == false) {
            let results: any[] = [];
            if (calmData2.length > 0) {
                results = calmData2.filter(item => item.FileDirRef.endsWith(LastFolder));
            }
            if (results.length == 0) {
                setfiltercalmData2([]);
            } else {
                setfiltercalmData2(results);
                setpreData2(results);
            }
        }
    }, [calmData2]);

    React.useEffect(() => {
        if (sourcePath != "") {
            let results: any[] = [];
            if (calmData2.length > 0) {
                results = calmData2.filter(item => item.FileDirRef.endsWith(sourcePath));
            }
            if (results.length == 0) {
                setfiltercalmData2([]);
            } else {
                setfiltercalmData2(results);
                setpreData2(results);
            }
        }

        setfinalLastLink(sourcePath);
        _getAllDocuments(sourcePath);
        setisReloadDocument2(true);
        setisReloadDocument(false);
    }, [sourcePath, isReloadDocument, isRefreshGrid]);

    React.useEffect(() => {
        if (sourcePath != "" && isReloadDocument2 === true) {
            let results: any[] = [];
            if (calmData2.length > 0) {
                results = calmData2.filter(item => item.FileDirRef.endsWith(sourcePath));
            }
            if (results.length == 0) {
                setfiltercalmData2([]);
            } else {
                setfiltercalmData2(results);
                setpreData2(results);
            }
        }

        setfinalLastLink(sourcePath);
        _getAllDocuments(sourcePath);
        setisReloadDocument2(false);
        setisReloadDocument(false);
    }, [isReloadDocument2, isRefreshGrid]);

    React.useEffect(() => {
        _getDocumentsLink();
        setIsLoading(true);
        if (props.siteName) {
            provider._Documentlib(props.siteName, { SiteNameId: props.siteNameId }).then(() => {
            }).catch((error) => {
                const errorObj = {
                    ErrorMessage: error.toString(),
                    ErrorStackTrace: "",
                    CustomErrormessage: "Error is occuring while  useEffect",
                    PageName: "QuayClean.aspx",
                    ErrorMethodName: "useEffect ChemicalQrCode"
                };
                void logGenerator(provider, errorObj);
            });
        }
        if (props.siteNameId != null) {
            try {
                const select = ["ID,Title,QCStateId,QCState/Title"];
                const expand = ["QCState"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    expand: expand,
                    filter: `(ID eq'${props.siteNameId}')`,
                    listName: ListNames.SitesMaster,
                };
                provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                    if (!!results) {
                        results.map((data) => {
                            return (
                                {
                                    ID: data.ID,
                                    Title: data.Title,
                                    QCState: !!data.QCStateId ? data.QCState.Title : ''
                                }
                            );
                        });
                        const link = context.pageContext.web.absoluteUrl + `/${props.qCState}`;
                        setURL(link);
                        setIsLoading(false);
                    }
                    else {
                        setIsLoading(false);
                    }
                }).catch((error) => {
                    console.log(error);
                });
            } catch (ex) {
                const errorObj = {
                    ErrorMessage: ex.toString(),
                    ErrorStackTrace: "",
                    CustomErrormessage: "Error is occuring while  useEffect",
                    PageName: "QuayClean.aspx",
                    ErrorMethodName: "useEffect AssociateChemical"
                };
                void logGenerator(provider, errorObj);
            }
        } else {
            setIsLoading(false);
        }

    }, [props.qCState, state.isReload, selectedChemical, filterToDate, isRefreshGrid]);

    const onClickClose = () => {
        setisDocumentPanelOpen(false);
        setisShowAssetHistoryModel(false);
        setState(prevState => ({ ...prevState, isReload: !state.isReload }));
    };

    const onClickAssociateChemical = () => {
        setisShowAssetHistoryModel(true);
    };

    const onClickURLLink = () => {
        setLinkName("");
        setLinkURL("");
        setisUpdateURL(false);
        showPopupURL();
    };

    const _onItemInvoked = (): void => {
    };

    const _onItemSelected = (item: any): void => {
        if (item.length > 0) {
            setDeleteId(item);
            // setDeleteId(item[0].DID.ID);
            setisDisplayEDbtn(true);
        } else {
            setDeleteId(0);
            setisDisplayEDbtn(false);
        }
    };

    const _onItemSelectedURL = (item: any): void => {
        if (item.length > 0) {
            setDeleteURLId(item);
            // setDeleteId(item[0].DID.ID);
            setisDisplayEDbtn(true);
        } else {
            setDeleteURLId(0);
            setisDisplayEDbtn(false);
        }

        if (item.length == 1) {
            setLinkURL(item[0].LinkURL);
            setLinkName(item[0].Title);
            setIsDisplayEditButtonview(true);
        } else {
            setIsDisplayEditButtonview(false);
            setLinkURL("");
            setLinkName("");
        }
    };

    const _onItemSelected2 = (item: any): void => {
        if (item.length > 0) {
            const Document = item.filter((i: any) => i.ContentType === "Document");
            const Folder = item.filter((i: any) => i.ContentType === "Folder");
            setDeleteFolder(Folder);
            setDeleteFile(Document);
            setDeleteId2(item);
            setisDisplayEDbtn2(true);

        } else {
            setDeleteId2(0);
            setisDisplayEDbtn2(false);
        }
    };

    const onRenderFooterContent = () => {
        return <div>
            <PrimaryButton className="btn btn-danger" onClick={onClickClose} text="Close" />
        </div>;
    };

    const [isUploadingFile, setUploadingFile] = React.useState<boolean>(false);
    const allPromiseProgress = (fileUploadPromises: any[], fileUploadProgress: any): Promise<any> => {
        let progress = 0;
        fileUploadProgress(0);
        for (const awaitFileUpload of fileUploadPromises) {
            awaitFileUpload.then((file: any) => {
                progress++;
                const progPercentage = ((progress * 100) / fileUploadPromises?.length).toFixed(2);
                fileUploadProgress(progPercentage, file);
            });
        }
        return Promise.all(fileUploadPromises);
    };

    const onClickUpload = async () => {
        setcalmData2([]);
        setUploadingFile(true);
        let apiArray: any = [];
        let i = 0;
        let link;
        files?.map((cftItem: any) => {
            let DocumentData1 = {
                SiteNameId: props.siteNameId
            };
            apiArray.push(provider.uploadFilewithSiteUrl(cftItem.file, cftItem.folderServerRelativeURL, true, DocumentData1).then(async (item: any) => {
                console.log();
            }).catch(err => console.log(err)));
            if (i == 0) {
                link = cftItem.folderServerRelativeURL;
                i = i + 1;
            }
        });

        files.forEach((res: any) => {
            const logObj = {
                UserName: props?.loginUserRoleDetails?.title,
                SiteNameId: props.siteNameId,
                ActionType: UserActivityActionTypeEnum.Create,
                EntityType: UserActionEntityTypeEnum.AddDocument,
                // EntityId: res?.ID,
                EntityName: res?.name,
                Details: `Create Document (Add Document)`,
                StateId: props?.qCStateId
            };
            void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
        });

        const resultData: any[] = [];
        await allPromiseProgress(apiArray, (progPercentage: number, file: any) => {
            if (file) {
                resultData.push(file);
                uploadedFileCount += 1;
            }
            setPercentComplete(((progPercentage / 100) + percentComplete) % 1);
        });
        if (resultData.length === files.length) {
            uploadedFileCount = 0;
            setFiles([]);
        }
        setUploadingFile(false);
        await Promise.all(apiArray);
        hidePopup2();
        setisuploadlink(true);
        _getAllDocuments(link);
        setFiles([]);
    };

    const onClickUploadCancel = () => {
        hidePopup2();
        setFiles([]);
    };

    const onCloseModel = () => {
        setisDisplayFilterDialog(false);
    };

    const onClickPopupCreateFolder = () => {
        showPopup();
    };

    const onClickAddDocument = () => {
        showPopup2();
    };

    const onClickCancel = () => {
        settitle("");
        hidePopup();
    };

    const onClickLinkCancel = () => {
        if (DeleteURLId) {
            _getURLLinkData();
        }
        setdisplayerrorTitle(false);
        setdisplayerror(false);
        setdisplayerrorSiteURL(false);
        setLinkName("");
        setLinkURL("");
        hidePopupURL();
        hidePopupRename();
    };

    const onclickEditURL = () => {
        setisUpdateURL(true);
        showPopupURL();
    };

    const onClickLinkSave = async () => {
        if (LinkURL !== "" && LinkName !== "") {
            let toastMessage: string = "";
            const toastId = toastService.loading('Loading...');
            toastMessage = 'Link URL insert successfully!';

            const item: any = {
                Title: LinkName,
                LinkURL: LinkURL,
                SiteNameId: props.siteNameId
            };
            await provider.createItem(item, ListNames.URLLink).then(async (item: any) => {
                const logObj = {
                    UserName: props?.loginUserRoleDetails?.title,
                    SiteNameId: props.siteNameId,
                    ActionType: UserActivityActionTypeEnum.Create,
                    EntityType: UserActionEntityTypeEnum.LinkURL,
                    EntityId: Number(item?.data?.ID),
                    EntityName: LinkName,
                    Details: `Add URL link ${LinkURL}`,
                    StateId: props?.qCStateId
                };
                void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
                console.log(item);

                toastService.updateLoadingWithSuccess(toastId, toastMessage);

                setLinkName("");
                setLinkURL("");
                hidePopupURL();
                _getURLLinkData();
            }).catch(err => console.log(err));
        } else if (LinkName == "") {
            setdisplayerrorTitle(true);
        } else if (LinkURL == "") {
            setdisplayerrorSiteURL(true);
        }
    };

    const onClickLinkUpdate = async () => {
        if (LinkURL !== "" && LinkName !== "") {
            let toastMessage: string = "";
            const toastId = toastService.loading('Loading...');
            toastMessage = 'Link URL update successfully!';

            const item: any = {
                Title: LinkName,
                LinkURL: LinkURL,
                SiteNameId: props.siteNameId
            };
            await provider.updateItemWithPnP(item, ListNames.URLLink, DeleteURLId[0].ID).then(async (item: any) => {
                const logObj = {
                    UserName: props?.loginUserRoleDetails?.title,
                    SiteNameId: props.siteNameId,
                    ActionType: UserActivityActionTypeEnum.Update,
                    EntityType: UserActionEntityTypeEnum.LinkURL,
                    EntityId: Number(DeleteURLId[0]?.ID),
                    EntityName: LinkName,
                    Details: `Update URL link ${LinkURL}`,
                    StateId: props?.qCStateId
                };
                void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                setLinkName("");
                setLinkURL("");
                hidePopupURL();
                _getURLLinkData();
            }).catch(err => console.log(err));
        } else if (LinkName == "") {
            setdisplayerrorTitle(true);
        } else if (LinkURL == "") {
            setdisplayerrorSiteURL(true);
        }

    };

    const cleanLink = (link: string): string => {
        // Use regex to remove spaces before and after slashes
        return link.replace(/\s*\/\s*/g, '/');
    };


    const onClickCreateFolder = async () => {
        setIsLoading(true);
        let newFolderName = "";
        let finalnewFolderName = "";
        let test = "";
        if (filtercalmData2.length > 0) {
            newFolderName = `${filtercalmData2[0].FileDirRef}/${title}`;
            test = `${filtercalmData2[0].FileDirRef}`;
        }
        else {
            if (preData2.length > 0) {
                newFolderName = `${preData2[0].FileRef}/${title}`;
                test = `${preData2[0].FileRef}`;
            } else {
                newFolderName = `${context.pageContext.web.serverRelativeUrl}/${"SiteDocuments"}/${props.siteName}/${title}`;
            }
        }
        if (finalLastLink == "" || finalLastLink == undefined) {
            finalnewFolderName = newFolderName;
        } else {
            finalnewFolderName = `${finalLastLink}/${title}`;
        }
        const cleanedLink = cleanLink(finalnewFolderName);

        await provider.createFolder(cleanedLink, {
            SiteNameId: Number(props.siteNameId)
        }).then(async () => {
            settitle("");
            const logObj = {
                UserName: props?.loginUserRoleDetails?.title,
                SiteNameId: Number(props.siteNameId),
                ActionType: UserActivityActionTypeEnum.Create,
                EntityType: UserActionEntityTypeEnum.AddDocument,
                // EntityId: res?.ID,
                EntityName: title,
                Details: `Create Folder Path ${finalnewFolderName}`,
                StateId: props?.qCStateId
            };
            void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
            _getAllDocuments(finalLastLink);
            hidePopup();
        });
    };
    const setFilesToState = (files: any[]) => {
        try {
            const selectedFiles: IFileWithBlob[] = [];
            let newFolderName;
            if (finalLastLink == "" || finalLastLink == undefined) {
                if (filtercalmData2.length > 0) {
                    newFolderName = `${filtercalmData2[0].FileDirRef}`;
                }
                else {
                    if (preData2.length > 0) {
                        newFolderName = `${preData2[0].FileRef}`;
                    } else {
                        newFolderName = `${context.pageContext.web.serverRelativeUrl}/${"SiteDocuments"}/${props.siteName}`;
                    }
                }
            } else {
                newFolderName = finalLastLink;
            }


            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const selectedFile: IFileWithBlob = {
                        file: file,
                        name: file.name,
                        folderServerRelativeURL: newFolderName || "",
                        overwrite: true,
                        key: i
                    };
                    selectedFiles.push(selectedFile);
                }
                setFiles(selectedFiles);
            } else {
                setFiles([]);
            }
        } catch (error) {
            console.log(error);
        }
    };


    const _getURLLinkData = () => {
        setIsLoading(true);
        try {
            const select = ["ID,Title,LinkURL,SiteNameId,SiteName/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteName"],
                filter: props.siteNameId ? `(SiteNameId eq '${props.siteNameId}' and IsDeleted ne 1)` : 'IsDeleted ne 1',
                listName: ListNames.URLLink,
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const LinkURLData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                Title: !!data.Title ? data.Title : "",
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                                SiteName: !!data.SiteName ? data.SiteName?.Title : "",
                                LinkURL: !!data.LinkURL ? data.LinkURL : ""
                            }
                        );
                    });
                    let filteredData: any[];
                    if (!!props.siteNameId || currentUserRoleDetail?.isAdmin) {
                        filteredData = LinkURLData;
                    } else {
                        let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                        filteredData = !!LinkURLData && LinkURLData?.filter(item =>
                            AllSiteIds.includes(item?.SiteNameId)
                        );
                    }
                    filteredData = filteredData?.sort((a: any, b: any) => {
                        return moment(b.Modified).diff(moment(a.Modified));
                    });
                    setURLLinkData(filteredData);
                    setIsLoading(false);
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });

        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    };

    const onClickRename = async () => {
        setIsLoading(true);
        let newLink = RenameFileRef.substring(0, RenameFileRef.lastIndexOf('/'));
        provider.RenameFile(RenameFileRef, Rename).then((res: any) => {
            console.log(res);
            _getAllDocuments(newLink);
            setIsLoading(false);
        }).catch((error: any) => {
            console.log(error);
            setIsLoading(false);
        });

        const logObj = {
            UserName: props?.loginUserRoleDetails?.title,
            SiteNameId: props.siteNameId,
            ActionType: UserActivityActionTypeEnum.Update,
            EntityType: UserActionEntityTypeEnum.AddDocument,
            // EntityId: res?.ID,
            EntityName: Rename,
            Details: `Rename folder name path ${newLink}`,
            StateId: props?.qCStateId
        };
        void UserActivityLog(provider, logObj, props?.loginUserRoleDetails)

        hidePopupRename();
    };

    // const onclickRefreshGrid = () => {
    //     setIsRefreshGrid(prevState => !prevState);
    // };

    const onclickRefreshGrid = () => {
        setIsLoading(true);

        const refreshPath =
            sourcePath ||
            finalLastLink ||
            "";

        _getAllDocuments(refreshPath);
    };

    const onClickRenameDialog = async (item: any) => {
        setRenameFileRef(item.FileRef);
        let orgName = item.FileLeafRef.replace(/\.[^/.]+$/, "");
        setRename(orgName);
        showPopupRename();
    };

    return <>
        {isPopupVisible2 && (
            <Layer>
                <Popup
                    className={popupStyles2.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={hidePopup2}
                >
                    <Overlay onClick={hidePopup2} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles2.content}>
                            <h2 className="mt-20">Upload Files</h2>
                            <React.Fragment>
                                <div className="mt15">
                                    <DragandDropFilePicker isMultiple={true} setFilesToState={setFilesToState} />
                                </div>

                                {isUploadingFile && <div className="progress-fileUpload">
                                    <div className="progress-Content">
                                        <ProgressIndicator label="Uploading Files..."
                                            description={`Successfully uploaded ${uploadedFileCount} file(s) out of ${files?.length}`}
                                            ariaValueText="Uploading Files..."
                                            barHeight={10}
                                            percentComplete={percentComplete}
                                        />
                                    </div>
                                </div>
                                }
                            </React.Fragment >
                            <DialogFooter>
                                {/* <PrimaryButton text="Upload" onClick={onClickUpload} className='mrt15 css-b62m3t-container btn btn-primary'
                                /> */}
                                <PrimaryButton
                                    text="Upload"
                                    onClick={onClickUpload}
                                    className={`mrt15 css-b62m3t-container btn ${!files || files.length === 0 ? 'btn-sec' : 'btn-primary'}`}
                                    disabled={!files || files.length === 0}
                                />
                                <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickUploadCancel} />
                            </DialogFooter>
                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}

        {isPopupVisible && (
            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={hidePopup}
                >
                    <Overlay onClick={hidePopup} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Create Folder</h2>
                            <TextField className="formControl mt-20" label="Folder Name" placeholder="Enter new folder name"
                                value={title}
                                required
                                onChange={onChangeTitle} />

                            <DialogFooter>
                                <PrimaryButton
                                    text="Create"
                                    disabled={title.trim() === ""}
                                    onClick={onClickCreateFolder}
                                    className={`mrt15 css-b62m3t-container btn ${title.trim() === "" ? 'btn-sec' : 'btn-primary'}`}
                                />
                                <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickCancel} />
                            </DialogFooter>

                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}

        {isDocumentPanelOpen &&
            <Panel
                isOpen={isDocumentPanelOpen}
                onDismiss={onClickClose}
                type={PanelType.extraLarge}
                headerText="Documents View"
                onRenderFooterContent={onRenderFooterContent}
            >
                <iframe src={documnetUrl} style={{ width: "100%", height: "90vh" }} />
            </Panel >
        }
        {isDisplayFilterDialog &&
            <CustomModal
                isModalOpenProps={isDisplayFilterDialog}
                dialogWidth={"300px"}
                setModalpopUpFalse={onCloseModel}
                subject={"Warning"}
                message={<div>Please select filter value</div>}
                yesButtonText="Ok"
                onClickOfYes={onCloseModel}
            />}
        <Dialog
            hidden={hideDialog}
            onDismiss={toggleHideDialog}
            dialogContentProps={dialogContentProps}>
            <DialogFooter>
                <PrimaryButton text="Ok" onClick={toggleHideDialog} className="ms-Button ms-Button--success dialog-space" />
            </DialogFooter>
        </Dialog>
        {(
            <CustomModal isModalOpenProps={hideDialogdeleteURL} setModalpopUpFalse={() => toggleHideDialogdeleteURL()} subject={"Delete  Confirmation "} message={<div>Are you sure, you want to delete this record?</div>} yesButtonText="Yes" closeButtonText={"No"} onClickOfYes={onclickdeleteURL} />
        )}
        {(
            <CustomModal isModalOpenProps={hideDialogdelete} setModalpopUpFalse={() => toggleHideDialogdelete()} subject={"Delete  Confirmation "} message={<div>Are you sure, you want to delete this record?</div>} yesButtonText="Yes" closeButtonText={"No"} onClickOfYes={onclickdelete} />
        )}
        {(
            <CustomModal isModalOpenProps={hideDialogdelete2} setModalpopUpFalse={() => toggleHideDialogdelete2()} subject={"Delete  Confirmation "} message={<div>Are you sure, you want to delete?</div>} yesButtonText="Yes" closeButtonText={"No"} onClickOfYes={onclickdelete2} />
        )}
        {isLoading && <Loader />}
        {isShowAssetHistoryModel && <DocumentsLibDialog manageComponentView={props.manageComponentView} qCState={props.qCState} siteName={props.siteName} context={context} provider={provider} AlocateChemical={AssocitedChemicalArray} SiteURL={URL} siteNameId={props.siteNameId} onClickClose={onClickClose} isModelOpen={isShowAssetHistoryModel} loginUserRoleDetails={currentUserRoleDetail} />}
        <div className={!!props.siteName ? "" : "boxCard"}>
            {!props.siteName && <div className="ms-Grid-row">
                <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                    <h1 className="mainTitle">Document Library</h1>
                </div>
            </div>}
            <div className='ms-Grid-row p-14 pmt-15 more-page-wrapper'>
                <div className='ms-md12 ms-sm12 ms-Grid-col'>
                    <div className='card dashboard-card p00'>
                        <div className='card-header'></div>
                        <div className='p-15 height211 lightgrey2'>
                            <div className="" id="SCpivot">

                                <Pivot aria-label="Basic Pivot Example" id="mainpivot " selectedKey={selectedKey}
                                    onLinkClick={_onLinkClick}>
                                    <PivotItem headerText="Add Document" itemKey="Add Document">
                                        <React.Suspense fallback={<></>}>
                                            {props.siteName ?
                                                <CustomBreadcrumb
                                                    siteServerRelativeURL={`${context.pageContext.web.serverRelativeUrl}`}
                                                    parentBreadCrumbItem={{
                                                        key: `${context.pageContext.web.serverRelativeUrl}/${"SiteDocuments"}/${props.siteName}`,
                                                        text: `${props.siteName}`
                                                    }}
                                                    setSourcePath={setSourcePath} // set a new path when click on breadcrumb item.
                                                    newBreadcrumbItem={newBreadcrumbItem || undefined} // add a new item in breadcrumb when folder is clicked
                                                /> :
                                                <CustomBreadcrumb
                                                    siteServerRelativeURL={`${context.pageContext.web.serverRelativeUrl}`}
                                                    parentBreadCrumbItem={{
                                                        key: `${context.pageContext.web.serverRelativeUrl}/${"SiteDocuments"}`,
                                                        text: `${"Site Documents"}`
                                                    }}
                                                    setSourcePath={setSourcePath} // set a new path when click on breadcrumb item.
                                                    newBreadcrumbItem={newBreadcrumbItem || undefined} // add a new item in breadcrumb when folder is clicked
                                                />
                                            }
                                        </React.Suspense>
                                        <div className='p-15 msgridpad'>
                                            <div className="">
                                                <div className='card-box-new mb30 '>
                                                    <div className="ms-Grid-row justify-content-start">
                                                        <div className="ms-Grid-row justify-content-start">
                                                            {currentView === "grid" ? <>
                                                                <MemoizedDetailList
                                                                    manageComponentView={props.manageComponentView}
                                                                    columns={AddDocumentColumn() as any}
                                                                    items={filtercalmData2.length > 0 || notFoundFF2 ? filtercalmData2 : calmData2}
                                                                    reRenderComponent={true}
                                                                    searchable={true}
                                                                    isAddNew={true}
                                                                    CustomselectionMode={isVisibleCrud.current && props.siteNameId ? SelectionMode.multiple : SelectionMode.none}
                                                                    // CustomselectionMode={!props.IsSupervisor ? SelectionMode.none : SelectionMode.none}
                                                                    onItemInvoked={_onItemInvoked}
                                                                    onSelectedItem={_onItemSelected2}
                                                                    addEDButton={(isDisplayEDbtn2 && isVisibleCrud.current) && <>
                                                                        <Link className="actionBtn btnDanger iconSize  ml-10" onClick={onclickconfirmdelete2}>
                                                                            <TooltipHost content={"Delete"} id={tooltipId}>
                                                                                <FontAwesomeIcon icon="trash-alt" />
                                                                            </TooltipHost>
                                                                        </Link>
                                                                    </>}
                                                                    addNewContent={<div className="dflex pb-1 mb-sm-3">
                                                                        <Link className="actionBtn iconSize btnRefresh add-doc-icon-m" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                                                            text="">
                                                                            <TooltipHost
                                                                                content={"Refresh Grid"}
                                                                                id={tooltipId}
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    icon={"arrows-rotate"}
                                                                                />
                                                                            </TooltipHost> </Link>
                                                                        {(isVisibleCrud.current) &&
                                                                            <>
                                                                                {isVisibleCrud.current && props.siteNameId &&
                                                                                    <div>
                                                                                        <TooltipHost
                                                                                            content={"Create New Folder"}
                                                                                            id={tooltipId}
                                                                                        >
                                                                                            <PrimaryButton text="Create Folder" onClick={onClickPopupCreateFolder} className="btn btn-primary ml5" />
                                                                                        </TooltipHost>
                                                                                        <TooltipHost
                                                                                            content={"Add Document"}
                                                                                            id={tooltipId}
                                                                                        >
                                                                                            <PrimaryButton text="Add" onClick={onClickAddDocument} className="btn btn-primary ml5" />
                                                                                        </TooltipHost>
                                                                                    </div>}
                                                                            </>}
                                                                    </div>
                                                                    }
                                                                />
                                                            </> :
                                                                <>
                                                                    <AddDocumentCardView
                                                                        items={filtercalmData2.length > 0 || notFoundFF2 ? filtercalmData2 : calmData2}
                                                                    />
                                                                </>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </PivotItem>
                                    <PivotItem headerText="Link Document" itemKey="Link Document">
                                        <div className='p-15 msgridpad2'>
                                            <div className="">
                                                <div className='card-box-new mb30 '>
                                                    <div className="ms-Grid-row justify-content-start">
                                                        <div className="ms-Grid-row justify-content-start">
                                                            <div id="DLGrid" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dialog-grid">
                                                                <MemoizedDetailList
                                                                    manageComponentView={props.manageComponentView}
                                                                    columns={DocumentsLinkColumn() as any}
                                                                    items={filtercalmData.length > 0 || notFoundFF ? filtercalmData : calmData}
                                                                    reRenderComponent={true}
                                                                    searchable={true}
                                                                    isAddNew={true}
                                                                    CustomselectionMode={isVisibleCrud.current && props.siteNameId ? SelectionMode.multiple : SelectionMode.none}
                                                                    onItemInvoked={_onItemInvoked}
                                                                    onSelectedItem={_onItemSelected}
                                                                    gridId="DLGrid"
                                                                    addEDButton={(isDisplayEDbtn && isVisibleCrud.current) && <>
                                                                        <Link className="actionBtn btnDanger iconSize  ml-10" onClick={onclickconfirmdelete}>
                                                                            <TooltipHost content={"Delete"} id={tooltipId}>
                                                                                <FontAwesomeIcon icon="trash-alt" />
                                                                            </TooltipHost>
                                                                        </Link>
                                                                    </>}
                                                                    addNewContent={<div className="dflex mb-sm-3">
                                                                        <Link className="actionBtn iconSize btnRefresh add-doc-icon-m" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                                                            text="">
                                                                            <TooltipHost
                                                                                content={"Refresh Grid"}
                                                                                id={tooltipId}
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    icon={"arrows-rotate"}
                                                                                />
                                                                            </TooltipHost> </Link>
                                                                        {(isVisibleCrud.current) &&
                                                                            <>
                                                                                {isVisibleCrud.current &&
                                                                                    <div>{displayback &&
                                                                                        <TooltipHost
                                                                                            content={"<<  Back"}
                                                                                            id={tooltipId}>
                                                                                            <PrimaryButton text="<<  Back" onClick={_onClickBack} className="btn btn-primary clsbtnat btn-back-ml" />
                                                                                        </TooltipHost>
                                                                                    }
                                                                                        {props.siteNameId && <TooltipHost
                                                                                            content={"Link Document"}
                                                                                            id={tooltipId}>
                                                                                            <PrimaryButton text="Link Document" onClick={onClickAssociateChemical} className="btn btn-primary ml5 " />
                                                                                        </TooltipHost>}</div>}
                                                                            </>}
                                                                    </div>}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </PivotItem>
                                    <PivotItem headerText="Quick links" itemKey="Link URL">
                                        <div className='p-15 msgridpad2'>
                                            <div className="">
                                                <div className='card-box-new mb30 '>
                                                    <div className="ms-Grid-row justify-content-start">
                                                        <div className="ms-Grid-row justify-content-start">
                                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dialog-grid">
                                                                <MemoizedDetailList
                                                                    manageComponentView={props.manageComponentView}
                                                                    columns={URLLinkColumn() as any}
                                                                    items={URLLinkData.length > 0 ? URLLinkData : []}
                                                                    reRenderComponent={true}
                                                                    searchable={true}
                                                                    isAddNew={true}
                                                                    CustomselectionMode={isVisibleCrud.current && props.siteNameId ? SelectionMode.multiple : SelectionMode.none}
                                                                    onItemInvoked={_onItemInvoked}
                                                                    onSelectedItem={_onItemSelectedURL}

                                                                    addEDButton={(isDisplayEDbtn && isVisibleCrud.current) && <>
                                                                        <div className='dflex mb-sm-3'>
                                                                            {isDisplayEditButtonview && <Link className="actionBtn iconSize btnEdit " onClick={onclickEditURL}>
                                                                                <TooltipHost content={"Edit Detail"} id={tooltipId}>
                                                                                    <FontAwesomeIcon icon="edit" />
                                                                                </TooltipHost>
                                                                            </Link>}
                                                                            <Link className="actionBtn btnDanger iconSize  ml-10" onClick={onclickconfirmdeleteURL}>
                                                                                <TooltipHost content={"Delete"} id={tooltipId}>
                                                                                    <FontAwesomeIcon icon="trash-alt" />
                                                                                </TooltipHost>
                                                                            </Link>
                                                                        </div>
                                                                    </>}
                                                                    addNewContent={<div className="dflex mb-sm-3">
                                                                        <Link className="actionBtn iconSize btnRefresh add-doc-icon-m" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                                                            text="">
                                                                            <TooltipHost
                                                                                content={"Refresh Grid"}
                                                                                id={tooltipId}
                                                                            >
                                                                                <FontAwesomeIcon
                                                                                    icon={"arrows-rotate"}
                                                                                />
                                                                            </TooltipHost> </Link>
                                                                        {
                                                                            (isVisibleCrud.current) &&
                                                                            <>
                                                                                {isVisibleCrud.current && props.siteNameId &&
                                                                                    <div>
                                                                                        <TooltipHost
                                                                                            content={"Add Quick links"}
                                                                                            id={tooltipId}>
                                                                                            <PrimaryButton text="Add Quick links" onClick={onClickURLLink} className="btn btn-primary ml5 " />
                                                                                        </TooltipHost></div>}
                                                                            </>}
                                                                    </div>}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </PivotItem>
                                </Pivot>
                            </div >
                        </div>
                    </div>
                </div>
            </div >
        </div>
        {isPopupVisibleURL && (
            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={hidePopupURL}
                >
                    <Overlay onClick={hidePopupURL} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Add Link URL </h2>
                            <TextField className="formControl mt-20" label="Link Name" required placeholder="Enter Link Name"
                                value={LinkName}
                                onChange={onChangeLinkName} />
                            {displayerrorTitle &&
                                <div className="requiredlink">Enter Link Name</div>}
                            <TextField className="formControl" label="Link URL" required placeholder="Enter Link URL"
                                value={LinkURL}
                                onChange={onChangeLinkURL} />
                            {displayerror &&
                                <div className="requiredlink">Enter Valid Link URL</div>}
                            {displayerrorSiteURL &&
                                <div className="requiredlink">Enter Link URL</div>}
                            <DialogFooter>
                                {isUpdateURL &&
                                    <PrimaryButton text="Update" onClick={onClickLinkUpdate} className='mrt15 css-b62m3t-container btn btn-primary'
                                    />}
                                {!isUpdateURL && <>
                                    {(displayerrorTitle || displayerror) ?
                                        <PrimaryButton text="Save" onClick={onClickLinkSave} disabled={true} className='mrt15 css-b62m3t-container btn btn-secondary'
                                        /> :
                                        <PrimaryButton text="Save" onClick={onClickLinkSave} className='mrt15 css-b62m3t-container btn btn-primary'
                                        />}</>}
                                <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickLinkCancel} />
                            </DialogFooter>

                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}

        {isPopupVisibleRename && (
            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={hidePopupURL}
                >
                    <Overlay onClick={hidePopupURL} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Rename </h2>
                            <TextField className="formControl mt-20" label="Rename " placeholder="Enter New Name"
                                value={Rename}
                                onChange={onChangeRename} />
                            {displayerrorRename &&
                                <div className="requiredlink">Enter New Name</div>}

                            <DialogFooter>
                                {/* {isUpdateURL &&
                                    <PrimaryButton text="Update" onClick={onClickLinkUpdate} className='mrt15 css-b62m3t-container btn btn-primary'
                                    />}
                                {!isUpdateURL && <>
                                    {(displayerrorTitle || displayerror) ?
                                        <PrimaryButton text="Save" onClick={onClickLinkSave} disabled={true} className='mrt15 css-b62m3t-container btn btn-secondary'
                                        /> :
                                        <PrimaryButton text="Save" onClick={onClickLinkSave} className='mrt15 css-b62m3t-container btn btn-primary'
                                        />}</>} */}
                                <PrimaryButton text="Rename" onClick={onClickRename} className='mrt15 css-b62m3t-container btn btn-primary'
                                />
                                <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickLinkCancel} />
                            </DialogFooter>

                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}
        {menuTarget && (
            <ContextualMenu
                items={menuItems}
                target={menuTarget}
                onDismiss={onMenuDismiss}
                directionalHint={4} // DirectionalHint.bottomLeftEdge
            />
        )}
    </>;
};  