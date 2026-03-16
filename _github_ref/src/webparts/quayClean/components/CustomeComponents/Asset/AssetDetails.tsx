/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable react/jsx-key */
import * as React from "react";
import { IDataProvider } from "../../../../../DataProvider/Interface/IDataProvider"; import { WebPartContext } from "@microsoft/sp-webpart-base";
import { IQuayCleanState } from "../../QuayClean";
import IPnPQueryOptions from "../../../../../DataProvider/Interface/IPnPQueryOptions";
import { ComponentNameEnum, getExternalUrl, ListNames, UserActionEntityTypeEnum, UserActivityActionTypeEnum } from "../../../../../Common/Enum/ComponentNameEnum";
import { _onItemSelected, getConvertedDate, isLink, isWithinNextMonthRange, logGenerator, removeElementOfBreadCrum, generateAndSaveKendoPDF, UserActivityLog, calculateDurationForHistory, formatPrice, formatPriceDecimal } from "../../../../../Common/Util";
import { MemoizedDetailList } from "../../../../../Common/DetailsList";
import { Breadcrumb, DefaultButton, IContextualMenuProps, IDropdownOption, Link, MessageBar, MessageBarType, Panel, PanelType, Pivot, PivotItem, PrimaryButton, TooltipHost } from "@fluentui/react";
import { UpdateServiceHistroy } from "./UpdateServiceHistroy";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useBoolean, useId } from "@fluentui/react-hooks";
import { ILoginUserRoleDetails } from "../../../../../Interfaces/ILoginUserRoleDetails";
import { Base64Image, DateTimeFormate, MicrosoftOfficeDocumentType } from "../../../../../Common/Constants/CommonConstants";
import { Loader } from "../../CommonComponents/Loader";
import moment from "moment";
import { IAssociatedTeam } from "../../../../../Interfaces/IAssociatedTeam";
import { OperatorFilter } from "../../../../../Common/Filter/OperatorFilter";
import NoRecordFound from "../../CommonComponents/NoRecordFound";
import { PreDateRangeFilter } from "../../../../../Common/Filter/PreDateRangeFilter";
import { IBreadCrum } from "../../../../../Interfaces/IBreadCrum";
import { ICheckListDetail } from "../../../../../Interfaces/ICheckListDetail";
import { ViewActionFilter } from "../../../../../Common/Filter/ViewAction";
import { toastService } from "../../../../../Common/ToastService";
import { IFileWithBlob } from "../../../../../DataProvider/Interface/IFileWithBlob";
import CommonPopup from "../../CommonComponents/CommonSendEmailPopup";
import { ForceFullyCheckList } from "./ForceFullyCheckList";
import { useAtomValue } from "jotai";
import { appGlobalStateAtom } from "../../../../../jotai/appGlobalStateAtom";
import CustomModal from "../../CommonComponents/CustomModal";
import { StatusFilter } from "../../../../../Common/Filter/StatusFilter";
import { Messages } from "../../../../../Common/Constants/Messages";
import { selectedZoneAtom } from "../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../jotai/isSiteLevelComponentAtom";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const notFoundImage = require('../../../../quayClean/assets/images/NotFoundImg.png');
const imgLogo = require('../../../../quayClean/assets/images/qc_logo.png');
// import { IFramePanel } from "@pnp/spfx-controls-react/lib/IFramePanel";
export interface IAssetDetailsProps {
    provider: IDataProvider;
    context: WebPartContext;
    isAssetDetails?: boolean;
    manageComponentView(componentProp: IQuayCleanState): any;
    siteMasterId?: number;
    isShowDetailOnly?: boolean;
    preViousCompomentName?: string;
    breadCrumItems: any[];
    siteName?: string;
    qCState?: string;
    MasterId?: any;
    componentProp: IQuayCleanState;
    loginUserRoleDetails: ILoginUserRoleDetails;
    IsSupervisor?: boolean;
    pivotName?: string;
}

