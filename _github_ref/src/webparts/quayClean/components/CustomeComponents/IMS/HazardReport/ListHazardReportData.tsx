import { useAtomValue } from "jotai";
import { IListHazardReport } from "../../../../../../Interfaces/IListHazardReport";
import { appGlobalStateAtom } from "../../../../../../jotai/appGlobalStateAtom";
import React, { useRef, useState } from "react";
import { IColumn, IDropdownOption, Link, TooltipHost } from "@fluentui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ComponentNameEnum, ListNames, UserActionEntityTypeEnum, UserActionLogFor, UserActivityActionTypeEnum } from "../../../../../../Common/Enum/ComponentNameEnum";
import { generateAndSaveKendoHazardPDF, generateExcelTable, getCAMLQueryFilterExpression, logGenerator, onBreadcrumbItemClicked, UserActivityLog } from "../../../../../../Common/Util";
import { IBreadCrum } from "../../../../../../Interfaces/IBreadCrum";
import { useId } from "@fluentui/react-hooks";
import { FieldType, ICamlQueryFilter, LogicalType } from "../../../../../../Common/Constants/DocumentConstants";
import { HazardFields, HazardViewFields } from "../../../../../../Common/Enum/HazardFields";
import CamlBuilder from "camljs";
import moment from "moment";
import { Messages } from "../../../../../../Common/Constants/Messages";
import { toastService } from "../../../../../../Common/ToastService";
import { formatSPDateToLocal, generateExcelFileName, getFileType, getHazardIconUrl, getHazardLinkURL, getHazardQRCodeURL, getState } from "../../../CommonComponents/CommonMethods";
import { selectedZoneAtom } from "../../../../../../jotai/selectedZoneAtom";
import { isSiteLevelComponentAtom } from "../../../../../../jotai/isSiteLevelComponentAtom";
import IPnPQueryOptions from "../../../../../../DataProvider/Interface/IPnPQueryOptions";
interface ISelectedSites {
    ids: any[];
    titles: string[];
    scSites: string[];
}
interface IHazardData {
    HazardData: any[];
    PDFData: any[];
    AttchmentsData: any[];
    selectedHazardType: any[];
    selectedSubHazardType: any[];
    selectedSubmittedBy: any;
    selectedArchive: any;
    isRefresh: boolean;
    isRefreshOptions: boolean;
    SubmittedByOptions: any[];
    HazardTypeOptions: any[];
    SubHazardTypeOptions: any[];
    fromDate: any;
    toDate: any;
    filterFromDate: any;
    filterToDate: any;
    selectedDateItem: IDropdownOption;
    selectedHazardItem: any;
    isOpenArchiveModal: boolean;
    filterHazardValue: any;
    filteredHazardData: any[];
    isLocalFilter: any;
    isHazardQrModelOpen: boolean;
    HazardQRCodeImage: any;
    isHazardSiteUpdate: any;
    isAttachmentModalOpen: any;
    stateTabData: any;
    stateCountData: any;
    selectedStateId: any;
}
const DEBOUNCE_DELAY = 200;
export const ListHazardReportData = (props: IListHazardReport) => {
    const appGlobalState = useAtomValue(appGlobalStateAtom);
    const { provider, context, currentUserRoleDetail, currentUser } = appGlobalState;
    const selectedZoneDetails = useAtomValue(selectedZoneAtom);
    const isSiteLevelComponent = useAtomValue(isSiteLevelComponentAtom);
    const [currentView, setCurrentView] = React.useState<string>(props?.view ? props?.view : (window.innerWidth <= 768 ? 'card' : 'grid'));
    let siteData = React.useRef<any>([]);
    const [isLoading, setIsLoading] = useState(true);
    const tooltipId = useId('tooltip');
    // const [fileHazardData, setFileHazardData] = React.useState<any[]>([]);
    const [columns, setColumns] = useState<any>([]);
    const fileHazardData = useRef([]);
    const qrLinkURL = useRef("");
    const hazardCountCard = useRef<any[]>([]);
    const [isPdfMode, setisPdfMode] = useState(false);
    const [selectedSites, setSelectedSites] = React.useState<ISelectedSites>({
        ids: [],
        titles: [],
        scSites: [],
    });
    // const [PDFData, setPDFData] = React.useState<any>();
    const [state, setState] = React.useState<IHazardData>({
        HazardData: [],
        PDFData: [],
        AttchmentsData: [],
        selectedHazardType: [],
        stateCountData: "",
        selectedSubHazardType: [],
        selectedSubmittedBy: null,
        stateTabData: [],
        selectedArchive: "No",
        isRefresh: false,
        isRefreshOptions: true,
        SubmittedByOptions: [],
        HazardTypeOptions: [],
        SubHazardTypeOptions: [],
        fromDate: null,
        toDate: null,
        filterFromDate: null,
        filterToDate: null,
        selectedDateItem: { key: "Top 30 Records", text: "Top 30 Records" },
        selectedHazardItem: null,
        isOpenArchiveModal: false,
        filterHazardValue: '',
        isLocalFilter: false,
        filteredHazardData: [],
        isHazardQrModelOpen: false,
        HazardQRCodeImage: '',
        isHazardSiteUpdate: false,
        isAttachmentModalOpen: false,
        selectedStateId: []
    });



    const onStateChange = (option: any): void => {
        setState((prevState) => ({ ...prevState, selectedStateId: option, isLocalFilter: true }))
        // _ToolboxTalkData();
    };

    const handleOpenHazardQRModal = () => {
        setState((s) => ({ ...s, isHazardQrModelOpen: true }));
    };

    const oncloseHazardModal = () => {
        setState((s) => ({ ...s, isHazardQrModelOpen: false }));
    }

    const onChangeRangeOption = (item: IDropdownOption): void => {
        setState(prev => ({
            ...prev,
            selectedDateItem: item,
            isRefreshOptions: true
        }));
    };

    const onChangeToDate = (filterDate: any, date?: Date) => {
        setState(prev => ({
            ...prev,
            toDate: date || null,
            filterToDate: filterDate,
            isRefreshOptions: true,
            isRefresh: true
        }));
    };

    const onChangeFromDate = (filterDate: any, date?: Date) => {
        setState(prev => ({
            ...prev,
            fromDate: date || null,
            filterFromDate: filterDate,
            isRefreshOptions: true,
            isRefresh: true
        }));
    };

    const onClickUnArchive = (itemID: any) => {
        setState(prev => ({
            ...prev,
            selectedHazardItem: itemID,
            isOpenArchiveModal: true
        }));
    };

    const onClickSiteUpdate = (itemID: any) => {
        setState(prev => ({
            ...prev,
            selectedHazardItem: itemID,
            isHazardSiteUpdate: true
        }));
    };
    const onClickAttachment = (itemID: any) => {
        setState(prev => ({
            ...prev,
            selectedHazardItem: itemID,
            isAttachmentModalOpen: true
        }));
    };
    const onClickView = (itemID: any) => {
        let breadCrumItems: IBreadCrum[] = props.breadCrumItems;
        breadCrumItems.push({ text: itemID.Title, key: itemID.Title, currentCompomnetName: ComponentNameEnum.ViewHazardFormDetail, onClick: onBreadcrumbItemClicked, manageComponent: props.manageComponentView, manageCompomentItem: { currentComponentName: ComponentNameEnum.ViewHazardFormDetail, siteMasterId: itemID.ID, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps?.siteName, qCState: props.componentProps?.qCState, view: currentView } });
        props.manageComponentView({
            currentComponentName: ComponentNameEnum.ViewHazardFormDetail, dataObj: props.componentProps?.dataObj, siteMasterId: itemID.ID, originalSiteMasterId: props.siteMasterId, isShowDetailOnly: true, breadCrumItems: breadCrumItems, siteName: props.componentProps?.siteName, qCState: props.componentProps?.qCState
        });
    }

    const HazardListColumn = (): IColumn[] => {
        let columns: any[] = [
            {
                key: "Action", name: 'Action', fieldName: 'Action', isResizable: true, minWidth: 100, maxWidth: 120,
                onRender: ((itemID: any) => {
                    return <>
                        <div className='dflex'>
                            <Link className="actionBtn btnView dticon" onClick={() => {
                                onClickView(itemID)
                            }}>
                                <TooltipHost content={"View Detail"} id={tooltipId}>
                                    <FontAwesomeIcon icon="eye" />
                                </TooltipHost>
                            </Link>

                            {(itemID?.IsArchive == true) && <Link
                                className="actionBtn btnEdit iconSize dticon "

                                onClick={() => onClickUnArchive(itemID)}
                            >
                                <TooltipHost content={"Unarchive Record"} id={`tooltip_${itemID.ID}`}>
                                    <FontAwesomeIcon icon="arrow-rotate-right" />
                                </TooltipHost>
                            </Link>}
                            <Link
                                className="actionBtn btnMove iconSize dticon "

                                onClick={() => onClickSiteUpdate(itemID)}
                            >
                                <TooltipHost content={"Move this hazard to another site"} id={`tooltip_${itemID.ID}`}>
                                    <FontAwesomeIcon icon="arrow-right-arrow-left" />
                                </TooltipHost>
                            </Link>
                            <Link
                                className="actionBtn btnMoving iconSize dticon "

                                onClick={() => onClickAttachment(itemID)}
                            >
                                <TooltipHost content={"View Attachments"} id={`tooltip_${itemID.ID}`}>
                                    <FontAwesomeIcon icon="paperclip" />
                                </TooltipHost>
                            </Link>
                        </div>
                    </>;
                })
            },
            {
                key: 'SiteName', name: HazardViewFields.SiteName, fieldName: 'SiteName', isResizable: true, minWidth: 120, maxWidth: 200, isSortingRequired: true,
                onRender: (item: any) => (
                    <Link className="tooltipcls" onClick={() => onClickView(item)}>
                        {item.SiteName}
                    </Link>
                )
            },
            { key: 'ID', name: HazardViewFields.FormID, fieldName: 'HazardFormId', isResizable: true, minWidth: 100, maxWidth: 140, isSortingRequired: true },
            { key: 'Hazard', name: HazardViewFields.HazardType, fieldName: 'HazardType', isResizable: true, minWidth: 120, maxWidth: 180, isSortingRequired: true },
            { key: 'HazardSubType', name: HazardViewFields.HazardSubType, fieldName: 'HazardSubType', isResizable: true, minWidth: 140, maxWidth: 180, isSortingRequired: true },
            { key: 'SubmittedBy', name: HazardViewFields.SubmittedBy, fieldName: 'SubmittedBy', isResizable: true, minWidth: 140, maxWidth: 180, isSortingRequired: true },
            {
                key: 'SubmittedDate', name: HazardViewFields.SubmissionDate, fieldName: 'SubmissionDate', isResizable: true, minWidth: 140, maxWidth: 180, isSortingRequired: true, onRender: (item: any) => {
                    return (
                        <div className="badge rounded-pill text-bg-info date-badge">{item?.SubmissionDate}</div>
                    );
                },
            },
            {
                key: 'Description', name: HazardViewFields.Description, fieldName: 'Description', isResizable: true, minWidth: 240, maxWidth: 280, isSortingRequired: true, onRender: (item: any) => {
                    return (
                        <div className="">
                            {(() => {
                                const desc =
                                    item?.ResponseJSON?.response?.commonQuestions?.answers?.find(
                                        (a: any) => a.label === "Hazard Description"
                                    )?.value || '—';

                                const shortDesc =
                                    desc.length > 100 ? `${desc.substring(0, 100)}...` : desc;

                                return desc.length > 100 ? (
                                    <TooltipHost content={desc} id={tooltipId}>
                                        <span style={{ cursor: 'pointer' }}>
                                            {shortDesc}
                                        </span>
                                    </TooltipHost>
                                ) : (
                                    <span>{shortDesc || '—'}</span>
                                );
                            })()}
                        </div>
                    );


                },
            },
        ];
        if (selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId?.length == 1) {
            columns = columns.filter(item => item.key != "SiteName")
        }

        return columns;
    };

    const mappingHazardData = (listItems: any[], siteItems: any[]) => {
        if (!Array.isArray(listItems) || listItems.length === 0) return [];

        try {
            return listItems.map((item: any) => {
                let responseObj: any = {};
                try {
                    responseObj = item?.Response ? JSON.parse(item.Response) : {};
                } catch {
                    responseObj = {};
                }

                const submittedBy = responseObj?.submittedBy || {};
                const stateId = siteItems.find((i) => Number(i.ID) == Number(item?.SiteName?.[0]?.lookupId))?.QCStateId || ""
                return {
                    Id: Number(item.ID),
                    ID: Number(item.ID),
                    HazardType: item.HazardType || "",
                    HazardSubType: item.HazardSubType || "",
                    SiteName: item?.SiteName?.[0]?.lookupValue,
                    SiteNameId: item?.SiteName?.[0]?.lookupId,
                    SubmittedBy: submittedBy?.name || "",
                    SubmittedById: submittedBy?.email || "",
                    HazardFormId: item?.HazardFormId,
                    SubmissionDate: item?.SubmissionDate ? formatSPDateToLocal(item['SubmissionDate.'], false) : "",
                    ResponseJSON: responseObj,
                    IsArchive: item.IsArchive === "Yes" ? true : false,
                    stateId: stateId
                };
            });
        } catch (error) {
            console.error("Error in mapping data:", error);
            return [];
        }
    };

    const buildUniqueOptions = (items: any[], key: string, label: string, value?: any) => {
        if (value) {
            const map = new Map();
            items.forEach(item => {
                const name = item[key];
                const id = item[value];

                if (name && id && !map.has(id)) {
                    map.set(id, {
                        key: id,
                        value: id,
                        // text: key,
                        label: name
                    });
                }
            });

            const options = Array.from(map.values());
            return options;
        }

        const uniqueValues = Array.from(new Set(items.map(x => x[key]).filter(Boolean)));
        const options = uniqueValues.map(val => ({
            key: val,
            value: val,
            // text: val,
            label: val
        }));
        return options;
    };

    const calculateHazardCounts = (listItems: any[]) => {

        const finalArray = fileHazardData.current?.map((fc: any) => {
            const hazardType = fc.name;
            const color = fc.color || "";
            const patterncolor = `${fc.color}60` || "";
            const bgcolor = `${fc.color}40` || "";
            const iconUrl = getHazardIconUrl(fc.iconUrl, context) || "";

            const listCount = listItems.filter(item => item.HazardType === hazardType).length;

            return {
                hazardType,
                color,
                iconUrl,
                listCount,
                bgcolor,
                patterncolor,
                order: fc.order || 0
            };
        }).sort((a, b) => a.order - b.order);
        hazardCountCard.current = finalArray;
    };

    const getHazardData = async (siteItems: any[]) => {

        try {
            let filterFields: ICamlQueryFilter[] = [
                {
                    fieldName: HazardFields.Status,
                    fieldValue: "Submitted",
                    fieldType: FieldType.Text,
                    LogicalType: LogicalType.EqualTo
                },
                {
                    fieldName: HazardFields.IsDeleted,
                    fieldValue: true,
                    fieldType: FieldType.Boolean,
                    LogicalType: LogicalType.NotEqualTo
                }
            ];
            if (selectedZoneDetails?.defaultSelectedSitesId && selectedZoneDetails?.defaultSelectedSitesId?.length > 0) {
                filterFields.push({
                    fieldName: "SiteName",
                    fieldValue: selectedZoneDetails?.defaultSelectedSitesId,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.In
                });
            } else if (selectedZoneDetails && selectedZoneDetails?.selectedSitesId?.length > 0) {
                filterFields.push({
                    fieldName: "SiteName",
                    fieldValue: selectedZoneDetails?.selectedSitesId,
                    fieldType: FieldType.LookupById,
                    LogicalType: LogicalType.In
                });
            } else if (selectedSites?.ids.length > 0) {
                filterFields.push(
                    {
                        fieldName: HazardFields.SiteName,
                        fieldValue: selectedSites.ids,
                        fieldType: FieldType.LookupById,
                        LogicalType: LogicalType.EqualTo
                    }
                );
            }
            if (state.selectedSubmittedBy) {
                filterFields.push(
                    {
                        fieldName: HazardFields.SubmittedBy,
                        fieldValue: state.selectedSubmittedBy,
                        fieldType: FieldType.Text,
                        LogicalType: LogicalType.EqualTo
                    }
                )
            }

            if (state.selectedArchive) {
                const val = state.selectedArchive === "Yes" ? true : false;
                filterFields.push(
                    {
                        fieldName: HazardFields.IsArchive,
                        fieldValue: val,
                        fieldType: FieldType.Boolean,
                        LogicalType: LogicalType.EqualTo
                    }
                )
            }

            if (state.selectedSubHazardType?.length > 0) {
                filterFields.push(
                    {
                        fieldName: HazardFields.HazardSubType,
                        fieldValue: state.selectedSubHazardType,
                        fieldType: FieldType.Text,
                        LogicalType: LogicalType.In
                    }
                )
            }

            let isTopRecordOnly = state.selectedDateItem?.key == "Top 30 Records" ? true : false;
            if (state.selectedDateItem?.key !== 'All Dates' && !!state.selectedDateItem) {
                if (state.filterFromDate && state.filterToDate) {
                    filterFields.push({
                        fieldName: HazardFields.SubmissionDate,
                        fieldValue: `${state.filterFromDate}`,
                        fieldType: FieldType.DateTime,
                        LogicalType: LogicalType.GreaterThanOrEqualTo
                    });
                    filterFields.push({
                        fieldName: HazardFields.SubmissionDate,
                        fieldValue: `${state.filterToDate}`,
                        fieldType: FieldType.DateTime,
                        LogicalType: LogicalType.LessThanOrEqualTo
                    })
                }
                else {
                    const endDate = moment().format('YYYY-MM-DD');
                    const startDate = moment().subtract(6, 'days').format('YYYY-MM-DD');
                    const dateField = HazardFields.SubmissionDate;
                    if (state.selectedDateItem?.key != "Top 30 Records") {
                        filterFields.push({
                            fieldName: `${dateField}`,
                            fieldValue: `${startDate}`,
                            fieldType: FieldType.DateTime,
                            LogicalType: LogicalType.GreaterThanOrEqualTo
                        });
                        filterFields.push({
                            fieldName: `${dateField}`,
                            fieldValue: `${endDate}`,
                            fieldType: FieldType.DateTime,
                            LogicalType: LogicalType.LessThanOrEqualTo
                        })
                    }
                }
            }

            const camlQuery = new CamlBuilder()
                .View([
                    HazardFields.Id,
                    HazardFields.SiteName,
                    HazardFields.HazardType,
                    HazardFields.HazardSubType,
                    HazardFields.Response,
                    HazardFields.IsArchive,
                    HazardFields.SubmittedBy,
                    // HazardFields.SubmittedByName,
                    HazardFields.HazardFormId,
                    HazardFields.SubmissionDate,
                    HazardFields.StateName
                ])
                .Scope(CamlBuilder.ViewScope.RecursiveAll)
                .LeftJoin("SiteName", "SiteName").
                Select('StateNameValue', "StateName")
                // .LeftJoin(HazardFields.SubmittedBy, HazardFields.SubmittedBy)
                // .Select(HazardFields.Title, HazardFields.SubmittedByName)
                // .RowLimit(5000, true)
                .RowLimit(isTopRecordOnly ? 30 : 5000, isTopRecordOnly ? false : true)
                .Query();

            const categoriesExpressions = getCAMLQueryFilterExpression(filterFields);
            if (categoriesExpressions.length > 0) {
                camlQuery.Where().All(categoriesExpressions);
            }
            camlQuery.OrderByDesc('Modified');
            const localResponse = await provider.getItemsByCAMLQuery(ListNames.HazardFormResponses, camlQuery.ToString(),
                {
                    SortField: "Modified",
                    SortDir: "Desc",
                }
                , "");

            let listItems = mappingHazardData(localResponse, siteItems);
            setState((s) => ({ ...s, PDFData: listItems }));
            const { isAdmin, isSiteManager, isStateManager, isSiteSupervisor, isUser, isWHSChairperson, whsChairpersonsStateId } = currentUserRoleDetail
            if (isAdmin || isSiteManager || isStateManager || isSiteSupervisor || isUser) {

            } else if (isWHSChairperson && whsChairpersonsStateId.length > 0) {
                listItems = listItems.filter((i) => !!i.stateId && whsChairpersonsStateId.includes(i.stateId))
            }
            calculateHazardCounts(listItems);
            const siteIdToQCStateMap = new Map<string, string>(
                siteData?.current?.map((item: { ID: any; QCStateId: any; }) => [item.ID, item.QCStateId])
            );
            const groupedByQCState: any = listItems.reduce((acc: any, item: any) => {
                const qcStateId = siteIdToQCStateMap.get(item.SiteNameId);
                if (qcStateId) {
                    acc[qcStateId] = (acc[qcStateId] || 0) + 1;
                }
                return acc;
            }, {} as any);
            const groupedCountArray = Object.entries(groupedByQCState).map(([qcStateId, count]) => ({
                Id: qcStateId,
                Count: count,
            }));

            if (state.isRefreshOptions && listItems.length > 0) {
                setState((prev) => ({
                    ...prev,
                    HazardData: listItems,
                    isRefresh: false,
                    isRefreshOptions: false,
                    SubmittedByOptions: buildUniqueOptions(listItems, "SubmittedBy", "--Submitted By--", "SubmittedById"),
                    HazardTypeOptions: buildUniqueOptions(listItems, "HazardType", "--Hazard Type--"),
                    SubHazardTypeOptions: buildUniqueOptions(listItems, "HazardSubType", "--Sub Hazard Type--"),
                    isLocalFilter: true,
                    stateCountData: groupedCountArray
                    // HazardQRCodeImage: qrCodeURL
                }));
            } else {
                setState((prev) => ({
                    ...prev,
                    HazardData: listItems,
                    stateCountData: groupedCountArray,
                    isRefresh: false,
                    isLocalFilter: true,
                    // HazardQRCodeImage: qrCodeURL
                }));
            }
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch hazard Report Form Data:", error);
            setIsLoading(false);
            return [];
        }
    };

    const _siteData2 = async (provider: any): Promise<any[]> => {
        try {
            let camlQuery;
            camlQuery = new CamlBuilder().View(["ID", "QCState"]).Scope(CamlBuilder.ViewScope.RecursiveAll).RowLimit(5000, true).Query()
            const results = await provider.getItemsByCAMLQuery(ListNames.SitesMaster, camlQuery.ToString())
            if (results) {
                const siteData = results.map((data: any) => ({
                    ID: parseInt(data.ID),
                    QCStateId: data.QCState ? data.QCState[0].lookupId : '',
                    QCState: data.QCState ? data.QCState[0].lookupValue : '',
                }));

                return siteData;
            }
            return [];
        } catch (error) {
            console.error("Error fetching site master :", error);
            const errorObj = {
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                CustomErrormessage: "Error is occurring while fetching site master ",
                PageName: "Quayclean.aspx",
                ErrorMethodName: "_siteData2"
            };
            await logGenerator(provider, errorObj);
            return [];
        }
    };

    const getHazardFileContent = async () => {
        const fileName = `${context.pageContext.web.serverRelativeUrl}/HazardReportForm/HazardReportForm.json`;
        const fileContent = await provider.readFileContent(fileName, 'json');
        fileHazardData.current = fileContent?.hazardSection?.hazards || [];
    }

    const getHazardFormDataById = async () => {
        try {
            const select = [
                HazardFields.ID,
                HazardFields.HazardType,
                HazardFields.HazardSubType,
                HazardFields.SiteName,
                "SiteName/Title",
                "SiteName/Id",
                "SiteName/StateNameValue",
                HazardFields.SubmittedBy,
                HazardFields.Response,
                HazardFields.Created,
                HazardFields.SubmissionDate,
                HazardFields.HazardFormId,
                "Attachments",
                "AttachmentFiles"
            ];

            const expand = ["AttachmentFiles", HazardFields.SiteName];

            const queryOptions: IPnPQueryOptions = {
                select,
                expand,
                listName: ListNames.HazardFormResponses
                // id: itemId (use if fetching single item)
            };

            const data: any[] = await provider.getItemsByQuery(queryOptions);

            if (!data || data.length === 0) {
                return null;
            }

            // ✅ Take first record for form-level data
            const firstItem = data[0];

            // ✅ Build attachments with ID + HazardFormId
            const attachments =
                data
                    .flatMap((item: any) => {
                        const files = item?.AttachmentFiles || [];

                        return files.map((file: any) => {
                            const fileName = file?.FileName;

                            // ❌ Skip generated PDF
                            if (fileName === `${item?.HazardFormId}.pdf`) return null;

                            const fileUrl = file?.ServerRelativeUrl;
                            const fileType = getFileType(fileName);

                            return {
                                id: item?.ID,
                                HazardFormId: item?.HazardFormId,
                                fileName,
                                fileUrl,
                                fileType,
                                isImage: fileType === "image"
                            };
                        });
                    })
                    .filter(Boolean);

            // ✅ Final structured form data
            const formData = {
                Attachment: attachments
            };
            setState((s) => ({ ...s, AttchmentsData: formData.Attachment }));
            return formData;

        } catch (error: any) {
            console.error("Error fetching hazard form data:", error);
            setIsLoading(false);
            return null;
        }
    };


    React.useEffect(() => {
        const loadAttachments = async () => {
            let attachments = await getHazardFormDataById();
        }

        const loadData = async () => {
            let qrCodeURL = "";
            const sitesData = await _siteData2(provider)
            try {
                const [qrCode, copylink] = await Promise.all([
                    getHazardQRCodeURL(context, (selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails.defaultSelectedSitesId && selectedZoneDetails.defaultSelectedSitesId[0] : "")),
                    getHazardLinkURL(context, (selectedZoneDetails?.isSinglesiteSelected ? selectedZoneDetails.defaultSelectedSitesId && selectedZoneDetails.defaultSelectedSitesId[0] : "")),
                    getHazardFileContent()
                ]);

                qrCodeURL = qrCode;
                qrLinkURL.current = copylink;

            } catch (err) {
                console.error("Error generating Hazard QR code & URL:", err);
                // qrCodeURL = notFoundImageQR;
            }
            siteData.current = sitesData;

            setState((prev) => ({
                ...prev,
                HazardQRCodeImage: qrCodeURL
            }));
            await getHazardData(sitesData);
        };
        loadAttachments()
        loadData()
    }, []);

    React.useEffect(() => {
        setIsLoading(true);
        getHazardData(siteData.current);
        setState(prev => ({ ...prev, isRefresh: false }));
    }, [state.isRefresh, selectedZoneDetails]);

    const handleSiteChange = (siteIds: any[], siteTitles: string[], siteSC: string[]): void => {
        setSelectedSites({
            ids: siteIds,
            titles: siteTitles,
            scSites: siteSC,
        });
        setState((prev) => ({
            ...prev,
            isRefresh: true,
            selectedStateId: ""
        }));
    };

    const onclickRefreshGrid = () => {
        setState((prev) => ({
            ...prev,
            isRefresh: true,
            selectedStateId: ""
        }));
    };

    const handleDropdownChange = (field: keyof IHazardData, selected: any, isMulti: boolean = false, isRefreshOp?: any) => {
        const newValue = isMulti
            ? (selected ? selected.map((x: any) => x.value) : [])
            : (selected ? selected.value : null);

        setState(prev => ({
            ...prev,
            [field]: newValue,
            isRefresh: true,
            selectedStateId: "",
            isRefreshOptions: isRefreshOp ? true : false
        }));
    };

    const onclickExportToExcel = async () => {
        try {
            const siteName = props?.componentProps?.siteName;
            const fileName = generateExcelFileName(siteName ? `${siteName}-HazardReport` : 'HazardReport')
            let exportColumns: any[] = [
                { header: HazardViewFields.SiteName, key: "SiteName" },
                { header: "State Name", key: "StateName" },
                { header: HazardViewFields.FormID, key: "HazardFormId" },
                { header: HazardViewFields.HazardType, key: "HazardType" },
                { header: HazardViewFields.HazardSubType, key: "HazardSubType" },
                { header: HazardViewFields.SubmittedBy, key: "SubmittedBy" },
                { header: HazardViewFields.SubmissionDate, key: "SubmissionDate" }
            ];

            generateExcelTable(state.filteredHazardData, exportColumns, fileName);
        } catch (error) {
            const errorObj = {
                ErrorMethodName: "onclickExportToExcel",
                CustomErrormessage: "error in download",
                ErrorMessage: error.toString(),
                ErrorStackTrace: "",
                PageName: "QuayClean.aspx"
            };
            void logGenerator(provider, errorObj);
        }
    };

    const onclickExportToPDF = async () => {
        setIsLoading(true);
        setisPdfMode(true);
        // let fileName: string = generatePdfFileName(`${hazardFormDetail?.SiteName?.replace(/\s+/g, '')}_HZ`);
        let fileblob: any = await generateAndSaveKendoHazardPDF("HazardReportPDF", 'Hazard Report', false, true, true);
        setisPdfMode(false);
        setIsLoading(false);
    }
    const _onItemSelected = (item: any): void => {
    };

    const onClickArchiveRecordYes = async () => {
        setIsLoading(true);
        const toastId = toastService.loading('Unarchiving...');
        const objUpdate = {
            IsArchive: false
        }
        try {
            await provider.updateItemWithPnP(objUpdate, ListNames.HazardFormResponses, state.selectedHazardItem?.ID);
            let data = await getState(state.selectedHazardItem?.SiteNameId, provider);
            const logObj = {
                UserName: currentUserRoleDetail?.title,
                SiteNameId: state.selectedHazardItem?.SiteNameId,
                ActionType: UserActivityActionTypeEnum.Unarchive,
                EntityType: UserActionEntityTypeEnum.HazardReport,
                EntityId: state.selectedHazardItem?.Id,
                EntityName: state.selectedHazardItem?.HazardFormId,
                Details: `Unarchive Hazard Report`,
                LogFor: UserActionLogFor.Both,
                StateId: data[0]?.QCStateId,
                Email: currentUserRoleDetail?.emailId,
                Count: 1
            };
            void UserActivityLog(provider, logObj, currentUserRoleDetail);
            setState(prev => ({
                ...prev,
                isRefresh: true,
                selectedStateId: "",
                isRefreshOptions: true,
                selectedHazardItem: null,
                isOpenArchiveModal: false
            }));
            setIsLoading(false);
            toastService.updateLoadingWithSuccess(toastId, Messages.RecordUnarchiveSuccess);
        } catch (error) {
            console.log('Error in unarchive data', error);
        }
    }

    const closeArchiveModal = () => {
        setState(prev => ({
            ...prev,
            selectedHazardItem: null,
            isOpenArchiveModal: false
        }));
    }

    React.useEffect(() => {
        if (state.isLocalFilter) {
            let filteredList = state.HazardData;
            if (state.filterHazardValue) {
                filteredList = state.HazardData.filter((item: any) =>
                    item.HazardType == state.filterHazardValue
                );
            }
            if (!!state.selectedStateId && state.selectedStateId > 0) {
                filteredList = filteredList.filter((i) => i.stateId == state.selectedStateId)
            }
            setState(prev => ({
                ...prev,
                filteredHazardData: filteredList,
                isLocalFilter: false
            }));
        }
    }, [state.isLocalFilter, state.selectedStateId]);

    const handleCardClick = (title: string | null) => {
        if (title) {
            setState(prev => ({
                ...prev,
                filterHazardValue: title,
                isLocalFilter: true
            }));
        } else {
            setState(prev => ({
                ...prev,
                filterHazardValue: '',
                isLocalFilter: true
            }));
        }
    };

    const onCloseSiteModal = (isRefresh: boolean) => {
        setState(prevState => ({
            ...prevState,
            isHazardSiteUpdate: false,
            selectedHazardItem: null,
            isRefresh: !!isRefresh
        }));
    }

    const handleViewChange = (view: string) => {
        setCurrentView(view);
    };

    const onClickCopyLink = async () => {
        setIsLoading(true);
        navigator.clipboard.writeText(qrLinkURL.current);
        const toastId = toastService.loading('Coping...');
        let toastMessage = Messages.CopyLink;
        toastService.updateLoadingWithSuccess(toastId, toastMessage);
        setIsLoading(false);
    }

    React.useEffect(() => {
        if (!!state.stateCountData) {

            const { isAdmin, isSiteManager, isStateManager, isSiteSupervisor, isUser, isWHSChairperson } = currentUserRoleDetail
            const countLookup = Object.fromEntries(state.stateCountData.map((item: any) => [Number(item.Id), item.Count]));
            let stateItems: any[] = currentUserRoleDetail.stateMasterItems;
            if (isAdmin || isSiteManager || isStateManager || isSiteSupervisor || isUser) {
                stateItems = currentUserRoleDetail.stateMasterItems;
            } else if (isWHSChairperson) {
                stateItems = currentUserRoleDetail.stateMasterItems.filter(r => currentUserRoleDetail.whsChairpersonsStateId.includes(r.ID))
            }
            const stateData = stateItems.map((title: any) => ({
                Id: title.Id,
                Count: countLookup[title.Id] || 0,
                Title: title.Title
            }));
            setState((prevState: any) => ({ ...prevState, stateTabData: stateData }))
        }
        // setStateTabData(stateData);
    }, [state.stateCountData])

    return {
        provider,
        context,
        currentUserRoleDetail,
        isLoading,
        selectedSites,
        currentView,
        state,
        tooltipId,
        hazardCountCard,
        isPdfMode,
        columns,
        onChangeRangeOption,
        onChangeToDate,
        onChangeFromDate,
        handleSiteChange,
        HazardListColumn,
        onclickRefreshGrid,
        onclickExportToExcel,
        onclickExportToPDF,
        _onItemSelected,
        handleDropdownChange,
        closeArchiveModal,
        onClickArchiveRecordYes,
        handleCardClick,
        handleOpenHazardQRModal,
        oncloseHazardModal,
        onCloseSiteModal,
        handleViewChange,
        onClickSiteUpdate,
        onClickUnArchive,
        onClickView,
        setState,
        onClickAttachment,
        onClickCopyLink,
        onStateChange,
        isSiteLevelComponent,
        selectedZoneDetails
    }

}