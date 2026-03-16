// /* eslint-disable no-unused-expressions */
// /* eslint-disable max-lines */
// /* eslint-disable @typescript-eslint/no-empty-function */
// /* eslint-disable @typescript-eslint/no-floating-promises */
// /* eslint-disable @typescript-eslint/no-use-before-define */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// import * as React from "react";
// import { ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
// import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
// import { logGenerator, getFileTypeIcon, scrollFunction, getCAMLQueryFilterExpression, UserActivityLog } from "../../../../../Common/Util";
// import { MemoizedDetailList } from "../../../../../Common/DetailsList";
// import { DefaultButton, Dialog, DialogFooter, DialogType, FocusTrapZone, IColumn, Layer, Link, Overlay, Panel, PanelType, Popup, PrimaryButton, ProgressIndicator, SelectionMode, TextField, mergeStyleSets, IContextualMenuItem, ContextualMenu } from "office-ui-fabric-react";
// import { useBoolean, useId } from "@fluentui/react-hooks";
// import { Label, TooltipHost } from "@fluentui/react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import CamlBuilder from "camljs";
// import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
// import { ICamlQueryFilter, FieldType, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
// import { DateTimeFormate, MicrosoftOfficeDocumentType } from "../../../../../Common/Constants/CommonConstants";
// import moment from "moment";
// import { useAtomValue } from "jotai";
// import { MultipleSiteFilter } from "../../../../../Common/Filter/MultipleSiteFilter";
// import { MultiStateFilter } from "../../../../../Common/Filter/MultiStateFilter";
// import { appGlobalStateAtom, appSiteStateAtom } from "../../../../../jotai/appGlobalStateAtom";
// import CustomBreadcrumb from "../../CommonComponents/breadcrumb/CustomBreadcrumb";
// import CustomModal from "../../CommonComponents/CustomModal";
// import DragandDropFilePicker from "../../CommonComponents/dragandDrop/DragandDropFilePicker";
// import { Loader } from "../../CommonComponents/Loader";
// import { IQuayCleanState } from "../../QuayClean";
// import { DocumentsLibDialog } from "../ChemicalManagement/DocumentsLibDialog";
// import { TypeFilter } from "../../../../../Common/Filter/TypeFilter";

// // eslint-disable-next-line @typescript-eslint/no-var-requires
// // const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');
// export interface ICustomBreadcrumbItem {
//     text: string;
//     key: string;
// }

// export interface IAssociateChemicalProps {
//     siteNameId: any;
//     manageComponentView(componentProp: IQuayCleanState): any;
//     URL?: string;
//     qcState?: any;
//     siteName: any;
//     qCState?: any;
//     qCStateId?: any;
//     IsSupervisor?: boolean;
//     view?: any;
//     siteView: boolean;
//     loginUserRoleDetails?: any;
// }

// const dialogContentProps = {
//     type: DialogType.normal,
//     title: "Warning Message",
//     closeButtonAriaLabel: "Close",
//     subText: "Please Select Date Range!!",
// };

// const popupStyles2 = mergeStyleSets({
//     root: {
//         background: 'rgba(0, 0, 0, 0.2)',
//         bottom: '0',
//         left: '0',
//         position: 'fixed',
//         right: '0',
//         top: '0',
//     },
//     content: {
//         background: 'white',
//         left: '50%',
//         maxWidth: '1200px',
//         width: '90%',
//         padding: '0 1.5em 2em',
//         position: 'absolute',
//         top: '50%',
//         transform: 'translate(-50%, -50%)',
//     }
// });

// let uploadedFileCount = 0;

// export interface IAssociateChemicalState {
//     isReload: boolean;
//     isQRCodeModelOpen: boolean;
//     qrCodeUrl: string;
//     qrDetails: string;
//     quChemical: string;
// }

// export const PoliciesandProcedures = (props: IAssociateChemicalProps) => {
//     const appGlobalState = useAtomValue(appGlobalStateAtom);
//     const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
//     const appSiteState = useAtomValue(appSiteStateAtom);
//     const { PermissionArray } = appSiteState;
//     const [state, setState] = React.useState<IAssociateChemicalState>({
//         isReload: false,
//         isQRCodeModelOpen: false,
//         qrCodeUrl: "",
//         qrDetails: "",
//         quChemical: ""

//     });
//     const [isReloadDocument, setisReloadDocument] = React.useState<boolean>(false);
//     const [isReloadDocument2, setisReloadDocument2] = React.useState<boolean>(false);
//     const [DeleteFolder, setDeleteFolder] = React.useState<any>();
//     const [DeleteFile, setDeleteFile] = React.useState<any>();
//     const [DeleteId, setDeleteId] = React.useState<any>();
//     const [DeleteURLId, setDeleteURLId] = React.useState<any>();
//     const [DeleteId2, setDeleteId2] = React.useState<any>();
//     const [isShowAssetHistoryModel, setisShowAssetHistoryModel] = React.useState<boolean>(false);
//     const [isLoading, setIsLoading] = React.useState<boolean>(true);
//     const [URL, setURL] = React.useState<any>();
//     const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
//     const [isDisplayEDbtn2, setisDisplayEDbtn2] = React.useState<boolean>(false);
//     const [AssocitedChemicalArray, setAssocitedChemicalArray] = React.useState<any>([]);
//     const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
//     const [hideDialogdelete, { toggle: toggleHideDialogdelete }] = useBoolean(false);
//     const [hideDialogdeleteURL, { toggle: toggleHideDialogdeleteURL }] = useBoolean(false);
//     const [hideDialogdelete2, { toggle: toggleHideDialogdelete2 }] = useBoolean(false);
//     const [isDisplayFilterDialog, setisDisplayFilterDialog] = React.useState<boolean>(false);
//     const tooltipId = useId('tooltip');
//     const isVisibleCrud = React.useRef<boolean>(false);
//     const updateItemId = React.useRef<any>(0);
//     const [calmData, setcalmData] = React.useState<any[]>([]);
//     const [documnetUrl, setdocumnetUrl] = React.useState<string>("");
//     const [isDocumentPanelOpen, setisDocumentPanelOpen] = React.useState<boolean>(false);
//     const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
//     const [title, settitle] = React.useState<string>("");
//     const [calmData2, setcalmData2] = React.useState<any[]>([]);
//     const [filtercalmData2, setfiltercalmData2] = React.useState<any[]>([]);
//     const [notFoundFF2, setnotFoundFF2] = React.useState<boolean>(false);
//     const [preData2, setpreData2] = React.useState<any[]>([]);
//     const [isPopupVisible2, { setTrue: showPopup2, setFalse: hidePopup2 }] = useBoolean(false);
//     const [files, setFiles] = React.useState<IFileWithBlob[]>([]);
//     const [percentComplete, setPercentComplete] = React.useState(0);
//     const [LastFolder, setLastFolder] = React.useState<string>("");
//     const [isuploadlink, setisuploadlink] = React.useState<boolean>(false);
//     let defaultBreadCrumb = undefined;
//     const [finalLastLink, setfinalLastLink] = React.useState<string>("");
//     let [newBreadcrumbItem, setNewBreadcrumbItem] = React.useState<ICustomBreadcrumbItem | undefined>(defaultBreadCrumb);
//     let [sourcePath, setSourcePath] = React.useState<string>("");
//     const [isPopupVisibleURL, { setTrue: showPopupURL, setFalse: hidePopupURL }] = useBoolean(false);
//     const [isPopupVisibleRename, { setTrue: showPopupRename, setFalse: hidePopupRename }] = useBoolean(false);
//     const [Rename, setRename] = React.useState<string>("");
//     const [RenameFileRef, setRenameFileRef] = React.useState<string>("");
//     const [displayerrorRename, setdisplayerrorRename] = React.useState<boolean>(false);
//     const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
//     const [menuTarget, setMenuTarget] = React.useState(null);
//     const [errorViewType, seterrorViewType] = React.useState<boolean>(false);
//     const [errorSite, seterrorSite] = React.useState<boolean>(false);
//     const [errorState, seterrorState] = React.useState<boolean>(false);
//     const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>([]);
//     const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>([]);
//     const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>([]);
//     const [selectedState, setSelectedState] = React.useState<number[]>([]);
//     const [selectedType, setSelectedType] = React.useState<any>("");
//     const [fileURL, setFileURL] = React.useState<string>('');
//     const [showModal, setShowModal] = React.useState(false);

