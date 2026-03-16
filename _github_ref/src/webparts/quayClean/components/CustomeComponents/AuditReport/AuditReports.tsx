/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { Breadcrumb, DefaultButton, DialogFooter, FocusTrapZone, FontWeights, IBreadcrumbItem, IButtonStyles, IDropdownOption, IIconProps, IconButton, Layer, Link, Modal, Overlay, Panel, PanelType, Pivot, PivotItem, Popup, PrimaryButton, TextField, TooltipHost, getTheme, mergeStyleSets } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { IQuayCleanState } from "../../QuayClean";
import { _onItemSelected, getCAMLQueryFilterExpression, getFileTypeIcon } from "../../../../../Common/Util";
import { IPnPCAMLQueryOptions } from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ListNames, SortOrder } from "../../../../../Common/Enum/ComponentNameEnum";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IDocument } from "../../../../../Interfaces/IDocument";
import { Loader } from "../../CommonComponents/Loader";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import CamlBuilder from "camljs";
import { APISiteLink, MicrosoftOfficeDocumentType } from "../../../../../Common/Constants/CommonConstants";
import { ActionMeta } from "react-select";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import { toastService } from "../../../../../Common/ToastService";
import axios from "axios";
import { IssueView } from "../SafetyCulture/Issue";
import { ActionView } from "../SafetyCulture/Action";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { Inspectionlist } from "../SafetyCulture/Inspection";
import { SafetyCultureReport } from "../../CommonComponents/Chart/ChartInspectionData";

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
    tab?: any;
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

