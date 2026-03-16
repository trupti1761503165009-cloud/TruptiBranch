/* eslint-disable */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import CustomModal from "../../CommonComponents/CustomModal";
import { DialogType, IColumn, Link, SelectionMode, TooltipHost } from "@fluentui/react";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { logGenerator } from "../../../../../Common/Util";
import { ComponentNameEnum, ListNames } from "../../../../../Common/Enum/ComponentNameEnum";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { IQuayCleanState } from "../../QuayClean";
import { Loader } from "../../CommonComponents/Loader";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import { MasterAssetNameFilter } from "../../../../../Common/Filter/MasterAssetName";
import { MasterManufacturerFilter } from "../../../../../Common/Filter/MasterManufacturerFilter";
import { LazyLoadImage } from "react-lazy-load-image-component";
import moment from "moment";
import { AssetTypeFilter } from "../../../../../Common/Filter/AssetTypeFilter";
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');

export interface IAssetHistoryProps {
    provider: IDataProvider;
    isModelOpen: boolean;
    context: WebPartContext;
    onClickClose(): any;
    onSave(data: any): void;
    manageComponentView?: any;
    loginUserRoleDetails: ILoginUserRoleDetails;

}
export interface IAssetHistoryState {
    isModelOpen: boolean;
    column: IColumn[];
    detailList: any;
    masterAssetsItems: any[];
    reload: boolean;
}