//     const openModal = () => { setShowModal(true); };
//     const closeModal = () => { setShowModal(false); };
//     const [width, setWidth] = React.useState<string>("500px");
//     React.useEffect(() => {
//         if (window.innerWidth <= 768) {
//             setWidth("90%");
//         } else {
//             setWidth("500px");
//         }
//     }, [window.innerWidth]);

//     const popupStyles = mergeStyleSets({
//         root: {
//             background: 'rgba(0, 0, 0, 0.2)',
//             bottom: '0',
//             left: '0',
//             position: 'fixed',
//             right: '0',
//             top: '0',
//         },
//         content: {
//             background: 'white',
//             left: '50%',
//             maxWidth: '550px',
//             width: width,
//             padding: '0 1.5em 2em',
//             position: 'absolute',
//             top: '50%',
//             transform: 'translate(-50%, -50%)',
//             borderTop: '3px solid #1300a6',
//         }
//     });

//     const menuItems: IContextualMenuItem[] = [
//         {
//             key: 'move',
//             text: 'Move',
//             iconProps: { iconName: 'Move' },
//             onClick: () => { console.log('Move clicked'); }
//         },
//         {
//             key: 'copy',
//             text: 'Copy',
//             iconProps: { iconName: 'Copy' },
//             onClick: () => { console.log('Copy clicked'); }
//         },
//         {
//             key: 'share',
//             text: 'Share',
//             iconProps: { iconName: 'Share' },
//             onClick: () => { console.log('Share clicked'); }
//         },
//         {
//             key: 'rename',
//             text: 'Rename',
//             iconProps: { iconName: 'Rename' },
//             onClick: () => { console.log('Rename clicked'); }
//         },
//         {
//             key: 'open',
//             text: 'Open',
//             iconProps: { iconName: 'box' },
//             onClick: () => { console.log('Open clicked'); }
//         },
//         {
//             key: 'copylink',
//             text: 'Copy Link',
//             iconProps: { iconName: 'Link' },
//             onClick: () => { console.log('Copy Link clicked'); }
//         },
//     ];

//     const onMenuDismiss = () => {
//         setMenuTarget(null);
//     };

//     const onclickconfirmdelete2 = () => {
//         toggleHideDialogdelete2();
//     };

//     const onChangeTitle = (event: any): void => {
//         settitle(event.target.value);
//     };

//     const onChangeRename = (event: any): void => {
//         setRename(event.target.value);
//         if (event.target.value == "" || event.target.value == undefined) {
//             setdisplayerrorRename(true);
//         } else {
//             setdisplayerrorRename(false);
//         }
//     };

//     const onClickFolder2 = async (currentFolderName: string) => {
//         const folderPath = "/" + currentFolderName;
//         if (calmData2.length > 0) {
//             setfinalLastLink(calmData2[0].FileDirRef + folderPath);
//         }
//         _getAllDocuments(calmData2[0].FileDirRef + folderPath);
//         setSourcePath("");
//         setLastFolder("");
//         let results: any[] = [];
//         let res: any[] = [];

//         if (calmData2.length > 0) {
//             results = calmData2.filter(item => item.FileDirRef.endsWith(folderPath));
//             if (results.length == 0) {
//                 res = calmData2.filter(item => item.FileRef.endsWith(folderPath));
//             }
//         }

//         if (results.length != 0) {
//             let newBreadcrumbItem: ICustomBreadcrumbItem = {
//                 text: `${currentFolderName}`,
//                 key: `${results[0]?.FileDirRef}`,
//             };
//             setNewBreadcrumbItem(newBreadcrumbItem);
//             setSourcePath(results[0]?.FileDirRef);
//         } else {
//             let newBreadcrumbItem: ICustomBreadcrumbItem = {
//                 text: `${currentFolderName}`,
//                 key: `${res[0]?.FileRef}`,
//             };
//             let newBreadcrumbItem2: ICustomBreadcrumbItem = {
//                 text: currentFolderName || '', // Fallback in case of undefined
//                 key: res[0]?.FileRef || '', // Fallback in case of undefined
//             };
//             if (newBreadcrumbItem2.text && newBreadcrumbItem2.key) {
//                 setNewBreadcrumbItem(newBreadcrumbItem2);
//             } else {
//                 console.error("Breadcrumb item contains undefined values.");
//             }

//             // setNewBreadcrumbItem(newBreadcrumbItem);
//             setSourcePath(res[0]?.FileRef);
//         }
//         setLastFolder(folderPath);
//         if (results.length == 0) {
//             setisDisplayEDbtn2(false);
//             setnotFoundFF2(true);
//             setfiltercalmData2([]);
//         } else {
//             setnotFoundFF2(false);
//             setfiltercalmData2(results);
//             setpreData2(results);
//         }
//     };

//     const _getAllDocuments = async (link?: string) => {
//         let folderPath: any;
//         if (link == "" || link == undefined) {
//             if (props.siteName) {
//                 folderPath = context.pageContext.web.serverRelativeUrl + "/PoliciesandProcedures/" + props.siteName;
//             } else {
//                 folderPath = context.pageContext.web.serverRelativeUrl + "/PoliciesandProcedures";
//             }
//         } else {
//             folderPath = link;
//         }

//         const filterFields: ICamlQueryFilter[] = [];
//         filterFields.push({
//             fieldName: "FileDirRef",
//             fieldValue: folderPath,
//             fieldType: FieldType.Text,
//             LogicalType: LogicalType.EqualTo
//         });

//         if (selectedSiteIds?.length > 0) {
//             filterFields.push({
//                 fieldName: "SiteName",
//                 fieldValue: selectedSiteIds,
//                 fieldType: FieldType.LookupById,
//                 LogicalType: LogicalType.In
//             });
//         }

//         if (selectedState?.length > 0) {
//             filterFields.push({
//                 fieldName: "StateName",
//                 fieldValue: selectedState,
//                 fieldType: FieldType.LookupById,
//                 LogicalType: LogicalType.In
//             });
//         }

//         if (selectedType !== "") {
//             filterFields.push({
//                 fieldName: "ViewType",
//                 fieldValue: selectedType,
//                 fieldType: FieldType.Text,
//                 LogicalType: LogicalType.EqualTo
//             });
//         }

//         // if (props.siteNameId) {
//         //     filterFields.push({
//         //         fieldName: "SiteName",
//         //         fieldValue: props.siteNameId,
//         //         fieldType: FieldType.LookupById,
//         //         LogicalType: LogicalType.EqualTo
//         //     });
//         // }

//         let camlQuery = new CamlBuilder().View()
//             .Scope(CamlBuilder.ViewScope.RecursiveAll)
//             .RowLimit(5000, true)
//             .Query();
//         if (filterFields) {
//             const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);
//             camlQuery.Where().All(categoriesExpressions);
//         }
//         let allFoldersfiles = await provider.getItemsByCAMLQuery("PoliciesandProcedures", camlQuery.ToString());

//         let filteredData: any[];


//         if (!props.siteNameId && props.siteView == false) {
//             if (currentUserRoleDetail?.isAdmin) {
//                 filteredData = allFoldersfiles;
//             } else {
//                 const AllSiteIds: number[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
//                 const stateManagerStateItems: number[] = props?.loginUserRoleDetails?.stateManagerStateItem || [];
//                 const qcStateIds: number[] = !props.siteNameId ? props?.loginUserRoleDetails?.currentUserSitesData?.map((item: any) => item.QCStateId) : [];
//                 filteredData = Array.isArray(allFoldersfiles)
//                     ? allFoldersfiles.filter((item: any) => {
//                         const siteIds = Array.isArray(item?.SiteName)
//                             ? item.SiteName.map((s: any) => s?.lookupId).filter(Boolean)
//                             : [];

//                         const stateIds = Array.isArray(item?.StateName)
//                             ? item.StateName.map((s: any) => s?.lookupId).filter(Boolean)
//                             : [];

//                         const matchesSite = siteIds.some((id: any) => AllSiteIds.includes(id));
//                         const matchesStateManager = stateManagerStateItems.length > 0 && stateIds.some((id: any) => stateManagerStateItems.includes(id));
//                         const isBothViewType = item?.ViewType === "Both" || item?.ViewType === "";
//                         const isStateViewMatch = item?.ViewType === "State" && qcStateIds.length > 0 && stateIds.some((id: any) => qcStateIds.includes(id));
//                         const siteNameIdMismatch = !!props.siteNameId &&
//                             siteIds.length > 0 &&
//                             !siteIds.includes(props.siteNameId);
//                         if (siteNameIdMismatch) return false;

