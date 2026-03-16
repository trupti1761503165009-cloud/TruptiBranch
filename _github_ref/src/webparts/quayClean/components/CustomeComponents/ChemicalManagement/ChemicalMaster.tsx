/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-void */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider";
import { ComponentNameEnum, HazardousOptions, ListNames, defaultValues, devSiteURL, mainSiteURL, qaSiteURL, qrcodeSiteURL, stageSiteURLNew } from "../../../../../Common/Enum/ComponentNameEnum";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { IQuayCleanState } from "../../QuayClean";
import moment from "moment";
import { Breadcrumb, DialogType, IDropdownOption, Link, Panel, PanelType, PrimaryButton, SelectionMode, TooltipHost } from "@fluentui/react";
import { useId } from "@fluentui/react-hooks";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { Loader } from "../../CommonComponents/Loader";
import { _onItemSelected, delay, getChoicesListOptions, logGenerator, onBreadcrumbItemClicked, scrollFunction, showPremissionDeniedPage, getErrorMessageValue, generateExcelTable } from "../../../../../Common/Util";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { ValidateForm } from "../../../../../Common/Validation";
import CustomModal from "../../CommonComponents/CustomModal";
import DragAndDrop from "../../CommonComponents/FileUpload/DragandDrop";
import { toastService } from "../../../../../Common/ToastService";
import * as qrcode from 'qrcode';
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import * as XLSX from 'xlsx';
import { CustomeDialog } from "../../CommonComponents/CustomeDialog";
import { PrintQrCode } from "../QRCode/PrintQrCode";
import { GenrateQRCode } from "../../CommonComponents/GenrateQRCode";
import { utils, writeFile } from 'xlsx';
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import { Environment, EnvironmentType } from "@microsoft/sp-core-library";
import { DateRangeFilter } from "../../../../../Common/Filter/DateRangeFilter";
import CommonGridView from "../Asset/CommonGridView";
import { ChemicalCardView } from "./ChemicalCardView";
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';
import { IExportColumns } from "../EquipmentChecklist/Question";
import { DateFormat, MicrosoftOfficeDocumentType } from "../../../../../Common/Constants/CommonConstants";
import { _getAllSDSDocuments, _getDocumentData } from "../../CommonComponents/CommonMethods";
import { ChemicalCountCard } from "./ChemicalCountCard";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
//import CustomModal from "../../CommonComponents/CustomModal";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');

export interface IProps {
    provider: IDataProvider;
    manageComponentView(componentProp: IQuayCleanState): any;
    breadCrumItems: IBreadCrum[];
    context: any;
    IsMasterChemical?: boolean;
    loginUserRoleDetails: any;
    view?: any;
}

