/* eslint-disable @microsoft/spfx/import-requires-chunk-name */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as React from "react";
import { IQuayCleanState } from "../../QuayClean";
import { Loader } from "../../CommonComponents/Loader";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { _onItemSelected, isWithinNextMonthRange, logGenerator, onBreadcrumbItemClicked, showPremissionDeniedPage, getCAMLQueryFilterExpression, getErrorMessageValue, UserActivityLog } from "../../../../../Common/Util";
import { Breadcrumb, Link, PrimaryButton, TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useId } from "@fluentui/react-hooks";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';
import { AssetNameFilter } from "../../../../../Common/Filter/AssetName";
import { AssetFields } from "./AssetFields";
import CamlBuilder from "camljs";
import { FieldType, LogicalType } from "../../../../../Common/Constants/DocumentConstants";
import { getAttachmentDataUrl, getParsedImageUrl } from "../../CommonComponents/CommonMethods";
import { MasterManufacturerFilter } from "../../../../../Common/Filter/MasterManufacturerFilter";
import { MasterAssetNameFilter } from "../../../../../Common/Filter/MasterAssetName";
import { MasterAssetCardView } from "../Asset/MasterAssetCardView";
import moment from "moment";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { AssetTypeFilter } from "../../../../../Common/Filter/AssetTypeFilter";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');
const ManufacturerFilter = React.lazy(() =>
    import("../../../../../Common/Filter/ManufacturerFilter").then(module => ({ default: module.ManufacturerFilter }))
);
export interface IAssetListProps {
    manageComponentView(componentProp: IQuayCleanState): any;
    breadCrumItems: IBreadCrum[];
    view?: any;
}