//                         return matchesSite || isBothViewType || matchesStateManager || isStateViewMatch;
//                     })
//                     : [];
//             }

//         } else {
//             const AllSiteIds: number[] = [props.siteNameId];
//             const stateManagerStateItems: number[] = [];
//             const qcStateIds: number[] = [props.qCStateId];
//             filteredData = Array.isArray(allFoldersfiles)
//                 ? allFoldersfiles.filter((item: any) => {
//                     const siteIds = Array.isArray(item?.SiteName)
//                         ? item.SiteName.map((s: any) => s?.lookupId).filter(Boolean)
//                         : [];

//                     const stateIds = Array.isArray(item?.StateName)
//                         ? item.StateName.map((s: any) => s?.lookupId).filter(Boolean)
//                         : [];

//                     const matchesSite = siteIds.some((id: any) => AllSiteIds.includes(id));
//                     const matchesStateManager = stateManagerStateItems.length > 0 && stateIds.some((id: any) => stateManagerStateItems.includes(id));
//                     const isBothViewType = item?.ViewType === "Both" || item?.ViewType === "";
//                     const isStateViewMatch = item?.ViewType === "State" && qcStateIds.length > 0 && stateIds.some((id: any) => qcStateIds.includes(id));
//                     const siteNameIdMismatch = !!props.siteNameId &&
//                         siteIds.length > 0 &&
//                         !siteIds.includes(props.siteNameId);
//                     if (siteNameIdMismatch) return false;

//                     return matchesSite || isBothViewType || matchesStateManager || isStateViewMatch;
//                 })
//                 : [];
//         }

//         filteredData = filteredData?.sort((a: any, b: any) => {
//             return moment(b.Modified).diff(moment(a.Modified));
//         });


//         if (!!filteredData) {
//             const AssetListData = filteredData.map((data) => {
//                 const filePath: string = `${data.EncodedAbsUrl}`;
//                 let DocumentFullPath;
//                 const embedFullFilePath = `${context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${data.EncodedAbsUrl}&action=embedview`;
//                 const fileType = filePath.split('.').pop();
//                 if (MicrosoftOfficeDocumentType.indexOf(fileType || '') >= 0)
//                     DocumentFullPath = embedFullFilePath;
//                 else
//                     DocumentFullPath = (fileType === "zip" ? `${filePath}?web = 1 & action=embedview` : filePath);
//                 return {
//                     ID: data.ID,
//                     SiteNameId: !!data.SiteName[0]?.lookupId ? data.SiteName[0]?.lookupId : "",
//                     SiteName: !!data.SiteName[0]?.lookupValue ? data.SiteName[0]?.lookupValue : "",
//                     SiteNameIds: Array.isArray(data?.SiteName) ? data.SiteName.map((item: any) => item?.lookupId).filter(Boolean).join(", ") : "",
//                     SiteNames: Array.isArray(data?.SiteName) ? data.SiteName.map((item: any) => item?.lookupValue).filter(Boolean).join(", ") : "",
//                     StateNameIds: Array.isArray(data?.StateName) ? data.StateName.map((item: any) => item?.lookupId).filter(Boolean).join(", ") : "",
//                     StateNames: Array.isArray(data?.StateName) ? data.StateName.map((item: any) => item?.lookupValue).filter(Boolean).join(", ") : "",
//                     StateIds: Array.isArray(data?.StateName) ? data.StateName.map((item: any) => item?.lookupId).filter(Boolean) : [],
//                     SiteIds: Array.isArray(data?.SiteName) ? data.SiteName.map((item: any) => item?.lookupId).filter(Boolean) : [],
//                     DocumentsLink: !!data.EncodedAbsUrl ? data.EncodedAbsUrl : "",
//                     FileDirRef: !!data.FileDirRef ? data.FileDirRef : "",
//                     ViewType: !!data.ViewType ? data.ViewType : "",
//                     FileLeafRef: !!data.FileLeafRef ? data.FileLeafRef : "",
//                     ContentType: !!data.ContentType ? data.ContentType : "",
//                     FileRef: !!data.FileRef ? data.FileRef : "",
//                     previewUrl: DocumentFullPath,
//                     CreatedBy: !!data.Author ? data.Author[0].title : "",
//                     ModifiedBy: !!data.Editor ? data.Editor[0].title : "",
//                     Created: !!data.Created ? moment(data.Created).format(DateTimeFormate) : "",
//                     OrgCreated: !!data.Created ? data.Created : "",
//                     Modified: !!data.Modified ? moment(data.Modified).format(DateTimeFormate) : "",
//                 };
//             });
//             let res: any[] = [];
//             let folderPath: any;
//             if (link == "" || link == undefined) {
//                 if (props.siteName) {
//                     folderPath = "/PoliciesandProcedures/" + props.siteName;
//                 } else {
//                     folderPath = "/PoliciesandProcedures"
//                 }
//                 if (AssetListData.length > 0) {
//                     res = AssetListData.filter(item => item.FileDirRef.endsWith(folderPath));
//                 }
//             } else {
//                 folderPath = link;
//                 if (AssetListData.length > 0) {
//                     res = AssetListData.filter(item => item.FileDirRef == link);
//                 }
//             }
//             if (res.length == 0) {
//                 setnotFoundFF2(true);
//                 setfiltercalmData2([]);
//             } else {
//                 setnotFoundFF2(false);
//                 setfiltercalmData2(res);
//                 setpreData2(res);
//             }
//             setcalmData2(AssetListData);
//             setTimeout(() => {
//                 setIsLoading(false);
//             }, 1000);
//         }
//     };

//     const handleFileClick = (path: string) => {
//         const isExcel = path.endsWith(".xlsx") || path.endsWith(".xls");
//         if (isExcel) {
//             setFileURL(`${path}?web=1&embedded=true`);
//             openModal();
//         } else {
//             setFileURL(path);
//             openModal();
//         }
//     };



//     const AddDocumentColumn = (): IColumn[] => {
//         let columns: any[] = [
//             {
//                 key: "Action", name: 'Action', fieldName: '', isResizable: true, minWidth: 40, maxWidth: 50,
//                 onRender: ((item: any) => {
//                     return <>
//                         <div className='dflex'>
//                             {item.ContentType != "Folder" ?
//                                 <>
//                                     {/* {isVisibleCrud.current && <div>
//                                         <Link className="actionBtn btnView dticon" onClick={() => {
//                                             onClickRenameDialog(item);

//                                         }}>
//                                             <TooltipHost content={"Rename"} id={tooltipId}>
//                                                 <FontAwesomeIcon icon="edit" />
//                                             </TooltipHost>
//                                         </Link>
//                                     </div>} */}
//                                     <div>
//                                         <Link className="actionBtn btnView dticon"
//                                             onClick={() => {
//                                                 handleFileClick(item.FileRef);
//                                                 //   setDocumentURL(`${attachmentUrl}?web=1&embedded=true`);
//                                             }}
//                                         >
//                                             <TooltipHost content={"View Document"} id={tooltipId}>
//                                                 <FontAwesomeIcon icon="eye" />
//                                             </TooltipHost>
//                                         </Link>
//                                     </div>
//                                 </> :
//                                 <>
//                                     {/* {isVisibleCrud.current && <div>
//                                         <Link className="actionBtn btnView dticon" onClick={() => {
//                                             onClickRenameDialog(item);

//                                         }}>
//                                             <TooltipHost content={"Rename"} id={tooltipId}>
//                                                 <FontAwesomeIcon icon="edit" />
//                                             </TooltipHost>
//                                         </Link>
//                                     </div>} */}
//                                 </>
//                             }
//                         </div >
//                     </>;
//                 })
//             },
//             {
//                 key: "key1", name: 'Documents', fieldName: 'FileLeafRef', isResizable: true, minWidth: 250, maxWidth: 350,
//                 onRender: ((item: any) => {
//                     const fileIcon = getFileTypeIcon(item.FileLeafRef);

//                     const createdDate = new Date(item.OrgCreated);
//                     const now = new Date();
//                     const diffInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
//                     const isNew = diffInDays <= 3;

