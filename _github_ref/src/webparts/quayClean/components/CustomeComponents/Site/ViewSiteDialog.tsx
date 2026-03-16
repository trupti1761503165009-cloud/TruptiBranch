/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import CustomModal from "../../CommonComponents/CustomModal";
import { IColumn, Link, Panel, PanelType, SelectionMode, TooltipHost } from "@fluentui/react";
import { IAssetHistory } from "../../../../../Interfaces/IAssetHistory";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { IQuayCleanState } from "../../QuayClean";
import { Loader } from "../../CommonComponents/Loader";
import { formatPrice, formatPriceDecimal, getConvertedDate, isWithinNextMonthRange, logGenerator } from "../../../../../Common/Util";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ListNames, defaultValues } from "../../../../../Common/Enum/ComponentNameEnum";
import { useId } from "@fluentui/react-hooks";
import { PrintQrCode } from "../QRCode/PrintQrCode";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import CamlBuilder from "camljs";
import moment from "moment";
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';
const blankProfile = require('../../../assets/images/UserBlank.svg');
export interface IAssetHistoryProps {
    provider: IDataProvider;
    siteNameId: number;
    isModelOpen: boolean;
    context: WebPartContext;
    DisplaySiteName?: string;
    onClickClose(): any;
    PageName?: string;
    DialogDate?: any;
    manageComponentView?: any;
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
    displaySite: any;
    showModal: boolean;
    isQrModelOpen: boolean;
    qrCodeUrl: string;
    qrDetails: any;
}