export const MasterAssetDialog = (props: IAssetHistoryProps) => {

    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [MasterData, setMasterData] = React.useState<any[]>([]);
    const [selectedManufacturer, setSelectedManufacturer] = React.useState<any>([]);
    const [selectedAssetNames, setSelectedAssetNames] = React.useState<any[]>([]);
    const [selectedAssetType, setSelectedAssetType] = React.useState<any>();

    const onAssetNameChange = (selectedAssets: any[]): void => {
        const selectedValues = selectedAssets.map(asset => asset.text?.toString().trim());
        setSelectedAssetNames(selectedValues);
        setState(prevState => ({ ...prevState, reload: !prevState.reload }));
    };

    const onManufacturerChange = (manufacturer: any[]): void => {
        const selectedValues = manufacturer.map(manufacturer => manufacturer?.toString().trim());
        setSelectedManufacturer(selectedValues);
        setState(prevState => ({ ...prevState, reload: !prevState.reload }));
    };

    const onAssetTypeChange = (assetType: any): void => {
        setSelectedAssetType(assetType);
        setState(prevState => ({ ...prevState, reload: !prevState.reload }));
    };

    const [state, setState] = React.useState<IAssetHistoryState>({
        isModelOpen: props.isModelOpen,
        column: [],
        detailList: null,
        masterAssetsItems: [],
        reload: false
    });

    const _AssetMaster = async () => {
        setIsLoading(true);
        let filter = "";

        const filterArray: string[] = [];
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

            const results: any[] = await props.provider.getItemsByQuery(queryStringOptions);

            if (!!results) {
                const AssetListData = results.map(data => {
                    const fixImgURL = `${props.context.pageContext.web.serverRelativeUrl}/Lists/GlobalAssets/Attachments/${data.ID}/`;
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
                    };
                });

                const sortedData = AssetListData.sort((a, b) => moment(b.Modified).diff(moment(a.Modified)));
                return sortedData;
            }

        } catch (error: any) {
            console.error(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error occurred in _AssetMaster",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_AssetMaster"
            };
            void logGenerator(props.provider, errorObj);
            // const errorMessage = getErrorMessageValue(error.message);
            // setError(errorMessage);
            // sethasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const getMasterAssetsColumn = (): IColumn[] => {
        let columns: IColumn[] = [

            {
                key: 'Photo', name: 'Photo', fieldName: 'AssetPhotoThumbnailUrl', minWidth: 100, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
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
                key: "key1", name: 'Name', fieldName: 'Title', isResizable: true, minWidth: 100, maxWidth: 140,
                // onRender: (item: any) => {
                //     if (item.Title != "") {
                //         return (
                //             <>
                //                 <Link className="tooltipcls">
                //                     <TooltipHost content={item.Title} id={tooltipId}>
                //                         <div onClick={() => _onclickDetailsView(item)}>{item.Title}</div>
                //                     </TooltipHost>
                //                 </Link>
                //             </>
                //         );
                //     }
                // },
            },
            { key: "key2", name: 'Manufacturer', fieldName: 'Manufacturer', isResizable: true, minWidth: 100, maxWidth: 120 },
            { key: "key3", name: 'Model', fieldName: 'Model', isResizable: true, minWidth: 70, maxWidth: 110 },
            { key: "key4", name: 'Asset Type', fieldName: 'AssetType', isResizable: true, minWidth: 70, maxWidth: 110 },
            { key: "key5", name: 'Color', fieldName: 'QCColor', isResizable: true, minWidth: 70, maxWidth: 100 },
            {
                key: 'Attachment', name: 'Audit Reports', fieldName: 'Attachment', minWidth: 100, maxWidth: 140, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => {
                    if (item.Attachment != null) {
                        return (
                            <><Link className="actionBtn btnPDF dticon" target="_blank" rel="noopenernoreferrer" onClick={() => { window.open(item.Attachment, '_blank'); }}>
                                <TooltipHost
                                    content={"View Audit Reports"}
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
                                >
                                    <FontAwesomeIcon icon="file-pdf" />
                                </TooltipHost>

                            </Link >
                        );
                    }
                }
            }
        ];
        return columns;
    };

    const _onItemSelected = (item: any): void => {
        setMasterData([]);
        if (!!item && item.length > 0) {
            setMasterData(item);
        }

    };
    const onClickCloseModel = () => {
        props.onClickClose();
        setState(prevState => ({ ...prevState, isModelOpen: false }));
    };

    const _onSaveClick = () => {
        props.onSave(MasterData[0]);
        setState(prevState => ({ ...prevState, isModelOpen: false }));
    };

    const Detaillist = (column: any, item: any[]) => {
        setState(prevState => ({ ...prevState, reload: false }));
        return <>
            {isLoading && <Loader />}
            <div className="ms-SPLegacyFabricBlock">
                <div className="formGroup">
                    <div className="ms-Grid">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg2">
                                <div className="formControl">
                                    <MasterAssetNameFilter
                                        loginUserRoleDetails={props.loginUserRoleDetails}
                                        selectedAssetName={selectedAssetNames}
                                        onAssetNameChange={onAssetNameChange}
                                        provider={props.provider}
                                        isRequired={true}
                                        AllOption={true}
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg2">
                                <div className="formControl">
                                    <MasterManufacturerFilter
                                        loginUserRoleDetails={props.loginUserRoleDetails}
                                        defaultOption={selectedManufacturer}
                                        onManufacturerChange={onManufacturerChange}
                                        provider={props.provider}
                                        isRequired={true}
                                        AllOption={false}
                                        listName={ListNames.GlobalAssets}
                                        isMultiple={true}
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md3 ms-lg2">
                                <div className="formControl">
                                    <AssetTypeFilter
                                        selectedAssetType={selectedAssetType}
                                        defaultOption={!!selectedAssetType ? selectedAssetType : ""}
                                        onAssetTypeChange={onAssetTypeChange}
                                        provider={props.provider}
                                        isRequired={true}
                                        AllOption={true}
                                        listName={ListNames.GlobalAssets}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {
                    <MemoizedDetailList
                        columns={column}
                        items={item || []}
                        reRenderComponent={true}
                        searchable={true}
                        isAddNew={true}
                        onSelectedItem={_onItemSelected}
                        CustomselectionMode={SelectionMode.single}
                        manageComponentView={
                            function (componentProp: IQuayCleanState) {
                                throw new Error("Function not implemented.");
                            }
                        }
                    // addNewContent={props.loginUserRoleDetails.isAdmin &&
                    //     <PrimaryButton text="Add Master Asset" onClick={() => {
                    //         let breadCrumItems = { text: "Add Form", key: 'Add Form', currentCompomnetName: ComponentNameEnum.AddGlobalAsset, manageComponent: props.manageComponentView };
                    //         props.manageComponentView({ currentComponentName: ComponentNameEnum.AddGlobalAsset, breadCrumItems: breadCrumItems });
                    //     }} className="btn btn-primary associate-add-btn" />}
                    />
                }
            </div >
        </>;
    };

    React.useEffect(() => {
        try {
            void (async () => {
                let column = getMasterAssetsColumn();
                let assetItems: any = await _AssetMaster();
                let detailList = Detaillist(column, assetItems);
                setState(prevState => ({ ...prevState, column: column, detailList: detailList, masterAssetsItems: assetItems }));

            })();

        } catch (error) {
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect MasterAssetDialog"
            };
            void logGenerator(props.provider, errorObj);

        }
    }, [state.reload]);

    return <>

        <CustomModal dialogWidth="1100px" isModalOpenProps={state.isModelOpen} setModalpopUpFalse={onClickCloseModel} subject={"Master Assets"} message={state.detailList}
            yesButtonText="Select"
            onClickOfYes={_onSaveClick}
            closeButtonText={"Close"}
            isYesButtonDisbale={MasterData?.length > 0 ? false : true}
        />
    </>;

};