//                     return (
//                         <div className="container-document" style={{ display: "", alignItems: "center", gap: 8 }}>
//                             <Link onClick={() => {
//                                 if (item.ContentType === "Folder") {
//                                     onClickFolder2(item.FileLeafRef);
//                                 } else {
//                                     handleFileClick(item.FileRef);
//                                 }
//                             }}>
//                                 <TooltipHost
//                                     content={item.ContentType === "Folder" ? "Click to open" : "View Document"}
//                                     id={tooltipId}
//                                 >
//                                     {item.ContentType === "Folder" ? (
//                                         <FontAwesomeIcon className="folderBtn btnfolder dticon" icon="folder" />
//                                     ) : (
//                                         <img className="fileIcon dticon" src={fileIcon} />
//                                     )}
//                                     <span style={{ marginLeft: 6 }}>{item.FileLeafRef}</span>
//                                 </TooltipHost>
//                             </Link>

//                             {isNew && (
//                                 <span
//                                     className="new-badge"
//                                     style={{
//                                         marginTop: -2,
//                                         backgroundColor: "green",
//                                         color: "white",
//                                         fontSize: "10px",
//                                         minWidth: "36px",
//                                         fontWeight: "bold",
//                                         padding: "2px 6px",
//                                         borderRadius: "8px",
//                                         animation: "blink2 1.2s linear infinite"
//                                     }}
//                                 >
//                                     NEW
//                                 </span>
//                             )}
//                         </div>
//                     );
//                 })
//             },
//             { key: "ViewType", name: 'View Type', fieldName: 'ViewType', isResizable: true, minWidth: 60, maxWidth: 100, isSortingRequired: true },
//             {
//                 key: "SiteName", name: 'Site Name', fieldName: 'SiteNames', isResizable: true, minWidth: 150, maxWidth: 200, isSortingRequired: true,
//                 onRender: (item: any) => (
//                     <>
//                         {item.SiteNames?.split(',').map((name: string, idx: number) => {
//                             const trimmed = name.trim();
//                             return trimmed ? (
//                                 <div className="attendees-badge-cls" key={idx}>{trimmed}</div>
//                             ) : null;
//                         })}
//                     </>

//                 )
//             },
//             {
//                 key: "StateName", name: 'State Name', fieldName: 'StateNames', isResizable: true, minWidth: 100, maxWidth: 180, isSortingRequired: true,
//                 onRender: (item: any) => (
//                     <>
//                         {item.StateNames?.split(',').map((name: string, idx: number) => {
//                             const trimmed = name.trim();
//                             return trimmed ? (
//                                 <div className="attendees-badge-cls" key={idx}>{trimmed}</div>
//                             ) : null;
//                         })}
//                     </>

//                 )
//             },
//             {
//                 key: "key5", name: 'Created', fieldName: 'Created', isResizable: true, minWidth: 100, maxWidth: 120, isSortingRequired: true,
//                 onRender: (item: any) => {
//                     const value = item.Created || "";
//                     const parts = value.split(" ");
//                     const date = parts[0] || "";
//                     const time = parts.slice(1).join(" "); // Join back time + AM/PM
//                     return (
//                         <div>
//                             <div>{date}</div>
//                             <div>{time}</div>
//                         </div>
//                     );
//                 }
//             },
//             { key: "key2", name: 'Created By', fieldName: 'CreatedBy', isResizable: true, minWidth: 130, maxWidth: 160, isSortingRequired: true },
//             {
//                 key: "key4", name: 'Modified', fieldName: 'Modified', isResizable: true, minWidth: 100, maxWidth: 120, isSortingRequired: true,
//                 onRender: (item: any) => {
//                     const value = item.Modified || "";
//                     const parts = value.split(" ");
//                     const date = parts[0] || "";
//                     const time = parts.slice(1).join(" "); // Join back time + AM/PM
//                     return (
//                         <div>
//                             <div>{date}</div>
//                             <div>{time}</div>
//                         </div>
//                     );
//                 }
//             },
//             { key: "key4", name: 'Modified By', fieldName: 'ModifiedBy', isResizable: true, minWidth: 130, maxWidth: 160, isSortingRequired: true },
//         ];
//         // if (props.siteNameId) {
//         //     columns = columns.filter(item => item.key !== "SiteName");
//         // }
//         if (props?.siteNameId) {
//             columns = columns.filter(item =>
//                 item.key !== "StateName" &&
//                 item.key !== "SiteName" &&
//                 item.key !== "ViewType"
//             );
//         }
//         return columns;
//     };

//     const onclickdeleteURL = async () => {
//         setIsLoading(true);
//         try {
//             const processUpdateItem = (input: any) => {
//                 if (Array.isArray(input)) {
//                     return input.map(item => ({
//                         Id: item.ID,
//                         IsDeleted: true
//                     }));
//                 } else if (typeof input === 'object' && input !== null) {
//                     return [{ Id: input.ID, IsDeleted: true }];
//                 } else {
//                     return [];
//                 }
//             };
//             const newObjects = processUpdateItem(DeleteURLId);
//             const items = Array.isArray(DeleteURLId) && DeleteURLId.length > 0 ? DeleteURLId : [DeleteURLId];
//             items.forEach((res: any) => {
//                 const logObj = {
//                     UserName: props?.loginUserRoleDetails?.title,
//                     SiteNameId: res?.SiteNameId,
//                     ActionType: UserActivityActionTypeEnum.Delete,
//                     EntityType: UserActionEntityTypeEnum.LinkURL,
//                     EntityId: res?.ID,
//                     EntityName: res?.Title,
//                     Details: `Delete URL Link`,
//                     StateId: props?.qCStateId
//                 };
//                 void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
//             });
//             if (newObjects.length > 0) {
//                 await provider.updateListItemsInBatchPnP(ListNames.URLLink, newObjects)
//             }

//             toggleHideDialogdeleteURL();
//             setisDisplayEDbtn(false);
//             setIsLoading(false);
//         } catch (ex) {
//             const errorObj = {
//                 ErrorMessage: ex.toString(),
//                 ErrorStackTrace: "",
//                 CustomErrormessage: "Error is occuring while  onclickdeleteurl",
//                 PageName: "QuayClean.aspx",
//                 ErrorMethodName: "onclickdelete URLLink"
//             };
//             void logGenerator(provider, errorObj);
//             console.log(ex);
//         }
//     };

//     const onclickdelete = async () => {
//         setIsLoading(true);
//         try {
//             const deleteFileRefs = DeleteId.map((item: any) => item.FileRef);
//             const matchingIDs = calmData
//                 .filter(item => deleteFileRefs.some((deleteRef: any) => item.FileRef.includes(deleteRef)))
//                 .map(item => item.ID);
//             const uniqueMatchingIDs = matchingIDs.filter((id, index, self) => self.indexOf(id) === index);

//             const result = uniqueMatchingIDs.map(id => ({
//                 Id: id,
//                 IsDeleted: true
//             }));

//             DeleteId?.forEach((res: any) => {
//                 const logObj = {
//                     UserName: props?.loginUserRoleDetails?.title,
//                     SiteNameId: res?.SiteNameId,
//                     ActionType: UserActivityActionTypeEnum.Delete,
//                     EntityType: UserActionEntityTypeEnum.Document,
//                     EntityId: Number(res?.ID),
//                     EntityName: res?.FileLeafRef,
//                     Details: `Delete link document path ${res?.FileDirRef}`,
//                     StateId: props?.qCStateId
//                 };
//                 void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
//             });

//             if (result.length > 0) {
//                 await provider.updateListItemsInBatchPnP(ListNames.DocumentsLink, result)
//             }
//             toggleHideDialogdelete();
//             setisDisplayEDbtn(false);
//             setIsLoading(false);
//         } catch (ex) {
//             const errorObj = {
//                 ErrorMessage: ex.toString(),
//                 ErrorStackTrace: "",
//                 CustomErrormessage: "Error is occuring while  onclickdelete",
//                 PageName: "QuayClean.aspx",
//                 ErrorMethodName: "onclickdelete AssociateChemical"
//             };
//             void logGenerator(provider, errorObj);
//             console.log(ex);
//         }
//     };
//     const onclickdelete2 = async () => {
//         setIsLoading(true);

