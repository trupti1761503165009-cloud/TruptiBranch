/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IQuayCleanState } from "../../QuayClean";
import { RemoveSpecialCharacter, getConvertedDate, logGenerator } from "../../../../../Common/Util";
import { DialogType, PrimaryButton } from "office-ui-fabric-react";
import { Loader } from "../../CommonComponents/Loader";
import { useId } from "@fluentui/react-hooks";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import { ListNames, QRFolderName, defaultValues, devSiteURL, mainSiteURL, qaSiteURL, qrcodeSiteURL, qrcodeSiteURLNew, stageSiteURLNew } from "../../../../../Common/Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import * as qrcode from 'qrcode';
import { Link, Pivot, PivotItem, SelectionMode, Toggle, TooltipHost } from '@fluentui/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import moment from "moment";
import { Environment, EnvironmentType } from "@microsoft/sp-core-library";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { DateFormat } from "../../../../../Common/Constants/CommonConstants";


// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');

export interface IUpdateQRCodeProps {
    provider: IDataProvider;
    context: WebPartContext;
    // siteNameId: any;
    manageComponentView(componentProp: IQuayCleanState): any;
    // URL?: string;
    // qcState?: any;
    // siteName: any;
    // qCState?: any;
    loginUserRoleDetails: ILoginUserRoleDetails;
    // IsSupervisor?: boolean;

}
const dialogContentProps = {
    type: DialogType.normal,
    title: "Warning Message",
    closeButtonAriaLabel: "Close",
    subText: "Please Select Date Range!!",
};

export interface IUpdateQRCodeState {
    isReload: boolean;
    isQRCodeModelOpen: boolean;
    qrCodeUrl: string;
    qrDetails: string;
    quChemical: string;
}


// mainSiteURL
// qaSiteURL
// devSiteURL
// qrcodeSiteURL
// qrcodeSiteURLNew
// stageSiteURLNew