export const GlobalAssetsList = (props: IAssetListProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail } = appGlobalState;

    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [selectedManufacturer, setSelectedManufacturer] = React.useState<any>([]);
    const [AssetListData, setAssetListData] = React.useState<any>([]);
    const [columnsAssets, setcolumnsAssets] = React.useState<any>([]);

    const tooltipId = useId('tooltip');
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : 'grid');
    const [selectedAssetNames, setSelectedAssetNames] = React.useState<any[]>([]);
    const [selectedAssetType, setSelectedAssetType] = React.useState<any>();

    const onAssetNameChange = (selectedAssets: any[]): void => {
        const selectedValues = selectedAssets.map(asset => asset.text?.toString().trim());
        setSelectedAssetNames(selectedValues);
    };

    const onManufacturerChange = (manufacturer: any[]): void => {
        const selectedValues = manufacturer.map(manufacturer => manufacturer?.toString().trim());
        setSelectedManufacturer(selectedValues);
    };

    const onAssetTypeChange = (assetType: any): void => {
        setSelectedAssetType(assetType);
    };

    const _onclickDetailsView = (item: any) => {
        try {
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({
                text: item.Title, key: item.Title,
                manageCompomentItem: { currentComponentName: ComponentNameEnum.ViewMasterAssetDetails, view: currentView, breadCrumItems: breadCrumItems },
                currentCompomnetName: "ViewMasterAssetDetails",
                onClick: onBreadcrumbItemClicked,
                manageComponent: props.manageComponentView
            });
            props.manageComponentView({ currentComponentName: ComponentNameEnum.ViewMasterAssetDetails, view: currentView, masterAssetId: item.ID, breadCrumItems: breadCrumItems });
        } catch (error) {
            const errorObj = { ErrorMethodName: "_onclickDetailsView", CustomErrormessage: "error in on click details view", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }
    };

    const onclickEdit = (data: any) => {
        let breadCrumItems: any[] = props.breadCrumItems;
        breadCrumItems.push({ text: data.Title, key: data.Title, currentCompomnetName: ComponentNameEnum.AddGlobalAsset, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView });
        props.manageComponentView({ currentComponentName: ComponentNameEnum.AddGlobalAsset, masterAssetId: data.Id, breadCrumItems: breadCrumItems });
    };

    const onclickAdd = () => {
        let breadCrumItems: any[] = props.breadCrumItems;
        breadCrumItems.push({ text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddGlobalAsset, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView });
        props.manageComponentView({ currentComponentName: ComponentNameEnum.AddGlobalAsset, breadCrumItems: breadCrumItems });
    };

    const getColumns = () => {
        setcolumnsAssets([
            {
                key: "key10", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 100, maxWidth: 120,
                onRender: ((itemID: any) => {
                    let isDueDate: boolean = false;
                    if (!!itemID.DueDate) {
                        isDueDate = isWithinNextMonthRange(itemID.fullServiceDueDate);

                    }
                    return <>
                        <div className='dflex'>
                            <div>
                                <Link className="actionBtn dticon btnEdit " onClick={() => { onclickEdit(itemID) }}>
                                    <TooltipHost content={"Edit Detail"} id={tooltipId}>
                                        <FontAwesomeIcon icon="edit" />
                                    </TooltipHost>
                                </Link>
                            </div>
                            <div>

                                <Link className="actionBtn btnView dticon" onClick={() => {
                                }}>
                                    <TooltipHost
                                        content={"Details"}
                                        id={tooltipId}
                                    >
                                        <div onClick={() => _onclickDetailsView(itemID)}>
                                            <FontAwesomeIcon icon="eye" /></div>
                                    </TooltipHost>
                                </Link></div >
                        </div ></>;
                })
            },
            {
                key: 'Photo', name: 'Photo', fieldName: 'AssetPhotoThumbnailUrl', minWidth: 110, maxWidth: 120, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => {
                    return (
                        // <img src={item.AssetPhotoThumbnailUrl} height="75px" width="75px" className="course-img-first" />
                        <LazyLoadImage src={item.AssetPhotoThumbnailUrl}
                            width={75} height={75}
                            placeholderSrc={notFoundImage}
                            alt="photo"
                            className="course-img-first"
                            effect="blur"
                        />
                    );
                }
            },
            {
                key: "key1", name: 'Name', fieldName: 'Title', isResizable: true, minWidth: 100, maxWidth: 170, isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.Title != "") {
                        return (
                            <>
                                <Link className="tooltipcls">
                                    <TooltipHost content={item.Title} id={tooltipId}>
                                        <div onClick={() => _onclickDetailsView(item)}>{item.Title}</div>
                                    </TooltipHost>
                                </Link>
                            </>
                        );
                    }
                },
            },
            { key: "key2", name: 'Manufacturer', fieldName: 'Manufacturer', isResizable: true, minWidth: 100, maxWidth: 160, isSortingRequired: true },
            { key: "key3", name: 'Model', fieldName: 'Model', isResizable: true, minWidth: 100, maxWidth: 160, isSortingRequired: true },
            { key: "key4", name: 'Asset Type', fieldName: 'AssetType', isResizable: true, minWidth: 70, maxWidth: 160, isSortingRequired: true },
            { key: "key5", name: 'Color', fieldName: 'QCColor', isResizable: true, minWidth: 60, maxWidth: 120, isSortingRequired: true },
            {
                key: 'Attachment', name: 'Audit Reports', fieldName: 'Attachment', minWidth: 100, maxWidth: 150, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => {
                    if (item.Attachment != null) {
                        return (
                            <><Link className="actionBtn btnPDF dticon" target="_blank" rel="noopenernoreferrer" onClick={() => { window.open(item.Attachment, '_blank'); }}>
                                <TooltipHost
                                    content={"View Audit Reports"}
                                    id={tooltipId}
                                >
                                    <FontAwesomeIcon icon="file-pdf" />
                                </TooltipHost>

                            </Link></>
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
            }

        ]);
    }

    // const mappingData = (listItems: any[]): any[] => {
    //     if (!Array.isArray(listItems) || listItems.length === 0) return [];

    //     try {
    //         return listItems.map((data: any) => {
    //             const fixImgURL = `${context.pageContext.web.serverRelativeUrl}/Lists/GlobalAssets/Attachments/${parseInt(data.ID)}/`;
    //             const attachmentFiledata = getAttachmentDataUrl(data.AttachmentFiles, fixImgURL, notFoundImage);
    //             const AssetPhotoURL = data.AssetPhoto ? getParsedImageUrl(data.AssetPhoto, fixImgURL, notFoundImage) : notFoundImage;
    //             return {
    //                 Id: parseInt(data.ID),
    //                 ID: parseInt(data.ID),
    //                 Title: data.Title || "",
    //                 AssetType: data.AssetType || "",
    //                 Manufacturer: data.Manufacturer || "",
    //                 Model: data.Model || "",
    //                 QCColor: data.QCColor || "",
    //                 AssetImage: AssetPhotoURL,
    //                 Attachment: attachmentFiledata,
    //                 AssetLink: data.AssetLink || "",
    //                 AssetPhotoThumbnailUrl: data.AssetPhotoThumbnailUrl || notFoundImage,
    //             }
    //         })
    //     } catch (error) {
    //         console.error("Error in mapping data:", error);
    //         setIsLoading(false);
    //         return [];
    //     }
    // };

    const mappingData = (listItems: any[]): any[] => {
        if (!Array.isArray(listItems) || listItems.length === 0) return [];

        try {
            return listItems.map((data: any) => {

                const fixImgURL = `${context.pageContext.web.serverRelativeUrl}/Lists/GlobalAssets/Attachments/${data.ID}/`;
                let AssetPhotoURL: string;
                let attachmentFiledata: string | null;

                if (data.AttachmentFiles?.length > 0) {
                    const AttachmentData = data.AttachmentFiles[0];
                    attachmentFiledata = AttachmentData?.ServerRelativeUrl || (AttachmentData?.FileName ? fixImgURL + AttachmentData.FileName : notFoundImage);
                } else {
                    attachmentFiledata = null;
                }

                if (data.AssetPhoto) {
                    try {
                        const AssetPhotoData = JSON.parse(data.AssetPhoto);
                        AssetPhotoURL = AssetPhotoData?.serverRelativeUrl || (AssetPhotoData?.fileName ? fixImgURL + AssetPhotoData.fileName : notFoundImage);
                    } catch (error) {
                        console.error("Error parsing AssetPhoto JSON:", error);
                        AssetPhotoURL = notFoundImage;
                    }
                } else {
                    AssetPhotoURL = notFoundImage;
                }

                return {
                    Id: data.ID,
                    ID: data.ID,
                    Title: data.Title || "",
                    AssetType: data.AssetType || "",
                    Manufacturer: data.Manufacturer || "",
                    Model: data.Model || "",
                    QCColor: data.QCColor || "",
                    AssetImage: AssetPhotoURL,
                    Attachment: attachmentFiledata,
                    AssetLink: data.AssetLink || "",
                    WebsiteLink: data.WebsiteLink || "",
                    AssetPhotoThumbnailUrl: data.AssetPhotoThumbnailUrl || notFoundImage,
                    Modified: data.Modified || null,
                }
            })
        } catch (error) {
            console.error("Error in mapping data:", error);
            setIsLoading(false);
            return [];
        }
    };

    // const getAssetMasterData = async () => {
    //     try {
    //         let filterFields: any[] = [];
    //         if (selectedAssetNames?.length > 0) {
    //             filterFields.push({
    //                 fieldName: AssetFields.Title,
    //                 fieldValue: selectedAssetNames,
    //                 fieldType: FieldType.Text,
    //                 LogicalType: LogicalType.In
    //             })
    //         }
    //         if (selectedManufacturer?.length > 0) {
    //             filterFields.push({
    //                 fieldName: AssetFields.Manufacturer,
    //                 fieldValue: selectedManufacturer,
    //                 fieldType: FieldType.Text,
    //                 LogicalType: LogicalType.In
    //             })
    //         }
    //         const camlQuery = new CamlBuilder()
    //             .View([
    //                 AssetFields.Title,
    //                 AssetFields.Id,
    //                 AssetFields.Manufacturer,
    //                 AssetFields.Model,
    //                 AssetFields.AssetType,
    //                 AssetFields.QCColor,
    //                 AssetFields.AssetLink,
    //                 AssetFields.WebsiteLink,
    //                 AssetFields.Attachments,
    //                 AssetFields.AttachmentFiles,
    //                 AssetFields.AssetPhotoThumbnailUrl,
    //                 AssetFields.Attachments,
    //             ])
    //             .Scope(CamlBuilder.ViewScope.RecursiveAll)
    //             .RowLimit(5000, true)
    //             .Query()

    //         const categoriesExpressions: any[] = getCAMLQueryFilterExpression(filterFields);

    //         if (filterFields?.length > 0) {
    //             camlQuery.Where().All(categoriesExpressions);
    //         }
    //         camlQuery.OrderByDesc("Modified")
    //         const localResponse = await provider.getItemsByCAMLQuery(ListNames.GlobalAssets, camlQuery.ToString(), null, "");

    //         const mappedData = mappingData(localResponse);
    //         setAssetListData(mappedData);
    //         setIsLoading(false);
    //         // return mappedData;
    //     } catch (ex) {
    //         console.log(ex);
    //         const errorObj = {
    //             ErrorMessage: ex.toString(),
    //             ErrorStackTrace: "",
    //             CustomErrormessage: "Error is occuring while AssetsMaster",
    //             PageName: "QuayClean.aspx",
    //             ErrorMethodName: "getAssetMasterData MasterAssetList"
    //         };
    //         void logGenerator(provider, errorObj);
    //         setIsLoading(false);
    //         const errorMessage = getErrorMessageValue(error.message);
    //         setError(errorMessage);
    //         sethasError(true);
    //         return [];
    //     }
    // };

    const _AssetMaster = async () => {
        setIsLoading(true);
        let filter = "";

        const filterArray: string[] = [];
        // filterArray.push("IsDeleted ne true")

        if (selectedAssetNames?.length > 0) {
            const assetFilter = selectedAssetNames.map(name => `Title eq '${name}'`).join(" or ");
            filterArray.push(`(${assetFilter})`);
        }

        if (selectedManufacturer?.length > 0) {
            const manufacturerFilter = selectedManufacturer.map((name: any) => `Manufacturer eq '${name}'`).join(" or ");
            filterArray.push(`(${manufacturerFilter})`);
        }
        if (selectedAssetType) {
            if (selectedAssetType != "All") {
                const assetTypeFilter = `AssetType eq '${selectedAssetType}'`;
                filterArray.push(`(${assetTypeFilter})`);
            }
        }

        if (filterArray.length > 0) {
            filter = filterArray.join(" and ");
            filter = `(${filter}) and IsDeleted ne 1`
        } else {
            filter = `IsDeleted ne 1`
        }
        try {
            const select = [
                "ID", "Attachments", "AttachmentFiles", "AssetPhotoThumbnailUrl", "Title",
                "AssetType", "Manufacturer", "Model", "QCColor", "AssetLink",
                "WebsiteLink", "AssetPhoto", "Created", "Modified"
            ];
            const expand = ["AttachmentFiles"];

            const queryStringOptions: IPnPQueryOptions = {
                select,
                listName: ListNames.GlobalAssets,
                filter,
                expand
            };

            const results: any[] = await provider.getItemsByQuery(queryStringOptions);
            const mappedData = mappingData(results);
            const sortedData = mappedData.sort((a, b) => moment(b.Modified).diff(moment(a.Modified)));
            setAssetListData(sortedData);
            setIsLoading(false);

        } catch (error: any) {
            console.error(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error occurred in _AssetMaster",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_AssetMaster"
            };
            void logGenerator(provider, errorObj);
            const errorMessage = getErrorMessageValue(error.message);
            setError(errorMessage);
            sethasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const _userActivityLog = async () => {

        setIsLoading(true);
        try {
            const todayDate = moment().format("YYYY-MM-DD");
            const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.UserActivityLog,
                filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityType eq '${UserActionEntityTypeEnum.MasterAssets}' and ActionType eq '${UserActivityActionTypeEnum.Visit}' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
            };
            const results = await provider.getItemsByQuery(queryStringOptions);
            if (results && results.length > 0) {
                const listData = results.map((data) => ({
                    ID: data.ID,
                    Count: data.Count ?? '',
                }));
                let updateObj = {
                    Count: listData[0]?.Count + 1,
                };
                await provider.updateItemWithPnP(updateObj, ListNames.UserActivityLog, Number(listData[0]?.ID));
            } else {
                const logObj = {
                    UserName: currentUserRoleDetail?.title,
                    ActionType: UserActivityActionTypeEnum.Visit,
                    EntityType: UserActionEntityTypeEnum.MasterAssets,
                    EntityName: 'View Master Assets',
                    Details: 'View Master Assets',
                    Count: 1,
                    Email: currentUserRoleDetail?.emailId,
                };
                void UserActivityLog(provider, logObj, currentUserRoleDetail);
            }
        } catch (error) {
            console.error("Error fetching user activity log:", error);
        } finally {
            setIsLoading(false);
        }

    };

    const _onItemInvoked = (itemID: any): void => {
        _onclickDetailsView(itemID);
    };

    React.useEffect(() => {
        let permssiion = showPremissionDeniedPage(currentUserRoleDetail);
        if (permssiion.length == 0) {
            props.manageComponentView({ currentComponentName: ComponentNameEnum.AccessDenied });
        }
        (async () => {
            _AssetMaster();
            _userActivityLog();
        })();

    }, [isRefreshGrid, selectedManufacturer, selectedAssetNames, selectedAssetType]);

    React.useEffect(() => {
        getColumns();
    }, []);

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setCurrentView('card');
        } else {
            setCurrentView('grid');
        }
    }, []);

    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };

    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>

            {isLoading && <Loader />}
            <div className="boxCard">
                <div className="formGroup">
                    <div className="ms-Grid mb-3">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <h1 className="mainTitle">Assets Master</h1>
                            </div>
                            {/* <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <div className="customebreadcrumb">
                                    <Breadcrumb
                                        items={props.breadCrumItems as any[]}
                                        maxDisplayedItems={3}
                                        ariaLabel="Breadcrumb with items rendered as buttons"
                                        overflowAriaLabel="More links"
                                    />
                                </div>
                            </div> */}

                            <div className="filtermrg mt-2">
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                    <div className="formControl">
                                        <React.Suspense fallback={<></>}>
                                            <MasterAssetNameFilter
                                                loginUserRoleDetails={currentUserRoleDetail}
                                                selectedAssetName={selectedAssetNames}
                                                onAssetNameChange={onAssetNameChange}
                                                provider={provider}
                                                isRequired={true}
                                                AllOption={true}
                                            />
                                        </React.Suspense>
                                    </div>
                                </div>
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                    <div className="formControl">
                                        <React.Suspense fallback={<></>}>
                                            <MasterManufacturerFilter
                                                loginUserRoleDetails={currentUserRoleDetail}
                                                defaultOption={selectedManufacturer}
                                                onManufacturerChange={onManufacturerChange}
                                                provider={provider}
                                                isRequired={true}
                                                AllOption={false}
                                                listName={ListNames.GlobalAssets}
                                                isMultiple={true}
                                            />
                                        </React.Suspense>
                                    </div>
                                </div>
                                <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                    <div className="formControl">
                                        <React.Suspense fallback={<></>}>
                                            <AssetTypeFilter
                                                selectedAssetType={selectedAssetType}
                                                defaultOption={!!selectedAssetType ? selectedAssetType : ""}
                                                onAssetTypeChange={onAssetTypeChange}
                                                provider={provider}
                                                isRequired={true}
                                                AllOption={true}
                                                listName={ListNames.GlobalAssets}
                                            />
                                        </React.Suspense>
                                    </div>
                                </div>
                            </div>

                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                {currentView === "grid" ? <>
                                    <MemoizedDetailList
                                        manageComponentView={props.manageComponentView}
                                        columns={columnsAssets}
                                        items={AssetListData || []}
                                        reRenderComponent={true}
                                        searchable={true}
                                        isAddNew={true}
                                        addNewContent={
                                            <div className={window.innerWidth > 768 ? "dflex mar-bot-10 mobile-icon-space" : "dflex mar-bot-10 mobile-icon-space"}>

                                                <Link className="actionBtn iconSize btnRefresh icon-mr" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                                    text="">
                                                    <TooltipHost
                                                        content={"Refresh Grid"}
                                                        id={tooltipId}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={"arrows-rotate"}
                                                        />
                                                    </TooltipHost>    </Link>
                                                <TooltipHost
                                                    content={"Add New Asset"}
                                                    id={tooltipId}
                                                >
                                                    <PrimaryButton className="btn btn-primary" onClick={onclickAdd} text="Add" />
                                                </TooltipHost>
                                            </div>

                                        }
                                        onItemInvoked={_onItemInvoked}
                                        onSelectedItem={_onItemSelected}
                                    />
                                </> :
                                    <>
                                        <div className="dflex">
                                            <Link className="actionBtn iconSize btnRefresh icon-mr" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                                text="">
                                                <TooltipHost
                                                    content={"Refresh Grid"}
                                                    id={tooltipId}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={"arrows-rotate"}
                                                    />
                                                </TooltipHost>    </Link>
                                            <TooltipHost
                                                content={"Add New Asset"}
                                                id={tooltipId}
                                            >
                                                <PrimaryButton className="btn btn-primary" onClick={onclickAdd} text="Add" />
                                            </TooltipHost>
                                        </div>
                                        <MasterAssetCardView
                                            _onclickDetailsView={_onclickDetailsView}
                                            items={AssetListData}
                                            manageComponentView={props.manageComponentView}
                                            isEditDelete={true}
                                            _onclickEdit={function (itemID: any): void {
                                                onclickEdit(itemID);
                                            }} _onclickconfirmdelete={function (itemID: any): void {
                                                throw new Error("Function not implemented.");
                                            }} />

                                    </>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>;
    }


};