//         try {
//             if (DeleteFile.length > 0) {
//                 for (let index = 0; index < DeleteFile.length; index++) {
//                     provider.deleteFileFromFolder(DeleteFile[index].FileDirRef, DeleteFile[index].FileLeafRef);
//                     // setSourcePath(DeleteFile[index].FileDirRef);
//                     setTimeout(() => {
//                         _getAllDocuments(DeleteFile[index].FileDirRef);
//                     }, 1000);
//                 }
//                 DeleteFile?.forEach((res: any) => {
//                     const logObj = {
//                         UserName: props?.loginUserRoleDetails?.title,
//                         SiteNameId: res?.SiteNameId,
//                         ActionType: UserActivityActionTypeEnum.Delete,
//                         EntityType: UserActionEntityTypeEnum.Document,
//                         EntityId: Number(res?.ID),
//                         EntityName: res?.FileLeafRef,
//                         Details: `Delete file path ${res?.FileDirRef}`,
//                         StateId: props?.qCStateId
//                     };
//                     void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
//                 });

//             }
//             if (DeleteFolder.length > 0) {
//                 for (let indexs = 0; indexs < DeleteFolder.length; indexs++) {
//                     provider.deleteFolder(DeleteFolder[indexs].FileRef);
//                     // setSourcePath(DeleteFolder[indexs].FileDirRef);

//                     setTimeout(() => {
//                         _getAllDocuments(DeleteFile[indexs].FileDirRef);
//                     }, 1000);
//                 }
//                 DeleteFile?.forEach((res: any) => {
//                     const logObj = {
//                         UserName: props?.loginUserRoleDetails?.title,
//                         SiteNameId: res?.SiteNameId,
//                         ActionType: UserActivityActionTypeEnum.Delete,
//                         EntityType: UserActionEntityTypeEnum.Document,
//                         EntityId: Number(res?.ID),
//                         EntityName: res?.FileLeafRef,
//                         Details: `Delete folder path ${res?.FileDirRef}`,
//                         StateId: props?.qCStateId
//                     };
//                     void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
//                 });
//             }
//             // setcalmData2([]);
//             setfiltercalmData2([]);
//             setisDisplayEDbtn2(false);

//             setisReloadDocument(true);
//             setisReloadDocument2(true);
//             toggleHideDialogdelete2();
//             setTimeout(() => {
//                 setIsLoading(false);
//             }, 1000);
//         } catch (ex) {
//             console.log(ex);
//             // setIsLoading(false);
//         }
//     };

//     React.useEffect(() => {
//         const className = document.querySelector('ARTICLE')?.children[0].children[0].classList[0];
//         let el: any = document.querySelector(!!className ? `.${className}` : "");
//         if (!!el) {
//             el.onscroll = function () {
//                 scrollFunction(240);
//             };
//         }
//         let isVisibleCrud1 = (!!PermissionArray && PermissionArray.includes('Document Library') || currentUserRoleDetail.isSiteSupervisor || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.Id == props.siteNameId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0);
//         isVisibleCrud.current = isVisibleCrud1;
//     }, [isRefreshGrid]);

//     React.useEffect(() => {
//         if (sourcePath == "") {
//             _getAllDocuments();
//         }
//         console.log("1");
//     }, [isRefreshGrid, selectedSiteIds, selectedState, selectedType]);

//     React.useEffect(() => {
//         if (LastFolder != "" && isuploadlink == false) {
//             let results: any[] = [];
//             if (calmData2.length > 0) {
//                 results = calmData2.filter(item => item.FileDirRef.endsWith(LastFolder));
//             }
//             if (results.length == 0) {
//                 setfiltercalmData2([]);
//             } else {
//                 setfiltercalmData2(results);
//                 setpreData2(results);
//             }
//         }
//     }, [calmData2]);

//     React.useEffect(() => {
//         if (sourcePath != "") {
//             let results: any[] = [];
//             if (calmData2.length > 0) {
//                 results = calmData2.filter(item => item.FileDirRef.endsWith(sourcePath));
//             }
//             if (results.length == 0) {
//                 setfiltercalmData2([]);
//             } else {
//                 setfiltercalmData2(results);
//                 setpreData2(results);
//             }
//         }

//         setfinalLastLink(sourcePath);
//         _getAllDocuments(sourcePath);
//         setisReloadDocument2(true);
//         setisReloadDocument(false);
//         console.log("2");
//     }, [sourcePath, isReloadDocument, isRefreshGrid, selectedSiteIds, selectedState, selectedType]);

//     React.useEffect(() => {
//         if (sourcePath != "" && isReloadDocument2 === true) {
//             let results: any[] = [];
//             if (calmData2.length > 0) {
//                 results = calmData2.filter(item => item.FileDirRef.endsWith(sourcePath));
//             }
//             if (results.length == 0) {
//                 setfiltercalmData2([]);
//             } else {
//                 setfiltercalmData2(results);
//                 setpreData2(results);
//             }
//         }

//         setfinalLastLink(sourcePath);
//         _getAllDocuments(sourcePath);
//         setisReloadDocument2(false);
//         setisReloadDocument(false);
//         console.log("3");
//     }, [isReloadDocument2, isRefreshGrid, selectedSiteIds, selectedState, selectedType]);





//     React.useEffect(() => {
//         setIsLoading(true);
//         if (props.siteName) {
//             provider._Documentlib(props.siteName).then(() => {
//             }).catch((error: any) => {
//                 const errorObj = {
//                     ErrorMessage: error.toString(),
//                     ErrorStackTrace: "",
//                     CustomErrormessage: "Error is occuring while  useEffect",
//                     PageName: "QuayClean.aspx",
//                     ErrorMethodName: "useEffect ChemicalQrCode"
//                 };
//                 void logGenerator(provider, errorObj);
//             });
//         }
//         if (props.siteNameId != null) {
//             try {
//                 const select = ["ID,Title,QCStateId,QCState/Title"];
//                 const expand = ["QCState"];
//                 const queryStringOptions: IPnPQueryOptions = {
//                     select: select,
//                     expand: expand,
//                     filter: `(ID eq'${props.siteNameId}')`,
//                     listName: ListNames.SitesMaster,
//                 };
//                 provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
//                     if (!!results) {
//                         results.map((data) => {
//                             return (
//                                 {
//                                     ID: data.ID,
//                                     Title: data.Title,
//                                     QCState: !!data.QCStateId ? data.QCState.Title : ''
//                                 }
//                             );
//                         });
//                         const link = context.pageContext.web.absoluteUrl + `/${props.qCState}`;
//                         setURL(link);
//                         setIsLoading(false);
//                     }
//                     else {
//                         setIsLoading(false);
//                     }
//                 }).catch((error: any) => {
//                     console.log(error);
//                 });
//             } catch (ex) {
//                 const errorObj = {
//                     ErrorMessage: ex.toString(),
//                     ErrorStackTrace: "",
//                     CustomErrormessage: "Error is occuring while  useEffect",
//                     PageName: "QuayClean.aspx",
//                     ErrorMethodName: "useEffect AssociateChemical"
//                 };
//                 void logGenerator(provider, errorObj);
//             }
//         } else {
//             setIsLoading(false);
//         }

//     }, [props.qCState, state.isReload, isRefreshGrid]);

//     const onClickClose = () => {
//         setisDocumentPanelOpen(false);
//         setisShowAssetHistoryModel(false);
//         setState(prevState => ({ ...prevState, isReload: !state.isReload }));
//     };



//     const _onItemInvoked = (): void => {
//     };


//     const _onItemSelected2 = (item: any): void => {
//         if (item.length > 0) {
//             const Document = item.filter((i: any) => i.ContentType === "Document");
//             const Folder = item.filter((i: any) => i.ContentType === "Folder");
//             setDeleteFolder(Folder);
//             setDeleteFile(Document);
//             setDeleteId2(item);
//             setisDisplayEDbtn2(true);

//         } else {
//             setDeleteId2(0);
//             setisDisplayEDbtn2(false);
//         }
//     };

//     const onRenderFooterContent = () => {
//         return <div>
//             <PrimaryButton className="btn btn-danger" onClick={onClickClose} text="Close" />
//         </div>;
//     };

//     const [isUploadingFile, setUploadingFile] = React.useState<boolean>(false);
//     const allPromiseProgress = (fileUploadPromises: any[], fileUploadProgress: any): Promise<any> => {
//         let progress = 0;
//         fileUploadProgress(0);
//         for (const awaitFileUpload of fileUploadPromises) {
//             awaitFileUpload.then((file: any) => {
//                 progress++;
//                 const progPercentage = ((progress * 100) / fileUploadPromises?.length).toFixed(2);
//                 fileUploadProgress(progPercentage, file);
//             });
//         }
//         return Promise.all(fileUploadPromises);
//     };