export const AssociateChemicalDialog = (props: IAssetHistoryProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [keyUpdate, setKeyUpdate] = React.useState<number>(Math.random());
    const [allFileData, setallFileData] = React.useState<any[]>([]);
    const [allSkillSetData, setallSkillSetData] = React.useState<any[]>([]);

    const tooltipId = useId('tooltip');
    const [fileURL, setFileURL] = React.useState<string>('');
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
        ddfilter: "",
        displaySite: "",
        showModal: false,
        isQrModelOpen: false,
        qrCodeUrl: "",
        qrDetails: "",
    });
    const openModal = () => {
        setState(prevState => ({ ...prevState, showModal: true }));
    };
    const closeModal = () => {
        setState(prevState => ({ ...prevState, showModal: false }));
    };

    const _getDocumentData = () => {
        setIsLoading(true);
        try {
            let filter = "";
            if (!!props.siteNameId) {
                filter = `SiteNameId eq ${props.siteNameId}`;
            }
            const select = ["ID,Title,SiteNameId,LinkFilename,ATUserId,ATUser/ATUserName"];
            const expand = ["ATUser"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                filter: filter,
                top: 5000,
                listName: ListNames.CertificatesLibrary,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any) => {
                if (!!results) {


                    let DocumentsData: any = results.map((data: any) => {
                        let leaveMasterItem: any = {
                            ID: data.ID,
                            Title: !!data.Title ? data.Title : "",
                            ATUserId: !!data.ATUserId ? data.ATUserId : "",
                            EmployeeId: !!data.EmployeeId ? data.EmployeeId : "",
                            LinkFilename: !!data.LinkFilename ? data.LinkFilename : "",
                        };
                        return leaveMasterItem;
                    });
                    props.provider.FolderByServerSiteUrl(props.context.pageContext.web.serverRelativeUrl + "/Team Certificates").then((res: any) => {

                        let filterfolder = res.filter((item: any) => item.Name === DocumentsData[0].LinkFilename);

                        props.provider.FileByServerSiteUrl(props.context.pageContext.web.serverRelativeUrl + "/TeamCertificates").then(async (resitem: any) => {

                            let camlQuery = new CamlBuilder().View()
                                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                                .RowLimit(5000, true)
                                .Query()
                                .ToString();
                            let siteURL = props.context.pageContext.web.absoluteUrl;
                            let allFoldersfiles = await props.provider.getItemsByCAMLQuery(ListNames.CertificatesLibrary, camlQuery, null, siteURL);
                            setallFileData(allFoldersfiles);
                            // let documentFile = allFoldersfiles.filter((res: any) => res.ATUserName != "" && res.FileDirRef === filterfolder[0].ServerRelativeUrl);
                            let documentFile = allFoldersfiles.filter((res: any) => res.ATUser[0]?.lookupId != "");
                            if (allFoldersfiles.length > 0) {

                                let EmployeeData = allFoldersfiles.map((data: any) => {
                                    let leaveMasterItem: any = {
                                        ID: data.ID,
                                        CertificatesName: !!data.LinkFilename ? data.LinkFilename : "",
                                        ServerRelativeUrl: !!data.FileRef ? data.FileRef : "",
                                        LinkingUrl: !!data.EncodedAbsUrl ? data.EncodedAbsUrl : "",
                                        Certificates: !!data.Certificates ? data.Certificates : "",
                                        ATUserName: !!data.ATUserName ? data.ATUserName : "",
                                        ATUserId: !!data.ATUser ? data.ATUser[0]?.lookupId : null,
                                        ATUser: !!data.ATUser ? data.ATUser[0] : null,
                                    };
                                    return leaveMasterItem;
                                });
                                let finaldata;
                                setTimeout(() => {
                                    setIsLoading(false);
                                }, 500);
                                // let qq: any;
                            } else {
                            }
                            setIsLoading(false);


                        }).catch((error) => {
                            console.log(error);
                            setIsLoading(false);
                        });
                        onClickLoad();
                    }).catch((error) => {
                        console.log(error);
                        setIsLoading(false);
                    });

                    // setEmployeeProgressDataList(EmployeeData);
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

    const getassociateChemicalsColumn = (): IColumn[] => {
        let oneMonthDate = moment(new Date()).add(29, 'day').format(defaultValues.FilterDateFormate) + "T23:59:59Z";
        let threeMonthDate = moment(new Date()).add(60, 'day').format(defaultValues.FilterDateFormate) + "T23:59:59Z";

        if (props.DisplaySiteName != "") {
            setState(prevState => ({ ...prevState, displaySite: props.DisplaySiteName }));
        }
        if (props.PageName == "DocumentsPage") {
            let columns: IColumn[] = [
                { key: 'Title', name: 'Title', fieldName: 'Title', minWidth: 140, maxWidth: 270 },
                // { key: 'SiteNameId', name: 'Site Name', fieldName: 'SiteNameId', minWidth: 140, maxWidth: 270 }
            ];
            return columns;
        }
        else if (props.PageName == "TeamsPage") {
            let columns: any[] = [
                {
                    key: "key3", name: 'Profile Picture', fieldName: 'Profile Picture', isResizable: true, minWidth: 80, maxWidth: 120, isSortingRequired: true,
                    onRender: (item: any) => {
                        // <img src={!!item.userImageAttachment ? item.userImageAttachment : require('../../../assets/images/imgalt.svg')} alt="Photo" className="course-img-first" style={{ height: "72px", width: '72px', borderRadius: "50%", objectFit: "cover" }} />
                        const imgURL = item.userImageAttachment || blankProfile;
                        return (
                            <LazyLoadImage
                                src={imgURL}
                                width={72}
                                height={72}
                                alt="Photo"
                                className="course-img-first"
                                placeholderSrc={blankProfile} // Fallback while loading
                                effect="blur" // Optional loading effect
                            />
                        )
                    },
                },
                { key: 'UserName', name: 'Employee Name', fieldName: 'UserName', minWidth: 170, maxWidth: 240, isSortingRequired: true },
                { key: 'Role', name: 'Role', fieldName: 'Role', minWidth: 140, maxWidth: 150, isSortingRequired: true },
                {
                    key: "key3", name: 'Skill Set', fieldName: 'Id', isResizable: true, minWidth: 180, maxWidth: 300, isSortingRequired: true,
                    onRender: ((itemID: any) => {
                        let adata: any[] = [];
                        if (allSkillSetData.length > 0) {
                            adata = allSkillSetData.filter(r => r.AssociatedTeamId == itemID.ID);
                        }
                        return (
                            <div>
                                <ul>
                                    {adata.map((item: any) => (
                                        // Create a list item for each name in data array
                                        <li className="ss-mb5 skillsetBadge">
                                            {item.Title}<br></br>
                                            <span className="EDLBL">Expiry Date: {item.ExpiryDate}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })
                },
                {
                    key: "key4", name: 'Certificates', fieldName: 'Id', isResizable: true, minWidth: 220, maxWidth: 300, isSortingRequired: true,
                    onRender: ((itemID: any) => {
                        let adata: any[] = [];
                        if (allFileData.length > 0) {
                            adata = allFileData.filter(r => r.ATUser[0]?.lookupId == itemID.ID);

                        }

                        return (
                            <div>
                                <ul>

                                    {adata.map((item: any) => (
                                        <li>
                                            <Link className="" onClick={() => {
                                                setFileURL(item.EncodedAbsUrl); openModal();
                                            }}>
                                                <TooltipHost content={"View Document"} id={tooltipId}>
                                                    <li key={item.id} className="ulli">
                                                        <FontAwesomeIcon icon={"circle"} style={{ marginRight: '5px' }} />     {item.Certificates}
                                                    </li>
                                                </TooltipHost>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );

                    })
                },
                // { key: 'SiteNameId', name: 'Site Name', fieldName: 'SiteNameId', minWidth: 140, maxWidth: 270 }
            ];
            return columns;
        }
        else if (props.PageName == "ChemicalsPage") {
            let columns: IColumn[] = [
                {
                    key: "key0", name: 'Product Photo', fieldName: 'Title', isResizable: true, minWidth: 100, maxWidth: 150, className: 'courseimg-column',
                    onRender: (item: any) => (
                        !!item.ProductPhoto ?
                            <img src={!!item.ProductPhotoThumbnailUrl ? item.ProductPhotoThumbnailUrl : require('../../../assets/images/imgalt.svg')} alt="Product Photo" style={{ maxWidth: '70%', maxHeight: '70%' }} /> :
                            <FontAwesomeIcon style={{ width: '70%', height: '70%' }}
                                icon={"image"}
                                height={100}
                            />
                    ),
                },
                { key: "key1", name: 'Chemical Name', fieldName: 'Title', isResizable: true, minWidth: 170, maxWidth: 240 },
                { key: "key2", name: 'Manufacturer', fieldName: 'Manufacturer', isResizable: true, minWidth: 100, maxWidth: 150 },
                { key: "key3", name: 'SDS Date', fieldName: 'SDSDate', isResizable: true, minWidth: 120, maxWidth: 140 },
                {
                    key: 'Expiration Date', name: 'Expiration Date', fieldName: 'ExpirationDate', minWidth: 100, maxWidth: 120, isResizable: false, headerClassName: 'courseimg-header',
                    onRender: (item: any) => {
                        if (item.FullExpirationDate < oneMonthDate) {
                            return (
                                <div className="redBadge mw-110 badge truncate">{item.ExpirationDate}</div>
                            );
                        } else if (item.FullExpirationDate > oneMonthDate && item.FullExpirationDate < threeMonthDate) {
                            return (
                                <div className="yellowBadge mw-110 badge truncate">{item.ExpirationDate}</div>
                            );
                        } else if (item.FullExpirationDate > threeMonthDate) {
                            return (
                                <div className="greenBadge mw-110 badge truncate">{item.ExpirationDate}</div>
                            );
                        }
                    }
                },
                {
                    key: "key5", name: 'Hazardous', fieldName: 'Hazardous', isResizable: true, minWidth: 70, maxWidth: 150,
                    onRender: (item: any) => {
                        let badgeClass = '';
                        if (item.Hazardous === "YES") {
                            badgeClass = 'redBadge mw-50 badge';
                        }
                        else {
                            badgeClass = 'greenBadge mw-50 badge truncate';
                        }
                        return (
                            <>
                                <div className={badgeClass}>
                                    {item.Hazardous}
                                </div>
                            </>
                        );
                    },
                },
                {
                    key: "key6", name: 'Has Class', fieldName: 'HazClass', isResizable: true, minWidth: 110,
                    onRender: (item: any) => {
                        const divItems = Array.isArray(item.HazClass) && item.HazClass.map((option: any, index: number) => (
                            <div key={index} className='greenBadge badge truncate'>
                                {option}
                            </div>
                        ));
                        return (<>{divItems}</>);
                    },
                },
                {
                    key: "key7", name: 'Storage Req.', fieldName: 'StorageRequest', isResizable: true, minWidth: 200, maxWidth: 200,
                    onRender: (item: any) => {
                        if (item.StorageRequest != null) {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.StorageRequest} id={tooltipId}>
                                            {item.StorageRequest.length > 75 ? `${item.StorageRequest.slice(0, 75)}...` : item.StorageRequest}
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        } else {
                            <Link className="tooltipcls">
                                <TooltipHost content={"Storage Request Not Available"} id={tooltipId}>
                                    {item.StorageRequest}
                                </TooltipHost>
                            </Link>;
                        }
                    },
                },
                { key: "key8", name: 'pH', fieldName: 'pH', isResizable: true, minWidth: 30, maxWidth: 100 },
                {
                    key: "key9", name: 'SDS', fieldName: 'SDS', isResizable: true, minWidth: 100, maxWidth: 150, onRender: (item: any) => {
                        return (
                            <>
                                <Link className="actionBtn dticon" onClick={() => {
                                    setFileURL(item.SDS); openModal();
                                }}>
                                    <TooltipHost content={"View Document"} id={tooltipId}>
                                        <FontAwesomeIcon icon="link" />
                                    </TooltipHost>
                                </Link>
                            </>
                        );
                    },
                },
                {
                    key: "key10", name: 'PPE Required', fieldName: 'PPERequired', isResizable: true, minWidth: 100, maxWidth: 150,
                    onRender: (item: any) => {
                        const divItems = Array.isArray(item.PPERequired) && item.PPERequired.map((option: any, index: number) => (
                            <div key={index} className='blueBadge badge truncate'>
                                {option}
                            </div>
                        ));
                        return (<>{divItems}</>);
                    },
                }

            ];
            return columns;
        } else {
            let columns: IColumn[] = [
                {
                    key: 'Photo', name: 'Photo', fieldName: 'AssetImage', minWidth: 110, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                    onRender: (item: any) => {
                        return (
                            <img src={item.AssetPhotoThumbnailUrl} height="75px" width="75px" className="course-img-first" />
                        );
                    }
                },
                // { key: "key1", name: 'Name', fieldName: 'Title', isResizable: true, minWidth: 70, maxWidth: 150 },
                {
                    key: "key1", name: 'Name', fieldName: 'Title', isResizable: true, minWidth: 100, maxWidth: 150,
                    onRender: (item: any) => {
                        if (item.Title != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.Title} id={tooltipId}>
                                            {item.Title}
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
                { key: "key2", name: 'Manufacturer', fieldName: 'Manufacturer', isResizable: true, minWidth: 100, maxWidth: 150 },
                { key: "key3", name: 'Model', fieldName: 'Model', isResizable: true, minWidth: 70, maxWidth: 150 },
                { key: "key4", name: 'Asset Type', fieldName: 'AssetType', isResizable: true, minWidth: 70, maxWidth: 150 },
                { key: "key5", name: 'Color', fieldName: 'QCColor', isResizable: true, minWidth: 100, maxWidth: 150 },
                { key: "key6", name: 'Status', fieldName: 'Status', isResizable: true, minWidth: 70, maxWidth: 150 },
                { key: "AssetCategory", name: 'Asset Location', fieldName: 'AssetCategory', isResizable: true, minWidth: 70, maxWidth: 150 },
                // { key: "key7", name: 'Price', fieldName: 'PurchasePrice', isResizable: true, minWidth: 70, maxWidth: 100 },
                {
                    key: "key7", name: 'Book value', fieldName: 'PurchasePrice', isResizable: true, minWidth: 70, maxWidth: 100,
                    onRender: ((itemID: any) => {
                        return <>
                            <div className="">{formatPriceDecimal(itemID.PurchasePrice)}</div>
                        </>;
                    })
                }, {
                    key: 'key8', name: 'Service Due Date', fieldName: 'ServiceDueDate', minWidth: 120, maxWidth: 160,
                    onRender: ((itemID: any) => {
                        let isDueDate: boolean = false;
                        if (!!itemID.DueDate) {
                            isDueDate = isWithinNextMonthRange(itemID.fullServiceDueDate);
                        }
                        return <>
                            <div className='dflex'>
                                {(isDueDate) &&
                                    <div className="redBadgeact badge-mar-o">{itemID.ServiceDueDate}</div>

                                }
                            </div ></>;
                    })
                },
                {
                    key: "key9", name: 'Serial Number', fieldName: 'SerialNumber', isResizable: true, minWidth: 100, maxWidth: 100,
                    onRender: (item: any) => {
                        if (item.SerialNumber != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.SerialNumber} id={tooltipId}>
                                            {item.SerialNumber}
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
                {
                    key: 'Attachment', name: 'Documents', fieldName: 'Attachment', minWidth: 40, maxWidth: 65, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                    onRender: (item: any) => {
                        if (item.Attachment != null) {
                            return (
                                <Link className="actionBtn btnPDF dticon" target="_blank" rel="noopenernoreferrer" onClick={() => { window.open(item.Attachment, '_blank'); }}>
                                    <TooltipHost
                                        content={"View Document"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon icon="file-pdf" />
                                    </TooltipHost>

                                </Link >
                            );
                        } else {
                            return (
                                <Link className="actionBtn btnDisable dticon">
                                    <TooltipHost
                                        content={"Document Not Available"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon icon="file-pdf" />
                                    </TooltipHost>

                                </Link >
                            );
                        }
                    }
                },
                // {
                //     key: 'Photo', name: 'QR Code', fieldName: 'QRCode', minWidth: 110, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                //     onRender: (item: any) => {
                //         return (

                //             <TooltipHost
                //                 content={"View QR Code"}
                //                 id={tooltipId}
                //             >
                //                 <div onClick={() => {
                //                     setKeyUpdate(Math.random());
                //                     setState(prevState => ({ ...prevState, isQrModelOpen: true, qrDetails: item, qrCodeUrl: item.QRCode, }))
                //                 }}>
                //                     <img src={item.QRCode} height="75px" width="75px" className="course-img-first" />

                //                 </div>
                //             </TooltipHost >
                //         );
                //     }
                // },
            ];
            return columns;
        }
    };
    const _onItemSelected = (item: any): void => {
    };

    const onClickCloseModel = () => {
        props.onClickClose();
        setState(prevState => ({ ...prevState, isModelOpen: false }));
    };

    const Detaillist = (column: any, item: any[]) => {
        setIsLoading(false);
        setState(prevState => ({ ...prevState, reload: false }));
        return <>

            {isLoading && <Loader />}
            <MemoizedDetailList
                columns={column}
                items={item || []}
                reRenderComponent={true}
                searchable={true}
                isAddNew={true}
                onSelectedItem={_onItemSelected}
                CustomselectionMode={SelectionMode.none}
                manageComponentView={function (componentProp: IQuayCleanState) {
                    throw new Error("Function not implemented.");
                }} />
        </>;
    };

    const onClickLoad = () => {
        try {
            void (async () => {
                let column = getassociateChemicalsColumn();
                let detailList = Detaillist(column, props.DialogDate);
                setState(prevState => ({ ...prevState, column: column, detailList: detailList }));
            })();
        } catch (error) {
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect ViewSiteDialog"
            };
            void logGenerator(props.provider, errorObj);
        }
    };

    const _getSkillSetData = () => {
        try {
            let filter = "";
            if (!!props.siteNameId) {
                filter = `SiteNameId eq ${props.siteNameId}`;
            }
            const select = ["ID,Title,SiteNameId,ExpiryDate,AssociatedTeamId"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                // filter: filter,
                top: 5000,
                listName: ListNames.SkillSet,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any) => {
                if (!!results) {
                    let SkillSetData: any = results.map((data: any) => {
                        let skillsetItem: any = {
                            ID: data.ID,
                            Title: !!data.Title ? data.Title : "",
                            SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                            AssociatedTeamId: !!data.AssociatedTeamId ? data.AssociatedTeamId : "",
                            ExpiryDate: !!data.ExpiryDate ? getConvertedDate(data.ExpiryDate) : "",
                        };
                        return skillsetItem;
                    });
                    setallSkillSetData(SkillSetData);
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

    React.useEffect(() => {
        _getDocumentData();
        _getSkillSetData();
    }, []);

    React.useEffect(() => {
        onClickLoad();
    }, [state.reload, allFileData]);

    const onPanelclose = () => {
        props.onClickClose();
        if (false) console.log(setKeyUpdate);

        setState(prevState => ({ ...prevState, isPanelOpen: false }));
    };

    return <>
        {state.isQrModelOpen &&
            // <QrCodeModel hideModel={() => {
            //     setState(prevState => ({ ...prevState, isQrModelOpen: false }));
            // }}
            //     isModelOpen={state.isQrModelOpen} qrDetails={state.qrDetails} qrCodeUrl={state.qrCodeUrl} />
            <PrintQrCode isDetailView={true} key={keyUpdate} manageComponentView={props.manageComponentView} items={[state.qrDetails]} onClickClose={() => setState(prevState => ({ ...prevState, isQrModelOpen: false }))} isAssetQR={true} isChemicalQR={false} />


        }
        <Panel
            isOpen={state.showModal}
            onDismiss={() => closeModal()}
            type={PanelType.extraLarge}
            headerText="Document View"
        >
            <iframe src={fileURL} style={{ width: "100%", height: "90vh" }} />
        </Panel>
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
        <CustomModal dialogWidth="1280px" isModalOpenProps={state.isModelOpen} setModalpopUpFalse={onClickCloseModel} subject={state.displaySite} message={state.detailList}
        />
    </>;

};