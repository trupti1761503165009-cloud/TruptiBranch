/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { Breadcrumb, DefaultButton, DialogFooter, FocusTrapZone, FontWeights, IBreadcrumbItem, IButtonStyles, IDropdownOption, IIconProps, IconButton, Layer, Link, Modal, Overlay, Panel, PanelType, Pivot, PivotItem, Popup, PrimaryButton, TextField, TooltipHost, getTheme, mergeStyleSets } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { IQuayCleanState } from "../../QuayClean";
import { GetSortOrder, _onItemSelected, getCAMLQueryFilterExpression, getCurrentLoginUser, getFileTypeIcon, getUniueRecordsByColumnName, logGenerator, showPremissionDeniedPage } from "../../../../../Common/Util";
import IPnPQueryOptions, { IPnPCAMLQueryOptions } from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ComponentNameEnum, ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDocument } from "../../../../../Interfaces/IDocument";
import { Loader } from "../../CommonComponents/Loader";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import CamlBuilder from "camljs";
import { APISiteLink, MicrosoftOfficeDocumentType } from "../../../../../Common/Constants/CommonConstants";
import { ActionMeta } from "react-select";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { SiteFilter } from "../../../../../Common/Filter/SiteFilter";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import { toastService } from "../../../../../Common/ToastService";
import axios from "axios";
import moment from "moment";
import { IssueView } from "../SafetyCulture/Issue";
import { ActionView } from "../SafetyCulture/Action";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../Common/Constants/DocumentConstants";

export interface IDocumnetProps {
    provider: IDataProvider;
    manageComponentView(componentProp: IQuayCleanState): any;
    currentCompomentName?: string;
    siteMasterId?: number;
    context: WebPartContext;
    breadCrumItems?: IBreadCrum[];
    qCState?: any;
    loginUserRoleDetails?: ILoginUserRoleDetails;
    isViewSiteDialog: boolean;
    data?: any;
    isCloseVieSiteDialog?: any;
    siteName?: any;
    IsSupervisor?: boolean;
    componentProp?: any;
}

export interface IDocumnetState {
    column?: any[];
    documentItem: IDocument[];
    isDocumentPanelOpen: boolean;
    isDocumentPanelActionOpen: boolean;
    documnetUrl: string;
    isRelod: boolean;
}

const theme = getTheme();

const contentStyles = mergeStyleSets({
    container: {
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'stretch',
        width: "1200px"
    },
    header: [
        theme.fonts.xLargePlus,
        {
            flex: '1 1 auto',
            borderTop: `4px solid #1300a6`,
            color: theme.palette.neutralPrimary,
            display: 'flex',
            alignItems: 'center',
            fontWeight: FontWeights.semibold,
            padding: '12px 12px 14px 24px',
        },
    ],
    heading: {
        color: theme.palette.neutralPrimary,
        fontWeight: FontWeights.semibold,
        fontSize: 'inherit',
        margin: '0',
    },
    body: {
        flex: '4 4 auto',
        padding: '0 24px 24px 24px',
        overflowY: 'hidden',
        selectors: {
            p: { margin: '14px 0' },
            'p:first-child': { marginTop: 0 },
            'p:last-child': { marginBottom: 0 },
        },
    },
});

const iconButtonStyles: Partial<IButtonStyles> = {
    root: {
        color: theme.palette.neutralPrimary,
        marginLeft: 'auto',
        marginTop: '4px',
        marginRight: '2px',
    },
    rootHovered: {
        color: theme.palette.neutralDark,
    },
};

const cancelIcon: IIconProps = { iconName: 'Cancel' };