//     const onClickUpload = async () => {
//         if (selectedType === "") {
//             seterrorViewType(true);
//         } else if (selectedType === "Site" && selectedSiteIds.length === 0) {
//             seterrorSite(true);
//         } else if (selectedType === "State" && selectedState.length === 0) {
//             seterrorState(true);
//         } else {
//             setcalmData2([]);
//             setUploadingFile(true);
//             let apiArray: any = [];
//             let i = 0;
//             let link;
//             files?.map((cftItem: any) => {
//                 let DocumentData1 = {
//                     ViewType: selectedType,
//                     SiteNameId: selectedType === "Site" ? selectedSiteIds : [],
//                     StateNameId: selectedType === "State" ? selectedState : [],
//                 };
//                 apiArray.push(provider.uploadFilewithSiteUrl(cftItem.file, cftItem.folderServerRelativeURL, true, DocumentData1).then(async (item: any) => {
//                     console.log();
//                 }).catch((err: any) => console.log(err)));
//                 if (i == 0) {
//                     link = cftItem.folderServerRelativeURL;
//                     i = i + 1;
//                 }
//             });

//             const resultData: any[] = [];
//             await allPromiseProgress(apiArray, (progPercentage: number, file: any) => {
//                 if (file) {
//                     resultData.push(file);
//                     uploadedFileCount += 1;
//                 }
//                 setPercentComplete(((progPercentage / 100) + percentComplete) % 1);
//             });
//             if (resultData.length === files.length) {
//                 uploadedFileCount = 0;
//                 setFiles([]);
//                 setSelectedState([]);
//                 setSelectedSiteIds([]);
//                 setSelectedType("");
//             }
//             setUploadingFile(false);
//             await Promise.all(apiArray);
//             hidePopup2();
//             setisuploadlink(true);
//             _getAllDocuments(link);
//             seterrorState(false);
//             seterrorSite(false);
//             seterrorViewType(false);
//             setFiles([]);
//             setSelectedState([]);
//             setSelectedSiteIds([]);
//             setSelectedType("");
//         }
//     };

//     const onClickUploadCancel = () => {
//         hidePopup2();
//         seterrorState(false);
//         seterrorSite(false);
//         seterrorViewType(false);
//         setSelectedState([]);
//         setSelectedSiteIds([]);
//         setSelectedType("");
//         setFiles([]);
//     };

//     const onCloseModel = () => {
//         setisDisplayFilterDialog(false);
//     };

//     const onClickPopupCreateFolder = () => {
//         showPopup();
//     };

//     const onClickAddDocument = () => {
//         showPopup2();
//     };

//     const onClickCancel = () => {
//         settitle("");
//         hidePopup();
//     };

//     const onClickLinkCancel = () => {
//         seterrorState(false);
//         seterrorSite(false);
//         seterrorViewType(false);
//         setSelectedState([]);
//         setSelectedSiteIds([]);
//         setSelectedType("");
//         hidePopupURL();
//         hidePopupRename();
//     };

//     const cleanLink = (link: string): string => {
//         // Use regex to remove spaces before and after slashes
//         return link.replace(/\s*\/\s*/g, '/');
//     };


//     const onClickCreateFolder = async () => {
//         setIsLoading(true);
//         let newFolderName = "";
//         let finalnewFolderName = "";
//         let test = "";
//         if (filtercalmData2.length > 0) {
//             newFolderName = `${filtercalmData2[0].FileDirRef}/${title}`;
//             test = `${filtercalmData2[0].FileDirRef}`;
//         }
//         else {
//             if (preData2.length > 0) {
//                 newFolderName = `${preData2[0].FileRef}/${title}`;
//                 test = `${preData2[0].FileRef}`;
//             } else {
//                 newFolderName = `${context.pageContext.web.serverRelativeUrl}/${"PoliciesandProcedures"}/${props.siteName}/${title}`;
//             }
//         }
//         if (finalLastLink == "" || finalLastLink == undefined) {
//             finalnewFolderName = newFolderName;
//         } else {
//             finalnewFolderName = `${finalLastLink}/${title}`;
//         }
//         const cleanedLink = cleanLink(finalnewFolderName);

//         await provider.createFolder(cleanedLink, {
//             // SiteNameId: Number(props.siteNameId)
//         }).then(async () => {
//             settitle("");
//             _getAllDocuments(finalLastLink);
//             hidePopup();
//         });
//     };

//     const setFilesToState = (files: any[]) => {
//         try {
//             const selectedFiles: IFileWithBlob[] = [];
//             let newFolderName;
//             if (finalLastLink == "" || finalLastLink == undefined) {
//                 if (filtercalmData2.length > 0) {
//                     newFolderName = `${filtercalmData2[0].FileDirRef}`;
//                 }
//                 else {
//                     if (preData2.length > 0) {
//                         newFolderName = `${preData2[0].FileRef}`;
//                     } else {
//                         newFolderName = `${context.pageContext.web.serverRelativeUrl}/${"PoliciesandProcedures"}/${props.siteName}`;
//                     }
//                 }
//             } else {
//                 newFolderName = finalLastLink;
//             }


//             if (files.length > 0) {
//                 for (let i = 0; i < files.length; i++) {
//                     const file = files[i];
//                     const selectedFile: IFileWithBlob = {
//                         file: file,
//                         name: file.name,
//                         folderServerRelativeURL: newFolderName || "",
//                         overwrite: true,
//                         key: i
//                     };
//                     selectedFiles.push(selectedFile);
//                 }
//                 setFiles(selectedFiles);
//             } else {
//                 setFiles([]);
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     };


//     const onClickRename = async () => {
//         if (selectedType === "") {
//             seterrorViewType(true);
//         } else if (selectedType === "Site" && selectedSiteIds.length === 0) {
//             seterrorSite(true);
//         } else if (selectedType === "State" && selectedState.length === 0) {
//             seterrorState(true);
//         } else {
//             setIsLoading(true);
//             let UpdateObj = {
//                 ViewType: selectedType,
//                 SiteNameId: selectedType === "Site" ? selectedSiteIds : [],
//                 StateNameId: selectedType === "State" ? selectedState : [],
//             };
//             await provider.updateItemWithPnP(UpdateObj, ListNames.PoliciesandProcedures, Number(updateItemId.current));
//             let newLink = RenameFileRef.substring(0, RenameFileRef.lastIndexOf('/'));
//             provider.RenameFile(RenameFileRef, Rename).then((res: any) => {
//                 console.log(res);
//                 _getAllDocuments(newLink);
//                 setIsLoading(false);
//             }).catch((error: any) => {
//                 console.log(error);
//                 setIsLoading(false);
//             });
//             seterrorState(false);
//             seterrorSite(false);
//             seterrorViewType(false);
//             setSelectedState([]);
//             setSelectedSiteIds([]);
//             setSelectedType("");
//             hidePopupRename();
//         }
//     };

//     const onclickRefreshGrid = () => {
//         setIsRefreshGrid(prevState => !prevState);
//     };

//     const onClickRenameDialog = async (item: any) => {
//         setRenameFileRef(item.FileRef);
//         let orgName = item.FileLeafRef.replace(/\.[^/.]+$/, "");
//         setRename(orgName);
//         updateItemId.current = item?.ID;
//         setSelectedState(item.StateIds);
//         setSelectedSiteIds(item.SiteIds);
//         setSelectedType(item.ViewType);
//         showPopupRename();
//     };


//     const onTypeChange = (Type: any): void => {
//         setSelectedType(Type);
//         seterrorViewType(false);
//     };
//     const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
//         if (siteIds?.length > 0) {
//             seterrorSite(false);
//         } else {
//             if (selectedType === "Site") {
//                 seterrorSite(true);
//             }
//         }
//         setSelectedSiteIds(siteIds);
//         setSelectedSiteTitles(siteTitles);
//         setSelectedSCSites(siteSC);
//     };
//     const onStateChange = (stateIds: number[], options: any): void => {
//         if (stateIds?.length > 0) {
//             seterrorState(false);
//         } else {
//             if (selectedType === "State") {
//                 seterrorState(true);
//             }

//         }
//         setSelectedState(stateIds); // Store the selected state IDs as an array
//     };
//     return <>