export const UpdateQRCode = (props: IUpdateQRCodeProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [columnsEquipment, setcolumnsEquipment] = React.useState<any>([]);
    const tooltipId = useId('tooltip');
    const [assetItems, setAssetItems] = React.useState<any[]>([]);
    const [assetNameOptions, setAssetNameOptions] = React.useState<any[]>([]);
    const [sericalNumberOptions, setSericalNumberOptions] = React.useState<any[]>([]);
    const [idOptions, setIdOptions] = React.useState<any[]>([]);
    const [selctedAsset, setSelctedAsset] = React.useState<any[]>([]);
    const [selctedId, setSelctedId] = React.useState<any[]>([]);
    const [selctedSericalNumber, setSelctedSericalNumber] = React.useState<any[]>([]);

    const [generateQRCodeItems, setGenerateQRCodeItems] = React.useState<any[]>([]);
    const [isGenerateQRDisable, setIsGenerateQRDisable] = React.useState<boolean>(true);
    const [isReload, setIsReload] = React.useState<boolean>(true);
    const [chemicalItems, setChemicalItems] = React.useState<any[]>([]);
    const [chemicalColumn, setChemicalColumn] = React.useState<any>([]);
    const [selectedChemicalName, setSelectedChemicalName] = React.useState<any[]>([]);
    const [selectedChemicalId, setSelectedChemicalId] = React.useState<any[]>([]);
    const [chemicalNameOptions, setChemicalNameOptions] = React.useState<any[]>([]);
    const [chemicalIdOptions, setChemicalIdOptions] = React.useState<any[]>([]);
    const [manufacturerOptions, setManufacturerOptions] = React.useState<any[]>([]);
    const [selectedManufacturer, setSelectedManufacturer] = React.useState<any[]>([]);
    const [isBlankAssetView, setIsBlankAssetView] = React.useState<boolean>(false);
    const _onChangeBlankAsset = (ev: any, checked: boolean) => {
        setIsBlankAssetView(checked);
    };
    const [isBlankChemicalView, setIsBlankChemicalView] = React.useState<boolean>(false);
    const _onChangeBlankChemical = (ev: any, checked: boolean) => {
        setIsBlankChemicalView(checked);
    };

    const dataURItoBlob = (dataURI: string) => {
        let byteString = atob(dataURI.split(',')[1]);
        let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        let ab = new ArrayBuffer(byteString.length);
        let ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        let blob = new Blob([ab], { type: mimeString });
        return blob;
    };
    const qrupload = async (Id: number, url: string, items: any, folder: string) => {
        try {
            // let url = 
            const qrCodeDatas = await qrcode.toDataURL(url);
            let data = dataURItoBlob(qrCodeDatas);
            let FileName = items.Title.split(' ').join('') + Id;
            let QrName = RemoveSpecialCharacter(FileName);
            const file: IFileWithBlob = {
                file: data,
                name: `${QrName}.png`,
                folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/${folder}`,
                overwrite: true
            };
            let fileUpload: any;
            let Photo;
            fileUpload = await props.provider.uploadFile(file);
            Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl });
            await props.provider.updateItemWithPnP({ QRCode: Photo }, ListNames.AssetMaster, Id);
        } catch (error) {
            console.log(error);
        }
    };
    const generateAssetQRCode = async (Id: number) => {
        try {
            const select = ["Id,Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                // filter: `ID eq '61'`,
                filter: `ID eq '${Id}'`,
                listName: ListNames.AssetMaster,
            };

            // let urlQr = qrcodeSiteURLNew;
            // const siteUrl: string = props.context.pageContext.web.absoluteUrl;
            // const urlParts = siteUrl.replace(/^https?:\/\//, '').split('.');
            // const foundTenantName = urlParts[0];
            // if (foundTenantName == "quaycleanaustralia") {
            //     urlQr = qrcodeSiteURL;
            // }

            let filterqrcodeURL = qrcodeSiteURL;
            if (props.context && (Environment.type === EnvironmentType.SharePoint || Environment.type === EnvironmentType.ClassicSharePoint)) {
                const currentUrl: string = props.context.pageContext.web.absoluteUrl.toLowerCase();
                if (currentUrl.indexOf('https://quaycleanaustralia.sharepoint.com') > -1) {
                    filterqrcodeURL = qrcodeSiteURL;
                } else if (currentUrl.indexOf('https://treta.sharepoint.com/sites/quaycleanqa') > -1) {
                    filterqrcodeURL = qaSiteURL;
                } else if (currentUrl.indexOf('https://treta.sharepoint.com/sites/quaycleandev') > -1) {
                    filterqrcodeURL = devSiteURL;
                } else if (currentUrl.indexOf('https://quaycleanqa.quaycleanresources.com.au') > -1) {
                    filterqrcodeURL = stageSiteURLNew;
                }
                else {
                    filterqrcodeURL = mainSiteURL;
                }
            } else {
                filterqrcodeURL = qrcodeSiteURL;
            }

            await props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    results.forEach(async (data) => {
                        const url = `${filterqrcodeURL}Assets/AssetsDetail?ItemId=${data.Id}`;
                        await qrupload(data.Id, url, data, QRFolderName.AssetQRCode);
                    });
                }
            }).catch((error) => {
                console.log(error);
            });

        } catch (ex) {
            console.log(ex);

        }
    };

    const chemicalqrupload = async (Id: number, url: string, items: any, folder: string) => {
        try {
            // let url = 
            const qrCodeDatas = await qrcode.toDataURL(url);
            let data = dataURItoBlob(qrCodeDatas);
            let FileName = items.Title.split(' ').join('') + Id;
            let QrName = RemoveSpecialCharacter(FileName);
            const file: IFileWithBlob = {
                file: data,
                name: `${QrName}.png`,
                folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/${folder}`,
                overwrite: true
            };
            let fileUpload: any;
            let Photo;
            fileUpload = await props.provider.uploadFile(file);
            Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl });
            await props.provider.updateItemWithPnP({ QRCode: Photo }, ListNames.ChemicalRegistration, Id);
        } catch (error) {
            console.log(error);
        }
    };

    const GenerateChemicalQRCode = (Id: number) => {
        try {
            const select = ["Id,Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: `ID eq '${Id}'`,
                listName: ListNames.ChemicalRegistration,
            };
            // let urlQr = qrcodeSiteURLNew;
            // const siteUrl: string = props.context.pageContext.web.absoluteUrl;
            // const urlParts = siteUrl.replace(/^https?:\/\//, '').split('.');
            // const foundTenantName = urlParts[0];
            // if (foundTenantName == "quaycleanaustralia") {
            //     urlQr = qrcodeSiteURL;
            // }
            let filterqrcodeURL = qrcodeSiteURL;
            if (props.context && (Environment.type === EnvironmentType.SharePoint || Environment.type === EnvironmentType.ClassicSharePoint)) {
                const currentUrl: string = props.context.pageContext.web.absoluteUrl.toLowerCase();
                if (currentUrl.indexOf('https://quaycleanaustralia.sharepoint.com') > -1) {
                    filterqrcodeURL = qrcodeSiteURL;
                } else if (currentUrl.indexOf('https://treta.sharepoint.com/sites/quaycleanqa') > -1) {
                    filterqrcodeURL = qaSiteURL;
                } else if (currentUrl.indexOf('https://treta.sharepoint.com/sites/quaycleandev') > -1) {
                    filterqrcodeURL = devSiteURL;
                } else if (currentUrl.indexOf('https://quaycleanqa.quaycleanresources.com.au') > -1) {
                    filterqrcodeURL = stageSiteURLNew;
                }
                else {
                    filterqrcodeURL = mainSiteURL;
                }
            } else {
                filterqrcodeURL = qrcodeSiteURL;
            }

            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    results.forEach(async (data) => {
                        const url = `${filterqrcodeURL}Chemical/ChemicalDetail?ItemId=${data.Id}`;
                        await chemicalqrupload(data.Id, url, data, QRFolderName.ChemicalQRCode);
                    });
                }
            }).catch((error) => {
                console.log(error);
            });

        } catch (ex) {

        }
    };
    const genrateColumn = () => {
        return [
            { key: "key12", name: 'Id', fieldName: 'ID', isResizable: true, minWidth: 60, maxWidth: 80, isSortingRequired: true },
            {
                key: 'Photo', name: 'Photo', fieldName: 'AssetPhotoThumbnailUrl', minWidth: 110, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
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
                key: "key1", name: 'Name', fieldName: 'Title', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true,
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
            { key: "key2", name: 'Site Name', fieldName: 'SiteName', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            { key: "key2", name: 'Manufacturer', fieldName: 'Manufacturer', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            {
                key: "key9", name: 'Serial Number', fieldName: 'SerialNumber', isResizable: true, minWidth: 100, maxWidth: 100, isSortingRequired: true,
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
                key: 'Photo', name: 'QR Code', fieldName: 'QRCode', minWidth: 110, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => {
                    return (
                        // <img src={item.QRCode} height="75px" width="75px" className="course-img-first" />
                        <LazyLoadImage src={item.QRCode}
                            width={75} height={75}
                            placeholderSrc={notFoundImage}
                            alt="photo"
                            className="course-img-first"
                            effect="blur"
                        />
                    );
                }
            }
        ];
    };

    const _onItemInvoked = (item: any): void => {
    };

    const getAssetMasterItem = (isFilterApply: boolean) => {
        let filter: string = "";
        let filterArray: any[] = [];
        if (isFilterApply) {
            if (selctedId.length > 0) {
                for (let index = 0; index < selctedId.length; index++) {
                    const element = selctedId[index];
                    filterArray.push(`Id eq '${element.label}'`);
                }
            }
            if (selctedAsset.length > 0) {
                for (let index = 0; index < selctedAsset.length; index++) {
                    const element = selctedAsset[index];
                    filterArray.push(`Title eq '${element.label}'`);
                }
            }
            if (selctedSericalNumber.length > 0) {
                for (let index = 0; index < selctedSericalNumber.length; index++) {
                    const element = selctedSericalNumber[index];
                    filterArray.push(`SerialNumber eq '${element.label}'`);
                }
            }
            if (filterArray.length > 0) {
                if (filter != "")
                    filter = filter + " or (" + filterArray.join(" or ") + ")";
                else
                    filter = filterArray.join(" or ");
            } else {
                filter = "";
            }
        }

        const select = ["ID,Attachments,AssetCategory,AttachmentFiles,AssetPhotoThumbnailUrl,QCOrder,SiteName/Title,QRCode,Title,SiteNameId,AssetType,NumberOfItems,Manufacturer,Model,QCColor,AMStatus,PurchasePrice,PurchaseDate,ServiceDueDate,SerialNumber,ConditionNotes,AssetLink,AssetPhoto,PreviousOwnerId,PreviousOwner/EMail,CurrentOwnerId,CurrentOwner/EMail,Created"];
        const expand = ["PreviousOwner", "CurrentOwner", "AttachmentFiles", "SiteName"];
        const queryStringOptions: IPnPQueryOptions = {
            select: select,
            listName: ListNames.AssetMaster,
            expand: expand,
            filter: filter
        };
        let imgUniquenumber = moment().format('MMDDYYYYHHmmss');
        props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
            if (!!results) {
                const AssetListData = results.map((data) => {
                    const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/AssetMaster/Attachments/' + data.ID + "/";
                    let AssetPhotoURL;
                    let QRAvailable: boolean = true;
                    let attachmentFiledata;
                    let QRCodeUrl: string = '';
                    if (data.AttachmentFiles.length > 0) {
                        try {
                            const AttachmentData = data.AttachmentFiles[0];
                            if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                                attachmentFiledata = AttachmentData.ServerRelativeUrl;
                            } else if (AttachmentData && AttachmentData.FileName) {
                                attachmentFiledata = fixImgURL + AttachmentData.FileName;
                            } else {
                                attachmentFiledata = notFoundImage;
                            }
                        } catch (error) {
                            console.error("Error parsing AssetPhoto JSON:", error);
                            attachmentFiledata = notFoundImage;
                        }
                    } else {
                        attachmentFiledata = null;
                    }
                    if (data.AssetPhoto) {
                        try {
                            const AssetPhotoData = JSON.parse(data?.AssetPhoto);
                            if (AssetPhotoData && AssetPhotoData.serverRelativeUrl) {
                                AssetPhotoURL = AssetPhotoData.serverRelativeUrl;
                            } else if (AssetPhotoData && AssetPhotoData.fileName) {
                                AssetPhotoURL = fixImgURL + AssetPhotoData.fileName;
                            } else {
                                AssetPhotoURL = notFoundImage;
                            }
                        } catch (error) {
                            AssetPhotoURL = notFoundImage;
                        }
                    } else {
                        AssetPhotoURL = notFoundImage;
                    }
                    if (data.QRCode) {
                        try {
                            const QRCodePhotoData = JSON.parse(data?.QRCode);
                            if (QRCodePhotoData && QRCodePhotoData.serverRelativeUrl) {
                                QRCodeUrl = QRCodePhotoData.serverRelativeUrl;
                                QRAvailable = true;
                            } else if (QRCodePhotoData && QRCodePhotoData.fileName) {
                                QRCodeUrl = fixImgURL + QRCodePhotoData.fileName;
                                QRAvailable = true;
                            } else {
                                QRCodeUrl = notFoundImage;
                                QRAvailable = false;
                            }
                        } catch (error) {
                            // console.error("Error parsing QRCodePhotoData JSON:", error);
                            QRCodeUrl = notFoundImage;
                            QRAvailable = false;
                        }
                    } else {
                        QRCodeUrl = notFoundImage;
                        QRAvailable = false;
                    }
                    return {
                        ID: data.ID,
                        Title: !!data.Title ? data.Title : "",
                        SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                        SiteName: !!data.SiteNameId ? data.SiteName.Title : "",
                        AssetType: !!data.AssetType ? data.AssetType : "",
                        Manufacturer: !!data.Manufacturer ? data.Manufacturer : "",
                        Model: !!data.Model ? data.Model : "",
                        QCColor: !!data.QCColor ? data.QCColor : "",
                        Status: !!data.AMStatus ? data.AMStatus : "",
                        PurchasePrice: !!data.PurchasePrice ? data.PurchasePrice : "",
                        ServiceDueDate: !!data.ServiceDueDate ? getConvertedDate(data.ServiceDueDate) : "",
                        SerialNumber: !!data.SerialNumber ? data.SerialNumber : "",
                        AssetImage: AssetPhotoURL,
                        Attachment: attachmentFiledata,
                        NumberOfItems: !!data.NumberOfItems ? data.NumberOfItems : "",
                        AssetCategory: !!data.AssetCategory ? data.AssetCategory : "",
                        fullServiceDueDate: !!data.ServiceDueDate ? data.ServiceDueDate : "",
                        QCOrder: !!data.QCOrder ? data.QCOrder : "",
                        DueDate: !!data.ServiceDueDate ? data.ServiceDueDate : "",
                        PurchaseDate: !!data.PurchaseDate ? data.PurchaseDate : "",
                        AssetLink: !!data.AssetLink ? data.AssetLink : "",
                        ConditionNotes: !!data.ConditionNotes ? data.ConditionNotes : "",
                        CurrentOwnerId: !!data.CurrentOwnerId ? data.CurrentOwnerId : "",
                        PreviousOwnerId: !!data.PreviousOwnerId ? data.PreviousOwnerId : "",
                        CurrentOwner: !!data.CurrentOwner ? data.CurrentOwner.EMail : "",
                        PreviousOwner: !!data.PreviousOwner ? data.PreviousOwner.EMail : "",
                        AssetPhotoThumbnailUrl: !!data.AssetPhotoThumbnailUrl ? data.AssetPhotoThumbnailUrl : notFoundImage,
                        QRCode: `${QRCodeUrl}?d=${imgUniquenumber}`,
                        QRAvailable: QRAvailable,
                        isCrudVisible: true,

                    };
                });
                if (isBlankAssetView) {
                    setAssetItems(AssetListData?.filter(i => i.QRAvailable === false));
                } else {
                    setAssetItems(AssetListData);
                }

                if (isFilterApply == false) {
                    if (AssetListData.length > 0) {
                        const assetOpt = AssetListData.map((i: any) => ({ value: i.ID, label: i.Title })).filter((j: any) => !!j.label);
                        const sericalOpt = AssetListData.map((i: any) => ({ value: i.ID, label: i.SerialNumber })).filter((j: any) => !!j.label);
                        const idOpt = AssetListData.map((i: any) => ({ value: i.ID, label: i.ID })).filter((j: any) => !!j.label);
                        setAssetNameOptions(assetOpt);
                        setSericalNumberOptions(sericalOpt);
                        setIdOptions(idOpt);
                    }
                }

                // setIsLoading(false);
            }
        }).catch((error) => {
            console.log(error);
            setIsLoading(false);
        });
    };

    const _getChemicalMasterList = (isFilterApply: boolean) => {
        try {
            let filter: string = "";
            let filterArray: any[] = [];
            if (isFilterApply) {
                if (selectedChemicalId.length > 0) {
                    for (let index = 0; index < selectedChemicalId.length; index++) {
                        const element = selectedChemicalId[index];
                        filterArray.push(`Id eq '${element.label}'`);
                    }
                }
                if (selectedManufacturer.length > 0) {
                    for (let index = 0; index < selectedManufacturer.length; index++) {
                        const element = selectedManufacturer[index];
                        filterArray.push(`Manufacturer eq '${element.label}'`);
                    }
                }
                if (selectedChemicalName.length > 0) {
                    for (let index = 0; index < selectedChemicalName.length; index++) {
                        const element = selectedChemicalName[index];
                        filterArray.push(`Title eq '${element.label}'`);
                    }
                }
                if (filterArray.length > 0) {
                    if (filter != "")
                        filter = filter + " or (" + filterArray.join(" or ") + ")";
                    else
                        filter = filterArray.join(" or ");
                } else {
                    filter = "";
                }
            }

            const select = ["ID,Title,Manufacturer,SDSDate,QRCode,Hazardous,HazClass,StorageRequest,pH,StorageClass,SDS,PPERequired,QCNotes,NumberOfItems,ExpirationDate,SDSDocument,ProductPhoto,ProductPhotoThumbnailUrl"];

            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                listName: ListNames.ChemicalRegistration,
                filter: filter
            };
            let imgUniquenumber = moment().format('MMDDYYYYHHmmss');
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const chemicalListData = results.map((data) => {
                        const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/ChemicalRegistration/Attachments/' + data.ID + "/";
                        let QRCodeUrl: string = '';
                        let productPhotoURL;
                        let QRAvailable: boolean = true;
                        if (data.ProductPhoto) {
                            try {
                                const productPhotoData = JSON.parse(data?.ProductPhoto);
                                if (productPhotoData && productPhotoData.serverRelativeUrl) {
                                    productPhotoURL = productPhotoData.serverRelativeUrl;
                                } else if (productPhotoData && productPhotoData.fileName) {
                                    productPhotoURL = fixImgURL + productPhotoData.fileName;
                                } else {
                                    productPhotoURL = notFoundImage;
                                }
                            } catch (error) {
                                productPhotoURL = notFoundImage;
                            }
                        } else {
                            productPhotoURL = notFoundImage;
                        }
                        if (data.QRCode) {
                            try {
                                const QRCodePhotoData = JSON.parse(data?.QRCode);
                                if (QRCodePhotoData && QRCodePhotoData.serverRelativeUrl) {
                                    QRCodeUrl = QRCodePhotoData.serverRelativeUrl;
                                    QRAvailable = true;
                                } else if (QRCodePhotoData && QRCodePhotoData.fileName) {
                                    QRCodeUrl = fixImgURL + QRCodePhotoData.fileName;
                                    QRAvailable = true;
                                } else {
                                    QRCodeUrl = notFoundImage;
                                    QRAvailable = false;
                                }
                            } catch (error) {
                                QRCodeUrl = notFoundImage;
                                QRAvailable = false;
                            }
                        } else {
                            QRCodeUrl = notFoundImage;
                            QRAvailable = false;
                        }
                        const compareDate = data.ExpirationDate ? moment(data.ExpirationDate).format(defaultValues.FilterDateFormate) + "T18:00:00Z" : null;
                        const formattedSDSDate = data.SDSDate ? moment(data.SDSDate).format(DateFormat) : null;
                        const formattedExpirationDate = data.ExpirationDate ? moment(data.ExpirationDate).format(DateFormat) : null;
                        return (
                            {
                                ID: data.ID,
                                Title: data.Title,
                                Manufacturer: data.Manufacturer,
                                SDSDate: formattedSDSDate,
                                SDSDateUpdate: data.SDSDate,
                                ExpirationDate: formattedExpirationDate,
                                compareDate: !!compareDate ? compareDate : "",
                                FullExpirationDate: !!data.ExpirationDate ? data.ExpirationDate : "",
                                Hazardous: data.Hazardous,
                                HazClass: data.HazClass,
                                StorageRequest: data.StorageRequest,
                                pH: data.pH,
                                SerialNumber: data.QCNotes,
                                SDS: data.SDS ? data.SDS.Url : "",
                                PPERequired: data.PPERequired,
                                ProductPhoto: productPhotoURL,
                                // QRCodeUrl: QRCodeUrl,
                                QRCodeUrl: `${QRCodeUrl}?d=${imgUniquenumber}`,
                                QRAvailable: QRAvailable,
                                ProductPhotoThumbnailUrl: !!data.ProductPhotoThumbnailUrl ? data.ProductPhotoThumbnailUrl : notFoundImage,
                            }
                        );
                    });
                    if (isBlankChemicalView) {
                        setChemicalItems(chemicalListData?.filter(i => i.QRAvailable === false));
                    } else {
                        setChemicalItems(chemicalListData);
                    }
                    if (isFilterApply == false) {
                        if (chemicalListData.length > 0) {
                            const chemicalName = chemicalListData.map((i: any) => ({ value: i.ID, label: i.Title })).filter((j: any) => !!j.label);
                            const chemicalId = chemicalListData.map((i: any) => ({ value: i.ID, label: i.ID })).filter((j: any) => !!j.label);
                            const manufacturer = chemicalListData.map((i: any) => ({ value: i.ID, label: i.Manufacturer })).filter((j: any) => !!j.label);
                            setChemicalNameOptions(chemicalName);
                            setChemicalIdOptions(chemicalId);
                            setManufacturerOptions(manufacturer);
                        }
                    }
                }
            }).catch((error) => {
                console.log(error);
                setIsLoading(false);
            });

        } catch (ex) {
            console.log(ex);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "_getChemicalMasterList", CustomErrormessage: "error in get chemical master", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const onChangeAssetName = (option: any[]) => {
        if (option.length > 0) {
            setSelctedAsset(option);
        } else {
            setSelctedAsset([]);
        }

    };
    const onChangeSerialNumber = (option: any[]) => {
        if (option.length > 0) {
            setSelctedSericalNumber(option);
        } else {
            setSelctedSericalNumber([]);
        }

    };
    const onChangeId = (option: any[]) => {
        if (option.length > 0) {
            setSelctedId(option);
        } else {
            setSelctedId([]);
        }

    };


    const onChangeChemicalName = (option: any[]) => {
        if (option.length > 0) {
            setSelectedChemicalName(option);
        } else {
            setSelectedChemicalName([]);
        }

    };
    const onChangeChemicalId = (option: any[]) => {
        if (option.length > 0) {
            setSelectedChemicalId(option);
        } else {
            setSelectedChemicalId([]);
        }

    };
    const onChangeManufacturer = (option: any[]) => {
        if (option.length > 0) {
            setSelectedManufacturer(option);
        } else {
            setSelectedManufacturer([]);
        }

    };
    const _onItemSelected = (item: any): void => {
        if (item.length > 0) {
            setGenerateQRCodeItems(item);
            setIsGenerateQRDisable(false);

        } else {
            setGenerateQRCodeItems([]);
            setIsGenerateQRDisable(true);
        }
    };


    const genrateQrCode = async () => {
        setIsLoading(true);
        for (let index = 0; index < generateQRCodeItems.length; index++) {
            const element = generateQRCodeItems[index];
            await generateAssetQRCode(element.ID);
        }
        setTimeout(() => {
            setIsLoading(false);
            setIsReload(!isReload);
        }, 2000);
    };

    const genrateQrCodeChemical = async () => {
        setIsLoading(true);
        for (let index = 0; index < generateQRCodeItems.length; index++) {
            const element = generateQRCodeItems[index];
            await GenerateChemicalQRCode(element.ID);
        }
        setTimeout(() => {
            setIsLoading(false);
            setIsReload(!isReload);
        }, 2000);
    };

    const genrateColumnChemical = () => {
        let oneMonthDate = moment(new Date()).add(29, 'day').format(defaultValues.FilterDateFormate) + "T23:59:59Z";
        let threeMonthDate = moment(new Date()).add(60, 'day').format(defaultValues.FilterDateFormate) + "T23:59:59Z";
        let column: any[] = [
            { key: "key12", name: 'Id', fieldName: 'ID', isResizable: true, minWidth: 60, maxWidth: 80, isSortingRequired: true },
            {
                key: "key0", name: 'Chemical Photo', fieldName: 'ProductPhotoThumbnailUrl', isResizable: true, minWidth: 100, maxWidth: 150, className: 'courseimg-column',
                // onRender: (item: any) => (
                // //     !!item.ProductPhoto ?
                //         <img src={!!item.ProductPhotoThumbnailUrl ? item.ProductPhotoThumbnailUrl : require('../../../assets/images/imgalt.svg')} alt="Product Photo" className="course-img-first" style={{ width: '110px', height: '65px' }} /> :
                //         <FontAwesomeIcon style={{ width: '65px', height: '65px' }}
                //             icon={"image"}
                //         // height={100}
                //         />
                // ),
                onRender: (item: any) => {
                    const imgURL = item.ProductPhotoThumbnailUrl || notFoundImage;
                    return (
                        <LazyLoadImage
                            src={imgURL}
                            width={65}
                            height={65}
                            alt="Chemical Photo"
                            className="course-img-first"
                            placeholderSrc={notFoundImage} // Fallback while loading
                            effect="blur" // Optional loading effect
                        />
                    )
                },
            },
            {
                key: "key1", name: 'Chemical Name', fieldName: 'Title', isResizable: true, minWidth: 140, maxWidth: 170, isSortingRequired: true,
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
            { key: "key2", name: 'Manufacturer', fieldName: 'Manufacturer', isResizable: true, minWidth: 100, maxWidth: 150, isSortingRequired: true },
            { key: "key3", name: 'SDS Date', fieldName: 'SDSDate', isResizable: true, minWidth: 90, maxWidth: 100, isSortingRequired: true },
            {
                key: 'Expiration Date', name: 'Expiration Date', fieldName: 'ExpirationDate', minWidth: 100, maxWidth: 120, isResizable: false, headerClassName: 'courseimg-header', isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.compareDate < oneMonthDate) {
                        return (
                            <div className="redBadge mw-110 badge truncate">{item.ExpirationDate}</div>
                        );
                    } else if (item.compareDate > oneMonthDate && item.compareDate < threeMonthDate) {
                        return (
                            <div className="yellowBadge mw-110 badge truncate">{item.ExpirationDate}</div>
                        );
                    } else if (item.compareDate > threeMonthDate) {
                        return (
                            <div className="greenBadge mw-110 badge truncate">{item.ExpirationDate}</div>
                        );
                    }
                }
            },
            {
                key: "key5", name: 'Hazardous', fieldName: 'Hazardous', isResizable: true, minWidth: 70, maxWidth: 100, isSortingRequired: true,
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
                key: "key6", name: 'Has Class', fieldName: 'HazClass', isResizable: true, minWidth: 110, maxWidth: 110, isSortingRequired: true,
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
                key: "key7", name: 'Storage Req.', fieldName: 'StorageRequest', isResizable: true, minWidth: 200, maxWidth: 200, isSortingRequired: true,
                onRender: (item: any) => {
                    if (item.StorageRequest != null) {
                        return (
                            <>
                                {item.StorageRequest.length > 75 ? `${item.StorageRequest.slice(0, 75)}...` : item.StorageRequest}
                            </>
                        );
                    } else {
                        { item.StorageRequest; }
                    }
                },
            },
            { key: "key8", name: 'pH', fieldName: 'pH', isResizable: true, minWidth: 30, maxWidth: 100, isSortingRequired: true },

            {
                key: 'Photo', name: 'QR Code', fieldName: 'QRCode', minWidth: 110, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => {
                    return (

                        // <img src={item.QRCodeUrl} height="75px" width="75px" className="course-img-first" />
                        <LazyLoadImage src={item.QRCodeUrl}
                            width={75} height={75}
                            placeholderSrc={notFoundImage}
                            alt="photo"
                            className="course-img-first"
                            effect="blur"
                        />

                    );
                }
            },
        ];
        return column;
    };


    React.useEffect(() => {
        setIsLoading(true);
        getAssetMasterItem(true);
        setIsLoading(false);
    }, [selctedAsset, selctedId, selctedSericalNumber, isReload, isBlankAssetView]);

    React.useEffect(() => {
        setIsLoading(true);
        _getChemicalMasterList(true);
        setIsLoading(false);
    }, [selectedChemicalId, selectedChemicalName, selectedManufacturer, isReload, isBlankChemicalView]);

    React.useEffect(() => {
        setIsLoading(true);
        const column: any[] = genrateColumn();
        const chemicalColumn: any[] = genrateColumnChemical();
        setChemicalColumn(chemicalColumn);
        setcolumnsEquipment(column);
        getAssetMasterItem(false);
        _getChemicalMasterList(false);
        setIsLoading(false);

    }, []);

    return <>
        {isLoading && <Loader />}
        <div className="boxCard">
            <div className="formGroup">
                <div className="ms-Grid mb-3">
                    <div className="ms-Grid-row">
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <h1 className="mainTitle">Update QR Code</h1>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                            <Pivot aria-label="Basic Pivot Example">
                                <PivotItem
                                    headerText="Asset Master"
                                >
                                    <div className="filtermrg mt-2">
                                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                            <div className="formControl">

                                                <ReactDropdown
                                                    options={idOptions}
                                                    isMultiSelect={true}
                                                    // defaultOption={[501, 506]}
                                                    defaultOption={selctedId.length > 0 ? selctedId.map((i) => i.value) : []}
                                                    onChange={onChangeId}
                                                    placeholder={"Id"}
                                                />
                                            </div>
                                        </div>
                                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                            <div className="formControl">

                                                < ReactDropdown
                                                    options={assetNameOptions}
                                                    isMultiSelect={true}
                                                    defaultOption={selctedAsset.length > 0 ? selctedAsset.map((i) => i.value) : []}
                                                    onChange={onChangeAssetName}
                                                    placeholder={"Asset Name"}
                                                />
                                            </div>
                                        </div>
                                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                            <div className="formControl">
                                                < ReactDropdown
                                                    options={sericalNumberOptions}
                                                    isMultiSelect={true}
                                                    defaultOption={selctedSericalNumber.length > 0 ? selctedSericalNumber.map((i) => i.value) : []}
                                                    onChange={onChangeSerialNumber}
                                                    placeholder={"Serial Number"}
                                                />
                                            </div>
                                        </div>

                                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                            <div className="formControl">
                                                <TooltipHost content={"Generate QR Code "}>
                                                    <PrimaryButton className={isGenerateQRDisable ? "h-40" : "btn btn-primary dticon h-40"}
                                                        disabled={isGenerateQRDisable}
                                                        onClick={genrateQrCode}
                                                        iconProps={{ iconName: "QRCode" }}
                                                        text="Generate/Update" />
                                                </TooltipHost>

                                            </div>
                                        </div>
                                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6  ms-xl2 ">
                                            <div className="formControl dflex">
                                                <label>Display Blank QR Records ?</label>
                                                <Toggle
                                                    onText="Yes" offText="No"
                                                    defaultChecked={isBlankAssetView}
                                                    onChange={_onChangeBlankAsset} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                        <MemoizedDetailList
                                            manageComponentView={props.manageComponentView}
                                            columns={columnsEquipment}
                                            items={assetItems || []}
                                            CustomselectionMode={SelectionMode.multiple}
                                            reRenderComponent={true}
                                            searchable={false}
                                            onItemInvoked={_onItemInvoked}
                                            onSelectedItem={_onItemSelected}
                                            isNoPagination={true}
                                            isPagination={false}


                                        />
                                    </div>
                                </PivotItem>

                                <PivotItem headerText="Chemical Master">
                                    <div className="filtermrg mt-2">
                                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                            <div className="formControl">

                                                <ReactDropdown
                                                    options={chemicalIdOptions}
                                                    isMultiSelect={true}
                                                    // defaultOption={[501, 506]}
                                                    defaultOption={selectedChemicalId.length > 0 ? selectedChemicalId.map((i) => i.value) : []}
                                                    onChange={onChangeChemicalId}
                                                    placeholder={"Id"}
                                                />
                                            </div>
                                        </div>
                                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                            <div className="formControl">
                                                < ReactDropdown
                                                    options={chemicalNameOptions}
                                                    isMultiSelect={true}
                                                    defaultOption={selectedChemicalName.length > 0 ? selectedChemicalName.map((i: any) => i.value) : []}
                                                    onChange={onChangeChemicalName}
                                                    placeholder={"Chemical Name"}
                                                />
                                            </div>
                                        </div>
                                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                            <div className="formControl">
                                                < ReactDropdown
                                                    options={manufacturerOptions}
                                                    isMultiSelect={true}
                                                    defaultOption={selectedManufacturer.length > 0 ? selectedManufacturer.map((i: any) => i.value) : []}
                                                    onChange={onChangeManufacturer}
                                                    placeholder={"Manufacturer"}
                                                />
                                            </div>
                                        </div>
                                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                            <div className="formControl">
                                                <TooltipHost content={"Generate QR Code "}>
                                                    <PrimaryButton className={isGenerateQRDisable ? "h-40" : "btn btn-primary dticon h-40"}
                                                        disabled={isGenerateQRDisable}
                                                        onClick={genrateQrCodeChemical}
                                                        iconProps={{ iconName: "QRCode" }}
                                                        text="Generate/Update" />
                                                </TooltipHost>

                                            </div>
                                        </div>
                                        <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg6  ms-xl2 ">
                                            <div className="formControl dflex">
                                                <label>Display Blank QR Records ?</label>
                                                <Toggle
                                                    onText="Yes" offText="No"
                                                    defaultChecked={isBlankChemicalView}
                                                    onChange={_onChangeBlankChemical} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                        <MemoizedDetailList
                                            manageComponentView={props.manageComponentView}
                                            columns={chemicalColumn}
                                            items={chemicalItems || []}
                                            CustomselectionMode={SelectionMode.multiple}
                                            reRenderComponent={true}
                                            searchable={false}
                                            onItemInvoked={_onItemInvoked}
                                            onSelectedItem={_onItemSelected}
                                            isNoPagination={true}
                                            isPagination={false}

                                        />
                                    </div>
                                </PivotItem>
                            </Pivot>
                        </div>

                    </div>
                </div>
            </div>
        </div >
    </>;
};  