export const Documnet = (props: IDocumnetProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [DefaultFileName, setDefaultFilename] = React.useState<any>();
    const [FileNameOptions, setFileNameOptions] = React.useState<IDropdownOption[]>();
    const [selectedFileName, setSelectedFileName] = React.useState<any>("");
    const [updateDropDown, setupdateDropDown] = React.useState<boolean>(true);
    const [selectedSite, setSelectedSite] = React.useState<any>();
    const [selectedState, setSelectedState] = React.useState<any>();
    const [isFilterApply, setIsFilterApply] = React.useState<boolean>(false);
    const [siteOptions, setSiteOptions] = React.useState<IDropdownOption[]>();
    const [isFilter, setIsFilter] = React.useState<boolean>(true);
    const [keyUpdate, setKeyUpdate] = React.useState<number>(Math.random());
    const folderStructure = React.useRef<any[]>([]);
    const siteNameId = React.useRef<number>();
    const [selectedKey, setselectedKey] = React.useState<any>("Audit Reports");
    const folderStructureRenderItems = React.useRef<any[]>([]);
    const breadCrumFolderItems = React.useRef<IBreadcrumbItem[]>([]);
    const [noRecordsFound, setNoRecordsFound] = React.useState(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [isPopupVisibleAction, { setTrue: showPopupAction, setFalse: hidePopupAction }] = useBoolean(false);
    const [isPopupVisibleActionDelete, { setTrue: showPopupActionDelete, setFalse: hidePopupActionDelete }] = useBoolean(false);
    const [title, settitle] = React.useState<string>("");
    const [itemDocument, setitemDocument] = React.useState<any>(null);
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerror, setdisplayerror] = React.useState<boolean>(false);
    const [IssueData, setIssueData] = React.useState<any[]>([]);
    const [apiissueerror, setapiissueerror] = React.useState<boolean>(false);
    const ActionItem = React.useRef<any>();
    const ActionLink = React.useRef<any>("");
    const [linkFound, setlinkFound] = React.useState<boolean>(true);
    const [state, setState] = React.useState<IDocumnetState>({
        column: [],
        documentItem: [],
        isDocumentPanelOpen: false,
        isDocumentPanelActionOpen: false,
        documnetUrl: "",
        isRelod: false
    });

    const tooltipId = useId('tooltip');
    const onChangeTitle = (event: any): void => {
        settitle(event.target.value);
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
            maxWidth: '500px',
            width: width,
            padding: '0 1.5em 2em',
            position: 'absolute',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            borderTop: '3px solid #1300a6',
        }
    });

    const onChangeSendToEmail = (event: any): void => {
        setSendToEmail(event.target.value);
        const enteredValue = event.target.value;
        // const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const emailPattern = /^([^\s@]+@[^\s@]+\.[^\s@]+)(\s*;\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/;
        if (!enteredValue || emailPattern.test(enteredValue)) {
            setdisplayerror(false);
        } else {
            setdisplayerror(true);
        }
    };

    const _onBreadcrumbItemClicked = (ev: any, item: any) => {

        if (!!item.parent && item.parent.length > 0) {
            folderStructureRenderItems.current = folderStructure.current.filter(r => r.parent[r.parent.length - 1] == item.text && r.siteNameId == siteNameId.current);
            folderStructureRenderItems.current = folderStructureRenderItems.current.sort(GetSortOrder("isFolderNumber", true, "number"));
            breadCrumFolderItems.current = item.parent;
            const parentItemIndex = item.parent.findIndex((i: any) => i.text == item.text) + 1;
            breadCrumFolderItems.current = breadCrumFolderItems.current.slice(0, parentItemIndex);
        } else {
            breadCrumFolderItems.current = !!item.parent ? item.parent : [{
                text: "Audit Reports",
                key: ('Folder Documents'),
                onClick: _onBreadcrumbItemClicked
            }];
            folderStructureRenderItems.current = folderStructure.current.filter((r: any) => r.parent.length == folderStructure.current.map((r: any) => r.parent).sort()[0].length);
            folderStructureRenderItems.current = folderStructureRenderItems.current.sort(GetSortOrder("isFolderNumber", true, "number"));
        }

        setState(prevState => ({ ...prevState, documentItem: folderStructureRenderItems.current, isRelod: true }));
        setKeyUpdate(Math.random());
    };

    const onClickFolder = (item: IDocument) => {
        siteNameId.current = item.siteNameId;
        const currentFolderPath = `${item.fileDirRef}/${item.fileLeafRef}`;
        let items: any[] = breadCrumFolderItems.current.length > 0 ? breadCrumFolderItems.current : [];
        items.push({
            text: item.fileLeafRef,
            key: ('Folder' + item.fileLeafRef),
            parent: breadCrumFolderItems.current,
            onClick: _onBreadcrumbItemClicked
        });
        breadCrumFolderItems.current = items;
        folderStructureRenderItems.current = folderStructure.current.filter(r => r.fileDirRef == currentFolderPath);
        folderStructureRenderItems.current = folderStructureRenderItems.current.sort(GetSortOrder("isFolderNumber", true, "number"));
        setState(prevState => ({ ...prevState, documentItem: folderStructureRenderItems.current, isRelod: true }));
        setKeyUpdate(Math.random());
    };

    const genrateColumn = () => {
        const column: any[] = [
            {
                key: "key3", name: 'Action', fieldName: '', isResizable: true, minWidth: 140, maxWidth: 170,
                onRender: ((item: IDocument) => {
                    return <>
                        {!item.isFolder &&
                            <div className='dflex'>
                                <div>
                                    <Link className="actionBtn btnDownload dticon" onClick={() => {
                                        props.provider.downloadFile(
                                            item.fileRef, item.fileLeafRef);
                                    }}>
                                        <TooltipHost content={"Download"} id={tooltipId}>
                                            <FontAwesomeIcon icon="download" />
                                        </TooltipHost>
                                    </Link>
                                </div>
                                <div>
                                    <Link className="actionBtn btnView dticon" onClick={() => {
                                        setState(prevState => ({ ...prevState, isDocumentPanelOpen: true, documnetUrl: item.previewUrl }));
                                    }}>
                                        <TooltipHost content={"View Audit Reports"} id={tooltipId}>
                                            <FontAwesomeIcon icon="eye" />
                                        </TooltipHost>
                                    </Link>
                                </div>
                                <div>
                                    <Link className="actionBtn btnMoving dticon" onClick={() => onClickEmailDialog(item)}>
                                        <TooltipHost content={"Send Email"} id={tooltipId}>
                                            <FontAwesomeIcon icon="paper-plane" />
                                        </TooltipHost>
                                    </Link>
                                </div>
                            </div >
                        }
                    </>;
                })

            },
            {
                key: "key1", name: 'Audit Reports', fieldName: 'fileLeafRef', isResizable: true, minWidth: 200, maxWidth: 550, isSortingRequired: true, onRender: ((item: IDocument) => {
                    let fileIcon = getFileTypeIcon(item.fileLeafRef);
                    return <>
                        <div style={{ display: "flex" }} >
                            <Link onClick={() => {
                                if (item.isFolder) {
                                    // onClickFolder(item.fileLeafRef);
                                    onClickFolder(item);
                                } else {
                                    setState(prevState => ({ ...prevState, isDocumentPanelOpen: true, documnetUrl: item.previewUrl }));
                                }
                            }}>
                                <TooltipHost
                                    content={item.isFolder ? "Click to open" : "View Audit Reports"}
                                    id={tooltipId}
                                >
                                    {item.isFolder ? <FontAwesomeIcon className="folderBtn btnfolder dticon" icon="folder" /> : <img className="fileIcon dticon" src={fileIcon} />}
                                    {item.fileLeafRef}
                                </TooltipHost>

                            </Link>
                        </div>
                    </>;
                })
            },

            !!props.currentCompomentName && {
                key: "key3", name: 'Site Name ', fieldName: 'siteName', isResizable: true, minWidth: 140, maxWidth: 450, isSortingRequired: true
            },

        ];
        return column;
    };

    const genrateData = (documnetitems: any) => {
        let DocumentFullPath;
        if (documnetitems.length > 0) {
            return documnetitems.map((items: any, index: any) => {
                const filePath: string = `${!!items.ServerRedirectedEmbedUrl ? items.ServerRedirectedEmbedUrl : !!items.FileLeafRef ? window.location.origin + items.FileRef : ""}`;
                const embedFullFilePath = `${props.context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${!!items.ServerRedirectedEmbedUrl ? items.ServerRedirectedEmbedUrl : ""}&action=embedview`;
                const fileType = filePath.split('.').pop();
                if (MicrosoftOfficeDocumentType.indexOf(fileType || '') >= 0)
                    DocumentFullPath = embedFullFilePath;
                else
                    DocumentFullPath = (fileType === "zip" ? `${filePath}?web = 1 & action=embedview` : filePath);
                return {
                    id: !!items.Id ? items.Id : "",
                    siteNameId: !!items.SiteNameId ? items.SiteNameId : "",
                    fileLeafRef: !!items.FileLeafRef ? items.FileLeafRef : "",
                    fileRef: !!items.FileRef ? items.FileRef : "",
                    title: !!items.Title ? items.Title : "",
                    previewUrl: DocumentFullPath,
                    isFolder: items.FSObjType == "1" ? true : false,
                    currentItemKey: !!items.FileLeafRef ? items.FileLeafRef + index : "",
                    isFolderNumber: items.FSObjType == "1" ? 0 : 1,
                    parent: !!items.FileDirRef ? items.FileDirRef.split('/').filter((r: any) => !!r) : "",
                    fileDirRef: !!items.FileDirRef ? items.FileDirRef : "",
                    parentCurrent: !!items.FileRef ? items.FileRef.split('/').filter((r: any) => !!r) : "",
                    url: filePath
                };
            });
        }

    };

    const getDocumntLibrarayItems = async () => {
        const queryOptions: IPnPQueryOptions = {
            listName: ListNames.DocumentsDisplayName,
            select: ['Title,Id,FileLeafRef,FileRef,SiteNameId,ServerRedirectedEmbedUrl,FSObjType,FileDirRef'],
            filter: `SiteNameId eq ${props.siteMasterId}`,
            // siteUrl: props.context.pageContext.web.absoluteUrl + `/${props.qCState}`
        };
        return props.provider.getItemsByQuery(queryOptions);
    };



    const onClickEmailDialog = (item: any) => {
        setitemDocument(item);
        isPopupVisible;
        showPopup();
    };

    const onRenderFooterContent = () => {
        return <div>
            <PrimaryButton className="btn btn-danger" onClick={onClickClose} text="Close" />
        </div>;
    };

    const getAllSite = (currentUser?: any, isStateManager?: any) => {
        let filter = "";
        if (isStateManager === true) {
            filter = "";
        } else {
            filter = currentUser.IsSiteAdmin ? "" : `SiteManagerId eq ${currentUser.Id} or ADUserId eq ${currentUser.Id}`;
        }
        let queryOptions = {
            listName: ListNames.SitesMaster,
            select: ['Id,Title,QCStateId,QCState/Title'],
            expand: ['QCState'],
            // filter: currentUser.IsSiteAdmin ? "" : `SiteManagerId eq ${currentUser.Id} or ADUserId eq ${currentUser.Id}`
            filter: filter
        };
        return props.provider.getItemsByQuery(queryOptions);
    };

    const getAssignedDocumnets = async (currentUser: any, state: any, IsStateManager: boolean) => {
        let assignedTeam: any[] = [];
        const filterFieldsSite: ICamlQueryFilter[] = [];
        const filterFields: ICamlQueryFilter[] = [];
        let camlQuery: any;
        let siteMasterItems = getUniueRecordsByColumnName(state.map((r: any) => ({ state: r.QCState?.Title, ID: r.ID })), 'ID');
        if (isFilterApply && !!selectedSite) {
            siteMasterItems = siteMasterItems.filter(r => r.ID == selectedSite);
        }
        if (!!selectedState) {
            siteMasterItems = getUniueRecordsByColumnName(siteMasterItems.filter((r: any) => r.state == selectedState), 'state');
        }
        if (!!selectedFileName) {
            siteMasterItems = getUniueRecordsByColumnName(siteMasterItems, 'state');
        }

        filterFieldsSite.push({
            fieldName: `SiteName`,
            fieldValue: `${selectedSite}`,
            fieldType: FieldType.LookupById,
            LogicalType: LogicalType.EqualTo
        })
        filterFields.push({
            fieldName: `FileLeafRef`,
            fieldValue: `${selectedFileName}`,
            fieldType: FieldType.Text,
            LogicalType: LogicalType.EqualTo
        })

        camlQuery = new CamlBuilder()
            .View(["ID",
                "IdSiteName",
                "LinkFilename",
                "LinkFilename2",
                "ServerUrl",
                "SiteName",
                "Title",
                "MetaInfo",
                "Author",
                "BaseName",
                "ContentType",
                "EncodedAbsUrl",
                "FileDirRef",
                "FileLeafRef",
                "FileRef"])
            .Scope(CamlBuilder.ViewScope.RecursiveAll)
            .RowLimit(5000, true)
            .Query();

        const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
        const siteFilter: any[] = getCAMLQueryFilterExpression(filterFieldsSite);
        camlQuery.Where().All(categoriesExpressions);

        let finalQuery = camlQuery.ToString();
        if (filterFieldsSite.length > 0) {
            finalQuery = CamlBuilder.FromXml(camlQuery.ToString())
                .ModifyWhere().AppendAnd().Any(siteFilter).ToString();
        }

        if (!!selectedSite) {
            camlQuery = camlQuery.And().LookupField("SiteName").Id().EqualTo(selectedSite).select("");
        }
        if (!!selectedFileName)
            camlQuery = camlQuery.And().TextField("FileLeafRef").EqualTo(selectedFileName);

        const pnpQueryOptions: IPnPCAMLQueryOptions = {
            listName: ListNames.DocumentsDisplayName,
            queryXML: finalQuery,
            pageToken: "",
            pageLength: 100000
        }

        let filteredData: any;
        let data = await props.provider.getItemsByCAMLQuery(ListNames.DocumentsDisplayName, camlQuery.ToString(), null);
        for (let index = 0; index < siteMasterItems.length; index++) {
            if (data.length > 0) {
                setNoRecordsFound(false);
                filteredData = data.filter(item => {

                    if (currentUser?.IsSiteAdmin && !isFilterApply) {
                        return item.SiteName[0]?.lookupId === siteMasterItems[index].ID;
                    } else {
                        if (props?.loginUserRoleDetails?.isStateManager === true && !isFilterApply) {
                            return item.SiteName[0]?.lookupId === siteMasterItems[index].ID;
                        }
                        else if (!isFilterApply) {
                            return item.SiteName[0]?.lookupId === siteMasterItems[index].ID;
                        }
                        else {
                            return data;
                        }
                    }
                });

                assignedTeam.push(filteredData);
            } else {
                setNoRecordsFound(true);
            }

        }
        return assignedTeam;

    };

    React.useEffect(() => {
        if (props.isViewSiteDialog) {
            breadCrumFolderItems.current = [{
                text: "Audit Reports",
                key: ('Folder Documents'),
                onClick: _onBreadcrumbItemClicked
            }];
        }

    }, []);

    const onClickCancel = () => {
        setitemDocument(null);
        settitle("");
        setSendToEmail("");
        hidePopup();
        hidePopupAction();
    };

    const onClickCancelAction = () => {
        hidePopupAction();
        hidePopupActionDelete();
    };

    const onClickSendEmail = async () => {
        let toastMessage: string = "";
        const toastId = toastService.loading('Loading...');
        toastMessage = 'Email sent successfully!';

        let parts = itemDocument.fileRef.split('/');
        parts = parts.slice(3).join('/');

        const item: any = {
            Title: title,
            SendToEmail: sendToEmail,
            DocumentId: itemDocument.id,
            DocumentLink: parts
        };
        await props.provider.createItem(item, ListNames.AuditReportEmail).then(async (item: any) => {
            toastService.updateLoadingWithSuccess(toastId, toastMessage);

            onClickCancel();
            // hidePopup();
        }).catch(err => console.log(err));

    };

    React.useEffect(() => {
        if (props.isViewSiteDialog == false) {
            if (!!props.loginUserRoleDetails) {
                let permssiion = showPremissionDeniedPage(props.loginUserRoleDetails);
                if (permssiion.length == 0) {
                    props.manageComponentView({ currentComponentName: ComponentNameEnum.AccessDenied });
                }
            }
            void (async () => {
                try {
                    setIsLoading(true);
                    const column = genrateColumn();
                    let currentUser;
                    let siteMasterItems;
                    let assignedDocuments: any;
                    if (!!props.currentCompomentName) {

                        if (!!props?.loginUserRoleDetails?.isStateManager === true && !props?.loginUserRoleDetails?.isAdmin) {
                            let stateId = props?.loginUserRoleDetails?.stateManagerStateItem;
                            let filteredData = await getAllSite(currentUser, true);
                            siteMasterItems = filteredData.filter((item: any) => stateId?.includes(item.QCStateId));
                            assignedDocuments = await getAssignedDocumnets(currentUser, siteMasterItems, true);
                        } else {
                            currentUser = await getCurrentLoginUser(props.provider);
                            siteMasterItems = await getAllSite(currentUser);
                            assignedDocuments = await getAssignedDocumnets(currentUser, siteMasterItems, false);
                        }
                        let newAssignedDocument: any[] = [];

                        for (let index = 0; index < assignedDocuments.length; index++) {
                            if (index == 0) {
                                newAssignedDocument = assignedDocuments[index];
                            } else {
                                newAssignedDocument = newAssignedDocument.concat(assignedDocuments[index]);
                            }
                        }
                        let DocumentFullPath;


                        newAssignedDocument = newAssignedDocument.map((items: any, index) => {
                            const filePath: string = `${!!items.ServerRedirectedEmbedUrl ? items.ServerRedirectedEmbedUrl : !!items.FileLeafRef ? window.location.origin + items.FileRef : ""}`;
                            const embedFullFilePath = `${props.context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${!!items.ServerRedirectedEmbedUrl ? items.ServerRedirectedEmbedUrl : ""}&action=embedview`;
                            const fileType = filePath.split('.').pop();
                            if (MicrosoftOfficeDocumentType.indexOf(fileType || '') >= 0)
                                DocumentFullPath = embedFullFilePath;
                            else
                                DocumentFullPath = (fileType === "zip" ? `${filePath}?web = 1 & action=embedview` : filePath);
                            return {
                                id: !!items.ID ? items.ID : "",
                                siteNameId: items.SiteName.length > 0 ? items.SiteName[0].lookupId : "",
                                siteName: items.SiteName.length > 0 ? items.SiteName[0].lookupValue : "",
                                fileLeafRef: !!items.FileLeafRef ? items.FileLeafRef : "",
                                fileRef: !!items.FileRef ? items.FileRef : "",
                                title: !!items.FileLeafRef ? items.FileLeafRef : "",
                                stateName: !!items.StateName ? items.StateName : "",
                                parent: !!items.FileDirRef ? items.FileDirRef.split('/').filter((r: any) => !!r) : "",
                                fileDirRef: !!items.FileDirRef ? items.FileDirRef : "",
                                isFolder: items.FSObjType == "1" ? true : false,
                                isFolderNumber: items.FSObjType == "1" ? 0 : 1,
                                currentItemKey: !!items.FileLeafRef ? items.FileLeafRef + index : "",
                                previewUrl: DocumentFullPath,
                                url: filePath
                            };
                        });

                        if (!!selectedState) {

                            const newFilterData = newAssignedDocument.filter(record => record.stateName == selectedState);
                            folderStructureRenderItems.current = newFilterData.filter(r => r.parent.length == newFilterData.map(r => r.parent).sort()[0].length);
                            folderStructureRenderItems.current = folderStructureRenderItems.current.sort(GetSortOrder("isFolderNumber", true, "number"));
                            getUniueRecordsByColumnName(newFilterData, "title");
                            setIsLoading(false);
                            setState(prevState => ({ ...prevState, column: column, documentItem: newFilterData, isRelod: true }));
                        }
                        else {

                            folderStructure.current = newAssignedDocument;
                            if (!!folderStructure.current && folderStructure.current.length > 0) {
                                breadCrumFolderItems.current = [{
                                    text: "Audit Reports",
                                    key: ('Folder Documents'),
                                    onClick: _onBreadcrumbItemClicked
                                }];
                                folderStructureRenderItems.current = newAssignedDocument.filter(r => r.parent.length == newAssignedDocument.map(r => r.parent).sort()[0].length);
                                folderStructureRenderItems.current = folderStructureRenderItems.current.sort(GetSortOrder("isFolderNumber", true, "number"));
                                getUniueRecordsByColumnName(newAssignedDocument, "title");
                                setState(prevState => ({ ...prevState, column: column, documentItem: newAssignedDocument, isRelod: true }));
                            }
                            setIsLoading(false);
                        }
                        if (updateDropDown) {
                            let dropvalue: any = [];
                            let FilesData: any = [];
                            dropvalue.push({ key: '', text: '', value: 'All', label: " --All--" });
                            if (props?.loginUserRoleDetails?.stateManagerSitesItemIds && !props?.loginUserRoleDetails?.isAdmin) {
                                FilesData = newAssignedDocument.filter(item => props?.loginUserRoleDetails?.stateManagerSitesItemIds.includes(item.siteNameId));
                            } else {
                                FilesData = newAssignedDocument;
                            }
                            FilesData?.map((opt: any, index: any) => {
                                dropvalue.push({
                                    value: opt.title,
                                    key: opt.title,
                                    text: opt.title,
                                    label: opt.title
                                });
                            });
                            setFileNameOptions(dropvalue);
                            setupdateDropDown(false);
                        }
                    } else {
                        const [documnetLibrarayItem] = await Promise.all([getDocumntLibrarayItems()]);
                        let data = genrateData(documnetLibrarayItem);
                        folderStructure.current = data;
                        if (!!folderStructure.current && folderStructure.current.length > 0) {
                            breadCrumFolderItems.current = [{
                                text: "Audit Reports",
                                key: ('Folder Documents'),
                                onClick: _onBreadcrumbItemClicked
                            }];
                            folderStructureRenderItems.current = data.filter((r: any) => r.parent.length == data.map((r: any) => r.parent).sort()[0].length);
                            folderStructureRenderItems.current = folderStructureRenderItems.current.sort(GetSortOrder("isFolderNumber", true, "number"));
                            setState(prevState => ({ ...prevState, column: column, documentItem: folderStructureRenderItems.current }));
                        }
                    }
                    setIsLoading(false);
                } catch (error) {
                    console.log(error);
                    setIsLoading(false);
                    const errorObj = {
                        ErrorMessage: error.toString(),
                        ErrorStackTrace: "",
                        CustomErrormessage: "Error is occuring while  useEffect",
                        PageName: "QuayClean.aspx",
                        ErrorMethodName: "useEffect Documnet"
                    };
                    void logGenerator(props.provider, errorObj);
                }
            })();
        } else {
            setIsLoading(true);
            const column = genrateColumn();
            folderStructure.current = props.data;
            folderStructureRenderItems.current = props.data.filter((r: any) => r.parent.length == props.data.map((r: any) => r.parent).sort()[0].length);
            folderStructureRenderItems.current = folderStructureRenderItems.current.sort(GetSortOrder("isFolderNumber", true, "number"));
            setState(prevState => ({ ...prevState, column: column, isRelod: true }));
            setTimeout(() => {
                setIsLoading(false);
            }, 1500);

        }
    }, [selectedSite, selectedFileName, selectedState]);

    const _onFileNameChange = (option: any, actionMeta: ActionMeta<any>): void => {
        setSelectedFileName(option?.text);
        setIsFilterApply(true);
        setDefaultFilename(option?.value);
        if (option.label == " --All--") {
            setIsFilterApply(false);
        }
    };

    const onSiteChange = (selectedOption: any): void => {
        setSelectedSite(selectedOption?.value);
        setIsFilterApply(true);
        if (selectedOption.label == " --All--") {
            setIsFilterApply(false);
            setSelectedSite("");
        }
    };

    const _onLinkClick = (item: PivotItem): void => {
        if (item.props.itemKey == "Safety Culture") {
            // setLastFolder("");
        }
        setselectedKey(item.props.itemKey);
    };

    const onClickDeleteLink = async () => {
        try {
            const taskdata = await axios.get(`${APISiteLink.SafetyCulture}/api/SafetyCulture/DeleteActionLinkByTaskId?${ActionItem.current.taskId}`);
            ActionLink.current = taskdata.data.link.url;
            setlinkFound(false);
        } catch (error) {
            setIsLoading(false);
            console.log('Error fetching data from API:', error);
            if (error.response.status == "404") {
                setlinkFound(false);
            } else {
                setlinkFound(true);
            }
        }
        hidePopupActionDelete();
        setState(prevState => ({ ...prevState, isDocumentPanelActionOpen: true }));
    };



    const onClickGenerateLink = async () => {

        try {
            const taskdata = await axios.get(`${APISiteLink.SafetyCulture}/api/SafetyCulture/CreateActionLinkByTaskId?TaskId=${ActionItem.current.taskId}`);
            ActionLink.current = taskdata.data.link.url;
            setlinkFound(true);
        } catch (error) {
            setIsLoading(false);
            console.log('Error fetching data from API:', error);
            if (error.response.status == "404") {
                setlinkFound(false);
            } else {
                setlinkFound(true);
            }
        }
        hidePopupAction();
        setState(prevState => ({ ...prevState, isDocumentPanelActionOpen: true }));
    };

    const onClickCreateActionLink = () => {
        showPopupAction();
    };

    const onClickDeleteActionLink = () => {
        showPopupActionDelete();
    };


    const onClickClose = () => {
        setState(prevState => ({ ...prevState, isDocumentPanelOpen: false, isDocumentPanelActionOpen: false }));
    };

    const fetchDataFromIssueAPI = async () => {
        try {
            const response = await axios.get(`${APISiteLink.SafetyCulture}/api/SafetyCulture/GetIssues?SiteName=${props.siteName}`);
            return response?.data;
            setapiissueerror(false);
        } catch (error) {
            setIsLoading(false);
            console.log('Error fetching data from API:', error);
            if (error?.response?.data?.Message == "Site ID is required. Site Not Found!") {
                setapiissueerror(true);
            }
        }
    };

    React.useEffect(() => {
        try {

            setIsLoading(true);
            const fetchIssueData = async () => {
                try {
                    const responseData = await fetchDataFromIssueAPI();
                    if (responseData?.actions.length > 0) {
                        const extractedData = responseData.map((item: any) => ({
                            unique_id: item.task.unique_id,
                            title: item.task.title,
                            status_id: item.task.status_id,
                            name: item.task.site.name,
                            priority_id: item.task.priority_id,
                            firstname: item.task.creator.firstname,
                            lastname: item.task.creator.lastname
                        }));
                        setIssueData(extractedData);
                    }
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 1000);
                } catch (error) {
                    setTimeout(() => {
                        setIsLoading(false);
                    }, 2000);

                } finally {

                }
            };

            fetchIssueData();
        } catch (error) {
            setIsLoading(false);
            // Handle error
        }
    }, []);






    return <>
        {isLoading && <Loader />}

        {state.isDocumentPanelOpen &&
            <Panel
                isOpen={state.isDocumentPanelOpen}
                onDismiss={onClickClose}
                type={PanelType.extraLarge}
                headerText="Audit Reports View"
                onRenderFooterContent={onRenderFooterContent}
            >
                <iframe src={state.documnetUrl} style={{ width: "100%", height: "90vh" }} />
            </Panel >
        }
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
                            <h2 className="mt-10">Send Email </h2>
                            <TextField className="formControl mt-20" label="Receiver name " placeholder="Enter Receiver name"
                                value={title}
                                onChange={onChangeTitle} />
                            <TextField className="formControl" label="Receiver email" placeholder="Enter Receiver email"
                                value={sendToEmail}
                                onChange={onChangeSendToEmail} />
                            {displayerror &&
                                <div className="requiredlink">Enter Valid Email</div>}
                            <DialogFooter>
                                <PrimaryButton text="Send" onClick={onClickSendEmail} className='mrt15 css-b62m3t-container btn btn-primary'
                                />
                                <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickCancel} />
                            </DialogFooter>

                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}



        {!!props.currentCompomentName ? <div className="boxCard">
            <div className="formGroup">
                <div className="ms-Grid mb-3 mt-15">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <h1 className="mainTitle">Safety Culture</h1>
                        </div>
                        <div className='ms-Grid-row p-14'>
                            <div className='ms-md12 ms-sm12 ms-Grid-col'>
                                <div className='card dashboard-card p00'>
                                    <div className='p-15 msgridpadaction'>
                                        <div className="">
                                            <div className='card-box-new mb30 '>
                                                <div className="ms-Grid-row justify-content-start">
                                                    <div className="ms-Grid-row justify-content-start">
                                                        <div id="" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dialog-grid">
                                                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                                                <div className="customebreadcrumb">
                                                                    <Breadcrumb
                                                                        items={props.breadCrumItems || [] as any[]}
                                                                        maxDisplayedItems={3}
                                                                        ariaLabel="Breadcrumb with items rendered as buttons"
                                                                        overflowAriaLabel="More links"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                                                <div className="formControl">
                                                                    {FileNameOptions &&
                                                                        < ReactDropdown
                                                                            options={FileNameOptions}
                                                                            isMultiSelect={false}
                                                                            defaultOption={DefaultFileName}
                                                                            onChange={_onFileNameChange}
                                                                            placeholder={"Audit Reports"}
                                                                        />}
                                                                </div>
                                                            </div>
                                                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                                                <div className="formControl">

                                                                    {isFilter == true &&
                                                                        <SiteFilter
                                                                            isPermissionFiter={true}
                                                                            loginUserRoleDetails={props.loginUserRoleDetails}
                                                                            selectedSite={selectedSite}
                                                                            onSiteChange={onSiteChange}
                                                                            provider={props.provider}
                                                                            isRequired={true}
                                                                            AllOption={true} />}
                                                                    {isFilter == false && siteOptions && selectedState != "" &&
                                                                        < ReactDropdown
                                                                            options={siteOptions}
                                                                            isMultiSelect={false}
                                                                            defaultOption={selectedSite}
                                                                            onChange={onSiteChange}
                                                                            placeholder={"Site"}
                                                                        />}
                                                                </div>
                                                            </div>
                                                            <div id="ARGrid" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12  showingresults">
                                                                {
                                                                    noRecordsFound ?
                                                                        <><NoRecordFound /> </> : <MemoizedDetailList
                                                                            key={keyUpdate}
                                                                            onSelectedItem={_onItemSelected}
                                                                            items={folderStructureRenderItems.current || []}
                                                                            reRenderComponent={true}
                                                                            addEDButton={
                                                                                <div className="designBreadCrumb">
                                                                                    <Breadcrumb
                                                                                        items={breadCrumFolderItems.current as any}
                                                                                        maxDisplayedItems={10}
                                                                                        ariaLabel="Breadcrumb with items rendered as buttons"
                                                                                        overflowAriaLabel="More links"
                                                                                    />
                                                                                </div>}
                                                                            gridId="ARGrid"
                                                                            searchable={true}
                                                                            columns={state.column as any}
                                                                            manageComponentView={props.manageComponentView}
                                                                        />
                                                                }

                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div >

                    </div>
                </div>
            </div>

        </div > :
            props.isViewSiteDialog == false &&
            <>
                <div className='ms-Grid-row p-14 pmt-15'>
                    <div className='ms-md12 ms-sm12 ms-Grid-col'>
                        <div className='card dashboard-card p00'>
                            <div className='card-header'></div>
                            <div className='p-15 height211 lightgrey2'>
                                <div className="">

                                    <Pivot aria-label="Basic Pivot Example" id="SCpivot" selectedKey={selectedKey}
                                        onLinkClick={_onLinkClick}>

                                        <PivotItem headerText="Audit Reports" itemKey="Audit Reports">
                                            <div className='p-15 msgridpadaction'>
                                                <div className="">
                                                    <div className='card-box-new mb30 '>
                                                        <div className="ms-Grid-row justify-content-start">
                                                            <div className="ms-Grid-row justify-content-start">
                                                                <div id="" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 dialog-grid">
                                                                    <div className="ms-Grid mb-3 clsgrid mt-15">
                                                                        <div className="ms-Grid-row">
                                                                            <div id="ARGrid2" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12  ">
                                                                                < MemoizedDetailList
                                                                                    onSelectedItem={_onItemSelected}
                                                                                    searchable={true}
                                                                                    reRenderComponent={true}
                                                                                    addEDButton={
                                                                                        <div className="designBreadCrumb">
                                                                                            <Breadcrumb
                                                                                                items={breadCrumFolderItems.current as any}
                                                                                                maxDisplayedItems={10}
                                                                                                ariaLabel="Breadcrumb with items rendered as buttons"
                                                                                                overflowAriaLabel="More links"
                                                                                            />

                                                                                        </div>}
                                                                                    gridId="ARGrid2"
                                                                                    items={folderStructureRenderItems.current || []}
                                                                                    columns={state.column as any}
                                                                                    manageComponentView={props.manageComponentView}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div >
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </PivotItem>
                                        <PivotItem headerText="Actions" itemKey="Actions">
                                            <div className='p-15 msgridpadaction'>
                                                <div className="">
                                                    <ActionView provider={props.provider} siteName={props.siteName} />
                                                </div>
                                            </div>
                                        </PivotItem>
                                        <PivotItem headerText="Issues" itemKey="Issues">
                                            <div className='p-15 msgridpadaction'>
                                                <div className="">
                                                    <div className='card-box-new mb30 '>
                                                        <div className="ms-Grid-row justify-content-start">
                                                            <div className="ms-Grid-row justify-content-start">
                                                                {/* Comming Soon... */}
                                                                <IssueView provider={props.provider} siteName={props.siteName} />
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

            </>
        }

        {
            props.isViewSiteDialog && <Modal
                titleAriaId={"titleId"}
                isOpen={props.isViewSiteDialog}
                onDismiss={() => props.isCloseVieSiteDialog()}
                isBlocking={false}
                isModeless={true}
                isDarkOverlay={true}
                containerClassName={contentStyles.container}
            >
                <div className={contentStyles.header}>
                    <h2 className={contentStyles.heading} id={"titleId"}>
                        {props.siteName}
                    </h2>
                    <IconButton
                        styles={iconButtonStyles}
                        iconProps={cancelIcon}
                        ariaLabel="Close popup modal"
                        onClick={() => props.isCloseVieSiteDialog()}
                    />
                </div>
                <div className={contentStyles.body}>
                    <div className="ms-SPLegacyFabricBlock">
                        <div className="formGroup">
                            <div className="ms-Grid">
                                <div className="ms-Grid-row">

                                    <div id="ARGrid3" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12  showingresults">
                                        <MemoizedDetailList
                                            key={keyUpdate}
                                            onSelectedItem={_onItemSelected}
                                            items={folderStructureRenderItems.current || []}
                                            reRenderComponent={true}
                                            addEDButton={
                                                <div className="designBreadCrumb">
                                                    <Breadcrumb
                                                        items={breadCrumFolderItems.current as any}
                                                        maxDisplayedItems={10}
                                                        ariaLabel="Breadcrumb with items rendered as buttons"
                                                        overflowAriaLabel="More links"
                                                    />
                                                </div>}
                                            searchable={true}
                                            isAddNew={true}
                                            gridId="ARGrid3"
                                            columns={state.column as any}
                                            manageComponentView={props.manageComponentView}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </Modal >
        }
        {isPopupVisibleAction && (
            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={hidePopupAction}
                >
                    <Overlay onClick={hidePopupAction} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Generate Action Link</h2>
                            <div className="mt-3">You are trying to generate a Public Link, Are you sure, you want to generate this Link?</div>
                            <DialogFooter>
                                <PrimaryButton text="Yes" onClick={onClickGenerateLink} className='mrt15 css-b62m3t-container btn btn-primary'
                                />
                                <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickCancelAction} />
                            </DialogFooter>

                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}
        {isPopupVisibleActionDelete && (
            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={hidePopupActionDelete}
                >
                    <Overlay onClick={hidePopupActionDelete} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Delete Action Link</h2>
                            <div className="mt-3">Once you delete it will not be accessible to anyone who has this link. Are you sure you want to Delete this Action Link?</div>
                            <DialogFooter>
                                <PrimaryButton text="Yes" onClick={onClickDeleteLink} className='mrt15 css-b62m3t-container btn btn-primary'
                                />
                                <DefaultButton text="No" className='secondMain btn btn-danger' onClick={onClickCancelAction} />
                            </DialogFooter>

                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}
    </>;

};