//         {isPopupVisible2 && (
//             <Layer>
//                 <Popup
//                     className={popupStyles2.root}
//                     role="dialog"
//                     aria-modal="true"
//                     onDismiss={hidePopup2}
//                 >
//                     <Overlay onClick={hidePopup2} />
//                     <>
//                         <div role="document" className={popupStyles2.content}>
//                             <h2 className="mt-20">Upload Files</h2>
//                             <>
//                                 <div className="ms-Grid-row filml-8 mt-3">
//                                     <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg3 ms-xl3 ml--8">
//                                         <div className="formControl">
//                                             <Label className="labelForm">View Type<span className="required">*</span></Label>
//                                             <TypeFilter
//                                                 selectedType={selectedType}
//                                                 onTypeChange={onTypeChange}
//                                                 provider={provider}
//                                                 isRequired={true}
//                                                 AllOption={true}
//                                             />
//                                             {errorViewType && <span className="requiredlink">View Type is requred</span>}
//                                         </div>
//                                     </div>
//                                     {selectedType === "Site" && <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg3 ms-xl3 ml--8">
//                                         <div className="formControl">
//                                             <Label className="labelForm">Site<span className="required">*</span></Label>
//                                             <MultipleSiteFilter
//                                                 isPermissionFilterUpdate={false}
//                                                 isPermissionFiter={true}
//                                                 loginUserRoleDetails={props.loginUserRoleDetails}
//                                                 selectedSiteIds={selectedSiteIds}
//                                                 selectedSiteTitles={selectedSiteTitles}
//                                                 selectedSCSite={selectedSCSites}
//                                                 onSiteChange={handleSiteChange}
//                                                 provider={provider}
//                                                 isRequired={false}
//                                                 AllOption={true}
//                                             />
//                                             {errorSite && <span className="requiredlink">Site is requred</span>}
//                                         </div>
//                                     </div>}
//                                     {selectedType === "State" && <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg3 ms-xl3 ml--8">
//                                         <div className="formControl">
//                                             <Label className="labelForm">State<span className="required">*</span></Label>
//                                             <MultiStateFilter
//                                                 loginUserRoleDetails={props.loginUserRoleDetails}
//                                                 selectedState={selectedState}
//                                                 onStateChange={onStateChange}
//                                                 provider={provider}
//                                                 isRequired={false}
//                                                 AllOption={true}
//                                             />
//                                             {errorState && <span className="requiredlink">State is requred</span>}
//                                         </div>
//                                     </div>}
//                                 </div>
//                                 <div className="mt15">
//                                     <DragandDropFilePicker isMultiple={true} setFilesToState={setFilesToState} />
//                                 </div>

//                                 {isUploadingFile && <div className="progress-fileUpload">
//                                     <div className="progress-Content">
//                                         <ProgressIndicator label="Uploading Files..."
//                                             description={`Successfully uploaded ${uploadedFileCount} file(s) out of ${files?.length}`}
//                                             ariaValueText="Uploading Files..."
//                                             barHeight={10}
//                                             percentComplete={percentComplete}
//                                         />
//                                     </div>
//                                 </div>
//                                 }
//                             </ >
//                             <DialogFooter>

//                                 <PrimaryButton
//                                     text="Upload"
//                                     onClick={onClickUpload}
//                                     className={`mrt15 css-b62m3t-container btn ${!files || files.length === 0 ? 'btn-sec' : 'btn-primary'}`}
//                                     disabled={!files || files.length === 0}
//                                 />
//                                 <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickUploadCancel} />
//                             </DialogFooter>
//                         </div>
//                     </>
//                 </Popup>
//             </Layer>
//         )}

//         {isPopupVisible && (
//             <Layer>
//                 <Popup
//                     className={popupStyles.root}
//                     role="dialog"
//                     aria-modal="true"
//                     onDismiss={hidePopup}
//                 >
//                     <Overlay onClick={hidePopup} />
//                     <FocusTrapZone>
//                         <div role="document" className={popupStyles.content}>
//                             <h2 className="mt-10">Create Folder</h2>
//                             <TextField className="formControl mt-20" label="Folder Name" placeholder="Enter new folder name"
//                                 value={title}
//                                 required
//                                 onChange={onChangeTitle} />

//                             <DialogFooter>
//                                 <PrimaryButton
//                                     text="Create"
//                                     disabled={title.trim() === ""}
//                                     onClick={onClickCreateFolder}
//                                     className={`mrt15 css-b62m3t-container btn ${title.trim() === "" ? 'btn-sec' : 'btn-primary'}`}
//                                 />
//                                 <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickCancel} />
//                             </DialogFooter>

//                         </div>
//                     </FocusTrapZone>
//                 </Popup>
//             </Layer>
//         )}

//         {isDocumentPanelOpen &&
//             <Panel
//                 isOpen={isDocumentPanelOpen}
//                 onDismiss={onClickClose}
//                 type={PanelType.extraLarge}
//                 headerText="Documents View"
//                 onRenderFooterContent={onRenderFooterContent}
//             >
//                 <iframe src={documnetUrl} style={{ width: "100%", height: "90vh" }} />
//             </Panel >
//         }
//         {isDisplayFilterDialog &&
//             <CustomModal
//                 isModalOpenProps={isDisplayFilterDialog}
//                 dialogWidth={"300px"}
//                 setModalpopUpFalse={onCloseModel}
//                 subject={"Warning"}
//                 message={<div>Please select filter value</div>}
//                 yesButtonText="Ok"
//                 onClickOfYes={onCloseModel}
//             />}
//         <Dialog
//             hidden={hideDialog}
//             onDismiss={toggleHideDialog}
//             dialogContentProps={dialogContentProps}>
//             <DialogFooter>
//                 <PrimaryButton text="Ok" onClick={toggleHideDialog} className="ms-Button ms-Button--success dialog-space" />
//             </DialogFooter>
//         </Dialog>
//         {(
//             <CustomModal isModalOpenProps={hideDialogdeleteURL} setModalpopUpFalse={() => toggleHideDialogdeleteURL()} subject={"Delete  Confirmation "} message={<div>Are you sure, you want to delete this record?</div>} yesButtonText="Yes" closeButtonText={"No"} onClickOfYes={onclickdeleteURL} />
//         )}
//         {(
//             <CustomModal isModalOpenProps={hideDialogdelete} setModalpopUpFalse={() => toggleHideDialogdelete()} subject={"Delete  Confirmation "} message={<div>Are you sure, you want to delete this record?</div>} yesButtonText="Yes" closeButtonText={"No"} onClickOfYes={onclickdelete} />
//         )}
//         {(
//             <CustomModal isModalOpenProps={hideDialogdelete2} setModalpopUpFalse={() => toggleHideDialogdelete2()} subject={"Delete  Confirmation "} message={<div>Are you sure, you want to delete?</div>} yesButtonText="Yes" closeButtonText={"No"} onClickOfYes={onclickdelete2} />
//         )}
//         {isLoading && <Loader />}
//         {isShowAssetHistoryModel && <DocumentsLibDialog manageComponentView={props.manageComponentView} qCState={props.qCState} siteName={props.siteName} context={context} provider={provider} AlocateChemical={AssocitedChemicalArray} SiteURL={URL} siteNameId={props.siteNameId} onClickClose={onClickClose} isModelOpen={isShowAssetHistoryModel} loginUserRoleDetails={currentUserRoleDetail} />}

//         <div className={props.siteView ? "" : "boxCard"} >
//             <div className="ms-Grid-row more-page-wrapper">
//                 {!props.siteView && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
//                     <h1 className="mainTitle">Policies and Procedures</h1>
//                 </div>}
//                 <div className="ms-Grid-row filml-8 ">
//                     <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 ml--8">
//                         <div className="">
//                             {props.siteName ?
//                                 <CustomBreadcrumb
//                                     siteServerRelativeURL={`${context.pageContext.web.serverRelativeUrl}`}
//                                     parentBreadCrumbItem={{
//                                         key: `${context.pageContext.web.serverRelativeUrl}/${"PoliciesandProcedures"}/${props.siteName}`,
//                                         text: `${props.siteName}`
//                                     }}
//                                     setSourcePath={setSourcePath} // set a new path when click on breadcrumb item.
//                                     newBreadcrumbItem={newBreadcrumbItem || undefined} // add a new item in breadcrumb when folder is clicked
//                                 /> :
//                                 <CustomBreadcrumb
//                                     siteServerRelativeURL={`${context.pageContext.web.serverRelativeUrl}`}
//                                     parentBreadCrumbItem={{
//                                         key: `${context.pageContext.web.serverRelativeUrl}/${"PoliciesandProcedures"}`,
//                                         text: `${"Policies and Procedures"}`
//                                     }}
//                                     setSourcePath={setSourcePath} // set a new path when click on breadcrumb item.
//                                     newBreadcrumbItem={newBreadcrumbItem || undefined} // add a new item in breadcrumb when folder is clicked
//                                 />
//                             }
//                         </div>
//                     </div>
//                 </div>
//                 <div className='ms-Grid-row p-14 mt--20'>
//                     <div className='ms-md12 ms-sm12 ms-Grid-col'>
//                         <div className='dashboard-cardd p00'>
//                             <div className='card-header'></div>
//                             <div className='p-15 height211 lightgrey2'>
//                                 <div className="">
//                                     {(!props.siteNameId && props.siteView == false) && <div className="ms-Grid-row filml-8">
//                                         <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
//                                             <div className="formControl">
//                                                 <TypeFilter
//                                                     selectedType={selectedType}
//                                                     onTypeChange={onTypeChange}
//                                                     provider={provider}
//                                                     isRequired={true}
//                                                     AllOption={true}
//                                                 />
//                                             </div>
//                                         </div>