export const AuditReports = (props: IDocumnetProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [filterFields, setFilterFields] = React.useState<ICamlQueryFilter[]>([{
        fieldName: "SiteName",
        fieldValue: "",
        fieldType: FieldType.LookupById,
        LogicalType: LogicalType.IsNotNull,
    }]);
    const [DefaultFileName, setDefaultFilename] = React.useState<any>();
    // const [allSiteId, setAllSiteId] = React.useState<number[]>([]);
    const allSiteId = React.useRef<number[]>([]);
    const [FileNameOptions, setFileNameOptions] = React.useState<IDropdownOption[]>();
    const [selectedFileName, setSelectedFileName] = React.useState<any>("");
    const [updateDropDown, setupdateDropDown] = React.useState<boolean>(true);
    const [selectedSite, setSelectedSite] = React.useState<any>();
    const [selectedState, setSelectedState] = React.useState<any>();
    const [isFilterApply, setIsFilterApply] = React.useState<boolean>(false);
    const [siteOptions, setSiteOptions] = React.useState<IDropdownOption[]>([]);
    const [isFilter, setIsFilter] = React.useState<boolean>(true);
    const [keyUpdate, setKeyUpdate] = React.useState<number>(Math.random());
    const folderStructure = React.useRef<any[]>([]);
    const siteNameId = React.useRef<number>();
    const [selectedKey, setselectedKey] = React.useState<any>("Inspection");
    const folderStructureRenderItems = React.useRef<any[]>([]);
    const filterRenderItems = React.useRef<any[]>([]);
    const breadCrumFolderItems = React.useRef<IBreadcrumbItem[]>([]);
    const [noRecordsFound, setNoRecordsFound] = React.useState(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [isPopupVisibleName, { setTrue: showPopupName, setFalse: hidePopupName }] = useBoolean(false);
    const [isPopupVisibleAction, { setTrue: showPopupAction, setFalse: hidePopupAction }] = useBoolean(false);
    const [isPopupVisibleActionDelete, { setTrue: showPopupActionDelete, setFalse: hidePopupActionDelete }] = useBoolean(false);
    const [title, settitle] = React.useState<string>("");
    const [name, setname] = React.useState<string>("");
    const [UpdateId, setUpdateId] = React.useState<number>(0);
    const [isReload, setisReload] = React.useState<boolean>(false);
    const [itemDocument, setitemDocument] = React.useState<any>(null);
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerror, setdisplayerror] = React.useState<boolean>(false);
    const [apiissueerror, setapiissueerror] = React.useState<boolean>(false);
    const [showError, setshowError] = React.useState<boolean>(false);
    const ActionItem = React.useRef<any>();
    const ActionLink = React.useRef<any>("");
    const LastItem = React.useRef<any>("");
    const CurrentItem = React.useRef<any>("");

    const [clickName, setclickName] = React.useState<any>("Folder");
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
    const onChangeFileName = (event: any): void => {
        setname(event.target.value);
        if (event.target.value == "") {
            setshowError(true);
        } else {
            setshowError(false);
        }
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

    const _onBreadcrumbItemClicked = async (ev: any, item: any) => {
        LastItem.current = item;
        setclickName("BreadCrum");
        setIsLoading(true);
        let _folderPath: string = `${props.context.pageContext.web.serverRelativeUrl}/${ListNames.DocumentsInternalName}`;
        let filter = [
            {
                fieldName: "SiteName",
                fieldValue: "",
                fieldType: FieldType.LookupById,
                LogicalType: LogicalType.IsNotNull,
            }
        ];

        if (!!item.currentFolderPath) {
            filter.push(
                {
                    fieldName: "FileDirRef",
                    fieldValue: item.currentFolderPath,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo,
                }
            );
        }
        if (item.text === "Audit Reports") {
            filter.push(
                {
                    fieldName: "FileDirRef",
                    fieldValue: _folderPath,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo,
                }
            );
        }
        if (props.isViewSiteDialog == true) {
            filter.push(
                {
                    fieldName: "SiteName",
                    fieldValue: !!props?.data[0]?.SiteNameId ? props.data[0].SiteNameId : 0,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.EqualTo,
                }
            );
        }
        if (props.isViewSiteDialog == false && props.currentCompomentName == undefined) {
            filter.push(
                {
                    fieldName: "SiteName",
                    fieldValue: !!props.siteMasterId ? props.siteMasterId as any : 0,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.EqualTo,
                }
            );
        }
        const localResponse = await loadData("", { sortColumn: "ID", sortOrder: SortOrder.Descending }, filter, item.currentFolderPath);
        let generatedDate = generateCamelQuaryData(localResponse.Row);
        folderStructureRenderItems.current = generatedDate.auditItems;
        filterRenderItems.current = generatedDate.auditItems;

        setSiteOptions(generatedDate.siteNameOptions);
        setFileNameOptions(generatedDate.fileNameOptions);

        setState(prevState => ({ ...prevState, documentItem: folderStructureRenderItems.current, }));
        setKeyUpdate(Math.random());
        setIsLoading(false);
        if (!!item.parent && item.parent.length > 0) {
            breadCrumFolderItems.current = item.parent;
            const parentItemIndex = item.parent.findIndex((i: any) => i.text == item.text) + 1;
            breadCrumFolderItems.current = breadCrumFolderItems.current.slice(0, parentItemIndex);
        } else {
            breadCrumFolderItems.current = !!item.parent ? item.parent : [{
                text: "Audit Reports",
                key: ('Folder Documents'),
                onClick: _onBreadcrumbItemClicked
            }];
        }
        CurrentItem.current = folderStructureRenderItems.current;
        setState(prevState => ({ ...prevState, documentItem: folderStructureRenderItems.current, isRelod: true }));
        setKeyUpdate(Math.random());
    };

    const onClickFolder = async (item: IDocument) => {
        setclickName("Folder");
        LastItem.current = item;
        siteNameId.current = item.siteNameId;
        const _folderPath: string = item.fileRef;
        const currentFolderPath = `${item.fileDirRef}/${item.fileLeafRef}`;
        let items: any[] = breadCrumFolderItems.current.length > 0 ? breadCrumFolderItems.current : [];
        items.push({
            text: !!item.ChangeName ? item.ChangeName : item.fileLeafRef,
            key: ('Folder' + item.fileLeafRef),
            currentFolderPath: _folderPath,
            parentFolderPath: item.fileDirRef,
            parent: breadCrumFolderItems.current,
            onClick: _onBreadcrumbItemClicked
        });
        breadCrumFolderItems.current = items;
        setIsLoading(true);
        let filter = [
            {
                fieldName: "SiteName",
                fieldValue: "",
                fieldType: FieldType.LookupById,
                LogicalType: LogicalType.IsNotNull,
            }
        ];
        if (!!_folderPath) {
            filter.push(
                {
                    fieldName: "FileDirRef",
                    fieldValue: _folderPath,
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo,
                }
            );
        }
        if (props.isViewSiteDialog == true) {
            filter.push(
                {
                    fieldName: "SiteName",
                    fieldValue: !!props?.data[0]?.SiteNameId ? props.data[0].SiteNameId : 0,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.EqualTo,
                }
            );
        }
        if (props.isViewSiteDialog == false && props.currentCompomentName == undefined) {
            filter.push(
                {
                    fieldName: "SiteName",
                    fieldValue: !!props.siteMasterId ? props.siteMasterId as any : 0,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.EqualTo,
                }
            );
        }
        const localResponse = await loadData("", { sortColumn: "ID", sortOrder: SortOrder.Descending }, filter, _folderPath);
        let generatedDate = generateCamelQuaryData(localResponse.Row);
        folderStructureRenderItems.current = generatedDate.auditItems;
        filterRenderItems.current = generatedDate.auditItems;
        setSiteOptions(generatedDate.siteNameOptions);
        setFileNameOptions(generatedDate.fileNameOptions);
        CurrentItem.current = folderStructureRenderItems.current;
        setState(prevState => ({ ...prevState, documentItem: folderStructureRenderItems.current, }));
        setKeyUpdate(Math.random());
        setIsLoading(false);
    };

    const onClickshowPopupName = (item: any) => {
        let name = "";
        if (item.ChangeName) {
            setname(item.ChangeName);
        } else {
            setname(item.title);
        }

        setUpdateId(item.id);
        showPopupName();
    };

    const generateColumn = () => {
        const column: any[] = [
            {
                key: "key3", name: 'Action', fieldName: '', isResizable: true, minWidth: 80, maxWidth: 120,
                onRender: ((item: IDocument) => {
                    return <>
                        <div className='dflex'>
                            <div>
                                <Link className="actionBtn btnEditName dticon" onClick={() => {
                                    onClickshowPopupName(item);
                                }}>
                                    <TooltipHost content={"Edit Name"} id={tooltipId}>
                                        <FontAwesomeIcon icon="edit" />
                                    </TooltipHost>
                                </Link>
                            </div>
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
                                                <FontAwesomeIcon icon="paper-plane" className="cml-5" />
                                            </TooltipHost>
                                        </Link>
                                    </div>
                                </div >
                            }
                        </div>
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
                                    {item.ChangeName ? item.ChangeName : item.fileLeafRef}
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

    const getAllSite = () => {
        let filter = "";
        if (props.loginUserRoleDetails?.isAdmin) {
            filter = "";
        } else if (props.loginUserRoleDetails?.isSiteManager) {
            // filter = currentUser.IsSiteAdmin ? "" : `SiteManagerId eq ${currentUser.Id} or ADUserId eq ${currentUser.Id}`;
            filter = `SiteManagerId eq ${props.loginUserRoleDetails.Id} `;
        } else if (props.loginUserRoleDetails?.isSiteSupervisor) {
            filter = `SiteSupervisorId eq ${props.loginUserRoleDetails.Id}`;
        } else if (props.loginUserRoleDetails?.isUser) {
            filter = `ADUserId eq ${props.loginUserRoleDetails.Id} `;
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








    React.useEffect(() => {
        //    For Nav bar Audit Report start
        if (!!props.currentCompomentName) {
            (async () => {
                setIsLoading(true);
                let _folderPath: string = `${props.context.pageContext.web.serverRelativeUrl}/${ListNames.DocumentsInternalName}`;
                let items: any[] = [];
                items.push({
                    text: "Audit Reports",
                    key: ('Folder Documents'),
                    currentFolderPath: _folderPath,
                    onClick: _onBreadcrumbItemClicked,
                });
                breadCrumFolderItems.current = items;
                let filter: any[] = [
                    {
                        fieldName: "SiteName",
                        fieldValue: "",
                        fieldType: FieldType.LookupById,
                        LogicalType: LogicalType.IsNotNull,
                    }
                    , {
                        fieldName: "FileDirRef",
                        fieldValue: _folderPath,
                        fieldType: FieldType.Text,
                        LogicalType: LogicalType.EqualTo,
                    },
                ];
                if (props.loginUserRoleDetails?.isAdmin == false) {
                    const getAllSiteItems = await getAllSite();
                    const siteNameIdArray = getAllSiteItems.map((r: any) => r.Id);
                    allSiteId.current = siteNameIdArray;
                }
                const localResponse = await loadData("", { sortColumn: "ID", sortOrder: SortOrder.Descending }, filter, _folderPath);
                let generatedDate = generateCamelQuaryData(localResponse.Row);
                folderStructureRenderItems.current = generatedDate.auditItems;
                filterRenderItems.current = generatedDate.auditItems;
                setSiteOptions(generatedDate.siteNameOptions);
                setFileNameOptions(generatedDate.fileNameOptions);
                setIsLoading(false);
                setKeyUpdate(Math.random());
            })();
        } else {
            if (props.isViewSiteDialog == false) {
                (async () => {
                    setIsLoading(true);
                    let _folderPath: string = `${props.context.pageContext.web.serverRelativeUrl}/${ListNames.DocumentsInternalName}`;
                    let items: any[] = [];
                    items.push({
                        text: "Audit Reports",
                        key: ('Folder Documents'),
                        currentFolderPath: _folderPath,
                        onClick: _onBreadcrumbItemClicked,
                    });
                    breadCrumFolderItems.current = items;
                    let filter: any[] = [
                        {
                            fieldName: "SiteName",
                            fieldValue: props.siteMasterId,
                            fieldType: FieldType.LookupById,
                            LogicalType: LogicalType.EqualTo,
                        }
                        , {
                            fieldName: "FileDirRef",
                            fieldValue: _folderPath,
                            fieldType: FieldType.Text,
                            LogicalType: LogicalType.EqualTo,
                        }
                    ];
                    const localResponse = await loadData("", { sortColumn: "ID", sortOrder: SortOrder.Descending }, filter, _folderPath);
                    let generatedDate = generateCamelQuaryData(localResponse.Row);
                    folderStructureRenderItems.current = generatedDate.auditItems;
                    filterRenderItems.current = generatedDate.auditItems;
                    setSiteOptions(generatedDate?.siteNameOptions);
                    setFileNameOptions(generatedDate?.fileNameOptions);
                    setIsLoading(false);
                    setKeyUpdate(Math.random());
                })();
            }
        }
        //    For Nav bar Audit Report end
        // For View Site Dialog  Start
        if (props.isViewSiteDialog == true) {
            (async () => {
                setIsLoading(true);
                let _folderPath: string = `${props.context.pageContext.web.serverRelativeUrl}/${ListNames.DocumentsInternalName}`;
                let items: any[] = [];
                items.push({
                    text: "Audit Reports",
                    key: ('Folder Documents'),
                    currentFolderPath: _folderPath,
                    onClick: _onBreadcrumbItemClicked,
                });
                breadCrumFolderItems.current = items;
                let filter: any[] = [
                    {
                        fieldName: "SiteName",
                        fieldValue: !!props?.data[0]?.SiteNameId ? props.data[0].SiteNameId : 0,
                        fieldType: FieldType.LookupById,
                        LogicalType: LogicalType.EqualTo,
                    }
                    , {
                        fieldName: "FileDirRef",
                        fieldValue: _folderPath,
                        fieldType: FieldType.Text,
                        LogicalType: LogicalType.EqualTo,
                    }
                ];
                const localResponse = await loadData("", { sortColumn: "ID", sortOrder: SortOrder.Descending }, filter, _folderPath);
                let generatedDate = generateCamelQuaryData(localResponse.Row);
                folderStructureRenderItems.current = generatedDate.auditItems;
                filterRenderItems.current = generatedDate.auditItems;
                setSiteOptions(generatedDate.siteNameOptions);
                setFileNameOptions(generatedDate.fileNameOptions);
                setIsLoading(false);
                setKeyUpdate(Math.random());
            })();
        }
        // For View Site Dialog  end
        const column = generateColumn();
        setState(prevState => ({ ...prevState, column: column, isRelod: true }));
        setisReload(false);
    }, [isReload]);

    const onClickCancel = () => {

        setitemDocument(null);
        setname("");
        settitle("");
        setSendToEmail("");
        hidePopup();
        hidePopupName();
        hidePopupAction();
        setshowError(false);
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

    const onClickChangeFileName = async () => {
        let toastMessage: string = "";
        const toastId = toastService.loading('Loading...');
        toastMessage = 'Name change successfully!';
        await props.provider.updateItemWithPnP({ Title: name }, ListNames.DocumentsDisplayName, UpdateId);
        toastService.updateLoadingWithSuccess(toastId, toastMessage);
        onClickCancel();

        if (LastItem.current) {
            if (clickName == "Folder") {
                onClickFolder(LastItem.current);
            }
            if (clickName == "BreadCrum") {
                _onBreadcrumbItemClicked("ev", LastItem.current);
            }

        } else {
            setisReload(true);
        }
        // if (CurrentItem.current) {
        //     // onClickFolder(LastItem.current);
        //     setState(prevState => ({ ...prevState, documentItem: CurrentItem.current, }));
        // } else {
        //     setisReload(true);
        // }

    };




    const _onFileNameChange = (option: any, actionMeta: ActionMeta<any>): void => {
        if (!!option) {
            setDefaultFilename(option);
            if (!!selectedSite) {
                let data = filterRenderItems.current.filter((i: any) => i.fileLeafRef == option.label);
                filterRenderItems.current = data;
            } else {
                let data = folderStructureRenderItems.current.filter((i: any) => i.fileLeafRef == option.label);
                filterRenderItems.current = data;
            }
        } else {
            setDefaultFilename("");
            if (!!selectedSite) {
                let data = folderStructureRenderItems.current.filter((i: any) => i.siteName == selectedSite.label);
                filterRenderItems.current = data;
            } else {
                let data = folderStructureRenderItems.current;
                filterRenderItems.current = data;
            }
        }
    };

    const onSiteChange = (selectedOption: any): void => {
        if (!!selectedOption) {
            setSelectedSite(selectedOption);
            if (!!DefaultFileName) {
                let data = filterRenderItems.current.filter((i: any) => i.siteName == selectedOption.label);
                filterRenderItems.current = data;
            } else {
                let data = folderStructureRenderItems.current.filter((i: any) => i.siteName == selectedOption.label);
                filterRenderItems.current = data;
            }
        } else {
            setSelectedSite("");
            if (!!DefaultFileName) {
                let data = folderStructureRenderItems.current.filter((i: any) => i.fileLeafRef == DefaultFileName.label);
                filterRenderItems.current = data;
            } else {
                let data = folderStructureRenderItems.current;
                filterRenderItems.current = data;
            }
        }


    };

    const _onLinkClick = (item: PivotItem): void => {
        if (item.props.itemKey == "Safety Culture") {
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
            const response = await axios.get(`${APISiteLink.SafetyCulture}/api/SafetyCulture/GetIssues?SiteName=William%20Angliss`);
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

    const generateCamelQuaryData = (items: any[]) => {
        let auditItems: any[] = [];
        let DocumentFullPath: any;
        let siteNameOptions: any[] = [];
        let fileNameOptions: any[] = [];
        if (items.length > 0)
            auditItems = items.map((items: any, index) => {
                const filePath: string = `${!!items.ServerRedirectedEmbedUrl ? items.ServerRedirectedEmbedUrl : !!items.FileLeafRef ? window.location.origin + items.FileRef : ""}`;
                const embedFullFilePath = `${props.context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${!!items.ServerRedirectedEmbedUrl ? items.ServerRedirectedEmbedUrl : ""}&action=embedview`;
                const fileType = filePath.split('.').pop();
                if (!!items.FileLeafRef)
                    fileNameOptions.push({
                        value: items.ID,
                        label: items.FileLeafRef
                    });
                if (items.SiteName.length > 0)
                    siteNameOptions.push({
                        value: items.SiteName.length > 0 ? items.SiteName[0]?.lookupId : "",
                        label: items.SiteName.length > 0 ? items.SiteName[0]?.lookupValue : ""
                    });
                if (MicrosoftOfficeDocumentType.indexOf(fileType || '') >= 0)
                    DocumentFullPath = embedFullFilePath;
                else
                    DocumentFullPath = (fileType === "zip" ? `${filePath}?web = 1&action=embedview` : filePath);
                return {
                    id: !!items.ID ? items.ID : "",
                    siteNameId: items.SiteName.length > 0 ? items.SiteName[0]?.lookupId : "",
                    siteName: items.SiteName.length > 0 ? items.SiteName[0]?.lookupValue : "",
                    fileLeafRef: !!items.FileLeafRef ? items.FileLeafRef : "",
                    fileRef: !!items.FileRef ? items.FileRef : "",
                    title: !!items.FileLeafRef ? items.FileLeafRef : "",
                    ChangeName: !!items.Title ? items.Title : "",
                    stateName: !!items.StateName ? items.StateName : "",
                    parent: !!items.FileDirRef ? items.FileDirRef.split('/').filter((r: any) => !!r) : "",
                    fileDirRef: !!items.FileDirRef ? items.FileDirRef : "",
                    isFolder: items.FSObjType == "1" ? true : false,
                    isFolderNumber: items.FSObjType == "1" ? 0 : 1,
                    currentItemKey: !!items.FileLeafRef ? items.FileLeafRef + index : "",
                    // previewUrl: !!items.ServerRedirectedEmbedUrl ? items.ServerRedirectedEmbedUrl : "",
                    previewUrl: DocumentFullPath,
                    url: filePath
                };
            });

        return { auditItems, siteNameOptions, fileNameOptions };
    };

    const loadData = async (pageToken: string, sortOptions: { sortColumn: string, sortOrder: SortOrder; }, filterFields: ICamlQueryFilter[], _folderPath: string) => {
        try {
            let filter: any[] = filterFields;
            const camlQuery = new CamlBuilder()
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
            if (props.loginUserRoleDetails?.isAdmin == false && !!props.currentCompomentName) {
                if (allSiteId.current.length > 0) {
                    filter.push({
                        fieldName: "SiteName",
                        fieldValue: allSiteId.current,
                        fieldType: FieldType.LookupById,
                        LogicalType: LogicalType.In
                    });
                }
            }
            if (filter) {
                const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
                camlQuery.Where().All(categoriesExpressions);
            }
            sortOptions.sortOrder === SortOrder.Ascending ? camlQuery.OrderBy(sortOptions.sortColumn) : camlQuery.OrderByDesc(sortOptions.sortColumn);
            const pnpQueryOptions: IPnPCAMLQueryOptions = {
                listName: ListNames.DocumentsDisplayName,
                queryXML: camlQuery.ToString(),
                // FolderServerRelativeUrl: _folderPath || "",
                // pageToken: "",
                // pageLength: 30

            };
            const localResponse = await props.provider.getItemsInBatchByCAMLQuery(pnpQueryOptions);
            return localResponse;
        } catch (error) {
            console.log(error);

            return null;
        }
    };

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

        {isPopupVisibleName && (
            <Layer>
                <Popup
                    className={popupStyles.root}
                    role="dialog"
                    aria-modal="true"
                    onDismiss={hidePopupName}
                >
                    <Overlay onClick={hidePopupName} />
                    <FocusTrapZone>
                        <div role="document" className={popupStyles.content}>
                            <h2 className="mt-10">Rename </h2>
                            <TextField className="formControl mt-20" label="New File / Folder name " placeholder="Enter new name"
                                value={name}
                                onChange={onChangeFileName} />
                            {showError &&
                                <div className="requiredlink">Enter new name</div>}
                            <DialogFooter>
                                {showError ? <PrimaryButton text="Rename" className='mrt15 css-b62m3t-container btn btn-secondary grey-btn' /> :
                                    <PrimaryButton text="Rename" onClick={onClickChangeFileName} className='mrt15 css-b62m3t-container btn btn-primary' />
                                }
                                <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickCancel} />
                            </DialogFooter>

                        </div>
                    </FocusTrapZone>
                </Popup>
            </Layer>
        )}



        {!!props.currentCompomentName ? <div className="boxCard">
            <div className="formGroup more-page-wrapper">
                <div className="ms-Grid mb-3 mt-15">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <h1 className="mainTitle">Audit Report</h1>
                        </div>
                        <div className='ms-Grid-row p-14'>
                            <div className='ms-md12 ms-sm12 ms-Grid-col'>
                                <div className='dashboard-card p00'>
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
                                                                            isClearable={true}
                                                                            isMultiSelect={false}
                                                                            defaultOption={!!DefaultFileName ? DefaultFileName?.value : ""}
                                                                            onChange={_onFileNameChange}
                                                                            placeholder={"Audit Reports"}
                                                                        />}
                                                                </div>
                                                            </div>
                                                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                                                <div className="formControl">
                                                                    < ReactDropdown
                                                                        options={siteOptions}
                                                                        isMultiSelect={false}
                                                                        isClearable={true}
                                                                        defaultOption={!!selectedSite ? selectedSite?.value : ""}
                                                                        onChange={onSiteChange}
                                                                        placeholder={"Site"}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div id="ARGrid" className="ms-Grid-col ms-sm12 ms-md12 ms-lg12  showingresults">
                                                                {
                                                                    noRecordsFound ?
                                                                        <><NoRecordFound /> </> : <MemoizedDetailList
                                                                            key={keyUpdate}
                                                                            onSelectedItem={_onItemSelected}
                                                                            items={filterRenderItems.current || []}
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
                        {/* <div>test</div> */}

                    </div>
                </div>
            </div>

        </div > :
            props.isViewSiteDialog == false &&
            <>
                <div className='ms-Grid-row p-14 pmt-15'>
                    <div className='ms-md12 ms-sm12 ms-Grid-col'>
                        <div className='dashboard-card p00'>
                            <div className='card-header'></div>
                            <div className='p-15 height211 lightgrey2'>
                                <div className="">

                                    <Pivot aria-label="Basic Pivot Example" id="SCpivot" selectedKey={selectedKey}
                                        onLinkClick={_onLinkClick}>
                                        <PivotItem headerText="Inspection" itemKey="Inspection">
                                            <div className="">
                                                <Inspectionlist siteView={false} siteName={props.siteMasterId} />
                                            </div>
                                        </PivotItem>

                                        <PivotItem headerText="Actions" itemKey="Actions">
                                            <div className=''>
                                                <div className="">
                                                    <ActionView provider={props.provider} siteName={props.siteName} />
                                                </div>
                                            </div>
                                        </PivotItem>
                                        <PivotItem headerText="Issues" itemKey="Issues">
                                            <div className=''>
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
                                        <PivotItem headerText="Overview" itemKey="Overview">
                                            <div className="">
                                                <SafetyCultureReport siteName={props.siteMasterId} tab="Overview" />
                                            </div>
                                        </PivotItem>
                                        <PivotItem headerText="Conducted" itemKey="Conducted">
                                            <div className="">
                                                <SafetyCultureReport siteName={props.siteMasterId} tab="Conducted" />
                                            </div>
                                        </PivotItem>
                                        <PivotItem headerText="Performance" itemKey="Performance">
                                            <div className="">
                                                <SafetyCultureReport siteName={props.siteMasterId} tab="Performance" />
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