export interface IChemicalMasterState {
    isUploadExcelModelOpen?: boolean;
    mdlConfigurationFile?: any;
    excelData?: any[];
    uploadData?: any[];
    isReload?: boolean;
    isUploadFileValidationModelOpen?: boolean;
    dialogContentProps?: any;
    isQRCodeModelOpen?: boolean;
    qrCodeUrl: string;
    qrDetails?: any;
    quChemical?: string;
    uploadFileErrorMessage?: any;
    isDeletedModelOpen: boolean;
    deleteItemId: number;
}
export const ChemicalMaster = (props: IProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const [isPrintQRModelOpent, setIsPrintQRModelOpent] = React.useState<boolean>(false);
    const [updateDropDown, setupdateDropDown] = React.useState<boolean>(true);
    const [keyUpdate, setKeyUpdate] = React.useState<number>(Math.random());
    const [fromDate, setFromDate] = React.useState<Date | any>();
    const [toDate, setToDate] = React.useState<Date | any>();
    const [filterFromDate, setFilterFromDate] = React.useState<any>(undefined);
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);
    const [state, setState] = React.useState<IChemicalMasterState>({
        isUploadExcelModelOpen: false,
        mdlConfigurationFile: "",
        excelData: [],
        uploadData: [],
        isReload: false,
        isQRCodeModelOpen: false,
        qrCodeUrl: "",
        qrDetails: "",
        quChemical: "",
        isUploadFileValidationModelOpen: false,
        dialogContentProps: {
            type: DialogType.normal,
            title: 'In Correct Formate',
            closeButtonAriaLabel: 'Close',
            subText: "",

        },
        uploadFileErrorMessage: "",
        isDeletedModelOpen: false,
        deleteItemId: 0

    });
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [ListChemicals, setListChemicals] = React.useState<any[]>([]);
    const [listColumnsNames, setListColumnsNames] = React.useState<any>([]);
    const [UpdateItem, setUpdateItem] = React.useState<any>();
    const [chemicalOptions, setChemicalOptions] = React.useState<any[]>([]);
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const [isDisplayEditButtonview, setIsDisplayEditButtonview] = React.useState<boolean>(false);
    const [selectedChemical, setSelectedChemical] = React.useState<any>();
    const [manufacturerOptions, setManufacturerOptions] = React.useState<any[]>([]);
    const [selectedManufacturer, setSelectedManufacturer] = React.useState<any>();
    const [downloadDisable, setdownloadDisable] = React.useState<boolean>(true);
    const [hazardousOptions, setHazardousOptions] = React.useState<any[]>([]);
    const [selectedHazardous, setSelectedHazardous] = React.useState<any>();
    const tooltipId = useId('tooltip');
    const [lblAll, setlblAll] = React.useState<boolean>(false);
    const [isDisplayFilterDialog, setisDisplayFilterDialog] = React.useState<boolean>(false);
    const openModal = () => { setShowModal(true); };
    const closeModal = () => { setShowModal(false); };
    const [fileURL, setFileURL] = React.useState<string | null>(null);
    const [isShowModelQR, setIsShowModelQR] = React.useState<boolean>(false);
    const itemurlQR = React.useRef<any>();
    const itemsRefQR = React.useRef<any>();
    const [allDataForExcel, setDataForExcel] = React.useState<any>([]);
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: '', text: 'select' });
    const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : 'grid');
    const [showModal, setShowModal] = React.useState<boolean>(false);
    const [showMultiFilePanel, setShowMultiFilePanel] = React.useState<boolean>(false);
    const [multiFileURLs, setMultiFileURLs] = React.useState<string[]>([]);
    const [filterType, setFilterType] = React.useState<any>(""); // Manage filter type state
    const [SummaryData, setSummaryData] = React.useState<any>([]);
    const [finalObj, setfinalObj] = React.useState<any[]>([]);
    const [ListChemical, setListChemical] = React.useState<any>([]);
    const handleViewChange = (view: string) => {
        // This will handle the view change
        setCurrentView(view);
    };

    const onChangeRangeOption = (item: IDropdownOption): void => {
        setSelectedItem(item);
    };
    const onChangeToDate = (filterDate: any, date?: Date) => {
        setFilterToDate(filterDate);
        setToDate(date);
    };
    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setFromDate(date);
        setFilterFromDate(filterDate);
    };
    const getUniqueTitles = (results: any[]): string[] => {
        const uniqueTitles: string[] = [];
        for (const data of results) {
            const title = data.Title;
            // Check if the title is not already in the uniqueTitles array
            if (uniqueTitles.indexOf(title) === -1) {
                uniqueTitles.push(title);
            }
        }
        return uniqueTitles;
    };
    const _isWithinNextMonthRange = (givenFullDate: string): boolean => {
        if (!givenFullDate) return false;
        const today = moment().startOf('day');
        const oneMonthFromNow = moment().add(1, 'month').endOf('day');
        const date = moment(givenFullDate);
        return date.isSameOrAfter(today) && date.isSameOrBefore(oneMonthFromNow);
    };

    const _isExpired = (givenFullDate: string): boolean => {
        if (!givenFullDate) return false;
        return moment(givenFullDate).isBefore(moment());
    };

    const getChemicalSummary = (ListAssocitedChemical: any[]) => {
        const totalChemicals = ListAssocitedChemical.length;
        const numberOfHazardous = ListAssocitedChemical.filter((chemical: any) =>
            chemical.Hazardous?.toString().trim().toLowerCase() === "yes"
        ).length;
        const numberOfNonHazardous = ListAssocitedChemical.filter((chemical: any) =>
            chemical.Hazardous?.toString().trim().toLowerCase() === "no"
        ).length;
        const numberOfExpiringNextMonth = ListAssocitedChemical.filter((chemical: any) => {
            return _isWithinNextMonthRange(chemical.FullExpirationDate);
        }).length;
        const numberOfExpiredChemicals = ListAssocitedChemical.filter((chemical: any) => {
            return _isExpired(chemical.FullExpirationDate);
        }).length;
        return {
            totalChemicals,
            numberOfHazardous,
            numberOfNonHazardous,
            numberOfExpiringNextMonth,
            numberOfExpiredChemicals
        };
    };
    const _getChemicalMasterList = async () => {
        setIsLoading(true);
        try {
            let updatedd = true;
            let filterDateArray = [];
            let filterArray = [];
            let filter = "";
            if (filterFromDate == null || filterToDate == null) {
                if (selectedItem.text == "Custom Range") {
                    // toggleHideDialog();
                } else if (selectedItem.text == "select") {
                    filterDateArray.push();
                }
            } else if (!!filterFromDate && !!filterToDate) {
                filterDateArray.push(`(ExpirationDate ge datetime'${filterFromDate}T00:00:00Z' and ExpirationDate le datetime'${filterToDate}T23:59:59Z')`);
            }
            const selectFields = [
                "ID", "Title", "Manufacturer", "IsSDSDocument", "SDSDate", "QRCode", "Hazardous", "HazClass", "StorageRequest", "pH", "StorageClass", "SDS", "PPERequired", "QCNotes", "Modified", "NumberOfItems", "ExpirationDate", "SDSDocument", "ProductPhoto", "ProductPhotoThumbnailUrl"
            ];
            filterArray.push(`<Neq><FieldRef Name='IsDeleted'/><Value Type='Boolean'>1</Value></Neq>`);
            if (selectedManufacturer) {
                filterArray.push(`<Eq><FieldRef Name='Manufacturer'/><Value Type='Text'>${selectedManufacturer}</Value></Eq>`);
            }
            if (selectedChemical) {
                filterArray.push(`<Eq><FieldRef Name='Title'/><Value Type='Text'>${selectedChemical}</Value></Eq>`);
            }
            if (selectedHazardous) {
                filterArray.push(`<Eq><FieldRef Name='Hazardous'/><Value Type='Text'>${selectedHazardous}</Value></Eq>`);
            }

            if (filterFromDate == null || filterToDate == null) {
                if (selectedItem.text === "Custom Range") {
                    // Handle custom range dialog or UI
                } else if (selectedItem.text === "select") {
                    // Handle select case
                }
            } else if (filterFromDate && filterToDate) {
                filterArray.push(`<And>
                                    <Geq><FieldRef Name='ExpirationDate'/><Value Type='DateTime' IncludeTimeValue='TRUE'>${filterFromDate}T00:00:00Z</Value></Geq>
                                    <Leq><FieldRef Name='ExpirationDate'/><Value Type='DateTime' IncludeTimeValue='TRUE'>${filterToDate}T23:59:59Z</Value></Leq>
                                 </And>`);
            }
            // Combine Filters
            let combinedFilter = '';
            if (filterArray.length > 1) {
                combinedFilter = filterArray.reduce((prev, current) => `<And>${prev}${current}</And>`);
            } else if (filterArray.length === 1) {
                combinedFilter = filterArray[0];
            }

            const queryFilter = combinedFilter ? `<Where>${combinedFilter}</Where>` : '';
            // Build CAML Query
            const camlQuery = `
                <View>
                    <ViewFields>
                        ${selectFields.map(field => `<FieldRef Name='${field}' />`).join('')}
                    </ViewFields>
                    <Query>
                        ${queryFilter}
                    </Query>
                    <RowLimit>5000</RowLimit>
                </View>
            `;
            const siteURL = props.context.pageContext.web.absoluteUrl;
            const results = await props.provider.getItemsByCAMLQuery(ListNames.ChemicalRegistration, camlQuery, null, siteURL);

            if (!!results) {
                const allSDSDocuments = await _getAllSDSDocuments(provider);
                if (updateDropDown) {
                    const uniqueChemicalTitles: string[] = getUniqueTitles(results);
                    const chemicalOptionsArray: any[] = uniqueChemicalTitles.map((option: any) => ({
                        value: option,
                        key: option,
                        text: option,
                        label: option
                    }));
                    chemicalOptionsArray.push({ key: '', text: '', value: '', label: " --All Chemical--" });
                    setChemicalOptions(chemicalOptionsArray);
                    setupdateDropDown(false);
                }

                // ⏳ Create Promises for processing each item
                const chemicalListDataPromises = results.map(async (data: any) => {
                    const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/ChemicalRegistration/Attachments/' + data.ID + "/";
                    let QRCodeUrl: string = '';
                    let productPhotoURL;

                    // 📄 Initialize SDS URL from field
                    let sdsURLParts: string[] = [];
                    const sdsFieldValue = data?.SDS ? data?.["SDS.desc"] ?? "" : "";
                    if (sdsFieldValue) {
                        sdsURLParts.push(sdsFieldValue);
                    }

                    // 📄 Merge with document links if IsSDSDocument === "Yes"
                    // if (data.IsSDSDocument === "Yes") {
                    //     const documentdata = await _getDocumentData(data.ID, props.provider);
                    //     if (documentdata && documentdata.length > 0) {
                    //         for (const fileData of documentdata) {
                    //             if (fileData?.FileRef) {
                    //                 const filePath: string = fileData.FileRef;
                    //                 const fileType = filePath.split('.').pop();
                    //                 const embedFullFilePath = `${props.context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${filePath}&action=embedview`;

                    //                 let DocumentFullPath: string;
                    //                 if (MicrosoftOfficeDocumentType.indexOf(fileType || '') >= 0) {
                    //                     DocumentFullPath = embedFullFilePath;
                    //                 } else {
                    //                     DocumentFullPath = fileType === "zip"
                    //                         ? `${filePath}?web=1&action=embedview`
                    //                         : filePath;
                    //                 }
                    //                 sdsURLParts.push(DocumentFullPath);
                    //             }
                    //         }
                    //     }
                    // }
                    if (data.IsSDSDocument) {
                        const documentdata = allSDSDocuments.filter((doc: any) => doc.ChemicalRegistrationId === data.ID);
                        if (documentdata.length > 0) {
                            for (const fileData of documentdata) {
                                if (fileData?.FileRef) {
                                    const filePath = fileData.FileRef;
                                    const fileType = filePath.split('.').pop();

                                    const embedFullFilePath =
                                        `${context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${filePath}&action=embedview`;

                                    const DocumentFullPath =
                                        MicrosoftOfficeDocumentType.includes(fileType || "")
                                            ? embedFullFilePath
                                            : fileType === "zip"
                                                ? `${filePath}?web=1&action=embedview`
                                                : filePath;

                                    sdsURLParts.push(DocumentFullPath);
                                }
                            }
                        }
                    }
                    // ✅ Combine both field and document URLs
                    let sdsURL = sdsURLParts.join(", ");

                    // 🖼️ Handle ProductPhoto
                    if (data?.ProductPhoto) {
                        try {
                            const productPhotoData = JSON.parse(data.ProductPhoto);
                            if (productPhotoData?.serverRelativeUrl) {
                                productPhotoURL = productPhotoData.serverRelativeUrl;
                            } else if (productPhotoData?.fileName) {
                                productPhotoURL = fixImgURL + productPhotoData.fileName;
                            } else {
                                productPhotoURL = notFoundImage;
                            }
                        } catch {
                            productPhotoURL = notFoundImage;
                        }
                    } else {
                        productPhotoURL = notFoundImage;
                    }

                    // 📸 Handle QRCode
                    // if (data?.QRCode) {
                    //     try {
                    //         const QRCodePhotoData = JSON.parse(data.QRCode);
                    //         if (QRCodePhotoData?.serverRelativeUrl) {
                    //             QRCodeUrl = QRCodePhotoData.serverRelativeUrl;
                    //         } else if (QRCodePhotoData?.fileName) {
                    //             QRCodeUrl = fixImgURL + QRCodePhotoData.fileName;
                    //         } else {
                    //             QRCodeUrl = notFoundImage;
                    //         }
                    //     } catch {
                    //         QRCodeUrl = notFoundImage;
                    //     }
                    // } else {
                    //     QRCodeUrl = notFoundImage;
                    // }
                    if (data?.QRCode) {
                        try {
                            const QRCodePhotoData = JSON?.parse(data?.QRCode);
                            if (QRCodePhotoData && QRCodePhotoData?.serverRelativeUrl) {
                                QRCodeUrl = QRCodePhotoData?.serverRelativeUrl;
                            } else if (QRCodePhotoData && QRCodePhotoData?.fileName) {
                                QRCodeUrl = fixImgURL + QRCodePhotoData?.fileName;
                            } else {
                                QRCodeUrl = notFoundImage;
                            }
                        } catch (error) {
                            // console.error("Error parsing QRCodePhotoData JSON:", error);
                            QRCodeUrl = notFoundImage;
                        }
                    } else {
                        QRCodeUrl = notFoundImage;
                    }

                    const compareDate = data.ExpirationDate
                        ? moment(data.ExpirationDate).format(defaultValues.FilterDateFormate) + "T18:00:00Z"
                        : null;

                    const formattedSDSDate = data.SDSDate ? moment(data.SDSDate).format(DateFormat) : null;
                    const formattedExpirationDate = data.ExpirationDate ? moment(data.ExpirationDate).format(DateFormat) : null;

                    return {
                        ID: data.ID,
                        Title: data.Title,
                        Manufacturer: data.Manufacturer,
                        SDSDate: formattedSDSDate,
                        SDSDateUpdate: data.SDSDate,
                        ExpirationDate: formattedExpirationDate,
                        FullExpirationDate: data.ExpirationDate ?? "",
                        compareDate: compareDate ?? "",
                        Hazardous: data.Hazardous,
                        HazClass: data.HazClass,
                        StorageRequest: data.StorageRequest,
                        pH: data.pH,
                        SerialNumber: data.QCNotes,
                        SDS: sdsURL,
                        PPERequired: data.PPERequired,
                        ProductPhoto: productPhotoURL,
                        HazClassSTR: Array.isArray(data.HazClass) ? data.HazClass.join(', ') : data.HazClass,
                        PPERequiredSTR: Array.isArray(data.PPERequired) ? data.PPERequired.join(', ') : data.PPERequired,
                        Modified: data.Modified ?? null,
                        // QRCodeUrl: QRCodeUrl,
                        QRCodeUrl: !!data.QRCode?.serverRelativeUrl ? data.QRCode?.serverRelativeUrl : notFoundImage,
                        ProductPhotoThumbnailUrl: data.ProductPhotoThumbnailUrl ?? notFoundImage,
                    };
                });

                // ✅ Await all processing
                const resolvedChemicalListData = await Promise.all(chemicalListDataPromises);

                // 📅 Sort by Modified date descending
                resolvedChemicalListData.sort((a: any, b: any) => {
                    return moment(b.Modified).diff(moment(a.Modified));
                });
                // ✅ Call filterList only when filterType has a valid value
                if (filterType) {
                    const filterList = () => {
                        let filteredList = resolvedChemicalListData;
                        if (filterType === 'Expired Chemicals') {
                            filteredList = resolvedChemicalListData?.filter((item: any) =>
                                _isExpired(item.FullExpirationDate)
                            );
                        } else if (filterType === 'Expiry in 1 Month') {
                            filteredList = resolvedChemicalListData?.filter((item: any) =>
                                _isWithinNextMonthRange(item.FullExpirationDate)
                            );
                        } else if (filterType === 'Hazardous') {
                            filteredList = resolvedChemicalListData?.filter(
                                (x: any) => x.Hazardous?.toString().trim().toLowerCase() === "yes"
                            );
                        } else if (filterType === 'Non Hazardous') {
                            filteredList = resolvedChemicalListData?.filter(
                                (x: any) => x.Hazardous?.toString().trim().toLowerCase() === "no"
                            );
                        }
                        setListChemicals(filteredList);
                    };

                    filterList();
                } else {
                    setListChemicals(resolvedChemicalListData);
                }
                // ✅ Update state
                setDataForExcel(resolvedChemicalListData);
                const summaryData = getChemicalSummary(resolvedChemicalListData);
                setSummaryData(summaryData);
                setIsLoading(false);
            }

            // props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
            // if (!!results) {
            //     if (updateDropDown) {
            //         const uniqueChemicalTitles: string[] = getUniqueTitles(results);
            //         let chemicalOptionsArray: any[];

            //         chemicalOptionsArray = uniqueChemicalTitles.map((option: any) => {
            //             return { value: option, key: option, text: option, label: option };
            //         });
            //         chemicalOptionsArray.push({ key: '', text: '', value: '', label: " --All Chemical--" });
            //         setChemicalOptions(chemicalOptionsArray);
            //         setupdateDropDown(false);
            //     }
            //     let chemicalListData = results.map(async (data: any) => {
            //         const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/ChemicalRegistration/Attachments/' + data.ID + "/";
            //         let QRCodeUrl: string = '';
            //         let productPhotoURL;
            //         //  let sdsURL = chemicalItem.SDS ? chemicalItem.SDS.Url : "";
            //         let sdsURL = data?.SDS ? data?.["SDS.desc"] ?? "" : "";
            //         if (data.IsSDSDocument==="Yes") {
            //             const documentdata = await _getDocumentData(data.ID, props.provider);
            //             if (documentdata && documentdata.length > 0) {
            //                 const urls: string[] = [];
            //                 for (const fileData of documentdata) {
            //                     if (fileData?.FileRef) {
            //                         const filePath: string = fileData.FileRef;
            //                         const fileType = filePath.split('.').pop();
            //                         const embedFullFilePath = `${props.context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${filePath}&action=embedview`;

            //                         let DocumentFullPath: string;
            //                         if (MicrosoftOfficeDocumentType.indexOf(fileType || '') >= 0) {
            //                             DocumentFullPath = embedFullFilePath;
            //                         } else {
            //                             DocumentFullPath = fileType === "zip"
            //                                 ? `${filePath}?web=1&action=embedview`
            //                                 : filePath;
            //                         }
            //                         urls.push(DocumentFullPath);
            //                     }
            //                 }
            //                 sdsURL = urls.join(", ");
            //             }
            //         }

            //         if (data?.ProductPhoto) {
            //             try {
            //                 const productPhotoData = JSON?.parse(data?.ProductPhoto);
            //                 if (productPhotoData && productPhotoData?.serverRelativeUrl) {
            //                     productPhotoURL = productPhotoData?.serverRelativeUrl;
            //                 } else if (productPhotoData && productPhotoData?.fileName) {
            //                     productPhotoURL = fixImgURL + productPhotoData?.fileName;
            //                 } else {
            //                     productPhotoURL = notFoundImage;
            //                 }
            //             } catch (error) {
            //                 // console.error("Error parsing ProductPhoto JSON:", error);
            //                 productPhotoURL = notFoundImage;
            //             }
            //         } else {
            //             productPhotoURL = notFoundImage;
            //         }
            //         if (data?.QRCode) {
            //             try {
            //                 const QRCodePhotoData = JSON?.parse(data?.QRCode);
            //                 if (QRCodePhotoData && QRCodePhotoData?.serverRelativeUrl) {
            //                     QRCodeUrl = QRCodePhotoData?.serverRelativeUrl;
            //                 } else if (QRCodePhotoData && QRCodePhotoData?.fileName) {
            //                     QRCodeUrl = fixImgURL + QRCodePhotoData?.fileName;
            //                 } else {
            //                     QRCodeUrl = notFoundImage;
            //                 }
            //             } catch (error) {
            //                 // console.error("Error parsing QRCodePhotoData JSON:", error);
            //                 QRCodeUrl = notFoundImage;
            //             }
            //         } else {
            //             QRCodeUrl = notFoundImage;
            //         }
            //         const compareDate = data.ExpirationDate ? moment(data.ExpirationDate).format(defaultValues.FilterDateFormate) + "T18:00:00Z" : null;
            //         const formattedSDSDate = data.SDSDate ? moment(data.SDSDate).format(DateFormat) : null;
            //         const formattedExpirationDate = data.ExpirationDate ? moment(data.ExpirationDate).format(DateFormat) : null;
            //         return (
            //             {
            //                 ID: data.ID,
            //                 Title: data.Title,
            //                 Manufacturer: data.Manufacturer,
            //                 SDSDate: formattedSDSDate,
            //                 SDSDateUpdate: data.SDSDate,
            //                 ExpirationDate: formattedExpirationDate,
            //                 FullExpirationDate: !!data.ExpirationDate ? data.ExpirationDate : "",
            //                 compareDate: !!compareDate ? compareDate : "",
            //                 Hazardous: data.Hazardous,
            //                 HazClass: data.HazClass,
            //                 StorageRequest: data.StorageRequest,
            //                 pH: data.pH,
            //                 SerialNumber: data.QCNotes,
            //                 // SDS: data.SDS ? data?.SDS : data.SDS?.Url ? data.SDS?.Url : "",
            //                 SDS: data?.SDS ? data?.["SDS.desc"] ?? "" : "",
            //                 PPERequired: data.PPERequired,
            //                 ProductPhoto: productPhotoURL,
            //                 HazClassSTR: Array.isArray(data.HazClass) ? data.HazClass.join(', ') : data.HazClass,
            //                 PPERequiredSTR: Array.isArray(data.PPERequired) ? data.PPERequired.join(', ') : data.PPERequired,
            //                 Modified: !!data.Modified ? data.Modified : null,
            //                 QRCodeUrl: !!data.QRCode?.serverRelativeUrl ? data.QRCode?.serverRelativeUrl : notFoundImage,
            //                 ProductPhotoThumbnailUrl: !!data.ProductPhotoThumbnailUrl ? data.ProductPhotoThumbnailUrl : notFoundImage,
            //             }
            //         );
            //     });
            //     chemicalListData = chemicalListData?.sort((a: any, b: any) => {
            //         return moment(b.Modified).diff(moment(a.Modified));
            //     });
            //     setListChemicals(chemicalListData);
            //     setDataForExcel(chemicalListData);
            //     setIsLoading(false);
            // }

        } catch (ex) {
            console.log(ex);
            if (false) delay(100);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "_getChemicalMasterList", CustomErrormessage: "error in get chemical master", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            const errorMessage = getErrorMessageValue(error.message);
            setError(errorMessage);
            sethasError(true);
        }
    };

    const _onChemicalChange = (chemical: any): void => {
        setSelectedChemical(chemical?.key || "");
        if (chemical.label == " --All Chemical--") {
            setlblAll(true);
        }
    };

    const _onManufacturerChange = (chemical: any): void => {
        setSelectedManufacturer(chemical?.key || "");
        if (chemical.label == " --All Manufacturer--") {
            setlblAll(true);
        }
    };

    const onclickUpload = () => {
        setState(prevState => ({ ...prevState, isUploadExcelModelOpen: true }));
    };

    const _onHazardousChange = (chemical: any): void => {
        setSelectedHazardous(chemical?.key || "");
        if (chemical.label == " --All Hazardous--") {
            setlblAll(true);
        }
    };

    const _onItemSelected = (item: any): void => {
        if (item.length > 0) {

            // setDeleteId(item[0].ID);
            if (item.length == 1) {
                setIsDisplayEditButtonview(true);
                setUpdateItem(item[0]);
            } else {
                setIsDisplayEditButtonview(false);
                setUpdateItem(item);
            }
            setisDisplayEDbtn(true);
        } else {
            setUpdateItem([]);
            // setDeleteId(0);
            setisDisplayEDbtn(false);
        }
    };

    const onclickEdit = (predata: any) => {
        if (!!UpdateItem) {
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({ text: UpdateItem.Title, key: UpdateItem.Title, currentCompomnetName: ComponentNameEnum.AddNewChemical, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewChemical, siteMasterId: UpdateItem.ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems } });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AddNewChemical, IsMasterChemical: props.IsMasterChemical, siteMasterId: UpdateItem.ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems
            });
        }
        let data: any[] = [];
        if (!!predata.ID) {
            data.push(predata);
            if (!!data) {
                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                breadCrumItems.push({ text: data[0].Title, key: data[0].Title, currentCompomnetName: ComponentNameEnum.AddNewChemical, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewChemical, siteMasterId: data[0].ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems } });
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.AddNewChemical, IsMasterChemical: props.IsMasterChemical, siteMasterId: data[0].ID, isShowDetailOnly: false, breadCrumItems: breadCrumItems
                });
            }
        }


    };

    // const onclickEdit = (predata: any) => {
    //     setisDisplayEDbtn(false);
    //     if (!!UpdateItem) {
    //         let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
    //         breadCrumItems.push({ text: UpdateItem[0].Title, key: UpdateItem[0].Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewAsset, dataObj2: props.dataObj, siteMasterId: props.siteMasterId, dataObj: UpdateItem, siteName: props.siteName, qCState: props.qCState, breadCrumItems: breadCrumItems, pivotName: "EquipmentKey" } });
    //         props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewAsset, dataObj2: props.dataObj, siteMasterId: props.siteMasterId, dataObj: UpdateItem, siteName: props.siteName, qCState: props.qCState, pivotName: "EquipmentKey", breadCrumItems: breadCrumItems });
    //     }
    //     let data: any[] = [];
    //     if (!!predata) {
    //         data.push(predata);
    //         if (!!data) {
    //             let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
    //             breadCrumItems.push({ text: data[0].Title, key: data[0].Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewAsset, dataObj2: props.dataObj, siteMasterId: props.siteMasterId, dataObj: data, siteName: props.siteName, qCState: props.qCState, breadCrumItems: breadCrumItems, pivotName: "EquipmentKey" } });
    //             props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewAsset, dataObj2: props.dataObj, siteMasterId: props.siteMasterId, dataObj: data, siteName: props.siteName, qCState: props.qCState, pivotName: "EquipmentKey", breadCrumItems: breadCrumItems });
    //         }
    //     }
    // };

    const onclickDownload = () => {
        try {
            let url = props.context.pageContext.web.absoluteUrl + '/Shared%20Documents/MasterFiles/ChemicalRegisterSample.xlsx';
            let fileName = "ChemicalRegisterSample";
            let downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.download = fileName;
            document.body.appendChild(downloadLink);
            downloadLink.click();
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickDownload", CustomErrormessage: "error in download file", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };
    const _onSearchTextChangeForExcel = (data: any) => {
        setDataForExcel(data);
    };

    const handleFileUpload = (event: any) => {
        try {
            let errorobj: any[] = [];

            const file: any = event;
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                let dataJSONHeaderChek: any[] = XLSX.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]], { header: 1 })[0];
                const expectedColumnNames = ['Title', 'Manufacturer', 'SDS', 'SDSDate', 'PPEReq', 'Hazardous', 'HazClass', 'pH', 'StorageClass', 'StorageReq', 'Notes', 'NumberOfItems', 'ExpirationDate'];
                let isColumnsValid = true;

                for (let index = 0; index < dataJSONHeaderChek.length; index++) {
                    isColumnsValid = expectedColumnNames.indexOf(dataJSONHeaderChek[index]) >= 0;
                    if (!isColumnsValid) {
                        errorobj.push(dataJSONHeaderChek[index]);
                    }
                }
                if (errorobj.length == 0) {
                    const excelData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
                    let saveDate = excelData.map((r: {
                        Title: any;
                        pH: any;
                        SDS: any;
                        Manufacturer: any;
                        PurchasePrice: string;
                        HazClass: any;
                        SDSDate: moment.MomentInput;
                        Hazardous: any;
                        Notes: any;
                        PPEReq: any;
                        StorageReq: any;
                        ExpirationDate: moment.MomentInput;
                        NumberOfItems: any;
                        StorageClass: any;
                    }) => {
                        return {
                            Title: !!r.Title ? r.Title : "",
                            pH: !!r.pH ? r.pH : 0,
                            Manufacturer: !!r.Manufacturer ? r.Manufacturer : "",
                            SDS: !!r.SDS ? { Url: r.SDS } : null,
                            StorageClass: !!r.StorageClass ? `${r.StorageClass}` : "",
                            SDSDate: !!r.SDSDate ? moment(r.SDSDate, "DD/MM/YYYY") : null,
                            HazClass: !!r.HazClass ? r.HazClass.split(';') : [],
                            StorageRequest: !!r.StorageReq ? r.StorageReq : "",
                            Hazardous: !!r.Hazardous ? r.Hazardous : "",
                            QCNotes: !!r.Notes ? r.Notes : "",
                            PPERequired: !!r.PPEReq ? r.PPEReq.split(';') : [],
                            PPERequiredSTR: r.PPEReq ? r.PPEReq.split(';').join(', ') : '',
                            HazClassSTR: !!r.HazClass ? r.HazClass.split(';').join(', ') : '',

                            ExpirationDate: !!r.ExpirationDate ? moment(r.ExpirationDate, "DD/MM/YYYY") : null,
                            NumberOfItems: !!r.NumberOfItems ? r.NumberOfItems : 0,

                        };
                    });
                    setState(prevState => ({ ...prevState, excelData: saveDate }));

                } else {
                    let message = <div><b > Following fields are missing from the excel </b><ul>{errorobj.map(((r: any, index: any) => {
                        if (index === 0) {
                            return <> <li className="errorPoint">  {r} </li> </>;
                        } else {
                            return <li className="errorPoint">  {r} </li>;
                        }
                    }))}</ul></div>;
                    setState(prevState => ({ ...prevState, isUploadFileValidationModelOpen: true, uploadFileErrorMessage: message }));
                }

            };
            reader.readAsArrayBuffer(file);


        } catch (error) {
            console.log(error);
            const errorObj = { ErrorMethodName: "handleFileUpload", CustomErrormessage: "error in file upload", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }

    };
    const setFilesToState = (files: any[]) => {
        try {
            const selectedFiles: any[] = [];
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    let file = files[i];
                    const selectedFile: any = {
                        file: file,
                        name: file.name,
                        key: i
                    };
                    selectedFiles.push(selectedFile);
                }
                setState(prevState => ({ ...prevState, mdlConfigurationFile: selectedFiles }));
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "setFilesToState", CustomErrormessage: "setFilesToState", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const uploadFileValidation = (e: any) => {
        const validationFields: any = {
            "excel": ["name"],
        };
        let file: any;
        if (e.type == 'change') {
            file = e.target.files[0];
        } else {
            file = e.dataTransfer?.files[0];
        }
        let isValid = ValidateForm(file, validationFields);
        return isValid.isValid;
    };


    const handleDrop = async (e: any) => {
        console.log(e);
        let isVaild = uploadFileValidation(e);

        try {
            if (isVaild) {
                e.preventDefault();
                e.stopPropagation();

                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const selectedFiles: any[] = e.dataTransfer.files;
                    setFilesToState(selectedFiles);
                    handleFileUpload(selectedFiles[0]);
                }
            } else {
                setState(prevState => ({ ...prevState, isUploadFileValidationModelOpen: true, uploadFileErrorMessage: "Kindly upload file in excel format." }));
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "handleDrop", CustomErrormessage: "handleDrop", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };


    const handleChange = async (e: any): Promise<void> => {

        let isVaild = uploadFileValidation(e);
        try {
            if (isVaild) {
                e.preventDefault();
                e.stopPropagation();
                if (e.type == 'change') {
                    if (e.target.files && e.target.files[0]) {
                        const selectedFiles: any[] = e.target.files;
                        setFilesToState(selectedFiles);
                        handleFileUpload(selectedFiles[0]);
                    }
                } else {
                    if (e.dataTransfer?.files && e.dataTransfer?.files[0]) {
                        const selectedFiles: any[] = e.dataTransfer?.files;
                        setFilesToState(selectedFiles);
                        handleFileUpload(selectedFiles[0]);
                    }
                }
            } else {
                setState(prevState => ({ ...prevState, isUploadFileValidationModelOpen: true, uploadFileErrorMessage: "Kindly upload file in excel format." }));
            }
        } catch (error) {
            const errorObj = { ErrorMethodName: "MDLConfiguration handleChange", CustomErrormessage: "handleChange", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const onCancel = async () => {
        setState(prevState => ({ ...prevState, isUploadExcelModelOpen: false, mdlConfigurationFile: [] }));
    };

    const removeFile = async (id: number | string) => {
        try {
            const newFiles = state.mdlConfigurationFile.filter((file: IFileWithBlob) => file.key != id);
            setState(prevState => ({ ...prevState, mdlConfigurationFile: newFiles }));
        } catch (error) {
            const errorObj = { ErrorMethodName: "MDLConfiguration removeFile", CustomErrormessage: "removeFile", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
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

    const onclickExportToExcel = async () => {
        try {
            let exportColumns: IExportColumns[] = [
                {
                    header: "Chemical Name",
                    key: "Title"
                },
                {
                    header: "Manufacturer",
                    key: "Manufacturer"
                },
                {
                    header: "SDS Date",
                    key: "SDSDate"
                },
                {
                    header: "Expiration Date",
                    key: "ExpirationDate"
                },
                {
                    header: "Hazardous",
                    key: "Hazardous"
                },
                {
                    header: "Haz Class",
                    key: "HazClassSTR"
                },
                {
                    header: "Storage Request",
                    key: "StorageRequest"
                },
                {
                    header: "pH",
                    key: "pH"
                },
                {
                    header: "Serial Number",
                    key: "SerialNumber"
                },
                {
                    header: "SDS",
                    key: "SDSDate"
                },
                {
                    header: "PPE Required",
                    key: "PPERequiredSTR"
                },
                {
                    header: "Product Photo",
                    key: "ProductPhoto"
                }
            ];
            generateExcelTable(allDataForExcel, exportColumns, `Chemical Register.xlsx`);
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickExportToExcel", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const afterQrGenrate = async (url: any, items: any, Id: any) => {
        try {
            let data = dataURItoBlob(url);

            // let QrName = items.Title.replace("#", '').split(' ').join('') + "-" + Id;
            let QrName = items.Title.split(' ').join('') + "-" + Id;
            const file: IFileWithBlob = {
                file: data,
                // name: "QrCode.png",
                name: `${QrName}.png`,
                folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/ChemicalQrCode`,
                overwrite: true
            };
            let fileUpload: any;
            let Photo;
            fileUpload = await props.provider.uploadFile(file);
            Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl });

            await props.provider.updateItemWithPnP({ QRCode: Photo }, ListNames.ChemicalRegistration, Id);

            setIsShowModelQR(false);
        } catch (error) {
            console.log(error);
            const errorObj = { ErrorMethodName: "afterQrGenrate", CustomErrormessage: "error in afterQrGenrate", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }

    };
    const genratedQrcode = (baseUrl: any) => {
        afterQrGenrate(baseUrl, itemsRefQR.current, itemsRefQR.current.ID);
    };


    const qrupload = async (Id: any, items: any) => {
        try {
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
            let url = `${filterqrcodeURL}Chemical/ChemicalDetail?ItemId=${Id}`;
            const qrCodeDatas = await qrcode.toDataURL(url);
            let data = dataURItoBlob(qrCodeDatas);
            let QrName = items.Title.replace("#", '').split(' ').join('') + "-" + Id;
            const file: IFileWithBlob = {
                file: data,
                // name: "QrCode.png",
                name: `${QrName}.png`,
                folderServerRelativeURL: `${props.context.pageContext.web.serverRelativeUrl}/SiteAssets/ChemicalQrCode`,
                overwrite: true
            };
            let fileUpload: any;
            let Photo;
            fileUpload = await props.provider.uploadFile(file);
            Photo = JSON.stringify({ serverRelativeUrl: fileUpload.data.ServerRelativeUrl });
            await props.provider.updateItemWithPnP({ QRCode: Photo }, ListNames.ChemicalRegistration, Id);

        } catch (error) {
            const errorObj = { ErrorMethodName: "qrupload", CustomErrormessage: "error in qr code upload", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }

    };
    const onSaveFiles = () => {
        setIsLoading(true);
        try {
            if (state.excelData && state.excelData.length > 0) {
                const toastMessage = 'Record Insert successfully!';
                const toastId = toastService.loading('Loading...');
                props.provider.createItemInBatch(state.excelData, ListNames.ChemicalRegistration).then(async (results: any) => {
                    setState(prevState => ({ ...prevState, isUploadExcelModelOpen: false, mdlConfigurationFile: [] }));
                    let record = results.map((item: { data: any; }) => item.data);
                    let recordId = record.map((i: { ID: any; }) => i.ID);
                    // qrupload(recordId, record)
                    for (let i = 0; i < recordId.length; i++) {
                        await qrupload(recordId[i], record[i]);
                        if (i == recordId.length - 1) {
                            setIsLoading(false);
                            setState(prevState => ({ ...prevState, isReload: !state.isReload, isUploadExcelModelOpen: false, mdlConfigurationFile: [], excelData: [] }));
                        }
                    }
                    toastService.updateLoadingWithSuccess(toastId, toastMessage);
                }).catch(err => console.log(err));
            }

        } catch (error) {
            console.log(error);
            const errorObj = { ErrorMethodName: "onSaveFiles", CustomErrormessage: "error in on file save", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
            setIsLoading(false);
        }
    };

    const onclickdelete = async () => {
        setIsLoading(true);
        try {
            const toastMessage = 'Record deleted successfully!';
            const toastId = toastService.loading('Loading...');

            if (!!UpdateItem) {
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
                const newObjects = processUpdateItem(UpdateItem);
                if (newObjects.length > 0) {
                    await props.provider.updateListItemsInBatchPnP(ListNames.ChemicalRegistration, newObjects)
                }
            }
            setisDisplayEDbtn(false);
            setState(prevState => ({ ...prevState, isDeletedModelOpen: false, deleteItemId: 0, isReload: !state.isReload }));
            setIsLoading(false);
            setIsDisplayEditButtonview(false);
            toastService.updateLoadingWithSuccess(toastId, toastMessage);

        } catch (ex) {
            const errorObj = {
                ErrorMessage: ex.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  onclickdelete",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "onclickdelete"
            };
            void logGenerator(props.provider, errorObj);
            console.log(ex);
            setIsLoading(false);
        }
    };


    const DranAndDrop = <>
        <DragAndDrop
            provider={props.provider}
            files={state.mdlConfigurationFile}
            handleChange={(e: any) => handleChange(e)}
            removeFile={removeFile}
            handleDrop={(e: any) => handleDrop(e)}
            onCancel={onCancel}
            onSaveFiles={onSaveFiles}
            isMultiple={false}
        />
    </>;
    const _onclickDetailsView = (itemID: any) => {
        try {
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.ViewChemicalDetail, siteMasterId: itemID.ID, isShowDetailOnly: true, breadCrumItems: breadCrumItems } });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.ViewChemicalDetail, view: currentView, IsMasterChemical: props.IsMasterChemical, siteMasterId: itemID.ID, isShowDetailOnly: true, breadCrumItems: breadCrumItems
            });

        } catch (error) {
            const errorObj = { ErrorMethodName: "_onclickDetailsView", CustomErrormessage: "error in on click details view", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };


    const genrateColumn = () => {
        let oneMonthDate = moment(new Date()).add(29, 'day').format(defaultValues.FilterDateFormate) + "T23:59:59Z";
        let threeMonthDate = moment(new Date()).add(60, 'day').format(defaultValues.FilterDateFormate) + "T23:59:59Z";
        let column: any[] = [
            {
                key: "key11", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 50, maxWidth: 100,
                onRender: ((itemID: any) => {
                    return <>
                        <div className='dflex'>
                            <div><Link className="actionBtn btnView dticon" onClick={() => {
                            }}>
                                <TooltipHost
                                    content={"Details"}
                                    id={tooltipId}
                                >
                                    <div onClick={() => _onclickDetailsView(itemID)}>
                                        <FontAwesomeIcon icon="eye" /></div>
                                </TooltipHost>
                            </Link></div >
                            {/* <div>
                                <div onClick={() => _onclickDetailsView(itemID)}>{itemID.Title}</div>
                                <Link className="actionBtn btnView dticon" onClick={() => {
                                    let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                    breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.ViewChemicalDetail, siteMasterId: itemID.ID, isShowDetailOnly: true, breadCrumItems: breadCrumItems } });
                                    props.manageComponentView({
                                        currentComponentName: ComponentNameEnum.ViewChemicalDetail, IsMasterChemical: props.IsMasterChemical, siteMasterId: itemID.ID, isShowDetailOnly: true, breadCrumItems: breadCrumItems
                                    });
                                }}>
                                    <TooltipHost content={"View Detail"} id={tooltipId}>
                                        <FontAwesomeIcon icon="eye" />
                                    </TooltipHost>
                                </Link>
                            </div> */}
                            <div>
                            </div>
                        </div>
                    </>;
                })
            },
            {
                key: "key0", name: 'Chemical Photo', fieldName: 'ProductPhotoThumbnailUrl', isResizable: true, minWidth: 100, maxWidth: 150, className: 'courseimg-column',
                onRender: (item: any) => {
                    const imgURL = item.ProductPhotoThumbnailUrl || notFoundImage;
                    return (
                        // !!item.ProductPhoto ?
                        //     <img src={!!item.ProductPhotoThumbnailUrl ? item.ProductPhotoThumbnailUrl : require('../../../assets/images/imgalt.svg')} alt="Product Photo" className="course-img-first" style={{ width: '110px', height: '65px' }} /> :
                        //     <FontAwesomeIcon style={{ width: '65px', height: '65px' }}
                        //         icon={"image"}
                        //     // height={100}
                        //     />

                        <LazyLoadImage
                            src={imgURL}
                            // width={110}
                            // height={65}
                            alt="Product Photo"
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
                                        <div onClick={() => _onItemName(item)}>{item.Title}</div>
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
                    if (item.Hazardous?.trim().toLowerCase() === "yes") {
                        badgeClass = 'redBadge mw-50 badge';
                    } else {
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
            { key: "key8", name: 'pH', fieldName: 'pH', isResizable: true, minWidth: 30, maxWidth: 100, isSortingRequired: true },
            {
                key: "key9", name: 'SDS', fieldName: 'SDS', isResizable: true, minWidth: 70, maxWidth: 140, isSortingRequired: true, onRender: (item: any) => {
                    return (
                        <>
                            {(item.SDS || "")
                                .split(",")
                                .map((url: any) => url.trim()) // remove spaces
                                .filter((url: any) => url.length > 0) // remove empty entries
                                .map((url: string, index: number) => (
                                    <div key={index}>
                                        <Link
                                            onClick={() => {
                                                setFileURL(url);
                                                setShowModal(true);
                                            }}
                                        >
                                            {`Link ${index + 1}`}
                                        </Link>
                                    </div>
                                ))}
                        </>
                    );

                },
            },
            {
                key: 'Photo', name: 'QR Code', fieldName: 'QRCode', minWidth: 110, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                onRender: (item: any) => {
                    return (
                        <TooltipHost
                            content={"View QR Code"}
                            id={tooltipId}
                        >
                            <div onClick={() => {
                                setKeyUpdate(Math.random());
                                setState(prevState => ({ ...prevState, isQRCodeModelOpen: true, quChemical: "Chemical", qrDetails: item, qrCodeUrl: item.QRCodeUrl }));

                            }}>
                                {/* <img src={item.QRCodeUrl} height="75px" width="75px" className="course-img-first" /> */}
                                <LazyLoadImage src={item.QRCodeUrl}
                                    width={75} height={75}
                                    placeholderSrc={notFoundImage}
                                    alt="photo"
                                    className="course-img-first"
                                    effect="blur"
                                />
                            </div>
                        </TooltipHost>
                    );
                }
            },

        ];
        return column;
    };

    const onClickCloseModel = () => {
        setState(prevState => ({ ...prevState, isUploadExcelModelOpen: false }));
    };

    const _onItemInvoked = (itemID: any): void => {
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.ViewChemicalDetail, siteMasterId: itemID.ID, isShowDetailOnly: true, breadCrumItems: breadCrumItems } });
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.ViewChemicalDetail, siteMasterId: itemID.ID, isShowDetailOnly: true, breadCrumItems: breadCrumItems
        });
    };
    const _onItemName = (itemID: any): void => {
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.AddNewSite, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.ViewChemicalDetail, siteMasterId: itemID.ID, isShowDetailOnly: true, breadCrumItems: breadCrumItems } });
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.ViewChemicalDetail, siteMasterId: itemID.ID, isShowDetailOnly: true, breadCrumItems: breadCrumItems
        });
    };

    React.useEffect(() => {
        // props.provider._Document("ChemicalQrCode").then(() => {
        // }).catch((error) => {
        //     const errorObj = {
        //         ErrorMessage: error.toString(),
        //         ErrorStackTrace: "",
        //         CustomErrormessage: "Error is occuring while  useEffect",
        //         PageName: "QuayClean.aspx",
        //         ErrorMethodName: "useEffect ChemicalQrCode"
        //     };
        //     void logGenerator(props.provider, errorObj);
        // });
        const className = document.querySelector('ARTICLE')?.children[0].children[0].classList[0];
        let el: any = document.querySelector(!!className ? `.${className}` : "");
        if (!!el) {
            el.onscroll = function () {
                scrollFunction(150);
            };
        }
        props.provider.getDocumentByURL().then((results: any[]) => {
            if (!!results) {
                let fileNameArray = results.map(item => item.FileLeafRef == "ChemicalRegisterSample.xlsx");
                for (let i = 0; i < fileNameArray.length; i++) {
                    if (fileNameArray[i] == true) {
                        setdownloadDisable(false);
                    }
                }
            }
        }).catch((error) => {
            console.log(error);
            setIsLoading(false);
            const errorObj = { ErrorMethodName: "use effect", CustomErrormessage: "error in use effect", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        });
    }, []);

    React.useEffect(() => {
        setIsLoading(true);
        // const filterList = () => {
        //     let filteredList = ListChemicals;
        //     if (filterType === 'Expired Chemicals') {
        //         filteredList = ListChemicals?.filter((item: any) => _isExpired(item.FullExpirationDate));
        //     } else if (filterType === 'Expiry in 1 Month') {
        //         filteredList = ListChemicals?.filter((item: any) => _isWithinNextMonthRange(item.FullExpirationDate));
        //     } else if (filterType === 'Hazardous') {
        //         filteredList = ListChemicals?.filter((x: any) => x.Hazardous.toString().trim().toLowerCase() === "yes");
        //     } else if (filterType === 'Non Hazardous') {
        //         filteredList = ListChemicals?.filter((x: any) => x.Hazardous.toString().trim().toLowerCase() === "no");
        //     }
        //     setListChemicals(filteredList);
        // };
        // setIsLoading(false);
        // filterList();
    }, [filterType]);

    React.useEffect(() => {
        let permssiion = showPremissionDeniedPage(props.loginUserRoleDetails);
        if (permssiion.length == 0) {
            props.manageComponentView({ currentComponentName: ComponentNameEnum.AccessDenied });
        }
        try {
            setIsLoading(true);
            // eslint-disable-next-line no-void
            void (async () => {
                const [manufacturerOptionsArray] = await Promise.all([getChoicesListOptions(props.provider, ListNames.ChemicalRegistration, "Manufacturer", true)]);
                setManufacturerOptions(manufacturerOptionsArray);

                let hazardousOptionsArray: any[] = HazardousOptions.map((option: any) => {
                    return { value: option.key, key: option.key, text: option.text, label: option.text };
                });
                hazardousOptionsArray.push({ key: '', text: '', value: '', label: " --All Hazardous--" });
                setHazardousOptions(hazardousOptionsArray);

                let column = genrateColumn();
                setListColumnsNames(column);

                await _getChemicalMasterList();
                // Show the loader for at least 1 second
                setTimeout(() => {
                    setIsLoading(false);
                }, 1000);
            })();
        } catch (error) {
            setIsLoading(false);
            console.log(error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  useEffect",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "useEffect ChemicalMaster"
            };
            void logGenerator(props.provider, errorObj);
        }
    }, [isRefreshGrid, state.isReload, selectedHazardous, selectedManufacturer, selectedChemical, filterToDate, filterType]);

    const _onClickSearch = () => {
        if (!selectedHazardous && !selectedManufacturer && !selectedChemical && lblAll === false) {
            setisDisplayFilterDialog(true);
        } else {
            _getChemicalMasterList();
        }
    };
    const onCloseModel = () => {
        setisDisplayFilterDialog(false);
    };

    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };
    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setCurrentView('card');
        } else {
            // if (props.view == "" || props.view === undefined) {
            //     setCurrentView('grid');
            // }
            setCurrentView('grid');
        }
    }, []);
    const handleCardClick = (title: string | null) => {
        if (title) {
            setFilterType(title);
        } else {
            setFilterType("");
        }
    };
    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {isShowModelQR && <CustomModal isModalOpenProps={isShowModelQR} setModalpopUpFalse={() => {
                setIsShowModelQR(false);
            }} subject={"Genrating QR code ..."} message={<GenrateQRCode url={itemurlQR.current} getTheQRUrl={genratedQrcode} />} />}
            {isPrintQRModelOpent && <PrintQrCode items={ListChemicals} onClickClose={() => setIsPrintQRModelOpent(false)} isAssetQR={false} isChemicalQR={true} manageComponentView={props.manageComponentView} />}
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
            {/* {state.isQRCodeModelOpen &&
            <QrCodeModel hideModel={() => {
                setState(prevState => ({ ...prevState, isQRCodeModelOpen: false }));
            }}
                isModelOpen={state.isQRCodeModelOpen} qrCodeUrl={state.qrCodeUrl} quChemical={state.quChemical} qrDetails={state.qrDetails} />
        } */}
            {state.isQRCodeModelOpen &&
                <PrintQrCode key={keyUpdate} isDetailView={true} items={[state.qrDetails]} onClickClose={() => setState(prevState => ({ ...prevState, isQRCodeModelOpen: false }))} isAssetQR={false} isChemicalQR={true} manageComponentView={props.manageComponentView} />
            }
            {isLoading && <Loader />}
            {state.isDeletedModelOpen && <CustomModal isModalOpenProps={state.isDeletedModelOpen} setModalpopUpFalse={() => setState(prevState => ({ ...prevState, isDeletedModelOpen: false }))} subject={"Delete  Confirmation "} message={<div>Are you sure, you want to delete this record?</div>} yesButtonText="Yes" closeButtonText={"No"} onClickOfYes={onclickdelete} />}
            {state.isUploadFileValidationModelOpen && <CustomeDialog dialogContentProps={state.dialogContentProps} closeText="Close" onClickClose={() => {
                onClickCloseModel();
                setState(prevState => ({ ...prevState, mdlConfigurationFile: [] }));
                setState(prevState => ({ ...prevState, isUploadFileValidationModelOpen: false }));
            }} dialogMessage={state.uploadFileErrorMessage} isDialogOpen={state.isUploadFileValidationModelOpen} />}
            {state.isUploadExcelModelOpen &&
                <CustomModal dialogWidth="900px" isModalOpenProps={state.isUploadExcelModelOpen} setModalpopUpFalse={onClickCloseModel} subject={"Upload"} message={DranAndDrop}
                    closeButtonText={""} />}
            <div className="boxCard">
                <div className="formGroup">

                    <div className="ms-Grid mb-3">
                        <div className="ms-Grid-row">
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                                <h1 className="mainTitle">Chemical Master</h1>
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
                            <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 mb-3">
                                <ChemicalCountCard data={SummaryData} handleCardClick={handleCardClick} />
                            </div>
                            <div className={window.innerWidth > 768 ? "ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2" : "ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 mob-mar-bot"}>
                                <div className="formControl">
                                    <div className="formControl">
                                        {/* <Label className="labelform">  Chemical Name</Label> */}
                                        <ReactDropdown options={chemicalOptions}
                                            defaultOption={selectedChemical}
                                            isMultiSelect={false}
                                            placeholder={'Chemical Name'}
                                            onChange={_onChemicalChange}
                                        />
                                    </div>

                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2">
                                <div className="formControl">
                                    {/* <Label className="labelform"> Manufacturer</Label> */}
                                    <ReactDropdown options={manufacturerOptions}
                                        defaultOption={selectedManufacturer}
                                        isMultiSelect={false}
                                        placeholder={'Manufacturer'}
                                        onChange={_onManufacturerChange}
                                    />
                                </div>
                            </div>

                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2">
                                <div className="formControl">
                                    {/* <Label className="labelform"> Hazardous</Label> */}
                                    <ReactDropdown options={hazardousOptions}
                                        defaultOption={selectedHazardous}
                                        isMultiSelect={false}
                                        placeholder={'Hazardous'}
                                        onChange={_onHazardousChange}
                                    />
                                </div>
                            </div>
                            <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 p-0">
                                <div className="formControl ">
                                    <DateRangeFilter
                                        fromDate={fromDate}
                                        toDate={toDate}
                                        onFromDateChange={onChangeFromDate}
                                        onToDateChange={onChangeToDate}
                                        onChangeRangeOption={onChangeRangeOption}
                                    />
                                </div>
                            </div>
                            {/* <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg4  ms-xl2 ">
                                <div className="formControl">
                                    <CommonGridView onViewChange={handleViewChange} defaultView={props.view} />
                                </div>
                            </div> */}
                            {false && <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg1">
                                <PrimaryButton className="btnSearch btn btn-primary" onClick={() => _onClickSearch()} text="Search" />
                            </div>}


                        </div>
                    </div >
                    {currentView === "grid" ? <>
                        <MemoizedDetailList
                            manageComponentView={props.manageComponentView}
                            columns={listColumnsNames}
                            items={ListChemicals || []}
                            reRenderComponent={true}
                            onSelectedItem={_onItemSelected}
                            searchable={true}
                            CustomselectionMode={SelectionMode.multiple}
                            isAddNew={true}
                            onItemInvoked={_onItemInvoked}
                            _onSearchTextChangeForExcel={_onSearchTextChangeForExcel}
                            addEDButton={isDisplayEDbtn && <>
                                <div className='dflex'>

                                    {isDisplayEditButtonview && <Link className="actionBtn iconSize btnEdit " onClick={onclickEdit}>
                                        <TooltipHost content={"Edit Detail"} id={tooltipId}>
                                            <FontAwesomeIcon icon="edit" />
                                        </TooltipHost>
                                    </Link>}
                                    <Link className="actionBtn iconSize btnDanger  ml-10" onClick={() => setState(prevState => ({ ...prevState, isDeletedModelOpen: true, deleteItemId: UpdateItem?.ID }))}>
                                        <TooltipHost content={"Delete"} id={tooltipId}>
                                            <FontAwesomeIcon icon="trash-alt" />
                                        </TooltipHost>
                                    </Link>
                                </div>
                                {/* <PrimaryButton className="btn btn-primary" onClick={onclickEdit} text="Edit" />
                        <PrimaryButton className="btn btn-danger ml-10"
                            onClick={() => setState(prevState => ({ ...prevState, isDeletedModelOpen: true, deleteItemId: UpdateItem.ID }))} text="Delete" /> */}

                            </>}
                            addNewContent={
                                <div className="dflex"> {(!!allDataForExcel && allDataForExcel.length > 0) &&
                                    <Link className="actionBtn iconSize btnEdit " style={{ paddingBottom: "2px" }} onClick={onclickExportToExcel}
                                        text="">
                                        <TooltipHost
                                            content={"Export to excel"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon
                                                icon={"file-excel"}
                                            />
                                        </TooltipHost>  </Link>
                                }

                                    {downloadDisable ?
                                        <Link className="actionBtn iconSize btnDanger  ml-10 disable" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                            text="">
                                            <TooltipHost
                                                content={"Sample Excel File Not Available"}
                                                id={tooltipId}
                                            >
                                                <FontAwesomeIcon
                                                    icon={"download"}
                                                />
                                            </TooltipHost>    </Link> :

                                        <Link className="actionBtn iconSize btnMove  ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                            text="">
                                            <TooltipHost
                                                content={"Download Sample Excel File"}
                                                id={tooltipId}
                                            >
                                                <FontAwesomeIcon
                                                    icon={"download"}
                                                />
                                            </TooltipHost></Link>
                                    }

                                    <Link className="actionBtn iconSize btnDanger  ml-10" style={{ paddingBottom: "2px" }} onClick={onclickUpload}
                                        text="">
                                        <TooltipHost
                                            content={"Upload Excel File"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon
                                                icon={"upload"} />
                                        </TooltipHost>    </Link>



                                    <Link className="actionBtn iconSize btnInfo  ml-10 dticon" style={{ paddingBottom: "2px" }} onClick={() => setIsPrintQRModelOpent(true)}
                                        text="">
                                        <TooltipHost
                                            content={"Print QR Code"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon
                                                icon={"print"}
                                            />
                                        </TooltipHost></Link>
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
                                        content={"Add New Associate Chemical"}
                                        id={tooltipId}
                                    >
                                        <PrimaryButton text="Add" className="btn btn-primary " onClick={() => {
                                            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                            breadCrumItems.push({ text: "Add Form", key: "Add Form", currentCompomnetName: ComponentNameEnum.AddNewChemical, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewChemical, isAddNewSite: true, breadCrumItems: breadCrumItems } });
                                            props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewChemical, isAddNewSite: true, IsMasterChemical: props.IsMasterChemical, breadCrumItems: breadCrumItems });
                                            setIsLoading(false);
                                        }} />
                                    </TooltipHost>
                                    <div className="grid-list-view">
                                        <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`}
                                            onClick={() => setCurrentView("grid")}>
                                            <TooltipHost content={"List View"} id={tooltipId}>
                                                <FontAwesomeIcon icon="list" />
                                            </TooltipHost>
                                        </Link>
                                        <Link
                                            className={`grid-list-btn ${currentView !== "grid" ? "active" : ""}`}
                                            onClick={() => setCurrentView("card")}>
                                            <TooltipHost content={"Card View"} id={tooltipId}>
                                                <FontAwesomeIcon icon="th" />
                                            </TooltipHost>
                                        </Link>
                                    </div>
                                </div>} />
                    </> :
                        <>

                            <div className="dflex btn-back-ml icon-Shift-Right">
                                {(!!allDataForExcel && allDataForExcel.length > 0) &&
                                    <Link className="actionBtn iconSize btnEdit " style={{ paddingBottom: "2px", marginLeft: "10px" }} onClick={onclickExportToExcel}
                                        text="">
                                        <TooltipHost
                                            content={"Export to excel"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon
                                                icon={"file-excel"}
                                            />
                                        </TooltipHost>  </Link>
                                }

                                {downloadDisable ?
                                    <Link className="actionBtn iconSize btnDanger  ml-10 disable" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                        text="">
                                        <TooltipHost
                                            content={"Sample Excel File Not Available"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon
                                                icon={"download"}
                                            />
                                        </TooltipHost>    </Link> :

                                    <Link className="actionBtn iconSize btnMove  ml-10" disabled={downloadDisable} style={{ paddingBottom: "2px" }} onClick={onclickDownload}
                                        text="">
                                        <TooltipHost
                                            content={"Download Sample Excel File"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon
                                                icon={"download"}
                                            />
                                        </TooltipHost></Link>
                                }

                                <Link className="actionBtn iconSize btnDanger  ml-10" style={{ paddingBottom: "2px" }} onClick={onclickUpload}
                                    text="">
                                    <TooltipHost
                                        content={"Upload Excel File"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon
                                            icon={"upload"} />
                                    </TooltipHost>    </Link>



                                <Link className="actionBtn iconSize btnInfo  ml-10 dticon" style={{ paddingBottom: "2px" }} onClick={() => setIsPrintQRModelOpent(true)}
                                    text="">
                                    <TooltipHost
                                        content={"Print QR Code"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon
                                            icon={"print"}
                                        />
                                    </TooltipHost></Link>
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
                                    content={"Add New Associate Chemical"}
                                    id={tooltipId}
                                >
                                    <PrimaryButton text="Add" className="btn btn-primary " onClick={() => {
                                        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                                        breadCrumItems.push({ text: "Add Form", key: "Add Form", currentCompomnetName: ComponentNameEnum.AddNewChemical, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.AddNewChemical, isAddNewSite: true, breadCrumItems: breadCrumItems } });
                                        props.manageComponentView({ currentComponentName: ComponentNameEnum.AddNewChemical, isAddNewSite: true, breadCrumItems: breadCrumItems });
                                        setIsLoading(false);
                                    }} />
                                </TooltipHost>
                                <div className="grid-list-view">
                                    <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`}
                                        onClick={() => setCurrentView("grid")}>
                                        <TooltipHost content={"List View"} id={tooltipId}>
                                            <FontAwesomeIcon icon="list" />
                                        </TooltipHost>
                                    </Link>
                                    <Link
                                        className={`grid-list-btn ${currentView !== "grid" ? "active" : ""}`}
                                        onClick={() => setCurrentView("card")}>
                                        <TooltipHost content={"Card View"} id={tooltipId}>
                                            <FontAwesomeIcon icon="th" />
                                        </TooltipHost>
                                    </Link>
                                </div>
                            </div>
                            <ChemicalCardView
                                _onclickDetailsView={_onclickDetailsView}
                                items={ListChemicals}
                                manageComponentView={props.manageComponentView}
                                setState={setState}
                                setKeyUpdate={setKeyUpdate}
                                setFileURL={setFileURL} // Pass setFileURL function
                                openModal={openModal} // Pass openModal function
                                isEdit={true}
                                sitenameid={1}
                                isDelete={true}
                                _onclickEdit={onclickEdit} _onclickconfirmdelete={function (itemID: any): void {
                                    throw new Error("Function not implemented.");
                                }} />
                        </>
                    }

                </div >
            </div >

            {/* <Panel
                isOpen={showModal}
                onDismiss={() => closeModal()}
                type={PanelType.extraLarge}
                headerText="Document View"
            >
                <iframe src={fileURL} style={{ width: "100%", height: "90vh" }} />
            </Panel> */}
            <Panel
                isOpen={showModal}
                onDismiss={() => setShowModal(false)}
                type={PanelType.extraLarge}
                headerText="Document View"
            >
                {fileURL && (
                    <iframe src={fileURL} style={{ width: "100%", height: "90vh", border: "none" }} />
                )}
            </Panel>

        </>;
    }
};