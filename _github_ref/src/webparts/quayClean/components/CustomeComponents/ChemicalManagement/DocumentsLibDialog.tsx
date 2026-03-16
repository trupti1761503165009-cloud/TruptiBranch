import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import CustomModal from "../../CommonComponents/CustomModal";
import { DialogType, IColumn, Link, Panel, PanelType, PrimaryButton, SelectionMode, TooltipHost } from "@fluentui/react";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { getConvertedDate, getFileTypeIcon, logGenerator, UserActivityLog } from "../../../../../Common/Util";
import { IAssetHistory } from "../../../../../Interfaces/IAssetHistory";
import { ListNames, UserActionEntityTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { IQuayCleanState } from "../../QuayClean";
import { Loader } from "../../CommonComponents/Loader";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import CamlBuilder from "camljs";
import { useId } from "@fluentui/react-hooks";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
export interface IAssetHistoryProps {
    provider: IDataProvider;
    siteNameId: number;
    isModelOpen: boolean;
    context: WebPartContext;
    siteName?: string;
    onClickClose(): any;
    SiteURL?: string;
    AlocateChemical?: any;
    manageComponentView?: any;
    siteMasterId?: any;
    qCState?: string;
    loginUserRoleDetails: ILoginUserRoleDetails;

}
export interface IAssetHistoryState {
    isModelOpen: boolean;
    column: IColumn[];
    detailList: any;
    assetHistoryItems: IAssetHistory[];
    isPanelOpen: boolean;
    url: string;
    filterobj: any;
    reload: boolean;
    issave: boolean;
    ddfilter: string;
}
export const DocumentsLibDialog = (props: IAssetHistoryProps) => {
    const [MasterData, setMasterData] = React.useState<any[]>([]);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { currentUserRoleDetail } = appGlobalState;
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);
    const [isErrorModelOpen, setIsErrorModelOpen] = React.useState<boolean>(false);
    const [AllData, setAllData] = React.useState<any[]>([]);
    let [calmData, setcalmData] = React.useState<any[]>([]);
    const [filtercalmData, setfiltercalmData] = React.useState<any[]>([]);
    const [notFoundFF, setnotFoundFF] = React.useState<boolean>(false);
    const [PreFolder, setPreFolder] = React.useState<string>("");
    const tooltipId = useId('tooltip');
    const [displayback, setdisplayback] = React.useState<boolean>(false);
    const [preData, setpreData] = React.useState<any[]>([]);
    const [DocumentsLink, setDocumentsLink] = React.useState<any>([]);
    const [AllDocumentsLink, setAllDocumentsLink] = React.useState<any>([]);
    const AllFilesAndFolder = React.useRef<any[]>([]);
    let [matchdata, setmatchdata] = React.useState<any[]>([]);
    const newdata = React.useRef<any[]>([]);
    const [state, setState] = React.useState<IAssetHistoryState>({
        isModelOpen: props.isModelOpen,
        column: [],
        detailList: null,
        assetHistoryItems: [],
        isPanelOpen: false,
        url: "",
        filterobj: [],
        reload: false,
        issave: false,
        ddfilter: ""
    });
    const [isload, setisload] = React.useState<boolean>(false);

    const _getDocumentsLink = () => {
        try {
            const select = ["ID,Title,DocumentsLink,SiteNameId,FileLeafRef0,FileDirRef0,ContentType0,FileRef0"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `(SiteNameId eq'${props.siteNameId}' and IsDeleted eq 0)`,
                listName: ListNames.DocumentsLink,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const AssetListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                                DocumentsLink: !!data.DocumentsLink ? data.DocumentsLink : "",
                                FileDirRef: !!data.FileDirRef0 ? data.FileDirRef0 : "",
                                FileLeafRef: !!data.FileLeafRef0 ? data.FileLeafRef0 : "",
                                ContentType: !!data.ContentType0 ? data.ContentType0 : "",
                                FileRef: !!data.FileRef0 ? data.FileRef0 : "",
                            }
                        );
                    });
                    let res: any[] = [];
                    setisload(true);
                    if (AssetListData.length > 0) {
                        res = AssetListData.filter(item => item.ContentType != "Folder");
                    }
                    setDocumentsLink(res);
                    setAllDocumentsLink(AssetListData);
                }
                setIsLoading(false);
            }).catch((error) => {
                console.log(error);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_associatedChemical", CustomErrormessage: "error in get associate chemical", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }

    };



    const getassociateChemicalsitems = () => {
        let queryOptions: IPnPQueryOptions = {
            listName: ListNames.ChemicalRegistration,
            select: ['Id,Title,ExpirationDate,SiteNameId']
        };
        setIsLoading(false);
        return props.provider.getItemsByQuery(queryOptions);
    };

    const onClickFolder = async (currentFolderName: string) => {
        let results: any[] = [];
        const folderPath = "/" + currentFolderName;
        // Added 27-2-2025
        calmData = AllFilesAndFolder.current;
        if (calmData.length > 0) {
            results = calmData.filter(item => item.FileDirRef.endsWith(folderPath));
        }
        if (currentFolderName == "DocumentLibrary") {
            setdisplayback(false);
        } else {
            setdisplayback(true);
        }
        setdisplayback(true);
        setPreFolder(folderPath);
        if (results.length == 0) {

            setnotFoundFF(true);
            setfiltercalmData([]);
        } else {
            setnotFoundFF(false);
            setfiltercalmData(results);
            setpreData(results);
        }
    };
    const _onClickBack = () => {
        let results: any[] = [];
        let secondLastName: any;
        let link = filtercalmData[0]?.FileRef;
        if (link == undefined) {
            link = preData[0]?.FileRef;
            const parts = link?.split('/');
            secondLastName = parts[parts.length - 2];
        } else {
            const parts = link?.split('/');
            secondLastName = parts[parts.length - 3];
        }

        if (secondLastName == "DocumentLibrary") {
            setdisplayback(false);
        } else {
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
    const getassociateChemicalsColumn = (): IColumn[] => {
        let columns: IColumn[] = [
            {
                key: "key1", name: 'Audit Reports', fieldName: 'FileLeafRef', isResizable: true, minWidth: 200, maxWidth: 550, onRender: ((item: any) => {
                    let fileIcon = getFileTypeIcon(item.FileLeafRef);
                    return <>
                        <div style={{ display: "flex" }} >
                            <Link onClick={() => {
                                if (item.ContentType == "Folder") {
                                    onClickFolder(item.FileLeafRef);
                                } else {
                                    // "Folder"setState(prevState => ({ ...prevState, isDocumentPanelOpen: true, documnetUrl: item.previewUrl }));
                                }
                            }}>
                                <TooltipHost
                                    content={item.ContentType == "Folder" ? "Click to open" : "View Audit Reports"}
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
        ];
        return columns;
    };


    const _onItemSelected = (item: any): void => {
        setMasterData([]);
        setmatchdata([]);
        let data: any[] = [];
        setState(prevState => ({ ...prevState, issave: false }));
        if (!!item && item.length > 0) {
            setState(prevState => ({ ...prevState, issave: true }));

            let results: any[] = [];
            let dataNames: any[] = [];

            results = item.filter((item: any) => item.ContentType == "Folder");
            if (results.length > 0) {
                for (let i = 0; i < results.length; i++) {
                    let currentItem = results[i];
                    if (currentItem.FileRef) {
                        data.push(currentItem.FileRef);
                    }
                }
            }
            let filRecord: any[] = [];
            if (newdata.current?.length > 0 && data?.length > 0) {
                filRecord = newdata.current.filter(record => {
                    // Check if the record's link includes any of the strings in the data array
                    return data.some(path => record.FileRef.includes(path + "/".trim()));
                });

            }

            let newUpdateData: any = [...filRecord, ...item];
            let arr: any[] = [];
            setMasterData([]);
            newUpdateData.map((e1: any, i1: any) => {
                let obj = {
                    DocumentsLink: e1.EncodedAbsUrl,
                    FileDirRef0: e1.FileDirRef,
                    FileLeafRef0: e1.FileLeafRef,
                    FileRef0: e1.FileRef,
                    SiteNameId: props.siteNameId,
                    ContentType0: e1.ContentType
                };
                arr.push(obj);
            });

            setMasterData(arr);

        }
    };

    const onClickCloseModel = () => {
        props.onClickClose();
        setState(prevState => ({ ...prevState, isModelOpen: false }));
    };

    const removeDuplicates = (data: any[]): any[] => {
        const seen = new Map<string, any>();
        data.forEach((record) => {
            if (!seen.has(record.FileRef0)) {
                seen.set(record.FileRef0, record);
            }
        });
        return Array.from(seen.values());
    };


    const generateFolderRecords = (data: any[]): any[] => {
        const result: any[] = [...data];
        data.forEach((record: any) => {
            const pathParts = record.FileDirRef0.split("/").filter(Boolean);
            const basePath = `/${pathParts.slice(0, 3).join("/")}`; // "/sites/QuaycleanDev/DocumentLibrary"
            // Generate folder paths up to DocumentLibrary
            for (let i = pathParts.length - 1; i > 2; i--) {
                const folderPath = `/${pathParts.slice(0, i).join("/")}`;
                const folderName = pathParts[i];
                // Check if the folder record already exists
                if (!result.some((r) => r.FileRef0 === folderPath)) {
                    result.push({
                        FileDirRef0: i > 3 ? `/${pathParts.slice(0, i).join("/")}` : basePath,
                        FileLeafRef0: folderName,
                        FileRef0: folderPath + '/' + folderName,
                        SiteNameId: record.SiteNameId,
                        ContentType0: "Folder",
                    });
                }
            }
        });

        // const result: any[] = [];

        // if (data.length > 0) {
        //     const record = data[0];  // Use only the first item
        //     const pathParts = record.FileDirRef0.split("/").filter(Boolean);
        //     const basePath = `/${pathParts.slice(0, 3).join("/")}`; // "/sites/QuaycleanDev/DocumentLibrary"

        //     // Push the original record first
        //     result.push(record);

        //     // Generate folder paths up to DocumentLibrary
        //     for (let i = pathParts.length - 1; i > 2; i--) {
        //         const folderPath = `/${pathParts.slice(0, i).join("/")}`;
        //         const folderName = pathParts[i];

        //         // Check if the folder record already exists
        //         if (!result.some((r) => r.FileRef0 === folderPath + '/' + folderName)) {
        //             result.push({
        //                 FileDirRef0: i > 3 ? `/${pathParts.slice(0, i).join("/")}` : basePath,
        //                 FileLeafRef0: folderName,
        //                 FileRef0: folderPath + '/' + folderName,  // Updated: Include folder name in FileRef0
        //                 SiteNameId: record.SiteNameId,
        //                 ContentType0: "Folder",
        //                 DocumentsLink: ""
        //             });
        //         }
        //     }
        // }



        // Log the result
        console.log(JSON.stringify(result, null, 2));

        // Sort the result to ensure folders come before files in the same path
        result.sort((a, b) => a.FileRef0.localeCompare(b.FileRef0));
        return result;
    };
    const _createBatch = () => {
        setIsLoading(true);
        const titles = MasterData?.map((item: any) => item?.FileLeafRef0).join(', ');
        const logObj = {
            UserName: currentUserRoleDetail.title,
            SiteNameId: props.siteNameId,
            ActionType: "Create",
            EntityType: UserActionEntityTypeEnum.LinkDocument,
            // EntityId: Number(createdId),
            EntityName: "Link Document",
            Details: `Link Document ${titles}`,
        };
        void UserActivityLog(props.provider, logObj, currentUserRoleDetail);

        const docSet = new Set(AllDocumentsLink.map((doc: any) => doc.FileRef));
        const filteredData = MasterData.filter(dataItem => !docSet.has(dataItem.FileRef0));
        const transformedData = generateFolderRecords(filteredData);
        const finalData = removeDuplicates(transformedData)

        if (filteredData.length > 0) {
            props.provider.createItemInBatch(transformedData, ListNames.DocumentsLink).then((response) => {
                props.onClickClose();
                setState(prevState => ({ ...prevState, isModelOpen: false }));
                setIsLoading(false);
            }).catch((error: any) => {
                console.log(error);
                setIsErrorModelOpen(true);

                const errorObj = {
                    ErrorMessage: error.toString(),
                    ErrorStackTrace: "",
                    CustomErrormessage: "Error is occuring while  _createBatch",
                    PageName: "QuayClean.aspx",
                    ErrorMethodName: "_createBatch AssociateChemicalDialog"
                };
                void logGenerator(props.provider, errorObj);
                setIsLoading(false);
            });
        } else {
            props.onClickClose();
            setState(prevState => ({ ...prevState, isModelOpen: false }));
            setIsLoading(false);
        }


    };

    const getAllFileFolder = async () => {
        let camlQuery2 = new CamlBuilder()
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
            .Query()
            .ToString();
        let siteURL = props.context.pageContext.web.absoluteUrl;
        let allFoldersfiles = await props.provider.getItemsByCAMLQuery("DocumentLibrary", camlQuery2, null, siteURL);

        let results: any[] = [];
        const folderPath = "/DocumentLibrary";
        setdisplayback(false);
        if (allFoldersfiles.length > 0) {
            results = allFoldersfiles.filter(item => item.FileDirRef.endsWith(folderPath));
        }
        setPreFolder(folderPath);
        if (results.length == 0) {
            setnotFoundFF(true);
            setfiltercalmData([]);
        } else {
            setnotFoundFF(false);
            if (DocumentsLink.length > 0) {
                setfiltercalmData([]);
                const dataNames = DocumentsLink.map((item: { FileRef: any; }) => item.FileRef);
                const filteredMainData = results.filter(item => !dataNames.includes(item.FileRef));
                setfiltercalmData(filteredMainData);
            } else {
                setfiltercalmData(results);
            }
        }
        if (DocumentsLink.length > 0) {
            setcalmData([]);
            newdata.current = [];
            const dataNames = DocumentsLink.map((item: { FileRef: any; }) => item.FileRef);
            const filteredMainData = allFoldersfiles.filter(item => !dataNames.includes(item.FileRef));
            setcalmData(filteredMainData);
            newdata.current = filteredMainData;
            // newdata.current = allFoldersfiles;
        } else {
            newdata.current = allFoldersfiles;
            setcalmData(allFoldersfiles);
        }
        AllFilesAndFolder.current = allFoldersfiles
        // newdata.current = allFoldersfiles;
    };

    const _getDocumentData = () => {
        try {
            let Data: any[];
            let firstfiles: any[];
            let firstfolder: any[];
            props.provider.FileByServerSiteUrl(props.context.pageContext.web.serverRelativeUrl + "/DocumentLibrary").then((r: any) => {
                firstfiles = r;
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
            props.provider.FolderByServerSiteUrl(props.context.pageContext.web.serverRelativeUrl + "/DocumentLibrary").then((res: any) => {
                firstfolder = res;
                if (firstfiles?.length > 0) {
                    for (let i = 0; i < firstfiles.length; i++) {
                        AllData.push(firstfiles[i]);
                    }
                }
                if (firstfolder?.length > 0) {
                    for (let w = 0; w < firstfolder.length; w++) {
                        AllData.push(firstfolder[w]);
                    }
                }

            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });
        }
        catch (ex) {
            console.log(ex);
            setIsLoading(false);
        }
    };

    const Detaillist = (column: any, item: any[]) => {
        setState(prevState => ({ ...prevState, reload: false }));
        return <>
            {isLoading && <Loader />}
            <div className="ms-SPLegacyFabricBlock">

                {displayback &&
                    <PrimaryButton
                        className="btn btn-primary dlbackbtn z-index-back"
                        text="<<  Back"
                        onClick={_onClickBack}
                    />}

                <div id="DLGriddialog">
                    <MemoizedDetailList
                        columns={column}
                        items={item || []
                        }
                        reRenderComponent={true}
                        searchable={true}
                        isAddNew={true}
                        onSelectedItem={_onItemSelected}
                        CustomselectionMode={SelectionMode.multiple}
                        gridId="DLGriddialog"
                        manageComponentView={
                            function (componentProp: IQuayCleanState) {
                                throw new Error("Function not implemented.");
                            }
                        }
                        addNewContent={<span></span>} />
                </div>

            </div >
        </>;
    };

    React.useEffect(() => {
        setIsLoading(true);
        _getDocumentsLink();
    }, [state.reload]);

    React.useEffect(() => {
        if (isload) {
            setIsLoading(true);
            _getDocumentData();
            getAllFileFolder();
        }
    }, [DocumentsLink]);


    React.useEffect(() => {
        try {
            void (async () => {
                setIsLoading(true);
                let column = getassociateChemicalsColumn();
                let assetitems: any[] = [];
                let assetHistoryItems = await getassociateChemicalsitems();
                if (assetHistoryItems.length > 0) {
                    assetitems = assetHistoryItems.map((item: any) => {
                        return {
                            Id: item.Id,
                            Title: !!item.Title ? item.Title : "",
                            ExpirationDate: !!item.ExpirationDate ? getConvertedDate(item.ExpirationDate) : "",
                            SiteNameId: !!item.SiteNameId ? item.SiteNameId : 0,
                            Expiration: !!item.ExpirationDate ? item.ExpirationDate : ""
                        };
                    });
                }
                let filterdata = assetitems.filter(x => x.Id != props.AlocateChemical.find((y: any) => y == x.Id));
                let detailList: any;
                if (filtercalmData.length > 0 || notFoundFF == true) {

                    detailList = Detaillist(column, filtercalmData);
                } else {
                    // detailList = Detaillist(column, calmData);
                }

                setState(prevState => ({ ...prevState, column: column, detailList: detailList, assetHistoryItems: assetitems }));
                setIsLoading(false);
            })();

        } catch (error) {
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect AssociateChemicalDialog"
            };
            void logGenerator(props.provider, errorObj);

        }

    }, [state.reload, filterToDate, calmData, filtercalmData]);


    const onPanelclose = () => {
        props.onClickClose();
        setState(prevState => ({ ...prevState, isPanelOpen: false }));
    };

    return <>
        {isLoading && <Loader />}
        {isErrorModelOpen && <CustomeDialog closeText="Close" isDialogOpen={isErrorModelOpen} onClickClose={() => { setIsErrorModelOpen(false); }} dialogContentProps={{ type: DialogType.normal, title: 'Something went wrong.', closeButtonAriaLabel: 'Close' }} dialogMessage={<div className="dflex" ><FontAwesomeIcon className="actionBtn btnPDF dticon" icon="circle-exclamation" /> <div className="error">Please try again later.</div></div>} />}
        <Panel
            isOpen={state.isPanelOpen}
            onDismiss={() => onPanelclose()}
            type={PanelType.extraLarge}
        >
            <iframe
                src={state.url}
                style={{ width: "100%", height: "75vh" }}
            />

        </Panel>
        {state.issave ?

            <CustomModal dialogWidth="1100px" isModalOpenProps={state.isModelOpen} setModalpopUpFalse={onClickCloseModel} subject={"Add Document"} message={state.detailList}
                yesButtonText="Save"
                onClickOfYes={_createBatch}
                closeButtonText={"Close"} /> :
            <CustomModal dialogWidth="1100px" isModalOpenProps={state.isModelOpen} setModalpopUpFalse={onClickCloseModel} subject={"Add Document"} message={state.detailList}
                closeButtonText={"Close"} />

        }
    </>;

};