export const AssetDetails = (props: IAssetDetailsProps) => {
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, currentUserRoleDetail } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const [ListEquipment, setListEquipment] = React.useState<any>([]);
    const [ListAssetHistory, setListAssetHistory] = React.useState<any>([]);
    const [isAssetHistoryModelOpen, SetIsAssetHistoryModelOpen] = React.useState<boolean>(false);
    const [columnsAssetHistory, setcolumnsAssetHistory] = React.useState<any>([]);
    const [columnCard, setcolumnCard] = React.useState<any>([]);
    const [isPanelOpen, setisPanelOpen] = React.useState<boolean>(false);
    const [url, seturl] = React.useState<string>("");
    const [ListData, setListData] = React.useState<any>([]);
    const [CardData, setCardData] = React.useState<any>([]);
    const [fromDate, setFromDate] = React.useState<Date | any>();
    const [toDate, setToDate] = React.useState<Date | any>();
    const [filterFromDate, setFilterFromDate] = React.useState<any>(undefined);
    const [filterToDate, setFilterToDate] = React.useState<any>(undefined);
    const [selectedItem, setSelectedItem] = React.useState<IDropdownOption>({ key: 'Last 30 Days', text: 'Last 30 Days' });
    const [ATData, setATData] = React.useState<any>([]);
    const [selectedKey, setselectedKey] = React.useState<any>(props.pivotName ? props.pivotName : "Services History");
    const [selectedOperator, setSelectedOperator] = React.useState<any>();
    const tooltipId = useId('tooltip');
    const [selectedViewAction, setSelectedViewAction] = React.useState<any>("Card View");
    const [isViewCard, setIsViewCard] = React.useState<boolean>(true);
    const [videoLinks, setVideoLinks] = React.useState<any>([]);
    const [VideoURL, setVideoURL] = React.useState<string>("");
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [isPopupVisible, { setTrue: showPopup, setFalse: hidePopup }] = useBoolean(false);
    const [buttondisable, setbuttondisable] = React.useState<boolean>(true);
    const [selectedFiles, setselectedFiles] = React.useState<any>();
    const [title, setTitle] = React.useState<string>("");
    const [sendToEmail, setSendToEmail] = React.useState<string>("");
    const [displayerrortitle, setDisplayErrorTitle] = React.useState<boolean>(false);
    const [displayerroremail, setDisplayErrorEmail] = React.useState<boolean>(false);
    const [displayerror, setDisplayError] = React.useState<boolean>(false);
    const [displayForcefullyDialog, setDisplayForcefullyDialog] = React.useState<boolean>(false);
    const [isRefreshGrid, setIsRefreshGrid] = React.useState<boolean>(false);
    const [CurrentCardData, setCurrentCardData] = React.useState<any>([]);
    const assetTypeData = React.useRef<any>([])
    const isCall = React.useRef<boolean>(true);
    const [isEditStatusOpen, setIsEditStatusOpen] = React.useState(false);
    const [selectedStatus, setSelectedStatus] = React.useState<any>("");

    const handleEditStatusClick = () => {
        setSelectedStatus(ListEquipment[0]?.Status || "");
        setIsEditStatusOpen(true);
    };

    const onStatusChange = (status: any): void => {
        setSelectedStatus(status.text);
    };
    const onclickRefreshGrid = () => {
        setIsRefreshGrid(prevState => !prevState);
    };

    const [width, setWidth] = React.useState<string>("500px");

    React.useEffect(() => {
        if (window.innerWidth <= 768) {
            setWidth("90%");
        } else {
            setWidth("500px");
        }
    }, [window.innerWidth]);

    const onChangeTitle = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        setTitle(newValue || "");
        if (newValue) {
            setDisplayErrorTitle(false);
        }
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

    const onclickSendEmail = () => {
        showPopup();
    };

    const handleLinkClick = (link: any, index: any) => {

        const trimmedLink = link.trim();
        const lastSegment = trimmedLink.substring(trimmedLink.lastIndexOf('/') + 1);
        let finalLink = "https://www.youtube.com/embed/" + lastSegment;
        setActiveIndex(index);
        setVideoURL(finalLink);
    };
    const onOperatorChange = (Operator: any): void => {
        setSelectedOperator(Operator.text);
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
    const _onLinkClick = (item: PivotItem): void => {
        if (item.props.itemKey == "Link Document") {
        }
        setselectedKey(item.props.itemKey);
    };

    const onClickDownloadPDF = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const fileName = `Daily Usage Report`;
            const fileBlob = await generateAndSaveKendoPDF("pdfGenerateAD", fileName);
            if (!fileBlob) {
                throw new Error("Failed to generate PDF file.");
            }
            const url = window.URL.createObjectURL(fileBlob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${fileName}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
            toastService.success("PDF downloaded successfully!");
        } catch (error) {
            console.error("PDF download failed:", error);
            toastService.error("Failed to generate PDF");
        } finally {
            setIsLoading(false);
        }
    };
    const menuProps: IContextualMenuProps = {
        items: [
            {
                key: "downloadPdf",
                text: "Export PDF",
                iconProps: { iconName: "PDF", style: { color: "#D7504C" } },
                onClick: (ev, item) => { onClickDownloadPDF() },
            }
        ],
    };
    const onClickSendEmail = async (): Promise<void> => {
        setIsLoading(true);
        const isTitleEmpty = !title;
        const isEmailEmpty = !sendToEmail;
        // const isEmailInvalid = !isEmailEmpty && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(sendToEmail);
        const isEmailInvalid = !isEmailEmpty && !sendToEmail?.split(';').every(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()));

        setDisplayErrorTitle(isTitleEmpty);
        setDisplayErrorEmail(isEmailEmpty);
        setDisplayError(isEmailInvalid);

        if (!isTitleEmpty && !isEmailEmpty && !isEmailInvalid) {

            const fileName = `Daily Usage Report`;
            let fileBlob: any = await generateAndSaveKendoPDF("pdfGenerateAD", fileName);
            const file: IFileWithBlob = {
                file: fileBlob,
                name: `${fileName}.pdf`,
                overwrite: true
            };
            setselectedFiles(file);
            let toastMessage: string = "";
            const toastId = toastService.loading('Loading...');
            toastMessage = 'Email sent successfully!';
            const item: any = {
                Title: title,
                SendToEmail: sendToEmail,
                SiteName: props?.siteName,
                AssetName: ListEquipment[0]?.Title
            };
            props.provider.createItem(item, ListNames.DailyUsageReportEmail).then((item: any) => {
                props.provider.uploadAttachmentToList(ListNames.DailyUsageReportEmail, file, item.data.Id).then(() => {
                    console.log("Upload Success");
                    const logObj = {
                        UserName: props?.loginUserRoleDetails?.title,
                        SiteNameId: props.componentProp.MasterId, // Match index dynamically
                        ActionType: UserActivityActionTypeEnum.SendEmail,
                        EntityType: UserActionEntityTypeEnum.EquipmentAsset,
                        // EntityId: UpdateItem[index]?.ID, // Use res dynamically
                        EntityName: title, // Match index dynamically
                        Details: `Send Email Equipment/Asset to ${sendToEmail}`,
                        StateId: props?.componentProp?.qCStateId
                    };
                    void UserActivityLog(props.provider, logObj, props?.loginUserRoleDetails);
                }).catch(err => console.log(err));
                toastService.updateLoadingWithSuccess(toastId, toastMessage);
                setIsLoading(false);
                onClickCancel();
            }).catch(err => console.log(err));
        } else {
            setIsLoading(false);
        }
    };


    const onClickCancel = () => {
        setTitle("");
        setSendToEmail("");
        setDisplayError(false);
        setDisplayErrorEmail(false);
        setDisplayErrorTitle(false);
        hidePopup();
    };

    const _ChecklistResponseMaster = () => {
        try {
            let filterDateArray: string | any[] = [];
            let filterArray = [];
            let filter = "";

            const firstDateOfMonth = moment(new Date()).subtract(29, 'days').format('YYYY-MM-DD');
            const lastDateOfMonth = moment(new Date()).format('YYYY-MM-DD');
            filterArray.push(`SiteNameId eq '${props.componentProp.MasterId}' and AssetMasterId eq '${props.componentProp.siteMasterId}'`);
            // if (filterFromDate == null || filterToDate == null) {
            //     if (selectedItem.text == "Custom Range") {
            //         // toggleHideDialog();
            //     } else if (selectedItem.text == "select") {
            //         // filterDateArray.push();
            //     }
            // }
            // else if (!!filterFromDate && !!filterToDate) {
            //     // filterDateArray.push(`(ConductedOn ge datetime'${filterFromDate}T00:00:00Z' and ConductedOn le datetime'${filterToDate}T23:59:59Z')`);
            // }

            if (selectedOperator) {
                filterArray.push(`OperatorName eq '${selectedOperator}'`);
            }

            if (filterDateArray.length > 0 && filterArray.length > 0) {
                if (filter != "")
                    filter = filter + " and (" + filterDateArray + " and (" + filterArray.join(" and ") + "))";
                else
                    filter = filterDateArray + " and (" + filterArray.join(" and ") + ")";
            } else if (filterDateArray.length > 0) {
                if (filter != "")
                    filter = filter + " and (" + filterDateArray[0] + ")";
                else
                    filter = filterDateArray[0];
            } else if (filterArray.length > 0) {
                if (filter != "")
                    filter = filter + " and (" + filterArray.join(" and ") + ")";
                else
                    filter = filterArray.join(" and ");
            } else {
                filter = "";
            }

            const select = ["ID,SiteNameId,AssetMasterId,ConductedOn,OperatorName,ChecklistType,IsAssetDamaged,AssociatedTeamId,AssetTypeMasterId,IsForceFully,Comment,ReferencePairId"];
            const expand = [""];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                listName: ListNames.ChecklistResponseMaster,
                filter: filter,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    const ListData = results.map((data) => {
                        return (
                            {
                                ID: data.ID,
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                                AssetMasterId: !!data.AssetMasterId ? data.AssetMasterId : "",
                                AssociatedTeamId: !!data.AssociatedTeamId ? data.AssociatedTeamId : "",
                                OperatorName: !!data.OperatorName ? data.OperatorName : "",
                                ConductedOn: !!data.ConductedOn ? getConvertedDate(data.ConductedOn) : "",
                                ConductedOnTime: !!data.ConductedOn ? moment(data.ConductedOn).format(DateTimeFormate) : '',
                                ConductedOnOrg: !!data.ConductedOn ? data.ConductedOn : "",
                                ChecklistType: !!data.ChecklistType ? data.ChecklistType : "",
                                IsAssetDamaged: !!data.IsAssetDamaged ? "Yes" : "No",
                                AssetTypeMasterId: !!data.AssetTypeMasterId ? data.AssetTypeMasterId : null,
                                IsForceFully: !!data.IsForceFully ? data.IsForceFully : "",
                                Comment: !!data.Comment ? data.Comment : "",
                                ReferencePairId: !!data?.ReferencePairId ? data?.ReferencePairId : ""
                            }
                        );
                    });
                    const sorted = [...ListData].sort((a, b) => moment(b.ConductedOnOrg).diff(moment(a.ConductedOnOrg)));
                    const PreData = sorted.filter(item => item.ChecklistType === "Pre");
                    const PostData = sorted.filter(item => item.ChecklistType === "Post");

                    const result = PreData.map((preItem: any) => {
                        const postItem = PostData.find(
                            item =>
                                item.ChecklistType === 'Post' &&
                                item.ReferencePairId === preItem.ReferencePairId &&
                                item.AssociatedTeamId === preItem.AssociatedTeamId &&
                                item.AssetMasterId === preItem.AssetMasterId
                            //&& item.ConductedOn === preItem.ConductedOn
                        );

                        const teamData = ATData.find(
                            (at: { id: any; }) => at.id === preItem.AssociatedTeamId
                        );

                        return {
                            PreItemId: preItem?.ID,
                            PostItemId: postItem?.ID,
                            OperatorName: preItem.OperatorName,
                            SD: preItem.ConductedOnOrg,
                            ED: postItem ? postItem.ConductedOnOrg : null,
                            StartDateTime: preItem.ConductedOnTime,
                            EndDate: postItem ? postItem.ConductedOnTime : null,
                            IsAssetDamaged: postItem ? postItem.IsAssetDamaged : "No",
                            Image: teamData ? teamData.attachmentURl : null,
                            AssociatedTeamId: preItem ? preItem.AssociatedTeamId : null,
                            AssetTypeMasterId: preItem ? preItem.AssetTypeMasterId : null,
                            IsForceFully: postItem?.IsForceFully,
                            Comment: postItem?.Comment,
                            PreReferencePairId: preItem?.ReferencePairId,
                            PostReferencePairId: postItem?.ReferencePairId,
                        };
                    });


                    if (filterFromDate == null || filterToDate == null) {
                        if (selectedItem.text == "Last 30 Days") {
                            let sdate = `${firstDateOfMonth}T00:00:00Z`;
                            let edate = `${lastDateOfMonth}T23:59:59Z`;

                            const startDate = new Date(sdate);
                            const endDate = new Date(edate);

                            const filteredResults = result
                                .filter(item => {
                                    const sd = new Date(item.SD);
                                    const ed = new Date(item.ED);
                                    return (sd >= startDate && sd <= endDate) || (ed >= startDate && ed <= endDate);
                                })
                                .map(item => {
                                    const { display, totalHours } = calculateDurationForHistory(item);

                                    // convert "4 Hours" → 4
                                    const assetTypeItem = assetTypeData.current?.find((at: any) => at.Id === item.AssetTypeMasterId);
                                    const expectedHours = assetTypeItem?.HowManyHours
                                        ? parseFloat(assetTypeItem.HowManyHours)
                                        : 0;

                                    const roundedHours = parseFloat(totalHours.toFixed(2));

                                    let durationColor = "greenBadgeact";

                                    if (roundedHours > expectedHours) {
                                        const diffMinutes = (roundedHours - expectedHours) * 60;
                                        if (diffMinutes <= 30) durationColor = "yellowBadgeact";
                                        else durationColor = "redBadgeact";
                                    }

                                    return {
                                        ...item,
                                        duration: display,
                                        totalHours: roundedHours,
                                        expectedHours,
                                        durationColor
                                    };
                                })


                            setCardData(filteredResults);
                            setListData(filteredResults);
                        }
                    }
                    else if (!!filterFromDate && !!filterToDate) {
                        let sdate = `${filterFromDate}T00:00:00Z`;
                        let edate = `${filterToDate}T23:59:59Z`;

                        const startDate = new Date(sdate);
                        const endDate = new Date(edate);

                        const filteredResults = result.filter(item => {
                            const sd = new Date(item.SD);
                            const ed = new Date(item.ED);
                            return (sd >= startDate && sd <= endDate) || (ed >= startDate && ed <= endDate);
                        })
                            .map(item => {
                                const { display, totalHours } = calculateDurationForHistory(item);

                                // convert "4 Hours" → 4
                                const assetTypeItem = assetTypeData.current?.find((at: any) => at.Id === item.AssetTypeMasterId);
                                const expectedHours = assetTypeItem?.HowManyHours
                                    ? parseFloat(assetTypeItem.HowManyHours)
                                    : 0;

                                const roundedHours = parseFloat(totalHours.toFixed(2));

                                let durationColor = "greenBadgeact";

                                if (roundedHours > expectedHours) {
                                    const diffMinutes = (roundedHours - expectedHours) * 60;
                                    if (diffMinutes <= 30) durationColor = "yellowBadgeact";
                                    else durationColor = "redBadgeact";
                                }

                                return {
                                    ...item,
                                    duration: display,
                                    totalHours: roundedHours,
                                    expectedHours,
                                    durationColor
                                };
                            })
                        setCardData(filteredResults);
                        setListData(filteredResults);
                    }
                }
                setIsLoading(false);
            }).catch((error) => {
                console.log(error);
                const errorObj = {
                    ErrorMessage: error.toString(),
                    ErrorStackTrace: "",
                    CustomErrormessage: "Error is occuring while  _EquipmentMaster",
                    PageName: "QuayClean.aspx",
                    ErrorMethodName: "_EquipmentMaster AssetDetails"
                };
                void logGenerator(props.provider, errorObj);
            });

        } catch (ex) {
            console.log(ex);
        }
    };
    const getAssetTypeData = async () => {
        const queryOptions: IPnPQueryOptions = {
            listName: ListNames.AssetTypeMaster,
            select: ['Id', 'HowManyHours']
        };
        try {
            const data = await props.provider.getItemsByQuery(queryOptions);
            assetTypeData.current = data
        } catch (error) {
            console.log("Error fetching AssetTypeMaster:", error);
        }
    };

    React.useEffect(() => {
        getAssetTypeData();
    }, []);

    const _EquipmentMaster = () => {
        try {
            const select = ["ID,Attachments,AssetCategory,AttachmentFiles,Title,SiteNameId,SiteName/Title,AssetType,AssetLink,Manufacturer,ConditionNotes,Model,QCColor,AMStatus,PurchaseDate,PurchasePrice,ServiceDueDate,SerialNumber,AssetPhoto,AssetPhotoThumbnailUrl,RealImagesLinks,WebsiteLink,AssetNo,EquipmentType,AcquisitionValue,FANumber"];
            const expand = ["AttachmentFiles,SiteName"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                listName: ListNames.AssetMaster,
                filter: `ID eq '${props.siteMasterId}'`,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {
                    let arraylink: any;
                    let filename: any;
                    const AssetListData = results.map((data) => {
                        const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/AssetMaster/Attachments/' + data.ID + "/";
                        let AssetPhotoURL;
                        let attachmentFiledata;
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
                                const AssetPhotoData = JSON.parse(data.AssetPhoto);
                                if (AssetPhotoData && AssetPhotoData.serverRelativeUrl) {
                                    AssetPhotoURL = AssetPhotoData.serverRelativeUrl;
                                } else if (AssetPhotoData && AssetPhotoData.fileName) {
                                    AssetPhotoURL = fixImgURL + AssetPhotoData.fileName;
                                } else {
                                    AssetPhotoURL = notFoundImage;
                                }
                            } catch (error) {
                                console.error("Error parsing AssetPhoto JSON:", error);
                                AssetPhotoURL = notFoundImage;
                            }
                        } else {
                            AssetPhotoURL = notFoundImage;
                        }
                        if (data?.RealImagesLinks != "") {
                            arraylink = data?.RealImagesLinks?.split(',').map((link: string) => link.trim());
                            filename = arraylink?.map((link: any) => {
                                const parts = link.split('/');
                                return parts[parts.length - 1];
                            });
                        }
                        return (
                            {
                                ID: data.ID,
                                Title: !!data.Title ? data.Title : "",
                                SiteNameId: !!data.SiteNameId ? data.SiteNameId : "",
                                SiteName: !!data.SiteName ? data?.SiteName?.Title : "",
                                AssetType: !!data.AssetType ? data.AssetType : "",
                                Manufacturer: !!data.Manufacturer ? data.Manufacturer : "",
                                Model: !!data.Model ? data.Model : "",
                                Color: !!data.QCColor ? data.QCColor : "",
                                Status: !!data.AMStatus ? data.AMStatus : "",
                                PurchasePrice: !!data.PurchasePrice ? data.PurchasePrice : "",
                                ServiceDueDate: !!data.ServiceDueDate ? getConvertedDate(data.ServiceDueDate) : "",
                                PurchaseDate: !!data.PurchaseDate ? getConvertedDate(data.PurchaseDate) : "",
                                SerialNumber: !!data.SerialNumber ? data.SerialNumber : "",
                                AssetImage: AssetPhotoURL,
                                WebsiteLink: !!data.WebsiteLink ? data.WebsiteLink : "",
                                fullServiceDueDate: !!data.ServiceDueDate ? data.ServiceDueDate : "",
                                Attachment: attachmentFiledata,
                                ConditionNotes: !!data.ConditionNotes ? data.ConditionNotes : "",
                                AssetLink: !!data.AssetLink ? data.AssetLink : "",
                                AssetCategory: !!data.AssetCategory ? data.AssetCategory : "",
                                RealImagesLinks: !!data.RealImagesLinks ? data.RealImagesLinks : "",
                                RealImagesLinksArray: !!arraylink ? arraylink : "",
                                RealImagesLinksfilename: !!filename ? filename : "",
                                AssetNo: !!data.AssetNo ? data.AssetNo : "",
                                EquipmentType: !!data.EquipmentType ? data.EquipmentType : "",
                                FANumber: !!data.FANumber ? data.FANumber : "",
                                AcquisitionValue: !!data.AcquisitionValue ? data.AcquisitionValue : "",

                            }
                        );
                    });
                    setListEquipment(AssetListData);
                    let links = AssetListData[0]?.AssetLink?.Url?.split(',');
                    const trimmedLink = links[0]?.trim();
                    const lastSegment = trimmedLink.substring(trimmedLink.lastIndexOf('/') + 1);
                    let finalLink = "https://www.youtube.com/embed/" + lastSegment;
                    setVideoURL(finalLink);
                    setVideoLinks(links);

                }
            }).catch((error) => {
                console.log(error);
                const errorObj = {
                    ErrorMessage: error.toString(),
                    ErrorStackTrace: "",
                    CustomErrormessage: "Error is occuring while  _EquipmentMaster",
                    PageName: "QuayClean.aspx",
                    ErrorMethodName: "_EquipmentMaster AssetDetails"
                };
                void logGenerator(props.provider, errorObj);
            });

        } catch (ex) {
            console.log(ex);
        }
    };

    const _AssetHistory = () => {
        try {
            const select = ["ID,AssetMasterId,ServiceDate,ServiceUpdatedBy,AttachmentFiles,Attachments"];
            const expand = ["AttachmentFiles"];
            const queryStringOptions: IPnPQueryOptions = {
                select: select,
                expand: expand,
                listName: ListNames.AssetHistory,
                filter: `AssetMasterId eq '${props.siteMasterId}'`,
            };
            props.provider.getItemsByQuery(queryStringOptions).then((results: any[]) => {
                if (!!results) {

                    const AssetHistoryListData = results.map((data) => {
                        let link: any = "";
                        let link2: any = "";
                        let DocumentFullPath = "";
                        let DocumentFullPath2 = "";
                        let matchingAttachments = [];
                        let nonMatchingAttachments = [];
                        let fileNamePattern = /Invoice/;
                        matchingAttachments = data.AttachmentFiles?.filter((attachment: any) => fileNamePattern.test(attachment.FileName));
                        nonMatchingAttachments = data.AttachmentFiles?.filter((attachment: any) => !fileNamePattern.test(attachment.FileName));
                        if (matchingAttachments.length > 0) {
                            let InvoiceAttachment = [];
                            InvoiceAttachment = matchingAttachments[0];
                            link = props.context.pageContext.web.absoluteUrl + '/Lists' + InvoiceAttachment.ServerRelativeUrl?.split('Lists')[1];
                            let filePath: string = `${link}`;
                            let embedFullFilePath = `${props.context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${link}&action=embedview`;
                            let fileType = filePath?.split('.').pop();
                            if (MicrosoftOfficeDocumentType.indexOf(fileType || '') >= 0)
                                DocumentFullPath = embedFullFilePath;
                            else
                                DocumentFullPath = (fileType === "zip" ? `${filePath}?web = 1 & action=embedview` : filePath);
                        } else {
                            DocumentFullPath = "";
                        }
                        if (nonMatchingAttachments.length > 0) {

                            let nonInvoiceAttachment = [];
                            nonInvoiceAttachment = nonMatchingAttachments[0];
                            link2 = props.context.pageContext.web.absoluteUrl + '/Lists' + nonInvoiceAttachment.ServerRelativeUrl?.split('Lists')[1];
                            let filePath2: string = `${link2}`;

                            let embedFullFilePath2 = `${props.context.pageContext.web.absoluteUrl}/_layouts/15/Doc.aspx?sourcedoc=${link2}&action=embedview`;
                            let fileType2 = filePath2?.split('.').pop();
                            if (MicrosoftOfficeDocumentType.indexOf(fileType2 || '') >= 0)
                                DocumentFullPath2 = embedFullFilePath2;
                            else
                                DocumentFullPath2 = (fileType2 === "zip" ? `${filePath2}?web = 1 & action=embedview` : filePath2);

                        } else {
                            DocumentFullPath2 = "";
                        }

                        return (
                            {
                                ID: data.ID,
                                ServiceDate: !!data.ServiceDate ? getConvertedDate(data.ServiceDate) : "",
                                ServiceUpdatedBy: !!data.ServiceUpdatedBy ? data.ServiceUpdatedBy : "",
                                // attachment: data.Attachments ? props.context.pageContext.web.absoluteUrl + '/Lists' + data.AttachmentFiles[0].ServerRelativeUrl.split('Lists')[1] : "",
                                url: DocumentFullPath ? DocumentFullPath : "",
                                url2: DocumentFullPath2 ? DocumentFullPath2 : ""
                            }
                        );
                    });
                    setListAssetHistory(AssetHistoryListData);

                }
            }).catch((error) => {
                console.log(error);
            });
            setcolumnsAssetHistory([

                { key: "key1", name: 'Service Date', fieldName: 'ServiceDate', isResizable: true, minWidth: 140, maxWidth: 170, isSortingRequired: true },
                { key: "key2", name: 'Service Updated By', fieldName: 'ServiceUpdatedBy', isResizable: true, minWidth: 140, maxWidth: 170 },
                {
                    key: 'attachment', name: 'Attachment', fieldName: '', minWidth: 30, maxWidth: 50,
                    onRender: ((item: any) => {
                        if (item.url != '' && item.url2 != '') {
                            return <>
                                <div className='dflex'>
                                    <Link className="actionBtn btnView dticon" onClick={() => {
                                        seturl(item.url2);
                                        setisPanelOpen(true);
                                    }}>
                                        <TooltipHost
                                            content={"View Attachment"}
                                            id={tooltipId}>
                                            <FontAwesomeIcon icon="eye" />
                                        </TooltipHost>
                                    </Link>
                                    <Link className="actionBtn btnDanger dticon" onClick={() => {
                                        seturl(item.url);
                                        setisPanelOpen(true);
                                    }}>
                                        <TooltipHost
                                            content={"View Invoice"}
                                            id={tooltipId}>
                                            <FontAwesomeIcon icon="file-invoice" />
                                        </TooltipHost>
                                    </Link>
                                </div >
                            </>;
                        } else {
                            if (item.url != '') {
                                return <>
                                    <div className='dflex'>
                                        <Link className="actionBtn btnDanger dticon" onClick={() => {
                                            seturl(item.url);
                                            setisPanelOpen(true);
                                        }}>
                                            <TooltipHost
                                                content={"View Invoice"}
                                                id={tooltipId}>
                                                <FontAwesomeIcon icon="file-invoice" />
                                            </TooltipHost>
                                        </Link>
                                    </div >
                                </>;
                            }
                            if (item.url2 != '') {
                                return <>
                                    <div className='dflex'>
                                        <Link className="actionBtn btnView dticon" onClick={() => {
                                            seturl(item.url2);
                                            setisPanelOpen(true);
                                        }}>
                                            <TooltipHost
                                                content={"View Attachment"}
                                                id={tooltipId}>
                                                <FontAwesomeIcon icon="eye" />
                                            </TooltipHost>
                                        </Link>
                                    </div >
                                </>;
                            }
                        }
                    })
                }
            ]);

        } catch (ex) {
            console.log(ex);
            const errorObj = {
                ErrorMessage: ex.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occuring while  _AssetHistory",
                PageName: "QuayClean.aspx",
                ErrorMethodName: "_AssetHistory AssetDetails"
            };
            void logGenerator(props.provider, errorObj);
        }
    };

    const onPanelclose = () => {
        setisPanelOpen(false);
    };

    const _userActivityLog = async () => {

        setIsLoading(true);
        let data = await getState();
        if (props?.componentProp?.qCStateId || data[0].QCStateId > 0) {
            try {
                let orgSiteId = props.componentProp.MasterId;
                const todayDate = moment().format("YYYY-MM-DD");
                const select = ["ID", "Email", "ActionType", "Created", "Count", "EntityType"];
                const queryStringOptions: IPnPQueryOptions = {
                    select: select,
                    listName: ListNames.UserActivityLog,
                    filter: `Email eq '${currentUserRoleDetail?.emailId}' and EntityId eq '${props?.siteMasterId}' and SiteNameId eq '${orgSiteId}' and EntityType eq '${UserActionEntityTypeEnum.EquipmentAsset}' and ActionType eq 'Details View' and Created ge datetime'${todayDate}T00:00:00Z' and Created le datetime'${todayDate}T23:59:59Z'`
                };
                const results = await props.provider.getItemsByQuery(queryStringOptions);
                if (results && results.length > 0) {
                    const listData = results.map((data) => ({
                        ID: data.ID,
                        Count: data.Count ?? '',
                    }));
                    let updateObj = {
                        Count: listData[0]?.Count + 1,
                    };
                    await props.provider.updateItemWithPnP(updateObj, ListNames.UserActivityLog, Number(listData[0]?.ID));
                } else {
                    const logObj = {
                        UserName: currentUserRoleDetail?.title,
                        SiteNameId: orgSiteId,
                        ActionType: UserActivityActionTypeEnum.DetailsView,
                        Email: currentUserRoleDetail?.emailId,
                        EntityType: UserActionEntityTypeEnum.EquipmentAsset,
                        EntityId: props?.siteMasterId,
                        EntityName: ListEquipment[0]?.Title,
                        Count: 1,
                        Details: "Details View",
                        StateId: props?.componentProp?.qCStateId || data[0].QCStateId
                    };
                    void UserActivityLog(provider, logObj, props?.loginUserRoleDetails);
                }
                isCall.current = false;
            } catch (error) {
                console.error("Error fetching user activity log:", error);
            } finally {
                setIsLoading(false);
            }
        }

    };

    React.useEffect(() => {
        if (displayerror === false && displayerrortitle === false && displayerroremail === false) {
            setbuttondisable(false);
        }
    }, [displayerror, displayerrortitle, displayerroremail]);

    React.useEffect(() => {
        setIsLoading(true);
        _ChecklistResponseMaster();
    }, [selectedOperator, selectedItem, fromDate, toDate, isRefreshGrid, assetTypeData, filterFromDate, filterToDate]);

    React.useEffect(() => {
        if (!!props.siteMasterId) {
            _EquipmentMaster();
            _AssetHistory();

        }
    }, [props.siteMasterId]);

    React.useEffect(() => {
        if (!!ListEquipment && ListEquipment.length > 0 && ListEquipment[0]?.Title !== "" && isCall.current == true) {
            isCall.current = false;
            _userActivityLog();
        }
    }, [ListEquipment]);

    React.useEffect(() => {
        if (isAssetHistoryModelOpen === false) {
            _EquipmentMaster();
            _AssetHistory();

        }
    }, [isAssetHistoryModelOpen]);

    React.useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 500);

        setcolumnCard([
            {
                key: 'Action', name: 'Action', fieldName: '', minWidth: 60, maxWidth: 80,
                onRender: ((item: any) => {
                    return <>
                        <div className='dflex'>
                            <Link className="actionBtn btnView dticon" onClick={() => {
                                _onClickCheckListDetailsView(item);
                            }}>
                                <TooltipHost
                                    content={"View Details"}
                                    id={tooltipId}>
                                    <FontAwesomeIcon icon="eye" />
                                </TooltipHost>
                            </Link>
                            {item.EndDate ? <div></div> : <div>
                                <Link className="actionBtn btnInfo dticon" onClick={() => onClickForcefullyBtn(item)}>
                                    <TooltipHost
                                        content={"Manual CheckOut"}
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon icon="arrow-rotate-left" />
                                    </TooltipHost>
                                </Link></div >}
                            {(item?.IsForceFully == "Yes" || item?.IsForceFully === "No" || item?.IsForceFully === "N/A") &&
                                <Link className="actionBtn btnDanger dticon">
                                    <TooltipHost
                                        content={<>
                                            <div><b>Have you discussed with the Operator?</b></div>
                                            <div>{item?.IsForceFully}</div>
                                            <div className="tooltip-mt-5"><b>Comment</b></div>
                                            <div>{item.Comment}</div>
                                        </>
                                        }
                                        id={tooltipId}
                                    >
                                        <FontAwesomeIcon icon="info-circle" />
                                    </TooltipHost>
                                </Link>
                            }

                        </div >
                    </>;
                })
            },
            {
                key: "Photo", name: 'Photo', fieldName: 'Operator Picture', isResizable: true, minWidth: 80, maxWidth: 120, isSortingRequired: true,
                onRender: (item: any) => (
                    <img src={!!item?.Image ? item?.Image : Base64Image} alt="Photo" className="course-img-first" style={{ height: "72px", width: '72px', borderRadius: "50%", objectFit: "cover" }} />
                ),
            },
            { key: "key1", name: 'Operator Name', fieldName: 'OperatorName', isResizable: true, minWidth: 140, maxWidth: 170, isSortingRequired: true },
            { key: "key2", name: 'Start Date Time', fieldName: 'StartDateTime', isResizable: true, minWidth: 140, maxWidth: 170 },
            { key: "key3", name: 'End Date Time', fieldName: 'EndDate', isResizable: true, minWidth: 140, maxWidth: 170 },
            {
                key: "key4", name: 'Duration', fieldName: 'duration', isResizable: true, minWidth: 150, maxWidth: 180,
                onRender: (item: any) => (
                    <span className={item.durationColor}>
                        {item.duration}
                    </span>
                )
            },
            { key: "key5", name: 'Is Asset Damaged', fieldName: 'IsAssetDamaged', isResizable: true, minWidth: 100, maxWidth: 150 },
            {
                key: 'key6', name: 'In Use', fieldName: '', minWidth: 70, maxWidth: 70,
                onRender: ((item: any) => {
                    if (item.EndDate == '' || item.EndDate == undefined || item.EndDate == null) {
                        return <>
                            <div className="adur-yellow-list">In use</div>
                        </>;
                    }
                })
            }
        ]);
        const className = document.querySelector('ARTICLE')?.children[0].children[0].classList[0];
        let el: any = document.querySelector(!!className ? `.${className}` : "");
        if (!!el && el.onscroll) {
            el.onscroll = null
        }
    }, []);

    React.useEffect(() => {
        if (!!ATData && ATData.length > 0)
            _ChecklistResponseMaster();
    }, [ATData]);

    const getStateAssociatedTeam = () => {
        if (!!props.siteMasterId && props.siteMasterId > 0) {
            try {
                let queryOptions: IPnPQueryOptions = {
                    listName: ListNames.SitesAssociatedTeam,
                    select: ["Id", "SiteNameId", 'Title', 'SkillSet', 'ATRole', "ATUserName", "Attachments", "AttachmentFiles", "Notes"],
                    expand: ["AttachmentFiles"],
                    filter: `SiteNameId eq ${props.componentProp.MasterId}`,
                    // siteUrl: siteURL
                };
                return props.provider.getItemsByQuery(queryOptions);
            } catch (error) {
                console.log(error);
                setIsLoading(false);
            }
        }
        return [];
    };

    const getState = () => {
        if (!!props.siteMasterId && props.siteMasterId > 0) {
            try {
                let queryOptions: IPnPQueryOptions = {
                    listName: ListNames.SitesMaster,
                    select: ["Id", "QCStateId"],
                    filter: `Id eq ${props.componentProp.MasterId}`,
                    // siteUrl: siteURL
                };
                return props.provider.getItemsByQuery(queryOptions);
            } catch (error) {
                console.log(error);
                setIsLoading(false);
            }
        }
        return [];
    };

    React.useEffect(() => {

        try {
            void (async () => {
                setIsLoading(true);
                let i = 0;
                i = i + 1;
                const [siteAssociatedTeam] = await Promise.all([getStateAssociatedTeam()]);
                let assignedTeam: IAssociatedTeam[] = [];
                if (!!siteAssociatedTeam && siteAssociatedTeam?.length > 0) {
                    assignedTeam = siteAssociatedTeam.map((data: any) => {
                        let attachmentFiledata: any;
                        if (data.AttachmentFiles.length > 0) {
                            const fixImgURL = props.context.pageContext.web.serverRelativeUrl + '/Lists/AssetMaster/Attachments/' + data.Id + "/";
                            try {
                                const AttachmentData = data.AttachmentFiles[0];
                                if (AttachmentData && AttachmentData.ServerRelativeUrl) {
                                    attachmentFiledata = AttachmentData.ServerRelativeUrl;
                                } else if (AttachmentData && AttachmentData.FileName) {
                                    attachmentFiledata = fixImgURL + AttachmentData.FileName;
                                } else {
                                    attachmentFiledata = "";
                                }
                            } catch (error) {
                                console.error("Error parsing AssetPhoto JSON:", error);
                                attachmentFiledata = "";
                            }
                        } else {
                            attachmentFiledata = null;
                        }
                        return {
                            id: data.ID,
                            title: !!data.Title ? data.Title : "",
                            aTUserName: !!data.ATUserName ? data.ATUserName : "",
                            aTRole: !!data.ATRole ? data.ATRole : "",
                            siteNameId: data.SiteNameId ? data.SiteNameId : "",
                            Notes: data.Notes ? data.Notes : "",
                            attachmentURl: attachmentFiledata,
                            SkillSet: !!data.SkillSet ? data.SkillSet : "",
                        };
                    });
                }
                setATData(assignedTeam);
                if (i == 2) {
                    setIsLoading(false);
                }

            })();
        } catch (error) {
            setIsLoading(false);
            console.log(error);
        }
    }, []);

    const onRenderFooterContent = () => {
        return <div>
            <PrimaryButton className="btn btn-danger" onClick={onPanelclose} text="Close" />
        </div>;
    };

    const _onClickCheckListDetailsView = (item: any) => {

        try {
            //const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
            const objItem: ICheckListDetail = {
                PreId: item.PreItemId,
                PostId: item.PostItemId,
                AssetMasterId: props?.componentProp?.siteMasterId || 0,
                SiteNameId: props?.componentProp?.MasterId || 0
            };
            props.manageComponentView({
                // currentComponentName: !!props.preViousCompomentName ? props.preViousCompomentName : ComponentNameEnum.DailyOperatorChecklist,
                currentComponentName: ComponentNameEnum.DailyOperatorChecklist,
                dataObj: props.componentProp.dataObj,
                breadCrumItems: breadCrumItems,
                IsSupervisor: props.componentProp.IsSupervisor,
                siteMasterId: props.componentProp.MasterId,
                isShowDetailOnly: true,
                siteName: props.componentProp.siteName,
                qCState: props.componentProp.qCState,
                pivotName: "PreChecklist",
                checkListObj: objItem
            });
        } catch (error) {
            const errorObj = { ErrorMethodName: "_onClickCheckListDetailsView", CustomErrormessage: "error in on click details view", ErrorMessage: error.toString(), ErrorStackTrace: "", PageName: "QuayClean.aspx" };
            void logGenerator(props.provider, errorObj);
        }
    };

    const onViewActionChange = (ViewAction: any): void => {
        setSelectedViewAction(ViewAction);
        if (ViewAction == "Card View") {
            setIsViewCard(true);
        } else {
            setIsViewCard(false);
        }
    };

    const _onClickPDF = async (): Promise<void> => {
        showPopup();
    };

    const onClickClose = () => {
        setDisplayForcefullyDialog(false);
        setIsRefreshGrid(prevState => !prevState);
    };

    const onClickForcefullyBtn = (e1: any): void => {
        setCurrentCardData(e1);
        setDisplayForcefullyDialog(true);
    };

    const onClickBackClose = () => {
        // if (props.componentProp.isMaster) {
        //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
        //     props.manageComponentView({ currentComponentName: ComponentNameEnum.AssetList, view: props?.componentProp?.view, breadCrumItems: breadCrumItems });
        // } else {
        //     const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
        //     props.manageComponentView({
        //         currentComponentName: !!props.preViousCompomentName ? props.preViousCompomentName : ComponentNameEnum.AddNewSite,
        //         view: props?.componentProp?.view,
        //         dataObj: props.componentProp.dataObj,
        //         breadCrumItems: breadCrumItems,
        //         IsSupervisor: props.componentProp.IsSupervisor,
        //         siteMasterId: props.componentProp.MasterId, isShowDetailOnly: true,
        //         siteName: props.componentProp.siteName,
        //         qCState: props.componentProp.qCState,
        //         pivotName: "EquipmentKey"
        //     });
        // }
        if (isSiteLevelComponent) {
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.ZoneViceSiteDetails,
                selectedZoneDetails: selectedZoneDetails,
                isShowDetailOnly: true,
                pivotName: "EquipmentKey",
            });
        } else {
            // const breadCrumItems = removeElementOfBreadCrum(props.breadCrumItems);
            // props.manageComponentView({ currentComponentName: ComponentNameEnum.Quaysafe, qCStateId: props?.componentProps?.qCStateId, breadCrumItems: breadCrumItems, view: props.componentProps.viewType, subpivotName: "ToolboxTalk", selectedZoneDetails: props.componentProps.selectedZoneDetails });
            props.manageComponentView({
                currentComponentName: ComponentNameEnum.AssetList,
                siteMasterId: props.componentProp?.siteMasterId,
                siteName: props.componentProp?.siteName,
                qCState: props.componentProp?.qCState,
                IsSupervisor: props.componentProp?.IsSupervisor,
                selectedZoneDetails: selectedZoneDetails
                // breadCrumItems: props.breadCrumItems,
                // dataObj: props.componentProp?.dataObj,
                // isSiteInformationView: true
            });
        }
    };

    const updateStatusInList = async () => {
        // if (!selectedStatus) {
        //     alert("Please select a status before saving.");
        //     return;
        // }
        setIsLoading(true);
        const toastId = toastService.loading('Loading...');
        try {
            const statusData = { AMStatus: selectedStatus };
            await props.provider.updateItem(statusData, ListNames.AssetMaster, props?.siteMasterId);
            toastService.updateLoadingWithSuccess(toastId, Messages.StatusUpdated);
            setIsEditStatusOpen(false);
            _EquipmentMaster();
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return <>
        {displayForcefullyDialog && CurrentCardData && <ForceFullyCheckList AssetMasterId={props.siteMasterId} SiteNameId={props.componentProp.MasterId} CurrentCardData={CurrentCardData} context={props.context} provider={props.provider} onClickClose={onClickClose} isModelOpen={true} />}
        {isLoading && <Loader />}
        <Panel
            isOpen={isPanelOpen}
            onDismiss={() => onPanelclose()}
            type={PanelType.extraLarge}
            onRenderFooterContent={onRenderFooterContent}
        >
            <iframe
                src={url}
                style={{ width: "100%", height: "100vh" }}
            />

        </Panel>

        {isAssetHistoryModelOpen && <UpdateServiceHistroy
            provider={props.provider} alldata={!!ListEquipment[0] ? ListEquipment[0] : []} assetMasterId={!!ListEquipment[0].ID ? ListEquipment[0].ID : 0}
            isModelOpen={isAssetHistoryModelOpen}
            onClickClose={function () {
                SetIsAssetHistoryModelOpen(false);

            }}
            context={props.context} />}
        {!!ListEquipment[0] &&
            <div className="boxCard">
                <main>
                    <section className="pt-4">
                        <div className="">

                            <div className="row">
                                <div className="col-12 dFlex justifyContentBetween mb-3">
                                    <div><h2 className="mainTitle mb-0">Assets Details</h2></div>
                                    <div className="dFlex">
                                        <div>
                                            <PrimaryButton className="btn btn-danger" text="Back"
                                                onClick={() => { onClickBackClose() }}
                                            />
                                        </div>
                                        <div>
                                            <PrimaryButton
                                                className="btn btn-primary ml-10"
                                                text="Equipment Checklist"
                                                onClick={() => {
                                                    // Redirect to the specified URL based on itmId
                                                    const itmId = props.componentProp.siteMasterId;
                                                    const externalURL = getExternalUrl(props.context);
                                                    const redirectUrl = `${externalURL}/Assets/AssetsDetail?ItemId=${itmId}`;
                                                    //window.location.href = redirectUrl;
                                                    window.open(redirectUrl, '_blank');
                                                }}
                                            />
                                        </div>

                                        {isWithinNextMonthRange(ListEquipment[0].fullServiceDueDate) &&
                                            (props.loginUserRoleDetails.isAdmin || props.loginUserRoleDetails?.siteManagerItem.filter((r: any) => r.Id == props.componentProp.MasterId && r.SiteManagerId?.indexOf(props.loginUserRoleDetails.Id) > -1).length > 0) ?
                                            <div>
                                                {!props.IsSupervisor &&
                                                    <PrimaryButton className="ml-10 btn btn-primary" text="Service History" onClick={() => {
                                                        SetIsAssetHistoryModelOpen(true);
                                                    }} />}
                                            </div> :
                                            <> {isWithinNextMonthRange(ListEquipment[0].fullServiceDueDate) &&
                                                // <div style={{ width: "275px" }} >
                                                <div className="cml-5">
                                                    <MessageBar messageBarType={MessageBarType.severeWarning}
                                                    ><div className="inputText" > Service is Due on : {ListEquipment[0].ServiceDueDate}  </div></MessageBar>
                                                </div>}
                                            </>

                                        }
                                    </div>

                                </div>
                                <div className="col-12 dFlex justifyContentBetween mb-3">
                                    <div className="customebreadcrumb">
                                        <Breadcrumb
                                            items={props.breadCrumItems}
                                            maxDisplayedItems={3}
                                            ariaLabel="Breadcrumb with items rendered as buttons"
                                            overflowAriaLabel="More links"
                                        />
                                    </div>
                                </div>
                                <div className="col-lg-3 col-md-4 mb-3">
                                    <div className="">
                                        <img src={`${ListEquipment[0].AssetImage}`} className="img-fluid" />

                                    </div>
                                </div>
                                <div className="col-lg-9 col-md-8 mb-3">
                                    <div className="row">
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Site Name
                                                </label>
                                                <div className="inputText listDetail">{ListEquipment[0].SiteName}</div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Assets Name
                                                </label>
                                                <div className="inputText listDetail">{ListEquipment[0].Title}</div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Manufacturer
                                                </label>
                                                <div className="inputText listDetail">{ListEquipment[0].Manufacturer}</div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Model
                                                </label>
                                                <div className="inputText listDetail">{ListEquipment[0].Model}</div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Assets Type
                                                </label>
                                                <div className="inputText listDetail">{ListEquipment[0].AssetType}</div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Color
                                                </label>
                                                <div className="inputText listDetail">{ListEquipment[0].Color}</div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Serial Number
                                                </label>
                                                <div className="inputText listDetail">{ListEquipment[0].SerialNumber}</div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Service Due Date
                                                </label>
                                                <div className={`inputText listDetail ${!ListEquipment[0]?.ServiceDueDate ? "emptyNotes" : ""}`}>{ListEquipment[0]?.ServiceDueDate}</div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">Status</label>
                                                <div className="inputText listDetail d-flex align-items-center">
                                                    {ListEquipment[0]?.Status}
                                                    {ListEquipment[0]?.Status === "In repair" && (
                                                        <Link
                                                            className="ms-2"
                                                            title="Edit Status"
                                                            onClick={handleEditStatusClick}
                                                        >
                                                            <TooltipHost content={"Edit"} id={tooltipId}>
                                                                <FontAwesomeIcon icon="edit" style={{ color: "#0078d4", cursor: "pointer" }} />
                                                            </TooltipHost>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Purchase Date
                                                </label>
                                                <div className="inputText listDetail">{ListEquipment[0].PurchaseDate}</div>
                                            </div>
                                        </div>
                                        {/* <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Asset No
                                                </label>
                                                <div className={`inputText listDetail ${!ListEquipment[0].AssetNo ? 'emptyNotes' : ''}`}>{ListEquipment[0].AssetNo}</div>
                                            </div>
                                        </div> */}
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Equipment Type
                                                </label>
                                                <div className={`inputText listDetail ${!ListEquipment[0].EquipmentType ? 'emptyNotes' : ''}`}>{ListEquipment[0].EquipmentType}</div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Acquisition Value
                                                </label>
                                                <div className={`inputText listDetail ${!ListEquipment[0].AcquisitionValue ? 'emptyNotes' : ''}`}>
                                                    {ListEquipment[0]?.AcquisitionValue ? formatPriceDecimal(ListEquipment[0]?.AcquisitionValue) : ''}
                                                </div>
                                            </div>
                                        </div>
                                        {ListEquipment[0].AcquisitionValue > 1000 && (
                                            <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                                <div className="formGroup">
                                                    <label className="viewLabel">FA Number</label>
                                                    <div className={`inputText listDetail ${!ListEquipment[0].FANumber ? "emptyNotes" : ""}`}
                                                    >
                                                        {!!ListEquipment[0]?.FANumber ? `${ListEquipment[0].FANumber}` : ""}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Book Value
                                                </label>
                                                <div className={`inputText listDetail ${!ListEquipment[0].PurchasePrice ? 'emptyNotes' : ''}`}>
                                                    {ListEquipment[0]?.PurchasePrice ? formatPriceDecimal(ListEquipment[0]?.PurchasePrice) : ''}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Location
                                                </label>
                                                <div className={`inputText listDetail ${!ListEquipment[0]?.AssetCategory ? 'emptyNotes' : ''}`}>{ListEquipment[0].AssetCategory}</div>
                                            </div>
                                        </div>

                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formGroup">
                                                <label className="viewLabel">
                                                    Asset Manual
                                                </label>
                                                {ListEquipment[0].Attachment != null ?
                                                    <div className="inputText" style={{ display: "flex" }}>

                                                        <Link className="actionBtn btnPDF dticon ml5 " target="blank" href={ListEquipment[0].Attachment}>
                                                            <TooltipHost
                                                                content={"View Document"}
                                                                id={tooltipId}
                                                            >
                                                                <FontAwesomeIcon icon="file-pdf" />
                                                            </TooltipHost>
                                                        </Link >
                                                        <TooltipHost
                                                            content={"View Document"}
                                                            id={tooltipId}
                                                        >
                                                            <a target="_blank" onClick={() => { window.open(ListEquipment[0].Attachment, '_blank'); }} >
                                                                View Document
                                                            </a></TooltipHost>
                                                    </div> : <div className="inputText listDetail">No document available</div>}
                                            </div>
                                        </div>
                                        {ListEquipment[0].ConditionNotes != "" &&
                                            <div className="col-lg-12 col-md-6 col-sm-6 col-12">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Condition Notes
                                                    </label>
                                                    {isLink(ListEquipment[0]?.ConditionNotes) ?
                                                        <div className="inputText" style={{ display: "flex" }}>

                                                            <Link className="actionBtn btnPDF dticon ml5 " target="blank" onClick={() => { window.open(`${ListEquipment[0]?.ConditionNotes}`, '_blank'); }}>
                                                                <TooltipHost
                                                                    content={"View Link"}
                                                                    id={tooltipId}
                                                                >
                                                                    <FontAwesomeIcon icon="eye" />
                                                                </TooltipHost>
                                                            </Link >
                                                            <TooltipHost
                                                                content={ListEquipment[0]?.ConditionNotes}
                                                                id={tooltipId}
                                                            >
                                                                <a target="_blank" onClick={() => { window.open(`${ListEquipment[0]?.ConditionNotes}`, '_blank'); }} >
                                                                    View Link
                                                                </a></TooltipHost>
                                                        </div>

                                                        :
                                                        <div className="inputText listDetail">{ListEquipment[0].ConditionNotes}</div>}
                                                </div>
                                            </div>}
                                        {ListEquipment[0]?.RealImagesLinksArray.length > 0 &&
                                            <div className="col-lg-6 col-md-6 col-sm-6 col-12">
                                                <div className="formGroup">
                                                    <label className="viewLabel">
                                                        Asset's Real Image(s)
                                                    </label>
                                                    <ul className="imageLinksList">
                                                        {ListEquipment[0]?.RealImagesLinksArray?.map((link: string, index: React.Key | null | undefined) => (
                                                            <li key={index} className="imageLinkItem" style={{ display: "flex", padding: "3px" }}>
                                                                <Link className="" target="_blank" onClick={() => {
                                                                    seturl(link.trim());
                                                                    setisPanelOpen(true);
                                                                }}>
                                                                    <TooltipHost content={"View Asset's Real Image(s)"} id={`${tooltipId}-${index}`}>
                                                                        {/* <FontAwesomeIcon icon="eye" className="actionBtn " /> */}
                                                                        <span className="img-name-text"> {ListEquipment[0]?.RealImagesLinksfilename[`${index}`]}</span>
                                                                    </TooltipHost>
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>}

                                        <div className="col-lg-3 col-md-6 col-sm-6 col-12">
                                            <div className="formgroup">
                                                <label className="viewLabel">
                                                    Website Link
                                                </label>
                                                {ListEquipment[0]?.WebsiteLink ?
                                                    <div className="dflex">
                                                        <Link
                                                            className="actionBtn dticon sitelinkBtn"
                                                            onClick={() => {
                                                                const url = ListEquipment[0]?.WebsiteLink;
                                                                if (url) {
                                                                    window.open(url, '_blank');
                                                                }
                                                            }}
                                                        >
                                                            <TooltipHost content={"View Website Link"} id={tooltipId}>
                                                                <FontAwesomeIcon icon="link" /><span className="linklbl">Click to open</span>
                                                            </TooltipHost>
                                                        </Link> </div> :
                                                    <span>Website link not found</span>}
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-lg-6 col-12 col-md-6 mb-3">
                                    {selectedKey === "Services History" ?
                                        <div><h2 className="mainTitle">Services History</h2></div>
                                        :
                                        <div><h2 className="mainTitle">Asset Daily Usage Report</h2></div>
                                    }
                                    <Pivot aria-label="Basic Pivot Example" className="mt-4" id="mainpivot" selectedKey={selectedKey}
                                        onLinkClick={_onLinkClick}>
                                        <PivotItem headerText="Asset Daily Usage Report" itemKey="AssetDailyUsageReport">
                                            <div className='mt-4'>
                                                <div className="ms-Grid-row filtermrg mt-2">
                                                    {/* Hidden operator dropdown for machine operator selection..
                                                        Updated by Trupti on 18/9/2025.
                                                    */}
                                                    {/* <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg8 ms-xl4">
                                                        <div className="formControl">
                                                            <OperatorFilter
                                                                selectedOperator={selectedOperator}
                                                                onOperatorChange={onOperatorChange}
                                                                provider={props.provider}
                                                                isRequired={true}
                                                                SiteNameId={props?.componentProp?.MasterId}
                                                                AllOption={true} />
                                                        </div>
                                                    </div> */}
                                                    <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl5">
                                                        <PreDateRangeFilter
                                                            fromDate={fromDate}
                                                            toDate={toDate}
                                                            onFromDateChange={onChangeFromDate}
                                                            onToDateChange={onChangeToDate}
                                                            onChangeRangeOption={onChangeRangeOption}
                                                        />
                                                    </div>
                                                    <div className="ms-Grid-col ms-sm12 ms-md6 ms-lg8 ms-xl3">
                                                        <div className="formControl">
                                                            <ViewActionFilter
                                                                selectedViewAction={selectedViewAction}
                                                                onViewActionChange={onViewActionChange}
                                                                provider={props.provider}
                                                                defaultOption={selectedViewAction}
                                                                isRequired={true}
                                                                AllOption={true}
                                                            />
                                                        </div>
                                                    </div>
                                                    {CardData.length !== 0 &&
                                                        <div className="ms-Grid-col ms-sm12 ms-md12 ms-lg12 ms-xl12 asset-details-btn-align dflex justify-content-end">
                                                            {/* <PrimaryButton className="btn btn-primary ad-mr-11" onClick={_onClickPDF} text="" > <FontAwesomeIcon icon="paper-plane" className="clsbtnat" /><div>Send Email</div></PrimaryButton> */}
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
                                                                    />
                                                                </TooltipHost>
                                                            </Link>
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
                                                        </div>
                                                    }
                                                </div>

                                                <div className="ms-Grid-row mar-nrf">
                                                    {CardData.length == 0 &&
                                                        <NoRecordFound />
                                                    }
                                                </div>

                                                {isViewCard === true &&
                                                    <>
                                                        <div className="row assetDailyUsageCards">
                                                            {CardData.length > 0 && CardData.map((e1: any, i1: any) => {
                                                                return (
                                                                    <div className="col-12 col-sm-6 col-md-12 col-lg-6 col-xl-6 asset-detail-hover mb-3" >
                                                                        {/* <div className="col-12 col-sm-6 col-md-12 col-lg-6 col-xl-6 asset-detail-hover" > */}
                                                                        <div className="adur-card">
                                                                            <div className="pic-name-wrap" onClick={() => {
                                                                                _onClickCheckListDetailsView(e1);
                                                                            }}>
                                                                                <div className="pic-wrap" >
                                                                                    <img src={e1.Image ? e1.Image : require('../../../assets/images/User-Paceholder.png')} />
                                                                                </div>
                                                                                <h3 className="chart-image">{e1.OperatorName}</h3>
                                                                            </div>

                                                                            <div className="adur-card-content">

                                                                                <div className="adur-dates" onClick={() => {
                                                                                    _onClickCheckListDetailsView(e1);
                                                                                }}>
                                                                                    <span> <FontAwesomeIcon icon="clock-rotate-left" />{e1.StartDateTime}</span>
                                                                                    <span> <FontAwesomeIcon icon="clock-rotate-left" />{e1.EndDate ? e1.EndDate : "Not Available"}</span>
                                                                                    <span style={{ fontWeight: "bold" }}>
                                                                                        <FontAwesomeIcon icon="hourglass-half" className="mr-1" /> <span className={e1.durationColor}>{e1?.duration}</span>
                                                                                    </span>
                                                                                </div>
                                                                                <div className="adur-status dflex">
                                                                                    {e1.EndDate ? <div></div> : <div><span className="is-dam-txt"></span><button className="adur-yellow">In use</button></div>}
                                                                                    {e1.EndDate ? <div></div> : <div>
                                                                                        <Link className="actionBtn btnInfo dticon ad-icon-info" onClick={() => onClickForcefullyBtn(e1)}>
                                                                                            <TooltipHost
                                                                                                content={"Manual CheckOut"}
                                                                                                id={tooltipId}
                                                                                            >
                                                                                                <FontAwesomeIcon icon="arrow-rotate-left" />
                                                                                            </TooltipHost>
                                                                                        </Link></div >}
                                                                                    {(e1?.IsForceFully === "Yes" || e1?.IsForceFully === "No" || e1?.IsForceFully === "N/A") &&
                                                                                        <Link className="actionBtn btnDanger dticon ad-icon-danger">
                                                                                            <TooltipHost
                                                                                                content={<>
                                                                                                    <div><b>Have you discussed with the Operator?</b></div>
                                                                                                    <div>{e1?.IsForceFully}</div>
                                                                                                    <div className="tooltip-mt-5"><b>Comment</b></div>
                                                                                                    <div>{e1.Comment}</div>
                                                                                                </>
                                                                                                }
                                                                                                id={tooltipId}
                                                                                            >
                                                                                                <FontAwesomeIcon icon="info-circle" />
                                                                                            </TooltipHost>
                                                                                        </Link>
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </>}
                                                {isViewCard === false &&
                                                    <>
                                                        {CardData.length > 0 &&
                                                            <div className='mt-2'>
                                                                <div className="mb-3 tableResponsive">
                                                                    <MemoizedDetailList
                                                                        manageComponentView={props.manageComponentView}
                                                                        columns={columnCard}
                                                                        items={CardData || []}
                                                                        reRenderComponent={true}
                                                                        onSelectedItem={_onItemSelected}
                                                                        searchable={false}
                                                                    />
                                                                </div>
                                                            </div>
                                                        }
                                                    </>}


                                            </div>
                                        </PivotItem>
                                        <PivotItem headerText="Services History" itemKey="Services History">
                                            <div className='mt-3'>
                                                <div className="mb-3 tableResponsive">
                                                    <MemoizedDetailList
                                                        manageComponentView={props.manageComponentView}
                                                        columns={columnsAssetHistory}
                                                        items={ListAssetHistory || []}
                                                        reRenderComponent={true}
                                                        onSelectedItem={_onItemSelected}
                                                        searchable={true}
                                                    />
                                                </div>
                                            </div>
                                        </PivotItem>

                                    </Pivot>

                                </div>
                                <div className="col-lg-6 col-12 col-md-6 mb-3">
                                    <div><h2 className="mainTitle">  Video Link</h2></div>
                                    {VideoURL != "" ?
                                        <div className="ratio mb-3">
                                            <iframe className="" src={VideoURL} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" />
                                        </div> :
                                        <div className="inputText">No Video Available</div>
                                    }

                                    <div className="videoThumb">
                                        {videoLinks?.map((link: any, index: any) => (
                                            <div className="">
                                                <div key={index} className={`video-link-item2 ${activeIndex === index ? 'active' : ''}`} onClick={() => handleLinkClick(link, index)}>
                                                    <div className="VideoLinkCLS">
                                                        <span
                                                            style={{ cursor: 'pointer', color: 'blue', marginRight: '0px', marginLeft: '0px', marginBottom: '3px' }}
                                                        >
                                                            <img src={require('../../../assets/images/videoicon.svg')} width={45} height={45} />
                                                            {/* <img src={require("../../assets/images/video-camera-alt.svg")} /> */}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="row mb-3">
                                <div className="col-md-12 col-sm-12 col-12 mb-3 textRight">
                                    <PrimaryButton className="btn btn-danger justifyright floatright mb-3" text="Back"
                                        onClick={() => { onClickBackClose() }}
                                    />
                                </div>
                            </div>
                        </div>
                    </section >
                </main >
            </div >
        }

        <div id="pdfGenerateAD" className="dnone">
            {!!ListEquipment[0] &&
                <>
                    <table width="100%" className="wts assets-prit-table assets-logo-table">
                        <tbody>
                            <tr>
                                <td
                                    className="pt-16 pl-16 pr-16 wts  text-start">
                                    <div className="asset-Details-Title">
                                        <img src={imgLogo} height="90px" width="90px" className="course-img-first" />
                                        <div>Daily Usage Report</div>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td
                                    className="pb-16 pl-16 pr-16 wts  text-start">
                                    <span className="mb-0 headerPDF">{ListEquipment[0].Title}</span>
                                </td>
                            </tr>
                            <tr>
                                <td
                                    className=" pt-16 pb-16 pl-16 pr-16 wts  text-start">
                                    <span className="headerOperatorName">{props?.siteName} &nbsp;</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table width="100%" className="wts assets-prit-table" cellSpacing={0} cellPadding={0}>
                        <tbody>

                            <tr>
                                <td colSpan={2}
                                    className="pt-16 pb-16 pl-16 bb1 text-start f16 fw-bold bb1 wts">
                                    <span
                                        className="mt-0 mb-8 word-break f16 fw-bold">
                                        Manufacturer </span>

                                </td>
                                <td
                                    className="pt-16 pb-16 pl-16 bb1 text-end f16  bb1 wts">
                                    <p
                                        className="mt-0 mb-0 word-break pb-16 pl-16 text-end f16">
                                        {ListEquipment[0].Manufacturer}</p>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2}
                                    className="pt-16 pb-16 pl-16 bb1 text-start f16 fw-bold bb1 wts">
                                    <span
                                        className="mt-0 mb-8 word-break f16 fw-bold">
                                        Model </span>

                                </td>
                                <td
                                    className="pt-16 pb-16 pl-16 bb1 text-end f16  bb1 wts">
                                    <p
                                        className="mt-0 mb-0 word-break pb-16 pl-16 text-end f16">
                                        {ListEquipment[0].Model}</p>
                                </td>
                            </tr>
                            <tr>
                                <td colSpan={2}
                                    className="pt-16 pb-16 pl-16 bb1 text-start f16 fw-bold bb1 wts">
                                    <span
                                        className="mt-0 mb-8 word-break f16 fw-bold">
                                        Serial Number </span>

                                </td>
                                <td
                                    className="pt-16 pb-16 pl-16 bb1 text-end f16  bb1 wts pad-pdf-btm">
                                    <p
                                        className="mt-0 mb-0 word-break pb-16 pl-16 text-end f16">
                                        {ListEquipment[0].SerialNumber}</p>
                                </td>
                            </tr>
                            {selectedOperator &&
                                <tr>
                                    <td colSpan={2}
                                        className="pt-16 pb-16 pl-16 bb1 text-start f16 fw-bold bb1 wts">
                                        <span
                                            className="mt-0 mb-8 word-break f16 fw-bold">
                                            Operator Name </span>

                                    </td>
                                    <td
                                        className="pt-16 pb-16 pl-16 bb1 text-end f16  bb1 wts pad-pdf-btm">
                                        <p
                                            className="mt-0 mb-0 word-break pb-16 pl-16 text-end f16">
                                            {selectedOperator}</p>
                                    </td>
                                </tr>}
                            <tr>
                                <td colSpan={2}
                                    className="pt-16 pb-16 pl-16 bb1 text-start f16 fw-bold bb1 wts">
                                    <span
                                        className="mt-0 mb-8 word-break f16 fw-bold">
                                        Date Range </span>

                                </td>
                                <td
                                    className="pt-16 pb-16 pl-16 bb1 text-end f16  bb1 wts pad-pdf-btm">
                                    <p
                                        className="mt-0 mb-0 word-break pb-16 pl-16 text-end f16">
                                        {moment().startOf('month').format('DD-MM-YYYY')} to {moment().endOf('month').format('DD-MM-YYYY')}</p>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </>}
            <table className="pl-16 pr-16 wts pt-14-imp assets-prit-table">
                <thead>
                    <tr>
                        <th className="asset-details-print">Photo</th>
                        <th className="asset-details-print">Operator</th>
                        <th className="asset-details-print">Start Date Time</th>
                        <th className="asset-details-print">End Date Time</th>
                        <th className="asset-details-print">Duration</th>
                        <th className="asset-details-print">Damaged?</th>
                    </tr>
                </thead>
                <tbody>
                    {CardData.map((item: any) => (
                        <tr className='card-assigned-team' >
                            <td className="">
                                <div className="at-profile">

                                    <img
                                        src={!!item.Image ? item?.Image : Base64Image}
                                        alt={item.title}
                                    />

                                </div>
                            </td>
                            <td className="asset-details-td">{item.OperatorName}</td>
                            <td className="asset-details-td">{item.StartDateTime}</td>
                            <td className="asset-details-td">{item.EndDate}</td>
                            <td className="asset-details-td"> {item.duration} </td>
                            <td className="asset-details-td">{item.IsAssetDamaged}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {isEditStatusOpen && (
            <CustomModal
                isModalOpenProps={isEditStatusOpen}
                setModalpopUpFalse={() => setIsEditStatusOpen(false)}
                subject={"Update Status"}
                message={
                    <div className="formControl">
                        <StatusFilter
                            selectedStatus={selectedStatus}
                            defaultOption={selectedStatus}
                            onStatusChange={onStatusChange}
                            provider={props.provider}
                            isRequired={true}
                        />
                    </div>
                }
                closeButtonText={"Cancel"}
                yesButtonText={"Update"}
                onClickOfYes={updateStatusInList}
            />
        )}
    </>;
};

