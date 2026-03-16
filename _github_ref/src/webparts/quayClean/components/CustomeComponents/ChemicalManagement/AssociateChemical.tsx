/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { IQuayCleanState } from "../../QuayClean";
import { ListNames, defaultValues, ComponentNameEnum, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import {
    getConvertedDate, getErrorMessageValue, logGenerator,
    onBreadcrumbItemClicked, scrollFunction, generateAndSaveKendoPDF,
    UserActivityLog,
    getStateBySiteId,
    _isExpired,
    _isWithinNextMonthRange,
    generateExcelTable,
    mapSingleValue
} from "../../../../../Common/Util";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { Dialog, DialogFooter, DialogType, IDropdownOption, Link, Panel, PanelType, PrimaryButton, SelectionMode } from "office-ui-fabric-react";
import { AssociateChemicalDialog } from "./AssociateChemicalDialog";
import { Loader } from "../../CommonComponents/Loader";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { DateRangeFilter } from "../../../../../Common/Filter/DateRangeFilter";
import CustomModal from "../../CommonComponents/CustomModal";
import { DefaultButton, IContextualMenuProps, TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import moment from "moment";
import { ActionMeta } from "react-select";
import { ReactDropdown } from "../../CommonComponents/ReactDropdown";
import { PrintQrCode } from "../QRCode/PrintQrCode";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import CommonPopup from "../../CommonComponents/CommonSendEmailPopup";
import { toastService } from "../../../../../Common/ToastService";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import PdfGenerateChemical from "../../CommonComponents/ChemicalPDF/PdfGenerateChemical";
import { EMessageType } from "../../../../../Interfaces/MessageType";
import { ShowMessage } from "../../CommonComponents/ShowMessage";
import { appGlobalStateAtom, appSiteStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import { useAtomValue } from "jotai";
import { ChemicalCountCard } from "./ChemicalCountCard";
import { ChemicalCardView } from "./ChemicalCardView";
import { LazyLoadImage } from "react-lazy-load-image-component";
import 'react-lazy-load-image-component/src/effects/blur.css';
import { MultipleSiteFilter } from "../../../../../Common/Filter/MultipleSiteFilter";
import { DataType, DateFormat, MicrosoftOfficeDocumentType } from "../../../../../Common/Constants/CommonConstants";
import { _getAllSDSDocuments, _getDocumentData } from "../../CommonComponents/CommonMethods";
import { IExportColumns } from "../EquipmentChecklist/Question";
import CamlBuilder from "camljs";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');
const imgLogo = require('../../../../quayClean/assets/images/qc_logo.png');

export interface IAssociateChemicalProps {
    siteNameId: any;
    manageComponentView(componentProp: IQuayCleanState): any;
    URL?: string;
    qcState?: any;
    siteName: any;
    qCState?: any;
    dataObj?: any;
    IsSupervisor?: boolean;
    loginUserRoleDetails?: any;
    breadCrumItems: any[];
    originalSiteMasterId?: any;
    componentProps?: any;
    view?: any;
}
const dialogContentProps = {
    type: DialogType.normal,
    title: "Warning Message",
    closeButtonAriaLabel: "Close",
    subText: "Please Select Date Range!!",
};

export interface IAssociateChemicalState {
    isReload: boolean;
    isQRCodeModelOpen: boolean;
    qrCodeUrl: string;
    qrDetails: string;
    quChemical: string;
    isPrintSettingDialogOpen: boolean;
    finalSelectedPrintOptions: string[];
    selectedPrintOptions: string[];
    siteModuleConfiguration: any;
    isReloadPrint: boolean
}

export const AssociateChemical = (props: IAssociateChemicalProps) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const appSiteState = useAtomValue(appSiteStateAtom);
    const { PermissionArray } = appSiteState;
    const [state, setState] = React.useState<IAssociateChemicalState>({
        isReload: false,
        isQRCodeModelOpen: false,
        qrCodeUrl: "",
        qrDetails: "",
        quChemical: "",
        isPrintSettingDialogOpen: false,
        finalSelectedPrintOptions: [],
        selectedPrintOptions: [],
        siteModuleConfiguration: "",
        isReloadPrint: false
    });
    const [ListAssocitedChemical, setListAssocitedChemical] = React.useState<any>([]);
    const [AssociatedFilterData, setAssociatedFilterData] = React.useState<any>([]);
    const [DeleteId, setDeleteId] = React.useState<any>();
    const [columnsAssocitedChemical, setcolumnsAssocitedChemical] = React.useState<any>([]);
    const [isShowAssetHistoryModel, setisShowAssetHistoryModel] = React.useState<boolean>(false);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [URL, setURL] = React.useState<any>();
    const [isDisplayEDbtn, setisDisplayEDbtn] = React.useState<boolean>(false);
    const [isStateAvailable, setisStateAvailable] = React.useState<boolean>(true);
    const [selectedChemical, setSelectedChemical] = React.useState<any>("");
    const [, setListChemical] = React.useState<any>([]);
    const [AssocitedChemicalArray, setAssocitedChemicalArray] = React.useState<any>([]);
    const [finalObj, setfinalObj] = React.useState<any[]>([]);
    const [fromDate, setFromDate] = React.useState<Date | any>();
    const [toDate, setToDate] = React.useState<Date | any>();
    const [filterFromDate, setFilterFromDate] = React.useState<any>(undefined);
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);
    const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: '', text: 'select' });
    const [hideDialog, { toggle: toggleHideDialog }] = useBoolean(true);
    const [hideDialogdelete, { toggle: toggleHideDialogdelete }] = useBoolean(false);
    const [lblAll, setlblAll] = React.useState<boolean>(false);
    const [isDisplayFilterDialog, setisDisplayFilterDialog] = React.useState<boolean>(false);
    const tooltipId = useId('tooltip');
    const [defaultChemical, setDefaultChemical] = React.useState<any>();
    const [ChemicalOptions, setChemicalOptions] = React.useState<IDropdownOption[]>();
    const [updateDropDown, setupdateDropDown] = React.useState<boolean>(true);
    const [keyUpdate, setKeyUpdate] = React.useState<number>(Math.random());
    const [isPrintQRModelOpent, setIsPrintQRModelOpent] = React.useState<boolean>(false);
    const [fileURL, setFileURL] = React.useState<string>('');
    const [showModal, setShowModal] = React.useState(false);
    const isVisibleCrud = React.useRef<boolean>(false);
    const openModal = () => { setShowModal(true); };
    const closeModal = () => { setShowModal(false); };
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [title, setTitle] = React.useState<string>("");
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
    const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
    const [displayerror, setDisplayError] = React.useState<boolean>(false);
    const [error, setError] = React.useState<Error>((undefined as unknown) as Error);
    const [hasError, sethasError] = React.useState<boolean>(false);
    const [filterType, setFilterType] = React.useState<any>(""); // Manage filter type state
    const [SummaryData, setSummaryData] = React.useState<any>([]);
    const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : 'grid');
    const [allDataForExcel, setDataForExcel] = React.useState<any>([]);
    const [selectedSiteIds, setSelectedSiteIds] = React.useState<any[]>([]);
    const [selectedSiteTitles, setSelectedSiteTitles] = React.useState<string[]>([]);
    const [selectedSCSites, setSelectedSCSites] = React.useState<string[]>([]);
    const [selectedCardItems, setSelectedCardItems] = React.useState<any[]>([]);
    const [isSelectedData, setisSelectedData] = React.useState<boolean>(false);
    const [isPdfGenerating, setIsPdfGenerating] = React.useState(false);
    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSiteIds(siteIds);
        setSelectedSiteTitles(siteTitles);
        setSelectedSCSites(siteSC);
    };

    const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setTitle(newValue || "");
        if (newValue) {
            setDisplayErrorTitle(false);
        }
    };
    const handleViewChange = (view: string) => {
        setCurrentView(view);
        setisSelectedData(false);
        setSelectedCardItems([]);
    };
    const onChangeSendToEmail = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setSendToEmail(newValue || "");
        if (newValue) {
            setDisplayErrorEmail(false);
            setDisplayErrorEmail(false);
        }

        const enteredValue = newValue;
        const emailPattern = /^([^\s@]+@[^\s@]+\.[^\s@]+)(\s*;\s*[^\s@]+@[^\s@]+\.[^\s@]+)*$/;

        if (!enteredValue || emailPattern.test(enteredValue)) {
            setDisplayError(false);
        } else {
            setDisplayError(true);
        }
    };
    const onClickDownloadPDF = async (): Promise<void> => {
        setIsLoading(true);
        setIsPdfGenerating(true);
        const fileName = `${props?.siteName ?? 'Master'} Chemicals`;

        try {
            let fileblob: any = await generateAndSaveKendoPDF("pdfGenerateChemical", fileName)
            const url = window.URL.createObjectURL(fileblob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${fileName}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            console.log("PDF downloaded successfully!");
        } catch (err) {
            console.error("Error downloading PDF:", err);
        } finally {
            setIsLoading(false);
            setIsPdfGenerating(false);
        }
    };

    const onClickSendEmail = async (): Promise<void> => {
        setIsLoading(true);
        const isTitleEmpty = !title;
        const isEmailEmpty = !sendToEmail;
        const isEmailInvalid = !isEmailEmpty && !sendToEmail?.split(';').every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));
        setDisplayErrorTitle(isTitleEmpty);
        setDisplayErrorEmail(isEmailEmpty);
        setDisplayError(isEmailInvalid);

        if (!isTitleEmpty && !isEmailEmpty && !isEmailInvalid) {
            const fileName = `${props?.siteName ?? 'Master'} Chemicals`;

            let fileblob: any = await generateAndSaveKendoPDF("pdfGenerateChemical", fileName);

            const file: IFileWithBlob = {
                file: fileblob,
                name: `${fileName}.pdf`,
                overwrite: true
            };
            let toastMessage: string = "";
            const toastId = toastService.loading('Loading...');
            toastMessage = 'Email sent successfully!';
            let insertData: any = {
                Title: title,
                SendToEmail: sendToEmail,
                StateName: props?.qCState || "All States",
                SiteName: props?.siteName || "All Sites",
                EmailType: "Chemical"
            };
            provider.createItem(insertData, ListNames.SendEmailTempList).then((item: any) => {
                provider.uploadAttachmentToList(ListNames.SendEmailTempList, file, item.data.Id).then(() => {
                    console.log("Upload Success");
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: props.siteNameId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.SendEmail,
                        EntityType: UserActionEntityTypeEnum.AssociateChemical,
                        // EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        EntityName: title, // Match index dynamically
                        Details: `Send Email Associate Chemical to ${sendToEmail}`
                    };
                    void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
                }).catch(err => console.log(err));
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                onClickCancel();
                setIsLoading(false);
            }).catch(err => console.log(err));
        }
    };

    const onclickSendEmail = () => {
        showPopup();
    };

    const onClickCancel = (): void => {
        resetForm();
        hidePopup();
    };

    const resetForm = (): void => {
        setTitle("");
        setSendToEmail("");
        setDisplayErrorTitle(false);
        setDisplayErrorEmail(false);
        setDisplayError(false);
    };

    const onclickconfirmdelete = (predata: any) => {
        let data: any[] = [];
        if (!!predata?.ID) {
            data.push(predata);
        }
        if (!!data && data.length > 0)
            setDeleteId(data);
        toggleHideDialogdelete();
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

    const _onChemicalChange = (option: any, actionMeta: ActionMeta<any>): void => {
        setSelectedChemical(option?.text);
        setDefaultChemical(option?.value);
        if (option.label == " --All Chemical--") {
            setlblAll(true);
        }
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

    const onClickPrintConfigurationOpen = () => {
        setState((prevState) => ({ ...prevState, isPrintSettingDialogOpen: true }));
    }


    const getSiteModuleConfiguration = async () => {
        let item: any = ""
        if (props.siteNameId) {
            const camlQuery = new CamlBuilder()
                .View(["ID", "Title", "ConfigurationJson", "SiteName"])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .RowLimit(5000, true)
                .Query()
                .Where()
                .TextField('Title').EqualTo("EquipmentChemicalQR")
                .And()
                .LookupField('SiteName').Id().EqualTo(props.siteNameId)
                .ToString()

            let data = await provider.getItemsByCAMLQuery(ListNames.SiteModuleConfiguration, camlQuery);
            if (!!data && data.length > 0) {
                let element = data[0];
                item = {
                    ID: mapSingleValue(element.ID, DataType.number),
                    Title: mapSingleValue(element.Title, DataType.string),
                    ConfigurationJson: mapSingleValue(element.ConfigurationJson, DataType.JsonParse),

                }

            }
        }
        return item;
    }

    React.useEffect(() => {
        (async () => {
            try {
                const siteModuleConfiguration = await getSiteModuleConfiguration();
                if (!!siteModuleConfiguration && !!siteModuleConfiguration?.ID) {
                    let selectedPrintOptions = (!!siteModuleConfiguration.ConfigurationJson) ? siteModuleConfiguration.ConfigurationJson : state.selectedPrintOptions
                    setState((prevState) => ({
                        ...prevState, siteModuleConfiguration:
                            siteModuleConfiguration,
                        selectedPrintOptions: selectedPrintOptions,
                        finalSelectedPrintOptions: selectedPrintOptions
                    }))

                }
            } catch (error) {
                console.log(error);

            }
        })()

    }, [state.isReloadPrint]);

    React.useEffect(() => {
        const filterList = () => {
            let filteredList = ListAssocitedChemical;
            if (filterType === 'Expired Chemicals') {
                filteredList = ListAssocitedChemical.filter((item: any) => _isExpired(item.FullExpirationDate));
            } else if (filterType === 'Expiry in 1 Month') {
                filteredList = ListAssocitedChemical.filter((item: any) => _isWithinNextMonthRange(item.FullExpirationDate));
            } else if (filterType === 'Hazardous') {
                filteredList = ListAssocitedChemical.filter((x: any) => x.Hazardous.toString().trim().toLowerCase() === "yes");
            } else if (filterType === 'Non Hazardous') {
                filteredList = ListAssocitedChemical.filter((x: any) => x.Hazardous.toString().trim().toLowerCase() === "no");
            }

            setAssociatedFilterData(filteredList); // Set filtered data to state
            setIsLoading(false);
            setDataForExcel(filteredList);
        };
        setIsLoading(true);
        filterList();
    }, [ListAssocitedChemical, filterType]);


    const onclickExportToExcel = async () => {
        setIsLoading(true);
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
                    key: "HazClassCommaSeprate"
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
                    header: "SDS",
                    key: "SDS"
                },
                // {
                //     header: "Product Photo",
                //     key: "ProductPhoto"
                // }
            ];
            generateExcelTable(selectedCardItems.length > 0 ? selectedCardItems : !!isSelectedData ? DeleteId : AssociatedFilterData, exportColumns, `${props?.siteName} - Chemical.xlsx`);
            setTimeout(() => {
                setIsLoading(false);
            }, 1000);
        } catch (error) {
            const errorObj = { ErrorMethodName: "onclickExportToExcel", CustomErrormessage: "error in download", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
        }
    };

    const _onSearchTextChangeForExcel = (data: any) => {
        setDataForExcel(data);
    };
    const _ChemicalMaster = (ACArray: any[]) => {
        setfinalObj([]);
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
        if (!!selectedChemical) {
            updatedd = false;
            filterArray.push(`Title eq '${selectedChemical}'`);
        }
        if (filterDateArray.length > 0 && filterArray.length > 0) {
            if (filter != "")
                filter = filter + " and (" + filterDateArray + " and (" + filterArray?.join(" and ") + "))";
            else
                filter = filterDateArray + " and (" + filterArray?.join(" and ") + ")";
        } else if (filterDateArray.length > 0) {
            if (filter != "")
                filter = filter + " and (" + filterDateArray[0] + ")";
            else
                filter = filterDateArray[0];
        } else if (filterArray.length > 0) {
            if (filter != "")
                filter = filter + " and (" + filterArray?.join(" and ") + ")";
            else
                filter = filterArray?.join(" and ");
        } else {
            // eslint-disable-next-line no-self-assign
            filter = filter;
        }
        let oneMonthDate = moment(new Date()).add(29, 'day').format(defaultValues.FilterDateFormate) + "T23:59:59Z";
        let threeMonthDate = moment(new Date()).add(60, 'day').format(defaultValues.FilterDateFormate) + "T23:59:59Z";
        try {
            const select = ["ID,Title,Manufacturer,SDSDate,QRCode,Hazardous,HazClass,StorageRequest,pH,SiteNameId,SiteName/Title,StorageClass,SDS,PPERequired,QCNotes,NumberOfItems,ExpirationDate,SDSDocument,ProductPhoto,ProductPhotoThumbnailUrl,IsSDSDocument"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                filter: filter,
                expand: ["SiteName"],
                listName: ListNames.ChemicalRegistration,
            };
            provider.getItemsByQuery(queryStringOptions).then(async (results: any[]) => {
                if (!!results) {
                    const allSDSDocuments = await _getAllSDSDocuments(provider);
                    const ListData = await Promise.all(results.map(async (data) => {
                        const fixImgURL = '/sites/Quayclean/Lists/ChemicalRegistration/Attachments/' + data.ID + "/";
                        const fixImgURL1 = context.pageContext.web.serverRelativeUrl + '/Lists/ChemicalRegistration/Attachments/' + data.ID + "/";
                        let QRCodeUrl: string = '';
                        let productPhotoURL;

                        // 📸 Product Photo
                        if (data?.ProductPhoto) {
                            try {
                                const productPhotoData = JSON?.parse(data?.ProductPhoto);
                                if (productPhotoData && productPhotoData?.serverRelativeUrl) {
                                    productPhotoURL = productPhotoData?.serverRelativeUrl;
                                } else if (productPhotoData && productPhotoData?.fileName) {
                                    productPhotoURL = fixImgURL + productPhotoData?.fileName;
                                } else {
                                    productPhotoURL = notFoundImage;
                                }
                            } catch {
                                productPhotoURL = notFoundImage;
                            }
                        } else {
                            productPhotoURL = notFoundImage;
                        }

                        // 📷 QR Code
                        if (data.QRCode) {
                            try {
                                const QRCodePhotoData = JSON.parse(data.QRCode);
                                if (QRCodePhotoData && QRCodePhotoData.serverRelativeUrl) {
                                    QRCodeUrl = QRCodePhotoData.serverRelativeUrl;
                                } else if (QRCodePhotoData && QRCodePhotoData.fileName) {
                                    QRCodeUrl = fixImgURL1 + QRCodePhotoData.fileName;
                                } else {
                                    QRCodeUrl = notFoundImage;
                                }
                            } catch {
                                QRCodeUrl = notFoundImage;
                            }
                        } else {
                            QRCodeUrl = notFoundImage;
                        }

                        // 📅 Dates
                        const compareDate = data.ExpirationDate ? moment(data.ExpirationDate).format(defaultValues.FilterDateFormate) + "T18:00:00Z" : null;
                        const formattedSDSDate = data.SDSDate ? moment(data.SDSDate).format(DateFormat) : null;

                        // 📄 Build SDS URL
                        let sdsURLParts: string[] = [];
                        const sdsFieldValue = data?.SDS ? data?.SDS.Url ?? "" : "";
                        if (sdsFieldValue) {
                            sdsURLParts.push(sdsFieldValue);
                        }

                        // Merge with document links if IsSDSDocument === "Yes"
                        // if (data.IsSDSDocument) {
                        //     // const documentdata = await _getDocumentData(data.ID, provider);
                        //     if (allSDSDocuments && allSDSDocuments.length > 0) {
                        //         for (const fileData of allSDSDocuments) {
                        //             if (fileData?.FileRef) {
                        //                 const filePath: string = fileData.FileRef;
                        //                 const fileType = filePath.split('.').pop();
                        //                 const embedFullFilePath = `${context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${filePath}&action=embedview`;

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
                        let sdsURL = sdsURLParts.join(", ");
                        return {
                            ID: data.ID,
                            Title: !!data.Title ? data.Title : "",
                            SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                            ExpirationDate: !!data.ExpirationDate ? getConvertedDate(data.ExpirationDate) : "",
                            compareDate: !!compareDate ? compareDate : "",
                            FullExpirationDate: !!data.ExpirationDate ? data.ExpirationDate : "",
                            pH: !!data.pH ? data.pH : "",
                            Hazardous: !!data.Hazardous ? data.Hazardous : "no",
                            Photo: productPhotoURL,
                            QRCodeUrl: QRCodeUrl,
                            SerialNumber: data.QCNotes,
                            ProductPhotoThumbnailUrl: !!data.ProductPhotoThumbnailUrl ? data.ProductPhotoThumbnailUrl : notFoundImage,
                            Manufacturer: data?.Manufacturer,
                            SDSDate: formattedSDSDate,
                            SDSDateUpdate: data?.SDSDate,
                            HazClass: data?.HazClass,
                            HazClassCommaSeprate: !!data?.HazClass ? data?.HazClass?.join(', ') : [],
                            StorageRequest: data?.StorageRequest,
                            SDS: sdsURL,
                            PPERequired: data?.PPERequired,
                            ProductPhoto: productPhotoURL,
                        };
                    }));

                    setListChemical(ListData);
                    setfinalObj([]);

                    for (let i = 0; i < ACArray.length; i++) {
                        for (let j = 0; j < ListData.length; j++) {
                            if (ListData[j].ID === ACArray[i].ChemicalsId) {
                                finalObj.push({
                                    ...ListData[j],
                                    SiteName: ACArray[i].SiteName,
                                    SiteNameId: ACArray[i].SiteNameId,
                                    AID: ACArray[i].AID,
                                });
                            }
                        }
                    }

                    if (updateDropDown || updatedd === true) {
                        let dropvalue: any = [];
                        dropvalue.push({ key: '', text: '', value: 'All', label: " --All Chemical--" });
                        finalObj.map((Chemical: any) => {
                            dropvalue.push({
                                value: Chemical.ID,
                                key: Chemical.ID,
                                text: Chemical.Title,
                                label: Chemical.Title
                            });
                        });
                        setChemicalOptions(dropvalue);
                        setupdateDropDown(false);
                    }

                    const DataWithRecord = finalObj.map((item, index) => ({
                        ...item,
                        DID: ACArray[index],
                    }));

                    let filteredData: any[];
                    if (!!props.siteNameId || currentUserRoleDetail?.isAdmin) {
                        filteredData = DataWithRecord;
                    } else {
                        let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                        filteredData = DataWithRecord.filter(item =>
                            AllSiteIds.length > 0 && AllSiteIds.includes(item.SiteNameId)
                        );
                    }

                    const summaryData = getChemicalSummary(filteredData);
                    setSummaryData(summaryData);
                    setListAssocitedChemical(filteredData);

                }

                // if (!!results) {
                //     const ListData = results.map((data) => {
                //         const fixImgURL = '/sites/Quayclean/Lists/ChemicalRegistration/Attachments/' + data.ID + "/";
                //         const fixImgURL1 = context.pageContext.web.serverRelativeUrl + '/Lists/ChemicalRegistration/Attachments/' + data.ID + "/";
                //         let QRCodeUrl: string = '';
                //         let productPhotoURL;
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
                //         if (data.QRCode) {
                //             try {
                //                 const QRCodePhotoData = JSON.parse(data.QRCode);
                //                 if (QRCodePhotoData && QRCodePhotoData.serverRelativeUrl) {
                //                     QRCodeUrl = QRCodePhotoData.serverRelativeUrl;
                //                 } else if (QRCodePhotoData && QRCodePhotoData.fileName) {
                //                     QRCodeUrl = fixImgURL1 + QRCodePhotoData.fileName;
                //                 } else {
                //                     QRCodeUrl = notFoundImage;
                //                 }
                //             } catch (error) {
                //                 console.error("Error parsing QRCodePhotoData JSON:", error);
                //                 QRCodeUrl = notFoundImage;
                //             }
                //         } else {
                //             QRCodeUrl = notFoundImage;
                //         }


                //         const compareDate = data.ExpirationDate ? moment(data.ExpirationDate).format(defaultValues.FilterDateFormate) + "T18:00:00Z" : null;
                //         const formattedSDSDate = data.SDSDate ? moment(data.SDSDate).format(DateFormat) : null;
                //         return (
                //             {
                //                 ID: data.ID,
                //                 Title: !!data.Title ? data.Title : "",
                //                 SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                //                 ExpirationDate: !!data.ExpirationDate ? getConvertedDate(data.ExpirationDate) : "",
                //                 compareDate: !!compareDate ? compareDate : "",
                //                 FullExpirationDate: !!data.ExpirationDate ? data.ExpirationDate : "",
                //                 pH: !!data.pH ? data.pH : "",
                //                 Hazardous: !!data.Hazardous ? data.Hazardous : "no",
                //                 Photo: productPhotoURL,
                //                 QRCodeUrl: QRCodeUrl,
                //                 SerialNumber: data.QCNotes,
                //                 ProductPhotoThumbnailUrl: !!data.ProductPhotoThumbnailUrl ? data.ProductPhotoThumbnailUrl : notFoundImage,
                //                 Manufacturer: data?.Manufacturer,
                //                 SDSDate: formattedSDSDate,
                //                 SDSDateUpdate: data?.SDSDate,
                //                 HazClass: data?.HazClass,
                //                 StorageRequest: data?.StorageRequest,
                //                 SDS: data.SDS ? data.SDS.Url : "",
                //                 PPERequired: data?.PPERequired,
                //                 ProductPhoto: productPhotoURL,
                //             }
                //         );
                //     });

                //     setListChemical(ListData);
                //     setfinalObj([]);

                //     for (let i = 0; i < ACArray.length; i++) {
                //         for (let j = 0; j < ListData.length; j++) {
                //             if (ListData[j].ID === ACArray[i].ChemicalsId) {
                //                 // Clone the ListData object and add the SiteName from ACArray
                //                 finalObj.push({
                //                     ...ListData[j],  // Spread the properties of the matched ListData item
                //                     SiteName: ACArray[i].SiteName,
                //                     SiteNameId: ACArray[i].SiteNameId,
                //                     AID: ACArray[i].AID,  // Add the SiteName from ACArray
                //                 });
                //             }
                //         }
                //     }

                //     if (updateDropDown || updatedd === true) {
                //         let dropvalue: any = [];
                //         dropvalue.push({ key: '', text: '', value: 'All', label: " --All Chemical--" });
                //         finalObj.map((Chemical: any, index) => {
                //             dropvalue.push({
                //                 value: Chemical.ID,
                //                 key: Chemical.ID,
                //                 text: Chemical.Title,
                //                 label: Chemical.Title
                //             });
                //         });
                //         setChemicalOptions(dropvalue);
                //         setupdateDropDown(false);
                //     }
                //     const DataWithRecord = finalObj.map((item, index) => ({
                //         ...item,
                //         DID: ACArray[index],
                //     }));

                //     let filteredData: any[];
                //     if (!!props.siteNameId || currentUserRoleDetail?.isAdmin) {
                //         filteredData = DataWithRecord;
                //     } else {
                //         let AllSiteIds: any[] = currentUserRoleDetail?.currentUserAllCombineSites || [];
                //         filteredData = DataWithRecord.filter(item =>
                //             AllSiteIds.length > 0 && AllSiteIds.includes(item.SiteNameId)
                //         );
                //     }
                //     const summaryData = getChemicalSummary(filteredData);
                //     setSummaryData(summaryData);
                //     setListAssocitedChemical(filteredData);
                // }
            }).catch((error) => {
                const errorObj = { ErrorMethodName: "_ChemicalMaster", CustomErrormessage: "error in get chemical data", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(provider, errorObj);
                setIsLoading(false);
                const errorMessage = getErrorMessageValue(error.message);
                setError(errorMessage);
                sethasError(true);
            });


            let columns: any[] = [
                {
                    key: "key11", name: 'Action', fieldName: 'ID', isResizable: true, minWidth: 50, maxWidth: 100,
                    onRender: ((itemID: any) => {
                        return <>
                            <div className='dflex'>
                                <div>
                                    <Link className="actionBtn btnView dticon" onClick={() => {
                                        _onclickDetailsView(itemID);
                                    }}>
                                        <TooltipHost content={"View Detail"} id={tooltipId}>
                                            <FontAwesomeIcon icon="eye" />
                                        </TooltipHost>
                                    </Link>
                                </div>
                                <div>
                                </div>
                            </div>
                        </>;
                    })
                },
                {
                    key: 'Photo', name: 'Chemical Photo', fieldName: 'ProductPhotoThumbnailUrl', minWidth: 110, maxWidth: 110, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                    onRender: (item: any) => {
                        return (
                            // <img src={item.ProductPhotoThumbnailUrl} height="75px" width="110px" className="course-img-first" />
                            <LazyLoadImage src={item.ProductPhotoThumbnailUrl}
                                width={75} height={110}
                                placeholderSrc={notFoundImage}
                                alt="photo"
                                className="course-img-first"
                                effect="blur"
                            />
                        );
                    }
                },
                {
                    key: 'SiteName', name: 'Site Name', fieldName: 'SiteName', isResizable: true, minWidth: 180, maxWidth: 280, isSortingRequired: true,
                    onRender: (item: any) => {
                        if (item.SiteName != "") {
                            return (
                                <>
                                    <Link className="tooltipcls">
                                        <TooltipHost content={item.SiteName} id={tooltipId}>
                                            {item.SiteName}
                                        </TooltipHost>
                                    </Link>
                                </>
                            );
                        }
                    },
                },
                {
                    key: "key1", name: 'Chemical Name', fieldName: 'Title', isResizable: true, minWidth: 170, maxWidth: 240, isSortingRequired: true,
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
                        if (item.Hazardous.toString().trim().toLowerCase() === "yes") {
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
                { key: "key3", name: 'pH', fieldName: 'pH', isResizable: true, minWidth: 40, maxWidth: 70, isSortingRequired: true },
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
                    key: 'Photo', name: 'QR Code', fieldName: 'QRCodeUrl', minWidth: 90, maxWidth: 90, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                    onRender: (item: any) => {
                        return (
                            <TooltipHost
                                content={"View QR Code"}
                                id={tooltipId}
                            >
                                <div onClick={() => {
                                    setKeyUpdate(Math.random());
                                    setState(prevState => ({ ...prevState, isQRCodeModelOpen: true, quChemical: "Chemical", qrDetails: item, qrCodeUrl: item.QRCodeUrl }));
                                }
                                }>
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
                {
                    key: 'null', name: '', fieldName: '', minWidth: 90, maxWidth: 90, isResizable: false, className: 'courseimg-column', headerClassName: 'courseimg-header',
                },
            ];

            if (!!props.siteNameId) {
                columns = columns.filter(item => item.key != "SiteName")
            }
            setcolumnsAssocitedChemical(columns);

        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_ChemicalMaster", CustomErrormessage: "error in get chemical master", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
            const errorMessage = getErrorMessageValue(error.message);
            setError(errorMessage);
            sethasError(true);
        }
        setIsLoading(false);
    };

    const _onclickDetailsView = (item: any) => {
        setIsLoading(true);
        setTimeout(() => {
            try {
                let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
                breadCrumItems.push({
                    text: item.Title, key: item.Title, currentCompomnetName: ComponentNameEnum.ViewChemicalDetail,
                    onClick: onBreadcrumbItemClicked,
                    manageComponent: props.manageComponentView,
                    manageCompomentItem: {
                        currentComponentName: ComponentNameEnum.ViewChemicalDetail, dataObj: props.dataObj, MasterId: props.siteNameId, siteMasterId: item.ID, siteName: props.siteName,
                        IsSupervisor: props.IsSupervisor, qCState: props.qCState, breadCrumItems: breadCrumItems, pivotName: "EquipmentKey"
                    }
                });
                props.manageComponentView({
                    currentComponentName: ComponentNameEnum.ViewChemicalDetail, dataObj: props.dataObj, siteName: props.siteName, IsSupervisor: props.IsSupervisor,
                    qCState: props.qCState, MasterId: props.siteNameId, siteMasterId: item.ID, breadCrumItems: breadCrumItems, pivotName: "EquipmentKey"
                });
            } catch (error) {
                const errorObj = { ErrorMethodName: "_onclickDetailsView", CustomErrormessage: "error in on click details view", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
                void logGenerator(provider, errorObj);
                setIsLoading(false);
            }
        }, 500);

    };

    const _associatedChemical = (Url: any) => {
        try {
            let custfilter;

            if (selectedSiteIds.length > 0) {
                const filters = selectedSiteIds.map(id => `(SiteNameId eq '${id}')`);
                custfilter = `(${filters.join(' or ')}) and IsDeleted ne 1`;
            } else {
                custfilter = !!props.siteNameId
                    ? `(SiteNameId eq ${props.siteNameId} and IsDeleted ne 1)`
                    : "IsDeleted ne 1";
            }
            const select = ["ID,Title,SiteNameId,ExpirationDate,ChemicalsId,SiteName/Title"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: ["SiteName"],
                filter: custfilter,
                listName: ListNames.SitesAssociatedChemical,
            };
            provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const AssetListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                AID: data.ID,
                                Title: !!data.Title ? data.Title : "",
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                                SiteName: !!data.SiteName ? data.SiteName?.Title : "",
                                ChemicalsId: !!data.ChemicalsId ? data.ChemicalsId : "",
                                ExpirationDate: !!data.ExpirationDate ? getConvertedDate(data.ExpirationDate) : "",
                                pH: !!data.Title ? "pH" : "",
                                Hazardous: !!data.Title ? "Hazardous" : "",
                                Photo: notFoundImage
                            }
                        );
                    });
                    const ACArray = AssetListData.map(item => item.ChemicalsId);
                    setAssocitedChemicalArray(ACArray);
                    _ChemicalMaster(AssetListData);
                    // _ChemicalMaster(ACArray);
                }
            }).catch((error) => {
                console.log(error);
            });
        } catch (ex) {
            console.log(ex);
            const errorObj = { ErrorMethodName: "_associatedChemical", CustomErrormessage: "error in get associate chemical", ErrorMessage: ex.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(provider, errorObj);
            setIsLoading(false);
        }

    };


    const onclickdelete = async () => {
        setIsLoading(true);
        try {
            if (!!DeleteId) {
                const processUpdateItem = (input: any) => {
                    if (Array.isArray(input)) {
                        return input.map(item => ({
                            Id: item.AID,
                            IsDeleted: true
                        }));
                    } else if (typeof input === 'object' && input !== null) {
                        return [{ Id: input.AID, IsDeleted: true }];
                    } else {
                        return [];
                    }
                };
                DeleteId.forEach(async (res: any, index: any) => {
                    const stateId = await getStateBySiteId(provider, Number(DeleteId[index]?.SiteNameId));
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: DeleteId[index]?.SiteNameId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.Delete,
                        EntityType: UserActionEntityTypeEnum.AssociateChemical,
                        EntityId: DeleteId[index]?.ID, // Use res dynamically
                        EntityName: DeleteId[index]?.Title, // Match index dynamically
                        Details: `Delete Associate Chemical`,
                        StateId: stateId,
                    };
                    void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
                });
                const newObjects = processUpdateItem(DeleteId);
                if (newObjects.length > 0) {
                    await provider.updateListItemsInBatchPnP(ListNames.SitesAssociatedChemical, newObjects)
                }
            }
            toggleHideDialogdelete();
            setisDisplayEDbtn(false);
            setIsLoading(false);
            _associatedChemical(URL);
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
            setIsLoading(false);
        }
    };
    const _onClickSearch = (URL: any) => {
        if (!selectedChemical && lblAll === false) {
            setisDisplayFilterDialog(true);
        } else {
            _associatedChemical(URL);
        }
    };

    React.useEffect(() => {
        const className = document.querySelector('ARTICLE')?.children[0].children[0].classList[0];
        let el: any = document.querySelector(!!className ? `.${className}` : "");
        if (!!el) {
            el.onscroll = function () {
                scrollFunction(240);
            };
        }
        let isVisibleCrud1 = (!!PermissionArray && PermissionArray?.includes('Chemical') || currentUserRoleDetail.isStateManager || currentUserRoleDetail.isAdmin || currentUserRoleDetail?.siteManagerItem.filter((r: any) => r.Id == props.siteNameId && r.SiteManagerId?.indexOf(currentUserRoleDetail.Id) > -1).length > 0);
        isVisibleCrud.current = isVisibleCrud1;
    }, []);

    const menuProps: IContextualMenuProps = {
        items: [
            {
                key: "downloadPdf",
                text: "Export PDF",
                iconProps: { iconName: "PDF", style: { color: "#D7504C" } },
                onClick: (ev, item) => { onClickDownloadPDF() },
                // disabled: isPdfGenerating || isLoading,
            },
            {
                key: "exportExcel",
                text: "Export to Excel",
                iconProps: { iconName: "ExcelDocument", style: { color: "orange" } },
                onClick: (ev, item) => { onclickExportToExcel() },
                // disabled: downloadDisable,
            },
        ],
    };

    React.useEffect(() => {
        setIsLoading(true);
        provider._Document("ChemicalQrCode").then(() => {
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

        try {
            const select = ["ID,Title,QCStateId,QCState/Title"];
            const expand = ["QCState"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                filter: !!props.siteNameId ? `ID eq ${props.siteNameId}` : "",
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
                    _associatedChemical(link);
                }
                else {
                    setisStateAvailable(false);
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
            setIsLoading(false);
        }
    }, [props.qCState, state.isReload, selectedChemical, filterToDate, isRefreshGrid, selectedSiteIds]);

    const onClickClose = () => {
        setisShowAssetHistoryModel(false);
        setState(prevState => ({ ...prevState, isReload: !state.isReload }));
    };

    const onClickAssociateChemical = () => {
        setisShowAssetHistoryModel(true);
    };
    const _onItemInvoked = (itemID: any): void => {
        _onclickDetailsView(itemID);
    };

    const _onItemSelected = (item: any): void => {
        if (item.length > 0) {
            setisSelectedData(true)
            setDeleteId(item);
            setisDisplayEDbtn(true);
        } else {
            setisSelectedData(false)
            setDeleteId(0);
            setisDisplayEDbtn(false);
        }
    };
    const onCloseModel = () => {
        setisDisplayFilterDialog(false);
    };

    const onClickPrintConfigSave = async () => {

        try {

            let isEditMode: boolean = (!!state.siteModuleConfiguration && !!state.siteModuleConfiguration?.ID && Number(state.siteModuleConfiguration?.ID)) ? true : false
            const toastId = toastService.loading(isEditMode ? 'Updating Configuration...' : 'Saving Configuration...');
            const toastMessage = isEditMode ? 'Configuration has been updated successfully!' : 'Configuration has been added successfully!';
            setState((prevState) => ({ ...prevState, isLoading: true }));
            let obj = {
                Title: "EquipmentChemicalQR",
                SiteNameId: props.siteNameId,
                ConfigurationJson: JSON.stringify(state.finalSelectedPrintOptions)
            }
            if (isEditMode) {
                await provider.updateItem({ ConfigurationJson: JSON.stringify(state.finalSelectedPrintOptions) }, ListNames.SiteModuleConfiguration, Number(state.siteModuleConfiguration?.ID))
            } else {
                await provider.createItem(obj, ListNames.SiteModuleConfiguration)
            }

            toastService.updateLoadingWithSuccess(toastId, toastMessage);
            setState((prevState) => ({
                ...prevState, isPrintSettingDialogOpen: false, isLoading: false, isReloadPrint: !prevState.isReloadPrint,
                selectedPrintOptions: state.finalSelectedPrintOptions
            }));
        } catch (error) {
            console.log(error);
            setState((prevState) => ({ ...prevState, isPrintSettingDialogOpen: false, isLoading: false, }));
        }

    }

    const onClosePrintConfiguration = () => {
        setState((prevState) => ({ ...prevState, isPrintSettingDialogOpen: false, finalSelectedPrintOptions: state.selectedPrintOptions }));
    }

    const clickPrintOptionButton = (key: string) => {
        const selectedPrintOptions = state.finalSelectedPrintOptions || [];
        let updatedOptions: string[];

        if (selectedPrintOptions.includes(key)) {
            // Remove if present
            updatedOptions = selectedPrintOptions.filter((item) => item !== key);
        } else {
            // Add if not present
            updatedOptions = [...selectedPrintOptions, key];
        }
        // setState((prevState: any) => ({ ...prevState, selectedPrintOptions: updatedOptions, printKey: Math.random() }))
        setState((prevState: any) => ({
            ...prevState,
            finalSelectedPrintOptions: updatedOptions

        }))
    }

    const printFieldOptions = () => {
        return <div className="">
            <PrimaryButton
                text="Chemical Name"
                label="ChemicalName"
                className={`cursorPointer ${state.finalSelectedPrintOptions.indexOf("ChemicalName") > -1 ? "printSelect" : "printUnSelect"}`}
                onClick={() => clickPrintOptionButton("ChemicalName")}
            />
            <PrimaryButton
                text="Expiration Date"
                label="ExpirationDate"
                className={`cursorPointer ml-10 ${state.finalSelectedPrintOptions.indexOf("ExpirationDate") > -1 ? "printSelect" : "printUnSelect"}`}
                onClick={() => clickPrintOptionButton("ExpirationDate")}
            />
            <PrimaryButton
                text="Hazardous"
                label="Hazardous"
                className={`cursorPointer ml-10 ${state.finalSelectedPrintOptions.indexOf("Hazardous") > -1 ? "printSelect " : "printUnSelect"}`}
                onClick={() => clickPrintOptionButton("Hazardous")}
            />
            <PrimaryButton
                text="PH"
                label="PH"
                className={`cursorPointer ml-10 ${state.finalSelectedPrintOptions.indexOf("PH") > -1 ? "printSelect " : "printUnSelect"}`}
                onClick={() => clickPrintOptionButton("PH")}
            />
        </div >
    }

    const handleCardClick = (title: string | null) => {
        if (title) {
            setFilterType(title);
        } else {
            setFilterType("");
        }
    };

    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setCurrentView('card');
            setisSelectedData(false);
            setSelectedCardItems([]);
        } else {
            setCurrentView('grid');
            setisSelectedData(false);
            setSelectedCardItems([]);
        }
    }, []);

    if (hasError) {
        return <div className="boxCard">
            <div className="formGroup" >
                <ShowMessage isShow={hasError} messageType={EMessageType.ERROR} message={error} />
            </div>
        </div>;
    } else {
        return <>
            {isPrintQRModelOpent && <PrintQrCode
                visibleColumn={state.selectedPrintOptions || []}
                isAssociatedChemical={true}
                items={AssociatedFilterData || []}
                onClickClose={() => setIsPrintQRModelOpent(false)} isAssetQR={false} isChemicalQR={true} manageComponentView={props.manageComponentView}
            />}
            {state.isQRCodeModelOpen &&
                <PrintQrCode
                    key={keyUpdate}
                    isDetailView={true} items={[state.qrDetails]} onClickClose={() => setState(prevState => ({ ...prevState, isQRCodeModelOpen: false }))} isAssetQR={false} isChemicalQR={true} manageComponentView={props.manageComponentView}

                    visibleColumn={state.selectedPrintOptions || []}
                />
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

            {state.isPrintSettingDialogOpen &&
                <CustomModal
                    isBlocking={true}
                    dialogWidth="600px"
                    isModalOpenProps={state.isPrintSettingDialogOpen}
                    subject={"Select Print Field"}
                    message={<div>{printFieldOptions()}</div>}
                    onClose={onClosePrintConfiguration}
                    onClickOfYes={onClickPrintConfigSave}
                    yesButtonText="Save"

                    closeButtonText="Close"
                />
            }
            <Dialog
                hidden={hideDialog}
                onDismiss={toggleHideDialog}
                dialogContentProps={dialogContentProps}>
                <DialogFooter>
                    <PrimaryButton text="Ok" onClick={toggleHideDialog} className="ms-Button ms-Button--success dialog-space" />
                </DialogFooter>
            </Dialog>
            {(
                <CustomModal isModalOpenProps={hideDialogdelete} setModalpopUpFalse={() => toggleHideDialogdelete()} subject={"Delete  Confirmation "} message={<div>Are you sure, you want to delete this record?</div>} yesButtonText="Yes" closeButtonText={"No"} onClickOfYes={onclickdelete} />
            )}
            {isLoading && <Loader />}
            {isShowAssetHistoryModel && <AssociateChemicalDialog manageComponentView={props.manageComponentView} qCState={props.qCState} qCStateId={props?.dataObj?.QCStateId} siteName={props.siteName} context={context} provider={provider} AlocateChemical={AssocitedChemicalArray} SiteURL={URL} siteNameId={props.siteNameId} onClickClose={onClickClose} isModelOpen={isShowAssetHistoryModel} loginUserRoleDetails={currentUserRoleDetail} />}
            {props.siteNameId &&
                <ChemicalCountCard data={SummaryData} handleCardClick={handleCardClick} />}

            <div className={!!props.siteNameId ? "mar-left12" : "boxCard mar-left12"}>
                {!props.siteNameId && <div className="ms-Grid-row">
                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ">
                        <h1 className="mainTitle">Chemical Usage</h1>
                    </div>
                </div>}
                <div className="ms-Grid mt-15 mb-3 more-page-wrapper">
                    <div className="ms-Grid-row filtermrg">
                        {!props.siteNameId && <div className="ms-Grid-col ms-sm12 ms-md2 ms-lg2 ms-xl2">
                            <div className="formControl">
                                <div className="formControl">

                                    <MultipleSiteFilter
                                        isPermissionFiter={true}
                                        loginUserRoleDetails={currentUserRoleDetail}
                                        selectedSiteIds={selectedSiteIds}
                                        selectedSiteTitles={selectedSiteTitles}
                                        selectedSCSite={selectedSCSites}
                                        onSiteChange={handleSiteChange}
                                        provider={provider}
                                        isRequired={true}
                                        AllOption={true}
                                    />
                                </div>
                            </div>
                        </div>}
                        <div className="ms-Grid-col ms-sm12 ms-md2 ms-lg2 ">
                            <div className="formControl cls-dd">

                                {ChemicalOptions &&
                                    < ReactDropdown
                                        options={ChemicalOptions}
                                        isMultiSelect={false}
                                        defaultOption={defaultChemical}
                                        onChange={_onChemicalChange}
                                        placeholder={"Chemical"}
                                    />}
                            </div>
                        </div>
                        <div className="ms-Grid-col ms-sm12 ms-md9 ms-lg8 p-0">
                            <div className="formControl ">
                                <div className="">
                                    <DateRangeFilter
                                        fromDate={fromDate}
                                        toDate={toDate}
                                        onFromDateChange={onChangeFromDate}
                                        onToDateChange={onChangeToDate}
                                        onChangeRangeOption={onChangeRangeOption}
                                    />
                                    {false && < div className="ms-Grid-col ms-sm12 ms-md3 ms-lg3">
                                        <PrimaryButton className="btnSearch btn btn-primary ml-9" text="Search" onClick={() => _onClickSearch(URL)} />
                                    </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
                {currentView === "grid" ? <>
                    <MemoizedDetailList
                        manageComponentView={props.manageComponentView}
                        columns={columnsAssocitedChemical}
                        items={AssociatedFilterData}
                        reRenderComponent={true}
                        searchable={true}
                        isAddNew={true}
                        _onSearchTextChangeForExcel={_onSearchTextChangeForExcel}
                        CustomselectionMode={
                            !!props.siteNameId && isVisibleCrud.current ? SelectionMode.multiple : SelectionMode.none
                        }
                        onItemInvoked={_onItemInvoked}
                        onSelectedItem={_onItemSelected}
                        addEDButton={(isDisplayEDbtn && isVisibleCrud.current) && <>
                            <Link className="actionBtn btnDanger iconSize  ml-10" onClick={onclickconfirmdelete}>
                                <TooltipHost content={"Delete"} id={tooltipId}>
                                    <FontAwesomeIcon icon="trash-alt" />
                                </TooltipHost>
                            </Link>
                        </>}
                        addNewContent={(isVisibleCrud.current) ?
                            <>
                                <div className="d-cls-center ">
                                    {!!props.siteNameId && <Link className="actionBtn iconSize btnEdit mr-10" style={{ paddingBottom: "2px" }} onClick={onClickPrintConfigurationOpen}
                                        text="">
                                        <TooltipHost
                                            content={"Print Setting"}
                                            id={tooltipId}
                                        >
                                            <FontAwesomeIcon
                                                icon={"gear"} />
                                        </TooltipHost>
                                    </Link>}
                                    {AssociatedFilterData.length > 0 &&
                                        <Link className="actionBtn iconSize btnInfo  dticon" style={{ paddingBottom: "2px" }} onClick={() => setIsPrintQRModelOpent(true)}
                                            text="">
                                            <TooltipHost
                                                content={"Print QR Code"}
                                                id={tooltipId}
                                            >
                                                <FontAwesomeIcon
                                                    icon={"print"}
                                                />
                                            </TooltipHost>
                                        </Link>
                                    }
                                    {AssociatedFilterData && AssociatedFilterData.length > 0 &&
                                        <div className="dflex">
                                            <Link className="actionBtn iconSize btnRefresh refresh-icon-m" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                                text="">
                                                <TooltipHost
                                                    content={"Refresh Grid"}
                                                    id={tooltipId}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={"arrows-rotate"}
                                                    />
                                                </TooltipHost>
                                            </Link>
                                            <Link className="btn-back-ml-4 dticon">
                                                <TooltipHost content="Export options">
                                                    <DefaultButton
                                                        text="Export"
                                                        iconProps={{ iconName: "Download" }}
                                                        menuProps={menuProps}
                                                        className="btn export-btn-primary"
                                                    // disabled={isPdfGenerating || isLoading || downloadDisable}
                                                    />
                                                </TooltipHost>
                                            </Link>
                                            <TooltipHost
                                                content={"Send Email With PDF"}
                                                id={tooltipId}
                                            >
                                                <CommonPopup
                                                    isPopupVisible={isPopupVisible}
                                                    hidePopup={hidePopup}
                                                    title={title}
                                                    sendToEmail={sendToEmail}
                                                    onChangeTitle={onChangeTitle}
                                                    onChangeSendToEmail={onChangeSendToEmail}
                                                    displayerrortitle={displayerrortitle}
                                                    displayerroremail={displayerroremail}
                                                    displayerror={displayerror}
                                                    onClickSendEmail={onClickSendEmail}
                                                    onClickCancel={onClickCancel}
                                                    onclickSendEmail={onclickSendEmail}
                                                />
                                            </TooltipHost>
                                        </div>
                                    }
                                    {isVisibleCrud.current && props.siteNameId &&
                                        <TooltipHost
                                            content={"Add New Associate Chemical"}
                                            id={tooltipId}
                                        >
                                            <PrimaryButton text="Associate" onClick={onClickAssociateChemical} className="btn btn-primary" />
                                        </TooltipHost>}
                                    <div className="grid-list-view">
                                        <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`}
                                            onClick={() => handleViewChange("grid")}>
                                            <TooltipHost content={"List View"} id={tooltipId}>
                                                <FontAwesomeIcon icon="list" />
                                            </TooltipHost>
                                        </Link>
                                        <Link
                                            className={`grid-list-btn ${currentView !== "grid" ? "active" : ""}`}
                                            onClick={() => handleViewChange("card")}>
                                            <TooltipHost content={"Card View"} id={tooltipId}>
                                                <FontAwesomeIcon icon="th" />
                                            </TooltipHost>
                                        </Link>
                                    </div>
                                </div>
                            </>
                            :
                            <>
                                {AssociatedFilterData && AssociatedFilterData.length > 0 &&
                                    <div className="dflex">
                                        <Link className="btn-back-ml-4 dticon">
                                            <TooltipHost content="Export options">
                                                <DefaultButton
                                                    text="Export"
                                                    iconProps={{ iconName: "Download" }}
                                                    menuProps={menuProps}
                                                    className="btn export-btn-primary"
                                                // disabled={isPdfGenerating || isLoading || downloadDisable}
                                                />
                                            </TooltipHost>
                                        </Link>
                                        <TooltipHost
                                            content={"Send Email With PDF"}
                                            id={tooltipId}
                                        >
                                            <CommonPopup
                                                isPopupVisible={isPopupVisible}
                                                hidePopup={hidePopup}
                                                title={title}
                                                sendToEmail={sendToEmail}
                                                onChangeTitle={onChangeTitle}
                                                onChangeSendToEmail={onChangeSendToEmail}
                                                displayerrortitle={displayerrortitle}
                                                displayerroremail={displayerroremail}
                                                displayerror={displayerror}
                                                onClickSendEmail={onClickSendEmail}
                                                onClickCancel={onClickCancel}
                                                onclickSendEmail={onclickSendEmail}
                                            />
                                        </TooltipHost>
                                        <div className="grid-list-view">
                                            <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`}
                                                onClick={() => handleViewChange("grid")}>
                                                <TooltipHost content={"List View"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="list" />
                                                </TooltipHost>
                                            </Link>
                                            <Link
                                                className={`grid-list-btn ${currentView !== "grid" ? "active" : ""}`}
                                                onClick={() => handleViewChange("card")}>
                                                <TooltipHost content={"Card View"} id={tooltipId}>
                                                    <FontAwesomeIcon icon="th" />
                                                </TooltipHost>
                                            </Link>
                                        </div>

                                    </div>
                                }
                            </>

                        }
                    />
                </> :
                    <>
                        <div>
                            {(isVisibleCrud.current) ?
                                <>
                                    <div className="d-cls-center icon-Shift-Right">
                                        {!!props.siteNameId && <Link className="actionBtn iconSize btnEdit mr-10" style={{ paddingBottom: "2px" }} onClick={onClickPrintConfigurationOpen}
                                            text="">
                                            <TooltipHost
                                                content={"Print Setting"}
                                                id={tooltipId}
                                            >
                                                <FontAwesomeIcon
                                                    icon={"gear"} />
                                            </TooltipHost>
                                        </Link>}
                                        {AssociatedFilterData.length > 0 &&
                                            <Link className="actionBtn iconSize btnInfo   dticon" style={{ paddingBottom: "2px" }} onClick={() => setIsPrintQRModelOpent(true)}
                                                text="">
                                                <TooltipHost
                                                    content={"Print QR Code"}
                                                    id={tooltipId}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={"print"}
                                                    />
                                                </TooltipHost>
                                            </Link>
                                        }
                                        {AssociatedFilterData && AssociatedFilterData.length > 0 &&
                                            <div className="dflex">
                                                <Link className="actionBtn iconSize btnRefresh refresh-icon-m" style={{ paddingBottom: "2px" }} onClick={onclickRefreshGrid}
                                                    text="">
                                                    <TooltipHost
                                                        content={"Refresh Grid"}
                                                        id={tooltipId}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={"arrows-rotate"}
                                                        />
                                                    </TooltipHost>    </Link>
                                                <Link className="btn-back-ml-4 dticon">
                                                    <TooltipHost content="Export options">
                                                        <DefaultButton
                                                            text="Export"
                                                            iconProps={{ iconName: "Download" }}
                                                            menuProps={menuProps}
                                                            className="btn export-btn-primary"
                                                        // disabled={isPdfGenerating || isLoading || downloadDisable}
                                                        />
                                                    </TooltipHost>
                                                </Link>
                                                <TooltipHost
                                                    content={"Send Email With PDF"}
                                                    id={tooltipId}
                                                >
                                                    <CommonPopup
                                                        isPopupVisible={isPopupVisible}
                                                        hidePopup={hidePopup}
                                                        title={title}
                                                        sendToEmail={sendToEmail}
                                                        onChangeTitle={onChangeTitle}
                                                        onChangeSendToEmail={onChangeSendToEmail}
                                                        displayerrortitle={displayerrortitle}
                                                        displayerroremail={displayerroremail}
                                                        displayerror={displayerror}
                                                        onClickSendEmail={onClickSendEmail}
                                                        onClickCancel={onClickCancel}
                                                        onclickSendEmail={onclickSendEmail}
                                                    />
                                                </TooltipHost>
                                                {isVisibleCrud.current && props.siteNameId &&
                                                    <TooltipHost
                                                        content={"Add New Associate Chemical"}
                                                        id={tooltipId}
                                                    >
                                                        <PrimaryButton text="Associate" onClick={onClickAssociateChemical} className="btn btn-primary" />
                                                    </TooltipHost>}
                                                <div className="grid-list-view">
                                                    <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`}
                                                        onClick={() => handleViewChange("grid")}>
                                                        <TooltipHost content={"List View"} id={tooltipId}>
                                                            <FontAwesomeIcon icon="list" />
                                                        </TooltipHost>
                                                    </Link>
                                                    <Link
                                                        className={`grid-list-btn ${currentView !== "grid" ? "active" : ""}`}
                                                        onClick={() => handleViewChange("card")}>
                                                        <TooltipHost content={"Card View"} id={tooltipId}>
                                                            <FontAwesomeIcon icon="th" />
                                                        </TooltipHost>
                                                    </Link>
                                                </div>
                                            </div>
                                        }

                                    </div>
                                </> :
                                <>
                                    {AssociatedFilterData && AssociatedFilterData.length > 0 &&
                                        <div className="dflex">
                                            <Link className="btn-back-ml-4 dticon mla">
                                                <TooltipHost content="Export options">
                                                    <DefaultButton
                                                        text="Export"
                                                        iconProps={{ iconName: "Download" }}
                                                        menuProps={menuProps}
                                                        className="btn export-btn-primary"
                                                    // disabled={isPdfGenerating || isLoading || downloadDisable}
                                                    />
                                                </TooltipHost>
                                            </Link>
                                            <TooltipHost
                                                content={"Send Email With PDF"}
                                                id={tooltipId}
                                            >
                                                <CommonPopup
                                                    isPopupVisible={isPopupVisible}
                                                    hidePopup={hidePopup}
                                                    title={title}
                                                    sendToEmail={sendToEmail}
                                                    onChangeTitle={onChangeTitle}
                                                    onChangeSendToEmail={onChangeSendToEmail}
                                                    displayerrortitle={displayerrortitle}
                                                    displayerroremail={displayerroremail}
                                                    displayerror={displayerror}
                                                    onClickSendEmail={onClickSendEmail}
                                                    onClickCancel={onClickCancel}
                                                    onclickSendEmail={onclickSendEmail}
                                                />
                                            </TooltipHost>
                                            <div className="grid-list-view">
                                                <Link className={`grid-list-btn ${currentView === "grid" ? "active" : ""}`}
                                                    onClick={() => handleViewChange("grid")}>
                                                    <TooltipHost content={"List View"} id={tooltipId}>
                                                        <FontAwesomeIcon icon="list" />
                                                    </TooltipHost>
                                                </Link>
                                                <Link
                                                    className={`grid-list-btn ${currentView !== "grid" ? "active" : ""}`}
                                                    onClick={() => handleViewChange("card")}>
                                                    <TooltipHost content={"Card View"} id={tooltipId}>
                                                        <FontAwesomeIcon icon="th" />
                                                    </TooltipHost>
                                                </Link>
                                            </div>
                                        </div>
                                    }
                                </>
                            }
                        </div>
                        <ChemicalCardView
                            _onclickDetailsView={_onclickDetailsView}
                            items={AssociatedFilterData}
                            manageComponentView={props.manageComponentView}
                            setState={setState}
                            sitenameid={props.siteNameId || undefined}
                            onSelectCards={setSelectedCardItems}
                            setKeyUpdate={setKeyUpdate}
                            setFileURL={setFileURL} // Pass setFileURL function
                            openModal={openModal} // Pass openModal functionq
                            isSiteDelete={true}
                            _onclickEdit={function (itemID: any): void {
                                throw new Error("Function not implemented.");
                            }}
                            _onclickconfirmdelete={onclickconfirmdelete}
                        />

                    </>
                }
            </div >
            {isPdfGenerating && (
                <PdfGenerateChemical
                    siteName={props?.siteName || 'All Sites'}
                    qCState={props?.qCState || 'All States'}
                    ListChemical={selectedCardItems.length > 0 ? selectedCardItems : !!isSelectedData ? DeleteId : AssociatedFilterData}
                    imgLogo={imgLogo}
                />
            )}

            <Panel
                isOpen={showModal}
                onDismiss={() => closeModal()}
                type={PanelType.extraLarge}
                headerText="Document View"
            >
                <iframe src={fileURL} style={{ width: "100%", height: "90vh" }} />
            </Panel>
        </>;
    }
};  