//                                         <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
//                                             <div className="formControl">
//                                                 <MultiStateFilter
//                                                     loginUserRoleDetails={props?.loginUserRoleDetails}
//                                                     selectedState={selectedState}
//                                                     onStateChange={onStateChange}
//                                                     provider={provider}
//                                                     isRequired={false}
//                                                     AllOption={true}
//                                                 />
//                                             </div>
//                                         </div>

//                                         <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4 ms-xl2 ml--8">
//                                             <div className="formControl">
//                                                 <MultipleSiteFilter
//                                                     isPermissionFilterUpdate={false}
//                                                     isPermissionFiter={true}
//                                                     loginUserRoleDetails={props?.loginUserRoleDetails}
//                                                     selectedSiteIds={selectedSiteIds}
//                                                     selectedSiteTitles={selectedSiteTitles}
//                                                     selectedSCSite={selectedSCSites}
//                                                     onSiteChange={handleSiteChange}
//                                                     selectedState={selectedState}
//                                                     provider={provider}
//                                                     isRequired={false}
//                                                     AllOption={true}
//                                                 />
//                                             </div>
//                                         </div>

//                                     </div>}
//                                     <div className="searchbtn">
//                                         <div className="formGroup mt-3">

//                                             <MemoizedDetailList
//                                                 manageComponentView={props.manageComponentView}
//                                                 columns={AddDocumentColumn() as any}
//                                                 items={filtercalmData2.length > 0 || notFoundFF2 ? filtercalmData2 : calmData2}
//                                                 reRenderComponent={true}
//                                                 searchable={true}
//                                                 isAddNew={true}
//                                                 CustomselectionMode={isVisibleCrud.current ? SelectionMode.none : SelectionMode.none}
//                                                 // CustomselectionMode={!props.IsSupervisor ? SelectionMode.none : SelectionMode.none}
//                                                 onItemInvoked={_onItemInvoked}
//                                                 onSelectedItem={_onItemSelected2}
//                                                 addEDButton={
//                                                     <></>
//                                                     //     (isDisplayEDbtn2 && isVisibleCrud.current) && <>
//                                                     //     <Link className="actionBtn btnDanger iconSize  ml-10" onClick={onclickconfirmdelete2}>
//                                                     //         <TooltipHost content={"Delete"} id={tooltipId}>
//                                                     //             <FontAwesomeIcon icon="trash-alt" />
//                                                     //         </TooltipHost>
//                                                     //     </Link>
//                                                     // </>
//                                                 }
//                                                 addNewContent={<div className="dflex pb-1 mb-sm-3 new-add-cls">
//                                                     <Link className="actionBtn iconSize btnRefresh add-doc-icon-m" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
//                                                         text="">
//                                                         <TooltipHost
//                                                             content={"Refresh Grid"}
//                                                             id={tooltipId}>
//                                                             <FontAwesomeIcon
//                                                                 icon={"arrows-rotate"} />
//                                                         </TooltipHost> </Link>
//                                                     {/* {isVisibleCrud.current &&
//                                                         <div>
//                                                             <TooltipHost
//                                                                 content={"Create New Folder"}
//                                                                 id={tooltipId}>
//                                                                 <PrimaryButton text="Create Folder" onClick={onClickPopupCreateFolder} className="btn btn-primary ml5" />
//                                                             </TooltipHost>
//                                                             <TooltipHost
//                                                                 content={"Add Document"}
//                                                                 id={tooltipId}>
//                                                                 <PrimaryButton text="Add" onClick={onClickAddDocument} className="btn btn-primary ml5" />
//                                                             </TooltipHost>
//                                                         </div>} */}
//                                                 </div>
//                                                 }
//                                             />
//                                         </div>

//                                     </div>

//                                 </div >
//                             </div>
//                         </div>
//                     </div>
//                 </div >
//             </div>
//         </div >

//         {isPopupVisibleRename && (
//             <Layer>
//                 <Popup
//                     className={popupStyles.root}
//                     role="dialog"
//                     aria-modal="true"
//                     onDismiss={hidePopupURL}
//                 >
//                     <Overlay onClick={hidePopupURL} />
//                     <>
//                         <div role="document" className={popupStyles.content}>

//                             <h2 className="mt-10">Update</h2>
//                             <div className="ms-Grid-row filml-8 mt-3">
//                                 <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 ml--8">
//                                     <div className="formControl">
//                                         <Label className="labelForm">View Type<span className="required">*</span></Label>
//                                         <TypeFilter
//                                             selectedType={selectedType}
//                                             onTypeChange={onTypeChange}
//                                             provider={provider}
//                                             isRequired={true}
//                                             AllOption={true}
//                                         />
//                                         {errorViewType && <span className="requiredlink">View Type is requred</span>}
//                                     </div>
//                                 </div>
//                                 {selectedType === "Site" && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 ml--8">
//                                     <div className="formControl">
//                                         <Label className="labelForm">Site<span className="required">*</span></Label>
//                                         <MultipleSiteFilter
//                                             isPermissionFilterUpdate={false}
//                                             isPermissionFiter={true}
//                                             loginUserRoleDetails={props.loginUserRoleDetails}
//                                             selectedSiteIds={selectedSiteIds}
//                                             selectedSiteTitles={selectedSiteTitles}
//                                             selectedSCSite={selectedSCSites}
//                                             onSiteChange={handleSiteChange}
//                                             provider={provider}
//                                             isRequired={false}
//                                             AllOption={true}
//                                         />
//                                         {errorSite && <span className="requiredlink">Site is requred</span>}
//                                     </div>
//                                 </div>}
//                                 {selectedType === "State" && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 ml--8">
//                                     <div className="formControl">
//                                         <Label className="labelForm">State<span className="required">*</span></Label>
//                                         <MultiStateFilter
//                                             selectedState={selectedState}
//                                             onStateChange={onStateChange}
//                                             provider={provider}
//                                             isRequired={false}
//                                             AllOption={true}
//                                         />
//                                         {errorState && <span className="requiredlink">State is requred</span>}
//                                     </div>
//                                 </div>}
//                                 <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 ml--8">
//                                     <div className="formControl">
//                                         <Label className="labelForm">Rename<span className="required">*</span></Label>
//                                         <TextField className="formControl" label="" placeholder="Enter New Name"
//                                             value={Rename}
//                                             onChange={onChangeRename} />
//                                         {displayerrorRename && <span className="requiredlink">Enter New Name</span>}
//                                     </div>
//                                 </div>
//                             </div>
//                             <DialogFooter>
//                                 <PrimaryButton text="Update" onClick={onClickRename} className='mrt15 css-b62m3t-container btn btn-primary' />
//                                 <DefaultButton text="Cancel" className='secondMain btn btn-danger' onClick={onClickLinkCancel} />
//                             </DialogFooter>
//                         </div>
//                     </>
//                 </Popup>
//             </Layer>
//         )
//         }
//         {
//             menuTarget && (
//                 <ContextualMenu
//                     items={menuItems}
//                     target={menuTarget}
//                     onDismiss={onMenuDismiss}
//                     directionalHint={4} // DirectionalHint.bottomLeftEdge
//                 />
//             )
//         }
//         <Panel
//             isOpen={showModal}
//             onDismiss={() => closeModal()}
//             type={PanelType.extraLarge}
//             headerText="Document View"
//         >
//             <iframe src={fileURL} style={{ width: "100%", height: "90vh" }} />
//         </Panel>
//     </>
// }